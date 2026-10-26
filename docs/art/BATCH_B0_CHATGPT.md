# B0: ilk deneme partisi

## Sonuç (ilk teslim, 26 Ekim)

| Dosya | Durum | Not |
| --- | --- | --- |
| `city/istanbul` | Oyunda | Galata, camiler, vapurlar; kırpma iyi |
| `place/bar` | Oyunda | Amfilerde küçük logo benzeri yazılar var; ileride temizlenmeli |
| `item/guitar_4` | Oyunda | Maske otomatik çıkarıldı. Sap ucu tanınan bir markanın tescilli biçiminde; mağazadan önce özgün sap ucuyla yeniden üretilmeli |
| `item/keys_3` | Oyunda | Maske otomatik (gövde boyanıyor, tuşlar boyanmıyor) |
| `item/car_2` | Oyunda | Maske otomatik. Fotoğraf gibi; stil panosuna göre fazla gerçekçi |
| `item/kanun_3`, `item/trombone_2` | Oyunda (görsel deneme) | Trombonun kenar kırıntıları temizlendi |
| `avatar/01` | Oyunda | İkinci denemede baş-omuz portresi olarak yeniden üretildi |
| `item/guitar_1` | Oyunda (ikinci deneme) | Özgün sap ucu, gerçek şeffaflık; maske otomatik |
| `item/guitar_1.mask` | Otomatik | ChatGPT maskesi hizasızdı; artık `art:automask` ile çıkarılıyor |
| `item/outfit_2` | Oyunda (ikinci deneme) | Deri açık gri; maske otomatik |
| `avatar/02` | Oyunda (ikinci deneme) | Düz Midnight Indigo arka plan |

Genel gözlem: eşyalar 3B ürün fotoğrafı gibi, avatarlar resimsi. Set tek elden çıkmış gibi durmuyor. Eşyalarda stil panosundaki "stilize, hafif idealize" görünüşe yaklaşmak için isteğe "painted game illustration, not a photo or 3D product render" vurgusu eklendi.

## Yeniden üretilecekler (ChatGPT'ye tek parça)

Yeni sohbet aç, stil panosunu ve onaylanan `city/istanbul` ile `item/guitar_4` resimlerini ekle, sonra gönder:

```text
We are producing artwork for Rifftown, a music career and life simulation game. Follow "Rifftown Visual Language v1". The attached style board and the two attached approved images are the reference for finish, lighting and detail.

RIFFTOWN VISUAL LANGUAGE v1
- Painted, stylized semi-realistic game illustration with a polished mobile-game finish — NOT a photograph and NOT a 3D product render. Premium but playful, slightly idealized shapes, clean silhouettes readable at small sizes.
- Soft key light from the upper left, subtle cool rim light. Natural material colours; brand neons (cyan #00E5FF, hot pink #FF2EB6, electric purple #8A2BFF) only as small light accents.
- ABSOLUTELY NO text, letters, numbers, logos or brand names. Do not copy any real product design (no recognisable guitar headstock shapes, car badges or fashion logos) and no real person.
- Objects: three-quarter view from slightly above, centred, ~10% padding, REAL transparent background (PNG alpha channel). Never draw a checkerboard pattern — the background must be actually empty.
- Repaintable surfaces are drawn in neutral light grey #DADADA with full shading and highlights; every other part keeps its natural material and colour, clearly different from that grey.

Generate exactly ONE image per message, in this order, and wait for me to say "next".

1. guitar_1.png — 1024x1024, transparent PNG. Tier Basic: a cheap beginner electric guitar with an original simple double-cut body and an original headstock shape, basic hardware, dark rosewood fretboard, black pickguard. The guitar body top and sides are light grey #DADADA.
2. outfit_2.png — 1024x1024, transparent PNG, front view. Tier Stage: a rock biker jacket on a hanger. The leather is light grey #DADADA with realistic leather shading; zips, studs and buckle are silver metal, the hanger is dark wood.
3. avatar-01.png — 1024x1024. Head-and-shoulders portrait (no hands, no instrument) of a fictional young woman rock guitarist in her twenties, short dyed pink bob, black leather jacket, small nose ring, friendly confident expression, facing the camera. Face large and centred in the middle 70%. Plain solid Midnight Indigo #1A0E4B background with a very soft gradient.
4. avatar-02.png — 1024x1024. Same portrait rules: a fictional young man punk drummer with a green mohawk, sleeveless studded denim vest, freckles. Plain solid Midnight Indigo background — no checkerboard, no drums.

Start with image 1.
```

Dosyaları bu adlarla `art-incoming/` klasörüne koy (ya da sohbete ekle), sonra `npm run art:sync`. Gitarın maskesi için ayrıca `npm run art:automask -- item/guitar_1`.
