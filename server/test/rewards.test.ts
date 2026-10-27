// Para dışı ödüller: gizli keşif başarımları, ünvanlar, kişiye bağlı eşyalar, karakterli ve seçimli zincirler
import { ACHIEVEMENTS, CHAINS, ITEM_BY_ID, TITLES, TITLE_BY_ID, itemsForShop } from '@rifftown/shared';
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
  it('en az 12 gizli keşif başarımı; ünvan ve ödül eşyası kaynakları geçerli; ödüller küçük', () => {
    const disc = ACHIEVEMENTS.filter((a) => a.category === 'discovery');
    expect(disc.length).toBeGreaterThanOrEqual(12);
    expect(disc.every((a) => a.secret && !a.rule)).toBe(true);
    for (const t of TITLES) if (t.achievement) expect(ACHIEVEMENTS.some((a) => a.id === t.achievement), t.id).toBe(true);
    const characterful = CHAINS.filter((c) => c.npc);
    expect(characterful.length).toBeGreaterThanOrEqual(3);
    for (const c of characterful) {
      expect(c.steps.some((s) => s.choice?.length), c.id).toBe(true);
      expect(c.steps.some((s) => s.story), c.id).toBe(true);
    }
    for (const c of CHAINS) {
      for (const s of c.steps) {
        expect(s.reward).toBeLessThanOrEqual(120);
        if (s.titleId) expect(TITLE_BY_ID[s.titleId], s.titleId).toBeDefined();
        for (const o of s.choice ?? []) {
          expect(o.reward).toBeLessThanOrEqual(80);
          if (o.item) expect(ITEM_BY_ID[o.item]?.bound, o.item).toBe(true);
          if (o.titleId) expect(TITLE_BY_ID[o.titleId]).toBeDefined();
        }
        // Dallı adımın dalı aynı zincirdeki bir seçenektir
        if (s.branch) expect(c.steps.some((x) => x.choice?.some((o) => o.id === s.branch)), `${c.id} ${s.branch}`).toBe(true);
      }
    }
    // Ödül eşyaları dükkânda yok
    for (const shop of ['boutique', 'gallery', 'music_store'] as const) expect(itemsForShop(shop).some((i) => i.reward)).toBe(false);
  });
});

describe('seçimli zincir, kişiye bağlı eşya, ünvan', () => {
  it('Vedat Karahan zinciri: seçim kaydedilir, eşya verilir, dal seçime göre gelir; eşya el değiştiremez', async () => {
    const p = await newPlayer();
    const friend = await newPlayer();
    await q(`INSERT INTO actions(character_id, kind, params, ends_at, status, result) VALUES ($1, 'record', '{}', now(), 'done', '{"quality":50}')`, [p.character.id]);
    expect((await p.c.post('/api/chains/kingmaker/claim')).status).toBe(200);
    let st = (await p.c.get('/api/chains')).body.chains.find((x: any) => x.id === 'kingmaker');
    expect(st).toMatchObject({ step: 1, choice: true, done: true });
    expect((await p.c.post('/api/chains/kingmaker/claim')).body.error).toBe('invalid_choice');
    expect((await p.c.post('/api/chains/kingmaker/claim', { choice: 'trust' })).body).toMatchObject({ item: 'reward_vedat_mic', choice: 'trust' });
    expect((await p.c.post('/api/chains/kingmaker/claim', { choice: 'own' })).body.error).toBe('step_not_done'); // seçim bir kez
    st = (await p.c.get('/api/chains')).body.chains.find((x: any) => x.id === 'kingmaker');
    expect(st.step).toBe(2); // güven dalı: single
    expect(st.choices).toEqual({ 1: 'trust' });
    expect(st.total).toBe(4);
    const mic = (await q(`SELECT id FROM inventory WHERE character_id = $1 AND item_id = 'reward_vedat_mic'`, [p.character.id])).rows[0];
    expect(mic).toBeDefined();
    // Kişiye bağlı: dükkâna satılamaz, pazara konamaz, hediye ve takas edilemez
    expect((await p.c.post('/api/shop/sell', { inventoryId: Number(mic.id), locationId: 'istanbul-boutique' })).body.error).toBe('item_bound');
    expect((await p.c.post('/api/market', { locationId: 'istanbul-flea_market', inventoryId: Number(mic.id), price: 100 })).body.error).toBe('item_bound');
    const gift = await p.c.post('/api/gifts', { toId: friend.character.id, inventoryId: Number(mic.id) });
    expect(gift.body.error).toBe('item_bound');
    // Takas teklifinde kişiye bağlı eşya kullanılamaz
    await setMoney(friend.character.id, 1000);
    await friend.c.post('/api/shop/buy', { locationId: 'istanbul-boutique', itemId: 'outfit_1' });
    const fItem = (await q(`SELECT id FROM inventory WHERE character_id = $1 LIMIT 1`, [friend.character.id])).rows[0];
    const trade = await p.c.post('/api/trades', { toId: friend.character.id, give: [Number(mic.id)], want: [Number(fItem.id)], giveMoney: 0, wantMoney: 0, note: '' });
    expect(trade.body.error).toBe('item_bound');
    // Kendisi kuşanabilir: mikrofon vokal yuvasına girer
    expect((await p.c.post(`/api/inventory/${mic.id}/equip`)).status).toBe(200);
  });

  it('gizli keşif başarımı ünvan getirir; yalnızca kazanılmış ünvan seçilir ve profilde görünür', async () => {
    const p = await newPlayer();
    expect((await p.c.post('/api/titles', { titleId: 't_broke' })).body.error).toBe('title_not_earned');
    expect((await p.c.post('/api/titles', { titleId: 'nope' })).body.error).toBe('unknown_title');
    await setMoney(p.character.id, 0);
    const got = await evaluateAchievements(pool, p.character.id);
    expect(got).toContain('broke');
    const titles = (await p.c.get('/api/titles')).body;
    expect(titles.earned).toContain('t_broke');
    expect((await p.c.post('/api/titles', { titleId: 't_broke' })).status).toBe(200);
    expect((await p.c.get(`/api/characters/${p.character.id}`)).body.character.titleId).toBe('t_broke');
    expect((await p.c.post('/api/titles', { titleId: null })).status).toBe(200);
    // Gizli başarım kazanılana kadar adı görünmez (veride secret)
    expect(ACHIEVEMENTS.find((a) => a.id === 'broke')!.secret).toBe(true);
  });

  it('keşifler: boş salona konser, tek kişilik orkestra, altı türde şarkı, evcil hayvana ad', async () => {
    const p = await newPlayer();
    const genres = ['pop', 'rock', 'jazz', 'blues', 'folk', 'punk'];
    for (const g of genres) await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, $2, $3, 40)`, [p.character.id, `K ${g}`, g]);
    const band = (await p.c.post('/api/bands', { name: `Keşif ${p.character.id}`, genre: 'rock', role: 'guitar' })).body.band;
    const gig = (
      await q(
        `INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist, session_roles, status, result)
         VALUES ($1, 'istanbul', 'istanbul-bar', now(), $2, '{bass,drums,vocals}', 'done', '{"attendance":2,"presentCount":1,"memberCount":1,"quality":30}') RETURNING id`,
        [band.id, [band.songs[0].id]],
      )
    ).rows[0];
    await q('INSERT INTO gig_performers(gig_id, character_id, present) VALUES ($1, $2, TRUE)', [gig.id, p.character.id]);
    await q(`INSERT INTO inventory(character_id, item_id, slot, nickname) VALUES ($1, 'pet_cat', 'pet', 'Rock')`, [p.character.id]);
    const got = await evaluateAchievements(pool, p.character.id);
    expect(got).toEqual(expect.arrayContaining(['empty_room', 'one_man_band', 'genre_hopper', 'pet_named']));
    expect(got).not.toContain('legendary_owner');
  });
});
