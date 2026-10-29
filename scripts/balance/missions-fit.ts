// Haftalık görev uygunluğu ölçümü (playtest O-2): yeni ve yalnız oyuncuya (grup, arkadaş yok, ilk 72 saat) düşen
// görevlerin ne kadarı yapılamaz. Eski seçim (bağlamsız) ile yeni seçim (bağlamlı) karşılaştırılır.
// Kullanım: tsx scripts/balance/missions-fit.ts
import { type MissionContext, missionEligible, missionsFor } from '@rifftown/shared';

const profiles: Record<string, MissionContext> = {
  yeni_yalniz: { hasBand: false, gigsPlayed: 0, friends: 0, accountHours: 10, knowsCraft: false, canStageEvent: false },
  yeni_gruplu: { hasBand: true, gigsPlayed: 0, friends: 1, accountHours: 10, knowsCraft: false, canStageEvent: false },
  yalniz_2hafta: { hasBand: false, gigsPlayed: 0, friends: 0, accountHours: 400, knowsCraft: false, canStageEvent: false },
};
for (const [name, ctx] of Object.entries(profiles)) {
  let oldBad = 0, newBad = 0, n = 0;
  for (let id = 1; id <= 500; id++)
    for (let wk = 1; wk <= 12; wk++) {
      for (const m of missionsFor(id, wk)) { n++; if (!missionEligible(m, ctx)) oldBad++; }
      for (const m of missionsFor(id, wk, ctx)) if (!missionEligible(m, ctx)) newBad++;
    }
  console.log(`${name}: yapılamaz görev oranı eski %${((oldBad / n) * 100).toFixed(1)} → yeni %${((newBad / n) * 100).toFixed(1)}`);
}
