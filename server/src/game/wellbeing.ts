// Enerji, ilham ve moodlet'lerin sunucu tarafı (kurallar: packages/shared/src/wellbeing.ts).

import {
  MOODLET_BY_ID,
  type MoodletDto,
  type MoodletId,
  derivedMoodlets,
  effectiveMood,
  energyNow,
  gameHoursToMs,
  inspirationNow,
  CRAVING_HOURS,
  ageOf,
  START_AGE,
} from '@rifftown/shared';
import { config } from '../config';
import { type Db, many, one } from '../db';
import { type CharacterRow, isJailed } from './common';

export interface Wellbeing {
  energy: number;
  inspiration: number;
  moodlets: MoodletDto[];
  /** Görünen ruh hâli (temel + moodlet'ler) */
  mood: number;
}

type WellRow = Pick<CharacterRow, 'mood' | 'health' | 'energy' | 'energy_at' | 'inspiration' | 'inspiration_at' | 'jailed_until'> &
  Partial<Pick<CharacterRow, 'addicted_since' | 'indulged_at' | 'created_at' | 'npc'>>;

/** Bağımlı ve son CRAVING_HOURS içinde isteğini gidermemiş mi */
export const isCraving = (r: Partial<Pick<CharacterRow, 'addicted_since' | 'indulged_at'>>) =>
  !!r.addicted_since && (!r.indulged_at || r.indulged_at.getTime() + gameHoursToMs(CRAVING_HOURS, config.gameSpeed) < Date.now());

export const currentEnergy = (r: Pick<CharacterRow, 'energy' | 'energy_at'>) => energyNow(r.energy ?? 100, r.energy_at ?? null, config.gameSpeed);
export const currentInspiration = (r: Pick<CharacterRow, 'inspiration' | 'inspiration_at'>) =>
  inspirationNow(r.inspiration ?? 0, r.inspiration_at ?? null, config.gameSpeed);

/** Saklanan (süresi dolmamış) moodlet'ler */
export async function storedMoodlets(db: Db, characterId: number): Promise<MoodletDto[]> {
  const rows = await many(db, 'SELECT kind, value, expires_at FROM moodlets WHERE character_id = $1 AND expires_at > now() ORDER BY expires_at DESC', [
    characterId,
  ]);
  return rows.map((r) => ({ id: r.kind, effect: r.value, endsAt: r.expires_at.toISOString() }));
}

/** Saklananlar + durumdan doğanlar ve bunlara göre görünen ruh hâli */
export function wellbeingFrom(r: WellRow, stored: MoodletDto[]): Wellbeing {
  const energy = currentEnergy(r);
  const inspiration = currentInspiration(r);
  const age = r.created_at && !r.npc && config.agingEnabled ? ageOf(r.created_at, config.gameSpeed) : START_AGE;
  const derived: MoodletDto[] = derivedMoodlets({ energy, inspiration, health: r.health, jailed: isJailed(r), craving: isCraving(r), age }).map((id) => ({
    id,
    effect: MOODLET_BY_ID[id].value,
    endsAt: null,
  }));
  const moodlets = [...derived, ...stored];
  return { energy, inspiration, moodlets, mood: effectiveMood(r.mood, moodlets.map((m) => m.effect)) };
}

export async function wellbeingOf(db: Db, r: WellRow & { id: number }): Promise<Wellbeing> {
  return wellbeingFrom(r, await storedMoodlets(db, r.id));
}

/**
 * Enerji ve ilhamı değiştirir: önce zamanla değişen şimdiki değer bulunur, fark eklenir,
 * yeni değer şimdiki anla birlikte saklanır.
 */
export async function changeWellbeing(db: Db, r: CharacterRow, delta: { energy?: number; inspiration?: number; setInspiration?: number }) {
  const energy = Math.min(100, Math.max(0, currentEnergy(r) + (delta.energy ?? 0)));
  const inspiration = Math.min(100, Math.max(0, delta.setInspiration ?? currentInspiration(r) + (delta.inspiration ?? 0)));
  await db.query('UPDATE characters SET energy = $2, energy_at = now(), inspiration = $3, inspiration_at = now() WHERE id = $1', [
    r.id,
    energy,
    inspiration,
  ]);
  r.energy = energy;
  r.inspiration = inspiration;
  r.energy_at = new Date();
  r.inspiration_at = new Date();
  return { energy, inspiration };
}

/** Bir moodlet ekler; aynısı varsa süresini yeniler */
export async function addMoodlet(db: Db, characterId: number, id: MoodletId) {
  const def = MOODLET_BY_ID[id];
  if (!def || def.hours <= 0) return;
  const until = new Date(Date.now() + gameHoursToMs(def.hours, config.gameSpeed));
  await db.query(
    `INSERT INTO moodlets(character_id, kind, value, expires_at) VALUES ($1, $2, $3, $4)
     ON CONFLICT (character_id, kind) DO UPDATE SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at, created_at = now()`,
    [characterId, id, def.value, until],
  );
}

/** Zamanlayıcı: süresi dolmuş moodlet'leri temizler */
export async function pruneMoodlets(db: Db) {
  const r = await db.query(`DELETE FROM moodlets WHERE expires_at < now() - interval '1 day'`);
  return r.rowCount ?? 0;
}

/** Bir karakterin enerjisini/ilhamını satırı okuyup değiştirir (satır aynı işlemde zaten kilitli olmalı) */
export async function nudgeWellbeing(db: Db, characterId: number, delta: { energy?: number; inspiration?: number }) {
  const r = await one<CharacterRow>(db, 'SELECT * FROM characters WHERE id = $1', [characterId]);
  if (r) await changeWellbeing(db, r, delta);
}
