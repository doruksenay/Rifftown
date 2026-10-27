# Rifftown görsel üretim istekleri (ChatGPT)

Bu dosya `npm run art:manifest` / `npm run art:sync` ile üretilir; yalnızca henüz geçerli dosyası olmayan varlıkları listeler. Tanımlar `scripts/art/catalog.ts` içinde.

## Akış

1. ChatGPT'de her parti için yeni bir sohbet aç. Stil panosunu ekle ve aşağıdaki **açılış mesajını** gönder.
2. Partideki her isteği sırayla, **tek tek** gönder. Boyanabilen eşyaların maskesini ChatGPT'den isteme; `npm run art:automask` gri yüzeyden çıkarır.
3. Her resmi istekteki **File name** adıyla indir ve projedeki `art-incoming/` klasörüne koy.
4. `npm run art:sync` çalıştır: dosyalar boyutlandırılır, doğrulanır, uygulamaya eklenir ve `docs/art/gallery.html` güncellenir. Hatalı olanlar `docs/art/VALIDATION_REPORT.md` içinde nedeniyle listelenir; onları yeniden üret.

## Açılış mesajı (her sohbetin başında bir kez)

```text
We are producing artwork for Rifftown, a music career and life simulation game. Follow "Rifftown Visual Language v1" for every image in this conversation:

- Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
- Individual objects: three-quarter view from slightly above, centred, ~10% padding, transparent background, the same camera and lighting for every object.
- Tiers are shown through design and materials: Basic (entry-level), Stage (solid professional), Professional (premium craftsmanship), Iconic (legendary collectible), Crafted (handmade one-off).
- Repaintable surfaces are rendered in neutral light grey (#DADADA) with full shading and highlights; everything else keeps its natural material and colour, clearly different from that grey.
- The attached style board is the primary reference. Match its finish, detail density and lighting.

Generate exactly one image per message, at the size I ask for. Do not add text, labels or logos. Reply "Ready" and wait for the first request.
```

## B0 — Proof of concept (style check)

Bu partideki bütün dosyalar geçerli.

## B1 — Cities

Bu partideki bütün dosyalar geçerli.

## B2 — Places and venues

### place/club

```text
Asset ID: place/club
File name: club.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a mid-sized music club seen from the dance floor, stage with coloured spotlights and haze, balcony rail.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

## B3 — Instruments and paint masks

### item/vocals_1

```text
Asset ID: item/vocals_1
File name: vocals_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a cheap basic handheld dynamic microphone with a plain round grille.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the microphone handle/body (not the grille). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/vocals_1` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/vocals_2

```text
Asset ID: item/vocals_2
File name: vocals_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a sturdy professional stage vocal microphone with a polished grille.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the microphone handle/body (not the grille). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/vocals_2` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/vocals_3

```text
Asset ID: item/vocals_3
File name: vocals_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a sleek premium wireless studio-grade handheld microphone with a small status light.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the microphone handle/body (not the grille). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/vocals_3` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/guitar_2

```text
Asset ID: item/guitar_2
File name: guitar_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a solid mid-range stage electric guitar with two pickups and a pickguard.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/guitar_2` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/guitar_3

```text
Asset ID: item/guitar_3
File name: guitar_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a luthier-made master electric guitar, figured maple neck, gold hardware, elegant body.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/guitar_3` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/bass_1

```text
Asset ID: item/bass_1
File name: bass_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a cheap beginner four-string electric bass guitar, simple body.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/bass_1` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/bass_2

```text
Asset ID: item/bass_2
File name: bass_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a solid stage four-string electric bass with a pickguard and two pickups.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/bass_2` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/bass_3

```text
Asset ID: item/bass_3
File name: bass_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a luthier-made master five-string bass, figured wood neck, gold hardware.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/bass_3` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/drums_1

```text
Asset ID: item/drums_1
File name: drums_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a small beginner drum kit: bass drum, snare, one tom and one cymbal.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/drums_1` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/drums_2

```text
Asset ID: item/drums_2
File name: drums_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a complete stage drum kit: bass drum, snare, two toms, floor tom, hi-hat and two cymbals.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/drums_2` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/drums_3

```text
Asset ID: item/drums_3
File name: drums_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a large professional drum kit with many toms and gleaming cymbals on chrome stands.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/drums_3` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/keys_1

```text
Asset ID: item/keys_1
File name: keys_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a small beginner portable keyboard with a few buttons.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the keyboard casing (not the keys, knobs, screen or wooden side panels). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/keys_1` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/keys_2

```text
Asset ID: item/keys_2
File name: keys_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a stage synthesizer with knobs, a small screen and pitch wheels.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the keyboard casing (not the keys, knobs, screen or wooden side panels). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/keys_2` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/vocals_4

```text
Asset ID: item/vocals_4
File name: vocals_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a legendary vintage large-diaphragm studio condenser microphone in a shock mount with chrome details.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the microphone handle/body (not the grille). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/vocals_4` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/bass_4

```text
Asset ID: item/bass_4
File name: bass_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a legendary 1962-style vintage electric bass, worn relic finish, aged chrome covers.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/bass_4` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/drums_4

```text
Asset ID: item/drums_4
File name: drums_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a legendary drummer's old vintage drum kit, worn heads with stick marks, aged brass cymbals.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/drums_4` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/keys_4

```text
Asset ID: item/keys_4
File name: keys_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a legendary vintage analog synthesizer with wooden side panels, rows of knobs and patch cables.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the keyboard casing (not the keys, knobs, screen or wooden side panels). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/keys_4` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/vocals_crafted

```text
Asset ID: item/vocals_crafted
File name: vocals_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a handmade microphone built in a workshop, visible screws, hand-turned wooden handle.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the microphone handle/body (not the grille). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/vocals_crafted` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/guitar_crafted

```text
Asset ID: item/guitar_crafted
File name: guitar_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a handmade workshop electric guitar, unusual hand-shaped body, hand-wound pickups, visible wood grain on the neck.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/guitar_crafted` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/bass_crafted

```text
Asset ID: item/bass_crafted
File name: bass_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a handmade workshop bass guitar, chunky neck, visible wood grain, home-built look.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/bass_crafted` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/drums_crafted

```text
Asset ID: item/drums_crafted
File name: drums_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a handmade workshop drum kit, hand-tightened lugs, mismatched vintage cymbals.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/drums_crafted` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/keys_crafted

```text
Asset ID: item/keys_crafted
File name: keys_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a handmade workshop synthesizer in a wooden box, mismatched knobs, exposed circuit details.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the keyboard casing (not the keys, knobs, screen or wooden side panels). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/keys_crafted` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/guitar_1b

```text
Asset ID: item/guitar_1b
File name: guitar_1b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Electro-acoustic guitar.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/guitar_1b` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/guitar_2b

```text
Asset ID: item/guitar_2b
File name: guitar_2b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Semi-hollow jazz guitar.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/guitar_2b` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/guitar_2c

```text
Asset ID: item/guitar_2c
File name: guitar_2c.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Seven-string metal guitar.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/guitar_2c` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/bass_1b

```text
Asset ID: item/bass_1b
File name: bass_1b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Fretless bass.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/bass_1b` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/bass_2b

```text
Asset ID: item/bass_2b
File name: bass_2b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Five-string bass.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/bass_2b` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/drums_1b

```text
Asset ID: item/drums_1b
File name: drums_1b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Electronic drum pad.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/drums_1b` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/drums_2b

```text
Asset ID: item/drums_2b
File name: drums_2b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Jazz drum kit.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/drums_2b` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/keys_1b

```text
Asset ID: item/keys_1b
File name: keys_1b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Portable synth.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the keyboard casing (not the keys, knobs, screen or wooden side panels). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/keys_1b` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/keys_2b

```text
Asset ID: item/keys_2b
File name: keys_2b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Electric piano.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the keyboard casing (not the keys, knobs, screen or wooden side panels). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/keys_2b` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/keys_2c

```text
Asset ID: item/keys_2c
File name: keys_2c.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Modular synth rack.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the keyboard casing (not the keys, knobs, screen or wooden side panels). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/keys_2c` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/vocals_1b

```text
Asset ID: item/vocals_1b
File name: vocals_1b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Dynamic stage mic.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the microphone handle/body (not the grille). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/vocals_1b` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/vocals_2b

```text
Asset ID: item/vocals_2b
File name: vocals_2b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: In-ear monitor vocal rig.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the microphone handle/body (not the grille). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/vocals_2b` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/guitar_2d

```text
Asset ID: item/guitar_2d
File name: guitar_2d.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Resonator guitar.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/guitar_2d` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/guitar_1c

```text
Asset ID: item/guitar_1c
File name: guitar_1c.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Nylon-string classical guitar.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/guitar_1c` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/keys_1c

```text
Asset ID: item/keys_1c
File name: keys_1c.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Hammond-style organ.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the keyboard casing (not the keys, knobs, screen or wooden side panels). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/keys_1c` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/reward_vedat_mic

```text
Asset ID: item/reward_vedat_mic
File name: reward_vedat_mic.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Vedat Karahan's studio mic.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the microphone handle/body (not the grille). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/reward_vedat_mic` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/guitar_istanbul

```text
Asset ID: item/guitar_istanbul
File name: guitar_istanbul.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Electric saz.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/guitar_istanbul` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/keys_berlin

```text
Asset ID: item/keys_berlin
File name: keys_berlin.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: East Berlin analogue synth.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the keyboard casing (not the keys, knobs, screen or wooden side panels). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/keys_berlin` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/drums_hamburg

```text
Asset ID: item/drums_hamburg
File name: drums_hamburg.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Kiez drum kit.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/drums_hamburg` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/guitar_manchester

```text
Asset ID: item/guitar_manchester
File name: guitar_manchester.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Mill Town semi-acoustic.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/guitar_manchester` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/bass_liverpool

```text
Asset ID: item/bass_liverpool
File name: bass_liverpool.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Mersey violin bass.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/bass_liverpool` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/guitar_paris

```text
Asset ID: item/guitar_paris
File name: guitar_paris.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Gypsy jazz guitar.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/guitar_paris` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/vocals_marseille

```text
Asset ID: item/vocals_marseille
File name: vocals_marseille.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Harbour mic.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the microphone handle/body (not the grille). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/vocals_marseille` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/drums_newyork

```text
Asset ID: item/drums_newyork
File name: drums_newyork.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Brooklyn breakbeat kit.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/drums_newyork` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/guitar_nashville

```text
Asset ID: item/guitar_nashville
File name: guitar_nashville.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Music Row tele-style guitar.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/guitar_nashville` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

## B4 — Outfits, vehicles, spray paint and paint masks

### item/outfit_1

```text
Asset ID: item/outfit_1
File name: outfit_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a plain t-shirt with jeans laid together.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_1` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_3

```text
Asset ID: item/outfit_3
File name: outfit_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a designer stage jacket with sequins and sharp shoulders on a hanger.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_3` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_4

```text
Asset ID: item/outfit_4
File name: outfit_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a spectacular celebrity-designer stage coat with embroidery and crystals on a mannequin.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_4` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/car_1

```text
Asset ID: item/car_1
File name: car_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: an old small hatchback car, a little dented, side view.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/car_1` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/moto_1

```text
Asset ID: item/moto_1
File name: moto_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a classic naked motorcycle, side view.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/moto_1` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/van_1

```text
Asset ID: item/van_1
File name: van_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a band tour minibus van with instrument cases on the roof rack, side view.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/van_1` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/car_3

```text
Asset ID: item/car_3
File name: car_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a sleek modern sports coupe, low and sharp, side view.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/car_3` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/car_4

```text
Asset ID: item/car_4
File name: car_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a classic 1960s-style convertible with chrome details, top down, side view.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/car_4` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_crafted

```text
Asset ID: item/outfit_crafted
File name: outfit_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a handmade patchwork stage jacket with hand-sewn patches and safety pins on a hanger.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_crafted` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_1b

```text
Asset ID: item/outfit_1b
File name: outfit_1b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Band tee and boots.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_1b` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_2e

```text
Asset ID: item/outfit_2e
File name: outfit_2e.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Cowboy hat and boots.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_2e` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_1c

```text
Asset ID: item/outfit_1c
File name: outfit_1c.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Retro tracksuit.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_1c` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_2b

```text
Asset ID: item/outfit_2b
File name: outfit_2b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Velvet jacket.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_2b` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_2c

```text
Asset ID: item/outfit_2c
File name: outfit_2c.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Sequined stage dress.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_2c` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_2d

```text
Asset ID: item/outfit_2d
File name: outfit_2d.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Leather trousers and vest.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_2d` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_3b

```text
Asset ID: item/outfit_3b
File name: outfit_3b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Light-up stage costume.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_3b` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_3c

```text
Asset ID: item/outfit_3c
File name: outfit_3c.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Haute couture tuxedo.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_3c` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/scooter_1

```text
Asset ID: item/scooter_1
File name: scooter_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Scooter.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/scooter_1` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/pickup_1

```text
Asset ID: item/pickup_1
File name: pickup_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Pickup truck.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/pickup_1` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_leather_crafted

```text
Asset ID: item/outfit_leather_crafted
File name: outfit_leather_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Handmade leather jacket.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_leather_crafted` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_led_crafted

```text
Asset ID: item/outfit_led_crafted
File name: outfit_led_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Handmade light-up costume.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_led_crafted` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/reward_fox_jacket

```text
Asset ID: item/reward_fox_jacket
File name: reward_fox_jacket.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Red Fox stage jacket.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/reward_fox_jacket` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_winter

```text
Asset ID: item/outfit_winter
File name: outfit_winter.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Winter tour greatcoat.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_winter` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_spring

```text
Asset ID: item/outfit_spring
File name: outfit_spring.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Floral spring shirt.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_spring` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_summer

```text
Asset ID: item/outfit_summer
File name: outfit_summer.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Festival summer outfit.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_summer` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_ankara

```text
Asset ID: item/outfit_ankara
File name: outfit_ankara.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Steppe parka.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_ankara` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_london

```text
Asset ID: item/outfit_london
File name: outfit_london.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Kings Road leather jacket.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_london` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_lyon

```text
Asset ID: item/outfit_lyon
File name: outfit_lyon.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Lyon silk stage shirt.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_lyon` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/outfit_la

```text
Asset ID: item/outfit_la
File name: outfit_la.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Hollywood glitter jacket.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/outfit_la` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

### item/spray

```text
Asset ID: item/spray
File name: spray.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a single spray paint can with its cap.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the can body label area and the cap (not the metal top and nozzle). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Maske ChatGPT'den istenmez. Görsel geçerli olunca: `npm run art:automask -- item/spray` (sonra `npm run art:sync`, galeride boya örneklerini kontrol et).

## B5 — Art, rings, pets, stage effects, materials

### item/sax_1

```text
Asset ID: item/sax_1
File name: sax_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Student alto sax.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/sax_2

```text
Asset ID: item/sax_2
File name: sax_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Stage tenor sax.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/sax_3

```text
Asset ID: item/sax_3
File name: sax_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Handmade pro saxophone.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/violin_1

```text
Asset ID: item/violin_1
File name: violin_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Student violin.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/violin_2

```text
Asset ID: item/violin_2
File name: violin_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Stage violin with pickup.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/violin_3

```text
Asset ID: item/violin_3
File name: violin_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Master-built concert violin.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/percussion_1

```text
Asset ID: item/percussion_1
File name: percussion_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Darbuka and frame drum.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/percussion_2

```text
Asset ID: item/percussion_2
File name: percussion_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Conga and bongo set.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/percussion_3

```text
Asset ID: item/percussion_3
File name: percussion_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Professional percussion rig.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/sax_4

```text
Asset ID: item/sax_4
File name: sax_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: 1954 vintage tenor sax.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/violin_4

```text
Asset ID: item/violin_4
File name: violin_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Century-old master violin.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/percussion_4

```text
Asset ID: item/percussion_4
File name: percussion_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: A legendary percussionist's conga set.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/art_1

```text
Asset ID: item/art_1
File name: art_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a framed screen-printed gig poster with abstract guitar and star shapes, no words.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/art_2

```text
Asset ID: item/art_2
File name: art_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a street art canvas with colourful graffiti-style shapes and drips, no letters.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/art_3

```text
Asset ID: item/art_3
File name: art_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: an oil painting of a mountain landscape at sunset in a gilded wooden frame.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/art_4

```text
Asset ID: item/art_4
File name: art_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a large abstract expressionist painting in a thin modern frame.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/art_5

```text
Asset ID: item/art_5
File name: art_5.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a museum-grade classical portrait painting in an ornate heavy gold frame.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/ring_1

```text
Asset ID: item/ring_1
File name: ring_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a simple silver engagement ring with a small stone.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/ring_2

```text
Asset ID: item/ring_2
File name: ring_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a platinum engagement ring with a large brilliant-cut diamond.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/pet_cat

```text
Asset ID: item/pet_cat
File name: pet_cat.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a grey tabby cat sitting, looking at the viewer.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/pet_dog

```text
Asset ID: item/pet_dog
File name: pet_dog.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a friendly scruffy mixed-breed adopted street dog sitting.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/pet_parrot

```text
Asset ID: item/pet_parrot
File name: pet_parrot.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a colourful talking parrot on a small wooden perch.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/pet_bengal

```text
Asset ID: item/pet_bengal
File name: pet_bengal.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: an elegant spotted Bengal cat lying down.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/fx_smoke

```text
Asset ID: item/fx_smoke
File name: fx_smoke.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a stage fog machine puffing a cloud of smoke.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/fx_confetti

```text
Asset ID: item/fx_confetti
File name: fx_confetti.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a stage confetti cannon firing colourful confetti.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/fx_lights

```text
Asset ID: item/fx_lights
File name: fx_lights.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a moving-head stage light casting a coloured beam.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/fx_pyro

```text
Asset ID: item/fx_pyro
File name: fx_pyro.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a stage pyrotechnic flame unit shooting a column of fire.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_wood

```text
Asset ID: item/mat_wood
File name: mat_wood.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a raw unfinished solid-wood guitar body blank with visible grain.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_strings

```text
Asset ID: item/mat_strings
File name: mat_strings.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a coiled set of guitar strings in a small open pack.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_pickup

```text
Asset ID: item/mat_pickup
File name: mat_pickup.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a single electric guitar pickup with its wires.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_drumhead

```text
Asset ID: item/mat_drumhead
File name: mat_drumhead.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a new white drum head with a metal hoop.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_circuit

```text
Asset ID: item/mat_circuit
File name: mat_circuit.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a small green electronic circuit board with chips.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_keys

```text
Asset ID: item/mat_keys
File name: mat_keys.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a loose row of spare black and white piano keys.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_capsule

```text
Asset ID: item/mat_capsule
File name: mat_capsule.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a small microphone capsule with a gold diaphragm.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_fabric

```text
Asset ID: item/mat_fabric
File name: mat_fabric.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a folded bolt of fabric with a measuring tape.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_sequins

```text
Asset ID: item/mat_sequins
File name: mat_sequins.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a small glass jar overflowing with sequins and rhinestones.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/sax_crafted

```text
Asset ID: item/sax_crafted
File name: sax_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Handmade saxophone.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/violin_crafted

```text
Asset ID: item/violin_crafted
File name: violin_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Handmade violin.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/percussion_crafted

```text
Asset ID: item/percussion_crafted
File name: percussion_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Handmade conga.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/violin_2b

```text
Asset ID: item/violin_2b
File name: violin_2b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Country fiddle.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/sax_2b

```text
Asset ID: item/sax_2b
File name: sax_2b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Baritone sax.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/percussion_2b

```text
Asset ID: item/percussion_2b
File name: percussion_2b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Nyabinghi drum set.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/art_1b

```text
Asset ID: item/art_1b
File name: art_1b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Signed record sleeve.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/art_1c

```text
Asset ID: item/art_1c
File name: art_1c.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Black-and-white gig photo.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/art_2b

```text
Asset ID: item/art_2b
File name: art_2b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Neon sign.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/art_2c

```text
Asset ID: item/art_2c
File name: art_2c.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Bronze sculpture.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/art_3b

```text
Asset ID: item/art_3b
File name: art_3b.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Pop art screen print.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/pet_rabbit

```text
Asset ID: item/pet_rabbit
File name: pet_rabbit.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Rabbit.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/pet_fish

```text
Asset ID: item/pet_fish
File name: pet_fish.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Aquarium fish.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/pet_tortoise

```text
Asset ID: item/pet_tortoise
File name: pet_tortoise.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Tortoise.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/pet_ferret

```text
Asset ID: item/pet_ferret
File name: pet_ferret.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Ferret.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/fx_bubbles

```text
Asset ID: item/fx_bubbles
File name: fx_bubbles.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Bubble machine.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/fx_lasers

```text
Asset ID: item/fx_lasers
File name: fx_lasers.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Laser show.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/fx_co2

```text
Asset ID: item/fx_co2
File name: fx_co2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: CO₂ jets.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/fx_screen

```text
Asset ID: item/fx_screen
File name: fx_screen.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Giant LED screen.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/fx_balloons

```text
Asset ID: item/fx_balloons
File name: fx_balloons.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Giant balloons.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_leather

```text
Asset ID: item/mat_leather
File name: mat_leather.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Leather.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_led

```text
Asset ID: item/mat_led
File name: mat_led.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: LED strip.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_canvas

```text
Asset ID: item/mat_canvas
File name: mat_canvas.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Canvas.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_paint

```text
Asset ID: item/mat_paint
File name: mat_paint.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Oil paint set.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_powder

```text
Asset ID: item/mat_powder
File name: mat_powder.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Stage powder.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_amp_parts

```text
Asset ID: item/mat_amp_parts
File name: mat_amp_parts.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Amp parts.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_metal

```text
Asset ID: item/mat_metal
File name: mat_metal.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Metal sheet.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_brass

```text
Asset ID: item/mat_brass
File name: mat_brass.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Brass body.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_reed

```text
Asset ID: item/mat_reed
File name: mat_reed.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Sax reed.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/mat_bow

```text
Asset ID: item/mat_bow
File name: mat_bow.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Violin bow.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/condom

```text
Asset ID: item/condom
File name: condom.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Condom.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/repair_kit

```text
Asset ID: item/repair_kit
File name: repair_kit.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Repair kit.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/gear_service

```text
Asset ID: item/gear_service
File name: gear_service.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Gear service pack.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/art_crafted

```text
Asset ID: item/art_crafted
File name: art_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Handmade painting.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/fx_crafted

```text
Asset ID: item/fx_crafted
File name: fx_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Handmade pyrotechnics.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/reward_melek_notebook

```text
Asset ID: item/reward_melek_notebook
File name: reward_melek_notebook.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Melek Aksoy's notebook.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/fx_snow

```text
Asset ID: item/fx_snow
File name: fx_snow.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Snow machine.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/fx_fireworks

```text
Asset ID: item/fx_fireworks
File name: fx_fireworks.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Harvest fireworks.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/art_autumn

```text
Asset ID: item/art_autumn
File name: art_autumn.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Autumn tour poster (limited print).
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/sax_izmir

```text
Asset ID: item/sax_izmir
File name: sax_izmir.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Alsancak tenor sax.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/violin_munich

```text
Asset ID: item/violin_munich
File name: violin_munich.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: Mittenwald violin.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

## B6 — Avatar portraits

### avatar/03

```text
Asset ID: avatar/03
File name: avatar-03.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a Black woman jazz singer in her thirties, natural afro, gold hoop earrings, elegant dark dress.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/04

```text
Asset ID: avatar/04
File name: avatar-04.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a middle-aged Turkish man folk-rock musician, thick moustache, curly dark hair, patterned shirt.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/05

```text
Asset ID: avatar/05
File name: avatar-05.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young East Asian woman electronic producer, straight black hair with blunt bangs, headphones around her neck.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/06

```text
Asset ID: avatar/06
File name: avatar-06.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young Black man hip-hop artist with short twists, a gold chain, a streetwear hoodie.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/07

```text
Asset ID: avatar/07
File name: avatar-07.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a metal bassist man in his thirties, very long black hair, full beard, plain black t-shirt.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/08

```text
Asset ID: avatar/08
File name: avatar-08.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: an older woman blues pianist in her sixties, silver hair in a bun, round glasses, cardigan.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/09

```text
Asset ID: avatar/09
File name: avatar-09.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young Latina pop singer, long wavy dark hair, glittery top, star earrings.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/10

```text
Asset ID: avatar/10
File name: avatar-10.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young man indie guitarist, messy blond hair, beanie, flannel shirt.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/11

```text
Asset ID: avatar/11
File name: avatar-11.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a South Asian woman keyboardist, long braid, denim jacket.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/12

```text
Asset ID: avatar/12
File name: avatar-12.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a Middle Eastern man in his forties, shaved head, neat beard, turtleneck, jazz saxophonist look.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/13

```text
Asset ID: avatar/13
File name: avatar-13.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young non-binary electronic musician, cyan-dyed undercut, several ear piercings, mesh top.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/14

```text
Asset ID: avatar/14
File name: avatar-14.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a red-haired woman in her twenties, curly ginger hair, freckles, vintage band jacket, singer-songwriter.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/15

```text
Asset ID: avatar/15
File name: avatar-15.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: an older man rock veteran in his sixties, long grey hair, sunglasses pushed up, leather vest.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/16

```text
Asset ID: avatar/16
File name: avatar-16.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young Turkish woman Anatolian-rock singer, long straight dark hair, small hoop earrings, embroidered jacket.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/17

```text
Asset ID: avatar/17
File name: avatar-17.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young man DJ, backwards cap, small moustache, oversized t-shirt.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/18

```text
Asset ID: avatar/18
File name: avatar-18.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a Black woman rock bassist, long box braids tied up, studded choker, bold lipstick.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/19

```text
Asset ID: avatar/19
File name: avatar-19.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young East Asian man, bleached silver hair, sharp tailored jacket, pop idol look.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/20

```text
Asset ID: avatar/20
File name: avatar-20.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a woman in her forties, short grey pixie cut, bold glasses, black turtleneck, synth pioneer.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/21

```text
Asset ID: avatar/21
File name: avatar-21.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young man country singer, cowboy hat, light stubble, denim shirt.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/22

```text
Asset ID: avatar/22
File name: avatar-22.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young woman goth singer, long black hair, dark eye makeup, lace collar.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/23

```text
Asset ID: avatar/23
File name: avatar-23.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a Black man in his fifties, grey beard, flat cap, vest over a white shirt, soul guitarist.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/24

```text
Asset ID: avatar/24
File name: avatar-24.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young woman pop-punk drummer, purple high ponytail, sporty jacket.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/25

```text
Asset ID: avatar/25
File name: avatar-25.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young man jazz pianist, curly brown hair, round glasses, cardigan, shy smile.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/26

```text
Asset ID: avatar/26
File name: avatar-26.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a Latino man in his thirties, slicked-back hair, thin moustache, open-collar shirt, rock singer.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/27

```text
Asset ID: avatar/27
File name: avatar-27.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young woman metal guitarist, blonde buzz cut, small star tattoos on her neck, tank top.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/28

```text
Asset ID: avatar/28
File name: avatar-28.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a man in his twenties, colourful knitted hat over dreadlocks, friendly grin, reggae-influenced singer.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/29

```text
Asset ID: avatar/29
File name: avatar-29.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a woman in her fifties, bright red short haircut, statement earrings, sequined blazer, classic rock vocalist.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/30

```text
Asset ID: avatar/30
File name: avatar-30.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young man of about twenty, messy black fringe, plain hoodie, earbuds, bedroom producer.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/31

```text
Asset ID: avatar/31
File name: avatar-31.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young woman in 1970s style, wavy brown bob, big round sunglasses, fringed suede jacket.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/32

```text
Asset ID: avatar/32
File name: avatar-32.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a tall man in his thirties, sharp fade haircut, trimmed beard, gold rings, satin shirt, R&B singer.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

## B7 — Concert occupancy variants

Her istekte ilgili `place/...` resmini de ekle: oda, kamera ve ışık birebir aynı kalmalı.

### crowd/bar.empty

```text
Asset ID: crowd/bar.empty
File name: crowd-bar.empty.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a small basement live-music bar seen from the audience, low stage with a drum kit and amplifiers against an exposed brick wall, bar counter with stools; the audience is almost empty, only a handful of people; same room, camera and lighting as place/bar.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### crowd/bar.half

```text
Asset ID: crowd/bar.half
File name: crowd-bar.half.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a small basement live-music bar seen from the audience, low stage with a drum kit and amplifiers against an exposed brick wall, bar counter with stools; the audience is about half full; same room, camera and lighting as place/bar.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### crowd/bar.full

```text
Asset ID: crowd/bar.full
File name: crowd-bar.full.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a small basement live-music bar seen from the audience, low stage with a drum kit and amplifiers against an exposed brick wall, bar counter with stools; the audience is packed wall to wall, hands in the air; same room, camera and lighting as place/bar.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### crowd/club.empty

```text
Asset ID: crowd/club.empty
File name: crowd-club.empty.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a mid-sized music club seen from the dance floor, stage with coloured spotlights and haze, balcony rail; the audience is almost empty, only a handful of people; same room, camera and lighting as place/club.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### crowd/club.half

```text
Asset ID: crowd/club.half
File name: crowd-club.half.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a mid-sized music club seen from the dance floor, stage with coloured spotlights and haze, balcony rail; the audience is about half full; same room, camera and lighting as place/club.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### crowd/club.full

```text
Asset ID: crowd/club.full
File name: crowd-club.full.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a mid-sized music club seen from the dance floor, stage with coloured spotlights and haze, balcony rail; the audience is packed wall to wall, hands in the air; same room, camera and lighting as place/club.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### crowd/hall.empty

```text
Asset ID: crowd/hall.empty
File name: crowd-hall.empty.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a grand concert hall seen from the stalls, big stage framed by heavy velvet curtains, balconies, rows of seats; the audience is almost empty, only a handful of people; same room, camera and lighting as place/hall.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### crowd/hall.half

```text
Asset ID: crowd/hall.half
File name: crowd-hall.half.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a grand concert hall seen from the stalls, big stage framed by heavy velvet curtains, balconies, rows of seats; the audience is about half full; same room, camera and lighting as place/hall.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### crowd/hall.full

```text
Asset ID: crowd/hall.full
File name: crowd-hall.full.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a grand concert hall seen from the stalls, big stage framed by heavy velvet curtains, balconies, rows of seats; the audience is packed wall to wall, hands in the air; same room, camera and lighting as place/hall.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### crowd/stadium.empty

```text
Asset ID: crowd/stadium.empty
File name: crowd-stadium.empty.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: a huge open-air stadium concert seen from the stands, massive stage with giant screens and lighting towers; the audience is almost empty, only a handful of people; same room, camera and lighting as place/stadium.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### crowd/stadium.half

```text
Asset ID: crowd/stadium.half
File name: crowd-stadium.half.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: a huge open-air stadium concert seen from the stands, massive stage with giant screens and lighting towers; the audience is about half full; same room, camera and lighting as place/stadium.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### crowd/stadium.full

```text
Asset ID: crowd/stadium.full
File name: crowd-stadium.full.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: a huge open-air stadium concert seen from the stands, massive stage with giant screens and lighting towers; the audience is packed wall to wall, hands in the air; same room, camera and lighting as place/stadium.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### crowd/festival.empty

```text
Asset ID: crowd/festival.empty
File name: crowd-festival.empty.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: a summer open-air music festival at golden hour, big stage with lighting truss, colourful tents and flags on the grass; the audience is almost empty, only a handful of people; same room, camera and lighting as place/festival.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### crowd/festival.half

```text
Asset ID: crowd/festival.half
File name: crowd-festival.half.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: a summer open-air music festival at golden hour, big stage with lighting truss, colourful tents and flags on the grass; the audience is about half full; same room, camera and lighting as place/festival.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### crowd/festival.full

```text
Asset ID: crowd/festival.full
File name: crowd-festival.full.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: a summer open-air music festival at golden hour, big stage with lighting truss, colourful tents and flags on the grass; the audience is packed wall to wall, hands in the air; same room, camera and lighting as place/festival.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Exactly the same room, camera position, lens and lighting as the referenced place image; only the number and energy of the audience changes. Keep everything important inside the middle two-thirds vertically (16:7 crop).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

## B8 — Achievement badges

### achievement/first_song

```text
Asset ID: achievement/first_song
File name: achievement-first_song.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "First tune" — Write your first song..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/first_band

```text
Asset ID: achievement/first_band
File name: achievement-first_band.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Garage band" — Start or join a band..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/first_gig

```text
Asset ID: achievement/first_gig
File name: achievement-first_gig.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Stage fright" — Play your first gig..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/first_job

```text
Asset ID: achievement/first_job
File name: achievement-first_job.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Rent money" — Finish your first shift..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/first_travel

```text
Asset ID: achievement/first_travel
File name: achievement-first_travel.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "On the road" — Travel to another city..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/new_skill

```text
Asset ID: achievement/new_skill
File name: achievement-new_skill.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Bookworm" — Learn a new skill..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/busker

```text
Asset ID: achievement/busker
File name: achievement-busker.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Hat on the ground" — Busk in the park..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/gigs_10

```text
Asset ID: achievement/gigs_10
File name: achievement-gigs_10.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Road warriors" — Play 10 gigs..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/gigs_50

```text
Asset ID: achievement/gigs_50
File name: achievement-gigs_50.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Stage dust" — Play 50 gigs..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/full_house

```text
Asset ID: achievement/full_house
File name: achievement-full_house.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Sold out" — Play a gig at 90% capacity or more..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/hall_gig

```text
Asset ID: achievement/hall_gig
File name: achievement-hall_gig.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "The big stage" — Play a concert hall..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/epic_gig

```text
Asset ID: achievement/epic_gig
File name: achievement-epic_gig.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "EPIC" — Play an EPIC gig..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/world_tour

```text
Asset ID: achievement/world_tour
File name: achievement-world_tour.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "World tour" — Play gigs in 5 different countries..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/local_star

```text
Asset ID: achievement/local_star
File name: achievement-local_star.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Local star" — Become a local star in a city with your band..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/superstar

```text
Asset ID: achievement/superstar
File name: achievement-superstar.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Superstar" — Become a superstar in a city with your band..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/songs_10

```text
Asset ID: achievement/songs_10
File name: achievement-songs_10.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Songbook" — Write 10 songs..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/great_song

```text
Asset ID: achievement/great_song
File name: achievement-great_song.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Smells like a hit" — Write a great song or better..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/first_recording

```text
Asset ID: achievement/first_recording
File name: achievement-first_recording.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Red light on" — Record a song..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/first_single

```text
Asset ID: achievement/first_single
File name: achievement-first_single.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "First single" — Release a single with your band..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/first_album

```text
Asset ID: achievement/first_album
File name: achievement-first_album.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Long player" — Release an album with your band..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/chart_top10

```text
Asset ID: achievement/chart_top10
File name: achievement-chart_top10.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Top ten" — Reach the top 10 of a city chart..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/chart_no1

```text
Asset ID: achievement/chart_no1
File name: achievement-chart_no1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Number one" — Reach number one on a city chart..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/gold

```text
Asset ID: achievement/gold
File name: achievement-gold.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Gold record" — Sell 1,000 copies of one release..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/skilled

```text
Asset ID: achievement/skilled
File name: achievement-skilled.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Skilled" — Reach skilled in a skill..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/master

```text
Asset ID: achievement/master
File name: achievement-master.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Master" — Become a master of a skill..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/legend

```text
Asset ID: achievement/legend
File name: achievement-legend.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Legend" — Become a legend in a skill..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/polymath

```text
Asset ID: achievement/polymath
File name: achievement-polymath.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Polymath" — Learn 12 different skills..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/first_profession

```text
Asset ID: achievement/first_profession
File name: achievement-first_profession.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Professional" — Take up a profession..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/top_rank

```text
Asset ID: achievement/top_rank
File name: achievement-top_rank.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "At the top" — Reach the top rank of your profession..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/voter

```text
Asset ID: achievement/voter
File name: achievement-voter.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "At the ballot box" — Vote in an election..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/elected

```text
Asset ID: achievement/elected
File name: achievement-elected.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "The people's choice" — Win an election..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/first_crime

```text
Asset ID: achievement/first_crime
File name: achievement-first_crime.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Gone astray" — Commit a crime without getting caught..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/caught

```text
Asset ID: achievement/caught
File name: achievement-caught.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Hands up" — Get arrested..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/jailbird

```text
Asset ID: achievement/jailbird
File name: achievement-jailbird.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Jailbird" — Get convicted three times..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/detective

```text
Asset ID: achievement/detective
File name: achievement-detective.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Detective" — Solve an unsolved crime..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/justice

```text
Asset ID: achievement/justice
File name: achievement-justice.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "On the bench" — Rule on a case as a judge..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/generous

```text
Asset ID: achievement/generous
File name: achievement-generous.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Open-handed" — Send money to another player..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/vip

```text
Asset ID: achievement/vip
File name: achievement-vip.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "VIP" — Become a VIP member..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/empty_room

```text
Asset ID: achievement/empty_room
File name: achievement-empty_room.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Poet of empty rooms" — Play a gig to 3 people or fewer..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/pogo

```text
Asset ID: achievement/pogo
File name: achievement-pogo.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "All hell broke loose" — Land a mosh pit call at a gig..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/hard_landing

```text
Asset ID: achievement/hard_landing
File name: achievement-hard_landing.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Hard landing" — Stage-dive and hit the floor..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/encore_flop

```text
Asset ID: achievement/encore_flop
File name: achievement-encore_flop.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Nobody asked" — Go for a bold encore and have it flop..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/fx_party

```text
Asset ID: achievement/fx_party
File name: achievement-fx_party.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Fireworks factory" — Use three or more stage effects at one gig..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/one_man_band

```text
Asset ID: achievement/one_man_band
File name: achievement-one_man_band.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "One-person orchestra" — Be the only band member on stage, with at least three session players..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/genre_hopper

```text
Asset ID: achievement/genre_hopper
File name: achievement-genre_hopper.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Genre hopper" — Write songs in six different genres..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/legendary_owner

```text
Asset ID: achievement/legendary_owner
File name: achievement-legendary_owner.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Holy relic" — Own a legendary instrument..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/rainbow

```text
Asset ID: achievement/rainbow
File name: achievement-rainbow.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Rainbow" — Own items painted in five different colours..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/pet_named

```text
Asset ID: achievement/pet_named
File name: achievement-pet_named.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Named it Rock" — Give your pet a name..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/all_roles

```text
Asset ID: achievement/all_roles
File name: achievement-all_roles.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Multi-instrumentalist" — Learn the main skill of all eight band roles..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/broke

```text
Asset ID: achievement/broke
File name: achievement-broke.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Flat broke" — End up with no money in pocket or bank..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/front_page

```text
Asset ID: achievement/front_page
File name: achievement-front_page.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Front page" — Have the city reporter write a story about your band..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/heartbreaker

```text
Asset ID: achievement/heartbreaker
File name: achievement-heartbreaker.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Heartbreaker" — Have three one-night flings..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/scene_hit

```text
Asset ID: achievement/scene_hit
File name: achievement-scene_hit.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Right place, right song" — Play a gig where your subgenres really land in that city's scene..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/city_istanbul

```text
Asset ID: achievement/city_istanbul
File name: achievement-city_istanbul.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Voice of the Bosphorus" — Play a good or better Anatolian rock gig in Istanbul..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/city_ankara

```text
Asset ID: achievement/city_ankara
File name: achievement-city_ankara.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Noise of the capital" — Play a good or better Rock gig in Ankara..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/city_izmir

```text
Asset ID: achievement/city_izmir
File name: achievement-city_izmir.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Jazz on the Kordon" — Play a good or better Jazz gig in Izmir..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/city_berlin

```text
Asset ID: achievement/city_berlin
File name: achievement-city_berlin.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Past the door" — Play a good or better Electronic gig in Berlin..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/city_hamburg

```text
Asset ID: achievement/city_hamburg
File name: achievement-city_hamburg.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Reeperbahn apprentice" — Play a good or better Punk gig in Hamburg..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/city_munich

```text
Asset ID: achievement/city_munich
File name: achievement-city_munich.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Applause at the Residenz" — Play a good or better Classical gig in Munich..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/city_london

```text
Asset ID: achievement/city_london
File name: achievement-city_london.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Camden rebel" — Play a good or better Punk gig in London..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/city_manchester

```text
Asset ID: achievement/city_manchester
File name: achievement-city_manchester.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Sound of the North" — Play a good or better Rock gig in Manchester..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/city_liverpool

```text
Asset ID: achievement/city_liverpool
File name: achievement-city_liverpool.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Mersey beat" — Play a good or better Pop gig in Liverpool..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/city_paris

```text
Asset ID: achievement/city_paris
File name: achievement-city_paris.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "A night in Montmartre" — Play a good or better Jazz gig in Paris..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/city_lyon

```text
Asset ID: achievement/city_lyon
File name: achievement-city_lyon.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Club night of two rivers" — Play a good or better Electronic gig in Lyon..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/city_marseille

```text
Asset ID: achievement/city_marseille
File name: achievement-city_marseille.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "MC of the harbour" — Play a good or better Hip-hop gig in Marseille..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/city_newyork

```text
Asset ID: achievement/city_newyork
File name: achievement-city_newyork.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "The city never sleeps" — Play a good or better Hip-hop gig in New York..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/city_losangeles

```text
Asset ID: achievement/city_losangeles
File name: achievement-city_losangeles.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Star of the boulevard" — Play a good or better Pop gig in Los Angeles..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/city_nashville

```text
Asset ID: achievement/city_nashville
File name: achievement-city_nashville.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "New voice of Music Row" — Play a good or better Country gig in Nashville..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/world_kitchen

```text
Asset ID: achievement/world_kitchen
File name: achievement-world_kitchen.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "World kitchen" — Taste the local dish of all 15 cities..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/gigs_100

```text
Asset ID: achievement/gigs_100
File name: achievement-gigs_100.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Hundredth night" — Play 100 gigs..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/gigs_250

```text
Asset ID: achievement/gigs_250
File name: achievement-gigs_250.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Road dog" — Play 250 gigs..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/cities_5

```text
Asset ID: achievement/cities_5
File name: achievement-cities_5.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "City to city" — Play gigs in 5 cities..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/cities_15

```text
Asset ID: achievement/cities_15
File name: achievement-cities_15.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Everywhere" — Play all 15 cities in the world..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/stadium_gig

```text
Asset ID: achievement/stadium_gig
File name: achievement-stadium_gig.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Stadium lights" — Play a stadium..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/festival_gig

```text
Asset ID: achievement/festival_gig
File name: achievement-festival_gig.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Festival stage" — Play a festival..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/festival_5

```text
Asset ID: achievement/festival_5
File name: achievement-festival_5.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Festival regular" — Play 5 festivals..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/epic_5

```text
Asset ID: achievement/epic_5
File name: achievement-epic_5.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "EPIC streak" — Play 5 EPIC gigs..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/legendary_night

```text
Asset ID: achievement/legendary_night
File name: achievement-legendary_night.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "LEGENDARY" — Play a LEGENDARY night..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/stage_moments_10

```text
Asset ID: achievement/stage_moments_10
File name: achievement-stage_moments_10.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Stage commander" — Land 10 stage moments..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/encore_10

```text
Asset ID: achievement/encore_10
File name: achievement-encore_10.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "One more!" — Play 10 encores..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/songs_50

```text
Asset ID: achievement/songs_50
File name: achievement-songs_50.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Notebook full" — Write 50 songs..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/masterpiece

```text
Asset ID: achievement/masterpiece
File name: achievement-masterpiece.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Masterpiece" — Write an outstanding song..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/recordings_25

```text
Asset ID: achievement/recordings_25
File name: achievement-recordings_25.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Studio rat" — Make 25 recordings..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/singles_5

```text
Asset ID: achievement/singles_5
File name: achievement-singles_5.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Singles machine" — Release 5 singles..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/albums_3

```text
Asset ID: achievement/albums_3
File name: achievement-albums_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Discography" — Release 3 albums..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/platinum

```text
Asset ID: achievement/platinum
File name: achievement-platinum.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Platinum record" — Sell 10,000 copies of one release..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/no1_4weeks

```text
Asset ID: achievement/no1_4weeks
File name: achievement-no1_4weeks.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Top of the charts" — Spend 4 weeks at number one on city charts..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/radio_100

```text
Asset ID: achievement/radio_100
File name: achievement-radio_100.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Radio friendly" — Get 100 radio plays..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/video_1

```text
Asset ID: achievement/video_1
File name: achievement-video_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Lights, camera" — Shoot a music video..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/interview_5

```text
Asset ID: achievement/interview_5
File name: achievement-interview_5.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Press darling" — Give 5 interviews or press conferences..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/article_10

```text
Asset ID: achievement/article_10
File name: achievement-article_10.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Wordsmith" — Publish 10 articles..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/tour_1

```text
Asset ID: achievement/tour_1
File name: achievement-tour_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "On the road" — Finish a tour..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/skills_20

```text
Asset ID: achievement/skills_20
File name: achievement-skills_20.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Renaissance" — Learn 20 different skills..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/skills_35

```text
Asset ID: achievement/skills_35
File name: achievement-skills_35.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Know-it-all" — Learn 35 different skills..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/crafter_10

```text
Asset ID: achievement/crafter_10
File name: achievement-crafter_10.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Skilled hands" — Make 10 things in the workshop..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/workouts_20

```text
Asset ID: achievement/workouts_20
File name: achievement-workouts_20.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "In shape" — Work out 20 times..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/shifts_50

```text
Asset ID: achievement/shifts_50
File name: achievement-shifts_50.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Workhorse" — Finish 50 shifts..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/busk_1000

```text
Asset ID: achievement/busk_1000
File name: achievement-busk_1000.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Full hat" — Collect $1,000 busking..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/travels_20

```text
Asset ID: achievement/travels_20
File name: achievement-travels_20.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Wanderer" — Travel 20 times..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/meals_25

```text
Asset ID: achievement/meals_25
File name: achievement-meals_25.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Foodie" — Eat out 25 times..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/friends_5

```text
Asset ID: achievement/friends_5
File name: achievement-friends_5.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Popular" — Make 5 friends..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/hangouts_25

```text
Asset ID: achievement/hangouts_25
File name: achievement-hangouts_25.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Social butterfly" — Hang out 25 times..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/dates_5

```text
Asset ID: achievement/dates_5
File name: achievement-dates_5.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Romantic" — Go on 5 dates..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/married

```text
Asset ID: achievement/married
File name: achievement-married.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Happily ever after" — Get married..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/gifts_5

```text
Asset ID: achievement/gifts_5
File name: achievement-gifts_5.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Gift giver" — Give 5 gifts..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/trader_5

```text
Asset ID: achievement/trader_5
File name: achievement-trader_5.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Haggler" — Complete 5 trades..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/inked_4

```text
Asset ID: achievement/inked_4
File name: achievement-inked_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Inked" — Get 4 tattoos..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/superstar_3

```text
Asset ID: achievement/superstar_3
File name: achievement-superstar_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Star of three cities" — Be a superstar in 3 cities..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/superstar_8

```text
Asset ID: achievement/superstar_8
File name: achievement-superstar_8.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Global star" — Be a superstar in 8 cities..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/superstar_all

```text
Asset ID: achievement/superstar_all
File name: achievement-superstar_all.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Immortal" — Be a superstar in all 15 cities..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### achievement/diamond

```text
Asset ID: achievement/diamond
File name: achievement-diamond.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 256×256 PNG)
Subject: "Diamond record" — Sell 50,000 copies of one release..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Round badge emblem, centred, a metallic medal rim and one clear symbol in the middle, readable at 64 px, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

## B9 — Place, skill and moodlet icons

### icon/place/bar

```text
Asset ID: icon/place/bar
File name: icon-place-bar.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Bar".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/club

```text
Asset ID: icon/place/club
File name: icon-place-club.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Club".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/hall

```text
Asset ID: icon/place/hall
File name: icon-place-hall.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Concert hall".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/stadium

```text
Asset ID: icon/place/stadium
File name: icon-place-stadium.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Stadium".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/festival

```text
Asset ID: icon/place/festival
File name: icon-place-festival.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Festival grounds".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/school

```text
Asset ID: icon/place/school
File name: icon-place-school.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Music school".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/studio

```text
Asset ID: icon/place/studio
File name: icon-place-studio.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Rehearsal studio".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/work

```text
Asset ID: icon/place/work
File name: icon-place-work.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Workplace".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/hospital

```text
Asset ID: icon/place/hospital
File name: icon-place-hospital.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Hospital".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/music_store

```text
Asset ID: icon/place/music_store
File name: icon-place-music_store.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Music store".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/boutique

```text
Asset ID: icon/place/boutique
File name: icon-place-boutique.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Stage boutique".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/gallery

```text
Asset ID: icon/place/gallery
File name: icon-place-gallery.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Art gallery".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/bookstore

```text
Asset ID: icon/place/bookstore
File name: icon-place-bookstore.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Bookstore".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/city_hall

```text
Asset ID: icon/place/city_hall
File name: icon-place-city_hall.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "City hall".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/police

```text
Asset ID: icon/place/police
File name: icon-place-police.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Police headquarters".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/courthouse

```text
Asset ID: icon/place/courthouse
File name: icon-place-courthouse.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Courthouse".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/plaza

```text
Asset ID: icon/place/plaza
File name: icon-place-plaza.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Business tower".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/newspaper

```text
Asset ID: icon/place/newspaper
File name: icon-place-newspaper.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Newspaper".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/worship

```text
Asset ID: icon/place/worship
File name: icon-place-worship.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Place of worship".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/university

```text
Asset ID: icon/place/university
File name: icon-place-university.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "University".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/park

```text
Asset ID: icon/place/park
File name: icon-place-park.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Park".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/recording_studio

```text
Asset ID: icon/place/recording_studio
File name: icon-place-recording_studio.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Recording studio".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/prison

```text
Asset ID: icon/place/prison
File name: icon-place-prison.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Prison".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/real_estate

```text
Asset ID: icon/place/real_estate
File name: icon-place-real_estate.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Estate agent".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/car_dealer

```text
Asset ID: icon/place/car_dealer
File name: icon-place-car_dealer.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Car dealer".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/pet_shop

```text
Asset ID: icon/place/pet_shop
File name: icon-place-pet_shop.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Pet shop".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/hardware

```text
Asset ID: icon/place/hardware
File name: icon-place-hardware.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Hardware and workshop".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/stage_shop

```text
Asset ID: icon/place/stage_shop
File name: icon-place-stage_shop.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Stage equipment shop".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/flea_market

```text
Asset ID: icon/place/flea_market
File name: icon-place-flea_market.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Second-hand market".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/tattoo

```text
Asset ID: icon/place/tattoo
File name: icon-place-tattoo.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Tattoo studio".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/gym

```text
Asset ID: icon/place/gym
File name: icon-place-gym.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Gym".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/restaurant

```text
Asset ID: icon/place/restaurant
File name: icon-place-restaurant.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Restaurant".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/hotel

```text
Asset ID: icon/place/hotel
File name: icon-place-hotel.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Hotel".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/place/bank

```text
Asset ID: icon/place/bank
File name: icon-place-bank.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for "Bank".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/skill/instruments

```text
Asset ID: icon/skill/instruments
File name: icon-skill-instruments.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the skill category "Instruments".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/skill/music

```text
Asset ID: icon/skill/music
File name: icon-skill-music.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the skill category "Music".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/skill/stage

```text
Asset ID: icon/skill/stage
File name: icon-skill-stage.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the skill category "Stage".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/skill/genres

```text
Asset ID: icon/skill/genres
File name: icon-skill-genres.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the skill category "Music genres".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/skill/career

```text
Asset ID: icon/skill/career
File name: icon-skill-career.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the skill category "Career".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/skill/social

```text
Asset ID: icon/skill/social
File name: icon-skill-social.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the skill category "Social".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/skill/sports

```text
Asset ID: icon/skill/sports
File name: icon-skill-sports.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the skill category "Sports".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/skill/crafts

```text
Asset ID: icon/skill/crafts
File name: icon-skill-crafts.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the skill category "Crafts".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### icon/skill/crime

```text
Asset ID: icon/skill/crime
File name: icon-skill-crime.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the skill category "Street".
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol, centred, readable at 32 px, same rim, perspective and lighting as every other icon in the set.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/legendary_gig

```text
Asset ID: moodlet/legendary_gig
File name: moodlet-legendary_gig.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Legendary night" — People will talk about this gig for years..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/great_gig

```text
Asset ID: moodlet/great_gig
File name: moodlet-great_gig.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Great gig" — The crowd sang every word..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/bad_gig

```text
Asset ID: moodlet/bad_gig
File name: moodlet-bad_gig.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Rough gig" — You would rather forget tonight..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/feast

```text
Asset ID: moodlet/feast
File name: moodlet-feast.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Feast" — The chef’s menu did your soul good..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/good_meal

```text
Asset ID: moodlet/good_meal
File name: moodlet-good_meal.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Well fed" — You had a warm meal..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/new_city

```text
Asset ID: moodlet/new_city
File name: moodlet-new_city.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "New city buzz" — New streets, new sounds..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/good_company

```text
Asset ID: moodlet/good_company
File name: moodlet-good_company.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Good company" — You spent time with a friend..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/romantic_evening

```text
Asset ID: moodlet/romantic_evening
File name: moodlet-romantic_evening.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Romantic evening" — It was a lovely date..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/engaged

```text
Asset ID: moodlet/engaged
File name: moodlet-engaged.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Engaged" — They said yes!.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/newlywed

```text
Asset ID: moodlet/newlywed
File name: moodlet-newlywed.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Newlywed" — Honeymoon glow..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/heartbreak

```text
Asset ID: moodlet/heartbreak
File name: moodlet-heartbreak.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Heartbreak" — A relationship ended..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/divorce

```text
Asset ID: moodlet/divorce
File name: moodlet-divorce.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Divorce" — A hard time..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/gift

```text
Asset ID: moodlet/gift
File name: moodlet-gift.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "A gift" — Someone thought of you..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/achievement

```text
Asset ID: moodlet/achievement
File name: moodlet-achievement.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Achievement" — You unlocked an achievement..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/endorphins

```text
Asset ID: moodlet/endorphins
File name: moodlet-endorphins.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Endorphins" — The workout felt good..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/lost_job

```text
Asset ID: moodlet/lost_job
File name: moodlet-lost_job.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Lost a job" — You lost your job..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/evicted

```text
Asset ID: moodlet/evicted
File name: moodlet-evicted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Evicted" — You were evicted..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/good_trade

```text
Asset ID: moodlet/good_trade
File name: moodlet-good_trade.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Good trade" — You closed a trade..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/scandal

```text
Asset ID: moodlet/scandal
File name: moodlet-scandal.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Scandal" — Your name is in the papers for the wrong reasons..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/hospitalized

```text
Asset ID: moodlet/hospitalized
File name: moodlet-hospitalized.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Hospitalised" — You neglected yourself and ended up in hospital..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/band_split

```text
Asset ID: moodlet/band_split
File name: moodlet-band_split.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Split" — You parted ways with a band..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/fling

```text
Asset ID: moodlet/fling
File name: moodlet-fling.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "A night to remember" — Last night was unexpectedly lovely..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/regret

```text
Asset ID: moodlet/regret
File name: moodlet-regret.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Regret" — You need to think about last night a little..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/cheated

```text
Asset ID: moodlet/cheated
File name: moodlet-cheated.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Cheated on" — Someone you trusted let you down..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/family_evening

```text
Asset ID: moodlet/family_evening
File name: moodlet-family_evening.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Family evening" — You had a lovely evening at home..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/sleepless

```text
Asset ID: moodlet/sleepless
File name: moodlet-sleepless.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Sleepless night" — The baby was up all night..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/expecting

```text
Asset ID: moodlet/expecting
File name: moodlet-expecting.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Expecting" — Your family is growing..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/new_parent

```text
Asset ID: moodlet/new_parent
File name: moodlet-new_parent.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "New parent" — You're holding a brand-new life..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/family_strain

```text
Asset ID: moodlet/family_strain
File name: moodlet-family_strain.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Family strain" — You couldn’t cover your child’s care this week..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/exhausted

```text
Asset ID: moodlet/exhausted
File name: moodlet-exhausted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Exhausted" — You are running on empty. Rest or eat something..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/tired

```text
Asset ID: moodlet/tired
File name: moodlet-tired.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Tired" — Your energy is low..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/inspired

```text
Asset ID: moodlet/inspired
File name: moodlet-inspired.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Inspired" — Melodies keep coming to you..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/sick

```text
Asset ID: moodlet/sick
File name: moodlet-sick.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Unwell" — Your health is poor..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/jailed

```text
Asset ID: moodlet/jailed
File name: moodlet-jailed.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Behind bars" — You are in prison..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/craving

```text
Asset ID: moodlet/craving
File name: moodlet-craving.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Craving" — You are hooked and haven’t had your fix. Treatment at the hospital helps..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### moodlet/aging

```text
Asset ID: moodlet/aging
File name: moodlet-aging.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 128×128 PNG)
Subject: a simple icon for the mood "Getting on" — The years are catching up with you..
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Simple glossy app-style icon, one bold symbol or small expressive object, centred, readable at 24 px, same style as the other icons.
Background: Fully transparent background: PNG with a real alpha channel, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

## B10 — Tattoos and record covers

### tattoo/note

```text
Asset ID: tattoo/note
File name: tattoo-note.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a tattoo design: Little music note.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Tattoo flash artwork: clean bold linework with limited colour, centred, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no skin, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### tattoo/star

```text
Asset ID: tattoo/star
File name: tattoo-star.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a tattoo design: Star.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Tattoo flash artwork: clean bold linework with limited colour, centred, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no skin, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### tattoo/rose

```text
Asset ID: tattoo/rose
File name: tattoo-rose.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a tattoo design: Rose.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Tattoo flash artwork: clean bold linework with limited colour, centred, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no skin, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### tattoo/mic

```text
Asset ID: tattoo/mic
File name: tattoo-mic.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a tattoo design: Vintage microphone.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Tattoo flash artwork: clean bold linework with limited colour, centred, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no skin, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### tattoo/skull

```text
Asset ID: tattoo/skull
File name: tattoo-skull.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a tattoo design: Skull.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Tattoo flash artwork: clean bold linework with limited colour, centred, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no skin, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### tattoo/guitar

```text
Asset ID: tattoo/guitar
File name: tattoo-guitar.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a tattoo design: Flaming guitar.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Tattoo flash artwork: clean bold linework with limited colour, centred, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no skin, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### tattoo/koi

```text
Asset ID: tattoo/koi
File name: tattoo-koi.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a tattoo design: Koi sleeve.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Tattoo flash artwork: clean bold linework with limited colour, centred, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no skin, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### tattoo/dragon

```text
Asset ID: tattoo/dragon
File name: tattoo-dragon.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a tattoo design: Dragon back piece.
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Tattoo flash artwork: clean bold linework with limited colour, centred, about 10% padding.
Background: Fully transparent background: PNG with a real alpha channel, no skin, no checkerboard.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/pop.1

```text
Asset ID: cover/pop.1
File name: cover-pop.1.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Pop music (variation 1).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/pop.2

```text
Asset ID: cover/pop.2
File name: cover-pop.2.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Pop music (variation 2).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/rock.1

```text
Asset ID: cover/rock.1
File name: cover-rock.1.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Rock music (variation 1).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/rock.2

```text
Asset ID: cover/rock.2
File name: cover-rock.2.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Rock music (variation 2).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/hiphop.1

```text
Asset ID: cover/hiphop.1
File name: cover-hiphop.1.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Hip-hop music (variation 1).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/hiphop.2

```text
Asset ID: cover/hiphop.2
File name: cover-hiphop.2.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Hip-hop music (variation 2).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/electronic.1

```text
Asset ID: cover/electronic.1
File name: cover-electronic.1.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Electronic music (variation 1).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/electronic.2

```text
Asset ID: cover/electronic.2
File name: cover-electronic.2.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Electronic music (variation 2).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/metal.1

```text
Asset ID: cover/metal.1
File name: cover-metal.1.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Metal music (variation 1).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/metal.2

```text
Asset ID: cover/metal.2
File name: cover-metal.2.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Metal music (variation 2).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/jazz.1

```text
Asset ID: cover/jazz.1
File name: cover-jazz.1.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Jazz music (variation 1).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/jazz.2

```text
Asset ID: cover/jazz.2
File name: cover-jazz.2.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Jazz music (variation 2).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/anatolian.1

```text
Asset ID: cover/anatolian.1
File name: cover-anatolian.1.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Anatolian rock music (variation 1).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/anatolian.2

```text
Asset ID: cover/anatolian.2
File name: cover-anatolian.2.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Anatolian rock music (variation 2).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/blues.1

```text
Asset ID: cover/blues.1
File name: cover-blues.1.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Blues music (variation 1).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/blues.2

```text
Asset ID: cover/blues.2
File name: cover-blues.2.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Blues music (variation 2).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/folk.1

```text
Asset ID: cover/folk.1
File name: cover-folk.1.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Folk music (variation 1).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/folk.2

```text
Asset ID: cover/folk.2
File name: cover-folk.2.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Folk music (variation 2).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/punk.1

```text
Asset ID: cover/punk.1
File name: cover-punk.1.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Punk music (variation 1).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/punk.2

```text
Asset ID: cover/punk.2
File name: cover-punk.2.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Punk music (variation 2).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/soul.1

```text
Asset ID: cover/soul.1
File name: cover-soul.1.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Soul music (variation 1).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/soul.2

```text
Asset ID: cover/soul.2
File name: cover-soul.2.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Soul music (variation 2).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/reggae.1

```text
Asset ID: cover/reggae.1
File name: cover-reggae.1.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Reggae music (variation 1).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/reggae.2

```text
Asset ID: cover/reggae.2
File name: cover-reggae.2.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Reggae music (variation 2).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/country.1

```text
Asset ID: cover/country.1
File name: cover-country.1.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Country music (variation 1).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/country.2

```text
Asset ID: cover/country.2
File name: cover-country.2.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Country music (variation 2).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/classical.1

```text
Asset ID: cover/classical.1
File name: cover-classical.1.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Classical music (variation 1).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### cover/classical.2

```text
Asset ID: cover/classical.2
File name: cover-classical.2.png
Size and format: 1024×1024 square, PNG (the game resizes it to 1024×1024 JPG)
Subject: an album cover artwork evoking Classical music (variation 2).
Style: Rifftown Visual Language v1: painted, stylized semi-realistic game illustration with a polished, contemporary mobile-game finish (not a photograph and not a 3D product render); premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image; do not copy recognisable real product designs (guitar headstock shapes, car badges, fashion logos) or real people.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```
