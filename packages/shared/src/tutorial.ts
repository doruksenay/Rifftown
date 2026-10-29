// Rehber görevler: yeni oyuncuya oyunun ilk saatini adım adım gösteren, ödüllü kısa görev zinciri.
// Her adımın tamamlanıp tamamlanmadığını sunucu oyuncunun istatistiklerinden hesaplar; ödül bir kez alınır.

import type { L } from './world';
import { indexBy } from './lookup';

export interface TutorialStep {
  id: string;
  title: L;
  about: L;
  reward: number;
  /** Uygulamada "Git" düğmesinin açacağı ekran. {city} oyuncunun bulunduğu şehirle değiştirilir. */
  href: string;
  /** Süren bir eylem varken de yapılabilir (grup kurmak, profil, arkadaşlık isteği): kart beklerken bunları önerir */
  whileBusy?: boolean;
  /** Adımın başlattığı süreli eylem: o eylem sürerken kart bu adımda takılı kalmaz, sıradakine geçer */
  action?: string;
}

/**
 * Sıra (playtest Y-2): eskiden 2 saatlik "şarkı yaz" ilk adımdı ve gerçek hızda ilk saat tek düğmeyle geçiyordu.
 * Şimdi ilk dakikalarda anlık ve ödüllü adımlar (profil, kitap, grup, ev, yemek), sonra ilk şarkı; şarkı yazılırken kart
 * eylem sürerken yapılabilen adımları (arkadaş) gösterir. Toplam ödül $305 → $315 (ek hesaplara değmesin diye küçük).
 */
export const TUTORIAL: TutorialStep[] = [
  {
    id: 'profile',
    title: { tr: 'Kendini tanıt', en: 'Introduce yourself' },
    about: { tr: 'Profiline bir başlık yaz: hangi müziği yapıyorsun, kimi arıyorsun? Diğer oyuncular seni böyle bulur.', en: 'Write a headline on your profile: what music do you make, who are you looking for? Other players find you this way.' },
    reward: 10,
    href: '/me',
    whileBusy: true,
  },
  {
    id: 'learn_skill',
    title: { tr: 'Yeni bir beceri öğren', en: 'Learn a new skill' },
    about: { tr: 'Kitapçıdan bir beceri kitabı al: ikinci bir müzik türü ya da dans iyi bir başlangıçtır. Kitap anında açılır.', en: 'Buy a skill book at the bookstore: a second music genre or dancing are good first picks. A book unlocks instantly.' },
    reward: 20,
    href: '/location/{city}-bookstore',
  },
  {
    id: 'form_band',
    title: { tr: 'Grubunu kur', en: 'Start your band' },
    about: { tr: 'Arkadaşlarınla kurmak en iyisi: gerçek üyeler sahneye uyum ve kendi seyircisini getirir. Tek başına da olur: boş rolleri kiralık müzisyenler doldurur.', en: 'Starting it with friends is best: real members bring chemistry and their own crowd. You can go solo too: session musicians fill the empty roles.' },
    reward: 25,
    href: '/band',
    whileBusy: true,
  },
  {
    id: 'home',
    title: { tr: 'Kendine bir ev tut', en: 'Rent a place' },
    about: { tr: 'Emlakçıdan bir oda kirala. Evde dinlenmek kanepeden çok daha iyi gelir: yorgunluk ve keyifsizlik daha çabuk geçer.', en: 'Rent a room at the estate agent. Resting at home beats the couch: tiredness and low mood pass faster.' },
    // Ödül en ucuz odanın kirasından az olsun (tutup hemen bırakarak kâr edilmesin)
    reward: 15,
    href: '/location/{city}-real_estate',
  },
  {
    id: 'meal',
    title: { tr: 'Karnını doyur', en: 'Grab a bite' },
    about: { tr: 'Restoranda bir şey ye. Yemek anında enerji ve keyif verir; uzun bir günden sonra ilk yapılacak şey.', en: 'Eat something at a restaurant. A meal gives energy and mood right away; the first thing to do after a long day.' },
    // En ucuz yemek $6: ödül onu karşılar, kâr küçük
    reward: 10,
    href: '/location/{city}-restaurant',
  },
  {
    id: 'write_song',
    title: { tr: 'İlk şarkını yaz', en: 'Write your first song' },
    about: { tr: 'Her kariyer bir şarkıyla başlar. Yazmak biraz sürer; bu arada sıradaki adımlara geçebilirsin.', en: 'Every career starts with a song. Writing takes a while; meanwhile you can move on to the next steps.' },
    reward: 25,
    href: '/write-song',
    action: 'write_song',
  },
  {
    id: 'friend',
    title: { tr: 'Bir arkadaş edin', en: 'Make a friend' },
    about: { tr: 'Şehirdeki oyunculara bak ve birine arkadaşlık isteği gönder. Birlikte grup kurmak, takılmak ve ders almak arkadaşla başlar.', en: 'Look at the players in town and send someone a friend request. Bands, hanging out and lessons all start with a friend.' },
    reward: 10,
    href: '/people',
    whileBusy: true,
  },
  {
    id: 'work_shift',
    title: { tr: 'Kira parasını çıkar', en: 'Earn some rent money' },
    about: { tr: 'Şehirdeki iş yerlerinden birinde kısa bir mesai yap.', en: 'Do a short shift at one of the workplaces in town.' },
    reward: 20,
    href: '/city',
    action: 'work',
  },
  {
    id: 'rehearse',
    title: { tr: 'Prova yap', en: 'Rehearse' },
    about: { tr: 'Prova stüdyosunda bir şarkını çalış. Şarkıyı ne kadar iyi bilirsen konser o kadar iyi geçer.', en: 'Practise one of your songs at the rehearsal studio. The better you know it, the better the gig.' },
    reward: 25,
    href: '/location/{city}-studio',
    action: 'rehearse',
  },
  {
    id: 'first_gig',
    title: { tr: 'İlk konserini ver', en: 'Play your first gig' },
    about: { tr: 'Bardan başla. Konseri ayarla, saatinde şehirde ol.', en: 'Start at the bar. Book the gig and be in town when it starts.' },
    reward: 50,
    href: '/location/{city}-bar',
  },
  {
    id: 'record',
    title: { tr: 'Bir şarkı kaydet', en: 'Record a song' },
    about: { tr: 'Kayıt stüdyosunda en iyi bildiğin şarkını kaydet.', en: 'Record the song you know best at the recording studio.' },
    reward: 45,
    href: '/location/{city}-recording_studio',
    action: 'record',
  },
  {
    id: 'release',
    title: { tr: 'İlk single\'ını yayınla', en: 'Release your first single' },
    about: { tr: 'Kayıtlı şarkını single olarak çıkar ve hafta sonunda listelere bak.', en: 'Put out your recorded song as a single and check the charts at the end of the week.' },
    reward: 60,
    href: '/releases',
  },
];

export const TUTORIAL_BY_ID: Record<string, TutorialStep> = indexBy(TUTORIAL, (s) => s.id);
export const TUTORIAL_TOTAL_REWARD = TUTORIAL.reduce((s, x) => s + x.reward, 0);
