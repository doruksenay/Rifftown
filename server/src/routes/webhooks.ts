// Mağaza satın alımları: RevenueCat, App Store ve Google Play aboneliklerini tek yerden bildirir.
// RevenueCat panelinde webhook adresi olarak https://ALAN-ADIN/api/webhooks/revenuecat girilir,
// "Authorization header" alanına REVENUECAT_WEBHOOK_SECRET değeri yazılır.
// Uygulama tarafında RevenueCat'e kullanıcı kimliği olarak oyundaki kullanıcı id'si verilmelidir.

import crypto from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { config } from '../config';
import { one, tx } from '../db';
import { fail } from '../errors';
import { extendVip, planDays, revokeVip, setVipUntil } from '../game/vip';

const GRANT_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'NON_RENEWING_PURCHASE',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
  'SUBSCRIPTION_EXTENDED',
  'REFUND_REVERSED',
]);
/** RevenueCat iadeleri CANCELLATION olayıyla ve bu nedenle bildirir. Normal iptalde süre dolana kadar VIP sürer. */
const REFUND_REASON = 'CUSTOMER_SUPPORT';

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/webhooks/revenuecat', async (req) => {
    if (!config.revenuecatSecret) fail('not_configured', 404);
    const got = String(req.headers.authorization ?? '');
    const want = config.revenuecatSecret;
    const ok = got.length === want.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
    if (!ok) fail('unauthorized', 401);

    const event = (req.body as any)?.event;
    if (!event?.type) fail('invalid_input');
    const isRefund = event.type === 'CANCELLATION' && event.cancel_reason === REFUND_REASON;
    if (!GRANT_EVENTS.has(event.type) && !isRefund) return { ok: true, ignored: event.type };
    const userId = Number(event.app_user_id);
    if (!Number.isInteger(userId)) return { ok: true, ignored: 'anonymous_user' };

    if (isRefund) {
      return tx(async (c) => {
        if (event.id && (await one(c, 'SELECT 1 FROM vip_grants WHERE event_id = $1', [event.id]))) return { ok: true, duplicate: true };
        const until = await revokeVip(c, userId, 'revenuecat_refund', event.product_id ?? null, event.id ?? null);
        return until ? { ok: true, revoked: true } : { ok: true, ignored: 'unknown_user' };
      });
    }

    return tx(async (c) => {
      if (event.id && (await one(c, 'SELECT 1 FROM vip_grants WHERE event_id = $1', [event.id]))) return { ok: true, duplicate: true };
      const productId = event.product_id ?? null;
      let until: Date | null = null;
      if (event.expiration_at_ms) {
        until = await setVipUntil(c, userId, new Date(Number(event.expiration_at_ms)), 'revenuecat', productId, event.id ?? null);
      } else {
        const days = planDays(productId);
        if (!days) return { ok: true, ignored: 'unknown_product' };
        until = await extendVip(c, userId, days, 'revenuecat', productId, event.id ?? null);
      }
      if (!until) return { ok: true, ignored: 'unknown_user' };
      return { ok: true, vipUntil: until.toISOString() };
    });
  });
}
