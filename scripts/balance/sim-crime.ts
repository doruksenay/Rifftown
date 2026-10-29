// Yankesicilik ölçümü (playtest Y-4): polis oyuncusu olmayan şehirde, gerçek hızda (sanal saat) N gün.
// Profiller: yeni karakter (sokak becerisi yok) ve becerili hırsız (sokak kurnazlığı 40, gizlilik 40) sürekli 1 saatlik
// yankesicilik yapar (cezaevindeyse dinlenir, enerjisi azsa dinlenir); karşılaştırma için 4 saatlik mesai yapan oyuncu.
// Ölçülen: oyun saati başına net para, suç sayısı, yakalanma, faili meçhul kalan suç ve çözülen suç.
// Kullanım: tsx scripts/balance/sim-crime.ts [tohum=4] [gün=5]
import './lib/env';
import fs from 'node:fs';
import { resetWorld, closeWorld, advanceHours, simTick, pool, newPlayer, type Client } from './lib/world';

const SEEDS = Number(process.argv[2] ?? 4);
const DAYS = Number(process.argv[3] ?? 5);

type Profile = 'thief_new' | 'thief_skilled' | 'worker';

async function runSeed(seed: number) {
  await resetWorld(seed * 977 + 11);
  const bots: { id: number; c: Client; p: Profile; start: number }[] = [];
  for (const p of ['thief_new', 'thief_skilled', 'worker'] as Profile[]) {
    const b = await newPlayer({ cityId: 'istanbul' });
    if (p === 'thief_skilled') await pool.query(`UPDATE characters SET skills = skills || '{"street_smarts": 40, "stealth": 40}'::jsonb WHERE id = $1`, [b.id]);
    bots.push({ id: b.id, c: b.c, p, start: 500 });
  }
  const at: Record<string, Record<number, number>> = {};
  for (let h = 0; h < DAYS * 24; h++) {
    if (h === 6 || h === 24) {
      for (const b of bots) {
        const m = (await pool.query('SELECT money + bank AS m FROM characters WHERE id = $1', [b.id])).rows[0].m;
        (at[b.p] ??= {})[h] = Number(m) - b.start;
      }
    }
    for (const b of bots) {
      const me = (await b.c.get('/me')).body;
      if (me.action) continue;
      const ch = me.character;
      if (ch.jailedUntil && new Date(ch.jailedUntil).getTime() > Date.now()) {
        await b.c.post('/actions', { kind: 'rest', hours: 1 });
        continue;
      }
      if (ch.energy < 30 || ch.mood < 25 || ch.health < 40) {
        await b.c.post('/actions', { kind: 'rest', hours: 4 });
        continue;
      }
      if (b.p === 'worker') await b.c.post('/actions', { kind: 'work', locationId: 'istanbul-work', hours: 4 });
      else {
        const r = await b.c.post('/actions', { kind: 'crime', crime: 'pickpocket', locationId: 'istanbul-park' });
        if (r.status !== 200) await b.c.post('/actions', { kind: 'rest', hours: 1 });
      }
    }
    await advanceHours(1);
    await simTick();
  }
  const out: Record<string, any> = {};
  for (const b of bots) {
    const ch = (await pool.query('SELECT money, bank, convictions FROM characters WHERE id = $1', [b.id])).rows[0];
    const cr = (await pool.query(`SELECT status, count(*)::int AS n, coalesce(sum(loot), 0)::int AS loot FROM crimes WHERE character_id = $1 GROUP BY status`, [b.id])).rows;
    const by = Object.fromEntries(cr.map((r: any) => [r.status, { n: r.n, loot: r.loot }]));
    out[b.p] = {
      netPerHour: Math.round(((Number(ch.money) + Number(ch.bank) - b.start) / (DAYS * 24)) * 100) / 100,
      net: Number(ch.money) + Number(ch.bank) - b.start,
      convictions: Number(ch.convictions),
      net6h: at[b.p]?.[6] ?? 0,
      net24h: at[b.p]?.[24] ?? 0,
      crimes: by,
    };
  }
  return out;
}

const all: any[] = [];
for (let s = 1; s <= SEEDS; s++) {
  const r = await runSeed(s);
  all.push(r);
  console.log(`tohum ${s}`, JSON.stringify(r));
}
const mean = (xs: number[]) => Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100;
const summary = Object.fromEntries(
  (['thief_new', 'thief_skilled', 'worker'] as Profile[]).map((p) => [
    p,
    {
      netPerHour: mean(all.map((r) => r[p].netPerHour)),
      net6h: mean(all.map((r) => r[p].net6h)),
      net24h: mean(all.map((r) => r[p].net24h)),
      convictions: mean(all.map((r) => r[p].convictions)),
      unsolved: mean(all.map((r) => r[p].crimes.unsolved?.n ?? 0)),
      unsolvedLootKept: mean(all.map((r) => r[p].crimes.unsolved?.loot ?? 0)),
      solved: mean(all.map((r) => (r[p].crimes.solved?.n ?? 0) + (r[p].crimes.recovered?.n ?? 0))),
      caught: mean(all.map((r) => r[p].crimes.caught?.n ?? 0)),
    },
  ]),
);
console.log(JSON.stringify({ days: DAYS, seeds: SEEDS, summary }, null, 1));
fs.mkdirSync('scripts/balance/out', { recursive: true });
fs.writeFileSync(`scripts/balance/out/playtest-crime${process.env.OUT_TAG ? '-' + process.env.OUT_TAG : ''}.json`, JSON.stringify({ summary, all }, null, 1));
await closeWorld();
