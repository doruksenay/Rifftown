// İçerik: daha fazla atölye tarifi. Veri odaklı: yeni tarif bir satır (kimlik en fazla 20 harf).
// Bu dosya ../crafting'ten yalnızca tür alır.
//
// Kurallar (crafting.ts ve server/test/content-volume.test.ts):
// - skill: tarifi yapabilmek için gereken beceri ve en düşük seviyesi (yoksa herkes yapabilir).
// - hours: üretim süresi (yoksa CRAFT_HOURS = 4). Yarıda kesilen üretimde malzemeler geri verilir.
// - Ürün dükkânda da satılan bir eşyaysa (bakım setleri) malzeme maliyeti dükkân fiyatının en az yarısıdır.
// - Kuşanılabilir ürünlerin bonus aralığı var olan tariflerin tavanını (+16) aşmaz; sahne efekti ürünlerinde
//   malzeme maliyeti puan başına en az $30'dır (efekt tavanı ucuza doldurulamaz).

import type { RecipeDef } from '../crafting';

type Mats = Record<string, number>;
const R = (id: string, itemId: string, tr: string, en: string, materials: Mats, bonus: [number, number], skill?: [string, number], hours?: number): RecipeDef => ({
  id,
  itemId,
  name: { tr, en },
  materials,
  bonus,
  ...(skill ? { skill: { id: skill[0], min: skill[1] } } : {}),
  ...(hours ? { hours } : {}),
});
const NONE: [number, number] = [0, 0];

export const MORE_RECIPES: RecipeDef[] = [
  // ---------- Ara malzemeler ----------
  R('tonewood', 'mat_tonewood', 'Tonewood kurutma', 'Seasoning tonewood', { mat_wood: 1, mat_glue: 1 }, NONE, ['woodworking', 15], 3),
  R('hand_pickup', 'mat_handpickup', 'Manyetik sarma', 'Winding a pickup', { mat_magnet: 1, mat_cable: 1 }, NONE, ['electronics', 15], 3),
  R('weave_cloth', 'mat_cloth', 'Sahne kumaşı dokuma', 'Weaving stage cloth', { mat_fabric: 2, mat_thread: 1 }, NONE, ['sewing', 15], 3),

  // ---------- Enstrümanlar ----------
  R('cigarbox_guitar', 'guitar_c_cigarbox', 'Puro kutusu gitar', 'Cigar-box guitar', { mat_wood: 1, mat_strings: 1 }, [2, 9], undefined, 3),
  R('resonator', 'guitar_c_resonator', 'Rezonatör gitar', 'Resonator guitar', { mat_tonewood: 1, mat_metal: 1, mat_strings: 1 }, [4, 14], ['luthiery', 15], 6),
  R('archtop', 'guitar_c_archtop', 'Arch-top caz gitarı', 'Archtop jazz guitar', { mat_tonewood: 1, mat_handpickup: 1, mat_strings: 1 }, [5, 15], ['luthiery', 30], 8),
  R('washtub_bass', 'bass_c_washtub', 'Leğen bas', 'Washtub bass', { mat_metal: 1, mat_strings: 1, mat_wood: 1 }, [2, 9], undefined, 3),
  R('fretless_bass', 'bass_c_fretless', 'Perdesiz bas', 'Fretless bass', { mat_tonewood: 1, mat_strings: 1, mat_handpickup: 1 }, [5, 15], ['luthiery', 30], 8),
  R('cajon', 'drums_c_cajon', 'Cajon', 'Cajon', { mat_wood: 2, mat_glue: 1 }, [3, 12], ['woodworking', 15]),
  R('custom_kit', 'drums_c_custom', 'Ismarlama davul seti', 'Custom drum kit', { mat_tonewood: 2, mat_drumhead: 2, mat_metal: 1 }, [5, 15], ['woodworking', 45], 10),
  R('toy_piano', 'keys_c_toy', 'Oyuncak piyano', 'Toy piano', { mat_keys: 1, mat_wood: 1 }, [2, 9], undefined, 3),
  R('analog_synth', 'keys_c_analog', 'Analog synth', 'Analogue synth', { mat_circuit: 2, mat_keys: 1, mat_cable: 1 }, [5, 15], ['electronics', 30], 8),
  R('tin_can_mic', 'vocals_c_tincan', 'Teneke kutu mikrofon', 'Tin-can mic', { mat_capsule: 1, mat_metal: 1 }, [2, 9], undefined, 3),
  R('ribbon_mic', 'vocals_c_ribbon', 'Şerit mikrofon', 'Ribbon mic', { mat_capsule: 1, mat_magnet: 1, mat_metal: 1, mat_cable: 1 }, [5, 15], ['electronics', 30], 6),
  R('bamboo_sax', 'sax_c_bamboo', 'Bambu saksofon', 'Bamboo sax', { mat_wood: 1, mat_reed: 1 }, [2, 10], ['woodworking', 15]),
  R('soprano_sax', 'sax_c_soprano', 'Soprano saksofon', 'Soprano sax', { mat_brass: 1, mat_reed: 2, mat_spring: 1 }, [5, 15], ['metalwork', 30], 8),
  R('fiddle', 'violin_c_fiddle', 'Fiddle', 'Fiddle', { mat_tonewood: 1, mat_strings: 1, mat_bow: 1 }, [5, 15], ['luthiery', 30], 8),
  R('electric_violin', 'violin_c_electric', 'Elektrikli keman', 'Electric violin', { mat_wood: 1, mat_strings: 1, mat_bow: 1, mat_handpickup: 1 }, [5, 15], ['electronics', 30], 8),
  R('djembe', 'percussion_c_djembe', 'Djembe', 'Djembe', { mat_wood: 1, mat_leather: 1, mat_thread: 1 }, [3, 12], ['woodworking', 15], 5),
  R('darbuka', 'percussion_c_darbuka', 'Toprak darbuka', 'Clay darbuka', { mat_clay: 2, mat_drumhead: 1 }, [3, 13], ['ceramics', 15], 5),

  // ---------- Kıyafetler ----------
  R('denim_vest', 'outfit_c_denim', 'Yamalı kot yelek', 'Patched denim vest', { mat_fabric: 1, mat_thread: 1, mat_metal: 1 }, [2, 9], ['sewing', 15]),
  R('knit_set', 'outfit_c_knit', 'Örgü sahne takımı', 'Knitted stage set', { mat_wool: 3, mat_thread: 1 }, [2, 10], ['knitting', 15], 6),
  R('track_paint', 'outfit_c_track', 'Boyalı eşofman', 'Hand-painted tracksuit', { mat_fabric: 2, mat_paint: 1 }, [3, 11], ['costume_design', 15]),
  R('fringe_jacket', 'outfit_c_fringe', 'Saçaklı deri ceket', 'Fringed leather jacket', { mat_leather: 2, mat_thread: 1 }, [4, 12], ['leatherwork', 30], 6),
  R('spike_armor', 'outfit_c_spikes', 'Çivili deri zırh', 'Spiked leather armour', { mat_leather: 2, mat_metal: 2 }, [4, 13], ['leatherwork', 30], 6),
  R('embroid_vest', 'outfit_c_embroid', 'İşlemeli yelek', 'Embroidered vest', { mat_cloth: 1, mat_thread: 2, mat_beads: 1 }, [4, 12], ['sewing', 30], 8),
  R('concert_gown', 'outfit_c_gown', 'Konser elbisesi', 'Concert gown', { mat_cloth: 2, mat_sequins: 1, mat_thread: 1 }, [5, 14], ['sewing', 45], 10),
  R('mirror_suit', 'outfit_c_mirror', 'Ayna mozaik takım', 'Mirror-mosaic suit', { mat_cloth: 2, mat_sequins: 2, mat_led: 1 }, [5, 14], ['costume_design', 45], 10),

  // ---------- Sanat ----------
  R('screen_print', 'art_c_poster', 'Serigrafi afiş', 'Screen print', { mat_paper: 2, mat_ink: 1 }, [2, 8], ['painting_art', 15], 3),
  R('collage', 'art_c_collage', 'Plak kapağı kolajı', 'Record-sleeve collage', { mat_canvas: 1, mat_paper: 1, mat_glue: 1 }, [2, 10], undefined, 3),
  R('lyric_frame', 'art_c_lyrics', 'Çerçeveli şarkı sözü', 'Framed lyrics', { mat_frame: 1, mat_paper: 1, mat_ink: 1 }, [3, 11], ['calligraphy', 15], 3),
  R('ceramic_vase', 'art_c_vase', 'Seramik vazo', 'Ceramic vase', { mat_clay: 2, mat_paint: 1 }, [3, 13], ['ceramics', 15], 6),
  R('mosaic', 'art_c_mosaic', 'Boncuk mozaiği', 'Bead mosaic', { mat_frame: 1, mat_glue: 1, mat_beads: 2 }, [4, 14], ['painting_art', 30], 6),
  R('neon_sign', 'art_c_neon', 'Neon yazı', 'Neon sign', { mat_led: 2, mat_cable: 1, mat_metal: 1 }, [4, 15], ['electronics', 30], 6),
  R('scrap_sculpture', 'art_c_sculpture', 'Hurda heykel', 'Scrap sculpture', { mat_metal: 3, mat_spring: 1 }, [4, 15], ['metalwork', 30], 8),
  R('band_portrait', 'art_c_portrait', 'Grup portresi', 'Band portrait', { mat_canvas: 1, mat_paint: 2, mat_frame: 1 }, [5, 15], ['painting_art', 45], 10),

  // ---------- Sahne efektleri ----------
  R('confetti_cannon', 'fx_c_confetti', 'Konfeti topu', 'Confetti cannon', { mat_paper: 3, mat_spring: 2, mat_metal: 1 }, [1, 3], undefined, 2),
  R('smoke_pots', 'fx_c_smoke', 'Duman kapları', 'Smoke pots', { mat_powder: 1, mat_metal: 1 }, [1, 3], ['pyrotechnics', 15], 2),
  R('paper_lanterns', 'fx_c_lanterns', 'Kâğıt fenerler', 'Paper lanterns', { mat_paper: 4, mat_bulb: 3, mat_cable: 1 }, [1, 3], undefined, 3),
  R('cold_sparks', 'fx_c_sparks', 'Soğuk kıvılcım', 'Cold sparks', { mat_powder: 2, mat_circuit: 1, mat_metal: 1 }, [2, 6], ['pyrotechnics', 30]),
  R('led_wall', 'fx_c_ledwall', 'LED duvar', 'LED wall', { mat_led: 4, mat_circuit: 1, mat_cable: 1 }, [3, 6], ['electronics', 30], 6),

  // ---------- Tüketim ----------
  R('bind_notebook', 'cons_c_notebook', 'Şarkı defteri ciltleme', 'Binding a songbook', { mat_paper: 3, mat_leather: 1 }, NONE, ['bookbinding', 15], 2),
  R('herbal_tea', 'cons_c_tea', 'Bitki çayı harmanı', 'Blending herbal tea', { mat_herbs: 1, mat_honey: 1 }, NONE, undefined, 1),
  R('throat_syrup', 'cons_c_syrup', 'Boğaz şurubu', 'Throat syrup', { mat_herbs: 1, mat_honey: 2 }, NONE, ['first_aid', 15], 1),
  R('lavender_candle', 'cons_c_candle', 'Lavantalı mum', 'Lavender candle', { mat_wax: 2, mat_herbs: 1 }, NONE, undefined, 2),

  // ---------- Hediyelik ----------
  R('mixtape', 'gift_c_mixtape', 'Mixtape', 'Mixtape', { mat_tape: 1, mat_paper: 1 }, NONE, ['mixing', 15], 2),
  R('bracelet', 'gift_c_bracelet', 'Dostluk bilekliği', 'Friendship bracelet', { mat_beads: 2, mat_thread: 1 }, NONE, undefined, 1),
  R('music_box', 'gift_c_musicbox', 'Müzik kutusu', 'Music box', { mat_wood: 1, mat_spring: 2, mat_metal: 1 }, NONE, ['woodworking', 30], 6),
  R('knit_scarf', 'gift_c_scarf', 'Örgü atkı', 'Knitted scarf', { mat_wool: 2 }, NONE, ['knitting', 15], 4),
  R('pick_pendant', 'gift_c_necklace', 'Gümüş pena kolye', 'Silver pick pendant', { mat_silver: 1, mat_thread: 1 }, NONE, ['jewelry', 15], 3),
  R('charcoal_sketch', 'gift_c_sketch', 'Karakalem portre', 'Charcoal portrait', { mat_paper: 1, mat_frame: 1 }, NONE, ['painting_art', 15], 2),
  R('handmade_mug', 'gift_c_mug', 'El yapımı kupa', 'Handmade mug', { mat_clay: 1, mat_paint: 1 }, NONE, ['ceramics', 15], 3),
  R('song_card', 'gift_c_card', 'Şarkı kartı', 'Song card', { mat_paper: 1, mat_ink: 1 }, NONE, ['calligraphy', 15], 1),
  R('snow_globe', 'gift_c_snowglobe', 'Kar küresi', 'Snow globe', { mat_clay: 1, mat_paint: 1, mat_beads: 1 }, NONE, ['ceramics', 15], 3),
  R('flower_crown', 'gift_c_crown', 'Çiçek taç', 'Flower crown', { mat_herbs: 2, mat_thread: 1 }, NONE, undefined, 1),
  R('silver_ring', 'ring_c_silver', 'Gümüş yüzük', 'Silver ring', { mat_silver: 3, mat_goldleaf: 1 }, NONE, ['jewelry', 45], 8),

  // ---------- Bakım (ürün dükkânda da satılır; malzeme ≥ fiyatın yarısı) ----------
  R('restring', 'care_strings', 'Tel değişim takımı', 'Restringing kit', { mat_strings: 1 }, NONE, undefined, 1),
  R('reskin', 'care_heads', 'Davul derisi seti', 'Drumhead set', { mat_drumhead: 1 }, NONE, undefined, 1),
  R('reed_service', 'care_wind', 'Kamış ve ped bakımı', 'Reed and pad care', { mat_reed: 1, mat_wax: 1 }, NONE, undefined, 1),
  R('contact_clean', 'care_contact', 'Kontak temizliği seti', 'Contact cleaning kit', { mat_cable: 1, mat_battery: 1 }, NONE, ['electronics', 15], 1),
  R('tune_up', 'care_vehicle', 'Araç bakım seti', 'Vehicle tune-up kit', { mat_metal: 1, mat_rubber: 1, mat_spring: 1, mat_cable: 1 }, NONE, ['mechanics', 30], 3),
  R('gear_service', 'gear_service', 'Ekipman bakım paketi', 'Gear service pack', { mat_amp_parts: 1, mat_cable: 1, mat_glue: 1 }, NONE, ['electronics', 30]),
];
