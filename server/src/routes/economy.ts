// Ekonomi rotaları: pazar, eşya kişiselleştirme, yaşam mekânları, işletmeler, festivaller, haftalık görevler.

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { charId, requireUser } from '../auth';
import { pool } from '../db';
import {
  answerJob,
  buyBusiness,
  businessView,
  endJob,
  moveTill,
  offerJob,
  sellBusiness,
  setWage,
  updateBusiness,
} from '../game/business';
import { applyToFestival, festivalView, festivalsList } from '../game/festivals';
import { buyListing, cancelListing, listItem, marketListings, nameItem, paintItem } from '../game/items';
import { bankMove, eatMeal, getTattoo, hotelStay, removeTattoo, tattoosOf } from '../game/lifestyle';
import { claimMission, missionsState } from '../game/missions';
import { idParam, parse } from './util';

const loc = z.object({ locationId: z.string() });

export async function economyRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireUser);

  // ---------- Eşya kişiselleştirme ----------
  app.post('/inventory/:id/paint', async (req) => {
    const body = parse(z.object({ sprayId: z.number().int() }), req.body);
    return paintItem(charId(req), parse(idParam, req.params).id, body.sprayId);
  });
  app.post('/inventory/:id/name', async (req) => {
    const body = parse(z.object({ name: z.string().max(40).nullable() }), req.body);
    return nameItem(charId(req), parse(idParam, req.params).id, body.name);
  });

  // ---------- İkinci el pazarı ----------
  app.get('/market', async (req) => {
    const q = parse(z.object({ slot: z.string().max(20).optional(), mine: z.enum(['true', 'false', '1', '0']).transform((v) => v === 'true' || v === '1').optional() }), req.query);
    return { listings: await marketListings(charId(req), q) };
  });
  app.post('/market', async (req) => {
    const body = parse(z.object({ locationId: z.string(), inventoryId: z.number().int(), price: z.number().int() }), req.body);
    return listItem(charId(req), body.locationId, body.inventoryId, body.price);
  });
  app.post('/market/:id/buy', async (req) => buyListing(charId(req), parse(loc, req.body).locationId, parse(idParam, req.params).id));
  app.delete('/market/:id', async (req) => cancelListing(charId(req), parse(idParam, req.params).id));

  // ---------- Yaşam ----------
  app.post('/meals', async (req) => {
    const body = parse(z.object({ locationId: z.string(), mealId: z.string() }), req.body);
    return eatMeal(charId(req), body.locationId, body.mealId);
  });
  app.post('/hotel', async (req) => {
    const body = parse(z.object({ locationId: z.string(), nights: z.number().int() }), req.body);
    return hotelStay(charId(req), body.locationId, body.nights);
  });
  app.post('/bank/:direction', async (req) => {
    const { direction } = parse(z.object({ direction: z.enum(['deposit', 'withdraw']) }), req.params);
    const body = parse(z.object({ locationId: z.string(), amount: z.number().int() }), req.body);
    return bankMove(charId(req), body.locationId, body.amount, direction);
  });
  app.get('/tattoos', async (req) => ({ tattoos: await tattoosOf(pool, charId(req)) }));
  app.post('/tattoos', async (req) => {
    const body = parse(z.object({ locationId: z.string(), tattooId: z.string() }), req.body);
    return getTattoo(charId(req), body.locationId, body.tattooId);
  });
  app.delete('/tattoos/:id', async (req) => removeTattoo(charId(req), parse(loc, req.query).locationId, parse(idParam, req.params).id));

  // ---------- İşletmeler ----------
  app.get('/businesses/:locationId', async (req) => ({ business: await businessView(pool, parse(loc, req.params).locationId, charId(req)) }));
  app.post('/businesses/:locationId/buy', async (req) => buyBusiness(charId(req), parse(loc, req.params).locationId));
  app.post('/businesses/:locationId/sell', async (req) => sellBusiness(charId(req), parse(loc, req.params).locationId));
  app.patch('/businesses/:locationId', async (req) => {
    const body = parse(z.object({ name: z.string().max(40).optional(), gigShare: z.number().optional(), menuMult: z.number().optional() }), req.body);
    return updateBusiness(charId(req), parse(loc, req.params).locationId, body);
  });
  app.post('/businesses/:locationId/till', async (req) => {
    const body = parse(z.object({ amount: z.number().int() }), req.body);
    return moveTill(charId(req), parse(loc, req.params).locationId, body.amount);
  });
  app.post('/businesses/:locationId/staff', async (req) => {
    const body = parse(z.object({ characterId: z.number().int(), wage: z.number().int() }), req.body);
    return offerJob(charId(req), parse(loc, req.params).locationId, body.characterId, body.wage);
  });
  app.patch('/businesses/:locationId/staff/:id', async (req) => {
    const p = parse(z.object({ locationId: z.string(), id: z.coerce.number().int() }), req.params);
    const body = parse(z.object({ wage: z.number().int() }), req.body);
    return setWage(charId(req), p.locationId, p.id, body.wage);
  });
  app.delete('/businesses/:locationId/staff/:id', async (req) => {
    const p = parse(z.object({ locationId: z.string(), id: z.coerce.number().int() }), req.params);
    return endJob(charId(req), p.locationId, p.id);
  });
  app.post('/businesses/:locationId/job', async (req) => {
    const body = parse(z.object({ accept: z.boolean() }), req.body);
    return answerJob(charId(req), parse(loc, req.params).locationId, body.accept);
  });

  // ---------- Festivaller ----------
  app.get('/festivals', async (req) => ({ festivals: await festivalsList(charId(req)) }));
  app.get('/festivals/:id', async (req) => ({ festival: await festivalView(pool, parse(idParam, req.params).id, charId(req)) }));
  app.post('/festivals/:id/apply', async (req) => applyToFestival(charId(req), parse(idParam, req.params).id));

  // ---------- Haftalık görevler ----------
  app.get('/missions', async (req) => missionsState(pool, charId(req)));
  app.post('/missions/:id/claim', async (req) => claimMission(charId(req), parse(z.object({ id: z.string().max(40) }), req.params).id));
}
