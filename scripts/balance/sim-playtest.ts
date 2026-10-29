// Playtest'in ilk hafta senaryosu (PLAYTEST_RAPORU.md "İlk hafta", bot.mjs): üç yeni oyuncudan kurulan gerçek grup
// (Ada gitar ve lider, Bora vokal, Cem davul) ile kiralık müzisyenli tek oyuncu (Hale vokal), 9,5 oyun günü, İstanbul.
// Bot mantığı playtest'teki bot.mjs'nin aynısı; sanal saatle, GAME_SPEED=1, tohumlu ve tekrarlanabilir.
// Kullanım: tsx scripts/balance/sim-playtest.ts [tohum sayısı=8] [gün=9.5]  → scripts/balance/out/playtest.json
import './lib/env';
import fs from 'node:fs';
import { CORE_ROLES } from '@rifftown/shared';
import { resetWorld, closeWorld, advanceHours, simTick, pool, clock, type Client } from './lib/world';
import { makeBot, type Bot } from './lib/bots';

const SEEDS = Number(process.argv[2] ?? 8);
const DAYS = Number(process.argv[3] ?? 9.5);
const H = 3_600_000;

interface PB {
  bot: Bot;
  tag: string;
  solo: boolean;
}

async function claimRewards(c: Client) {
  for (const m of (await c.get('/missions')).body?.missions ?? []) if (m.progress >= m.target && !m.claimed) await c.post(`/missions/${m.id}/claim`);
  for (const s of (await c.get('/tutorial')).body?.steps ?? []) if (s.done && !s.claimed) await c.post(`/tutorial/${s.id}/claim`);
}

/** bot.mjs'nin bir döngüsü: boştaysa bir karar; konser ayarlarsa aynı adımda bir karar daha */
async function step(p: PB) {
  const c = p.bot.c;
  for (let guard = 0; guard < 4; guard++) {
    const me = (await c.get('/me')).body;
    const ch = me.character;
    if (!ch || me.action) return;
    const city = ch.cityId;
    await claimRewards(c);
    let band = (await c.get('/bands/mine')).body.band;
    if (band) {
      const mine = ((await c.get('/songs/mine')).body.songs ?? []).filter((x: any) => !x.inBand && x.authorId === ch.id);
      for (const x of mine) await c.post('/bands/mine/songs', { songId: x.id });
      if (mine.length) band = (await c.get('/bands/mine')).body.band;
    }
    let a: Record<string, unknown> | null = null;
    if (ch.health < 40) a = { kind: 'treat', locationId: `${city}-hospital`, hours: ch.money >= 160 ? 4 : ch.money >= 40 ? 1 : 0 };
    if (a && !a.hours) a = { kind: 'rest', hours: 8 };
    if (!a && (ch.energy < 35 || ch.mood < 30)) a = { kind: 'rest', hours: ch.energy < 20 ? 8 : 4 };
    if (!a && !band) {
      await c.post('/bands', { name: `${ch.name.split(' ')[0]} ve Dostlari`.slice(0, 30), genre: p.bot.genre, role: ch.mainInstrument });
      continue;
    }
    if (!a) {
      const isLeader = band.leaderId === ch.id;
      const songs = band.songs;
      if (isLeader && band.upcomingGigs.length < 1 && songs.length) {
        const fame = band.fame[city] ?? 0;
        const venue = fame >= 45 ? 'hall' : fame >= 15 ? 'club' : 'bar';
        const have = new Set(band.members.filter((m: any) => m.cityId === city).map((m: any) => m.role));
        const session = (['vocals', 'guitar', 'bass', 'drums'] as const).filter((r) => !have.has(r));
        const setlist = [...songs].sort((x: any, y: any) => y.quality - x.quality).slice(0, 6).map((s: any) => s.id);
        const r = await c.post('/gigs', { locationId: `${city}-${venue}`, inHours: 6, setlist, sessionRoles: session });
        if (r.status === 200) continue;
      }
      if (ch.money < 60) a = { kind: 'work', locationId: `${city}-work`, hours: 4 };
      else if (isLeader && songs.length < 6) a = { kind: 'write_song', title: `Sarki ${songs.length + 1}`, genre: band.genre };
      else if (songs.length && ch.money >= 60) {
        const mine = band.members.find((m: any) => m.characterId === ch.id);
        const s = [...songs].sort((x: any, y: any) => (mine.familiarity[x.id] ?? 0) - (mine.familiarity[y.id] ?? 0))[0];
        a = { kind: 'rehearse', songId: s.id, hours: 2, locationId: `${city}-studio` };
      } else a = { kind: 'busk', role: ch.mainInstrument, hours: 4, locationId: `${city}-park` };
    }
    const r = await c.post('/actions', a);
    if (r.status !== 200) await c.post('/actions', { kind: 'rest', hours: 2 });
    return;
  }
}

async function runSeed(seed: number) {
  await resetWorld(seed * 104729 + 7);
  const t0 = clock.now();
  const ada = await makeBot('grinder', 'istanbul', t0, 'guitar', 'rock');
  const bora = await makeBot('grinder', 'istanbul', t0, 'vocals', 'pop');
  const cem = await makeBot('grinder', 'istanbul', t0, 'drums', 'rock');
  const hale = await makeBot('grinder_solo', 'istanbul', t0, 'vocals', 'pop');
  // Gerçek grup: Ada kurar, Bora ve Cem katılır (playtest'te elle kurulmuştu)
  await ada.c.post('/bands', { name: 'Ada ve Dostlari', genre: 'rock', role: 'guitar' });
  for (const [m, role] of [[bora, 'vocals'], [cem, 'drums']] as const) {
    await ada.c.post('/bands/mine/invites', { name: m.name, role });
    const inv = (await pool.query(`SELECT id FROM band_invites WHERE character_id = $1 AND status = 'pending'`, [m.id])).rows[0];
    await m.c.post(`/invites/${inv.id}/accept`);
  }
  const ps: PB[] = [
    { bot: ada, tag: 'ada', solo: false },
    { bot: bora, tag: 'bora', solo: false },
    { bot: cem, tag: 'cem', solo: false },
    { bot: hale, tag: 'hale', solo: true },
  ];
  const hours = Math.round(DAYS * 24);
  for (let h = 0; h < hours; h++) {
    for (const p of ps) await step(p);
    await advanceHours(1);
    await simTick();
  }
  // Sonuç: ham değerler veritabanından
  const out: Record<string, any> = {};
  for (const p of ps) {
    const ch = (await pool.query('SELECT id, money, bank, mood, energy, skills FROM characters WHERE id = $1', [p.bot.id])).rows[0];
    const bm = (await pool.query('SELECT band_id FROM band_members WHERE character_id = $1', [p.bot.id])).rows[0];
    const bandId = bm ? Number(bm.band_id) : null;
    const gigs = bandId
      ? (await pool.query(`SELECT result, session_roles FROM gigs WHERE band_id = $1 AND status = 'done'`, [bandId])).rows
      : [];
    const fame = bandId ? Number((await pool.query(`SELECT fame FROM band_fame WHERE band_id = $1 AND city_id = 'istanbul'`, [bandId])).rows[0]?.fame ?? 0) : 0;
    const earned = (await pool.query(`SELECT coalesce(sum((g.result->>'perMember')::int), 0)::int AS n FROM gig_performers gp JOIN gigs g ON g.id = gp.gig_id WHERE gp.character_id = $1 AND gp.present AND g.status = 'done'`, [p.bot.id])).rows[0].n;
    if (process.env.REVIEWS_OUT && bandId) {
      const rv = (await pool.query(`SELECT g.result->'review'->>'tr' AS tr, l.loc FROM gigs g, LATERAL (SELECT g.location_id AS loc) l WHERE g.band_id = $1 AND g.status = 'done' ORDER BY g.starts_at`, [bandId])).rows;
      fs.appendFileSync(process.env.REVIEWS_OUT, rv.map((r: any) => JSON.stringify({ seed, who: p.tag, loc: r.loc, tr: r.tr })).join('\n') + '\n');
    }
    out[p.tag] = {
      solo: p.solo,
      money: Number(ch.money) + Number(ch.bank),
      gigs: gigs.length,
      avgQuality: gigs.length ? gigs.reduce((s: number, g: any) => s + Number(g.result?.quality ?? 0), 0) / gigs.length : 0,
      avgRevenue: gigs.length ? gigs.reduce((s: number, g: any) => s + Number(g.result?.revenue ?? 0), 0) / gigs.length : 0,
      gigIncome: earned,
      fame,
      clubAt: null as number | null,
      skillMain: Number(ch.skills[p.bot.instrument] ?? 0),
    };
  }
  return out;
}

const all: any[] = [];
for (let s = 1; s <= SEEDS; s++) {
  const r = await runSeed(s);
  all.push(r);
  console.log(`tohum ${s}`, JSON.stringify(Object.fromEntries(Object.entries(r).map(([k, v]: [string, any]) => [k, { $: v.money, konser: v.gigs, q: Math.round(v.avgQuality * 10) / 10, sohret: Math.round(v.fame * 10) / 10, konserGeliri: v.gigIncome }]))));
}
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
const summary = {
  seeds: SEEDS,
  days: DAYS,
  band: {
    gigs: mean(all.map((r) => r.ada.gigs)),
    quality: mean(all.map((r) => r.ada.avgQuality)),
    fame: mean(all.map((r) => r.ada.fame)),
    moneyPerMember: mean(all.flatMap((r) => [r.ada.money, r.bora.money, r.cem.money])),
    gigIncomePerMember: mean(all.flatMap((r) => [r.ada.gigIncome, r.bora.gigIncome, r.cem.gigIncome])),
    moneyByMember: { ada: mean(all.map((r) => r.ada.money)), bora: mean(all.map((r) => r.bora.money)), cem: mean(all.map((r) => r.cem.money)) },
  },
  solo: {
    gigs: mean(all.map((r) => r.hale.gigs)),
    quality: mean(all.map((r) => r.hale.avgQuality)),
    fame: mean(all.map((r) => r.hale.fame)),
    money: mean(all.map((r) => r.hale.money)),
    gigIncome: mean(all.map((r) => r.hale.gigIncome)),
  },
};
fs.mkdirSync('scripts/balance/out', { recursive: true });
fs.writeFileSync(`scripts/balance/out/playtest${process.env.OUT_TAG ? '-' + process.env.OUT_TAG : ''}.json`, JSON.stringify({ summary, runs: all }, null, 1));
console.log(JSON.stringify(summary, null, 1));
await closeWorld();
void CORE_ROLES;
void H;
