// Turne ekibi, moral, araç arızası, ekipman yıpranması, tamir ve turne planı (kurallar: packages/shared/src/touring.ts).

import {
  BREAKDOWN_DELAY,
  CITY_BY_ID,
  CREW,
  CREW_EFFECTS,
  CREW_MORALE,
  CREW_ROLES,
  type CrewRole,
  GIG_GEAR_WEAR,
  INSTRUMENTS,
  ITEM_BY_ID,
  REPAIR,
  TOUR_FAME_BONUS,
  TOUR_MAX_CITIES,
  TOUR_MAX_DAYS,
  TOUR_MIN_CITIES,
  TOUR_MORALE_BONUS,
  VEHICLE_WEAR_PER_100KM,
  breakdownChance,
  containsProfanity,
  crewEffectScale,
  crewFees,
  distanceKm,
  gameHoursToMs,
  logisticsMoraleMult,
  logisticsWearMult,
  lv,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { type CharacterRow, lockCharacter, membership, notify } from './common';
import { addFame } from './gigs';
import { cleanText } from './social';

const hoursMs = (h: number) => gameHoursToMs(h, config.gameSpeed);

// ---------- Ekip ----------

export async function crewOf(db: Db, bandId: number) {
  const rows = await many(db, 'SELECT role FROM band_crew WHERE band_id = $1', [bandId]);
  const band = await one(db, 'SELECT crew_morale FROM bands WHERE id = $1', [bandId]);
  return { roles: rows.map((r) => r.role as CrewRole), morale: Number(band?.crew_morale ?? CREW_MORALE.start) };
}

async function leaderBand(c: Db, characterId: number) {
  const m = await membership(c, characterId);
  if (!m) fail('no_band');
  if (m!.leader_id !== characterId) fail('not_leader', 403);
  return m!;
}

export async function hireCrew(characterId: number, role: CrewRole) {
  if (!(CREW_ROLES as readonly string[]).includes(role)) fail('invalid_role');
  return tx(async (c) => {
    await lockCharacter(c, characterId);
    const m = await leaderBand(c, characterId);
    await c.query('INSERT INTO band_crew(band_id, role) VALUES ($1, $2) ON CONFLICT DO NOTHING', [m.band_id, role]);
    return crewOf(c, m.band_id);
  });
}

export async function fireCrew(characterId: number, role: CrewRole) {
  return tx(async (c) => {
    const m = await leaderBand(c, characterId);
    await c.query('DELETE FROM band_crew WHERE band_id = $1 AND role = $2', [m.band_id, role]);
    return crewOf(c, m.band_id);
  });
}

/** Konser için ekip etkileri; ücret bilet gelirinden ödenir (gigs.ts) */
/** perks: grubun en iyi muhasebe (ücret) ve sahnedekilerin en iyi lojistik (moral, yıpranma) becerisi */
export async function crewForGig(db: Db, bandId: number, cityId: string, perks: { accounting?: number; logistics?: number } = {}) {
  const { roles, morale } = await crewOf(db, bandId);
  const has = new Set(roles);
  const k = crewEffectScale(morale);
  const logi = perks.logistics ?? 0;
  return {
    roles,
    morale,
    fee: crewFees(roles, CITY_BY_ID[cityId]?.costMult ?? 1, perks.accounting ?? 0),
    qualityBonus: k * ((has.has('sound_tech') ? CREW_EFFECTS.soundQuality : 0) + (has.has('light_tech') ? CREW_EFFECTS.lightQuality : 0)),
    attendanceMult: 1 + k * (has.has('promoter') ? CREW_EFFECTS.promoterAttendance : 0),
    energySaved: k * (has.has('assistant') ? CREW_EFFECTS.assistantEnergy : 0),
    // Lojistik ekip olmasa da işe yarar: enstrümanlar düzgün paketlenir
    wearMult: (has.has('loader') && k > 0 ? CREW_EFFECTS.loaderWear : 1) * logisticsWearMult(logi),
    moraleLoss: CREW_MORALE.perGig * (has.has('tour_manager') ? CREW_EFFECTS.managerMorale : 1) * logisticsMoraleMult(logi),
  };
}

/** Konserden sonra: moral, ücret ödenemezse ekip dağılmaya başlar */
export async function afterGigCrew(c: pg.PoolClient, bandId: number, paid: boolean, quality: number, moraleLoss: number) {
  const delta = paid ? moraleLoss + (quality >= 60 ? CREW_MORALE.goodGig : 0) : CREW_MORALE.unpaid;
  const r = await one(
    c,
    `UPDATE bands SET crew_morale = GREATEST(0, LEAST(100, crew_morale + $2::real)), crew_morale_at = now() WHERE id = $1 RETURNING crew_morale`,
    [bandId, delta],
  );
  if (r && Number(r.crew_morale) < CREW_MORALE.quitBelow) {
    const quit = await many(c, 'DELETE FROM band_crew WHERE band_id = $1 RETURNING role', [bandId]);
    if (quit.length) {
      await c.query('UPDATE bands SET crew_morale = $2 WHERE id = $1', [bandId, CREW_MORALE.start]);
      for (const m of await many(c, 'SELECT character_id FROM band_members WHERE band_id = $1', [bandId])) {
        await notify(c, Number(m.character_id), 'crew_quit', { roles: quit.map((q) => q.role) });
      }
    }
  }
}

/** Zamanlayıcı: konser olmayan günlerde moral toparlanır */
export async function processCrewMorale(): Promise<number> {
  const r = await pool.query(
    `UPDATE bands SET crew_morale = LEAST($1::real, crew_morale + $2::real * extract(epoch FROM (now() - crew_morale_at)) * 1000 / $3), crew_morale_at = now()
      WHERE crew_morale < $1 AND crew_morale_at < now() - ($3::double precision * interval '1 millisecond')
        AND EXISTS (SELECT 1 FROM band_crew WHERE band_id = bands.id)`,
    [CREW_MORALE.start + 20, CREW_MORALE.restPerDay, hoursMs(24)],
  );
  return r.rowCount ?? 0;
}

// ---------- Ekipman yıpranması ve tamir ----------

/** Konserde sahnedeki üyelerin kuşandığı enstrüman yıpranır */
export async function wearGigGear(c: Db, characterIds: number[], roles: string[], wearMult: number) {
  for (const [i, id] of characterIds.entries()) {
    await c.query(
      `UPDATE inventory SET wear = LEAST(100, wear + $3::real) WHERE character_id = $1 AND slot = $2 AND equipped AND NOT listed`,
      [id, roles[i], GIG_GEAR_WEAR * wearMult],
    );
  }
}

/** Tamir kitiyle tek eşya ya da bakım paketiyle bütün kuşanılmış ekipman onarılır */
export async function repairGear(characterId: number, kitInventoryId: number, targetInventoryId?: number) {
  return tx(async (c) => {
    await lockCharacter(c, characterId);
    const kit = await one(c, 'SELECT * FROM inventory WHERE id = $1 AND character_id = $2 AND NOT listed FOR UPDATE', [kitInventoryId, characterId]);
    if (!kit || (kit.item_id !== 'repair_kit' && kit.item_id !== 'gear_service')) fail('not_repair_kit');
    let repaired = 0;
    if (kit.item_id === 'gear_service') {
      const r = await c.query('UPDATE inventory SET wear = GREATEST(0, wear - $2) WHERE character_id = $1 AND equipped AND wear > 0', [characterId, REPAIR.serviceWear]);
      repaired = r.rowCount ?? 0;
    } else {
      const t = await one(c, 'SELECT * FROM inventory WHERE id = $1 AND character_id = $2 FOR UPDATE', [targetInventoryId ?? 0, characterId]);
      if (!t) fail('not_found', 404);
      if (Number(t.wear) <= 0) fail('not_worn', 409);
      await c.query('UPDATE inventory SET wear = GREATEST(0, wear - $2) WHERE id = $1', [t.id, REPAIR.kitWear]);
      repaired = 1;
    }
    if (!repaired) fail('not_worn', 409);
    await c.query('DELETE FROM inventory WHERE id = $1', [kit.id]);
    return { repaired };
  });
}

// ---------- Araç arızası (actions.ts yolculukta çağırır) ----------

/**
 * Kendi aracıyla yolculuk başlarken arıza zarı atılır: arıza yolculuğu uzatır, tamir kiti varsa az uzatır ve kit harcanır.
 * Araç yıpranır. Turne ekibinde şoför varsa arıza şansı yarıya iner.
 */
export async function rollBreakdown(c: pg.PoolClient, ch: CharacterRow, from: string, to: string, hours: number, rand = Math.random) {
  const vehicle = await one(c, `SELECT id, wear FROM inventory WHERE character_id = $1 AND slot = 'vehicle' AND equipped AND NOT listed FOR UPDATE`, [ch.id]);
  if (!vehicle) return { hours, breakdown: false };
  const km = distanceKm(CITY_BY_ID[from], CITY_BY_ID[to]);
  const m = await membership(c, ch.id);
  const hasDriver = m ? !!(await one(c, `SELECT 1 FROM band_crew WHERE band_id = $1 AND role = 'driver'`, [m.band_id])) : false;
  const chance = breakdownChance(Number(vehicle.wear), lv(ch.skills, 'driving'), lv(ch.skills, 'mechanics'), hasDriver);
  await c.query('UPDATE inventory SET wear = LEAST(100, wear + $2::real) WHERE id = $1', [vehicle.id, (km / 100) * VEHICLE_WEAR_PER_100KM]);
  if (rand() >= chance) return { hours, breakdown: false };
  const kit = await one(c, `SELECT id FROM inventory WHERE character_id = $1 AND item_id = 'repair_kit' AND NOT listed ORDER BY id LIMIT 1 FOR UPDATE`, [ch.id]);
  if (kit) await c.query('DELETE FROM inventory WHERE id = $1', [kit.id]);
  const delay = kit ? BREAKDOWN_DELAY.withKit : BREAKDOWN_DELAY.withoutKit;
  return { hours: Math.round(hours * (1 + delay) * 10) / 10, breakdown: true, usedKit: !!kit };
}

// ---------- Turne planı ----------

export async function startTour(characterId: number, body: { name: string; cityIds: string[]; days: number }) {
  const name = cleanText(body.name ?? '', true);
  if (name.length < 2 || name.length > 40 || containsProfanity(name)) fail('invalid_name');
  const cities = [...new Set(body.cityIds)];
  if (cities.length < TOUR_MIN_CITIES || cities.length > TOUR_MAX_CITIES || cities.some((x) => !CITY_BY_ID[x])) fail('invalid_cities');
  if (!Number.isInteger(body.days) || body.days < 3 || body.days > TOUR_MAX_DAYS) fail('invalid_days');
  return tx(async (c) => {
    await lockCharacter(c, characterId);
    const m = await leaderBand(c, characterId);
    if (await one(c, `SELECT 1 FROM tours WHERE band_id = $1 AND status = 'active'`, [m.band_id])) fail('tour_active', 409);
    const t = await one(c, `INSERT INTO tours(band_id, name, city_ids, ends_at) VALUES ($1, $2, $3, $4) RETURNING id, ends_at`, [
      m.band_id,
      name,
      cities,
      new Date(Date.now() + hoursMs(body.days * 24)),
    ]);
    return { id: Number(t.id), endsAt: t.ends_at.toISOString() };
  });
}

/** Zamanlayıcı: süresi biten turneler. Turne şehirlerinin hepsinde turne süresinde konser verildiyse tamamlanır. */
export async function processTours(): Promise<number> {
  let n = 0;
  for (;;) {
    const done = await tx(async (c) => {
      const t = await one(c, `SELECT * FROM tours WHERE status = 'active' AND ends_at <= now() ORDER BY ends_at LIMIT 1 FOR UPDATE SKIP LOCKED`);
      if (!t) return false;
      const played = await many(
        c,
        `SELECT DISTINCT city_id FROM gigs WHERE band_id = $1 AND status = 'done' AND starts_at BETWEEN $2 AND $3 AND city_id = ANY($4::text[])
            AND (result->>'presentCount')::int > 0`,
        [t.band_id, t.starts_at, t.ends_at, t.city_ids],
      );
      const ok = played.length === t.city_ids.length;
      await c.query(`UPDATE tours SET status = $2, result = $3 WHERE id = $1`, [t.id, ok ? 'done' : 'failed', JSON.stringify({ played: played.map((p) => p.city_id) })]);
      if (ok) {
        for (const city of t.city_ids as string[]) await addFame(c, t.band_id, city, TOUR_FAME_BONUS);
        await c.query('UPDATE bands SET crew_morale = LEAST(100, crew_morale + $2) WHERE id = $1', [t.band_id, TOUR_MORALE_BONUS]);
      }
      for (const m of await many(c, 'SELECT character_id FROM band_members WHERE band_id = $1', [t.band_id])) {
        await notify(c, Number(m.character_id), ok ? 'tour_done' : 'tour_failed', { tourId: Number(t.id), name: t.name, played: played.length, total: t.city_ids.length });
      }
      return true;
    });
    if (!done) break;
    n++;
  }
  return n;
}

export async function tourView(db: Db, bandId: number) {
  const active = await one(db, `SELECT * FROM tours WHERE band_id = $1 AND status = 'active'`, [bandId]);
  const crew = await crewOf(db, bandId);
  let played: string[] = [];
  if (active) {
    played = (
      await many(db, `SELECT DISTINCT city_id FROM gigs WHERE band_id = $1 AND status = 'done' AND starts_at >= $2 AND city_id = ANY($3::text[])`, [
        bandId,
        active.starts_at,
        active.city_ids,
      ])
    ).map((r) => r.city_id);
  }
  return {
    crew: crew.roles,
    morale: crew.morale,
    crewFeeHint: CREW_ROLES.map((r) => ({ role: r, fee: CREW[r].fee })),
    tour: active ? { id: Number(active.id), name: active.name, cityIds: active.city_ids, endsAt: active.ends_at.toISOString(), played } : null,
    toursDone: Number((await one(db, `SELECT count(*)::int AS n FROM tours WHERE band_id = $1 AND status = 'done'`, [bandId]))?.n ?? 0),
  };
}

export const itemWearable = (itemId: string) => {
  const s = ITEM_BY_ID[itemId]?.slot;
  return s === 'vehicle' || (INSTRUMENTS as readonly string[]).includes(s ?? '');
};
