// Kayıp ve sonuç: aşinalık çürümesi, şöhret azalması, üye ayrılma, iptal cezası, yaş, bağımlılık, skandal, hastane, ölüm
import {
  ADDICTION_THRESHOLD,
  FAME_GRACE_DAYS,
  FAMILIARITY_FLOOR,
  FAMILIARITY_GRACE_DAYS,
  HOSPITALIZE_HEALTH,
  NEGLECT_DEATH_HOURS,
  ageLearnFactor,
  ageOf,
  cancelFamePenalty,
  decayedFamiliarity,
  fameDecay,
  oldAgeDeathChancePerDay,
  ticketsSold,
} from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import {
  processAddiction,
  processFameDecay,
  processFamiliarityDecay,
  processHospitalizations,
  processMortality,
} from '../src/game/consequences';
import { advance, me, newPlayer, raw, setMoney, setSkills, setVip, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
/** n oyun gününün gerçek milisaniyesi */
const days = (n: number) => (n * 86_400_000) / config.gameSpeed;

async function slow<T>(fn: () => Promise<T>): Promise<T> {
  const prev = config.gameSpeed;
  config.gameSpeed = 3600;
  try {
    return await fn();
  } finally {
    config.gameSpeed = prev;
  }
}

async function bandOf(p: Awaited<ReturnType<typeof newPlayer>>, songs = 1) {
  for (let i = 0; i < songs; i++) await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, $2, 'rock', 40)`, [p.character.id, `T${i}`]);
  return (await p.c.post('/api/bands', { name: `Sonuç ${p.character.id}`, genre: 'rock', role: 'guitar' })).body.band;
}

describe('kurallar', () => {
  it('çürüme, azalma, iptal cezası ve yaş formülleri', () => {
    expect(decayedFamiliarity(80, FAMILIARITY_GRACE_DAYS)).toBe(80);
    expect(decayedFamiliarity(80, FAMILIARITY_GRACE_DAYS + 10)).toBeLessThan(80);
    expect(decayedFamiliarity(80, 1000)).toBe(FAMILIARITY_FLOOR);
    expect(fameDecay(50, 1)).toBeCloseTo(0.5);
    expect(fameDecay(2, 1)).toBeCloseTo(0.05);
    expect(fameDecay(0.02, 10)).toBe(0.02); // şöhretin kendisinden fazlası düşmez
    expect(ticketsSold(100, 0, 24)).toBe(10);
    expect(ticketsSold(100, 24, 24)).toBe(100);
    expect(cancelFamePenalty('bar', 0)).toBe(0.5);
    expect(cancelFamePenalty('hall', 2000)).toBeGreaterThan(cancelFamePenalty('bar', 80));
    expect(cancelFamePenalty('stadium', 20000)).toBeLessThanOrEqual(6);
    const born = new Date(Date.now() - 56 * 86_400_000);
    expect(ageOf(born, 1)).toBeCloseTo(19);
    expect(ageLearnFactor(30)).toBe(1);
    expect(ageLearnFactor(55)).toBeCloseTo(0.8);
    expect(ageLearnFactor(200)).toBe(0.6);
    expect(oldAgeDeathChancePerDay(60)).toBe(0);
    expect(oldAgeDeathChancePerDay(95)).toBeGreaterThan(0);
  });
});

describe('çürüme ve azalma (zamanlayıcı)', () => {
  it('uzun süre çalınmayan şarkı unutulur; prova çürümeyi sıfırlar', () => slow(async () => {
    const p = await newPlayer();
    await setSkills(p.character.id, { genre_rock: 100 }); // aşinalık tavanı 100
    const band = await bandOf(p);
    const song = band.songs[0].id;
    await q('INSERT INTO familiarity(character_id, song_id, value, touched_at) VALUES ($1, $2, 80, now() - $3 * interval \'1 millisecond\')', [
      p.character.id,
      song,
      days(FAMILIARITY_GRACE_DAYS + 10),
    ]);
    await processFamiliarityDecay();
    const after = (await q('SELECT value FROM familiarity WHERE character_id = $1', [p.character.id])).rows[0].value;
    expect(after).toBeLessThan(80);
    expect(after).toBeGreaterThanOrEqual(FAMILIARITY_FLOOR);
    // İkinci tur hemen çalışırsa aynı günleri tekrar düşmez
    await processFamiliarityDecay();
    expect((await q('SELECT value FROM familiarity WHERE character_id = $1', [p.character.id])).rows[0].value).toBeCloseTo(after, 3);
    // Prova dokunur: süre baştan başlar
    await p.c.post('/api/actions', { kind: 'rehearse', songId: song, hours: 1, locationId: 'istanbul-studio' });
    await q(`UPDATE actions SET ends_at = now() WHERE character_id = $1 AND status = 'active'`, [p.character.id]);
    await advance(5);
    const row = (await q('SELECT value, decayed_at FROM familiarity WHERE character_id = $1', [p.character.id])).rows[0];
    expect(row.value).toBeGreaterThan(after);
    expect(row.decayed_at).toBeNull();
  }));

  it('o şehirde uzun süre konser vermeyen grubun şöhreti azalır; oyunun grupları etkilenmez', async () => {
    const p = await newPlayer();
    const band = await bandOf(p);
    await q(`INSERT INTO band_fame(band_id, city_id, fame, active_at) VALUES ($1, 'istanbul', 40, now() - $2 * interval '1 millisecond')`, [
      band.id,
      days(FAME_GRACE_DAYS + 5),
    ]);
    await q(`INSERT INTO band_fame(band_id, city_id, fame, active_at) VALUES ($1, 'ankara', 40, now())`, [band.id]);
    await processFameDecay();
    const rows = (await q('SELECT city_id, fame FROM band_fame WHERE band_id = $1 ORDER BY city_id', [band.id])).rows;
    expect(rows.find((r) => r.city_id === 'istanbul').fame).toBeLessThan(40);
    expect(rows.find((r) => r.city_id === 'ankara').fame).toBe(40);
  });
});

describe('grup kayıpları', () => {
  it('üye ayrılınca ya da çıkarılınca şöhret düşer (deneme süresi hariç)', () => slow(async () => {
    const leader = await newPlayer();
    const friend = await newPlayer({ instrument: 'drums' });
    const band = await bandOf(leader);
    await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 50)`, [band.id]);
    // Yeni katılan üye: ceza yok
    await q('INSERT INTO band_members(band_id, character_id, role) VALUES ($1, $2, $3)', [band.id, friend.character.id, 'drums']);
    expect((await friend.c.post('/api/bands/mine/leave')).body).toMatchObject({ ok: true, fameLost: false });
    expect((await q('SELECT fame FROM band_fame WHERE band_id = $1', [band.id])).rows[0].fame).toBe(50);
    // Uzun süredir üye: ceza
    await q(`INSERT INTO band_members(band_id, character_id, role, joined_at) VALUES ($1, $2, 'drums', now() - interval '1 day')`, [band.id, friend.character.id]);
    expect((await leader.c.post('/api/bands/mine/kick', { characterId: friend.character.id })).body).toMatchObject({ ok: true, fameLost: true });
    expect((await q('SELECT fame FROM band_fame WHERE band_id = $1', [band.id])).rows[0].fame).toBeLessThan(50);
  }));

  it('iptalin cezası satılan biletle büyür; çoğu satılmışsa skandal', () =>
    slow(async () => {
      const p = await newPlayer();
      const band = await bandOf(p);
      await setVip(p.userId);
      await q(`UPDATE gigs SET status = 'cancelled' WHERE location_id = 'istanbul-bar' AND status = 'scheduled'`);
      await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 70)`, [band.id]);
      const early = (await p.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 24, setlist: [band.songs[0].id] })).body.gig;
      const e = (await p.c.del(`/api/gigs/${early.id}`)).body;
      // Konsere az kalmış: rezervasyon zamanı geriye çekilir
      const late = (await p.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 24, setlist: [band.songs[0].id] })).body.gig;
      await q(`UPDATE gigs SET created_at = now() - interval '23 seconds', starts_at = now() + interval '1 second' WHERE id = $1`, [late.id]);
      const l = (await p.c.del(`/api/gigs/${late.id}`)).body;
      expect(l.ticketsSold).toBeGreaterThan(e.ticketsSold);
      expect(l.famePenalty).toBeGreaterThan(e.famePenalty);
      const sc = (await q(`SELECT kind FROM scandals WHERE band_id = $1`, [band.id])).rows;
      expect(sc.map((x) => x.kind)).toContain('cancel');
      const notes = (await p.c.get('/api/notifications')).body.notifications;
      expect(notes.some((n: any) => n.kind === 'scandal')).toBe(true);
    }));
});

describe('bağımlılık, hastane ve ölüm', () => {
  it('aşırı yemek ve alışveriş bağımlılık yapar; tedavi iyileştirir', () => slow(async () => {
    const p = await newPlayer();
    await setMoney(p.character.id, 50000);
    await q(`UPDATE characters SET indulgence = $2, indulgence_at = now() WHERE id = $1`, [p.character.id, ADDICTION_THRESHOLD - 1]);
    const buy = await p.c.post('/api/shop/buy', { locationId: 'istanbul-boutique', itemId: 'outfit_2' });
    expect(buy.status).toBe(200);
    const m = await me(p.c);
    expect(m.character.addicted).toBe(true);
    // İsteğini gideremeyen bağımlının canı çeker
    await q(`UPDATE characters SET indulged_at = now() - interval '1 day' WHERE id = $1`, [p.character.id]);
    expect((await me(p.c)).character.moodlets.some((x: any) => x.id === 'craving')).toBe(true);
    // Hastanede tedavi
    for (let i = 0; i < 2; i++) {
      expect((await p.c.post('/api/actions', { kind: 'treat', locationId: 'istanbul-hospital', hours: 4 })).status).toBe(200);
      await q(`UPDATE actions SET ends_at = now() WHERE character_id = $1 AND status = 'active'`, [p.character.id]);
      await advance(1);
    }
    expect((await me(p.c)).character.addicted).toBe(false);
    // Zaman da iyileştirir
    await q(`UPDATE characters SET addicted_since = now(), indulgence = 0 WHERE id = $1`, [p.character.id]);
    await processAddiction();
    expect((await me(p.c)).character.addicted).toBe(false);
  }));

  it('sağlığı çok düşen boştaki karakter hastaneye kaldırılır; parası yetmese de borçlanmaz', async () => {
    const p = await newPlayer();
    await setMoney(p.character.id, 20);
    await q('UPDATE characters SET health = $2 WHERE id = $1', [p.character.id, HOSPITALIZE_HEALTH - 5]);
    expect(await processHospitalizations()).toBeGreaterThanOrEqual(1);
    const m = await me(p.c);
    expect(m.action?.kind).toBe('treat');
    expect((await raw(p.character.id)).money).toBe(0);
    await advance(10);
    expect((await raw(p.character.id)).health).toBeGreaterThan(HOSPITALIZE_HEALTH);
  });

  it('mahkûmiyet grup için skandaldır', async () => {
    const p = await newPlayer();
    const band = await bandOf(p);
    await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 30)`, [band.id]);
    // Suç üstü yakalanma: dava, sonra zamanlayıcı normal cezayı verir
    await q(`INSERT INTO crimes(character_id, city_id, location_id, kind, success, loot, status) VALUES ($1, 'istanbul', 'istanbul-park', 'pickpocket', false, 0, 'caught')`, [p.character.id]);
    const crime = (await q('SELECT id FROM crimes WHERE character_id = $1', [p.character.id])).rows[0].id;
    await q(`INSERT INTO cases(crime_id, suspect_id, city_id, due_at) VALUES ($1, $2, 'istanbul', now() - interval '1 second')`, [crime, p.character.id]);
    await advance(5);
    expect((await q(`SELECT kind FROM scandals WHERE band_id = $1`, [band.id])).rows.map((r) => r.kind)).toContain('conviction');
    expect((await q('SELECT fame FROM band_fame WHERE band_id = $1 AND city_id = $2', [band.id, 'istanbul'])).rows[0].fame).toBeLessThan(30);
  });

  it('PERMADEATH kapalıyken kimse ölmez; açıkken ihmal öldürür, miras yeni karaktere bir kez geçer', async () => {
    const p = await newPlayer();
    await setMoney(p.character.id, 3000);
    await q(`UPDATE characters SET health = 1, critical_since = now() - $2 * interval '1 millisecond' WHERE id = $1`, [
      p.character.id,
      ((NEGLECT_DEATH_HOURS + 1) * 3_600_000) / config.gameSpeed,
    ]);
    expect(config.permadeath).toBe(false);
    await processMortality();
    expect((await me(p.c)).character).not.toBeNull();
    config.permadeath = true;
    try {
      expect(await processMortality()).toBeGreaterThanOrEqual(1);
    } finally {
      config.permadeath = false;
    }
    const m = await me(p.c);
    expect(m.character).toBeNull();
    expect(m.death).toMatchObject({ cause: 'neglect', inheritance: 1500 });
    // Ölen karakter aramada ve sosyal hedeflerde görünmez
    const other = await newPlayer();
    expect((await other.c.post(`/api/friends/${p.character.id}`)).status).toBe(404);
    const again = await p.c.post('/api/character', { name: 'Yeni Hayat', cityId: 'istanbul', mainInstrument: 'guitar' });
    expect(again.status).toBe(200);
    expect(again.body.character.money).toBe(500 + 1500);
    // Miras ikinci kez alınamaz
    expect((await q('SELECT inherited FROM characters WHERE id = $1', [p.character.id])).rows[0].inherited).toBe(0);
  });
});
