// Kullanım: npm run make-admin -w server -- eposta@ornek.com
// Docker'da: docker compose exec api node dist/make-admin.js eposta@ornek.com
import { pool } from './db';

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error('Kullanım: make-admin <e-posta>');
  process.exit(1);
}
const r = await pool.query('UPDATE users SET is_admin = TRUE WHERE email = $1 RETURNING id', [email]);
console.log(r.rowCount ? `${email} artık yönetici.` : `${email} bulunamadı. Önce uygulamadan kayıt olmalı.`);
await pool.end();
