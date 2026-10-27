// İlişkiler: takılma, flört, randevu, evlilik teklifi, düğün, ayrılık ve boşanma, evlat edinme.
// Her etkileşim iki tarafın da aynı şehirde olmasını ister ve engellenmiş kişiler arasında yapılamaz.

import {
  ADOPTION_FEE,
  CHILD_NAME_RE,
  CITY_BY_ID,
  DATE_COOLDOWN_HOURS,
  DATE_MIN_ROMANCE,
  DATING_ROMANCE,
  DIVORCE_FEE,
  FLIRT_COOLDOWN_HOURS,
  FLIRT_MIN_FRIENDSHIP,
  HANGOUT_COOLDOWN_HOURS,
  LOCATION_BY_ID,
  MAX_CHILDREN,
  MEAL_BY_ID,
  ONE_SIDED_ROMANCE_CAP,
  PROPOSE_MIN_ROMANCE,
  type RelationshipDto,
  WEDDING_FEE,
  clamp,
  containsProfanity,
  dateGain,
  diminishing,
  flirtGain,
  gameHoursToMs,
  hangoutGain,
  knows,
  lv,
  INSPIRATION_GAIN,
  skillMult,
  socialAttrMult,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { type Db, one, pool, tx } from '../db';
import { fail } from '../errors';
import { evaluateAchievements } from './achievements';
import { type CharacterRow, activeAction, isJailed, lockCharacter, notify, requireEstablished } from './common';
import { mealPrice, payBusinessForMeal } from './lifestyle';
import { addMoodlet, nudgeWellbeing } from './wellbeing';
import { cleanText, isBlocked, lockRel, pair, requirePlayer } from './social';

const hoursMs = (h: number) => gameHoursToMs(h, config.gameSpeed);
const nextAt = (last: Date | null, hours: number) => (last && last.getTime() + hoursMs(hours) > Date.now() ? new Date(last.getTime() + hoursMs(hours)) : null);

async function partnerOf(db: Db, id: number): Promise<number | null> {
  const r = await one(db, 'SELECT partner_id FROM partners WHERE character_id = $1', [id]);
  return r ? Number(r.partner_id) : null;
}

export async function relationship(viewer: number, other: number): Promise<RelationshipDto> {
  const [a, b] = pair(viewer, other);
  const r = (await one(pool, 'SELECT * FROM relationships WHERE a_id = $1 AND b_id = $2', [a, b])) ?? {};
  const meFirst = viewer === a;
  const [me, them] = await Promise.all([
    one(pool, 'SELECT city_id FROM characters WHERE id = $1', [viewer]),
    one(pool, 'SELECT city_id FROM characters WHERE id = $1', [other]),
  ]);
  const blocks = await pool.query('SELECT blocker_id FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)', [viewer, other]);
  const myPartner = await partnerOf(pool, viewer);
  const theirPartner = await partnerOf(pool, other);
  const lastFlirt = await one(pool, `SELECT max(created_at) AS at FROM social_log WHERE actor_id = $1 AND target_id = $2 AND kind = 'flirt'`, [viewer, other]);
  const iFlirted = !!(meFirst ? r.flirted_a : r.flirted_b);
  const theyFlirted = !!(meFirst ? r.flirted_b : r.flirted_a);
  return {
    characterId: other,
    friends: !!r.friends,
    friendRequest: r.friend_request ? (Number(r.friend_request) === viewer ? 'outgoing' : 'incoming') : null,
    friendship: Math.round(r.friendship ?? 0),
    romance: Math.round(r.romance ?? 0),
    stage: r.stage ?? 'none',
    mutualFlirt: iFlirted && theyFlirted,
    iFlirted,
    proposal: r.proposal_by ? (Number(r.proposal_by) === viewer ? 'outgoing' : 'incoming') : null,
    adoption: r.adoption_by ? { by: Number(r.adoption_by) === viewer ? 'me' : 'them', name: r.adoption_name } : null,
    blocked: blocks.rows.some((x) => Number(x.blocker_id) === viewer),
    blockedMe: blocks.rows.some((x) => Number(x.blocker_id) === other),
    sameCity: !!me?.city_id && me.city_id === them?.city_id,
    next: {
      hangout: nextAt(r.last_hangout ?? null, HANGOUT_COOLDOWN_HOURS)?.toISOString() ?? null,
      flirt: nextAt(lastFlirt?.at ?? null, FLIRT_COOLDOWN_HOURS)?.toISOString() ?? null,
      date: nextAt(r.last_date ?? null, DATE_COOLDOWN_HOURS)?.toISOString() ?? null,
    },
    takenElsewhere: (myPartner !== null && myPartner !== other) || (theirPartner !== null && theirPartner !== viewer),
  };
}

/** İki karakteri kimlik sırasıyla kilitler ve ortak kontrolleri yapar */
async function lockPair(c: pg.PoolClient, actor: number, other: number) {
  if (actor === other) fail('invalid_target');
  await requirePlayer(c, other);
  if (await isBlocked(c, actor, other)) fail('blocked', 403);
  const rel = await lockRel(c, actor, other);
  const locked: Record<number, CharacterRow> = {};
  for (const id of pair(actor, other)) locked[id] = await lockCharacter(c, id);
  const me = locked[actor];
  const them = locked[other];
  if (!me.city_id) fail('traveling', 409);
  if (me.city_id !== them.city_id) fail('not_in_same_city');
  return { rel, me, them, meFirst: actor === Number(rel.a_id) };
}

const bumpSkill = (skills: Record<string, number>, id: string, amount: number) => {
  if (knows(skills, id)) skills[id] = clamp(skills[id] + amount * diminishing(skills[id]), 0, 100);
};

// ---------- Takılma ----------
// Çekicilik niteliği takılma, flört ve randevu kazancını en fazla %15 artırır (attributes.ts socialAttrMult)

export async function hangout(actor: number, other: number) {
  return tx(async (c) => {
    const { rel, me, them } = await lockPair(c, actor, other);
    if (await activeAction(c, actor)) fail('busy', 409);
    if (nextAt(rel.last_hangout, HANGOUT_COOLDOWN_HOURS)) fail('cooldown', 409);
    const gain = hangoutGain(rel.friendship, lv(me.skills, 'charisma')) * skillMult(me.skills, 'social') * socialAttrMult(me.attributes);
    const friendship = clamp(rel.friendship + gain, 0, 100);
    await c.query('UPDATE relationships SET friendship = $3, last_hangout = now(), updated_at = now() WHERE a_id = $1 AND b_id = $2', [rel.a_id, rel.b_id, friendship]);
    const skills = { ...me.skills };
    bumpSkill(skills, 'charisma', 0.3);
    await c.query('UPDATE characters SET mood = LEAST(100, mood + 3), skills = $2 WHERE id = $1', [me.id, JSON.stringify(skills)]);
    await c.query('UPDATE characters SET mood = LEAST(100, mood + 3) WHERE id = $1', [them.id]);
    await c.query(`INSERT INTO social_log(actor_id, target_id, kind) VALUES ($1, $2, 'hangout')`, [actor, other]);
    await notify(c, other, 'hangout', { fromId: actor, from: me.name });
    for (const id of [actor, other]) {
      await addMoodlet(c, id, 'good_company');
      await nudgeWellbeing(c, id, { inspiration: INSPIRATION_GAIN.hangout });
    }
    return { friendship: Math.round(friendship), gain };
  });
}

// ---------- Flört ----------

export async function flirt(actor: number, other: number) {
  return tx(async (c) => {
    const { rel, me, meFirst } = await lockPair(c, actor, other);
    // Bekleme süresi kişiye göre: karşı tarafın flörtü seni bekletmez
    const mine = await one(c, `SELECT max(created_at) AS at FROM social_log WHERE actor_id = $1 AND target_id = $2 AND kind = 'flirt'`, [actor, other]);
    if (nextAt(mine?.at ?? null, FLIRT_COOLDOWN_HOURS)) fail('cooldown', 409);
    if (rel.friendship < FLIRT_MIN_FRIENDSHIP) fail('need_friendship');
    const p1 = await partnerOf(c, actor);
    const p2 = await partnerOf(c, other);
    if ((p1 && p1 !== other) || (p2 && p2 !== actor)) fail('taken', 409);
    const theyFlirted = meFirst ? rel.flirted_b : rel.flirted_a;
    const cap = theyFlirted ? 100 : ONE_SIDED_ROMANCE_CAP;
    const gain = flirtGain(rel.romance, lv(me.skills, 'seduction')) * skillMult(me.skills, 'romance') * socialAttrMult(me.attributes);
    const romance = Math.min(cap, Math.max(rel.romance, clamp(rel.romance + gain, 0, 100)));
    await c.query(
      `UPDATE relationships SET romance = $3::real, last_flirt = now(), ${meFirst ? 'flirted_a' : 'flirted_b'} = TRUE,
              stage = CASE WHEN stage = 'none' AND $3::real >= $4::real THEN 'dating' ELSE stage END, updated_at = now()
        WHERE a_id = $1 AND b_id = $2`,
      [rel.a_id, rel.b_id, romance, DATING_ROMANCE],
    );
    const skills = { ...me.skills };
    bumpSkill(skills, 'seduction', 0.3);
    await c.query('UPDATE characters SET skills = $2 WHERE id = $1', [me.id, JSON.stringify(skills)]);
    await c.query(`INSERT INTO social_log(actor_id, target_id, kind) VALUES ($1, $2, 'flirt')`, [actor, other]);
    await notify(c, other, 'flirt', { fromId: actor, from: me.name });
    return { romance: Math.round(romance), mutual: !!theyFlirted };
  });
}

// ---------- Randevu (restoranda) ----------

export async function date(actor: number, other: number, locationId: string) {
  return tx(async (c) => {
    const { rel, me, them } = await lockPair(c, actor, other);
    const loc = LOCATION_BY_ID[locationId];
    if (!loc || loc.type !== 'restaurant') fail('invalid_location');
    if (loc!.cityId !== me.city_id) fail('not_in_city');
    if (isJailed(me) || isJailed(them)) fail('in_jail', 409);
    if (nextAt(rel.last_date, DATE_COOLDOWN_HOURS)) fail('cooldown', 409);
    if (!(rel.flirted_a && rel.flirted_b) || rel.romance < DATE_MIN_ROMANCE) fail('need_romance');
    // Randevuyu davet eden öder: iki kişilik günün yemeği
    const each = await mealPrice(c, locationId, MEAL_BY_ID.daily);
    const cost = each * 2;
    if (me.money < cost) fail('not_enough_money');
    await c.query('UPDATE characters SET money = money - $2, location_id = $3 WHERE id = $1', [me.id, cost, loc!.id]);
    await payBusinessForMeal(c, locationId, cost, me.id);
    const gain = dateGain(rel.romance, lv(me.skills, 'seduction')) * skillMult(me.skills, 'romance') * socialAttrMult(me.attributes);
    const romance = clamp(rel.romance + gain, 0, 100);
    await c.query(
      `UPDATE relationships SET romance = $3::real, friendship = LEAST(100, friendship + 3), last_date = now(),
              stage = CASE WHEN stage = 'none' AND $3::real >= $4::real THEN 'dating' ELSE stage END, updated_at = now()
        WHERE a_id = $1 AND b_id = $2`,
      [rel.a_id, rel.b_id, romance, DATING_ROMANCE],
    );
    await c.query('UPDATE characters SET mood = LEAST(100, mood + 8) WHERE id = ANY($1::bigint[])', [[me.id, them.id]]);
    const skills = { ...me.skills };
    bumpSkill(skills, 'seduction', 0.5);
    await c.query('UPDATE characters SET skills = $2 WHERE id = $1', [me.id, JSON.stringify(skills)]);
    await c.query(`INSERT INTO social_log(actor_id, target_id, kind) VALUES ($1, $2, 'date')`, [actor, other]);
    await notify(c, other, 'date', { fromId: actor, from: me.name, locationId });
    for (const id of [actor, other]) {
      await addMoodlet(c, id, 'romantic_evening');
      await nudgeWellbeing(c, id, { inspiration: INSPIRATION_GAIN.date });
    }
    return { romance: Math.round(romance), cost };
  });
}

// ---------- Evlilik ----------

export async function propose(actor: number, other: number, ringInventoryId: number) {
  return tx(async (c) => {
    const { rel, me } = await lockPair(c, actor, other);
    if (rel.stage !== 'dating') fail('need_dating');
    if (rel.romance < PROPOSE_MIN_ROMANCE) fail('need_romance');
    if (rel.proposal_by) fail('already_proposed', 409);
    if ((await partnerOf(c, actor)) || (await partnerOf(c, other))) fail('taken', 409);
    const ring = await one(c, `SELECT * FROM inventory WHERE id = $1 AND character_id = $2 AND slot = 'ring' AND NOT listed`, [ringInventoryId, actor]);
    if (!ring) fail('need_ring');
    await c.query('UPDATE relationships SET proposal_by = $3, proposal_ring = $4, updated_at = now() WHERE a_id = $1 AND b_id = $2', [
      rel.a_id,
      rel.b_id,
      actor,
      ring.id,
    ]);
    await notify(c, other, 'proposal', { fromId: actor, from: me.name, ring: ring.item_id });
    return { ok: true };
  });
}

export async function answerProposal(viewer: number, other: number, accept: boolean) {
  return tx(async (c) => {
    const rel = await lockRel(c, viewer, other);
    if (Number(rel.proposal_by) !== other) fail('no_proposal', 404);
    const me = await one(c, 'SELECT name FROM characters WHERE id = $1', [viewer]);
    if (accept) {
      if ((await partnerOf(c, viewer)) || (await partnerOf(c, other))) fail('taken', 409);
      // Yüzük el değiştirir: teklif edenden kabul edene geçer
      const ring = await one(c, `SELECT id FROM inventory WHERE id = $1 AND character_id = $2 AND slot = 'ring' AND NOT listed FOR UPDATE`, [rel.proposal_ring, other]);
      if (!ring) fail('ring_missing', 409);
      await c.query('UPDATE inventory SET character_id = $2, listed = FALSE WHERE id = $1', [ring.id, viewer]);
      await c.query(`UPDATE relationships SET stage = 'engaged', proposal_by = NULL, proposal_ring = NULL, updated_at = now() WHERE a_id = $1 AND b_id = $2`, [
        rel.a_id,
        rel.b_id,
      ]);
      await c.query('INSERT INTO partners(character_id, partner_id) VALUES ($1, $2), ($2, $1)', [viewer, other]);
      await notify(c, other, 'proposal_accepted', { fromId: viewer, from: me.name });
      for (const id of [viewer, other]) await addMoodlet(c, id, 'engaged');
    } else {
      await c.query('UPDATE relationships SET proposal_by = NULL, proposal_ring = NULL, updated_at = now() WHERE a_id = $1 AND b_id = $2', [rel.a_id, rel.b_id]);
      await notify(c, other, 'proposal_declined', { fromId: viewer, from: me.name });
    }
    return { ok: true };
  });
}

export async function cancelProposal(viewer: number, other: number) {
  return tx(async (c) => {
    const rel = await lockRel(c, viewer, other);
    if (Number(rel.proposal_by) !== viewer) fail('no_proposal', 404);
    await c.query('UPDATE relationships SET proposal_by = NULL, proposal_ring = NULL WHERE a_id = $1 AND b_id = $2', [rel.a_id, rel.b_id]);
    return { ok: true };
  });
}

export async function wedding(actor: number, other: number, locationId: string) {
  return tx(async (c) => {
    const { rel, me } = await lockPair(c, actor, other);
    const loc = LOCATION_BY_ID[locationId];
    if (!loc || (loc.type !== 'worship' && loc.type !== 'courthouse')) fail('invalid_location');
    if (loc!.cityId !== me.city_id) fail('not_in_city');
    if (rel.stage !== 'engaged') fail('need_engaged');
    const fee = Math.round(WEDDING_FEE * CITY_BY_ID[me.city_id!].costMult);
    if (me.money < fee) fail('not_enough_money');
    await c.query('UPDATE characters SET money = money - $2, location_id = $3 WHERE id = $1', [me.id, fee, loc!.id]);
    await c.query(`UPDATE relationships SET stage = 'married', married_at = now(), updated_at = now() WHERE a_id = $1 AND b_id = $2`, [rel.a_id, rel.b_id]);
    await c.query('UPDATE characters SET mood = 100 WHERE id = ANY($1::bigint[])', [[actor, other]]);
    await notify(c, other, 'wedding', { fromId: actor, from: me.name, locationId });
    await notify(c, actor, 'wedding', { fromId: other, locationId });
    for (const id of [actor, other]) {
      await addMoodlet(c, id, 'newlywed');
      await nudgeWellbeing(c, id, { inspiration: INSPIRATION_GAIN.wedding });
    }
    await evaluateAchievements(c, actor);
    await evaluateAchievements(c, other);
    return { ok: true, fee };
  });
}

/** Nişanı bozmak her yerde olur; evlilik ancak adliyede ve ücretle biter */
export async function breakUp(actor: number, other: number, locationId?: string) {
  return tx(async (c) => {
    const rel = await lockRel(c, actor, other);
    const me = await lockCharacter(c, actor);
    if (rel.stage === 'married') {
      const loc = locationId ? LOCATION_BY_ID[locationId] : null;
      if (!loc || loc.type !== 'courthouse' || loc.cityId !== me.city_id) fail('divorce_at_courthouse');
      const fee = Math.round(DIVORCE_FEE * CITY_BY_ID[me.city_id!].costMult);
      if (me.money < fee) fail('not_enough_money');
      await c.query('UPDATE characters SET money = money - $2 WHERE id = $1', [actor, fee]);
    } else if (rel.stage !== 'engaged' && rel.stage !== 'dating') {
      fail('no_relationship', 404);
    }
    await c.query(
      `UPDATE relationships SET stage = 'none', romance = romance / 2, flirted_a = FALSE, flirted_b = FALSE,
              proposal_by = NULL, proposal_ring = NULL, adoption_by = NULL, married_at = NULL, updated_at = now()
        WHERE a_id = $1 AND b_id = $2`,
      [rel.a_id, rel.b_id],
    );
    await c.query('DELETE FROM partners WHERE character_id IN ($1, $2)', [actor, other]);
    await notify(c, other, rel.stage === 'married' ? 'divorced' : 'broke_up', { fromId: actor, from: me.name });
    for (const id of [actor, other]) await addMoodlet(c, id, rel.stage === 'married' ? 'divorce' : 'heartbreak');
    return { ok: true };
  });
}

// ---------- Evlat edinme ----------

export async function requestAdoption(actor: number, other: number, locationId: string, name: string) {
  const childName = cleanText(name, true);
  if (!CHILD_NAME_RE.test(childName) || containsProfanity(childName)) fail('invalid_name');
  return tx(async (c) => {
    const rel = await lockRel(c, actor, other);
    const me = await lockCharacter(c, actor);
    if (rel.stage !== 'married') fail('need_married');
    // Ek hesapla çocuk çiftliği olmasın
    await requireEstablished(c, actor);
    await requireEstablished(c, other);
    const loc = LOCATION_BY_ID[locationId];
    if (!loc || loc.type !== 'city_hall' || loc.cityId !== me.city_id) fail('invalid_location');
    if (rel.adoption_by) fail('already_requested', 409);
    const n = await one(c, 'SELECT count(*)::int AS n FROM children WHERE (parent_a = $1 AND parent_b = $2) OR (parent_a = $2 AND parent_b = $1)', [actor, other]);
    if (n.n >= MAX_CHILDREN) fail('too_many_children');
    const fee = Math.round(ADOPTION_FEE * CITY_BY_ID[me.city_id!].costMult);
    if (me.money < fee) fail('not_enough_money');
    await c.query('UPDATE relationships SET adoption_by = $3, adoption_name = $4 WHERE a_id = $1 AND b_id = $2', [rel.a_id, rel.b_id, actor, childName]);
    await notify(c, other, 'adoption_request', { fromId: actor, from: me.name, name: childName });
    return { ok: true, fee };
  });
}

export async function answerAdoption(viewer: number, other: number, accept: boolean) {
  return tx(async (c) => {
    const rel = await lockRel(c, viewer, other);
    if (Number(rel.adoption_by) !== other) fail('no_request', 404);
    const requester = await lockCharacter(c, other);
    if (accept) {
      // Ücreti başvuran eş öder (başvuruda ücretin yettiği kontrol edildi; şimdi tekrar)
      const fee = Math.round(ADOPTION_FEE * CITY_BY_ID[requester.city_id ?? 'istanbul'].costMult);
      if (requester.money < fee) fail('partner_cannot_pay');
      await c.query('UPDATE characters SET money = money - $2 WHERE id = $1', [other, fee]);
      await c.query('INSERT INTO children(parent_a, parent_b, name) VALUES ($1, $2, $3)', [other, viewer, rel.adoption_name]);
      await notify(c, other, 'adoption_done', { name: rel.adoption_name });
      await notify(c, viewer, 'adoption_done', { name: rel.adoption_name });
    }
    await c.query('UPDATE relationships SET adoption_by = NULL, adoption_name = NULL WHERE a_id = $1 AND b_id = $2', [rel.a_id, rel.b_id]);
    return { ok: true };
  });
}

/** Dinlenirken eş bonusu: evli ve eş aynı şehirde */
export async function spouseInCity(db: Db, characterId: number, cityId: string | null) {
  if (!cityId) return false;
  const r = await one(
    db,
    `SELECT 1 FROM partners p JOIN characters c ON c.id = p.partner_id
       JOIN relationships r ON r.a_id = LEAST(p.character_id, p.partner_id) AND r.b_id = GREATEST(p.character_id, p.partner_id)
      WHERE p.character_id = $1 AND r.stage = 'married' AND c.city_id = $2`,
    [characterId, cityId],
  );
  return !!r;
}

