// Sunucu ile uygulama arasındaki veri biçimleri.

import type { HomeId } from './homes';
import type { PaintColor } from './items';
import type { RelationStage } from './relations';
import type { BusinessType } from './world';
import type { ActionKind, GigFactorId, GigFactors, TravelMode } from './rules';
import type { NextGoal } from './progression';
import type { EncoreOutcome, EncorePlan, StageEventOutcome, Tempo } from './performance';
import type { ArticleTone, PressMode } from './press';
import type { ProducerTier, VideoDirector } from './broadcast';
import type { Skills } from './skills';
import type { Attributes } from './attributes';
import type { Genre, Instrument, Lang } from './world';

export interface ApiError {
  error: string; // makine tarafından okunan kod, ör. "not_enough_money"
  message?: string;
}

export interface ConfigResponse {
  gameSpeed: number;
  serverTime: string;
  version: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface UserDto {
  id: number;
  email: string;
  lang: Lang;
  isAdmin: boolean;
  isVip: boolean;
  vipUntil: string | null;
}

export interface ActionDto {
  id: number;
  kind: ActionKind;
  params: Record<string, unknown>;
  locationId: string | null;
  startedAt: string;
  endsAt: string;
  status: 'active' | 'done' | 'cancelled';
  result: Record<string, unknown> | null;
}

export interface CharacterDto {
  id: number;
  name: string;
  avatarColor: string;
  mainInstrument: Instrument;
  money: number;
  /** Görünen ruh hâli (temel + moodlet'ler) */
  mood: number;
  /** Moodlet'ler hariç temel ruh hâli */
  baseMood: number;
  health: number;
  /** Enerji (0–100): yorucu işler harcar, dinlenmek ve yemek doldurur */
  energy: number;
  /** İlham (0–100): şarkı yazarken harcanır, EFSANEVİ geceyi mümkün kılar */
  inspiration: number;
  /** Etkin moodlet'ler; süresi olmayanlar durumdan doğar */
  moodlets: MoodletDto[];
  cityId: string | null; // seyahatteyken null
  locationId: string | null;
  skills: Skills;
  bio: string;
  createdAt: string;
  /** Meslek: id, rütbe (0–3) ve o meslekte çalışılan toplam oyun saati */
  profession: { id: string; rank: number; hours: number } | null;
  /** Şu an tuttuğu makamlar */
  offices: { cityId: string; office: string }[];
  /** Cezaevindeyse çıkış zamanı */
  jailedUntil: string | null;
  /** Tutukluysa (henüz karar yoksa) true; hüküm giymişse false */
  inCustody: boolean;
  convictions: number;
  achievementPoints: number;
  /** Bankadaki para (cezalarda kullanılmaz) */
  bank: number;
  /** Otelde kalıyorsa şehir ve bitiş */
  hotel: { cityId: string; until: string } | null;
  /** Sahibi olduğu ya da çalıştığı işletme */
  business: { locationId: string; role: 'owner' | 'staff' } | null;
  /** Profilde adın altında görünen kısa başlık */
  headline: string;
  /** Yüklenmiş profil fotoğrafı (/api'ye göre yol) ya da null */
  avatarUrl: string | null;
  home: HomeDto | null;
  /** Oyun yılıyla yaş */
  age: number;
  /** Bağımlı mı (alışveriş/tüketim) */
  addicted: boolean;
  /** Nitelikler (0–100; VIP olmayanlara bulanık, bkz. attributes.ts) */
  attributes: Attributes;
  /** Harcanmamış XP (para gibi harcanan bir bakiye; tam sayıya aşağı yuvarlanır) */
  xp: number;
}

/** GET /api/attributes: nitelikler, XP ve tavanlar */
export interface AttributesDto {
  attributes: Attributes;
  xp: number;
  /** Toplam tavana kalan nitelik puanı (VIP olmayanlara 10'luk adımlarla) */
  attributeRoom: number;
  /** Son 24 oyun saatinde ve son 7 oyun gününde kazanılan XP ve tavanlar */
  xpDay: number;
  xpWeek: number;
  xpDayCap: number;
  xpWeekCap: number;
  /** Yeni hesap: tavanlar yarı yarıya */
  newAccount: boolean;
}

export interface HomeDto {
  homeId: HomeId;
  cityId: string;
  /** Bir sonraki kiranın ödeneceği zaman */
  paidUntil: string;
  rent: number;
}

export interface BandSummaryDto {
  id: number;
  name: string;
  genre: Genre;
  role: Instrument;
  isLeader: boolean;
}

export interface MeResponse {
  user: UserDto;
  character: CharacterDto | null;
  action: ActionDto | null;
  band: BandSummaryDto | null;
  unreadNotifications: number;
  pendingInvites: number;
  /** Hüküm giymiş mahkûmun ödeyebileceği kefalet (cezaevinde değilse ya da tutukluysa null) */
  bailCost: number | null;
  unreadMessages: number;
  /** Bekleyen gelen takas teklifleri */
  pendingTrades: number;
  /** Karakteri yoksa ve önceki karakteri öldüyse (PERMADEATH) */
  death?: { characterId: number; name: string; cause: string; at: string; inheritance: number } | null;
  /** Ölen karakterin mirasçı olabilecek yetişkin çocuk sayısı (nesiller; yeni karakter yerine mirasçıyla devam) */
  heirsAvailable?: number;
}

/** Karakterin durumu: oynanıyor, mirasını devredip emekliye ayrılmış ya da ölmüş */
export type CharacterStatus = 'active' | 'retired' | 'dead';

/** Soy ağacı (nesiller): aile adı, kuşak, anne-baba, devreden ve devralan karakter */
export interface LineageDto {
  familyName: string;
  generation: number;
  /** Bu karakter bir çocuktan doğduysa anne-babası */
  parents: { characterId: number; name: string; status: CharacterStatus }[];
  /** Kimden devraldı */
  predecessor: { characterId: number; name: string; status: CharacterStatus } | null;
  /** Kim devraldı */
  heir: { characterId: number; name: string } | null;
}

export interface HeirCandidateDto {
  childId: number;
  name: string;
  age: number;
  stage: 'baby' | 'child' | 'teen' | 'adult';
  /** Mirasçı olmasını engelleyen durum: not_adult, already_heir, consent_needed (yoksa null: olabilir) */
  blocker: string | null;
  /** Zaten oynanabilir karakter olduysa kimliği */
  heirCharacterId: number | null;
  coParent: { characterId: number; name: string } | null;
  /** Diğer ebeveyn başka hesapta yaşayan bir oyuncu: onayı gerekir */
  consentNeeded: boolean;
  consentGiven: boolean;
  consentRequested: boolean;
  /** Önerilen ad: çocuğun adı + aile adı */
  defaultName: string;
}

/** GET /api/family/heirs */
export interface HeirsResponse {
  predecessor: { characterId: number; name: string; status: CharacterStatus };
  /** retire: yaşayan karakter isteyerek devreder (emekli olur); death: ölen karakterden devralınır */
  mode: 'retire' | 'death';
  familyName: string;
  generation: number;
  /** Mirasçıya geçecek para (tahmini; ölümde kesin) */
  inheritance: number;
  heirloomLimit: number;
  /** Yadigâr olabilecek eşyalar */
  heirlooms: InventoryItemDto[];
  /** Devri engelleyen durum (hesap yeni, bekleme süresi, cezaevi, meşgul, hamilelik...) */
  blocker: string | null;
  blockedUntil: string | null;
  children: HeirCandidateDto[];
  /** Diğer ebeveyni olduğum çocuklar için bana gelen onay istekleri */
  incomingConsents: { childId: number; name: string; fromId: number; from: string }[];
}

export interface SongDto {
  id: number;
  title: string;
  genre: Genre;
  subgenre: string | null;
  tempo: Tempo;
  quality: number;
  authorId: number;
  authorName: string;
  createdAt: string;
  inBand: boolean;
  myFamiliarity: number;
  /** Grubun bu şarkının kaydı (kaydedilmediyse null) */
  recordingQuality: number | null;
}

export interface BandMemberDto {
  characterId: number;
  name: string;
  avatarColor: string;
  avatarUrl?: string | null;
  role: Instrument;
  isLeader: boolean;
  cityId: string | null;
  skill: number; // rolündeki beceri
  familiarity: Record<number, number>;
}

export interface GigDto {
  id: number;
  bandId: number;
  bandName: string;
  cityId: string;
  locationId: string;
  startsAt: string;
  status: 'scheduled' | 'done' | 'cancelled';
  setlist: number[];
  sessionRoles: Instrument[];
  result: {
    quality: number;
    attendance: number;
    revenue: number;
    fameDelta: number;
    presentCount: number;
    memberCount: number;
    perMember: number;
    review?: { tr: string; en: string };
    bestSongId?: number;
    songScores?: { id: number; score: number }[];
    legendary?: boolean;
    /** Neden böyle geçti: etkenlerin kaba değerlendirmesi */
    factors?: GigFactors;
    /** Sıradaki adım önerileri (en zayıf etkenler) */
    advice?: GigFactorId[];
    /** Konserden sonra o şehirdeki şöhret (sıradaki sahneye ne kaldığını göstermek için; VIP değilse kaba) */
    fame?: number;
    /** Setlist sırasının etkisi (VIP olmayanlara işareti) */
    flow?: number;
    events?: { id: string; outcome: StageEventOutcome; by: number | null }[];
    encore?: EncoreOutcome;
  } | null;
  /** Performans planı (sahne olayları ve bis) */
  plan?: { events?: string[]; encore?: EncorePlan };
  /** Normal üyelerde rapor süresi dolduysa true (VIP'te hiç dolmaz) */
  reportExpired?: boolean;
}

export interface BandDetailDto {
  id: number;
  name: string;
  genre: Genre;
  leaderId: number;
  createdAt: string;
  members: BandMemberDto[];
  songs: SongDto[];
  fame: Record<string, number>; // şehir id → şöhret (0–100)
  /** şehir id → basın desteği (0–100, nötr 20; listede olmayan şehir nötr) */
  press: Record<string, number>;
  upcomingGigs: GigDto[];
  pastGigs: GigDto[];
  pendingInvites: { id: number; characterId: number; name: string }[];
  releases: ReleaseDto[];
  /** Bir sonraki single / albüm en erken ne zaman yayınlanabilir */
  nextReleaseAt: { single: string | null; album: string | null };
}

export interface PublicBandDto {
  id: number;
  name: string;
  genre: Genre;
  createdAt: string;
  members: { characterId: number; name: string; avatarColor: string; avatarUrl?: string | null; role: Instrument; isLeader: boolean }[];
  /** Oyunun kendi grubu mu */
  npc: boolean;
  fame: Record<string, number>;
  totalFame: number;
  pastGigs: GigDto[];
  releases: ReleaseDto[];
}

export interface PublicCharacterDto {
  id: number;
  name: string;
  avatarColor: string;
  mainInstrument: Instrument;
  cityId: string | null;
  bio: string;
  /** Seçili ünvan (content/rewards.ts TITLES) */
  titleId?: string | null;
  createdAt: string;
  band: { id: number; name: string; role: Instrument } | null;
  topSkills: { skill: string; level: number }[];
  isVip: boolean;
  profession: { id: string; rank: number } | null;
  offices: { cityId: string; office: string }[];
  achievementPoints: number;
  achievements: { id: string; unlockedAt: string }[];
  /** Şu an cezaevinde mi */
  jailed: boolean;
  headline: string;
  avatarUrl: string | null;
  /** Oyunun kendi müzisyeni mi */
  npc: boolean;
  home: { homeId: HomeId; cityId: string } | null;
  convictions: number;
  partner: { characterId: number; name: string; stage: 'engaged' | 'married' } | null;
  children: {
    id?: number;
    name: string;
    bornAt: string;
    age?: number;
    stage?: 'baby' | 'child' | 'teen' | 'adult';
    /** Mirasçı olarak oynanabilir karakter olduysa kimliği */
    characterId?: number | null;
  }[];
  /** Oynanıyor, emekli (mirasını devretti) ya da öldü */
  status?: CharacterStatus;
  /** Soy ağacı (nesiller) */
  lineage?: LineageDto;
  tattoos: string[];
  friendsCount: number;
}

export interface InviteDto {
  id: number;
  bandId: number;
  bandName: string;
  genre: Genre;
  role: Instrument;
  createdAt: string;
}

export interface CityResponse {
  cityId: string;
  playersHere: number;
  upcomingGigs: GigDto[];
  topBands: { id: number; name: string; genre: Genre; fame: number }[];
  /** Şehirdeki oyuncu işletmeleri (sahibi olan ruhsatlar) */
  businesses: { locationId: string; name: string; ownerName: string }[];
}

export interface ChatMessageDto {
  id: number;
  channel: string;
  characterId: number;
  name: string;
  avatarColor: string;
  avatarUrl?: string | null;
  text: string;
  createdAt: string;
}

export interface NotificationDto {
  id: number;
  kind: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface LeaderboardResponse {
  cityId: string | null;
  bands: { id: number; name: string; genre: Genre; fame: number; members: number; npc?: boolean }[];
}

// ---------- İstek gövdeleri ----------

export type StartActionRequest =
  | { kind: 'study'; skill: string; hours: number; locationId?: string }
  /** Özel ders: profesör (okul/üniversite mekânında), oyuncu öğretmen (tutorId, okulda) ya da arkadaş/sevgili (tutorId) */
  | { kind: 'lesson'; skill: string; hours: number; tutor: 'professor' | 'teacher' | 'friend'; locationId?: string; tutorId?: number }
  | { kind: 'work'; locationId: string; hours: number }
  | { kind: 'rest'; hours: number }
  | { kind: 'write_song'; title: string; genre: Genre; subgenre?: string | null; tempo?: Tempo }
  | { kind: 'rehearse'; songId: number; hours: number; locationId: string }
  | { kind: 'travel'; toCityId: string; mode: TravelMode }
  | { kind: 'treat'; hours: number; locationId: string }
  | { kind: 'busk'; role: Instrument; hours: number; locationId: string }
  | { kind: 'record'; songId: number; locationId: string; producer?: ProducerTier | null }
  | { kind: 'video'; songId: number; locationId: string; director?: VideoDirector }
  | { kind: 'crime'; crime: string; locationId: string }
  | { kind: 'investigate'; locationId: string }
  | { kind: 'workout'; hours: number; locationId: string }
  | { kind: 'craft'; recipe: string; locationId: string }
  | { kind: 'press'; mode: PressMode; locationId: string }
  | { kind: 'write_article'; locationId: string; title: string; body: string; bandId?: number | null; tone?: ArticleTone };

export interface ElectionDto {
  id: number;
  cityId: string;
  office: string;
  endsAt: string;
  candidates: { characterId: number; name: string; avatarColor: string; platform: string; votes: number | null }[];
  myVote: number | null;
  amCandidate: boolean;
}

export interface OfficeHolderDto {
  cityId: string;
  office: string;
  characterId: number;
  name: string;
  avatarColor: string;
  avatarUrl?: string | null;
  since: string;
  announcement: string | null;
}

export interface CivicResponse {
  cityId: string;
  holders: OfficeHolderDto[];
  elections: ElectionDto[];
}

export interface BookGigRequest {
  locationId: string;
  inHours: number;
  setlist: number[];
  /** Kiralık müzisyenle doldurulacak roller */
  sessionRoles?: Instrument[];
  /** Konserde kullanılacak sahne efektleri (envanter satırları; konserde tüketilir) */
  effects?: number[];
  /** Performans planı: en fazla 3 sahne olayı ve bis kararı */
  plan?: { events?: string[]; encore?: EncorePlan };
}

export interface InventoryItemDto {
  id: number; // envanter satırı
  itemId: string; // katalog kimliği (ITEM_BY_ID)
  equipped: boolean;
  acquiredAt: string;
  color: PaintColor | null;
  nickname: string | null;
  /** Geçerli bonus (üretilen eşyalarda üretime göre) */
  bonus: number;
  /** Yıpranma (0–100): enstrüman bonusunu düşürür, araçta arıza riskini artırır */
  wear: number;
  /** İkinci el pazarında satışta */
  listed: boolean;
  craftedBy: string | null;
  /** EFSANEVİ bir gecede çalındı: kalıcı bonus ve "Efsanevi" ünvanı */
  legendary: { gigId: number | null; bandName: string | null; at: string } | null;
}

export interface GigEstimateResponse {
  locationId: string;
  min: number;
  max: number;
  capacity: number;
}

// ---------- Kayıt ve listeler ----------

export interface ReleaseDto {
  id: number;
  bandId: number;
  bandName: string;
  kind: 'single' | 'album';
  title: string;
  songs: { id: number; title: string; quality: number }[];
  quality: number;
  releasedAt: string;
  weeksOnSale: number;
  totalUnits: number;
  totalRevenue: number;
  /** Son haftanın satışı (henüz hafta kapanmadıysa null) */
  lastWeekUnits: number | null;
  bestPosition: number | null;
}

export interface ChartEntryDto {
  position: number;
  releaseId: number;
  title: string;
  bandId: number;
  bandName: string;
  units: number;
  /** Bir önceki haftadaki sırası (yoksa null = yeni giriş) */
  lastPosition: number | null;
}

export interface ChartResponse {
  weekId: number | null;
  weekEndedAt: string | null;
  scope: string; // 'world' ya da şehir id
  kind: 'single' | 'album';
  entries: ChartEntryDto[];
  /** VIP üyeler geçmiş haftaları görebilir */
  weeks: { id: number; endedAt: string }[];
  nextWeekEndsAt: string | null;
}

// ---------- Suç ve adalet ----------

export interface CrimeOptionDto {
  id: string;
  /** Başarı şansı (VIP olmayanlara kaba değer) */
  chance: number;
  loot: [number, number];
  sentenceHours: number;
  hours: number;
  blocked: string | null; // gereken beceri eksikse hata kodu
}

export interface CrimeOptionsResponse {
  locationId: string;
  policeOnDuty: number;
  options: CrimeOptionDto[];
}

export interface CaseDto {
  id: number;
  cityId: string;
  crime: string;
  suspectId: number;
  suspectName: string;
  status: 'pending' | 'convicted' | 'acquitted';
  arrestedBy: string | null;
  judgeName: string | null;
  sentenceHours: number | null;
  createdAt: string;
  dueAt: string;
  decidedAt: string | null;
}

export interface JusticeResponse {
  cityId: string;
  unsolvedCount: number;
  policeOnDuty: number;
  pendingCases: CaseDto[];
  recentCases: CaseDto[];
  inmates: { characterId: number; name: string; avatarColor: string; until: string; inCustody: boolean }[];
}

// ---------- Rehber görevler ----------

export interface TutorialResponse {
  steps: { id: string; done: boolean; claimed: boolean }[];
  /** Sıradaki adım: ödülü hazır olan ilk adım, yoksa ödülü alınmamış ilk adım; hepsi bittiyse null */
  current: string | null;
  /** Sıradaki büyük hedef (rehber bitince ya da gizlenince gösterilir) */
  next: NextGoal | null;
}

// ---------- Başarımlar ----------

export interface AchievementsResponse {
  points: number;
  unlocked: { id: string; unlockedAt: string }[];
}

// ---------- Sosyal ----------

export interface PersonDto {
  characterId: number;
  name: string;
  avatarColor: string;
  avatarUrl: string | null;
  cityId: string | null;
}

export interface ConversationDto extends PersonDto {
  lastText: string;
  lastAt: string;
  lastMine: boolean;
  unread: number;
}

export interface DirectMessageDto {
  id: number;
  mine: boolean;
  text: string;
  createdAt: string;
}

export interface FriendDto extends PersonDto {
  friendship: number;
  romance: number;
  stage: RelationStage;
}

export interface FriendsResponse {
  friends: FriendDto[];
  incoming: PersonDto[];
  outgoing: PersonDto[];
}

/** İki oyuncu arasındaki ilişki (bakan kişinin gözünden) */
export interface RelationshipDto {
  characterId: number;
  friends: boolean;
  friendRequest: 'incoming' | 'outgoing' | null;
  friendship: number;
  romance: number;
  stage: RelationStage;
  /** İki taraf da flört etti mi */
  mutualFlirt: boolean;
  iFlirted: boolean;
  proposal: 'incoming' | 'outgoing' | null;
  adoption: { by: 'me' | 'them'; name: string } | null;
  blocked: boolean;
  blockedMe: boolean;
  sameCity: boolean;
  /** Bir sonraki etkileşimin yapılabileceği zaman (bekleme yoksa null) */
  next: { hangout: string | null; flirt: string | null; date: string | null };
  /** Bu kişiyle değil başkasıyla nişanlı/evli mi (bakan ya da bakılan) */
  takenElsewhere: boolean;
}

export interface GuestbookEntryDto {
  id: number;
  author: PersonDto;
  text: string;
  createdAt: string;
  canDelete: boolean;
}

// ---------- Pazar ----------

export interface ListingDto {
  id: number;
  itemId: string;
  price: number;
  seller: { characterId: number; name: string };
  color: PaintColor | null;
  nickname: string | null;
  bonus: number;
  craftedBy: string | null;
  legendary: boolean;
  createdAt: string;
  mine: boolean;
}

// ---------- İşletmeler ----------

export interface BusinessDto {
  locationId: string;
  kind: BusinessType;
  /** Satılık mı (sahibi yoksa) ve ruhsat fiyatı */
  forSale: boolean;
  price: number;
  name: string;
  owner: { characterId: number; name: string } | null;
  gigShare: number;
  menuMult: number;
  isOwner: boolean;
  /** Bakan kişi burada çalışıyor mu, iş teklifi mi var */
  staffStatus: 'hired' | 'offered' | null;
  myWage: number | null;
  /** Sadece sahibine */
  till: number | null;
  upkeep: number;
  upkeepDue: string | null;
  totalRevenue: number | null;
  staff: { characterId: number; name: string; wage: number; status: 'hired' | 'offered' }[] | null;
  log: { kind: string; amount: number; name: string | null; createdAt: string }[] | null;
}

// ---------- Festivaller ----------

export interface FestivalDto {
  id: number;
  countryCode: string;
  cityId: string;
  applyUntil: string;
  startsAt: string;
  status: 'open' | 'scheduled' | 'done';
  lineup: { bandId: number; bandName: string; fame: number; selected: boolean; slot: number | null; npc: boolean }[];
  myBandApplied: boolean;
}

// ---------- Haftalık görevler ----------

export interface MissionsResponse {
  weekId: number | null;
  endsAt: string | null;
  missions: { id: string; progress: number; target: number; reward: number; claimed: boolean }[];
}

// ---------- Moodlet'ler ----------

export interface MoodletDto {
  id: string;
  /** Ruh hâline etkisi */
  effect: number;
  /** Bitiş zamanı; durumdan doğanlarda null */
  endsAt: string | null;
}

// ---------- Takas ----------

export interface TradeItemDto {
  id: number;
  itemId: string;
  color: PaintColor | null;
  nickname: string | null;
  bonus: number;
  legendary: boolean;
}

export interface TradeDto {
  id: number;
  /** Teklifi yapan ve alan */
  from: PersonDto;
  to: PersonDto;
  /** Bakan kişi teklifi yapan mı */
  mine: boolean;
  give: TradeItemDto[];
  want: TradeItemDto[];
  giveMoney: number;
  wantMoney: number;
  note: string;
  status: 'open' | 'accepted' | 'declined' | 'cancelled' | 'failed';
  createdAt: string;
  closedAt: string | null;
}

export interface TradesResponse {
  incoming: TradeDto[];
  outgoing: TradeDto[];
  history: TradeDto[];
}
