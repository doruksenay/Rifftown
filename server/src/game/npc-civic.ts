// Soğuk başlangıç: oyunun sosyal ve ekonomik NPC'leri (kurallar: packages/shared/src/npc-civic.ts).
// - Yargıç: VIP yargıç bakmazsa davaya erken karar verir (normal ceza; ikramiye almaz).
// - Aday: seçimde oyuncu adayı yoksa ya da tek adayken rakip olur; boş makamı doldurur (maaş almaz).
//   Oyuncu aday her zaman tercih edilir: eşit oyda oyuncu kazanır, oy almamış NPC oy almış oyuncuyu geçemez.
// - Muhabir: şehirdeki iyi konserlerden haber yazar (basın desteği etkisi küçük ve haftalık tavana tabi).
// - Tüccar: atölye ürünlerini düşük fiyatla alır (dükkâna satılamadıkları için talep yaratır), bit pazarına
//   dükkân fiyatının altına inmeyen ikinci el ilanlar koyar.
// Para basma yolu yok: NPC'ye satış nominal fiyatın en fazla %40'ı ve günde 2 adet; NPC ilanı dükkân fiyatının %85'i ve
// dükkâna geri satış %50 olduğu için al-sat zarar eder; NPC makam ve yargıç ödemesi yoktur.

import {
  ARTICLE_WEEKLY_CAP,
  CASE_HOURS,
  CITIES,
  CITY_BY_ID,
  CRIME_BY_ID,
  ITEMS,
  ITEM_BY_ID,
  NPC_BUY_DAILY,
  NPC_BUY_RATE,
  NPC_CIVIC,
  NPC_JUDGE_AT,
  NPC_MAX_LISTINGS,
  NEWS_TEMPLATES,
  LOCATION_BY_ID,
  NPC_NEWS_MIN_QUALITY,
  NPC_NEWS_PER_DAY,
  NPC_PLATFORM,
  NPC_SELL_RATE,
  OFFICES,
  RECIPES,
  NPC_MATERIAL_MARGIN,
  type NpcCivicDef,
  gameHoursToMs,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { lockCharacter, notify, requireEstablished } from './common';
import { convict } from './crime';
import { addPress } from './press';
import { ringPledged } from './items';

const hoursMs = (h: number) => gameHoursToMs(h, config.gameSpeed);

/** NPC kadrosunu kurar (zaten varsa dokunmaz) */
export async function ensureNpcCivic(): Promise<number> {
  return tx(async (c) => {
    await c.query('SELECT pg_advisory_xact_lock(724003)');
    const existing = new Set((await many(c, 'SELECT npc_key FROM characters WHERE npc_key IS NOT NULL')).map((r) => r.npc_key));
    let n = 0;
    for (const d of NPC_CIVIC) {
      if (existing.has(d.key)) continue;
      if (await one(c, 'SELECT 1 FROM characters WHERE lower(name) = lower($1)', [d.name])) continue;
      const skills = d.role === 'judge' ? { law: 80 } : d.role === 'reporter' ? { journalism: 50, lyrics: 40 } : d.role === 'candidate' ? { rhetoric: 30, economics: 30, law: 30 } : {};
      await c.query(
        `INSERT INTO characters(user_id, npc, npc_role, npc_key, name, avatar_color, main_instrument, money, mood, health, city_id, skills, bio, headline, profession)
         VALUES (NULL, TRUE, $1, $2, $3, '#29335C', 'vocals', 0, 80, 100, $4, $5, '', '', $6)`,
        [d.role, d.key, d.name, d.cityId, JSON.stringify(skills), d.role === 'judge' ? 'judge' : d.role === 'reporter' ? 'journalist' : null],
      );
      n++;
    }
    return n;
  });
}

async function npcId(c: pg.PoolClient | typeof pool, role: NpcCivicDef['role'], cityId: string): Promise<number | null> {
  const r = await one(c, `SELECT id FROM characters WHERE npc_key = $1`, [`${cityId}-${role}`]);
  return r ? Number(r.id) : null;
}

// ---------- Yargıç ----------

/** Süresinin yarısını geçmiş, yargıç bakmamış davalara NPC yargıç normal cezayla karar verir */
export async function npcJudge(): Promise<number> {
  let n = 0;
  const skipped: number[] = [];
  for (;;) {
    const done = await tx(async (c) => {
      const kase = await one(
        c,
        `SELECT * FROM cases WHERE status = 'pending' AND due_at - ($1::double precision * interval '1 millisecond') <= now()
            AND NOT (id = ANY($2::bigint[]))
          ORDER BY due_at LIMIT 1 FOR UPDATE SKIP LOCKED`,
        [hoursMs(CASE_HOURS) * (1 - NPC_JUDGE_AT), skipped],
      );
      if (!kase) return false;
      // Yedek yargıç: şehirde oyuncu yargıç varsa ona süresinin sonuna kadar bırakılır
      const playerJudge = await one(
        c,
        `SELECT 1 FROM characters ch JOIN users u ON u.id = ch.user_id WHERE ch.profession = 'judge' AND ch.city_id = $1 AND NOT ch.npc AND u.vip_until > now()`,
        [kase.city_id],
      );
      if (playerJudge) {
        skipped.push(Number(kase.id));
        return true;
      }
      const judge = await npcId(c, 'judge', kase.city_id);
      const crime = await one(c, 'SELECT kind FROM crimes WHERE id = $1', [kase.crime_id]);
      // İkramiye yok: yalnızca karar (convict yargıç kimliğini kaydeder)
      await convict(c, kase, CRIME_BY_ID[crime.kind].sentenceHours, judge);
      return true;
    });
    if (!done) break;
    n++;
  }
  return n - skipped.length;
}

// ---------- Seçim ----------

/** Açık seçimlerde NPC aday: makam boşsa ya da en fazla bir oyuncu adayı varsa rakip olur */
export async function npcCandidates(): Promise<number> {
  const rows = await many(
    pool,
    `SELECT e.id, e.city_id, e.office,
            (SELECT count(*)::int FROM election_candidates cand JOIN characters ch ON ch.id = cand.character_id WHERE cand.election_id = e.id AND NOT ch.npc) AS players,
            EXISTS (SELECT 1 FROM election_candidates cand JOIN characters ch ON ch.id = cand.character_id WHERE cand.election_id = e.id AND ch.npc) AS has_npc
       FROM elections e WHERE e.status = 'open'`,
  );
  let n = 0;
  for (const e of rows) {
    if (e.has_npc || e.players > 1) continue;
    const cand = await npcId(pool, 'candidate', e.city_id);
    if (!cand) continue;
    // Aynı NPC aday aynı şehirde tek makama aday olur; diğer makamlara NPC yargıç ya da muhabir değil, aynı aday girer
    const r = await pool.query(
      `INSERT INTO election_candidates(election_id, character_id, platform) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [e.id, cand, NPC_PLATFORM.tr],
    );
    n += r.rowCount ?? 0;
  }
  return n;
}

// ---------- Muhabir ----------

/** Şehirdeki iyi geçen oyuncu konserlerinden kısa haber; etkisi küçük ve haftalık tavana tabi */
export async function npcNews(): Promise<number> {
  const gigs = await many(
    pool,
    `SELECT g.id, g.band_id, g.city_id, g.location_id, (g.result->>'quality')::int AS quality, (g.result->>'attendance')::int AS attendance, b.name AS band_name,
            (SELECT title FROM songs WHERE id = (g.result->>'bestSongId')::bigint) AS song
       FROM gigs g JOIN bands b ON b.id = g.band_id
      WHERE g.status = 'done' AND b.npc_key IS NULL AND (g.result->>'quality')::int >= $1 AND g.starts_at > $2
        AND NOT EXISTS (SELECT 1 FROM articles a WHERE a.npc AND a.band_id = g.band_id AND a.created_at > g.starts_at)
      ORDER BY g.starts_at DESC LIMIT 30`,
    [NPC_NEWS_MIN_QUALITY, new Date(Date.now() - hoursMs(48))],
  );
  let n = 0;
  const seen = new Set<number>();
  for (const g of gigs) {
    // Aynı grup hakkında bir turda tek haber
    if (seen.has(Number(g.band_id))) continue;
    seen.add(Number(g.band_id));
    const today = await one(pool, `SELECT count(*)::int AS n FROM articles WHERE npc AND city_id = $1 AND created_at > $2`, [g.city_id, new Date(Date.now() - hoursMs(24))]);
    if (today.n >= NPC_NEWS_PER_DAY) continue;
    const reporter = await npcId(pool, 'reporter', g.city_id);
    if (!reporter) continue;
    await tx(async (c) => {
      const used = Number(
        (await one(c, `SELECT COALESCE(sum(abs(impact)), 0) AS n FROM articles WHERE band_id = $1 AND city_id = $2 AND kind = 'news' AND created_at > $3`, [
          g.band_id,
          g.city_id,
          new Date(Date.now() - hoursMs(7 * 24)),
        ]))?.n ?? 0,
      );
      const impact = Math.max(0, Math.min(2, ARTICLE_WEEKLY_CAP - used));
      const city = CITY_BY_ID[g.city_id];
      // Şablon havuzundan (content/texts.ts); şarkı adı yoksa şarkı anmayan şablonlar
      const venue = LOCATION_BY_ID[g.location_id]?.name ?? city.name;
      const pool0 = g.song ? NEWS_TEMPLATES : NEWS_TEMPLATES.filter((x) => !x.title.tr.includes('{song}') && !x.body.tr.includes('{song}'));
      const tpl = pool0[Number(g.id) % pool0.length];
      const fillNews = (text: string, lang: 'tr' | 'en') =>
        text.replace(/\{band\}/g, g.band_name).replace(/\{city\}/g, city.name[lang]).replace(/\{venue\}/g, venue[lang]).replace(/\{n\}/g, String(g.attendance)).replace(/\{song\}/g, g.song ?? '');
      const tr = { t: fillNews(tpl.title.tr, 'tr'), b: fillNews(tpl.body.tr, 'tr') };
      const en = { t: fillNews(tpl.title.en, 'en'), b: fillNews(tpl.body.en, 'en') };
      await c.query(
        `INSERT INTO articles(author_id, city_id, band_id, kind, tone, title, body, title_en, body_en, impact, npc) VALUES ($1, $2, $3, 'news', 'positive', $4, $5, $6, $7, $8, TRUE)`,
        [reporter, g.city_id, g.band_id, tr.t, tr.b, en.t, en.b, impact],
      );
      if (impact) await addPress(c, g.band_id, g.city_id, impact);
    });
    n++;
  }
  return n;
}

// ---------- Tüccar ----------

/** Bir atölye ürününün en ucuz tarifindeki malzeme maliyeti */
const materialCost = (itemId: string) => {
  const costs = RECIPES.filter((r) => r.itemId === itemId).map((r) => Object.entries(r.materials).reduce((s, [m, q]) => s + (ITEM_BY_ID[m]?.price ?? 0) * q, 0));
  return costs.length ? Math.min(...costs) : 0;
};

/**
 * NPC'nin bir eşyaya vereceği fiyat (yalnızca atölyede üretilmiş eşyalar): bonusa göre nominal fiyatın en fazla %40'ı,
 * ama hiçbir zaman malzeme maliyetinin 1,25 katından fazla değil. Usta zanaatkâr için küçük ve günlük sınırlı bir gelir;
 * acemi için zarar. Para basma yolu değil, mesai ücretiyle kıyaslanabilir bir iş.
 */
export const npcOffer = (itemId: string, bonus: number | null) => {
  const def = ITEM_BY_ID[itemId];
  if (!def?.crafted) return 0;
  const byBonus = def.price * NPC_BUY_RATE * Math.min(1, Math.max(0, bonus ?? 0) / 14);
  return Math.max(1, Math.round(Math.min(byBonus, materialCost(itemId) * NPC_MATERIAL_MARGIN)));
};

/** Oyuncu atölye ürününü bit pazarındaki NPC tüccara satar */
export async function sellToNpc(characterId: number, locationId: string, inventoryId: number) {
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    const loc = CITIES.flatMap((x) => x.locations).find((l) => l.id === locationId);
    if (!loc || loc.type !== 'flea_market') fail('invalid_location');
    if (loc!.cityId !== ch.city_id) fail('not_in_city');
    await requireEstablished(c, characterId);
    const inv = await one(c, 'SELECT * FROM inventory WHERE id = $1 AND character_id = $2 FOR UPDATE', [inventoryId, characterId]);
    if (!inv) fail('not_found', 404);
    if (inv.listed) fail('item_listed', 409);
    if (await ringPledged(c, inv.id)) fail('ring_pledged', 409);
    if (inv.legendary_at) fail('npc_wont_buy', 409); // efsanevi eşyalar oyuncular arasında el değiştirsin
    const price = npcOffer(inv.item_id, inv.bonus);
    if (!price) fail('npc_wont_buy', 409);
    const today = await one(c, 'SELECT count(*)::int AS n FROM npc_sales WHERE character_id = $1 AND created_at > $2', [characterId, new Date(Date.now() - hoursMs(24))]);
    if (today.n >= NPC_BUY_DAILY) fail('npc_daily_limit', 429);
    await c.query('DELETE FROM inventory WHERE id = $1', [inv.id]);
    await c.query('UPDATE characters SET money = money + $2, location_id = $3 WHERE id = $1', [characterId, price, locationId]);
    await c.query('INSERT INTO npc_sales(character_id, item_id, price) VALUES ($1, $2, $3)', [characterId, inv.item_id, price]);
    return { price };
  });
}

/** NPC tüccar bit pazarına ilan koyar: dükkân eşyaları, dükkân fiyatının %85'i (VIP eşyaları hariç). Satış parası oyundan çıkar. */
export async function npcStockMarkets(rand: () => number = Math.random): Promise<number> {
  const pool_ = ITEMS.filter((i) => !i.crafted && !i.vip && !i.stackable && i.price >= 100 && i.slot !== 'ring');
  let n = 0;
  for (const city of CITIES) {
    const trader = await npcId(pool, 'trader', city.id);
    if (!trader) continue;
    const active = await one(pool, `SELECT count(*)::int AS n FROM listings WHERE seller_id = $1 AND status = 'active'`, [trader]);
    if (active.n >= NPC_MAX_LISTINGS) continue;
    const def = pool_[Math.floor(rand() * pool_.length)];
    await tx(async (c) => {
      const inv = await one(c, 'INSERT INTO inventory(character_id, item_id, slot) VALUES ($1, $2, $3) RETURNING id', [trader, def.id, def.slot]);
      await c.query('UPDATE inventory SET listed = TRUE WHERE id = $1', [inv.id]);
      await c.query('INSERT INTO listings(seller_id, inventory_id, item_id, price) VALUES ($1, $2, $3, $4)', [trader, inv.id, def.id, Math.ceil(def.price * NPC_SELL_RATE)]);
    });
    n++;
  }
  // NPC tüccarın parası birikmez (satış parası oyundan çıkar)
  await pool.query(`UPDATE characters SET money = 0 WHERE npc_role = 'trader' AND money > 0`);
  return n;
}

let lastRun = 0;
/** Zamanlayıcı: en fazla oyun saatinde bir (gerçek zamanda en az 5 sn) */
export async function npcCivicDirector(rand: () => number = Math.random, force = false): Promise<number> {
  const now = Date.now();
  if (!force && now - lastRun < Math.max(5000, Math.min(hoursMs(1), 60_000))) return 0;
  lastRun = now;
  await ensureNpcCivic();
  let n = 0;
  n += await npcJudge();
  n += await npcCandidates();
  n += await npcNews();
  n += await npcStockMarkets(rand);
  // NPC'lerin bildirimleri kimseye gitmez
  await pool.query(`DELETE FROM notifications WHERE character_id IN (SELECT id FROM characters WHERE npc_role IS NOT NULL)`);
  return n;
}

export const runNpcCivicNow = (rand: () => number = Math.random) => npcCivicDirector(rand, true);
void OFFICES;
void notify;
