// Denge ölçümü: yalnızca packages/shared formüllerini çağırır (sunucuya, veritabanına dokunmaz).
// Çalıştırma: npx tsx scripts/balance/measure.ts > olcum.md
// Sonuçlar ve varsayımlar docs/DENGE_OLCUMU.md içinde özetlenir. Rastgelelik sabit tohumludur: her çalıştırma aynı sayıları verir.
// "Eski" kural: şehir doygunluğu ve uzmanlık payı yokken (recentCityGigs = 0, effectBonus yerine min(10, skillBonus)).

import {
  CHAINS,
  CITY_BY_ID,
  MISSIONS,
  PACING,
  RELEASE_RULES,
  SKILL_DEFS,
  STAT_ACHIEVEMENTS,
  VENUE_RULES,
  ITEMS,
  HOMES,
  MAX_EFFECT_BONUS,
  type City,
  type GigPerformer,
  type Instrument,
  type SkillEffectKind,
  type Skills,
  type StatId,
  type VenueType,
  computeGig,
  effectBonus,
  masteryBonus,
  missionsFor,
  skillBonus,
  skillMult,
  songQuality,
  songwritingScore,
  stageScore,
  studyGain,
  weeklyUnits,
  careerPay,
  PROFESSION_BY_ID,
  rankFor,
  SCHOOL_PRICE_PER_HOUR,
  STUDIO_PRICE_PER_HOUR,
  RECORDING_PRICE_PER_HOUR,
  RECORD_HOURS,
  BAND_SHARE,
  FAME_SPILLOVER,
  rentFor,
  HOME_BY_ID,
  familiarityCap,
} from '@rifftown/shared';

// ---------- Yardımcılar ----------

/** Sabit tohumlu rastgele sayı üreteci (mulberry32) */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (v: number) => (Math.round(v * 10) / 10).toLocaleString('tr-TR');
const r0 = (v: number) => Math.round(v).toLocaleString('tr-TR');
const table = (head: string[], rows: (string | number)[][]) =>
  [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');
const out: string[] = [];
const p = (s = '') => out.push(s);

/** Ders verimi varsayımı: ruh hâli 80, sağlık 100, ekipman yok */
const MOOD = 80;

/** Bir beceriyi from → to çıkarmak için gereken saat (4 saatlik oturumlar) */
function hoursTo(from: number, to: number, atSchool = true): number {
  let lvl = from;
  let h = 0;
  while (lvl < to && h < 5000) {
    const g = studyGain(lvl, 4, atSchool, MOOD);
    if (lvl + g >= to) return h + (4 * (to - lvl)) / g;
    lvl += g;
    h += 4;
  }
  return h;
}
/** Verilen saatle from'dan ulaşılan seviye */
function levelAfter(hours: number, atSchool = true, from = 0): number {
  let lvl = from;
  let h = hours;
  while (h > 0) {
    const step = Math.min(4, h);
    lvl = Math.min(100, lvl + studyGain(lvl, step, atSchool, MOOD));
    h -= step;
  }
  return lvl;
}

const effectSkills = (kind: SkillEffectKind) =>
  SKILL_DEFS.filter((d) => d.effects?.[kind])
    .map((d) => ({ id: d.id, w: d.effects![kind]!, book: d.bookPrice ?? 0 }))
    .sort((a, b) => b.w - a.w);
const oldEffect = (s: Skills, kind: SkillEffectKind) => Math.min(MAX_EFFECT_BONUS, skillBonus(s, kind));

// =====================================================================
// (i) Beceri dağılımı: geniş-sığ, orta, derin-dar
// =====================================================================

p('## (i) Beceri dağılımı');
p();
for (const kind of ['stage', 'songwriting', 'recording', 'rehearsal', 'busking', 'social'] as SkillEffectKind[]) {
  const list = effectSkills(kind);
  const total = list.reduce((s, x) => s + x.w, 0);
  p(`- **${kind}**: ${list.length} beceri, ağırlık toplamı ${total.toFixed(2)} (en yüksek ${list[0].w}); hepsi 100'de ham toplam ${r1(total * 100)}.`);
}
p();

/** k beceri (ağırlığa göre en iyileri), her biri aynı seviyede */
function profileSkills(kind: SkillEffectKind, k: number, level: number): Skills {
  const s: Skills = {};
  for (const x of effectSkills(kind).slice(0, k)) s[x.id] = Math.min(100, level);
  return s;
}
const shapes = (kind: SkillEffectKind) => {
  const n = effectSkills(kind).length;
  return [
    { name: `geniş (${n})`, k: n },
    ...(n > 6 ? [{ name: 'orta (6)', k: 6 }] : []),
    { name: 'derin (3)', k: 3 },
  ];
};

p('### Eşit puan bütçesi (beceri puanlarının toplamı sabit)');
p();
for (const kind of ['stage', 'songwriting'] as SkillEffectKind[]) {
  const rows: (string | number)[][] = [];
  for (const budget of [150, 300, 600]) {
    for (const sh of shapes(kind)) {
      const lvl = Math.min(100, budget / sh.k);
      const s = profileSkills(kind, sh.k, lvl);
      rows.push([budget, sh.name, r1(lvl), r1(skillBonus(s, kind)), r1(oldEffect(s, kind)), r1(masteryBonus(s, kind)), r1(effectBonus(s, kind)), r0(sh.k * hoursTo(0, lvl))]);
    }
  }
  p(`**${kind}**`);
  p();
  p(table(['Puan bütçesi', 'Dağılım', 'Beceri başına seviye', 'Ham etki', 'Eski (tavan 10)', 'Uzmanlık payı', 'Yeni toplam', 'Okul saati'], rows));
  p();
}

p('### Eşit çalışma saati bütçesi (okulda, ruh hâli 80)');
p();
for (const kind of ['stage', 'songwriting'] as SkillEffectKind[]) {
  const rows: (string | number)[][] = [];
  for (const hours of [60, 120, 240, 480]) {
    for (const sh of shapes(kind)) {
      const lvl = levelAfter(hours / sh.k);
      const s = profileSkills(kind, sh.k, lvl);
      rows.push([hours, sh.name, r1(lvl), r1(skillBonus(s, kind)), r1(oldEffect(s, kind)), r1(effectBonus(s, kind))]);
    }
  }
  p(`**${kind}**`);
  p();
  p(table(['Saat', 'Dağılım', 'Beceri başına seviye', 'Ham etki', 'Eski (tavan 10)', 'Yeni toplam'], rows));
  p();
}

p('### Tavana (+10) varmanın en ucuz yolu');
p();
{
  const rows: (string | number)[][] = [];
  for (const kind of ['stage', 'songwriting'] as SkillEffectKind[]) {
    const list = effectSkills(kind);
    for (let k = 1; k <= list.length; k++) {
      const wsum = list.slice(0, k).reduce((s, x) => s + x.w, 0);
      const lvl = MAX_EFFECT_BONUS / wsum;
      if (lvl > 100) continue;
      rows.push([kind, k, r1(lvl), r0(k * hoursTo(0, lvl)), r0(list.slice(0, k).reduce((s, x) => s + x.book, 0))]);
    }
  }
  p(table(['Etki', 'Beceri sayısı', 'Gereken eşit seviye', 'Toplam okul saati', 'Kitap $'], rows));
  p();
}

p('### Etkilerin oyundaki karşılığı');
p();
{
  const avgSong = 55;
  const q = (stage: number) => avgSong * (0.85 + 0.15 * (stage / 100)) * 1.15;
  const coreStage = stageScore({ showmanship: 45, dancing: 30, audience: 30 });
  p(`- Sahne: temel sahne puanı ${r1(coreStage)} (şovmenlik 45, dans 30, seyirci farkındalığı 30) iken etki becerilerinden +10, konser kalitesini ${r1(q(coreStage))} → ${r1(q(coreStage + 10))} yapar: **+${r1(q(coreStage + 10) - q(coreStage))} kalite puanı** (şarkı puanı ortalaması 55). Uzmanlık payıyla +15: +${r1(q(coreStage + 15) - q(coreStage))}.`);
  const base = songwritingScore({ composing: 45, lyrics: 45, genre_rock: 45 }, 'rock');
  p(`- Şarkı yazma: temel puan ${r1(base)} (beste, söz, tür 45) iken +10 → şarkı kalitesi **+8** (15 + 0,8 × puan); uzmanlık payıyla +15 → +12. Konserde şarkı puanına ×0,4, kayıtta ×0,45.`);
  const to120 = levelAfter(120, true, 45);
  p(`- Karşılaştırma: aynı 120 okul saati beste becerisini 45'ten ${r1(to120)}'e çıkarır: şarkı yazma puanına +${r1((to120 - 45) * 0.45)}, şarkı kalitesine +${r1((to120 - 45) * 0.45 * 0.8)}. Çekirdek beceriler tavansızdır; derinliğin asıl ödülü oradadır.`);
  const rec = effectSkills('recording');
  const recAll = rec.reduce((s, x) => s + x.w, 0) * 100 * 2;
  p(`- Kayıt: tavan yok. Bütün kayıt etkili beceriler 100'de yapımcılık değerine +${r1(recAll)}, kayıt kalitesine +${r1(recAll * 0.12)}.`);
  const reh = effectSkills('rehearsal');
  p(`- Prova çarpanı: bütün beceriler 100'de ×${(1 + reh.reduce((s, x) => s + x.w, 0)).toFixed(2)}; ×1,5 tavanına hiç varılamaz.`);
  const busk = effectSkills('busking');
  const k = busk.findIndex((_, i) => skillMult(profileSkills('busking', i + 1, 100), 'busking') >= 1.5);
  p(`- Sokak çarpanı: ${busk.length} beceri; ×1,5 tavanına ${k + 1} beceri 100'de ya da hepsi ~${r1(50 / busk.reduce((s, x) => s + x.w, 0))}'de varılır.`);
}
p();

// =====================================================================
// (ii) Ekonomi ve (iii) içerik: 52 haftalık grup simülasyonu
// =====================================================================

interface Profile {
  key: string;
  name: string;
  gigsPerDay: number;
  /** Konser verilen şehirler (sırayla dönülür); ilki ev şehri */
  cities: string[];
  studyHoursPerDay: number;
  workHoursPerDay: number;
  rehearseHoursPerWeek: number;
}
const TR3 = ['istanbul', 'ankara', 'izmir'];
const PROFILES: Profile[] = [
  { key: 'A', name: 'Normal, tek şehir (günde 1 konser)', gigsPerDay: 1, cities: ['istanbul'], studyHoursPerDay: 4, workHoursPerDay: 4, rehearseHoursPerWeek: 6 },
  { key: 'B', name: 'Hafif, tek şehir (haftada 3 konser)', gigsPerDay: 3 / 7, cities: ['istanbul'], studyHoursPerDay: 2, workHoursPerDay: 4, rehearseHoursPerWeek: 4 },
  { key: 'C', name: 'Öğütücü, tek şehir (günde 3 konser)', gigsPerDay: 3, cities: ['istanbul'], studyHoursPerDay: 4, workHoursPerDay: 4, rehearseHoursPerWeek: 8 },
  { key: 'D', name: 'Turne (günde 1 konser, 3 şehir sırayla)', gigsPerDay: 1, cities: TR3, studyHoursPerDay: 4, workHoursPerDay: 4, rehearseHoursPerWeek: 6 },
  { key: 'E', name: 'Öğütücü turne (günde 3 konser, 3 şehir)', gigsPerDay: 3, cities: TR3, studyHoursPerDay: 4, workHoursPerDay: 4, rehearseHoursPerWeek: 8 },
];

const GENRE = 'rock' as const;
const MEMBERS = 4;
const ROLES: Instrument[] = ['vocals', 'guitar', 'bass', 'drums'];
const venueFor = (fame: number): VenueType =>
  fame >= VENUE_RULES.stadium.minFame ? 'stadium' : fame >= VENUE_RULES.hall.minFame ? 'hall' : fame >= VENUE_RULES.club.minFame ? 'club' : 'bar';

interface WeekRow {
  week: number;
  fame: Record<string, number>;
  quality: number;
  role: number;
  incGig: number;
  incJob: number;
  incSales: number;
  incMission: number;
  expLiving: number;
  expSchool: number;
  expMusic: number;
  money: number;
  stats: Partial<Record<StatId, number>>;
}

function simulate(pr: Profile, weeks: number, saturation: boolean, seed = 7): WeekRow[] {
  const rand = rng(seed);
  const skills: Skills = { basic_strings: 20, guitar: 12, composing: 5, lyrics: 5, showmanship: 5, genre_rock: 10 };
  const studyPlan = ['guitar', 'composing', 'genre_rock', 'lyrics', 'basic_strings', 'showmanship'];
  const home = CITY_BY_ID[pr.cities[0]];
  let money = 500;
  const fame: Record<string, number> = Object.fromEntries(TR3.map((id) => [id, 0]));
  const gigTimes: Record<string, number[]> = Object.fromEntries(TR3.map((id) => [id, []]));
  const songs: number[] = [];
  const stats: Record<string, number> = { gigs: 0, songs: 0, best_song: 0, recordings: 0, singles: 0, albums: 0, shifts: 0, best_units: 0, epic_gigs: 0, stadium_gigs: 0, skills_known: 6, max_skill: 20 };
  const releases: { kind: 'single' | 'album'; quality: number; day: number; units: number }[] = [];
  let lastSingle = -1e9;
  let lastAlbum = -1e9;
  let careerHours = 0;
  let studyIdx = 0;
  let gigAcc = 0;
  let gigN = 0;
  const rows: WeekRow[] = [];
  const zero = () => ({ incGig: 0, incJob: 0, incSales: 0, incMission: 0, expLiving: 0, expSchool: 0, expMusic: 0 });
  let w = zero();
  let qSum = 0;
  let qN = 0;
  for (let day = 0; day < weeks * 7; day++) {
    // Okul: 4 saatlik oturumlar, plan sırasıyla
    let h = pr.studyHoursPerDay;
    while (h > 0) {
      const sk = studyPlan[studyIdx++ % studyPlan.length];
      const step = Math.min(4, h);
      skills[sk] = Math.min(100, (skills[sk] ?? 0) + studyGain(skills[sk] ?? 0, step, true, MOOD));
      h -= step;
      const cost = SCHOOL_PRICE_PER_HOUR * home.costMult * step;
      money -= cost;
      w.expSchool += cost;
    }
    // Mesai: gitar 45 olunca müzik öğretmeni (rütbe saatle artar), öncesinde sıradan iş $20/saat
    const canTeach = (skills.guitar ?? 0) >= 45;
    const pay = canTeach ? careerPay(PROFESSION_BY_ID.music_teacher, rankFor(careerHours), home.costMult) : 20;
    if (canTeach) careerHours += pr.workHoursPerDay;
    money += pay * pr.workHoursPerDay;
    w.incJob += pay * pr.workHoursPerDay;
    stats.shifts += pr.workHoursPerDay > 0 ? 1 : 0;
    // Yaşam: ilk 4 hafta oda, sonra daire; günde bir "günün yemeği"
    const living = rentFor(day < 28 ? HOME_BY_ID.room : HOME_BY_ID.flat, home.costMult) / 7 + 15;
    money -= living;
    w.expLiving += living;
    const reh = (pr.rehearseHoursPerWeek / 7) * STUDIO_PRICE_PER_HOUR * home.costMult;
    money -= reh;
    w.expMusic += reh;
    // Şarkı yazma: 3 günde bir (hız sınırı yok), ilham ortalama 30 → +4
    if (day % 3 === 0) {
      const q = Math.min(100, songQuality(songwritingScore(skills, GENRE), rand) + 4);
      songs.push(q);
      stats.songs++;
      stats.best_song = Math.max(stats.best_song, q);
    }
    // Konserler: gün içinde eşit aralıkla; şehirler sırayla
    gigAcc += pr.gigsPerDay;
    const per = Math.max(1, Math.floor(gigAcc));
    const setlist = [...songs].sort((a, b) => b - a).slice(0, 6);
    let slot = 0;
    while (gigAcc >= 1 && setlist.length) {
      gigAcc -= 1;
      const cityId = pr.cities[gigN++ % pr.cities.length];
      const city: City = CITY_BY_ID[cityId];
      const t = day * 24 + 12 + (slot++ * 24) / per;
      const recent = saturation ? gigTimes[cityId].filter((x) => x > t - PACING.citySaturationHours).length : 0;
      const venue = venueFor(fame[cityId]);
      const cap = familiarityCap(skills, GENRE);
      const perf: GigPerformer[] = ROLES.map((role, i) => ({
        characterId: i + 1,
        role,
        // Dört üye aynı tempoda gelişir: gitaristin profili her üyenin kendi rolüne yansıtılır
        skills: {
          ...skills,
          [role]: skills.guitar,
          [role === 'vocals' ? 'basic_singing' : role === 'drums' ? 'basic_percussion' : 'basic_strings']: skills.basic_strings,
        },
        mood: MOOD,
        health: 100,
        present: true,
        instrumentBonus: 0,
        outfitBonus: 0,
        familiarity: Object.fromEntries(setlist.map((_, j) => [j, Math.min(cap, 70)])),
        energy: 70,
        inspiration: 30,
      }));
      const res = computeGig({ venue, fame: fame[cityId], genre: GENRE, city, performers: perf, setlist: setlist.map((q, j) => ({ id: j, quality: q })), rand, recentCityGigs: recent });
      gigTimes[cityId].push(t);
      fame[cityId] = Math.max(0, Math.min(100, fame[cityId] + res.fameDelta));
      if (res.fameDelta > 0) for (const o of TR3) if (o !== cityId) fame[o] = Math.min(100, fame[o] + res.fameDelta * FAME_SPILLOVER);
      const share = res.revenue / MEMBERS;
      money += share;
      w.incGig += share;
      qSum += res.quality;
      qN++;
      stats.gigs++;
      if (res.quality >= 90) stats.epic_gigs++;
      if (venue === 'stadium') stats.stadium_gigs++;
    }
    // Kayıt ve yayın: single 28 günde bir (1 kayıt), albüm 112 günde bir (6 kayıt); maliyet dört üyeye bölünür
    if (songs.length >= 2 && day - lastSingle >= PACING.singleCooldownDays) {
      const cost = (RECORDING_PRICE_PER_HOUR * RECORD_HOURS * home.costMult + RELEASE_RULES.single.pressingCost) / MEMBERS;
      money -= cost;
      w.expMusic += cost;
      stats.recordings++;
      stats.singles++;
      lastSingle = day;
      const best = Math.max(...songs);
      releases.push({ kind: 'single', quality: Math.round(0.45 * best + 0.3 * 70 + 0.25 * skills.guitar), day, units: 0 });
    }
    if (songs.length >= 8 && day - lastAlbum >= PACING.albumCooldownDays) {
      const cost = (6 * RECORDING_PRICE_PER_HOUR * RECORD_HOURS * home.costMult + RELEASE_RULES.album.pressingCost) / MEMBERS;
      money -= cost;
      w.expMusic += cost;
      stats.recordings += 6;
      stats.albums++;
      lastAlbum = day;
      const avg = [...songs].sort((a, b) => b - a).slice(0, 6).reduce((s, x) => s + x, 0) / 6;
      releases.push({ kind: 'album', quality: Math.round(0.45 * avg + 0.3 * 70 + 0.25 * skills.guitar), day, units: 0 });
    }
    // Hafta sonu: satışlar (yalnızca Türkiye'nin üç şehri), görevler
    if ((day + 1) % 7 === 0) {
      const weekIdx = (day + 1) / 7;
      for (const r of releases) {
        const wi = Math.floor((day - r.day) / 7);
        let units = 0;
        for (const id of TR3) units += weeklyUnits(r.kind, r.quality, fame[id], CITY_BY_ID[id].genrePopularity[GENRE], CITY_BY_ID[id], wi, rand);
        r.units += units;
        const inc = (units * RELEASE_RULES[r.kind].price * BAND_SHARE) / MEMBERS;
        money += inc;
        w.incSales += inc;
        stats.best_units = Math.max(stats.best_units, r.units);
      }
      const mi = missionsFor(1, weekIdx).reduce((s, m) => s + m.reward, 0);
      money += mi;
      w.incMission += mi;
      stats.skills_known = Object.keys(skills).length;
      stats.max_skill = Math.max(...Object.values(skills));
      rows.push({ week: weekIdx, fame: { ...fame }, role: skills.guitar, money, stats: { ...stats }, ...w, quality: qN ? qSum / qN : 0 });
      w = zero();
      qSum = 0;
      qN = 0;
    }
  }
  return rows;
}

const net = (r: WeekRow) => r.incGig + r.incJob + r.incSales + r.incMission - r.expLiving - r.expSchool - r.expMusic;
const firstWeek = (rows: WeekRow[], city: string, f: number) => rows.find((r) => r.fame[city] >= f)?.week ?? '>52';
const sims = PROFILES.map((pr) => ({ pr, old: simulate(pr, 52, false), now: simulate(pr, 52, true) }));

p('## (ii) Şöhret temposu ve para akışı (oyuncu başına, 4 kişilik rock grubu, ev şehri İstanbul)');
p();
p('### Özet: eski kural (doygunluk yok) ve yeni kural');
p();
p(
  table(
    ['Profil', 'Kural', 'Kulüp (15)', 'Salon (45)', 'Stadyum (75)', '3 şehirde stadyum', '26. hafta net $/hafta', 'Birikmiş $ (12. hf)', 'Birikmiş $ (26. hf)', 'Birikmiş $ (52. hf)'],
    sims.flatMap(({ pr, old, now }) =>
      ([['eski', old], ['yeni', now]] as const).map(([label, rows]) => {
        const all3 = rows.find((r) => TR3.every((id) => r.fame[id] >= 75))?.week ?? '>52';
        return [pr.key + ' ' + pr.name, label, firstWeek(rows, 'istanbul', 15), firstWeek(rows, 'istanbul', 45), firstWeek(rows, 'istanbul', 75), all3, r0(net(rows[25])), r0(rows[11].money), r0(rows[25].money), r0(rows[51].money)];
      }),
    ),
  ),
);
p();
p('Sahne eşikleri ev şehri İstanbul içindir (diğer şehirler yurt içi yayılmayla da büyür).');
p();

const SHOW_WEEKS = [1, 2, 4, 8, 12, 16, 26, 39, 52];
for (const key of ['A', 'D']) {
  const s = sims.find((x) => x.pr.key === key)!;
  for (const [label, rows] of [['eski', s.old], ['yeni', s.now]] as const) {
    p(`### ${s.pr.key} ${s.pr.name}, ${label} kural: ${s.pr.studyHoursPerDay} saat okul/gün, ${s.pr.workHoursPerDay} saat mesai/gün, ${s.pr.rehearseHoursPerWeek} saat prova/hafta`);
    p();
    p(
      table(
        ['Hafta', 'Şöhret (İst.)', 'Sahne', 'Ort. kalite', 'Gitar', 'Konser $', 'Mesai $', 'Plak $', 'Görev $', 'Yaşam $', 'Okul $', 'Müzik $', 'Net $', 'Birikmiş $'],
        rows
          .filter((r) => SHOW_WEEKS.includes(r.week))
          .map((r) => [r.week, r1(r.fame.istanbul), venueFor(r.fame.istanbul), r1(r.quality), r1(r.role), r0(r.incGig), r0(r.incJob), r0(r.incSales), r0(r.incMission), r0(r.expLiving), r0(r.expSchool), r0(r.expMusic), r0(net(r)), r0(r.money)]),
      ),
    );
    p();
  }
}

p('### Paranın gidebileceği yerler (tek seferlik, VIP hariç)');
p();
{
  const shopItems = ITEMS.filter((i) => !i.vip && !i.crafted && !i.reward);
  const best = (slot: string) => Math.max(...shopItems.filter((i) => i.slot === slot).map((i) => i.price));
  const sum = (slot: string) => shopItems.filter((i) => i.slot === slot).reduce((s, i) => s + i.price, 0);
  const rows: (string | number)[][] = [
    ['En iyi enstrüman (kendi rolün)', r0(best('guitar'))],
    ['En iyi kıyafet', r0(best('outfit'))],
    ['En iyi araç', r0(best('vehicle'))],
    ['Bütün sanat eserleri', r0(sum('art'))],
    ['Bar ruhsatı (İstanbul)', r0(20000)],
    ['Plak şirketi (İstanbul)', r0(30000)],
  ];
  p(table(['Kalem', '$'], rows));
  p();
  const total = best('guitar') + best('outfit') + best('vehicle') + sum('art') + 20000 + 30000;
  p(`Toplam tek seferlik: **$${r0(total)}**. Sürekli giderler: ev ${HOMES.map((h) => `${h.name.tr} $${h.rent}`).join(', ')} (haftalık, şehir çarpanıyla), okul $30/saat, stüdyo $20/saat.`);
  p();
  p(table(['Profil', 'Eski: toplamı geçtiği hafta', 'Yeni: toplamı geçtiği hafta'], sims.map(({ pr, old, now }) => [pr.key + ' ' + pr.name, old.find((r) => r.money >= total)?.week ?? '>52', now.find((r) => r.money >= total)?.week ?? '>52'])));
}
p();

// =====================================================================
// (iii) İçerik tüketim hızı
// =====================================================================

p('## (iii) İçerik tüketim hızı (yeni kural, hafta)');
p();
// skills_known izlenmez: simülasyon yeni beceri (kitap) açmaz, yalnızca başlangıç becerilerini çalışır
const TRACKED: StatId[] = ['gigs', 'songs', 'best_song', 'recordings', 'singles', 'albums', 'shifts', 'best_units', 'epic_gigs', 'stadium_gigs', 'max_skill'];
const weekReached = (rows: WeekRow[], stat: StatId, min: number) => rows.find((x) => (x.stats[stat] ?? 0) >= min)?.week ?? '>52';
const COLS = sims.map((s) => s.pr.key);
{
  const rows = STAT_ACHIEVEMENTS.filter((x) => TRACKED.includes(x.rule.stat)).map((a) => [a.id, `${a.rule.stat} ≥ ${a.rule.min}`, ...sims.map((s) => weekReached(s.now, a.rule.stat, a.rule.min))]);
  p(`Veri dosyasındaki ${STAT_ACHIEVEMENTS.length} istatistik başarımından simülasyonun izlediği ${rows.length} tanesi (sütunlar profil harfleri):`);
  p();
  p(table(['Başarım', 'Kural', ...COLS], rows));
  p();
  const code: [string, (r: WeekRow) => boolean][] = [
    ['gigs_10', (r) => (r.stats.gigs ?? 0) >= 10],
    ['gigs_50', (r) => (r.stats.gigs ?? 0) >= 50],
    ['songs_10', (r) => (r.stats.songs ?? 0) >= 10],
    ['great_song (60)', (r) => (r.stats.best_song ?? 0) >= 60],
    ['first_album', (r) => (r.stats.albums ?? 0) >= 1],
    ['gold (1.000)', (r) => (r.stats.best_units ?? 0) >= 1000],
    ['hall_gig (45)', (r) => Math.max(...Object.values(r.fame)) >= 45],
    ['local_star (30)', (r) => Math.max(...Object.values(r.fame)) >= 30],
    ['superstar (75)', (r) => Math.max(...Object.values(r.fame)) >= 75],
    ['skilled (45)', (r) => (r.stats.max_skill ?? 0) >= 45],
    ['master (60)', (r) => (r.stats.max_skill ?? 0) >= 60],
    ['legend (90)', (r) => (r.stats.max_skill ?? 0) >= 90],
    ['epic_gig', (r) => (r.stats.epic_gigs ?? 0) >= 1],
  ];
  p('Kodla açılan başarımlardan simülasyonda karşılığı olanlar (eski → yeni):');
  p();
  p(table(['Başarım', ...COLS], code.map(([id, f]) => [id, ...sims.map((s) => `${s.old.find(f)?.week ?? '>52'} → ${s.now.find(f)?.week ?? '>52'}`)])));
  p();
  const crow: (string | number)[][] = [];
  for (const ch of CHAINS) {
    for (const st of ch.steps) {
      if (!st.rule || !TRACKED.includes(st.rule.stat)) continue;
      crow.push([ch.id, `${st.rule.stat} ≥ ${st.rule.min}`, ...sims.map((s) => weekReached(s.now, st.rule!.stat, st.rule!.min))]);
    }
  }
  p('Zincir adımlarından izlenenler:');
  p();
  p(table(['Zincir', 'Adım', ...COLS], crow));
  p();
}
{
  const N = 200;
  const weeksToAll: number[] = [];
  for (let id = 1; id <= N; id++) {
    const seen = new Set<string>();
    let wk = 0;
    while (seen.size < MISSIONS.length && wk < 1000) {
      wk++;
      for (const m of missionsFor(id, wk)) seen.add(m.id);
    }
    weeksToAll.push(wk);
  }
  weeksToAll.sort((a, b) => a - b);
  const mean = weeksToAll.reduce((s, x) => s + x, 0) / N;
  p(`Haftalık görev havuzu: ${MISSIONS.length} görev, haftada 3. ${N} karakterde bütün görevleri en az bir kez görmek ortalama **${r1(mean)} hafta** (medyan ${weeksToAll[N / 2]}, en kötü %10 ${weeksToAll[Math.floor(N * 0.9)]}). Havuz tükenmez, görevler tekrar eder.`);
  p();
}
p(`Yayın temposu (pacing.ts): liste haftası ${PACING.chartWeekDays} gün, single beklemesi ${PACING.singleCooldownDays} gün, albüm ${PACING.albumCooldownDays} gün, şehir doygunluğu penceresi ${PACING.citySaturationHours} oyun saati. 52 haftada en fazla ${Math.floor((52 * 7) / PACING.singleCooldownDays)} single ve ${Math.floor((52 * 7) / PACING.albumCooldownDays) + 1} albüm.`);

console.log(out.join('\n'));
