// İlk saat ölçümü (playtest Y-2): gerçek hızda (GAME_SPEED=1, sanal saat) yalnızca rehber kartını izleyen yeni oyuncu.
// Her dakika kartın gösterdiği adımı yapar (ödül hazırsa alır, değilse "Git"in yaptığı işi), yapamıyorsa bekler.
// Ölçülen: ilk 10 dakikada, ilk saatte, 24 ve 72 saatte alınan rehber ödülleri, kaç kez "yapacak bir şey yok"
// (kart beklemede) kalındığı ve para. Kullanım: tsx scripts/balance/sim-first-hour.ts [tohum=3]
import './lib/env';
import fs from 'node:fs';
import { resetWorld, closeWorld, advanceHours, simTick, pool, clock, newPlayer, type Client } from './lib/world';

const SEEDS = Number(process.argv[2] ?? 3);
const MIN = 1 / 60;

/** Adımın "Git" düğmesiyle yapılan işi (oyuncunun ilk akla gelen seçimi) */
async function doStep(c: Client, id: string, me: any, other: number): Promise<boolean> {
  const city = me.character.cityId;
  const band = (await c.get('/bands/mine')).body.band;
  const ok = (r: { status: number }) => r.status === 200;
  switch (id) {
    case 'profile':
      return ok(await c.patch('/character', { headline: 'Yeni gelen gitarist' }));
    case 'learn_skill':
      return ok(await c.post('/skills/learn', { skillId: 'genre_pop', locationId: `${city}-bookstore` }));
    case 'form_band':
      return ok(await c.post('/bands', { name: `${me.character.name.split(' ')[0]} Grubu`, genre: 'rock', role: me.character.mainInstrument }));
    case 'home':
      return ok(await c.post('/homes/rent', { homeId: 'room', locationId: `${city}-real_estate` }));
    case 'meal':
      return ok(await c.post('/meals', { locationId: `${city}-restaurant`, mealId: 'soup' }));
    case 'friend':
      return ok(await c.post(`/friends/${other}`));
    case 'write_song':
      return ok(await c.post('/actions', { kind: 'write_song', title: 'Ilk Sarki', genre: 'rock' }));
    case 'work_shift':
      return ok(await c.post('/actions', { kind: 'work', locationId: `${city}-work`, hours: 2 }));
    case 'rehearse': {
      const song = band?.songs?.[0];
      return !!song && ok(await c.post('/actions', { kind: 'rehearse', songId: song.id, hours: 1, locationId: `${city}-studio` }));
    }
    case 'first_gig': {
      if (!band?.songs?.length || band.upcomingGigs?.length) return false;
      return ok(await c.post('/gigs', { locationId: `${city}-bar`, inHours: 2, setlist: band.songs.map((s: any) => s.id), sessionRoles: ['vocals', 'bass', 'drums'] }));
    }
    case 'record': {
      const song = band?.songs?.[0];
      return !!song && ok(await c.post('/actions', { kind: 'record', songId: song.id, locationId: `${city}-recording_studio` }));
    }
    case 'release': {
      const rec = band?.songs?.find((s: any) => s.recordingQuality != null) ?? band?.songs?.[0];
      return !!rec && ok(await c.post('/releases', { kind: 'single', title: 'Ilk Single', songIds: [rec.id] }));
    }
  }
  return false;
}

async function run(seed: number) {
  await resetWorld(seed * 31337 + 1);
  const t0 = clock.now();
  const p = await newPlayer({ instrument: 'guitar' });
  const friend = await newPlayer({ instrument: 'drums' });
  const c = p.c;
  const marks: Record<string, any> = {};
  let idleMinutes = 0;
  let taps = 0;
  const snapshot = async () => {
    const t = (await c.get('/tutorial')).body;
    const money = Number((await pool.query('SELECT money + bank AS m FROM characters WHERE id = $1', [p.id])).rows[0].m);
    return { claimed: t.steps.filter((s: any) => s.claimed).length, total: t.steps.length, money, idleMinutes, taps };
  };
  // İlk 2 saat dakika dakika, sonra 10 dakikalık adımlarla
  for (let m = 0; m < 72 * 60; m += m < 120 ? 1 : 10) {
    const h = m / 60;
    if (m === 10) marks['10dk'] = await snapshot();
    if (m === 60) marks['1sa'] = await snapshot();
    if (m === 24 * 60) marks['24sa'] = await snapshot();
    // Bir dakikada kart birkaç kez kullanılabilir (anlık adımlar art arda)
    for (let k = 0; k < 6; k++) {
      const t = (await c.get('/tutorial')).body;
      const cur = t.current as string | null;
      if (!cur) break;
      const st = t.steps.find((s: any) => s.id === cur);
      if (st.done) {
        await c.post(`/tutorial/${cur}/claim`);
        taps++;
        continue;
      }
      const me = (await c.get('/me')).body;
      if (await doStep(c, cur, me, friend.id)) {
        taps++;
        continue;
      }
      if (h < 1) idleMinutes++;
      break;
    }
    // Ruh hâli ve enerji tükenirse dinlen (rehber dışı ama her oyuncunun yaptığı)
    const me = (await c.get('/me')).body;
    if (!me.action && (me.character.energy < 25 || me.character.mood < 20)) await c.post('/actions', { kind: 'rest', hours: 4 });
    // Arkadaş isteğini karşı taraf kabul etsin
    if (m % 30 < (m < 120 ? 1 : 10)) await friend.c.post(`/friends/${p.id}/answer`, { accept: true });
    await advanceHours(m < 120 ? MIN : 10 * MIN);
    if (m >= 120 || m % 5 === 4) await simTick();
  }
  marks['72sa'] = await snapshot();
  return marks;
}

const out: any[] = [];
for (let s = 1; s <= SEEDS; s++) {
  const r = await run(s);
  out.push(r);
  console.log(`tohum ${s}`, JSON.stringify(r));
}
fs.mkdirSync('scripts/balance/out', { recursive: true });
fs.writeFileSync(`scripts/balance/out/playtest-first-hour${process.env.OUT_TAG ? '-' + process.env.OUT_TAG : ''}.json`, JSON.stringify(out, null, 1));
await closeWorld();
