// Nitelikler ve XP'nin sunucu tarafı (kurallar: packages/shared/src/attributes.ts).
//
// XP yalnızca karakterin kendi eylemlerinden ve sahneye çıktığı konserlerden gelir; başka bir oyuncunun
// eyleminden, paradan ya da takastan gelmez ve başka karaktere geçmez. Günlük ve haftalık tavanlar
// xp_log'dan hesaplanır; yeni hesapların tavanı yarıdır. Harcama karakter satırı kilitliyken yapılır.

import {
  type AttributesDto,
  type Attributes,
  attributeRoom,
  attributeSpendBlocker,
  attrSpendCost,
  gameHoursToMs,
  normalizeAttributes,
  xpAllowance,
  xpCaps,
} from '@rifftown/shared';
import { config } from '../config';
import { type Db, one, tx } from '../db';
import { fail } from '../errors';
import { type CharacterRow, lockCharacter, toCharacterDto } from './common';

const DAY_HOURS = 24;
const WEEK_HOURS = 7 * 24;

/** Hesap yeni mi (ilk TRADE_MIN_ACCOUNT_HOURS oyun saati)? Ek hesapların XP tavanı yarıdır. */
export async function isNewAccount(db: Db, characterId: number): Promise<boolean> {
  const r = await one(db, 'SELECT u.created_at FROM characters c JOIN users u ON u.id = c.user_id WHERE c.id = $1', [characterId]);
  if (!r) return false;
  return r.created_at.getTime() + gameHoursToMs(config.tradeMinAccountHours, config.gameSpeed) > Date.now();
}

/** Son 24 oyun saatinde ve son 7 oyun gününde kazanılan XP */
export async function xpEarned(db: Db, characterId: number): Promise<{ day: number; week: number }> {
  const now = Date.now();
  const r = await one(
    db,
    `SELECT COALESCE(sum(amount) FILTER (WHERE created_at > $2), 0)::real AS day,
            COALESCE(sum(amount) FILTER (WHERE created_at > $3), 0)::real AS week
       FROM xp_log WHERE character_id = $1 AND created_at > $3`,
    [characterId, new Date(now - gameHoursToMs(DAY_HOURS, config.gameSpeed)), new Date(now - gameHoursToMs(WEEK_HOURS, config.gameSpeed))],
  );
  return { day: Number(r?.day ?? 0), week: Number(r?.week ?? 0) };
}

/**
 * XP verir; tavanı aşan kısım verilmez. Karakter satırı aynı işlemde kilitli olmalı (eylem ve konser
 * sonuçlanırken zaten kilitlidir). Oyunun kendi müzisyenleri XP almaz. Verilen miktarı döner.
 */
export async function grantXp(db: Db, ch: Pick<CharacterRow, 'id' | 'npc'>, amount: number, source: string): Promise<number> {
  if (ch.npc || !(amount > 0)) return 0;
  const earned = await xpEarned(db, ch.id);
  const allowed = Math.round(xpAllowance(amount, earned.day, earned.week, await isNewAccount(db, ch.id)) * 100) / 100;
  if (allowed <= 0) return 0;
  await db.query('INSERT INTO xp_log(character_id, amount, source) VALUES ($1, $2, $3)', [ch.id, allowed, source]);
  await db.query('UPDATE characters SET xp = xp + $2, xp_total = xp_total + $2 WHERE id = $1', [ch.id, allowed]);
  return allowed;
}

export async function attributesOf(db: Db, ch: CharacterRow): Promise<AttributesDto> {
  const attributes = normalizeAttributes(ch.attributes);
  const earned = await xpEarned(db, ch.id);
  const newAccount = await isNewAccount(db, ch.id);
  const caps = xpCaps(newAccount);
  return {
    attributes,
    xp: Math.floor(Number(ch.xp ?? 0) + 1e-6),
    attributeRoom: attributeRoom(attributes),
    xpDay: Math.round(earned.day * 10) / 10,
    xpWeek: Math.round(earned.week * 10) / 10,
    xpDayCap: caps.day,
    xpWeekCap: caps.week,
    newAccount,
  };
}

/** XP harcayıp bir niteliği yükseltir. Puan geri alınmaz. */
export async function spendAttribute(characterId: number, id: string, points: number) {
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    const attrs = normalizeAttributes(ch.attributes);
    const xp = Number(ch.xp ?? 0);
    const block = attributeSpendBlocker(attrs, xp, id, points);
    if (block) fail(block, block === 'not_enough_xp' || block === 'attribute_max' || block === 'attribute_room' ? 409 : 400);
    const key = id as keyof Attributes;
    const cost = attrSpendCost(attrs[key], points);
    const next = { ...attrs, [key]: attrs[key] + points };
    const row = await one<CharacterRow>(
      c,
      'UPDATE characters SET attributes = $2, xp = GREATEST(0, xp - $3) WHERE id = $1 RETURNING *',
      [characterId, JSON.stringify(next), cost],
    );
    // 'state' adı bilerek seçildi: 'attributes' anahtarı görünürlük kuralında { nitelik: sayı } nesnesi demektir
    return { character: toCharacterDto(row!), cost, state: await attributesOf(c, row!) };
  });
}
