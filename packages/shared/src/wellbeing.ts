// Enerji, ilham ve moodlet'ler (geçici ruh hâli etkileri).
//
// Enerji: yorucu işler harcar; dinlenmek, yemek ve zaman doldurur. Yetmezse iş başlamaz,
//   düşükken çalışma ve konser verimi azalır.
// İlham: yaşanan şeylerden (konser, yolculuk, randevu, sanat, sokak müziği) birikir, zamanla söner.
//   Şarkı yazarken harcanır ve kaliteyi artırır; konserde EFSANEVİ bir gece olasılığını büyütür.
// Moodlet: bir olaydan doğan, süresi dolunca kaybolan ruh hâli etkisi ("Harika bir konser +12, 1 gün").
//   Görünen ruh hâli = temel ruh hâli + etkin moodlet'ler.

import type { ActionKind } from './rules';
import type { L } from './world';
import { indexBy } from './lookup';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// ---------- Enerji ----------

export const START_ENERGY = 100;
/** Zamanla kendiliğinden dolan enerji (oyun saati başına) */
export const ENERGY_REGEN_PER_HOUR = 2;
/** Eylemlerin saat başına enerji etkisi (eksi = harcar). Dinlenme ayrıca evine göre artar. */
export const ENERGY_PER_HOUR: Record<ActionKind, number> = {
  study: -6,
  work: -8,
  rest: 14,
  write_song: -5,
  rehearse: -7,
  travel: -3,
  treat: 6,
  busk: -7,
  record: -7,
  crime: -8,
  investigate: -6,
  workout: -12,
  craft: -6,
  press: -5,
  write_article: -6,
  video: -6,
  lesson: -6,
};
/** Evde ya da otelde dinlenince saat başına fazladan enerji */
export const HOME_REST_ENERGY_BONUS = 6;
/** Konserde sahneye çıkan her müzisyenin harcadığı enerji */
export const GIG_ENERGY_COST = 20;
/** Yemeklerin anında verdiği enerji */
export const MEAL_ENERGY: Record<string, number> = { soup: 10, daily: 20, chef: 35 };
/** Bir eylemin bitince enerjiyi sıfırın altına düşürmeyeceği kontrol edilir; bu kadarı her zaman serbest */
export const ENERGY_FREE_KINDS: readonly ActionKind[] = ['rest', 'treat', 'travel'];

/** Enerjinin verime etkisi: 0'da %70, 100'de %100 */
export const energyFactor = (energy: number) => 0.7 + 0.3 * (clamp(energy, 0, 100) / 100);

/** Bir eylemin bitince enerjiyi ne kadar değiştireceği (kendiliğinden dolan dahil) */
// ---------- Tempo: uzun işler ve yeni başlayanlar (playtest Y-3) ----------
// Eskiden ilk dört iş (şarkı, 8 saat mesai, 4 saat prova, bar konseri) ruh hâlini 80'den 6'ya, enerjiyi 10'a indiriyordu;
// 8 saatlik mesai tek başına ruh hâlinden 32 götürüyordu ve ilk günün yarısı zorunlu uykuydu.

/** Yeni karakterde uzun işin ilk bu kadar saati tam yorar, sonrası LONG_ACTION_DRAIN_MULT ile */
export const LONG_ACTION_FULL_HOURS = 4;
export const LONG_ACTION_DRAIN_MULT = 0.6;
/** Yeni karakterin ilk bu kadar oyun saatinde yorucu işlerin ruh hâli ve enerji maliyeti NEWCOMER_DRAIN_MULT ile ("Yeni başlangıç") */
export const NEWCOMER_HOURS = 48;
export const NEWCOMER_DRAIN_MULT = 0.6;

/** Yorucu bir eylemin ruh hâli ve enerji maliyetinde sayılan saat (kazançlarda değil; dinlenme ve tedavi tam sayılır).
 *  Yalnızca yeni karakterde: uzun işin 4 saatten sonrası ×0,6, hepsi ayrıca ×0,6. Eski oyuncuda saat aynen sayılır;
 *  herkese uygulanan indirim PR #2'nin gider/gelir dengesini bozuyordu (10 günde mesai botu +%25 para). */
export function drainHours(hours: number, newcomer = false): number {
  if (!newcomer) return hours;
  const h = Math.min(hours, LONG_ACTION_FULL_HOURS) + Math.max(0, hours - LONG_ACTION_FULL_HOURS) * LONG_ACTION_DRAIN_MULT;
  return h * NEWCOMER_DRAIN_MULT;
}

/** Eylem bitince enerji (zamanla dolanı da sayar). Yorucu işlerin maliyeti drainHours ile. */
export function energyAfter(kind: ActionKind, hours: number, now: number, homeRest = false, newcomer = false): number {
  const base = ENERGY_PER_HOUR[kind] + (kind === 'rest' && homeRest ? HOME_REST_ENERGY_BONUS : 0);
  return now + (base < 0 ? base * drainHours(hours, newcomer) : base * hours) + ENERGY_REGEN_PER_HOUR * hours;
}

// ---------- İlham ----------

export const START_INSPIRATION = 30;
/** İlham zamanla söner (oyun saati başına) */
export const INSPIRATION_DECAY_PER_HOUR = 0.5;
/** Şarkı yazarken ilhamın kaliteye en fazla katkısı ve harcanan oranı */
export const SONG_INSPIRATION_MAX_BONUS = 15;
export const SONG_INSPIRATION_SPEND = 0.5;
export const songInspirationBonus = (inspiration: number) => Math.round((clamp(inspiration, 0, 100) / 100) * SONG_INSPIRATION_MAX_BONUS);

/** Olaylardan gelen ilham */
export const INSPIRATION_GAIN = {
  gig: 6, // konser başına, kaliteye göre +0…+6 daha
  legendaryGig: 25,
  travel: 8, // başka bir şehre varınca
  date: 8,
  hangout: 3,
  wedding: 20,
  buskPerHour: 2,
  /** Sanat eserleriyle dinlenirken: her %10 dinlenme bonusu için saatte +0.5 */
  artRestPerHourPer10: 0.5,
  learnSkill: 3,
};

/** Zamanla değişen bir değerin şimdiki hâli (enerji dolar, ilham söner) */
export function drift(stored: number, at: Date | string | null, perHour: number, gameSpeed: number, nowMs = Date.now()) {
  const t = at ? new Date(at).getTime() : nowMs;
  const hours = Math.max(0, ((nowMs - t) * gameSpeed) / 3_600_000);
  return clamp(stored + perHour * hours, 0, 100);
}
export const energyNow = (stored: number, at: Date | string | null, gameSpeed: number, nowMs = Date.now()) =>
  drift(stored, at, ENERGY_REGEN_PER_HOUR, gameSpeed, nowMs);
export const inspirationNow = (stored: number, at: Date | string | null, gameSpeed: number, nowMs = Date.now()) =>
  drift(stored, at, -INSPIRATION_DECAY_PER_HOUR, gameSpeed, nowMs);

// ---------- EFSANEVİ konser ----------

/** Bu kaliteden (DESTANSI) itibaren konser EFSANEVİ olabilir */
export const LEGENDARY_MIN_QUALITY = 90;
/** EFSANEVİ olma olasılığı: %1 + ilhama göre %0…%6 (grup ortalaması) */
export const legendaryChance = (quality: number, avgInspiration: number) =>
  quality < LEGENDARY_MIN_QUALITY ? 0 : 0.01 + 0.06 * (clamp(avgInspiration, 0, 100) / 100);
/** EFSANEVİ gecede çalınan enstrüman efsaneleşir: kalıcı bonus */
export const LEGENDARY_ITEM_BONUS = 3;
export const LEGENDARY_NAME: L = { tr: 'EFSANEVİ', en: 'LEGENDARY' };
export const LEGENDARY_ITEM_PREFIX: L = { tr: 'Efsanevi', en: 'Legendary' };

// ---------- Moodlet'ler ----------

export type MoodletId =
  | 'great_gig'
  | 'fresh_start'
  | 'legendary_gig'
  | 'bad_gig'
  | 'good_meal'
  | 'feast'
  | 'new_city'
  | 'good_company'
  | 'romantic_evening'
  | 'engaged'
  | 'newlywed'
  | 'heartbreak'
  | 'divorce'
  | 'gift'
  | 'achievement'
  | 'endorphins'
  | 'lost_job'
  | 'evicted'
  | 'good_trade'
  | 'scandal'
  | 'hospitalized'
  | 'band_split'
  | 'fling'
  | 'regret'
  | 'cheated'
  | 'family_evening'
  | 'sleepless'
  | 'family_strain'
  | 'expecting'
  | 'new_parent'
  // Durumdan doğanlar (saklanmaz, her an hesaplanır)
  | 'exhausted'
  | 'tired'
  | 'inspired'
  | 'sick'
  | 'jailed'
  | 'craving'
  | 'aging';

export interface MoodletDef {
  id: MoodletId;
  /** Ruh hâline etkisi */
  value: number;
  /** Süresi (oyun saati); durumdan doğanlarda 0 */
  hours: number;
  name: L;
  about: L;
}

const M = (id: MoodletId, value: number, hours: number, tr: string, en: string, aboutTr: string, aboutEn: string): MoodletDef => ({
  id,
  value,
  hours,
  name: { tr, en },
  about: { tr: aboutTr, en: aboutEn },
});

export const MOODLETS: MoodletDef[] = [
  M('legendary_gig', 25, 72, 'Efsanevi gece', 'Legendary night', 'Bu konser yıllarca konuşulacak.', 'People will talk about this gig for years.'),
  M('great_gig', 12, 24, 'Harika konser', 'Great gig', 'Seyirci şarkıları bir ağızdan söyledi.', 'The crowd sang every word.'),
  M('bad_gig', -10, 12, 'Kötü konser', 'Rough gig', 'Bu geceyi unutmak istiyorsun.', 'You would rather forget tonight.'),
  M('feast', 10, 8, 'Ziyafet', 'Feast', 'Şefin menüsü ruhuna iyi geldi.', 'The chef’s menu did your soul good.'),
  M('good_meal', 5, 4, 'Karnı tok', 'Well fed', 'Sıcak bir yemek yedin.', 'You had a warm meal.'),
  M('new_city', 8, 24, 'Yeni şehir heyecanı', 'New city buzz', 'Yeni sokaklar, yeni sesler.', 'New streets, new sounds.'),
  M('good_company', 6, 8, 'İyi sohbet', 'Good company', 'Bir arkadaşınla vakit geçirdin.', 'You spent time with a friend.'),
  M('romantic_evening', 10, 12, 'Romantik akşam', 'Romantic evening', 'Güzel bir randevuydu.', 'It was a lovely date.'),
  M('engaged', 15, 72, 'Nişanlı', 'Engaged', 'Evet dedi!', 'They said yes!'),
  M('newlywed', 25, 168, 'Yeni evli', 'Newlywed', 'Balayı havası.', 'Honeymoon glow.'),
  M('heartbreak', -20, 72, 'Kalp kırıklığı', 'Heartbreak', 'Bir ilişki bitti.', 'A relationship ended.'),
  M('divorce', -25, 120, 'Boşanma', 'Divorce', 'Zor bir dönem.', 'A hard time.'),
  M('gift', 6, 12, 'Hediye', 'A gift', 'Biri seni düşündü.', 'Someone thought of you.'),
  M('achievement', 5, 6, 'Başarı', 'Achievement', 'Yeni bir başarım açtın.', 'You unlocked an achievement.'),
  M('endorphins', 6, 6, 'Endorfin', 'Endorphins', 'Antrenman iyi geldi.', 'The workout felt good.'),
  M('lost_job', -10, 24, 'İşsiz kaldı', 'Lost a job', 'İşinden oldun.', 'You lost your job.'),
  M('evicted', -15, 48, 'Evsiz', 'Evicted', 'Evinden çıkarıldın.', 'You were evicted.'),
  M('good_trade', 4, 6, 'İyi takas', 'Good trade', 'Bir takası tamamladın.', 'You closed a trade.'),
  M('scandal', -12, 48, 'Skandal', 'Scandal', 'Adın gazetelerde kötü bir haberle geçiyor.', 'Your name is in the papers for the wrong reasons.'),
  M('hospitalized', -8, 24, 'Hastanelik oldu', 'Hospitalised', 'Kendini ihmal ettin ve hastaneye kaldırıldın.', 'You neglected yourself and ended up in hospital.'),
  M('band_split', -8, 24, 'Ayrılık', 'Split', 'Grupla yollar ayrıldı.', 'You parted ways with a band.'),
  M('fling', 8, 12, 'Tek gecelik macera', 'A night to remember', 'Dün gece beklenmedik biçimde güzeldi.', 'Last night was unexpectedly lovely.'),
  M('regret', -6, 24, 'Pişmanlık', 'Regret', 'Dün geceyi biraz düşünmen gerekiyor.', 'You need to think about last night a little.'),
  M('cheated', -18, 72, 'Aldatıldı', 'Cheated on', 'Güvendiğin biri seni üzdü.', 'Someone you trusted let you down.'),
  M('family_evening', 6, 24, 'Aile akşamı', 'Family evening', 'Evde güzel bir akşam geçirdiniz.', 'You had a lovely evening at home.'),
  M('sleepless', -4, 24, 'Uykusuz gece', 'Sleepless night', 'Bebek bütün gece uyumadı.', 'The baby was up all night.'),
  M('expecting', 4, 480, 'Bebek bekliyor', 'Expecting', 'Ailen büyüyor.', 'Your family is growing.'),
  M('new_parent', 15, 72, 'Yeni ebeveyn', 'New parent', 'Kucağında yeni bir hayat var.', 'You\'re holding a brand-new life.'),
  M('family_strain', -8, 48, 'Aile bütçesi', 'Family strain', 'Çocuğun bakım giderini karşılayamadın.', 'You couldn’t cover your child’s care this week.'),
  M('fresh_start', 5, 48, 'Yeni başlangıç', 'Fresh start', 'Şehirde ilk günlerin: yorucu işler seni daha az yoruyor.', 'Your first days in town: hard work wears you out less.'),
  M('exhausted', -15, 0, 'Bitkin', 'Exhausted', 'Enerjin tükenmek üzere. Dinlen ya da bir şey ye.', 'You are running on empty. Rest or eat something.'),
  M('tired', -6, 0, 'Yorgun', 'Tired', 'Enerjin azaldı.', 'Your energy is low.'),
  M('inspired', 8, 0, 'İlham dolu', 'Inspired', 'Kafanda melodiler dönüyor.', 'Melodies keep coming to you.'),
  M('sick', -8, 0, 'Hasta', 'Unwell', 'Sağlığın kötü.', 'Your health is poor.'),
  M('jailed', -20, 0, 'Parmaklıklar ardında', 'Behind bars', 'Cezaevindesin.', 'You are in prison.'),
  M('craving', -12, 0, 'Canı çekiyor', 'Craving', 'Bağımlısın; bir süredir isteğini gideremedin. Hastanede tedavi olabilirsin.', 'You are hooked and haven’t had your fix. Treatment at the hospital helps.'),
  M('aging', -3, 0, 'Yaş yetmiş', 'Getting on', 'Yıllar kendini hissettiriyor.', 'The years are catching up with you.'),
];
export const MOODLET_BY_ID: Record<string, MoodletDef> = indexBy(MOODLETS, (m) => m.id);

/** Duruma bağlı moodlet'ler */
export function derivedMoodlets(s: { energy: number; inspiration: number; health: number; jailed: boolean; craving?: boolean; age?: number }): MoodletId[] {
  const out: MoodletId[] = [];
  if (s.craving) out.push('craving');
  if ((s.age ?? 0) >= 70) out.push('aging');
  if (s.energy < 20) out.push('exhausted');
  else if (s.energy < 40) out.push('tired');
  if (s.inspiration >= 70) out.push('inspired');
  if (s.health < 40) out.push('sick');
  if (s.jailed) out.push('jailed');
  return out;
}

/** Görünen ruh hâli: temel + moodlet'ler (en fazla ±30) */
export const MOODLET_CAP = 30;
export const effectiveMood = (base: number, moodletValues: number[]) =>
  clamp(base + clamp(moodletValues.reduce((a, b) => a + b, 0), -MOODLET_CAP, MOODLET_CAP), 0, 100);

// ---------- Takas ----------

export const MAX_TRADE_ITEMS = 6;
export const MAX_OPEN_TRADES = 5;
/** Takasta eşyaların yanına eklenebilecek para (her taraf için). Takas en az birer eşya içermeli. */
export const MAX_TRADE_MONEY = 5000;
