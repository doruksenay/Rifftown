// Nesiller: yetişkin (18+) bir çocuğun mirasçı olarak oynanabilir karakter olması.
//
// Mirasçı, kullanıcının KENDİ hesabında yeni karakter açma yoludur: çocuk ayrı bir kullanıcı hesabı değildir ve
// "tek kullanıcı = tek karakter" kuralı korunur. Ebeveyn karakter ya ölmüştür (PERMADEATH, varsayılan kapalı) ya da
// oyuncu bilerek "mirası devret" der ve ebeveyn emekliye ayrılır (arşivlenir). Reşit olmayan hiçbir çocuk oynanabilir
// hâle gelmez. Açık içerik yoktur.
//
// Miras ölümdeki kuralın aynısıdır: cep + banka + işletme kasasının yarısı, en fazla INHERITANCE_CAP, bir kez.
// Para basılmaz, yalnızca taşınır (kalanı oyundan çıkar). Kalıtım küçük ve tavanlıdır: birkaç becerinin tohumu ve
// en fazla birkaç nitelik puanı; hiçbiri ebeveyni aşmaz. XP taşınmaz.

import { ADULT_AGE } from './relations';
import { INHERITANCE_CAP, INHERITANCE_SHARE } from './consequences';
import { ATTRIBUTES, ATTR_BASE, ATTR_TOTAL_CAP, type Attributes, attributeTotal } from './attributes';
import { SKILL_BY_ID, type Skills, lv } from './skills';

/** Mirasçı olabilmek için en az bu yaş (reşit olmayan çocuk asla oynanabilir değildir) */
export const HEIR_MIN_AGE = ADULT_AGE;

/** Beceri tohumu: ebeveynin en iyi HEIR_SKILL_COUNT becerisinden her biri için ebeveyn seviyesinin %15'i, en fazla 10 */
export const HEIR_SKILL_SHARE = 0.15;
export const HEIR_SKILL_CAP = 10;
export const HEIR_SKILL_COUNT = 5;

/** Nitelik tohumu: ebeveynin başlangıcın (10) üstündeki her 20 puanı için +1; nitelik başına en fazla 2, toplam en fazla 4 */
export const HEIR_ATTR_STEP = 20;
export const HEIR_ATTR_CAP = 2;
export const HEIR_ATTR_TOTAL = 4;

/** Mirasçıya geçebilecek en fazla eşya (aile yadigârı) */
export const HEIRLOOM_LIMIT = 3;

/** Aynı kullanıcı en fazla bu kadar oyun gününde bir isteyerek devredebilir */
export const SUCCESSION_COOLDOWN_DAYS = 56;
/** Devreden karakter en az bu kadar oyun günüdür oynanıyor olmalı (hızlı devir zinciri olmasın) */
export const SUCCESSION_MIN_CHARACTER_DAYS = 14;
/** Diğer ebeveynin onayı bu kadar oyun günü geçerlidir */
export const HEIR_CONSENT_DAYS = 7;

/** Mirasın tutarı (ölümdekiyle aynı): mal varlığının yarısı, tavanlı */
export const estateInheritance = (estate: number) => Math.min(INHERITANCE_CAP, Math.floor(Math.max(0, estate) * INHERITANCE_SHARE));

/** Soyadı: verilmemişse karakter adının son kelimesi (tek kelimelik adlarda adın kendisi) */
export const surnameOf = (name: string, familyName?: string | null) => {
  if (familyName) return familyName;
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] ?? name;
};

/** Mirasçının varsayılan adı: çocuğun adı + aile adı (adın kendisi zaten aile adıyla bitiyorsa olduğu gibi) */
export const heirDefaultName = (childName: string, familyName: string) =>
  childName.trim().toLowerCase().endsWith(` ${familyName.toLowerCase()}`) ? childName.trim() : `${childName.trim()} ${familyName}`;

const round1 = (v: number) => Math.floor(v * 10) / 10;

/**
 * Mirasçının becerileri: başlangıç becerileri + ebeveynin en iyi becerilerinden küçük bir tohum.
 * Tohum: ebeveyn seviyesinin %15'i, en fazla 10; asla ebeveyn seviyesini geçmez. VIP'e özel beceriler ve
 * öncül şartı sağlanmayan beceriler tohumlanmaz (beceri ağacı tutarlı kalır). Başlangıç becerisinden düşük tohum yok sayılır.
 */
export function heirSkills(start: Skills, parent: Skills): { skills: Skills; seeded: Record<string, number> } {
  const skills: Skills = { ...start };
  const seeded: Record<string, number> = {};
  const best = Object.entries(parent ?? {})
    .filter(([id, v]) => SKILL_BY_ID[id] && Number(v) > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0]))
    .slice(0, HEIR_SKILL_COUNT);
  for (const [id, raw] of best) {
    const def = SKILL_BY_ID[id];
    if (def.vip) continue;
    if (def.prereq && lv(skills, def.prereq.skill) < def.prereq.min) continue;
    const parentLv = Number(raw);
    const seed = Math.min(HEIR_SKILL_CAP, round1(parentLv * HEIR_SKILL_SHARE), parentLv);
    if (seed <= lv(skills, id)) continue;
    seeded[id] = Math.round((seed - lv(skills, id)) * 10) / 10;
    skills[id] = seed;
  }
  return { skills, seeded };
}

/**
 * Mirasçının nitelikleri: başlangıç nitelikleri + ebeveynden küçük pay. En yüksek paylar önce, toplam HEIR_ATTR_TOTAL.
 * Hiçbir nitelik ebeveyninkini aşmaz (başlangıç değeri zaten yüksekse dokunulmaz); toplam tavan korunur.
 */
export function heirAttributes(start: Attributes, parent: Partial<Attributes> | null | undefined): { attributes: Attributes; seeded: Partial<Attributes> } {
  const attributes = { ...start };
  const seeded: Partial<Attributes> = {};
  const wants = ATTRIBUTES.map((id) => {
    const p = Number(parent?.[id] ?? 0) || 0;
    return { id, p, bonus: Math.min(HEIR_ATTR_CAP, Math.floor(Math.max(0, p - ATTR_BASE) / HEIR_ATTR_STEP)) };
  })
    .filter((x) => x.bonus > 0)
    .sort((a, b) => b.bonus - a.bonus || b.p - a.p || a.id.localeCompare(b.id));
  let left = HEIR_ATTR_TOTAL;
  for (const w of wants) {
    if (left <= 0) break;
    const room = Math.max(0, w.p - attributes[w.id]);
    const add = Math.min(w.bonus, left, room, ATTR_TOTAL_CAP - attributeTotal(attributes));
    if (add <= 0) continue;
    attributes[w.id] += add;
    seeded[w.id] = add;
    left -= add;
  }
  return { attributes, seeded };
}
