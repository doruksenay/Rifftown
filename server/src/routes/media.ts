// Basın, medya ve topluluk okuma rotaları (yazma süreli eylemlerle: 'press', 'write_article').

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { charId, requireUser } from '../auth';
import { pool } from '../db';
import { bandPress, cityNews } from '../game/press';
import { membership } from '../game/common';
import { parse } from './util';
import { CREW_ROLES, GENRES, trendingSubgenre } from '@rifftown/shared';
import { fail } from '../errors';
import { fireCrew, hireCrew, repairGear, startTour, tourView } from '../game/touring';
import { answerContract, foundLabel, labelView, labelsList, moveLabelTill, offerContract } from '../game/labels';
import { videoChart } from '../game/media';
import { blogOf, deletePost, magazine, postBlog, postBoard } from '../game/community';

const terms = z.object({ bandShare: z.number().min(0).max(1), advance: z.number().int().min(0), weeks: z.number().int() });

export async function mediaRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireUser);

  app.get('/cities/:cityId/news', async (req) => {
    const p = parse(z.object({ cityId: z.string().max(30) }), req.params);
    const q = parse(z.object({ kind: z.enum(['news', 'blog', 'board']).default('news'), before: z.coerce.number().int().optional() }), req.query);
    const viewer = charId(req);
    const items = await cityNews(p.cityId, viewer, { kind: q.kind, before: q.before });
    return { articles: items.map((a) => ({ ...a, mine: a.author?.characterId === viewer })) };
  });

  // ---------- Turne ve ekip ----------
  app.get('/tour', async (req) => {
    const m = await membership(pool, charId(req));
    if (!m) fail('no_band');
    return tourView(pool, m!.band_id);
  });
  app.post('/tour', async (req) => {
    const body = parse(z.object({ name: z.string().max(60), cityIds: z.array(z.string().max(30)).max(10), days: z.number().int() }), req.body);
    return startTour(charId(req), body);
  });
  app.post('/crew/:role', async (req) => hireCrew(charId(req), parse(z.object({ role: z.enum(CREW_ROLES) }), req.params).role));
  app.delete('/crew/:role', async (req) => fireCrew(charId(req), parse(z.object({ role: z.enum(CREW_ROLES) }), req.params).role));
  app.post('/repair', async (req) => {
    const body = parse(z.object({ kitId: z.number().int(), targetId: z.number().int().optional() }), req.body);
    return repairGear(charId(req), body.kitId, body.targetId);
  });

  // ---------- Klip listesi ----------
  app.get('/charts/videos', async () => videoChart(pool));
  // Haftanın modası: her türden bir alt tür (açık liste haftasıyla döner; konserde şarkı puanına +2)
  app.get('/trends', async () => {
    const w = await pool.query(`SELECT id, ends_at FROM chart_weeks WHERE status = 'open' ORDER BY id DESC LIMIT 1`);
    const weekId = Number(w.rows[0]?.id ?? 0);
    return { weekId, endsAt: w.rows[0]?.ends_at?.toISOString() ?? null, trends: Object.fromEntries(GENRES.map((g) => [g, trendingSubgenre(g, weekId)])) };
  });

  // ---------- Plak şirketi ----------
  app.get('/labels', async (req) => ({ labels: await labelsList(pool), mine: await labelView(pool, charId(req)) }));
  app.post('/labels', async (req) => foundLabel(charId(req), parse(z.object({ name: z.string().max(60) }), req.body).name));
  app.post('/labels/mine/till', async (req) => moveLabelTill(charId(req), parse(z.object({ amount: z.number().int() }), req.body).amount));
  app.post('/labels/mine/offers', async (req) => {
    const body = parse(terms.extend({ bandId: z.number().int() }), req.body);
    return offerContract(charId(req), body.bandId, body);
  });
  app.post('/contracts/:id/:answer', async (req) => {
    const p = parse(z.object({ id: z.coerce.number().int(), answer: z.enum(['accept', 'decline', 'counter']) }), req.params);
    const body = p.answer === 'counter' ? parse(terms, req.body) : undefined;
    return answerContract(charId(req), p.id, p.answer, body);
  });

  // ---------- Topluluk: blog, pano, dergi ----------
  app.post('/blog', async (req) => postBlog(charId(req), parse(z.object({ title: z.string().max(200), body: z.string().max(6000) }), req.body)));
  app.get('/characters/:id/blog', async (req) => ({ posts: await blogOf(parse(z.object({ id: z.coerce.number().int() }), req.params).id, charId(req)) }));
  app.post('/cities/:cityId/board', async (req) => {
    const p = parse(z.object({ cityId: z.string().max(30) }), req.params);
    return postBoard(charId(req), p.cityId, parse(z.object({ text: z.string().max(600) }), req.body).text);
  });
  app.delete('/posts/:id', async (req) => deletePost(charId(req), parse(z.object({ id: z.coerce.number().int() }), req.params).id, req.user!.isAdmin));
  app.get('/cities/:cityId/magazine', async (req) => magazine(parse(z.object({ cityId: z.string().max(30) }), req.params).cityId, charId(req)));

  app.get('/press/mine', async (req) => {
    const id = charId(req);
    const m = await membership(pool, id);
    const q = parse(z.object({ cityId: z.string().max(30) }), req.query);
    return { press: m ? await bandPress(pool, m.band_id, q.cityId) : null };
  });
}
