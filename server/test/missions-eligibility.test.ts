// Haftalık görevler oyuncunun durumuna göre (playtest O-2): grubu olmayana konser/kayıt, arkadaşı olmayana takılma ve
// hediye, yeni hesaba yolculuk ve hediye, sahne olayı bilmeyene sahne olayı görevi düşmez. Seçim hafta içinde değişmez.
import { MISSIONS, MISSIONS_PER_WEEK, type MissionContext, missionEligible, missionsFor } from '@rifftown/shared';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { tick } from '../src/worker';
import { newPlayer, setup, teardown } from './helpers';

const fresh: MissionContext = { hasBand: false, gigsPlayed: 0, friends: 0, accountHours: 1, knowsCraft: false, canStageEvent: false };
const BAND_KINDS = new Set(['gigs', 'records', 'press', 'rehearse_hours', 'encores', 'stage_events', 'cities_played']);

describe('görev uygunluğu (kurallar)', () => {
  it('yeni ve yalnız oyuncuya hiçbir haftada uygunsuz görev düşmez; aynı türden iki görev yok', () => {
    for (let id = 1; id <= 40; id++) {
      for (let wk = 1; wk <= 30; wk++) {
        const list = missionsFor(id, wk, fresh);
        expect(list).toHaveLength(MISSIONS_PER_WEEK);
        for (const m of list) {
          expect(BAND_KINDS.has(m.kind), m.id).toBe(false);
          expect(['hangouts', 'gifts', 'travel', 'crafts']).not.toContain(m.kind);
        }
        expect(new Set(list.map((m) => m.kind)).size).toBe(list.length);
      }
    }
  });

  it('grubu, arkadaşı ve deneyimi olan oyuncuda bütün havuz açık', () => {
    const vet: MissionContext = { hasBand: true, gigsPlayed: 20, friends: 3, accountHours: 1000, knowsCraft: true, canStageEvent: true };
    expect(MISSIONS.every((m) => missionEligible(m, vet))).toBe(true);
    // Yeni oyuncuya hâlâ yeterince görev var
    expect(MISSIONS.filter((m) => missionEligible(m, fresh)).length).toBeGreaterThanOrEqual(MISSIONS_PER_WEEK * 3);
  });
});

describe('görev uygunluğu (sunucu)', () => {
  beforeAll(setup);
  afterAll(teardown);
  let prev = 0;
  beforeEach(() => {
    prev = config.gameSpeed;
    config.gameSpeed = 3600;
  });
  afterEach(() => {
    config.gameSpeed = prev;
  });

  it('yeni oyuncunun görevleri uygun; hafta içinde grup kurmak listeyi değiştirmez', async () => {
    config.gameSpeed = prev;
    await tick(); // açık liste haftası
    config.gameSpeed = 3600;
    const p = await newPlayer();
    const first = (await p.c.get('/api/missions')).body.missions.map((m: { id: string }) => m.id);
    const defs = first.map((id: string) => MISSIONS.find((m) => m.id === id)!);
    for (const d of defs) expect(missionEligible(d, fresh), d.id).toBe(true);
    await pool.query(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'G', 'rock', 30)`, [p.character.id]);
    await p.c.post('/api/bands', { name: 'Hafta Ortasi', genre: 'rock', role: 'guitar' });
    expect((await p.c.get('/api/missions')).body.missions.map((m: { id: string }) => m.id)).toEqual(first);
  });
});
