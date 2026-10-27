// Tek gecelik macera (karşılıklı onay, bedelleri) ve aile (çocukların büyümesi, bakım gideri, boşanma)
import { CHILD_WEEKLY_UPKEEP, childStage, cheatDiscoveryChance } from '@rifftown/shared';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { evaluateAchievements } from '../src/game/achievements';
import { processChildren } from '../src/game/family';
import { newPlayer, raw, setMoney, setup, teardown } from './helpers';

// Bekleme süreleri oyun gününe bakar: bu dosyada 1 oyun saati = 1 saniye
let prevSpeed = 0;
beforeAll(async () => {
  await setup();
  prevSpeed = config.gameSpeed;
  config.gameSpeed = 3600;
});
afterAll(async () => {
  config.gameSpeed = prevSpeed;
  await teardown();
  await pool.end();
});
afterEach(() => vi.restoreAllMocks());

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
type P = Awaited<ReturnType<typeof newPlayer>>;
const at = async (p: P, loc: string) => q('UPDATE characters SET location_id = $2 WHERE id = $1', [p.character.id, loc]);
const moodlets = async (p: P) => (await q('SELECT kind FROM moodlets WHERE character_id = $1', [p.character.id])).rows.map((r) => r.kind);
const sorted = (a: P, b: P) => [a.character.id, b.character.id].sort((x, y) => x - y);

describe('tek gecelik macera', () => {
  it('karşılıklı onay: teklif, kabul; iki tarafa moodlet ve ilham; para, beceri, romantizm yok; bekleme ve günlük tavan', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    const d = await newPlayer();
    expect((await a.c.post(`/api/relationships/${b.character.id}/fling`)).body.error).toBe('wrong_place');
    await at(a, 'istanbul-bar');
    expect((await a.c.post(`/api/relationships/${b.character.id}/fling`)).body.error).toBe('not_here');
    await at(b, 'istanbul-bar');
    expect((await a.c.post(`/api/relationships/${a.character.id}/fling`)).body.error).toBe('invalid_target');
    const before = await raw(a.character.id);
    expect((await a.c.post(`/api/relationships/${b.character.id}/fling`)).status).toBe(200);
    expect((await b.c.get(`/api/relationships/${a.character.id}/fling`)).body).toMatchObject({ incoming: true, outgoing: false, familyIncoming: null });
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // pişmanlık yok
    // Korunmalı (varsayılan): kimsede prezervatif yoksa olmaz; kabul edenin prezervatifi harcanır
    expect((await b.c.post(`/api/relationships/${a.character.id}/fling/accept`)).body.error).toBe('no_protection');
    expect((await b.c.post('/api/shop/buy', { locationId: 'istanbul-hospital', itemId: 'condom', qty: 2 })).status).toBe(200);
    await at(b, 'istanbul-bar');
    const r = await b.c.post(`/api/relationships/${a.character.id}/fling/accept`);
    expect(r.body).toMatchObject({ status: 'done', protected: true, regret: false, discovered: false, pregnancy: false });
    expect((await q(`SELECT count(*)::int AS n FROM inventory WHERE character_id = $1 AND item_id = 'condom'`, [b.character.id])).rows[0].n).toBe(1);
    for (const p of [a, b]) expect(await moodlets(p)).toContain('fling');
    const after = await raw(a.character.id);
    expect(after.money).toBe(before.money);
    expect(after.skills).toEqual(before.skills);
    const [x, y] = sorted(a, b);
    const rel = (await q('SELECT friendship, romance FROM relationships WHERE a_id = $1 AND b_id = $2', [x, y])).rows[0];
    expect(Number(rel.romance)).toBe(0);
    expect(Number(rel.friendship)).toBeLessThanOrEqual(1);
    // Yanıtlanmış teklif bir daha kabul edilemez; ikili bekleme; kişi başı günlük tavan
    expect((await b.c.post(`/api/relationships/${a.character.id}/fling/accept`)).body.error).toBe('no_fling_offer');
    expect((await a.c.post(`/api/relationships/${b.character.id}/fling`)).body.error).toBe('cooldown');
    await at(d, 'istanbul-bar');
    expect((await d.c.post(`/api/relationships/${a.character.id}/fling`)).body.error).toBe('fling_daily_cap');
  });

  it('engellenen kişiye teklif yok; yeni hesaplar katılamaz; ret bildirimi gider', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    await at(a, 'istanbul-club');
    await at(b, 'istanbul-club');
    await q('INSERT INTO blocks(blocker_id, blocked_id) VALUES ($1, $2)', [b.character.id, a.character.id]);
    expect((await a.c.post(`/api/relationships/${b.character.id}/fling`)).body.error).toBe('blocked');
    await q('DELETE FROM blocks WHERE blocker_id = $1', [b.character.id]);
    const prev = config.tradeMinAccountHours;
    config.tradeMinAccountHours = 72;
    try {
      expect((await a.c.post(`/api/relationships/${b.character.id}/fling`)).body.error).toBe('account_too_new');
    } finally {
      config.tradeMinAccountHours = prev;
    }
    expect((await a.c.post(`/api/relationships/${b.character.id}/fling`)).status).toBe(200);
    expect((await b.c.post(`/api/relationships/${a.character.id}/fling/decline`)).body.status).toBe('declined');
    expect((await q(`SELECT 1 FROM notifications WHERE character_id = $1 AND kind = 'fling_declined'`, [a.character.id])).rowCount).toBe(1);
  });

  it('aldatma: sevgilisi olan katılırsa ortaya çıkabilir; partner aldatıldı, ilişki biter; şöhretliyse dedikodu skandalı', async () => {
    const cheater = await newPlayer();
    const partner = await newPlayer();
    const stranger = await newPlayer();
    const [x, y] = sorted(cheater, partner);
    await q(`INSERT INTO relationships(a_id, b_id, friends, friendship, romance, stage) VALUES ($1, $2, TRUE, 50, 45, 'dating')`, [x, y]);
    await q('INSERT INTO partners(character_id, partner_id) VALUES ($1, $2), ($2, $1)', [cheater.character.id, partner.character.id]);
    await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Ün', 'pop', 50)`, [cheater.character.id]);
    const band = (await cheater.c.post('/api/bands', { name: `Ünlü ${cheater.character.id}`, genre: 'pop', role: 'guitar' })).body.band;
    await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 40)`, [band.id]);
    await at(cheater, 'istanbul-hotel');
    await at(stranger, 'istanbul-hotel');
    expect((await stranger.c.post(`/api/relationships/${cheater.character.id}/fling`)).status).toBe(200);
    vi.spyOn(Math, 'random').mockReturnValue(0); // dedikodu ve ortaya çıkma kesin
    await q(`INSERT INTO inventory(character_id, item_id, slot) VALUES ($1, 'condom', 'material')`, [cheater.character.id]);
    const r = await cheater.c.post(`/api/relationships/${stranger.character.id}/fling/accept`);
    expect(r.body).toMatchObject({ status: 'done', gossip: true, regret: true, discovered: true });
    expect(await moodlets(partner)).toEqual(expect.arrayContaining(['cheated', 'heartbreak']));
    expect(await moodlets(cheater)).toContain('regret');
    const rel = (await q('SELECT stage, romance FROM relationships WHERE a_id = $1 AND b_id = $2', [x, y])).rows[0];
    expect(rel.stage).toBe('none');
    expect((await q('SELECT 1 FROM partners WHERE character_id = $1', [partner.character.id])).rowCount).toBe(0);
    expect((await q(`SELECT 1 FROM scandals WHERE kind = 'affair' AND band_id = $1`, [band.id])).rowCount).toBe(1);
    expect((await q(`SELECT data FROM notifications WHERE character_id = $1 AND kind = 'cheated_on'`, [partner.character.id])).rows[0].data).toMatchObject({ ended: true });
    expect(cheatDiscoveryChance(false, false)).toBeLessThan(cheatDiscoveryChance(true, true));
  });

  it('üç macera "Çapkın" gizli başarımını ve ünvanını getirir', async () => {
    const p = await newPlayer();
    for (let i = 0; i < 3; i++) await q(`INSERT INTO flings(a_id, b_id, location_id) VALUES ($1, NULL, 'istanbul-bar')`, [p.character.id]);
    expect(await evaluateAchievements(pool, p.character.id)).toContain('heartbreaker');
    expect((await p.c.get('/api/titles')).body.earned).toContain('t_heartbreaker');
  });
});

describe('aile', () => {
  it('çocuk büyür; reşit olmayan çocuğun haftalık gideri iki ebeveyne yarı yarıya; boşanma gideri değiştirmez; para yetmezse moodlet', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    await setMoney(a.character.id, 100);
    await setMoney(b.character.id, 5);
    // Bebek (oyun takviminde birkaç günlük) ve yetişkin bir çocuk
    await q(`INSERT INTO children(parent_a, parent_b, name, born_at) VALUES ($1, $2, 'Deniz', now() - interval '200 seconds')`, [a.character.id, b.character.id]);
    await q(`INSERT INTO children(parent_a, parent_b, name, born_at) VALUES ($1, $2, 'Ece', now() - interval '40000 seconds')`, [a.character.id, b.character.id]);
    await processChildren();
    const share = CHILD_WEEKLY_UPKEEP / 2;
    expect((await raw(a.character.id)).money).toBe(100 - share); // yalnızca bebek için
    expect((await raw(b.character.id)).money).toBe(5); // yetmedi: borç yok
    expect(await moodlets(a)).toEqual(expect.arrayContaining(['family_evening', 'sleepless']));
    expect(await moodlets(b)).toContain('family_strain');
    // Bir sonraki hafta gelmeden tekrar kesilmez
    await processChildren();
    expect((await raw(a.character.id)).money).toBe(100 - share);
    // Profilde yaş ve basamak
    const kids = (await a.c.get(`/api/characters/${a.character.id}`)).body.character.children;
    expect(kids.map((k: any) => k.stage)).toEqual(['adult', 'baby']);
    expect(childStage(5)).toBe('child');
    expect(childStage(15)).toBe('teen');
    // Ebeveynin hesabı silinse de çocuk kaydı kalır
    await q('DELETE FROM characters WHERE id = $1', [b.character.id]);
    expect((await q('SELECT parent_a, parent_b FROM children WHERE name = $1', ['Deniz'])).rows[0]).toMatchObject({ parent_b: null });
  });
});
