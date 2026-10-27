// Karar derinliği: şarkıda alt tür ve tempo, şarkı yazma yorgunluğu, setlist sırası,
// konserde sahne olayları (performans planı) ve bis kararı.
// Popmundo'daki gibi: zayıf şarkılar öne, güçlüler sona; açılış ve kapanış önemlidir.
// Sahne olayları beceri ister, bekleme süresi vardır ve başarısız olursa geceye zarar verir.

import type { Genre, L } from './world';
import { type Skills, genreSkillId, lv } from './skills';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// ---------- Tempo ve alt tür ----------

export const TEMPOS = ['slow', 'mid', 'fast'] as const;
export type Tempo = (typeof TEMPOS)[number];
export const TEMPO_NAMES: Record<Tempo, L> = {
  slow: { tr: 'Yavaş', en: 'Slow' },
  mid: { tr: 'Orta', en: 'Mid-tempo' },
  fast: { tr: 'Hızlı', en: 'Fast' },
};
export const isTempo = (t: unknown): t is Tempo => typeof t === 'string' && (TEMPOS as readonly string[]).includes(t);

export interface SubgenreDef {
  id: string;
  genre: Genre;
  name: L;
  /** Alt türün doğal temposu: bu tempoda yazılan şarkı daha iyi oturur */
  tempo: Tempo;
  /** Bu alt türü iyi yazabilmek için gereken tür becerisi */
  minGenreSkill: number;
  /** Becerisi yetiyorsa kaliteye eklenen puan */
  bonus: number;
  /** Alt türün sahnesi: bu şehirlerde konserde şarkı daha çok tutar */
  scenes: string[];
}

const S = (id: string, genre: Genre, tr: string, en: string, tempo: Tempo, minGenreSkill: number, bonus: number, scenes: string[] = []): SubgenreDef => ({
  id,
  genre,
  name: { tr, en },
  tempo,
  minGenreSkill,
  bonus,
  scenes,
});

/**
 * Veri dosyası: yeni alt tür eklemek için buraya bir satır eklemek yeter (diğer içerik veri dosyaları packages/shared/src/content/ klasöründedir).
 * Alt türün değeri bağlama göre değişir (bkz. subgenreGigBonus): sahnesi olan şehirde +3, haftanın modasıysa +2,
 * zor (niş) alt türler büyük sahnelerde −3. Böylece "en yüksek yazım bonusu" her zaman en iyi seçim değildir.
 */
export const SUBGENRES: SubgenreDef[] = [
  S('dance_pop', 'pop', 'Dans pop', 'Dance pop', 'fast', 15, 2, ['losangeles', 'istanbul']),
  S('synth_pop', 'pop', 'Synth pop', 'Synth pop', 'mid', 30, 3, ['berlin', 'manchester']),
  S('pop_ballad', 'pop', 'Pop balad', 'Pop ballad', 'slow', 15, 2, ['istanbul', 'paris']),
  S('hard_rock', 'rock', 'Hard rock', 'Hard rock', 'fast', 15, 2, ['hamburg', 'ankara']),
  S('indie_rock', 'rock', 'Indie rock', 'Indie rock', 'mid', 15, 2, ['london', 'newyork']),
  S('prog_rock', 'rock', 'Progresif rock', 'Progressive rock', 'mid', 45, 4, ['london']),
  S('boom_bap', 'hiphop', 'Boom bap', 'Boom bap', 'mid', 15, 2, ['newyork']),
  S('trap', 'hiphop', 'Trap', 'Trap', 'slow', 30, 3, ['losangeles', 'marseille', 'istanbul']),
  S('house', 'electronic', 'House', 'House', 'mid', 15, 2, ['lyon', 'manchester']),
  S('techno', 'electronic', 'Tekno', 'Techno', 'fast', 30, 3, ['berlin']),
  S('ambient', 'electronic', 'Ambient', 'Ambient', 'slow', 30, 3, ['berlin', 'munich']),
  S('thrash', 'metal', 'Thrash metal', 'Thrash metal', 'fast', 30, 3, ['hamburg', 'losangeles']),
  S('doom', 'metal', 'Doom metal', 'Doom metal', 'slow', 30, 3, ['ankara']),
  S('bebop', 'jazz', 'Bebop', 'Bebop', 'fast', 45, 4, ['newyork']),
  S('smooth_jazz', 'jazz', 'Smooth caz', 'Smooth jazz', 'slow', 15, 2, ['losangeles', 'izmir']),
  S('psych_anatolian', 'anatolian', 'Psikedelik Anadolu', 'Anatolian psych', 'mid', 30, 3, ['istanbul', 'berlin']),
  S('anatolian_folk_rock', 'anatolian', 'Halk rock', 'Folk rock', 'mid', 15, 2, ['ankara', 'izmir']),
  S('delta_blues', 'blues', 'Delta blues', 'Delta blues', 'slow', 15, 2, ['nashville']),
  S('electric_blues', 'blues', 'Elektrik blues', 'Electric blues', 'mid', 30, 3, ['newyork', 'liverpool']),
  S('indie_folk', 'folk', 'Indie folk', 'Indie folk', 'mid', 15, 2, ['nashville', 'manchester']),
  S('folk_ballad', 'folk', 'Folk balad', 'Folk ballad', 'slow', 15, 2, ['izmir']),
  S('hardcore_punk', 'punk', 'Hardcore punk', 'Hardcore punk', 'fast', 15, 2, ['newyork', 'hamburg']),
  S('pop_punk', 'punk', 'Pop punk', 'Pop punk', 'fast', 30, 3, ['losangeles']),
  S('neo_soul', 'soul', 'Neo soul', 'Neo soul', 'mid', 30, 3, ['newyork', 'paris']),
  S('motown', 'soul', 'Motown', 'Motown', 'mid', 15, 2, ['newyork', 'liverpool']),
  S('roots_reggae', 'reggae', 'Roots reggae', 'Roots reggae', 'slow', 15, 2, ['london', 'marseille']),
  S('dub', 'reggae', 'Dub', 'Dub', 'slow', 30, 3, ['london', 'berlin']),
  S('outlaw_country', 'country', 'Outlaw country', 'Outlaw country', 'mid', 15, 2, ['nashville']),
  S('bluegrass', 'country', 'Bluegrass', 'Bluegrass', 'fast', 30, 3, ['nashville']),
  S('chamber', 'classical', 'Oda müziği', 'Chamber music', 'slow', 30, 3, ['munich', 'paris']),
  S('neo_classical', 'classical', 'Neo-klasik', 'Neo-classical', 'mid', 45, 4, ['munich']),
  S('drum_and_bass', 'electronic', 'Drum and bass', 'Drum and bass', 'fast', 30, 3, ['london']),
  S('lofi_hiphop', 'hiphop', 'Lo-fi hip-hop', 'Lo-fi hip-hop', 'slow', 15, 2, ['paris', 'istanbul']),
  S('black_metal', 'metal', 'Black metal', 'Black metal', 'fast', 45, 4, ['hamburg']),
  S('city_pop', 'pop', 'City pop', 'City pop', 'mid', 30, 3, ['losangeles', 'izmir']),
  // Ek alt türler (şehir sahneleriyle)
  S('electropop', 'pop', 'Elektropop', 'Electropop', 'fast', 30, 3, ['london', 'losangeles']),
  S('turkish_pop', 'pop', 'Türkçe pop', 'Turkish pop', 'mid', 15, 2, ['istanbul', 'ankara', 'izmir']),
  S('chanson_pop', 'pop', 'Şanson pop', 'Chanson pop', 'slow', 30, 3, ['paris', 'lyon']),
  S('garage_rock', 'rock', 'Garaj rock', 'Garage rock', 'fast', 15, 2, ['newyork', 'hamburg', 'liverpool']),
  S('britpop', 'rock', 'Britpop', 'Britpop', 'mid', 15, 2, ['manchester', 'london', 'liverpool']),
  S('krautrock', 'rock', 'Krautrock', 'Krautrock', 'mid', 45, 4, ['berlin', 'munich', 'hamburg']),
  S('grime', 'hiphop', 'Grime', 'Grime', 'fast', 30, 3, ['london', 'manchester']),
  S('french_rap', 'hiphop', 'Fransız rap', 'French rap', 'mid', 15, 2, ['marseille', 'paris']),
  S('turkish_rap', 'hiphop', 'Türkçe rap', 'Turkish rap', 'mid', 15, 2, ['istanbul', 'berlin']),
  S('synthwave', 'electronic', 'Synthwave', 'Synthwave', 'mid', 15, 2, ['losangeles']),
  S('minimal_techno', 'electronic', 'Minimal tekno', 'Minimal techno', 'fast', 45, 4, ['berlin']),
  S('french_house', 'electronic', 'Fransız house', 'French house', 'mid', 30, 3, ['paris', 'lyon']),
  S('power_metal', 'metal', 'Power metal', 'Power metal', 'fast', 30, 3, ['hamburg', 'munich']),
  S('nu_metal', 'metal', 'Nu metal', 'Nu metal', 'mid', 15, 2, ['losangeles']),
  S('gypsy_jazz', 'jazz', 'Manuş caz', 'Gypsy jazz', 'fast', 30, 3, ['paris', 'lyon']),
  S('cool_jazz', 'jazz', 'Cool caz', 'Cool jazz', 'slow', 30, 3, ['newyork', 'losangeles']),
  S('jazz_fusion', 'jazz', 'Füzyon', 'Fusion', 'fast', 45, 4, ['newyork', 'izmir']),
  S('anatolian_funk', 'anatolian', 'Anadolu funk', 'Anatolian funk', 'fast', 30, 3, ['istanbul', 'berlin']),
  S('ozgun', 'anatolian', 'Özgün müzik', 'Özgün protest folk', 'slow', 15, 2, ['ankara', 'izmir']),
  S('chicago_blues', 'blues', 'Chicago blues', 'Chicago blues', 'mid', 30, 3, ['newyork', 'nashville']),
  S('blues_rock', 'blues', 'Blues rock', 'Blues rock', 'fast', 15, 2, ['liverpool', 'london']),
  S('celtic_folk', 'folk', 'Kelt folk', 'Celtic folk', 'fast', 30, 3, ['liverpool', 'manchester']),
  S('turku', 'folk', 'Türkü', 'Turkish folk song', 'slow', 15, 2, ['ankara', 'izmir', 'istanbul']),
  S('chanson', 'folk', 'Şanson', 'Chanson', 'slow', 30, 3, ['paris']),
  S('post_punk', 'punk', 'Post-punk', 'Post-punk', 'mid', 30, 3, ['manchester', 'berlin']),
  S('ska_punk', 'punk', 'Ska punk', 'Ska punk', 'fast', 15, 2, ['london', 'losangeles']),
  S('northern_soul', 'soul', 'Northern soul', 'Northern soul', 'fast', 30, 3, ['manchester', 'liverpool']),
  S('funk', 'soul', 'Funk', 'Funk', 'fast', 15, 2, ['newyork', 'losangeles']),
  S('dancehall', 'reggae', 'Dancehall', 'Dancehall', 'fast', 30, 3, ['london', 'marseille']),
  S('ska', 'reggae', 'Ska', 'Ska', 'fast', 15, 2, ['london', 'liverpool']),
  S('lovers_rock', 'reggae', 'Lovers rock', 'Lovers rock', 'slow', 15, 2, ['london']),
  S('americana', 'country', 'Americana', 'Americana', 'mid', 15, 2, ['nashville', 'losangeles']),
  S('country_pop', 'country', 'Country pop', 'Country pop', 'mid', 30, 3, ['nashville']),
  S('honky_tonk', 'country', 'Honky tonk', 'Honky tonk', 'mid', 15, 2, ['nashville']),
  S('romantic_era', 'classical', 'Romantik dönem', 'Romantic era', 'slow', 30, 3, ['munich', 'paris', 'istanbul']),
  S('baroque', 'classical', 'Barok', 'Baroque', 'mid', 45, 4, ['munich', 'lyon']),
  S('film_score', 'classical', 'Film müziği', 'Film score', 'mid', 30, 3, ['losangeles', 'london']),
];
export const SUBGENRE_BY_ID: Record<string, SubgenreDef> = Object.fromEntries(SUBGENRES.map((s) => [s.id, s]));
export const subgenresOf = (genre: Genre) => SUBGENRES.filter((s) => s.genre === genre);

// ---------- Alt türün bağlamı: sahne şehri, haftanın modası, niş alt türler ----------

export const SUBGENRE_CONTEXT = {
  /** Alt türün sahnesi olan şehirde konserde şarkı puanına */
  scene: 3,
  /** Haftanın modası olan alt tür (her türden biri, liste haftasıyla döner) */
  trend: 2,
  /** Zor (niş) alt türler büyük sahnelerde (salon, stadyum, festival) seyirciyi kaçırır */
  nicheBigVenue: -3,
} as const;
/** Becerisi en yüksek eşik isteyen alt türler niştir */
export const isNicheSubgenre = (s: SubgenreDef) => s.minGenreSkill >= 45;
const BIG_VENUES = ['hall', 'stadium', 'festival'];

/** Haftanın modası: her tür için o liste haftasında bir alt tür (deterministik, herkes için aynı) */
export function trendingSubgenre(genre: Genre, weekId: number): string | null {
  const subs = subgenresOf(genre);
  if (!subs.length) return null;
  let h = (Math.imul(Math.max(0, Math.floor(weekId)) + 17, 2654435761) ^ GENRE_SALT(genre)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return subs[h % subs.length].id;
}
const GENRE_SALT = (g: string) => [...g].reduce((a, ch) => (Math.imul(a, 31) + ch.charCodeAt(0)) >>> 0, 7);

/** Bir şarkının alt türünün o konserdeki etkisi (şarkı puanına, −3 … +5) */
export function subgenreGigBonus(subgenreId: string | null | undefined, cityId: string, venue: string, weekId: number): number {
  const sub = subgenreId ? SUBGENRE_BY_ID[subgenreId] : undefined;
  if (!sub) return 0;
  let b = 0;
  if (sub.scenes.includes(cityId)) b += SUBGENRE_CONTEXT.scene;
  if (trendingSubgenre(sub.genre, weekId) === sub.id) b += SUBGENRE_CONTEXT.trend;
  if (isNicheSubgenre(sub) && BIG_VENUES.includes(venue)) b += SUBGENRE_CONTEXT.nicheBigVenue;
  return Math.max(-3, Math.min(5, b));
}

const TEMPO_INDEX: Record<Tempo, number> = { slow: 0, mid: 1, fast: 2 };

/**
 * Alt tür ve tempo seçiminin kaliteye etkisi (puan).
 * Alt türü bilmeden denemek kaliteyi biraz düşürür; doğal tempoya uymak artırır, tam tersi düşürür.
 */
export function styleBonus(skills: Skills, genre: Genre, subgenreId: string | null | undefined, tempo: Tempo): number {
  if (!subgenreId) return 0;
  const sub = SUBGENRE_BY_ID[subgenreId];
  if (!sub || sub.genre !== genre) return 0;
  const knowHow = lv(skills, genreSkillId(genre)) >= sub.minGenreSkill ? sub.bonus : -2;
  const gap = Math.abs(TEMPO_INDEX[sub.tempo] - TEMPO_INDEX[tempo]);
  const fit = gap === 0 ? 2 : gap === 1 ? 0 : -3;
  return knowHow + fit;
}

// ---------- Şarkı yazma hızı ----------

/** Bu kadar oyun günü içinde birden fazla şarkı yazmak kaliteyi düşürür (Popmundo: 3 gün) */
export const SONG_FATIGUE_WINDOW_DAYS = 3;
/** Pencerede zaten yazılmış şarkı sayısına göre kalite çarpanı */
export function songFatigueFactor(recentSongs: number): number {
  if (recentSongs <= 0) return 1;
  if (recentSongs === 1) return 0.85;
  if (recentSongs === 2) return 0.72;
  return 0.6;
}

// ---------- Setlist sırası ----------

export interface FlowSong {
  /** Şarkının o geceki puanı (kalite + aşinalık + çalım) */
  score: number;
  tempo?: Tempo;
}

/** Konum ağırlıkları: açılış biraz önemli, ısınma bölümü hafif, kapanış en önemli */
export const FLOW_WEIGHTS = { opener: 1.1, warmupStart: 0.85, warmupEnd: 1.1, closer: 1.35 } as const;
/** Setlist sırasından gelebilecek en büyük kalite etkisi (±puan) */
export const MAX_FLOW_EFFECT = 8;
/** Ağırlıklı ve düz ortalama farkının çarpanı. 2 → 5: sıra eskiden kaliteye 0,4 puan ekliyordu (süs; denge raporu §5). */
export const FLOW_MULT = 5;

/** Sıranın kaliteye etkisi (puan, ±MAX_FLOW_EFFECT). 3 şarkıdan kısa setlerde sıra önemsizdir. */
export function setlistFlow(songs: FlowSong[]): number {
  const n = songs.length;
  if (n < 3) return 0;
  const w = songs.map((_, i) =>
    i === 0 ? FLOW_WEIGHTS.opener : i === n - 1 ? FLOW_WEIGHTS.closer : FLOW_WEIGHTS.warmupStart + ((FLOW_WEIGHTS.warmupEnd - FLOW_WEIGHTS.warmupStart) * (i - 1)) / Math.max(1, n - 3),
  );
  const sumW = w.reduce((a, b) => a + b, 0);
  const weighted = songs.reduce((s, x, i) => s + x.score * w[i], 0) / sumW;
  const plain = songs.reduce((s, x) => s + x.score, 0) / n;
  let effect = (weighted - plain) * FLOW_MULT;
  // Tempo: hareketli bir açılış ve hızlı bir kapanış seyirciyi tutar; üst üste üç yavaş şarkı salonu uyutur
  if (songs[0].tempo && songs[0].tempo !== 'slow') effect += 1;
  if (songs[n - 1].tempo === 'fast') effect += 1.5;
  for (let i = 2; i < n; i++) {
    if (songs[i].tempo === 'slow' && songs[i - 1].tempo === 'slow' && songs[i - 2].tempo === 'slow') {
      effect -= 2;
      break;
    }
  }
  return Math.round(clamp(effect, -MAX_FLOW_EFFECT, MAX_FLOW_EFFECT) * 10) / 10;
}

// ---------- Sahne olayları ----------

export interface StageEventDef {
  id: string;
  name: L;
  about: L;
  /** Gereken beceri; 'role' ise sahnedekinin kendi rol becerisi (enstrüman bonusu dahil), 'genre' ise grubun türündeki beceri */
  skill: string;
  min: number;
  /** Başarılı olursa kaliteye eklenen, başarısızsa düşülen puan */
  bonus: number;
  penalty: number;
  /** Aynı grup bu olayı tekrar ne zaman deneyebilir (oyun saati) */
  cooldownHours: number;
  /** Yalnızca bu türlerdeki gruplar planlayabilir (yoksa her tür) */
  genres?: Genre[];
}

const E = (id: string, skill: string, min: number, bonus: number, penalty: number, cooldownHours: number, name: [string, string], about: [string, string], genres?: Genre[]): StageEventDef => ({
  id,
  genres,
  skill,
  min,
  bonus,
  penalty,
  cooldownHours,
  name: { tr: name[0], en: name[1] },
  about: { tr: about[0], en: about[1] },
});

export const STAGE_EVENTS: StageEventDef[] = [
  E('banter', 'showmanship', 15, 2, 2, 12, ['Seyirciyle sohbet', 'Crowd banter'], ['Şarkılar arasında seyirciyle şakalaşmak.', 'Joking with the crowd between songs.']),
  E('singalong', 'audience', 15, 4, 4, 24, ['Hep bir ağızdan', 'Sing-along'], ['Nakaratı seyirciye söyletmek.', 'Getting the crowd to sing the chorus.']),
  E('solo', 'role', 45, 5, 5, 24, ['Uzun solo', 'Extended solo'], ['Gecenin en iyi çalanı sahnenin önüne çıkar.', 'The best player steps to the front.']),
  E('dance', 'dancing', 30, 4, 4, 24, ['Dans koreografisi', 'Dance routine'], ['Prova edilmiş bir dans gösterisi.', 'A rehearsed dance routine.']),
  E('unplugged', 'improvisation', 15, 3, 3, 24, ['Akustik ara', 'Unplugged break'], ['Ortada sade, akustik bir bölüm.', 'A stripped-back acoustic moment mid-set.']),
  E('stage_dive', 'stagediving', 5, 6, 6, 48, ['Seyircinin üstüne atlamak', 'Stage dive'], ['Riskli ama unutulmaz.', 'Risky but unforgettable.']),
  // Beceriye ve türe bağlı olaylar (her biri bir becerinin sahnede ilk kez gerçek bir kullanımı)
  E('cover', 'genre', 30, 3, 3, 24, ['Sürpriz cover', 'Surprise cover'], ['Türün klasiklerinden birini kendi yorumunla çalmak (grubun türündeki beceri).', 'Playing a classic of your genre your own way (your genre skill).']),
  E('story', 'storytelling', 30, 3, 3, 12, ['Şarkının hikâyesi', 'The story behind the song'], ['Bir şarkıdan önce onun hikâyesini anlatmak.', 'Telling the story behind a song before playing it.']),
  E('light_cue', 'stage_lighting', 30, 3, 3, 24, ['Işık senkronu', 'Light cue'], ['Işıklar ritme kilitlenir; büyük an büyür.', 'The lights lock to the beat; the big moment gets bigger.']),
  E('sax_solo', 'saxophone', 45, 5, 5, 24, ['Saksofon solosu', 'Sax solo'], ['Saksofoncu sahnenin önüne çıkar.', 'The sax player steps to the front.']),
  E('violin_solo', 'violin', 45, 5, 5, 24, ['Keman solosu', 'Violin solo'], ['Salonu bir anda susturan bir keman bölümü.', 'A violin passage that silences the room.']),
  E('percussion_break', 'hand_percussion', 30, 4, 4, 24, ['Perküsyon arası', 'Percussion break'], ['Bütün grup susar, yalnızca ritim kalır.', 'The band drops out and only the rhythm remains.']),
  E('drum_battle', 'drums', 45, 4, 4, 48, ['Davul düellosu', 'Drum battle'], ['Davulcu seyirciyle ritim düellosuna girer.', 'The drummer takes on the crowd in a rhythm duel.']),
  E('mosh_pit', 'showmanship', 30, 5, 5, 24, ['Pogo çağrısı', 'Mosh pit call'], ['Salonun ortası açılır ve kıyamet kopar.', 'The middle of the room opens up and all hell breaks loose.'], ['rock', 'metal', 'punk']),
  E('freestyle', 'genre', 30, 5, 5, 24, ['Serbest doğaçlama', 'Freestyle'], ['Seyircinin verdiği kelimelerle anında rap.', 'Rapping on the spot with words thrown by the crowd.'], ['hiphop']),
  E('big_drop', 'synth_programming', 15, 5, 5, 24, ['Büyük drop', 'The big drop'], ['Uzun bir gerilimin ardından bas düşer.', 'After a long build-up, the bass drops.'], ['electronic']),
  E('jam', 'improvisation', 45, 5, 5, 24, ['Doğaçlama atışması', 'Trading fours'], ['Çalgıcılar sırayla dörder ölçü doğaçlama yapar.', 'The players trade four-bar improvisations.'], ['jazz', 'blues', 'soul']),
  E('call_response', 'vocal_harmony', 15, 4, 4, 24, ['Çağrı ve cevap', 'Call and response'], ['Vokal çağırır, salon cevap verir.', 'The singer calls, the room answers.'], ['soul', 'blues', 'country']),
  E('campfire', 'acoustic_guitar', 15, 4, 4, 24, ['Kamp ateşi anı', 'Campfire moment'], ['Herkesin bildiği bir türkü, akustik gitar eşliğinde.', 'A song everyone knows, around an acoustic guitar.'], ['folk', 'country', 'anatolian']),
  E('dub_echo', 'mixing', 15, 4, 4, 24, ['Dub yankısı', 'Dub echo'], ['Ses masasında canlı yankı ve boşluk.', 'Live echo and space from the mixing desk.'], ['reggae', 'electronic']),
  E('hushed_hall', 'audience', 45, 4, 4, 24, ['Nefesler tutuldu', 'Hushed hall'], ['En sessiz bölümde salonun nefesini tutması.', 'Holding the whole room breathless in the quietest passage.'], ['classical', 'jazz']),
];
/**
 * Olayın tarzı: mekânın büyüklüğüne göre etkisi değişir (bağlam). Samimi olaylar küçük sahnede, kalabalık ve gösteri
 * olayları büyük sahnede daha çok tutar. Bonus × EVENT_VENUE_MULT[tarz][mekân].
 */
export type StageEventStyle = 'intimate' | 'crowd' | 'virtuoso' | 'spectacle';
export const EVENT_STYLE: Record<string, StageEventStyle> = {
  banter: 'intimate', unplugged: 'intimate', story: 'intimate', campfire: 'intimate', hushed_hall: 'intimate',
  singalong: 'crowd', cover: 'crowd', mosh_pit: 'crowd', big_drop: 'crowd', call_response: 'crowd',
  solo: 'virtuoso', sax_solo: 'virtuoso', violin_solo: 'virtuoso', percussion_break: 'virtuoso', drum_battle: 'virtuoso', freestyle: 'virtuoso', jam: 'virtuoso',
  dance: 'spectacle', stage_dive: 'spectacle', light_cue: 'spectacle', dub_echo: 'spectacle',
};
export const EVENT_VENUE_MULT: Record<StageEventStyle, Record<string, number>> = {
  intimate: { bar: 1.3, club: 1.15, hall: 0.9, stadium: 0.6, festival: 0.7 },
  crowd: { bar: 0.7, club: 0.9, hall: 1.1, stadium: 1.3, festival: 1.3 },
  virtuoso: { bar: 1, club: 1.05, hall: 1.1, stadium: 0.9, festival: 0.9 },
  spectacle: { bar: 0.8, club: 1, hall: 1.1, stadium: 1.2, festival: 1.2 },
};
/**
 * Bir gecede denenen her ek olay seyirciyi yorar: k. olayın (0'dan sayılır) başarı şansı −EVENT_FATIGUE_CHANCE × k,
 * başarı bonusu × EVENT_STACK_MULT[k]; ceza tam. Ortalama enerjisi 40'ın altındaki grup olaylarda ayrıca −0,1 şans.
 * Eskiden olayın cezası bonusunun yarısıydı ve her nitelikli olay pozitif beklenen değerliydi: "3 olay + cesur bis"
 * her profilde ilk 5 planın tamamıydı (denge raporu §5). Şimdi ceza = bonus (eşikte beklenen değer negatif) ve üçüncü olay
 * ancak çok becerikli grupta başa baş.
 */
export const EVENT_FATIGUE_CHANCE = 0.12;
export const EVENT_STACK_MULT = [1, 0.7, 0.4] as const;
export const LOW_ENERGY_EVENT_PENALTY = 0.1;
export function stageEventOdds(def: StageEventDef, level: number, index: number, venue: string, avgEnergy: number) {
  const chance = clamp(stageEventChance(level, def.min) - EVENT_FATIGUE_CHANCE * index - (avgEnergy < 40 ? LOW_ENERGY_EVENT_PENALTY : 0), 0.05, 0.95);
  const ctx = EVENT_VENUE_MULT[EVENT_STYLE[def.id] ?? 'virtuoso'][venue] ?? 1;
  const bonus = def.bonus * (EVENT_STACK_MULT[Math.min(index, EVENT_STACK_MULT.length - 1)] ?? 0.4) * ctx;
  return { chance, bonus: Math.round(bonus * 10) / 10, penalty: def.penalty };
}

/** Olay bu türdeki grup için planlanabilir mi? */
export const stageEventAllowed = (def: StageEventDef, genre: Genre) => !def.genres || def.genres.includes(genre);
export const STAGE_EVENT_BY_ID: Record<string, StageEventDef> = Object.fromEntries(STAGE_EVENTS.map((e) => [e.id, e]));
/** Bir konserde planlanabilecek en fazla sahne olayı */
export const MAX_STAGE_EVENTS = 3;

/** Başarı şansı: eşiğin üstündeki her beceri puanı şansı artırır */
export const stageEventChance = (level: number, min: number) => clamp(0.45 + (level - min) * 0.02, 0.15, 0.95);

export type StageEventOutcome = 'success' | 'fail' | 'skipped';

// ---------- Bis ----------

export const ENCORE_PLANS = ['none', 'safe', 'bold'] as const;
export type EncorePlan = (typeof ENCORE_PLANS)[number];
export type EncoreOutcome = 'none' | 'skipped' | 'success' | 'flop';
/** Seyirci bu kalitenin altında bis istemez */
export const ENCORE_MIN_QUALITY = 40;
/**
 * Cesur bis kumardır: başarısızlığı −3 → −6 kalite, şöhret ×0,95 → ×0,9; başarı şöhreti ×1,15 → ×1,12; tutma şansı
 * daha çok enerjiye bağlı (boldEncoreChance). Eskiden kulüp ve üstünde her durumda güvenli bisten iyiydi.
 */
export const ENCORE_RULES = {
  safe: { energy: 5, quality: 1, fameMult: 1.05 },
  bold: { energy: 12, quality: 3, fameMult: 1.12, failQuality: -6, failFameMult: 0.9 },
  /** İstenmeyen bise çıkmak */
  unwanted: { quality: -4, fameMult: 0.9 },
} as const;

/** Cesur bisin tutma şansı: grubun enerjisine ve gecenin kalitesine bağlı */
export const boldEncoreChance = (quality: number, avgEnergy: number) =>
  clamp(0.2 + (clamp(avgEnergy, 0, 100) / 100) * 0.6 + (quality - ENCORE_MIN_QUALITY) / 300, 0.1, 0.85);

export interface EncoreResult {
  outcome: EncoreOutcome;
  qualityDelta: number;
  fameMult: number;
  /** Sahnedeki her üyeden ek enerji */
  energy: number;
}

export function encoreOutcome(plan: EncorePlan | undefined, quality: number, avgEnergy: number, rand: () => number): EncoreResult {
  if (!plan || plan === 'none') return { outcome: 'none', qualityDelta: 0, fameMult: 1, energy: 0 };
  const wanted = quality >= ENCORE_MIN_QUALITY;
  if (plan === 'safe') {
    // Güvenli bis salonu okur: istenmiyorsa çıkılmaz
    if (!wanted) return { outcome: 'skipped', qualityDelta: 0, fameMult: 1, energy: 0 };
    const r = ENCORE_RULES.safe;
    return { outcome: 'success', qualityDelta: r.quality, fameMult: r.fameMult, energy: r.energy };
  }
  const r = ENCORE_RULES.bold;
  if (!wanted) return { outcome: 'flop', qualityDelta: ENCORE_RULES.unwanted.quality, fameMult: ENCORE_RULES.unwanted.fameMult, energy: r.energy };
  if (rand() < boldEncoreChance(quality, avgEnergy)) return { outcome: 'success', qualityDelta: r.quality, fameMult: r.fameMult, energy: r.energy };
  return { outcome: 'flop', qualityDelta: r.failQuality, fameMult: r.failFameMult, energy: r.energy };
}

export interface GigPlan {
  events?: string[];
  encore?: EncorePlan;
}
