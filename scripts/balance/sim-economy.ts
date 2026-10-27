// Ekonomi simülasyonu: bir tohum, bir dünya, arketip botları, N oyun günü. Sonuç JSON olarak out/ altına yazılır.
// Kullanım: tsx scripts/balance/sim-economy.ts <tohum> <gün> [senaryo]
//   senaryo: economy (varsayılan: bütün arketipler), career (yalnız grinder'lar, uzun süre)
import './lib/env';
import fs from 'node:fs';
import { resetWorld, closeWorld, advanceHours, simTick, track, ledger, resetLedger, pool, clock, moneySupply } from './lib/world';
import { type Bot, makeBot, step, sampleMoney, simHours } from './lib/bots';

const seed = Number(process.argv[2] ?? 1);
const days = Number(process.argv[3] ?? 30);
const scenario = process.argv[4] ?? 'economy';

await resetWorld(seed * 7919 + 13);
resetLedger();
const t0 = clock.now();
const bots: Bot[] = [];
if (scenario === 'economy') {
  bots.push(await makeBot('grinder', 'istanbul', t0));
  bots.push(await makeBot('grinder_solo', 'istanbul', t0));
  bots.push(await makeBot('busker', 'istanbul', t0));
  bots.push(await makeBot('crafter', 'istanbul', t0));
  const a = await makeBot('social', 'istanbul', t0, 'guitar');
  const b = await makeBot('social', 'istanbul', t0, 'violin');
  a.partner = b;
  b.partner = a;
  a.mem.lead = true;
  b.mem.learnSkill = 'guitar';
  bots.push(a, b);
  bots.push(await makeBot('recorder', 'istanbul', t0));
  bots.push(await makeBot('scammer', 'istanbul', t0));
} else if (scenario === 'career') {
  // Uzun kariyer: farklı şehirlerde kiralık müzisyenli ve tek başına grinder
  for (const [arch, city] of [
    ['grinder', 'istanbul'],
    ['grinder', 'berlin'],
    ['grinder_solo', 'izmir'],
    ['recorder', 'london'],
  ] as const)
    bots.push(await makeBot(arch, city, t0));
}
track(bots.map((b) => b.id));
const supply0 = await moneySupply();
const supplySeries: [number, Record<string, number>][] = [[0, supply0]];
const wall0 = performance.now();
const ledgerAt: Record<number, Record<number, Record<string, number>>> = {};

for (let h = 0; h < days * 24; h++) {
  for (const b of bots) {
    try {
      await step(b);
    } catch (e: any) {
      b.errors['exception:' + String(e?.message).slice(0, 60)] = (b.errors['exception:' + String(e?.message).slice(0, 60)] ?? 0) + 1;
    }
  }
  if (h % 6 === 0) await sampleMoney(bots);
  await advanceHours(1);
  await simTick();
  if (h % 24 === 23) supplySeries.push([h + 1, await moneySupply()]);
  if (h + 1 === 72 || h + 1 === 24 * 7) ledgerAt[h + 1] = Object.fromEntries(bots.map((b) => [b.id, Object.fromEntries(ledger.get(b.id) ?? [])]));
}
await sampleMoney(bots);

// ---------------------------------------------------------------- Toplama
const ids = bots.map((b) => b.id);
const actionHours = (
  await pool.query(
    `SELECT character_id, kind, sum((params->>'hours')::float8 * CASE WHEN status = 'done' THEN 1 ELSE COALESCE((result->>'fraction')::float8, 0) END)::float8 AS h, count(*)::int AS n
       FROM actions WHERE character_id = ANY($1::bigint[]) AND status IN ('done', 'cancelled') GROUP BY 1, 2`,
    [ids],
  )
).rows;
const gigs = (
  await pool.query(
    `SELECT g.id, g.band_id, g.city_id, g.location_id, g.starts_at, g.status, g.session_roles, g.plan, g.result, g.created_at,
            (SELECT array_agg(character_id) FROM band_members m WHERE m.band_id = g.band_id) AS members
       FROM gigs g JOIN bands b ON b.id = g.band_id WHERE b.npc_key IS NULL ORDER BY g.starts_at`,
  )
).rows.map((g: any) => ({
  id: g.id,
  bandId: g.band_id,
  members: g.members,
  venue: g.location_id.replace(/^[a-z]+-/, ''),
  city: g.city_id,
  hour: (new Date(g.starts_at).getTime() - t0) / 3_600_000,
  status: g.status,
  session: g.session_roles.length,
  quality: g.result?.quality ?? null,
  attendance: g.result?.attendance ?? null,
  revenue: g.result?.revenue ?? null,
  perMember: g.result?.perMember ?? null,
  fameDelta: g.result?.fameDelta ?? null,
  fame: g.result?.fame ?? null,
  presentCount: g.result?.presentCount ?? null,
  review: g.result?.review ?? null,
  encore: g.result?.encore ?? null,
  flow: g.result?.flow ?? null,
}));
const chars = (await pool.query('SELECT id, money, bank, skills, mood, health, indulgence, addicted_since, convictions FROM characters WHERE id = ANY($1::bigint[])', [ids])).rows;
const bandOf = new Map((await pool.query('SELECT character_id, band_id FROM band_members WHERE character_id = ANY($1::bigint[])', [ids])).rows.map((r: any) => [Number(r.character_id), Number(r.band_id)]));
const fame = (await pool.query('SELECT band_id, city_id, fame FROM band_fame WHERE band_id = ANY($1::bigint[])', [[...bandOf.values()]])).rows;
const releases = (await pool.query('SELECT band_id, kind, quality, released_at, weeks_on_sale, total_units, total_revenue FROM releases WHERE band_id = ANY($1::bigint[])', [[...bandOf.values()]])).rows;
const songs = (await pool.query('SELECT author_id, quality, created_at FROM songs WHERE author_id = ANY($1::bigint[])', [ids])).rows;
const recordings = (await pool.query('SELECT band_id, quality FROM recordings WHERE band_id = ANY($1::bigint[])', [[...bandOf.values()]])).rows;
const scandals = await pool.query('SELECT band_id, kind, count(*)::int AS n FROM scandals WHERE band_id = ANY($1::bigint[]) GROUP BY 1, 2', [[...bandOf.values()]]).then((r) => r.rows).catch(() => []);
const moodlets = await pool.query('SELECT character_id, kind AS id, count(*)::int AS n FROM moodlets WHERE character_id = ANY($1::bigint[]) GROUP BY 1, 2', [ids]).then((r) => r.rows).catch(() => []);
const achievements = (await pool.query('SELECT character_id, count(*)::int AS n FROM character_achievements WHERE character_id = ANY($1::bigint[]) GROUP BY 1', [ids])).rows;
const famDecay = (await pool.query(`SELECT character_id, avg(value)::float8 AS avg, count(*)::int AS n FROM familiarity WHERE character_id = ANY($1::bigint[]) GROUP BY 1`, [ids])).rows;

const out = {
  seed,
  days,
  scenario,
  wallSeconds: Math.round((performance.now() - wall0) / 1000),
  supply: supplySeries,
  bots: bots.map((b) => ({
    id: b.id,
    arch: b.arch,
    city: b.city,
    lead: !!b.mem.lead,
    firsts: b.firsts,
    money: b.money,
    errors: b.errors,
    mem: { waitingCooldown: b.mem.waitingCooldown ?? 0, albumBlocked: b.mem.albumBlocked ?? null },
    ledger: Object.fromEntries(ledger.get(b.id) ?? []),
    ledger72: ledgerAt[72]?.[b.id] ?? null,
    ledger168: ledgerAt[168]?.[b.id] ?? null,
    actionHours: Object.fromEntries(actionHours.filter((a: any) => Number(a.character_id) === b.id).map((a: any) => [a.kind, Math.round(a.h * 10) / 10])),
    actionCounts: Object.fromEntries(actionHours.filter((a: any) => Number(a.character_id) === b.id).map((a: any) => [a.kind, a.n])),
    final: chars.find((c: any) => Number(c.id) === b.id),
    bandId: bandOf.get(b.id) ?? null,
    fame: fame.filter((f: any) => Number(f.band_id) === bandOf.get(b.id)).map((f: any) => [f.city_id, Math.round(f.fame * 100) / 100]),
    releases: releases.filter((r: any) => Number(r.band_id) === bandOf.get(b.id)),
    recordings: recordings.filter((r: any) => Number(r.band_id) === bandOf.get(b.id)).map((r: any) => r.quality),
    songs: songs.filter((s: any) => Number(s.author_id) === b.id).map((s: any) => [Math.round((new Date(s.created_at).getTime() - t0) / 3_600_000), s.quality]),
    scandals: scandals.filter((s: any) => Number(s.band_id) === bandOf.get(b.id)),
    moodlets: moodlets.filter((m: any) => Number(m.character_id) === b.id).map((m: any) => [m.id, m.n]),
    achievements: achievements.find((a: any) => Number(a.character_id) === b.id)?.n ?? 0,
    familiarity: famDecay.find((f: any) => Number(f.character_id) === b.id) ?? null,
  })),
  gigs,
  hours: simHours(t0),
};
fs.mkdirSync('scripts/balance/out', { recursive: true });
fs.writeFileSync(`scripts/balance/out/${scenario}-seed-${seed}.json`, JSON.stringify(out));
console.log(`${scenario} seed ${seed}: ${days} gün, ${out.wallSeconds} sn`);
await closeWorld();
