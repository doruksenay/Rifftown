// Denge düzeltmelerinin sunucu testleri (denge raporu maddeleri 1–14): gerçek API ve zamanlayıcıyla.
import { VENUE_RULES } from '@rifftown/shared';
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

