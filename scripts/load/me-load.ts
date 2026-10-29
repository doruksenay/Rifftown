// /me yük ölçümü (playtest O-10): N eşzamanlı oyuncu, gerçek HTTP (Fastify listen + fetch), havuz PG_POOL_MAX (10).
// Kullanım: npx tsx scripts/load/me-load.ts [oyuncu=250] [tur=3]   (veritabanı LOAD_DB, varsayılan rifftown_sim)
// Playtest'teki t_load.mjs ile aynı istek karışımı: /me, /cities/:id, /notifications, /bands/mine, eylem, /leaderboard, /market.
const DB = process.env.LOAD_DB ?? 'rifftown_sim';
if (/^rifftown(_test)?$/.test(DB)) throw new Error(`${DB} kullanılamaz`);
process.env.DATABASE_URL = `postgres://postgres@localhost:5432/${DB}`;
process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;
process.env.RATE_LIMIT = '0';
process.env.REGISTER_PER_IP_DAY = '0';
process.env.LOG_LEVEL = 'silent';
process.env.NPC = '0';
process.env.PUSH_ENABLED = '0';

const { buildApp } = await import('../../server/src/app');
const { pool } = await import('../../server/src/db');
const { migrate } = await import('../../server/src/migrate');

const N = Number(process.argv[2] ?? 250);
const ROUNDS = Number(process.argv[3] ?? 3);
await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
await migrate(pool, 'server/migrations', () => {});
const app = await buildApp({ logger: false });
await app.listen({ port: 0, host: '127.0.0.1' });
const addr = app.server.address();
const BASE = `http://127.0.0.1:${typeof addr === 'object' && addr ? addr.port : 0}/api`;

async function call(token: string | null, method: string, path: string, body?: unknown) {
  const t0 = performance.now();
  const r = await fetch(BASE + path, {
    method,
    headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  return { status: r.status, ms: performance.now() - t0, body: text ? JSON.parse(text) : null };
}

const L = 'abcdefghijklmnoprstuvyz';
const nm = (i: number) => 'Yuk ' + [...String(i).padStart(3, '0')].map((d) => L[+d]).join('') + 'an';
const cities = ['istanbul', 'ankara', 'izmir', 'berlin', 'london', 'paris', 'newyork'];
const insts = ['guitar', 'vocals', 'bass', 'drums', 'keys'];
const tokens: string[] = [];
for (let i = 0; i < N; i += 25) {
  tokens.push(
    ...(await Promise.all(
      Array.from({ length: Math.min(25, N - i) }, async (_, k) => {
        const j = i + k;
        const r = await call(null, 'POST', '/auth/register', { email: `load${j}@load.test`, password: 'password123', acceptTerms: true });
        const tk = r.body.token as string;
        await call(tk, 'POST', '/character', { name: nm(j), cityId: cities[j % cities.length], mainInstrument: insts[j % 5], favoriteGenre: 'rock' });
        return tk;
      }),
    )),
  );
}

const pct = (xs: number[], p: number) => [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(xs.length * p))];
const report: Record<string, { p50: number; p95: number; max: number; err: number }> = {};
const lat: Record<string, { ms: number[]; err: number }> = {};
const add = (k: string, ms: number, s: number) => {
  (lat[k] ??= { ms: [], err: 0 }).ms.push(ms);
  if (s >= 500) lat[k].err++;
};
const t0 = performance.now();
// Playtest karışımı: her oyuncu 7 isteği sırayla, oyuncular eşzamanlı
await Promise.all(
  tokens.map(async (tk, j) => {
    for (const [m, p, b] of [
      ['GET', '/me'],
      ['GET', `/cities/${cities[j % cities.length]}`],
      ['GET', '/notifications'],
      ['GET', '/bands/mine'],
      ['POST', '/actions', { kind: 'busk', role: insts[j % 5], hours: 2, locationId: `${cities[j % cities.length]}-park` }],
      ['GET', '/leaderboard'],
      ['GET', '/market'],
    ] as [string, string, unknown?][]) {
      const r = await call(tk, m, p, b);
      add(`${m} ${p.replace(/\/cities\/\w+/, '/cities/:id')}`, r.ms, r.status);
    }
  }),
);
const mixWall = performance.now() - t0;
// Ardından yalnızca /me: eylemi süren oyuncunun uygulaması gibi, ROUNDS tur boyunca herkes aynı anda
const meOnly: number[] = [];
for (let r = 0; r < ROUNDS; r++) {
  await Promise.all(tokens.map(async (tk) => meOnly.push((await call(tk, 'GET', '/me')).ms)));
}
for (const [k, v] of Object.entries(lat)) report[k] = { p50: Math.round(pct(v.ms, 0.5)), p95: Math.round(pct(v.ms, 0.95)), max: Math.round(Math.max(...v.ms)), err: v.err };
report['GET /me (yalnız, tekrar)'] = { p50: Math.round(pct(meOnly, 0.5)), p95: Math.round(pct(meOnly, 0.95)), max: Math.round(Math.max(...meOnly)), err: 0 };
// Tek kullanıcıda /me
const single: number[] = [];
for (let i = 0; i < 20; i++) single.push((await call(tokens[0], 'GET', '/me')).ms);
report['GET /me (tek kullanıcı)'] = { p50: Math.round(pct(single, 0.5)), p95: Math.round(pct(single, 0.95)), max: Math.round(Math.max(...single)), err: 0 };
console.log(JSON.stringify({ players: N, mixWallMs: Math.round(mixWall), poolMax: Number(process.env.PG_POOL_MAX ?? 10), report }, null, 1));
await app.close();
await pool.end();
export {};
