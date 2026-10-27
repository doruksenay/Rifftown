// Sosyal ve ilişki rotaları: mesajlar, arkadaşlar, engelleme, ziyaretçi defteri, şikâyet, hediye, ilişkiler.

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { fail } from '../errors';
import { charId, requireUser } from '../auth';
import { answerFling, flingState, offerFling } from '../game/family';
import { answerAdoption, answerProposal, breakUp, cancelProposal, date, flirt, hangout, propose, relationship, requestAdoption, wedding } from '../game/relations';
import {
  answerFriend,
  block,
  conversations,
  deleteGuestbook,
  friendRequest,
  friends,
  giveGift,
  isBlocked,
  requirePlayer,
  guestbook,
  report,
  sendMessage,
  signGuestbook,
  thread,
  unblock,
  unfriend,
} from '../game/social';
import { idParam, parse } from './util';
import { acceptTrade, cancelTrade, declineTrade, proposeTrade, tradeableItems, tradesOf } from '../game/trades';
import { pool } from '../db';

const other = z.object({ id: z.coerce.number().int().positive() });

export async function communityRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireUser);

  // ---------- Mesajlar ----------
  app.get('/messages', async (req) => ({ conversations: await conversations(charId(req)) }));
  app.get('/messages/:id', async (req) => {
    const { id } = parse(other, req.params);
    const q = parse(z.object({ before: z.coerce.number().int().optional() }), req.query);
    return thread(charId(req), id, q.before);
  });
  app.post('/messages/:id', async (req) => {
    const { id } = parse(other, req.params);
    const body = parse(z.object({ text: z.string().min(1).max(2000) }), req.body);
    return sendMessage(charId(req), id, body.text);
  });

  // ---------- Arkadaşlar ve engelleme ----------
  app.get('/friends', async (req) => friends(charId(req)));
  app.post('/friends/:id', async (req) => friendRequest(charId(req), parse(other, req.params).id));
  app.post('/friends/:id/answer', async (req) => {
    const body = parse(z.object({ accept: z.boolean() }), req.body);
    return answerFriend(charId(req), parse(other, req.params).id, body.accept);
  });
  app.delete('/friends/:id', async (req) => unfriend(charId(req), parse(other, req.params).id));
  app.post('/blocks/:id', async (req) => block(charId(req), parse(other, req.params).id));
  app.delete('/blocks/:id', async (req) => unblock(charId(req), parse(other, req.params).id));

  // ---------- Ziyaretçi defteri ----------
  app.get('/characters/:id/guestbook', async (req) => ({
    entries: await guestbook(parse(other, req.params).id, charId(req), req.user!.isAdmin),
  }));
  app.post('/characters/:id/guestbook', async (req) => {
    const body = parse(z.object({ text: z.string().min(1).max(1000) }), req.body);
    return signGuestbook(charId(req), parse(other, req.params).id, body.text);
  });
  app.delete('/guestbook/:id', async (req) => deleteGuestbook(parse(idParam, req.params).id, charId(req), req.user!.isAdmin));

  // ---------- Şikâyet ve hediye ----------
  app.post('/reports', async (req) => {
    const body = parse(z.object({ kind: z.enum(['message', 'guestbook', 'profile', 'article']), targetId: z.number().int(), text: z.string().max(300).default('') }), req.body);
    return report(charId(req), body.kind, body.targetId, body.text);
  });
  app.post('/gifts', async (req) => {
    const body = parse(z.object({ toId: z.number().int(), inventoryId: z.number().int() }), req.body);
    return giveGift(charId(req), body.toId, body.inventoryId);
  });

  // ---------- Takas ----------
  app.get('/trades', async (req) => tradesOf(charId(req)));
  app.get('/characters/:id/items', async (req) => {
    const { id } = parse(other, req.params);
    await requirePlayer(pool, id);
    if (id !== charId(req) && (await isBlocked(pool, charId(req), id))) fail('blocked', 403);
    return { items: await tradeableItems(pool, id) };
  });
  app.post('/trades', async (req) => {
    const body = parse(
      z.object({
        toId: z.number().int(),
        give: z.array(z.number().int()).max(20),
        want: z.array(z.number().int()).max(20),
        giveMoney: z.number().int().min(0).default(0),
        wantMoney: z.number().int().min(0).default(0),
        note: z.string().max(200).default(''),
      }),
      req.body,
    );
    return proposeTrade(charId(req), body);
  });
  app.post('/trades/:id/accept', async (req) => acceptTrade(charId(req), parse(idParam, req.params).id));
  app.post('/trades/:id/decline', async (req) => declineTrade(charId(req), parse(idParam, req.params).id));
  app.delete('/trades/:id', async (req) => cancelTrade(charId(req), parse(idParam, req.params).id));

  // ---------- İlişkiler ----------
  app.get('/characters/:id/relationship', async (req) => relationship(charId(req), parse(other, req.params).id));
  app.post('/relationships/:id/hangout', async (req) => hangout(charId(req), parse(other, req.params).id));
  app.post('/relationships/:id/flirt', async (req) => flirt(charId(req), parse(other, req.params).id));
  // Tek gecelik macera: teklif, kabul ya da ret (karşılıklı onay)
  app.get('/relationships/:id/fling', async (req) => flingState(pool, charId(req), parse(other, req.params).id));
  app.post('/relationships/:id/fling', async (req) => offerFling(charId(req), parse(other, req.params).id));
  app.post('/relationships/:id/fling/:answer', async (req) => {
    const { id, answer } = parse(z.object({ id: z.coerce.number().int(), answer: z.enum(['accept', 'decline']) }), req.params);
    return answerFling(charId(req), id, answer === 'accept');
  });
  app.post('/relationships/:id/date', async (req) => {
    const body = parse(z.object({ locationId: z.string() }), req.body);
    return date(charId(req), parse(other, req.params).id, body.locationId);
  });
  app.post('/relationships/:id/propose', async (req) => {
    const body = parse(z.object({ ringId: z.number().int() }), req.body);
    return propose(charId(req), parse(other, req.params).id, body.ringId);
  });
  app.post('/relationships/:id/proposal', async (req) => {
    const body = parse(z.object({ accept: z.boolean() }), req.body);
    return answerProposal(charId(req), parse(other, req.params).id, body.accept);
  });
  app.delete('/relationships/:id/proposal', async (req) => cancelProposal(charId(req), parse(other, req.params).id));
  app.post('/relationships/:id/wedding', async (req) => {
    const body = parse(z.object({ locationId: z.string() }), req.body);
    return wedding(charId(req), parse(other, req.params).id, body.locationId);
  });
  app.post('/relationships/:id/break-up', async (req) => {
    const body = parse(z.object({ locationId: z.string().optional() }), req.body);
    return breakUp(charId(req), parse(other, req.params).id, body.locationId);
  });
  app.post('/relationships/:id/adopt', async (req) => {
    const body = parse(z.object({ locationId: z.string(), name: z.string().max(40) }), req.body);
    return requestAdoption(charId(req), parse(other, req.params).id, body.locationId, body.name);
  });
  app.post('/relationships/:id/adoption', async (req) => {
    const body = parse(z.object({ accept: z.boolean() }), req.body);
    return answerAdoption(charId(req), parse(other, req.params).id, body.accept);
  });
}
