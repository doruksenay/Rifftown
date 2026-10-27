// İçerik: ek dükkân eşyaları ve atölye tarifleri. Veri odaklı: yeni eşya bir satır.
// Fiyat/bonus dengesi var olan merdivenle uyumlu tutuldu (bkz. items.ts INSTRUMENT_TIERS):
// bonus başına fiyat yükseldikçe artar, böylece ucuz eşyayla bonus "biriktirilemez" (her yuvada tek eşya kuşanılır).

import type { ItemDef } from '../items';
import type { RecipeDef } from '../crafting';

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

export const EXTRA_ITEMS: ItemDef[] = [
  // Enstrüman ara seviyeleri ve markasız modeller
  I('guitar_1b', 'music_store', 'guitar', 1, 380, 5, 'Akustik-elektro gitar', 'Electro-acoustic guitar'),
  I('guitar_2b', 'music_store', 'guitar', 2, 2000, 9, 'Yarı gövde caz gitarı', 'Semi-hollow jazz guitar'),
  I('guitar_2c', 'music_store', 'guitar', 2, 2400, 10, 'Yedi telli metal gitarı', 'Seven-string metal guitar'),
  I('bass_1b', 'music_store', 'bass', 1, 380, 5, 'Perdesiz bas', 'Fretless bass'),
  I('bass_2b', 'music_store', 'bass', 2, 2000, 9, 'Beş telli bas', 'Five-string bass'),
  I('drums_1b', 'music_store', 'drums', 1, 380, 5, 'Elektronik davul pedi', 'Electronic drum pad'),
  I('drums_2b', 'music_store', 'drums', 2, 2200, 9, 'Caz davul seti', 'Jazz drum kit'),
  I('keys_1b', 'music_store', 'keys', 1, 380, 5, 'Taşınabilir synth', 'Portable synth'),
  I('keys_2b', 'music_store', 'keys', 2, 2100, 9, 'Elektrik piyano', 'Electric piano'),
  I('keys_2c', 'music_store', 'keys', 2, 2500, 10, 'Modüler synth rafı', 'Modular synth rack'),
  I('vocals_1b', 'music_store', 'vocals', 1, 300, 5, 'Dinamik sahne mikrofonu', 'Dynamic stage mic'),
  I('vocals_2b', 'music_store', 'vocals', 2, 1800, 9, 'Kulak içi monitörlü vokal seti', 'In-ear monitor vocal rig'),
  // Kıyafetler
  I('outfit_1b', 'boutique', 'outfit', 1, 160, 3, 'Grup tişörtü ve postal', 'Band tee and boots'),
  I('outfit_1c', 'boutique', 'outfit', 1, 220, 3, 'Retro eşofman takımı', 'Retro tracksuit'),
  I('outfit_2b', 'boutique', 'outfit', 2, 900, 6, 'Kadife ceket', 'Velvet jacket'),
  I('outfit_2c', 'boutique', 'outfit', 2, 1100, 7, 'Pullu sahne elbisesi', 'Sequined stage dress'),
  I('outfit_2d', 'boutique', 'outfit', 2, 1000, 6, 'Deri pantolon ve yelek', 'Leather trousers and vest'),
  I('outfit_3b', 'boutique', 'outfit', 3, 3800, 11, 'Işıklı sahne kostümü', 'Light-up stage costume'),
  I('outfit_3c', 'boutique', 'outfit', 3, 4200, 12, 'Haute couture smokin', 'Haute couture tuxedo'),
  // Sanat
  I('art_1b', 'gallery', 'art', 1, 180, 6, 'İmzalı plak kapağı', 'Signed record sleeve'),
  I('art_1c', 'gallery', 'art', 1, 240, 7, 'Siyah beyaz konser fotoğrafı', 'Black-and-white gig photo'),
  I('art_2b', 'gallery', 'art', 2, 900, 12, 'Neon tabela', 'Neon sign'),
  I('art_2c', 'gallery', 'art', 2, 2200, 17, 'Bronz heykel', 'Bronze sculpture'),
  I('art_3b', 'gallery', 'art', 3, 5000, 21, 'Pop art serigrafi', 'Pop art screen print'),
  // Evcil hayvanlar
  I('pet_rabbit', 'pet_shop', 'pet', 1, 180, 5, 'Tavşan', 'Rabbit'),
  I('pet_fish', 'pet_shop', 'pet', 1, 120, 4, 'Akvaryum balıkları', 'Aquarium fish'),
  I('pet_tortoise', 'pet_shop', 'pet', 2, 350, 7, 'Kaplumbağa', 'Tortoise'),
  I('pet_ferret', 'pet_shop', 'pet', 2, 550, 9, 'Gelincik', 'Ferret'),
  // Araçlar
  I('scooter_1', 'car_dealer', 'vehicle', 1, 1200, 0, 'Scooter', 'Scooter', { speed: 1.2 }),
  I('pickup_1', 'car_dealer', 'vehicle', 2, 12000, 0, 'Kamyonet', 'Pickup truck', { speed: 1.55 }),
  // Sahne efektleri
  I('fx_bubbles', 'stage_shop', 'fx', 1, 60, 1, 'Köpük makinesi', 'Bubble machine', { stackable: true }),
  I('fx_lasers', 'stage_shop', 'fx', 2, 450, 5, 'Lazer gösterisi', 'Laser show', { stackable: true }),
  I('fx_co2', 'stage_shop', 'fx', 2, 380, 4, 'CO₂ jetleri', 'CO₂ jets', { stackable: true }),
  I('fx_screen', 'stage_shop', 'fx', 3, 1100, 6, 'Dev LED ekran', 'Giant LED screen', { stackable: true }),
  I('fx_balloons', 'stage_shop', 'fx', 1, 90, 2, 'Dev balonlar', 'Giant balloons', { stackable: true }),
  // Malzemeler (yeni tarifler için)
  I('mat_leather', 'hardware', 'material', 1, 45, 0, 'Deri', 'Leather', { stackable: true }),
  I('mat_led', 'hardware', 'material', 1, 50, 0, 'LED şerit', 'LED strip', { stackable: true }),
  I('mat_canvas', 'hardware', 'material', 1, 30, 0, 'Tuval', 'Canvas', { stackable: true }),
  I('mat_paint', 'hardware', 'material', 1, 25, 0, 'Yağlı boya seti', 'Oil paint set', { stackable: true }),
  I('mat_powder', 'hardware', 'material', 1, 60, 0, 'Sahne barutu', 'Stage powder', { stackable: true }),
  I('mat_amp_parts', 'hardware', 'material', 1, 85, 0, 'Amfi parçaları', 'Amp parts', { stackable: true }),
  I('mat_metal', 'hardware', 'material', 1, 40, 0, 'Metal levha', 'Metal sheet', { stackable: true }),
  // Yeni roller için (saksofon, keman, perküsyon)
  I('mat_brass', 'hardware', 'material', 1, 95, 0, 'Pirinç gövde', 'Brass body', { stackable: true }),
  I('mat_reed', 'hardware', 'material', 1, 15, 0, 'Saksofon kamışı', 'Sax reed', { stackable: true }),
  I('mat_bow', 'hardware', 'material', 1, 45, 0, 'Keman yayı', 'Violin bow', { stackable: true }),
  // Turne bakım malzemeleri (turne ekibi ve araç arızası için)
  I('repair_kit', 'hardware', 'material', 1, 120, 0, 'Tamir kiti', 'Repair kit', { stackable: true }),
  I('gear_service', 'stage_shop', 'material', 1, 200, 0, 'Ekipman bakım paketi', 'Gear service pack', { stackable: true }),
  // Atölyede üretilen yeni ürünler
  I('art_crafted', 'hardware', 'art', 2, 400, 0, 'El yapımı tablo', 'Handmade painting', { crafted: true }),
  I('fx_crafted', 'hardware', 'fx', 2, 300, 0, 'El yapımı piroteknik', 'Handmade pyrotechnics', { crafted: true, stackable: true }),
  I('outfit_leather_crafted', 'hardware', 'outfit', 2, 500, 0, 'El yapımı deri ceket', 'Handmade leather jacket', { crafted: true }),
  I('outfit_led_crafted', 'hardware', 'outfit', 3, 900, 0, 'El yapımı ışıklı kostüm', 'Handmade light-up costume', { crafted: true }),
];

// Ödül eşyaları: dükkânda satılmaz, kişiye bağlıdır (satılamaz, pazara konamaz, takas ve hediye edilemez).
// Bonusları aynı yuvadaki dükkân eşyalarının ara basamağındadır; para karşılığı olmadığı için ekonomiye para sokmaz.
export const REWARD_ITEMS: ItemDef[] = [
  I('reward_vedat_mic', 'boutique', 'vocals', 2, 900, 8, 'Vedat Karahan\'ın stüdyo mikrofonu', 'Vedat Karahan\'s studio mic', { reward: true, bound: true }),
  I('reward_fox_jacket', 'boutique', 'outfit', 2, 900, 6, 'Kızıl Tilki sahne ceketi', 'Red Fox stage jacket', { reward: true, bound: true }),
  I('reward_melek_notebook', 'gallery', 'art', 2, 900, 12, 'Melek Aksoy\'un nota defteri', 'Melek Aksoy\'s notebook', { reward: true, bound: true }),
];

export const EXTRA_RECIPES: RecipeDef[] = [
  { id: 'leather_jacket', itemId: 'outfit_leather_crafted', name: { tr: 'Deri ceket', en: 'Leather jacket' }, materials: { mat_leather: 2, mat_metal: 1 }, bonus: [3, 9] },
  { id: 'led_costume', itemId: 'outfit_led_crafted', name: { tr: 'Işıklı kostüm', en: 'Light-up costume' }, materials: { mat_fabric: 2, mat_led: 2, mat_circuit: 1 }, bonus: [5, 14] },
  { id: 'painting', itemId: 'art_crafted', name: { tr: 'Tablo', en: 'Painting' }, materials: { mat_canvas: 1, mat_paint: 1 }, bonus: [3, 15] },
  { id: 'pyro', itemId: 'fx_crafted', name: { tr: 'Piroteknik', en: 'Pyrotechnics' }, materials: { mat_powder: 2, mat_circuit: 1 }, bonus: [2, 6] },
  { id: 'guitar_amp_build', itemId: 'guitar_crafted', name: { tr: 'Amfili gitar', en: 'Guitar with amp' }, materials: { mat_wood: 1, mat_strings: 1, mat_pickup: 1, mat_amp_parts: 1 }, bonus: [5, 16] },
  { id: 'bass_amp_build', itemId: 'bass_crafted', name: { tr: 'Amfili bas', en: 'Bass with amp' }, materials: { mat_wood: 1, mat_strings: 1, mat_pickup: 1, mat_amp_parts: 1 }, bonus: [5, 16] },
  { id: 'steel_drums', itemId: 'drums_crafted', name: { tr: 'Çelik davul seti', en: 'Steel drum kit' }, materials: { mat_metal: 2, mat_drumhead: 2 }, bonus: [4, 15] },
  { id: 'stage_mic', itemId: 'vocals_crafted', name: { tr: 'Sahne mikrofonu', en: 'Stage microphone' }, materials: { mat_capsule: 1, mat_metal: 1, mat_circuit: 1 }, bonus: [4, 15] },
  { id: 'synth_build', itemId: 'keys_crafted', name: { tr: 'Modüler synth', en: 'Modular synth' }, materials: { mat_circuit: 2, mat_keys: 1, mat_led: 1 }, bonus: [5, 16] },
  { id: 'repair', itemId: 'repair_kit', name: { tr: 'Tamir kiti', en: 'Repair kit' }, materials: { mat_metal: 1, mat_amp_parts: 1 }, bonus: [0, 0] },
];
