import crypto from 'node:crypto';
import { promisify } from 'node:util';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { many, one, pool } from './db';
import { GameError } from './errors';

const scrypt = promisify(crypto.scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export async function hashPassword(pw: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(pw, salt, 64);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [algo, saltB64, keyB64] = stored.split('$');
  if (algo !== 'scrypt' || !saltB64 || !keyB64) return false;
  const key = Buffer.from(keyB64, 'base64');
  const test = await scrypt(pw, Buffer.from(saltB64, 'base64'), key.length);
  return crypto.timingSafeEqual(key, test);
}

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('base64url');
  await pool.query('INSERT INTO sessions(token_hash, user_id) VALUES ($1, $2)', [sha256(token), userId]);
  return token;
}

export async function deleteSession(token: string) {
  await pool.query('DELETE FROM sessions WHERE token_hash = $1', [sha256(token)]);
}

export interface AuthUser {
  id: number;
  email: string;
  lang: 'tr' | 'en';
  isAdmin: boolean;
  isVip: boolean;
  vipUntil: Date | null;
  characterId: number | null;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
    token?: string;
  }
}

const bearer = (req: FastifyRequest) => {
  const h = req.headers.authorization;
  return h?.startsWith('Bearer ') ? h.slice(7) : null;
};

/** Oturum açmış kullanıcıyı zorunlu kılar. */
export async function requireUser(req: FastifyRequest, _reply: FastifyReply) {
  const token = bearer(req);
  if (!token) throw new GameError('unauthorized', 401);
  const row = await one(
    pool,
    `SELECT u.id, u.email, u.lang, u.is_admin, u.banned, u.vip_until, c.id AS character_id, s.last_used
       FROM sessions s JOIN users u ON u.id = s.user_id
       LEFT JOIN characters c ON c.user_id = u.id
      WHERE s.token_hash = $1`,
    [sha256(token)],
  );
  if (!row) throw new GameError('unauthorized', 401);
  if (row.banned) throw new GameError('banned', 403);
  req.user = {
    id: row.id,
    email: row.email,
    lang: row.lang,
    isAdmin: row.is_admin,
    isVip: !!row.vip_until && new Date(row.vip_until).getTime() > Date.now(),
    vipUntil: row.vip_until,
    characterId: row.character_id,
  };
  req.token = token;
  // Son kullanım zamanını en fazla 10 dakikada bir güncelle
  if (Date.now() - new Date(row.last_used).getTime() > 10 * 60 * 1000) {
    pool.query('UPDATE sessions SET last_used = now() WHERE token_hash = $1', [sha256(token)]).catch(() => {});
  }
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  await requireUser(req, reply);
  if (!req.user?.isAdmin) throw new GameError('forbidden', 403);
}

/** Karakter oluşturmuş olmayı zorunlu kılar ve karakter id'sini döner. */
export function charId(req: FastifyRequest): number {
  const id = req.user?.characterId;
  if (!id) throw new GameError('no_character', 409);
  return id;
}

export async function revokeUserSessions(userId: number) {
  await many(pool, 'DELETE FROM sessions WHERE user_id = $1', [userId]);
}

/** VIP üyeliği zorunlu kılar */
export function requireVip(req: FastifyRequest) {
  if (!req.user?.isVip) throw new GameError('vip_required', 403);
}
