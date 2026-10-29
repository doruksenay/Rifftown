// Suç, soruşturma, mahkeme ve hapishane.
// Suçlar oyunun kendi dünyasına karşı işlenir (oyuncuların parası çalınmaz).
// Başarısız suç anında yakalanmaktır; başarılı suç ise kayıtlara "faili meçhul" olarak geçer ve
// polisler soruşturarak faili sonradan bulabilir. Yakalanan şüpheli tutuklanır, yargıç ya da süre dolunca mahkeme karar verir.

import { type Skills, lv } from './skills';
import type { L, LocationType } from './world';
import { clamp } from './rules';
import { indexBy } from './lookup';

export type CrimeKind = 'pickpocket' | 'shoplift' | 'burglary';

export interface CrimeDef {
  id: CrimeKind;
  name: L;
  about: L;
  /** Suçun işlenebildiği mekân türleri */
  zones: LocationType[];
  hours: number;
  /** Başarı şansını belirleyen beceriler (ortalaması alınır) */
  skills: string[];
  /** Bu becerinin en az bu seviyede olması gerekir */
  requires?: { skill: string; min: number };
  /** Ganimet aralığı (şehir çarpanıyla çarpılır) */
  loot: [number, number];
  /** Zorluk: başarı şansından düşülür */
  difficulty: number;
  /** Mahkûmiyet hâlinde normal ceza (oyun saati) */
  sentenceHours: number;
}

export const CRIMES: CrimeDef[] = [
  {
    id: 'pickpocket',
    name: { tr: 'Yankesicilik', en: 'Pickpocketing' },
    about: { tr: 'Kalabalıkta dikkatsiz birinin cüzdanı.', en: 'A careless wallet in the crowd.' },
    zones: ['park', 'bar', 'club'],
    hours: 1,
    skills: ['stealth', 'street_smarts'],
    loot: [20, 80],
    difficulty: 0,
    sentenceHours: 6,
  },
  {
    id: 'shoplift',
    name: { tr: 'Mağazadan çalma', en: 'Shoplifting' },
    about: { tr: 'Raftan bir şey alıp ödemeden çıkmak.', en: 'Taking something off the shelf without paying.' },
    zones: ['music_store', 'boutique', 'gallery', 'bookstore'],
    hours: 1,
    skills: ['stealth', 'street_smarts'],
    loot: [60, 180],
    difficulty: 10,
    sentenceHours: 12,
  },
  {
    id: 'burglary',
    name: { tr: 'Ofis soygunu', en: 'Office burglary' },
    about: { tr: 'Mesai bittikten sonra iş merkezindeki bir ofise girmek.', en: 'Breaking into an office in the business tower after hours.' },
    zones: ['plaza'],
    hours: 2,
    skills: ['lockpicking', 'stealth'],
    requires: { skill: 'lockpicking', min: 15 },
    loot: [250, 700],
    difficulty: 25,
    sentenceHours: 24,
  },
];

export const CRIME_BY_ID: Record<string, CrimeDef> = indexBy(CRIMES, (c) => c.id);
export const crimesAt = (zone: LocationType) => CRIMES.filter((c) => c.zones.includes(zone));

const avgSkill = (s: Skills, ids: string[]) => ids.reduce((sum, id) => sum + lv(s, id), 0) / ids.length;

/** Görevdeki her polis başarı şansını bu kadar düşürür */
export const POLICE_PRESSURE = 0.05;

/**
 * Sabıka caydırır (denge raporu §6: dolandırıcı bot ayda 42 mahkûmiyetle yine kârdaydı):
 * - Polis tanır: her mahkûmiyet başarı şansını −0,02 düşürür (en fazla −0,2)
 * - Tekrarlayan suçlunun cezası × (1 + 0,5 × sabıka), en fazla ×5
 * - Mahkûmiyette para cezası: suçun ganimet tavanı × (1 + 0,25 × sabıka) × şehir, cepten (banka korur, borç yazılmaz)
 */
export const PRIOR_CHANCE_PENALTY = 0.02;
export const MAX_PRIOR_CHANCE_PENALTY = 0.2;
export const repeatSentenceMult = (priors: number) => Math.min(5, 1 + 0.5 * Math.max(0, priors));
export const crimeFine = (def: CrimeDef, priors: number, costMult: number) => Math.round(def.loot[1] * (1 + 0.25 * Math.max(0, priors)) * costMult);

/**
 * Suçun başarı şansı (0–1). patrol: emniyet müdürünün devriye kararının etkisi (civic-powers.ts, -0,06 … +0,03);
 * priors: sabıka (mahkûmiyet sayısı)
 */
/**
 * Taban şans ve beceri ağırlığı (playtest Y-4): eskiden 0,45 + beceri × 0,006 idi, hiç sokak becerisi olmayan yeni
 * karakter yarı yarıya başarıyor ve ilk haftanın en kârlı işi yankesicilik oluyordu. Şimdi beceri daha belirleyici:
 * beceri 0'da 0,35, 40'ta 0,71 (eskiden 0,69), 60'ta 0,89.
 */
export const CRIME_BASE_CHANCE = 0.35;
export const CRIME_SKILL_WEIGHT = 0.009;

export function crimeChance(def: CrimeDef, skills: Skills, policeOnDuty: number, patrol = 0, priors = 0): number {
  const known = Math.min(MAX_PRIOR_CHANCE_PENALTY, Math.max(0, priors) * PRIOR_CHANCE_PENALTY);
  return clamp(CRIME_BASE_CHANCE + avgSkill(skills, def.skills) * CRIME_SKILL_WEIGHT - def.difficulty * 0.01 - policeOnDuty * POLICE_PRESSURE + patrol - known, 0.08, 0.92);
}

/**
 * Oyunun dedektifi (playtest Y-4): şehirde görevde polis oyuncu yokken her faili meçhul suça, işlendikten
 * NPC_DETECTIVE_DELAY_HOURS sonra bir kez bakar. Faili hâlâ o şehirdeyse bulma şansı = NPC_DETECTIVE_CHANCE −
 * gizlilik × 0,006 (en az %5; gizlilik 40'ta %6); bulursa tutuklar (ikramiye kimseye gitmez). Şehirden kaçan fail kurtulur.
 */
export const NPC_DETECTIVE_DELAY_HOURS = 6;
/** Mahkûmiyette failin son COLD_CASE_DAYS günlük faili meçhul suçlarının ganimetinden geri alınan pay */
export const COLD_LOOT_RECOVERY = 0.5;
export const NPC_DETECTIVE_CHANCE = 0.3;
export const npcSolveChance = (criminalSkills: Skills) => clamp(NPC_DETECTIVE_CHANCE - lv(criminalSkills, 'stealth') * 0.006, 0.05, NPC_DETECTIVE_CHANCE);

/** Polis meslekleri: soruşturma yapabilir */
export const POLICE_PROFESSIONS = ['police', 'agent', 'swat'] as const;
export const isPolice = (profession: string | null | undefined) =>
  !!profession && (POLICE_PROFESSIONS as readonly string[]).includes(profession);

export const INVESTIGATE_HOURS = 2;
/** Soruşturmada aranan suçların ne kadar geriye gideceği (oyun günü) */
export const COLD_CASE_DAYS = 7;
/** Faili bulan polisin ikramiyesi (şehir çarpanıyla çarpılır) */
export const ARREST_BONUS = 120;

/** Soruşturmanın faili bulma şansı. patrol: devriye kararının etkisi (civic-powers.ts, -0,03 … +0,06) */
export function solveChance(officerSkills: Skills, profession: string, criminalSkills: Skills, patrol = 0): number {
  const elite = profession === 'agent' || profession === 'swat' ? 0.1 : 0;
  return clamp(
    0.35 + lv(officerSkills, 'law') * 0.004 + lv(officerSkills, 'investigation') * 0.006 + elite - lv(criminalSkills, 'stealth') * 0.005 + patrol,
    0.1,
    0.9,
  );
}

/** Tutuklu şüphelinin davasına yargıç bakmazsa mahkeme bu süre sonunda kendiliğinden karar verir (oyun saati) */
export const CASE_HOURS = 12;
/** Kararı veren yargıcın ikramiyesi (şehir çarpanıyla çarpılır) */
export const RULING_BONUS = 150;

export type Severity = 'light' | 'normal' | 'harsh';
export const SEVERITY_MULT: Record<Severity, number> = { light: 0.5, normal: 1, harsh: 1.5 };

/** Kefalet: kalan her ceza saati için ödenen tutar (şehir çarpanıyla çarpılır). Sadece hüküm giymiş mahkûmlar ödeyebilir. */
export const BAIL_PER_HOUR = 40;
export const bailCost = (remainingHours: number, costMult: number) => Math.max(1, Math.ceil(remainingHours * BAIL_PER_HOUR * costMult));
