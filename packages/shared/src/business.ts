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

export const BUSINESS_RULES: Record<BusinessType, BusinessRule> = {
  bar: { name: { tr: 'Bar', en: 'Bar' }, price: 20000, upkeep: 350, revenuePerHour: 20 },
  restaurant: { name: { tr: 'Restoran', en: 'Restaurant' }, price: 14000, upkeep: 300, revenuePerHour: 24 },
};

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

/** Bir mesai saatinin kasaya getirdiği para: işletmecilik becerisi en fazla %50 artırır */
export const staffedRevenue = (rule: BusinessRule, costMult: number, hours: number, businessSkill: number) =>
  Math.round(rule.revenuePerHour * costMult * hours * (1 + Math.min(100, businessSkill) / 200));
