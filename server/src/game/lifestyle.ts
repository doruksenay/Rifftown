// Yaşam mekânları: restoran, otel, banka, dövme stüdyosu.

import {
  BANK_INTEREST_CAP,
  BANK_WEEKLY_INTEREST,
  CITY_BY_ID,
  HOTEL_NIGHT_OPTIONS,
  HOTEL_PRICE_PER_NIGHT,
  LOCATION_BY_ID,
  MAX_TATTOOS,
  MEAL_BY_ID,
  MEAL_COOLDOWN_HOURS,
  MEAL_COST_SHARE,
  type MealDef,
  TATTOO_BY_ID,
  TATTOO_REMOVAL_PRICE,
  MEAL_ENERGY,
  gameHoursToMs,
  INDULGENCE_PER_MEAL,
  PACING,
  CONSUMABLE_COOLDOWN_HOURS,
  ITEM_BY_ID,
  skillMult,
} from '@rifftown/shared';
import { indulge } from './consequences';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { type CharacterRow, activeAction, isJailed, lockCharacter } from './common';
import { addMoodlet, changeWellbeing } from './wellbeing';

const hoursMs = (h: number) => gameHoursToMs(h, config.gameSpeed);

function requirePlace(ch: CharacterRow, locationId: string, type: string) {
  const loc = LOCATION_BY_ID[locationId];
  if (!loc || loc.type !== type) fail('invalid_location');
  if (loc!.cityId !== ch.city_id) fail('not_in_city');
  if (isJailed(ch)) fail('in_jail', 409);
  return loc!;
}

// ---------- Restoran ----------

/** Yemeğin bu restorandaki fiyatı (oyuncu restoranında sahibinin çarpanıyla) */
export async function mealPrice(db: Db, locationId: string, meal: MealDef) {
  const loc = LOCATION_BY_ID[locationId];
  const city = CITY_BY_ID[loc.cityId];
  let mult = 1;
  if (loc.business) {
    const b = await one(db, 'SELECT menu_mult FROM businesses WHERE location_id = $1', [locationId]);
    if (b) mult = b.menu_mult;
  }
  return Math.max(1, Math.round(meal.price * city.costMult * mult));
}

/** Oyuncu restoranında harcanan paranın malzeme dışındaki kısmı kasaya girer */
export async function payBusinessForMeal(c: pg.PoolClient, locationId: string, amount: number, buyerId: number) {
  const loc = LOCATION_BY_ID[locationId];
  if (!loc?.business) return;
  const b = await one(c, 'SELECT owner_id FROM businesses WHERE location_id = $1 FOR UPDATE', [locationId]);
  if (!b || Number(b.owner_id) === buyerId) return;
  const net = Math.round(amount * (1 - MEAL_COST_SHARE));
  await c.query('UPDATE businesses SET till = till + $2, total_revenue = total_revenue + $2 WHERE location_id = $1', [locationId, net]);
  await c.query(`INSERT INTO business_log(location_id, kind, amount, character_id) VALUES ($1, 'meal', $2, $3)`, [locationId, net, buyerId]);
}

export async function eatMeal(characterId: number, locationId: string, mealId: string) {
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    requirePlace(ch, locationId, 'restaurant');
    if (await activeAction(c, characterId)) fail('busy', 409);
    const meal = MEAL_BY_ID[mealId];
    if (!meal) fail('invalid_meal');
    // Yerel lezzet yalnızca kendi şehrinde
    if (meal!.cityId && meal!.cityId !== LOCATION_BY_ID[locationId]?.cityId) fail('invalid_meal');
    if (ch.last_meal && ch.last_meal.getTime() + hoursMs(MEAL_COOLDOWN_HOURS) > Date.now()) fail('still_full', 409);
    const price = await mealPrice(c, locationId, meal!);
    if (ch.money < price) fail('not_enough_money');
    await c.query(
      `UPDATE characters SET money = money - $2, mood = LEAST(100, mood + $3), health = LEAST(100, health + $4),
              last_meal = now(), location_id = $5 WHERE id = $1`,
      [ch.id, price, meal!.mood, meal!.health, locationId],
    );
    await c.query('INSERT INTO meals(character_id, location_id, meal_id, price) VALUES ($1, $2, $3, $4)', [ch.id, locationId, meal!.id, price]);
    await payBusinessForMeal(c, locationId, price, ch.id);
    await indulge(c, ch, INDULGENCE_PER_MEAL);
    const energy = meal!.energy ?? MEAL_ENERGY[meal!.id] ?? 0;
    await changeWellbeing(c, ch, { energy });
    await addMoodlet(c, ch.id, meal!.id === 'chef' ? 'feast' : 'good_meal');
    return { price, mood: meal!.mood, health: meal!.health, energy };
  });
}

// ---------- Tüketim eşyaları ----------

/** Son tüketim eşyasından bu yana bekleme bitmediyse bitiş zamanı */
export async function consumableReadyAt(db: Db, characterId: number): Promise<Date | null> {
  const last = await one(db, 'SELECT max(created_at) AS at FROM item_uses WHERE character_id = $1', [characterId]);
  if (!last?.at) return null;
  const at = new Date(last.at.getTime() + hoursMs(CONSUMABLE_COOLDOWN_HOURS));
  return at.getTime() > Date.now() ? at : null;
}

/**
 * Envanterdeki bir tüketim eşyasını kullanmak: küçük ve anlık etki (enerji, ruh hâli, sağlık, ilham), eşya harcanır.
 * Bütün tüketim eşyaları ortak bir beklemeye tabidir. Beslenme becerisi enerjiyi, ilk yardım sağlığı artırır (en fazla ×1,5).
 * Yanıtta kesin sayı dönmez (VIP olmayanlara bulanıklık; istemci karakteri yeniden okur).
 */
export async function useItem(characterId: number, inventoryId: number) {
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    if (await activeAction(c, characterId)) fail('busy', 409);
    const inv = await one(c, 'SELECT * FROM inventory WHERE id = $1 AND character_id = $2 FOR UPDATE', [inventoryId, characterId]);
    if (!inv) fail('not_found', 404);
    if (inv.listed) fail('item_listed', 409);
    const def = ITEM_BY_ID[inv.item_id];
    if (!def?.use) fail('not_usable');
    if (await consumableReadyAt(c, characterId)) fail('consumable_cooldown', 409);
    const u = def!.use!;
    const health = (u.health ?? 0) * skillMult(ch.skills, 'remedy');
    const energy = (u.energy ?? 0) * skillMult(ch.skills, 'nutrition');
    await c.query('UPDATE characters SET mood = LEAST(100, mood + $2), health = LEAST(100, health + $3) WHERE id = $1', [ch.id, u.mood ?? 0, health]);
    if (energy || u.inspiration) await changeWellbeing(c, ch, { energy, inspiration: u.inspiration ?? 0 });
    await c.query('DELETE FROM inventory WHERE id = $1', [inv.id]);
    await c.query('INSERT INTO item_uses(character_id, item_id) VALUES ($1, $2)', [ch.id, def!.id]);
    return { ok: true, itemId: def!.id, readyAt: new Date(Date.now() + hoursMs(CONSUMABLE_COOLDOWN_HOURS)).toISOString() };
  });
}

// ---------- Otel ----------

export async function hotelStay(characterId: number, locationId: string, nights: number) {
  if (!(HOTEL_NIGHT_OPTIONS as readonly number[]).includes(nights)) fail('invalid_hours');
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    const loc = requirePlace(ch, locationId, 'hotel');
    const price = Math.round(HOTEL_PRICE_PER_NIGHT * CITY_BY_ID[loc.cityId].costMult * nights);
    if (ch.money < price) fail('not_enough_money');
    const cur = await one(c, 'SELECT * FROM hotel_stays WHERE character_id = $1', [ch.id]);
    const from = cur && cur.city_id === loc.cityId && cur.until.getTime() > Date.now() ? cur.until.getTime() : Date.now();
    const until = new Date(from + hoursMs(nights * 24));
    await c.query('UPDATE characters SET money = money - $2, location_id = $3 WHERE id = $1', [ch.id, price, loc.id]);
    await c.query(
      `INSERT INTO hotel_stays(character_id, city_id, until) VALUES ($1, $2, $3)
       ON CONFLICT (character_id) DO UPDATE SET city_id = EXCLUDED.city_id, until = EXCLUDED.until`,
      [ch.id, loc.cityId, until],
    );
    return { price, until: until.toISOString() };
  });
}

export async function hotelOf(db: Db, characterId: number) {
  const r = await one(db, 'SELECT city_id, until FROM hotel_stays WHERE character_id = $1 AND until > now()', [characterId]);
  return r ? { cityId: r.city_id as string, until: r.until.toISOString() as string } : null;
}

// ---------- Banka ----------

export async function bankMove(characterId: number, locationId: string, amount: number, direction: 'deposit' | 'withdraw') {
  if (!Number.isInteger(amount) || amount < 1) fail('invalid_amount');
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    requirePlace(ch, locationId, 'bank');
    if (direction === 'deposit') {
      if (ch.money < amount) fail('not_enough_money');
      // Boş hesaba ilk yatırımda faiz dönemi baştan başlar; yeni yatan para dönemin en düşük bakiyesini artırmaz
      await c.query(
        `UPDATE characters SET money = money - $2, bank = bank + $2, location_id = $3,
                bank_interest_at = CASE WHEN bank = 0 OR bank_interest_at IS NULL OR bank_interest_at <= now() THEN $4 ELSE bank_interest_at END,
                bank_min = CASE WHEN bank = 0 THEN 0 ELSE bank_min END
          WHERE id = $1`,
        [ch.id, amount, locationId, new Date(Date.now() + hoursMs(PACING.interestPeriodDays * 24))],
      );
    } else {
      if (ch.bank < amount) fail('not_enough_money');
      await c.query('UPDATE characters SET money = money + $2, bank = bank - $2, bank_min = LEAST(bank_min, bank - $2), location_id = $3 WHERE id = $1', [
        ch.id,
        amount,
        locationId,
      ]);
    }
    const r = await one(c, 'SELECT money, bank FROM characters WHERE id = $1', [ch.id]);
    return { money: r.money, bank: r.bank };
  });
}

/** Zamanlayıcı: haftalık faiz. Faiz, dönem boyunca hesapta hep kalan paraya (en düşük bakiyeye) işler. */
export async function processBankInterest(): Promise<number> {
  const r = await pool.query(
    `UPDATE characters SET bank = bank + floor(LEAST(bank_min, bank, $1::int) * $2::real)::int,
            bank_min = bank + floor(LEAST(bank_min, bank, $1::int) * $2::real)::int, bank_interest_at = $3
      WHERE bank > 0 AND bank_interest_at IS NOT NULL AND bank_interest_at <= now()`,
    [BANK_INTEREST_CAP, BANK_WEEKLY_INTEREST, new Date(Date.now() + hoursMs(PACING.interestPeriodDays * 24))],
  );
  return r.rowCount ?? 0;
}

// ---------- Dövme ----------

export async function getTattoo(characterId: number, locationId: string, tattooId: string) {
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    requirePlace(ch, locationId, 'tattoo');
    const def = TATTOO_BY_ID[tattooId];
    if (!def) fail('invalid_tattoo');
    const n = await one(c, 'SELECT count(*)::int AS n FROM tattoos WHERE character_id = $1', [ch.id]);
    if (n.n >= MAX_TATTOOS) fail('too_many_tattoos');
    if (ch.money < def!.price) fail('not_enough_money');
    await c.query('UPDATE characters SET money = money - $2, location_id = $3 WHERE id = $1', [ch.id, def!.price, locationId]);
    const r = await one(c, 'INSERT INTO tattoos(character_id, tattoo_id) VALUES ($1, $2) RETURNING id', [ch.id, def!.id]);
    return { id: r.id, price: def!.price };
  });
}

export async function removeTattoo(characterId: number, locationId: string, id: number) {
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    requirePlace(ch, locationId, 'tattoo');
    const t = await one(c, 'SELECT id FROM tattoos WHERE id = $1 AND character_id = $2', [id, ch.id]);
    if (!t) fail('not_found', 404);
    if (ch.money < TATTOO_REMOVAL_PRICE) fail('not_enough_money');
    await c.query('UPDATE characters SET money = money - $2 WHERE id = $1', [ch.id, TATTOO_REMOVAL_PRICE]);
    await c.query('DELETE FROM tattoos WHERE id = $1', [id]);
    return { ok: true };
  });
}

export async function tattoosOf(db: Db, characterId: number) {
  const rows = await many(db, 'SELECT id, tattoo_id, created_at FROM tattoos WHERE character_id = $1 ORDER BY id', [characterId]);
  return rows.map((r) => ({ id: r.id as number, tattooId: r.tattoo_id as string, createdAt: r.created_at.toISOString() as string }));
}
