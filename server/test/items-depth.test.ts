// Eşya derinliği: tür uyumu, set bonusu, sezonluk ve nadir eşyalar; fiyat/bonus merdiveni korunur
import { GEAR_SETS, GENRES, INSTRUMENTS, ITEMS, ITEM_BY_ID, MAX_GENRE_BONUS, MAX_SET_BONUS, SEASONS, gearSetBonus, genreAffinity, itemsForShop, seasonAt } from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { gearBonuses } from '../src/game/common';
import { newPlayer, setMoney, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
const gearSlots = [...INSTRUMENTS, 'outfit'] as string[];

describe('kurallar', () => {
  it('tür uyumu tavanlı ve merdiveni bozmaz: yarı fiyatına alınan eşya, türünde bile pahalı eşyanın taban bonusuna yetişemez', () => {
    const shop = ITEMS.filter((i) => gearSlots.includes(i.slot) && !i.crafted && !i.reward);
    for (const i of shop) {
      if (i.genres) {
        for (const g of i.genres) expect(GENRES).toContain(g);
        expect(i.genreBonus).toBeLessThanOrEqual(MAX_GENRE_BONUS);
      }
      const best = i.bonus + Math.max(0, ...GENRES.map((g) => genreAffinity(i, g)));
      for (const j of shop) {
        if (j.slot === i.slot && i.price * 2 <= j.price) expect(best, `${i.id} < ${j.id}`).toBeLessThan(j.bonus);
      }
    }
    expect(genreAffinity(ITEM_BY_ID.guitar_2b, 'jazz')).toBe(2);
    expect(genreAffinity(ITEM_BY_ID.guitar_2b, 'metal')).toBe(0);
  });

  it('setler: her gruptan bir eşya gerekir, yalnızca en iyi set sayılır, tavanlı', () => {
    expect(GEAR_SETS.length).toBeGreaterThanOrEqual(3);
    for (const s of GEAR_SETS) for (const g of s.groups) for (const id of g) expect(ITEM_BY_ID[id], `${s.id} ${id}`).toBeDefined();
    expect(gearSetBonus(['guitar_2b'])).toBeNull();
    expect(gearSetBonus(['guitar_2b', 'outfit_3c'])).toEqual({ setId: 'jazz_club', stage: 2 });
    expect(gearSetBonus(['guitar_2d', 'outfit_2e', 'van_1', 'guitar_2c', 'outfit_2d'])!.stage).toBeLessThanOrEqual(MAX_SET_BONUS);
  });

  it('mevsimler döner; her mevsimin eşyası var; nadir eşya yalnızca kendi şehrinin rafında', () => {
    const seen = new Set(Array.from({ length: 56 }, (_, d) => seasonAt(d * 86_400_000, 1)));
    expect(seen.size).toBe(4);
    for (const s of SEASONS) expect(ITEMS.some((i) => i.season === s), s).toBe(true);
    const rare = ITEMS.filter((i) => i.cityOnly);
    for (const r of rare) {
      expect(itemsForShop(r.shop, r.cityOnly).some((x) => x.id === r.id)).toBe(true);
      expect(itemsForShop(r.shop, r.cityOnly === 'istanbul' ? 'berlin' : 'istanbul').some((x) => x.id === r.id)).toBe(false);
    }
  });
});

describe('sunucuda', () => {
  it('tür uyumlu gitar caz konserinde fazladan bonus verir; caz kulübü seti sahneye ekler', async () => {
    const p = await newPlayer();
    await q(`INSERT INTO inventory(character_id, item_id, slot, equipped) VALUES ($1, 'guitar_2b', 'guitar', TRUE), ($1, 'outfit_3c', 'outfit', TRUE)`, [p.character.id]);
    const jazz = (await gearBonuses(pool, [p.character.id], 'jazz')).get(p.character.id)!;
    const rock = (await gearBonuses(pool, [p.character.id], 'rock')).get(p.character.id)!;
    expect(jazz.instruments.guitar).toBe(9 + 2);
    expect(rock.instruments.guitar).toBe(9);
    expect(jazz.outfit).toBe(12 + 2);
    expect(jazz).toMatchObject({ setId: 'jazz_club', setStage: 2 });
  });

  it('sezonluk eşya yalnızca mevsiminde satılır', async () => {
    const prev = config.gameSpeed;
    config.gameSpeed = 1; // mevsim test boyunca değişmesin
    try {
      const p = await newPlayer();
      await setMoney(p.character.id, 5000);
      const now = seasonAt(Date.now(), 1);
      const inSeason = ITEMS.find((i) => i.season === now && i.shop === 'boutique') ?? ITEMS.find((i) => i.season === now)!;
      const offSeason = ITEMS.find((i) => i.season && i.season !== now)!;
      const buy = (id: string) => p.c.post('/api/shop/buy', { locationId: `istanbul-${ITEM_BY_ID[id].shop}`, itemId: id });
      expect((await buy(offSeason.id)).body.error).toBe('out_of_season');
      expect((await buy(inSeason.id)).status).toBe(200);
      // Ödül eşyası dükkândan alınamaz
      expect((await buy('reward_fox_jacket')).body.error).toBe('invalid_item');
    } finally {
      config.gameSpeed = prev;
    }
  });
});
