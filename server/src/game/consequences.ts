// Kayıp ve sonuç (kurallar: packages/shared/src/consequences.ts).
// Zamanlayıcı aşamaları: aşinalık çürümesi, şöhret azalması, bağımlılıktan kurtulma, hastaneye kaldırma, (isteğe bağlı) ölüm.
// Oyun içi tetikleyiciler: üye ayrılma cezası, skandal, düşkünlük (alışveriş ve yemek).

import {
  ADDICTION_RECOVERY,
  ADDICTION_SCANDAL_FAME,
  ADDICTION_THRESHOLD,
  CITIES,
  CITY_BY_ID,
  CRITICAL_HEALTH,
  FAME_DECAY_MIN_PER_DAY,
  FAME_DECAY_RATE_PER_DAY,
  FAME_GRACE_DAYS,
  FAMILIARITY_DECAY_PER_DAY,
  FAMILIARITY_FLOOR,
  FAMILIARITY_GRACE_DAYS,
  GAME_YEAR_DAYS,
  START_AGE,
  HOSPITAL_PRICE_PER_HOUR,
  HOSPITALIZE_HEALTH,
  HOSPITALIZE_HOURS,
  INHERITANCE_CAP,
  INHERITANCE_SHARE,
  MEMBER_LEAVE_FAME_LOSS,
  MEMBER_LEAVE_GRACE_HOURS,
  NEGLECT_DEATH_HOURS,
  OLD_AGE_START,
  SCANDALS,
  SCANDAL_SPILLOVER,
  type ScandalKind,
  ageOf,
  gameHoursToMs,
  indulgenceNow,
  oldAgeDeathChancePerDay,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one, pool, tx } from '../db';
import { type CharacterRow, lockCharacter, notify } from './common';
import { addMoodlet } from './wellbeing';

const hoursMs = (h: number) => gameHoursToMs(h, config.gameSpeed);

/** Karakterin yaşı (AGING=0 iken hep başlangıç yaşı) */
export const characterAge = (createdAt: Date) => (config.agingEnabled ? ageOf(createdAt, config.gameSpeed) : START_AGE);
const dayMs = () => hoursMs(24);

// ---------- Aşinalık ve şöhret çürümesi ----------

/** Bir karakterin bir şarkıya dokunduğunu (prova, konser, kayıt) kaydeder: çürüme süresi baştan başlar */
export async function touchFamiliarity(db: Db, characterIds: number[], songIds: number[]) {
  if (!characterIds.length || !songIds.length) return;
  await db.query(
    `UPDATE familiarity SET touched_at = now(), decayed_at = NULL WHERE character_id = ANY($1::bigint[]) AND song_id = ANY($2::bigint[])`,
    [characterIds, songIds],
  );
}

/**
 * Çalınmayan şarkıların aşinalığı düşer. Tek sorguda: son dokunuştan (ya da son çürüme turundan) bu yana geçen
 * oyun günü kadar. Oyunun kendi müzisyenleri hariç (onların aşinalığı sabittir).
 */
export async function processFamiliarityDecay(): Promise<number> {
  const r = await pool.query(
    `WITH due AS (
       SELECT f.character_id, f.song_id,
              GREATEST(f.touched_at + ($1::double precision * interval '1 millisecond'), COALESCE(f.decayed_at, f.touched_at)) AS since
         FROM familiarity f JOIN characters c ON c.id = f.character_id
        WHERE NOT c.npc AND f.value > $4
          AND f.touched_at < now() - ($1::double precision * interval '1 millisecond')
          AND COALESCE(f.decayed_at, f.touched_at) < now() - ($2::double precision / 24 * interval '1 millisecond')
        LIMIT 5000
     )
     UPDATE familiarity f
        SET value = GREATEST($4::real, f.value - $3::real * (extract(epoch FROM (now() - due.since)) * 1000 / $2)),
            decayed_at = now()
       FROM due WHERE f.character_id = due.character_id AND f.song_id = due.song_id AND due.since < now()`,
    [FAMILIARITY_GRACE_DAYS * dayMs(), dayMs(), FAMILIARITY_DECAY_PER_DAY, FAMILIARITY_FLOOR],
  );
  return r.rowCount ?? 0;
}

/** O şehirde uzun süre konser vermeyen grubun şöhreti azalır (oyunun kendi grupları hariç; yönetmen onları bantta tutar) */
export async function processFameDecay(): Promise<number> {
  const r = await pool.query(
    `WITH due AS (
       SELECT f.band_id, f.city_id,
              GREATEST(f.active_at + ($1::double precision * interval '1 millisecond'), COALESCE(f.decayed_at, f.active_at)) AS since
         FROM band_fame f JOIN bands b ON b.id = f.band_id
        WHERE b.npc_key IS NULL AND f.fame > 0
          AND f.active_at < now() - ($1::double precision * interval '1 millisecond')
          AND COALESCE(f.decayed_at, f.active_at) < now() - ($2::double precision / 24 * interval '1 millisecond')
        LIMIT 5000
     )
     UPDATE band_fame f
        SET fame = GREATEST(0, f.fame - GREATEST($4::real, f.fame * $3::real) * (extract(epoch FROM (now() - due.since)) * 1000 / $2)),
            decayed_at = now()
       FROM due WHERE f.band_id = due.band_id AND f.city_id = due.city_id AND due.since < now()`,
    [FAME_GRACE_DAYS * dayMs(), dayMs(), FAME_DECAY_RATE_PER_DAY, FAME_DECAY_MIN_PER_DAY],
  );
  return r.rowCount ?? 0;
}

/** Konser verilen şehirde şöhret "canlıdır": çürüme süresi baştan başlar */
export async function markFameActive(db: Db, bandId: number, cityId: string) {
  await db.query(`UPDATE band_fame SET active_at = now(), decayed_at = NULL WHERE band_id = $1 AND city_id = $2`, [bandId, cityId]);
}

// ---------- Üye ayrılması ----------

/** Üye ayrılınca ya da çıkarılınca grubun her şehirdeki şöhreti düşer (kısa süre kalan üyede ceza yok) */
export async function memberLeaveFameLoss(c: Db, bandId: number, joinedAt: Date): Promise<boolean> {
  if (joinedAt.getTime() + hoursMs(MEMBER_LEAVE_GRACE_HOURS) > Date.now()) return false;
  await c.query('UPDATE band_fame SET fame = GREATEST(0, fame * (1 - $2::real)) WHERE band_id = $1', [bandId, MEMBER_LEAVE_FAME_LOSS]);
  return true;
}

// ---------- Skandal ----------

/**
 * Skandal: grubun şehirdeki şöhreti düşer (aynı ülkeye %30'u yayılır), üyeler moodlet ve bildirim alır.
 * Basın etkisi press.ts tarafından skandal satırından okunur.
 */
export async function createScandal(
  c: Db,
  s: { bandId: number | null; characterId: number | null; cityId: string; kind: ScandalKind; severity?: number },
) {
  const def = SCANDALS[s.kind];
  const severity = s.severity ?? 1;
  if (!CITY_BY_ID[s.cityId]) return null;
  // Aynı grup aynı şehirde aynı türden skandalı bir günde iki kez yaşamaz (ceza katlanmasın)
  const recent = await one(
    c,
    `SELECT 1 FROM scandals WHERE COALESCE(band_id, 0) = COALESCE($1::bigint, 0) AND COALESCE(character_id, 0) = COALESCE($2::bigint, 0)
        AND city_id = $3 AND kind = $4 AND created_at > $5`,
    [s.bandId, s.characterId, s.cityId, s.kind, new Date(Date.now() - dayMs())],
  );
  if (recent) return null;
  const row = await one(
    c,
    'INSERT INTO scandals(band_id, character_id, city_id, kind, severity) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [s.bandId, s.characterId, s.cityId, s.kind, severity],
  );
  const members: number[] = [];
  if (s.bandId) {
    const city = CITY_BY_ID[s.cityId];
    const loss = def.fame * severity;
    await c.query('UPDATE band_fame SET fame = GREATEST(0, fame - $3::real) WHERE band_id = $1 AND city_id = $2', [s.bandId, s.cityId, loss]);
    const others = CITIES.filter((x) => x.id !== city.id && x.countryCode === city.countryCode).map((x) => x.id);
    await c.query('UPDATE band_fame SET fame = GREATEST(0, fame - $3::real) WHERE band_id = $1 AND city_id = ANY($2::text[])', [
      s.bandId,
      others,
      loss * SCANDAL_SPILLOVER,
    ]);
    for (const m of await many(c, 'SELECT character_id FROM band_members WHERE band_id = $1', [s.bandId])) members.push(Number(m.character_id));
  }
  if (s.characterId && !members.includes(s.characterId)) members.push(s.characterId);
  for (const id of members) {
    await addMoodlet(c, id, 'scandal');
    await notify(c, id, 'scandal', { scandalId: row.id, kind: s.kind, cityId: s.cityId });
  }
  return Number(row.id);
}

// ---------- Bağımlılık ----------

/**
 * Harcama ya da tüketim düşkünlüğü artırır. Karakter satırı çağıran işlemde kilitli olmalı.
 * Eşik aşılınca bağımlılık başlar; tanınan bir grubun üyesiyse haber olur.
 */
export async function indulge(c: pg.PoolClient, ch: CharacterRow, amount: number) {
  const now = indulgenceNow(ch.indulgence ?? 0, ch.indulgence_at ?? null, config.gameSpeed) + amount;
  const becomes = !ch.addicted_since && now >= ADDICTION_THRESHOLD;
  await c.query(
    `UPDATE characters SET indulgence = $2, indulgence_at = now(), indulged_at = now(),
            addicted_since = CASE WHEN $3 THEN now() ELSE addicted_since END WHERE id = $1`,
    [ch.id, now, becomes],
  );
  if (!becomes) return;
  await notify(c, ch.id, 'addicted', {});
  if (!ch.city_id) return;
  const fame = await one(
    c,
    `SELECT m.band_id, f.fame FROM band_members m JOIN band_fame f ON f.band_id = m.band_id AND f.city_id = $2 WHERE m.character_id = $1`,
    [ch.id, ch.city_id],
  );
  if (fame && fame.fame >= ADDICTION_SCANDAL_FAME) {
    await createScandal(c, { bandId: Number(fame.band_id), characterId: ch.id, cityId: ch.city_id, kind: 'addiction' });
  }
}

/** Tedavi düşkünlüğü azaltır; eşiğin altına inen kurtulur */
export async function treatIndulgence(c: Db, ch: CharacterRow, reduce: number) {
  const now = Math.max(0, indulgenceNow(ch.indulgence ?? 0, ch.indulgence_at ?? null, config.gameSpeed) - reduce);
  const recovered = !!ch.addicted_since && now < ADDICTION_RECOVERY;
  await c.query(
    `UPDATE characters SET indulgence = $2, indulgence_at = now(), addicted_since = CASE WHEN $3 THEN NULL ELSE addicted_since END WHERE id = $1`,
    [ch.id, now, recovered],
  );
  if (recovered) await notify(c, ch.id, 'recovered', {});
  return recovered;
}

/** Zamanlayıcı: düşkünlüğü zamanla sönen bağımlılar kendiliğinden kurtulur */
export async function processAddiction(): Promise<number> {
  const rows = await many(pool, 'SELECT id, indulgence, indulgence_at FROM characters WHERE addicted_since IS NOT NULL LIMIT 500');
  let n = 0;
  for (const r of rows) {
    if (indulgenceNow(r.indulgence, r.indulgence_at, config.gameSpeed) >= ADDICTION_RECOVERY) continue;
    const res = await pool.query('UPDATE characters SET addicted_since = NULL WHERE id = $1 AND addicted_since IS NOT NULL', [r.id]);
    if (res.rowCount) {
      await notify(pool, r.id, 'recovered', {});
      n++;
    }
  }
  return n;
}

// ---------- Hastaneye kaldırılma ----------

/**
 * Sağlığı çok düşen, boştaki karakter kendiliğinden hastaneye kaldırılır (tedavi eylemi başlar).
 * Ücret cepteki parayla sınırlıdır; doktorlar ücretsiz. Yolda ya da cezaevindeki karakter kaldırılmaz.
 */
export async function processHospitalizations(): Promise<number> {
  const cands = await many(
    pool,
    `SELECT c.id FROM characters c
      WHERE NOT c.npc AND c.dead_at IS NULL AND c.user_id IS NOT NULL AND c.health < $1 AND c.city_id IS NOT NULL
        AND (c.jailed_until IS NULL OR c.jailed_until <= now())
        AND NOT EXISTS (SELECT 1 FROM actions a WHERE a.character_id = c.id AND a.status = 'active')
      LIMIT 50`,
    [HOSPITALIZE_HEALTH],
  );
  let n = 0;
  for (const cand of cands) {
    try {
      const ok = await tx(async (c) => {
        const ch = await lockCharacter(c, cand.id);
        if (ch.health >= HOSPITALIZE_HEALTH || !ch.city_id || ch.dead_at) return false;
        if (await one(c, `SELECT 1 FROM actions WHERE character_id = $1 AND status = 'active'`, [ch.id])) return false;
        const hospital = `${ch.city_id}-hospital`;
        const cost = ch.profession === 'doctor' ? 0 : Math.min(ch.money, HOSPITAL_PRICE_PER_HOUR * HOSPITALIZE_HOURS);
        await c.query('UPDATE characters SET money = money - $2, location_id = $3 WHERE id = $1', [ch.id, cost, hospital]);
        await c.query(
          `INSERT INTO actions(character_id, kind, params, location_id, ends_at) VALUES ($1, 'treat', $2, $3, $4)`,
          [ch.id, JSON.stringify({ hours: HOSPITALIZE_HOURS, cost, forced: true }), hospital, new Date(Date.now() + hoursMs(HOSPITALIZE_HOURS))],
        );
        await addMoodlet(c, ch.id, 'hospitalized');
        await notify(c, ch.id, 'hospitalized', { cityId: ch.city_id, cost });
        return true;
      });
      if (ok) n++;
    } catch (e) {
      console.error(`karakter ${cand.id} hastaneye kaldırılamadı`, e);
    }
  }
  return n;
}

// ---------- Ölüm (yalnızca PERMADEATH=1) ----------

/**
 * Karakteri öldürür: gruptan, işletmeden, makamdan, ilişkiden ayrılır; kullanıcıdan koparılır (kullanıcı yeni karakter açar).
 * Paranın ve banka hesabının yarısı (en fazla $10.000) yeni karaktere miras kalır; para basılmaz, yalnızca taşınır.
 */
export async function killCharacter(c: pg.PoolClient, characterId: number, cause: 'neglect' | 'old_age') {
  const ch = await lockCharacter(c, characterId);
  if (ch.dead_at || ch.npc) return false;
  await c.query(`UPDATE actions SET status = 'cancelled', result = '{"died":true}' WHERE character_id = $1 AND status = 'active'`, [ch.id]);
  // Grup: liderlik devredilir ya da grup dağılır
  const m = await one(c, 'SELECT m.band_id, b.leader_id FROM band_members m JOIN bands b ON b.id = m.band_id WHERE m.character_id = $1', [ch.id]);
  if (m) {
    await c.query('DELETE FROM band_members WHERE character_id = $1', [ch.id]);
    const rest = await many(c, 'SELECT character_id FROM band_members WHERE band_id = $1 ORDER BY joined_at', [m.band_id]);
    if (!rest.length) await c.query('DELETE FROM bands WHERE id = $1', [m.band_id]);
    else {
      if (Number(m.leader_id) === ch.id) await c.query('UPDATE bands SET leader_id = $2 WHERE id = $1', [m.band_id, rest[0].character_id]);
      for (const r of rest) await notify(c, Number(r.character_id), 'member_died', { name: ch.name });
    }
  }
  // İşletme: kasadaki para mirasa girer, çalışanlar işsiz kalır
  const biz = await one(c, 'SELECT location_id, till FROM businesses WHERE owner_id = $1 FOR UPDATE', [ch.id]);
  let estate = ch.money + (ch.bank ?? 0);
  if (biz) {
    estate += biz.till;
    for (const s of await many(c, `SELECT character_id FROM business_staff WHERE location_id = $1 AND status = 'hired'`, [biz.location_id])) {
      await notify(c, Number(s.character_id), 'job_lost', { locationId: biz.location_id, reason: 'closed' });
    }
    await c.query('DELETE FROM businesses WHERE location_id = $1', [biz.location_id]);
  }
  await c.query('DELETE FROM business_staff WHERE character_id = $1', [ch.id]);
  await c.query(`UPDATE trades SET status = 'cancelled', closed_at = now() WHERE (from_id = $1 OR to_id = $1) AND status = 'open'`, [ch.id]);
  await c.query(`UPDATE listings SET status = 'cancelled', closed_at = now() WHERE seller_id = $1 AND status = 'active'`, [ch.id]);
  await c.query('DELETE FROM homes WHERE character_id = $1', [ch.id]);
  await c.query('DELETE FROM office_holders WHERE character_id = $1', [ch.id]);
  await c.query(`DELETE FROM election_candidates WHERE character_id = $1`, [ch.id]);
  const partner = await one(c, 'SELECT partner_id FROM partners WHERE character_id = $1', [ch.id]);
  if (partner) {
    await c.query('DELETE FROM partners WHERE character_id = ANY($1::bigint[])', [[ch.id, Number(partner.partner_id)]]);
    await addMoodlet(c, Number(partner.partner_id), 'heartbreak');
    await notify(c, Number(partner.partner_id), 'partner_died', { name: ch.name });
  }
  await c.query(`UPDATE gigs SET status = 'cancelled' WHERE status = 'scheduled' AND band_id IN (SELECT id FROM bands WHERE leader_id = $1)`, [ch.id]);
  const inherited = Math.min(INHERITANCE_CAP, Math.floor(estate * INHERITANCE_SHARE));
  await c.query(
    `UPDATE characters SET dead_at = now(), death_cause = $2, former_user_id = user_id, user_id = NULL, money = 0, bank = 0,
            city_id = NULL, location_id = NULL, jailed_until = NULL, inherited = $3 WHERE id = $1`,
    [ch.id, cause, inherited],
  );
  return true;
}

/** Zamanlayıcı: kritik sağlıkta uzun süre kalan ve çok yaşlı karakterler (yalnızca PERMADEATH=1) */
export async function processMortality(rand: () => number = Math.random): Promise<number> {
  // Kritik sağlık sayacı her zaman tutulur (bayrak kapalıyken yalnızca bilgi içindir)
  await pool.query(`UPDATE characters SET critical_since = now() WHERE critical_since IS NULL AND health < $1 AND dead_at IS NULL AND NOT npc`, [CRITICAL_HEALTH]);
  await pool.query(`UPDATE characters SET critical_since = NULL WHERE critical_since IS NOT NULL AND health >= $1`, [CRITICAL_HEALTH]);
  if (!config.permadeath) return 0;
  let n = 0;
  const neglected = await many(
    pool,
    `SELECT id FROM characters WHERE dead_at IS NULL AND NOT npc AND critical_since IS NOT NULL AND critical_since < $1 LIMIT 20`,
    [new Date(Date.now() - hoursMs(NEGLECT_DEATH_HOURS))],
  );
  for (const r of neglected) {
    try {
      if (await tx((c) => killCharacter(c, r.id, 'neglect'))) n++;
    } catch (e) {
      console.error(`karakter ${r.id} ölüm işlenemedi`, e);
    }
  }
  // Yaşlılık: en fazla oyun gününde bir zar
  if (!config.agingEnabled) return n;
  const old = await many(
    pool,
    `SELECT id, created_at FROM characters
      WHERE dead_at IS NULL AND NOT npc AND user_id IS NOT NULL AND created_at < $1 AND (life_checked_at IS NULL OR life_checked_at < $2) LIMIT 200`,
    [new Date(Date.now() - (OLD_AGE_START - START_AGE) * GAME_YEAR_DAYS * dayMs()), new Date(Date.now() - dayMs())],
  );
  for (const r of old) {
    await pool.query('UPDATE characters SET life_checked_at = now() WHERE id = $1', [r.id]);
    if (rand() >= oldAgeDeathChancePerDay(characterAge(r.created_at))) continue;
    try {
      if (await tx((c) => killCharacter(c, r.id, 'old_age'))) n++;
    } catch (e) {
      console.error(`karakter ${r.id} ölüm işlenemedi`, e);
    }
  }
  return n;
}

/** Kullanıcının son ölen karakteri ve devredilecek miras (yeni karakter açarken) */
export async function lastDeath(db: Db, userId: number) {
  const r = await one(
    db,
    'SELECT id, name, death_cause, dead_at, inherited FROM characters WHERE former_user_id = $1 ORDER BY dead_at DESC LIMIT 1',
    [userId],
  );
  return r ? { characterId: Number(r.id), name: r.name as string, cause: r.death_cause as string, at: r.dead_at.toISOString() as string, inheritance: r.inherited as number } : null;
}
