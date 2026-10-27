// İçerik hacmi (Ekim 2026): tarif, eşya ve beceri verisinin bütünlüğü, ekonomi korkulukları ve yeni mekanizmalar
// (tüketim eşyaları, hediyelik, bakım setleri, beceri eşikli tarifler, atölye efektlerinin bonusu, koleksiyonlar).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  ACHIEVEMENT_BY_ID,
  CITY_BY_ID,
  COLLECTIONS,
  CONSUMABLE_COOLDOWN_HOURS,
  CRAFT_HOURS,
  GEAR_SETS,
  HOSPITAL_HEAL_PER_HOUR,
  HOSPITAL_PRICE_PER_HOUR,
  INSTRUMENTS,
  ITEMS,
  ITEM_BY_ID,
  MAX_GIFT_FRIENDSHIP,
  MAX_ITEM_USE,
  MEAL_BY_ID,
  MEAL_ENERGY,
  NPC_BUY_DAILY,
  RECIPES,
  REPAIR,
  ROLE_SKILLS,
  SELL_BACK_RATE,
  SKILL_BY_ID,
  SKILL_DEFS,
  STAGE_EVENTS,
  TITLES,
  completedCollections,
  itemsForShop,
  meetsRecipeSkill,
  recipeHours,
  skillMult,
  studyPlaceFor,
  CITIES,
  gameHoursToMs,
} from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { evaluateAchievements } from '../src/game/achievements';
import { fxBonusOf } from '../src/game/gigs';
import { npcOffer } from '../src/game/npc-civic';
import { tick } from '../src/worker';
import { newPlayer, setMoney, setSkills, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
const unique = (xs: string[]) => new Set(xs).size === xs.length;
const cost = (materials: Record<string, number>) => Object.entries(materials).reduce((s, [m, n]) => s + ITEM_BY_ID[m].price * n, 0);
const inv = async (c: any) => (await c.get('/api/inventory')).body.items as any[];
const give = (characterId: number, itemId: string, n = 1, bonus: number | null = null) =>
  q(`INSERT INTO inventory(character_id, item_id, slot, bonus) SELECT $1, $2, $3, $4 FROM generate_series(1, $5)`, [characterId, itemId, ITEM_BY_ID[itemId].slot, bonus, n]);

describe('hacim ve kimlikler', () => {
  it('hedefler: en az 140 beceri, 400 eşya, 80 tarif', () => {
    expect(SKILL_DEFS.length).toBeGreaterThanOrEqual(140);
    expect(ITEMS.length).toBeGreaterThanOrEqual(400);
    expect(RECIPES.length).toBeGreaterThanOrEqual(80);
  });

  it('kimlikler benzersiz; tarif kimliği API sınırına (20) sığar; bütün metinler iki dilde dolu', () => {
    expect(unique(SKILL_DEFS.map((s) => s.id))).toBe(true);
    expect(unique(ITEMS.map((i) => i.id))).toBe(true);
    expect(unique(RECIPES.map((r) => r.id))).toBe(true);
    expect(unique(STAGE_EVENTS.map((e) => e.id))).toBe(true);
    expect(unique(COLLECTIONS.map((c) => c.id))).toBe(true);
    expect(unique(GEAR_SETS.map((s) => s.id))).toBe(true);
    const texts = [
      ...SKILL_DEFS.flatMap((s) => [s.name, s.about]),
      ...ITEMS.map((i) => i.name),
      ...RECIPES.map((r) => r.name),
      ...STAGE_EVENTS.flatMap((e) => [e.name, e.about]),
      ...COLLECTIONS.flatMap((c) => [c.name, c.about]),
      ...GEAR_SETS.map((s) => s.name),
      ...TITLES.map((t) => t.name),
    ];
    for (const l of texts) {
      expect(l.tr?.trim(), JSON.stringify(l)).toBeTruthy();
      expect(l.en?.trim(), JSON.stringify(l)).toBeTruthy();
    }
    for (const r of RECIPES) expect(r.id.length, r.id).toBeLessThanOrEqual(20);
    for (const e of STAGE_EVENTS) expect(e.id.length, e.id).toBeLessThanOrEqual(30);
  });
});

describe('beceriler', () => {
  // Kodda adıyla geçen beceriler (kariyer etkileri, meslek şartları, suç, basın vb.)
  const codeFiles = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const full = join(dir, f);
      return statSync(full).isDirectory() ? codeFiles(full) : full.endsWith('.ts') ? [full] : [];
    });
  const code = [...codeFiles(join(__dirname, '../src')), ...codeFiles(join(__dirname, '../../packages/shared/src'))]
    .filter((f) => !f.endsWith('content/skills.ts') && !f.endsWith('shared/src/skills.ts'))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');

  it('ölü beceri yok: her beceri bir etki ağırlığı, sahne olayı, tarif eşiği, rol/tür ya da kod bağlantısıyla oyunda bir şey yapar', () => {
    const roleSkills = new Set(Object.values(ROLE_SKILLS).flatMap((r) => [r.basic, r.specific]));
    const eventSkills = new Set(STAGE_EVENTS.map((e) => e.skill));
    const recipeSkills = new Set(RECIPES.flatMap((r) => (r.skill ? [r.skill.id] : [])));
    const prereqOf = new Set(SKILL_DEFS.flatMap((s) => (s.prereq ? [s.prereq.skill] : [])));
    const dead = SKILL_DEFS.filter(
      (s) =>
        !(s.effects && Object.values(s.effects).some((w) => (w ?? 0) > 0)) &&
        !roleSkills.has(s.id) &&
        !eventSkills.has(s.id) &&
        !recipeSkills.has(s.id) &&
        s.category !== 'genres' &&
        !code.includes(`'${s.id}'`) &&
        // Yalnızca başka bir becerinin öncülü olan temel beceriler (ör. temel nefesli çalgılar)
        !(prereqOf.has(s.id) && s.id.startsWith('basic_')),
    );
    expect(dead.map((s) => s.id)).toEqual([]);
  });

  it('sahne olayları var olan becerilere bağlı; yeni enstrüman becerilerinin her birinin bir olayı var', () => {
    for (const e of STAGE_EVENTS) if (e.skill !== 'role' && e.skill !== 'genre') expect(SKILL_BY_ID[e.skill], e.id).toBeDefined();
    for (const id of ['banjo', 'mandolin', 'baglama', 'cello', 'harp', 'trumpet', 'ney', 'accordion', 'concert_piano', 'theremin', 'beatmaking', 'steelpan', 'yodeling']) {
      expect(STAGE_EVENTS.some((e) => e.skill === id), id).toBe(true);
    }
    for (const e of STAGE_EVENTS) {
      expect(e.bonus).toBeLessThanOrEqual(6);
      expect(e.penalty).toBeGreaterThan(0);
    }
  });

  it('öğrenme yeri, fiyat, öncül ve VIP kilidi tutarlı; öncül zinciri döngüsüz', () => {
    for (const s of SKILL_DEFS) {
      if (s.learn === 'school') expect(studyPlaceFor(s.category), s.id).toBe('school');
      if (s.learn === 'university') expect(studyPlaceFor(s.category), s.id).toBe('university');
      if (s.learn === 'gym') expect(s.id).toBe('fitness');
      if (s.learn === 'book') expect(s.bookPrice, s.id).toBeGreaterThan(0);
      else expect(s.bookPrice, s.id).toBeUndefined();
      if (s.vip && s.learn === 'book') expect(s.bookPrice!, s.id).toBeGreaterThanOrEqual(100);
      if (s.prereq) {
        expect(s.prereq.skill).not.toBe(s.id);
        expect(s.prereq.min).toBeGreaterThan(0);
        expect(s.prereq.min).toBeLessThanOrEqual(60);
      }
      // Döngü yok: öncül zincirini izle
      const seen = new Set<string>();
      for (let cur: string | undefined = s.id; cur; cur = SKILL_BY_ID[cur]?.prereq?.skill) {
        expect(seen.has(cur), `${s.id} döngü`).toBe(false);
        seen.add(cur);
      }
    }
  });

  it('etkiler küçük ve tavanlı: yeni beceriler şarkı yazma, sahne ve kayıt ağırlığını artırmadı (denge ölçümündeki toplamlar)', () => {
    const total = (kind: string) => SKILL_DEFS.reduce((s, d) => s + ((d.effects as any)?.[kind] ?? 0), 0);
    expect(total('songwriting')).toBeCloseTo(0.22, 5);
    expect(total('stage')).toBeCloseTo(0.33, 5);
    expect(total('recording')).toBeCloseTo(0.15, 5);
    // Prova çarpanı tavanı (×1,5) hâlâ doğal üst sınır
    expect(total('rehearsal')).toBeLessThanOrEqual(0.5);
    for (const d of SKILL_DEFS) for (const w of Object.values(d.effects ?? {})) expect(w!).toBeLessThanOrEqual(0.5);
    const all = Object.fromEntries(SKILL_DEFS.map((s) => [s.id, 100]));
    for (const k of ['inspiration', 'pets', 'nutrition', 'remedy', 'social', 'romance', 'busking', 'rehearsal'] as const) expect(skillMult(all, k)).toBeLessThanOrEqual(1.5);
    expect(skillMult({ pet_care: 100 }, 'pets')).toBeCloseTo(1.3);
    expect(skillMult({ nutrition: 100 }, 'nutrition')).toBeCloseTo(1.5);
    expect(skillMult({ poetry: 50 }, 'inspiration')).toBeCloseTo(1.075);
  });
});

describe('tarifler', () => {
  it('ürün ve malzemeler var, beceri eşiği gerçek bir beceri, süre makul; hiçbir tarif kendi ürününü tüketmez', () => {
    for (const r of RECIPES) {
      expect(ITEM_BY_ID[r.itemId], r.id).toBeDefined();
      expect(r.materials[r.itemId], r.id).toBeUndefined();
      for (const [m, n] of Object.entries(r.materials)) {
        expect(ITEM_BY_ID[m]?.slot, `${r.id} ${m}`).toBe('material');
        expect(n).toBeGreaterThan(0);
      }
      if (r.skill) {
        expect(SKILL_BY_ID[r.skill.id], r.id).toBeDefined();
        expect(r.skill.min).toBeGreaterThan(0);
        expect(r.skill.min).toBeLessThanOrEqual(60);
      }
      expect(recipeHours(r)).toBeGreaterThanOrEqual(1);
      expect(recipeHours(r)).toBeLessThanOrEqual(12);
      expect(r.bonus[0]).toBeLessThanOrEqual(r.bonus[1]);
      expect(r.bonus[1], r.id).toBeLessThanOrEqual(16);
    }
    expect(recipeHours(RECIPES.find((r) => r.id === 'guitar')!)).toBe(CRAFT_HOURS);
    // Farklı beceri eşikleri: en az 10 farklı beceri ve üç farklı seviye
    expect(new Set(RECIPES.flatMap((r) => (r.skill ? [r.skill.id] : []))).size).toBeGreaterThanOrEqual(10);
    expect(new Set(RECIPES.flatMap((r) => (r.skill ? [r.skill.min] : []))).size).toBeGreaterThanOrEqual(3);
    // Ara malzemeler başka bir tarifte kullanılıyor; fiyatları kendi malzemelerinin maliyetini aşmaz
    // (tüccar fiyatı malzeme maliyetinden hesaplar, ara malzeme kârı şişirmesin)
    for (const r of RECIPES.filter((x) => ITEM_BY_ID[x.itemId].slot === 'material' && ITEM_BY_ID[x.itemId].crafted)) {
      expect(RECIPES.some((o) => o.materials[r.itemId]), r.id).toBe(true);
      expect(ITEM_BY_ID[r.itemId].price, r.id).toBeLessThanOrEqual(cost(r.materials));
    }
    // Her ürünün bir kullanımı var: kuşanılır, sanat, efekt, tüketim, hediye, bakım, yüzük ya da ara malzeme
    for (const r of RECIPES) {
      const out = ITEM_BY_ID[r.itemId];
      const useful = (INSTRUMENTS as readonly string[]).includes(out.slot) || ['outfit', 'art', 'fx', 'ring'].includes(out.slot) || !!out.use || !!out.gift || !!out.repair || (out.slot === 'material' && !!out.crafted);
      expect(useful, r.id).toBe(true);
    }
  });

  it('para basılamaz: dükkânda da satılan ürünün malzemesi fiyatın en az yarısı; atölye ürünü dükkâna satılmaz; tüccar kârı küçük ve günlük sınırlı', () => {
    for (const r of RECIPES) {
      const out = ITEM_BY_ID[r.itemId];
      if (!out.crafted) {
        // Atölyede yap → dükkâna geri sat döngüsü zarar ettirir
        expect(cost(r.materials), r.id).toBeGreaterThanOrEqual(out.price * SELL_BACK_RATE);
        expect(out.vip, r.id).toBeFalsy();
        continue;
      }
      // Tüccar en iyi üründe bile malzemenin en fazla %25 fazlasını öder; günde NPC_BUY_DAILY ürün
      const best = npcOffer(r.itemId, r.bonus[1] + 1);
      const profit = best - cost(r.materials);
      expect(profit, r.id).toBeLessThanOrEqual(cost(r.materials) * 0.25 + 1);
      expect(profit * NPC_BUY_DAILY, r.id).toBeLessThanOrEqual(200);
    }
    // Atölye ürünleri dükkân rafında değil
    for (const city of CITIES) for (const shop of ['hardware', 'music_store', 'boutique', 'gallery', 'stage_shop'] as const) expect(itemsForShop(shop, city.id).some((i) => i.crafted)).toBe(false);
  });

  it('atölye efektleri sahne efekti tavanını ucuza doldurmaz (puan başı en az $30)', () => {
    for (const r of RECIPES.filter((x) => ITEM_BY_ID[x.itemId].slot === 'fx')) {
      expect(cost(r.materials) / (r.bonus[1] + 1), r.id).toBeGreaterThanOrEqual(25);
      expect(cost(r.materials) / r.bonus[1], r.id).toBeGreaterThanOrEqual(30);
    }
  });
});

describe('eşyalar', () => {
  const shopItems = ITEMS.filter((i) => !i.crafted && !i.reward);

  it('her dükkân eşyası bir rafta; nadir eşyanın şehri var; malzemeler ve tüketimler yığılabilir', () => {
    for (const i of shopItems) {
      const city = i.cityOnly ?? 'istanbul';
      expect(CITY_BY_ID[city], i.id).toBeDefined();
      expect(itemsForShop(i.shop, city).some((x) => x.id === i.id), i.id).toBe(true);
      if (i.slot === 'material' || i.slot === 'consumable') expect(i.stackable, i.id).toBe(true);
    }
  });

  it('tüketim: etkiler küçük, hastaneden ucuza sağlık ve günün yemeğinden ucuza enerji yok', () => {
    const daily = MEAL_BY_ID.daily.price / MEAL_ENERGY.daily;
    for (const i of ITEMS) {
      if (i.slot !== 'consumable') {
        expect(i.use, i.id).toBeUndefined();
        continue;
      }
      expect(i.use, i.id).toBeDefined();
      for (const [k, v] of Object.entries(i.use!)) {
        expect(v, `${i.id} ${k}`).toBeGreaterThan(0);
        expect(v, `${i.id} ${k}`).toBeLessThanOrEqual(MAX_ITEM_USE[k as keyof typeof MAX_ITEM_USE]);
      }
      if (i.crafted) continue;
      if (i.use!.health) expect(i.price / i.use!.health, i.id).toBeGreaterThanOrEqual(HOSPITAL_PRICE_PER_HOUR / HOSPITAL_HEAL_PER_HOUR);
      if (i.use!.energy) expect(i.price / i.use!.energy, i.id).toBeGreaterThan(daily);
    }
    expect(ITEMS.filter((i) => i.slot === 'consumable').length).toBeGreaterThanOrEqual(25);
  });

  it('hediyelik ve bakım setleri tutarlı; tamir kiti ve bakım paketi eski değerlerini korur', () => {
    for (const i of ITEMS) {
      if (i.slot === 'gift') {
        expect(i.gift?.friendship, i.id).toBeGreaterThan(0);
        expect(i.gift!.friendship).toBeLessThanOrEqual(MAX_GIFT_FRIENDSHIP);
      } else expect(i.gift, i.id).toBeUndefined();
      if (i.repair) {
        expect(i.slot, i.id).toBe('material');
        expect(i.repair.wear).toBeGreaterThan(0);
        expect(i.repair.wear).toBeLessThanOrEqual(100);
      }
    }
    expect(ITEM_BY_ID.repair_kit.repair).toEqual({ wear: REPAIR.kitWear });
    expect(ITEM_BY_ID.gear_service.repair).toEqual({ wear: REPAIR.serviceWear, all: true });
  });

  it('merdivenler: evcil hayvanda bonus fiyatla artar; sanatta ve efektte puan başı fiyat en ucuz eski eşyanın altında değil', () => {
    const pets = shopItems.filter((i) => i.slot === 'pet').sort((a, b) => a.price - b.price);
    for (let k = 1; k < pets.length; k++) expect(pets[k].bonus, `${pets[k - 1].id} → ${pets[k].id}`).toBeGreaterThanOrEqual(pets[k - 1].bonus);
    for (const i of shopItems.filter((x) => x.slot === 'art')) expect(i.price / i.bonus, i.id).toBeGreaterThanOrEqual(ITEM_BY_ID.art_1.price / ITEM_BY_ID.art_1.bonus);
    for (const i of shopItems.filter((x) => x.slot === 'fx')) expect(i.price / i.bonus, i.id).toBeGreaterThanOrEqual(ITEM_BY_ID.fx_smoke.price / ITEM_BY_ID.fx_smoke.bonus);
  });

  it('koleksiyonlar: gruplar dolu, eşyalar var, her birinin başarımı var; sezon koleksiyonu dört mevsimi kapsar', () => {
    for (const c of COLLECTIONS) {
      expect(c.groups.length, c.id).toBeGreaterThan(0);
      for (const g of c.groups) {
        expect(g.length, c.id).toBeGreaterThan(0);
        for (const id of g) expect(ITEM_BY_ID[id], `${c.id} ${id}`).toBeDefined();
      }
      expect(ACHIEVEMENT_BY_ID[`collection_${c.id}`], c.id).toBeDefined();
    }
    expect(COLLECTIONS.find((c) => c.id === 'seasons')!.groups.length).toBe(4);
    expect(COLLECTIONS.find((c) => c.id === 'souvenirs')!.groups.length).toBe(CITIES.length);
    const vinyl = COLLECTIONS.find((c) => c.id === 'vinyl')!.groups.flat();
    expect(completedCollections(vinyl.slice(1))).not.toContain('vinyl');
    expect(completedCollections(vinyl)).toContain('vinyl');
    for (const t of TITLES) if (t.achievement) expect(ACHIEVEMENT_BY_ID[t.achievement], t.id).toBeDefined();
  });
});

describe('sunucuda', () => {
  it('beceri eşikli tarif: beceri yoksa reddedilir, varsa tarifin kendi süresiyle başlar', async () => {
    const p = await newPlayer();
    const archtop = RECIPES.find((r) => r.id === 'archtop')!;
    for (const [m, n] of Object.entries(archtop.materials)) await give(p.character.id, m, n);
    const start = () => p.c.post('/api/actions', { kind: 'craft', recipe: 'archtop', locationId: 'istanbul-hardware' });
    expect(meetsRecipeSkill(archtop, {})).toBe(false);
    expect((await start()).body.error).toBe('craft_skill_low');
    // Malzemeler reddedilen denemede harcanmadı
    expect((await inv(p.c)).filter((i) => i.itemId === 'mat_tonewood').length).toBe(1);
    await setSkills(p.character.id, { luthiery: 35 });
    const ok = await start();
    expect(ok.status, JSON.stringify(ok.body)).toBe(200);
    const a = (await q(`SELECT params, extract(epoch FROM ends_at - started_at) * 1000 AS ms FROM actions WHERE character_id = $1 AND status = 'active'`, [p.character.id])).rows[0];
    expect(a.params.recipe).toBe('archtop');
    expect(Number(a.ms)).toBeCloseTo(gameHoursToMs(recipeHours(archtop), config.gameSpeed), -2);
    expect(recipeHours(archtop)).toBe(8);
  });

  it('tüketim eşyası: kullanılınca etki verir ve harcanır; ortak bekleme; beslenme becerisi enerjiyi artırır', async () => {
    const prev = config.gameSpeed;
    config.gameSpeed = 1; // bekleme test boyunca dolmasın
    try {
      const a = await newPlayer({ cityId: 'berlin' });
      const b = await newPlayer({ cityId: 'berlin' });
      await setMoney(a.character.id, 500);
      expect((await a.c.post('/api/shop/buy', { locationId: 'berlin-stage_shop', itemId: 'cons_energydrink', qty: 2 })).status).toBe(200);
      await give(b.character.id, 'cons_energydrink');
      await setSkills(b.character.id, { nutrition: 100 });
      for (const p of [a, b]) await q('UPDATE characters SET energy = 40, energy_at = now(), mood = 50 WHERE id = $1', [p.character.id]);
      const drink = async (p: any) => (await inv(p.c)).find((i) => i.itemId === 'cons_energydrink');
      const use = async (p: any) => p.c.post(`/api/inventory/${(await drink(p)).id}/use`);
      const r = await use(a);
      expect(r.status, JSON.stringify(r.body)).toBe(200);
      expect(r.body).toMatchObject({ ok: true, itemId: 'cons_energydrink' });
      expect(Object.keys(r.body)).not.toContain('energy'); // kesin sayı dönmez
      expect((await use(b)).status).toBe(200);
      const en = async (id: number) => Number((await q('SELECT energy FROM characters WHERE id = $1', [id])).rows[0].energy);
      expect(await en(a.character.id)).toBeCloseTo(52, 0);
      expect(await en(b.character.id)).toBeCloseTo(58, 0);
      // İkinci kullanım beklemede; eşya harcanmadı
      expect((await use(a)).body.error).toBe('consumable_cooldown');
      expect((await inv(a.c)).filter((i) => i.itemId === 'cons_energydrink').length).toBe(1);
      // Bekleme bitince kullanılır
      await q(`UPDATE item_uses SET created_at = now() - ($2::int * interval '1 hour') WHERE character_id = $1`, [a.character.id, CONSUMABLE_COOLDOWN_HOURS + 1]);
      expect((await use(a)).status).toBe(200);
      // Tüketim olmayan eşya kullanılmaz
      await give(a.character.id, 'gift_flowers');
      const flowers = (await inv(a.c)).find((i) => i.itemId === 'gift_flowers');
      expect((await a.c.post(`/api/inventory/${flowers.id}/use`)).body.error).toBe('not_usable');
      // Başkasının eşyası kullanılamaz
      await give(b.character.id, 'cons_coldbrew');
      const other = (await inv(b.c)).find((i) => i.itemId === 'cons_coldbrew');
      expect((await a.c.post(`/api/inventory/${other.id}/use`)).status).toBe(404);
    } finally {
      config.gameSpeed = prev;
    }
  });

  it('hediyelik eşya arkadaşlığa küçük katkı verir, aynı kişiye günde bir kez; sıradan eşya vermez', async () => {
    const prev = config.gameSpeed;
    config.gameSpeed = 1;
    try {
      const a = await newPlayer({ cityId: 'lyon' });
      const b = await newPlayer({ cityId: 'lyon' });
      await give(a.character.id, 'gift_perfume');
      await give(a.character.id, 'gift_flowers');
      await give(a.character.id, 'art_1');
      const friendship = async () => {
        const [x, y] = [a.character.id, b.character.id].sort((m, n) => m - n);
        return Number((await q('SELECT friendship FROM relationships WHERE a_id = $1 AND b_id = $2', [x, y])).rows[0]?.friendship ?? 0);
      };
      const send = async (itemId: string) => {
        const it = (await inv(a.c)).find((i) => i.itemId === itemId);
        return a.c.post('/api/gifts', { toId: b.character.id, inventoryId: it.id });
      };
      expect((await send('art_1')).status).toBe(200);
      expect(await friendship()).toBe(0);
      expect((await send('gift_perfume')).status).toBe(200);
      expect(await friendship()).toBe(ITEM_BY_ID.gift_perfume.gift!.friendship);
      expect((await send('gift_flowers')).status).toBe(200);
      expect(await friendship()).toBe(ITEM_BY_ID.gift_perfume.gift!.friendship);
    } finally {
      config.gameSpeed = prev;
    }
  });

  it('bakım setleri yalnızca kendi yuvalarını onarır; bakım paketi bütün kuşanılmış ekipmanı', async () => {
    const p = await newPlayer();
    const ins = async (itemId: string, wear: number) =>
      (await q(`INSERT INTO inventory(character_id, item_id, slot, equipped, wear) VALUES ($1, $2, $3, TRUE, $4) RETURNING id`, [p.character.id, itemId, ITEM_BY_ID[itemId].slot, wear])).rows[0].id;
    const guitar = await ins('guitar_2', 70);
    const drums = await ins('drums_2', 70);
    await give(p.character.id, 'care_strings', 2);
    await give(p.character.id, 'gear_service');
    const kit = async (itemId: string) => (await inv(p.c)).find((i) => i.itemId === itemId).id;
    expect((await p.c.post('/api/repair', { kitId: await kit('care_strings'), targetId: drums })).body.error).toBe('wrong_repair_kit');
    expect((await p.c.post('/api/repair', { kitId: await kit('care_strings'), targetId: guitar })).status).toBe(200);
    const wear = async (id: number) => Number((await q('SELECT wear FROM inventory WHERE id = $1', [id])).rows[0].wear);
    expect(await wear(guitar)).toBe(30);
    expect((await inv(p.c)).filter((i) => i.itemId === 'care_strings').length).toBe(1);
    // Sarf malzemesi (bakım seti değil) onarım yapmaz
    await give(p.character.id, 'mat_wood');
    expect((await p.c.post('/api/repair', { kitId: await kit('mat_wood'), targetId: guitar })).body.error).toBe('not_repair_kit');
    expect((await p.c.post('/api/repair', { kitId: await kit('gear_service') })).status).toBe(200);
    expect(await wear(guitar)).toBe(0);
    expect(await wear(drums)).toBe(0);
  });

  it('atölye efekti kendi bonusuyla konsere taşınır ve iptalde bonusuyla geri verilir', async () => {
    expect(fxBonusOf({ effects: ['fx_c_ledwall', 'fx_smoke'], effect_bonuses: [6, 2] })).toBe(8);
    expect(fxBonusOf({ effects: ['fx_smoke'], effect_bonuses: null })).toBe(ITEM_BY_ID.fx_smoke.bonus);
    expect(fxBonusOf({ effects: Array(5).fill('fx_c_ledwall'), effect_bonuses: Array(5).fill(6) })).toBe(12);
    const p = await newPlayer({ cityId: 'marseille', instrument: 'vocals' });
    await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Calanques', 'pop', 50)`, [p.character.id]);
    const band = (await p.c.post('/api/bands', { name: `Atelier ${p.character.id}`, genre: 'pop', role: 'vocals' })).body.band;
    await give(p.character.id, 'fx_c_ledwall', 1, 6);
    const fx = (await inv(p.c)).find((i) => i.itemId === 'fx_c_ledwall');
    const prev = config.gameSpeed;
    config.gameSpeed = 3600;
    try {
      const gig = await p.c.post('/api/gigs', { locationId: 'marseille-bar', inHours: 2, setlist: band.songs.map((s: any) => s.id), effects: [fx.id] });
      expect(gig.status, JSON.stringify(gig.body)).toBe(200);
      const row = (await q('SELECT effects, effect_bonuses FROM gigs WHERE id = $1', [gig.body.gig.id])).rows[0];
      expect(row.effects).toEqual(['fx_c_ledwall']);
      expect(row.effect_bonuses).toEqual([6]);
      await p.c.del(`/api/gigs/${gig.body.gig.id}`);
      expect((await inv(p.c)).find((i) => i.itemId === 'fx_c_ledwall')?.bonus).toBe(6);
    } finally {
      config.gameSpeed = prev;
    }
  });

  it('koleksiyon tamamlanınca başarım açılır; atölye ürünü dükkâna satılmaz; yeni beceri kitapçıdan öncülüyle açılır', async () => {
    const p = await newPlayer({ cityId: 'hamburg' });
    for (const g of COLLECTIONS.find((c) => c.id === 'vinyl')!.groups) await give(p.character.id, g[0]);
    expect(await evaluateAchievements(pool, p.character.id)).toContain('collection_vinyl');
    await give(p.character.id, 'gift_c_mixtape');
    const tape = (await inv(p.c)).find((i) => i.itemId === 'gift_c_mixtape');
    expect((await p.c.post('/api/shop/sell', { locationId: 'hamburg-hardware', inventoryId: tape.id })).body.error).toBe('crafted_not_sellable');
    await setMoney(p.character.id, 1000);
    expect((await p.c.post('/api/skills/learn', { skillId: 'jewelry', locationId: 'hamburg-bookstore' })).body.error).toBe('missing_prereq');
    expect((await p.c.post('/api/skills/learn', { skillId: 'metalwork', locationId: 'hamburg-bookstore' })).status).toBe(200);
    expect((await p.c.post('/api/skills/learn', { skillId: 'harp', locationId: 'hamburg-bookstore' })).body.error).toMatch(/vip_required|missing_prereq/);
    // Kitapçının rafında hediyelik ve tüketim eşyası da var
    expect((await p.c.post('/api/shop/buy', { locationId: 'hamburg-bookstore', itemId: 'cons_pocketbook' })).status).toBe(200);
    await tick();
  });
});
