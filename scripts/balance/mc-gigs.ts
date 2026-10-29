// Konser sonucu dağılımı (madde 5): gerçek computeGig ile Monte Carlo. Veritabanı gerekmez.
// Profil × mekân × etken ablasyonları; sahne olayı/bis planlarının taranması (dominant strateji);
// tür popülerliğinin seyirciye etkisi.
import fs from 'node:fs';
import {
  CITIES,
  CITY_BY_ID,
  GENRES,
  STAGE_EVENTS,
  stageEventAllowed,
  stageEventOdds,
  computeGig,
  type GigPerformer,
  type Genre,
  type Instrument,
  type VenueType,
  ROLE_SKILLS,
  SESSION_MUSICIAN,
  SESSION_FAMILIARITY,
  sessionLevels,
  fxQualityBonus,
  gearQualityBonus,
  roleSkill,
  stageScore,
  SUBGENRES,
  trendingSubgenre,
} from '@rifftown/shared';
import { rng } from './lib/env';
import { stats } from './lib/stats';

const N = Number(process.env.MC_N ?? 4000);

interface Profile {
  id: string;
  label: string;
  venue: VenueType;
  fame: number;
  members: number;
  role: number;
  stage: number;
  songQ: number;
  fam: number;
  /** extra skills for events */
  extra: number;
  session: number;
  energy: number;
}
const PROFILES: Profile[] = [
  { id: 'newbie_hired', label: 'Yeni oyuncu + 3 kiralık (bar)', venue: 'bar', fame: 1, members: 1, role: 14, stage: 5, songQ: 22, fam: 60, extra: 5, session: 3, energy: 70 },
  { id: 'newbie_hired5', label: 'Yeni oyuncu + 5 kiralık (bar, tavan)', venue: 'bar', fame: 1, members: 1, role: 14, stage: 5, songQ: 22, fam: 60, extra: 5, session: 5, energy: 70 },
  { id: 'newbie_solo', label: 'Yeni oyuncu, tek başına (bar)', venue: 'bar', fame: 1, members: 1, role: 14, stage: 5, songQ: 22, fam: 60, extra: 5, session: 0, energy: 70 },
  { id: 'mid_club', label: 'Orta grup, 4 kişi (kulüp, şöhret 25)', venue: 'club', fame: 25, members: 4, role: 40, stage: 30, songQ: 45, fam: 70, extra: 30, session: 0, energy: 70 },
  { id: 'mid_club_plus2', label: 'Orta grup + 2 kiralık (kulüp)', venue: 'club', fame: 25, members: 4, role: 40, stage: 30, songQ: 45, fam: 70, extra: 30, session: 2, energy: 70 },
  { id: 'strong_hall', label: 'Güçlü grup (salon, şöhret 55)', venue: 'hall', fame: 55, members: 4, role: 60, stage: 50, songQ: 60, fam: 80, extra: 50, session: 0, energy: 70 },
  { id: 'star_stadium', label: 'Yıldız grup (stadyum, şöhret 85)', venue: 'stadium', fame: 85, members: 4, role: 80, stage: 70, songQ: 75, fam: 90, extra: 70, session: 0, energy: 70 },
];
const ROLES: Instrument[] = ['guitar', 'vocals', 'bass', 'drums'];

function performers(p: Profile, opts: { instBonus?: number; outfit?: number; energy?: number; gearQuality?: number } = {}, songIds: number[]): GigPerformer[] {
  const out: GigPerformer[] = [];
  for (let i = 0; i < p.members; i++) {
    const role = ROLES[i % ROLES.length];
    const s: Record<string, number> = {
      [ROLE_SKILLS[role].basic]: p.role,
      [ROLE_SKILLS[role].specific]: p.role,
      showmanship: p.stage,
      pro_showmanship: p.stage * 0.7,
      dancing: p.stage * 0.6,
      audience: p.stage * 0.8,
      improvisation: p.extra,
      genre_rock: Math.max(10, p.extra),
      storytelling: p.extra,
      stagediving: p.extra * 0.5,
    };
    out.push({
      characterId: i + 1,
      role,
      skills: s,
      mood: 70,
      health: 90,
      energy: opts.energy ?? p.energy,
      inspiration: 40,
      present: true,
      instrumentBonus: opts.instBonus ?? 0,
      outfitBonus: opts.outfit ?? 0,
      gearQuality: opts.gearQuality ?? 0,
      familiarity: Object.fromEntries(songIds.map((id) => [id, p.fam])),
    });
  }
  // Kiralık müzisyen: sunucuyla aynı kural (grubun kendi ortalamasının SESSION_SKILL_MARGIN üstüyle sınırlı)
  const own = out.length ? { skill: out.reduce((a, x) => a + roleSkill(x.skills, x.role), 0) / out.length, stage: out.reduce((a, x) => a + stageScore(x.skills), 0) / out.length } : null;
  const sm = sessionLevels(p.venue, own);
  const sessRoles = (['vocals', 'bass', 'drums', 'keys', 'sax'] as Instrument[]).slice(0, p.session);
  for (const role of sessRoles) {
    out.push({
      characterId: null,
      role,
      skills: { [ROLE_SKILLS[role].basic]: sm.skill, [ROLE_SKILLS[role].specific]: sm.skill, showmanship: sm.stage, pro_showmanship: sm.stage, dancing: sm.stage, audience: sm.stage },
      mood: 80,
      health: 100,
      present: true,
      instrumentBonus: 0,
      outfitBonus: 0,
      familiarity: Object.fromEntries(songIds.map((id) => [id, SESSION_FAMILIARITY])),
    });
  }
  return out;
}

interface Variant {
  id: string;
  label: string;
  instBonus?: number;
  outfit?: number;
  gearQuality?: number;
  subgenre?: string | null;
  city?: string;
  weekId?: number;
  events?: string[];
  encore?: 'none' | 'safe' | 'bold';
  fx?: number;
  crew?: number;
  press?: number;
  genre?: Genre;
  ordered?: boolean;
}

function simulate(p: Profile, v: Variant, seed: number) {
  const r = rng(seed);
  const n = 8;
  const ids = Array.from({ length: n }, (_, i) => i + 1);
  // Şarkı kaliteleri profil ortalaması etrafında ±8 dağılır; sıra: düz (yazılış sırası) ya da en iyisi sonda
  const res = { q: [] as number[], att: [] as number[], rev: [] as number[], fame: [] as number[], legend: 0 };
  const sessionFee = SESSION_MUSICIAN[p.venue].fee * p.session;
  for (let k = 0; k < N; k++) {
    let qualities = ids.map(() => Math.round(Math.max(1, Math.min(100, p.songQ + (r() * 16 - 8)))));
    if (v.ordered) {
      const s = [...qualities].sort((a, b) => a - b);
      const best = s.pop()!;
      const second = s.pop()!;
      qualities = [second, ...s, best];
    }
    const setlist = ids.map((id, i) => ({ id, quality: qualities[i], tempo: 'mid' as const, subgenre: v.subgenre ?? null }));
    const g = computeGig({
      venue: p.venue,
      fame: p.fame,
      genre: v.genre ?? 'rock',
      city: CITY_BY_ID[v.city ?? 'istanbul'],
      performers: performers(p, { instBonus: v.instBonus, outfit: v.outfit, gearQuality: v.gearQuality }, ids),
      setlist,
      rand: r,
      fxBonus: v.fx ?? 0,
      plan: { events: v.events ?? [], encore: v.encore ?? 'none' },
      press: v.press ?? 20,
      crew: { quality: v.crew ?? 0, attendanceMult: 1 },
      weekId: v.weekId ?? 0,
    });
    res.q.push(g.quality);
    res.att.push(g.attendance);
    res.rev.push(g.revenue - sessionFee);
    res.fame.push(g.fameDelta);
    if (g.legendary) res.legend++;
  }
  return { quality: stats(res.q), attendance: stats(res.att), netRevenue: stats(res.rev), fameDelta: stats(res.fame), legendaryRate: res.legend / N };
}

// Ablasyonlar
const rockScene = 'hard_rock'; // sahnesi Ankara/Hamburg
const niche = 'prog_rock'; // niş (45)
const trendWeek = (() => {
  for (let w = 1; w < 200; w++) if (trendingSubgenre('rock', w) === rockScene) return w;
  return 0;
})();
const VARIANTS: Variant[] = [
  { id: 'base', label: 'Taban (sırasız, olaysız, bissiz)' },
  { id: 'ordered', label: 'Setlist sırası (en iyisi sonda)', ordered: true },
  { id: 'base_ankara', label: 'Taban, Ankara (alt tür kıyası için)', city: 'ankara' },
  { id: 'sub_scene', label: 'Alt tür sahne şehrinde (+3)', subgenre: rockScene, city: 'ankara' },
  { id: 'sub_scene_trend', label: 'Alt tür sahne + moda (+5)', subgenre: rockScene, city: 'ankara', weekId: trendWeek },
  { id: 'sub_niche_big', label: 'Niş alt tür büyük sahnede (−3)', subgenre: niche, city: 'istanbul' },
  { id: 'set_bonus', label: 'Set bonusu (+3 sahne)', outfit: 3, gearQuality: gearQualityBonus(3, 0) },
  { id: 'affinity', label: 'Tür uyumu (+3 enstrüman)', instBonus: 3, gearQuality: gearQualityBonus(0, 3) },
  { id: 'gear_top', label: 'En iyi dükkân enstrümanı (+12) ve kostüm (+10)', instBonus: 12, outfit: 10 },
  { id: 'fx12', label: '6 sis makinesi ($480/konser)', fx: fxQualityBonus(Array(6).fill('fx_smoke')) },
  { id: 'fx_pyro', label: 'Piroteknik ($800)', fx: fxQualityBonus(['fx_pyro']) },
  { id: 'fx_mix', label: 'Sis + konfeti + ışık ($530)', fx: fxQualityBonus(['fx_smoke', 'fx_confetti', 'fx_lights']) },
  { id: 'crew_sound', label: 'Ses teknisyeni (+3)', crew: 3 },
  { id: 'press_hot', label: 'Basın sıcak (60)', press: 60 },
  { id: 'enc_safe', label: 'Güvenli bis', encore: 'safe' },
  { id: 'enc_bold', label: 'Cesur bis', encore: 'bold' },
];

function qualifiedEvents(p: Profile, genre: Genre = 'rock') {
  const perf = performers(p, {}, [1])[0];
  return STAGE_EVENTS.filter((e) => {
    if (!stageEventAllowed(e, genre)) return false;
    const level = e.skill === 'role' ? p.role : e.skill === 'genre' ? perf.skills.genre_rock : (perf.skills[e.skill] ?? -1);
    return level >= e.min;
  });
}

const out: any = { N, profiles: {}, planSweep: {}, genrePopularity: {}, eventEV: {} };
let seed = 1000;
for (const p of PROFILES) {
  const rows: any = {};
  for (const v of VARIANTS) rows[v.id] = { label: v.label, ...simulate(p, v, seed++) };
  const best3 = qualifiedEvents(p)
    .map((e) => ({ e, ev: 0 }))
    .slice(0, 6)
    .map((x) => x.e.id);
  rows.events3 = { label: `3 sahne olayı (${best3.slice(0, 3).join(', ') || 'yok'})`, ...simulate(p, { id: 'ev', label: '', events: best3.slice(0, 3) }, seed++) };
  rows.all_in = {
    label: 'Hepsi: sıra + 3 olay + cesur bis',
    ...simulate(p, { id: 'all', label: '', ordered: true, events: best3.slice(0, 3), encore: 'bold' }, seed++),
  };
  out.profiles[p.id] = { label: p.label, venue: p.venue, fame: p.fame, rows };

  // Plan taraması: nitelikli olayların bütün ≤3'lü alt kümeleri × bis
  const q = qualifiedEvents(p).map((e) => e.id);
  const subsets: string[][] = [[]];
  for (let i = 0; i < q.length; i++) {
    subsets.push([q[i]]);
    for (let j = i + 1; j < q.length; j++) {
      subsets.push([q[i], q[j]]);
      for (let k = j + 1; k < q.length; k++) subsets.push([q[i], q[j], q[k]]);
    }
  }
  const sweep: any[] = [];
  const saveN = N;
  for (const ev of subsets.slice(0, 120)) {
    for (const enc of ['none', 'safe', 'bold'] as const) {
      const s = simulate(p, { id: 'sw', label: '', events: ev, encore: enc, ordered: true }, seed++);
      sweep.push({ events: ev, encore: enc, fame: s.fameDelta.mean, quality: s.quality.mean, fameP10: s.fameDelta.p10 });
    }
  }
  sweep.sort((a, b) => b.fame - a.fame);
  // Strateji: olay sayısı + bis kararı (aynı stratejinin farklı olay kombinasyonları tek sayılır)
  const strategy = (x: { events: string[]; encore: string }) => `${x.events.length} olay + ${x.encore}`;
  const top5 = sweep.slice(0, 5);
  out.planSweep[p.id] = {
    qualifiedEvents: q,
    plans: sweep.length,
    top5,
    top5Strategies: [...new Set(top5.map(strategy))],
    top10Strategies: [...new Set(sweep.slice(0, 10).map(strategy))],
    worst3: sweep.slice(-3),
    noneNone: sweep.find((x) => !x.events.length && x.encore === 'none'),
  };
  void saveN;
}

// Sahne olayının beklenen değeri eşikte ve eşik+25'te
for (const e of STAGE_EVENTS) {
  const ev = (lvl: number, index = 0, venue = 'club') => {
    const o = typeof stageEventOdds === 'function' ? stageEventOdds(e, lvl, index, venue, 70) : { chance: Math.min(0.95, Math.max(0.15, 0.45 + (lvl - e.min) * 0.02)), bonus: e.bonus, penalty: e.penalty };
    return Math.round((o.chance * o.bonus - (1 - o.chance) * o.penalty) * 100) / 100;
  };
  out.eventEV[e.id] = { min: e.min, bonus: e.bonus, penalty: e.penalty, cooldownH: e.cooldownHours, evAtMin: ev(e.min), evAtMinPlus25: ev(e.min + 25), thirdAtMinPlus25: ev(e.min + 25, 2), stadiumAtMinPlus25: ev(e.min + 25, 0, 'stadium') };
}

// Tür popülerliği: aynı profil, aynı şehir, en iyi ve en kötü tür
for (const p of PROFILES.filter((x) => x.venue !== 'bar')) {
  const per: any = {};
  for (const city of ['istanbul', 'berlin', 'nashville', 'london']) {
    const pops = GENRES.map((g) => [g, CITY_BY_ID[city].genrePopularity[g]] as const).sort((a, b) => b[1] - a[1]);
    const best = simulate(p, { id: 'g', label: '', genre: pops[0][0], city }, seed++);
    const worst = simulate(p, { id: 'g', label: '', genre: pops[pops.length - 1][0], city }, seed++);
    per[city] = { best: [pops[0][0], pops[0][1], Math.round(best.attendance.mean), Math.round(best.netRevenue.mean), best.fameDelta.mean], worst: [pops.at(-1)![0], pops.at(-1)![1], Math.round(worst.attendance.mean), Math.round(worst.netRevenue.mean), worst.fameDelta.mean] };
  }
  out.genrePopularity[p.id] = per;
}
void CITIES;
void SUBGENRES;
fs.mkdirSync('scripts/balance/out', { recursive: true });
fs.writeFileSync('scripts/balance/out/mc-gigs.json', JSON.stringify(out, null, 1));
console.log('mc-gigs yazıldı');
