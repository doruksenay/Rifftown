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

  // ---------- Yeni beceriler (içerik hacmi, Ekim 2026) ----------
  // Her birinin gerçek bir etkisi var: sahne olayı (performance.ts STAGE_EVENTS), atölye tarifi eşiği (content/recipes.ts),
  // tavanlı etki ağırlığı ya da ikisi birden. Açıklamalar yalnızca bunları anlatır. Şarkı yazma, sahne ve kayıt
  // ağırlığı eklenmedi (docs/DENGE_OLCUMU.md: tavana en ucuz yol değişmesin).
  // Enstrümanlar (grup rolü değil): sokakta bahşiş ve türe özgü bir sahne olayı
  K('banjo', 'instruments', 'book', 60, ['Banjo', 'Sokakta bahşişi artırır; country ve folk konserlerinde "Banjo atışması" sahne olayını açar.'], ['Banjo', 'Earns more tips busking; unlocks the "Banjo breakdown" stage event at country and folk gigs.'], { busking: 0.2 }, { skill: 'basic_strings', min: APPRENTICE }),
  K('mandolin', 'instruments', 'book', 55, ['Mandolin', 'Sokakta bahşişi artırır; folk, country ve klasik konserlerde "Mandolin tremolosu" sahne olayını açar.'], ['Mandolin', 'Earns more tips busking; unlocks the "Mandolin tremolo" stage event at folk, country and classical gigs.'], { busking: 0.15 }, { skill: 'basic_strings', min: APPRENTICE }),
  K('baglama', 'instruments', 'book', 60, ['Bağlama', 'Sokakta bahşişi artırır; Anadolu rock ve folk konserlerinde "Saz taksimi" sahne olayını açar.'], ['Bağlama (saz)', 'Earns more tips busking; unlocks the "Saz taksim" stage event at Anatolian rock and folk gigs.'], { busking: 0.2 }, { skill: 'basic_strings', min: APPRENTICE }),
  K('cello', 'instruments', 'book', 85, ['Çello', 'Sokakta biraz bahşiş getirir; klasik, folk ve metal konserlerinde "Çello ağıtı" sahne olayını açar.'], ['Cello', 'Earns a few tips busking; unlocks the "Cello lament" stage event at classical, folk and metal gigs.'], { busking: 0.1 }, { skill: 'basic_strings', min: AMATEUR }),
  K('harp', 'instruments', 'book', 150, ['Arp', 'Sokakta bahşişi artırır; klasik ve folk konserlerinde "Arp glissandosu" sahne olayını açar.'], ['Harp', 'Earns more tips busking; unlocks the "Harp glissando" stage event at classical and folk gigs.'], { busking: 0.15 }, { skill: 'basic_strings', min: AMATEUR }, true),
  K('trumpet', 'instruments', 'book', 70, ['Trompet', 'Sokakta bahşişi artırır; caz, soul, reggae ve pop konserlerinde "Üflemeli bölüm" sahne olayını açar.'], ['Trumpet', 'Earns more tips busking; unlocks the "Horn section" stage event at jazz, soul, reggae and pop gigs.'], { busking: 0.2 }, { skill: 'basic_winds', min: APPRENTICE }),
  K('ney', 'instruments', 'book', 60, ['Ney', 'Sokakta bahşişi artırır; Anadolu rock, klasik ve folk konserlerinde "Ney girişi" sahne olayını açar.'], ['Ney', 'Earns more tips busking; unlocks the "Ney intro" stage event at Anatolian rock, classical and folk gigs.'], { busking: 0.15 }, { skill: 'basic_winds', min: APPRENTICE }),
  K('accordion', 'instruments', 'book', 65, ['Akordeon', 'Sokakta çok bahşiş toplar; folk, country ve pop konserlerinde "Akordeon valsi" sahne olayını açar.'], ['Accordion', 'Earns lots of tips busking; unlocks the "Accordion waltz" stage event at folk, country and pop gigs.'], { busking: 0.25 }, { skill: 'basic_keyboard', min: APPRENTICE }),
  K('concert_piano', 'instruments', 'book', 85, ['Konser piyanosu', 'Sokağa taşınmaz; klasik, caz, pop ve soul konserlerinde "Piyano baladı" sahne olayını açar.'], ['Concert piano', 'Not for busking; unlocks the "Piano ballad" stage event at classical, jazz, pop and soul gigs.'], undefined, { skill: 'basic_keyboard', min: AMATEUR }),
  K('theremin', 'instruments', 'book', 150, ['Theremin', 'Sokakta biraz bahşiş getirir; elektronik, klasik ve metal konserlerinde "Theremin çığlığı" sahne olayını açar.'], ['Theremin', 'Earns a few tips busking; unlocks the "Theremin wail" stage event at electronic, classical and metal gigs.'], { busking: 0.1 }, { skill: 'synth_programming', min: AMATEUR }, true),
  K('beatmaking', 'instruments', 'book', 60, ['Ritim programlama', 'Sokakta biraz bahşiş getirir; hip-hop ve elektronik konserlerinde "Ritim değişimi" sahne olayını açar.'], ['Beat making', 'Earns a few tips busking; unlocks the "Beat switch" stage event at hip-hop and electronic gigs.'], { busking: 0.1 }, { skill: 'basic_percussion', min: APPRENTICE }),
  K('steelpan', 'instruments', 'book', 50, ['Çelik tava davulu', 'Sokakta bahşişi artırır; reggae ve pop konserlerinde "Çelik tava grovu" sahne olayını açar.'], ['Steelpan', 'Earns more tips busking; unlocks the "Steelpan groove" stage event at reggae and pop gigs.'], { busking: 0.2 }, { skill: 'basic_percussion', min: APPRENTICE }),
  K('yodeling', 'instruments', 'book', 35, ['Yodel', 'Sokakta biraz bahşiş getirir; country ve folk konserlerinde "Yodel" sahne olayını açar.'], ['Yodelling', 'Earns a few tips busking; unlocks the "Yodel" stage event at country and folk gigs.'], { busking: 0.1 }, { skill: 'basic_singing', min: APPRENTICE }),
  // Müzik
  K('orchestration', 'music', 'school', undefined, ['Orkestrasyon', 'Klasik, pop, metal ve soul konserlerinde "Orkestral doruk" sahne olayını açar.'], ['Orchestration', 'Unlocks the "Orchestral swell" stage event at classical, pop, metal and soul gigs.'], undefined, { skill: 'arranging', min: AMATEUR }),
  K('sound_engineering', 'music', 'school', undefined, ['Ses mühendisliği', 'Rock, metal ve punk konserlerinde "Geri besleme duvarı" sahne olayını açar.'], ['Sound engineering', 'Unlocks the "Wall of feedback" stage event at rock, metal and punk gigs.'], undefined, { skill: 'mixing', min: APPRENTICE }),
  K('memorization', 'music', 'book', 45, ['Ezber tekniği', 'Provada şarkıları biraz daha hızlı öğrenirsin.'], ['Memorisation', 'You learn songs a little faster in rehearsal.'], { rehearsal: 0.04 }),
  K('transcription', 'music', 'school', undefined, ['Nota çıkarma', 'Kayıttan notaya geçirmek; provada şarkıları biraz daha hızlı öğrenirsin.'], ['Transcription', 'Writing down what you hear; you learn songs a little faster in rehearsal.'], { rehearsal: 0.04 }, { skill: 'ear_training', min: APPRENTICE }),
  K('poetry', 'music', 'book', 40, ['Şiir', 'Dinlenirken, sokakta çalarken, yolculukta ve yeni beceri açarken kazandığın ilhamı artırır.'], ['Poetry', 'Raises the inspiration you gain resting, busking, travelling and unlocking new skills.'], { inspiration: 0.15 }),
  K('field_recording', 'music', 'book', 55, ['Saha kaydı', 'Dünyanın seslerini kaydetmek: dinlenirken, sokakta, yolculukta ve yeni beceri açarken kazandığın ilhamı artırır.'], ['Field recording', 'Recording the sounds of the world: raises the inspiration you gain resting, busking, travelling and unlocking new skills.'], { inspiration: 0.1 }, { skill: 'mixing', min: APPRENTICE }),
  // Sahne: yalnızca sahne olayları (sahne puanı ağırlığı eklenmedi)
  K('acrobatics', 'stage', 'book', 55, ['Akrobasi', 'Pop, rock ve punk konserlerinde "Akrobatik sıçrayış" sahne olayını açar.'], ['Acrobatics', 'Unlocks the "Acrobatic leap" stage event at pop, rock and punk gigs.'], undefined, { skill: 'dancing', min: APPRENTICE }),
  K('vj_visuals', 'stage', 'book', 60, ['VJ ve sahne görselleri', 'Elektronik ve pop konserlerinde "Görsel senkron" sahne olayını açar.'], ['VJ visuals', 'Unlocks the "Visual sync" stage event at electronic and pop gigs.'], undefined, { skill: 'stage_lighting', min: APPRENTICE }),
  K('quick_change', 'stage', 'book', 45, ['Hızlı kostüm değişimi', 'Pop ve soul konserlerinde "Kostüm sürprizi" sahne olayını açar.'], ['Quick change', 'Unlocks the "Costume reveal" stage event at pop and soul gigs.'], undefined, { skill: 'costume_design', min: APPRENTICE }),
  K('stage_magic', 'stage', 'book', 50, ['Sahne sihirbazlığı', 'Her türde "Sihirbazlık numarası" sahne olayını açar.'], ['Stage magic', 'Unlocks the "Magic trick" stage event in any genre.'], undefined),
  // Zanaat: atölyede yeni tarifler açar ve el işçiliğine katkı verir
  K('metalwork', 'crafts', 'book', 50, ['Metal işçiliği', 'Atölyede soprano saksofon ve hurda heykel tariflerini açar; el işçiliğine katkı.'], ['Metalwork', 'Unlocks the soprano sax and scrap sculpture recipes in the workshop; helps craftsmanship.'], { crafting: 0.15 }),
  K('leatherwork', 'crafts', 'book', 50, ['Deri işçiliği', 'Atölyede saçaklı ceket ve çivili zırh tariflerini açar; el işçiliğine katkı.'], ['Leatherwork', 'Unlocks the fringed jacket and spiked armour recipes in the workshop; helps craftsmanship.'], { crafting: 0.15 }, { skill: 'sewing', min: APPRENTICE }),
  K('ceramics', 'crafts', 'book', 45, ['Seramik', 'Atölyede darbuka, vazo, kupa ve kar küresi tariflerini açar; el işçiliğine katkı.'], ['Ceramics', 'Unlocks the darbuka, vase, mug and snow globe recipes in the workshop; helps craftsmanship.'], { crafting: 0.1 }),
  K('knitting', 'crafts', 'book', 30, ['Örgü', 'Atölyede örgü sahne takımı ve atkı tariflerini açar; el işçiliğine katkı.'], ['Knitting', 'Unlocks the knitted stage set and scarf recipes in the workshop; helps craftsmanship.'], { crafting: 0.1 }),
  K('jewelry', 'crafts', 'book', 70, ['Kuyumculuk', 'Atölyede gümüş kolye ve gümüş yüzük tariflerini açar; el işçiliğine katkı.'], ['Jewellery', 'Unlocks the silver pendant and silver ring recipes in the workshop; helps craftsmanship.'], { crafting: 0.1 }, { skill: 'metalwork', min: APPRENTICE }),
  K('calligraphy', 'crafts', 'book', 35, ['Hat ve kaligrafi', 'Atölyede çerçeveli şarkı sözü ve şarkı kartı tariflerini açar; biraz ilham ve el işçiliği katkısı.'], ['Calligraphy', 'Unlocks the framed lyrics and song card recipes in the workshop; a little inspiration and craftsmanship.'], { crafting: 0.05, inspiration: 0.05 }),
  K('bookbinding', 'crafts', 'book', 40, ['Ciltçilik', 'Atölyede el ciltli şarkı defteri tarifini açar; el işçiliğine biraz katkı.'], ['Bookbinding', 'Unlocks the hand-bound songbook recipe in the workshop; helps craftsmanship a little.'], { crafting: 0.05 }),
  // Sosyal
  K('diplomacy', 'social', 'book', 50, ['Diplomasi', 'Takılırken arkadaşlık biraz daha hızlı gelişir.'], ['Diplomacy', 'Friendships grow a little faster when you hang out.'], { social: 0.08 }, { skill: 'networking', min: APPRENTICE }),
  K('languages', 'social', 'book', 45, ['Yabancı dil', 'Takılırken arkadaşlık biraz daha hızlı gelişir.'], ['Languages', 'Friendships grow a little faster when you hang out.'], { social: 0.08 }),
  K('couple_dance', 'social', 'book', 45, ['Eşli dans', 'Flört ve randevularda romantizm daha hızlı artar.'], ['Partner dancing', 'Romance grows faster when flirting and on dates.'], { romance: 0.1 }, { skill: 'dancing', min: APPRENTICE }),
  K('love_letters', 'social', 'book', 40, ['Aşk mektupları', 'Flört ve randevularda romantizm daha hızlı artar.'], ['Love letters', 'Romance grows faster when flirting and on dates.'], { romance: 0.1 }, { skill: 'lyrics', min: APPRENTICE }),
  K('pet_care', 'social', 'book', 40, ['Hayvan bakımı', 'Evcil hayvanınla dinlenirken onun dinlenme bonusu artar (en fazla %30).'], ['Pet care', 'Your pet’s rest bonus grows when you rest with it (up to 30%).'], { pets: 0.3 }),
  // Spor
  K('cycling', 'sports', 'book', 30, ['Bisiklet', 'Dayanıklılık; yorucu işlerde daha az sağlık kaybı.'], ['Cycling', 'Stamina; lose less health on tiring work.'], { fitness: 0.15 }),
  K('climbing', 'sports', 'book', 45, ['Tırmanış', 'Güç ve denge; yorucu işlerde daha az sağlık kaybı.'], ['Climbing', 'Strength and balance; lose less health on tiring work.'], { fitness: 0.15 }),
  K('boxing', 'sports', 'book', 50, ['Boks', 'Kondisyon ve dayanıklılık; yorucu işlerde daha az sağlık kaybı.'], ['Boxing', 'Conditioning and toughness; lose less health on tiring work.'], { fitness: 0.15 }),
  K('pilates', 'sports', 'book', 40, ['Pilates', 'Duruş ve nefes; yorucu işlerde biraz daha az sağlık kaybı.'], ['Pilates', 'Posture and breath; lose a little less health on tiring work.'], { fitness: 0.1 }),
  K('meditation', 'sports', 'book', 35, ['Meditasyon', 'Dinlenirken, sokakta, yolculukta ve yeni beceri açarken kazandığın ilhamı artırır; biraz da kondisyon.'], ['Meditation', 'Raises the inspiration you gain resting, busking, travelling and unlocking skills; a little fitness too.'], { inspiration: 0.15, fitness: 0.05 }),
  K('nutrition', 'sports', 'book', 45, ['Beslenme', 'Tüketim eşyalarından aldığın enerji artar (en fazla %50).'], ['Nutrition', 'Consumables give you more energy (up to 50%).'], { nutrition: 0.5 }),
  // Kariyer
  K('first_aid', 'career', 'book', 45, ['İlk yardım', 'Tüketim eşyalarından aldığın sağlık artar (en fazla %50); atölyede boğaz şurubu tarifini açar.'], ['First aid', 'Consumables restore more health (up to 50%); unlocks the throat syrup recipe in the workshop.'], { remedy: 0.5 }),
];
