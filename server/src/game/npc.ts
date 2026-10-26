// Oyunun kendi grupları: kuruluş ve zamanlayıcıdaki "yönetmen".
// Yapay gruplar oyuncu gruplarıyla aynı kurallarla yaşar: konserleri resolveGig ile sonuçlanır,
// yayınları haftalık satış ve listelere girer. Yönetmen sadece onların yerine karar verir
// (konser ayarlamak, şarkı yazmak, kaydetmek, yayın çıkarmak) ve şöhretlerini kendi bantlarında tutar.

import {
  CITIES,
  CITY_BY_ID,
  INSTRUMENTS,
  type Instrument,
  MAX_SETLIST,
  NPC_BANDS,
  NPC_BAND_BY_KEY,
  NPC_RELEASE_PACE,
  NPC_TIERS,
  type NpcBandDef,
  RELEASE_RULES,
  ROLE_SKILLS,
  VENUE_RULES,
  type VenueType,
  gameHoursToMs,
  genreSkillId,
  recordingQuality,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { many, one, pool, tx } from '../db';

const hoursMs = (h: number) => gameHoursToMs(h, config.gameSpeed);
const NPC_COLORS = ['#29335C', '#8E5572', '#1B998B', '#C5283D', '#2E294E', '#669BBC'];

function npcSkills(def: NpcBandDef) {
  const t = NPC_TIERS[def.tier];
  const s: Record<string, number> = {
    [ROLE_SKILLS[def.role].basic]: t.skill,
    [ROLE_SKILLS[def.role].specific]: t.skill,
    showmanship: t.skill * 0.9,
    pro_showmanship: t.skill * 0.8,
    dancing: t.skill * 0.7,
    audience: t.skill * 0.8,
    composing: t.skill,
    lyrics: t.skill,
    improvisation: t.skill * 0.6,
    production: t.production,
    media: t.skill * 0.5,
    [genreSkillId(def.genre)]: Math.min(100, t.skill + 10),
  };
  return s;
}

const between = ([a, b]: [number, number], rand: () => number) => Math.round(a + rand() * (b - a));

/** Eksik yapay grupları kurar (zaten varsa dokunmaz). */
export async function ensureNpcWorld(rand: () => number = Math.random): Promise<number> {
  return tx(async (c) => {
    // Birden fazla zamanlayıcı aynı anda kurmaya çalışmasın
    await c.query('SELECT pg_advisory_xact_lock(724001)');
    const existing = new Set((await many(c, 'SELECT npc_key FROM bands WHERE npc_key IS NOT NULL')).map((r) => r.npc_key));
    let created = 0;
    for (const [i, def] of NPC_BANDS.entries()) {
      if (existing.has(def.key)) continue;
      // Ad bir oyuncu tarafından alınmışsa bu grubu atla
      const taken = await one(
        c,
        `SELECT (SELECT 1 FROM characters WHERE lower(name) = lower($1)) AS ch, (SELECT 1 FROM bands WHERE lower(name) = lower($2)) AS b`,
        [def.leader, def.name],
      );
      if (taken?.ch || taken?.b) continue;
      const t = NPC_TIERS[def.tier];
      const ch = await one(
        c,
        `INSERT INTO characters(user_id, npc, name, avatar_color, main_instrument, money, mood, health, city_id, skills, bio, headline)
         VALUES (NULL, TRUE, $1, $2, $3, 0, 80, 100, $4, $5, '', $6) RETURNING id`,
        [def.leader, NPC_COLORS[i % NPC_COLORS.length], def.role, def.cityId, JSON.stringify(npcSkills(def)), `${def.name}`],
      );
      const band = await one(c, `INSERT INTO bands(name, genre, leader_id, npc_key) VALUES ($1, $2, $3, $4) RETURNING id`, [
        def.name,
        def.genre,
        ch.id,
        def.key,
      ]);
      await c.query('INSERT INTO band_members(band_id, character_id, role) VALUES ($1, $2, $3)', [band.id, ch.id, def.role]);
      for (const title of def.songs.slice(0, 6)) await writeSong(c, band.id, ch.id, def, title, rand);
      const city = CITY_BY_ID[def.cityId];
      await c.query('INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, $2, $3)', [band.id, def.cityId, t.fame]);
      for (const other of CITIES) {
        if (other.id !== city.id && other.countryCode === city.countryCode) {
          await c.query('INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, $2, $3)', [band.id, other.id, Math.round(t.fame * 0.4)]);
        }
      }
      created++;
    }
    return created;
  });
}

async function writeSong(c: pg.PoolClient, bandId: number, leaderId: number, def: NpcBandDef, title: string, rand: () => number) {
  const t = NPC_TIERS[def.tier];
  const song = await one(c, 'INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, $2, $3, $4) RETURNING id', [
    leaderId,
    title,
    def.genre,
    between(t.songQuality, rand),
  ]);
  await c.query('INSERT INTO band_songs(band_id, song_id) VALUES ($1, $2)', [bandId, song.id]);
  await c.query('INSERT INTO familiarity(character_id, song_id, value) VALUES ($1, $2, $3)', [leaderId, song.id, t.familiarity]);
  return song.id as number;
}

let lastRun = 0;

/**
 * Zamanlayıcı her turda çağırır; en fazla oyun saatinde bir (ve gerçek zamanda en az 5 saniyede bir) çalışır.
 * Kararlar veritabanındaki zamanlara göre verildiği için sık ya da seyrek çalışması sonucu değiştirmez.
 */
export async function npcDirector(rand: () => number = Math.random, force = false): Promise<number> {
  const now = Date.now();
  if (!force && now - lastRun < Math.max(5000, Math.min(hoursMs(1), 60_000))) return 0;
  lastRun = now;
  await ensureNpcWorld(rand);
  return tx(async (c) => {
    const got = await one(c, 'SELECT pg_try_advisory_xact_lock(724002) AS ok');
    if (!got.ok) return 0;
    // Yapay karakterlerin bildirimleri kimseye gitmez
    await c.query('DELETE FROM notifications WHERE character_id IN (SELECT id FROM characters WHERE npc)');
    const bands = await many(
      c,
      `SELECT b.id, b.npc_key, b.genre, m.character_id AS leader_id
         FROM bands b JOIN band_members m ON m.band_id = b.id AND m.character_id = b.leader_id
        WHERE b.npc_key IS NOT NULL`,
    );
    let acts = 0;
    for (const b of bands) {
      const def = NPC_BAND_BY_KEY[b.npc_key];
      if (!def) continue;
      // Bir grupta çıkan hata diğerlerini geri almasın
      await c.query('SAVEPOINT npc_band');
      try {
        acts += await runBand(c, b, def, rand);
        await c.query('RELEASE SAVEPOINT npc_band');
      } catch (e) {
        await c.query('ROLLBACK TO SAVEPOINT npc_band');
        console.error(`oyunun grubu ${def.key} işlenemedi`, e);
      }
    }
    return acts;
  });
}

async function runBand(c: pg.PoolClient, b: any, def: NpcBandDef, rand: () => number): Promise<number> {
  const t = NPC_TIERS[def.tier];
  let acts = 0;
  // Yorgunluk tutmazlar, şehirden ayrılmazlar; becerileri konserlerle yükselmez (seviyeleri sabittir)
  await c.query(
    'UPDATE characters SET mood = 80, health = 100, city_id = $2, location_id = NULL, jailed_until = NULL, skills = $3 WHERE id = $1',
    [b.leader_id, def.cityId, JSON.stringify(npcSkills(def))],
  );

  // Şöhreti kendi bandında tut
  await c.query(
    `UPDATE band_fame SET fame = LEAST($3::real, GREATEST($2::real, fame)) WHERE band_id = $1 AND city_id = $4`,
    [b.id, t.fameRange[0], t.fameRange[1], def.cityId],
  );
  await c.query(`UPDATE band_fame SET fame = LEAST($2::real, fame) WHERE band_id = $1 AND city_id <> $3`, [b.id, t.fameRange[1] * 0.6, def.cityId]);

  // Yeni şarkı
  const newest = await one(c, 'SELECT max(s.created_at) AS at, count(*)::int AS n FROM songs s WHERE s.author_id = $1', [b.leader_id]);
  if (!newest?.at || newest.at.getTime() + hoursMs(t.songEveryDays * 24) < Date.now()) {
    const title = def.songs[newest?.n ?? 0] ?? `${def.songs[(newest?.n ?? 0) % def.songs.length]} ${Math.floor((newest?.n ?? 0) / def.songs.length) + 1}`;
    await writeSong(c, b.id, b.leader_id, def, title, rand);
    acts++;
  }

  // Konser
  const upcoming = await one(c, `SELECT 1 FROM gigs WHERE band_id = $1 AND status = 'scheduled'`, [b.id]);
  if (!upcoming) {
    const last = await one(c, `SELECT max(starts_at) AS at FROM gigs WHERE band_id = $1`, [b.id]);
    if (!last?.at || last.at.getTime() + hoursMs(t.gigEveryHours) < Date.now()) {
      await bookNpcGig(c, b, def, rand);
      acts++;
    }
  }

  // Yayınlar
  for (const kind of ['single', 'album'] as const) {
    const rules = RELEASE_RULES[kind];
    const last = await one(c, 'SELECT max(released_at) AS at FROM releases WHERE band_id = $1 AND kind = $2', [b.id, kind]);
    const pace = rules.cooldownDays * NPC_RELEASE_PACE * 24;
    // İlk yayın kuruluştan kısa süre sonra; sonra düzenli aralıklarla
    const firstDelay = kind === 'single' ? 12 : rules.cooldownDays * 24;
    const created = await one(c, 'SELECT created_at FROM bands WHERE id = $1', [b.id]);
    const due = last?.at ? last.at.getTime() + hoursMs(pace) : created.created_at.getTime() + hoursMs(firstDelay);
    if (due > Date.now()) continue;
    if (await releaseNpc(c, b, def, kind, rand)) acts++;
  }
  return acts;
}

async function bookNpcGig(c: pg.PoolClient, b: any, def: NpcBandDef, rand: () => number) {
  const fameRow = await one(c, 'SELECT fame FROM band_fame WHERE band_id = $1 AND city_id = $2', [b.id, def.cityId]);
  const fame = fameRow?.fame ?? 0;
  const city = CITY_BY_ID[def.cityId];
  const venues = city.locations.filter((l) => l.type in VENUE_RULES && l.type !== 'festival' && fame >= VENUE_RULES[l.type as VenueType].minFame);
  // Çoğunlukla girebildikleri en büyük mekânda, bazen daha küçüğünde çalarlar
  venues.sort((x, y) => VENUE_RULES[y.type as VenueType].capacity - VENUE_RULES[x.type as VenueType].capacity);
  const venue = rand() < 0.7 ? venues[0] : venues[Math.floor(rand() * venues.length)];
  if (!venue) return;
  const songs = await many(
    c,
    'SELECT s.id FROM band_songs bs JOIN songs s ON s.id = bs.song_id WHERE bs.band_id = $1 ORDER BY s.quality DESC LIMIT $2',
    [b.id, Math.min(MAX_SETLIST, 8)],
  );
  if (!songs.length) return;
  // Oyuncuların ve diğer grupların konserleriyle çakışmasın: sahne doluysa başka bir saat dener
  await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`venue:${venue.id}`]);
  let startsAt: Date | null = null;
  const first = 6 + Math.floor(rand() * 18);
  for (let i = 0; i < 8 && !startsAt; i++) {
    const at = new Date(Date.now() + hoursMs(first + i * 7));
    const busy = await one(
      c,
      `SELECT 1 FROM gigs WHERE location_id = $1 AND status = 'scheduled' AND starts_at BETWEEN $2 AND $3`,
      [venue.id, new Date(at.getTime() - hoursMs(3)), new Date(at.getTime() + hoursMs(3))],
    );
    if (!busy) startsAt = at;
  }
  if (!startsAt) return;
  const session = INSTRUMENTS.filter((r) => r !== def.role) as Instrument[];
  await c.query(
    `INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist, session_roles) VALUES ($1, $2, $3, $4, $5, $6)`,
    [b.id, def.cityId, venue.id, startsAt, songs.map((s) => s.id), session],
  );
}

async function releaseNpc(c: pg.PoolClient, b: any, def: NpcBandDef, kind: 'single' | 'album', rand: () => number) {
  const t = NPC_TIERS[def.tier];
  const rules = RELEASE_RULES[kind];
  // Daha önce yayınlanmamış şarkılar, en iyiler önce
  const songs = await many(
    c,
    `SELECT s.id, s.quality FROM band_songs bs JOIN songs s ON s.id = bs.song_id
      WHERE bs.band_id = $1
        AND NOT EXISTS (SELECT 1 FROM releases r WHERE r.band_id = $1 AND r.kind = $2 AND s.id = ANY(r.song_ids))
      ORDER BY s.quality DESC LIMIT $3`,
    [b.id, kind, kind === 'single' ? 1 : 8],
  );
  if (songs.length < rules.minSongs) return false;
  const qualities: number[] = [];
  for (const s of songs) {
    const q = recordingQuality(s.quality, t.familiarity, t.skill, t.production, rand);
    await c.query(
      `INSERT INTO recordings(band_id, song_id, quality, recorded_by) VALUES ($1, $2, $3, $4)
       ON CONFLICT (band_id, song_id) DO UPDATE SET quality = GREATEST(recordings.quality, EXCLUDED.quality)`,
      [b.id, s.id, q, b.leader_id],
    );
    const rec = await one(c, 'SELECT quality FROM recordings WHERE band_id = $1 AND song_id = $2', [b.id, s.id]);
    qualities.push(rec.quality);
  }
  const titleRow = await one(c, 'SELECT title FROM songs WHERE id = $1', [songs[0].id]);
  const albumNo = (await one(c, `SELECT count(*)::int AS n FROM releases WHERE band_id = $1 AND kind = 'album'`, [b.id])).n + 1;
  const title = kind === 'single' ? titleRow.title : albumNo === 1 ? def.name : `${def.name} ${['II', 'III', 'IV', 'V', 'VI', 'VII'][albumNo - 2] ?? albumNo}`;
  await c.query('INSERT INTO releases(band_id, kind, title, song_ids, quality) VALUES ($1, $2, $3, $4, $5)', [
    b.id,
    kind,
    title,
    songs.map((s) => s.id),
    Math.round(qualities.reduce((a, x) => a + x, 0) / qualities.length),
  ]);
  return true;
}

/** Testler ve yönetim için: zamanlayıcı kısıtı olmadan bir tur */
export const runNpcDirectorNow = (rand: () => number = Math.random) => npcDirector(rand, true);
