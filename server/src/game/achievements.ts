// Başarımları oyuncunun istatistiklerinden hesaplar ve henüz açılmamış olanları açar.
// Olay bazlı değil istatistik bazlı olduğu için geriye dönük çalışır: eski oyuncular da hak ettiklerini alır.
// Eylem, konser ve liste sonuçlarından hemen sonra; diğer olaylar (oy, para gönderme, VIP) için /me çağrısında
// en fazla dakikada bir kontrol edilir.

import { STAT_ACHIEVEMENTS, ACHIEVEMENT_BY_ID, CITY_BY_ID, LOCATION_BY_ID, GOLD_UNITS, RANK_HOURS, VENUE_RULES, type VenueType, tierOf } from '@rifftown/shared';
import { addMoodlet } from './wellbeing';
import { type Db, many, one } from '../db';
import { notify } from './common';
import { lifetimeStats } from './stats';

/** Karakter oluştururken verilen beceri sayısı (bunun üstü "yeni beceri" demektir) */
const STARTING_SKILL_COUNT = 6;

export async function evaluateAchievements(db: Db, characterId: number): Promise<string[]> {
  const s = await one(
    db,
    `SELECT
       c.skills, c.profession, c.career_rank, c.convictions, u.vip_until,
       (SELECT count(*)::int FROM songs WHERE author_id = c.id) AS songs,
       (SELECT coalesce(max(quality), 0) FROM songs WHERE author_id = c.id) AS best_song,
       (SELECT count(*)::int FROM band_members WHERE character_id = c.id) AS in_band,
       (SELECT count(*)::int FROM actions WHERE character_id = c.id AND status = 'done' AND kind = 'record' AND result ? 'quality') AS recordings,
       (SELECT count(*)::int FROM actions WHERE character_id = c.id AND status = 'done' AND kind = 'travel') AS travels,
       (SELECT count(*)::int FROM actions WHERE character_id = c.id AND status = 'done' AND kind = 'work') AS shifts,
       (SELECT count(*)::int FROM actions WHERE character_id = c.id AND status = 'done' AND kind = 'busk') AS busks,
       (SELECT count(*)::int FROM election_votes WHERE voter_id = c.id) AS votes,
       (SELECT count(*)::int FROM elections WHERE winner_id = c.id) AS wins,
       (SELECT count(*)::int FROM crimes WHERE character_id = c.id AND success) AS crimes_ok,
       (SELECT count(*)::int FROM cases WHERE suspect_id = c.id) AS arrests,
       (SELECT count(*)::int FROM crimes WHERE solved_by = c.id) AS solved,
       (SELECT count(*)::int FROM cases WHERE judge_id = c.id) AS rulings,
       (SELECT count(*)::int FROM money_transfers WHERE from_id = c.id) AS transfers
     FROM characters c JOIN users u ON u.id = c.user_id WHERE c.id = $1`,
    [characterId],
  );
  if (!s) return [];

  const gigs = await many(
    db,
    `SELECT g.location_id, g.city_id, (g.result->>'attendance')::int AS attendance, (g.result->>'quality')::int AS quality
       FROM gig_performers gp JOIN gigs g ON g.id = gp.gig_id
      WHERE gp.character_id = $1 AND gp.present AND g.status = 'done'
      ORDER BY g.id DESC LIMIT 1000`,
    [characterId],
  );
  const band = await one(
    db,
    `SELECT m.band_id,
            (SELECT coalesce(max(fame), 0) FROM band_fame WHERE band_id = m.band_id) AS max_fame,
            (SELECT count(*)::int FROM releases WHERE band_id = m.band_id AND kind = 'single') AS singles,
            (SELECT count(*)::int FROM releases WHERE band_id = m.band_id AND kind = 'album') AS albums,
            (SELECT coalesce(max(total_units), 0) FROM releases WHERE band_id = m.band_id) AS best_units,
            (SELECT min(e.position) FROM chart_entries e JOIN releases r ON r.id = e.release_id
              WHERE r.band_id = m.band_id AND e.scope <> 'world') AS best_position
       FROM band_members m WHERE m.character_id = $1`,
    [characterId],
  );

  const skills = Object.values((s.skills ?? {}) as Record<string, number>);
  const maxSkill = skills.length ? Math.max(...skills) : 0;
  const countries = new Set(gigs.map((g) => CITY_BY_ID[g.city_id]?.countryCode).filter(Boolean));
  const fullHouse = gigs.some((g) => {
    const type = LOCATION_BY_ID[g.location_id]?.type as VenueType | undefined;
    return type && type in VENUE_RULES && g.attendance >= VENUE_RULES[type].capacity * 0.9;
  });
  const fameTier = band ? tierOf('fame', band.max_fame).index : 0;

  const earned: Record<string, boolean> = {
    first_song: s.songs >= 1,
    first_band: s.in_band > 0,
    first_gig: gigs.length >= 1,
    first_job: s.shifts >= 1,
    first_travel: s.travels >= 1,
    new_skill: skills.length > STARTING_SKILL_COUNT,
    busker: s.busks >= 1,
    gigs_10: gigs.length >= 10,
    gigs_50: gigs.length >= 50,
    full_house: fullHouse,
    hall_gig: gigs.some((g) => LOCATION_BY_ID[g.location_id]?.type === 'hall'),
    epic_gig: gigs.some((g) => g.quality >= 90),
    world_tour: countries.size >= 5,
    local_star: fameTier >= 3, // yerel yıldız
    superstar: fameTier >= 5, // süperstar
    songs_10: s.songs >= 10,
    great_song: s.best_song >= 60,
    first_recording: s.recordings >= 1,
    first_single: !!band && band.singles >= 1,
    first_album: !!band && band.albums >= 1,
    chart_top10: !!band?.best_position && band.best_position <= 10,
    chart_no1: band?.best_position === 1,
    gold: !!band && band.best_units >= GOLD_UNITS,
    // platinum: veri dosyasında (best_units eşiği), efsane sonrası hedefle ortak
    skilled: maxSkill >= 45,
    master: maxSkill >= 60,
    legend: maxSkill >= 90,
    polymath: skills.length >= 12,
    first_profession: !!s.profession,
    top_rank: !!s.profession && s.career_rank >= RANK_HOURS.length - 1,
    voter: s.votes >= 1,
    elected: s.wins >= 1,
    first_crime: s.crimes_ok >= 1,
    caught: s.arrests >= 1,
    jailbird: s.convictions >= 3,
    detective: s.solved >= 1,
    justice: s.rulings >= 1,
    generous: s.transfers >= 1,
    vip: !!s.vip_until,
  };

  // Veri odaklı başarımlar: istatistik eşiği (content/progress.ts)
  const stats = await lifetimeStats(db, characterId);
  for (const a of STAT_ACHIEVEMENTS) earned[a.id] = stats[a.rule.stat] >= a.rule.min;

  const ids = Object.keys(earned).filter((id) => earned[id] && ACHIEVEMENT_BY_ID[id]);
  if (!ids.length) return [];
  const inserted = await many(
    db,
    `INSERT INTO character_achievements(character_id, achievement_id)
     SELECT $1, unnest($2::text[]) ON CONFLICT DO NOTHING RETURNING achievement_id`,
    [characterId, ids],
  );
  for (const r of inserted) await notify(db, characterId, 'achievement', { id: r.achievement_id });
  if (inserted.length) await addMoodlet(db, characterId, 'achievement');
  return inserted.map((r) => r.achievement_id as string);
}

/** Birden çok karakter için (ör. konser sonrası tüm grup) */
export async function evaluateMany(db: Db, characterIds: number[]) {
  for (const id of new Set(characterIds)) await evaluateAchievements(db, id);
}

const lastCheck = new Map<number, number>();
/** /me çağrılarında en fazla dakikada bir kontrol (oy, para gönderme, VIP gibi olaylar için) */
export async function evaluateThrottled(db: Db, characterId: number, everyMs = 60_000) {
  const now = Date.now();
  if (now - (lastCheck.get(characterId) ?? 0) < everyMs) return;
  lastCheck.set(characterId, now);
  await evaluateAchievements(db, characterId);
}

export async function achievementPoints(db: Db, characterId: number): Promise<number> {
  const rows = await many(db, 'SELECT achievement_id FROM character_achievements WHERE character_id = $1', [characterId]);
  return rows.reduce((sum, r) => sum + (ACHIEVEMENT_BY_ID[r.achievement_id]?.points ?? 0), 0);
}
