// Soğuk başlangıç: NPC'ler sosyal ve ekonomik tarafta da dünyayı doldurur.
// Hepsi kapalı devre çalışır: NPC makam sahibi maaş almaz, NPC yargıç ikramiye almaz, NPC alıcı dükkânın geri alım
// fiyatından fazla ödemez, NPC satıcı dükkân fiyatının altına satmaz. Böylece NPC'ler üzerinden para basılamaz.

import type { L } from './world';

export type NpcCivicRole = 'judge' | 'candidate' | 'reporter' | 'trader';

/** Her şehrin NPC kadrosu: adlar şehirden türetilir (world.ts'deki semt adlarıyla) */
export interface NpcCivicDef {
  key: string;
  role: NpcCivicRole;
  cityId: string;
  name: string;
}

const NAMES: Record<string, [string, string, string, string]> = {
  istanbul: ['Hakim Nevin Aksoy', 'Kemal Ersoy', 'Gazeteci Zeynep Uçar', 'Bit Pazarcı Rıza'],
  ankara: ['Hakim Orhan Tekin', 'Leyla Durmaz', 'Gazeteci Ali Şen', 'Hurdacı Necati'],
  izmir: ['Hakim Sevgi Yurt', 'Tarık Ege', 'Gazeteci Defne Kaya', 'Eskici Hamdi'],
  berlin: ['Richterin Petra Lang', 'Klaus Weber', 'Reporterin Jana Roth', 'Trödler Otto'],
  hamburg: ['Richter Jens Kühn', 'Birgit Schulz', 'Reporter Malte Hahn', 'Trödlerin Gerda'],
  munich: ['Richterin Ursula Maier', 'Franz Huber', 'Reporter Tobias Wolf', 'Trödler Sepp'],
  london: ['Judge Margaret Hale', 'Nigel Barnes', 'Reporter Priya Shah', 'Dealer Alfie'],
  manchester: ['Judge Colin Ward', 'Sandra Kelly', 'Reporter Dan Quinn', 'Dealer Mo'],
  liverpool: ['Judge Eileen Grant', 'Steve Connor', 'Reporter Kate Lyons', 'Dealer Ronnie'],
  paris: ['Juge Hélène Marchand', 'Pierre Lefèvre', 'Journaliste Inès Morel', 'Brocanteur Marcel'],
  lyon: ['Juge Bernard Faure', 'Sophie Blanc', 'Journaliste Paul Girard', 'Brocanteuse Odile'],
  marseille: ['Juge Nadia Haddad', 'Jean Roux', 'Journaliste Samir Aït', 'Brocanteur Gégé'],
  newyork: ['Judge Ruth Klein', 'Frank Russo', 'Reporter Maya Chen', 'Dealer Sal'],
  losangeles: ['Judge Carlos Vega', 'Linda Park', 'Reporter Jake Moore', 'Dealer Rita'],
  nashville: ['Judge Earl Dawson', 'Betty Jo Hale', 'Reporter Wyatt Cole', 'Dealer Hank'],
};

export const NPC_CIVIC: NpcCivicDef[] = Object.entries(NAMES).flatMap(([cityId, [judge, candidate, reporter, trader]]) => [
  { key: `${cityId}-judge`, role: 'judge' as const, cityId, name: judge },
  { key: `${cityId}-candidate`, role: 'candidate' as const, cityId, name: candidate },
  { key: `${cityId}-reporter`, role: 'reporter' as const, cityId, name: reporter },
  { key: `${cityId}-trader`, role: 'trader' as const, cityId, name: trader },
]);

/** NPC yargıç, davaya bakılmazsa son tarihten önce bu orana gelince normal cezayla karar verir */
export const NPC_JUDGE_AT = 0.5;
/** NPC adayın seçim vaadi */
export const NPC_PLATFORM: L = { tr: 'Daha temiz sokaklar, daha çok konser.', en: 'Cleaner streets, more gigs.' };

// ---------- NPC alıcı ve satıcı ----------

/** NPC alıcı yalnızca dükkâna satılamayan (atölyede üretilmiş) eşyaları alır; nominal fiyatın en fazla bu oranını öder */
export const NPC_BUY_RATE = 0.4;
/** ...ve hiçbir zaman malzeme maliyetinin bu katından fazla değil */
export const NPC_MATERIAL_MARGIN = 1.25;
/** Bir karakterden NPC'ye günde en fazla bu kadar satış */
export const NPC_BUY_DAILY = 2;
/** NPC satıcının ikinci el ilanları: dükkân fiyatının en az bu katı (geri satış %50'nin üstünde; al-sat döngüsü zarar eder) */
export const NPC_SELL_RATE = 0.85;
/** Her şehirde aynı anda en fazla bu kadar NPC ilanı */
export const NPC_MAX_LISTINGS = 6;

/** NPC muhabirin haberi için bir konserin en az bu kalitede olması gerekir */
export const NPC_NEWS_MIN_QUALITY = 60;
/** NPC muhabir şehir başına günde en fazla bu kadar haber yazar */
export const NPC_NEWS_PER_DAY = 2;
