// Özel ders ve ilişkiye dayalı öğrenme.
// Üç öğretmen türü vardır; hepsi süreli 'lesson' eylemiyle (1, 2 ya da 4 saat) öğrenciye beceri kazandırır:
// - Profesör (oyunun kadrosu): okulda ya da üniversitede, kendi alanında, belli bir seviyeye kadar; ücretli ve en verimli.
// - Oyuncu öğretmen: müzik öğretmeni mesleğindeki oyuncu, müzik okulunda bulunurken kendi belirlediği (tavanlı) ücretle.
// - Arkadaş ya da sevgili: ücretsiz, aynı şehirde; verim ilişkinin seviyesine göre artar ama ücretli özel dersin altında kalır.
// Özel ders bir beceriyi açmaz, yalnızca bilinen beceriyi geliştirir (kitap ve ilk ders kilitleri aynen geçerli).
// Öğrenci öğretmenin (profesörün) seviyesini geçemez.

import type { SkillCategory } from './skills';
import { CITIES, type L } from './world';
import { indexBy } from './lookup';

export type TutorKind = 'professor' | 'teacher' | 'friend';

/** Verim çarpanları (çalışma artışında okul 2,2, ev 1,0 yerine) */
export const LESSON_RATES = {
  professor: 3.2,
  /** Oyuncu öğretmen: rütbeyle artar (0. rütbe 2,6 → 3. rütbe 3,05) */
  teacherBase: 2.6,
  teacherPerRank: 0.15,
} as const;

/** Profesör ders ücreti (saat başına, şehir çarpanıyla): grup dersinin üç katı */
export const PROFESSOR_PRICE_PER_HOUR = { school: 90, university: 120 } as const;
/** Oyuncu öğretmenin saatlik ücret aralığı (şehir çarpanı yok) */
export const TEACHER_PRICE_RANGE: [number, number] = [10, 120];
/** Ders ücretinin okula (oyundan çıkan) kesilen payı; kalanı öğretmene */
export const TEACHER_FEE_CUT = 0.2;
/** Bir öğretmenin bir oyun gününde derslerden kazanabileceği en fazla para */
export const TEACHER_DAILY_EARN_CAP = 400;
/** Bir öğrencinin bir oyun gününde alabileceği ücretli özel ders saati (profesör + öğretmen) */
export const PRIVATE_DAILY_HOURS = 4;
/** Bir öğrencinin bir oyun gününde arkadaşından alabileceği ders saati */
export const FRIEND_DAILY_HOURS = 4;
/** Aynı ikili arasında arkadaş dersi bekleme süresi (oyun saati) */
export const FRIEND_PAIR_COOLDOWN_HOURS = 6;
/** Davet ("ona öğret") bekleme süresi, ikili başına */
export const LESSON_INVITE_COOLDOWN_HOURS = 6;
/** Öğretmenin öğrenciden en az bu kadar iyi olması gerekir */
export const TEACHER_MARGIN = 10;
export const FRIEND_MARGIN = 5;
/** Öğretenin kendi becerisine pekiştirme (saat başına, azalan getiriyle) */
export const TEACHER_REINFORCE_PER_HOUR = 0.05;
/** Arkadaş dersi ilişkiye katkı */
export const FRIEND_LESSON_FRIENDSHIP = 1;
/** Arkadaştan öğrenilemeyen kategoriler: sokak (suç) becerileri arkadaştan öğretilmez */
export const FRIEND_FORBIDDEN_CATEGORIES: SkillCategory[] = ['crime'];

export const teacherRate = (rank: number) => Math.round((LESSON_RATES.teacherBase + LESSON_RATES.teacherPerRank * Math.max(0, Math.min(3, rank))) * 100) / 100;

/**
 * Arkadaş ya da sevgili dersinin verimi: arkadaşlık seviyesine göre (tanıdık 1,2 · arkadaş 1,4 · yakın arkadaş 1,6 ·
 * can dostu 1,8), sevgililik ve nişan +0,2, evlilik +0,3; en fazla 1,9 (her zaman ücretli özel dersin altında).
 * Tanıdık değilse ve sevgili değilse ders yok (0).
 */
export function friendRate(friendship: number, stage: 'none' | 'dating' | 'engaged' | 'married'): number {
  let base = friendship >= 80 ? 1.8 : friendship >= 55 ? 1.6 : friendship >= 30 ? 1.4 : friendship >= 10 ? 1.2 : 0;
  if (stage !== 'none') base = Math.max(base, 1.2) + (stage === 'married' ? 0.3 : 0.2);
  return Math.round(Math.min(1.9, base) * 100) / 100;
}

// ---------- Profesörler ----------

export interface ProfessorDef {
  id: string;
  cityId: string;
  category: SkillCategory;
  place: 'school' | 'university';
  name: string;
  about: L;
  /** Öğrenciyi en fazla bu seviyeye kadar götürebilir */
  maxLevel: number;
}

/** Müzik okulunda öğretilen kategoriler ve üniversitede öğretilen kategori */
export const PROFESSOR_CATEGORIES: { category: SkillCategory; place: 'school' | 'university'; about: L }[] = [
  { category: 'instruments', place: 'school', about: { tr: 'Enstrüman ustası; parmak pozisyonundan nefese her şeyi düzeltir.', en: 'An instrument master who fixes everything from finger position to breath.' } },
  { category: 'music', place: 'school', about: { tr: 'Beste ve armoni hocası; şarkıyı söküp yeniden kurar.', en: 'A composition and harmony tutor who takes songs apart and rebuilds them.' } },
  { category: 'stage', place: 'school', about: { tr: 'Eski bir sahne yıldızı; seyirciye nasıl bakılacağını öğretir.', en: 'A former stage star who teaches how to look at an audience.' } },
  { category: 'genres', place: 'school', about: { tr: 'Tür tarihçisi; her türün kurallarını ve nasıl bozulacağını bilir.', en: 'A genre historian who knows every style\'s rules and how to break them.' } },
  { category: 'career', place: 'university', about: { tr: 'Üniversitenin kıdemli profesörü; hukuktan ekonomiye ders verir.', en: 'The university\'s senior professor, teaching everything from law to economics.' } },
];

/** Her şehrin beş profesörü (kategori sırasıyla) */
const NAMES: Record<string, [string, string, string, string, string]> = {
  istanbul: ['Prof. Nur Erkan', 'Prof. Selim Arda', 'Prof. Zerrin Yel', 'Prof. Orhan Tekin', 'Prof. Leyla Sezer'],
  ankara: ['Prof. Halit Ergin', 'Prof. Sevgi Ateş', 'Prof. Cengiz Kaya', 'Prof. Gül Demirtaş', 'Prof. Rıza Ulus'],
  izmir: ['Prof. Ayşe Kordon', 'Prof. Kemal Ege', 'Prof. Nil Saraç', 'Prof. Tarık Bornova', 'Prof. Füsun Alkan'],
  berlin: ['Prof. Ingrid Wolff', 'Prof. Dieter Haas', 'Prof. Petra Lang', 'Prof. Karl Brandt', 'Prof. Ulrike Stein'],
  hamburg: ['Prof. Jens Möller', 'Prof. Heike Krause', 'Prof. Sven Albers', 'Prof. Birte Hansen', 'Prof. Olaf Petersen'],
  munich: ['Prof. Franz Hofer', 'Prof. Elisabeth Graf', 'Prof. Anton Maier', 'Prof. Theresa Huber', 'Prof. Georg Lehner'],
  london: ['Prof. Margaret Holt', 'Prof. Nigel Price', 'Prof. Sandra Keane', 'Prof. Oliver Grant', 'Prof. Priya Shah'],
  manchester: ['Prof. Ian Barlow', 'Prof. Joan Whitaker', 'Prof. Dave Crossley', 'Prof. Siobhan Kelly', 'Prof. Martin Hale'],
  liverpool: ['Prof. Rita Doherty', 'Prof. Billy Quinn', 'Prof. Maureen Lacey', 'Prof. Terry Connolly', 'Prof. Helen Rourke'],
  paris: ['Prof. Hélène Dubois', 'Prof. Marc Lefèvre', 'Prof. Sylvie Rousseau', 'Prof. Jacques Morel', 'Prof. Nadia Benali'],
  lyon: ['Prof. Pierre Vidal', 'Prof. Claire Brunet', 'Prof. Rémi Chabert', 'Prof. Odile Faure', 'Prof. Luc Girard'],
  marseille: ['Prof. Farid Haddad', 'Prof. Mireille Santoni', 'Prof. Paul Orsini', 'Prof. Samia Belkacem', 'Prof. Jean Castelli'],
  newyork: ['Prof. Ruth Goldberg', 'Prof. Marcus Hill', 'Prof. Denise Carter', 'Prof. Frank Russo', 'Prof. Angela Ortiz'],
  losangeles: ['Prof. Linda Vance', 'Prof. Carlos Mendez', 'Prof. Sharon Lee', 'Prof. Rick Dawson', 'Prof. Monica Reyes'],
  nashville: ['Prof. Earl Whitman', 'Prof. June Carter Hayes', 'Prof. Bobby Rae Tucker', 'Prof. Dolly Mae Harper', 'Prof. Walter Grimes'],
};

/** Şehre göre profesörün seviye tavanı: kategoriye ve şehrin müzik geleneğine göre 60–85 */
const CITY_DEPTH: Record<string, number> = {
  istanbul: 8, ankara: 6, izmir: 5, berlin: 12, hamburg: 6, munich: 10, london: 15, manchester: 8, liverpool: 7,
  paris: 12, lyon: 4, marseille: 3, newyork: 15, losangeles: 10, nashville: 9,
};
const CATEGORY_BASE: Partial<Record<SkillCategory, number>> = { instruments: 70, music: 68, stage: 66, genres: 64, career: 60 };

export const PROFESSORS: ProfessorDef[] = CITIES.flatMap((city) =>
  PROFESSOR_CATEGORIES.map((pc, i) => ({
    id: `${city.id}-${pc.category}`,
    cityId: city.id,
    category: pc.category,
    place: pc.place,
    name: NAMES[city.id]?.[i] ?? `Prof. ${city.name.en}`,
    about: pc.about,
    maxLevel: Math.min(85, Math.max(60, (CATEGORY_BASE[pc.category] ?? 60) + (CITY_DEPTH[city.id] ?? 5))),
  })),
);
export const PROFESSOR_BY_ID: Record<string, ProfessorDef> = indexBy(PROFESSORS, (p) => p.id);
/** Bir şehrin bir kategorideki profesörü */
export const professorFor = (cityId: string, category: SkillCategory) => PROFESSOR_BY_ID[`${cityId}-${category}`];
