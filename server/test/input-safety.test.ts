// Beklenmeyen girdide sunucu 500 vermez (playtest O-5, O-6): prototip anahtarları (`constructor`, `__proto__`),
// NUL karakteri ve görünmez/yön değiştiren karakterler. Fuzz kısmı kayıtlı bütün uçları dolaşır; yeni bir uç eklenince
// kendiliğinden kapsanır.
import { cleanText, hasUnsafeChars, MAX_COMBINING_MARKS } from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pool } from '../src/db';
import { ROUTES, client, inject, newPlayer, rawPost, setMoney, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(teardown);

const PROTO = ['__proto__', 'constructor', 'toString', 'hasOwnProperty', 'valueOf', 'prototype'];
/** Gövdede sık geçen anahtarların hepsi prototip adıyla */
const protoBody = (v: string) => ({
  kind: v, crime: v, recipe: v, skill: v, locationId: v, cityId: v, toCityId: v, itemId: v, role: v, genre: v, subgenre: v,
  titleId: v, mealId: v, tattooId: v, homeId: v, choice: v, office: v, mode: v, scope: v, channel: v, direction: v, answer: v,
  tier: v, slot: v, type: v, name: v, title: v, text: v, body: v, events: [v], startAttributes: { [v]: 10 }, attribute: v, id: v,
});
const ACTION_BODIES = (v: string) => [
  { kind: 'crime', crime: v, locationId: 'istanbul-park' },
  { kind: 'craft', recipe: v, locationId: 'istanbul-hardware' },
  { kind: 'study', skill: v, hours: 1 },
  { kind: 'lesson', skill: v, hours: 1, tutor: 'professor', locationId: 'istanbul-school' },
  { kind: 'write_song', title: 'x', genre: 'rock', subgenre: v },
  { kind: 'travel', toCityId: v, mode: 'bus' },
  { kind: 'work', locationId: v, hours: 2 },
  { kind: 'press', mode: 'interview', locationId: v },
];
const NUL_BODIES = [
  { text: 'a\u0000b', channel: 'city:istanbul' },
  { kind: 'write_song', title: 'a\u0000b', genre: 'rock' },
  { email: 'a\u0000@b.com', password: 'gizli12345' },
  { name: 'Ad\u0000', bio: '\u0000' },
  { ['k\u0000']: 1 },
  { text: '\ud800yalnız vekil', channel: 'city:istanbul' },
];

describe('girdi güvenliği', () => {
  it('ortak temizleyici: NUL, kontrol, görünmez ve yön değiştiren karakterler, zalgo', () => {
    expect(cleanText('a\u0000b\u0007c')).toBe('abc');
    expect(cleanText('\u202eters\u200b yazı\u2066x\u2069\ufeff')).toBe('ters yazıx');
    expect(cleanText('satır\nbir', true)).toBe('satırbir');
    expect(cleanText('satır\n\n\n\nbir')).toBe('satır\n\nbir');
    const zalgo = 'z' + '\u0301'.repeat(50) + 'a';
    expect(cleanText(zalgo)).toBe('z' + '\u0301'.repeat(MAX_COMBINING_MARKS) + 'a');
    // Türkçe ve aksanlı metin bozulmaz
    expect(cleanText('Çağrı Şükrü İğdır ñ é')).toBe('Çağrı Şükrü İğdır ñ é');
    expect(hasUnsafeChars('a\u0000')).toBe(true);
    expect(hasUnsafeChars('🎸 gitar')).toBe(false);
    expect(hasUnsafeChars('\ud800')).toBe(true);
  });

  it('prototip anahtarları 400/404 döner, 500 değil (bilinen üç uç)', async () => {
    const p = await newPlayer();
    for (const v of PROTO) {
      const crime = await p.c.post('/api/actions', { kind: 'crime', crime: v, locationId: 'istanbul-park' });
      expect(crime.status, `crime ${v}`).toBe(400);
      expect(crime.body.error).toBe('invalid_crime');
      const craft = await p.c.post('/api/actions', { kind: 'craft', recipe: v, locationId: 'istanbul-hardware' });
      expect(craft.status, `craft ${v}`).toBeLessThan(500);
      expect(craft.status).toBeGreaterThanOrEqual(400);
      const chain = await p.c.post(`/api/chains/${v}/claim`, {});
      expect(chain.status, `chain ${v}`).toBe(404);
    }
  });

  it('NUL karakteri sohbette, şarkı adında, girişte, aramada ve yol parametresinde 400', async () => {
    const p = await newPlayer();
    expect((await p.c.post('/api/chat', { channel: 'city:istanbul', text: 'a\u0000b' })).status).toBe(400);
    expect((await p.c.post('/api/actions', { kind: 'write_song', title: 'a\u0000b', genre: 'rock' })).status).toBe(400);
    expect((await rawPost('/api/auth/login', { email: 'a\u0000@b.com', password: 'x' })).status).toBe(400);
    expect((await p.c.get('/api/characters?search=a%00b')).status).toBe(400);
    expect((await p.c.get('/api/cities/%00/people')).status).toBe(400);
    expect((await p.c.patch('/api/businesses/%00', {})).status).toBe(400);
    const r = await p.c.post('/api/actions', { kind: 'write_song', title: 'a\u0000b', genre: 'rock' });
    expect(r.body.error).toBe('invalid_input');
  });

  it('şehir sohbeti özel mesajla aynı temizleyiciden geçer (görünmez, yön değiştiren, zalgo)', async () => {
    const p = await newPlayer();
    const r = await p.c.post('/api/chat', { channel: 'city:istanbul', text: '\u202eters\u200b chat ' + 'e' + '\u0301'.repeat(40) });
    expect(r.status).toBe(200);
    expect(r.body.message.text).toBe('ters chat e' + '\u0301'.repeat(MAX_COMBINING_MARKS));
    // Yalnızca görünmez karakterden oluşan mesaj boş sayılır
    expect((await p.c.post('/api/chat', { channel: 'city:istanbul', text: '\u200b\u202e' })).body.error).toBe('invalid_message');
  });

  it('şarkı adı da temizlenir', async () => {
    const p = await newPlayer();
    const r = await p.c.post('/api/actions', { kind: 'write_song', title: '\u202eGizli\u200b Şarkı', genre: 'rock' });
    expect(r.status).toBe(200);
    expect(r.body.action.params?.title ?? (await pool.query('SELECT params FROM actions WHERE id = $1', [r.body.action.id])).rows[0].params.title).toBe('Gizli Şarkı');
  });

  it('fuzz: kayıtlı bütün uçlar prototip anahtarı ve NUL ile 500 vermez', { timeout: 240_000 }, async () => {
    const p = await newPlayer();
    await setMoney(p.character.id, 50_000);
    const admin = await newPlayer();
    await pool.query('UPDATE users SET is_admin = TRUE WHERE id = $1', [admin.userId]);
    const skip = /\/auth\/(logout|delete-account|change-password)|\/admin\/players\/:id\/(delete|ban)/;
    const routes = ROUTES.filter((r) => r.url.startsWith('/api/') && !skip.test(r.url));
    expect(routes.length).toBeGreaterThan(100);
    const failures: string[] = [];
    const call = async (token: string, method: string, url: string, payload?: unknown) => {
      const res = await inject(method, url, { token, ...(payload !== undefined ? { payload } : {}) });
      if (res.statusCode >= 500) failures.push(`${method} ${url} ${JSON.stringify(payload)?.slice(0, 120)} -> ${res.statusCode} ${res.body.slice(0, 120)}`);
    };
    for (const r of routes) {
      const token = r.url.startsWith('/api/admin') ? admin.c.token : p.c.token;
      const values = [...PROTO, '%00', '1'];
      for (const v of values) {
        const url = r.url.replace(/:[a-zA-Z]+/g, encodeURIComponent(v === '%00' ? '\u0000' : v));
        if (r.method === 'GET' || r.method === 'DELETE') {
          await call(token, r.method, url);
          await call(token, r.method, `${url}${url.includes('?') ? '&' : '?'}search=${encodeURIComponent(v)}&cityId=${encodeURIComponent(v)}&locationId=${encodeURIComponent(v)}&scope=${encodeURIComponent(v)}`);
        } else {
          const bodies: unknown[] = [{}, protoBody(v), ...NUL_BODIES];
          if (r.url === '/api/actions') bodies.push(...ACTION_BODIES(v));
          for (const b of bodies) await call(token, r.method, url, b);
        }
        if (!r.url.includes(':')) break;
      }
    }
    expect(failures).toEqual([]);
  });

  it('veritabanı veri hatası (22xxx) 400 olarak döner', async () => {
    // Doğrulamadan kaçan bir girdi olsa bile (ör. sayı aralığı) son güvenlik ağı 500 yerine 400 döner
    const p = await newPlayer();
    const r = await client(p.c.token).get('/api/characters/99999999999999999999');
    expect(r.status).toBeLessThan(500);
  });
});
