// Kullanıcıdan gelen anahtarla aranan tablolar (`*_BY_ID`) için yardımcılar.
// Düz nesnede tablo['constructor'] ya da tablo['__proto__'] prototipten bir değer döndürür ve "bulundu" sanılıp 500'e yol açar;
// prototipsiz sözlükte bu anahtarlar undefined'dır (playtest O-5).

/** Listeyi prototipsiz bir sözlüğe çevirir: yalnızca listedeki anahtarlar vardır */
export function indexBy<T, K extends string = string>(list: readonly T[], key: (x: T) => string): Record<K, T> {
  const out = Object.create(null) as Record<K, T>;
  for (const x of list) out[key(x) as K] = x;
  return out;
}

/** Düz nesne tablolarında güvenli arama: yalnızca nesnenin kendi anahtarı */
export function ownGet<T>(table: Readonly<Record<string, T>>, key: string): T | undefined {
  return Object.hasOwn(table, key) ? table[key] : undefined;
}
