// Sayısal değerleri oyuncuya kelimeyle gösteren ölçekler.
// Sunucu her şeyi sayıyla hesaplar; bu dosya sadece gösterim içindir.
// En üst kalite seviyesi büyük harfle (DESTANSI / EPIC), diğerleri küçük harfle yazılır.

import { REVIEW_CITY, REVIEW_CROWD, REVIEW_EVENT, REVIEW_EVENT_GENERIC, REVIEW_LEGENDARY, REVIEW_PRESS, REVIEW_RIVAL, REVIEW_TIERS } from './content/texts';
import type { L, Lang } from './world';

export interface Tier {
  /** Bu seviyenin başladığı değer (dahil) */
  min: number;
  name: L;
}

export type ScaleName = 'quality' | 'skill' | 'familiarity' | 'fame' | 'mood' | 'health' | 'friendship' | 'romance' | 'energy' | 'inspiration' | 'press';

const t = (min: number, tr: string, en: string): Tier => ({ min, name: { tr, en } });

export const SCALES: Record<ScaleName, Tier[]> = {
  /** Şarkı ve konser kalitesi */
  quality: [
    t(0, 'berbat', 'dreadful'),
    t(10, 'zayıf', 'poor'),
    t(20, 'vasat', 'mediocre'),
    t(30, 'fena değil', 'decent'),
    t(40, 'iyi', 'good'),
    t(50, 'çok iyi', 'very good'),
    t(60, 'harika', 'great'),
    t(70, 'muhteşem', 'superb'),
    t(80, 'olağanüstü', 'outstanding'),
    t(90, 'DESTANSI', 'EPIC'),
  ],
  /** Beceriler (vokal, gitar, söz yazarlığı…) */
  skill: [
    t(0, 'hiç bilmiyor', 'clueless'),
    t(5, 'acemi', 'novice'),
    t(15, 'çırak', 'apprentice'),
    t(30, 'amatör', 'amateur'),
    t(45, 'yetenekli', 'skilled'),
    t(60, 'usta', 'master'),
    t(75, 'virtüöz', 'virtuoso'),
    t(90, 'efsane', 'legend'),
  ],
  /** Bir şarkıya aşinalık */
  familiarity: [
    t(0, 'sözlerini bilmiyor', "doesn't know it"),
    t(20, 'kabaca biliyor', 'roughly knows it'),
    t(45, 'rahat çalıyor', 'plays it comfortably'),
    t(70, 'ezbere biliyor', 'knows it by heart'),
    t(90, 'uykusunda çalar', 'could play it asleep'),
  ],
  /** Bir şehirdeki şöhret. Eşikler mekân şartlarıyla örtüşür: kulüp 15, salon 45. */
  fame: [
    t(0, 'kimse tanımıyor', 'unknown'),
    t(5, 'mahallede bilinir', 'known in the neighbourhood'),
    t(15, 'şehirde konuşuluyor', 'talk of the town'),
    t(30, 'yerel yıldız', 'local star'),
    t(45, 'şehrin gözdesi', 'city favourite'),
    t(75, 'süperstar', 'superstar'),
  ],
  /** Ruh hâli. 25'in altı sağlığı yıpratır. */
  mood: [
    t(0, 'bunalımda', 'miserable'),
    t(25, 'keyifsiz', 'gloomy'),
    t(45, 'normal', 'fine'),
    t(70, 'neşeli', 'cheerful'),
    t(90, 'coşkulu', 'elated'),
  ],
  /** Sağlık. 15'in altında çalışılamaz. */
  health: [
    t(0, 'yatağa düşmüş', 'bedridden'),
    t(15, 'hasta', 'ill'),
    t(40, 'yorgun', 'worn out'),
    t(70, 'iyi', 'healthy'),
    t(90, 'zinde', 'in top shape'),
  ],
  /** Enerji. 20'nin altında bitkin (ruh hâli düşer), işler zor başlar. */
  energy: [
    t(0, 'bitkin', 'exhausted'),
    t(20, 'yorgun', 'tired'),
    t(40, 'idare eder', 'okay'),
    t(65, 'dinç', 'fresh'),
    t(90, 'enerji dolu', 'full of energy'),
  ],
  /** İlham. Şarkı yazarken harcanır; yüksekken konser EFSANEVİ olabilir. */
  inspiration: [
    t(0, 'ilhamsız', 'uninspired'),
    t(20, 'bir kıvılcım var', 'a spark'),
    t(45, 'ilhamlı', 'inspired'),
    t(70, 'coşkun', 'brimming'),
    t(90, 'ilham perisi yanında', 'touched by the muse'),
  ],
  /** Bir grubun bir şehirdeki basın desteği. Nötr 20. */
  press: [
    t(0, 'basın düşman', 'hostile press'),
    t(10, 'basın soğuk', 'cold press'),
    t(20, 'basın nötr', 'neutral press'),
    t(40, 'basın ilgili', 'press interested'),
    t(60, 'basın sıcak', 'warm press'),
    t(80, 'basının gözdesi', 'press darling'),
  ],
  /** İki oyuncu arasındaki arkadaşlık. Flört 30'da açılır. */
  friendship: [
    t(0, 'yabancı', 'stranger'),
    t(10, 'tanıdık', 'acquaintance'),
    t(30, 'arkadaş', 'friend'),
    t(55, 'yakın arkadaş', 'close friend'),
    t(80, 'can dostu', 'best friend'),
  ],
  /** Romantizm. Randevu 20, sevgililik 40, evlilik teklifi 70. */
  romance: [
    t(0, 'kıvılcım yok', 'no spark'),
    t(10, 'hoşlanıyor', 'a little crush'),
    t(20, 'ilgileniyor', 'interested'),
    t(40, 'âşık', 'in love'),
    t(70, 'sırılsıklam âşık', 'head over heels'),
    t(90, 'ruh eşi', 'soulmates'),
  ],
};

export interface TierInfo {
  index: number;
  count: number;
  name: L;
  /** Bu seviyenin içindeki ilerleme (0–1) */
  progress: number;
  isTop: boolean;
}

export function tierOf(scale: ScaleName, value: number): TierInfo {
  const tiers = SCALES[scale];
  const v = Math.max(0, Math.min(100, value));
  let i = 0;
  while (i + 1 < tiers.length && v >= tiers[i + 1].min) i++;
  const lo = tiers[i].min;
  const hi = i + 1 < tiers.length ? tiers[i + 1].min : 100;
  return {
    index: i,
    count: tiers.length,
    name: tiers[i].name,
    progress: hi > lo ? Math.min(1, (v - lo) / (hi - lo)) : 1,
    isTop: i === tiers.length - 1,
  };
}

export const tierName = (scale: ScaleName, value: number, lang: Lang) => tierOf(scale, value).name[lang];

/** İki değer arasında seviye atlandı mı? (yükselme için pozitif) */
export const tierChange = (scale: ScaleName, before: number, after: number) =>
  tierOf(scale, after).index - tierOf(scale, before).index;

// ---------- Konser eleştirileri ----------
// Sunucu konser bittiğinde bir kez üretir ve sonuçla birlikte saklar.
// Metin o konseri bilir: mekân, şehir, gerçek seyirci sayısı, gecenin en iyi şarkısı, sahne olayları,
// basın desteği ve aynı şehirde son günlerde çalan rakip grup. Metin havuzları content/texts.ts içinde.
// Türkçe cümlelerde özel adlara ek getirmiyoruz (ünlü uyumu hatası olmasın diye).

type ReviewVars = { n: number; venue: string; city: string; song: string; rival?: string; event?: string };

const fill = (s: string, v: ReviewVars) =>
  s
    .replace(/\{n\}/g, String(v.n))
    .replace(/\{venue\}/g, v.venue)
    .replace(/\{city\}/g, v.city)
    .replace(/\{song\}/g, v.song)
    .replace(/\{rival\}/g, v.rival ?? '')
    .replace(/\{event\}/g, v.event ?? '');

export interface GigReviewInput {
  quality: number;
  attendance: number;
  capacity: number;
  presentCount: number;
  memberCount: number;
  venue: L;
  city: L;
  /** Gecenin en iyi şarkısının adı */
  bestSong: string;
  seed: number;
  /** EFSANEVİ gece */
  legendary?: boolean;
  /** Şehrin kimliği (şehre özgü renk cümlesi için) */
  cityId?: string;
  /** Sahne olaylarının sonucu ve olayların adları */
  events?: { id: string; outcome: string; name?: L }[];
  /** Grubun o şehirdeki basın desteği (0–100) */
  press?: number;
  /** Son günlerde aynı şehirde çalan başka bir grup ve gecesinin kalitesi */
  rival?: { name: string; quality: number } | null;
}

/** Tohumdan deterministik seçim (aynı konser hep aynı metni üretir) */
const pickBy = <T>(xs: T[], seed: number, salt: number) => xs[Math.abs(Math.imul(seed + 1, 2654435761) ^ (salt * 40503)) % xs.length];

/** Konser eleştirisi; iki dilde birden üretilir ve konserle birlikte saklanır. */
export function gigReview(r: GigReviewInput): L {
  // En çok bir olay cümlesi: varsa başarısız olan (eleştirmen hatayı yazar), yoksa başarılı olan
  const tried = (r.events ?? []).filter((e) => e.outcome === 'success' || e.outcome === 'fail');
  const ev = tried.find((e) => e.outcome === 'fail') ?? tried.find((e) => e.outcome === 'success');
  const make = (lang: Lang) => {
    const v: ReviewVars = { n: r.attendance, venue: r.venue[lang], city: r.city[lang], song: r.bestSong, rival: r.rival?.name, event: ev?.name?.[lang] ?? ev?.id };
    if (r.presentCount === 0) {
      return lang === 'en'
        ? `The band never showed up at ${v.venue}. The audience went home angry.`
        : 'Grup sahneye hiç çıkmadı. Seyirci öfkeyle evine döndü.';
    }
    let tier = REVIEW_TIERS[0];
    for (const b of REVIEW_TIERS) if (r.quality >= b.minQuality) tier = b;
    const main = r.legendary ? pickBy(REVIEW_LEGENDARY, r.seed, 1) : pickBy(tier.lines, r.seed, 1);
    const ratio = r.capacity > 0 ? r.attendance / r.capacity : 0;
    const crowd = pickBy(REVIEW_CROWD[ratio >= 0.85 ? 'packed' : ratio >= 0.4 ? 'half' : 'empty'], r.seed, 2);
    const parts = [fill(crowd[lang], v), fill(main[lang], v)];
    // Bağlam cümleleri: olay, rakip, basın, şehir (en fazla ikisi, metin uzamasın)
    const extra: L[] = [];
    if (ev) {
      const own = REVIEW_EVENT[ev.id];
      extra.push(own ? own[ev.outcome as 'success' | 'fail'] : pickBy(REVIEW_EVENT_GENERIC[ev.outcome as 'success' | 'fail'], r.seed, 3));
    }
    if (r.rival && Math.abs(r.quality - r.rival.quality) >= 8) extra.push(pickBy(REVIEW_RIVAL[r.quality > r.rival.quality ? 'beat' : 'lost'], r.seed, 4));
    if (typeof r.press === 'number' && (r.press >= 60 || r.press <= 10)) extra.push(pickBy(REVIEW_PRESS[r.press >= 60 ? 'hot' : 'cold'], r.seed, 5));
    const cityLines = r.cityId ? REVIEW_CITY[r.cityId] : undefined;
    if (cityLines && r.quality >= 40 && Math.abs(r.seed) % 3 === 0) extra.push(pickBy(cityLines, r.seed, 6));
    for (const x of extra.slice(0, 2)) parts.push(fill(x[lang], v));
    const missingCount = r.memberCount - r.presentCount;
    if (missingCount > 0) {
      parts.push(lang === 'en' ? `${missingCount} band member${missingCount > 1 ? 's' : ''} never made it to the stage.` : `${missingCount} üye sahneye çıkmadı.`);
    }
    return parts.join(' ');
  };
  return { tr: make('tr'), en: make('en') };
}

// ---------- VIP olmayanlar için bulanıklaştırma ----------

/** Seviye içindeki ilerlemenin kaç adımda gösterileceği */
export const BLUR_STEPS = 4;

/**
 * Değeri, bulunduğu seviyenin içinde kaba bir adıma yuvarlar (aşağı doğru).
 * Seviye adı değişmez, ilerleme çubuğu dörtte birlik adımlarla ilerler, kesin sayı okunamaz.
 * Oyundaki tüm eşikler seviye sınırlarına denk geldiği için bulanık değer de aynı kontrollerden geçer.
 */
export function blurValue(scale: ScaleName, value: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return value;
  const tiers = SCALES[scale];
  const v = Math.max(0, Math.min(100, value));
  let i = 0;
  while (i + 1 < tiers.length && v >= tiers[i + 1].min) i++;
  const lo = tiers[i].min;
  const hi = i + 1 < tiers.length ? tiers[i + 1].min : 100;
  if (hi <= lo) return lo;
  const step = Math.floor(((v - lo) / (hi - lo)) * BLUR_STEPS) / BLUR_STEPS;
  return Math.round((lo + step * (hi - lo)) * 10) / 10;
}
