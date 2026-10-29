// Konser iptalinde iade (playtest O-4): kiralık müzisyen ücreti, prodüksiyon payı ve sahne efektleri konseri ayarlayıp
// ödeyen kişiye döner, iptal eden yeni lidere değil.
import { SESSION_MUSICIAN } from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { me, newPlayer, raw, setMoney, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(teardown);

/** Yavaş saat: konser hemen sonuçlanmasın */
async function slow<T>(fn: () => Promise<T>) {
  const prev = config.gameSpeed;
  config.gameSpeed = 3600;
  try {
    return await fn();
  } finally {
    config.gameSpeed = prev;
  }
}

const fxCount = async (characterId: number) =>
  (await pool.query(`SELECT count(*)::int AS n FROM inventory WHERE character_id = $1 AND item_id = 'fx_smoke'`, [characterId])).rows[0].n as number;

describe('konser iptali iadesi', () => {
  it('lider ayrılınca yeni liderin iptali ücreti ve efekti ödeyene geri verir', () =>
    slow(async () => {
      const a = await newPlayer();
      const b = await newPlayer({ instrument: 'drums' });
      await setMoney(a.character.id, 1000);
      await pool.query(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'İade', 'rock', 40)`, [a.character.id]);
      const band = (await a.c.post('/api/bands', { name: 'İade Testi', genre: 'rock', role: 'guitar' })).body.band;
      const inv = (await a.c.post('/api/bands/mine/invites', { name: b.character.name, role: 'drums' })).body;
      const inviteId = inv.invite?.id ?? (await pool.query('SELECT id FROM band_invites WHERE character_id = $1', [b.character.id])).rows[0].id;
      expect((await b.c.post(`/api/invites/${inviteId}/accept`)).status).toBe(200);
      expect((await a.c.post('/api/shop/buy', { locationId: 'istanbul-stage_shop', itemId: 'fx_smoke' })).status).toBe(200);
      const fxId = (await pool.query(`SELECT id FROM inventory WHERE character_id = $1 AND item_id = 'fx_smoke'`, [a.character.id])).rows[0].id;
      const g = await a.c.post('/api/gigs', {
        locationId: 'istanbul-bar', inHours: 24, setlist: band.songs.map((s: { id: number }) => s.id), sessionRoles: ['bass', 'vocals'], effects: [Number(fxId)],
      });
      expect(g.status).toBe(200);
      const fee = 2 * SESSION_MUSICIAN.bar.fee;
      const aAfterBooking = (await raw(a.character.id)).money;
      expect(await fxCount(a.character.id)).toBe(0);
      // Lider ayrılır, liderlik B'ye geçer; B iptal eder
      expect((await a.c.post('/api/bands/mine/leave')).status).toBe(200);
      const bBefore = (await raw(b.character.id)).money;
      const cancel = await b.c.del(`/api/gigs/${g.body.gig.id}`);
      expect(cancel.status).toBe(200);
      expect(cancel.body.refund).toBe(fee);
      expect(cancel.body.refundedTo).toBe(a.character.id);
      // Para ve efekt ödeyene (A) döner, iptal eden (B) hiçbir şey kazanmaz
      expect((await raw(a.character.id)).money).toBe(aAfterBooking + fee);
      expect(await fxCount(a.character.id)).toBe(1);
      expect((await raw(b.character.id)).money).toBe(bBefore);
      expect(await fxCount(b.character.id)).toBe(0);
      // A artık grupta değil ama iadesini bildirimle öğrenir
      const n = (await a.c.get('/api/notifications')).body.notifications.find((x: { kind: string }) => x.kind === 'gig_cancelled');
      expect(n.data.refund).toBe(fee);
    }));

  it('ödeyen bilinmiyorsa (hesabı silinmiş) iade yapılmaz, para basılmaz', () =>
    slow(async () => {
      const a = await newPlayer();
      await setMoney(a.character.id, 1000);
      await pool.query(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Kayıp', 'rock', 40)`, [a.character.id]);
      const band = (await a.c.post('/api/bands', { name: 'Kayıp Ödeyen', genre: 'rock', role: 'guitar' })).body.band;
      const gig = await a.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 12, setlist: band.songs.map((s: { id: number }) => s.id), sessionRoles: ['drums'] });
      expect(gig.status).toBe(200);
      await pool.query('UPDATE gigs SET booked_by = NULL WHERE id = $1', [gig.body.gig.id]);
      const before = (await me(a.c)).character.money;
      const cancel = await a.c.del(`/api/gigs/${gig.body.gig.id}`);
      expect(cancel.body.refund).toBe(0);
      expect((await me(a.c)).character.money).toBe(before);
    }));

  it('ayarlayan kendisi iptal ederse iade yine ona', () =>
    slow(async () => {
      const a = await newPlayer();
      await pool.query(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Kendi', 'rock', 40)`, [a.character.id]);
      const band = (await a.c.post('/api/bands', { name: 'Kendi İptal', genre: 'rock', role: 'guitar' })).body.band;
      const g = await a.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 24, setlist: band.songs.map((s: { id: number }) => s.id), sessionRoles: ['drums'] });
      expect(g.status).toBe(200);
      const before = (await raw(a.character.id)).money;
      expect((await a.c.del(`/api/gigs/${g.body.gig.id}`)).body.refund).toBe(SESSION_MUSICIAN.bar.fee);
      expect((await raw(a.character.id)).money).toBe(before + SESSION_MUSICIAN.bar.fee);
    }));
});
