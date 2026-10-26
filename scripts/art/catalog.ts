// Rifftown görsel kataloğu: oyunun verisinden (packages/shared) hangi görsellerin gerektiğini çıkarır.
// Kimlikler oyundaki kimliklerle aynıdır; varlık kimliği = dosya yolu (uzantısız), ör. "item/guitar_3".
// Bu dosya üretimden bağımsızdır: hangi görselin gerektiğini tanımlar, görsel üretmez.

import {
  ACHIEVEMENTS,
  CITIES,
  GENRES,
  GENRE_NAMES,
  ITEMS,
  type ItemDef,
  LOCATION_TYPE_NAMES,
  type LocationType,
  MOODLETS,
  SKILL_CATEGORIES,
  SKILL_CATEGORY_NAMES,
  TATTOOS,
} from '@rifftown/shared';

export type Category =
  | 'city'
  | 'place'
  | 'crowd'
  | 'item'
  | 'paint_mask'
  | 'avatar'
  | 'achievement'
  | 'icon_place'
  | 'icon_skill'
  | 'moodlet'
  | 'tattoo'
  | 'cover';

export interface Spec {
  width: number;
  height: number;
  format: 'webp' | 'png' | 'jpg';
  /** Kenarları şeffaf olmalı mı */
  transparent: boolean;
  /** ChatGPT'den istenecek kaynak boyutu (hazırlık betiği hedef boyuta indirir/kırpar) */
  source: '1536x1024' | '1024x1024';
}

export const SPECS: Record<Category, Spec> = {
  city: { width: 1600, height: 700, format: 'webp', transparent: false, source: '1536x1024' },
  place: { width: 1600, height: 700, format: 'webp', transparent: false, source: '1536x1024' },
  crowd: { width: 1600, height: 700, format: 'webp', transparent: false, source: '1536x1024' },
  item: { width: 512, height: 512, format: 'png', transparent: true, source: '1024x1024' },
  paint_mask: { width: 512, height: 512, format: 'png', transparent: true, source: '1024x1024' },
  avatar: { width: 512, height: 512, format: 'webp', transparent: false, source: '1024x1024' },
  achievement: { width: 256, height: 256, format: 'png', transparent: true, source: '1024x1024' },
  icon_place: { width: 128, height: 128, format: 'png', transparent: true, source: '1024x1024' },
  icon_skill: { width: 128, height: 128, format: 'png', transparent: true, source: '1024x1024' },
  moodlet: { width: 128, height: 128, format: 'png', transparent: true, source: '1024x1024' },
  tattoo: { width: 512, height: 512, format: 'png', transparent: true, source: '1024x1024' },
  cover: { width: 1024, height: 1024, format: 'jpg', transparent: false, source: '1024x1024' },
};

export type Tier = 'basic' | 'stage' | 'professional' | 'iconic' | 'crafted';

export interface AssetDef {
  /** = yol, uzantısız: "item/guitar_3" */
  id: string;
  category: Category;
  /** app/assets/art altına göre yol */
  path: string;
  /** Oyunda karşılığı olan kimlik(ler) (ör. bütün sprey boyalar tek resmi kullanır) */
  gameRefs: string[];
  /** Oyunda yok, sadece görsel dil denemesi (kanun, trombon) */
  visualTestOnly?: boolean;
  label: string;
  /** Görselin konusu (İngilizce, prompta girer) */
  subject: string;
  tier?: Tier;
  /** Boyanabilen eşya: maskesi ve boyanmamış hâlinin fabrika rengi */
  paintable?: boolean;
  mask?: string;
  defaultPaint?: string;
  /** Önce üretilmesi gereken varlıklar (maske → eşya, doluluk → mekân) */
  dependsOn: string[];
  batch: string;
}

const tierOf = (d: ItemDef): Tier => (d.crafted ? 'crafted' : (['basic', 'stage', 'professional', 'iconic'] as const)[Math.min(4, d.tier) - 1]);

// ---------- Konular ----------

const CITY_SUBJECT: Record<string, string> = {
  istanbul: 'Istanbul across the Bosphorus: Galata Tower, mosque domes and slender minarets on the skyline, ferries on the water, hillside houses',
  ankara: 'Ankara: the slim Atakule tower with its saucer top, modern apartment blocks, a wide boulevard with traffic, distant hills',
  izmir: "Izmir's seafront: the ornate Konak Clock Tower, palm trees along the Kordon promenade, the bay",
  berlin: 'Berlin: the Fernsehturm TV tower with its sphere, the river Spree, old apartment buildings, a railway bridge with a train',
  hamburg: 'Hamburg harbour: the Elbphilharmonie with its wavy glass roof on a brick warehouse base, harbour cranes, ships on the Elbe',
  munich: 'Munich: the twin onion-domed towers of the Frauenkirche, old town rooftops, the Alps faint on the horizon',
  london: 'London: Big Ben and the Houses of Parliament, the river Thames with a bridge, a red double-decker bus',
  manchester: 'Manchester: red-brick warehouses and canals, the tall slim Beetham Tower, old mill chimneys',
  liverpool: 'Liverpool waterfront: the Royal Liver Building with its two clock towers, the river Mersey, the docks',
  paris: 'Paris: the Eiffel Tower, Haussmann rooftops with chimneys, the Seine with an arched stone bridge',
  lyon: 'Lyon: the Fourviere Basilica on its hill, the old town along the Saone river with colourful facades',
  marseille: 'Marseille: the Notre-Dame de la Garde basilica on its hilltop, the Old Port full of sailing boats',
  newyork: 'Manhattan skyline: the Empire State Building, dense skyscrapers, yellow taxis on an avenue',
  losangeles: 'Los Angeles: tall palm trees, the downtown skyline, the hills behind, a freeway with light trails',
  nashville: 'Downtown Nashville: Broadway honky-tonk bars with neon in the foreground, the twin-spired AT&T Building, the Cumberland river',
};

const PLACE_SUBJECT: Record<LocationType, string> = {
  bar: 'inside a small basement live-music bar seen from the audience, low stage with a drum kit and amplifiers against an exposed brick wall, bar counter with stools',
  club: 'inside a mid-sized music club seen from the dance floor, stage with coloured spotlights and haze, balcony rail',
  hall: 'inside a grand concert hall seen from the stalls, big stage framed by heavy velvet curtains, balconies, rows of seats',
  stadium: 'a huge open-air stadium concert seen from the stands, massive stage with giant screens and lighting towers',
  festival: 'a summer open-air music festival at golden hour, big stage with lighting truss, colourful tents and flags on the grass',
  school: 'inside a music school classroom, an upright piano, guitars on stands, music stands, a chalkboard with drawn staves',
  studio: 'inside a small band rehearsal room, guitar amps, a drum kit, cables on the floor, acoustic foam on the walls',
  recording_studio: 'inside a recording studio control room, large mixing desk, monitor speakers, a vocal booth behind glass',
  university: 'exterior of a classic university building with columns and wide steps, lamp posts, trees',
  bookstore: 'inside a cosy independent bookshop, tall wooden shelves, a reading armchair, a table of music books',
  work: 'a small neighbourhood cafe counter, coffee machine, pastry display, an apron on a hook',
  music_store: 'inside a music instrument shop, a wall of guitars hanging in rows, keyboards and a drum kit on the floor, amps',
  boutique: 'inside a stage-fashion boutique, racks of leather jackets and stage costumes, a full-length mirror, mannequins',
  gallery: 'inside a modern art gallery, framed paintings on white walls under spotlights, a bench',
  car_dealer: 'a car showroom, a few shiny cars and a motorbike on a polished floor behind large glass windows',
  pet_shop: 'inside a friendly pet shop, a cat on a scratching post, a puppy, a parrot on a perch, shelves of pet food',
  hardware: 'inside a hardware store and workshop, workbench with tools, pegboard wall, shelves of spray paint cans, wood planks',
  stage_shop: 'inside a stage equipment shop, fog machines, moving-head lights, confetti cannons on display',
  flea_market: 'a covered flea market, stalls with second-hand guitars, vinyl records, old clothes and lamps, string lights',
  tattoo: 'inside a tattoo studio, a tattoo chair, flash drawings pinned on the wall, ink bottles, a desk lamp',
  gym: 'inside a gym, dumbbell racks, a bench press, treadmills by large windows',
  restaurant: 'inside a lively restaurant, tables with candles and plates of food, an open kitchen in the background',
  hotel: 'a boutique hotel lobby, reception desk with a bell, armchairs, a staircase, chandelier light',
  hospital: 'exterior of a modern city hospital, emergency entrance with an ambulance',
  real_estate: 'a real estate agency storefront, window display of house photos, a desk inside',
  bank: 'exterior of a stately bank building with stone columns and a heavy door',
  city_hall: 'exterior of a grand city hall with a clock tower and a flag, a square in front',
  police: 'exterior of a city police station, a police car parked in front',
  courthouse: 'inside a courtroom, judge bench, witness stand, wooden benches',
  prison: 'exterior of a prison, high walls with barbed wire, a watchtower with a searchlight',
  plaza: 'a modern glass office tower and its lobby, revolving door, escalators',
  newspaper: 'inside a busy newsroom, desks with computers, stacks of newspapers, a printing press behind glass',
  worship: 'exterior of a calm non-denominational place of worship, a simple dome, trees, no religious symbols',
  park: 'a city park, trees, a bench under a lamp post, a small pond, a busker with a guitar in the distance',
};

/** Eşyaların konusu. Boyanabilen yüzeyler istemde ayrıca tarif edilir. */
const ITEM_SUBJECT: Record<string, string> = {
  vocals_1: 'a cheap basic handheld dynamic microphone with a plain round grille',
  vocals_2: 'a sturdy professional stage vocal microphone with a polished grille',
  vocals_3: 'a sleek premium wireless studio-grade handheld microphone with a small status light',
  vocals_4: 'a legendary vintage large-diaphragm studio condenser microphone in a shock mount with chrome details',
  vocals_crafted: 'a handmade microphone built in a workshop, visible screws, hand-turned wooden handle',
  guitar_1: 'a cheap beginner electric guitar, simple double-cut body, basic hardware',
  guitar_2: 'a solid mid-range stage electric guitar with two pickups and a pickguard',
  guitar_3: 'a luthier-made master electric guitar, figured maple neck, gold hardware, elegant body',
  guitar_4: 'a legendary 1959-style vintage single-cut electric guitar, worn relic finish, aged hardware',
  guitar_crafted: 'a handmade workshop electric guitar, unusual hand-shaped body, hand-wound pickups, visible wood grain on the neck',
  bass_1: 'a cheap beginner four-string electric bass guitar, simple body',
  bass_2: 'a solid stage four-string electric bass with a pickguard and two pickups',
  bass_3: 'a luthier-made master five-string bass, figured wood neck, gold hardware',
  bass_4: 'a legendary 1962-style vintage electric bass, worn relic finish, aged chrome covers',
  bass_crafted: 'a handmade workshop bass guitar, chunky neck, visible wood grain, home-built look',
  drums_1: 'a small beginner drum kit: bass drum, snare, one tom and one cymbal',
  drums_2: 'a complete stage drum kit: bass drum, snare, two toms, floor tom, hi-hat and two cymbals',
  drums_3: 'a large professional drum kit with many toms and gleaming cymbals on chrome stands',
  drums_4: "a legendary drummer's old vintage drum kit, worn heads with stick marks, aged brass cymbals",
  drums_crafted: 'a handmade workshop drum kit, hand-tightened lugs, mismatched vintage cymbals',
  keys_1: 'a small beginner portable keyboard with a few buttons',
  keys_2: 'a stage synthesizer with knobs, a small screen and pitch wheels',
  keys_3: 'a large professional 88-key workstation keyboard with many controls and a colour screen',
  keys_4: 'a legendary vintage analog synthesizer with wooden side panels, rows of knobs and patch cables',
  keys_crafted: 'a handmade workshop synthesizer in a wooden box, mismatched knobs, exposed circuit details',
  outfit_1: 'a plain t-shirt with jeans laid together',
  outfit_2: 'a rock leather biker jacket with zips and studs on a hanger',
  outfit_3: 'a designer stage jacket with sequins and sharp shoulders on a hanger',
  outfit_4: 'a spectacular celebrity-designer stage coat with embroidery and crystals on a mannequin',
  outfit_crafted: 'a handmade patchwork stage jacket with hand-sewn patches and safety pins on a hanger',
  car_1: 'an old small hatchback car, a little dented, side view',
  moto_1: 'a classic naked motorcycle, side view',
  car_2: 'a practical modern family saloon car, side view',
  van_1: 'a band tour minibus van with instrument cases on the roof rack, side view',
  car_3: 'a sleek modern sports coupe, low and sharp, side view',
  car_4: 'a classic 1960s-style convertible with chrome details, top down, side view',
  spray: 'a single spray paint can with its cap',
  art_1: 'a framed screen-printed gig poster with abstract guitar and star shapes, no words',
  art_2: 'a street art canvas with colourful graffiti-style shapes and drips, no letters',
  art_3: 'an oil painting of a mountain landscape at sunset in a gilded wooden frame',
  art_4: 'a large abstract expressionist painting in a thin modern frame',
  art_5: 'a museum-grade classical portrait painting in an ornate heavy gold frame',
  ring_1: 'a simple silver engagement ring with a small stone',
  ring_2: 'a platinum engagement ring with a large brilliant-cut diamond',
  pet_cat: 'a grey tabby cat sitting, looking at the viewer',
  pet_dog: 'a friendly scruffy mixed-breed adopted street dog sitting',
  pet_parrot: 'a colourful talking parrot on a small wooden perch',
  pet_bengal: 'an elegant spotted Bengal cat lying down',
  fx_smoke: 'a stage fog machine puffing a cloud of smoke',
  fx_confetti: 'a stage confetti cannon firing colourful confetti',
  fx_lights: 'a moving-head stage light casting a coloured beam',
  fx_pyro: 'a stage pyrotechnic flame unit shooting a column of fire',
  mat_wood: 'a raw unfinished solid-wood guitar body blank with visible grain',
  mat_strings: 'a coiled set of guitar strings in a small open pack',
  mat_pickup: 'a single electric guitar pickup with its wires',
  mat_drumhead: 'a new white drum head with a metal hoop',
  mat_circuit: 'a small green electronic circuit board with chips',
  mat_keys: 'a loose row of spare black and white piano keys',
  mat_capsule: 'a small microphone capsule with a gold diaphragm',
  mat_fabric: 'a folded bolt of fabric with a measuring tape',
  mat_sequins: 'a small glass jar overflowing with sequins and rhinestones',
  // Görsel dil denemeleri (oyunda yok)
  kanun_3: 'a professional Turkish kanun (qanun) zither, trapezoid wooden body with inlay, many strings, small metal levers',
  trombone_2: 'a brass tenor trombone with its slide, polished lacquer',
};

/** Boyanabilen yüzey: maskenin beyaz olacağı yer */
const PAINT_SURFACE: Record<string, string> = {
  vocals: 'the microphone handle/body (not the grille)',
  guitar: 'the guitar body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings)',
  bass: 'the bass body top and sides (not the neck, fretboard, pickguard, pickups, hardware or strings)',
  drums: 'the outer shells of the drums (not the heads, hoops, lugs, cymbals or stands)',
  keys: 'the keyboard casing (not the keys, knobs, screen or wooden side panels)',
  outfit: 'the main garment fabric or leather (not zips, studs, buttons, crystals, hanger or mannequin)',
  vehicle: 'the car/van body paint or the motorcycle tank and fairings (not glass, tyres, wheels, chrome, lights)',
  spray: 'the can body label area and the cap (not the metal top and nozzle)',
};

/** Boyanmamış (fabrika) rengi: kod boyanabilir yüzeyi bu renge boyar */
const DEFAULT_PAINT: Record<string, string> = {
  guitar_1: '#2F6FB5', guitar_2: '#1B1B1E', guitar_3: '#8C1C2B', guitar_4: '#C9A227', guitar_crafted: '#5B7F3A',
  bass_1: '#1B1B1E', bass_2: '#2E7D6B', bass_3: '#5A2A82', bass_4: '#B5382F', bass_crafted: '#6B4A2E',
  drums_1: '#3A3F4A', drums_2: '#9E1B32', drums_3: '#1F3B73', drums_4: '#C9A227', drums_crafted: '#7A5230',
  keys_1: '#2B2B30', keys_2: '#E9E9EE', keys_3: '#1B1B1E', keys_4: '#C8B48A', keys_crafted: '#6B4A2E',
  vocals_1: '#2B2B30', vocals_2: '#1B1B1E', vocals_3: '#E9E9EE', vocals_4: '#C9A227', vocals_crafted: '#6B4A2E',
  outfit_1: '#3B5BA5', outfit_2: '#1B1B1E', outfit_3: '#5A2A82', outfit_4: '#B8860B', outfit_crafted: '#4A6B3A',
  car_1: '#B5382F', moto_1: '#1B1B1E', car_2: '#8A8F99', van_1: '#E9E9EE', car_3: '#1F3B73', car_4: '#2E7D6B',
  spray: '#8A8F99',
};

const AVATAR_SUBJECTS = [
  'a young woman rock guitarist in her twenties, short dyed pink bob, black leather jacket, small nose ring',
  'a young man punk drummer with a green mohawk, sleeveless denim vest, freckles',
  'a Black woman jazz singer in her thirties, natural afro, gold hoop earrings, elegant dark dress',
  'a middle-aged Turkish man folk-rock musician, thick moustache, curly dark hair, patterned shirt',
  'a young East Asian woman electronic producer, straight black hair with blunt bangs, headphones around her neck',
  'a young Black man hip-hop artist with short twists, a gold chain, a streetwear hoodie',
  'a metal bassist man in his thirties, very long black hair, full beard, plain black t-shirt',
  'an older woman blues pianist in her sixties, silver hair in a bun, round glasses, cardigan',
  'a young Latina pop singer, long wavy dark hair, glittery top, star earrings',
  'a young man indie guitarist, messy blond hair, beanie, flannel shirt',
  'a South Asian woman keyboardist, long braid, denim jacket',
  'a Middle Eastern man in his forties, shaved head, neat beard, turtleneck, jazz saxophonist look',
  'a young non-binary electronic musician, cyan-dyed undercut, several ear piercings, mesh top',
  'a red-haired woman in her twenties, curly ginger hair, freckles, vintage band jacket, singer-songwriter',
  'an older man rock veteran in his sixties, long grey hair, sunglasses pushed up, leather vest',
  'a young Turkish woman Anatolian-rock singer, long straight dark hair, small hoop earrings, embroidered jacket',
  'a young man DJ, backwards cap, small moustache, oversized t-shirt',
  'a Black woman rock bassist, long box braids tied up, studded choker, bold lipstick',
  'a young East Asian man, bleached silver hair, sharp tailored jacket, pop idol look',
  'a woman in her forties, short grey pixie cut, bold glasses, black turtleneck, synth pioneer',
  'a young man country singer, cowboy hat, light stubble, denim shirt',
  'a young woman goth singer, long black hair, dark eye makeup, lace collar',
  'a Black man in his fifties, grey beard, flat cap, vest over a white shirt, soul guitarist',
  'a young woman pop-punk drummer, purple high ponytail, sporty jacket',
  'a young man jazz pianist, curly brown hair, round glasses, cardigan, shy smile',
  'a Latino man in his thirties, slicked-back hair, thin moustache, open-collar shirt, rock singer',
  'a young woman metal guitarist, blonde buzz cut, small star tattoos on her neck, tank top',
  'a man in his twenties, colourful knitted hat over dreadlocks, friendly grin, reggae-influenced singer',
  'a woman in her fifties, bright red short haircut, statement earrings, sequined blazer, classic rock vocalist',
  'a young man of about twenty, messy black fringe, plain hoodie, earbuds, bedroom producer',
  'a young woman in 1970s style, wavy brown bob, big round sunglasses, fringed suede jacket',
  'a tall man in his thirties, sharp fade haircut, trimmed beard, gold rings, satin shirt, R&B singer',
];

const VENUES = ['bar', 'club', 'hall', 'stadium', 'festival'] as const;
const CROWD = { empty: 'almost empty, only a handful of people', half: 'about half full', full: 'packed wall to wall, hands in the air' } as const;

const PAINTABLE_SLOTS = new Set(['vocals', 'guitar', 'bass', 'drums', 'keys', 'outfit', 'vehicle', 'spray']);

// ---------- Katalog ----------

function batchOfItem(d: ItemDef): string {
  if (['guitar_1', 'guitar_4', 'keys_3', 'outfit_2', 'car_2'].includes(d.id)) return 'B0';
  if (['vocals', 'guitar', 'bass', 'drums', 'keys'].includes(d.slot)) return 'B3';
  if (['outfit', 'vehicle', 'spray'].includes(d.slot)) return 'B4';
  return 'B5';
}

export function buildCatalog(): AssetDef[] {
  const out: AssetDef[] = [];
  const add = (a: Omit<AssetDef, 'path'>) => out.push({ ...a, path: `${a.id}.${SPECS[a.category].format}` });

  for (const c of CITIES) {
    add({ id: `city/${c.id}`, category: 'city', gameRefs: [c.id], label: c.name.en, subject: CITY_SUBJECT[c.id] ?? c.name.en, dependsOn: [], batch: c.id === 'istanbul' ? 'B0' : 'B1' });
  }
  for (const t of Object.keys(LOCATION_TYPE_NAMES) as LocationType[]) {
    add({ id: `place/${t}`, category: 'place', gameRefs: [t], label: LOCATION_TYPE_NAMES[t].en, subject: PLACE_SUBJECT[t], dependsOn: [], batch: t === 'bar' ? 'B0' : 'B2' });
  }
  for (const v of VENUES) {
    for (const [k, crowd] of Object.entries(CROWD)) {
      add({
        id: `crowd/${v}.${k}`,
        category: 'crowd',
        gameRefs: [v],
        label: `${LOCATION_TYPE_NAMES[v].en} (${k})`,
        subject: `${PLACE_SUBJECT[v]}; the audience is ${crowd}; same room, camera and lighting as place/${v}`,
        dependsOn: [`place/${v}`],
        batch: 'B7',
      });
    }
  }
  // Eşyalar: sprey boyalar tek resmi paylaşır
  const sprays = ITEMS.filter((d) => d.slot === 'spray').map((d) => d.id);
  for (const d of ITEMS) {
    if (d.slot === 'spray') continue;
    const paintable = PAINTABLE_SLOTS.has(d.slot === 'vehicle' ? 'vehicle' : d.slot);
    const id = `item/${d.id}`;
    add({
      id,
      category: 'item',
      gameRefs: [d.id],
      label: d.name.en,
      subject: ITEM_SUBJECT[d.id] ?? d.name.en,
      tier: tierOf(d),
      paintable,
      mask: paintable ? `${id}.mask.png` : undefined,
      defaultPaint: paintable ? DEFAULT_PAINT[d.id] : undefined,
      dependsOn: [],
      batch: batchOfItem(d),
    });
    if (paintable) {
      add({ id: `${id}.mask`, category: 'paint_mask', gameRefs: [d.id], label: `${d.name.en} paint mask`, subject: PAINT_SURFACE[d.slot], dependsOn: [id], batch: batchOfItem(d) });
    }
  }
  add({ id: 'item/spray', category: 'item', gameRefs: sprays, label: 'Spray paint can', subject: ITEM_SUBJECT.spray, tier: 'basic', paintable: true, mask: 'item/spray.mask.png', defaultPaint: DEFAULT_PAINT.spray, dependsOn: [], batch: 'B4' });
  add({ id: 'item/spray.mask', category: 'paint_mask', gameRefs: sprays, label: 'Spray paint can paint mask', subject: PAINT_SURFACE.spray, dependsOn: ['item/spray'], batch: 'B4' });
  // Görsel dil denemeleri: yeni enstrüman aileleri yapı değişmeden eklenebiliyor mu
  add({ id: 'item/kanun_3', category: 'item', gameRefs: [], visualTestOnly: true, label: 'Kanun (visual test)', subject: ITEM_SUBJECT.kanun_3, tier: 'professional', dependsOn: [], batch: 'B0' });
  add({ id: 'item/trombone_2', category: 'item', gameRefs: [], visualTestOnly: true, label: 'Trombone (visual test)', subject: ITEM_SUBJECT.trombone_2, tier: 'stage', dependsOn: [], batch: 'B0' });

  AVATAR_SUBJECTS.forEach((s, i) => {
    const n = String(i + 1).padStart(2, '0');
    add({ id: `avatar/${n}`, category: 'avatar', gameRefs: [], label: `Avatar ${n}`, subject: s, dependsOn: [], batch: i < 2 ? 'B0' : 'B6' });
  });
  for (const a of ACHIEVEMENTS) {
    add({ id: `achievement/${a.id}`, category: 'achievement', gameRefs: [a.id], label: a.name.en, subject: `"${a.name.en}" — ${a.about.en}`, dependsOn: [], batch: 'B8' });
  }
  for (const t of Object.keys(LOCATION_TYPE_NAMES) as LocationType[]) {
    add({ id: `icon/place/${t}`, category: 'icon_place', gameRefs: [t], label: `${LOCATION_TYPE_NAMES[t].en} icon`, subject: `a simple icon for "${LOCATION_TYPE_NAMES[t].en}"`, dependsOn: [], batch: 'B9' });
  }
  for (const s of SKILL_CATEGORIES) {
    add({ id: `icon/skill/${s}`, category: 'icon_skill', gameRefs: [s], label: `${SKILL_CATEGORY_NAMES[s].en} skills icon`, subject: `a simple icon for the skill category "${SKILL_CATEGORY_NAMES[s].en}"`, dependsOn: [], batch: 'B9' });
  }
  for (const m of MOODLETS) {
    add({ id: `moodlet/${m.id}`, category: 'moodlet', gameRefs: [m.id], label: m.name.en, subject: `a simple icon for the mood "${m.name.en}" — ${m.about.en}`, dependsOn: [], batch: 'B9' });
  }
  for (const t of TATTOOS) {
    add({ id: `tattoo/${t.id}`, category: 'tattoo', gameRefs: [t.id], label: t.name.en, subject: `a tattoo design: ${t.name.en}`, dependsOn: [], batch: 'B10' });
  }
  for (const g of GENRES) {
    for (const n of [1, 2]) {
      add({ id: `cover/${g}.${n}`, category: 'cover', gameRefs: [g], label: `${GENRE_NAMES[g].en} cover ${n}`, subject: `an album cover artwork evoking ${GENRE_NAMES[g].en} music (variation ${n})`, dependsOn: [], batch: 'B10' });
    }
  }
  return out;
}

export const BATCHES: Record<string, string> = {
  B0: 'Proof of concept (style check)',
  B1: 'Cities',
  B2: 'Places and venues',
  B3: 'Instruments and paint masks',
  B4: 'Outfits, vehicles, spray paint and paint masks',
  B5: 'Art, rings, pets, stage effects, materials',
  B6: 'Avatar portraits',
  B7: 'Concert occupancy variants',
  B8: 'Achievement badges',
  B9: 'Place, skill and moodlet icons',
  B10: 'Tattoos and record covers',
};
