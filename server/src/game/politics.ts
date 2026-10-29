// Seçimler ve siyasi makamlar. Aday olmak ve oy vermek sadece VIP üyelere açıktır.
// Her şehirde her makam için sürekli bir seçim dönemi açıktır; dönem bitince en çok oyu alan makama gelir.
// Makam yetkileri (civic-powers.ts): her makamın şehirde dar ve tavanlı tek bir kararı vardır. Karar yalnızca onu veren
// makam sahibi görevdeyken geçerlidir; makam el değiştirince (seçim, ölüm, emeklilik) varsayılana döner ve kaydedilir.

import {
  cleanText,
  maskProfanity,
  CITIES,
  CITY_BY_ID,
  ELECTION_DAYS,
  OFFICES,
  OFFICE_BY_ID,
  POLICIES,
  POLICY_CHANGE_COOLDOWN_HOURS,
  type OfficeId,
  clampPolicy,
  gameHoursToMs,
  officeSalary,
  policyNews,
  unmetRequirement,
} from '@rifftown/shared';
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
        `SELECT cand.character_id, count(v.voter_id)::int AS votes, cand.created_at, ch.npc
           FROM election_candidates cand JOIN characters ch ON ch.id = cand.character_id
           LEFT JOIN election_votes v ON v.election_id = cand.election_id AND v.candidate_id = cand.character_id
          WHERE cand.election_id = $1
          GROUP BY cand.character_id, cand.created_at, ch.npc
          ORDER BY votes DESC, ch.npc ASC, cand.created_at ASC`,
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
        // Makam el değiştirdiyse önceki sahibin kararı varsayılana döner (kayıt ve şehir haberiyle)
        if (prev && Number(prev.character_id) !== Number(winner.character_id)) await resetPolicy(c, e.city_id, e.office, Number(prev.character_id));
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
      `SELECT h.city_id, h.office, h.character_id, ch.npc, p.level AS policy_level,
              floor(extract(epoch FROM (now() - h.last_paid_at)) * 1000 / $1)::int AS days
         FROM office_holders h JOIN characters ch ON ch.id = h.character_id
         LEFT JOIN city_policies p ON p.city_id = h.city_id AND p.office = h.office AND p.holder_id = h.character_id
        WHERE h.last_paid_at <= now() - ($1::double precision * interval '1 millisecond')
        FOR UPDATE OF h SKIP LOCKED`,
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
      // Oyunun kendi makam sahipleri maaş almaz (para basılmasın). Karar maaşı hiç artırmaz; valinin indirimi maaşından düşer.
      const salary = officeSalary(office.salaryPerDay, office.id, Number(h.policy_level ?? 0));
      if (!h.npc) await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [h.character_id, salary * h.days]);
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
      maskProfanity(cleanText(platform)).slice(0, 200),
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
    [cityId, characterId, maskProfanity(cleanText(text)).slice(0, 300)],
  );
  if (!r.rowCount) fail('not_mayor', 403);
  return { ok: true };
}

// ---------- Makam yetkileri ----------

const hoursMs = (h: number) => gameHoursToMs(h, config.gameSpeed);

/**
 * Şehirde yürürlükteki kararlar (makam → basamak). Karar yalnızca onu veren makam sahibi hâlâ görevdeyse ve oyuncuysa
 * geçerlidir; NPC makam sahibi, boş makam ya da el değiştirmiş makamda varsayılan (0).
 */
export async function cityPolicies(db: Db, cityId: string): Promise<Record<OfficeId, number>> {
  const out = { mayor: 0, governor: 0, police_chief: 0 } as Record<OfficeId, number>;
  const rows = await many(
    db,
    `SELECT p.office, p.level FROM city_policies p
       JOIN office_holders h ON h.city_id = p.city_id AND h.office = p.office AND h.character_id = p.holder_id
       JOIN characters ch ON ch.id = h.character_id
      WHERE p.city_id = $1 AND NOT ch.npc`,
    [cityId],
  );
  for (const r of rows) if (r.office in out) out[r.office as OfficeId] = clampPolicy(r.office as OfficeId, Number(r.level));
  return out;
}

/** Karar haberi: şehir gazetesinde (kesin sayı yok, kelimeyle); yazar yok, basın etkisi yok */
async function policyArticle(c: Db, cityId: string, office: OfficeId, change: 'up' | 'down' | 'reset', who: string) {
  const city = CITY_BY_ID[cityId];
  if (!city) return null;
  const n = policyNews(POLICIES[office].id, change, who, city.name);
  const a = await one(
    c,
    `INSERT INTO articles(author_id, city_id, band_id, kind, tone, title, body, title_en, body_en, impact, npc)
     VALUES (NULL, $1, NULL, 'news', 'neutral', $2, $3, $4, $5, 0, FALSE) RETURNING id`,
    [cityId, n.tr.title, n.tr.body, n.en.title, n.en.body],
  );
  return Number(a.id);
}

/**
 * Makam el değiştirdi (seçim, ölüm, emeklilik): önceki sahibin kararı varsayılana döner. Karar zaten varsayılandaysa
 * kayıt ve haber yazılmaz. Çağıran işlem makam satırını değiştiriyor olmalı (aynı işlem).
 */
export async function resetPolicy(c: Db, cityId: string, office: string, prevHolder: number) {
  if (!(office in POLICIES)) return false;
  const o = office as OfficeId;
  const p = await one(c, 'SELECT level, holder_id FROM city_policies WHERE city_id = $1 AND office = $2 FOR UPDATE', [cityId, o]);
  if (!p || Number(p.holder_id) !== prevHolder || Number(p.level) === 0) return false;
  await c.query('UPDATE city_policies SET level = 0, holder_id = NULL, set_at = now() WHERE city_id = $1 AND office = $2', [cityId, o]);
  const articleId = await policyArticle(c, cityId, o, 'reset', '');
  await c.query(
    `INSERT INTO policy_log(city_id, office, policy, character_id, old_level, new_level, reason, article_id) VALUES ($1, $2, $3, $4, $5, 0, 'reset', $6)`,
    [cityId, o, POLICIES[o].id, prevHolder, Number(p.level), articleId],
  );
  return true;
}

/** Makam sahibinin bir sonraki karar zamanı (bekleme süresi): kendi son kararından itibaren */
async function nextChangeAt(db: Db, cityId: string, office: string, characterId: number): Promise<Date | null> {
  const last = await one(
    db,
    `SELECT max(created_at) AS at FROM policy_log WHERE city_id = $1 AND office = $2 AND character_id = $3 AND reason = 'set'`,
    [cityId, office, characterId],
  );
  if (!last?.at) return null;
  const at = new Date(last.at.getTime() + hoursMs(POLICY_CHANGE_COOLDOWN_HOURS));
  return at.getTime() > Date.now() ? at : null;
}

/**
 * Makam sahibi kararını değiştirir: yalnızca VIP üye, yalnızca kendi makamında, dar aralıkta, günde bir kez.
 * Kilit sırası: makam satırı, sonra karar satırı. Karakter satırı kilitlenmez (para ya da karakter değişmez): maaş
 * ödemesi makam → karakter, ölüm/emeklilik karakter → makam sırasıyla kilitlediği için burada karakteri kilitlemek
 * kilitlenmeye (deadlock) yol açabilirdi.
 */
export async function setPolicy(characterId: number, cityId: string, office: string, level: number, isVip: boolean) {
  if (!isVip) fail('vip_required', 403);
  if (!CITY_BY_ID[cityId]) fail('not_found', 404);
  if (!(office in POLICIES)) fail('invalid_office');
  const o = office as OfficeId;
  const def = POLICIES[o];
  if (!Number.isInteger(level) || level < def.min || level > def.max) fail('invalid_level');
  return tx(async (c) => {
    const ch = await getCharacter(c, characterId);
    const h = await one(c, 'SELECT character_id FROM office_holders WHERE city_id = $1 AND office = $2 FOR UPDATE', [cityId, o]);
    if (!h || Number(h.character_id) !== characterId) fail('not_office_holder', 403);
    const cur = await one(c, 'SELECT level, holder_id FROM city_policies WHERE city_id = $1 AND office = $2 FOR UPDATE', [cityId, o]);
    const old = cur && Number(cur.holder_id) === characterId ? Number(cur.level) : 0;
    if (old === level) return { ok: true, changed: false, policyLevel: level };
    if (await nextChangeAt(c, cityId, o, characterId)) fail('policy_cooldown', 429);
    await c.query(
      `INSERT INTO city_policies(city_id, office, level, holder_id, set_at) VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (city_id, office) DO UPDATE SET level = EXCLUDED.level, holder_id = EXCLUDED.holder_id, set_at = now()`,
      [cityId, o, level, characterId],
    );
    const articleId = await policyArticle(c, cityId, o, level > old ? 'up' : 'down', ch.name);
    await c.query(
      `INSERT INTO policy_log(city_id, office, policy, character_id, old_level, new_level, reason, article_id) VALUES ($1, $2, $3, $4, $5, $6, 'set', $7)`,
      [cityId, o, def.id, characterId, old, level, articleId],
    );
    return { ok: true, changed: true, policyLevel: level, oldLevel: old };
  });
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
    ...(await policiesView(cityId, viewerId)),
  };
}

/** Şehirdeki kararlar (herkes görür; VIP olmayana seviye yalnızca yönüyle gider) ve son kayıtlar */
async function policiesView(cityId: string, viewerId: number) {
  const levels = await cityPolicies(pool, cityId);
  const rows = await many(
    pool,
    `SELECT p.office, p.set_at, p.holder_id, ch.name FROM city_policies p
       JOIN office_holders h ON h.city_id = p.city_id AND h.office = p.office AND h.character_id = p.holder_id
       JOIN characters ch ON ch.id = p.holder_id
      WHERE p.city_id = $1 AND NOT ch.npc`,
    [cityId],
  );
  const holders = await many(pool, 'SELECT office, character_id FROM office_holders WHERE city_id = $1', [cityId]);
  const isVip = await characterIsVip(pool, viewerId);
  const policies = [];
  for (const o of OFFICES) {
    const r = rows.find((x) => x.office === o.id);
    const mine = holders.some((x) => x.office === o.id && Number(x.character_id) === viewerId);
    const next = mine ? await nextChangeAt(pool, cityId, o.id, viewerId) : null;
    policies.push({
      office: o.id,
      policy: POLICIES[o.id].id,
      policyLevel: levels[o.id],
      setBy: r && levels[o.id] !== 0 ? { characterId: Number(r.holder_id), name: r.name as string } : null,
      setAt: r && levels[o.id] !== 0 ? new Date(r.set_at).toISOString() : null,
      canChange: mine && isVip && !next,
      nextChangeAt: next ? next.toISOString() : null,
    });
  }
  const log = await many(
    pool,
    `SELECT l.*, ch.name FROM policy_log l LEFT JOIN characters ch ON ch.id = l.character_id
      WHERE l.city_id = $1 ORDER BY l.created_at DESC, l.id DESC LIMIT 10`,
    [cityId],
  );
  return {
    policies,
    policyLog: log.map((l) => ({
      office: l.office,
      policy: l.policy,
      oldLevel: Number(l.old_level),
      newLevel: Number(l.new_level),
      reason: l.reason,
      name: l.reason === 'set' ? (l.name ?? null) : null,
      at: new Date(l.created_at).toISOString(),
    })),
  };
}
