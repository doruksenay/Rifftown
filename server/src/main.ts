import { buildApp } from './app';
import { config } from './config';
import { createPool, pool } from './db';
import { migrate } from './migrate';
import { startWorker } from './worker';

// API sunucusu. RUN_WORKER=1 ise zamanlayıcıyı da aynı süreçte çalıştırır
// (tek sunuculu küçük kurulumlar için pratik).
// Güncellemeler doğrudan bağlantıyla (oturum kilidi gerekir), oyun trafiği havuzlu bağlantıyla
const migrationPool = createPool(config.migrationUrl);
await migrate(migrationPool);
await migrationPool.end();
const app = await buildApp();
await app.listen({ port: config.port, host: config.host });
app.log.info(`Rifftown API hazır · oyun hızı x${config.gameSpeed}`);
if (config.adminEmails.length && !config.adminClaimSecret) {
  // Eskiden ADMIN_EMAILS adresiyle ilk kayıt olan kendiliğinden yönetici oluyordu (e-posta doğrulaması yok)
  app.log.info('ADMIN_EMAILS artık kendiliğinden yönetici yapmaz: make-admin komutu ya da ADMIN_CLAIM_SECRET ile /api/auth/claim-admin');
}

let stopWorker: (() => void) | null = null;
if (process.env.RUN_WORKER === '1') stopWorker = startWorker(config.workerIntervalMs, (m) => app.log.info(m));

const shutdown = async () => {
  stopWorker?.();
  await app.close();
  await pool.end();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
