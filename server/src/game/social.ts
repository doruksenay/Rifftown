// Sosyal: özel mesajlar, arkadaşlık, engelleme, ziyaretçi defteri, şikâyet, hediye.
// İlişkiler (takılma, flört, randevu, evlilik, aile) relations.ts içindedir.

import {
  type ConversationDto,
  type DirectMessageDto,
  type FriendsResponse,
  type GuestbookEntryDto,
  ITEM_BY_ID,
  type PersonDto,
  maskProfanity,
  isBoundItem,
  GIFT_BONUS_COOLDOWN_HOURS,
  MAX_GIFT_FRIENDSHIP,
  gameHoursToMs,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one, pool, tx } from '../db';
import { handOver, returnsTooSoon, ringPledged } from './items';
import { addMoodlet } from './wellbeing';
import { fail } from '../errors';
import { avatarUrl, lockCharacter, notify, requireEstablished } from './common';

export const pair = (x: number, y: number): [number, number] => (x < y ? [x, y] : [y, x]);

/** Kontrol, görünmez ve yön değiştiren karakterleri temizler */
export function cleanText(v: string, singleLine = false): string {
  const x = v
    .replace(singleLine ? /[\u0000-\u001f\u007f]/g : /[\u0000-\u0009\u000b-\u001f\u007f]/g, '')
    .replace(/[​-‏‪-‮⁦-⁩﻿]/g, '');
  return singleLine ? x.trim() : x.replace(/\n{3,}/g, '\n\n').trim();
}

export const toPerson = (r: any, prefix = ''): PersonDto => ({
  characterId: Number(r[`${prefix}id`]),
  name: r[`${prefix}name`],
  avatarColor: r[`${prefix}avatar_color`],
  avatarUrl: avatarUrl(Number(r[`${prefix}id`]), r[`${prefix}avatar_version`]),
  cityId: r[`${prefix}city_id`] ?? null,
});

/** Hedef gerçek bir oyuncu mu (yapay karakterlerle sosyal etkileşim yok) */
export async function requirePlayer(db: Db, id: number) {
  const r = await one(db, 'SELECT id, name, npc, city_id, dead_at, retired_at FROM characters WHERE id = $1', [id]);
  // Ölen ya da mirasını devredip emekliye ayrılan karakter sosyal hedef değildir
  if (!r || r.dead_at || r.retired_at) fail('character_not_found', 404);
  if (r.npc) fail('npc_target', 403);
  return r as { id: number; name: string; npc: boolean; city_id: string | null };
}

export async function isBlocked(db: Db, a: number, b: number) {
  return !!(await one(db, 'SELECT 1 FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)', [a, b]));
}

/** İlişki satırını oluşturur (yoksa) ve kilitler */
export async function lockRel(c: pg.PoolClient, x: number, y: number) {
  const [a, b] = pair(x, y);
  await c.query('INSERT INTO relationships(a_id, b_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [a, b]);
  return one(c, 'SELECT * FROM relationships WHERE a_id = $1 AND b_id = $2 FOR UPDATE', [a, b]);
}

// ---------- Özel mesajlar ----------

const lastDm = new Map<number, number>();
export const DM_MAX = 1000;

export async function sendMessage(fromId: number, toId: number, text: string) {
  if (fromId === toId) fail('invalid_target');
  const body = maskProfanity(cleanText(text));
  if (!body || body.length > DM_MAX) fail('invalid_message');
  const now = Date.now();
  if (now - (lastDm.get(fromId) ?? 0) < 300) fail('slow_down', 429);
  lastDm.set(fromId, now);
  return tx(async (c) => {
    const target = await requirePlayer(c, toId);
    if (await isBlocked(c, fromId, toId)) fail('blocked', 403);
    // Okunmamış mesajı yoksa bildirim gönder (her mesaj için değil)
    const pending = await one(c, 'SELECT 1 FROM direct_messages WHERE from_id = $1 AND to_id = $2 AND NOT read LIMIT 1', [fromId, toId]);
    const r = await one(c, 'INSERT INTO direct_messages(from_id, to_id, text) VALUES ($1, $2, $3) RETURNING *', [fromId, target.id, body]);
    if (!pending) {
      const from = await one(c, 'SELECT name FROM characters WHERE id = $1', [fromId]);
      await notify(c, toId, 'message', { fromId, from: from.name, preview: body.slice(0, 80) });
    }
    return { message: { id: r.id, mine: true, text: r.text, createdAt: r.created_at.toISOString() } as DirectMessageDto };
  });
}

export async function conversations(viewer: number): Promise<ConversationDto[]> {
  const rows = await many(
    pool,
    `SELECT DISTINCT ON (other) other, m.text, m.created_at, m.from_id,
            c.id, c.name, c.avatar_color, c.avatar_version, c.city_id,
            (SELECT count(*)::int FROM direct_messages u WHERE u.from_id = other AND u.to_id = $1 AND NOT u.read) AS unread
       FROM (SELECT *, CASE WHEN from_id = $1 THEN to_id ELSE from_id END AS other
               FROM direct_messages WHERE from_id = $1 OR to_id = $1) m
       JOIN characters c ON c.id = m.other
      ORDER BY other, m.id DESC`,
    [viewer],
  );
  return rows
    .map((r) => ({
      ...toPerson(r),
      lastText: r.text,
      lastAt: r.created_at.toISOString(),
      lastMine: Number(r.from_id) === viewer,
      unread: r.unread,
    }))
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}

export async function thread(viewer: number, other: number, beforeId?: number) {
  const person = await one(pool, 'SELECT id, name, avatar_color, avatar_version, city_id, npc FROM characters WHERE id = $1', [other]);
  if (!person) fail('character_not_found', 404);
  const rows = await many(
    pool,
    `SELECT * FROM direct_messages
      WHERE ((from_id = $1 AND to_id = $2) OR (from_id = $2 AND to_id = $1)) AND ($3::bigint IS NULL OR id < $3)
      ORDER BY id DESC LIMIT 50`,
    [viewer, other, beforeId ?? null],
  );
  await pool.query('UPDATE direct_messages SET read = TRUE WHERE from_id = $1 AND to_id = $2 AND NOT read', [other, viewer]);
  return {
    person: toPerson(person),
    blocked: await isBlocked(pool, viewer, other),
    messages: rows.reverse().map((r): DirectMessageDto => ({ id: r.id, mine: Number(r.from_id) === viewer, text: r.text, createdAt: r.created_at.toISOString() })),
  };
}

export async function unreadMessages(db: Db, viewer: number) {
  return (await one(db, 'SELECT count(*)::int AS n FROM direct_messages WHERE to_id = $1 AND NOT read', [viewer]))!.n as number;
}

// ---------- Arkadaşlık ----------

export async function friendRequest(fromId: number, toId: number) {
  if (fromId === toId) fail('invalid_target');
  return tx(async (c) => {
    const target = await requirePlayer(c, toId);
    if (await isBlocked(c, fromId, toId)) fail('blocked', 403);
    const rel = await lockRel(c, fromId, target.id);
    if (rel.friends) fail('already_friends', 409);
    const from = await one(c, 'SELECT name FROM characters WHERE id = $1', [fromId]);
    if (rel.friend_request && Number(rel.friend_request) === toId) {
      // Karşı taraf zaten istek göndermiş: kabul edilmiş sayılır
      await c.query('UPDATE relationships SET friends = TRUE, friend_request = NULL, updated_at = now() WHERE a_id = $1 AND b_id = $2', [rel.a_id, rel.b_id]);
      await notify(c, toId, 'friend_accepted', { fromId, from: from.name });
      return { status: 'friends' as const };
    }
    if (rel.friend_request) fail('already_requested', 409);
    await c.query('UPDATE relationships SET friend_request = $3, updated_at = now() WHERE a_id = $1 AND b_id = $2', [rel.a_id, rel.b_id, fromId]);
    await notify(c, toId, 'friend_request', { fromId, from: from.name });
    return { status: 'requested' as const };
  });
}

export async function answerFriend(viewer: number, other: number, accept: boolean) {
  return tx(async (c) => {
    const rel = await lockRel(c, viewer, other);
    if (Number(rel.friend_request) !== other) fail('no_request', 404);
    await c.query('UPDATE relationships SET friends = $3, friend_request = NULL, updated_at = now() WHERE a_id = $1 AND b_id = $2', [rel.a_id, rel.b_id, accept]);
    if (accept) {
      const me = await one(c, 'SELECT name FROM characters WHERE id = $1', [viewer]);
      await notify(c, other, 'friend_accepted', { fromId: viewer, from: me.name });
    }
    return { ok: true };
  });
}

export async function unfriend(viewer: number, other: number) {
  return tx(async (c) => {
    const rel = await lockRel(c, viewer, other);
    await c.query('UPDATE relationships SET friends = FALSE, friend_request = NULL, updated_at = now() WHERE a_id = $1 AND b_id = $2', [rel.a_id, rel.b_id]);
    return { ok: true };
  });
}

export async function friends(viewer: number): Promise<FriendsResponse> {
  const rows = await many(
    pool,
    `SELECT r.*, c.id, c.name, c.avatar_color, c.avatar_version, c.city_id
       FROM relationships r JOIN characters c ON c.id = CASE WHEN r.a_id = $1 THEN r.b_id ELSE r.a_id END
      WHERE (r.a_id = $1 OR r.b_id = $1) AND (r.friends OR r.friend_request IS NOT NULL)
      ORDER BY c.name`,
    [viewer],
  );
  return {
    friends: rows
      .filter((r) => r.friends)
      .map((r) => ({ ...toPerson(r), friendship: Math.round(r.friendship), romance: Math.round(r.romance), stage: r.stage })),
    incoming: rows.filter((r) => !r.friends && r.friend_request && Number(r.friend_request) !== viewer).map((r) => toPerson(r)),
    outgoing: rows.filter((r) => !r.friends && Number(r.friend_request) === viewer).map((r) => toPerson(r)),
  };
}

// ---------- Engelleme ----------

export async function block(viewer: number, other: number) {
  if (viewer === other) fail('invalid_target');
  return tx(async (c) => {
    await requirePlayer(c, other);
    await c.query('INSERT INTO blocks(blocker_id, blocked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [viewer, other]);
    const rel = await lockRel(c, viewer, other);
    // Engel arkadaşlığı, bekleyen istekleri ve nişanı bitirir (evlilik ancak mahkemede biter)
    await c.query(
      `UPDATE relationships SET friends = FALSE, friend_request = NULL, proposal_by = NULL, proposal_ring = NULL, adoption_by = NULL,
              stage = CASE WHEN stage = 'married' THEN 'married' ELSE 'none' END, updated_at = now()
        WHERE a_id = $1 AND b_id = $2`,
      [rel.a_id, rel.b_id],
    );
    if (rel.stage === 'engaged') await c.query('DELETE FROM partners WHERE character_id IN ($1, $2)', [viewer, other]);
    return { ok: true };
  });
}

export async function unblock(viewer: number, other: number) {
  await pool.query('DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2', [viewer, other]);
  return { ok: true };
}

// ---------- Ziyaretçi defteri ----------

const lastNote = new Map<string, number>();
export const GUESTBOOK_MAX = 500;

export async function guestbook(ownerId: number, viewer: number, isAdmin = false): Promise<GuestbookEntryDto[]> {
  const rows = await many(
    pool,
    `SELECT g.*, c.id AS a_id, c.name AS a_name, c.avatar_color AS a_avatar_color, c.avatar_version AS a_avatar_version, c.city_id AS a_city_id
       FROM guestbook g JOIN characters c ON c.id = g.author_id
      WHERE g.owner_id = $1 ORDER BY g.id DESC LIMIT 50`,
    [ownerId],
  );
  return rows.map((r) => ({
    id: r.id,
    author: toPerson(r, 'a_'),
    text: r.text,
    createdAt: r.created_at.toISOString(),
    canDelete: isAdmin || Number(r.owner_id) === viewer || Number(r.author_id) === viewer,
  }));
}

export async function signGuestbook(authorId: number, ownerId: number, text: string) {
  const body = maskProfanity(cleanText(text));
  if (!body || body.length > GUESTBOOK_MAX) fail('invalid_message');
  const key = `${authorId}:${ownerId}`;
  if (Date.now() - (lastNote.get(key) ?? 0) < 30_000) fail('slow_down', 429);
  return tx(async (c) => {
    await requirePlayer(c, ownerId);
    if (await isBlocked(c, authorId, ownerId)) fail('blocked', 403);
    const r = await one(c, 'INSERT INTO guestbook(owner_id, author_id, text) VALUES ($1, $2, $3) RETURNING id', [ownerId, authorId, body]);
    lastNote.set(key, Date.now());
    if (ownerId !== authorId) {
      const a = await one(c, 'SELECT name FROM characters WHERE id = $1', [authorId]);
      await notify(c, ownerId, 'guestbook', { fromId: authorId, from: a.name });
    }
    return { id: r.id };
  });
}

export async function deleteGuestbook(id: number, viewer: number, isAdmin: boolean) {
  const r = await one(pool, 'SELECT owner_id, author_id FROM guestbook WHERE id = $1', [id]);
  if (!r) fail('not_found', 404);
  if (!isAdmin && Number(r.owner_id) !== viewer && Number(r.author_id) !== viewer) fail('forbidden', 403);
  await pool.query('DELETE FROM guestbook WHERE id = $1', [id]);
  return { ok: true };
}

// ---------- Şikâyet ----------

export async function report(reporter: number, kind: 'message' | 'guestbook' | 'profile' | 'article', targetId: number, text: string) {
  const exists =
    kind === 'message'
      ? await one(pool, 'SELECT 1 FROM direct_messages WHERE id = $1 AND to_id = $2', [targetId, reporter])
      : kind === 'guestbook'
        ? await one(pool, 'SELECT 1 FROM guestbook WHERE id = $1', [targetId])
        : kind === 'article'
          ? await one(pool, 'SELECT 1 FROM articles WHERE id = $1 AND NOT removed', [targetId])
          : await one(pool, 'SELECT 1 FROM characters WHERE id = $1', [targetId]);
  // Aynı kişi aynı içeriği bir kez şikâyet eder (kuyruk şişmesin)
  if (await one(pool, `SELECT 1 FROM reports WHERE reporter_id = $1 AND kind = $2 AND target_id = $3 AND status = 'open'`, [reporter, kind, targetId])) {
    return { ok: true };
  }
  if (!exists) fail('not_found', 404);
  await pool.query('INSERT INTO reports(reporter_id, kind, target_id, text) VALUES ($1, $2, $3, $4)', [reporter, kind, targetId, cleanText(text ?? '').slice(0, 300)]);
  return { ok: true };
}

// ---------- Hediye ----------

/** Aynı şehirdeki bir oyuncuya envanterden eşya vermek */
export async function giveGift(fromId: number, toId: number, inventoryId: number) {
  if (fromId === toId) fail('invalid_target');
  return tx(async (c) => {
    for (const id of pair(fromId, toId)) await lockCharacter(c, id);
    const target = await requirePlayer(c, toId);
    if (await isBlocked(c, fromId, toId)) fail('blocked', 403);
    await requireEstablished(c, fromId);
    const me = await one(c, 'SELECT name, city_id FROM characters WHERE id = $1', [fromId]);
    if (!me.city_id || me.city_id !== target.city_id) fail('not_in_same_city');
    const inv = await one(c, 'SELECT * FROM inventory WHERE id = $1 AND character_id = $2 FOR UPDATE', [inventoryId, fromId]);
    if (!inv) fail('not_found', 404);
    if (inv.listed) fail('item_listed', 409);
    if (await ringPledged(c, inv.id)) fail('ring_pledged', 409);
    if (isBoundItem(inv.item_id)) fail('item_bound', 409);
    if (returnsTooSoon(inv, toId)) fail('item_recently_yours', 409);
    // VIP eşyası sadece VIP üyeye verilebilir (pazardaki kuralın aynısı)
    if (ITEM_BY_ID[inv.item_id]?.vip) {
      const vip = await one(c, 'SELECT u.vip_until FROM characters ch JOIN users u ON u.id = ch.user_id WHERE ch.id = $1', [toId]);
      if (!vip?.vip_until || vip.vip_until.getTime() < Date.now()) fail('vip_required', 403);
    }
    await handOver(c, inv.id, fromId, toId);
    await c.query(`INSERT INTO social_log(actor_id, target_id, kind) VALUES ($1, $2, 'gift')`, [fromId, toId]);
    // Hediyelik eşya arkadaşlığa küçük bir katkı verir: aynı kişiye 24 oyun saatinde bir kez (tavanlı, para üretmez)
    const giftDef = ITEM_BY_ID[inv.item_id]?.gift;
    if (giftDef) {
      const since = new Date(Date.now() - gameHoursToMs(GIFT_BONUS_COOLDOWN_HOURS, config.gameSpeed));
      const recent = await one(c, `SELECT 1 FROM social_log WHERE actor_id = $1 AND target_id = $2 AND kind = 'gift_bonus' AND created_at > $3`, [fromId, toId, since]);
      if (!recent) {
        const rel = await lockRel(c, fromId, toId);
        const gain = Math.min(MAX_GIFT_FRIENDSHIP, giftDef.friendship);
        await c.query('UPDATE relationships SET friendship = LEAST(100, friendship + $3), updated_at = now() WHERE a_id = $1 AND b_id = $2', [rel.a_id, rel.b_id, gain]);
        await c.query(`INSERT INTO social_log(actor_id, target_id, kind) VALUES ($1, $2, 'gift_bonus')`, [fromId, toId]);
      }
    }
    await addMoodlet(c, toId, 'gift');
    await notify(c, toId, 'gift', { fromId, from: me.name, itemId: inv.item_id, name: ITEM_BY_ID[inv.item_id]?.name ?? null });
    return { ok: true };
  });
}
