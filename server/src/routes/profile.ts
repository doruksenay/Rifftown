// Profil (fotoğraf, başlık), ev ve kira, rehber görevler.

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { charId, requireUser } from '../auth';
import { one, pool, tx } from '../db';
import { fail } from '../errors';
import { leaveHome, rentHome } from '../game/homes';
import { lockCharacter } from '../game/common';
import { claimStep, tutorialState } from '../game/tutorial';
import { parse } from './util';

/** Profil fotoğrafı için en büyük dosya boyutu (uygulama 512 piksele küçültüp sıkıştırarak gönderir) */
export const MAX_AVATAR_BYTES = 300 * 1024;

/** Dosyanın gerçekten bir resim olduğunu baştaki imzadan anlar (uzantıya ya da beyana güvenilmez) */
export function sniffImage(buf: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length > 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  return null;
}

/** Fotoğraflar herkese açıktır (resim bileşenleri oturum başlığı gönderemez); adres sürüm numarası taşır. */
export async function avatarPublicRoutes(app: FastifyInstance) {
  app.get('/avatars/:id', async (req, reply) => {
    const { id } = parse(z.object({ id: z.coerce.number().int().positive() }), req.params);
    const { v } = parse(z.object({ v: z.coerce.number().int().optional() }), req.query);
    const row = await one(
      pool,
      'SELECT a.mime, a.data, c.avatar_version FROM avatars a JOIN characters c ON c.id = a.character_id WHERE a.character_id = $1',
      [id],
    );
    // Eski sürümün adresi (kaldırılmış ya da değiştirilmiş fotoğraf) artık sunulmaz
    if (!row || row.avatar_version <= 0 || (v !== undefined && v !== row.avatar_version)) return reply.status(404).send({ error: 'not_found' });
    return reply
      .header('content-type', row.mime)
      .header('cache-control', 'public, max-age=86400')
      .header('x-content-type-options', 'nosniff')
      .send(row.data);
  });
}

export async function profileRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireUser);

  app.post('/character/avatar', { bodyLimit: 512 * 1024 }, async (req) => {
    const id = charId(req);
    const body = parse(z.object({ data: z.string().min(16).max(Math.ceil((MAX_AVATAR_BYTES * 4) / 3) + 80) }), req.body);
    const b64 = body.data.replace(/^data:[^;]+;base64,/, '');
    const buf = Buffer.from(b64, 'base64');
    if (!buf.length || buf.length > MAX_AVATAR_BYTES) fail('image_too_large');
    const mime = sniffImage(buf);
    if (!mime) fail('invalid_image');
    return tx(async (c) => {
      await lockCharacter(c, id);
      await c.query(
        `INSERT INTO avatars(character_id, mime, data) VALUES ($1, $2, $3)
         ON CONFLICT (character_id) DO UPDATE SET mime = EXCLUDED.mime, data = EXCLUDED.data, updated_at = now()`,
        [id, mime, buf],
      );
      // Sürüm hiç geri dönmez: kaldırılan fotoğrafın adresi yeni yüklemeyle tekrar kullanılmaz
      const r = await one(c, 'UPDATE characters SET avatar_version = abs(avatar_version) + 1 WHERE id = $1 RETURNING avatar_version', [id]);
      return { avatarUrl: `/avatars/${id}?v=${r.avatar_version}` };
    });
  });

  app.delete('/character/avatar', async (req) => {
    const id = charId(req);
    await pool.query('DELETE FROM avatars WHERE character_id = $1', [id]);
    // Eksi değer: fotoğraf yok, ama sürüm sayacı korunur
    await pool.query('UPDATE characters SET avatar_version = -abs(avatar_version) WHERE id = $1', [id]);
    return { ok: true };
  });

  // ---------- Ev ----------

  app.post('/homes/rent', async (req) => {
    const body = parse(z.object({ homeId: z.string(), locationId: z.string() }), req.body);
    return rentHome(charId(req), body.homeId, body.locationId, req.user!.isVip);
  });

  app.post('/homes/leave', async (req) => leaveHome(charId(req)));

  // ---------- Rehber görevler ----------

  app.get('/tutorial', async (req) => tutorialState(pool, charId(req)));

  app.post('/tutorial/:id/claim', async (req) => {
    const { id } = parse(z.object({ id: z.string().max(40) }), req.params);
    return claimStep(charId(req), id);
  });
}
