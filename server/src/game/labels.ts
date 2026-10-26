// Plak şirketi: oyuncu işletmesi. Sahibi gruplara gelir payı sözleşmesi teklif eder; grup lideri kabul eder,
// reddeder ya da karşı teklif verir (pazarlık). Avans şirketin kasasından ödenir, grubun payından geri alınır.
// Ekonomi korkulukları: yeni hesap kısıtı (requireEstablished), avans tavanı (takas parasıyla aynı), kendi grubuyla
// sözleşme yok, pay aralığı sabit, şirket kasası para çekme ve yatırma dışında yalnızca gerçek satıştan dolar.

import {
  CITY_BY_ID,
  LABEL_ADVANCE_MAX,
  LABEL_BAND_SHARE_RANGE,
  LABEL_CONTRACT_WEEKS,
  LABEL_FOUND_PRICE,
  LABEL_MAX_ROSTER,
  LABEL_MIN_FAME,
  LABEL_NAME_RE,
  LABEL_WEEKLY_UPKEEP,
  PACING,
  containsProfanity,
  gameHoursToMs,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { isJailed, lockCharacter, membership, notify, requireEstablished } from './common';
import { cleanText, pair } from './social';

/** Avans tavanı: şöhret × $100, en fazla LABEL_ADVANCE_MAX */
export const advanceCap = (maxFame: number) => Math.min(LABEL_ADVANCE_MAX, Math.floor(maxFame) * 100);

const weekMs = () => gameHoursToMs(PACING.chartWeekDays * 24, config.gameSpeed);

export async function foundLabel(characterId: number, name: string) {
  const n = cleanText(name, true);
  if (!LABEL_NAME_RE.test(n) || containsProfanity(n)) fail('invalid_name');
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    if (isJailed(ch)) fail('in_jail', 409);
    if (!ch.city_id) fail('traveling', 409);
    await requireEstablished(c, characterId);
    if (await one(c, 'SELECT 1 FROM labels WHERE owner_id = $1', [characterId])) fail('already_owner', 409);
    if (await one(c, 'SELECT 1 FROM labels WHERE lower(name) = lower($1)', [n])) fail('name_taken', 409);
    const price = Math.round(LABEL_FOUND_PRICE * CITY_BY_ID[ch.city_id!].costMult);
    if (ch.money < price) fail('not_enough_money');
    await c.query('UPDATE characters SET money = money - $2 WHERE id = $1', [characterId, price]);
    const l = await one(c, 'INSERT INTO labels(owner_id, name, city_id, upkeep_due) VALUES ($1, $2, $3, $4) RETURNING id', [
      characterId,
      n,
      ch.city_id,
      new Date(Date.now() + weekMs()),
    ]);
    return { id: Number(l.id), price };
  });
}

async function ownLabel(c: Db, ownerId: number) {
  const l = await one(c, 'SELECT * FROM labels WHERE owner_id = $1 FOR UPDATE', [ownerId]);
  if (!l) fail('no_label', 404);
  return l;
}

function validTerms(bandShare: number, advance: number, weeks: number) {
  if (!(bandShare >= LABEL_BAND_SHARE_RANGE[0] && bandShare <= LABEL_BAND_SHARE_RANGE[1])) fail('invalid_share');
  if (!Number.isInteger(advance) || advance < 0 || advance > LABEL_ADVANCE_MAX) fail('invalid_advance');
  if (!Number.isInteger(weeks) || weeks < LABEL_CONTRACT_WEEKS[0] || weeks > LABEL_CONTRACT_WEEKS[1]) fail('invalid_weeks');
}

/** Şirket sahibi bir gruba teklif verir */
export async function offerContract(ownerId: number, bandId: number, terms: { bandShare: number; advance: number; weeks: number }) {
  validTerms(terms.bandShare, terms.advance, terms.weeks);
  return tx(async (c) => {
    await lockCharacter(c, ownerId);
    await requireEstablished(c, ownerId);
    const l = await ownLabel(c, ownerId);
    const band = await one(c, 'SELECT id, name, leader_id, npc_key FROM bands WHERE id = $1', [bandId]);
    if (!band) fail('not_found', 404);
    if (band.npc_key) fail('npc_target', 403);
    // Kendi grubuyla sözleşme yapamaz (kendine para aktarma olmasın)
    const own = await membership(c, ownerId);
    if (own?.band_id === bandId) fail('own_band', 403);
    const fame = await one(c, 'SELECT COALESCE(max(fame), 0) AS f FROM band_fame WHERE band_id = $1', [bandId]);
    if (Number(fame.f) < LABEL_MIN_FAME) fail('not_famous_enough');
    // Avans grubun şöhretiyle sınırlı: tanınmamış (ör. ek hesapla kurulmuş) gruba büyük para aktarılamaz
    if (terms.advance > advanceCap(Number(fame.f))) fail('advance_too_high');
    if (await one(c, `SELECT 1 FROM label_contracts WHERE band_id = $1 AND status = 'active'`, [bandId])) fail('band_signed', 409);
    if (await one(c, `SELECT 1 FROM label_contracts WHERE band_id = $1 AND label_id = $2 AND status IN ('offered', 'countered')`, [bandId, l.id])) {
      fail('already_offered', 409);
    }
    const roster = await one(c, `SELECT count(*)::int AS n FROM label_contracts WHERE label_id = $1 AND status = 'active'`, [l.id]);
    if (roster.n >= LABEL_MAX_ROSTER) fail('roster_full', 409);
    const k = await one(
      c,
      `INSERT INTO label_contracts(label_id, band_id, band_share, advance, weeks, status, last_by) VALUES ($1, $2, $3, $4, $5, 'offered', 'label') RETURNING id`,
      [l.id, bandId, terms.bandShare, terms.advance, terms.weeks],
    );
    await notify(c, Number(band.leader_id), 'label_offer', { contractId: Number(k.id), label: l.name, bandShare: terms.bandShare, advance: terms.advance, weeks: terms.weeks });
    return { id: Number(k.id) };
  });
}

/** Sözleşmeye yanıt: kabul, red ya da karşı teklif. Sıra son teklifi yapmayan taraftadır. */
export async function answerContract(
  characterId: number,
  contractId: number,
  answer: 'accept' | 'decline' | 'counter',
  counter?: { bandShare: number; advance: number; weeks: number },
) {
  return tx(async (c) => {
    const peek = await one(
      c,
      `SELECT k.*, l.owner_id, l.name AS label_name, b.leader_id, b.name AS band_name
         FROM label_contracts k JOIN labels l ON l.id = k.label_id JOIN bands b ON b.id = k.band_id WHERE k.id = $1`,
      [contractId],
    );
    if (!peek) fail('not_found', 404);
    const owner = Number(peek.owner_id);
    const leader = Number(peek.leader_id);
    // İki tarafı id sırasıyla kilitle (avans parası taşınıyor)
    for (const id of pair(owner, leader)) await lockCharacter(c, id);
    const k = await one(c, `SELECT * FROM label_contracts WHERE id = $1 AND status IN ('offered', 'countered') FOR UPDATE`, [contractId]);
    if (!k) fail('contract_closed', 409);
    const side = characterId === leader ? 'band' : characterId === owner ? 'label' : null;
    if (!side) fail('forbidden', 403);
    if (k.last_by === side) fail('not_your_turn', 409);
    const other = side === 'band' ? owner : leader;
    if (answer === 'decline') {
      await c.query(`UPDATE label_contracts SET status = 'declined' WHERE id = $1`, [k.id]);
      await notify(c, other, 'label_declined', { contractId: k.id, label: peek.label_name, band: peek.band_name });
      return { status: 'declined' };
    }
    if (answer === 'counter') {
      if (!counter) fail('invalid_input');
      validTerms(counter!.bandShare, counter!.advance, counter!.weeks);
      const fame = await one(c, 'SELECT COALESCE(max(fame), 0) AS f FROM band_fame WHERE band_id = $1', [k.band_id]);
      if (counter!.advance > advanceCap(Number(fame.f))) fail('advance_too_high');
      await c.query(`UPDATE label_contracts SET band_share = $2, advance = $3, weeks = $4, status = 'countered', last_by = $5 WHERE id = $1`, [
        k.id,
        counter!.bandShare,
        counter!.advance,
        counter!.weeks,
        side,
      ]);
      await notify(c, other, 'label_counter', { contractId: k.id, label: peek.label_name, band: peek.band_name, ...counter });
      return { status: 'countered' };
    }
    // Kabul: grup başka şirketle imzalamamış olmalı, şirket avansı ödeyebilmeli
    if (await one(c, `SELECT 1 FROM label_contracts WHERE band_id = $1 AND status = 'active'`, [k.band_id])) fail('band_signed', 409);
    await requireEstablished(c, leader);
    await requireEstablished(c, owner);
    const l = await one(c, 'SELECT * FROM labels WHERE id = $1 FOR UPDATE', [k.label_id]);
    const roster = await one(c, `SELECT count(*)::int AS n FROM label_contracts WHERE label_id = $1 AND status = 'active'`, [l.id]);
    if (roster.n >= LABEL_MAX_ROSTER) fail('roster_full', 409);
    if (l.till < k.advance) fail('label_till_empty', 409);
    const members = await many(c, 'SELECT character_id FROM band_members WHERE band_id = $1 ORDER BY character_id', [k.band_id]);
    if (members.some((m) => Number(m.character_id) === owner)) fail('own_band', 403);
    const ends = new Date(Date.now() + k.weeks * weekMs());
    await c.query(`UPDATE label_contracts SET status = 'active', starts_at = now(), ends_at = $2 WHERE id = $1`, [k.id, ends]);
    // Bekleyen diğer teklifler düşer
    await c.query(`UPDATE label_contracts SET status = 'cancelled' WHERE band_id = $1 AND status IN ('offered', 'countered') AND id <> $2`, [k.band_id, k.id]);
    if (k.advance > 0) {
      await c.query('UPDATE labels SET till = till - $2 WHERE id = $1', [l.id, k.advance]);
      // Avans üyelere eşit bölünür (kalan kuruş lidere)
      const share = Math.floor(k.advance / members.length);
      const rest = k.advance - share * members.length;
      for (const m of members) {
        const amount = share + (Number(m.character_id) === leader ? rest : 0);
        if (amount > 0) await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [m.character_id, amount]);
      }
    }
    for (const m of members) await notify(c, Number(m.character_id), 'label_signed', { contractId: k.id, label: l.name });
    await notify(c, owner, 'label_signed', { contractId: k.id, band: peek.band_name });
    return { status: 'active', endsAt: ends.toISOString() };
  });
}

/** Kasaya para koy ya da çek (işletme kasası gibi) */
export async function moveLabelTill(ownerId: number, amount: number) {
  if (!Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 1_000_000) fail('invalid_amount');
  return tx(async (c) => {
    const ch = await lockCharacter(c, ownerId);
    const l = await ownLabel(c, ownerId);
    if (amount > 0) {
      await requireEstablished(c, ownerId);
      if (ch.money < amount) fail('not_enough_money');
    } else if (l.till < -amount) fail('label_till_empty', 409);
    await c.query('UPDATE characters SET money = money - $2 WHERE id = $1', [ownerId, amount]);
    await c.query('UPDATE labels SET till = till + $2 WHERE id = $1', [l.id, amount]);
    return { till: l.till + amount };
  });
}

/** Zamanlayıcı: haftalık gider (kasadan, yetmezse sahibinden; ikisi de yetmezse şirket kapanır) ve süresi biten sözleşmeler */
export async function processLabels(): Promise<number> {
  let n = 0;
  await pool.query(`UPDATE label_contracts SET status = 'ended' WHERE status = 'active' AND ends_at <= now()`);
  for (;;) {
    const done = await tx(async (c) => {
      const cand = await one(c, 'SELECT id, owner_id FROM labels WHERE upkeep_due <= now() ORDER BY upkeep_due LIMIT 1');
      if (!cand) return false;
      const owner = await lockCharacter(c, Number(cand.owner_id));
      const l = await one(c, 'SELECT * FROM labels WHERE id = $1 AND upkeep_due <= now() FOR UPDATE', [cand.id]);
      if (!l) return true;
      const upkeep = Math.round(LABEL_WEEKLY_UPKEEP * (CITY_BY_ID[l.city_id]?.costMult ?? 1));
      const fromTill = Math.min(l.till, upkeep);
      const fromPocket = upkeep - fromTill;
      if (owner.money >= fromPocket) {
        await c.query('UPDATE labels SET till = till - $2, upkeep_due = $3 WHERE id = $1', [l.id, fromTill, new Date(Math.max(l.upkeep_due.getTime() + weekMs(), Date.now() + weekMs() / 7))]);
        if (fromPocket) await c.query('UPDATE characters SET money = money - $2 WHERE id = $1', [owner.id, fromPocket]);
      } else {
        await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [owner.id, l.till]);
        await c.query(`UPDATE label_contracts SET status = 'ended' WHERE label_id = $1 AND status IN ('active', 'offered', 'countered')`, [l.id]);
        await c.query('DELETE FROM labels WHERE id = $1', [l.id]);
        await notify(c, owner.id, 'label_closed', { name: l.name });
      }
      return true;
    });
    if (!done) break;
    n++;
  }
  return n;
}

export async function labelView(db: Db, viewer: number) {
  const l = await one(db, 'SELECT * FROM labels WHERE owner_id = $1', [viewer]);
  const m = await membership(db, viewer);
  const contracts = await many(
    db,
    `SELECT k.*, l.name AS label_name, l.owner_id, b.name AS band_name, b.leader_id FROM label_contracts k
       JOIN labels l ON l.id = k.label_id JOIN bands b ON b.id = k.band_id
      WHERE (l.owner_id = $1 OR k.band_id = $2) AND k.status IN ('offered', 'countered', 'active')
      ORDER BY k.id DESC`,
    [viewer, m?.band_id ?? 0],
  );
  return {
    label: l ? { id: Number(l.id), name: l.name, cityId: l.city_id, till: l.till, totalRevenue: l.total_revenue, upkeepDue: l.upkeep_due.toISOString() } : null,
    contracts: contracts.map((k) => ({
      id: Number(k.id),
      label: k.label_name,
      band: { id: Number(k.band_id), name: k.band_name },
      bandShare: k.band_share,
      advance: k.advance,
      recouped: k.recouped,
      weeks: k.weeks,
      status: k.status,
      myTurn: (k.status === 'offered' || k.status === 'countered') && ((k.last_by === 'label' && Number(k.leader_id) === viewer) || (k.last_by === 'band' && Number(k.owner_id) === viewer)),
      side: Number(k.owner_id) === viewer ? 'label' : 'band',
      endsAt: k.ends_at ? k.ends_at.toISOString() : null,
    })),
  };
}

export async function labelsList(db: Db) {
  const rows = await many(
    db,
    `SELECT l.id, l.name, l.city_id, c.name AS owner_name,
            (SELECT count(*)::int FROM label_contracts k WHERE k.label_id = l.id AND k.status = 'active') AS roster
       FROM labels l JOIN characters c ON c.id = l.owner_id ORDER BY roster DESC, l.id LIMIT 50`,
  );
  return rows.map((r) => ({ id: Number(r.id), name: r.name, cityId: r.city_id, owner: r.owner_name, roster: r.roster }));
}
