// Oyun kuralları ve formüller. Tüm hesaplar sunucuda yapılır;
// uygulama aynı fonksiyonları sadece önizleme (tahmini süre, ücret) için kullanır.

import { type Skills, genreSkillId, roleSkill, stageScore } from './skills';
import { energyFactor, legendaryChance } from './wellbeing';
import { PRESS_NEUTRAL, pressAttendanceMult, pressFameMult } from './press';
import {
  type EncorePlan,
  type EncoreOutcome,
  MAX_STAGE_EVENTS,
  STAGE_EVENT_BY_ID,
  type StageEventOutcome,
  type Tempo,
  encoreOutcome,
  setlistFlow,
  stageEventAllowed,
  stageEventChance,
  subgenreGigBonus,
} from './performance';
import { CITY_EVENT_ATTENDANCE } from './content/cities';
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

export const ACTION_KINDS = ['study', 'work', 'rest', 'write_song', 'rehearse', 'travel', 'treat', 'busk', 'record', 'crime', 'investigate', 'workout', 'craft', 'press', 'write_article', 'video', 'lesson'] as const;
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
  lesson: [1, 2, 4],
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
  press: -2,
  write_article: -2,
  video: -2,
  lesson: -3,
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
  press: -0.5,
  write_article: -0.5,
  video: -0.5,
  lesson: -0.5,
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
  /** Verim çarpanı (özel derste profesör/öğretmen/arkadaş; verilmezse okul 2,2, ev 1,0) */
  rate?: number,
): number {
  const gear = 1 + (instrumentBonus * 2) / 100;
  return (
    Math.round(hours * (rate ?? (atSchool ? 2.2 : 1.0)) * diminishing(level) * moodFactor(mood) * healthFactor(health) * gear * 100) /
    100
  );
}

/** Dinlenmede ruh hâli artışı: sanat eserleri bonusu yüzde olarak ekler. */
export const restMoodGain = (hours: number, artBonus: number) => hours * MOOD_PER_HOUR.rest * (1 + artBonus / 100);

/** songwriting: songwritingScore() ile hesaplanan beste + söz + tür becerisi */
export function songQuality(songwriting: number, rand: Rand): number {
  // Taban 15: ilk şarkılar da bir bar gecesini taşıyabilsin
  return Math.round(clamp(15 + songwriting * 0.8 + (rand() * 20 - 10), 1, 100));
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

/** Kötü konser eşiği (moodlet, rapor) ve barın başa baş kalitesi. Mekâna göre başa baş: VENUE_RULES[venue].breakEven. */
export const GIG_BREAK_EVEN_QUALITY = 20;
/**
 * Şöhret kazancının azalan verimi: (1 − şöhret ÷ 110)^FAME_GAIN_EXPONENT, en az FAME_GAIN_FLOOR.
 * Eskiden max(0,1; 1 − şöhret ÷ 120): şöhret 60'ta ×0,5, 70'te ×0,42. Şimdi 60'ta ×0,27, 70'te ×0,18 (üs 1,6).
 * Bar dönemi (şöhret < 15) neredeyse aynı kalır (şöhret 10'da ×0,86 → eski ×0,92).
 */
export const FAME_GAIN_EXPONENT = 1.6;
export const FAME_GAIN_FLOOR = 0.03;
export const fameGainMult = (fame: number) => Math.max(FAME_GAIN_FLOOR, Math.max(0, 1 - fame / 110) ** FAME_GAIN_EXPONENT);
/** Barda bu kaliteye ulaşan konser en az BAR_MIN_FAME kadar şöhret getirir (ilk adımlar boşa gitmesin). */
export const BAR_FLOOR_QUALITY = 10;
export const BAR_MIN_FAME = 0.2;
/** Tam bir setlist: daha kısa setler konser kalitesini düşürür. */
export const FULL_SETLIST = 4;

export const GIG_LEAD_HOURS = [2, 6, 12, 24] as const;
/** Bir grubun aynı anda ayarlı en fazla konser sayısı (festival hariç): sahneleri boş rezervasyonla kapatmak olmasın */
export const MAX_SCHEDULED_GIGS = 2;

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
  /** Şarkının temposu (setlist akışını etkiler); eski şarkılarda yok */
  tempo?: Tempo;
  /** Şarkının alt türü (şehir sahnesi, haftanın modası, niş; performance.ts subgenreGigBonus) */
  subgenre?: string | null;
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
  /** Grubun o şehirdeki basın desteği (0–100, nötr 20) */
  press?: number;
  /** Turne ekibinin etkileri: kaliteye eklenen puan ve seyirci çarpanı */
  crew?: { quality: number; attendanceMult: number };
  /** Performans planı: sahne olayları ve bis kararı */
  plan?: { events?: string[]; encore?: EncorePlan };
  /** Bekleme süresi dolmamış sahne olayları (denenmez) */
  cooldownEvents?: string[];
  /** Açık liste haftasının numarası (haftanın modası için) */
  weekId?: number;
  /** Şehrin haftalık etkinliği bu gruba açık (content/cities.ts): seyirci ×1,1 */
  cityEvent?: boolean;
  /** Grubun aynı şehirde doygunluk penceresi içinde verdiği önceki konser sayısı (CITY_SATURATION); yoksa 0 */
  recentCityGigs?: number;
}

/**
 * Şehir doygunluğu: aynı şehirde kısa aralıklarla çalan grubun seyircisi tazeliğini kaybeder.
 * Pencere pacing.ts citySaturationHours (60 oyun saati). Önceki her konser için şöhret kazancı 1 ÷ (1 + 0,5 × k),
 * seyirci 1 − 0,1 × k (en az ×0,6). Kayıplar (kötü konser) azaltılmaz; bar, festival ve oyunun kendi grupları muaftır.
 * Gerekçe ve ölçüm: docs/DENGE_OLCUMU.md (konser sıklığına sınır olmadığı için şöhret ve para tek şehirde katlanıyordu).
 */
export const CITY_SATURATION = { famePerGig: 0.5, attendancePerGig: 0.1, minAttendance: 0.6 } as const;
export const saturationFameMult = (recentGigs: number) => 1 / (1 + CITY_SATURATION.famePerGig * Math.max(0, recentGigs));
export const saturationAttendanceMult = (recentGigs: number) =>
  Math.max(CITY_SATURATION.minAttendance, 1 - CITY_SATURATION.attendancePerGig * Math.max(0, recentGigs));

/**
 * Şarkı puanının ağırlıkları mekâna göre: büyük sahnede şarkının kendisi ve çalım becerisi daha çok, prova
 * (aşinalık, yalnızca zamanla kazanılır) daha az sayılır. Eskiden her yerde 0,4 / 0,35 / 0,25 idi; beste 8 olan
 * bir oyuncu aşinalık ve kiralık kadroyla salonda ve stadyumda da şöhret kazanıyordu (denge raporu §1).
 */
export const SONG_SCORE_WEIGHTS: Record<VenueType, { quality: number; familiarity: number; skill: number }> = {
  bar: { quality: 0.4, familiarity: 0.35, skill: 0.25 },
  club: { quality: 0.42, familiarity: 0.32, skill: 0.26 },
  hall: { quality: 0.46, familiarity: 0.26, skill: 0.28 },
  stadium: { quality: 0.5, familiarity: 0.2, skill: 0.3 },
  festival: { quality: 0.45, familiarity: 0.27, skill: 0.28 },
};

/** Sahne olaylarının toplam kalite etkisi sınırı (±puan) */
export const MAX_EVENT_EFFECT = 12;

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
  /** Raporda "neden böyle geçti" açıklaması için etkenlerin kaba değerlendirmesi (sayı değil) */
  factors?: GigFactors;
  /** Setlist sırasının kaliteye etkisi (puan) */
  flow?: number;
  /** Sahne olaylarının sonucu */
  events?: { id: string; outcome: StageEventOutcome; by: number | null }[];
  /** Bisin sonucu ve sahnedekilerden ek enerji */
  encore?: EncoreOutcome;
  encoreEnergy?: number;
}

export type GigFactorId = 'songs' | 'familiarity' | 'skill' | 'stage' | 'presence' | 'setLength' | 'energy' | 'mood' | 'flow' | 'events' | 'style' | 'saturation';
export type GigFactorRating = 'weak' | 'ok' | 'strong';
export type GigFactors = Partial<Record<GigFactorId, GigFactorRating>>;

const rate = (v: number, weak: number, strong: number): GigFactorRating => (v < weak ? 'weak' : v >= strong ? 'strong' : 'ok');

/** Konserden sonra ne yapılmalı: en zayıf etkenler önce (en fazla 3). Sırası etkinin büyüklüğüne göredir. */
export function gigAdvice(factors: GigFactors): GigFactorId[] {
  const order: GigFactorId[] = ['presence', 'setLength', 'familiarity', 'songs', 'saturation', 'skill', 'energy', 'mood', 'stage', 'flow', 'events', 'style'];
  return order.filter((f) => factors[f] === 'weak').slice(0, 3);
}

export function expectedAttendance(venue: VenueType, fame: number, genrePop: number, rand: Rand): number {
  const rules = VENUE_RULES[venue];
  const draw = clamp(0.04 + (fame / 100) * 1.1, 0, 1);
  // Arkadaşlar ve tanıdıklar: küçük sahnede ilk geceleri ayakta tutar
  const friends = venue === 'bar' ? 4 + Math.floor(rand() * 7) : 2 + Math.floor(rand() * 7);
  const base = rules.capacity * draw * genrePop * (0.85 + rand() * 0.3);
  return Math.round(clamp(base + friends, 0, rules.capacity));
}

export function computeGig(input: GigInput): GigResult {
  const { venue, fame, genre, city, performers, setlist, rand } = input;
  const rules = VENUE_RULES[venue];
  const present = performers.filter((p) => p.present);
  const memberCount = performers.length;
  const genrePop = city.genrePopularity[genre];
  // Bar yeni grupların sahnesidir: doygunluk kulüp ve üstünde işler (ilk adımların temposu değişmesin)
  const recent = venue === 'bar' ? 0 : Math.max(0, Math.floor(input.recentCityGigs ?? 0));
  const attendance = Math.min(
    VENUE_RULES[venue].capacity,
    Math.round(
      expectedAttendance(venue, fame, genrePop, rand) *
        pressAttendanceMult(input.press ?? PRESS_NEUTRAL) *
        (input.crew?.attendanceMult ?? 1) *
        (input.cityEvent ? CITY_EVENT_ATTENDANCE : 1) *
        saturationAttendanceMult(recent),
    ),
  );

  // Grubun kendi üyelerinden kimse sahnede değilse (sadece kiralık müzisyenler) konser yapılmamış sayılır
  const hasOwn = performers.some((p) => p.characterId !== null);
  const ownPresent = present.some((p) => p.characterId !== null);
  if (present.length === 0 || setlist.length === 0 || (hasOwn && !ownPresent)) {
    // Kimse gelmediyse konser iptal sayılır ve şöhret kaybedilir.
    return {
      quality: 0,
      attendance: 0,
      revenue: 0,
      fameDelta: -round1(2 * rules.fameMult),
      presentCount: 0,
      memberCount: performers.filter((p) => p.characterId !== null).length || memberCount,
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

  const styleBonuses = setlist.map((s) => subgenreGigBonus(s.subgenre, city.id, venue, input.weekId ?? 0));
  const w = SONG_SCORE_WEIGHTS[venue];
  const songScores = setlist.map((s, i) => {
    const fam = present.reduce((sum, p) => sum + (p.familiarity[s.id] ?? 0), 0) / present.length;
    return { id: s.id, score: w.quality * s.quality + w.familiarity * fam + w.skill * bandSkill + styleBonuses[i] };
  });
  const avgSong = songScores.reduce((sum, s) => sum + s.score, 0) / songScores.length;
  const lengthFactor = Math.min(1, 0.6 + 0.1 * setlist.length);
  // Rapordaki açıklama: kiralık müzisyenler hariç grubun kendisine bakılır (yoksa herkes)
  const own = present.filter((p) => p.characterId !== null);
  const judged = own.length ? own : present;
  const avg = (f: (p: GigPerformer) => number) => judged.reduce((sum, p) => sum + f(p), 0) / judged.length;
  const avgQuality = setlist.reduce((sum, s) => sum + s.quality, 0) / setlist.length;
  const avgFam = avg((p) => setlist.reduce((sum, s) => sum + (p.familiarity[s.id] ?? 0), 0) / setlist.length);
  const factors: GigFactors = {
    songs: rate(avgQuality, 30, 60),
    familiarity: rate(avgFam, 40, 75),
    skill: rate(avg((p) => clamp(roleSkill(p.skills, p.role) + p.instrumentBonus, 0, 110)), 25, 55),
    stage: rate(avg((p) => clamp(stageScore(p.skills) + p.outfitBonus, 0, 110)), 20, 50),
    presence: presence < 1 ? 'weak' : 'strong',
    setLength: setlist.length < FULL_SETLIST ? 'weak' : setlist.length >= 6 ? 'strong' : 'ok',
    energy: rate(avg((p) => p.energy ?? 100), 40, 70),
    mood: rate(avg((p) => p.mood), 35, 70),
  };
  // Setlist sırası: zayıfı öne, güçlüyü sona (Popmundo). Konum ağırlıkları performance.ts içinde.
  const flow = setlistFlow(setlist.map((s, i) => ({ score: songScores[i].score, tempo: s.tempo })));
  if (setlist.length >= 3) factors.flow = flow <= -1.5 ? 'weak' : flow >= 1.5 ? 'strong' : 'ok';
  // Alt türlerin bu şehirde ve bu sahnede tutması (yalnızca alt türlü şarkı varsa değerlendirilir)
  if (setlist.some((s) => s.subgenre)) {
    const avgStyle = styleBonuses.reduce((a, b) => a + b, 0) / setlist.length;
    factors.style = avgStyle < 0 ? 'weak' : avgStyle >= 1.5 ? 'strong' : 'ok';
  }
  // Şehir doygunluğu: yalnızca yakın zamanda aynı şehirde çalındıysa değerlendirilir
  if (recent > 0) factors.saturation = recent >= 2 ? 'weak' : 'ok';

  // Sahne olayları: grubun kendi sahnedeki üyelerinden en uygun olanı dener (kiralık müzisyenler plana uymaz)
  const events: { id: string; outcome: StageEventOutcome; by: number | null }[] = [];
  let eventDelta = 0;
  const cooldown = new Set(input.cooldownEvents ?? []);
  for (const id of [...new Set(input.plan?.events ?? [])].slice(0, MAX_STAGE_EVENTS)) {
    const def = STAGE_EVENT_BY_ID[id];
    if (!def) continue;
    if (cooldown.has(id) || !stageEventAllowed(def, genre)) {
      events.push({ id, outcome: 'skipped', by: null });
      continue;
    }
    let best: GigPerformer | null = null;
    let bestLevel = -1;
    for (const p of own) {
      const level =
        def.skill === 'role'
          ? clamp(roleSkill(p.skills, p.role) + p.instrumentBonus, 0, 110)
          : def.skill === 'genre'
            ? (p.skills[genreSkillId(genre)] ?? -1)
            : (p.skills[def.skill] ?? -1);
      if (level > bestLevel) {
        best = p;
        bestLevel = level;
      }
    }
    // Kimse bilmiyorsa ya da eşiğin altındaysa olay bozulur
    const ok = best !== null && bestLevel >= def.min && rand() < stageEventChance(bestLevel, def.min);
    eventDelta += ok ? def.bonus : -def.penalty;
    events.push({ id, outcome: ok ? 'success' : 'fail', by: best?.characterId ?? null });
  }
  eventDelta = clamp(eventDelta, -MAX_EVENT_EFFECT, MAX_EVENT_EFFECT);
  if (events.some((e) => e.outcome !== 'skipped')) factors.events = eventDelta < 0 ? 'weak' : eventDelta >= 4 ? 'strong' : 'ok';

  const noise = 0.92 + rand() * 0.16;
  const base = Math.round(
    clamp(avgSong * (0.85 + 0.15 * (stage / 100)) * (0.5 + 0.5 * presence) * lengthFactor * noise * 1.15 + (input.fxBonus ?? 0) + (input.crew?.quality ?? 0) + flow + eventDelta, 0, 100),
  );
  // Bis: gece iyi geçtiyse seyirci ister; cesur bis enerjiye bağlı bir kumardır
  const enc = encoreOutcome(input.plan?.encore, base, avg((p) => p.energy ?? 100), rand);
  const quality = Math.round(clamp(base + enc.qualityDelta, 0, 100));

  const revenue = Math.round(attendance * rules.ticket * city.costMult * rules.bandShare);

  // Başa baş kalite mekâna göre (bar 20 … stadyum 65): büyük sahnede vasat bir gece şöhret getirmez
  let fameDelta = ((quality - rules.breakEven) / 100) * 6 * rules.fameMult;
  if (fameDelta > 0) fameDelta *= fameGainMult(fame);
  // Kapasitenin çok altında kalan büyük mekân konserleri şöhreti az artırır (bar küçük sahnedir, sayılmaz).
  if (fameDelta > 0 && venue !== 'bar') fameDelta *= 0.5 + 0.5 * (attendance / rules.capacity);
  // Şehir doygunluğu: aynı şehirde üst üste çalmak şöhret kazancını küçültür (kayıplar küçülmez)
  if (fameDelta > 0) fameDelta *= saturationFameMult(recent);
  // Bar: makul bir gece hiç değilse biraz tanınırlık getirir
  if (venue === 'bar' && quality >= BAR_FLOOR_QUALITY) fameDelta = Math.max(fameDelta, BAR_MIN_FAME);

  // EFSANEVİ gece: DESTANSI kalitede, grubun ilhamına bağlı küçük bir olasılık
  // Sadece grubun kendi üyeleri sayılır (kiralık müzisyenler ortalamayı düşürmesin)
  const players = present.filter((p) => p.characterId !== null);
  const avgInspiration = players.length ? players.reduce((sum, p) => sum + (p.inspiration ?? 0), 0) / players.length : 0;
  const legendary = rand() < legendaryChance(quality, avgInspiration);
  if (legendary) fameDelta *= 1.5;
  // Basın desteği şöhret kazancını büyütür ya da küçültür
  if (fameDelta > 0) fameDelta *= pressFameMult(input.press ?? PRESS_NEUTRAL);
  // Bis şöhreti biraz büyütür ya da (başarısızsa) küçültür; kayıp da büyür
  if (enc.fameMult !== 1) fameDelta = fameDelta >= 0 ? fameDelta * enc.fameMult : fameDelta / enc.fameMult;

  return {
    quality,
    legendary,
    factors,
    flow,
    events,
    encore: enc.outcome,
    encoreEnergy: enc.energy,
    attendance,
    revenue,
    fameDelta: round1(fameDelta),
    // Raporda kiralık müzisyenler üye sayılmaz
    presentCount: own.length,
    memberCount: performers.filter((p) => p.characterId !== null).length || memberCount,
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
