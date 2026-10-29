// Karakter nitelikleri ve XP: başlangıç, kazanma tavanları, harcama kuralları, istismar korumaları,
// etkilerin tavanı ve görünürlük.
import {
  ATTR_EFFECTS,
  ATTR_MAX,
  ATTR_START_POINTS,
  ATTR_TOTAL_CAP,
  ATTRIBUTES,
  type AttributeId,
  INSTRUMENTS,
  SCALES,
  XP_DAY_CAP,
  XP_NEW_ACCOUNT_FACTOR,
  XP_WEEK_CAP,
  attrPointCost,
  attrSpendCost,
  attributeRoom,
  attributeSpendBlocker,
  attributeTotal,
  blurValue,
  craftAttrBonus,
  defaultStartAllocation,
  gigXp,
  healthShieldAttr,
  inspirationAttrMult,
  learningAttrMult,
  normalizeAttributes,
  pressAttrBonus,
  recoveryAttrMult,
  roleAttrBonus,
  roleSkill,
  socialAttrMult,
  songwritingAttrBonus,
  startAllocationError,
  startingAttributes,
  tierOf,
  xpAllowance,
  xpCaps,
} from '@rifftown/shared';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pool, tx } from '../src/db';
import { grantXp, xpEarned } from '../src/game/attributes';
import { advance, client, me, newPlayer, raw, setMoney, setVip, setup, teardown } from './helpers';

const full = (v: number) => Object.fromEntries(ATTRIBUTES.map((id) => [id, v])) as Record<AttributeId, number>;
const only = (id: AttributeId, v: number) => ({ ...full(0), [id]: v });

describe('nitelikler: saf kurallar', () => {
  it('başlangıç: 10 taban + ana enstrüman payı + 20 başlangıç puanı, her rolde toplam 90', () => {
    for (const inst of INSTRUMENTS) {
      const a = startingAttributes(inst);
      expect(attributeTotal(a)).toBe(6 * 10 + 10 + ATTR_START_POINTS);
      expect(startAllocationError(defaultStartAllocation(inst) as Record<string, number>)).toBeNull();
    }
    expect(startingAttributes('vocals').voice).toBe(20);
    expect(startingAttributes('guitar').dexterity).toBe(20);
    expect(startingAttributes('guitar').voice).toBe(10);
    // Oyuncunun dağılımı
    const mine = startingAttributes('bass', { charm: 10, voice: 10 });
    expect(mine).toEqual({ charm: 20, voice: 20, creativity: 10, intellect: 10, constitution: 10, dexterity: 20 });
  });

  it('başlangıç dağılımı: toplam tam 20, bir niteliğe en fazla 10, tam sayı, geçerli nitelik', () => {
    expect(startAllocationError({ charm: 10, voice: 10 })).toBeNull();
    expect(startAllocationError({ charm: 5, voice: 5, intellect: 5, dexterity: 5 })).toBeNull();
    expect(startAllocationError({ charm: 20 })).toBe('invalid_start_points');
    expect(startAllocationError({ charm: 10, voice: 9 })).toBe('invalid_start_points');
    expect(startAllocationError({ charm: 10, voice: 11 })).toBe('invalid_start_points');
    expect(startAllocationError({ charm: 10.5, voice: 9.5 })).toBe('invalid_start_points');
    expect(startAllocationError({ charm: -5, voice: 10, intellect: 10, dexterity: 5 })).toBe('invalid_start_points');
    expect(startAllocationError({ luck: 10, voice: 10 })).toBe('invalid_attribute');
    expect(startAllocationError({})).toBe('invalid_start_points');
  });

  it('bedel: seviye yükseldikçe artar; 10 → 100 bir nitelik 240 XP', () => {
    expect([0, 24, 25, 49, 50, 74, 75, 99].map(attrPointCost)).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
    expect(attrSpendCost(10, 90)).toBe(240);
    expect(attrSpendCost(24, 2)).toBe(1 + 2);
    // Geniş-sığ ucuz, dar-derin pahalı: aynı 90 puan altı niteliğe 15'er ya da bir niteliğe
    expect(6 * attrSpendCost(10, 15)).toBeLessThan(attrSpendCost(10, 90));
  });

  it('toplam tavan gerçek bir seçim: ancak üç nitelik tavana çıkar', () => {
    expect(ATTR_TOTAL_CAP).toBeLessThan(ATTRIBUTES.length * ATTR_MAX);
    const three = { charm: 100, voice: 100, creativity: 100, intellect: 10, constitution: 10, dexterity: 10 };
    expect(attributeRoom(three)).toBe(0);
    expect(attributeSpendBlocker(three, 1000, 'intellect', 1)).toBe('attribute_room');
  });

  it('harcama engelleri: geçersiz nitelik ve puan, tavan, oda, XP', () => {
    const a = startingAttributes('guitar');
    expect(attributeSpendBlocker(a, 100, 'luck', 1)).toBe('invalid_attribute');
    expect(attributeSpendBlocker(a, 100, 'charm', 0)).toBe('invalid_points');
    expect(attributeSpendBlocker(a, 100, 'charm', 11)).toBe('invalid_points');
    expect(attributeSpendBlocker(a, 100, 'charm', 1.5)).toBe('invalid_points');
    expect(attributeSpendBlocker({ ...a, charm: 95 }, 100, 'charm', 6)).toBe('attribute_max');
    expect(attributeSpendBlocker(a, 0.99, 'charm', 1)).toBe('not_enough_xp');
    expect(attributeSpendBlocker(a, 1, 'charm', 1)).toBeNull();
  });

  it('her niteliğin gerçek bir etkisi var (vaat edip vermeyen nitelik yok) ve etkiler 100\'de tavanlı', () => {
    const effects: Record<AttributeId, ((a: Record<AttributeId, number>) => number)[]> = {
      charm: [socialAttrMult, pressAttrBonus],
      voice: [(a) => roleAttrBonus(a, 'vocals')],
      creativity: [songwritingAttrBonus, inspirationAttrMult],
      intellect: [learningAttrMult],
      constitution: [healthShieldAttr, recoveryAttrMult],
      dexterity: [(a) => roleAttrBonus(a, 'guitar'), craftAttrBonus],
    };
    for (const id of ATTRIBUTES) {
      expect(Object.keys(ATTR_EFFECTS[id]).length).toBeGreaterThan(0);
      for (const f of effects[id]) {
        // Sıfırdan yüze gerçekten değişir, 100'ün üstünde büyümez, başka nitelik etkilemez
        expect(f(only(id, 100))).toBeGreaterThan(f(full(0)));
        expect(f(only(id, 250))).toBe(f(only(id, 100)));
        for (const other of ATTRIBUTES) if (other !== id) expect(f(only(other, 100))).toBe(f(full(0)));
      }
    }
    // Tavanlar
    expect(socialAttrMult(full(100))).toBeCloseTo(1.15);
    expect(pressAttrBonus(full(100))).toBeCloseTo(0.05);
    expect(roleAttrBonus(full(100), 'vocals')).toBe(4);
    expect(roleAttrBonus(full(100), 'drums')).toBe(4);
    expect(songwritingAttrBonus(full(100))).toBe(4);
    expect(inspirationAttrMult(full(100))).toBeCloseTo(1.1);
    expect(learningAttrMult(full(100))).toBeCloseTo(1.12);
    expect(healthShieldAttr(full(100))).toBeCloseTo(0.15);
    expect(recoveryAttrMult(full(100))).toBeCloseTo(1.15);
    expect(craftAttrBonus(full(100))).toBe(6);
    // Vokal rolüne el becerisi, enstrümana ses etki etmez
    expect(roleAttrBonus(only('dexterity', 100), 'vocals')).toBe(0);
    expect(roleAttrBonus(only('voice', 100), 'guitar')).toBe(0);
    // Niteliği olmayan (oyunun kendi müzisyenleri, kiralık müzisyenler) etkilenmez
    expect(roleAttrBonus({}, 'guitar')).toBe(0);
    expect(songwritingAttrBonus(undefined)).toBe(0);
  });

  it('nitelikler çekirdek becerileri ezmez: tavandaki nitelik çekirdek becerinin küçük bir kesridir', () => {
    // Rol becerisi: asıl enstrüman 0 → 100 rol becerisine +75; nitelik en fazla +4
    expect(roleAttrBonus(full(100), 'guitar')).toBeLessThan(0.1 * (roleSkill({ guitar: 100, basic_strings: 100 }, 'guitar') - roleSkill({}, 'guitar')));
    // Şarkı yazma: temel beste 0 → 100 puana +45; nitelik en fazla +4 (şarkı kalitesine +3,2)
    expect(songwritingAttrBonus(full(100))).toBeLessThan(0.1 * 45);
    // Öğrenme hızı: okul ×2,2 iken zekâ en fazla ×1,12
    expect(learningAttrMult(full(100))).toBeLessThan(1.15);
    // En iyi kurgu (üç nitelik tavanda) bile her etkiyi tek tek tavanında tutar; toplam tavan aşılamaz
    expect(attributeTotal(startingAttributes('vocals'))).toBeLessThan(ATTR_TOTAL_CAP);
  });

  it('kelime ölçeği bedel basamaklarıyla örtüşür: bulanık değer de aynı bedeli gösterir', () => {
    const mins = SCALES.attribute.map((t) => t.min);
    for (const b of [25, 50, 75]) expect(mins).toContain(b);
    for (let v = 0; v <= 100; v += 0.25) {
      const b = blurValue('attribute', v);
      expect(b).toBeLessThanOrEqual(v + 0.05); // blurValue ondalığa yuvarlar
      expect(tierOf('attribute', b).index).toBe(tierOf('attribute', v).index);
      if (v < 100) expect(attrPointCost(b)).toBe(attrPointCost(v));
    }
  });

  it('XP tavanları: günlük 10, haftalık 50; yeni hesapta %80; negatif ya da fazla verilmez', () => {
    expect(xpAllowance(4, 0, 0)).toBe(4);
    expect(xpAllowance(4, 8, 8)).toBe(2);
    expect(xpAllowance(4, 10, 10)).toBe(0);
    expect(xpAllowance(4, 2, XP_WEEK_CAP - 1)).toBe(1);
    expect(xpAllowance(4, 12, 60)).toBe(0);
    expect(xpAllowance(-3, 0, 0)).toBe(0);
    expect(xpCaps(true)).toEqual({ day: XP_DAY_CAP * XP_NEW_ACCOUNT_FACTOR, week: XP_WEEK_CAP * XP_NEW_ACCOUNT_FACTOR });
    expect(xpAllowance(12, 0, 0, true)).toBe(XP_DAY_CAP * XP_NEW_ACCOUNT_FACTOR);
    expect(gigXp(59)).toBe(3);
    expect(gigXp(60)).toBe(4);
  });

  it('her nitelik sunucu hesaplarına bağlı (kod bağlantısı): etki fonksiyonu oyun kodunda kullanılıyor', () => {
    const dir = path.resolve(__dirname, '../src/game');
    const code = readdirSync(dir)
      .filter((f) => f.endsWith('.ts'))
      .map((f) => readFileSync(path.join(dir, f), 'utf8'))
      .join('\n');
    const wiring: Record<AttributeId, string[]> = {
      charm: ['socialAttrMult(', 'pressAttrBonus('],
      voice: ['roleAttrBonus('],
      creativity: ['songwritingAttrBonus(', 'inspirationAttrMult('],
      intellect: ['learningAttrMult('],
      constitution: ['healthShieldAttr(', 'recoveryAttrMult('],
      dexterity: ['roleAttrBonus(', 'craftAttrBonus('],
    };
    for (const id of ATTRIBUTES) for (const fn of wiring[id]) expect(code.includes(fn), `${id}: ${fn}`).toBe(true);
  });

  it('normalizeAttributes: eksik nitelik 0, sınır dışı değer kırpılır', () => {
    expect(normalizeAttributes({ charm: 140, voice: -3 } as any)).toEqual({ ...full(0), charm: 100, voice: 0 });
    expect(normalizeAttributes(null)).toEqual(full(0));
  });
});

describe('nitelikler ve XP: sunucu', () => {
  beforeAll(setup);
  afterAll(async () => {
    await teardown();
    await pool.end();
  });

  const setAttrs = (id: number, a: Partial<Record<AttributeId, number>>) =>
    pool.query('UPDATE characters SET attributes = attributes || $2::jsonb WHERE id = $1', [id, JSON.stringify(a)]);
  const setXp = (id: number, xp: number) => pool.query('UPDATE characters SET xp = $2 WHERE id = $1', [id, xp]);
  const rawChar = async (id: number) => (await pool.query('SELECT attributes, xp, xp_total, money, health FROM characters WHERE id = $1', [id])).rows[0];

  it('karakter açılırken nitelikler role göre başlar; dağılım verilebilir; geçersiz dağılım reddedilir', async () => {
    const v = await newPlayer({ instrument: 'vocals' });
    expect((await rawChar(v.character.id)).attributes).toEqual(startingAttributes('vocals'));
    expect(v.character.xp).toBe(0);

    const anon = client();
    const reg = await anon.post('/api/auth/register', { email: `nitelik_${Date.now()}@test.com`, password: 'gizli12345', acceptTerms: true });
    const c = client(reg.body.token);
    const base = { name: 'Dagilim Deneme', cityId: 'istanbul', mainInstrument: 'drums' };
    expect((await c.post('/api/character', { ...base, startAttributes: { charm: 15, voice: 5 } })).body.error).toBe('invalid_start_points');
    expect((await c.post('/api/character', { ...base, startAttributes: { luck: 10, voice: 10 } })).body.error).toBe('invalid_attribute');
    expect((await c.post('/api/character', { ...base, startAttributes: { charm: 10, voice: 30 } })).status).toBe(400);
    const ok = await c.post('/api/character', { ...base, startAttributes: { intellect: 10, creativity: 10 } });
    expect(ok.status).toBe(200);
    expect((await rawChar(ok.body.character.id)).attributes).toEqual(startingAttributes('drums', { intellect: 10, creativity: 10 }));
  });

  it('eylemler oyun saati kadar XP verir; yarıda kesilen geçen kadar; dinlenme vermez', async () => {
    const p = await newPlayer();
    await p.c.post('/api/actions', { kind: 'work', locationId: 'istanbul-work', hours: 4 });
    await advance();
    let r = await rawChar(p.character.id);
    expect(r.xp).toBeCloseTo(4, 5);
    expect(r.xp_total).toBeCloseTo(4, 5);
    const notes = (await p.c.get('/api/notifications')).body.notifications;
    expect(notes.find((n: any) => n.kind === 'action_done').data.xp).toBe(4);

    await p.c.post('/api/actions', { kind: 'rest', hours: 2 });
    await advance();
    expect((await rawChar(p.character.id)).xp).toBeCloseTo(4, 5);

    // Yarıda kesilen eylem: yalnızca geçen saat (8 saatlik mesainin hemen kesilmesi neredeyse hiç vermez)
    await pool.query(`UPDATE characters SET energy = 100, energy_at = now() WHERE id = $1`, [p.character.id]);
    await p.c.post('/api/actions', { kind: 'work', locationId: 'istanbul-work', hours: 8 });
    await pool.query(`UPDATE actions SET started_at = now(), ends_at = now() + interval '1 hour' WHERE character_id = $1 AND status = 'active'`, [p.character.id]);
    await p.c.post('/api/actions/cancel');
    r = await rawChar(p.character.id);
    expect(r.xp).toBeLessThan(4 + 0.5);
    const log = (await pool.query('SELECT source, amount FROM xp_log WHERE character_id = $1', [p.character.id])).rows;
    expect(log.some((x) => x.source === 'work')).toBe(true);
    expect(log.some((x) => x.source === 'rest')).toBe(false);
  });

  it('günlük tavan dolunca eylem XP vermez; tavan kalanını verir', async () => {
    const p = await newPlayer();
    // Bugün 8 XP kazanılmış gibi (gelecek tarihli kayıt pencerenin içinde kalır)
    await pool.query(`INSERT INTO xp_log(character_id, amount, source, created_at) VALUES ($1, 8, 'test', now() + interval '1 hour')`, [p.character.id]);
    await p.c.post('/api/actions', { kind: 'work', locationId: 'istanbul-work', hours: 4 });
    await advance();
    expect((await rawChar(p.character.id)).xp).toBeCloseTo(2, 5);
    // Testte oyun günü 24 ms sürdüğü için az önceki kayıt pencereden çıkmış olabilir: tavanı yine gelecek tarihli kayıtla doldur
    await pool.query(`INSERT INTO xp_log(character_id, amount, source, created_at) VALUES ($1, 2, 'test', now() + interval '1 hour')`, [p.character.id]);
    await pool.query(`UPDATE characters SET energy = 100, energy_at = now() WHERE id = $1`, [p.character.id]);
    await p.c.post('/api/actions', { kind: 'work', locationId: 'istanbul-work', hours: 4 });
    await advance();
    expect((await rawChar(p.character.id)).xp).toBeCloseTo(2, 5);
    const st = (await p.c.get('/api/attributes')).body;
    expect(st.xpDay).toBeGreaterThanOrEqual(XP_DAY_CAP);
    expect(st.xpDayCap).toBe(XP_DAY_CAP);
  });

  it('pencereler: son 24 oyun saati ve son 7 oyun günü sayılır, eskisi sayılmaz', async () => {
    const p = await newPlayer();
    await pool.query(
      `INSERT INTO xp_log(character_id, amount, source, created_at) VALUES
         ($1, 3, 'gün', now() + interval '1 hour'),
         ($1, 7, 'hafta', now() - interval '60 milliseconds'),
         ($1, 100, 'eski', now() - interval '1 second')`,
      [p.character.id],
    );
    // Testte 1 oyun saati 1 ms: 60 ms önce = 60 oyun saati (günün dışında, haftanın içinde), 1 sn önce = 41 gün
    const e = await xpEarned(pool, p.character.id);
    expect(e.day).toBe(3);
    expect(e.week).toBe(10);
  });

  it('yeni hesabın XP tavanı düşüktür (ek hesap çiftliğine karşı)', async () => {
    const p = await newPlayer();
    await pool.query(`UPDATE users SET created_at = now() + interval '1 hour' WHERE id = $1`, [p.userId]);
    const st = (await p.c.get('/api/attributes')).body;
    expect(st.newAccount).toBe(true);
    expect(st.xpDayCap).toBe(XP_DAY_CAP * XP_NEW_ACCOUNT_FACTOR);
    expect(st.xpWeekCap).toBe(XP_WEEK_CAP * XP_NEW_ACCOUNT_FACTOR);
    await p.c.post('/api/actions', { kind: 'work', locationId: 'istanbul-work', hours: 8 });
    await advance();
    expect((await rawChar(p.character.id)).xp).toBeCloseTo(XP_DAY_CAP * XP_NEW_ACCOUNT_FACTOR, 5);
  });

  it('oyunun kendi müzisyenleri XP almaz', async () => {
    const p = await newPlayer();
    await pool.query('UPDATE characters SET npc = TRUE WHERE id = $1', [p.character.id]);
    const got = await tx(async (c) => grantXp(c, { id: p.character.id, npc: true }, 5, 'test'));
    expect(got).toBe(0);
    expect((await rawChar(p.character.id)).xp).toBe(0);
  });

  it('konser sahneye çıkan üyeye XP verir', async () => {
    const { c, character, userId } = await newPlayer({ instrument: 'vocals' });
    await setVip(userId);
    for (const title of ['Bir', 'İki']) {
      await c.post('/api/actions', { kind: 'write_song', title, genre: 'pop' });
      await advance();
    }
    const band = (await c.post('/api/bands', { name: 'XP Grubu', genre: 'pop', role: 'vocals' })).body.band;
    await setMoney(character.id, 1000);
    const before = Number((await rawChar(character.id)).xp);
    const gig = await c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: band.songs.map((s: any) => s.id), sessionRoles: ['guitar'] });
    expect(gig.status).toBe(200);
    await advance();
    const done = (await c.get(`/api/gigs/${gig.body.gig.id}`)).body.gig;
    expect(done.status).toBe('done');
    const gained = Number((await rawChar(character.id)).xp) - before;
    expect(gained).toBeCloseTo(gigXp(done.result.quality), 5);
    const note = (await c.get('/api/notifications')).body.notifications.find((n: any) => n.kind === 'gig_done');
    expect(note.data.xp).toBe(gigXp(done.result.quality));
  });

  it('harcama: XP düşer, nitelik artar, para değişmez; kurallar sunucuda denetlenir', async () => {
    const p = await newPlayer({ instrument: 'guitar' });
    const id = p.character.id;
    await setXp(id, 12);
    const money0 = (await rawChar(id)).money;
    const r = await p.c.post('/api/attributes/spend', { attribute: 'charm', points: 5 });
    expect(r.status).toBe(200);
    expect(r.body.cost).toBe(5); // 10 → 15: puan başı 1
    let row = await rawChar(id);
    expect(row.attributes.charm).toBe(15);
    expect(row.xp).toBeCloseTo(7, 5);
    expect(row.money).toBe(money0);
    // Bedel basamağı: 24 → 26 = 1 + 2
    await setAttrs(id, { charm: 24 });
    expect((await p.c.post('/api/attributes/spend', { attribute: 'charm', points: 2 })).body.cost).toBe(3);
    row = await rawChar(id);
    expect(row.xp).toBeCloseTo(4, 5);

    expect((await p.c.post('/api/attributes/spend', { attribute: 'charm', points: 3 })).body.error).toBe('not_enough_xp');
    expect((await p.c.post('/api/attributes/spend', { attribute: 'luck', points: 1 })).status).toBe(400);
    expect((await p.c.post('/api/attributes/spend', { attribute: 'charm', points: 11 })).status).toBe(400);
    expect((await p.c.post('/api/attributes/spend', { attribute: 'charm', points: -1 })).status).toBe(400);
    expect((await p.c.post('/api/attributes/spend', { attribute: 'charm', points: 0.5 })).status).toBe(400);
    await setXp(id, 1000);
    await setAttrs(id, { charm: 99 });
    expect((await p.c.post('/api/attributes/spend', { attribute: 'charm', points: 2 })).body.error).toBe('attribute_max');
    await setAttrs(id, { charm: 100, voice: 100, creativity: 100, intellect: 10, constitution: 10, dexterity: 10 });
    expect((await p.c.post('/api/attributes/spend', { attribute: 'intellect', points: 1 })).body.error).toBe('attribute_room');
    // Hiçbiri XP'yi ya da nitelikleri değiştirmedi
    expect((await rawChar(id)).xp).toBe(1000);
  });

  it('eşzamanlı harcama: XP tek harcamaya yetiyorsa yalnızca biri geçer, XP eksiye düşmez', async () => {
    const p = await newPlayer();
    const id = p.character.id;
    await setXp(id, 5);
    const results = await Promise.all([
      p.c.post('/api/attributes/spend', { attribute: 'charm', points: 5 }),
      p.c.post('/api/attributes/spend', { attribute: 'voice', points: 5 }),
      p.c.post('/api/attributes/spend', { attribute: 'intellect', points: 5 }),
    ]);
    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
    const row = await rawChar(id);
    expect(row.xp).toBeCloseTo(0, 5);
    expect(attributeTotal(row.attributes)).toBe(attributeTotal(startingAttributes('guitar')) + 5);
  });

  it('para ile XP alınamaz ve XP takasla, hediyeyle ya da para göndermeyle taşınmaz (uç yok)', async () => {
    const p = await newPlayer();
    await setMoney(p.character.id, 1_000_000);
    // Harcama yalnızca XP ister; para alan bir parametre yok sayılır
    const r = await p.c.post('/api/attributes/spend', { attribute: 'charm', points: 1, money: 1000 } as any);
    expect(r.body.error).toBe('not_enough_xp');
    expect((await rawChar(p.character.id)).money).toBe(1_000_000);
  });

  it('etkiler sunucuda: zekâ çalışmayı hızlandırır, bünye sağlık kaybını azaltır', async () => {
    const dull = await newPlayer();
    const smart = await newPlayer();
    await setAttrs(dull.character.id, { intellect: 0, constitution: 0 });
    await setAttrs(smart.character.id, { intellect: 100, constitution: 100 });
    for (const p of [dull, smart]) await p.c.post('/api/actions', { kind: 'study', skill: 'guitar', hours: 4 });
    await advance();
    const g0 = (await raw(dull.character.id)).skills.guitar - 12;
    const g1 = (await raw(smart.character.id)).skills.guitar - 12;
    expect(g1 / g0).toBeCloseTo(1.12, 1);

    for (const p of [dull, smart]) {
      await pool.query(`UPDATE characters SET energy = 100, energy_at = now(), health = 100, mood = 80 WHERE id = $1`, [p.character.id]);
      await p.c.post('/api/actions', { kind: 'work', locationId: 'istanbul-work', hours: 8 });
    }
    await advance();
    const h0 = 100 - (await rawChar(dull.character.id)).health;
    const h1 = 100 - (await rawChar(smart.character.id)).health;
    expect(h0).toBeGreaterThan(0);
    expect(h1 / h0).toBeCloseTo(0.85, 2);
  });

  it('çekicilik takılmada arkadaşlığı daha hızlı geliştirir', async () => {
    const gains: number[] = [];
    for (const charm of [0, 100]) {
      const a = await newPlayer();
      const b = await newPlayer();
      await setAttrs(a.character.id, { charm });
      await setVip(a.userId); // kesin artış VIP'e gider (VIP olmayana basamak)
      const r = await a.c.post(`/api/relationships/${b.character.id}/hangout`);
      expect(r.status).toBe(200);
      gains.push(r.body.gain);
    }
    expect(gains[1] / gains[0]).toBeCloseTo(1.15, 2);
  });

  it('görünürlük: VIP olmayana nitelikler kelime adımıyla ve kalan oda 10\'luk adımla gider; VIP ve yönetici ham sayıyı görür', async () => {
    const p = await newPlayer();
    await setAttrs(p.character.id, { charm: 37, voice: 63 });
    const m = (await me(p.c)).character;
    expect(m.attributes.charm).toBe(blurValue('attribute', 37));
    expect(m.attributes.charm).not.toBe(37);
    expect(m.attributes.voice).toBe(blurValue('attribute', 63));
    const st = (await p.c.get('/api/attributes')).body;
    expect(st.attributes.charm).toBe(blurValue('attribute', 37));
    const room = attributeRoom({ ...startingAttributes('guitar'), charm: 37, voice: 63 });
    expect(st.attributeRoom).toBe(Math.floor(room / 10) * 10);
    // Harcama yanıtı da kancadan geçer
    await setXp(p.character.id, 3);
    const sp = (await p.c.post('/api/attributes/spend', { attribute: 'charm', points: 1 })).body;
    expect(sp.character.attributes.charm).toBe(blurValue('attribute', 38));
    expect(sp.state.attributes.charm).toBe(blurValue('attribute', 38));
    expect(sp.state.xp).toBe(1);

    await setVip(p.userId);
    expect((await me(p.c)).character.attributes.charm).toBe(38);
    expect((await p.c.get('/api/attributes')).body.attributeRoom).toBe(room - 1);
  });
});
