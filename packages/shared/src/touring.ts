// Turne: ekip rolleri ve moral, araç arızası ve tamir kiti, sahne ekipmanının yıpranması, turne planı.
// Ekip oyunun kendi çalışanlarıdır (NPC); grup lideri işe alır, her konserde ücretleri bilet gelirinden ödenir.

import type { L } from './world';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const CREW_ROLES = ['loader', 'sound_tech', 'light_tech', 'driver', 'assistant', 'tour_manager', 'promoter', 'accountant'] as const;
export type CrewRole = (typeof CREW_ROLES)[number];

export interface CrewRoleDef {
  id: CrewRole;
  name: L;
  about: L;
  /** Konser başına ücret (şehir çarpanıyla) */
  fee: number;
}

const R = (id: CrewRole, fee: number, tr: [string, string], en: [string, string]): CrewRoleDef => ({ id, fee, name: { tr: tr[0], en: en[0] }, about: { tr: tr[1], en: en[1] } });

export const CREW: Record<CrewRole, CrewRoleDef> = {
  loader: R('loader', 25, ['Yükleme ekibi', 'Ekipmanı taşır; enstrümanlar daha az yıpranır.'], ['Road crew', 'Hauls the gear; instruments wear out less.']),
  sound_tech: R('sound_tech', 60, ['Ses teknisyeni', 'Konserde ses düzgün çıkar: kaliteye katkı.'], ['Sound engineer', 'The mix sounds right: adds to gig quality.']),
  light_tech: R('light_tech', 45, ['Işık teknisyeni', 'Sahne ışığı şovu büyütür: kaliteye küçük katkı.'], ['Lighting tech', 'Lights make the show bigger: small quality boost.']),
  driver: R('driver', 30, ['Şoför', 'Turne aracını o kullanır; arıza riski yarıya iner.'], ['Driver', 'Drives the tour vehicle; halves breakdowns.']),
  assistant: R('assistant', 30, ['Kişisel asistan', 'Grubun işlerini halleder; konser daha az yorar.'], ['Personal assistant', 'Handles the errands; gigs tire you less.']),
  tour_manager: R('tour_manager', 70, ['Tur menajeri', 'Ekibin morali daha yavaş düşer.'], ['Tour manager', 'Keeps crew morale from sinking.']),
  promoter: R('promoter', 55, ['Promotör', 'Konserleri duyurur: daha çok seyirci.'], ['Promoter', 'Gets the word out: bigger crowds.']),
  accountant: R('accountant', 40, ['Muhasebeci', 'Ekip ücretlerinden tasarruf sağlar.'], ['Accountant', 'Saves money on crew wages.']),
};

/** Ekip etkileri (moral 50'nin altındaysa yarısı, 20'nin altındaysa hiçbiri) */
export const CREW_EFFECTS = {
  /** loader: enstrüman yıpranması çarpanı */
  loaderWear: 0.4,
  soundQuality: 3,
  lightQuality: 1.5,
  driverBreakdown: 0.5,
  assistantEnergy: 6,
  /** tur menajeri: konser başına moral kaybı çarpanı */
  managerMorale: 0.5,
  promoterAttendance: 0.08,
  accountantFees: 0.15,
} as const;

export const crewEffectScale = (morale: number) => (morale < 20 ? 0 : morale < 50 ? 0.5 : 1);

/** Moral: her konser −4 (tur menajeriyle −2), iyi konser +3, ücreti ödenmeyen konser −25; konser olmayan her oyun günü +5 */
export const CREW_MORALE = { perGig: -4, goodGig: 3, unpaid: -25, restPerDay: 5, quitBelow: 10, start: 70 } as const;
export const MAX_CREW = CREW_ROLES.length;

export function crewFees(roles: CrewRole[], costMult: number): number {
  const has = new Set(roles);
  const raw = roles.reduce((s, r) => s + CREW[r].fee, 0) * costMult;
  return Math.round(raw * (has.has('accountant') ? 1 - CREW_EFFECTS.accountantFees : 1));
}

// ---------- Araç arızası ----------

/** Araçla yolculukta arıza şansı: yıpranmaya ve sürücülük/mekanik becerisine göre; şoför yarıya indirir */
export function breakdownChance(wear: number, driving: number, mechanics: number, hasDriver: boolean): number {
  const base = 0.03 + clamp(wear, 0, 100) * 0.004;
  return clamp(base * (1 - driving / 250) * (1 - mechanics / 250) * (hasDriver ? CREW_EFFECTS.driverBreakdown : 1), 0.005, 0.5);
}
/** Arıza yolculuğu uzatır: tamir kiti varsa %15, yoksa %60 */
export const BREAKDOWN_DELAY = { withKit: 0.15, withoutKit: 0.6 } as const;
/** Yolculukta her 100 km'de araç yıpranması */
export const VEHICLE_WEAR_PER_100KM = 1.2;

// ---------- Sahne ekipmanı yıpranması ----------

/** Her konserde kuşanılmış enstrümanın yıpranması (yükleme ekibi azaltır) */
export const GIG_GEAR_WEAR = 3;
/** Yıpranmanın bonusa etkisi: %100 yıpranmış enstrüman bonusunun yarısını verir */
export const wornBonus = (bonus: number, wear: number) => Math.round(bonus * (1 - clamp(wear, 0, 100) / 200) * 10) / 10;
/** Tamir: tamir kiti tek eşyayı, bakım paketi bütün kuşanılmış ekipmanı onarır */
export const REPAIR = { kitWear: 60, serviceWear: 100 } as const;

// ---------- Turne planı ----------

export const TOUR_MIN_CITIES = 3;
export const TOUR_MAX_CITIES = 8;
export const TOUR_MAX_DAYS = 28;
/** Turne tamamlanınca her turne şehrine şöhret ve ekibe moral */
export const TOUR_FAME_BONUS = 0.6;
export const TOUR_MORALE_BONUS = 15;
