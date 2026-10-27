// Kariyer becerilerinin dar ve tavanlı etkileri: pazarlama, muhasebe, lojistik, sözleşme hukuku,
// radyo programcılığı ve fotoğrafçılık. Hepsi 0–100 beceri üzerinden doğrusal büyür ve küçük bir tavanda durur;
// böylece "her şeyi öğren" stratejisi ekonomiyi şişirmez. Etkiyi grubun o işte en iyi üyesi taşır
// (sözleşme hukukunda grup lideri, işletme giderinde işletmenin sahibi, haberde yazarın kendisi).

import { LABEL_BAND_SHARE_RANGE } from './broadcast';

const k = (level: number | undefined) => Math.min(100, Math.max(0, Number(level) || 0)) / 100;
const r3 = (v: number) => Math.round(v * 1000) / 1000;

/** Beceri 100 iken etkinin büyüklüğü (tavan) */
export const PERK_CAPS = {
  /** pazarlama: konser seyircisi ve haftalık plak satışı en fazla +%5 */
  marketingAttendance: 0.05,
  marketingSales: 0.05,
  /** muhasebe: tur ekibi ücretleri, işletme ve plak şirketi haftalık gideri en fazla −%10 */
  accountingCosts: 0.1,
  /** lojistik: konser başı ekip moral kaybı en fazla −%30, enstrüman yıpranması en fazla −%25 */
  logisticsMorale: 0.3,
  logisticsWear: 0.25,
  /** sözleşme hukuku: grubun alabileceği en yüksek pay +5 puan (%60 → %65) */
  contractShare: 0.05,
  /** radyo programcılığı: single'ların radyoda çalınması en fazla +%10 */
  radioPlays: 0.1,
  /** fotoğrafçılık: haberin basın etkisine en fazla +2 puan (olumsuzda %80'i), klip kalitesine en fazla +4 */
  photoArticle: 2,
  photoVideo: 4,
} as const;

export const marketingAttendanceMult = (marketing: number) => r3(1 + k(marketing) * PERK_CAPS.marketingAttendance);
export const marketingSalesMult = (marketing: number) => r3(1 + k(marketing) * PERK_CAPS.marketingSales);
export const accountingCostMult = (accounting: number) => r3(1 - k(accounting) * PERK_CAPS.accountingCosts);
export const logisticsMoraleMult = (logistics: number) => r3(1 - k(logistics) * PERK_CAPS.logisticsMorale);
export const logisticsWearMult = (logistics: number) => r3(1 - k(logistics) * PERK_CAPS.logisticsWear);
export const radioHostingMult = (radio: number) => r3(1 + k(radio) * PERK_CAPS.radioPlays);
export const photographyArticleBonus = (photo: number) => Math.round(k(photo) * PERK_CAPS.photoArticle * 10) / 10;
export const photographyVideoBonus = (photo: number) => Math.round(k(photo) * PERK_CAPS.photoVideo * 10) / 10;

/** Plak şirketi sözleşmesinde grubun payı için üst sınır: grup liderinin sözleşme hukukuna bağlı */
export const maxBandShare = (contractLaw: number) => r3(LABEL_BAND_SHARE_RANGE[1] + k(contractLaw) * PERK_CAPS.contractShare);
/** Veritabanındaki kısıtla aynı: hiçbir sözleşmede pay bunu aşamaz */
export const LABEL_BAND_SHARE_HARD_MAX = LABEL_BAND_SHARE_RANGE[1] + PERK_CAPS.contractShare;
