// Oyuncular arası takas: eşya karşılığı eşya, isteğe bağlı para üstüyle.
// Teklif sırasında eşyalar kilitlenmez; kabul anında her şey yeniden kontrol edilir ve
// tek işlemde el değiştirir. Aynı eşya iki teklifteyse önce kabul edilen kazanır, diğeri düşer.

import {
  ITEM_BY_ID,
  MAX_OPEN_TRADES,
  MAX_TRADE_ITEMS,
  MAX_TRADE_MONEY,
  maxResalePrice,
  type PersonDto,
  type TradeDto,
  type TradeItemDto,
  type TradesResponse,
  isBoundItem,
} from '@rifftown/shared';
import type pg from 'pg';
import { type Db, many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { characterIsVip, lockCharacter, notify, requireEstablished } from './common';
import { handOver, inventoryOf, itemBonus, returnsTooSoon, ringPledged } from './items';
import { cleanText, isBlocked, pair, requirePlayer, toPerson } from './social';
import { addMoodlet } from './wellbeing';

const toItem = (r: any): TradeItemDto => ({
  id: Number(r.inventory_id),
  itemId: r.item_id,
  color: r.color ?? null,
  nickname: r.nickname ?? null,
  bonus: itemBonus({ item_id: r.item_id, bonus: r.bonus, legendary_at: r.legendary ? new Date() : null }),
  legendary: !!r.legendary,
});

async function loadTrades(db: Db, where: string, params: unknown[], viewer: number): Promise<TradeDto[]> {
  const rows = await many(
    db,
    `SELECT t.*,
            f.id AS f_id, f.name AS f_name, f.avatar_color AS f_avatar_color, f.avatar_version AS f_avatar_version, f.city_id AS f_city_id, f.npc AS f_npc,
            o.id AS o_id, o.name AS o_name, o.avatar_color AS o_avatar_color, o.avatar_version AS o_avatar_version, o.city_id AS o_city_id, o.npc AS o_npc
       FROM trades t JOIN characters f ON f.id = t.from_id JOIN characters o ON o.id = t.to_id
      WHERE ${where} ORDER BY t.id DESC LIMIT 30`,
    params,
  );
  if (!rows.length) return [];
  const items = await many(db, 'SELECT * FROM trade_items WHERE trade_id = ANY($1::bigint[]) ORDER BY inventory_id', [rows.map((r) => r.id)]);
  const person = (r: any, p: string): PersonDto => toPerson(r, `${p}_`);
  return rows.map((r) => ({
    id: Number(r.id),
    from: person(r, 'f'),
    to: person(r, 'o'),
    mine: Number(r.from_id) === viewer,
    give: items.filter((i) => Number(i.trade_id) === Number(r.id) && i.side === 'give').map(toItem),
    want: items.filter((i) => Number(i.trade_id) === Number(r.id) && i.side === 'want').map(toItem),
    giveMoney: r.give_money,
    wantMoney: r.want_money,
    note: r.note,
    status: r.status,
    createdAt: r.created_at.toISOString(),
    closedAt: r.closed_at ? r.closed_at.toISOString() : null,
  }));
}

export async function tradesOf(viewer: number): Promise<TradesResponse> {
  const [incoming, outgoing, history] = await Promise.all([
    loadTrades(pool, `t.to_id = $1 AND t.status = 'open'`, [viewer], viewer),
    loadTrades(pool, `t.from_id = $1 AND t.status = 'open'`, [viewer], viewer),
    loadTrades(pool, `(t.from_id = $1 OR t.to_id = $1) AND t.status <> 'open'`, [viewer], viewer),
  ]);
  return { incoming, outgoing, history: history.slice(0, 20) };
}

/** Takasa konabilecek (pazarda olmayan, teklifteki yüzük olmayan) eşyalar */
export async function tradeableItems(db: Db, characterId: number) {
  const items = await inventoryOf(db, characterId);
  const pledged = await many(
    db,
    'SELECT proposal_ring FROM relationships WHERE proposal_ring IS NOT NULL AND (a_id = $1 OR b_id = $1)',
    [characterId],
  );
  const blocked = new Set(pledged.map((p) => Number(p.proposal_ring)));
  return items.filter((i) => !i.listed && !blocked.has(i.id) && !isBoundItem(i.itemId));
}

export async function proposeTrade(
  fromId: number,
  body: { toId: number; give: number[]; want: number[]; giveMoney: number; wantMoney: number; note: string },
) {
  const give = [...new Set(body.give)];
  const want = [...new Set(body.want)];
  if (fromId === body.toId) fail('invalid_target');
  // Takas en az birer eşya içerir; para sadece üste eklenir (para gönderme VIP'e özeldir)
  if (!give.length || !want.length) fail('trade_needs_items');
  if (give.length > MAX_TRADE_ITEMS || want.length > MAX_TRADE_ITEMS) fail('too_many_items');
  for (const m of [body.giveMoney, body.wantMoney]) if (!Number.isInteger(m) || m < 0 || m > MAX_TRADE_MONEY) fail('invalid_amount');
  if (body.giveMoney && body.wantMoney) fail('invalid_amount');
  const note = cleanText(body.note ?? '').slice(0, 200);
  return tx(async (c) => {
    const me = await lockCharacter(c, fromId);
    await requirePlayer(c, body.toId);
    await requireEstablished(c, fromId);
    if (await isBlocked(c, fromId, body.toId)) fail('blocked', 403);
    const open = await one(c, `SELECT count(*)::int AS n FROM trades WHERE from_id = $1 AND status = 'open'`, [fromId]);
    if (open!.n >= MAX_OPEN_TRADES) fail('too_many_trades');
    if (me.money < body.giveMoney) fail('not_enough_money');
    const rows: any[] = [];
    for (const [side, ids, owner] of [
      ['give', give, fromId],
      ['want', want, body.toId],
    ] as const) {
      for (const id of ids) {
        const r = await one(c, 'SELECT * FROM inventory WHERE id = $1 AND character_id = $2', [id, owner]);
        if (!r) fail('item_not_found', 404);
        if (r.listed) fail('item_listed', 409);
        if (await ringPledged(c, r.id)) fail('ring_pledged', 409);
        // Kişiye bağlı ödül eşyası el değiştiremez
        if (isBoundItem(r.item_id)) fail('item_bound', 409);
        // Kısa süre önce karşı taraftan gelen eşya ona geri gidemez
        if (returnsTooSoon(r, side === 'give' ? body.toId : fromId)) fail('item_recently_yours', 409);
        rows.push({ side, r });
      }
    }
    // Para tavanı: para, karşılığında alınan eşyaların dükkân değerinin en fazla iki katı olabilir
    const value = (side: 'give' | 'want') =>
      rows.filter((x) => x.side === side).reduce((sum, x) => sum + maxResalePrice(ITEM_BY_ID[x.r.item_id]?.price ?? 0, !!x.r.legendary_at), 0);
    if (body.giveMoney > value('want') || body.wantMoney > value('give')) fail('trade_money_too_high');
    const t = await one(
      c,
      'INSERT INTO trades(from_id, to_id, give_money, want_money, note) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [fromId, body.toId, body.giveMoney, body.wantMoney, note],
    );
    for (const { side, r } of rows) {
      await c.query(
        `INSERT INTO trade_items(trade_id, side, inventory_id, item_id, color, nickname, bonus, legendary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [t!.id, side, r.id, r.item_id, r.color, r.nickname, r.bonus, !!r.legendary_at],
      );
    }
    await notify(c, body.toId, 'trade_offer', { tradeId: Number(t!.id), fromId, from: me.name });
    return { id: Number(t!.id) };
  });
}

async function close(c: pg.PoolClient, id: number, status: string) {
  await c.query('UPDATE trades SET status = $2, closed_at = now() WHERE id = $1', [id, status]);
}

/** Alıcı kabul eder: her şey yeniden kontrol edilir, eşyalar ve para tek işlemde el değiştirir */
export async function acceptTrade(viewer: number, tradeId: number) {
  const res = await tx(async (c) => {
    // Kilit sırası diğer işlemlerle aynı: önce karakterler (id sırasıyla), sonra takas ve eşyalar
    const peek = await one(c, 'SELECT from_id, to_id FROM trades WHERE id = $1', [tradeId]);
    if (!peek || Number(peek.to_id) !== viewer) fail('not_found', 404);
    const fromId = Number(peek.from_id);
    const chars = new Map<number, any>();
    for (const id of pair(fromId, viewer)) chars.set(id, await lockCharacter(c, id));
    const t = await one(c, `SELECT * FROM trades WHERE id = $1 FOR UPDATE`, [tradeId]);
    if (!t || Number(t.to_id) !== viewer) fail('not_found', 404);
    if (t.status !== 'open') fail('trade_closed', 409);
    if (await isBlocked(c, fromId, viewer)) fail('blocked', 403);
    await requireEstablished(c, viewer);
    const items = await many(c, 'SELECT * FROM trade_items WHERE trade_id = $1 ORDER BY inventory_id', [tradeId]);
    const vip = new Map<number, boolean>([
      [fromId, await characterIsVip(c, fromId)],
      [viewer, await characterIsVip(c, viewer)],
    ]);
    // Bir şey değişmişse (eşya satıldı, hediye edildi, pazara kondu, para yetmiyor) takas düşer
    let broken: string | null = null;
    const locked: { id: number; from: number; to: number }[] = [];
    for (const it of items) {
      const owner = it.side === 'give' ? fromId : viewer;
      const to = it.side === 'give' ? viewer : fromId;
      const r = await one(c, 'SELECT * FROM inventory WHERE id = $1 FOR UPDATE', [it.inventory_id]);
      // Teklif verildikten sonra boyanmış ya da adı değişmiş eşya da "değişti" sayılır (alıcı eski hâlini gördü)
      if (
        !r ||
        Number(r.character_id) !== owner ||
        r.listed ||
        (await ringPledged(c, r.id)) ||
        (r.color ?? null) !== (it.color ?? null) ||
        (r.nickname ?? null) !== (it.nickname ?? null)
      )
        broken = 'trade_items_changed';
      else if (ITEM_BY_ID[r.item_id]?.vip && !vip.get(to)) broken = 'vip_required';
      else if (isBoundItem(r.item_id)) broken = 'item_bound';
      else if (returnsTooSoon(r, to)) broken = 'item_recently_yours';
      else locked.push({ id: Number(r.id), from: owner, to });
    }
    if (!broken && chars.get(fromId).money < t.give_money) broken = 'trade_money_missing';
    if (!broken && chars.get(viewer).money < t.want_money) broken = 'trade_money_missing';
    if (broken) {
      await close(c, tradeId, 'failed');
      await notify(c, fromId, 'trade_failed', { tradeId, reason: broken });
      return { ok: false as const, reason: broken };
    }
    for (const it of locked) await handOver(c, it.id, it.from, it.to);
    const net = t.give_money - t.want_money; // gönderenden alıcıya
    if (net) {
      await c.query('UPDATE characters SET money = money - $2 WHERE id = $1', [fromId, net]);
      await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [viewer, net]);
    }
    await close(c, tradeId, 'accepted');
    // Bu eşyaları içeren diğer açık teklifler artık geçersiz
    const dropped = await many(
      c,
      `UPDATE trades SET status = 'failed', closed_at = now()
        WHERE status = 'open' AND id <> $1 AND id IN (SELECT trade_id FROM trade_items WHERE inventory_id = ANY($2::bigint[]))
        RETURNING id, from_id`,
      [tradeId, locked.map((l) => l.id)],
    );
    for (const d of dropped) await notify(c, Number(d.from_id), 'trade_failed', { tradeId: Number(d.id), reason: 'trade_items_changed' });
    const me = chars.get(viewer);
    await notify(c, fromId, 'trade_accepted', { tradeId, fromId: viewer, from: me.name });
    for (const id of [fromId, viewer]) await addMoodlet(c, id, 'good_trade');
    return { ok: true as const };
  });
  // Düşen takas kaydedildi; kullanıcıya nedenini hata olarak bildir
  if (!res.ok) fail(res.reason, 409);
  return res;
}

export async function declineTrade(viewer: number, tradeId: number) {
  return tx(async (c) => {
    const t = await one(c, `SELECT * FROM trades WHERE id = $1 FOR UPDATE`, [tradeId]);
    if (!t || Number(t.to_id) !== viewer) fail('not_found', 404);
    if (t.status !== 'open') fail('trade_closed', 409);
    await close(c, tradeId, 'declined');
    const me = await one(c, 'SELECT name FROM characters WHERE id = $1', [viewer]);
    await notify(c, Number(t.from_id), 'trade_declined', { tradeId, fromId: viewer, from: me!.name });
    return { ok: true };
  });
}

export async function cancelTrade(viewer: number, tradeId: number) {
  return tx(async (c) => {
    const t = await one(c, `SELECT * FROM trades WHERE id = $1 FOR UPDATE`, [tradeId]);
    if (!t || Number(t.from_id) !== viewer) fail('not_found', 404);
    if (t.status !== 'open') fail('trade_closed', 409);
    await close(c, tradeId, 'cancelled');
    return { ok: true };
  });
}
