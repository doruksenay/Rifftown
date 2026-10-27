// İlerleme: bir şehirde sıradaki sahne ve rehber bittikten sonraki hedef.

import { FULL_SETLIST } from './rules';
import { VENUE_RULES, type VenueType } from './world';

/** Konser ayarlanabilen sahneler, küçükten büyüğe */
export const VENUE_LADDER = ['bar', 'club', 'hall', 'stadium'] as const satisfies readonly VenueType[];

/** Bu şöhretle henüz çıkılamayan ilk sahne (hepsi açıksa null) */
export function nextVenue(fame: number): { venue: VenueType; minFame: number; prevFame: number } | null {
  let prev = 0;
  for (const v of VENUE_LADDER) {
    const min = VENUE_RULES[v].minFame;
    if (fame < min) return { venue: v, minFame: min, prevFame: prev };
    prev = min;
  }
  return null;
}

/** Sıradaki sahneye ilerleme (0–1): bir önceki eşikten bir sonrakine */
export function venueProgress(fame: number): number {
  const n = nextVenue(fame);
  if (!n) return 1;
  return Math.max(0, Math.min(1, (fame - n.prevFame) / (n.minFame - n.prevFame)));
}

/** Turne hedefi: bu kadar şehirde kulüp seviyesine ulaş */
export const TOUR_CITIES = 3;

export type GoalId = 'band' | 'songs' | 'club' | 'hall' | 'tour' | 'stadium' | 'legend' | 'legacy' | 'hall_of_fame';

export interface NextGoal {
  id: GoalId;
  /** Hedefin şehri (şöhret hedeflerinde) */
  cityId?: string;
  /** Şöhret hedeflerinde şimdiki şöhret ve gereken eşik */
  fame?: number;
  target?: number;
  /** Sayılan hedeflerde ilerleme (şarkı, şehir) */
  n?: number;
  total?: number;
  /** Efsane sonrası hedefin kimliği (content/progress.ts LEGACY_GOALS) */
  legacyId?: string;
}

export interface GoalInput {
  hasBand: boolean;
  songs: number;
  cityId: string;
  /** şehir id → grubun şöhreti */
  fame: Record<string, number>;
}

/** Rehber bittikten sonra oyuncuya gösterilen tek, somut hedef */
export function nextGoal(s: GoalInput): NextGoal {
  if (!s.hasBand) return { id: 'band' };
  if (s.songs < FULL_SETLIST) return { id: 'songs', n: s.songs, total: FULL_SETLIST };
  const entries = Object.entries(s.fame);
  const here = s.fame[s.cityId] ?? 0;
  // En iyi şehir: oyuncunun bulunduğu şehir ya da grubun en ünlü olduğu yer
  const [bestCity, best] = entries.reduce<[string, number]>((acc, [id, f]) => (f > acc[1] ? [id, f] : acc), [s.cityId, here]);
  const club = VENUE_RULES.club.minFame;
  const hall = VENUE_RULES.hall.minFame;
  const stadium = VENUE_RULES.stadium.minFame;
  if (best < club) return { id: 'club', cityId: bestCity, fame: best, target: club };
  if (best < hall) return { id: 'hall', cityId: bestCity, fame: best, target: hall };
  const clubCities = entries.filter(([, f]) => f >= club).length;
  if (clubCities < TOUR_CITIES) return { id: 'tour', n: clubCities, total: TOUR_CITIES };
  if (best < stadium) return { id: 'stadium', cityId: bestCity, fame: best, target: stadium };
  return { id: 'legend' };
}
