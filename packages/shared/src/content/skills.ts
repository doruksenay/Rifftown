// İçerik: ek beceriler. Yeni beceri eklemek için buraya bir satır eklemek yeter; ekranlar, kitapçı, okul ve
// bulanıklaştırma kendiliğinden tanır. "effects" alanı becerinin oyundaki etkisidir (skills.ts: skillBonus).
// Bu dosya skills.ts'den yalnızca tür alır (çalışma anında döngüsel bağımlılık olmasın).

import type { SkillDef } from '../skills';

type E = SkillDef['effects'];
const K = (
  id: string,
  category: SkillDef['category'],
  learn: SkillDef['learn'],
  bookPrice: number | undefined,
  tr: [string, string],
  en: [string, string],
  effects?: E,
  prereq?: { skill: string; min: number },
  vip?: boolean,
): SkillDef => ({ id, category, learn, bookPrice, name: { tr: tr[0], en: en[0] }, about: { tr: tr[1], en: en[1] }, effects, prereq, vip });

/** Seviye atlama cümlesi ekler (grup rolü olan beceriler için) */
const R = (d: SkillDef, levelUp: [string, string]): SkillDef => ({ ...d, levelUp: { tr: levelUp[0], en: levelUp[1] } });

const APPRENTICE = 15;
const AMATEUR = 30;

export const EXTRA_SKILLS: SkillDef[] = [
  // ---------- Müzik ----------
  K('music_theory', 'music', 'book', 50, ['Müzik teorisi', 'Armoni ve form bilgisi şarkılarını güçlendirir.'], ['Music theory', 'Harmony and form make your songs stronger.'], { songwriting: 0.05 }),
  K('arranging', 'music', 'school', undefined, ['Düzenleme', 'Şarkıyı enstrümanlara dağıtmak; şarkı kalitesini artırır.'], ['Arranging', 'Spreading a song across instruments; improves song quality.'], { songwriting: 0.05 }, { skill: 'composing', min: APPRENTICE }),
  K('sight_reading', 'music', 'book', 45, ['Deşifre', 'Nota okuyarak provada şarkıları daha hızlı öğrenirsin.'], ['Sight reading', 'Reading charts makes you learn songs faster in rehearsal.'], { rehearsal: 0.15 }),
  K('ear_training', 'music', 'school', undefined, ['Kulak eğitimi', 'Duyduğunu çalmak; provayı hızlandırır.'], ['Ear training', 'Playing what you hear; speeds up rehearsals.'], { rehearsal: 0.15 }),
  K('mixing', 'music', 'book', 70, ['Miks', 'Kayıtlarda sesleri dengelemek; kayıt kalitesini artırır.'], ['Mixing', 'Balancing the tracks; improves recordings.'], { recording: 0.04 }, { skill: 'production', min: APPRENTICE }),
  K('mastering', 'music', 'school', undefined, ['Mastering', 'Kaydın son cilası.'], ['Mastering', 'The final polish of a record.'], { recording: 0.04 }, { skill: 'mixing', min: AMATEUR }),
  K('jingle_writing', 'music', 'book', 40, ['Cıngıl yazımı', 'Akılda kalan kısa melodiler; sokak müziğinde bahşişi artırır.'], ['Jingle writing', 'Catchy little tunes; earns more tips busking.'], { busking: 0.2, songwriting: 0.02 }),
  K('songcraft_hooks', 'music', 'book', 60, ['Nakarat ustalığı', 'Unutulmayan nakaratlar yazarsın.'], ['Hook writing', 'You write choruses people can’t forget.'], { songwriting: 0.05 }, { skill: 'lyrics', min: APPRENTICE }),
  K('sampling', 'music', 'book', 55, ['Örnekleme', 'Eski kayıtlardan yeni şarkılar; şarkı ve kayıt kalitesine katkı.'], ['Sampling', 'New songs from old records; helps songs and recordings.'], { songwriting: 0.02, recording: 0.02 }),
  K('vocal_harmony', 'music', 'book', 50, ['Vokal armonisi', 'İkinci ses; sahnede ve kayıtta fark yaratır.'], ['Vocal harmony', 'Backing vocals that lift the stage and the record.'], { stage: 0.03, recording: 0.02 }, { skill: 'basic_singing', min: APPRENTICE }),
  // ---------- Enstrümanlar (saksofon, keman ve el perküsyonu grup rolüdür; diğerleri sokakta ve provada işe yarar) ----------
  K('acoustic_guitar', 'instruments', 'book', 60, ['Akustik gitar', 'Parkta herkesi başına toplar.'], ['Acoustic guitar', 'Draws a crowd in the park.'], { busking: 0.25 }, { skill: 'basic_strings', min: APPRENTICE }),
  K('harmonica', 'instruments', 'book', 35, ['Mızıka', 'Cebe sığan blues.'], ['Harmonica', 'Blues that fits in a pocket.'], { busking: 0.15 }),
  K('ukulele', 'instruments', 'book', 35, ['Ukulele', 'Neşeli, küçük ve taşınabilir.'], ['Ukulele', 'Cheerful, small and portable.'], { busking: 0.15 }),
  R(K('hand_percussion', 'instruments', 'book', 80, ['El perküsyonu', 'Konga, darbuka, kaval kemik: grupta perküsyon rolünde ne kadar iyi olduğun; provada ritmi de sağlamlaştırır.'], ['Hand percussion', 'Congas, darbuka and shakers: how good you are in the percussion role; also tightens rehearsals.'], { rehearsal: 0.08, busking: 0.1 }, { skill: 'basic_percussion', min: APPRENTICE }), ['Artık {tier} bir perküsyoncusun!', "You're now {a} {tier} percussionist!"]),
  K('synth_programming', 'instruments', 'book', 70, ['Synth programlama', 'Kendi seslerini tasarlamak.'], ['Synth programming', 'Designing your own sounds.'], { songwriting: 0.03, recording: 0.02 }, { skill: 'basic_keyboard', min: APPRENTICE }),
  K('beatboxing', 'instruments', 'book', 30, ['Beatbox', 'Ağızla davul; sokakta ilgi çeker.'], ['Beatboxing', 'Drums with your mouth; turns heads on the street.'], { busking: 0.2, stage: 0.01 }),
  R(K('violin', 'instruments', 'book', 80, ['Keman', 'Zor ama büyüleyici: grupta keman rolünde ne kadar iyi olduğun; sokakta da çok bahşiş toplar.'], ['Violin', 'Hard, but enchanting: how good you are in the violin role; it also earns well on the street.'], { busking: 0.25, recording: 0.01 }, { skill: 'basic_strings', min: APPRENTICE }), ['Artık {tier} bir kemancısın!', "You're now {a} {tier} violinist!"]),
  R(K('saxophone', 'instruments', 'book', 80, ['Saksofon', 'Grupta saksofon rolünde ne kadar iyi olduğun: sahnede bir solo, sokakta bir şapka dolusu bahşiş.'], ['Saxophone', 'How good you are in the sax role: a solo on stage, a hatful of tips on the street.'], { busking: 0.2, stage: 0.02 }, { skill: 'basic_winds', min: APPRENTICE }), ['Artık {tier} bir saksofoncusun!', "You're now {a} {tier} saxophonist!"]),
  K('turntablism', 'instruments', 'book', 65, ['Plak çalarla müzik', 'Scratch ve geçişler.'], ['Turntablism', 'Scratches and transitions.'], { stage: 0.03 }),
  // ---------- Sahne ----------
  K('mic_technique', 'stage', 'book', 45, ['Mikrofon tekniği', 'Sesin salonun en arkasına ulaşır.'], ['Mic technique', 'Your voice reaches the back of the room.'], { stage: 0.03 }, { skill: 'basic_singing', min: APPRENTICE }),
  K('stage_banter', 'stage', 'book', 40, ['Sahne sohbeti', 'Şarkılar arasında seyirciyi tutmak.'], ['Stage banter', 'Holding the crowd between songs.'], { stage: 0.04 }, { skill: 'showmanship', min: APPRENTICE }),
  K('choreography', 'stage', 'school', undefined, ['Koreografi', 'Grupça, prova edilmiş hareketler.'], ['Choreography', 'Rehearsed moves as a band.'], { stage: 0.04 }, { skill: 'dancing', min: AMATEUR }),
  K('breakdance', 'stage', 'book', 55, ['Breakdance', 'Yerde dönmek, havada donmak.'], ['Breakdance', 'Spinning on the floor, freezing mid-air.'], { stage: 0.03, busking: 0.1 }),
  K('stage_lighting', 'stage', 'book', 60, ['Sahne ışığı', 'Doğru ışık doğru anı büyütür.'], ['Stage lighting', 'The right light makes the moment bigger.'], { stage: 0.03 }),
  K('costume_design', 'stage', 'book', 55, ['Kostüm tasarımı', 'Sahne imajı; atölyede kostüm kalitesine de katkı.'], ['Costume design', 'Stage image; also helps make costumes in the workshop.'], { stage: 0.02, crafting: 0.1 }),
  K('crowd_control', 'stage', 'book', 50, ['Kalabalık yönetimi', 'Büyük sahnelerde salonu avucunda tutmak.'], ['Crowd control', 'Keeping a big room in the palm of your hand.'], { stage: 0.03 }, { skill: 'audience', min: APPRENTICE }),
  // ---------- Kariyer ----------
  K('journalism', 'career', 'book', 60, ['Gazetecilik', 'Haber ve röportaj yazmak; basın desteği yaratır.'], ['Journalism', 'Writing news and interviews; builds press support.'], undefined, { skill: 'lyrics', min: APPRENTICE }),
  K('photography', 'career', 'book', 55, ['Fotoğrafçılık', 'Yazdığın haberlerin basın etkisini ve grubunun kliplerinin kalitesini biraz artırır.'], ['Photography', 'Slightly boosts the press impact of your stories and the quality of your band\'s videos.']),
  K('film_directing', 'career', 'university', undefined, ['Film yönetmenliği', 'Müzik klibi çekmek için.'], ['Film directing', 'For shooting music videos.'], undefined, { skill: 'photography', min: APPRENTICE }),
  K('acting', 'career', 'book', 60, ['Oyunculuk', 'Klipte kameranın önünde rahat olmak.'], ['Acting', 'Being at ease in front of the camera.']),
  K('radio_hosting', 'career', 'book', 60, ['Radyo programcılığı', 'Radyocularla aynı dili konuşursun: grubunun single\'ları radyoda biraz daha çok çalınır.'], ['Radio hosting', 'You speak the DJs\' language: your band\'s singles get a little more airplay.']),
  K('accounting', 'career', 'book', 60, ['Muhasebe', 'Tur ekibi ücretlerini ve işletme ile plak şirketi giderlerini biraz düşürür (en fazla %10).'], ['Accounting', 'Trims road-crew wages and business and label upkeep a little (up to 10%).'], undefined, { skill: 'economics', min: 5 }),
  K('marketing', 'career', 'university', undefined, ['Pazarlama', 'Grubunun konserlerine biraz daha çok seyirci gelir, plakları biraz daha çok satar (en fazla %5).'], ['Marketing', 'Your band draws a slightly bigger crowd and sells slightly more records (up to 5%).'], undefined, { skill: 'economics', min: APPRENTICE }),
  K('logistics', 'career', 'book', 55, ['Lojistik', 'Turne ekibinin morali konserlerde daha yavaş düşer, sahnedeki enstrümanlar daha az yıpranır.'], ['Logistics', 'Road-crew morale sinks more slowly at gigs and stage gear wears out less.']),
  K('driving', 'career', 'book', 40, ['Sürücülük', 'Turne aracında arıza riskini azaltır.'], ['Driving', 'Lowers the chance of breakdowns on tour.']),
  K('mechanics', 'career', 'book', 60, ['Mekanik', 'Arızalı aracı ve ekipmanı onarmak.'], ['Mechanics', 'Repairing broken vehicles and gear.'], { crafting: 0.05 }),
  K('contract_law', 'career', 'university', undefined, ['Sözleşme hukuku', 'Grup liderinin becerisi plak şirketi sözleşmesinde grubun alabileceği en yüksek payı yükseltir (%60\'tan %65\'e kadar).'], ['Contract law', 'A band leader with it can negotiate a higher maximum band share in label deals (from 60% up to 65%).'], undefined, { skill: 'law', min: APPRENTICE }),
  // ---------- Sosyal ----------
  K('humor', 'social', 'book', 35, ['Mizah', 'İnsanları güldürmek arkadaşlığı hızlandırır.'], ['Humour', 'Making people laugh speeds up friendships.'], { social: 0.1 }),
  K('empathy', 'social', 'book', 40, ['Empati', 'Dinlemeyi bilmek.'], ['Empathy', 'Knowing how to listen.'], { social: 0.1, romance: 0.05 }),
  K('networking', 'social', 'book', 55, ['Çevre edinme', 'Doğru insanları tanımak.'], ['Networking', 'Knowing the right people.'], { social: 0.12 }, { skill: 'charisma', min: APPRENTICE }),
  K('etiquette', 'social', 'book', 45, ['Görgü', 'Randevularda iyi izlenim bırakmak.'], ['Etiquette', 'Making a good impression on dates.'], { romance: 0.1 }),
  K('storytelling', 'social', 'book', 40, ['Hikâye anlatıcılığı', 'Sahnede ve sohbette dinleyiciyi tutmak.'], ['Storytelling', 'Holding listeners on stage and in conversation.'], { social: 0.06, stage: 0.01 }),
  // ---------- Spor ----------
  K('running', 'sports', 'book', 30, ['Koşu', 'Dayanıklılık; yorucu işlerde daha az sağlık kaybı.'], ['Running', 'Stamina; lose less health on tiring work.'], { fitness: 0.2 }),
  K('yoga', 'sports', 'book', 40, ['Yoga', 'Esneklik ve nefes.'], ['Yoga', 'Flexibility and breath.'], { fitness: 0.15 }),
  K('swimming', 'sports', 'book', 35, ['Yüzme', 'Tüm vücut kondisyonu.'], ['Swimming', 'Full-body conditioning.'], { fitness: 0.2 }),
  K('martial_arts', 'sports', 'book', 60, ['Dövüş sanatları', 'Disiplin ve dayanıklılık.'], ['Martial arts', 'Discipline and toughness.'], { fitness: 0.15 }),
  // ---------- Zanaat ----------
  K('woodworking', 'crafts', 'book', 45, ['Ahşap işçiliği', 'Gövdeler ve kasalar; atölye işlerine katkı.'], ['Woodworking', 'Bodies and cases; helps workshop builds.'], { crafting: 0.2 }),
  K('electronics', 'crafts', 'book', 55, ['Elektronik', 'Manyetik, devre, kablolama.'], ['Electronics', 'Pickups, circuits, wiring.'], { crafting: 0.2 }),
  K('sewing', 'crafts', 'book', 35, ['Dikiş', 'Kostüm ve sahne kıyafeti.'], ['Sewing', 'Costumes and stage clothes.'], { crafting: 0.2 }),
  K('luthiery', 'crafts', 'book', 90, ['Çalgı yapımcılığı', 'Usta işi enstrümanlar.'], ['Luthiery', 'Master-built instruments.'], { crafting: 0.25 }, { skill: 'woodworking', min: AMATEUR }),
  K('painting_art', 'crafts', 'book', 40, ['Resim', 'Tuval ve afiş; atölyede sanat eseri üretmeye yarar.'], ['Painting', 'Canvas and posters; lets you make art in the workshop.'], { crafting: 0.1 }),
  K('pyrotechnics', 'crafts', 'book', 80, ['Piroteknik', 'Sahne efektlerini kendin hazırlarsın.'], ['Pyrotechnics', 'Making your own stage effects.'], { crafting: 0.1, stage: 0.01 }, { skill: 'electronics', min: APPRENTICE }),
];
