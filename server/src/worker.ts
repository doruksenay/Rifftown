// Zamanlayıcı: vadesi gelen eylemleri ve konserleri sonuçlandırır, bildirimleri gönderir.
// Oyuncular çevrimdışıyken dünyanın işlemeye devam etmesini sağlayan parça budur.

import { completeDueActions } from './game/actions';
import { processJustice } from './game/crime';
import { processDueGigs } from './game/gigs';
import { processChartWeeks } from './game/music';
import { npcDirector } from './game/npc';
import { npcCivicDirector } from './game/npc-civic';
import { processRent } from './game/homes';
import { processUpkeep } from './game/business';
import { processFestivals } from './game/festivals';
import { processBankInterest } from './game/lifestyle';
import { config } from './config';
import { pool } from './db';
import { pruneMoodlets } from './game/wellbeing';
import { sendPendingPushes } from './push';
import { closeDueElections, ensureElections, payOfficeSalaries } from './game/politics';
import { processPressDrift } from './game/press';
import { processCrewMorale, processTours } from './game/touring';
import { processLabels } from './game/labels';
import { processAddiction, processFameDecay, processFamiliarityDecay, processHospitalizations, processMortality } from './game/consequences';

/** Bir aşama hata verirse diğer aşamalar yine çalışır */
async function stage(name: string, fn: () => Promise<number | void>): Promise<number> {
  try {
    return (await fn()) ?? 0;
  } catch (e) {
    console.error(`zamanlayıcı: ${name} aşaması hata verdi`, e);
    return 0;
  }
}

export async function tick() {
  // Biriken iş varsa hepsi bitene kadar devam et
  const actions = await stage('eylemler', async () => {
    let total = 0;
    for (let n = await completeDueActions(); n > 0; n = await completeDueActions()) total += n;
    return total;
  });
  if (config.npcEnabled) await stage('oyunun grupları', () => npcDirector());
  if (config.npcEnabled) await stage('oyunun kadrosu', () => npcCivicDirector());
  const gigs = await stage('konserler', () => processDueGigs(50));
  const justice = await stage('adalet', () => processJustice());
  const charts = await stage('listeler', () => processChartWeeks());
  await stage('kira', () => processRent());
  await stage('işletme giderleri', () => processUpkeep());
  await stage('banka faizi', () => processBankInterest());
  await stage('festivaller', () => processFestivals());
  const elections = await stage('seçimler', () => closeDueElections());
  await stage('seçim açma', () => ensureElections());
  await stage('maaşlar', () => payOfficeSalaries());
  await stage('moodlet temizliği', () => pruneMoodlets(pool));
  if (config.decayEnabled) {
    await stage('aşinalık çürümesi', () => processFamiliarityDecay());
    await stage('şöhret azalması', () => processFameDecay());
  }
  await stage('bağımlılık', () => processAddiction());
  await stage('basın', () => processPressDrift());
  await stage('turneler', () => processTours());
  await stage('ekip morali', () => processCrewMorale());
  await stage('plak şirketleri', () => processLabels());
  await stage('hastane', () => processHospitalizations());
  await stage('ölüm', () => processMortality());
  const pushes = await stage('bildirimler', () => sendPendingPushes());
  return { actions, gigs, pushes, elections, justice, charts };
}

export function startWorker(intervalMs: number, log: (msg: string) => void = console.log) {
  let running = false;
  let stopped = false;
  const run = async () => {
    if (running || stopped) return;
    running = true;
    try {
      const r = await tick();
      if (r.actions || r.gigs || r.pushes || r.elections || r.justice || r.charts)
        log(`tick: ${r.actions} eylem, ${r.gigs} konser, ${r.elections} seçim, ${r.justice} adalet, ${r.charts} liste haftası, ${r.pushes} bildirim`);
    } catch (e) {
      console.error('zamanlayıcı hatası', e);
    } finally {
      running = false;
    }
  };
  const timer = setInterval(run, intervalMs);
  run();
  return () => {
    stopped = true;
    clearInterval(timer);
  };
}
