// Yayınlar (single / albüm), haftalık satışlar ve listeler.

import {
  BAND_SHARE,
  CHART_SIZE,
  CHART_WEEK_DAYS,
  CITIES,
  type ChartEntryDto,
  type ChartResponse,
  type Genre,
  RELEASE_RULES,
  type ReleaseDto,
  type ReleaseKind,
  type Instrument,
  type Skills,
  chartFameBonus,
  clamp,
  diminishing,
  familiarityCap,
  gameHoursToMs,
  knows,
  lv,
  recordingQuality,
  roleSkill,
  weeklyUnits,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { evaluateMany } from './achievements';
import { type CharacterRow, isJailed, lockCharacter, membership, notify } from './common';
import { addFame } from './gigs';

const weekMs = () => gameHoursToMs(CHART_WEEK_DAYS * 24, config.gameSpeed);
const dayMs = () => gameHoursToMs(24, config.gameSpeed);

// ---------- Kayıt ----------

/**
 * Kayıt eyleminin sonucu. Kaliteyi şarkı, o an aynı şehirdeki (cezaevinde olmayan) grup üyelerinin
 * aşinalığı ve rol becerileri, kaydı yapanın yapımcılık becerisi belirler. Grubun o şarkı için en iyi kaydı saklanır.
 */
export async function resolveRecording(c: pg.PoolClient, char: CharacterRow, params: Record<string, any>, skills: Skills) {
  const m = await membership(c, char.id);
  if (!m || m.band_id !== params.bandId) return { songRemoved: true };
  const song = await one(
    c,
    'SELECT s.id, s.title, s.genre, s.quality FROM band_songs bs JOIN songs s ON s.id = bs.song_id WHERE bs.band_id = $1 AND bs.song_id = $2',
    [m.band_id, params.songId],
  );
  if (!song) return { songRemoved: true };
  const members = await many(
    c,
    `SELECT c.id, c.skills, c.city_id, c.jailed_until, bm.role, f.value AS fam
       FROM band_members bm JOIN characters c ON c.id = bm.character_id
       LEFT JOIN familiarity f ON f.character_id = c.id AND f.song_id = $2
      WHERE bm.band_id = $1`,
    [m.band_id, song.id],
  );
  const here = members.filter((x) => x.city_id === char.city_id && !isJailed(x));
  const players = here.length ? here : members.filter((x) => x.id === char.id);
  const avgFam = players.reduce((s, x) => s + Math.min(x.fam ?? 0, familiarityCap(x.skills, song.genre)), 0) / players.length;
  const avgSkill = players.reduce((s, x) => s + roleSkill(x.skills, x.role as Instrument), 0) / players.length;
  const quality = recordingQuality(song.quality, avgFam, avgSkill, lv(skills, 'production'), Math.random);

  const prev = await one(c, 'SELECT quality FROM recordings WHERE band_id = $1 AND song_id = $2', [m.band_id, song.id]);
  await c.query(
    `INSERT INTO recordings(band_id, song_id, quality, recorded_by) VALUES ($1, $2, $3, $4)
     ON CONFLICT (band_id, song_id) DO UPDATE SET
       quality = GREATEST(recordings.quality, EXCLUDED.quality),
       recorded_by = CASE WHEN EXCLUDED.quality > recordings.quality THEN EXCLUDED.recorded_by ELSE recordings.recorded_by END`,
    [m.band_id, song.id, quality, char.id],
  );
  if (knows(skills, 'production')) skills.production = clamp(skills.production + 0.6 * diminishing(skills.production), 0, 100);
  return {
    songId: song.id,
    title: song.title,
    quality,
    previous: prev?.quality ?? null,
    improved: !prev || quality > prev.quality,
    players: players.length,
  };
}

// ---------- Yayın oluşturma ----------

export async function createRelease(characterId: number, req: { kind: ReleaseKind; title: string; songIds: number[] }) {
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    const m = await membership(c, characterId);
    if (!m) fail('no_band');
    if (m!.leader_id !== characterId) fail('not_leader', 403);
    const rules = RELEASE_RULES[req.kind];
    const title = req.title.trim();
    if (title.length < 1 || title.length > 40) fail('invalid_title');
    const songIds = [...new Set(req.songIds.map(Number))];
    if (songIds.length < rules.minSongs || songIds.length > rules.maxSongs) fail('invalid_tracklist');

    // Grubun bu tür yayınları arasında bekleme süresi
    const last = await one(c, 'SELECT released_at FROM releases WHERE band_id = $1 AND kind = $2 ORDER BY released_at DESC LIMIT 1', [
      m!.band_id,
      req.kind,
    ]);
    if (last && last.released_at.getTime() + rules.cooldownDays * dayMs() > Date.now()) fail('release_cooldown');

    // Şarkı hâlâ grubun repertuvarında ve kaydı olmalı
    const recs = await many(
      c,
      `SELECT rec.song_id, rec.quality FROM recordings rec JOIN band_songs bs ON bs.band_id = rec.band_id AND bs.song_id = rec.song_id
        WHERE rec.band_id = $1 AND rec.song_id = ANY($2::bigint[])`,
      [
      m!.band_id,
      songIds,
    ]);
    if (recs.length !== songIds.length) fail('song_not_recorded');
    if (ch.money < rules.pressingCost) fail('not_enough_money');

    const quality = Math.round(recs.reduce((s, r) => s + r.quality, 0) / recs.length);
    await c.query('UPDATE characters SET money = money - $2 WHERE id = $1', [characterId, rules.pressingCost]);
    const r = await one(
      c,
      `INSERT INTO releases(band_id, kind, title, song_ids, quality) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [m!.band_id, req.kind, title, songIds, quality],
    );
    const members = await many(c, 'SELECT character_id FROM band_members WHERE band_id = $1', [m!.band_id]);
    for (const mem of members) {
      if (mem.character_id !== characterId) await notify(c, mem.character_id, 'release_out', { releaseId: r.id, kind: req.kind, title, bandName: m!.name });
    }
    await evaluateMany(c, members.map((x) => x.character_id));
    return (await releaseDtos(c, [r.id]))[0];
  });
}

export async function nextReleaseAt(db: Db, bandId: number) {
  const out: { single: string | null; album: string | null } = { single: null, album: null };
  for (const kind of ['single', 'album'] as const) {
    const last = await one(db, 'SELECT released_at FROM releases WHERE band_id = $1 AND kind = $2 ORDER BY released_at DESC LIMIT 1', [bandId, kind]);
    if (!last) continue;
    const at = last.released_at.getTime() + RELEASE_RULES[kind].cooldownDays * dayMs();
    if (at > Date.now()) out[kind] = new Date(at).toISOString();
  }
  return out;
}

export async function releaseDtos(db: Db, ids: number[]): Promise<ReleaseDto[]> {
  if (!ids.length) return [];
  const rows = await many(
    db,
    `SELECT r.*, b.name AS band_name,
            (SELECT sum(s.units)::int FROM release_sales s
              WHERE s.release_id = r.id AND s.week_id = (SELECT max(id) FROM chart_weeks WHERE status = 'closed')) AS last_week_units,
            (SELECT min(position) FROM chart_entries e WHERE e.release_id = r.id AND e.scope <> 'world') AS best_position
       FROM releases r JOIN bands b ON b.id = r.band_id
      WHERE r.id = ANY($1::bigint[]) ORDER BY r.released_at DESC`,
    [ids],
  );
  // Şarkıların bu grubun kaydındaki kalitesi
  const songs = await many(
    db,
    `SELECT r.id AS release_id, s.id, s.title, COALESCE(rec.quality, s.quality) AS quality
       FROM releases r CROSS JOIN LATERAL unnest(r.song_ids) AS sid(id)
       JOIN songs s ON s.id = sid.id
       LEFT JOIN recordings rec ON rec.song_id = s.id AND rec.band_id = r.band_id
      WHERE r.id = ANY($1::bigint[])`,
    [ids],
  );
  return rows.map((r) => ({
    id: r.id,
    bandId: r.band_id,
    bandName: r.band_name,
    kind: r.kind,
    title: r.title,
    songs: r.song_ids
      .map((id: number) => songs.find((s) => s.release_id === r.id && s.id === id))
      .filter(Boolean)
      .map((s: any) => ({ id: s.id, title: s.title, quality: s.quality })),
    quality: r.quality,
    releasedAt: r.released_at.toISOString(),
    weeksOnSale: r.weeks_on_sale,
    totalUnits: r.total_units,
    totalRevenue: r.total_revenue,
    lastWeekUnits: r.last_week_units ?? null,
    bestPosition: r.best_position ?? null,
  }));
}

export async function bandReleases(db: Db, bandId: number) {
  const rows = await many(db, 'SELECT id FROM releases WHERE band_id = $1 ORDER BY released_at DESC LIMIT 30', [bandId]);
  return releaseDtos(db, rows.map((r) => r.id));
}

// ---------- Haftalık satış ve listeler ----------

/** Açık liste haftası yoksa başlatır; süresi dolan haftayı kapatıp satışları ve listeleri hesaplar. */
export async function processChartWeeks(rand: () => number = Math.random): Promise<number> {
  await pool.query(
    `INSERT INTO chart_weeks(ends_at) SELECT $1 WHERE NOT EXISTS (SELECT 1 FROM chart_weeks WHERE status = 'open')
     ON CONFLICT DO NOTHING`,
    [new Date(Date.now() + weekMs())],
  );
  let closed = 0;
  for (;;) {
    const done = await tx(async (c) => {
      const week = await one(c, `SELECT * FROM chart_weeks WHERE status = 'open' AND ends_at <= now() FOR UPDATE SKIP LOCKED`);
      if (!week) return false;
      await closeWeek(c, week, rand);
      // Bir sonraki hafta aynı ritimle başlar; sunucu uzun süre kapalı kaldıysa bugünden başlar
      let ends = week.ends_at.getTime() + weekMs();
      if (ends <= Date.now()) ends = Date.now() + weekMs();
      await c.query(`UPDATE chart_weeks SET status = 'closed' WHERE id = $1`, [week.id]);
      await c.query('INSERT INTO chart_weeks(starts_at, ends_at) VALUES ($1, $2)', [week.ends_at, new Date(ends)]);
      return true;
    });
    if (!done) break;
    closed++;
  }
  return closed;
}

async function closeWeek(c: pg.PoolClient, week: any, rand: () => number) {
  const releases = await many(
    c,
    `SELECT r.*, b.genre, b.name AS band_name FROM releases r JOIN bands b ON b.id = r.band_id
      WHERE r.released_at < $1
        AND ((r.kind = 'single' AND r.weeks_on_sale < $2) OR (r.kind = 'album' AND r.weeks_on_sale < $3))
      FOR UPDATE OF r`,
    [week.ends_at, RELEASE_RULES.single.weeks, RELEASE_RULES.album.weeks],
  );
  if (!releases.length) return;

  const fameRows = await many(c, 'SELECT band_id, city_id, fame FROM band_fame WHERE band_id = ANY($1::bigint[])', [
    [...new Set(releases.map((r) => r.band_id))],
  ]);
  const fameOf = (bandId: number, cityId: string) => fameRows.find((f) => f.band_id === bandId && f.city_id === cityId)?.fame ?? 0;

  // Şehir başına satışlar
  const sales = new Map<number, Map<string, number>>(); // release → şehir → adet
  for (const r of releases) {
    const byCity = new Map<string, number>();
    for (const city of CITIES) {
      const units = weeklyUnits(r.kind, r.quality, fameOf(r.band_id, city.id), city.genrePopularity[r.genre as Genre], city, r.weeks_on_sale, rand);
      if (units > 0) byCity.set(city.id, units);
    }
    sales.set(r.id, byCity);
    for (const [cityId, units] of byCity) {
      await c.query('INSERT INTO release_sales(release_id, week_id, city_id, units) VALUES ($1, $2, $3, $4)', [r.id, week.id, cityId, units]);
    }
  }

  // Listeler: her şehir ve dünya için, single ve albüm ayrı
  const best = new Map<number, { position: number; scope: string }>();
  for (const kind of ['single', 'album'] as const) {
    const ofKind = releases.filter((r) => r.kind === kind);
    const scopes: { scope: string; unitsOf: (id: number) => number }[] = [
      ...CITIES.map((city) => ({ scope: city.id, unitsOf: (id: number) => sales.get(id)?.get(city.id) ?? 0 })),
      { scope: 'world', unitsOf: (id: number) => [...(sales.get(id)?.values() ?? [])].reduce((a, b) => a + b, 0) },
    ];
    for (const { scope, unitsOf } of scopes) {
      const ranked = ofKind
        .map((r) => ({ r, units: unitsOf(r.id) }))
        .filter((x) => x.units > 0)
        .sort((a, b) => b.units - a.units || a.r.released_at - b.r.released_at)
        .slice(0, CHART_SIZE);
      for (const [i, x] of ranked.entries()) {
        const position = i + 1;
        await c.query('INSERT INTO chart_entries(week_id, scope, kind, position, release_id, units) VALUES ($1, $2, $3, $4, $5, $6)', [
          week.id, scope, kind, position, x.r.id, x.units,
        ]);
        if (scope !== 'world') {
          await addFame(c, x.r.band_id, scope, chartFameBonus(position, fameOf(x.r.band_id, scope)));
          const prev = best.get(x.r.id);
          if (!prev || position < prev.position) best.set(x.r.id, { position, scope });
        }
      }
    }
  }

  // Gelir ve bildirimler
  const touched: number[] = [];
  for (const r of releases) {
    const units = [...(sales.get(r.id)?.values() ?? [])].reduce((a, b) => a + b, 0);
    const revenue = Math.round(units * RELEASE_RULES[r.kind as ReleaseKind].price * BAND_SHARE);
    await c.query(
      `UPDATE releases SET weeks_on_sale = weeks_on_sale + 1, total_units = total_units + $2, total_revenue = total_revenue + $3 WHERE id = $1`,
      [r.id, units, revenue],
    );
    const members = await many(c, 'SELECT character_id FROM band_members WHERE band_id = $1', [r.band_id]);
    const share = members.length ? Math.floor(revenue / members.length) : 0;
    for (const mem of members) {
      if (share > 0) await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [mem.character_id, share]);
      const b = best.get(r.id);
      await notify(c, mem.character_id, 'sales_report', {
        releaseId: r.id,
        title: r.title,
        kind: r.kind,
        units,
        share,
        position: b?.position ?? null,
        cityId: b?.scope ?? null,
      });
      touched.push(mem.character_id);
    }
  }
  await evaluateMany(c, touched);
}

/** Liste: varsayılan olarak son kapanan hafta. Geçmiş haftalar VIP avantajıdır. */
export async function getChart(scope: string, kind: ReleaseKind, weekId: number | null, isVip: boolean): Promise<ChartResponse> {
  const weeks = await many(pool, `SELECT id, ends_at FROM chart_weeks WHERE status = 'closed' ORDER BY id DESC LIMIT 12`);
  const open = await one(pool, `SELECT ends_at FROM chart_weeks WHERE status = 'open' LIMIT 1`);
  const latest = weeks[0] ?? null;
  const week = weekId ? weeks.find((w) => w.id === weekId) ?? null : latest;
  if (weekId && !week) fail('not_found', 404);
  if (week && latest && week.id !== latest.id && !isVip) fail('vip_required', 403);

  let entries: ChartEntryDto[] = [];
  if (week) {
    const rows = await many(
      pool,
      `SELECT e.position, e.units, e.release_id, r.title, r.band_id, b.name AS band_name,
              (SELECT p.position FROM chart_entries p
                WHERE p.release_id = e.release_id AND p.scope = e.scope AND p.kind = e.kind
                  AND p.week_id = (SELECT max(id) FROM chart_weeks WHERE status = 'closed' AND id < e.week_id)) AS last_position
         FROM chart_entries e JOIN releases r ON r.id = e.release_id JOIN bands b ON b.id = r.band_id
        WHERE e.week_id = $1 AND e.scope = $2 AND e.kind = $3 ORDER BY e.position`,
      [week.id, scope, kind],
    );
    entries = rows.map((r) => ({
      position: r.position,
      releaseId: r.release_id,
      title: r.title,
      bandId: r.band_id,
      bandName: r.band_name,
      units: r.units,
      lastPosition: r.last_position ?? null,
    }));
  }
  return {
    weekId: week?.id ?? null,
    weekEndedAt: week ? week.ends_at.toISOString() : null,
    scope,
    kind,
    entries,
    weeks: (isVip ? weeks : weeks.slice(0, 1)).map((w) => ({ id: w.id, endedAt: w.ends_at.toISOString() })),
    nextWeekEndsAt: open ? open.ends_at.toISOString() : null,
  };
}
