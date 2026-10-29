// /me tek sorguda (playtest O-10): yeni sorgu eski yardımcıların döndürdüğüyle birebir aynı veriyi verir.
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { achievementPoints, achievementQueueIdle } from '../src/game/achievements';
import { businessOf } from '../src/game/business';
import { activeAction, getCharacter, membership, officesOf, toActionDto } from '../src/game/common';
import { inCustody } from '../src/game/crime';
import { homeOf } from '../src/game/homes';
import { hotelOf } from '../src/game/lifestyle';
import { meSnapshot } from '../src/game/me-snapshot';
import { unreadMessages } from '../src/game/social';
import { storedMoodlets } from '../src/game/wellbeing';
import { me, newPlayer, setMoney, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(teardown);
// Yavaş saat (1 oyun saati = 1 sn): test hızında (1 oyun saati = 1 ms) 48 saatlik "Yeni başlangıç" moodlet'i ~48 ms
// yaşar; iki sorgu arasında süresi dolabildiği için karşılaştırma zamanlamaya bağlıydı (CI'da kırmızı).
let prevSpeed = 0;
beforeEach(() => {
  prevSpeed = config.gameSpeed;
  config.gameSpeed = 3600;
});
afterEach(() => {
  config.gameSpeed = prevSpeed;
});

const q = (sql: string, p: unknown[] = []) => pool.query(sql, p);

/** Eylem uçta toActionDto ile dönüştürülür: karşılaştırma da onun üstünden */
const norm = (s: Awaited<ReturnType<typeof meSnapshot>>) => (s ? { ...s, action: s.action ? toActionDto(s.action) : null } : s);

async function legacy(id: number) {
  const ch = await getCharacter(pool, id);
  const m = await membership(pool, id);
  return {
    ch,
    action: await activeAction(pool, id).then((a) => (a ? toActionDto(a) : null)),
    band: m ? { id: Number(m.band_id), name: m.name, genre: m.genre, role: m.role, leaderId: Number(m.leader_id) } : null,
    offices: await officesOf(pool, id),
    inCustody: await inCustody(pool, id),
    achievementPoints: await achievementPoints(pool, id),
    home: await homeOf(pool, id),
    hotel: await hotelOf(pool, id),
    business: await businessOf(pool, id),
    moodlets: await storedMoodlets(pool, id),
    unreadNotifications: (await q('SELECT count(*)::int AS n FROM notifications WHERE character_id = $1 AND NOT read', [id])).rows[0].n,
    pendingInvites: (await q(`SELECT count(*)::int AS n FROM band_invites WHERE character_id = $1 AND status = 'pending'`, [id])).rows[0].n,
    unreadMessages: await unreadMessages(pool, id),
    pendingTrades: (await q(`SELECT count(*)::int AS n FROM trades WHERE to_id = $1 AND status = 'open'`, [id])).rows[0].n,
  };
}

describe('/me tek sorgu', () => {
  it('boş ve dolu karakterde eski yardımcılarla aynı', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    const s0 = await meSnapshot(pool, a.character.id);
    expect(norm(s0)).toEqual(await legacy(a.character.id));
    // Karakter açılışında verilen moodlet iki tarafta da var
    expect(s0!.moodlets.map((m) => m.id)).toContain('fresh_start');

    // Dolu durum: grup, davet, eylem, ev, otel, moodlet, makam, başarım, mesaj, bildirim, dava
    await setMoney(a.character.id, 5000);
    await setMoney(b.character.id, 5000);
    await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'S', 'rock', 40)`, [b.character.id]);
    await b.c.post('/api/bands', { name: 'Anlık Grup', genre: 'rock', role: 'guitar' });
    // Test hızında otel gecesi milisaniyeler sürer: kaydı doğrudan yaz
    await q(`INSERT INTO hotel_stays(character_id, city_id, until) VALUES ($1, 'istanbul', now() + interval '1 day')`, [b.character.id]);
    await b.c.post('/api/bands/mine/invites', { name: a.character.name, role: 'bass' });
    await a.c.post('/api/homes/rent', { homeId: 'room', locationId: 'istanbul-real_estate' });
    await a.c.post('/api/meals', { locationId: 'istanbul-restaurant', mealId: 'chef' });
    await b.c.post(`/api/messages/${a.character.id}`, { text: 'selam' });
    await q(`INSERT INTO office_holders(city_id, office, character_id) VALUES ('ankara', 'mayor', $1) ON CONFLICT DO NOTHING`, [a.character.id]);
    await q(`INSERT INTO character_achievements(character_id, achievement_id) VALUES ($1, 'first_song') ON CONFLICT DO NOTHING`, [a.character.id]);
    await q(`INSERT INTO moodlets(character_id, kind, value, expires_at) VALUES ($1, 'feast', 6, now() + interval '1 hour'), ($1, 'good_talk', 3, now() + interval '2 hours') ON CONFLICT (character_id, kind) DO UPDATE SET expires_at = EXCLUDED.expires_at`, [a.character.id]);
    await a.c.post('/api/actions', { kind: 'rest', hours: 8 });
    const snap = await meSnapshot(pool, a.character.id);
    expect(norm(snap)).toEqual(await legacy(a.character.id));
    expect(snap!.pendingInvites).toBe(1);
    expect(snap!.home).not.toBeNull();
    expect(snap!.moodlets.length, 'moodlets').toBeGreaterThan(0);
    expect(snap!.unreadMessages).toBe(1);
    expect(snap!.achievementPoints).toBeGreaterThan(0);
    expect(snap!.action).not.toBeNull();
    expect(snap!.offices).toEqual([{ cityId: 'ankara', office: 'mayor' }]);
    // Grup üyesi de doğru
    const bs = await meSnapshot(pool, b.character.id);
    expect(norm(bs)).toEqual(await legacy(b.character.id));
    expect(bs!.band?.leaderId).toBe(b.character.id);
    expect(bs!.hotel).not.toBeNull();
  });

  it('/me başarımları arka planda değerlendirir (yanıtı beklemez)', async () => {
    const p = await newPlayer();
    await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Ilk', 'rock', 40)`, [p.character.id]);
    const r = await me(p.c);
    expect(r.character.id).toBe(p.character.id);
    await achievementQueueIdle();
    const got = (await q('SELECT achievement_id FROM character_achievements WHERE character_id = $1', [p.character.id])).rows.map((x) => x.achievement_id);
    expect(got.length).toBeGreaterThan(0);
  });
});
