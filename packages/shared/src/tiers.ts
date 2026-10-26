// Sayısal değerleri oyuncuya kelimeyle gösteren ölçekler.
// Sunucu her şeyi sayıyla hesaplar; bu dosya sadece gösterim içindir.
// En üst kalite seviyesi büyük harfle (DESTANSI / EPIC), diğerleri küçük harfle yazılır.

import type { L, Lang } from './world';

export interface Tier {
  /** Bu seviyenin başladığı değer (dahil) */
  min: number;
  name: L;
}

export type ScaleName = 'quality' | 'skill' | 'familiarity' | 'fame' | 'mood' | 'health' | 'friendship' | 'romance' | 'energy' | 'inspiration';

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
// Metin o konseri bilir: mekân, şehir, gerçek seyirci sayısı ve gecenin en iyi şarkısı.
// Türkçe cümlelerde özel adlara ek getirmiyoruz (ünlü uyumu hatası olmasın diye).

type ReviewVars = { n: number; venue: string; city: string; song: string };

const REVIEWS: { minQuality: number; lines: L[] }[] = [
  {
    minQuality: 0,
    lines: [
      { tr: '{n} seyircinin çoğu şarkılar arasında saatine baktı.', en: 'Most of the {n} people kept checking the time between songs.' },
      { tr: 'Yerel bir blog, setin ortasında dağıldığınızı yazdı.', en: 'A local blog wrote that the band fell apart halfway through the set.' },
    ],
  },
  {
    minQuality: 20,
    lines: [
      { tr: '{n} seyirci kibarca alkışladı ve barın yolunu tuttu.', en: 'The {n} people clapped politely and headed for the bar.' },
      { tr: '"{song}" sırasında birkaç kişi ritim tuttu; gerisi çabuk unutuldu.', en: 'A few people tapped along to "{song}"; the rest was soon forgotten.' },
    ],
  },
  {
    minQuality: 40,
    lines: [
      { tr: '{n} seyirciden birkaçı çıkışta grubun adını sordu.', en: 'A few of the {n} people asked the band\'s name on the way out.' },
      { tr: '"{song}" çalarken herkes ayaktaydı.', en: 'Everyone was on their feet during "{song}".' },
    ],
  },
  {
    minQuality: 60,
    lines: [
      { tr: '{n} seyirci bis istedi; {venue} yerinden oynadı.', en: '{n} people demanded an encore and {venue} shook.' },
      { tr: 'Gece bittiğinde herkes "{song}" şarkısını mırıldanıyordu.', en: 'By the end of the night, everyone was humming "{song}".' },
    ],
  },
  {
    minQuality: 80,
    lines: [
      { tr: 'Yerel basın bu {venue} konserinden haftalarca bahsedecek.', en: 'The local press will talk about this {venue} show for weeks.' },
      { tr: '"{song}", {n} kişinin hep bir ağızdan söylediği bir marşa dönüştü.', en: '"{song}" became an anthem sung by all {n} people.' },
    ],
  },
  {
    minQuality: 90,
    lines: [
      { tr: '{n} seyirci bu geceyi torunlarına anlatacak.', en: 'The {n} people there will tell their grandchildren about this night.' },
      { tr: '{city} böyle bir konseri yıllardır görmedi.', en: '{city} has not seen a show like this in years.' },
    ],
  },
];

/** EFSANEVİ geceler için (çok nadir) */
const LEGENDARY_REVIEWS = {
  minQuality: 100,
  lines: [
    {
      tr: 'EFSANEVİ bir gece. {n} kişi aynı anda sustu, sonra {song} ile birlikte bütün {city} şarkı söyledi.',
      en: 'A LEGENDARY night. {n} people fell silent at once, then all of {city} sang along to {song}.',
    },
    {
      tr: 'Bu EFSANEVİ konserin kaydı yıllarca elden ele dolaşacak. {song} sırasında sahnede bir şey oldu ve herkes bunu hissetti.',
      en: 'Bootlegs of this LEGENDARY show will circulate for years. Something happened on stage during {song}, and everyone felt it.',
    },
  ],
};

const fill = (s: string, v: ReviewVars) =>
  s.replace(/\{n\}/g, String(v.n)).replace(/\{venue\}/g, v.venue).replace(/\{city\}/g, v.city).replace(/\{song\}/g, v.song);

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
}

/** Konser eleştirisi; iki dilde birden üretilir ve konserle birlikte saklanır. */
export function gigReview(r: GigReviewInput): L {
  const make = (lang: Lang) => {
    const v: ReviewVars = { n: r.attendance, venue: r.venue[lang], city: r.city[lang], song: r.bestSong };
    if (r.presentCount === 0) {
      return lang === 'en'
        ? `The band never showed up at ${v.venue}. The audience went home angry.`
        : 'Grup sahneye hiç çıkmadı. Seyirci öfkeyle evine döndü.';
    }
    let band = REVIEWS[0];
    for (const b of REVIEWS) if (r.quality >= b.minQuality) band = b;
    if (r.legendary) band = LEGENDARY_REVIEWS;
    const line = fill(band.lines[Math.abs(r.seed) % band.lines.length][lang], v);
    const ratio = r.capacity > 0 ? r.attendance / r.capacity : 0;
    const crowd =
      ratio >= 0.85
        ? { tr: `${v.venue} tıklım tıklımdı.`, en: `${v.venue} was packed.` }
        : ratio >= 0.4
          ? { tr: `${v.venue} yarı yarıya doluydu.`, en: `${v.venue} was about half full.` }
          : { tr: `${v.venue} neredeyse boştu.`, en: `${v.venue} was almost empty.` };
    const missingCount = r.memberCount - r.presentCount;
    const missing =
      missingCount > 0
        ? lang === 'en'
          ? ` ${missingCount} band member${missingCount > 1 ? 's' : ''} never made it to the stage.`
          : ` ${missingCount} üye sahneye çıkmadı.`
        : '';
    return `${crowd[lang]} ${line}${missing}`;
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
