// Festivaller: zamanlayıcı her ülke için sıradaki festivali açar, başvuru kapanınca en ünlü grupları seçer
// ve festival sahnesine konserlerini ayarlar. Konserler normal konser gibi sonuçlanır.

import {
  CITIES,
  CITY_BY_ID,
  FESTIVAL_APPLY_DAYS,
  FESTIVAL_CITIES,
  FESTIVAL_EVERY_DAYS,
  FESTIVAL_LEAD_HOURS,
  FESTIVAL_MIN_FAME,
  FESTIVAL_SETLIST,
  FESTIVAL_SLOTS,
  FESTIVAL_SLOT_HOURS,
  type FestivalDto,
  CORE_ROLES,
  gameHoursToMs,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { membership, notify } from './common';

const hoursMs = (h: number) => gameHoursToMs(h, config.gameSpeed);
const countryOf = (cityId: string) => CITY_BY_ID[cityId]?.countryCode;

export async function festivalView(db: Db, festivalId: number, viewer: number): Promise<FestivalDto> {
  const f = await one(db, 'SELECT * FROM festivals WHERE id = $1', [festivalId]);
  if (!f) fail('not_found', 404);
  const lineup = await many(
    db,
    `SELECT a.band_id, a.selected, a.slot, b.name, (b.npc_key IS NOT NULL) AS npc,
            COALESCE((SELECT fame FROM band_fame WHERE band_id = a.band_id AND city_id = $2), 0) AS fame
       FROM festival_applications a JOIN bands b ON b.id = a.band_id
      WHERE a.festival_id = $1 ORDER BY a.selected DESC, a.slot NULLS LAST, fame DESC`,
    [festivalId, f.city_id],
  );
  const m = await membership(db, viewer);
  return {
    id: Number(f.id),
    countryCode: f.country_code,
    cityId: f.city_id,
    applyUntil: f.apply_until.toISOString(),
    startsAt: f.starts_at.toISOString(),
    status: f.status,
    lineup: lineup.map((r) => ({
      bandId: Number(r.band_id),
      bandName: r.name,
      fame: Math.round(r.fame * 10) / 10,
      selected: r.selected,
      slot: r.slot,
      npc: r.npc,
    })),
    myBandApplied: !!m && lineup.some((r) => Number(r.band_id) === m.band_id),
  };
}

/** Bir ülkenin sıradaki (ya da süren) festivali */
export async function currentFestival(db: Db, countryCode: string) {
  return one(db, `SELECT * FROM festivals WHERE country_code = $1 AND status <> 'done' ORDER BY id DESC LIMIT 1`, [countryCode]);
}

export async function applyToFestival(characterId: number, festivalId: number) {
  return tx(async (c) => {
    const f = await one(c, 'SELECT * FROM festivals WHERE id = $1 FOR UPDATE', [festivalId]);
    if (!f) fail('not_found', 404);
    if (f.status !== 'open' || f.apply_until.getTime() <= Date.now()) fail('applications_closed', 409);
    const m = await membership(c, characterId);
    if (!m) fail('no_band');
    if (m!.leader_id !== characterId) fail('not_leader', 403);
    const fame = await one(c, 'SELECT fame FROM band_fame WHERE band_id = $1 AND city_id = $2', [m!.band_id, f.city_id]);
    if ((fame?.fame ?? 0) < FESTIVAL_MIN_FAME) fail('not_famous_enough');
    const r = await c.query('INSERT INTO festival_applications(festival_id, band_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [festivalId, m!.band_id]);
    if (!r.rowCount) fail('already_applied', 409);
    return { ok: true };
  });
}

/** Zamanlayıcı: festivalleri açar, seçer ve kapatır */
export async function processFestivals(rand: () => number = Math.random): Promise<number> {
  let acts = 0;
  for (const [country, { cityId }] of Object.entries(FESTIVAL_CITIES)) {
    acts += await tx(async (c) => {
      await c.query('SELECT pg_advisory_xact_lock(724100, $1)', [country.charCodeAt(0) * 256 + country.charCodeAt(1)]);
      let f = await currentFestival(c, country);
      if (!f) {
        // Son festivalden FESTIVAL_EVERY_DAYS sonra yenisi; ilk festival hemen başvuruya açılır
        const last = await one(c, `SELECT starts_at FROM festivals WHERE country_code = $1 ORDER BY id DESC LIMIT 1`, [country]);
        const openAt = last ? last.starts_at.getTime() + hoursMs(FESTIVAL_EVERY_DAYS * 24) - hoursMs(FESTIVAL_APPLY_DAYS * 24 + FESTIVAL_LEAD_HOURS) : Date.now();
        if (openAt > Date.now()) return 0;
        const applyUntil = new Date(Date.now() + hoursMs(FESTIVAL_APPLY_DAYS * 24));
        const startsAt = new Date(applyUntil.getTime() + hoursMs(FESTIVAL_LEAD_HOURS));
        f = await one(c, 'INSERT INTO festivals(country_code, city_id, apply_until, starts_at) VALUES ($1, $2, $3, $4) RETURNING *', [
          country,
          cityId,
          applyUntil,
          startsAt,
        ]);
        return 1;
      }
      if (f.status === 'open') {
        await npcApplications(c, f);
        if (f.apply_until.getTime() > Date.now()) return 0;
        await selectLineup(c, f, rand);
        return 1;
      }
      if (f.status === 'scheduled') {
        const pending = await one(c, `SELECT 1 FROM gigs WHERE festival_id = $1 AND status = 'scheduled'`, [f.id]);
        if (!pending && f.starts_at.getTime() <= Date.now()) {
          await c.query(`UPDATE festivals SET status = 'done' WHERE id = $1`, [f.id]);
          return 1;
        }
      }
      return 0;
    });
  }
  return acts;
}

/** Oyunun kendi grupları kendi ülkelerindeki festivale başvurur (şöhretleri yetiyorsa) */
async function npcApplications(c: pg.PoolClient, f: any) {
  const cities = CITIES.filter((x) => x.countryCode === f.country_code).map((x) => x.id);
  const bands = await many(
    c,
    `SELECT b.id FROM bands b JOIN characters ch ON ch.id = b.leader_id
      WHERE b.npc_key IS NOT NULL AND ch.city_id = ANY($1::text[])
        AND COALESCE((SELECT fame FROM band_fame WHERE band_id = b.id AND city_id = $2), 0) >= $3`,
    [cities, f.city_id, FESTIVAL_MIN_FAME],
  );
  for (const b of bands) await c.query('INSERT INTO festival_applications(festival_id, band_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [f.id, b.id]);
}

async function selectLineup(c: pg.PoolClient, f: any, rand: () => number) {
  const apps = await many(
    c,
    `SELECT a.band_id, COALESCE((SELECT fame FROM band_fame WHERE band_id = a.band_id AND city_id = $2), 0) AS fame
       FROM festival_applications a WHERE a.festival_id = $1 ORDER BY fame DESC, a.created_at LIMIT $3`,
    [f.id, f.city_id, FESTIVAL_SLOTS],
  );
  // En az ünlü önce, en ünlü en son çıkar
  const order = [...apps].reverse();
  for (const [i, a] of order.entries()) {
    const songs = await many(
      c,
      'SELECT s.id FROM band_songs bs JOIN songs s ON s.id = bs.song_id WHERE bs.band_id = $1 ORDER BY s.quality DESC LIMIT $2',
      [a.band_id, FESTIVAL_SETLIST],
    );
    await c.query('UPDATE festival_applications SET selected = TRUE, slot = $3 WHERE festival_id = $1 AND band_id = $2', [f.id, a.band_id, i + 1]);
    if (!songs.length) continue;
    const roles = await many(c, 'SELECT role FROM band_members WHERE band_id = $1', [a.band_id]);
    // Eksik kalan temel roller kiralık müzisyenle dolar (saksofon, keman ve perküsyon isteğe bağlıdır)
    const missing = CORE_ROLES.filter((r) => !roles.some((x) => x.role === r));
    const startsAt = new Date(f.starts_at.getTime() + hoursMs(i * FESTIVAL_SLOT_HOURS));
    await c.query(
      `INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist, session_roles, festival_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [a.band_id, f.city_id, `${f.city_id}-festival`, startsAt, songs.map((s) => s.id), missing, f.id],
    );
    const members = await many(c, 'SELECT character_id FROM band_members WHERE band_id = $1', [a.band_id]);
    for (const m of members) {
      await notify(c, Number(m.character_id), 'festival_selected', { festivalId: Number(f.id), cityId: f.city_id, startsAt: startsAt.toISOString(), slot: i + 1, slots: order.length });
    }
  }
  await c.query(`UPDATE festivals SET status = 'scheduled' WHERE id = $1`, [f.id]);
  void rand;
}

export async function festivalsList(viewer: number) {
  const rows = await many(pool, `SELECT id FROM festivals WHERE status <> 'done' OR starts_at > now() - interval '30 days' ORDER BY starts_at DESC LIMIT 10`);
  return Promise.all(rows.map((r) => festivalView(pool, Number(r.id), viewer)));
}

export { countryOf };
