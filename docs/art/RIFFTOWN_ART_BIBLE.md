# Rifftown Art Bible — Visual Language v1

Rifftown'un bütün görselleri tek bir görsel dilde üretilir: **modern, stilize, yarı gerçekçi oyun illüstrasyonu.** Popmundo'nun okunaklılığı, bugünün mobil oyunlarının cilasıyla. Onaylı stil panosu birincil referanstır; bu belge panoda görünmeyen kuralları yazıya döker.

Üretim akışı: **Claude Code gereksinimi tanımlar → ChatGPT görseli üretir → dosyalar doğrulanır → Claude Code oyuna yerleştirir.** Gereksinimler `scripts/art/catalog.ts` içinde tanımlıdır; `docs/art/ASSET_MANIFEST.json` ve `docs/art/IMAGE_GENERATION_REQUESTS.md` oradan üretilir.

## 1. Genel ilkeler

| İlke | Kural |
| --- | --- |
| Gerçeklik düzeyi | Yarı gerçekçi ve stilize. Fotoğraf gibi değil, çizgi film gibi de değil. |
| His | Premium ama eğlenceli; dokunmak isteyeceğin objeler. |
| Okunurluk | Siluet 32–64 pikselde tanınmalı. Gereksiz küçük ayrıntı yok. |
| Renk | Objeler kendi doğal renklerinde (ahşap, krom, deri). Marka neonları sadece küçük ışık vurgusu. |
| Yazı | Hiçbir görselde yazı, harf, rakam, logo, marka adı, filigran yok. Yazıyı oyun basar (TR/EN). |
| Gerçek markalar | Tanınan ürün tasarımları (belirli bir gitar ya da araba modeli, ayakkabı logosu) birebir kopyalanmaz. Genel biçimler serbest. |
| Gerçek kişiler | Portreler hayali kişilerdir; ünlülere benzeyen sonuç atılır. |

Marka paleti: Neon Cyan `#00E5FF`, Hot Pink `#FF2EB6`, Electric Purple `#8A2BFF`, Sky Blue `#3B82FF`, Midnight Indigo `#1A0E4B`, Soft Off-White `#F8F9FF`.

## 2. Işık ve malzeme

- Ana ışık sol üstten, yumuşak. Arkadan hafif soğuk (cyan/mor) bir kenar ışığı. Bütün setlerde aynı.
- Malzemeler ayırt edilebilir: ahşabın damarı, kromun keskin yansıması, derinin yumuşak parlaklığı, plastiğin mat yüzeyi.
- Ayrıntı yoğunluğu set boyunca aynı: bir eşya ötekilerden çok daha ayrıntılı ya da çok daha sade olmaz.

## 3. Kamera ve çerçeve

| Kategori | Kamera | Çerçeve |
| --- | --- | --- |
| Eşya | 3/4 görünüm, hafif yukarıdan; araçlar yandan | Ortada, her yanda ~%10 boşluk, zemin ve gölge yok |
| Şehir | Geniş manzara, akşam mavi saati (bütün şehirler aynı saatte) | Simge yapı yatayda ortada; önemli her şey dikeyde orta üçte ikide; sol alt köşe sakin |
| Mekân | Göz hizasında geniş plan, akşam/gece ışığı | Konu ortada; dikeyde orta üçte iki (16:7 kırpılır) |
| Doluluk halleri | İlgili mekânla birebir aynı oda, kamera, lens ve ışık | Sadece seyirci sayısı değişir |
| Avatar | Omuzdan yukarı, kameraya dönük | Yüz ortadaki %70'te (daireye kırpılır, 32 pikselde görünür) |
| Rozet, ikon | Ön görünüm | Ortada, tek simge, aynı çerçeve ve ışık |

## 4. Seviyeler (tier)

Seviye, renkli çerçeveyle değil **tasarım, malzeme ve işçilikle** anlatılır.

| Seviye | Görünüş |
| --- | --- |
| 1 Basic | Uygun fiyatlı başlangıç: sade biçim, düz malzeme, basit donanım |
| 2 Stage | Sağlam profesyonel iş aleti: daha iyi malzeme ve bitiş |
| 3 Professional | Üst düzey işçilik: damarlı ahşap, parlak metal, ince ayrıntı |
| 4 Iconic / Legendary | Geçmişi olan koleksiyon parçası: eskimiş ya da olağanüstü malzeme |
| Crafted | El yapımı tek parça: görünen el işçiliği, vida, dikiş, ahşap damarı |

EFSANEVİ olmuş eşyaların ayrı görseli yoktur; oyun kenarına altın bir parıltı ekler.

## 5. Boyanabilen eşyalar ve boya maskesi

Oyuncular enstrüman, kıyafet, araç ve sprey boyayı 10 renge boyayabilir.

- **Asıl görselde** boyanabilen yüzey **nötr açık gri (`#DADADA`)** çizilir, gölge ve parlamalar eksiksiz kalır. Geri kalan her parça kendi doğal malzemesindedir.
- **Maske** aynı boyutta ayrı bir PNG'dir: boyanabilen yüzey saf beyaz ve opak, geri kalan her şey şeffaftır. Metal, tel, cam, ahşap sap, lastik ve ışıklar maskeye girmez.
- Oyun boyayı maskeye göre **çarpma (multiply)** karışımıyla basar. Böylece gri yüzeyin gölgesi ve parlaması korunur.
- Boyanmamış eşya, manifestteki `defaultPaint` fabrika rengiyle görünür. Örneğin başlangıç gitarı mavi, 1959 gitar altın.
- Doğrulama maskenin boyutunu, beyazlığını ve eşyayla hizasını denetler: maskenin en çok %2'si eşyanın dışına taşabilir. Maskesi geçerli olmayan boyanabilir eşya oyuna girmez; eski görünüm kullanılır.

Hangi yüzeyin boyandığı:

| Grup | Boyanan yüzey |
| --- | --- |
| Gitar, bas | Gövdenin üstü ve yanları |
| Davul | Davul kazanlarının dışı |
| Klavye | Gövde (tuşlar, düğmeler, ekran, ahşap yanlar hariç) |
| Mikrofon | Sap ve gövde (ızgara hariç) |
| Kıyafet | Ana kumaş ya da deri |
| Araç | Kaporta; motosiklette depo ve kaportalar |
| Sprey | Kutunun gövdesi ve kapağı |

## 6. Kategori kuralları

- **Şehirler:** her şehir ilk bakışta simge yapısından tanınır. Mavi saat, yanan pencereler, hafif neon vurgular.
- **Mekânlar:** bir türün bütün şehirlerde ortak resmi vardır, bu yüzden belirli bir şehre ya da markaya ait değildir. Konser mekânları içeriden, sahne tarafına bakar.
- **Doluluk halleri:** bar, kulüp, salon, stadyum ve festival için boş, yarı dolu ve dolu. Mekânın resmiyle aynı kare, sadece kalabalık değişir.
- **Eşyalar:** tek obje, şeffaf arka plan, ortak kamera. Yeni enstrüman aileleri (kanun, bağlama, keman, saksafon, trombon) aynı kurallarla eklenir. Yapı değişmez; yalnızca `catalog.ts` içine yeni kimlik girer.
- **Avatarlar:** çeşitli yaş, ten rengi, cinsiyet ve müzik türü. Aynı ışık ve aynı Midnight Indigo arka plan.
- **Rozet ve ikonlar:** bütün set aynı çerçeve, aynı perspektif, aynı ışıkta. Tek ve kalın bir simge.
- **Dövmeler:** dövme şablonu çizimi, şeffaf arka plan, ten yok.
- **Plak kapakları:** yazısız. Grup adını ve başlığı oyun basar.

## 7. Teknik gereksinimler

| Kategori | Oyundaki boyut | Biçim | ChatGPT'den istenen |
| --- | --- | --- | --- |
| Şehir, mekân, doluluk | 1600×700 | WebP | 1536×1024 yatay |
| Eşya, boya maskesi | 512×512 | Şeffaf PNG | 1024×1024 |
| Avatar | 512×512 | WebP | 1024×1024 |
| Başarım rozeti, dövme | 256×256, 512×512 | Şeffaf PNG | 1024×1024 |
| İkon (mekân, beceri, moodlet) | 128×128 | Şeffaf PNG | 1024×1024 |
| Plak kapağı | 1024×1024 | JPG | 1024×1024 |

`npm run art:prepare` gelen dosyaları bu boyutlara getirir: yatay resimler ortadan 16:7'ye kırpılır, kareler küçültülür. Maskeler keskinleştirilir.

## 8. Kaçınılacaklar

- Yazı, logo, plaka yazısı, tabelada harf.
- Sahte dama deseni çizilmiş "şeffaf" arka plan (doğrulama yakalar).
- Kenara değen ya da çerçeveden taşan obje.
- Bir setin içinde farklı kamera açıları ya da farklı ışık.
- Neon renkleri objenin kendi rengi yapmak (vurgu olarak kalmalı).
- Gerçek ünlülere, gerçek markalara benzeyen sonuçlar.
