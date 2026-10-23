import pg from 'pg';
import { config } from './config';

// BIGINT ve NUMERIC değerlerini JavaScript sayısına çevir (id'ler 2^53'ü aşmaz).
pg.types.setTypeParser(20, (v) => Number(v));
pg.types.setTypeParser(1016 as any, (v: string) => (v === '{}' ? [] : v.slice(1, -1).split(',').map(Number))); // BIGINT[]

export type Db = pg.Pool | pg.PoolClient;

export function createPool(url = config.databaseUrl) {
  return new pg.Pool({ connectionString: url, max: 10 });
}

export let pool = createPool();

/** Testler için havuzu değiştirmeye yarar. */
export function setPool(p: pg.Pool) {
  pool = p;
}

/** Bir işlemi tek bir veritabanı işlemi (transaction) içinde çalıştırır. */
export async function tx<T>(fn: (c: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const out = await fn(client);
    await client.query('COMMIT');
    return out;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

export async function one<T = any>(db: Db, sql: string, params: unknown[] = []): Promise<T | null> {
  const r = await db.query(sql, params);
  return (r.rows[0] as T) ?? null;
}

export async function many<T = any>(db: Db, sql: string, params: unknown[] = []): Promise<T[]> {
  const r = await db.query(sql, params);
  return r.rows as T[];
}
