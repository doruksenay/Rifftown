// Festivaller: her ülkede düzenli aralıklarla, o ülkenin festival şehrinde yapılır (world.ts: FESTIVAL_CITIES).
// Gruplar başvurur; başvuru kapanınca festival şehrinde en ünlü gruplar sahne alır.
// Sahne sırası şöhrete göre belirlenir (en ünlü en son çıkar, "headliner").

/** İki festival arası (oyun günü) */
export const FESTIVAL_EVERY_DAYS = 14;
/** Başvuru süresi (oyun günü) ve başvuru kapandıktan sonra festivale kalan süre (oyun saati) */
export const FESTIVAL_APPLY_DAYS = 4;
export const FESTIVAL_LEAD_HOURS = 24;
/** Sahne alabilecek grup sayısı ve iki grup arasındaki süre (oyun saati) */
export const FESTIVAL_SLOTS = 6;
export const FESTIVAL_SLOT_HOURS = 2;
/** Başvurmak için festival şehrinde gereken en düşük şöhret */
export const FESTIVAL_MIN_FAME = 20;
/** Festivalde çalınan şarkı sayısı */
export const FESTIVAL_SETLIST = 6;
