// Konser rezervasyonu ve konserlerin sonuçlandırılması.

import {
  type BookGigRequest,
  CITIES,
  CITY_BY_ID,
  FAME_SPILLOVER,
  GIG_LEAD_HOURS,
  type GigPerformer,
  type Instrument,
  INSTRUMENTS,
  LOCATION_BY_ID,
  MAX_SETLIST,
  MAX_FX_BONUS,
  ITEM_BY_ID,
  SESSION_FAMILIARITY,
  SESSION_MUSICIAN,
  ROLE_SKILLS,
  type Skills,
  familiarityCap,
  genreSkillId,
  gigReview,
  knows,
  lv,
  VIP,
  VENUE_RULES,
  type VenueType,
  clamp,
  type Genre,
  computeGig,
  expectedAttendance,
  diminishing,
  gameHoursToMs,
  isVenue,
  tierChange,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { evaluateMany } from './achievements';
import { barGigShare } from './business';
import { type CharacterRow, gearBonuses, isJailed, lockCharacter, membership, notify, notifySkillUps, toGigDto } from './common';

/** Grubun bir şehirdeki şöhreti (0–100). */
export async function bandFame(db: Db, bandId: number, cityId: string): Promise<number> {
  const r = await one(db, 'SELECT fame FROM band_fame WHERE band_id = $1 AND city_id = $2', [bandId, cityId]);
  return r?.fame ?? 0;
}

const GIG_BLOCK_HOURS = 3;

/** VIP avantajı: bir mekânda konser verilse kaç kişinin geleceğinin tahmini aralığı.
 *  Başka şehirdeki mekânlar için de sorulabilir (turne planlarken). */
export async function estimateAttendance(characterId: number, locationId: string, isVip: boolean) {
  if (!isVip) fail('vip_required', 403);
  const loc = LOCATION_BY_ID[locationId];
  if (!loc || !isVenue(loc.type)) fail('invalid_location');
  const m = await membership(pool, characterId);
  if (!m) fail('no_band');
  const venue = loc!.type as VenueType;
  const fame = await bandFame(pool, m!.band_id, loc!.cityId);
  const pop = CITY_BY_ID[loc!.cityId].genrePopularity[m!.genre as Genre];
  return {
    locationId,
    min: expectedAttendance(venue, fame, pop, () => 0),
    max: expectedAttendance(venue, fame, pop, () => 0.999),
    capacity: VENUE_RULES[venue].capacity,
  };
}

export async function bookGig(characterId: number, req: BookGigRequest, opts: { isVip?: boolean } = {}) {
  return tx(async (c) => {
    const char = await lockCharacter(c, characterId);
    if (isJailed(char)) fail('in_jail', 409);
    const m = await membership(c, characterId);
    if (!m) fail('no_band');
    if (m!.leader_id !== characterId) fail('not_leader', 403);
    const loc = LOCATION_BY_ID[req.locationId];
    if (!loc || !isVenue(loc.type)) fail('invalid_location');
    if (loc!.cityId !== char.city_id) fail('not_in_city');
    const venue = loc!.type as VenueType;
    if (venue === 'festival') fail('festival_only');
    if (!(GIG_LEAD_HOURS as readonly number[]).includes(req.inHours)) {
      // 48 ve 72 saat öncesinden ayarlama VIP avantajıdır
      const vipOnly = (VIP.gigLeadHours as readonly number[]).includes(req.inHours);
      if (!vipOnly) fail('invalid_hours');
      if (!opts.isVip) fail('vip_required', 403);
    }

    const fame = await bandFame(c, m!.band_id, loc!.cityId);
    if (fame < VENUE_RULES[venue].minFame) fail('not_famous_enough');

    const setlist = Array.isArray(req.setlist) ? [...new Set(req.setlist.map(Number))] : [];
    if (setlist.length < 1 || setlist.length > MAX_SETLIST) fail('invalid_setlist');
    const inBand = await many(c, 'SELECT song_id FROM band_songs WHERE band_id = $1 AND song_id = ANY($2::bigint[])', [
      m!.band_id,
      setlist,
    ]);
    if (inBand.length !== setlist.length) fail('song_not_in_band');

    const sessionRoles = [...new Set(req.sessionRoles ?? [])] as Instrument[];
    if (sessionRoles.some((r) => !(INSTRUMENTS as readonly string[]).includes(r))) fail('invalid_role');
    const fee = SESSION_MUSICIAN[venue].fee * sessionRoles.length;
    if (char.money < fee) fail('not_enough_money');

    const startsAt = new Date(Date.now() + gameHoursToMs(req.inHours, config.gameSpeed));
    const blockMs = gameHoursToMs(GIG_BLOCK_HOURS, config.gameSpeed);
    const clash = await one(
      c,
      `SELECT 1 FROM gigs WHERE band_id = $1 AND status = 'scheduled'
         AND starts_at BETWEEN $2 AND $3`,
      [m!.band_id, new Date(startsAt.getTime() - blockMs), new Date(startsAt.getTime() + blockMs)],
    );
    if (clash) fail('gig_clash', 409);

    // Sahne efektleri: liderin envanterinden ayrılır, konserde tüketilir (iptalde geri verilir)
    const fxIds = [...new Set((req.effects ?? []).map(Number))];
    const fx = fxIds.length
      ? await many(c, `SELECT id, item_id FROM inventory WHERE id = ANY($1::bigint[]) AND character_id = $2 AND slot = 'fx' AND NOT listed FOR UPDATE`, [
          fxIds,
          characterId,
        ])
      : [];
    if (fx.length !== fxIds.length) fail('invalid_item');
    if (fx.length) await c.query('DELETE FROM inventory WHERE id = ANY($1::bigint[])', [fx.map((f) => f.id)]);

    await c.query('UPDATE characters SET money = money - $2 WHERE id = $1', [characterId, fee]);
    const gig = await one(
      c,
      `INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist, session_roles, effects)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [m!.band_id, loc!.cityId, loc!.id, startsAt, setlist, sessionRoles, fx.map((f) => f.item_id)],
    );
    const members = await many(c, 'SELECT character_id FROM band_members WHERE band_id = $1', [m!.band_id]);
    for (const mem of members) {
      if (mem.character_id === characterId) continue;
      await notify(c, mem.character_id, 'gig_booked', {
        gigId: gig!.id,
        bandName: m!.name,
        locationId: loc!.id,
        cityId: loc!.cityId,
        startsAt: startsAt.toISOString(),
      });
    }
    return toGigDto({ ...gig, band_name: m!.name });
  });
}

export async function cancelGig(characterId: number, gigId: number) {
  return tx(async (c) => {
    const m = await membership(c, characterId);
    if (!m) fail('no_band');
    if (m!.leader_id !== characterId) fail('not_leader', 403);
    const gig = await one(c, `SELECT * FROM gigs WHERE id = $1 AND band_id = $2 FOR UPDATE`, [gigId, m!.band_id]);
    if (!gig) fail('not_found', 404);
    if (gig.status !== 'scheduled') fail('gig_not_scheduled');
    const venue = LOCATION_BY_ID[gig.location_id].type as VenueType;
    const refund = SESSION_MUSICIAN[venue].fee * gig.session_roles.length;
    if (gig.festival_id) fail('festival_gig');
    await c.query(`UPDATE gigs SET status = 'cancelled' WHERE id = $1`, [gigId]);
    await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [characterId, refund]);
    for (const itemId of gig.effects ?? []) {
      await c.query(`INSERT INTO inventory(character_id, item_id, slot) VALUES ($1, $2, 'fx')`, [characterId, itemId]);
    }
    // Son dakika iptali şöhret kaybettirir
    await addFame(c, m!.band_id, gig.city_id, -1);
    const members = await many(c, 'SELECT character_id FROM band_members WHERE band_id = $1', [m!.band_id]);
    for (const mem of members) {
      if (mem.character_id !== characterId) await notify(c, mem.character_id, 'gig_cancelled', { gigId, bandName: m!.name });
    }
    return { ok: true, refund };
  });
}

export async function addFame(c: pg.PoolClient, bandId: number, cityId: string, delta: number) {
  await c.query(
    `INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, $2, GREATEST(0, LEAST(100, $3::real)))
     ON CONFLICT (band_id, city_id) DO UPDATE SET fame = GREATEST(0, LEAST(100, band_fame.fame + $3::real))`,
    [bandId, cityId, delta],
  );
}

export async function processDueGigs(limit = 20): Promise<number> {
  let processed = 0;
  // Her konser kendi işleminde sonuçlanır; biri hata verirse diğerleri etkilenmez.
  for (;;) {
    const done = await tx(async (c) => {
      const gig = await one(
        c,
        `SELECT * FROM gigs WHERE status = 'scheduled' AND starts_at <= now()
          ORDER BY starts_at LIMIT 1 FOR UPDATE SKIP LOCKED`,
      );
      if (!gig) return false;
      await resolveGig(c, gig);
      return true;
    });
    if (!done) break;
    processed++;
    if (processed >= limit) break;
  }
  return processed;
}

async function resolveGig(c: pg.PoolClient, gig: any) {
  const band = await one(c, 'SELECT * FROM bands WHERE id = $1', [gig.band_id]);
  const city = CITY_BY_ID[gig.city_id];
  const venue = LOCATION_BY_ID[gig.location_id].type as VenueType;
  const memberRows = await many(c, 'SELECT character_id, role FROM band_members WHERE band_id = $1 ORDER BY character_id', [
    gig.band_id,
  ]);
  const chars: CharacterRow[] = [];
  for (const m of memberRows) chars.push(await lockCharacter(c, m.character_id));
  const ids = chars.map((ch) => ch.id);
  // Konser şehrinde olmayan ya da cezaevindeki üye sahneye çıkamaz
  const onStage = (ch: CharacterRow) => ch.city_id === gig.city_id && !isJailed(ch);
  const gear = await gearBonuses(c, ids);
  const famRows = await many(
    c,
    'SELECT character_id, song_id, value FROM familiarity WHERE character_id = ANY($1::bigint[]) AND song_id = ANY($2::bigint[])',
    [ids, gig.setlist],
  );
  const songs = await many(c, 'SELECT id, title, genre, quality FROM songs WHERE id = ANY($1::bigint[])', [gig.setlist]);
  const fame = await bandFame(c, gig.band_id, gig.city_id);

  const performers: GigPerformer[] = chars.map((ch, i) => {
    const g = gear.get(ch.id)!;
    const role = memberRows[i].role as Instrument;
    const familiarity: Record<number, number> = {};
    for (const f of famRows) {
      if (f.character_id !== ch.id) continue;
      // Tür becerisi aşinalığı sınırlar
      const song = songs.find((x) => x.id === f.song_id);
      familiarity[f.song_id] = song ? Math.min(f.value, familiarityCap(ch.skills, song.genre)) : f.value;
    }
    return {
      characterId: ch.id,
      role,
      skills: ch.skills,
      mood: ch.mood,
      health: ch.health,
      present: onStage(ch),
      instrumentBonus: g.instruments[role] ?? 0,
      outfitBonus: g.outfit + g.tattoos,
      familiarity,
    };
  });

  const sm = SESSION_MUSICIAN[venue];
  for (const role of gig.session_roles as Instrument[]) {
    const skills: Skills = {
      [ROLE_SKILLS[role].basic]: sm.skill,
      [ROLE_SKILLS[role].specific]: sm.skill,
      showmanship: sm.stage,
      pro_showmanship: sm.stage,
      dancing: sm.stage,
      audience: sm.stage,
    };
    performers.push({
      characterId: null,
      role,
      skills,
      mood: 80,
      health: 100,
      present: true,
      instrumentBonus: 0,
      outfitBonus: 0,
      familiarity: Object.fromEntries(gig.setlist.map((id: number) => [id, SESSION_FAMILIARITY])),
    });
  }

  const res = computeGig({
    venue,
    fame,
    genre: band.genre,
    city,
    performers,
    setlist: gig.setlist.map((id: number) => songs.find((s) => s.id === id)).filter(Boolean),
    rand: Math.random,
    fxBonus: Math.min(MAX_FX_BONUS, (gig.effects ?? []).reduce((sum: number, id: string) => sum + (ITEM_BY_ID[id]?.bonus ?? 0), 0)),
  });
  // Oyuncu barında: bilet gelirinden sahibinin payı düşülür
  const ownerShare = await barGigShare(c, gig.location_id, res.revenue, ids);
  res.revenue -= ownerShare;

  const presentChars = chars.filter(onStage);
  const perMember = presentChars.length ? Math.floor(res.revenue / presentChars.length) : 0;
  for (const ch of presentChars) {
    const role = memberRows[chars.indexOf(ch)].role as Instrument;
    const skills = { ...ch.skills };
    // Sahnede geçen her konser, bilinen sahne ve rol becerilerini biraz geliştirir
    const gains: [string, number][] = [
      [ROLE_SKILLS[role].specific, 0.5],
      [ROLE_SKILLS[role].basic, 0.2],
      ['showmanship', 0.8],
      ['audience', 0.4],
      ['dancing', 0.2],
      ['pro_showmanship', venue === 'bar' ? 0 : 0.4],
      [genreSkillId(band.genre), 0.2],
    ];
    for (const [id, amount] of gains) {
      if (amount > 0 && knows(skills, id)) skills[id] = clamp(skills[id] + amount * diminishing(skills[id]), 0, 100);
    }
    await c.query(
      `UPDATE characters SET money = money + $2, mood = GREATEST(0, mood - 10), health = GREATEST(0, health - 2), skills = $3
        WHERE id = $1`,
      [ch.id, perMember, JSON.stringify(skills)],
    );
    await notifySkillUps(c, ch.id, ch.skills, skills);
  }

  // Medya ilişkileri becerisi, sahnedeki üyelerin en iyisine göre şöhret artışını en fazla %25 büyütür
  if (res.fameDelta > 0) {
    const media = Math.max(0, ...presentChars.map((ch) => lv(ch.skills, 'media')));
    res.fameDelta = Math.round(res.fameDelta * (1 + media / 400) * 10) / 10;
  }
  await addFame(c, gig.band_id, gig.city_id, res.fameDelta);
  const fameAfter = await bandFame(c, gig.band_id, gig.city_id);
  const fameUp = tierChange('fame', fame, fameAfter) > 0;
  if (res.fameDelta > 0) {
    for (const other of CITIES) {
      if (other.id !== city.id && other.countryCode === city.countryCode) {
        await addFame(c, gig.band_id, other.id, Math.round(res.fameDelta * FAME_SPILLOVER * 10) / 10);
      }
    }
  }

  const best = [...res.songScores].sort((a, b) => b.score - a.score)[0];
  const bestSong = best ? songs.find((x) => x.id === best.id) : null;
  const review = gigReview({
    quality: res.quality,
    attendance: res.attendance,
    capacity: VENUE_RULES[venue].capacity,
    presentCount: res.presentCount,
    memberCount: res.memberCount,
    venue: LOCATION_BY_ID[gig.location_id].name,
    city: city.name,
    bestSong: bestSong?.title ?? '',
    seed: gig.id,
  });

  const result = {
    review,
    bestSongId: bestSong?.id,
    quality: res.quality,
    attendance: res.attendance,
    revenue: res.revenue,
    fameDelta: res.fameDelta,
    presentCount: res.presentCount,
    memberCount: res.memberCount,
    perMember,
    songScores: res.songScores,
    effects: gig.effects ?? [],
    ownerShare,
    festivalId: gig.festival_id ?? null,
  };
  await c.query(`UPDATE gigs SET status = 'done', result = $2 WHERE id = $1`, [gig.id, JSON.stringify(result)]);
  for (const ch of chars) {
    await c.query('INSERT INTO gig_performers(gig_id, character_id, present) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [
      gig.id,
      ch.id,
      onStage(ch),
    ]);
  }
  for (const ch of chars) {
    await notify(c, ch.id, 'gig_done', {
      gigId: gig.id,
      bandName: band.name,
      locationId: gig.location_id,
      present: onStage(ch),
      jailed: isJailed(ch),
      quality: res.quality,
      attendance: res.attendance,
      perMember: onStage(ch) ? perMember : 0,
      fameDelta: res.fameDelta,
      review,
    });
    if (fameUp) await notify(c, ch.id, 'fame_up', { bandName: band.name, cityId: gig.city_id, fame: fameAfter });
  }
  await evaluateMany(c, ids);
}
