import { config } from './config';
import { createPool, pool } from './db';
import { migrate } from './migrate';
import { startWorker } from './worker';

// Güncellemeler doğrudan bağlantıyla (Neon: DATABASE_URL_UNPOOLED)
const migrationPool = createPool(config.migrationUrl);
await migrate(migrationPool);
await migrationPool.end();
console.log(`Rifftown zamanlayıcısı çalışıyor · her ${config.workerIntervalMs} ms · oyun hızı x${config.gameSpeed}`);
const stop = startWorker(config.workerIntervalMs);

const shutdown = async () => {
  stop();
  await pool.end();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
