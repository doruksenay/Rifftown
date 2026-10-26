// ChatGPT için görsel istekleri: her eksik varlık için kopyala-yapıştır hazır, tek başına eksiksiz bir istem.

import { type AssetDef, BATCHES, type Category, SPECS } from './catalog';

/** Rifftown Visual Language v1: her isteme giren ortak stil kuralı (Art Bible ile aynı) */
export const VISUAL_LANGUAGE =
  'Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.';

const TIER_LOOK: Record<string, string> = {
  basic: 'Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware.',
  stage: 'Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware.',
  professional: 'Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details.',
  iconic: 'Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special.',
  crafted: 'Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal.',
};

const CAMERA: Record<Category, string> = {
  city: 'Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).',
  place: 'Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.',
  crowd: 'Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).',
  item: 'Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.',
  paint_mask: '',
  avatar: 'Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.',
  achievement: 'Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.',
  icon_place: 'Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.',
  icon_skill: 'Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.',
  moodlet: 'Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.',
  tattoo: 'Tattoo flash artwork: clean bold linework with limited colour, centred, about 10% padding.',
  cover: 'Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.',
};

const BACKGROUND: Record<Category, string> = {
  city: 'Full-bleed scene (no transparency).',
  place: 'Full-bleed scene (no transparency).',
  crowd: 'Full-bleed scene (no transparency).',
  item: 'Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.',
  paint_mask: 'Fully transparent background.',
  avatar: 'Solid Midnight Indigo background (no transparency).',
  achievement: 'Fully transparent background: PNG with a real alpha channel, no checkerboard.',
  icon_place: 'Fully transparent background: PNG with a real alpha channel, no checkerboard.',
  icon_skill: 'Fully transparent background: PNG with a real alpha channel, no checkerboard.',
  moodlet: 'Fully transparent background: PNG with a real alpha channel, no checkerboard.',
  tattoo: 'Fully transparent background: PNG with a real alpha channel, no skin, no checkerboard.',
  cover: 'Full-bleed artwork (no transparency).',
};

const SIZE: Record<string, string> = {
  '1536x1024': '1536×1024 landscape',
  '1024x1024': '1024×1024 square',
};

function prompt(a: AssetDef, fileName: string, mask?: AssetDef): string {
  const spec = SPECS[a.category];
  const lines = [
    `Asset ID: ${a.id}`,
    `File name: ${fileName}`,
    `Size and format: ${SIZE[spec.source]}, ${spec.transparent ? 'PNG with transparent background' : 'PNG'} (the game resizes it to ${spec.width}×${spec.height} ${spec.format.toUpperCase()})`,
    `Subject: ${a.subject}.`,
    a.tier ? `Tier: ${TIER_LOOK[a.tier]} Show the tier through design, materials and craftsmanship, not through a coloured frame.` : null,
    `Style: ${VISUAL_LANGUAGE}`,
    `Camera and composition: ${CAMERA[a.category]}`,
    `Background: ${BACKGROUND[a.category]}`,
    a.paintable && mask
      ? `Paintable surface: players can repaint ${mask.subject}. Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).`
      : null,
    a.visualTestOnly ? 'Note: visual-language test asset (not in the game yet); it must look like part of the same instrument set.' : null,
    `Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.`,
  ];
  return lines.filter(Boolean).join('\n');
}

function maskPrompt(item: AssetDef, mask: AssetDef, fileName: string): string {
  return [
    `Asset ID: ${mask.id}`,
    `File name: ${fileName}`,
    'Using the image you just generated, create its paint mask.',
    `- Same size (1024×1024) and the exact same position of every pixel as ${item.id}: the mask must line up perfectly when placed on top.`,
    `- Pure opaque white (#FFFFFF) exactly where ${mask.subject} is.`,
    '- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.',
    '- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.',
    '- PNG with a real alpha channel.',
  ].join('\n');
}

export const SESSION_OPENER = [
  'We are producing artwork for Rifftown, a music career and life simulation game. Follow "Rifftown Visual Language v1" for every image in this conversation:',
  '',
  `- ${VISUAL_LANGUAGE}`,
  '- Individual objects: three-quarter view from slightly above, centred, ~10% padding, transparent background, the same camera and lighting for every object.',
  '- Tiers are shown through design and materials: Basic (entry-level), Stage (solid professional), Professional (premium craftsmanship), Iconic (legendary collectible), Crafted (handmade one-off).',
  '- Repaintable surfaces are rendered in neutral light grey (#DADADA) with full shading; a separate white-on-transparent mask marks them.',
  '- The attached style board is the primary reference. Match its finish, detail density and lighting.',
  '',
  'Generate exactly one image per message, at the size I ask for. Do not add text, labels or logos. Reply "Ready" and wait for the first request.',
].join('\n');

export function renderRequests(catalog: AssetDef[], checked: { id: string; status: string }[], names: Map<string, string>): string {
  const status = new Map(checked.map((c) => [c.id, c.status]));
  const open = (a: AssetDef) => status.get(a.id) !== 'valid';
  const out: string[] = [
    '# Rifftown görsel üretim istekleri (ChatGPT)',
    '',
    'Bu dosya `npm run art:manifest` / `npm run art:sync` ile üretilir; yalnızca henüz geçerli dosyası olmayan varlıkları listeler. Tanımlar `scripts/art/catalog.ts` içinde.',
    '',
    '## Akış',
    '',
    '1. ChatGPT\'de her parti için yeni bir sohbet aç. Stil panosunu ekle ve aşağıdaki **açılış mesajını** gönder.',
    '2. Partideki her isteği sırayla, **tek tek** gönder. Boyanabilen eşyalarda resim gelince hemen ardından maskesinin isteğini aynı sohbette gönder.',
    '3. Her resmi istekteki **File name** adıyla indir ve projedeki `art-incoming/` klasörüne koy.',
    '4. `npm run art:sync` çalıştır: dosyalar boyutlandırılır, doğrulanır, uygulamaya eklenir ve `docs/art/gallery.html` güncellenir. Hatalı olanlar `docs/art/VALIDATION_REPORT.md` içinde nedeniyle listelenir; onları yeniden üret.',
    '',
    '## Açılış mesajı (her sohbetin başında bir kez)',
    '',
    '```text',
    SESSION_OPENER,
    '```',
    '',
  ];
  for (const [b, title] of Object.entries(BATCHES)) {
    const assets = catalog.filter((a) => a.batch === b && a.category !== 'paint_mask' && (open(a) || (a.mask && open(catalog.find((m) => m.id === `${a.id}.mask`)!))));
    out.push(`## ${b} — ${title}`, '');
    if (!assets.length) {
      out.push('Bu partideki bütün dosyalar geçerli.', '');
      continue;
    }
    if (b === 'B7') out.push('Her istekte ilgili `place/...` resmini de ekle: oda, kamera ve ışık birebir aynı kalmalı.', '');
    for (const a of assets) {
      const mask = a.paintable ? catalog.find((m) => m.id === `${a.id}.mask`) : undefined;
      out.push(`### ${a.id}${a.visualTestOnly ? ' (görsel dil denemesi)' : ''}`, '');
      if (open(a)) out.push('```text', prompt(a, names.get(a.id)!, mask), '```', '');
      if (mask && open(mask)) out.push('Ardından aynı sohbette maske:', '', '```text', maskPrompt(a, mask, names.get(mask.id)!), '```', '');
    }
  }
  return out.join('\n');
}
