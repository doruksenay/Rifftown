import {
  CITY_BY_ID,
  CRIME_BY_ID,
  RELEASE_RULES,
  bailCost,
  chartFameBonus,
  crimeChance,
  solveChance,
  weeklyUnits,
  type GigPerformer,
  INSTRUMENTS,
  SESSION_MUSICIAN,
  ROLE_SKILLS,
  type Skills,
  gigReview,
  learnBlocker,
  levelUpText,
  roleSkill,
  startingSkills,
  tierName,
  tierOf,
  VENUE_RULES,
  computeGig,
  songQuality,
  studyGain,
  travelOptions,
} from '@rifftown/shared';
import { describe, expect, it } from 'vitest';

const fixed = (v: number) => () => v;
const skills = (main: number, stage: number): Skills => {
  const s: Skills = {};
  for (const r of INSTRUMENTS) {
    s[ROLE_SKILLS[r].basic] = main;
    s[ROLE_SKILLS[r].specific] = main;
  }
  for (const k of ['showmanship', 'pro_showmanship', 'dancing', 'audience']) s[k] = stage;
  return s;
};
const performer = (level: number, fam: number, songIds: number[], present = true): GigPerformer => ({
  characterId: 1,
  role: 'guitar',
  skills: skills(level, level),
  mood: 80,
  health: 100,
  present,
  instrumentBonus: 0,
  outfitBonus: 0,
  familiarity: Object.fromEntries(songIds.map((id) => [id, fam])),
});
const setlist = (q: number, n: number) => Array.from({ length: n }, (_, i) => ({ id: i + 1, quality: q }));
const gig = (performers: GigPerformer[], q: number, n: number, fame = 0, venue: 'bar' | 'club' | 'hall' = 'bar') =>
  computeGig({ venue, fame, genre: 'rock', city: CITY_BY_ID.istanbul, performers, setlist: setlist(q, n), rand: fixed(0.5) });

describe('oyun dengesi', () => {
  it('yetenek, aşinalık ve şarkı kalitesi konser kalitesini artırır', () => {
    const ids = [1, 2, 3, 4];
    const weak = gig([performer(15, 30, ids)], 15, 4).quality;
    const skilled = gig([performer(50, 30, ids)], 15, 4).quality;
    const rehearsed = gig([performer(15, 90, ids)], 15, 4).quality;
    const goodSongs = gig([performer(15, 30, ids)], 60, 4).quality;
    expect(skilled).toBeGreaterThan(weak);
    expect(rehearsed).toBeGreaterThan(weak);
    expect(goodSongs).toBeGreaterThan(weak);
  });

  it('yeni başlayan tek oyuncu, kiralık müzisyenlerle bar konserinden kâr eder', () => {
    const ids = [1, 2, 3, 4];
    const sm = SESSION_MUSICIAN.bar;
    const sessions: GigPerformer[] = (['bass', 'drums', 'keys'] as const).map((role) => ({
      ...performer(sm.skill, 70, ids),
      characterId: null,
      role,
      skills: { ...skills(10, sm.stage), [ROLE_SKILLS[role].basic]: sm.skill, [ROLE_SKILLS[role].specific]: sm.skill },
    }));
    const me = { ...performer(0, 45, ids), role: 'vocals' as const, skills: startingSkills('vocals', 'pop') };
    const r = gig([me, ...sessions], 14, 4);
    expect(r.revenue).toBeGreaterThan(sm.fee * 3);
    expect(r.fameDelta).toBeGreaterThanOrEqual(0);
  });

  it('iyi hazırlanmış grup şöhret kazanır, kötü konser kaybettirir', () => {
    const ids = [1, 2, 3, 4, 5, 6];
    expect(gig([performer(60, 90, ids), performer(60, 90, ids)], 60, 6, 10).fameDelta).toBeGreaterThan(0);
    expect(gig([performer(5, 0, ids), performer(5, 0, ids, false)], 5, 1, 10).fameDelta).toBeLessThan(0);
  });

  it('kimse gelmezse konser gelirsiz ve şöhret kaybıyla biter', () => {
    const r = gig([performer(50, 50, [1], false)], 50, 1, 20);
    expect(r.revenue).toBe(0);
    expect(r.fameDelta).toBeLessThan(0);
  });

  it('seyirci mekân kapasitesini aşmaz ve şöhretle artar', () => {
    for (const venue of ['bar', 'club', 'hall'] as const) {
      const full = gig([performer(80, 100, [1])], 90, 1, 100, venue);
      expect(full.attendance).toBeLessThanOrEqual(VENUE_RULES[venue].capacity);
    }
    expect(gig([performer(30, 30, [1])], 30, 1, 60).attendance).toBeGreaterThan(gig([performer(30, 30, [1])], 30, 1, 0).attendance);
  });

  it('beceri artışı yükseldikçe yavaşlar, okul ve enstrüman hızlandırır', () => {
    expect(studyGain(10, 2, false, 80)).toBeGreaterThan(studyGain(80, 2, false, 80));
    expect(studyGain(10, 2, true, 80)).toBeGreaterThan(studyGain(10, 2, false, 80));
    expect(studyGain(10, 2, false, 80, 100, 7)).toBeGreaterThan(studyGain(10, 2, false, 80));
    expect(studyGain(10, 2, false, 80, 20)).toBeLessThan(studyGain(10, 2, false, 80, 100));
    expect(studyGain(110, 2, false, 80)).toBe(0);
  });

  it('şarkı kalitesi söz yazarlığıyla artar ve 1–100 aralığında kalır', () => {
    expect(songQuality(80, fixed(0.5))).toBeGreaterThan(songQuality(5, fixed(0.5)));
    expect(songQuality(0, fixed(0))).toBeGreaterThanOrEqual(1);
    expect(songQuality(100, fixed(1))).toBeLessThanOrEqual(100);
  });

  it('yol seçenekleri: kıtalar arası sadece uçak, yakın şehirlere otobüs', () => {
    expect(travelOptions('istanbul', 'ankara').map((o) => o.mode)).toEqual(['bus', 'plane']);
    expect(travelOptions('istanbul', 'newyork').map((o) => o.mode)).toEqual(['plane']);
    expect(travelOptions('newyork', 'losangeles').map((o) => o.mode)).toEqual(['plane']);
    const [bus, plane] = travelOptions('istanbul', 'izmir');
    expect(bus.hours).toBeGreaterThan(plane.hours);
    expect(bus.cost).toBeLessThan(plane.cost);
    expect(travelOptions('istanbul', 'istanbul')).toEqual([]);
  });

  it('kalite ölçeği: en üst seviye büyük harfle, diğerleri küçük harfle', () => {
    expect(tierName('quality', 89.9, 'tr')).toBe('olağanüstü');
    expect(tierName('quality', 90, 'tr')).toBe('DESTANSI');
    expect(tierName('quality', 100, 'en')).toBe('EPIC');
    expect(tierName('quality', 0, 'tr')).toBe('berbat');
    expect(tierOf('quality', 95).isTop).toBe(true);
    expect(tierOf('quality', 45).progress).toBeCloseTo(0.5);
  });

  it('beceri ağacı: öncül şartlar ve rol becerisi', () => {
    const s = startingSkills('guitar', 'rock');
    expect(learnBlocker(s, 'bass')).toBeNull(); // temel telli çalgılar 20, şart 15
    expect(learnBlocker(s, 'drums')).toBe('missing_prereq');
    expect(learnBlocker(s, 'guitar')).toBe('already_known');
    expect(roleSkill(s, 'guitar')).toBeGreaterThan(roleSkill(s, 'drums'));
  });

  it('seviye atlama cümleleri', () => {
    expect(levelUpText('guitar', 62, 'tr')).toBe('Artık usta bir gitaristsin!');
    expect(levelUpText('guitar', 16, 'en')).toBe("You're now an apprentice guitarist!");
    expect(levelUpText('genre_rock', 31, 'tr')).toBe('Rock: artık amatör seviyedesin!');
  });

  it('konser eleştirisi o konseri bilir', () => {
    const r = gigReview({
      quality: 65, attendance: 72, capacity: 80, presentCount: 3, memberCount: 4,
      venue: { tr: 'Kadıköy Bodrum Bar', en: 'Kadikoy Basement Bar' }, city: { tr: 'İstanbul', en: 'Istanbul' },
      bestSong: 'Son Vapur', seed: 0,
    });
    expect(r.tr).toContain('Kadıköy Bodrum Bar tıklım tıklımdı.');
    expect(r.tr).toContain('72 seyirci bis istedi');
    expect(r.tr).toContain('1 üye sahneye çıkmadı');
    expect(r.en).toContain('72 people');
  });

  it('her şehirde tüm mekân türleri ve en az bir iş yeri var', () => {
    for (const city of Object.values(CITY_BY_ID)) {
      const types = new Set(city.locations.map((l) => l.type));
      for (const t of ['bar', 'club', 'hall', 'school', 'studio', 'work', 'hospital', 'music_store', 'boutique', 'gallery', 'bookstore']) {
        expect(types.has(t as any), `${city.id} ${t}`).toBe(true);
      }
    }
    expect(INSTRUMENTS.length).toBe(8); // 5 temel rol + saksofon, keman, perküsyon
  });
});

describe('kayıt, satış ve suç dengesi', () => {
  const mid = () => 0.5;
  it('satış şöhret ve kaliteyle artar, haftalar geçtikçe azalır, satış süresi bitince durur', () => {
    const ist = CITY_BY_ID.istanbul;
    const unknown = weeklyUnits('single', 70, 0, 1, ist, 0, mid);
    const local = weeklyUnits('single', 70, 40, 1, ist, 0, mid);
    const star = weeklyUnits('single', 70, 90, 1, ist, 0, mid);
    expect(unknown).toBe(0);
    expect(local).toBeGreaterThan(0);
    expect(star).toBeGreaterThan(local * 2);
    expect(weeklyUnits('single', 95, 40, 1, ist, 0, mid)).toBeGreaterThan(weeklyUnits('single', 30, 40, 1, ist, 0, mid));
    expect(weeklyUnits('single', 70, 40, 1, ist, 3, mid)).toBeLessThan(local);
    expect(weeklyUnits('single', 70, 90, 1, ist, RELEASE_RULES.single.weeks, mid)).toBe(0);
    // Bir süperstarın albümü tüm şehirlerde platine ulaşabilir ama tek haftada değil
    expect(weeklyUnits('album', 90, 100, 1.2, ist, 0, mid)).toBeLessThan(1000);
  });
  it('liste birinciliği tanınmayan gruba daha çok şöhret getirir', () => {
    expect(chartFameBonus(1, 10)).toBeGreaterThan(chartFameBonus(1, 90));
    expect(chartFameBonus(1, 10)).toBeGreaterThan(chartFameBonus(15, 10));
    expect(chartFameBonus(1, 100)).toBeGreaterThan(0);
  });
  it('suç şansı becerilerle artar, polisle düşer, sınırlar içinde kalır', () => {
    const pick = CRIME_BY_ID.pickpocket;
    const novice = crimeChance(pick, {}, 0);
    const pro = crimeChance(pick, { stealth: 80, street_smarts: 80 }, 0);
    expect(pro).toBeGreaterThan(novice);
    expect(crimeChance(pick, { stealth: 80, street_smarts: 80 }, 3)).toBeLessThan(pro);
    expect(crimeChance(CRIME_BY_ID.burglary, {}, 20)).toBe(0.08);
    expect(crimeChance(pick, { stealth: 100, street_smarts: 100 }, 0)).toBe(0.92);
    expect(solveChance({ law: 100, investigation: 100 }, 'agent', {})).toBe(0.9);
    expect(solveChance({}, 'police', { stealth: 100 })).toBe(0.1);
    expect(bailCost(10, 1)).toBe(400);
  });
});

describe('tempo', () => {
  it('takvim tek yerde: single 28, albüm 112 gün; liste haftası 7 gün; şöhret ödülü günlük aynı', async () => {
    const { PACING, RELEASE_RULES: R, CHART_WEEK_DAYS, chartFameBonus: bonus } = await import('@rifftown/shared');
    expect(R.single.cooldownDays).toBe(PACING.singleCooldownDays);
    expect(R.album.cooldownDays).toBe(112);
    expect(CHART_WEEK_DAYS).toBe(7);
    // Satış süresi liste haftası cinsinden ve bekleme süresinden uzun
    expect(R.single.weeks * CHART_WEEK_DAYS).toBeGreaterThanOrEqual(R.single.cooldownDays);
    expect(R.album.weeks * CHART_WEEK_DAYS).toBeGreaterThanOrEqual(R.album.cooldownDays);
    // Liste birinciliğinin günlük şöhret değeri eski 3 günlük haftayla aynı (0,7 / 3 ≈ 1,6 / 7)
    expect(bonus(1, 0) / CHART_WEEK_DAYS).toBeCloseTo(0.7 / 3, 1);
    // Yayın başına toplam satış artar ama zaman başına yayın geliri azalır (enflasyon freni)
    const total = (k: 'single' | 'album') => R[k].base * (1 - R[k].decay ** R[k].weeks) / (1 - R[k].decay);
    const perDayNew = total('single') / R.single.cooldownDays;
    const perDayOld = (140 * (1 - 0.86 ** 19)) / (1 - 0.86) / 7;
    expect(perDayNew).toBeLessThan(perDayOld);
    expect(total('single')).toBeGreaterThan(1000);
  });
});
