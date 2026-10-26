// Oyun kuralları ve formüller. Tüm hesaplar sunucuda yapılır;
// uygulama aynı fonksiyonları sadece önizleme (tahmini süre, ücret) için kullanır.

import { type Skills, roleSkill, stageScore } from './skills';
import { energyFactor, legendaryChance } from './wellbeing';
import { CITY_BY_ID, type City, type Genre, INSTRUMENTS, type Instrument, VENUE_RULES, type VenueType } from './world';

export type Rand = () => number;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

// ---------- Başlangıç ----------

export const START_MONEY = 500;
export const START_MOOD = 80;
export const START_HEALTH = 100;
/** Bu sağlığın altında yalnızca dinlenme, tedavi ve seyahat yapılabilir. */
export const MIN_HEALTH_FOR_ACTIVITY = 15;
export const MAX_BAND_MEMBERS = 6;
export const MAX_SETLIST = 10;
export const MAX_SKILL = 100;

// ---------- Eylemler ----------

export const ACTION_KINDS = ['study', 'work', 'rest', 'write_song', 'rehearse', 'travel', 'treat', 'busk', 'record', 'crime', 'investigate', 'workout', 'craft'] as const;
export type ActionKind = (typeof ACTION_KINDS)[number];

/** Seçilebilir süreler (oyun saati). */
export const HOUR_OPTIONS = {
  study: [1, 2, 4],
  work: [2, 4, 8],
  rest: [1, 2, 4, 8],
  rehearse: [1, 2, 4],
  treat: [1, 2, 4],
  busk: [1, 2, 4],
  workout: [1, 2, 4],
} as const;

export const WRITE_SONG_HOURS = 2;

/** Saat başına ruh hâli değişimi. */
export const MOOD_PER_HOUR: Record<ActionKind, number> = {
  study: -3,
  work: -4,
  rest: 15,
  write_song: -2,
  rehearse: -3,
  travel: -2,
  treat: 2,
  busk: -2,
  record: -3,
  crime: -3,
  investigate: -3,
  workout: 1,
  craft: -2,
};

/** Saat başına sağlık değişimi. Ruh hâli 25'in altındayken her saat fazladan -2 uygulanır. */
export const HEALTH_PER_HOUR: Record<ActionKind, number> = {
  study: -0.5,
  work: -1,
  rest: 3,
  write_song: 0,
  rehearse: -0.5,
  travel: -1,
  treat: 20, // hastanede
  busk: -0.5,
  record: -0.5,
  crime: -1,
  investigate: -0.5,
  workout: 1,
  craft: -0.5,
};
export const LOW_MOOD_THRESHOLD = 25;
export const LOW_MOOD_HEALTH_PER_HOUR = -2;

/** Sağlık verimi çarpar: %0 sağlıkta 0.5, %100'de 1.0. */
export const healthFactor = (health: number) => 0.5 + 0.5 * (clamp(health, 0, 100) / 100);

export const SCHOOL_PRICE_PER_HOUR = 30;
export const STUDIO_PRICE_PER_HOUR = 20;
export const UNIVERSITY_PRICE_PER_HOUR = 40;

export const priceFor = (base: number, city: City, hours: number) => Math.round(base * city.costMult * hours);

/** Ruh hâli verimi çarpar: %0 ruh hâlinde 0.6, %100'de 1.0. */
export const moodFactor = (mood: number) => 0.6 + 0.4 * (clamp(mood, 0, 100) / 100);

/** Becerinin yükseldikçe zorlaşan artışı. */
export const diminishing = (level: number) => Math.max(0, 1 - level / 110);

/** instrumentBonus: o beceri için kuşanılmış enstrümanın bonusu (ör. 7 → çalışma verimi %14 artar). */
export function studyGain(
  level: number,
  hours: number,
  atSchool: boolean,
  mood: number,
  health = 100,
  instrumentBonus = 0,
): number {
  const gear = 1 + (instrumentBonus * 2) / 100;
  return (
    Math.round(hours * (atSchool ? 2.2 : 1.0) * diminishing(level) * moodFactor(mood) * healthFactor(health) * gear * 100) /
    100
  );
}

/** Dinlenmede ruh hâli artışı: sanat eserleri bonusu yüzde olarak ekler. */
export const restMoodGain = (hours: number, artBonus: number) => hours * MOOD_PER_HOUR.rest * (1 + artBonus / 100);

/** songwriting: songwritingScore() ile hesaplanan beste + söz + tür becerisi */
export function songQuality(songwriting: number, rand: Rand): number {
  return Math.round(clamp(8 + songwriting * 0.85 + (rand() * 20 - 10), 1, 100));
}

/** improvisation: Doğaçlama becerisi (0–100), provayı hızlandırır */
export function rehearsalGain(familiarity: number, hours: number, mood: number, improvisation = 0): number {
  return hours * 12 * Math.max(0, 1 - familiarity / 105) * moodFactor(mood) * (1 + improvisation / 200);
}

// ---------- Seyahat ----------

export type TravelMode = 'bus' | 'plane' | 'car';

export function distanceKm(a: City, b: City): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface TravelOption {
  mode: TravelMode;
  hours: number;
  cost: number;
}

/** vehicleSpeed: kuşanılmış aracın otobüse göre hız katsayısı (araç yoksa verilmez) */
export function travelOptions(fromId: string, toId: string, vehicleSpeed?: number): TravelOption[] {
  const a = CITY_BY_ID[fromId];
  const b = CITY_BY_ID[toId];
  if (!a || !b || a.id === b.id) return [];
  const d = distanceKm(a, b);
  const out: TravelOption[] = [];
  if (a.continent === b.continent && d <= 2500) {
    const busHours = Math.max(1, d / 70);
    out.push({ mode: 'bus', hours: round1(busHours), cost: Math.round(10 + d * 0.03) });
    // Kendi aracınla: sadece benzin parası
    if (vehicleSpeed) out.push({ mode: 'car', hours: round1(Math.max(0.5, busHours / vehicleSpeed)), cost: Math.round(d * 0.015) });
  }
  out.push({ mode: 'plane', hours: round1(1.5 + d / 750), cost: Math.round(80 + d * 0.09) });
  return out;
}

// ---------- Zaman ----------

/** Oyun saatini gerçek milisaniyeye çevirir. speed=1 gerçek zamanlıdır. */
export const gameHoursToMs = (hours: number, speed: number) => (hours * 3600 * 1000) / speed;

// ---------- Konser ----------

/** Bu kalitenin üstündeki konserler şöhret kazandırır, altındakiler kaybettirir. */
export const GIG_BREAK_EVEN_QUALITY = 30;

export const GIG_LEAD_HOURS = [2, 6, 12, 24] as const;

export interface GigPerformer {
  /** Kiralık müzisyenler için null */
  characterId: number | null;
  role: Instrument;
  skills: Skills;
  mood: number;
  health: number;
  present: boolean;
  /** Kuşanılan enstrümanın bonusu (rol becerisine eklenir) */
  instrumentBonus: number;
  /** Kuşanılan kıyafetin bonusu (sahne becerisine eklenir) */
  outfitBonus: number;
  /** şarkı id → aşinalık (0–100) */
  familiarity: Record<number, number>;
  /** Enerji (0–100); yoksa dolu sayılır. Düşük enerji çalımı zayıflatır. */
  energy?: number;
  /** İlham (0–100); EFSANEVİ gece olasılığını artırır */
  inspiration?: number;
}

export interface GigSong {
  id: number;
  quality: number;
}

export interface GigInput {
  venue: VenueType;
  fame: number;
  genre: Genre;
  city: City;
  performers: GigPerformer[];
  setlist: GigSong[];
  rand: Rand;
  /** Sahne efektlerinden gelen kalite artışı (puan) */
  fxBonus?: number;
}

export interface GigResult {
  quality: number;
  attendance: number;
  revenue: number;
  fameDelta: number;
  presentCount: number;
  memberCount: number;
  songScores: { id: number; score: number }[];
  /** Çok nadir: DESTANSI bir konser ilham sayesinde EFSANEVİ olabilir */
  legendary?: boolean;
}

export function expectedAttendance(venue: VenueType, fame: number, genrePop: number, rand: Rand): number {
  const rules = VENUE_RULES[venue];
  const draw = clamp(0.04 + (fame / 100) * 1.1, 0, 1);
  const friends = 2 + Math.floor(rand() * 7);
  const base = rules.capacity * draw * genrePop * (0.85 + rand() * 0.3);
  return Math.round(clamp(base + friends, 0, rules.capacity));
}

export function computeGig(input: GigInput): GigResult {
  const { venue, fame, genre, city, performers, setlist, rand } = input;
  const rules = VENUE_RULES[venue];
  const present = performers.filter((p) => p.present);
  const memberCount = performers.length;
  const genrePop = city.genrePopularity[genre];
  const attendance = expectedAttendance(venue, fame, genrePop, rand);

  if (present.length === 0 || setlist.length === 0) {
    // Kimse gelmediyse konser iptal sayılır ve şöhret kaybedilir.
    return {
      quality: 0,
      attendance: 0,
      revenue: 0,
      fameDelta: -round1(2 * rules.fameMult),
      presentCount: 0,
      memberCount,
      songScores: [],
    };
  }

  const bandSkill =
    present.reduce(
      (sum, p) =>
        sum +
        clamp(roleSkill(p.skills, p.role) + p.instrumentBonus, 0, 110) * moodFactor(p.mood) * healthFactor(p.health) * energyFactor(p.energy ?? 100),
      0,
    ) / present.length;
  const stage = present.reduce((sum, p) => sum + clamp(stageScore(p.skills) + p.outfitBonus, 0, 110), 0) / present.length;
  const presence = present.length / memberCount;

  const songScores = setlist.map((s) => {
    const fam = present.reduce((sum, p) => sum + (p.familiarity[s.id] ?? 0), 0) / present.length;
    return { id: s.id, score: 0.4 * s.quality + 0.35 * fam + 0.25 * bandSkill };
  });
  const avgSong = songScores.reduce((sum, s) => sum + s.score, 0) / songScores.length;
  const lengthFactor = Math.min(1, 0.6 + 0.1 * setlist.length);
  const noise = 0.92 + rand() * 0.16;
  const quality = Math.round(
    clamp(avgSong * (0.85 + 0.15 * (stage / 100)) * (0.5 + 0.5 * presence) * lengthFactor * noise * 1.15 + (input.fxBonus ?? 0), 0, 100),
  );

  const revenue = Math.round(attendance * rules.ticket * city.costMult * 0.7);

  let fameDelta = ((quality - GIG_BREAK_EVEN_QUALITY) / 100) * 6 * rules.fameMult;
  if (fameDelta > 0) fameDelta *= Math.max(0.1, 1 - fame / 120);
  // Kapasitenin çok altında kalan büyük mekân konserleri şöhreti az artırır.
  fameDelta *= fameDelta > 0 ? 0.5 + 0.5 * (attendance / rules.capacity) : 1;

  // EFSANEVİ gece: DESTANSI kalitede, grubun ilhamına bağlı küçük bir olasılık
  // Sadece grubun kendi üyeleri sayılır (kiralık müzisyenler ortalamayı düşürmesin)
  const players = present.filter((p) => p.characterId !== null);
  const avgInspiration = players.length ? players.reduce((sum, p) => sum + (p.inspiration ?? 0), 0) / players.length : 0;
  const legendary = rand() < legendaryChance(quality, avgInspiration);
  if (legendary) fameDelta *= 1.5;

  return {
    quality,
    legendary,
    attendance,
    revenue,
    fameDelta: round1(fameDelta),
    presentCount: present.length,
    memberCount,
    songScores: songScores.map((s) => ({ id: s.id, score: Math.round(s.score) })),
  };
}

/** Yurt içi şöhret yayılması: aynı ülkedeki diğer şehirlere artışın bu oranı yansır. */
export const FAME_SPILLOVER = 0.25;

// ---------- Doğrulama ----------

export const NAME_RE = /^[\p{L}][\p{L} .'-]{1,22}[\p{L}.]$/u;
export const BAND_NAME_RE = /^[\p{L}\p{N}][\p{L}\p{N} .'&!-]{0,28}[\p{L}\p{N}.!]$/u;
export const CHAT_MAX = 300;

export const isInstrument = (s: string): s is Instrument => (INSTRUMENTS as readonly string[]).includes(s);
