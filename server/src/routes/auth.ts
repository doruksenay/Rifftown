import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { notify } from '../game/common';
import { createSession, deleteSession, hashPassword, requireUser, verifyPassword } from '../auth';
import { many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { parse } from './util';

const toUser = (u: any) => ({ id: u.id, email: u.email, lang: u.lang, isAdmin: u.is_admin });

export async function authRoutes(app: FastifyInstance) {
  const strict = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } };

  app.post('/auth/register', strict, async (req) => {
    const body = parse(
      z.object({
        email: z.email().max(200),
        password: z.string().min(8).max(200),
        lang: z.enum(['tr', 'en']).default('tr'),
        /** Kullanım şartları ve gizlilik politikası kabul edilmeli (mağaza kuralı) */
        acceptTerms: z.literal(true, { error: 'terms_required' }),
      }),
      req.body,
    );
    const email = body.email.trim().toLowerCase();
    if (await one(pool, 'SELECT 1 FROM users WHERE email = $1', [email])) fail('email_taken', 409);
    const user = await one(
      pool,
      'INSERT INTO users(email, password_hash, lang, terms_accepted_at) VALUES ($1, $2, $3, now()) RETURNING *',
      [email, await hashPassword(body.password), body.lang],
    );
    return { token: await createSession(user.id), user: toUser(user) };
  });

  /** Hesabı ve karakteri kalıcı olarak siler (App Store ve Google Play kuralı: uygulama içinden silinebilmeli) */
  app.post('/auth/delete-account', { preHandler: requireUser, ...strict }, async (req) => {
    const body = parse(z.object({ password: z.string() }), req.body);
    const user = await one(pool, 'SELECT * FROM users WHERE id = $1', [req.user!.id]);
    if (!user || !(await verifyPassword(body.password, user.password_hash))) fail('bad_credentials', 401);
    await deleteAccount(user.id);
    return { ok: true };
  });

  app.post('/auth/login', strict, async (req) => {
    const body = parse(z.object({ email: z.string(), password: z.string() }), req.body);
    const user = await one(pool, 'SELECT * FROM users WHERE email = $1', [body.email.trim().toLowerCase()]);
    if (!user || !(await verifyPassword(body.password, user.password_hash))) fail('bad_credentials', 401);
    if (user.banned) fail('banned', 403);
    return { token: await createSession(user.id), user: toUser(user) };
  });

  app.post('/auth/logout', { preHandler: requireUser }, async (req) => {
    await deleteSession(req.token!);
    return { ok: true };
  });

  app.post('/auth/change-password', { preHandler: requireUser, ...strict }, async (req) => {
    const body = parse(z.object({ oldPassword: z.string(), newPassword: z.string().min(8).max(200) }), req.body);
    const user = await one(pool, 'SELECT * FROM users WHERE id = $1', [req.user!.id]);
    if (!(await verifyPassword(body.oldPassword, user.password_hash))) fail('bad_credentials', 401);
    await pool.query('UPDATE users SET password_hash = $2 WHERE id = $1', [user.id, await hashPassword(body.newPassword)]);
    return { ok: true };
  });
}

/** Grubu devreder ya da dağıtır, sonra kullanıcıyı siler (karakter ve ona bağlı her şey zincirleme silinir) */
export async function deleteAccount(userId: number) {
  await tx(async (c) => {
    const ch = await one(c, 'SELECT id FROM characters WHERE user_id = $1 FOR UPDATE', [userId]);
    if (ch) {
      // İşletmesi varsa çalışanlarına haber verilir (işletme hesapla birlikte silinir)
      const staff = await many(c, `SELECT s.character_id, s.location_id FROM business_staff s JOIN businesses b ON b.location_id = s.location_id WHERE b.owner_id = $1 AND s.status = 'hired'`, [ch.id]);
      for (const s of staff) await notify(c, Number(s.character_id), 'job_lost', { locationId: s.location_id, reason: 'closed' });
      const led = await many(c, 'SELECT id FROM bands WHERE leader_id = $1 FOR UPDATE', [ch.id]);
      for (const b of led) {
        const next = await one(
          c,
          'SELECT character_id FROM band_members WHERE band_id = $1 AND character_id <> $2 ORDER BY joined_at LIMIT 1',
          [b.id, ch.id],
        );
        if (next) await c.query('UPDATE bands SET leader_id = $2 WHERE id = $1', [b.id, next.character_id]);
        else await c.query('DELETE FROM bands WHERE id = $1', [b.id]);
      }
    }
    await c.query('DELETE FROM users WHERE id = $1', [userId]);
  });
}
