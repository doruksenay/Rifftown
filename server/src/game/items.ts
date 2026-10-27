// Eşyalar: envanter görünümü, ikinci el pazarı, sprey boya ve isim verme, atölyede üretim.

import {
  CRAFT_HOURS,
  type InventoryItemDto,
  ITEM_BY_ID,
  type ListingDto,
  LOCATION_BY_ID,
  MARKET_FEE,
  MAX_LISTINGS,
  RECIPE_BY_ID,
  type Skills,
  clamp,
  containsProfanity,
  craftBonus,
  diminishing,
  isPaintable,
  knows,
  lv,
  LEGENDARY_ITEM_BONUS,
  ITEM_RETURN_COOLDOWN_HOURS,
  PAIR_TRANSFER_CAP,
  PLAYER_TRANSFER_WINDOW_HOURS,
  gameHoursToMs,
  maxResalePrice,
  skillBonus,
  isBoundItem,
} from '@rifftown/shared';
import type pg from 'pg';
import { type Db, many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { config } from '../config';
import { type CharacterRow, activeAction, isJailed, lockCharacter, notify, requireEstablished } from './common';
import { cleanText, pair } from './social';

export const toInventoryDto = (r: any): InventoryItemDto => ({
  id: Number(r.id),
  itemId: r.item_id,
  equipped: r.equipped,
  acquiredAt: r.acquired_at.toISOString(),
  color: r.color ?? null,
  nickname: r.nickname ?? null,
  bonus: itemBonus(r),
  wear: Math.round(Number(r.wear ?? 0)),
  listed: !!r.listed,
  craftedBy: r.crafted_by_name ?? null,
  legendary: r.legendary_at
    ? { gigId: r.legendary_gig ? Number(r.legendary_gig) : null, bandName: r.legendary_band ?? null, at: r.legendary_at.toISOString() }
    : null,
});

/** Eşyanın geçerli bonusu: üretimdeki ya da tanımdaki bonus, EFSANEVİ ise üstüne kalıcı bonus */
export const itemBonus = (r: { item_id: string; bonus: number | null; legendary_at?: Date | null }) =>
  (r.bonus ?? ITEM_BY_ID[r.item_id]?.bonus ?? 0) + (r.legendary_at ? LEGENDARY_ITEM_BONUS : 0);

export async function inventoryOf(db: Db, characterId: number) {
  const rows = await many(
    db,
    `SELECT i.*, c.name AS crafted_by_name FROM inventory i LEFT JOIN characters c ON c.id = i.crafted_by
      WHERE i.character_id = $1 ORDER BY i.id`,
    [characterId],
  );
  return rows.map(toInventoryDto);
}

async function lockOwnItem(c: pg.PoolClient, characterId: number, inventoryId: number) {
  const inv = await one(c, 'SELECT * FROM inventory WHERE id = $1 AND character_id = $2 FOR UPDATE', [inventoryId, characterId]);
  if (!inv) fail('not_found', 404);
  return inv;
}

// ---------- Boya ve isim ----------

export async function paintItem(characterId: number, inventoryId: number, sprayId: number) {
  return tx(async (c) => {
    await lockCharacter(c, characterId);
    const inv = await lockOwnItem(c, characterId, inventoryId);
    if (inv.listed) fail('item_listed', 409);
    if (!isPaintable(inv.slot)) fail('not_paintable');
    const spray = await lockOwnItem(c, characterId, sprayId);
    const def = ITEM_BY_ID[spray.item_id];
    if (!def || def.slot !== 'spray' || !def.color) fail('not_spray');
    if (spray.listed) fail('item_listed', 409);
    await c.query('UPDATE inventory SET color = $2 WHERE id = $1', [inv.id, def!.color]);
    await c.query('DELETE FROM inventory WHERE id = $1', [spray.id]);
    return { color: def!.color };
  });
}

export const NICKNAME_RE = /^[\p{L}\p{N} '’.!&-]{2,24}$/u;

export async function nameItem(characterId: number, inventoryId: number, name: string | null) {
  const nick = name === null ? null : cleanText(name, true);
  if (nick !== null && (!NICKNAME_RE.test(nick) || containsProfanity(nick))) fail('invalid_name');
  return tx(async (c) => {
    const inv = await lockOwnItem(c, characterId, inventoryId);
    if (inv.listed) fail('item_listed', 409);
    if (!isPaintable(inv.slot) && inv.slot !== 'pet' && inv.slot !== 'art') fail('not_nameable');
    await c.query('UPDATE inventory SET nickname = $2 WHERE id = $1', [inv.id, nick]);
    return { nickname: nick };
  });
}

// ---------- İkinci el pazarı ----------

function requireMarket(ch: CharacterRow, locationId: string) {
  const loc = LOCATION_BY_ID[locationId];
  if (!loc || loc.type !== 'flea_market') fail('invalid_location');
  if (loc!.cityId !== ch.city_id) fail('not_in_city');
  if (isJailed(ch)) fail('in_jail', 409);
}

/** Bekleyen bir evlilik teklifinde verilmiş yüzük: satılamaz, ilana konamaz, hediye edilemez */
export async function ringPledged(db: Db, inventoryId: number) {
  return !!(await one(db, 'SELECT 1 FROM relationships WHERE proposal_ring = $1', [inventoryId]));
}

/**
 * Eşya bekleme süresi içinde bu kişide bulunmuşsa ona geri dönemez: yalnızca bir önceki sahip değil, zincirdeki
 * HER el (A → B → C → A rotasyonu ek hesabın parasını kayıpsız taşıyordu). Geçmiş item_handoffs tablosunda;
 * migration 020'den önceki tek kayıt (prev_owner, handed_at) da okunur.
 */
export async function returnsTooSoon(db: Db, inv: { id: unknown; prev_owner?: unknown; handed_at?: Date | null }, to: number) {
  const since = new Date(Date.now() - gameHoursToMs(ITEM_RETURN_COOLDOWN_HOURS, config.gameSpeed));
  if (inv.prev_owner != null && Number(inv.prev_owner) === to && inv.handed_at && inv.handed_at > since) return true;
  return !!(await one(
    db,
    'SELECT 1 FROM item_handoffs WHERE inventory_id = $1 AND created_at > $2 AND (from_id = $3 OR to_id = $3) LIMIT 1',
    [inv.id, since, to],
  ));
}

/** Eşya el değiştirir; önceki sahibi ve zamanı not edilir, geçmişe bir satır eklenir */
export async function handOver(c: Db, inventoryId: number, from: number, to: number, kind: 'trade' | 'market' | 'gift') {
  await c.query(
    'UPDATE inventory SET character_id = $2, listed = FALSE, equipped = FALSE, prev_owner = $3, handed_at = now() WHERE id = $1',
    [inventoryId, to, from],
  );
  await c.query('INSERT INTO item_handoffs(inventory_id, from_id, to_id, kind) VALUES ($1, $3, $2, $4)', [inventoryId, to, from, kind]);
}

/**
 * Oyuncular arası para akışı tavanı (PAIR_TRANSFER_CAP): `from`dan `to`ya kayan pencere içindeki NET akış
 * (from → to eksi to → from) bu aktarımla tavanı aşıyorsa reddedilir. Çağıran iki karakteri de pair() ile kilitlemiş olmalı.
 * Oyunun kendi karakterleri (NPC tüccar) sayılmaz.
 */
export async function requireTransferRoom(c: Db, from: number, to: number, amount: number) {
  if (amount <= 0) return;
  const since = new Date(Date.now() - gameHoursToMs(PLAYER_TRANSFER_WINDOW_HOURS, config.gameSpeed));
  const r = await one(
    c,
    `SELECT coalesce(sum(CASE WHEN from_id = $1 THEN amount ELSE -amount END), 0)::int AS net
       FROM player_money_flows
      WHERE ((from_id = $1 AND to_id = $2) OR (from_id = $2 AND to_id = $1)) AND created_at > $3`,
    [from, to, since],
  );
  if (Math.max(0, r.net) + amount > PAIR_TRANSFER_CAP) fail('transfer_cap_reached', 409);
}

export async function recordMoneyFlow(c: Db, from: number, to: number, amount: number, kind: 'trade' | 'market' | 'vip') {
  if (amount <= 0) return;
  await c.query('INSERT INTO player_money_flows(from_id, to_id, amount, kind) VALUES ($1, $2, $3, $4)', [from, to, amount, kind]);
}

export async function listItem(characterId: number, locationId: string, inventoryId: number, price: number) {
  if (!Number.isInteger(price) || price < 1 || price > 1_000_000) fail('invalid_price');
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    requireMarket(ch, locationId);
    const inv = await lockOwnItem(c, characterId, inventoryId);
    if (inv.listed) fail('item_listed', 409);
    if (!ITEM_BY_ID[inv.item_id]) fail('invalid_item');
    if (isBoundItem(inv.item_id)) fail('item_bound', 409);
    if (await ringPledged(c, inv.id)) fail('ring_pledged', 409);
    await requireEstablished(c, characterId);
    // Fiyat tavanı: dükkân fiyatının iki katı (EFSANEVİ eşyada beş katı)
    if (price > maxResalePrice(ITEM_BY_ID[inv.item_id].price, !!inv.legendary_at)) fail('price_too_high');
    const n = await one(c, `SELECT count(*)::int AS n FROM listings WHERE seller_id = $1 AND status = 'active'`, [characterId]);
    if (n.n >= MAX_LISTINGS) fail('too_many_listings');
    await c.query('UPDATE inventory SET listed = TRUE, equipped = FALSE WHERE id = $1', [inv.id]);
    const r = await one(c, 'INSERT INTO listings(seller_id, inventory_id, item_id, price) VALUES ($1, $2, $3, $4) RETURNING id', [
      characterId,
      inv.id,
      inv.item_id,
      price,
    ]);
    return { id: r.id };
  });
}

export async function cancelListing(characterId: number, listingId: number) {
  return tx(async (c) => {
    const l = await one(c, `SELECT * FROM listings WHERE id = $1 AND seller_id = $2 AND status = 'active' FOR UPDATE`, [listingId, characterId]);
    if (!l) fail('not_found', 404);
    await c.query(`UPDATE listings SET status = 'cancelled', closed_at = now() WHERE id = $1`, [l.id]);
    await c.query('UPDATE inventory SET listed = FALSE WHERE id = $1', [l.inventory_id]);
    return { ok: true };
  });
}

export async function buyListing(buyerId: number, locationId: string, listingId: number) {
  return tx(async (c) => {
    const l = await one(c, `SELECT * FROM listings WHERE id = $1 AND status = 'active' FOR UPDATE`, [listingId]);
    if (!l) fail('listing_gone', 409);
    if (Number(l.seller_id) === buyerId) fail('own_listing');
    const chars: Record<number, CharacterRow> = {};
    for (const id of pair(buyerId, Number(l.seller_id))) chars[id] = await lockCharacter(c, id);
    const buyer = chars[buyerId];
    requireMarket(buyer, locationId);
    await requireEstablished(c, buyerId);
    if (await activeAction(c, buyerId)) fail('busy', 409);
    const def = ITEM_BY_ID[l.item_id];
    if (def?.vip) {
      const vip = await one(c, 'SELECT u.vip_until FROM characters ch JOIN users u ON u.id = ch.user_id WHERE ch.id = $1', [buyerId]);
      if (!vip?.vip_until || vip.vip_until.getTime() < Date.now()) fail('vip_required', 403);
    }
    if (buyer.money < l.price) fail('not_enough_money');
    // Eşya hâlâ satıcıda ve ilanda olmalı (başka yoldan el değiştirmişse ilan geçersizdir)
    const still = await one(c, 'SELECT * FROM inventory WHERE id = $1 AND character_id = $2 AND listed FOR UPDATE', [l.inventory_id, l.seller_id]);
    if (!still) fail('listing_gone', 409);
    // Tavan alışta da geçerli (kural gelmeden önce açılmış ilanlar)
    if (def && l.price > maxResalePrice(def.price, !!still.legendary_at)) fail('price_too_high');
    if (await returnsTooSoon(c, still, buyerId)) fail('item_recently_yours', 409);
    // Oyuncudan oyuncuya para akışı tavanı (oyunun tüccarı sayılmaz)
    const sellerIsPlayer = !chars[Number(l.seller_id)].npc;
    if (sellerIsPlayer) await requireTransferRoom(c, buyerId, Number(l.seller_id), l.price);
    const fee = Math.ceil(l.price * MARKET_FEE);
    await c.query('UPDATE characters SET money = money - $2, location_id = $3 WHERE id = $1', [buyerId, l.price, locationId]);
    await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [l.seller_id, l.price - fee]);
    await handOver(c, l.inventory_id, Number(l.seller_id), buyerId, 'market');
    if (sellerIsPlayer) await recordMoneyFlow(c, buyerId, Number(l.seller_id), l.price, 'market');
    await c.query(`UPDATE listings SET status = 'sold', buyer_id = $2, closed_at = now() WHERE id = $1`, [l.id, buyerId]);
    await notify(c, Number(l.seller_id), 'item_sold', { itemId: l.item_id, price: l.price, earned: l.price - fee, buyer: buyer.name });
    return { ok: true, price: l.price };
  });
}

export async function marketListings(viewer: number, opts: { slot?: string; mine?: boolean } = {}): Promise<ListingDto[]> {
  const rows = await many(
    pool,
    `SELECT l.*, s.name AS seller_name, i.color, i.nickname, i.bonus, i.legendary_at, cb.name AS crafted_by_name, i.slot
       FROM listings l JOIN characters s ON s.id = l.seller_id JOIN inventory i ON i.id = l.inventory_id
       LEFT JOIN characters cb ON cb.id = i.crafted_by
      WHERE l.status = 'active' AND ($2::text IS NULL OR i.slot = $2) AND (NOT $3 OR l.seller_id = $1)
      ORDER BY l.created_at DESC LIMIT 100`,
    [viewer, opts.slot ?? null, !!opts.mine],
  );
  return rows.map((r) => ({
    id: Number(r.id),
    itemId: r.item_id,
    price: r.price,
    seller: { characterId: Number(r.seller_id), name: r.seller_name },
    color: r.color ?? null,
    nickname: r.nickname ?? null,
    bonus: itemBonus(r),
    craftedBy: r.crafted_by_name ?? null,
    legendary: !!r.legendary_at,
    createdAt: r.created_at.toISOString(),
    mine: Number(r.seller_id) === viewer,
  }));
}

// ---------- Atölye ----------

/** 'craft' eylemini başlatırken: malzemeler eylem boyunca ayrılır (envanterden düşülür) */
export async function prepareCraft(c: pg.PoolClient, ch: CharacterRow, recipeId: string, locationId: string) {
  const recipe = RECIPE_BY_ID[recipeId];
  if (!recipe) fail('invalid_recipe');
  const loc = LOCATION_BY_ID[locationId];
  if (!loc || loc.type !== 'hardware') fail('invalid_location');
  if (loc!.cityId !== ch.city_id) fail('not_in_city');
  const used: number[] = [];
  for (const [mat, qty] of Object.entries(recipe!.materials)) {
    const rows = await many(
      c,
      'SELECT id FROM inventory WHERE character_id = $1 AND item_id = $2 AND NOT listed ORDER BY id LIMIT $3 FOR UPDATE',
      [ch.id, mat, qty],
    );
    if (rows.length < qty) fail('missing_materials');
    used.push(...rows.map((r) => Number(r.id)));
  }
  await c.query('DELETE FROM inventory WHERE id = ANY($1::bigint[])', [used]);
  return { hours: CRAFT_HOURS, locationId: loc!.id, params: { recipe: recipe!.id, materials: recipe!.materials } };
}

/** Üretimin sonucu. Yarıda bırakılırsa malzemeler geri verilir, ürün çıkmaz. */
export async function resolveCraft(c: pg.PoolClient, ch: CharacterRow, params: Record<string, any>, skills: Skills, fraction: number, rand = Math.random) {
  const recipe = RECIPE_BY_ID[params.recipe];
  if (!recipe) return { cancelled: true };
  if (fraction < 1) {
    for (const [mat, qty] of Object.entries(recipe.materials)) {
      const def = ITEM_BY_ID[mat];
      for (let i = 0; i < (qty as number); i++) {
        await c.query('INSERT INTO inventory(character_id, item_id, slot) VALUES ($1, $2, $3)', [ch.id, mat, def.slot]);
      }
    }
    return { cancelled: true, refunded: true };
  }
  const bonus = craftBonus(recipe, Math.min(100, lv(skills, 'craftsmanship') + skillBonus(skills, 'crafting')), rand);
  const def = ITEM_BY_ID[recipe.itemId];
  const r = await one(c, 'INSERT INTO inventory(character_id, item_id, slot, bonus, crafted_by) VALUES ($1, $2, $3, $4, $1) RETURNING id', [
    ch.id,
    def.id,
    def.slot,
    bonus,
  ]);
  if (knows(skills, 'craftsmanship')) skills.craftsmanship = clamp(skills.craftsmanship + 0.8 * diminishing(skills.craftsmanship), 0, 100);
  return { itemId: def.id, inventoryId: Number(r.id), bonus, recipe: recipe.id };
}
