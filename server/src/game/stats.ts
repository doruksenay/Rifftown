// Oyuncunun ömür boyu istatistikleri: veri odaklı başarımlar, görev zincirleri ve efsane sonrası hedefler
// bu tek fonksiyonu kullanır (bkz. packages/shared/src/content/progress.ts).

import { CITY_BY_ID, type StatId, tierOf } from '@rifftown/shared';
import { type Db, one } from '../db';

export type Stats = Record<StatId, number>;

export async function lifetimeStats(db: Db, characterId: number): Promise<Stats> {
  const r = await one(
    db,
    `WITH g AS (
       SELECT g.* FROM gig_performers gp JOIN gigs g ON g.id = gp.gig_id
        WHERE gp.character_id = $1 AND gp.present AND g.status = 'done'
     ), act AS (
       SELECT kind, count(*)::int AS n, COALESCE(sum((result->>'pay')::int) FILTER (WHERE kind = 'busk'), 0)::int AS busk
         FROM actions WHERE character_id = $1 AND status = 'done' AND NOT (result ? 'cancelled') GROUP BY kind
     ), band AS (SELECT band_id FROM band_members WHERE character_id = $1)
     SELECT
       (SELECT count(*)::int FROM g) AS gigs,
       (SELECT count(DISTINCT city_id)::int FROM g) AS cities_played,
       (SELECT COALESCE(array_agg(DISTINCT city_id), '{}') FROM g) AS city_ids,
       (SELECT count(*)::int FROM g WHERE (result->>'quality')::int >= 90) AS epic_gigs,
       (SELECT count(*)::int FROM g WHERE legendary) AS legendary_gigs,
       (SELECT count(*)::int FROM g WHERE festival_id IS NOT NULL) AS festival_gigs,
       (SELECT count(*)::int FROM g WHERE location_id LIKE '%-stadium') AS stadium_gigs,
       (SELECT count(*)::int FROM g, jsonb_array_elements(COALESCE(g.result->'events', '[]'::jsonb)) e WHERE e->>'outcome' = 'success') AS stage_events,
       (SELECT count(*)::int FROM g WHERE g.result->>'encore' = 'success') AS encores,
       (SELECT count(*)::int FROM songs WHERE author_id = $1) AS songs,
       (SELECT COALESCE(max(quality), 0) FROM songs WHERE author_id = $1) AS best_song,
       (SELECT skills FROM characters WHERE id = $1) AS skills,
       (SELECT COALESCE(sum(n) FILTER (WHERE kind = 'record'), 0)::int FROM act) AS recordings,
       (SELECT COALESCE(sum(n) FILTER (WHERE kind = 'travel'), 0)::int FROM act) AS travels,
       (SELECT COALESCE(sum(n) FILTER (WHERE kind = 'work'), 0)::int FROM act) AS shifts,
       (SELECT COALESCE(sum(n) FILTER (WHERE kind = 'busk'), 0)::int FROM act) AS busks,
       (SELECT COALESCE(sum(busk), 0)::int FROM act) AS busk_earnings,
       (SELECT count(*)::int FROM actions WHERE character_id = $1 AND kind = 'craft' AND status = 'done' AND result ? 'itemId') AS crafts,
       (SELECT COALESCE(sum(n) FILTER (WHERE kind = 'workout'), 0)::int FROM act) AS workouts,
       (SELECT count(*)::int FROM meals WHERE character_id = $1) AS meals,
       (SELECT count(*)::int FROM social_log WHERE actor_id = $1 AND kind = 'hangout') AS hangouts,
       (SELECT count(*)::int FROM social_log WHERE actor_id = $1 AND kind = 'date') AS dates,
       (SELECT count(*)::int FROM social_log WHERE actor_id = $1 AND kind = 'gift') AS gifts,
       (SELECT count(*)::int FROM trades WHERE (from_id = $1 OR to_id = $1) AND status = 'accepted') AS trades,
       (SELECT count(*)::int FROM tattoos WHERE character_id = $1) AS tattoos,
       (SELECT count(*)::int FROM relationships WHERE (a_id = $1 OR b_id = $1) AND friends) AS friends,
       (SELECT count(*)::int FROM relationships WHERE (a_id = $1 OR b_id = $1) AND stage = 'married') AS married,
       (SELECT count(*)::int FROM releases WHERE band_id IN (SELECT band_id FROM band) AND kind = 'single') AS singles,
       (SELECT count(*)::int FROM releases WHERE band_id IN (SELECT band_id FROM band) AND kind = 'album') AS albums,
       (SELECT COALESCE(max(total_units), 0)::int FROM releases WHERE band_id IN (SELECT band_id FROM band)) AS best_units,
       (SELECT count(*)::int FROM chart_entries e JOIN releases rl ON rl.id = e.release_id
         WHERE rl.band_id IN (SELECT band_id FROM band) AND e.position = 1 AND e.scope <> 'world') AS chart_no1_weeks,
       (SELECT COALESCE(max(fame), 0) FROM band_fame WHERE band_id IN (SELECT band_id FROM band)) AS max_fame,
       (SELECT COALESCE(array_agg(fame), '{}') FROM band_fame WHERE band_id IN (SELECT band_id FROM band)) AS fames,
       (SELECT count(*)::int FROM articles WHERE author_id = $1 AND kind = 'news' AND NOT removed) AS articles,
       (SELECT count(*)::int FROM press_events WHERE character_id = $1) AS interviews,
       (SELECT count(*)::int FROM music_videos WHERE band_id IN (SELECT band_id FROM band)) AS videos,
       (SELECT COALESCE(sum(radio_plays), 0)::int FROM releases WHERE band_id IN (SELECT band_id FROM band)) AS radio_plays,
       (SELECT count(*)::int FROM tours WHERE band_id IN (SELECT band_id FROM band) AND status = 'done') AS tours_done,
       (SELECT count(*)::int FROM item_uses WHERE character_id = $1) AS items_used`,
    [characterId],
  );
  const skills = Object.values((r?.skills ?? {}) as Record<string, number>);
  const fames = ((r?.fames ?? []) as number[]).map(Number);
  const countries = new Set(((r?.city_ids ?? []) as string[]).map((id) => CITY_BY_ID[id]?.countryCode).filter(Boolean));
  const n = (k: string) => Number(r?.[k] ?? 0);
  return {
    gigs: n('gigs'),
    songs: n('songs'),
    best_song: n('best_song'),
    skills_known: skills.length,
    max_skill: skills.length ? Math.max(...skills) : 0,
    countries: countries.size,
    cities_played: n('cities_played'),
    recordings: n('recordings'),
    travels: n('travels'),
    shifts: n('shifts'),
    busks: n('busks'),
    busk_earnings: n('busk_earnings'),
    crafts: n('crafts'),
    meals: n('meals'),
    workouts: n('workouts'),
    hangouts: n('hangouts'),
    dates: n('dates'),
    gifts: n('gifts'),
    trades: n('trades'),
    tattoos: n('tattoos'),
    singles: n('singles'),
    albums: n('albums'),
    best_units: n('best_units'),
    chart_no1_weeks: n('chart_no1_weeks'),
    superstar_cities: fames.filter((f) => tierOf('fame', f).index >= 5).length,
    local_star_cities: fames.filter((f) => tierOf('fame', f).index >= 3).length,
    max_fame: n('max_fame'),
    epic_gigs: n('epic_gigs'),
    legendary_gigs: n('legendary_gigs'),
    festival_gigs: n('festival_gigs'),
    stadium_gigs: n('stadium_gigs'),
    friends: n('friends'),
    married: n('married'),
    stage_events: n('stage_events'),
    encores: n('encores'),
    articles: n('articles'),
    interviews: n('interviews'),
    videos: n('videos'),
    radio_plays: n('radio_plays'),
    tours_done: n('tours_done'),
    items_used: n('items_used'),
  };
}
