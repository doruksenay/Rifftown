// Rifftown görsel hattı: katalog → manifest → (ChatGPT üretir) → hazırla → doğrula → kayıt dosyası → galeri.
//
//   npm run art:manifest   docs/art/ASSET_MANIFEST.json ve IMAGE_GENERATION_REQUESTS.md'yi yeniden üretir
//   npm run art:prepare    art-incoming/ içindeki dosyaları kimliğe eşler, boyutlandırır, app/assets/art'a yazar
//   npm run art:validate   dosyaları denetler, VALIDATION_REPORT.md yazar, manifest durumlarını günceller
//   npm run art:sync       hepsi sırayla + uygulamanın kayıt dosyası + galeri
//
// Hiçbir adım görsel üretmez; yalnızca gelen dosyaları işler ve denetler.

import { existsSync, mkdirSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { ITEMS, CITIES, LOCATION_TYPE_NAMES, PAINT_COLORS } from '@rifftown/shared';
import sharp from 'sharp';
import { type AssetDef, BATCHES, buildCatalog, SPECS } from './catalog';
import { renderRequests } from './requests';

const ROOT = join(__dirname, '..', '..');
const ASSET_ROOT = join(ROOT, 'app', 'assets', 'art');
const INCOMING = join(ROOT, 'art-incoming');
const DOCS = join(ROOT, 'docs', 'art');
const REGISTRY = join(ROOT, 'app', 'src', 'lib', 'art-registry.ts');

type Status = 'missing' | 'valid' | 'invalid';
interface Checked extends AssetDef {
  status: Status;
  problems: string[];
  width: number;
  height: number;
  format: string;
  transparent: boolean;
  incomingName: string;
}

const catalog = buildCatalog();

/** ChatGPT'den inen dosyanın adı: çoğunlukla yolun son parçası; çakışırsa yol, "-" ile */
function incomingNames(list: AssetDef[]): Map<string, string> {
  const base = (a: AssetDef) => basename(a.path).replace(/\.[a-z]+$/, '');
  const count = new Map<string, number>();
  for (const a of list) count.set(base(a), (count.get(base(a)) ?? 0) + 1);
  const out = new Map<string, string>();
  for (const a of list) {
    const forcePrefix = a.category === 'avatar' || a.category.startsWith('icon') || a.category === 'moodlet' || a.category === 'achievement' || a.category === 'tattoo' || a.category === 'cover' || a.category === 'crowd';
    const stem = forcePrefix || (count.get(base(a)) ?? 0) > 1 ? a.id.replace(/\//g, '-') : base(a);
    out.set(a.id, `${stem}.png`);
  }
  return out;
}
const NAMES = incomingNames(catalog);

const fileOf = (a: AssetDef) => join(ASSET_ROOT, a.path);

// ---------- Hazırlama ----------

async function prepare() {
  if (!existsSync(INCOMING)) {
    mkdirSync(INCOMING, { recursive: true });
    console.log(`art-incoming/ oluşturuldu. ChatGPT'den indirdiğin dosyaları buraya koy.`);
    return;
  }
  const byStem = new Map<string, AssetDef>();
  for (const a of catalog) {
    const n = NAMES.get(a.id)!.replace(/\.png$/, '');
    byStem.set(n.toLowerCase(), a);
    byStem.set(a.id.replace(/\//g, '-').toLowerCase(), a);
    byStem.set(a.id.replace(/\//g, '__').toLowerCase(), a);
  }
  const done = join(INCOMING, 'done');
  mkdirSync(done, { recursive: true });
  let n = 0;
  for (const f of readdirSync(INCOMING)) {
    const src = join(INCOMING, f);
    if (statSync(src).isDirectory() || !/\.(png|jpe?g|webp)$/i.test(f)) continue;
    const a = byStem.get(f.replace(/\.[a-z]+$/i, '').toLowerCase());
    if (!a) {
      console.log(`? ${f}: manifestte karşılığı yok (dosya adını IMAGE_GENERATION_REQUESTS.md'deki adla değiştir)`);
      continue;
    }
    const spec = SPECS[a.category];
    const out = fileOf(a);
    mkdirSync(dirname(out), { recursive: true });
    let img = sharp(src).resize(spec.width, spec.height, { fit: 'cover', position: 'centre' });
    if (a.category === 'paint_mask') {
      // Maske: beyaz ve keskin (yarı saydam kenarlar 128'den kesilir)
      const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      for (let i = 0; i < data.length; i += 4) {
        const on = data[i + 3] > 127 && data[i] + data[i + 1] + data[i + 2] > 382;
        data[i] = data[i + 1] = data[i + 2] = 255;
        data[i + 3] = on ? 255 : 0;
      }
      img = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
    }
    if (spec.format === 'png') await img.png({ compressionLevel: 9 }).toFile(out);
    else if (spec.format === 'webp') await img.flatten({ background: '#1A0E4B' }).webp({ quality: 82 }).toFile(out);
    else await img.flatten({ background: '#1A0E4B' }).jpeg({ quality: 85, mozjpeg: true }).toFile(out);
    renameSync(src, join(done, f));
    console.log(`✓ ${f} → ${relative(ROOT, out)}`);
    n++;
  }
  console.log(`${n} dosya hazırlandı.`);
}

// ---------- Doğrulama ----------

async function alphaStats(file: string) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

async function check(a: AssetDef): Promise<Checked> {
  const spec = SPECS[a.category];
  const base: Checked = { ...a, status: 'missing', problems: [], width: spec.width, height: spec.height, format: spec.format, transparent: spec.transparent, incomingName: NAMES.get(a.id)! };
  const file = fileOf(a);
  if (!existsSync(file)) return base;
  const p = base.problems;
  try {
    const meta = await sharp(file).metadata();
    const fmt = meta.format === 'jpeg' ? 'jpg' : meta.format;
    if (fmt !== spec.format) p.push(`biçim ${fmt}, beklenen ${spec.format}`);
    if (meta.width !== spec.width || meta.height !== spec.height) p.push(`boyut ${meta.width}×${meta.height}, beklenen ${spec.width}×${spec.height}`);
    if (spec.transparent) {
      if (!meta.hasAlpha) p.push('şeffaflık yok (alfa kanalı yok)');
      else {
        const { data, w, h } = await alphaStats(file);
        const at = (x: number, y: number) => data[(y * w + x) * 4 + 3];
        const corners = [at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)];
        if (corners.some((v) => v > 8)) p.push('köşeler şeffaf değil (arka plan kaldırılmamış ya da sahte dama deseni)');
        if (a.category === 'item' || a.category === 'achievement' || a.category === 'tattoo') {
          // Kenar boşluğu: nesne kenarlara değmemeli (~%10 iç boşluk hedefi, en az %3)
          let minX = w, minY = h, maxX = -1, maxY = -1;
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (at(x, y) > 16) { if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y; }
          if (maxX < 0) p.push('görsel boş');
          else {
            const margin = Math.min(minX, minY, w - 1 - maxX, h - 1 - maxY) / w;
            if (margin < 0.03) p.push(`nesne kenara çok yakın (iç boşluk %${Math.round(margin * 100)}, hedef ~%10)`);
          }
        }
      }
    }
    if (a.category === 'paint_mask') {
      const item = catalog.find((x) => x.id === a.dependsOn[0]);
      const itemFile = item ? fileOf(item) : '';
      if (!item || !existsSync(itemFile)) p.push(`eşyanın kendi resmi yok (${a.dependsOn[0]})`);
      else {
        const m = await alphaStats(file);
        const it = await alphaStats(itemFile);
        if (m.w !== it.w || m.h !== it.h) p.push('maske ile eşya resmi aynı boyutta değil');
        else {
          let on = 0, outside = 0, itemOn = 0, nonWhite = 0;
          for (let i = 0; i < m.data.length; i += 4) {
            if (it.data[i + 3] > 16) itemOn++;
            if (m.data[i + 3] > 127) {
              on++;
              if (it.data[i + 3] <= 16) outside++;
              if (m.data[i] < 240 || m.data[i + 1] < 240 || m.data[i + 2] < 240) nonWhite++;
            }
          }
          if (!on) p.push('maske boş');
          else {
            if (outside / on > 0.02) p.push(`maske eşyayla hizalı değil (%${Math.round((outside / on) * 100)} eşyanın dışında)`);
            if (on / Math.max(1, itemOn) < 0.04) p.push('maske eşyanın çok küçük bir kısmını kaplıyor');
            if (on / Math.max(1, itemOn) > 0.95) p.push('maske neredeyse bütün eşyayı kaplıyor (metal/tel/cam hariç tutulmalı)');
            if (nonWhite / on > 0.01) p.push('maske saf beyaz değil');
          }
        }
      }
    }
  } catch (e) {
    p.push(`dosya okunamadı: ${(e as Error).message}`);
  }
  base.status = p.length ? 'invalid' : 'valid';
  return base;
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => {
    const full = join(dir, f);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

async function validate(): Promise<{ checked: Checked[]; ok: boolean }> {
  const checked = await Promise.all(catalog.map(check));
  // Maske, eşyanın kendisi geçerli değilse geçerli sayılmaz
  const byId = new Map(checked.map((c) => [c.id, c]));
  for (const c of checked) {
    if (c.category !== 'paint_mask' || c.status !== 'valid') continue;
    const item = byId.get(c.dependsOn[0]);
    if (item && item.status !== 'valid') {
      c.status = 'invalid';
      c.problems.push(`eşyanın görseli (${item.id}) geçerli değil; önce o düzeltilmeli`);
    }
  }
  const general: string[] = [];
  // Yinelenen kimlik / yol
  const seen = new Set<string>();
  for (const a of catalog) {
    if (seen.has(a.id)) general.push(`Yinelenen kimlik: ${a.id}`);
    seen.add(a.id);
    if (seen.has(`path:${a.path}`)) general.push(`Yinelenen yol: ${a.path}`);
    seen.add(`path:${a.path}`);
  }
  // Sahipsiz dosyalar
  const known = new Set(catalog.map((a) => a.path));
  for (const f of walk(ASSET_ROOT)) {
    const rel = relative(ASSET_ROOT, f).split('\\').join('/');
    if (!known.has(rel)) general.push(`Sahipsiz dosya (manifestte yok): app/assets/art/${rel}`);
  }
  // Oyunun her eşyası, şehri ve mekânı manifestte karşılanıyor mu
  const refs = new Set(catalog.flatMap((a) => a.gameRefs));
  for (const d of ITEMS) if (!refs.has(d.id)) general.push(`Oyundaki eşyanın görsel tanımı yok: ${d.id}`);
  for (const c of CITIES) if (!refs.has(c.id)) general.push(`Şehrin görsel tanımı yok: ${c.id}`);
  for (const t of Object.keys(LOCATION_TYPE_NAMES)) if (!refs.has(t)) general.push(`Mekân türünün görsel tanımı yok: ${t}`);
  // Bağımlılıklar
  for (const a of catalog) for (const d of a.dependsOn) if (!seen.has(d)) general.push(`${a.id} var olmayan ${d} varlığına bağlı`);
  const st = new Map(checked.map((c) => [c.id, c.status]));
  const waiting = catalog.filter((a) => a.paintable && st.get(a.id) === 'valid' && st.get(`${a.id}.mask`) !== 'valid');

  const invalid = checked.filter((c) => c.status === 'invalid');
  const valid = checked.filter((c) => c.status === 'valid');
  const missing = checked.filter((c) => c.status === 'missing');
  const lines = [
    '# Görsel doğrulama raporu',
    '',
    `Toplam ${checked.length} varlık: ${valid.length} geçerli, ${invalid.length} hatalı, ${missing.length} eksik. Bu dosya \`npm run art:validate\` ile üretilir; elle düzenlenmez.`,
    '',
    '## Hatalı dosyalar',
    '',
    invalid.length ? invalid.map((c) => `- \`${c.path}\`: ${c.problems.join('; ')}`).join('\n') : 'Yok.',
    '',
    '## Genel denetimler',
    '',
    general.length ? general.map((g) => `- ${g}`).join('\n') : 'Yinelenen kimlik, sahipsiz dosya, karşılıksız oyun kimliği ya da kırık bağımlılık yok.',
    '',
    '## Maskesini bekleyenler',
    '',
    waiting.length ? waiting.map((a) => `- \`${a.path}\` hazır, ama maskesi (\`${a.mask}\`) geçerli olmadığı için oyuna eklenmedi`).join('\n') : 'Yok.',
    '',
    '## Eksikler (partiye göre)',
    '',
    ...Object.entries(BATCHES).map(([b, title]) => {
      const m = missing.filter((c) => c.batch === b);
      return `- **${b} ${title}:** ${m.length ? `${m.length} eksik` : 'tamam'}`;
    }),
    '',
  ];
  mkdirSync(DOCS, { recursive: true });
  writeFileSync(join(DOCS, 'VALIDATION_REPORT.md'), lines.join('\n'));
  writeManifest(checked);
  console.log(`${valid.length} geçerli, ${invalid.length} hatalı, ${missing.length} eksik, ${general.length} genel sorun → docs/art/VALIDATION_REPORT.md`);
  for (const c of invalid) console.log(`✗ ${c.path}: ${c.problems.join('; ')}`);
  for (const g of general) console.log(`! ${g}`);
  return { checked, ok: invalid.length === 0 && general.length === 0 };
}

// ---------- Manifest ----------

function writeManifest(checked: Checked[]) {
  const manifest = {
    name: 'Rifftown asset manifest',
    visualLanguage: 'Rifftown Visual Language v1 (docs/art/RIFFTOWN_ART_BIBLE.md)',
    assetRoot: 'app/assets/art',
    generated: 'npm run art:manifest / art:validate — elle düzenlemeyin; tanımlar scripts/art/catalog.ts içinde',
    specs: SPECS,
    batches: BATCHES,
    paintColors: Object.fromEntries(Object.entries(PAINT_COLORS).map(([k, v]) => [k, v.hex])),
    summary: {
      total: checked.length,
      valid: checked.filter((c) => c.status === 'valid').length,
      invalid: checked.filter((c) => c.status === 'invalid').length,
      missing: checked.filter((c) => c.status === 'missing').length,
    },
    assets: checked.map((c) => ({
      id: c.id,
      category: c.category,
      path: c.path,
      incomingFileName: c.incomingName,
      width: c.width,
      height: c.height,
      format: c.format,
      transparent: c.transparent,
      status: c.status,
      ...(c.problems.length ? { problems: c.problems } : {}),
      batch: c.batch,
      label: c.label,
      gameRefs: c.gameRefs,
      ...(c.visualTestOnly ? { visualTestOnly: true } : {}),
      ...(c.tier ? { tier: c.tier } : {}),
      ...(c.paintable ? { paintable: true, mask: c.mask, defaultPaint: c.defaultPaint } : {}),
      dependsOn: c.dependsOn,
    })),
  };
  writeFileSync(join(DOCS, 'ASSET_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

// ---------- Uygulamanın kayıt dosyası ----------

function writeRegistry(checked: Checked[]) {
  const valid = new Set(checked.filter((c) => c.status === 'valid').map((c) => c.id));
  // Boyanabilen eşya ancak maskesiyle birlikte oyuna girer (maskesiz gri gövde görünmesin)
  const ok = checked.filter((c) => valid.has(c.id) && !(c.paintable && !valid.has(`${c.id}.mask`)));
  const rel = (c: Checked) => `../../assets/art/${c.path}`;
  const paint = catalog.filter((a) => a.paintable);
  const body = [
    '// OTOMATİK ÜRETİLİR: npm run art:sync — elle düzenlemeyin.',
    '// Sadece doğrulamadan geçmiş görseller burada; eksik olanlar için bileşenler eski görünüme döner.',
    '',
    '/* eslint-disable */',
    'export const ART: Record<string, number> = {',
    ...ok.map((c) => `  '${c.id}': require('${rel(c)}'),`),
    '};',
    '',
    '/** Boyanabilen eşyalar: maskenin kimliği ve boyanmamış hâlinin fabrika rengi */',
    'export const PAINTABLE: Record<string, { mask: string; defaultPaint: string }> = {',
    ...paint.map((a) => `  '${a.id}': { mask: '${a.id}.mask', defaultPaint: '${a.defaultPaint}' },`),
    '};',
    '',
  ].join('\n');
  mkdirSync(dirname(REGISTRY), { recursive: true });
  writeFileSync(REGISTRY, body);
  console.log(`Kayıt dosyası: ${ok.length} görsel → ${relative(ROOT, REGISTRY)}`);
}

// ---------- Galeri ----------

function writeGallery(checked: Checked[]) {
  const colors = Object.values(PAINT_COLORS).map((c) => c.hex);
  const src = (c: Checked) => `../../app/assets/art/${c.path}`;
  const cats = [...new Set(checked.map((c) => c.category))].filter((c) => c !== 'paint_mask');
  const tile = (c: Checked) => {
    const spec = SPECS[c.category];
    const wide = spec.width > spec.height;
    const w = wide ? 320 : 128;
    const h = Math.round((w * spec.height) / spec.width);
    const label = `<div class="l">${c.id}${c.status === 'invalid' ? ' ⚠' : ''}</div>`;
    if (c.status === 'missing') return `<figure><div class="miss" style="width:${w}px;height:${h}px">eksik</div>${label}</figure>`;
    let painted = '';
    const mask = checked.find((m) => m.id === `${c.id}.mask`);
    if (c.paintable && mask?.status === 'valid') {
      painted = colors
        .slice(0, 5)
        .map((col) => `<span class="pt" style="width:64px;height:64px"><img src="${src(c)}"><i style="background:${col};-webkit-mask-image:url(${src(mask)});mask-image:url(${src(mask)})"></i></span>`)
        .join('');
    }
    return `<figure class="${c.status}"><img src="${src(c)}" style="width:${w}px;height:${h}px">${painted ? `<div>${painted}</div>` : ''}${label}</figure>`;
  };
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rifftown görsel galerisi</title>
<style>body{font:14px system-ui,sans-serif;margin:16px;background:#F8F9FF;color:#1A0E4B}h2{margin:28px 0 8px}section{display:flex;flex-wrap:wrap;gap:12px}
figure{margin:0;display:flex;flex-direction:column;gap:4px}figure img{border-radius:8px;background:repeating-conic-gradient(#e5e6f0 0 25%,#fff 0 50%) 0 0/16px 16px}
figure.invalid img{outline:3px solid #D7263D}.miss{display:flex;align-items:center;justify-content:center;border:2px dashed #b9b7d6;border-radius:8px;color:#8a87ad}
.l{font-size:11px;max-width:320px;word-break:break-all}.pt{position:relative;display:inline-block;margin-right:4px}.pt img{width:64px;height:64px}
.pt i{position:absolute;inset:0;mix-blend-mode:multiply;-webkit-mask-size:100% 100%;mask-size:100% 100%}</style></head><body>
<h1>Rifftown görsel galerisi</h1><p>${checked.filter((c) => c.status === 'valid').length} geçerli · ${checked.filter((c) => c.status === 'invalid').length} hatalı · ${checked.filter((c) => c.status === 'missing').length} eksik. Boyanabilen eşyaların yanında örnek boyalar maskeyle gösterilir. <code>npm run art:sync</code> ile üretilir.</p>
${cats.map((cat) => `<h2>${cat}</h2><section>${checked.filter((c) => c.category === cat).map(tile).join('')}</section>`).join('\n')}
</body></html>`;
  writeFileSync(join(DOCS, 'gallery.html'), html);
}

// ---------- Komutlar ----------

async function main() {
  const cmd = process.argv[2] ?? 'sync';
  if (cmd === 'manifest') {
    const checked = await Promise.all(catalog.map(check));
    mkdirSync(DOCS, { recursive: true });
    writeManifest(checked);
    writeFileSync(join(DOCS, 'IMAGE_GENERATION_REQUESTS.md'), renderRequests(catalog, checked, NAMES));
    console.log(`Manifest ve istekler yazıldı (${catalog.length} varlık).`);
  } else if (cmd === 'prepare') {
    await prepare();
  } else if (cmd === 'validate') {
    const { ok } = await validate();
    process.exitCode = ok ? 0 : 1;
  } else if (cmd === 'sync') {
    await prepare();
    const { checked, ok } = await validate();
    writeRegistry(checked);
    writeGallery(checked);
    writeFileSync(join(DOCS, 'IMAGE_GENERATION_REQUESTS.md'), renderRequests(catalog, checked, NAMES));
    process.exitCode = ok ? 0 : 1;
  } else {
    console.log('Kullanım: tsx scripts/art/cli.ts [manifest|prepare|validate|sync]');
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
