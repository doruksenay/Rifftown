// Turne ekibi, yıpranma, arıza, turne; klip, radyo; plak şirketi ve prodüktör
import { LABEL_POOL, breakdownChance, crewFees, labelSplit, radioPlays, videoQuality, wornBonus } from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { processLabels } from '../src/game/labels';
import { processTours } from '../src/game/touring';
import { tick } from '../src/worker';
import { advance, me, newPlayer, raw, setMoney, setSkills, setVip, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);

async function slow<T>(fn: () => Promise<T>): Promise<T> {
  const prev = config.gameSpeed;
  config.gameSpeed = 3600;
  try {
    return await fn();
  } finally {
    config.gameSpeed = prev;
  }
}
async function finish(characterId: number) {
  await q(`UPDATE actions SET ends_at = now() WHERE character_id = $1 AND status = 'active'`, [characterId]);
  await advance(1);
}
async function bandOf(p: Awaited<ReturnType<typeof newPlayer>>, n = 4) {
  for (let i = 0; i < n; i++) await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, $2, 'rock', 50)`, [p.character.id, `TM${i}`]);
  return (await p.c.post('/api/bands', { name: `Tur ${p.character.id}`, genre: 'rock', role: 'guitar' })).body.band;
}
async function closeChartWeek() {
  await q(`UPDATE chart_weeks SET ends_at = now() + interval '1 hour' WHERE status = 'open'`);
  await tick();
  await q(`UPDATE chart_weeks SET ends_at = now() - interval '1 second' WHERE status = 'open'`);
  await q(`UPDATE releases SET released_at = now() - interval '2 seconds'`);
  await tick();
}

describe('kurallar', () => {
  it('ekip ücreti, arıza, yıpranma, radyo, klip ve şirket payı formülleri', () => {
    expect(crewFees(['sound_tech', 'accountant'], 1)).toBeLessThan(60 + 40);
    expect(breakdownChance(80, 0, 0, false)).toBeGreaterThan(breakdownChance(0, 0, 0, false));
    expect(breakdownChance(80, 0, 0, true)).toBeLessThan(breakdownChance(80, 0, 0, false));
    expect(breakdownChance(50, 100, 100, false)).toBeLessThan(breakdownChance(50, 0, 0, false));
    expect(wornBonus(12, 100)).toBe(6);
    expect(wornBonus(12, 0)).toBe(12);
    expect(radioPlays(80, 60, 1, 20, 0, () => 0.5)).toBeGreaterThan(radioPlays(30, 60, 1, 20, 0, () => 0.5));
    expect(radioPlays(80, 0, 1, 20, 0, () => 0.5)).toBe(0);
    expect(videoQuality(60, 80, 50, () => 0.5)).toBeGreaterThan(videoQuality(60, 0, 0, () => 0.5));
    // Şirketli yayında grup + şirket toplamı havuzu (brütün %60'ı) aşmaz, avans geri alınır
    const s = labelSplit(1000, 0.5, 100);
    expect(s.band + s.label).toBe(1000 * LABEL_POOL);
    expect(s.recouped).toBe(100);
    expect(labelSplit(1000, 0.9, 0).band).toBe(Math.round(600 * 0.6)); // pay tavana kırpılır
  });
});

describe('turne ekibi ve yıpranma', () => {
  it('ekip lider tarafından alınır; ücret bilet gelirinden; enstrüman yıpranır ve tamir kitiyle onarılır', async () => {
    const p = await newPlayer();
    await setVip(p.userId);
    const band = await bandOf(p);
    const member = await newPlayer({ instrument: 'drums' });
    await q(`INSERT INTO band_members(band_id, character_id, role) VALUES ($1, $2, 'drums')`, [band.id, member.character.id]);
    expect((await member.c.post('/api/crew/sound_tech')).body.error).toBe('not_leader');
    expect((await p.c.post('/api/crew/sound_tech')).status).toBe(200);
    expect((await p.c.post('/api/crew/teleporter')).status).toBe(400);
    const view = (await p.c.get('/api/tour')).body;
    expect(view.crew).toContain('sound_tech');
    // Gitar al ve konser ver
    await setMoney(p.character.id, 5000);
    await p.c.post('/api/shop/buy', { locationId: 'istanbul-music_store', itemId: 'guitar_2' });
    await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 30)`, [band.id]);
    await q(`UPDATE gigs SET status = 'cancelled' WHERE location_id = 'istanbul-club' AND status = 'scheduled'`);
    const g = (await p.c.post('/api/gigs', { locationId: 'istanbul-club', inHours: 2, setlist: band.songs.map((s: any) => s.id) })).body.gig;
    await advance(10);
    const r = (await p.c.get(`/api/gigs/${g.id}`)).body.gig.result;
    expect(r.crewFee + (r.crewUnpaid ? 1 : 0)).toBeGreaterThan(0);
    const guitar = (await q(`SELECT id, wear FROM inventory WHERE character_id = $1 AND item_id = 'guitar_2'`, [p.character.id])).rows[0];
    expect(guitar.wear).toBeGreaterThan(0);
    // Tamir kiti
    await p.c.post('/api/shop/buy', { locationId: 'istanbul-hardware', itemId: 'repair_kit' });
    const kit = (await q(`SELECT id FROM inventory WHERE character_id = $1 AND item_id = 'repair_kit'`, [p.character.id])).rows[0];
    expect((await p.c.post('/api/repair', { kitId: Number(guitar.id), targetId: Number(guitar.id) })).body.error).toBe('not_repair_kit');
    expect((await p.c.post('/api/repair', { kitId: Number(kit.id), targetId: Number(guitar.id) })).status).toBe(200);
    expect((await q('SELECT wear FROM inventory WHERE id = $1', [guitar.id])).rows[0].wear).toBe(0);
    expect((await q('SELECT 1 FROM inventory WHERE id = $1', [kit.id])).rowCount).toBe(0);
    // Ekip ücreti ödenmezse moral çöker ve ekip dağılır
    await q('UPDATE bands SET crew_morale = 12 WHERE id = $1', [band.id]);
    await q(`UPDATE band_fame SET fame = 0 WHERE band_id = $1`, [band.id]);
    await p.c.post('/api/crew/promoter');
    const g2 = (await p.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: [band.songs[0].id] })).body.gig;
    expect(g2).toBeDefined();
    await q(`UPDATE gigs SET status = 'cancelled' WHERE location_id = 'istanbul-bar' AND status = 'scheduled' AND id <> $1`, [g2.id]);
    // Bar geliri ekibin ücretinden az: ödenmez
    await advance(10);
    const r2 = (await p.c.get(`/api/gigs/${g2.id}`)).body.gig.result;
    expect(r2.crewUnpaid).toBe(true);
    expect((await p.c.get('/api/tour')).body.crew).toEqual([]);
  });

  it('kendi aracıyla yolculukta arıza: yolculuk uzar, tamir kiti harcanır, araç yıpranır', async () => {
    const p = await newPlayer();
    await setMoney(p.character.id, 10000);
    await p.c.post('/api/shop/buy', { locationId: 'istanbul-car_dealer', itemId: 'car_1' });
    await p.c.post('/api/shop/buy', { locationId: 'istanbul-hardware', itemId: 'repair_kit' });
    // Kesin arıza için tam yıpranmış araç ve sürücülük yok; şansı en fazla %50: birkaç deneme
    await q(`UPDATE inventory SET wear = 100 WHERE character_id = $1 AND slot = 'vehicle'`, [p.character.id]);
    let broke = false;
    for (let i = 0; i < 12 && !broke; i++) {
      const from = (await me(p.c)).character.cityId;
      const to = from === 'istanbul' ? 'ankara' : 'istanbul';
      const a = await p.c.post('/api/actions', { kind: 'travel', toCityId: to, mode: 'car' });
      expect(a.status).toBe(200);
      broke = !!a.body.action.params.breakdown;
      await finish(p.character.id);
    }
    expect(broke).toBe(true);
    expect((await q(`SELECT count(*)::int AS n FROM inventory WHERE character_id = $1 AND item_id = 'repair_kit'`, [p.character.id])).rows[0].n).toBe(0);
  });

  it('turne: bütün şehirlerde süre içinde çalınırsa tamamlanır ve şöhret getirir', () =>
    slow(async () => {
      const p = await newPlayer();
      const band = await bandOf(p);
      expect((await p.c.post('/api/tour', { name: 'Kısa', cityIds: ['istanbul'], days: 7 })).body.error).toBe('invalid_cities');
      const t = await p.c.post('/api/tour', { name: 'Ege Turu', cityIds: ['istanbul', 'ankara', 'izmir'], days: 7 });
      expect(t.status).toBe(200);
      expect((await p.c.post('/api/tour', { name: 'İkinci', cityIds: ['istanbul', 'ankara', 'izmir'], days: 7 })).body.error).toBe('tour_active');
      for (const city of ['istanbul', 'ankara', 'izmir']) {
        await q(
          `INSERT INTO gigs(band_id, city_id, location_id, starts_at, setlist, status, result) VALUES ($1, $2, $3, now(), $4, 'done', '{"presentCount":1}')`,
          [band.id, city, `${city}-bar`, [band.songs[0].id]],
        );
      }
      await q(`UPDATE tours SET ends_at = now() + interval '5 milliseconds' WHERE band_id = $1`, [band.id]);
      await new Promise((r) => setTimeout(r, 10));
      await processTours();
      expect((await q('SELECT status FROM tours WHERE band_id = $1', [band.id])).rows[0].status).toBe('done');
      expect((await q(`SELECT fame FROM band_fame WHERE band_id = $1 AND city_id = 'izmir'`, [band.id])).rows[0].fame).toBeGreaterThan(0);
      expect((await p.c.get('/api/achievements')).body.unlocked.map((a: any) => a.id)).toContain('tour_1');
    }));
});

describe('klip, radyo, prodüktör ve plak şirketi', () => {
  it('prodüktör tutmak kaydı iyileştirir ve ücretlidir; klip yalnızca kayıtlı şarkıya, lider çeker', () =>
    slow(async () => {
      const p = await newPlayer();
      await setVip(p.userId);
      const band = await bandOf(p, 1);
      await setMoney(p.character.id, 20000);
      const song = band.songs[0].id;
      expect((await p.c.post('/api/actions', { kind: 'video', songId: song, locationId: 'istanbul-recording_studio' })).body.error).toBe('song_not_recorded');
      const rec = await p.c.post('/api/actions', { kind: 'record', songId: song, locationId: 'istanbul-recording_studio', producer: 'star' });
      expect(rec.status).toBe(200);
      expect(rec.body.action.params.cost).toBeGreaterThan(2000);
      await finish(p.character.id);
      expect((await q('SELECT producer FROM recordings WHERE band_id = $1', [band.id])).rows[0].producer).toBe('star');
      const v = await p.c.post('/api/actions', { kind: 'video', songId: song, locationId: 'istanbul-recording_studio', director: 'indie' });
      expect(v.status).toBe(200);
      await finish(p.character.id);
      expect((await q('SELECT quality FROM music_videos WHERE band_id = $1', [band.id])).rows[0].quality).toBeGreaterThan(0);
      expect((await p.c.post('/api/actions', { kind: 'video', songId: song, locationId: 'istanbul-recording_studio' })).body.error).toBe('video_cooldown');
    }));

  it('radyo çalınması ve klip listesi liste haftasında hesaplanır', async () => {
    const p = await newPlayer();
    await setVip(p.userId);
    const band = await bandOf(p, 1);
    const song = band.songs[0].id;
    await q(`INSERT INTO recordings(band_id, song_id, quality) VALUES ($1, $2, 80)`, [band.id, song]);
    await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 60)`, [band.id]);
    await q(`INSERT INTO releases(band_id, kind, title, song_ids, quality) VALUES ($1, 'single', 'Radyo', $2, 80)`, [band.id, [song]]);
    await q(`INSERT INTO music_videos(band_id, song_id, quality, director) VALUES ($1, $2, 70, 'none')`, [band.id, song]);
    await closeChartWeek();
    const plays = (await q('SELECT radio_plays FROM releases WHERE band_id = $1', [band.id])).rows[0].radio_plays;
    expect(plays).toBeGreaterThan(0);
    const chart = (await p.c.get('/api/charts/videos')).body;
    expect(chart.entries.some((e: any) => e.bandId === band.id)).toBe(true);
  });

  it('plak şirketi: kurulur, teklif ve pazarlık; avans şöhretle sınırlı, kendi grubu yok; gelir payı sözleşmeyle', async () => {
    const owner = await newPlayer();
    const lead = await newPlayer();
    await setMoney(owner.character.id, 60000);
    const band = await bandOf(lead, 1);
    const ownBand = await bandOf(owner, 1);
    expect((await owner.c.post('/api/labels', { name: 'amk records' })).body.error).toBe('invalid_name');
    expect((await owner.c.post('/api/labels', { name: 'Kara Plak' })).status).toBe(200);
    expect((await owner.c.post('/api/labels', { name: 'İkinci Plak' })).body.error).toBe('already_owner');
    // Tanınmayan gruba teklif verilemez
    expect((await owner.c.post('/api/labels/mine/offers', { bandId: band.id, bandShare: 0.4, advance: 0, weeks: 12 })).body.error).toBe('not_famous_enough');
    await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 20)`, [band.id]);
    await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 20)`, [ownBand.id]);
    expect((await owner.c.post('/api/labels/mine/offers', { bandId: ownBand.id, bandShare: 0.4, advance: 0, weeks: 12 })).body.error).toBe('own_band');
    expect((await owner.c.post('/api/labels/mine/offers', { bandId: band.id, bandShare: 0.4, advance: 5000, weeks: 12 })).body.error).toBe('advance_too_high');
    expect((await owner.c.post('/api/labels/mine/offers', { bandId: band.id, bandShare: 0.9, advance: 0, weeks: 12 })).body.error).toBe('invalid_share');
    const offer = await owner.c.post('/api/labels/mine/offers', { bandId: band.id, bandShare: 0.4, advance: 1500, weeks: 12 });
    expect(offer.status).toBe(200);
    const k = offer.body.id;
    // Sıra grupta: şirket kendi teklifini kabul edemez
    expect((await owner.c.post(`/api/contracts/${k}/accept`)).body.error).toBe('not_your_turn');
    // Grup karşı teklif verir; şirketin kasası boş: kabul edemez
    expect((await lead.c.post(`/api/contracts/${k}/counter`, { bandShare: 0.55, advance: 1000, weeks: 12 })).status).toBe(200);
    expect((await owner.c.post(`/api/contracts/${k}/accept`)).body.error).toBe('label_till_empty');
    expect((await owner.c.post('/api/labels/mine/till', { amount: 2000 })).status).toBe(200);
    const leadBefore = (await raw(lead.character.id)).money;
    expect((await owner.c.post(`/api/contracts/${k}/accept`)).status).toBe(200);
    expect((await raw(lead.character.id)).money).toBe(leadBefore + 1000);
    // Yayın sözleşmeye bağlanır, satış havuzu bölünür, avans geri alınır
    const song = band.songs[0].id;
    await q(`INSERT INTO recordings(band_id, song_id, quality) VALUES ($1, $2, 80)`, [band.id, song]);
    await setMoney(lead.character.id, 5000);
    const rel = await lead.c.post('/api/releases', { kind: 'single', title: 'Şirketli', songIds: [song] });
    expect(rel.status).toBe(200);
    await q('UPDATE band_fame SET fame = 70 WHERE band_id = $1', [band.id]);
    await closeChartWeek();
    const till = (await q('SELECT till FROM labels WHERE owner_id = $1', [owner.character.id])).rows[0].till;
    const recouped = (await q('SELECT recouped FROM label_contracts WHERE id = $1', [k])).rows[0].recouped;
    expect(till).toBeGreaterThan(1000);
    expect(recouped).toBeGreaterThan(0);
    // Gider ödenemezse şirket kapanır
    await setMoney(owner.character.id, 0);
    await q('UPDATE labels SET till = 0, upkeep_due = now() - interval \'1 second\' WHERE owner_id = $1', [owner.character.id]);
    await processLabels();
    expect((await q('SELECT 1 FROM labels WHERE owner_id = $1', [owner.character.id])).rowCount).toBe(0);
    // Sözleşmeler şirketle birlikte silinir; yayınlar şirketsiz (sabit pay) devam eder
    expect((await q('SELECT 1 FROM label_contracts WHERE id = $1', [k])).rowCount).toBe(0);
    expect((await q('SELECT contract_id FROM releases WHERE band_id = $1', [band.id])).rows[0].contract_id).toBeNull();
    void setSkills;
  });
});
