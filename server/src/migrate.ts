import fs from 'node:fs';
import path from 'node:path';
import type pg from 'pg';
import { config } from './config';

const LOCK_ID = 727274; // herhangi bir sabit sayı

/** migrations klasöründeki .sql dosyalarını sırayla ve yalnızca bir kez uygular.
 *  API ve zamanlayıcı aynı anda başlasa bile kilit sayesinde tek biri uygular. */
export async function migrate(pool: pg.Pool, dir = config.migrationsDir, log = console.log) {
  const abs = path.resolve(process.cwd(), dir);
  const files = fs.readdirSync(abs).filter((f) => f.endsWith('.sql')).sort();
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_ID]);
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    const done = new Set((await client.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name));
    for (const f of files) {
      if (done.has(f)) continue;
      const sql = fs.readFileSync(path.join(abs, f), 'utf8');
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations(name) VALUES ($1)', [f]);
        await client.query('COMMIT');
        log(`migration uygulandı: ${f}`);
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      }
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]).catch(() => {});
    client.release();
  }
}
