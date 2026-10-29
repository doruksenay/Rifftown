// Zamanlayıcı dururken oyuncu "meşgul" takılmaz (playtest O-11): süresi dolan eylem okuma anında (/me, yeni eylem,
// erken bitir) tamamlanır; zamanlayıcı aynı anda çalışsa da eylem bir kez sonuçlanır. Yavaş saatte çalışır.
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { tick } from '../src/worker';
import { me, newPlayer, setup, sleep, teardown } from './helpers';

beforeAll(setup);
afterAll(teardown);
let prev = 0;
beforeEach(() => {
  prev = config.gameSpeed;
  config.gameSpeed = 3600; // 1 oyun saati = 1 sn
});
afterEach(() => {
  config.gameSpeed = prev;
});

const doneNotes = async (characterId: number) =>
  (await pool.query(`SELECT data FROM notifications WHERE character_id = $1 AND kind = 'action_done'`, [characterId])).rows;

describe('okuma anında tamamlama', () => {
  it('zamanlayıcı çalışmadan /me süresi dolan eylemi sonuçlandırır (bildirim dahil)', async () => {
    const p = await newPlayer();
    const r = await p.c.post('/api/actions', { kind: 'rest', hours: 1 });
    expect(r.status).toBe(200);
    expect((await me(p.c)).action).not.toBeNull(); // daha bitmedi
    await sleep(1100);
    const m = await me(p.c);
    expect(m.action).toBeNull();
    const notes = await doneNotes(p.character.id);
    expect(notes).toHaveLength(1);
    expect(notes[0].data.kind).toBe('rest');
  });

  it('yolculuk bitmişse yoldaki oyuncu zamanlayıcıyı beklemeden varır ve yeni eylem başlatır', async () => {
    const p = await newPlayer();
    const t = await p.c.post('/api/actions', { kind: 'travel', toCityId: 'ankara', mode: 'bus' });
    expect(t.status).toBe(200);
    // Otobüs birkaç oyun saati sürer: bitişi geçmişe çek (zamanlayıcı durmuş gibi)
    await pool.query(`UPDATE actions SET ends_at = now() - interval '1 second' WHERE id = $1`, [t.body.action.id]);
    const r = await p.c.post('/api/actions', { kind: 'rest', hours: 1 });
    expect(r.status).toBe(200);
    expect((await pool.query('SELECT city_id FROM characters WHERE id = $1', [p.character.id])).rows[0].city_id).toBe('ankara');
    expect((await doneNotes(p.character.id)).map((n) => n.data.kind)).toEqual(['travel']);
  });

  it('süresi dolmuş eylemi "erken bitir" tam tamamlanma yoluyla sonuçlandırır', async () => {
    const p = await newPlayer();
    const r = await p.c.post('/api/actions', { kind: 'study', skill: 'guitar', hours: 1 });
    await pool.query(`UPDATE actions SET ends_at = now() - interval '1 second' WHERE id = $1`, [r.body.action.id]);
    const c = await p.c.post('/api/actions/cancel');
    expect(c.status).toBe(200);
    expect(c.body.action.status).toBe('done');
    expect(await doneNotes(p.character.id)).toHaveLength(1);
  });

  it('zamanlayıcı ve okuma aynı anda: eylem bir kez sonuçlanır', async () => {
    for (let i = 0; i < 5; i++) {
      const p = await newPlayer();
      const r = await p.c.post('/api/actions', { kind: 'work', locationId: 'istanbul-work', hours: 2 });
      await pool.query(`UPDATE actions SET ends_at = now() - interval '1 second' WHERE id = $1`, [r.body.action.id]);
      const before = Number((await pool.query('SELECT money FROM characters WHERE id = $1', [p.character.id])).rows[0].money);
      await Promise.all([tick(), me(p.c), p.c.get('/api/me'), tick()]);
      expect(await doneNotes(p.character.id)).toHaveLength(1);
      const pay = (await doneNotes(p.character.id))[0].data.pay;
      expect(Number((await pool.query('SELECT money FROM characters WHERE id = $1', [p.character.id])).rows[0].money)).toBe(before + pay);
    }
  });
});
