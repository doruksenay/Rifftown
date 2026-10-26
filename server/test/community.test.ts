// Topluluk: blog, şehir panosu, haftalık dergi; küfür filtresi, engelleme, şikâyet ve yönetici kaldırması
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { pool } from '../src/db';
import { newPlayer, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(async () => {
  await teardown();
  await pool.end();
});

const q = (sql: string, params: unknown[] = []) => pool.query(sql, params);
async function slow<T>(fn: () => Promise<T>): Promise<T> {
  const prev = config.gameSpeed;
  config.gameSpeed = 3600;
  try {
    return await fn();
  } finally {
    config.gameSpeed = prev;
  }
}
const body = 'Bu hafta şehirdeki konserler harikaydı, özellikle kulüpteki gece unutulmazdı.';

describe('blog ve pano', () => {
  it('blog yazılır, küfür yıldızlanır, bekleme süresi var, profilde görünür, yazar silebilir', () =>
    slow(async () => {
      const a = await newPlayer();
      const b = await newPlayer();
      expect((await a.c.post('/api/blog', { title: 'x', body })).body.error).toBe('invalid_title');
      expect((await a.c.post('/api/blog', { title: 'Merhaba', body: 'kısa' })).body.error).toBe('invalid_body');
      const ok = await a.c.post('/api/blog', { title: 'Merhaba siktir', body });
      expect(ok.status).toBe(200);
      expect((await a.c.post('/api/blog', { title: 'İkinci yazı', body })).status).toBe(429);
      const posts = (await b.c.get(`/api/characters/${a.character.id}/blog`)).body.posts;
      expect(posts[0].title).toContain('******');
      expect((await b.c.get('/api/cities/istanbul/news?kind=blog')).body.articles.some((x: any) => x.id === ok.body.id)).toBe(true);
      // Başkası silemez, yazar siler
      expect((await b.c.del(`/api/posts/${ok.body.id}`)).status).toBe(403);
      expect((await a.c.del(`/api/posts/${ok.body.id}`)).status).toBe(200);
      expect((await b.c.get(`/api/characters/${a.character.id}/blog`)).body.posts).toHaveLength(0);
    }));

  it('pano: yalnızca o şehirde, bekleme süreli, engellenen görünmez, şikâyet ve yönetici kaldırması', () =>
    slow(async () => {
      const a = await newPlayer();
      const b = await newPlayer({ cityId: 'ankara' });
      expect((await b.c.post('/api/cities/istanbul/board', { text: 'selam' })).body.error).toBe('not_in_city');
      const n = await a.c.post('/api/cities/istanbul/board', { text: 'Bu akşam barda jam var, gelin!' });
      expect(n.status).toBe(200);
      expect((await a.c.post('/api/cities/istanbul/board', { text: 'tekrar' })).status).toBe(429);
      const reader = await newPlayer();
      expect((await reader.c.get('/api/cities/istanbul/news?kind=board')).body.articles.some((x: any) => x.id === n.body.id)).toBe(true);
      await reader.c.post(`/api/blocks/${a.character.id}`);
      expect((await reader.c.get('/api/cities/istanbul/news?kind=board')).body.articles.some((x: any) => x.id === n.body.id)).toBe(false);
      // Şikâyet aynı kişiden bir kez kuyruğa girer
      const other = await newPlayer();
      await other.c.post('/api/reports', { kind: 'article', targetId: n.body.id, text: 'spam' });
      await other.c.post('/api/reports', { kind: 'article', targetId: n.body.id, text: 'spam' });
      expect((await q(`SELECT count(*)::int AS n FROM reports WHERE kind = 'article' AND target_id = $1`, [n.body.id])).rows[0].n).toBe(1);
      const admin = await newPlayer();
      await q('UPDATE users SET is_admin = TRUE WHERE id = $1', [admin.userId]);
      expect((await admin.c.get('/api/admin/articles')).body.articles.some((x: any) => Number(x.id) === n.body.id)).toBe(true);
      expect((await admin.c.del(`/api/admin/articles/${n.body.id}`)).status).toBe(200);
      expect((await other.c.get('/api/cities/istanbul/news?kind=board')).body.articles.some((x: any) => x.id === n.body.id)).toBe(false);
      // Yönetici olmayan panel uçlarına erişemez
      expect((await other.c.get('/api/admin/articles')).status).toBe(403);
    }));

  it('dergi son kapanan haftanın haberlerinden derlenir; haber yazarı habersini kendisi silemez', async () => {
    const j = await newPlayer();
    await q(`UPDATE characters SET profession = 'journalist' WHERE id = $1`, [j.character.id]);
    const week = (await q(`INSERT INTO chart_weeks(starts_at, ends_at, status) VALUES (now() - interval '1 hour', now() + interval '1 hour', 'closed') RETURNING id`)).rows[0];
    const a = (await q(`INSERT INTO articles(author_id, city_id, kind, tone, title, body, impact) VALUES ($1, 'istanbul', 'news', 'positive', 'Haftanın grubu', $2, 3) RETURNING id`, [j.character.id, body])).rows[0];
    const reader = await newPlayer();
    const mag = (await reader.c.get('/api/cities/istanbul/magazine')).body;
    expect(mag.articles.some((x: any) => x.id === Number(a.id))).toBe(true);
    expect((await j.c.del(`/api/posts/${a.id}`)).status).toBe(403);
    await q('DELETE FROM chart_weeks WHERE id = $1', [week.id]);
  });
});
