// Yankesicilik (playtest Y-4): faili meçhul suç artık risksiz değil. Oyunun dedektifi polis oyuncusu olmayan şehirde
// suça bir kez bakar; mahkûmiyet son 7 günün faili meçhul ganimetinin yarısını da geri alır; yeni karakterin şansı düşük.
import { CITY_BY_ID, COLD_LOOT_RECOVERY, CRIME_BY_ID, crimeChance, crimeFine, npcSolveChance } from '@rifftown/shared';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { convict, processColdCases } from '../src/game/crime';
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

const q = (sql: string, p: unknown[] = []) => pool.query(sql, p);
const addCrime = async (id: number, loot: number, ageHours: number) =>
  (await q(`INSERT INTO crimes(character_id, city_id, location_id, kind, success, loot, status, created_at)
             VALUES ($1, 'istanbul', 'istanbul-park', 'pickpocket', true, $2, 'unsolved', now() - $3 * interval '1 second') RETURNING id`, [id, loot, ageHours])).rows[0].id;

describe('suç ve dedektif', () => {
  it('kurallar: beceri şansı daha çok belirler; gizlilik dedektife karşı korur', () => {
    const def = CRIME_BY_ID.pickpocket;
    expect(crimeChance(def, {}, 0)).toBeCloseTo(0.35);
    expect(crimeChance(def, { stealth: 40, street_smarts: 40 }, 0)).toBeGreaterThan(0.7);
    expect(npcSolveChance({ stealth: 40 })).toBeLessThan(npcSolveChance({}));
  });

  it('polis yokken dedektif faili meçhul suça bakar ve şehirdeki faili tutuklar; her suça bir kez', async () => {
    const p = await newPlayer();
    const crime = await addCrime(p.character.id, 50, 7); // 7 oyun saati önce (yavaş saat: 1 sn = 1 oyun saati)
    expect(await processColdCases(() => 0)).toBe(1);
    expect((await q('SELECT status FROM crimes WHERE id = $1', [crime])).rows[0].status).toBe('solved');
    expect((await q(`SELECT count(*)::int AS n FROM cases WHERE suspect_id = $1 AND status = 'pending'`, [p.character.id])).rows[0].n).toBe(1);
    expect((await q('SELECT jailed_until FROM characters WHERE id = $1', [p.character.id])).rows[0].jailed_until).not.toBeNull();
    // Şansı tutmayan suç bir daha denenmez
    const other = await newPlayer();
    const c2 = await addCrime(other.character.id, 40, 7);
    await processColdCases(() => 0.99);
    expect((await q('SELECT status, npc_checked_at FROM crimes WHERE id = $1', [c2])).rows[0]).toMatchObject({ status: 'unsolved' });
    expect(await processColdCases(() => 0)).toBe(0);
  });

  it('şehirden kaçan fail kurtulur; çok yeni suça bakılmaz', async () => {
    const p = await newPlayer();
    await addCrime(p.character.id, 50, 1);
    expect(await processColdCases(() => 0)).toBe(0); // 6 oyun saati dolmadı
    await q(`UPDATE characters SET city_id = 'ankara' WHERE id = $1`, [p.character.id]);
    await addCrime(p.character.id, 50, 8);
    expect(await processColdCases(() => 0)).toBe(0);
  });

  it('mahkûmiyet son 7 günün faili meçhul ganimetinin yarısını da geri alır', async () => {
    const p = await newPlayer();
    await q('UPDATE characters SET money = 1000 WHERE id = $1', [p.character.id]);
    await addCrime(p.character.id, 60, 2);
    await addCrime(p.character.id, 40, 3);
    const caught = (await q(`INSERT INTO crimes(character_id, city_id, location_id, kind, success, loot, status) VALUES ($1, 'istanbul', 'istanbul-park', 'pickpocket', false, 0, 'caught') RETURNING id`, [p.character.id])).rows[0].id;
    const kase = (await q(`INSERT INTO cases(crime_id, suspect_id, city_id, due_at) VALUES ($1, $2, 'istanbul', now()) RETURNING *`, [caught, p.character.id])).rows[0];
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      await convict(c, kase, 6, null);
      await c.query('COMMIT');
    } finally {
      c.release();
    }
    const fine = (await q(`SELECT data FROM notifications WHERE character_id = $1 AND kind = 'convicted'`, [p.character.id])).rows[0].data;
    expect(fine.recoveredCrimes).toBe(2);
    const penalty = crimeFine(CRIME_BY_ID.pickpocket, 0, CITY_BY_ID.istanbul.costMult);
    expect(fine.fine).toBe(Math.floor(100 * COLD_LOOT_RECOVERY) + penalty);
    expect((await q(`SELECT count(*)::int AS n FROM crimes WHERE character_id = $1 AND status = 'unsolved'`, [p.character.id])).rows[0].n).toBe(0);
  });
});
