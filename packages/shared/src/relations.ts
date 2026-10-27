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

// ---------- Tek gecelik macera ----------
// Karşılıklı onayla, genel izleyici seviyesinde ve imalı anlatılan kısa bir macera. Para, beceri ya da eşya kazandırmaz;
// iki tarafa kısa bir moodlet ve biraz ilham verir. Bedelleri: pişmanlık olasılığı, şöhretliyse dedikodu (skandal),
// sevgilisi ya da eşi olan için aldatmanın ortaya çıkma olasılığı. Arkadaşlık ve romantizm yerine geçmez.

/** Her iki taraf da en az bu yaşta olmalı (oyun karakterleri 18'de başlar; kural sunucuda ayrıca denetlenir) */
export const ADULT_AGE = 18;
/** Teklifin geçerlilik süresi (oyun saati) */
export const FLING_OFFER_HOURS = 2;
/** Aynı ikili arasında bekleme (oyun günü) */
export const FLING_PAIR_COOLDOWN_DAYS = 7;
/** Bir karakter bir oyun gününde en fazla bu kadar */
export const FLING_DAILY_CAP = 1;
/** İki taraftan da harcanan enerji */
export const FLING_ENERGY = 15;
/** Kabul edilen mekân türleri: bar, kulüp, otel (iki taraf da aynı mekânda olmalı) */
export const FLING_PLACES = ['bar', 'club', 'hotel'] as const;
/** İki tarafa: ilham ve çok küçük arkadaşlık (romantizm yok) */
export const FLING_INSPIRATION = 5;
export const FLING_FRIENDSHIP = 0.5;
/** Pişmanlık olasılığı: tek başına %25, sevgilisi ya da eşi varsa kesin */
export const FLING_REGRET_CHANCE = 0.25;
/** Taraflardan biri o şehirde en az "yerel yıldız" ise dedikodu (skandal) olasılığı */
export const FLING_GOSSIP_FAME = 30;
export const FLING_GOSSIP_CHANCE = 0.3;
/** Aldatmanın ortaya çıkma olasılığı: taban, dedikodu olduysa ve partner aynı şehirdeyse eklenir */
export const CHEAT_DISCOVERY = { base: 0.35, gossip: 0.3, sameCity: 0.2 } as const;
/** Ortaya çıkan aldatmanın ilişkiye etkisi; sevgililikte romantizm bunun altına düşerse ilişki biter */
export const CHEAT_ROMANCE_LOSS = 25;
export const CHEAT_FRIENDSHIP_LOSS = 10;
export const CHEAT_BREAKUP_BELOW = 30;
/** "Çapkın" ünvanı için tek gecelik macera sayısı */
export const HEARTBREAKER_FLINGS = 3;

export const cheatDiscoveryChance = (gossip: boolean, partnerInCity: boolean) =>
  Math.min(0.9, CHEAT_DISCOVERY.base + (gossip ? CHEAT_DISCOVERY.gossip : 0) + (partnerInCity ? CHEAT_DISCOVERY.sameCity : 0));

// ---------- Aile ve çocuklar ----------

/** Çocuklar oyun takvimiyle büyür (oyun yılı 56 gün; bkz. consequences.ts GAME_YEAR_DAYS) */
export type ChildStage = 'baby' | 'child' | 'teen' | 'adult';
export const childAge = (bornAt: Date | string, gameSpeed: number, nowMs = Date.now()) =>
  Math.max(0, ((nowMs - new Date(bornAt).getTime()) * gameSpeed) / 86_400_000 / 56);
export const childStage = (age: number): ChildStage => (age < 3 ? 'baby' : age < 13 ? 'child' : age < 18 ? 'teen' : 'adult');
/** Haftalık bakım gideri (çocuk başına, şehir çarpanıyla); her ebeveyn yarısını öder. Yetişkin çocuk için gider yok. */
export const CHILD_WEEKLY_UPKEEP = 40;
