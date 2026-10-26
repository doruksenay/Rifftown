// Basın ve medya (kurallar: packages/shared/src/press.ts).
// - Grubun şehir bazlı basın desteği: konser seyircisini ve şöhret kazancını etkiler, zamanla nötre döner.
// - Basın toplantısı (lider, grup ve şehir başına bekleme) ve röportaj (her üye): süreli eylem 'press'.
// - Gazeteci mesleği: haber yazmak süreli eylem 'write_article'; yayınlanınca grubun basın desteğini etkiler.
// - Skandallar basın desteğini düşürür.

import {
  ARTICLE_BODY_MAX,
  ARTICLE_BODY_MIN,
  ARTICLE_COOLDOWN_HOURS,
  ARTICLE_HOURS,
  ARTICLE_TITLE_MAX,
  ARTICLE_WEEKLY_CAP,
  type ArticleTone,
  ARTICLE_TONES,
  CITY_BY_ID,
  LOCATION_BY_ID,
  PRESS_DRIFT_PER_DAY,
  PRESS_NEUTRAL,
  PRESS_RULES,
  type PressMode,
  SCANDALS,
  SCANDAL_DEFUSE_DAYS,
  SCANDAL_DEFUSE_SHARE,
  articleImpact,
  containsProfanity,
  gameHoursToMs,
  lv,
  maskProfanity,
  pressChance,
  pressGain,
  priceFor,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { type CharacterRow, membership, notify } from './common';
import { addFame } from './gigs';
import { cleanText } from './social';

const hoursMs = (h: number) => gameHoursToMs(h, config.gameSpeed);

/** Grubun bir şehirdeki basın desteği (yoksa nötr) */
export async function bandPress(db: Db, bandId: number, cityId: string): Promise<number> {
  const r = await one(db, 'SELECT value FROM band_press WHERE band_id = $1 AND city_id = $2', [bandId, cityId]);
  return r ? Number(r.value) : PRESS_NEUTRAL;
}

export async function bandPressAll(db: Db, bandId: number): Promise<Record<string, number>> {
  const rows = await many(db, 'SELECT city_id, value FROM band_press WHERE band_id = $1', [bandId]);
  return Object.fromEntries(rows.map((r) => [r.city_id, Math.round(Number(r.value) * 10) / 10]));
}

export async function addPress(db: Db, bandId: number, cityId: string, delta: number) {
  if (!delta || !CITY_BY_ID[cityId]) return;
  await db.query(
    `INSERT INTO band_press(band_id, city_id, value) VALUES ($1, $2, GREATEST(0, LEAST(100, $3::real + $4::real)))
     ON CONFLICT (band_id, city_id) DO UPDATE SET value = GREATEST(0, LEAST(100, band_press.value + $4::real)), updated_at = now()`,
    [bandId, cityId, PRESS_NEUTRAL, delta],
  );
}

/** Zamanlayıcı: basın desteği nötre döner (gün başına mesafenin %3'ü) */
export async function processPressDrift(): Promise<number> {
  const day = hoursMs(24);
  const r = await pool.query(
    `UPDATE band_press SET
        value = $1::real + (value - $1::real) * power(1 - $2::real, extract(epoch FROM (now() - updated_at)) * 1000 / $3),
        updated_at = now()
      WHERE updated_at < now() - ($3::double precision / 24 * interval '1 millisecond') AND value <> $1`,
    [PRESS_NEUTRAL, PRESS_DRIFT_PER_DAY, day],
  );
  return r.rowCount ?? 0;
}

/** Skandalın basın etkisi (consequences.ts skandal yarattığında çağırır) */
export async function scandalPress(db: Db, bandId: number, cityId: string, kind: keyof typeof SCANDALS, severity = 1) {
  await addPress(db, bandId, cityId, -SCANDALS[kind].press * severity);
}

// ---------- Basın toplantısı ve röportaj ----------

/** 'press' eylemini başlatırken: kurallar ve ücret */
export async function preparePress(c: pg.PoolClient, ch: CharacterRow, mode: PressMode, locationId: string) {
  const rules = PRESS_RULES[mode];
  if (!rules) fail('invalid_press');
  const loc = LOCATION_BY_ID[locationId];
  if (!loc || loc.type !== 'newspaper') fail('invalid_location');
  if (loc!.cityId !== ch.city_id) fail('not_in_city');
  const m = await membership(c, ch.id);
  if (!m) fail('no_band');
  if (rules.leaderOnly && m!.leader_id !== ch.id) fail('not_leader', 403);
  // Bekleme: basın toplantısı grup ve şehir başına, röportaj kişi başına
  const since = new Date(Date.now() - hoursMs(rules.cooldownHours));
  const recent =
    mode === 'conference'
      ? await one(c, `SELECT 1 FROM press_events WHERE band_id = $1 AND city_id = $2 AND mode = 'conference' AND created_at > $3`, [m!.band_id, loc!.cityId, since])
      : await one(c, `SELECT 1 FROM press_events WHERE character_id = $1 AND mode = 'interview' AND created_at > $2`, [ch.id, since]);
  // Başlamış ama bitmemiş bir basın eylemi de sayılır (aynı anda iki üye toplantı açamasın)
  const pending =
    mode === 'conference'
      ? await one(
          c,
          `SELECT 1 FROM actions a JOIN band_members bm ON bm.character_id = a.character_id
            WHERE bm.band_id = $1 AND a.kind = 'press' AND a.status = 'active' AND a.params->>'mode' = 'conference' AND a.params->>'cityId' = $2`,
          [m!.band_id, loc!.cityId],
        )
      : null;
  if (recent || pending) fail('press_cooldown', 409);
  return {
    hours: rules.hours,
    cost: priceFor(rules.price, CITY_BY_ID[loc!.cityId], 1),
    locationId: loc!.id,
    params: { mode, bandId: m!.band_id, cityId: loc!.cityId },
  };
}

export async function resolvePress(c: pg.PoolClient, ch: CharacterRow, params: Record<string, any>, rand = Math.random) {
  const mode = params.mode as PressMode;
  const rules = PRESS_RULES[mode];
  const m = await membership(c, ch.id);
  if (!rules || !m || m.band_id !== params.bandId) return { cancelled: true };
  const cityId = params.cityId as string;
  const fame = Number((await one(c, 'SELECT fame FROM band_fame WHERE band_id = $1 AND city_id = $2', [m.band_id, cityId]))?.fame ?? 0);
  const s = { media: lv(ch.skills, 'media'), rhetoric: lv(ch.skills, 'rhetoric'), charisma: lv(ch.skills, 'charisma') };
  const success = rand() < pressChance(s, fame);
  let delta = success ? pressGain(mode, s) : -rules.loss;
  let defused = false;
  // Başarılı basın toplantısı son günlerdeki skandalı yatıştırır
  if (success && mode === 'conference') {
    const sc = await one(
      c,
      `SELECT id, kind, severity FROM scandals WHERE band_id = $1 AND city_id = $2 AND NOT defused AND created_at > $3 ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
      [m.band_id, cityId, new Date(Date.now() - hoursMs(SCANDAL_DEFUSE_DAYS * 24))],
    );
    if (sc) {
      const def = SCANDALS[sc.kind as keyof typeof SCANDALS];
      if (def) {
        await c.query('UPDATE scandals SET defused = TRUE WHERE id = $1', [sc.id]);
        await addFame(c, m.band_id, cityId, def.fame * Number(sc.severity) * SCANDAL_DEFUSE_SHARE);
        delta += def.press * Number(sc.severity) * SCANDAL_DEFUSE_SHARE;
        defused = true;
      }
    }
    if (rules.fame) await addFame(c, m.band_id, cityId, rules.fame);
  }
  await addPress(c, m.band_id, cityId, delta);
  await c.query('INSERT INTO press_events(band_id, character_id, city_id, mode, success, delta) VALUES ($1, $2, $3, $4, $5, $6)', [
    m.band_id,
    ch.id,
    cityId,
    mode,
    success,
    delta,
  ]);
  // Medya ilişkileri becerisi kullanıldıkça gelişir
  if (typeof ch.skills.media === 'number') ch.skills.media = Math.min(100, ch.skills.media + 0.4 * (1 - ch.skills.media / 110));
  return { mode, success, pressDelta: Math.round(delta * 10) / 10, defused, cityId };
}

// ---------- Gazetecilik ----------

export interface ArticleInput {
  title: string;
  body: string;
  bandId?: number | null;
  tone?: ArticleTone;
}

/** Haber yazmaya başlarken: yalnızca gazeteciler, şehir gazetesinde; metin temizlenir ve küfür yıldızlanır */
export async function prepareArticle(c: pg.PoolClient, ch: CharacterRow, locationId: string, input: ArticleInput) {
  const loc = LOCATION_BY_ID[locationId];
  if (!loc || loc.type !== 'newspaper') fail('invalid_location');
  if (loc!.cityId !== ch.city_id) fail('not_in_city');
  if (ch.profession !== 'journalist') fail('not_journalist', 403);
  const title = maskProfanity(cleanText(input.title ?? '', true));
  const body = maskProfanity(cleanText(input.body ?? ''));
  if (title.length < 3 || title.length > ARTICLE_TITLE_MAX) fail('invalid_title');
  if (body.length < ARTICLE_BODY_MIN || body.length > ARTICLE_BODY_MAX) fail('invalid_body');
  const tone = (input.tone ?? 'neutral') as ArticleTone;
  if (!ARTICLE_TONES.includes(tone)) fail('invalid_tone');
  let bandId: number | null = null;
  if (input.bandId) {
    const b = await one(c, 'SELECT id FROM bands WHERE id = $1', [input.bandId]);
    if (!b) fail('not_found', 404);
    bandId = Number(b.id);
    // Kendi grubu hakkında haber basın desteğini etkilemez (çıkar çatışması); yazılabilir ama etkisiz
    const own = await membership(c, ch.id);
    if (own?.band_id !== bandId) {
      const recent = await one(c, `SELECT 1 FROM articles WHERE author_id = $1 AND band_id = $2 AND kind = 'news' AND created_at > $3`, [
        ch.id,
        bandId,
        new Date(Date.now() - hoursMs(ARTICLE_COOLDOWN_HOURS)),
      ]);
      if (recent) fail('article_cooldown', 409);
    }
  }
  if (containsProfanity(title)) fail('inappropriate');
  return { hours: ARTICLE_HOURS, locationId: loc!.id, params: { title, body, bandId, tone, cityId: loc!.cityId } };
}

/** Haber yayınlanır: grubun o şehirdeki basın desteğini etkiler (haftalık tavanla), gazeteci ikramiye almaz (mesai ücreti yeter) */
export async function resolveArticle(c: pg.PoolClient, ch: CharacterRow, params: Record<string, any>) {
  const cityId = params.cityId as string;
  let impact = 0;
  if (params.bandId) {
    const own = await membership(c, ch.id);
    if (own?.band_id !== params.bandId) {
      const raw = articleImpact(params.tone, lv(ch.skills, 'journalism'), lv(ch.skills, 'lyrics'), ch.career_rank ?? 0);
      // Bir hafta içinde bu gruba bu şehirde haberlerle gelen toplam etki tavanı
      const used = Number(
        (
          await one(c, `SELECT COALESCE(sum(abs(impact)), 0) AS n FROM articles WHERE band_id = $1 AND city_id = $2 AND kind = 'news' AND created_at > $3`, [
            params.bandId,
            cityId,
            new Date(Date.now() - hoursMs(7 * 24)),
          ])
        )?.n ?? 0,
      );
      const room = Math.max(0, ARTICLE_WEEKLY_CAP - used);
      impact = Math.sign(raw) * Math.min(Math.abs(raw), room);
      await addPress(c, params.bandId, cityId, impact);
    }
  }
  const a = await one(
    c,
    `INSERT INTO articles(author_id, city_id, band_id, kind, tone, title, body, impact) VALUES ($1, $2, $3, 'news', $4, $5, $6, $7) RETURNING id`,
    [ch.id, cityId, params.bandId ?? null, params.tone, params.title, params.body, impact],
  );
  if (params.bandId && impact !== 0) {
    for (const m of await many(c, 'SELECT character_id FROM band_members WHERE band_id = $1', [params.bandId])) {
      await notify(c, Number(m.character_id), 'press_article', { articleId: Number(a.id), title: params.title, tone: params.tone, cityId, by: ch.name });
    }
  }
  for (const [id, amount] of [['journalism', 0.6], ['lyrics', 0.15]] as const) {
    if (typeof ch.skills[id] === 'number') ch.skills[id] = Math.min(100, ch.skills[id] + amount * (1 - ch.skills[id] / 110));
  }
  return { articleId: Number(a.id), impact: Math.round(impact * 10) / 10, title: params.title };
}

/** Moderasyon: yazı kaldırılır; basın etkisi geri alınır (karalama kalıcı olmasın) */
export async function removeArticle(id: number) {
  await tx(async (c) => {
    const a = await one(c, 'SELECT * FROM articles WHERE id = $1 AND NOT removed FOR UPDATE', [id]);
    if (!a) return;
    await c.query('UPDATE articles SET removed = TRUE WHERE id = $1', [id]);
    if (a.band_id && Number(a.impact)) await addPress(c, Number(a.band_id), a.city_id, -Number(a.impact));
  });
}

// ---------- Okuma ----------

export async function cityNews(cityId: string, viewer: number, opts: { kind?: 'news' | 'blog' | 'board'; before?: number } = {}) {
  if (!CITY_BY_ID[cityId]) fail('not_found', 404);
  const rows = await many(
    pool,
    `SELECT a.*, c.name AS author_name, c.avatar_color, c.avatar_version, b.name AS band_name
       FROM articles a LEFT JOIN characters c ON c.id = a.author_id LEFT JOIN bands b ON b.id = a.band_id
      WHERE a.city_id = $1 AND NOT a.removed AND a.kind = $2 AND ($3::bigint IS NULL OR a.id < $3)
        AND (a.kind <> 'board' OR a.created_at > $5)
        AND (a.author_id IS NULL OR NOT EXISTS (SELECT 1 FROM blocks x WHERE (x.blocker_id = $4 AND x.blocked_id = a.author_id) OR (x.blocker_id = a.author_id AND x.blocked_id = $4)))
      ORDER BY a.id DESC LIMIT 30`,
    [cityId, opts.kind ?? 'news', opts.before ?? null, viewer, new Date(Date.now() - gameHoursToMs(7 * 24, config.gameSpeed))],
  );
  return rows.map(toArticleDto);
}

export const toArticleDto = (r: any) => ({
  id: Number(r.id),
  kind: r.kind,
  cityId: r.city_id,
  title: r.title,
  body: r.body,
  titleEn: r.title_en ?? null,
  bodyEn: r.body_en ?? null,
  tone: r.tone,
  npc: !!r.npc,
  author: r.author_id ? { characterId: Number(r.author_id), name: r.author_name } : null,
  band: r.band_id ? { id: Number(r.band_id), name: r.band_name } : null,
  createdAt: r.created_at.toISOString(),
  mine: false,
});
