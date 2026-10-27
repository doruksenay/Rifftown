// İçerik: konser eleştirileri ve gazete haberleri için metin havuzları (TR ve EN).
// Yer tutucular: {n} seyirci sayısı, {venue} mekân, {city} şehir, {song} gecenin en iyi şarkısı,
// {band} grup, {rival} rakip grup, {event} sahne olayının adı.
// Türkçe cümlelerde özel adlara (yer tutuculara) ek getirmiyoruz; ünlü uyumu hatası olmasın diye
// cümleler "{venue} tıklım tıklımdı", "{rival} adlı grup" gibi eksiz kurulur. Test bunu denetler.

import type { L } from '../world';

const l = (tr: string, en: string): L => ({ tr, en });

/** Kalite basamağına göre ana cümle (her basamakta 8 cümle) */
export const REVIEW_TIERS: { minQuality: number; lines: L[] }[] = [
  {
    minQuality: 0,
    lines: [
      l('{n} seyircinin çoğu şarkılar arasında saatine baktı.', 'Most of the {n} people kept checking the time between songs.'),
      l('Yerel bir blog, setin ortasında dağıldığınızı yazdı.', 'A local blog wrote that the band fell apart halfway through the set.'),
      l('Barmen bile müziği kısmak için ses masasına uzandı.', 'Even the bartender reached for the mixing desk to turn it down.'),
      l('"{song}" başladığında arka masalar hesabı istedi.', 'When "{song}" started, the back tables asked for the bill.'),
      l('Akort sorunları setin tamamına yayıldı; kimse ne çaldığınızı tam anlamadı.', 'Tuning trouble spread through the whole set; nobody was quite sure what you were playing.'),
      l('Seyirci alkışlamak yerine telefonlarına baktı.', 'Instead of clapping, the crowd stared at their phones.'),
      l('Gecenin en yüksek sesi bir bardağın kırılmasıydı.', 'The loudest moment of the night was a glass breaking.'),
      l('Prova odasında kalması gereken bir set sahneye çıkmış gibiydi.', 'It felt like a set that should have stayed in the rehearsal room.'),
    ],
  },
  {
    minQuality: 20,
    lines: [
      l('{n} seyirci kibarca alkışladı ve barın yolunu tuttu.', 'The {n} people clapped politely and headed for the bar.'),
      l('"{song}" sırasında birkaç kişi ritim tuttu; gerisi çabuk unutuldu.', 'A few people tapped along to "{song}"; the rest was soon forgotten.'),
      l('Kötü değildi ama kimse eve dönerken grubun adını hatırlamadı.', 'It wasn\'t bad, but nobody remembered the band\'s name on the way home.'),
      l('İlk sıradakiler ilgiliydi, arka taraf sohbetine devam etti.', 'The front row paid attention; the back kept chatting.'),
      l('Birkaç doğru an, birkaç uzun sessizlik: idare eder bir gece.', 'A few right moments, a few long silences: a passable night.'),
      l('"{song}" umut vaat etti ama set onu taşıyamadı.', '"{song}" showed promise, but the set couldn\'t carry it.'),
      l('Seyirci kalmaya karar verdi ama dans etmeye değil.', 'The crowd decided to stay, but not to dance.'),
      l('Sahne ışıkları gruptan daha çok dikkat çekti.', 'The stage lights drew more attention than the band.'),
    ],
  },
  {
    minQuality: 40,
    lines: [
      l('{n} seyirciden birkaçı çıkışta grubun adını sordu.', 'A few of the {n} people asked the band\'s name on the way out.'),
      l('"{song}" çalarken herkes ayaktaydı.', 'Everyone was on their feet during "{song}".'),
      l('Sağlam, eğlenceli bir set; bir sonraki konsere gelecek olanlar var.', 'A solid, fun set; some people will be back for the next one.'),
      l('Grup sahnede rahattı ve bu salona da geçti.', 'The band looked at ease on stage, and the room felt it.'),
      l('"{song}" nakaratında birkaç kişi eşlik etmeye başladı.', 'A few people started singing along to the chorus of "{song}".'),
      l('Setin ortası biraz uzadı ama kapanış toparladı.', 'The middle dragged a little, but the closer pulled it together.'),
      l('Merch masasının önünde küçük bir kuyruk oluştu.', 'A small queue formed at the merch table.'),
      l('{venue} için iyi bir gece; konuşulacak kadar iyi.', 'A good night for {venue}; good enough to get talked about.'),
    ],
  },
  {
    minQuality: 60,
    lines: [
      l('{n} seyirci bis istedi; {venue} yerinden oynadı.', '{n} people demanded an encore and {venue} shook.'),
      l('Gece bittiğinde herkes "{song}" şarkısını mırıldanıyordu.', 'By the end of the night, everyone was humming "{song}".'),
      l('Grup salonu ilk şarkıdan avucuna aldı ve bırakmadı.', 'The band had the room from the first song and never let go.'),
      l('"{song}" sırasında salonun tamamı zıplıyordu.', 'The whole room was jumping during "{song}".'),
      l('Çıkışta insanlar bir sonraki konserin tarihini soruyordu.', 'On the way out, people were asking when the next show was.'),
      l('Sıkı bir set, cesur geçişler ve terli bir seyirci.', 'A tight set, bold transitions and a sweaty crowd.'),
      l('Bu konserden sonra {city} gece hayatında grubun adı daha sık geçecek.', 'After this show, the band\'s name will come up more often in {city} nightlife.'),
      l('Telefon ışıkları "{song}" boyunca hiç inmedi.', 'Phone lights stayed up all through "{song}".'),
    ],
  },
  {
    minQuality: 80,
    lines: [
      l('Yerel basın bu {venue} konserinden haftalarca bahsedecek.', 'The local press will talk about this {venue} show for weeks.'),
      l('"{song}", {n} kişinin hep bir ağızdan söylediği bir marşa dönüştü.', '"{song}" became an anthem sung by all {n} people.'),
      l('Böyle bir konserden sonra küçük sahneler artık dar gelecek.', 'After a show like this, small stages will start to feel cramped.'),
      l('Grup sanki her şarkıda bir öncekini geçmeye ant içmişti.', 'The band seemed sworn to top every song with the next.'),
      l('Salon "{song}" bittiğinde bir dakika boyunca alkışı kesmedi.', 'The room didn\'t stop clapping for a full minute after "{song}".'),
      l('Çıkışta sokakta bile nakarat söyleyenler vardı.', 'People were still singing the chorus out on the street.'),
      l('Kusursuza yakın bir gece: ses, ışık ve şarkılar aynı yöne baktı.', 'A near-flawless night: sound, light and songs all pointed the same way.'),
      l('{city} müzik çevresinin yarısı oradaydı; diğer yarısı kaçırdığına üzülüyor.', 'Half of the {city} music scene was there; the other half is sorry they missed it.'),
    ],
  },
  {
    minQuality: 90,
    lines: [
      l('{n} seyirci bu geceyi torunlarına anlatacak.', 'The {n} people there will tell their grandchildren about this night.'),
      l('{city} böyle bir konseri yıllardır görmedi.', '{city} has not seen a show like this in years.'),
      l('"{song}" sırasında salonda tek bir kişi bile oturmuyordu.', 'Not a single person was sitting down during "{song}".'),
      l('Eleştirmenler kalemlerini bıraktı ve sadece dinledi.', 'The critics put down their pens and simply listened.'),
      l('Bu bir konser değil, bir olaydı; {venue} artık biraz da sizin.', 'This wasn\'t a gig, it was an event; {venue} is a little bit yours now.'),
      l('Grup sahneden indiğinde seyirci hâlâ şarkı söylüyordu.', 'The crowd was still singing when the band left the stage.'),
      l('Kayıt yapan herkes bu geceyi yıllarca saklayacak.', 'Everyone who filmed tonight will keep it for years.'),
      l('Bir efsanenin ilk sayfası böyle yazılır.', 'This is how the first page of a legend gets written.'),
    ],
  },
];

/** EFSANEVİ geceler için (çok nadir) */
export const REVIEW_LEGENDARY: L[] = [
  l('EFSANEVİ bir gece. {n} kişi aynı anda sustu, sonra {song} ile birlikte bütün {city} şarkı söyledi.', 'A LEGENDARY night. {n} people fell silent at once, then all of {city} sang along to {song}.'),
  l('Bu EFSANEVİ konserin kaydı yıllarca elden ele dolaşacak. {song} sırasında sahnede bir şey oldu ve herkes bunu hissetti.', 'Bootlegs of this LEGENDARY show will circulate for years. Something happened on stage during {song}, and everyone felt it.'),
  l('EFSANEVİ. {venue} duvarlarına bu gecenin afişi asılacak ve hiç indirilmeyecek.', 'LEGENDARY. The poster for this night will go up on the walls of {venue} and never come down.'),
  l('Yıllar sonra "ben oradaydım" diyenlerin sayısı {n} kişiyi çoktan geçecek. EFSANEVİ bir gece.', 'Years from now, far more than {n} people will claim they were there. A LEGENDARY night.'),
];

/** Salonun doluluğu (her biri 3 cümle); hepsi mekânın adını anar, eleştiri hep mekânı bilir */
export const REVIEW_CROWD: Record<'packed' | 'half' | 'empty', L[]> = {
  packed: [
    l('{venue} tıklım tıklımdı.', '{venue} was packed.'),
    l('Kapıda kuyruk vardı; {venue} içinde iğne atsan yere düşmezdi.', 'There was a queue at the door and not an inch to spare inside {venue}.'),
    l('Biletler tükendi, {venue} nefes almakta zorlandı.', 'Sold out: {venue} could barely breathe.'),
  ],
  half: [
    l('{venue} yarı yarıya doluydu.', '{venue} was about half full.'),
    l('{venue} içinde hem dans edecek yer hem de dans edenler vardı.', 'There was room to dance in {venue}, and some people did.'),
    l('{venue} ne boş ne dolu; rahat bir kalabalık.', '{venue} was neither empty nor full; a comfortable crowd.'),
  ],
  empty: [
    l('{venue} neredeyse boştu.', '{venue} was almost empty.'),
    l('{venue} içinde seyirciden çok sandalye vardı.', 'There were more chairs than listeners in {venue}.'),
    l('{venue} içinde yankı, seyirciden daha kalabalıktı.', 'In {venue}, the echo outnumbered the audience.'),
  ],
};

/** Sahne olayına göre ek cümle; olayın kendi metni yoksa genel cümle kullanılır */
export const REVIEW_EVENT_GENERIC: { success: L[]; fail: L[] } = {
  success: [
    l('"{event}" anı gecenin en çok konuşulan kısmı oldu.', 'The "{event}" moment was the most talked-about part of the night.'),
    l('Planlanan "{event}" tam yerine oturdu.', 'The planned "{event}" landed perfectly.'),
  ],
  fail: [
    l('"{event}" denemesi sahnede dağıldı ve gecenin havası biraz söndü.', 'The "{event}" attempt fell apart and the mood dipped.'),
    l('"{event}" kâğıt üstünde iyi bir fikirdi; sahnede tutmadı.', '"{event}" looked good on paper; on stage it didn\'t work.'),
  ],
};
export const REVIEW_EVENT: Record<string, { success: L; fail: L }> = {
  banter: {
    success: l('Şarkılar arasındaki şakalar salonu güldürdü; grup seyirciyle arkadaş gibiydi.', 'The jokes between songs had the room laughing; band and crowd felt like old friends.'),
    fail: l('Şarkılar arasındaki şakalar havada asılı kaldı.', 'The jokes between songs hung awkwardly in the air.'),
  },
  singalong: {
    success: l('Nakaratı salona söyletme anı gecenin doruğuydu.', 'Getting the room to sing the chorus was the peak of the night.'),
    fail: l('Grup nakaratı seyirciye uzattı; kimse almadı.', 'The band held out the chorus to the crowd; nobody took it.'),
  },
  solo: {
    success: l('Uzun solo bittiğinde ön sıralar ellerini başlarına koymuştu.', 'When the long solo ended, the front rows had their hands on their heads.'),
    fail: l('Uzun solo uzadıkça uzadı ve salonun dikkati dağıldı.', 'The extended solo went on and on and the room drifted away.'),
  },
  dance: {
    success: l('Koreografi kusursuzdu; telefonlar havaya kalktı.', 'The choreography was flawless; phones went up in the air.'),
    fail: l('Dans gösterisinde adımlar karıştı, gülüşmeler oldu.', 'The dance routine got its steps mixed up, to some giggles.'),
  },
  unplugged: {
    success: l('Akustik ara salonu bir anda sessiz, sıcak bir odaya çevirdi.', 'The unplugged break turned the venue into a quiet, warm room.'),
    fail: l('Akustik ara gecenin temposunu düşürdü.', 'The unplugged break killed the momentum.'),
  },
  stage_dive: {
    success: l('Seyircinin üstüne atlayış gecenin fotoğrafı oldu.', 'The stage dive became the photo of the night.'),
    fail: l('Seyircinin üstüne atlayış yere inişle bitti; konser bir süre durdu.', 'The stage dive ended on the floor and the show paused for a while.'),
  },
  cover: {
    success: l('Sürpriz cover salonda bir an şaşkınlık, sonra koro yarattı.', 'The surprise cover caused a moment of surprise, then a choir.'),
    fail: l('Sürpriz cover, orijinalini özleten bir denemeye dönüştü.', 'The surprise cover mostly made people miss the original.'),
  },
  story: {
    success: l('Şarkıdan önce anlatılan hikâye salonu sessizce dinletti.', 'The story told before the song had the room listening in silence.'),
    fail: l('Şarkının hikâyesi uzadı; seyirci şarkıyı bekledi.', 'The story behind the song ran long; the crowd just wanted the song.'),
  },
  light_cue: {
    success: l('Işıklar ritimle aynı anda patladı; salon bir an gündüz oldu.', 'The lights exploded right on the beat; for a moment the room was daylight.'),
    fail: l('Işık senkronu bir vuruş geç kaldı ve büyük an kaçtı.', 'The light cue came a beat late and the big moment slipped away.'),
  },
  sax_solo: {
    success: l('Saksofon solosu salonun en arka köşesine kadar ulaştı.', 'The sax solo reached the very back corner of the room.'),
    fail: l('Saksofon solosu kamış gıcırtısıyla yarıda kaldı.', 'The sax solo broke off in a squeaky reed.'),
  },
  violin_solo: {
    success: l('Keman bölümünde salonda çıt çıkmadı.', 'You could hear a pin drop during the violin passage.'),
    fail: l('Keman bölümü akortsuz bir telle sarsıldı.', 'The violin passage wobbled on an out-of-tune string.'),
  },
  percussion_break: {
    success: l('Perküsyon arasında herkes el çırparak ritme katıldı.', 'During the percussion break everyone joined in, clapping the beat.'),
    fail: l('Perküsyon arası ritmini kaybetti; grup girişi kaçırdı.', 'The percussion break lost the groove and the band missed its cue.'),
  },
  drum_battle: {
    success: l('Davul düellosunu seyirci kaybetti ve buna bayıldı.', 'The crowd lost the drum battle and loved every second.'),
    fail: l('Davul düellosu, davulcunun bagetini düşürmesiyle bitti.', 'The drum battle ended with a dropped stick.'),
  },
  mosh_pit: {
    success: l('Pogo çağrısıyla salonun ortası kaynayan bir kazana döndü.', 'The mosh call turned the middle of the room into a boiling pot.'),
    fail: l('Pogo çağrısına salon sadece baktı.', 'The room just stared at the mosh call.'),
  },
  freestyle: {
    success: l('Seyircinin attığı kelimelerle yapılan doğaçlama rap gecenin kozu oldu.', 'The freestyle built from words the crowd threw was the ace of the night.'),
    fail: l('Doğaçlama rap ikinci dizede tıkandı.', 'The freestyle stalled on the second bar.'),
  },
  big_drop: {
    success: l('Bas düştüğünde zemin titredi.', 'When the bass dropped, the floor shook.'),
    fail: l('Uzun gerilimin sonunda beklenen drop gelmedi.', 'After the long build-up, the drop never came.'),
  },
  jam: {
    success: l('Doğaçlama atışmasında çalgıcılar birbirini kışkırttı; salon alkışla eşlik etti.', 'In the trading fours the players egged each other on, the room cheering each turn.'),
    fail: l('Doğaçlama atışması kimin sırası olduğu belirsiz bir karmaşaya döndü.', 'The trading fours turned into a muddle over whose turn it was.'),
  },
  call_response: {
    success: l('Vokal çağırdı, salon cevap verdi; bir kilise korosu gibiydi.', 'The singer called, the room answered, like a church choir.'),
    fail: l('Çağrıya cevap gelmedi; vokal yalnız kaldı.', 'The call got no response; the singer was left alone.'),
  },
  campfire: {
    success: l('Kamp ateşi anında herkes birbirinin omzuna kolunu attı.', 'During the campfire moment everyone put an arm around a neighbour.'),
    fail: l('Kamp ateşi anı, sözleri kimsenin bilmediği bir türküye denk geldi.', 'The campfire moment landed on a song nobody knew the words to.'),
  },
  dub_echo: {
    success: l('Ses masasından gelen yankılar salonu uzayda bir odaya çevirdi.', 'The echoes from the desk turned the room into a space capsule.'),
    fail: l('Dub yankısı geri beslemeye dönüştü; kulaklar tıkandı.', 'The dub echo turned into feedback; ears were covered.'),
  },
  hushed_hall: {
    success: l('En sessiz bölümde salon nefesini tuttu; bir öksürük bile duyulmadı.', 'In the quietest passage the hall held its breath; not even a cough.'),
    fail: l('En sessiz bölüm telefon zillerine ve fısıltılara yenildi.', 'The quietest passage lost out to ringtones and whispers.'),
  },
};

/** Basın desteğine göre ek cümle */
export const REVIEW_PRESS: Record<'hot' | 'cold', L[]> = {
  hot: [
    l('Şehir basını grubu zaten konuşuyordu; bu gece haklı çıktılar.', 'The city press was already talking about the band; tonight proved them right.'),
    l('Ön sırada not alan gazeteciler vardı; yarın manşet hazır.', 'There were journalists taking notes up front; tomorrow\'s headline is ready.'),
  ],
  cold: [
    l('Basın grubu pek sevmiyor ama bu gece salondakiler başka şey gördü.', 'The press isn\'t fond of the band, but the people in the room saw something else tonight.'),
    l('Soğuk eleştirilerin gölgesinde çıkılan bir sahneydi.', 'It was a stage taken under the shadow of cold reviews.'),
  ],
};

/** Aynı şehirde son günlerde çalan rakip gruba göre ek cümle */
export const REVIEW_RIVAL: Record<'beat' | 'lost', L[]> = {
  beat: [
    l('Dün aynı şehirde çalan {rival} adlı grubun gecesini kolayca gölgede bıraktı.', 'It easily overshadowed the show {rival} played in the same city the night before.'),
    l('{rival} hayranları bile bu konserden sonra fikir değiştirebilir.', 'Even fans of {rival} might switch sides after this one.'),
  ],
  lost: [
    l('Kıyaslama kaçınılmaz: {rival} geçen gece aynı şehirde daha iyi bir iş çıkardı.', 'The comparison is unavoidable: {rival} did a better job in the same city the other night.'),
    l('Salondakilerin bir kısmı hâlâ {rival} konserini konuşuyordu.', 'Part of the crowd was still talking about the {rival} show.'),
  ],
};

/** Şehre özgü renk cümlesi (her şehirde iki) */
export const REVIEW_CITY: Record<string, L[]> = {
  istanbul: [l('Konserden sonra kalabalık vapur iskelesine kadar şarkı söyleyerek yürüdü.', 'After the show the crowd sang all the way to the ferry pier.'), l('Gece simitçilerin ilk tezgâhı açılana kadar sürdü.', 'The night lasted until the first simit stall opened.')],
  ankara: [l('Bozkır ayazına rağmen kimse erken çıkmadı.', 'Despite the steppe frost, nobody left early.'), l('Tunalı\'daki barlarda gecenin konuşulacağı belli.', 'The bars on Tunalı will be talking about this one.')],
  izmir: [l('Kordon\'a çıkan seyirci imbat rüzgârında şarkıya devam etti.', 'The crowd spilled onto the Kordon and kept singing in the sea breeze.'), l('Konserden sonra boyoz kuyruğu her zamankinden uzundu.', 'The boyoz queue after the show was longer than ever.')],
  berlin: [l('Kreuzberg\'de bu gece sabaha kadar sürecek gibi.', 'In Kreuzberg this night looks set to run till morning.'), l('Kapıdaki fedai bile başını sallıyordu.', 'Even the bouncer at the door was nodding along.')],
  hamburg: [l('Reeperbahn\'ın ışıkları bu gece biraz daha parlaktı.', 'The lights of the Reeperbahn shone a little brighter tonight.'), l('Liman sisinin içinden bile müzik duyuluyordu.', 'You could hear the music through the harbour fog.')],
  munich: [l('Biergarten masalarında konser yine konuşuldu.', 'The beer-garden tables were talking about the show again.'), l('Münih\'in sakin gecesi bir anlığına sarsıldı.', 'Munich\'s quiet night was shaken for a moment.')],
  london: [l('Son metroya yetişmeye çalışanlar bile bis için kaldı.', 'Even those racing for the last Tube stayed for the encore.'), l('Camden sokaklarında yağmur bile coşkuyu söndüremedi.', 'Not even the rain on Camden\'s streets could dampen it.')],
  manchester: [l('Manchester yağmuru dışarıda, ter içeride.', 'Manchester rain outside, sweat inside.'), l('Kuzeyin sesi bu gece yine kendini hatırlattı.', 'The sound of the North reminded everyone it\'s still here.')],
  liverpool: [l('Mathew Street\'te eski bir efsanenin yankısı vardı.', 'There was an echo of an old legend on Mathew Street.'), l('Mersey kıyısında gece uzun sürdü.', 'The night ran long on the banks of the Mersey.')],
  paris: [l('Montmartre basamaklarında konser sonrası sohbetler sürdü.', 'Post-show talk carried on up the Montmartre steps.'), l('Paris eleştirmenleri bile gülümsedi; nadir görülen bir şey.', 'Even the Paris critics smiled, which is rare.')],
  lyon: [l('Bouchon\'larda gece yarısı yemeğinde konser konuşuldu.', 'The show was the talk of midnight dinner in the bouchons.'), l('İki nehrin şehri bu gece tek sesle şarkı söyledi.', 'The city of two rivers sang with one voice tonight.')],
  marseille: [l('Eski Liman\'a inen kalabalık mistrale rağmen dağılmadı.', 'The crowd heading down to the Old Port held together despite the mistral.'), l('Marsilya bu gece her zamankinden yüksek sesliydi.', 'Marseille was louder than usual tonight.')],
  newyork: [l('Şehir hiç uyumaz; bu gece neden uyumadığını gösterdi.', 'The city never sleeps; tonight it showed why.'), l('Brooklyn\'de konser sonrası bodega kuyruğu müzik konuşuyordu.', 'The post-show bodega line in Brooklyn was all about the music.')],
  losangeles: [l('Sunset Boulevard trafiği bile bir anlığına sustu.', 'Even the Sunset Boulevard traffic fell quiet for a moment.'), l('Salonda yapımcı kartvizitleri elden ele dolaştı.', 'Producers\' business cards were changing hands in the room.')],
  nashville: [l('Broadway\'deki honky tonk\'lar bu gece bir rakip daha kazandı.', 'The honky tonks on Broadway gained another rival tonight.'), l('Nashville\'de herkes müzisyen; yine de herkes durup dinledi.', 'In Nashville everyone is a musician, and still everyone stopped to listen.')],
};

// ---------- Gazete haberleri (NPC muhabir) ----------

/** Başlık ve gövde birlikte seçilir; {band}, {city}, {venue}, {n}, {song} */
export const NEWS_TEMPLATES: { title: L; body: L }[] = [
  { title: l('{band} sahneyi salladı: {city}', '{band} rocked {city}'), body: l('{band}, {venue} sahnesinde {n} kişinin önünde unutulmaz bir konser verdi. Şehrin müzik çevresi grubun adını konuşuyor.', '{band} played an unforgettable show at {venue} in front of {n} people. The city\'s music crowd is talking about them.') },
  { title: l('Dün gecenin galibi: {band}', 'Last night\'s winner: {band}'), body: l('{venue} bu hafta böyle bir gece görmedi. {band} özellikle "{song}" ile salonu ayağa kaldırdı.', '{venue} hadn\'t seen a night like it all week. {band} brought the house down with "{song}" in particular.') },
  { title: l('"{song}" herkesin dilinde', 'Everyone\'s singing "{song}"'), body: l('{band} konserinin ardından "{song}" şehrin barlarında mırıldanılan şarkı oldu. {n} kişi oradaydı ve anlatacak çok şeyi var.', 'After the {band} show, "{song}" became the tune hummed in the city\'s bars. {n} people were there and they have plenty to say.') },
  { title: l('{band} için yükselen grafik', 'Rising fortunes for {band}'), body: l('Muhabirimiz {venue} konserinde grubun sahne hâkimiyetini not etti: "Bu grup küçük sahnelere sığmayacak."', 'Our reporter at {venue} noted the band\'s command of the stage: "This band won\'t fit on small stages for long."') },
  { title: l('{city} gece hayatında yeni bir isim', 'A new name in {city} nightlife'), body: l('{band}, {n} kişilik salonu avucunda tuttu. Mekân sahipleri şimdiden yeni tarih soruyor.', '{band} held a room of {n} in the palm of their hand. Venue owners are already asking for dates.') },
  { title: l('Bilet bulamayanlar üzülsün', 'Sorry if you missed it'), body: l('{band} konseri {venue} için yılın gecelerinden biriydi. Setin kapanışı "{song}" uzun süre konuşulacak.', 'The {band} show was one of the nights of the year for {venue}. The closer, "{song}", will be talked about for a long time.') },
  { title: l('Eleştirmen notu: {band}', 'Critic\'s note: {band}'), body: l('Sıkı bir set, cesur geçişler ve terli bir seyirci. {band} bu gece {city} sahnesinde iddialıydı.', 'A tight set, bold transitions and a sweaty crowd. {band} came to {city} with something to prove tonight.') },
  { title: l('Kulaktan kulağa: {band}', 'Word of mouth: {band}'), body: l('Konserden çıkan {n} kişinin çoğu arkadaşlarına aynı şeyi söylüyor: bir dahaki konsere mutlaka gidin.', 'Most of the {n} people who left the show are telling their friends the same thing: go to the next one.') },
];
