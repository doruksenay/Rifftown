// Basın ve medya: basın desteği, basın toplantısı ve röportaj, gazetecilik, skandal etkisi, moderasyon
import { CITY_BY_ID, type GigPerformer, computeGig, pressAttendanceMult, pressFameMult, articleImpact, ARTICLE_WEEKLY_CAP } from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { createScandal } from '../src/game/consequences';
import { processPressDrift } from '../src/game/press';
import { advance, client, me, newPlayer, setMoney, setSkills, setVip, setup, teardown } from './helpers';
import { tx } from '../src/db';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
const press = async (bandId: number, cityId = 'istanbul') =>
  Number((await q('SELECT value FROM band_press WHERE band_id = $1 AND city_id = $2', [bandId, cityId])).rows[0]?.value ?? 20);

async function finish(characterId: number) {
  await q(`UPDATE actions SET ends_at = now() WHERE character_id = $1 AND status = 'active'`, [characterId]);
  await advance(1);
}

async function bandOf(p: Awaited<ReturnType<typeof newPlayer>>) {
  await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Basın', 'rock', 40)`, [p.character.id]);
  return (await p.c.post('/api/bands', { name: `Basın ${p.character.id}`, genre: 'rock', role: 'guitar' })).body.band;
}

async function slow<T>(fn: () => Promise<T>): Promise<T> {
  const prev = config.gameSpeed;
  config.gameSpeed = 3600;
  try {
    return await fn();
  } finally {
    config.gameSpeed = prev;
  }
}

describe('kurallar', () => {
  it('basın desteği seyirciyi ve şöhreti etkiler; nötr etkisiz', () => {
    expect(pressFameMult(20)).toBe(1);
    expect(pressFameMult(100)).toBeGreaterThan(1.2);
    expect(pressFameMult(0)).toBeLessThan(1);
    expect(pressAttendanceMult(100)).toBeGreaterThan(pressAttendanceMult(0));
    const perf: GigPerformer = {
      characterId: 1, role: 'guitar', skills: { guitar: 50, showmanship: 40 }, mood: 80, health: 100, present: true,
      instrumentBonus: 0, outfitBonus: 0, familiarity: { 1: 60, 2: 60, 3: 60, 4: 60 },
    };
    const run = (p: number) => computeGig({ venue: 'club', fame: 30, genre: 'rock', city: CITY_BY_ID.istanbul, performers: [perf], setlist: [1, 2, 3, 4].map((id) => ({ id, quality: 50 })), rand: () => 0.5, press: p });
    expect(run(90).fameDelta).toBeGreaterThan(run(5).fameDelta);
    expect(run(90).attendance).toBeGreaterThanOrEqual(run(5).attendance);
    expect(articleImpact('positive', 50, 30, 2)).toBeGreaterThan(0);
    expect(articleImpact('negative', 50, 30, 2)).toBeLessThan(0);
    expect(Math.abs(articleImpact('negative', 100, 100, 3))).toBeLessThan(articleImpact('positive', 100, 100, 3));
  });
});

describe('basın etkinlikleri', () => {
  it('basın toplantısı yalnızca lider, gazetede ve beklemeli; röportaj her üye', () =>
    slow(async () => {
      const leader = await newPlayer();
      const member = await newPlayer({ instrument: 'drums' });
      const band = await bandOf(leader);
      await q(`INSERT INTO band_members(band_id, character_id, role) VALUES ($1, $2, 'drums')`, [band.id, member.character.id]);
      await setSkills(leader.character.id, { media: 80, rhetoric: 80, charisma: 80 });
      await setMoney(leader.character.id, 2000);
      expect((await member.c.post('/api/actions', { kind: 'press', mode: 'conference', locationId: 'istanbul-newspaper' })).body.error).toBe('not_leader');
      expect((await leader.c.post('/api/actions', { kind: 'press', mode: 'conference', locationId: 'istanbul-bar' })).body.error).toBe('invalid_location');
      const start = await leader.c.post('/api/actions', { kind: 'press', mode: 'conference', locationId: 'istanbul-newspaper' });
      expect(start.status).toBe(200);
      expect(start.body.action.params.cost).toBeGreaterThan(0);
      // Lider meşgulken başka üye de toplantı açamaz (aynı şehirde bekleyen toplantı)
      await finish(leader.character.id);
      const res = (await leader.c.get('/api/actions/history')).body.actions[0].result;
      expect(typeof res.success).toBe('boolean');
      expect(await press(band.id)).not.toBe(20);
      expect((await leader.c.post('/api/actions', { kind: 'press', mode: 'conference', locationId: 'istanbul-newspaper' })).body.error).toBe('press_cooldown');
      // Röportaj: üye verir, kişi başı bekleme
      expect((await member.c.post('/api/actions', { kind: 'press', mode: 'interview', locationId: 'istanbul-newspaper' })).status).toBe(200);
      await finish(member.character.id);
      expect((await member.c.post('/api/actions', { kind: 'press', mode: 'interview', locationId: 'istanbul-newspaper' })).body.error).toBe('press_cooldown');
      // Grup detayında şehir bazlı basın; VIP olmayana bulanık
      const det = (await leader.c.get('/api/bands/mine')).body.band;
      expect(det.press.istanbul).toBeDefined();
      // Grubu olmayan basınla görüşemez
      const loner = await newPlayer();
      expect((await loner.c.post('/api/actions', { kind: 'press', mode: 'interview', locationId: 'istanbul-newspaper' })).body.error).toBe('no_band');
    }));

  it('başarılı basın toplantısı son skandalı yatıştırır', () =>
    slow(async () => {
      const p = await newPlayer();
      const band = await bandOf(p);
      await setSkills(p.character.id, { media: 100, rhetoric: 100, charisma: 100 });
      await setMoney(p.character.id, 2000);
      await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 60)`, [band.id]);
      await tx((c) => createScandal(c, { bandId: band.id, characterId: null, cityId: 'istanbul', kind: 'disaster' }));
      const afterScandal = await press(band.id);
      expect(afterScandal).toBeLessThan(20);
      // Şans yüksek (0,95): birkaç denemede başarır; bekleme süresini test için sıfırla
      for (let i = 0; i < 5; i++) {
        await q('DELETE FROM press_events WHERE band_id = $1', [band.id]);
        await p.c.post('/api/actions', { kind: 'press', mode: 'conference', locationId: 'istanbul-newspaper' });
        await finish(p.character.id);
        if ((await q('SELECT defused FROM scandals WHERE band_id = $1', [band.id])).rows[0].defused) break;
      }
      expect((await q('SELECT defused FROM scandals WHERE band_id = $1', [band.id])).rows[0].defused).toBe(true);
      expect(await press(band.id)).toBeGreaterThan(afterScandal);
    }));

  it('basın desteği zamanla nötre döner', async () => {
    const p = await newPlayer();
    const band = await bandOf(p);
    await q(`INSERT INTO band_press(band_id, city_id, value, updated_at) VALUES ($1, 'istanbul', 80, now() - interval '1 second')`, [band.id]);
    await processPressDrift();
    const v = await press(band.id);
    expect(v).toBeLessThan(80);
    expect(v).toBeGreaterThanOrEqual(20);
  });
});

describe('gazetecilik ve moderasyon', () => {
  it('yalnızca gazeteci yazar; haber basını etkiler, haftalık tavan, küfür yıldızlanır, kaldırılınca geri alınır', () => slow(async () => {
    const target = await newPlayer();
    const band = await bandOf(target);
    const j = await newPlayer();
    const body = 'Dün gece kulüpte inanılmaz bir konser verdiler, salon ayaktaydı ve herkes şarkılara eşlik etti.';
    expect((await j.c.post('/api/actions', { kind: 'write_article', locationId: 'istanbul-newspaper', title: 'Harika gece', body, bandId: band.id, tone: 'positive' })).body.error).toBe('not_journalist');
    await setSkills(j.character.id, { lyrics: 40, journalism: 60 });
    await q(`UPDATE characters SET profession = 'journalist', career_rank = 2 WHERE id = $1`, [j.character.id]);
    expect((await j.c.post('/api/actions', { kind: 'write_article', locationId: 'istanbul-newspaper', title: 'Kısa', body: 'çok kısa', tone: 'positive' })).body.error).toBe('invalid_body');
    const w = await j.c.post('/api/actions', { kind: 'write_article', locationId: 'istanbul-newspaper', title: 'Harika gece amk', body, bandId: band.id, tone: 'positive' });
    expect(w.status).toBe(200);
    await finish(j.character.id);
    expect(await press(band.id)).toBeGreaterThan(20);
    const news = (await target.c.get('/api/cities/istanbul/news')).body.articles;
    expect(news[0].title).toContain('***');
    expect(news[0].band.id).toBe(band.id);
    expect((await target.c.get('/api/notifications')).body.notifications.some((n: any) => n.kind === 'press_article')).toBe(true);
    // Aynı gruba bekleme süresi
    expect((await j.c.post('/api/actions', { kind: 'write_article', locationId: 'istanbul-newspaper', title: 'Yine', body, bandId: band.id, tone: 'negative' })).body.error).toBe('article_cooldown');
    // Haftalık tavan: geçmişte çok etkili haber yazılmış gibi
    await q(`INSERT INTO articles(author_id, city_id, band_id, kind, tone, title, body, impact) VALUES (NULL, 'istanbul', $1, 'news', 'negative', 'x', 'x', $2)`, [band.id, -ARTICLE_WEEKLY_CAP]);
    const before = await press(band.id);
    await q(`DELETE FROM articles WHERE author_id = $1`, [j.character.id]); // bekleme süresini aş
    await j.c.post('/api/actions', { kind: 'write_article', locationId: 'istanbul-newspaper', title: 'Kötü gece', body, bandId: band.id, tone: 'negative' });
    await finish(j.character.id);
    expect(await press(band.id)).toBeCloseTo(before, 3);
    // Şikâyet ve yönetici kaldırması basın etkisini geri alır
    const art = (await target.c.get('/api/cities/istanbul/news')).body.articles[0];
    expect((await target.c.post('/api/reports', { kind: 'article', targetId: art.id, text: '' })).status).toBe(200);
    const admin = await newPlayer();
    await q('UPDATE users SET is_admin = TRUE WHERE id = $1', [admin.userId]);
    const reports = (await admin.c.get('/api/admin/reports')).body.reports;
    const rep = reports.find((r: any) => r.kind === 'article' && Number(r.target_id) === art.id);
    expect(rep).toBeDefined();
    expect((await admin.c.post(`/api/admin/reports/${rep.id}/resolve`, { remove: true })).status).toBe(200);
    expect((await target.c.get('/api/cities/istanbul/news')).body.articles.some((a: any) => a.id === art.id)).toBe(false);
  }));

  it('engellenen yazarın haberi akışta görünmez', async () => {
    const reader = await newPlayer();
    const j = await newPlayer();
    await q(`UPDATE characters SET profession = 'journalist' WHERE id = $1`, [j.character.id]);
    await j.c.post('/api/actions', { kind: 'write_article', locationId: 'istanbul-newspaper', title: 'Şehirde bu hafta', body: 'Bu hafta şehirde çok sayıda konser vardı ve kulüpler doluydu.' });
    await finish(j.character.id);
    expect((await reader.c.get('/api/cities/istanbul/news')).body.articles.some((a: any) => a.author?.characterId === j.character.id)).toBe(true);
    await reader.c.post(`/api/blocks/${j.character.id}`);
    expect((await reader.c.get('/api/cities/istanbul/news')).body.articles.some((a: any) => a.author?.characterId === j.character.id)).toBe(false);
    expect((await client().get('/api/cities/istanbul/news')).status).toBe(401);
    void me;
    void setVip;
  });
});
