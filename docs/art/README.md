# Rifftown görsel hattı

**Claude Code gereksinimi tanımlar → ChatGPT üretir → dosyalar doğrulanır → Claude Code oyuna yerleştirir.**

| Dosya | Ne |
| --- | --- |
| `RIFFTOWN_ART_BIBLE.md` | Görsel dil (Visual Language v1): ışık, kamera, seviyeler, boya maskesi, kaçınılacaklar |
| `ASSET_MANIFEST.json` | Gereken her görsel: kimlik, yol, boyut, biçim, durum, parti, bağımlılık (üretilir) |
| `IMAGE_GENERATION_REQUESTS.md` | Eksik görseller için partilere ayrılmış, kopyala-yapıştır ChatGPT istekleri (üretilir) |
| `BATCH_B0_CHATGPT.md` | İlk deneme partisi: sonuçları ve yeniden üretilecekler için tek parça istek |
| `VALIDATION_REPORT.md` | Son doğrulamanın sonucu (üretilir) |
| `gallery.html` | Bütün görsellerin ve boya örneklerinin toplu görünümü (üretilir; tarayıcıda aç) |

Gereksinimlerin tek kaynağı `scripts/art/catalog.ts`; kimlikler oyunun kendi kimlikleridir (`packages/shared`). Yeni bir eşya ya da enstrüman ailesi eklemek için oraya bir satır eklemek yeter.

## Komutlar

```bash
npm run art:sync       # art-incoming/ → boyutlandır → doğrula → uygulamaya ekle → galeri
npm run art:validate   # sadece doğrula (hata varsa çıkış kodu 1)
npm run art:manifest   # manifest ve istekleri yeniden üret
npm run art:automask -- item/guitar_4               # boya maskesini gri yüzeyden çıkar
npm run art:automask -- item/car_2 auto 30 0.3 0.08  # eşik ayarlı: doygunluk, en düşük açıklık, ek parça oranı
```

ChatGPT'den indirilen dosyalar istekteki **File name** adıyla `art-incoming/` klasörüne konur (git'e girmez). İşlenenler `art-incoming/done/` altına taşınır.

## Dizin yapısı

```text
app/assets/art/
  city/<şehir>.webp              1600×700
  place/<mekân türü>.webp        1600×700
  crowd/<mekân>.<empty|half|full>.webp
  item/<eşya>.png                512×512, şeffaf
  item/<eşya>.mask.png           boya maskesi
  avatar/01.webp … 32.webp       512×512
  achievement/<başarım>.png      256×256
  icon/place/<tür>.png, icon/skill/<kategori>.png   128×128
  moodlet/<moodlet>.png          128×128
  tattoo/<dövme>.png             512×512
  cover/<tür>.<1|2>.jpg          1024×1024
app/src/lib/art-registry.ts      sadece doğrulanmış dosyaları listeler (üretilir)
```

## Uygulamadaki bağlantı noktaları

Her bileşen önce kayıt dosyasına bakar; görsel yoksa ya da doğrulanmadıysa mevcut görünümünü kullanır.

| Görsel | Bileşen | Göründüğü yer |
| --- | --- | --- |
| Şehir | `CitySkyline` (`components/art/skyline.tsx`) | Ana ekran, şehir sekmesi, profil, seyahat |
| Mekân, doluluk | `PlaceArt` (`components/art/place.tsx`) | Mekân sayfası; konser raporunda seyirci oranına göre boş/yarı/dolu |
| Eşya, boya | `ItemArt` (`components/art/items.tsx`) → `PaintedItemImage` (`components/art/asset.tsx`) | Dükkân, envanter, pazar, takas, eşya sayfası |
| Avatar | `Avatar` (`components/ui.tsx`) | Fotoğraf yüklemeyen oyuncuya isminden türeyen sabit hazır portre |
| Mekân ve beceri ikonu | `PlaceIcon`, `SkillCategoryIcon` | Şehir listesi, beceri listesi |
| Moodlet | `MoodletList` (`components/moodlets.tsx`) | Ruh hâli kartı |
| Başarım | `app/achievements.tsx` | Başarımlar ekranı |

Boyama: asıl görselde boyanabilen yüzey nötr açık gri çizilir. Maske, boya renginde ve `multiply` karışımıyla üstüne basılır; gölge korunur. Boyanabilen bir eşya ancak maskesi de geçerliyse oyuna girer.

Henüz bağlanmayanlar:
- **Dövmeler:** profilde yazıyla listeleniyor, görsel gösterecek bir alan yok.
- **Plak kapakları:** yayın verisinde (`ReleaseDto`) tür bilgisi yok; kapak seçmek için sunucuya küçük bir ekleme gerekiyor.

Görseller tamamlanınca ikisi de bağlanabilir.
