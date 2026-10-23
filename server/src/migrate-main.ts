import { config } from './config';
import { createPool } from './db';
import { migrate } from './migrate';

// Doğrudan bağlantıyla (Neon'da DATABASE_URL_UNPOOLED): güncelleyici oturum kilidi kullanır
const pool = createPool(config.migrationUrl);
await migrate(pool);
console.log('Veritabanı güncel.');
await pool.end();
