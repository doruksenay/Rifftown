// İçerik: istatistik kurallı başarımlar, haftalık görev havuzu, görev zincirleri ve "efsane ol" sonrası uzun vadeli hedefler.
// Hepsi veri: bir istatistik adı ve bir eşik. Sunucu istatistikleri tek yerde hesaplar (server/src/game/stats.ts).

import type { L } from '../world';

/** Sunucunun hesapladığı oyuncu istatistikleri (ömür boyu) */
export type StatId =
  | 'gigs'
  | 'songs'
  | 'best_song'
  | 'skills_known'
  | 'max_skill'
  | 'countries'
  | 'cities_played'
  | 'recordings'
  | 'travels'
  | 'shifts'
  | 'busks'
  | 'busk_earnings'
  | 'crafts'
  | 'meals'
  | 'workouts'
  | 'hangouts'
  | 'dates'
  | 'gifts'
  | 'trades'
  | 'tattoos'
  | 'singles'
  | 'albums'
  | 'best_units'
  | 'chart_no1_weeks'
  | 'superstar_cities'
  | 'local_star_cities'
  | 'max_fame'
  | 'epic_gigs'
  | 'legendary_gigs'
  | 'festival_gigs'
  | 'stadium_gigs'
  | 'friends'
  | 'married'
  | 'stage_events'
  | 'encores'
  | 'articles'
  | 'interviews'
  | 'videos'
  | 'radio_plays'
  | 'tours_done';

export type StatRule = { stat: StatId; min: number };

// ---------- Başarımlar ----------

export interface StatAchievement {
  id: string;
  category: 'start' | 'stage' | 'records' | 'skills' | 'career' | 'crime' | 'social' | 'legacy' | 'media';
  points: number;
  name: L;
  about: L;
  rule: StatRule;
  secret?: boolean;
}

const A = (id: string, category: StatAchievement['category'], points: number, stat: StatId, min: number, tr: [string, string], en: [string, string], secret = false): StatAchievement => ({
  id,
  category,
  points,
  rule: { stat, min },
  name: { tr: tr[0], en: en[0] },
  about: { tr: tr[1], en: en[1] },
  secret,
});

export const STAT_ACHIEVEMENTS: StatAchievement[] = [
  A('gigs_100', 'stage', 40, 'gigs', 100, ['Yüzüncü gece', '100 konserde sahneye çık.'], ['Hundredth night', 'Play 100 gigs.']),
  A('gigs_250', 'stage', 60, 'gigs', 250, ['Yol köpeği', '250 konserde sahneye çık.'], ['Road dog', 'Play 250 gigs.']),
  A('cities_5', 'stage', 15, 'cities_played', 5, ['Şehir şehir', '5 farklı şehirde konser ver.'], ['City to city', 'Play gigs in 5 cities.']),
  A('cities_15', 'stage', 50, 'cities_played', 15, ['Her yerde', 'Dünyadaki 15 şehrin hepsinde konser ver.'], ['Everywhere', 'Play all 15 cities in the world.']),
  A('stadium_gig', 'stage', 40, 'stadium_gigs', 1, ['Stadyum ışıkları', 'Bir stadyumda çal.'], ['Stadium lights', 'Play a stadium.']),
  A('festival_gig', 'stage', 25, 'festival_gigs', 1, ['Festival sahnesi', 'Bir festivalde sahneye çık.'], ['Festival stage', 'Play a festival.']),
  A('festival_5', 'stage', 40, 'festival_gigs', 5, ['Festival müdavimi', '5 festivalde sahneye çık.'], ['Festival regular', 'Play 5 festivals.']),
  A('epic_5', 'stage', 50, 'epic_gigs', 5, ['Seri DESTANSI', '5 DESTANSI konser ver.'], ['EPIC streak', 'Play 5 EPIC gigs.']),
  A('legendary_night', 'stage', 80, 'legendary_gigs', 1, ['EFSANEVİ', 'EFSANEVİ bir gece yaşa.'], ['LEGENDARY', 'Play a LEGENDARY night.']),
  A('stage_moments_10', 'stage', 15, 'stage_events', 10, ['Sahne hâkimi', '10 sahne olayını başarıyla yap.'], ['Stage commander', 'Land 10 stage moments.']),
  A('encore_10', 'stage', 15, 'encores', 10, ['Bir daha!', '10 bis yap.'], ['One more!', 'Play 10 encores.']),
  A('songs_50', 'records', 30, 'songs', 50, ['Söz defteri doldu', '50 şarkı yaz.'], ['Notebook full', 'Write 50 songs.']),
  A('masterpiece', 'records', 50, 'best_song', 85, ['Başyapıt', 'Olağanüstü bir şarkı yaz.'], ['Masterpiece', 'Write an outstanding song.']),
  A('recordings_25', 'records', 25, 'recordings', 25, ['Stüdyo faresi', '25 kayıt yap.'], ['Studio rat', 'Make 25 recordings.']),
  A('singles_5', 'records', 25, 'singles', 5, ['Single makinesi', '5 single yayınla.'], ['Singles machine', 'Release 5 singles.']),
  A('albums_3', 'records', 40, 'albums', 3, ['Diskografi', '3 albüm yayınla.'], ['Discography', 'Release 3 albums.']),
  // Eskiden achievements.ts içinde kodla açılıyordu; efsane sonrası hedef de bunu kullandığı için eşik buraya taşındı (kimlik aynı)
  A('platinum', 'records', 50, 'best_units', 10000, ['Platin plak', 'Bir yayının toplam satışı 10.000\'i geçsin.'], ['Platinum record', 'Sell 10,000 copies of one release.']),
  A('no1_4weeks', 'records', 50, 'chart_no1_weeks', 4, ['Listelerin tepesinde', 'Şehir listelerinde toplam 4 hafta 1 numara ol.'], ['Top of the charts', 'Spend 4 weeks at number one on city charts.']),
  A('radio_100', 'media', 25, 'radio_plays', 100, ['Radyo dostu', 'Şarkıların radyoda 100 kez çalınsın.'], ['Radio friendly', 'Get 100 radio plays.']),
  A('video_1', 'media', 15, 'videos', 1, ['Kayıt, motor, kamera', 'Bir müzik klibi çek.'], ['Lights, camera', 'Shoot a music video.']),
  A('interview_5', 'media', 15, 'interviews', 5, ['Basının sevgilisi', '5 röportaj ya da basın toplantısı ver.'], ['Press darling', 'Give 5 interviews or press conferences.']),
  A('article_10', 'media', 20, 'articles', 10, ['Kalem erbabı', '10 haber ya da makale yayınla.'], ['Wordsmith', 'Publish 10 articles.']),
  A('tour_1', 'stage', 25, 'tours_done', 1, ['Yola çıktık', 'Bir turneyi tamamla.'], ['On the road', 'Finish a tour.']),
  A('skills_20', 'skills', 25, 'skills_known', 20, ['Rönesans insanı', '20 farklı beceri öğren.'], ['Renaissance', 'Learn 20 different skills.']),
  A('skills_35', 'skills', 50, 'skills_known', 35, ['Her şeyi bilen', '35 farklı beceri öğren.'], ['Know-it-all', 'Learn 35 different skills.']),
  A('crafter_10', 'skills', 20, 'crafts', 10, ['Usta eller', 'Atölyede 10 şey üret.'], ['Skilled hands', 'Make 10 things in the workshop.']),
  A('workouts_20', 'skills', 15, 'workouts', 20, ['Formda', '20 kez antrenman yap.'], ['In shape', 'Work out 20 times.']),
  A('shifts_50', 'career', 20, 'shifts', 50, ['Mesai canavarı', '50 mesai tamamla.'], ['Workhorse', 'Finish 50 shifts.']),
  A('busk_1000', 'career', 20, 'busk_earnings', 1000, ['Şapka doldu', 'Sokak müziğinden toplam $1.000 topla.'], ['Full hat', 'Collect $1,000 busking.']),
  A('travels_20', 'start', 15, 'travels', 20, ['Gezgin', '20 kez başka şehre git.'], ['Wanderer', 'Travel 20 times.']),
  A('meals_25', 'social', 10, 'meals', 25, ['Gurme', 'Restoranda 25 kez ye.'], ['Foodie', 'Eat out 25 times.']),
  A('friends_5', 'social', 15, 'friends', 5, ['Kalabalık', '5 arkadaş edin.'], ['Popular', 'Make 5 friends.']),
  A('hangouts_25', 'social', 15, 'hangouts', 25, ['Sosyal kelebek', '25 kez biriyle takıl.'], ['Social butterfly', 'Hang out 25 times.']),
  A('dates_5', 'social', 15, 'dates', 5, ['Romantik', '5 kez randevuya çık.'], ['Romantic', 'Go on 5 dates.']),
  A('married', 'social', 25, 'married', 1, ['Mutlu son', 'Evlen.'], ['Happily ever after', 'Get married.']),
  A('gifts_5', 'social', 10, 'gifts', 5, ['Hediye seven', '5 hediye ver.'], ['Gift giver', 'Give 5 gifts.']),
  A('trader_5', 'social', 15, 'trades', 5, ['Pazarlıkçı', '5 takas tamamla.'], ['Haggler', 'Complete 5 trades.']),
  A('inked_4', 'social', 10, 'tattoos', 4, ['Mürekkepli', '4 dövme yaptır.'], ['Inked', 'Get 4 tattoos.'], true),
  // Uzun vadeli (efsane sonrası)
  A('superstar_3', 'legacy', 60, 'superstar_cities', 3, ['Üç şehrin yıldızı', '3 şehirde süperstar ol.'], ['Star of three cities', 'Be a superstar in 3 cities.']),
  A('superstar_8', 'legacy', 100, 'superstar_cities', 8, ['Dünya yıldızı', '8 şehirde süperstar ol.'], ['Global star', 'Be a superstar in 8 cities.']),
  A('superstar_all', 'legacy', 200, 'superstar_cities', 15, ['Ölümsüz', 'Dünyanın 15 şehrinin hepsinde süperstar ol.'], ['Immortal', 'Be a superstar in all 15 cities.']),
  A('diamond', 'legacy', 120, 'best_units', 50000, ['Elmas plak', 'Bir yayının toplam satışı 50.000\'i geçsin.'], ['Diamond record', 'Sell 50,000 copies of one release.']),
];

// ---------- Haftalık görev havuzu (ek) ----------

export type WeeklyKind =
  | 'gigs'
  | 'songs'
  | 'rehearse_hours'
  | 'work_hours'
  | 'study_hours'
  | 'busk_earnings'
  | 'workout_hours'
  | 'travel'
  | 'meals'
  | 'hangouts'
  | 'crafts'
  | 'records'
  | 'stage_events'
  | 'encores'
  | 'cities_played'
  | 'gifts'
  | 'press'
  | 'articles';

export interface WeeklyDef {
  id: string;
  kind: WeeklyKind;
  target: number;
  reward: number;
  title: L;
}
const W = (id: string, kind: WeeklyKind, target: number, reward: number, tr: string, en: string): WeeklyDef => ({ id, kind, target, reward, title: { tr, en } });

/** Ödüller küçük (en fazla $60); haftada 3 görev düşer */
export const EXTRA_MISSIONS: WeeklyDef[] = [
  W('gigs_4', 'gigs', 4, 60, 'Bu hafta 4 konserde sahneye çık', 'Play 4 gigs this week'),
  W('songs_1', 'songs', 1, 20, 'Bu hafta bir şarkı yaz', 'Write a song this week'),
  W('rehearse_12', 'rehearse_hours', 12, 50, 'Bu hafta 12 saat prova yap', 'Rehearse for 12 hours this week'),
  W('work_24', 'work_hours', 24, 50, 'Bu hafta 24 saat mesai yap', 'Work 24 hours this week'),
  W('study_16', 'study_hours', 16, 50, 'Bu hafta 16 saat ders ya da pratik', 'Study or practise for 16 hours'),
  W('busk_250', 'busk_earnings', 250, 40, 'Sokak müziğinden $250 topla', 'Collect $250 busking'),
  W('workout_8', 'workout_hours', 8, 40, 'Bu hafta 8 saat antrenman yap', 'Work out for 8 hours'),
  W('travel_4', 'travel', 4, 50, 'Bu hafta 4 kez yolculuk yap', 'Travel 4 times this week'),
  W('meals_6', 'meals', 6, 30, 'Restoranda 6 kez ye', 'Eat out 6 times'),
  W('hangout_6', 'hangouts', 6, 45, 'Bu hafta 6 kez biriyle takıl', 'Hang out 6 times'),
  W('craft_3', 'crafts', 3, 60, 'Atölyede 3 şey üret', 'Make 3 things in the workshop'),
  W('record_3', 'records', 3, 60, 'Bu hafta 3 şarkı kaydet', 'Record 3 songs this week'),
  W('events_3', 'stage_events', 3, 40, 'Konserlerde 3 sahne olayı başar', 'Land 3 stage moments at gigs'),
  W('encore_2', 'encores', 2, 35, 'Bu hafta 2 bis yap', 'Play 2 encores this week'),
  W('cities_2', 'cities_played', 2, 55, 'Bu hafta 2 farklı şehirde çal', 'Play in 2 different cities'),
  W('gift_1', 'gifts', 1, 20, 'Bir arkadaşına hediye ver', 'Give a friend a gift'),
  W('press_1', 'press', 1, 35, 'Bir röportaj ya da basın toplantısı ver', 'Give an interview or press conference'),
];

// ---------- Görev zincirleri ----------
// Sırayla açılan, ömür boyu istatistiklere bakan kısa hikâyeler. Her adımın ödülü bir kez alınır.

export interface ChainStep {
  rule: StatRule;
  reward: number;
  title: L;
}
export interface ChainDef {
  id: string;
  name: L;
  steps: ChainStep[];
}
const St = (stat: StatId, min: number, reward: number, tr: string, en: string): ChainStep => ({ rule: { stat, min }, reward, title: { tr, en } });

export const CHAINS: ChainDef[] = [
  {
    id: 'road',
    name: { tr: 'Yolun hikâyesi', en: 'Tales of the road' },
    steps: [
      St('cities_played', 2, 40, '2 şehirde konser ver', 'Play gigs in 2 cities'),
      St('countries', 2, 60, '2 ülkede konser ver', 'Play gigs in 2 countries'),
      St('tours_done', 1, 80, 'Bir turneyi tamamla', 'Finish a tour'),
      St('countries', 5, 120, '5 ülkenin hepsinde çal', 'Play all 5 countries'),
    ],
  },
  {
    id: 'studio',
    name: { tr: 'Stüdyo günlükleri', en: 'Studio diaries' },
    steps: [
      St('recordings', 3, 40, '3 şarkı kaydet', 'Record 3 songs'),
      St('singles', 2, 60, '2 single yayınla', 'Release 2 singles'),
      St('albums', 1, 100, 'İlk albümünü çıkar', 'Release your first album'),
      St('best_units', 1000, 120, 'Altın plak', 'Go gold'),
    ],
  },
  {
    id: 'press',
    name: { tr: 'Manşetlere doğru', en: 'Into the headlines' },
    steps: [
      St('interviews', 1, 30, 'İlk röportajını ver', 'Give your first interview'),
      St('radio_plays', 10, 50, 'Radyoda 10 kez çalın', 'Get 10 radio plays'),
      St('videos', 1, 70, 'Bir klip çek', 'Shoot a music video'),
      St('interviews', 5, 90, '5 röportaj ver', 'Give 5 interviews'),
    ],
  },
  {
    id: 'craft',
    name: { tr: 'Usta çırak', en: 'Master and apprentice' },
    steps: [
      St('crafts', 1, 30, 'Atölyede bir şey üret', 'Make something in the workshop'),
      St('crafts', 5, 50, '5 şey üret', 'Make 5 things'),
      St('trades', 1, 50, 'Bir takas yap', 'Complete a trade'),
      St('crafts', 15, 90, '15 şey üret', 'Make 15 things'),
    ],
  },
  {
    id: 'heart',
    name: { tr: 'Kalbin sesi', en: 'Matters of the heart' },
    steps: [
      St('friends', 1, 20, 'Bir arkadaş edin', 'Make a friend'),
      St('hangouts', 5, 30, '5 kez takıl', 'Hang out 5 times'),
      St('dates', 1, 40, 'Randevuya çık', 'Go on a date'),
      St('married', 1, 80, 'Evlen', 'Get married'),
    ],
  },
  {
    id: 'stage',
    name: { tr: 'Sahnenin efendisi', en: 'Master of the stage' },
    steps: [
      St('stage_events', 1, 30, 'Bir sahne olayı başar', 'Land a stage moment'),
      St('encores', 1, 30, 'Bir bis yap', 'Play an encore'),
      St('epic_gigs', 1, 80, 'DESTANSI bir konser ver', 'Play an EPIC gig'),
      St('stadium_gigs', 1, 120, 'Stadyumda çal', 'Play a stadium'),
    ],
  },
];
export const CHAIN_BY_ID: Record<string, ChainDef> = Object.fromEntries(CHAINS.map((c) => [c.id, c]));

// ---------- Efsane sonrası hedefler ----------

export interface LegacyGoal {
  id: string;
  /** Hedefin kendisi olan başarım: eşik ve metin tek yerde (STAT_ACHIEVEMENTS) */
  achievementId: string;
  rule: StatRule;
  title: L;
  about: L;
}

/**
 * "Efsane ol"dan sonra sırayla gelen uzun vadeli hedefler; hepsi bitince grup Onur Listesi'ndedir.
 * Hedefler ayrı bir tanım değil, başarımlara işaret eder: eşik ve metin kopyalanmaz, başarım kimlikleri
 * (oyuncu kayıtları) değişmez. Hedef kimlikleri de eski sürümle aynıdır (uygulama legacyId ile arar).
 */
const LEGACY_SEQUENCE: { id: string; achievement: string; title?: L }[] = [
  { id: 'legend_night', achievement: 'legendary_night', title: { tr: 'EFSANEVİ bir gece', en: 'A LEGENDARY night' } },
  { id: 'superstar_3', achievement: 'superstar_3' },
  { id: 'platinum', achievement: 'platinum' },
  { id: 'festival_5', achievement: 'festival_5', title: { tr: 'Festival manşeti', en: 'Festival headliner' } },
  { id: 'superstar_8', achievement: 'superstar_8' },
  { id: 'diamond', achievement: 'diamond' },
  { id: 'superstar_all', achievement: 'superstar_all' },
];
export const LEGACY_GOALS: LegacyGoal[] = LEGACY_SEQUENCE.map((x) => {
  const a = STAT_ACHIEVEMENTS.find((s) => s.id === x.achievement);
  if (!a) throw new Error(`efsane sonrası hedef: başarım yok (${x.achievement})`);
  return { id: x.id, achievementId: a.id, rule: a.rule, title: x.title ?? a.name, about: a.about };
});

/** Sıradaki efsane sonrası hedef (hepsi bittiyse null) */
export function nextLegacyGoal(stats: Partial<Record<StatId, number>>): { goal: LegacyGoal; n: number } | null {
  for (const g of LEGACY_GOALS) {
    const n = stats[g.rule.stat] ?? 0;
    if (n < g.rule.min) return { goal: g, n };
  }
  return null;
}
