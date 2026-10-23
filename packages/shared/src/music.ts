// Kayıt, yayınlar (single / albüm) ve haftalık listeler.
// Popmundo'daki gibi: şarkı önce kayıt stüdyosunda kaydedilir, sonra single ya da albümde yayınlanır.
// Satışlar her liste haftasının sonunda hesaplanır; şehir ve dünya listeleri çıkar, liste başarısı şöhret getirir.

import type { City, L } from './world';
import { clamp } from './rules';

export type ReleaseKind = 'single' | 'album';

export const RECORD_HOURS = 4;
/** Kayıt stüdyosunun saatlik ücreti (şehir çarpanıyla çarpılır) */
export const RECORDING_PRICE_PER_HOUR = 50;

/** Kayıt kalitesi: şarkının kalitesi, grubun şarkıya aşinalığı, rol becerileri ve yapımcılık becerisi */
export function recordingQuality(
  songQuality: number,
  avgFamiliarity: number,
  bandSkill: number,
  production: number,
  rand: () => number,
): number {
  const base = 0.45 * songQuality + 0.3 * avgFamiliarity + 0.25 * bandSkill;
  return Math.round(clamp(base + production * 0.12 + (rand() * 10 - 5), 1, 100));
}

export const RELEASE_RULES: Record<
  ReleaseKind,
  { minSongs: number; maxSongs: number; pressingCost: number; cooldownDays: number; price: number; weeks: number; decay: number; base: number }
> = {
  // price: tek kopyanın fiyatı (dolar). base: şöhret %100'de, kalite 70'te bir şehirdeki haftalık satış ölçeği.
  single: { minSongs: 1, maxSongs: 2, pressingCost: 100, cooldownDays: 7, price: 3.5, weeks: 8, decay: 0.7, base: 320 },
  album: { minSongs: 6, maxSongs: 12, pressingCost: 500, cooldownDays: 28, price: 15, weeks: 16, decay: 0.82, base: 140 },
};

export const RELEASE_NAMES: Record<ReleaseKind, L> = {
  single: { tr: 'Single', en: 'Single' },
  album: { tr: 'Albüm', en: 'Album' },
};

/** Satış gelirinin gruba kalan payı (gerisi plak şirketi ve dağıtım). Grup üyeleri arasında eşit bölünür. */
export const BAND_SHARE = 0.5;
/** Bir liste haftası kaç oyun günü */
export const CHART_WEEK_DAYS = 7;
export const CHART_SIZE = 20;

/** Pazar büyüklüğü: büyük ve pahalı şehirlerde daha çok plak satılır */
export const marketSize = (city: City) => 0.6 + city.costMult * 0.4;

/**
 * Bir yayının bir şehirdeki haftalık satışı.
 * weekIndex: yayının satışta geçirdiği hafta sayısı (0 = ilk hafta).
 */
export function weeklyUnits(
  kind: ReleaseKind,
  quality: number,
  fame: number,
  genrePop: number,
  city: City,
  weekIndex: number,
  rand: () => number,
): number {
  const r = RELEASE_RULES[kind];
  if (weekIndex >= r.weeks) return 0;
  const fanDraw = Math.pow(clamp(fame, 0, 100) / 100, 1.3);
  const qualityFactor = 0.3 + clamp(quality, 0, 100) / 100;
  const units = r.base * fanDraw * genrePop * qualityFactor * marketSize(city) * Math.pow(r.decay, weekIndex) * (0.85 + rand() * 0.3);
  // Az da olsa tanınan bir şehirde birkaç sadık dinleyici her zaman alır
  const loyal = fame > 0 && weekIndex < 3 ? Math.floor(rand() * 3) : 0;
  return Math.max(0, Math.round(units) + loyal);
}

/** Şehir listesindeki sıraya göre şöhret ödülü */
export function chartFameBonus(position: number, fame: number): number {
  const raw = position === 1 ? 1.5 : position <= 3 ? 1 : position <= 10 ? 0.5 : 0.2;
  return Math.round(raw * Math.max(0.15, 1 - fame / 120) * 10) / 10;
}

/** Bir yayının toplam satışı için altın / platin eşikleri */
export const GOLD_UNITS = 1000;
export const PLATINUM_UNITS = 10000;
