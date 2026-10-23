// Suç, adalet ve başarım rotaları.

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { charId, requireUser } from '../auth';
import { many, pool } from '../db';
import { achievementPoints, evaluateAchievements } from '../game/achievements';
import { crimeOptions, justice, payBail, ruleCase } from '../game/crime';
import { idParam, parse } from './util';

export async function justiceRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireUser);

  app.get('/crime/options', async (req) => {
    const q = parse(z.object({ locationId: z.string() }), req.query);
    return crimeOptions(charId(req), q.locationId);
  });

  app.get('/justice/:cityId', async (req) => {
    const { cityId } = parse(z.object({ cityId: z.string() }), req.params);
    return justice(cityId);
  });

  app.post('/cases/:id/rule', async (req) => {
    const { id } = parse(idParam, req.params);
    const body = parse(
      z.object({ verdict: z.enum(['guilty', 'innocent']), severity: z.enum(['light', 'normal', 'harsh']).default('normal') }),
      req.body,
    );
    return ruleCase(charId(req), id, body.verdict, body.severity, req.user!.isVip);
  });

  app.post('/jail/bail', async (req) => payBail(charId(req)));

  app.get('/achievements', async (req) => {
    const id = charId(req);
    await evaluateAchievements(pool, id);
    const rows = await many(pool, 'SELECT achievement_id, unlocked_at FROM character_achievements WHERE character_id = $1 ORDER BY unlocked_at', [id]);
    return {
      points: await achievementPoints(pool, id),
      unlocked: rows.map((r) => ({ id: r.achievement_id, unlockedAt: r.unlocked_at.toISOString() })),
    };
  });
}
