// Boş dünya (madde 10): 0 gerçek oyuncu, N oyun günü. 68 NPC grubu ve sivil NPC'ler (yargıç, aday, muhabir, tüccar)
// dünyayı yaşatıyor mu? Şöhret ve para şişiyor mu, listeler dolu mu, tüccar pazarı nasıl?
// Kullanım: tsx scripts/balance/npc-world.ts <tohum> <gün>
import './lib/env';
import fs from 'node:fs';
import { NPC_BAND_BY_KEY, NPC_TIERS } from '@rifftown/shared';
import { resetWorld, closeWorld, advanceHours, simTick, pool, clock, tickOpts } from './lib/world';
import { stats } from './lib/stats';

const seed = Number(process.argv[2] ?? 1);
const days = Number(process.argv[3] ?? 60);
/** Zamanlayıcı adımı (oyun saati). 2: süreler saat cinsinden olduğu için sonuçları değiştirmez, hesabı yarıya indirir. */
const step = Number(process.argv[4] ?? 2);
await resetWorld(seed * 104729 + 7);
tickOpts.npcEvery = 1;
const t0 = clock.now();
const daily: any[] = [];

async function snapshot(day: number) {
  const fame = (
    await pool.query(
      `SELECT b.npc_key, f.city_id, f.fame FROM bands b JOIN band_fame f ON f.band_id = b.id WHERE b.npc_key IS NOT NULL`,
    )
  ).rows;
  const home: Record<string, number[]> = { rookie: [], local: [], star: [] };
  let outOfBand = 0;
  for (const r of fame) {
    const def = NPC_BAND_BY_KEY[r.npc_key];
    if (!def || def.cityId !== r.city_id) continue;
    home[def.tier].push(Number(r.fame));
    const [lo, hi] = NPC_TIERS[def.tier].fameRange;
    if (r.fame < lo - 0.01 || r.fame > hi + 0.01) outOfBand++;
  }
  const q = async (sql: string, p: unknown[] = []) => (await pool.query(sql, p)).rows[0];
  const gigs = await q(`SELECT count(*) FILTER (WHERE status = 'done')::int AS done, count(*) FILTER (WHERE status = 'cancelled')::int AS cancelled, count(*) FILTER (WHERE status = 'scheduled')::int AS scheduled FROM gigs`);
  const gigQ = await q(`SELECT avg((result->>'quality')::float8) AS q, avg((result->>'attendance')::float8) AS att FROM gigs WHERE status = 'done' AND starts_at > now() - interval '1 day'`);
  const money = await q(`SELECT sum(money)::float8 AS m, max(money)::float8 AS mx FROM characters WHERE npc`);
  const releases = await q(`SELECT count(*) FILTER (WHERE kind = 'single')::int AS singles, count(*) FILTER (WHERE kind = 'album')::int AS albums FROM releases`);
  const week = await q(`SELECT max(id) AS id FROM chart_weeks WHERE status = 'closed'`);
  const charts = week?.id
    ? (
        await pool.query(
          `SELECT scope, kind, count(*)::int AS n FROM chart_entries WHERE week_id = $1 GROUP BY 1, 2`,
          [week.id],
        )
      ).rows
    : [];
  const cityCharts = charts.filter((c: any) => c.scope !== 'world' && c.kind === 'single');
  const listings = await q(`SELECT count(*) FILTER (WHERE c.npc)::int AS npc, count(*) FILTER (WHERE NOT c.npc)::int AS player, avg(l.price)::float8 AS avgPrice FROM listings l JOIN characters c ON c.id = l.seller_id WHERE l.status = 'active'`);
  const offices = await q(`SELECT count(*)::int AS n, count(*) FILTER (WHERE c.npc)::int AS npc FROM elections e LEFT JOIN characters c ON c.id = e.winner_id WHERE e.status = 'closed'`);
  const articles = await q(`SELECT count(*)::int AS n FROM articles`);
  daily.push({
    day,
    fame: Object.fromEntries(Object.entries(home).map(([k, v]) => [k, stats(v)])),
    outOfBand,
    gigs,
    gigQuality: gigQ?.q ? Math.round(gigQ.q * 10) / 10 : null,
    gigAttendance: gigQ?.att ? Math.round(gigQ.att) : null,
    npcMoney: Math.round(money.m ?? 0),
    npcMoneyMax: Math.round(money.mx ?? 0),
    releases,
    lastChartWeek: week?.id ?? null,
    worldSingleEntries: charts.find((c: any) => c.scope === 'world' && c.kind === 'single')?.n ?? 0,
    worldAlbumEntries: charts.find((c: any) => c.scope === 'world' && c.kind === 'album')?.n ?? 0,
    citySingleCharts: { cities: cityCharts.length, avgEntries: cityCharts.length ? Math.round((cityCharts.reduce((s: number, c: any) => s + c.n, 0) / cityCharts.length) * 10) / 10 : 0 },
    listings,
    electionsClosed: offices.n,
    electionsWonByNpc: offices.npc,
    articles: articles.n,
  });
}

for (let h = 0; h < days * 24; h += step) {
  await advanceHours(step);
  await simTick();
  if ((h + step) % 24 === 0) await snapshot((h + step) / 24);
}
const npcStock = (await pool.query(`SELECT l.item_id, l.price FROM listings l JOIN characters c ON c.id = l.seller_id WHERE c.npc AND l.status = 'active'`)).rows;
const out = { seed, days, daily, npcStockSample: npcStock.slice(0, 20), hours: (clock.now() - t0) / 3_600_000 };
fs.mkdirSync('scripts/balance/out', { recursive: true });
fs.writeFileSync(`scripts/balance/out/npcworld-seed-${seed}.json`, JSON.stringify(out));
console.log(`npcworld seed ${seed}: ${days} gün`);
await closeWorld();
