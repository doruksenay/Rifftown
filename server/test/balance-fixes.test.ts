// Denge düzeltmelerinin sunucu testleri (denge raporu maddeleri 1–14): gerçek API ve zamanlayıcıyla.
import { HANGOUT_UPLIFTS_PER_DAY, MAX_CHILDREN, VENUE_RULES } from '@rifftown/shared';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
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
