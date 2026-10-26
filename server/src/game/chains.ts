// Görev zincirleri: sırayla açılan adımlar; her adımın ödülü bir kez alınır (bkz. content/progress.ts CHAINS).

import { CHAINS, CHAIN_BY_ID } from '@rifftown/shared';
import { type Db, many, tx } from '../db';
import { fail } from '../errors';
import { lockCharacter } from './common';
import { lifetimeStats } from './stats';

export interface ChainState {
  id: string;
  /** Sıradaki adım (hepsi alındıysa null) */
  step: number | null;
  progress: number;
  target: number;
  reward: number;
  done: boolean;
  completed: number;
  total: number;
}

export async function chainsState(db: Db, characterId: number): Promise<ChainState[]> {
  const stats = await lifetimeStats(db, characterId);
  const claims = await many(db, 'SELECT chain_id, step FROM chain_claims WHERE character_id = $1', [characterId]);
  return CHAINS.map((c) => {
    const claimed = new Set(claims.filter((x) => x.chain_id === c.id).map((x) => Number(x.step)));
    const step = c.steps.findIndex((_, i) => !claimed.has(i));
    if (step < 0) return { id: c.id, step: null, progress: 0, target: 0, reward: 0, done: false, completed: c.steps.length, total: c.steps.length };
    const s = c.steps[step];
    const progress = stats[s.rule.stat] ?? 0;
    return { id: c.id, step, progress: Math.min(progress, s.rule.min), target: s.rule.min, reward: s.reward, done: progress >= s.rule.min, completed: claimed.size, total: c.steps.length };
  });
}

export async function claimChainStep(characterId: number, chainId: string) {
  if (!CHAIN_BY_ID[chainId]) fail('not_found', 404);
  return tx(async (c) => {
    await lockCharacter(c, characterId);
    const st = (await chainsState(c, characterId)).find((x) => x.id === chainId)!;
    if (st.step === null) fail('already_claimed', 409);
    if (!st.done) fail('step_not_done', 409);
    const ins = await c.query('INSERT INTO chain_claims(character_id, chain_id, step, reward) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', [
      characterId,
      chainId,
      st.step,
      st.reward,
    ]);
    if (!ins.rowCount) fail('already_claimed', 409);
    await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [characterId, st.reward]);
    return { reward: st.reward };
  });
}
