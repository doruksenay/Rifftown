// Haftalık görevler: her liste haftası her oyuncuya havuzdan 3 görev düşer (ek görevler content/progress.ts içinde).
// Ödüller küçük tutuldu; para asıl müzikten ve meslekten gelmeli.
// İlerleme oyuncunun o hafta yaptıklarından hesaplanır; ödül bir kez alınır.

import type { L } from './world';
import { EXTRA_MISSIONS, type WeeklyKind } from './content/progress';
import { indexBy } from './lookup';

export type MissionKind = WeeklyKind;

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
  M('gigs_2', 'gigs', 2, 60, 'Bu hafta 2 konserde sahneye çık', 'Play 2 gigs this week'),
  M('songs_2', 'songs', 2, 40, 'Bu hafta 2 şarkı yaz', 'Write 2 songs this week'),
  M('rehearse_6', 'rehearse_hours', 6, 35, 'Bu hafta 6 saat prova yap', 'Rehearse for 6 hours this week'),
  M('work_12', 'work_hours', 12, 30, 'Bu hafta 12 saat işte mesai yap', 'Work 12 hours at a job this week'),
  M('study_8', 'study_hours', 8, 30, 'Bu hafta 8 saat ders al ya da pratik yap (okul, üniversite, ev)', 'Study or practise skills for 8 hours this week'),
  M('busk_100', 'busk_earnings', 100, 25, 'Sokak müziğinden 100 $ topla', 'Collect $100 busking'),
  M('workout_4', 'workout_hours', 4, 25, 'Spor salonunda 4 saat antrenman yap', 'Work out at the gym for 4 hours'),
  M('travel_2', 'travel', 2, 40, 'Bu hafta 2 kez başka şehre git', 'Travel to another city twice'),
  M('meals_3', 'meals', 3, 20, 'Restoranda 3 kez yemek ye', 'Eat at a restaurant 3 times'),
  M('hangout_3', 'hangouts', 3, 30, 'Bu hafta 3 kez biriyle takıl', 'Hang out with someone 3 times'),
  M('craft_1', 'crafts', 1, 40, 'Atölyede bir şey üret', 'Make something in the workshop'),
  M('record_1', 'records', 1, 50, 'Bir şarkı kaydet', 'Record a song'),
];
// Veri dosyasındaki ek görevler
MISSIONS.push(...EXTRA_MISSIONS);
export const MISSION_BY_ID: Record<string, MissionDef> = indexBy(MISSIONS, (m) => m.id);
export const MISSIONS_PER_WEEK = 3;

/** Görev seçimi için oyuncunun durumu (playtest O-2: yeni ve yalnız oyuncuya hediye, takılma, yolculuk düşüyordu) */
export interface MissionContext {
  hasBand: boolean;
  /** Ömür boyu sahneye çıktığı konser */
  gigsPlayed: number;
  friends: number;
  /** Karakterin yaşı (oyun saati) */
  accountHours: number;
  /** El işçiliğini biliyor (atölye) */
  knowsCraft: boolean;
  /** En az bir sahne olayının beceri eşiğini geçiyor */
  canStageEvent: boolean;
}

/** Yeni hesap kapısı (hediye, yolculuk görevleri): TRADE_MIN_ACCOUNT_HOURS ile aynı (72 oyun saati) */
export const MISSION_SETTLED_HOURS = 72;

/** Görev bu oyuncu için bu hafta yapılabilir mi */
export function missionEligible(m: MissionDef, ctx: MissionContext): boolean {
  const settled = ctx.accountHours >= MISSION_SETTLED_HOURS;
  switch (m.kind) {
    case 'gigs':
    case 'records':
    case 'press':
    case 'rehearse_hours':
      return ctx.hasBand;
    case 'encores':
      return ctx.hasBand && ctx.gigsPlayed >= 3;
    case 'stage_events':
      return ctx.hasBand && ctx.canStageEvent;
    case 'cities_played':
      return ctx.hasBand && settled;
    case 'hangouts':
      return ctx.friends > 0;
    case 'gifts':
      return ctx.friends > 0 && settled;
    case 'travel':
      return settled;
    case 'crafts':
      return ctx.knowsCraft;
    default:
      return true;
  }
}

/** Oyuncunun o haftaki görevleri (aynı hafta hep aynı görevler). ctx verilirse yalnızca yapılabilir görevlerden seçilir;
 *  sunucu seçimi haftanın ilk bakışında saklar (mission_weeks). */
export function missionsFor(characterId: number, weekId: number, ctx?: MissionContext): MissionDef[] {
  const out: MissionDef[] = [];
  let seed = (characterId * 2654435761 + weekId * 40503) >>> 0;
  const eligible = ctx ? MISSIONS.filter((m) => missionEligible(m, ctx)) : MISSIONS;
  const pool = [...(eligible.length >= MISSIONS_PER_WEEK ? eligible : MISSIONS)];
  while (out.length < MISSIONS_PER_WEEK && pool.length) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    // Aynı türden iki görev (ör. 2 ve 4 konser) aynı hafta düşmesin
    const pick = pool.splice(seed % pool.length, 1)[0];
    if (out.some((x) => x.kind === pick.kind)) continue;
    out.push(pick);
  }
  return out;
}
