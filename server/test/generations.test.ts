// Nesiller: yetişkin çocuğun mirasçı karakter olması, miras ve istismara karşı korumalar.
import {
  CITIES,
  HEIRLOOM_LIMIT,
  HEIR_ATTR_TOTAL,
  HEIR_SKILL_CAP,
  INHERITANCE_CAP,
  ITEMS,
  NEGLECT_DEATH_HOURS,
  START_MONEY,
  estateInheritance,
  heirAttributes,
  heirDefaultName,
  heirSkills,
  startingAttributes,
  startingSkills,
  surnameOf,
} from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { processMortality } from '../src/game/consequences';
import { me, newPlayer, setMoney, setVip, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

type Player = Awaited<ReturnType<typeof newPlayer>>;
const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
/** n oyun saatinin şu anki oyun hızındaki gerçek milisaniyesi */
const gameMs = (hours: number) => (hours * 3_600_000) / config.gameSpeed;

/** Karakteri "eski" yapar: devretmek için en az 14 oyun günü oynanmış olmalı */
async function seasoned(p: Player, days = 30) {
  await q(`UPDATE characters SET created_at = created_at - $2 * interval '1 millisecond' WHERE id = $1`, [p.character.id, gameMs(days * 24)]);
}

/** Bir çocuk kaydı: yaşı oyun yılı (56 oyun günü) cinsinden */
async function addChild(a: number, b: number | null, name: string, years: number) {
  const born = new Date(Date.now() - gameMs(years * 56 * 24));
  const r = await q('INSERT INTO children(parent_a, parent_b, name, born_at) VALUES ($1, $2, $3, $4) RETURNING id', [a, b, name, born]);
  return Number(r.rows[0].id);
}

async function slow<T>(fn: () => Promise<T>): Promise<T> {
  const prev = config.gameSpeed;
  config.gameSpeed = 3600;
  try {
    return await fn();
  } finally {
    config.gameSpeed = prev;
  }
}

const succeed = (p: Player, childId: number, extra: Record<string, unknown> = {}) =>
  p.c.post('/api/succession', { childId, cityId: 'istanbul', mainInstrument: 'guitar', favoriteGenre: 'rock', ...extra });

const charRow = async (id: number) => (await q('SELECT * FROM characters WHERE id = $1', [id])).rows[0];
const totalMoney = async (ids: number[]) =>
  Number((await q('SELECT COALESCE(sum(money + bank), 0)::bigint AS n FROM characters WHERE id = ANY($1::bigint[])', [ids])).rows[0].n);

const normalItem = ITEMS.find((i) => !i.bound && !i.vip && !i.stackable && !i.reward && i.slot === 'guitar')!;
const boundItem = ITEMS.find((i) => i.bound && !i.stackable)!;
const vipItem = ITEMS.find((i) => i.vip && !i.bound && !i.stackable)!;
const bizLoc = CITIES.flatMap((c) => c.locations).find((l) => (l as any).business && l.cityId === 'istanbul')!;

async function giveItem(characterId: number, itemId: string) {
  const def = ITEMS.find((i) => i.id === itemId)!;
  return Number((await q('INSERT INTO inventory(character_id, item_id, slot) VALUES ($1, $2, $3) RETURNING id', [characterId, itemId, def.slot])).rows[0].id);
}

describe('kurallar', () => {
  it('beceri tohumu küçük ve tavanlı; ebeveyni asla aşmaz; VIP ve öncülsüz beceri tohumlanmaz', () => {
    const start = startingSkills('guitar', 'rock');
    const { skills, seeded } = heirSkills(start, { composing: 80, guitar: 100, lyrics: 20, rhetoric: 90, lockpicking: 70, genre_jazz: 40 });
    expect(skills.composing).toBe(HEIR_SKILL_CAP); // 80 × %15 = 12 → tavan 10
    expect(skills.guitar).toBe(start.guitar); // başlangıç (12) tohumdan (10) yüksek: değişmez
    expect(skills.lyrics).toBe(start.lyrics); // 20 × %15 = 3 < 5
    expect(skills.rhetoric).toBeUndefined(); // VIP becerisi
    expect(skills.lockpicking).toBeUndefined(); // öncülü (gizlilik) yok
    expect(skills.genre_jazz).toBe(6);
    for (const [id, v] of Object.entries(seeded)) expect(v).toBeGreaterThan(0), expect(skills[id]).toBeLessThanOrEqual(HEIR_SKILL_CAP);
    // Ebeveyni geçmez: çok düşük seviyede bile
    expect(heirSkills({}, { composing: 4 }).skills.composing).toBeLessThanOrEqual(4);
  });

  it('nitelik tohumu: nitelik başına en fazla 2, toplam en fazla 4, ebeveyni geçmez', () => {
    const start = startingAttributes('guitar');
    const { attributes, seeded } = heirAttributes(start, { charm: 100, voice: 100, creativity: 100, intellect: 100, constitution: 10, dexterity: 15 });
    expect(Object.values(seeded).reduce((s, v) => s + (v ?? 0), 0)).toBe(HEIR_ATTR_TOTAL);
    for (const v of Object.values(seeded)) expect(v).toBeLessThanOrEqual(2);
    // Ebeveyn başlangıçtan zayıfsa hiç pay yok
    expect(heirAttributes(start, { charm: 12 }).seeded).toEqual({});
    expect(heirAttributes(start, null).attributes).toEqual(start);
    // Ebeveynin değerini aşmaz
    const weak = heirAttributes({ ...start, charm: 49 }, { charm: 50 });
    expect(weak.attributes.charm).toBeLessThanOrEqual(50);
    void attributes;
  });

  it('miras ölümdeki kural: yarısı, tavanlı; soyadı ve varsayılan ad', () => {
    expect(estateInheritance(3000)).toBe(1500);
    expect(estateInheritance(1_000_000)).toBe(INHERITANCE_CAP);
    expect(estateInheritance(-5)).toBe(0);
    expect(surnameOf('Doruk Yıldız')).toBe('Yıldız');
    expect(surnameOf('Tekad')).toBe('Tekad');
    expect(surnameOf('Doruk Yıldız', 'Kaya')).toBe('Kaya');
    expect(heirDefaultName('Ada', 'Yıldız')).toBe('Ada Yıldız');
    expect(heirDefaultName('Ada Yıldız', 'Yıldız')).toBe('Ada Yıldız');
  });
});

describe('mirası devret (isteyerek)', () => {
  it('yetişkin çocuk mirasçı olur; ebeveyn emekli; para basılmaz, yalnızca taşınır, bir kez', async () => {
    const p = await newPlayer({ name: 'Selim Yıldız' });
    await seasoned(p);
    await setMoney(p.character.id, 3000);
    await q('UPDATE characters SET bank = 1000, xp = 77, skills = skills || $2::jsonb WHERE id = $1', [p.character.id, JSON.stringify({ composing: 80 })]);
    await q(`INSERT INTO businesses(location_id, owner_id, kind, name, till, upkeep_due) VALUES ($1, $2, 'bar', 'Selim Bar', 2000, now() + interval '1 day')`, [bizLoc.id, p.character.id]);
    const kid = await addChild(p.character.id, null, 'Ada', 20);

    const info = (await p.c.get('/api/family/heirs')).body;
    expect(info.mode).toBe('retire');
    expect(info.inheritance).toBe(3000); // (3000 + 1000 + 2000) / 2
    expect(info.children[0]).toMatchObject({ childId: kid, blocker: null, defaultName: 'Ada Yıldız' });

    const before = await totalMoney([p.character.id]);
    const r = await succeed(p, kid);
    expect(r.status).toBe(200);
    expect(r.body.inheritance).toBe(3000);
    const heir = r.body.character;
    expect(heir.name).toBe('Ada Yıldız');
    expect(heir.money).toBe(START_MONEY + 3000);
    expect(heir.xp).toBe(0); // XP taşınmaz

    // Kullanıcı artık mirasçıyı oynuyor; tek kullanıcı = tek karakter
    const m = await me(p.c);
    expect(m.character.id).toBe(heir.id);
    expect((await q('SELECT count(*)::int AS n FROM characters WHERE user_id = $1', [p.userId])).rows[0].n).toBe(1);

    // Ebeveyn emekli, kullanıcıdan koparıldı; parası sıfırlandı, miras aynı işlemde alındı
    const old = await charRow(p.character.id);
    expect(old.retired_at).not.toBeNull();
    expect(old.dead_at).toBeNull();
    expect(old.user_id).toBeNull();
    expect(Number(old.former_user_id)).toBe(p.userId);
    expect([old.money, old.bank, old.inherited]).toEqual([0, 0, 0]);
    expect((await q('SELECT 1 FROM businesses WHERE owner_id = $1', [p.character.id])).rowCount).toBe(0);
    // Para korunumu: mirasçıya geçen = mal varlığının yarısı; başlangıç parası her yeni karakterdeki gibi
    expect(heir.money - START_MONEY).toBe(Math.floor((before + 2000) / 2));
    expect(heir.money - START_MONEY).toBeLessThan(before + 2000);

    // Soy: aile adı, 2. kuşak, çocuk kaydı ve devreden
    const row = await charRow(heir.id);
    expect(row.family_name).toBe('Yıldız');
    expect(row.generation).toBe(2);
    expect(Number(row.child_id)).toBe(kid);
    expect(Number(row.predecessor_id)).toBe(p.character.id);
    expect(row.skills.composing).toBe(HEIR_SKILL_CAP); // küçük kalıtım, ebeveynin (80) çok altında
    expect(Number((await q('SELECT heir_id FROM children WHERE id = $1', [kid])).rows[0].heir_id)).toBe(heir.id);
    const s = (await q('SELECT * FROM successions WHERE from_id = $1', [p.character.id])).rows;
    expect(s).toHaveLength(1);
    expect(s[0]).toMatchObject({ cause: 'retire', money: 3000, items: 0 });

    // Profil: soy ağacı ve durum
    const other = await newPlayer();
    const prof = (await other.c.get(`/api/characters/${heir.id}`)).body.character;
    expect(prof.lineage).toMatchObject({ familyName: 'Yıldız', generation: 2, predecessor: { characterId: p.character.id, status: 'retired' } });
    expect(prof.lineage.parents.map((x: any) => x.name)).toEqual(['Selim Yıldız']);
    const oldProf = (await other.c.get(`/api/characters/${p.character.id}`)).body.character;
    expect(oldProf.status).toBe('retired');
    expect(oldProf.lineage.heir).toMatchObject({ characterId: heir.id });
    expect(oldProf.children[0]).toMatchObject({ name: 'Ada', characterId: heir.id });

    // Emekli karakter sosyal hedef değildir ve aramada görünmez
    expect((await other.c.post(`/api/friends/${p.character.id}`)).status).toBe(404);
    const found = (await other.c.get('/api/characters?search=Selim')).body.characters;
    expect(found.some((x: any) => x.id === p.character.id)).toBe(false);

    // Miras ikinci kez alınamaz, aynı çocuk ikinci kez mirasçı olamaz
    expect((await q('SELECT sum(inherited)::int AS n FROM characters WHERE former_user_id = $1', [p.userId])).rows[0].n).toBe(0);
    const again = await succeed(p, kid);
    expect(again.status).toBeGreaterThanOrEqual(400);
  });

  it('tavan: büyük servetin en fazla $10.000 kadarı geçer, kalanı oyundan çıkar', async () => {
    const p = await newPlayer();
    await seasoned(p);
    await setMoney(p.character.id, 500_000);
    const kid = await addChild(p.character.id, null, 'Deniz', 19);
    const r = await succeed(p, kid, { name: 'Deniz Varis' });
    expect(r.status).toBe(200);
    expect(r.body.character.money).toBe(START_MONEY + INHERITANCE_CAP);
  });

  it('reşit olmayan çocuk asla mirasçı olamaz (bebek, çocuk, 17 yaşındaki genç)', async () => {
    const p = await newPlayer();
    await seasoned(p);
    for (const years of [0, 8, 17.9]) {
      const kid = await addChild(p.character.id, null, 'Minik', years);
      const r = await succeed(p, kid, { name: `Minik Deneme` });
      expect(r.status).toBe(403);
      expect(r.body.error).toBe('not_adult');
      expect((await me(p.c)).character.id).toBe(p.character.id); // hiçbir şey değişmedi
    }
    const info = (await p.c.get('/api/family/heirs')).body;
    expect(info.children.every((k: any) => k.blocker === 'not_adult')).toBe(true);
    // Onay isteği de reşit olmayan için açılamaz
    expect((await p.c.post(`/api/family/children/${info.children[0].childId}/heir-request`)).body.error).toBe('not_adult');
  });

  it('başkasının çocuğu seçilemez', async () => {
    const p = await newPlayer();
    await seasoned(p);
    const stranger = await newPlayer();
    const kid = await addChild(stranger.character.id, null, 'Yabancı', 20);
    const r = await succeed(p, kid, { name: 'Yabanci Varis' });
    expect(r.status).toBe(404);
    expect(r.body.error).toBe('not_your_child');
  });

  it('ayrılma mantığı ölümle aynı: grup liderliği, ev, makam, adaylık, takas, ilan ve eş', async () => {
    const p = await newPlayer({ name: 'Lider Ebeveyn' });
    const mate = await newPlayer();
    const partner = await newPlayer();
    await seasoned(p);
    const band = (await p.c.post('/api/bands', { name: 'Ayrilma Grubu', genre: 'rock', role: 'guitar' })).body.band;
    await q(`INSERT INTO band_members(band_id, character_id, role, joined_at) VALUES ($1, $2, 'drums', now() - interval '1 day')`, [band.id, mate.character.id]);
    await q(`UPDATE band_members SET joined_at = now() - interval '1 day' WHERE character_id = $1`, [p.character.id]);
    await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 50) ON CONFLICT (band_id, city_id) DO UPDATE SET fame = 50`, [band.id]);
    await q(`INSERT INTO homes(character_id, city_id, home_id, paid_until) VALUES ($1, 'istanbul', 'room', now() + interval '1 day')`, [p.character.id]);
    await q(`INSERT INTO office_holders(city_id, office, character_id) VALUES ('istanbul', 'mayor', $1)`, [p.character.id]);
    const listed = await giveItem(p.character.id, normalItem.id);
    await q('UPDATE inventory SET listed = TRUE WHERE id = $1', [listed]);
    await q(`INSERT INTO listings(seller_id, inventory_id, item_id, price) VALUES ($1, $2, $3, 100)`, [p.character.id, listed, normalItem.id]);
    await q(`INSERT INTO trades(from_id, to_id, give_money) VALUES ($1, $2, 10)`, [p.character.id, mate.character.id]);
    const [a, b] = [p.character.id, partner.character.id].sort((x, y) => x - y);
    await q(`INSERT INTO relationships(a_id, b_id, romance, stage) VALUES ($1, $2, 80, 'married')`, [a, b]);
    await q('INSERT INTO partners(character_id, partner_id) VALUES ($1, $2), ($2, $1)', [p.character.id, partner.character.id]);
    const kid = await addChild(p.character.id, null, 'Kuzey', 22);

    const r = await succeed(p, kid, { name: 'Kuzey Ebeveyn', heirlooms: [listed] });
    expect(r.status).toBe(200);
    const heirId = r.body.character.id;
    expect(Number((await q('SELECT leader_id FROM bands WHERE id = $1', [band.id])).rows[0].leader_id)).toBe(mate.character.id);
    expect((await q('SELECT 1 FROM band_members WHERE character_id = $1', [p.character.id])).rowCount).toBe(0);
    // İsteyerek ayrılmak: üye ayrılma şöhret cezası
    expect((await q(`SELECT fame FROM band_fame WHERE band_id = $1 AND city_id = 'istanbul'`, [band.id])).rows[0].fame).toBeCloseTo(47);
    expect((await q('SELECT 1 FROM homes WHERE character_id = $1', [p.character.id])).rowCount).toBe(0);
    expect((await q('SELECT 1 FROM office_holders WHERE character_id = $1', [p.character.id])).rowCount).toBe(0);
    expect((await q(`SELECT status FROM listings WHERE inventory_id = $1`, [listed])).rows[0].status).toBe('cancelled');
    expect((await q(`SELECT status FROM trades WHERE from_id = $1`, [p.character.id])).rows[0].status).toBe('cancelled');
    expect((await q('SELECT 1 FROM partners WHERE character_id = ANY($1::bigint[])', [[p.character.id, partner.character.id]])).rowCount).toBe(0);
    // İlandan inen eşya yadigâr olarak geçti: el değiştirme kaydıyla, ilansız
    const inv = (await q('SELECT * FROM inventory WHERE id = $1', [listed])).rows[0];
    expect(Number(inv.character_id)).toBe(heirId);
    expect(inv.listed).toBe(false);
    expect(Number(inv.prev_owner)).toBe(p.character.id);
    // Bildirimler: grup arkadaşı ve eş
    expect((await q(`SELECT 1 FROM notifications WHERE character_id = $1 AND kind = 'member_retired'`, [mate.character.id])).rowCount).toBe(1);
    expect((await q(`SELECT 1 FROM notifications WHERE character_id = $1 AND kind = 'partner_retired'`, [partner.character.id])).rowCount).toBe(1);
    // Kayıtlar korunur: grup hâlâ var, eski karakterin satırı duruyor
    expect((await charRow(p.character.id)).name).toBe('Lider Ebeveyn');
  });
});

describe('istismara karşı korumalar', () => {
  it('yeni hesap devredemez', async () => {
    const p = await newPlayer();
    await seasoned(p);
    const kid = await addChild(p.character.id, null, 'Yeni', 20);
    const prev = config.tradeMinAccountHours;
    config.tradeMinAccountHours = 72;
    try {
      const r = await succeed(p, kid, { name: 'Yeni Hesap' });
      expect(r.status).toBe(403);
      expect(r.body.error).toBe('account_too_new');
    } finally {
      config.tradeMinAccountHours = prev;
    }
  });

  it('çok yeni karakter devredemez; kullanıcı başına bekleme süresi var (devir zinciri yok)', () =>
    slow(async () => {
      const p = await newPlayer();
      const kid = await addChild(p.character.id, null, 'Zincir', 20);
      const r = await succeed(p, kid, { name: 'Zincir Bir' });
      expect(r.body.error).toBe('character_too_new');
      await seasoned(p);
      expect((await succeed(p, kid, { name: 'Zincir Bir' })).status).toBe(200);
      // Mirasçının da yetişkin bir çocuğu olsa bile hemen yeniden devredilemez
      const heir = (await me(p.c)).character;
      await q(`UPDATE characters SET created_at = created_at - $2 * interval '1 millisecond' WHERE id = $1`, [heir.id, gameMs(30 * 24)]);
      const grandkid = await addChild(heir.id, null, 'Torun', 20);
      const again = await succeed(p, grandkid, { name: 'Zincir Iki' });
      expect(again.status).toBe(409);
      expect(again.body.error).toBe('succession_cooldown');
      expect((await p.c.get('/api/family/heirs')).body.blocker).toBe('succession_cooldown');
    }));

  it('cezaevinde, davası sürerken, bir işin ortasında ya da hamileyken devredilemez', async () => {
    const p = await newPlayer();
    await seasoned(p);
    const kid = await addChild(p.character.id, null, 'Kacis', 20);
    await q(`UPDATE characters SET jailed_until = now() + interval '1 hour' WHERE id = $1`, [p.character.id]);
    expect((await succeed(p, kid, { name: 'Kacis Yok' })).body.error).toBe('in_jail');
    await q('UPDATE characters SET jailed_until = NULL WHERE id = $1', [p.character.id]);
    const crime = await q(`INSERT INTO crimes(character_id, city_id, location_id, kind, success, loot, status) VALUES ($1, 'istanbul', 'istanbul-park', 'pickpocket', FALSE, 0, 'caught') RETURNING id`, [p.character.id]);
    await q(`INSERT INTO cases(crime_id, suspect_id, city_id, due_at) VALUES ($1, $2, 'istanbul', now() + interval '1 hour')`, [crime.rows[0].id, p.character.id]);
    expect((await succeed(p, kid, { name: 'Kacis Yok' })).body.error).toBe('in_jail');
    await q(`UPDATE cases SET status = 'acquitted' WHERE suspect_id = $1`, [p.character.id]);
    await q(`INSERT INTO actions(character_id, kind, params, ends_at) VALUES ($1, 'rest', '{"hours":8}', now() + interval '1 hour')`, [p.character.id]);
    expect((await succeed(p, kid, { name: 'Kacis Yok' })).body.error).toBe('busy');
    await q(`UPDATE actions SET status = 'done' WHERE character_id = $1`, [p.character.id]);
    await q(`INSERT INTO pregnancies(carrier_id, other_id, source, due_at) VALUES ($1, NULL, 'try', now() + interval '1 hour')`, [p.character.id]);
    expect((await succeed(p, kid, { name: 'Kacis Yok' })).body.error).toBe('pregnancy_active');
    expect((await me(p.c)).character.id).toBe(p.character.id);
  });

  it('diğer ebeveyn başka hesaptaysa onayı gerekir; onun parası, becerisi ve eşyası geçmez', async () => {
    const p = await newPlayer({ name: 'Ebeveyn Bir' });
    const co = await newPlayer({ name: 'Ebeveyn Iki' });
    await seasoned(p);
    await setMoney(p.character.id, 2000);
    await setMoney(co.character.id, 90_000);
    await q('UPDATE characters SET skills = skills || $2::jsonb WHERE id = $1', [co.character.id, JSON.stringify({ lyrics: 100, composing: 100 })]);
    const kid = await addChild(p.character.id, co.character.id, 'Ortak', 21);

    const blocked = await succeed(p, kid, { name: 'Ortak Cocuk' });
    expect(blocked.body.error).toBe('consent_needed');
    expect((await p.c.post(`/api/family/children/${kid}/heir-request`)).body).toMatchObject({ consentNeeded: true, requested: true });
    // Aynı istek bir günde bir kez bildirilir
    await p.c.post(`/api/family/children/${kid}/heir-request`);
    expect((await q(`SELECT count(*)::int AS n FROM notifications WHERE character_id = $1 AND kind = 'heir_consent_request'`, [co.character.id])).rows[0].n).toBe(1);
    // Ret isteği kapatır
    expect((await co.c.post(`/api/family/children/${kid}/heir-consent`, { accept: false })).status).toBe(200);
    expect((await succeed(p, kid, { name: 'Ortak Cocuk' })).body.error).toBe('consent_needed');
    // Yalnızca diğer ebeveyn onaylayabilir; isteyen kendi isteğini onaylayamaz
    await p.c.post(`/api/family/children/${kid}/heir-request`);
    expect((await p.c.post(`/api/family/children/${kid}/heir-consent`, { accept: true })).body.error).toBe('no_request');
    const stranger = await newPlayer();
    expect((await stranger.c.post(`/api/family/children/${kid}/heir-consent`, { accept: true })).status).toBe(404);
    const heirsOfCo = (await co.c.get('/api/family/heirs')).body;
    expect(heirsOfCo.incomingConsents.map((x: any) => x.childId)).toContain(kid);
    expect((await co.c.post(`/api/family/children/${kid}/heir-consent`, { accept: true })).status).toBe(200);

    const coBefore = await charRow(co.character.id);
    const r = await succeed(p, kid, { name: 'Ortak Cocuk' });
    expect(r.status).toBe(200);
    expect(r.body.character.money).toBe(START_MONEY + 1000); // yalnızca devredenin mirası
    const heirRow = await charRow(r.body.character.id);
    expect(heirRow.skills.lyrics).toBe(startingSkills('guitar', 'rock').lyrics); // diğer ebeveynin becerisi tohumlanmadı
    const coAfter = await charRow(co.character.id);
    expect(coAfter.money).toBe(coBefore.money);
    expect(coAfter.user_id).toBe(coBefore.user_id); // diğer ebeveyn etkilenmez
    expect((await q(`SELECT 1 FROM notifications WHERE character_id = $1 AND kind = 'child_became_heir'`, [co.character.id])).rowCount).toBe(1);
  });

  it('aynı çocuk için eşzamanlı iki devirden yalnızca biri geçer (iki ebeveyn de kendi hesabında)', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    await seasoned(a);
    await seasoned(b);
    const kid = await addChild(a.character.id, b.character.id, 'Tek', 25);
    // İki taraf da birbirine onay versin
    await a.c.post(`/api/family/children/${kid}/heir-request`);
    await b.c.post(`/api/family/children/${kid}/heir-consent`, { accept: true });
    const [r1, r2] = await Promise.all([succeed(a, kid, { name: 'Tek Bir' }), succeed(b, kid, { name: 'Tek Iki' })]);
    const ok = [r1, r2].filter((r) => r.status === 200);
    expect(ok).toHaveLength(1);
    expect((await q('SELECT count(*)::int AS n FROM characters WHERE child_id = $1', [kid])).rows[0].n).toBe(1);
  });

  it('aynı kullanıcının eşzamanlı iki devir isteğinden yalnızca biri geçer', async () => {
    const p = await newPlayer();
    await seasoned(p);
    await setMoney(p.character.id, 4000);
    const k1 = await addChild(p.character.id, null, 'Ikiz', 20);
    const k2 = await addChild(p.character.id, null, 'Ikizb', 20);
    const [r1, r2] = await Promise.all([succeed(p, k1, { name: 'Ikiz Bir' }), succeed(p, k2, { name: 'Ikiz Iki' })]);
    expect([r1, r2].filter((r) => r.status === 200)).toHaveLength(1);
    expect((await q('SELECT count(*)::int AS n FROM characters WHERE user_id = $1', [p.userId])).rows[0].n).toBe(1);
    // Miras bir kez: toplam para mal varlığının yarısını aşmaz
    const total = Number((await q('SELECT sum(money)::int AS n FROM characters WHERE user_id = $1 OR former_user_id = $1', [p.userId])).rows[0].n);
    expect(total).toBe(START_MONEY + 2000);
  });

  it('yadigâr kuralları: en fazla 3, kişiye bağlı eşya geçmez, VIP eşyası yalnızca VIP üyeye', async () => {
    const p = await newPlayer();
    await seasoned(p);
    const kid = await addChild(p.character.id, null, 'Miras', 20);
    const ids = [];
    for (let i = 0; i < HEIRLOOM_LIMIT + 1; i++) ids.push(await giveItem(p.character.id, normalItem.id));
    expect((await succeed(p, kid, { name: 'Miras Bir', heirlooms: ids })).body.error).toBe('too_many_heirlooms');
    const bound = await giveItem(p.character.id, boundItem.id);
    expect((await succeed(p, kid, { name: 'Miras Bir', heirlooms: [bound] })).body.error).toBe('item_bound');
    const vip = await giveItem(p.character.id, vipItem.id);
    expect((await succeed(p, kid, { name: 'Miras Bir', heirlooms: [vip] })).body.error).toBe('vip_required');
    const foreign = await giveItem((await newPlayer()).character.id, normalItem.id);
    expect((await succeed(p, kid, { name: 'Miras Bir', heirlooms: [foreign] })).status).toBe(404);
    // Başarısız denemelerin hiçbiri ebeveyni emekliye ayırmadı
    expect((await charRow(p.character.id)).retired_at).toBeNull();
    const heirInfo = (await p.c.get('/api/family/heirs')).body;
    expect(heirInfo.heirlooms.map((x: any) => x.id)).not.toContain(bound);
    expect(heirInfo.heirlooms.map((x: any) => x.id)).not.toContain(vip);
    await setVip(p.userId);
    const r = await succeed(p, kid, { name: 'Miras Bir', heirlooms: [ids[0], vip] });
    expect(r.status).toBe(200);
    expect(r.body.heirlooms).toBe(2);
    const moved = (await q('SELECT id FROM inventory WHERE character_id = $1 ORDER BY id', [r.body.character.id])).rows.map((x) => Number(x.id));
    expect(moved).toEqual([ids[0], vip]);
    // Seçilmeyenler emekli karakterde kalır
    expect((await q('SELECT count(*)::int AS n FROM inventory WHERE character_id = $1', [p.character.id])).rows[0].n).toBe(HEIRLOOM_LIMIT + 1);
  });

  it('mirasçının yaşı çocuğun yaşıdır', async () => {
    const prev = config.agingEnabled;
    config.agingEnabled = true;
    try {
      const p = await newPlayer();
      await seasoned(p);
      const kid = await addChild(p.character.id, null, 'Yasli', 23.5);
      const r = await succeed(p, kid, { name: 'Yasli Varis' });
      expect(r.status).toBe(200);
      expect(r.body.character.age).toBe(23);
    } finally {
      config.agingEnabled = prev;
    }
  });
});

describe('ölümden sonra mirasçı (PERMADEATH)', () => {
  it('ölen karakterin yetişkin çocuğuyla devam edilir; miras bir kez; onay ve bekleme gerekmez', async () => {
    const p = await newPlayer({ name: 'Rahmetli Usta' });
    await setMoney(p.character.id, 3000);
    const keep = await giveItem(p.character.id, normalItem.id);
    const kid = await addChild(p.character.id, null, 'Evlat', 30);
    await addChild(p.character.id, null, 'Kucuk', 5);
    await q(`UPDATE characters SET health = 1, critical_since = now() - $2 * interval '1 millisecond' WHERE id = $1`, [p.character.id, gameMs(NEGLECT_DEATH_HOURS + 1)]);
    config.permadeath = true;
    try {
      await processMortality();
    } finally {
      config.permadeath = false;
    }
    const m = await me(p.c);
    expect(m.character).toBeNull();
    expect(m.death).toMatchObject({ inheritance: 1500 });
    expect(m.heirsAvailable).toBe(1); // küçük olan sayılmaz
    const info = (await p.c.get('/api/family/heirs')).body;
    expect(info.mode).toBe('death');
    expect(info.blocker).toBeNull();
    const r = await succeed(p, kid, { heirlooms: [keep] });
    expect(r.status).toBe(200);
    expect(r.body.character.name).toBe('Evlat Usta');
    expect(r.body.character.money).toBe(START_MONEY + 1500);
    expect((await q('SELECT cause FROM successions WHERE from_id = $1', [p.character.id])).rows[0].cause).toBe('death');
    // Miras ikinci kez alınamaz: düz karakter açmak da artık mümkün değil (karakter var)
    expect((await p.c.post('/api/character', { name: 'Ikinci Hayat', cityId: 'istanbul', mainInstrument: 'guitar' })).status).toBe(409);
    expect((await q('SELECT inherited, estate_claimed FROM characters WHERE id = $1', [p.character.id])).rows[0]).toEqual({ inherited: 0, estate_claimed: true });
  });

  it('ölümden sonra düz yeni karakter açan kullanıcı eski karakterin çocuğuna sonradan geçemez', async () => {
    const p = await newPlayer({ name: 'Unutulan Ebeveyn' });
    const kid = await addChild(p.character.id, null, 'Unutulan', 20);
    await q(`UPDATE characters SET health = 1, critical_since = now() - $2 * interval '1 millisecond' WHERE id = $1`, [p.character.id, gameMs(NEGLECT_DEATH_HOURS + 1)]);
    config.permadeath = true;
    try {
      await processMortality();
    } finally {
      config.permadeath = false;
    }
    const fresh = await p.c.post('/api/character', { name: 'Duz Yeni', cityId: 'istanbul', mainInstrument: 'guitar' });
    expect(fresh.status).toBe(200);
    await seasoned({ ...p, character: fresh.body.character });
    const r = await succeed(p, kid, { name: 'Unutulan Cocuk' });
    expect(r.body.error).toBe('not_your_child');
  });
});

describe('hesap silme ve yönetim paneli', () => {
  it('hesap silinince emekli karakter de silinir, çocuk kaydı korunur; panel önceki karakterleri ve devirleri gösterir', async () => {
    const p = await newPlayer({ name: 'Silinen Ebeveyn' });
    await seasoned(p);
    const kid = await addChild(p.character.id, null, 'Kalan', 20);
    const kid2 = await addChild(p.character.id, null, 'Kardes', 10);
    expect((await succeed(p, kid, { name: 'Kalan Cocuk' })).status).toBe(200);

    const admin = await newPlayer();
    await q('UPDATE users SET is_admin = TRUE WHERE id = $1', [admin.userId]);
    const view = (await admin.c.get(`/api/admin/players/${p.userId}`)).body;
    expect(view.character).toMatchObject({ name: 'Kalan Cocuk', generation: 2, familyName: 'Ebeveyn', predecessorId: p.character.id });
    expect(view.formerCharacters[0]).toMatchObject({ id: p.character.id, status: 'retired', pendingInheritance: 0 });
    expect(view.successions[0]).toMatchObject({ cause: 'retire', from: { id: p.character.id }, to: { name: 'Kalan Cocuk' } });
    const list = (await admin.c.get('/api/admin/users?q=Kalan')).body.users;
    expect(list[0]).toMatchObject({ generation: 2, former_count: 1 });

    expect((await p.c.post('/api/auth/delete-account', { password: 'gizli12345' })).status).toBeLessThan(300);
    expect((await q('SELECT 1 FROM characters WHERE id = $1', [p.character.id])).rowCount).toBe(0);
    expect((await q('SELECT name FROM children WHERE id = ANY($1::bigint[]) ORDER BY id', [[kid, kid2]])).rows.map((r) => r.name)).toEqual(['Kalan', 'Kardes']);
  });
});
