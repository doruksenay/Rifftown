// Kayıt ve listeler, suç ve adalet, başarımlar
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { tick } from '../src/worker';
import { advance, me, newPlayer, raw, setMoney, setSkills, setVip, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);

/** Oyunu yavaşlatır (1 oyun saati = 1 sn): dava ve ceza süreleri test sırasında kendiliğinden dolmasın */
async function slow<T>(fn: () => Promise<T>): Promise<T> {
  const prev = config.gameSpeed;
  config.gameSpeed = 3600;
  try {
    return await fn();
  } finally {
    config.gameSpeed = prev;
  }
}

/** Süren eylemi hemen bitirir ve zamanlayıcıyı çalıştırır */
async function finishNow(characterId: number, patch: Record<string, unknown> = {}) {
  await q(`UPDATE actions SET ends_at = now(), params = params || $2::jsonb WHERE character_id = $1 AND status = 'active'`, [
    characterId,
    JSON.stringify(patch),
  ]);
  await tick();
}

/** Bir sonraki liste haftasını hemen kapatır */
async function closeChartWeek() {
  // Açık hafta kendiliğinden kapanmasın; yoksa açılsın
  await q(`UPDATE chart_weeks SET ends_at = now() + interval '1 hour' WHERE status = 'open'`);
  await tick();
  await q(`UPDATE chart_weeks SET ends_at = now() - interval '1 second' WHERE status = 'open'`);
  await q(`UPDATE releases SET released_at = now() - interval '2 seconds'`);
  await tick();
}

async function bandWithSongs(n: number, opts: { cityId?: string } = {}) {
  const p = await newPlayer({ instrument: 'vocals', cityId: opts.cityId });
  await setVip(p.userId); // kesin sayılar
  for (let i = 0; i < n; i++) {
    await p.c.post('/api/actions', { kind: 'write_song', title: `Şarkı ${i + 1}`, genre: 'pop' });
    await advance(10);
  }
  const band = (await p.c.post('/api/bands', { name: `Grup ${p.character.id}`, genre: 'pop', role: 'vocals' })).body.band;
  return { ...p, band, songIds: band.songs.map((s: any) => s.id) as number[] };
}

describe('kayıt, yayınlar ve listeler', () => {
  it('şarkı kaydedilir, single yayınlanır, hafta sonunda satış, liste ve şöhret gelir', async () => {
    const p = await bandWithSongs(2);
    const city = p.character.cityId;
    await setMoney(p.character.id, 5000);

    // Kaydedilmemiş şarkı yayınlanamaz
    expect((await p.c.post('/api/releases', { kind: 'single', title: 'Erken', songIds: [p.songIds[0]] })).body.error).toBe('song_not_recorded');
    // Kayıt yalnızca kayıt stüdyosunda
    expect((await p.c.post('/api/actions', { kind: 'record', songId: p.songIds[0], locationId: `${city}-studio` })).body.error).toBe('invalid_location');
    const rec = await p.c.post('/api/actions', { kind: 'record', songId: p.songIds[0], locationId: `${city}-recording_studio` });
    expect(rec.status).toBe(200);
    expect((await me(p.c)).character.money).toBeLessThan(5000);
    await advance(10);

    const songs = (await p.c.get('/api/bands/mine')).body.band.songs;
    const recorded = songs.find((s: any) => s.id === p.songIds[0]);
    expect(recorded.recordingQuality).toBeGreaterThan(0);
    expect(songs.find((s: any) => s.id === p.songIds[1]).recordingQuality).toBeNull();

    // Albüm için en az 6 şarkı gerekir
    expect((await p.c.post('/api/releases', { kind: 'album', title: 'Kısa', songIds: [p.songIds[0]] })).body.error).toBe('invalid_tracklist');
    const rel = await p.c.post('/api/releases', { kind: 'single', title: 'İlk Single', songIds: [p.songIds[0]] });
    expect(rel.status).toBe(200);
    expect(rel.body.release).toMatchObject({ kind: 'single', title: 'İlk Single', quality: recorded.recordingQuality });
    // Aynı türde yeni yayın için beklemek gerekir
    expect((await p.c.post('/api/releases', { kind: 'single', title: 'İkinci', songIds: [p.songIds[0]] })).body.error).toBe('release_cooldown');
    const detail = (await p.c.get('/api/bands/mine')).body.band;
    expect(detail.releases).toHaveLength(1);
    expect(detail.nextReleaseAt.single).not.toBeNull();

    // Grup bu şehirde tanınıyor: satış olsun
    await q('INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, $2, 60)', [p.band.id, city]);
    const moneyBefore = (await raw(p.character.id)).money;
    await closeChartWeek();

    const after = (await p.c.get('/api/bands/mine')).body.band.releases[0];
    expect(after.weeksOnSale).toBe(1);
    expect(after.totalUnits).toBeGreaterThan(0);
    expect(after.totalRevenue).toBeGreaterThan(0);
    expect((await raw(p.character.id)).money).toBe(moneyBefore + after.totalRevenue); // tek üye, payın tamamı

    const chart = (await p.c.get(`/api/charts?scope=${city}&kind=single`)).body;
    expect(chart.entries[0]).toMatchObject({ releaseId: after.id, position: 1, lastPosition: null });
    const world = (await p.c.get('/api/charts?scope=world&kind=single')).body;
    expect(world.entries.some((e: any) => e.releaseId === after.id)).toBe(true);
    expect(chart.nextWeekEndsAt).not.toBeNull();

    const fame = await q('SELECT fame FROM band_fame WHERE band_id = $1 AND city_id = $2', [p.band.id, city]);
    expect(fame.rows[0].fame).toBeGreaterThan(60); // liste birinciliği şöhret getirir

    const notes = (await p.c.get('/api/notifications')).body.notifications;
    expect(notes.some((n: any) => n.kind === 'sales_report' && n.data.position === 1)).toBe(true);
    const ach = (await p.c.get('/api/achievements')).body.unlocked.map((a: any) => a.id);
    expect(ach).toEqual(expect.arrayContaining(['first_recording', 'first_single', 'chart_top10', 'chart_no1']));
  });

  it('albüm 6 kayıtlı şarkıyla çıkar; geçmiş liste haftaları VIP avantajı', async () => {
    const p = await bandWithSongs(6);
    const city = p.character.cityId;
    await setMoney(p.character.id, 5000);
    for (const id of p.songIds) {
      expect((await p.c.post('/api/actions', { kind: 'record', songId: id, locationId: `${city}-recording_studio` })).status).toBe(200);
      await advance(10);
    }
    const rel = await p.c.post('/api/releases', { kind: 'album', title: 'Uzun Çalar', songIds: p.songIds });
    expect(rel.status).toBe(200);
    expect(rel.body.release.songs).toHaveLength(6);
    await q('INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, $2, 40)', [p.band.id, city]);
    await closeChartWeek();
    await closeChartWeek();
    const latest = (await p.c.get(`/api/charts?scope=${city}&kind=album`)).body;
    expect(latest.entries[0].lastPosition).toBe(1); // ikinci haftada da listede
    expect(latest.weeks.length).toBeGreaterThanOrEqual(2);

    // Normal üye yalnızca son haftayı görür
    const n = await newPlayer();
    const plain = (await n.c.get(`/api/charts?scope=${city}&kind=album`)).body;
    expect(plain.weeks).toHaveLength(1);
    expect((await n.c.get(`/api/charts?scope=${city}&kind=album&week=${latest.weeks[1].id}`)).body.error).toBe('vip_required');
    expect((await p.c.get(`/api/charts?scope=${city}&kind=album&week=${latest.weeks[1].id}`)).status).toBe(200);
  });
});

describe('suç ve adalet', () => {
  it('başarılı suç ganimet getirir ve faili meçhul kalır; polis soruşturup faili bulur', () => slow(async () => {
    const thief = await newPlayer({ cityId: 'ankara' });
    const cop = await newPlayer({ cityId: 'ankara' });
    // Yanlış mekânda suç işlenemez; ofis soygunu maymuncuk becerisi ister
    expect((await thief.c.post('/api/actions', { kind: 'crime', crime: 'pickpocket', locationId: 'ankara-hospital' })).body.error).toBe('invalid_location');
    expect((await thief.c.post('/api/actions', { kind: 'crime', crime: 'burglary', locationId: 'ankara-plaza' })).body.error).toBe('skill_too_low');

    const opts = (await thief.c.get('/api/crime/options?locationId=ankara-park')).body;
    expect(opts.options.map((o: any) => o.id)).toEqual(['pickpocket']);
    expect(opts.options[0].chance).toBeGreaterThan(0);

    const before = (await raw(thief.character.id)).money;
    const a = await thief.c.post('/api/actions', { kind: 'crime', crime: 'pickpocket', locationId: 'ankara-park' });
    expect(a.status).toBe(200);
    await finishNow(thief.character.id, { chance: 1 });
    const r = await raw(thief.character.id);
    expect(r.money).toBeGreaterThan(before);
    expect(r.skills.street_smarts).toBeGreaterThan(0);
    expect((await q(`SELECT status FROM crimes WHERE character_id = $1`, [thief.character.id])).rows[0].status).toBe('unsolved');
    expect((await thief.c.get('/api/achievements')).body.unlocked.map((x: any) => x.id)).toContain('first_crime');

    // Polis olmayan soruşturamaz
    expect((await cop.c.post('/api/actions', { kind: 'investigate', locationId: 'ankara-police' })).body.error).toBe('not_police');
    await q(`UPDATE characters SET profession = 'police', skills = skills || '{"law": 90, "investigation": 90}' WHERE id = $1`, [cop.character.id]);
    expect((await cop.c.get('/api/justice/ankara')).body.unsolvedCount).toBe(1);

    let solved = false;
    for (let i = 0; i < 15 && !solved; i++) {
      const inv = await cop.c.post('/api/actions', { kind: 'investigate', locationId: 'ankara-police' });
      expect(inv.status).toBe(200);
      await finishNow(cop.character.id);
      const last = (await cop.c.get('/api/actions/history')).body.actions[0];
      solved = !!last.result.solved;
    }
    expect(solved).toBe(true);
    const kase = (await q('SELECT arrested_by, status FROM cases WHERE suspect_id = $1', [thief.character.id])).rows[0];
    expect(kase).toMatchObject({ arrested_by: cop.character.id, status: 'pending' });
    expect((await thief.c.get('/api/notifications')).body.notifications.some((n: any) => n.kind === 'arrested')).toBe(true);
    const meThief = (await me(thief.c)).character;
    expect(meThief.jailedUntil).not.toBeNull();
    expect(meThief.inCustody).toBe(true);
    expect(meThief.locationId).toBe('ankara-prison');
    const justice = (await cop.c.get('/api/justice/ankara')).body;
    expect(justice.pendingCases[0]).toMatchObject({ suspectId: thief.character.id, crime: 'pickpocket' });
    expect(justice.inmates.map((x: any) => x.characterId)).toContain(thief.character.id);
    expect((await cop.c.get('/api/achievements')).body.unlocked.map((x: any) => x.id)).toContain('detective');
  }));

  it('yakalanan şüpheli cezaevinde sadece dinlenir; yargıç karar verir; kefaletle çıkılır', () => slow(async () => {
    const thief = await newPlayer({ cityId: 'izmir' });
    const judge = await newPlayer({ cityId: 'izmir' });
    await setMoney(thief.character.id, 1000);
    const a = await thief.c.post('/api/actions', { kind: 'crime', crime: 'shoplift', locationId: 'izmir-music_store' });
    expect(a.status).toBe(200);
    await finishNow(thief.character.id, { chance: 0 });

    const m = await me(thief.c);
    expect(m.character.inCustody).toBe(true);
    expect(m.bailCost).toBeNull(); // tutukluyken kefalet yok
    const notes = (await thief.c.get('/api/notifications')).body.notifications;
    expect(notes.some((n: any) => n.kind === 'arrested' && n.data.caught)).toBe(true);
    expect((await thief.c.post('/api/actions', { kind: 'work', locationId: 'izmir-work', hours: 2 })).body.error).toBe('in_jail');
    expect((await thief.c.post('/api/move', { locationId: 'izmir-bar' })).body.error).toBe('in_jail');
    expect((await thief.c.post('/api/actions', { kind: 'travel', toCityId: 'ankara', mode: 'bus' })).body.error).toBe('in_jail');
    expect((await thief.c.post('/api/actions', { kind: 'rest', hours: 1 })).status).toBe(200);
    await finishNow(thief.character.id);

    const kase = (await judge.c.get('/api/justice/izmir')).body.pendingCases[0];
    expect((await judge.c.post(`/api/cases/${kase.id}/rule`, { verdict: 'guilty', severity: 'harsh' })).body.error).toBe('not_judge');
    await q(`UPDATE characters SET profession = 'judge' WHERE id = $1`, [judge.character.id]);
    expect((await judge.c.post(`/api/cases/${kase.id}/rule`, { verdict: 'guilty', severity: 'harsh' })).body.error).toBe('vip_required');
    await setVip(judge.userId);
    const ruled = await judge.c.post(`/api/cases/${kase.id}/rule`, { verdict: 'guilty', severity: 'harsh' });
    expect(ruled.status).toBe(200);
    expect(ruled.body.bonus).toBeGreaterThan(0);
    expect((await judge.c.post(`/api/cases/${kase.id}/rule`, { verdict: 'innocent' })).body.error).toBe('case_closed');

    const recent = (await judge.c.get('/api/justice/izmir')).body.recentCases[0];
    expect(recent).toMatchObject({ status: 'convicted', sentenceHours: 18 }); // 12 saat × 1,5
    expect((await me(thief.c)).character.convictions).toBe(1);

    // Hüküm giyen mahkûm kefalet ödeyebilir
    const m2 = await me(thief.c);
    expect(m2.character.inCustody).toBe(false);
    expect(m2.bailCost).toBeGreaterThan(0);
    await setMoney(thief.character.id, m2.bailCost + 10);
    const bail = await thief.c.post('/api/jail/bail');
    expect(bail.status).toBe(200);
    const free = (await me(thief.c)).character;
    expect(free.jailedUntil).toBeNull();
    expect(free.locationId).toBeNull();
    expect(bail.body.cost).toBeLessThanOrEqual(m2.bailCost);
    expect((await raw(thief.character.id)).money).toBe(m2.bailCost + 10 - bail.body.cost);
    const ach = (await thief.c.get('/api/achievements')).body.unlocked.map((x: any) => x.id);
    expect(ach).toContain('caught');
    expect((await judge.c.get('/api/achievements')).body.unlocked.map((x: any) => x.id)).toContain('justice');
  }));

  it('yargıç bakmazsa mahkeme normal cezayı verir; ceza bitince tahliye olunur; cezaevindeki üye konsere çıkamaz', async () => {
    const p = await bandWithSongs(1, { cityId: 'izmir' });
    await slow(async () => {
      await p.c.post('/api/actions', { kind: 'crime', crime: 'pickpocket', locationId: 'izmir-park' });
      await finishNow(p.character.id, { chance: 0 }); // yakalandı
    });
    expect((await p.c.post('/api/gigs', { locationId: 'izmir-bar', inHours: 2, setlist: p.songIds, sessionRoles: ['guitar'] })).body.error).toBe('in_jail');

    // Dava süresi dolar → kendiliğinden mahkûmiyet (6 saat)
    await q(`UPDATE cases SET due_at = now() - interval '1 second' WHERE suspect_id = $1`, [p.character.id]);
    await tick();
    const kase = (await q(`SELECT status, sentence_hours, judge_id FROM cases WHERE suspect_id = $1`, [p.character.id])).rows[0];
    expect(kase).toMatchObject({ status: 'convicted', sentence_hours: 6, judge_id: null });

    // Cezaevindeyken grubun konseri: üye sahneye çıkamaz
    await q(`UPDATE characters SET jailed_until = now() + interval '1 hour' WHERE id = $1`, [p.character.id]);
    const gig = await q(
      `INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist, session_roles) VALUES ($1, 'izmir', 'izmir-bar', now(), $2, '{guitar}') RETURNING id`,
      [p.band.id, p.songIds],
    );
    await tick();
    const g = (await p.c.get(`/api/gigs/${gig.rows[0].id}`)).body.gig;
    expect(g.result.presentCount).toBe(1); // yalnızca kiralık müzisyen
    const n = (await p.c.get('/api/notifications')).body.notifications.find((x: any) => x.kind === 'gig_done');
    expect(n.data).toMatchObject({ present: false, jailed: true });

    // Ceza biter → tahliye
    await q(`UPDATE characters SET jailed_until = now() - interval '1 second' WHERE id = $1`, [p.character.id]);
    await tick();
    const free = (await me(p.c)).character;
    expect(free.jailedUntil).toBeNull();
    expect(free.locationId).toBeNull();
    expect((await p.c.get('/api/notifications')).body.notifications.some((x: any) => x.kind === 'released')).toBe(true);
  });

  it('dava tarihi geçse de karar çıkana kadar tutukluluk sürer; beraatte dosya yeniden açılmaz; tutuklu para gönderemez', () => slow(async () => {
    const thief = await newPlayer({ cityId: 'paris' });
    const judge = await newPlayer({ cityId: 'paris' });
    await thief.c.post('/api/actions', { kind: 'crime', crime: 'pickpocket', locationId: 'paris-park' });
    await finishNow(thief.character.id, { chance: 0 });
    await setVip(thief.userId);
    expect((await thief.c.post('/api/transfer', { toName: judge.character.name, amount: 10 })).body.error).toBe('in_jail');

    // Dava tarihi geçti ama zamanlayıcı henüz çalışmadı: şüpheli hâlâ tutuklu
    await q(`UPDATE cases SET due_at = now() - interval '1 second' WHERE suspect_id = $1`, [thief.character.id]);
    expect((await me(thief.c)).character.jailedUntil).not.toBeNull();
    expect((await thief.c.post('/api/actions', { kind: 'travel', toCityId: 'lyon', mode: 'bus' })).body.error).toBe('in_jail');

    await q(`UPDATE cases SET due_at = now() + interval '1 hour' WHERE suspect_id = $1`, [thief.character.id]);
    await q(`UPDATE characters SET profession = 'judge' WHERE id = $1`, [judge.character.id]);
    await setVip(judge.userId);
    const kase = (await judge.c.get('/api/justice/paris')).body.pendingCases[0];
    expect((await judge.c.post(`/api/cases/${kase.id}/rule`, { verdict: 'innocent' })).status).toBe(200);
    expect((await me(thief.c)).character.jailedUntil).toBeNull();
    expect((await q('SELECT status FROM crimes WHERE character_id = $1', [thief.character.id])).rows[0].status).toBe('caught');
    expect((await judge.c.get('/api/justice/paris')).body.unsolvedCount).toBe(0);
  }));

  it('görevdeki polis suç şansını düşürür; şans VIP olmayana kaba gösterilir', async () => {
    const thief = await newPlayer({ cityId: 'berlin' });
    await setSkills(thief.character.id, { stealth: 37, street_smarts: 41 });
    const cop = await newPlayer({ cityId: 'berlin' });
    const vipChance = async () => {
      await setVip(thief.userId);
      const r = (await thief.c.get('/api/crime/options?locationId=berlin-park')).body;
      await q(`UPDATE users SET vip_until = NULL WHERE id = $1`, [thief.userId]);
      return r;
    };
    const before = await vipChance();
    expect(before.policeOnDuty).toBe(0);
    const plain = (await thief.c.get('/api/crime/options?locationId=berlin-park')).body.options[0].chance;
    expect(plain).toBe(Math.round(before.options[0].chance * 10) / 10);
    expect(plain).not.toBe(before.options[0].chance);

    await q(`UPDATE characters SET profession = 'police' WHERE id = $1`, [cop.character.id]);
    await cop.c.post('/api/actions', { kind: 'work', locationId: 'berlin-police', hours: 2 });
    const after = await vipChance();
    expect(after.policeOnDuty).toBe(1);
    expect(after.options[0].chance).toBeLessThan(before.options[0].chance);
  });
});

describe('başarımlar', () => {
  it('istatistiklerden açılır, bir kez bildirilir ve profilde puan olarak görünür', async () => {
    const p = await newPlayer();
    expect((await p.c.get('/api/achievements')).body).toMatchObject({ points: 0, unlocked: [] });
    await p.c.post('/api/actions', { kind: 'write_song', title: 'Başlangıç', genre: 'rock' });
    await advance(10);
    await p.c.post('/api/actions', { kind: 'work', locationId: 'istanbul-work', hours: 2 });
    await advance(10);
    const res = (await p.c.get('/api/achievements')).body;
    expect(res.unlocked.map((a: any) => a.id).sort()).toEqual(['first_job', 'first_song']);
    expect(res.points).toBe(10);
    expect((await me(p.c)).character.achievementPoints).toBe(10);

    // VIP gibi eylem dışı olaylar /me çağrısında yakalanır
    await setVip(p.userId);
    await p.c.get('/api/achievements');
    const notes = (await p.c.get('/api/notifications')).body.notifications.filter((n: any) => n.kind === 'achievement');
    expect(notes.map((n: any) => n.data.id).sort()).toEqual(['first_job', 'first_song', 'vip']);

    const other = await newPlayer();
    const pub = (await other.c.get(`/api/characters/${p.character.id}`)).body.character;
    expect(pub.achievementPoints).toBe(20);
    expect(pub.achievements).toHaveLength(3);
    expect(pub.jailed).toBe(false);
  });
});
