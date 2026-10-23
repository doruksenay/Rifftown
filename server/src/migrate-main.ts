import { pool } from './db';
import { migrate } from './migrate';

await migrate(pool);
console.log('Veritabanı güncel.');
await pool.end();
