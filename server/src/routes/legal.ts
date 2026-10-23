// Kullanım şartları ve gizlilik politikası: mağaza kayıtlarında ve uygulamada bağlantısı verilen herkese açık sayfalar.
// Metinler server/legal/*.md dosyalarındadır; {{CONTACT_EMAIL}} yer tutucusu ortam değişkeniyle doldurulur.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { FastifyInstance } from 'fastify';
import { config } from '../config';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Çok küçük bir Markdown çevirici: başlık, liste, kalın, eğik, yatay çizgi, paragraf */
export function renderMarkdown(md: string): string {
  const inline = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  const out: string[] = [];
  let list = false;
  for (const raw of md.split('\n')) {
    const line = raw.trimEnd();
    if (line.startsWith('- ')) {
      if (!list) out.push('<ul>');
      list = true;
      out.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }
    if (list) {
      out.push('</ul>');
      list = false;
    }
    if (!line) continue;
    if (line === '---') out.push('<hr>');
    else if (line.startsWith('## ')) out.push(`<h2>${inline(line.slice(3))}</h2>`);
    else if (line.startsWith('# ')) out.push(`<h1>${inline(line.slice(2))}</h1>`);
    else out.push(`<p>${inline(line)}</p>`);
  }
  if (list) out.push('</ul>');
  return out.join('\n');
}

const page = (title: string, body: string) => `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:720px;margin:0 auto;padding:24px 16px;color:#1A0E4B;background:#F8F9FF}a{color:#2563EB}
h1{font-size:28px}h2{font-size:20px;margin-top:28px}hr{margin:40px 0;border:0;border-top:1px solid #E4E1F3}
@media (prefers-color-scheme: dark){body{color:#F8F9FF;background:#110933}a{color:#00E5FF}}</style></head><body>${body}</body></html>`;

const DOCS: Record<string, string> = { terms: 'Kullanım Şartları', privacy: 'Gizlilik Politikası' };

export async function legalPages(app: FastifyInstance) {
  for (const [slug, title] of Object.entries(DOCS)) {
    app.get(`/legal/${slug}`, async (_req, reply) => {
      let md = '';
      try {
        md = readFileSync(join(process.cwd(), 'legal', `${slug}.md`), 'utf8');
      } catch {
        return reply.status(404).send('not found');
      }
      const html = renderMarkdown(md.replaceAll('{{CONTACT_EMAIL}}', config.contactEmail));
      return reply.type('text/html; charset=utf-8').send(page(title, html));
    });
  }
}
