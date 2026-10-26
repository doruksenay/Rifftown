// Basın, medya ve topluluk okuma rotaları (yazma süreli eylemlerle: 'press', 'write_article').

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { charId, requireUser } from '../auth';
import { pool } from '../db';
import { bandPress, cityNews } from '../game/press';
import { membership } from '../game/common';
import { parse } from './util';

export async function mediaRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireUser);

  app.get('/cities/:cityId/news', async (req) => {
    const p = parse(z.object({ cityId: z.string().max(30) }), req.params);
    const q = parse(z.object({ kind: z.enum(['news', 'blog', 'board']).default('news'), before: z.coerce.number().int().optional() }), req.query);
    const viewer = charId(req);
    const items = await cityNews(p.cityId, viewer, { kind: q.kind, before: q.before });
    return { articles: items.map((a) => ({ ...a, mine: a.author?.characterId === viewer })) };
  });

  app.get('/press/mine', async (req) => {
    const id = charId(req);
    const m = await membership(pool, id);
    const q = parse(z.object({ cityId: z.string().max(30) }), req.query);
    return { press: m ? await bandPress(pool, m.band_id, q.cityId) : null };
  });
}
