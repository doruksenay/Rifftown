// Tempo: oyunun takvimi tek yerde. Bütün süreler OYUN GÜNÜ cinsindendir; gerçek süreye GAME_SPEED ile çevrilir
// (gerçek ms = oyun saati × 3.600.000 ÷ GAME_SPEED). GAME_SPEED'in anlamı değişmez: 1 gerçek zamanlı oyundur.
// Bu dosyadaki sayıları değiştirmek, listeleri, yayın beklemelerini, satış eğrisini ve haftalık işleri birlikte ölçekler.
// Seçilen değerlerin gerekçesi GAME_DESIGN.md "Tempo" bölümünde.

/** Gün başına ölçülen bir eğriyi (düşüş, taban satış) liste haftasına çeviren yardımcılar */
const perWeek = (perDay: number, weekDays: number) => perDay * weekDays;
const decayPerWeek = (perDay: number, weekDays: number) => Math.pow(perDay, weekDays);

export const PACING = {
  /** Liste haftası: satışlar, listeler ve haftalık görevler bu ritimle döner (Popmundo: 7 gün) */
  chartWeekDays: 7,
  /** Aynı türde iki yayın arası bekleme (Popmundo rehberleri: single ~28, albüm ~112 gün) */
  singleCooldownDays: 28,
  albumCooldownDays: 112,
  /** Yayının satışta kaldığı süre (oyun günü); bekleme süresinden uzun olduğu için yayınlar listede üst üste biner */
  singleSaleDays: 112,
  albumSaleDays: 224,
  /** Satışın günlük düşüşü ve ilk günlerdeki günlük taban satış (şöhret %100, kalite 70, bir şehir) */
  singleDecayPerDay: 0.9755,
  albumDecayPerDay: 0.9863,
  singleBasePerDay: 57,
  albumBasePerDay: 24.5,
  /** İki festival arası ve başvuru süresi */
  festivalEveryDays: 14,
  festivalApplyDays: 4,
  /** Seçim dönemi */
  electionDays: 7,
  /** Kira, işletme gideri ve banka faizi dönemi */
  rentPeriodDays: 7,
  upkeepPeriodDays: 7,
  interestPeriodDays: 7,
} as const;

/** Liste sırası ödülleri 7 günlük haftaya göre tanımlıdır; hafta kısalırsa orantılı küçülür */
export const CHART_FAME_WEEK_SCALE = PACING.chartWeekDays / 7;

/** Liste haftası cinsinden satış kuralları (music.ts bu değerleri kullanır) */
export const SALES_PACE = {
  single: {
    weeks: Math.round(PACING.singleSaleDays / PACING.chartWeekDays),
    decay: Math.round(decayPerWeek(PACING.singleDecayPerDay, PACING.chartWeekDays) * 1000) / 1000,
    base: Math.round(perWeek(PACING.singleBasePerDay, PACING.chartWeekDays)),
  },
  album: {
    weeks: Math.round(PACING.albumSaleDays / PACING.chartWeekDays),
    decay: Math.round(decayPerWeek(PACING.albumDecayPerDay, PACING.chartWeekDays) * 1000) / 1000,
    base: Math.round(perWeek(PACING.albumBasePerDay, PACING.chartWeekDays)),
  },
} as const;
