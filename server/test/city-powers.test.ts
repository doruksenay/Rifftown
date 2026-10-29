// Makam yetkileri: başkanın bilet vergisi, valinin işletme harcı, emniyet müdürünün devriyesi.
import {
  CRIME_BY_ID,
  OFFICE_BY_ID,
  POLICIES,
  businessFeeMult,
  clampPolicy,
  crimeChance,
  officeSalary,
  patrolAttendanceMult,
  patrolCrimeDelta,
  patrolSolveDelta,
  policyNews,
  solveChance,
  ticketTaxRate,
  CITY_BY_ID,
} from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { processDueGigs } from '../src/game/gigs';
import { cityPolicies, closeDueElections, ensureElections, payOfficeSalaries } from '../src/game/politics';
import { newPlayer, setVip, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

type Player = Awaited<ReturnType<typeof newPlayer>>;
const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
const gameMs = (hours: number) => (hours * 3_600_000) / config.gameSpeed;

async function slow<T>(fn: () => Promise<T>): Promise<T> {
  const prev = config.gameSpeed;
  config.gameSpeed = 3600;
  try {
    return await fn();
  } finally {
    config.gameSpeed = prev;
  }
}

/** Oyuncuyu doğrudan makama oturtur (seçim akışı politics testlerinde) */
async function seat(p: Player, cityId: string, office: string) {
  await q(
    `INSERT INTO office_holders(city_id, office, character_id) VALUES ($1, $2, $3)
     ON CONFLICT (city_id, office) DO UPDATE SET character_id = EXCLUDED.character_id, since = now(), last_paid_at = now()`,
    [cityId, office, p.character.id],
  );
}
const decide = (p: Player, cityId: string, office: string, level: number) => p.c.post('/api/offices/policy', { cityId, office, level });

describe('kurallar: dar aralık ve tavanlar', () => {
  it('her kararın aralığı dar, aralık dışı değer tavana çekilir', () => {
    expect([POLICIES.mayor.min, POLICIES.mayor.max]).toEqual([0, 5]);
    expect([POLICIES.governor.min, POLICIES.governor.max]).toEqual([-2, 2]);
    expect([POLICIES.police_chief.min, POLICIES.police_chief.max]).toEqual([-1, 2]);
    expect(ticketTaxRate(5)).toBeCloseTo(0.05);
    expect(ticketTaxRate(99)).toBeCloseTo(0.05);
    expect(ticketTaxRate(-3)).toBe(0);
    expect(businessFeeMult(-2)).toBe(0.8);
    expect(businessFeeMult(2)).toBe(1.2);
    expect(businessFeeMult(9)).toBe(1.2);
    expect(patrolCrimeDelta(2)).toBeCloseTo(-0.06);
    expect(patrolCrimeDelta(-1)).toBeCloseTo(0.03);
    expect(patrolCrimeDelta(-9)).toBeCloseTo(0.03);
    expect(patrolSolveDelta(2)).toBeCloseTo(0.06);
    expect(patrolAttendanceMult(2)).toBeCloseTo(0.98);
    expect(patrolAttendanceMult(-1)).toBe(1);
    expect(clampPolicy('police_chief', 7)).toBe(2);
  });

  it('hiçbir karar maaşı artırmaz; valinin indirimi maaşından düşer', () => {
    for (const o of ['mayor', 'governor', 'police_chief'] as const) {
      const base = OFFICE_BY_ID[o].salaryPerDay;
      for (let lvl = POLICIES[o].min; lvl <= POLICIES[o].max; lvl++) expect(officeSalary(base, o, lvl)).toBeLessThanOrEqual(base);
    }
    expect(officeSalary(500, 'governor', -2)).toBe(400);
    expect(officeSalary(500, 'governor', 2)).toBe(500);
  });

  it('devriye suç ve soruşturma şanslarını dar aralıkta değiştirir; mevcut sınırlar (%8–%92, %10–%90) korunur', () => {
    const def = CRIME_BY_ID.pickpocket;
    const base = crimeChance(def, { stealth: 40, street_smarts: 40 }, 0);
    expect(crimeChance(def, { stealth: 40, street_smarts: 40 }, 0, patrolCrimeDelta(2))).toBeCloseTo(base - 0.06);
    expect(crimeChance(def, { stealth: 100, street_smarts: 100 }, 0, patrolCrimeDelta(-1))).toBeLessThanOrEqual(0.92);
    expect(crimeChance(CRIME_BY_ID.burglary, {}, 10, patrolCrimeDelta(2))).toBeGreaterThanOrEqual(0.08);
    expect(solveChance({ law: 100, investigation: 100 }, 'agent', {}, patrolSolveDelta(2))).toBeLessThanOrEqual(0.9);
    expect(solveChance({}, 'police', { stealth: 100 }, patrolSolveDelta(-1))).toBeGreaterThanOrEqual(0.1);
  });

  it('haber metni kelimeyle: kesin sayı içermez, iki dilli', () => {
    for (const id of ['ticket_tax', 'business_fee', 'patrol'] as const) {
      for (const ch of ['up', 'down', 'reset'] as const) {
        const n = policyNews(id, ch, 'Ayşe Kaya', CITY_BY_ID.istanbul.name);
        for (const t of [n.tr.title, n.tr.body, n.en.title, n.en.body]) {
          expect(t.length).toBeGreaterThan(5);
          expect(t).not.toMatch(/\d|%/);
        }
      }
    }
  });
});

describe('karar verme', () => {
  it('VIP olmayan makam sahibi karar veremez; makam sahibi olmayan VIP de veremez; aralık dışı reddedilir', async () => {
    const holder = await newPlayer({ cityId: 'ankara' });
    await seat(holder, 'ankara', 'mayor');
    const r = await decide(holder, 'ankara', 'mayor', 2);
    expect(r.status).toBe(403);
    expect(r.body.error).toBe('vip_required');
    const other = await newPlayer({ cityId: 'ankara' });
    await setVip(other.userId);
    expect((await decide(other, 'ankara', 'mayor', 2)).body.error).toBe('not_office_holder');
    expect((await decide(other, 'ankara', 'governor', 1)).body.error).toBe('not_office_holder');
    await setVip(holder.userId);
    expect((await decide(holder, 'ankara', 'mayor', 6)).body.error).toBe('invalid_level');
    expect((await decide(holder, 'ankara', 'mayor', -1)).body.error).toBe('invalid_level');
    expect((await decide(holder, 'ankara', 'king', 1)).body.error).toBe('invalid_office');
    // Başka makamın kararı verilemez
    expect((await decide(holder, 'ankara', 'police_chief', 1)).body.error).toBe('not_office_holder');
    expect((await q(`SELECT count(*)::int AS n FROM policy_log WHERE city_id = 'ankara'`)).rows[0].n).toBe(0);
    expect((await cityPolicies(pool, 'ankara')).mayor).toBe(0);
  });

  it('karar kaydedilir (kim, ne zaman, eski/yeni), şehir haberi olur; günde bir kez değişir', () =>
    slow(async () => {
      const mayor = await newPlayer({ name: 'Baskan Deniz', cityId: 'izmir' });
      await setVip(mayor.userId);
      await seat(mayor, 'izmir', 'mayor');
      const r = await decide(mayor, 'izmir', 'mayor', 3);
      expect(r.status).toBe(200);
      expect(r.body).toMatchObject({ changed: true, policyLevel: 3, oldLevel: 0 });
      const log = (await q(`SELECT * FROM policy_log WHERE city_id = 'izmir'`)).rows;
      expect(log).toHaveLength(1);
      expect(log[0]).toMatchObject({ office: 'mayor', policy: 'ticket_tax', old_level: 0, new_level: 3, reason: 'set' });
      expect(Number(log[0].character_id)).toBe(mayor.character.id);
      expect(log[0].created_at).toBeInstanceOf(Date);
      const art = (await q('SELECT * FROM articles WHERE id = $1', [log[0].article_id])).rows[0];
      expect(art).toMatchObject({ city_id: 'izmir', kind: 'news', author_id: null, impact: 0 });
      expect(art.body).toContain('Baskan Deniz');
      expect(art.title_en).toBeTruthy();
      expect(`${art.title} ${art.body} ${art.title_en} ${art.body_en}`).not.toMatch(/\d|%/);
      // Haber şehir gazetesinde herkese görünür
      const reader = await newPlayer({ cityId: 'izmir' });
      const news = (await reader.c.get('/api/cities/izmir/news')).body.articles;
      expect(news.find((a: any) => a.id === Number(art.id))).toMatchObject({ title: art.title, titleEn: art.title_en, author: null });
      // Aynı değer: değişiklik yok, kayıt yok
      expect((await decide(mayor, 'izmir', 'mayor', 3)).body.changed).toBe(false);
      // Bekleme süresi
      const again = await decide(mayor, 'izmir', 'mayor', 5);
      expect(again.status).toBe(429);
      expect(again.body.error).toBe('policy_cooldown');
      expect((await mayor.c.get('/api/civic/izmir')).body.policies.find((x: any) => x.office === 'mayor')).toMatchObject({ canChange: false });
      await q(`UPDATE policy_log SET created_at = created_at - $2 * interval '1 millisecond' WHERE city_id = $1`, ['izmir', gameMs(25)]);
      expect((await decide(mayor, 'izmir', 'mayor', 5)).status).toBe(200);
      expect((await cityPolicies(pool, 'izmir')).mayor).toBe(5);
    }));

  it('VIP olmayana karar yalnızca yönüyle gider; VIP kesin değeri görür', async () => {
    const chief = await newPlayer({ cityId: 'berlin' });
    await setVip(chief.userId);
    await seat(chief, 'berlin', 'police_chief');
    expect((await decide(chief, 'berlin', 'police_chief', 2)).status).toBe(200);
    const vipView = (await chief.c.get('/api/civic/berlin')).body;
    expect(vipView.policies.find((x: any) => x.office === 'police_chief').policyLevel).toBe(2);
    expect(vipView.policyLog[0]).toMatchObject({ oldLevel: 0, newLevel: 2, reason: 'set' });
    const plain = await newPlayer({ cityId: 'berlin' });
    const view = (await plain.c.get('/api/civic/berlin')).body;
    expect(view.policies.find((x: any) => x.office === 'police_chief')).toMatchObject({ policyLevel: 1, setBy: { characterId: chief.character.id } });
    expect(view.policyLog[0]).toMatchObject({ oldLevel: 0, newLevel: 1 });
    // Varsayılandaki kararlar 0
    expect(view.policies.find((x: any) => x.office === 'mayor').policyLevel).toBe(0);
  });
});

describe('etkiler', () => {
  it('bilet vergisi gelirden kesilir, oyundan çıkar; başkanın parası artmaz', () =>
    slow(async () => {
      const mayor = await newPlayer({ cityId: 'hamburg' });
      await setVip(mayor.userId);
      await seat(mayor, 'hamburg', 'mayor');
      expect((await decide(mayor, 'hamburg', 'mayor', 5)).status).toBe(200);
      const mayorMoney = (await q('SELECT money FROM characters WHERE id = $1', [mayor.character.id])).rows[0].money;
      const p = await newPlayer({ cityId: 'hamburg' });
      await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Vergi', 'rock', 60)`, [p.character.id]);
      const band = (await p.c.post('/api/bands', { name: `Vergi ${p.character.id}`, genre: 'rock', role: 'guitar' })).body.band;
      await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'hamburg', 60) ON CONFLICT (band_id, city_id) DO UPDATE SET fame = 60`, [band.id]);
      const before = (await q('SELECT money FROM characters WHERE id = $1', [p.character.id])).rows[0].money;
      await q(`INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist) VALUES ($1, 'hamburg', 'hamburg-club', now() - interval '1 second', $2)`, [band.id, [band.songs[0].id]]);
      await processDueGigs();
      const g = (await q(`SELECT result FROM gigs WHERE band_id = $1 AND status = 'done'`, [band.id])).rows[0].result;
      expect(g.cityTax).toBeGreaterThan(0);
      expect(g.cityTax).toBe(Math.floor((g.revenue + g.cityTax + (g.crewFee ?? 0)) * 0.05));
      const after = (await q('SELECT money FROM characters WHERE id = $1', [p.character.id])).rows[0].money;
      expect(after - before).toBe(g.perMember);
      expect((await q('SELECT money FROM characters WHERE id = $1', [mayor.character.id])).rows[0].money).toBe(mayorMoney);
    }));

  it('devriye: şehirdeki suç şansı düşer (soruşturma şansı artar), seçenekler ekranı aynı değeri gösterir', async () => {
    const chief = await newPlayer({ cityId: 'munich' });
    await setVip(chief.userId);
    await seat(chief, 'munich', 'police_chief');
    const thief = await newPlayer({ cityId: 'munich' });
    await setVip(thief.userId);
    await q(`UPDATE characters SET skills = skills || '{"stealth": 40, "street_smarts": 40}' WHERE id = $1`, [thief.character.id]);
    const before = (await thief.c.get('/api/crime/options?locationId=munich-park')).body.options.find((o: any) => o.id === 'pickpocket').chance;
    expect((await decide(chief, 'munich', 'police_chief', 2)).status).toBe(200);
    const after = (await thief.c.get('/api/crime/options?locationId=munich-park')).body.options.find((o: any) => o.id === 'pickpocket').chance;
    expect(after).toBeCloseTo(before - 0.06, 2);
  });

  it('sıkı devriye şehirdeki konser seyircisini basamak başına %1 azaltır (aynı koşullarda)', () =>
    slow(async () => {
      const chief = await newPlayer({ cityId: 'liverpool' });
      await setVip(chief.userId);
      await seat(chief, 'liverpool', 'police_chief');
      const bands = [];
      for (const n of [1, 2]) {
        const p = await newPlayer({ cityId: 'liverpool' });
        await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Devriye', 'rock', 50)`, [p.character.id]);
        const band = (await p.c.post('/api/bands', { name: `Devriye ${n} ${p.character.id}`, genre: 'rock', role: 'guitar' })).body.band;
        await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'liverpool', 25) ON CONFLICT (band_id, city_id) DO UPDATE SET fame = 25`, [band.id]);
        bands.push(band);
      }
      const play = async (band: any) => {
        await q(`INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist) VALUES ($1, 'liverpool', 'liverpool-club', now() - interval '1 second', $2)`, [band.id, [band.songs[0].id]]);
        const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
        try {
          await processDueGigs();
        } finally {
          spy.mockRestore();
        }
        return (await q(`SELECT result FROM gigs WHERE band_id = $1 AND status = 'done'`, [band.id])).rows[0].result.attendance as number;
      };
      const normal = await play(bands[0]);
      expect((await decide(chief, 'liverpool', 'police_chief', 2)).status).toBe(200);
      const tight = await play(bands[1]);
      expect(normal).toBeGreaterThan(50);
      expect(tight).toBeLessThan(normal);
      expect(tight).toBeGreaterThanOrEqual(Math.floor(normal * 0.98) - 1);
    }));

  it('vali: işletme gideri ×0,8–×1,2; indirimin bedeli valinin maaşından', async () => {
    const gov = await newPlayer({ cityId: 'london' });
    await setVip(gov.userId);
    await seat(gov, 'london', 'governor');
    const loc = 'london-biz1';
    const base = (await gov.c.get(`/api/businesses/${loc}`)).body.business.upkeep;
    expect((await decide(gov, 'london', 'governor', -2)).status).toBe(200);
    const cut = (await gov.c.get(`/api/businesses/${loc}`)).body.business.upkeep;
    expect(cut).toBe(Math.round(base * 0.8));
    // Maaş: günde 500 yerine 400
    const m0 = (await q('SELECT money FROM characters WHERE id = $1', [gov.character.id])).rows[0].money;
    await q(`UPDATE office_holders SET last_paid_at = now() - $1 * interval '1 millisecond' WHERE city_id = 'london' AND office = 'governor'`, [gameMs(24.5)]);
    await payOfficeSalaries();
    const m1 = (await q('SELECT money FROM characters WHERE id = $1', [gov.character.id])).rows[0].money;
    expect(m1 - m0).toBe(400);
  });
});

describe('makam el değiştirince', () => {
  it('seçimle yeni biri gelince karar sıfırlanır (kayıt ve haber); aynı kişi yeniden seçilirse kalır', async () => {
    const a = await newPlayer({ cityId: 'paris' });
    const b = await newPlayer({ cityId: 'paris' });
    await setVip(a.userId);
    await seat(a, 'paris', 'mayor');
    expect((await decide(a, 'paris', 'mayor', 4)).status).toBe(200);
    await ensureElections();
    // Aynı kişi yeniden seçilir: karar kalır
    let e = (await q(`SELECT id FROM elections WHERE city_id = 'paris' AND office = 'mayor' AND status = 'open'`)).rows[0].id;
    await q(`INSERT INTO election_candidates(election_id, character_id) VALUES ($1, $2)`, [e, a.character.id]);
    await q(`UPDATE elections SET ends_at = now() - interval '1 second' WHERE id = $1`, [e]);
    await closeDueElections();
    expect((await cityPolicies(pool, 'paris')).mayor).toBe(4);
    // Başkası kazanır: sıfırlanır
    await ensureElections();
    e = (await q(`SELECT id FROM elections WHERE city_id = 'paris' AND office = 'mayor' AND status = 'open'`)).rows[0].id;
    await q(`INSERT INTO election_candidates(election_id, character_id) VALUES ($1, $2)`, [e, b.character.id]);
    await q(`UPDATE elections SET ends_at = now() - interval '1 second' WHERE id = $1`, [e]);
    await closeDueElections();
    expect((await cityPolicies(pool, 'paris')).mayor).toBe(0);
    const reset = (await q(`SELECT * FROM policy_log WHERE city_id = 'paris' AND reason = 'reset'`)).rows;
    expect(reset).toHaveLength(1);
    expect(reset[0]).toMatchObject({ old_level: 4, new_level: 0 });
    expect(Number(reset[0].character_id)).toBe(a.character.id);
    expect(reset[0].article_id).not.toBeNull();
    // Yeni başkan sıfırdan başlar; eski başkan artık karar veremez
    expect((await decide(a, 'paris', 'mayor', 1)).body.error).toBe('not_office_holder');
  });

  it('NPC makam sahibi karar vermez: yetki varsayılanda kalır', async () => {
    const npc = (
      await q(
        `INSERT INTO characters(user_id, npc, name, avatar_color, main_instrument, money, mood, health, city_id, skills) VALUES (NULL, TRUE, 'Yedek Vali', '#000000', 'vocals', 0, 80, 100, 'lyon', '{}') RETURNING id`,
      )
    ).rows[0].id;
    await q(`INSERT INTO office_holders(city_id, office, character_id) VALUES ('lyon', 'police_chief', $1)`, [npc]);
    // Elle yazılmış (ya da eski) bir karar satırı olsa bile NPC'de geçerli değildir
    await q(`INSERT INTO city_policies(city_id, office, level, holder_id) VALUES ('lyon', 'police_chief', 2, $1)`, [npc]);
    expect((await cityPolicies(pool, 'lyon')).police_chief).toBe(0);
    const viewer = await newPlayer({ cityId: 'lyon' });
    await setVip(viewer.userId);
    expect((await viewer.c.get('/api/civic/lyon')).body.policies.find((x: any) => x.office === 'police_chief')).toMatchObject({ policyLevel: 0, setBy: null });
  });

  it('makam sahibi mirasını devredip emekliye ayrılınca karar sıfırlanır', async () => {
    const chief = await newPlayer({ name: 'Emniyet Yilmaz', cityId: 'marseille' });
    await setVip(chief.userId);
    await seat(chief, 'marseille', 'police_chief');
    expect((await decide(chief, 'marseille', 'police_chief', -1)).status).toBe(200);
    await q(`UPDATE characters SET created_at = created_at - $2 * interval '1 millisecond' WHERE id = $1`, [chief.character.id, gameMs(30 * 24)]);
    const kid = (await q(`INSERT INTO children(parent_a, name, born_at) VALUES ($1, 'Ece', $2) RETURNING id`, [chief.character.id, new Date(Date.now() - gameMs(20 * 56 * 24))])).rows[0].id;
    const r = await chief.c.post('/api/succession', { childId: Number(kid), cityId: 'marseille', mainInstrument: 'guitar', favoriteGenre: 'rock' });
    expect(r.status).toBe(200);
    expect((await cityPolicies(pool, 'marseille')).police_chief).toBe(0);
    expect((await q(`SELECT 1 FROM policy_log WHERE city_id = 'marseille' AND reason = 'reset'`)).rowCount).toBe(1);
    expect((await q(`SELECT 1 FROM office_holders WHERE city_id = 'marseille' AND office = 'police_chief'`)).rowCount).toBe(0);
  });
});
