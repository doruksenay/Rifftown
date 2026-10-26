# Rifftown marka rehberi

**Şehir senin. Sahne senin.** · *Your City. Your Stage.*

![Marka panosu](docs/brand-board.png)

## Logo

| Dosya | Ne için |
|---|---|
| `app/assets/images/logo.png` | Penalı tam logo, açık zemin (saydam PNG) |
| `app/assets/images/logo-dark.png` | Karanlık zemin: "Riff" yazısı beyaz |
| `app/assets/images/pick.png` | Sadece pena simgesi (saydam) |
| `app/assets/images/icon.png` | Uygulama simgesi (1024 × 1024, kırık beyaz zemin) |
| `app/assets/images/android-icon-*.png` | Android uyarlanabilir simge (ön plan, zemin, tek renk) |
| `app/assets/images/splash-icon.png` | Açılış ekranı |
| `app/assets/images/notification-icon.png` | Android bildirim simgesi (beyaz siluet) |
| `app/assets/images/icon-512.png` | Google Play mağaza simgesi |

Simgeler `docs/brand-board.png` panosundaki logodan üretildi. Logonun vektör (SVG) ya da daha yüksek çözünürlüklü bir sürümü elinize geçerse aynı dosya adlarıyla değiştirin. Mağaza öne çıkan görselleri için en az 2048 px'lik bir kaynak önerilir.

## Renkler

| Ad | Kod | Kullanım |
|---|---|---|
| Neon Cyan | `#00E5FF` | Karanlık temada ilerleme ve seçili öğeler, gösterge degradesinin başı |
| Hot Pink | `#FF2EB6` | Vurgu, ana düğme degradesinin başı, DESTANSI kalite |
| Electric Purple | `#8A2BFF` | Ana düğme degradesinin sonu, süren eylem bileti |
| Sky Blue | `#3B82FF` | Gösterge degradesinin sonu |
| Midnight Indigo | `#1A0E4B` | Açık temada metin, karanlık temada kartlar |
| Soft Off-White | `#F8F9FF` | Açık temada zemin, karanlık temada metin |

Açık temada küçük metinlerde markanın okunur (WCAG AA) tonları kullanılır: pembe `#D9119A`, mavi `#2563EB`. Tüm değerler `app/src/theme.ts` dosyasında.

Degradeler:
- **Ana düğme:** Hot Pink → Electric Purple
- **Göstergeler:** Neon Cyan → Sky Blue
- **Özel rozetler (VIP):** Cyan → Pink → Purple, logodaki "town" gibi

## Yazı tipleri

- **Başlıklar:** Rifftown Display 600 / 700: [Fredoka](https://fonts.google.com/specimen/Fredoka) temel alınıp eksik Türkçe harfleri (Ş ş Ğ ğ İ) eklenmiş sürüm (`app/assets/fonts`). Yuvarlak hatlı, logodaki yazıya yakın. Google'ın Fredoka dosyasında bu harfler olmadığı için başka bir yerde Fredoka kullanılacaksa bu dosyalar kullanılmalı.
- **Metin:** [Nunito](https://fonts.google.com/specimen/Nunito) 500 / 700 / 800.

İkisi de SIL Open Font License ile ücretsizdir. Nunito `@expo-google-fonts/nunito` paketinden, Rifftown Display `app/assets/fonts` klasöründen yüklenir.

## Biçim

- Köşeler yumuşak: kartlar 18, giriş alanları 12, düğmeler hap şeklinde.
- Ana düğmeler degradeli, ikincil düğmeler ince çerçeveli, metin düğmeleri mavi.
- Ses tonu: oyuncu, modern, samimi. Oyuncuya "sen" diye hitap edilir.

## Çizimler: "Gece Rifftown"

Oyundaki bütün resimler kodla çizilir (`app/src/components/art`, react-native-svg); dışarıdan görsel dosyası yok, telefonda da web'de de keskin görünür.

- **Şehir silüetleri:** gece göğü, üç kat bina, yanan pencereler ve her şehrin simge yapısı (Galata Kulesi, Atakule, Saat Kulesi, TV Kulesi, Elbphilharmonie, Frauenkirche, Big Ben, Beetham Tower, Liver Building, Eyfel, Fourvière, Notre-Dame de la Garde, Empire State, palmiyeli tepeler, Nashville'in iki sivri kuleli binası). Aynı şehir her açılışta aynı silüeti verir. Ana ekranda, şehir sekmesinde, profilde ve seyahat listesinde.
- **Mekân sahneleri:** her mekân geceleyin ışıkları yanan bir yer. Konser mekânları içeriden görünür (barda "LIVE" neon tabela ve tuğla duvar, kulüpte lazerler ve disko topu, salonda perdeler, stadyumda projektörler, festivalde çadırlar ve bayraklar); seyirci kalabalığı konserin gerçek doluluğuna göre çizilir. Dükkânların vitrininde sattıkları durur (gitarlar, ceketler, araba, sprey boyalar, tablolar, kitaplar); kamu binaları sütunlu, karakol ışıklı, cezaevi gözetleme kuleli.
- **Eşya çıkartmaları:** gitar kutusuna yapıştırılmış çıkartma gibi beyaz kenarlı. Arka plan seviyeyi gösterir (1 lacivert, 2 mavi, 3 mor-pembe, 4 altın). Enstrüman, kıyafet, araba ve sprey boyalar boyandıkları renkte çizilir; EFSANEVİ eşyanın kenarı altın ve köşesinde yıldız var.
- **Çizim avatarlar:** fotoğraf yüklemeyen her oyuncuya isminden türeyen, hep aynı kalan bir portre (ten, saç modeli ve rengi, gözlük, küpe, sakal). Gömlek oyuncunun seçtiği avatar rengindedir.
- **Rozetler:** şehir listesinde her mekânın, beceri listesinde her kategorinin renkli rozeti.

Renkler marka paletinden; tek ek renk pencerelerden sızan sıcak lamba ışığı `#FFD36E` (soğuk neonun yanında "burada yaşanıyor" hissi için, idareli).
