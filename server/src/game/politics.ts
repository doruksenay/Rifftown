// Seçimler ve siyasi makamlar. Aday olmak ve oy vermek sadece VIP üyelere açıktır.
// Her şehirde her makam için sürekli bir seçim dönemi açıktır; dönem bitince en çok oyu alan makama gelir.

import { CITIES, CITY_BY_ID, ELECTION_DAYS, OFFICES, OFFICE_BY_ID, gameHoursToMs, unmetRequirement } from '@rifftown/shared';
import { config } from '../config';
import { type Db, many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { avatarUrl, characterIsVip, getCharacter, notify } from './common';

const dayMs = () => gameHoursToMs(24, config.gameSpeed);

/** Açık seçimi olmayan her şehir ve makam için yeni dönem başlatır. */
export async function ensureElections() {
  const endsAt = new Date(Date.now() + gameHoursToMs(ELECTION_DAYS * 24, config.gameSpeed));
  const cities: string[] = [];
  const offices: string[] = [];
  for (const city of CITIES) for (const office of OFFICES) {
    cities.push(city.id);
    offices.push(office.id);
  }
  // Tek sorguda: açık seçimi olmayan tüm şehir × makam çiftleri için yeni dönem
  await pool.query(
    `INSERT INTO elections(city_id, office, ends_at)
     SELECT c, o, $3 FROM unnest($1::text[], $2::text[]) AS t(c, o)
     ON CONFLICT (city_id, office) WHERE status = 'open' DO NOTHING`,
    [cities, offices, endsAt],
  );
}

/** Süresi dolan seçimleri sonuçlandırır. */
export async function closeDueElections(): Promise<number> {
  let closed = 0;
  for (;;) {
    const done = await tx(async (c) => {
      const e = await one(
        c,
        `SELECT * FROM elections WHERE status = 'open' AND ends_at <= now() ORDER BY ends_at LIMIT 1 FOR UPDATE SKIP LOCKED`,
      );
      if (!e) return false;
      const ranked = await many(
        c,
        `SELECT cand.character_id, count(v.voter_id)::int AS votes, cand.created_at
           FROM election_candidates cand
           LEFT JOIN election_votes v ON v.election_id = cand.election_id AND v.candidate_id = cand.character_id
          WHERE cand.election_id = $1
          GROUP BY cand.character_id, cand.created_at
          ORDER BY votes DESC, cand.created_at ASC`,
        [e.id],
      );
      const winner = ranked[0];
      await c.query(`UPDATE elections SET status = 'closed', winner_id = $2 WHERE id = $1`, [e.id, winner?.character_id ?? null]);
      if (winner) {
        const prev = await one(c, 'SELECT character_id FROM office_holders WHERE city_id = $1 AND office = $2', [e.city_id, e.office]);
        await c.query(
          `INSERT INTO office_holders(city_id, office, character_id, since, last_paid_at) VALUES ($1, $2, $3, now(), now())
           ON CONFLICT (city_id, office) DO UPDATE SET character_id = EXCLUDED.character_id, since = now(), last_paid_at = now(),
             announcement = CASE WHEN office_holders.character_id = EXCLUDED.character_id THEN office_holders.announcement ELSE NULL END`,
          [e.city_id, e.office, winner.character_id],
        );
        for (const r of ranked) {
          await notify(c, r.character_id, r.character_id === winner.character_id ? 'election_won' : 'election_lost', {
            cityId: e.city_id,
            office: e.office,
            votes: r.votes,
          });
        }
        if (prev && prev.character_id !== winner.character_id && !ranked.some((r) => r.character_id === prev.character_id)) {
          await notify(c, prev.character_id, 'office_lost', { cityId: e.city_id, office: e.office });
        }
      }
      // Aday çıkmazsa mevcut makam sahibi görevine devam eder
      return true;
    });
    if (!done) break;
    closed++;
  }
  return closed;
}

/** Makam sahiplerine her oyun günü için maaş öder. */
export async function payOfficeSalaries(): Promise<number> {
  const day = dayMs();
  return tx(async (c) => {
    // Kilitli satırları atla: aynı anda çalışan başka bir zamanlayıcı aynı maaşı iki kez ödeyemez
    const due = await many(
      c,
      `SELECT city_id, office, character_id,
              floor(extract(epoch FROM (now() - last_paid_at)) * 1000 / $1)::int AS days
         FROM office_holders
        WHERE last_paid_at <= now() - ($1::double precision * interval '1 millisecond')
        FOR UPDATE SKIP LOCKED`,
      [day],
    );
    for (const h of due) {
      const office = OFFICE_BY_ID[h.office];
      if (!office || h.days < 1) continue;
      await c.query(
        `UPDATE office_holders SET last_paid_at = last_paid_at + ($3::double precision * interval '1 millisecond')
          WHERE city_id = $1 AND office = $2`,
        [h.city_id, h.office, h.days * day],
      );
      await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [h.character_id, office.salaryPerDay * h.days]);
    }
    return due.length;
  });
}

// ---------- Oyuncu işlemleri ----------

async function openElection(db: Db, electionId: number) {
  const e = await one(db, `SELECT * FROM elections WHERE id = $1 FOR UPDATE`, [electionId]);
  if (!e) fail('not_found', 404);
  if (e.status !== 'open' || new Date(e.ends_at).getTime() <= Date.now()) fail('election_closed');
  return e;
}

export async function runForOffice(characterId: number, electionId: number, platform: string, isVip: boolean) {
  if (!isVip) fail('vip_required', 403);
  return tx(async (c) => {
    const e = await openElection(c, electionId);
    const ch = await getCharacter(c, characterId);
    if (ch.city_id !== e.city_id) fail('not_in_city');
    const office = OFFICE_BY_ID[e.office];
    if (unmetRequirement(office, ch.skills)) fail('requirements_not_met');
    const already = await one(c, 'SELECT 1 FROM election_candidates WHERE election_id = $1 AND character_id = $2', [e.id, characterId]);
    if (already) fail('already_candidate', 409);
    await c.query('INSERT INTO election_candidates(election_id, character_id, platform) VALUES ($1, $2, $3)', [
      e.id,
      characterId,
      platform.trim().slice(0, 200),
    ]);
    return { ok: true };
  });
}

export async function vote(characterId: number, electionId: number, candidateId: number, isVip: boolean) {
  if (!isVip) fail('vip_required', 403);
  return tx(async (c) => {
    const e = await openElection(c, electionId);
    const ch = await getCharacter(c, characterId);
    if (ch.city_id !== e.city_id) fail('not_in_city');
    const cand = await one(c, 'SELECT 1 FROM election_candidates WHERE election_id = $1 AND character_id = $2', [e.id, candidateId]);
    if (!cand) fail('not_a_candidate', 404);
    const r = await c.query(
      'INSERT INTO election_votes(election_id, voter_id, candidate_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [e.id, characterId, candidateId],
    );
    if (!r.rowCount) fail('already_voted', 409);
    return { ok: true };
  });
}

export async function setAnnouncement(characterId: number, cityId: string, text: string) {
  if (!CITY_BY_ID[cityId]) fail('not_found', 404);
  const r = await pool.query(
    `UPDATE office_holders SET announcement = NULLIF($3, '') WHERE city_id = $1 AND office = 'mayor' AND character_id = $2`,
    [cityId, characterId, text.trim().slice(0, 300)],
  );
  if (!r.rowCount) fail('not_mayor', 403);
  return { ok: true };
}

export async function civicInfo(cityId: string, viewerId: number) {
  if (!CITY_BY_ID[cityId]) fail('not_found', 404);
  const isVip = await characterIsVip(pool, viewerId);
  const holders = await many(
    pool,
    `SELECT h.*, c.name, c.avatar_color, c.avatar_version FROM office_holders h JOIN characters c ON c.id = h.character_id WHERE h.city_id = $1`,
    [cityId],
  );
  const elections = await many(pool, `SELECT * FROM elections WHERE city_id = $1 AND status = 'open' ORDER BY office`, [cityId]);
  const out = [];
  for (const e of elections) {
    const cands = await many(
      pool,
      `SELECT cand.character_id, cand.platform, c.name, c.avatar_color, count(v.voter_id)::int AS votes
         FROM election_candidates cand JOIN characters c ON c.id = cand.character_id
         LEFT JOIN election_votes v ON v.election_id = cand.election_id AND v.candidate_id = cand.character_id
        WHERE cand.election_id = $1
        GROUP BY cand.character_id, cand.platform, c.name, c.avatar_color, cand.created_at
        ORDER BY cand.created_at`,
      [e.id],
    );
    const my = await one(pool, 'SELECT candidate_id FROM election_votes WHERE election_id = $1 AND voter_id = $2', [e.id, viewerId]);
    out.push({
      id: e.id,
      cityId: e.city_id,
      office: e.office,
      endsAt: new Date(e.ends_at).toISOString(),
      candidates: cands.map((k) => ({
        characterId: k.character_id,
        name: k.name,
        avatarColor: k.avatar_color,
        platform: k.platform,
        // Ara sonuçları sadece VIP üyeler görür
        votes: isVip ? k.votes : null,
      })),
      myVote: my?.candidate_id ?? null,
      amCandidate: cands.some((k) => k.character_id === viewerId),
    });
  }
  return {
    cityId,
    holders: holders.map((h) => ({
      cityId: h.city_id,
      office: h.office,
      characterId: h.character_id,
      name: h.name,
      avatarColor: h.avatar_color,
      avatarUrl: avatarUrl(h.character_id, h.avatar_version),
      since: new Date(h.since).toISOString(),
      announcement: h.announcement,
    })),
    elections: out,
  };
}
