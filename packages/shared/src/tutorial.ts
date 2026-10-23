// Rehber görevler: yeni oyuncuya oyunun ilk saatini adım adım gösteren, ödüllü kısa görev zinciri.
// Her adımın tamamlanıp tamamlanmadığını sunucu oyuncunun istatistiklerinden hesaplar; ödül bir kez alınır.

import type { L } from './world';

export interface TutorialStep {
  id: string;
  title: L;
  about: L;
  reward: number;
  /** Uygulamada "Git" düğmesinin açacağı ekran. {city} oyuncunun bulunduğu şehirle değiştirilir. */
  href: string;
}

export const TUTORIAL: TutorialStep[] = [
  {
    id: 'write_song',
    title: { tr: 'İlk şarkını yaz', en: 'Write your first song' },
    about: { tr: 'Her kariyer bir şarkıyla başlar. Ana ekrandan "Şarkı yaz"a dokun.', en: 'Every career starts with a song. Tap "Write a song" on the home screen.' },
    reward: 50,
    href: '/write-song',
  },
  {
    id: 'work_shift',
    title: { tr: 'Kira parasını çıkar', en: 'Earn some rent money' },
    about: { tr: 'Şehirdeki iş yerlerinden birinde kısa bir mesai yap.', en: 'Do a short shift at one of the workplaces in town.' },
    reward: 40,
    href: '/city',
  },
  {
    id: 'learn_skill',
    title: { tr: 'Yeni bir beceri öğren', en: 'Learn a new skill' },
    about: { tr: 'Kitapçıdan bir beceri kitabı al. Bestecilik ya da şovmenlik iyi bir başlangıçtır.', en: 'Buy a skill book at the bookstore. Composing or showmanship are good first picks.' },
    reward: 40,
    href: '/location/{city}-bookstore',
  },
  {
    id: 'form_band',
    title: { tr: 'Grubunu kur', en: 'Start your band' },
    about: { tr: 'Tek başına da olur: boş rolleri konserlerde kiralık müzisyenler doldurur.', en: 'You can go solo: hired session musicians fill the empty roles at gigs.' },
    reward: 50,
    href: '/band',
  },
  {
    id: 'rehearse',
    title: { tr: 'Prova yap', en: 'Rehearse' },
    about: { tr: 'Prova stüdyosunda bir şarkını çalış. Şarkıyı ne kadar iyi bilirsen konser o kadar iyi geçer.', en: 'Practise one of your songs at the rehearsal studio. The better you know it, the better the gig.' },
    reward: 50,
    href: '/location/{city}-studio',
  },
  {
    id: 'first_gig',
    title: { tr: 'İlk konserini ver', en: 'Play your first gig' },
    about: { tr: 'Bardan başla. Konseri ayarla, saatinde şehirde ol.', en: 'Start at the bar. Book the gig and be in town when it starts.' },
    reward: 100,
    href: '/location/{city}-bar',
  },
  {
    id: 'record',
    title: { tr: 'Bir şarkı kaydet', en: 'Record a song' },
    about: { tr: 'Kayıt stüdyosunda en iyi bildiğin şarkını kaydet.', en: 'Record the song you know best at the recording studio.' },
    reward: 100,
    href: '/location/{city}-recording_studio',
  },
  {
    id: 'release',
    title: { tr: 'İlk single\'ını yayınla', en: 'Release your first single' },
    about: { tr: 'Kayıtlı şarkını single olarak çıkar ve hafta sonunda listelere bak.', en: 'Put out your recorded song as a single and check the charts at the end of the week.' },
    reward: 150,
    href: '/releases',
  },
  {
    id: 'home',
    title: { tr: 'Kendine bir ev tut', en: 'Rent a place' },
    about: { tr: 'Emlakçıdan bir oda kirala. Evde dinlenmek kanepeden çok daha iyi gelir.', en: 'Rent a room at the estate agent. Resting at home beats the couch.' },
    // Ödül en ucuz odanın kirasından az olsun (tutup hemen bırakarak kâr edilmesin)
    reward: 30,
    href: '/location/{city}-real_estate',
  },
];

export const TUTORIAL_BY_ID: Record<string, TutorialStep> = Object.fromEntries(TUTORIAL.map((s) => [s.id, s]));
export const TUTORIAL_TOTAL_REWARD = TUTORIAL.reduce((s, x) => s + x.reward, 0);
