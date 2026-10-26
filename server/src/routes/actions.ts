import { GENRES, INSTRUMENTS, SKILLS, TEMPOS } from '@rifftown/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { charId, requireUser } from '../auth';
import { many, pool } from '../db';
import { cancelAction, startAction } from '../game/actions';
import { toActionDto } from '../game/common';
import { parse } from './util';

const startSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('study'), skill: z.string(), hours: z.number(), locationId: z.string().optional() }),
  z.object({ kind: z.literal('work'), locationId: z.string(), hours: z.number() }),
  z.object({ kind: z.literal('rest'), hours: z.number() }),
  z.object({ kind: z.literal('treat'), locationId: z.string(), hours: z.number() }),
  z.object({
    kind: z.literal('write_song'),
    title: z.string(),
    genre: z.enum(GENRES),
    subgenre: z.string().max(40).nullable().optional(),
    tempo: z.enum(TEMPOS).optional(),
  }),
  z.object({ kind: z.literal('rehearse'), songId: z.number().int(), hours: z.number(), locationId: z.string() }),
  z.object({ kind: z.literal('travel'), toCityId: z.string(), mode: z.enum(['bus', 'plane', 'car']) }),
  z.object({ kind: z.literal('busk'), role: z.enum(INSTRUMENTS), hours: z.number(), locationId: z.string() }),
  z.object({ kind: z.literal('record'), songId: z.number().int(), locationId: z.string() }),
  z.object({ kind: z.literal('crime'), crime: z.string(), locationId: z.string() }),
  z.object({ kind: z.literal('investigate'), locationId: z.string() }),
  z.object({ kind: z.literal('workout'), hours: z.number(), locationId: z.string() }),
  z.object({ kind: z.literal('craft'), recipe: z.string().max(20), locationId: z.string() }),
]);

export async function actionRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireUser);

  app.post('/actions', async (req) => {
    const body = parse(startSchema, req.body);
    return { action: await startAction(charId(req), body, { isVip: req.user!.isVip }) };
  });

  app.post('/actions/cancel', async (req) => {
    return { action: await cancelAction(charId(req)) };
  });

  app.get('/actions/history', async (req) => {
    const rows = await many(pool, `SELECT * FROM actions WHERE character_id = $1 AND status <> 'active' ORDER BY id DESC LIMIT 30`, [
      charId(req),
    ]);
    return { actions: rows.map(toActionDto) };
  });
}
