/** Özet istatistik: ortalama, medyan, p10, p90, en küçük, en büyük */
export function stats(xs: number[]) {
  const a = xs.filter((x) => Number.isFinite(x)).sort((x, y) => x - y);
  if (!a.length) return { n: 0, mean: NaN, median: NaN, p10: NaN, p90: NaN, min: NaN, max: NaN };
  const q = (p: number) => {
    const i = (a.length - 1) * p;
    const lo = Math.floor(i);
    const hi = Math.ceil(i);
    return a[lo] + (a[hi] - a[lo]) * (i - lo);
  };
  const r = (x: number) => Math.round(x * 100) / 100;
  return { n: a.length, mean: r(a.reduce((s, x) => s + x, 0) / a.length), median: r(q(0.5)), p10: r(q(0.1)), p90: r(q(0.9)), min: r(a[0]), max: r(a[a.length - 1]) };
}
