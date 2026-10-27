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
  VENUE_RULES,
  SESSION_MUSICIAN,
  SESSION_SKILL_MARGIN,
  fameGainMult,
  sessionLevels,
  fxQualityBonus,
  MAX_FX_BONUS,
  STAGE_EVENTS,
  STAGE_EVENT_BY_ID,
  stageEventOdds,
  ENCORE_RULES,
  boldEncoreChance,
  gearQualityBonus,
  GEAR_QUALITY_CAP,
  setlistFlow,
  FLOW_MULT,
  RELEASE_RULES,
  BAND_SHARE,
  CITIES,
  weeklyUnits,
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

  // Saat: 240 → 350. Beceri eğrisi sertleşti (diminishing üssü 2, denge raporu madde 5); 240 saatte geniş oyuncu artık
  // +10 tavanına varmıyor. Testin konusu aynı: aynı saatle derin uzman geniş oyuncuyu geçer.
  it('aynı çalışma saatiyle (350 saat) derin uzman geniş oyuncuyu geçer; eskiden ikisi de +10 tavanında eşitti', () => {
    for (const kind of ['stage', 'songwriting'] as SkillEffectKind[]) {
      const n = effectSkills(kind).length;
      const broad = profile(kind, n, levelAfter(350 / n));
      const deep = profile(kind, 3, levelAfter(350 / 3));
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

// ---------- Kiralık müzisyen ve şöhret eğrisi (denge raporu madde 1) ----------

describe('büyük sahnede beceri belirleyici (kurallar)', () => {
  it('başa baş kalite mekâna göre artar: barda 30 kalite şöhret getirir, salonda ve stadyumda vasat gece getirmez', () => {
    expect(VENUE_RULES.bar.breakEven).toBe(20);
    expect(VENUE_RULES.club.breakEven).toBeGreaterThan(VENUE_RULES.bar.breakEven);
    expect(VENUE_RULES.hall.breakEven).toBeGreaterThan(VENUE_RULES.club.breakEven);
    expect(VENUE_RULES.stadium.breakEven).toBeGreaterThan(VENUE_RULES.hall.breakEven);
    // Aynı vasat grup (kalite ~45): barda ve kulüpte kazanır, salonda kazanamaz
    const mid = (venue: 'bar' | 'club' | 'hall' | 'stadium', fame: number) =>
      computeGig({ venue, fame, genre: 'rock', city: istanbul, performers: band(40, 30, 55), setlist: setlist(40), rand: fixed(0.5) });
    const bar = mid('bar', 5);
    const hall = mid('hall', 50);
    const stadium = mid('stadium', 80);
    expect(bar.fameDelta).toBeGreaterThan(0);
    expect(hall.quality).toBeLessThan(VENUE_RULES.hall.breakEven);
    expect(hall.fameDelta).toBeLessThan(0);
    expect(stadium.fameDelta).toBeLessThan(0);
  });

  it('şöhret kazancı azalan verimli: bar döneminde neredeyse aynı, üst şöhrette çok daha yavaş', () => {
    expect(fameGainMult(0)).toBe(1);
    expect(fameGainMult(10)).toBeGreaterThan(0.85);
    expect(fameGainMult(60)).toBeLessThan(0.3);
    expect(fameGainMult(70)).toBeLessThan(0.2);
    for (let f = 0; f < 100; f += 5) expect(fameGainMult(f + 5)).toBeLessThanOrEqual(fameGainMult(f));
    expect(fameGainMult(100)).toBeGreaterThan(0);
  });

  it('kiralık müzisyen barda mekânın seviyesinde, kulüp ve üstünde grubun kendi ortalamasının biraz üstünde çalar', () => {
    expect(sessionLevels('bar', { skill: 10, stage: 5 })).toEqual({ skill: SESSION_MUSICIAN.bar.skill, stage: SESSION_MUSICIAN.bar.stage });
    expect(sessionLevels('hall', { skill: 40, stage: 30 })).toEqual({ skill: 40 + SESSION_SKILL_MARGIN.hall, stage: 30 + SESSION_SKILL_MARGIN.hall });
    expect(sessionLevels('stadium', { skill: 40, stage: 30 }).skill).toBe(40 + SESSION_SKILL_MARGIN.stadium);
    // Grup zaten iyiyse mekânın seviyesini geçmez
    expect(sessionLevels('club', { skill: 90, stage: 90 })).toEqual({ skill: SESSION_MUSICIAN.club.skill, stage: SESSION_MUSICIAN.club.stage });
  });
});

// ---------- Konserde karar (denge raporu madde 6) ----------

describe('konser planı: reçete yok, karar var (kurallar)', () => {
  it('sahne efektleri: aynı efekt bir kez sayılır, azalan getiri, tavan 6', () => {
    expect(fxQualityBonus(Array(6).fill('fx_smoke'))).toBe(2);
    expect(fxQualityBonus(['fx_pyro'])).toBe(6);
    expect(fxQualityBonus(['fx_pyro', 'fx_screen', 'fx_lasers'])).toBe(MAX_FX_BONUS);
    expect(fxQualityBonus(['fx_smoke', 'fx_confetti'])).toBeCloseTo(3 + 2 * 0.5);
    expect(fxQualityBonus([])).toBe(0);
  });

  it('sahne olayları: eşikte beklenen değer negatif, her ek olay daha riskli ve daha az getirir, mekâna göre değişir', () => {
    for (const e of STAGE_EVENTS) {
      expect(e.penalty).toBe(e.bonus);
      const atMin = stageEventOdds(e, e.min, 0, 'club', 80);
      expect(atMin.chance * atMin.bonus - (1 - atMin.chance) * atMin.penalty).toBeLessThan(0);
      const first = stageEventOdds(e, e.min + 25, 0, 'hall', 80);
      const third = stageEventOdds(e, e.min + 25, 2, 'hall', 80);
      expect(third.chance).toBeLessThan(first.chance);
      expect(third.bonus).toBeLessThan(first.bonus);
    }
    const banter = STAGE_EVENT_BY_ID.banter;
    expect(stageEventOdds(banter, 60, 0, 'bar', 80).bonus).toBeGreaterThan(stageEventOdds(banter, 60, 0, 'stadium', 80).bonus);
    const singalong = STAGE_EVENT_BY_ID.singalong;
    expect(stageEventOdds(singalong, 60, 0, 'stadium', 80).bonus).toBeGreaterThan(stageEventOdds(singalong, 60, 0, 'bar', 80).bonus);
    // Yorgun grup olaylarda daha sık hata yapar
    expect(stageEventOdds(banter, 40, 0, 'club', 30).chance).toBeLessThan(stageEventOdds(banter, 40, 0, 'club', 80).chance);
  });

  it('cesur bis kumardır; set bonusu, tür uyumu ve setlist sırası kaliteye anlamlı katkı verir', () => {
    expect(ENCORE_RULES.bold.failQuality).toBe(-6);
    // Enerjisi düşük grupta cesur bis çoğu zaman tutmaz
    expect(boldEncoreChance(60, 30)).toBeLessThan(0.5);
    expect(boldEncoreChance(80, 90)).toBeGreaterThan(0.7);
    expect(gearQualityBonus(3, 0)).toBe(1.5);
    expect(gearQualityBonus(3, 3)).toBe(GEAR_QUALITY_CAP);
    // En güçlü şarkı sonda, zayıflar ortada: en az 1 puan
    const songs = [60, 40, 42, 45, 70].map((score) => ({ score }));
    expect(setlistFlow(songs)).toBeGreaterThanOrEqual(1);
    expect(FLOW_MULT).toBe(5);
  });
});

// ---------- Plaklar (denge raporu madde 9) ----------

describe('plaklar bir gelir kolu (kurallar)', () => {
  /** Ev şehri İstanbul, ülke içine yayılmış şöhret; zar ortada */
  function lifetimeBand(kind: 'single' | 'album', quality: number, fame: number) {
    let units = 0;
    for (let w = 0; w < RELEASE_RULES[kind].weeks; w++) {
      for (const c of CITIES) {
        const f = c.id === 'istanbul' ? fame : c.countryCode === 'TR' ? fame * 0.375 : 0;
        units += weeklyUnits(kind, quality, f, c.genrePopularity.rock, c, w, fixed(0.5));
      }
    }
    return units * RELEASE_RULES[kind].price * BAND_SHARE;
  }
  it('az tanınan grubun albümü (şöhret 10, kalite 45) maliyetini çıkarır; ünlü grubun albümü birkaç büyük konser eder', () => {
    expect(RELEASE_RULES.album.price).toBe(25);
    expect(BAND_SHARE).toBe(0.6);
    // 8 şarkılık albüm: kayıt + prova + baskı ≈ $3.060 (İstanbul)
    expect(lifetimeBand('album', 45, 10)).toBeGreaterThan(3060);
    expect(lifetimeBand('album', 45, 55)).toBeGreaterThan(15000);
    // Single şöhret 3'te bile zarar etmez (~$420 maliyet)
    expect(lifetimeBand('single', 45, 3)).toBeGreaterThan(420);
  });
});
