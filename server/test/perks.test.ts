// Kariyer becerilerinin etkileri: pazarlama, muhasebe, lojistik, sözleşme hukuku, radyo programcılığı, fotoğrafçılık
import {
  LABEL_BAND_SHARE_RANGE,
  PERK_CAPS,
  SKILL_BY_ID,
  accountingCostMult,
  articleImpact,
  crewFees,
  labelSplit,
  logisticsMoraleMult,
  logisticsWearMult,
  marketingAttendanceMult,
  marketingSalesMult,
  maxBandShare,
  photographyArticleBonus,
  photographyVideoBonus,
  radioHostingMult,
} from '@rifftown/shared';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { pool } from '../src/db';
import { processUpkeep } from '../src/game/business';
import { processLabels } from '../src/game/labels';
import { processChartWeeks } from '../src/game/music';
import { crewForGig } from '../src/game/touring';
import { blurForNonVip } from '../src/visibility';
import { advance, newPlayer, setMoney, setSkills, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});
afterEach(() => vi.restoreAllMocks());

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);

async function bandOf(p: Awaited<ReturnType<typeof newPlayer>>, n = 4) {
  for (let i = 0; i < n; i++) await q(`INSERT INTO songs(author_id, title, genre, quality) VALUES ($1, $2, 'rock', 50)`, [p.character.id, `PK${p.character.id}-${i}`]);
  return (await p.c.post('/api/bands', { name: `Perk ${p.character.id}`, genre: 'rock', role: 'guitar' })).body.band;
}
async function finish(characterId: number) {
  await q(`UPDATE actions SET ends_at = now() WHERE character_id = $1 AND status = 'active'`, [characterId]);
  await advance(1);
}

describe('kurallar: etkiler küçük ve tavanlı', () => {
  it('her etki beceriyle büyür, 100\'de tavana varır, tavanı aşmaz', () => {
    expect(marketingAttendanceMult(0)).toBe(1);
    expect(marketingAttendanceMult(100)).toBe(1 + PERK_CAPS.marketingAttendance);
    expect(marketingAttendanceMult(500)).toBe(1 + PERK_CAPS.marketingAttendance);
    expect(marketingSalesMult(50)).toBeCloseTo(1.025);
    expect(accountingCostMult(100)).toBe(0.9);
    expect(accountingCostMult(-20)).toBe(1);
    expect(logisticsMoraleMult(100)).toBe(0.7);
    expect(logisticsWearMult(100)).toBe(0.75);
    expect(radioHostingMult(100)).toBe(1.1);
    expect(photographyVideoBonus(100)).toBe(4);
    expect(photographyArticleBonus(50)).toBe(1);
    expect(maxBandShare(0)).toBe(LABEL_BAND_SHARE_RANGE[1]);
    expect(maxBandShare(100)).toBe(0.65);
    // Muhasebe ekip ücretini düşürür (muhasebeci ekip üyesiyle birleşir)
    expect(crewFees(['sound_tech'], 1, 100)).toBe(54);
    expect(crewFees(['sound_tech', 'accountant'], 1, 100)).toBeLessThan(crewFees(['sound_tech', 'accountant'], 1, 0));
    // Fotoğrafçılık haberin etkisini büyütür; olumsuz haberde %80'i
    expect(articleImpact('positive', 0, 0, 0, 100) - articleImpact('positive', 0, 0, 0, 0)).toBeCloseTo(2);
    expect(articleImpact('negative', 0, 0, 0, 0) - articleImpact('negative', 0, 0, 0, 100)).toBeCloseTo(1.6);
    expect(articleImpact('neutral', 0, 0, 0, 100)).toBe(0.5);
    // Şirket payı veritabanı tavanını (%65) aşamaz
    expect(labelSplit(1000, 0.9, 0).band).toBe(Math.round(600 * 0.65));
  });

  it('açıklamalar etkiyi anlatıyor (artık ölü beceri yok)', () => {
    for (const id of ['marketing', 'accounting', 'logistics', 'contract_law', 'radio_hosting', 'photography']) {
      expect(SKILL_BY_ID[id].about.tr.length, id).toBeGreaterThan(30);
      expect(SKILL_BY_ID[id].about.en.length, id).toBeGreaterThan(30);
    }
  });

  it('bulanıklaştırma: azami pay yüzde puanına yuvarlanır', () => {
    expect((blurForNonVip({ maxBandShare: 0.6375 }) as any).maxBandShare).toBe(0.63);
  });
});

describe('sunucuda bağlantılar', () => {
  it('pazarlama seyirciyi, lojistik enstrüman yıpranmasını etkiler (konser)', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const a = await newPlayer();
    const b = await newPlayer();
    const bandA = await bandOf(a);
    const bandB = await bandOf(b);
    await setSkills(a.character.id, { marketing: 100, logistics: 100 });
    for (const p of [a, b]) {
      await setMoney(p.character.id, 5000);
      expect((await p.c.post('/api/shop/buy', { locationId: 'istanbul-music_store', itemId: 'guitar_2' })).status).toBe(200);
    }
    for (const band of [bandA, bandB]) await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 30)`, [band.id]);
    const ga = (await a.c.post('/api/gigs', { locationId: 'istanbul-club', inHours: 2, setlist: bandA.songs.map((s: any) => s.id) })).body.gig;
    const gb = (await b.c.post('/api/gigs', { locationId: 'istanbul-club', inHours: 12, setlist: bandB.songs.map((s: any) => s.id) })).body.gig;
    await q(`UPDATE gigs SET starts_at = now() - interval '1 second' WHERE id = ANY($1::bigint[])`, [[ga.id, gb.id]]);
    await advance(1);
    const res = async (id: number) => (await q('SELECT result FROM gigs WHERE id = $1', [id])).rows[0].result;
    const ra = await res(ga.id);
    const rb = await res(gb.id);
    expect(ra.attendance).toBe(Math.min(350, Math.round(rb.attendance * 1.05)));
    const wear = async (id: number) => Number((await q(`SELECT wear FROM inventory WHERE character_id = $1 AND item_id = 'guitar_2'`, [id])).rows[0].wear);
    expect(await wear(a.character.id)).toBeCloseTo(2.25);
    expect(await wear(b.character.id)).toBeCloseTo(3);
  });

  it('muhasebe ekip ücretini düşürür; lojistik ekip moral kaybını azaltır', async () => {
    const p = await newPlayer();
    const band = await bandOf(p, 1);
    await q(`INSERT INTO band_crew(band_id, role) VALUES ($1, 'sound_tech'), ($1, 'promoter')`, [band.id]);
    const plain = await crewForGig(pool, band.id, 'istanbul');
    const perk = await crewForGig(pool, band.id, 'istanbul', { accounting: 100, logistics: 100 });
    expect(perk.fee).toBe(Math.round(plain.fee * 0.9));
    expect(perk.moraleLoss).toBeCloseTo(plain.moraleLoss * 0.7);
    expect(perk.wearMult).toBeCloseTo(0.75);
  });

  it('muhasebe işletmenin ve plak şirketinin haftalık giderini düşürür', async () => {
    const p = await newPlayer();
    await setMoney(p.character.id, 90000);
    expect((await p.c.post('/api/businesses/istanbul-biz1/buy')).status).toBe(200);
    expect((await p.c.post('/api/labels', { name: 'Defter Plak' })).status).toBe(200);
    await setSkills(p.character.id, { accounting: 100 });
    const view = (await p.c.get('/api/businesses/istanbul-biz1')).body.business;
    expect(view.upkeep).toBe(Math.round(350 * 0.9));
    await q(`UPDATE businesses SET upkeep_due = now() - interval '1 second', till = 0 WHERE owner_id = $1`, [p.character.id]);
    await q(`UPDATE labels SET upkeep_due = now() - interval '1 second', till = 1000 WHERE owner_id = $1`, [p.character.id]);
    await processUpkeep();
    await processLabels();
    const log = (await q(`SELECT amount FROM business_log WHERE location_id = 'istanbul-biz1' AND kind = 'upkeep'`)).rows[0];
    expect(log.amount).toBe(-Math.round(350 * 0.9));
    expect((await q('SELECT till FROM labels WHERE owner_id = $1', [p.character.id])).rows[0].till).toBe(1000 - Math.round(400 * 0.9));
  });

  it('sözleşme hukuku: liderin becerisi grubun pay tavanını %65\'e çıkarır', async () => {
    const owner = await newPlayer();
    const lead = await newPlayer();
    await setMoney(owner.character.id, 60000);
    const band = await bandOf(lead, 1);
    await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 30)`, [band.id]);
    expect((await owner.c.post('/api/labels', { name: 'Hukuk Plak' })).status).toBe(200);
    const offer = (share: number) => owner.c.post('/api/labels/mine/offers', { bandId: band.id, bandShare: share, advance: 0, weeks: 12 });
    expect((await offer(0.65)).body.error).toBe('invalid_share');
    const k = (await offer(0.5)).body.id;
    // Lider karşı teklifte tavanı aşamaz; beceriyle aşabilir
    expect((await lead.c.post(`/api/contracts/${k}/counter`, { bandShare: 0.65, advance: 0, weeks: 12 })).body.error).toBe('invalid_share');
    await setSkills(lead.character.id, { contract_law: 100 });
    expect((await lead.c.post(`/api/contracts/${k}/counter`, { bandShare: 0.65, advance: 0, weeks: 12 })).status).toBe(200);
    const view = (await lead.c.get('/api/labels')).body.mine.contracts[0];
    expect(view.maxBandShare).toBe(0.65);
    // Lider beceriyi kaybederse (ör. liderlik el değiştirdi) tavanın üstündeki pay imzalanamaz
    await q(`UPDATE characters SET skills = skills - 'contract_law' WHERE id = $1`, [lead.character.id]);
    expect((await owner.c.post(`/api/contracts/${k}/accept`)).body.error).toBe('invalid_share');
    await setSkills(lead.character.id, { contract_law: 100 });
    expect((await owner.c.post(`/api/contracts/${k}/accept`)).status).toBe(200);
    expect(Number((await q('SELECT band_share FROM label_contracts WHERE id = $1', [k])).rows[0].band_share)).toBeCloseTo(0.65);
  });

  it('radyo programcılığı çalınmayı, pazarlama plak satışını artırır (liste haftası)', async () => {
    const make = async (skills: Record<string, number>) => {
      const p = await newPlayer();
      const band = await bandOf(p, 1);
      if (Object.keys(skills).length) await setSkills(p.character.id, skills);
      await q(`INSERT INTO band_fame(band_id, city_id, fame) VALUES ($1, 'istanbul', 60)`, [band.id]);
      await q(`INSERT INTO releases(band_id, kind, title, song_ids, quality, released_at) VALUES ($1, 'single', 'R', $2, 80, now() - interval '1 hour')`, [band.id, [band.songs[0].id]]);
      return band.id as number;
    };
    const base = await make({});
    const radio = await make({ radio_hosting: 100 });
    const mkt = await make({ marketing: 100 });
    await processChartWeeks(() => 0.5);
    await q(`UPDATE chart_weeks SET ends_at = now() - interval '1 second' WHERE status = 'open'`);
    await processChartWeeks(() => 0.5);
    const plays = async (b: number) => Number((await q('SELECT radio_plays FROM releases WHERE band_id = $1', [b])).rows[0].radio_plays);
    const units = async (b: number) => Number((await q('SELECT COALESCE(sum(s.units), 0) AS n FROM release_sales s JOIN releases r ON r.id = s.release_id WHERE r.band_id = $1', [b])).rows[0].n);
    expect(await plays(base)).toBeGreaterThan(0);
    expect(await plays(radio)).toBe(Math.round((await plays(base)) * 1.1));
    expect(await plays(mkt)).toBe(await plays(base));
    expect(await units(mkt)).toBeGreaterThan(await units(base));
    expect(await units(mkt)).toBeLessThanOrEqual(Math.ceil((await units(base)) * 1.06) + 1);
  });

  it('fotoğrafçılık klip kalitesine katkı yapar', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const shoot = async (photo: number) => {
      const p = await newPlayer();
      const band = await bandOf(p, 1);
      await setMoney(p.character.id, 5000);
      if (photo) await setSkills(p.character.id, { photography: photo });
      await q(`INSERT INTO recordings(band_id, song_id, quality) VALUES ($1, $2, 60)`, [band.id, band.songs[0].id]);
      const v = await p.c.post('/api/actions', { kind: 'video', songId: band.songs[0].id, locationId: 'istanbul-recording_studio' });
      expect(v.status, JSON.stringify(v.body)).toBe(200);
      await finish(p.character.id);
      return Number((await q('SELECT quality FROM music_videos WHERE band_id = $1', [band.id])).rows[0].quality);
    };
    const plain = await shoot(0);
    expect(await shoot(100)).toBe(plain + 4);
  });
});
