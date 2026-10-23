// Oyunun kendi grupları. Dünya gerçek oyuncu azken de canlı görünsün diye her şehirde üç yapay grup vardır:
// konser verirler, şarkı yazıp kaydederler, single ve albüm çıkarırlar, listelerde oyuncularla yarışırlar.
// Profillerinde "oyunun grubu" olarak işaretlenirler.

import type { Genre, Instrument } from './world';

export type NpcTier = 'rookie' | 'local' | 'star';

export interface NpcTierRule {
  /** Rol ve sahne becerileri */
  skill: number;
  /** Kendi şehrindeki başlangıç şöhreti */
  fame: number;
  /** Şöhret bu aralığın dışına çıkmaz (oyuncuların önünü kesmesinler, sönüp de gitmesinler) */
  fameRange: [number, number];
  /** Yazdıkları şarkıların kalite aralığı */
  songQuality: [number, number];
  /** Şarkıya aşinalık */
  familiarity: number;
  /** Kayıt yapımcılığı */
  production: number;
  /** İki konser arası (oyun saati) */
  gigEveryHours: number;
  /** Yeni şarkı yazma aralığı (oyun günü) */
  songEveryDays: number;
}

export const NPC_TIERS: Record<NpcTier, NpcTierRule> = {
  rookie: { skill: 22, fame: 8, fameRange: [4, 18], songQuality: [25, 45], familiarity: 55, production: 5, gigEveryHours: 30, songEveryDays: 6 },
  local: { skill: 42, fame: 28, fameRange: [18, 44], songQuality: [40, 62], familiarity: 70, production: 20, gigEveryHours: 36, songEveryDays: 5 },
  star: { skill: 64, fame: 55, fameRange: [45, 72], songQuality: [55, 78], familiarity: 85, production: 45, gigEveryHours: 48, songEveryDays: 5 },
};

/** Single'lar bekleme süresinin bu katında bir, albümler albüm bekleme süresinin bu katında bir çıkar */
export const NPC_RELEASE_PACE = 1.5;

export interface NpcBandDef {
  key: string;
  cityId: string;
  name: string;
  genre: Genre;
  tier: NpcTier;
  leader: string;
  role: Instrument;
  /** Şarkı adları (sırayla kullanılır, bitince numaralanır) */
  songs: string[];
}

const B = (cityId: string, tier: NpcTier, name: string, genre: Genre, leader: string, role: Instrument, songs: string[]): NpcBandDef => ({
  key: `${cityId}-${tier}`,
  cityId,
  tier,
  name,
  genre,
  leader,
  role,
  songs,
});

export const NPC_BANDS: NpcBandDef[] = [
  // Türkiye
  B('istanbul', 'star', 'Mavi Vapur', 'pop', 'Selin Ateş', 'vocals', ['Karaköy Işıkları', 'Son Vapur', 'Martılar', 'Boğazda Sabah', 'Eski Plak', 'Taksim Gecesi', 'Rüzgâr Gibi', 'Galata']),
  B('istanbul', 'local', 'Kadıköy Bodrumu', 'rock', 'Emre Kılıç', 'guitar', ['Moda Sahili', 'Bodrum Katı', 'Gürültü', 'Sokak Lambası', 'Paslı Tel', 'Çarşı', 'Uykusuz']),
  B('istanbul', 'rookie', 'Tünel Sesleri', 'anatolian', 'Deniz Arslan', 'keys', ['Kuyu', 'Tünel', 'Dumanlı', 'Kervan', 'Bozkır Rüyası', 'Saz Sesi']),
  B('ankara', 'star', 'Kızılay Ekspres', 'rock', 'Burak Demir', 'vocals', ['Atakule', 'Kızılay', 'Bozkırda Yağmur', 'Ankara Havası', 'Gece Treni', 'Duman', 'Kale']),
  B('ankara', 'local', 'Tunalı Kayıtları', 'metal', 'Cem Yalçın', 'drums', ['Demir Kapı', 'Karanlık Sokak', 'Çelik', 'Kül', 'Fırtına', 'Yıkım']),
  B('ankara', 'rookie', 'Bahçeli 7', 'pop', 'Ece Korkmaz', 'vocals', ['Bahçeli', 'Pazar Sabahı', 'Kahve', 'Otobüs', 'Kampüs', 'Yaz Okulu']),
  B('izmir', 'star', 'Kordon Boyu', 'jazz', 'Aylin Şahin', 'keys', ['Kordon', 'Gün Batımı', 'Alsancak', 'İmbat', 'Saat Kulesi', 'Liman Caz', 'Kemeraltı']),
  B('izmir', 'local', 'Körfez Dalgası', 'electronic', 'Mert Öztürk', 'keys', ['Körfez', 'Neon Kordon', 'Dalga', 'Gece Feribotu', 'Sinyal', 'Frekans']),
  B('izmir', 'rookie', 'Bornova Garajı', 'rock', 'Kaan Aydın', 'guitar', ['Garaj', 'Bornova', 'İlk Akor', 'Final Haftası', 'Yurt Odası', 'Otostop']),
  // Almanya
  B('berlin', 'star', 'Neon Spree', 'electronic', 'Lena Vogel', 'keys', ['Spree Lights', 'Tresor', 'Concrete Dawn', 'U8', 'Mauerpark', 'Static Love', 'Kreuzberg']),
  B('berlin', 'local', 'Kiez Kollektiv', 'hiphop', 'Jonas Becker', 'vocals', ['Kiez', 'Späti', 'Hinterhof', 'Graffiti', 'Ringbahn', 'Platte']),
  B('berlin', 'rookie', 'Die Leisen', 'pop', 'Mia Schröder', 'vocals', ['Leise', 'Sonntag', 'Balkon', 'Fahrrad', 'Kaffee', 'Winter']),
  B('hamburg', 'star', 'Reeperbahn Riot', 'rock', 'Felix Wagner', 'guitar', ['Reeperbahn', 'Harbour Lights', 'St. Pauli', 'Elbe', 'Fischmarkt', 'Storm Tide', 'Anchor']),
  B('hamburg', 'local', 'Nordwind', 'metal', 'Lukas Hoffmann', 'drums', ['Nordwind', 'Sturmflut', 'Eisen', 'Leuchtturm', 'Nebel', 'Kran']),
  B('hamburg', 'rookie', 'Elbstrand', 'jazz', 'Anna Fischer', 'keys', ['Elbstrand', 'Speicher', 'Blue Hour', 'Hafenbar', 'Regen', 'Möwe']),
  // Birleşik Krallık
  B('london', 'star', 'The Camden Lights', 'pop', 'Olivia Hayes', 'vocals', ['Camden Lock', 'Night Bus', 'Thames', 'Soho Rain', 'Underground', 'Big Smoke', 'Primrose']),
  B('london', 'local', 'Brixton Static', 'hiphop', 'Marcus Reid', 'vocals', ['Brixton', 'Grime Time', 'Estate', 'Pirate Radio', 'Last Train', 'Concrete']),
  B('london', 'rookie', 'Hackney Wick', 'rock', 'Tom Ellis', 'guitar', ['Wick', 'Canal Boat', 'Squat', 'Overground', 'Pint', 'Fog']),
  B('manchester', 'star', 'Northern Quarter', 'rock', 'Liam Walsh', 'vocals', ['Rain City', 'Northern Soul', 'Mill Town', 'Oxford Road', 'Canal Street', 'Factory', 'Grey Skies']),
  B('manchester', 'local', 'Salford Lads', 'rock', 'Ryan Cooper', 'bass', ['Salford', 'Lads', 'Terrace', 'Red Brick', 'Saturday', 'Chippy']),
  B('manchester', 'rookie', 'Ancoats', 'electronic', 'Chloe Harris', 'keys', ['Ancoats', 'Warehouse', 'Hacienda Dreams', 'Bass Line', 'Loop', 'Strobe']),
  // Fransa
  B('paris', 'star', 'Les Nuits Bleues', 'pop', 'Camille Laurent', 'vocals', ['Nuit Bleue', 'Montmartre', 'Seine', 'Café Noir', 'Métro', 'Rive Gauche', 'Pluie']),
  B('paris', 'local', 'Pigalle Swing', 'jazz', 'Hugo Moreau', 'keys', ['Pigalle', 'Swing Manouche', 'Cabaret', 'Minuit', 'Saxo', 'Bistro']),
  B('paris', 'rookie', 'Banlieue Est', 'hiphop', 'Yanis Bernard', 'vocals', ['Banlieue', 'RER', 'Béton', 'Quartier', 'Tour', 'Néon']),
  B('lyon', 'star', 'Fourvière', 'rock', 'Lucas Petit', 'guitar', ['Fourvière', 'Deux Fleuves', 'Traboule', 'Croix-Rousse', 'Rhône', 'Lumières', 'Soie']),
  B('lyon', 'local', 'Presqu’île', 'electronic', 'Léa Garnier', 'keys', ['Presqu’île', 'Nuits Sonores', 'Confluence', 'Pulse', 'Saône', 'Écho']),
  B('lyon', 'rookie', 'Les Bouchons', 'pop', 'Manon Roux', 'vocals', ['Bouchon', 'Vieux Lyon', 'Guignol', 'Vélo', 'Dimanche', 'Terrasse']),
  // ABD
  B('newyork', 'star', 'Brooklyn Bridges', 'hiphop', 'Jordan Brooks', 'vocals', ['Brooklyn', 'Empire', 'Subway Kings', 'Bodega', 'Uptown', 'Fire Escape', 'Concrete Jungle']),
  B('newyork', 'local', 'Bowery Ghosts', 'rock', 'Ethan Miller', 'guitar', ['Bowery', 'CBGB Nights', 'Lower East', 'Yellow Cab', 'Ghost Town', 'Neon Sign']),
  B('newyork', 'rookie', 'Harlem Blue', 'jazz', 'Grace Wilson', 'keys', ['Harlem', 'Blue Note', 'Lenox', 'After Hours', 'Sugar Hill', 'Midnight']),
  B('losangeles', 'star', 'Sunset Strip', 'pop', 'Ava Martinez', 'vocals', ['Sunset', 'Palm Trees', 'Mulholland', 'Golden Hour', 'Freeway', 'Hollywood Sign', 'Santa Ana']),
  B('losangeles', 'local', 'Venice Burnouts', 'rock', 'Noah Carter', 'drums', ['Venice', 'Boardwalk', 'Burnout', 'Skate Park', 'Smog', 'Pacific']),
  B('losangeles', 'rookie', 'Echo Park', 'electronic', 'Zoe Kim', 'keys', ['Echo Park', 'Synth Sunset', 'Lake', 'Silver Lake', 'Drive', 'Glow']),
  // Yeni şehirler
  B('munich', 'star', 'Isar Kings', 'rock', 'Maximilian Huber', 'guitar', ['Isar', 'Föhn', 'Englischer Garten', 'Alpenglühen', 'Oktober', 'Marienplatz', 'Bergwind']),
  B('munich', 'local', 'Schwabinger Jazzkeller', 'jazz', 'Sophie Bauer', 'keys', ['Schwabing', 'Keller Blues', 'Viktualien', 'Nachtcafé', 'Hofgarten', 'Föhnsturm']),
  B('munich', 'rookie', 'Giesing Garage', 'metal', 'Paul Keller', 'drums', ['Giesing', 'Garage', 'Stahl', 'Lärm', 'Tram 17', 'Beton']),
  B('liverpool', 'star', 'The Mersey Echoes', 'pop', 'Ella Murphy', 'vocals', ['Mersey', 'Ferry Song', 'Penny Lane Rain', 'Dockside', 'Liver Birds', 'Anfield Road', 'Grey Sea']),
  B('liverpool', 'local', 'Cavern Kids', 'rock', 'Jack Doyle', 'guitar', ['Cavern', 'Matthew Street', 'Scouse', 'Strawberry Lane', 'Docks', 'Overhead Railway']),
  B('liverpool', 'rookie', 'Baltic Triangle', 'electronic', 'Amelia Byrne', 'keys', ['Baltic', 'Triangle', 'Warehouse Lights', 'Tide', 'Signal', 'Pulse']),
  B('marseille', 'star', 'Vieux-Port Massilia', 'hiphop', 'Karim Benali', 'vocals', ['Vieux-Port', 'Le Panier', 'Mistral', 'Calanques', 'Bonne Mère', 'Quartiers Nord', 'Soleil']),
  B('marseille', 'local', 'Les Calanques', 'pop', 'Inès Roche', 'vocals', ['Calanque', 'Mer Bleue', 'Cassis', 'Été', 'Sel', 'Pastis']),
  B('marseille', 'rookie', 'Joliette Sound', 'electronic', 'Théo Martin', 'keys', ['Joliette', 'Docks', 'Néon Port', 'Ferry', 'Basse', 'Vague']),
  B('nashville', 'star', 'Broadway Honky Tonks', 'rock', 'Luke Bennett', 'vocals', ['Broadway', 'Honky Tonk', 'Cumberland', 'Whiskey Rain', 'Music Row', 'Tennessee Night', 'Steel Strings']),
  B('nashville', 'local', 'Music Row Revival', 'pop', 'Hannah Reed', 'vocals', ['Music Row', 'Revival', 'Front Porch', 'Neon Boots', 'Sunday', 'Rhinestone']),
  B('nashville', 'rookie', 'East Side Strays', 'jazz', 'Caleb Hughes', 'keys', ['East Side', 'Strays', 'Five Points', 'Late Set', 'Cumberland Blue', 'Night Shift']),
];

export const NPC_BAND_BY_KEY: Record<string, NpcBandDef> = Object.fromEntries(NPC_BANDS.map((b) => [b.key, b]));
