// Oturum güvenliği (playtest Y-6): oturum süresi, şifre değişince diğer oturumların kapanması, yönetici yükseltmesi.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { purgeExpiredSessions } from '../src/auth';
import { config } from '../src/config';
import { pool } from '../src/db';
import { client, newPlayer, rawPost, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(teardown);

const login = async (email: string, password: string) => rawPost('/api/auth/login', { email, password });
const emailOf = async (userId: number) => (await pool.query('SELECT email FROM users WHERE id = $1', [userId])).rows[0].email as string;

describe('oturumlar', () => {
  it('şifre değişince diğer oturumlar kapanır, değiştiren cihaz açık kalır', async () => {
    const p = await newPlayer();
    const email = await emailOf(p.userId);
    const other = client((await login(email, 'gizli12345')).body.token);
    expect((await other.get('/api/me')).status).toBe(200);
    // Yanlış eski şifre: 403 (401 uygulamada oturumu kapatırdı)
    expect((await p.c.post('/api/auth/change-password', { oldPassword: 'yanlis123', newPassword: 'yeniSifre99' })).body.error).toBe('wrong_password');
    expect((await p.c.post('/api/auth/change-password', { oldPassword: 'gizli12345', newPassword: 'gizli12345' })).body.error).toBe('same_password');
    expect((await p.c.post('/api/auth/change-password', { oldPassword: 'gizli12345', newPassword: 'yeniSifre99' })).status).toBe(200);
    expect((await p.c.get('/api/me')).status).toBe(200);
    expect((await other.get('/api/me')).status).toBe(401);
    expect((await login(email, 'gizli12345')).status).toBe(401);
    expect((await login(email, 'yeniSifre99')).status).toBe(200);
  });

  it('mutlak süre dolan oturum düşer ve silinir', async () => {
    const p = await newPlayer();
    await pool.query(`UPDATE sessions SET valid_from = now() - interval '91 days', last_used = now() WHERE user_id = $1`, [p.userId]);
    const r = await p.c.get('/api/me');
    expect(r.status).toBe(401);
    expect(r.body.error).toBe('session_expired');
    expect((await pool.query('SELECT count(*)::int AS n FROM sessions WHERE user_id = $1', [p.userId])).rows[0].n).toBe(0);
  });

  it('boşta süre: 30 günden uzun kullanılmayan oturum düşer, kullanılan sürer', async () => {
    const idle = await newPlayer();
    await pool.query(`UPDATE sessions SET valid_from = now() - interval '40 days', last_used = now() - interval '31 days' WHERE user_id = $1`, [idle.userId]);
    expect((await idle.c.get('/api/me')).status).toBe(401);
    const active = await newPlayer();
    await pool.query(`UPDATE sessions SET valid_from = now() - interval '80 days', last_used = now() - interval '2 days' WHERE user_id = $1`, [active.userId]);
    expect((await active.c.get('/api/me')).status).toBe(200);
  });

  it('migration öncesi oturumlar bir anda düşmez: süreleri migration anından başlar', async () => {
    // Eski oturum: bir yıl önce açılmış, iki ay kullanılmamış; migration 026 valid_from = now() yazar
    const p = await newPlayer();
    await pool.query(`UPDATE sessions SET created_at = now() - interval '365 days', last_used = now() - interval '60 days', valid_from = now() WHERE user_id = $1`, [p.userId]);
    expect((await p.c.get('/api/me')).status).toBe(200);
  });

  it('süreler ortam değişkeniyle ayarlanır; 0 sınırsız', async () => {
    const p = await newPlayer();
    await pool.query(`UPDATE sessions SET valid_from = now() - interval '400 days', last_used = now() - interval '200 days' WHERE user_id = $1`, [p.userId]);
    const prev = [config.sessionMaxDays, config.sessionIdleDays];
    config.sessionMaxDays = 0;
    config.sessionIdleDays = 0;
    try {
      expect((await p.c.get('/api/me')).status).toBe(200);
    } finally {
      [config.sessionMaxDays, config.sessionIdleDays] = prev;
    }
    expect((await p.c.get('/api/me')).status).toBe(401);
  });

  it('zamanlayıcı süresi dolmuş oturumları temizler', async () => {
    const p = await newPlayer();
    await pool.query(`UPDATE sessions SET valid_from = now() - interval '100 days' WHERE user_id = $1`, [p.userId]);
    expect(await purgeExpiredSessions()).toBeGreaterThanOrEqual(1);
    expect((await pool.query('SELECT count(*)::int AS n FROM sessions WHERE user_id = $1', [p.userId])).rows[0].n).toBe(0);
  });
});

describe('yönetici yükseltmesi', () => {
  it('ADMIN_EMAILS adresiyle kayıt olmak yönetici yapmaz', async () => {
    const prev = config.adminEmails;
    config.adminEmails = ['patron@test.com'];
    try {
      const r = await rawPost('/api/auth/register', { email: 'patron@test.com', password: 'gizli12345', acceptTerms: true });
      expect(r.status).toBe(200);
      expect(r.body.user.isAdmin).toBe(false);
      expect((await client(r.body.token).get('/api/admin/stats')).status).toBe(403);
    } finally {
      config.adminEmails = prev;
    }
  });

  it('claim-admin: listede olmak ve gizli kod birlikte gerekir; kod ayarlı değilse kapalı', async () => {
    const prevEmails = config.adminEmails;
    const prevSecret = config.adminClaimSecret;
    try {
      const reg = await rawPost('/api/auth/register', { email: 'sahip@test.com', password: 'gizli12345', acceptTerms: true });
      const owner = client(reg.body.token);
      const stranger = client((await rawPost('/api/auth/register', { email: 'yabanci@test.com', password: 'gizli12345', acceptTerms: true })).body.token);
      config.adminEmails = ['sahip@test.com'];
      config.adminClaimSecret = '';
      expect((await owner.post('/api/auth/claim-admin', { secret: 'x' })).status).toBe(404);
      config.adminClaimSecret = 'cok-gizli-kod';
      expect((await owner.post('/api/auth/claim-admin', { secret: 'yanlis' })).status).toBe(403);
      expect((await stranger.post('/api/auth/claim-admin', { secret: 'cok-gizli-kod' })).status).toBe(403);
      const ok = await owner.post('/api/auth/claim-admin', { secret: 'cok-gizli-kod' });
      expect(ok.status).toBe(200);
      expect((await owner.get('/api/admin/stats')).status).toBe(200);
    } finally {
      config.adminEmails = prevEmails;
      config.adminClaimSecret = prevSecret;
    }
  });

  it('mevcut yönetici kilitlenmez: yetki kayıtta kalır', async () => {
    const p = await newPlayer();
    await pool.query('UPDATE users SET is_admin = TRUE WHERE id = $1', [p.userId]);
    expect((await p.c.get('/api/admin/stats')).status).toBe(200);
  });
});
