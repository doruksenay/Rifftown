// Denge ölçümlerinin hepsini çalıştırır: `npm run balance`
// Ortam: BALANCE_SEEDS (varsayılan 20), BALANCE_DBS (varsayılan rifftown_sim,rifftown_sim2), BALANCE_ONLY (virgülle iş adları)
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const SEEDS = Number(process.env.BALANCE_SEEDS ?? 20);
const DBS = (process.env.BALANCE_DBS ?? 'rifftown_sim,rifftown_sim2').split(',');
const ONLY = process.env.BALANCE_ONLY ? new Set(process.env.BALANCE_ONLY.split(',')) : null;
/** BALANCE_RESUME=1: çıktısı zaten olan tohumları atla (yarıda kalan bir çalıştırmayı sürdürmek için) */
const RESUME = process.env.BALANCE_RESUME === '1';
for (const db of DBS) if (/^rifftown(_test)?$/.test(db)) throw new Error(`${db} kullanılamaz`);

interface Job {
  name: string;
  args: string[];
  db: boolean;
}
const jobs: Job[] = [];
const add = (group: string, name: string, args: string[], db = true) => {
  if (ONLY && !ONLY.has(group)) return;
  const m = /^(economy|career|npcworld)-(\d+)$/.exec(name);
  if (RESUME && m && fs.existsSync(`scripts/balance/out/${m[1]}-seed-${m[2]}.json`)) return;
  jobs.push({ name, args, db });
};
// Veritabanı gerektirmeyen Monte Carlo ve formül ölçümleri
add('mc', 'mc-gigs', ['scripts/balance/mc-gigs.ts'], false);
add('mc', 'mc-family', ['scripts/balance/mc-family.ts'], false);
add('mc', 'mc-skills', ['scripts/balance/mc-skills.ts'], false);
add('mc', 'mc-releases', ['scripts/balance/mc-releases.ts'], false);
add('mc', 'texts', ['scripts/balance/texts.ts'], false);
// Sunucuyla bot simülasyonları
for (let s = 1; s <= SEEDS; s++) add('economy', `economy-${s}`, ['scripts/balance/sim-economy.ts', String(s), '30', 'economy']);
for (let s = 1; s <= SEEDS; s++) add('career', `career-${s}`, ['scripts/balance/sim-economy.ts', String(s), '90', 'career']);
for (let s = 1; s <= SEEDS; s++) add('npcworld', `npcworld-${s}`, ['scripts/balance/npc-world.ts', String(s), '60', '2']);
add('exploits', 'exploits', ['scripts/balance/exploits/run-all.ts']);
add('aggregate', 'aggregate', ['scripts/balance/aggregate.ts'], false);

fs.mkdirSync('scripts/balance/out/logs', { recursive: true });
const run = (job: Job, db: string) =>
  new Promise<number>((resolve) => {
    const t0 = Date.now();
    const log = fs.createWriteStream(`scripts/balance/out/logs/${job.name}.log`);
    const p = spawn(process.execPath, ['--import', 'tsx', ...job.args], { env: { ...process.env, BALANCE_DB: db }, stdio: ['ignore', 'pipe', 'pipe'] });
    p.stdout.pipe(log);
    p.stderr.pipe(log);
    p.on('exit', (code) => {
      console.log(`${code === 0 ? 'tamam' : 'HATA ' + code}  ${job.name}  (${db}, ${Math.round((Date.now() - t0) / 1000)} sn)`);
      resolve(code ?? 1);
    });
  });

const dbJobs = jobs.filter((j) => j.db && j.name !== 'exploits');
const free = jobs.filter((j) => !j.db && j.name !== 'aggregate');
const exploit = jobs.find((j) => j.name === 'exploits');
const aggregate = jobs.find((j) => j.name === 'aggregate');
let failed = 0;
await Promise.all(free.map((j) => run(j, 'none').then((c) => (failed += c ? 1 : 0))));
await Promise.all(
  DBS.map(async (db) => {
    for (let j = dbJobs.shift(); j; j = dbJobs.shift()) failed += (await run(j, db)) ? 1 : 0;
  }),
);
if (exploit) failed += (await run(exploit, DBS[0])) ? 1 : 0;
if (aggregate) failed += (await run(aggregate, 'none')) ? 1 : 0;
console.log(failed ? `${failed} iş başarısız (out/logs)` : 'bütün ölçümler bitti: scripts/balance/out/summary.json');
process.exit(failed ? 1 : 0);
