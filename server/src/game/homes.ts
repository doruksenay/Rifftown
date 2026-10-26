// Ev ve kira.

import { CITY_BY_ID, HOME_BY_ID, type HomeDto, LOCATION_BY_ID, RENT_PERIOD_DAYS, gameHoursToMs, rentFor } from '@rifftown/shared';
import { config } from '../config';
import { type Db, one, tx } from '../db';
import { fail } from '../errors';
import { addMoodlet } from './wellbeing';
import { activeAction, characterIsVip, isJailed, lockCharacter, notify } from './common';

const periodMs = () => gameHoursToMs(RENT_PERIOD_DAYS * 24, config.gameSpeed);

export async function homeOf(db: Db, characterId: number): Promise<HomeDto | null> {
  const h = await one(db, 'SELECT * FROM homes WHERE character_id = $1', [characterId]);
  if (!h || !HOME_BY_ID[h.home_id]) return null;
  return {
    homeId: h.home_id,
    cityId: h.city_id,
    paidUntil: h.paid_until.toISOString(),
    rent: rentFor(HOME_BY_ID[h.home_id], CITY_BY_ID[h.city_id]?.costMult ?? 1),
  };
}

/** Emlakçıdan ev tutmak: ilk haftanın kirası peşin ödenir. Başka bir ev varsa bırakılır (iade yok). */
export async function rentHome(characterId: number, homeId: string, locationId: string, isVip: boolean) {
  return tx(async (c) => {
    // Kira tahsilatıyla aynı sırada kilitle (önce ev, sonra karakter) ki kilitlenme olmasın
    await c.query('SELECT 1 FROM homes WHERE character_id = $1 FOR UPDATE', [characterId]);
    const ch = await lockCharacter(c, characterId);
    if (isJailed(ch)) fail('in_jail', 409);
    if (await activeAction(c, characterId)) fail('busy', 409);
    const home = HOME_BY_ID[homeId];
    if (!home) fail('invalid_home');
    if (home!.vip && !isVip) fail('vip_required', 403);
    const loc = LOCATION_BY_ID[locationId];
    if (!loc || loc.type !== 'real_estate') fail('invalid_location');
    if (loc!.cityId !== ch.city_id) fail('not_in_city');
    const current = await one(c, 'SELECT home_id, city_id FROM homes WHERE character_id = $1', [characterId]);
    if (current && current.home_id === homeId && current.city_id === loc!.cityId) fail('already_home', 409);
    const rent = rentFor(home!, CITY_BY_ID[loc!.cityId].costMult);
    if (ch.money < rent) fail('not_enough_money');
    await c.query('UPDATE characters SET money = money - $2, location_id = $3 WHERE id = $1', [characterId, rent, loc!.id]);
    await c.query(
      `INSERT INTO homes(character_id, city_id, home_id, paid_until) VALUES ($1, $2, $3, $4)
       ON CONFLICT (character_id) DO UPDATE SET city_id = EXCLUDED.city_id, home_id = EXCLUDED.home_id,
         paid_until = EXCLUDED.paid_until, created_at = now()`,
      [characterId, loc!.cityId, homeId, new Date(Date.now() + periodMs())],
    );
    return { home: await homeOf(c, characterId), rent };
  });
}

export async function leaveHome(characterId: number) {
  return tx(async (c) => {
    await c.query('SELECT 1 FROM homes WHERE character_id = $1 FOR UPDATE', [characterId]);
    await lockCharacter(c, characterId);
    const r = await c.query('DELETE FROM homes WHERE character_id = $1', [characterId]);
    if (!r.rowCount) fail('no_home', 404);
    return { ok: true };
  });
}

/** Zamanlayıcı: vadesi gelen kiraları tahsil eder; parası yetmeyeni evden çıkarır. */
export async function processRent(): Promise<number> {
  let n = 0;
  for (;;) {
    const done = await tx(async (c) => {
      const h = await one(c, 'SELECT * FROM homes WHERE paid_until <= now() ORDER BY paid_until LIMIT 1 FOR UPDATE SKIP LOCKED');
      if (!h) return false;
      const ch = await lockCharacter(c, h.character_id);
      const home = HOME_BY_ID[h.home_id];
      const rent = home ? rentFor(home, CITY_BY_ID[h.city_id]?.costMult ?? 1) : 0;
      // VIP'e özel ev, VIP bitince yenilenmez
      const allowed = home && (!home.vip || (await characterIsVip(c, ch.id)));
      if (home && allowed && ch.money >= rent) {
        await c.query('UPDATE characters SET money = money - $2 WHERE id = $1', [ch.id, rent]);
        // Sunucu uzun süre kapalı kaldıysa geçmiş dönemler için tekrar tekrar kira kesilmez
        const next = Math.max(h.paid_until.getTime() + periodMs(), Date.now() + periodMs() / 7);
        await c.query('UPDATE homes SET paid_until = $2 WHERE character_id = $1', [ch.id, new Date(next)]);
        await notify(c, ch.id, 'rent_paid', { homeId: h.home_id, cityId: h.city_id, rent });
      } else {
        await c.query('DELETE FROM homes WHERE character_id = $1', [ch.id]);
        await addMoodlet(c, ch.id, 'evicted');
        await notify(c, ch.id, 'evicted', { homeId: h.home_id, cityId: h.city_id, rent, vipExpired: !allowed });
      }
      return true;
    });
    if (!done) break;
    n++;
  }
  return n;
}

/** Dinlenirken evin bonusu: sadece evin olduğu şehirdeyken ve cezaevinde değilken */
export async function homeRestBonus(db: Db, characterId: number, cityId: string | null) {
  if (!cityId) return null;
  const h = await one(db, 'SELECT home_id FROM homes WHERE character_id = $1 AND city_id = $2', [characterId, cityId]);
  return h ? HOME_BY_ID[h.home_id] ?? null : null;
}
