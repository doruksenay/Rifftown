// Oyunun kendi dükkânlarında satılan eşyalar. Fiyatlar her şehirde aynıdır.

import { type Genre, INSTRUMENTS, type Instrument, type L, type ShopType } from './world';
import { EXTRA_ITEMS, GEAR_SETS, REWARD_ITEMS, SEASONAL_ITEMS } from './content/items';
import { COLLECTIONS, MORE_GEAR, MORE_SETS } from './content/gear';
import { GOODS } from './content/goods';
import { CITY_IDENTITY } from './content/cities';

export type ItemSlot = Instrument | 'outfit' | 'art' | 'vehicle' | 'pet' | 'fx' | 'material' | 'spray' | 'ring' | 'consumable' | 'gift';

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
  /** Ödül eşyası: dükkânda satılmaz (zincir, başarım, şehir ödülü) */
  reward?: boolean;
  /** Kişiye bağlı: dükkâna satılamaz, pazara konamaz, takas ve hediye edilemez */
  bound?: boolean;
  /** Tür uyumu: grubun türü bunlardan biriyse konserde bonusa genreBonus eklenir */
  genres?: Genre[];
  genreBonus?: number;
  /** Sezonluk: dükkânda yalnızca bu mevsimde satılır (oyun yılı 56 gün, mevsim 14 gün) */
  season?: Season;
  /** Nadir: yalnızca bu şehrin dükkânında satılır */
  cityOnly?: string;
  /** Tüketim eşyası (yuva 'consumable'): envanterden kullanılınca verdiği küçük, anlık etkiler.
   *  Bütün tüketim eşyaları ortak bir beklemeye tabidir (CONSUMABLE_COOLDOWN_HOURS). */
  use?: ItemUse;
  /** Hediyelik (yuva 'gift'): bir arkadaşa hediye edilince arkadaşlığa eklenen puan (aynı kişiye günde bir kez) */
  gift?: { friendship: number };
  /** Bakım eşyası: yıpranmış ekipmanı onarır. all: bütün kuşanılmış ekipman; slots: yalnızca bu yuvalar (yoksa her yıpranan yuva) */
  repair?: { wear: number; all?: boolean; slots?: ItemSlot[] };
}

export interface ItemUse {
  energy?: number;
  mood?: number;
  health?: number;
  inspiration?: number;
}
/** Tüketim etkilerinin tavanı (tek kullanımda); test her eşyayı bununla denetler */
export const MAX_ITEM_USE: Required<ItemUse> = { energy: 15, mood: 10, health: 8, inspiration: 6 };
/** İki tüketim eşyası arasında en az bu kadar oyun saati (yemekten ayrı) */
export const CONSUMABLE_COOLDOWN_HOURS = 3;
/** Hediyelik eşyanın arkadaşlık katkısı tavanı ve aynı kişiye tekrar etkisi için bekleme (oyun saati) */
export const MAX_GIFT_FRIENDSHIP = 4;
export const GIFT_BONUS_COOLDOWN_HOURS = 24;

/** Yuva adları (dükkân rafı ve atölye grupları için) */
export const SLOT_NAMES: Record<ItemSlot, L> = {
  vocals: { tr: 'Mikrofonlar', en: 'Microphones' },
  guitar: { tr: 'Gitarlar', en: 'Guitars' },
  bass: { tr: 'Bas gitarlar', en: 'Basses' },
  drums: { tr: 'Davullar', en: 'Drums' },
  keys: { tr: 'Klavyeler', en: 'Keyboards' },
  sax: { tr: 'Saksofonlar', en: 'Saxophones' },
  violin: { tr: 'Kemanlar', en: 'Violins' },
  percussion: { tr: 'Perküsyon', en: 'Percussion' },
  outfit: { tr: 'Kıyafetler', en: 'Outfits' },
  art: { tr: 'Sanat ve koleksiyon', en: 'Art and collectibles' },
  vehicle: { tr: 'Araçlar', en: 'Vehicles' },
  pet: { tr: 'Evcil hayvanlar', en: 'Pets' },
  fx: { tr: 'Sahne efektleri', en: 'Stage effects' },
  material: { tr: 'Malzeme ve bakım', en: 'Materials and care' },
  spray: { tr: 'Sprey boyalar', en: 'Spray paints' },
  ring: { tr: 'Yüzükler', en: 'Rings' },
  consumable: { tr: 'Tüketim', en: 'Consumables' },
  gift: { tr: 'Hediyelik', en: 'Gifts' },
};

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];
export const SEASON_NAMES: Record<Season, L> = {
  spring: { tr: 'İlkbahar', en: 'Spring' },
  summer: { tr: 'Yaz', en: 'Summer' },
  autumn: { tr: 'Sonbahar', en: 'Autumn' },
  winter: { tr: 'Kış', en: 'Winter' },
};
/** Oyun takvimindeki mevsim: oyun yılı 56 gün (consequences.ts GAME_YEAR_DAYS), her mevsim 14 gün */
export function seasonAt(nowMs: number, gameSpeed: number): Season {
  const gameDay = Math.floor((nowMs * gameSpeed) / 86_400_000);
  return SEASONS[Math.floor((((gameDay % 56) + 56) % 56) / 14)];
}

/** Tür uyumu tavanı: uyumlu eşya en fazla bu kadar ek bonus alır */
export const MAX_GENRE_BONUS = 3;
/** Eşyanın bu türdeki ek bonusu */
export const genreAffinity = (def: ItemDef | undefined, genre: Genre | undefined) =>
  def && genre && def.genres?.includes(genre) ? Math.min(MAX_GENRE_BONUS, def.genreBonus ?? 0) : 0;

/** Set bonusları: her gruptan bir eşya kuşanılınca sahne performansına eklenir; yalnızca en iyi set sayılır */
export interface GearSetDef {
  id: string;
  name: L;
  /** Her grup için kuşanılmış olması gereken eşyalardan biri */
  groups: string[][];
  stage: number;
}
export const MAX_SET_BONUS = 3;
export function gearSetBonus(equipped: Iterable<string>): { setId: string; stage: number } | null {
  const have = new Set(equipped);
  let best: { setId: string; stage: number } | null = null;
  for (const set of GEAR_SETS) {
    if (set.groups.every((g) => g.some((id) => have.has(id))) && (!best || set.stage > best.stage)) best = { setId: set.id, stage: Math.min(MAX_SET_BONUS, set.stage) };
  }
  return best;
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
  sax: { tr: 'El yapımı saksofon', en: 'Handmade saxophone' },
  violin: { tr: 'El yapımı keman', en: 'Handmade violin' },
  percussion: { tr: 'El yapımı konga', en: 'Handmade conga' },
};

const VINTAGE_NAMES: Record<Instrument, L> = {
  guitar: { tr: '1959 vintage elektro gitar', en: '1959 vintage electric guitar' },
  bass: { tr: '1962 vintage bas gitar', en: '1962 vintage bass' },
  drums: { tr: 'Efsanevi bir davulcunun eski seti', en: 'A legendary drummer\'s old kit' },
  keys: { tr: 'Vintage analog synthesizer', en: 'Vintage analogue synthesizer' },
  vocals: { tr: 'Efsanevi stüdyo mikrofonu', en: 'Legendary studio microphone' },
  sax: { tr: '1954 vintage tenor saksofon', en: '1954 vintage tenor sax' },
  violin: { tr: 'Asırlık usta işi keman', en: 'Century-old master violin' },
  percussion: { tr: 'Efsanevi bir perküsyoncunun konga takımı', en: 'A legendary percussionist\'s conga set' },
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
  sax: [
    { tr: 'Öğrenci alto saksofonu', en: 'Student alto sax' },
    { tr: 'Sahne tenor saksofonu', en: 'Stage tenor sax' },
    { tr: 'El yapımı profesyonel saksofon', en: 'Handmade pro saxophone' },
  ],
  violin: [
    { tr: 'Öğrenci kemanı', en: 'Student violin' },
    { tr: 'Sahne kemanı (manyetikli)', en: 'Stage violin with pickup' },
    { tr: 'Usta işi konser kemanı', en: 'Master-built concert violin' },
  ],
  percussion: [
    { tr: 'Darbuka ve tef', en: 'Darbuka and frame drum' },
    { tr: 'Konga ve bongo seti', en: 'Conga and bongo set' },
    { tr: 'Profesyonel perküsyon kurulumu', en: 'Professional percussion rig' },
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
// Şehre özgü nadir eşyalar (content/cities.ts): yalnızca kendi şehrinin dükkânında
// Daha fazla kuşanılabilir eşya ve sanat (content/gear.ts), tüketim, hediye, bakım ve malzeme (content/goods.ts)
ITEMS.push(...EXTRA_ITEMS, ...REWARD_ITEMS, ...SEASONAL_ITEMS, ...CITY_IDENTITY.map((c) => c.rareItem), ...MORE_GEAR, ...GOODS);

export const ITEM_BY_ID: Record<string, ItemDef> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
GEAR_SETS.push(...MORE_SETS);
// Koleksiyonlarda bütün eşya listesine bağlı gruplar: her mevsimden bir sezonluk eşya; atölyede yapılmış bir enstrüman,
// kıyafet, sanat eseri ve hediyelik
for (const col of COLLECTIONS) {
  if (col.id === 'seasons') col.groups = SEASONS.map((s) => ITEMS.filter((i) => i.season === s).map((i) => i.id));
  if (col.id === 'workshop') {
    const crafted = ITEMS.filter((i) => i.crafted);
    col.groups = [
      crafted.filter((i) => (INSTRUMENTS as readonly string[]).includes(i.slot)).map((i) => i.id),
      crafted.filter((i) => i.slot === 'outfit').map((i) => i.id),
      crafted.filter((i) => i.slot === 'art').map((i) => i.id),
      crafted.filter((i) => i.slot === 'gift').map((i) => i.id),
    ];
  }
}
/** Envanterdeki eşyalarla tamamlanan koleksiyonlar */
export const completedCollections = (owned: Iterable<string>) => {
  const have = new Set(owned);
  return COLLECTIONS.filter((c) => c.groups.length > 0 && c.groups.every((g) => g.some((id) => have.has(id)))).map((c) => c.id);
};
/** Dükkân rafı; cityId verilirse yalnızca o şehre özgü nadir eşyalar da katılır (başka şehrinkiler çıkar) */
export const itemsForShop = (shop: ShopType, cityId?: string) => ITEMS.filter((i) => i.shop === shop && !i.crafted && !i.reward && (!i.cityOnly || i.cityOnly === cityId));
/** Kişiye bağlı eşya el değiştiremez (satış, pazar, takas, hediye) */
export const isBoundItem = (itemId: string) => !!ITEM_BY_ID[itemId]?.bound;

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

/**
 * Kiralık müzisyen grubun kendi sahnedeki üyelerinin ortalamasını en fazla bu kadar aşar (rol becerisi ve sahne puanı).
 * Bar sınırsız (ilk konserler aynı kalsın). Eskiden kiralıklar mekânın sabit seviyesinde çalıyordu: beste 8, gitar 52
 * olan bir oyuncu stadyumda 85'lik kadroyla 72. günde stadyuma çıkıyordu (denge raporu §1). Büyük sahnede kiralık
 * kadro grubu ancak biraz yukarı çeker; beceri belirleyici olur.
 */
export const SESSION_SKILL_MARGIN = { bar: null, club: 15, hall: 10, stadium: 5, festival: 10 } as const satisfies Record<keyof typeof SESSION_MUSICIAN, number | null>;

/** Kiralık müzisyenin o geceki seviyesi: mekânın seviyesi, grubun kendi ortalamasının SESSION_SKILL_MARGIN üstüyle sınırlı */
export function sessionLevels(venue: keyof typeof SESSION_MUSICIAN, own: { skill: number; stage: number } | null) {
  const sm = SESSION_MUSICIAN[venue];
  const margin = SESSION_SKILL_MARGIN[venue];
  if (margin === null || !own) return { skill: sm.skill, stage: sm.stage };
  return { skill: Math.max(0, Math.min(sm.skill, own.skill + margin)), stage: Math.max(0, Math.min(sm.stage, own.stage + margin)) };
}

/**
 * Sahne efektleri: her efekt türü bir kez sayılır (aynı efektten ikincisi bir şey katmaz), en güçlüsü tam, sonrakiler
 * yarı, çeyrek… (FX_STACK_DECAY) ve toplam en fazla MAX_FX_BONUS. Eskiden tavan +12'ydi ve 6 sis makinesi ($480) her
 * konserde +12 kalite veriyordu (denge raporu §5).
 */
export const MAX_FX_BONUS = 6;
export const FX_STACK_DECAY = 0.5;
/** itemBonuses: her efektin kendi bonusu (atölye ürünü farklı olabilir); verilmezse tanımdaki bonus. Aynı efektten en güçlüsü sayılır. */
export function fxQualityBonus(itemIds: string[], itemBonuses?: (number | null | undefined)[] | null): number {
  const best = new Map<string, number>();
  itemIds.forEach((id, i) => {
    const b = itemBonuses?.[i] ?? ITEM_BY_ID[id]?.bonus ?? 0;
    best.set(id, Math.max(best.get(id) ?? 0, b));
  });
  const bonuses = [...best.values()].filter((b) => b > 0);
  bonuses.sort((a, b) => b - a);
  const total = bonuses.reduce((sum, b, i) => sum + b * FX_STACK_DECAY ** i, 0);
  return Math.round(Math.min(MAX_FX_BONUS, total) * 10) / 10;
}
/**
 * Set bonusu ve tür uyumu doğrudan kaliteye de eklenir (eskiden yalnız sahne puanına ve rol becerisine girip kaliteye
 * 1 puandan az katkı veriyordu): set bonusu × 0,5 + tür uyumu (tavan +3) × 0,35, üye başına en fazla +2.
 */
export const GEAR_QUALITY_CAP = 2;
export const gearQualityBonus = (setStage: number, affinity: number) =>
  Math.round(Math.min(GEAR_QUALITY_CAP, Math.max(0, setStage) * 0.5 + Math.min(MAX_GENRE_BONUS, Math.max(0, affinity)) * 0.35) * 100) / 100;
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
/**
 * El değiştiren bir eşya bu kadar oyun saati içinde, bu sürede ona sahip olmuş HİÇ KİMSEYE geri dönemez
 * (takas, pazar, hediye). Eskiden yalnızca bir önceki sahibe bakılıyordu; A → B → C → A zinciriyle eşya aynı saatte
 * geri dönüyor, ek hesabın parası kayıpsız ana hesaba taşınıyordu (denge raporu §7). Geçmiş item_handoffs tablosunda
 * (migration 024) tutulur.
 */
export const ITEM_RETURN_COOLDOWN_HOURS = 168;
/** Takasta eklenen para, karşılığında alınan eşyaların dükkân değerinin bu katını geçemez (eskiden 2; pazar tavanı 2 kaldı) */
export const TRADE_MONEY_VALUE_MULT = 1;
/** Takas parasının dayanağı olan eşya değeri (EFSANEVİ eşya koleksiyonluktur: iki katı) */
export const tradeMoneyValue = (shopPrice: number, legendary = false) => Math.max(1, Math.round(shopPrice * TRADE_MONEY_VALUE_MULT * (legendary ? 2 : 1)));
/**
 * İki oyuncu arasında bir yönde akabilecek NET para (takas parası, pazar alışı, VIP para gönderme), kayan
 * PLAYER_TRANSFER_WINDOW_HOURS penceresinde. Ek hesap çiftliğinden ana hesaba aktarım ikili başına haftada bu kadarla
 * sınırlıdır; oyunun tüccarı (NPC) sayılmaz. Akışlar player_money_flows tablosunda (migration 024).
 */
export const PAIR_TRANSFER_CAP = 5000;
export const PLAYER_TRANSFER_WINDOW_HOURS = 168;
/** Kiralık müzisyenler setlisti önceden öğrenir. */
export const SESSION_FAMILIARITY = 70;
export { GEAR_SETS } from './content/items';
export { COLLECTIONS, type CollectionDef } from './content/gear';

/** Bir eşya hangi yuvadaki yıpranmayı onarabilir? */
export const repairFits = (kit: ItemDef | undefined, targetSlot: string) =>
  !!kit?.repair && !kit.repair.all && (!kit.repair.slots || (kit.repair.slots as string[]).includes(targetSlot));
