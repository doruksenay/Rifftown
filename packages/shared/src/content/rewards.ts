// İçerik: para dışı ödüller. Ünvanlar kozmetiktir (profilde adın altında görünür); bir başarımdan ya da
// görev zincirinin bir adımından (seçimli adımda belli bir seçenekten) kazanılır. Sunucu kazanılmış ünvanı
// veritabanında ayrıca saklamaz: başarım ve zincir kayıtlarından hesaplar, yalnızca seçili ünvanı tutar.

import type { L } from '../world';
import { CHAINS } from './progress';
import { indexBy } from '../lookup';

export interface TitleDef {
  id: string;
  name: L;
  /** Bu başarımla kazanılır */
  achievement?: string;
}

const T = (id: string, tr: string, en: string, achievement?: string): TitleDef => ({ id, name: { tr, en }, achievement });

export const TITLES: TitleDef[] = [
  // Başarımlardan
  T('t_superstar', 'Süperstar', 'Superstar', 'superstar'),
  T('t_legendary', 'Efsanevi gecenin sahibi', 'Keeper of a legendary night', 'legendary_night'),
  T('t_number_one', 'Bir numara', 'Number one', 'chart_no1'),
  T('t_road_dog', 'Yol köpeği', 'Road dog', 'gigs_250'),
  T('t_immortal', 'Ölümsüz', 'Immortal', 'superstar_all'),
  // Gizli keşiflerden
  T('t_one_man_band', 'Tek kişilik orkestra', 'One-person orchestra', 'one_man_band'),
  T('t_empty_rooms', 'Boş salonların şairi', 'Poet of empty rooms', 'empty_room'),
  T('t_broke', 'Meteliksiz', 'Flat broke', 'broke'),
  T('t_multi', 'Çok sazlı', 'Multi-instrumentalist', 'all_roles'),
  T('t_jailbird', 'Müdavim', 'Jailbird', 'jailbird'),
  T('t_heartbreaker', 'Çapkın', 'Heartbreaker', 'heartbreaker'),
  // Koleksiyonlardan
  T('t_globetrotter', 'Dünya gezgini', 'Globetrotter', 'collection_souvenirs'),
  T('t_crate_digger', 'Plak avcısı', 'Crate digger', 'collection_vinyl'),
  T('t_maker', 'Yaratıcı eller', 'Maker', 'collection_workshop'),
  // Zincirlerden (adım ya da seçenek ChainStep.titleId / ChainChoice.titleId ile verir)
  T('kingmaker_protege', 'Vedat Karahan\'ın keşfi', 'Vedat Karahan\'s discovery'),
  T('independent', 'Bağımsız ruh', 'Independent spirit'),
  T('fox_hunter', 'Tilki avcısı', 'Fox hunter'),
  T('fox_friend', 'Tilkilerin dostu', 'Friend of the Foxes'),
  T('melek_pen', 'Melek Hanım\'ın kalemi', 'Melek\'s pen'),
  T('melek_stage', 'Melek Hanım\'ın öğrencisi', 'Melek\'s student'),
];
export const TITLE_BY_ID: Record<string, TitleDef> = indexBy(TITLES, (t) => t.id);

/** Zincirlerdeki ünvan ödülleri: ünvan → (zincir, adım, seçenek) */
export const CHAIN_TITLE_SOURCES: { titleId: string; chain: string; step: number; choice?: string }[] = CHAINS.flatMap((c) =>
  c.steps.flatMap((s, step) => [
    ...(s.titleId ? [{ titleId: s.titleId, chain: c.id, step }] : []),
    ...(s.choice ?? []).filter((o) => o.titleId).map((o) => ({ titleId: o.titleId!, chain: c.id, step, choice: o.id })),
  ]),
);

/** Kazanılmış ünvanlar: başarımlar ve zincir kayıtlarından */
export function earnedTitles(achievementIds: Iterable<string>, claims: { chain: string; step: number; choice?: string | null }[]): string[] {
  const ach = new Set(achievementIds);
  const out = TITLES.filter((t) => t.achievement && ach.has(t.achievement)).map((t) => t.id);
  for (const src of CHAIN_TITLE_SOURCES) {
    if (claims.some((c) => c.chain === src.chain && c.step === src.step && (!src.choice || c.choice === src.choice))) out.push(src.titleId);
  }
  return [...new Set(out)];
}
