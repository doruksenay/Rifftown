// Süreli eylemler: başlatma, iptal ve tamamlanma.

import {
  CITY_BY_ID,
  diminishing,
  GENRES,
  HEALTH_PER_HOUR,
  HOSPITAL_PRICE_PER_HOUR,
  HOUR_OPTIONS,
  type Instrument,
  LOCATION_BY_ID,
  type LocationType,
  LOW_MOOD_HEALTH_PER_HOUR,
  LOW_MOOD_THRESHOLD,
  MIN_HEALTH_FOR_ACTIVITY,
  MOOD_PER_HOUR,
  SKILL_BY_ID,
  SCHOOL_PRICE_PER_HOUR,
  UNIVERSITY_PRICE_PER_HOUR,
  STUDIO_PRICE_PER_HOUR,
  type StartActionRequest,
  type Genre,
  ROLE_SKILLS,
  clamp,
  familiarityCap,
  genreSkillId,
  INSTRUMENTS,
  PROFESSION_BY_ID,
  buskPayPerHour,
  careerPay,
  knows,
  learnBlocker,
  rankFor,
  roleSkill,
  stageScore,
  studyPlaceFor,
  lv,
  rolesForSkill,
  songwritingScore,
  gameHoursToMs,
  priceFor,
  rehearsalGain,
  restMoodGain,
  songQuality,
  studyGain,
  travelOptions,
  GYM_PRICE_PER_HOUR,
  HOTEL_HEALTH_PER_HOUR,
  HOTEL_REST_BONUS,
  SPOUSE_REST_BONUS,
  fitnessShield,
  workoutGain,
  RECORD_HOURS,
  RECORDING_PRICE_PER_HOUR,
  INVESTIGATE_HOURS,
  type ActionKind,
  ENERGY_FREE_KINDS,
  ENERGY_PER_HOUR,
  HOME_REST_ENERGY_BONUS,
  INSPIRATION_GAIN,
  type MoodletId,
  SONG_INSPIRATION_SPEND,
  energyAfter,
  energyFactor,
  songInspirationBonus,
  SONG_FATIGUE_WINDOW_DAYS,
  SUBGENRE_BY_ID,
  isTempo,
  songFatigueFactor,
  styleBonus,
  ADDICTION_TREAT_PER_HOUR,
  ageLearnFactor,
  skillBonus,
  skillMult,
  PRODUCERS,
} from '@rifftown/shared';
import { characterAge, treatIndulgence } from './consequences';
import { prepareArticle, preparePress, resolveArticle, resolvePress } from './press';
import { prepareVideo, resolveVideo } from './media';
import { rollBreakdown } from './touring';
import type pg from 'pg';
import { config } from '../config';
import { one, tx } from '../db';
import { fail } from '../errors';
import { evaluateAchievements } from './achievements';
import { prepareLesson } from './lessons';
import { pair } from './social';
import { prepareCrime, prepareInvestigation, prisonOf, resolveCrime, resolveInvestigation } from './crime';
import { prepareBusinessShift, resolveBusinessShift } from './business';
import { homeRestBonus } from './homes';
import { addMoodlet, changeWellbeing, currentEnergy, wellbeingOf } from './wellbeing';
import { prepareCraft, resolveCraft } from './items';
import { hotelOf } from './lifestyle';
import { spouseInCity } from './relations';
import { resolveRecording } from './music';
import {
  type CharacterRow,
  activeAction,
  isJailed,
  gearBonuses,
  lockCharacter,
  membership,
  notify,
  notifySkillUps,
  toActionDto,
} from './common';

const ACTIVITY_KINDS = new Set(['study', 'work', 'write_song', 'rehearse', 'busk', 'record', 'crime', 'investigate', 'workout', 'craft', 'press', 'write_article', 'video']);

function requireHours(kind: keyof typeof HOUR_OPTIONS, hours: unknown): number {
  const opts = HOUR_OPTIONS[kind] as readonly number[];
  if (typeof hours !== 'number' || !opts.includes(hours)) fail('invalid_hours');
  return hours as number;
}

function requireLocation(char: CharacterRow, locationId: unknown, type: LocationType) {
  const loc = typeof locationId === 'string' ? LOCATION_BY_ID[locationId] : undefined;
  if (!loc || loc.type !== type) fail('invalid_location');
  if (loc!.cityId !== char.city_id) fail('not_in_city');
  return loc!;
}

export async function startAction(characterId: number, req: StartActionRequest, opts: { isVip?: boolean } = {}) {
  const isVip = !!opts.isVip;
  return tx(async (c) => {
    // Özel derste karşı taraf da değişir (ücret, pekiştirme): iki karakter id sırasıyla kilitlenir
    if (req.kind === 'lesson' && req.tutorId && Number(req.tutorId) !== characterId) {
      for (const id of pair(characterId, Number(req.tutorId))) await lockCharacter(c, id);
    }
    const char = await lockCharacter(c, characterId);
    if (await activeAction(c, characterId)) fail('busy', 409);
    if (!char.city_id) fail('traveling', 409);
    // Cezaevinde yalnızca dinlenilebilir
    if (isJailed(char) && req.kind !== 'rest') fail('in_jail', 409);
    const city = CITY_BY_ID[char.city_id!];
    if (ACTIVITY_KINDS.has(req.kind) && char.health < MIN_HEALTH_FOR_ACTIVITY) fail('too_sick');

    let hours = 0;
    let cost = 0;
    let locationId: string | null = char.location_id;
    const params: Record<string, unknown> = {};

    switch (req.kind) {
      case 'study': {
        const def = SKILL_BY_ID[req.skill];
        if (!def) fail('invalid_skill');
        hours = requireHours('study', req.hours);
        params.skill = req.skill;
        if (req.locationId) {
          // Müzik becerileri müzik okulunda, kariyer becerileri üniversitede çalışılır
          const place = studyPlaceFor(def!.category);
          if (!place) fail('learn_by_doing');
          const loc = requireLocation(char, req.locationId, place!);
          locationId = loc.id;
          cost = priceFor(place! === 'university' ? UNIVERSITY_PRICE_PER_HOUR : SCHOOL_PRICE_PER_HOUR, city, hours);
          params.atSchool = true;
          // Okulda henüz bilinmeyen bir beceri öğrenilebilir (öncül şartlar sağlanıyorsa)
          if (!knows(char.skills, req.skill)) {
            const block = learnBlocker(char.skills, req.skill, isVip);
            if (block) fail(block);
            params.learnsSkill = true;
          }
        } else {
          params.atSchool = false;
          if (!knows(char.skills, req.skill)) {
            fail(def!.learn === 'school' ? 'learn_at_school' : def!.learn === 'university' ? 'learn_at_university' : 'skill_not_known');
          }
        }
        break;
      }
      case 'work': {
        const loc = typeof req.locationId === 'string' ? LOCATION_BY_ID[req.locationId] : undefined;
        if (!loc) fail('invalid_location');
        if (loc!.cityId !== char.city_id) fail('not_in_city');
        hours = requireHours('work', req.hours);
        locationId = loc!.id;
        if (loc!.type === 'work') {
          params.pay = (loc!.hourlyPay ?? 0) * hours;
        } else if (loc!.business) {
          // Oyuncu işletmesinde mesai: sahibi ya da çalışanı
          Object.assign(params, await prepareBusinessShift(c, char, loc!.id, hours));
        } else {
          // Meslekte çalışma: mesleğin mekânında, rütbeye göre ücretle
          const prof = char.profession ? PROFESSION_BY_ID[char.profession] : null;
          if (!prof || prof.zone !== loc!.type) fail('no_profession_here');
          if (prof!.vip && !isVip) fail('vip_required');
          params.career = prof!.id;
          params.pay = careerPay(prof!, char.career_rank, city.costMult) * hours;
        }
        break;
      }
      case 'rest': {
        hours = requireHours('rest', req.hours);
        if (isJailed(char)) {
          locationId = prisonOf(char.city_id!);
        } else {
          // Din görevlileri ibadethanede daha iyi dinlenir
          const here = char.location_id ? LOCATION_BY_ID[char.location_id] : null;
          if (here?.type === 'worship' && char.profession === 'clergy') params.restBonus = 30;
          // Evde dinlenmek: ev bu şehirdeyse konfor bonusu
          const home = await homeRestBonus(c, characterId, char.city_id);
          if (home) {
            params.restBonus = ((params.restBonus as number) ?? 0) + home.restBonus;
            params.homeHealth = home.healthPerHour;
            params.home = home.id;
            // Evli ve eşi aynı şehirdeyse
            if (await spouseInCity(c, characterId, char.city_id)) params.restBonus = (params.restBonus as number) + SPOUSE_REST_BONUS;
          } else {
            // Evi olmayan şehirde otelde kalıyorsa daire konforunda dinlenir
            const hotel = await hotelOf(c, characterId);
            if (hotel?.cityId === char.city_id) {
              params.restBonus = ((params.restBonus as number) ?? 0) + HOTEL_REST_BONUS;
              params.homeHealth = HOTEL_HEALTH_PER_HOUR;
              params.hotel = true;
            }
          }
          // Evcil hayvan evde ya da otelde yanındadır
          if (home || params.hotel) params.pet = true;
        }
        break;
      }
      case 'treat': {
        const loc = requireLocation(char, req.locationId, 'hospital');
        hours = requireHours('treat', req.hours);
        locationId = loc.id;
        // Doktorlar hastanede ücretsiz tedavi olur
        cost = char.profession === 'doctor' ? 0 : HOSPITAL_PRICE_PER_HOUR * hours;
        break;
      }
      case 'busk': {
        const loc = requireLocation(char, req.locationId, 'park');
        hours = requireHours('busk', req.hours);
        if (!(INSTRUMENTS as readonly string[]).includes(req.role)) fail('invalid_role');
        if (!knows(char.skills, ROLE_SKILLS[req.role].specific)) fail('skill_not_known');
        locationId = loc.id;
        params.role = req.role;
        params.costMult = city.costMult;
        break;
      }
      case 'write_song': {
        const title = typeof req.title === 'string' ? req.title.trim() : '';
        if (title.length < 1 || title.length > 40) fail('invalid_title');
        if (!(GENRES as readonly string[]).includes(req.genre)) fail('invalid_genre');
        // Alt tür ve tempo isteğe bağlı; alt tür seçilen türe ait olmalı
        if (req.subgenre != null && SUBGENRE_BY_ID[req.subgenre]?.genre !== req.genre) fail('invalid_subgenre');
        if (req.tempo != null && !isTempo(req.tempo)) fail('invalid_tempo');
        hours = 2;
        params.title = title;
        params.genre = req.genre;
        params.subgenre = req.subgenre ?? null;
        params.tempo = req.tempo ?? SUBGENRE_BY_ID[req.subgenre ?? '']?.tempo ?? 'mid';
        break;
      }
      case 'rehearse': {
        const m = await membership(c, characterId);
        if (!m) fail('no_band');
        const song = await one(c, 'SELECT s.genre FROM band_songs bs JOIN songs s ON s.id = bs.song_id WHERE bs.band_id = $1 AND bs.song_id = $2', [
          m!.band_id,
          req.songId,
        ]);
        if (!song) fail('song_not_in_band');
        const loc = requireLocation(char, req.locationId, 'studio');
        hours = requireHours('rehearse', req.hours);
        locationId = loc.id;
        cost = priceFor(STUDIO_PRICE_PER_HOUR, city, hours);
        params.songId = req.songId;
        params.songGenre = song.genre;
        params.role = m!.role;
        break;
      }
      case 'record': {
        const m = await membership(c, characterId);
        if (!m) fail('no_band');
        const song = await one(c, 'SELECT 1 FROM band_songs WHERE band_id = $1 AND song_id = $2', [m!.band_id, req.songId]);
        if (!song) fail('song_not_in_band');
        const loc = requireLocation(char, req.locationId, 'recording_studio');
        hours = RECORD_HOURS;
        locationId = loc.id;
        cost = priceFor(RECORDING_PRICE_PER_HOUR, city, hours);
        // Dışarıdan prodüktör tutmak: ücret kayıt başında ödenir (şehir çarpanıyla)
        if (req.producer) {
          const pr = PRODUCERS[req.producer];
          if (!pr) fail('invalid_producer');
          cost += priceFor(pr.fee, city, 1);
          params.producer = req.producer;
        }
        params.songId = req.songId;
        params.bandId = m!.band_id;
        break;
      }
      case 'video': {
        const p = await prepareVideo(c, char, req.songId, req.locationId, req.director ?? 'none');
        hours = p.hours;
        cost = p.cost;
        locationId = p.locationId;
        Object.assign(params, p.params);
        break;
      }
      case 'crime': {
        const p = await prepareCrime(c, char, req.crime, req.locationId);
        hours = p.hours;
        locationId = p.locationId;
        Object.assign(params, p.params);
        break;
      }
      case 'investigate': {
        const p = prepareInvestigation(char, req.locationId, isVip);
        hours = INVESTIGATE_HOURS;
        locationId = p.locationId;
        break;
      }
      case 'workout': {
        const loc = requireLocation(char, req.locationId, 'gym');
        hours = requireHours('workout', req.hours);
        locationId = loc.id;
        cost = priceFor(GYM_PRICE_PER_HOUR, city, hours);
        break;
      }
      case 'press': {
        const p = await preparePress(c, char, req.mode, req.locationId);
        hours = p.hours;
        cost = p.cost;
        locationId = p.locationId;
        Object.assign(params, p.params);
        break;
      }
      case 'write_article': {
        const p = await prepareArticle(c, char, req.locationId, req);
        hours = p.hours;
        locationId = p.locationId;
        Object.assign(params, p.params);
        break;
      }
      case 'craft': {
        const p = await prepareCraft(c, char, req.recipe, req.locationId);
        hours = p.hours;
        locationId = p.locationId;
        Object.assign(params, p.params);
        break;
      }
      case 'travel': {
        const gear = (await gearBonuses(c, [char.id])).get(char.id)!;
        const opt = travelOptions(char.city_id!, req.toCityId, gear.vehicleSpeed || undefined).find((o) => o.mode === req.mode);
        if (!opt) fail('invalid_route');
        hours = opt!.hours;
        cost = opt!.cost;
        if (req.mode === 'car') {
          const b = await rollBreakdown(c, char, char.city_id!, req.toCityId, hours);
          hours = b.hours;
          if (b.breakdown) {
            params.breakdown = true;
            params.usedKit = !!b.usedKit;
          }
        }
        params.from = char.city_id;
        params.to = req.toCityId;
        params.mode = req.mode;
        locationId = null;
        break;
      }
      case 'lesson': {
        const l = await prepareLesson(c, char, req);
        hours = l.hours;
        cost = l.cost;
        locationId = l.locationId;
        Object.assign(params, l.params);
        break;
      }
      default:
        fail('invalid_action');
    }

    if (char.money < cost) fail('not_enough_money');
    // Enerji yetmiyorsa yorucu iş başlamaz (dinlenmek, tedavi ve yolculuk her zaman serbest)
    if (!ENERGY_FREE_KINDS.includes(req.kind) && energyAfter(req.kind, hours, currentEnergy(char)) < 0) fail('too_tired', 409);
    params.hours = hours;
    params.cost = cost;

    if (req.kind === 'travel') {
      await c.query('UPDATE characters SET money = money - $2, city_id = NULL, location_id = NULL WHERE id = $1', [
        characterId,
        cost,
      ]);
    } else {
      await c.query('UPDATE characters SET money = money - $2, location_id = $3 WHERE id = $1', [
        characterId,
        cost,
        locationId,
      ]);
    }

    const endsAt = new Date(Date.now() + gameHoursToMs(hours, config.gameSpeed));
    const row = await one(
      c,
      `INSERT INTO actions(character_id, kind, params, location_id, ends_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [characterId, req.kind, JSON.stringify(params), locationId, endsAt],
    );
    return toActionDto(row);
  });
}

/** Eylemi erken bitirir: etkinin geçen süreye düşen kısmı uygulanır, ücret iade edilmez. */
export async function cancelAction(characterId: number) {
  return tx(async (c) => {
    const a = await one(c, `SELECT * FROM actions WHERE character_id = $1 AND status = 'active' FOR UPDATE`, [
      characterId,
    ]);
    if (!a) fail('no_action', 404);
    if (a.kind === 'travel') fail('cannot_cancel');
    const total = a.ends_at.getTime() - a.started_at.getTime();
    const fraction = clamp((Date.now() - a.started_at.getTime()) / Math.max(1, total), 0, 1);
    const result = await applyAction(c, a, fraction);
    const row = await one(c, `UPDATE actions SET status = 'cancelled', result = $2 WHERE id = $1 RETURNING *`, [
      a.id,
      JSON.stringify(result),
    ]);
    return toActionDto(row);
  });
}

/**
 * Vadesi gelen eylemleri tamamlar. Her eylem kendi işleminde sonuçlanır: biri hata verirse ya da
 * kilit beklerken iptal edilirse yalnızca o eylem geri alınır, diğerleri etkilenmez.
 * Birden çok zamanlayıcı aynı anda güvenle çalışabilir.
 */
export async function completeDueActions(limit = 100): Promise<number> {
  let done = 0;
  const failed = new Set<number>();
  while (done + failed.size < limit) {
    let id: number | null = null;
    try {
      const ok = await tx(async (c) => {
        const a = await one(
          c,
          `SELECT * FROM actions WHERE status = 'active' AND ends_at <= now() AND NOT (id = ANY($1::bigint[]))
            ORDER BY ends_at LIMIT 1 FOR UPDATE SKIP LOCKED`,
          [[...failed]],
        );
        if (!a) return false;
        id = a.id;
        const result = await applyAction(c, a, 1);
        await c.query(`UPDATE actions SET status = 'done', result = $2 WHERE id = $1`, [a.id, JSON.stringify(result)]);
        await notify(c, a.character_id, 'action_done', { actionId: a.id, kind: a.kind, ...result });
        await evaluateAchievements(c, a.character_id);
        return true;
      });
      if (!ok) break;
      done++;
    } catch (e) {
      // Bu turda atla, bir sonraki turda yeniden denenir
      if (id === null) throw e;
      failed.add(id);
      console.error(`eylem ${id} tamamlanamadı`, e);
    }
  }
  return done;
}

async function applyAction(c: pg.PoolClient, a: any, fraction: number): Promise<Record<string, unknown>> {
  const char = await lockCharacter(c, a.character_id);
  const params = a.params as Record<string, any>;
  const hours = (params.hours as number) * fraction;
  const skills = { ...char.skills };
  const result: Record<string, unknown> = { fraction: Math.round(fraction * 100) / 100 };
  const gear = (await gearBonuses(c, [char.id])).get(char.id)!;
  // Görünen ruh hâli (moodlet'lerle), enerji ve ilham
  const well = await wellbeingOf(c, char);
  const efficiency = energyFactor(well.energy);
  let energyDelta = ENERGY_PER_HOUR[a.kind as ActionKind] * hours + (a.kind === 'rest' && (params.home || params.hotel) ? HOME_REST_ENERGY_BONUS * hours : 0);
  let inspirationDelta = 0;
  let setInspiration: number | undefined;
  const moodlets: MoodletId[] = [];

  // Ruh hâli ve sağlık
  let mood = char.mood;
  let health = char.health;
  if (a.kind === 'rest') {
    // Hayvan bakımı becerisi evcil hayvanın dinlenme bonusunu artırır (en fazla ×1,3)
    mood += restMoodGain(hours, Math.min(100, gear.art + ((params.restBonus as number) ?? 0) + (params.pet ? gear.pet * skillMult(char.skills, 'pets') : 0)));
  } else mood += MOOD_PER_HOUR[a.kind as keyof typeof MOOD_PER_HOUR] * hours;
  let healthChange = HEALTH_PER_HOUR[a.kind as keyof typeof HEALTH_PER_HOUR] * hours;
  // Kondisyon yorucu işlerdeki sağlık kaybını azaltır
  if (healthChange < 0) healthChange *= 1 - fitnessShield(lv(char.skills, 'fitness') + skillBonus(char.skills, 'fitness'));
  health += healthChange;
  if (a.kind === 'rest' && params.homeHealth) health += (params.homeHealth as number) * hours;
  if (a.kind === 'rest') {
    // Sanat eserleriyle dinlenmek ilham verir
    inspirationDelta += INSPIRATION_GAIN.artRestPerHourPer10 * (gear.art / 10) * hours;
  }
  if (a.kind !== 'rest' && a.kind !== 'treat' && Math.min(well.mood, well.mood + (mood - char.mood)) < LOW_MOOD_THRESHOLD) {
    health += LOW_MOOD_HEALTH_PER_HOUR * hours;
  }
  mood = clamp(mood, 0, 100);
  health = clamp(health, 0, 100);
  result.moodDelta = Math.round((mood - char.mood) * 10) / 10;
  result.healthDelta = Math.round((health - char.health) * 10) / 10;

  let money = char.money;
  let careerHours = char.career_hours;
  let careerRank = char.career_rank;
  let cityId = char.city_id;
  let locationId = char.location_id;
  let jailUntil: Date | null = null;

  switch (a.kind) {
    case 'study': {
      const skill = params.skill as string;
      if (!knows(skills, skill)) {
        // Okulda ilk derste beceri açılır (öncül şartlar başlatırken kontrol edildi)
        skills[skill] = 0;
        result.learned = true;
      }
      const instBonus = Math.max(0, ...rolesForSkill(skill).map((r) => gear.instruments[r] ?? 0));
      if (result.learned) inspirationDelta += INSPIRATION_GAIN.learnSkill;
      // Yaş öğrenmeyi yavaşlatır (35 yaştan sonra)
      const gain = studyGain(lv(skills, skill), hours, !!params.atSchool, well.mood, char.health, instBonus) * efficiency * ageLearnFactor(characterAge(char.created_at));
      skills[skill] = clamp(lv(skills, skill) + gain, 0, 100);
      result.skill = skill;
      result.gain = Math.round(gain * 100) / 100;
      break;
    }
    case 'lesson': {
      // Özel ders: verim çarpanı derse göre; öğrenci öğretmenin (profesörün) seviyesini geçemez
      const skill = params.skill as string;
      if (!knows(skills, skill)) break;
      const instBonus = Math.max(0, ...rolesForSkill(skill).map((r) => gear.instruments[r] ?? 0));
      const before = lv(skills, skill);
      const gain0 = studyGain(before, hours, true, well.mood, char.health, instBonus, Number(params.rate)) * efficiency * ageLearnFactor(characterAge(char.created_at));
      const capped = Math.max(before, Math.min(before + gain0, Number(params.cap ?? 100)));
      skills[skill] = clamp(capped, 0, 100);
      result.skill = skill;
      result.gain = Math.round((skills[skill] - before) * 100) / 100;
      result.tutor = params.tutor;
      break;
    }
    case 'work': {
      if (params.business) {
        const r = await resolveBusinessShift(c, char, params, hours, fraction);
        money += r.pay;
        Object.assign(result, r);
        break;
      }
      const pay = Math.floor((params.pay as number) * fraction);
      money += pay;
      result.pay = pay;
      if (params.career && char.profession === params.career) {
        careerHours = char.career_hours + hours;
        careerRank = rankFor(careerHours);
        if (careerRank > char.career_rank) {
          result.promoted = careerRank;
          await notify(c, char.id, 'promotion', { profession: char.profession, rank: careerRank });
        }
      }
      break;
    }
    case 'busk': {
      const role = params.role as Instrument;
      const base = buskPayPerHour(roleSkill(skills, role), stageScore(skills), (params.costMult as number) ?? 1);
      const pay = Math.floor(base * skillMult(skills, 'busking') * hours * (0.7 + Math.random() * 0.6));
      money += pay;
      result.pay = pay;
      inspirationDelta += INSPIRATION_GAIN.buskPerHour * hours;
      for (const [id, amount] of [[ROLE_SKILLS[role].specific, 0.2], ['showmanship', 0.3]] as const) {
        if (knows(skills, id)) skills[id] = clamp(skills[id] + amount * hours * diminishing(skills[id]), 0, 100);
      }
      break;
    }
    case 'write_song': {
      if (fraction < 1) {
        result.cancelled = true;
        break;
      }
      const genre = params.genre as Genre;
      // İlham şarkıyı güçlendirir ve yarısı harcanır
      const inspirationBonus = songInspirationBonus(well.inspiration);
      const tempo = isTempo(params.tempo) ? params.tempo : 'mid';
      const subgenre = (params.subgenre as string | null) ?? null;
      // Kısa sürede çok şarkı yazmak kaliteyi düşürür (Popmundo: 3 günde birden fazla şarkı)
      const recent = await one(c, 'SELECT count(*)::int AS n FROM songs WHERE author_id = $1 AND created_at > $2', [
        char.id,
        new Date(Date.now() - gameHoursToMs(SONG_FATIGUE_WINDOW_DAYS * 24, config.gameSpeed)),
      ]);
      const fatigue = songFatigueFactor(recent?.n ?? 0);
      const raw = songQuality(songwritingScore(skills, genre), Math.random) + styleBonus(skills, genre, subgenre, tempo);
      const quality = Math.round(clamp(raw * fatigue + inspirationBonus, 1, 100));
      setInspiration = well.inspiration * (1 - SONG_INSPIRATION_SPEND);
      result.inspirationBonus = inspirationBonus;
      if (fatigue < 1) result.fatigued = true;
      const song = await one(
        c,
        'INSERT INTO songs(author_id, title, genre, quality, subgenre, tempo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [char.id, params.title, params.genre, quality, subgenre, tempo],
      );
      for (const [id, amount] of [['composing', 0.4], ['lyrics', 0.4], [genreSkillId(genre), 0.2]] as const) {
        if (knows(skills, id)) skills[id] = clamp(skills[id] + amount * diminishing(skills[id]), 0, 100);
      }
      result.songId = song!.id;
      result.title = params.title;
      result.quality = quality;
      break;
    }
    case 'rehearse': {
      const m = await membership(c, char.id);
      const still = m
        ? await one(c, 'SELECT 1 FROM band_songs WHERE band_id = $1 AND song_id = $2', [m.band_id, params.songId])
        : null;
      if (still) {
        const famRow = await one(c, 'SELECT value FROM familiarity WHERE character_id = $1 AND song_id = $2', [
          char.id,
          params.songId,
        ]);
        const fam = famRow?.value ?? 0;
        const cap = familiarityCap(skills, params.songGenre as Genre);
        const gain = rehearsalGain(fam, hours, well.mood, lv(skills, 'improvisation')) * efficiency * skillMult(skills, 'rehearsal');
        // Tür becerisi düşükse şarkı belli bir noktadan sonra öğrenilemez (Popmundo'daki gibi)
        const next = fam >= cap ? fam : Math.min(cap, fam + gain);
        result.capped = next >= cap;
        await c.query(
          `INSERT INTO familiarity(character_id, song_id, value) VALUES ($1, $2, $3)
           ON CONFLICT (character_id, song_id) DO UPDATE SET value = EXCLUDED.value, touched_at = now(), decayed_at = NULL`,
          [char.id, params.songId, next],
        );
        const role = (m!.role ?? params.role) as Instrument;
        for (const [id, amount] of [[ROLE_SKILLS[role].specific, 0.3], [ROLE_SKILLS[role].basic, 0.1]] as const) {
          if (knows(skills, id)) skills[id] = clamp(skills[id] + amount * hours * diminishing(skills[id]), 0, 100);
        }
        result.songId = params.songId;
        result.familiarity = Math.round(next);
      } else {
        result.songRemoved = true;
      }
      break;
    }
    case 'record': {
      if (fraction < 1) {
        result.cancelled = true;
        break;
      }
      Object.assign(result, await resolveRecording(c, char, params, skills));
      break;
    }
    case 'crime': {
      if (fraction < 1) {
        result.cancelled = true;
        break;
      }
      const r = await resolveCrime(c, char, params, skills);
      money += r.loot;
      Object.assign(result, r.result);
      if (r.jailUntil) {
        jailUntil = r.jailUntil;
        locationId = prisonOf(char.city_id!);
      }
      break;
    }
    case 'investigate': {
      if (fraction < 1) {
        result.cancelled = true;
        break;
      }
      const r = await resolveInvestigation(c, char, hours, skills);
      money += r.pay;
      careerHours = r.careerHours;
      careerRank = r.careerRank;
      Object.assign(result, r.result);
      break;
    }
    case 'treat': {
      // Hastanede tedavi bağımlılığı da hafifletir
      if (char.addicted_since || (char.indulgence ?? 0) > 0) {
        if (await treatIndulgence(c, char, ADDICTION_TREAT_PER_HOUR * hours)) result.recovered = true;
      }
      break;
    }
    case 'workout': {
      // İlk antrenman kondisyonu açar
      if (!knows(skills, 'fitness')) {
        skills.fitness = 0;
        result.learned = true;
      }
      const gain = workoutGain(skills.fitness, hours);
      skills.fitness = clamp(skills.fitness + gain, 0, 100);
      if (fraction >= 1) moodlets.push('endorphins');
      result.gain = Math.round(gain * 100) / 100;
      break;
    }
    case 'craft': {
      Object.assign(result, await resolveCraft(c, char, params, skills, fraction));
      break;
    }
    case 'video': {
      if (fraction < 1) {
        result.cancelled = true;
        break;
      }
      Object.assign(result, await resolveVideo(c, { ...char, skills }, params));
      break;
    }
    case 'press': {
      if (fraction < 1) {
        result.cancelled = true;
        break;
      }
      Object.assign(result, await resolvePress(c, { ...char, skills }, params));
      break;
    }
    case 'write_article': {
      if (fraction < 1) {
        result.cancelled = true;
        break;
      }
      Object.assign(result, await resolveArticle(c, { ...char, skills }, params));
      break;
    }
    case 'travel': {
      cityId = params.to;
      locationId = null;
      result.to = params.to;
      if (params.breakdown) {
        result.breakdown = true;
        result.usedKit = !!params.usedKit;
      }
      // Yeni bir şehir: heyecan ve ilham
      if (params.to !== params.from) {
        inspirationDelta += INSPIRATION_GAIN.travel;
        moodlets.push('new_city');
      }
      break;
    }
  }

  await c.query(
    `UPDATE characters SET mood = $2, health = $3, money = $4, skills = $5, city_id = $6, location_id = $7,
       career_hours = $8, career_rank = $9 WHERE id = $1`,
    [char.id, mood, health, money, JSON.stringify(skills), cityId, locationId, careerHours, careerRank],
  );
  if (jailUntil) {
    await c.query('UPDATE characters SET jailed_until = $2 WHERE id = $1', [char.id, jailUntil]);
    await notify(c, char.id, 'arrested', { caseId: result.caseId, crime: result.crime, caught: true, cityId: char.city_id });
  }
  // İlham becerileri (şiir, meditasyon, saha kaydı, hat) eylemlerden kazanılan ilhamı artırır (en fazla ×1,5)
  if (inspirationDelta > 0) inspirationDelta *= skillMult(char.skills, 'inspiration');
  // Enerji ve ilham (eylemin harcadığı/verdiği; zamanla dolan kısım ayrıca hesaplanır)
  const afterWell = await changeWellbeing(c, char, { energy: energyDelta, inspiration: inspirationDelta, setInspiration });
  result.energyDelta = Math.round(energyDelta * 10) / 10;
  result.energy = Math.round(afterWell.energy);
  if (inspirationDelta) result.inspirationDelta = Math.round(inspirationDelta * 10) / 10;
  for (const m of moodlets) await addMoodlet(c, char.id, m);
  await notifySkillUps(c, char.id, char.skills, skills);
  return result;
}
