// İçerik hacmi: veri dosyalarının bütünlüğü, görev zincirleri, efsane sonrası hedef
import {
  ACHIEVEMENTS,
  CHAINS,
  CITIES,
  GENRES,
  GENRE_NAMES,
  ITEMS,
  ITEM_BY_ID,
  LEGACY_GOALS,
  MISSIONS,
  RECIPES,
  SKILL_BY_ID,
  SKILL_DEFS,
  SUBGENRES,
  genreSkillId,
  maxResalePrice,
  nextLegacyGoal,
  skillBonus,
  skillMult,
  songwritingScore,
  stageScore,
} from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pool } from '../src/db';
import { me, newPlayer, setSkills, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
const unique = (xs: string[]) => new Set(xs).size === xs.length;

describe('veri dosyaları', () => {
  it('hacim hedefleri: beceri, eşya, tarif, tür, alt tür, başarım, görev', () => {
    expect(SKILL_DEFS.length).toBeGreaterThanOrEqual(90);
    expect(ITEMS.length).toBeGreaterThanOrEqual(115);
    expect(RECIPES.length).toBeGreaterThanOrEqual(16);
    expect(GENRES.length).toBeGreaterThanOrEqual(14);
    expect(SUBGENRES.length).toBeGreaterThanOrEqual(35);
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(75);
    expect(MISSIONS.length).toBeGreaterThanOrEqual(28);
    expect(CHAINS.length).toBeGreaterThanOrEqual(6);
  });

  it('kimlikler benzersiz, öncüller ve malzemeler var, iki dil dolu', () => {
    expect(unique(SKILL_DEFS.map((s) => s.id))).toBe(true);
    expect(unique(ITEMS.map((i) => i.id))).toBe(true);
    expect(unique(RECIPES.map((r) => r.id))).toBe(true);
    expect(unique(ACHIEVEMENTS.map((a) => a.id))).toBe(true);
    expect(unique(MISSIONS.map((m) => m.id))).toBe(true);
    expect(unique(SUBGENRES.map((s) => s.id))).toBe(true);
    for (const s of SKILL_DEFS) {
      if (s.prereq) expect(SKILL_BY_ID[s.prereq.skill], `${s.id} öncülü`).toBeDefined();
      if (s.learn === 'book') expect(s.bookPrice, `${s.id} kitap fiyatı`).toBeGreaterThan(0);
      expect(s.name.tr && s.name.en && s.about.tr && s.about.en).toBeTruthy();
    }
    for (const r of RECIPES) {
      expect(ITEM_BY_ID[r.itemId], `${r.id} ürünü`).toBeDefined();
      for (const m of Object.keys(r.materials)) expect(ITEM_BY_ID[m]?.slot, `${r.id} malzemesi ${m}`).toBe('material');
    }
    for (const i of ITEMS) expect(i.name.tr && i.name.en).toBeTruthy();
    for (const g of GENRES) {
      expect(GENRE_NAMES[g]).toBeDefined();
      expect(SKILL_BY_ID[genreSkillId(g)]).toBeDefined();
      for (const c of CITIES) expect(c.genrePopularity[g], `${c.id} ${g}`).toBeGreaterThan(0);
    }
    for (const s of SUBGENRES) expect(GENRES).toContain(s.genre);
  });

  it('ekonomi korkulukları: görev ödülleri küçük; tarif ürünü dükkâna satılamaz ve malzemesinden pahalıya pazarda satılamaz', () => {
    for (const m of MISSIONS) expect(m.reward).toBeLessThanOrEqual(60);
    for (const c of CHAINS) for (const s of c.steps) expect(s.reward).toBeLessThanOrEqual(120);
    for (const r of RECIPES) {
      const out = ITEM_BY_ID[r.itemId];
      if (r.itemId === 'repair_kit') continue; // tamir kiti dükkânda da satılır, tarif yalnızca kolaylık
      expect(out.crafted, `${r.id}`).toBe(true);
    }
    // Tamir kitini atölyede yapmak dükkândan almaktan ucuz değil (malzeme ≥ fiyatın yarısı; geri satış %50)
    const kit = RECIPES.find((r) => r.id === 'repair')!;
    const cost = Object.entries(kit.materials).reduce((s, [m, n]) => s + ITEM_BY_ID[m].price * n, 0);
    expect(cost).toBeGreaterThanOrEqual(ITEM_BY_ID.repair_kit.price * 0.5);
    expect(maxResalePrice(ITEM_BY_ID.art_crafted.price)).toBeLessThanOrEqual(1000);
  });

  it('beceri etkileri sınırlı: etkiler toplanır ama tavanı aşmaz', () => {
    const all = Object.fromEntries(SKILL_DEFS.map((s) => [s.id, 100]));
    expect(skillMult(all, 'busking')).toBeLessThanOrEqual(1.5);
    expect(songwritingScore(all, 'rock')).toBeLessThanOrEqual(100);
    expect(stageScore(all)).toBeLessThanOrEqual(100);
    expect(skillBonus({ music_theory: 50 }, 'songwriting')).toBeCloseTo(2.5);
    expect(songwritingScore({ composing: 20, music_theory: 100 }, 'rock')).toBeGreaterThan(songwritingScore({ composing: 20 }, 'rock'));
  });

  it('efsane sonrası hedefler sırayla gelir, hepsi bitince boş', () => {
    expect(nextLegacyGoal({})?.goal.id).toBe(LEGACY_GOALS[0].id);
    const all = Object.fromEntries(LEGACY_GOALS.map((g) => [g.rule.stat, g.rule.min]));
    expect(nextLegacyGoal(all)).toBeNull();
  });
});

describe('görev zincirleri ve yeni beceriler', () => {
  it('zincir adımı yapılmadan alınamaz, bir kez alınır, sonra sıradaki adım açılır', async () => {
    const p = await newPlayer();
    const before = (await me(p.c)).character.money;
    const state = (await p.c.get('/api/chains')).body.chains;
    const craft = state.find((x: any) => x.id === 'craft');
    expect(craft).toMatchObject({ step: 0, done: false });
    expect((await p.c.post('/api/chains/craft/claim')).body.error).toBe('step_not_done');
    await q(
      `INSERT INTO actions(character_id, kind, params, ends_at, status, result) VALUES ($1, 'craft', '{}', now(), 'done', '{"itemId":"guitar_crafted"}')`,
      [p.character.id],
    );
    const ok = await p.c.post('/api/chains/craft/claim');
    expect(ok.status).toBe(200);
    expect((await p.c.post('/api/chains/craft/claim')).body.error).toBe('step_not_done'); // sıradaki adım: 5 üretim
    expect((await me(p.c)).character.money).toBe(before + ok.body.reward);
    expect((await p.c.get('/api/chains')).body.chains.find((x: any) => x.id === 'craft').step).toBe(1);
    expect((await p.c.post('/api/chains/nope/claim')).status).toBe(404);
  });

  it('yeni beceri kitapçıdan öğrenilir ve öncülü kontrol edilir; yeni tür ile şarkı yazılır', async () => {
    const p = await newPlayer();
    expect((await p.c.post('/api/skills/learn', { skillId: 'luthiery', locationId: 'istanbul-bookstore' })).body.error).toBe('missing_prereq');
    expect((await p.c.post('/api/skills/learn', { skillId: 'harmonica', locationId: 'istanbul-bookstore' })).status).toBe(200);
    await setSkills(p.character.id, { genre_blues: 20 });
    const buy = await p.c.post('/api/shop/buy', { locationId: 'istanbul-pet_shop', itemId: 'pet_rabbit' });
    expect(buy.status, JSON.stringify(buy.body)).toBe(200);
    const w = await p.c.post('/api/actions', { kind: 'write_song', title: 'Mavi', genre: 'blues', subgenre: 'delta_blues' });
    expect(w.status, JSON.stringify(w.body)).toBe(200);
    // Meşgulken dükkândan alışveriş yapılamaz
    expect((await p.c.post('/api/shop/buy', { locationId: 'istanbul-pet_shop', itemId: 'pet_fish' })).body.error).toBe('busy');
  });

  it('efsane sonrası: bütün sahneler açık gruba uzun vadeli hedef gelir', async () => {
    const p = await newPlayer();
    for (let i = 0; i < 4; i++) await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, $2, 'rock', 50)`, [p.character.id, `L${i}`]);
    const band = (await p.c.post('/api/bands', { name: `Efsane ${p.character.id}`, genre: 'rock', role: 'guitar' })).body.band;
    for (const city of ['istanbul', 'ankara', 'izmir']) await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, $2, 80)`, [band.id, city]);
    const t = (await p.c.get('/api/tutorial')).body;
    expect(t.next).toMatchObject({ id: 'legacy', legacyId: LEGACY_GOALS[0].id });
  });
});
