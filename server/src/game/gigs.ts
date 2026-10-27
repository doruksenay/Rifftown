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
  MAX_SCHEDULED_GIGS,
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
  GIG_BREAK_EVEN_QUALITY,
  gigAdvice,
  GIG_ENERGY_COST,
  INSPIRATION_GAIN,
  MAX_STAGE_EVENTS,
  STAGE_EVENTS,
  STAGE_EVENT_BY_ID,
  ENCORE_PLANS,
  type EncorePlan,
  CANCEL_SCANDAL_RATIO,
  DISASTER_QUALITY,
  cancelFamePenalty,
  ticketsSold,
  marketingAttendanceMult,
  stageEventAllowed,
  cityEventActive,
  PACING,
  gigXp,
  roleAttrBonus,
} from '@rifftown/shared';
import { grantXp } from './attributes';
import { createScandal, markFameActive, touchFamiliarity } from './consequences';
import { bandPress } from './press';
import { afterGigCrew, crewForGig, wearGigGear } from './touring';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { type Wellbeing, addMoodlet, changeWellbeing, wellbeingOf } from './wellbeing';
import { evaluateMany } from './achievements';
import { barGigShare } from './business';
import { type CharacterRow, gearBonuses, isJailed, lockCharacter, membership, notify, notifySkillUps, toGigDto } from './common';

/** Grubun bir şehirdeki şöhreti (0–100). */
/** Konserin sahne efektlerinden gelen kalite (tavanlı). Kayıtlı bonus varsa (atölye efektleri) o, yoksa eşyanın bonusu. */
export const fxBonusOf = (gig: { effects?: string[] | null; effect_bonuses?: number[] | null }) =>
  Math.min(
    MAX_FX_BONUS,
    (gig.effects ?? []).reduce((sum: number, id: string, i: number) => sum + (gig.effect_bonuses?.[i] ?? ITEM_BY_ID[id]?.bonus ?? 0), 0),
  );

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

    const scheduled = await one(
      c,
      `SELECT count(*)::int AS n FROM gigs WHERE band_id = $1 AND status = 'scheduled' AND festival_id IS NULL`,
      [m!.band_id],
    );
    if (scheduled.n >= MAX_SCHEDULED_GIGS) fail('too_many_gigs', 409);
    const startsAt = new Date(Date.now() + gameHoursToMs(req.inHours, config.gameSpeed));
    const blockMs = gameHoursToMs(GIG_BLOCK_HOURS, config.gameSpeed);
    const clash = await one(
      c,
      `SELECT 1 FROM gigs WHERE band_id = $1 AND status = 'scheduled'
         AND starts_at BETWEEN $2 AND $3`,
      [m!.band_id, new Date(startsAt.getTime() - blockMs), new Date(startsAt.getTime() + blockMs)],
    );
    if (clash) fail('gig_clash', 409);
    // Aynı sahnede aynı saatlerde başka bir grup çalamaz (eşzamanlı iki rezervasyonu sırala)
    await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`venue:${loc!.id}`]);
    const clashing = await many(
      c,
      `SELECT g.id, (b.npc_key IS NOT NULL) AS npc FROM gigs g JOIN bands b ON b.id = g.band_id
        WHERE g.location_id = $1 AND g.status = 'scheduled' AND g.starts_at BETWEEN $2 AND $3 FOR UPDATE OF g`,
      [loc!.id, new Date(startsAt.getTime() - blockMs), new Date(startsAt.getTime() + blockMs)],
    );
    if (clashing.some((g) => !g.npc)) fail('venue_busy', 409);
    // Oyunun kendi grupları oyunculara yer açar: çakışan konserleri iptal edilir (bir sonraki turda yeni saat bulurlar)
    if (clashing.length) await c.query(`UPDATE gigs SET status = 'cancelled' WHERE id = ANY($1::bigint[]) AND status = 'scheduled'`, [clashing.map((g) => g.id)]);

    // Sahne efektleri: liderin envanterinden ayrılır, konserde tüketilir (iptalde geri verilir)
    const fxIds = [...new Set((req.effects ?? []).map(Number))];
    const fx = fxIds.length
      ? await many(c, `SELECT id, item_id, bonus FROM inventory WHERE id = ANY($1::bigint[]) AND character_id = $2 AND slot = 'fx' AND NOT listed FOR UPDATE`, [
          fxIds,
          characterId,
        ])
      : [];
    if (fx.length !== fxIds.length) fail('invalid_item');
    if (fx.length) await c.query('DELETE FROM inventory WHERE id = ANY($1::bigint[])', [fx.map((f) => f.id)]);

    const plan = normalizePlan(req.plan, m!.genre as Genre);
    await c.query('UPDATE characters SET money = money - $2 WHERE id = $1', [characterId, fee]);
    const gig = await one(
      c,
      `INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist, session_roles, effects, plan, effect_bonuses)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      // Atölyede yapılmış efektin bonusu her üründe farklıdır: konsere kendi bonusuyla taşınır (fxBonusOf)
      [m!.band_id, loc!.cityId, loc!.id, startsAt, setlist, sessionRoles, fx.map((f) => f.item_id), JSON.stringify(plan), fx.map((f) => f.bonus ?? ITEM_BY_ID[f.item_id]?.bonus ?? 0)],
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

/** Performans planını doğrular: bilinmeyen olay ya da bis seçeneği reddedilir */
export function normalizePlan(plan: { events?: string[]; encore?: string } | undefined, genre?: Genre): { events: string[]; encore: EncorePlan } {
  const events = [...new Set(plan?.events ?? [])];
  if (events.length > MAX_STAGE_EVENTS) fail('too_many_events');
  if (events.some((e) => !STAGE_EVENT_BY_ID[e])) fail('invalid_event');
  // Türe bağlı olaylar (ör. pogo yalnızca rock, metal, punk)
  if (genre && events.some((e) => !stageEventAllowed(STAGE_EVENT_BY_ID[e], genre))) fail('event_wrong_genre');
  const encore = (plan?.encore ?? 'none') as EncorePlan;
  if (!(ENCORE_PLANS as readonly string[]).includes(encore)) fail('invalid_encore');
  return { events, encore };
}

/** Grubun bekleme süresi dolmamış sahne olayları (son konserlerde denenmiş olanlar) */
export async function eventsOnCooldown(db: Db, bandId: number, at = Date.now()): Promise<string[]> {
  const longest = Math.max(...STAGE_EVENTS.map((e) => e.cooldownHours));
  const rows = await many(
    db,
    `SELECT starts_at, result->'events' AS events FROM gigs
      WHERE band_id = $1 AND status = 'done' AND starts_at > $2 AND result ? 'events'`,
    [bandId, new Date(at - gameHoursToMs(longest, config.gameSpeed))],
  );
  const out = new Set<string>();
  for (const r of rows) {
    for (const e of (r.events ?? []) as { id: string; outcome: string }[]) {
      const def = STAGE_EVENT_BY_ID[e.id];
      if (!def || e.outcome === 'skipped') continue;
      if (r.starts_at.getTime() + gameHoursToMs(def.cooldownHours, config.gameSpeed) > at) out.add(e.id);
    }
  }
  return [...out];
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
    // Ceza satılan biletle büyür: rezervasyondan bu yana geçen süreye göre beklenen seyircinin bir kısmı bilet almıştır
    const fame = await bandFame(c, m!.band_id, gig.city_id);
    const pop = CITY_BY_ID[gig.city_id].genrePopularity[m!.genre as Genre] ?? 1;
    const expected = expectedAttendance(venue, fame, pop, () => 0.5);
    const leadHours = Math.max(0.01, (gig.starts_at.getTime() - gig.created_at.getTime()) / gameHoursToMs(1, config.gameSpeed));
    const elapsedHours = (Date.now() - gig.created_at.getTime()) / gameHoursToMs(1, config.gameSpeed);
    const sold = ticketsSold(expected, elapsedHours, leadHours);
    const penalty = cancelFamePenalty(venue, sold);
    await c.query(`UPDATE gigs SET status = 'cancelled', result = $2 WHERE id = $1`, [gigId, JSON.stringify({ cancelled: true, ticketsSold: sold, famePenalty: penalty })]);
    await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [characterId, refund]);
    for (const [i, itemId] of (gig.effects ?? []).entries()) {
      // Atölye efekti kendi bonusuyla geri verilir
      const bonus = ITEM_BY_ID[itemId]?.crafted ? (gig.effect_bonuses?.[i] ?? null) : null;
      await c.query(`INSERT INTO inventory(character_id, item_id, slot, bonus) VALUES ($1, $2, 'fx', $3)`, [characterId, itemId, bonus]);
    }
    // İptal şöhret kaybettirir; biletlerin çoğu satılmışsa skandala dönüşür
    await addFame(c, m!.band_id, gig.city_id, -penalty);
    if (sold >= VENUE_RULES[venue].capacity * CANCEL_SCANDAL_RATIO) {
      await createScandal(c, { bandId: m!.band_id, characterId: null, cityId: gig.city_id, kind: 'cancel' });
    }
    const members = await many(c, 'SELECT character_id FROM band_members WHERE band_id = $1', [m!.band_id]);
    for (const mem of members) {
      if (mem.character_id !== characterId) await notify(c, mem.character_id, 'gig_cancelled', { gigId, bandName: m!.name });
    }
    return { ok: true, refund, ticketsSold: sold, famePenalty: penalty };
  });
}

/**
 * Grubun bu konserden önceki doygunluk penceresi içinde aynı şehirde verdiği konser sayısı.
 * Yalnızca sonuçlanmış, grubun kendi üyelerinden birinin sahneye çıktığı, festival dışı konserler sayılır.
 */
async function recentCityGigs(c: pg.PoolClient, gig: { id: number; band_id: number; city_id: string; starts_at: Date }): Promise<number> {
  const hours = config.gigSaturationHours ?? PACING.citySaturationHours;
  if (hours <= 0) return 0;
  const since = new Date(gig.starts_at.getTime() - gameHoursToMs(hours, config.gameSpeed));
  const r = await one(
    c,
    `SELECT count(*)::int AS n FROM gigs
      WHERE band_id = $1 AND city_id = $2 AND id <> $3 AND status = 'done' AND festival_id IS NULL
        AND starts_at > $4 AND starts_at <= $5 AND COALESCE((result->>'presentCount')::int, 0) > 0`,
    [gig.band_id, gig.city_id, gig.id, since, gig.starts_at],
  );
  return r?.n ?? 0;
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
  // Tür uyumlu eşyalar ve set bonusu grubun türüne göre
  const gear = await gearBonuses(c, ids, band.genre as Genre);
  const famRows = await many(
    c,
    'SELECT character_id, song_id, value FROM familiarity WHERE character_id = ANY($1::bigint[]) AND song_id = ANY($2::bigint[])',
    [ids, gig.setlist],
  );
  const songs = await many(c, 'SELECT id, title, genre, quality, tempo, subgenre FROM songs WHERE id = ANY($1::bigint[])', [gig.setlist]);
  const fame = await bandFame(c, gig.band_id, gig.city_id);
  // Görünen ruh hâli (moodlet'lerle), enerji ve ilham
  const wells = new Map<number, Wellbeing>();
  for (const ch of chars) wells.set(ch.id, await wellbeingOf(c, ch));

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
      mood: wells.get(ch.id)!.mood,
      health: ch.health,
      energy: wells.get(ch.id)!.energy,
      inspiration: wells.get(ch.id)!.inspiration,
      present: onStage(ch),
      // Enstrüman bonusu + nitelik (vokalde ses, diğer rollerde el becerisi; en fazla +4, attributes.ts roleAttrBonus)
      instrumentBonus: (g.instruments[role] ?? 0) + roleAttrBonus(ch.attributes, role),
      outfitBonus: g.outfit + g.tattoos + g.setStage,
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

  // Turne ekibi (oyunun kendi grupları ekip tutmaz)
  // Kariyer becerileri (perks.ts): pazarlama ve muhasebe grubun en iyisinden, lojistik sahnedekilerin en iyisinden
  const ownChars = chars.filter(onStage);
  const bestOf = (list: CharacterRow[], id: string) => Math.max(0, ...list.map((ch) => lv(ch.skills, id)));
  const marketing = bestOf(chars, 'marketing');
  const crew = await crewForGig(c, gig.band_id, gig.city_id, { accounting: bestOf(chars, 'accounting'), logistics: bestOf(ownChars, 'logistics') });
  const press = await bandPress(c, gig.band_id, gig.city_id);
  const res = computeGig({
    venue,
    fame,
    genre: band.genre,
    city,
    performers,
    setlist: gig.setlist.map((id: number) => songs.find((s) => s.id === id)).filter(Boolean),
    rand: Math.random,
    fxBonus: fxBonusOf(gig),
    plan: gig.plan ?? {},
    press,
    crew: { quality: crew.qualityBonus, attendanceMult: crew.attendanceMult * marketingAttendanceMult(marketing) },
    cooldownEvents: gig.plan?.events?.length ? await eventsOnCooldown(c, gig.band_id) : [],
    // Şehrin haftalık etkinliği (content/cities.ts): o gün uyan türdeki konsere daha çok seyirci
    cityEvent: cityEventActive(gig.city_id, band.genre as Genre, gig.starts_at.getTime(), config.gameSpeed),
    // Haftanın modası açık liste haftasına göre döner
    weekId: Number((await one(c, `SELECT id FROM chart_weeks WHERE status = 'open' ORDER BY id DESC LIMIT 1`))?.id ?? 0),
    // Şehir doygunluğu: aynı şehirde yakın zamanda verilmiş konserler (rules.ts CITY_SATURATION)
    recentCityGigs: band.npc_key || gig.festival_id ? 0 : await recentCityGigs(c, gig),
  });
  // Oyuncu barında: bilet gelirinden sahibinin payı düşülür
  const ownerShare = await barGigShare(c, gig.location_id, res.revenue, ids);
  res.revenue -= ownerShare;
  // Ekip ücreti bilet gelirinden ödenir; yetmezse ödenmez ve moral çöker
  const crewPaid = crew.roles.length > 0 && res.revenue >= crew.fee;
  if (crewPaid) res.revenue -= crew.fee;

  const presentChars = chars.filter(onStage);
  const perMember = presentChars.length ? Math.floor(res.revenue / presentChars.length) : 0;
  const xpGained = new Map<number, number>();
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
    // Sahne yorar ama ilham verir; iyi ya da kötü bir gece ruh hâlinde iz bırakır
    const inspiration = res.legendary ? INSPIRATION_GAIN.legendaryGig : INSPIRATION_GAIN.gig + Math.max(0, (res.quality - 50) / 8);
    await changeWellbeing(c, ch, { energy: -Math.max(0, GIG_ENERGY_COST - crew.energySaved) - (res.encoreEnergy ?? 0), inspiration });
    // Sahneye çıkılan konser XP verir (günlük/haftalık tavanla; oyunun kendi müzisyenleri almaz)
    if (res.presentCount > 0) xpGained.set(ch.id, await grantXp(c, ch, gigXp(res.quality), 'gig'));
    if (res.legendary) await addMoodlet(c, ch.id, 'legendary_gig');
    else if (res.quality >= 70) await addMoodlet(c, ch.id, 'great_gig');
    else if (res.quality < GIG_BREAK_EVEN_QUALITY) await addMoodlet(c, ch.id, 'bad_gig');
  }

  // EFSANEVİ gece: sahnedeki üyelerin o gece çaldığı enstrüman efsaneleşir
  const legendaryItems: { characterId: number; inventoryId: number; itemId: string; nickname: string | null }[] = [];
  if (res.legendary) {
    for (const ch of presentChars) {
      const role = memberRows[chars.indexOf(ch)].role as Instrument;
      const item = await one(
        c,
        `UPDATE inventory SET legendary_at = COALESCE(legendary_at, now()), legendary_gig = COALESCE(legendary_gig, $3), legendary_band = COALESCE(legendary_band, $4)
          WHERE id = (SELECT id FROM inventory WHERE character_id = $1 AND slot = $2 AND equipped AND NOT listed ORDER BY id LIMIT 1)
          RETURNING id, item_id, nickname`,
        [ch.id, role, gig.id, band.name],
      );
      if (item) legendaryItems.push({ characterId: ch.id, inventoryId: Number(item.id), itemId: item.item_id, nickname: item.nickname });
    }
  }

  // Medya ilişkileri becerisi, sahnedeki üyelerin en iyisine göre şöhret artışını en fazla %25 büyütür
  if (res.fameDelta > 0) {
    const media = Math.max(0, ...presentChars.map((ch) => lv(ch.skills, 'media')));
    res.fameDelta = Math.round(res.fameDelta * (1 + media / 400) * 10) / 10;
  }
  await addFame(c, gig.band_id, gig.city_id, res.fameDelta);
  // Konser verilen şehirde şöhret canlı kalır; sahnede çalınan şarkılar unutulmaz
  await markFameActive(c, gig.band_id, gig.city_id);
  await touchFamiliarity(c, presentChars.map((x) => x.id), gig.setlist);
  // Sahnedeki enstrümanlar yıpranır; ekip morali güncellenir
  await wearGigGear(c, presentChars.map((x) => x.id), presentChars.map((x) => memberRows[chars.indexOf(x)].role), crew.wearMult);
  if (crew.roles.length && res.presentCount > 0) await afterGigCrew(c, gig.band_id, crewPaid, res.quality, crew.moraleLoss);
  // Kulüp ve üstünde felaket bir gece haber olur
  if (res.presentCount > 0 && venue !== 'bar' && res.quality < DISASTER_QUALITY && !band.npc_key) {
    await createScandal(c, { bandId: gig.band_id, characterId: null, cityId: gig.city_id, kind: 'disaster' });
  }
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
  // Eleştirmen kıyas yapar: son 48 oyun saatinde aynı şehirde çalan başka bir grubun gecesi
  const rival = await one(
    c,
    `SELECT b.name, (g.result->>'quality')::int AS quality FROM gigs g JOIN bands b ON b.id = g.band_id
      WHERE g.city_id = $1 AND g.band_id <> $2 AND g.status = 'done' AND g.starts_at > $3 AND (g.result->>'presentCount')::int > 0
      ORDER BY g.starts_at DESC LIMIT 1`,
    [gig.city_id, gig.band_id, new Date(Date.now() - gameHoursToMs(48, config.gameSpeed))],
  );
  const review = gigReview({
    cityId: gig.city_id,
    events: (res.events ?? []).map((e) => ({ id: e.id, outcome: e.outcome, name: STAGE_EVENT_BY_ID[e.id]?.name })),
    press,
    rival: rival ? { name: rival.name, quality: Number(rival.quality) } : null,
    quality: res.quality,
    attendance: res.attendance,
    capacity: VENUE_RULES[venue].capacity,
    presentCount: res.presentCount,
    memberCount: res.memberCount,
    venue: LOCATION_BY_ID[gig.location_id].name,
    city: city.name,
    bestSong: bestSong?.title ?? '',
    seed: gig.id,
    legendary: !!res.legendary,
  });

  const result = {
    review,
    bestSongId: bestSong?.id,
    quality: res.quality,
    legendary: !!res.legendary,
    legendaryItems,
    attendance: res.attendance,
    revenue: res.revenue,
    fameDelta: res.fameDelta,
    presentCount: res.presentCount,
    memberCount: res.memberCount,
    perMember,
    songScores: res.songScores,
    factors: res.factors,
    advice: res.factors ? gigAdvice(res.factors) : [],
    flow: res.flow ?? 0,
    events: res.events ?? [],
    encore: res.encore ?? 'none',
    fame: fameAfter,
    effects: gig.effects ?? [],
    ownerShare,
    crewFee: crewPaid ? crew.fee : 0,
    crewUnpaid: crew.roles.length > 0 && !crewPaid,
    festivalId: gig.festival_id ?? null,
  };
  await c.query(`UPDATE gigs SET status = 'done', result = $2, legendary = $3 WHERE id = $1`, [gig.id, JSON.stringify(result), !!res.legendary]);
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
      legendary: !!res.legendary,
      legendaryItem: legendaryItems.find((x) => x.characterId === ch.id) ?? null,
      attendance: res.attendance,
      perMember: onStage(ch) ? perMember : 0,
      fameDelta: res.fameDelta,
      review,
      xp: xpGained.get(ch.id) ?? 0,
    });
    if (fameUp) await notify(c, ch.id, 'fame_up', { bandName: band.name, cityId: gig.city_id, fame: fameAfter });
  }
  await evaluateMany(c, ids);
}
