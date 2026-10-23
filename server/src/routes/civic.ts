import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { charId, requireUser } from '../auth';
import { civicInfo, runForOffice, setAnnouncement, vote } from '../game/politics';
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

  app.post('/offices/announcement', async (req) => {
    const body = parse(z.object({ cityId: z.string(), text: z.string().max(300) }), req.body);
    return setAnnouncement(charId(req), body.cityId, body.text);
  });
}
