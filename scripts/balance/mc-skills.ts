// Beceri ilerlemesi (madde 3): gerçek studyGain formülüyle, eylem eylem (2 saatlik dersler) simülasyon.
// Ustalık eşiklerine kaç saat, kaç oyun günü ve kaç dolar; yol bazında (ev, okul, profesör, oyuncu öğretmen, arkadaş).
// Geniş-sığ ve derin yapıların skillBonus tavanlarına (+10 şarkı yazma/sahne) maliyeti.
import fs from 'node:fs';
import {
  studyGain,
  LESSON_RATES,
  PROFESSOR_PRICE_PER_HOUR,
  SCHOOL_PRICE_PER_HOUR,
  PRIVATE_DAILY_HOURS,
  FRIEND_DAILY_HOURS,
  ENERGY_PER_HOUR,
  ENERGY_REGEN_PER_HOUR,
  HOME_REST_ENERGY_BONUS,
  energyFactor,
  SKILL_DEFS,
  PROFESSORS,
  teacherRate,
} from '@rifftown/shared';

const MOOD = 70;
const HEALTH = 95;
/** Gerçekçi bir oyuncunun ortalama enerjisi (verim çarpanı 0,7–1,0) */
const ENERGY = 60;

interface Path {
  id: string;
  label: string;
  rate: number;
  pricePerHour: number;
  dailyCap: number;
  levelCap: number;
}
const bestProf = Math.max(...PROFESSORS.filter((p) => p.category === 'instruments').map((p) => p.maxLevel));
const istProf = PROFESSORS.find((p) => p.id === 'istanbul-instruments')!.maxLevel;
const PATHS: Path[] = [
  { id: 'self', label: 'Kendi kendine (ücretsiz)', rate: 1.0, pricePerHour: 0, dailyCap: 24, levelCap: 100 },
  { id: 'school', label: 'Okulda grup dersi ($30/sa)', rate: 2.2, pricePerHour: SCHOOL_PRICE_PER_HOUR, dailyCap: 24, levelCap: 100 },
  { id: 'professor', label: `Profesör ($90/sa, günde ${PRIVATE_DAILY_HOURS} sa, İstanbul tavanı ${istProf})`, rate: LESSON_RATES.professor, pricePerHour: PROFESSOR_PRICE_PER_HOUR.school, dailyCap: PRIVATE_DAILY_HOURS, levelCap: istProf },
  { id: 'teacher_r3', label: 'Oyuncu öğretmen 3. rütbe ($60/sa varsayım)', rate: teacherRate(3), pricePerHour: 60, dailyCap: PRIVATE_DAILY_HOURS, levelCap: 100 },
  { id: 'friend_best', label: 'Can dostu/eş (×1,9, ücretsiz, günde 4 sa)', rate: 1.9, pricePerHour: 0, dailyCap: FRIEND_DAILY_HOURS, levelCap: 100 },
  { id: 'prof_then_school', label: 'Profesör günde 4 sa + kalan saatler okul', rate: -1, pricePerHour: 0, dailyCap: 24, levelCap: 100 },
];

/** Enerji dengesi: bir oyun gününde sürdürülebilir çalışma saati (evde dinlenerek) */
const studyDrain = -ENERGY_PER_HOUR.study - ENERGY_REGEN_PER_HOUR; // saatte net kayıp
const restGain = ENERGY_PER_HOUR.rest + HOME_REST_ENERGY_BONUS + ENERGY_REGEN_PER_HOUR;
const sustainableStudyHoursPerDay = Math.floor((24 * restGain) / (restGain + studyDrain));

function progress(path: Path, from: number, targets: number[]) {
  let level = from;
  let hours = 0;
  let cost = 0;
  let days = 0;
  const reached: Record<number, { hours: number; cost: number; days: number } | null> = {};
  for (const t of targets) reached[t] = null;
  const ef = energyFactor(ENERGY);
  outer: while (days < 5000) {
    days++;
    // Bir oyun günü: sürdürülebilir çalışma saati, yolun günlük tavanı
    const today = Math.min(sustainableStudyHoursPerDay, path.dailyCap);
    for (let h = 0; h < today; h += 2) {
      let rate = path.rate;
      let price = path.pricePerHour;
      let cap = path.levelCap;
      if (path.id === 'prof_then_school') {
        const profNow = h < PRIVATE_DAILY_HOURS && level < istProf;
        rate = profNow ? LESSON_RATES.professor : 2.2;
        price = profNow ? PROFESSOR_PRICE_PER_HOUR.school : SCHOOL_PRICE_PER_HOUR;
        cap = profNow ? istProf : 100;
      }
      if (level >= cap) break outer;
      const g = studyGain(level, 2, true, MOOD, HEALTH, 0, rate) * ef;
      level = Math.min(cap, level + g);
      hours += 2;
      cost += price * 2;
      for (const t of targets) if (reached[t] === null && level >= t) reached[t] = { hours, cost, days };
      if (targets.every((t) => reached[t] !== null)) break outer;
    }
  }
  return { reached, finalLevel: Math.round(level * 10) / 10 };
}

const targets = [30, 45, 60, 75, 90];
const fromMain: any = {};
const fromZero: any = {};
for (const p of PATHS) {
  fromMain[p.id] = { label: p.label, ...progress(p, 12, targets) };
  fromZero[p.id] = { label: p.label, ...progress(p, 0, targets) };
}

// Geniş-sığ vs derin: +10 tavanına ulaşmanın maliyeti
const hoursToLevel = (from: number, to: number, rate = 2.2) => {
  let l = from;
  let h = 0;
  while (l < to && h < 10000) {
    l += studyGain(l, 1, true, MOOD, HEALTH, 0, rate) * energyFactor(ENERGY);
    h++;
  }
  return h;
};
function wideCost(kind: string) {
  const skills = SKILL_DEFS.filter((s) => s.effects?.[kind as keyof typeof s.effects] && !s.vip).sort((a, b) => b.effects![kind as 'stage']! - a.effects![kind as 'stage']!);
  const sumW = skills.reduce((s, x) => s + x.effects![kind as 'stage']!, 0);
  // Hepsini eşit seviyeye çekmek: 10 / toplam ağırlık
  const level = Math.min(100, 10 / sumW);
  const h = hoursToLevel(0, level);
  const books = skills.reduce((s, x) => s + (x.bookPrice ?? 0), 0);
  // Yalnızca en ağır 3 beceriyle
  const top = skills.slice(0, 3);
  const topW = top.reduce((s, x) => s + x.effects![kind as 'stage']!, 0);
  const topLevel = 10 / topW;
  return {
    skills: skills.length,
    sumWeight: Math.round(sumW * 1000) / 1000,
    allEqualLevel: Math.round(level * 10) / 10,
    allEqualSchoolHours: h * skills.length,
    allEqualSchoolCost: h * skills.length * SCHOOL_PRICE_PER_HOUR + books,
    top3: top.map((x) => x.id),
    top3Level: topLevel > 100 ? 'ulaşılamaz' : Math.round(topLevel * 10) / 10,
    top3SchoolHours: topLevel > 100 ? null : hoursToLevel(0, topLevel) * 3,
  };
}
// Derin karşılığı: +10 şarkı yazma puanı = besteye +22,2 (ağırlık 0,45); +10 sahne = şovmenliğe +22,2
const deep = {
  songwriting_composing_30to52: hoursToLevel(30, 52.2),
  songwriting_composing_60to82: hoursToLevel(60, 82.2),
  stage_showmanship_30to52: hoursToLevel(30, 52.2),
  stage_showmanship_60to82: hoursToLevel(60, 82.2),
};

const out = {
  assumptions: { MOOD, HEALTH, ENERGY, energyFactor: energyFactor(ENERGY), sustainableStudyHoursPerDay, note: 'Oturumlar 2 saatlik; ruh hâli ve sağlık sabit varsayıldı; yaş etkisi yok (35 yaş = 952 oyun günü)' },
  bestProfessorCap: bestProf,
  istanbulProfessorCap: istProf,
  fromMain,
  fromZero,
  wide: { songwriting: wideCost('songwriting'), stage: wideCost('stage'), rehearsal: wideCost('rehearsal'), busking: wideCost('busking') },
  deep,
};
fs.mkdirSync('scripts/balance/out', { recursive: true });
fs.writeFileSync('scripts/balance/out/mc-skills.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
