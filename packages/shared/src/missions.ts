// Haftalık görevler: her liste haftası her oyuncuya havuzdan 3 görev düşer.
// İlerleme oyuncunun o hafta yaptıklarından hesaplanır; ödül bir kez alınır.

import type { L } from './world';

export type MissionKind =
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
  | 'records';

export interface MissionDef {
  id: string;
  kind: MissionKind;
  target: number;
  reward: number;
  title: L;
}

const M = (id: string, kind: MissionKind, target: number, reward: number, tr: string, en: string): MissionDef => ({
  id,
  kind,
  target,
  reward,
  title: { tr, en },
});

export const MISSIONS: MissionDef[] = [
  M('gigs_2', 'gigs', 2, 300, 'Bu hafta 2 konserde sahneye çık', 'Play 2 gigs this week'),
  M('songs_2', 'songs', 2, 150, 'Bu hafta 2 şarkı yaz', 'Write 2 songs this week'),
  M('rehearse_6', 'rehearse_hours', 6, 150, 'Bu hafta 6 saat prova yap', 'Rehearse for 6 hours this week'),
  M('work_12', 'work_hours', 12, 120, 'Bu hafta 12 saat mesai yap', 'Work 12 hours this week'),
  M('study_8', 'study_hours', 8, 150, 'Bu hafta 8 saat çalış', 'Practise for 8 hours this week'),
  M('busk_100', 'busk_earnings', 100, 100, 'Sokak müziğinden 100 $ topla', 'Collect $100 busking'),
  M('workout_4', 'workout_hours', 4, 100, 'Spor salonunda 4 saat antrenman yap', 'Work out at the gym for 4 hours'),
  M('travel_2', 'travel', 2, 150, 'Bu hafta 2 kez başka şehre git', 'Travel to another city twice'),
  M('meals_3', 'meals', 3, 80, 'Restoranda 3 kez yemek ye', 'Eat at a restaurant 3 times'),
  M('hangout_3', 'hangouts', 3, 120, 'Bu hafta 3 kez biriyle takıl', 'Hang out with someone 3 times'),
  M('craft_1', 'crafts', 1, 150, 'Atölyede bir şey üret', 'Make something in the workshop'),
  M('record_1', 'records', 1, 200, 'Bir şarkı kaydet', 'Record a song'),
];
export const MISSION_BY_ID: Record<string, MissionDef> = Object.fromEntries(MISSIONS.map((m) => [m.id, m]));
export const MISSIONS_PER_WEEK = 3;

/** Oyuncunun o haftaki görevleri (aynı hafta hep aynı görevler) */
export function missionsFor(characterId: number, weekId: number): MissionDef[] {
  const out: MissionDef[] = [];
  let seed = (characterId * 2654435761 + weekId * 40503) >>> 0;
  const pool = [...MISSIONS];
  while (out.length < MISSIONS_PER_WEEK && pool.length) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    out.push(pool.splice(seed % pool.length, 1)[0]);
  }
  return out;
}
