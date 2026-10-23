import {
  type ActionDto,
  type CharacterDto,
  type GigDto,
  type HomeDto,
  ITEM_BY_ID,
  INSTRUMENTS,
  type Instrument,
  MAX_TATTOO_BONUS,
  MAX_ART_BONUS,
  SKILLS,
  type Skills,
  VIP,
  gameHoursToMs,
  tierChange,
  tierOf,
} from '@rifftown/shared';
import type { Db } from '../db';
import { many, one } from '../db';
import { fail } from '../errors';

export interface CharacterRow {
  id: number;
  user_id: number;
  name: string;
  avatar_color: string;
  main_instrument: Instrument;
  money: number;
  mood: number;
  health: number;
  city_id: string | null;
  location_id: string | null;
  skills: Skills;
  bio: string;
  created_at: Date;
  profession: string | null;
  career_hours: number;
  career_rank: number;
  jailed_until: Date | null;
  convictions: number;
  npc: boolean;
  headline: string;
  avatar_version: number;
  bank: number;
  last_meal: Date | null;
}

/** Profil fotoğrafının adresi (/api'ye göre); fotoğraf yoksa null */
export const avatarUrl = (id: number, version: number | null | undefined) => (version && version > 0 ? `/avatars/${id}?v=${version}` : null);

/** Karakter şu an cezaevinde mi? */
export const isJailed = (r: { jailed_until: Date | null }) => !!r.jailed_until && r.jailed_until.getTime() > Date.now();

export const toCharacterDto = (
  r: CharacterRow,
  offices: { cityId: string; office: string }[] = [],
  extra: {
    inCustody?: boolean;
    achievementPoints?: number;
    home?: HomeDto | null;
    hotel?: { cityId: string; until: string } | null;
    business?: { locationId: string; role: 'owner' | 'staff' } | null;
  } = {},
): CharacterDto => ({
  id: r.id,
  name: r.name,
  avatarColor: r.avatar_color,
  mainInstrument: r.main_instrument,
  money: r.money,
  mood: Math.round(r.mood * 10) / 10,
  health: Math.round(r.health * 10) / 10,
  cityId: r.city_id,
  locationId: r.location_id,
  skills: Object.fromEntries(Object.entries(r.skills).map(([k, v]) => [k, Math.round(v * 100) / 100])) as Skills,
  bio: r.bio,
  createdAt: r.created_at.toISOString(),
  profession: r.profession ? { id: r.profession, rank: r.career_rank, hours: Math.round(r.career_hours * 10) / 10 } : null,
  offices,
  jailedUntil: isJailed(r) ? r.jailed_until!.toISOString() : null,
  inCustody: isJailed(r) && !!extra.inCustody,
  convictions: r.convictions ?? 0,
  achievementPoints: extra.achievementPoints ?? 0,
  headline: r.headline ?? '',
  avatarUrl: avatarUrl(r.id, r.avatar_version),
  home: extra.home ?? null,
  bank: r.bank ?? 0,
  hotel: extra.hotel ?? null,
  business: extra.business ?? null,
});

/** Normal üyeler eski konser raporlarını göremez (Popmundo'daki gibi); VIP'te rapor süresizdir. */
export function gateGig(dto: GigDto, isVip: boolean, gameSpeed: number): GigDto {
  if (isVip || dto.status !== 'done') return dto;
  const limit = Date.now() - gameHoursToMs(VIP.reportDays * 24, gameSpeed);
  if (new Date(dto.startsAt).getTime() >= limit) return dto;
  return { ...dto, result: null, reportExpired: true };
}

export const isVipUntil = (d: Date | string | null | undefined) => !!d && new Date(d).getTime() > Date.now();

/** Karakterin sahibi şu an VIP mi? */
export async function characterIsVip(db: Db, characterId: number): Promise<boolean> {
  const r = await one(db, 'SELECT u.vip_until FROM characters c JOIN users u ON u.id = c.user_id WHERE c.id = $1', [characterId]);
  return isVipUntil(r?.vip_until);
}

export async function officesOf(db: Db, characterId: number) {
  const rows = await many(db, 'SELECT city_id, office FROM office_holders WHERE character_id = $1', [characterId]);
  return rows.map((r) => ({ cityId: r.city_id, office: r.office }));
}

export const toActionDto = (r: any): ActionDto => ({
  id: r.id,
  kind: r.kind,
  params: r.params,
  locationId: r.location_id,
  startedAt: r.started_at.toISOString(),
  endsAt: r.ends_at.toISOString(),
  status: r.status,
  result: r.result,
});

export const toGigDto = (r: any): GigDto => ({
  id: r.id,
  bandId: r.band_id,
  bandName: r.band_name ?? '',
  cityId: r.city_id,
  locationId: r.location_id,
  startsAt: r.starts_at.toISOString(),
  status: r.status,
  setlist: r.setlist,
  sessionRoles: r.session_roles ?? [],
  result: r.result,
});

export async function lockCharacter(db: Db, id: number): Promise<CharacterRow> {
  const c = await one<CharacterRow>(db, 'SELECT * FROM characters WHERE id = $1 FOR UPDATE', [id]);
  if (!c) fail('no_character', 404);
  return c!;
}

export async function getCharacter(db: Db, id: number): Promise<CharacterRow> {
  const c = await one<CharacterRow>(db, 'SELECT * FROM characters WHERE id = $1', [id]);
  if (!c) fail('not_found', 404);
  return c!;
}

export async function activeAction(db: Db, characterId: number) {
  return one(db, `SELECT * FROM actions WHERE character_id = $1 AND status = 'active'`, [characterId]);
}

export async function notify(db: Db, characterId: number, kind: string, data: Record<string, unknown> = {}) {
  await db.query('INSERT INTO notifications(character_id, kind, data) VALUES ($1, $2, $3)', [
    characterId,
    kind,
    JSON.stringify(data),
  ]);
}

export async function membership(db: Db, characterId: number) {
  return one<{ band_id: number; role: Instrument; leader_id: number; name: string; genre: string }>(
    db,
    `SELECT m.band_id, m.role, b.leader_id, b.name, b.genre
       FROM band_members m JOIN bands b ON b.id = m.band_id WHERE m.character_id = $1`,
    [characterId],
  );
}

export interface GearBonuses {
  instruments: Partial<Record<Instrument, number>>;
  outfit: number;
  art: number;
  /** Kuşanılmış evcil hayvanın dinlenme bonusu */
  pet: number;
  /** Kuşanılmış aracın hız katsayısı (yoksa 0) */
  vehicleSpeed: number;
  /** Dövmelerden gelen sahne imajı */
  tattoos: number;
}

/** Karakterin kuşandığı eşyalardan ve dövmelerinden gelen bonuslar. */
export async function gearBonuses(db: Db, characterIds: number[]): Promise<Map<number, GearBonuses>> {
  const out = new Map<number, GearBonuses>();
  for (const id of characterIds) out.set(id, { instruments: {}, outfit: 0, art: 0, pet: 0, vehicleSpeed: 0, tattoos: 0 });
  if (characterIds.length === 0) return out;
  const rows = await many(
    db,
    `SELECT character_id, item_id, slot, equipped, bonus FROM inventory WHERE character_id = ANY($1::bigint[]) AND NOT listed`,
    [characterIds],
  );
  for (const r of rows) {
    const def = ITEM_BY_ID[r.item_id];
    const g = out.get(r.character_id);
    if (!def || !g) continue;
    const bonus = r.bonus ?? def.bonus;
    if (def.slot === 'art') g.art += bonus;
    else if (!r.equipped) continue;
    else if (def.slot === 'outfit') g.outfit = bonus;
    else if (def.slot === 'pet') g.pet = bonus;
    else if (def.slot === 'vehicle') g.vehicleSpeed = def.speed ?? 0;
    else if ((INSTRUMENTS as readonly string[]).includes(def.slot)) g.instruments[def.slot as Instrument] = bonus;
  }
  const tattoos = await many(db, 'SELECT character_id, count(*)::int AS n FROM tattoos WHERE character_id = ANY($1::bigint[]) GROUP BY character_id', [
    characterIds,
  ]);
  for (const t of tattoos) {
    const g = out.get(t.character_id);
    if (g) g.tattoos = Math.min(MAX_TATTOO_BONUS, t.n);
  }
  for (const g of out.values()) g.art = Math.min(MAX_ART_BONUS, g.art);
  return out;
}

/** Bir beceri kelime ölçeğinde bir üst seviyeye geçtiyse oyuncuya bildirir. */
export async function notifySkillUps(db: Db, characterId: number, before: Skills, after: Skills) {
  for (const skill of SKILLS) {
    if (tierChange('skill', before[skill], after[skill]) > 0) {
      await notify(db, characterId, 'skill_up', { skill, level: after[skill], tier: tierOf('skill', after[skill]).index });
    }
  }
}
