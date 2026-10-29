// İçerik: tüketim eşyaları, hediyelikler, bakım setleri ve atölye malzemeleri. Veri odaklı: yeni eşya bir satır.
// Bu dosya ../items'tan yalnızca tür alır (çalışma anında döngüsel bağımlılık olmasın).
//
// Denge kuralları (server/test/content-volume.test.ts denetler):
// - Tüketim eşyaları para üretmez; etkileri küçüktür (items.ts MAX_ITEM_USE) ve hepsi ortak beklemeye tabidir
//   (CONSUMABLE_COOLDOWN_HOURS). Sağlık veren eşyalar hastaneden ucuza sağlık vermez ($2/puan ve üstü), enerji veren
//   eşyalar günün yemeğinden pahalıdır: taşınabilirliğin bir bedeli var.
// - Hediyelikler yalnızca arkadaşlığa küçük bir katkı verir (aynı kişiye günde bir kez, en fazla +4).
// - Bakım setleri yıpranmış ekipmanı onarır; atölyede yapılırsa malzemesi dükkân fiyatının en az yarısıdır
//   (atölye-dükkân döngüsüyle para basılamaz).

import type { ItemDef } from '../items';

type Shop = ItemDef['shop'];
type Slot = ItemDef['slot'];
const I = (id: string, shop: Shop, slot: Slot, price: number, tr: string, en: string, extra: Partial<ItemDef> = {}): ItemDef => ({
  id,
  shop,
  slot,
  tier: 1,
  price,
  bonus: 0,
  name: { tr, en },
  ...extra,
});
const U = (id: string, shop: Shop, price: number, tr: string, en: string, use: ItemDef['use'], extra: Partial<ItemDef> = {}) =>
  I(id, shop, 'consumable', price, tr, en, { use, stackable: true, ...extra });
const G = (id: string, shop: Shop, price: number, tr: string, en: string, friendship: number, extra: Partial<ItemDef> = {}) =>
  I(id, shop, 'gift', price, tr, en, { gift: { friendship }, ...extra });
const M = (id: string, price: number, tr: string, en: string, shop: Shop = 'hardware') => I(id, shop, 'material', price, tr, en, { stackable: true });

// ---------- Tüketim ----------

const CONSUMABLES: ItemDef[] = [
  // Eczane rafı (hastane)
  U('cons_lozenge', 'hospital', 12, 'Boğaz pastili', 'Throat lozenges', { health: 2, mood: 2 }),
  U('cons_painkiller', 'hospital', 20, 'Ağrı kesici', 'Painkillers', { health: 4 }),
  U('cons_vitamins', 'hospital', 25, 'Vitamin tableti', 'Vitamin tablets', { health: 5 }),
  U('cons_balm', 'hospital', 30, 'Kas gevşetici krem', 'Muscle balm', { health: 6 }),
  U('cons_herbtea', 'hospital', 15, 'Bitki çayı paketi', 'Herbal tea pack', { mood: 4, energy: 3 }),
  U('cons_electrolyte', 'hospital', 18, 'Elektrolit içeceği', 'Electrolyte drink', { energy: 8, health: 1 }),
  // Kulis (sahne ekipmanı dükkânı)
  U('cons_coldbrew', 'stage_shop', 10, 'Soğuk demleme kahve', 'Cold-brew coffee', { energy: 6 }),
  U('cons_proteinbar', 'stage_shop', 14, 'Protein bar', 'Protein bar', { energy: 7 }),
  U('cons_energydrink', 'stage_shop', 20, 'Enerji içeceği', 'Energy drink', { energy: 12 }),
  U('cons_rider', 'stage_shop', 30, 'Kulis atıştırmalık tabağı', 'Backstage rider platter', { energy: 8, mood: 5 }),
  // Kitapçı
  U('cons_crossword', 'bookstore', 8, 'Bulmaca dergisi', 'Crossword magazine', { mood: 3 }),
  U('cons_musicmag', 'bookstore', 12, 'Müzik dergisi', 'Music magazine', { mood: 2, inspiration: 1 }),
  U('cons_comic', 'bookstore', 15, 'Çizgi roman', 'Comic book', { mood: 5 }),
  U('cons_pocketbook', 'bookstore', 35, 'Cep defteri', 'Pocket notebook', { inspiration: 3 }),
  U('cons_journal', 'bookstore', 90, 'Deri kaplı ilham defteri', 'Leather-bound idea journal', { inspiration: 5 }),
  // Galeri ve diğerleri
  U('cons_museum', 'gallery', 30, 'Müze giriş bileti', 'Museum ticket', { mood: 5, inspiration: 3 }),
  U('cons_catalogue', 'gallery', 45, 'Sergi kataloğu', 'Exhibition catalogue', { inspiration: 4 }),
  U('cons_candle', 'boutique', 40, 'Aromaterapi mumu', 'Aromatherapy candle', { mood: 6 }),
  U('cons_spa', 'boutique', 120, 'Spa günü kuponu', 'Spa day voucher', { mood: 10, health: 3 }),
  U('cons_ticket', 'music_store', 60, 'Başka bir grubun konser bileti', 'Ticket to another band’s gig', { mood: 8, inspiration: 4 }),
  U('cons_pettreat', 'pet_shop', 10, 'Evcil hayvan ödül maması', 'Pet treats', { mood: 3 }),
  // Sezonluk
  U('cons_strawberries', 'hospital', 10, 'Taze çilek kasesi', 'Bowl of fresh strawberries', { mood: 3, health: 1 }, { season: 'spring' }),
  U('cons_lemonade', 'stage_shop', 8, 'Buzlu limonata', 'Iced lemonade', { energy: 5, mood: 3 }, { season: 'summer' }),
  U('cons_chestnuts', 'hospital', 9, 'Kestane kebap', 'Roasted chestnuts', { energy: 4, mood: 4 }, { season: 'autumn' }),
  U('cons_cocoa', 'stage_shop', 8, 'Sıcak çikolata', 'Hot chocolate', { energy: 4, mood: 4 }, { season: 'winter' }),
];

// ---------- Hediyelik ----------

const GIFTS: ItemDef[] = [
  G('gift_flowers', 'boutique', 25, 'Çiçek buketi', 'Bouquet of flowers', 1),
  G('gift_scarf', 'boutique', 120, 'İpek fular', 'Silk scarf', 2),
  G('gift_perfume', 'boutique', 250, 'Parfüm', 'Perfume', 3),
  G('gift_watch', 'boutique', 900, 'Kol saati', 'Wristwatch', 4),
  G('gift_poetry', 'bookstore', 30, 'Şiir kitabı', 'Poetry book', 1),
  G('gift_biography', 'bookstore', 45, 'Müzisyen biyografisi', 'Musician biography', 1),
  G('gift_songbook', 'bookstore', 80, 'Nota defteri hediye seti', 'Songbook gift set', 2),
  G('gift_postcards', 'gallery', 15, 'Kartpostal seti', 'Postcard set', 1),
  G('gift_framedphoto', 'gallery', 150, 'Çerçeveli konser fotoğrafı', 'Framed gig photo', 2),
  G('gift_plush', 'pet_shop', 40, 'Peluş oyuncak', 'Plush toy', 1),
  G('gift_picknecklace', 'music_store', 35, 'Pena kolye', 'Guitar-pick necklace', 1),
  G('gift_sticks', 'music_store', 300, 'Ünlü bir davulcunun imzalı bageti', 'Drumsticks signed by a famous drummer', 3),
  // Sezonluk
  G('gift_pottedflower', 'boutique', 35, 'Saksı çiçeği', 'Potted flower', 2, { season: 'spring' }),
  G('gift_wristband', 'music_store', 20, 'Festival bilekliği', 'Festival wristband', 1, { season: 'summer' }),
  G('gift_beanie', 'boutique', 30, 'El örgüsü bere', 'Hand-knitted beanie', 2, { season: 'autumn' }),
  G('gift_cookies', 'bookstore', 30, 'Yılbaşı kurabiye kutusu', 'Box of holiday cookies', 2, { season: 'winter' }),
];

// ---------- Bakım setleri (yıpranmayı onarır; tamir kiti ve bakım paketi content/items.ts içinde) ----------

const CARE: ItemDef[] = [
  I('care_strings', 'hardware', 'material', 50, 'Tel değişim takımı', 'Restringing kit', { stackable: true, repair: { wear: 40, slots: ['guitar', 'bass', 'violin'] } }),
  I('care_heads', 'hardware', 'material', 70, 'Davul derisi yenileme seti', 'Drumhead replacement set', { stackable: true, repair: { wear: 45, slots: ['drums', 'percussion'] } }),
  I('care_wind', 'hardware', 'material', 45, 'Kamış ve ped bakım seti', 'Reed and pad care kit', { stackable: true, repair: { wear: 40, slots: ['sax'] } }),
  I('care_contact', 'hardware', 'material', 55, 'Kontak temizleyici ve kablo seti', 'Contact cleaner and cable kit', { stackable: true, repair: { wear: 40, slots: ['keys', 'vocals'] } }),
  I('care_vehicle', 'car_dealer', 'material', 160, 'Araç bakım seti', 'Vehicle tune-up kit', { stackable: true, repair: { wear: 60, slots: ['vehicle'] } }),
];

// ---------- Atölye malzemeleri ----------

const MATERIALS: ItemDef[] = [
  M('mat_thread', 15, 'İplik ve düğme', 'Thread and buttons'),
  M('mat_glue', 20, 'Tutkal ve vernik', 'Glue and varnish'),
  M('mat_spring', 18, 'Yay ve vida takımı', 'Springs and screws'),
  M('mat_cable', 22, 'Kablo ve jak', 'Cable and jacks'),
  M('mat_battery', 12, 'Pil takımı', 'Battery pack'),
  M('mat_bulb', 16, 'Ampul ve duy', 'Bulbs and sockets'),
  M('mat_rubber', 14, 'Kauçuk', 'Rubber'),
  M('mat_paper', 10, 'El yapımı kâğıt', 'Handmade paper'),
  M('mat_ink', 12, 'Mürekkep', 'Ink'),
  M('mat_beads', 10, 'Boncuk', 'Beads'),
  M('mat_frame', 35, 'Ahşap çerçeve', 'Wooden frame'),
  M('mat_wax', 12, 'Balmumu', 'Beeswax'),
  M('mat_clay', 20, 'Seramik çamuru', 'Pottery clay'),
  M('mat_tape', 12, 'Boş kaset', 'Blank cassette'),
  M('mat_wool', 18, 'Yün yumağı', 'Ball of wool'),
  M('mat_magnet', 30, 'Mıknatıs ve bobin teli', 'Magnet and coil wire'),
  M('mat_silver', 60, 'Gümüş tel', 'Silver wire'),
  M('mat_goldleaf', 80, 'Altın varak', 'Gold leaf'),
  // Eczane rafında: şifalı bitki ve bal (ev yapımı çay, şurup ve mum için)
  M('mat_herbs', 15, 'Kurutulmuş şifalı bitkiler', 'Dried medicinal herbs', 'hospital'),
  M('mat_honey', 20, 'Kavanoz bal', 'Jar of honey', 'hospital'),
];

// ---------- Atölyede üretilenler ----------

const C = (id: string, slot: Slot, price: number, tr: string, en: string, extra: Partial<ItemDef> = {}) =>
  I(id, 'hardware', slot, price, tr, en, { crafted: true, tier: 2, ...extra });

export const CRAFTED_GOODS: ItemDef[] = [
  // Ara malzemeler: ustalık tariflerinde kullanılır. Fiyatları kendi malzemelerinin maliyetine eşittir: tüccar
  // atölye ürününe fiyatı malzeme maliyetinden hesapladığı için ara malzeme kârı şişirmesin (test)
  C('mat_tonewood', 'material', 80, 'Kurutulmuş tonewood', 'Seasoned tonewood'),
  C('mat_handpickup', 'material', 52, 'El sarımı manyetik', 'Hand-wound pickup'),
  C('mat_cloth', 'material', 75, 'Dokunmuş sahne kumaşı', 'Woven stage cloth'),
  // Tüketim
  C('cons_c_notebook', 'consumable', 150, 'El ciltli şarkı defteri', 'Hand-bound songbook', { use: { inspiration: 4, mood: 1 } }),
  C('cons_c_tea', 'consumable', 60, 'Ev yapımı bitki çayı', 'Home-blended herbal tea', { use: { mood: 4, health: 2 } }),
  C('cons_c_syrup', 'consumable', 80, 'Ballı zencefil şurubu', 'Honey-ginger syrup', { use: { health: 3, energy: 3 } }),
  C('cons_c_candle', 'consumable', 60, 'Lavantalı mum', 'Lavender candle', { use: { mood: 6 } }),
  // Hediyelik
  C('gift_c_mixtape', 'gift', 150, 'Kişiye özel mixtape', 'Personal mixtape', { gift: { friendship: 3 } }),
  C('gift_c_bracelet', 'gift', 60, 'Boncuklu dostluk bilekliği', 'Beaded friendship bracelet', { gift: { friendship: 2 } }),
  C('gift_c_musicbox', 'gift', 300, 'Ahşap müzik kutusu', 'Wooden music box', { gift: { friendship: 4 } }),
  C('gift_c_scarf', 'gift', 120, 'El örgüsü atkı', 'Hand-knitted scarf', { gift: { friendship: 3 } }),
  C('gift_c_necklace', 'gift', 200, 'Gümüş pena kolye', 'Silver pick pendant', { gift: { friendship: 3 } }),
  C('gift_c_sketch', 'gift', 100, 'Karakalem portre', 'Charcoal portrait', { gift: { friendship: 2 } }),
  C('gift_c_mug', 'gift', 80, 'El yapımı kupa', 'Handmade mug', { gift: { friendship: 2 } }),
  C('gift_c_card', 'gift', 40, 'El yazısı şarkı kartı', 'Hand-lettered song card', { gift: { friendship: 2 } }),
  C('gift_c_snowglobe', 'gift', 120, 'Kar küresi', 'Snow globe', { gift: { friendship: 3 } }),
  C('gift_c_crown', 'gift', 60, 'Kurutulmuş çiçek taç', 'Dried-flower crown', { gift: { friendship: 2 } }),
];

export const GOODS: ItemDef[] = [...CONSUMABLES, ...GIFTS, ...CARE, ...MATERIALS, ...CRAFTED_GOODS];
