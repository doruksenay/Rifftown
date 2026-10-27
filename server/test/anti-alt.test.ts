// Ek hesap açıklarının regresyon testleri (denge raporu §7):
//  - takas rotasyonu: scripts/balance/exploits/trade-rotation.ts betiğinin test hâli (A → B → C → A, eşya kaybı olmadan para)
//  - ikili başına haftalık net para akışı tavanı (takas, pazar, VIP para gönderme ortak)
//  - kayıt sınırında istemci adresi: sahte cf-connecting-ip / X-Forwarded-For sınırı aşamaz (ip-limit.ts)
import type { FastifyInstance } from 'fastify';
import { PAIR_TRANSFER_CAP } from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import { addressBucket } from '../src/client-ip';
import { config } from '../src/config';
import { pool } from '../src/db';
import { newPlayer, setMoney, setVip, setup, teardown } from './helpers';

let app: FastifyInstance;
beforeAll(async () => {
  app = await setup();
});
afterAll(teardown);

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
type P = Awaited<ReturnType<typeof newPlayer>>;
const buy = async (p: P, itemId: string, shop = 'istanbul-music_store') => {
  const r = await p.c.post('/api/shop/buy', { locationId: shop, itemId });
  if (r.status !== 200) throw new Error(JSON.stringify(r.body));
  return Number(r.body.item.id);
};
const owner = async (inv: number) => Number((await q('SELECT character_id FROM inventory WHERE id = $1', [inv])).rows[0].character_id);
const money = async (p: P) => Number((await q('SELECT money FROM characters WHERE id = $1', [p.character.id])).rows[0].money);
/** Yavaş oyun saati: 168 oyun saatlik bekleme gerçek bir hafta sürer, testin ortasında dolmaz */
async function slowClock<T>(fn: () => Promise<T>) {
  const prev = config.gameSpeed;
  config.gameSpeed = 1;
  try {
    return await fn();
  } finally {
    config.gameSpeed = prev;
  }
}
const trade = async (from: P, to: P, give: number[], want: number[], giveMoney = 0) => {
  const offer = await from.c.post('/api/trades', { toId: to.character.id, give, want, giveMoney });
  if (offer.status !== 200) return offer;
  return to.c.post(`/api/trades/${offer.body.id}/accept`);
};

describe('takas rotasyonu kapalı', () => {
  it('A → B → C → A: eşya bekleme süresinde zincirin hiçbir eline dönemez (takas, hediye, pazar)', async () => {
    await slowClock(async () => {
      const [a, b, c] = [await newPlayer(), await newPlayer(), await newPlayer()];
      await setMoney(a.character.id, 4000);
      const guitar = await buy(a, 'guitar_3');
      for (const p of [b, c]) await setMoney(p.character.id, 5000);
      const bJunk = await buy(b, 'guitar_1');
      const cJunk = await buy(c, 'guitar_1');
      const start = await money(a);

      // 1) B, A'nın gitarını $4.000 (dükkân değeri) + ucuz eşya karşılığında alır
      expect((await trade(b, a, [bJunk], [guitar], 4000)).status).toBe(200);
      expect(await money(a)).toBe(start + 4000);
      // 2) B gitarı C'ye verir
      expect((await trade(b, c, [guitar], [cJunk])).status).toBe(200);
      // 3) C gitarı A'ya geri vermeye çalışır: eskiden geçiyordu (yalnız bir önceki sahibe bakılıyordu)
      expect((await c.c.post('/api/trades', { toId: a.character.id, give: [guitar], want: [bJunk] })).body.error).toBe('item_recently_yours');
      // A da isteyemez
      expect((await a.c.post('/api/trades', { toId: c.character.id, give: [bJunk], want: [guitar] })).body.error).toBe('item_recently_yours');
      // Hediyeyle de dönemez
      expect((await c.c.post('/api/gifts', { toId: a.character.id, inventoryId: guitar })).body.error).toBe('item_recently_yours');
      // Pazarla da dönemez
      const listed = await c.c.post('/api/market', { locationId: 'istanbul-flea_market', inventoryId: guitar, price: 1 });
      expect(listed.status).toBe(200);
      await setMoney(a.character.id, 10);
      expect((await a.c.post(`/api/market/${listed.body.id}/buy`, { locationId: 'istanbul-flea_market' })).body.error).toBe('item_recently_yours');
      // B de (zincirin ortası) eşyayı geri alamaz
      expect((await b.c.post(`/api/market/${listed.body.id}/buy`, { locationId: 'istanbul-flea_market' })).body.error).toBe('item_recently_yours');
      expect(await owner(guitar)).toBe(c.character.id);
      // Bekleme dolunca (bir oyun haftası) eşya serbestçe dolaşır
      await q(`UPDATE item_handoffs SET created_at = now() - interval '8 days' WHERE inventory_id = $1`, [guitar]);
      await q(`UPDATE inventory SET handed_at = now() - interval '8 days' WHERE id = $1`, [guitar]);
      expect((await a.c.post(`/api/market/${listed.body.id}/buy`, { locationId: 'istanbul-flea_market' })).status).toBe(200);
      expect(await owner(guitar)).toBe(a.character.id);
    });
  });

  it('dört hesaplı zincir (A → B → C → D → A) ve hediye zinciri de kapalı', async () => {
    await slowClock(async () => {
      const ps = [await newPlayer(), await newPlayer(), await newPlayer(), await newPlayer()];
      const [a, b, c, d] = ps;
      await setMoney(a.character.id, 4000);
      const guitar = await buy(a, 'guitar_3');
      const junk: number[] = [];
      for (const p of [b, c, d]) {
        await setMoney(p.character.id, 5000);
        junk.push(await buy(p, 'guitar_1'));
      }
      expect((await trade(b, a, [junk[0]], [guitar], 4000)).status).toBe(200);
      expect((await b.c.post('/api/gifts', { toId: c.character.id, inventoryId: guitar })).status).toBe(200);
      expect((await c.c.post('/api/gifts', { toId: d.character.id, inventoryId: guitar })).status).toBe(200);
      for (const back of [a, b, c]) {
        expect((await d.c.post('/api/gifts', { toId: back.character.id, inventoryId: guitar })).body.error).toBe('item_recently_yours');
        expect((await d.c.post('/api/trades', { toId: back.character.id, give: [guitar], want: [junk[2]] })).body.error).toBe('item_recently_yours');
      }
      expect(await owner(guitar)).toBe(d.character.id);
    });
  });
});

describe('oyuncular arası para akışı tavanı', () => {
  it('ikili başına haftalık net akış PAIR_TRANSFER_CAP: takas + pazar + VIP gönderme birlikte sayılır', async () => {
    await slowClock(async () => {
      const [main, alt] = [await newPlayer(), await newPlayer()];
      await setMoney(main.character.id, 20000);
      const g3 = await buy(main, 'guitar_3');
      const g2 = await buy(main, 'guitar_2');
      const g1 = await buy(main, 'guitar_1');
      await setMoney(alt.character.id, 20000);
      const altJunk = await buy(alt, 'guitar_1');
      // Takasla $4.000
      expect((await trade(alt, main, [altJunk], [g3], 4000)).status).toBe(200);
      // Pazarda $900'lük alış (toplam 4.900)
      const l = await main.c.post('/api/market', { locationId: 'istanbul-flea_market', inventoryId: g2, price: 900 });
      expect((await alt.c.post(`/api/market/${l.body.id}/buy`, { locationId: 'istanbul-flea_market' })).status).toBe(200);
      // Tavanı aşan takas teklifi reddedilir
      const altJunk2 = await buy(alt, 'guitar_1');
      const over = await alt.c.post('/api/trades', { toId: main.character.id, give: [altJunk2], want: [g1], giveMoney: 150 });
      expect(over.body.error).toBe('transfer_cap_reached');
      // VIP para gönderme de aynı tavana tabi
      await setVip(alt.userId);
      expect((await alt.c.post('/api/transfer', { toName: main.character.name, amount: 101 })).body.error).toBe('transfer_cap_reached');
      expect((await alt.c.post('/api/transfer', { toName: main.character.name, amount: PAIR_TRANSFER_CAP - 4900 })).status).toBe(200);
      expect((await alt.c.post('/api/transfer', { toName: main.character.name, amount: 1 })).body.error).toBe('transfer_cap_reached');
      // Ters yön serbest (net akış): ana hesap ek hesaba ödeme yapabilir
      const altItem = await buy(alt, 'guitar_1');
      expect((await trade(main, alt, [g1], [altItem], 150)).status).toBe(200);
      // Pencere dolunca yeniden açılır
      await q(`UPDATE player_money_flows SET created_at = now() - interval '8 days' WHERE from_id = $1 OR to_id = $1`, [alt.character.id]);
      expect((await alt.c.post('/api/transfer', { toName: main.character.name, amount: 1000 })).status).toBe(200);
    });
  });

  it('kabul anında da kontrol edilir: açık teklif tavan dolunca kabul edilemez ve açık kalır', async () => {
    await slowClock(async () => {
      const [main, alt] = [await newPlayer(), await newPlayer()];
      await setMoney(main.character.id, 9000);
      const g3 = await buy(main, 'guitar_3');
      const g3b = await buy(main, 'guitar_3');
      await setMoney(alt.character.id, 20000);
      const j1 = await buy(alt, 'guitar_1');
      const j2 = await buy(alt, 'guitar_1');
      const o1 = await alt.c.post('/api/trades', { toId: main.character.id, give: [j1], want: [g3], giveMoney: 4000 });
      const o2 = await alt.c.post('/api/trades', { toId: main.character.id, give: [j2], want: [g3b], giveMoney: 4000 });
      expect(o1.status).toBe(200);
      expect(o2.status).toBe(200);
      expect((await main.c.post(`/api/trades/${o1.body.id}/accept`)).status).toBe(200);
      expect((await main.c.post(`/api/trades/${o2.body.id}/accept`)).body.error).toBe('transfer_cap_reached');
      expect((await q('SELECT status FROM trades WHERE id = $1', [o2.body.id])).rows[0].status).toBe('open');
      expect(await owner(g3b)).toBe(main.character.id);
    });
  });
});

describe('istemci adresi (kayıt ve istek sınırı)', () => {
  const reg = (target: FastifyInstance, n: number, remoteAddress: string, headers: Record<string, string> = {}) =>
    target.inject({
      method: 'POST',
      url: '/api/auth/register',
      remoteAddress,
      headers,
      payload: { email: `adres${n}_${Date.now()}_${Math.random()}@test.com`, password: 'gizli12345', acceptTerms: true },
    });

  it('varsayılan: başlıklara güvenilmez, sahte cf-connecting-ip / X-Forwarded-For sınırı aşamaz', async () => {
    const prev = { n: config.registerPerIpDay, header: config.clientIpHeader };
    config.registerPerIpDay = 3;
    config.clientIpHeader = '';
    try {
      const sock = `192.0.2.${Math.floor(Math.random() * 150) + 1}`;
      const codes: number[] = [];
      for (let i = 0; i < 6; i++) {
        const r = await reg(app, i, sock, { 'cf-connecting-ip': `198.51.100.${i + 1}`, 'true-client-ip': `198.51.100.${i + 1}`, 'x-forwarded-for': `198.51.100.${i + 1}` });
        codes.push(r.statusCode);
      }
      // ip-limit.ts eskiden 6/6 kabul ölçüyordu
      expect(codes).toEqual([200, 200, 200, 429, 429, 429]);
    } finally {
      config.registerPerIpDay = prev.n;
      config.clientIpHeader = prev.header;
    }
  });

  it('TRUST_PROXY_HOPS: X-Forwarded-For sağdan güvenilen atlama kadar okunur, soldaki sahte değerler yok sayılır', async () => {
    const prev = { n: config.registerPerIpDay, header: config.clientIpHeader, hops: config.trustProxyHops };
    config.registerPerIpDay = 2;
    config.clientIpHeader = '';
    config.trustProxyHops = 1;
    const proxied = await buildApp({ logger: false });
    await proxied.ready();
    try {
      const client = `203.0.113.${Math.floor(Math.random() * 200) + 1}`;
      const codes: number[] = [];
      for (let i = 0; i < 4; i++) codes.push((await reg(proxied, 100 + i, '10.1.2.3', { 'x-forwarded-for': `198.51.100.${i + 1}, ${client}` })).statusCode);
      expect(codes).toEqual([200, 200, 429, 429]);
      // Farklı gerçek istemci kendi kovasında
      expect((await reg(proxied, 200, '10.1.2.3', { 'x-forwarded-for': `203.0.113.250, 192.0.2.77` })).statusCode).toBe(200);
      expect((await q('SELECT register_ip FROM users ORDER BY id DESC LIMIT 1')).rows[0].register_ip).toBe('192.0.2.77');
    } finally {
      await proxied.close();
      config.registerPerIpDay = prev.n;
      config.clientIpHeader = prev.header;
      config.trustProxyHops = prev.hops;
    }
  });

  it('CLIENT_IP_HEADER yalnızca ayarlanınca ve geçerli bir adresse okunur', async () => {
    const prev = { n: config.registerPerIpDay, header: config.clientIpHeader };
    config.registerPerIpDay = 1;
    config.clientIpHeader = 'cf-connecting-ip';
    try {
      const sock = `192.0.2.${Math.floor(Math.random() * 50) + 160}`;
      expect((await reg(app, 300, sock, { 'cf-connecting-ip': '198.51.100.200' })).statusCode).toBe(200);
      expect((await reg(app, 301, sock, { 'cf-connecting-ip': '198.51.100.201' })).statusCode).toBe(200);
      expect((await reg(app, 302, sock, { 'cf-connecting-ip': '198.51.100.201' })).statusCode).toBe(429);
      // Geçersiz başlık bağlantı adresine düşer
      expect((await reg(app, 303, sock, { 'cf-connecting-ip': 'sahte' })).statusCode).toBe(200);
      expect((await reg(app, 304, sock, { 'cf-connecting-ip': 'sahte' })).statusCode).toBe(429);
    } finally {
      config.registerPerIpDay = prev.n;
      config.clientIpHeader = prev.header;
    }
  });

  it('IPv6 /64 bloğu tek kova, IPv4 eşlemeli adres düz IPv4', () => {
    expect(addressBucket('2001:db8:1:2::5')).toBe('2001:db8:1:2::/64');
    expect(addressBucket('2001:0db8:0001:0002:ffff:0:0:9')).toBe('2001:db8:1:2::/64');
    expect(addressBucket('2001:db8::1')).toBe('2001:db8:0:0::/64');
    expect(addressBucket('::ffff:198.51.100.7')).toBe('198.51.100.7');
    expect(addressBucket('198.51.100.7')).toBe('198.51.100.7');
  });
});
