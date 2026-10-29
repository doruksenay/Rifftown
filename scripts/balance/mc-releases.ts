// Tempo ve yayın ekonomisi (madde 4): gerçek weeklyUnits / RELEASE_RULES / labelSplit ile bir yayının ömür boyu
// geliri; single ve albüm döngüsünün maliyeti ve kâr/zararı; plak şirketiyle bölüşüm. Radyo ve klip etkisi hariç.
import fs from 'node:fs';
import {
  CITIES,
  CITY_BY_ID,
  RELEASE_RULES,
  BAND_SHARE,
  weeklyUnits,
  labelSplit,
  LABEL_SALES_BOOST,
  RECORDING_PRICE_PER_HOUR,
  RECORD_HOURS,
  STUDIO_PRICE_PER_HOUR,
  PACING,
  FAME_SPILLOVER,
} from '@rifftown/shared';
import { rng } from './lib/env';

const r = rng(1234);
/** Grubun şöhret haritası: ev şehri f, aynı ülkedeki şehirler f × yayılma, diğerleri 0 */
function fameMap(home: string, f: number) {
  const country = CITY_BY_ID[home].countryCode;
  return Object.fromEntries(CITIES.map((c) => [c.id, c.id === home ? f : c.countryCode === country ? f * FAME_SPILLOVER * 1.5 : 0]));
}
function lifetime(kind: 'single' | 'album', quality: number, fame: Record<string, number>, genre = 'rock', runs = 200) {
  const rules = RELEASE_RULES[kind];
  let units = 0;
  let firstMonth = 0;
  for (let k = 0; k < runs; k++) {
    for (let w = 0; w < rules.weeks; w++) {
      for (const c of CITIES) {
        const u = weeklyUnits(kind, quality, fame[c.id] ?? 0, c.genrePopularity[genre as 'rock'], c, w, r);
        units += u;
        if (w < 4) firstMonth += u;
      }
    }
  }
  units /= runs;
  firstMonth /= runs;
  const gross = units * rules.price;
  return { units: Math.round(units), gross: Math.round(gross), bandRevenue: Math.round(gross * BAND_SHARE), firstMonthBand: Math.round(firstMonth * rules.price * BAND_SHARE), weeks: rules.weeks };
}

const cm = CITY_BY_ID.istanbul.costMult;
const recordCost = RECORDING_PRICE_PER_HOUR * cm * RECORD_HOURS;
const rehearseCostPerSong = STUDIO_PRICE_PER_HOUR * cm * 6; // ~6 saat prova ile aşinalık ~45
const singleCost = recordCost + rehearseCostPerSong + RELEASE_RULES.single.pressingCost;
const albumCost = 8 * (recordCost + rehearseCostPerSong) + RELEASE_RULES.album.pressingCost;

const grid: any[] = [];
for (const f of [3, 10, 20, 35, 55, 80]) {
  for (const q of [25, 45, 65]) {
    const fm = fameMap('istanbul', f);
    const s = lifetime('single', q, fm);
    const a = lifetime('album', q, fm);
    grid.push({
      fame: f,
      quality: q,
      single: { ...s, cost: singleCost, profit: s.bandRevenue - singleCost },
      album: { ...a, cost: albumCost, profit: a.bandRevenue - albumCost },
    });
  }
}
// Plak şirketi: aynı satışta grup + şirket toplamı (ek hesabın şirketi, ana hesabın grubu)
const label = [0.3, 0.6].map((share) => {
  const gross = 10000;
  const boosted = gross * LABEL_SALES_BOOST;
  const split = labelSplit(boosted, share, 0);
  return { bandShare: share, grossWithoutLabel: gross, bandWithoutLabel: gross * BAND_SHARE, bandWithLabel: split.band, labelGets: split.label, combined: split.band + split.label, upliftVsNoLabel: Math.round(((split.band + split.label) / (gross * BAND_SHARE) - 1) * 1000) / 10 + '%' };
});
// Bir grubun 112 günlük (bir albüm beklemesi) yayın takvimi: 4 single + 1 albüm
const cadence = {
  daysPerCycle: PACING.albumCooldownDays,
  singles: PACING.albumCooldownDays / PACING.singleCooldownDays,
  albums: 1,
  songsReleasedMax: PACING.albumCooldownDays / PACING.singleCooldownDays * 2 + 12,
  songsWritableAtNoFatigue: Math.floor(PACING.albumCooldownDays / 3),
};
const out = { assumptions: { homeCity: 'istanbul', genre: 'rock', recordCost, rehearseCostPerSong, singleCost, albumCost, albumTracks: 8 }, grid, label, cadence };
fs.mkdirSync('scripts/balance/out', { recursive: true });
fs.writeFileSync('scripts/balance/out/mc-releases.json', JSON.stringify(out, null, 1));
for (const g of grid) console.log(`şöhret ${g.fame} kalite ${g.quality}: single ${g.single.bandRevenue} (kâr ${g.single.profit}, ilk ay ${g.single.firstMonthBand}) | albüm ${g.album.bandRevenue} (kâr ${g.album.profit}, ilk ay ${g.album.firstMonthBand})`);
console.log(JSON.stringify(label), JSON.stringify(cadence), JSON.stringify(out.assumptions));
