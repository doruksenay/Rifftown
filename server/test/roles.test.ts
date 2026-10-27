// Yeni grup rolleri: saksofon, keman, perküsyon
import {
  CORE_ROLES,
  INSTRUMENTS,
  ITEM_BY_ID,
  NPC_BANDS,
  RECIPE_BY_ID,
  ROLE_NAMES,
  ROLE_SKILLS,
  SKILL_BY_ID,
  itemsForShop,
  learnBlocker,
  roleSkill,
  rolesForSkill,
  startingSkills,
} from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pool } from '../src/db';
import { ensureNpcWorld, runNpcDirectorNow } from '../src/game/npc';
import { advance, newPlayer, raw, setMoney, setSkills, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
const NEW_ROLES = ['sax', 'violin', 'percussion'] as const;

describe('rol verisi tek kaynaktan', () => {
  it('her rolün adı, becerileri, dükkân merdiveni, VIP ve atölye eşyası, tarifi var', () => {
    expect(INSTRUMENTS.length).toBe(8);
    expect(CORE_ROLES.length).toBe(5);
    for (const r of INSTRUMENTS) {
      expect(ROLE_NAMES[r].tr && ROLE_NAMES[r].en, r).toBeTruthy();
      expect(SKILL_BY_ID[ROLE_SKILLS[r].basic], `${r} temel`).toBeDefined();
      expect(SKILL_BY_ID[ROLE_SKILLS[r].specific], `${r} asıl`).toBeDefined();
      expect(SKILL_BY_ID[ROLE_SKILLS[r].specific].levelUp, `${r} seviye cümlesi`).toBeDefined();
      const shop = itemsForShop('music_store').filter((i) => i.slot === r);
      expect(shop.map((i) => [i.price, i.bonus])).toEqual(expect.arrayContaining([[150, 3], [900, 7], [4000, 12], [9000, 15]]));
      expect(ITEM_BY_ID[`${r}_crafted`]?.crafted, r).toBe(true);
      expect(RECIPE_BY_ID[r]?.itemId, r).toBe(`${r}_crafted`);
      const s = startingSkills(r, 'jazz');
      expect(roleSkill(s, r)).toBeCloseTo(0.75 * 12 + 0.25 * 20);
    }
    // Yeni roller asıl beceriyi açmak için temel beceri ister
    expect(learnBlocker({}, 'saxophone')).toBe('missing_prereq');
    expect(learnBlocker({ basic_winds: 15 }, 'saxophone')).toBeNull();
    expect(learnBlocker({ basic_strings: 20 }, 'violin')).toBeNull();
    // Çalışma verimi bonusu: temel telli çalgılar keman için de geçerli
    expect(rolesForSkill('basic_strings')).toEqual(expect.arrayContaining(['guitar', 'bass', 'violin']));
    // Oyunun grupları yeni rolleri kullanır
    for (const r of NEW_ROLES) expect(NPC_BANDS.some((b) => b.role === r), r).toBe(true);
  });
});

describe('yeni roller sunucuda', () => {
  it('kemanla karakter açılır; saksofon rolüyle grup kurulur, eşya kuşanılır, kiralık perküsyoncu tutulur, konser çalınır', async () => {
    const v = await newPlayer({ instrument: 'violin' });
    const vs = (await raw(v.character.id)).skills;
    expect(vs).toMatchObject({ basic_strings: 20, violin: 12 });

    const p = await newPlayer({ instrument: 'sax' });
    expect((await raw(p.character.id)).skills).toMatchObject({ basic_winds: 20, saxophone: 12 });
    for (let i = 0; i < 4; i++) await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, $2, 'jazz', 50)`, [p.character.id, `Sax ${i}`]);
    const band = (await p.c.post('/api/bands', { name: `Nefes ${p.character.id}`, genre: 'jazz', role: 'sax' })).body.band;
    expect(band.members[0].role).toBe('sax');
    await setMoney(p.character.id, 3000);
    const buy = await p.c.post('/api/shop/buy', { locationId: 'istanbul-music_store', itemId: 'sax_2' });
    expect(buy.status, JSON.stringify(buy.body)).toBe(200);
    const inv = (await p.c.get('/api/inventory')).body.items;
    const sax = inv.find((i: any) => i.itemId === 'sax_2');
    if (!sax.equipped) expect((await p.c.post(`/api/inventory/${sax.id}/equip`)).status).toBe(200);
    const g = await p.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: band.songs.map((s: any) => s.id), sessionRoles: ['percussion', 'drums'] });
    expect(g.status, JSON.stringify(g.body)).toBe(200);
    expect(g.body.gig.sessionRoles).toEqual(['percussion', 'drums']);
    expect((await p.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 6, setlist: [band.songs[0].id], sessionRoles: ['tuba'] })).status).toBe(400);
    await q(`UPDATE gigs SET starts_at = now() - interval '1 second' WHERE id = $1`, [g.body.gig.id]);
    await advance(1);
    const res = (await q('SELECT status, result FROM gigs WHERE id = $1', [g.body.gig.id])).rows[0];
    expect(res.status).toBe('done');
    expect(res.result.quality).toBeGreaterThan(0);
    // Sahnedeki saksofon yıpranır (rolün yuvası)
    expect(Number((await q(`SELECT wear FROM inventory WHERE character_id = $1 AND item_id = 'sax_2'`, [p.character.id])).rows[0].wear)).toBeGreaterThan(0);
    // Rol değiştirmek de yeni rolleri tanır
    expect((await p.c.post('/api/bands/mine/role', { role: 'violin' })).status).toBe(200);
  });

  it('kemanla sokak müziği yapılır; keman atölyede üretilir; saksofon kitabı nefesli temelini ister', async () => {
    const p = await newPlayer({ instrument: 'violin' });
    const busk = await p.c.post('/api/actions', { kind: 'busk', role: 'violin', hours: 2, locationId: 'istanbul-park' });
    expect(busk.status, JSON.stringify(busk.body)).toBe(200);
    await q(`UPDATE actions SET ends_at = now() WHERE character_id = $1 AND status = 'active'`, [p.character.id]);
    await advance(1);
    expect((await raw(p.character.id)).money).toBeGreaterThan(500);

    await setMoney(p.character.id, 2000);
    expect((await p.c.post('/api/skills/learn', { skillId: 'saxophone', locationId: 'istanbul-bookstore' })).body.error).toBe('missing_prereq');
    expect((await p.c.post('/api/skills/learn', { skillId: 'basic_winds', locationId: 'istanbul-bookstore' })).status).toBe(200);
    for (const m of ['mat_wood', 'mat_strings', 'mat_bow']) expect((await p.c.post('/api/shop/buy', { locationId: 'istanbul-hardware', itemId: m })).status).toBe(200);
    await setSkills(p.character.id, { craftsmanship: 60 });
    expect((await p.c.post('/api/actions', { kind: 'craft', recipe: 'violin', locationId: 'istanbul-hardware' })).status).toBe(200);
    await q(`UPDATE actions SET ends_at = now() WHERE character_id = $1 AND status = 'active'`, [p.character.id]);
    await advance(1);
    const crafted = (await p.c.get('/api/inventory')).body.items.find((i: any) => i.itemId === 'violin_crafted');
    expect(crafted?.bonus).toBeGreaterThan(3);
    // Atölye ürünü dükkâna satılamaz (eski kural yeni rollerde de geçerli)
    expect((await p.c.post('/api/shop/sell', { inventoryId: crafted.id, locationId: 'istanbul-hardware' })).body.error).toBe('crafted_not_sellable');
  });

  it('oyunun grupları yeni rollerde kurulur; eksik roller yalnızca temel kadrodan kiralanır; rol değişirse eşitlenir', async () => {
    await ensureNpcWorld(() => 0.5);
    const isar = (await q(`SELECT b.id, m.role, m.character_id FROM bands b JOIN band_members m ON m.band_id = b.id WHERE b.npc_key = 'munich-star-classical'`)).rows[0];
    expect(isar.role).toBe('violin');
    await q('UPDATE band_members SET role = $2 WHERE band_id = $1', [isar.id, 'keys']);
    await runNpcDirectorNow(() => 0.5);
    expect((await q('SELECT role FROM band_members WHERE band_id = $1', [isar.id])).rows[0].role).toBe('violin');
    const gig = (await q(`SELECT session_roles FROM gigs WHERE band_id = $1 ORDER BY id DESC LIMIT 1`, [isar.id])).rows[0];
    expect([...gig.session_roles].sort()).toEqual([...CORE_ROLES].sort());
  });
});
