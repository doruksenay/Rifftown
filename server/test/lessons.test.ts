// Özel ders ve ilişkiye dayalı öğrenme
import {
  LESSON_RATES,
  PROFESSORS,
  PRIVATE_DAILY_HOURS,
  TEACHER_DAILY_EARN_CAP,
  friendRate,
  professorFor,
  teacherRate,
} from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { advance, newPlayer, raw, setMoney, setSkills, setup, teardown } from './helpers';

// Kontenjan ve bekleme süreleri oyun saatine bakar: testin çok hızlı saatinde (1 gün = 24 ms) pencere hemen kapanırdı.
// Bu dosyada 1 oyun saati = 1 saniye.
let prevSpeed = 0;
beforeAll(async () => {
  await setup();
  prevSpeed = config.gameSpeed;
  config.gameSpeed = 3600;
});
afterAll(async () => {
  config.gameSpeed = prevSpeed;
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
type P = Awaited<ReturnType<typeof newPlayer>>;

async function finish(p: P) {
  await q(`UPDATE actions SET ends_at = now() WHERE character_id = $1 AND status = 'active'`, [p.character.id]);
  await advance(1);
}
async function relate(a: P, b: P, friendship: number, stage = 'none') {
  const [x, y] = [a.character.id, b.character.id].sort((m, n) => m - n);
  await q(
    `INSERT INTO relationships(a_id, b_id, friends, friendship, stage) VALUES ($1, $2, TRUE, $3, $4)
     ON CONFLICT (a_id, b_id) DO UPDATE SET friendship = $3, stage = $4`,
    [x, y, friendship, stage],
  );
}
const lesson = (p: P, body: Record<string, unknown>) => p.c.post('/api/actions', { kind: 'lesson', hours: 2, ...body });
/** 2 saatlik derste kazanılan beceri (taze oyuncu, aynı başlangıç) */
async function gainOf(p: P, skill: string, body: Record<string, unknown>) {
  const before = (await raw(p.character.id)).skills[skill];
  const r = await lesson(p, { skill, ...body });
  expect(r.status, JSON.stringify(r.body)).toBe(200);
  await finish(p);
  return (await raw(p.character.id)).skills[skill] - before;
}

describe('kurallar', () => {
  it('verim sırası: profesör > öğretmen > can dostu > arkadaş > tanıdık; yabancıdan ders yok', () => {
    expect(friendRate(5, 'none')).toBe(0);
    expect(friendRate(10, 'none')).toBe(1.2);
    expect(friendRate(30, 'none')).toBe(1.4);
    expect(friendRate(55, 'none')).toBe(1.6);
    expect(friendRate(80, 'none')).toBe(1.8);
    expect(friendRate(0, 'dating')).toBe(1.4);
    expect(friendRate(90, 'married')).toBe(1.9);
    expect(friendRate(100, 'married')).toBeLessThan(teacherRate(0));
    expect(teacherRate(3)).toBeLessThan(LESSON_RATES.professor);
    expect(PROFESSORS.length).toBe(75);
    for (const p of PROFESSORS) {
      expect(p.maxLevel).toBeGreaterThanOrEqual(60);
      expect(p.maxLevel).toBeLessThanOrEqual(85);
    }
  });
});

describe('profesör', () => {
  it('ücretli, grup dersinden verimli, yalnızca bilinen beceri, günlük kontenjanlı, profesörün seviyesini geçemez', async () => {
    const p = await newPlayer({ instrument: 'guitar' });
    const g = await newPlayer({ instrument: 'guitar' });
    await setMoney(p.character.id, 5000);
    await setMoney(g.character.id, 5000);
    expect((await lesson(p, { skill: 'drums', tutor: 'professor', locationId: 'istanbul-school' })).body.error).toBe('skill_not_known');
    expect((await lesson(p, { skill: 'guitar', tutor: 'professor', locationId: 'istanbul-university' })).body.error).toBe('invalid_location');
    const before = (await raw(p.character.id)).money;
    const gain = await gainOf(p, 'guitar', { tutor: 'professor', locationId: 'istanbul-school' });
    expect((await raw(p.character.id)).money).toBe(before - 180);
    // Aynı başlangıçtaki oyuncu grup dersinde daha az kazanır
    const gb = (await raw(g.character.id)).skills.guitar;
    expect((await g.c.post('/api/actions', { kind: 'study', skill: 'guitar', hours: 2, locationId: 'istanbul-school' })).status).toBe(200);
    await finish(g);
    const groupGain = (await raw(g.character.id)).skills.guitar - gb;
    expect(gain).toBeGreaterThan(groupGain * 1.3);
    // Kontenjan: günde 4 saat
    expect((await lesson(p, { skill: 'guitar', tutor: 'professor', locationId: 'istanbul-school' })).status).toBe(200);
    await finish(p);
    expect((await lesson(p, { skill: 'guitar', tutor: 'professor', locationId: 'istanbul-school', hours: 1 })).body.error).toBe('lesson_quota');
    // Profesörün tavanı
    const prof = professorFor('ankara', 'instruments');
    const top = await newPlayer({ instrument: 'guitar', cityId: 'ankara' });
    await setMoney(top.character.id, 5000);
    await setSkills(top.character.id, { guitar: prof.maxLevel });
    expect((await lesson(top, { skill: 'guitar', tutor: 'professor', locationId: 'ankara-school' })).body.error).toBe('tutor_level_too_low');
    await setSkills(top.character.id, { guitar: prof.maxLevel - 0.3 });
    expect((await lesson(top, { skill: 'guitar', tutor: 'professor', locationId: 'ankara-school', hours: 4 })).status).toBe(200);
    await finish(top);
    expect((await raw(top.character.id)).skills.guitar).toBeCloseTo(prof.maxLevel);
    expect(PRIVATE_DAILY_HOURS).toBe(4);
  });

  it('kariyer becerisi üniversitede profesörden', async () => {
    const p = await newPlayer();
    await setMoney(p.character.id, 2000);
    await setSkills(p.character.id, { law: 10 });
    expect((await lesson(p, { skill: 'law', tutor: 'professor', locationId: 'istanbul-school' })).body.error).toBe('invalid_location');
    expect(await gainOf(p, 'law', { tutor: 'professor', locationId: 'istanbul-university' })).toBeGreaterThan(0);
  });
});

describe('oyuncu öğretmen', () => {
  it('müzik öğretmeni okulda kendi ücretiyle ders verir; okul payı keser, kazanç tavanlı; para çoğalmaz', async () => {
    const teacher = await newPlayer({ instrument: 'guitar' });
    const student = await newPlayer({ instrument: 'guitar' });
    const tid = teacher.character.id;
    await setSkills(tid, { guitar: 70 });
    expect((await teacher.c.post('/api/lessons/price', { price: 50 })).body.error).toBe('not_a_teacher');
    await q(`UPDATE characters SET profession = 'music_teacher' WHERE id = $1`, [tid]);
    expect((await teacher.c.post('/api/lessons/price', { price: 500 })).body.error).toBe('invalid_price');
    expect((await teacher.c.post('/api/lessons/price', { price: 50 })).status).toBe(200);
    await setMoney(student.character.id, 1000);
    await setMoney(tid, 0);
    const req = { skill: 'guitar', tutor: 'teacher', tutorId: tid, locationId: 'istanbul-school' };
    expect((await lesson(student, req)).body.error).toBe('teacher_not_here');
    await q(`UPDATE characters SET location_id = 'istanbul-school' WHERE id = $1`, [tid]);
    // Okuldaki öğretmen listede görünür
    const list = (await student.c.get('/api/lessons?locationId=istanbul-school')).body;
    expect(list.teachers.map((x: any) => x.id)).toContain(tid);
    expect(list.professors.length).toBe(4);
    expect((await lesson(student, { ...req, skill: 'law' })).body.error).toBe('skill_not_known');
    const gain = await gainOf(student, 'guitar', req);
    expect(gain).toBeGreaterThan(0);
    expect((await raw(student.character.id)).money).toBe(1000 - 100);
    expect((await raw(tid)).money).toBe(80); // %20 okula: para oyundan çıkar
    expect((await raw(tid)).skills.guitar).toBeGreaterThan(70); // küçük pekiştirme
    // Günlük kazanç tavanı
    await q(`UPDATE lesson_log SET teacher_earned = $2 WHERE teacher_id = $1`, [tid, TEACHER_DAILY_EARN_CAP - 10]);
    expect((await lesson(student, req)).status).toBe(200);
    expect((await raw(tid)).money).toBe(80 + 10);
    await finish(student);
    // Kendine ders yok; öğretmen yeterince iyi değilse yok
    await q(`UPDATE characters SET location_id = 'istanbul-school' WHERE id = $1`, [student.character.id]);
    expect((await lesson(teacher, { ...req, tutorId: tid })).body.error).toBe('invalid_target');
    const strong = await newPlayer({ instrument: 'guitar' });
    await setSkills(strong.character.id, { guitar: 65 });
    await setMoney(strong.character.id, 1000);
    expect((await lesson(strong, req)).body.error).toBe('tutor_level_too_low');
    // Engelleme
    await q('INSERT INTO blocks(blocker_id, blocked_id) VALUES ($1, $2)', [tid, strong.character.id]);
    await setSkills(strong.character.id, { guitar: 20 });
    expect((await lesson(strong, req)).body.error).toBe('blocked');
  });

  it('yeni hesap öğretmenden ders alamaz', async () => {
    const teacher = await newPlayer({ instrument: 'guitar' });
    const student = await newPlayer({ instrument: 'guitar' });
    await setSkills(teacher.character.id, { guitar: 70 });
    await q(`UPDATE characters SET profession = 'music_teacher', lesson_price = 20, location_id = 'istanbul-school' WHERE id = $1`, [teacher.character.id]);
    await setMoney(student.character.id, 500);
    const prev = config.tradeMinAccountHours;
    config.tradeMinAccountHours = 72;
    const speed0 = config.gameSpeed;
    config.gameSpeed = 1;
    try {
      expect((await lesson(student, { skill: 'guitar', tutor: 'teacher', tutorId: teacher.character.id, locationId: 'istanbul-school' })).body.error).toBe('account_too_new');
    } finally {
      config.tradeMinAccountHours = prev;
      config.gameSpeed = speed0;
    }
  });
});

describe('arkadaştan öğrenmek', () => {
  it('ücretsiz; can dostu arkadaştan, arkadaş tanıdıktan iyi öğretir; hepsi özel dersin altında', async () => {
    const teacher = await newPlayer({ instrument: 'guitar' });
    await setSkills(teacher.character.id, { guitar: 80 });
    const students: P[] = [];
    for (let i = 0; i < 4; i++) students.push(await newPlayer());
    const [best, friend, acq, stranger] = students;
    await relate(best, teacher, 85);
    await relate(friend, teacher, 35);
    await relate(acq, teacher, 12);
    for (const s of students) await setMoney(s.character.id, 500);
    expect((await lesson(stranger, { skill: 'guitar', tutor: 'friend', tutorId: teacher.character.id })).body.error).toBe('not_close_enough');
    const gBest = await gainOf(best, 'guitar', { tutor: 'friend', tutorId: teacher.character.id });
    const gFriend = await gainOf(friend, 'guitar', { tutor: 'friend', tutorId: teacher.character.id });
    const gAcq = await gainOf(acq, 'guitar', { tutor: 'friend', tutorId: teacher.character.id });
    expect(gBest).toBeGreaterThan(gFriend);
    expect(gFriend).toBeGreaterThan(gAcq);
    for (const s of [best, friend, acq]) expect((await raw(s.character.id)).money).toBe(500);
    // Özel ders aynı başlangıçtan daha fazla kazandırır
    const pro = await newPlayer();
    await setMoney(pro.character.id, 1000);
    expect(await gainOf(pro, 'guitar', { tutor: 'professor', locationId: 'istanbul-school' })).toBeGreaterThan(gBest);
    // İkili bekleme süresi; sokak becerisi yasak; öğretenin seviyesi
    expect((await lesson(best, { skill: 'guitar', tutor: 'friend', tutorId: teacher.character.id, hours: 1 })).body.error).toBe('lesson_cooldown');
    await setSkills(best.character.id, { street_smarts: 5 });
    await setSkills(teacher.character.id, { street_smarts: 60 });
    expect((await lesson(best, { skill: 'street_smarts', tutor: 'friend', tutorId: teacher.character.id, hours: 1 })).body.error).toBe('friend_wrong_subject');
    // Öğreten küçük pekiştirme ve arkadaşlık kazanır
    expect((await raw(teacher.character.id)).skills.guitar).toBeGreaterThan(80);
    const [x, y] = [friend.character.id, teacher.character.id].sort((m, n) => m - n);
    expect(Number((await q('SELECT friendship FROM relationships WHERE a_id = $1 AND b_id = $2', [x, y])).rows[0].friendship)).toBe(36);
    // Profilde verim VIP olmayana yarımlık adımlarla
    expect((await friend.c.get(`/api/characters/${teacher.character.id}/lesson`)).body).toEqual({ lessonRate: 1, available: true });
  });

  it('"ona öğret" daveti bildirim gönderir ve ikili başına bekleme süresine tabidir', async () => {
    const a = await newPlayer();
    const b = await newPlayer();
    expect((await a.c.post('/api/lessons/invite', { toId: b.character.id, skill: 'guitar' })).body.error).toBe('not_close_enough');
    await relate(a, b, 40);
    expect((await a.c.post('/api/lessons/invite', { toId: b.character.id, skill: 'guitar' })).status).toBe(200);
    expect((await a.c.post('/api/lessons/invite', { toId: b.character.id, skill: 'guitar' })).body.error).toBe('lesson_cooldown');
    const n = await q(`SELECT data FROM notifications WHERE character_id = $1 AND kind = 'lesson_invite'`, [b.character.id]);
    expect(n.rows[0].data).toMatchObject({ fromId: a.character.id, skill: 'guitar' });
  });
});
