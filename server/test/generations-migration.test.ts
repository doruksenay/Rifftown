// Migration 022 (nesiller): mevcut aileler bozulmaz; eski çocuklar 18 yaşına gelince mirasçı olabilir.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { START_MONEY } from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { migrate } from '../src/migrate';
import { heirsInfo, succeed } from '../src/game/generations';

const MIGRATIONS = path.resolve(__dirname, '../migrations');
const ids: Record<string, number> = {};
const users: Record<string, number> = {};
const gameMs = (hours: number) => (hours * 3_600_000) / config.gameSpeed;

async function addUser(email: string) {
  return Number((await pool.query(`INSERT INTO users(email, password_hash, created_at) VALUES ($1, 'x', now() - interval '30 days') RETURNING id`, [email])).rows[0].id);
}
async function addCharacter(userId: number | null, name: string, extra: Record<string, unknown> = {}) {
  const r = await pool.query(
    `INSERT INTO characters(user_id, name, avatar_color, main_instrument, money, mood, skills, created_at)
     VALUES ($1, $2, '#000000', 'guitar', $3, 80, $4, now() - interval '30 days') RETURNING id`,
    [userId, name, extra.money ?? 1000, JSON.stringify({ guitar: 50, composing: 60 })],
  );
  return Number(r.rows[0].id);
}

beforeAll(async () => {
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  // 021'e kadar olan şema (022 öncesi yayındaki hâli)
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rifftown-mig-'));
  for (const f of fs.readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql') && f < '022')) fs.copyFileSync(path.join(MIGRATIONS, f), path.join(dir, f));
  await migrate(pool, dir, () => {});
  fs.rmSync(dir, { recursive: true, force: true });

  // Evli bir çift (iki ayrı hesap), evlat edinilmiş yetişkin bir çocuk ve küçük bir çocuk
  users.a = await addUser('anne@test.com');
  users.b = await addUser('baba@test.com');
  ids.a = await addCharacter(users.a, 'Eski Anne', { money: 4000 });
  ids.b = await addCharacter(users.b, 'Eski Baba');
  ids.adult = Number(
    (await pool.query('INSERT INTO children(parent_a, parent_b, name, born_at) VALUES ($1, $2, $3, $4) RETURNING id', [ids.a, ids.b, 'Eda', new Date(Date.now() - gameMs(20 * 56 * 24))])).rows[0].id,
  );
  ids.minor = Number(
    (await pool.query('INSERT INTO children(parent_a, parent_b, name, born_at) VALUES ($1, $2, $3, $4) RETURNING id', [ids.a, ids.b, 'Can', new Date(Date.now() - gameMs(3 * 56 * 24))])).rows[0].id,
  );
  // 010'dan beri var olan ölü karakter (PERMADEATH): bekleyen mirasıyla
  users.c = await addUser('olen@test.com');
  ids.dead = await addCharacter(users.c, 'Eski Olen');
  await pool.query(`UPDATE characters SET dead_at = now(), death_cause = 'old_age', former_user_id = user_id, user_id = NULL, money = 0, inherited = 700 WHERE id = $1`, [ids.dead]);
  ids.deadKid = Number((await pool.query('INSERT INTO children(parent_a, name, born_at) VALUES ($1, $2, $3) RETURNING id', [ids.dead, 'Mert', new Date(Date.now() - gameMs(19 * 56 * 24))])).rows[0].id);

  await migrate(pool, MIGRATIONS, () => {});
});

afterAll(async () => {
  await pool.end();
});

describe('migration 022: mevcut aileler', () => {
  it('mevcut karakterler 1. kuşak, emekli değil; çocuk kayıtları olduğu gibi', async () => {
    const r = (await pool.query('SELECT generation, family_name, retired_at, child_id, predecessor_id, adult_at, estate_claimed, money FROM characters WHERE id = $1', [ids.a])).rows[0];
    expect(r).toMatchObject({ generation: 1, family_name: null, retired_at: null, child_id: null, predecessor_id: null, adult_at: null, estate_claimed: false, money: 4000 });
    const kids = (await pool.query('SELECT name, heir_id, parent_a, parent_b FROM children WHERE parent_a = $1 ORDER BY id', [ids.a])).rows;
    expect(kids.map((k) => [k.name, k.heir_id])).toEqual([['Eda', null], ['Can', null]]);
    // Ölü karakter ve bekleyen mirası korunur
    expect((await pool.query('SELECT inherited, dead_at IS NOT NULL AS dead FROM characters WHERE id = $1', [ids.dead])).rows[0]).toEqual({ inherited: 700, dead: true });
  });

  it('kullanıcısız karakter yalnızca NPC, ölü ya da emekliyse olabilir (kısıt genişledi, gevşemedi)', async () => {
    await expect(
      pool.query(`INSERT INTO characters(user_id, name, avatar_color, main_instrument, money, mood, skills) VALUES (NULL, 'Sahipsiz', '#000000', 'guitar', 0, 80, '{}')`),
    ).rejects.toThrow(/characters_npc_user/);
    await pool.query(`INSERT INTO characters(user_id, name, avatar_color, main_instrument, money, mood, skills, retired_at) VALUES (NULL, 'Emekli Kayit', '#000000', 'guitar', 0, 80, '{}', now())`);
  });

  it('eski yetişkin çocuk mirasçı olur (diğer ebeveynin onayıyla); küçük çocuk olamaz', async () => {
    const info = await heirsInfo(users.a, false, pool);
    expect(info.children.find((k) => k.childId === ids.minor)?.blocker).toBe('not_adult');
    expect(info.children.find((k) => k.childId === ids.adult)?.blocker).toBe('consent_needed');
    await pool.query('UPDATE children SET heir_request_by = $2, heir_request_at = now(), heir_consent_for = $2, heir_consent_at = now() WHERE id = $1', [ids.adult, ids.a]);
    const r = await succeed(users.a, false, { childId: ids.adult, cityId: 'istanbul', mainInstrument: 'guitar', favoriteGenre: 'rock', avatarColor: '#000000' });
    expect(r.character.name).toBe('Eda Anne');
    expect(r.inheritance).toBe(2000);
    expect(r.character.money).toBe(START_MONEY + 2000);
    const row = (await pool.query('SELECT generation, family_name FROM characters WHERE id = $1', [r.character.id])).rows[0];
    expect(row).toEqual({ generation: 2, family_name: 'Anne' });
    await expect(succeed(users.a, false, { childId: ids.minor, cityId: 'istanbul', mainInstrument: 'guitar', favoriteGenre: 'rock', avatarColor: '#000000' })).rejects.toThrow();
  });

  it('migration öncesi ölen karakterin yetişkin çocuğu da mirasçı olabilir; bekleyen miras bir kez geçer', async () => {
    const r = await succeed(users.c, false, { childId: ids.deadKid, cityId: 'istanbul', mainInstrument: 'guitar', favoriteGenre: 'rock', avatarColor: '#000000' });
    expect(r.character.money).toBe(START_MONEY + 700);
    expect((await pool.query('SELECT inherited FROM characters WHERE id = $1', [ids.dead])).rows[0].inherited).toBe(0);
  });
});
