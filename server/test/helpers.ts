import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { pool } from '../src/db';
import { migrate } from '../src/migrate';
import { tick } from '../src/worker';

let app: FastifyInstance;
/** Uygulamada kayıtlı bütün uçlar (fuzz testi dolaşır) */
export const ROUTES: { method: string; url: string }[] = [];

export async function setup() {
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await migrate(pool, 'migrations', () => {});
  ROUTES.length = 0;
  app = await buildApp({ logger: false, routes: ROUTES });
  await app.ready();
  return app;
}

export async function teardown() {
  await app?.close();
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Zamanın geçmesini bekler ve zamanlayıcıyı çalıştırır. */
export async function advance(ms = 80) {
  await sleep(ms);
  return tick();
}

export interface Client {
  token: string;
  get: (url: string) => Promise<{ status: number; body: any }>;
  post: (url: string, body?: unknown) => Promise<{ status: number; body: any }>;
  patch: (url: string, body?: unknown) => Promise<{ status: number; body: any }>;
  del: (url: string) => Promise<{ status: number; body: any }>;
}

export function client(token = ''): Client {
  const call = async (method: string, url: string, body?: unknown) => {
    const r = await app.inject({
      method: method as any,
      url,
      headers: token ? { authorization: `Bearer ${token}` } : {},
      ...(body !== undefined ? { payload: body as any } : {}),
    });
    return { status: r.statusCode, body: r.body ? JSON.parse(r.body) : null };
  };
  return {
    token,
    get: (u) => call('GET', u),
    post: (u, b) => call('POST', u, b ?? {}),
    patch: (u, b) => call('PATCH', u, b ?? {}),
    del: (u) => call('DELETE', u),
  };
}

let seq = 0;
/** Kayıt olur ve karakter oluşturur. */
export async function newPlayer(opts: { name?: string; cityId?: string; instrument?: string } = {}) {
  seq++;
  const anon = client();
  const reg = await anon.post('/api/auth/register', { email: `oyuncu${seq}_${Date.now()}@test.com`, password: 'gizli12345', acceptTerms: true });
  if (reg.status !== 200) throw new Error(`register failed ${JSON.stringify(reg.body)}`);
  const c = client(reg.body.token);
  const name = opts.name ?? `Oyuncu ${String.fromCharCode(65 + (seq % 26))}${String.fromCharCode(97 + Math.floor(seq / 26))}x`;
  const ch = await c.post('/api/character', {
    name,
    cityId: opts.cityId ?? 'istanbul',
    mainInstrument: opts.instrument ?? 'guitar',
  });
  if (ch.status !== 200) throw new Error(`character failed ${JSON.stringify(ch.body)}`);
  return { c, character: ch.body.character, userId: reg.body.user.id as number };
}

export async function me(c: Client) {
  return (await c.get('/api/me')).body;
}

export async function setMoney(characterId: number, money: number) {
  await pool.query('UPDATE characters SET money = $2 WHERE id = $1', [characterId, money]);
}

export async function setVip(userId: number, days = 30) {
  await pool.query(`UPDATE users SET vip_until = now() + ($2::int * interval '1 day') WHERE id = $1`, [userId, days]);
}

export async function setSkills(characterId: number, skills: Record<string, number>) {
  await pool.query('UPDATE characters SET skills = skills || $2::jsonb WHERE id = $1', [characterId, JSON.stringify(skills)]);
}

/** Oturum başlığı olmadan, istenen başlıklarla ham istek */
export async function rawPost(url: string, body: unknown, headers: Record<string, string> = {}) {
  const r = await app.inject({ method: 'POST', url, headers, payload: body as any });
  return { status: r.statusCode, body: r.body ? JSON.parse(r.body) : null };
}

/** Karakterin veritabanındaki ham değerleri (API, VIP olmayanlara bulanık değer gönderir). */
export async function raw(characterId: number) {
  const r = await pool.query('SELECT money, mood, health, skills FROM characters WHERE id = $1', [characterId]);
  return r.rows[0] as { money: number; mood: number; health: number; skills: Record<string, number> };
}

/** Ham istek: yanıt gövdesi JSON olmayabilir (ör. resim) */
export async function inject(method: string, url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) {
  return app.inject({
    method: method as any,
    url,
    headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...(opts.headers ?? {}) },
    ...(opts.payload !== undefined ? { payload: opts.payload as any } : {}),
  });
}
