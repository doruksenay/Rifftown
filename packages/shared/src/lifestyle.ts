// Yaşam mekânları: restoran, otel, spor salonu, banka, dövme stüdyosu.

import type { L } from './world';
import { clamp } from './rules';
import { CITY_IDENTITY } from './content/cities';

// ---------- Restoran ----------

export type MealId = string;
export interface MealDef {
  id: MealId;
  name: L;
  /** Temel fiyat (şehir çarpanıyla çarpılır; oyuncu restoranında sahibin çarpanıyla da) */
  price: number;
  mood: number;
  health: number;
  /** Yerel lezzet: yalnızca bu şehrin restoranlarında */
  cityId?: string;
  /** Anında enerji (yoksa wellbeing.ts MEAL_ENERGY) */
  energy?: number;
}
export const MEALS: MealDef[] = [
  { id: 'soup', name: { tr: 'Mercimek çorbası', en: 'Lentil soup' }, price: 6, mood: 4, health: 1 },
  { id: 'daily', name: { tr: 'Günün yemeği', en: 'Dish of the day' }, price: 15, mood: 8, health: 3 },
  { id: 'chef', name: { tr: 'Şefin menüsü', en: "Chef's menu" }, price: 45, mood: 15, health: 5 },
];
// Her şehrin yerel lezzeti (content/cities.ts): günün yemeğinden biraz iyi, şefin menüsünden ucuz ve zayıf
MEALS.push(...CITY_IDENTITY.map((c) => ({ ...c.dish, cityId: c.cityId, energy: 22 })));
export const MEAL_BY_ID: Record<string, MealDef> = Object.fromEntries(MEALS.map((m) => [m.id, m]));
/** Bir şehrin restoranında yenebilecek yemekler */
export const mealsIn = (cityId: string) => MEALS.filter((m) => !m.cityId || m.cityId === cityId);
/** İki yemek arasında en az bu kadar oyun saati geçmeli (tokluk) */
export const MEAL_COOLDOWN_HOURS = 2;
/** Oyuncu restoranında satılan yemeğin maliyeti (malzeme): fiyatın bu kadarı kasaya girmez */
export const MEAL_COST_SHARE = 0.4;

// ---------- Otel ----------

/** Gecelik otel ücreti (şehir çarpanıyla çarpılır). Otelde dinlenmek daire konforundadır. */
export const HOTEL_PRICE_PER_NIGHT = 45;
export const HOTEL_NIGHT_OPTIONS = [1, 3, 7] as const;
export const HOTEL_REST_BONUS = 30;
export const HOTEL_HEALTH_PER_HOUR = 1;

// ---------- Spor salonu ----------

export const GYM_PRICE_PER_HOUR = 8;
/** Kondisyon yorucu işlerdeki sağlık kaybını azaltır: her seviye %0,4, en fazla %40 */
export const fitnessShield = (fitness: number) => clamp(fitness * 0.004, 0, 0.4);
/** Antrenmanda kondisyon kazancı (saat başına, azalan verimle) */
export const workoutGain = (fitness: number, hours: number) => hours * 1.2 * (1 - fitness / 130);

// ---------- Banka ----------

/** Haftalık faiz oranı ve faiz işleyen en yüksek bakiye. Bankadaki para cezalarda ve el koymada kullanılmaz. */
export const BANK_WEEKLY_INTEREST = 0.003;
export const BANK_INTEREST_CAP = 50000;

// ---------- Dövme ----------

export interface TattooDef {
  id: string;
  name: L;
  price: number;
}
export const TATTOOS: TattooDef[] = [
  { id: 'note', name: { tr: 'Küçük nota', en: 'Little music note' }, price: 120 },
  { id: 'star', name: { tr: 'Yıldız', en: 'Star' }, price: 150 },
  { id: 'rose', name: { tr: 'Gül', en: 'Rose' }, price: 300 },
  { id: 'mic', name: { tr: 'Eski mikrofon', en: 'Vintage microphone' }, price: 350 },
  { id: 'skull', name: { tr: 'Kafatası', en: 'Skull' }, price: 400 },
  { id: 'guitar', name: { tr: 'Alevli gitar', en: 'Flaming guitar' }, price: 600 },
  { id: 'koi', name: { tr: 'Koi balığı kol dövmesi', en: 'Koi sleeve' }, price: 1200 },
  { id: 'dragon', name: { tr: 'Ejderha sırt dövmesi', en: 'Dragon back piece' }, price: 2000 },
];
export const TATTOO_BY_ID: Record<string, TattooDef> = Object.fromEntries(TATTOOS.map((t) => [t.id, t]));
/** Her dövme sahne imajına +1 ekler, en fazla bu kadar */
export const MAX_TATTOO_BONUS = 4;
export const MAX_TATTOOS = 8;
export const TATTOO_REMOVAL_PRICE = 250;
