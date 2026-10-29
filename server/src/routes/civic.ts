import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { charId, requireUser } from '../auth';
import { civicInfo, runForOffice, setAnnouncement, setPolicy, vote } from '../game/politics';
import { idParam, parse } from './util';

export async function civicRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireUser);

  app.get('/civic/:cityId', async (req) => {
    const { cityId } = parse(z.object({ cityId: z.string() }), req.params);
    return civicInfo(cityId, charId(req));
  });

  app.post('/elections/:id/run', async (req) => {
    const { id } = parse(idParam, req.params);
    const body = parse(z.object({ platform: z.string().max(200).default('') }), req.body);
    return runForOffice(charId(req), id, body.platform, req.user!.isVip);
  });

  app.post('/elections/:id/vote', async (req) => {
    const { id } = parse(idParam, req.params);
    const body = parse(z.object({ candidateId: z.number().int() }), req.body);
    return vote(charId(req), id, body.candidateId, req.user!.isVip);
  });

  /** Makam yetkisi: makam sahibinin şehirdeki kararı (sadece VIP; dar aralık; günde bir) */
  app.post('/offices/policy', async (req) => {
    const body = parse(z.object({ cityId: z.string().max(40), office: z.string().max(20), level: z.number().int().min(-10).max(10) }), req.body);
    return setPolicy(charId(req), body.cityId, body.office, body.level, req.user!.isVip);
  });

  app.post('/offices/announcement', async (req) => {
    const body = parse(z.object({ cityId: z.string(), text: z.string().max(300) }), req.body);
    return setAnnouncement(charId(req), body.cityId, body.text);
  });
}
