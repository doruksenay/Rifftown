# Rifftown denge raporu (bot simülasyonu, `bfb4248`)

## Acımasız özet

1. **Oyun 72 oyun gününde bitiyor.** Hiç beste öğrenmeyen (temel beste 8) ve gitarı "usta" bile olmayan (52) bir grinder, kiralık müzisyenlerin sırtında salona 51., stadyuma 72. günde çıkıyor; 90. günde şöhret 100 (20 tohumun tamamı). Oyuncunun becerisi sonucu neredeyse hiç değiştirmiyor.
2. **Para anlamsızlaşıyor.** Aynı grinder 90 günde $565.000 (Berlin'de $742.000) biriktiriyor; dört oyunculuk dünyada oyuncu parası 90 günde $4.000'den $2.070.000'a çıkıyor. Giderlerin gelire oranı 90. günde %9. Harcanacak bir şey yok.
3. **Ek hesap para taşıma sınırı yok.** "Eşya bir hafta önceki sahibine dönemez" kuralı 3 hesapla aynı oyun saatinde aşılıyor: ana hesap eşyasını kaybetmeden takas başına $5.000 alıyor (4 döngü, 0 oyun saati, +$20.000; betik ekte). "IP başına günde 3 hesap" sınırı istemcinin gönderdiği `cf-connecting-ip` başlığına güveniyor; başlığı değiştiren 6/6 kayıt geçti (Render kökeni doğrudan erişilebilir).
4. **Sokak müziği her şeyi yeniyor.** 30 günde sokak müzisyeni $10.527 kazanıyor (grinder $11.961, tek başına grinder $9.192) ve sahne şovmenliği 82'ye (virtüöz), gitarı 69'a çıkıyor; grinder'ınki 21 ve 36. Hiçbir yatırım, grup, prova gerekmiyor.
5. **Beceri ilerlemesi birkaç gün.** Okulda ana enstrüman 12'den 90'a (efsane) 104 oyun saati, 6 oyun günü, $3.120. Kendi kendine, bedava, 12 oyun günü. Günde 20 saat çalışmak enerji/ruh hâli/sağlık açısından sürdürülebilir.
6. **Konser kararı yok, reçete var.** Kulüp ve üstünde her durumda en iyi plan "nitelikli 3 sahne olayı + cesur bis" (taranan 192–360 planın ilk 5'inin hepsi). En kötü plan hep "hiçbir şey yapma". Set bonusu, tür uyumu ve setlist sırası kaliteye 1 puandan az ekliyor: süs. 6 sis makinesi ($480) her sahnede +12 kalite.
7. **Kayıp sistemleri caydırmıyor.** Bağımlılığı $6'lık çorba 11 saatte bir tamamen siliyor (72 saatte 0 saat "canı çekiyor"). Bankadaki para çocuk bakım giderini sıfırlıyor. Dolandırıcı bot ayda 42 mahkûmiyetle yine kârda. Aşinalık ve şöhret çürümesi aktif oyuncuya hiç dokunmuyor (12 ve 54 gün eşiği).
8. **Plaklar para getirmiyor.** Şöhret 55'te bir albümün ömür boyu geliri ~$10.000; aynı grubun tek bir salon konseri $7.502. Şöhret 20'nin altında albüm zarar ediyor. Tempo (28/112 gün) oyuncuyu bekletmiyor, sadece plakları önemsizleştiriyor.
9. **Eleştiriler 10. konserden sonra tekrar.** 200 konserde 61–68 farklı kalıp cümle; 10. konserden sonra cümlelerin yalnızca %8–9,5'i yeni, konserlerin %78–80'inde hiç yeni cümle yok.
10. **Boş dünya cansız değil ama donuk.** NPC grupları 15. günde şöhret tavanlarına yapışıyor (18/44/72) ve orada kalıyor; albüm listesi ilk 112 gün boş; muhabir 60 günde 0 haber yazıyor; tüccarın 90 ilanı 60 gün boyunca hiç değişmiyor; NPC cüzdanlarında 60 günde $7,6 milyon ölü para birikiyor.

## Yöntem ve güvenilirlik

- **Gerçek sunucu.** Botlar `buildApp()` ile kurulan Fastify uygulamasına `inject` ile istek atar; zamanlayıcı aşamaları `server/src/worker.ts` `tick()` ile aynı sırayla, aynı fonksiyonlarla çalışır (`scripts/balance/lib/world.ts` `simTick`). Hiçbir oyun sabiti ya da sunucu kodu değiştirilmedi.
- **Sanal saat.** `GAME_SPEED=1` (gerçek oyun hızı). Node tarafında `Date` ve veritabanında `now()` aynı sanal saati gösterir: `public.now()` fonksiyonu `sim.clock` tablosunu okur ve `search_path = public, pg_catalog` ile `pg_catalog.now()`'ı gölgeler (migration'lardaki `DEFAULT now()` dahil). Saat bir saatlik adımlarla ilerler, her adımda zamanlayıcı çalışır. `Math.random` tohumlanır.
- **Varsayılan ayarlar.** `DECAY` ve `AGING` açık, `TRADE_MIN_ACCOUNT_HOURS` 72, NPC'ler açık (sömürü betiklerinde NPC kapalı). Yalnız istek sınırı (`RATE_LIMIT=0`) ve botların kaydı için IP sınırı kapalı; IP sınırı ayrıca ölçüldü.
- **Veritabanı.** `rifftown_sim` ve `rifftown_sim2`; `rifftown_test`'e hiç dokunulmadı.
- **Tohumlar.** Ekonomi 20 tohum × 30 gün × 8 bot; kariyer 20 tohum × 90 gün × 4 bot; boş dünya 20 tohum × 60 gün; sokak/mesai çiftliği 20 tohum × 7 gün × 4 bot; Monte Carlo'lar 3.000–20.000 deneme.
- **Sınır.** Bot politikaları deterministiktir: tohumlar arası yayılım (p10–p90) yalnızca oyunun zarlarından gelir, oyuncu davranışı farkından değil. Botlar boşa düştükleri saatte yeni iş başlatır (günde 24 saat oynayan biri): süreler gerçek oyuncu için **alt sınır**, gelirler **üst sınırdır**. Gerçek bir oyuncu günde 3–5 kez giriyorsa süreleri kabaca 2–3 ile çarpın.
- Ham sayılar: `scripts/balance/out/summary.json`; tohum başına çıktılar `out/*-seed-*.json` (depoya girmez, `npm run balance` yeniden üretir).

### Arketipler

| Bot | Ne yapar |
|---|---|
| grinder | şarkı yazar (4+), grup kurar, prova (aşinalık ~75'e), 20 saatte bir konser; barda 3 kiralık müzisyen; boş kalınca 8 saat mesai; $450'de oda kiralar, $1.200/$2.500'de 1./2. seviye enstrüman |
| grinder_solo | aynısı, kiralık müzisyensiz |
| busker | parkta 4 saat çalar, gerekince dinlenir |
| crafter | el işçiliği kitabı, tablo (beceri 45+ ise gitar) üretir, 72 saatten sonra NPC tüccara günde 2 satar, arada mesai |
| social (2 bot) | aynı şehirde takıl/flört/restoran, arkadaş dersi, arada 4 saat mesai |
| recorder | grinder döngüsü + kayıt, her fırsatta single, 6 kayıtta albüm |
| scammer | rehberin en ucuz yolu, haftalık görev ve zincir avı, yankesicilik, sokak müziği |

## Sorunlar (ciddiyet sırasıyla)

| # | Ciddiyet | Sorun | Kanıt (madde) | Öneri (sabit → değer, neden) |
|---|---|---|---|---|
| 1 | Kritik | Kiralık müzisyenler ve şöhret formülü oyuncuyu stadyuma taşıyor; beceri ve şarkı önemsiz | Stadyum 72. gün, salon 51. gün, beste 8, ortalama stadyum kalitesi 54 (§1, §5) | `SESSION_MUSICIAN` becerisi grubun kendi ortalamasının en fazla +10 üstü olsun (`min(venue.skill, ownAvg + 10)`); mekâna göre başa baş kalite: `GIG_BREAK_EVEN_QUALITY` bar 20 · kulüp 35 · salon 50 · stadyum 65 (şu an hepsi 20); şöhret azalması `1 − fame/120` yerine `(1 − fame/110)²` |
| 2 | Kritik | Ek hesaptan ana hesaba kayıpsız, sınırsız para | trade-rotation: 4 döngü, +$20.000, 0 saat; ip-limit: 6/6 sahte başlıkla kayıt (§7) | `items.ts returnsTooSoon`: son 168 saatte eşyanın **sahibi olmuş herkes** (yalnız bir önceki değil); takasa eklenen para tavanı `maxResalePrice` (2×) yerine dükkân fiyatının 1×'i ve alıcı başına haftalık $5.000; `routes/auth.ts`: `cf-connecting-ip` yalnız `TRUST_CF_HEADER=1` ve istek Cloudflare aralığından geliyorsa okunsun, yoksa `req.ip` |
| 3 | Yüksek | Para birikiyor, gider yok | 90 günde $565k–742k, gider/gelir %9; 30 günde oyuncu başına günde +$236 (§2) | Büyük sahnede prodüksiyon gideri: salon $3.000 × şehir, stadyum $20.000 × şehir (konser başı); `VENUE_RULES.stadium.bandShare` 0,04 → 0,02, `hall` 0,12 → 0,07; kiralık müzisyen ücreti gelirin %'si (salon 250 → bilet gelirinin %8'i) |
| 4 | Yüksek | Sokak müziği para + beceri için baskın | busker 30 günde $10.527, şovmenlik 82, gitar 69 (§2, §3) | `actions.ts busk`: beceri artışı 0,3/0,2 → 0,06/0,04 ve sokakta kazanılan beceri amatörde (30) dursun; günde 4 saatten sonra aynı parkta bahşiş ×0,5 |
| 5 | Yüksek | Beceri birkaç günde tavan | okulda 12→90: 104 sa / 6 gün / $3.120 (§3) | `diminishing` `1 − L/110` → `(1 − L/110)^2` (12→90 okulda ~5×), ya da günlük çalışma/ders tavanı 8 saat; `studyGain` okul 2,2 → 1,6 |
| 6 | Orta | Konserde dominant reçete; süs etkenler | 3 olay + cesur bis her profilde ilk 5; set/uyum/sıra < 1 kalite; 6 sis makinesi +12 (§5) | Olay cezası = bonus (`penalty` ↑, eşikte EV < 0); cesur bis başarısızlığı −3 → −6; `MAX_FX_BONUS` 12 → 6; set bonusu ve tür uyumu doğrudan kaliteye (+1/+2), setlist sırası çarpanı 2 → 5 |
| 7 | Orta | İşletme kasası para basıyor | Ek hesaplı bar: günde $1.650–5.078 net, geri ödeme 7–12 gün (§7) | `BUSINESS_RULES.bar.revenuePerHour` 20 → 10, işletme başına günlük 24 mesai-saati müşteri tavanı, işletmecilik bonusu %50 → %20 |
| 8 | Orta | Kayıp sistemleri göz ardı edilebilir | çorba bağımlılığı siler; banka bakım giderini siler; 42 mahkûmiyet/ay (§6, §7) | "Canı çekiyor"u yalnız tedavi ya da $150+ alışveriş gidersin; bakım gideri bankadan da alınsın; ceza süresi `× (1 + 0,5 × sabıka)`; `FAMILIARITY_GRACE_DAYS` 12 → 5, şöhret çürüme eşiği 54 → 21 gün |
| 9 | Orta | Plaklar ekonomide ağırlıksız | albüm (şöhret 55) ömür boyu ~$10k ≈ 1,4 salon konseri (§4) | `RELEASE_RULES` fiyatları albüm $15 → $25, `BAND_SHARE` 0,5 → 0,6; ya da konser gelirini düşür (madde 3) — plak/konser oranı 1:5'e yaklaşmalı |
| 10 | Orta | Eleştiriler 10. konserden sonra tekrar | 200 konserde 61–68 kalıp (§9) | Kalite basamağı başına 8 → 20 cümle, cümleyi parçalardan kur (özne + fiil + mekân + ayrıntı), şehir renk cümlesi 2 → 6 |
| 11 | Düşük | Boş dünya donuk | NPC şöhreti 15. günde tavanda; albüm listesi 112 gün boş; muhabir 0; tüccar ilanı hiç değişmiyor (§10) | NPC albüm ilk gecikmesi `cooldownDays × 24` → 7–60 gün arası rastgele; muhabir NPC konserlerini de yazsın; tüccar ilanı 7 günde yenilensin; NPC cüzdanı her turda sıfırlansın |
| 12 | Düşük | Takılma pompası | 3 ek hesapla 24 saatte ruh hâli 40 → 94, 5 ek hesapla ilham 78 (+12 şarkı kalitesi) (§7) | Takılmanın ruh hâli/ilham etkisi kişi başı günde 3 kez; aynı kişiyle günde 1 |
| 13 | Düşük | NPC konserlerinden bar sahibine para basımı | bar başına günde $7–53 (§7) | NPC'ler oyuncu barlarını kullanmasın ya da sahibin payı NPC konserinde 0 olsun |
| 14 | Düşük | Çocuk sınırı çift başına | farklı eşlerle sınırsız çocuk; bakım gideri günde $2,86/çocuk/ebeveyn (§8) | `MAX_CHILDREN` karakter başına; bakım gideri ×3 |

Dengeli bulunanlar: öğretmen ücret tavanı ($400/gün tutuyor), NPC tüccar (en fazla $120/gün/hesap; zanaatçı mesaiden az kazanıyor), rehber ve görev ödülleri (hesap başına küçük), plak şirketi avans tavanı.

---

## 1. İlk 72 oyun saati ve ilk sahneler

**Para eğrisi (20 tohum, medyan [p10, p90]):**

| Arketip | 24. saat | 72. saat | 7. gün | 30. gün |
|---|---|---|---|---|
| grinder (3 kiralık) | $250 | $447 [425, 476] | $1.053 | $11.961 [11.013, 12.674] |
| grinder_solo | $250 | $367 [338, 388] | $1.072 | $9.192 [7.954, 9.659] |
| busker | $647 | $1.038 [1.020, 1.089] | $1.932 | $10.527 [10.230, 10.734] |
| crafter | $427 | $1.016 | $1.508 | $5.302 |
| social (randevu ödeyen) | $808 | $1.344 | $2.142 | $6.936 |
| social (ders alan) | $676 | $1.180 | $2.188 | $8.122 |
| recorder | $290 | $271 [62, 289] | $219 | $7.134 [6.677, 7.606] |
| scammer | $275 | $502 [410, 802] | $656 | $2.318 [1.774, 2.915] |

Grinder ve recorder ilk 72 saatte **başlangıç parasının ($500) altına düşüyor**: provaya $560–640, kayda $400 harcanıyor; recorder bir hafta boyunca $300'ün altında. Busker ilk saatten itibaren önde.

**İlk 72 saatin para defteri (grinder, ortalama):** mesai +$216, konser +$164, rehber +$160, görev +$60; prova −$560, kira −$60, kiralık müzisyen −$30.

**Rehber ödülleri:** 72 saatte grinder $160, recorder $285 (9 adımın 8'i), scammer $249 (en ucuz yol: $30 tür kitabı, 1 saat prova, tek başına bar, $200 kayıt, $100 single). Rehberin toplamı $305; kayıt ve single adımları $300 harcattığı için net getiri ~$0. Sorun değil.

**Bar konserinin kâr/zararı (gerçek konserler):**

| | Konser | Kalite medyan [p10, p90] | Seyirci | Gelir | Kiralık sonrası net | Şöhret |
|---|---|---|---|---|---|---|
| grinder, 3 kiralık | 281 | 40 [37, 43] | 18 | $126 | $111 | +1,1 |
| grinder_solo | 374 | 35 [30, 39] | 17 | $119 | $119 | +0,9 |

Monte Carlo (yeni oyuncu, şöhret 1): tek başına kalite 33, net $81, +0,78 şöhret; 3 kiralıkla kalite 40, net $66, +1,17 şöhret; 5 kiralıkla 41, $55, +1,22. Barda kiralık müzisyen konser başına $15'a +%50 şöhret getiriyor: **her zaman al**. Bar konseri her durumda kârlı ama küçük: 20 saatlik bir döngüde $111, aynı sürede mesai $144.

**Sahne çıkış süreleri (ilk rezervasyon, oyun saati, medyan [p10, p90]):**

| | İlk bar | Kulüp (şöhret 15) | Salon (45) | Stadyum (75) |
|---|---|---|---|---|
| grinder İstanbul (20/20) | 28 | 472 [440, 504] (20. gün) | 1.218 [1.186, 1.284] (51. gün) | 1.720 [1.669, 1.800] (72. gün) |
| grinder Berlin (20/20) | 28 | 478 | 1.253 | 1.742 (73. gün) |
| grinder_solo İzmir | 28 | 568 (24. gün) | 1.512 (63. gün) | 2.120, 20 tohumun 12'sinde (88. gün) |
| recorder Londra (20/20) | 64 | 533 | 1.376 | 1.933 (81. gün) |
| ekonomi grinder (30 gün, 20/20) | 28 | 472 [440, 504] | — | — |
| ekonomi grinder_solo (30 gün, 19/20) | 28 | 616 [600, 664] | — | — |

**Hüküm: sorun.** İlk 72 saat makul (bar kârlı, rehber küçük), ama sonrası çok hızlı. Grinder'ın 90. gündeki becerileri: gitar 52, şovmenlik 46, beste 8. Konser kalitesi salonda 50, stadyumda 54. Salonda $7.502, stadyumda $32.000 gelir. Kalite yetmediği halde şöhret artıyor çünkü başa baş kalite her mekânda 20.

## 2. Para musluğu ve gider (30 gün, 20 tohum, ortalama $)

| Kalem | grinder | solo | busker | crafter | social A | social B | recorder | scammer |
|---|---|---|---|---|---|---|---|---|
| mesai | +5.688 | +5.688 | | +4.536 | +7.776 | +7.632 | +5.263 | |
| konser | +9.408 | +4.964 | | | | | +4.367 | +17 |
| sokak | | | +9.974 | | | | | +116 |
| suç (yankesicilik) | | | | | | | | +2.041 |
| NPC tüccar | | | | +3.308 | | | | |
| plak satışı | | | | | | | +965 | |
| rehber + görev + zincir | +452 | +415 | +40 | +150 | +190 | +70 | +545 | +380 |
| prova | −1.280 | −1.280 | | | | | −1.216 | −40 |
| kiralık müzisyen | −1.624 | | | | | | −803 | |
| kayıt + baskı | | | | | | | −2.200 | −300 |
| malzeme / kitap | | | | −3.185 | | −80 | | −80 |
| kira | −300 | −300 | | | | | −300 | −300 |
| ekipman | −1.050 | −1.050 | | | | | | |
| randevu | | | | | −1.530 | | | |

- **Para arzı:** 8 oyuncu, $4.000 → 30. günde $61.032 (oyuncu başına günde +$238). Kariyer dünyasında 4 oyuncu 90 günde $2.070.494 (20 tohum ortalaması). 90. gün parası medyan [p10, p90]: grinder İstanbul $564.906 [500.489, 615.806], Berlin $741.983 [692.721, 859.248], tek başına İzmir $247.437 [189.213, 285.303], recorder Londra $523.522 [414.552, 594.445]. NPC cüzdanları 30 günde $3,6 milyon (oyuna geri akmayan ölü para).
- **Giderin gelire oranı:** grinder 30 günde %27, 90 günde %9 (konser geliri $605.110, bütün giderler ~$58.200; bunun $54.807'si kiralık müzisyen).
- **Fiyat enflasyonu yok:** pazar fiyatı dükkân fiyatının 2 katıyla sınırlı, dükkân fiyatları sabit. Enflasyon fiyatta değil **paranın değerinde**: 30. günden sonra paranın alabileceği anlamlı bir şey kalmıyor (en pahalı dükkân eşyası $9.000 VIP, bar ruhsatı $20.000, plak şirketi $30.000).

**Hüküm: sorun.** Konser geliri sahneyle üstel büyüyor (bar $126 → kulüp $1.314 → salon $7.502 → stadyum $32.000), giderler sabit kalıyor. Sink'ler (kira $60–450/hafta, prova $20/sa) büyük sahnede görünmez oluyor. Öneriler: tablo, madde 3.

## 3. Beceri ilerlemesi

Ruh hâli 70, sağlık 95, enerji 60 (verim ×0,88); 2 saatlik oturumlar; gerçek `studyGain` formülü. Enerji dengesine göre evde dinlenen biri günde **20 saat** çalışabilir (çalışma −6+2, evde dinlenme +14+6+2 enerji/saat).

**Ana enstrüman (12'den başlayarak): saat / oyun günü / maliyet**

| Yol | Usta (60) | Virtüöz (75) | Efsane (90) |
|---|---|---|---|
| kendi kendine | 98 sa / 5 gün / $0 | 150 / 8 / $0 | 230 / 12 / $0 |
| okul ($30/sa) | 44 / 3 / $1.320 | 68 / 4 / $2.040 | 104 / 6 / $3.120 |
| profesör ($90/sa, günde 4 sa, İstanbul tavanı 78) | 30 / 8 / $2.700 | 46 / 12 / $4.140 | ulaşılamaz |
| oyuncu öğretmen 3. rütbe ($60/sa varsayım) | 32 / 8 / $1.920 | 50 / 13 / $3.000 | 76 / 19 / $4.560 |
| can dostu/eş (×1,9, günde 4 sa) | 52 / 13 / $0 | 78 / 20 / $0 | 122 / 31 / $0 |
| profesör 4 sa + kalan okul | 42 / 3 / $1.860 | 62 / 4 / $2.700 | 98 / 5 / $3.900 |

Profesör saat başına en verimli ama günlük 4 saat tavanı yüzünden okul günde daha hızlı. Arkadaş dersi bedava ama en yavaş ve öğretenin seviyesiyle sınırlı. Sosyal botlarda ders 8 saatte durdu (`tutor_level_too_low`: öğreten de becerisini geliştirmeli).

**Uygulamada:** grinder 30 günde gitar 36, şovmenlik 21; busker sadece sokakta çalarak gitar 69, şovmenlik 82 (sokak müziği saatte 0,2/0,3 × azalan getiri).

**Geniş-sığ mı derin mi (+10 tavanına maliyet, okulda):**

| Etki | Gereken | Geniş: hepsi eşit seviyede | Derin karşılığı |
|---|---|---|---|
| şarkı yazma +10 | 6 beceri, toplam ağırlık 0,22 | hepsi 45,5: 216 sa, $6.755 | besteye +22: 60→82 39 sa |
| sahne +10 | 13 beceri, 0,33 | hepsi 30,3: 286 sa, $9.230 | şovmenliğe +22: 39 sa |
| prova ×1,5 | 3 beceri, 0,38 | hepsi 26: 54 sa, $1.745 | — |
| sokak ×1,5 | 9 beceri, 1,6 | hepsi 6,3: 36 sa, $1.575 | — |

**Hüküm: sorun.** Tavanlar doğru çalışıyor (geniş-sığ derinden 5–7 kat pahalı, "her şeyi öğren" kazanmıyor). Ama ana yol çok hızlı: efsane 6 oyun günü. Sokak müziğinin ×1,5 tavanı 36 saatlik eğitimle açılıyor. Öneri: tablo, madde 4–5.

## 4. Tempo ve plaklar

**Bir yayının ömür boyu grup geliri** (gerçek `weeklyUnits`, İstanbul merkezli rock grubu, radyo ve klip hariç; single maliyeti $420, 8 şarkılık albüm $3.060):

| Şöhret | Kalite | Single geliri (kâr) | Albüm geliri (kâr) | Albüm ilk ay |
|---|---|---|---|---|
| 3 | 45 | $531 (+111) | $1.747 (−1.313) | $632 |
| 10 | 45 | $797 (+377) | $2.620 (−440) | $916 |
| 20 | 45 | $1.244 (+824) | $4.070 (+1.010) | $1.410 |
| 35 | 65 | $2.540 (+2.120) | $8.267 (+5.207) | $2.825 |
| 55 | 45 | $3.120 (+2.700) | $10.179 (+7.119) | $3.460 |
| 80 | 65 | $5.879 (+5.459) | $19.108 (+16.048) | $6.455 |

- Simülasyondaki recorder 30 günde $2.200 kayıt+baskı harcadı, $965 satış aldı. 90 günde satış $11.585, konser $509.208: **plaklar gelirin %2'si.**
- **Takvim:** 112 günde en fazla 4 single + 1 albüm = 20 şarkı; yorgunluk penceresiyle aynı sürede 37 iyi şarkı yazılabilir. Yazılan şarkıların ~%45'i hiç yayınlanamaz.
- **Bekletiyor mu?** Hayır. Recorder'ın boş saati 30 günde ortalama 2,3 saat; bekleme süresine 62 kez takıldı ama her seferinde mesai ya da konserle doldurdu. Dinlenme payı bütün müzisyenlerde %44–45 (enerji gereği, tempo değil).

**Hüküm: sorun (ekonomik).** Tempo içerik tüketimini yavaşlatıyor ve oyuncuyu bekletmiyor (bu kısım dengeli). Ama plaklar paraya etkisiz, ancak şöhret 20'den sonra kâra geçiyor. Konser gelirine göre 5–10 kat küçük. Öneri: madde 9.

## 5. Konser sonucu dağılımı

**Gerçek konserler (simülasyon, medyan):** bar kalite 35–40, kulüp 37–46, salon 43–50, stadyum 44–54. Kalite sahneyle neredeyse hiç artmıyor; şöhret artışı salonda +2,0, stadyumda +1,8 (bar +1,1).

**Etken ablasyonu (Monte Carlo, kalite ortalaması / şöhret artışı):**

| Etken | Yeni + 3 kiralık (bar) | Orta grup (kulüp, şöhret 25) | Güçlü (salon, 55) | Yıldız (stadyum, 85) |
|---|---|---|---|---|
| taban | 39,7 / 1,17 | 52,3 / 1,67 | 67,8 / 3,33 | 84,3 / 3,92 |
| setlist sırası (en iyisi sonda) | +0,4 | +0,4 | +0,4 | +0,5 |
| alt tür sahne şehrinde | +5,1 / +0,30 | +5,2 / +0,28 | +5,3 / +0,40 | +5,6 / +0,38 |
| niş alt tür büyük sahnede | 0 | 0 | −3,0 | −3,2 |
| set bonusu (+3 sahne) | 0 | +0,3 | +0,4 | +0,4 |
| tür uyumu (+3 enstrüman) | +0,2 | +0,6 | +0,7 | +0,8 |
| en iyi dükkân eşyası (+12/+10) | +0,7 | +3,2 | +3,6 | +3,9 |
| 6 sis makinesi (+12, $480) | +12,1 / +0,72 | +12,0 / +0,62 | +12,0 / +0,83 | +11,8 / +0,78 |
| ses teknisyeni (+3) | +3,1 | +3,0 | +3,1 | +3,1 |
| basın sıcak (60), şöhret | +0,14 | +0,26 | +0,57 | +0,52 |
| güvenli bis | +0,5 / +0,07 | +1,1 / +0,14 | +1,1 / +0,25 | +1,0 / +0,27 |
| cesur bis | −1,2 / −0,05 | +1,7 / +0,28 | +2,2 / +0,58 | +2,4 / +0,69 |
| 3 sahne olayı | (nitelikli olay yok) | +4,8 / +0,25 | +8,6 / +0,60 | +10,0 / +0,66 |

- **Dominant strateji:** her profil için nitelikli olayların bütün ≤3'lü alt kümeleri × 3 bis seçeneği tarandı (192–360 plan). Kulüp, salon ve stadyumda en iyi 5 planın hepsi "3 olay + cesur bis". En kötü 3 plan hep "olaysız, bissiz". Eşikteki her olayın beklenen değeri pozitif (banter +0,35 … singalong +0,7; yalnız stage_dive −0,05), eşik +25'te +1,9 … +5,5. Seçim yok, reçete var. Yeni oyuncuda en iyisi güvenli bis; tek başına oyuncuda cesur bis zarar (kalite < 40).
- **Tür popülerliği:** aynı grup, aynı şehirde en sevilen ve en az sevilen tür: seyirci ve gelir ×2,1 (salonda İstanbul pop $8.074, country $3.753), şöhret ×1,3.
- **EFSANEVİ gece:** yalnız stadyumda görülüyor, %0,3–4.
- **Sahne efekti:** en ucuz +12, 6 sis makinesiyle $480. Kulüpte gelirin %42'si, salonda %7'si: salondan sonra her konserde alınması gereken bir vergi.

**Hüküm: sorun.** Alt tür sahnesi ve sahne olayları gerçek etkenler. Set bonusu, tür uyumu ve setlist sırası pratikte sıfır. Bis ve olaylarda risk yok. Efekt tavanı ucuz. Öneri: madde 6.

## 6. Kayıp sistemleri (DECAY ve AGING açık)

| Sistem | Ölçülen | Aktif oyuncuya etkisi |
|---|---|---|
| Aşinalık çürümesi | 80 → 12. gün 80, 20. gün 68, 30. gün 53, 54. gün 15 (taban) | Yok: grinder'ın 8 şarkısının ortalaması 30. günde 56; konserde çalınan şarkı çürümüyor |
| Şöhret azalması | 60 → 54. güne kadar 60, 60. gün 56,5, 90. gün 41,9, 120. gün 31 | Yok: 54 gün o şehirde hiç çalmamak gerekiyor |
| Üye ayrılması | 31 → 29,2 (−%6) | Küçük |
| İptal cezası (kulüp, şöhret 20) | hemen −0,6; 12 sa sonra −1,0; 23 sa sonra −1,4 (101 bilet, skandal yok) | Bir kulüp konserinin kazancı (+1,3) kadar: makul |
| Bağımlılık | 6 × $800 piroteknikle bağımlı (düşkünlük 18); 11 saatte bir $6 çorba: 72 saatte 0 saat "canı çekiyor"; çorbasız 48 saatin 35'i | Göz ardı edilebilir; 5 günde kendiliğinden bitti |
| Skandal (mahkûmiyet) | scammer 30 günde medyan 42 mahkûmiyet, yine +$2.041 suç geliri | Ceza tekrarlayan suçluda artmıyor; şöhreti olmayan oyuncuya skandal vız gelir |
| Kötü konser moodlet'i, felaket skandalı | simülasyonda görülmedi (kalite hep 20'nin üstünde) | — |

**Hüküm: sorun.** Kayıp sistemleri yalnızca oyunu bırakanı cezalandırıyor. Oynayan için tek gerçek kayıp iptal cezası.

## 7. Sömürü avı

**Kanıtlı açıklar (betikler `scripts/balance/exploits/`, her biri kendi dünyasını kurar):**

| Yol | Ölçüm | Oyun günü başına üst sınır | Yeni hesap kısıtı atlatılıyor mu? |
|---|---|---|---|
| **Takas rotasyonu** (`trade-rotation.ts`) | A → B'ye gitar_3 $5.000 karşılığı; gitar B → C → A, aynı saat; 4 döngü +$20.000; doğrudan iade `item_recently_yours` ile reddediliyor | Sınırsız (yalnız ek hesapların parasıyla sınırlı), kayıpsız | Hayır (72 saat kapısı `account_too_new` ile tutuyor), sonra serbest |
| **IP kayıt sınırı** (`ip-limit.ts`) | aynı başlık: 3 kabul, 3 × 429; farklı `cf-connecting-ip`: 6/6 kabul | Sınırsız hesap | Evet, sınır tamamen |
| **Ek hesap çiftliği** (`alt-farm.ts`, 20 tohum, 40 bot) | mesai: 72. saatte $1.255, sonra günde $216; sokak: $1.032, sonra günde $222 | Hesap başına $500 başlangıç + ~$760 (ilk 72 saat) + günde ~$220 | 72 saatte para birikir, sonra rotasyonla taşınır |
| **İşletme kasası** (`business-staff.ts`) | çalışan saat başı kasaya net: İstanbul +$16,7 (işletmecilik 0), +$26,7 (100); New York +$50,7 | 5 ek hesap + sahip: $1.650 / $2.670 / $5.078 net; geri ödeme 12 / 7,5 / 7 gün | İş teklifi 72 saat kapılı |
| **Özel ders** (`teacher-cap.ts`) | 3 öğrenci × 4 sa × $120: öğrenciler $1.440 ödedi, öğretmen $384 + $16 + $0 = $400; ertesi gün yine $384 | $400/öğretmen/gün (taşıma) | İki taraf da kapılı. Tavan sonrası ödenen para oyundan çıkıyor; öğretmen bu sırada okulda kendisi de ders alabiliyor |
| **Bakım gideri kaçağı** (`childcare-bank.ts`) | 2 çocuk, 4 hafta: cebinde tutan $160 ödedi, bankada tutan $0 (ve $9 faiz aldı), yalnız "Aile bütçesi" moodlet'i | Gider bütünüyle isteğe bağlı | — |
| **Takılma pompası** (`hangout-pump.ts`) | 24 saat, dinlenmeden: 1 ek hesap ruh hâli 40 → 58, 3 → 94, 5 → 100 ve ilham 78 (+12 şarkı kalitesi) | 4 saatte bir, her ek hesapla | Takılmada yeni hesap kısıtı yok |
| **NPC'den bar payı** (`npc-bar-share.ts`, 14 gün, pay %30) | NPC konserleri oyuncu barında: İstanbul 1, Berlin 4, Londra 3; günde $7 / $43 / $53 basılmış para | Bar başına ~$50/gün (bar gideri $50–70/gün) | — |

**Formül sınırları (`formulas.ts`):** hesap başına tek seferlik başlangıç $500, rehber $305 (net ~$0), zincirler en fazla $2.130; haftalık görev en fazla $180 (beklenen ~$121); banka faizi en fazla $150/hafta; NPC tüccar 2 satış/gün, en iyi marj $60 (LED kostüm) → en fazla $120/gün; plak şirketi avansı min($5.000, 100 × şöhret). Ek hesabın şirketiyle ana hesabın grubu satıştan birlikte %66 alıyor (şirketsiz %50): +%32, ama kuruluş $30.000 ve haftada $400 gider.

**Dengeli bulunanlar:** öğretmen tavanı tutuyor; NPC tüccar para basmıyor (zanaatçı 30 günde malzemeye $3.135 verip $3.316 aldı); hediye ve pazar da para taşıyor ama pazar %5 kesiyor ve takas daha iyi; tek gecelik macera para, beceri ya da eşya vermiyor.

**Hüküm: sorun (kritik).** Takas rotasyonu ve IP başlığı birlikte, sınırsız sayıda ek hesabın parasını kayıpsız ana hesaba taşıyor. En küçük yeniden üretimler: `scripts/balance/exploits/trade-rotation.ts` ve `ip-limit.ts`.

## 8. Olasılık tabloları (Monte Carlo, 20.000 deneme)

**Bilinçli deneme** (her 3 günde bir, %25, 20 gün hamilelik, taşıyana 30 gün bekleme, çift başına 4 çocuk):

| | İlk çocuk (gün) | 4. çocuk (gün) | 56. gün | 112. gün | 224. gün |
|---|---|---|---|---|---|
| hep aynı kişi taşıyor | 26 [20, 44] | 203 [182, 233] | 0,98 | 1,94 | 3,83 |
| ikisi de taşıyabiliyor | 26 [20, 41] | 103 [85, 130] | 1,85 | 3,65 | 4,0 |

**Korunmasız macera** (%1,5, aynı ikiliyle 7 günde 1, günde 1): tek eşle hamileliğe medyan 315 gün [49, 1.085]; 7 eşle dönüşümlü 45 gün [6, 153].

**Macera sonuçları:**

| Durum | Pişmanlık | Dedikodu | Aldatma ortaya çıkar | Beklenen şöhret kaybı |
|---|---|---|---|---|
| bekâr, tanınmıyor | %25 | — | — | 0 |
| bekâr, yerel yıldız | %25 | %30,5 | — | −0,15 |
| sevgili başka şehirde | %100 | — | %35 | 0 |
| sevgili aynı şehirde | %100 | — | %55 | 0 |
| sevgili aynı şehirde, yerel yıldız | %100 | %30 | %64 | −0,15 |

**Bakım gideri:** ebeveyn başına çocuk başına haftada $20 × şehir; İstanbul'da günde $2,86, 4 çocukta $11,4 (grinder'ın günlük gelirinin %3'ü). Bir çocuğun 18 yaşına kadar toplam gideri $5.760 (New York $10.368). Ödeyen ebeveyn haftalık +6 ruh hâli ve +3 ilham da alıyor.

**Hüküm: dengeli (küçük açıklar).** Oranlar tasarımla tutarlı. Sınır **çift başına**, karakter başına değil: farklı eşlerle sınırsız çocuk. Bakım gideri caydırıcı değil ve bankayla kaçılıyor (§7).

## 9. Metin çeşitliliği (200 sentetik konser, gerçek `gigReview`)

| | Cümle | Farklı kalıp | Tekrar oranı | 10. konserden sonra yeni cümle | Hiç yeni cümlesi olmayan eleştiri | Tamamen farklı eleştiri |
|---|---|---|---|---|---|---|
| tek şehir (İstanbul) | 587 | 61 | %89,6 | %8,1 | %80 | 183/200 |
| 5 şehir dönüşümlü | 575 | 68 | %88,2 | %9,5 | %78 | 177/200 |

Yeni kalıpların dağılımı (5 şehir): ilk 10 konserde 16, 10–25'te 16, 25–50'de 12, 50–100'de 9, 100–150'de 13 (yeni kalite basamağına geçince), 150–200'de 2. Eleştirilerin tamamı nadiren aynı (yer tutucular ve kombinasyon sayesinde) ama okuyan oyuncu aynı cümleleri görüyor.

**Hüküm: sorun (orta).**

## 10. NPC'ler ve boş dünya (0 oyuncu, 60 gün, 20 tohum)

| Gün | Şöhret yeni / yerel / yıldız (ev şehri) | Konser | Single / albüm | Dünya single / albüm listesi | Şehir single listesi | Tüccar ilanı | Seçim (NPC kazandı) | Haber | NPC parası |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 9,3 / 29,8 / 58,4 | 61 | 68 / 0 | 0 / 0 | — | 90 | 0 | 0 | $0,2 M |
| 7 | 13,4 / 35,6 / 63,8 | 229 | 68 / 0 | 0 / 0 | — | 90 | 0 | 0 | $0,7 M |
| 15 | 18,1 / 43,5 / 71,8 | 477 | 68 / 0 | 20 / 0 | 15 şehir, ort. 13,6 | 90 | 90 (90) | 0 | $1,7 M |
| 30 | 18,1 / 44,1 / 72,2 | 942 | 68 / 0 | 20 / 0 | 13,6 | 90 | 180 (180) | 0 | $3,6 M |
| 60 | 18,0 / 44,1 / 72,1 | 1.870 | 136 / 0 | 20 / 0 | 20 | 90 | 360 (360) | 0 | $7,6 M |

- Dünya yaşıyor: konserler, single'lar, listeler, seçimler çalışıyor; iptal yok; şöhret bantta (bant dışı en fazla ~4 grup, yıldızlarda en fazla 76).
- **Şişme yok, donma var:** bütün NPC grupları 15. günde kendi tavanlarına (18 / 44 / 72) yapışıp orada kalıyor; liste her hafta aynı sırada.
- **Albüm listesi 112 gün boş** (NPC ilk albümü `cooldownDays × 24` sonra çıkarıyor).
- **Muhabir 60 günde 0 haber:** yalnız kalitesi 60'ı geçen *oyuncu* konserlerini yazıyor; boş dünyada gazete boş.
- **Tüccar:** her şehirde 6 ilan (ortalama $1.916, dükkân fiyatının %85'i); kimse almazsa 60 gün boyunca hiç değişmiyor. Oyuncu pazarını ezmiyor: fiyatı dükkândan ucuz ama oyuncunun ikinci el ilanı da dükkân fiyatının altındaysa (geri satış %50) rekabet ediyor. Etki oyuncu sayısı olmadan ölçülemedi.
- **NPC yıldızları stadyuma çıkamıyor** (tavan 72 < 75): boş dünyada stadyumda hiç konser yok.

**Hüküm: belirsiz/düşük.** Para basımı oyunculara yalnız oyuncu barlarındaki NPC konseri payıyla sızıyor (§7, ~$50/gün/bar). Diğer sorunlar içerik donukluğu.

---

## Ölçülemeyenler

- **Gerçek oyuncu davranışı:** botlar 7/24 oynar; gerçek oyuncuyla süreler 2–3 kat uzar. Oyuncular arası pazar talebi (kimin neyi kaça alacağı) simüle edilmedi.
- **Festival seçimi, turne tamamlama, radyo ve klip etkisi:** botlar festivale başvurmadı, turne ve klip yapmadı. Plak geliri radyo/klip artışı olmadan hesaplandı (en fazla +%15 + %15).
- **VIP ve siyaset:** VIP para gönderme ($5.000/gönderim, adet sınırı kodda görülmedi) API ile denenmedi. Makam maaşları oyuncu adayla ölçülmedi.
- **Plak şirketi avansı ve sözleşme API akışı:** yalnız formül (`labelSplit`) ile ölçüldü; ek hesap şirketinin avansı API'de denenmedi ($30.000 kuruluş).
- **Hediye rotasyonu:** aynı `returnsTooSoon` kuralını kullandığı için takasla aynı açığa sahip olmalı. Kodla gösterildi, betikle çalıştırılmadı.
- **Tek gecelik macera ve deneme uçtan uca:** API ile değil, sunucunun sabitleriyle Monte Carlo yapıldı.
- **Polis oyuncular:** soruşturma ve oyuncu yargıç yoktu; suç yakalanma oranı yalnız NPC yedek yargıçla ölçüldü.
- **Yaşlanma:** 35 yaş 952. oyun gününde; 90 günlük simülasyon yaşlanma etkisine ulaşmadı.
- **Kalıcı ölüm** (`PERMADEATH`) kapalı bırakıldı.

## Nasıl çalıştırılır

```
createdb -h 127.0.0.1 -U postgres rifftown_sim
createdb -h 127.0.0.1 -U postgres rifftown_sim2
npm install
npm run balance                     # her şey (~2,5 saat, 2 çekirdek)
BALANCE_ONLY=mc npm run balance     # yalnız Monte Carlo (veritabanı gerekmez, ~3 dk)
BALANCE_ONLY=exploits BALANCE_DBS=rifftown_sim npm run balance
BALANCE_SEEDS=5 BALANCE_RESUME=1 npm run balance   # daha az tohum / yarıda kalanı sürdür
```

- Tek sömürü: `BALANCE_DB=rifftown_sim npx tsx scripts/balance/exploits/trade-rotation.ts`
- Tek tohum: `BALANCE_DB=rifftown_sim npx tsx scripts/balance/sim-economy.ts 3 30 economy`
- Betik `rifftown` ve `rifftown_test` veritabanlarını reddeder. Çıktılar `scripts/balance/out/`; `summary.json` raporun kaynağıdır (`aggregate.ts`).
- Ölçüm kodunun commit'i: `d391119` (dal `claude/balance-sim`, `bfb4248` üstüne; rapor, `summary.json` ve küçük ölçüm çıktıları bir sonraki commit'te). Oyun kodu ve sabitleri değiştirilmedi. Ölçümler `bfb4248` kurallarıyla yapıldı; `main` (ef5f0f7) yalnız yönetim paneli eklediği için geçerli.
