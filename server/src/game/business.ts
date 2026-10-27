// Oyuncu işletmeleri: ruhsat satın alma ve satma, çalışan alma, mesai (kasaya gelir, kasadan maaş),
// haftalık gider, bar konserlerinden bilet payı, restoran menü fiyatı.

import {
  BUSINESS_NAME_RE,
  BUSINESS_RULES,
  BUSINESS_SELL_BACK,
  type BusinessDto,
  type BusinessType,
  CITY_BY_ID,
  LOCATION_BY_ID,
  MAX_EMPLOYEES,
  MAX_GIG_SHARE,
  MENU_MULT_RANGE,
  WAGE_RANGE,
  containsProfanity,
  gameHoursToMs,
  lv,
  staffedRevenue,
  PACING,
  accountingCostMult,
  businessFeeMult,
} from '@rifftown/shared';
import { cityPolicies } from './politics';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { type CharacterRow, isJailed, lockCharacter, notify, requireEstablished } from './common';
import { cleanText, isBlocked, requirePlayer } from './social';
import { addMoodlet } from './wellbeing';

const weekMs = () => gameHoursToMs(PACING.upkeepPeriodDays * 24, config.gameSpeed);

function lot(locationId: string) {
  const loc = LOCATION_BY_ID[locationId];
  if (!loc?.business) fail('not_a_business', 404);
  return { loc: loc!, kind: loc!.business as BusinessType, city: CITY_BY_ID[loc!.cityId] };
}

export const businessPrice = (kind: BusinessType, costMult: number) => Math.round(BUSINESS_RULES[kind].price * costMult);
/** accounting: sahibinin muhasebe becerisi; haftalık gideri en fazla %10 düşürür (perks.ts).
 *  feeMult: valinin işletme ruhsat harcı kararı (civic-powers.ts, ×0,8–×1,2) */
export const businessUpkeep = (kind: BusinessType, costMult: number, accounting = 0, feeMult = 1) =>
  Math.round(BUSINESS_RULES[kind].upkeep * costMult * accountingCostMult(accounting) * feeMult);

export async function businessView(db: Db, locationId: string, viewer: number): Promise<BusinessDto> {
  const { loc, kind, city } = lot(locationId);
  const b = await one(db, 'SELECT b.*, c.name AS owner_name, c.skills AS owner_skills FROM businesses b JOIN characters c ON c.id = b.owner_id WHERE b.location_id = $1', [locationId]);
  const isOwner = !!b && Number(b.owner_id) === viewer;
  const mine = await one(db, 'SELECT status, wage FROM business_staff WHERE location_id = $1 AND character_id = $2', [locationId, viewer]);
  const staff = isOwner
    ? await many(
        db,
        `SELECT s.character_id, s.wage, s.status, c.name FROM business_staff s JOIN characters c ON c.id = s.character_id
          WHERE s.location_id = $1 ORDER BY s.hired_at`,
        [locationId],
      )
    : null;
  const log = isOwner
    ? await many(
        db,
        `SELECT l.kind, l.amount, l.created_at, c.name FROM business_log l LEFT JOIN characters c ON c.id = l.character_id
          WHERE l.location_id = $1 ORDER BY l.id DESC LIMIT 20`,
        [locationId],
      )
    : null;
  return {
    locationId,
    kind,
    forSale: !b,
    price: businessPrice(kind, city.costMult),
    name: b?.name ?? loc.name.tr,
    owner: b ? { characterId: Number(b.owner_id), name: b.owner_name } : null,
    gigShare: b?.gig_share ?? 0,
    menuMult: b?.menu_mult ?? 1,
    isOwner,
    staffStatus: mine?.status ?? null,
    myWage: mine?.wage ?? null,
    till: isOwner ? b.till : null,
    upkeep: businessUpkeep(kind, city.costMult, isOwner ? lv(b.owner_skills ?? {}, 'accounting') : 0, businessFeeMult((await cityPolicies(db, city.id)).governor)),
    upkeepDue: isOwner ? b.upkeep_due.toISOString() : null,
    totalRevenue: isOwner ? b.total_revenue : null,
    staff: staff ? staff.map((s) => ({ characterId: Number(s.character_id), name: s.name, wage: s.wage, status: s.status })) : null,
    log: log ? log.map((l) => ({ kind: l.kind, amount: l.amount, name: l.name ?? null, createdAt: l.created_at.toISOString() })) : null,
  };
}

async function lockOwned(c: pg.PoolClient, locationId: string, owner: number) {
  const b = await one(c, 'SELECT * FROM businesses WHERE location_id = $1 FOR UPDATE', [locationId]);
  if (!b) fail('not_found', 404);
  if (Number(b.owner_id) !== owner) fail('not_owner', 403);
  return b;
}

export async function buyBusiness(characterId: number, locationId: string) {
  const { loc, kind, city } = lot(locationId);
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    if (isJailed(ch)) fail('in_jail', 409);
    if (loc.cityId !== ch.city_id) fail('not_in_city');
    if (await one(c, 'SELECT 1 FROM businesses WHERE owner_id = $1', [characterId])) fail('already_owner', 409);
    if (await one(c, 'SELECT 1 FROM businesses WHERE location_id = $1', [locationId])) fail('not_for_sale', 409);
    const price = businessPrice(kind, city.costMult);
    if (ch.money < price) fail('not_enough_money');
    await c.query('UPDATE characters SET money = money - $2, location_id = $3 WHERE id = $1', [characterId, price, locationId]);
    await c
      .query(`INSERT INTO businesses(location_id, owner_id, kind, name, upkeep_due) VALUES ($1, $2, $3, $4, $5)`, [
        locationId,
        characterId,
        kind,
        loc.name.tr,
        new Date(Date.now() + weekMs()),
      ])
      .catch((e) => {
        // Aynı anda iki kişi aynı ruhsatı almaya çalıştı
        if ((e as { code?: string }).code === '23505') fail('not_for_sale', 409);
        throw e;
      });
    // Sahibi başka bir yerde çalışıyorsa oradan ayrılır
    await c.query('DELETE FROM business_staff WHERE character_id = $1', [characterId]);
    await c.query(`INSERT INTO business_log(location_id, kind, amount, character_id) VALUES ($1, 'bought', $2, $3)`, [locationId, -price, characterId]);
    return { price };
  });
}

export async function sellBusiness(characterId: number, locationId: string) {
  const { kind, city } = lot(locationId);
  return tx(async (c) => {
    // Kilit sırası her yerde aynı: önce karakter, sonra işletme
    await lockCharacter(c, characterId);
    const b = await lockOwned(c, locationId, characterId);
    const refund = Math.round(businessPrice(kind, city.costMult) * BUSINESS_SELL_BACK) + b.till;
    await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [characterId, refund]);
    const staff = await many(c, `SELECT character_id FROM business_staff WHERE location_id = $1 AND status = 'hired'`, [locationId]);
    for (const s of staff) await notify(c, Number(s.character_id), 'job_lost', { locationId, reason: 'sold' });
    await c.query('DELETE FROM businesses WHERE location_id = $1', [locationId]);
    return { refund };
  });
}

export async function updateBusiness(characterId: number, locationId: string, body: { name?: string; gigShare?: number; menuMult?: number }) {
  return tx(async (c) => {
    const b = await lockOwned(c, locationId, characterId);
    const name = body.name !== undefined ? cleanText(body.name, true) : b.name;
    if (!BUSINESS_NAME_RE.test(name) || containsProfanity(name)) fail('invalid_name');
    const share = body.gigShare ?? b.gig_share;
    if (share < 0 || share > MAX_GIG_SHARE) fail('invalid_share');
    const mult = body.menuMult ?? b.menu_mult;
    if (mult < MENU_MULT_RANGE[0] || mult > MENU_MULT_RANGE[1]) fail('invalid_price');
    await c.query('UPDATE businesses SET name = $2, gig_share = $3, menu_mult = $4 WHERE location_id = $1', [locationId, name, share, mult]);
    return { ok: true };
  });
}

/** Kasadan sahibinin cebine para çekmek ya da kasaya para koymak */
export async function moveTill(characterId: number, locationId: string, amount: number) {
  if (!Number.isInteger(amount) || amount === 0) fail('invalid_amount');
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    const b = await lockOwned(c, locationId, characterId);
    if (amount > 0 && b.till < amount) fail('not_enough_money');
    if (amount < 0 && ch.money < -amount) fail('not_enough_money');
    // Kasaya para koyup bir başkasını maaşla ödemek: yeni hesaplara kapalı (ek hesap önlemi)
    if (amount < 0) await requireEstablished(c, characterId);
    await c.query('UPDATE businesses SET till = till - $2 WHERE location_id = $1', [locationId, amount]);
    await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [characterId, amount]);
    await c.query(`INSERT INTO business_log(location_id, kind, amount, character_id) VALUES ($1, $2, $3, $4)`, [
      locationId,
      amount > 0 ? 'withdraw' : 'deposit',
      -amount,
      characterId,
    ]);
    return { ok: true };
  });
}

// ---------- Çalışanlar ----------

export async function offerJob(ownerId: number, locationId: string, targetId: number, wage: number) {
  if (!Number.isInteger(wage) || wage < WAGE_RANGE[0] || wage > WAGE_RANGE[1]) fail('invalid_wage');
  if (ownerId === targetId) fail('invalid_target');
  return tx(async (c) => {
    const b = await lockOwned(c, locationId, ownerId);
    await requirePlayer(c, targetId);
    await requireEstablished(c, ownerId);
    if (await isBlocked(c, ownerId, targetId)) fail('blocked', 403);
    const n = await one(c, 'SELECT count(*)::int AS n FROM business_staff WHERE location_id = $1', [locationId]);
    if (n.n >= MAX_EMPLOYEES) fail('staff_full');
    if (await one(c, 'SELECT 1 FROM business_staff WHERE character_id = $1', [targetId])) fail('target_employed', 409);
    if (await one(c, 'SELECT 1 FROM businesses WHERE owner_id = $1', [targetId])) fail('target_employed', 409);
    await c.query(`INSERT INTO business_staff(location_id, character_id, wage, status) VALUES ($1, $2, $3, 'offered')`, [locationId, targetId, wage]);
    await notify(c, targetId, 'job_offer', { locationId, name: b.name, wage });
    return { ok: true };
  });
}

export async function answerJob(characterId: number, locationId: string, accept: boolean) {
  return tx(async (c) => {
    const s = await one(c, `SELECT * FROM business_staff WHERE location_id = $1 AND character_id = $2 AND status = 'offered' FOR UPDATE`, [
      locationId,
      characterId,
    ]);
    if (!s) fail('no_offer', 404);
    const b = await one(c, 'SELECT owner_id FROM businesses WHERE location_id = $1', [locationId]);
    const me = await one(c, 'SELECT name FROM characters WHERE id = $1', [characterId]);
    if (accept) {
      await c.query(`UPDATE business_staff SET status = 'hired', hired_at = now() WHERE location_id = $1 AND character_id = $2`, [locationId, characterId]);
    } else {
      await c.query('DELETE FROM business_staff WHERE location_id = $1 AND character_id = $2', [locationId, characterId]);
    }
    await notify(c, Number(b.owner_id), accept ? 'job_accepted' : 'job_declined', { locationId, name: me.name });
    return { ok: true };
  });
}

/** Sahibi çalışanı çıkarır ya da çalışan istifa eder */
export async function endJob(actor: number, locationId: string, staffId: number) {
  return tx(async (c) => {
    const b = await one(c, 'SELECT owner_id FROM businesses WHERE location_id = $1', [locationId]);
    if (!b) fail('not_found', 404);
    if (actor !== staffId && Number(b.owner_id) !== actor) fail('forbidden', 403);
    const r = await c.query('DELETE FROM business_staff WHERE location_id = $1 AND character_id = $2', [locationId, staffId]);
    if (!r.rowCount) fail('not_found', 404);
    if (actor !== staffId) {
      await notify(c, staffId, 'job_lost', { locationId, reason: 'fired' });
      await addMoodlet(c, staffId, 'lost_job');
    }
    return { ok: true };
  });
}

export async function setWage(ownerId: number, locationId: string, staffId: number, wage: number) {
  if (!Number.isInteger(wage) || wage < WAGE_RANGE[0] || wage > WAGE_RANGE[1]) fail('invalid_wage');
  return tx(async (c) => {
    await lockOwned(c, locationId, ownerId);
    const r = await c.query('UPDATE business_staff SET wage = $3 WHERE location_id = $1 AND character_id = $2', [locationId, staffId, wage]);
    if (!r.rowCount) fail('not_found', 404);
    return { ok: true };
  });
}

// ---------- Mesai (actions.ts çağırır) ----------

/**
 * İşletmede mesai başlatırken: sahibi ya da işe alınmış çalışan olmalı.
 * Çalışanın maaşı başlarken kasadan ayrılır (kasada yoksa mesai başlamaz).
 */
export async function prepareBusinessShift(c: pg.PoolClient, ch: CharacterRow, locationId: string, hours: number) {
  const b = await one(c, 'SELECT * FROM businesses WHERE location_id = $1 FOR UPDATE', [locationId]);
  if (!b) fail('business_closed');
  const isOwner = Number(b.owner_id) === ch.id;
  let wage = 0;
  if (!isOwner) {
    const s = await one(c, `SELECT wage FROM business_staff WHERE location_id = $1 AND character_id = $2 AND status = 'hired'`, [locationId, ch.id]);
    if (!s) fail('not_employed', 403);
    wage = s.wage * hours;
    if (b.till < wage) fail('till_empty', 409);
    await c.query('UPDATE businesses SET till = till - $2 WHERE location_id = $1', [locationId, wage]);
  }
  return { business: locationId, owner: isOwner, pay: wage, ownerId: Number(b.owner_id), since: b.created_at.toISOString() };
}

/** Mesai bitince: çalışana maaşı, kasaya müşteri parası (sahibinin işletmecilik becerisine göre) */
export async function resolveBusinessShift(c: pg.PoolClient, ch: CharacterRow, params: Record<string, any>, hours: number, fraction: number) {
  const found = await one(c, 'SELECT * FROM businesses WHERE location_id = $1 FOR UPDATE', [params.business]);
  const reserved = (params.pay as number) ?? 0;
  const pay = Math.floor(reserved * fraction);
  // Mesai sırasında işletme satıldıysa (ya da başkası aldıysa) gelir ve artan maaş yeni sahibe gitmez
  const same = found && (!params.since || (Number(found.owner_id) === params.ownerId && found.created_at.toISOString() === params.since));
  const b = same ? found : null;
  if (!b) {
    // Ayrılan maaşın çalışılan kısmı yine ödenir, artanı eski sahibine döner
    if (reserved - pay > 0 && params.ownerId) await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [params.ownerId, reserved - pay]);
    return { pay, closed: true };
  }
  // Yarıda kalan mesainin ayrılmış maaşı kasaya döner
  if (reserved - pay > 0) await c.query('UPDATE businesses SET till = till + $2 WHERE location_id = $1', [b.location_id, reserved - pay]);
  const owner = await one(c, 'SELECT skills FROM characters WHERE id = $1', [b.owner_id]);
  const { kind, city } = lot(b.location_id);
  const revenue = staffedRevenue(BUSINESS_RULES[kind], city.costMult, hours, lv(owner?.skills ?? {}, 'business'));
  await c.query('UPDATE businesses SET till = till + $2, total_revenue = total_revenue + $2 WHERE location_id = $1', [b.location_id, revenue]);
  await c.query(`INSERT INTO business_log(location_id, kind, amount, character_id) VALUES ($1, 'shift', $2, $3)`, [b.location_id, revenue, ch.id]);
  if (pay > 0) await c.query(`INSERT INTO business_log(location_id, kind, amount, character_id) VALUES ($1, 'wage', $2, $3)`, [b.location_id, -pay, ch.id]);
  return { pay, revenue };
}

/** Barda konser: bilet gelirinden sahibinin payı */
export async function barGigShare(c: pg.PoolClient, locationId: string, revenue: number, bandMemberIds: number[]) {
  const loc = LOCATION_BY_ID[locationId];
  if (!loc?.business || revenue <= 0) return 0;
  const b = await one(c, 'SELECT owner_id, gig_share FROM businesses WHERE location_id = $1 FOR UPDATE', [locationId]);
  if (!b || bandMemberIds.includes(Number(b.owner_id))) return 0;
  const share = Math.floor(revenue * b.gig_share);
  if (share <= 0) return 0;
  await c.query('UPDATE businesses SET till = till + $2, total_revenue = total_revenue + $2 WHERE location_id = $1', [locationId, share]);
  await c.query(`INSERT INTO business_log(location_id, kind, amount) VALUES ($1, 'gig', $2)`, [locationId, share]);
  return share;
}

// ---------- Haftalık gider ----------

export async function processUpkeep(): Promise<number> {
  let n = 0;
  // Bir turda her işletme en fazla bir kez işlenir
  const seen: string[] = [];
  for (;;) {
    const done = await tx(async (c) => {
      // Önce sahibi kilitlenir, sonra işletme (diğer işlemlerle aynı sıra; kilitlenme olmasın)
      const cand = await one(
        c,
        'SELECT location_id, owner_id FROM businesses WHERE upkeep_due <= now() AND NOT (location_id = ANY($1::text[])) ORDER BY upkeep_due LIMIT 1',
        [seen],
      );
      if (!cand) return false;
      seen.push(cand.location_id);
      const owner = await lockCharacter(c, Number(cand.owner_id));
      const b = await one(c, 'SELECT * FROM businesses WHERE location_id = $1 AND owner_id = $2 AND upkeep_due <= now() FOR UPDATE', [cand.location_id, owner.id]);
      if (!b) return true; // bu arada el değiştirdi ya da ödendi: döngü yeniden bakar
      const { kind, city } = lot(b.location_id);
      const upkeep = businessUpkeep(kind, city.costMult, lv(owner.skills, 'accounting'), businessFeeMult((await cityPolicies(c, city.id)).governor));
      const fromTill = Math.min(b.till, upkeep);
      const fromPocket = upkeep - fromTill;
      if (owner.money >= fromPocket) {
        await c.query('UPDATE businesses SET till = till - $2, upkeep_due = $3 WHERE location_id = $1', [
          b.location_id,
          fromTill,
          new Date(Math.max(b.upkeep_due.getTime() + weekMs(), Date.now() + weekMs() / 7)),
        ]);
        if (fromPocket) await c.query('UPDATE characters SET money = money - $2 WHERE id = $1', [owner.id, fromPocket]);
        await c.query(`INSERT INTO business_log(location_id, kind, amount) VALUES ($1, 'upkeep', $2)`, [b.location_id, -upkeep]);
      } else {
        // Gider ödenemedi: ruhsat geri alınır, kasadaki para sahibine kalır
        await c.query('UPDATE characters SET money = money + $2 WHERE id = $1', [owner.id, b.till]);
        const staff = await many(c, `SELECT character_id FROM business_staff WHERE location_id = $1 AND status = 'hired'`, [b.location_id]);
        for (const s of staff) await notify(c, Number(s.character_id), 'job_lost', { locationId: b.location_id, reason: 'closed' });
        await c.query('DELETE FROM businesses WHERE location_id = $1', [b.location_id]);
        await notify(c, owner.id, 'business_seized', { locationId: b.location_id, name: b.name, upkeep });
      }
      return true;
    });
    if (!done) break;
    n++;
  }
  return n;
}

export async function businessOf(db: Db, characterId: number) {
  const own = await one(db, 'SELECT location_id FROM businesses WHERE owner_id = $1', [characterId]);
  if (own) return { locationId: own.location_id as string, role: 'owner' as const };
  const s = await one(db, `SELECT location_id FROM business_staff WHERE character_id = $1 AND status = 'hired'`, [characterId]);
  return s ? { locationId: s.location_id as string, role: 'staff' as const } : null;
}

export async function cityBusinesses(db: Db, cityId: string) {
  const rows = await many(
    db,
    `SELECT b.location_id, b.name, c.name AS owner_name FROM businesses b JOIN characters c ON c.id = b.owner_id WHERE b.location_id LIKE $1`,
    [`${cityId}-biz%`],
  );
  return rows.map((r) => ({ locationId: r.location_id, name: r.name, ownerName: r.owner_name }));
}

