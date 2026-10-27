import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAdmin, revokeUserSessions } from '../auth';
import { many, one, pool } from '../db';
import { fail } from '../errors';
import { ADMIN_HTML } from './admin-page';
import { adminPlayerRoutes } from './admin-players';
import { extendVip } from '../game/vip';
import { idParam, parse } from './util';

export async function adminPage(app: FastifyInstance) {
  app.get('/admin', async (_req, reply) => reply.type('text/html; charset=utf-8').send(ADMIN_HTML));
}

export async function adminRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAdmin);
  await app.register(adminPlayerRoutes);

  app.get('/admin/stats', async () => {
    const r = await one(
      pool,
      `SELECT
        (SELECT count(*)::int FROM users) AS users,
        (SELECT count(*)::int FROM characters WHERE NOT npc) AS characters,
        (SELECT count(*)::int FROM bands) AS bands,
        (SELECT count(*)::int FROM songs) AS songs,
        (SELECT count(*)::int FROM actions WHERE status = 'active') AS active_actions,
        (SELECT count(*)::int FROM gigs WHERE status = 'scheduled') AS scheduled_gigs,
        (SELECT count(*)::int FROM gigs WHERE status = 'done') AS done_gigs,
        (SELECT count(DISTINCT user_id)::int FROM sessions WHERE last_used > now() - interval '1 day') AS active_today,
        (SELECT count(*)::int FROM chat_messages WHERE created_at > now() - interval '1 day') AS chat_today`,
    );
    return { stats: r };
  });

  app.get('/admin/users', async (req) => {
    const q = parse(z.object({ q: z.string().max(100).optional() }), req.query);
    const rows = await many(
      pool,
      `SELECT u.id, u.email, u.is_admin, u.banned, u.created_at, u.vip_until, c.id AS character_id, c.name, c.money, c.city_id, c.profession,
              (SELECT max(last_used) FROM sessions s WHERE s.user_id = u.id) AS last_seen
         FROM users u LEFT JOIN characters c ON c.user_id = u.id
        WHERE $1::text IS NULL OR u.email ILIKE '%' || $1 || '%' OR c.name ILIKE '%' || $1 || '%'
        ORDER BY u.id DESC LIMIT 100`,
      [q.q || null],
    );
    return { users: rows };
  });

  app.post('/admin/users/:id/ban', async (req) => {
    const { id } = parse(idParam, req.params);
    const body = parse(z.object({ banned: z.boolean() }), req.body);
    if (id === req.user!.id) fail('invalid_target');
    await pool.query('UPDATE users SET banned = $2 WHERE id = $1', [id, body.banned]);
    if (body.banned) await revokeUserSessions(id);
    return { ok: true };
  });

  app.post('/admin/users/:id/vip', async (req) => {
    const { id } = parse(idParam, req.params);
    const body = parse(z.object({ days: z.number().int().min(1).max(3650) }), req.body);
    const until = await extendVip(pool, id, body.days, 'admin');
    if (!until) fail('not_found', 404);
    return { vipUntil: until!.toISOString() };
  });

  app.post('/admin/characters/:id/money', async (req) => {
    const { id } = parse(idParam, req.params);
    const body = parse(z.object({ delta: z.number().int() }), req.body);
    const r = await one(pool, 'UPDATE characters SET money = GREATEST(0, money + $2) WHERE id = $1 RETURNING money', [id, body.delta]);
    if (!r) fail('not_found', 404);
    return { money: r.money };
  });

  // ---------- Profil moderasyonu ----------

  app.get('/admin/profiles', async () => {
    const rows = await many(
      pool,
      `SELECT c.id, c.name, c.headline, c.bio, c.avatar_version, a.updated_at
         FROM characters c LEFT JOIN avatars a ON a.character_id = c.id
        WHERE NOT c.npc AND (c.avatar_version > 0 OR c.headline <> '' OR c.bio <> '')
        ORDER BY a.updated_at DESC NULLS LAST, c.id DESC LIMIT 60`,
    );
    return { profiles: rows };
  });

  app.delete('/admin/characters/:id/profile', async (req) => {
    const { id } = parse(idParam, req.params);
    const body = parse(z.object({ avatar: z.boolean().default(false), text: z.boolean().default(false) }), req.body);
    if (body.avatar) {
      await pool.query('DELETE FROM avatars WHERE character_id = $1', [id]);
      await pool.query('UPDATE characters SET avatar_version = -abs(avatar_version) WHERE id = $1', [id]);
    }
    if (body.text) await pool.query(`UPDATE characters SET headline = '', bio = '' WHERE id = $1`, [id]);
    return { ok: true };
  });

  app.get('/admin/chat', async () => {
    const rows = await many(
      pool,
      `SELECT m.id, m.channel, m.text, m.deleted, m.created_at, c.name, c.user_id
         FROM chat_messages m JOIN characters c ON c.id = m.character_id ORDER BY m.id DESC LIMIT 100`,
    );
    return { messages: rows };
  });

  app.delete('/admin/chat/:id', async (req) => {
    const { id } = parse(idParam, req.params);
    await pool.query('UPDATE chat_messages SET deleted = TRUE WHERE id = $1', [id]);
    return { ok: true };
  });

  // ---------- Şikâyetler ----------

  app.get('/admin/reports', async () => {
    const rows = await many(
      pool,
      `SELECT r.id, r.kind, r.target_id, r.text AS note, r.created_at, rc.name AS reporter,
              CASE r.kind WHEN 'message' THEN dm.text WHEN 'guestbook' THEN g.text ELSE concat_ws(' · ', pc.headline, pc.bio) END AS content,
              CASE r.kind WHEN 'message' THEN dmc.name WHEN 'guestbook' THEN gc.name ELSE pc.name END AS author,
              CASE r.kind WHEN 'message' THEN dmc.user_id WHEN 'guestbook' THEN gc.user_id ELSE pc.user_id END AS author_user_id,
              CASE r.kind WHEN 'message' THEN dmc.id WHEN 'guestbook' THEN gc.id ELSE pc.id END AS author_character_id
         FROM reports r
         JOIN characters rc ON rc.id = r.reporter_id
         LEFT JOIN direct_messages dm ON r.kind = 'message' AND dm.id = r.target_id
         LEFT JOIN characters dmc ON dmc.id = dm.from_id
         LEFT JOIN guestbook g ON r.kind = 'guestbook' AND g.id = r.target_id
         LEFT JOIN characters gc ON gc.id = g.author_id
         LEFT JOIN characters pc ON r.kind = 'profile' AND pc.id = r.target_id
        WHERE r.status = 'open'
        ORDER BY r.id DESC LIMIT 100`,
    );
    return { reports: rows };
  });

  /** Şikâyeti kapatır; remove=true ise şikâyet edilen içerik de kaldırılır */
  app.post('/admin/reports/:id/resolve', async (req) => {
    const { id } = parse(idParam, req.params);
    const body = parse(z.object({ remove: z.boolean().default(false) }), req.body ?? {});
    const r = await one(pool, 'SELECT kind, target_id FROM reports WHERE id = $1', [id]);
    if (!r) fail('not_found', 404);
    if (body.remove) {
      if (r.kind === 'message') await pool.query('DELETE FROM direct_messages WHERE id = $1', [r.target_id]);
      else if (r.kind === 'guestbook') await pool.query('DELETE FROM guestbook WHERE id = $1', [r.target_id]);
      else await pool.query(`UPDATE characters SET headline = '', bio = '' WHERE id = $1`, [r.target_id]);
    }
    // Aynı içeriğe yapılan diğer şikâyetler de kapanır
    await pool.query(`UPDATE reports SET status = 'closed' WHERE kind = $1 AND target_id = $2 AND status = 'open'`, [r.kind, r.target_id]);
    return { ok: true };
  });
}
