// Aile planlaması ve hamilelik: ayar varsayılan kapalı, korunmalıda ihtimal sıfır, bilinçli deneme, doğum, sınırlar
import { FLING_PREGNANCY_CHANCE, MAX_CHILDREN, TRY_PREGNANCY_CHANCE } from '@rifftown/shared';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { processBirths } from '../src/game/family';
import { newPlayer, setup, teardown } from './helpers';

let prevSpeed = 0;
beforeAll(async () => {
  await setup();
  prevSpeed = config.gameSpeed;
  config.gameSpeed = 3600; // bekleme süreleri oyun gününe bakar
});
afterAll(async () => {
  config.gameSpeed = prevSpeed;
  await teardown();
  await pool.end();
});
afterEach(() => vi.restoreAllMocks());

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
type P = Awaited<ReturnType<typeof newPlayer>>;
const open = (p: P, on = true) => p.c.post('/api/family/open', { open: on });
const at = (p: P, loc: string) => q('UPDATE characters SET location_id = $2, energy = 100, energy_at = now() WHERE id = $1', [p.character.id, loc]);
const pregnancies = async (p: P) => (await q(`SELECT * FROM pregnancies WHERE carrier_id = $1 OR other_id = $1`, [p.character.id])).rows;
async function couple(stage = 'dating', romance = 45) {
  const a = await newPlayer();
  const b = await newPlayer();
  const [x, y] = [a.character.id, b.character.id].sort((m, n) => m - n);
  await q(`INSERT INTO relationships(a_id, b_id, friends, friendship, romance, stage) VALUES ($1, $2, TRUE, 50, $3, $4)`, [x, y, romance, stage]);
  return { a, b };
}
/** Bar'da tek gecelik: iki taraf da tercihini verir */
async function fling(a: P, b: P, protA: boolean, protB: boolean) {
  await at(a, 'istanbul-bar');
  await at(b, 'istanbul-bar');
  expect((await a.c.post(`/api/relationships/${b.character.id}/fling`, { protected: protA })).status).toBe(200);
  return b.c.post(`/api/relationships/${a.character.id}/fling/accept`, { protected: protB });
}

describe('tek gecelik maceradan hamilelik', () => {
  it('ayar varsayılan kapalı; korunmalıda ihtimal tam sıfır; korunmasız ama ayarı kapalı olan varsa sıfır', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    expect((await a.c.get('/api/family')).body).toEqual({ familyOpen: false, pregnancy: null });
    vi.spyOn(Math, 'random').mockReturnValue(0); // zar her zaman "tutar"
    // Ayar kapalı, korunmasız: yine de sıfır
    expect((await fling(a, b, false, false)).body).toMatchObject({ status: 'done', protected: false, pregnancy: false });
    expect(await pregnancies(a)).toHaveLength(0);
    // İki taraf da açık ama korunmalı (biri istese yeter): sıfır
    const c = await newPlayer();
    const d = await newPlayer();
    await open(c);
    await open(d);
    await q(`INSERT INTO inventory(character_id, item_id, slot) VALUES ($1, 'condom', 'material')`, [c.character.id]);
    expect((await fling(c, d, true, false)).body).toMatchObject({ protected: true, pregnancy: false });
    expect(await pregnancies(c)).toHaveLength(0);
    // Yalnızca biri açık
    const e = await newPlayer();
    const f = await newPlayer();
    await open(e);
    expect((await fling(e, f, false, false)).body.pregnancy).toBe(false);
  });

  it('korunmasız ve iki taraf da açıksa çok düşük sabit ihtimal (deterministik zar)', async () => {
    expect(FLING_PREGNANCY_CHANCE).toBeLessThanOrEqual(0.02);
    const a = await newPlayer();
    const b = await newPlayer();
    await open(a);
    await open(b);
    vi.spyOn(Math, 'random').mockReturnValue(FLING_PREGNANCY_CHANCE + 0.001); // ihtimalin hemen üstü: tutmaz
    expect((await fling(a, b, false, false)).body.pregnancy).toBe(false);
    const c = await newPlayer();
    const d = await newPlayer();
    await open(c);
    await open(d);
    vi.spyOn(Math, 'random').mockReturnValue(FLING_PREGNANCY_CHANCE - 0.001); // hemen altı: tutar
    expect((await fling(c, d, false, false)).body.pregnancy).toBe(true);
    const p = await pregnancies(c);
    expect(p).toHaveLength(1);
    expect(p[0].source).toBe('fling');
    // İki ebeveyne de bildirim
    for (const x of [c, d]) expect((await q(`SELECT 1 FROM notifications WHERE character_id = $1 AND kind = 'pregnancy'`, [x.character.id])).rowCount).toBe(1);
  });
});

describe('bilinçli deneme ve doğum', () => {
  it('sevgili çift teklif ve kabulle dener; taşıyan çiftçe seçilir; tek hamilelik; bekleme; doğum çocuğu iki ebeveyne bağlar', async () => {
    const { a, b } = await couple();
    expect((await a.c.post(`/api/relationships/${b.character.id}/family-try`, { carrier: 'them' })).body.error).toBe('family_closed');
    await open(a);
    await open(b);
    expect((await a.c.post(`/api/relationships/${b.character.id}/family-try`, { carrier: 'them' })).status).toBe(200);
    vi.spyOn(Math, 'random').mockReturnValue(TRY_PREGNANCY_CHANCE - 0.01);
    const r = await b.c.post(`/api/relationships/${a.character.id}/family-try/accept`);
    expect(r.body).toMatchObject({ status: 'done', pregnancy: true });
    const p = (await pregnancies(a))[0];
    expect(Number(p.carrier_id)).toBe(b.character.id); // önerilen taşıyan
    const state = (await b.c.get('/api/family')).body;
    expect(state.pregnancy).toMatchObject({ carrier: true });
    expect(state.pregnancy.dueDays % 5).toBe(0); // VIP olmayana beşer günlük adımlarla
    expect((await q(`SELECT 1 FROM moodlets WHERE character_id = $1 AND kind = 'expecting'`, [b.character.id])).rowCount).toBe(1);
    // Çift başına bekleme; aynı taşıyan ikinci kez olamaz (tek hamilelik)
    expect((await a.c.post(`/api/relationships/${b.character.id}/family-try`, { carrier: 'them' })).body.error).toBe('cooldown');
    await q('DELETE FROM family_tries');
    expect((await a.c.post(`/api/relationships/${b.character.id}/family-try`, { carrier: 'them' })).body.error).toBe('cannot_carry');
    // Ayarı kapatmak süren hamileliği bozmaz
    await open(b, false);
    // Doğum
    await q(`UPDATE pregnancies SET due_at = now() - interval '1 second' WHERE id = $1`, [p.id]);
    expect(await processBirths()).toBe(1);
    const kid = (await q('SELECT * FROM children WHERE id = (SELECT child_id FROM pregnancies WHERE id = $1)', [p.id])).rows[0];
    expect([Number(kid.parent_a), Number(kid.parent_b)].sort()).toEqual([a.character.id, b.character.id].sort());
    for (const x of [a, b]) expect((await q(`SELECT 1 FROM moodlets WHERE character_id = $1 AND kind = 'new_parent'`, [x.character.id])).rowCount).toBe(1);
    expect((await q(`SELECT 1 FROM moodlets WHERE character_id = $1 AND kind = 'expecting'`, [b.character.id])).rowCount).toBe(0);
    // Doğumdan sonra taşıyan için bekleme süresi
    await open(b, true);
    await q('DELETE FROM family_tries');
    expect((await a.c.post(`/api/relationships/${b.character.id}/family-try`, { carrier: 'them' })).body.error).toBe('cannot_carry');
    // Çocuk para, beceri ya da şöhret vermez: yalnızca kayıt ve moodlet
    expect((await a.c.get(`/api/characters/${a.character.id}`)).body.character.children).toHaveLength(1);
  });

  it('başarısız deneme; sevgili olmayan, engellenen, yeni hesap ve dolu çocuk sınırı', async () => {
    const { a, b } = await couple();
    await open(a);
    await open(b);
    await a.c.post(`/api/relationships/${b.character.id}/family-try`, { carrier: 'me' });
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect((await b.c.post(`/api/relationships/${a.character.id}/family-try/accept`)).body).toMatchObject({ pregnancy: false });
    expect(await pregnancies(a)).toHaveLength(0);
    // Sevgili değil
    const x = await couple('none', 10);
    await open(x.a);
    await open(x.b);
    expect((await x.a.c.post(`/api/relationships/${x.b.character.id}/family-try`, { carrier: 'me' })).body.error).toBe('need_partner');
    // Engel
    const y = await couple();
    await open(y.a);
    await open(y.b);
    await q('INSERT INTO blocks(blocker_id, blocked_id) VALUES ($1, $2)', [y.b.character.id, y.a.character.id]);
    expect((await y.a.c.post(`/api/relationships/${y.b.character.id}/family-try`, { carrier: 'me' })).body.error).toBe('blocked');
    // Yeni hesap
    const z = await couple();
    await open(z.a);
    await open(z.b);
    const prev = config.tradeMinAccountHours;
    config.tradeMinAccountHours = 72;
    try {
      expect((await z.a.c.post(`/api/relationships/${z.b.character.id}/family-try`, { carrier: 'me' })).body.error).toBe('account_too_new');
    } finally {
      config.tradeMinAccountHours = prev;
    }
    // Çocuk sınırı
    for (let i = 0; i < MAX_CHILDREN; i++) await q(`INSERT INTO children(parent_a, parent_b, name) VALUES ($1, $2, 'Çocuk')`, [z.a.character.id, z.b.character.id]);
    expect((await z.a.c.post(`/api/relationships/${z.b.character.id}/family-try`, { carrier: 'me' })).body.error).toBe('too_many_children');
  });
});
