// Çizimler için tohumlu rastgelelik: aynı şehir / isim her açılışta aynı resmi verir.

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 0–1 arası tekrarlanabilir sayılar */
export function rng(seed: string | number) {
  let x = typeof seed === 'number' ? seed >>> 0 : hash(seed);
  if (x === 0) x = 0x9e3779b9;
  return () => {
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x / 4294967296;
  };
}

export const pick = <T,>(r: () => number, list: readonly T[]): T => list[Math.floor(r() * list.length) % list.length];

/** Gece sahnelerinin ortak renkleri (marka paletinden) */
export const night = {
  deep: '#0F0830',
  ink: '#170B3F',
  mid: '#221257',
  far: '#2E1A6E',
  indigo: '#1A0E4B',
  cyan: '#00E5FF',
  pink: '#FF2EB6',
  purple: '#8A2BFF',
  sky: '#3B82FF',
  paper: '#F8F9FF',
  /** Pencerelerden sızan sıcak ışık: soğuk neonun yanında "burada yaşanıyor" hissi */
  lamp: '#FFD36E',
} as const;

/** Rengi koyulaştır / aç (#RRGGBB) */
export function shade(hex: string, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount)));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
