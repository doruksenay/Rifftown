import { buildApp } from './app';
import { config } from './config';
import { pool } from './db';
import { migrate } from './migrate';
import { startWorker } from './worker';

// API sunucusu. RUN_WORKER=1 ise zamanlayıcıyı da aynı süreçte çalıştırır
// (tek sunuculu küçük kurulumlar için pratik).
await migrate(pool);
const app = await buildApp();
await app.listen({ port: config.port, host: config.host });
app.log.info(`Rifftown API hazır · oyun hızı x${config.gameSpeed}`);

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
