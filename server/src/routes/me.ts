import {
  CITY_BY_ID,
  GENRES,
  INSTRUMENTS,
  PROFESSION_BY_ID,
  SKILL_BY_ID,
  VIP,
  learnBlocker,
  unmetRequirement,
  ITEM_BY_ID,
  LOCATION_BY_ID,
  NAME_RE,
  containsProfanity,
  maskProfanity,
  SELL_BACK_RATE,
  START_HEALTH,
  START_MONEY,
  START_MOOD,
  isShop,
  isEquippable,
  startingSkills,
  indulgenceForSpend,
} from '@rifftown/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { storedMoodlets } from '../game/wellbeing';
import { charId, requireUser, requireVip } from '../auth';
import { many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { activeAction, getCharacter, isJailed, lockCharacter, membership, notify, officesOf, requireEstablished, toActionDto, toCharacterDto } from '../game/common';
import { achievementPoints, evaluateThrottled } from '../game/achievements';
import { bailQuote, inCustody } from '../game/crime';
import { homeOf } from '../game/homes';
import { businessOf } from '../game/business';
import { inventoryOf, toInventoryDto, ringPledged } from '../game/items';
import { hotelOf } from '../game/lifestyle';
import { unreadMessages } from '../game/social';
import { idParam, parse } from './util';
import { indulge, lastDeath } from '../game/consequences';

/** Kontrol karakterlerini atar; tek satırlık alanlarda satır sonlarını da */
const clean = (v: string | undefined, singleLine = false) => {
  if (v === undefined) return null;
  const x = v
    .replace(singleLine ? /[\u0000-\u001f\u007f]/g : /[\u0000-\u0009\u000b-\u001f\u007f]/g, '')
    // Görünmez ve yön değiştiren karakterler (ad taklidi için kullanılabilir)
    .replace(/[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, '');
  return maskProfanity(singleLine ? x.trim() : x.replace(/\n{3,}/g, '\n\n').trim());
};

const AVATAR_COLORS = ['#E4572E', '#F3A712', '#29335C', '#669BBC', '#A8C686', '#8E5572', '#2E294E', '#1B998B', '#C5283D', '#FF9F1C'];

export async function meRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireUser);

  app.get('/me', async (req) => {
    const u = req.user!;
    const base = {
      user: {
        id: u.id,
        email: u.email,
        lang: u.lang,
        isAdmin: u.isAdmin,
        isVip: u.isVip,
        vipUntil: u.vipUntil ? new Date(u.vipUntil).toISOString() : null,
      },
    };
    if (!u.characterId) {
      // Karakteri öldüyse (yalnızca PERMADEATH açıkken) yeni karakter ekranında anılır
      return {
        ...base, character: null, action: null, band: null, unreadNotifications: 0, pendingInvites: 0, bailCost: null, unreadMessages: 0,
        death: await lastDeath(pool, u.id),
      };
    }
    await evaluateThrottled(pool, u.characterId);
    const ch = await getCharacter(pool, u.characterId);
    const action = await activeAction(pool, ch.id);
    const m = await membership(pool, ch.id);
    const unread = await one(pool, 'SELECT count(*)::int AS n FROM notifications WHERE character_id = $1 AND NOT read', [ch.id]);
    const invites = await one(
      pool,
      `SELECT count(*)::int AS n FROM band_invites WHERE character_id = $1 AND status = 'pending'`,
      [ch.id],
    );
    return {
      ...base,
      character: toCharacterDto(ch, await officesOf(pool, ch.id), {
        inCustody: await inCustody(pool, ch.id),
        achievementPoints: await achievementPoints(pool, ch.id),
        home: await homeOf(pool, ch.id),
        hotel: await hotelOf(pool, ch.id),
        business: await businessOf(pool, ch.id),
        moodlets: await storedMoodlets(pool, ch.id),
      }),
      action: action ? toActionDto(action) : null,
      band: m ? { id: m.band_id, name: m.name, genre: m.genre, role: m.role, isLeader: m.leader_id === ch.id } : null,
      unreadNotifications: unread!.n,
      pendingInvites: invites!.n,
      bailCost: await bailQuote(ch),
      unreadMessages: await unreadMessages(pool, ch.id),
      pendingTrades: (await one(pool, `SELECT count(*)::int AS n FROM trades WHERE to_id = $1 AND status = 'open'`, [ch.id]))!.n,
    };
  });

  app.patch('/me', async (req) => {
    const body = parse(z.object({ lang: z.enum(['tr', 'en']) }), req.body);
    await pool.query('UPDATE users SET lang = $2 WHERE id = $1', [req.user!.id, body.lang]);
    return { ok: true };
  });

  app.post('/me/push-token', async (req) => {
    const body = parse(z.object({ token: z.string().max(300).nullable() }), req.body);
    await pool.query('UPDATE users SET push_token = $2 WHERE id = $1', [req.user!.id, body.token]);
    return { ok: true };
  });

  app.post('/character', async (req) => {
    if (req.user!.characterId) fail('character_exists', 409);
    const body = parse(
      z.object({
        name: z.string().trim().regex(NAME_RE).refine((n) => !containsProfanity(n), 'inappropriate'),
        cityId: z.string().refine((id) => !!CITY_BY_ID[id]),
        mainInstrument: z.enum(INSTRUMENTS),
        favoriteGenre: z.enum(GENRES).default('rock'),
        avatarColor: z.string().refine((c) => AVATAR_COLORS.includes(c)).optional(),
      }),
      req.body,
    );
    if (await one(pool, 'SELECT 1 FROM characters WHERE lower(name) = lower($1)', [body.name])) fail('name_taken', 409);
    const color = body.avatarColor ?? AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    return tx(async (c) => {
      // Ölen karakterin mirası bir kez, yeni karaktere geçer (para yalnızca taşınır, basılmaz). Aynı işlemde: kayıt
      // başarısız olursa miras kaybolmaz.
      const heirs = await many(c, 'SELECT id, inherited FROM characters WHERE former_user_id = $1 AND inherited > 0 FOR UPDATE', [req.user!.id]);
      const inheritance = heirs.reduce((s, h) => s + Number(h.inherited), 0);
      if (heirs.length) await c.query('UPDATE characters SET inherited = 0 WHERE id = ANY($1::bigint[])', [heirs.map((h) => h.id)]);
      const ch = await one(
        c,
        `INSERT INTO characters(user_id, name, avatar_color, main_instrument, money, mood, health, city_id, skills)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [req.user!.id, body.name, color, body.mainInstrument, START_MONEY + inheritance, START_MOOD, START_HEALTH, body.cityId,
          JSON.stringify(startingSkills(body.mainInstrument, body.favoriteGenre))],
      );
      await c.query(`INSERT INTO notifications(character_id, kind, data) VALUES ($1, 'welcome', '{}')`, [ch.id]);
      return { character: toCharacterDto(ch) };
    });
  });

  app.get('/character/avatar-colors', async () => ({ colors: AVATAR_COLORS }));

  app.patch('/character', async (req) => {
    const id = charId(req);
    const body = parse(
      z.object({
        bio: z.string().max(1000).optional(),
        headline: z.string().max(80).optional(),
        avatarColor: z.string().refine((c) => AVATAR_COLORS.includes(c)).optional(),
      }),
      req.body,
    );
    const ch = await one(
      pool,
      `UPDATE characters SET bio = COALESCE($2, bio), avatar_color = COALESCE($3, avatar_color), headline = COALESCE($4, headline)
        WHERE id = $1 RETURNING *`,
      [id, clean(body.bio), body.avatarColor ?? null, clean(body.headline, true)],
    );
    return { character: toCharacterDto(ch) };
  });

  /** Şehir içinde bir mekâna gitmek (anında). */
  app.post('/move', async (req) => {
    const id = charId(req);
    const body = parse(z.object({ locationId: z.string().nullable() }), req.body);
    return tx(async (c) => {
      const ch = await lockCharacter(c, id);
      if (isJailed(ch)) fail('in_jail', 409);
      if (await activeAction(c, id)) fail('busy', 409);
      if (!ch.city_id) fail('traveling', 409);
      if (body.locationId) {
        const loc = LOCATION_BY_ID[body.locationId];
        if (!loc || loc.cityId !== ch.city_id) fail('not_in_city');
      }
      await c.query('UPDATE characters SET location_id = $2 WHERE id = $1', [id, body.locationId]);
      return { ok: true, locationId: body.locationId };
    });
  });

  // ---------- Kitapçı: beceri kitapları ----------

  /** Kitapçıdan beceri kitabı alıp okumak: beceri anında açılır, sonra çalışarak geliştirilir. */
  app.post('/skills/learn', async (req) => {
    const id = charId(req);
    const body = parse(z.object({ skillId: z.string(), locationId: z.string() }), req.body);
    return tx(async (c) => {
      const ch = await lockCharacter(c, id);
      if (isJailed(ch)) fail('in_jail', 409);
      if (await activeAction(c, id)) fail('busy', 409);
      const loc = LOCATION_BY_ID[body.locationId];
      if (!loc || loc.type !== 'bookstore') fail('invalid_location');
      if (loc!.cityId !== ch.city_id) fail('not_in_city');
      const def = SKILL_BY_ID[body.skillId];
      if (!def) fail('invalid_skill');
      if (def!.learn !== 'book' || !def!.bookPrice) fail(def!.learn === 'university' ? 'learn_at_university' : def!.learn === 'gym' ? 'learn_at_gym' : 'learn_at_school');
      const block = learnBlocker(ch.skills, body.skillId, req.user!.isVip);
      if (block) fail(block);
      if (ch.money < def!.bookPrice!) fail('not_enough_money');
      const skills = { ...ch.skills, [body.skillId]: 0 };
      const r = await one(
        c,
        'UPDATE characters SET money = money - $2, skills = $3, location_id = $4 WHERE id = $1 RETURNING *',
        [id, def!.bookPrice, JSON.stringify(skills), loc!.id],
      );
      return { character: toCharacterDto(r) };
    });
  });

  // ---------- Meslekler ----------

  app.post('/career/join', async (req) => {
    const id = charId(req);
    const body = parse(z.object({ professionId: z.string(), locationId: z.string() }), req.body);
    return tx(async (c) => {
      const ch = await lockCharacter(c, id);
      if (isJailed(ch)) fail('in_jail', 409);
      if (await activeAction(c, id)) fail('busy', 409);
      const prof = PROFESSION_BY_ID[body.professionId];
      if (!prof) fail('invalid_profession');
      const loc = LOCATION_BY_ID[body.locationId];
      if (!loc || loc.type !== prof!.zone) fail('invalid_location');
      if (loc!.cityId !== ch.city_id) fail('not_in_city');
      if (prof!.vip && !req.user!.isVip) fail('vip_required', 403);
      if (ch.profession === prof!.id) fail('already_in_profession', 409);
      if (unmetRequirement(prof!, ch.skills)) fail('requirements_not_met');
      // Meslek değiştirmek rütbeyi sıfırlar
      const r = await one(
        c,
        'UPDATE characters SET profession = $2, career_hours = 0, career_rank = 0, location_id = $3 WHERE id = $1 RETURNING *',
        [id, prof!.id, loc!.id],
      );
      return { character: toCharacterDto(r, await officesOf(c, id)) };
    });
  });

  app.post('/career/quit', async (req) => {
    const id = charId(req);
    return tx(async (c) => {
      await lockCharacter(c, id);
      if (await activeAction(c, id)) fail('busy', 409);
      const r = await one(c, 'UPDATE characters SET profession = NULL, career_hours = 0, career_rank = 0 WHERE id = $1 RETURNING *', [id]);
      return { character: toCharacterDto(r, await officesOf(c, id)) };
    });
  });

  // ---------- Para gönderme (sadece VIP) ----------

  app.post('/transfer', async (req) => {
    const id = charId(req);
    requireVip(req);
    const body = parse(z.object({ toName: z.string().trim().min(1), amount: z.number().int().min(1).max(VIP.maxTransfer) }), req.body);
    return tx(async (c) => {
      const from = await lockCharacter(c, id);
      if (isJailed(from)) fail('in_jail', 409);
      await requireEstablished(c, id);
      const target = await one(c, 'SELECT id FROM characters WHERE lower(name) = lower($1) AND NOT npc AND dead_at IS NULL', [body.toName]);
      if (!target) fail('character_not_found', 404);
      if (target.id === id) fail('invalid_target');
      if (from.money < body.amount) fail('not_enough_money');
      await c.query('UPDATE characters SET money = money - $2 WHERE id = $1', [id, body.amount]);
      await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [target.id, body.amount]);
      await c.query('INSERT INTO money_transfers(from_id, to_id, amount) VALUES ($1, $2, $3)', [id, target.id, body.amount]);
      await notify(c, target.id, 'money_received', { from: from.name, amount: body.amount });
      return { ok: true, money: from.money - body.amount };
    });
  });

  // ---------- Envanter ve dükkânlar ----------

  app.get('/inventory', async (req) => ({ items: await inventoryOf(pool, charId(req)) }));

  app.post('/shop/buy', async (req) => {
    const id = charId(req);
    const body = parse(z.object({ locationId: z.string(), itemId: z.string(), qty: z.number().int().min(1).max(10).default(1) }), req.body);
    return tx(async (c) => {
      const ch = await lockCharacter(c, id);
      if (isJailed(ch)) fail('in_jail', 409);
      if (await activeAction(c, id)) fail('busy', 409);
      const loc = LOCATION_BY_ID[body.locationId];
      const item = ITEM_BY_ID[body.itemId];
      if (!loc || !isShop(loc.type) || !item || item.shop !== loc.type || item.crafted) fail('invalid_item');
      if (item!.vip && !req.user!.isVip) fail('vip_required', 403);
      if (loc!.cityId !== ch.city_id) fail('not_in_city');
      const qty = item!.stackable ? body.qty : 1;
      const total = item!.price * qty;
      if (ch.money < total) fail('not_enough_money');
      // Yuvası boşsa kuşanılabilir eşyayı otomatik kuşan (sanat eserleri her zaman etkindir)
      const equippable = isEquippable(item!.slot);
      const occupied = !equippable || !!(await one(c, 'SELECT 1 FROM inventory WHERE character_id = $1 AND slot = $2 AND equipped', [id, item!.slot]));
      let last: any = null;
      for (let i = 0; i < qty; i++) {
        last = await one(c, 'INSERT INTO inventory(character_id, item_id, slot, equipped) VALUES ($1, $2, $3, $4) RETURNING *', [
          id,
          item!.id,
          item!.slot,
          item!.slot === 'art' ? true : equippable && !occupied && i === 0,
        ]);
      }
      await c.query('UPDATE characters SET money = money - $2, location_id = $3 WHERE id = $1', [id, total, loc!.id]);
      // Aşırı alışveriş bağımlılık yapar (kitap ve malzeme sayılmaz)
      if (item!.slot !== 'material') await indulge(c, ch, indulgenceForSpend(total));
      return { item: toInventoryDto(last), money: ch.money - total, qty };
    });
  });

  app.post('/shop/sell', async (req) => {
    const id = charId(req);
    const body = parse(z.object({ locationId: z.string(), inventoryId: z.number().int() }), req.body);
    return tx(async (c) => {
      const ch = await lockCharacter(c, id);
      if (isJailed(ch)) fail('in_jail', 409);
      if (await activeAction(c, id)) fail('busy', 409);
      const inv = await one(c, 'SELECT * FROM inventory WHERE id = $1 AND character_id = $2 FOR UPDATE', [body.inventoryId, id]);
      if (!inv) fail('not_found', 404);
      if (inv.listed) fail('item_listed', 409);
      const item = ITEM_BY_ID[inv.item_id];
      const loc = LOCATION_BY_ID[body.locationId];
      if (!loc || !item || loc.type !== item.shop) fail('wrong_shop');
      if (loc!.cityId !== ch.city_id) fail('not_in_city');
      // Atölyede üretilen eşyalar dükkâna satılmaz (malzemeden ucuza üretip satarak para basılmasın); ikinci el pazarında satılabilir
      if (item!.crafted) fail('crafted_not_sellable');
      if (await ringPledged(c, inv.id)) fail('ring_pledged', 409);
      const price = Math.floor(item!.price * SELL_BACK_RATE);
      await c.query('DELETE FROM inventory WHERE id = $1', [inv.id]);
      await c.query('UPDATE characters SET money = money + $2, location_id = $3 WHERE id = $1', [id, price, loc!.id]);
      return { ok: true, earned: price };
    });
  });

  app.post('/inventory/:id/equip', async (req) => {
    const cid = charId(req);
    const { id } = parse(idParam, req.params);
    return tx(async (c) => {
      const inv = await one(c, 'SELECT * FROM inventory WHERE id = $1 AND character_id = $2 FOR UPDATE', [id, cid]);
      if (!inv) fail('not_found', 404);
      if (inv.slot === 'art') return { ok: true };
      if (!isEquippable(inv.slot)) fail('not_equippable');
      if (inv.listed) fail('item_listed', 409);
      await c.query('UPDATE inventory SET equipped = FALSE WHERE character_id = $1 AND slot = $2', [cid, inv.slot]);
      await c.query('UPDATE inventory SET equipped = TRUE WHERE id = $1', [id]);
      return { ok: true };
    });
  });

  app.post('/inventory/:id/unequip', async (req) => {
    const cid = charId(req);
    const { id } = parse(idParam, req.params);
    await pool.query(`UPDATE inventory SET equipped = FALSE WHERE id = $1 AND character_id = $2 AND slot <> 'art'`, [id, cid]);
    return { ok: true };
  });
}
