// Denge simülasyonunun ortamı. Bu dosya her şeyden ÖNCE içe aktarılmalı: sunucunun config.ts'i ortam
// değişkenlerini içe aktarıldığı anda okur, Date ve Math.random da sunucu modülleri yüklenmeden değişmeli.
//
// Sanal saat: Node tarafında Date (argümansız new Date() ve Date.now()) ve veritabanı tarafında now()
// (public.now(), search_path = public, pg_catalog sayesinde pg_catalog.now()'ı gölgeler) aynı sanal
// zamanı gösterir. Böylece GAME_SPEED=1 (gerçek oyun hızı) ile 30 oyun günü saniyeler içinde, tamamen
// deterministik biçimde geçer. Oyun kuralları değişmez; yalnızca saat bizim elimizdedir.

const DB = process.env.BALANCE_DB ?? 'rifftown_sim';
if (DB === 'rifftown_test' || DB === 'rifftown') throw new Error('Denge simülasyonu rifftown_test/rifftown veritabanını kullanamaz');
process.env.DATABASE_URL = `postgres://postgres@localhost:5432/${DB}`;
process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;
// Gerçek oyun hızı: 1 oyun saati = 1 sanal saat
process.env.GAME_SPEED = '1';
process.env.PUSH_ENABLED = '0';
process.env.RATE_LIMIT = '0';
process.env.LOG_LEVEL = 'silent';
// Varsayılan değerler: DECAY, AGING, TRADE_MIN_ACCOUNT_HOURS (72) açık bırakılır.
// Kayıt sınırı (aynı IP'den günde 3) inject isteklerinde IP 127.0.0.1 olduğu için botları kısıtlardı;
// sömürü betikleri bunu ayrıca ve açıkça ele alır.
process.env.REGISTER_PER_IP_DAY = process.env.REGISTER_PER_IP_DAY ?? '0';
if (!process.env.NPC) process.env.NPC = '1';

const RealDate = Date;
/** Sanal başlangıç: sabit bir an (deterministik) */
export const SIM_EPOCH = RealDate.UTC(2027, 0, 4, 8, 0, 0);
let nowMs = SIM_EPOCH;

class SimDate extends RealDate {
  constructor(...args: any[]) {
    if (args.length === 0) super(nowMs);
    // @ts-ignore: Date'in aşırı yüklemeleri
    else super(...args);
  }
  static now() {
    return nowMs;
  }
}
(globalThis as any).Date = SimDate;

export const clock = {
  now: () => nowMs,
  set(ms: number) {
    nowMs = ms;
  },
  hours: () => (nowMs - SIM_EPOCH) / 3_600_000,
};

/** Tohumlu rastgelelik (mulberry32). Math.random'un yerine geçer. */
export function seedRandom(seed: number) {
  let a = seed >>> 0;
  Math.random = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Bağımsız, tohumlu bir üreteç (Monte Carlo için) */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DB_NAME = DB;
