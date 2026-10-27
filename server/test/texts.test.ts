// Metin havuzları: eleştiri, sahne olayları ve gazete haberleri
import {
  CITIES,
  NEWS_TEMPLATES,
  REVIEW_CITY,
  REVIEW_CROWD,
  REVIEW_EVENT,
  REVIEW_EVENT_GENERIC,
  REVIEW_LEGENDARY,
  REVIEW_PRESS,
  REVIEW_RIVAL,
  REVIEW_TIERS,
  STAGE_EVENTS,
  type L,
  computeGig,
  gigReview,
  startingSkills,
} from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pool } from '../src/db';
import { newPlayer, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const ALL: L[] = [
  ...REVIEW_TIERS.flatMap((t) => t.lines),
  ...REVIEW_LEGENDARY,
  ...Object.values(REVIEW_CROWD).flat(),
  ...Object.values(REVIEW_EVENT).flatMap((e) => [e.success, e.fail]),
  ...REVIEW_EVENT_GENERIC.success,
  ...REVIEW_EVENT_GENERIC.fail,
  ...Object.values(REVIEW_PRESS).flat(),
  ...Object.values(REVIEW_RIVAL).flat(),
  ...Object.values(REVIEW_CITY).flat(),
  ...NEWS_TEMPLATES.flatMap((x) => [x.title, x.body]),
];
const base = {
  attendance: 70, capacity: 80, presentCount: 3, memberCount: 3,
  venue: { tr: 'Kadıköy Bodrum Bar', en: 'Kadikoy Basement Bar' }, city: { tr: 'İstanbul', en: 'Istanbul' }, bestSong: 'Son Vapur',
};

describe('metin havuzları', () => {
  it('hacim: basamak başına 6–10 cümle, en az 14 sahne olayı, her olayın ve şehrin kendi cümlesi', () => {
    for (const t of REVIEW_TIERS) {
      expect(t.lines.length).toBeGreaterThanOrEqual(6);
      expect(t.lines.length).toBeLessThanOrEqual(10);
    }
    expect(STAGE_EVENTS.length).toBeGreaterThanOrEqual(14);
    for (const e of STAGE_EVENTS) expect(REVIEW_EVENT[e.id], e.id).toBeDefined();
    for (const c of CITIES) expect(REVIEW_CITY[c.id]?.length, c.id).toBeGreaterThanOrEqual(2);
    expect(NEWS_TEMPLATES.length).toBeGreaterThanOrEqual(8);
  });

  it('iki dil dolu, yer tutucular iki dilde aynı; Türkçede yer tutucuya ek getirilmez', () => {
    const holders = (x: string) => (x.match(/\{[a-z]+\}/g) ?? []).sort().join(',');
    for (const x of ALL) {
      expect(x.tr && x.en).toBeTruthy();
      expect(holders(x.tr), x.tr).toBe(holders(x.en));
      // "{venue}'da", "{city}de" gibi ekler yasak
      expect(/\}['’]?[a-zçğıöşüA-ZÇĞİÖŞÜ]/.test(x.tr), x.tr).toBe(false);
    }
  });

  it('eleştiri bağlamı bilir: olay, rakip, basın; aynı konser hep aynı metni üretir', () => {
    const r = gigReview({ ...base, quality: 50, seed: 7, events: [{ id: 'mosh_pit', outcome: 'fail' }], rival: { name: 'Mavi Vapur', quality: 80 } });
    expect(r.tr).toContain(REVIEW_EVENT.mosh_pit.fail.tr);
    expect(r.tr).toContain('Mavi Vapur');
    expect(gigReview({ ...base, quality: 50, seed: 7, events: [{ id: 'mosh_pit', outcome: 'fail' }], rival: { name: 'Mavi Vapur', quality: 80 } })).toEqual(r);
    const hot = gigReview({ ...base, quality: 70, seed: 1, press: 80 });
    expect(REVIEW_PRESS.hot.some((x) => hot.en.includes(x.en))).toBe(true);
    // Farklı konserler farklı cümleler görür
    const lines = new Set(Array.from({ length: 40 }, (_, i) => gigReview({ ...base, quality: 65, seed: i }).tr));
    expect(lines.size).toBeGreaterThanOrEqual(6);
  });

  it('türe bağlı olay başka türde denenmez; tür becerisiyle denenen olay grubun türüne bakar', () => {
    const p = { characterId: 1, role: 'vocals' as const, skills: { ...startingSkills('vocals', 'pop'), showmanship: 90, genre_hiphop: 90 }, mood: 80, health: 100, present: true, instrumentBonus: 0, outfitBonus: 0, familiarity: { 1: 80 } };
    const run = (genre: 'pop' | 'punk' | 'hiphop', events: string[]) =>
      computeGig({ venue: 'bar', fame: 10, genre, city: CITIES[0], performers: [p], setlist: [{ id: 1, quality: 50 }], rand: () => 0.1, plan: { events } }).events!;
    expect(run('pop', ['mosh_pit'])[0].outcome).toBe('skipped');
    expect(run('punk', ['mosh_pit'])[0].outcome).toBe('success');
    expect(run('hiphop', ['freestyle'])[0].outcome).toBe('success');
    expect(run('pop', ['cover'])[0].outcome).toBe('fail'); // pop becerisi 10, eşik 30
  });

  it('konser ayarlarken türe uymayan olay reddedilir', async () => {
    const pl = await newPlayer();
    await pool.query(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Tek', 'pop', 50)`, [pl.character.id]);
    const band = (await pl.c.post('/api/bands', { name: `Olay ${pl.character.id}`, genre: 'pop', role: 'guitar' })).body.band;
    const book = (events: string[]) => pl.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: [band.songs[0].id], plan: { events } });
    expect((await book(['mosh_pit'])).body.error).toBe('event_wrong_genre');
    expect((await book(['cover'])).status).toBe(200);
  });
});
