// Basit yönetim paneli: istatistikler, oyuncu arama/banlama, para düzeltme, profil ve sohbet moderasyonu.
// Sunucu /admin adresinde yayınlar. Sadece is_admin işaretli hesaplar kullanabilir.

export const ADMIN_HTML = /* html */ `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rifftown Yönetim</title>
<style>
  :root { --bg:#110933; --card:#1C1150; --text:#F8F9FF; --muted:#A9A3D6; --accent:#FF2EB6; --cyan:#00E5FF; --line:#33296E; }
  * { box-sizing: border-box; }
  body { margin:0; font: 14px/1.45 system-ui, -apple-system, sans-serif; background:var(--bg); color:var(--text); }
  header { padding:16px 20px; border-bottom:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; }
  h1 { font-size:18px; margin:0; } h1 span { background:linear-gradient(90deg,var(--cyan),var(--accent),#8A2BFF); -webkit-background-clip:text; background-clip:text; color:transparent; }
  main { max-width:1100px; margin:0 auto; padding:20px; display:grid; gap:20px; }
  section { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:16px; overflow-x:auto; }
  h2 { font-size:15px; margin:0 0 12px; }
  .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:10px; }
  .stat { background:#251a5e; border-radius:8px; padding:10px; } .stat b { display:block; font-size:22px; }
  .stat small { color:var(--muted); }
  table { width:100%; border-collapse:collapse; } td, th { text-align:left; padding:6px 8px; border-bottom:1px solid var(--line); white-space:nowrap; }
  th { color:var(--muted); font-weight:500; }
  input, button { font:inherit; border-radius:6px; border:1px solid var(--line); padding:7px 10px; background:#251a5e; color:var(--text); }
  button { cursor:pointer; } button.primary { background:var(--accent); border-color:var(--accent); color:#fff; }
  .row { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
  .deleted { opacity:.4; text-decoration:line-through; }
  #login { max-width:340px; margin:80px auto; display:grid; gap:10px; }
  .err { color:#ff7b7b; min-height:1em; }
</style>
</head>
<body>
<div id="login">
  <h1><span>Rifftown</span> Yönetim</h1>
  <input id="email" type="email" placeholder="E-posta" autocomplete="username">
  <input id="password" type="password" placeholder="Şifre" autocomplete="current-password">
  <button class="primary" id="loginBtn">Giriş yap</button>
  <div class="err" id="loginErr"></div>
</div>
<div id="panel" hidden>
  <header><h1><span>Rifftown</span> Yönetim</h1><button id="logout">Çıkış</button></header>
  <main>
    <section><h2>Genel durum</h2><div class="stats" id="stats"></div></section>
    <section>
      <h2>Oyuncular</h2>
      <div class="row"><input id="q" placeholder="E-posta veya karakter adı"><button id="search">Ara</button></div>
      <table><thead><tr><th>#</th><th>E-posta</th><th>Karakter</th><th>Şehir</th><th>Para</th><th>VIP bitişi</th><th>Durum</th><th></th></tr></thead><tbody id="users"></tbody></table>
    </section>
    <section>
      <h2>Şikâyetler</h2>
      <p style="color:var(--muted);margin:0 0 12px">Oyuncuların şikâyet ettiği mesaj, defter notu ve profiller. Mağaza kuralları gereği şikâyetlere 24 saat içinde bakmak gerekir.</p>
      <table><thead><tr><th>Zaman</th><th>Tür</th><th>Şikâyet eden</th><th>Yazan</th><th>İçerik</th><th></th></tr></thead><tbody id="reports"></tbody></table>
    </section>
    <section>
      <h2>Son haberler ve yazılar</h2>
      <p style="color:var(--muted);margin:0 0 12px">Gazetecilerin haberleri, bloglar ve şehir panosu. Kaldırılan haberin basın etkisi geri alınır.</p>
      <table><thead><tr><th>Zaman</th><th>Tür</th><th>Şehir</th><th>Yazan</th><th>İçerik</th><th></th></tr></thead><tbody id="articles"></tbody></table>
    </section>
    <section>
      <h2>Son profil değişiklikleri</h2>
      <p style="color:var(--muted);margin:0 0 12px">Uygunsuz fotoğraf, başlık ya da açıklamayı buradan kaldırabilirsin.</p>
      <div id="profiles" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px"></div>
    </section>
    <section>
      <h2>Son sohbet mesajları</h2>
      <table><thead><tr><th>Zaman</th><th>Kanal</th><th>Kişi</th><th>Mesaj</th><th></th></tr></thead><tbody id="chat"></tbody></table>
    </section>
  </main>
</div>
<script>
const $ = (id) => document.getElementById(id);
let token = localStorage.getItem('rifftown_admin_token');
const STAT_LABELS = { users:'Hesap', characters:'Karakter', bands:'Grup', songs:'Şarkı', active_actions:'Süren eylem',
  scheduled_gigs:'Planlı konser', done_gigs:'Yapılan konser', active_today:'Bugün aktif', chat_today:'Bugünkü mesaj' };

async function api(path, opts = {}) {
  const r = await fetch('/api' + path, { ...opts, headers: { ...(opts.body ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: 'Bearer ' + token } : {}) } });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || r.statusText);
  return data;
}
function el(tag, text, cls) { const e = document.createElement(tag); if (text !== undefined) e.textContent = String(text); if (cls) e.className = cls; return e; }
function btn(text, fn) { const b = el('button', text); b.onclick = fn; return b; }

async function loadStats() {
  const { stats } = await api('/admin/stats');
  const box = $('stats'); box.replaceChildren();
  for (const [k, v] of Object.entries(stats)) { const d = el('div', undefined, 'stat'); d.append(el('b', v), el('small', STAT_LABELS[k] || k)); box.append(d); }
}
async function loadUsers() {
  const q = $('q').value.trim();
  const { users } = await api('/admin/users' + (q ? '?q=' + encodeURIComponent(q) : ''));
  const tb = $('users'); tb.replaceChildren();
  for (const u of users) {
    const tr = el('tr');
    tr.append(el('td', u.id), el('td', u.email), el('td', u.name || '—'), el('td', u.city_id || (u.name ? 'yolda' : '—')), el('td', u.money ?? '—'),
      el('td', u.vip_until && new Date(u.vip_until) > new Date() ? new Date(u.vip_until).toLocaleDateString('tr-TR') : '—'),
      el('td', u.banned ? 'Banlı' : (u.is_admin ? 'Yönetici' : 'Aktif')));
    const actions = el('td');
    actions.append(btn(u.banned ? 'Banı kaldır' : 'Banla', async () => { await api('/admin/users/' + u.id + '/ban', { method:'POST', body: JSON.stringify({ banned: !u.banned }) }); loadUsers(); }));
    actions.append(' ', btn('VIP ver', async () => {
      const v = prompt('Kaç gün VIP verilsin?', '30'); if (!v) return;
      await api('/admin/users/' + u.id + '/vip', { method:'POST', body: JSON.stringify({ days: parseInt(v, 10) }) }); loadUsers();
    }));
    if (u.character_id) actions.append(' ', btn('Para ±', async () => {
      const v = prompt('Eklenecek miktar (eksi değer düşer):', '100'); if (!v) return;
      await api('/admin/characters/' + u.character_id + '/money', { method:'POST', body: JSON.stringify({ delta: parseInt(v, 10) }) }); loadUsers();
    }));
    tr.append(actions); tb.append(tr);
  }
}
async function loadChat() {
  const { messages } = await api('/admin/chat');
  const tb = $('chat'); tb.replaceChildren();
  for (const m of messages) {
    const tr = el('tr', undefined, m.deleted ? 'deleted' : '');
    const text = el('td', m.text); text.style.whiteSpace = 'normal';
    tr.append(el('td', new Date(m.created_at).toLocaleString('tr-TR')), el('td', m.channel), el('td', m.name), text);
    const a = el('td'); if (!m.deleted) a.append(btn('Sil', async () => { await api('/admin/chat/' + m.id, { method:'DELETE' }); loadChat(); }));
    tr.append(a); tb.append(tr);
  }
}
const REPORT_KINDS = { message: 'Özel mesaj', guestbook: 'Defter notu', profile: 'Profil', article: 'Haber / yazı' };
async function loadReports() {
  const { reports } = await api('/admin/reports');
  const tb = $('reports'); tb.replaceChildren();
  if (!reports.length) { const tr = el('tr'); const td = el('td', 'Açık şikâyet yok.'); td.colSpan = 6; tr.append(td); tb.append(tr); return; }
  for (const r of reports) {
    const tr = el('tr');
    const text = el('td', (r.content ?? '(silinmiş)') + (r.note ? '  — not: ' + r.note : '')); text.style.whiteSpace = 'normal';
    tr.append(el('td', new Date(r.created_at).toLocaleString('tr-TR')), el('td', REPORT_KINDS[r.kind] || r.kind), el('td', r.reporter), el('td', r.author ?? '—'), text);
    const a = el('td');
    a.append(btn('Kaldır', async () => { await api('/admin/reports/' + r.id + '/resolve', { method:'POST', body: JSON.stringify({ remove: true }) }); loadReports(); loadProfiles(); }));
    a.append(' ', btn('Yoksay', async () => { await api('/admin/reports/' + r.id + '/resolve', { method:'POST', body: JSON.stringify({ remove: false }) }); loadReports(); }));
    if (r.author_user_id) a.append(' ', btn('Banla', async () => {
      if (!confirm(r.author + ' banlansın mı?')) return;
      await api('/admin/users/' + r.author_user_id + '/ban', { method:'POST', body: JSON.stringify({ banned: true }) }); loadUsers();
    }));
    tr.append(a); tb.append(tr);
  }
}
async function loadProfiles() {
  const { profiles } = await api('/admin/profiles');
  const box = $('profiles'); box.replaceChildren();
  for (const p of profiles) {
    const card = el('div', undefined, 'stat');
    if (p.avatar_version > 0) {
      const img = document.createElement('img');
      img.src = '/api/avatars/' + p.id + '?v=' + p.avatar_version; img.alt = p.name;
      img.style.cssText = 'width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px;margin-bottom:6px';
      card.append(img);
    }
    card.append(el('b', p.name));
    if (p.headline) card.append(el('div', p.headline));
    if (p.bio) { const b = el('small', p.bio); b.style.cssText = 'display:block;white-space:pre-wrap;max-height:90px;overflow:hidden'; card.append(b); }
    const row = el('div', undefined, 'row'); row.style.marginTop = '8px';
    if (p.avatar_version > 0) row.append(btn('Fotoğrafı kaldır', async () => { await api('/admin/characters/' + p.id + '/profile', { method:'DELETE', body: JSON.stringify({ avatar: true }) }); loadProfiles(); }));
    if (p.headline || p.bio) row.append(btn('Yazıları temizle', async () => { await api('/admin/characters/' + p.id + '/profile', { method:'DELETE', body: JSON.stringify({ text: true }) }); loadProfiles(); }));
    card.append(row); box.append(card);
  }
}
async function loadArticles() {
  const { articles } = await api('/admin/articles');
  const tb = $('articles'); tb.replaceChildren();
  if (!articles.length) { const tr = el('tr'); const td = el('td', 'Yazı yok.'); td.colSpan = 6; tr.append(td); tb.append(tr); return; }
  for (const a of articles) {
    const tr = el('tr');
    const text = el('td', (a.removed ? '[kaldırıldı] ' : '') + a.title + ' · ' + a.body.slice(0, 200));
    tr.append(el('td', new Date(a.created_at).toLocaleString('tr-TR')), el('td', a.kind), el('td', a.city_id), el('td', a.author ?? '—'), text);
    const td = el('td');
    if (!a.removed) td.append(btn('Kaldır', async () => { await api('/admin/articles/' + a.id, { method:'DELETE' }); loadArticles(); }));
    if (a.user_id) td.append(' ', btn('Banla', async () => { if (!confirm('Yazan banlansın mı?')) return; await api('/admin/users/' + a.user_id + '/ban', { method:'POST', body: JSON.stringify({ banned: true }) }); loadUsers(); }));
    tr.append(td); tb.append(tr);
  }
}
async function show() {
  try {
    const me = await api('/me');
    if (!me.user.isAdmin) throw new Error('Bu hesap yönetici değil');
    $('login').hidden = true; $('panel').hidden = false;
    await Promise.all([loadStats(), loadUsers(), loadReports(), loadArticles(), loadProfiles(), loadChat()]);
  } catch (e) { token = null; localStorage.removeItem('rifftown_admin_token'); $('login').hidden = false; $('panel').hidden = true; $('loginErr').textContent = e.message === 'unauthorized' ? '' : e.message; }
}
$('loginBtn').onclick = async () => {
  $('loginErr').textContent = '';
  try { const r = await api('/auth/login', { method:'POST', body: JSON.stringify({ email: $('email').value, password: $('password').value }) });
    token = r.token; localStorage.setItem('rifftown_admin_token', token); show(); }
  catch (e) { $('loginErr').textContent = e.message === 'bad_credentials' ? 'E-posta veya şifre hatalı' : e.message; }
};
$('logout').onclick = async () => { await api('/auth/logout', { method:'POST' }).catch(() => {}); token = null; localStorage.removeItem('rifftown_admin_token'); show(); };
$('search').onclick = loadUsers; $('q').onkeydown = (e) => { if (e.key === 'Enter') loadUsers(); };
if (token) show();
</script>
</body>
</html>`;
