// Basın ve medya: grubun her şehirde ayrı bir basın desteği vardır (0–100, nötr 20).
// Basın desteği konser seyircisini ve şöhret kazancını etkiler; basın toplantısı ve röportaj artırır,
// gazetecilerin haberleri artırır ya da düşürür, skandallar düşürür. Zamanla nötre döner.

import type { L } from './world';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const PRESS_NEUTRAL = 20;
/** Her oyun günü nötre doğru kapanan mesafe oranı */
export const PRESS_DRIFT_PER_DAY = 0.03;

/** Basının şöhret kazancına etkisi: 0'da ×0,94, nötrde ×1, 100'de ×1,25 */
export const pressFameMult = (press: number) => 1 + (clamp(press, 0, 100) - PRESS_NEUTRAL) / 320;
/** Basının seyirciye etkisi: 0'da ×0,95, 100'de ×1,2 */
export const pressAttendanceMult = (press: number) => 1 + (clamp(press, 0, 100) - PRESS_NEUTRAL) / 400;

export type PressMode = 'conference' | 'interview';

export const PRESS_RULES: Record<PressMode, { hours: number; price: number; cooldownHours: number; gain: number; loss: number; leaderOnly: boolean; fame: number }> = {
  // price: şehir çarpanıyla; cooldown: basın toplantısı grup ve şehir başına, röportaj kişi başına
  conference: { hours: 2, price: 100, cooldownHours: 72, gain: 6, loss: 3, leaderOnly: true, fame: 0.3 },
  interview: { hours: 1, price: 0, cooldownHours: 24, gain: 3, loss: 1, leaderOnly: false, fame: 0 },
};

export interface PressSkills {
  media: number;
  rhetoric: number;
  charisma: number;
}

/** Başarı şansı: medya ilişkileri, retorik, karizma ve şöhret */
export const pressChance = (s: PressSkills, fame: number) =>
  clamp(0.4 + s.media * 0.004 + s.rhetoric * 0.003 + s.charisma * 0.002 + fame / 300, 0.15, 0.95);

/** Başarılı basın etkinliğinin kazancı */
export const pressGain = (mode: PressMode, s: PressSkills) => {
  const r = PRESS_RULES[mode];
  return Math.round((r.gain + (mode === 'conference' ? s.media / 20 : s.charisma / 40)) * 10) / 10;
};

/** Basın toplantısı, son bu kadar gündeki skandalı yatıştırabilir (kaybın yarısı geri gelir) */
export const SCANDAL_DEFUSE_DAYS = 7;
export const SCANDAL_DEFUSE_SHARE = 0.5;

// ---------- Gazetecilik ----------

export const ARTICLE_HOURS = 2;
export type ArticleTone = 'positive' | 'neutral' | 'negative';
export const ARTICLE_TONES: ArticleTone[] = ['positive', 'neutral', 'negative'];
export const ARTICLE_TITLE_MAX = 80;
export const ARTICLE_BODY_MIN = 20;
export const ARTICLE_BODY_MAX = 2000;
/** Aynı gazeteci aynı grup hakkında bu kadar oyun saatinde bir yazabilir */
export const ARTICLE_COOLDOWN_HOURS = 72;
/** Bir grubun bir şehirdeki basın desteği, haberlerle 7 günde toplam bu kadardan fazla oynamaz (toplu karalama olmasın) */
export const ARTICLE_WEEKLY_CAP = 20;

/** Haberin basın desteğine etkisi: gazetecilik, söz yazımı ve rütbeye göre (olumsuz haber %80'i kadar) */
export function articleImpact(tone: ArticleTone, journalism: number, lyrics: number, rank: number): number {
  if (tone === 'neutral') return 0.5;
  const mag = 2 + journalism * 0.05 + lyrics * 0.02 + rank;
  return Math.round((tone === 'positive' ? mag : -mag * 0.8) * 10) / 10;
}

export const PRESS_MODE_NAMES: Record<PressMode, L> = {
  conference: { tr: 'Basın toplantısı', en: 'Press conference' },
  interview: { tr: 'Röportaj', en: 'Interview' },
};
