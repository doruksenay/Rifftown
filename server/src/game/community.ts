// Topluluk: blog, şehir panosu ve haftalık dergi (kurallar: packages/shared/src/community.ts).
// Yazılar 'articles' tablosunda tutulur (kind: blog | board); haberler (news) press.ts'de.

import {
  BLOG_BODY_MAX,
  BLOG_BODY_MIN,
  BLOG_COOLDOWN_HOURS,
  BLOG_TITLE_MAX,
  BOARD_COOLDOWN_HOURS,
  BOARD_DAYS,
  BOARD_MAX,
  CITY_BY_ID,
  MAGAZINE_SIZE,
  gameHoursToMs,
  maskProfanity,
} from '@rifftown/shared';
import { config } from '../config';
import { many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { isJailed, lockCharacter } from './common';
import { toArticleDto } from './press';
import { cleanText } from './social';

const hoursMs = (h: number) => gameHoursToMs(h, config.gameSpeed);

async function cooldown(characterId: number, kind: 'blog' | 'board', hours: number) {
  const r = await one(pool, `SELECT 1 FROM articles WHERE author_id = $1 AND kind = $2 AND created_at > $3`, [
    characterId,
    kind,
    new Date(Date.now() - hoursMs(hours)),
  ]);
  if (r) fail('slow_down', 429);
}

/** Blog yazısı: herkes yazabilir; profilde ve bulunduğu şehrin blog akışında görünür */
export async function postBlog(characterId: number, input: { title: string; body: string }) {
  const title = maskProfanity(cleanText(input.title ?? '', true));
  const body = maskProfanity(cleanText(input.body ?? ''));
  if (title.length < 3 || title.length > BLOG_TITLE_MAX) fail('invalid_title');
  if (body.length < BLOG_BODY_MIN || body.length > BLOG_BODY_MAX) fail('invalid_body');
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    if (!ch.city_id) fail('traveling', 409);
    await cooldown(characterId, 'blog', BLOG_COOLDOWN_HOURS);
    const r = await one(c, `INSERT INTO articles(author_id, city_id, kind, title, body) VALUES ($1, $2, 'blog', $3, $4) RETURNING id`, [
      characterId,
      ch.city_id,
      title,
      body,
    ]);
    return { id: Number(r.id) };
  });
}

/** Şehir panosu: kısa not; o şehirde olmak gerekir, cezaevinden yazılamaz */
export async function postBoard(characterId: number, cityId: string, text: string) {
  if (!CITY_BY_ID[cityId]) fail('not_found', 404);
  const body = maskProfanity(cleanText(text ?? ''));
  if (body.length < 1 || body.length > BOARD_MAX) fail('invalid_message');
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    if (ch.city_id !== cityId) fail('not_in_city', 403);
    if (isJailed(ch)) fail('in_jail', 409);
    await cooldown(characterId, 'board', BOARD_COOLDOWN_HOURS);
    const r = await one(c, `INSERT INTO articles(author_id, city_id, kind, title, body) VALUES ($1, $2, 'board', '', $3) RETURNING id`, [characterId, cityId, body]);
    return { id: Number(r.id) };
  });
}

/** Yazar kendi blog ya da pano yazısını siler (haber silinemez: basın etkisi var; yönetici kaldırır) */
export async function deletePost(characterId: number, id: number, isAdmin: boolean) {
  const a = await one(pool, 'SELECT author_id, kind FROM articles WHERE id = $1 AND NOT removed', [id]);
  if (!a) fail('not_found', 404);
  if (!isAdmin && (Number(a.author_id) !== characterId || a.kind === 'news')) fail('forbidden', 403);
  await pool.query('UPDATE articles SET removed = TRUE WHERE id = $1', [id]);
  return { ok: true };
}

/** Bir oyuncunun blog yazıları (profil) */
export async function blogOf(authorId: number, viewer: number) {
  const rows = await many(
    pool,
    `SELECT a.*, c.name AS author_name, NULL AS band_name FROM articles a JOIN characters c ON c.id = a.author_id
      WHERE a.author_id = $1 AND a.kind = 'blog' AND NOT a.removed
        AND NOT EXISTS (SELECT 1 FROM blocks x WHERE (x.blocker_id = $2 AND x.blocked_id = $1) OR (x.blocker_id = $1 AND x.blocked_id = $2))
      ORDER BY a.id DESC LIMIT 20`,
    [authorId, viewer],
  );
  return rows.map((r) => ({ ...toArticleDto(r), mine: authorId === viewer }));
}

/** Haftalık dergi: son kapanan liste haftasında şehirde yayınlanan haberler (gazeteci ve oyunun muhabirleri) */
export async function magazine(cityId: string, viewer: number) {
  if (!CITY_BY_ID[cityId]) fail('not_found', 404);
  const week = await one(pool, `SELECT id, starts_at, ends_at FROM chart_weeks WHERE status = 'closed' ORDER BY id DESC LIMIT 1`);
  const since = week ? week.starts_at : new Date(Date.now() - hoursMs(7 * 24));
  const until = week ? week.ends_at : new Date();
  const rows = await many(
    pool,
    `SELECT a.*, c.name AS author_name, b.name AS band_name FROM articles a
       LEFT JOIN characters c ON c.id = a.author_id LEFT JOIN bands b ON b.id = a.band_id
      WHERE a.city_id = $1 AND a.kind = 'news' AND NOT a.removed AND a.created_at BETWEEN $2 AND $3
        AND (a.author_id IS NULL OR NOT EXISTS (SELECT 1 FROM blocks x WHERE (x.blocker_id = $4 AND x.blocked_id = a.author_id) OR (x.blocker_id = a.author_id AND x.blocked_id = $4)))
      ORDER BY abs(a.impact) DESC, a.id DESC LIMIT $5`,
    [cityId, since, until, viewer, MAGAZINE_SIZE],
  );
  return { weekId: week ? Number(week.id) : null, cityId, articles: rows.map(toArticleDto) };
}

/** Pano notları eskiyince akıştan düşer (silinmez, şikâyet geçmişi korunur) */
export const boardSince = () => new Date(Date.now() - hoursMs(BOARD_DAYS * 24));
