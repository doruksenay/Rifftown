// Enerji, ilham, moodlet'ler, EFSANEVİ konser ve oyuncular arası takas
import { type GigPerformer, CITY_BY_ID, computeGig, legendaryChance } from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { tick } from '../src/worker';
import { inject, me, newPlayer, raw, setMoney, setSkills, setVip, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
/** 1 oyun saati = 1 sn: enerji test sırasında kendiliğinden dolmasın */
async function slow<T>(fn: () => Promise<T>): Promise<T> {
  const prev = config.gameSpeed;
  config.gameSpeed = 3600;
  try {
    return await fn();
  } finally {
    config.gameSpeed = prev;
  }
}
const finishNow = async (id: number) => {
  await q(`UPDATE actions SET ends_at = now() WHERE character_id = $1 AND status = 'active'`, [id]);
  await tick();
};
const inv = async (c: any) => (await c.get('/api/inventory')).body.items as any[];
const buy = (p: any, locationId: string, itemId: string) => p.c.post('/api/shop/buy', { locationId, itemId });

describe('enerji ve moodlet', () => {
  it('yorucu iş enerji harcar; enerji yetmezse iş başlamaz; yemek ve dinlenme doldurur; moodlet ruh hâlini değiştirir', () =>
    slow(async () => {
      const p = await newPlayer();
      await setVip(p.userId); // kesin sayılar
      const start = (await me(p.c)).character;
      expect(start.energy).toBeGreaterThan(99);
      const r0 = (await q('SELECT inspiration FROM characters WHERE id = $1', [p.character.id])).rows[0];
      expect(r0.inspiration).toBe(30);

      await p.c.post('/api/actions', { kind: 'work', locationId: 'istanbul-work', hours: 8 });
      await finishNow(p.character.id);
      const tired = (await me(p.c)).character;
      expect(tired.energy).toBeLessThan(60); // 8 saat × (−8 + 2) = −48

      // Enerji çok düşükse 8 saatlik iş başlamaz; dinlenmek serbest
      await q('UPDATE characters SET energy = 5, energy_at = now() WHERE id = $1', [p.character.id]);
      expect((await p.c.post('/api/actions', { kind: 'work', locationId: 'istanbul-work', hours: 8 })).body.error).toBe('too_tired');
      const low = (await me(p.c)).character;
      expect(low.moodlets.map((m: any) => m.id)).toContain('exhausted');
      const sum = low.moodlets.reduce((a: number, m: any) => a + m.effect, 0);
      expect(low.moodlets.find((m: any) => m.id === 'exhausted').effect).toBe(-15);
      expect(low.mood).toBeCloseTo(low.baseMood + sum, 0);

      // Şefin menüsü: anında enerji ve "Ziyafet" moodlet'i
      await setMoney(p.character.id, 500);
      const meal = await p.c.post('/api/meals', { locationId: 'istanbul-restaurant', mealId: 'chef' });
      expect(meal.status).toBe(200);
      const fed = (await me(p.c)).character;
      expect(fed.energy).toBeGreaterThan(35);
      const feast = fed.moodlets.find((m: any) => m.id === 'feast');
      expect(feast.effect).toBe(10);
      expect(feast.endsAt).toBeTruthy();

      // Dinlenmek enerjiyi doldurur
      await p.c.post('/api/actions', { kind: 'rest', hours: 4 });
      await finishNow(p.character.id);
      expect((await me(p.c)).character.energy).toBeGreaterThan(fed.energy + 40);
    }));

  it('ilham şarkıyı güçlendirir ve harcanır; yolculuk ilham ve "yeni şehir" moodlet\'i verir', () =>
    slow(async () => {
      const p = await newPlayer();
      await q('UPDATE characters SET inspiration = 100, inspiration_at = now() WHERE id = $1', [p.character.id]);
      await p.c.post('/api/actions', { kind: 'write_song', title: 'İlham Perisi', genre: 'rock' });
      await finishNow(p.character.id);
      const done = (await p.c.get('/api/notifications')).body.notifications.find((n: any) => n.kind === 'action_done');
      expect(done.data.inspirationBonus).toBe(15);
      expect((await q('SELECT inspiration FROM characters WHERE id = $1', [p.character.id])).rows[0].inspiration).toBeCloseTo(50, 0);

      await setMoney(p.character.id, 1000);
      await p.c.post('/api/actions', { kind: 'travel', toCityId: 'ankara', mode: 'bus' });
      await finishNow(p.character.id);
      const after = (await me(p.c)).character;
      expect(after.moodlets.map((m: any) => m.id)).toContain('new_city');
      expect(after.inspiration).toBeGreaterThan(55);
    }));

  it('VIP olmayan oyuncu enerjiyi ve ilhamı kaba adımlarla görür', () =>
    slow(async () => {
      const p = await newPlayer();
      await q('UPDATE characters SET energy = 57.3, inspiration = 41.7 WHERE id = $1', [p.character.id]);
      const plain = (await me(p.c)).character;
      expect(plain.energy).not.toBe(57.3);
      await setVip(p.userId);
      const vip = (await me(p.c)).character;
      expect(vip.energy).toBeCloseTo(57.3, 0);
    }));
});

describe('EFSANEVİ konser', () => {
  it('kural: sadece DESTANSI kalitede ve ilhama bağlı küçük bir olasılık', () => {
    expect(legendaryChance(89, 100)).toBe(0);
    expect(legendaryChance(95, 0)).toBeCloseTo(0.01);
    expect(legendaryChance(95, 100)).toBeCloseTo(0.07);
    const star = (inspiration: number): GigPerformer => ({
      characterId: 1,
      role: 'guitar',
      skills: { basic_strings: 100, guitar: 100, showmanship: 100, pro_showmanship: 100, dancing: 100, audience: 100 },
      mood: 100,
      health: 100,
      energy: 100,
      inspiration,
      present: true,
      instrumentBonus: 12,
      outfitBonus: 14,
      familiarity: { 1: 100, 2: 100, 3: 100, 4: 100 },
    });
    const input = {
      venue: 'hall' as const,
      fame: 60,
      genre: 'rock' as const,
      city: CITY_BY_ID.istanbul,
      setlist: [1, 2, 3, 4].map((id) => ({ id, quality: 100 })),
    };
    // rand = 0.999: gürültü en yüksek, olasılık zarı tutmaz → DESTANSI ama EFSANEVİ değil
    const epic = computeGig({ ...input, performers: [star(100)], rand: () => 0.999 });
    expect(epic.quality).toBeGreaterThanOrEqual(90);
    expect(epic.legendary).toBe(false);
    // Zar tutarsa EFSANEVİ olur ve şöhret daha çok artar
    // computeGig'in zarları: seyirci (2), gürültü, EFSANEVİ — sonuncusu tutsun
    let i = 0;
    const seq = () => (i++ < 3 ? 0.999 : 0.001);
    const legendary = computeGig({ ...input, performers: [star(100)], rand: seq });
    expect(legendary.legendary).toBe(true);
  });

  it('EFSANEVİ gecede kuşanılmış enstrüman efsaneleşir ve kalıcı bonus alır', async () => {
    const p = await newPlayer();
    await setVip(p.userId); // konser raporu süresiz görünsün (test hızında raporlar hemen eskir)
    await setMoney(p.character.id, 20000);
    await setSkills(p.character.id, { basic_strings: 100, guitar: 100, showmanship: 100, pro_showmanship: 100, dancing: 100, audience: 100, composing: 100, lyrics: 100, genre_rock: 100 });
    await buy(p, 'istanbul-music_store', 'guitar_3');
    const guitar = (await inv(p.c)).find((i) => i.itemId === 'guitar_3');
    await p.c.post(`/api/inventory/${guitar.id}/equip`);
    await p.c.post(`/api/inventory/${guitar.id}/name`, { name: 'Gece Yıldızı' });
    const band = (await p.c.post('/api/bands', { name: 'Efsane Grup', genre: 'rock', role: 'guitar' })).body.band;
    const sids: number[] = [];
    for (const title of ['Son Nefes', 'Gece Yarısı', 'Boğaz', 'Yıldız Tozu']) {
      const sid = (await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, $2, 'rock', 100) RETURNING id`, [p.character.id, title])).rows[0].id;
      await q('INSERT INTO band_songs(band_id, song_id) VALUES ($1, $2)', [band.id, sid]);
      await q('INSERT INTO familiarity(character_id, song_id, value) VALUES ($1, $2, 100)', [p.character.id, sid]);
      sids.push(sid);
    }
    await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 60)`, [band.id]);
    await q('UPDATE characters SET inspiration = 100, inspiration_at = now(), mood = 100, health = 100 WHERE id = $1', [p.character.id]);
    const gig = await p.c.post('/api/gigs', { locationId: 'istanbul-hall', inHours: 2, setlist: sids });
    expect(gig.status).toBe(200);
    await q(`UPDATE gigs SET starts_at = now() - interval '1 second' WHERE id = $1`, [gig.body.gig.id]);
    // Seyirci ve gürültü zarları en iyi sonucu versin, EFSANEVİ zarı (dördüncü) tutsun
    let calls = 0;
    const spy = vi.spyOn(Math, 'random').mockImplementation(() => (calls++ < 3 ? 0.999 : 0.0001));
    try {
      await tick();
    } finally {
      spy.mockRestore();
    }
    const result = (await p.c.get(`/api/gigs/${gig.body.gig.id}`)).body.gig.result;
    expect(result.quality).toBeGreaterThanOrEqual(90);
    expect(result.legendary).toBe(true);
    expect(result.review.tr).toContain('EFSANEVİ');
    const g = (await inv(p.c)).find((i) => i.id === guitar.id);
    expect(g.legendary).toMatchObject({ gigId: gig.body.gig.id, bandName: 'Efsane Grup' });
    expect(g.bonus).toBe(guitar.bonus + 3);
    expect((await me(p.c)).character.moodlets.map((m: any) => m.id)).toContain('legendary_gig');
  });
});

describe('takas', () => {
  it('eşya karşılığı eşya ve para üstü; kabulde her şey yeniden kontrol edilir', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    await setMoney(a.character.id, 5000);
    await setMoney(b.character.id, 5000);
    await buy(a, 'istanbul-music_store', 'guitar_2');
    await buy(b, 'istanbul-boutique', 'outfit_2');
    await buy(b, 'istanbul-music_store', 'drums_1');
    const ag = (await inv(a.c)).find((i) => i.itemId === 'guitar_2');
    const bo = (await inv(b.c)).find((i) => i.itemId === 'outfit_2');
    const bd = (await inv(b.c)).find((i) => i.itemId === 'drums_1');

    // Takas en az birer eşya içerir (para gönderme VIP'e özeldir)
    expect((await a.c.post('/api/trades', { toId: b.character.id, give: [], want: [bo.id], giveMoney: 100 })).body.error).toBe('trade_needs_items');
    // Karşı tarafın takasa açık eşyaları görülebilir
    const theirs = (await a.c.get(`/api/characters/${b.character.id}/items`)).body.items;
    expect(theirs.map((i: any) => i.id)).toEqual(expect.arrayContaining([bo.id, bd.id]));

    const offer = await a.c.post('/api/trades', { toId: b.character.id, give: [ag.id], want: [bo.id], wantMoney: 150, note: 'Gitar senin, ceket benim' });
    expect(offer.status).toBe(200);
    expect((await me(b.c)).pendingTrades).toBe(1);
    const incoming = (await b.c.get('/api/trades')).body.incoming;
    expect(incoming[0]).toMatchObject({ mine: false, giveMoney: 0, wantMoney: 150, note: 'Gitar senin, ceket benim' });
    expect(incoming[0].give[0].itemId).toBe('guitar_2');

    // B ceketi pazara koyarsa takas düşer
    const second = await a.c.post('/api/trades', { toId: b.character.id, give: [ag.id], want: [bd.id] });
    await b.c.post('/api/market', { locationId: 'istanbul-flea_market', inventoryId: bd.id, price: 99 });
    expect((await b.c.post(`/api/trades/${second.body.id}/accept`)).body.error).toBe('trade_items_changed');
    expect((await a.c.get('/api/trades')).body.history.find((t: any) => t.id === second.body.id).status).toBe('failed');

    // Kabul: eşyalar ve para el değiştirir
    expect((await b.c.post(`/api/trades/${offer.body.id}/accept`)).status).toBe(200);
    expect((await inv(b.c)).some((i) => i.id === ag.id)).toBe(true);
    expect((await inv(a.c)).some((i) => i.id === bo.id)).toBe(true);
    expect((await raw(b.character.id)).money).toBe((await raw(b.character.id)).money); // tutarlılık
    const am = (await raw(a.character.id)).money;
    const bm = (await raw(b.character.id)).money;
    expect(am + bm).toBe(5000 * 2 - 900 - 500 - 150); // dükkân alımları düşülmüş toplam değişmez
    // Kapanmış takas yeniden kabul edilemez
    expect((await b.c.post(`/api/trades/${offer.body.id}/accept`)).body.error).toBe('trade_closed');
    // Aynı eşyalar bir hafta içinde önceki sahibine geri dönemez
    expect((await b.c.post('/api/trades', { toId: a.character.id, give: [ag.id], want: [bo.id] })).body.error).toBe('item_recently_yours');
    await q(`UPDATE inventory SET handed_at = now() - interval '30 days' WHERE id = ANY($1::bigint[])`, [[ag.id, bo.id]]);
    // Teklif eden geri çekebilir, alıcı reddedebilir
    const third = await b.c.post('/api/trades', { toId: a.character.id, give: [ag.id], want: [bo.id] });
    expect((await a.c.post(`/api/trades/${third.body.id}/decline`)).status).toBe(200);
    const fourth = await b.c.post('/api/trades', { toId: a.character.id, give: [ag.id], want: [bo.id] });
    expect((await a.c.del(`/api/trades/${fourth.body.id}`)).status).toBe(404);
    expect((await b.c.del(`/api/trades/${fourth.body.id}`)).status).toBe(200);
  });

  it('VIP eşyası VIP olmayana takasla geçmez; başkasının eşyası teklif edilemez', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    await setVip(a.userId);
    await setMoney(a.character.id, 70000);
    await buy(a, 'istanbul-car_dealer', 'car_4');
    await buy(a, 'istanbul-boutique', 'outfit_1');
    await setMoney(b.character.id, 1000);
    await buy(b, 'istanbul-boutique', 'outfit_1');
    const car = (await inv(a.c)).find((i) => i.itemId === 'car_4');
    const bo = (await inv(b.c)).find((i) => i.itemId === 'outfit_1');
    const ao = (await inv(a.c)).find((i) => i.itemId === 'outfit_1');
    expect((await a.c.post('/api/trades', { toId: b.character.id, give: [bo.id], want: [ao.id] })).body.error).toBe('item_not_found');
    const t = await a.c.post('/api/trades', { toId: b.character.id, give: [car.id], want: [bo.id] });
    expect((await b.c.post(`/api/trades/${t.body.id}/accept`)).body.error).toBe('vip_required');
  });

  it('teklif sonrası boyanan eşya takası düşürür; aynı eşyayı içeren diğer teklif sahibine haber gider', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    const c2 = await newPlayer();
    await setMoney(a.character.id, 3000);
    await setMoney(b.character.id, 1000);
    await setMoney(c2.character.id, 1000);
    await buy(a, 'istanbul-music_store', 'guitar_2');
    await buy(a, 'istanbul-hardware', 'spray_pink');
    await buy(b, 'istanbul-boutique', 'outfit_1');
    await buy(c2, 'istanbul-boutique', 'outfit_1');
    const ag = (await inv(a.c)).find((i) => i.itemId === 'guitar_2');
    const sp = (await inv(a.c)).find((i) => i.itemId === 'spray_pink');
    const bo = (await inv(b.c)).find((i) => i.itemId === 'outfit_1');
    const co = (await inv(c2.c)).find((i) => i.itemId === 'outfit_1');
    const t1 = await a.c.post('/api/trades', { toId: b.character.id, give: [ag.id], want: [bo.id] });
    const t2 = await a.c.post('/api/trades', { toId: c2.character.id, give: [ag.id], want: [co.id] });
    await a.c.post(`/api/inventory/${ag.id}/paint`, { sprayId: sp.id });
    expect((await b.c.post(`/api/trades/${t1.body.id}/accept`)).body.error).toBe('trade_items_changed');
    // Yeni teklif boyalı hâliyle; kabul edilince aynı gitarı içeren diğer teklif düşer ve teklif edene bildirim gider
    const t3 = await a.c.post('/api/trades', { toId: b.character.id, give: [ag.id], want: [bo.id] });
    expect((await b.c.post(`/api/trades/${t3.body.id}/accept`)).status).toBe(200);
    expect((await c2.c.post(`/api/trades/${t2.body.id}/accept`)).body.error).toBe('trade_closed');
    const notes = (await a.c.get('/api/notifications')).body.notifications.filter((n: any) => n.kind === 'trade_failed');
    expect(notes.some((n: any) => n.data.tradeId === t2.body.id)).toBe(true);
  });

  it('web sürümü DELETE ve PATCH gönderebilir (CORS ön kontrolü)', async () => {
    for (const method of ['DELETE', 'PATCH']) {
      const r = await inject('OPTIONS', '/api/trades/1', { headers: { origin: 'https://doruksenay.github.io', 'access-control-request-method': method } });
      expect(r.statusCode).toBe(204);
      expect(String(r.headers['access-control-allow-methods'])).toContain(method);
    }
  });
});
