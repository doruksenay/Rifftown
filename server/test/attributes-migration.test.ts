// Migration 021: mevcut oyuncular nitelik ve başlangıç XP'si alır, ilerleme kaybolmaz.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startingAttributes } from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pool } from '../src/db';
import { migrate } from '../src/migrate';

const MIGRATIONS = path.resolve(__dirname, '../migrations');
let ids: Record<string, number> = {};

async function addCharacter(name: string, instrument: string, npc = false) {
  const u = await pool.query(`INSERT INTO users(email, password_hash) VALUES ($1, 'x') RETURNING id`, [`${name}@test.com`]);
  const c = await pool.query(
    `INSERT INTO characters(user_id, name, avatar_color, main_instrument, money, mood, skills, npc)
     VALUES ($1, $2, '#000000', $3, 777, 80, $4, $5) RETURNING id`,
    [u.rows[0].id, name, instrument, JSON.stringify({ guitar: 41.5, composing: 22 }), npc],
  );
  return Number(c.rows[0].id);
}

async function addAction(characterId: number, kind: string, hours: number, status: 'done' | 'cancelled', fraction = 1) {
  await pool.query(
    `INSERT INTO actions(character_id, kind, params, ends_at, status, result) VALUES ($1, $2, $3, now(), $4, $5)`,
    [characterId, kind, JSON.stringify({ hours }), status, JSON.stringify({ fraction })],
  );
}

beforeAll(async () => {
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  // 020'ye kadar olan şema (021 öncesi yayındaki hâli)
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rifftown-mig-'));
  for (const f of fs.readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql') && f < '021')) fs.copyFileSync(path.join(MIGRATIONS, f), path.join(dir, f));
  await migrate(pool, dir, () => {});
  fs.rmSync(dir, { recursive: true, force: true });

  ids.vocal = await addCharacter('Eski Vokal', 'vocals');
  await addAction(ids.vocal, 'study', 4, 'done');
  await addAction(ids.vocal, 'study', 8, 'done');
  await addAction(ids.vocal, 'work', 8, 'cancelled', 0.5); // yarıda kesilmiş: 4 saat sayılır
  await addAction(ids.vocal, 'rest', 8, 'done'); // dinlenme sayılmaz
  await addAction(ids.vocal, 'travel', 8, 'done'); // yolculuk sayılmaz
  ids.drummer = await addCharacter('Eski Davulcu', 'drums');
  ids.guitar = await addCharacter('Cok Calisan', 'guitar');
  for (let i = 0; i < 130; i++) await addAction(ids.guitar, 'work', 8, 'done');
  ids.npc = await addCharacter('Oyunun Muzisyeni', 'bass', true);

  await migrate(pool, MIGRATIONS, () => {});
});

afterAll(async () => {
  await pool.end();
});

const row = async (id: number) => (await pool.query('SELECT attributes, xp, xp_total, skills, money FROM characters WHERE id = $1', [id])).rows[0];

describe('migration 021: mevcut oyuncular', () => {
  it('yeni karakterle aynı başlangıç nitelikleri (role göre)', async () => {
    expect((await row(ids.vocal)).attributes).toEqual(startingAttributes('vocals'));
    expect((await row(ids.drummer)).attributes).toEqual(startingAttributes('drums'));
    expect((await row(ids.guitar)).attributes).toEqual(startingAttributes('guitar'));
  });

  it('başlangıç XP: 20 + her 4 eylem saati için 1, en fazla 150; tavan kaydına yazılmaz', async () => {
    // 4 + 8 çalışma + 8 × 0,5 mesai = 16 saat → 4
    const v = await row(ids.vocal);
    expect(v.xp).toBe(24);
    expect(v.xp_total).toBe(24);
    expect((await row(ids.drummer)).xp).toBe(20);
    expect((await row(ids.guitar)).xp).toBe(150);
    expect(Number((await pool.query('SELECT count(*) FROM xp_log')).rows[0].count)).toBe(0);
  });

  it('ilerleme kaybolmaz: beceri ve para aynı; oyunun kendi müzisyenleri niteliksiz kalır', async () => {
    const v = await row(ids.vocal);
    expect(v.skills).toEqual({ guitar: 41.5, composing: 22 });
    expect(v.money).toBe(777);
    const n = await row(ids.npc);
    expect(n.attributes).toEqual({});
    expect(n.xp).toBe(0);
  });
});
