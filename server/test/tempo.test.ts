// İlk günlerin temposu (playtest Y-3): uzun işin 4 saatten sonrası ve yeni karakterin ilk 48 oyun saati daha az yorar;
// yeni hesabın XP tavanı ilk mesaide dolmaz. Yavaş saatte (1 oyun saati = 1 sn).
import { MOOD_PER_HOUR, NEWCOMER_DRAIN_MULT, XP_DAY_CAP, drainHours, xpCaps } from '@rifftown/shared';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { tick } from '../src/worker';
import { newPlayer, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(teardown);
let prev = 0;
beforeEach(() => {
  prev = config.gameSpeed;
  config.gameSpeed = 3600;
});
afterEach(() => {
  config.gameSpeed = prev;
});

const raw = async (id: number) => (await pool.query('SELECT mood, money, xp FROM characters WHERE id = $1', [id])).rows[0];
/** Eylemi başlatır, bitişini geçmişe çeker ve zamanlayıcıyı çalıştırır */
async function run(p: Awaited<ReturnType<typeof newPlayer>>, body: Record<string, unknown>) {
  const r = await p.c.post('/api/actions', body);
  expect(r.status, JSON.stringify(r.body)).toBe(200);
  await pool.query(`UPDATE actions SET ends_at = now() - interval '1 second' WHERE id = $1`, [r.body.action.id]);
  await tick();
  return (await pool.query('SELECT result FROM actions WHERE id = $1', [r.body.action.id])).rows[0].result;
}

describe('tempo', () => {
  it('kurallar: yeni başlayanda 4 saatten sonrası ×0,6 ve hepsi ×0,6; eski oyuncuda aynen', () => {
    expect(drainHours(8)).toBe(8);
    expect(drainHours(4, true)).toBeCloseTo(4 * NEWCOMER_DRAIN_MULT);
    expect(drainHours(8, true)).toBeCloseTo(6.4 * NEWCOMER_DRAIN_MULT);
    // Yeni karakterde 8 saatlik mesainin ruh hâli maliyeti eskiden 32
    expect(-MOOD_PER_HOUR.work * drainHours(8, true)).toBeLessThan(16);
    expect(xpCaps(true).day).toBeGreaterThanOrEqual(8);
    expect(xpCaps(true).day).toBeLessThan(XP_DAY_CAP);
  });

  it('yeni karakter 8 saatlik mesaiden daha az yorulur; 48 oyun saati sonra eski kural', async () => {
    const fresh = await newPlayer();
    const veteran = await newPlayer();
    await pool.query(`UPDATE characters SET created_at = now() - interval '1 day' WHERE id = $1`, [veteran.character.id]); // 1 gün = 86.400 oyun saati
    await pool.query('DELETE FROM moodlets WHERE character_id = ANY($1::bigint[])', [[fresh.character.id, veteran.character.id]]);
    const a = await run(fresh, { kind: 'work', locationId: 'istanbul-work', hours: 8 });
    const b = await run(veteran, { kind: 'work', locationId: 'istanbul-work', hours: 8 });
    expect(a.moodDelta).toBeCloseTo(MOOD_PER_HOUR.work * drainHours(8, true), 0);
    expect(b.moodDelta).toBeCloseTo(MOOD_PER_HOUR.work * drainHours(8), 0);
    // Para aynı (yalnızca yorgunluk değişti)
    expect(a.pay).toBe(b.pay);
  });

  it('yeni karakter "Yeni başlangıç" moodlet\'iyle başlar; ilk 8 saatlik mesainin XP\'si tavana takılmaz', async () => {
    const p = await newPlayer();
    const m = (await p.c.get('/api/me')).body.character.moodlets.map((x: { id: string }) => x.id);
    expect(m).toContain('fresh_start');
    const r = await run(p, { kind: 'work', locationId: 'istanbul-work', hours: 8 });
    expect(r.xp).toBeGreaterThanOrEqual(8);
    expect(Number((await raw(p.character.id)).xp)).toBeGreaterThanOrEqual(8);
  });
});
