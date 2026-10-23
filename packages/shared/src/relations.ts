// İlişkiler: arkadaşlık, romantizm, evlilik ve aile.
// Her adım iki tarafın isteğiyle ilerler: flört karşılıklı olmadan romantizm belli bir noktayı geçmez,
// evlilik teklifi kabul edilmeden nişan olmaz. Engellenen biri hiçbir etkileşim yapamaz.

import { clamp } from './rules';

export type RelationStage = 'none' | 'dating' | 'engaged' | 'married';

/** Takılma: arkadaşlık + ruh hâli. Aynı ikili arasında bekleme süresi (oyun saati) */
export const HANGOUT_COOLDOWN_HOURS = 4;
export const FLIRT_COOLDOWN_HOURS = 4;
export const DATE_COOLDOWN_HOURS = 12;

/** Flört etmek için gereken arkadaşlık */
export const FLIRT_MIN_FRIENDSHIP = 30;
/** Karşılıklı flört olmadan romantizm bunu geçmez */
export const ONE_SIDED_ROMANCE_CAP = 20;
/** Randevu için gereken romantizm (karşılıklı flörtten sonra) */
export const DATE_MIN_ROMANCE = 20;
/** Bu romantizmde ilişki "sevgili" olur */
export const DATING_ROMANCE = 40;
/** Evlilik teklifi için gereken romantizm */
export const PROPOSE_MIN_ROMANCE = 70;

/** Düğün ve boşanma ücreti, evlat edinme ücreti (şehir çarpanıyla çarpılır) */
export const WEDDING_FEE = 500;
export const DIVORCE_FEE = 300;
export const ADOPTION_FEE = 1000;
export const MAX_CHILDREN = 4;
/** Evli çift aynı şehirde, evde dinlenirken ek bonus (%) */
export const SPOUSE_REST_BONUS = 10;

const grow = (current: number, base: number) => base * (1 - current / 120);

export const hangoutGain = (friendship: number, charisma: number) =>
  Math.round(clamp(grow(friendship, 5 + charisma * 0.05), 0.5, 10) * 10) / 10;
export const flirtGain = (romance: number, charm: number) =>
  Math.round(clamp(grow(romance, 4 + charm * 0.06), 0.5, 10) * 10) / 10;
export const dateGain = (romance: number, charm: number) =>
  Math.round(clamp(grow(romance, 8 + charm * 0.08), 1, 15) * 10) / 10;

export const CHILD_NAME_RE = /^[\p{L} '’-]{2,24}$/u;
