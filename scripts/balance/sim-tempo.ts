// İlk günlerin temposu (playtest Y-3): gerçek hızda (sanal saat) yeni oyuncu.
// A) "İlk dört iş": şarkı (2 sa), 8 saat mesai, kitap, grup, 4 saat prova, bar konseri (3 kiralık). Ardından görünen
//    ruh hâli, enerji, XP ve para; ayrıca 8 saatlik mesainin tek başına etkisi.
// B) "İlk iki gün": playtest botunun kuralıyla (enerji < 35 ya da ruh hâli < 30 ise dinlen) 48 oyun saati; dinlenmeye
//    giden saat, üretken saat, en düşük ruh hâli, para ve hiçbir şey başlatamadığı (kilitlendiği) saat sayısı.
// Kullanım: tsx scripts/balance/sim-tempo.ts [tohum=4]
import './lib/env';
import fs from 'node:fs';
import { resetWorld, closeWorld, advanceHours, simTick, pool, newPlayer, type Client } from './lib/world';
import { wellbeingOf } from '../../server/src/game/wellbeing';

const SEEDS = Number(process.argv[2] ?? 4);

async function state(id: number) {
  const ch = (await pool.query('SELECT * FROM characters WHERE id = $1', [id])).rows[0];
  const w = await wellbeingOf(pool, ch);
  const xp = Number((await pool.query('SELECT coalesce(sum(amount), 0)::float8 AS n FROM xp_log WHERE character_id = $1', [id]).catch(() => ({ rows: [{ n: Number(ch.xp ?? 0) }] }))).rows[0].n);
  return { mood: Math.round(w.mood * 10) / 10, energy: Math.round(w.energy * 10) / 10, health: Math.round(ch.health * 10) / 10, money: Number(ch.money), xp: Math.round(Number(ch.xp ?? xp) * 10) / 10 };
}
async function waitIdle(id: number, maxH = 30) {
  for (let i = 0; i < maxH * 4; i++) {
    const a = (await pool.query(`SELECT 1 FROM actions WHERE character_id = $1 AND status = 'active'`, [id])).rows.length;
    const g = (await pool.query(`SELECT 1 FROM gigs g JOIN band_members m ON m.band_id = g.band_id WHERE m.character_id = $1 AND g.status = 'scheduled'`, [id])).rows.length;
    if (!a && !g) return;
    await advanceHours(0.25);
    await simTick();
  }
}
const act = async (c: Client, body: Record<string, unknown>) => (await c.post('/actions', body)).status === 200;

async function firstFour(seed: number) {
  await resetWorld(seed * 7 + 3);
  const p = await newPlayer({ instrument: 'guitar' });
  const c = p.c;
  await act(c, { kind: 'write_song', title: 'Ilk', genre: 'rock' });
  await waitIdle(p.id);
  const beforeWork = await state(p.id);
  await act(c, { kind: 'work', locationId: 'istanbul-work', hours: 8 });
  await waitIdle(p.id);
  const afterWork = await state(p.id);
  await c.post('/skills/learn', { skillId: 'genre_pop', locationId: 'istanbul-bookstore' });
  const band = (await c.post('/bands', { name: 'Tempo', genre: 'rock', role: 'guitar' })).body.band;
  const rh = await act(c, { kind: 'rehearse', songId: band.songs[0].id, hours: 4, locationId: 'istanbul-studio' });
  await waitIdle(p.id);
  const gig = await c.post('/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: band.songs.map((s: any) => s.id), sessionRoles: ['vocals', 'bass', 'drums'] });
  await waitIdle(p.id);
  const end = await state(p.id);
  return {
    work8h: { moodDelta: afterWork.mood - beforeWork.mood, energyDelta: afterWork.energy - beforeWork.energy, pay: afterWork.money - beforeWork.money, xp: afterWork.xp - beforeWork.xp },
    rehearsed: rh,
    gigBooked: gig.status === 200,
    end,
  };
}

async function firstTwoDays(seed: number) {
  await resetWorld(seed * 13 + 5);
  const p = await newPlayer({ instrument: 'guitar' });
  const c = p.c;
  let restHours = 0;
  let productive = 0;
  let stuck = 0;
  let minMood = 100;
  let band: any = null;
  for (let h = 0; h < 48; h++) {
    const busy = (await pool.query(`SELECT 1 FROM actions WHERE character_id = $1 AND status = 'active'`, [p.id])).rows.length;
    if (!busy) {
      const me = (await c.get('/me')).body.character;
      const s = await state(p.id);
      minMood = Math.min(minMood, s.mood);
      if (!band) band = (await c.post('/bands', { name: 'Iki Gun', genre: 'rock', role: 'guitar' })).body.band ?? (await c.get('/bands/mine')).body.band;
      band = (await c.get('/bands/mine')).body.band;
      let started = false;
      if (me.energy < 35 || me.mood < 30) {
        started = await act(c, { kind: 'rest', hours: me.energy < 20 ? 8 : 4 });
        if (started) restHours += me.energy < 20 ? 8 : 4;
      } else {
        const tries: Record<string, unknown>[] = [];
        if (band?.songs?.length < 2) tries.push({ kind: 'write_song', title: `S${h}`, genre: 'rock' });
        if (band?.songs?.length && !band.upcomingGigs?.length) {
          const g = await c.post('/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: band.songs.map((x: any) => x.id), sessionRoles: ['vocals', 'bass', 'drums'] });
          void g;
        }
        if (me.money < 100) tries.push({ kind: 'work', locationId: 'istanbul-work', hours: 4 });
        if (band?.songs?.length) tries.push({ kind: 'rehearse', songId: band.songs[0].id, hours: 2, locationId: 'istanbul-studio' });
        tries.push({ kind: 'work', locationId: 'istanbul-work', hours: 4 });
        for (const t of tries) {
          if (await act(c, t)) {
            started = true;
            productive += Number(t.hours ?? 2);
            break;
          }
        }
        if (!started && (await act(c, { kind: 'rest', hours: 2 }))) {
          started = true;
          restHours += 2;
        }
      }
      if (!started) stuck++;
    }
    await advanceHours(1);
    await simTick();
  }
  const s = await state(p.id);
  return { restHours, productiveHours: productive, stuckHours: stuck, minMood, end: s };
}

const A: any[] = [];
const B: any[] = [];
for (let s = 1; s <= SEEDS; s++) {
  A.push(await firstFour(s));
  B.push(await firstTwoDays(s));
  console.log(`tohum ${s}`, JSON.stringify(A.at(-1)), JSON.stringify(B.at(-1)));
}
const mean = (xs: number[]) => Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10;
const summary = {
  ilkDortIs: {
    work8h: { moodDelta: mean(A.map((x) => x.work8h.moodDelta)), energyDelta: mean(A.map((x) => x.work8h.energyDelta)), pay: mean(A.map((x) => x.work8h.pay)), xp: mean(A.map((x) => x.work8h.xp)) },
    sonra: { mood: mean(A.map((x) => x.end.mood)), energy: mean(A.map((x) => x.end.energy)), xp: mean(A.map((x) => x.end.xp)), money: mean(A.map((x) => x.end.money)) },
  },
  ilkIkiGun: {
    restHours: mean(B.map((x) => x.restHours)),
    productiveHours: mean(B.map((x) => x.productiveHours)),
    stuckHours: mean(B.map((x) => x.stuckHours)),
    minMood: mean(B.map((x) => x.minMood)),
    money: mean(B.map((x) => x.end.money)),
    xp: mean(B.map((x) => x.end.xp)),
  },
};
console.log(JSON.stringify(summary, null, 1));
fs.mkdirSync('scripts/balance/out', { recursive: true });
fs.writeFileSync(`scripts/balance/out/playtest-tempo${process.env.OUT_TAG ? '-' + process.env.OUT_TAG : ''}.json`, JSON.stringify({ summary, A, B }, null, 1));
await closeWorld();
