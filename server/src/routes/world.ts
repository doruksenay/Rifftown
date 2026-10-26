import { CITY_BY_ID, LOCATION_BY_ID, isVenue } from '@rifftown/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireUser } from '../auth';
import { config } from '../config';
import { many, one, pool } from '../db';
import { fail } from '../errors';
import { achievementPoints } from '../game/achievements';
import { avatarUrl, gateGig, isJailed, isVipUntil, officesOf, toGigDto } from '../game/common';
import { bandReleases } from '../game/music';
import { cityBusinesses } from '../game/business';
import { idParam, parse } from './util';

export async function publicRoutes(app: FastifyInstance) {
  app.get('/config', async () => ({
    contactEmail: config.contactEmail,
    gameSpeed: config.gameSpeed,
    serverTime: new Date().toISOString(),
    version: config.version,
  }));
}

export async function worldRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireUser);

  app.get('/cities/:cityId', async (req) => {
    const { cityId } = parse(z.object({ cityId: z.string() }), req.params);
    if (!CITY_BY_ID[cityId]) fail('not_found', 404);
    const players = await one(pool, 'SELECT count(*)::int AS n FROM characters WHERE city_id = $1 AND NOT npc', [cityId]);
    const gigs = await many(
      pool,
      `SELECT g.*, b.name AS band_name FROM gigs g JOIN bands b ON b.id = g.band_id
        WHERE g.city_id = $1 AND g.status = 'scheduled' ORDER BY g.starts_at LIMIT 20`,
      [cityId],
    );
    const top = await many(
      pool,
      `SELECT b.id, b.name, b.genre, f.fame FROM band_fame f JOIN bands b ON b.id = f.band_id
        WHERE f.city_id = $1 AND f.fame > 0 ORDER BY f.fame DESC LIMIT 10`,
      [cityId],
    );
    return {
      cityId,
      playersHere: players!.n,
      upcomingGigs: gigs.map(toGigDto),
      topBands: top.map((b) => ({ id: b.id, name: b.name, genre: b.genre, fame: Math.round(b.fame * 10) / 10 })),
      businesses: await cityBusinesses(pool, cityId),
    };
  });

  // Bir sahnenin yaklaşan ve son konserleri (şehir listesi en yakın 20 konserle sınırlı olduğundan ayrı)
  app.get('/venues/:locationId/gigs', async (req) => {
    const { locationId } = parse(z.object({ locationId: z.string() }), req.params);
    const loc = LOCATION_BY_ID[locationId];
    if (!loc || !isVenue(loc.type)) fail('not_found', 404);
    const upcoming = await many(
      pool,
      `SELECT g.*, b.name AS band_name FROM gigs g JOIN bands b ON b.id = g.band_id
        WHERE g.location_id = $1 AND g.status = 'scheduled' ORDER BY g.starts_at LIMIT 30`,
      [locationId],
    );
    const recent = await many(
      pool,
      `SELECT g.*, b.name AS band_name FROM gigs g JOIN bands b ON b.id = g.band_id
        WHERE g.location_id = $1 AND g.status = 'done' ORDER BY g.starts_at DESC LIMIT 10`,
      [locationId],
    );
    const isVip = req.user!.isVip;
    return {
      upcoming: upcoming.map(toGigDto),
      recent: recent.map((g) => gateGig(toGigDto(g), isVip, config.gameSpeed)),
    };
  });

  app.get('/cities/:cityId/people', async (req) => {
    const { cityId } = parse(z.object({ cityId: z.string() }), req.params);
    // Şehirdeki oyuncular: en son hareket edenler önce; engellediğin ya da seni engelleyenler görünmez
    const me = req.user!.characterId ?? 0;
    const rows = await many(
      pool,
      `SELECT c.id, c.name, c.avatar_color, c.avatar_version, c.main_instrument, b.name AS band_name
         FROM characters c
         LEFT JOIN band_members m ON m.character_id = c.id
         LEFT JOIN bands b ON b.id = m.band_id
        WHERE c.city_id = $1 AND NOT c.npc AND c.id <> $2
          AND NOT EXISTS (SELECT 1 FROM blocks x WHERE (x.blocker_id = $2 AND x.blocked_id = c.id) OR (x.blocker_id = c.id AND x.blocked_id = $2))
        ORDER BY (SELECT max(a.started_at) FROM actions a WHERE a.character_id = c.id) DESC NULLS LAST, c.name
        LIMIT 100`,
      [cityId, me],
    );
    return {
      people: rows.map((r) => ({
        id: r.id,
        name: r.name,
        avatarColor: r.avatar_color,
        avatarUrl: avatarUrl(r.id, r.avatar_version),
        mainInstrument: r.main_instrument,
        bandName: r.band_name ?? null,
      })),
    };
  });

  app.get('/leaderboard', async (req) => {
    const q = parse(z.object({ cityId: z.string().optional() }), req.query);
    const rows = q.cityId
      ? await many(
          pool,
          `SELECT b.id, b.name, b.genre, f.fame, (b.npc_key IS NOT NULL) AS npc,
                  (SELECT count(*)::int FROM band_members m WHERE m.band_id = b.id) AS members
             FROM band_fame f JOIN bands b ON b.id = f.band_id
            WHERE f.city_id = $1 AND f.fame > 0 ORDER BY f.fame DESC LIMIT 50`,
          [q.cityId],
        )
      : await many(
          pool,
          // Dünya sıralaması: en ünlü olunan şehirdeki şöhret (0–100), eşitlikte toplam şöhret
          // (şehirler toplanınca 100'ü aşıp ölçek anlamsızlaşıyordu)
          `SELECT b.id, b.name, b.genre, COALESCE(MAX(f.fame), 0) AS fame, COALESCE(SUM(f.fame), 0) AS total, (b.npc_key IS NOT NULL) AS npc,
                  (SELECT count(*)::int FROM band_members m WHERE m.band_id = b.id) AS members
             FROM bands b LEFT JOIN band_fame f ON f.band_id = b.id
            GROUP BY b.id HAVING COALESCE(SUM(f.fame), 0) > 0
            ORDER BY fame DESC, total DESC LIMIT 50`,
        );
    return {
      cityId: q.cityId ?? null,
      bands: rows.map((r) => ({ id: r.id, name: r.name, genre: r.genre, fame: Math.round(Number(r.fame) * 10) / 10, members: r.members, npc: r.npc })),
    };
  });

  app.get('/characters', async (req) => {
    const q = parse(z.object({ search: z.string().min(1).max(30) }), req.query);
    const me = req.user!.characterId ?? 0;
    // Oyunun kendi müzisyenleri ve engelleşilen oyuncular aramada çıkmaz
    const rows = await many(
      pool,
      `SELECT c.id, c.name, c.avatar_color, c.avatar_version, c.main_instrument, c.city_id FROM characters c
        WHERE lower(c.name) LIKE lower($1) || '%' AND NOT c.npc
          AND NOT EXISTS (SELECT 1 FROM blocks x WHERE (x.blocker_id = $2 AND x.blocked_id = c.id) OR (x.blocker_id = c.id AND x.blocked_id = $2))
        ORDER BY c.name LIMIT 20`,
      [q.search.replace(/[%_\\]/g, ''), me],
    );
    return {
      characters: rows.map((r) => ({
        id: r.id,
        name: r.name,
        avatarColor: r.avatar_color,
        avatarUrl: avatarUrl(r.id, r.avatar_version),
        mainInstrument: r.main_instrument,
        cityId: r.city_id,
      })),
    };
  });

  app.get('/characters/:id', async (req) => {
    const { id } = parse(idParam, req.params);
    const ch = await one(pool, 'SELECT c.*, u.vip_until FROM characters c LEFT JOIN users u ON u.id = c.user_id WHERE c.id = $1', [id]);
    if (!ch) fail('not_found', 404);
    const band = await one(
      pool,
      'SELECT b.id, b.name, m.role FROM band_members m JOIN bands b ON b.id = m.band_id WHERE m.character_id = $1',
      [id],
    );
    const topSkills = Object.entries(ch.skills as Record<string, number>)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill, level]) => ({ skill, level: Math.round(level) }));
    return {
      character: {
        id: ch.id,
        name: ch.name,
        avatarColor: ch.avatar_color,
        mainInstrument: ch.main_instrument,
        cityId: ch.city_id,
        bio: ch.bio,
        createdAt: ch.created_at.toISOString(),
        band: band ? { id: band.id, name: band.name, role: band.role } : null,
        topSkills,
        isVip: isVipUntil(ch.vip_until),
        profession: ch.profession ? { id: ch.profession, rank: ch.career_rank } : null,
        offices: await officesOf(pool, ch.id),
        achievementPoints: await achievementPoints(pool, ch.id),
        achievements: (
          await many(pool, 'SELECT achievement_id, unlocked_at FROM character_achievements WHERE character_id = $1 ORDER BY unlocked_at', [ch.id])
        ).map((r) => ({ id: r.achievement_id, unlockedAt: r.unlocked_at.toISOString() })),
        jailed: isJailed(ch),
        headline: ch.headline ?? '',
        avatarUrl: avatarUrl(ch.id, ch.avatar_version),
        npc: !!ch.npc,
        home: await (async () => {
          const h = await one(pool, 'SELECT home_id, city_id FROM homes WHERE character_id = $1', [ch.id]);
          return h ? { homeId: h.home_id, cityId: h.city_id } : null;
        })(),
        convictions: ch.convictions ?? 0,
        partner: await (async () => {
          const p = await one(
            pool,
            `SELECT c.id, c.name, r.stage FROM partners p JOIN characters c ON c.id = p.partner_id
               JOIN relationships r ON r.a_id = LEAST(p.character_id, p.partner_id) AND r.b_id = GREATEST(p.character_id, p.partner_id)
              WHERE p.character_id = $1`,
            [ch.id],
          );
          return p ? { characterId: Number(p.id), name: p.name, stage: p.stage } : null;
        })(),
        children: (
          await many(pool, 'SELECT name, born_at FROM children WHERE parent_a = $1 OR parent_b = $1 ORDER BY born_at', [ch.id])
        ).map((k) => ({ name: k.name, bornAt: k.born_at.toISOString() })),
        tattoos: (await many(pool, 'SELECT tattoo_id FROM tattoos WHERE character_id = $1 ORDER BY id', [ch.id])).map((t) => t.tattoo_id),
        friendsCount: (await one(pool, 'SELECT count(*)::int AS n FROM relationships WHERE (a_id = $1 OR b_id = $1) AND friends', [ch.id]))!.n,
      },
    };
  });

  app.get('/bands/:id', async (req) => {
    const { id } = parse(idParam, req.params);
    const band = await one(pool, 'SELECT * FROM bands WHERE id = $1', [id]);
    if (!band) fail('not_found', 404);
    const members = await many(
      pool,
      `SELECT m.character_id, m.role, c.name, c.avatar_color, c.avatar_version FROM band_members m JOIN characters c ON c.id = m.character_id
        WHERE m.band_id = $1 ORDER BY m.joined_at`,
      [id],
    );
    const fame = await many(pool, 'SELECT city_id, fame FROM band_fame WHERE band_id = $1', [id]);
    const gigs = await many(pool, `SELECT * FROM gigs WHERE band_id = $1 AND status = 'done' ORDER BY starts_at DESC LIMIT 10`, [id]);
    return {
      band: {
        id: band.id,
        name: band.name,
        genre: band.genre,
        createdAt: band.created_at.toISOString(),
        members: members.map((m) => ({
          characterId: m.character_id,
          name: m.name,
          avatarColor: m.avatar_color,
          avatarUrl: avatarUrl(m.character_id, m.avatar_version),
          role: m.role,
          isLeader: m.character_id === band.leader_id,
        })),
        npc: !!band.npc_key,
        fame: Object.fromEntries(fame.map((f) => [f.city_id, Math.round(f.fame * 10) / 10])),
        totalFame: Math.round(fame.reduce((s, f) => s + f.fame, 0) * 10) / 10,
        pastGigs: gigs.map((g) => gateGig(toGigDto({ ...g, band_name: band.name }), req.user!.isVip, config.gameSpeed)),
        releases: await bandReleases(pool, band.id),
      },
    };
  });
}
