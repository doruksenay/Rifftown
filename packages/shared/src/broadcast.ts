// Müzik klibi, radyo ve plak şirketi.
// - Klip: kayıtlı bir şarkı için çekilir; yönetmenlik ve oyunculuk kaliteyi belirler; klip listesi ve satışa etkisi.
// - Radyo: her liste haftası single'lar şehir radyolarında çalınır; çalınma şehirde şöhret ve sonraki hafta satış getirir.
// - Plak şirketi: oyuncu işletmesi; gruplarla gelir payı sözleşmesi (pazarlıkla), avans ve geri ödeme.
// - Prodüktör: kayıtta gruptaki en iyi yapımcı rolü üstlenir ya da dışarıdan prodüktör tutulur.

import type { L } from './world';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// ---------- Klip ----------

export const VIDEO_HOURS = 6;
/** Çekim ücreti (şehir çarpanıyla); dışarıdan yönetmen tutmak ek ücretli */
export const VIDEO_PRICE = 400;
export const VIDEO_DIRECTORS = {
  none: { fee: 0, skill: 0 },
  indie: { fee: 500, skill: 45 },
  pro: { fee: 2500, skill: 75 },
} as const;
export type VideoDirector = keyof typeof VIDEO_DIRECTORS;
/** Aynı grup bu kadar oyun gününde bir klip çekebilir */
export const VIDEO_COOLDOWN_DAYS = 14;
/** Klip listesinde kaç hafta kalır ve haftalık izlenme düşüşü */
export const VIDEO_WEEKS = 12;
export const VIDEO_DECAY = 0.8;
export const VIDEO_CHART_SIZE = 20;

/** Klip kalitesi: kayıt kalitesi, yönetmenlik (grupta ya da tutulan yönetmen) ve sahnedekilerin oyunculuğu */
export const videoQuality = (recording: number, directing: number, acting: number, rand: () => number) =>
  Math.round(clamp(0.45 * recording + 0.3 * directing + 0.25 * acting + (rand() * 10 - 5), 1, 100));

/** Haftalık izlenme: kalite, şöhret ve basın */
export const videoViews = (quality: number, fame: number, press: number, week: number, rand: () => number) =>
  week >= VIDEO_WEEKS ? 0 : Math.round(200 * (0.2 + quality / 100) * (0.05 + fame / 100) * (0.8 + press / 100) * Math.pow(VIDEO_DECAY, week) * (0.85 + rand() * 0.3));

/** Klibi olan şarkının yayını daha çok satar: en fazla +%15 */
export const videoSalesBoost = (quality: number) => 1 + clamp(quality, 0, 100) * 0.0015;
/** Klip listesi sırasına göre şöhret (dünya listesi; grubun en tanındığı şehre) */
export const videoChartFame = (position: number) => (position === 1 ? 0.6 : position <= 3 ? 0.35 : position <= 10 ? 0.15 : 0.05);

// ---------- Radyo ----------

/** Bir single'ın bir şehir radyosunda bir haftada çalınma sayısı */
export function radioPlays(quality: number, fame: number, genrePop: number, press: number, week: number, rand: () => number): number {
  if (fame <= 0 || week >= 10) return 0;
  const v = 40 * (quality / 100) ** 1.5 * (0.1 + fame / 100) * genrePop * (0.8 + press / 100) * Math.pow(0.82, week) * (0.85 + rand() * 0.3);
  return Math.max(0, Math.round(v));
}
/** Radyo çalınmasının şehirdeki şöhret etkisi (haftada en fazla 0,4) ve sonraki haftaki satışa etkisi (en fazla +%15) */
export const radioFame = (plays: number) => Math.round(Math.min(0.4, plays * 0.01) * 100) / 100;
export const radioSalesBoost = (plays: number) => 1 + Math.min(0.15, plays * 0.004);

// ---------- Plak şirketi ----------

export const LABEL_FOUND_PRICE = 30000;
export const LABEL_WEEKLY_UPKEEP = 400;
export const LABEL_MAX_ROSTER = 5;
export const LABEL_NAME_RE = /^[\p{L}\p{N} '’.&!-]{2,32}$/u;
/**
 * Plak şirketli yayında brüt gelirin dağılımı: %40 dağıtım (oyundan çıkar), kalan %60 sözleşmeyle bölünür.
 * Şirketsiz yayında grup %50 alır (music.ts BAND_SHARE). Böylece şirket + grup toplamı yalnızca %10 artar
 * ve bu fark şirketin haftalık gideriyle ve pazarlama etkisiyle dengelenir.
 */
export const LABEL_POOL = 0.6;
export const LABEL_BAND_SHARE_RANGE: [number, number] = [0.3, 0.6];
/** Şirketin pazarlaması: sözleşmeli grubun yayınları %10 daha çok satar */
export const LABEL_SALES_BOOST = 1.1;
/** Avans tavanı: para gönderme ve takas parasıyla aynı (ek hesaplar arası para taşıma yolu olmasın) */
export const LABEL_ADVANCE_MAX = 5000;
export const LABEL_CONTRACT_WEEKS: [number, number] = [4, 52];
/** Sözleşme için grubun herhangi bir şehirde en az bu şöhrette olması gerekir */
export const LABEL_MIN_FAME = 15;

/** Bir haftalık brüt satışın grup ve şirket arasında bölünmesi; avans grubun payından geri alınır */
export function labelSplit(gross: number, bandShare: number, outstanding: number) {
  const pool = gross * LABEL_POOL;
  const bandRaw = Math.round(pool * clamp(bandShare, LABEL_BAND_SHARE_RANGE[0], LABEL_BAND_SHARE_RANGE[1]));
  const recouped = Math.max(0, Math.min(bandRaw, Math.round(outstanding)));
  return { band: bandRaw - recouped, label: Math.round(pool) - bandRaw + recouped, recouped };
}

// ---------- Prodüktör ----------

export const PRODUCERS = {
  junior: { fee: 150, skill: 35 },
  pro: { fee: 600, skill: 60 },
  star: { fee: 2000, skill: 85 },
} as const;
export type ProducerTier = keyof typeof PRODUCERS;

export const PRODUCER_NAMES: Record<ProducerTier, L> = {
  junior: { tr: 'Genç prodüktör', en: 'Junior producer' },
  pro: { tr: 'Deneyimli prodüktör', en: 'Seasoned producer' },
  star: { tr: 'Yıldız prodüktör', en: 'Star producer' },
};
export const DIRECTOR_NAMES: Record<VideoDirector, L> = {
  none: { tr: 'Kendimiz çekeriz', en: 'Shoot it ourselves' },
  indie: { tr: 'Bağımsız yönetmen', en: 'Indie director' },
  pro: { tr: 'Ünlü yönetmen', en: 'Big-name director' },
};
