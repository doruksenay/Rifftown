// Ev ve kira. Ev bir şehirde tutulur; o şehirdeyken dinlenmek evdeki konfora göre daha çok ruh hâli ve sağlık getirir.
// Kira her 7 oyun gününde bir kendiliğinden ödenir; para yetmezse oyuncu evden çıkarılır.
// Evi olmayan oyuncu arkadaşının kanepesinde kalır: ücretsiz, bonussuz.

import { PACING } from './pacing';
import type { L } from './world';

export type HomeId = 'room' | 'flat' | 'loft' | 'house' | 'penthouse';

export interface HomeDef {
  id: HomeId;
  name: L;
  about: L;
  /** Haftalık kira (şehir çarpanıyla çarpılır) */
  rent: number;
  /** Dinlenirken ruh hâli kazancına eklenen yüzde (sanat eserleriyle toplanır, en fazla %100) */
  restBonus: number;
  /** Dinlenirken saat başına ek sağlık */
  healthPerHour: number;
  vip?: boolean;
}

export const HOMES: HomeDef[] = [
  {
    id: 'room',
    name: { tr: 'Kiralık oda', en: 'Rented room' },
    about: { tr: 'Paylaşımlı bir dairede küçük bir oda. Kanepeden iyidir.', en: 'A small room in a shared flat. Beats the couch.' },
    rent: 60,
    restBonus: 15,
    healthPerHour: 0.5,
  },
  {
    id: 'flat',
    name: { tr: 'Daire', en: 'Flat' },
    about: { tr: 'Kendine ait bir daire. Sessiz, rahat, komşular toleranslı.', en: 'A flat of your own. Quiet, comfy, tolerant neighbours.' },
    rent: 180,
    restBonus: 30,
    healthPerHour: 1,
  },
  {
    id: 'loft',
    name: { tr: 'Stüdyo loft', en: 'Studio loft' },
    about: { tr: 'Yüksek tavanlı, ses yalıtımlı bir loft. Gece ikide davul çalabilirsin.', en: 'A high-ceilinged soundproofed loft. Drum at 2am if you like.' },
    rent: 450,
    restBonus: 45,
    healthPerHour: 1.5,
  },
  {
    // Orta oyun için kalıcı bir harcama yeri (denge raporu §2: paranın alabileceği bir şey kalmıyordu)
    id: 'house',
    name: { tr: 'Bahçeli müstakil ev', en: 'Townhouse with a garden' },
    about: { tr: 'Bahçeli, prova odalı bir müstakil ev. Turneden dönünce gerçekten dinlenirsin.', en: 'A townhouse with a garden and a rehearsal room. You really rest after a tour.' },
    rent: 900,
    restBonus: 55,
    healthPerHour: 1.8,
  },
  {
    id: 'penthouse',
    name: { tr: 'Çatı katı', en: 'Penthouse' },
    about: { tr: 'Şehre tepeden bakan bir çatı katı. Ünlüler böyle yaşar.', en: 'A penthouse looking down on the city. This is how stars live.' },
    rent: 1200,
    restBonus: 65,
    healthPerHour: 2,
    vip: true,
  },
];

export const HOME_BY_ID: Record<string, HomeDef> = Object.fromEntries(HOMES.map((h) => [h.id, h]));

/** Bir kira dönemi (oyun günü) */
export const RENT_PERIOD_DAYS = PACING.rentPeriodDays;

export const rentFor = (home: HomeDef, costMult: number) => Math.round(home.rent * costMult);
