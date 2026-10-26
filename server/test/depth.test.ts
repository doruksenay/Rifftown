// Karar derinliği: setlist sırası, sahne olayları, bis, alt tür ve tempo, şarkı yazma yorgunluğu
import {
  CITY_BY_ID,
  type GigPerformer,
  type GigSong,
  computeGig,
  encoreOutcome,
  ENCORE_MIN_QUALITY,
  setlistFlow,
  songFatigueFactor,
  styleBonus,
} from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pool } from '../src/db';
import { advance, newPlayer, setSkills, setVip, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);

const perf = (over: Partial<GigPerformer> = {}): GigPerformer => ({
  characterId: 1,
  role: 'guitar',
  skills: { guitar: 50, basic_strings: 50, showmanship: 50, audience: 40, dancing: 10 },
  mood: 80,
  health: 100,
  present: true,
  instrumentBonus: 0,
  outfitBonus: 0,
  familiarity: { 1: 60, 2: 60, 3: 60, 4: 60, 5: 60 },
  energy: 90,
  ...over,
});
const run = (setlist: GigSong[], extra: Partial<Parameters<typeof computeGig>[0]> = {}, rand = () => 0.5) =>
  computeGig({ venue: 'club', fame: 30, genre: 'rock', city: CITY_BY_ID.istanbul, performers: [perf()], setlist, rand, ...extra });

describe('setlist sırası', () => {
  const songs = [20, 35, 50, 65, 80];
  it('zayıfı öne, güçlüyü sona koymak daha iyi', () => {
    const good = songs.map((q, i) => ({ id: i + 1, quality: q }));
    const bad = [...good].reverse();
    expect(setlistFlow(good.map((s) => ({ score: s.quality })))).toBeGreaterThan(0);
    expect(setlistFlow(bad.map((s) => ({ score: s.quality })))).toBeLessThan(0);
    expect(run(good).quality).toBeGreaterThan(run(bad).quality);
    expect(run(bad).factors?.flow).toBe('weak');
  });
  it('kısa setlerde sıra önemsizdir; etki sınırlıdır', () => {
    expect(setlistFlow([{ score: 10 }, { score: 90 }])).toBe(0);
    const extreme = setlistFlow([{ score: 100 }, { score: 0 }, { score: 0 }, { score: 0 }, { score: 0 }]);
    expect(extreme).toBeGreaterThanOrEqual(-8);
  });
  it('tempo: hızlı kapanış artırır, üç yavaş şarkı üst üste düşürür', () => {
    const flat = [1, 2, 3, 4].map(() => ({ score: 50 }));
    expect(setlistFlow(flat.map((s, i) => ({ ...s, tempo: i === 3 ? ('fast' as const) : ('mid' as const) })))).toBeGreaterThan(
      setlistFlow(flat.map((s) => ({ ...s, tempo: 'mid' as const }))),
    );
    expect(setlistFlow(flat.map((s) => ({ ...s, tempo: 'slow' as const })))).toBeLessThan(0);
  });
});

describe('sahne olayları ve bis', () => {
  const set = [1, 2, 3, 4].map((id) => ({ id, quality: 50 }));
  it('beceri yetiyorsa olay tutar, yetmiyorsa bozulur ve kaliteyi düşürür', () => {
    const base = run(set).quality;
    const ok = run(set, { plan: { events: ['banter', 'singalong'] } }, () => 0.1);
    expect(ok.events?.every((e) => e.outcome === 'success')).toBe(true);
    expect(ok.quality).toBeGreaterThan(base);
    // Dans becerisi 10, eşik 30: bozulur
    const flop = run(set, { plan: { events: ['dance'] } }, () => 0.1);
    expect(flop.events?.[0].outcome).toBe('fail');
    expect(flop.quality).toBeLessThan(base);
    expect(flop.factors?.events).toBe('weak');
  });
  it('bekleme süresindeki olay denenmez', () => {
    const r = run(set, { plan: { events: ['banter'] }, cooldownEvents: ['banter'] }, () => 0.1);
    expect(r.events?.[0].outcome).toBe('skipped');
  });
  it('kiralık müzisyenler olay yapamaz', () => {
    const hired = perf({ characterId: null, skills: { dancing: 90 } });
    const r = computeGig({
      venue: 'club', fame: 30, genre: 'rock', city: CITY_BY_ID.istanbul, performers: [perf(), hired],
      setlist: set, rand: () => 0.1, plan: { events: ['dance'] },
    });
    expect(r.events?.[0].outcome).toBe('fail');
  });
  it('bis: güvenli bis istenmezse çıkılmaz; cesur bis enerjiyle tutar, istenmezse geceyi bozar', () => {
    expect(encoreOutcome('safe', ENCORE_MIN_QUALITY - 1, 90, () => 0.5).outcome).toBe('skipped');
    expect(encoreOutcome('safe', 60, 90, () => 0.5)).toMatchObject({ outcome: 'success', qualityDelta: 1 });
    expect(encoreOutcome('bold', 60, 100, () => 0.5).outcome).toBe('success');
    expect(encoreOutcome('bold', 60, 0, () => 0.85).outcome).toBe('flop');
    expect(encoreOutcome('bold', 10, 100, () => 0).qualityDelta).toBeLessThan(0);
    const bold = run(set, { plan: { encore: 'bold' } }, () => 0.2);
    expect(bold.encore).toBe('success');
    expect(bold.encoreEnergy).toBeGreaterThan(0);
  });
});

describe('alt tür, tempo ve yazma hızı', () => {
  it('alt türü bilmek ve doğal tempoya uymak kaliteyi artırır', () => {
    expect(styleBonus({ genre_rock: 20 }, 'rock', 'hard_rock', 'fast')).toBeGreaterThan(0);
    expect(styleBonus({ genre_rock: 0 }, 'rock', 'hard_rock', 'fast')).toBeLessThan(styleBonus({ genre_rock: 20 }, 'rock', 'hard_rock', 'fast'));
    expect(styleBonus({ genre_rock: 20 }, 'rock', 'hard_rock', 'slow')).toBeLessThan(0);
    expect(styleBonus({}, 'rock', 'techno', 'fast')).toBe(0); // başka türün alt türü sayılmaz
    expect(songFatigueFactor(0)).toBe(1);
    expect(songFatigueFactor(2)).toBeLessThan(songFatigueFactor(1));
  });

  it('şarkı alt tür ve tempoyla kaydedilir; yanlış alt tür reddedilir; peş peşe yazmak kaliteyi düşürür', async () => {
    const p = await newPlayer();
    await setVip(p.userId);
    await setSkills(p.character.id, { composing: 60, lyrics: 60, genre_rock: 60 });
    expect((await p.c.post('/api/actions', { kind: 'write_song', title: 'X', genre: 'rock', subgenre: 'techno' })).body.error).toBe('invalid_subgenre');
    expect((await p.c.post('/api/actions', { kind: 'write_song', title: 'X', genre: 'rock', tempo: 'warp' })).body.error).toBe('invalid_input');
    expect((await p.c.post('/api/actions', { kind: 'write_song', title: 'Bir', genre: 'rock', subgenre: 'hard_rock' })).status).toBe(200);
    await advance(10);
    const songs = (await p.c.get('/api/songs/mine')).body.songs;
    expect(songs[0]).toMatchObject({ subgenre: 'hard_rock', tempo: 'fast' });
    for (let i = 0; i < 3; i++) {
      await q(`UPDATE characters SET energy = 100, energy_at = now() WHERE id = $1`, [p.character.id]);
      await p.c.post('/api/actions', { kind: 'write_song', title: `Hızlı ${i}`, genre: 'rock' });
      await advance(10);
    }
    const last = (await p.c.get('/api/actions/history')).body.actions.find((a: any) => a.kind === 'write_song');
    expect(last.result.fatigued).toBe(true);
  });

  it('konser planı kaydedilir, doğrulanır ve raporda sonuç görünür', async () => {
    const p = await newPlayer();
    await setVip(p.userId);
    for (let i = 0; i < 4; i++) await q(`INSERT INTO songs(author_id, title, genre, quality, tempo) VALUES ($1, $2, 'rock', $3, 'fast')`, [p.character.id, `S${i}`, 30 + i * 10]);
    const band = (await p.c.post('/api/bands', { name: `Plan ${p.character.id}`, genre: 'rock', role: 'guitar' })).body.band;
    const ids = band.songs.map((s: any) => s.id);
    await q(`UPDATE gigs SET status = 'cancelled' WHERE location_id = 'istanbul-bar' AND status = 'scheduled'`);
    expect((await p.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: ids, plan: { events: ['moonwalk'] } })).body.error).toBe('invalid_event');
    expect((await p.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: ids, plan: { events: ['banter', 'solo', 'dance', 'singalong'] } })).body.error).toBe('invalid_input');
    const g = await p.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: ids, plan: { events: ['banter'], encore: 'safe' } });
    expect(g.status).toBe(200);
    expect(g.body.gig.plan).toMatchObject({ events: ['banter'], encore: 'safe' });
    await advance(10);
    const r = (await p.c.get(`/api/gigs/${g.body.gig.id}`)).body.gig.result;
    expect(r.events).toHaveLength(1);
    expect(['success', 'fail']).toContain(r.events[0].outcome);
    expect(['none', 'skipped', 'success']).toContain(r.encore);
    expect(typeof r.flow).toBe('number');
  });
});
