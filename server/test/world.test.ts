// Oyunun kendi grupları, ev ve kira, rehber görevler, profil
import { NPC_BANDS, NPC_TIERS, TUTORIAL } from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pool } from '../src/db';
import { processDueGigs } from '../src/game/gigs';
import { ensureNpcWorld, runNpcDirectorNow } from '../src/game/npc';
import { tick } from '../src/worker';
import { advance, inject, me, newPlayer, raw, setMoney, setVip, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);

describe('oyunun kendi grupları', () => {
  it('her şehirde gruplar kurulur, konser verir, yayın çıkarır; oyuncu listelerinde görünmez', async () => {
    const p = await newPlayer({ cityId: 'istanbul' });
    expect(await ensureNpcWorld()).toBe(NPC_BANDS.length);
    expect(await ensureNpcWorld()).toBe(0); // ikinci kez kurulmaz
    const bands = await q('SELECT count(*)::int AS n FROM bands WHERE npc_key IS NOT NULL');
    expect(bands.rows[0].n).toBe(NPC_BANDS.length);

    // Şehirde oyuncu sayısına ve kişiler listesine girmezler; para gönderilemez, davet edilemez
    const city = (await p.c.get('/api/cities/istanbul')).body;
    expect(city.playersHere).toBe(1);
    const people = (await p.c.get('/api/cities/istanbul/people')).body;
    expect(people.people.every((x: any) => x.id === p.character.id)).toBe(true);
    await setVip(p.userId);
    expect((await p.c.post('/api/transfer', { toName: 'Selin Ateş', amount: 10 })).body.error).toBe('character_not_found');

    // Liderlik tablosunda ve profilde işaretli
    const lb = (await p.c.get('/api/leaderboard?cityId=istanbul')).body.bands;
    const star = lb.find((b: any) => b.name === 'Mavi Vapur');
    expect(star.npc).toBe(true);
    expect(star.fame).toBe(NPC_TIERS.star.fame);
    const band = (await p.c.get(`/api/bands/${star.id}`)).body.band;
    expect(band.npc).toBe(true);
    const leader = (await p.c.get(`/api/characters/${band.members[0].characterId}`)).body.character;
    expect(leader).toMatchObject({ npc: true, name: 'Selin Ateş', isVip: false });

    // Yönetmen: konser ayarlar ve ilk single'ı çıkarır (testte zaman çok hızlı akar)
    await advance(30);
    expect(await runNpcDirectorNow()).toBeGreaterThan(0);
    const gigs = await q(`SELECT count(*)::int AS n FROM gigs g JOIN bands b ON b.id = g.band_id WHERE b.npc_key IS NOT NULL`);
    expect(gigs.rows[0].n).toBe(NPC_BANDS.length);
    const singles = await q(`SELECT count(*)::int AS n FROM releases r JOIN bands b ON b.id = r.band_id WHERE b.npc_key IS NOT NULL AND r.kind = 'single'`);
    expect(singles.rows[0].n).toBe(NPC_BANDS.length);

    // Konserler oyuncu konserleriyle aynı kurallarla sonuçlanır
    await q(`UPDATE gigs SET starts_at = now() - interval '1 second' WHERE status = 'scheduled'`);
    // Zamanlayıcı bir turda en fazla 50 konser sonuçlandırır; kalanlar sonraki turda (burada hepsi birden)
    await tick();
    await processDueGigs(500);
    const done = await q(`SELECT result FROM gigs WHERE status = 'done' AND festival_id IS NULL`);
    expect(done.rows.length).toBe(NPC_BANDS.length);
    expect(done.rows.every((r) => r.result.attendance > 0)).toBe(true);

    // Şöhret kendi bandında kalır
    await q(`UPDATE band_fame SET fame = 99 WHERE band_id = $1 AND city_id = 'istanbul'`, [star.id]);
    await runNpcDirectorNow();
    const f = await q(`SELECT fame FROM band_fame WHERE band_id = $1 AND city_id = 'istanbul'`, [star.id]);
    expect(f.rows[0].fame).toBe(NPC_TIERS.star.fameRange[1]);
    // Bildirimleri birikmez
    const n = await q(`SELECT count(*)::int AS n FROM notifications n JOIN characters c ON c.id = n.character_id WHERE c.npc`);
    expect(n.rows[0].n).toBe(0);
  });

  it('yapay grupların yayınları oyuncularla aynı listelerde yarışır', async () => {
    {
      await q(`UPDATE releases SET released_at = now() - interval '5 seconds'`);
      await q(`UPDATE chart_weeks SET ends_at = now() - interval '1 second' WHERE status = 'open'`);
      await tick();
      await q(`UPDATE chart_weeks SET ends_at = now() - interval '1 second' WHERE status = 'open'`);
      await tick();
      const p = await newPlayer();
      const chart = (await p.c.get('/api/charts?scope=istanbul&kind=single')).body;
      expect(chart.entries.length).toBeGreaterThanOrEqual(3);
      expect(chart.entries[0].bandName).toBe('Mavi Vapur'); // en ünlü grup başta
    }
  });
});

describe('ev ve kira', () => {
  it('emlakçıdan ev tutulur, evde dinlenmek daha iyi gelir, kira ödenir, ödenemezse tahliye', async () => {
    const p = await newPlayer({ cityId: 'izmir' });
    const loc = 'izmir-real_estate';
    expect((await p.c.post('/api/homes/rent', { homeId: 'penthouse', locationId: loc })).body.error).toBe('vip_required');
    expect((await p.c.post('/api/homes/rent', { homeId: 'flat', locationId: 'ankara-real_estate' })).body.error).toBe('not_in_city');
    const before = (await raw(p.character.id)).money;
    const r = await p.c.post('/api/homes/rent', { homeId: 'room', locationId: loc });
    expect(r.status).toBe(200);
    expect(r.body.rent).toBe(57); // 60 × 0,95
    expect((await raw(p.character.id)).money).toBe(before - 57);
    expect((await me(p.c)).character.home).toMatchObject({ homeId: 'room', cityId: 'izmir', rent: 57 });

    // Evde dinlenmek kanepeden daha çok ruh hâli ve sağlık getirir
    const other = await newPlayer({ cityId: 'izmir' });
    for (const x of [p, other]) await q('UPDATE characters SET mood = 30, health = 50 WHERE id = $1', [x.character.id]);
    await p.c.post('/api/actions', { kind: 'rest', hours: 2 });
    await other.c.post('/api/actions', { kind: 'rest', hours: 2 });
    await advance(20);
    const [a, b] = [await raw(p.character.id), await raw(other.character.id)];
    expect(a.mood).toBeGreaterThan(b.mood);
    expect(a.health).toBeGreaterThan(b.health);

    // Kira vadesi: para yetiyorsa kesilir, yetmiyorsa evden çıkarılır
    await setMoney(p.character.id, 100);
    await q('UPDATE homes SET paid_until = now() - interval \'1 second\' WHERE character_id = $1', [p.character.id]);
    await tick();
    expect((await raw(p.character.id)).money).toBe(43);
    expect((await me(p.c)).character.home).not.toBeNull();
    await setMoney(p.character.id, 10);
    await q('UPDATE homes SET paid_until = now() - interval \'1 second\' WHERE character_id = $1', [p.character.id]);
    await tick();
    expect((await me(p.c)).character.home).toBeNull();
    expect((await raw(p.character.id)).money).toBe(10);
    const notes = (await p.c.get('/api/notifications')).body.notifications.map((x: any) => x.kind);
    expect(notes).toEqual(expect.arrayContaining(['rent_paid', 'evicted']));

    // VIP'e özel ev, VIP bitince yenilenmez
    await setVip(p.userId);
    await setMoney(p.character.id, 5000);
    expect((await p.c.post('/api/homes/rent', { homeId: 'penthouse', locationId: loc })).status).toBe(200);
    await q('UPDATE users SET vip_until = NULL WHERE id = $1', [p.userId]);
    await q('UPDATE homes SET paid_until = now() - interval \'1 second\' WHERE character_id = $1', [p.character.id]);
    const moneyNow = (await raw(p.character.id)).money;
    await tick();
    expect((await me(p.c)).character.home).toBeNull();
    expect((await raw(p.character.id)).money).toBe(moneyNow);
  });
});

describe('rehber görevler', () => {
  it('adımlar oyuncunun yaptıklarından anlaşılır, ödül bir kez alınır', async () => {
    const p = await newPlayer({ cityId: 'lyon' });
    let t = (await p.c.get('/api/tutorial')).body;
    expect(t.steps).toHaveLength(TUTORIAL.length);
    expect(t.current).toBe('write_song');
    expect((await p.c.post('/api/tutorial/write_song/claim')).body.error).toBe('step_not_done');

    await p.c.post('/api/actions', { kind: 'write_song', title: 'İlk', genre: 'pop' });
    await advance(10);
    const before = (await raw(p.character.id)).money;
    const claim = await p.c.post('/api/tutorial/write_song/claim');
    expect(claim.status).toBe(200);
    expect(claim.body.reward).toBe(25);
    expect((await raw(p.character.id)).money).toBe(before + 25);
    expect(claim.body.state.current).toBe('work_shift');
    expect((await p.c.post('/api/tutorial/write_song/claim')).body.error).toBe('already_claimed');
    expect((await p.c.post('/api/tutorial/nope/claim')).status).toBe(404);

    // Sırası gelmemiş ama yapılmış bir adımın ödülü de alınabilir
    await p.c.post('/api/homes/rent', { homeId: 'room', locationId: 'lyon-real_estate' });
    t = (await p.c.get('/api/tutorial')).body;
    expect(t.steps.find((s: any) => s.id === 'home').done).toBe(true);
    expect((await p.c.post('/api/tutorial/home/claim')).status).toBe(200);
  });
});

describe('profil', () => {
  // 1×1 PNG
  const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  it('başlık, açıklama ve fotoğraf; fotoğraf herkese açık adresten sunulur, yönetici kaldırabilir', async () => {
    const p = await newPlayer();
    const upd = await p.c.patch('/api/character', { headline: '  Gece kuşu davulcu\n', bio: 'Kadıköy\n\n\n\nbarlarında büyüdüm.' });
    expect(upd.body.character).toMatchObject({ headline: 'Gece kuşu davulcu', bio: 'Kadıköy\n\nbarlarında büyüdüm.' });
    expect((await p.c.patch('/api/character', { headline: 'x'.repeat(81) })).body.error).toBe('invalid_input');

    // Resim olmayan dosya reddedilir (imza kontrolü)
    expect((await p.c.post('/api/character/avatar', { data: Buffer.from('<svg onload=alert(1)></svg>').toString('base64') })).body.error).toBe('invalid_image');
    expect((await p.c.post('/api/character/avatar', { data: Buffer.alloc(320 * 1024, 0xff).toString('base64') })).body.error).toBe('invalid_input');
    const up = await p.c.post('/api/character/avatar', { data: `data:image/png;base64,${PNG}` });
    expect(up.status).toBe(200);
    expect(up.body.avatarUrl).toBe(`/avatars/${p.character.id}?v=1`);
    expect((await me(p.c)).character.avatarUrl).toBe(up.body.avatarUrl);

    const res = await inject('GET', `/api${up.body.avatarUrl}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('image/png');
    expect(res.headers['cache-control']).toContain('max-age');
    expect(res.rawPayload.equals(Buffer.from(PNG, 'base64'))).toBe(true);

    const other = await newPlayer();
    const pub = (await other.c.get(`/api/characters/${p.character.id}`)).body.character;
    expect(pub).toMatchObject({ headline: 'Gece kuşu davulcu', avatarUrl: up.body.avatarUrl, npc: false });

    // Yönetici fotoğrafı ve yazıları kaldırır
    expect((await other.c.get('/api/admin/profiles')).status).toBe(403);
    await q('UPDATE users SET is_admin = TRUE WHERE id = $1', [other.userId]);
    const list = (await other.c.get('/api/admin/profiles')).body.profiles;
    expect(list.some((x: any) => x.id === p.character.id)).toBe(true);
    const del = await inject('DELETE', `/api/admin/characters/${p.character.id}/profile`, { token: other.c.token, payload: { avatar: true, text: true } });
    expect(del.statusCode).toBe(200);
    expect((await inject('GET', `/api${up.body.avatarUrl}`)).statusCode).toBe(404);
    // Yeni yükleme eski adresi tekrar kullanmaz; eski sürüm sunulmaz
    const up2 = await p.c.post('/api/character/avatar', { data: PNG });
    expect(up2.body.avatarUrl).toBe(`/avatars/${p.character.id}?v=2`);
    expect((await inject('GET', `/api${up.body.avatarUrl}`)).statusCode).toBe(404);
    expect((await inject('GET', `/api${up2.body.avatarUrl}`)).statusCode).toBe(200);
    await p.c.del('/api/character/avatar');
    expect((await inject('GET', `/api${up2.body.avatarUrl}`)).statusCode).toBe(404);
    // Görünmez yön karakterleri temizlenir
    expect((await p.c.patch('/api/character', { headline: 'Ada\u202eYıldız\u200b' })).body.character.headline).toBe('AdaYıldız');
    const after = (await me(p.c)).character;
    expect(after).toMatchObject({ avatarUrl: null, headline: 'AdaYıldız', bio: '' });
  });
});
