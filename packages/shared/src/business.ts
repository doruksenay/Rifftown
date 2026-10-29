// Oyuncu işletmeleri. Her şehirde sınırlı sayıda bar ve restoran ruhsatı vardır (world.ts: business).
// İşletme açıkken para kazanmak için mesai gerekir: sahibi ya da çalışanları orada çalıştıkça kasaya
// müşteri parası girer, çalışanların maaşı kasadan ödenir. Her hafta gider kesilir.
// Barlar aynı zamanda konser mekânıdır: sahibi bilet gelirinden pay alır.
// Restoranlarda yemek satılır; sahibi fiyat çarpanını belirler.

import type { BusinessType, L } from './world';

export interface BusinessRule {
  name: L;
  /** Ruhsat fiyatı (şehir çarpanıyla çarpılır) */
  price: number;
  /** Haftalık gider: kira, fatura, vergi (şehir çarpanıyla çarpılır) */
  upkeep: number;
  /** Mesai saati başına kasaya giren müşteri parası (şehir çarpanıyla çarpılır) */
  revenuePerHour: number;
}

/**
 * Mesai geliri 20 → 12 (bar), 24 → 14 (restoran). Eskiden 5 ek hesap en düşük maaşla çalışıp bara günde $1.650–5.078
 * net basıyordu, ruhsat 7–12 günde geri ödeniyordu (denge raporu §7). Ayrıca günlük müşteri tavanı ve daha küçük
 * işletmecilik bonusu (aşağıda).
 */
export const BUSINESS_RULES: Record<BusinessType, BusinessRule> = {
  bar: { name: { tr: 'Bar', en: 'Bar' }, price: 20000, upkeep: 350, revenuePerHour: 12 },
  restaurant: { name: { tr: 'Restoran', en: 'Restaurant' }, price: 14000, upkeep: 300, revenuePerHour: 14 },
};
/** Bir işletmenin kayan 24 oyun saatinde gelir getiren en fazla mesai saati (müşteri sınırlı; fazla çalışan gelir getirmez) */
export const BUSINESS_DAILY_REVENUE_HOURS = 16;
/** İşletmecilik becerisinin gelire en fazla katkısı (eskiden %50) */
export const BUSINESS_SKILL_MAX_BONUS = 0.2;

export const MAX_EMPLOYEES = 5;
/** Sahibinin belirleyebileceği saatlik maaş aralığı */
export const WAGE_RANGE: [number, number] = [5, 60];
/** Barda konser verildiğinde bilet gelirinden sahibinin alabileceği en yüksek pay */
export const MAX_GIG_SHARE = 0.3;
/** Restoran yemek fiyatı çarpanı aralığı */
export const MENU_MULT_RANGE: [number, number] = [0.8, 1.6];
/** Satarken oyunun ödediği oran */
export const BUSINESS_SELL_BACK = 0.5;
export const BUSINESS_HOUR_OPTIONS = [2, 4, 8] as const;
export const BUSINESS_NAME_RE = /^[\p{L}\p{N} '’.&!-]{2,32}$/u;

/** Mesai saatlerinin kasaya getirdiği para: işletmecilik becerisi en fazla BUSINESS_SKILL_MAX_BONUS artırır */
export const staffedRevenue = (rule: BusinessRule, costMult: number, hours: number, businessSkill: number) =>
  Math.round(rule.revenuePerHour * costMult * hours * (1 + (Math.min(100, Math.max(0, businessSkill)) / 100) * BUSINESS_SKILL_MAX_BONUS));
