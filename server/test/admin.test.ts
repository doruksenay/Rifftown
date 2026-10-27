// Yönetim paneli: online sayısı, oyuncu arama ve tüm alanları düzenleme
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pool } from '../src/db';
import { newPlayer, raw, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const makeAdmin = async () => {
  const admin = await newPlayer();
  await pool.query('UPDATE users SET is_admin = TRUE WHERE id = $1', [admin.userId]);
  return admin;
};

describe('yönetim: online ve oyuncu düzenleme', () => {
  it('yönetici olmayan online listesine, oyuncu verisine ve düzenlemeye erişemez', async () => {
    const p = await newPlayer();
    const t = await newPlayer();
    expect((await p.c.get('/api/admin/online')).status).toBe(403);
    expect((await p.c.get('/api/admin/meta')).status).toBe(403);
    expect((await p.c.get(`/api/admin/players/${t.userId}`)).status).toBe(403);
    expect((await p.c.patch(`/api/admin/players/${t.userId}`, { character: { money: 99999 } })).status).toBe(403);
  });

  it('online sayısı son isteği olan oyuncuları sayar', async () => {
    const admin = await makeAdmin();
    const p = await newPlayer();
    await p.c.get('/api/me');
    // Eski bir oturum online sayılmaz
    const old = await newPlayer();
    await pool.query(`UPDATE sessions SET last_used = now() - interval '2 hours' WHERE user_id = $1`, [old.userId]);
    const r = await admin.c.get('/api/admin/online');
    expect(r.status).toBe(200);
    const ids = r.body.players.map((x: any) => x.user_id);
    expect(ids).toContain(p.userId);
    expect(ids).toContain(admin.userId);
    expect(ids).not.toContain(old.userId);
    expect(r.body.online).toBeGreaterThanOrEqual(2);
    expect(r.body.last_day).toBeGreaterThanOrEqual(r.body.online);
  });

  it('e-posta ve karakter adıyla aranır, tüm alanlar gelir', async () => {
    const admin = await makeAdmin();
    const t = await newPlayer({ name: 'Aranan Kisi' });
    const byName = await admin.c.get('/api/admin/users?q=Aranan');
    expect(byName.body.users.map((u: any) => u.id)).toContain(t.userId);
    const email = (await pool.query('SELECT email FROM users WHERE id = $1', [t.userId])).rows[0].email;
    const byMail = await admin.c.get(`/api/admin/users?q=${encodeURIComponent(email)}`);
    expect(byMail.body.users).toHaveLength(1);

    const full = await admin.c.get(`/api/admin/players/${t.userId}`);
    expect(full.status).toBe(200);
    expect(full.body.user.email).toBe(email);
    expect(full.body.character.name).toBe('Aranan Kisi');
    expect(full.body.character.skills).toBeTypeOf('object');
    expect(full.body.character.money).toBe(500);
  });

  it('karakter alanlarını (para, beceri, konum, profil...) düzenler; ham değerler yazılır', async () => {
    const admin = await makeAdmin();
    const t = await newPlayer();
    const r = await admin.c.patch(`/api/admin/players/${t.userId}`, {
      character: {
        money: 123456,
        bank: 5000,
        health: 80,
        mood: 70,
        energy: 40,
        cityId: 'ankara',
        profession: null,
        careerRank: 2,
        convictions: 3,
        headline: 'Yönetici başlığı',
        bio: 'Düzeltilmiş açıklama',
        skills: { guitar: 77, composing: 55 },
      },
    });
    expect(r.status).toBe(200);
    const row = (await pool.query('SELECT * FROM characters WHERE id = $1', [t.character.id])).rows[0];
    expect(row.money).toBe(123456);
    expect(row.bank).toBe(5000);
    expect(row.health).toBe(80);
    expect(row.energy).toBe(40);
    expect(row.city_id).toBe('ankara');
    expect(row.location_id).toBeNull();
    expect(row.career_rank).toBe(2);
    expect(row.headline).toBe('Yönetici başlığı');
    expect(row.bio).toBe('Düzeltilmiş açıklama');
    expect((await raw(t.character.id)).skills.guitar).toBe(77);
    expect((await raw(t.character.id)).skills.composing).toBe(55);
    // Yanıt güncel oyuncuyu döner
    expect(r.body.character.money).toBe(123456);
    expect(r.body.character.skills.guitar).toBe(77);
  });

  it('beceriler birleştirilir; null beceriyi siler; geçersiz beceri ve değerler reddedilir', async () => {
    const admin = await makeAdmin();
    const t = await newPlayer();
    const before = await raw(t.character.id);
    const keep = Object.keys(before.skills).find((k) => k !== 'composing')!;
    await admin.c.patch(`/api/admin/players/${t.userId}`, { character: { skills: { composing: 40 } } });
    let now = await raw(t.character.id);
    expect(now.skills.composing).toBe(40);
    expect(now.skills[keep]).toBe(before.skills[keep]); // dokunulmayanlar korunur
    await admin.c.patch(`/api/admin/players/${t.userId}`, { character: { skills: { composing: null } } });
    now = await raw(t.character.id);
    expect(now.skills.composing).toBeUndefined();

    expect((await admin.c.patch(`/api/admin/players/${t.userId}`, { character: { skills: { yok_boyle_beceri: 10 } } })).status).toBe(400);
    expect((await admin.c.patch(`/api/admin/players/${t.userId}`, { character: { skills: { guitar: 101 } } })).status).toBe(400);
    expect((await admin.c.patch(`/api/admin/players/${t.userId}`, { character: { money: -5 } })).status).toBe(400);
    expect((await admin.c.patch(`/api/admin/players/${t.userId}`, { character: { cityId: 'atlantis' } })).status).toBe(400);
    expect((await admin.c.patch(`/api/admin/players/${t.userId}`, { character: { profession: 'yok' } })).status).toBe(400);
  });

  it('nitelikler ve harcanmamış XP: ham değerler gelir, düzenlenir; geçersiz nitelik ve değer reddedilir', async () => {
    const admin = await makeAdmin();
    const t = await newPlayer({ instrument: 'vocals' });
    const full = await admin.c.get(`/api/admin/players/${t.userId}`);
    expect(full.body.character.attributes).toEqual({ charm: 20, voice: 20, creativity: 20, intellect: 10, constitution: 10, dexterity: 10 });
    expect(full.body.character.xp).toBe(0);
    expect(full.body.character.xpTotal).toBe(0);

    const r = await admin.c.patch(`/api/admin/players/${t.userId}`, { character: { attributes: { charm: 37.5, dexterity: 100 }, xp: 45 } });
    expect(r.status).toBe(200);
    // Yönetici ham sayıyı görür (bulanıklaştırma yok); dokunulmayan nitelikler korunur
    expect(r.body.character.attributes).toEqual({ charm: 37.5, voice: 20, creativity: 20, intellect: 10, constitution: 10, dexterity: 100 });
    expect(r.body.character.xp).toBe(45);
    const row = (await pool.query('SELECT attributes, xp, xp_total FROM characters WHERE id = $1', [t.character.id])).rows[0];
    expect(row.attributes.charm).toBe(37.5);
    expect(row.xp).toBe(45);
    expect(row.xp_total).toBe(0); // elle verilen XP ömür boyu toplama ve tavanlara sayılmaz

    expect((await admin.c.patch(`/api/admin/players/${t.userId}`, { character: { attributes: { luck: 10 } } })).status).toBe(400);
    expect((await admin.c.patch(`/api/admin/players/${t.userId}`, { character: { attributes: { charm: 101 } } })).status).toBe(400);
    expect((await admin.c.patch(`/api/admin/players/${t.userId}`, { character: { xp: -1 } })).status).toBe(400);
    expect((await pool.query('SELECT attributes FROM characters WHERE id = $1', [t.character.id])).rows[0].attributes.charm).toBe(37.5);

    // Oyuncu kendisi bu uçla nitelik ya da XP veremez
    expect((await t.c.patch(`/api/admin/players/${t.userId}`, { character: { xp: 9999 } })).status).toBe(403);
  });

  it('enerji elle verilince zaman damgası sıfırlanır (hemen eski değere kaymaz)', async () => {
    const admin = await makeAdmin();
    const t = await newPlayer();
    await pool.query(`UPDATE characters SET energy = 10, energy_at = now() - interval '5 hours' WHERE id = $1`, [t.character.id]);
    const r = await admin.c.patch(`/api/admin/players/${t.userId}`, { character: { energy: 100 } });
    expect(r.body.character.energy).toBe(100);
  });

  it('hesabı düzenler: e-posta, dil, VIP, ban; çakışan ad ve e-posta 409 döner', async () => {
    const admin = await makeAdmin();
    const a = await newPlayer({ name: 'Birinci Kisi' });
    const b = await newPlayer({ name: 'Ikinci Kisi' });

    const email = (await pool.query('SELECT email FROM users WHERE id = $1', [a.userId])).rows[0].email;
    expect((await admin.c.patch(`/api/admin/players/${b.userId}`, { user: { email } })).status).toBe(409);
    expect((await admin.c.patch(`/api/admin/players/${b.userId}`, { character: { name: 'birinci kisi' } })).status).toBe(409);
    // Başarısız düzenleme hiçbir şeyi değiştirmez
    expect((await pool.query('SELECT name FROM characters WHERE id = $1', [b.character.id])).rows[0].name).toBe('Ikinci Kisi');

    const until = new Date(Date.now() + 10 * 86400_000).toISOString();
    const r = await admin.c.patch(`/api/admin/players/${b.userId}`, { user: { lang: 'en', vipUntil: until, email: 'yeni.adres@test.com' } });
    expect(r.status).toBe(200);
    expect(r.body.user.lang).toBe('en');
    expect(r.body.user.email).toBe('yeni.adres@test.com');
    expect(new Date(r.body.user.vip_until).getTime()).toBeGreaterThan(Date.now());
    expect((await b.c.get('/api/me')).status).toBe(401); // e-posta değişince oturum kapanır

    await admin.c.patch(`/api/admin/players/${b.userId}`, { user: { vipUntil: null } });
    expect((await pool.query('SELECT vip_until FROM users WHERE id = $1', [b.userId])).rows[0].vip_until).toBeNull();

    expect((await admin.c.patch(`/api/admin/players/${a.userId}`, { user: { banned: true } })).status).toBe(200);
    expect((await a.c.get('/api/me')).status).toBe(401);
  });

  it('yönetici yetkisi panelden verilemez; kendini banlayamaz', async () => {
    const admin = await makeAdmin();
    const t = await newPlayer();
    await admin.c.patch(`/api/admin/players/${t.userId}`, { user: { isAdmin: true } as any });
    expect((await pool.query('SELECT is_admin FROM users WHERE id = $1', [t.userId])).rows[0].is_admin).toBe(false);
    expect((await admin.c.patch(`/api/admin/players/${admin.userId}`, { user: { banned: true } })).status).toBe(400);
  });

  it('meta: beceri, şehir ve meslek listelerini verir', async () => {
    const admin = await makeAdmin();
    const m = await admin.c.get('/api/admin/meta');
    expect(m.status).toBe(200);
    expect(m.body.maxSkill).toBe(100);
    expect(m.body.skills.some((s: any) => s.id === 'guitar')).toBe(true);
    expect(m.body.cities.find((c: any) => c.id === 'istanbul').locations.length).toBeGreaterThan(0);
    expect(m.body.professions.length).toBeGreaterThan(0);
    expect(m.body.attributes.map((a: any) => a.id)).toEqual(['charm', 'voice', 'creativity', 'intellect', 'constitution', 'dexterity']);
    expect(m.body.attributeMax).toBe(100);
    expect(m.body.attributeTotalCap).toBe(330);
  });
});
