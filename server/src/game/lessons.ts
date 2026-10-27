// Özel ders ve ilişkiye dayalı öğrenme (kurallar: packages/shared/src/lessons.ts).
// Ders süreli 'lesson' eylemidir. Ücret, öğretmenin payı, kontenjanlar ve öğretenin küçük kazancı
// eylem başlarken tek veritabanı işleminde uygulanır; iki karakter id sırasıyla kilitlenir (startAction).
// Sömürü korumaları: kendine ders yok, yeni hesap kısıtı, engelleme, ikili başına bekleme ve günlük kontenjan,
// öğretmenin günlük kazanç tavanı ve okulun kestiği pay (para oyundan çıkar), öğrenci öğretmeni geçemez.

import {
  FRIEND_DAILY_HOURS,
  FRIEND_FORBIDDEN_CATEGORIES,
  FRIEND_LESSON_FRIENDSHIP,
  FRIEND_MARGIN,
  FRIEND_PAIR_COOLDOWN_HOURS,
  HOUR_OPTIONS,
  LESSON_INVITE_COOLDOWN_HOURS,
  LESSON_RATES,
  LOCATION_BY_ID,
  PRIVATE_DAILY_HOURS,
  PROFESSOR_PRICE_PER_HOUR,
  PROFESSORS,
  SKILL_BY_ID,
  type StartActionRequest,
  TEACHER_DAILY_EARN_CAP,
  TEACHER_FEE_CUT,
  TEACHER_MARGIN,
  TEACHER_PRICE_RANGE,
  TEACHER_REINFORCE_PER_HOUR,
  type TutorKind,
  diminishing,
  friendRate,
  gameHoursToMs,
  knows,
  lv,
  priceFor,
  professorFor,
  rankFor,
  studyPlaceFor,
  teacherRate,
  CITY_BY_ID,
} from '@rifftown/shared';
import type pg from 'pg';
import { config } from '../config';
import { type Db, many, one, tx } from '../db';
import { fail } from '../errors';
import { type CharacterRow, isJailed, lockCharacter, notify, requireEstablished } from './common';
import { isBlocked, pair, requirePlayer } from './social';

const hoursMs = (h: number) => gameHoursToMs(h, config.gameSpeed);
const since = (h: number) => new Date(Date.now() - hoursMs(h));

type LessonReq = Extract<StartActionRequest, { kind: 'lesson' }>;

async function usedHours(db: Db, studentId: number, kinds: string[]) {
  const r = await one(db, `SELECT COALESCE(sum(hours), 0) AS h FROM lesson_log WHERE student_id = $1 AND kind = ANY($2::text[]) AND created_at > $3`, [studentId, kinds, since(24)]);
  return Number(r?.h ?? 0);
}

async function relationOf(db: Db, x: number, y: number) {
  const [a, b] = pair(x, y);
  return one(db, 'SELECT friendship, stage FROM relationships WHERE a_id = $1 AND b_id = $2', [a, b]);
}

/**
 * Ders başlarken: kuralları denetler, ücreti ve öğretmenin payını hesaplar, öğretmene ödemeyi ve kaydı yapar.
 * Öğrencinin parası startAction'da (cost) düşülür; aynı işlem içinde olduğu için biri başarısız olursa hepsi geri alınır.
 * Karakterler çağırmadan önce id sırasıyla kilitlenmiş olmalı (startAction yapar).
 */
export async function prepareLesson(c: pg.PoolClient, char: CharacterRow, req: LessonReq) {
  const def = SKILL_BY_ID[req.skill];
  if (!def) fail('invalid_skill');
  const hours = req.hours;
  if (!(HOUR_OPTIONS.lesson as readonly number[]).includes(hours)) fail('invalid_hours');
  // Özel ders beceriyi açmaz; yalnızca bilinen beceri geliştirilir
  if (!knows(char.skills, req.skill)) fail('skill_not_known');
  const level = lv(char.skills, req.skill);
  const city = CITY_BY_ID[char.city_id!];
  const tutor = req.tutor as TutorKind;

  if (tutor === 'professor') {
    const loc = typeof req.locationId === 'string' ? LOCATION_BY_ID[req.locationId] : undefined;
    const place = studyPlaceFor(def!.category);
    if (!loc || !place || loc.type !== place) fail('invalid_location');
    if (loc!.cityId !== char.city_id) fail('not_in_city');
    const prof = professorFor(char.city_id!, def!.category);
    if (!prof || prof.place !== loc!.type) fail('no_professor');
    if (level >= prof.maxLevel) fail('tutor_level_too_low');
    if ((await usedHours(c, char.id, ['professor', 'teacher'])) + hours > PRIVATE_DAILY_HOURS) fail('lesson_quota', 409);
    const cost = priceFor(PROFESSOR_PRICE_PER_HOUR[prof.place], city, hours);
    if (char.money < cost) fail('not_enough_money');
    await c.query(`INSERT INTO lesson_log(student_id, kind, professor_id, skill, hours, fee) VALUES ($1, 'professor', $2, $3, $4, $5)`, [char.id, prof.id, req.skill, hours, cost]);
    return { hours, cost, locationId: loc!.id, params: { skill: req.skill, tutor, professorId: prof.id, rate: LESSON_RATES.professor, cap: prof.maxLevel } };
  }

  // Oyuncu öğretmen ya da arkadaş: karşı taraf gerçek bir oyuncu
  const tutorId = Number(req.tutorId);
  if (!Number.isInteger(tutorId) || tutorId <= 0) fail('invalid_target');
  if (tutorId === char.id) fail('invalid_target');
  await requirePlayer(c, tutorId);
  if (await isBlocked(c, char.id, tutorId)) fail('blocked', 403);
  const t = await lockCharacter(c, tutorId); // startAction id sırasıyla zaten kilitledi; burada yalnızca okunur
  if (!t.city_id || t.city_id !== char.city_id) fail('not_in_same_city');
  if (isJailed(t)) fail('in_jail', 409);
  const tLevel = lv(t.skills, req.skill);

  if (tutor === 'teacher') {
    await requireEstablished(c, char.id);
    await requireEstablished(c, tutorId);
    if (t.profession !== 'music_teacher' || t.lesson_price == null) fail('not_a_teacher');
    if (def!.category === 'career' || def!.category === 'crime' || studyPlaceFor(def!.category) !== 'school') fail('teacher_wrong_subject');
    const school = `${char.city_id}-school`;
    // Öğretmen de öğrenci de müzik okulunda olmalı
    if (t.location_id !== school || (req.locationId && req.locationId !== school)) fail('teacher_not_here', 409);
    if (tLevel < level + TEACHER_MARGIN) fail('tutor_level_too_low');
    if ((await usedHours(c, char.id, ['professor', 'teacher'])) + hours > PRIVATE_DAILY_HOURS) fail('lesson_quota', 409);
    const price = Math.max(TEACHER_PRICE_RANGE[0], Math.min(TEACHER_PRICE_RANGE[1], Number(t.lesson_price)));
    const cost = price * hours;
    if (char.money < cost) fail('not_enough_money');
    const earnedToday = Number(
      (await one(c, 'SELECT COALESCE(sum(teacher_earned), 0) AS n FROM lesson_log WHERE teacher_id = $1 AND created_at > $2', [tutorId, since(24)]))?.n ?? 0,
    );
    // Okul payı oyundan çıkar; öğretmenin günlük kazancı tavanlı (ek hesapla para taşıma yolu olmasın)
    const earned = Math.max(0, Math.min(Math.floor(cost * (1 - TEACHER_FEE_CUT)), TEACHER_DAILY_EARN_CAP - earnedToday));
    const tSkills = reinforce(t.skills, req.skill, hours);
    const careerHours = Number(t.career_hours) + hours * 0.5;
    await c.query('UPDATE characters SET money = money + $2, skills = $3, career_hours = $4, career_rank = $5 WHERE id = $1', [
      tutorId,
      earned,
      JSON.stringify(tSkills),
      careerHours,
      rankFor(careerHours),
    ]);
    await c.query(`INSERT INTO lesson_log(student_id, teacher_id, kind, skill, hours, fee, teacher_earned) VALUES ($1, $2, 'teacher', $3, $4, $5, $6)`, [
      char.id,
      tutorId,
      req.skill,
      hours,
      cost,
      earned,
    ]);
    await notify(c, tutorId, 'lesson_given', { student: char.name, skill: req.skill, hours, earned });
    return { hours, cost, locationId: school, params: { skill: req.skill, tutor, tutorId, rate: teacherRate(Number(t.career_rank)), cap: tLevel } };
  }

  if (tutor !== 'friend') fail('invalid_tutor');
  // Arkadaş ya da sevgili: ücretsiz, ilişki seviyesine bağlı
  if (FRIEND_FORBIDDEN_CATEGORIES.includes(def!.category)) fail('friend_wrong_subject');
  const rel = await relationOf(c, char.id, tutorId);
  const rate = rel ? friendRate(Number(rel.friendship), rel.stage) : 0;
  if (rate <= 0) fail('not_close_enough', 403);
  if (tLevel < level + FRIEND_MARGIN) fail('tutor_level_too_low');
  if ((await usedHours(c, char.id, ['friend'])) + hours > FRIEND_DAILY_HOURS) fail('lesson_quota', 409);
  const recent = await one(
    c,
    `SELECT 1 FROM lesson_log WHERE kind = 'friend' AND created_at > $3 AND ((student_id = $1 AND teacher_id = $2) OR (student_id = $2 AND teacher_id = $1))`,
    [char.id, tutorId, since(FRIEND_PAIR_COOLDOWN_HOURS)],
  );
  if (recent) fail('lesson_cooldown', 409);
  await c.query('UPDATE characters SET skills = $2 WHERE id = $1', [tutorId, JSON.stringify(reinforce(t.skills, req.skill, hours))]);
  const [a, b] = pair(char.id, tutorId);
  await c.query('UPDATE relationships SET friendship = LEAST(100, friendship + $3), updated_at = now() WHERE a_id = $1 AND b_id = $2', [a, b, FRIEND_LESSON_FRIENDSHIP]);
  await c.query(`INSERT INTO lesson_log(student_id, teacher_id, kind, skill, hours) VALUES ($1, $2, 'friend', $3, $4)`, [char.id, tutorId, req.skill, hours]);
  await notify(c, tutorId, 'lesson_given', { student: char.name, skill: req.skill, hours, earned: 0 });
  return { hours, cost: 0, locationId: char.location_id, params: { skill: req.skill, tutor, tutorId, rate, cap: tLevel } };
}

/** Öğretenin kendi becerisine küçük pekiştirme (azalan getiriyle) */
function reinforce(skills: Record<string, number>, skill: string, hours: number) {
  const s = { ...skills };
  if (typeof s[skill] === 'number') s[skill] = Math.min(100, s[skill] + TEACHER_REINFORCE_PER_HOUR * hours * diminishing(s[skill]));
  return s;
}

// ---------- Okuma ve ayarlar ----------

/** Bir okul ya da üniversite mekânındaki profesörler ve (okulda) orada bulunan oyuncu öğretmenler */
export async function lessonsAt(db: Db, viewer: number, locationId: string) {
  const loc = LOCATION_BY_ID[locationId];
  if (!loc || (loc.type !== 'school' && loc.type !== 'university')) fail('invalid_location');
  const city = CITY_BY_ID[loc!.cityId];
  const professors = PROFESSORS.filter((p) => p.cityId === loc!.cityId && p.place === loc!.type).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    about: p.about,
    maxLevel: p.maxLevel,
    pricePerHour: priceFor(PROFESSOR_PRICE_PER_HOUR[p.place], city, 1),
    lessonRate: LESSON_RATES.professor,
  }));
  const teachers =
    loc!.type === 'school'
      ? (
          await many(
            db,
            `SELECT c.id, c.name, c.lesson_price, c.career_rank FROM characters c
              WHERE c.location_id = $1 AND c.profession = 'music_teacher' AND c.lesson_price IS NOT NULL AND NOT c.npc AND c.dead_at IS NULL AND c.retired_at IS NULL AND c.id <> $2
                AND NOT EXISTS (SELECT 1 FROM blocks x WHERE (x.blocker_id = $2 AND x.blocked_id = c.id) OR (x.blocker_id = c.id AND x.blocked_id = $2))
              ORDER BY c.lesson_price LIMIT 20`,
            [locationId, viewer],
          )
        ).map((t) => ({ id: Number(t.id), name: t.name, pricePerHour: t.lesson_price, lessonRate: teacherRate(Number(t.career_rank)) }))
      : [];
  const used = await usedHours(db, viewer, ['professor', 'teacher']);
  const me = await one(db, 'SELECT lesson_price, profession FROM characters WHERE id = $1', [viewer]);
  return { professors, teachers, hoursLeftToday: Math.max(0, PRIVATE_DAILY_HOURS - used), myLessonPrice: me?.lesson_price ?? null, canTeach: me?.profession === 'music_teacher' };
}

/** Müzik öğretmeni ders ücretini belirler (null: ders vermiyor) */
export async function setLessonPrice(characterId: number, price: number | null) {
  return tx(async (c) => {
    const ch = await lockCharacter(c, characterId);
    if (price !== null) {
      if (ch.profession !== 'music_teacher') fail('not_a_teacher', 403);
      if (!Number.isInteger(price) || price < TEACHER_PRICE_RANGE[0] || price > TEACHER_PRICE_RANGE[1]) fail('invalid_price');
    }
    await c.query('UPDATE characters SET lesson_price = $2 WHERE id = $1', [characterId, price]);
    return { lessonPrice: price };
  });
}

/** "Ona öğret": arkadaşa ders daveti (bildirim). Ders öğrenci başlatınca gerçekleşir. */
export async function inviteLesson(teacherId: number, studentId: number, skill: string) {
  if (teacherId === studentId) fail('invalid_target');
  const def = SKILL_BY_ID[skill];
  if (!def) fail('invalid_skill');
  if (FRIEND_FORBIDDEN_CATEGORIES.includes(def!.category)) fail('friend_wrong_subject');
  return tx(async (c) => {
    for (const id of pair(teacherId, studentId)) await lockCharacter(c, id);
    await requirePlayer(c, studentId);
    if (await isBlocked(c, teacherId, studentId)) fail('blocked', 403);
    const me = await one(c, 'SELECT name, city_id, skills FROM characters WHERE id = $1', [teacherId]);
    const st = await one(c, 'SELECT city_id FROM characters WHERE id = $1', [studentId]);
    if (!me.city_id || me.city_id !== st.city_id) fail('not_in_same_city');
    if (!knows(me.skills, skill)) fail('skill_not_known');
    const rel = await relationOf(c, teacherId, studentId);
    if (!rel || friendRate(Number(rel.friendship), rel.stage) <= 0) fail('not_close_enough', 403);
    const recent = await one(
      c,
      `SELECT 1 FROM lesson_log WHERE kind = 'invite' AND teacher_id = $1 AND student_id = $2 AND created_at > $3`,
      [teacherId, studentId, since(LESSON_INVITE_COOLDOWN_HOURS)],
    );
    if (recent) fail('lesson_cooldown', 409);
    await c.query(`INSERT INTO lesson_log(student_id, teacher_id, kind, skill) VALUES ($1, $2, 'invite', $3)`, [studentId, teacherId, skill]);
    await notify(c, studentId, 'lesson_invite', { fromId: teacherId, from: me.name, skill });
    return { ok: true };
  });
}

/** Profilde: bu kişiden ders alınabilir mi, verim ne (VIP olmayana bulanık) */
export async function friendLessonInfo(db: Db, viewer: number, otherId: number) {
  const rel = await relationOf(db, viewer, otherId);
  const rate = rel ? friendRate(Number(rel.friendship), rel.stage) : 0;
  return { lessonRate: rate, available: rate > 0 };
}

