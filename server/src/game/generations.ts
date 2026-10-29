// Nesiller (kurallar: packages/shared/src/generations.ts).
//
// Yetişkin (18+) bir çocuk, kullanıcının KENDİ hesabında mirasçı karakter olarak devam edebilir: ya ebeveyn karakter
// öldükten sonra (PERMADEATH) yeni karakter yerine, ya da oyuncu bilerek "mirası devret" dediğinde. İkinci yolda
// ebeveyn emekliye ayrılır: ölümdeki ayrılma mantığının aynısıyla (releaseCharacter) gruptan, işletmeden, makamdan,
// evden, takas ve ilanlardan ayrılır; kayıtları korunur. Çocuk ayrı bir kullanıcı hesabı değildir ve "tek kullanıcı =
// tek karakter" kuralı bozulmaz: emeklilik ve mirasçının açılışı tek işlemdedir.
//
// İstismara karşı:
// - Reşit olmayan çocuk asla oynanabilir değildir (yaş sunucuda doğum tarihinden hesaplanır).
// - Para basılmaz: miras ölümdeki kuralla (claimInheritance) taşınır, aynı işlemde sıfırlanır. Diğer ebeveynin
//   (başka hesabın) parası, becerisi ya da eşyası mirasçıya geçmez; yalnızca devreden karakterinki.
// - Bir karakterden yalnızca bir mirasçı, bir çocuktan yalnızca bir karakter çıkar (benzersiz indeksler).
// - İsteyerek devir: hesap yeni olamaz, kullanıcı başına 56 oyun gününde bir, devreden karakter en az 14 günlük,
//   cezaevinde, tutukluyken, bir eylemin ortasındayken ya da hamileyken devredilemez.
// - Çocuğun diğer ebeveyni başka bir hesaptaki yaşayan oyuncuysa onayı gerekir (7 oyun günü geçerli).
// - Yadigâr en fazla 3 eşya; kişiye bağlı eşya, yığılabilir eşya ve (VIP değilsen) VIP eşyası geçmez; el değiştirme
//   kaydı (prev_owner) yazılır. XP taşınmaz.

import {
  HEIRLOOM_LIMIT,
  HEIR_CONSENT_DAYS,
  HEIR_MIN_AGE,
  ITEM_BY_ID,
  NAME_RE,
  SUCCESSION_COOLDOWN_DAYS,
  SUCCESSION_MIN_CHARACTER_DAYS,
  GAME_YEAR_DAYS,
  START_HEALTH,
  START_MONEY,
  START_MOOD,
  childAge,
  childStage,
  containsProfanity,
  estateInheritance,
  gameHoursToMs,
  heirAttributes,
  heirDefaultName,
  heirSkills,
  isBoundItem,
  startingAttributes,
  startingSkills,
  surnameOf,
  type Attributes,
  type CharacterStatus,
  type Genre,
  type HeirsResponse,
  type Instrument,
  type LineageDto,
} from '@rifftown/shared';
import { config } from '../config';
import { type Db, many, one, tx } from '../db';
import { GameError, fail } from '../errors';
import { type CharacterRow, isJailed, lockCharacter, notify, toCharacterDto } from './common';
import { claimInheritance, releaseCharacter } from './consequences';
import { handOver, ringPledged, toInventoryDto } from './items';
import { isBlocked } from './social';

const hoursMs = (h: number) => gameHoursToMs(h, config.gameSpeed);
const daysMs = (d: number) => hoursMs(d * 24);

export const characterStatus = (r: { dead_at?: Date | null; retired_at?: Date | null }): CharacterStatus =>
  r.dead_at ? 'dead' : r.retired_at ? 'retired' : 'active';

/**
 * Kullanıcının devredebilecek karakteri: yaşayan karakteri (isteyerek devir: emeklilik) ya da karakteri yoksa en son ölen
 * karakteri (ölümden sonra mirasçıyla devam). Ölen karakterden zaten devralınmışsa yoktur.
 */
async function predecessorFor(db: Db, userId: number): Promise<{ row: CharacterRow; mode: 'retire' | 'death' } | null> {
  const alive = await one<CharacterRow>(db, 'SELECT * FROM characters WHERE user_id = $1', [userId]);
  if (alive) return { row: alive, mode: 'retire' };
  const dead = await one<CharacterRow>(
    db,
    `SELECT * FROM characters c WHERE c.former_user_id = $1 AND c.dead_at IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM successions s WHERE s.from_id = c.id)
      ORDER BY c.dead_at DESC LIMIT 1`,
    [userId],
  );
  return dead ? { row: dead, mode: 'death' } : null;
}

/** Hesap yaşı (ek hesap önlemi): karakterden bağımsız, kullanıcıdan okunur (ölü karakterin kullanıcısı da sayılır) */
async function accountTooNewUntil(db: Db, userId: number): Promise<Date | null> {
  const hours = config.tradeMinAccountHours;
  if (hours <= 0) return null;
  const u = await one(db, 'SELECT created_at FROM users WHERE id = $1', [userId]);
  if (!u) return null;
  const until = new Date(u.created_at.getTime() + hoursMs(hours));
  return until.getTime() > Date.now() ? until : null;
}

/** İsteyerek devrin son tarihi: kullanıcının son isteyerek devrinden bu yana bekleme */
async function cooldownUntil(db: Db, userId: number): Promise<Date | null> {
  const last = await one(db, `SELECT max(created_at) AS at FROM successions WHERE user_id = $1 AND cause = 'retire'`, [userId]);
  if (!last?.at) return null;
  const until = new Date(last.at.getTime() + daysMs(SUCCESSION_COOLDOWN_DAYS));
  return until.getTime() > Date.now() ? until : null;
}

/** Devri engelleyen durum (devredenin tarafında); yoksa null */
async function successionBlocker(db: Db, userId: number, pred: CharacterRow, mode: 'retire' | 'death'): Promise<{ code: string; until?: Date } | null> {
  const tooNew = await accountTooNewUntil(db, userId);
  if (tooNew) return { code: 'account_too_new', until: tooNew };
  if (mode === 'death') return null;
  const cd = await cooldownUntil(db, userId);
  if (cd) return { code: 'succession_cooldown', until: cd };
  const playable = new Date(pred.created_at.getTime() + daysMs(SUCCESSION_MIN_CHARACTER_DAYS));
  if (playable.getTime() > Date.now()) return { code: 'character_too_new', until: playable };
  // Cezadan, davadan ya da yarım kalan bir işten devirle kaçılamaz
  if (isJailed(pred)) return { code: 'in_jail' };
  if (await one(db, `SELECT 1 FROM cases WHERE suspect_id = $1 AND status = 'pending'`, [pred.id])) return { code: 'in_jail' };
  if (await one(db, `SELECT 1 FROM actions WHERE character_id = $1 AND status = 'active'`, [pred.id])) return { code: 'busy' };
  if (await one(db, `SELECT 1 FROM pregnancies WHERE carrier_id = $1 AND status = 'active'`, [pred.id])) return { code: 'pregnancy_active' };
  return null;
}

/** Çocuğun diğer ebeveyni ve onayının gerekip gerekmediği (başka hesaptaki yaşayan oyuncuysa gerekir) */
async function coParentOf(db: Db, child: any, predId: number, userId: number) {
  const otherId = Number(child.parent_a) === predId ? child.parent_b : child.parent_a;
  if (otherId == null) return null;
  const o = await one(db, 'SELECT id, name, npc, user_id, dead_at, retired_at FROM characters WHERE id = $1', [otherId]);
  if (!o) return null;
  const needsConsent = !o.npc && o.user_id != null && Number(o.user_id) !== userId && !o.dead_at && !o.retired_at;
  return { id: Number(o.id), name: o.name as string, needsConsent };
}

const consentValid = (child: any, predId: number) =>
  child.heir_consent_for != null &&
  Number(child.heir_consent_for) === predId &&
  !!child.heir_consent_at &&
  child.heir_consent_at.getTime() > Date.now() - daysMs(HEIR_CONSENT_DAYS);

/** Çocuğun mirasçı olmasını engelleyen durum; yoksa null */
async function childBlocker(db: Db, child: any, pred: CharacterRow, userId: number): Promise<string | null> {
  if (Number(child.parent_a) !== pred.id && Number(child.parent_b) !== pred.id) return 'not_your_child';
  if (childAge(child.born_at, config.gameSpeed) < HEIR_MIN_AGE) return 'not_adult';
  if (child.heir_id != null) return 'already_heir';
  const co = await coParentOf(db, child, pred.id, userId);
  if (co?.needsConsent && !consentValid(child, pred.id)) return 'consent_needed';
  return null;
}

/** Yadigâr olabilir mi: kişiye bağlı, yığılabilir, teklifteki yüzük ya da (VIP değilse) VIP eşyası olamaz */
async function heirloomBlocker(db: Db, inv: any, isVip: boolean): Promise<string | null> {
  const def = ITEM_BY_ID[inv.item_id];
  if (!def) return 'not_found';
  if (isBoundItem(inv.item_id)) return 'item_bound';
  if (def.stackable) return 'not_heirloom';
  if (def.vip && !isVip) return 'vip_required';
  if (await ringPledged(db, inv.id)) return 'ring_pledged';
  return null;
}

/** GET /family/heirs: devredebilecek karakter, olası mirasçılar, tahmini miras ve yadigâr adayları */
export async function heirsInfo(userId: number, isVip: boolean, db: Db): Promise<HeirsResponse> {
  const p = await predecessorFor(db, userId);
  if (!p) fail('no_predecessor', 404);
  const pred = p!.row;
  const blocker = await successionBlocker(db, userId, pred, p!.mode);
  const kids = await many(db, 'SELECT * FROM children WHERE parent_a = $1 OR parent_b = $1 ORDER BY born_at, id', [pred.id]);
  const familyName = surnameOf(pred.name, pred.family_name);
  const children = [];
  for (const k of kids) {
    const age = childAge(k.born_at, config.gameSpeed);
    const co = await coParentOf(db, k, pred.id, userId);
    children.push({
      childId: Number(k.id),
      name: k.name as string,
      age: Math.floor(age),
      stage: childStage(age),
      blocker: await childBlocker(db, k, pred, userId),
      heirCharacterId: k.heir_id != null ? Number(k.heir_id) : null,
      coParent: co ? { characterId: co.id, name: co.name } : null,
      consentNeeded: !!co?.needsConsent,
      consentGiven: consentValid(k, pred.id),
      consentRequested: k.heir_request_by != null && Number(k.heir_request_by) === pred.id && !!k.heir_request_at && k.heir_request_at.getTime() > Date.now() - daysMs(HEIR_CONSENT_DAYS),
      defaultName: heirDefaultName(k.name, familyName),
    });
  }
  // Mirasın tahmini: emeklilikte bugünkü mal varlığından, ölümde ayrılmış olan miras
  let inheritance = Number((pred as any).inherited ?? 0);
  if (p!.mode === 'retire') {
    const biz = await one(db, 'SELECT till FROM businesses WHERE owner_id = $1', [pred.id]);
    inheritance = estateInheritance(pred.money + (pred.bank ?? 0) + Number(biz?.till ?? 0));
  }
  const items = p!.mode === 'death' && (pred as any).estate_claimed ? [] : await many(db, 'SELECT * FROM inventory WHERE character_id = $1 ORDER BY id', [pred.id]);
  const heirlooms = [];
  for (const inv of items) if (!(await heirloomBlocker(db, inv, isVip))) heirlooms.push(toInventoryDto(inv));
  // Bana gelen onay istekleri (ben diğer ebeveynken)
  const incoming =
    p!.mode === 'retire'
      ? await many(
          db,
          `SELECT k.id, k.name, k.heir_request_by, c.name AS from_name FROM children k JOIN characters c ON c.id = k.heir_request_by
            WHERE (k.parent_a = $1 OR k.parent_b = $1) AND k.heir_request_by <> $1 AND k.heir_id IS NULL AND k.heir_request_at > $2
              AND (k.heir_consent_for IS NULL OR k.heir_consent_for <> k.heir_request_by)`,
          [pred.id, new Date(Date.now() - daysMs(HEIR_CONSENT_DAYS))],
        )
      : [];
  return {
    predecessor: { characterId: pred.id, name: pred.name, status: characterStatus(pred) },
    mode: p!.mode,
    familyName,
    generation: Number(pred.generation ?? 1),
    inheritance,
    heirloomLimit: HEIRLOOM_LIMIT,
    heirlooms,
    blocker: blocker?.code ?? null,
    blockedUntil: blocker?.until ? blocker.until.toISOString() : null,
    children,
    incomingConsents: incoming.map((r) => ({ childId: Number(r.id), name: r.name, fromId: Number(r.heir_request_by), from: r.from_name })),
  };
}

/** Diğer ebeveynden onay iste (yalnızca çocuk yetişkinse ve onay gerçekten gerekiyorsa) */
export async function requestHeirConsent(userId: number, childId: number) {
  return tx(async (c) => {
    const p = await predecessorFor(c, userId);
    if (!p) fail('no_predecessor', 404);
    const pred = p!.row;
    const child = await one(c, 'SELECT * FROM children WHERE id = $1 FOR UPDATE', [childId]);
    if (!child || (Number(child.parent_a) !== pred.id && Number(child.parent_b) !== pred.id)) fail('not_found', 404);
    if (childAge(child.born_at, config.gameSpeed) < HEIR_MIN_AGE) fail('not_adult', 403);
    if (child.heir_id != null) fail('already_heir', 409);
    const co = await coParentOf(c, child, pred.id, userId);
    if (!co?.needsConsent) return { consentNeeded: false };
    if (await isBlocked(c, pred.id, co.id)) fail('blocked', 403);
    const fresh = child.heir_request_by != null && Number(child.heir_request_by) === pred.id && child.heir_request_at?.getTime() > Date.now() - hoursMs(24);
    await c.query('UPDATE children SET heir_request_by = $2, heir_request_at = now() WHERE id = $1', [childId, pred.id]);
    // Aynı istek bir günde bir kez bildirilir (bildirim taciz aracı olmasın)
    if (!fresh) await notify(c, co.id, 'heir_consent_request', { childId, name: child.name, fromId: pred.id, from: pred.name });
    return { consentNeeded: true, requested: true };
  });
}

/** Diğer ebeveynin cevabı: onay 7 oyun günü geçerlidir; ret isteği kapatır */
export async function answerHeirConsent(characterId: number, childId: number, accept: boolean) {
  return tx(async (c) => {
    const me = await lockCharacter(c, characterId);
    const child = await one(c, 'SELECT * FROM children WHERE id = $1 FOR UPDATE', [childId]);
    if (!child || (Number(child.parent_a) !== me.id && Number(child.parent_b) !== me.id)) fail('not_found', 404);
    const from = child.heir_request_by != null ? Number(child.heir_request_by) : null;
    if (!from || from === me.id || !child.heir_request_at || child.heir_request_at.getTime() < Date.now() - daysMs(HEIR_CONSENT_DAYS)) fail('no_request', 404);
    if (child.heir_id != null) fail('already_heir', 409);
    if (accept) {
      await c.query('UPDATE children SET heir_consent_for = $2, heir_consent_at = now() WHERE id = $1', [childId, from]);
    } else {
      await c.query('UPDATE children SET heir_request_by = NULL, heir_request_at = NULL, heir_consent_for = NULL, heir_consent_at = NULL WHERE id = $1', [childId]);
    }
    await notify(c, from!, accept ? 'heir_consent_given' : 'heir_consent_refused', { childId, name: child.name, from: me.name });
    return { ok: true, accepted: accept };
  });
}

export interface SuccessionInput {
  childId: number;
  name?: string;
  cityId: string;
  mainInstrument: Instrument;
  favoriteGenre: Genre;
  avatarColor: string;
  startAttributes?: Partial<Attributes>;
  heirlooms?: number[];
}

/**
 * Mirası devret: tek işlemde (1) kontroller, (2) isteyerek devirde ebeveyn emekliye ayrılır (ölümle aynı ayrılma
 * mantığı), (3) bekleyen miras yeni karaktere bir kez geçer, (4) yetişkin çocuktan mirasçı karakter açılır,
 * (5) seçilen yadigârlar el değiştirir, (6) devir kaydı. Bir adım başarısız olursa hiçbiri olmaz.
 * Kilit sırası: kullanıcı satırı (aynı kullanıcının eşzamanlı istekleri sıraya girer), devreden karakter, çocuk kaydı,
 * eşyalar. Yalnızca devredenin satırı kilitlenir; diğer ebeveyne dokunulmaz (bildirim dışında).
 */
export async function succeed(userId: number, isVip: boolean, input: SuccessionInput) {
  return tx(async (c) => {
    await c.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [userId]);
    const p = await predecessorFor(c, userId);
    if (!p) fail('no_predecessor', 404);
    // Kilit sırası (playtest A5): devreden ve çocuğun diğer ebeveyni birlikte, id sırasıyla, çocuk satırından ÖNCE.
    // Eskiden her istek önce kendi karakterini, sonra çocuğu kilitliyordu; emeklilik diğer ebeveynin satırına da
    // dokunduğundan (bildirim, ilişki) aynı çocuk için iki ebeveynin eşzamanlı devri kilitlenmeye (deadlock) düşüyor,
    // biri 500 alıyor, ~14'te 1 ikisi birden reddediliyordu.
    const peek = await one(c, 'SELECT parent_a, parent_b FROM children WHERE id = $1', [input.childId]);
    const others = [peek?.parent_a, peek?.parent_b].map((x) => (x == null ? null : Number(x))).filter((x): x is number => x !== null && x !== Number(p!.row.id));
    const lockIds = [Number(p!.row.id), ...others].sort((x, y) => x - y);
    let pred!: CharacterRow;
    for (const id of lockIds) {
      if (id === Number(p!.row.id)) pred = await lockCharacter(c, id);
      else await c.query('SELECT id FROM characters WHERE id = $1 FOR UPDATE', [id]); // silinmiş olabilir: yoksa geçer
    }
    const mode = p!.mode;
    const blocker = await successionBlocker(c, userId, pred, mode);
    if (blocker) throw new GameError(blocker.code, blocker.code === 'account_too_new' ? 403 : 409, blocker.until?.toISOString());
    const child = await one(c, 'SELECT * FROM children WHERE id = $1 FOR UPDATE', [input.childId]);
    if (!child) fail('not_found', 404);
    const cb = await childBlocker(c, child, pred, userId);
    if (cb) fail(cb, cb === 'not_your_child' ? 404 : cb === 'not_adult' ? 403 : 409);

    const familyName = surnameOf(pred.name, pred.family_name);
    const name = (input.name?.trim() || heirDefaultName(child.name, familyName)).replace(/\s+/g, ' ');
    if (!NAME_RE.test(name) || containsProfanity(name)) fail('invalid_name');
    if (await one(c, 'SELECT 1 FROM characters WHERE lower(name) = lower($1)', [name])) fail('name_taken', 409);

    const picks = [...new Set(input.heirlooms ?? [])];
    if (picks.length > HEIRLOOM_LIMIT) fail('too_many_heirlooms');
    if (picks.length && mode === 'death' && (pred as any).estate_claimed) fail('estate_claimed', 409);

    // (2) Emeklilik: ölümdeki ayrılma mantığının aynısı (grup, işletme, makam, ev, takas, ilan, ilişki)
    if (mode === 'retire') {
      const r = await releaseCharacter(c, pred.id, 'retire', 'succession');
      if (r === null) fail('no_predecessor', 409);
    }
    // Yadigârlar ayrılmadan sonra kontrol edilir: iptal edilen ilanlar ve düşen teklifler serbest kalmıştır
    const items: any[] = [];
    for (const id of picks) {
      const inv = await one(c, 'SELECT * FROM inventory WHERE id = $1 AND character_id = $2 FOR UPDATE', [id, pred.id]);
      if (!inv) fail('not_found', 404);
      const ib = await heirloomBlocker(c, inv, isVip);
      if (ib) fail(ib, ib === 'vip_required' ? 403 : 409);
      items.push(inv);
    }

    // (3) Miras: ölümdeki kodun aynısı; para yalnızca taşınır, aynı işlemde sıfırlanır
    const inheritance = await claimInheritance(c, userId);

    // (4) Mirasçı: başlangıç + küçük kalıtım tohumu (asla ebeveyni aşmaz, XP yok)
    const { skills, seeded } = heirSkills(startingSkills(input.mainInstrument, input.favoriteGenre), pred.skills ?? {});
    const { attributes, seeded: attrSeeded } = heirAttributes(startingAttributes(input.mainInstrument, input.startAttributes), pred.attributes);
    const co = await coParentOf(c, child, pred.id, userId);
    const coGen = co ? Number((await one(c, 'SELECT generation FROM characters WHERE id = $1', [co.id]))?.generation ?? 1) : 1;
    const generation = Math.max(Number(pred.generation ?? 1), coGen) + 1;
    // Yaş korunur: karakterin 18 yaşına bastığı an çocuğun doğumundan 18 oyun yılı sonrasıdır
    const adultAt = new Date(new Date(child.born_at).getTime() + daysMs(HEIR_MIN_AGE * GAME_YEAR_DAYS));
    const heir = await one<CharacterRow>(
      c,
      `INSERT INTO characters(user_id, name, avatar_color, main_instrument, money, mood, health, city_id, skills, attributes,
                              family_name, generation, child_id, predecessor_id, adult_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [userId, name, input.avatarColor, input.mainInstrument, START_MONEY + inheritance, START_MOOD, START_HEALTH, input.cityId,
        JSON.stringify(skills), JSON.stringify(attributes), familyName, generation, child.id, pred.id, adultAt],
    );
    // (5) Yadigârlar: el değiştirme kaydıyla (prev_owner), kuşanılmamış ve ilansız
    for (const inv of items) await handOver(c, Number(inv.id), pred.id, heir!.id, 'inheritance');
    await c.query('UPDATE characters SET estate_claimed = TRUE WHERE id = $1', [pred.id]);
    await c.query(
      'UPDATE children SET heir_id = $2, heir_request_by = NULL, heir_request_at = NULL, heir_consent_for = NULL, heir_consent_at = NULL WHERE id = $1',
      [child.id, heir!.id],
    );
    // (6) Kayıt
    await c.query('INSERT INTO successions(user_id, from_id, to_id, child_id, cause, money, items) VALUES ($1, $2, $3, $4, $5, $6, $7)', [
      userId, pred.id, heir!.id, child.id, mode, inheritance, items.length,
    ]);
    await notify(c, heir!.id, 'welcome', {});
    await notify(c, heir!.id, 'heir_started', { from: pred.name, money: inheritance, items: items.length });
    if (co) await notify(c, co.id, 'child_became_heir', { name: heir!.name, from: pred.name });
    return {
      character: toCharacterDto(heir!),
      inheritance,
      heirlooms: items.length,
      seeded: { skills: seeded, attributes: attrSeeded },
    };
  });
}

/** Profil için soy: aile adı, kuşak, anne-baba (mirasçıysa), devreden ve devralan */
export async function lineageOf(db: Db, ch: any): Promise<LineageDto> {
  const person = async (id: number | null | undefined) => {
    if (id == null) return null;
    const r = await one(db, 'SELECT id, name, dead_at, retired_at FROM characters WHERE id = $1', [id]);
    return r ? { characterId: Number(r.id), name: r.name as string, status: characterStatus(r) } : null;
  };
  const parents = [];
  if (ch.child_id) {
    const k = await one(db, 'SELECT parent_a, parent_b FROM children WHERE id = $1', [ch.child_id]);
    for (const pid of [k?.parent_a, k?.parent_b]) {
      const x = await person(pid);
      if (x) parents.push(x);
    }
  }
  const heir = await one(db, 'SELECT c.id, c.name FROM characters c WHERE c.predecessor_id = $1 ORDER BY c.id DESC LIMIT 1', [ch.id]);
  return {
    familyName: surnameOf(ch.name, ch.family_name),
    generation: Number(ch.generation ?? 1),
    parents,
    predecessor: await person(ch.predecessor_id),
    heir: heir ? { characterId: Number(heir.id), name: heir.name } : null,
  };
}

/** Yönetim paneli: kullanıcının önceki (ölen ya da emekli) karakterleri ve devir kayıtları */
export async function adminLineage(db: Db, userId: number) {
  const former = await many(
    db,
    `SELECT id, name, dead_at, retired_at, death_cause, inherited, generation, estate_claimed FROM characters
      WHERE former_user_id = $1 ORDER BY COALESCE(dead_at, retired_at) DESC LIMIT 20`,
    [userId],
  );
  const successions = await many(
    db,
    `SELECT s.*, f.name AS from_name, t.name AS to_name FROM successions s
       LEFT JOIN characters f ON f.id = s.from_id LEFT JOIN characters t ON t.id = s.to_id
      WHERE s.user_id = $1 ORDER BY s.created_at DESC LIMIT 20`,
    [userId],
  );
  return {
    formerCharacters: former.map((r) => ({
      id: Number(r.id),
      name: r.name,
      status: characterStatus(r),
      at: (r.dead_at ?? r.retired_at)?.toISOString() ?? null,
      cause: r.death_cause ?? null,
      pendingInheritance: Number(r.inherited),
      generation: Number(r.generation),
      estateClaimed: !!r.estate_claimed,
    })),
    successions: successions.map((s) => ({
      id: Number(s.id),
      cause: s.cause,
      from: s.from_id ? { id: Number(s.from_id), name: s.from_name } : null,
      to: s.to_id ? { id: Number(s.to_id), name: s.to_name } : null,
      money: Number(s.money),
      items: Number(s.items),
      at: s.created_at.toISOString(),
    })),
  };
}
