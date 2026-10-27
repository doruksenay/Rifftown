// Popmundo tarzı beceri ağacı.
// Beceriler önce açılır (kitapçıdan kitap alarak ya da okulda), sonra çalışılarak geliştirilir.
// Bazı beceriler bir öncül beceride belli bir seviyeye ulaşmayı gerektirir.

import type { Genre, Instrument, L, Lang } from './world';
import { GENRES } from './world';
import { tierOf } from './tiers';
import { EXTRA_SKILLS } from './content/skills';

/**
 * Becerilerin genel etkileri (veri dosyalarındaki beceriler için). Değer, beceri 100 iken etkinin büyüklüğüdür:
 * songwriting/recording/stage/crafting/fitness: o puana eklenen (beceri × ağırlık);
 * rehearsal/busking/social/romance: çarpana eklenen (beceri ÷ 100 × ağırlık).
 */
export type SkillEffectKind = 'songwriting' | 'rehearsal' | 'recording' | 'busking' | 'stage' | 'crafting' | 'social' | 'romance' | 'fitness';

export type SkillCategory = 'music' | 'instruments' | 'genres' | 'stage' | 'career' | 'social' | 'sports' | 'crafts' | 'crime';

/** Ekranlarda gösterim sırası */
export const SKILL_CATEGORIES: SkillCategory[] = ['instruments', 'music', 'stage', 'genres', 'career', 'social', 'sports', 'crafts', 'crime'];

export const SKILL_CATEGORY_NAMES: Record<SkillCategory, L> = {
  music: { tr: 'Müzik', en: 'Music' },
  instruments: { tr: 'Enstrümanlar', en: 'Instruments' },
  genres: { tr: 'Müzik türleri', en: 'Music genres' },
  stage: { tr: 'Sahne', en: 'Stage' },
  career: { tr: 'Kariyer', en: 'Career' },
  social: { tr: 'Sosyal', en: 'Social' },
  sports: { tr: 'Spor', en: 'Sports' },
  crafts: { tr: 'Zanaat', en: 'Crafts' },
  crime: { tr: 'Sokak', en: 'Street' },
};

/** Müzik becerileri müzik okulunda, kariyer becerileri üniversitede çalışılır.
 *  Sokak, sosyal, spor ve zanaat becerileri okulda öğretilmez: kitapla açılır (kondisyon spor salonunda),
 *  kendi kendine ve yaparak gelişir. */
export const studyPlaceFor = (cat: SkillCategory): 'school' | 'university' | null =>
  cat === 'crime' || cat === 'social' || cat === 'sports' || cat === 'crafts' ? null : cat === 'career' ? 'university' : 'school';

export interface SkillDef {
  id: string;
  category: SkillCategory;
  name: L;
  /** Ne işe yaradığı, tek cümle */
  about: L;
  /** Açmak için gereken öncül beceri ve en düşük değeri */
  prereq?: { skill: string; min: number };
  /** book: kitapçıdan kitapla açılır. school: sadece müzik okulunda, university: sadece üniversitede öğrenilir. */
  learn: 'book' | 'school' | 'university' | 'gym';
  /** Sadece VIP üyeler açabilir */
  vip?: boolean;
  bookPrice?: number;
  /** Seviye atlayınca kurulan cümle: {tier} yerine seviye adı gelir */
  levelUp?: L;
  /** Genel etkiler (bkz. SkillEffectKind) */
  effects?: Partial<Record<SkillEffectKind, number>>;
}

const PREREQ_LEVEL = 15; // "çırak"

const genreSkill = (g: Genre, tr: string, en: string): SkillDef => ({
  id: `genre_${g}`,
  category: 'genres',
  name: { tr, en },
  about: {
    tr: `${tr} şarkılarını ne kadar iyi öğrenebileceğini belirler. Bilmeyen biri bu türden bir şarkıyı en fazla yarı yarıya öğrenir.`,
    en: `Sets how well you can learn ${en} songs. Without it you can only learn a song in this genre halfway.`,
  },
  learn: 'book',
  bookPrice: 30,
});

export const SKILL_DEFS: SkillDef[] = [
  // ---------- Müzik ----------
  {
    id: 'composing', category: 'music', learn: 'book', bookPrice: 40,
    name: { tr: 'Temel beste', en: 'Basic composing' },
    about: { tr: 'Yazdığın şarkıların melodisi ve kalitesi.', en: 'The melody and quality of the songs you write.' },
    levelUp: { tr: 'Artık {tier} bir bestecisin!', en: "You're now {a} {tier} composer!" },
  },
  {
    id: 'lyrics', category: 'music', learn: 'book', bookPrice: 40,
    name: { tr: 'Temel söz yazımı', en: 'Basic lyrics' },
    about: { tr: 'Şarkı sözlerinin gücü; şarkı kalitesini etkiler.', en: 'How strong your lyrics are; affects song quality.' },
    levelUp: { tr: 'Artık {tier} bir söz yazarısın!', en: "You're now {a} {tier} lyricist!" },
  },
  {
    id: 'improvisation', category: 'music', learn: 'school',
    prereq: { skill: 'composing', min: 30 },
    name: { tr: 'Doğaçlama', en: 'Improvisation' },
    about: { tr: 'Provalarda şarkıları daha hızlı öğrenirsin.', en: 'You learn songs faster in rehearsals.' },
  },
  // ---------- Enstrümanlar ----------
  {
    id: 'basic_singing', category: 'instruments', learn: 'book', bookPrice: 40,
    name: { tr: 'Temel şan', en: 'Basic singing' },
    about: { tr: 'Nefes ve ses kontrolü. Solo vokalin temeli.', en: 'Breath and voice control. The basis of lead vocals.' },
  },
  {
    id: 'vocals', category: 'instruments', learn: 'book', bookPrice: 80,
    prereq: { skill: 'basic_singing', min: PREREQ_LEVEL },
    name: { tr: 'Solo vokal', en: 'Lead vocals' },
    about: { tr: 'Grupta vokal rolünde ne kadar iyi olduğun.', en: 'How good you are in the vocals role.' },
    levelUp: { tr: 'Artık {tier} bir vokalistsin!', en: "You're now {a} {tier} vocalist!" },
  },
  {
    id: 'basic_strings', category: 'instruments', learn: 'book', bookPrice: 40,
    name: { tr: 'Temel telli çalgılar', en: 'Basic string instruments' },
    about: { tr: 'Gitar, bas gitar ve kemanın ortak temeli.', en: 'The shared basis of guitar, bass and violin.' },
  },
  {
    id: 'guitar', category: 'instruments', learn: 'book', bookPrice: 80,
    prereq: { skill: 'basic_strings', min: PREREQ_LEVEL },
    name: { tr: 'Elektro gitar', en: 'Electric guitar' },
    about: { tr: 'Grupta gitar rolünde ne kadar iyi olduğun.', en: 'How good you are in the guitar role.' },
    levelUp: { tr: 'Artık {tier} bir gitaristsin!', en: "You're now {a} {tier} guitarist!" },
  },
  {
    id: 'bass', category: 'instruments', learn: 'book', bookPrice: 80,
    prereq: { skill: 'basic_strings', min: PREREQ_LEVEL },
    name: { tr: 'Bas gitar', en: 'Bass guitar' },
    about: { tr: 'Grupta bas rolünde ne kadar iyi olduğun.', en: 'How good you are in the bass role.' },
    levelUp: { tr: 'Artık {tier} bir basçısın!', en: "You're now {a} {tier} bassist!" },
  },
  {
    id: 'basic_percussion', category: 'instruments', learn: 'book', bookPrice: 40,
    name: { tr: 'Temel vurmalı çalgılar', en: 'Basic percussion' },
    about: { tr: 'Ritim duygusu. Davulun ve perküsyonun temeli.', en: 'Sense of rhythm. The basis of drums and percussion.' },
  },
  {
    id: 'drums', category: 'instruments', learn: 'book', bookPrice: 80,
    prereq: { skill: 'basic_percussion', min: PREREQ_LEVEL },
    name: { tr: 'Davul', en: 'Drums' },
    about: { tr: 'Grupta davul rolünde ne kadar iyi olduğun.', en: 'How good you are in the drums role.' },
    levelUp: { tr: 'Artık {tier} bir davulcusun!', en: "You're now {a} {tier} drummer!" },
  },
  {
    id: 'basic_keyboard', category: 'instruments', learn: 'book', bookPrice: 40,
    name: { tr: 'Temel klavyeli çalgılar', en: 'Basic keyboard instruments' },
    about: { tr: 'Nota ve akor bilgisi. Klavyenin temeli.', en: 'Notes and chords. The basis of keyboards.' },
  },
  {
    id: 'keys', category: 'instruments', learn: 'book', bookPrice: 80,
    prereq: { skill: 'basic_keyboard', min: PREREQ_LEVEL },
    name: { tr: 'Klavye', en: 'Keyboards' },
    about: { tr: 'Grupta klavye rolünde ne kadar iyi olduğun.', en: 'How good you are in the keyboards role.' },
    levelUp: { tr: 'Artık {tier} bir klavyecisin!', en: "You're now {a} {tier} keyboardist!" },
  },
  {
    id: 'basic_winds', category: 'instruments', learn: 'book', bookPrice: 40,
    name: { tr: 'Temel nefesli çalgılar', en: 'Basic wind instruments' },
    about: { tr: 'Nefes, dudak ve parmak düzeni. Saksofonun temeli.', en: 'Breath, embouchure and fingering. The basis of the saxophone.' },
  },
  // ---------- Müzik türleri ----------
  genreSkill('pop', 'Pop', 'Pop'),
  genreSkill('rock', 'Rock', 'Rock'),
  genreSkill('hiphop', 'Hip-hop', 'Hip-hop'),
  genreSkill('electronic', 'Elektronik', 'Electronic'),
  genreSkill('metal', 'Metal', 'Metal'),
  genreSkill('jazz', 'Caz', 'Jazz'),
  genreSkill('anatolian', 'Anadolu rock', 'Anatolian rock'),
  genreSkill('blues', 'Blues', 'Blues'),
  genreSkill('folk', 'Folk', 'Folk'),
  genreSkill('punk', 'Punk', 'Punk'),
  genreSkill('soul', 'Soul', 'Soul'),
  genreSkill('reggae', 'Reggae', 'Reggae'),
  genreSkill('country', 'Country', 'Country'),
  genreSkill('classical', 'Klasik', 'Classical'),
  // ---------- Sahne ----------
  {
    id: 'showmanship', category: 'stage', learn: 'book', bookPrice: 40,
    name: { tr: 'Temel şovmenlik', en: 'Basic showmanship' },
    about: { tr: 'Sahnede seyirciyi ne kadar yakaladığın.', en: 'How well you grab the audience on stage.' },
    levelUp: { tr: 'Artık {tier} bir şovmensin!', en: "You're now {a} {tier} showman!" },
  },
  {
    id: 'pro_showmanship', category: 'stage', learn: 'school',
    prereq: { skill: 'showmanship', min: 30 },
    name: { tr: 'Profesyonel şovmenlik', en: 'Professional showmanship' },
    about: { tr: 'Büyük sahnelerde fark yaratan sahne hâkimiyeti.', en: 'The stage command that makes a difference on big stages.' },
  },
  {
    id: 'dancing', category: 'stage', learn: 'book', bookPrice: 50,
    name: { tr: 'Temel dans', en: 'Basic dancing' },
    about: { tr: 'Sahnede hareket; performansa katkı sağlar.', en: 'Moving on stage; adds to your performance.' },
    levelUp: { tr: 'Artık {tier} bir dansçısın!', en: "You're now {a} {tier} dancer!" },
  },
  {
    id: 'stagediving', category: 'stage', learn: 'book', bookPrice: 120, vip: true,
    prereq: { skill: 'showmanship', min: 30 },
    name: { tr: 'Sahneden atlama', en: 'Stage diving' },
    about: { tr: 'Seyircinin üstüne atlayıp geceyi unutulmaz kılmak. Sahne performansına katkı sağlar.', en: 'Leaping into the crowd to make the night unforgettable. Adds to stage performance.' },
  },
  {
    id: 'audience', category: 'stage', learn: 'book', bookPrice: 60,
    prereq: { skill: 'showmanship', min: PREREQ_LEVEL },
    name: { tr: 'Seyirci farkındalığı', en: 'Audience awareness' },
    about: { tr: 'Salonun havasını okuyup sete yön vermek.', en: 'Reading the room and steering the set.' },
  },
  {
    id: 'production', category: 'music', learn: 'book', bookPrice: 60,
    prereq: { skill: 'composing', min: PREREQ_LEVEL },
    name: { tr: 'Kayıt yapımcılığı', en: 'Record production' },
    about: { tr: 'Kayıt stüdyosunda şarkıların kayıt kalitesini artırır.', en: 'Improves the quality of your recordings in the studio.' },
    levelUp: { tr: 'Artık {tier} bir yapımcısın!', en: "You're now {a} {tier} producer!" },
  },
  // ---------- Kariyer (meslekler ve siyaset için) ----------
  {
    id: 'law', category: 'career', learn: 'book', bookPrice: 60,
    name: { tr: 'Temel hukuk', en: 'Basic law' },
    about: { tr: 'Polislik, ajanlık ve yargıçlık için gerekir.', en: 'Needed for police, agent and judge careers.' },
  },
  {
    id: 'economics', category: 'career', learn: 'book', bookPrice: 60,
    name: { tr: 'Temel ekonomi', en: 'Basic economics' },
    about: { tr: 'Belediye memurluğu, CEO\'luk ve valilik için gerekir.', en: 'Needed for civil service, CEO and governor roles.' },
  },
  {
    id: 'medicine', category: 'career', learn: 'book', bookPrice: 60,
    name: { tr: 'Temel tıp', en: 'Basic medicine' },
    about: { tr: 'Doktorluk için gerekir.', en: 'Needed for a career as a doctor.' },
  },
  {
    id: 'theology', category: 'career', learn: 'book', bookPrice: 60,
    name: { tr: 'Temel din bilgisi', en: 'Basic theology' },
    about: { tr: 'Din görevliliği için gerekir.', en: 'Needed for a career in the clergy.' },
  },
  {
    id: 'investigation', category: 'career', learn: 'book', bookPrice: 60,
    prereq: { skill: 'law', min: PREREQ_LEVEL },
    name: { tr: 'Soruşturma', en: 'Investigation' },
    about: { tr: 'Polislerin faili meçhul suçları çözme şansını artırır.', en: 'Raises a police officer\'s chance of solving unsolved crimes.' },
    levelUp: { tr: 'Artık {tier} bir dedektifsin!', en: "You're now {a} {tier} detective!" },
  },
  {
    id: 'rhetoric', category: 'career', learn: 'university', vip: true,
    name: { tr: 'Retorik', en: 'Rhetoric' },
    about: { tr: 'İkna ve hitabet. Belediye başkanlığına aday olmak için gerekir.', en: 'Persuasion and public speaking. Needed to run for mayor.' },
  },
  {
    id: 'media', category: 'career', learn: 'university', vip: true,
    prereq: { skill: 'economics', min: PREREQ_LEVEL },
    name: { tr: 'Medya ilişkileri', en: 'Media relations' },
    about: { tr: 'Basını yönetmek. CEO olmak için gerekir; konserlerden kazanılan şöhreti biraz artırır.', en: 'Handling the press. Needed to become a CEO; slightly increases fame from gigs.' },
  },
  {
    id: 'business', category: 'career', learn: 'university',
    prereq: { skill: 'economics', min: PREREQ_LEVEL },
    name: { tr: 'İşletmecilik', en: 'Business management' },
    about: { tr: 'Kendi işletmende çalışırken kasaya giren parayı artırır.', en: 'Increases the money your own business makes from each staffed hour.' },
    levelUp: { tr: 'Artık {tier} bir işletmecisin!', en: "You're now {a} {tier} manager!" },
  },
  // ---------- Sosyal ----------
  {
    id: 'charisma', category: 'social', learn: 'book', bookPrice: 40,
    name: { tr: 'Karizma', en: 'Charisma' },
    about: { tr: 'İnsanlarla takılırken arkadaşlığın daha hızlı gelişir.', en: 'Friendships grow faster when you hang out with people.' },
    levelUp: { tr: 'Artık {tier} derecede karizmatiksin!', en: "Your charisma is now {tier}!" },
  },
  {
    id: 'seduction', category: 'social', learn: 'book', bookPrice: 60,
    prereq: { skill: 'charisma', min: PREREQ_LEVEL },
    name: { tr: 'Cazibe', en: 'Charm' },
    about: { tr: 'Flört ve randevularda romantizmi daha hızlı artırır.', en: 'Romance grows faster when flirting and on dates.' },
  },
  // ---------- Spor ----------
  {
    id: 'fitness', category: 'sports', learn: 'gym',
    name: { tr: 'Kondisyon', en: 'Fitness' },
    about: { tr: 'Spor salonunda ilk antrenmanla açılır. Yorucu işlerde daha az sağlık kaybedersin (en fazla %40).', en: 'Unlocked with your first gym workout. You lose less health from tiring activities (up to 40%).' },
    levelUp: { tr: 'Kondisyonun artık {tier}!', en: 'Your fitness is now {tier}!' },
  },
  // ---------- Zanaat ----------
  {
    id: 'craftsmanship', category: 'crafts', learn: 'book', bookPrice: 50,
    name: { tr: 'El işçiliği', en: 'Craftsmanship' },
    about: { tr: 'Atölyede ürettiğin enstrüman ve kostümlerin kalitesini belirler.', en: 'Sets the quality of the instruments and costumes you make in the workshop.' },
    levelUp: { tr: 'Artık {tier} bir zanaatkârsın!', en: "You're now {a} {tier} craftsperson!" },
  },
  // ---------- Sokak (suç) ----------
  {
    id: 'street_smarts', category: 'crime', learn: 'book', bookPrice: 50,
    name: { tr: 'Sokak kurnazlığı', en: 'Street smarts' },
    about: { tr: 'Sokağın kurallarını bilmek. Küçük suçlarda başarı şansını artırır.', en: 'Knowing how the street works. Improves your odds at petty crime.' },
  },
  {
    id: 'stealth', category: 'crime', learn: 'book', bookPrice: 70,
    prereq: { skill: 'street_smarts', min: PREREQ_LEVEL },
    name: { tr: 'Gizlilik', en: 'Stealth' },
    about: { tr: 'Fark edilmeden hareket etmek. Suçta başarıyı artırır, polisin seni bulmasını zorlaştırır.', en: 'Moving unseen. Improves your odds and makes you harder for the police to trace.' },
  },
  {
    id: 'lockpicking', category: 'crime', learn: 'book', bookPrice: 90,
    prereq: { skill: 'stealth', min: PREREQ_LEVEL },
    name: { tr: 'Kilit açma', en: 'Lockpicking' },
    about: { tr: 'Ofis soygunu için gerekir.', en: 'Needed for office burglary.' },
  },
];

// Veri dosyasındaki ek beceriler (packages/shared/src/content/skills.ts)
SKILL_DEFS.push(...EXTRA_SKILLS);

export const SKILL_BY_ID: Record<string, SkillDef> = Object.fromEntries(SKILL_DEFS.map((s) => [s.id, s]));

const EFFECT_SKILLS = SKILL_DEFS.filter((d) => d.effects);
/** Bir etki türüne bütün bilinen becerilerden gelen toplam (bkz. SkillEffectKind) */
export function skillBonus(s: Skills, kind: SkillEffectKind): number {
  let sum = 0;
  for (const d of EFFECT_SKILLS) {
    const w = d.effects![kind];
    if (w && typeof s[d.id] === 'number') sum += s[d.id] * w;
  }
  return sum;
}
/** Çarpan türündeki etkiler için: 1 + beceri ÷ 100 × ağırlık, en fazla ×1,5 */
export const skillMult = (s: Skills, kind: SkillEffectKind) => Math.min(1.5, 1 + skillBonus(s, kind) / 100);
export const SKILLS = SKILL_DEFS.map((s) => s.id);
export type Skill = string;
/** Sadece açılmış beceriler anahtar olarak bulunur. */
export type Skills = Record<string, number>;

export const isSkill = (id: string) => !!SKILL_BY_ID[id];
export const knows = (s: Skills, id: string) => typeof s[id] === 'number';
export const lv = (s: Skills, id: string) => s[id] ?? 0;
export const genreSkillId = (g: Genre) => `genre_${g}`;

/** Her grup rolünün temel ve asıl becerisi */
export const ROLE_SKILLS: Record<Instrument, { basic: string; specific: string }> = {
  vocals: { basic: 'basic_singing', specific: 'vocals' },
  guitar: { basic: 'basic_strings', specific: 'guitar' },
  bass: { basic: 'basic_strings', specific: 'bass' },
  drums: { basic: 'basic_percussion', specific: 'drums' },
  keys: { basic: 'basic_keyboard', specific: 'keys' },
  // Yeni roller: asıl beceriler content/skills.ts içinde (saksofon, keman, el perküsyonu)
  sax: { basic: 'basic_winds', specific: 'saxophone' },
  violin: { basic: 'basic_strings', specific: 'violin' },
  percussion: { basic: 'basic_percussion', specific: 'hand_percussion' },
};

/** Gruptaki rolde ne kadar iyi olduğun (0–100) */
export const roleSkill = (s: Skills, role: Instrument) =>
  0.75 * lv(s, ROLE_SKILLS[role].specific) + 0.25 * lv(s, ROLE_SKILLS[role].basic);

/** Sahne performansı (0–100) */
export const stageScore = (s: Skills) =>
  Math.min(
    100,
    0.45 * lv(s, 'showmanship') + 0.25 * lv(s, 'pro_showmanship') + 0.15 * lv(s, 'dancing') + 0.15 * lv(s, 'audience') + 0.1 * lv(s, 'stagediving') +
      Math.min(10, skillBonus(s, 'stage')),
  );

/** Şarkı yazarken kullanılan beceri (0–100) */
export const songwritingScore = (s: Skills, genre: Genre) =>
  Math.min(100, 0.45 * lv(s, 'composing') + 0.35 * lv(s, 'lyrics') + 0.2 * lv(s, genreSkillId(genre)) + Math.min(10, skillBonus(s, 'songwriting')));

/** Tür becerisine göre bir şarkıda ulaşılabilecek en yüksek aşinalık (50–100) */
export const familiarityCap = (s: Skills, genre: Genre) => 50 + lv(s, genreSkillId(genre)) / 2;

/** Bu beceri hangi rollerin enstrümanından fayda görür? (çalışma verimi bonusu için) */
export const rolesForSkill = (skill: string): Instrument[] =>
  (Object.keys(ROLE_SKILLS) as Instrument[]).filter(
    (r) => ROLE_SKILLS[r].basic === skill || ROLE_SKILLS[r].specific === skill,
  );

/** Beceri açılabilir mi? Açılamıyorsa hata kodu döner. */
export function learnBlocker(
  s: Skills,
  id: string,
  isVip = false,
): 'invalid_skill' | 'already_known' | 'missing_prereq' | 'vip_required' | null {
  const def = SKILL_BY_ID[id];
  if (!def) return 'invalid_skill';
  if (knows(s, id)) return 'already_known';
  if (def.vip && !isVip) return 'vip_required';
  if (def.prereq && lv(s, def.prereq.skill) < def.prereq.min) return 'missing_prereq';
  return null;
}

export function startingSkills(main: Instrument, genre: Genre): Skills {
  return {
    [ROLE_SKILLS[main].basic]: 20,
    [ROLE_SKILLS[main].specific]: 12,
    composing: 5,
    lyrics: 5,
    showmanship: 5,
    [genreSkillId(genre)]: 10,
  };
}

/** Seviye atlama cümlesi: "Artık usta bir gitaristsin!" */
export function levelUpText(skill: string, value: number, lang: Lang): string {
  const def = SKILL_BY_ID[skill];
  const tier = tierOf('skill', value).name[lang];
  if (def?.levelUp) {
    const a = /^[aeiou]/i.test(tier) ? 'an' : 'a';
    return def.levelUp[lang].replace('{tier}', tier).replace('{a}', a);
  }
  const name = def ? def.name[lang] : skill;
  return lang === 'en' ? `${name}: you're now at ${tier} level!` : `${name}: artık ${tier} seviyedesin!`;
}

/** Bir çalışmanın sonucunu kelimeyle anlatır */
export function gainText(gain: number, lang: Lang): string {
  if (gain <= 0) return lang === 'en' ? 'did not improve' : 'hiç gelişmedi';
  if (gain < 0.5) return lang === 'en' ? 'improved a tiny bit' : 'çok az gelişti';
  if (gain < 1.5) return lang === 'en' ? 'improved a little' : 'biraz gelişti';
  if (gain < 3) return lang === 'en' ? 'improved nicely' : 'epey gelişti';
  return lang === 'en' ? 'improved a lot' : 'çok gelişti';
}

// Eski kodla uyum: türlerin tamamı beceri olarak tanımlı mı?
export const ALL_GENRE_SKILLS = GENRES.map(genreSkillId);
