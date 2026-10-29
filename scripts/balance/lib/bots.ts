// Arketip botları: gerçek API'yi (Fastify inject) kullanarak oynar. Kararlar veritabanındaki ham değerlere
// bakılarak verilir (VIP olmayanlara API bulanık değer döndürür), ama her eylem gerçek kurallardan geçer.
import { CHAINS, CORE_ROLES, VENUE_RULES, type Instrument, familiarityCap, SONG_FATIGUE_WINDOW_DAYS } from '@rifftown/shared';
import { wellbeingOf } from '../../../server/src/game/wellbeing';
import { membership } from '../../../server/src/game/common';
import { type Client, pool, measured, clock, newPlayer } from './world';

export type Archetype = 'grinder' | 'grinder_solo' | 'grinder_pro' | 'busker' | 'crafter' | 'social' | 'recorder' | 'scammer' | 'worker';

export interface Bot {
  id: number;
  userId: number;
  c: Client;
  name: string;
  arch: Archetype;
  city: string;
  instrument: Instrument;
  genre: string;
  /** Arketipe özel bellek */
  mem: Record<string, any>;
  /** Olay günlüğü: ilkler (oyun saati) */
  firsts: Record<string, number>;
  /** Para örnekleri: [oyun saati, cep+banka] */
  money: [number, number][];
  /** Başarısız API çağrıları (hata kodu → sayı) */
  errors: Record<string, number>;
  nextClaimAt: number;
  partner?: Bot;
}

const H = 3_600_000;
export const simHours = (t0: number) => (clock.now() - t0) / H;

export async function makeBot(arch: Archetype, city: string, t0: number, instrument: Instrument = 'guitar', genre = 'rock'): Promise<Bot> {
  const p = await newPlayer({ cityId: city, instrument, genre });
  return { id: p.id, userId: p.userId, c: p.c, name: p.name, arch, city, instrument, genre, mem: { t0 }, firsts: {}, money: [], errors: {}, nextClaimAt: 0 };
}

function first(b: Bot, key: string) {
  if (b.firsts[key] === undefined) b.firsts[key] = simHours(b.mem.t0);
}

/** API çağrısı: para değişimini kaleme yazar, hatayı sayar */
async function call(b: Bot, cat: string, method: 'post' | 'del', url: string, body?: unknown) {
  const r = await measured(cat, () => (method === 'post' ? b.c.post(url, body) : b.c.del(url)));
  if (r.status !== 200) {
    const code = `${url.split('/')[1]}:${r.body?.error ?? r.status}`;
    b.errors[code] = (b.errors[code] ?? 0) + 1;
  }
  return r;
}

async function act(b: Bot, body: Record<string, unknown>) {
  const r = await call(b, `start:${body.kind}`, 'post', '/actions', body);
  return r.status === 200 ? true : (r.body?.error as string) ?? 'error';
}

// ---------------------------------------------------------------- Durum

async function row(id: number) {
  return (await pool.query('SELECT * FROM characters WHERE id = $1', [id])).rows[0];
}
async function busy(id: number) {
  return !!(await pool.query(`SELECT 1 FROM actions WHERE character_id = $1 AND status = 'active'`, [id])).rows.length;
}
async function bandSongs(bandId: number, me: number) {
  return (
    await pool.query(
      `SELECT s.id, s.quality, s.genre, s.created_at, COALESCE(f.value, 0)::float8 AS fam, r.quality AS rec
         FROM band_songs bs JOIN songs s ON s.id = bs.song_id
         LEFT JOIN familiarity f ON f.song_id = s.id AND f.character_id = $2
         LEFT JOIN recordings r ON r.song_id = s.id AND r.band_id = $1
        WHERE bs.band_id = $1 ORDER BY s.quality DESC`,
      [bandId, me],
    )
  ).rows;
}
async function fameIn(bandId: number, city: string) {
  return Number((await pool.query('SELECT fame FROM band_fame WHERE band_id = $1 AND city_id = $2', [bandId, city])).rows[0]?.fame ?? 0);
}
async function scheduledGigs(bandId: number) {
  return Number((await pool.query(`SELECT count(*)::int AS n FROM gigs WHERE band_id = $1 AND status = 'scheduled'`, [bandId])).rows[0].n);
}
async function lastGigAt(bandId: number) {
  const r = await pool.query(`SELECT max(starts_at) AS t FROM gigs WHERE band_id = $1 AND status IN ('done', 'scheduled')`, [bandId]);
  return r.rows[0].t ? new Date(r.rows[0].t).getTime() : 0;
}
async function recentSongs(id: number) {
  const r = await pool.query('SELECT count(*)::int AS n FROM songs WHERE author_id = $1 AND created_at > $2', [
    id,
    new Date(clock.now() - SONG_FATIGUE_WINDOW_DAYS * 24 * H),
  ]);
  return Number(r.rows[0].n);
}
async function inventory(id: number) {
  return (await pool.query('SELECT id, item_id, slot, bonus, equipped, listed FROM inventory WHERE character_id = $1', [id])).rows;
}
async function hasHome(id: number) {
  return !!(await pool.query('SELECT 1 FROM homes WHERE character_id = $1', [id])).rows.length;
}

// ---------------------------------------------------------------- Ortak davranışlar

/** Ödülleri topla: rehber, haftalık görevler, zincirler (6 oyun saatinde bir) */
async function claimAll(b: Bot) {
  if (clock.now() < b.nextClaimAt) return;
  b.nextClaimAt = clock.now() + 6 * H;
  const t = await b.c.get('/tutorial');
  for (const s of t.body?.steps ?? []) if (s.done && !s.claimed) await call(b, 'reward:tutorial', 'post', `/tutorial/${s.id}/claim`);
  const m = await b.c.get('/missions');
  for (const x of m.body?.missions ?? []) if (!x.claimed && x.progress >= x.target) await call(b, 'reward:mission', 'post', `/missions/${x.id}/claim`);
  const ch = await b.c.get('/chains');
  for (const x of ch.body?.chains ?? []) {
    if (x.step === null || !x.done) continue;
    const def = CHAINS.find((c) => c.id === x.id)!;
    const step = def.steps[x.step];
    const choice = step.choice ? step.choice[0].id : undefined;
    await call(b, 'reward:chain', 'post', `/chains/${x.id}/claim`, choice ? { choice } : {});
  }
}

/** Dinlenme / tedavi gerekiyorsa yapar ve true döner */
async function maintain(b: Bot, needEnergy = 50): Promise<boolean> {
  const r = await row(b.id);
  const well = await wellbeingOf(pool, r);
  if (r.health < 35 && r.money >= 80) {
    if ((await act(b, { kind: 'treat', locationId: `${b.city}-hospital`, hours: 2 })) === true) return true;
  }
  if (well.energy < needEnergy || well.mood < 40 || r.health < 35) {
    await act(b, { kind: 'rest', hours: well.energy < 40 || r.health < 35 ? 8 : 4 });
    return true;
  }
  return false;
}

async function work(b: Bot, hours = 8) {
  const job = b.mem.job ?? (b.mem.job = (await pool.query(`SELECT 1`)) && `${b.city}-work${b.city === 'istanbul' ? '2' : ''}`);
  let r = await act(b, { kind: 'work', locationId: job, hours });
  if (r === 'too_tired' && hours > 4) r = await act(b, { kind: 'work', locationId: job, hours: 4 });
  if (r === 'too_tired') r = await act(b, { kind: 'rest', hours: 4 });
  if (r === true) first(b, 'work');
  return r === true;
}

async function writeSong(b: Bot) {
  const n = (b.mem.songN = (b.mem.songN ?? 0) + 1);
  const r = await act(b, { kind: 'write_song', title: `Sarki ${b.id}-${n}`, genre: b.genre });
  if (r === true) first(b, 'song');
  return r === true;
}

/** Grubu kurduktan sonra yazılan şarkıları repertuvara ekler */
async function addOwnSongs(b: Bot, bandId: number) {
  const r = await pool.query('SELECT s.id FROM songs s WHERE s.author_id = $1 AND NOT EXISTS (SELECT 1 FROM band_songs bs WHERE bs.band_id = $2 AND bs.song_id = s.id)', [b.id, bandId]);
  for (const x of r.rows) await call(b, 'band', 'post', '/bands/mine/songs', { songId: Number(x.id) });
}

async function ensureBand(b: Bot) {
  let m = await membership(pool, b.id);
  if (m) return m;
  const r = await call(b, 'band', 'post', '/bands', { name: `Grup ${b.id}`, genre: b.genre, role: b.instrument });
  if (r.status === 200) first(b, 'band');
  m = await membership(pool, b.id);
  return m;
}

/** Konser setlisti: zayıflar ortada, en güçlü sona, ikinci en güçlü başa */
function orderSetlist(songs: { id: number; quality: number; fam: number }[]) {
  const usable = songs.filter((s) => s.fam >= 15).slice(0, 10);
  if (usable.length < 3) return usable.map((s) => s.id);
  const sorted = [...usable].sort((a, b) => a.quality + a.fam - (b.quality + b.fam));
  const best = sorted.pop()!;
  const second = sorted.pop()!;
  return [second.id, ...sorted.map((s) => s.id), best.id];
}

const SESSION_FOR: Record<string, Instrument[]> = {
  guitar: ['vocals', 'bass', 'drums'],
  vocals: ['guitar', 'bass', 'drums'],
  bass: ['vocals', 'guitar', 'drums'],
  drums: ['vocals', 'guitar', 'bass'],
  keys: ['vocals', 'guitar', 'drums'],
};

/** Lider konser ayarlar: şöhretin yettiği en büyük sahne. Başarılıysa true. */
async function bookGig(b: Bot, bandId: number, songs: any[], hire: boolean, plan?: Record<string, unknown>) {
  const fame = await fameIn(bandId, b.city);
  const venue = fame >= VENUE_RULES.stadium.minFame ? 'stadium' : fame >= VENUE_RULES.hall.minFame ? 'hall' : fame >= VENUE_RULES.club.minFame ? 'club' : 'bar';
  const setlist = orderSetlist(songs);
  if (!setlist.length) return false;
  const sessionRoles = hire ? SESSION_FOR[b.instrument] ?? ['vocals', 'bass', 'drums'] : [];
  for (const inHours of [6, 12, 24, 2]) {
    const r = await call(b, 'gig_booking', 'post', '/gigs', { locationId: `${b.city}-${venue}`, inHours, setlist, sessionRoles, plan });
    if (r.status === 200) {
      first(b, `book_${venue}`);
      return true;
    }
    if (r.body?.error === 'not_enough_money' && sessionRoles.length) {
      const r2 = await call(b, 'gig_booking', 'post', '/gigs', { locationId: `${b.city}-${venue}`, inHours, setlist, sessionRoles: [], plan });
      if (r2.status === 200) return true;
    }
    if (r.body?.error !== 'venue_busy' && r.body?.error !== 'gig_clash') return false;
  }
  return false;
}

/** Çekirdek müzisyen döngüsü: şarkı → grup → prova → konser. false: yapacak müzik işi yok (iş tutsun) */
async function musicianStep(b: Bot, opts: { hire: boolean; minSongs: number; gigGapH: number; reserve: number; plan?: Record<string, unknown> }) {
  const r = await row(b.id);
  const m0 = await membership(pool, b.id);
  if (!m0) {
    const mine = Number((await pool.query('SELECT count(*)::int AS n FROM songs WHERE author_id = $1', [b.id])).rows[0].n);
    if (mine < 1) return writeSong(b);
  }
  const m = await ensureBand(b);
  if (!m) return false;
  await addOwnSongs(b, m.band_id);
  const songs = await bandSongs(m.band_id, b.id);
  if (songs.length < opts.minSongs) return writeSong(b);
  // Konser
  const scheduled = await scheduledGigs(m.band_id);
  const ready = songs.filter((s: any) => s.fam >= 30).length >= Math.min(4, opts.minSongs);
  if (scheduled === 0 && ready && clock.now() - (await lastGigAt(m.band_id)) >= opts.gigGapH * H) {
    if (await bookGig(b, m.band_id, songs, opts.hire, opts.plan)) return 'booked';
  }
  // Prova: en az bilinen şarkı, tür sınırının biraz altına kadar
  const cap = familiarityCap(r.skills, b.genre as any);
  const target = Math.min(cap - 3, 75);
  const weakest = [...songs].sort((a: any, c: any) => a.fam - c.fam)[0];
  if (weakest && weakest.fam < target && r.money >= 40 + opts.reserve) {
    const res = await act(b, { kind: 'rehearse', songId: weakest.id, hours: 2, locationId: `${b.city}-studio` });
    if (res === true) {
      first(b, 'rehearse');
      return true;
    }
  }
  // Repertuvarı genişlet: 3 günlük yorgunluk penceresine saygı
  if (songs.length < 8 && (await recentSongs(b.id)) === 0) return writeSong(b);
  return false;
}

async function maybeHome(b: Bot, minMoney: number) {
  if (b.mem.home || (await hasHome(b.id))) {
    b.mem.home = true;
    return;
  }
  const r = await row(b.id);
  if (r.money < minMoney) return;
  const res = await call(b, 'rent', 'post', '/homes/rent', { homeId: 'room', locationId: `${b.city}-real_estate` });
  if (res.status === 200) {
    b.mem.home = true;
    first(b, 'home');
  }
}

async function maybeGear(b: Bot, minMoney: number, itemId: string, key: string, shop: string) {
  if (b.mem[key]) return;
  const r = await row(b.id);
  if (r.money < minMoney) return;
  const res = await call(b, 'shop', 'post', '/shop/buy', { locationId: `${b.city}-${shop}`, itemId });
  if (res.status === 200) {
    b.mem[key] = true;
    // Yeni eşyayı kuşan (eskisi kuşanılıysa)
    const inv = await inventory(b.id);
    const it = inv.filter((i: any) => i.item_id === itemId).pop();
    if (it && !it.equipped) await call(b, 'shop', 'post', `/inventory/${it.id}/equip`);
  }
}

// ---------------------------------------------------------------- Arketipler

export async function step(b: Bot) {
  if (await busy(b.id)) return;
  const r0 = await row(b.id);
  if (!r0.city_id) return;
  if (r0.jailed_until && new Date(r0.jailed_until).getTime() > clock.now()) {
    await act(b, { kind: 'rest', hours: 4 });
    return;
  }
  await claimAll(b);
  switch (b.arch) {
    case 'grinder':
    case 'grinder_solo':
      return grinder(b, b.arch === 'grinder');
    case 'grinder_pro':
      return grinderPro(b);
    case 'busker':
      return busker(b);
    case 'crafter':
      return crafter(b);
    case 'social':
      return social(b);
    case 'recorder':
      return recorder(b);
    case 'scammer':
      return scammer(b);
    case 'worker':
      if (await maintain(b, 50)) return;
      await work(b, 8);
      return;
  }
}

/** Grinder: mesai + prova + konser. hire: barda 3 kiralık müzisyen */
async function grinder(b: Bot, hire: boolean) {
  await maybeHome(b, 450);
  await maybeGear(b, 1200, `${b.instrument}_1`, 'gear1', 'music_store');
  await maybeGear(b, 2500, `${b.instrument}_2`, 'gear2', 'music_store');
  if (await maintain(b, 45)) return;
  const res = await musicianStep(b, { hire, minSongs: 4, gigGapH: 20, reserve: 60 });
  if (res === true) return;
  if (res === 'booked' && !(await busy(b.id))) {
    // Konser ayarlandı; boşta kalmasın
  }
  if (!(await busy(b.id))) await work(b, 8);
}

/** Öğrenen grinder: grinder döngüsü (3 kiralık) + boş saatlerde okulda ders (beste, söz, ana enstrüman, şovmenlik:
 *  en zayıfı). Parası azalınca mesai. Becerinin büyük sahnede belirleyici olduğunu ölçmek için (madde 1). */
async function grinderPro(b: Bot) {
  await maybeHome(b, 450);
  await maybeGear(b, 1200, `${b.instrument}_1`, 'gear1', 'music_store');
  await maybeGear(b, 2500, `${b.instrument}_2`, 'gear2', 'music_store');
  if (await maintain(b, 45)) return;
  const res = await musicianStep(b, { hire: true, minSongs: 4, gigGapH: 20, reserve: 60 });
  if (res === true || (await busy(b.id))) return;
  // Beste geliştikçe repertuvarı yenile: yorgunluk penceresi boşsa yeni şarkı yaz (setlist en iyi 10 şarkıyı seçer)
  if ((await recentSongs(b.id)) === 0) {
    if (await writeSong(b)) return;
  }
  const r = await row(b.id);
  if (r.money >= 400) {
    const targets = ['composing', 'lyrics', b.instrument, 'showmanship'];
    const weakest = targets.sort((x, y) => (r.skills[x] ?? 0) - (r.skills[y] ?? 0))[0];
    if ((r.skills[weakest] ?? 0) < 95) {
      const s = await act(b, { kind: 'study', skill: weakest, hours: 4, locationId: `${b.city}-school` });
      if (s === true) {
        first(b, 'study');
        return;
      }
    }
  }
  await work(b, 8);
}

/** Sokak müzisyeni: parkta 4 saat çal, dinlen */
async function busker(b: Bot) {
  if (await maintain(b, 30)) return;
  const r = await act(b, { kind: 'busk', role: b.instrument, hours: 4, locationId: `${b.city}-park` });
  if (r === true) first(b, 'busk');
  else if (r === 'too_tired') await act(b, { kind: 'rest', hours: 4 });
}

/** Zanaatçı: el işçiliği kitabı, tablo/gitar üretip NPC tüccara (72 saatten sonra, günde 2) satar; arada mesai */
async function crafter(b: Bot) {
  if (!b.mem.book) {
    const res = await call(b, 'skill_book', 'post', '/skills/learn', { skillId: 'craftsmanship', locationId: `${b.city}-bookstore` });
    b.mem.book = res.status === 200 || res.body?.error === 'already_known';
  }
  if (await maintain(b, 30)) return;
  const inv = await inventory(b.id);
  const crafted = inv.filter((i: any) => /_crafted$/.test(i.item_id) && !i.listed);
  // Sat: önce NPC tüccar
  for (const it of crafted) {
    const res = await call(b, 'npc_merchant', 'post', '/market/npc-sell', { locationId: `${b.city}-flea_market`, inventoryId: Number(it.id) });
    if (res.status === 200) first(b, 'npc_sale');
    else break;
  }
  const left = (await inventory(b.id)).filter((i: any) => /_crafted$/.test(i.item_id) && !i.listed).length;
  if (left < 3) {
    const r = await row(b.id);
    const skill = r.skills.craftsmanship ?? 0;
    // Beceri yükseldikçe gitar daha kârlı (malzeme $175, tavan 1,25×), düşükken tablo ($55)
    const recipe = skill >= 45 ? 'guitar' : 'painting';
    const mats: Record<string, number> = recipe === 'guitar' ? { mat_wood: 1, mat_strings: 1, mat_pickup: 1 } : { mat_canvas: 1, mat_paint: 1 };
    const have = new Map<string, number>();
    for (const i of inv) have.set(i.item_id, (have.get(i.item_id) ?? 0) + 1);
    let ok = true;
    for (const [mat, n] of Object.entries(mats)) {
      const need = n - (have.get(mat) ?? 0);
      if (need > 0) {
        const res = await call(b, 'materials', 'post', '/shop/buy', { locationId: `${b.city}-hardware`, itemId: mat, qty: need });
        if (res.status !== 200) ok = false;
      }
    }
    if (ok) {
      const res = await act(b, { kind: 'craft', recipe, locationId: `${b.city}-hardware` });
      if (res === true) {
        first(b, 'craft');
        return;
      }
    }
  }
  await work(b, 8);
}

/** Sosyal: eşiyle takıl, flört, restoran, arkadaş dersi; arada mesai */
async function social(b: Bot) {
  const p = b.partner!;
  // Anlık etkileşimler (eylem değil): takıl, flört
  const h = await call(b, 'social', 'post', `/relationships/${p.id}/hangout`);
  if (h.status === 200) first(b, 'hangout');
  const f = await call(b, 'social', 'post', `/relationships/${p.id}/flirt`);
  if (f.status === 200) first(b, 'flirt');
  if (b.mem.lead) {
    const d = await call(b, 'date', 'post', `/relationships/${p.id}/date`, { locationId: `${b.city}-restaurant` });
    if (d.status === 200) first(b, 'date');
  }
  if (!b.mem.book && b.mem.learnSkill) {
    const res = await call(b, 'skill_book', 'post', '/skills/learn', { skillId: b.mem.learnSkill, locationId: `${b.city}-bookstore` });
    b.mem.book = res.status === 200 || res.body?.error === 'already_known';
  }
  if (await maintain(b, 40)) return;
  // Arkadaştan ders (öğrenci tarafı)
  if (b.mem.learnSkill) {
    const r = await act(b, { kind: 'lesson', skill: b.mem.learnSkill, hours: 2, tutor: 'friend', tutorId: p.id });
    if (r === true) {
      first(b, 'friend_lesson');
      return;
    }
  }
  await work(b, 4);
}

/** Kayıt-albüm: şarkı, prova, kayıt, single ve albüm; konser ve mesaiyle finanse */
async function recorder(b: Bot) {
  await maybeHome(b, 450);
  if (await maintain(b, 45)) return;
  const m = await ensureBand(b);
  if (m) {
    await addOwnSongs(b, m.band_id);
    const songs = await bandSongs(m.band_id, b.id);
    const r = await row(b.id);
    // Kayıt: aşinalığı 40'ı geçmiş, kaydı olmayan şarkı
    const toRecord = songs.find((s: any) => s.rec == null && s.fam >= 40);
    if (toRecord && r.money >= 260) {
      const res = await act(b, { kind: 'record', songId: toRecord.id, locationId: `${b.city}-recording_studio` });
      if (res === true) {
        first(b, 'record');
        return;
      }
    }
    // Yayın: single (en iyi kayıt), albüm (6+ kayıt)
    const recorded = songs.filter((s: any) => s.rec != null).sort((a: any, c: any) => c.rec - a.rec);
    if (recorded.length >= 6 && r.money >= 520) {
      const res = await call(b, 'release', 'post', '/releases', { kind: 'album', title: `Album ${b.id}`, songIds: recorded.slice(0, 12).map((s: any) => s.id) });
      if (res.status === 200) first(b, 'album');
      else b.mem.albumBlocked = res.body?.error;
    }
    const used = new Set((await pool.query(`SELECT unnest(song_ids) AS id FROM releases WHERE band_id = $1 AND kind = 'single'`, [m.band_id]).catch(() => ({ rows: [] as any[] }))).rows.map((x: any) => Number(x.id)));
    const fresh = recorded.find((s: any) => !used.has(s.id));
    if (fresh && r.money >= 120) {
      const res = await call(b, 'release', 'post', '/releases', { kind: 'single', title: `Single ${b.id}-${fresh.id}`, songIds: [fresh.id] });
      if (res.status === 200) first(b, 'single');
      else if (res.body?.error === 'release_cooldown') b.mem.waitingCooldown = (b.mem.waitingCooldown ?? 0) + 1;
    }
  }
  const res = await musicianStep(b, { hire: true, minSongs: 4, gigGapH: 30, reserve: 260 });
  if (res === true) return;
  if (!(await busy(b.id))) await work(b, 8);
}

/** Dolandırıcı: ödül avcısı. Rehberi en ucuz yoldan bitirir, haftalık görevleri ve zincirleri kovalar,
 *  yankesicilik dener, sokakta çalar. Boşluk arar: ucuz adımlar, anlık etkileşimler. */
async function scammer(b: Bot) {
  // Rehber: kitapçıdan en ucuz kitap ($30 tür kitabı)
  if (!b.mem.book) {
    const res = await call(b, 'skill_book', 'post', '/skills/learn', { skillId: 'genre_pop', locationId: `${b.city}-bookstore` });
    b.mem.book = res.status === 200 || res.body?.error === 'already_known';
  }
  if (!b.mem.street) {
    const res = await call(b, 'skill_book', 'post', '/skills/learn', { skillId: 'street_smarts', locationId: `${b.city}-bookstore` });
    b.mem.street = res.status === 200 || res.body?.error === 'already_known';
  }
  await maybeHome(b, 300);
  if (await maintain(b, 30)) return;
  const m = await ensureBand(b);
  if (m) {
    await addOwnSongs(b, m.band_id);
    const songs = await bandSongs(m.band_id, b.id);
    // Rehber adımları: 1 şarkı, 1 saat prova, 1 bar konseri (tek başına), kayıt, single
    if (!songs.length) return void (await writeSong(b));
    const s = songs[0];
    if (s.fam < 15) return void (await act(b, { kind: 'rehearse', songId: s.id, hours: 1, locationId: `${b.city}-studio` }));
    if (!b.firsts.book_bar && (await scheduledGigs(m.band_id)) === 0) await bookGig(b, m.band_id, songs.map((x: any) => ({ ...x, fam: Math.max(15, x.fam) })), false);
    const r = await row(b.id);
    if (s.rec == null && r.money >= 260) {
      const res = await act(b, { kind: 'record', songId: s.id, locationId: `${b.city}-recording_studio` });
      if (res === true) return;
    }
    if (s.rec != null && !b.firsts.single && r.money >= 100) {
      const res = await call(b, 'release', 'post', '/releases', { kind: 'single', title: `Hile ${b.id}`, songIds: [s.id] });
      if (res.status === 200) first(b, 'single');
    }
  }
  // Haftalık görevlerden ucuz olanları kovala
  const ms = (await b.c.get('/missions')).body?.missions ?? [];
  const open = ms.filter((x: any) => !x.claimed && x.progress < x.target).map((x: any) => x.id as string);
  if (open.some((id: string) => id.startsWith('busk'))) {
    if ((await act(b, { kind: 'busk', role: b.instrument, hours: 4, locationId: `${b.city}-park` })) === true) return;
  }
  if (open.some((id: string) => id.startsWith('songs')) && (await recentSongs(b.id)) < 2) {
    if (await writeSong(b)) return;
  }
  if (open.some((id: string) => id.startsWith('meals'))) {
    await call(b, 'meal', 'post', '/meals', { locationId: `${b.city}-restaurant`, mealId: 'soup' });
  }
  // Yankesicilik (parkta): şans makulse
  const crime = await act(b, { kind: 'crime', crime: 'pickpocket', locationId: `${b.city}-park` });
  if (crime === true) {
    first(b, 'crime');
    return;
  }
  // Sokakta çal
  if ((await act(b, { kind: 'busk', role: b.instrument, hours: 4, locationId: `${b.city}-park` })) === true) return;
  await work(b, 8);
}

export async function sampleMoney(bots: Bot[]) {
  const r = await pool.query('SELECT id, money, bank FROM characters WHERE id = ANY($1::bigint[])', [bots.map((x) => x.id)]);
  const by = new Map(r.rows.map((x: any) => [Number(x.id), Number(x.money) + Number(x.bank)]));
  for (const b of bots) b.money.push([Math.round(simHours(b.mem.t0)), by.get(b.id) ?? 0]);
}

export { CORE_ROLES };
