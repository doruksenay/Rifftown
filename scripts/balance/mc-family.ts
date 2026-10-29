// Olasılık tabloları (madde 8): hamilelik, aile büyüklüğü, macera sonuçları. Sabitler doğrudan paylaşılan
// paketten okunur (relations.ts); sunucudaki kurallar (canCarry: taşıyan başına tek hamilelik ve doğum sonrası
// bekleme; çocuk sınırı ÇİFT başına; deneme çift başına 3 günde bir) burada aynen modellenir.
import fs from 'node:fs';
import {
  FLING_PREGNANCY_CHANCE,
  TRY_PREGNANCY_CHANCE,
  TRY_PAIR_COOLDOWN_DAYS,
  PREGNANCY_DAYS,
  POSTPARTUM_COOLDOWN_DAYS,
  MAX_CHILDREN,
  FLING_PAIR_COOLDOWN_DAYS,
  FLING_REGRET_CHANCE,
  FLING_GOSSIP_CHANCE,
  cheatDiscoveryChance,
  CHILD_WEEKLY_UPKEEP,
  CITY_BY_ID,
} from '@rifftown/shared';
import { rng } from './lib/env';
import { stats } from './lib/stats';

const RUNS = 20000;
const r = rng(4242);

/** Bilinçli deneme: çift her fırsatta dener. carriers: 'one' (hep aynı kişi taşır) ya da 'both' (uygun olan taşır) */
function couple(carriers: 'one' | 'both', horizonDays: number) {
  let children = 0;
  const active: { carrier: number; due: number }[] = [];
  const lastBirth = [-1e9, -1e9];
  let nextTry = 0;
  let firstChild = NaN;
  let fourth = NaN;
  const byDay: Record<number, number> = {};
  for (let d = 0; d <= horizonDays; d++) {
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].due <= d) {
        children++;
        lastBirth[active[i].carrier] = d;
        active.splice(i, 1);
        if (children === 1) firstChild = d;
        if (children === MAX_CHILDREN) fourth = d;
      }
    }
    if ([56, 112, 224, 448].includes(d)) byDay[d] = children;
    if (d < nextTry) continue;
    if (children + active.length >= MAX_CHILDREN) continue;
    const canCarry = (c: number) => !active.some((p) => p.carrier === c) && d - lastBirth[c] >= POSTPARTUM_COOLDOWN_DAYS;
    const carrier = carriers === 'one' ? (canCarry(0) ? 0 : -1) : canCarry(0) ? 0 : canCarry(1) ? 1 : -1;
    if (carrier < 0) continue; // teklif reddedilir (cannot_carry): bekleme başlamaz
    nextTry = d + TRY_PAIR_COOLDOWN_DAYS;
    if (r() < TRY_PREGNANCY_CHANCE) active.push({ carrier, due: d + PREGNANCY_DAYS });
  }
  return { firstChild, fourth, byDay };
}

function sweepCouple(carriers: 'one' | 'both') {
  const first: number[] = [];
  const fourth: number[] = [];
  const at: Record<number, number[]> = { 56: [], 112: [], 224: [], 448: [] };
  for (let i = 0; i < RUNS; i++) {
    const x = couple(carriers, 448);
    first.push(x.firstChild);
    fourth.push(Number.isNaN(x.fourth) ? 9999 : x.fourth);
    for (const d of [56, 112, 224, 448]) at[d].push(x.byDay[d] ?? 0);
  }
  return {
    daysToFirstChild: stats(first),
    daysToFourthChild: stats(fourth),
    childrenAfterDays: Object.fromEntries(Object.entries(at).map(([d, xs]) => [d, stats(xs)])),
  };
}

/** Korunmasız macera: günde en fazla 1, aynı ikiliyle 7 günde 1. partners: dönüşümlü eş sayısı */
function flingPregnancyDays(partners: number) {
  const out: number[] = [];
  for (let i = 0; i < RUNS; i++) {
    const free = new Array(partners).fill(0);
    let d = 0;
    for (; d < 5000; d++) {
      const p = free.findIndex((t) => t <= d);
      if (p < 0) continue;
      free[p] = d + FLING_PAIR_COOLDOWN_DAYS;
      if (r() < FLING_PREGNANCY_CHANCE) break;
    }
    out.push(d);
  }
  return stats(out);
}

// Macera sonuçları (tek bir macera için)
const outcomes: any = {};
for (const [label, partnered, localStar, partnerInCity] of [
  ['bekâr, tanınmıyor', false, false, false],
  ['bekâr, yerel yıldız', false, true, false],
  ['sevgilisi var, başka şehirde, tanınmıyor', true, false, false],
  ['sevgilisi var, aynı şehirde, tanınmıyor', true, false, true],
  ['sevgilisi var, aynı şehirde, yerel yıldız', true, true, true],
] as const) {
  let regret = 0;
  let gossip = 0;
  let discovered = 0;
  for (let i = 0; i < RUNS; i++) {
    const g = localStar && r() < FLING_GOSSIP_CHANCE;
    if (g) gossip++;
    if (partnered || r() < FLING_REGRET_CHANCE) regret++;
    if (partnered && r() < cheatDiscoveryChance(g, partnerInCity)) discovered++;
  }
  outcomes[label] = { regret: regret / RUNS, gossip: gossip / RUNS, discovered: discovered / RUNS, expectedFameLoss: Math.round((gossip / RUNS) * 0.5 * 1000) / 1000 };
}

// Çocuk bakım gideri: çocuk başına, ebeveyn başına (yarısı)
const dayYear = 56;
const weeksToAdult = (18 * dayYear) / 7;
const upkeep = Object.fromEntries(
  ['istanbul', 'ankara', 'london', 'newyork'].map((c) => {
    const w = CHILD_WEEKLY_UPKEEP * CITY_BY_ID[c].costMult;
    return [c, { perWeekPerParent: w / 2, perParentPerGameDay: Math.round((w / 2 / 7) * 100) / 100, perChildToAdultTotal: Math.round(w * weeksToAdult), fourChildrenPerParentPerDay: Math.round(((4 * w) / 2 / 7) * 100) / 100 }];
  }),
);

const out = {
  constants: { FLING_PREGNANCY_CHANCE, TRY_PREGNANCY_CHANCE, TRY_PAIR_COOLDOWN_DAYS, PREGNANCY_DAYS, POSTPARTUM_COOLDOWN_DAYS, MAX_CHILDREN, FLING_PAIR_COOLDOWN_DAYS, CHILD_WEEKLY_UPKEEP },
  coupleOneCarrier: sweepCouple('one'),
  coupleBothCarry: sweepCouple('both'),
  flingDaysToPregnancy: { onePartner: flingPregnancyDays(1), sevenPartners: flingPregnancyDays(7) },
  flingOutcomes: outcomes,
  childUpkeep: upkeep,
  weeksToAdult,
};
fs.mkdirSync('scripts/balance/out', { recursive: true });
fs.writeFileSync('scripts/balance/out/mc-family.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
