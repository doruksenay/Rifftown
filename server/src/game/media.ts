// Müzik klibi ve radyo (kurallar: packages/shared/src/broadcast.ts).
// Klip: süreli eylem 'video' (kayıt stüdyosunda). Klip listesi ve radyo çalınması liste haftası kapanınca hesaplanır.

import {
  CITIES,
  CITY_BY_ID,
  type Genre,
  LOCATION_BY_ID,
  VIDEO_CHART_SIZE,
  VIDEO_COOLDOWN_DAYS,
  VIDEO_DIRECTORS,
  VIDEO_HOURS,
  VIDEO_PRICE,
  type VideoDirector,
  gameHoursToMs,
  lv,
  priceFor,
  radioFame,
  radioPlays,
  videoChartFame,
  videoQuality,
  videoViews,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one } from '../db';
import { fail } from '../errors';
import { type CharacterRow, isJailed, membership, notify } from './common';
import { addFame } from './gigs';

const dayMs = () => gameHoursToMs(24, config.gameSpeed);

// ---------- Klip ----------

export async function prepareVideo(c: pg.PoolClient, ch: CharacterRow, songId: number, locationId: string, director: VideoDirector) {
  const loc = LOCATION_BY_ID[locationId];
  if (!loc || loc.type !== 'recording_studio') fail('invalid_location');
  if (loc!.cityId !== ch.city_id) fail('not_in_city');
  const m = await membership(c, ch.id);
  if (!m) fail('no_band');
  if (m!.leader_id !== ch.id) fail('not_leader', 403);
  const d = VIDEO_DIRECTORS[director];
  if (!d) fail('invalid_director');
  const rec = await one(c, 'SELECT quality FROM recordings WHERE band_id = $1 AND song_id = $2', [m!.band_id, songId]);
  if (!rec) fail('song_not_recorded');
  const recent = await one(c, 'SELECT 1 FROM music_videos WHERE band_id = $1 AND created_at > $2', [m!.band_id, new Date(Date.now() - VIDEO_COOLDOWN_DAYS * dayMs())]);
  if (recent) fail('video_cooldown', 409);
  const city = CITY_BY_ID[loc!.cityId];
  return {
    hours: VIDEO_HOURS,
    cost: priceFor(VIDEO_PRICE, city, 1) + priceFor(d!.fee, city, 1),
    locationId: loc!.id,
    params: { songId, bandId: m!.band_id, director },
  };
}

export async function resolveVideo(c: pg.PoolClient, ch: CharacterRow, params: Record<string, any>, rand = Math.random) {
  const m = await membership(c, ch.id);
  if (!m || m.band_id !== params.bandId) return { cancelled: true };
  const rec = await one(c, 'SELECT quality FROM recordings WHERE band_id = $1 AND song_id = $2', [m.band_id, params.songId]);
  if (!rec) return { cancelled: true };
  // Yönetmenlik: tutulan yönetmen ya da gruptaki en iyi yönetmen; oyunculuk: şehirdeki üyelerin ortalaması
  const members = await many(c, `SELECT c.id, c.skills, c.city_id, c.jailed_until FROM band_members bm JOIN characters c ON c.id = bm.character_id WHERE bm.band_id = $1`, [m.band_id]);
  const here = members.filter((x) => x.city_id === ch.city_id && !isJailed(x));
  const own = Math.max(0, ...here.map((x) => lv(x.skills, 'film_directing')));
  const hired = VIDEO_DIRECTORS[params.director as VideoDirector]?.skill ?? 0;
  const directing = Math.max(own, hired);
  const acting = here.length ? here.reduce((s, x) => s + lv(x.skills, 'acting'), 0) / here.length : 0;
  const quality = videoQuality(rec.quality, directing, acting, rand);
  const v = await one(c, 'INSERT INTO music_videos(band_id, song_id, quality, director, directed_by) VALUES ($1, $2, $3, $4, $5) RETURNING id', [
    m.band_id,
    params.songId,
    quality,
    params.director,
    own >= hired ? (here.find((x) => lv(x.skills, 'film_directing') === own)?.id ?? null) : null,
  ]);
  for (const x of here) {
    for (const [id, amount] of [['acting', 0.5], ['film_directing', 0.5]] as const) {
      if (typeof x.skills[id] === 'number' && x.id === ch.id) ch.skills[id] = Math.min(100, ch.skills[id] + amount * (1 - ch.skills[id] / 110));
    }
  }
  return { videoId: Number(v.id), quality, songId: params.songId };
}

// ---------- Liste haftasında: radyo ve klip listesi ----------

/** music.ts closeWeek çağırır: single'ların bu haftaki radyo çalınması (şehir bazlı) ve şöhret etkisi */
export async function weeklyRadio(c: pg.PoolClient, weekId: number, rand: () => number): Promise<Map<number, Map<string, number>>> {
  const singles = await many(
    c,
    `SELECT r.id, r.band_id, r.quality, r.weeks_on_sale, b.genre FROM releases r JOIN bands b ON b.id = r.band_id
      WHERE r.kind = 'single' AND r.weeks_on_sale < 10`,
  );
  const out = new Map<number, Map<string, number>>();
  if (!singles.length) return out;
  const bandIds = [...new Set(singles.map((s) => Number(s.band_id)))];
  const fame = await many(c, 'SELECT band_id, city_id, fame FROM band_fame WHERE band_id = ANY($1::bigint[])', [bandIds]);
  const press = await many(c, 'SELECT band_id, city_id, value FROM band_press WHERE band_id = ANY($1::bigint[])', [bandIds]);
  const fameOf = (b: number, city: string) => Number(fame.find((f) => Number(f.band_id) === b && f.city_id === city)?.fame ?? 0);
  const pressOf = (b: number, city: string) => Number(press.find((f) => Number(f.band_id) === b && f.city_id === city)?.value ?? 20);
  const famePerBandCity = new Map<string, number>();
  for (const s of singles) {
    const byCity = new Map<string, number>();
    let total = 0;
    for (const city of CITIES) {
      const plays = radioPlays(s.quality, fameOf(Number(s.band_id), city.id), city.genrePopularity[s.genre as Genre] ?? 1, pressOf(Number(s.band_id), city.id), s.weeks_on_sale, rand);
      if (plays <= 0) continue;
      byCity.set(city.id, plays);
      total += plays;
      await c.query('INSERT INTO radio_plays(release_id, week_id, city_id, plays) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', [s.id, weekId, city.id, plays]);
      const key = `${s.band_id}:${city.id}`;
      famePerBandCity.set(key, (famePerBandCity.get(key) ?? 0) + plays);
    }
    if (total) await c.query('UPDATE releases SET radio_plays = radio_plays + $2 WHERE id = $1', [s.id, total]);
    out.set(Number(s.id), byCity);
  }
  // Şöhret: grup başına şehir başına (birden çok single tavanı aşmasın)
  for (const [key, plays] of famePerBandCity) {
    const [b, city] = key.split(':');
    const f = radioFame(plays);
    if (f > 0) await addFame(c, Number(b), city, f);
  }
  return out;
}

/** Klip listesi: dünya geneli, haftalık izlenme; ilk 20 şöhret getirir */
export async function weeklyVideoChart(c: pg.PoolClient, weekId: number, rand: () => number) {
  const vids = await many(
    c,
    `SELECT v.id, v.band_id, v.quality, v.weeks,
            (SELECT city_id FROM band_fame f WHERE f.band_id = v.band_id ORDER BY fame DESC LIMIT 1) AS top_city,
            (SELECT max(fame) FROM band_fame f WHERE f.band_id = v.band_id) AS fame
       FROM music_videos v WHERE v.weeks < 12 FOR UPDATE OF v`,
  );
  const scored = [];
  for (const v of vids) {
    const p = v.top_city ? Number((await one(c, 'SELECT value FROM band_press WHERE band_id = $1 AND city_id = $2', [v.band_id, v.top_city]))?.value ?? 20) : 20;
    const views = videoViews(v.quality, Number(v.fame ?? 0), p, v.weeks, rand);
    await c.query('UPDATE music_videos SET weeks = weeks + 1, total_views = total_views + $2 WHERE id = $1', [v.id, views]);
    if (views > 0) scored.push({ v, views });
  }
  scored.sort((a, b) => b.views - a.views);
  for (const [i, x] of scored.slice(0, VIDEO_CHART_SIZE).entries()) {
    await c.query('INSERT INTO video_chart(week_id, position, video_id, views) VALUES ($1, $2, $3, $4)', [weekId, i + 1, x.v.id, x.views]);
    if (x.v.top_city) await addFame(c, Number(x.v.band_id), x.v.top_city, videoChartFame(i + 1));
    if (i < 3) {
      for (const m of await many(c, 'SELECT character_id FROM band_members WHERE band_id = $1', [x.v.band_id])) {
        await notify(c, Number(m.character_id), 'video_chart', { videoId: Number(x.v.id), position: i + 1 });
      }
    }
  }
}

/** Klibi olan şarkıların en iyi klip kalitesi (satış etkisi için) */
export async function videoQualityFor(db: Db, bandId: number, songIds: number[]): Promise<number> {
  if (!songIds.length) return 0;
  const r = await one(db, 'SELECT COALESCE(max(quality), 0) AS q FROM music_videos WHERE band_id = $1 AND song_id = ANY($2::bigint[])', [bandId, songIds]);
  return Number(r?.q ?? 0);
}

export async function videoChart(db: Db) {
  const week = await one(db, `SELECT id FROM chart_weeks WHERE status = 'closed' ORDER BY id DESC LIMIT 1`);
  if (!week) return { weekId: null, entries: [] };
  const rows = await many(
    db,
    `SELECT vc.position, vc.views, v.id, v.quality, s.title, b.id AS band_id, b.name AS band_name
       FROM video_chart vc JOIN music_videos v ON v.id = vc.video_id JOIN songs s ON s.id = v.song_id JOIN bands b ON b.id = v.band_id
      WHERE vc.week_id = $1 ORDER BY vc.position`,
    [week.id],
  );
  return {
    weekId: Number(week.id),
    entries: rows.map((r) => ({ position: r.position, views: r.views, videoId: Number(r.id), title: r.title, bandId: Number(r.band_id), bandName: r.band_name })),
  };
}
