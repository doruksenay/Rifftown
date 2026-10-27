// Ünvanlar: kozmetik ödüller (content/rewards.ts). Kazanılanlar başarım ve zincir kayıtlarından hesaplanır;
// veritabanında yalnızca oyuncunun seçtiği ünvan tutulur (characters.title_id).

import { TITLE_BY_ID, earnedTitles } from '@rifftown/shared';
import { type Db, many, one, pool } from '../db';
import { fail } from '../errors';

export async function titlesOf(db: Db, characterId: number) {
  const ach = await many(db, 'SELECT achievement_id FROM character_achievements WHERE character_id = $1', [characterId]);
  const claims = await many(db, 'SELECT chain_id, step, choice FROM chain_claims WHERE character_id = $1', [characterId]);
  const earned = earnedTitles(
    ach.map((a) => a.achievement_id as string),
    claims.map((c) => ({ chain: c.chain_id as string, step: Number(c.step), choice: c.choice as string | null })),
  );
  const cur = await one(db, 'SELECT title_id FROM characters WHERE id = $1', [characterId]);
  return { earned, current: (cur?.title_id as string | null) ?? null };
}

/** Seçili ünvanı değiştirir; yalnızca kazanılmış ünvan seçilebilir (null: ünvan yok) */
export async function setTitle(characterId: number, titleId: string | null) {
  if (titleId !== null) {
    if (!TITLE_BY_ID[titleId]) fail('unknown_title');
    const { earned } = await titlesOf(pool, characterId);
    if (!earned.includes(titleId)) fail('title_not_earned', 403);
  }
  await pool.query('UPDATE characters SET title_id = $2 WHERE id = $1', [characterId, titleId]);
  return { current: titleId };
}
