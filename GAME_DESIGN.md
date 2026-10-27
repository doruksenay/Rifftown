# Rifftown: oyun tasarımı (MVP)

Rifftown, Popmundo'dan ilham alan, gerçek zamanlı ilerleyen online bir müzik kariyeri yaşam simülasyonu. Oyuncu bir eylem başlatır (çalışmak, prova, seyahat…), uygulamayı kapatır; dünya o yokken de işler ve bitince telefonuna bildirim gelir.

Bu belgedeki tüm sayılar `packages/shared/src/` altında tek yerde tanımlıdır. Dengeyi değiştirmek için oradaki sabitleri düzenlemen yeter; sunucu ve uygulama aynı değerleri kullanır.

## Çekirdek döngü

1. Beceri kazan: kendi kendine çalış (ücretsiz) ya da müzik okulunda ders al (ücretli, 2,2 kat verimli).
2. Para kazan: şehirdeki iş yerlerinde mesaiye kal.
3. Şarkı yaz: kalite söz yazarlığı becerisine bağlı.
4. Grup kur ya da bir gruba katıl. Tek başına da olur.
5. Prova yap: şarkılara aşinalık kazan.
6. Konser ver: seyirci şöhrete, kalite hazırlığa bağlı. İyi konser şöhret ve para getirir.
7. Şöhret arttıkça daha büyük sahneler açılır, başka şehirlere turneye çık.

## Karakter

| Değer | Başlangıç | Açıklama |
|---|---|---|
| Para | $500 | Tek para birimi |
| Ruh hâli | 80 / 100 | Çalışma verimini ve konser performansını etkiler (%0'da ×0,6, %100'de ×1,0) |
| Sağlık | 100 / 100 | 15'in altında çalışma, iş, şarkı yazma ve prova yapılamaz. Verime etkisi: %0'da ×0,5 |
| Beceriler | Seçilen enstrümanın temel becerisi 20, kendisi 12; beste, söz ve şovmenlik 5; sevilen tür 10 | 0–100 arası; yükseldikçe artış yavaşlar |

## Oyuncunun gördüğü: sayı yerine kelime

Sunucu her şeyi sayıyla hesaplar ve saklar; oyuncu kelimeleri görür. Ölçekler `packages/shared/src/tiers.ts` dosyasındadır; uygulama, push bildirimleri ve eleştiriler aynı kelimeleri kullanır.

Kesin sayılar VIP avantajıdır (Popmundo'daki gibi). VIP üyeler kelimenin yanında sayıyı da görür ("amatör 37,3"). VIP olmayan oyunculara sunucu her değeri bulunduğu seviyenin içinde dörtte birlik adımlara aşağı yuvarlayarak gönderir: seviye adı ve ilerleme çubuğu doğru kalır, kesin sayı API'den bile okunamaz. Oyundaki bütün eşikler (mekân şöhret şartları, meslek ve makam şartları, öncül beceriler, düşük ruh hâli ve sağlık sınırları) seviye sınırlarına denk gelir, bu yüzden yuvarlanmış değer uygulamadaki kontrollerden de doğru geçer. Yöneticiler sayıları her zaman görür.

| Ölçek | Seviyeler (eşik) |
|---|---|
| Kalite (şarkı, konser) | berbat 0 · zayıf 10 · vasat 20 · fena değil 30 · iyi 40 · çok iyi 50 · harika 60 · muhteşem 70 · olağanüstü 80 · **DESTANSI** 90 |
| Beceri | hiç bilmiyor 0 · acemi 5 · çırak 15 · amatör 30 · yetenekli 45 · usta 60 · virtüöz 75 · efsane 90 |
| Aşinalık | sözlerini bilmiyor 0 · kabaca biliyor 20 · rahat çalıyor 45 · ezbere biliyor 70 · uykusunda çalar 90 |
| Şöhret | kimse tanımıyor 0 · mahallede bilinir 5 · şehirde konuşuluyor 15 · yerel yıldız 30 · şehrin gözdesi 45 · süperstar 75 |
| Ruh hâli | bunalımda 0 · keyifsiz 25 · normal 45 · neşeli 70 · coşkulu 90 |
| Sağlık | yatağa düşmüş 0 · hasta 15 · yorgun 40 · iyi 70 · zinde 90 |

En üst kalite seviyesi büyük harfle (DESTANSI / EPIC), diğerleri küçük harfle yazılır. Renkler: düşük seviyeler soluk, orta seviyeler mürekkep, üst seviyeler pembe; DESTANSI ana ekrandaki bilet gibi iki mürekkeple basılır. Ruh hâli ve sağlıkta düşük seviyeler tehlike rengindedir.

Beceri ya da şöhret bir üst kelimeye geçince ayrı bir bildirim gelir ve uygulamada küçük bir kutlama ekranı açılır ("Artık usta bir gitaristsin!"). Çalışma sonuçları da kelimeyle anlatılır ("Elektro gitar: biraz gelişti").

## Beceri ağacı (Popmundo tarzı)

Bir beceriyi geliştirmek için önce onu açmak gerekir: oyunun kitapçısından kitabını almak ya da bazı ileri beceriler için müzik okulunda ilk dersi almak. Bazı beceriler bir temel beceride en az belli bir seviyeyi şart koşar.

| Kategori | Beceriler |
|---|---|
| Enstrümanlar | Temel şan → Solo vokal · Temel telli çalgılar → Elektro gitar, Bas gitar, Keman · Temel vurmalı çalgılar → Davul, El perküsyonu · Temel klavyeli çalgılar → Klavye · Temel nefesli çalgılar → Saksofon |
| Müzik | Temel beste · Temel söz yazımı · Doğaçlama (okulda, temel bestede en az amatör) · Kayıt yapımcılığı (temel bestede en az çırak) |
| Sahne | Temel şovmenlik · Profesyonel şovmenlik (okulda, şovmenlikte en az amatör) · Temel dans · Seyirci farkındalığı (şovmenlikte en az çırak) |
| Müzik türleri | Pop, Rock, Hip-hop, Elektronik, Metal, Caz, Anadolu rock |
| Sokak | Sokak kurnazlığı → Gizlilik → Kilit açma (her biri bir öncekinde en az çırak; okulda öğretilmez) |

Ok işaretli asıl enstrüman becerileri için temel becerinin en az "çırak" olması gerekir.

**Grup rolleri (8):** vokal, gitar, bas, davul, klavye ve yeni üç rol: saksofon, keman, perküsyon. Rol listesinin tek kaynağı `world.ts` `INSTRUMENTS`; dükkân rafları, eşya yuvaları, atölye tarifleri, rol becerisi, kiralık müzisyen ve bütün doğrulamalar buradan türer. Yeni roller karakter açarken ana enstrüman olarak da seçilebilir. Festival ve oyunun gruplarında eksik kalan roller yalnızca temel beş rolden (`CORE_ROLES`) kiralık müzisyenle doldurulur; nefesli, yaylı ve perküsyon isteğe bağlıdır (lider konser ayarlarken kiralayabilir). Veritabanında rol ve eşya yuvası için kısıt olmadığından yeni rol migration gerektirmedi. Oyunun grupları yeni rolleri kullanır (ör. Isar Kammerensemble keman, Pigalle Swing saksofon, Rhône Riddim perküsyon); veri dosyasında rol değişirse yönetmen kadroyu eşitler. Kitap fiyatları: temel beceriler $40, asıl enstrümanlar $80, türler $30, dans $50, seyirci farkındalığı $60.

Becerilerin etkisi:

- Rol becerisi = 0,75 × asıl enstrüman + 0,25 × temel beceri
- Sahne puanı = 0,45 × şovmenlik + 0,25 × profesyonel şovmenlik + 0,15 × dans + 0,15 × seyirci farkındalığı
- Şarkı yazma puanı = 0,45 × beste + 0,35 × söz + 0,2 × o türün becerisi
- Tür becerisi aşinalığı sınırlar: bir şarkı en fazla 50 + tür becerisi ÷ 2 kadar öğrenilebilir. Türü hiç bilmeyen biri şarkıyı yarı yarıya öğrenir (Popmundo'daki gibi).
- Doğaçlama, provalarda öğrenme hızını en fazla %50 artırır.
- Provalar ve konserler, ilgili bilinen becerileri kendiliğinden biraz geliştirir.

## Eylemler (oyun saati)

Bir karakter aynı anda tek eylem yapar. Süreler oyun saatidir; gerçek süre = oyun saati ÷ `GAME_SPEED`.

| Eylem | Süre seçenekleri | Ruh hâli / saat | Sağlık / saat | Ücret |
|---|---|---|---|---|
| Kendi kendine çalışma | 1, 2, 4 | −3 | −0,5 | Ücretsiz |
| Okulda ders | 1, 2, 4 | −3 | −0,5 | $30 × şehir çarpanı / saat |
| Mesai | 2, 4, 8 | −4 | −1 | İş yerinin saatlik ücreti kadar kazanç |
| Dinlenme | 1, 2, 4, 8 | +15 × (1 + sanat bonusu) | +3 | Ücretsiz |
| Şarkı yazma | 2 | −2 | 0 | Ücretsiz |
| Prova (stüdyoda) | 1, 2, 4 | −3 | −0,5 | $20 × şehir çarpanı / saat |
| Tedavi (hastanede) | 1, 2, 4 | +2 | +20 | $40 / saat (her yerde aynı) |
| Seyahat | mesafeye göre | −2 | −1 | Otobüs / uçak ücreti |

Ruh hâli 25'in altındayken dinlenme ve tedavi dışındaki her saat sağlıktan fazladan 2 puan götürür.

Bir eylem erken bitirilebilir (seyahat hariç). Sonuç geçen süreyle orantılı uygulanır, ücret iade edilmez.

### Formüller

- Çalışma artışı = saat × (okulda 2,2, değilse 1) × (1 − beceri / 110)² × ruh hâli çarpanı × sağlık çarpanı × (1 + enstrüman bonusu × 2 / 100) × odak. Azalan getirinin üssü 1'di (eskiden okulda 12'den efsaneye 104 oyun saati, 6 gün); şimdi 2 (bütün beceri artışları aynı eğriyi kullanır: ders, prova, konser, sokak, atölye).
- Odak: kayan 24 oyun saatinde ilk 5 saat ders ve çalışma (okul, ev, özel ders, arkadaş dersi birlikte) tam verimli, sonrası ×0,3 (`STUDY_FOCUS_HOURS`, `UNFOCUSED_STUDY_MULT`; bildirim söyler). Ölçüm (`mc-skills.ts`, günde 20 saat çalışan bot): okulda 12 → usta 60 eskiden 3 gün / 44 saat, şimdi 8 gün / 144 saat; 12 → efsane 90 eskiden 6 gün, şimdi 31 gün; en hızlı yol (profesör + okul) usta 7, efsane 28 gün. 12 → amatör 30 hâlâ 2 gün.
- Şarkı kalitesi = 15 + şarkı yazma puanı × 0,8 ± 10 (1–100 arası; `rules.ts` `songQuality`)
- Prova aşinalık artışı = saat × 12 × (1 − aşinalık / 105) × ruh hâli çarpanı × (1 + doğaçlama / 200), tür sınırına kadar

## Dünya

5 ülke, 15 şehir (her ülkenin bir festival şehri var, kalın yazılı):

| Ülke | Şehirler |
|---|---|
| Türkiye | **İstanbul**, Ankara, İzmir |
| Almanya | **Berlin**, Hamburg, Münih |
| Birleşik Krallık | Londra, **Manchester**, Liverpool |
| Fransa | **Paris**, Lyon, Marsilya |
| ABD | New York, Los Angeles, **Nashville** |

Her şehrin bir hayat pahalılığı çarpanı (iş ücretleri, okul/stüdyo fiyatları, bilet gelirleri) ve türlere göre popülerlik tablosu var. Örneğin Berlin'de elektronik, İstanbul'da pop ve Anadolu rock daha çok seyirci çeker.

Her şehirde aynı mekân türleri bulunur:

| Grup | Mekânlar |
|---|---|
| Konser | bar, kulüp, konser salonu |
| Büyük sahneler | stadyum (20.000 kişi, "süperstar" şöhreti), festival alanı (sadece festival şehirlerinde) |
| Öğrenme | müzik okulu, prova stüdyosu, kayıt stüdyosu, üniversite |
| İş | 1–2 sıradan iş yeri |
| Dükkânlar | müzik mağazası, sahne butiği, sanat galerisi, kitapçı, oto galeri, pet shop, hırdavat ve atölye, sahne ekipmanı dükkânı, bit pazarı |
| Sağlık ve yaşam | hastane, emlakçı, banka, otel, restoran, spor salonu, dövme stüdyosu |
| İşletmeler | 2 bar ve 2 restoran ruhsatı (oyunculara satılık) |
| Kamu ve iş dünyası | belediye, emniyet müdürlüğü, adliye, iş merkezi, gazete, ibadethane |
| Açık alan | park (sokak müziği) |

### Şehir kimliği

Mekân türleri her şehirde aynı kalır (oyuncu her şehirde ne bulacağını bilir); şehirleri ayıran veri `packages/shared/src/content/cities.ts` içindedir. Her şehrin:

- **İmza türü ve şehir başarımı** (15 başarım, "Şehirler" kategorisi): o şehirde imza türde en az "iyi" (40) kalitede bir konser. Ör. İstanbul Anadolu rock ("Boğazın sesi"), Berlin elektronik ("Kapıdan geçtin"), Nashville country ("Music Row sahnesinin yeni sesi").
- **Haftalık etkinliği:** oyun haftasının belli bir gününde (ör. İstanbul'da Boğaz Psikedelik Gecesi, Londra'da Camden Punk Cumartesisi, Münih'te Residenz Oda Konseri) uyan türlerdeki konserlere ×1,1 seyirci. Şehir sekmesinde etkinliğe kaç oyun günü kaldığı görünür.
- **Yerel lezzeti:** yalnızca o şehrin restoranlarında (balık ekmek, boyoz, currywurst, fish and chips, bouillabaisse, hot chicken...); günün yemeğinden biraz iyi, şefin menüsünü geçmez (+22 enerji). 15'inin hepsini tatmak "Dünya mutfağı" başarımı.
- **Nadir eşyası:** yalnızca o şehrin dükkânında satılır ve tür uyumludur (elektro bağlama, Mittenwald kemanı, manuş caz gitarı, Brooklyn breakbeat seti...); merdivenin ara basamağındadır.
- **Yerel efsanesi:** şehir sekmesinde bir cümlelik hikâye. Konser eleştirileri de şehre özgü renk cümleleri kullanır (bkz. "Konser eleştirisi").

### Seyahat

- Otobüs: aynı kıtada ve 2.500 km'ye kadar. Süre mesafe ÷ 70 km/sa, ücret $10 + km × 0,03.
- Uçak: her yere. Süre 1,5 + mesafe ÷ 750 saat, ücret $80 + km × 0,09.
- Kendi aracınla: otobüsün gittiği her yere. Süre otobüs süresi ÷ aracın hız katsayısı (1,3 – 2,2), ücret sadece benzin (km × 0,015). Kuşanılmış araç kullanılır.
- Yoldayken karakterin şehri yoktur; şehir sohbeti ve mekânlar kapalıdır.

## Oyunun kendi dükkânları

Fiyatlar her şehirde aynıdır. Dükkâna geri satış fiyatın %50'si.

| Dükkân | Ürünler | Etki |
|---|---|---|
| Müzik mağazası | Her enstrüman için (saksofon, keman ve perküsyon dahil 8 rol) 3 seviye ($150 / $900 / $4.000) | Konserde rol becerisine +3 / +7 / +12; o beceride çalışma verimine +%6 / +%14 / +%24 |
| Sahne butiği | Tişört ve kot ($80), deri ceket ($500), tasarım kostüm ($2.500) | Konserde sahne performansına +2 / +5 / +10 |
| Sanat galerisi | 4 eser ($120 – $8.000) | Dinlenme verimine +%5 – +%25 (toplam en fazla +%40) |
| Kitapçı | Beceri kitapları ($30 – $80) | Beceriyi açar |
| Hastane | Tedavi | Saatte +20 sağlık |
| Oto galeri | Hatchback ($2.500), motosiklet ($4.500), aile sedanı ($9.000), turne minibüsü ($16.000), spor coupe ($28.000), klasik cabrio ($60.000, VIP) | Ülke içinde otobüsten 1,3 – 2,2 kat hızlı yolculuk |
| Pet shop | Kedi ($250), köpek ($400), papağan ($700), Bengal kedisi ($4.000, VIP) | Dinlenmeye +%6 – +%15 |
| Sahne butiği (ek) | Gümüş ($800) ve pırlanta ($5.000) nişan yüzüğü | Evlilik teklifi için |
| Sahne ekipmanı | Sis makinesi, konfeti, ışık şovu, piroteknik ($80 – $800) | Konser ayarlarken seçilir, konserde harcanır; kaliteye +2 – +6. Her efekt türü bir kez sayılır, en güçlüsü tam, sonrakiler yarım, çeyrek…; toplam en fazla +6 (eskiden +12: 6 sis makinesi $480'a +12 veriyordu) |
| Hırdavat | Atölye malzemeleri ($20 – $90), 10 renk sprey boya ($35) | Üretim ve boyama |

Her enstrüman türünden, kıyafetten, araçtan ve evcil hayvandan bir tanesi "kullanımda" olur. Sanat eserlerinin hepsi birlikte etki eder. Malzeme, sprey ve efektler yığılabilir (5'li alınabilir).

### Boyama ve isim verme

Enstrüman, kıyafet ve araçlar sprey boyayla 10 renge boyanabilir (sprey harcanır). Enstrüman, kıyafet, araç, evcil hayvan ve sanat eserine 2–24 harflik bir isim verilebilir ("Pembe Fırtına (Sahne gitarı)"). İsimler küfür filtresinden geçer. Renk ve isim eşyayla birlikte el değiştirir.

### İkinci el pazarı

Her şehrin bit pazarında oyuncular eşyalarını ilana koyar; fiyat en fazla dükkân fiyatının iki katı olabilir (EFSANEVİ eşyada beş katı). Satıştan %5 komisyon kesilir, kalan satıcıya gider ve satıcıya bildirim düşer. İlandaki eşya kullanılamaz, kuşanılamaz, hediye edilemez ya da dükkâna satılamaz; ilan geri çekilebilir. Kişi başı en fazla 20 ilan. VIP eşyaları sadece VIP üyeler satın alabilir. Boya, isim ve atölyede üretilen eşyaların özel bonusu satışta korunur.

### Atölye (zanaat)

Hırdavatçının atölyesinde malzemelerden enstrüman (gitar, bas, davul, synthesizer, mikrofon, saksofon, keman, konga) ya da sahne kostümü üretilir. Yeni malzemeler: pirinç gövde, saksofon kamışı, keman yayı. Üretim 4 saat sürer. Bonus el işçiliği becerisine bağlıdır: acemi biri dükkânın ilk seviyesine yakın (+3), usta biri dükkânın en iyisini geçen (+14) eşya çıkarır. Yarıda kesilen üretimde malzemeler geri verilir. Üretilen eşyada üreticinin adı yazar. Üretilen eşyalar dükkâna satılmaz, ikinci el pazarında satılır.

## Meslekler

Sıradan iş yerlerinin yanında 11 meslek var; 5'i sadece VIP üyelere açık. Bir meslekte çalışmak, o mesleğin bölgesine gidip mesai yapmaktır. Toplam çalışılan saatle terfi edilir: 0, 40, 120 ve 300 oyun saatinde 4 rütbe; ücret rütbeye göre ×1 / ×1,3 / ×1,7 / ×2,2 artar ve şehir çarpanıyla çarpılır. Meslek değiştirmek rütbeyi sıfırlar.

| Meslek | Bölge | Şart | 1. rütbe saatlik | VIP |
|---|---|---|---|---|
| Müzik öğretmeni | müzik okulu | bir enstrümanda yetenekli | $22 | |
| Ses teknisyeni | prova stüdyosu | temel bestede çırak | $18 | |
| Gazeteci | gazete | söz yazımında amatör | $20 | |
| Belediye memuru | belediye | temel ekonomide acemi | $16 | |
| Polis | emniyet | temel hukukta çırak | $24 | |
| Doktor (hastanede ücretsiz tedavi) | hastane | temel tıpta amatör | $30 | |
| CEO | iş merkezi | ekonomide yetenekli, medya ilişkilerinde çırak | $60 | ✓ |
| Gizli ajan | emniyet | hukukta amatör, retorikte çırak | $45 | ✓ |
| Özel harekât polisi | emniyet | hukukta amatör | $40 | ✓ |
| Din görevlisi (ibadethanede daha verimli dinlenme) | ibadethane | din bilgisinde amatör | $30 | ✓ |
| Yargıç | adliye | hukukta usta | $70 | ✓ |

VIP süresi biten oyuncu VIP mesleğini korur ama VIP yenilenene kadar o meslekte çalışamaz.

Meslek becerileri ("Kariyer" kategorisi): temel hukuk, temel ekonomi, temel tıp ve temel din bilgisi kitapçıda ($60); retorik ve medya ilişkileri sadece üniversitede ve sadece VIP üyelere öğretilir. Üniversite saati $40 × şehir çarpanıdır.

## Siyaset (sadece VIP)

Her şehirde üç makam vardır: belediye başkanı (günlük $600), vali ($500) ve emniyet müdürü ($450). Her makam için sürekli bir seçim dönemi açıktır; dönem 7 oyun günü sürer.

- Aday olmak ve oy vermek VIP üyelere açıktır; ikisi de o şehirde bulunmayı ister.
- Adaylık şartları: başkan için retorikte çırak; vali için ekonomide amatör ve retorikte çırak; emniyet müdürü için hukukta amatör.
- Dönem bitince en çok oyu alan makama gelir (eşitlikte önce aday olan). Aday çıkmazsa mevcut makam sahibi görevine devam eder.
- Makam sahibine her oyun günü maaşı ödenir. Belediye başkanı şehir sayfasında herkesin gördüğü bir duyuru yayınlayabilir.
- Ara sonuçları (oy sayılarını) sadece VIP üyeler görür.

## Sokak müziği

Parkta 1, 2 ya da 4 saat çalınarak bahşiş toplanır. Saatlik bahşiş ≈ min($20, (4 + rol becerisi × 0,35 + sahne puanı × 0,15) × sokak becerileri çarpanı) × şehir çarpanı. Grubu ya da parası olmayan yeni oyuncular için bir başlangıç yoludur, kariyer değil (`careers.ts`):

- Günlük azalan getiri: kayan 24 oyun saatinde ilk 4 saat tam, sonraki 4 saat yarım, sonrası çeyrek bahşiş (bildirim söyler).
- Beceri artışı saatte rol 0,08, şovmenlik 0,1 (eskiden 0,2 ve 0,3) ve sokakta yalnızca amatöre (30) kadar.
- Eskiden 30 günde sokak müzisyeni $10.527 kazanıp şovmenliğini 82'ye (virtüöz), gitarını 69'a taşıyordu; konser odaklı oyuncudan fazla (denge raporu §2–3).

## VIP üyelik

Popmundo'da olduğu gibi VIP hem konfor hem içerik erişimi sağlar.

| Avantaj | Normal üye | VIP |
|---|---|---|
| Meslekler | 6 meslek | + CEO, gizli ajan, özel harekât, din görevlisi, yargıç |
| Siyaset | izleyebilir | aday olur, oy verir, ara sonuçları görür |
| Beceriler | | + retorik, medya ilişkileri, sahneden atlama |
| Eşyalar | 3 seviye | + vintage enstrümanlar ($9.000), ünlü tasarımcı kostümü ($6.000), müze kalitesinde tablo ($20.000) |
| Sayılar | sadece kelime | kelime + kesin sayı |
| Seyirci tahmini | yok | konser öncesi tahmini aralık (başka şehirler dahil) |
| Konser raporları | 3 oyun günü | süresiz |
| Konser planlama | 24 saate kadar | 72 saate kadar |
| Para gönderme | yok | tek seferde $5.000'e kadar |
| Satış listeleri | son hafta | son 12 hafta |
| Suç başarı şansı | kelimeyle | yüzde olarak |
| Mahkeme | | yargıç olarak davalara karar verir |

Paketler (mağazada aynı kimliklerle tanımlanmalı): `rifftown_vip_1m` 30 gün, `rifftown_vip_3m` 90 gün, `rifftown_vip_12m` 365 gün. Uygulamadaki fiyatlar mağazanın yerel fiyatıdır.

Satın alma akışı: uygulama RevenueCat ile satın almayı başlatır → RevenueCat sunucunun `/api/webhooks/revenuecat` adresine bildirir → sunucu VIP süresini uzatır. Aynı bildirim iki kez işlenmez. Mağaza iadesinde VIP hemen kapanır, iade geri alınırsa yeniden açılır; normal abonelik iptalinde ödenen dönem bitene kadar VIP sürer. Yönetici panelden elle VIP verebilir.

## Kayıt, yayınlar ve listeler

Şöhret artık sadece konserden gelmez; plak satışı ve listeler uzun vadeli ikinci bir hedef sunar.

- **Kayıt:** Her şehirde bir kayıt stüdyosu vardır. Grup üyesi, repertuvardaki bir şarkıyı 4 oyun saatinde kaydeder (saatlik $50 × şehir çarpanı). Kayıt kalitesi = 0,45 × şarkı kalitesi + 0,3 × şehirdeki üyelerin ortalama aşinalığı + 0,25 × ortalama rol becerisi + kayıt yapımcılığı × 0,12, ±5 rastgelelik. Şehirde olmayan ya da cezaevindeki üyeler kayda katılamaz. Grubun her şarkı için en iyi kaydı saklanır, yeniden kaydetmek kaliteyi düşürmez.
- **Yayın:** Grup lideri kayıtlı şarkılardan yayın çıkarır. Yayının kalitesi şarkıların kayıt kalitesinin ortalamasıdır.

| | Single | Albüm |
|---|---|---|
| Şarkı | 1–2 | 6–12 |
| Baskı ücreti | $100 | $500 |
| Aynı türde iki yayın arası | 28 oyun günü | 112 oyun günü |
| Fiyat | $3,5 | $15 |
| Satış süresi | 16 liste haftası (112 gün) | 32 liste haftası (224 gün) |

- **Haftalık satış:** Liste haftası 7 oyun günüdür (bkz. "Tempo"). Hafta kapanınca her yayının her şehirdeki satışı hesaplanır: temel × (0,04 + 0,96 × (şöhret/100)^1,2) × tür popülerliği × (0,3 + kalite/100) × pazar büyüklüğü × düşüş^hafta, ±%15. Grubun hiç tanınmadığı şehirde satış olmaz; az tanındığı yerde küçük bir taban satış olur, böylece yeni gruplar da listelere girebilir. Pazar büyüklüğü pahalı ve büyük şehirlerde yüksektir. Satışlar haftadan haftaya azalır (her liste haftası single'da ~%16, albümde ~%9; günlük düşüş pacing.ts içinde).
- **Gelir:** Plak şirketi olmayan grupta satış gelirinin yarısı gruba kalır (gerisi dağıtım), grup üyeleri arasında eşit bölünür. Oyuncunun plak şirketiyle sözleşmeli grupta pay sözleşmeyle belirlenir (bkz. "Plak şirketi").
- **Listeler:** Her şehrin ve dünyanın single ve albüm listeleri ayrı çıkar (ilk 20). Şehir listesinde 1. olmak +1,6, ilk 3 +1,05, ilk 10 +0,47, ilk 20 +0,23 şöhret getirir (7 günlük haftaya göre; hafta kısalırsa orantılı küçülür, günlük ödül aynı kalır); şöhret yükseldikçe bu bonus küçülür. Listede önceki haftaya göre yükselme ve düşme gösterilir.
- 1.000 satışta altın, 10.000 satışta platin plak.
- Son haftanın listesini herkes görür; geçmiş haftaların listeleri VIP avantajıdır.

## Suç ve adalet

Polis, ajan, özel harekât ve yargıç meslekleri bu sistemle gerçek bir oynanış kazanır. Suçlar oyunun dünyasına karşı işlenir; oyuncuların parası çalınmaz.

| Suç | Nerede | Süre | Beceriler | Ganimet | Ceza |
|---|---|---|---|---|---|
| Yankesicilik | park, bar, kulüp | 1 saat | gizlilik, sokak kurnazlığı | $20–80 | 6 saat |
| Mağazadan çalma | dükkânlar, kitapçı | 1 saat | gizlilik, sokak kurnazlığı | $60–180 | 12 saat |
| Ofis soygunu | iş merkezi | 2 saat | kilit açma (en az çırak), gizlilik | $250–700 | 24 saat |

- Ganimet şehir çarpanıyla çarpılır. Başarı şansı = 0,45 + beceri ortalaması × 0,006 − zorluk × 0,01 − görevdeki polis × 0,05; %8 ile %92 arasında. Son 12 oyun saatinde emniyette mesai yapan ya da soruşturan her polis şansı düşürür. VIP üyeler şansı yüzde olarak görür, diğerleri kelimeyle (şansın düşük, yarı yarıya, şansın yüksek).
- Yeni "Sokak" beceri kategorisi: sokak kurnazlığı ($50), gizlilik ($70, sokak kurnazlığında çırak), kilit açma ($90, gizlilikte çırak) kitapçıdan alınır. Okulda öğretilmez; evde çalışarak ya da suç işleyerek gelişir. Kariyer kategorisine soruşturma ($60, temel hukukta çırak), müzik kategorisine kayıt yapımcılığı ($60, temel bestede çırak) eklendi.
- **Yakalanma:** Başarısız suç suç üstü yakalanmaktır: karakter tutuklanır, cezaevine konur ve dava açılır.
- **Faili meçhul:** Başarılı suç kayıtlara faili meçhul olarak geçer. Polis meslekleri emniyette 2 saatlik soruşturma yapabilir; son 7 oyun gününün, faili hâlâ o şehirde olan en eski faili meçhul suçunu arar. Bulma şansı = 0,35 + hukuk × 0,004 + soruşturma × 0,006 (+0,1 ajan ve özel harekât) − failin gizliliği × 0,005; %10 ile %90 arasında. Faili bulan polis tutuklar ve $120 × şehir çarpanı ikramiye alır. Soruşturma mesai sayılır (rütbe ilerler), ücreti normal mesainin yarısıdır.
- **Mahkeme:** Davaya o şehirdeki VIP yargıç hafif (×0,5), normal ya da ağır (×1,5) cezayla veya beraatle karar verir ve $150 × şehir çarpanı ikramiye alır. Yargıç 12 oyun saati içinde bakmazsa mahkeme normal cezayı kendisi verir. Mahkûmiyette çalınan para (cepte kalan kadarı) geri alınır ve sabıka sayısı artar. Beraat eden dosya kapanır, aynı suç için yeniden soruşturma açılmaz.
- **Cezaevi:** Tutukluluk karar çıkana kadar sürer. Tutukluyken ve hüküm süresince yalnızca dinlenilebilir; para da gönderilemez. Yolculuk, dükkân, mekân değiştirme, konser ayarlama yapılamaz; cezaevindeki üye konsere ve kayda çıkamaz. Hüküm giymiş mahkûm, kalan her ceza saati için $40 × şehir çarpanı kefaletle çıkabilir (tutukluyken kefalet yoktur).

## Başarımlar

110 başarım, 11 kategoride: ilk adımlar, sahnede, kayıt ve listeler, ustalık, kariyer ve siyaset, suç ve adalet, sosyal, basın ve medya, efsaneden sonra, keşifler, şehirler. Her başarımın puanı vardır (toplam 2.695); puanlar profilde görünür. Bir kısmı koddaki kurallarla, kalanı veri dosyasındaki istatistik eşikleriyle açılır (bkz. "İçerik hacmi"). 18 başarım gizlidir ve kazanılana kadar adı görünmez.

**Keşifler (14, hepsi gizli):** sayaç değil, bir anı ya da tuhaf bir durumu ödüllendirir: en fazla 3 kişilik salona çalmak, pogo çağrısını başarmak, seyircinin üstüne atlayıp yere çakılmak, tutmayan cesur bis, bir konserde 3+ sahne efekti, tek başına (3+ kiralık müzisyenle) sahne, altı türde şarkı, efsanevi enstrümana sahip olmak, beş renge boyanmış eşya, evcil hayvana ad vermek, sekiz rolün hepsinin asıl becerisi, cepte ve bankada sıfır para, şehrin muhabirinin grup hakkında haber yazması, alt türlerin şehirde çok tuttuğu bir konser.

### Para dışı ödüller

- **Ünvanlar** (`content/rewards.ts`, 16 ünvan): kozmetiktir, profilde adın altında görünür. Bir başarımdan (ör. Süperstar, Meteliksiz, Tek kişilik orkestra) ya da görev zincirinin bir adımından/seçeneğinden kazanılır. Sunucu kazanılmış ünvanı ayrıca saklamaz, başarım ve zincir kayıtlarından hesaplar; yalnızca seçili ünvan `characters.title_id` (migration 016). `GET/POST /api/titles`, başarımlar ekranında seçilir.
- **Kişiye bağlı eşyalar** (`bound`, `reward`): dükkânda satılmaz; dükkâna satılamaz, pazara konamaz, takas ve hediye edilemez, NPC tüccar ilan etmez. Bonusları aynı yuvadaki dükkân eşyalarının ara basamağıdır. Zincir ödülü olarak verilir; para karşılığı olmadığı için ek hesaplarla zincir koşturup para ya da eşya taşınamaz.

Başarımlar olaylardan değil oyuncunun istatistiklerinden hesaplanır, bu yüzden geriye dönük çalışır: sistem eklenmeden önce oynayan oyuncular da hak ettiklerini ilk girişte alır. Eylem, konser, liste haftası, yayın, tutuklama ve mahkeme kararından hemen sonra; oy verme, para gönderme ve VIP gibi diğer olaylar için en fazla dakikada bir kontrol edilir. Her yeni başarım bildirim ve kutlama ekranıyla gelir.

## Oyunun kendi grupları

Dünya gerçek oyuncu azken de canlı görünsün diye her şehirde üç yapay grup vardır: bir yeni grup, bir yerel grup ve bir yıldız. Bunlara ek olarak her türün (yeni yedi tür ve Anadolu rock dahil) en az üç grubu, türün sevildiği şehirlerde yaşar (ör. punk Londra, Berlin ve Hamburg'da; country Nashville ve Los Angeles'ta; klasik Münih, Paris ve Ankara'da); toplam 68 grup. Yeni grupların anahtarı şehir-seviye-tür biçimindedir, eski anahtarlar değişmedi; kurulum anahtara göre idempotenttir. Profillerinde ve liderlik tablosunda "oyunun grubu" olarak işaretlenirler; oyuncu sayılarına, kişi listelerine girmezler, davet edilemez ve para gönderilemezler.

| Seviye | Beceri | Başlangıç şöhreti | Şöhret aralığı | Şarkı kalitesi | Konser aralığı |
|---|---|---|---|---|---|
| Yeni | 22 | 8 | 4–18 | 25–45 | 30 oyun saati |
| Yerel | 42 | 28 | 18–44 | 40–62 | 36 oyun saati |
| Yıldız | 64 | 55 | 45–72 | 55–78 | 48 oyun saati |

- Oyuncu gruplarıyla aynı kurallarla yaşarlar: konserleri aynı hesapla sonuçlanır, yayınları aynı haftalık satış ve listelere girer. Konserlerde boş rolleri kiralık müzisyenler doldurur.
- Zamanlayıcıdaki "yönetmen" onların yerine karar verir: şöhretlerinin yettiği en büyük mekânda konser ayarlar, 5–6 günde bir şarkı yazar, single'ları single bekleme süresinin 1,5 katında bir, albümleri albüm bekleme süresinin 1,5 katında bir çıkarır.
- Şöhretleri kendi aralığında tutulur: oyuncuların önünü sonsuza kadar kesmezler, sönüp de gitmezler. En çok çalışan oyuncu grupları yıldızları geçebilir (şöhret 72'nin üstü).
- Kurulumları kendiliğinden yapılır; adları oyuncular tarafından alınmışsa o grup atlanır. Testlerde kapatılabilir (`NPC=0`).

## Oyunun kadrosu: sosyal ve ekonomik NPC'ler

Az oyunculu dönemde de seçim, mahkeme, pazar ve gazete boş çalışmasın diye her şehirde dört NPC vardır (`packages/shared/src/npc-civic.ts`, `server/src/game/npc-civic.ts`; `NPC=0` ile kapanır). Aramada, kişi listelerinde ve sosyal etkileşimlerde görünmezler; bildirimleri kimseye gitmez.

| NPC | Ne yapar | Para basmasın diye |
|---|---|---|
| Yedek yargıç | Davanın süresinin yarısı dolmuş ve şehirde VIP oyuncu yargıç yoksa normal cezayla karar verir. Oyuncu yargıç varsa son tarihe kadar ona bırakır (sonra eski kural: mahkeme kendisi karar verir). | İkramiye almaz. |
| Aday | Açık bir seçimde NPC aday yoksa ve en fazla bir oyuncu adayı varsa adaylığını koyar; boş makamı doldurur. Eşit oyda ya da hiç oy yokken oyuncu aday kazanır. | Makam maaşı NPC'ye ödenmez. |
| Muhabir | Son 48 oyun saatinde şehirde kalitesi 60'ı geçen oyuncu konserlerinden 8 şablonluk havuzdan (mekân, seyirci, gecenin şarkısı) iki dilli kısa haber yazar (şehir başına günde en fazla 2, aynı gruba bir turda 1). | Basın etkisi en fazla +2 ve haftalık 20 puanlık tavana tabi. |
| İkinci el tüccarı | Bit pazarında atölye ürünlerini alır (dükkâna satılamadıkları için talep yaratır); dükkân eşyalarından ilanlar koyar. | Alış: nominal fiyatın en fazla %40'ı, bonusa göre, ama malzeme maliyetinin en fazla 1,25 katı; günde en fazla 2 satış; yeni hesaplar satamaz; EFSANEVİ eşya alınmaz. Satış: dükkân fiyatının %85'i (dükkâna geri satış %50 olduğundan al-sat zarar eder); VIP eşyası ve yüzük satmaz; satış parası oyundan çıkar (tüccarın parası her turda sıfırlanır). |

## Ev ve kira

Evi olmayan oyuncu arkadaşının kanepesinde kalır (ücretsiz, bonussuz). Her şehirde bir emlakçı vardır.

| Ev | Haftalık kira | Dinlenme bonusu | Ek sağlık |
|---|---|---|---|
| Kiralık oda | $60 | +%15 | +0,5/saat |
| Daire | $180 | +%30 | +1/saat |
| Stüdyo loft | $450 | +%45 | +1,5/saat |
| Bahçeli müstakil ev | $900 | +%55 | +1,8/saat |
| Çatı katı (VIP) | $1.200 | +%65 | +2/saat |

- Kira şehir çarpanıyla çarpılır. İlk haftanın kirası peşin ödenir; sonra her 7 oyun gününde bir kendiliğinden kesilir. Para yetmezse oyuncu evden çıkarılır ve bildirim alır.
- Bonus yalnızca evin bulunduğu şehirde dinlenirken geçerlidir (cezaevinde geçmez). Sanat eserlerinin bonusuyla toplanır, en fazla %100.
- Aynı anda tek ev tutulur; başka bir ev tutmak eskisini bırakır (iade yok). Ev para için sürekli bir harcama kalemidir ve enflasyonu frenler.

## Tempo

Oyunun takvimi tek dosyadadır: `packages/shared/src/pacing.ts` (`PACING`). Bütün süreler oyun günüdür ve gerçek süreye `GAME_SPEED` ile çevrilir; `GAME_SPEED`'in anlamı değişmedi (1 = gerçek zaman, 60 = bir oyun saati bir dakika).

| Sabit | Eski | Yeni | Gerekçe |
|---|---|---|---|
| Liste haftası | 3 gün | **7 gün** | Popmundo'daki gibi haftalık. Listeler, satış raporları ve haftalık görevler bir haftada bir döner; oyuncu bir haftayı planlayabilir. |
| Single beklemesi | 7 gün | **28 gün** | Popmundo rehberlerinin önerdiği tempo (~28). Bir grubun şarkı yazma, prova, kayıt döngüsü (şarkı yazma hız sınırıyla 3 günde bir iyi şarkı) bir single'ı doldurmaya yeter. |
| Albüm beklemesi | 28 gün | **112 gün** | Popmundo (~112). 6–12 kayıtlı şarkı ve şarkı yazma hız sınırı albümü zaten 1–2 aylık iş yapıyor. |
| Single satış süresi | 57 gün | **112 gün** (16 hafta) | Bekleme süresinin 4 katı: dört single aynı anda listede kalabilir, katalog birikir. |
| Albüm satış süresi | 111 gün | **224 gün** (32 hafta) | Bekleme süresinin 2 katı. |
| Satış düşüşü | haftada %14 / %8 | günde %2,45 / %1,37 | Haftalık satış günlük eğriden hesaplanır, hafta uzunluğu değişince eğri bozulmaz. |
| Yayın başına toplam satış | ~940 / ~720 | ~2.350 / ~1.790 | Yayın başına satış ~2,5 katına çıktı ama aynı sürede 4 kat daha az yayın çıkıyor: yayınlardan zaman başına gelir ~%60'a indi. Rifftown'da para sürekli birikiyordu (Popmundo karşılaştırması, madde 2); bu da enflasyonu frenler. |
| Liste şöhret ödülü | 3 günde bir 0,7 | 7 günde bir 1,6 | Günlük şöhret kazancı aynı kaldı (gün başına ~0,23). |
| Festival, seçim, kira, işletme gideri, faiz | 14 / 7 / 7 / 7 / 7 gün | aynı | Zaten haftalık ritimdeydiler; aynı dosyaya taşındı. |
| Şehir doygunluğu penceresi | yok | **60 saat** | Konser sıklığına sınır yoktu; bkz. "Konser hesabı" ve aşağıdaki ölçüm. |

İçeriğin tüketilme hızı: eskiden bir grup 112 günde 16 single ve 4 albüm çıkarabilirdi, şimdi 4 single ve 1 albüm. Yani yayın içeriği 4 kat yavaş tükenir. Oyunun kendi grupları yayınlarını bu beklemelerin 1,5 katında bir çıkardığından onlar da kendiliğinden yavaşladı.

### Denge ölçümü (Ekim 2026)

Ayrıntı, varsayımlar ve bütün tablolar: [docs/DENGE_OLCUMU.md](docs/DENGE_OLCUMU.md) (betik `scripts/balance/measure.ts`, yalnızca bu paylaşılan formülleri çağırır). Özet, `GAME_SPEED=1` ile, 4 kişilik grup, oyuncu başına:

- **Yayın temposu** zaten Popmundo'daki gibi (7 / 28 / 112 gün); değişmedi.
- **Asıl hızlı döngü konserlerdi:** günlük konser sınırı yok. Eski kuralla tek şehirde günde 1 konserle stadyum 8., günde 3 konserle 4. haftada. Şehir doygunluğuyla 11. ve 9. hafta; üç şehri sırayla dolaşan turne 11. haftada (değişmedi, bilinçli).
- **Para:** stadyum seviyesinde haftada net ~$45–55 bin. Dükkânların ve ruhsatların bütün tek seferlik kalemleri (VIP hariç) $105.840; günde 1 konser veren oyuncu bunu 9.–13. haftada geçer. Bu bir ayar sorunu değil, harcama yeri eksikliği: sahne paylarını 4'te 1'e indirmek bile kalemleri birkaç haftada bitirir. Sürekli harcama yerleri (büyük sahnede prodüksiyon gideri, zorunlu ekip, bakım, vergi ya da yeni pahalı ruhsatlar) sonraki adım olarak önerildi; gelir oranları değiştirilmedi.
- **İçerik:** kodla açılan 13 başarımdan 11'i ilk 12 haftada açılır; uzun soluklu içerik süperstar şehirleri, platin/elmas ve efsane sonrası hedeflerdedir. Haftalık görev havuzunun 29 görevinin hepsini görmek ortalama 46 hafta sürer.

## İçerik hacmi (veri dosyaları)

İçerik `packages/shared/src/content/` altında veri olarak durur; yeni bir beceri, eşya, tarif, başarım, görev ya da zincir eklemek bir satırdır, ekranlar ve sunucu kendiliğinden tanır.

| İçerik | Önce | Şimdi | Dosya |
|---|---|---|---|
| Beceri | 41 | 100 | `content/skills.ts` (+ 7 yeni tür becerisi) |
| Dükkân ve atölye eşyası | ~70 | 167 (8 rol, 6 sezonluk, 15 şehre özgü, 3 ödül eşyası) | `content/items.ts` |
| Atölye tarifi | 6 | 19 | `content/items.ts` |
| Tür / alt tür | 7 / 0 | 14 / 72 | `world.ts` (popülerlik tablosu veriyle), `performance.ts` |
| Başarım | 39 | 110 (14 gizli keşif, 16 şehir) | `content/progress.ts` (istatistik eşikli) |
| Haftalık görev havuzu | 12 | 28 | `content/progress.ts` |
| Görev zinciri | 0 | 9 zincir (3 karakterli, seçimli), 39 adım | `content/progress.ts` |
| Efsane sonrası hedef | 0 | 7 + Onur Listesi | `content/progress.ts` |

- **Yeni beceriler** genel etki ağırlıklarıyla çalışır (`effects`): şarkı yazma, prova hızı, kayıt kalitesi, sokak müziği bahşişi, sahne, atölye, arkadaşlık, romantizm, kondisyon. Etkiler toplanır ama tavanlıdır: şarkı yazma ve sahne puanına en fazla +10, çarpanlarda en fazla ×1,5. Böylece "her şeyi öğren" stratejisi sınırlı kalır. **Uzmanlık payı** (`skills.ts` `masteryBonus`): her yan becerinin usta (60) seviyesini aşan kısmı × ağırlık, +10 tavanının dışında bir kez daha eklenir, en fazla +5 (toplam en fazla +15). Ölçümde geniş dağılım tavana derin dağılımdan ucuza varıyordu ve ikisi +10'da eşit kalıyordu; artık aynı çalışma saatiyle (240 saat) derin uzman şarkı yazmada 13,9'a, sahnede 12,4'e çıkar, geniş oyuncu 10'da kalır. 60'ın altındaki becerilerde etki eskisiyle aynıdır, kimsenin etkisi azalmaz (bkz. [docs/DENGE_OLCUMU.md](docs/DENGE_OLCUMU.md)).
- **Yeni türler** (blues, folk, punk, soul, reggae, country, klasik) şehir popülerliğini ülke tabanı + şehir istisnalarından alır (ör. country Nashville'de 1,4).
- **Tür uyumu:** bazı enstrüman ve kıyafetler bir türe yatkındır (yarı gövde caz gitarı caz, blues ve soul'da; yedi telli gitar metalde; rezonatör gitar blues ve country'de; fiddle country ve folk'ta; kovboy şapkası country'de). Grubun türü uyuyorsa konserde bonusa +1 / +2 eklenir (tavan +3, yıpranmadan etkilenmez). Merdiven korunur: bir eşya, kendi türünde bile, en az iki katı fiyatlı aynı yuvadaki eşyanın taban bonusuna yetişemez (test denetler).
- **Set bonusları** (4 set): her gruptan bir eşya kuşanılınca sahne performansına eklenir, yalnızca en iyi set sayılır (en fazla +3): *Caz kulübü* (caz enstrümanı + smokin, +2), *Ağır zırh* (metal gitarı ya da beş telli bas + deri pantolon, +2), *Honky tonk* (rezonatör gitar ya da fiddle + kovboy şapkası + turne minibüsü ya da kamyonet, +3), *Neon gece* (modüler synth ya da elektronik pad + ışıklı kostüm, +2).
- **Sezonluk eşyalar** (6): oyun yılı 56 gün, her mevsim 14 gün (`items.ts` `seasonAt`); kış paltosu ve kar makinesi kışın, çiçekli gömlek ilkbaharda, festival yazlığı yazın, hasat havai fişeği ve sınırlı baskı afiş sonbaharda satılır. Mevsim dışı alınamaz (`out_of_season`), elde olan kullanılmaya ve ikinci elde satılmaya devam eder.
- **Eşya dengesi:** yeni enstrüman ve kıyafetler var olan fiyat/bonus merdiveninin ara basamaklarıdır; her yuvada tek eşya kuşanıldığı için ucuz eşyayla bonus biriktirilemez. Atölye ürünleri dükkâna satılmaz (eski kural), tamir kiti tarifinin malzemesi dükkân fiyatının en az yarısıdır (atölye-dükkân döngüsüyle para basılamaz).
- **Görev zincirleri** (Yolun hikâyesi, Stüdyo günlükleri, Manşetlere doğru, Usta çırak, Kalbin sesi, Sahnenin efendisi) ömür boyu istatistiklere bakar ve sırayla açılır; adım ödülleri $20–$120, her adım bir kez. Ana sayfada kart.
- **Karakterli zincirler** (3): adı geçen bir karakter, hikâye cümleleri, bir seçim ve seçime göre dallanan devam. *Vedat Karahan'ın teklifi* (efsanevi prodüktör: ona güven → stüdyo mikrofonu, radyo yolu ve "Vedat Karahan'ın keşfi" ünvanı; kendi sesinde ısrar → küçük para, altın plak yolu ve "Bağımsız ruh"), *Rakip: Kızıl Tilkiler* (solist Cansu Tilki: meydan oku → DESTANSI konser ve "Tilki avcısı"; birlikte çal → sahne ceketi, festival ve "Tilkilerin dostu"), *Melek Hanım'ın dersleri* (İzmir'de emekli caz şarkıcısı Melek Aksoy: şarkı yazma → nota defteri ve "Melek Hanım'ın kalemi"; sahne → "Melek Hanım'ın öğrencisi"). Seçim `chain_claims.choice` içinde saklanır, bir kez yapılır; para ödülleri adım başına en fazla $80.
- **Efsane sonrası:** "Efsane ol" hedefine ulaşan grup sırayla şu hedefleri görür: EFSANEVİ bir gece, 3 şehirde süperstar, platin plak, 5 festival, 8 şehirde süperstar, elmas plak (50.000), 15 şehrin hepsinde süperstar. Hepsi bitince Onur Listesi. Bu hedefler ayrı tanım değildir, başarımlara işaret eder (`LEGACY_GOALS` → `STAT_ACHIEVEMENTS`): eşik ve metin tek yerdedir, başarım kimlikleri ve hedef kimlikleri eski sürümle aynı kaldı. Platin plak başarımı da bu yüzden veri dosyasına taşındı. Şöhret artık zamanla azaldığı için (bkz. "Kayıp ve sonuç") süperstar şehirlerini korumak da kendi başına bir uğraştır.
- İstatistikler tek fonksiyonda hesaplanır: `server/src/game/stats.ts` (`lifetimeStats`).

## Rehber görevler

Yeni oyuncunun ana ekranında "sıradaki adım" kartı görünür. Dokuz adım, toplam $305 ödül (ek hesaplarla para toplamaya değmesin diye küçük):

1. İlk şarkını yaz ($25)
2. Bir mesai yap ($20)
3. Kitapçıdan yeni bir beceri öğren ($20)
4. Grubunu kur ($25)
5. Prova yap ($25)
6. İlk konserini ver ($50)
7. Bir şarkı kaydet ($50)
8. İlk single'ını yayınla ($75)
9. Kendine bir ev tut ($15)

Adımların tamamlanıp tamamlanmadığı oyuncunun yaptıklarından hesaplanır (başarımlarla aynı istatistikler); sırası gelmeden yapılan adımın ödülü de alınabilir ve kart önce ödülü hazır olan adımı gösterir, her ödül bir kez. Kartta "Git" düğmesi ilgili ekranı açar; kart gizlenebilir.

Rehber bitince kartın yerini **sıradaki hedef** alır; her zaman tek, somut bir hedef ve ilerleme çubuğu: grup kur → grubun en az 4 şarkısı olsun (tam setlist) → kulüp şöhretine ulaş → konser salonu → 3 şehirde kulüp seviyesi (turne) → stadyum → efsane ol. Hedefin "Git" düğmesi ilgili sahneyi ya da ekranı açar.

## Oyuncu profili

- **Fotoğraf:** uygulama galeriden seçilen fotoğrafı kare kırpar, 512 piksele küçültüp JPEG olarak gönderir. Sunucu en fazla 300 KB kabul eder ve dosyanın gerçekten JPEG, PNG ya da WebP olduğunu baştaki imzadan kontrol eder. Fotoğraflar sürüm numaralı, herkese açık adresten sunulur; kaldırılan ya da değiştirilen fotoğrafın eski adresi artık çalışmaz.
- **Başlık** (en fazla 80 karakter) ve **hakkında** yazısı (en fazla 1.000 karakter). Kontrol karakterleri temizlenir.
- **Profil sayfası:** fotoğraf, başlık, VIP ve "oyunun müzisyeni" rozetleri, şehir, başarım puanı, grup, hakkında, meslek ve makamlar, ev, son başarımlar, en iyi beceriler, sabıka (varsa).
- **Moderasyon:** yönetim panelinde son profil değişiklikleri fotoğraflarıyla listelenir; yönetici fotoğrafı ya da yazıları tek dokunuşla kaldırabilir.

## Grup ve konserler

- Grup en fazla 6 kişi. Herkes bir rol (enstrüman) seçer. Bir karakter tek grupta olabilir.
- Kurulan grubun repertuvarına kurucunun şarkıları otomatik eklenir. Üyeler kendi şarkılarını ekleyebilir.
- Konseri sadece lider, bulunduğu şehirdeki bir mekâna ayarlayabilir: 2, 6, 12 ya da 24 oyun saati sonrasına.
- Konser anında şehirde olmayan ya da cezaevindeki üye sahneye çıkamaz; bu kaliteyi düşürür.

| Mekân | Kapasite | Bilet | Gereken şöhret | Şöhret çarpanı | Başa baş kalite | Prodüksiyon gideri |
|---|---|---|---|---|---|---|
| Bar | 80 | $10 | 0 | ×1 | 20 | yok |
| Kulüp | 350 | $20 | 15 | ×1,6 | 35 | $150 |
| Konser salonu | 2.000 | $40 | 45 | ×2,5 | 50 | $1.500 |
| Stadyum | 20.000 | $40 | 75 | ×3,5 | 65 | $9.000 |

Prodüksiyon gideri (sahne, ses, ışık, tanıtım; şehir çarpanıyla) konser ayarlanırken liderin cebinden peşin ödenir, iptalde yarısı geri verilir (`gigProductionCost`, migration 021). Eskiden büyük sahnede gider yoktu ve 90 günde giderin gelire oranı %9'a düşüyordu (denge raporu §2); gider gelirin kabaca %15–30'u kadardır. Bar (ilk saatler) ve festival muaftır.

Bilet fiyatı şehir çarpanıyla çarpılır.

### Tek başına ilerleme: kiralık müzisyenler

Hiç oyuncu olmasa da oyun oynanabilir. Lider konser ayarlarken gruptaki boş rolleri oyunun kendi müzisyenleriyle doldurabilir. Kiralık müzisyenler setlisti %70 aşinalıkla çalar.

| Mekân | Kişi başı ücret | Beceri (en fazla) | Sahne (en fazla) | Grubun kendi ortalamasını en fazla |
|---|---|---|---|---|
| Bar | $5 | 30 | 25 | sınırsız |
| Kulüp | $60 | 50 | 40 | +15 |
| Konser salonu | $250 | 70 | 55 | +10 |
| Stadyum | $900 | 85 | 70 | +5 |

Kulüp ve üstünde kiralık müzisyen, grubun sahnedeki kendi üyelerinin ortalama rol becerisini ve sahne puanını yalnızca son sütun kadar aşar (`items.ts` `sessionLevels`). Eskiden kiralık kadro mekânın sabit seviyesinde çalıyordu: hiç beste çalışmamış (8), gitarı 52 olan bir oyuncu kiralıkların sırtında 72. günde stadyuma çıkıyordu (denge raporu §1). Büyük sahnede beceri satın alınamaz.

Yeni başlayan tek bir oyuncu, 3 kiralık müzisyenle bile bar konserinden kâr eder. Bu, `server/test/rules.test.ts` içinde test ediliyor.

### Konser hesabı

- Seyirci = kapasite × (0,04 + şöhret / 100 × 1,1) × tür popülerliği × (0,85–1,15) + arkadaşlar (barda 4–10, diğer sahnelerde 2–8; kapasiteyi aşmaz)
- Grup becerisi = sahnedekilerin (rol becerisi + enstrüman bonusu) × ruh hâli × sağlık ortalaması
- Şarkı puanı = a × şarkı kalitesi + b × ortalama aşinalık + c × grup becerisi; ağırlıklar mekâna göre (`rules.ts` `SONG_SCORE_WEIGHTS`): bar 0,4 / 0,35 / 0,25, kulüp 0,42 / 0,32 / 0,26, salon 0,46 / 0,26 / 0,28, stadyum 0,5 / 0,2 / 0,3 (eskiden her yerde 0,4 / 0,35 / 0,25). Büyük sahnede yalnızca provayla kazanılan aşinalık daha az, şarkının kendisi ve çalım becerisi daha çok sayılır.
- Kalite = şarkı puanı ortalaması × (0,85 + 0,15 × sahne / 100) × (0,5 + 0,5 × gelen üye oranı) × setlist uzunluğu çarpanı (1 şarkı 0,7, 4+ şarkı 1,0) × (0,92–1,08) × 1,15
- Gelir = seyirci × bilet × şehir çarpanı × grubun payı. Pay sahne büyüdükçe küçülür (mekân, prodüksiyon, organizatör): bar %70, kulüp %45, salon %12, stadyum %4, festival %12. Böylece salon konseri $6–8 bin, stadyum $30 bin civarı getirir. Sahnedeki gerçek üyeler arasında eşit bölünür.
- Şöhret değişimi = (kalite − mekânın başa baş kalitesi) / 100 × 6 × mekân çarpanı. Başa baş kalite bar 20, kulüp 35, salon 50, stadyum 65, festival 40 (eskiden hepsi 20): büyük sahnede vasat bir gece şöhret getirmez, kaybettirir. Artışlar şöhret yükseldikçe küçülür: × max(0,03; (1 − şöhret/110)^1,6) (eskiden × max(0,1; 1 − şöhret/120); şöhret 10'da ×0,86, 60'ta ×0,27, 70'te ×0,18). Bar dışındaki sahnelerde salon boş kaldıkça da küçülür. Barda kalitesi 10'u geçen her konser en az +0,2 şöhret getirir: ilk adımlar boşa gitmez. Orta düzey bir grup 10–17 iyi bar konseriyle kulübe çıkar.
- Raporda kiralık müzisyenler üye sayılmaz ("sahnede 1/1").
- Aynı sahnede aynı saatlerde (±3 oyun saati) iki grup çalamaz; oyunun kendi grupları da boş saat arar ve oyuncuya her zaman yer açar (oyuncu rezervasyonu çakışan oyun grubu konserini iptal eder). Bir grubun aynı anda en fazla 2 ayarlı konseri olabilir (sahneler boş rezervasyonla kapatılamasın).
- Grubun kendi üyelerinden kimse sahneye çıkmazsa konser sadece kiralık müzisyenlerle yapılmaz: gelir yok, şöhret düşer.
- Olumlu şöhretin %25'i aynı ülkedeki diğer şehirlere yayılır.
- **Şehir doygunluğu** (`rules.ts` `CITY_SATURATION`): grubun aynı şehirde son 60 oyun saatinde verdiği her önceki konser (k) şöhret kazancını 1 ÷ (1 + 0,5 × k), seyirciyi 1 − 0,1 × k (en az ×0,6) ile çarpar. Her gün aynı şehirde çalan grubun şöhret kazancı yarıya iner; her şehre 3 günde bir dönen turne etkilenmez. Bar, festival ve oyunun kendi grupları muaftır; şöhret kayıpları küçülmez. Pencere `pacing.ts` `citySaturationHours`, sunucuda `GIG_SATURATION_HOURS` ile değiştirilir (0 kapatır). Gerekçe: konser sıklığına sınır yokken günde 3 konserle tek şehirde 4. haftada stadyuma çıkılıyordu (bkz. "Tempo").
- Konseri iptal etmek o şehirde şöhret kaybettirir; ceza satılan biletle büyür (bkz. "Kayıp ve sonuç"). Hiç kimse gelmezse konser gelirsiz biter ve şöhret düşer.

### Karar derinliği: setlist sırası, sahne olayları ve bis

Kurallar `packages/shared/src/performance.ts` dosyasındadır.

- **Setlist sırası:** her şarkının o geceki puanı konum ağırlığıyla tartılır: açılış ×1,1, ısınma bölümü ×0,85'ten ×1,1'e doğru artar, kapanış ×1,35. Ağırlıklı ortalama ile düz ortalama arasındaki farkın beş katı kaliteye eklenir (en fazla ±8 puan; eskiden iki katı ve sıra kaliteye ~0,4 puan katıyordu, şimdi iyi bir sıra ~1–1,3). Kısacası zayıf şarkıları ortaya, en güçlüsünü sona koymak kazandırır. Tempo da sayılır: yavaş olmayan bir açılış +1, hızlı kapanış +1,5, üst üste üç yavaş şarkı −2. 3 şarkıdan kısa setlerde sıra etkisizdir. Raporda "Setlist sırası" ayrı bir etken olarak görünür; VIP olmayanlar yalnızca yönünü görür.
- **Sahne olayları (performans planı):** konser ayarlarken en fazla 3 olay seçilir: seyirciyle sohbet (şovmenlik çırak, +2/−1, 12 saat bekleme), hep bir ağızdan (seyirci farkındalığı çırak, +4/−2, 24 saat), uzun solo (rol becerisi yetenekli, +5/−3, 24 saat), dans koreografisi (dans amatör, +4/−3, 24 saat), akustik ara (doğaçlama çırak, +3/−2, 24 saat), sahneden atlama (VIP becerisi, +6/−5, 48 saat). Bunlara beceriye ve türe bağlı 15 olay eklendi (toplam 21): sürpriz cover (grubun türündeki beceri), şarkının hikâyesi (hikâye anlatıcılığı), ışık senkronu (sahne ışığı), saksofon solosu, keman solosu, perküsyon arası, davul düellosu; yalnızca belli türlerde: pogo çağrısı (rock, metal, punk), serbest doğaçlama (hip-hop), büyük drop (elektronik), doğaçlama atışması (caz, blues, soul), çağrı ve cevap (soul, blues, country), kamp ateşi anı (folk, country, Anadolu rock), dub yankısı (reggae, elektronik), nefesler tutuldu (klasik, caz). Türe uymayan olay konser ayarlanırken reddedilir (`event_wrong_genre`), uygulama yalnızca uyanları gösterir. Olayı grubun sahnedeki üyelerinden o beceride en iyi olan dener; kiralık müzisyenler plana uymaz. Başarı şansı = 0,45 + (beceri − eşik) × 0,02, %15–%95. Eşiğin altındaysa olay kesin bozulur. Toplam etki ±12 puanla sınırlı. Bekleme süresi dolmamış olay "denenmedi" olarak geçer.
- **Olayların bedeli ve bağlamı** (`stageEventOdds`): başarısızlık cezası artık bonusa eşit (eskiden yarısıydı; eşikte beklenen değer negatif). Bir gecede denenen her ek olay seyirciyi yorar: 2. olayın şansı −0,12, 3.'nün −0,24; başarı bonusu ×1 / ×0,7 / ×0,4. Ortalama enerjisi 40'ın altındaki grup −0,1 şans. Olayın tarzı mekânla etkileşir: samimi olaylar (sohbet, akustik ara, hikâye, kamp ateşi, nefesler tutuldu) barda ×1,3, stadyumda ×0,6; kalabalık olayları (hep bir ağızdan, cover, pogo, büyük drop, çağrı-cevap) barda ×0,7, stadyumda ×1,3; virtüözlük ve gösteri olayları arada. Eskiden "3 olay + cesur bis" her profilde ilk 5 planın tamamıydı; şimdi kulüpte 1–2 olay, salonda 2, stadyumda 2–3 olay ve bis kararı enerjiye bağlı (ölçüm `mc-gigs.ts`: ilk 10 planda 4 farklı strateji, en kötü planlar "3 olay, bissiz" yani fazla olay da zarar).
- **Bis:** "bis yok", "güvenli bis" (kalite 40'ın üstündeyse +1 kalite, şöhret ×1,05, 5 enerji; istenmezse çıkılmaz) ya da "cesur bis" (+3 kalite ve şöhret ×1,12; tutma şansı 0,2 + enerji × 0,6 + (kalite − 40)/300, %10–%85; tutmazsa −6 kalite ve şöhret ×0,9; seyirci istemezken çıkmak −4 kalite, şöhret ×0,9; her durumda 12 enerji). Eskiden başarı ×1,15, başarısızlık −3 / ×0,95 ve şans 0,3 + … /200 idi: cesur bis kulüp ve üstünde her zaman kazandırıyordu. Şimdi enerjisi yüksek, iyi bir gecede değer; yorgun grupta zarar.
- **Set bonusu ve tür uyumu kaliteye de** (`gearQualityBonus`): üye başına set bonusu × 0,5 + tür uyumu (kıyafet ve çalınan rolün enstrümanı, tavan +3) × 0,35, en fazla +2; grubun sahnedeki kendi üyelerinin ortalaması kaliteye eklenir (eskiden yalnız sahne puanı ve rol becerisi üzerinden kaliteye 1 puandan az giriyordu).

### Şarkı yazma: alt tür, tempo ve hız sınırı

- Şarkı yazarken türün yanında isteğe bağlı bir **alt tür** (72 alt tür, her türde en az 3; ör. hard rock, krautrock, tekno, grime, manuş caz, türkü, Anadolu funk, barok) ve **tempo** (yavaş, orta, hızlı) seçilir. Alt türün tür becerisi eşiğini geçmek +2 ile +4, geçmemek −2; alt türün doğal temposuna uymak +2, bir basamak sapmak 0, iki basamak −3.
- **Alt türün bağlamı** (`performance.ts` `subgenreGigBonus`): her alt türün bir ya da birkaç sahne şehri vardır (ör. krautrock Berlin, Münih, Hamburg; britpop Manchester, Londra, Liverpool; türkü Ankara, İzmir, İstanbul). Konserde şarkı puanına: sahne şehrinde +3, haftanın modasıysa +2 (her türden bir alt tür, açık liste haftasıyla döner; `GET /api/trends`), niş alt türler (tür becerisi eşiği 45) salon, stadyum ve festivalde −3; toplam −3 … +5. Böylece yüksek yazım bonuslu zor alt tür her yerde en iyi seçim değildir: Manchester'da bir salonda britpop krautrock'u geçer, Berlin'de bir kulüpte tersi. Konser raporunda "alt türlerin bu sahnede tutması" ayrı bir etkendir; şarkı yazma ekranı her alt türün sahnesini, modasını ve nişliğini gösterir.
- **Hız sınırı:** son 3 oyun gününde yazılmış şarkı sayısına göre kalite ×1 / ×0,85 / ×0,72 / ×0,6. Bildirim "aceleye geldi" der. İlham bonusu bu çarpandan sonra eklenir.

### Konser eleştirisi

Her konser bittiğinde sunucu, o konsere özel iki ila dört cümlelik bir eleştiri üretip sonuçla birlikte saklar (Türkçe ve İngilizce). Metin havuzları `packages/shared/src/content/texts.ts` içindedir: altı kalite basamağının her birinde 8 ana cümle, 4 EFSANEVİ cümlesi, doluluk için 9 cümle (hepsi mekânı anar), her sahne olayının başarı ve başarısızlık cümlesi, basın desteği (sıcak ≥60 / soğuk ≤10), aynı şehirde son 48 oyun saatinde çalan rakip grupla kıyas (kalite farkı 8 ve üstüyse) ve her şehre özgü iki renk cümlesi. Doluluk ve ana cümleye en fazla iki bağlam cümlesi eklenir; seçim konserin kimliğine göre deterministiktir. Eleştiri konseri bilir: mekânın adı, şehir, gerçek seyirci sayısı, gecenin en iyi şarkısı ve sahneye çıkmayan üye sayısı. Türkçede yer tutuculara ek getirilmez (test denetler). Örnek: "Kadıköy Bodrum Bar tıklım tıklımdı. 72 seyirci bis istedi; Kadıköy Bodrum Bar yerinden oynadı." Oyuncu eleştiriyi tek dokunuşla grup ya da şehir sohbetinde paylaşabilir.

Raporun altında **"Neden böyle geçti?"** bölümü her etkeni zayıf / idare eder / güçlü diye değerlendirir (şarkı kalitesi, şarkıları bilme, çalım becerisi, sahne şovu, setlist uzunluğu, kadro, enerji, ruh hâli, seyircinin tazeliği; sayı yok). Seyircinin tazeliği yalnızca grup o şehirde doygunluk penceresinde çaldıysa görünür (1 konser idare eder, 2+ zayıf). Grubun üyeleri en zayıf üç etken için "Sıradaki konser için" önerileri ve ilgili ekrana giden düğmeleri görür (prova, şarkı yaz, okul, dinlen, başka şehre git), ayrıca o şehirde sıradaki sahneye ne kaldığını gösteren çubuğu. Aynı çubuk grup sekmesinde her şehir için ve sahne sayfasında da var.

## Enerji, ilham ve moodlet'ler

- **Enerji (0–100):** Yorucu işler saat başına enerji harcar (çalışma 8, prova ve kayıt 7, antrenman 12, ders 6, şarkı yazma 5). Zamanla saatte 2 dolar; dinlenmek saatte 14 (evde ya da otelde 20), yemek anında 10 / 20 / 35 doldurur. İş bitince enerji sıfırın altına düşecekse iş başlamaz; dinlenme, tedavi ve yolculuk her zaman serbest. Düşük enerji ders, prova ve konser verimini %30'a kadar azaltır. Her konser sahnedekilere 20 enerjiye mal olur.
- **İlham (0–100):** Zamanla saatte 0,5 söner. Konser (+6 ve iyi geçtiyse fazlası), başka şehre varmak (+8), randevu (+8), takılmak (+3), düğün (+20), sokak müziği (saatte +2), sanat eserleriyle dinlenmek ve yeni beceri öğrenmek ilham verir. Şarkı yazarken kaliteye en fazla +15 ekler ve yarısı harcanır.
- **Moodlet'ler:** Olaylardan doğan, süresi dolunca kaybolan ruh hâli etkileri: Harika konser (+12, 1 gün), Efsanevi gece (+25, 3 gün), Kötü konser (−10), Ziyafet, Karnı tok, Yeni şehir heyecanı, İyi sohbet, Romantik akşam, Nişanlı, Yeni evli (+25, 1 hafta), Kalp kırıklığı (−20), Boşanma (−25), Hediye, Başarı, Endorfin, İşsiz kaldı, Evsiz, İyi takas. Durumdan doğanlar: Bitkin (enerji 20'nin altı, −15), Yorgun (−6), İlham dolu (+8), Hasta (−8), Parmaklıklar ardında (−20). Görünen ruh hâli = temel ruh hâli + moodlet'ler (toplam en fazla ±30) ve oyundaki tüm hesaplarda bu kullanılır. VIP olmayanlar etkiyi okla (▲▲) görür.

## Kayıp ve sonuç

Kötü kararın bedeli var. Kurallar `packages/shared/src/consequences.ts`, sunucu tarafı `server/src/game/consequences.ts`. Zamanlayıcının her biri ayrı aşamadır (biri hata verirse diğerleri çalışır).

| Ne | Kural |
|---|---|
| Aşinalık çürümesi | Bir şarkı 12 oyun günü prova edilmez, konserde çalınmaz ya da kaydedilmezse her gün 1,5 aşinalık kaybeder; 15'in altına inmez. Prova, konser ve kayıt sayacı sıfırlar. Oyunun kendi müzisyenleri hariç. |
| Şöhret azalması | Bir grup bir şehirde 54 oyun günü konser vermezse o şehirdeki şöhreti her gün %1 (en az 0,05 puan) azalır. O şehirde konser vermek sayacı sıfırlar. Oyunun kendi grupları hariç (yönetmen onları bantta tutar). |
| Üye ayrılması | Gruptan ayrılan ya da çıkarılan üye, grubun her şehirdeki şöhretinin %6'sını götürür. Gruba 24 oyun saatinden kısa süre önce katılan üye için ceza yoktur (yanlış davet, deneme). Ayrılan "Ayrılık" moodlet'i alır. |
| İptal cezası | Biletler rezervasyondan konsere doğru satılır: satılan = beklenen seyirci × (geçen süre ÷ toplam süre), en az %10. Şöhret cezası = 0,5 + satılan ÷ kapasite × 2 × mekân çarpanı, 0,5–6 arası. Kapasitenin yarısından fazlası satılmışsa iptal skandala dönüşür. |
| Yaşlanma | Karakter 18 yaşında başlar; bir oyun yılı 56 oyun günüdür (GAME_SPEED=1 iken ~8 hafta). 35 yaştan sonra her yıl öğrenme %1 yavaşlar (en fazla %40). 70 yaşından sonra "Yaş yetmiş" moodlet'i (−3). Yaş profilde görünür. |
| Bağımlılık | Dükkân alışverişi (her $150 için 1, tek seferde en fazla 3; malzeme sayılmaz) ve her yemek "düşkünlük" ekler; düşkünlük günde 4 söner. 16'yı geçince bağımlılık başlar: son 12 oyun saatinde isteğini gidermeyen bağımlı "Canı çekiyor" (−12) moodlet'i alır. Hastanede tedavi saatte 2 düşkünlük azaltır; düşkünlük 6'nın altına inince bağımlılık biter (zamanla da biter). Grubu o şehirde "yerel yıldız" ve üstüyse bağımlılık skandal olur. |
| Skandal | Mahkûmiyet (grup üyesi hüküm giyince; −2 şöhret), satılmış konserin iptali (−1), kulüp ve üstünde kalitesi 10'un altında biten konser (−1,5), bağımlılık haberi (−1). Şöhret kaybının %30'u aynı ülkenin diğer şehirlerine yayılır. Üyeler "Skandal" moodlet'i (−12, 2 gün) ve bildirim alır. Aynı tür skandal aynı şehirde bir günde bir kez sayılır. Basın desteğine etkisi basın bölümünde. |
| Hastaneye kaldırılma | Sağlığı 10'un altına düşen, boştaki (yolda ya da cezaevinde olmayan) karakter kendiliğinden hastaneye kaldırılır: 4 saatlik tedavi başlar, ücret cepteki parayla sınırlıdır (borç yok; doktorlar ücretsiz). |

### Ölüm (HASSAS, varsayılan KAPALI)

> **Dikkat:** kalıcı ölüm oyuncunun emeğini geri dönüşsüz siler. Yalnızca `PERMADEATH=1` ortam değişkeniyle açılır; varsayılan kapalıdır. Kapalıyken hiçbir karakter ölmez, yalnızca hastaneye kaldırılır. Açmadan önce kullanım şartlarında ve uygulama içinde oyunculara açıkça duyurulmalıdır.

- Açıkken: sağlığı 48 oyun saati boyunca 3'ün altında kalan karakter ihmalden ölür; 85 yaşından sonra her oyun günü küçük bir yaşlılık olasılığı vardır (85'te %0,2, 95'te ~%7, en fazla %20).
- Ölen karakter gruptan (liderlik devredilir ya da grup dağılır), işletmeden, makamdan, evden, açık takas ve ilanlardan ayrılır; eşine haber gider. Kayıtlar ve geçmiş korunur, karakter aramalarda ve sosyal hedeflerde görünmez.
- Kullanıcı yeni karakter açar. Cep, banka ve işletme kasasındaki paranın yarısı (en fazla $10.000) yeni karaktere bir kez miras kalır. Para basılmaz, yalnızca taşınır; miras aynı işlemde sıfırlanır, iki kez alınamaz.
- Testlerde ve geliştirmede `DECAY=0` aşinalık ve şöhret çürümesini, `AGING=0` yaşlanmayı kapatır.

## Turne, klip, radyo ve plak şirketi

Kurallar `packages/shared/src/touring.ts` ve `broadcast.ts`; sunucu `server/src/game/touring.ts`, `media.ts`, `labels.ts`. Ekranlar: grup sekmesinden "Turne ve ekip" ve "Plak şirketi"; kayıt stüdyosunda prodüktör ve klip; listelerde klip listesi.

### Tur ekibi ve moral

Grup lideri 8 rolden ekip tutar; ekip oyunun kendi çalışanıdır, ücreti her konserde bilet gelirinden ödenir (şehir çarpanıyla):

| Rol | Konser başı | Etki |
|---|---|---|
| Yükleme ekibi | $25 | Enstrüman yıpranması %40'a iner |
| Ses teknisyeni | $60 | Konser kalitesine +3 |
| Işık teknisyeni | $45 | Konser kalitesine +1,5 |
| Şoför | $30 | Kendi araçla yolculukta arıza şansı yarıya iner |
| Kişisel asistan | $30 | Konser 6 enerji daha az yorar |
| Tur menajeri | $70 | Konser başı moral kaybı yarıya iner |
| Promotör | $55 | Seyirci ×1,08 |
| Muhasebeci | $40 | Ekip ücretleri %15 düşer |

Moral 70'te başlar: her konser −4 (tur menajeriyle −2), iyi konser (60+) +3, ücreti ödenemeyen konser −25; konser olmayan her oyun günü +5 (en fazla 90). Moral 50'nin altında etkiler yarıya iner, 20'nin altında hiç çalışmaz; 10'un altına düşerse ekip dağılır. Bilet geliri ücreti karşılamazsa ücret ödenmez (para basılmaz). Etkiler sahne efektleri gibi küçük tutuldu; bar konserinde ekip kârlı değildir, kulüp ve üstü için anlamlıdır.

### Araç arızası ve ekipman yıpranması

- Enstrümanlar her konserde %3 yıpranır (yükleme ekibiyle %1,2). Yıpranma bonusu düşürür: %100 yıpranmış enstrüman bonusunun yarısını verir. Araçlar her 100 km'de %1,2 yıpranır.
- Kendi aracıyla yolculukta arıza şansı = (0,03 + yıpranma × 0,004) × (1 − sürücülük ÷ 250) × (1 − mekanik ÷ 250) × (şoför varsa 0,5), %0,5–%50. Arıza yolculuğu %60 uzatır; envanterde tamir kiti varsa kit harcanır ve yalnızca %15 uzar.
- **Tamir kiti** ($120, hırdavatçı; atölyede de yapılır) bir eşyanın yıpranmasını 60 azaltır. **Ekipman bakım paketi** ($200, sahne ekipmanı dükkânı) kuşanılmış bütün eşyaları onarır. VIP olmayanlar yıpranmayı ve morali 10'luk adımlarla görür.

### Turne planı

Lider 3–8 şehir ve 3–28 günlük bir turne başlatır (grup başına tek aktif turne). Süre bitince turne şehirlerinin hepsinde, turne süresi içinde, en az bir üyenin sahnede olduğu bir konser verildiyse turne tamamlanır: her turne şehrine +0,6 şöhret, ekibe +15 moral, "Yola çıktık" başarımı ve "Yolun hikâyesi" zincirinin adımı.

### Müzik klibi

Kayıt stüdyosunda grubun lideri kayıtlı bir şarkı için 6 saatlik çekim yapar: $400 + yönetmen (kendimiz $0, bağımsız $500 / beceri 45, ünlü $2.500 / beceri 75; şehir çarpanıyla). Grubun 14 oyun gününde bir klibi olabilir. Kalite = 0,45 × kayıt + 0,3 × yönetmenlik (tutulan yönetmen ya da şehirdeki üyelerin en iyi film yönetmenliği) + 0,25 × şehirdeki üyelerin ortalama oyunculuğu ± 5. Klip 12 liste haftası izlenir (haftada %20 düşüş); dünya klip listesinin ilk 20'si grubun en tanındığı şehre şöhret getirir (1.: +0,6, ilk 3: +0,35, ilk 10: +0,15, ilk 20: +0,05). Klibi olan şarkıyı içeren yayın kaliteye göre en fazla %15 daha çok satar.

### Radyo

Her liste haftası, satıştaki single'lar ilk 10 haftaları boyunca her şehir radyosunda çalınır: çalınma = 40 × (kalite ÷ 100)^1,5 × (0,1 + şöhret ÷ 100) × tür popülerliği × (0,8 + basın ÷ 100) × 0,82^hafta. Grup hiç tanınmıyorsa çalınmaz. Çalınma o şehirde şöhret getirir (grup ve şehir başına haftada en fazla +0,4) ve o haftanın satışını en fazla %15 artırır. Toplam çalınma yayında saklanır; "Radyo dostu" başarımı ve "Manşetlere doğru" zinciri buna bakar.

### Plak şirketi (oyuncu işletmesi)

- Kuruluş $30.000 × şehir çarpanı, haftalık gider $400 × şehir çarpanı (önce kasadan, yetmezse sahibinin cebinden; ikisi de yetmezse şirket kapanır, kasadaki para sahibine kalır, sözleşmeler biter). Kişi başı tek şirket, en fazla 5 grup.
- Sahip, bir şehirde en az "şehirde konuşuluyor" (15) şöhretteki bir gruba teklif verir: grubun payı %30–%60, avans, 4–52 liste haftası. Grubun lideri kabul eder, reddeder ya da karşı teklif verir; sıra son teklifi yapmayan taraftadır (pazarlık). Kabulde avans şirketin kasasından grup üyelerine eşit bölünür; grubun bekleyen diğer teklifleri düşer.
- Sözleşme süresince çıkan her yayın şirkete bağlanır. Haftalık brüt satışın %40'ı dağıtıma gider, kalan %60'lık havuzun sözleşmedeki payı gruba, kalanı şirketin kasasına girer; avans grubun payından geri alınır. Şirketin pazarlaması satışı %10 artırır. Sabit %50 yalnızca şirketsiz gruplar için geçerli kaldı.
- **Sömürü korumaları:** yeni hesaplar şirket kuramaz, teklif veremez ve kabul edemez; kendi grubuyla sözleşme yapılamaz (kabul anında da kontrol edilir); avans en fazla $5.000 ve grubun en yüksek şöhretinin 100 katı (tanınmamış ek hesap grubuna para aktarılamaz); pay aralığı sabit; şirket parayı yalnızca gerçek satıştan kazanır; iki tarafın karakter satırları id sırasıyla kilitlenir.

### Prodüktör

Kayıtta prodüktörlük artık bir rol: kaydın yapımcılık değeri, kaydı başlatan dahil şehirdeki üyelerin en iyi yapımcısıdır (kayıt yapımcılığı + miks/mastering gibi becerilerin etkisi). İstenirse dışarıdan prodüktör tutulur: genç ($150, beceri 35), deneyimli ($600, 60), yıldız ($2.000, 85); ücret kayıt başında ödenir ve iyi olan değer kullanılır. Kaydın prodüktörü saklanır.

## Basın ve medya

Şöhretin yanında ikinci bir eksen. Kurallar `packages/shared/src/press.ts`, sunucu `server/src/game/press.ts`.

- **Basın desteği:** her grubun her şehirde ayrı bir basın desteği vardır (0–100, nötr 20): basın düşman 0 · soğuk 10 · nötr 20 · ilgili 40 · sıcak 60 · basının gözdesi 80. Konser seyircisini ×0,95–×1,2, şöhret kazancını ×0,94–×1,25 etkiler. Her oyun günü nötre olan mesafenin %3'ü kapanır. Grup ekranında şehrin altında kelimeyle görünür; VIP olmayanlara bulanık.
- **Basın toplantısı:** yalnızca lider, şehir gazetesinde, 2 saat, $100 × şehir çarpanı; grup ve şehir başına 72 oyun saatinde bir. **Röportaj:** her üye, 1 saat, ücretsiz, kişi başına 24 saatte bir. Başarı şansı = 0,4 + medya × 0,004 + retorik × 0,003 + karizma × 0,002 + şöhret ÷ 300 (%15–%95). Başarı: toplantı +6 (+medya ÷ 20) ve +0,3 şöhret, röportaj +3 (+karizma ÷ 40); başarısızlık −3 / −1. Başarılı toplantı son 7 gündeki yatıştırılmamış skandalın şöhret ve basın kaybının yarısını geri getirir.
- **Skandallar** basın desteğini düşürür: mahkûmiyet −15, iptal −8, felaket konser −10, bağımlılık −10.
- **Gazetecilik:** gazeteci mesleğindeki oyuncu gazetede 2 saatlik "haber yaz" eylemiyle başlık (3–80) ve metin (20–2.000 karakter) yazar, isteğe bağlı bir grup ve ton (olumlu, tarafsız, eleştirel) seçer. Etki = 2 + gazetecilik × 0,05 + söz yazımı × 0,02 + rütbe (eleştirel haberde %80'i). Kendi grubu hakkında haber etkisizdir; aynı gruba 72 saatte bir yazılır; bir grubun bir şehirdeki basın desteği haberlerle 7 günde toplam en fazla 20 puan oynar (toplu karalama ya da şişirme olmasın). Haber şehir gazetesi akışında yayınlanır, grubun üyelerine bildirim gider. Gazetecilik kitapçıdaki yeni bir beceridir (söz yazımında çırak).
- **Moderasyon:** başlık ve metin kontrol karakterlerinden temizlenir, küfür yıldızlanır. Haberler şikâyet edilebilir; yönetim panelinde "Son haberler ve yazılar" listesi ve şikâyet kuyruğundan kaldırılır, kaldırılan haberin basın etkisi geri alınır. Engellenen ya da engelleyen kişinin yazıları akışta görünmez.

## EFSANEVİ konser

DESTANSI'nın da üstünde, çok nadir bir seviye. DESTANSI kalitede (90+) biten bir konser %1 + grubun ortalama ilhamına göre %6'ya kadar olasılıkla EFSANEVİ olur. O gece:
- Şöhret artışı 1,5 katı, sahnedekilere "Efsanevi gece" moodlet'i ve +25 ilham, özel konser eleştirisi.
- Sahnedeki her üyenin o gece çaldığı (kuşandığı) enstrüman efsaneleşir: adı "Efsanevi …" olur, kalıcı +3 bonus alır ve hangi grubun gecesinde çalındığı yazar. İkinci el pazarında ve takasta bu ünvanıyla el değiştirir.

## Takas

Oyuncular birbirine takas teklif eder: her taraf en az bir, en fazla 6 eşya koyar; isteyen üstüne en fazla $5.000 ekleyebilir (para gönderme VIP'e özel olduğu için takas eşyasız olamaz). Aynı şehirde olmak gerekmez. Teklif sırasında eşyalar kilitlenmez; kabul anında her şey yeniden kontrol edilir (eşya hâlâ sahibinde mi, pazarda mı, evlilik teklifindeki yüzük mü, VIP eşyası VIP olmayana mı gidiyor, para yetiyor mu) ve tek işlemde el değiştirir. Bir şey değiştiyse takas düşer. Kişi başı en fazla 5 açık teklif. Enstrüman, kıyafet, araç, evcil hayvan ve sanat eserine isim verilebilir; isim ve renk takasta korunur.

## Yaşam mekânları

| Mekân | Ne yapılır |
|---|---|
| Restoran | Çorba ($6), günün yemeği ($15), şefin menüsü ($45) ve şehrin yerel lezzeti ($8–$20, yalnızca o şehirde): anında ruh hâli +4 – +15, sağlık +1 – +5. Yedikten sonra 2 saat tokluk. |
| Otel | Gecesi $45 (1, 3 ya da 7 gece). Ev tutmadığın şehirde dinlenmeyi bir daire kadar rahat yapar (+%30), evcil hayvanın da gelir. |
| Spor salonu | Saati $8. Antrenman kondisyon becerisini açar ve geliştirir. Kondisyon yorucu işlerde kaybedilen sağlığı %40'a kadar azaltır. |
| Banka | Bankadaki para cezalardan ve el konulmaktan korunur. Haftalık %0,3 faiz ($50.000'a kadar); faiz o hafta boyunca hesapta hep duran paraya işler. |
| Dövme stüdyosu | 8 desen ($120 – $2.000). Her dövme sahne imajına +1 (en fazla +4, en fazla 8 dövme). Silmek $250. Profilde görünür. |

## Oyuncu işletmeleri

Her şehirde 2 bar ve 2 restoran ruhsatı oyunculara satılıktır (bar $20.000, restoran $14.000, şehir çarpanıyla). Bir oyuncunun tek işletmesi olabilir.

- Sahip işletmeye isim verir; şehir listesinde ve mekânda bu isim görünür.
- En fazla 5 çalışan. Sahip isimle iş teklifi gönderir ($5 – $60 saatlik), oyuncu kabul ederse orada mesai yapar. Maaş kasadan ödenir; kasada maaş yoksa mesai başlamaz.
- Her mesai saati kasaya gelir getirir (bar saatte $20, restoran $24, şehir çarpanıyla; sahibin işletmecilik becerisiyle %50'ye kadar artar). Sahip kendi işletmesinde maaşsız çalışır, gelir kasaya gider.
- Bar: barda çalan oyuncu grupları bilet gelirinin sahip tarafından belirlenen payını (%0 – %30) öder. Oyunun kendi gruplarının konserinden pay alınmaz (eskiden NPC konserleri bar başına günde ~$50 yoktan para basıyordu).
- Restoran: menü fiyatı ×0,8 – ×1,6 ayarlanır; yenen her yemeğin malzeme dışındaki %60'ı kasaya girer. Randevular da burada ödenir.
- Haftalık gider (bar $350, restoran $300) önce kasadan, yetmezse sahibin cebinden alınır. İkisi de yetmezse işletme elden çıkar, çalışanlar işsiz kalır.
- İşletme ruhsat bedelinin yarısına geri satılabilir. Kasadan para çekilebilir ya da kasaya para konabilir; son hareketler listelenir.

## Büyük sahneler

- **Stadyum:** 20.000 kişi, bilet $40, "süperstar" şöhreti gerekir, şöhret kazancı ×3,5.
- **Festivaller:** her ülkede 14 oyun gününde bir, o ülkenin festival şehrinde. 4 gün başvuru açık kalır; başvurmak için grubun o şehirde en az "şehirde konuşuluyor" olması gerekir. Başvuru kapanınca en ünlü 6 grup seçilir (oyunun kendi grupları da başvurur), en ünlüsü en son çıkar. Her grup 2 saatlik bir dilimde 6 şarkılık set çalar, eksik roller kiralık müzisyenle doldurulur ve ücret alınmaz. Bilet $8 ama 12.000 kişilik alan ve ×3 şöhret kazancı vardır. Festival konserleri iptal edilemez.
- **Sahne efektleri:** konser ayarlarken envanterdeki efektler seçilir; konserde harcanır, iptalde geri verilir.

## Sosyal ve ilişkiler

- **Özel mesajlar:** oyuncular birbirine mesaj yazar; okunmamış mesaj sayısı sohbet sekmesinde görünür. İlk okunmamış mesajda bildirim gelir.
- **Arkadaşlık:** istek gönderme, kabul ve red, arkadaşlıktan çıkarma. Profilde arkadaş sayısı görünür.
- **Ziyaretçi defteri:** herkes başkasının profiline not bırakabilir (aynı kişiye 30 saniyede bir). Defter sahibi notları silebilir.
- **Hediye:** aynı şehirdeki arkadaşa eşya verilebilir (ilandaki eşya hariç; VIP eşyası sadece VIP üyeye).
- **Engelleme ve şikâyet:** engellenen kişi mesaj yazamaz, deftere yazamaz, ilişki eylemi yapamaz. Mesaj, defter notu ve profil şikâyet edilebilir.
- **İlişki:** aynı şehirde *takıl* (4 saatte bir) arkadaşlığı artırır, karizma hızlandırır. Takılmanın ruh hâli (+3), ilham ve "İyi sohbet" etkisi bir karakterde kayan 24 oyun saatinde en fazla 3 kez, aynı kişiyle bir kez işler (`HANGOUT_UPLIFTS_PER_DAY`); arkadaşlık her takılmada artar. Eskiden 3 ek hesapla bir günde ruh hâli 40 → 94'e pompalanıyordu. Arkadaşlık "arkadaş" seviyesine (30) gelince *flört* açılır (4 saatte bir); iki taraf da flört etmeden romantizm "hoşlanıyor" seviyesini (20) geçemez. Romantizm 20'de *restorana davet* (12 saatte bir, iki günün yemeği ödenir), 40'ta ilişki "sevgili" olur.
- **Nişan ve evlilik:** romantizm 70'te sevgiliye yüzükle evlilik teklif edilir; kabul edilirse yüzük karşı tarafa geçer. Teklif beklerken yüzük satılamaz, ilana konamaz, hediye edilemez. Düğün ibadethanede yapılır ($500). Evli çiftin evde birlikte dinlenmesi +%10 verim verir. Ayrılık bir tıkla, boşanma adliyede ($300).
- **Aile:** evli çift belediyede evlat edinebilir ($1.000, eşin onayı gerekir, karakter başına en fazla 4 çocuk). Eş ve çocuklar profilde görünür.
- **Tek gecelik macera** (`relations.ts`, sunucu `server/src/game/family.ts`): arayüz ve metinler imalı, genel izleyici seviyesinde; yalnızca mekanik. İki taraf da aynı bar, kulüp ya da oteldeyken biri teklif eder ("Geceyi birlikte geçirmeyi teklif et"), diğeri 2 oyun saati içinde kabul eder ya da reddeder. Flörtün arkadaşlık eşiğinden bağımsızdır ama engelleme ve yeni hesap kısıtı geçerlidir; iki taraf da yetişkin olmalıdır (oyun karakterleri 18 yaşında başlar, kural sunucuda ayrıca denetlenir; çocuklar oynanabilir karakter değildir). Aynı ikili 7 oyun gününde bir, bir karakter günde bir kez; iki taraftan 15 enerji. Verdikleri: "Tek gecelik macera" moodlet'i (+8, 12 saat) ve +5 ilham; arkadaşlığa +0,5, romantizme hiç (flört yerine geçmez); para, beceri ya da eşya yok. Bedelleri: %25 "Pişmanlık" (−6, 24 saat); taraflardan biri o şehirde en az yerel yıldızsa %30 olasılıkla magazin dedikodusu (küçük "affair" skandalı: −0,5 şöhret, −6 basın); sevgilisi, nişanlısı ya da eşi olan katılırsa pişmanlık kesin ve aldatma %35 (+%30 dedikodu olduysa, +%20 partner aynı şehirdeyse, en fazla %90) olasılıkla ortaya çıkar: partnere "Aldatıldı" (−18, 72 saat) ve bildirim, romantizm −25, arkadaşlık −10; sevgililik ya da nişanda romantizm 30'un altına düşerse ilişki biter (iki tarafa kalp kırıklığı); evlilik kendiliğinden bitmez. Üç macera gizli "Çapkın" başarımı ve ünvanı. Kayıtlar `fling_offers` ve `flings` (migration 018).
- **Aile ve çocuklar:** çocuklar oyun takvimiyle büyür (oyun yılı 56 gün): bebek (0–2), çocuk (3–12), genç (13–17), yetişkin (18+); profilde ad, yaş ve basamak görünür. Reşit olmayan her çocuğun haftalık bakım gideri $100 × şehir çarpanıdır (eskiden $40) ve iki ebeveyne yarı yarıya düşer (boşanmış olsalar da; velayet yerine basit paylaşım). Ödeyen ebeveyne "Aile akşamı" (+6, 24 saat) ve +3 ilham, bebeği olana ayrıca "Uykusuz gece" (−4); parası yetmeyene borç yazılmaz, "Aile bütçesi" (−8, 48 saat) gelir. Gider oyundan çıkar, çocuk para, beceri ya da şöhret kazandırmaz. Evlat edinmede iki eş de yeni hesap olamaz; karakter başına en fazla 4 çocuk (eskiden çift başına: farklı eşlerle sınırsız) ve $1.000 ücret aynen. Ebeveynin hesabı silinse de çocuk kaydı korunur. Yetişkin çocuğun mirasçı ya da yeni karakter olarak seçilmesi (nesiller) sonraki adıma bırakıldı.
- **Aile planlaması ve hamilelik** (`relations.ts`, sunucu `family.ts`, migration 019): açık içerik yok, yalnızca mekanik; bütün taraflar yetişkin, her adım karşılıklı onaylı.
  - **Ayar:** "Çocuk sahibi olmaya açığım" (kendi profilinde), varsayılan kapalı. Kapalıysa hiçbir yolla hamilelik olmaz; hamilelik için iki tarafın da açık olması gerekir. Kapatmanın geçmişe etkisi yok (süren hamilelik korunur).
  - **Korunma:** prezervatif hastanenin eczane rafında ($4, yığılabilir; dükkân kurallarına tabi). Tek gecelik teklifte ve kabulde iki taraf da korunmalı/korunmasız seçer; biri korunmak isterse korunmalı olur ve önce isteyenin envanterinden bir prezervatif harcanır, kimsede yoksa birliktelik olmaz (`no_protection`). Korunmalıda ihtimal tam sıfır. Korunmasız ve iki tarafın da ayarı açıksa ihtimal %1,5 (`FLING_PREGNANCY_CHANCE`); biri kapalıysa sıfır. Taşıyan, uygun olanlar arasından zarla seçilir.
  - **Bilinçli deneme:** sevgili, nişanlı ya da evli çift (romantizm 40+), aynı şehirde, iki tarafın da ayarı açık: biri "Çocuk sahibi olmayı deneyelim" der ve taşıyanı önerir (ben / o; cinsiyetten bağımsız), diğeri 6 oyun saati içinde kabul eder. Deneme başına %25, iki taraftan 10 enerji, çift başına 3 oyun günü bekleme.
  - **Hamilelik:** 20 oyun günü; taşıyanda "Bebek bekliyor" moodlet'i (+4); konser, iş ve diğer eylemler engellenmez, sağlık ya da ölüm riski yok. Aynı anda tek hamilelik; doğumdan sonra taşıyan için 30 oyun günü bekleme. Çocuk sınırı (karakter başına 4, iki taraf için de; süren hamilelikler dahil) doluysa hamilelik oluşmaz. Zamanlayıcının "doğumlar" aşaması vadesi gelen hamileliği sonuçlandırır: çocuk iki ebeveyne bağlı `children` kaydı olur (ad ebeveynin ülkesine göre), iki ebeveyne "Yeni ebeveyn" (+15, 72 saat) ve bildirim; bakım gideri aile kuralıyla paylaşılır, kimse tek taraflı silemez. VIP olmayanlara doğuma kalan gün beşer günlük adımlarla gider.
  - Terminasyon, evlatlık verme, kısırlık, sağlık ya da ölüm riski mekaniği yoktur. Ek hesapla çocuk çiftliğine karşı: yeni hesap kısıtı, engelleme, çocuk sınırı, bekleme süreleri, bakım gideri; çocuk para, beceri ya da şöhret kazandırmaz.
- Arkadaşlık ve romantizm de kelimeyle gösterilir: yabancı → tanıdık → arkadaş → yakın arkadaş → can dostu; kıvılcım yok → hoşlanıyor → ilgileniyor → âşık → sırılsıklam âşık → ruh eşi.

## Haftalık görevler

Her liste haftası (7 oyun günü) her oyuncuya görev havuzundan 3 görev düşer (konser ver, şarkı yaz, prova yap, mesai yap, antrenman, yemek, takıl, üret, kayıt…). İlerleme o hafta yapılanlardan hesaplanır, ödül ($20 – $60) bir kez alınır. Ödüller küçük; para asıl müzikten ve meslekten gelmeli. Görev kartı ana sayfada.

## Yeni beceri alanları

| Alan | Beceriler | Nerede öğrenilir |
|---|---|---|
| Sosyal | Karizma (takılmayı hızlandırır), baştan çıkarma (flört ve randevuyu hızlandırır, karizma ister) | Kitapçı |
| Spor | Kondisyon | Spor salonu |
| Zanaat | El işçiliği | Kitapçı, atölyede gelişir |
| Kariyer (ek) | İşletmecilik (işletme gelirini artırır, ekonomi ister) | Üniversite |

### Kariyer becerilerinin etkileri

Kurallar `packages/shared/src/perks.ts`. Etkiler küçük ve tavanlıdır (beceri 100'de tavana varır); etkiyi o işte grubun en iyi üyesi taşır.

| Beceri | Etki (beceri 100'de) | Kimin becerisi |
|---|---|---|
| Pazarlama | Konser seyircisi +%5, haftalık plak satışı +%5 | Grubun en iyisi |
| Muhasebe | Tur ekibi ücreti, işletme ve plak şirketi haftalık gideri −%10 | Grubun en iyisi; giderde işletmenin sahibi |
| Lojistik | Konser başı ekip moral kaybı −%30, sahnedeki enstrümanların yıpranması −%25 (ekip olmasa da) | Sahnedekilerin en iyisi |
| Sözleşme hukuku | Plak şirketi sözleşmesinde grubun pay tavanı %60 → %65 (veritabanı kısıtı migration 015 ile %65) | Grup lideri (kabul anında yeniden kontrol edilir) |
| Radyo programcılığı | Single'ların radyoda çalınması +%10 (şöhret ve satış etkisinin tavanları aynı) | Grubun en iyisi |
| Fotoğrafçılık | Haberin basın etkisi +2 (olumsuzda %80'i, haftalık 20 puan tavanı aynı), klip kalitesi +4 | Haberde yazar; klipte şehirdeki üyelerin en iyisi |

VIP olmayanlara sözleşmedeki azami pay yüzde puanına yuvarlanarak gider.

## Özel ders ve birlikte çalışmak

Kurallar `packages/shared/src/lessons.ts`, sunucu `server/src/game/lessons.ts`. Ders süreli `lesson` eylemidir (1, 2 ya da 4 oyun saati). **Özel ders bir beceriyi açmaz**, yalnızca bilinen beceriyi geliştirir: kitap, ilk grup dersi, öncül ve VIP kilitleri aynen geçerli. Öğrenci hocasının seviyesini geçemez (kazanç o seviyede kesilir).

| Öğretmen | Nerede | Ücret | Verim (çalışma çarpanı) | Sınırlar |
|---|---|---|---|---|
| Kendi kendine | her yerde | yok | ×1,0 | |
| Grup dersi | okul / üniversite | $30 / $40 saatlik × şehir | ×2,2 | |
| Profesör (oyunun kadrosu) | okulda enstrüman, müzik, sahne, tür; üniversitede kariyer | $90 / $120 saatlik × şehir | ×3,2 | Her şehirde her alanın bir profesörü (75 profesör, adlı); profesörün tavanı 60–85 (alan ve şehrin müzik geleneğine göre). Ücretli özel ders günde en fazla 4 saat. |
| Oyuncu öğretmen | müzik okulu, öğretmen de okulda olmalı | öğretmen belirler: $10–$120 saatlik | ×2,6 + rütbe başına 0,15 (en fazla ×3,05) | Yalnızca müzik öğretmeni mesleği; okulda öğretilen kategoriler; öğretmen öğrenciden en az 10 iyi olmalı. Ücretin %20'si okula (oyundan çıkar), kalanı öğretmene; öğretmen günde en fazla $400 kazanır; iki taraf da yeni hesap olamaz. Öğretmen ders başına küçük beceri pekiştirmesi ve yarım saat meslek ilerlemesi alır. |
| Arkadaş ya da sevgili | aynı şehir | ücretsiz | tanıdık ×1,2 · arkadaş ×1,4 · yakın arkadaş ×1,6 · can dostu ×1,8; sevgili/nişanlı +0,2, evli +0,3; en fazla ×1,9 | Yabancıdan ders yok; öğreten en az 5 iyi olmalı; öğrenci günde en fazla 4 saat; aynı ikili 6 oyun saatinde bir; sokak (suç) becerileri arkadaştan öğrenilmez. Öğreten küçük pekiştirme ve +1 arkadaşlık alır. |

- **Ona öğret:** profilde arkadaşına ders teklif edilir (bildirim; ikili başına 6 oyun saatinde bir). Ders öğrenci "Ondan öğren"e dokununca başlar; karşı tarafın vakti harcanmaz.
- **Sömürü önlemleri:** kendine ders yok; engelleme her yönde geçerli; iki karakter id sırasıyla kilitlenir ve ücret, öğretmen payı, pekiştirme ve kayıt aynı veritabanı işleminde yazılır (`lesson_log`, migration 017); kontenjan, bekleme ve kazanç tavanı bu kayıttan hesaplanır. Öğretmenin payı ödenenin altında kaldığı için para çoğalmaz; ek hesaptan ana hesaba ders üzerinden taşınabilecek para günde en fazla $400 ve yalnızca müzik öğretmeni mesleğinde (beceri şartı 45) mümkündür.
- **Görünürlük:** VIP olmayanlara ders verimi yarımlık adımlarla, profesörün tavanı beceri ölçeğinde bulanık gider.
- Arayüz: okul ve üniversite sayfasında "Özel ders" bölümü (profesör, okuldaki öğretmenler, ücret, bugün kalan saat; müzik öğretmeni burada ücretini belirler); profilde "Birlikte çalışın" (Ondan öğren, Ona öğretmeyi öner); bildirimler: ders verdin, ders teklifi.

## Topluluk: pano, bloglar ve dergi

Şehir sekmesinden "Topluluk" ekranı açılır. Kurallar `packages/shared/src/community.ts`, sunucu `server/src/game/community.ts`; yazılar haberlerle aynı `articles` tablosunda (tür: news, blog, board).

- **Şehir panosu:** o şehirdeki oyuncu 280 karakterlik not bırakır (oyun saatinde bir; cezaevinden yazılamaz). Notlar 7 oyun günü akışta kalır.
- **Blog:** herkes yazabilir (başlık 3–80, metin 20–3.000 karakter, 12 oyun saatinde bir); yazı yazarın bulunduğu şehrin blog akışında ve profilinde görünür. Yazar kendi blog ve pano yazısını silebilir; haberler basın etkisi taşıdığı için yalnızca yönetici kaldırır.
- **Haftalık dergi:** son kapanan liste haftasında o şehirde yayınlanan haberlerden etkisi en büyük 10 tanesi (gazeteci oyuncular ve gazetenin kendi muhabirleri).
- **Moderasyon:** bütün metinler kontrol ve görünmez karakterlerden temizlenir, küfürler yıldızlanır. Engellenen ya da engelleyen kişinin yazıları akışlarda ve profilde görünmez. Her yazı şikâyet edilebilir (aynı kişi aynı yazıyı bir kez); şikâyetler yönetim panelindeki kuyruğa "Haber / yazı" türüyle düşer, panelde ayrıca "Son haberler ve yazılar" listesi ve tek tıkla kaldırma ve banlama var.

## Mağaza uyumu ve moderasyon

- Kayıtta kullanım şartları ve gizlilik politikası onayı zorunlu; ikisi de `/legal/terms` ve `/legal/privacy` adreslerinde yayınlanır (`server/legal/*.md`, iletişim adresi `CONTACT_EMAIL`).
- Uygulama içinden hesap silme (şifreyle onay): karakter, mesajlar, fotoğraf ve tüm oyun verisi silinir; grup liderliği bir üyeye geçer ya da grup dağılır.
- Türkçe ve İngilizce küfür filtresi: sohbet, mesaj, defter, biyografi ve başlıkta küfürler yıldızlanır; karakter, grup, işletme, eşya ve çocuk isimlerinde küfür reddedilir.
- Engelleme ve şikâyet her sosyal alanda var (mesaja basılı tutarak, defter notunun, profilin, haberin ve topluluk yazısının altındaki düğmeyle). Yönetim panelindeki şikâyet listesinden içerik tek tıkla kaldırılır ya da yazan banlanır.

## Ek hesaplara karşı önlemler

- Yeni hesaplar ilk 72 oyun saati pazar, takas, hediye, para gönderme, işletme kasasına para koyma ve iş teklifi kullanamaz.
- El değiştiren bir eşya (pazar, takas, hediye) bir oyun haftası içinde, o hafta **elinden geçtiği hiç kimseye** geri dönemez (zincirin her eli: A → B → C → A da kapalı). Geçmiş `item_handoffs` tablosunda (migration 020). Eskiden yalnızca bir önceki sahibe bakılıyordu ve 3 hesapla eşya aynı saatte geri dönüyordu (denge raporu §7: 4 döngüde +$20.000).
- Pazarda fiyat tavanı dükkân fiyatının iki katıdır; takasta eklenen para, karşılığında alınan eşyaların **dükkân değerini** geçemez (eskiden iki katı; en fazla $5.000).
- **İkili başına haftalık para akışı tavanı:** iki oyuncu arasında bir yönde akan NET para (takas parası + pazar alışı + VIP para gönderme) kayan 7 oyun gününde en fazla $5.000 (`PAIR_TRANSFER_CAP`, `player_money_flows`). Oyunun tüccarından alışlar sayılmaz. Tavan dolunca `transfer_cap_reached`; açık takas açık kalır.
- Aynı adresten 24 saatte en fazla 3 hesap açılır (`REGISTER_PER_IP_DAY`). Adres yalnızca yapılandırılmış güvenilir kaynaktan alınır (`TRUST_PROXY_HOPS`, `CLIENT_IP_HEADER`; README "İstemci adresi"); istemcinin yazdığı başlıklar varsayılan olarak okunmaz. IPv6'da /64 bloğu tek adres sayılır. API istek sınırı da aynı adresi kullanır.
- Rehber ve görev ödülleri küçüktür; API'de dakikada 300 istek sınırı vardır.

## Oyuncular

Şehir sekmesinden "Oyuncular" ekranı açılır: şehirde en son hareket eden oyuncular önce, isimle arama da var. Sohbette isme ya da fotoğrafa dokunmak profili açar. Engellediğin ya da seni engelleyen oyuncular listede görünmez.

## Sosyal

- Şehir sohbeti (sadece o şehirdeyken) ve grup sohbeti.
- Grup daveti, kabul ve red, gruptan çıkarma, ayrılma (lider ayrılırsa liderlik en eski üyeye geçer, son üye ayrılırsa grup dağılır).
- Oyuncu ve grup profilleri, dünya ve şehir liderlik tabloları.
- Bildirimler: mesaj, arkadaşlık isteği ve kabulü, defter notu, hediye, takılma, flört, randevu, evlilik teklifi ve cevabı, düğün, ayrılık, boşanma, evlat edinme, pazarda satış, iş teklifi ve cevabı, işten çıkarılma, işletmeye el konulması, festivale seçilme, eylem bitti, konser ayarlandı, iptal edildi, sonuçlandı, davet geldi, üye katıldı veya ayrıldı, seviye atlandı, şöhret arttı, terfi edildi, seçim kazanıldı veya kaybedildi, makam sona erdi, para geldi, başarım açıldı, yeni yayın, haftalık satış raporu, tutuklama, mahkûmiyet, beraat, tahliye, kira ödendi, evden çıkarıldı.

## Sonraki adımlar için öneriler

Henüz eklenmemiş olanlar, önem sırasıyla (Popmundo karşılaştırmasındaki 8 boşluk kapatıldı; kalanlar):

1. **Makamlara gerçek yetkiler:** başkanın şehirdeki vergi ya da bilet payını belirlemesi, emniyet müdürünün devriye ve suçla mücadele kararları.
2. **Ekonomi: sürekli harcama yerleri.** Denge ölçümüne göre salon ve stadyum seviyesinde para harcama yerlerinden onlarca kat hızlı birikiyor (bkz. "Tempo" altında "Denge ölçümü"). Şöhretle büyüyen sürekli giderler ya da yeni pahalı içerik gerekiyor; gerekirse ikinci adım olarak grubun günlük konser sayısına sınır.
3. **Nesiller:** çocukların büyüyüp oynanabilir karakter olması, miras.
4. **Daha fazla işletme türü:** plak dükkânı, kayıt stüdyosu, konser salonu ruhsatları.
5. Turne paketleri.
