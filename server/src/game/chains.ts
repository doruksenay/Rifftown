// Görev zincirleri: sırayla açılan adımlar; her adımın ödülü bir kez alınır (bkz. content/progress.ts CHAINS).
// Karakterli zincirlerde seçimli adımlar vardır: seçim kaydedilir ve hikâyenin devamı (dal) seçime göre gelir.
// Ödül para, kişiye bağlı eşya (satılamaz, takas edilemez) ya da ünvan olabilir.

import { CHAINS, CHAIN_BY_ID, type ChainDef, ITEM_BY_ID, chainApplies } from '@rifftown/shared';
import type pg from 'pg';
import { type Db, many, tx } from '../db';
import { fail } from '../errors';
import { lockCharacter, notify } from './common';
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
  /** Sıradaki adım bir seçim mi (seçenekler veri dosyasında) */
  choice: boolean;
  /** Bu zincirde yapılmış seçimler: adım → seçenek */
  choices: Record<number, string>;
}

type Claim = { chain_id: string; step: number; choice: string | null };

/** Zincirin yapılan seçimlere göre geçerli adım sayısı (seçim yapılmadıysa ilk dal sayılır) */
function chainTotal(c: ChainDef, chosen: Set<string>) {
  const branches = [...new Set(c.steps.map((s) => s.branch).filter(Boolean))] as string[];
  const active = branches.some((b) => chosen.has(b)) ? chosen : new Set(branches.slice(0, 1));
  return c.steps.filter((s) => chainApplies(s, active)).length;
}

export async function chainsState(db: Db, characterId: number): Promise<ChainState[]> {
  const stats = await lifetimeStats(db, characterId);
  const claims = (await many(db, 'SELECT chain_id, step, choice FROM chain_claims WHERE character_id = $1', [characterId])) as Claim[];
  return CHAINS.map((c) => {
    const mine = claims.filter((x) => x.chain_id === c.id);
    const claimed = new Set(mine.map((x) => Number(x.step)));
    const chosen = new Set(mine.map((x) => x.choice).filter(Boolean) as string[]);
    const choices = Object.fromEntries(mine.filter((x) => x.choice).map((x) => [Number(x.step), x.choice!]));
    const base = { id: c.id, choices, completed: claimed.size, total: chainTotal(c, chosen) };
    const step = c.steps.findIndex((s, i) => !claimed.has(i) && chainApplies(s, chosen));
    if (step < 0) return { ...base, step: null, progress: 0, target: 0, reward: 0, done: false, choice: false };
    const s = c.steps[step];
    if (s.choice) return { ...base, step, progress: 1, target: 1, reward: 0, done: true, choice: true };
    const progress = stats[s.rule!.stat] ?? 0;
    return { ...base, step, progress: Math.min(progress, s.rule!.min), target: s.rule!.min, reward: s.reward, done: progress >= s.rule!.min, choice: false };
  });
}

/** Ödül eşyasını envantere koyar (kişiye bağlı; dükkân fiyatı yok sayılır) */
async function giveRewardItem(c: pg.PoolClient, characterId: number, itemId: string) {
  const def = ITEM_BY_ID[itemId];
  if (!def) return null;
  await c.query('INSERT INTO inventory(character_id, item_id, slot) VALUES ($1, $2, $3)', [characterId, itemId, def.slot]);
  return itemId;
}

export async function claimChainStep(characterId: number, chainId: string, choiceId?: string) {
  const def = CHAIN_BY_ID[chainId];
  if (!def) fail('not_found', 404);
  return tx(async (c) => {
    await lockCharacter(c, characterId);
    const st = (await chainsState(c, characterId)).find((x) => x.id === chainId)!;
    if (st.step === null) fail('already_claimed', 409);
    if (!st.done) fail('step_not_done', 409);
    const step = def!.steps[st.step!];
    let reward = step.reward;
    let item = step.item ?? null;
    let titleId = step.titleId ?? null;
    let choice: string | null = null;
    if (step.choice) {
      const opt = step.choice.find((o) => o.id === choiceId);
      if (!opt) fail('invalid_choice');
      choice = opt!.id;
      reward = opt!.reward;
      item = opt!.item ?? null;
      titleId = opt!.titleId ?? titleId;
    }
    const ins = await c.query('INSERT INTO chain_claims(character_id, chain_id, step, reward, choice) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING', [
      characterId,
      chainId,
      st.step,
      reward,
      choice,
    ]);
    if (!ins.rowCount) fail('already_claimed', 409);
    if (reward > 0) await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [characterId, reward]);
    if (item) await giveRewardItem(c, characterId, item);
    if (titleId) await notify(c, characterId, 'title_earned', { titleId });
    return { reward, item, titleId, choice };
  });
}
