# Denge ölçümü: tempo, beceri ve ekonomi

Tarih: 27 Ekim 2026. Betik: `scripts/balance/measure.ts` (yalnızca `packages/shared` formüllerini çağırır; sunucuya ve veritabanına dokunmaz, rastgelelik sabit tohumludur). Yeniden üretmek için:

```
npx tsx scripts/balance/measure.ts > olcum.md
```

Betik "eski" kuralı (şehir doygunluğu ve uzmanlık payı yokken) ve "yeni" kuralı aynı tohumla yan yana çalıştırır. Bu belgedeki tablolar betiğin çıktısıdır; tam çıktı en sondaki ekte.

## Kısa sonuç

| Endişe | Ölçüm | Karar |
|---|---|---|
| (a) Beceriler birbirine benziyor, genişlik derinlikle aynı yere varıyor | **Doğrulandı (yan becerilerde).** Şarkı yazma ve sahne etkili 19 yan beceride +10 tavanına en ucuz yol 146 (şarkı yazma, 3 beceri × 67) ve 180 (sahne, 8 beceri × 38) okul saati; sahnede derin dağılım (3 beceri × 91) 275 saatle daha pahalı ve tavanı geçemiyor. Eşit saatle (240 sa) iki dağılım da +10'da eşit. Çekirdek beceriler (beste, söz, şovmenlik, rol) tavansız ve baskın: aynı 120 saat besteyi 45'ten 100'e çıkarıp şarkı kalitesine +19,8 veriyor, yan becerilerin tavanı +8. | **Değişti:** usta (60) üstündeki puanlar tavanın dışında bir kez daha sayılır, en fazla +5 (uzmanlık payı). Kimsenin etkisi azalmaz. |
| (b1) Yayın temposu 3/7/28 gün, Popmundo'nun 4 katı | **Güncel değil.** Kod zaten Popmundo temposunda: liste haftası 7, single 28, albüm 112 gün (`pacing.ts`). 52 haftada en fazla 13 single, 4 albüm. | Değişmedi. |
| (b2) İçerik hızlı tükeniyor | **Başka yerde doğrulandı: konser sıklığında.** Sunucuda günlük konser sınırı yok (yalnızca aynı anda 2 ayarlı konser ve ±3 saat çakışma). Günde 1 konserle tek şehirde stadyum 8. haftada, günde 3 konserle 4. haftada; "sıradaki hedef" zincirinin stadyuma kadarki kısmı ve 13 kod başarımından 11'i ilk 12 haftada bitiyor. | **Değişti:** şehir doygunluğu (kulüp ve üstü). Tek şehirde öğütmek yavaşladı (günde 3 konserle stadyum 4 → 9. hafta, günde 1 konserle 8 → 11), turne yolu değişmedi. |
| (b3) Para birikiyor, harcanacak yer az | **Doğrulandı ve büyük.** Stadyumda oyuncu başına haftalık net ~$46–58 bin (ölçüm); salonda tam bir hafta ~$8–17 bin (hesap: 7 konser × 1.200–2.000 seyirci × $40 × %12 ÷ 4). Dükkânların ve ruhsatların bütün tek seferlik kalemleri (VIP hariç) $105.840; günde 1 konser veren oyuncu bunu 9.–13. haftada geçiyor. | **Değişmedi (ayarla çözülmüyor).** Doygunluk tek şehirde öğütmeyi frenliyor ama turnede geliri değiştirmiyor. Gelir oranlarını 4'te 1'e indirmek bile harcama kalemlerini birkaç haftada bitirir; asıl eksik sürekli harcama yeri. Öneriler aşağıda. |

## Varsayımlar

Hepsi betikte sabit olarak duruyor; değiştirip yeniden çalıştırmak mümkün.

- **Oyun hızı:** üretimde `GAME_SPEED=1` (render.yaml, deploy). Belgedeki "hafta" hem oyun haftası hem gerçek haftadır.
- **Grup:** 4 oyuncu, rock, ev şehri İstanbul (şehir çarpanı 1,0; rock popülerliği 1,1). Dört üye aynı tempoda gelişir: bir gitaristin beceri gelişimi her üyenin kendi rolüne yansıtılır. Kiralık müzisyen, tur ekibi, sahne efekti, eşya bonusu, sahne olayı ve bis kullanılmaz. Basın nötr.
- **Oyuncunun günü:** okulda 4 saat (plan sırasıyla gitar, beste, rock, söz, temel telli, şovmenlik; profil B'de 2 saat), 4 saat mesai (gitar 45 olunca müzik öğretmeni, öncesinde $20/saat sıradan iş), haftada 6 saat prova (B 4, C/E 8). Ruh hâli 80, enerji 70, ilham 30 sabit. Bunlar enerji ve ruh hâli bütçesine sığıyor (8 saat evde dinlenme günü dolduruyor).
- **Şarkılar:** 3 günde bir şarkı (hız sınırına takılmadan), setlist en iyi 6 şarkı, aşinalık tür sınırına kadar 70.
- **Konserler:** her zaman şöhretin açtığı en büyük sahne. Profiller: A günde 1 konser tek şehir, B haftada 3 konser tek şehir, C günde 3 konser tek şehir, D günde 1 konser İstanbul–Ankara–İzmir sırayla, E günde 3 konser üç şehir sırayla. Olumlu şöhretin %25'i ülkenin diğer şehirlerine yayılır (sunucudaki kural).
- **Yayınlar:** her 28 günde single (1 kayıt), 112 günde albüm (6 kayıt), satış yalnızca Türkiye'nin üç şehrinde; gelir payı %50, dört üyeye bölünür. Kayıt ve baskı ücretleri dörde bölünür.
- **Giderler:** ilk 4 hafta kiralık oda, sonra daire; günde bir "günün yemeği" ($15); okul $30/saat; stüdyo $20/saat.
- **Görevler:** haftanın üç görevi her hafta tamamlanır.

### Ölçülen ve tahmin edilen

- **Ölçülen (formülden birebir):** beceri dağılımı tabloları, tavana varış saatleri, etkilerin kalite karşılığı, konser başına seyirci, gelir ve şöhret, görev havuzunun dönüşü, yayın temposu, harcama kalemlerinin toplamı. Bunlar `packages/shared` fonksiyonlarının doğrudan çıktısıdır.
- **Model (varsayımlara bağlı):** haftalık para akışı, sahne eşiklerine varış haftaları, başarım haftaları. Oyuncu davranışı modeldir; gerçek oyuncu verisiyle doğrulanmadı.
- **Modelin yönü (tahmin):** gerçek oyun muhtemelen **daha hızlı**. Modelde olmayanlar: her konserin rol becerisine +0,5 ve temel beceriye +0,2 eklemesi, enstrüman ve kıyafet bonusları, sahne olayları ve bis, tek başına oyuncunun bütün geliri tek başına alması. Daha yavaş yapanlar: oyuncuların her gün aynı düzende oynamaması, eksik üye, rakip grupların sahneleri doldurması (oyunun kendi grupları oyuncuya yer açar, diğer oyuncular açmaz).
- **Ölçülmedi:** `skills_known` (model yeni kitap açmıyor), sosyal, suç, atölye, basın, siyaset başarımları; Türkiye dışı şehirler; platin ve elmas plak (satış yalnızca 3 şehirde, bu yüzden düşük kalıyor).

## (i) Beceri dağılımı

Yan becerilerin etkisi beceri × ağırlık toplamıdır; şarkı yazma ve sahne puanına en fazla +10 (`skills.ts`).

| Etki | Beceri sayısı | Ağırlık toplamı | Hepsi 100'de ham toplam |
|---|---|---|---|
| Sahne | 13 | 0,33 (en yüksek 0,04) | 33 |
| Şarkı yazma | 6 | 0,22 (en yüksek 0,05) | 22 |
| Kayıt | 6 | 0,15 | 15 (tavan yok; yapımcılığa ×2) |
| Prova (çarpan) | 3 | 0,38 | ×1,38 (×1,5 tavanına hiç varılamaz) |
| Sokak (çarpan) | 9 | 1,60 | ×1,5 tavanına 2 beceri 100'de ya da hepsi ~31'de |

**Eşit çalışma saati (okulda, ruh hâli 80), şarkı yazma:**

| Saat | Dağılım | Beceri başına seviye | Ham etki | Eski | Yeni |
|---|---|---|---|---|---|
| 120 | geniş (6) | 35 | 7,7 | 7,7 | 7,7 |
| 120 | derin (3) | 58,8 | 8,8 | 8,8 | 8,8 |
| 240 | geniş (6) | 58,8 | 12,9 | **10** | 10 |
| 240 | derin (3) | 86,1 | 12,9 | **10** | **13,9** |
| 480 | geniş (6) | 86,1 | 19 | 10 | 15 |
| 480 | derin (3) | 100 | 15 | 10 | 15 |

**Eşit çalışma saati, sahne:**

| Saat | Dağılım | Beceri başına seviye | Ham etki | Eski | Yeni |
|---|---|---|---|---|---|
| 240 | geniş (13) | 32,7 | 10,8 | 10 | 10 |
| 240 | orta (6) | 58,8 | 11,8 | 10 | 10 |
| 240 | derin (3) | 86,1 | 9,5 | 9,5 | **12,4** |
| 480 | geniş (13) | 55,7 | 18,4 | 10 | 10 |
| 480 | derin (3) | 100 | 11 | 10 | 14,4 |

**Tavana en ucuz varış:** sahnede 8 beceri × 38,5 = 180 okul saati ($365 kitap); 3 beceri × 91 = 275 saat. Şarkı yazmada 3 beceri × 66,7 = 146 saat. Yani tavan, günde 4 saat okula giden bir oyuncu için 5–8 haftalık iştir ve eski kuralda sonrası yan becerilerde boşa gidiyordu.

**Oyundaki karşılığı:**

- Sahne yan becerilerinin +10'u konser kalitesine yalnızca **+0,9 puan** katar (sahne puanı kaliteyi ×0,85–1,0 arasında çarpar). Sahne yan becerilerinin asıl değeri sahne olaylarının eşiği ve başarı şansıdır (beceri − eşik × 0,02), yani dar ve beceriye özgü bir ödül zaten var.
- Şarkı yazma yan becerilerinin +10'u şarkı kalitesine +8 katar; konserde ×0,4, kayıtta ×0,45 ile geçer.
- Çekirdek beceriler tavansızdır: 120 saat besteyi 45'ten 100'e çıkarır, şarkı kalitesine +19,8. Derinliğin büyük ödülü burada zaten vardı; sorun yan becerilerdeydi.

### Yapılan ayar: uzmanlık payı

`skills.ts` `masteryBonus`, `effectBonus`: her yan becerinin usta (60) seviyesini aşan kısmı × ağırlık, tavanın **dışında** eklenir, en fazla +5. Şarkı yazma ve sahne puanı bunu kullanır.

- 60'ın altındaki her profilde etki eskisiyle birebir aynı; hiçbir profilde eskisinden düşük değil (testte 800 rastgele profille denetlenir). Kazanılmış ilerleme azalmaz, migration gerekmez.
- Eşit 240 saatte derin uzman şarkı yazmada 13,9'a, sahnede 12,4'e çıkar; geniş oyuncu 10'da kalır. Şarkı kalitesinde fark ~+3.
- Genişliğe azalan getiri **eklenmedi**: geniş oyuncuların bugünkü etkisini düşürürdü.
- Prova çarpanı tavanı (×1,5) ulaşılamaz ama zararsız; değişmedi. Sokak çarpanı 2 beceriyle doluyor; para etkisi küçük (saatte $4–50), değişmedi.

## (ii) Şöhret temposu ve para

Oyuncu başına, haftalık; sahne eşikleri ev şehri İstanbul içindir.

| Profil | Kural | Kulüp (15) | Salon (45) | Stadyum (75) | 3 şehirde stadyum | 26. hafta net $/hafta | Birikmiş $ 12. hf | 26. hf | 52. hf |
|---|---|---|---|---|---|---|---|---|---|
| A tek şehir, günde 1 | eski | 3 | 6 | 8 | 23 | 57.900 | 298.243 | 1.098.721 | 2.596.595 |
| A tek şehir, günde 1 | yeni | 3 | 8 | 11 | 41 | 46.097 | 93.432 | 732.627 | 1.931.983 |
| B tek şehir, haftada 3 | eski | 6 | 11 | 15 | 49 | 25.581 | 11.776 | 307.738 | 974.178 |
| B tek şehir, haftada 3 | yeni | 6 | 13 | 17 | >52 | 23.919 | 7.288 | 245.294 | 867.015 |
| C tek şehir, günde 3 | eski | 2 | 3 | **4** | 11 | 169.478 | 1.439.790 | 3.799.689 | 8.191.207 |
| C tek şehir, günde 3 | yeni | 2 | 7 | **9** | 35 | 101.857 | 382.469 | 1.798.299 | 4.448.097 |
| D turne, günde 1 | eski = yeni | 5 | 9 | 11 | 12 | 55.034 | 90.208 | 860.589 | 2.293.622 |
| E turne, günde 3 | eski | 3 | 5 | 6 | 6 | 161.536 | 1.116.480 | 3.370.947 | 7.564.071 |
| E turne, günde 3 | yeni | 3 | 6 | 9 | 9 | 129.668 | 595.494 | 2.404.151 | 5.768.951 |

Para akışının kırılımı (A, yeni kural; tam tablo ekte):

| Hafta | Şöhret | Sahne | Konser $ | Mesai $ | Plak $ | Görev $ | Yaşam $ | Okul $ | Müzik $ | Net $ | Birikmiş $ |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2,3 | bar | 128 | 560 | 23 | 150 | 165 | 840 | 195 | −339 | 161 |
| 4 | 21,2 | kulüp | 1.208 | 560 | 117 | 160 | 165 | 840 | 545 | 495 | 420 |
| 8 | 47 | salon | 3.424 | 812 | 222 | 115 | 285 | 840 | 120 | 3.327 | 8.623 |
| 12 | 89 | stadyum | 42.804 | 1.036 | 406 | 100 | 285 | 840 | 120 | 43.101 | 93.432 |
| 26 | 100 | stadyum | 44.643 | 1.344 | 1.239 | 115 | 285 | 840 | 120 | 46.097 | 732.627 |

(Konser $ haftanın 7 konserinin toplamıdır; "Müzik $" prova, kayıt ve baskı ücretleri.)

Okumalar:

- **İlk hafta zor, sonra hızla şişiyor.** Bar evresinde okul masrafı geliri aşıyor (gerçek oyuncu okulu azaltır); kulübe geçince net artıya döner, stadyumda haftalık ~$45–55 bin.
- **Konser sıklığı en büyük etken.** Eski kuralda gelir ve şöhret konser sayısıyla doğrusal büyüyordu: günde 3 konser tek şehirde 12 haftada $1,44 milyon.
- **Turne değişmedi.** D profili zaten her şehre 3 günde bir gidiyor; doygunluk penceresinin dışında kalıyor. Bu bilinçli: doygunluk tek şehirde öğütmeyi değil turneyi ödüllendirir.

### Harcama yerleri (tek seferlik, VIP hariç)

| Kalem | $ |
|---|---|
| En iyi enstrüman (kendi rolün) | 4.000 |
| En iyi kıyafet | 4.200 |
| En iyi araç | 28.000 |
| Bütün sanat eserleri | 19.640 |
| Bar ruhsatı (İstanbul) | 20.000 |
| Plak şirketi (İstanbul) | 30.000 |
| **Toplam** | **105.840** |

Sürekli giderler küçük: daire $180/hafta, loft $450, okul $30/saat, stüdyo $20/saat. Toplamı geçtiği hafta: A eski 9 → yeni 13, C 5 → 10, D 13 → 13, E 6 → 9, B 19 → 21.

### Yapılan ayar: şehir doygunluğu

`rules.ts` `CITY_SATURATION`, `pacing.ts` `citySaturationHours: 60`. Bir grubun aynı şehirde son 60 oyun saati içindeki önceki konser sayısı k ise:

- şöhret kazancı × 1 ÷ (1 + 0,5 × k): k=1 ×0,67, k=2 ×0,5, k=4 ×0,33;
- seyirci (dolayısıyla gelir) × (1 − 0,1 × k), en az ×0,6.

Muaf olanlar: **bar** (yeni grupların ilk adımları ve "10–17 bar konseriyle kulübe" hedefi aynen kalsın), **festival**, **oyunun kendi grupları** (yönetmen onları zaten bantta tutar). Şöhret kayıpları küçülmez. Kazanılmış şöhrete dokunulmaz; yalnızca bundan sonraki kazanç etkilenir, migration gerekmez. Pencere sunucuda `GIG_SATURATION_HOURS` ile değiştirilebilir (0 kapatır). Konser raporunda yeni bir etken var ("Seyircinin tazeliği"; 1 konser idare eder, 2+ zayıf) ve öneri kartı başka şehre gitmeyi önerir.

Neden bu değerler: 60 saat, her gün aynı şehirde çalan grubun önceki iki gününü kapsar (k=2), her şehre 3 günde bir dönen turneyi ise 12 saatlik oynamayla bile cezasız bırakır (ilk denemede 72 saat seçilmişti; o değer tam 72 saatte dönen turneyi sınırda bırakıyordu, birkaç saat erken konser k=1 cezası yerdi). 0,5, her gün aynı şehirde çalan grubun şöhret kazancını yarıya indirir. Etkisi: tek şehirde günde 3 konser stadyuma 4 yerine 9 haftada varır ve 12 haftada $1,44 milyon yerine $382 bin biriktirir; günde 1 konserde stadyum 8 → 11. hafta.

### Değiştirilmeyenler ve neden

- **Gelir oranları** (`VENUE_RULES.bandShare`: bar %70, kulüp %45, salon %12, stadyum %4). GAME_DESIGN'daki "salon $6–8 bin, stadyum $30 bin" hedefi bunlara dayanıyor. Ölçüm, sorunun oranlarda değil harcama yerlerinin yokluğunda olduğunu gösteriyor: stadyum payını 4'te 1'e indirmek bile oyuncu başına haftada ~$14 bin bırakır ve $105 bin harcama kalemi 8 haftada biter. Oranı tek başına kısmak oyuncuyu cezalandırır, enflasyonu çözmez.
- **Konser başına şöhret** (`(kalite − 20)/100 × 6 × mekân çarpanı`). Turne yapan, günde 1 konser veren grup ev ülkesinin üç şehrinde 12 haftada stadyuma çıkıyor. Bu hızlı mı yavaş mı, Popmundo'yla karşılaştıracak sağlam bir ölçüm yok (tahmin: Popmundo daha yavaş); tasarım kararı olarak bırakıldı.
- **Yayın temposu:** zaten 7/28/112 gün.
- **Görev havuzu:** 29 görev, haftada 3; bütün görevleri görmek ortalama 45,6 hafta (medyan 38). Havuz tükenmiyor, tekrarlıyor; sorun yok.

## (iii) İçerik tüketim hızı (yeni kural)

Simülasyonun izleyebildiği başarımlar (hafta; harfler profiller):

| Başarım | Kural | A | B | C | D | E |
|---|---|---|---|---|---|---|
| shifts_50 | 50 mesai | 8 | 8 | 8 | 8 | 8 |
| stadium_gig | stadyumda çal | 11 | 18 | 10 | 12 | 9 |
| masterpiece | şarkı ≥ 85 | 13 | 23 | 13 | 13 | 13 |
| gigs_100 | 100 konser | 15 | 34 | 5 | 15 | 5 |
| singles_5 | 5 single | 17 | 17 | 17 | 17 | 17 |
| epic_5 | 5 DESTANSI | 20 | 46 | 20 | 20 | 20 |
| songs_50 | 50 şarkı | 22 | 22 | 22 | 22 | 22 |
| gigs_250 / recordings_25 / albums_3 | | 36 / 36 / 36 | >52 / 36 / 36 | 12 / 36 / 36 | 36 / 36 / 36 | 12 / 36 / 36 |
| platinum / diamond | | >52 / >52 | >52 / >52 | >52 / >52 | 40 / >52 | 36 / >52 |

Kodla açılan başarımlardan (eski → yeni, A profili; C profilinde süperstar 4 → 9): gigs_10 2, songs_10 4, first_album 4, skilled 5, local_star 5 → 6, great_song 7, master 7, gigs_50 8, hall_gig 6 → 8, gold 8 → 10, superstar 8 → 11, legend 17, epic_gig 19. Yani 13 başarımdan 11'i ilk 12 haftada açılıyor. Uzun soluklu içerik süperstar şehirleri (3/8/15), platin/elmas plak ve efsane sonrası hedeflerde; bunlar ülke ülke turne gerektirdiği için doygunluk onları da turneye bağlar.

Zincirlerden (A): Stüdyo günlükleri 4–10. hafta, Sahnenin efendisi stadyum adımı 11. hafta, Kızıl Tilkiler ilk adımı 1. hafta, DESTANSI adımları 19. hafta.

## Kalan riskler ve öneriler

1. **Ekonomi şişmesi (büyük, açık).** Salon ve üstünde para harcama yerlerinden onlarca kat hızlı birikiyor. Önerilen yön (bu ölçümün kapsamı dışında, tasarım kararı gerektirir): şöhretle büyüyen sürekli giderler (büyük sahnelerde prodüksiyon ücreti, salon ve stadyumda zorunlu ekip, lüks ev ve araç bakım giderleri, ruhsat vergisi) ya da yeni pahalı içerik (stüdyo, salon ruhsatı, plak dükkânı; GAME_DESIGN "Sonraki adımlar" madde 4).
2. **Konser sıklığı hâlâ sınırsız.** Doygunluk tek şehirde öğütmeyi frenler, turnede günde 3 konser (E) hâlâ D'den ~2 kat hızlı para kazanır. İstenirse ikinci adım: grubun günde en fazla N konseri.
3. **Model daha yavaş tarafta.** Konserlerin kendiliğinden beceri geliştirmesi, eşya bonusları ve tek başına oyuncunun bütün geliri alması modelde yok; gerçek tempo muhtemelen ölçülenden hızlı.
4. **Kapalı test verisi.** Bu sayılar oyuncu davranışı varsayımına dayanıyor; kapalı testte (README: 14 günlük test) gerçek konser sıklığı, para ve şöhret eğrileri bu tablolarla karşılaştırılmalı.

## Ek ölçüm: içerik hacmi (27 Ekim 2026, 2. iş)

Tarif 19 → 81, eşya 168 → 405, beceri 100 → 142 eklendikten sonra betik aynı tohumla yeniden çalıştırıldı. Aşağıdaki ek dışındaki tablolar ilk ölçümün çıktısıdır; değişen satırlar:

| Ölçüm | Önce | Sonra | Neden |
|---|---|---|---|
| Şarkı yazma / sahne / kayıt ağırlık toplamı | 0,22 / 0,33 / 0,15 | aynı | Yeni becerilere bu etkiler bilerek verilmedi; tavana en ucuz yol (146 ve 180 okul saati) ve uzmanlık payı tabloları birebir aynı. Test bu toplamları sabitler. |
| Prova ağırlığı | 0,38 (3 beceri) | 0,46 (5 beceri) | Ezber tekniği ve nota çıkarma (0,04'er). ×1,5 tavanına hâlâ varılamıyor. |
| Sokak ağırlığı | 1,60 (9 beceri) | 3,50 (21 beceri) | Yeni enstrümanlar. ×1,5 tavanı zaten 2 beceriyle doluyordu; para etkisi saatte $4–50, değişmedi. |
| Arkadaşlık ağırlığı | 0,38 | 0,54 | Diplomasi, yabancı dil. Çarpan ×1,5'te durur. |
| Şöhret temposu (A–E, kulüp/salon/stadyum haftası) | | aynı | Konser formüllerine dokunulmadı. |
| Oyuncu başına haftalık net (26. hafta, A yeni) | $46.097 | $46.112 | Görev havuzu 29 → 31 (yeni görevler $20 ve $40); fark haftada ~$15. |
| Tek seferlik harcama kalemleri (VIP hariç) | $105.840 | $136.390 | En iyi araç $28.000 → $45.000 (turne otobüsü), bütün sanat eserleri $19.640 → $32.390. Tüketim eşyaları ve hediyelikler sürekli harcama yeridir (tabloya girmez). |

Yeni gelir kaynağı yok: tüketim eşyaları ve hediyelikler para üretmez; atölyede yapılıp dükkâna satılan bir ürün yok (bakım setlerinin malzemesi fiyatın en az yarısı); tüccar atölye ürününe malzemenin en fazla %25 fazlasını, günde 2 ürün için öder (en kârlı tarifte, ısmarlama davul setinde, ürün başına ~$70, günde ~$140 ve 2 × 10 saatlik üretim; test her tarif için günde en fazla $200 denetler). Ara malzemelerin fiyatı kendi malzemelerinin maliyetine eşittir, kârı şişirmez. Sanat (%40) ve sahne efekti (+12) tavanları yeni eşyalarla daha ucuza dolmuyor: puan başı fiyat en ucuz eski eşyanın altında değil.

Ölçülmedi (tahmin): tüketim eşyalarının ve ilham becerilerinin şarkı kalitesine etkisi. İlham en fazla 100'dür ve şarkıya en fazla +15 katar; ilham defteri 3 saatte bir +5 verir. Zengin bir oyuncu ilhamı sürekli yüksek tutabilir; bu, parayı tavanlı bir kaliteye çeviren bilinçli bir harcama yeridir (öneri 1'in yönünde).

## Ek: betik çıktısı

Aşağıdaki bölüm `npx tsx scripts/balance/measure.ts` çıktısının kendisidir.

### (i) Beceri dağılımı

- **stage**: 13 beceri, ağırlık toplamı 0.33 (en yüksek 0.04); hepsi 100'de ham toplam 33.
- **songwriting**: 6 beceri, ağırlık toplamı 0.22 (en yüksek 0.05); hepsi 100'de ham toplam 22.
- **recording**: 6 beceri, ağırlık toplamı 0.15 (en yüksek 0.04); hepsi 100'de ham toplam 15.
- **rehearsal**: 3 beceri, ağırlık toplamı 0.38 (en yüksek 0.15); hepsi 100'de ham toplam 38.
- **busking**: 9 beceri, ağırlık toplamı 1.60 (en yüksek 0.25); hepsi 100'de ham toplam 160.
- **social**: 4 beceri, ağırlık toplamı 0.38 (en yüksek 0.12); hepsi 100'de ham toplam 38.

#### Eşit puan bütçesi (beceri puanlarının toplamı sabit)

**stage**

| Puan bütçesi | Dağılım | Beceri başına seviye | Ham etki | Eski (tavan 10) | Uzmanlık payı | Yeni toplam | Okul saati |
|---|---|---|---|---|---|---|---|
| 150 | geniş (13) | 11,5 | 3,8 | 3,8 | 0 | 3,8 | 76 |
| 150 | orta (6) | 25 | 5 | 5 | 0 | 5 | 81 |
| 150 | derin (3) | 50 | 5,5 | 5,5 | 0 | 5,5 | 95 |
| 300 | geniş (13) | 23,1 | 7,6 | 7,6 | 0 | 7,6 | 160 |
| 300 | orta (6) | 50 | 10 | 10 | 0 | 10 | 190 |
| 300 | derin (3) | 100 | 11 | 10 | 4,4 | 14,4 | 376 |
| 600 | geniş (13) | 46,2 | 15,2 | 10 | 0 | 10 | 370 |
| 600 | orta (6) | 100 | 20 | 10 | 5 | 15 | 753 |
| 600 | derin (3) | 100 | 11 | 10 | 4,4 | 14,4 | 376 |

**songwriting**

| Puan bütçesi | Dağılım | Beceri başına seviye | Ham etki | Eski (tavan 10) | Uzmanlık payı | Yeni toplam | Okul saati |
|---|---|---|---|---|---|---|---|
| 150 | geniş (6) | 25 | 5,5 | 5,5 | 0 | 5,5 | 81 |
| 150 | derin (3) | 50 | 7,5 | 7,5 | 0 | 7,5 | 95 |
| 300 | geniş (6) | 50 | 11 | 10 | 0 | 10 | 190 |
| 300 | derin (3) | 100 | 15 | 10 | 5 | 15 | 376 |
| 600 | geniş (6) | 100 | 22 | 10 | 5 | 15 | 753 |
| 600 | derin (3) | 100 | 15 | 10 | 5 | 15 | 376 |

#### Eşit çalışma saati bütçesi (okulda, ruh hâli 80)

**stage**

| Saat | Dağılım | Beceri başına seviye | Ham etki | Eski (tavan 10) | Yeni toplam |
|---|---|---|---|---|---|
| 60 | geniş (13) | 9,3 | 3,1 | 3,1 | 3,1 |
| 60 | orta (6) | 19,1 | 3,8 | 3,8 | 3,8 |
| 60 | derin (3) | 35 | 3,8 | 3,8 | 3,8 |
| 120 | geniş (13) | 17,7 | 5,9 | 5,9 | 5,9 |
| 120 | orta (6) | 35 | 7 | 7 | 7 |
| 120 | derin (3) | 58,8 | 6,5 | 6,5 | 6,5 |
| 240 | geniş (13) | 32,7 | 10,8 | 10 | 10 |
| 240 | orta (6) | 58,8 | 11,8 | 10 | 10 |
| 240 | derin (3) | 86,1 | 9,5 | 9,5 | 12,4 |
| 480 | geniş (13) | 55,7 | 18,4 | 10 | 10 |
| 480 | orta (6) | 86,1 | 17,2 | 10 | 15 |
| 480 | derin (3) | 100 | 11 | 10 | 14,4 |

**songwriting**

| Saat | Dağılım | Beceri başına seviye | Ham etki | Eski (tavan 10) | Yeni toplam |
|---|---|---|---|---|---|
| 60 | geniş (6) | 19,1 | 4,2 | 4,2 | 4,2 |
| 60 | derin (3) | 35 | 5,2 | 5,2 | 5,2 |
| 120 | geniş (6) | 35 | 7,7 | 7,7 | 7,7 |
| 120 | derin (3) | 58,8 | 8,8 | 8,8 | 8,8 |
| 240 | geniş (6) | 58,8 | 12,9 | 10 | 10 |
| 240 | derin (3) | 86,1 | 12,9 | 10 | 13,9 |
| 480 | geniş (6) | 86,1 | 19 | 10 | 15 |
| 480 | derin (3) | 100 | 15 | 10 | 15 |

#### Tavana (+10) varmanın en ucuz yolu

| Etki | Beceri sayısı | Gereken eşit seviye | Toplam okul saati | Kitap $ |
|---|---|---|---|---|
| stage | 3 | 90,9 | 275 | 90 |
| stage | 4 | 71,4 | 219 | 155 |
| stage | 5 | 58,8 | 200 | 200 |
| stage | 6 | 50 | 190 | 255 |
| stage | 7 | 43,5 | 184 | 315 |
| stage | 8 | 38,5 | 180 | 365 |
| stage | 9 | 35,7 | 185 | 445 |
| stage | 10 | 33,3 | 189 | 500 |
| stage | 11 | 32,3 | 200 | 530 |
| stage | 12 | 31,2 | 210 | 570 |
| stage | 13 | 30,3 | 219 | 650 |
| songwriting | 2 | 100 | 251 | 50 |
| songwriting | 3 | 66,7 | 146 | 110 |
| songwriting | 4 | 55,6 | 147 | 180 |
| songwriting | 5 | 50 | 159 | 220 |
| songwriting | 6 | 45,5 | 167 | 275 |

#### Etkilerin oyundaki karşılığı

- Sahne: temel sahne puanı 29,3 (şovmenlik 45, dans 30, seyirci farkındalığı 30) iken etki becerilerinden +10, konser kalitesini 56,5 → 57,5 yapar: **+0,9 kalite puanı** (şarkı puanı ortalaması 55). Uzmanlık payıyla +15: +1,4.
- Şarkı yazma: temel puan 45 (beste, söz, tür 45) iken +10 → şarkı kalitesi **+8** (15 + 0,8 × puan); uzmanlık payıyla +15 → +12. Konserde şarkı puanına ×0,4, kayıtta ×0,45.
- Karşılaştırma: aynı 120 okul saati beste becerisini 45'ten 100'e çıkarır: şarkı yazma puanına +24,8, şarkı kalitesine +19,8. Çekirdek beceriler tavansızdır; derinliğin asıl ödülü oradadır.
- Kayıt: tavan yok. Bütün kayıt etkili beceriler 100'de yapımcılık değerine +30, kayıt kalitesine +3,6.
- Prova çarpanı: bütün beceriler 100'de ×1.38; ×1,5 tavanına hiç varılamaz.
- Sokak çarpanı: 9 beceri; ×1,5 tavanına 2 beceri 100'de ya da hepsi ~31,3'de varılır.

### (ii) Şöhret temposu ve para akışı (oyuncu başına, 4 kişilik rock grubu, ev şehri İstanbul)

#### Özet: eski kural (doygunluk yok) ve yeni kural

| Profil | Kural | Kulüp (15) | Salon (45) | Stadyum (75) | 3 şehirde stadyum | 26. hafta net $/hafta | Birikmiş $ (12. hf) | Birikmiş $ (26. hf) | Birikmiş $ (52. hf) |
|---|---|---|---|---|---|---|---|---|---|
| A Normal, tek şehir (günde 1 konser) | eski | 3 | 6 | 8 | 23 | 57.900 | 298.243 | 1.098.721 | 2.596.595 |
| A Normal, tek şehir (günde 1 konser) | yeni | 3 | 8 | 11 | 41 | 46.097 | 93.432 | 732.627 | 1.931.983 |
| B Hafif, tek şehir (haftada 3 konser) | eski | 6 | 11 | 15 | 49 | 25.581 | 11.776 | 307.738 | 974.178 |
| B Hafif, tek şehir (haftada 3 konser) | yeni | 6 | 13 | 17 | >52 | 23.919 | 7.288 | 245.294 | 867.015 |
| C Öğütücü, tek şehir (günde 3 konser) | eski | 2 | 3 | 4 | 11 | 169.478 | 1.439.790 | 3.799.689 | 8.191.207 |
| C Öğütücü, tek şehir (günde 3 konser) | yeni | 2 | 7 | 9 | 35 | 101.857 | 382.469 | 1.798.299 | 4.448.097 |
| D Turne (günde 1 konser, 3 şehir sırayla) | eski | 5 | 9 | 11 | 12 | 55.034 | 90.208 | 860.589 | 2.293.622 |
| D Turne (günde 1 konser, 3 şehir sırayla) | yeni | 5 | 9 | 11 | 12 | 55.034 | 90.208 | 860.589 | 2.293.622 |
| E Öğütücü turne (günde 3 konser, 3 şehir) | eski | 3 | 5 | 6 | 6 | 161.536 | 1.116.480 | 3.370.947 | 7.564.071 |
| E Öğütücü turne (günde 3 konser, 3 şehir) | yeni | 3 | 6 | 9 | 9 | 129.668 | 595.494 | 2.404.151 | 5.768.951 |

Sahne eşikleri ev şehri İstanbul içindir (diğer şehirler yurt içi yayılmayla da büyür).

#### A Normal, tek şehir (günde 1 konser), eski kural: 4 saat okul/gün, 4 saat mesai/gün, 6 saat prova/hafta

| Hafta | Şöhret (İst.) | Sahne | Ort. kalite | Gitar | Konser $ | Mesai $ | Plak $ | Görev $ | Yaşam $ | Okul $ | Müzik $ | Net $ | Birikmiş $ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2,3 | bar | 23,9 | 25,9 | 128 | 560 | 23 | 150 | 165 | 840 | 195 | -339 | 161 |
| 2 | 8,9 | bar | 36,1 | 32,1 | 175 | 560 | 26 | 130 | 165 | 840 | 120 | -234 | -74 |
| 4 | 27,3 | club | 47,7 | 43,1 | 1.701 | 560 | 143 | 160 | 165 | 840 | 545 | 1.014 | 982 |
| 8 | 91,9 | stadium | 62,1 | 64,4 | 50.327 | 812 | 449 | 115 | 285 | 840 | 120 | 50.458 | 73.835 |
| 12 | 100 | stadium | 72,6 | 76,4 | 54.625 | 1.036 | 528 | 100 | 285 | 840 | 120 | 55.044 | 298.243 |
| 16 | 100 | stadium | 81,4 | 87,1 | 55.221 | 1.344 | 593 | 95 | 285 | 840 | 120 | 56.008 | 523.795 |
| 26 | 100 | stadium | 88 | 100 | 55.804 | 1.344 | 1.882 | 115 | 285 | 840 | 120 | 57.900 | 1.098.721 |
| 39 | 100 | stadium | 87,3 | 100 | 55.162 | 1.344 | 2.200 | 145 | 285 | 840 | 120 | 57.607 | 1.847.014 |
| 52 | 100 | stadium | 90,6 | 100 | 55.261 | 1.344 | 2.535 | 140 | 285 | 840 | 545 | 57.610 | 2.596.595 |

#### A Normal, tek şehir (günde 1 konser), yeni kural: 4 saat okul/gün, 4 saat mesai/gün, 6 saat prova/hafta

| Hafta | Şöhret (İst.) | Sahne | Ort. kalite | Gitar | Konser $ | Mesai $ | Plak $ | Görev $ | Yaşam $ | Okul $ | Müzik $ | Net $ | Birikmiş $ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2,3 | bar | 23,9 | 25,9 | 128 | 560 | 23 | 150 | 165 | 840 | 195 | -339 | 161 |
| 2 | 8,9 | bar | 36,1 | 32,1 | 175 | 560 | 26 | 130 | 165 | 840 | 120 | -234 | -74 |
| 4 | 21,2 | club | 47,7 | 43,1 | 1.208 | 560 | 117 | 160 | 165 | 840 | 545 | 495 | 420 |
| 8 | 47 | hall | 62,1 | 64,4 | 3.424 | 812 | 222 | 115 | 285 | 840 | 120 | 3.327 | 8.623 |
| 12 | 89 | stadium | 72,6 | 76,4 | 42.804 | 1.036 | 406 | 100 | 285 | 840 | 120 | 43.101 | 93.432 |
| 16 | 100 | stadium | 81,4 | 87,1 | 44.178 | 1.344 | 463 | 95 | 285 | 840 | 120 | 44.834 | 273.859 |
| 26 | 100 | stadium | 88 | 100 | 44.643 | 1.344 | 1.239 | 115 | 285 | 840 | 120 | 46.097 | 732.627 |
| 39 | 100 | stadium | 87,3 | 100 | 44.130 | 1.344 | 1.744 | 145 | 285 | 840 | 120 | 46.118 | 1.329.675 |
| 52 | 100 | stadium | 90,6 | 100 | 44.209 | 1.344 | 2.491 | 140 | 285 | 840 | 545 | 46.514 | 1.931.983 |

#### D Turne (günde 1 konser, 3 şehir sırayla), eski kural: 4 saat okul/gün, 4 saat mesai/gün, 6 saat prova/hafta

| Hafta | Şöhret (İst.) | Sahne | Ort. kalite | Gitar | Konser $ | Mesai $ | Plak $ | Görev $ | Yaşam $ | Okul $ | Müzik $ | Net $ | Birikmiş $ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1,5 | bar | 23,9 | 25,9 | 122 | 560 | 23 | 150 | 165 | 840 | 195 | -345 | 155 |
| 2 | 5 | bar | 36,1 | 32,1 | 142 | 560 | 26 | 130 | 165 | 840 | 120 | -267 | -112 |
| 4 | 14,9 | bar | 47,7 | 43,1 | 249 | 560 | 151 | 160 | 165 | 840 | 545 | -430 | -737 |
| 8 | 42,7 | club | 62,1 | 64,4 | 3.060 | 812 | 386 | 115 | 285 | 840 | 120 | 3.127 | 7.517 |
| 12 | 87,9 | stadium | 72,6 | 76,4 | 45.334 | 1.036 | 860 | 100 | 285 | 840 | 120 | 46.085 | 90.208 |
| 16 | 100 | stadium | 81,4 | 87,1 | 53.596 | 1.344 | 959 | 95 | 285 | 840 | 120 | 54.748 | 308.213 |
| 26 | 100 | stadium | 88 | 100 | 52.800 | 1.344 | 2.020 | 115 | 285 | 840 | 120 | 55.034 | 860.589 |
| 39 | 100 | stadium | 87,3 | 100 | 52.850 | 1.344 | 2.200 | 145 | 285 | 840 | 120 | 55.294 | 1.577.330 |
| 52 | 100 | stadium | 90,6 | 100 | 53.600 | 1.344 | 2.535 | 140 | 285 | 840 | 545 | 55.949 | 2.293.622 |

#### D Turne (günde 1 konser, 3 şehir sırayla), yeni kural: 4 saat okul/gün, 4 saat mesai/gün, 6 saat prova/hafta

| Hafta | Şöhret (İst.) | Sahne | Ort. kalite | Gitar | Konser $ | Mesai $ | Plak $ | Görev $ | Yaşam $ | Okul $ | Müzik $ | Net $ | Birikmiş $ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1,5 | bar | 23,9 | 25,9 | 122 | 560 | 23 | 150 | 165 | 840 | 195 | -345 | 155 |
| 2 | 5 | bar | 36,1 | 32,1 | 142 | 560 | 26 | 130 | 165 | 840 | 120 | -267 | -112 |
| 4 | 14,9 | bar | 47,7 | 43,1 | 249 | 560 | 151 | 160 | 165 | 840 | 545 | -430 | -737 |
| 8 | 42,7 | club | 62,1 | 64,4 | 3.060 | 812 | 386 | 115 | 285 | 840 | 120 | 3.127 | 7.517 |
| 12 | 87,9 | stadium | 72,6 | 76,4 | 45.334 | 1.036 | 860 | 100 | 285 | 840 | 120 | 46.085 | 90.208 |
| 16 | 100 | stadium | 81,4 | 87,1 | 53.596 | 1.344 | 959 | 95 | 285 | 840 | 120 | 54.748 | 308.213 |
| 26 | 100 | stadium | 88 | 100 | 52.800 | 1.344 | 2.020 | 115 | 285 | 840 | 120 | 55.034 | 860.589 |
| 39 | 100 | stadium | 87,3 | 100 | 52.850 | 1.344 | 2.200 | 145 | 285 | 840 | 120 | 55.294 | 1.577.330 |
| 52 | 100 | stadium | 90,6 | 100 | 53.600 | 1.344 | 2.535 | 140 | 285 | 840 | 545 | 55.949 | 2.293.622 |

#### Paranın gidebileceği yerler (tek seferlik, VIP hariç)

| Kalem | $ |
|---|---|
| En iyi enstrüman (kendi rolün) | 4.000 |
| En iyi kıyafet | 4.200 |
| En iyi araç | 28.000 |
| Bütün sanat eserleri | 19.640 |
| Bar ruhsatı (İstanbul) | 20.000 |
| Plak şirketi (İstanbul) | 30.000 |

Toplam tek seferlik: **$105.840**. Sürekli giderler: ev Kiralık oda $60, Daire $180, Stüdyo loft $450, Çatı katı $1200 (haftalık, şehir çarpanıyla), okul $30/saat, stüdyo $20/saat.

| Profil | Eski: toplamı geçtiği hafta | Yeni: toplamı geçtiği hafta |
|---|---|---|
| A Normal, tek şehir (günde 1 konser) | 9 | 13 |
| B Hafif, tek şehir (haftada 3 konser) | 19 | 21 |
| C Öğütücü, tek şehir (günde 3 konser) | 5 | 10 |
| D Turne (günde 1 konser, 3 şehir sırayla) | 13 | 13 |
| E Öğütücü turne (günde 3 konser, 3 şehir) | 6 | 9 |

### (iii) İçerik tüketim hızı (yeni kural, hafta)

Veri dosyasındaki 42 istatistik başarımından simülasyonun izlediği 12 tanesi (sütunlar profil harfleri):

| Başarım | Kural | A | B | C | D | E |
|---|---|---|---|---|---|---|
| gigs_100 | gigs ≥ 100 | 15 | 34 | 5 | 15 | 5 |
| gigs_250 | gigs ≥ 250 | 36 | >52 | 12 | 36 | 12 |
| stadium_gig | stadium_gigs ≥ 1 | 11 | 18 | 10 | 12 | 9 |
| epic_5 | epic_gigs ≥ 5 | 20 | 46 | 20 | 20 | 20 |
| songs_50 | songs ≥ 50 | 22 | 22 | 22 | 22 | 22 |
| masterpiece | best_song ≥ 85 | 13 | 23 | 13 | 13 | 13 |
| recordings_25 | recordings ≥ 25 | 36 | 36 | 36 | 36 | 36 |
| singles_5 | singles ≥ 5 | 17 | 17 | 17 | 17 | 17 |
| albums_3 | albums ≥ 3 | 36 | 36 | 36 | 36 | 36 |
| platinum | best_units ≥ 10000 | >52 | >52 | >52 | 40 | 36 |
| shifts_50 | shifts ≥ 50 | 8 | 8 | 8 | 8 | 8 |
| diamond | best_units ≥ 50000 | >52 | >52 | >52 | >52 | >52 |

Kodla açılan başarımlardan simülasyonda karşılığı olanlar (eski → yeni):

| Başarım | A | B | C | D | E |
|---|---|---|---|---|---|
| gigs_10 | 2 → 2 | 4 → 4 | 1 → 1 | 2 → 2 | 1 → 1 |
| gigs_50 | 8 → 8 | 17 → 17 | 3 → 3 | 8 → 8 | 3 → 3 |
| songs_10 | 4 → 4 | 4 → 4 | 4 → 4 | 4 → 4 | 4 → 4 |
| great_song (60) | 7 → 7 | 10 → 10 | 6 → 6 | 7 → 7 | 6 → 6 |
| first_album | 4 → 4 | 4 → 4 | 4 → 4 | 4 → 4 | 4 → 4 |
| gold (1.000) | 8 → 10 | 14 → 15 | 6 → 9 | 8 → 8 | 6 → 7 |
| hall_gig (45) | 6 → 8 | 11 → 13 | 3 → 7 | 9 → 9 | 5 → 6 |
| local_star (30) | 5 → 6 | 9 → 10 | 3 → 5 | 7 → 7 | 4 → 5 |
| superstar (75) | 8 → 11 | 15 → 17 | 4 → 9 | 11 → 11 | 6 → 8 |
| skilled (45) | 5 → 5 | 8 → 8 | 5 → 5 | 5 → 5 | 5 → 5 |
| master (60) | 7 → 7 | 14 → 14 | 7 → 7 | 7 → 7 | 7 → 7 |
| legend (90) | 17 → 17 | 35 → 35 | 17 → 17 | 17 → 17 | 17 → 17 |
| epic_gig | 19 → 19 | 40 → 40 | 19 → 19 | 19 → 19 | 19 → 19 |

Zincir adımlarından izlenenler:

| Zincir | Adım | A | B | C | D | E |
|---|---|---|---|---|---|---|
| studio | recordings ≥ 3 | 4 | 4 | 4 | 4 | 4 |
| studio | singles ≥ 2 | 5 | 5 | 5 | 5 | 5 |
| studio | albums ≥ 1 | 4 | 4 | 4 | 4 | 4 |
| studio | best_units ≥ 1000 | 10 | 15 | 9 | 8 | 7 |
| stage | epic_gigs ≥ 1 | 19 | 40 | 19 | 19 | 19 |
| stage | stadium_gigs ≥ 1 | 11 | 18 | 10 | 12 | 9 |
| kingmaker | recordings ≥ 1 | 1 | 1 | 1 | 1 | 1 |
| kingmaker | singles ≥ 1 | 1 | 1 | 1 | 1 | 1 |
| kingmaker | singles ≥ 1 | 1 | 1 | 1 | 1 | 1 |
| kingmaker | best_units ≥ 1000 | 10 | 15 | 9 | 8 | 7 |
| red_foxes | gigs ≥ 5 | 1 | 2 | 1 | 1 | 1 |
| red_foxes | epic_gigs ≥ 1 | 19 | 40 | 19 | 19 | 19 |
| mentor | best_song ≥ 60 | 7 | 10 | 6 | 7 | 6 |

Haftalık görev havuzu: 29 görev, haftada 3. 200 karakterde bütün görevleri en az bir kez görmek ortalama **45,6 hafta** (medyan 38, en kötü %10 69). Havuz tükenmez, görevler tekrar eder.

Yayın temposu (pacing.ts): liste haftası 7 gün, single beklemesi 28 gün, albüm 112 gün, şehir doygunluğu penceresi 60 oyun saati. 52 haftada en fazla 13 single ve 4 albüm.
