import type { StringKey } from './strings';

/** Şöhret değişimini sayı yerine kelimeyle anlatır */
export function fameChangeKey(delta: number): StringKey {
  if (delta >= 1.5) return 'fameMuchUp';
  if (delta > 0) return 'fameUp';
  if (delta === 0) return 'fameSame';
  return 'fameDown';
}
