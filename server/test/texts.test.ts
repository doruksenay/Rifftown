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
  REVIEW_PARTS,
  REVIEW_CROWD_PARTS,
  NEWS_PARTS,
  newsArticleTemplate,
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
  ...REVIEW_PARTS.flatMap((t) => [...t.openers, ...t.followups]),
  ...Object.values(REVIEW_CROWD_PARTS).flatMap((x) => [...x.openers, ...x.details]),
  ...NEWS_PARTS.titles,
  ...NEWS_PARTS.leads,
  ...NEWS_PARTS.closers,
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

  it('parçalardan kurulan cümleler: basamak başına en az 100 kombinasyon, parçalar birbirine uyar', () => {
    expect(REVIEW_PARTS.map((t) => t.minQuality)).toEqual(REVIEW_TIERS.map((t) => t.minQuality));
    for (const t of REVIEW_PARTS) {
      expect(t.openers.length * t.followups.length).toBeGreaterThanOrEqual(100);
      for (const o of t.openers) for (const lang of ['tr', 'en'] as const) {
        // Açılış büyük harfle başlar, noktasız biter; devam küçük harfle başlar, noktayla biter
        expect(/[.;]$/.test(o[lang]), o[lang]).toBe(false);
      }
      for (const f of t.followups) for (const lang of ['tr', 'en'] as const) {
        expect(f[lang].endsWith('.'), f[lang]).toBe(true);
        expect(f[lang][0], f[lang]).toBe(f[lang][0].toLocaleLowerCase(lang === 'tr' ? 'tr' : 'en'));
      }
    }
    for (const x of Object.values(REVIEW_CROWD_PARTS)) {
      expect(x.openers.length * x.details.length).toBeGreaterThanOrEqual(24);
      // Doluluk cümlesi hep mekânı anar
      for (const o of x.openers) expect(o.tr.includes('{venue}') && o.en.includes('{venue}')).toBe(true);
    }
    // Aynı şarkı adı bir cümlede iki kez geçmez; aynı konser hep aynı metni üretir
    for (let seed = 0; seed < 300; seed++) {
      const r = gigReview({ ...base, quality: 10 + (seed % 85), seed });
      expect(r.tr.split('Son Vapur').length - 1, r.tr).toBeLessThanOrEqual(2);
      expect(gigReview({ ...base, quality: 10 + (seed % 85), seed })).toEqual(r);
    }
    // Haber: başlık × giriş × kapanış; şarkısız konserde şarkı anılmaz
    const news = new Set(Array.from({ length: 200 }, (_, i) => JSON.stringify(newsArticleTemplate(i, true))));
    expect(news.size).toBeGreaterThanOrEqual(100);
    for (let i = 0; i < 100; i++) {
      const t = newsArticleTemplate(i, false);
      expect(t.title.tr + t.body.tr + t.title.en + t.body.en).not.toContain('{song}');
      // Haber grubu hep anar
      expect(t.title.tr + t.body.tr).toContain('{band}');
      expect(t.title.en + t.body.en).toContain('{band}');
    }
  });

  it('çeşitlilik: 200 konserde 10. konserden sonra cümlelerin en az %35\'i yeni (denge raporu §9)', () => {
    const seen = new Set<string>();
    let after = 0;
    let fresh = 0;
    for (let i = 0; i < 200; i++) {
      const q = Math.round(Math.max(5, Math.min(97, 25 + i * 0.25 + ((i * 37) % 20) - 10)));
      const r = gigReview({ ...base, attendance: Math.round(80 * Math.min(1, 0.15 + i / 220)), quality: q, seed: 100 + i * 13 });
      for (const sentence of r.tr.split(/(?<=[.!?])\s+/)) {
        const norm = sentence.replace(/\d+/g, '#');
        const isNew = !seen.has(norm);
        seen.add(norm);
        if (i >= 10) {
          after++;
          if (isNew) fresh++;
        }
      }
    }
    expect(fresh / after).toBeGreaterThanOrEqual(0.35);
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

describe('eleştiri tekrarı (playtest O-9)', () => {
  it('grubun son eleştirilerindeki açılış tekrar seçilmez; Türkçe boş salon cümlelerinde "{venue} içinde" yok', async () => {
    const { gigReview, REVIEW_CROWD_PARTS, REVIEW_CROWD, CITY_BY_ID, LOCATION_BY_ID } = await import('@rifftown/shared');
    const base = { quality: 22, attendance: 9, capacity: 80, presentCount: 3, memberCount: 3, venue: LOCATION_BY_ID['istanbul-bar'].name, city: CITY_BY_ID.istanbul.name, bestSong: 'Ilk', cityId: 'istanbul' };
    const recent: string[] = [];
    const opens: string[] = [];
    for (let i = 0; i < 20; i++) {
      const r = gigReview({ ...base, seed: 1000 + i * 3, recent: recent.slice(0, 6) });
      opens.push(r.tr.split(/[.;]/)[0]);
      recent.unshift(r.tr);
    }
    // Ardışık 6 eleştiride aynı açılış yok
    for (let i = 0; i + 6 <= opens.length; i++) expect(new Set(opens.slice(i, i + 6)).size).toBe(6);
    for (const x of [...REVIEW_CROWD_PARTS.empty.openers, ...REVIEW_CROWD.empty]) expect(x.tr).not.toContain('{venue} içinde');
    expect(REVIEW_CROWD_PARTS.empty.openers.length).toBeGreaterThanOrEqual(10);
  });

  it('EN push metni a/an seçer', async () => {
    const { withArticle } = await import('../src/push');
    expect(withArticle('outstanding')).toBe('an outstanding');
    expect(withArticle('EPIC')).toBe('an EPIC');
    expect(withArticle('good')).toBe('a good');
  });
});
