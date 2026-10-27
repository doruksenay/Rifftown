import { CITY_BY_ID, GENRE_NAMES, SEASON_NAMES, INSTRUMENTS, type ItemDef, type L, LEGENDARY_ITEM_PREFIX, PAINT_COLORS, type PaintColor, ROLE_NAMES, type Instrument } from '@rifftown/shared';
import type { StringKey } from './strings';

type T = (k: StringKey, v?: Record<string, string | number>) => string;

/** Eşyanın sağladığı bonusu tek satırla anlatır. bonus: üretilmiş eşyalarda kendi bonusu */
export function itemBonusText(item: ItemDef, t: T, p: (l: L) => string, bonus = item.bonus) {
  const base = baseBonusText(item, t, p, bonus);
  // Tür uyumu, sezon ve nadirlik eşyanın kararını anlatır
  const extra = [
    item.genres?.length && item.genreBonus ? t('genreAffinity', { n: item.genreBonus, genres: item.genres.map((g) => p(GENRE_NAMES[g])).join(', ') }) : null,
    item.season ? t('seasonalItem', { season: p(SEASON_NAMES[item.season]) }) : null,
    item.cityOnly && CITY_BY_ID[item.cityOnly] ? t('cityOnlyItem', { city: p(CITY_BY_ID[item.cityOnly].name) }) : null,
  ].filter(Boolean);
  return extra.length ? `${base} · ${extra.join(' · ')}` : base;
}

function baseBonusText(item: ItemDef, t: T, p: (l: L) => string, bonus = item.bonus) {
  switch (item.slot) {
    case 'outfit':
      return t('bonusOutfit', { n: bonus });
    case 'art':
      return t('bonusArt', { n: bonus });
    case 'vehicle':
      return t('bonusVehicle', { n: item.speed ?? 1 });
    case 'pet':
      return t('bonusPet', { n: bonus });
    case 'fx':
      return t('bonusFx', { n: bonus });
    case 'material':
      return t('bonusMaterial');
    case 'spray':
      return t('bonusSpray');
    case 'ring':
      return t('bonusRing');
  }
  if ((INSTRUMENTS as readonly string[]).includes(item.slot)) {
    return t('bonusInstrument', { skill: p(ROLE_NAMES[item.slot as Instrument]), n: bonus, p: bonus * 2 });
  }
  return '';
}

/** Eşyanın görünen adı: oyuncunun verdiği ad, yoksa renk + katalog adı */
export function itemDisplayName(
  item: ItemDef,
  p: (l: L) => string,
  opts: { nickname?: string | null; color?: PaintColor | null; legendary?: unknown } = {},
) {
  // EFSANEVİ bir gecede çalınmış enstrüman: "Efsanevi" ünvanı
  const name = p(item.name);
  const base = opts.legendary ? `${p(LEGENDARY_ITEM_PREFIX)} ${name.charAt(0).toLowerCase()}${name.slice(1)}` : name;
  if (opts.nickname) return `${opts.nickname} (${base})`;
  if (opts.color && PAINT_COLORS[opts.color]) return `${base}, ${p(PAINT_COLORS[opts.color].name)}`;
  return base;
}
