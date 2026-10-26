// Ortam değişkenlerinden okunan ayarlar.

const num = (v: string | undefined, d: number) => (v && !Number.isNaN(Number(v)) ? Number(v) : d);

export const config = {
  /** Uygulama bağlantısı. Neon'da havuzlu (-pooler) adres önerilir. */
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres@localhost:5432/rifftown',
  /**
   * Veritabanı güncellemeleri (migration) için doğrudan bağlantı. Güncelleyici oturum düzeyinde
   * kilit (pg_advisory_lock) kullandığından PgBouncer'lı havuz adresi burada çalışmaz.
   * Neon'un DATABASE_URL_UNPOOLED değişkeni; yoksa DATABASE_URL.
   */
  migrationUrl: process.env.DATABASE_URL_UNPOOLED ?? process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? 'postgres://postgres@localhost:5432/rifftown',
  /** Bağlantı havuzunun en fazla bağlantı sayısı */
  poolMax: num(process.env.PG_POOL_MAX, 10),
  /** Kayıt olunca kendiliğinden yönetici yapılacak e-postalar (virgülle). Komut satırı olmayan barındırmalar için. */
  adminEmails: (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  port: num(process.env.PORT, 3000),
  host: process.env.HOST ?? '0.0.0.0',
  /** 1 = gerçek zaman. Geliştirmede 60 → 1 oyun saati 1 dakika sürer. */
  gameSpeed: num(process.env.GAME_SPEED, 1),
  /** Zamanlayıcının kaç milisaniyede bir vadesi gelen işleri kontrol edeceği */
  workerIntervalMs: num(process.env.WORKER_INTERVAL_MS, 2000),
  /** Expo push servisi için isteğe bağlı erişim anahtarı */
  expoAccessToken: process.env.EXPO_ACCESS_TOKEN ?? '',
  /** Push bildirimlerini kapatmak için (testlerde) */
  pushEnabled: process.env.PUSH_ENABLED !== '0',
  migrationsDir: process.env.MIGRATIONS_DIR ?? 'migrations',
  version: '0.1.0',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  /** İstek sınırlaması (testlerde kapatılır) */
  rateLimit: process.env.RATE_LIMIT !== '0',
  /** Aynı IP adresinden 24 saatte açılabilecek hesap sayısı (0 = sınırsız; testlerde kapalı) */
  registerPerIpDay: num(process.env.REGISTER_PER_IP_DAY, 3),
  /** Yeni hesapların pazar/takas/hediye kapısı (oyun saati). Boşsa NEW_ACCOUNT_TRADE_HOURS. */
  tradeMinAccountHours: num(process.env.TRADE_MIN_ACCOUNT_HOURS, 72),
  /** RevenueCat webhook'u için gizli anahtar (boşsa mağaza bağlantısı kapalıdır) */
  /** Oyunun kendi grupları (testlerde kapatılır) */
  npcEnabled: process.env.NPC !== '0',
  /** Kullanım şartları, gizlilik politikası ve uygulamada gösterilen iletişim adresi */
  contactEmail: process.env.CONTACT_EMAIL ?? 'destek@ornek.com',
  revenuecatSecret: process.env.REVENUECAT_WEBHOOK_SECRET ?? '',
};
