// Bütün çıktıları toplar: out/summary.json (rapordaki tabloların kaynağı)
import fs from 'node:fs';
import { SESSION_MUSICIAN } from '@rifftown/shared';
import { stats } from './lib/stats';

const OUT = 'scripts/balance/out';
const read = (f: string) => (fs.existsSync(`${OUT}/${f}`) ? JSON.parse(fs.readFileSync(`${OUT}/${f}`, 'utf8')) : null);
const files = (prefix: string) =>
  fs
    .readdirSync(OUT)
    .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(`${OUT}/${f}`, 'utf8')));

const moneyAt = (b: any, h: number) => {
  let best: number | null = null;
  for (const [hh, m] of b.money) if (hh <= h) best = m;
  return best ?? NaN;
};
const mean = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : NaN);

function economy(scenario: string, horizonH: number) {
  const runs = files(`${scenario}-seed-`);
  const byArch = new Map<string, any[]>();
  for (const run of runs) for (const b of run.bots) {
    const key = b.arch === 'social' ? (b.lead ? 'social_lead' : 'social_student') : scenario === 'career' || scenario === 'skilled' ? `${b.arch}@${b.city}` : b.arch;
    if (!byArch.has(key)) byArch.set(key, []);
    byArch.get(key)!.push({ ...b, run });
  }
  const out: any = { seeds: runs.length, archetypes: {} };
  for (const [arch, bots] of byArch) {
    const checkpoints = [24, 72, 168, 336, 720, 1440, 2160].filter((h) => h <= horizonH);
    const money = Object.fromEntries(checkpoints.map((h) => [h, stats(bots.map((b) => moneyAt(b, h)))]));
    const cats = new Set<string>();
    for (const b of bots) for (const k of Object.keys(b.ledger)) cats.add(k);
    const ledger = Object.fromEntries([...cats].sort().map((k) => [k, mean(bots.map((b) => b.ledger[k] ?? 0))]));
    const cats72 = new Set<string>();
    for (const b of bots) for (const k of Object.keys(b.ledger72 ?? {})) cats72.add(k);
    const with72 = bots.filter((b) => b.ledger72);
    const ledger72 = with72.length ? Object.fromEntries([...cats72].sort().map((k) => [k, mean(with72.map((b) => b.ledger72[k] ?? 0))])) : null;
    const firstKeys = new Set<string>();
    for (const b of bots) for (const k of Object.keys(b.firsts)) firstKeys.add(k);
    const firsts = Object.fromEntries(
      [...firstKeys].sort().map((k) => {
        const hs = bots.map((b) => b.firsts[k]).filter((x: any) => x !== undefined);
        return [k, { reached: `${hs.length}/${bots.length}`, hours: stats(hs) }];
      }),
    );
    // Konserler: botun grubunun konserleri
    const gigs = bots.flatMap((b) => b.run.gigs.filter((g: any) => g.bandId === b.bandId && g.status === 'done').map((g: any) => ({ ...g, arch })));
    const byVenue: any = {};
    for (const v of ['bar', 'club', 'hall', 'stadium']) {
      const gs = gigs.filter((g: any) => g.venue === v || (v === 'bar' && /^biz/.test(g.venue)));
      if (!gs.length) continue;
      const fee = SESSION_MUSICIAN[v as 'bar'].fee;
      byVenue[v] = {
        n: gs.length,
        quality: stats(gs.map((g: any) => g.quality)),
        attendance: stats(gs.map((g: any) => g.attendance)),
        revenue: stats(gs.map((g: any) => g.revenue)),
        netOfSession: stats(gs.map((g: any) => g.revenue - g.session * fee)),
        fameDelta: stats(gs.map((g: any) => g.fameDelta)),
        noShow: gs.filter((g: any) => g.presentCount === 0).length,
      };
    }
    const kinds = new Set<string>();
    for (const b of bots) for (const k of Object.keys(b.actionHours)) kinds.add(k);
    const hours = Object.fromEntries([...kinds].sort().map((k) => [k, mean(bots.map((b) => b.actionHours[k] ?? 0))]));
    const busyH = Object.values(hours).reduce((a: number, b: any) => a + b, 0);
    const skills = (id: string) => stats(bots.map((b) => b.final?.skills?.[id] ?? 0));
    // Giderin gelire oranı (para defterinin eksi kalemleri ÷ artı kalemleri): bütün dönem ve 7. günden sonrası (orta oyun)
    const ratio = (pick: (b: any) => Record<string, number>) =>
      stats(
        bots.map((b) => {
          const l = pick(b);
          const inc = Object.values(l).filter((v) => v > 0).reduce((a, v) => a + v, 0);
          const exp = -Object.values(l).filter((v) => v < 0).reduce((a, v) => a + v, 0);
          return inc > 0 ? Math.round((exp / inc) * 1000) / 10 : NaN;
        }),
      );
    const after7 = (b: any) => {
      const l: Record<string, number> = {};
      for (const k of new Set([...Object.keys(b.ledger), ...Object.keys(b.ledger168 ?? {})])) l[k] = (b.ledger[k] ?? 0) - (b.ledger168?.[k] ?? 0);
      return l;
    };
    out.archetypes[arch] = {
      n: bots.length,
      expenseToIncomePct: ratio((b) => b.ledger),
      expenseToIncomeAfterDay7Pct: ratio(after7),
      money,
      perDay: stats(bots.map((b) => (moneyAt(b, horizonH) - 500) / (horizonH / 24))),
      ledger,
      ledger72,
      firsts,
      gigs: { total: gigs.length, perBot: mean(bots.map((b) => b.run.gigs.filter((g: any) => g.bandId === b.bandId && g.status === 'done').length)), byVenue },
      hours,
      idleHours: Math.round((horizonH - busyH) * 10) / 10,
      restShare: Math.round(((hours.rest ?? 0) / horizonH) * 1000) / 10,
      skills: { guitar: skills('guitar'), showmanship: skills('showmanship'), composing: skills('composing'), lyrics: skills('lyrics'), craftsmanship: skills('craftsmanship') },
      homeFame: stats(bots.map((b) => (b.fame.find((f: any) => f[0] === b.city) ?? [0, 0])[1])),
      releases: bots.flatMap((b) => b.releases.map((r: any) => ({ kind: r.kind, quality: r.quality, units: r.total_units, revenue: r.total_revenue }))).slice(0, 60),
      releaseRevenue: stats(bots.map((b) => b.releases.reduce((a: number, r: any) => a + r.total_revenue, 0))),
      waitingCooldownAttempts: stats(bots.map((b) => b.mem?.waitingCooldown ?? 0)),
      scandals: bots.flatMap((b) => b.scandals).reduce((m: any, s: any) => ((m[s.kind] = (m[s.kind] ?? 0) + s.n), m), {}),
      convictions: stats(bots.map((b) => b.final?.convictions ?? 0)),
      familiarityAvg: stats(bots.filter((b) => b.familiarity).map((b) => b.familiarity.avg)),
      errors: bots.flatMap((b) => Object.entries(b.errors)).reduce((m: any, [k, v]: any) => ((m[k] = (m[k] ?? 0) + v), m), {}),
    };
  }
  // Para arzı
  const supply = runs.map((r) => r.supply);
  if (supply.length) {
    const days = supply[0].map((x: any) => x[0]);
    out.supply = days
      .filter((_: any, i: number) => i % 5 === 0 || i === days.length - 1)
      .map((h: number) => {
        const at = supply.map((s: any) => s.find((x: any) => x[0] === h)?.[1]).filter(Boolean);
        return { hour: h, playerCash: mean(at.map((x: any) => x.playerCash + (x.playerBank ?? 0))), npcCash: mean(at.map((x: any) => x.npcCash ?? 0)) };
      });
  }
  return out;
}

function npcWorld() {
  const runs = files('npcworld-seed-');
  if (!runs.length) return null;
  const days = [1, 7, 15, 30, 45, 60];
  return {
    seeds: runs.length,
    byDay: days.map((d) => {
      const at = runs.map((r) => r.daily.find((x: any) => x.day === d)).filter(Boolean);
      return {
        day: d,
        fameRookie: mean(at.map((x: any) => x.fame.rookie.mean)),
        fameLocal: mean(at.map((x: any) => x.fame.local.mean)),
        fameStar: mean(at.map((x: any) => x.fame.star.mean)),
        fameStarMax: Math.max(...at.map((x: any) => x.fame.star.max)),
        outOfBand: mean(at.map((x: any) => x.outOfBand)),
        gigsDone: mean(at.map((x: any) => x.gigs.done)),
        gigsCancelled: mean(at.map((x: any) => x.gigs.cancelled)),
        gigQuality: mean(at.map((x: any) => x.gigQuality ?? 0)),
        npcMoney: mean(at.map((x: any) => x.npcMoney)),
        singles: mean(at.map((x: any) => x.releases.singles)),
        albums: mean(at.map((x: any) => x.releases.albums)),
        worldSingleEntries: mean(at.map((x: any) => x.worldSingleEntries)),
        worldAlbumEntries: mean(at.map((x: any) => x.worldAlbumEntries)),
        citySingleChartsFilled: mean(at.map((x: any) => x.citySingleCharts.cities)),
        citySingleAvgEntries: mean(at.map((x: any) => x.citySingleCharts.avgEntries)),
        npcListings: mean(at.map((x: any) => x.listings.npc)),
        npcListingAvgPrice: mean(at.map((x: any) => x.listings.avgprice ?? 0)),
        electionsClosed: mean(at.map((x: any) => x.electionsClosed)),
        electionsWonByNpc: mean(at.map((x: any) => x.electionsWonByNpc)),
        articles: mean(at.map((x: any) => x.articles)),
      };
    }),
  };
}

const exploits = fs.existsSync(`${OUT}/exploits`)
  ? Object.fromEntries(fs.readdirSync(`${OUT}/exploits`).filter((f) => f.endsWith('.json')).map((f) => [f.replace('.json', ''), JSON.parse(fs.readFileSync(`${OUT}/exploits/${f}`, 'utf8'))]))
  : {};
const summary = {
  generated: new Date().toISOString(),
  economy: economy('economy', 720),
  career: economy('career', 2160),
  skilled: economy('skilled', 2160),
  npcWorld: npcWorld(),
  gigsMC: read('mc-gigs.json'),
  family: read('mc-family.json'),
  skills: read('mc-skills.json'),
  releases: read('mc-releases.json'),
  texts: read('texts.json'),
  exploits,
};
fs.writeFileSync(`${OUT}/summary.json`, JSON.stringify(summary, null, 1));
console.log('summary.json yazıldı');
