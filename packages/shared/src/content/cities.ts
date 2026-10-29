// İçerik: şehir kimliği. Her şehirde aynı mekân türleri vardır (tasarım belgesi); şehirleri ayıran bu veridir:
// imza tür, haftalık şehir etkinliği, yerel lezzet (restoranda), yalnızca o şehrin dükkânında satılan nadir eşya,
// şehre özgü başarım ve bir yerel efsane cümlesi. Sunucu ve uygulama aynı veriyi kullanır.

import type { ItemDef } from '../items';
import type { Genre, L } from '../world';
import { indexBy } from '../lookup';

export interface CityIdentity {
  cityId: string;
  /** Şehrin imza türü: şehir başarımı bu türde verilen iyi bir konserle açılır */
  signatureGenre: Genre;
  /** Haftalık etkinlik: oyun haftasının bu gününde (0–6) bu türlerdeki konserlere daha çok seyirci gelir */
  event: { name: L; weekday: number; genres: Genre[] };
  /** Yerel lezzet: yalnızca bu şehrin restoranlarında */
  dish: { id: string; name: L; price: number; mood: number; health: number };
  /** Yalnızca bu şehrin dükkânında satılan nadir eşya (fiyat/bonus merdiveninin ara basamağında, tür uyumlu) */
  rareItem: ItemDef;
  /** Şehir başarımının adı */
  achievement: L;
  /** Yerel efsane: şehir sayfasında */
  legend: L;
}

const l = (tr: string, en: string): L => ({ tr, en });
const rare = (id: string, shop: ItemDef['shop'], slot: ItemDef['slot'], tier: ItemDef['tier'], price: number, bonus: number, name: L, cityOnly: string, genres: Genre[], genreBonus: number): ItemDef => ({
  id, shop, slot, tier, price, bonus, name, cityOnly, genres, genreBonus,
});

/** Etkinlik gününde uyan türdeki konserin seyirci çarpanı */
export const CITY_EVENT_ATTENDANCE = 1.1;

export const CITY_IDENTITY: CityIdentity[] = [
  {
    cityId: 'istanbul', signatureGenre: 'anatolian',
    event: { name: l('Boğaz Psikedelik Gecesi', 'Bosphorus Psych Night'), weekday: 4, genres: ['anatolian', 'rock'] },
    dish: { id: 'local_istanbul', name: l('Balık ekmek', 'Fish sandwich by the pier'), price: 12, mood: 10, health: 3 },
    rareItem: rare('guitar_istanbul', 'music_store', 'guitar', 2, 2100, 9, l('Elektro bağlama', 'Electric saz'), 'istanbul', ['anatolian', 'folk'], 2),
    achievement: l('Boğazın sesi', 'Voice of the Bosphorus'),
    legend: l('Kadıköy\'de bir bodrum katında, elektrik kesildiğinde bile bağlamasını çalmayı sürdüren bir grup varmış; şehir hâlâ o geceyi anlatır.', 'In a Kadıköy basement there was once a band that kept playing the saz even when the power went out; the city still talks about that night.'),
  },
  {
    cityId: 'ankara', signatureGenre: 'rock',
    event: { name: l('Tunalı Rock Cuması', 'Tunalı Rock Friday'), weekday: 5, genres: ['rock', 'metal'] },
    dish: { id: 'local_ankara', name: l('Ankara tava', 'Ankara tava'), price: 16, mood: 10, health: 4 },
    rareItem: rare('outfit_ankara', 'boutique', 'outfit', 2, 1000, 6, l('Bozkır parkası', 'Steppe parka'), 'ankara', ['rock', 'metal'], 1),
    achievement: l('Başkentin gürültüsü', 'Noise of the capital'),
    legend: l('Kızılay\'ın altındaki bir prova odasında yazılan bir şarkı, bir zamanlar bütün yurtlarda çalınırmış.', 'A song written in a practice room under Kızılay was once played in every student dorm.'),
  },
  {
    cityId: 'izmir', signatureGenre: 'jazz',
    event: { name: l('Kordon Caz Akşamı', 'Kordon Jazz Evening'), weekday: 6, genres: ['jazz', 'soul', 'blues'] },
    dish: { id: 'local_izmir', name: l('Boyoz ve yumurta', 'Boyoz and egg'), price: 10, mood: 9, health: 3 },
    rareItem: rare('sax_izmir', 'music_store', 'sax', 2, 2100, 9, l('Alsancak tenor saksofonu', 'Alsancak tenor sax'), 'izmir', ['jazz', 'soul'], 2),
    achievement: l('Kordonun cazcısı', 'Jazz on the Kordon'),
    legend: l('Kordon\'da imbat estiğinde bir saksofon sesi duyulursa, eski cazcılar "Melek Hanım yine şarkı söylüyor" der.', 'When the sea breeze blows on the Kordon and a sax is heard, old jazz hands say "Melek is singing again".'),
  },
  {
    cityId: 'berlin', signatureGenre: 'electronic',
    event: { name: l('Kreuzberg Pazarı', 'Kreuzberg Sunday Session'), weekday: 0, genres: ['electronic'] },
    dish: { id: 'local_berlin', name: l('Currywurst', 'Currywurst'), price: 14, mood: 9, health: 2 },
    rareItem: rare('keys_berlin', 'music_store', 'keys', 2, 2200, 9, l('Doğu Berlin analog synth', 'East Berlin analogue synth'), 'berlin', ['electronic'], 2),
    achievement: l('Kapıdan geçtin', 'Past the door'),
    legend: l('Kapıdaki fedainin yalnızca bir kez gülümsediği söylenir: Spree kenarında güneş doğarken çalan bir set için.', 'They say the bouncer smiled only once: for a set played as the sun rose over the Spree.'),
  },
  {
    cityId: 'hamburg', signatureGenre: 'punk',
    event: { name: l('Reeperbahn Kiez Gecesi', 'Reeperbahn Kiez Night'), weekday: 6, genres: ['punk', 'rock'] },
    dish: { id: 'local_hamburg', name: l('Fischbrötchen', 'Fischbrötchen'), price: 13, mood: 9, health: 3 },
    rareItem: rare('drums_hamburg', 'music_store', 'drums', 2, 2100, 9, l('Kiez davul seti', 'Kiez drum kit'), 'hamburg', ['punk', 'rock'], 2),
    achievement: l('Reeperbahn çırağı', 'Reeperbahn apprentice'),
    legend: l('Liman barlarında gecede sekiz saat çalan genç gruplar varmış; Hamburg onlara sahneyi, onlar dünyaya şarkıyı öğretmiş.', 'Young bands once played eight hours a night in the harbour bars; Hamburg taught them the stage, they taught the world the songs.'),
  },
  {
    cityId: 'munich', signatureGenre: 'classical',
    event: { name: l('Residenz Oda Konseri', 'Residenz Chamber Concert'), weekday: 0, genres: ['classical', 'jazz'] },
    dish: { id: 'local_munich', name: l('Weißwurst ve pretzel', 'Weißwurst and pretzel'), price: 16, mood: 10, health: 3 },
    rareItem: rare('violin_munich', 'music_store', 'violin', 2, 2200, 9, l('Mittenwald kemanı', 'Mittenwald violin'), 'munich', ['classical', 'folk'], 2),
    achievement: l('Residenz alkışı', 'Applause at the Residenz'),
    legend: l('Hofgarten\'da bir yaz akşamı bir kemancı yağmura rağmen çalmayı sürdürmüş; seyirci şemsiyelerini kapatıp dinlemiş.', 'One summer evening in the Hofgarten a violinist kept playing through the rain; the audience closed their umbrellas to listen.'),
  },
  {
    cityId: 'london', signatureGenre: 'punk',
    event: { name: l('Camden Punk Cumartesisi', 'Camden Punk Saturday'), weekday: 6, genres: ['punk', 'rock', 'reggae'] },
    dish: { id: 'local_london', name: l('Fish and chips', 'Fish and chips'), price: 18, mood: 10, health: 3 },
    rareItem: rare('outfit_london', 'boutique', 'outfit', 2, 1000, 6, l('Kings Road deri ceketi', 'Kings Road leather jacket'), 'london', ['punk', 'rock'], 2),
    achievement: l('Camden sahnesinin asisi', 'Camden rebel'),
    legend: l('Camden\'da bir pub\'ın tavanında hâlâ bir gitarın imzası var; kimin olduğunu herkes biliyor, kimse söylemiyor.', 'There\'s still a guitar signature on the ceiling of a Camden pub; everyone knows whose it is, nobody says.'),
  },
  {
    cityId: 'manchester', signatureGenre: 'rock',
    event: { name: l('Northern Quarter Cuması', 'Northern Quarter Friday'), weekday: 5, genres: ['rock', 'electronic', 'punk'] },
    dish: { id: 'local_manchester', name: l('Lancashire hotpot', 'Lancashire hotpot'), price: 15, mood: 10, health: 4 },
    rareItem: rare('guitar_manchester', 'music_store', 'guitar', 2, 2000, 9, l('Mill Town yarı akustik gitarı', 'Mill Town semi-acoustic'), 'manchester', ['rock', 'punk'], 2),
    achievement: l('Kuzeyin sesi', 'Sound of the North'),
    legend: l('Eski bir dokuma fabrikası bir gece kulübe dönmüş; bir kuşak orada büyümüş, şehir hâlâ o ritimle yürür.', 'An old textile mill became a club one night; a generation grew up there and the city still walks to that beat.'),
  },
  {
    cityId: 'liverpool', signatureGenre: 'pop',
    event: { name: l('Mathew Street Merseybeat', 'Mathew Street Merseybeat'), weekday: 3, genres: ['pop', 'rock'] },
    dish: { id: 'local_liverpool', name: l('Scouse yahnisi', 'Scouse stew'), price: 13, mood: 10, health: 4 },
    rareItem: rare('bass_liverpool', 'music_store', 'bass', 2, 2000, 9, l('Keman gövdeli Mersey bası', 'Mersey violin bass'), 'liverpool', ['pop', 'rock'], 2),
    achievement: l('Mersey ritmi', 'Mersey beat'),
    legend: l('Bir mahzende öğle konseri veren dört çocuk varmış; Liverpool her öğle o mahzenin kapısına bir bakar.', 'Four lads once played lunchtime shows in a cellar; every noon Liverpool still glances at that cellar door.'),
  },
  {
    cityId: 'paris', signatureGenre: 'jazz',
    event: { name: l('Montmartre Manuş Gecesi', 'Montmartre Gypsy Jazz Night'), weekday: 2, genres: ['jazz', 'folk', 'pop'] },
    dish: { id: 'local_paris', name: l('Soğan çorbası', 'French onion soup'), price: 17, mood: 10, health: 3 },
    rareItem: rare('guitar_paris', 'music_store', 'guitar', 2, 2100, 9, l('Manuş caz gitarı', 'Gypsy jazz guitar'), 'paris', ['jazz', 'folk'], 2),
    achievement: l('Montmartre gecesi', 'A night in Montmartre'),
    legend: l('İki parmağıyla çalan bir gitarist Montmartre basamaklarında doğaçlama yaparmış; kafeler o saatte bardak sesini bile kısarmış.', 'A guitarist who played with two fingers used to improvise on the Montmartre steps; the cafés even hushed their glasses at that hour.'),
  },
  {
    cityId: 'lyon', signatureGenre: 'electronic',
    event: { name: l('Saône Gece Sesleri', 'Saône Night Sounds'), weekday: 5, genres: ['electronic', 'hiphop'] },
    dish: { id: 'local_lyon', name: l('Lyon usulü quenelle', 'Lyon-style quenelle'), price: 18, mood: 11, health: 3 },
    rareItem: rare('outfit_lyon', 'boutique', 'outfit', 2, 1050, 6, l('Lyon ipeği sahne gömleği', 'Lyon silk stage shirt'), 'lyon', ['electronic', 'pop'], 1),
    achievement: l('İki nehrin kulüp gecesi', 'Club night of two rivers'),
    legend: l('Eski bir ipek fabrikasının makineleri bir gece ritim tutmaya başlamış; o geceden beri Lyon\'un kulüpleri traboule\'larda saklanır.', 'One night the looms of an old silk mill started keeping time; since then Lyon\'s clubs hide in the traboules.'),
  },
  {
    cityId: 'marseille', signatureGenre: 'hiphop',
    event: { name: l('Eski Liman Rap Akşamı', 'Old Port Rap Evening'), weekday: 4, genres: ['hiphop', 'reggae'] },
    dish: { id: 'local_marseille', name: l('Bouillabaisse', 'Bouillabaisse'), price: 20, mood: 11, health: 4 },
    rareItem: rare('vocals_marseille', 'music_store', 'vocals', 2, 2000, 9, l('Liman mikrofonu', 'Harbour mic'), 'marseille', ['hiphop', 'reggae'], 2),
    achievement: l('Limanın MC\'si', 'MC of the harbour'),
    legend: l('Mistral estiğinde Le Panier\'nin damlarında freestyle yapılırmış; rüzgâr kelimeleri bütün limana taşırmış.', 'When the mistral blew, people freestyled on the rooftops of Le Panier and the wind carried the words across the harbour.'),
  },
  {
    cityId: 'newyork', signatureGenre: 'hiphop',
    event: { name: l('Bronx Blok Partisi', 'Bronx Block Party'), weekday: 6, genres: ['hiphop', 'soul'] },
    dish: { id: 'local_newyork', name: l('Dilim pizza', 'Dollar slice'), price: 8, mood: 8, health: 2 },
    rareItem: rare('drums_newyork', 'music_store', 'drums', 2, 2100, 9, l('Brooklyn breakbeat seti', 'Brooklyn breakbeat kit'), 'newyork', ['hiphop', 'soul'], 2),
    achievement: l('Şehir hiç uyumaz', 'The city never sleeps'),
    legend: l('Bir blok partisinde DJ iki plağın davul arasını uzatmış; o yazdan beri şehrin her köşesinde biri ritim tutar.', 'At a block party a DJ stretched the drum break between two records; since that summer someone keeps time on every corner.'),
  },
  {
    cityId: 'losangeles', signatureGenre: 'pop',
    event: { name: l('Sunset Strip Cumartesisi', 'Sunset Strip Saturday'), weekday: 6, genres: ['pop', 'rock', 'metal'] },
    dish: { id: 'local_losangeles', name: l('Balık taco', 'Fish tacos'), price: 14, mood: 10, health: 3 },
    rareItem: rare('outfit_la', 'boutique', 'outfit', 3, 3800, 11, l('Hollywood ışıltılı ceketi', 'Hollywood glitter jacket'), 'losangeles', ['pop'], 2),
    achievement: l('Bulvarın yıldızı', 'Star of the boulevard'),
    legend: l('Sunset\'teki bir kulübün tuvalet duvarında yazan telefon numarası bir zamanlar bir plak sözleşmesine dönüşmüş.', 'A phone number scrawled on a Sunset club\'s bathroom wall once turned into a record deal.'),
  },
  {
    cityId: 'nashville', signatureGenre: 'country',
    event: { name: l('Broadway Honky Tonk Gecesi', 'Broadway Honky Tonk Night'), weekday: 5, genres: ['country', 'blues', 'folk'] },
    dish: { id: 'local_nashville', name: l('Acılı tavuk', 'Hot chicken'), price: 14, mood: 10, health: 2 },
    rareItem: rare('guitar_nashville', 'music_store', 'guitar', 2, 2100, 9, l('Music Row Telecaster tarzı gitar', 'Music Row tele-style guitar'), 'nashville', ['country'], 2),
    achievement: l('Music Row sahnesinin yeni sesi', 'New voice of Music Row'),
    legend: l('Broadway\'deki bir honky tonk\'ta bahşiş kavanozuna yazılan bir şarkı sözü, yıllar sonra liste başı olmuş.', 'A lyric scribbled on a tip jar in a Broadway honky tonk became a number one years later.'),
  },
];
export const CITY_IDENTITY_BY_ID: Record<string, CityIdentity> = indexBy(CITY_IDENTITY, (c) => c.cityId);

/** Oyun takviminde haftanın günü (0–6) */
export const gameWeekday = (nowMs: number, gameSpeed: number) => ((Math.floor((nowMs * gameSpeed) / 86_400_000) % 7) + 7) % 7;
/** Şehrin haftalık etkinliği bu gün bu türdeki gruba açık mı? */
export function cityEventActive(cityId: string, genre: Genre, nowMs: number, gameSpeed: number): boolean {
  const id = CITY_IDENTITY_BY_ID[cityId];
  return !!id && id.event.weekday === gameWeekday(nowMs, gameSpeed) && id.event.genres.includes(genre);
}
