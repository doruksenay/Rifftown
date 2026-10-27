// Atölye: hırdavatçıdan alınan malzemelerle enstrüman ve kostüm üretmek.
// Ürünün kalitesi (bonusu) el işçiliği becerisine bağlıdır; usta bir zanaatkârın elinden çıkan
// gitar dükkândaki en iyi gitardan iyi olabilir. Üretilen eşyalar ikinci el pazarında satılabilir.

import type { L } from './world';
import { clamp } from './rules';
import { EXTRA_RECIPES } from './content/items';
import { MORE_RECIPES } from './content/recipes';

export const CRAFT_HOURS = 4;

export interface RecipeDef {
  id: string;
  /** Üretilen eşyanın kimliği (items.ts içinde crafted: true) */
  itemId: string;
  name: L;
  /** malzeme kimliği → adet */
  materials: Record<string, number>;
  /** El işçiliği 0 ile 100 arasındayken bonus aralığı */
  bonus: [number, number];
  /** Tarifi yapabilmek için gereken beceri ve en düşük seviyesi (yoksa herkes yapabilir) */
  skill?: { id: string; min: number };
  /** Üretim süresi, oyun saati (yoksa CRAFT_HOURS) */
  hours?: number;
}

const instrument = (id: string, tr: string, en: string, materials: Record<string, number>): RecipeDef => ({
  id,
  itemId: `${id}_crafted`,
  name: { tr, en },
  materials,
  bonus: [3, 14],
});

export const RECIPES: RecipeDef[] = [
  instrument('guitar', 'Gitar', 'Guitar', { mat_wood: 1, mat_strings: 1, mat_pickup: 1 }),
  instrument('bass', 'Bas gitar', 'Bass', { mat_wood: 1, mat_strings: 1, mat_pickup: 1 }),
  instrument('drums', 'Davul seti', 'Drum kit', { mat_wood: 1, mat_drumhead: 2 }),
  instrument('keys', 'Synthesizer', 'Synthesizer', { mat_circuit: 1, mat_keys: 1 }),
  instrument('vocals', 'Mikrofon', 'Microphone', { mat_capsule: 1, mat_circuit: 1 }),
  instrument('sax', 'Saksofon', 'Saxophone', { mat_brass: 1, mat_reed: 2 }),
  instrument('violin', 'Keman', 'Violin', { mat_wood: 1, mat_strings: 1, mat_bow: 1 }),
  instrument('percussion', 'Konga', 'Conga', { mat_wood: 1, mat_drumhead: 1, mat_leather: 1 }),
  { id: 'outfit', itemId: 'outfit_crafted', name: { tr: 'Sahne kostümü', en: 'Stage costume' }, materials: { mat_fabric: 2, mat_sequins: 1 }, bonus: [2, 13] },
];
// Veri dosyalarındaki ek tarifler
RECIPES.push(...EXTRA_RECIPES, ...MORE_RECIPES);
export const RECIPE_BY_ID: Record<string, RecipeDef> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

/** Tarifin üretim süresi (oyun saati) */
export const recipeHours = (r: RecipeDef) => r.hours ?? CRAFT_HOURS;
/** Beceri eşiği karşılanıyor mu? (Bilinmeyen beceri 0 sayılır) */
export const meetsRecipeSkill = (r: RecipeDef, skills: Record<string, number>) => !r.skill || (skills[r.skill.id] ?? 0) >= r.skill.min;

/** Üretilen eşyanın bonusu */
export function craftBonus(recipe: RecipeDef, craftsmanship: number, rand: () => number): number {
  const [lo, hi] = recipe.bonus;
  const t = Math.pow(clamp(craftsmanship, 0, 100) / 100, 0.8);
  return Math.round(clamp(lo + (hi - lo) * t + (rand() * 2 - 1), lo, hi + 1));
}
