// İçerik: daha fazla kuşanılabilir eşya (enstrüman, kıyafet, araç, evcil hayvan), sahne efekti, sanat ve koleksiyon.
// Veri odaklı: yeni eşya bir satır. Bu dosya ../items'tan yalnızca tür alır (çalışma anında döngüsel bağımlılık olmasın).
//
// Denge kuralları (server/test/content-volume.test.ts ve items-depth.test.ts denetler):
// - Enstrüman ve kıyafetler var olan fiyat/bonus merdiveninin ara basamaklarıdır. Tür uyumlu bir eşya kendi türünde bile
//   en az iki katı fiyatlı aynı yuvadaki eşyanın taban bonusuna yetişemez; her yuvada tek eşya kuşanılır.
// - Evcil hayvanlarda bonus fiyatla birlikte artar (ucuz hayvan pahalısından iyi değil).
// - Sahne efektlerinde ve sanatta puan başı fiyat var olan en ucuz eşyadan (sis makinesi $40, konser afişi $24) düşük değil:
//   tavanlar (efekt +12, sanat %40) daha ucuza doldurulamaz.
// - Koleksiyonlar yalnızca başarım ve ünvan verir (para vermez).

import type { GearSetDef, ItemDef } from '../items';
import type { L } from '../world';

type Shop = ItemDef['shop'];
type Slot = ItemDef['slot'];
const I = (id: string, shop: Shop, slot: Slot, tier: ItemDef['tier'], price: number, bonus: number, tr: string, en: string, extra: Partial<ItemDef> = {}): ItemDef => ({
  id,
  shop,
  slot,
  tier,
  price,
  bonus,
  name: { tr, en },
  ...extra,
});

// ---------- Enstrümanlar: her rolde dört yeni model, hepsi türe yatkın ----------
// Basamaklar: $250/+4, $600/+6, $1.400/+8, $3.000/+11; tür uyumu +1 (merdiven: 150/3, 900/7, 4.000/12, VIP 9.000/15)

type Model = [string, string, ItemDef['genres']];
const MODEL_STEPS = [
  { price: 250, bonus: 4, tier: 1 as const },
  { price: 600, bonus: 6, tier: 1 as const },
  { price: 1400, bonus: 8, tier: 2 as const },
  { price: 3000, bonus: 11, tier: 3 as const },
];
const models = (slot: Slot, list: [Model, Model, Model, Model]): ItemDef[] =>
  list.map(([tr, en, genres], i) => I(`${slot}_m${i + 1}`, 'music_store', slot, MODEL_STEPS[i].tier, MODEL_STEPS[i].price, MODEL_STEPS[i].bonus, tr, en, { genres, genreBonus: 1 }));

const INSTRUMENT_MODELS: ItemDef[] = [
  ...models('guitar', [
    ['İkinci el punk gitarı', 'Second-hand punk guitar', ['punk', 'rock']],
    ['Arch-top blues gitarı', 'Archtop blues guitar', ['blues', 'jazz']],
    ['Fuzz pedallı stoner gitarı', 'Stoner guitar with fuzz pedal', ['rock', 'metal']],
    ['Usta yapımı flamenko gitarı', 'Luthier flamenco guitar', ['classical', 'folk']],
  ]),
  ...models('bass', [
    ['Kısa kollu punk bası', 'Short-scale punk bass', ['punk', 'rock']],
    ['Dub bası (yassı teller)', 'Dub bass (flatwound strings)', ['reggae', 'soul']],
    ['Altı telli füzyon bası', 'Six-string fusion bass', ['jazz', 'metal']],
    ['Manyetikli kontrbas', 'Upright bass with pickup', ['jazz', 'blues', 'country', 'classical']],
  ]),
  ...models('drums', [
    ['Cajon ve fırça seti', 'Cajon and brushes', ['folk', 'country']],
    ['Hip-hop sample pad seti', 'Hip-hop sample pad rig', ['hiphop', 'electronic']],
    ['Çift pedallı metal seti', 'Double-pedal metal kit', ['metal', 'punk']],
    ['Vintage soul davul seti', 'Vintage soul drum kit', ['soul', 'blues', 'reggae']],
  ]),
  ...models('keys', [
    ['Melodika', 'Melodica', ['reggae', 'folk']],
    ['Wurlitzer tarzı elektrik piyano', 'Wurlitzer-style electric piano', ['soul', 'pop']],
    ['Klavsen sesli sahne klavyesi', 'Harpsichord-voiced stage keyboard', ['classical']],
    ['Polifonik analog synth', 'Polyphonic analogue synth', ['electronic', 'pop']],
  ]),
  ...models('vocals', [
    ['Kulaklıklı rap mikrofonu', 'Rap mic with headphones', ['hiphop']],
    ['Vintage kristal mikrofon', 'Vintage crystal mic', ['blues', 'country', 'folk']],
    ['Şerit (ribbon) mikrofon', 'Ribbon microphone', ['jazz', 'soul', 'classical']],
    ['Kablosuz kafa mikrofonu seti', 'Wireless headset mic rig', ['pop', 'electronic']],
  ]),
  ...models('sax', [
    ['Plastik alto saksofon', 'Plastic alto sax', ['reggae', 'punk']],
    ['Soprano saksofon', 'Soprano sax', ['jazz', 'pop']],
    ['Vintage C-melody saksofon', 'Vintage C-melody sax', ['blues', 'soul']],
    ['Altın kaplama tenor saksofon', 'Gold-plated tenor sax', ['jazz', 'soul']],
  ]),
  ...models('violin', [
    ['Karbon öğrenci kemanı', 'Carbon student violin', ['folk', 'country']],
    ['Elektrikli keman', 'Electric violin', ['rock', 'electronic', 'metal']],
    ['Viyola', 'Viola', ['classical', 'folk']],
    ['Beş telli caz kemanı', 'Five-string jazz violin', ['jazz', 'country']],
  ]),
  ...models('percussion', [
    ['Tef ve zil seti', 'Frame drum and cymbals', ['anatolian', 'folk']],
    ['Bongo ve shaker seti', 'Bongos and shakers', ['reggae', 'pop']],
    ['Djembe takımı', 'Djembe set', ['folk', 'reggae', 'hiphop']],
    ['Timbal ve konga sahne kurulumu', 'Timbales and conga stage rig', ['soul', 'jazz', 'pop']],
  ]),
];

// ---------- Kıyafetler: basamaklar $130/+2, $300/+4, $800/+6, $1.600/+8, $3.000/+10, $5.000/+13 ----------

const O = (id: string, price: number, bonus: number, tier: ItemDef['tier'], tr: string, en: string, genres: ItemDef['genres'], genreBonus = 1) =>
  I(id, 'boutique', 'outfit', tier, price, bonus, tr, en, { genres, genreBonus });

const OUTFITS: ItemDef[] = [
  O('outfit_hoodie', 130, 2, 1, 'Bol kapüşonlu ve snapback', 'Baggy hoodie and snapback', ['hiphop']),
  O('outfit_knitvest', 130, 2, 1, 'Örgü yelek ve kasket', 'Knit vest and flat cap', ['folk']),
  O('outfit_mesh', 130, 2, 1, 'Neon fileli üst', 'Neon mesh top', ['electronic']),
  O('outfit_studs', 130, 2, 1, 'Çivili bileklik ve yırtık tişört', 'Studded cuffs and ripped tee', ['punk']),
  O('outfit_flannel', 300, 4, 1, 'Flanel gömlek ve yırtık kot', 'Flannel shirt and torn jeans', ['rock', 'punk']),
  O('outfit_bomber', 300, 4, 1, 'Saten bomber ceket', 'Satin bomber jacket', ['pop', 'electronic']),
  O('outfit_fedora', 300, 4, 1, 'Fötr şapka ve pantolon askısı', 'Fedora and braces', ['blues', 'jazz']),
  O('outfit_kilt', 300, 4, 1, 'Kareli kilt ve postal', 'Tartan kilt and boots', ['punk', 'folk']),
  O('outfit_rasta', 800, 6, 2, 'Rasta bere ve keten gömlek', 'Rasta tam and linen shirt', ['reggae']),
  O('outfit_fringe', 800, 6, 2, 'Saçaklı süet ceket', 'Fringed suede jacket', ['country', 'folk']),
  O('outfit_folkvest', 800, 6, 2, 'Yöresel işlemeli yelek', 'Embroidered folk waistcoat', ['anatolian', 'folk']),
  O('outfit_disco', 800, 6, 2, 'Disko gömleği ve İspanyol paça', 'Disco shirt and flares', ['soul', 'pop']),
  O('outfit_goldchain', 1600, 8, 2, 'Altın zincirli eşofman takımı', 'Tracksuit with gold chains', ['hiphop']),
  O('outfit_cloak', 1600, 8, 2, 'Deri pelerin ve zincirler', 'Leather cloak and chains', ['metal']),
  O('outfit_velvettux', 1600, 8, 2, 'Kadife smokin ceket', 'Velvet tuxedo jacket', ['soul', 'jazz']),
  O('outfit_holo', 1600, 8, 2, 'Holografik yağmurluk', 'Holographic raincoat', ['electronic']),
  O('outfit_streetwear', 3000, 10, 3, 'Tasarımcı streetwear koleksiyonu', 'Designer streetwear collection', ['hiphop', 'pop'], 2),
  O('outfit_tailcoat', 3000, 10, 3, 'Konser frakı', 'Concert tailcoat', ['classical'], 2),
  O('outfit_crystal', 5000, 13, 3, 'Kristal işlemeli sahne tulumu', 'Crystal-studded stage jumpsuit', ['pop']),
  O('outfit_bespoke', 5000, 13, 3, 'Usta terzi işi takım elbise', 'Bespoke tailored suit', ['jazz', 'blues']),
];

// ---------- Araçlar ve evcil hayvanlar ----------

const VEHICLES: ItemDef[] = [
  I('bicycle_1', 'car_dealer', 'vehicle', 1, 300, 0, 'Bisiklet', 'Bicycle', { speed: 1.1 }),
  I('moto_2', 'car_dealer', 'vehicle', 2, 7000, 0, 'Kafe yarışçısı motosiklet', 'Café racer motorbike', { speed: 1.8 }),
  I('ev_1', 'car_dealer', 'vehicle', 2, 14000, 0, 'Elektrikli sedan', 'Electric saloon', { speed: 1.75 }),
  // Karavan otobüsten çok hızlı değil ama "Yol türküsü" setinin parçası
  I('camper_1', 'car_dealer', 'vehicle', 2, 11000, 0, 'Karavan', 'Camper van', { speed: 1.45 }),
  I('bus_1', 'car_dealer', 'vehicle', 3, 45000, 0, 'Turne otobüsü', 'Tour bus', { speed: 2.1 }),
  I('car_5', 'car_dealer', 'vehicle', 4, 90000, 0, 'Limuzin', 'Limousine', { speed: 2.3, vip: true }),
];

const PETS: ItemDef[] = [
  I('pet_hamster', 'pet_shop', 'pet', 1, 90, 3, 'Hamster', 'Hamster'),
  I('pet_canary', 'pet_shop', 'pet', 1, 150, 4, 'Kanarya', 'Canary'),
  I('pet_gecko', 'pet_shop', 'pet', 1, 300, 6, 'Leopar geko', 'Leopard gecko'),
  I('pet_hedgehog', 'pet_shop', 'pet', 2, 450, 8, 'Kirpi', 'Hedgehog'),
  I('pet_pug', 'pet_shop', 'pet', 2, 800, 10, 'Pug', 'Pug'),
  I('pet_husky', 'pet_shop', 'pet', 2, 1200, 11, 'Husky', 'Husky'),
  I('pet_mainecoon', 'pet_shop', 'pet', 3, 2000, 12, 'Maine coon kedisi', 'Maine coon cat'),
  I('pet_vancat', 'pet_shop', 'pet', 4, 3000, 14, 'Van kedisi', 'Van cat', { vip: true }),
];

// ---------- Sahne efektleri (konserde tüketilir; toplam en fazla +12) ----------

const FX: ItemDef[] = [
  I('fx_sparklers', 'stage_shop', 'fx', 1, 100, 2, 'Sahne maytapları', 'Stage sparklers', { stackable: true }),
  I('fx_streamers', 'stage_shop', 'fx', 1, 120, 2, 'Serpantin topu', 'Streamer cannon', { stackable: true }),
  I('fx_lanterns', 'stage_shop', 'fx', 1, 140, 3, 'Kâğıt fener tavanı', 'Paper lantern ceiling', { stackable: true }),
  I('fx_uv', 'stage_shop', 'fx', 2, 260, 4, 'UV ışık ve fosforlu boya', 'UV light and glow paint', { stackable: true }),
  I('fx_moving', 'stage_shop', 'fx', 2, 420, 4, 'Hareketli ışık kafaları', 'Moving-head lights', { stackable: true }),
  I('fx_kabuki', 'stage_shop', 'fx', 2, 500, 5, 'Düşen perde açılışı', 'Kabuki curtain drop', { stackable: true }),
  I('fx_rain', 'stage_shop', 'fx', 3, 650, 5, 'Sahneye yapay yağmur', 'Stage rain curtain', { stackable: true }),
  I('fx_flames', 'stage_shop', 'fx', 3, 700, 6, 'Alev kuleleri', 'Flame towers', { stackable: true }),
  I('fx_drones', 'stage_shop', 'fx', 3, 1000, 6, 'Işıklı drone gösterisi', 'Light drone show', { stackable: true }),
  I('fx_hologram', 'stage_shop', 'fx', 3, 1200, 6, 'Hologram projeksiyonu', 'Hologram projection', { stackable: true }),
];

// ---------- Sanat (hepsi birlikte etkin, toplam dinlenme bonusu en fazla %40) ----------

const ART: ItemDef[] = [
  I('art_clock', 'gallery', 'art', 1, 150, 5, 'Plaktan duvar saati', 'Vinyl record wall clock'),
  I('art_litho', 'gallery', 'art', 1, 200, 6, 'Numaralı litografi', 'Numbered lithograph'),
  I('art_tickets', 'gallery', 'art', 1, 260, 7, 'Konser bileti kolajı', 'Gig ticket collage'),
  I('art_vase', 'gallery', 'art', 2, 600, 10, 'Seramik vazo', 'Ceramic vase'),
  I('art_graffiti', 'gallery', 'art', 2, 700, 11, 'Grafiti pano', 'Graffiti panel'),
  I('art_triptych', 'gallery', 'art', 2, 1100, 13, 'Analog fotoğraf triptiği', 'Analogue photo triptych'),
  I('art_gramophone', 'gallery', 'art', 3, 2600, 18, 'Antika gramofon', 'Antique gramophone'),
  I('art_bust', 'gallery', 'art', 3, 3500, 20, 'Mermer besteci büstü', 'Marble composer bust'),
  I('art_portrait_vip', 'gallery', 'art', 4, 12000, 27, 'Usta ressamdan portre', 'Portrait by a master painter', { vip: true }),
];

// Şehir hatıraları: yalnızca kendi şehrinin galerisinde; hepsini toplamak bir koleksiyon (dünya turu)
const souvenir = (city: string, tr: string, en: string) => I(`art_souvenir_${city}`, 'gallery', 'art', 1, 160, 4, tr, en, { cityOnly: city });
const SOUVENIRS: ItemDef[] = [
  souvenir('istanbul', 'Galata Kulesi minyatürü', 'Galata Tower miniature'),
  souvenir('ankara', 'Ankara kedisi biblosu', 'Angora cat figurine'),
  souvenir('izmir', 'Saat Kulesi kartpostal çerçevesi', 'Clock Tower postcard frame'),
  souvenir('berlin', 'Çerçeveli duvar parçası', 'Framed piece of the Wall'),
  souvenir('hamburg', 'Şişede gemi', 'Ship in a bottle'),
  souvenir('munich', 'Koleksiyonluk bira kupası', 'Collector’s beer stein'),
  souvenir('london', 'Kırmızı telefon kulübesi maketi', 'Red phone box model'),
  souvenir('manchester', 'Arı amblemli rozet panosu', 'Worker-bee badge board'),
  souvenir('liverpool', 'Mersey feribotu maketi', 'Mersey ferry model'),
  souvenir('paris', 'Montmartre suluboya eskizi', 'Montmartre watercolour sketch'),
  souvenir('lyon', 'Guignol kuklası', 'Guignol puppet'),
  souvenir('marseille', 'Calanques fotoğraf baskısı', 'Calanques photo print'),
  souvenir('newyork', 'Metro tabelası replikası', 'Subway sign replica'),
  souvenir('losangeles', 'Şöhret kaldırımı yıldızı replikası', 'Walk of Fame star replica'),
  souvenir('nashville', 'Honky-tonk neon minyatürü', 'Honky-tonk neon miniature'),
];

// Plak arşivi (müzik mağazasında) ve efsane konser afişleri (galeride): koleksiyon parçaları
const VINYL: ItemDef[] = [
  I('art_vinyl_1', 'music_store', 'art', 1, 90, 3, 'İlk baskı blues plağı', 'First-press blues LP'),
  I('art_vinyl_2', 'music_store', 'art', 1, 90, 3, 'Anadolu rock 45\'liği', 'Anatolian rock 45'),
  I('art_vinyl_3', 'music_store', 'art', 1, 90, 3, 'Caz kulübü canlı kayıt plağı', 'Jazz club live LP'),
  I('art_vinyl_4', 'music_store', 'art', 1, 90, 3, 'Numaralı punk demo plağı', 'Numbered punk demo record'),
  I('art_vinyl_5', 'music_store', 'art', 1, 90, 3, 'Disko maxi single', 'Disco maxi single'),
  I('art_vinyl_6', 'music_store', 'art', 1, 90, 3, 'Senfoni kutu seti', 'Symphony box set'),
];
const POSTERS: ItemDef[] = [
  I('art_poster_1969', 'gallery', 'art', 1, 140, 4, 'Çamurlu festival afişi (1969)', 'Muddy festival poster (1969)'),
  I('art_poster_1977', 'gallery', 'art', 1, 140, 4, 'Bodrum kulübü punk afişi (1977)', 'Basement punk club poster (1977)'),
  I('art_poster_1985', 'gallery', 'art', 1, 140, 4, 'Stadyum turnesi afişi (1985)', 'Stadium tour poster (1985)'),
  I('art_poster_1991', 'gallery', 'art', 1, 140, 4, 'Depo partisi flyer\'ı (1991)', 'Warehouse rave flyer (1991)'),
  I('art_poster_1994', 'gallery', 'art', 1, 140, 4, 'Grunge konser afişi (1994)', 'Grunge gig poster (1994)'),
];

// ---------- Yüzükler (evlilik teklifi için) ----------

const RINGS: ItemDef[] = [
  I('ring_gold', 'boutique', 'ring', 2, 2000, 0, 'Altın yüzük', 'Gold ring'),
  I('ring_emerald', 'boutique', 'ring', 3, 3500, 0, 'Vintage zümrüt yüzük', 'Vintage emerald ring'),
];

// ---------- Sezonluk kuşanılabilirler ve efektler ----------

const SEASONAL_GEAR: ItemDef[] = [
  I('fx_petals', 'stage_shop', 'fx', 1, 140, 3, 'Çiçek yaprağı konfetisi', 'Petal confetti', { season: 'spring', stackable: true }),
  I('outfit_straw', 'boutique', 'outfit', 1, 300, 4, 'Hasır şapka ve keten gömlek', 'Straw hat and linen shirt', { season: 'summer', genres: ['folk', 'reggae', 'country'], genreBonus: 1 }),
];

// ---------- Atölyede üretilenler (bonus her üründe ayrı saklanır; dükkâna satılmaz) ----------

const C = (id: string, slot: Slot, price: number, tr: string, en: string, extra: Partial<ItemDef> = {}) =>
  I(id, 'hardware', slot, 2, price, 0, tr, en, { crafted: true, ...extra });

export const CRAFTED_GEAR: ItemDef[] = [
  // Enstrümanlar (tür uyumu +1)
  C('guitar_c_cigarbox', 'guitar', 300, 'Puro kutusu gitar', 'Cigar-box guitar', { genres: ['blues', 'folk'], genreBonus: 1 }),
  C('guitar_c_resonator', 'guitar', 700, 'El yapımı rezonatör gitar', 'Handmade resonator guitar', { genres: ['blues', 'country'], genreBonus: 1 }),
  C('guitar_c_archtop', 'guitar', 900, 'El yapımı arch-top caz gitarı', 'Handmade archtop jazz guitar', { genres: ['jazz', 'blues'], genreBonus: 1 }),
  C('bass_c_washtub', 'bass', 300, 'Leğen bas', 'Washtub bass', { genres: ['folk', 'country'], genreBonus: 1 }),
  C('bass_c_fretless', 'bass', 900, 'El yapımı perdesiz bas', 'Handmade fretless bass', { genres: ['jazz', 'soul'], genreBonus: 1 }),
  C('drums_c_cajon', 'drums', 400, 'El yapımı cajon', 'Handmade cajon', { genres: ['folk', 'pop'], genreBonus: 1 }),
  C('drums_c_custom', 'drums', 1100, 'Ismarlama ağaç davul seti', 'Custom wood drum kit', { genres: ['rock', 'metal'], genreBonus: 1 }),
  C('keys_c_toy', 'keys', 300, 'Hurda oyuncak piyano', 'Salvaged toy piano', { genres: ['pop', 'folk'], genreBonus: 1 }),
  C('keys_c_analog', 'keys', 900, 'El yapımı analog synth', 'Handmade analogue synth', { genres: ['electronic'], genreBonus: 1 }),
  C('vocals_c_tincan', 'vocals', 300, 'Teneke kutu mikrofon', 'Tin-can microphone', { genres: ['punk', 'hiphop'], genreBonus: 1 }),
  C('vocals_c_ribbon', 'vocals', 900, 'El yapımı şerit mikrofon', 'Handmade ribbon mic', { genres: ['jazz', 'soul'], genreBonus: 1 }),
  C('sax_c_bamboo', 'sax', 400, 'Bambu saksofon', 'Bamboo saxophone', { genres: ['reggae', 'folk'], genreBonus: 1 }),
  C('sax_c_soprano', 'sax', 900, 'El yapımı soprano saksofon', 'Handmade soprano sax', { genres: ['jazz', 'pop'], genreBonus: 1 }),
  C('violin_c_fiddle', 'violin', 900, 'El yapımı fiddle', 'Handmade fiddle', { genres: ['country', 'folk'], genreBonus: 1 }),
  C('violin_c_electric', 'violin', 900, 'El yapımı elektrikli keman', 'Handmade electric violin', { genres: ['rock', 'electronic', 'metal'], genreBonus: 1 }),
  C('percussion_c_djembe', 'percussion', 500, 'El yapımı djembe', 'Handmade djembe', { genres: ['folk', 'reggae'], genreBonus: 1 }),
  C('percussion_c_darbuka', 'percussion', 500, 'El yapımı toprak darbuka', 'Handmade clay darbuka', { genres: ['anatolian', 'folk'], genreBonus: 1 }),
  // Kıyafetler
  C('outfit_c_denim', 'outfit', 300, 'Yamalı kot yelek', 'Patched denim vest', { genres: ['punk', 'rock'], genreBonus: 1 }),
  C('outfit_c_knit', 'outfit', 300, 'Örgü sahne takımı', 'Knitted stage set', { genres: ['reggae', 'folk'], genreBonus: 1 }),
  C('outfit_c_track', 'outfit', 350, 'Boyalı eşofman takımı', 'Hand-painted tracksuit', { genres: ['hiphop', 'electronic'], genreBonus: 1 }),
  C('outfit_c_fringe', 'outfit', 500, 'Saçaklı deri ceket', 'Fringed leather jacket', { genres: ['country', 'folk'], genreBonus: 1 }),
  C('outfit_c_spikes', 'outfit', 500, 'Çivili deri zırh', 'Spiked leather armour', { genres: ['metal', 'punk'], genreBonus: 1 }),
  C('outfit_c_embroid', 'outfit', 500, 'İşlemeli yöresel yelek', 'Embroidered folk vest', { genres: ['anatolian', 'folk'], genreBonus: 1 }),
  C('outfit_c_gown', 'outfit', 900, 'El dikimi konser elbisesi', 'Hand-sewn concert gown', { genres: ['classical', 'jazz', 'soul'], genreBonus: 1 }),
  C('outfit_c_mirror', 'outfit', 900, 'Ayna mozaik sahne takımı', 'Mirror-mosaic stage suit', { genres: ['pop', 'electronic'], genreBonus: 1 }),
  // Sanat
  C('art_c_poster', 'art', 150, 'Serigrafi konser afişi', 'Screen-printed gig poster'),
  C('art_c_collage', 'art', 200, 'Plak kapağı kolajı', 'Record-sleeve collage'),
  C('art_c_lyrics', 'art', 250, 'Çerçeveli el yazısı şarkı sözü', 'Framed hand-lettered lyrics'),
  C('art_c_vase', 'art', 350, 'Sırlı seramik vazo', 'Glazed ceramic vase'),
  C('art_c_mosaic', 'art', 400, 'Boncuk ve plak mozaiği', 'Bead and vinyl mosaic'),
  C('art_c_neon', 'art', 500, 'El yapımı neon yazı', 'Handmade neon sign'),
  C('art_c_sculpture', 'art', 500, 'Hurda metal heykel', 'Scrap-metal sculpture'),
  C('art_c_portrait', 'art', 600, 'Yağlıboya grup portresi', 'Oil portrait of the band'),
  // Sahne efektleri (konserde tüketilir; kendi bonusu konsere taşınır)
  C('fx_c_confetti', 'fx', 150, 'El yapımı konfeti topu', 'Handmade confetti cannon', { stackable: true }),
  C('fx_c_smoke', 'fx', 150, 'Duman kapları', 'Smoke pots', { stackable: true }),
  C('fx_c_lanterns', 'fx', 150, 'El yapımı kâğıt fenerler', 'Handmade paper lanterns', { stackable: true }),
  C('fx_c_sparks', 'fx', 350, 'Soğuk kıvılcım makinesi', 'Cold-spark machine', { stackable: true }),
  C('fx_c_ledwall', 'fx', 450, 'El yapımı LED duvar', 'Handmade LED wall', { stackable: true }),
  // Yüzük
  C('ring_c_silver', 'ring', 400, 'El yapımı gümüş yüzük', 'Handmade silver ring'),
];

/** Bu dosyadaki dükkân eşyaları ve üretilenler */
export const MORE_GEAR: ItemDef[] = [
  ...INSTRUMENT_MODELS,
  ...OUTFITS,
  ...VEHICLES,
  ...PETS,
  ...FX,
  ...ART,
  ...SOUVENIRS,
  ...VINYL,
  ...POSTERS,
  ...RINGS,
  ...SEASONAL_GEAR,
  ...CRAFTED_GEAR,
];

// ---------- Yeni setler (her gruptan bir eşya kuşanılınca sahneye; yalnızca en iyi set, en fazla +3) ----------

export const MORE_SETS: GearSetDef[] = [
  { id: 'punk_rags', name: { tr: 'Paçavra punk', en: 'Punk rags' }, groups: [['guitar_m1', 'bass_m1', 'vocals_c_tincan', 'drums_hamburg'], ['outfit_studs', 'outfit_c_denim', 'outfit_kilt']], stage: 2 },
  { id: 'roots_rock', name: { tr: 'Kökler', en: 'Roots' }, groups: [['percussion_2b', 'bass_m2', 'keys_m1', 'sax_c_bamboo'], ['outfit_rasta', 'outfit_c_knit']], stage: 2 },
  { id: 'concert_hall', name: { tr: 'Konser salonu', en: 'Concert hall' }, groups: [['violin_m3', 'keys_m3', 'vocals_m3', 'violin_munich', 'guitar_m4'], ['outfit_tailcoat', 'outfit_c_gown']], stage: 2 },
  { id: 'golden_era', name: { tr: 'Altın çağ hip-hop', en: 'Golden-era hip-hop' }, groups: [['vocals_m1', 'drums_m2', 'drums_newyork', 'vocals_marseille'], ['outfit_goldchain', 'outfit_hoodie', 'outfit_c_track']], stage: 2 },
  { id: 'road_song', name: { tr: 'Yol türküsü', en: 'Road song' }, groups: [['guitar_c_cigarbox', 'bass_c_washtub', 'violin_c_fiddle', 'drums_m1'], ['outfit_fringe', 'outfit_c_fringe', 'outfit_knitvest'], ['camper_1']], stage: 3 },
  { id: 'anatolian_psych', name: { tr: 'Anadolu psikedelik', en: 'Anatolian psych' }, groups: [['guitar_istanbul', 'percussion_m1', 'percussion_c_darbuka'], ['outfit_folkvest', 'outfit_c_embroid']], stage: 2 },
  { id: 'soul_revue', name: { tr: 'Soul revü', en: 'Soul revue' }, groups: [['drums_m4', 'keys_m2', 'sax_m3', 'vocals_c_ribbon'], ['outfit_velvettux', 'outfit_disco']], stage: 2 },
  { id: 'glitter_pop', name: { tr: 'Simli pop', en: 'Glitter pop' }, groups: [['vocals_m4', 'keys_m4'], ['outfit_crystal', 'outfit_c_mirror', 'outfit_bomber']], stage: 2 },
];

// ---------- Koleksiyonlar: her gruptan bir eşyaya sahip olunca başarım (para vermez) ----------

export interface CollectionDef {
  id: string;
  name: L;
  about: L;
  /** Her gruptan en az bir eşya envanterde olmalı */
  groups: string[][];
  points: number;
}

export const COLLECTIONS: CollectionDef[] = [
  {
    id: 'souvenirs',
    name: { tr: 'Dünya turu hatıraları', en: 'World tour keepsakes' },
    about: { tr: '15 şehrin galerisindeki hatıranın hepsini topla.', en: 'Collect the keepsake from the gallery of all 15 cities.' },
    groups: SOUVENIRS.map((s) => [s.id]),
    points: 30,
  },
  {
    id: 'vinyl',
    name: { tr: 'Plak arşivi', en: 'Record archive' },
    about: { tr: 'Müzik mağazasındaki altı koleksiyon plağının hepsini topla.', en: 'Collect all six collector’s records from the music store.' },
    groups: VINYL.map((s) => [s.id]),
    points: 15,
  },
  {
    id: 'posters',
    name: { tr: 'Afiş duvarı', en: 'Poster wall' },
    about: { tr: 'Galerideki beş efsane konser afişinin hepsini topla.', en: 'Collect all five legendary gig posters from the gallery.' },
    groups: POSTERS.map((s) => [s.id]),
    points: 15,
  },
  {
    id: 'seasons',
    name: { tr: 'Dört mevsim', en: 'Four seasons' },
    about: { tr: 'Her mevsimin sezonluk eşyalarından en az birine sahip ol.', en: 'Own at least one seasonal item from every season.' },
    // Gruplar items.ts'de (sezonluk eşyaların tamamı belli olunca) doldurulur
    groups: [],
    points: 20,
  },
  {
    id: 'workshop',
    name: { tr: 'Atölye ustası', en: 'Workshop master' },
    about: { tr: 'Atölyede yapılmış bir enstrümana, bir kıyafete, bir sanat eserine ve bir hediyeliğe sahip ol.', en: 'Own a workshop-made instrument, outfit, piece of art and gift.' },
    // Gruplar items.ts'de (bütün atölye ürünleri belli olunca) doldurulur
    groups: [],
    points: 20,
  },
];
