// Başarımlar. Sunucu oyuncunun istatistiklerine bakarak kazanılanları açar (bkz. server/src/game/achievements.ts).
// Puanlar profilde toplanır. Gizli başarımların adı ve açıklaması kazanılana kadar görünmez.

import type { L } from './world';

export type AchievementCategory = 'start' | 'stage' | 'records' | 'skills' | 'career' | 'crime' | 'social';

export const ACHIEVEMENT_CATEGORY_NAMES: Record<AchievementCategory, L> = {
  start: { tr: 'İlk adımlar', en: 'First steps' },
  stage: { tr: 'Sahnede', en: 'On stage' },
  records: { tr: 'Kayıt ve listeler', en: 'Records and charts' },
  skills: { tr: 'Ustalık', en: 'Mastery' },
  career: { tr: 'Kariyer ve siyaset', en: 'Career and politics' },
  crime: { tr: 'Suç ve adalet', en: 'Crime and justice' },
  social: { tr: 'Sosyal', en: 'Social' },
};

export interface AchievementDef {
  id: string;
  category: AchievementCategory;
  points: number;
  name: L;
  about: L;
  secret?: boolean;
}

const A = (id: string, category: AchievementCategory, points: number, tr: [string, string], en: [string, string], secret = false): AchievementDef => ({
  id,
  category,
  points,
  name: { tr: tr[0], en: en[0] },
  about: { tr: tr[1], en: en[1] },
  secret,
});

export const ACHIEVEMENTS: AchievementDef[] = [
  // İlk adımlar
  A('first_song', 'start', 5, ['İlk beste', 'İlk şarkını yaz.'], ['First tune', 'Write your first song.']),
  A('first_band', 'start', 5, ['Garaj grubu', 'Bir grup kur ya da bir gruba katıl.'], ['Garage band', 'Start or join a band.']),
  A('first_gig', 'start', 10, ['Sahne korkusu', 'İlk konserini ver.'], ['Stage fright', 'Play your first gig.']),
  A('first_job', 'start', 5, ['Kira parası', 'İlk mesaini tamamla.'], ['Rent money', 'Finish your first shift.']),
  A('first_travel', 'start', 5, ['Yollara düştüm', 'Başka bir şehre git.'], ['On the road', 'Travel to another city.']),
  A('new_skill', 'start', 5, ['Kitap kurdu', 'Yeni bir beceri öğren.'], ['Bookworm', 'Learn a new skill.']),
  A('busker', 'start', 5, ['Şapka yerde', 'Parkta sokak müziği yap.'], ['Hat on the ground', 'Busk in the park.']),
  // Sahnede
  A('gigs_10', 'stage', 15, ['Yol arkadaşları', '10 konserde sahneye çık.'], ['Road warriors', 'Play 10 gigs.']),
  A('gigs_50', 'stage', 30, ['Sahnenin tozu', '50 konserde sahneye çık.'], ['Stage dust', 'Play 50 gigs.']),
  A('full_house', 'stage', 15, ['Kapalı gişe', 'Kapasitenin en az %90\'ının dolduğu bir konser ver.'], ['Sold out', 'Play a gig at 90% capacity or more.']),
  A('hall_gig', 'stage', 25, ['Büyük sahne', 'Bir konser salonunda çal.'], ['The big stage', 'Play a concert hall.']),
  A('epic_gig', 'stage', 40, ['DESTANSI', 'DESTANSI bir konser ver.'], ['EPIC', 'Play an EPIC gig.']),
  A('world_tour', 'stage', 40, ['Dünya turnesi', '5 farklı ülkede konser ver.'], ['World tour', 'Play gigs in 5 different countries.']),
  A('local_star', 'stage', 15, ['Yerel yıldız', 'Grubunla bir şehirde yerel yıldız ol.'], ['Local star', 'Become a local star in a city with your band.']),
  A('superstar', 'stage', 50, ['Süperstar', 'Grubunla bir şehirde süperstar ol.'], ['Superstar', 'Become a superstar in a city with your band.']),
  // Kayıt ve listeler
  A('songs_10', 'records', 10, ['Şarkı defteri', '10 şarkı yaz.'], ['Songbook', 'Write 10 songs.']),
  A('great_song', 'records', 20, ['Hit kokusu', 'Harika ya da daha iyi bir şarkı yaz.'], ['Smells like a hit', 'Write a great song or better.']),
  A('first_recording', 'records', 10, ['Kayıt ışığı yandı', 'Bir şarkı kaydet.'], ['Red light on', 'Record a song.']),
  A('first_single', 'records', 15, ['İlk single', 'Grubunla bir single yayınla.'], ['First single', 'Release a single with your band.']),
  A('first_album', 'records', 25, ['Uzun çalar', 'Grubunla bir albüm yayınla.'], ['Long player', 'Release an album with your band.']),
  A('chart_top10', 'records', 20, ['İlk on', 'Bir şehir listesinde ilk 10\'a gir.'], ['Top ten', 'Reach the top 10 of a city chart.']),
  A('chart_no1', 'records', 40, ['Bir numara', 'Bir şehir listesinde 1 numara ol.'], ['Number one', 'Reach number one on a city chart.']),
  A('gold', 'records', 30, ['Altın plak', 'Bir yayının toplam satışı 1.000\'i geçsin.'], ['Gold record', 'Sell 1,000 copies of one release.']),
  A('platinum', 'records', 50, ['Platin plak', 'Bir yayının toplam satışı 10.000\'i geçsin.'], ['Platinum record', 'Sell 10,000 copies of one release.']),
  // Ustalık
  A('skilled', 'skills', 10, ['Yetenekli', 'Bir beceride yetenekli seviyesine çık.'], ['Skilled', 'Reach skilled in a skill.']),
  A('master', 'skills', 25, ['Usta', 'Bir beceride usta ol.'], ['Master', 'Become a master of a skill.']),
  A('legend', 'skills', 50, ['Efsane', 'Bir beceride efsane ol.'], ['Legend', 'Become a legend in a skill.']),
  A('polymath', 'skills', 20, ['Çok yönlü', '12 farklı beceri öğren.'], ['Polymath', 'Learn 12 different skills.']),
  // Kariyer ve siyaset
  A('first_profession', 'career', 10, ['Meslek sahibi', 'Bir mesleğe gir.'], ['Professional', 'Take up a profession.']),
  A('top_rank', 'career', 30, ['Zirvede', 'Mesleğinde en üst rütbeye çık.'], ['At the top', 'Reach the top rank of your profession.']),
  A('voter', 'career', 5, ['Sandık başında', 'Bir seçimde oy kullan.'], ['At the ballot box', 'Vote in an election.']),
  A('elected', 'career', 40, ['Halkın seçimi', 'Bir seçim kazan.'], ['The people\'s choice', 'Win an election.']),
  // Suç ve adalet
  A('first_crime', 'crime', 10, ['Kötü yola düştü', 'Yakalanmadan bir suç işle.'], ['Gone astray', 'Commit a crime without getting caught.'], true),
  A('caught', 'crime', 5, ['Eller yukarı', 'Tutuklan.'], ['Hands up', 'Get arrested.'], true),
  A('jailbird', 'crime', 15, ['Müdavim', 'Üç kez hüküm giy.'], ['Jailbird', 'Get convicted three times.'], true),
  A('detective', 'crime', 20, ['Dedektif', 'Bir faili meçhul suçu çöz.'], ['Detective', 'Solve an unsolved crime.']),
  A('justice', 'crime', 20, ['Kürsüde', 'Yargıç olarak bir davada karar ver.'], ['On the bench', 'Rule on a case as a judge.']),
  // Sosyal
  A('generous', 'social', 10, ['Eli açık', 'Başka bir oyuncuya para gönder.'], ['Open-handed', 'Send money to another player.']),
  A('vip', 'social', 10, ['VIP', 'VIP üye ol.'], ['VIP', 'Become a VIP member.']),
];

export const ACHIEVEMENT_BY_ID: Record<string, AchievementDef> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
export const TOTAL_ACHIEVEMENT_POINTS = ACHIEVEMENTS.reduce((s, a) => s + a.points, 0);
