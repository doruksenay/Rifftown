# B0: ilk deneme partisi (ChatGPT'ye tek parça)

ChatGPT'de yeni bir sohbet aç, onaylı stil panosunu ekle ve aşağıdaki metnin tamamını gönder. ChatGPT sırayla bir görsel üretecek; her görselden sonra "next" yaz. Her dosyayı belirtilen adla indirip `art-incoming/` klasörüne koy, bitince `npm run art:sync` çalıştır.

```text
We are producing the first test batch of artwork for Rifftown, a music career and life simulation game. Follow "Rifftown Visual Language v1" for every image. The attached style board is the primary reference: match its finish, lighting and detail density.

RIFFTOWN VISUAL LANGUAGE v1
- Modern stylized semi-realistic game illustration with a polished, contemporary mobile-game finish. Premium but playful; never photorealistic, never cartoonish.
- Clean silhouettes that stay readable at small sizes. Consistent detail density across the set.
- Soft key light from the upper left, subtle cool rim light. Same lighting in every image.
- Natural material and object colours (wood, chrome, leather, glass). Brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) only as small light accents. Midnight Indigo #1A0E4B for dark backgrounds.
- ABSOLUTELY NO text, letters, numbers, logos, brand names, number plates or watermarks. Do not copy any real product design or real person.
- Objects: three-quarter view from slightly above (vehicles: side view), centred, about 10% empty padding on every side, real transparent background (PNG alpha, never a drawn checkerboard), no floor, no shadow.
- Tiers are shown through design and materials, never a coloured frame: Basic = entry-level and plain; Stage = solid professional; Professional = premium craftsmanship; Iconic = legendary collectible with history.
- Repaintable surfaces are drawn in neutral light grey #DADADA with full shading and highlights, no colour tint. Right after such an item I will ask for its paint mask: same size, the exact same pixel positions, pure opaque white on the repaintable surface only, everything else fully transparent, hard clean edges.

Generate exactly ONE image per message, in this order, and wait for me to say "next" before the following one.

1. istanbul.png — 1536x1024 landscape. Istanbul at early-evening blue hour seen across the Bosphorus: Galata Tower in the horizontal centre, mosque domes and slender minarets on the skyline, ferries with lit windows, hillside houses. Everything important inside the middle two-thirds vertically (it is cropped to a 16:7 strip). Calm, darker lower-left corner. Full-bleed scene.
2. bar.png — 1536x1024 landscape. Inside a small basement live-music bar seen from the audience at night: low stage with a drum kit and amplifiers against an exposed brick wall, a bar counter with stools, a few people. Neon signs only as abstract shapes, no letters. Middle two-thirds rule as above. Full-bleed scene.
3. guitar_1.png — 1024x1024, transparent PNG. Tier Basic: a cheap beginner electric guitar, simple double-cut body, basic hardware. Repaintable surface: the body top and sides (not neck, fretboard, pickguard, pickups, hardware, strings) in #DADADA.
4. guitar_1.mask.png — paint mask for image 3: white exactly on the guitar body top and sides.
5. guitar_4.png — 1024x1024, transparent PNG. Tier Iconic: a legendary 1959-style vintage single-cut electric guitar, worn relic finish, aged hardware. Repaintable surface: the body top and sides in #DADADA.
6. guitar_4.mask.png — paint mask for image 5: white exactly on the guitar body top and sides.
7. keys_3.png — 1024x1024, transparent PNG. Tier Professional: a large 88-key workstation keyboard with many controls and a colour screen (the screen shows only abstract shapes). Repaintable surface: the casing (not keys, knobs, screen) in #DADADA.
8. keys_3.mask.png — paint mask for image 7: white exactly on the keyboard casing.
9. outfit_2.png — 1024x1024, transparent PNG, front view. Tier Stage: a rock leather biker jacket with zips and studs on a hanger. Repaintable surface: the leather (not zips, studs, hanger) in #DADADA.
10. outfit_2.mask.png — paint mask for image 9: white exactly on the leather.
11. car_2.png — 1024x1024, transparent PNG, side view. Tier Stage: a practical modern family saloon car, no badges, no number plate text. Repaintable surface: the body paint (not glass, tyres, wheels, chrome, lights) in #DADADA.
12. car_2.mask.png — paint mask for image 11: white exactly on the car body paint.
13. kanun_3.png — 1024x1024, transparent PNG. Visual test, Tier Professional: a Turkish kanun (qanun) zither, trapezoid wooden body with inlay, many strings, small metal levers. Natural wood, no grey surface, no mask.
14. trombone_2.png — 1024x1024, transparent PNG. Visual test, Tier Stage: a brass tenor trombone with its slide, polished lacquer. Natural brass, no mask.
15. avatar-01.png — 1024x1024. Head-and-shoulders portrait of a fictional young woman rock guitarist in her twenties, short dyed pink bob, black leather jacket, small nose ring, friendly confident expression. Face large and centred in the middle 70% (cropped to a circle, shown as small as 32 px). Plain Midnight Indigo #1A0E4B background with a very soft gradient.
16. avatar-02.png — 1024x1024. Same portrait rules: a fictional young man punk drummer with a green mohawk, sleeveless denim vest, freckles.

Start with image 1.
```

Daha ayrıntılı, tek tek istekler: `IMAGE_GENERATION_REQUESTS.md`, B0 bölümü.
