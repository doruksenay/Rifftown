import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SESSION_MUSICIAN } from '@rifftown/shared';
import { config } from '../src/config';
import { pool } from '../src/db';
import { advance, client, me, newPlayer, raw, setMoney, setSkills, setVip, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

describe('hesap ve karakter', () => {
  it('kayıt, giriş ve karakter oluşturma', async () => {
    const anon = client();
    const reg = await anon.post('/api/auth/register', { email: 'Deniz@Test.com', password: 'cokgizli123', lang: 'tr', acceptTerms: true });
    expect(reg.status).toBe(200);
    expect(reg.body.user.email).toBe('deniz@test.com');

    expect((await anon.post('/api/auth/register', { email: 'deniz@test.com', password: 'cokgizli123', acceptTerms: true })).body.error).toBe('email_taken');
    expect((await anon.post('/api/auth/login', { email: 'deniz@test.com', password: 'yanlis' })).status).toBe(401);
    const login = await anon.post('/api/auth/login', { email: 'deniz@test.com', password: 'cokgizli123' });
    expect(login.status).toBe(200);

    const c = client(login.body.token);
    expect((await me(c)).character).toBeNull();
    expect((await c.post('/api/actions', { kind: 'rest', hours: 1 })).body.error).toBe('no_character');

    const bad = await c.post('/api/character', { name: 'x', cityId: 'istanbul', mainInstrument: 'guitar' });
    expect(bad.body.error).toBe('invalid_input');
    const ch = await c.post('/api/character', { name: 'Deniz Kaya', cityId: 'izmir', mainInstrument: 'vocals' });
    expect(ch.status).toBe(200);
    expect(ch.body.character).toMatchObject({ name: 'Deniz Kaya', cityId: 'izmir', money: 500, mood: 80, health: 100 });
    expect((await raw(ch.body.character.id)).skills.vocals).toBe(12);
    expect((await raw(ch.body.character.id)).skills.basic_singing).toBe(20);
    expect(ch.body.character.skills.guitar).toBeUndefined(); // öğrenilmemiş beceri

    const again = await c.post('/api/character', { name: 'Başka Biri', cityId: 'izmir', mainInstrument: 'vocals' });
    expect(again.body.error).toBe('character_exists');

    const other = client((await anon.post('/api/auth/register', { email: 'b@test.com', password: 'cokgizli123', acceptTerms: true })).body.token);
    expect((await other.post('/api/character', { name: 'deniz kaya', cityId: 'izmir', mainInstrument: 'drums' })).body.error).toBe('name_taken');

    expect((await c.post('/api/auth/logout')).status).toBe(200);
    expect((await c.get('/api/me')).status).toBe(401);
  });
});

describe('eylemler', () => {
  it('kendi kendine çalışma beceriyi artırır, aynı anda tek eylem yapılır', async () => {
    const { c } = await newPlayer();
    const start = await c.post('/api/actions', { kind: 'study', skill: 'guitar', hours: 4 });
    expect(start.status).toBe(200);
    expect((await c.post('/api/actions', { kind: 'rest', hours: 1 })).body.error).toBe('busy');
    expect((await me(c)).action.kind).toBe('study');

    await advance();
    const m = await me(c);
    expect(m.action).toBeNull();
    expect(m.character.skills.guitar).toBeGreaterThan(12);
    expect(m.character.mood).toBeLessThan(80);
    const notes = (await c.get('/api/notifications')).body.notifications;
    expect(notes.some((n: any) => n.kind === 'action_done' && n.data.kind === 'study')).toBe(true);
  });

  it('okulda çalışmak ücretlidir ve daha verimlidir', async () => {
    const a = await newPlayer({ instrument: 'drums' });
    const b = await newPlayer({ instrument: 'drums' });
    await a.c.post('/api/actions', { kind: 'study', skill: 'drums', hours: 2 });
    const school = await b.c.post('/api/actions', { kind: 'study', skill: 'drums', hours: 2, locationId: 'istanbul-school' });
    expect(school.status).toBe(200);
    expect(school.body.action.params.cost).toBe(60);
    await advance();
    const ma = await me(a.c);
    const mb = await me(b.c);
    expect(mb.character.money).toBe(440);
    expect(mb.character.skills.drums).toBeGreaterThan(ma.character.skills.drums);
    expect(mb.character.locationId).toBe('istanbul-school');
  });

  it('çalışmak para kazandırır, dinlenmek ruh hâlini düzeltir', async () => {
    const { c, character } = await newPlayer();
    expect((await c.post('/api/actions', { kind: 'work', locationId: 'ankara-work', hours: 4 })).body.error).toBe('not_in_city');
    expect((await c.post('/api/actions', { kind: 'work', locationId: 'istanbul-work', hours: 3 })).body.error).toBe('invalid_hours');
    await c.post('/api/actions', { kind: 'work', locationId: 'istanbul-work', hours: 8 });
    await advance();
    let m = await me(c);
    expect(m.character.money).toBe(500 + 15 * 8);
    expect((await raw(character.id)).mood).toBe(80 - 32);
    await c.post('/api/actions', { kind: 'rest', hours: 2 });
    await advance();
    expect((await raw(character.id)).mood).toBe(78);
  });

  it('eylem iptal edilebilir, seyahat edilemez', async () => {
    const { c } = await newPlayer();
    await c.post('/api/actions', { kind: 'rest', hours: 8 });
    const cancel = await c.post('/api/actions/cancel');
    expect(cancel.status).toBe(200);
    expect(cancel.body.action.status).toBe('cancelled');
    expect((await me(c)).action).toBeNull();

    await c.post('/api/actions', { kind: 'travel', toCityId: 'ankara', mode: 'bus' });
    expect((await c.post('/api/actions/cancel')).body.error).toBe('cannot_cancel');
  });

  it('seyahat: yoldayken şehir boştur, varınca değişir', async () => {
    const { c } = await newPlayer();
    expect((await c.post('/api/actions', { kind: 'travel', toCityId: 'newyork', mode: 'bus' })).body.error).toBe('invalid_route');
    const t = await c.post('/api/actions', { kind: 'travel', toCityId: 'ankara', mode: 'bus' });
    expect(t.status).toBe(200);
    let m = await me(c);
    expect(m.character.cityId).toBeNull();
    expect(m.character.money).toBe(500 - t.body.action.params.cost);
    await advance();
    m = await me(c);
    expect(m.character.cityId).toBe('ankara');
  });

  it('şarkı yazma yeni şarkı üretir', async () => {
    const { c } = await newPlayer();
    expect((await c.post('/api/actions', { kind: 'write_song', title: '  ', genre: 'rock' })).body.error).toBe('invalid_title');
    await c.post('/api/actions', { kind: 'write_song', title: 'Gece Treni', genre: 'rock' });
    await advance();
    const songs = (await c.get('/api/songs/mine')).body.songs;
    expect(songs).toHaveLength(1);
    expect(songs[0]).toMatchObject({ title: 'Gece Treni', genre: 'rock', inBand: false });
    expect(songs[0].quality).toBeGreaterThanOrEqual(1);
  });
});

describe('beceri ağacı', () => {
  it('bilinmeyen beceri çalışılamaz; kitapçıdan kitap alınca açılır', async () => {
    const { c } = await newPlayer({ instrument: 'vocals' });
    expect((await c.post('/api/actions', { kind: 'study', skill: 'genre_jazz', hours: 1 })).body.error).toBe('skill_not_known');
    expect((await c.post('/api/skills/learn', { skillId: 'genre_jazz', locationId: 'istanbul-music_store' })).body.error).toBe('invalid_location');
    const learn = await c.post('/api/skills/learn', { skillId: 'genre_jazz', locationId: 'istanbul-bookstore' });
    expect(learn.status).toBe(200);
    expect(learn.body.character.skills.genre_jazz).toBe(0);
    expect(learn.body.character.money).toBe(470);
    expect((await c.post('/api/skills/learn', { skillId: 'genre_jazz', locationId: 'istanbul-bookstore' })).body.error).toBe('already_known');
    expect((await c.post('/api/actions', { kind: 'study', skill: 'genre_jazz', hours: 1 })).status).toBe(200);
  });

  it('öncül beceri şartı: vokalist önce temel telli çalgıları öğrenmeli', async () => {
    const { c, character } = await newPlayer({ instrument: 'vocals' });
    expect((await c.post('/api/skills/learn', { skillId: 'guitar', locationId: 'istanbul-bookstore' })).body.error).toBe('missing_prereq');
    await c.post('/api/skills/learn', { skillId: 'basic_strings', locationId: 'istanbul-bookstore' });
    await pool.query(`UPDATE characters SET skills = skills || '{"basic_strings": 15}' WHERE id = $1`, [character.id]);
    expect((await c.post('/api/skills/learn', { skillId: 'guitar', locationId: 'istanbul-bookstore' })).status).toBe(200);
  });

  it('bazı beceriler sadece okulda öğrenilir', async () => {
    const { c, character } = await newPlayer();
    expect((await c.post('/api/actions', { kind: 'study', skill: 'improvisation', hours: 1 })).body.error).toBe('learn_at_school');
    expect((await c.post('/api/skills/learn', { skillId: 'improvisation', locationId: 'istanbul-bookstore' })).body.error).toBe('learn_at_school');
    expect((await c.post('/api/actions', { kind: 'study', skill: 'improvisation', hours: 1, locationId: 'istanbul-school' })).body.error).toBe('missing_prereq');
    await pool.query(`UPDATE characters SET skills = skills || '{"composing": 30}' WHERE id = $1`, [character.id]);
    expect((await c.post('/api/actions', { kind: 'study', skill: 'improvisation', hours: 2, locationId: 'istanbul-school' })).status).toBe(200);
    await advance();
    expect((await me(c)).character.skills.improvisation).toBeGreaterThan(0);
  });

  it('seviye atlayınca ayrı bir bildirim gelir', async () => {
    const { c, character } = await newPlayer();
    await pool.query(`UPDATE characters SET skills = skills || '{"guitar": 29.9}' WHERE id = $1`, [character.id]);
    await c.post('/api/actions', { kind: 'study', skill: 'guitar', hours: 2 });
    await advance();
    const notes = (await c.get('/api/notifications')).body.notifications;
    const up = notes.find((n: any) => n.kind === 'skill_up');
    expect(up.data.skill).toBe('guitar');
    expect(up.data.level).toBeGreaterThanOrEqual(30);
  });

  it('tür becerisi düşükse şarkı yarıdan fazla öğrenilemez', async () => {
    const { c } = await newPlayer({ instrument: 'drums' });
    await c.post('/api/actions', { kind: 'write_song', title: 'Caz Denemesi', genre: 'jazz' });
    await advance();
    const band = (await c.post('/api/bands', { name: 'Sınır Testi', genre: 'jazz', role: 'drums' })).body.band;
    for (let i = 0; i < 3; i++) {
      await c.post('/api/actions', { kind: 'rehearse', songId: band.songs[0].id, hours: 4, locationId: 'istanbul-studio' });
      await advance();
    }
    const fam = (await c.get('/api/bands/mine')).body.band.songs[0].myFamiliarity;
    expect(fam).toBeLessThanOrEqual(50);
    expect(fam).toBeGreaterThan(40);
  });
});

describe('dükkânlar ve hastane', () => {
  it('müzik mağazasından enstrüman alınır, kuşanılır ve geri satılır', async () => {
    const { c, character } = await newPlayer();
    await setMoney(character.id, 2000);
    expect((await c.post('/api/shop/buy', { locationId: 'istanbul-gallery', itemId: 'guitar_1' })).body.error).toBe('invalid_item');
    expect((await c.post('/api/shop/buy', { locationId: 'berlin-music_store', itemId: 'guitar_1' })).body.error).toBe('not_in_city');

    const b1 = await c.post('/api/shop/buy', { locationId: 'istanbul-music_store', itemId: 'guitar_1' });
    expect(b1.status).toBe(200);
    expect(b1.body.item.equipped).toBe(true);
    const b2 = await c.post('/api/shop/buy', { locationId: 'istanbul-music_store', itemId: 'guitar_2' });
    expect(b2.body.item.equipped).toBe(false);
    expect((await me(c)).character.money).toBe(2000 - 150 - 900);

    await c.post(`/api/inventory/${b2.body.item.id}/equip`);
    const inv = (await c.get('/api/inventory')).body.items;
    expect(inv.find((i: any) => i.itemId === 'guitar_2').equipped).toBe(true);
    expect(inv.find((i: any) => i.itemId === 'guitar_1').equipped).toBe(false);

    expect((await c.post('/api/shop/sell', { locationId: 'istanbul-boutique', inventoryId: b1.body.item.id })).body.error).toBe('wrong_shop');
    const sell = await c.post('/api/shop/sell', { locationId: 'istanbul-music_store', inventoryId: b1.body.item.id });
    expect(sell.body.earned).toBe(75);
    expect((await me(c)).character.money).toBe(2000 - 150 - 900 + 75);

    expect((await c.post('/api/shop/buy', { locationId: 'istanbul-music_store', itemId: 'guitar_3' })).body.error).toBe('not_enough_money');
  });

  it('enstrüman çalışma verimini artırır', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    await setMoney(b.character.id, 5000);
    await b.c.post('/api/shop/buy', { locationId: 'istanbul-music_store', itemId: 'guitar_3' });
    await a.c.post('/api/actions', { kind: 'study', skill: 'guitar', hours: 4 });
    await b.c.post('/api/actions', { kind: 'study', skill: 'guitar', hours: 4 });
    await advance();
    expect((await raw(b.character.id)).skills.guitar).toBeGreaterThan((await raw(a.character.id)).skills.guitar);
  });

  it('galeri eserleri dinlenmeyi güçlendirir', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    await setMoney(b.character.id, 5000);
    await b.c.post('/api/shop/buy', { locationId: 'istanbul-gallery', itemId: 'art_3' });
    await pool.query('UPDATE characters SET mood = 20 WHERE id = ANY($1::bigint[])', [[a.character.id, b.character.id]]);
    await a.c.post('/api/actions', { kind: 'rest', hours: 2 });
    await b.c.post('/api/actions', { kind: 'rest', hours: 2 });
    await advance();
    expect((await raw(a.character.id)).mood).toBe(50);
    expect((await raw(b.character.id)).mood).toBe(54.5);
  });

  it('hasta karakter çalışamaz, hastanede iyileşir', async () => {
    const { c, character } = await newPlayer();
    await pool.query('UPDATE characters SET health = 10 WHERE id = $1', [character.id]);
    expect((await c.post('/api/actions', { kind: 'work', locationId: 'istanbul-work', hours: 2 })).body.error).toBe('too_sick');
    const t = await c.post('/api/actions', { kind: 'treat', locationId: 'istanbul-hospital', hours: 2 });
    expect(t.status).toBe(200);
    await advance();
    const m = await me(c);
    expect((await raw(character.id)).health).toBe(50);
    expect(m.character.money).toBe(500 - 80);
  });
});

describe('grup ve konser', () => {
  it('tek başına: grup kur, kiralık müzisyenlerle konser ver', async () => {
    const { c, character, userId } = await newPlayer({ instrument: 'vocals' });
    await setVip(userId); // testte zaman çok hızlı aktığı için rapor süresine takılmasın
    await c.post('/api/actions', { kind: 'write_song', title: 'İlk Şarkı', genre: 'pop' });
    await advance();
    await c.post('/api/actions', { kind: 'write_song', title: 'İkinci Şarkı', genre: 'pop' });
    await advance();

    const band = await c.post('/api/bands', { name: 'Tek Kişilik Orkestra', genre: 'pop', role: 'vocals' });
    expect(band.status).toBe(200);
    expect(band.body.band.songs).toHaveLength(2); // kendi şarkıları otomatik eklenir
    const songIds = band.body.band.songs.map((s: any) => s.id);

    const rh = await c.post('/api/actions', { kind: 'rehearse', songId: songIds[0], hours: 4, locationId: 'istanbul-studio' });
    expect(rh.status).toBe(200);
    await advance();
    const detail = (await c.get('/api/bands/mine')).body.band;
    expect(detail.members[0].familiarity[songIds[0]]).toBeGreaterThan(30);

    expect((await c.post('/api/gigs', { locationId: 'istanbul-hall', inHours: 2, setlist: songIds })).body.error).toBe('not_famous_enough');
    await setMoney(character.id, 1000);
    const before = (await me(c)).character.money;
    const gig = await c.post('/api/gigs', {
      locationId: 'istanbul-bar',
      inHours: 2,
      setlist: songIds,
      sessionRoles: ['guitar', 'bass', 'drums'],
    });
    expect(gig.status).toBe(200);
    const fee = 3 * SESSION_MUSICIAN.bar.fee;
    expect((await me(c)).character.money).toBe(before - fee);

    await advance();
    const after = (await c.get(`/api/gigs/${gig.body.gig.id}`)).body.gig;
    expect(after.status).toBe('done');
    expect(after.result.attendance).toBeGreaterThan(0);
    // Kiralık müzisyenler üye sayılmaz: sahnede 1 üye, grupta 1 üye
    expect(after.result.presentCount).toBe(1);
    expect(after.result.memberCount).toBe(1);
    expect(after.result.quality).toBeGreaterThan(0);
    // Rapor nedenini açıklar ve sıradaki adımı önerir
    expect(after.result.factors.setLength).toBeDefined();
    expect(Array.isArray(after.result.advice)).toBe(true);
    expect(typeof after.result.fame).toBe('number');
    // Eleştiri konseri bilir: mekânın adı ve gerçek seyirci sayısı geçer
    expect(after.result.review.tr).toContain('Kadıköy Bodrum Bar');
    expect(after.result.review.en).toContain('Kadikoy Basement Bar');
    const notes = (await c.get('/api/notifications')).body.notifications;
    expect(notes.some((n: any) => n.kind === 'gig_done')).toBe(true);
    expect((await me(c)).character.money).toBe(before - fee + after.result.perMember);
  });

  it('çakışan konser alınamaz; iptal kiralık müzisyen ücretini iade eder', async () => {
    // Bu test için oyunu yavaşlat: 1 oyun saati = 1 saniye
    const prev = config.gameSpeed;
    config.gameSpeed = 3600;
    try {
      const { c } = await newPlayer();
      // Önceki testlerden kalan konserler bu sahneyi meşgul göstermesin
      await pool.query(`UPDATE gigs SET status = 'cancelled' WHERE location_id = 'istanbul-bar' AND status = 'scheduled'`);
      await pool.query(
        `INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Deneme', 'rock', 40)`,
        [(await me(c)).character.id],
      );
      const band = (await c.post('/api/bands', { name: 'Çakışma Testi', genre: 'rock', role: 'guitar' })).body.band;
      const ids = band.songs.map((s: any) => s.id);
      const g1 = await c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: ids, sessionRoles: ['drums'] });
      expect(g1.status).toBe(200);
      expect((await me(c)).character.money).toBe(500 - SESSION_MUSICIAN.bar.fee);
      expect((await c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: ids })).body.error).toBe('gig_clash');
      // Aynı sahnede aynı saatte başka bir grup çalamaz
      const other = await newPlayer();
      await pool.query(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Öteki', 'rock', 40)`, [(await me(other.c)).character.id]);
      const band2 = (await other.c.post('/api/bands', { name: 'Öteki Grup', genre: 'rock', role: 'guitar' })).body.band;
      const ids2 = band2.songs.map((s: any) => s.id);
      expect((await other.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: ids2 })).body.error).toBe('venue_busy');
      expect((await other.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 24, setlist: ids2 })).status).toBe(200);
      expect((await c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 12, setlist: ids })).status).toBe(200);
      const cancel = await c.del(`/api/gigs/${g1.body.gig.id}`);
      expect(cancel.body.refund).toBe(SESSION_MUSICIAN.bar.fee);
      expect((await me(c)).character.money).toBe(500);
      await pool.query(`UPDATE gigs SET status = 'cancelled' WHERE band_id = ANY($1::bigint[])`, [[band.id, band2.id]]);
    } finally {
      config.gameSpeed = prev;
    }
  });

  it('davet, katılma, grup sohbeti ve şehir dışındaki üyenin konseri kaçırması', async () => {
    const leader = await newPlayer({ instrument: 'guitar' });
    const friend = await newPlayer({ instrument: 'drums' });
    await setVip(leader.userId);
    await leader.c.post('/api/actions', { kind: 'write_song', title: 'Birlikte', genre: 'rock' });
    await advance();
    const band = (await leader.c.post('/api/bands', { name: 'Kadıköy Sesleri', genre: 'rock', role: 'guitar' })).body.band;
    expect((await leader.c.post('/api/bands', { name: 'İkinci Grup', genre: 'rock', role: 'guitar' })).body.error).toBe('already_in_band');

    const friendName = (await me(friend.c)).character.name;
    expect((await friend.c.post('/api/bands/mine/invites', { name: 'kimse', role: 'drums' })).body.error).toBe('no_band');
    const inv = await leader.c.post('/api/bands/mine/invites', { name: friendName, role: 'drums' });
    expect(inv.status).toBe(200);
    const invites = (await friend.c.get('/api/invites')).body.invites;
    expect(invites).toHaveLength(1);
    expect((await friend.c.post(`/api/invites/${invites[0].id}/accept`)).status).toBe(200);
    expect((await me(friend.c)).band.name).toBe('Kadıköy Sesleri');

    // grup sohbeti
    const channel = `band:${band.id}`;
    expect((await friend.c.post('/api/chat', { channel, text: 'Selam grup!' })).status).toBe(200);
    const msgs = (await leader.c.get(`/api/chat?channel=${encodeURIComponent(channel)}`)).body.messages;
    expect(msgs.map((m: any) => m.text)).toContain('Selam grup!');
    const outsider = await newPlayer();
    expect((await outsider.c.get(`/api/chat?channel=${encodeURIComponent(channel)}`)).status).toBe(403);
    expect((await outsider.c.get('/api/chat?channel=city:ankara')).status).toBe(403);
    expect((await outsider.c.post('/api/chat', { channel: 'city:istanbul', text: 'merhaba istanbul' })).status).toBe(200);

    // Arkadaş Ankara'ya gider, konser İstanbul'da
    await friend.c.post('/api/actions', { kind: 'travel', toCityId: 'ankara', mode: 'plane' });
    await advance();
    const gig = await leader.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: [band.songs[0].id] });
    expect(gig.status).toBe(200);
    await advance();
    const result = (await leader.c.get(`/api/gigs/${gig.body.gig.id}`)).body.gig.result;
    expect(result.presentCount).toBe(1);
    expect(result.memberCount).toBe(2);
    const fn = (await friend.c.get('/api/notifications')).body.notifications;
    expect(fn.find((n: any) => n.kind === 'gig_done').data.present).toBe(false);
  });

  it('lider ayrılınca liderlik devredilir, son üye ayrılınca grup dağılır', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    await a.c.post('/api/bands', { name: 'Geçici Grup', genre: 'jazz', role: 'keys' });
    const nameB = (await me(b.c)).character.name;
    await a.c.post('/api/bands/mine/invites', { name: nameB, role: 'bass' });
    const inv = (await b.c.get('/api/invites')).body.invites[0];
    await b.c.post(`/api/invites/${inv.id}/accept`);
    expect((await a.c.post('/api/bands/mine/leave')).body.disbanded).toBe(false);
    expect((await me(b.c)).band.isLeader).toBe(true);
    expect((await b.c.post('/api/bands/mine/leave')).body.disbanded).toBe(true);
    expect((await me(b.c)).band).toBeNull();
  });

  it('şöhret liderlik tablosuna yansır', async () => {
    const lb = (await (await newPlayer()).c.get('/api/leaderboard')).body;
    expect(Array.isArray(lb.bands)).toBe(true);
    const city = (await (await newPlayer()).c.get('/api/cities/istanbul')).body;
    expect(city.playersHere).toBeGreaterThan(0);
  });
});

describe('VIP', () => {
  it('kesin sayılar VIP\'e özel: normal üye seviye içinde kaba değer, VIP ve yönetici tam değer görür', async () => {
    const p = await newPlayer({ instrument: 'guitar' });
    await setSkills(p.character.id, { guitar: 37.3, basic_strings: 15.2 });
    await pool.query('UPDATE characters SET mood = 63.7 WHERE id = $1', [p.character.id]);

    // Normal üye: amatör seviyesi (30–45) içinde dörtte birlik adıma aşağı yuvarlanır
    let m = (await me(p.c)).character;
    expect(m.skills.guitar).toBe(33.8);
    expect(m.skills.basic_strings).toBe(15); // çırak eşiğinde kalır: öncül şart kontrolleri bozulmaz
    expect(m.mood).toBe(57.5); // normal seviyesi (45–70) içinde
    const pub = (await (await newPlayer()).c.get(`/api/characters/${p.character.id}`)).body.character;
    expect(pub.topSkills.find((x: any) => x.skill === 'guitar').level).toBe(33.8);

    // Oyunun kendisi ham değerle hesaplar: bas gitar kitabının şartı (temel telli çalgılar ≥ 15) sağlanır
    expect((await p.c.post('/api/skills/learn', { skillId: 'bass', locationId: 'istanbul-bookstore' })).status).toBe(200);

    // VIP: tam değer
    await setVip(p.userId);
    m = (await me(p.c)).character;
    expect(m.skills.guitar).toBe(37.3);
    expect(m.mood).toBe(63.7);

    // Yönetici: tam değer
    const admin = await newPlayer();
    await pool.query('UPDATE users SET is_admin = TRUE WHERE id = $1', [admin.userId]);
    const seen = (await admin.c.get(`/api/characters/${p.character.id}`)).body.character;
    expect(seen.topSkills.find((x: any) => x.skill === 'guitar').level).toBe(37);
  });

  it('konser öncesi seyirci tahmini sadece VIP üyelere açık', async () => {
    const p = await newPlayer();
    await p.c.post('/api/bands', { name: 'Tahmin Testi', genre: 'pop', role: 'guitar' });
    expect((await p.c.get('/api/gigs/estimate?locationId=istanbul-bar')).body.error).toBe('vip_required');
    await setVip(p.userId);
    const e = (await p.c.get('/api/gigs/estimate?locationId=istanbul-bar')).body;
    expect(e.min).toBeGreaterThan(0);
    expect(e.max).toBeGreaterThanOrEqual(e.min);
    expect(e.max).toBeLessThanOrEqual(e.capacity);
    // Turne planı: başka şehirdeki mekân için de sorulabilir
    expect((await p.c.get('/api/gigs/estimate?locationId=berlin-club')).status).toBe(200);
    expect((await p.c.get('/api/gigs/estimate?locationId=istanbul-park')).body.error).toBe('invalid_location');
  });

  it('konser raporu normal üyelerde süre dolunca kapanır, VIP üyelerde açık kalır', async () => {
    const leader = await newPlayer({ instrument: 'guitar' });
    const fan = await newPlayer();
    await leader.c.post('/api/actions', { kind: 'write_song', title: 'Rapor', genre: 'rock' });
    await advance();
    const band = (await leader.c.post('/api/bands', { name: 'Rapor Testi', genre: 'rock', role: 'guitar' })).body.band;
    const gig = (await leader.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: [band.songs[0].id] })).body.gig;
    await advance(150); // 3 oyun günü (test hızında 72 ms) geçsin
    const normal = (await fan.c.get(`/api/gigs/${gig.id}`)).body.gig;
    expect(normal.result).toBeNull();
    expect(normal.reportExpired).toBe(true);
    await setVip(fan.userId);
    expect((await fan.c.get(`/api/gigs/${gig.id}`)).body.gig.result.attendance).toBeGreaterThan(0);
  });

  it('VIP eşya, VIP beceri, uzun vadeli konser ve para gönderme sadece VIP üyelere açık', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    await setMoney(a.character.id, 30000);
    expect((await a.c.post('/api/shop/buy', { locationId: 'istanbul-music_store', itemId: 'guitar_4' })).body.error).toBe('vip_required');
    expect((await a.c.post('/api/skills/learn', { skillId: 'stagediving', locationId: 'istanbul-bookstore' })).body.error).toBe('vip_required');
    const nameB = (await me(b.c)).character.name;
    expect((await a.c.post('/api/transfer', { toName: nameB, amount: 100 })).body.error).toBe('vip_required');
    await a.c.post('/api/bands', { name: 'Uzun Vade', genre: 'pop', role: 'guitar' });
    await pool.query(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'X', 'pop', 30)`, [a.character.id]);
    const song = (await a.c.get('/api/songs/mine')).body.songs[0];
    await a.c.post('/api/bands/mine/songs', { songId: song.id });
    expect((await a.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 72, setlist: [song.id] })).body.error).toBe('vip_required');

    await setVip(a.userId);
    expect((await a.c.post('/api/shop/buy', { locationId: 'istanbul-music_store', itemId: 'guitar_4' })).status).toBe(200);
    await setSkills(a.character.id, { showmanship: 30 });
    expect((await a.c.post('/api/skills/learn', { skillId: 'stagediving', locationId: 'istanbul-bookstore' })).status).toBe(200);
    expect((await a.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 72, setlist: [song.id] })).status).toBe(200);
    const t = await a.c.post('/api/transfer', { toName: nameB, amount: 250 });
    expect(t.status).toBe(200);
    expect((await me(b.c)).character.money).toBe(750);
    const nb = (await b.c.get('/api/notifications')).body.notifications;
    expect(nb.some((n: any) => n.kind === 'money_received' && n.data.amount === 250)).toBe(true);
  });

  it('yönetici VIP verebilir; mağaza bildirimi VIP süresini uzatır ve aynı olay iki kez işlenmez', async () => {
    const admin = await newPlayer();
    const buyer = await newPlayer();
    await pool.query('UPDATE users SET is_admin = TRUE WHERE id = $1', [admin.userId]);
    const g = await admin.c.post(`/api/admin/users/${buyer.userId}/vip`, { days: 30 });
    expect(g.status).toBe(200);
    expect((await me(buyer.c)).user.isVip).toBe(true);

    const anon = client();
    const { config } = await import('../src/config');
    expect((await anon.post('/api/webhooks/revenuecat', { event: {} })).status).toBe(404); // anahtar tanımlı değil
    config.revenuecatSecret = 'gizli-test';
    const hook = (body: unknown, auth = 'gizli-test') =>
      (async () => {
        const { buildApp } = await import('../src/app');
        void buildApp;
      })().then(() => fetchHook(body, auth));
    const fetchHook = async (body: unknown, auth: string) => {
      const r = await (await import('./helpers')).rawPost('/api/webhooks/revenuecat', body, { authorization: auth });
      return r;
    };
    expect((await hook({ event: { type: 'RENEWAL' } }, 'yanlis')).status).toBe(401);
    const until = Date.now() + 400 * 86400 * 1000;
    const ev = { event: { id: 'evt-1', type: 'RENEWAL', app_user_id: String(buyer.userId), product_id: 'rifftown_vip_12m', expiration_at_ms: until } };
    expect((await hook(ev)).body.vipUntil).toBeTruthy();
    expect((await hook(ev)).body.duplicate).toBe(true);
    expect(new Date((await me(buyer.c)).user.vipUntil).getTime()).toBeGreaterThan(Date.now() + 399 * 86400 * 1000);
    config.revenuecatSecret = '';
  });

  it('mağaza iadesi VIP\'i kapatır; normal iptal süre dolana kadar dokunmaz; iade geri alınırsa açılır', async () => {
    const buyer = await newPlayer();
    const { config } = await import('../src/config');
    const { rawPost } = await import('./helpers');
    config.revenuecatSecret = 'gizli-test';
    const hook = (event: Record<string, unknown>) =>
      rawPost('/api/webhooks/revenuecat', { event: { app_user_id: String(buyer.userId), product_id: 'rifftown_vip_1m', ...event } }, { authorization: 'gizli-test' });
    const until = Date.now() + 30 * 86400 * 1000;
    await hook({ id: 'r-1', type: 'INITIAL_PURCHASE', expiration_at_ms: until });
    expect((await me(buyer.c)).user.isVip).toBe(true);

    // Kullanıcı aboneliği iptal etti: ödediği dönem bitene kadar VIP kalır
    expect((await hook({ id: 'r-2', type: 'CANCELLATION', cancel_reason: 'UNSUBSCRIBE', expiration_at_ms: until })).body.ignored).toBe('CANCELLATION');
    expect((await me(buyer.c)).user.isVip).toBe(true);

    // İade: VIP hemen kapanır, aynı olay ikinci kez işlenmez
    expect((await hook({ id: 'r-3', type: 'CANCELLATION', cancel_reason: 'CUSTOMER_SUPPORT', expiration_at_ms: until })).body.revoked).toBe(true);
    expect((await hook({ id: 'r-3', type: 'CANCELLATION', cancel_reason: 'CUSTOMER_SUPPORT' })).body.duplicate).toBe(true);
    expect((await me(buyer.c)).user.isVip).toBe(false);

    // İade geri alındı
    await hook({ id: 'r-4', type: 'REFUND_REVERSED', expiration_at_ms: until });
    expect((await me(buyer.c)).user.isVip).toBe(true);
    config.revenuecatSecret = '';
  });
});

describe('meslekler', () => {
  it('şartları sağlayan oyuncu mesleğe girer, mesleğinde çalışır ve terfi eder', async () => {
    const { c, character } = await newPlayer();
    expect((await c.post('/api/career/join', { professionId: 'police', locationId: 'istanbul-police' })).body.error).toBe('requirements_not_met');
    await setSkills(character.id, { law: 20 });
    expect((await c.post('/api/career/join', { professionId: 'police', locationId: 'istanbul-hospital' })).body.error).toBe('invalid_location');
    const j = await c.post('/api/career/join', { professionId: 'police', locationId: 'istanbul-police' });
    expect(j.status).toBe(200);
    expect(j.body.character.profession).toMatchObject({ id: 'police', rank: 0 });
    // Mesleğin mekânı dışında meslek mesaisi yapılamaz
    expect((await c.post('/api/actions', { kind: 'work', locationId: 'istanbul-courthouse', hours: 8 })).body.error).toBe('no_profession_here');
    await pool.query('UPDATE characters SET career_hours = 36 WHERE id = $1', [character.id]);
    await c.post('/api/actions', { kind: 'work', locationId: 'istanbul-police', hours: 8 });
    await advance();
    const m = await me(c);
    expect(m.character.money).toBe(500 + 24 * 8);
    expect(m.character.profession.rank).toBe(1);
    const notes = (await c.get('/api/notifications')).body.notifications;
    expect(notes.some((n: any) => n.kind === 'promotion' && n.data.rank === 1)).toBe(true);
  });

  it('VIP meslekleri sadece VIP üyeler seçebilir ve VIP bitince çalışamaz', async () => {
    const { c, character, userId } = await newPlayer();
    await setSkills(character.id, { law: 65 });
    expect((await c.post('/api/career/join', { professionId: 'judge', locationId: 'istanbul-courthouse' })).body.error).toBe('vip_required');
    await setVip(userId);
    expect((await c.post('/api/career/join', { professionId: 'judge', locationId: 'istanbul-courthouse' })).status).toBe(200);
    await pool.query('UPDATE users SET vip_until = now() - interval \'1 day\' WHERE id = $1', [userId]);
    expect((await c.post('/api/actions', { kind: 'work', locationId: 'istanbul-courthouse', hours: 2 })).body.error).toBe('vip_required');
  });

  it('doktor hastanede ücretsiz tedavi olur; kariyer becerileri üniversitede çalışılır', async () => {
    const { c, character } = await newPlayer();
    await setSkills(character.id, { medicine: 35 });
    await c.post('/api/career/join', { professionId: 'doctor', locationId: 'istanbul-hospital' });
    const t = await c.post('/api/actions', { kind: 'treat', locationId: 'istanbul-hospital', hours: 2 });
    expect(t.body.action.params.cost).toBe(0);
    await advance();
    expect((await c.post('/api/actions', { kind: 'study', skill: 'medicine', hours: 2, locationId: 'istanbul-school' })).body.error).toBe('invalid_location');
    const u = await c.post('/api/actions', { kind: 'study', skill: 'medicine', hours: 2, locationId: 'istanbul-university' });
    expect(u.status).toBe(200);
    expect(u.body.action.params.cost).toBe(80);
  });

  it('parkta sokak müziği bahşiş getirir', async () => {
    const { c } = await newPlayer({ instrument: 'guitar' });
    expect((await c.post('/api/actions', { kind: 'busk', role: 'drums', hours: 2, locationId: 'istanbul-park' })).body.error).toBe('skill_not_known');
    await c.post('/api/actions', { kind: 'busk', role: 'guitar', hours: 4, locationId: 'istanbul-park' });
    await advance();
    expect((await me(c)).character.money).toBeGreaterThan(500);
  });
});

describe('seçimler', () => {
  it('VIP oyuncular aday olur ve oy verir; kazanan makama gelir ve maaş alır', async () => {
    const { tick } = await import('../src/worker');
    // Bu testte oyunu yavaşlat: 1 oyun günü = 24 saniye, seçim dönemi 7 oyun günü
    const prev = config.gameSpeed;
    config.gameSpeed = 3600;
    try {
    await pool.query(`UPDATE elections SET status = 'closed' WHERE status = 'open'`);
    await tick(); // yeni açık seçim dönemleri oluşsun
    const cand = await newPlayer({ cityId: 'izmir' });
    const rival = await newPlayer({ cityId: 'izmir' });
    const voter = await newPlayer({ cityId: 'izmir' });
    const normal = await newPlayer({ cityId: 'izmir' });
    const civic = (await cand.c.get('/api/civic/izmir')).body;
    const mayor = civic.elections.find((e: any) => e.office === 'mayor');
    expect(mayor).toBeTruthy();

    expect((await cand.c.post(`/api/elections/${mayor.id}/run`, { platform: 'Daha çok sahne!' })).body.error).toBe('vip_required');
    for (const p of [cand, rival, voter]) await setVip(p.userId);
    expect((await cand.c.post(`/api/elections/${mayor.id}/run`, { platform: 'Daha çok sahne!' })).body.error).toBe('requirements_not_met');
    await setSkills(cand.character.id, { rhetoric: 20 });
    await setSkills(rival.character.id, { rhetoric: 20 });
    expect((await cand.c.post(`/api/elections/${mayor.id}/run`, { platform: 'Daha çok sahne!' })).status).toBe(200);
    expect((await rival.c.post(`/api/elections/${mayor.id}/run`, { platform: 'Daha az gürültü' })).status).toBe(200);

    expect((await normal.c.post(`/api/elections/${mayor.id}/vote`, { candidateId: cand.character.id })).body.error).toBe('vip_required');
    expect((await voter.c.post(`/api/elections/${mayor.id}/vote`, { candidateId: cand.character.id })).status).toBe(200);
    expect((await voter.c.post(`/api/elections/${mayor.id}/vote`, { candidateId: rival.character.id })).body.error).toBe('already_voted');
    // Ara sonuçları sadece VIP görür
    const seenNormal = (await normal.c.get('/api/civic/izmir')).body.elections.find((e: any) => e.id === mayor.id);
    expect(seenNormal.candidates[0].votes).toBeNull();
    const seenVip = (await voter.c.get('/api/civic/izmir')).body.elections.find((e: any) => e.id === mayor.id);
    expect(seenVip.candidates.find((k: any) => k.characterId === cand.character.id).votes).toBe(1);

    await pool.query(`UPDATE elections SET ends_at = now() - interval '1 second' WHERE id = $1`, [mayor.id]);
    await tick();
    const after = (await cand.c.get('/api/civic/izmir')).body;
    expect(after.holders.find((h: any) => h.office === 'mayor').characterId).toBe(cand.character.id);
    expect(after.elections.find((e: any) => e.office === 'mayor').id).not.toBe(mayor.id); // yeni dönem açıldı
    expect((await me(cand.c)).character.offices).toEqual([{ cityId: 'izmir', office: 'mayor' }]);
    const notes = (await cand.c.get('/api/notifications')).body.notifications;
    expect(notes.some((n: any) => n.kind === 'election_won')).toBe(true);

    // Duyuru sadece başkana açık
    expect((await rival.c.post('/api/offices/announcement', { cityId: 'izmir', text: 'Merhaba' })).body.error).toBe('not_mayor');
    expect((await cand.c.post('/api/offices/announcement', { cityId: 'izmir', text: 'Cuma akşamı Kordon\'da ücretsiz konser!' })).status).toBe(200);
    expect((await normal.c.get('/api/civic/izmir')).body.holders.find((h: any) => h.office === 'mayor').announcement).toContain('Kordon');

    // Maaş: bir oyun günü geçince ödenir
    await pool.query(`UPDATE office_holders SET last_paid_at = now() - interval '30 seconds' WHERE character_id = $1`, [cand.character.id]);
    await tick();
    expect((await me(cand.c)).character.money).toBe(500 + 600);
    } finally {
      config.gameSpeed = prev;
    }
  });
});

describe('yönetim', () => {
  it('yönetici olmayan giremez; yönetici istatistik görür ve banlar', async () => {
    const admin = await newPlayer();
    const target = await newPlayer();
    expect((await admin.c.get('/api/admin/stats')).status).toBe(403);
    await pool.query('UPDATE users SET is_admin = TRUE WHERE id = $1', [admin.userId]);
    const stats = await admin.c.get('/api/admin/stats');
    expect(stats.status).toBe(200);
    expect(stats.body.stats.users).toBeGreaterThan(1);

    expect((await admin.c.post(`/api/admin/users/${target.userId}/ban`, { banned: true })).status).toBe(200);
    expect((await target.c.get('/api/me')).status).toBe(401); // oturumları kapatıldı
    const money = await admin.c.post(`/api/admin/characters/${target.character.id}/money`, { delta: 250 });
    expect(money.body.money).toBe(750);
  });
});
