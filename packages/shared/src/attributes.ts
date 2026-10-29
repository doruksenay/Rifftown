// Karakter nitelikleri ve XP (deneyim puanı) harcama sistemi.
//
// Beceriler "ne bildiğin"dir; nitelikler "kim olduğun". Altı nitelik var, her biri 0–100.
// Karakter açarken her nitelik 10'dan başlar, ana enstrüman bir niteliğe +10 verir ve oyuncu
// 20 başlangıç puanını dağıtır (bir niteliğe en fazla 10). Sonra oynayarak XP kazanılır ve
// niteliklere harcanır. Para ile XP alınamaz, XP başka karaktere geçmez.
//
// Gerçek seçim: niteliklerin toplamı en fazla ATTR_TOTAL_CAP olabilir (6 × 100 = 600'ün çok altında),
// yani herkes ancak üç niteliği tavana çıkarabilir ya da hepsini orta seviyede tutar. Bir puanın
// bedeli seviye yükseldikçe artar: geniş-sığ dağılım ucuzdur, dar-derin dağılım pahalı ama seçtiği
// alanlarda iki kat güçlüdür. Harcanan puan geri alınmaz.
//
// Etkiler küçük, doğrusal ve tavanlıdır (nitelik 100'de tavana varır). Çekirdek becerilerin
// (beste, söz, rol becerisi) etkisinin yanında ufak kalırlar: bkz. GAME_DESIGN.md "Karakter".
// Sunucu hesapları veritabanındaki ham sayıyı kullanır; oyuncuya kelime ölçeği (tiers.ts 'attribute') gider.

import type { ActionKind } from './rules';
import type { Instrument, L } from './world';
import { indexBy } from './lookup';

export const ATTRIBUTES = ['charm', 'voice', 'creativity', 'intellect', 'constitution', 'dexterity'] as const;
export type AttributeId = (typeof ATTRIBUTES)[number];
export type Attributes = Record<AttributeId, number>;

export const isAttribute = (s: unknown): s is AttributeId => typeof s === 'string' && (ATTRIBUTES as readonly string[]).includes(s);

/** Bir niteliğin alabileceği en yüksek değer */
export const ATTR_MAX = 100;
/** Her niteliğin başlangıç değeri */
export const ATTR_BASE = 10;
/** Ana enstrümanın verdiği başlangıç payı (vokal → ses, diğer roller → el becerisi) */
export const ATTR_MAIN_BONUS = 10;
/** Karakter açarken dağıtılan başlangıç puanı ve bir niteliğe verilebilecek en fazla kısmı */
export const ATTR_START_POINTS = 20;
export const ATTR_START_MAX_PER = 10;
/** Niteliklerin toplamı en fazla bu kadar olabilir: üç nitelik tavanda ya da altısı ~55'te */
export const ATTR_TOTAL_CAP = 330;
/** Bir harcama isteğinde en fazla bu kadar puan */
export const ATTR_MAX_SPEND = 10;

export interface AttributeDef {
  id: AttributeId;
  name: L;
  /** Ne işe yaradığı (nitelik 100'deki etkiyle) */
  about: L;
}

export const ATTRIBUTE_DEFS: AttributeDef[] = [
  {
    id: 'charm',
    name: { tr: 'Çekicilik', en: 'Charm' },
    about: {
      tr: 'İnsanları kendine çekmek. Takılma, flört ve randevuda arkadaşlık ve romantizm en fazla %15 daha hızlı gelişir; basın toplantısı ve röportajın tutma şansı en fazla 5 puan artar.',
      en: 'Drawing people in. Friendship and romance grow up to 15% faster when hanging out, flirting and on dates; press conferences and interviews land up to 5 points more often.',
    },
  },
  {
    id: 'voice',
    name: { tr: 'Ses', en: 'Voice' },
    about: {
      tr: 'Doğuştan gelen ses rengi ve gücü. Vokal rolünde (konser ve sokak müziği) rol becerine en fazla +4.',
      en: 'Natural vocal tone and power. Up to +4 to your role skill in the vocals role (gigs and busking).',
    },
  },
  {
    id: 'creativity',
    name: { tr: 'Yaratıcılık', en: 'Creativity' },
    about: {
      tr: 'Fikir üretmek. Şarkı yazma puanına en fazla +4; eylemlerden kazandığın ilham en fazla %10 artar.',
      en: 'Coming up with ideas. Up to +4 to your songwriting score; up to 10% more inspiration from what you do.',
    },
  },
  {
    id: 'intellect',
    name: { tr: 'Zekâ', en: 'Intellect' },
    about: {
      tr: 'Çabuk kavramak. Kendi kendine çalışmada, okulda ve özel derste beceriler en fazla %12 daha hızlı gelişir.',
      en: 'Picking things up quickly. Skills improve up to 12% faster from practice, school and private lessons.',
    },
  },
  {
    id: 'constitution',
    name: { tr: 'Bünye', en: 'Constitution' },
    about: {
      tr: 'Dayanıklılık. Yorucu işlerde kaybedilen sağlık en fazla %15 azalır; dinlenme ve tedavide sağlık en fazla %15 daha hızlı toparlanır.',
      en: 'Toughness. Up to 15% less health lost to tiring work; health recovers up to 15% faster when resting or in hospital.',
    },
  },
  {
    id: 'dexterity',
    name: { tr: 'El becerisi', en: 'Dexterity' },
    about: {
      tr: 'Parmakların ve ellerin ustalığı. Vokal dışındaki rollerde (konser ve sokak müziği) rol becerine en fazla +4; atölyede el işçiliğine en fazla +6.',
      en: 'Nimble hands. Up to +4 to your role skill in every role except vocals (gigs and busking); up to +6 to craftsmanship in the workshop.',
    },
  },
];
export const ATTRIBUTE_BY_ID: Record<AttributeId, AttributeDef> = indexBy(ATTRIBUTE_DEFS, (d) => d.id) as Record<AttributeId, AttributeDef>;

/**
 * Etkilerin nitelik 100'deki büyüklüğü. Hepsi doğrusaldır: etki = nitelik ÷ 100 × değer.
 * Çarpanlar (social, learning, inspiration, recovery) 1'e eklenir; healthShield sağlık kaybından düşülen paydır;
 * role ve crafting puana eklenir.
 */
export const ATTR_EFFECTS = {
  charm: { social: 0.15, press: 0.05 },
  voice: { vocalRole: 4 },
  creativity: { songwriting: 4, inspiration: 0.1 },
  intellect: { learning: 0.12 },
  constitution: { healthShield: 0.15, recovery: 0.15 },
  dexterity: { instrumentRole: 4, crafting: 6 },
} as const satisfies Record<AttributeId, Record<string, number>>;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Niteliğin 0–1 arası payı. Eksik nitelik 0 sayılır (oyunun kendi müzisyenleri ve kiralık müzisyenler) */
export const attrShare = (a: Partial<Attributes> | null | undefined, id: AttributeId) => clamp(Number(a?.[id] ?? 0) || 0, 0, ATTR_MAX) / ATTR_MAX;

/** Takılma, flört ve randevu kazancının çarpanı (en fazla ×1,15) */
export const socialAttrMult = (a: Partial<Attributes> | null | undefined) => 1 + ATTR_EFFECTS.charm.social * attrShare(a, 'charm');
/** Basın etkinliğinin başarı şansına eklenen pay (en fazla +0,05; şansın %15–%95 sınırı aynı kalır) */
export const pressAttrBonus = (a: Partial<Attributes> | null | undefined) => ATTR_EFFECTS.charm.press * attrShare(a, 'charm');
/** Rol becerisine eklenen puan: vokalde ses, diğer rollerde el becerisi (en fazla +4) */
export const roleAttrBonus = (a: Partial<Attributes> | null | undefined, role: Instrument) =>
  role === 'vocals' ? ATTR_EFFECTS.voice.vocalRole * attrShare(a, 'voice') : ATTR_EFFECTS.dexterity.instrumentRole * attrShare(a, 'dexterity');
/** Şarkı yazma puanına eklenen (en fazla +4) */
export const songwritingAttrBonus = (a: Partial<Attributes> | null | undefined) => ATTR_EFFECTS.creativity.songwriting * attrShare(a, 'creativity');
/** Eylemlerden kazanılan ilhamın çarpanı (en fazla ×1,1) */
export const inspirationAttrMult = (a: Partial<Attributes> | null | undefined) => 1 + ATTR_EFFECTS.creativity.inspiration * attrShare(a, 'creativity');
/** Çalışma ve ders kazancının çarpanı (en fazla ×1,12) */
export const learningAttrMult = (a: Partial<Attributes> | null | undefined) => 1 + ATTR_EFFECTS.intellect.learning * attrShare(a, 'intellect');
/** Yorucu işlerde sağlık kaybından düşülen pay (en fazla %15; kondisyonla birlikte çarpılarak uygulanır) */
export const healthShieldAttr = (a: Partial<Attributes> | null | undefined) => ATTR_EFFECTS.constitution.healthShield * attrShare(a, 'constitution');
/** Dinlenme ve tedavide sağlık kazancının çarpanı (en fazla ×1,15) */
export const recoveryAttrMult = (a: Partial<Attributes> | null | undefined) => 1 + ATTR_EFFECTS.constitution.recovery * attrShare(a, 'constitution');
/** Atölyede el işçiliğine eklenen (en fazla +6; toplam 100'ü geçmez) */
export const craftAttrBonus = (a: Partial<Attributes> | null | undefined) => ATTR_EFFECTS.dexterity.crafting * attrShare(a, 'dexterity');

// ---------- Başlangıç ----------

/** Ana enstrümanın payını alan nitelik */
export const mainAttributeFor = (main: Instrument): AttributeId => (main === 'vocals' ? 'voice' : 'dexterity');

/** Oyuncu dağıtmazsa başlangıç puanlarının role göre varsayılan dağılımı */
export function defaultStartAllocation(main: Instrument): Partial<Attributes> {
  if (main === 'vocals') return { charm: 10, creativity: 10 };
  if (main === 'drums' || main === 'percussion') return { constitution: 10, charm: 10 };
  return { creativity: 10, intellect: 10 };
}

/** Başlangıç dağılımı geçersizse hata kodu: geçersiz nitelik, tam sayı değil, nitelik başına 10'u ya da toplam 20'yi aşıyor */
export function startAllocationError(alloc: Record<string, unknown>): 'invalid_attribute' | 'invalid_start_points' | null {
  let sum = 0;
  for (const [k, v] of Object.entries(alloc)) {
    if (!isAttribute(k)) return 'invalid_attribute';
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > ATTR_START_MAX_PER) return 'invalid_start_points';
    sum += v;
  }
  return sum === ATTR_START_POINTS ? null : 'invalid_start_points';
}

/** Yeni karakterin nitelikleri: 10 taban + ana enstrüman payı + başlangıç puanları (toplam 90) */
export function startingAttributes(main: Instrument, alloc?: Partial<Attributes>): Attributes {
  const a = Object.fromEntries(ATTRIBUTES.map((id) => [id, ATTR_BASE])) as Attributes;
  a[mainAttributeFor(main)] += ATTR_MAIN_BONUS;
  for (const [k, v] of Object.entries(alloc ?? defaultStartAllocation(main))) if (isAttribute(k)) a[k] += v ?? 0;
  return a;
}

/** Saklanan değeri eksiksiz bir nitelik nesnesine çevirir (eksik olan 0) */
export const normalizeAttributes = (a: Partial<Record<string, number>> | null | undefined): Attributes =>
  Object.fromEntries(ATTRIBUTES.map((id) => [id, clamp(Number(a?.[id] ?? 0) || 0, 0, ATTR_MAX)])) as Attributes;

export const attributeTotal = (a: Partial<Attributes> | null | undefined) => ATTRIBUTES.reduce((s, id) => s + clamp(Number(a?.[id] ?? 0) || 0, 0, ATTR_MAX), 0);
/** Toplam tavana kalan puan */
export const attributeRoom = (a: Partial<Attributes> | null | undefined) => Math.max(0, ATTR_TOTAL_CAP - attributeTotal(a));

// ---------- XP harcama ----------

/** Bir puanın XP bedeli: 0–24 arası 1, 25–49 arası 2, 50–74 arası 3, 75–99 arası 4.
 *  Basamaklar kelime ölçeğinin (tiers.ts 'attribute') sınırlarına denk gelir: bulanık değer de doğru bedeli gösterir. */
export const attrPointCost = (level: number) => 1 + Math.floor(clamp(level, 0, ATTR_MAX - 1) / 25);

/** level'dan points kadar yükseltmenin toplam bedeli */
export function attrSpendCost(level: number, points: number): number {
  let cost = 0;
  for (let i = 0; i < points; i++) cost += attrPointCost(Math.floor(level) + i);
  return cost;
}

export type AttributeSpendError = 'invalid_attribute' | 'invalid_points' | 'attribute_max' | 'attribute_room' | 'not_enough_xp';

/** Harcama yapılabilir mi? Yapılamıyorsa hata kodu döner. */
export function attributeSpendBlocker(a: Partial<Attributes>, xp: number, id: string, points: number): AttributeSpendError | null {
  if (!isAttribute(id)) return 'invalid_attribute';
  if (!Number.isInteger(points) || points < 1 || points > ATTR_MAX_SPEND) return 'invalid_points';
  const cur = Number(a[id] ?? 0);
  if (cur + points > ATTR_MAX) return 'attribute_max';
  if (points > attributeRoom(a)) return 'attribute_room';
  if (xp + 1e-9 < attrSpendCost(cur, points)) return 'not_enough_xp';
  return null;
}

// ---------- XP kazanma ----------

/** Eylemlerin oyun saati başına XP'si. Dinlenme, tedavi, yolculuk ve suç XP vermez. */
export const XP_PER_HOUR: Partial<Record<ActionKind, number>> = {
  study: 1,
  lesson: 1,
  work: 1,
  write_song: 1,
  rehearse: 1,
  record: 1,
  busk: 1,
  workout: 1,
  craft: 1,
  press: 1,
  write_article: 1,
  video: 1,
  investigate: 1,
};
/** Sahneye çıkılan konser başına XP; kalitesi bu eşiğin (harika) üstündeyse +1 */
export const GIG_XP = 3;
export const GIG_XP_GREAT_QUALITY = 60;
export const GIG_XP_GREAT_BONUS = 1;
/** XP tavanları: son 24 oyun saatinde 10, son 7 oyun gününde 50. Yeni hesaplarda (ilk 72 oyun saati) yarısı. */
export const XP_DAY_CAP = 10;
export const XP_WEEK_CAP = 50;
export const XP_NEW_ACCOUNT_FACTOR = 0.5;

/** Bir eylemin ham XP'si (yarıda kesilen eylemde geçen saat kadar) */
export const actionXp = (kind: ActionKind, hours: number) => Math.max(0, (XP_PER_HOUR[kind] ?? 0) * Math.max(0, hours));
/** Konserin XP'si */
export const gigXp = (quality: number) => GIG_XP + (quality >= GIG_XP_GREAT_QUALITY ? GIG_XP_GREAT_BONUS : 0);

export const xpCaps = (newAccount: boolean) => ({
  day: XP_DAY_CAP * (newAccount ? XP_NEW_ACCOUNT_FACTOR : 1),
  week: XP_WEEK_CAP * (newAccount ? XP_NEW_ACCOUNT_FACTOR : 1),
});

/** Tavanlara göre verilebilecek XP (günlük ve haftalık pencerede kazanılmış olana göre) */
export function xpAllowance(amount: number, earnedDay: number, earnedWeek: number, newAccount = false): number {
  const caps = xpCaps(newAccount);
  return Math.max(0, Math.min(Math.max(0, amount), caps.day - earnedDay, caps.week - earnedWeek));
}
