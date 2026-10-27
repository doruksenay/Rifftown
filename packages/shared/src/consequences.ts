// Kayıp ve sonuç: kötü kararın bir bedeli olsun.
// - Çalınmayan şarkının aşinalığı zamanla çürür.
// - Şöhret, o şehirde uzun süre konser verilmezse azalır.
// - Üye ayrılınca ya da çıkarılınca grup şöhret kaybeder.
// - Konser iptalinin cezası satılmış bilet sayısıyla büyür.
// - Karakter yaşlanır (oyun yılı); yaş öğrenmeyi yavaşlatır.
// - Aşırı alışveriş ve tüketim bağımlılık yapar.
// - Skandallar şöhreti düşürür.
// - Ölüm yalnızca PERMADEATH bayrağı açıkken vardır (varsayılan kapalı).

import type { L } from './world';
import { VENUE_RULES, type VenueType } from './world';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

// ---------- Aşinalık çürümesi ----------

/** Bu kadar oyun günü çalınmayan ya da prova edilmeyen şarkı unutulmaya başlar (Popmundo: 10–14 gün) */
export const FAMILIARITY_GRACE_DAYS = 12;
/** Eşikten sonra her oyun günü kaybedilen aşinalık */
export const FAMILIARITY_DECAY_PER_DAY = 1.5;
/** Çürüme bu değerin altına indirmez (şarkı tamamen unutulmaz) */
export const FAMILIARITY_FLOOR = 15;

export function decayedFamiliarity(value: number, idleDays: number): number {
  const days = idleDays - FAMILIARITY_GRACE_DAYS;
  if (days <= 0 || value <= FAMILIARITY_FLOOR) return value;
  return Math.max(FAMILIARITY_FLOOR, value - days * FAMILIARITY_DECAY_PER_DAY);
}

// ---------- Şöhretin azalması ----------

/** O şehirde bu kadar oyun günü konser verilmezse şöhret azalmaya başlar (Popmundo: 48–60 gün) */
export const FAME_GRACE_DAYS = 54;
/** Eşikten sonra her oyun günü kaybedilen şöhret oranı ve en az puan */
export const FAME_DECAY_RATE_PER_DAY = 0.01;
export const FAME_DECAY_MIN_PER_DAY = 0.05;

/** idleDays: o şehirdeki son konserden bu yana geçen gün; elapsedDays: bu çürüme turunun kapsadığı gün */
export function fameDecay(fame: number, elapsedDays: number): number {
  if (elapsedDays <= 0 || fame <= 0) return 0;
  const perDay = Math.max(FAME_DECAY_MIN_PER_DAY, fame * FAME_DECAY_RATE_PER_DAY);
  return Math.round(Math.min(fame, perDay * elapsedDays) * 100) / 100;
}

// ---------- Üye ayrılması ----------

/** Üye ayrılınca ya da çıkarılınca grubun her şehirdeki şöhretinden düşen oran */
export const MEMBER_LEAVE_FAME_LOSS = 0.06;
/** Grupta bu kadar oyun saatinden kısa kalan üyenin ayrılması ceza getirmez (yanlış davet, deneme) */
export const MEMBER_LEAVE_GRACE_HOURS = 24;

// ---------- Konser iptali ----------

/** Rezervasyon anından konsere doğru biletler satılır: iptal anında satılmış bilet tahmini */
export function ticketsSold(expected: number, elapsedHours: number, leadHours: number): number {
  const frac = leadHours > 0 ? clamp(elapsedHours / leadHours, 0.1, 1) : 1;
  return Math.round(expected * frac);
}

/** İptalin şöhret cezası: satılan biletle büyür (en az 0,5, en fazla 6) */
export function cancelFamePenalty(venue: VenueType, sold: number): number {
  const cap = VENUE_RULES[venue].capacity;
  return round1(clamp(0.5 + (sold / Math.max(1, cap)) * 2 * VENUE_RULES[venue].fameMult, 0.5, 6));
}
/** Satılan biletin kapasiteye oranı bunu geçerse iptal skandala dönüşür */
export const CANCEL_SCANDAL_RATIO = 0.5;

// ---------- Yaşlanma ----------

/** Bir oyun yılı kaç oyun günü (gerçek zamanda GAME_SPEED=1 iken yaklaşık 8 hafta) */
export const GAME_YEAR_DAYS = 56;
export const START_AGE = 18;

export function ageOf(createdAt: Date | string, gameSpeed: number, nowMs = Date.now()): number {
  const gameDays = ((nowMs - new Date(createdAt).getTime()) * gameSpeed) / 86_400_000;
  return START_AGE + Math.max(0, gameDays) / GAME_YEAR_DAYS;
}

/** Yaş öğrenmeyi yavaşlatır: 35'ten sonra her yıl %1, en fazla %40 */
export const ageLearnFactor = (age: number) => clamp(1 - Math.max(0, age - 35) * 0.01, 0.6, 1);

// ---------- Bağımlılık ----------

/** Harcamalardan gelen "düşkünlük": alışverişte her $150 için 1 (tek alışverişte en fazla 3), her yemekte 1 */
export const indulgenceForSpend = (amount: number) => clamp(Math.ceil(amount / 150), 1, 3);
export const INDULGENCE_PER_MEAL = 1;
/** Her oyun günü sönen düşkünlük (günde 3–4 yemek bağımlılık yapmaz) */
export const INDULGENCE_DECAY_PER_DAY = 4;
/** Bu düşkünlükte bağımlılık başlar, şunun altına inince geçer */
export const ADDICTION_THRESHOLD = 16;
export const ADDICTION_RECOVERY = 6;
/** Hastanede tedavi her saat düşkünlüğü bu kadar azaltır */
export const ADDICTION_TREAT_PER_HOUR = 2;
/** Bağımlı biri son bu kadar saatte "isteğini gidermediyse" canı çeker (ruh hâli düşer) */
export const CRAVING_HOURS = 12;

export const indulgenceNow = (stored: number, at: Date | string | null, gameSpeed: number, nowMs = Date.now()) => {
  const t = at ? new Date(at).getTime() : nowMs;
  const days = Math.max(0, ((nowMs - t) * gameSpeed) / 86_400_000);
  return Math.max(0, stored - days * INDULGENCE_DECAY_PER_DAY);
};

// ---------- Skandal ----------

export type ScandalKind = 'conviction' | 'cancel' | 'disaster' | 'addiction' | 'affair';

export interface ScandalDef {
  kind: ScandalKind;
  /** Şehirdeki şöhret kaybı (puan); aynı ülkedeki şehirlere %30'u */
  fame: number;
  /** Basın desteğine etkisi (bkz. press.ts) */
  press: number;
  name: L;
}

export const SCANDALS: Record<ScandalKind, ScandalDef> = {
  conviction: { kind: 'conviction', fame: 2, press: 15, name: { tr: 'Grup üyesi hüküm giydi', en: 'Band member convicted' } },
  cancel: { kind: 'cancel', fame: 1, press: 8, name: { tr: 'Son dakika iptali', en: 'Last-minute cancellation' } },
  disaster: { kind: 'disaster', fame: 1.5, press: 10, name: { tr: 'Felaket bir konser', en: 'A disastrous show' } },
  addiction: { kind: 'addiction', fame: 1, press: 10, name: { tr: 'Bağımlılık haberi', en: 'Addiction story' } },
  // Tek gecelik macera dedikodusu (relations.ts): küçük
  affair: { kind: 'affair', fame: 0.5, press: 6, name: { tr: 'Magazin dedikodusu', en: 'Tabloid gossip' } },
};
export const SCANDAL_SPILLOVER = 0.3;
/** Bu kalitenin altında biten kulüp ve üstü konser skandal olur */
export const DISASTER_QUALITY = 10;
/** Bağımlılığın skandala dönüşmesi için grubun o şehirde bu şöhrette olması gerekir */
export const ADDICTION_SCANDAL_FAME = 30;

// ---------- Hastaneye kaldırılma ve ölüm ----------

/** Sağlık bunun altına inen karakter (eylemi yoksa) kendiliğinden hastaneye kaldırılır (Popmundo: %15) */
export const HOSPITALIZE_HEALTH = 10;
export const HOSPITALIZE_HOURS = 4;
/** PERMADEATH açıkken: sağlık bu değerin altında bu kadar oyun saati kalırsa karakter ölür */
export const CRITICAL_HEALTH = 3;
export const NEGLECT_DEATH_HOURS = 48;
/** PERMADEATH açıkken: bu yaştan sonra her oyun günü küçük bir ölüm olasılığı */
export const OLD_AGE_START = 85;
export const oldAgeDeathChancePerDay = (age: number) => (age < OLD_AGE_START ? 0 : Math.min(0.2, 0.002 * Math.pow(age - OLD_AGE_START + 1, 1.5)));
/** Ölen karakterin parasının yeni karaktere kalan payı ve tavanı */
export const INHERITANCE_SHARE = 0.5;
export const INHERITANCE_CAP = 10_000;
