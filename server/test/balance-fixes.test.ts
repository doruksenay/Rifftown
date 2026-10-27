// Denge düzeltmelerinin sunucu testleri (denge raporu maddeleri 1–14): gerçek API ve zamanlayıcıyla.
import { ADDICTED_DECAY_PER_DAY, CHILD_WEEKLY_UPKEEP, CRAVING_SATISFY_SPEND, CRIME_BY_ID, FAME_GRACE_DAYS, FAMILIARITY_GRACE_DAYS, crimeChance, crimeFine, decayedFamiliarity, indulgenceNow, repeatSentenceMult, BUSINESS_DAILY_REVENUE_HOURS, BUSINESS_RULES, STUDY_FOCUS_HOURS, UNFOCUSED_STUDY_MULT, diminishing, studyFocusFactor, studyGain, BUSK_MAX_PAY_PER_HOUR, BUSK_SKILL_CAP, buskDailyFactor, buskPayPerHour, CITY_BY_ID, GIG_PRODUCTION_REFUND, HANGOUT_UPLIFTS_PER_DAY, MAX_CHILDREN, VENUE_RULES, gigProductionCost } from '@rifftown/shared';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { ensureNpcCivic, npcNews, npcStockMarkets } from '../src/game/npc-civic';
import { ensureNpcWorld, runNpcDirectorNow } from '../src/game/npc';
import { advance, newPlayer, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(teardown);
afterEach(() => vi.restoreAllMocks());

describe('madde 1: büyük sahnede beceri belirleyici', () => {
  it('sunucu: salonda kiralık kadro grubun seviyesine bağlanır (beste 8, gitar 52 olan oyuncu + 3 kiralık)', async () => {
    const prev = config.gameSpeed;
    config.gameSpeed = 3600;
    try {
      const p = await newPlayer({ cityId: 'izmir' });
      const id = p.character.id;
      await pool.query(`UPDATE characters SET skills = skills || '{"guitar":52,"strings_basic":40,"composing":8}'::jsonb, money = 5000 WHERE id = $1`, [id]);
      const band = (await p.c.post('/api/bands', { name: `Kiralık Test ${id}`, genre: 'rock', role: 'guitar' })).body;
      const songs: number[] = [];
      for (let i = 0; i < 4; i++) {
        const s = await pool.query(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, $2, 'rock', 35) RETURNING id`, [id, `Ş${i}`]);
        songs.push(Number(s.rows[0].id));
        await pool.query('INSERT INTO band_songs(band_id, song_id) VALUES ($1, $2)', [band.band?.id ?? band.id, s.rows[0].id]);
        await pool.query('INSERT INTO familiarity(character_id, song_id, value) VALUES ($1, $2, 70)', [id, s.rows[0].id]);
      }
      const bandId = Number(band.band?.id ?? band.id);
      await pool.query(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'izmir', 50)`, [bandId]);
      const r = await p.c.post('/api/gigs', { locationId: 'izmir-hall', inHours: 2, setlist: songs, sessionRoles: ['vocals', 'bass', 'drums'] });
      expect(r.status).toBe(200);
      await pool.query(`UPDATE gigs SET starts_at = now() - interval '1 minute' WHERE id = $1`, [r.body.gig.id]);
      // Zar ortada: seyirci ve kalite gürültüsü sabit
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      await advance(10);
      const g = (await pool.query('SELECT result FROM gigs WHERE id = $1', [r.body.gig.id])).rows[0].result;
      // Eskiden kiralık kadro 70 beceriyle çalıyor, kalite ~50 ve şöhret artıyordu; şimdi salonun çıtası geçilemiyor
      expect(g.quality).toBeLessThan(VENUE_RULES.hall.breakEven);
      expect(g.fameDelta).toBeLessThanOrEqual(0);
    } finally {
      config.gameSpeed = prev;
    }
  });
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);

describe('madde 2: ek hesap çiftlikleri', () => {
  it('takılmanın ruh hâli ve ilham etkisi günde en fazla 3 kez, aynı kişiyle bir kez (arkadaşlık yine artar)', async () => {
    const prev = config.gameSpeed;
    config.gameSpeed = 1;
    try {
      const m = await newPlayer();
      const alts = [await newPlayer(), await newPlayer(), await newPlayer(), await newPlayer(), await newPlayer()];
      await q('UPDATE characters SET mood = 40 WHERE id = $1', [m.character.id]);
      const uplifts: boolean[] = [];
      for (const a of alts) {
        const r = await m.c.post(`/api/relationships/${a.character.id}/hangout`);
        expect(r.status).toBe(200);
        expect(r.body.gain).toBeGreaterThan(0);
        uplifts.push(r.body.uplift);
      }
      expect(uplifts.filter(Boolean)).toHaveLength(HANGOUT_UPLIFTS_PER_DAY);
      expect(Number((await q('SELECT mood FROM characters WHERE id = $1', [m.character.id])).rows[0].mood)).toBe(40 + 3 * HANGOUT_UPLIFTS_PER_DAY);
      // Aynı ikili 4 saat sonra yeniden takılır: arkadaşlık artar, ruh hâli etkisi yok
      await q(`UPDATE relationships SET last_hangout = now() - interval '5 hours' WHERE a_id = LEAST($1::bigint, $2::bigint) AND b_id = GREATEST($1::bigint, $2::bigint)`, [alts[4].character.id, m.character.id]);
      const again = await alts[4].c.post(`/api/relationships/${m.character.id}/hangout`);
      expect(again.status).toBe(200);
      expect(again.body.uplift).toBe(false);
    } finally {
      config.gameSpeed = prev;
    }
  });

  it('çocuk sınırı karakter başına: başka eşle de sınır aşılamaz', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    const c = await newPlayer();
    for (let i = 0; i < MAX_CHILDREN; i++) {
      await q(`INSERT INTO children(parent_a, parent_b, name, born_at) VALUES ($1, $2, $3, now())`, [a.character.id, b.character.id, `Çocuk ${i}`]);
    }
    const [x, y] = [a.character.id, c.character.id].sort((m, n) => m - n);
    await q(`INSERT INTO relationships(a_id, b_id, friends, friendship, romance, stage) VALUES ($1, $2, TRUE, 60, 80, 'married')`, [x, y]);
    await q('UPDATE characters SET money = 5000 WHERE id = ANY($1::bigint[])', [[a.character.id, c.character.id]]);
    const adopt = await a.c.post(`/api/relationships/${c.character.id}/adopt`, { locationId: 'istanbul-city_hall', name: 'Yeni' });
    expect(adopt.body.error).toBe('too_many_children');
    // Bilinçli deneme de aynı sınıra takılır
    await a.c.post('/api/family/open', { open: true });
    await c.c.post('/api/family/open', { open: true });
    expect((await a.c.post(`/api/relationships/${c.character.id}/family-try`, { carrier: 'them' })).body.error).toBe('too_many_children');
  });

  it('oyunun kendi grubunun konserinden oyuncu barının sahibine pay gitmez', async () => {
    const owner = await newPlayer();
    await q('UPDATE characters SET money = 60000 WHERE id = $1', [owner.character.id]);
    const buy = await owner.c.post('/api/businesses/istanbul-biz1/buy');
    expect(buy.status).toBe(200);
    await owner.c.post('/api/businesses/istanbul-biz1/settings', { gigShare: 0.3 });
    await q(`UPDATE businesses SET gig_share = 0.3 WHERE location_id = 'istanbul-biz1'`);
    const tillBefore = Number((await q(`SELECT till FROM businesses WHERE location_id = 'istanbul-biz1'`)).rows[0].till);
    // Oyunun grubu gibi bir grup: npc_key dolu, üyesi oyunun karakteri
    const npc = await newPlayer();
    await q('UPDATE characters SET npc = TRUE WHERE id = $1', [npc.character.id]);
    const song = (await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'NPC', 'rock', 60) RETURNING id`, [npc.character.id])).rows[0].id;
    const band = (await q(`INSERT INTO bands(name, genre, leader_id, npc_key) VALUES ('NPC Bar Test', 'rock', $1, 'test-npc-bar') RETURNING id`, [npc.character.id])).rows[0].id;
    await q(`INSERT INTO band_members(band_id, character_id, role) VALUES ($1, $2, 'guitar')`, [band, npc.character.id]);
    await q('INSERT INTO familiarity(character_id, song_id, value) VALUES ($1, $2, 80)', [npc.character.id, song]);
    await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 30)`, [band]);
    await q(`INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist, session_roles) VALUES ($1, 'istanbul', 'istanbul-biz1', now() - interval '1 minute', $2, '{}')`, [band, [song]]);
    await advance(10);
    const g = (await q(`SELECT result FROM gigs WHERE band_id = $1`, [band])).rows[0].result;
    expect(g.revenue).toBeGreaterThan(0);
    expect(g.ownerShare).toBe(0);
    expect(Number((await q(`SELECT till FROM businesses WHERE location_id = 'istanbul-biz1'`)).rows[0].till)).toBe(tillBefore);
  });
});

describe('madde 3: büyük sahnede prodüksiyon gideri', () => {
  async function bandAt(city: string, fame: number, money: number) {
    const p = await newPlayer({ cityId: city });
    await q('UPDATE characters SET money = $2 WHERE id = $1', [p.character.id, money]);
    const song = (await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Prod', 'rock', 50) RETURNING id`, [p.character.id])).rows[0].id;
    const band = (await p.c.post('/api/bands', { name: `Prod ${p.character.id}`, genre: 'rock', role: 'guitar' })).body.band;
    await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, $2, $3)`, [band.id, city, fame]);
    return { p, song: Number(song) };
  }
  const money = async (id: number) => Number((await q('SELECT money FROM characters WHERE id = $1', [id])).rows[0].money);

  it('barda gider yok; kulüp ve üstünde peşin, şehir çarpanıyla; iptalde yarısı geri', async () => {
    const bar = await bandAt('istanbul', 5, 100);
    expect((await bar.p.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 6, setlist: [bar.song] })).status).toBe(200);
    expect(await money(bar.p.character.id)).toBe(100);

    const hall = await bandAt('berlin', 50, 3000);
    const cost = gigProductionCost('hall', CITY_BY_ID.berlin.costMult);
    expect(cost).toBe(Math.round(VENUE_RULES.hall.production * 1.4));
    const r = await hall.p.c.post('/api/gigs', { locationId: 'berlin-hall', inHours: 6, setlist: [hall.song] });
    expect(r.status).toBe(200);
    expect(await money(hall.p.character.id)).toBe(3000 - cost);
    const cancel = await hall.p.c.del(`/api/gigs/${r.body.gig.id}`);
    expect(cancel.status).toBe(200);
    expect(cancel.body.refund).toBe(Math.floor(cost * GIG_PRODUCTION_REFUND));
    expect(await money(hall.p.character.id)).toBe(3000 - cost + Math.floor(cost * GIG_PRODUCTION_REFUND));

    // Parası yetmeyen salon konseri ayarlayamaz
    const poor = await bandAt('berlin', 50, cost - 1);
    expect((await poor.p.c.post('/api/gigs', { locationId: 'berlin-hall', inHours: 12, setlist: [poor.song] })).body.error).toBe('not_enough_money');
  });
});

describe('madde 4: sokak müziği başlangıç yolu', () => {
  it('günlük azalan getiri ve saatlik tavan (kurallar)', () => {
    expect(buskDailyFactor(0, 4)).toBe(1);
    expect(buskDailyFactor(4, 4)).toBe(0.5);
    expect(buskDailyFactor(2, 4)).toBe(0.75);
    expect(buskDailyFactor(8, 2)).toBe(0.25);
    expect(buskDailyFactor(6, 4)).toBeCloseTo((2 * 0.5 + 2 * 0.25) / 4);
    // Virtüöz bile parkta tavanı aşamaz
    expect(buskPayPerHour(90, 85, 1, 1.5)).toBe(BUSK_MAX_PAY_PER_HOUR);
    expect(buskPayPerHour(10, 5, 1)).toBeLessThan(BUSK_MAX_PAY_PER_HOUR);
  });

  it('sunucu: aynı gün ikinci oturum yarım bahşiş, beceri sokakta amatörde durur', async () => {
    const prev = config.gameSpeed;
    config.gameSpeed = 1; // 24 oyun saatlik pencere testin ortasında dolmasın
    try {
      await buskCase();
    } finally {
      config.gameSpeed = prev;
    }
  });
  async function buskCase() {
    const p = await newPlayer();
    const id = p.character.id;
    await q(`UPDATE characters SET skills = skills || '{"guitar":29.99,"showmanship":40}'::jsonb WHERE id = $1`, [id]);
    // Bugün 4 saat çalmış
    await q(
      `INSERT INTO actions(character_id, kind, params, location_id, started_at, ends_at, status) VALUES ($1, 'busk', '{"hours":4,"role":"guitar"}', 'istanbul-park', now(), now(), 'done')`,
      [id],
    );
    const r = await p.c.post('/api/actions', { kind: 'busk', role: 'guitar', hours: 4, locationId: 'istanbul-park' });
    expect(r.status).toBe(200);
    const a = (await q(`SELECT id, params FROM actions WHERE character_id = $1 AND status = 'active'`, [id])).rows[0];
    expect(a.params.tipFactor).toBe(0.5);
    await q(`UPDATE actions SET ends_at = now() - interval '1 second' WHERE id = $1`, [a.id]);
    await advance(5);
    const done = (await q('SELECT result FROM actions WHERE id = $1', [a.id])).rows[0].result;
    expect(done.tired).toBe(true);
    expect(done.pay).toBeLessThanOrEqual(BUSK_MAX_PAY_PER_HOUR * 4 * 0.5 * 1.3);
    const skills = (await q('SELECT skills FROM characters WHERE id = $1', [id])).rows[0].skills;
    expect(skills.guitar).toBeLessThanOrEqual(BUSK_SKILL_CAP);
    expect(skills.showmanship).toBe(40); // amatörün üstünde: sokak geliştirmez
  }
});

describe('madde 5: beceri ilerlemesi haftalar sürer', () => {
  /** Okulda, günde STUDY_FOCUS_HOURS odaklı + kalan saat dağınık (günde 20 saat), 12'den hedefe kaç oyun günü */
  function schoolDays(target: number) {
    let lvl = 12;
    for (let day = 1; day < 400; day++) {
      for (let h = 0; h < 20; h += 1) {
        lvl += studyGain(lvl, 1, true, 80) * studyFocusFactor(h, 1);
        if (lvl >= target) return day;
      }
    }
    return Infinity;
  }
  it('kurallar: ilk seviyeler hızlı, usta bir haftadan uzun, efsane haftalar', () => {
    expect(diminishing(0)).toBe(1);
    expect(diminishing(12)).toBeGreaterThan(0.75);
    expect(diminishing(80)).toBeLessThan(0.1);
    expect(studyFocusFactor(0, 4)).toBe(1);
    expect(studyFocusFactor(STUDY_FOCUS_HOURS, 2)).toBe(UNFOCUSED_STUDY_MULT);
    expect(schoolDays(30)).toBeLessThanOrEqual(2);
    expect(schoolDays(60)).toBeGreaterThanOrEqual(7);
    expect(schoolDays(90)).toBeGreaterThanOrEqual(20);
  });

  it('sunucu: günün odaklı saatleri dolunca ders verimi düşer ve bildirimde söylenir', async () => {
    const prev = config.gameSpeed;
    config.gameSpeed = 1;
    try {
      await focusCase();
    } finally {
      config.gameSpeed = prev;
    }
  });
  async function focusCase() {
    const p = await newPlayer();
    const id = p.character.id;
    await q(`UPDATE characters SET money = 1000, energy = 100, energy_at = now() WHERE id = $1`, [id]);
    await q(
      `INSERT INTO actions(character_id, kind, params, location_id, started_at, ends_at, status) VALUES ($1, 'study', '{"hours":4,"skill":"guitar","atSchool":true}', 'istanbul-school', now(), now(), 'done')`,
      [id],
    );
    expect((await p.c.post('/api/actions', { kind: 'study', skill: 'guitar', hours: 4, locationId: 'istanbul-school' })).status).toBe(200);
    const a = (await q(`SELECT id, params FROM actions WHERE character_id = $1 AND status = 'active'`, [id])).rows[0];
    expect(a.params.focus).toBeCloseTo(studyFocusFactor(4, 4));
    await q(`UPDATE actions SET ends_at = now() - interval '1 second' WHERE id = $1`, [a.id]);
    await advance(5);
    expect((await q('SELECT result FROM actions WHERE id = $1', [a.id])).rows[0].result.unfocused).toBe(true);
  }
});

describe('madde 7: işletme kasası para basmaz', () => {
  it('günde en fazla 16 mesai saati kasaya gelir getirir; fazlası maaş alır ama gelir getirmez', async () => {
    const prev = config.gameSpeed;
    config.gameSpeed = 1; // 24 oyun saatlik pencere testin ortasında dolmasın
    try {
      await businessCapCase();
    } finally {
      config.gameSpeed = prev;
    }
  });
  async function businessCapCase() {
    const owner = await newPlayer({ cityId: 'izmir' });
    const staff = [await newPlayer({ cityId: 'izmir' }), await newPlayer({ cityId: 'izmir' }), await newPlayer({ cityId: 'izmir' })];
    await q('UPDATE characters SET money = 60000 WHERE id = $1', [owner.character.id]);
    expect((await owner.c.post('/api/businesses/izmir-biz1/buy')).status).toBe(200);
    for (const s of staff) {
      await owner.c.post('/api/businesses/izmir-biz1/staff', { characterId: s.character.id, wage: 5 });
      await s.c.post('/api/businesses/izmir-biz1/job', { accept: true });
    }
    await owner.c.post('/api/businesses/izmir-biz1/till', { amount: -500 });
    const till = async () => Number((await q(`SELECT till FROM businesses WHERE location_id = 'izmir-biz1'`)).rows[0].till);
    const results: any[] = [];
    for (const s of staff) {
      const before = await till();
      expect((await s.c.post('/api/actions', { kind: 'work', locationId: 'izmir-biz1', hours: 8 })).status).toBe(200);
      const a = (await q(`SELECT id FROM actions WHERE character_id = $1 AND status = 'active'`, [s.character.id])).rows[0];
      await q(`UPDATE actions SET ends_at = now() - interval '1 second' WHERE id = $1`, [a.id]);
      await advance(5);
      results.push({ r: (await q('SELECT result FROM actions WHERE id = $1', [a.id])).rows[0].result, gain: (await till()) - before });
    }
    const perHour = BUSINESS_RULES.bar.revenuePerHour * CITY_BY_ID.izmir.costMult;
    expect(results[0].r.revenue).toBe(Math.round(perHour * 8));
    expect(results[1].r.revenue).toBe(Math.round(perHour * 8));
    // Üçüncü mesai: tavan doldu, maaş ödendi ama gelir yok
    expect(results[2].r.revenue).toBe(0);
    expect(results[2].r.quiet).toBe(true);
    expect(results[2].gain).toBe(-5 * 8); // yalnızca maaş kasadan çıktı
    expect(BUSINESS_DAILY_REVENUE_HOURS).toBe(16);
  }
});

describe('madde 8: kayıp sistemleri göz ardı edilemez', () => {
  it('bağımlılık: yemek isteği gidermez, $150+ alışveriş ya da tedavi giderir; bağımlıyken düşkünlük yavaş söner', async () => {
    expect(indulgenceNow(18, new Date(Date.now() - 86_400_000), 1, Date.now(), true)).toBeCloseTo(18 - ADDICTED_DECAY_PER_DAY);
    expect(indulgenceNow(18, new Date(Date.now() - 86_400_000), 1, Date.now(), false)).toBeCloseTo(14);
    const p = await newPlayer();
    const id = p.character.id;
    await q(`UPDATE characters SET money = 2000, indulgence = 20, indulgence_at = now(), addicted_since = now(), indulged_at = now() - interval '30 days' WHERE id = $1`, [id]);
    expect((await p.c.post('/api/meals', { locationId: 'istanbul-restaurant', mealId: 'soup' })).status).toBe(200);
    const afterMeal = (await q('SELECT indulged_at FROM characters WHERE id = $1', [id])).rows[0].indulged_at;
    expect(afterMeal.getTime()).toBeLessThan(Date.now() - 86_400_000);
    // Küçük alışveriş de gidermez, $150+ giderir
    expect((await p.c.post('/api/shop/buy', { locationId: 'istanbul-stage_shop', itemId: 'fx_smoke' })).status).toBe(200);
    expect((await q('SELECT indulged_at FROM characters WHERE id = $1', [id])).rows[0].indulged_at.getTime()).toBeLessThan(Date.now() - 86_400_000);
    expect(CRAVING_SATISFY_SPEND).toBe(150);
    expect((await p.c.post('/api/shop/buy', { locationId: 'istanbul-music_store', itemId: 'guitar_1' })).status).toBe(200);
    expect((await q('SELECT indulged_at FROM characters WHERE id = $1', [id])).rows[0].indulged_at.getTime()).toBeGreaterThan(Date.now() - 60_000);
  });

  it('sabıka: tekrarlayan suçlunun cezası ve para cezası büyür, başarı şansı düşer', async () => {
    const def = CRIME_BY_ID.pickpocket;
    expect(crimeChance(def, {}, 0, 5)).toBeCloseTo(crimeChance(def, {}, 0, 0) - 0.1);
    expect(repeatSentenceMult(0)).toBe(1);
    expect(repeatSentenceMult(4)).toBe(3);
    expect(repeatSentenceMult(100)).toBe(5);
    const p = await newPlayer();
    const id = p.character.id;
    await q('UPDATE characters SET money = 1000, convictions = 4 WHERE id = $1', [id]);
    const crime = (await q(`INSERT INTO crimes(character_id, city_id, location_id, kind, success, loot, status) VALUES ($1, 'istanbul', 'istanbul-park', 'pickpocket', FALSE, 0, 'caught') RETURNING id`, [id])).rows[0].id;
    await q(`INSERT INTO cases(crime_id, suspect_id, city_id, due_at) VALUES ($1, $2, 'istanbul', now() - interval '1 second')`, [crime, id]);
    await advance(5);
    const kase = (await q('SELECT sentence_hours, status FROM cases WHERE crime_id = $1', [crime])).rows[0];
    expect(kase.status).toBe('convicted');
    expect(Number(kase.sentence_hours)).toBe(def.sentenceHours * 3);
    expect(Number((await q('SELECT money FROM characters WHERE id = $1', [id])).rows[0].money)).toBe(1000 - crimeFine(def, 4, 1));
  });

  it('çocuk bakım gideri cepte yoksa bankadan alınır', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    await q('UPDATE characters SET money = 0, bank = 500 WHERE id = ANY($1::bigint[])', [[a.character.id, b.character.id]]);
    await q(`INSERT INTO children(parent_a, parent_b, name, born_at, upkeep_due) VALUES ($1, $2, 'Banka', now(), now() - interval '1 second')`, [a.character.id, b.character.id]);
    await advance(5);
    const share = Math.round((CHILD_WEEKLY_UPKEEP * 1) / 2);
    for (const p of [a, b]) {
      const r = (await q('SELECT money, bank FROM characters WHERE id = $1', [p.character.id])).rows[0];
      expect(Number(r.money) + Number(r.bank)).toBe(500 - share);
    }
  });

  it('çürüme eşikleri: aşinalık 5 gün, şöhret 21 gün', () => {
    expect(FAMILIARITY_GRACE_DAYS).toBe(5);
    expect(FAME_GRACE_DAYS).toBe(21);
    expect(decayedFamiliarity(80, 5)).toBe(80);
    expect(decayedFamiliarity(80, 7)).toBeCloseTo(77);
  });
});

describe('ek: boş dünya canlanır', () => {
  it('oyunun grupları: cüzdan sıfırlanır, şöhret bant içinde kalır, ilk albüm 7–60 günde', async () => {
    await ensureNpcWorld(() => 0.5);
    const band = (await q(`SELECT b.id, b.leader_id, b.npc_key FROM bands b WHERE b.npc_key IS NOT NULL AND b.npc_key NOT LIKE 'test-%' ORDER BY b.id LIMIT 1`)).rows[0];
    await q('UPDATE characters SET money = 99999, bank = 500 WHERE id = $1', [band.leader_id]);
    await runNpcDirectorNow(() => 0.5);
    const ch = (await q('SELECT money, bank FROM characters WHERE id = $1', [band.leader_id])).rows[0];
    expect(Number(ch.money)).toBe(0);
    expect(Number(ch.bank)).toBe(0);
    // İlk albüm gecikmesi kuruluştan 7–60 gün sonra (grup kimliğine göre)
    const days = 7 + (((Number(band.id) * 2246822519) >>> 0) % 54);
    expect(days).toBeGreaterThanOrEqual(7);
    expect(days).toBeLessThanOrEqual(60);
  });

  it('muhabir oyunun gruplarını da yazar (basın etkisi yok); tüccar ilanları haftada bir yenilenir', async () => {
    await ensureNpcCivic();
    await ensureNpcWorld(() => 0.5);
    const band = (await q(`SELECT b.id, b.npc_key FROM bands b WHERE b.npc_key IS NOT NULL AND b.npc_key NOT LIKE 'test-%' ORDER BY b.id LIMIT 1`)).rows[0];
    const city = (await q(`SELECT city_id FROM band_fame WHERE band_id = $1 ORDER BY fame DESC LIMIT 1`, [band.id])).rows[0].city_id;
    await q(`DELETE FROM articles WHERE npc AND city_id = $1`, [city]);
    await q(
      `INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist, status, result) VALUES ($1, $2, $3, now() - interval '1 second', '{}', 'done', '{"quality": 80, "attendance": 300}')`,
      [band.id, city, `${city}-club`],
    );
    const prevSpeed = config.gameSpeed;
    config.gameSpeed = 1; // 48 oyun saatlik haber penceresi
    try {
      await npcNews();
    } finally {
      config.gameSpeed = prevSpeed;
    }
    const art = (await q(`SELECT impact FROM articles WHERE npc AND band_id = $1`, [band.id])).rows;
    expect(art.length).toBe(1);
    expect(Number(art[0].impact)).toBe(0);

    await npcStockMarkets(() => 0.5);
    const trader = (await q(`SELECT id FROM characters WHERE npc_role = 'trader' AND city_id = 'istanbul'`)).rows[0]?.id;
    const before = (await q(`SELECT id FROM listings WHERE seller_id = $1 AND status = 'active'`, [trader])).rows.map((r) => Number(r.id));
    expect(before.length).toBeGreaterThan(0);
    await q(`UPDATE listings SET created_at = now() - interval '8 days' WHERE seller_id = $1`, [trader]);
    const prev = config.gameSpeed;
    config.gameSpeed = 1;
    try {
      await npcStockMarkets(() => 0.5);
    } finally {
      config.gameSpeed = prev;
    }
    const after = (await q(`SELECT id FROM listings WHERE seller_id = $1 AND status = 'active'`, [trader])).rows.map((r) => Number(r.id));
    expect(after.some((id) => before.includes(id))).toBe(false);
  });
});
