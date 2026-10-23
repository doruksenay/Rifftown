// VIP üyelik: süre uzatma (yönetici ya da mağaza satın alımı)

import { VIP_PLANS } from '@rifftown/shared';
import { type Db, one } from '../db';

/** VIP süresini gün olarak uzatır; süresi dolmuşsa bugünden başlar. */
export async function extendVip(db: Db, userId: number, days: number, source: string, productId: string | null = null, eventId: string | null = null) {
  const r = await one(
    db,
    `UPDATE users SET vip_until = GREATEST(COALESCE(vip_until, now()), now()) + ($2::int * interval '1 day')
      WHERE id = $1 RETURNING vip_until`,
    [userId, days],
  );
  if (!r) return null;
  await db.query('INSERT INTO vip_grants(user_id, source, product_id, days, until, event_id) VALUES ($1, $2, $3, $4, $5, $6)', [
    userId, source, productId, days, r.vip_until, eventId,
  ]);
  return r.vip_until as Date;
}

/** Mağazanın bildirdiği bitiş tarihini uygular (yalnızca ileri taşır). */
export async function setVipUntil(db: Db, userId: number, until: Date, source: string, productId: string | null, eventId: string | null) {
  const r = await one(db, 'UPDATE users SET vip_until = GREATEST(COALESCE(vip_until, $2), $2) WHERE id = $1 RETURNING vip_until', [userId, until]);
  if (!r) return null;
  await db.query('INSERT INTO vip_grants(user_id, source, product_id, until, event_id) VALUES ($1, $2, $3, $4, $5)', [
    userId, source, productId, r.vip_until, eventId,
  ]);
  return r.vip_until as Date;
}

/** İade: VIP'i hemen kapatır ve kaydını tutar. (Yöneticinin elle verdiği süre gerekirse yeniden verilir.) */
export async function revokeVip(db: Db, userId: number, source: string, productId: string | null, eventId: string | null) {
  const r = await one(db, 'UPDATE users SET vip_until = LEAST(COALESCE(vip_until, now()), now()) WHERE id = $1 RETURNING vip_until', [userId]);
  if (!r) return null;
  await db.query('INSERT INTO vip_grants(user_id, source, product_id, until, event_id) VALUES ($1, $2, $3, $4, $5)', [
    userId, source, productId, r.vip_until, eventId,
  ]);
  return r.vip_until as Date;
}

export const planDays = (productId: string) => VIP_PLANS.find((p) => p.productId === productId)?.days ?? null;
