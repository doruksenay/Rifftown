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
}

const S = (id: string, genre: Genre, tr: string, en: string, tempo: Tempo, minGenreSkill: number, bonus: number): SubgenreDef => ({
  id,
  genre,
  name: { tr, en },
  tempo,
  minGenreSkill,
  bonus,
});

/** Veri dosyası: yeni alt tür eklemek için buraya bir satır eklemek yeter (diğer içerik veri dosyaları packages/shared/src/content/ klasöründedir) */
export const SUBGENRES: SubgenreDef[] = [
  S('dance_pop', 'pop', 'Dans pop', 'Dance pop', 'fast', 15, 2),
  S('synth_pop', 'pop', 'Synth pop', 'Synth pop', 'mid', 30, 3),
  S('pop_ballad', 'pop', 'Pop balad', 'Pop ballad', 'slow', 15, 2),
  S('hard_rock', 'rock', 'Hard rock', 'Hard rock', 'fast', 15, 2),
  S('indie_rock', 'rock', 'Indie rock', 'Indie rock', 'mid', 15, 2),
  S('prog_rock', 'rock', 'Progresif rock', 'Progressive rock', 'mid', 45, 4),
  S('boom_bap', 'hiphop', 'Boom bap', 'Boom bap', 'mid', 15, 2),
  S('trap', 'hiphop', 'Trap', 'Trap', 'slow', 30, 3),
  S('house', 'electronic', 'House', 'House', 'mid', 15, 2),
  S('techno', 'electronic', 'Tekno', 'Techno', 'fast', 30, 3),
  S('ambient', 'electronic', 'Ambient', 'Ambient', 'slow', 30, 3),
  S('thrash', 'metal', 'Thrash metal', 'Thrash metal', 'fast', 30, 3),
  S('doom', 'metal', 'Doom metal', 'Doom metal', 'slow', 30, 3),
  S('bebop', 'jazz', 'Bebop', 'Bebop', 'fast', 45, 4),
  S('smooth_jazz', 'jazz', 'Smooth caz', 'Smooth jazz', 'slow', 15, 2),
  S('psych_anatolian', 'anatolian', 'Psikedelik Anadolu', 'Anatolian psych', 'mid', 30, 3),
  S('anatolian_folk_rock', 'anatolian', 'Halk rock', 'Folk rock', 'mid', 15, 2),
  S('delta_blues', 'blues', 'Delta blues', 'Delta blues', 'slow', 15, 2),
  S('electric_blues', 'blues', 'Elektrik blues', 'Electric blues', 'mid', 30, 3),
  S('indie_folk', 'folk', 'Indie folk', 'Indie folk', 'mid', 15, 2),
  S('folk_ballad', 'folk', 'Folk balad', 'Folk ballad', 'slow', 15, 2),
  S('hardcore_punk', 'punk', 'Hardcore punk', 'Hardcore punk', 'fast', 15, 2),
  S('pop_punk', 'punk', 'Pop punk', 'Pop punk', 'fast', 30, 3),
  S('neo_soul', 'soul', 'Neo soul', 'Neo soul', 'mid', 30, 3),
  S('motown', 'soul', 'Motown', 'Motown', 'mid', 15, 2),
  S('roots_reggae', 'reggae', 'Roots reggae', 'Roots reggae', 'slow', 15, 2),
  S('dub', 'reggae', 'Dub', 'Dub', 'slow', 30, 3),
  S('outlaw_country', 'country', 'Outlaw country', 'Outlaw country', 'mid', 15, 2),
  S('bluegrass', 'country', 'Bluegrass', 'Bluegrass', 'fast', 30, 3),
  S('chamber', 'classical', 'Oda müziği', 'Chamber music', 'slow', 30, 3),
  S('neo_classical', 'classical', 'Neo-klasik', 'Neo-classical', 'mid', 45, 4),
  S('drum_and_bass', 'electronic', 'Drum and bass', 'Drum and bass', 'fast', 30, 3),
  S('lofi_hiphop', 'hiphop', 'Lo-fi hip-hop', 'Lo-fi hip-hop', 'slow', 15, 2),
  S('black_metal', 'metal', 'Black metal', 'Black metal', 'fast', 45, 4),
  S('city_pop', 'pop', 'City pop', 'City pop', 'mid', 30, 3),
];
export const SUBGENRE_BY_ID: Record<string, SubgenreDef> = Object.fromEntries(SUBGENRES.map((s) => [s.id, s]));
export const subgenresOf = (genre: Genre) => SUBGENRES.filter((s) => s.genre === genre);

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
  let effect = (weighted - plain) * 2;
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
  /** Gereken beceri; 'role' ise sahnedekinin kendi rol becerisi (enstrüman bonusu dahil) */
  skill: string;
  min: number;
  /** Başarılı olursa kaliteye eklenen, başarısızsa düşülen puan */
  bonus: number;
  penalty: number;
  /** Aynı grup bu olayı tekrar ne zaman deneyebilir (oyun saati) */
  cooldownHours: number;
}

const E = (id: string, skill: string, min: number, bonus: number, penalty: number, cooldownHours: number, name: [string, string], about: [string, string]): StageEventDef => ({
  id,
  skill,
  min,
  bonus,
  penalty,
  cooldownHours,
  name: { tr: name[0], en: name[1] },
  about: { tr: about[0], en: about[1] },
});

export const STAGE_EVENTS: StageEventDef[] = [
  E('banter', 'showmanship', 15, 2, 1, 12, ['Seyirciyle sohbet', 'Crowd banter'], ['Şarkılar arasında seyirciyle şakalaşmak.', 'Joking with the crowd between songs.']),
  E('singalong', 'audience', 15, 4, 2, 24, ['Hep bir ağızdan', 'Sing-along'], ['Nakaratı seyirciye söyletmek.', 'Getting the crowd to sing the chorus.']),
  E('solo', 'role', 45, 5, 3, 24, ['Uzun solo', 'Extended solo'], ['Gecenin en iyi çalanı sahnenin önüne çıkar.', 'The best player steps to the front.']),
  E('dance', 'dancing', 30, 4, 3, 24, ['Dans koreografisi', 'Dance routine'], ['Prova edilmiş bir dans gösterisi.', 'A rehearsed dance routine.']),
  E('unplugged', 'improvisation', 15, 3, 2, 24, ['Akustik ara', 'Unplugged break'], ['Ortada sade, akustik bir bölüm.', 'A stripped-back acoustic moment mid-set.']),
  E('stage_dive', 'stagediving', 5, 6, 5, 48, ['Seyircinin üstüne atlamak', 'Stage dive'], ['Riskli ama unutulmaz.', 'Risky but unforgettable.']),
];
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
export const ENCORE_RULES = {
  safe: { energy: 5, quality: 1, fameMult: 1.05 },
  bold: { energy: 12, quality: 3, fameMult: 1.15, failQuality: -3, failFameMult: 0.95 },
  /** İstenmeyen bise çıkmak */
  unwanted: { quality: -4, fameMult: 0.9 },
} as const;

/** Cesur bisin tutma şansı: grubun enerjisine ve gecenin kalitesine bağlı */
export const boldEncoreChance = (quality: number, avgEnergy: number) =>
  clamp(0.3 + (clamp(avgEnergy, 0, 100) / 100) * 0.6 + (quality - ENCORE_MIN_QUALITY) / 200, 0.1, 0.9);

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
