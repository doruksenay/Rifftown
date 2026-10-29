// Soğuk başlangıç: NPC yargıç, aday, muhabir ve tüccar; para basma yolu olmaması
import { ITEM_BY_ID, NPC_BUY_DAILY, NPC_CIVIC, NPC_SELL_RATE } from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { closeDueElections, ensureElections } from '../src/game/politics';
import { ensureNpcCivic, npcCandidates, npcJudge, npcNews, npcOffer, npcStockMarkets, runNpcCivicNow } from '../src/game/npc-civic';
import { newPlayer, raw, setMoney, setVip, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
async function slow<T>(fn: () => Promise<T>): Promise<T> {
  const prev = config.gameSpeed;
  config.gameSpeed = 3600;
  try {
    return await fn();
  } finally {
    config.gameSpeed = prev;
  }
}

describe('NPC kadrosu', () => {
  it('her şehirde yargıç, aday, muhabir ve tüccar kurulur; aramada ve sosyal hedeflerde görünmez', async () => {
    await ensureNpcCivic();
    await ensureNpcCivic(); // ikinci kez kurmaz
    const n = (await q(`SELECT count(*)::int AS n FROM characters WHERE npc_role IS NOT NULL`)).rows[0].n;
    expect(n).toBe(NPC_CIVIC.length);
    const p = await newPlayer();
    const judge = (await q(`SELECT id FROM characters WHERE npc_key = 'istanbul-judge'`)).rows[0].id;
    expect((await p.c.post(`/api/friends/${judge}`)).body.error).toBe('npc_target');
    expect((await p.c.get('/api/characters?search=Hakim')).body.characters).toHaveLength(0);
  });

  it('yedek yargıç: VIP oyuncu yargıç yoksa davaya erken karar verir, ikramiye almaz; oyuncu yargıç varsa bekler', () =>
    slow(async () => {
      const suspect = await newPlayer();
      await q(`INSERT INTO crimes(character_id, city_id, location_id, kind, success, loot, status) VALUES ($1, 'istanbul', 'istanbul-park', 'pickpocket', false, 0, 'caught')`, [suspect.character.id]);
      const crime = (await q('SELECT id FROM crimes WHERE character_id = $1', [suspect.character.id])).rows[0].id;
      // Son tarihe az kaldı (süresinin yarısını geçmiş)
      await q(`INSERT INTO cases(crime_id, suspect_id, city_id, due_at) VALUES ($1, $2, 'istanbul', now() + interval '2 seconds')`, [crime, suspect.character.id]);
      // Şehirde VIP oyuncu yargıç var: NPC bekler
      const judge = await newPlayer();
      await setVip(judge.userId);
      await q(`UPDATE characters SET profession = 'judge' WHERE id = $1`, [judge.character.id]);
      await npcJudge();
      expect((await q('SELECT status FROM cases WHERE suspect_id = $1', [suspect.character.id])).rows[0].status).toBe('pending');
      await q(`UPDATE characters SET profession = NULL WHERE id = $1`, [judge.character.id]);
      await npcJudge();
      const k = (await q('SELECT k.status, j.npc, j.money FROM cases k JOIN characters j ON j.id = k.judge_id WHERE k.suspect_id = $1', [suspect.character.id])).rows[0];
      expect(k.status).toBe('convicted');
      expect(k.npc).toBe(true);
      expect(k.money).toBe(0);
    }));

  it('NPC aday: boş seçime girer; oyuncu adayla eşit oyda oyuncu kazanır; NPC makam sahibi maaş almaz', async () => {
    await ensureElections();
    await npcCandidates();
    const e = (await q(`SELECT id FROM elections WHERE city_id = 'izmir' AND office = 'mayor' AND status = 'open'`)).rows[0].id;
    const npc = (await q(`SELECT id FROM characters WHERE npc_key = 'izmir-candidate'`)).rows[0].id;
    expect((await q('SELECT 1 FROM election_candidates WHERE election_id = $1 AND character_id = $2', [e, npc])).rowCount).toBe(1);
    // Oyuncu aday da girer; kimse oy vermez: eşitlikte oyuncu kazanır
    const p = await newPlayer({ cityId: 'izmir' });
    await q(`INSERT INTO election_candidates(election_id, character_id, platform, created_at) VALUES ($1, $2, '', now() + interval '1 hour')`, [e, p.character.id]);
    await q(`UPDATE elections SET ends_at = now() - interval '1 second' WHERE id = $1`, [e]);
    await closeDueElections();
    expect((await q('SELECT winner_id FROM elections WHERE id = $1', [e])).rows[0].winner_id).toBe(p.character.id);
    // Rakipsiz seçimi NPC kazanır, maaş almaz
    await ensureElections();
    await npcCandidates();
    const e2 = (await q(`SELECT id FROM elections WHERE city_id = 'ankara' AND office = 'governor' AND status = 'open'`)).rows[0].id;
    await q(`UPDATE elections SET ends_at = now() - interval '1 second' WHERE id = $1`, [e2]);
    await closeDueElections();
    const holder = (await q(`SELECT h.character_id, h.last_paid_at, c.npc FROM office_holders h JOIN characters c ON c.id = h.character_id WHERE h.city_id = 'ankara' AND h.office = 'governor'`)).rows[0];
    expect(holder.npc).toBe(true);
    await q(`UPDATE office_holders SET last_paid_at = now() - interval '1 day' WHERE city_id = 'ankara' AND office = 'governor'`);
    const { payOfficeSalaries } = await import('../src/game/politics');
    await payOfficeSalaries();
    expect((await q('SELECT money FROM characters WHERE id = $1', [holder.character_id])).rows[0].money).toBe(0);
  });

  it('NPC muhabir iyi konserden iki dilli haber yazar; aynı gruba konser sonrası bir kez', () => slow(async () => {
    const p = await newPlayer();
    await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Haber', 'rock', 50)`, [p.character.id]);
    const band = (await p.c.post('/api/bands', { name: `Manşet ${p.character.id}`, genre: 'rock', role: 'guitar' })).body.band;
    for (let i = 0; i < 4; i++) {
      await q(
        `INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist, status, result) VALUES ($1, 'lyon', 'lyon-club', now() - interval '1 second', $2, 'done', '{"quality": 80, "attendance": 300}')`,
        [band.id, [band.songs[0].id]],
      );
    }
    await npcNews();
    const news = (await p.c.get('/api/cities/lyon/news')).body.articles.filter((a: any) => a.npc);
    expect(news.length).toBe(1);
    // Haber parçalardan kurulur (denge raporu madde 10): grup adı başlıkta ya da metinde, metin konseri bilir
    // (seyirci sayısı, mekân, şehir ya da gecenin şarkısı)
    expect(`${news[0].titleEn} ${news[0].bodyEn}`).toContain(band.name);
    expect(['300', 'Péniche', 'Lyon', band.songs[0].title].some((x) => news[0].body.includes(x))).toBe(true);
    await npcNews();
    expect((await p.c.get('/api/cities/lyon/news')).body.articles.filter((a: any) => a.npc)).toHaveLength(1);
  }));
});

describe('NPC tüccar ve ekonomi', () => {
  // Günlük sınır oyun gününe bakar: testin hızlı saatinde (1 gün = 24 ms) pencere test bitmeden kapanabiliyordu
  it('yalnızca atölye ürünü alır, malzeme maliyetini aşmaz, günde sınırlı; dükkân eşyası ve efsanevi eşya alınmaz', () => slow(async () => {
    const p = await newPlayer();
    await setMoney(p.character.id, 0);
    const crafted = (await q(`INSERT INTO inventory(character_id, item_id, slot, bonus, crafted_by) VALUES ($1, 'guitar_crafted', 'guitar', 14, $1) RETURNING id`, [p.character.id])).rows[0].id;
    const shop = (await q(`INSERT INTO inventory(character_id, item_id, slot) VALUES ($1, 'guitar_1', 'guitar') RETURNING id`, [p.character.id])).rows[0].id;
    expect((await p.c.post('/api/market/npc-sell', { locationId: 'istanbul-flea_market', inventoryId: shop })).body.error).toBe('npc_wont_buy');
    const offer = npcOffer('guitar_crafted', 14);
    // Malzeme: ağaç 60 + tel 25 + manyetik 90 = 175; teklif en fazla 175 × 1,25
    expect(offer).toBeLessThanOrEqual(Math.round(175 * 1.25));
    expect(offer).toBeLessThanOrEqual(ITEM_BY_ID.guitar_crafted.price * 0.4);
    const sold = await p.c.post('/api/market/npc-sell', { locationId: 'istanbul-flea_market', inventoryId: crafted });
    expect(sold.status).toBe(200);
    expect((await raw(p.character.id)).money).toBe(offer);
    for (let i = 1; i < NPC_BUY_DAILY; i++) {
      const id = (await q(`INSERT INTO inventory(character_id, item_id, slot, bonus) VALUES ($1, 'outfit_crafted', 'outfit', 8) RETURNING id`, [p.character.id])).rows[0].id;
      expect((await p.c.post('/api/market/npc-sell', { locationId: 'istanbul-flea_market', inventoryId: id })).status).toBe(200);
    }
    const extra = (await q(`INSERT INTO inventory(character_id, item_id, slot, bonus) VALUES ($1, 'outfit_crafted', 'outfit', 8) RETURNING id`, [p.character.id])).rows[0].id;
    expect((await p.c.post('/api/market/npc-sell', { locationId: 'istanbul-flea_market', inventoryId: extra })).body.error).toBe('npc_daily_limit');
    const legend = (await q(`INSERT INTO inventory(character_id, item_id, slot, bonus, legendary_at) VALUES ($1, 'keys_crafted', 'keys', 14, now()) RETURNING id`, [p.character.id])).rows[0].id;
    await q('DELETE FROM npc_sales WHERE character_id = $1', [p.character.id]);
    expect((await p.c.post('/api/market/npc-sell', { locationId: 'istanbul-flea_market', inventoryId: legend })).body.error).toBe('npc_wont_buy');
  }));

  it('NPC tüccar ilanları dükkân fiyatının altında ama geri satışta zarar ettirir; satış parası oyundan çıkar', async () => {
    await ensureNpcCivic();
    await npcStockMarkets(() => 0.5);
    const listing = (await q(`SELECT l.* FROM listings l JOIN characters c ON c.id = l.seller_id WHERE c.npc_key = 'istanbul-trader' AND l.status = 'active' LIMIT 1`)).rows[0];
    expect(listing).toBeDefined();
    const def = ITEM_BY_ID[listing.item_id];
    expect(listing.price).toBeGreaterThanOrEqual(Math.ceil(def.price * NPC_SELL_RATE));
    expect(listing.price).toBeGreaterThan(Math.floor(def.price * 0.5)); // dükkâna geri satış yarı fiyat: al-sat zarar
    const buyer = await newPlayer();
    await setMoney(buyer.character.id, 100000);
    const bought = await buyer.c.post(`/api/market/${listing.id}/buy`, { locationId: 'istanbul-flea_market' });
    expect(bought.status).toBe(200);
    await runNpcCivicNow();
    expect((await q(`SELECT money FROM characters WHERE npc_key = 'istanbul-trader'`)).rows[0].money).toBe(0);
  });

  it('NPC tüccar başka şehrin nadir eşyasını ya da hatırasını satmaz', async () => {
    await ensureNpcCivic();
    for (let k = 0; k < 25; k++) await npcStockMarkets(() => (k + 0.5) / 25);
    const rows = (await q(`SELECT l.item_id, c.npc_key FROM listings l JOIN characters c ON c.id = l.seller_id WHERE c.npc_role = 'trader'`)).rows;
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      const only = ITEM_BY_ID[r.item_id].cityOnly;
      if (only) expect(r.npc_key, r.item_id).toBe(`${only}-trader`);
    }
  });
});
