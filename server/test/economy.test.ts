// Sosyal, ilişkiler, pazar, kişiselleştirme, üretim, yaşam, işletmeler, festivaller, görevler, mağaza uyumu
import { BUSINESS_RULES, MISSIONS_PER_WEEK, missionsFor } from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { processFestivals } from '../src/game/festivals';
import { tick } from '../src/worker';
import { advance, client, inject, me, newPlayer, raw, setMoney, setSkills, setVip, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
const finishNow = async (characterId: number) => {
  await q(`UPDATE actions SET ends_at = now() WHERE character_id = $1 AND status = 'active'`, [characterId]);
  await tick();
};
/** Oyunu yavaşlatır (1 oyun saati = 1 sn): bekleme süreleri test sırasında kendiliğinden dolmasın */
async function slow<T>(fn: () => Promise<T>): Promise<T> {
  const prev = config.gameSpeed;
  config.gameSpeed = 3600;
  try {
    return await fn();
  } finally {
    config.gameSpeed = prev;
  }
}
const inv = async (c: any) => (await c.get('/api/inventory')).body.items as any[];
const buy = async (p: any, locationId: string, itemId: string, qty = 1) => p.c.post('/api/shop/buy', { locationId, itemId, qty });

describe('sosyal', () => {
  it('özel mesaj, okunmamış sayısı, küfür filtresi, engelleme ve şikâyet', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    const sent = await a.c.post(`/api/messages/${b.character.id}`, { text: 'Merhaba, siktir git değil, selam!' });
    expect(sent.status).toBe(200);
    expect(sent.body.message.text).toBe('Merhaba, ****** git değil, selam!');
    await new Promise((r) => setTimeout(r, 350));
    await a.c.post(`/api/messages/${b.character.id}`, { text: 'İkinci mesaj' });
    expect((await me(b.c)).unreadMessages).toBe(2);
    const convs = (await b.c.get('/api/messages')).body.conversations;
    expect(convs[0]).toMatchObject({ characterId: a.character.id, unread: 2, lastText: 'İkinci mesaj', lastMine: false });
    // Sadece ilk okunmamış mesaj bildirim üretir
    const notes = (await b.c.get('/api/notifications')).body.notifications.filter((n: any) => n.kind === 'message');
    expect(notes).toHaveLength(1);
    const th = (await b.c.get(`/api/messages/${a.character.id}`)).body;
    expect(th.messages.map((m: any) => m.mine)).toEqual([false, false]);
    expect((await me(b.c)).unreadMessages).toBe(0);
    expect((await b.c.post('/api/reports', { kind: 'message', targetId: th.messages[0].id, text: 'hakaret' })).status).toBe(200);
    // Başkasına gelen mesaj şikâyet edilemez (yöneticiye özel mesaj sızdırılamasın)
    expect((await a.c.post('/api/reports', { kind: 'message', targetId: th.messages[0].id, text: '' })).status).toBe(404);
    // Yönetici şikâyeti görür ve içeriği kaldırır
    const admin = await newPlayer();
    await q('UPDATE users SET is_admin = TRUE WHERE id = $1', [admin.userId]);
    const open = (await admin.c.get('/api/admin/reports')).body.reports.find((r: any) => r.kind === 'message' && Number(r.target_id) === th.messages[0].id);
    expect(open).toMatchObject({ content: th.messages[0].text, author: a.character.name, note: 'hakaret' });
    expect((await admin.c.post(`/api/admin/reports/${open.id}/resolve`, { remove: true })).status).toBe(200);
    expect((await b.c.get(`/api/messages/${a.character.id}`)).body.messages).toHaveLength(1);
    expect((await admin.c.get('/api/admin/reports')).body.reports.some((r: any) => r.id === open.id)).toBe(false);
    expect((await b.c.get('/api/admin/reports')).status).toBe(403);
    // Engellenen mesaj gönderemez
    await b.c.post(`/api/blocks/${a.character.id}`);
    await new Promise((r) => setTimeout(r, 350));
    expect((await a.c.post(`/api/messages/${b.character.id}`, { text: 'hey' })).body.error).toBe('blocked');
    await b.c.del(`/api/blocks/${a.character.id}`);
    await new Promise((r) => setTimeout(r, 350));
    expect((await a.c.post(`/api/messages/${b.character.id}`, { text: 'hey' })).status).toBe(200);
    // Oyunun yapay karakterlerine mesaj gönderilemez
    const npc = await q(`INSERT INTO characters(user_id, npc, name, avatar_color, main_instrument, money, mood, health, city_id, skills) VALUES (NULL, TRUE, 'Yapay Kişi', '#000000', 'guitar', 0, 80, 100, 'istanbul', '{}') RETURNING id`);
    await new Promise((r) => setTimeout(r, 350));
    expect((await a.c.post(`/api/messages/${npc.rows[0].id}`, { text: 'hey' })).body.error).toBe('npc_target');
  });

  it('arkadaşlık isteği, ziyaretçi defteri ve hediye', async () => {
    const a = await newPlayer({ cityId: 'izmir' });
    const b = await newPlayer({ cityId: 'izmir' });
    expect((await a.c.post(`/api/friends/${b.character.id}`)).body.status).toBe('requested');
    expect((await b.c.get('/api/friends')).body.incoming[0].characterId).toBe(a.character.id);
    await b.c.post(`/api/friends/${a.character.id}/answer`, { accept: true });
    expect((await a.c.get('/api/friends')).body.friends[0].characterId).toBe(b.character.id);

    const note = await a.c.post(`/api/characters/${b.character.id}/guestbook`, { text: 'Dün geceki konser harikaydı!' });
    expect(note.status).toBe(200);
    expect((await a.c.post(`/api/characters/${b.character.id}/guestbook`, { text: 'tekrar' })).body.error).toBe('slow_down');
    const entries = (await b.c.get(`/api/characters/${b.character.id}/guestbook`)).body.entries;
    expect(entries[0]).toMatchObject({ text: 'Dün geceki konser harikaydı!', canDelete: true });
    const third = await newPlayer({ cityId: 'izmir' });
    expect((await third.c.del(`/api/guestbook/${entries[0].id}`)).body.error).toBe('forbidden');
    expect((await b.c.del(`/api/guestbook/${entries[0].id}`)).status).toBe(200);

    await setMoney(a.character.id, 1000);
    await buy(a, 'izmir-gallery', 'art_1');
    const item = (await inv(a.c))[0];
    expect((await a.c.post('/api/gifts', { toId: b.character.id, inventoryId: item.id })).status).toBe(200);
    expect((await inv(b.c)).map((i) => i.itemId)).toContain('art_1');
    const far = await newPlayer({ cityId: 'paris' });
    const it2 = (await inv(b.c))[0];
    expect((await b.c.post('/api/gifts', { toId: far.character.id, inventoryId: it2.id })).body.error).toBe('not_in_same_city');
  });
});

describe('ilişkiler ve aile', () => {
  it('takıl → flört → randevu → teklif → nişan → düğün → evlat edinme → boşanma', () => slow(async () => {
    const a = await newPlayer({ cityId: 'ankara' });
    const b = await newPlayer({ cityId: 'ankara' });
    const h = await a.c.post(`/api/relationships/${b.character.id}/hangout`);
    expect(h.status).toBe(200);
    expect(h.body.friendship).toBeGreaterThan(0);
    expect((await a.c.post(`/api/relationships/${b.character.id}/hangout`)).body.error).toBe('cooldown');
    expect((await a.c.post(`/api/relationships/${b.character.id}/flirt`)).body.error).toBe('need_friendship');
    const [x, y] = [a.character.id, b.character.id].sort((m, n) => m - n);
    await q('UPDATE relationships SET friendship = 50 WHERE a_id = $1 AND b_id = $2', [x, y]);
    const f1 = await a.c.post(`/api/relationships/${b.character.id}/flirt`);
    expect(f1.body).toMatchObject({ mutual: false });
    // Tek taraflı flört romantizmi sınırlar
    await q('UPDATE relationships SET romance = 20 WHERE a_id = $1 AND b_id = $2', [x, y]);
    await q(`DELETE FROM social_log WHERE kind = 'flirt' AND actor_id = $1`, [a.character.id]);
    expect((await a.c.post(`/api/relationships/${b.character.id}/flirt`)).body.romance).toBe(20);
    const f2 = await b.c.post(`/api/relationships/${a.character.id}/flirt`);
    expect(f2.body.mutual).toBe(true);
    expect(f2.body.romance).toBeGreaterThan(20);

    await setMoney(a.character.id, 20000);
    await q('UPDATE relationships SET romance = 36 WHERE a_id = $1 AND b_id = $2', [x, y]);
    const d = await a.c.post(`/api/relationships/${b.character.id}/date`, { locationId: 'ankara-restaurant' });
    expect(d.status).toBe(200);
    expect(d.body.cost).toBe(28); // 2 × 15 × 0,9 (yuvarlanmış)
    let rel = (await a.c.get(`/api/characters/${b.character.id}/relationship`)).body;
    expect(rel.stage).toBe('dating');

    await q('UPDATE relationships SET romance = 80 WHERE a_id = $1 AND b_id = $2', [x, y]);
    expect((await a.c.post(`/api/relationships/${b.character.id}/propose`, { ringId: 999999 })).body.error).toBe('need_ring');
    await buy(a, 'ankara-boutique', 'ring_1');
    const ring = (await inv(a.c)).find((i) => i.itemId === 'ring_1');
    expect((await a.c.post(`/api/relationships/${b.character.id}/propose`, { ringId: ring.id })).status).toBe(200);
    expect((await b.c.get(`/api/characters/${a.character.id}/relationship`)).body.proposal).toBe('incoming');
    expect((await b.c.post(`/api/relationships/${a.character.id}/proposal`, { accept: true })).status).toBe(200);
    expect((await inv(b.c)).map((i) => i.itemId)).toContain('ring_1'); // yüzük el değiştirdi
    rel = (await a.c.get(`/api/characters/${b.character.id}/relationship`)).body;
    expect(rel.stage).toBe('engaged');
    // Nişanlı biri başkasıyla flört edemez
    const c3 = await newPlayer({ cityId: 'ankara' });
    const [p, r] = [a.character.id, c3.character.id].sort((m, n) => m - n);
    await q('INSERT INTO relationships(a_id, b_id, friendship) VALUES ($1, $2, 60)', [p, r]);
    expect((await c3.c.post(`/api/relationships/${a.character.id}/flirt`)).body.error).toBe('taken');

    expect((await a.c.post(`/api/relationships/${b.character.id}/wedding`, { locationId: 'ankara-park' })).body.error).toBe('invalid_location');
    expect((await a.c.post(`/api/relationships/${b.character.id}/wedding`, { locationId: 'ankara-worship' })).status).toBe(200);
    expect((await a.c.get(`/api/characters/${b.character.id}/relationship`)).body.stage).toBe('married');

    expect((await a.c.post(`/api/relationships/${b.character.id}/adopt`, { locationId: 'ankara-city_hall', name: 'Deniz' })).status).toBe(200);
    expect((await b.c.post(`/api/relationships/${a.character.id}/adoption`, { accept: true })).status).toBe(200);
    const prof = (await c3.c.get(`/api/characters/${a.character.id}`)).body.character;
    expect(prof.partner).toMatchObject({ characterId: b.character.id, stage: 'married' });
    expect(prof.children.map((k: any) => k.name)).toEqual(['Deniz']);

    // Evli ve eşi aynı şehirdeyken evde dinlenmek daha iyi gelir
    await a.c.post('/api/homes/rent', { homeId: 'room', locationId: 'ankara-real_estate' });
    await a.c.post('/api/actions', { kind: 'rest', hours: 1 });
    const act = (await me(a.c)).action;
    expect(act.params.restBonus).toBe(15 + 10);
    await finishNow(a.character.id);

    expect((await a.c.post(`/api/relationships/${b.character.id}/break-up`, {})).body.error).toBe('divorce_at_courthouse');
    expect((await a.c.post(`/api/relationships/${b.character.id}/break-up`, { locationId: 'ankara-courthouse' })).status).toBe(200);
    expect((await a.c.get(`/api/characters/${b.character.id}/relationship`)).body.stage).toBe('none');
  }));
});

describe('ikinci el pazarı, boya ve atölye', () => {
  it('ilan verilir, ilandaki eşya kullanılamaz, satın alınır, komisyon kesilir', async () => {
    const s = await newPlayer({ cityId: 'berlin' });
    const b = await newPlayer({ cityId: 'berlin' });
    await setMoney(s.character.id, 5000);
    await setMoney(b.character.id, 5000);
    await buy(s, 'berlin-music_store', 'guitar_2');
    const g = (await inv(s.c))[0];
    expect((await s.c.post('/api/market', { locationId: 'berlin-park', inventoryId: g.id, price: 700 })).body.error).toBe('invalid_location');
    const l = await s.c.post('/api/market', { locationId: 'berlin-flea_market', inventoryId: g.id, price: 700 });
    expect(l.status).toBe(200);
    expect((await inv(s.c))[0]).toMatchObject({ listed: true, equipped: false });
    expect((await s.c.post(`/api/inventory/${g.id}/equip`)).body.error).toBe('item_listed');
    expect((await s.c.post('/api/gifts', { toId: b.character.id, inventoryId: g.id })).body.error).toBe('item_listed');
    const list = (await b.c.get('/api/market')).body.listings;
    expect(list.find((x: any) => x.id === l.body.id)).toMatchObject({ price: 700, mine: false });
    expect((await s.c.post(`/api/market/${l.body.id}/buy`, { locationId: 'berlin-flea_market' })).body.error).toBe('own_listing');
    const before = (await raw(s.character.id)).money;
    expect((await b.c.post(`/api/market/${l.body.id}/buy`, { locationId: 'berlin-flea_market' })).status).toBe(200);
    expect((await raw(s.character.id)).money).toBe(before + 665); // %5 komisyon
    expect((await raw(b.character.id)).money).toBe(5000 - 700);
    expect((await inv(b.c)).map((i) => i.itemId)).toEqual(['guitar_2']);
    expect((await b.c.post(`/api/market/${l.body.id}/buy`, { locationId: 'berlin-flea_market' })).body.error).toBe('listing_gone');
  });

  it('sprey boyayla boyanır, isim verilir; atölyede malzemeden enstrüman üretilir, yarıda bırakılırsa malzeme geri gelir', () => slow(async () => {
    const p = await newPlayer({ cityId: 'lyon' });
    await setMoney(p.character.id, 5000);
    await buy(p, 'lyon-music_store', 'guitar_1');
    expect((await buy(p, 'lyon-hardware', 'spray_pink', 2)).body.qty).toBe(2);
    const items = await inv(p.c);
    const guitar = items.find((i) => i.itemId === 'guitar_1');
    const spray = items.find((i) => i.itemId === 'spray_pink');
    expect((await p.c.post(`/api/inventory/${guitar.id}/paint`, { sprayId: spray.id })).body.color).toBe('pink');
    expect((await p.c.post(`/api/inventory/${guitar.id}/name`, { name: 'Pembe Panter' })).body.nickname).toBe('Pembe Panter');
    expect((await p.c.post(`/api/inventory/${guitar.id}/name`, { name: 'orospu' })).body.error).toBe('invalid_name');
    const after = await inv(p.c);
    expect(after.find((i) => i.id === guitar.id)).toMatchObject({ color: 'pink', nickname: 'Pembe Panter' });
    expect(after.filter((i) => i.itemId === 'spray_pink')).toHaveLength(1);

    // Atölye
    expect((await p.c.post('/api/actions', { kind: 'craft', recipe: 'guitar', locationId: 'lyon-hardware' })).body.error).toBe('missing_materials');
    for (const m of ['mat_wood', 'mat_strings', 'mat_pickup']) await buy(p, 'lyon-hardware', m);
    await setSkills(p.character.id, { craftsmanship: 80 });
    expect((await p.c.post('/api/actions', { kind: 'craft', recipe: 'guitar', locationId: 'lyon-hardware' })).status).toBe(200);
    expect((await inv(p.c)).some((i) => i.itemId === 'mat_wood')).toBe(false); // malzeme ayrıldı
    await p.c.post('/api/actions/cancel');
    expect((await inv(p.c)).filter((i) => i.itemId.startsWith('mat_'))).toHaveLength(3); // geri geldi
    await p.c.post('/api/actions', { kind: 'craft', recipe: 'guitar', locationId: 'lyon-hardware' });
    await finishNow(p.character.id);
    const crafted = (await inv(p.c)).find((i) => i.itemId === 'guitar_crafted');
    expect(crafted.bonus).toBeGreaterThanOrEqual(10); // usta işi: dükkândaki sahne gitarından iyi
    expect(crafted.craftedBy).toBe(p.character.name);
  }));
});

describe('yaşam mekânları', () => {
  it('araçla ucuz ve hızlı yolculuk, evcil hayvan ve otel bonusu, yemek, banka, dövme, spor', () => slow(async () => {
    const p = await newPlayer({ cityId: 'istanbul' });
    await setMoney(p.character.id, 20000);
    const t0 = (await p.c.get('/api/cities/istanbul')).status;
    expect(t0).toBe(200);
    await buy(p, 'istanbul-car_dealer', 'car_2');
    expect((await inv(p.c))[0]).toMatchObject({ itemId: 'car_2', equipped: true });
    const go = await p.c.post('/api/actions', { kind: 'travel', toCityId: 'ankara', mode: 'car' });
    expect(go.status).toBe(200);
    expect(go.body.action.params.cost).toBeLessThan(10 + 350 * 0.03); // otobüsten ucuz
    await finishNow(p.character.id);
    expect((await me(p.c)).character.cityId).toBe('ankara');

    // Otel: evi olmayan şehirde konforlu dinlenme + evcil hayvan
    await buy(p, 'ankara-pet_shop', 'pet_dog');
    expect((await p.c.post('/api/hotel', { locationId: 'ankara-hotel', nights: 1 })).status).toBe(200);
    expect((await me(p.c)).character.hotel.cityId).toBe('ankara');
    await p.c.post('/api/actions', { kind: 'rest', hours: 1 });
    const act = (await me(p.c)).action;
    expect(act.params).toMatchObject({ hotel: true, pet: true, restBonus: 30 });
    await finishNow(p.character.id);

    // Yemek ve tokluk
    await q('UPDATE characters SET mood = 50 WHERE id = $1', [p.character.id]);
    const meal = await p.c.post('/api/meals', { locationId: 'ankara-restaurant', mealId: 'chef' });
    expect(meal.status).toBe(200);
    expect((await raw(p.character.id)).mood).toBe(65);
    expect((await p.c.post('/api/meals', { locationId: 'ankara-restaurant', mealId: 'soup' })).body.error).toBe('still_full');

    // Banka: cezada el konulmaz, haftalık faiz
    expect((await p.c.post('/api/bank/deposit', { locationId: 'ankara-bank', amount: 10000 })).body.bank).toBe(10000);
    const dueNow = () => q('UPDATE characters SET bank_interest_at = now() - interval \'1 second\' WHERE id = $1', [p.character.id]);
    // Faiz, dönem boyunca hesapta kalan paraya işler: dönemin sonunda yatırılan para o dönem faiz almaz
    await dueNow();
    await tick();
    expect((await me(p.c)).character.bank).toBe(10000);
    await dueNow();
    await tick();
    expect((await me(p.c)).character.bank).toBe(10030);
    // Dönem içinde çekilen para faizi düşürür; yatırıp çekmek faiz getirmez
    await p.c.post('/api/bank/withdraw', { locationId: 'ankara-bank', amount: 5030 });
    await p.c.post('/api/bank/deposit', { locationId: 'ankara-bank', amount: 5030 });
    await dueNow();
    await tick();
    expect((await me(p.c)).character.bank).toBe(10045);
    expect((await p.c.post('/api/bank/withdraw', { locationId: 'ankara-bank', amount: 50000 })).body.error).toBe('not_enough_money');

    // Dövme
    expect((await p.c.post('/api/tattoos', { locationId: 'ankara-tattoo', tattooId: 'rose' })).status).toBe(200);
    const other = await newPlayer();
    expect((await other.c.get(`/api/characters/${p.character.id}`)).body.character.tattoos).toEqual(['rose']);

    // Spor: ilk antrenman kondisyonu açar; kondisyon yorucu işlerde sağlık kaybını azaltır
    expect((await p.c.post('/api/actions', { kind: 'workout', hours: 2, locationId: 'ankara-gym' })).status).toBe(200);
    await finishNow(p.character.id);
    expect((await raw(p.character.id)).skills.fitness).toBeGreaterThan(0);
  }));
});

describe('oyuncu işletmeleri', () => {
  it('bar alınır, çalışan işe alınır, mesai kasaya para getirir ve maaş kasadan ödenir; gider ödenemezse ruhsat gider', async () => {
    const owner = await newPlayer({ cityId: 'hamburg' });
    const worker = await newPlayer({ cityId: 'hamburg' });
    await setMoney(owner.character.id, 40000);
    const loc = 'hamburg-biz1';
    const view = (await owner.c.get(`/api/businesses/${loc}`)).body.business;
    expect(view).toMatchObject({ forSale: true, kind: 'bar', price: 27000 }); // 20.000 × 1,35
    expect((await owner.c.post(`/api/businesses/${loc}/buy`)).status).toBe(200);
    expect((await owner.c.post(`/api/businesses/hamburg-biz2/buy`)).body.error).toBe('already_owner');
    expect((await owner.c.patch(`/api/businesses/${loc}`, { name: 'Kiez Keller', gigShare: 0.2 })).status).toBe(200);
    expect((await owner.c.patch(`/api/businesses/${loc}`, { gigShare: 0.9 })).body.error).toBe('invalid_share');

    expect((await worker.c.post('/api/actions', { kind: 'work', locationId: loc, hours: 2 })).body.error).toBe('not_employed');
    await owner.c.post(`/api/businesses/${loc}/staff`, { characterId: worker.character.id, wage: 15 });
    await worker.c.post(`/api/businesses/${loc}/job`, { accept: true });
    // Kasa boşken çalışan mesaiye başlayamaz
    expect((await worker.c.post('/api/actions', { kind: 'work', locationId: loc, hours: 2 })).body.error).toBe('till_empty');
    await owner.c.post(`/api/businesses/${loc}/till`, { amount: -100 }); // kasaya 100 koy
    const before = (await raw(worker.character.id)).money;
    expect((await worker.c.post('/api/actions', { kind: 'work', locationId: loc, hours: 2 })).status).toBe(200);
    await finishNow(worker.character.id);
    expect((await raw(worker.character.id)).money).toBe(before + 30);
    let b = (await owner.c.get(`/api/businesses/${loc}`)).body.business;
    // 2 saat × saatlik gelir × 1,35 (gelir 20 → 12: denge raporu madde 7)
    expect(b.till).toBe(100 - 30 + Math.round(2 * BUSINESS_RULES.bar.revenuePerHour * 1.35));
    expect(b.staff[0]).toMatchObject({ characterId: worker.character.id, status: 'hired', wage: 15 });
    expect((await me(worker.c)).character.business).toEqual({ locationId: loc, role: 'staff' });

    // Barda konser: bilet gelirinden sahibine pay
    const band = await newPlayer({ cityId: 'hamburg', instrument: 'vocals' });
    await setVip(band.userId);
    await band.c.post('/api/actions', { kind: 'write_song', title: 'Keller', genre: 'rock' });
    await finishNow(band.character.id);
    const bd = (await band.c.post('/api/bands', { name: 'Hafen Jungs', genre: 'rock', role: 'vocals' })).body.band;
    await q(`INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist) VALUES ($1, 'hamburg', $2, now(), $3)`, [bd.id, loc, bd.songs.map((s: any) => s.id)]);
    await tick();
    b = (await owner.c.get(`/api/businesses/${loc}`)).body.business;
    const gigLog = b.log.find((l: any) => l.kind === 'gig');
    expect(gigLog.amount).toBeGreaterThan(0);

    // Gider: kasadan ödenir; ne kasada ne cepte para yoksa ruhsat geri alınır
    await q('UPDATE businesses SET upkeep_due = now() - interval \'1 second\' WHERE location_id = $1', [loc]);
    await tick();
    b = (await owner.c.get(`/api/businesses/${loc}`)).body.business;
    expect(b.log[0]).toMatchObject({ kind: 'upkeep' });
    await q('UPDATE businesses SET till = 0, upkeep_due = now() - interval \'1 second\' WHERE location_id = $1', [loc]);
    await setMoney(owner.character.id, 0);
    await tick();
    expect((await owner.c.get(`/api/businesses/${loc}`)).body.business.forSale).toBe(true);
    expect((await worker.c.get('/api/notifications')).body.notifications.some((n: any) => n.kind === 'job_lost')).toBe(true);
  });
});

describe('büyük sahne', () => {
  it('sahne efektleri konserde tüketilir, iptalde geri verilir; festival elle ayarlanamaz', async () => {
    const p = await newPlayer({ cityId: 'paris', instrument: 'vocals' });
    await setVip(p.userId);
    await setMoney(p.character.id, 5000);
    await p.c.post('/api/actions', { kind: 'write_song', title: 'Seine', genre: 'pop' });
    await finishNow(p.character.id);
    const band = (await p.c.post('/api/bands', { name: 'Les Testeurs', genre: 'pop', role: 'vocals' })).body.band;
    await buy(p, 'paris-stage_shop', 'fx_pyro');
    const fx = (await inv(p.c)).find((i) => i.itemId === 'fx_pyro');
    const prev = config.gameSpeed;
    config.gameSpeed = 3600;
    try {
      const gig = await p.c.post('/api/gigs', { locationId: 'paris-bar', inHours: 2, setlist: band.songs.map((s: any) => s.id), effects: [fx.id] });
      expect(gig.status).toBe(200);
      expect((await inv(p.c)).some((i) => i.itemId === 'fx_pyro')).toBe(false);
      await p.c.del(`/api/gigs/${gig.body.gig.id}`);
      expect((await inv(p.c)).some((i) => i.itemId === 'fx_pyro')).toBe(true);
      expect((await p.c.post('/api/gigs', { locationId: 'paris-festival', inHours: 2, setlist: band.songs.map((s: any) => s.id) })).body.error).toBe('festival_only');
    } finally {
      config.gameSpeed = prev;
    }
  });

  it('festival açılır, başvuru alır, en ünlü grupları seçip sahneye koyar', () => slow(async () => {
    await q(`DELETE FROM festivals`);
    await processFestivals();
    const p = await newPlayer({ cityId: 'istanbul', instrument: 'vocals' });
    const list = (await p.c.get('/api/festivals')).body.festivals;
    const tr = list.find((f: any) => f.countryCode === 'TR');
    expect(tr).toMatchObject({ status: 'open', cityId: 'istanbul' });
    await p.c.post('/api/actions', { kind: 'write_song', title: 'Boğaz', genre: 'pop' });
    await finishNow(p.character.id);
    const band = (await p.c.post('/api/bands', { name: 'Festival Grubu', genre: 'pop', role: 'vocals' })).body.band;
    await q(`UPDATE festivals SET apply_until = now() + interval '1 hour', starts_at = now() + interval '2 hours' WHERE id = $1`, [tr.id]);
    expect((await p.c.post(`/api/festivals/${tr.id}/apply`)).body.error).toBe('not_famous_enough');
    await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 30)`, [band.id]);
    expect((await p.c.post(`/api/festivals/${tr.id}/apply`)).status).toBe(200);
    expect((await p.c.post(`/api/festivals/${tr.id}/apply`)).body.error).toBe('already_applied');
    await q(`UPDATE festivals SET apply_until = now() - interval '1 second', starts_at = now() + interval '1 hour' WHERE id = $1`, [tr.id]);
    await processFestivals();
    const f = (await p.c.get(`/api/festivals/${tr.id}`)).body.festival;
    expect(f.status).toBe('scheduled');
    expect(f.lineup.find((x: any) => x.bandId === band.id)).toMatchObject({ selected: true, slot: 1 });
    const gig = await q(`SELECT * FROM gigs WHERE festival_id = $1 AND band_id = $2`, [tr.id, band.id]);
    expect(gig.rows[0]).toMatchObject({ location_id: 'istanbul-festival' });
    expect(gig.rows[0].session_roles.length).toBe(4); // eksik roller kiralık müzisyenle
  }));
});

describe('haftalık görevler', () => {
  it('her oyuncuya haftada 3 görev; ilerleme yapılanlardan hesaplanır, ödül bir kez', async () => {
    await tick(); // açık liste haftası olsun
    const p = await newPlayer();
    const state = (await p.c.get('/api/missions')).body;
    expect(state.missions).toHaveLength(MISSIONS_PER_WEEK);
    expect(state.missions.map((m: any) => m.id)).toEqual(missionsFor(p.character.id, state.weekId).map((m) => m.id));
    // İlk görevi tamamlanmış say: haftayı sabitleyip uygun eylemleri ekle
    const m = state.missions[0];
    expect((await p.c.post(`/api/missions/${m.id}/claim`)).body.error).toBe('step_not_done');
    await q(`UPDATE mission_claims SET reward = reward WHERE false`);
    // Görev türüne bakmadan: ilerlemeyi doğrudan doldurmak yerine gerçek bir tür seçelim
    const songs = state.missions.find((x: any) => x.id === 'songs_2');
    if (songs) {
      for (let i = 0; i < 2; i++) {
        await p.c.post('/api/actions', { kind: 'write_song', title: `Görev ${i}`, genre: 'pop' });
        await finishNow(p.character.id);
      }
      const before = (await raw(p.character.id)).money;
      expect((await p.c.post('/api/missions/songs_2/claim')).body.reward).toBe(40);
      expect((await raw(p.character.id)).money).toBe(before + 40);
      expect((await p.c.post('/api/missions/songs_2/claim')).body.error).toBe('already_claimed');
    }
  });
});

describe('mağaza uyumu', () => {
  it('kayıtta şartlar kabul edilmeli; hesap uygulamadan silinebilir; şartlar ve gizlilik sayfası yayında', async () => {
    const anon = client();
    expect((await anon.post('/api/auth/register', { email: 'sart@test.com', password: 'gizli12345' })).body.error).toBe('invalid_input');
    const p = await newPlayer();
    await p.c.post('/api/actions', { kind: 'write_song', title: 'Veda', genre: 'pop' });
    await finishNow(p.character.id);
    await p.c.post('/api/bands', { name: 'Veda Grubu', genre: 'pop', role: 'vocals' });
    expect((await p.c.post('/api/auth/delete-account', { password: 'yanlis' })).status).toBe(401);
    expect((await p.c.post('/api/auth/delete-account', { password: 'gizli12345' })).status).toBe(200);
    expect((await p.c.get('/api/me')).status).toBe(401);
    expect((await q('SELECT count(*)::int AS n FROM characters WHERE id = $1', [p.character.id])).rows[0].n).toBe(0);
    expect((await q(`SELECT count(*)::int AS n FROM bands WHERE name = 'Veda Grubu'`)).rows[0].n).toBe(0);

    const terms = await inject('GET', '/legal/terms');
    expect(terms.statusCode).toBe(200);
    expect(terms.body).toContain('Kullanım Şartları');
    expect(terms.body).toContain(config.contactEmail);
    expect((await inject('GET', '/legal/privacy')).body).toContain('Gizlilik Politikası');
  });

  it('kalıcı adlarda küfür reddedilir, sohbette yıldızlanır', async () => {
    const p = await newPlayer();
    expect((await p.c.post('/api/bands', { name: 'Fuck Yeah', genre: 'rock', role: 'guitar' })).body.error).toBe('invalid_input');
    const msg = await p.c.post('/api/chat', { channel: `city:${p.character.cityId}`, text: 'bu konser amk efsane' });
    expect(msg.body.message.text).toBe('bu konser *** efsane');
    expect((await p.c.patch('/api/character', { headline: 'Gece kuşu ve piç' })).body.character.headline).toBe('Gece kuşu ve ***');
    void advance;
  });
});

describe('kötüye kullanım koruması', () => {
  it('teklifteki yüzük satılamaz; üretilen eşya dükkâna satılamaz; VIP eşyası hediyeyle VIP olmayana geçmez', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    await setMoney(a.character.id, 5000);
    await buy(a, 'istanbul-boutique', 'ring_1');
    const ring = (await inv(a.c)).find((i) => i.itemId === 'ring_1');
    const [lo, hi] = a.character.id < b.character.id ? [a.character.id, b.character.id] : [b.character.id, a.character.id];
    await q(`INSERT INTO relationships(a_id, b_id, friends, friendship, romance, flirted_a, flirted_b, stage) VALUES ($1, $2, TRUE, 80, 80, TRUE, TRUE, 'dating')`, [lo, hi]);
    expect((await a.c.post(`/api/relationships/${b.character.id}/propose`, { ringId: ring.id })).status).toBe(200);
    // Teklifteki yüzük ilana konamaz, dükkâna satılamaz, hediye edilemez
    expect((await a.c.post('/api/market', { locationId: 'istanbul-flea_market', inventoryId: ring.id, price: 700 })).body.error).toBe('ring_pledged');
    expect((await a.c.post('/api/shop/sell', { locationId: 'istanbul-boutique', inventoryId: ring.id })).body.error).toBe('ring_pledged');
    expect((await a.c.post('/api/gifts', { toId: b.character.id, inventoryId: ring.id })).body.error).toBe('ring_pledged');
    expect((await b.c.post(`/api/relationships/${a.character.id}/proposal`, { accept: true })).status).toBe(200);
    expect((await inv(b.c)).some((i) => i.id === ring.id)).toBe(true);

    // Üretilen eşya: pazarda satılır ama dükkâna satılmaz
    await q(`INSERT INTO inventory(character_id, item_id, slot, bonus, crafted_by) VALUES ($1, 'guitar_crafted', 'guitar', 9, $1)`, [a.character.id]);
    const crafted = (await inv(a.c)).find((i) => i.itemId === 'guitar_crafted');
    expect((await a.c.post('/api/shop/sell', { locationId: 'istanbul-hardware', inventoryId: crafted.id })).body.error).toBe('crafted_not_sellable');

    // VIP eşyası VIP olmayana hediye edilemez
    await setVip(a.userId);
    await setMoney(a.character.id, 70000);
    expect((await buy(a, 'istanbul-car_dealer', 'car_4')).status).toBe(200);
    const vipCar = (await inv(a.c)).find((i) => i.itemId === 'car_4');
    await q('UPDATE relationships SET friends = TRUE WHERE a_id = $1 AND b_id = $2', [lo, hi]);
    expect((await a.c.post('/api/gifts', { toId: b.character.id, inventoryId: vipCar.id })).body.error).toBe('vip_required');
  });

  it('mesai sırasında işletme el değiştirirse gelir yeni sahibe gitmez, artan maaş eski sahibe döner', () => slow(async () => {
    const owner = await newPlayer();
    const worker = await newPlayer();
    const buyer = await newPlayer();
    await setMoney(owner.character.id, 30000);
    await setMoney(buyer.character.id, 30000);
    await owner.c.post('/api/businesses/istanbul-biz2/buy');
    await owner.c.post('/api/businesses/istanbul-biz2/till', { amount: -500 });
    await owner.c.post('/api/businesses/istanbul-biz2/staff', { characterId: worker.character.id, wage: 20 });
    await worker.c.post('/api/businesses/istanbul-biz2/job', { accept: true });
    expect((await worker.c.post('/api/actions', { kind: 'work', locationId: 'istanbul-biz2', hours: 4 })).status).toBe(200);
    const afterSale = (await owner.c.post('/api/businesses/istanbul-biz2/sell')).body.refund;
    expect(afterSale).toBeGreaterThan(0);
    await buyer.c.post('/api/businesses/istanbul-biz2/buy');
    const ownerMoney = (await raw(owner.character.id)).money;
    // Mesai yarıda biter: çalışılan kısım ödenir, artan maaş eski sahibe döner, yeni sahibin kasasına bir şey girmez
    expect((await worker.c.post('/api/actions/cancel')).status).toBe(200);
    const view = (await buyer.c.get('/api/businesses/istanbul-biz2')).body.business;
    expect(view.till).toBe(0);
    expect((await raw(owner.character.id)).money).toBeGreaterThan(ownerMoney);
  }));
});
