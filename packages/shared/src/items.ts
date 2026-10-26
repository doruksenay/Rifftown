// Oyunun kendi dükkânlarında satılan eşyalar. Fiyatlar her şehirde aynıdır.

import { INSTRUMENTS, type Instrument, type L, type ShopType } from './world';
import { EXTRA_ITEMS } from './content/items';

export type ItemSlot = Instrument | 'outfit' | 'art' | 'vehicle' | 'pet' | 'fx' | 'material' | 'spray' | 'ring';

/** Kuşanılabilen yuvalar (her birinde en fazla bir eşya). Sanat eserleri hep etkindir, diğerleri tüketilir. */
export const EQUIP_SLOTS: readonly ItemSlot[] = [...INSTRUMENTS, 'outfit', 'vehicle', 'pet'];
export const isEquippable = (slot: string) => (EQUIP_SLOTS as readonly string[]).includes(slot);
/** Sprey boyayla boyanabilen yuvalar */
export const PAINTABLE_SLOTS: readonly ItemSlot[] = [...INSTRUMENTS, 'outfit', 'vehicle'];
export const isPaintable = (slot: string) => (PAINTABLE_SLOTS as readonly string[]).includes(slot);

export interface ItemDef {
  id: string;
  shop: ShopType;
  slot: ItemSlot;
  name: L;
  price: number;
  /** Enstrüman: rol becerisine konserde eklenen puan + çalışma verimi bonusu (%).
   *  Kıyafet: sahne performansına eklenen puan.
   *  Sanat eseri: dinlenirken ruh hâli kazancına eklenen yüzde. */
  bonus: number;
  tier: 1 | 2 | 3 | 4;
  /** Sadece VIP üyeler satın alabilir */
  vip?: boolean;
  /** Araçlar: otobüse göre kaç kat hızlı */
  speed?: number;
  /** Atölyede üretilir, dükkânda satılmaz (bonusu her üründe farklıdır) */
  crafted?: boolean;
  /** Sprey boyanın rengi */
  color?: PaintColor;
  /** Tek seferde birden çok alınabilir (malzeme, boya, efekt) */
  stackable?: boolean;
}

// ---------- Boya renkleri ----------

export type PaintColor = 'pink' | 'blue' | 'red' | 'black' | 'white' | 'gold' | 'silver' | 'green' | 'purple' | 'orange';
export const PAINT_COLORS: Record<PaintColor, { name: L; hex: string }> = {
  pink: { name: { tr: 'pembe', en: 'pink' }, hex: '#F0308A' },
  blue: { name: { tr: 'mavi', en: 'blue' }, hex: '#0E6FBF' },
  red: { name: { tr: 'kırmızı', en: 'red' }, hex: '#D7263D' },
  black: { name: { tr: 'siyah', en: 'black' }, hex: '#1B1B1E' },
  white: { name: { tr: 'beyaz', en: 'white' }, hex: '#F4F4F6' },
  gold: { name: { tr: 'altın', en: 'gold' }, hex: '#D4A72C' },
  silver: { name: { tr: 'gümüş', en: 'silver' }, hex: '#A7ADB8' },
  green: { name: { tr: 'yeşil', en: 'green' }, hex: '#1B998B' },
  purple: { name: { tr: 'mor', en: 'purple' }, hex: '#6A4C93' },
  orange: { name: { tr: 'turuncu', en: 'orange' }, hex: '#F3722C' },
};
export const PAINT_COLOR_IDS = Object.keys(PAINT_COLORS) as PaintColor[];

/** Dükkâna geri satarken alınan oran. */
export const SELL_BACK_RATE = 0.5;
/** Sanat eserlerinin toplam dinlenme bonusu üst sınırı (%). */
export const MAX_ART_BONUS = 40;

const CRAFTED_NAMES: Record<Instrument, L> = {
  guitar: { tr: 'El yapımı gitar', en: 'Handmade guitar' },
  bass: { tr: 'El yapımı bas', en: 'Handmade bass' },
  drums: { tr: 'El yapımı davul seti', en: 'Handmade drum kit' },
  keys: { tr: 'El yapımı synthesizer', en: 'Handmade synthesizer' },
  vocals: { tr: 'El yapımı mikrofon', en: 'Handmade microphone' },
};

const VINTAGE_NAMES: Record<Instrument, L> = {
  guitar: { tr: '1959 vintage elektro gitar', en: '1959 vintage electric guitar' },
  bass: { tr: '1962 vintage bas gitar', en: '1962 vintage bass' },
  drums: { tr: 'Efsanevi bir davulcunun eski seti', en: 'A legendary drummer\'s old kit' },
  keys: { tr: 'Vintage analog synthesizer', en: 'Vintage analogue synthesizer' },
  vocals: { tr: 'Efsanevi stüdyo mikrofonu', en: 'Legendary studio microphone' },
};

const INSTRUMENT_ITEM_NAMES: Record<Instrument, [L, L, L]> = {
  guitar: [
    { tr: 'Başlangıç gitarı', en: 'Starter guitar' },
    { tr: 'Sahne gitarı', en: 'Stage guitar' },
    { tr: 'El yapımı usta gitarı', en: 'Handmade master guitar' },
  ],
  bass: [
    { tr: 'Başlangıç bas gitarı', en: 'Starter bass' },
    { tr: 'Sahne bas gitarı', en: 'Stage bass' },
    { tr: 'El yapımı usta bas', en: 'Handmade master bass' },
  ],
  drums: [
    { tr: 'Başlangıç davul seti', en: 'Starter drum kit' },
    { tr: 'Sahne davul seti', en: 'Stage drum kit' },
    { tr: 'Profesyonel davul seti', en: 'Professional drum kit' },
  ],
  keys: [
    { tr: 'Başlangıç klavyesi', en: 'Starter keyboard' },
    { tr: 'Sahne synthesizer\'ı', en: 'Stage synthesizer' },
    { tr: 'Kuyruklu piyano sesli workstation', en: 'Grand workstation' },
  ],
  vocals: [
    { tr: 'Başlangıç mikrofonu', en: 'Starter microphone' },
    { tr: 'Sahne mikrofonu', en: 'Stage microphone' },
    { tr: 'Stüdyo kalitesi kablosuz mikrofon', en: 'Studio-grade wireless mic' },
  ],
};

const INSTRUMENT_TIERS = [
  { tier: 1 as const, price: 150, bonus: 3 },
  { tier: 2 as const, price: 900, bonus: 7 },
  { tier: 3 as const, price: 4000, bonus: 12 },
];

export const ITEMS: ItemDef[] = [
  ...INSTRUMENTS.flatMap((inst) =>
    INSTRUMENT_TIERS.map((t, i) => ({
      id: `${inst}_${t.tier}`,
      shop: 'music_store' as const,
      slot: inst,
      name: INSTRUMENT_ITEM_NAMES[inst][i],
      price: t.price,
      bonus: t.bonus,
      tier: t.tier,
    })),
  ),
  ...INSTRUMENTS.map((inst) => ({
    id: `${inst}_4`,
    shop: 'music_store' as const,
    slot: inst,
    name: VINTAGE_NAMES[inst],
    price: 9000,
    bonus: 15,
    tier: 4 as const,
    vip: true,
  })),
  { id: 'outfit_1', shop: 'boutique', slot: 'outfit', tier: 1, price: 80, bonus: 2, name: { tr: 'Tişört ve kot', en: 'T-shirt and jeans' } },
  { id: 'outfit_2', shop: 'boutique', slot: 'outfit', tier: 2, price: 500, bonus: 5, name: { tr: 'Deri ceket', en: 'Leather jacket' } },
  { id: 'outfit_3', shop: 'boutique', slot: 'outfit', tier: 3, price: 2500, bonus: 10, name: { tr: 'Tasarım sahne kostümü', en: 'Designer stage costume' } },
  { id: 'outfit_4', shop: 'boutique', slot: 'outfit', tier: 4, price: 6000, bonus: 14, vip: true, name: { tr: 'Ünlü tasarımcıdan sahne kostümü', en: 'Celebrity designer stage costume' } },
  { id: 'art_1', shop: 'gallery', slot: 'art', tier: 1, price: 120, bonus: 5, name: { tr: 'Konser afişi baskısı', en: 'Gig poster print' } },
  { id: 'art_2', shop: 'gallery', slot: 'art', tier: 1, price: 300, bonus: 8, name: { tr: 'Sokak sanatı tuvali', en: 'Street art canvas' } },
  { id: 'art_3', shop: 'gallery', slot: 'art', tier: 2, price: 1500, bonus: 15, name: { tr: 'Yağlıboya manzara', en: 'Oil landscape painting' } },
  { id: 'art_4', shop: 'gallery', slot: 'art', tier: 3, price: 8000, bonus: 25, name: { tr: 'Ünlü ressamdan soyut tablo', en: 'Abstract by a famous painter' } },
  { id: 'art_5', shop: 'gallery', slot: 'art', tier: 4, price: 20000, bonus: 30, vip: true, name: { tr: 'Müze kalitesinde tablo', en: 'Museum-grade painting' } },
  // Nişan yüzükleri (evlilik teklifi için)
  { id: 'ring_1', shop: 'boutique', slot: 'ring', tier: 1, price: 800, bonus: 0, name: { tr: 'Gümüş nişan yüzüğü', en: 'Silver engagement ring' } },
  { id: 'ring_2', shop: 'boutique', slot: 'ring', tier: 3, price: 5000, bonus: 0, name: { tr: 'Pırlanta nişan yüzüğü', en: 'Diamond engagement ring' } },
  // Araçlar: ülke içinde (aynı kıtada, 2.500 km'ye kadar) otobüsten hızlı ve ucuz yolculuk
  { id: 'car_1', shop: 'car_dealer', slot: 'vehicle', tier: 1, price: 2500, bonus: 0, speed: 1.3, name: { tr: 'Eski hatchback', en: 'Old hatchback' } },
  { id: 'moto_1', shop: 'car_dealer', slot: 'vehicle', tier: 1, price: 4500, bonus: 0, speed: 1.7, name: { tr: 'Motosiklet', en: 'Motorbike' } },
  { id: 'car_2', shop: 'car_dealer', slot: 'vehicle', tier: 2, price: 9000, bonus: 0, speed: 1.6, name: { tr: 'Aile sedanı', en: 'Family saloon' } },
  { id: 'van_1', shop: 'car_dealer', slot: 'vehicle', tier: 2, price: 16000, bonus: 0, speed: 1.5, name: { tr: 'Turne minibüsü', en: 'Tour van' } },
  { id: 'car_3', shop: 'car_dealer', slot: 'vehicle', tier: 3, price: 28000, bonus: 0, speed: 2.0, name: { tr: 'Spor coupe', en: 'Sports coupé' } },
  { id: 'car_4', shop: 'car_dealer', slot: 'vehicle', tier: 4, price: 60000, bonus: 0, speed: 2.2, vip: true, name: { tr: 'Klasik cabrio', en: 'Classic convertible' } },
  // Evcil hayvanlar: evde dinlenirken ruh hâli kazancına eklenen yüzde (sanat eserlerinden ayrı)
  { id: 'pet_cat', shop: 'pet_shop', slot: 'pet', tier: 1, price: 250, bonus: 6, name: { tr: 'Tekir kedi', en: 'Tabby cat' } },
  { id: 'pet_dog', shop: 'pet_shop', slot: 'pet', tier: 2, price: 400, bonus: 8, name: { tr: 'Sokak köpeği (sahiplendirme)', en: 'Rescue dog' } },
  { id: 'pet_parrot', shop: 'pet_shop', slot: 'pet', tier: 2, price: 700, bonus: 10, name: { tr: 'Konuşan papağan', en: 'Talking parrot' } },
  { id: 'pet_bengal', shop: 'pet_shop', slot: 'pet', tier: 4, price: 4000, bonus: 15, vip: true, name: { tr: 'Bengal kedisi', en: 'Bengal cat' } },
  // Sahne efektleri: konser ayarlarken seçilir, konserde tüketilir; kaliteye eklenir
  { id: 'fx_smoke', shop: 'stage_shop', slot: 'fx', tier: 1, price: 80, bonus: 2, stackable: true, name: { tr: 'Sis makinesi', en: 'Smoke machine' } },
  { id: 'fx_confetti', shop: 'stage_shop', slot: 'fx', tier: 1, price: 150, bonus: 3, stackable: true, name: { tr: 'Konfeti topu', en: 'Confetti cannon' } },
  { id: 'fx_lights', shop: 'stage_shop', slot: 'fx', tier: 2, price: 300, bonus: 4, stackable: true, name: { tr: 'Işık şovu', en: 'Light show' } },
  { id: 'fx_pyro', shop: 'stage_shop', slot: 'fx', tier: 3, price: 800, bonus: 6, stackable: true, name: { tr: 'Piroteknik gösteri', en: 'Pyrotechnics' } },
  // Atölye malzemeleri
  ...([
    ['mat_wood', 60, 'Ağaç gövde', 'Wooden body'],
    ['mat_strings', 25, 'Tel takımı', 'String set'],
    ['mat_pickup', 90, 'Manyetik', 'Pickup'],
    ['mat_drumhead', 40, 'Davul derisi', 'Drumhead'],
    ['mat_circuit', 80, 'Devre kartı', 'Circuit board'],
    ['mat_keys', 70, 'Tuş takımı', 'Key set'],
    ['mat_capsule', 70, 'Mikrofon kapsülü', 'Mic capsule'],
    ['mat_fabric', 30, 'Kumaş', 'Fabric'],
    ['mat_sequins', 20, 'Pul ve taş', 'Sequins'],
  ] as const).map(([id, price, tr, en]) => ({
    id, shop: 'hardware' as const, slot: 'material' as const, tier: 1 as const, price, bonus: 0, stackable: true, name: { tr, en },
  })),
  // Sprey boyalar
  ...PAINT_COLOR_IDS.map((color) => ({
    id: `spray_${color}`,
    shop: 'hardware' as const,
    slot: 'spray' as const,
    tier: 1 as const,
    price: 35,
    bonus: 0,
    color,
    stackable: true,
    name: { tr: `Sprey boya (${PAINT_COLORS[color].name.tr})`, en: `Spray paint (${PAINT_COLORS[color].name.en})` },
  })),
  // Atölyede üretilenler (bonus her üründe ayrı saklanır)
  ...INSTRUMENTS.map((inst) => ({
    id: `${inst}_crafted`,
    shop: 'hardware' as const,
    slot: inst,
    tier: 2 as const,
    price: 600,
    bonus: 0,
    crafted: true,
    name: CRAFTED_NAMES[inst],
  })),
  { id: 'outfit_crafted', shop: 'hardware', slot: 'outfit', tier: 2, price: 300, bonus: 0, crafted: true, name: { tr: 'El yapımı sahne kostümü', en: 'Handmade stage costume' } },
];

// Veri dosyasındaki ek eşyalar (packages/shared/src/content/items.ts)
ITEMS.push(...EXTRA_ITEMS);

export const ITEM_BY_ID: Record<string, ItemDef> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
export const itemsForShop = (shop: ShopType) => ITEMS.filter((i) => i.shop === shop && !i.crafted);

// ---------- Hastane ----------

export const HOSPITAL_PRICE_PER_HOUR = 40;
export const HOSPITAL_HEAL_PER_HOUR = 20;

// ---------- Kiralık stüdyo müzisyenleri ----------
// Oyuncu bulamayan ya da tek başına ilerleyen oyuncular için: grup lideri konser
// rezervasyonunda eksik rolleri oyunun kendi müzisyenleriyle doldurabilir.

export const SESSION_MUSICIAN = {
  bar: { fee: 5, skill: 30, stage: 25 },
  club: { fee: 60, skill: 50, stage: 40 },
  hall: { fee: 250, skill: 70, stage: 55 },
  stadium: { fee: 900, skill: 85, stage: 70 },
  festival: { fee: 0, skill: 75, stage: 60 },
} as const;

/** Bir konserde sahne efektlerinden gelebilecek en yüksek kalite artışı */
export const MAX_FX_BONUS = 12;
/** İkinci el pazarında satıştan alınan komisyon */
export const MARKET_FEE = 0.05;
export const MAX_LISTINGS = 20;
/** İkinci elde (pazar ve takas parası) bir eşya dükkân fiyatının en fazla bu katına el değiştirebilir.
 *  Ek hesaplardan ana hesaba para taşınmasını zorlaştırır. EFSANEVİ eşyalar koleksiyonluk olduğundan daha yüksek. */
export const RESALE_CAP_MULT = 2;
export const LEGENDARY_RESALE_CAP_MULT = 5;
export const maxResalePrice = (shopPrice: number, legendary = false) =>
  Math.max(1, Math.round(shopPrice * (legendary ? LEGENDARY_RESALE_CAP_MULT : RESALE_CAP_MULT)));
/** Yeni hesaplar bu kadar oyun saati boyunca pazar, takas, hediye ve para gönderme kullanamaz */
export const NEW_ACCOUNT_TRADE_HOURS = 72;
/** El değiştiren bir eşya bu kadar oyun saati içinde önceki sahibine geri dönemez (takas, pazar, hediye) */
export const ITEM_RETURN_COOLDOWN_HOURS = 168;
/** Kiralık müzisyenler setlisti önceden öğrenir. */
export const SESSION_FAMILIARITY = 70;
