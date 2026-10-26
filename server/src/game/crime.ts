// Suç, soruşturma, mahkeme ve cezaevi.
// Akış: suç işlenir → başarısızsa suç üstü yakalanır, başarılıysa "faili meçhul" kalır →
// polis soruşturmayla faili bulabilir → şüpheli tutuklanır ve dava açılır →
// yargıç karar verir ya da süre dolunca mahkeme normal cezayı verir → ceza bitince ya da kefaletle çıkılır.

import {
  ARREST_BONUS,
  CASE_HOURS,
  CITY_BY_ID,
  COLD_CASE_DAYS,
  CRIME_BY_ID,
  type CaseDto,
  type CrimeOptionsResponse,
  type JusticeResponse,
  LOCATION_BY_ID,
  PROFESSION_BY_ID,
  RULING_BONUS,
  SEVERITY_MULT,
  type Severity,
  type Skills,
  bailCost,
  careerPay,
  clamp,
  crimeChance,
  crimesAt,
  diminishing,
  gameHoursToMs,
  isPolice,
  knows,
  lv,
  rankFor,
  solveChance,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one, pool, tx } from '../db';
import { createScandal } from './consequences';
import { fail } from '../errors';
import { evaluateAchievements } from './achievements';
import { type CharacterRow, activeAction, getCharacter, isJailed, lockCharacter, notify, notifySkillUps } from './common';

const hoursMs = (h: number) => gameHoursToMs(h, config.gameSpeed);
export const prisonOf = (cityId: string) => `${cityId}-prison`;

/** Son 12 oyun saatinde emniyette mesai yapan ya da soruşturan polis sayısı */
export async function policeOnDuty(db: Db, cityId: string): Promise<number> {
  const r = await one(
    db,
    `SELECT count(DISTINCT a.character_id)::int AS n FROM actions a JOIN characters c ON c.id = a.character_id
      WHERE a.location_id = $1 AND a.kind IN ('work', 'investigate') AND a.status <> 'cancelled'
        AND a.ends_at >= $2 AND c.profession IN ('police', 'agent', 'swat')`,
    [`${cityId}-police`, new Date(Date.now() - hoursMs(12))],
  );
  return r?.n ?? 0;
}

function crimeBlocker(skills: Skills, crimeId: string): string | null {
  const def = CRIME_BY_ID[crimeId];
  if (!def) return 'invalid_crime';
  if (def.requires && lv(skills, def.requires.skill) < def.requires.min) return 'skill_too_low';
  return null;
}

export async function crimeOptions(characterId: number, locationId: string): Promise<CrimeOptionsResponse> {
  const ch = await getCharacter(pool, characterId);
  const loc = LOCATION_BY_ID[locationId];
  if (!loc) fail('invalid_location', 404);
  const city = CITY_BY_ID[loc!.cityId];
  const police = await policeOnDuty(pool, loc!.cityId);
  return {
    locationId,
    policeOnDuty: police,
    options: crimesAt(loc!.type).map((def) => ({
      id: def.id,
      chance: Math.round(crimeChance(def, ch.skills, police) * 100) / 100,
      loot: [Math.round(def.loot[0] * city.costMult), Math.round(def.loot[1] * city.costMult)],
      sentenceHours: def.sentenceHours,
      hours: def.hours,
      blocked: crimeBlocker(ch.skills, def.id),
    })),
  };
}

// ---------- Eylemler (actions.ts çağırır) ----------

/** 'crime' eylemini başlatırken: kontroller ve parametreler */
export async function prepareCrime(c: Db, char: CharacterRow, crimeId: string, locationId: string) {
  const def = CRIME_BY_ID[crimeId];
  if (!def) fail('invalid_crime');
  const loc = LOCATION_BY_ID[locationId];
  if (!loc || !def!.zones.includes(loc.type)) fail('invalid_location');
  if (loc!.cityId !== char.city_id) fail('not_in_city');
  const block = crimeBlocker(char.skills, crimeId);
  if (block) fail(block);
  const police = await policeOnDuty(c, char.city_id!);
  return { hours: def!.hours, locationId: loc!.id, params: { crime: crimeId, chance: crimeChance(def!, char.skills, police) } };
}

/** 'investigate' eylemini başlatırken */
export function prepareInvestigation(char: CharacterRow, locationId: string, isVip: boolean) {
  const loc = LOCATION_BY_ID[locationId];
  if (!loc || loc.type !== 'police') fail('invalid_location');
  if (loc!.cityId !== char.city_id) fail('not_in_city');
  if (!isPolice(char.profession)) fail('not_police', 403);
  const prof = PROFESSION_BY_ID[char.profession!];
  if (prof.vip && !isVip) fail('vip_required', 403);
  return { locationId: loc!.id };
}

/** Bir karakteri tutuklar: süren eylemi biter, cezaevine konur. */
async function jail(c: Db, suspectId: number, cityId: string, until: Date) {
  await c.query(
    `UPDATE actions SET status = 'cancelled', result = '{"jailed":true}' WHERE character_id = $1 AND status = 'active' AND kind <> 'travel'`,
    [suspectId],
  );
  await c.query('UPDATE characters SET jailed_until = $2, location_id = $3 WHERE id = $1', [suspectId, until, prisonOf(cityId)]);
}

/**
 * Tutukluluk, dava sonuçlanana kadar sürer. jailed_until dava tarihinin bir gün sonrasına yazılır ki
 * zamanlayıcı davayı işleyene kadar şüpheli kendiliğinden serbest kalmasın; karar gerçek süreyi yazar.
 */
const custodyUntil = (due: Date) => new Date(due.getTime() + hoursMs(24));

async function openCase(c: Db, crimeId: number, suspectId: number, cityId: string, arrestedBy: number | null) {
  const due = new Date(Date.now() + hoursMs(CASE_HOURS));
  const row = await one(
    c,
    'INSERT INTO cases(crime_id, suspect_id, city_id, arrested_by, due_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [crimeId, suspectId, cityId, arrestedBy, due],
  );
  return { caseId: row.id as number, due };
}

/**
 * Suç eyleminin sonucu. Karakterin satırı çağıran tarafından kilitlenmiş ve güncellenecektir:
 * para ve beceri değişiklikleri döndürülür, yakalanma durumunda konum ve tutukluluk sonradan yazılır.
 */
export async function resolveCrime(c: pg.PoolClient, char: CharacterRow, params: Record<string, any>, skills: Skills, rand = Math.random) {
  const def = CRIME_BY_ID[params.crime];
  const city = CITY_BY_ID[char.city_id!];
  const success = rand() < (params.chance as number);
  const result: Record<string, unknown> = { crime: def.id, success };
  // Deneyim: başarısız olsa da öğrenir
  for (const id of def.skills) {
    if (knows(skills, id)) skills[id] = clamp(skills[id] + (success ? 0.4 : 0.2) * def.hours * diminishing(skills[id]), 0, 100);
  }
  if (!knows(skills, 'street_smarts')) skills.street_smarts = 1;

  let loot = 0;
  if (success) {
    loot = Math.round((def.loot[0] + rand() * (def.loot[1] - def.loot[0])) * city.costMult);
    result.loot = loot;
  }
  const crime = await one(
    c,
    `INSERT INTO crimes(character_id, city_id, location_id, kind, success, loot, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [char.id, char.city_id, char.location_id, def.id, success, loot, success ? 'unsolved' : 'caught'],
  );
  let jailUntil: Date | null = null;
  if (!success) {
    const { caseId, due } = await openCase(c, crime.id, char.id, char.city_id!, null);
    jailUntil = custodyUntil(due);
    result.caseId = caseId;
    result.caught = true;
  }
  return { loot, jailUntil, result };
}

/** Soruşturmanın sonucu: polisin kendi satırı çağıran tarafından güncellenir. */
export async function resolveInvestigation(c: pg.PoolClient, officer: CharacterRow, hours: number, skills: Skills, rand = Math.random) {
  const city = CITY_BY_ID[officer.city_id!];
  const prof = PROFESSION_BY_ID[officer.profession!];
  const result: Record<string, unknown> = { solved: false };
  // Soruşturma da mesai sayılır ama ücreti yarımdır; asıl kazanç faili bulunca gelen ikramiyedir
  let pay = prof ? Math.floor(careerPay(prof, officer.career_rank, city.costMult) * hours * 0.5) : 0;
  for (const [id, amount] of [['investigation', 0.4], ['law', 0.15]] as const) {
    if (knows(skills, id)) skills[id] = clamp(skills[id] + amount * hours * diminishing(skills[id]), 0, 100);
  }

  const lead = await one(
    c,
    `SELECT cr.id, cr.kind, cr.character_id, ch.skills
       FROM crimes cr JOIN characters ch ON ch.id = cr.character_id
      WHERE cr.city_id = $1 AND cr.status = 'unsolved' AND cr.created_at >= $2 AND cr.character_id <> $3
        AND ch.city_id = $1 AND (ch.jailed_until IS NULL OR ch.jailed_until <= now())
      ORDER BY cr.created_at LIMIT 1 FOR UPDATE OF cr, ch SKIP LOCKED`,
    [officer.city_id, new Date(Date.now() - hoursMs(COLD_CASE_DAYS * 24)), officer.id],
  );
  if (!lead) {
    result.noLeads = true;
  } else if (rand() < solveChance(skills, officer.profession!, lead.skills)) {
    await c.query(`UPDATE crimes SET status = 'solved', solved_by = $2 WHERE id = $1`, [lead.id, officer.id]);
    const { caseId, due } = await openCase(c, lead.id, lead.character_id, officer.city_id!, officer.id);
    await jail(c, lead.character_id, officer.city_id!, custodyUntil(due));
    await notify(c, lead.character_id, 'arrested', { caseId, crime: lead.kind, officer: officer.name, cityId: officer.city_id });
    await evaluateAchievements(c, lead.character_id);
    const bonus = Math.round(ARREST_BONUS * city.costMult);
    pay += bonus;
    result.solved = true;
    result.crime = lead.kind;
    result.bonus = bonus;
    result.caseId = caseId;
  }
  result.pay = pay;

  let careerHours = officer.career_hours + hours;
  let careerRank = rankFor(careerHours);
  if (careerRank > officer.career_rank) {
    result.promoted = careerRank;
    await notify(c, officer.id, 'promotion', { profession: officer.profession, rank: careerRank });
  }
  return { pay, careerHours, careerRank, result };
}

// ---------- Mahkeme ----------

async function convict(c: Db, kase: any, sentenceHours: number, judgeId: number | null) {
  const until = new Date(Date.now() + hoursMs(sentenceHours));
  const crime = await one(c, 'SELECT loot FROM crimes WHERE id = $1', [kase.crime_id]);
  const suspect = await lockCharacter(c, kase.suspect_id);
  // Çalınan para geri alınır (cebinde ne kaldıysa)
  const fine = Math.min(suspect.money, crime?.loot ?? 0);
  await c.query(
    `UPDATE actions SET status = 'cancelled', result = '{"jailed":true}' WHERE character_id = $1 AND status = 'active' AND kind <> 'travel'`,
    [suspect.id],
  );
  await c.query(
    `UPDATE characters SET jailed_until = $2, location_id = $3, convictions = convictions + 1, money = money - $4 WHERE id = $1`,
    [suspect.id, until, prisonOf(kase.city_id), fine],
  );
  await c.query(`UPDATE cases SET status = 'convicted', sentence_hours = $2, judge_id = $3, decided_at = now() WHERE id = $1`, [
    kase.id,
    sentenceHours,
    judgeId,
  ]);
  await notify(c, suspect.id, 'convicted', { caseId: kase.id, sentenceHours, fine, until: until.toISOString() });
  const band = await one(c, 'SELECT band_id FROM band_members WHERE character_id = $1', [suspect.id]);
  if (band) await createScandal(c, { bandId: Number(band.band_id), characterId: suspect.id, cityId: kase.city_id, kind: 'conviction' });
  await evaluateAchievements(c, suspect.id);
}

async function acquit(c: Db, kase: any, judgeId: number) {
  await c.query('UPDATE characters SET jailed_until = NULL, location_id = NULL WHERE id = $1', [kase.suspect_id]);
  await c.query(`UPDATE cases SET status = 'acquitted', judge_id = $2, decided_at = now() WHERE id = $1`, [kase.id, judgeId]);
  // Dosya kapanır: aynı suç için tekrar ikramiye alınamasın diye yeniden açılmaz
  await notify(c, kase.suspect_id, 'acquitted', { caseId: kase.id });
}

/** Yargıç kararı */
export async function ruleCase(judgeId: number, caseId: number, verdict: 'guilty' | 'innocent', severity: Severity, isVip: boolean) {
  return tx(async (c) => {
    const peek = await one(c, 'SELECT suspect_id FROM cases WHERE id = $1', [caseId]);
    if (!peek) fail('not_found', 404);
    // Kilitlenme olmasın diye iki karakter her zaman kimlik sırasıyla kilitlenir
    for (const id of [judgeId, peek.suspect_id].sort((a, b) => a - b)) await lockCharacter(c, id);
    const judge = await lockCharacter(c, judgeId);
    if (judge.profession !== 'judge') fail('not_judge', 403);
    if (await activeAction(c, judgeId)) fail('busy', 409);
    if (!isVip) fail('vip_required', 403);
    if (isJailed(judge)) fail('in_jail', 409);
    const kase = await one(c, 'SELECT * FROM cases WHERE id = $1 FOR UPDATE', [caseId]);
    if (!kase) fail('not_found', 404);
    if (kase.status !== 'pending') fail('case_closed', 409);
    if (kase.city_id !== judge.city_id) fail('not_in_city');
    if (kase.suspect_id === judge.id) fail('own_case', 403);
    if (!(severity in SEVERITY_MULT)) fail('invalid_severity');

    const crime = await one(c, 'SELECT kind FROM crimes WHERE id = $1', [kase.crime_id]);
    if (verdict === 'guilty') {
      const hours = CRIME_BY_ID[crime.kind].sentenceHours * SEVERITY_MULT[severity];
      await convict(c, kase, hours, judge.id);
    } else {
      await acquit(c, kase, judge.id);
    }
    const city = CITY_BY_ID[judge.city_id!];
    const bonus = Math.round(RULING_BONUS * city.costMult);
    const skills = { ...judge.skills };
    if (knows(skills, 'law')) skills.law = clamp(skills.law + 0.5 * diminishing(skills.law), 0, 100);
    const careerHours = judge.career_hours + 1;
    const careerRank = rankFor(careerHours);
    await c.query('UPDATE characters SET money = money + $2, skills = $3, career_hours = $4, career_rank = $5 WHERE id = $1', [
      judge.id,
      bonus,
      JSON.stringify(skills),
      careerHours,
      careerRank,
    ]);
    if (careerRank > judge.career_rank) await notify(c, judge.id, 'promotion', { profession: 'judge', rank: careerRank });
    await notifySkillUps(c, judge.id, judge.skills, skills);
    await evaluateAchievements(c, judge.id);
    return { ok: true, bonus };
  });
}

/** Zamanlayıcı: süresi dolan davalara normal ceza, cezası biten mahkûmların tahliyesi. */
export async function processJustice(): Promise<number> {
  let n = 0;
  for (;;) {
    const done = await tx(async (c) => {
      const kase = await one(c, `SELECT * FROM cases WHERE status = 'pending' AND due_at <= now() ORDER BY due_at LIMIT 1 FOR UPDATE SKIP LOCKED`);
      if (!kase) return false;
      const crime = await one(c, 'SELECT kind FROM crimes WHERE id = $1', [kase.crime_id]);
      await convict(c, kase, CRIME_BY_ID[crime.kind].sentenceHours, null);
      return true;
    });
    if (!done) break;
    n++;
  }
  const released = await tx(async (c) => {
    const rows = await many(
      c,
      `UPDATE characters ch SET jailed_until = NULL,
              location_id = CASE WHEN ch.location_id LIKE '%-prison' THEN NULL ELSE ch.location_id END
        WHERE ch.jailed_until IS NOT NULL AND ch.jailed_until <= now()
          AND NOT EXISTS (SELECT 1 FROM cases k WHERE k.suspect_id = ch.id AND k.status = 'pending')
        RETURNING ch.id`,
    );
    for (const r of rows) await notify(c, r.id, 'released', {});
    return rows.length;
  });
  return n + released;
}

/** Hüküm giymiş mahkûm kalan cezası için kefalet öder (tutukluyken ödenemez). */
export async function payBail(characterId: number) {
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    if (!isJailed(ch)) fail('not_jailed', 409);
    const pending = await one(c, `SELECT 1 FROM cases WHERE suspect_id = $1 AND status = 'pending'`, [characterId]);
    if (pending) fail('awaiting_trial', 409);
    const remaining = (ch.jailed_until!.getTime() - Date.now()) / hoursMs(1);
    const cost = bailCost(remaining, CITY_BY_ID[ch.city_id!]?.costMult ?? 1);
    if (ch.money < cost) fail('not_enough_money');
    await c.query('UPDATE characters SET money = money - $2, jailed_until = NULL, location_id = NULL WHERE id = $1', [characterId, cost]);
    return { ok: true, cost };
  });
}

export async function bailQuote(ch: CharacterRow): Promise<number | null> {
  if (!isJailed(ch)) return null;
  const pending = await one(pool, `SELECT 1 FROM cases WHERE suspect_id = $1 AND status = 'pending'`, [ch.id]);
  if (pending) return null;
  return bailCost((ch.jailed_until!.getTime() - Date.now()) / hoursMs(1), CITY_BY_ID[ch.city_id!]?.costMult ?? 1);
}

export async function inCustody(db: Db, characterId: number) {
  return !!(await one(db, `SELECT 1 FROM cases WHERE suspect_id = $1 AND status = 'pending'`, [characterId]));
}

const toCaseDto = (r: any): CaseDto => ({
  id: r.id,
  cityId: r.city_id,
  crime: r.crime,
  suspectId: r.suspect_id,
  suspectName: r.suspect_name,
  status: r.status,
  arrestedBy: r.arrested_by_name ?? null,
  judgeName: r.judge_name ?? null,
  sentenceHours: r.sentence_hours ?? null,
  createdAt: r.created_at.toISOString(),
  dueAt: r.due_at.toISOString(),
  decidedAt: r.decided_at ? r.decided_at.toISOString() : null,
});

const CASE_SELECT = `SELECT k.*, cr.kind AS crime, s.name AS suspect_name, o.name AS arrested_by_name, j.name AS judge_name
  FROM cases k JOIN crimes cr ON cr.id = k.crime_id JOIN characters s ON s.id = k.suspect_id
  LEFT JOIN characters o ON o.id = k.arrested_by LEFT JOIN characters j ON j.id = k.judge_id`;

export async function justice(cityId: string): Promise<JusticeResponse> {
  if (!CITY_BY_ID[cityId]) fail('not_found', 404);
  const [unsolved, police, pending, recent, inmates] = await Promise.all([
    one(pool, `SELECT count(*)::int AS n FROM crimes WHERE city_id = $1 AND status = 'unsolved' AND created_at >= $2`, [
      cityId,
      new Date(Date.now() - hoursMs(COLD_CASE_DAYS * 24)),
    ]),
    policeOnDuty(pool, cityId),
    many(pool, `${CASE_SELECT} WHERE k.city_id = $1 AND k.status = 'pending' ORDER BY k.due_at`, [cityId]),
    many(pool, `${CASE_SELECT} WHERE k.city_id = $1 AND k.status <> 'pending' ORDER BY k.decided_at DESC LIMIT 15`, [cityId]),
    many(
      pool,
      `SELECT c.id, c.name, c.avatar_color, c.jailed_until,
              EXISTS (SELECT 1 FROM cases k WHERE k.suspect_id = c.id AND k.status = 'pending') AS in_custody
         FROM characters c WHERE c.location_id = $1 AND c.jailed_until > now() ORDER BY c.jailed_until`,
      [prisonOf(cityId)],
    ),
  ]);
  return {
    cityId,
    unsolvedCount: unsolved?.n ?? 0,
    policeOnDuty: police,
    pendingCases: pending.map(toCaseDto),
    recentCases: recent.map(toCaseDto),
    inmates: inmates.map((r) => ({
      characterId: r.id,
      name: r.name,
      avatarColor: r.avatar_color,
      until: r.jailed_until.toISOString(),
      inCustody: r.in_custody,
    })),
  };
}
