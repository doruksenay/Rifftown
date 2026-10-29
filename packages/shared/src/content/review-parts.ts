// İçerik: konser eleştirisi ve gazete haberi için PARÇA havuzları (TR ve EN).
// Ana cümle = açılış cümleciği + "; " + devam cümleciği; doluluk cümlesi = açılış + "; " + ayrıntı. Her parça tek
// başına tam bir cümleciktir, bu yüzden her ikili dilbilgisi olarak doğrudur. Kalite basamağı başına 12 × 12 = 144
// (DESTANSI 10 × 10) ana cümle, doluluk durumu başına 4 × 6 = 24 cümle olur. Eskiden basamak başına 8 sabit cümle vardı ve
// 200 konserde 10. konserden sonra cümlelerin yalnızca %8–9,5'i yeniydi (denge raporu §9).
// Kurallar (texts.test.ts denetler): iki dilde aynı yer tutucular; Türkçede yer tutucuya ek getirilmez ("{venue} tıklım
// tıklımdı" gibi eksiz kurulur); devam cümlecikleri küçük harfle başlar, noktayla biter; açılışlar noktasızdır.
// Yer tutucular: {n} seyirci, {venue} mekân, {city} şehir, {song} gecenin şarkısı, {band} grup.

import type { L } from '../world';

const l = (tr: string, en: string): L => ({ tr, en });

export interface ReviewPartTier {
  minQuality: number;
  /** Açılış cümleciği: büyük harfle başlar, noktasız */
  openers: L[];
  /** Devam cümleciği: küçük harfle başlar, noktayla biter */
  followups: L[];
}

export const REVIEW_PARTS: ReviewPartTier[] = [
  {
    minQuality: 0,
    openers: [
      l('Grup ilk şarkıda tökezledi', 'The band stumbled on the first song'),
      l('Ses dengesi baştan sona bozuktu', 'The sound mix was off from start to finish'),
      l('Vokal enstrümanların arasında kayboldu', 'The vocals got lost under the instruments'),
      l('Geçişler beceriksizdi', 'The transitions were clumsy'),
      l('Davul ritmi sık sık kaçırdı', 'The drums kept losing the beat'),
      l('Grup sahnede birbirine bakmadı bile', 'The band barely looked at each other on stage'),
      l('Set fazla uzun, şarkılar fazla benzerdi', 'The set was too long and the songs too alike'),
      l('Akort sorunları bir türlü bitmedi', 'The tuning problems never let up'),
      l('Gergin bir açılış hiç toparlanmadı', 'A nervous opening never recovered'),
      l('"{song}" bile gecenin havasını kurtaramadı', 'Not even "{song}" could rescue the night'),
      l('Sahnede enerji yoktu', 'There was no energy on stage'),
      l('Grup şarkıların sözlerini karıştırdı', 'The band mixed up the lyrics'),
    ],
    followups: [
      l('seyirci şarkılar arasında saatine baktı.', 'the audience kept checking the time between songs.'),
      l('arka masalar hesabı istedi.', 'the back tables asked for the bill.'),
      l('barmen bile müziği kısmak için ses masasına uzandı.', 'even the bartender reached for the desk to turn it down.'),
      l('alkışlar kibarlığın ötesine geçmedi.', 'the applause never went beyond politeness.'),
      l('{n} kişinin yarısı ikinci şarkıda kapıdaydı.', 'half of the {n} people were at the door by the second song.'),
      l('gecenin en yüksek sesi bir bardağın kırılmasıydı.', 'the loudest sound of the night was a breaking glass.'),
      l('seyirci telefonlarına gömüldü.', 'the crowd buried itself in its phones.'),
      l('yerel bir blog ertesi gün acımasızdı.', 'a local blog was merciless the next day.'),
      l('kimse bis istemedi.', 'nobody asked for an encore.'),
      l('prova odasında kalması gereken bir set gibiydi.', 'it felt like a set that should have stayed in the rehearsal room.'),
      l('sahne ışıkları bile yorgun görünüyordu.', 'even the stage lights looked tired.'),
      l('{venue} sessizce boşaldı.', '{venue} emptied out quietly.'),
    ],
  },
  {
    minQuality: 20,
    openers: [
      l('Grup temkinli başladı', 'The band started cautiously'),
      l('Set dalgalı ilerledi', 'The set came in waves'),
      l('Şarkılar fena değildi ama birbirine benziyordu', "The songs weren't bad, but they sounded alike"),
      l('Ses düzgündü, heyecan eksikti', 'The sound was fine, the excitement was missing'),
      l('Vokal yer yer parladı', 'The vocals shone in places'),
      l('"{song}" umut vaat etti', '"{song}" showed promise'),
      l('Grup sahnede biraz çekingendi', 'The band was a little shy on stage'),
      l('İlk yarı yavaştı, ikinci yarı biraz açıldı', 'The first half was slow and the second opened up a bit'),
      l('Ritim bölümü sağlamdı', 'The rhythm section was solid'),
      l('Gitar partileri derli topluydu', 'The guitar parts were tidy'),
      l('Geçişler aksamadı ama sürpriz de yoktu', 'The transitions were smooth but held no surprises'),
      l('Grup elinden geleni yaptı', 'The band did what it could'),
    ],
    followups: [
      l('seyirci kibarca alkışladı ve barın yolunu tuttu.', 'the crowd clapped politely and headed for the bar.'),
      l('birkaç kişi ritim tuttu, gerisi sohbete daldı.', 'a few people tapped along and the rest went back to chatting.'),
      l('ön sıra ilgiliydi, arka taraf değil.', 'the front row cared and the back did not.'),
      l('kimse çıkışta grubun adını sormadı.', "nobody asked the band's name on the way out."),
      l('seyirci kalmaya karar verdi ama dans etmeye değil.', 'the crowd decided to stay, but not to dance.'),
      l('{n} kişi için idare eder bir geceydi.', 'for the {n} people there, it was a passable night.'),
      l('sahne ışıkları gruptan daha çok dikkat çekti.', 'the stage lights drew more attention than the band.'),
      l('salon uyanmakla uyumak arasında gidip geldi.', 'the room drifted between waking up and nodding off.'),
      l('iyi bir anın ardından uzun bir durgunluk geldi.', 'one good moment was followed by a long lull.'),
      l('bir sonraki konser için kimse söz vermedi.', 'nobody promised to come back next time.'),
      l('alkışlar setin sonunda biraz ısındı.', 'the applause warmed up a little by the end.'),
      l('{venue} için sıradan bir geceydi.', 'it was an ordinary night for {venue}.'),
    ],
  },
  {
    minQuality: 40,
    openers: [
      l('Grup sahnede rahattı', 'The band looked at ease on stage'),
      l('Sağlam, eğlenceli bir set çıktı', 'It was a solid, fun set'),
      l('Açılış şarkısı salonu ısıttı', 'The opener warmed up the room'),
      l('Vokal kendinden emindi', 'The vocals were confident'),
      l('Ritim bölümü sıkı çaldı', 'The rhythm section played tight'),
      l('"{song}" gecenin sürprizi oldu', '"{song}" was the surprise of the night'),
      l('Setin ortası biraz uzadı ama kapanış toparladı', 'The middle dragged a little, but the closer pulled it together'),
      l('Gitar ve vokal güzel konuştu', 'Guitar and vocals talked to each other nicely'),
      l('Grup seyirciyle göz teması kurmayı bildi', 'The band knew how to make eye contact with the crowd'),
      l('Şarkı sırası akıllıca kurulmuştu', 'The running order was cleverly built'),
      l('Sahnede bir kimya vardı', 'There was chemistry on stage'),
      l('Grup her şarkıda biraz daha açıldı', 'The band opened up a little more with every song'),
    ],
    followups: [
      l('{n} seyirciden birkaçı çıkışta grubun adını sordu.', "a few of the {n} people asked the band's name on the way out."),
      l('"{song}" çalarken herkes ayaktaydı.', 'everyone was on their feet during "{song}".'),
      l('merch masasının önünde küçük bir kuyruk oluştu.', 'a small queue formed at the merch table.'),
      l('birkaç kişi nakarata eşlik etmeye başladı.', 'a few people started singing along to the chorus.'),
      l('bir sonraki konsere gelecek olanlar var.', 'some people will be back for the next one.'),
      l('salon gece boyunca sıcak kaldı.', 'the room stayed warm all night.'),
      l('seyirci bis için bir süre bekledi.', 'the crowd hung around a while hoping for an encore.'),
      l('{venue} için konuşulacak kadar iyi bir geceydi.', 'it was a good enough night at {venue} to get talked about.'),
      l('dans edenler arka sıralara kadar yayıldı.', 'the dancing spread all the way to the back rows.'),
      l('barmenler bile ritim tutuyordu.', 'even the bartenders were keeping time.'),
      l('ilk kez gelenler bir dahakini konuşuyordu.', 'first-timers were already talking about next time.'),
      l('telefonlar birkaç kez havaya kalktı.', 'phones went up in the air a few times.'),
    ],
  },
  {
    minQuality: 60,
    openers: [
      l('Grup salonu ilk şarkıdan avucuna aldı', 'The band had the room from the first song'),
      l('Sıkı bir set cesur geçişlerle aktı', 'A tight set flowed through bold transitions'),
      l('Vokal salonun her köşesine ulaştı', 'The vocals reached every corner of the room'),
      l('"{song}" bir anda herkesi ayağa kaldırdı', '"{song}" brought everyone to their feet at once'),
      l('Grup sahnede tek bir beden gibiydi', 'The band moved like a single body on stage'),
      l('Her şarkı bir öncekinin üstüne kuruldu', 'Every song built on the one before'),
      l('Ritim bölümü salonu dans pistine çevirdi', 'The rhythm section turned the room into a dance floor'),
      l('Sahne enerjisi gece boyunca hiç düşmedi', 'The energy on stage never dropped all night'),
      l('Gitar solosu ön sıraları büyüledi', 'The guitar solo spellbound the front rows'),
      l('Grup seyirciyle oyun oynar gibiydi', 'The band played with the crowd like a game'),
      l('Şarkılar arasındaki sessizlikler bile işledi', 'Even the silences between songs worked'),
      l('Kapanış şarkısı salonun nefesini kesti', "The closing song took the room's breath away"),
    ],
    followups: [
      l('{n} seyirci bis için yeri göğü inletti.', 'the {n} people roared for an encore.'),
      l('gece bittiğinde herkes "{song}" şarkısını mırıldanıyordu.', 'by the end, everyone was humming "{song}".'),
      l('çıkışta insanlar bir sonraki konserin tarihini soruyordu.', 'on the way out, people were asking when the next show was.'),
      l('telefon ışıkları hiç inmedi.', 'the phone lights never came down.'),
      l('salonun tamamı zıplıyordu.', 'the whole room was jumping.'),
      l('ter, alkış ve kahkaha birbirine karıştı.', 'sweat, applause and laughter all blurred together.'),
      l('{city} gece hayatında grubun adı artık daha sık geçecek.', "the band's name will come up more often in {city} nightlife."),
      l('seyirci her nakarata hep bir ağızdan katıldı.', 'the crowd joined every chorus as one.'),
      l('{venue} bu geceyi bir süre unutmayacak.', "{venue} won't forget this night for a while."),
      l('bisten sonra bile kimse yerinden kıpırdamadı.', 'even after the encore, nobody moved.'),
      l('en arka sıralar bile dans ediyordu.', 'even the very back rows were dancing.'),
      l('barın önündeki kuyruk bile şarkılara eşlik ediyordu.', 'even the queue at the bar was singing along.'),
    ],
  },
  {
    minQuality: 80,
    openers: [
      l('Kusursuza yakın bir gece yaşandı', 'It was a near-flawless night'),
      l('Grup her şarkıda bir öncekini geçmeye ant içmişti', 'The band seemed sworn to top every song with the next'),
      l('"{song}" bir marşa dönüştü', '"{song}" turned into an anthem'),
      l('Ses, ışık ve şarkılar aynı yöne baktı', 'Sound, light and songs all pointed the same way'),
      l('Grup salonu bir koroya çevirdi', 'The band turned the room into a choir'),
      l('Vokal tüyleri diken diken etti', 'The vocals gave people goosebumps'),
      l('Setin her geçişi yeni bir zirveye çıktı', 'Every transition in the set climbed to a new peak'),
      l('Grup sahneyi bir an bile bırakmadı', 'The band never let go of the stage for a second'),
      l('Gruptaki herkes en iyi hâlindeydi', 'Everyone in the band was at their best'),
      l('Kapanışta salon tek bir ses oldu', 'At the close the room became a single voice'),
      l('Sahne şovu ile şarkılar birbirini büyüttü', 'The stagecraft and the songs lifted each other'),
      l('Grup seyirciyi istediği yere götürdü', 'The band took the crowd wherever it wanted'),
    ],
    followups: [
      l('yerel basın bu konserden haftalarca bahsedecek.', 'the local press will talk about this show for weeks.'),
      l('salon "{song}" bittiğinde bir dakika boyunca alkışı kesmedi.', 'the room kept clapping for a full minute after "{song}".'),
      l('çıkışta sokakta bile nakarat söyleyenler vardı.', 'people were still singing the chorus out on the street.'),
      l('küçük sahneler artık bu gruba dar gelecek.', 'small stages will soon feel cramped for this band.'),
      l('{city} müzik çevresinin yarısı oradaydı.', 'half of the {city} music scene was there.'),
      l('{n} kişi aynı anda nakarata girdi.', '{n} people hit the chorus at the same moment.'),
      l('bilet bulamayanlar şimdiden üzülüyor.', "those who couldn't get tickets are already sorry."),
      l('ertesi sabah herkes aynı konseri konuşuyordu.', 'the next morning everyone was talking about the same show.'),
      l('eleştirmenler not almayı unuttu.', 'the critics forgot to take notes.'),
      l('{venue} böyle bir geceyi uzun zamandır görmemişti.', "{venue} hadn't seen a night like this in a long time."),
      l('bisin ardından ikinci bir bis istendi.', 'the encore was followed by calls for a second one.'),
      l('en soğuk eleştirmen bile ayağa kalktı.', 'even the coldest critic got to their feet.'),
    ],
  },
  {
    minQuality: 90,
    openers: [
      l('Bu bir konser değil, bir olaydı', "This wasn't a gig, it was an event"),
      l('"{song}" sırasında salonda tek bir kişi bile oturmuyordu', 'Not one person was sitting during "{song}"'),
      l('Grup sahnede tarih yazdı', 'The band wrote history on stage'),
      l('Her nota tam yerine oturdu', 'Every note landed exactly where it should'),
      l('Bir efsanenin ilk sayfası yazıldı', 'The first page of a legend was written'),
      l('Grup kendini aştı', 'The band outdid itself'),
      l('Salon gece boyunca tek bir kalp gibi attı', 'The room beat like a single heart all night'),
      l('Son akor uzun süre havada asılı kaldı', 'The last chord hung in the air for a long time'),
      l('{city} böyle bir konseri yıllardır görmedi', '{city} has not seen a show like this in years'),
      l('Grup sahneden indiğinde salon hâlâ şarkı söylüyordu', 'The room was still singing when the band left the stage'),
    ],
    followups: [
      l('{n} seyirci bu geceyi torunlarına anlatacak.', 'the {n} people there will tell their grandchildren about it.'),
      l('eleştirmenler kalemlerini bırakıp yalnızca dinledi.', 'the critics put down their pens and simply listened.'),
      l('{venue} artık biraz da bu grubun.', '{venue} belongs a little to this band now.'),
      l('kayıt yapan herkes bu geceyi yıllarca saklayacak.', 'everyone who filmed it will keep the footage for years.'),
      l('şehrin dört bir yanında "ben de oradaydım" diyenler çıkacak.', 'people all over town will claim "I was there".'),
      l('gözyaşı dökenler bile vardı.', 'some people were even in tears.'),
      l('alkışlar sokağa kadar taştı.', 'the applause spilled out onto the street.'),
      l('bu gecenin afişi duvarlardan hiç inmeyecek.', 'the poster for this night will never come off the walls.'),
      l('gece yarısından sonra bile kimse evine gitmek istemedi.', 'even past midnight, nobody wanted to go home.'),
      l('salon bir an sessiz kaldı, sonra yıkıldı.', 'the room went silent for a moment, then erupted.'),
    ],
  },
];

/** Doluluk cümlesi parçaları: açılışların hepsi mekânı anar (eleştiri hep mekânı bilir) */
export const REVIEW_CROWD_PARTS: Record<'packed' | 'half' | 'empty', { openers: L[]; details: L[] }> = {
  packed: {
    openers: [
      l('{venue} tıklım tıklımdı', '{venue} was packed'),
      l('Biletler tükendi ve {venue} doldu taştı', 'Tickets sold out and {venue} overflowed'),
      l('Kapıda kuyruk vardı ve {venue} ağzına kadar doluydu', 'There was a queue outside and {venue} was full to the brim'),
      l('{venue} öyle doluydu ki iğne atsan yere düşmezdi', 'There was not an inch to spare inside {venue}'),
    ],
    details: [
      l('havalandırma kalabalığa yetişemedi.', "the air conditioning couldn't keep up with the crowd."),
      l('insanlar bara ulaşmak için sıra bekledi.', 'people queued just to reach the bar.'),
      l('geç gelenler kapı aralığından dinledi.', 'latecomers listened from the doorway.'),
      l('duvar diplerinde bile yer kalmadı.', 'there was no room left even along the walls.'),
      l('{n} kişi omuz omuza duruyordu.', '{n} people stood shoulder to shoulder.'),
      l('kapıdaki görevli artık kimseyi içeri almıyordu.', 'the doorman had stopped letting anyone in.'),
    ],
  },
  half: {
    openers: [
      l('{venue} yarı yarıya doluydu', '{venue} was about half full'),
      l('{venue} ne boş ne doluydu', '{venue} was neither empty nor full'),
      l('{venue} rahat bir kalabalık topladı', '{venue} drew a comfortable crowd'),
      l('{venue} bu gece {n} kişiyi ağırladı', 'There were {n} people inside {venue}'),
    ],
    details: [
      l('dans etmek isteyene yer vardı.', 'there was room for anyone who wanted to dance.'),
      l('bara yaklaşmak kolaydı.', 'getting to the bar was easy.'),
      l('arka sıralar biraz seyrekti.', 'the back rows were a little sparse.'),
      l('ön taraf doluydu, arkası nefes alıyordu.', 'the front was full and the back had room to breathe.'),
      l('geç gelenler kolayca yer buldu.', 'latecomers found a spot easily.'),
      l('kimse kimsenin ayağına basmadı.', "nobody stepped on anyone's toes."),
    ],
  },
  // Boş salon yeni grupların ilk haftasıdır: en çok okunan basamak, en geniş havuz (playtest O-9: 31 konserin 13'ünde
  // aynı açılış). Türkçede yer tutucuya ek gelmez; "{venue} içinde" çeviri kokuyordu, mekân özne yapıldı.
  empty: {
    openers: [
      l('{venue} neredeyse boştu', '{venue} was almost empty'),
      l('{venue} bu gece seyirciden çok sandalye ağırladı', 'There were more chairs than listeners at {venue}'),
      l('{venue} bu gece yalnızdı', '{venue} felt lonely tonight'),
      l('{venue} kapısından yalnızca {n} kişi girdi', 'Only {n} people came through the door at {venue}'),
      l('{venue} sessiz bir geceye hazırlanmıştı ve yanılmadı', '{venue} had braced for a quiet night and got one'),
      l('{venue} salonunun yarısından fazlası karanlıkta kaldı', 'More than half of {venue} stayed in the dark'),
      l('{venue} sahnesinde {n} kişilik bir seyirci, cesur bir başlangıç', 'An audience of {n} at {venue}: a brave start'),
      l('Bu gece {venue} müdavimlerine kaldı', 'Tonight {venue} belonged to its regulars'),
      l('{venue} ışıkları seyirciden fazlaydı', 'At {venue}, the lights outnumbered the crowd'),
      l('{venue} afişleri asmıştı ama haber pek yayılmamıştı', '{venue} had put the posters up, but word had not spread'),
      l('Bu gece kalabalık {venue} dışında bir yerdeydi', 'The crowd was anywhere but {venue} tonight'),
      l('{venue} mütevazı bir gece yaşadı', '{venue} had a modest night'),
    ],
    details: [
      l('yankı seyirciden kalabalıktı.', 'the echo outnumbered the audience.'),
      l('barmen bile oturup dinledi.', 'even the bartender sat down to listen.'),
      l('her alkış tek tek duyuldu.', 'every single clap could be heard.'),
      l('ön sıralar boş kaldı.', 'the front rows stayed empty.'),
      l('arkadaşlar ve tanıdıklar dışında gelen olmadı.', 'apart from friends and family, nobody came.'),
      l('boş masalar gecenin hikâyesini anlattı.', 'the empty tables told the story of the night.'),
      l('gelenler en azından şarkıların sözlerini duydu.', 'at least those who came could hear every word.'),
      l('ses masasındaki tek kişi en sadık dinleyiciydi.', 'the person at the sound desk was the most loyal listener.'),
      l('bir masa her şarkıdan sonra ayrı ayrı alkışladı.', 'one table applauded every single song.'),
      l('kapı her açıldığında herkes başını çevirdi.', 'every time the door opened, everyone turned around.'),
      l('sahneden seyircinin yüzü tek tek görünüyordu.', 'from the stage you could see every face.'),
      l('ilk konserler böyle olur; önemli olan devam etmek.', 'first gigs go like this; what matters is keeping going.'),
    ],
  },
};

/** Gazete haberi parçaları: başlık + giriş + kapanış (NPC muhabir). {band}, {city}, {venue}, {n}, {song} */
export const NEWS_PARTS: { titles: L[]; leads: L[]; closers: L[] } = {
  titles: [
    l('{band} sahneyi salladı', '{band} rocked the stage'),
    l('Dün gecenin galibi: {band}', "Last night's winner: {band}"),
    l('"{song}" herkesin dilinde', 'Everyone is singing "{song}"'),
    l('{band} için yükselen grafik', 'Rising fortunes for {band}'),
    l('{city} gece hayatında yeni bir isim', 'A new name in {city} nightlife'),
    l('Bilet bulamayanlar üzülsün', 'Sorry if you missed it'),
    l('Eleştirmen notu: {band}', "Critic's note: {band}"),
    l('Kulaktan kulağa: {band}', 'Word of mouth: {band}'),
    l('{venue} sahnesinde büyük gece', 'A big night on the {venue} stage'),
    l('{band} adını duyuruyor', '{band} is making a name'),
    l('Muhabirimiz oradaydı: {band}', 'Our reporter was there: {band}'),
    l('{city} bu grubu konuşuyor', '{city} is talking about this band'),
  ],
  leads: [
    l('{band}, {venue} sahnesinde {n} kişinin önünde unutulmaz bir konser verdi.', '{band} played an unforgettable show at {venue} in front of {n} people.'),
    l('{venue} bu hafta böyle bir gece görmedi.', "{venue} hadn't seen a night like it all week."),
    l('Muhabirimiz {venue} konserinde grubun sahne hâkimiyetini not etti.', "Our reporter at {venue} noted the band's command of the stage."),
    l('{band}, {n} kişilik salonu avucunda tuttu.', '{band} held a room of {n} in the palm of their hand.'),
    l('Sıkı bir set, cesur geçişler ve terli bir seyirci: {band} bu gece iddialıydı.', 'A tight set, bold transitions and a sweaty crowd: {band} came with something to prove tonight.'),
    l('{band} konseri {venue} için yılın gecelerinden biriydi.', 'The {band} show was one of the nights of the year for {venue}.'),
    l('{city} müzik çevresi dün gece aynı adresteydi: {venue}.', 'The {city} music scene was all at one address last night: {venue}.'),
    l('{band} sahneye çıktığında {venue} çoktan dolmuştu.', 'By the time {band} took the stage, {venue} was already full.'),
    l('"{song}" ile açılan set ilk dakikadan salonu ele geçirdi.', 'Opening with "{song}", the set took over the room from the first minute.'),
    l('{band}, {city} sahnesinde iddiasını kanıtladı.', '{band} backed up its reputation on the {city} stage.'),
  ],
  closers: [
    l('Şehrin müzik çevresi grubun adını konuşuyor.', "The city's music crowd is talking about them."),
    l('Özellikle "{song}" salonu ayağa kaldırdı.', '"{song}" in particular brought the house down.'),
    l('Konserden çıkanların çoğu aynı şeyi söylüyor: bir dahaki konsere mutlaka gidin.', 'Most people leaving the show say the same thing: go to the next one.'),
    l('Mekân sahipleri şimdiden yeni tarih soruyor.', 'Venue owners are already asking for dates.'),
    l('"Bu grup küçük sahnelere sığmayacak" diyenler çoğalıyor.', 'More and more people are saying "this band won\'t fit on small stages for long".'),
    l('Setin kapanışı uzun süre konuşulacak.', 'The closer will be talked about for a long time.'),
    l('{n} kişi oradaydı ve anlatacak çok şeyi var.', '{n} people were there and they have plenty to say.'),
    l('Bir sonraki konserin biletleri şimdiden soruluyor.', 'People are already asking about tickets for the next show.'),
    l('Gece barlarda "{song}" mırıldanılarak sona erdi.', 'The night ended with "{song}" being hummed in the bars.'),
    l('Grubun yükselişi bu konserle hızlandı.', "The band's rise picked up speed with this show."),
  ],
};
