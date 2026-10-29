// Sunucunun döndürdüğü her hata kodunun uygulamada TR ve EN metni olmalı (playtest O-8: 10 kod "Bir şeyler ters gitti"
// olarak görünüyordu, en sık çıkan 404 not_found dahil). Kodlar kaynaktan toplanır; yeni bir kod eklenince bu test kırmızı olur.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { en, tr } from '../../app/src/lib/strings';

const root = path.resolve(__dirname, '..', '..');
function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? files(p) : p.endsWith('.ts') ? [p] : [];
  });
}

/** Hata kodu olmayan, tür birleşimlerinden yakalanan dizgiler */
const NOT_CODES = new Set(['school', 'university', 'gym', 'book']);

function serverErrorCodes(): Map<string, string> {
  const out = new Map<string, string>();
  const add = (c: string, f: string) => {
    if (!NOT_CODES.has(c) && !out.has(c)) out.set(c, path.relative(root, f));
  };
  const patterns = [
    /fail\(\s*'([a-z][a-z0-9_]*)'/g,
    /GameError\(\s*'([a-z][a-z0-9_]*)'/g,
    /error:\s*'([a-z][a-z0-9_]*)'/g,
    /fail\([^)]*?\?\s*'([a-z][a-z0-9_]*)'/g,
    /fail\([^)]*?:\s*'([a-z][a-z0-9_]*)'\)/g,
    // Engel fonksiyonları: kodu döndürür ya da { code } / { reason } içinde taşır (fail(block) ile atılır)
    /(?:return|code:|reason:)\s*'([a-z]+_[a-z0-9_]+)'/g,
  ];
  for (const f of [...files(path.join(root, 'server/src')), ...files(path.join(root, 'packages/shared/src'))]) {
    const s = fs.readFileSync(f, 'utf8');
    for (const re of patterns) for (const m of s.matchAll(re)) add(m[1], f);
    // Dönüş türü olarak yazılan kod birleşimleri: ): 'a' | 'b' | null
    for (const m of s.matchAll(/\):\s*((?:'[a-z_0-9]+'\s*\|\s*)+'[a-z_0-9]+'(?:\s*\|\s*null)?)/g)) {
      for (const c of m[1].matchAll(/'([a-z_0-9]+)'/g)) add(c[1], f);
    }
  }
  return out;
}

describe('hata metinleri', () => {
  it('sunucunun her hata kodunun TR ve EN metni var', () => {
    const codes = serverErrorCodes();
    expect(codes.size).toBeGreaterThan(200);
    const t = tr as Record<string, string>;
    const e = en as Record<string, string>;
    const missing = [...codes].filter(([c]) => !t[`err_${c}`] || !e[`err_${c}`]).map(([c, f]) => `${c} (${f})`);
    expect(missing).toEqual([]);
  });

  it('hata metinlerinde TR ve EN yer tutucuları aynı; EN metinde Türkçe harf yok', () => {
    const ph = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
    const bad: string[] = [];
    for (const k of Object.keys(tr) as (keyof typeof tr)[]) {
      if (ph(tr[k]) !== ph(en[k])) bad.push(`yer tutucu ${k}`);
      if (/[ğışĞİŞ]/.test(en[k])) bad.push(`EN Türkçe ${k}`);
    }
    expect(bad).toEqual([]);
  });
});
