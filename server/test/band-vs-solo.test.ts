// Arkadaşla oynamak cezalandırılmaz (playtest Y-1, O-3): yeni oyunculardan kurulan gerçek grup, kiralık kadrolu tek
// oyuncudan hem kalitede hem kişi başı gelirde önde. Kurallar düzeyinde (computeGig) ve sunucuda (kapı payı).
import {
  BAND_CHEMISTRY,
  CITY_BY_ID,
  type GigPerformer,
  ROLE_SKILLS,
  SESSION_FAMILIARITY_BY_VENUE,
  SESSION_MUSICIAN,
  bandChemistry,
  computeGig,
  expectedAttendance,
  sessionDoorCut,
  startingSkills,
} from '@rifftown/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pool } from '../src/db';
import { advance, newPlayer, setup, teardown } from './helpers';

const fixed = (v: number) => () => v;
const songs = [1, 2, 3, 4].map((id) => ({ id, title: `S${id}`, genre: 'rock' as const, quality: 25, tempo: 'mid' as const, subgenre: null }));
/** Yeni oyuncu: başlangıç becerileri; aşinalık 25 ≈ 4 saatlik prova, 45 ≈ ilk günlerin provaları */
const newbie = (id: number, role: 'guitar' | 'vocals' | 'drums' | 'bass', fam = 45): GigPerformer => ({
  characterId: id, role, skills: startingSkills(role, 'rock'), mood: 70, health: 90, energy: 70, present: true,
  instrumentBonus: 0, outfitBonus: 0, familiarity: Object.fromEntries(songs.map((s) => [s.id, fam])),
});
const hire = (role: 'guitar' | 'vocals' | 'drums' | 'bass'): GigPerformer => {
  const sm = SESSION_MUSICIAN.bar;
  return {
    characterId: null, role, mood: 80, health: 100, present: true, instrumentBonus: 0, outfitBonus: 0,
    skills: { [ROLE_SKILLS[role].basic]: sm.skill, [ROLE_SKILLS[role].specific]: sm.skill, showmanship: sm.stage, pro_showmanship: sm.stage, dancing: sm.stage, audience: sm.stage },
    familiarity: Object.fromEntries(songs.map((s) => [s.id, SESSION_FAMILIARITY_BY_VENUE.bar])),
  };
};
const play = (performers: GigPerformer[], fame = 5) =>
  computeGig({ venue: 'bar', fame, genre: 'rock', city: CITY_BY_ID.istanbul, performers, setlist: songs, rand: fixed(0.5) });

describe('kurallar: grup ve tek oyuncu', () => {
  it('üç yeni oyunculu grup (+1 kiralık), tek oyuncu + 3 kiralıktan daha kaliteli ve daha kalabalık çalar', () => {
    const band = play([newbie(1, 'guitar'), newbie(2, 'vocals'), newbie(3, 'drums'), hire('bass')]);
    const solo = play([newbie(4, 'vocals'), hire('guitar'), hire('bass'), hire('drums')]);
    expect(band.quality).toBeGreaterThan(solo.quality);
    expect(band.attendance).toBeGreaterThan(solo.attendance);
    expect(band.fameDelta).toBeGreaterThan(solo.fameDelta);
    expect(band.factors?.chemistry).toBe('strong');
    expect(solo.factors?.chemistry).toBe('weak');
    // İlk gün (az prova) kiralık kadro kolay başlangıçtır: tek oyuncu en fazla 2 puan önde
    const band0 = play([newbie(1, 'guitar', 25), newbie(2, 'vocals', 25), newbie(3, 'drums', 25), hire('bass')]);
    const solo0 = play([newbie(4, 'vocals', 25), hire('guitar'), hire('bass'), hire('drums')]);
    expect(solo0.quality - band0.quality).toBeLessThanOrEqual(2);
  });

  it('kişi başı gelir: grup üyesi tek oyuncudan az değil (kiralıklar barda kapıdan pay alır)', () => {
    const band = play([newbie(1, 'guitar'), newbie(2, 'vocals'), newbie(3, 'drums'), hire('bass')]);
    const solo = play([newbie(4, 'vocals'), hire('guitar'), hire('bass'), hire('drums')]);
    const fee = SESSION_MUSICIAN.bar.fee;
    const bandPer = (band.revenue - sessionDoorCut('bar', band.revenue, 3, 1)) / 3 - fee / 3; // lider 1 kiralığın ücretini peşin öder
    const soloPer = solo.revenue - sessionDoorCut('bar', solo.revenue, 1, 3) - 3 * fee;
    expect(bandPer).toBeGreaterThanOrEqual(soloPer);
    // Kiralık kadro yine de kolay başlangıç: tek oyuncu kâr eder
    expect(soloPer).toBeGreaterThan(0);
  });

  it('kimya küçük sahnede büyük, büyük sahnede küçük; kiralıklar sayılmaz; 4 üyeden sonra artmaz', () => {
    expect(bandChemistry('bar', 1)).toBe(0);
    expect(bandChemistry('bar', 3)).toBe(2 * BAND_CHEMISTRY.perMember.bar);
    expect(bandChemistry('bar', 6)).toBe(bandChemistry('bar', 4));
    expect(bandChemistry('stadium', 4)).toBeLessThan(bandChemistry('bar', 4));
  });

  it('her üye kendi arkadaşlarını getirir; kapı payı salon ve stadyumda yok', () => {
    expect(expectedAttendance('bar', 0, 1, fixed(0.5), 3)).toBeGreaterThan(expectedAttendance('bar', 0, 1, fixed(0.5), 1));
    expect(sessionDoorCut('hall', 7000, 1, 3)).toBe(0);
    expect(sessionDoorCut('stadium', 30000, 1, 4)).toBe(0);
    // Peşin ücret paydan düşülür, en az sıfır
    expect(sessionDoorCut('bar', 10, 1, 3)).toBe(0);
    expect(sessionDoorCut('bar', 400, 1, 3)).toBe(Math.floor(3 * (100 - SESSION_MUSICIAN.bar.fee)));
  });
});

describe('sunucu: kapı payı konser sonucunda', () => {
  beforeAll(setup);
  afterAll(teardown);
  it('tek oyuncunun bar konserinde kiralıkların payı düşülür ve raporda görünür', async () => {
    const p = await newPlayer({ instrument: 'vocals' });
    await pool.query(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, 'Kapi', 'rock', 30)`, [p.character.id]);
    const band = (await p.c.post('/api/bands', { name: 'Kapı Payı', genre: 'rock', role: 'vocals' })).body.band;
    await pool.query(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 10) ON CONFLICT (band_id, city_id) DO UPDATE SET fame = 10`, [band.id]);
    const g = await p.c.post('/api/gigs', { locationId: 'istanbul-bar', inHours: 2, setlist: band.songs.map((s: { id: number }) => s.id), sessionRoles: ['guitar', 'bass', 'drums'] });
    expect(g.status).toBe(200);
    await advance();
    const r = (await pool.query('SELECT result FROM gigs WHERE id = $1', [g.body.gig.id])).rows[0].result;
    expect(r.sessionCut).toBeGreaterThan(0);
    expect(r.perMember).toBe(r.revenue);
    // Kişi başı pay: oyuncuya kalan, kiralıkların her birinin aldığından (ücret + pay) az değil
    expect(r.perMember + 0.5).toBeGreaterThanOrEqual(r.sessionCut / 3 + SESSION_MUSICIAN.bar.fee - 1);
  });
});
