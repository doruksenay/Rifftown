// Şehir kimliği: haftalık etkinlik, yerel lezzet, nadir eşya, şehir başarımı, yerel efsane
import { ACHIEVEMENT_BY_ID, CITIES, CITY_IDENTITY, CITY_IDENTITY_BY_ID, ITEM_BY_ID, MEAL_BY_ID, cityEventActive, computeGig, gameWeekday, itemsForShop, mealsIn, startingSkills } from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pool } from '../src/db';
import { evaluateAchievements } from '../src/game/achievements';
import { newPlayer, setMoney, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);

describe('veri', () => {
  it('15 şehrin her birinin kendi etkinliği, lezzeti, nadir eşyası, başarımı ve efsanesi var; hepsi farklı', () => {
    expect(CITY_IDENTITY.length).toBe(CITIES.length);
    for (const c of CITIES) {
      const id = CITY_IDENTITY_BY_ID[c.id];
      expect(id, c.id).toBeDefined();
      expect(id.legend.tr && id.legend.en && id.event.name.tr && id.event.name.en).toBeTruthy();
      expect(id.event.weekday).toBeGreaterThanOrEqual(0);
      expect(id.event.weekday).toBeLessThan(7);
      expect(MEAL_BY_ID[id.dish.id]?.cityId).toBe(c.id);
      expect(ITEM_BY_ID[id.rareItem.id]?.cityOnly).toBe(c.id);
      expect(ACHIEVEMENT_BY_ID[`city_${c.id}`]).toBeDefined();
      // Nadir eşya yalnızca kendi şehrinin rafında; yerel lezzet yalnızca kendi şehrinin menüsünde
      expect(itemsForShop(id.rareItem.shop, c.id).some((i) => i.id === id.rareItem.id)).toBe(true);
      for (const other of CITIES.filter((x) => x.id !== c.id)) {
        expect(itemsForShop(id.rareItem.shop, other.id).some((i) => i.id === id.rareItem.id)).toBe(false);
        expect(mealsIn(other.id).some((m) => m.id === id.dish.id)).toBe(false);
      }
      // Yerel lezzet günün yemeğinden iyi ama şefin menüsünü geçmez
      expect(id.dish.mood).toBeLessThanOrEqual(MEAL_BY_ID.chef.mood);
      expect(id.dish.price).toBeLessThan(MEAL_BY_ID.chef.price);
    }
    expect(new Set(CITY_IDENTITY.map((c) => c.event.name.tr)).size).toBe(CITIES.length);
    expect(new Set(CITY_IDENTITY.map((c) => c.dish.name.tr)).size).toBe(CITIES.length);
  });

  it('haftalık etkinlik doğru günde uyan türe açık ve seyirciyi artırır', () => {
    const ist = CITY_IDENTITY_BY_ID.istanbul;
    const day = (d: number) => d * 86_400_000;
    const on = [...Array(7).keys()].find((d) => gameWeekday(day(d), 1) === ist.event.weekday)!;
    expect(cityEventActive('istanbul', 'anatolian', day(on), 1)).toBe(true);
    expect(cityEventActive('istanbul', 'country', day(on), 1)).toBe(false);
    expect(cityEventActive('istanbul', 'anatolian', day(on + 1), 1)).toBe(false);
    const perf = { characterId: 1, role: 'vocals' as const, skills: startingSkills('vocals', 'anatolian'), mood: 80, health: 100, present: true, instrumentBonus: 0, outfitBonus: 0, familiarity: { 1: 50 } };
    const run = (cityEvent: boolean) =>
      computeGig({ venue: 'club', fame: 40, genre: 'anatolian', city: CITIES[0], performers: [perf], setlist: [{ id: 1, quality: 50 }], rand: () => 0.5, cityEvent }).attendance;
    expect(run(true)).toBe(Math.min(350, Math.round(run(false) * 1.1)));
  });
});

describe('sunucuda', () => {
  it('nadir eşya yalnızca kendi şehrinde alınır; yerel lezzet yalnızca kendi şehrinde yenir; şehir başarımı imza türüyle açılır', async () => {
    const p = await newPlayer({ cityId: 'istanbul' });
    await setMoney(p.character.id, 10000);
    expect((await p.c.post('/api/shop/buy', { locationId: 'istanbul-music_store', itemId: 'guitar_nashville' })).body.error).toBe('invalid_item');
    expect((await p.c.post('/api/shop/buy', { locationId: 'istanbul-music_store', itemId: 'guitar_istanbul' })).status).toBe(200);
    expect((await p.c.post('/api/meals', { locationId: 'istanbul-restaurant', mealId: 'local_paris' })).body.error).toBe('invalid_meal');
    const ate = await p.c.post('/api/meals', { locationId: 'istanbul-restaurant', mealId: 'local_istanbul' });
    expect(ate.status, JSON.stringify(ate.body)).toBe(200);
    expect(ate.body.energy).toBeGreaterThanOrEqual(20); // VIP olmayana bulanık (22 → 20)

    await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Boğaz', 'anatolian', 50)`, [p.character.id]);
    const band = (await p.c.post('/api/bands', { name: `Boğaz ${p.character.id}`, genre: 'anatolian', role: 'guitar' })).body.band;
    const gig = (
      await q(
        `INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist, status, result) VALUES ($1, 'istanbul', 'istanbul-bar', now(), $2, 'done', '{"quality":55,"presentCount":1,"memberCount":1,"attendance":40}') RETURNING id`,
        [band.id, [band.songs[0].id]],
      )
    ).rows[0];
    await q('INSERT INTO gig_performers(gig_id, character_id, present) VALUES ($1, $2, TRUE)', [gig.id, p.character.id]);
    const got = await evaluateAchievements(pool, p.character.id);
    expect(got).toContain('city_istanbul');
    expect(got).not.toContain('city_berlin');
    expect(got).not.toContain('world_kitchen');
  });
});
