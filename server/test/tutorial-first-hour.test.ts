// İlk saat (playtest Y-2): rehber anlık ve ödüllü adımlarla başlar; şarkı yazılırken kart beklemede kalmaz, eylem
// sürerken yapılabilen adımı gösterir. Toplam ödül küçük kalır. Yavaş saatte (1 oyun saati = 1 sn).
import { TUTORIAL, TUTORIAL_TOTAL_REWARD } from '@rifftown/shared';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { newPlayer, setup, teardown } from './helpers';

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

describe('rehberin ilk dakikaları', () => {
  it('ilk beş adım anlık: hepsi oyunun ilk dakikasında yapılıp ödülü alınır', async () => {
    const p = await newPlayer({ cityId: 'izmir' });
    const c = p.c;
    const order = TUTORIAL.map((s) => s.id);
    expect(order.slice(0, 6)).toEqual(['profile', 'learn_skill', 'form_band', 'home', 'meal', 'write_song']);
    expect((await c.patch('/api/character', { headline: 'Yeni gelen' })).status).toBe(200);
    expect((await c.post('/api/skills/learn', { skillId: 'genre_pop', locationId: 'izmir-bookstore' })).status).toBe(200);
    expect((await c.post('/api/bands', { name: 'Ilk Dakika', genre: 'rock', role: 'guitar' })).status).toBe(200);
    expect((await c.post('/api/homes/rent', { homeId: 'room', locationId: 'izmir-real_estate' })).status).toBe(200);
    expect((await c.post('/api/meals', { locationId: 'izmir-restaurant', mealId: 'soup' })).status).toBe(200);
    let claimed = 0;
    for (let i = 0; i < 6; i++) {
      const t = (await c.get('/api/tutorial')).body;
      const st = t.steps.find((s: { id: string }) => s.id === t.current);
      if (!st?.done) break;
      expect((await c.post(`/api/tutorial/${t.current}/claim`)).status).toBe(200);
      claimed++;
    }
    expect(claimed).toBe(5);
  });

  it('şarkı yazılırken kart şarkıda takılmaz: eylem sürerken yapılabilen adımı gösterir', async () => {
    const p = await newPlayer({ cityId: 'izmir' });
    const friend = await newPlayer({ cityId: 'izmir' });
    expect((await p.c.post('/api/actions', { kind: 'write_song', title: 'Ilk', genre: 'rock' })).status).toBe(200);
    const t = (await p.c.get('/api/tutorial')).body;
    expect(t.waiting).toBe('write_song');
    // Profil, grup ve arkadaşlık eylem sürerken yapılabilir; kart bunlardan ilkini gösterir
    expect(t.current).toBe('profile');
    expect((await p.c.post(`/api/friends/${friend.character.id}`)).status).toBe(200);
    const t2 = (await p.c.get('/api/tutorial')).body;
    expect(t2.steps.find((s: { id: string }) => s.id === 'friend').done).toBe(true);
  });

  it('toplam ödül küçük kalır', () => {
    expect(TUTORIAL_TOTAL_REWARD).toBeLessThanOrEqual(320);
    // Ev ödülü en ucuz odanın kirasından az; yemek ödülü en ucuz yemekten az kâr bırakır
    expect(TUTORIAL.find((s) => s.id === 'home')!.reward).toBeLessThan(60);
  });
});
