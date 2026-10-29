// VIP olmayana kesin sayı gitmez (playtest Y-5). Gerçek bir oyun akışından sonra GET uçlarının hepsi dolaşılır; yanıttaki
// her sayısal alanın adı ya bulanıklaştırılan bir anahtar (visibility.ts) ya da bilerek kesin gönderilen bir anahtar
// (para, kimlik, sayaç, zaman...) olmalı. Yeni bir sayısal alan eklenince bu test kırmızı olur ve sınıflandırılması gerekir.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { EXACT_NUMERIC_KEYS, isBlurredKey } from '../src/visibility';
import { ROUTES, advance, client, newPlayer, setMoney, setSkills, setVip, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(teardown);

/** JSON ağacındaki sayısal yaprakların anahtar adları (dizi öğeleri üst anahtarın adını taşır); map nesnelerin içi atlanır */
function numericKeys(node: unknown, out: Map<string, unknown>, key = '', depth = 0) {
  if (depth > 14 || node === null || node === undefined) return;
  if (typeof node === 'number') {
    if (key && !/^\d+$/.test(key) && !out.has(key)) out.set(key, node);
    return;
  }
  if (Array.isArray(node)) return node.forEach((x) => numericKeys(x, out, key, depth + 1));
  if (typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node)) {
    // Bulanık sözlükler (skills, fame, familiarity, attributes...) kuralıyla birlikte bulanıklaşır; içleri ayrıca sayılmaz
    if (isBlurredKey(k)) {
      out.set(k, v);
      continue;
    }
    // Sayısal anahtarlı sözlükler (şarkı id → değer) üst anahtarın adını taşır
    numericKeys(v, out, /^\d+$/.test(k) ? key : k, depth + 1);
  }
}

describe('görünürlük: sayısal alan beyaz listesi', () => {
  it('VIP olmayan oyuncunun gördüğü bütün sayısal alanlar sınıflandırılmış', { timeout: 120_000 }, async () => {
    const a = await newPlayer({ instrument: 'vocals' });
    const b = await newPlayer();
    await setMoney(a.character.id, 5000);
    await setSkills(a.character.id, { songwriting: 30, lyrics: 30 });
    const seen = new Map<string, unknown>();
    // A'nın bütün yanıtları (POST dahil: eylem, takılma, konser ayarlama) taranır
    const A = new Proxy(a.c, {
      get(target, prop: 'get' | 'post' | 'patch' | 'del') {
        const f = target[prop];
        if (typeof f !== 'function') return f;
        return async (...args: [string, unknown?]) => {
          const r = await (f as (...x: unknown[]) => Promise<{ status: number; body: unknown }>)(...args);
          if (r.status === 200) numericKeys(r.body, seen);
          return r;
        };
      },
    });
    // Akış: çalışma, mesai, şarkı, grup, prova, konser, takılma, arkadaşlık
    await A.post('/api/actions', { kind: 'study', skill: 'basic_singing', hours: 1 });
    await advance();
    await A.post('/api/actions', { kind: 'work', locationId: 'istanbul-work', hours: 2 });
    await advance();
    await A.post('/api/actions', { kind: 'write_song', title: 'Bir', genre: 'pop' });
    await advance();
    const band = (await A.post('/api/bands', { name: 'Sızıntı Yok', genre: 'pop', role: 'vocals' })).body.band;
    const songId = band.songs[0].id;
    await A.post('/api/actions', { kind: 'rehearse', songId, hours: 1, locationId: 'istanbul-studio' });
    await advance();
    const gig = (await A.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: [songId], sessionRoles: ['guitar', 'bass', 'drums'] })).body.gig;
    await advance();
    await A.post(`/api/friends/${b.character.id}`);
    await b.c.post(`/api/friends/${a.character.id}/answer`, { accept: true });
    await A.post(`/api/relationships/${b.character.id}/hangout`);
    await A.post('/api/actions', { kind: 'busk', role: 'vocals', hours: 1, locationId: 'istanbul-park' });
    await advance();
    await A.post('/api/actions', { kind: 'workout', hours: 1, locationId: 'istanbul-gym' });
    await advance();
    await A.post('/api/actions', { kind: 'rest', hours: 1 });
    await advance();
    await A.post('/api/actions', { kind: 'treat', locationId: 'istanbul-hospital', hours: 1 });
    await advance();
    await A.post('/api/meals', { locationId: 'istanbul-restaurant', mealId: 'soup' });
    await A.post('/api/shop/buy', { locationId: 'istanbul-hospital', itemId: 'cons_lozenge' });
    const inv = (await A.get('/api/me')).body.inventory ?? [];
    const loz = inv.find((x: { itemId: string }) => x.itemId === 'cons_lozenge');
    if (loz) await A.post(`/api/inventory/${loz.id}/use`);
    await A.post('/api/actions', { kind: 'record', songId, locationId: 'istanbul-recording_studio' });
    await advance();
    await A.post('/api/releases', { kind: 'single', title: 'Tekli', songIds: [songId] });
    await A.post('/api/actions', { kind: 'crime', crime: 'pickpocket', locationId: 'istanbul-park' });
    await advance();

    // Raporlar açık kalsın diye yavaş saat (VIP olmayanın konser raporu 3 oyun gününde kapanır)
    const prev = config.gameSpeed;
    config.gameSpeed = 3600;
    try {
      const ids: Record<string, string> = { id: String(b.character.id), cityId: 'istanbul', locationId: 'istanbul-bar' };
      const urls = [
        ...ROUTES.filter((r) => r.method === 'GET' && r.url.startsWith('/api/') && !r.url.startsWith('/api/admin')).map((r) =>
          r.url.replace(/:([a-zA-Z]+)/g, (_, p) => ids[p] ?? '1'),
        ),
        `/api/gigs/${gig.id}`,
        `/api/characters/${a.character.id}`,
        `/api/characters/${b.character.id}/relationship`,
      ];
      for (const u of urls) {
        await A.get(u);
      }
      // Bildirimlerin içi de (eylem sonuçları burada)
      expect(seen.size).toBeGreaterThan(30);
      const unknown = [...seen.keys()].filter((k) => !isBlurredKey(k) && !EXACT_NUMERIC_KEYS.has(k)).sort();
      // Bilinen sızıntılar artık kaba basamak (playtest Y-5)
      const notes = (await a.c.get('/api/notifications')).body.notifications as { kind: string; data: Record<string, number | string> }[];
      const study = notes.find((n) => n.kind === 'action_done' && n.data.kind === 'study');
      expect([0, 0.1, 0.5, 1.5, 3]).toContain(study!.data.gain);
      for (const n of notes.filter((x) => x.kind === 'action_done')) {
        for (const k of ['moodDelta', 'healthDelta', 'energyDelta', 'inspirationDelta']) {
          if (typeof n.data[k] === 'number') expect(Math.abs(Number(n.data[k]) % 5), `${n.data.kind} ${k}=${n.data[k]}`).toBe(0);
        }
      }
      const gigView = (await a.c.get(`/api/gigs/${gig.id}`)).body.gig;
      expect([-1.5, -0.5, 0, 0.5, 1.5]).toContain(gigView.result.fameDelta);
      const rel = (await a.c.get(`/api/characters/${b.character.id}/relationship`)).body;
      const rawRel = (await pool.query('SELECT friendship FROM relationships WHERE a_id = $1 AND b_id = $2', [Math.min(a.character.id, b.character.id), Math.max(a.character.id, b.character.id)])).rows[0];
      expect(Number(rawRel.friendship)).toBeGreaterThan(0);
      expect(JSON.stringify(rel)).not.toContain(String(Number(rawRel.friendship)));
      expect(unknown, `sınıflandırılmamış sayısal alanlar: ${unknown.map((k) => `${k}=${seen.get(k)}`).join(', ')}`).toEqual([]);
    } finally {
      config.gameSpeed = prev;
    }
  });
});

describe('görünürlük: VIP kesin sayıyı görür', () => {
  it('VIP oyuncunun beceri artışı ve ruh hâli değişimi ham gelir', async () => {
    const v = await newPlayer({ instrument: 'vocals' });
    await setVip(v.userId);
    await v.c.post('/api/actions', { kind: 'study', skill: 'basic_singing', hours: 1 });
    await advance();
    const n = (await v.c.get('/api/notifications')).body.notifications.find((x: { kind: string }) => x.kind === 'action_done');
    expect(n.data.gain).toBeGreaterThan(0);
    expect([0, 0.1, 0.5, 1.5, 3]).not.toContain(n.data.gain);
  });
});
