# Rifftown görsel üretim istekleri (ChatGPT)

Bu dosya `npm run art:manifest` / `npm run art:sync` ile üretilir; yalnızca henüz geçerli dosyası olmayan varlıkları listeler. Tanımlar `scripts/art/catalog.ts` içinde.

## Akış

1. ChatGPT'de her parti için yeni bir sohbet aç. Stil panosunu ekle ve aşağıdaki **açılış mesajını** gönder.
2. Partideki her isteği sırayla, **tek tek** gönder. Boyanabilen eşyalarda resim gelince hemen ardından maskesinin isteğini aynı sohbette gönder.
3. Her resmi istekteki **File name** adıyla indir ve projedeki `art-incoming/` klasörüne koy.
4. `npm run art:sync` çalıştır: dosyalar boyutlandırılır, doğrulanır, uygulamaya eklenir ve `docs/art/gallery.html` güncellenir. Hatalı olanlar `docs/art/VALIDATION_REPORT.md` içinde nedeniyle listelenir; onları yeniden üret.

## Açılış mesajı (her sohbetin başında bir kez)

```text
We are producing artwork for Rifftown, a music career and life simulation game. Follow "Rifftown Visual Language v1" for every image in this conversation:

- Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
- Individual objects: three-quarter view from slightly above, centred, ~10% padding, transparent background, the same camera and lighting for every object.
- Tiers are shown through design and materials: Basic (entry-level), Stage (solid professional), Professional (premium craftsmanship), Iconic (legendary collectible), Crafted (handmade one-off).
- Repaintable surfaces are rendered in neutral light grey (#DADADA) with full shading; a separate white-on-transparent mask marks them.
- The attached style board is the primary reference. Match its finish, detail density and lighting.

Generate exactly one image per message, at the size I ask for. Do not add text, labels or logos. Reply "Ready" and wait for the first request.
```

## B0 — Proof of concept (style check)

### city/istanbul

```text
Asset ID: city/istanbul
File name: istanbul.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: Istanbul across the Bosphorus: Galata Tower, mosque domes and slender minarets on the skyline, ferries on the water, hillside houses.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/bar

```text
Asset ID: place/bar
File name: place-bar.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a small basement live-music bar seen from the audience, low stage with a drum kit and amplifiers against an exposed brick wall, bar counter with stools.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/guitar_1

```text
Asset ID: item/guitar_1
File name: guitar_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a cheap beginner electric guitar, simple double-cut body, basic hardware.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/guitar_1.mask
File name: guitar_1.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/guitar_1: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/keys_3

```text
Asset ID: item/keys_3
File name: keys_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a large professional 88-key workstation keyboard with many controls and a colour screen.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the keyboard casing (not the keys, knobs, screen or wooden side panels). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/keys_3.mask
File name: keys_3.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/keys_3: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the keyboard casing (not the keys, knobs, screen or wooden side panels) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/guitar_4

```text
Asset ID: item/guitar_4
File name: guitar_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a legendary 1959-style vintage single-cut electric guitar, worn relic finish, aged hardware.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/guitar_4.mask
File name: guitar_4.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/guitar_4: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/outfit_2

```text
Asset ID: item/outfit_2
File name: outfit_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a rock leather biker jacket with zips and studs on a hanger.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/outfit_2.mask
File name: outfit_2.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/outfit_2: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/car_2

```text
Asset ID: item/car_2
File name: car_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a practical modern family saloon car, side view.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/car_2.mask
File name: car_2.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/car_2: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/kanun_3 (görsel dil denemesi)

```text
Asset ID: item/kanun_3
File name: kanun_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a professional Turkish kanun (qanun) zither, trapezoid wooden body with inlay, many strings, small metal levers.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Note: visual-language test asset (not in the game yet); it must look like part of the same instrument set.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### item/trombone_2 (görsel dil denemesi)

```text
Asset ID: item/trombone_2
File name: trombone_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a brass tenor trombone with its slide, polished lacquer.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Note: visual-language test asset (not in the game yet); it must look like part of the same instrument set.
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/01

```text
Asset ID: avatar/01
File name: avatar-01.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young woman rock guitarist in her twenties, short dyed pink bob, black leather jacket, small nose ring.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### avatar/02

```text
Asset ID: avatar/02
File name: avatar-02.png
Size and format: 1024×1024 square, PNG (the game resizes it to 512×512 WEBP)
Subject: a young man punk drummer with a green mohawk, sleeveless denim vest, freckles.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Head-and-shoulders portrait of a fictional musician facing the camera, friendly confident expression; the face is large and centred inside the middle 70% of the frame because the image is cropped to a circle and shown as small as 32 px. Plain Midnight Indigo #1A0E4B background with a very soft gradient.
Background: Solid Midnight Indigo background (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

## B1 — Cities

### city/ankara

```text
Asset ID: city/ankara
File name: ankara.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: Ankara: the slim Atakule tower with its saucer top, modern apartment blocks, a wide boulevard with traffic, distant hills.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### city/izmir

```text
Asset ID: city/izmir
File name: izmir.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: Izmir's seafront: the ornate Konak Clock Tower, palm trees along the Kordon promenade, the bay.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### city/berlin

```text
Asset ID: city/berlin
File name: berlin.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: Berlin: the Fernsehturm TV tower with its sphere, the river Spree, old apartment buildings, a railway bridge with a train.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### city/hamburg

```text
Asset ID: city/hamburg
File name: hamburg.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: Hamburg harbour: the Elbphilharmonie with its wavy glass roof on a brick warehouse base, harbour cranes, ships on the Elbe.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### city/munich

```text
Asset ID: city/munich
File name: munich.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: Munich: the twin onion-domed towers of the Frauenkirche, old town rooftops, the Alps faint on the horizon.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### city/london

```text
Asset ID: city/london
File name: london.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: London: Big Ben and the Houses of Parliament, the river Thames with a bridge, a red double-decker bus.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### city/manchester

```text
Asset ID: city/manchester
File name: manchester.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: Manchester: red-brick warehouses and canals, the tall slim Beetham Tower, old mill chimneys.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### city/liverpool

```text
Asset ID: city/liverpool
File name: liverpool.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: Liverpool waterfront: the Royal Liver Building with its two clock towers, the river Mersey, the docks.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### city/paris

```text
Asset ID: city/paris
File name: paris.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: Paris: the Eiffel Tower, Haussmann rooftops with chimneys, the Seine with an arched stone bridge.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### city/lyon

```text
Asset ID: city/lyon
File name: lyon.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: Lyon: the Fourviere Basilica on its hill, the old town along the Saone river with colourful facades.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### city/marseille

```text
Asset ID: city/marseille
File name: marseille.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: Marseille: the Notre-Dame de la Garde basilica on its hilltop, the Old Port full of sailing boats.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### city/newyork

```text
Asset ID: city/newyork
File name: newyork.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: Manhattan skyline: the Empire State Building, dense skyscrapers, yellow taxis on an avenue.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### city/losangeles

```text
Asset ID: city/losangeles
File name: losangeles.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: Los Angeles: tall palm trees, the downtown skyline, the hills behind, a freeway with light trails.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### city/nashville

```text
Asset ID: city/nashville
File name: nashville.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: Downtown Nashville: Broadway honky-tonk bars with neon in the foreground, the twin-spired AT&T Building, the Cumberland river.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Wide establishing view at early evening blue hour (every city uses this same time of day), main landmark in the horizontal centre. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Keep the lower-left corner calm and darker (the player avatar overlaps it).
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

## B2 — Places and venues

### place/club

```text
Asset ID: place/club
File name: place-club.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a mid-sized music club seen from the dance floor, stage with coloured spotlights and haze, balcony rail.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/hall

```text
Asset ID: place/hall
File name: place-hall.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a grand concert hall seen from the stalls, big stage framed by heavy velvet curtains, balconies, rows of seats.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/stadium

```text
Asset ID: place/stadium
File name: place-stadium.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: a huge open-air stadium concert seen from the stands, massive stage with giant screens and lighting towers.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/festival

```text
Asset ID: place/festival
File name: place-festival.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: a summer open-air music festival at golden hour, big stage with lighting truss, colourful tents and flags on the grass.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/school

```text
Asset ID: place/school
File name: place-school.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a music school classroom, an upright piano, guitars on stands, music stands, a chalkboard with drawn staves.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/studio

```text
Asset ID: place/studio
File name: place-studio.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a small band rehearsal room, guitar amps, a drum kit, cables on the floor, acoustic foam on the walls.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/work

```text
Asset ID: place/work
File name: place-work.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: a small neighbourhood cafe counter, coffee machine, pastry display, an apron on a hook.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/hospital

```text
Asset ID: place/hospital
File name: place-hospital.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: exterior of a modern city hospital, emergency entrance with an ambulance.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/music_store

```text
Asset ID: place/music_store
File name: place-music_store.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a music instrument shop, a wall of guitars hanging in rows, keyboards and a drum kit on the floor, amps.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/boutique

```text
Asset ID: place/boutique
File name: place-boutique.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a stage-fashion boutique, racks of leather jackets and stage costumes, a full-length mirror, mannequins.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/gallery

```text
Asset ID: place/gallery
File name: place-gallery.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a modern art gallery, framed paintings on white walls under spotlights, a bench.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/bookstore

```text
Asset ID: place/bookstore
File name: place-bookstore.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a cosy independent bookshop, tall wooden shelves, a reading armchair, a table of music books.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/city_hall

```text
Asset ID: place/city_hall
File name: place-city_hall.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: exterior of a grand city hall with a clock tower and a flag, a square in front.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/police

```text
Asset ID: place/police
File name: place-police.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: exterior of a city police station, a police car parked in front.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/courthouse

```text
Asset ID: place/courthouse
File name: place-courthouse.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a courtroom, judge bench, witness stand, wooden benches.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/plaza

```text
Asset ID: place/plaza
File name: place-plaza.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: a modern glass office tower and its lobby, revolving door, escalators.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/newspaper

```text
Asset ID: place/newspaper
File name: place-newspaper.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a busy newsroom, desks with computers, stacks of newspapers, a printing press behind glass.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/worship

```text
Asset ID: place/worship
File name: place-worship.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: exterior of a calm non-denominational place of worship, a simple dome, trees, no religious symbols.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/university

```text
Asset ID: place/university
File name: place-university.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: exterior of a classic university building with columns and wide steps, lamp posts, trees.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/park

```text
Asset ID: place/park
File name: place-park.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: a city park, trees, a bench under a lamp post, a small pond, a busker with a guitar in the distance.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/recording_studio

```text
Asset ID: place/recording_studio
File name: place-recording_studio.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a recording studio control room, large mixing desk, monitor speakers, a vocal booth behind glass.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/prison

```text
Asset ID: place/prison
File name: place-prison.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: exterior of a prison, high walls with barbed wire, a watchtower with a searchlight.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/real_estate

```text
Asset ID: place/real_estate
File name: place-real_estate.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: a real estate agency storefront, window display of house photos, a desk inside.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/car_dealer

```text
Asset ID: place/car_dealer
File name: place-car_dealer.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: a car showroom, a few shiny cars and a motorbike on a polished floor behind large glass windows.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/pet_shop

```text
Asset ID: place/pet_shop
File name: place-pet_shop.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a friendly pet shop, a cat on a scratching post, a puppy, a parrot on a perch, shelves of pet food.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/hardware

```text
Asset ID: place/hardware
File name: place-hardware.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a hardware store and workshop, workbench with tools, pegboard wall, shelves of spray paint cans, wood planks.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/stage_shop

```text
Asset ID: place/stage_shop
File name: place-stage_shop.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a stage equipment shop, fog machines, moving-head lights, confetti cannons on display.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/flea_market

```text
Asset ID: place/flea_market
File name: place-flea_market.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: a covered flea market, stalls with second-hand guitars, vinyl records, old clothes and lamps, string lights.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/tattoo

```text
Asset ID: place/tattoo
File name: place-tattoo.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a tattoo studio, a tattoo chair, flash drawings pinned on the wall, ink bottles, a desk lamp.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/gym

```text
Asset ID: place/gym
File name: place-gym.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a gym, dumbbell racks, a bench press, treadmills by large windows.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/restaurant

```text
Asset ID: place/restaurant
File name: place-restaurant.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: inside a lively restaurant, tables with candles and plates of food, an open kitchen in the background.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/hotel

```text
Asset ID: place/hotel
File name: place-hotel.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: a boutique hotel lobby, reception desk with a bell, armchairs, a staircase, chandelier light.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Eye-level wide shot, evening/night lighting, subject centred. Keep everything important inside the middle two-thirds vertically: the image is cropped to a wide 16:7 strip. Generic location, not tied to any real city, brand or business.
Background: Full-bleed scene (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

### place/bank

```text
Asset ID: place/bank
File name: place-bank.png
Size and format: 1536×1024 landscape, PNG (the game resizes it to 1600×700 WEBP)
Subject: exterior of a stately bank building with stone columns and a heavy door.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the microphone handle/body (not the grille). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/vocals_1.mask
File name: vocals_1.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/vocals_1: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the microphone handle/body (not the grille) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/vocals_2

```text
Asset ID: item/vocals_2
File name: vocals_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a sturdy professional stage vocal microphone with a polished grille.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the microphone handle/body (not the grille). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/vocals_2.mask
File name: vocals_2.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/vocals_2: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the microphone handle/body (not the grille) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/vocals_3

```text
Asset ID: item/vocals_3
File name: vocals_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a sleek premium wireless studio-grade handheld microphone with a small status light.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the microphone handle/body (not the grille). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/vocals_3.mask
File name: vocals_3.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/vocals_3: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the microphone handle/body (not the grille) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/guitar_2

```text
Asset ID: item/guitar_2
File name: guitar_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a solid mid-range stage electric guitar with two pickups and a pickguard.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/guitar_2.mask
File name: guitar_2.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/guitar_2: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/guitar_3

```text
Asset ID: item/guitar_3
File name: guitar_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a luthier-made master electric guitar, figured maple neck, gold hardware, elegant body.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/guitar_3.mask
File name: guitar_3.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/guitar_3: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/bass_1

```text
Asset ID: item/bass_1
File name: bass_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a cheap beginner four-string electric bass guitar, simple body.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/bass_1.mask
File name: bass_1.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/bass_1: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/bass_2

```text
Asset ID: item/bass_2
File name: bass_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a solid stage four-string electric bass with a pickguard and two pickups.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/bass_2.mask
File name: bass_2.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/bass_2: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/bass_3

```text
Asset ID: item/bass_3
File name: bass_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a luthier-made master five-string bass, figured wood neck, gold hardware.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/bass_3.mask
File name: bass_3.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/bass_3: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/drums_1

```text
Asset ID: item/drums_1
File name: drums_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a small beginner drum kit: bass drum, snare, one tom and one cymbal.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/drums_1.mask
File name: drums_1.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/drums_1: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/drums_2

```text
Asset ID: item/drums_2
File name: drums_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a complete stage drum kit: bass drum, snare, two toms, floor tom, hi-hat and two cymbals.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/drums_2.mask
File name: drums_2.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/drums_2: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/drums_3

```text
Asset ID: item/drums_3
File name: drums_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a large professional drum kit with many toms and gleaming cymbals on chrome stands.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/drums_3.mask
File name: drums_3.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/drums_3: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/keys_1

```text
Asset ID: item/keys_1
File name: keys_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a small beginner portable keyboard with a few buttons.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the keyboard casing (not the keys, knobs, screen or wooden side panels). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/keys_1.mask
File name: keys_1.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/keys_1: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the keyboard casing (not the keys, knobs, screen or wooden side panels) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/keys_2

```text
Asset ID: item/keys_2
File name: keys_2.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a stage synthesizer with knobs, a small screen and pitch wheels.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the keyboard casing (not the keys, knobs, screen or wooden side panels). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/keys_2.mask
File name: keys_2.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/keys_2: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the keyboard casing (not the keys, knobs, screen or wooden side panels) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/vocals_4

```text
Asset ID: item/vocals_4
File name: vocals_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a legendary vintage large-diaphragm studio condenser microphone in a shock mount with chrome details.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the microphone handle/body (not the grille). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/vocals_4.mask
File name: vocals_4.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/vocals_4: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the microphone handle/body (not the grille) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/bass_4

```text
Asset ID: item/bass_4
File name: bass_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a legendary 1962-style vintage electric bass, worn relic finish, aged chrome covers.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/bass_4.mask
File name: bass_4.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/bass_4: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/drums_4

```text
Asset ID: item/drums_4
File name: drums_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a legendary drummer's old vintage drum kit, worn heads with stick marks, aged brass cymbals.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/drums_4.mask
File name: drums_4.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/drums_4: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/keys_4

```text
Asset ID: item/keys_4
File name: keys_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a legendary vintage analog synthesizer with wooden side panels, rows of knobs and patch cables.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the keyboard casing (not the keys, knobs, screen or wooden side panels). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/keys_4.mask
File name: keys_4.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/keys_4: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the keyboard casing (not the keys, knobs, screen or wooden side panels) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/vocals_crafted

```text
Asset ID: item/vocals_crafted
File name: vocals_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a handmade microphone built in a workshop, visible screws, hand-turned wooden handle.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the microphone handle/body (not the grille). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/vocals_crafted.mask
File name: vocals_crafted.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/vocals_crafted: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the microphone handle/body (not the grille) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/guitar_crafted

```text
Asset ID: item/guitar_crafted
File name: guitar_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a handmade workshop electric guitar, unusual hand-shaped body, hand-wound pickups, visible wood grain on the neck.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/guitar_crafted.mask
File name: guitar_crafted.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/guitar_crafted: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/bass_crafted

```text
Asset ID: item/bass_crafted
File name: bass_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a handmade workshop bass guitar, chunky neck, visible wood grain, home-built look.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/bass_crafted.mask
File name: bass_crafted.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/bass_crafted: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/drums_crafted

```text
Asset ID: item/drums_crafted
File name: drums_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a handmade workshop drum kit, hand-tightened lugs, mismatched vintage cymbals.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/drums_crafted.mask
File name: drums_crafted.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/drums_crafted: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/keys_crafted

```text
Asset ID: item/keys_crafted
File name: keys_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a handmade workshop synthesizer in a wooden box, mismatched knobs, exposed circuit details.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the keyboard casing (not the keys, knobs, screen or wooden side panels). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/keys_crafted.mask
File name: keys_crafted.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/keys_crafted: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the keyboard casing (not the keys, knobs, screen or wooden side panels) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

## B4 — Outfits, vehicles, spray paint and paint masks

### item/outfit_1

```text
Asset ID: item/outfit_1
File name: outfit_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a plain t-shirt with jeans laid together.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/outfit_1.mask
File name: outfit_1.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/outfit_1: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/outfit_3

```text
Asset ID: item/outfit_3
File name: outfit_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a designer stage jacket with sequins and sharp shoulders on a hanger.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/outfit_3.mask
File name: outfit_3.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/outfit_3: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/outfit_4

```text
Asset ID: item/outfit_4
File name: outfit_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a spectacular celebrity-designer stage coat with embroidery and crystals on a mannequin.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/outfit_4.mask
File name: outfit_4.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/outfit_4: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/car_1

```text
Asset ID: item/car_1
File name: car_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: an old small hatchback car, a little dented, side view.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/car_1.mask
File name: car_1.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/car_1: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/moto_1

```text
Asset ID: item/moto_1
File name: moto_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a classic naked motorcycle, side view.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/moto_1.mask
File name: moto_1.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/moto_1: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/van_1

```text
Asset ID: item/van_1
File name: van_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a band tour minibus van with instrument cases on the roof rack, side view.
Tier: Tier 2 Stage: solid professional workhorse, better materials and finish, reliable hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/van_1.mask
File name: van_1.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/van_1: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/car_3

```text
Asset ID: item/car_3
File name: car_3.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a sleek modern sports coupe, low and sharp, side view.
Tier: Tier 3 Professional: high-end craftsmanship, premium materials (figured wood, polished metal), refined details. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/car_3.mask
File name: car_3.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/car_3: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/car_4

```text
Asset ID: item/car_4
File name: car_4.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a classic 1960s-style convertible with chrome details, top down, side view.
Tier: Tier 4 Iconic/Legendary: a legendary collectible with history, aged or exceptional materials, unmistakably special. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/car_4.mask
File name: car_4.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/car_4: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/outfit_crafted

```text
Asset ID: item/outfit_crafted
File name: outfit_crafted.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a handmade patchwork stage jacket with hand-sewn patches and safety pins on a hanger.
Tier: Crafted: custom handmade one-off, visible handwork (hand-cut shapes, screws, stitches, wood grain), charming and personal. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/outfit_crafted.mask
File name: outfit_crafted.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/outfit_crafted: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

### item/spray

```text
Asset ID: item/spray
File name: spray.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a single spray paint can with its cap.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Single object, three-quarter view from slightly above, centred, the object fills about 80% of the frame with roughly 10% empty padding on every side, no floor, no cast shadow, nothing else in the frame. Use the same camera height and angle as the other items in this set.
Background: Fully transparent background: PNG with a real alpha channel. Do not draw a checkerboard, floor, shadow or backdrop.
Paintable surface: players can repaint the can body label area and the cap (not the metal top and nozzle). Render that surface in a neutral light grey (#DADADA) with full natural shading, reflections and highlights and no colour tint; every other part keeps its natural material (wood, chrome, plastic, glass, rubber).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```

Ardından aynı sohbette maske:

```text
Asset ID: item/spray.mask
File name: spray.mask.png
Using the image you just generated, create its paint mask.
- Same size (1024×1024) and the exact same position of every pixel as item/spray: the mask must line up perfectly when placed on top.
- Pure opaque white (#FFFFFF) exactly where the can body label area and the cap (not the metal top and nozzle) is.
- Everything else fully transparent: metal, strings, glass, wood, rubber, lights and the background.
- No shading, no grey, no outline, no anti-aliased glow; hard clean edges.
- PNG with a real alpha channel.
```

## B5 — Art, rings, pets, stage effects, materials

### item/art_1

```text
Asset ID: item/art_1
File name: art_1.png
Size and format: 1024×1024 square, PNG with transparent background (the game resizes it to 512×512 PNG)
Subject: a framed screen-printed gig poster with abstract guitar and star shapes, no words.
Tier: Tier 1 Basic: affordable entry-level build, simple shapes, plain materials, modest hardware. Show the tier through design, materials and craftsmanship, not through a coloured frame.
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
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
Style: Rifftown Visual Language v1: modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish; premium but playful, never photorealistic and never cartoonish; clean silhouettes that stay readable at small sizes; consistent soft key light from the upper left with a subtle cool rim light; natural material and object colours, with the brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) used only as small light accents; absolutely no text, letters, numbers, logos, brand names, trademarks or watermarks anywhere in the image.
Camera and composition: Square album cover artwork, bold central motif, leaves room for the game to print the band name and title later.
Background: Full-bleed artwork (no transparency).
Consistency: it must look like it belongs to the same set as the approved Rifftown style board and the assets already approved in this conversation.
```
