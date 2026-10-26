import { ENCORE_PLANS, MAX_STAGE_EVENTS, BAND_NAME_RE, CITY_BY_ID, containsProfanity, GENRES, INSTRUMENTS, MAX_BAND_MEMBERS, VIP, roleSkill } from '@rifftown/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { charId, requireUser } from '../auth';
import { type Db, many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { avatarUrl, gateGig, getCharacter, membership, notify, toGigDto } from '../game/common';
import { config } from '../config';
import { bookGig, cancelGig, estimateAttendance } from '../game/gigs';
import { memberLeaveFameLoss } from '../game/consequences';
import { bandPressAll } from '../game/press';
import { addMoodlet } from '../game/wellbeing';
import { bandReleases, createRelease, getChart, nextReleaseAt } from '../game/music';
import { idParam, parse } from './util';

async function songsFor(db: Db, characterId: number, bandId: number | null) {
  // Kendi şarkılarım + grubumun repertuvarı
  const rows = await many(
    db,
    `SELECT s.*, c.name AS author_name,
            (bs.song_id IS NOT NULL) AS in_band,
            COALESCE(f.value, 0) AS fam,
            rec.quality AS rec_quality
       FROM songs s
       JOIN characters c ON c.id = s.author_id
       LEFT JOIN band_songs bs ON bs.song_id = s.id AND bs.band_id = $2
       LEFT JOIN familiarity f ON f.song_id = s.id AND f.character_id = $1
       LEFT JOIN recordings rec ON rec.song_id = s.id AND rec.band_id = $2
      WHERE s.author_id = $1 OR bs.song_id IS NOT NULL
      ORDER BY s.id DESC`,
    [characterId, bandId],
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    genre: r.genre,
    subgenre: r.subgenre ?? null,
    tempo: r.tempo ?? 'mid',
    quality: r.quality,
    authorId: r.author_id,
    authorName: r.author_name,
    createdAt: r.created_at.toISOString(),
    inBand: r.in_band,
    myFamiliarity: Math.round(r.fam),
    recordingQuality: r.rec_quality ?? null,
  }));
}

export async function bandDetail(db: Db, bandId: number, viewerId: number, isVip = false) {
  const band = await one(db, 'SELECT * FROM bands WHERE id = $1', [bandId]);
  if (!band) fail('not_found', 404);
  const members = await many(
    db,
    `SELECT m.character_id, m.role, c.name, c.avatar_color, c.avatar_version, c.city_id, c.skills
       FROM band_members m JOIN characters c ON c.id = m.character_id
      WHERE m.band_id = $1 ORDER BY m.joined_at`,
    [bandId],
  );
  const repertoire = await many(db, 'SELECT song_id FROM band_songs WHERE band_id = $1', [bandId]);
  const songIds = repertoire.map((r) => r.song_id);
  const fams = await many(
    db,
    'SELECT character_id, song_id, value FROM familiarity WHERE song_id = ANY($1::bigint[]) AND character_id = ANY($2::bigint[])',
    [songIds, members.map((m) => m.character_id)],
  );
  const fame = await many(db, 'SELECT city_id, fame FROM band_fame WHERE band_id = $1', [bandId]);
  const gigs = await many(
    db,
    `(SELECT * FROM gigs WHERE band_id = $1 AND status = 'scheduled' ORDER BY starts_at)
     UNION ALL
     (SELECT * FROM gigs WHERE band_id = $1 AND status = 'done' ORDER BY starts_at DESC LIMIT 10)`,
    [bandId],
  );
  const invites = await many(
    db,
    `SELECT i.id, i.character_id, c.name FROM band_invites i JOIN characters c ON c.id = i.character_id
      WHERE i.band_id = $1 AND i.status = 'pending'`,
    [bandId],
  );
  const allSongs = await songsFor(db, viewerId, bandId);
  return {
    id: band.id,
    name: band.name,
    genre: band.genre,
    leaderId: band.leader_id,
    createdAt: band.created_at.toISOString(),
    members: members.map((m) => ({
      characterId: m.character_id,
      name: m.name,
      avatarColor: m.avatar_color,
      avatarUrl: avatarUrl(m.character_id, m.avatar_version),
      role: m.role,
      isLeader: m.character_id === band.leader_id,
      cityId: m.city_id,
      skill: Math.round(roleSkill(m.skills, m.role) * 10) / 10,
      familiarity: Object.fromEntries(
        fams.filter((f) => f.character_id === m.character_id).map((f) => [f.song_id, Math.round(f.value)]),
      ),
    })),
    songs: allSongs.filter((s) => s.inBand),
    fame: Object.fromEntries(fame.map((f) => [f.city_id, Math.round(f.fame * 10) / 10])),
    press: await bandPressAll(db, bandId),
    upcomingGigs: gigs.filter((g) => g.status === 'scheduled').map((g) => toGigDto({ ...g, band_name: band.name })),
    pastGigs: gigs
      .filter((g) => g.status === 'done')
      .map((g) => gateGig(toGigDto({ ...g, band_name: band.name }), isVip, config.gameSpeed)),
    pendingInvites: invites.map((i) => ({ id: i.id, characterId: i.character_id, name: i.name })),
    releases: await bandReleases(db, bandId),
    nextReleaseAt: await nextReleaseAt(db, bandId),
  };
}

async function requireBand(db: Db, characterId: number, leader = false) {
  const m = await membership(db, characterId);
  if (!m) fail('no_band');
  if (leader && m!.leader_id !== characterId) fail('not_leader', 403);
  return m!;
}

export async function bandRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireUser);

  app.get('/songs/mine', async (req) => {
    const id = charId(req);
    const m = await membership(pool, id);
    return { songs: await songsFor(pool, id, m?.band_id ?? null) };
  });

  app.post('/bands', async (req) => {
    const id = charId(req);
    const body = parse(
      z.object({ name: z.string().trim().regex(BAND_NAME_RE).refine((n) => !containsProfanity(n), 'inappropriate'), genre: z.enum(GENRES), role: z.enum(INSTRUMENTS) }),
      req.body,
    );
    return tx(async (c) => {
      await c.query('SELECT 1 FROM characters WHERE id = $1 FOR UPDATE', [id]);
      if (await membership(c, id)) fail('already_in_band', 409);
      if (await one(c, 'SELECT 1 FROM bands WHERE lower(name) = lower($1)', [body.name])) fail('band_name_taken', 409);
      const band = await one(c, 'INSERT INTO bands(name, genre, leader_id) VALUES ($1, $2, $3) RETURNING *', [
        body.name,
        body.genre,
        id,
      ]);
      await c.query('INSERT INTO band_members(band_id, character_id, role) VALUES ($1, $2, $3)', [band.id, id, body.role]);
      // Kendi şarkılarını otomatik repertuvara ekle
      await c.query('INSERT INTO band_songs(band_id, song_id) SELECT $1, id FROM songs WHERE author_id = $2', [band.id, id]);
      return { band: await bandDetail(c, band.id, id, req.user!.isVip) };
    });
  });

  app.get('/bands/mine', async (req) => {
    const id = charId(req);
    const m = await membership(pool, id);
    return { band: m ? await bandDetail(pool, m.band_id, id, req.user!.isVip) : null };
  });

  app.post('/bands/mine/role', async (req) => {
    const id = charId(req);
    const body = parse(z.object({ role: z.enum(INSTRUMENTS) }), req.body);
    await requireBand(pool, id);
    await pool.query('UPDATE band_members SET role = $2 WHERE character_id = $1', [id, body.role]);
    return { ok: true };
  });

  app.post('/bands/mine/invites', async (req) => {
    const id = charId(req);
    const body = parse(z.object({ name: z.string().trim(), role: z.enum(INSTRUMENTS) }), req.body);
    return tx(async (c) => {
      const m = await requireBand(c, id, true);
      const target = await one(c, 'SELECT id FROM characters WHERE lower(name) = lower($1) AND NOT npc AND dead_at IS NULL', [body.name]);
      if (!target) fail('character_not_found', 404);
      if (target.id === id) fail('invalid_target');
      if (await membership(c, target.id)) fail('target_in_band', 409);
      const count = await one(c, 'SELECT count(*)::int AS n FROM band_members WHERE band_id = $1', [m.band_id]);
      if (count!.n >= MAX_BAND_MEMBERS) fail('band_full');
      const existing = await one(c, `SELECT 1 FROM band_invites WHERE band_id = $1 AND character_id = $2 AND status = 'pending'`, [
        m.band_id,
        target.id,
      ]);
      if (existing) fail('already_invited', 409);
      const inv = await one(c, 'INSERT INTO band_invites(band_id, character_id, role) VALUES ($1, $2, $3) RETURNING id', [
        m.band_id,
        target.id,
        body.role,
      ]);
      await notify(c, target.id, 'band_invite', { inviteId: inv.id, bandName: m.name, role: body.role });
      return { ok: true, inviteId: inv.id };
    });
  });

  app.delete('/bands/mine/invites/:id', async (req) => {
    const cid = charId(req);
    const { id } = parse(idParam, req.params);
    const m = await requireBand(pool, cid, true);
    await pool.query(`UPDATE band_invites SET status = 'cancelled' WHERE id = $1 AND band_id = $2 AND status = 'pending'`, [
      id,
      m.band_id,
    ]);
    return { ok: true };
  });

  app.get('/invites', async (req) => {
    const id = charId(req);
    const rows = await many(
      pool,
      `SELECT i.*, b.name AS band_name, b.genre FROM band_invites i JOIN bands b ON b.id = i.band_id
        WHERE i.character_id = $1 AND i.status = 'pending' ORDER BY i.id DESC`,
      [id],
    );
    return {
      invites: rows.map((r) => ({
        id: r.id,
        bandId: r.band_id,
        bandName: r.band_name,
        genre: r.genre,
        role: r.role,
        createdAt: r.created_at.toISOString(),
      })),
    };
  });

  app.post('/invites/:id/:answer', async (req) => {
    const cid = charId(req);
    const p = parse(z.object({ id: z.coerce.number().int(), answer: z.enum(['accept', 'decline']) }), req.params);
    return tx(async (c) => {
      await c.query('SELECT 1 FROM characters WHERE id = $1 FOR UPDATE', [cid]);
      const inv = await one(c, `SELECT * FROM band_invites WHERE id = $1 AND character_id = $2 AND status = 'pending' FOR UPDATE`, [
        p.id,
        cid,
      ]);
      if (!inv) fail('not_found', 404);
      if (p.answer === 'decline') {
        await c.query(`UPDATE band_invites SET status = 'declined' WHERE id = $1`, [inv.id]);
        return { ok: true };
      }
      if (await membership(c, cid)) fail('already_in_band', 409);
      await c.query('SELECT 1 FROM bands WHERE id = $1 FOR UPDATE', [inv.band_id]);
      const count = await one(c, 'SELECT count(*)::int AS n FROM band_members WHERE band_id = $1', [inv.band_id]);
      if (count!.n >= MAX_BAND_MEMBERS) fail('band_full');
      await c.query('INSERT INTO band_members(band_id, character_id, role) VALUES ($1, $2, $3)', [inv.band_id, cid, inv.role]);
      await c.query(`UPDATE band_invites SET status = 'accepted' WHERE id = $1`, [inv.id]);
      // Diğer bekleyen davetleri kapat
      await c.query(`UPDATE band_invites SET status = 'cancelled' WHERE character_id = $1 AND status = 'pending'`, [cid]);
      const me = await getCharacter(c, cid);
      const members = await many(c, 'SELECT character_id FROM band_members WHERE band_id = $1 AND character_id <> $2', [
        inv.band_id,
        cid,
      ]);
      for (const mem of members) await notify(c, mem.character_id, 'member_joined', { name: me.name });
      return { ok: true, bandId: inv.band_id };
    });
  });

  app.post('/bands/mine/leave', async (req) => {
    const id = charId(req);
    return tx(async (c) => {
      const m = await requireBand(c, id);
      await c.query('SELECT 1 FROM bands WHERE id = $1 FOR UPDATE', [m.band_id]);
      const left = await one(c, 'DELETE FROM band_members WHERE character_id = $1 RETURNING joined_at', [id]);
      const rest = await many(c, 'SELECT character_id FROM band_members WHERE band_id = $1 ORDER BY joined_at', [m.band_id]);
      if (rest.length === 0) {
        await c.query('DELETE FROM bands WHERE id = $1', [m.band_id]);
        return { ok: true, disbanded: true };
      }
      // Ayrılan üye grubun şöhretinden bir parça götürür
      const fameLost = left ? await memberLeaveFameLoss(c, m.band_id, left.joined_at) : false;
      await addMoodlet(c, id, 'band_split');
      if (m.leader_id === id) {
        await c.query('UPDATE bands SET leader_id = $2 WHERE id = $1', [m.band_id, rest[0].character_id]);
      }
      const me = await getCharacter(c, id);
      for (const mem of rest) await notify(c, mem.character_id, 'member_left', { name: me.name });
      return { ok: true, disbanded: false, fameLost };
    });
  });

  app.post('/bands/mine/kick', async (req) => {
    const id = charId(req);
    const body = parse(z.object({ characterId: z.number().int() }), req.body);
    return tx(async (c) => {
      const m = await requireBand(c, id, true);
      if (body.characterId === id) fail('invalid_target');
      await c.query('SELECT 1 FROM bands WHERE id = $1 FOR UPDATE', [m.band_id]);
      const r = await one(c, 'DELETE FROM band_members WHERE band_id = $1 AND character_id = $2 RETURNING joined_at', [m.band_id, body.characterId]);
      if (!r) fail('not_found', 404);
      // Üye çıkarmak da şöhrete mal olur (deneme süresinde değilse)
      const fameLost = await memberLeaveFameLoss(c, m.band_id, r.joined_at);
      await addMoodlet(c, body.characterId, 'band_split');
      await notify(c, body.characterId, 'kicked', { bandName: m.name });
      return { ok: true, fameLost };
    });
  });

  app.post('/bands/mine/songs', async (req) => {
    const id = charId(req);
    const body = parse(z.object({ songId: z.number().int() }), req.body);
    const m = await requireBand(pool, id);
    const song = await one(pool, 'SELECT * FROM songs WHERE id = $1 AND author_id = $2', [body.songId, id]);
    if (!song) fail('not_your_song', 403);
    await pool.query('INSERT INTO band_songs(band_id, song_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [m.band_id, song.id]);
    return { ok: true };
  });

  app.delete('/bands/mine/songs/:id', async (req) => {
    const cid = charId(req);
    const { id } = parse(idParam, req.params);
    const m = await requireBand(pool, cid);
    const song = await one(pool, 'SELECT author_id FROM songs WHERE id = $1', [id]);
    if (!song) fail('not_found', 404);
    if (song.author_id !== cid && m.leader_id !== cid) fail('forbidden', 403);
    await pool.query('DELETE FROM band_songs WHERE band_id = $1 AND song_id = $2', [m.band_id, id]);
    return { ok: true };
  });

  // ---------- Konserler ----------

  // ---------- Yayınlar ve listeler ----------

  app.post('/releases', async (req) => {
    const body = parse(
      z.object({ kind: z.enum(['single', 'album']), title: z.string().trim().min(1).max(40), songIds: z.array(z.number().int()).min(1).max(12) }),
      req.body,
    );
    return { release: await createRelease(charId(req), body) };
  });

  app.get('/charts', async (req) => {
    const q = parse(
      z.object({
        scope: z.string().refine((s) => s === 'world' || !!CITY_BY_ID[s]).default('world'),
        kind: z.enum(['single', 'album']).default('single'),
        week: z.coerce.number().int().optional(),
      }),
      req.query,
    );
    return getChart(q.scope, q.kind, q.week ?? null, req.user!.isVip);
  });

  app.post('/gigs', async (req) => {
    const body = parse(
      z.object({
        locationId: z.string(),
        inHours: z.number().refine((h) => (VIP.gigLeadHours as readonly number[]).includes(h)),
        setlist: z.array(z.number().int()).min(1),
        sessionRoles: z.array(z.enum(INSTRUMENTS)).max(5).optional(),
        effects: z.array(z.number().int()).max(6).optional(),
        plan: z
          .object({
            events: z.array(z.string().max(30)).max(MAX_STAGE_EVENTS).optional(),
            encore: z.enum(ENCORE_PLANS).optional(),
          })
          .optional(),
      }),
      req.body,
    );
    return { gig: await bookGig(charId(req), body, { isVip: req.user!.isVip }) };
  });

  app.get('/gigs/estimate', async (req) => {
    const q = parse(z.object({ locationId: z.string() }), req.query);
    return estimateAttendance(charId(req), q.locationId, req.user!.isVip);
  });

  app.delete('/gigs/:id', async (req) => {
    const { id } = parse(idParam, req.params);
    return cancelGig(charId(req), id);
  });

  app.get('/gigs/:id', async (req) => {
    const { id } = parse(idParam, req.params);
    const g = await one(pool, 'SELECT g.*, b.name AS band_name FROM gigs g JOIN bands b ON b.id = g.band_id WHERE g.id = $1', [id]);
    if (!g) fail('not_found', 404);
    const songs = await many(pool, 'SELECT id, title, quality FROM songs WHERE id = ANY($1::bigint[])', [g.setlist]);
    const gated = gateGig(toGigDto(g), req.user!.isVip, config.gameSpeed);
    return { gig: gated, songs: gated.reportExpired ? songs.map((x) => ({ id: x.id, title: x.title, quality: x.quality })) : songs };
  });
}
