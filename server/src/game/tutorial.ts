// Rehber görevler: adımların tamamlanma durumu ve ödüller.

import { type NextGoal, TUTORIAL, TUTORIAL_BY_ID, type TutorialResponse, nextGoal, nextLegacyGoal } from '@rifftown/shared';
import { lifetimeStats } from './stats';
import { type Db, many, one, tx } from '../db';
import { fail } from '../errors';
import { evaluateAchievements } from './achievements';
import { lockCharacter } from './common';

/** Başarımlardan ve birkaç ek istatistikten hangi adımların bittiğini hesaplar */
async function doneSteps(db: Db, characterId: number): Promise<Set<string>> {
  const ach = new Set((await many(db, 'SELECT achievement_id FROM character_achievements WHERE character_id = $1', [characterId])).map((r) => r.achievement_id));
  const extra = await one(
    db,
    `SELECT EXISTS (SELECT 1 FROM familiarity WHERE character_id = $1 AND value > 0) AS rehearsed,
            EXISTS (SELECT 1 FROM homes WHERE character_id = $1) AS home,
            EXISTS (SELECT 1 FROM meals WHERE character_id = $1) AS meal,
            EXISTS (SELECT 1 FROM characters WHERE id = $1 AND (headline <> '' OR bio <> '')) AS profile,
            EXISTS (SELECT 1 FROM relationships WHERE (a_id = $1 OR b_id = $1) AND (friends OR friend_request = $1)) AS friend`,
    [characterId],
  );
  const done = new Set<string>();
  const map: Record<string, boolean> = {
    write_song: ach.has('first_song'),
    work_shift: ach.has('first_job'),
    learn_skill: ach.has('new_skill'),
    form_band: ach.has('first_band'),
    rehearse: !!extra?.rehearsed,
    first_gig: ach.has('first_gig'),
    record: ach.has('first_recording'),
    release: ach.has('first_single'),
    home: !!extra?.home,
    meal: !!extra?.meal,
    profile: !!extra?.profile,
    friend: !!extra?.friend,
  };
  for (const [id, ok] of Object.entries(map)) if (ok) done.add(id);
  return done;
}

export async function tutorialState(db: Db, characterId: number): Promise<TutorialResponse> {
  await evaluateAchievements(db, characterId);
  const done = await doneSteps(db, characterId);
  const claimed = new Set((await many(db, 'SELECT step_id FROM tutorial_claims WHERE character_id = $1', [characterId])).map((r) => r.step_id));
  const steps = TUTORIAL.map((s) => ({ id: s.id, done: done.has(s.id), claimed: claimed.has(s.id) }));
  // Sırayla gitmek zorunda değil: ödülü hazır bir adım varsa önce o gösterilir. Süreli bir eylem sürüyorsa kart o
  // eylemin adımında takılmaz (playtest Y-2: ilk saat tek düğmeydi): eylem sürerken yapılabilen ilk adımı gösterir.
  const active = await one(db, `SELECT kind FROM actions WHERE character_id = $1 AND status = 'active'`, [characterId]);
  const open = steps.filter((s) => !s.claimed && !s.done);
  const waiting = active ? (open.find((s) => TUTORIAL_BY_ID[s.id].action === active.kind) ?? null) : null;
  const doable = active ? open.filter((s) => TUTORIAL_BY_ID[s.id].whileBusy) : open;
  const current = steps.find((s) => s.done && !s.claimed) ?? doable[0] ?? open.find((s) => s !== waiting) ?? open[0];
  // Hedef her zaman hesaplanır: rehberi gizleyen ya da bir adımı atlayan oyuncu da görür
  return { steps, current: current?.id ?? null, next: await goalFor(db, characterId), waiting: waiting?.id ?? null };
}

/** Rehber bittikten sonraki hedef: grubun şarkı sayısı ve şehirlerdeki şöhreti */
export async function goalFor(db: Db, characterId: number): Promise<NextGoal | null> {
  const ch = await one(db, 'SELECT city_id FROM characters WHERE id = $1', [characterId]);
  if (!ch) return null;
  const m = await one(db, 'SELECT band_id FROM band_members WHERE character_id = $1', [characterId]);
  if (!m) return nextGoal({ hasBand: false, songs: 0, cityId: ch.city_id, fame: {} });
  const songs = await one(
    db,
    // Setliste konabilen şarkılar: grubun repertuvarı
    'SELECT count(*)::int AS n FROM band_songs WHERE band_id = $1',
    [m.band_id],
  );
  const fame = Object.fromEntries(
    (await many(db, 'SELECT city_id, fame FROM band_fame WHERE band_id = $1', [m.band_id])).map((r) => [r.city_id, Number(r.fame)]),
  );
  const g = nextGoal({ hasBand: true, songs: songs?.n ?? 0, cityId: ch.city_id, fame });
  if (g.id !== 'legend') return g;
  // Bütün sahneler açık: uzun vadeli hedefler sırayla gelir, hepsi bitince Onur Listesi
  const next = nextLegacyGoal(await lifetimeStats(db, characterId));
  if (!next) return { id: 'hall_of_fame' };
  return { id: 'legacy', legacyId: next.goal.id, n: next.n, total: next.goal.rule.min };
}

export async function claimStep(characterId: number, stepId: string) {
  return tx(async (c) => {
    const step = TUTORIAL_BY_ID[stepId];
    if (!step) fail('not_found', 404);
    await lockCharacter(c, characterId);
    await evaluateAchievements(c, characterId);
    const done = await doneSteps(c, characterId);
    if (!done.has(stepId)) fail('step_not_done', 409);
    const ins = await c.query(
      'INSERT INTO tutorial_claims(character_id, step_id, reward) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [characterId, stepId, step!.reward],
    );
    if (!ins.rowCount) fail('already_claimed', 409);
    await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [characterId, step!.reward]);
    return { ok: true, reward: step!.reward, state: await tutorialState(c, characterId) };
  });
}
