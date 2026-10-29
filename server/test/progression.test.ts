// İlk saat dengesi, rehber sonrası hedef, oyuncu listesi, ek hesap önlemleri ve küçük düzeltmeler
import {
  CITY_BY_ID,
  type GigPerformer,
  TUTORIAL,
  VENUE_RULES,
  computeGig,
  gigAdvice,
  nextGoal,
  nextVenue,
  songQuality,
  venueProgress,
} from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { client, inject, me, newPlayer, setMoney, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
const ist = CITY_BY_ID.istanbul;

/** Yeni başlamış bir oyuncu: düşük beceri, bir saat prova, eksik roller kiralık */
function newbieGig(songs: number, quality: number, rand: () => number = () => 0.5) {
  const setlist = Array.from({ length: songs }, (_, i) => ({ id: i + 1, quality }));
  const me: GigPerformer = {
    characterId: 1,
    role: 'guitar',
    skills: { guitar: 8, electric_guitar: 2, showmanship: 3 },
    mood: 70,
    health: 100,
    present: true,
    instrumentBonus: 0,
    outfitBonus: 0,
    familiarity: Object.fromEntries(setlist.map((s) => [s.id, 12])),
    energy: 80,
  };
  const session = (role: GigPerformer['role']): GigPerformer => ({
    characterId: null,
    role,
    skills: { [role]: 30, showmanship: 25 },
    mood: 80,
    health: 100,
    present: true,
    instrumentBonus: 0,
    outfitBonus: 0,
    familiarity: Object.fromEntries(setlist.map((s) => [s.id, 70])),
  });
  return computeGig({
    venue: 'bar',
    fame: 0,
    genre: 'rock',
    city: ist,
    performers: [me, session('bass'), session('drums'), session('vocals')],
    setlist,
    rand,
  });
}

const meAbsent = (): GigPerformer => ({
  characterId: 1,
  role: 'guitar',
  skills: { guitar: 30 },
  mood: 70,
  health: 100,
  present: false,
  instrumentBonus: 0,
  outfitBonus: 0,
  familiarity: { 1: 50 },
});
const sessionOnly = (): GigPerformer => ({
  characterId: null,
  role: 'drums',
  skills: { drums: 30 },
  mood: 80,
  health: 100,
  present: true,
  instrumentBonus: 0,
  outfitBonus: 0,
  familiarity: { 1: 70 },
});

describe('ilk saat dengesi', () => {
  it('ilk bar konseri şöhret getirir, kârlıdır ve nedenini açıklar', () => {
    // Taban 15: beceri yokken bile şarkılar ortalama 15 civarında
    expect(songQuality(0, () => 0.5)).toBe(15);
    const first = newbieGig(1, 15);
    expect(first.fameDelta).toBeGreaterThan(0);
    // Kiralık 3 müzisyenin ücreti bilet gelirinden az
    expect(first.revenue).toBeGreaterThan(3 * 5);
    expect(first.factors?.setLength).toBe('weak');
    expect(gigAdvice(first.factors!)).toContain('setLength');
    // Kadroda kiralık müzisyenler üye sayılmaz
    expect(first.memberCount).toBe(1);
    expect(first.presentCount).toBe(1);
    // Grubun kendi üyesi sahnede değilse (sadece kiralık müzisyenler) konser yapılmamış sayılır
    const noShow = computeGig({
      venue: 'bar',
      fame: 0,
      genre: 'rock',
      city: ist,
      performers: [meAbsent(), sessionOnly()],
      setlist: [{ id: 1, quality: 50 }],
      rand: () => 0.5,
    });
    expect(noShow.revenue).toBe(0);
    expect(noShow.fameDelta).toBeLessThan(0);
    // Tam set daha çok şöhret getirir
    expect(newbieGig(4, 25).fameDelta).toBeGreaterThan(first.fameDelta);
  });

  it('kulübe makul sayıda iyi bar konseriyle çıkılır', () => {
    // Orta düzey bir grup, 4 şarkılık setle barda çalar
    const perf: GigPerformer = {
      characterId: 1,
      role: 'guitar',
      skills: { guitar: 35, electric_guitar: 30, showmanship: 30 },
      mood: 80,
      health: 100,
      present: true,
      instrumentBonus: 0,
      outfitBonus: 0,
      familiarity: { 1: 60, 2: 60, 3: 60, 4: 60 },
    };
    let fame = 0;
    let n = 0;
    while (fame < VENUE_RULES.club.minFame && n < 100) {
      const r = computeGig({
        venue: 'bar',
        fame,
        genre: 'rock',
        city: ist,
        performers: [perf],
        setlist: [1, 2, 3, 4].map((id) => ({ id, quality: 40 })),
        rand: () => 0.5,
      });
      fame += r.fameDelta;
      n++;
    }
    expect(n).toBeGreaterThan(4);
    expect(n).toBeLessThan(20);
  });

  it('salon geliri dengeli: birkaç bin dolar, on binler değil', () => {
    const perf: GigPerformer = {
      characterId: 1,
      role: 'guitar',
      skills: { guitar: 70, electric_guitar: 70, showmanship: 60 },
      mood: 80,
      health: 100,
      present: true,
      instrumentBonus: 0,
      outfitBonus: 0,
      familiarity: { 1: 90, 2: 90, 3: 90, 4: 90 },
    };
    for (const fame of [45, 70]) {
      const r = computeGig({
        venue: 'hall',
        fame,
        genre: 'rock',
        city: ist,
        performers: [perf],
        setlist: [1, 2, 3, 4].map((id) => ({ id, quality: 70 })),
        rand: () => 0.5,
      });
      expect(r.revenue).toBeGreaterThan(3000);
      expect(r.revenue).toBeLessThan(12000);
    }
  });

  it('sıradaki sahne ve hedef merdiveni', () => {
    expect(nextVenue(0)?.venue).toBe('club');
    expect(nextVenue(20)?.venue).toBe('hall');
    expect(nextVenue(100)).toBeNull();
    expect(venueProgress(7.5)).toBeCloseTo(0.5);
    expect(nextGoal({ hasBand: false, songs: 0, cityId: 'istanbul', fame: {} }).id).toBe('band');
    expect(nextGoal({ hasBand: true, songs: 2, cityId: 'istanbul', fame: {} })).toMatchObject({ id: 'songs', n: 2, total: 4 });
    expect(nextGoal({ hasBand: true, songs: 5, cityId: 'istanbul', fame: { istanbul: 3 } })).toMatchObject({ id: 'club', cityId: 'istanbul', target: 15 });
    expect(nextGoal({ hasBand: true, songs: 5, cityId: 'berlin', fame: { istanbul: 20 } })).toMatchObject({ id: 'hall', cityId: 'istanbul' });
    expect(nextGoal({ hasBand: true, songs: 5, cityId: 'istanbul', fame: { istanbul: 50, ankara: 16 } })).toMatchObject({ id: 'tour', n: 2, total: 3 });
  });

  it('rehber bitince sıradaki hedef gelir; ödülü hazır adım önce gösterilir', async () => {
    const p = await newPlayer();
    const t0 = (await p.c.get('/api/tutorial')).body;
    // İlk adım anlık (playtest Y-2): profil
    expect(t0.current).toBe('profile');
    // Hedef her zaman gelir (rehberi gizleyen oyuncu da görür)
    expect(t0.next).toMatchObject({ id: 'band' });
    for (const s of TUTORIAL) {
      await q('INSERT INTO tutorial_claims(character_id, step_id, reward) VALUES ($1, $2, 0)', [p.character.id, s.id]);
    }
    const t1 = (await p.c.get('/api/tutorial')).body;
    expect(t1.current).toBeNull();
    expect(t1.next).toMatchObject({ id: 'band' });
  });
});

describe('oyuncular ve sahneler', () => {
  it('şehirdeki oyuncular listelenir; engellenenler görünmez', async () => {
    const a = await newPlayer({ cityId: 'lyon' });
    const b = await newPlayer({ cityId: 'lyon' });
    const list = (await a.c.get('/api/cities/lyon/people')).body.people;
    expect(list.some((x: any) => x.id === b.character.id)).toBe(true);
    await a.c.post(`/api/blocks/${b.character.id}`);
    const after = (await a.c.get('/api/cities/lyon/people')).body.people;
    expect(after.some((x: any) => x.id === b.character.id)).toBe(false);
  });

  it('sahne sayfası kendi konserlerini getirir; dünya sıralaması şöhreti 100\'ü aşmaz', async () => {
    const p = await newPlayer();
    const band = (await p.c.post('/api/bands', { name: 'Sahne Testi', genre: 'rock', role: 'guitar' })).body.band;
    await q(
      `INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 90), ($1, 'ankara', 80), ($1, 'izmir', 70)`,
      [band.id],
    );
    await q(`INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist, session_roles) VALUES ($1, 'istanbul', 'istanbul-hall', now() + interval '1 day', '{}', '{}')`, [band.id]);
    const gigs = (await p.c.get('/api/venues/istanbul-hall/gigs')).body;
    expect(gigs.upcoming.some((g: any) => g.bandId === band.id)).toBe(true);
    expect((await p.c.get('/api/venues/istanbul-school/gigs')).status).toBe(404);
    const world = (await p.c.get('/api/leaderboard')).body.bands;
    const mine = world.find((x: any) => x.id === band.id);
    expect(mine.fame).toBeLessThanOrEqual(100);
    await q(`UPDATE gigs SET status = 'cancelled' WHERE band_id = $1`, [band.id]);
  });
});

describe('sahne önceliği', () => {
  it('oyuncunun rezervasyonu oyunun kendi grubunun çakışan konserini iptal eder; oyuncu konseri çakışmayı engeller', async () => {
    const prev = config.gameSpeed;
    config.gameSpeed = 3600; // 1 oyun saati = 1 sn
    try {
      await q(`UPDATE gigs SET status = 'cancelled' WHERE location_id = 'ankara-bar' AND status = 'scheduled'`);
      const npcLeader = await newPlayer({ cityId: 'ankara' });
      const npc = (
        await q(`INSERT INTO bands(name, genre, leader_id, npc_key) VALUES ('Oyunun Grubu', 'rock', $1, 'test-npc') RETURNING id`, [npcLeader.character.id])
      ).rows[0];
      const npcGig = (
        await q(
          `INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist, session_roles) VALUES ($1, 'ankara', 'ankara-bar', now() + interval '2 seconds', '{}', '{}') RETURNING id`,
          [npc.id],
        )
      ).rows[0];
      const p = await newPlayer({ cityId: 'ankara' });
      await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Ankara', 'rock', 40)`, [p.character.id]);
      const band = (await p.c.post('/api/bands', { name: 'Başkent Grubu', genre: 'rock', role: 'guitar' })).body.band;
      const ids = band.songs.map((x: any) => x.id);
      const g = await p.c.post('/api/gigs', { locationId: 'ankara-bar', inHours: 2, setlist: ids });
      expect(g.status).toBe(200);
      expect((await q('SELECT status FROM gigs WHERE id = $1', [npcGig.id])).rows[0].status).toBe('cancelled');
      // Grup başına en fazla 2 ayarlı konser
      expect((await p.c.post('/api/gigs', { locationId: 'ankara-bar', inHours: 12, setlist: ids })).status).toBe(200);
      expect((await p.c.post('/api/gigs', { locationId: 'ankara-bar', inHours: 24, setlist: ids })).body.error).toBe('too_many_gigs');
      await q(`UPDATE gigs SET status = 'cancelled' WHERE band_id = ANY($1::bigint[])`, [[band.id, npc.id]]);
    } finally {
      config.gameSpeed = prev;
    }
  });
});

describe('ek hesap önlemleri', () => {
  it('yeni hesap pazar, takas ve hediyeyi kullanamaz; fiyat tavanı uygulanır', async () => {
    const s = await newPlayer({ cityId: 'berlin' });
    const b = await newPlayer({ cityId: 'berlin' });
    await setMoney(s.character.id, 5000);
    await s.c.post('/api/shop/buy', { locationId: 'berlin-music_store', itemId: 'guitar_1' });
    const g = (await s.c.get('/api/inventory')).body.items.find((i: any) => i.itemId === 'guitar_1');
    const bo = await b.c.post('/api/shop/buy', { locationId: 'berlin-music_store', itemId: 'guitar_1' });
    expect(bo.status).toBe(200);
    const bg = (await b.c.get('/api/inventory')).body.items.find((i: any) => i.itemId === 'guitar_1');

    const prev = config.tradeMinAccountHours;
    config.tradeMinAccountHours = 72;
    const prevSpeed = config.gameSpeed;
    config.gameSpeed = 1; // 72 oyun saati = 72 gerçek saat: hesaplar kesin "yeni"
    try {
      const list = await s.c.post('/api/market', { locationId: 'berlin-flea_market', inventoryId: g.id, price: 200 });
      expect(list.status).toBe(403);
      expect(list.body.error).toBe('account_too_new');
      expect((await s.c.post('/api/trades', { toId: b.character.id, give: [g.id], want: [bg.id] })).body.error).toBe('account_too_new');
      expect((await s.c.post('/api/gifts', { toId: b.character.id, inventoryId: g.id })).body.error).toBe('account_too_new');
      // Hesap eskiyince açılır
      await q(`UPDATE users SET created_at = now() - interval '4 days' WHERE id = ANY($1::bigint[])`, [[s.userId, b.userId]]);
      // Tavan: dükkân fiyatının iki katı (gitar 150 → en fazla 300)
      expect((await s.c.post('/api/market', { locationId: 'berlin-flea_market', inventoryId: g.id, price: 301 })).body.error).toBe('price_too_high');
      expect((await s.c.post('/api/market', { locationId: 'berlin-flea_market', inventoryId: g.id, price: 300 })).status).toBe(200);
      await s.c.del(`/api/market/${(await s.c.get('/api/market?mine=true')).body.listings[0].id}`);
      // Takas parası, karşılığında alınan eşyanın dükkân değerini geçemez (TRADE_MONEY_VALUE_MULT 1; eskiden iki katı)
      expect((await s.c.post('/api/trades', { toId: b.character.id, give: [g.id], want: [bg.id], giveMoney: 151 })).body.error).toBe('trade_money_too_high');
      const offer = await s.c.post('/api/trades', { toId: b.character.id, give: [g.id], want: [bg.id], giveMoney: 150 });
      expect(offer.status).toBe(200);
      expect((await b.c.post(`/api/trades/${offer.body.id}/accept`)).status).toBe(200);
      // Para döngüsü kapalı: aynı eşyalar bir hafta içinde önceki sahiplerine geri dönemez
      expect((await s.c.post('/api/trades', { toId: b.character.id, give: [bg.id], want: [g.id] })).body.error).toBe('item_recently_yours');
      expect((await b.c.post('/api/gifts', { toId: s.character.id, inventoryId: g.id })).body.error).toBe('item_recently_yours');
      await b.c.post('/api/market', { locationId: 'berlin-flea_market', inventoryId: g.id, price: 1 });
      const lid = (await b.c.get('/api/market?mine=true')).body.listings[0].id;
      expect((await s.c.post(`/api/market/${lid}/buy`, { locationId: 'berlin-flea_market' })).body.error).toBe('item_recently_yours');
      // Bir hafta sonra serbest (geçmiş tablosu da eskir)
      await q(`UPDATE inventory SET handed_at = now() - interval '30 days' WHERE id = $1`, [g.id]);
      await q(`UPDATE item_handoffs SET created_at = now() - interval '30 days' WHERE inventory_id = $1`, [g.id]);
      expect((await s.c.post(`/api/market/${lid}/buy`, { locationId: 'berlin-flea_market' })).status).toBe(200);
    } finally {
      config.tradeMinAccountHours = prev;
      config.gameSpeed = prevSpeed;
    }
  });

  it('aynı adresten günde sınırlı sayıda hesap açılır', async () => {
    const prev = { n: config.registerPerIpDay, header: config.clientIpHeader };
    config.registerPerIpDay = 2;
    // Kenar sunucusunun yazdığı başlık yalnızca açıkça yapılandırılınca okunur (client-ip.ts)
    config.clientIpHeader = 'cf-connecting-ip';
    const ip = `203.0.113.${Math.floor(Math.random() * 200) + 1}`;
    try {
      const reg = (n: number) =>
        inject('POST', '/api/auth/register', {
          payload: { email: `ipsiniri${n}_${Date.now()}@test.com`, password: 'gizli12345', acceptTerms: true },
          // Yapılandırılmış başlık esas alınır: istemcinin değiştirdiği X-Forwarded-For sınırı aşamaz
          headers: { 'cf-connecting-ip': ip, 'x-forwarded-for': `198.51.100.${n}` },
        });
      expect((await reg(1)).statusCode).toBe(200);
      expect((await reg(2)).statusCode).toBe(200);
      const third = await reg(3);
      expect(third.statusCode).toBe(429);
      expect(JSON.parse(third.body).error).toBe('too_many_accounts');
    } finally {
      config.registerPerIpDay = prev.n;
      config.clientIpHeader = prev.header;
    }
  });
});

void client;
void me;
