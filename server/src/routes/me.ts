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
  cleanText,
  SELL_BACK_RATE,
  START_HEALTH,
  START_MONEY,
  START_MOOD,
  isShop,
  isEquippable,
  startingSkills,
  indulgenceForSpend,
  CRAVING_SATISFY_SPEND,
  seasonAt,
  ATTRIBUTES,
  ATTR_MAX_SPEND,
  startAllocationError,
  startingAttributes,
} from '@rifftown/shared';
import { attributesOf, spendAttribute } from '../game/attributes';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { addMoodlet, storedMoodlets } from '../game/wellbeing';
import { charId, requireUser, requireVip } from '../auth';
import { many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { config } from '../config';
import { activeAction, getCharacter, isJailed, lockCharacter, membership, notify, officesOf, requireEstablished, toActionDto, toCharacterDto } from '../game/common';
import { evaluateInBackground } from '../game/achievements';
import { meSnapshot } from '../game/me-snapshot';
import { completeOwnDueAction } from '../game/actions';
import { bailQuote, inCustody } from '../game/crime';
import { homeOf } from '../game/homes';
import { businessOf } from '../game/business';
import { inventoryOf, recordMoneyFlow, requireTransferRoom, toInventoryDto, ringPledged } from '../game/items';
import { hotelOf, useItem } from '../game/lifestyle';
import { pair, unreadMessages } from '../game/social';
import { idParam, parse } from './util';
import { claimInheritance, indulge, lastDeath } from '../game/consequences';
import { answerHeirConsent, heirsInfo, requestHeirConsent, succeed } from '../game/generations';

/** Ortak temizleyici (shared moderation.ts) + küfür yıldızı */
const clean = (v: string | undefined, singleLine = false) => (v === undefined ? null : maskProfanity(cleanText(v, singleLine)));

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
      const death = await lastDeath(pool, u.id);
      return {
        ...base, character: null, action: null, band: null, unreadNotifications: 0, pendingInvites: 0, bailCost: null, unreadMessages: 0,
        death,
        // Nesiller: ölen karakterin mirasçı olabilecek yetişkin çocukları (yeni karakter yerine)
        heirsAvailable: death ? await heirsInfo(u.id, u.isVip, pool).then((h) => h.children.filter((k) => !k.blocker).length).catch(() => 0) : 0,
      };
    }
    // Başarımlar istek yolunda değil, arka planda (sınırlı eşzamanlılıkla) değerlendirilir (playtest O-10)
    evaluateInBackground(u.characterId);
    let snap = await meSnapshot(pool, u.characterId);
    // Okuma anında tamamlama: süresi dolmuş eylem zamanlayıcıyı beklemeden sonuçlanır (playtest O-11)
    if (snap?.action && (snap.action.ends_at as Date).getTime() <= Date.now() && (await completeOwnDueAction(u.characterId))) {
      snap = await meSnapshot(pool, u.characterId);
    }
    if (!snap) fail('no_character', 404);
    const { ch, action } = snap!;
    return {
      ...base,
      character: toCharacterDto(ch, snap!.offices, {
        inCustody: snap!.inCustody,
        achievementPoints: snap!.achievementPoints,
        home: snap!.home,
        hotel: snap!.hotel,
        business: snap!.business,
        moodlets: snap!.moodlets,
      }),
      action: action ? toActionDto(action) : null,
      band: snap!.band ? { ...snap!.band, isLeader: snap!.band.leaderId === Number(ch.id) } : null,
      unreadNotifications: snap!.unreadNotifications,
      pendingInvites: snap!.pendingInvites,
      bailCost: await bailQuote(ch),
      unreadMessages: snap!.unreadMessages,
      pendingTrades: snap!.pendingTrades,
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
        /** Başlangıç puanlarının dağılımı (toplam 20, bir niteliğe en fazla 10). Verilmezse role göre varsayılan. */
        startAttributes: z.record(z.string().max(20), z.number()).optional(),
      }),
      req.body,
    );
    if (body.startAttributes) {
      const bad = startAllocationError(body.startAttributes);
      if (bad) fail(bad);
    }
    if (await one(pool, 'SELECT 1 FROM characters WHERE lower(name) = lower($1)', [body.name])) fail('name_taken', 409);
    const color = body.avatarColor ?? AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    return tx(async (c) => {
      // Ölen karakterin mirası bir kez, yeni karaktere geçer (para yalnızca taşınır, basılmaz). Aynı işlemde: kayıt
      // başarısız olursa miras kaybolmaz. Mirasçıyla devamda da aynı kod kullanılır (generations.ts).
      const inheritance = await claimInheritance(c, req.user!.id);
      const ch = await one(
        c,
        `INSERT INTO characters(user_id, name, avatar_color, main_instrument, money, mood, health, city_id, skills, attributes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [req.user!.id, body.name, color, body.mainInstrument, START_MONEY + inheritance, START_MOOD, START_HEALTH, body.cityId,
          JSON.stringify(startingSkills(body.mainInstrument, body.favoriteGenre)),
          // Nitelikler: 10 taban + ana enstrüman payı + başlangıç puanları. XP sıfırdan başlar (miras XP taşımaz).
          JSON.stringify(startingAttributes(body.mainInstrument, body.startAttributes))],
      );
      await c.query(`INSERT INTO notifications(character_id, kind, data) VALUES ($1, 'welcome', '{}')`, [ch.id]);
      // İlk 48 oyun saati yorucu işler daha az yorar (actions.ts isNewcomer); oyuncu bunu moodlet olarak görür
      await addMoodlet(c, ch.id, 'fresh_start');
      return { character: toCharacterDto(ch) };
    });
  });

  app.get('/character/avatar-colors', async () => ({ colors: AVATAR_COLORS }));

  // ---------- Nesiller: mirasçıyla devam ----------

  /** Devredebilecek karakter (yaşayan ya da ölen), olası mirasçılar, tahmini miras ve yadigâr adayları */
  app.get('/family/heirs', async (req) => heirsInfo(req.user!.id, req.user!.isVip, pool));

  /** Çocuğun diğer ebeveyni başka hesaptaysa onay iste */
  app.post('/family/children/:id/heir-request', async (req) => requestHeirConsent(req.user!.id, parse(idParam, req.params).id));

  /** Diğer ebeveyn olarak onay ver ya da reddet */
  app.post('/family/children/:id/heir-consent', async (req) =>
    answerHeirConsent(charId(req), parse(idParam, req.params).id, parse(z.object({ accept: z.boolean() }), req.body).accept),
  );

  /** Mirası devret: yetişkin çocuk mirasçı karakter olur; yaşayan ebeveyn emekliye ayrılır (tek işlem) */
  app.post('/succession', async (req) => {
    const body = parse(
      z.object({
        childId: z.number().int().positive(),
        name: z.string().trim().max(24).optional(),
        cityId: z.string().refine((id) => !!CITY_BY_ID[id]),
        mainInstrument: z.enum(INSTRUMENTS),
        favoriteGenre: z.enum(GENRES).default('rock'),
        avatarColor: z.string().refine((c) => AVATAR_COLORS.includes(c)).optional(),
        startAttributes: z.record(z.string().max(20), z.number()).optional(),
        heirlooms: z.array(z.number().int().positive()).max(10).optional(),
      }),
      req.body,
    );
    if (body.startAttributes) {
      const bad = startAllocationError(body.startAttributes);
      if (bad) fail(bad);
    }
    const color = body.avatarColor ?? AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    return succeed(req.user!.id, req.user!.isVip, { ...body, avatarColor: color });
  });

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

  // ---------- Nitelikler ve XP ----------

  app.get('/attributes', async (req) => attributesOf(pool, await getCharacter(pool, charId(req))));

  /** XP harcayıp bir niteliği yükseltir (para ile XP alınamaz; puan geri alınmaz) */
  app.post('/attributes/spend', async (req) => {
    const body = parse(z.object({ attribute: z.enum(ATTRIBUTES), points: z.number().int().min(1).max(ATTR_MAX_SPEND).default(1) }), req.body);
    return spendAttribute(charId(req), body.attribute, body.points);
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
      const target = await one(c, 'SELECT id FROM characters WHERE lower(name) = lower($1) AND NOT npc AND dead_at IS NULL AND retired_at IS NULL', [body.toName]);
      if (!target) fail('character_not_found', 404);
      const toId = Number(target.id);
      if (toId === id) fail('invalid_target');
      // İki karakter id sırasıyla kilitlenir (takas, pazar ve hediyeyle aynı sıra)
      const locked = new Map<number, Awaited<ReturnType<typeof lockCharacter>>>();
      for (const cid of pair(id, toId)) locked.set(cid, await lockCharacter(c, cid));
      const from = locked.get(id)!;
      if (isJailed(from)) fail('in_jail', 409);
      await requireEstablished(c, id);
      if (from.money < body.amount) fail('not_enough_money');
      // İkili başına haftalık net para akışı tavanı (takas ve pazarla ortak)
      await requireTransferRoom(c, id, toId, body.amount);
      await c.query('UPDATE characters SET money = money - $2 WHERE id = $1', [id, body.amount]);
      await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [toId, body.amount]);
      await c.query('INSERT INTO money_transfers(from_id, to_id, amount) VALUES ($1, $2, $3)', [id, toId, body.amount]);
      await recordMoneyFlow(c, id, toId, body.amount, 'vip');
      await notify(c, toId, 'money_received', { from: from.name, amount: body.amount });
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
      // Ödül eşyası dükkânda satılmaz; nadir eşya yalnızca kendi şehrinde; sezonluk eşya yalnızca mevsiminde
      if (item!.reward) fail('invalid_item');
      if (item!.cityOnly && item!.cityOnly !== loc!.cityId) fail('invalid_item');
      if (item!.season && item!.season !== seasonAt(Date.now(), config.gameSpeed)) fail('out_of_season', 409);
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
      // Büyük alışveriş (CRAVING_SATISFY_SPEND+) bağımlının isteğini giderir; küçük alışveriş yalnızca düşkünlük ekler
      if (item!.slot !== 'material') await indulge(c, ch, indulgenceForSpend(total), total >= CRAVING_SATISFY_SPEND);
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
      // Ödül eşyaları kişiye bağlıdır: dükkâna satılıp paraya çevrilemez
      if (item!.bound) fail('item_bound', 409);
      if (await ringPledged(c, inv.id)) fail('ring_pledged', 409);
      const price = Math.floor(item!.price * SELL_BACK_RATE);
      await c.query('DELETE FROM inventory WHERE id = $1', [inv.id]);
      await c.query('UPDATE characters SET money = money + $2, location_id = $3 WHERE id = $1', [id, price, loc!.id]);
      return { ok: true, earned: price };
    });
  });

  // Tüketim eşyası kullan (enerji, ruh hâli, sağlık, ilham; ortak bekleme süresi)
  app.post('/inventory/:id/use', async (req) => {
    const { id } = parse(idParam, req.params);
    return useItem(charId(req), id);
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
