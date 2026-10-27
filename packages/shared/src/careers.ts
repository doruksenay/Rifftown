// Meslekler, siyasi makamlar, VIP avantajları ve sokak müziği.

import { type Skills, lv } from './skills';
import { PACING } from './pacing';
import type { CivicType, Instrument, L, LocationType } from './world';

// ---------- Meslekler ----------

export interface Requirement {
  /** Bu becerilerden en az biri istenen seviyede olmalı */
  anyOf: string[];
  min: number;
}

export interface Profession {
  id: string;
  name: L;
  /** Mesleğin icra edildiği mekân türü */
  zone: LocationType;
  vip: boolean;
  requires: Requirement[];
  /** 1. rütbenin saatlik ücreti (şehir çarpanıyla çarpılır) */
  pay: number;
  /** 4 rütbe: alttan üste */
  ranks: [L, L, L, L];
  about: L;
}

const R = (tr: string, en: string): L => ({ tr, en });
const INSTRUMENT_SKILLS = ['vocals', 'guitar', 'bass', 'drums', 'keys'];

export const PROFESSIONS: Profession[] = [
  // ---------- Herkese açık ----------
  {
    id: 'music_teacher', zone: 'school', vip: false, pay: 22,
    name: R('Müzik öğretmeni', 'Music teacher'),
    requires: [{ anyOf: INSTRUMENT_SKILLS, min: 45 }],
    ranks: [R('Stajyer öğretmen', 'Trainee teacher'), R('Öğretmen', 'Teacher'), R('Kıdemli öğretmen', 'Senior teacher'), R('Okul müdürü', 'Head teacher')],
    about: R('Bir enstrümanda yetenekli olanlar müzik okulunda ders verebilir.', 'Skilled players can teach at the music school.'),
  },
  {
    id: 'sound_tech', zone: 'studio', vip: false, pay: 18,
    name: R('Ses teknisyeni', 'Sound technician'),
    requires: [{ anyOf: ['composing'], min: 15 }],
    ranks: [R('Asistan', 'Assistant'), R('Teknisyen', 'Technician'), R('Kıdemli teknisyen', 'Senior technician'), R('Stüdyo şefi', 'Studio chief')],
    about: R('Prova stüdyosunda grupların sesini ayarlarsın.', 'You run the sound for bands at the rehearsal studio.'),
  },
  {
    id: 'journalist', zone: 'newspaper', vip: false, pay: 20,
    name: R('Gazeteci', 'Journalist'),
    requires: [{ anyOf: ['lyrics'], min: 30 }],
    ranks: [R('Muhabir adayı', 'Junior reporter'), R('Muhabir', 'Reporter'), R('Köşe yazarı', 'Columnist'), R('Yayın yönetmeni', 'Editor-in-chief')],
    about: R('Şehrin müzik sahnesini yazarsın.', 'You write about the city\'s music scene.'),
  },
  {
    id: 'clerk', zone: 'city_hall', vip: false, pay: 16,
    name: R('Belediye memuru', 'Civil servant'),
    requires: [{ anyOf: ['economics'], min: 5 }],
    ranks: [R('Memur', 'Clerk'), R('Şef', 'Section head'), R('Müdür yardımcısı', 'Deputy director'), R('Müdür', 'Director')],
    about: R('Belediyede güvenli ama sıradan bir iş.', 'A safe but ordinary job at city hall.'),
  },
  {
    id: 'police', zone: 'police', vip: false, pay: 24,
    name: R('Polis', 'Police officer'),
    requires: [{ anyOf: ['law'], min: 15 }],
    ranks: [R('Polis memuru', 'Constable'), R('Komiser yardımcısı', 'Sergeant'), R('Komiser', 'Inspector'), R('Başkomiser', 'Chief inspector')],
    about: R('Şehrin düzenini korursun.', 'You keep the city in order.'),
  },
  {
    id: 'doctor', zone: 'hospital', vip: false, pay: 30,
    name: R('Doktor', 'Doctor'),
    requires: [{ anyOf: ['medicine'], min: 30 }],
    ranks: [R('Asistan doktor', 'Junior doctor'), R('Uzman doktor', 'Specialist'), R('Başhekim yardımcısı', 'Deputy chief physician'), R('Başhekim', 'Chief physician')],
    about: R('Hastanede çalışırsın. Doktorlar hastanede ücretsiz tedavi olur.', 'You work at the hospital. Doctors get free treatment.'),
  },
  // ---------- Sadece VIP ----------
  {
    id: 'ceo', zone: 'plaza', vip: true, pay: 60,
    name: R('CEO', 'CEO'),
    requires: [{ anyOf: ['economics'], min: 45 }, { anyOf: ['media'], min: 15 }],
    ranks: [R('Yönetici adayı', 'Management trainee'), R('Genel müdür yardımcısı', 'Deputy general manager'), R('Genel müdür', 'General manager'), R('CEO', 'CEO')],
    about: R('İş merkezinde bir şirketi yönetirsin. Oyunun en iyi ödeyen işlerinden biri.', 'You run a company in the business tower. One of the best paid jobs in the game.'),
  },
  {
    id: 'agent', zone: 'police', vip: true, pay: 45,
    name: R('Gizli ajan', 'Special agent'),
    requires: [{ anyOf: ['law'], min: 30 }, { anyOf: ['rhetoric'], min: 15 }],
    ranks: [R('Ajan adayı', 'Agent in training'), R('Saha ajanı', 'Field agent'), R('Kıdemli ajan', 'Senior agent'), R('Operasyon şefi', 'Head of operations')],
    about: R('Kimsenin bilmediği işler yaparsın.', 'You do the jobs nobody hears about.'),
  },
  {
    id: 'swat', zone: 'police', vip: true, pay: 40,
    name: R('Özel harekât polisi', 'Special task force officer'),
    requires: [{ anyOf: ['law'], min: 30 }],
    ranks: [R('Tim üyesi', 'Team member'), R('Tim lideri', 'Team leader'), R('Bölük komutanı', 'Unit commander'), R('Özel harekât şefi', 'Task force chief')],
    about: R('Zor durumlarda çağrılan ekiptesin.', 'You are on the team called in when things get tough.'),
  },
  {
    id: 'clergy', zone: 'worship', vip: true, pay: 30,
    name: R('Din görevlisi', 'Member of the clergy'),
    requires: [{ anyOf: ['theology'], min: 30 }],
    ranks: [R('Yardımcı', 'Assistant'), R('Görevli', 'Minister'), R('Kıdemli görevli', 'Senior minister'), R('Başgörevli', 'Head of congregation')],
    about: R('İbadethanede topluluğa hizmet edersin. Burada dinlenmek ruh hâlini daha çok düzeltir.', 'You serve the community. Resting here restores more mood.'),
  },
  {
    id: 'judge', zone: 'courthouse', vip: true, pay: 70,
    name: R('Yargıç', 'Judge'),
    requires: [{ anyOf: ['law'], min: 60 }],
    ranks: [R('Hâkim adayı', 'Trainee judge'), R('Hâkim', 'Judge'), R('Kıdemli hâkim', 'Senior judge'), R('Başkan hâkim', 'Presiding judge')],
    about: R('Adliyede davalara bakarsın. Oyunun en iyi ödeyen işi.', 'You hear cases at the courthouse. The best paid job in the game.'),
  },
];

export const PROFESSION_BY_ID: Record<string, Profession> = Object.fromEntries(PROFESSIONS.map((p) => [p.id, p]));
export const professionsAt = (zone: LocationType) => PROFESSIONS.filter((p) => p.zone === zone);

/** Rütbe eşikleri: o meslekte toplam çalışılan oyun saati */
export const RANK_HOURS = [0, 40, 120, 300] as const;
/** Rütbeye göre ücret çarpanı */
export const RANK_PAY = [1, 1.3, 1.7, 2.2] as const;

export const rankFor = (careerHours: number) => {
  let r = 0;
  while (r + 1 < RANK_HOURS.length && careerHours >= RANK_HOURS[r + 1]) r++;
  return r;
};

/** Mesleğin şartları sağlanıyor mu? Sağlanmayan ilk şartı döner. */
export function unmetRequirement(p: { requires: Requirement[] }, skills: Skills): Requirement | null {
  for (const req of p.requires) {
    if (!req.anyOf.some((id) => lv(skills, id) >= req.min)) return req;
  }
  return null;
}

/** Saatlik ücret: mesleğin taban ücreti × rütbe çarpanı × şehir çarpanı */
export const careerPay = (p: Profession, rank: number, costMult: number) => Math.round(p.pay * RANK_PAY[rank] * costMult);

// ---------- Siyasi makamlar (sadece VIP) ----------

export interface Office {
  id: 'mayor' | 'governor' | 'police_chief';
  name: L;
  zone: CivicType;
  requires: Requirement[];
  /** Görev süresince her oyun günü ödenen maaş */
  salaryPerDay: number;
  about: L;
}

export const OFFICES: Office[] = [
  {
    id: 'mayor', zone: 'city_hall', salaryPerDay: 600,
    name: R('Belediye başkanı', 'Mayor'),
    requires: [{ anyOf: ['rhetoric'], min: 15 }],
    about: R('Şehrin yönetimi. Başkan, şehir sayfasında herkesin gördüğü bir duyuru yayınlayabilir.', 'Runs the city. The mayor can post an announcement everyone sees on the city page.'),
  },
  {
    id: 'governor', zone: 'city_hall', salaryPerDay: 500,
    name: R('Vali', 'Governor'),
    requires: [{ anyOf: ['economics'], min: 30 }, { anyOf: ['rhetoric'], min: 15 }],
    about: R('Devletin şehirdeki temsilcisi.', 'The state\'s representative in the city.'),
  },
  {
    id: 'police_chief', zone: 'police', salaryPerDay: 450,
    name: R('Emniyet müdürü', 'Police chief'),
    requires: [{ anyOf: ['law'], min: 30 }],
    about: R('Şehrin emniyetinden sorumlu kişi.', 'The person in charge of the city\'s police.'),
  },
];

export const OFFICE_BY_ID: Record<string, Office> = Object.fromEntries(OFFICES.map((o) => [o.id, o]));
/** Bir seçim dönemi kaç oyun günü sürer */
export const ELECTION_DAYS = PACING.electionDays;

// ---------- VIP ----------

export const VIP = {
  /** Normal üyeler konser raporunu bu kadar oyun günü görebilir; VIP'te süresiz */
  reportDays: 3,
  /** Konser ne kadar önceden ayarlanabilir (oyun saati) */
  gigLeadHours: [2, 6, 12, 24, 48, 72] as const,
  /** Oyuncular arası para gönderme sınırı (tek seferde) */
  maxTransfer: 5000,
};

/** Mağaza ürünleri (App Store / Google Play'de aynı kimliklerle tanımlanmalı) */
export const VIP_PLANS = [
  { productId: 'rifftown_vip_1m', days: 30, price: { tr: '₺99,99', en: '$3.99' } },
  { productId: 'rifftown_vip_3m', days: 90, price: { tr: '₺249,99', en: '$9.99' } },
  { productId: 'rifftown_vip_12m', days: 365, price: { tr: '₺699,99', en: '$24.99' } },
] as const;

export const VIP_BENEFITS: L[] = [
  R('VIP\'e özel meslekler: CEO, gizli ajan, özel harekât, din görevlisi, yargıç', 'VIP-only jobs: CEO, special agent, task force, clergy, judge'),
  R('Belediye başkanlığı, valilik ve emniyet müdürlüğü seçimlerinde aday olma ve oy kullanma', 'Run for and vote in mayor, governor and police chief elections'),
  R('VIP\'e özel beceriler: retorik, medya ilişkileri, sahneden atlama', 'VIP-only skills: rhetoric, media relations, stage diving'),
  R('VIP\'e özel eşyalar: vintage enstrümanlar, ünlü tasarımcı kostümü, müze kalitesinde tablo', 'VIP-only items: vintage instruments, celebrity designer costume, museum-grade painting'),
  R('Tüm değerlerin kesin sayıları ve konser öncesi seyirci tahmini', 'Exact numbers for every value and audience estimates before gigs'),
  R('Konser raporları süresiz (normal üyelerde 3 gün)', 'Gig reports never expire (3 days for regular members)'),
  R('Konserleri 72 saat öncesinden ayarlama (normal üyelerde 24 saat)', 'Book gigs up to 72 hours ahead (24 hours for regular members)'),
  R('Diğer oyunculara para gönderme', 'Send money to other players'),
];

// ---------- Sokak müziği (parkta) ----------

export const BUSK_HOURS = [1, 2, 4] as const;

/** Parkta çalarak kazanılan saatlik bahşiş (rastgelelik hariç) */
export const buskPayPerHour = (roleLevel: number, stage: number, costMult: number) =>
  Math.round((4 + roleLevel * 0.35 + stage * 0.15) * costMult);

export type BuskRole = Instrument;
