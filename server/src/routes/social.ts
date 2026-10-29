import { CHAT_MAX, cleanText, maskProfanity } from '@rifftown/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { charId, requireUser } from '../auth';
import { many, one, pool } from '../db';
import { fail } from '../errors';
import { avatarUrl, getCharacter, membership } from '../game/common';
import { parse } from './util';

const lastPost = new Map<number, number>();
const CHAT_COOLDOWN_MS = 1500;

/** Kanal erişimi: şehir sohbeti sadece o şehirdeyken, grup sohbeti sadece üyelere. */
async function checkChannel(characterId: number, channel: string) {
  const [type, id] = channel.split(':');
  if (type === 'city') {
    const ch = await getCharacter(pool, characterId);
    if (ch.city_id !== id) fail('not_in_city', 403);
    return;
  }
  if (type === 'band') {
    const m = await membership(pool, characterId);
    if (!m || String(m.band_id) !== id) fail('forbidden', 403);
    return;
  }
  fail('invalid_channel');
}

const toMsg = (r: any) => ({
  id: r.id,
  channel: r.channel,
  characterId: r.character_id,
  name: r.name,
  avatarColor: r.avatar_color,
  avatarUrl: avatarUrl(r.character_id, r.avatar_version),
  text: r.text,
  createdAt: r.created_at.toISOString(),
});

export async function socialRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireUser);

  app.get('/chat', async (req) => {
    const id = charId(req);
    const q = parse(z.object({ channel: z.string().max(40), after: z.coerce.number().int().optional() }), req.query);
    await checkChannel(id, q.channel);
    const rows = q.after
      ? await many(
          pool,
          `SELECT m.*, c.name, c.avatar_color, c.avatar_version FROM chat_messages m JOIN characters c ON c.id = m.character_id
            WHERE m.channel = $1 AND m.id > $2 AND NOT m.deleted ORDER BY m.id LIMIT 100`,
          [q.channel, q.after],
        )
      : (
          await many(
            pool,
            `SELECT m.*, c.name, c.avatar_color, c.avatar_version FROM chat_messages m JOIN characters c ON c.id = m.character_id
              WHERE m.channel = $1 AND NOT m.deleted ORDER BY m.id DESC LIMIT 50`,
            [q.channel],
          )
        ).reverse();
    return { messages: rows.map(toMsg) };
  });

  app.post('/chat', async (req) => {
    const id = charId(req);
    const body = parse(z.object({ channel: z.string().max(40), text: z.string().max(CHAT_MAX * 2) }), req.body);
    // Özel mesajla aynı temizleyici: görünmez/yön değiştiren karakterler ve zalgo (playtest O-6)
    const text = maskProfanity(cleanText(body.text));
    if (!text || text.length > CHAT_MAX) fail('invalid_message');
    await checkChannel(id, body.channel);
    const now = Date.now();
    if (now - (lastPost.get(id) ?? 0) < CHAT_COOLDOWN_MS) fail('slow_down', 429);
    lastPost.set(id, now);
    const r = await one(pool, 'INSERT INTO chat_messages(channel, character_id, text) VALUES ($1, $2, $3) RETURNING *', [
      body.channel,
      id,
      text,
    ]);
    const ch = await getCharacter(pool, id);
    return { message: toMsg({ ...r, name: ch.name, avatar_color: ch.avatar_color, avatar_version: ch.avatar_version }) };
  });

  app.get('/notifications', async (req) => {
    const id = charId(req);
    const rows = await many(pool, 'SELECT * FROM notifications WHERE character_id = $1 ORDER BY id DESC LIMIT 50', [id]);
    return {
      notifications: rows.map((r) => ({ id: r.id, kind: r.kind, data: r.data, read: r.read, createdAt: r.created_at.toISOString() })),
    };
  });

  app.post('/notifications/read', async (req) => {
    const id = charId(req);
    await pool.query('UPDATE notifications SET read = TRUE WHERE character_id = $1 AND NOT read', [id]);
    return { ok: true };
  });
}
