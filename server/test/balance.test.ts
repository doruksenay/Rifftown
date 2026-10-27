// Denge ayarı (docs/DENGE_OLCUMU.md): şehir doygunluğu ve beceri etkilerinde uzmanlık payı
import {
  CITY_BY_ID,
  CITY_SATURATION,
  INSTRUMENTS,
  MASTERY_FROM,
  MAX_EFFECT_BONUS,
  MAX_MASTERY_BONUS,
  PACING,
  ROLE_SKILLS,
  SKILL_DEFS,
  type GigPerformer,
  type SkillEffectKind,
  type Skills,
  computeGig,
  effectBonus,
  gigAdvice,
  masteryBonus,
  saturationAttendanceMult,
  saturationFameMult,
  skillBonus,
  songwritingScore,
  stageScore,
  studyGain,
} from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { advance, newPlayer, setup, teardown } from './helpers';

const fixed = (v: number) => () => v;
const istanbul = CITY_BY_ID.istanbul;

function band(level: number, stage: number, fam = 70): GigPerformer[] {
  const s: Skills = { showmanship: stage, dancing: stage };
  for (const r of INSTRUMENTS) {
    s[ROLE_SKILLS[r].basic] = level;
    s[ROLE_SKILLS[r].specific] = level;
  }
  return (['vocals', 'guitar', 'bass', 'drums'] as const).map((role, i) => ({
    characterId: i + 1,
    role,
    skills: s,
    mood: 80,
    health: 100,
    present: true,
    instrumentBonus: 0,
    outfitBonus: 0,
    familiarity: { 1: fam, 2: fam, 3: fam, 4: fam },
  }));
}
const setlist = (q: number) => [1, 2, 3, 4].map((id) => ({ id, quality: q }));
const gig = (venue: 'bar' | 'club' | 'hall', recentCityGigs: number | undefined, q = 60, fame = 30, level = 50) =>
  computeGig({ venue, fame, genre: 'rock', city: istanbul, performers: band(level, 30, level), setlist: setlist(q), rand: fixed(0.5), recentCityGigs });

describe('şehir doygunluğu (kurallar)', () => {
  it('çarpanlar: önceki her konser şöhreti 1/(1+0,5k), seyirciyi 1−0,1k küçültür; seyirci en az ×0,6', () => {
    expect(saturationFameMult(0)).toBe(1);
    expect(saturationFameMult(1)).toBeCloseTo(1 / 1.5);
    expect(saturationFameMult(2)).toBeCloseTo(0.5);
    expect(saturationAttendanceMult(0)).toBe(1);
    expect(saturationAttendanceMult(2)).toBeCloseTo(0.8);
    expect(saturationAttendanceMult(100)).toBe(CITY_SATURATION.minAttendance);
    // Bozuk girdi sıfır sayılır
    expect(saturationFameMult(-3)).toBe(1);
    expect(saturationAttendanceMult(-3)).toBe(1);
    expect(PACING.citySaturationHours).toBe(60);
  });

  it('kulüpte üst üste çalmak seyirciyi ve şöhret kazancını düşürür, raporda etken olarak görünür', () => {
    const fresh = gig('club', 0);
    const once = gig('club', 1);
    const tired = gig('club', 3);
    // Kalite seyirciden bağımsızdır
    expect(once.quality).toBe(fresh.quality);
    expect(tired.quality).toBe(fresh.quality);
    expect(fresh.fameDelta).toBeGreaterThan(0);
    expect(once.attendance).toBeLessThan(fresh.attendance);
    expect(tired.attendance).toBeLessThan(once.attendance);
    expect(tired.attendance).toBeCloseTo(fresh.attendance * 0.7, -1);
    expect(once.fameDelta).toBeLessThan(fresh.fameDelta);
    expect(tired.fameDelta).toBeLessThan(fresh.fameDelta * 0.5);
    expect(tired.revenue).toBeLessThan(fresh.revenue);
    // Etken: hiç yoksa değerlendirilmez, 1 konser idare eder, 2+ zayıf
    expect(fresh.factors?.saturation).toBeUndefined();
    expect(once.factors?.saturation).toBe('ok');
    expect(tired.factors?.saturation).toBe('weak');
    expect(gigAdvice({ saturation: 'weak' })).toContain('saturation');
    // Eski davranış: alan verilmezse fark yok
    expect(gig('club', undefined)).toEqual(fresh);
  });

  it('bar muaftır: yeni grupların ilk adımları aynı tempoda kalır', () => {
    const fresh = gig('bar', 0, 50, 5);
    const tired = gig('bar', 6, 50, 5);
    expect(tired).toEqual(fresh);
    expect(tired.factors?.saturation).toBeUndefined();
  });

  it('kötü konserin şöhret kaybı küçülmez', () => {
    const fresh = gig('club', 0, 5, 30, 5);
    const tired = gig('club', 4, 5, 30, 5);
    expect(fresh.fameDelta).toBeLessThan(0);
    expect(tired.fameDelta).toBe(fresh.fameDelta);
  });
});

// ---------- Uzmanlık payı ----------

const effectSkills = (kind: SkillEffectKind) =>
  SKILL_DEFS.filter((d) => d.effects?.[kind])
    .map((d) => ({ id: d.id, w: d.effects![kind]! }))
    .sort((a, b) => b.w - a.w);
const profile = (kind: SkillEffectKind, k: number, level: number): Skills =>
  Object.fromEntries(effectSkills(kind).slice(0, k).map((x) => [x.id, level]));
/** Okulda, ruh hâli 80 ile verilen saatte 0'dan varılan seviye (4 saatlik oturumlar) */
function levelAfter(hours: number) {
  let lvl = 0;
  for (let h = hours; h > 0; h -= 4) lvl = Math.min(100, lvl + studyGain(lvl, Math.min(4, h), true, 80));
  return lvl;
}
/** Sabit tohumlu rastgele sayı üreteci */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
}

describe('uzmanlık payı (kurallar)', () => {
  it('usta altındaki becerilerde etki eskisiyle aynıdır; hiçbir profilde eskisinden düşük değildir', () => {
    const rand = rng(42);
    for (const kind of ['stage', 'songwriting'] as SkillEffectKind[]) {
      const list = effectSkills(kind);
      for (let i = 0; i < 400; i++) {
        const s: Skills = {};
        for (const x of list) if (rand() < 0.6) s[x.id] = Math.round(rand() * 100);
        const old = Math.min(MAX_EFFECT_BONUS, skillBonus(s, kind));
        const now = effectBonus(s, kind);
        expect(now).toBeGreaterThanOrEqual(old);
        expect(now).toBeLessThanOrEqual(MAX_EFFECT_BONUS + MAX_MASTERY_BONUS);
        if (Object.values(s).every((v) => v <= MASTERY_FROM)) expect(now).toBe(old);
      }
    }
  });

  it('genişlik tavana varır ama geçemez; usta üstü derinlik tavanın dışında en fazla +5 ekler', () => {
    // Şarkı yazma: 6 beceri 59'da tavan (+10), uzmanlık yok
    const broad = profile('songwriting', 6, 59);
    expect(skillBonus(broad, 'songwriting')).toBeGreaterThan(MAX_EFFECT_BONUS);
    expect(masteryBonus(broad, 'songwriting')).toBe(0);
    expect(effectBonus(broad, 'songwriting')).toBe(MAX_EFFECT_BONUS);
    // 3 beceri 100'de: 3 × 0,05 × 40 = 6 → +5 tavanı
    const deep = profile('songwriting', 3, 100);
    expect(masteryBonus(deep, 'songwriting')).toBe(MAX_MASTERY_BONUS);
    expect(effectBonus(deep, 'songwriting')).toBe(MAX_EFFECT_BONUS + MAX_MASTERY_BONUS);
    // Puanlara yansır ve 100'ü geçmez
    const core: Skills = { composing: 50, lyrics: 50, genre_rock: 50 };
    expect(songwritingScore({ ...core, ...deep }, 'rock') - songwritingScore({ ...core, ...broad }, 'rock')).toBeCloseTo(MAX_MASTERY_BONUS);
    expect(songwritingScore({ composing: 100, lyrics: 100, genre_rock: 100, ...deep }, 'rock')).toBe(100);
    expect(stageScore({ showmanship: 100, pro_showmanship: 100, dancing: 100, audience: 100, stagediving: 100, ...profile('stage', 13, 100) })).toBe(100);
  });

  it('aynı çalışma saatiyle (240 saat) derin uzman geniş oyuncuyu geçer; eskiden ikisi de +10 tavanında eşitti', () => {
    for (const kind of ['stage', 'songwriting'] as SkillEffectKind[]) {
      const n = effectSkills(kind).length;
      const broad = profile(kind, n, levelAfter(240 / n));
      const deep = profile(kind, 3, levelAfter(240 / 3));
      // Eski kural: ikisi de en fazla tavan
      expect(Math.min(MAX_EFFECT_BONUS, skillBonus(broad, kind))).toBe(MAX_EFFECT_BONUS);
      expect(effectBonus(broad, kind)).toBe(MAX_EFFECT_BONUS);
      expect(effectBonus(deep, kind)).toBeGreaterThan(effectBonus(broad, kind));
    }
  });
});

// ---------- Sunucu ----------

describe('şehir doygunluğu (sunucu)', () => {
  beforeAll(setup);
  afterAll(async () => {
    await teardown();
    await pool.end();
  });

  const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);

  async function bandWithFame(fame: number) {
    const p = await newPlayer();
    for (let i = 0; i < 4; i++) await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, $2, 'rock', 50)`, [p.character.id, `D${i}`]);
    const b = (await p.c.post('/api/bands', { name: `Doygun ${p.character.id}`, genre: 'rock', role: 'guitar' })).body.band;
    await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', $2)`, [b.id, fame]);
    return { p, band: b, setlist: b.songs.map((s: { id: number }) => s.id) };
  }
  async function play(p: Awaited<ReturnType<typeof newPlayer>>, locationId: string, ids: number[]) {
    const booked = await p.c.post('/api/gigs', { locationId, inHours: 2, setlist: ids });
    expect(booked.status).toBe(200);
    // Rapor VIP olmayanlara 3 oyun günü görünür (testte milisaniyeler); sonuç veritabanından okunur
    for (let i = 0; i < 20; i++) {
      await advance(20);
      const g = (await q('SELECT status, result FROM gigs WHERE id = $1', [booked.body.gig.id])).rows[0];
      if (g.status === 'done') return g;
    }
    throw new Error('konser sonuçlanmadı');
  }
  async function withWindow<T>(hours: number | null, fn: () => Promise<T>) {
    const prev = config.gigSaturationHours;
    config.gigSaturationHours = hours;
    try {
      return await fn();
    } finally {
      config.gigSaturationHours = prev;
    }
  }

  it('aynı şehirde pencere içindeki önceki konserler raporda doygunluk olarak görünür', () =>
    // Testlerde oyun hızı çok yüksek: pencereyi bütün test süresini kapsayacak kadar uzun tutuyoruz
    withWindow(1e9, async () => {
      const { p, setlist } = await bandWithFame(25);
      const g1 = await play(p, 'istanbul-club', setlist);
      expect(g1.result.factors.saturation).toBeUndefined();
      const g2 = await play(p, 'istanbul-club', setlist);
      expect(g2.result.factors.saturation).toBe('ok');
      const g3 = await play(p, 'istanbul-club', setlist);
      expect(g3.result.factors.saturation).toBe('weak');
    }));

  it('barda, kapalı pencerede (0) ve başka şehrin konserlerinde doygunluk yok', async () => {
    await withWindow(1e9, async () => {
      const { p, setlist } = await bandWithFame(25);
      await play(p, 'istanbul-bar', setlist);
      const bar = await play(p, 'istanbul-bar', setlist);
      expect(bar.result.factors.saturation).toBeUndefined();
      // Başka şehirdeki konser İstanbul'u doyurmaz: bir konser Ankara'da sonuçlanmış gibi kaydedilir
      const other = await bandWithFame(25);
      await q(
        `INSERT INTO gigs(band_id, location_id, city_id, starts_at, setlist, status, result)
         VALUES ($1, 'ankara-club', 'ankara', now() - interval '1 minute', $2, 'done', '{"presentCount":1}')`,
        [other.band.id, other.setlist],
      );
      const first = await play(other.p, 'istanbul-club', other.setlist);
      expect(first.result.factors.saturation).toBeUndefined();
    });
    await withWindow(0, async () => {
      const { p, setlist } = await bandWithFame(25);
      await play(p, 'istanbul-club', setlist);
      const again = await play(p, 'istanbul-club', setlist);
      expect(again.result.factors.saturation).toBeUndefined();
    });
  });
});
