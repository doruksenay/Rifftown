// Simülasyon dünyası: veritabanını sanal saatle kurar, sunucuyu (Fastify inject) açar, zamanlayıcının
// aşamalarını tek tek çalıştırıp her aşamanın karakterlerin parasına etkisini kaydeder (para defteri).
import { clock, seedRandom, SIM_EPOCH, DB_NAME } from './env';
import pg from 'pg';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../../server/src/app';
import { pool } from '../../../server/src/db';
import { migrate } from '../../../server/src/migrate';
import { config } from '../../../server/src/config';
import { completeDueActions } from '../../../server/src/game/actions';
import { processColdCases, processJustice } from '../../../server/src/game/crime';
import { processDueGigs } from '../../../server/src/game/gigs';
import { processChartWeeks } from '../../../server/src/game/music';
import { npcDirector } from '../../../server/src/game/npc';
import { npcCivicDirector } from '../../../server/src/game/npc-civic';
import { processRent } from '../../../server/src/game/homes';
import { processBirths, processChildren } from '../../../server/src/game/family';
import { processUpkeep } from '../../../server/src/game/business';
import { processFestivals } from '../../../server/src/game/festivals';
import { processBankInterest } from '../../../server/src/game/lifestyle';
import { pruneMoodlets } from '../../../server/src/game/wellbeing';
import { closeDueElections, ensureElections, payOfficeSalaries } from '../../../server/src/game/politics';
import { processPressDrift } from '../../../server/src/game/press';
import { processCrewMorale, processTours } from '../../../server/src/game/touring';
import { processLabels } from '../../../server/src/game/labels';
import {
  processAddiction,
  processFameDecay,
  processFamiliarityDecay,
  processHospitalizations,
  processMortality,
} from '../../../server/src/game/consequences';

export { pool, config, clock };

let app: FastifyInstance | null = null;

/** Veritabanını sıfırdan kurar: public şeması, sanal now(), bütün migration'lar. */
export async function resetWorld(seed: number) {
  seedRandom(seed);
  clock.set(SIM_EPOCH);
  const admin = new pg.Client({ connectionString: `postgres://postgres@localhost:5432/${DB_NAME}` });
  await admin.connect();
  await admin.query(`ALTER DATABASE ${DB_NAME} SET search_path = public, pg_catalog`);
  await admin.end();
  const c = await pool.connect();
  try {
    await c.query('SET search_path = public, pg_catalog');
    await c.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
    await c.query('CREATE SCHEMA IF NOT EXISTS sim');
    await c.query('CREATE TABLE IF NOT EXISTS sim.clock (t timestamptz NOT NULL)');
    await c.query('DELETE FROM sim.clock');
    await c.query('INSERT INTO sim.clock(t) VALUES ($1)', [new Date(SIM_EPOCH)]);
    await c.query(`CREATE FUNCTION public.now() RETURNS timestamptz LANGUAGE sql STABLE AS 'SELECT t FROM sim.clock LIMIT 1'`);
  } finally {
    c.release(true);
  }
  await migrate(pool, 'server/migrations', () => {});
  // Sağlama: veritabanının now()'ı sanal saati göstermeli
  const r = await pool.query('SELECT now() AS t');
  if (Math.abs(new Date(r.rows[0].t).getTime() - SIM_EPOCH) > 1000) throw new Error('sanal now() çalışmıyor: ' + r.rows[0].t);
  if (!app) {
    app = await buildApp({ logger: false });
    await app.ready();
  }
}

export async function closeWorld() {
  await app?.close();
  app = null;
  await pool.end();
}

/** Sanal saati ileri alır (oyun saati) */
export async function setClock(ms: number) {
  clock.set(ms);
  await pool.query('UPDATE sim.clock SET t = $1', [new Date(ms)]);
}
export const advanceHours = (h: number) => setClock(clock.now() + h * 3_600_000);

// ---------------------------------------------------------------- İstemci

export interface Client {
  token: string;
  get: (url: string) => Promise<{ status: number; body: any }>;
  post: (url: string, body?: unknown) => Promise<{ status: number; body: any }>;
  patch: (url: string, body?: unknown) => Promise<{ status: number; body: any }>;
  del: (url: string) => Promise<{ status: number; body: any }>;
}

export function client(token = '', ip = '127.0.0.1'): Client {
  const call = async (method: string, url: string, body?: unknown) => {
    const r = await app!.inject({
      method: method as any,
      url: url.startsWith('/api') ? url : '/api' + url,
      headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), 'cf-connecting-ip': ip },
      ...(body !== undefined ? { payload: body as any } : {}),
    });
    let parsed: any = null;
    try {
      parsed = r.body ? JSON.parse(r.body) : null;
    } catch {
      parsed = r.body;
    }
    return { status: r.statusCode, body: parsed };
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
const NAMES = 'Ada Baran Cem Deniz Ece Firat Gul Hakan Ilgaz Jale Kaan Lale Mert Nil Oya Pelin Rana Selin Tuna Umut Veli Yasin Zeynep Arda Bora Cansu Defne Emre Fulya Gokay'.split(' ');
const SUR = 'Kaya Demir Celik Yildiz Aydin Ozturk Arslan Dogan Kilic Aslan Cetin Kara Koc Kurt Ozkan Simsek Polat Erdem Korkmaz Tekin'.split(' ');

/** Kayıt olur ve karakter açar */
export async function newPlayer(opts: { cityId?: string; instrument?: string; genre?: string; ip?: string } = {}) {
  seq++;
  const ip = opts.ip ?? `10.${(seq >> 16) & 255}.${(seq >> 8) & 255}.${seq & 255}`;
  const anon = client('', ip);
  const reg = await anon.post('/auth/register', { email: `bot${seq}@sim.test`, password: 'gizli12345', acceptTerms: true });
  if (reg.status !== 200) throw new Error(`register failed ${reg.status} ${JSON.stringify(reg.body)}`);
  const c = client(reg.body.token, ip);
  const name = `${NAMES[seq % NAMES.length]} ${SUR[Math.floor(seq / NAMES.length) % SUR.length]}${seq > NAMES.length * SUR.length ? ' ' + 'abcdefghij'[seq % 10] : ''}`;
  const ch = await c.post('/character', {
    name,
    cityId: opts.cityId ?? 'istanbul',
    mainInstrument: opts.instrument ?? 'guitar',
    favoriteGenre: opts.genre ?? 'rock',
  });
  if (ch.status !== 200) throw new Error(`character failed ${ch.status} ${JSON.stringify(ch.body)}`);
  return { c, id: ch.body.character.id as number, userId: reg.body.user.id as number, name };
}

// ---------------------------------------------------------------- Para defteri

/** defter[karakter][kalem] = net para (cep + banka) */
export type Ledger = Map<number, Map<string, number>>;
export const ledger: Ledger = new Map();
export function resetLedger() {
  ledger.clear();
}
export function book(id: number, cat: string, delta: number) {
  if (!delta) return;
  let m = ledger.get(id);
  if (!m) ledger.set(id, (m = new Map()));
  m.set(cat, (m.get(cat) ?? 0) + delta);
}

/** İzlenen karakterlerin cep + banka parası */
export async function wealth(ids: number[]): Promise<Map<number, number>> {
  const r = await pool.query('SELECT id, money, bank FROM characters WHERE id = ANY($1::bigint[])', [ids]);
  return new Map(r.rows.map((x) => [Number(x.id), Number(x.money) + Number(x.bank)]));
}

export let tracked: number[] = [];
export function track(ids: number[]) {
  tracked = ids;
}

/** Fonksiyonu çalıştırır, izlenen karakterlerin parasındaki değişimi kaleme yazar */
export const stageMs = new Map<string, number>();
export async function measured<T>(cat: string | ((id: number) => string), fn: () => Promise<T>): Promise<T> {
  const t0 = performance.now();
  try {
    return await measuredInner(cat, fn);
  } finally {
    const k = typeof cat === 'string' ? cat : 'fn';
    stageMs.set(k, (stageMs.get(k) ?? 0) + performance.now() - t0);
  }
}
async function measuredInner<T>(cat: string | ((id: number) => string), fn: () => Promise<T>): Promise<T> {
  if (!tracked.length) return fn();
  const before = await wealth(tracked);
  const out = await fn();
  const after = await wealth(tracked);
  for (const [id, a] of after) book(id, typeof cat === 'string' ? cat : cat(id), a - (before.get(id) ?? a));
  return out;
}

/** Zamanlayıcının bir turu (server/src/worker.ts tick() ile aynı sıra), aşama aşama ölçülerek */
export const tickOpts = { npcEvery: 3, n: 0 };
export async function simTick() {
  tickOpts.n++;
  const npcNow = tickOpts.n % tickOpts.npcEvery === 0;
  // Eylemler tek tek: hangi eylemin hangi parayı getirdiğini bilmek için
  for (;;) {
    const next = await pool.query(
      `SELECT id, character_id, kind, params FROM actions WHERE status = 'active' AND ends_at <= now() ORDER BY ends_at LIMIT 1`,
    );
    if (!next.rows.length) break;
    const a = next.rows[0];
    const kind = a.kind === 'work' && a.params?.business ? 'work_business' : a.kind;
    const n = await measured(`act:${kind}`, () => completeDueActions(1));
    if (!n) break;
  }
  if (config.npcEnabled && npcNow) await measured('npc_director', () => npcDirector(Math.random, true));
  if (config.npcEnabled && npcNow) await measured('npc_civic', () => npcCivicDirector(Math.random, true));
  await measured('gig', () => processDueGigs(200));
  if (config.npcEnabled) await measured('detective', () => processColdCases());
  await measured('justice', () => processJustice());
  await measured('sales', () => processChartWeeks());
  await measured('rent', () => processRent());
  await measured('childcare', () => processChildren());
  await measured('births', () => processBirths());
  await measured('business_upkeep', () => processUpkeep());
  await measured('bank_interest', () => processBankInterest());
  await measured('festival', () => processFestivals());
  await measured('elections', () => closeDueElections());
  await measured('elections', () => ensureElections());
  await measured('office_salary', () => payOfficeSalaries());
  await pruneMoodlets(pool);
  if (config.decayEnabled) {
    await processFamiliarityDecay();
    await processFameDecay();
  }
  await measured('addiction', () => processAddiction());
  await processPressDrift();
  await measured('tour', () => processTours());
  await processCrewMorale();
  await measured('label', () => processLabels());
  await measured('hospital', () => processHospitalizations());
  await processMortality();
}

/** Para arzı: cepler + bankalar + işletme ve plak şirketi kasaları (oyuncu ve NPC ayrı) */
export async function moneySupply() {
  const r = await pool.query(`SELECT npc, sum(money)::float8 AS cash, sum(bank)::float8 AS bank, count(*)::int AS n FROM characters GROUP BY npc`);
  const tills = await pool
    .query(`SELECT coalesce(sum(till),0)::float8 AS t FROM businesses`)
    .then((x) => Number(x.rows[0].t))
    .catch(() => 0);
  const labels = await pool
    .query(`SELECT coalesce(sum(till),0)::float8 AS t FROM labels`)
    .then((x) => Number(x.rows[0].t))
    .catch(() => 0);
  const out: Record<string, number> = { tills, labels };
  for (const row of r.rows) {
    out[row.npc ? 'npcCash' : 'playerCash'] = Number(row.cash);
    out[row.npc ? 'npcBank' : 'playerBank'] = Number(row.bank);
    out[row.npc ? 'npcCount' : 'playerCount'] = row.n;
  }
  return out;
}
