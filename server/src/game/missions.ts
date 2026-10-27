// Haftalık görevler: liste haftasına bağlıdır (her liste haftası yeni görevler).

import { MISSION_BY_ID, type MissionKind, type MissionsResponse, missionsFor } from '@rifftown/shared';
import { type Db, one, pool, tx } from '../db';
import { fail } from '../errors';
import { lockCharacter } from './common';

async function currentWeek(db: Db) {
  return one(db, `SELECT id, starts_at, ends_at FROM chart_weeks WHERE status = 'open' ORDER BY id DESC LIMIT 1`);
}

/** Bir görev türünde haftalık ilerleme */
async function progress(db: Db, characterId: number, kind: MissionKind, since: Date): Promise<number> {
  const doneAction = (k: string, expr: string) =>
    `SELECT COALESCE(${expr}, 0) AS v FROM actions WHERE character_id = $1 AND kind = '${k}' AND status = 'done' AND ends_at >= $2`;
  const q: Record<MissionKind, string> = {
    gigs: `SELECT count(*)::int AS v FROM gig_performers gp JOIN gigs g ON g.id = gp.gig_id
             WHERE gp.character_id = $1 AND gp.present AND g.status = 'done' AND g.starts_at >= $2`,
    songs: `SELECT count(*)::int AS v FROM songs WHERE author_id = $1 AND created_at >= $2`,
    rehearse_hours: doneAction('rehearse', `sum((params->>'hours')::real)`),
    work_hours: doneAction('work', `sum((params->>'hours')::real)`),
    study_hours: doneAction('study', `sum((params->>'hours')::real)`),
    workout_hours: doneAction('workout', `sum((params->>'hours')::real)`),
    busk_earnings: doneAction('busk', `sum((result->>'pay')::int)`),
    travel: doneAction('travel', 'count(*)'),
    crafts: `SELECT count(*)::int AS v FROM actions WHERE character_id = $1 AND kind = 'craft' AND status = 'done' AND ends_at >= $2 AND result ? 'itemId'`,
    records: `SELECT count(*)::int AS v FROM actions WHERE character_id = $1 AND kind = 'record' AND status = 'done' AND ends_at >= $2 AND result ? 'quality'`,
    meals: `SELECT count(*)::int AS v FROM meals WHERE character_id = $1 AND created_at >= $2`,
    hangouts: `SELECT count(*)::int AS v FROM social_log WHERE actor_id = $1 AND kind = 'hangout' AND created_at >= $2`,
    gifts: `SELECT count(*)::int AS v FROM social_log WHERE actor_id = $1 AND kind = 'gift' AND created_at >= $2`,
    items_used: `SELECT count(*)::int AS v FROM item_uses WHERE character_id = $1 AND created_at >= $2`,
    stage_events: `SELECT count(*)::int AS v FROM gig_performers gp JOIN gigs g ON g.id = gp.gig_id,
                     jsonb_array_elements(COALESCE(g.result->'events', '[]'::jsonb)) e
                    WHERE gp.character_id = $1 AND gp.present AND g.status = 'done' AND g.starts_at >= $2 AND e->>'outcome' = 'success'`,
    encores: `SELECT count(*)::int AS v FROM gig_performers gp JOIN gigs g ON g.id = gp.gig_id
               WHERE gp.character_id = $1 AND gp.present AND g.status = 'done' AND g.starts_at >= $2 AND g.result->>'encore' = 'success'`,
    press: `SELECT count(*)::int AS v FROM press_events WHERE character_id = $1 AND created_at >= $2`,
    articles: `SELECT count(*)::int AS v FROM articles WHERE author_id = $1 AND kind = 'news' AND NOT removed AND created_at >= $2`,
    cities_played: `SELECT count(DISTINCT g.city_id)::int AS v FROM gig_performers gp JOIN gigs g ON g.id = gp.gig_id
                     WHERE gp.character_id = $1 AND gp.present AND g.status = 'done' AND g.starts_at >= $2`,
  };
  const r = await one(db, q[kind], [characterId, since]);
  return Number(r?.v ?? 0);
}

export async function missionsState(db: Db, characterId: number): Promise<MissionsResponse> {
  const week = await currentWeek(db);
  if (!week) return { weekId: null, endsAt: null, missions: [] };
  const list = missionsFor(characterId, Number(week.id));
  const claims = await db.query('SELECT mission_id FROM mission_claims WHERE character_id = $1 AND week_id = $2', [characterId, week.id]);
  const claimed = new Set(claims.rows.map((r) => r.mission_id));
  const missions = [];
  for (const m of list) {
    const p = await progress(db, characterId, m.kind, week.starts_at);
    missions.push({ id: m.id, progress: Math.min(m.target, Math.floor(p * 10) / 10), target: m.target, reward: m.reward, claimed: claimed.has(m.id) });
  }
  return { weekId: Number(week.id), endsAt: week.ends_at.toISOString(), missions };
}

export async function claimMission(characterId: number, missionId: string) {
  return tx(async (c) => {
    await lockCharacter(c, characterId);
    const state = await missionsState(c, characterId);
    const m = state.missions.find((x) => x.id === missionId);
    if (!m || !state.weekId) fail('not_found', 404);
    if (m!.claimed) fail('already_claimed', 409);
    if (m!.progress < m!.target) fail('step_not_done', 409);
    const def = MISSION_BY_ID[missionId];
    await c.query('INSERT INTO mission_claims(character_id, week_id, mission_id, reward) VALUES ($1, $2, $3, $4)', [characterId, state.weekId, missionId, def.reward]);
    await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [characterId, def.reward]);
    return { reward: def.reward };
  });
}

export const missionsNow = (characterId: number) => missionsState(pool, characterId);
