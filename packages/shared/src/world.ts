// Oyun dünyası: şehirler, mekânlar, beceriler, türler.
// Bu dosya hem sunucu hem mobil uygulama tarafından kullanılır.

export type Lang = 'tr' | 'en';
export type L = { tr: string; en: string };

/** İki dilli bir metinden istenen dili seçer. */
export const pick = (l: L, lang: Lang) => l[lang] ?? l.tr;

/** Grupta çalınabilen roller (enstrümanlar). */
export const INSTRUMENTS = ['vocals', 'guitar', 'bass', 'drums', 'keys'] as const;
export type Instrument = (typeof INSTRUMENTS)[number];

export const ROLE_NAMES: Record<Instrument, L> = {
  vocals: { tr: 'Vokal', en: 'Vocals' },
  guitar: { tr: 'Gitar', en: 'Guitar' },
  bass: { tr: 'Bas gitar', en: 'Bass' },
  drums: { tr: 'Davul', en: 'Drums' },
  keys: { tr: 'Klavye', en: 'Keyboards' },
};

export const GENRES = ['pop', 'rock', 'hiphop', 'electronic', 'metal', 'jazz', 'anatolian'] as const;
export type Genre = (typeof GENRES)[number];

export const GENRE_NAMES: Record<Genre, L> = {
  pop: { tr: 'Pop', en: 'Pop' },
  rock: { tr: 'Rock', en: 'Rock' },
  hiphop: { tr: 'Hip-hop', en: 'Hip-hop' },
  electronic: { tr: 'Elektronik', en: 'Electronic' },
  metal: { tr: 'Metal', en: 'Metal' },
  jazz: { tr: 'Caz', en: 'Jazz' },
  anatolian: { tr: 'Anadolu rock', en: 'Anatolian rock' },
};

export type ShopType = 'music_store' | 'boutique' | 'gallery' | 'bookstore' | 'car_dealer' | 'pet_shop' | 'hardware' | 'stage_shop';
/** Meslek ve siyasetin geçtiği yeni mekânlar */
export type CivicType =
  | 'city_hall'
  | 'police'
  | 'courthouse'
  | 'plaza'
  | 'newspaper'
  | 'worship'
  | 'university'
  | 'park'
  | 'recording_studio'
  | 'prison'
  | 'real_estate'
  | 'flea_market'
  | 'tattoo'
  | 'gym'
  | 'restaurant'
  | 'hotel'
  | 'bank';
export type LocationType = 'bar' | 'club' | 'hall' | 'stadium' | 'festival' | 'school' | 'studio' | 'work' | 'hospital' | ShopType | CivicType;

export const LOCATION_TYPE_NAMES: Record<LocationType, L> = {
  bar: { tr: 'Bar', en: 'Bar' },
  club: { tr: 'Kulüp', en: 'Club' },
  hall: { tr: 'Konser salonu', en: 'Concert hall' },
  stadium: { tr: 'Stadyum', en: 'Stadium' },
  festival: { tr: 'Festival alanı', en: 'Festival grounds' },
  school: { tr: 'Müzik okulu', en: 'Music school' },
  studio: { tr: 'Prova stüdyosu', en: 'Rehearsal studio' },
  work: { tr: 'İş yeri', en: 'Workplace' },
  hospital: { tr: 'Hastane', en: 'Hospital' },
  music_store: { tr: 'Müzik mağazası', en: 'Music store' },
  boutique: { tr: 'Sahne butiği', en: 'Stage boutique' },
  gallery: { tr: 'Sanat galerisi', en: 'Art gallery' },
  bookstore: { tr: 'Kitapçı', en: 'Bookstore' },
  city_hall: { tr: 'Belediye', en: 'City hall' },
  police: { tr: 'Emniyet müdürlüğü', en: 'Police headquarters' },
  courthouse: { tr: 'Adliye', en: 'Courthouse' },
  plaza: { tr: 'İş merkezi', en: 'Business tower' },
  newspaper: { tr: 'Gazete', en: 'Newspaper' },
  worship: { tr: 'İbadethane', en: 'Place of worship' },
  university: { tr: 'Üniversite', en: 'University' },
  park: { tr: 'Park', en: 'Park' },
  recording_studio: { tr: 'Kayıt stüdyosu', en: 'Recording studio' },
  prison: { tr: 'Cezaevi', en: 'Prison' },
  real_estate: { tr: 'Emlakçı', en: 'Estate agent' },
  car_dealer: { tr: 'Oto galeri', en: 'Car dealer' },
  pet_shop: { tr: 'Evcil hayvan dükkânı', en: 'Pet shop' },
  hardware: { tr: 'Hırdavat ve atölye', en: 'Hardware and workshop' },
  stage_shop: { tr: 'Sahne ekipmanı dükkânı', en: 'Stage equipment shop' },
  flea_market: { tr: 'İkinci el pazarı', en: 'Second-hand market' },
  tattoo: { tr: 'Dövme stüdyosu', en: 'Tattoo studio' },
  gym: { tr: 'Spor salonu', en: 'Gym' },
  restaurant: { tr: 'Restoran', en: 'Restaurant' },
  hotel: { tr: 'Otel', en: 'Hotel' },
  bank: { tr: 'Banka', en: 'Bank' },
};

const SHOP_TYPES: readonly string[] = ['music_store', 'boutique', 'gallery', 'bookstore', 'car_dealer', 'pet_shop', 'hardware', 'stage_shop'];
export const isShop = (t: LocationType): t is ShopType => SHOP_TYPES.includes(t);

/** Konser verilebilen mekân türleri ve kuralları. */
export const VENUE_RULES = {
  // bandShare: bilet gelirinden gruba kalan pay (kalanı mekân, prodüksiyon, organizatör).
  // Büyük sahnelerde masraf çok olduğundan pay küçülür; gelir yine de basamak basamak artar.
  bar: { capacity: 80, ticket: 10, minFame: 0, fameMult: 1.0, bandShare: 0.7 },
  club: { capacity: 350, ticket: 20, minFame: 15, fameMult: 1.6, bandShare: 0.45 },
  hall: { capacity: 2000, ticket: 40, minFame: 45, fameMult: 2.5, bandShare: 0.12 },
  stadium: { capacity: 20000, ticket: 40, minFame: 75, fameMult: 3.5, bandShare: 0.04 },
  /** Festival sahnesine sadece festival programıyla çıkılır (elle konser ayarlanamaz) */
  festival: { capacity: 12000, ticket: 8, minFame: 0, fameMult: 3.0, bandShare: 0.12 },
} as const;
export type VenueType = keyof typeof VENUE_RULES;
export const isVenue = (t: LocationType): t is VenueType => t in VENUE_RULES;

export interface Location {
  id: string;
  cityId: string;
  type: LocationType;
  name: L;
  /** Sadece iş yerleri için: saatlik ücret. */
  hourlyPay?: number;
  /** İş yerinde yapılan işin adı. */
  jobTitle?: L;
  /** Oyuncuların satın alıp işletebildiği mekân (ruhsat) */
  business?: BusinessType;
}

export type BusinessType = 'bar' | 'restaurant';

export interface City {
  id: string;
  name: L;
  country: L;
  countryCode: string;
  continent: 'europe' | 'america';
  lat: number;
  lng: number;
  /** Türlerin şehirdeki popülerliği (0.6 – 1.4). Konser seyircisini etkiler. */
  genrePopularity: Record<Genre, number>;
  /** Hayat pahalılığı: iş ücretlerini, okul/stüdyo fiyatlarını ve bilet gelirini çarpar.
   *  Oyunun kendi dükkânları (mağaza, butik, galeri, hastane) her yerde aynı fiyatı uygular. */
  costMult: number;
  locations: Location[];
}

interface CitySpec {
  /** Mekân adlarında kullanılan semt/bölge adı */
  district: string;
  bar: [string, string];
  club: [string, string];
  hall: [string, string];
  school: [string, string];
  studio: [string, string];
  jobs: { name: [string, string]; pay: number; title: [string, string] }[];
}

function makeLocations(cityId: string, s: CitySpec): Location[] {
  const L = (p: [string, string]): L => ({ tr: p[0], en: p[1] });
  const d = s.district;
  const locs: Location[] = [
    { id: `${cityId}-bar`, cityId, type: 'bar', name: L(s.bar) },
    { id: `${cityId}-club`, cityId, type: 'club', name: L(s.club) },
    { id: `${cityId}-hall`, cityId, type: 'hall', name: L(s.hall) },
    { id: `${cityId}-school`, cityId, type: 'school', name: L(s.school) },
    { id: `${cityId}-studio`, cityId, type: 'studio', name: L(s.studio) },
    { id: `${cityId}-music_store`, cityId, type: 'music_store', name: { tr: `${d} Müzik Mağazası`, en: `${d} Music Store` } },
    { id: `${cityId}-boutique`, cityId, type: 'boutique', name: { tr: `${d} Sahne Butiği`, en: `${d} Stage Boutique` } },
    { id: `${cityId}-gallery`, cityId, type: 'gallery', name: { tr: `${d} Sanat Galerisi`, en: `${d} Art Gallery` } },
    { id: `${cityId}-bookstore`, cityId, type: 'bookstore', name: { tr: `${d} Kitapçısı`, en: `${d} Bookshop` } },
    { id: `${cityId}-hospital`, cityId, type: 'hospital', name: { tr: `${d} Devlet Hastanesi`, en: `${d} General Hospital` } },
  ];
  s.jobs.forEach((j, i) => {
    locs.push({
      id: `${cityId}-work${i === 0 ? '' : i + 1}`,
      cityId,
      type: 'work',
      name: L(j.name),
      hourlyPay: j.pay,
      jobTitle: L(j.title),
    });
  });
  return locs;
}

type GP = Record<Genre, number>;
const gp = (pop: number, rock: number, hiphop: number, electronic: number, metal: number, jazz: number, anatolian: number): GP => ({
  pop, rock, hiphop, electronic, metal, jazz, anatolian,
});

const TR = { country: { tr: 'Türkiye', en: 'Türkiye' }, countryCode: 'TR', continent: 'europe' as const };
const DE = { country: { tr: 'Almanya', en: 'Germany' }, countryCode: 'DE', continent: 'europe' as const };
const GB = { country: { tr: 'Birleşik Krallık', en: 'United Kingdom' }, countryCode: 'GB', continent: 'europe' as const };
const FR = { country: { tr: 'Fransa', en: 'France' }, countryCode: 'FR', continent: 'europe' as const };
const US = { country: { tr: 'ABD', en: 'USA' }, countryCode: 'US', continent: 'america' as const };

export const CITIES: City[] = [
  // ---------- Türkiye ----------
  {
    id: 'istanbul', name: { tr: 'İstanbul', en: 'Istanbul' }, ...TR, lat: 41.01, lng: 28.98, costMult: 1.0,
    genrePopularity: gp(1.3, 1.1, 1.2, 1.0, 0.8, 0.8, 1.3),
    locations: makeLocations('istanbul', {
      district: 'Kadıköy',
      bar: ['Kadıköy Bodrum Bar', 'Kadikoy Basement Bar'],
      club: ['Beyoğlu Sahne Kulübü', 'Beyoglu Stage Club'],
      hall: ['Haliç Konser Salonu', 'Golden Horn Concert Hall'],
      school: ['Moda Müzik Akademisi', 'Moda Music Academy'],
      studio: ['Tünel Prova Stüdyosu', 'Tunel Rehearsal Studio'],
      jobs: [
        { name: ['Karaköy Kafe', 'Karakoy Cafe'], pay: 15, title: ['Garson', 'Waiter'] },
        { name: ['Galata Plakçısı', 'Galata Record Store'], pay: 18, title: ['Satış görevlisi', 'Shop assistant'] },
      ],
    }),
  },
  {
    id: 'ankara', name: { tr: 'Ankara', en: 'Ankara' }, ...TR, lat: 39.93, lng: 32.86, costMult: 0.9,
    genrePopularity: gp(1.1, 1.3, 1.0, 0.8, 1.2, 0.9, 1.2),
    locations: makeLocations('ankara', {
      district: 'Kızılay',
      bar: ['Tunalı Rock Bar', 'Tunali Rock Bar'],
      club: ['Kızılay Kulüp', 'Kizilay Club'],
      hall: ['Başkent Arena', 'Capital Arena'],
      school: ['Çankaya Konservatuvar Kursu', 'Cankaya Conservatory Courses'],
      studio: ['Bahçeli Prova Odası', 'Bahceli Practice Room'],
      jobs: [{ name: ['Kızılay Döner Salonu', 'Kizilay Doner Shop'], pay: 14, title: ['Tezgâhtar', 'Counter staff'] }],
    }),
  },
  {
    id: 'izmir', name: { tr: 'İzmir', en: 'Izmir' }, ...TR, lat: 38.42, lng: 27.14, costMult: 0.95,
    genrePopularity: gp(1.0, 1.2, 0.9, 1.2, 0.9, 1.3, 1.1),
    locations: makeLocations('izmir', {
      district: 'Alsancak',
      bar: ['Alsancak Kordon Bar', 'Alsancak Kordon Bar'],
      club: ['Ege Sahnesi', 'Aegean Stage'],
      hall: ['Kültürpark Açıkhava', 'Kulturpark Open Air'],
      school: ['Bornova Müzik Evi', 'Bornova Music House'],
      studio: ['Karşıyaka Stüdyo', 'Karsiyaka Studio'],
      jobs: [{ name: ['Kordon Balıkçısı', 'Kordon Fish Restaurant'], pay: 15, title: ['Komi', 'Busser'] }],
    }),
  },
  // ---------- Almanya ----------
  {
    id: 'berlin', name: { tr: 'Berlin', en: 'Berlin' }, ...DE, lat: 52.52, lng: 13.4, costMult: 1.4,
    genrePopularity: gp(0.9, 1.1, 1.1, 1.4, 1.2, 1.0, 0.9),
    locations: makeLocations('berlin', {
      district: 'Kreuzberg',
      bar: ['Kreuzberg Keller', 'Kreuzberg Cellar'],
      club: ['Spree Halle', 'Spree Hall Club'],
      hall: ['Ostbahnhof Arena', 'Ostbahnhof Arena'],
      school: ['Musikschule Mitte', 'Mitte Music School'],
      studio: ['Neukölln Proberaum', 'Neukolln Rehearsal Room'],
      jobs: [{ name: ['Späti am Kanal', 'Canal Corner Shop'], pay: 20, title: ['Kasiyer', 'Cashier'] }],
    }),
  },
  {
    id: 'hamburg', name: { tr: 'Hamburg', en: 'Hamburg' }, ...DE, lat: 53.55, lng: 9.99, costMult: 1.35,
    genrePopularity: gp(1.0, 1.3, 1.0, 1.1, 1.3, 1.0, 0.8),
    locations: makeLocations('hamburg', {
      district: 'St. Pauli',
      bar: ['Reeperbahn Kneipe', 'Reeperbahn Pub'],
      club: ['Hafenklub', 'Harbour Club'],
      hall: ['Elbe Konzerthalle', 'Elbe Concert Hall'],
      school: ['Altona Musikschule', 'Altona Music School'],
      studio: ['Schanze Proberaum', 'Schanze Rehearsal Room'],
      jobs: [{ name: ['Fischmarkt Imbiss', 'Fish Market Snack Bar'], pay: 19, title: ['Aşçı yardımcısı', 'Kitchen helper'] }],
    }),
  },
  {
    id: 'munich', name: { tr: 'Münih', en: 'Munich' }, ...DE, lat: 48.14, lng: 11.58, costMult: 1.45,
    genrePopularity: gp(1.1, 1.2, 0.9, 1.2, 1.1, 1.1, 0.8),
    locations: makeLocations('munich', {
      district: 'Schwabing',
      bar: ['Schwabinger Keller', 'Schwabing Cellar'],
      club: ['Isar Klub', 'Isar Club'],
      hall: ['Olympia Konzerthalle', 'Olympia Concert Hall'],
      school: ['Musikschule Maxvorstadt', 'Maxvorstadt Music School'],
      studio: ['Giesing Proberaum', 'Giesing Rehearsal Room'],
      jobs: [{ name: ['Biergarten am See', 'Lakeside Beer Garden'], pay: 21, title: ['Garson', 'Waiter'] }],
    }),
  },
  // ---------- Birleşik Krallık ----------
  {
    id: 'london', name: { tr: 'Londra', en: 'London' }, ...GB, lat: 51.51, lng: -0.13, costMult: 1.7,
    genrePopularity: gp(1.2, 1.3, 1.2, 1.1, 1.0, 1.0, 0.6),
    locations: makeLocations('london', {
      district: 'Camden',
      bar: ['Camden Back Room', 'Camden Back Room'],
      club: ['Soho Underground', 'Soho Underground'],
      hall: ['Thames Concert Hall', 'Thames Concert Hall'],
      school: ['Southbank Music Institute', 'Southbank Music Institute'],
      studio: ['Hackney Rehearsal Rooms', 'Hackney Rehearsal Rooms'],
      jobs: [{ name: ['Brick Lane Coffee', 'Brick Lane Coffee'], pay: 24, title: ['Barista', 'Barista'] }],
    }),
  },
  {
    id: 'manchester', name: { tr: 'Manchester', en: 'Manchester' }, ...GB, lat: 53.48, lng: -2.24, costMult: 1.4,
    genrePopularity: gp(1.0, 1.4, 1.0, 1.2, 1.0, 0.8, 0.6),
    locations: makeLocations('manchester', {
      district: 'Northern Quarter',
      bar: ['Oldham Street Tavern', 'Oldham Street Tavern'],
      club: ['Mill Warehouse Club', 'Mill Warehouse Club'],
      hall: ['Canal Street Arena', 'Canal Street Arena'],
      school: ['Salford Music College', 'Salford Music College'],
      studio: ['Ancoats Practice Rooms', 'Ancoats Practice Rooms'],
      jobs: [{ name: ['Piccadilly Chippy', 'Piccadilly Chippy'], pay: 21, title: ['Tezgâhtar', 'Counter staff'] }],
    }),
  },
  {
    id: 'liverpool', name: { tr: 'Liverpool', en: 'Liverpool' }, ...GB, lat: 53.41, lng: -2.98, costMult: 1.25,
    genrePopularity: gp(1.2, 1.4, 0.9, 1.0, 0.9, 0.9, 0.6),
    locations: makeLocations('liverpool', {
      district: 'Mathew Street',
      bar: ['Cavern Side Bar', 'Cavern Side Bar'],
      club: ['Docklands Club', 'Docklands Club'],
      hall: ['Mersey Concert Hall', 'Mersey Concert Hall'],
      school: ['Mersey Music School', 'Mersey Music School'],
      studio: ['Baltic Triangle Rooms', 'Baltic Triangle Rooms'],
      jobs: [{ name: ['Albert Dock Café', 'Albert Dock Cafe'], pay: 19, title: ['Barista', 'Barista'] }],
    }),
  },
  // ---------- Fransa ----------
  {
    id: 'paris', name: { tr: 'Paris', en: 'Paris' }, ...FR, lat: 48.86, lng: 2.35, costMult: 1.6,
    genrePopularity: gp(1.2, 0.9, 1.3, 1.2, 0.8, 1.2, 0.7),
    locations: makeLocations('paris', {
      district: 'Montmartre',
      bar: ['Cave de Pigalle', 'Pigalle Cellar'],
      club: ['Club Bastille', 'Club Bastille'],
      hall: ['Salle de la Seine', 'Seine Concert Hall'],
      school: ['Conservatoire du Marais', 'Marais Conservatory'],
      studio: ['Studio Belleville', 'Belleville Studio'],
      jobs: [{ name: ['Café du Canal', 'Canal Cafe'], pay: 22, title: ['Garson', 'Waiter'] }],
    }),
  },
  {
    id: 'lyon', name: { tr: 'Lyon', en: 'Lyon' }, ...FR, lat: 45.76, lng: 4.84, costMult: 1.3,
    genrePopularity: gp(1.1, 1.1, 1.1, 1.3, 0.9, 1.1, 0.7),
    locations: makeLocations('lyon', {
      district: 'Croix-Rousse',
      bar: ['Bar des Pentes', 'Slopes Bar'],
      club: ['Péniche Club', 'Riverboat Club'],
      hall: ['Halle Confluence', 'Confluence Hall'],
      school: ['École de Musique Saône', 'Saone Music School'],
      studio: ['Studio Guillotière', 'Guillotiere Studio'],
      jobs: [{ name: ['Bouchon Lyonnais', 'Lyon Bistro'], pay: 19, title: ['Komi', 'Busser'] }],
    }),
  },
  {
    id: 'marseille', name: { tr: 'Marsilya', en: 'Marseille' }, ...FR, lat: 43.3, lng: 5.37, costMult: 1.2,
    genrePopularity: gp(1.1, 0.9, 1.4, 1.1, 0.8, 1.0, 0.8),
    locations: makeLocations('marseille', {
      district: 'Vieux-Port',
      bar: ['Bar du Vieux-Port', 'Old Port Bar'],
      club: ['Club Le Panier', 'Le Panier Club'],
      hall: ['Dôme de Marseille', 'Marseille Dome'],
      school: ['Conservatoire du Prado', 'Prado Conservatory'],
      studio: ['Studio La Joliette', 'La Joliette Studio'],
      jobs: [{ name: ['Bouillabaisse du Port', 'Harbour Fish Stew'], pay: 18, title: ['Komi', 'Busser'] }],
    }),
  },
  // ---------- ABD ----------
  {
    id: 'newyork', name: { tr: 'New York', en: 'New York' }, ...US, lat: 40.71, lng: -74.0, costMult: 1.8,
    genrePopularity: gp(1.3, 1.0, 1.4, 1.1, 0.8, 1.3, 0.6),
    locations: makeLocations('newyork', {
      district: 'Brooklyn',
      bar: ['Bowery Basement', 'Bowery Basement'],
      club: ['Brooklyn Warehouse', 'Brooklyn Warehouse'],
      hall: ['Hudson Music Hall', 'Hudson Music Hall'],
      school: ['Harlem School of Music', 'Harlem School of Music'],
      studio: ['Queens Jam Space', 'Queens Jam Space'],
      jobs: [{ name: ['Midtown Diner', 'Midtown Diner'], pay: 26, title: ['Garson', 'Server'] }],
    }),
  },
  {
    id: 'losangeles', name: { tr: 'Los Angeles', en: 'Los Angeles' }, ...US, lat: 34.05, lng: -118.24, costMult: 1.7,
    genrePopularity: gp(1.4, 1.1, 1.3, 1.2, 1.0, 0.9, 0.6),
    locations: makeLocations('losangeles', {
      district: 'Sunset',
      bar: ['Echo Park Lounge', 'Echo Park Lounge'],
      club: ['Sunset Strip Club', 'Sunset Strip Club'],
      hall: ['Pacific Amphitheater', 'Pacific Amphitheater'],
      school: ['Hollywood Music Academy', 'Hollywood Music Academy'],
      studio: ['Silver Lake Rehearsal', 'Silver Lake Rehearsal'],
      jobs: [{ name: ['Venice Taco Stand', 'Venice Taco Stand'], pay: 25, title: ['Tezgâhtar', 'Counter staff'] }],
    }),
  },
];

CITIES.push({
  id: 'nashville', name: { tr: 'Nashville', en: 'Nashville' }, ...US, lat: 36.16, lng: -86.78, costMult: 1.45,
  genrePopularity: gp(1.3, 1.4, 0.9, 0.8, 0.9, 1.1, 0.6),
  locations: makeLocations('nashville', {
    district: 'Broadway',
    bar: ['Honky Tonk Corner', 'Honky Tonk Corner'],
    club: ['Music Row Club', 'Music Row Club'],
    hall: ['Ryman Street Auditorium', 'Ryman Street Auditorium'],
    school: ['Belmont Music Workshop', 'Belmont Music Workshop'],
    studio: ['East Nashville Rehearsal', 'East Nashville Rehearsal'],
    jobs: [{ name: ['Hot Chicken Shack', 'Hot Chicken Shack'], pay: 22, title: ['Tezgâhtar', 'Counter staff'] }],
  }),
});

/** Her ülkenin festivalinin yapıldığı şehir ve festivalin adı */
export const FESTIVAL_CITIES: Record<string, { cityId: string; name: L }> = {
  TR: { cityId: 'istanbul', name: { tr: 'Boğaziçi Müzik Festivali', en: 'Bosphorus Music Festival' } },
  DE: { cityId: 'berlin', name: { tr: 'Spree Open Air', en: 'Spree Open Air' } },
  GB: { cityId: 'manchester', name: { tr: 'Northern Sounds Festival', en: 'Northern Sounds Festival' } },
  FR: { cityId: 'paris', name: { tr: 'Festival de la Seine', en: 'Festival de la Seine' } },
  US: { cityId: 'nashville', name: { tr: 'Broadway Music Fest', en: 'Broadway Music Fest' } },
};

// Her şehre meslek ve siyaset mekânlarını ekle (adlar şehir ve semt adından üretilir)
for (const city of CITIES) {
  const store = city.locations.find((l) => l.type === 'music_store')!;
  const d = { tr: store.name.tr.replace(' Müzik Mağazası', ''), en: store.name.en.replace(' Music Store', '') };
  const n = city.name;
  const add = (type: CivicType, tr: string, en: string) =>
    city.locations.push({ id: `${city.id}-${type}`, cityId: city.id, type, name: { tr, en } });
  add('city_hall', `${n.tr} Belediyesi`, `${n.en} City Hall`);
  add('police', `${n.tr} Emniyet Müdürlüğü`, `${n.en} Police HQ`);
  add('courthouse', `${n.tr} Adliyesi`, `${n.en} Courthouse`);
  add('plaza', `${d.tr} İş Merkezi`, `${d.en} Business Tower`);
  add('newspaper', `${n.tr} Gazetesi`, `The ${n.en} Gazette`);
  add('worship', `${d.tr} İbadethanesi`, `${d.en} Place of Worship`);
  add('university', `${n.tr} Üniversitesi`, `University of ${n.en}`);
  add('park', `${d.tr} Parkı`, `${d.en} Park`);
  add('recording_studio', `${d.tr} Kayıt Stüdyosu`, `${d.en} Recording Studio`);
  add('prison', `${n.tr} Cezaevi`, `${n.en} Prison`);
  add('real_estate', `${d.tr} Emlak`, `${d.en} Estate Agents`);
  // Yaşam ve alışveriş
  const push = (id: string, type: LocationType, tr: string, en: string, extra: Partial<Location> = {}) =>
    city.locations.push({ id: `${city.id}-${id}`, cityId: city.id, type, name: { tr, en }, ...extra });
  push('stadium', 'stadium', `${n.tr} Stadyumu`, `${n.en} Stadium`);
  push('car_dealer', 'car_dealer', `${n.tr} Oto Galeri`, `${n.en} Car Dealer`);
  push('pet_shop', 'pet_shop', `${d.tr} Pet Shop`, `${d.en} Pet Shop`);
  push('hardware', 'hardware', `${d.tr} Hırdavat ve Atölye`, `${d.en} Hardware & Workshop`);
  push('stage_shop', 'stage_shop', `${d.tr} Sahne Ekipmanları`, `${d.en} Stage Equipment`);
  push('flea_market', 'flea_market', `${d.tr} Bit Pazarı`, `${d.en} Flea Market`);
  push('tattoo', 'tattoo', `${d.tr} Dövme Stüdyosu`, `${d.en} Tattoo Studio`);
  push('gym', 'gym', `${d.tr} Spor Salonu`, `${d.en} Gym`);
  push('restaurant', 'restaurant', `${d.tr} Lokantası`, `${d.en} Diner`);
  push('hotel', 'hotel', `Grand Otel ${n.tr}`, `Grand Hotel ${n.en}`);
  push('bank', 'bank', `${n.tr} Bankası`, `Bank of ${n.en}`);
  // Oyuncuların satın alabileceği işletme ruhsatları
  push('biz1', 'bar', `${d.tr} Köşe Bar`, `${d.en} Corner Bar`, { business: 'bar' });
  push('biz2', 'bar', `${d.tr} Gece Barı`, `${d.en} Night Bar`, { business: 'bar' });
  push('biz3', 'restaurant', `${d.tr} Bistro`, `${d.en} Bistro`, { business: 'restaurant' });
  push('biz4', 'restaurant', `${d.tr} Meyhanesi`, `${d.en} Tavern`, { business: 'restaurant' });
  const fest = FESTIVAL_CITIES[city.countryCode];
  if (fest?.cityId === city.id) push('festival', 'festival', fest.name.tr, fest.name.en);
}

export const CITY_BY_ID: Record<string, City> = Object.fromEntries(CITIES.map((c) => [c.id, c]));
export const LOCATION_BY_ID: Record<string, Location> = Object.fromEntries(
  CITIES.flatMap((c) => c.locations).map((l) => [l.id, l]),
);
