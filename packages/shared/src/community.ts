// Topluluk katmanı: oyuncuların yazdığı blog yazıları ve şehir panosu; gazetecilerin haberlerinden derlenen haftalık dergi.
// Hepsi aynı moderasyondan geçer: küfür filtresi (yıldızlama), engelleme (akışta görünmez), şikâyet, yönetim panelinden kaldırma.

export const BLOG_TITLE_MAX = 80;
export const BLOG_BODY_MIN = 20;
export const BLOG_BODY_MAX = 3000;
/** Bir oyuncu bu kadar oyun saatinde bir blog yazısı yayınlayabilir */
export const BLOG_COOLDOWN_HOURS = 12;

export const BOARD_MAX = 280;
/** Şehir panosuna bu kadar oyun saatinde bir not bırakılabilir */
export const BOARD_COOLDOWN_HOURS = 1;
/** Panoda bir notun kalacağı süre (oyun günü) */
export const BOARD_DAYS = 7;

/** Dergide bir sayıya giren en fazla haber */
export const MAGAZINE_SIZE = 10;
