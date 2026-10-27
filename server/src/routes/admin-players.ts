// Yönetim paneli: online oyuncular ve bir oyuncunun tüm alanlarını görüntüleme/düzenleme.
// requireAdmin kancası üst kapsamdan (adminRoutes) devralınır; buradaki hiçbir uç yöneticisiz çalışmaz.
// Yönetici yetkisi (is_admin) bilerek buradan verilemez: sadece ADMIN_EMAILS ya da make-admin ile.

import {
  ATTR_MAX,
  ATTR_TOTAL_CAP,
  ATTRIBUTE_DEFS,
  ATTRIBUTES,
  CITIES,
  INSTRUMENTS,
  LOCATION_BY_ID,
  MAX_SKILL,
  NAME_RE,
  PROFESSION_BY_ID,
  PROFESSIONS,
  SKILL_DEFS,
  energyNow,
  inspirationNow,
  isSkill,
  normalizeAttributes,
} from '@rifftown/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { revokeUserSessions } from '../auth';
import { config } from '../config';
import { many, one, pool, tx } from '../db';
import { fail } from '../errors';
import { idParam, parse } from './util';

/** Panelde "online" sayılma süresi: son istekten bu yana geçen süre */
const ONLINE_MINUTES = 5;

const text = (max: number, single = false) =>
  z
    .string()
    .max(max)
    .transform((v) => (single ? v.replace(/[\u0000-\u001f\u007f]/g, '') : v.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '')).replace(/[​-‏‪-‮⁦-⁩﻿]/g, '').trim());

const userPatch = z
  .object({
    email: z.string().email().max(200).transform((e) => e.trim().toLowerCase()),
    lang: z.enum(['tr', 'en']),
    banned: z.boolean(),
    /** null: VIP'i hemen kapatır */
    vipUntil: z.string().datetime().nullable(),
  })
  .partial();

const characterPatch = z
  .object({
    name: z.string().trim().regex(NAME_RE),
    avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    mainInstrument: z.enum(INSTRUMENTS),
    money: z.number().int().min(0).max(2_000_000_000),
    bank: z.number().int().min(0).max(2_000_000_000),
    mood: z.number().min(0).max(100),
    health: z.number().min(0).max(100),
    energy: z.number().min(0).max(100),
    inspiration: z.number().min(0).max(100),
    cityId: z.string().max(40).nullable(),
    locationId: z.string().max(80).nullable(),
    profession: z.string().max(40).nullable(),
    careerHours: z.number().min(0).max(100000),
    careerRank: z.number().int().min(0).max(3),
    /** null: cezaevinden hemen çıkarır */
    jailedUntil: z.string().datetime().nullable(),
    convictions: z.number().int().min(0).max(1000),
    headline: text(80, true),
    bio: text(1000),
    /** Sadece verilen beceriler değişir; null beceriyi siler (kilitli hâle döner) */
    skills: z.record(z.string().max(60), z.number().min(0).max(MAX_SKILL).nullable()),
    /** Sadece verilen nitelikler değişir (0–100). Yönetici toplam tavanı (330) aşabilir; oyuncu aşamaz. */
    attributes: z.partialRecord(z.enum(ATTRIBUTES), z.number().min(0).max(ATTR_MAX)),
    /** Harcanmamış XP. Ömür boyu toplam (xp_total) değişmez: elle verilen XP tavanlara sayılmaz. */
    xp: z.number().min(0).max(100_000),
  })
  .partial();

export async function adminPlayerRoutes(app: FastifyInstance) {
  /** Panel formları için seçenek listeleri */
  app.get('/admin/meta', async () => ({
    maxSkill: MAX_SKILL,
    instruments: INSTRUMENTS,
    skills: SKILL_DEFS.map((s) => ({ id: s.id, category: s.category, name: s.name.tr })),
    attributes: ATTRIBUTE_DEFS.map((a) => ({ id: a.id, name: a.name.tr })),
    attributeMax: ATTR_MAX,
    attributeTotalCap: ATTR_TOTAL_CAP,
    professions: PROFESSIONS.map((p) => ({ id: p.id, name: p.name.tr })),
    cities: CITIES.map((c) => ({
      id: c.id,
      name: c.name.tr,
      locations: c.locations.map((l) => ({ id: l.id, name: l.name.tr, type: l.type })),
    })),
  }));

  app.get('/admin/online', async () => {
    const counts = await one(
      pool,
      `SELECT
         count(DISTINCT user_id) FILTER (WHERE last_used > now() - make_interval(mins => $1))::int AS online,
         count(DISTINCT user_id) FILTER (WHERE last_used > now() - interval '1 hour')::int AS last_hour,
         count(DISTINCT user_id) FILTER (WHERE last_used > now() - interval '1 day')::int AS last_day
       FROM sessions`,
      [ONLINE_MINUTES],
    );
    const players = await many(
      pool,
      `SELECT u.id AS user_id, u.email, c.id AS character_id, c.name, c.city_id, max(s.last_used) AS last_used
         FROM sessions s JOIN users u ON u.id = s.user_id LEFT JOIN characters c ON c.user_id = u.id
        WHERE s.last_used > now() - make_interval(mins => $1)
        GROUP BY u.id, u.email, c.id, c.name, c.city_id
        ORDER BY max(s.last_used) DESC LIMIT 100`,
      [ONLINE_MINUTES],
    );
    return { onlineMinutes: ONLINE_MINUTES, ...counts, players };
  });

  /** Kullanıcı id'siyle hesap + karakterin tüm alanları */
  app.get('/admin/players/:id', async (req) => {
    const { id } = parse(idParam, req.params);
    return loadPlayer(id);
  });

  app.patch('/admin/players/:id', async (req) => {
    const { id } = parse(idParam, req.params);
    const body = parse(z.object({ user: userPatch.optional(), character: characterPatch.optional() }), req.body);
    const u = body.user ?? {};
    const c = body.character ?? {};
    if (id === req.user!.id && u.banned) fail('invalid_target');

    if (c.cityId) {
      if (!CITIES.some((x) => x.id === c.cityId)) fail('invalid_city');
    }
    if (c.locationId) {
      const loc = LOCATION_BY_ID[c.locationId];
      if (!loc) fail('invalid_location');
      // Mekân verilip şehir verilmediyse şehir mekâna göre ayarlanır, tutarsız konum olmasın
      if (c.cityId && loc!.cityId !== c.cityId) fail('invalid_location');
      if (c.cityId === undefined) c.cityId = loc!.cityId;
    }
    if (c.cityId === null) c.locationId = null;
    if (c.profession && !PROFESSION_BY_ID[c.profession]) fail('invalid_profession');
    if (c.skills) for (const k of Object.keys(c.skills)) if (!isSkill(k)) fail('invalid_skill');

    try {
      await tx(async (db) => {
        const user = await one(db, 'SELECT id FROM users WHERE id = $1 FOR UPDATE', [id]);
        if (!user) fail('not_found', 404);

        // ---- Hesap ----
        const uSets: string[] = [];
        const uVals: unknown[] = [id];
        const setU = (col: string, v: unknown) => {
          uVals.push(v);
          uSets.push(`${col} = $${uVals.length}`);
        };
        if (u.email !== undefined) setU('email', u.email);
        if (u.lang !== undefined) setU('lang', u.lang);
        if (u.banned !== undefined) setU('banned', u.banned);
        if (u.vipUntil !== undefined) {
          setU('vip_until', u.vipUntil ? new Date(u.vipUntil) : null);
          await db.query('INSERT INTO vip_grants(user_id, source, until) VALUES ($1, $2, $3)', [id, 'admin', u.vipUntil ? new Date(u.vipUntil) : new Date()]);
        }
        if (uSets.length) await db.query(`UPDATE users SET ${uSets.join(', ')} WHERE id = $1`, uVals);

        // ---- Karakter ----
        if (Object.keys(c).length) {
          const ch = await one(db, 'SELECT id, skills, attributes FROM characters WHERE user_id = $1 FOR UPDATE', [id]);
          if (!ch) fail('no_character', 404);
          const sets: string[] = [];
          const vals: unknown[] = [ch!.id];
          const set = (col: string, v: unknown, raw?: string) => {
            if (raw) {
              sets.push(`${col} = ${raw}`);
              return;
            }
            vals.push(v);
            sets.push(`${col} = $${vals.length}`);
          };
          if (c.name !== undefined) set('name', c.name);
          if (c.avatarColor !== undefined) set('avatar_color', c.avatarColor);
          if (c.mainInstrument !== undefined) set('main_instrument', c.mainInstrument);
          if (c.money !== undefined) set('money', c.money);
          if (c.bank !== undefined) {
            set('bank', c.bank);
            set('bank_min', c.bank); // faiz tabanı yeni bakiyeyle başlar (elle verilen para hemen faiz getirmez gibi hileli olmasın)
          }
          if (c.mood !== undefined) set('mood', c.mood);
          if (c.health !== undefined) set('health', c.health);
          // Enerji ve ilham zamanla değişir: yeni değer "şimdi"ye sabitlenir
          if (c.energy !== undefined) {
            set('energy', c.energy);
            set('energy_at', null, 'now()');
          }
          if (c.inspiration !== undefined) {
            set('inspiration', c.inspiration);
            set('inspiration_at', null, 'now()');
          }
          if (c.cityId !== undefined) set('city_id', c.cityId);
          if (c.locationId !== undefined) set('location_id', c.locationId);
          if (c.profession !== undefined) set('profession', c.profession);
          if (c.careerHours !== undefined) set('career_hours', c.careerHours);
          if (c.careerRank !== undefined) set('career_rank', c.careerRank);
          if (c.jailedUntil !== undefined) set('jailed_until', c.jailedUntil ? new Date(c.jailedUntil) : null);
          if (c.convictions !== undefined) set('convictions', c.convictions);
          if (c.headline !== undefined) set('headline', c.headline);
          if (c.bio !== undefined) set('bio', c.bio);
          if (c.skills) {
            const next: Record<string, number> = { ...(ch!.skills as Record<string, number>) };
            for (const [k, v] of Object.entries(c.skills)) {
              if (v === null) delete next[k];
              else next[k] = v;
            }
            set('skills', JSON.stringify(next));
          }
          if (c.attributes) set('attributes', JSON.stringify({ ...normalizeAttributes(ch!.attributes), ...c.attributes }));
          if (c.xp !== undefined) set('xp', c.xp);
          if (sets.length) await db.query(`UPDATE characters SET ${sets.join(', ')} WHERE id = $1`, vals);
        }
      });
    } catch (e) {
      const err = e as { code?: string; constraint?: string };
      if (err.code === '23505') fail(err.constraint?.includes('name') ? 'name_taken' : 'email_taken', 409);
      throw e;
    }
    // Banlanan ya da e-postası değişen hesabın oturumları kapanır (kendi e-postanı değiştirirsen yeniden giriş yaparsın)
    if (u.banned || u.email !== undefined) await revokeUserSessions(id);
    req.log.info({ admin: req.user!.id, target: id, user: Object.keys(u), character: Object.keys(c) }, 'yönetici oyuncuyu düzenledi');
    return loadPlayer(id);
  });
}

async function loadPlayer(userId: number) {
  const user = await one(
    pool,
    `SELECT u.id, u.email, u.lang, u.is_admin, u.banned, u.vip_until, u.created_at, u.register_ip, u.terms_accepted_at,
            (SELECT max(last_used) FROM sessions s WHERE s.user_id = u.id) AS last_seen
       FROM users u WHERE u.id = $1`,
    [userId],
  );
  if (!user) fail('not_found', 404);
  const ch = await one(pool, 'SELECT * FROM characters WHERE user_id = $1', [userId]);
  const character = ch
    ? {
        id: ch.id,
        name: ch.name,
        avatarColor: ch.avatar_color,
        mainInstrument: ch.main_instrument,
        money: ch.money,
        bank: ch.bank,
        mood: ch.mood,
        health: ch.health,
        // Enerji ve ilham zamanla değiştiği için şu anki değer gösterilir
        energy: Math.round(energyNow(ch.energy, ch.energy_at, config.gameSpeed)),
        inspiration: Math.round(inspirationNow(ch.inspiration, ch.inspiration_at, config.gameSpeed)),
        cityId: ch.city_id,
        locationId: ch.location_id,
        profession: ch.profession,
        careerHours: ch.career_hours,
        careerRank: ch.career_rank,
        jailedUntil: ch.jailed_until,
        convictions: ch.convictions,
        headline: ch.headline,
        bio: ch.bio,
        avatarVersion: ch.avatar_version,
        skills: ch.skills,
        // Nitelikler her zaman altısıyla (oyunun kendi müzisyenlerinde 0), XP ham değer
        attributes: normalizeAttributes(ch.attributes),
        xp: ch.xp,
        xpTotal: ch.xp_total,
        createdAt: ch.created_at,
      }
    : null;
  return { user, character };
}
