// Tek gecelik macera ve aile (kurallar: packages/shared/src/relations.ts).
// Macera karşılıklı onaylıdır: biri teklif eder, diğeri süre dolmadan kabul eder. Metinler imalıdır, açık içerik yoktur.
// Para, beceri ya da eşya kazandırmaz; sonuçları moodlet, ilham, olasılıkla pişmanlık, dedikodu ve aldatma.
// Aile: çocuklar oyun takvimiyle büyür; reşit olmayan çocukların haftalık bakım gideri iki ebeveyne yarı yarıya düşer.

import {
  ADULT_AGE,
  CHEAT_BREAKUP_BELOW,
  CHEAT_FRIENDSHIP_LOSS,
  CHEAT_ROMANCE_LOSS,
  CHILD_WEEKLY_UPKEEP,
  CITY_BY_ID,
  FLING_DAILY_CAP,
  FLING_ENERGY,
  FLING_FRIENDSHIP,
  FLING_GOSSIP_CHANCE,
  FLING_GOSSIP_FAME,
  FLING_INSPIRATION,
  FLING_OFFER_HOURS,
  FLING_PAIR_COOLDOWN_DAYS,
  FLING_PLACES,
  FLING_REGRET_CHANCE,
  LOCATION_BY_ID,
  ageOf,
  CONDOM_ITEM,
  FLING_PREGNANCY_CHANCE,
  MAX_CHILDREN,
  POSTPARTUM_COOLDOWN_DAYS,
  PREGNANCY_DAYS,
  TRY_ENERGY,
  TRY_MIN_ROMANCE,
  TRY_OFFER_HOURS,
  TRY_PAIR_COOLDOWN_DAYS,
  TRY_PREGNANCY_CHANCE,
  babyName,
  cheatDiscoveryChance,
  childAge,
  childStage,
  gameHoursToMs,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one, tx } from '../db';
import { fail } from '../errors';
import { type CharacterRow, activeAction, ageRef, isJailed, lockCharacter, membership, notify, requireEstablished } from './common';
import { createScandal } from './consequences';
import { isBlocked, pair, requirePlayer } from './social';
import { addMoodlet, changeWellbeing, currentEnergy } from './wellbeing';

const hoursMs = (h: number) => gameHoursToMs(h, config.gameSpeed);

async function partnerOf(db: Db, id: number) {
  const r = await one(db, 'SELECT partner_id FROM partners WHERE character_id = $1', [id]);
  return r ? Number(r.partner_id) : null;
}

/** Ortak kontroller: iki gerçek yetişkin oyuncu, aynı uygun mekânda, engelsiz, yeni hesap değil, enerji yeterli, tavan ve bekleme */
async function checkPair(c: pg.PoolClient, me: CharacterRow, them: CharacterRow) {
  if (me.id === them.id) fail('invalid_target');
  await requirePlayer(c, them.id);
  if (await isBlocked(c, me.id, them.id)) fail('blocked', 403);
  await requireEstablished(c, me.id);
  await requireEstablished(c, them.id);
  for (const ch of [me, them]) {
    if (ageOf(ageRef(ch), config.gameSpeed) < ADULT_AGE) fail('not_adult', 403);
    if (isJailed(ch)) fail('in_jail', 409);
  }
  const loc = me.location_id ? LOCATION_BY_ID[me.location_id] : undefined;
  if (!loc || !(FLING_PLACES as readonly string[]).includes(loc.type) || loc.cityId !== me.city_id) fail('wrong_place');
  if (them.location_id !== me.location_id || them.city_id !== me.city_id) fail('not_here', 409);
  const [a, b] = pair(me.id, them.id);
  const recent = await one(c, 'SELECT 1 FROM flings WHERE a_id = $1 AND b_id = $2 AND created_at > $3', [a, b, new Date(Date.now() - hoursMs(FLING_PAIR_COOLDOWN_DAYS * 24))]);
  if (recent) fail('cooldown', 409);
  for (const ch of [me, them]) {
    const n = await one(c, 'SELECT count(*)::int AS n FROM flings WHERE (a_id = $1 OR b_id = $1) AND created_at > $2', [ch.id, new Date(Date.now() - hoursMs(24))]);
    if (n.n >= FLING_DAILY_CAP) fail('fling_daily_cap', 409);
  }
  return loc!;
}

/** Teklif: aynı mekândaki yetişkin bir oyuncuya (bildirim imalı). protectedPref: teklif edenin koruma tercihi */
export async function offerFling(actor: number, other: number, protectedPref = true) {
  return tx(async (c) => {
    const locked = new Map<number, CharacterRow>();
    for (const id of pair(actor, other)) locked.set(id, await lockCharacter(c, id));
    const me = locked.get(actor)!;
    const them = locked.get(other)!;
    if (await activeAction(c, actor)) fail('busy', 409);
    const loc = await checkPair(c, me, them);
    if (currentEnergy(me) < FLING_ENERGY) fail('too_tired', 409);
    await c.query(
      `INSERT INTO fling_offers(from_id, to_id, location_id, expires_at, protected) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (from_id, to_id) DO UPDATE SET location_id = EXCLUDED.location_id, expires_at = EXCLUDED.expires_at, protected = EXCLUDED.protected, created_at = now()`,
      [actor, other, loc.id, new Date(Date.now() + hoursMs(FLING_OFFER_HOURS)), protectedPref],
    );
    await notify(c, other, 'fling_offer', { fromId: actor, from: me.name, locationId: loc.id, protected: protectedPref });
    return { ok: true };
  });
}

/**
 * Yanıt: kabul ya da ret. Kabulde her şey tek işlemde: iki taraf id sırasıyla kilitlenir.
 * Koruma: taraflardan biri isterse birliktelik korunmalıdır ve bir prezervatif (önce isteyenin) harcanır; kimsede yoksa olmaz.
 * Korunmasız olması için iki tarafın da açıkça korunmasız seçmesi gerekir.
 */
export async function answerFling(viewer: number, other: number, accept: boolean, protectedPref = true, rand = Math.random) {
  return tx(async (c) => {
    const locked = new Map<number, CharacterRow>();
    for (const id of pair(viewer, other)) locked.set(id, await lockCharacter(c, id));
    const offer = await one(c, 'SELECT * FROM fling_offers WHERE from_id = $1 AND to_id = $2 FOR UPDATE', [other, viewer]);
    if (!offer) fail('no_fling_offer', 404);
    await c.query('DELETE FROM fling_offers WHERE from_id = $1 AND to_id = $2', [other, viewer]);
    if (offer.expires_at.getTime() < Date.now()) fail('offer_expired', 409);
    if (!accept) {
      await notify(c, other, 'fling_declined', { fromId: viewer, from: locked.get(viewer)!.name });
      return { status: 'declined' };
    }
    const me = locked.get(viewer)!;
    const them = locked.get(other)!;
    if (await activeAction(c, viewer)) fail('busy', 409);
    const loc = await checkPair(c, me, them);
    if (loc.id !== offer.location_id) fail('not_here', 409);
    for (const ch of [me, them]) if (currentEnergy(ch) < FLING_ENERGY) fail('too_tired', 409);
    const isProtected = !!offer.protected || protectedPref;
    if (isProtected) {
      // Önce korunmak isteyenin envanterinden (ikisi de istiyorsa kabul edenin)
      const order = protectedPref ? [viewer, other] : [other, viewer];
      let used = false;
      for (const id of order) {
        const cd = await one(c, `SELECT id FROM inventory WHERE character_id = $1 AND item_id = $2 AND NOT listed ORDER BY id LIMIT 1 FOR UPDATE`, [id, CONDOM_ITEM]);
        if (cd) {
          await c.query('DELETE FROM inventory WHERE id = $1', [cd.id]);
          used = true;
          break;
        }
      }
      if (!used) fail('no_protection', 409);
    }
    const [a, b] = pair(viewer, other);
    await c.query('INSERT INTO flings(a_id, b_id, location_id) VALUES ($1, $2, $3)', [a, b, loc.id]);
    // Çok küçük arkadaşlık; romantizme dokunmaz (flört yerine geçmesin)
    await c.query(
      `INSERT INTO relationships(a_id, b_id, friendship) VALUES ($1, $2, $3)
       ON CONFLICT (a_id, b_id) DO UPDATE SET friendship = LEAST(100, relationships.friendship + $3), updated_at = now()`,
      [a, b, FLING_FRIENDSHIP],
    );
    // Dedikodu: şöhretli bir taraf varsa olasılıkla magazin skandalı
    let gossip = false;
    for (const ch of [me, them]) {
      const m = await membership(c, ch.id);
      if (!m) continue;
      const f = await one(c, 'SELECT fame FROM band_fame WHERE band_id = $1 AND city_id = $2', [m.band_id, loc.cityId]);
      if (Number(f?.fame ?? 0) >= FLING_GOSSIP_FAME && rand() < FLING_GOSSIP_CHANCE) {
        await createScandal(c, { bandId: m.band_id, characterId: ch.id, cityId: loc.cityId, kind: 'affair' });
        gossip = true;
      }
    }
    const outcome: Record<number, { regret: boolean; discovered: boolean }> = {};
    for (const ch of [me, them]) {
      const partner = await partnerOf(c, ch.id);
      const cheating = !!partner && partner !== (ch.id === viewer ? other : viewer);
      await changeWellbeing(c, ch, { energy: -FLING_ENERGY, inspiration: FLING_INSPIRATION });
      await addMoodlet(c, ch.id, 'fling');
      const regret = cheating || rand() < FLING_REGRET_CHANCE;
      if (regret) await addMoodlet(c, ch.id, 'regret');
      let discovered = false;
      if (cheating) {
        const p = await one(c, 'SELECT city_id FROM characters WHERE id = $1', [partner]);
        discovered = rand() < cheatDiscoveryChance(gossip, p?.city_id === loc.cityId);
        if (discovered) await revealCheating(c, ch, partner!);
      }
      outcome[ch.id] = { regret, discovered };
    }
    // Korunmasız ve iki tarafın da aile ayarı açıksa çok düşük bir hamilelik ihtimali (korunmalıda tam sıfır)
    const pregnancy = isProtected ? null : await maybeConceive(c, me, them, FLING_PREGNANCY_CHANCE, 'fling', null, rand);
    await notify(c, other, 'fling_accepted', { fromId: viewer, from: me.name });
    return { status: 'done', protected: isProtected, gossip, regret: outcome[viewer].regret, discovered: outcome[viewer].discovered, pregnancy: !!pregnancy };
  });
}

/** Aldatma ortaya çıktı: partnerde "Aldatıldı", ilişki puanları düşer; sevgililikte puan düşükse ilişki biter */
async function revealCheating(c: pg.PoolClient, cheater: CharacterRow, partner: number) {
  const [a, b] = pair(cheater.id, partner);
  const rel = await one(c, 'SELECT * FROM relationships WHERE a_id = $1 AND b_id = $2 FOR UPDATE', [a, b]);
  if (!rel) return;
  const romance = Math.max(0, Number(rel.romance) - CHEAT_ROMANCE_LOSS);
  const ends = rel.stage !== 'married' && romance < CHEAT_BREAKUP_BELOW;
  await c.query(
    `UPDATE relationships SET romance = $3, friendship = GREATEST(0, friendship - $4), updated_at = now()
       ${ends ? ", stage = 'none', flirted_a = FALSE, flirted_b = FALSE, proposal_by = NULL, proposal_ring = NULL" : ''}
      WHERE a_id = $1 AND b_id = $2`,
    [a, b, romance, CHEAT_FRIENDSHIP_LOSS],
  );
  await addMoodlet(c, partner, 'cheated');
  if (ends) {
    await c.query('DELETE FROM partners WHERE character_id IN ($1, $2)', [cheater.id, partner]);
    await addMoodlet(c, partner, 'heartbreak');
    await addMoodlet(c, cheater.id, 'heartbreak');
  }
  await notify(c, partner, 'cheated_on', { fromId: cheater.id, from: cheater.name, ended: ends });
}

/** Profil için: bekleyen teklif (gelen/giden) */
export async function flingState(db: Db, viewer: number, other: number) {
  const incoming = await one(db, 'SELECT expires_at FROM fling_offers WHERE from_id = $1 AND to_id = $2 AND expires_at > now()', [other, viewer]);
  const outgoing = await one(db, 'SELECT expires_at FROM fling_offers WHERE from_id = $1 AND to_id = $2 AND expires_at > now()', [viewer, other]);
  const famIn = await one(db, 'SELECT carrier_id FROM family_try_offers WHERE from_id = $1 AND to_id = $2 AND expires_at > now()', [other, viewer]);
  const famOut = await one(db, 'SELECT 1 FROM family_try_offers WHERE from_id = $1 AND to_id = $2 AND expires_at > now()', [viewer, other]);
  return {
    incoming: !!incoming,
    outgoing: !!outgoing,
    familyIncoming: famIn ? { carrierIsMe: Number(famIn.carrier_id) === viewer } : null,
    familyOutgoing: !!famOut,
  };
}

// ---------- Aile ----------

/** Profil için çocuklar: ad, yaş, yaş basamağı ve (mirasçı olduysa) oynanabilir karakteri */
export async function childrenOf(db: Db, characterId: number) {
  const rows = await many(db, 'SELECT id, name, born_at, heir_id FROM children WHERE parent_a = $1 OR parent_b = $1 ORDER BY born_at', [characterId]);
  return rows.map((r) => {
    const age = childAge(r.born_at, config.gameSpeed);
    return {
      id: Number(r.id),
      name: r.name as string,
      bornAt: r.born_at.toISOString(),
      age: Math.floor(age),
      stage: childStage(age),
      characterId: r.heir_id != null ? Number(r.heir_id) : null,
    };
  });
}

/**
 * Zamanlayıcı: reşit olmayan çocukların haftalık bakım gideri. Her ebeveyn yarısını öder (boşanmış olsalar da);
 * parası yetmeyen ebeveyne borç yazılmaz, "Aile bütçesi" moodlet'i gelir. Ödeyen ebeveyne "Aile akşamı" ve biraz ilham,
 * bebeği olana ayrıca "Uykusuz gece". Para basılmaz: gider oyundan çıkar.
 */
export async function processChildren(): Promise<number> {
  let n = 0;
  const week = hoursMs(7 * 24);
  for (;;) {
    const done = await tx(async (c) => {
      const kid = await one(c, `SELECT * FROM children WHERE COALESCE(upkeep_due, born_at + $1 * interval '1 millisecond') <= now() ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED`, [week]);
      if (!kid) return false;
      const age = childAge(kid.born_at, config.gameSpeed);
      await c.query('UPDATE children SET upkeep_due = $2 WHERE id = $1', [kid.id, new Date(Date.now() + week)]);
      if (childStage(age) === 'adult') return true;
      const parents = [kid.parent_a, kid.parent_b].filter((x) => x != null).map(Number).sort((x, y) => x - y);
      for (const pid of parents) {
        const p = await lockCharacter(c, pid);
        // Ölen ya da mirasını devredip emekliye ayrılan ebeveyn ödemez (payı oyundan düşer, borç yazılmaz)
        if (p.dead_at || p.retired_at) continue;
        const share = Math.round((CHILD_WEEKLY_UPKEEP * (CITY_BY_ID[p.city_id ?? '']?.costMult ?? 1)) / 2);
        if (p.money >= share) {
          await c.query('UPDATE characters SET money = money - $2 WHERE id = $1', [pid, share]);
          await addMoodlet(c, pid, 'family_evening');
          await changeWellbeing(c, p, { inspiration: 3 });
          if (childStage(age) === 'baby') await addMoodlet(c, pid, 'sleepless');
          await notify(c, pid, 'child_upkeep', { name: kid.name, amount: share, paid: true });
        } else {
          await addMoodlet(c, pid, 'family_strain');
          await notify(c, pid, 'child_upkeep', { name: kid.name, amount: share, paid: false });
        }
      }
      return true;
    });
    if (!done) break;
    n++;
    if (n > 500) break;
  }
  return n;
}

// ---------- Aile planlaması ve hamilelik ----------

/** "Çocuk sahibi olmaya açığım" ayarı (varsayılan kapalı). Kapatmak devam eden hamileliği etkilemez. */
export async function setFamilyOpen(characterId: number, open: boolean) {
  await lockAndUpdate(characterId, open);
  return { familyOpen: open };
}
async function lockAndUpdate(characterId: number, open: boolean) {
  await tx(async (c) => {
    await lockCharacter(c, characterId);
    await c.query('UPDATE characters SET family_open = $2 WHERE id = $1', [characterId, open]);
  });
}

/** Bir karakter taşıyan olabilir mi: aktif hamileliği yok ve doğum sonrası bekleme süresi geçti */
async function canCarry(c: Db, id: number) {
  const r = await one(
    c,
    `SELECT EXISTS (SELECT 1 FROM pregnancies WHERE carrier_id = $1 AND status = 'active') AS active,
            EXISTS (SELECT 1 FROM pregnancies WHERE carrier_id = $1 AND status = 'born' AND born_at > $2) AS recent`,
    [id, new Date(Date.now() - hoursMs(POSTPARTUM_COOLDOWN_DAYS * 24))],
  );
  return !r?.active && !r?.recent;
}
/** Çiftin çocuk sınırı: doğmuş çocuklar ve süren hamilelikler birlikte */
async function pairChildren(c: Db, x: number, y: number) {
  const r = await one(
    c,
    `SELECT (SELECT count(*)::int FROM children WHERE (parent_a = $1 AND parent_b = $2) OR (parent_a = $2 AND parent_b = $1))
          + (SELECT count(*)::int FROM pregnancies WHERE status = 'active' AND ((carrier_id = $1 AND other_id = $2) OR (carrier_id = $2 AND other_id = $1))) AS n`,
    [x, y],
  );
  return Number(r?.n ?? 0);
}

/**
 * Zar: iki tarafın ayarı açık, çocuk sınırı dolmamış ve taşıyan uygun olmalı. carrierId verilmezse (macera)
 * uygun olanlardan biri zarla seçilir. Başarıda hamilelik kaydı, "Bebek bekliyor" ve iki tarafa bildirim.
 */
async function maybeConceive(c: pg.PoolClient, x: CharacterRow, y: CharacterRow, chance: number, source: 'try' | 'fling', carrierId: number | null, rand: () => number) {
  const flags = await many(c, 'SELECT id, family_open FROM characters WHERE id = ANY($1::bigint[])', [[x.id, y.id]]);
  if (flags.length !== 2 || !flags.every((f) => f.family_open)) return null;
  if ((await pairChildren(c, x.id, y.id)) >= MAX_CHILDREN) return null;
  const candidates = (carrierId ? [carrierId] : rand() < 0.5 ? [x.id, y.id] : [y.id, x.id]);
  let carrier: number | null = null;
  for (const id of candidates) if (await canCarry(c, id)) { carrier = id; break; }
  if (carrier === null) return null;
  if (!(rand() < chance)) return null;
  const other = carrier === x.id ? y.id : x.id;
  const p = await one(c, `INSERT INTO pregnancies(carrier_id, other_id, source, due_at) VALUES ($1, $2, $3, $4) RETURNING id, due_at`, [
    carrier,
    other,
    source,
    new Date(Date.now() + hoursMs(PREGNANCY_DAYS * 24)),
  ]);
  await addMoodlet(c, carrier, 'expecting');
  for (const id of [carrier, other]) await notify(c, id, 'pregnancy', { carrier: id === carrier, otherId: id === carrier ? other : carrier, dueAt: p.due_at.toISOString() });
  return p;
}

async function checkCouple(c: pg.PoolClient, me: CharacterRow, them: CharacterRow) {
  if (me.id === them.id) fail('invalid_target');
  await requirePlayer(c, them.id);
  if (await isBlocked(c, me.id, them.id)) fail('blocked', 403);
  await requireEstablished(c, me.id);
  await requireEstablished(c, them.id);
  for (const ch of [me, them]) if (ageOf(ageRef(ch), config.gameSpeed) < ADULT_AGE) fail('not_adult', 403);
  if (!me.city_id || me.city_id !== them.city_id) fail('not_in_same_city');
  const [a, b] = pair(me.id, them.id);
  const rel = await one(c, 'SELECT romance, stage FROM relationships WHERE a_id = $1 AND b_id = $2', [a, b]);
  if (!rel || Number(rel.romance) < TRY_MIN_ROMANCE || rel.stage === 'none') fail('need_partner', 403);
  const flags = await many(c, 'SELECT family_open FROM characters WHERE id = ANY($1::bigint[])', [[me.id, them.id]]);
  if (!flags.every((f) => f.family_open)) fail('family_closed', 409);
  if ((await pairChildren(c, me.id, them.id)) >= MAX_CHILDREN) fail('too_many_children');
  const recent = await one(c, 'SELECT 1 FROM family_tries WHERE a_id = $1 AND b_id = $2 AND created_at > $3', [a, b, new Date(Date.now() - hoursMs(TRY_PAIR_COOLDOWN_DAYS * 24))]);
  if (recent) fail('cooldown', 409);
}

/** "Çocuk sahibi olmayı dene": sevgili ya da evli çiftte biri teklif eder ve taşıyanı önerir; diğeri kabul eder */
export async function offerFamilyTry(actor: number, other: number, carrier: 'me' | 'them') {
  return tx(async (c) => {
    const locked = new Map<number, CharacterRow>();
    for (const id of pair(actor, other)) locked.set(id, await lockCharacter(c, id));
    await checkCouple(c, locked.get(actor)!, locked.get(other)!);
    const carrierId = carrier === 'me' ? actor : other;
    if (!(await canCarry(c, carrierId))) fail('cannot_carry', 409);
    await c.query(
      `INSERT INTO family_try_offers(from_id, to_id, carrier_id, expires_at) VALUES ($1, $2, $3, $4)
       ON CONFLICT (from_id, to_id) DO UPDATE SET carrier_id = EXCLUDED.carrier_id, expires_at = EXCLUDED.expires_at`,
      [actor, other, carrierId, new Date(Date.now() + hoursMs(TRY_OFFER_HOURS))],
    );
    await notify(c, other, 'family_try_offer', { fromId: actor, from: locked.get(actor)!.name, carrierIsMe: carrierId === other });
    return { ok: true };
  });
}

export async function answerFamilyTry(viewer: number, other: number, accept: boolean, rand = Math.random) {
  return tx(async (c) => {
    const locked = new Map<number, CharacterRow>();
    for (const id of pair(viewer, other)) locked.set(id, await lockCharacter(c, id));
    const offer = await one(c, 'SELECT * FROM family_try_offers WHERE from_id = $1 AND to_id = $2 FOR UPDATE', [other, viewer]);
    if (!offer) fail('no_family_offer', 404);
    await c.query('DELETE FROM family_try_offers WHERE from_id = $1 AND to_id = $2', [other, viewer]);
    if (offer.expires_at.getTime() < Date.now()) fail('offer_expired', 409);
    if (!accept) return { status: 'declined' };
    const me = locked.get(viewer)!;
    const them = locked.get(other)!;
    await checkCouple(c, me, them);
    for (const ch of [me, them]) if (currentEnergy(ch) < TRY_ENERGY) fail('too_tired', 409);
    for (const ch of [me, them]) await changeWellbeing(c, ch, { energy: -TRY_ENERGY });
    const p = await maybeConceive(c, me, them, TRY_PREGNANCY_CHANCE, 'try', Number(offer.carrier_id), rand);
    const [a, b] = pair(viewer, other);
    await c.query('INSERT INTO family_tries(a_id, b_id, success) VALUES ($1, $2, $3)', [a, b, !!p]);
    if (!p) for (const id of [viewer, other]) await notify(c, id, 'family_try_done', { otherId: id === viewer ? other : viewer });
    return { status: 'done', pregnancy: !!p };
  });
}

/** Ayarlar ve süren hamilelik (VIP olmayana gün sayısı bulanık: dueDays) */
export async function familyState(db: Db, characterId: number) {
  const ch = await one(db, 'SELECT family_open FROM characters WHERE id = $1', [characterId]);
  const p = await one(
    db,
    `SELECT p.carrier_id, p.other_id, p.due_at, c.name AS other_name FROM pregnancies p LEFT JOIN characters c ON c.id = CASE WHEN p.carrier_id = $1 THEN p.other_id ELSE p.carrier_id END
      WHERE p.status = 'active' AND (p.carrier_id = $1 OR p.other_id = $1) ORDER BY p.id DESC LIMIT 1`,
    [characterId],
  );
  const dayMs = hoursMs(24);
  return {
    familyOpen: !!ch?.family_open,
    pregnancy: p ? { carrier: Number(p.carrier_id) === characterId, otherName: p.other_name ?? null, dueDays: Math.max(0, Math.ceil((p.due_at.getTime() - Date.now()) / dayMs)) } : null,
  };
}

/** Zamanlayıcı: vadesi gelen hamilelikler doğumla sonuçlanır (çocuk iki ebeveyne bağlı; yeni ebeveyn moodlet'i) */
export async function processBirths(): Promise<number> {
  let n = 0;
  for (;;) {
    const done = await tx(async (c) => {
      const p = await one(c, `SELECT * FROM pregnancies WHERE status = 'active' AND due_at <= now() ORDER BY due_at LIMIT 1 FOR UPDATE SKIP LOCKED`);
      if (!p) return false;
      const parents = [p.carrier_id, p.other_id].filter((x) => x != null).map(Number);
      const carrier = p.carrier_id ? await one(c, 'SELECT city_id FROM characters WHERE id = $1', [p.carrier_id]) : null;
      const country = CITY_BY_ID[carrier?.city_id ?? '']?.countryCode ?? 'US';
      const kid = await one(c, 'INSERT INTO children(parent_a, parent_b, name) VALUES ($1, $2, $3) RETURNING id, name', [p.carrier_id, p.other_id, babyName(country, Number(p.id))]);
      await c.query(`UPDATE pregnancies SET status = 'born', born_at = now(), child_id = $2 WHERE id = $1`, [p.id, kid.id]);
      if (p.carrier_id) await c.query(`DELETE FROM moodlets WHERE character_id = $1 AND kind = 'expecting'`, [p.carrier_id]);
      for (const id of parents) {
        await addMoodlet(c, id, 'new_parent');
        await notify(c, id, 'baby_born', { name: kid.name });
      }
      return true;
    });
    if (!done) break;
    n++;
    if (n > 200) break;
  }
  return n;
}
