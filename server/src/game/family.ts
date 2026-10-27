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
  cheatDiscoveryChance,
  childAge,
  childStage,
  gameHoursToMs,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one, tx } from '../db';
import { fail } from '../errors';
import { type CharacterRow, activeAction, isJailed, lockCharacter, membership, notify, requireEstablished } from './common';
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
    if (ageOf(ch.created_at, config.gameSpeed) < ADULT_AGE) fail('not_adult', 403);
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

/** Teklif: aynı mekândaki yetişkin bir oyuncuya (bildirim imalı) */
export async function offerFling(actor: number, other: number) {
  return tx(async (c) => {
    const locked = new Map<number, CharacterRow>();
    for (const id of pair(actor, other)) locked.set(id, await lockCharacter(c, id));
    const me = locked.get(actor)!;
    const them = locked.get(other)!;
    if (await activeAction(c, actor)) fail('busy', 409);
    const loc = await checkPair(c, me, them);
    if (currentEnergy(me) < FLING_ENERGY) fail('too_tired', 409);
    await c.query(
      `INSERT INTO fling_offers(from_id, to_id, location_id, expires_at) VALUES ($1, $2, $3, $4)
       ON CONFLICT (from_id, to_id) DO UPDATE SET location_id = EXCLUDED.location_id, expires_at = EXCLUDED.expires_at, created_at = now()`,
      [actor, other, loc.id, new Date(Date.now() + hoursMs(FLING_OFFER_HOURS))],
    );
    await notify(c, other, 'fling_offer', { fromId: actor, from: me.name, locationId: loc.id });
    return { ok: true };
  });
}

/** Yanıt: kabul ya da ret. Kabulde her şey tek işlemde: iki taraf id sırasıyla kilitlenir. */
export async function answerFling(viewer: number, other: number, accept: boolean, rand = Math.random) {
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
    await notify(c, other, 'fling_accepted', { fromId: viewer, from: me.name });
    return { status: 'done', gossip, regret: outcome[viewer].regret, discovered: outcome[viewer].discovered };
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
  return { incoming: !!incoming, outgoing: !!outgoing };
}

// ---------- Aile ----------

/** Profil için çocuklar: ad, yaş ve yaş basamağı */
export async function childrenOf(db: Db, characterId: number) {
  const rows = await many(db, 'SELECT id, name, born_at FROM children WHERE parent_a = $1 OR parent_b = $1 ORDER BY born_at', [characterId]);
  return rows.map((r) => {
    const age = childAge(r.born_at, config.gameSpeed);
    return { name: r.name as string, bornAt: r.born_at.toISOString(), age: Math.floor(age), stage: childStage(age) };
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
        if (p.dead_at) continue;
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
