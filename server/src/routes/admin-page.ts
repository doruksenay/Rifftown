// Yönetim paneli: istatistikler, online oyuncular, oyuncu arama ve tüm alanlarını düzenleme (para, beceri, nitelik, XP, profil...),
// banlama, profil ve sohbet moderasyonu.
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
  [hidden] { display:none !important; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:10px; margin-bottom:14px; align-items:start; }
  .fld { display:grid; gap:3px; } .fld span { color:var(--muted); font-size:12px; }
  .fld input, .fld select, .fld textarea { width:100%; font:inherit; border-radius:6px; border:1px solid var(--line); padding:7px 10px; background:#251a5e; color:var(--text); }
  .fld input[type=color] { padding:2px; height:34px; }
  h3 { font-size:13px; margin:14px 0 8px; color:var(--cyan); }
  .ok { color:#7bffb0; } .muted { color:var(--muted); }
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
      <h2>Online oyuncular</h2>
      <div class="stats" id="online" style="margin-bottom:12px"></div>
      <table><thead><tr><th>Karakter</th><th>E-posta</th><th>Şehir</th><th>Son istek</th><th></th></tr></thead><tbody id="onlineList"></tbody></table>
    </section>
    <section>
      <h2>Oyuncular</h2>
      <div class="row"><input id="q" placeholder="E-posta veya karakter adı" style="min-width:260px"><button id="search" class="primary">Ara</button></div>
      <table><thead><tr><th>#</th><th>E-posta</th><th>Karakter</th><th>Şehir</th><th>Para</th><th>VIP bitişi</th><th>Son görülme</th><th>Durum</th><th></th></tr></thead><tbody id="users"></tbody></table>
    </section>
    <section id="editor" hidden>
      <h2 id="edTitle"></h2>
      <div id="edBody"></div>
      <div class="row" style="margin-top:14px">
        <button class="primary" id="edSave">Kaydet</button>
        <button id="edClose">Kapat</button>
        <span id="edMsg" style="align-self:center"></span>
      </div>
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
      el('td', u.last_seen ? new Date(u.last_seen).toLocaleString('tr-TR') : '—'),
      el('td', u.banned ? 'Banlı' : (u.is_admin ? 'Yönetici' : 'Aktif')));
    const actions = el('td');
    actions.append(btn('Düzenle', () => openEditor(u.id)), ' ');
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
  // Aramada tek oyuncu çıktıysa düzenleme formunu doğrudan aç
  if (q && users.length === 1) openEditor(users[0].id);
}

// ---------- Online oyuncular ----------
async function loadOnline() {
  const o = await api('/admin/online');
  const box = $('online'); box.replaceChildren();
  [['online', 'Şu an online (son ' + o.onlineMinutes + ' dk)'], ['last_hour', 'Son 1 saat'], ['last_day', 'Son 24 saat']].forEach(([k, label]) => {
    const d = el('div', undefined, 'stat'); d.append(el('b', o[k]), el('small', label)); box.append(d);
  });
  const tb = $('onlineList'); tb.replaceChildren();
  if (!o.players.length) { const tr = el('tr'); const td = el('td', 'Şu an online oyuncu yok.'); td.colSpan = 5; tr.append(td); tb.append(tr); return; }
  for (const p of o.players) {
    const tr = el('tr');
    tr.append(el('td', p.name || '—'), el('td', p.email), el('td', p.city_id || '—'), el('td', new Date(p.last_used).toLocaleTimeString('tr-TR')));
    const a = el('td'); a.append(btn('Düzenle', () => openEditor(p.user_id))); tr.append(a); tb.append(tr);
  }
}

// ---------- Oyuncu düzenleme ----------
let META = null, editUserId = null, edFields = [];
const CAT_NAMES = { instruments:'Enstrümanlar', music:'Müzik', stage:'Sahne', genres:'Müzik türleri', career:'Kariyer', social:'Sosyal', sports:'Spor', crafts:'Zanaat', crime:'Sokak' };
const CAT_ORDER = ['instruments', 'music', 'stage', 'genres', 'career', 'social', 'sports', 'crafts', 'crime'];

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function mk(tag, props) { const e = document.createElement(tag); Object.assign(e, props || {}); return e; }
function sel(options, value) {
  const s = mk('select');
  for (const [v, label] of options) { const o = mk('option', { value: v, textContent: label }); s.append(o); }
  s.value = value ?? '';
  return s;
}
function wrap(label, input) { const w = el('label', undefined, 'fld'); w.append(el('span', label), input); return w; }
/** Alanı forma ekler; kaydederken sadece değişenler gönderilir */
function reg(box, group, key, label, input, read, orig) {
  box.append(wrap(label, input));
  edFields.push({ group, key, read, orig, input });
}
const numOrNull = (s) => (s === '' ? null : Number(s));

async function openEditor(userId) {
  try {
    if (!META) META = await api('/admin/meta');
    const { user, character: ch } = await api('/admin/players/' + userId);
    editUserId = userId; edFields = [];
    $('edMsg').textContent = '';
    $('edTitle').textContent = 'Düzenle: ' + (ch ? ch.name + ' · ' : '') + user.email + (user.is_admin ? ' (yönetici)' : '');
    const body = $('edBody'); body.replaceChildren();

    body.append(el('h3', 'Hesap'));
    const g1 = el('div', undefined, 'grid'); body.append(g1);
    reg(g1, 'user', 'email', 'E-posta (değişirse oturumu kapanır)', mk('input', { type: 'email', value: user.email }), (i) => i.value.trim().toLowerCase(), user.email);
    reg(g1, 'user', 'lang', 'Dil', sel([['tr', 'Türkçe'], ['en', 'English']], user.lang), (i) => i.value, user.lang);
    reg(g1, 'user', 'banned', 'Ban', sel([['0', 'Hayır'], ['1', 'Banlı']], user.banned ? '1' : '0'), (i) => i.value === '1', !!user.banned);
    reg(g1, 'user', 'vipUntil', 'VIP bitişi (boş: VIP yok)', mk('input', { type: 'datetime-local', value: toLocalInput(user.vip_until && new Date(user.vip_until) > new Date() ? user.vip_until : null) }),
      (i) => (i.value ? new Date(i.value).toISOString() : null), user.vip_until && new Date(user.vip_until) > new Date() ? new Date(toLocalInput(user.vip_until)).toISOString() : null);
    g1.append(wrap('Kayıt tarihi', mk('input', { value: new Date(user.created_at).toLocaleString('tr-TR'), disabled: true })));
    g1.append(wrap('Kayıt IP', mk('input', { value: user.register_ip || '—', disabled: true })));

    if (!ch) { body.append(el('p', 'Bu hesabın henüz karakteri yok.', 'muted')); $('editor').hidden = false; return; }

    body.append(el('h3', 'Karakter'));
    const g2 = el('div', undefined, 'grid'); body.append(g2);
    reg(g2, 'character', 'name', 'Ad', mk('input', { value: ch.name }), (i) => i.value.trim(), ch.name);
    reg(g2, 'character', 'avatarColor', 'Avatar rengi', mk('input', { type: 'color', value: ch.avatarColor }), (i) => i.value, ch.avatarColor);
    reg(g2, 'character', 'mainInstrument', 'Ana enstrüman', sel(META.instruments.map((x) => [x, x]), ch.mainInstrument), (i) => i.value, ch.mainInstrument);
    reg(g2, 'character', 'money', 'Para', mk('input', { type: 'number', min: 0, step: 1, value: ch.money }), (i) => Number(i.value), ch.money);
    reg(g2, 'character', 'bank', 'Bankadaki para', mk('input', { type: 'number', min: 0, step: 1, value: ch.bank }), (i) => Number(i.value), ch.bank);
    for (const [k, label] of [['health', 'Sağlık (0-100)'], ['mood', 'Ruh hâli (0-100)'], ['energy', 'Enerji (0-100)'], ['inspiration', 'İlham (0-100)']])
      reg(g2, 'character', k, label, mk('input', { type: 'number', min: 0, max: 100, step: 1, value: Math.round(ch[k]) }), (i) => Number(i.value), Math.round(ch[k]));

    body.append(el('h3', 'Konum ve kariyer'));
    const g3 = el('div', undefined, 'grid'); body.append(g3);
    const citySel = sel([['', 'Yolda / şehir yok']].concat(META.cities.map((c) => [c.id, c.name])), ch.cityId);
    const locSel = mk('select');
    const fillLocs = (cityId, cur) => {
      locSel.replaceChildren(mk('option', { value: '', textContent: 'Mekân yok' }));
      const c = META.cities.find((x) => x.id === cityId);
      if (c) for (const l of c.locations) locSel.append(mk('option', { value: l.id, textContent: l.name + ' (' + l.type + ')' }));
      locSel.value = cur || '';
    };
    fillLocs(ch.cityId, ch.locationId);
    citySel.onchange = () => fillLocs(citySel.value, '');
    reg(g3, 'character', 'cityId', 'Şehir', citySel, (i) => i.value || null, ch.cityId);
    reg(g3, 'character', 'locationId', 'Mekân', locSel, (i) => i.value || null, ch.locationId);
    reg(g3, 'character', 'profession', 'Meslek', sel([['', 'İşsiz']].concat(META.professions.map((p) => [p.id, p.name])), ch.profession), (i) => i.value || null, ch.profession);
    reg(g3, 'character', 'careerRank', 'Rütbe (0-3)', mk('input', { type: 'number', min: 0, max: 3, step: 1, value: ch.careerRank }), (i) => Number(i.value), ch.careerRank);
    reg(g3, 'character', 'careerHours', 'Meslekte çalışılan saat', mk('input', { type: 'number', min: 0, step: 1, value: Math.round(ch.careerHours) }), (i) => Number(i.value), Math.round(ch.careerHours));
    const jailed = ch.jailedUntil && new Date(ch.jailedUntil) > new Date() ? ch.jailedUntil : null;
    reg(g3, 'character', 'jailedUntil', 'Cezaevi bitişi (boş: serbest)', mk('input', { type: 'datetime-local', value: toLocalInput(jailed) }),
      (i) => (i.value ? new Date(i.value).toISOString() : null), jailed ? new Date(toLocalInput(jailed)).toISOString() : null);
    reg(g3, 'character', 'convictions', 'Sabıka sayısı', mk('input', { type: 'number', min: 0, step: 1, value: ch.convictions }), (i) => Number(i.value), ch.convictions);

    body.append(el('h3', 'Profil'));
    const g4 = el('div', undefined, 'grid'); body.append(g4);
    reg(g4, 'character', 'headline', 'Başlık (en fazla 80)', mk('input', { value: ch.headline, maxLength: 80 }), (i) => i.value.trim(), ch.headline);
    const bio = mk('textarea', { value: ch.bio, rows: 4, maxLength: 1000 });
    reg(g4, 'character', 'bio', 'Hakkında (en fazla 1000)', bio, (i) => i.value.trim(), ch.bio);
    if (ch.avatarVersion > 0) {
      const img = mk('img', { src: '/api/avatars/' + ch.id + '?v=' + ch.avatarVersion, alt: ch.name });
      img.style.cssText = 'width:120px;height:120px;object-fit:cover;border-radius:8px;display:block;margin-bottom:6px';
      const w = el('div'); w.append(img, btn('Fotoğrafı kaldır', async () => {
        if (!confirm('Profil fotoğrafı kaldırılsın mı?')) return;
        await api('/admin/characters/' + ch.id + '/profile', { method: 'DELETE', body: JSON.stringify({ avatar: true }) }); openEditor(userId);
      }));
      g4.append(w);
    }

    body.append(el('h3', 'Nitelikler ve XP (nitelik 0-' + META.attributeMax + '; oyuncunun toplam tavanı ' + META.attributeTotalCap + ')'));
    const gA = el('div', undefined, 'grid'); body.append(gA);
    for (const a of META.attributes) {
      const cur = Math.round((ch.attributes[a.id] ?? 0) * 100) / 100;
      const input = mk('input', { type: 'number', min: 0, max: META.attributeMax, step: 1, value: cur });
      gA.append(wrap(a.name, input));
      edFields.push({ group: 'attributes', key: a.id, read: (i) => Number(i.value), orig: cur, input });
    }
    const xpNow = Math.floor((ch.xp ?? 0) * 100) / 100;
    reg(gA, 'character', 'xp', 'Harcanmamış XP', mk('input', { type: 'number', min: 0, step: 1, value: xpNow }), (i) => Number(i.value), xpNow);
    gA.append(wrap('Ömür boyu kazanılan XP', mk('input', { value: Math.floor(ch.xpTotal ?? 0), disabled: true })));

    body.append(el('h3', 'Beceriler (boş: açılmamış, 0-' + META.maxSkill + ')'));
    const quick = el('div', undefined, 'row');
    quick.append(btn('Hepsini ' + META.maxSkill + ' yap', () => document.querySelectorAll('.skillIn').forEach((i) => { i.value = META.maxSkill; })));
    quick.append(btn('Açık olanları ' + META.maxSkill + ' yap', () => document.querySelectorAll('.skillIn').forEach((i) => { if (i.value !== '') i.value = META.maxSkill; })));
    body.append(quick);
    for (const cat of CAT_ORDER) {
      const defs = META.skills.filter((s) => s.category === cat);
      if (!defs.length) continue;
      body.append(el('div', CAT_NAMES[cat] || cat, 'muted'));
      const g = el('div', undefined, 'grid'); body.append(g);
      for (const s of defs) {
        const cur = ch.skills[s.id];
        const input = mk('input', { type: 'number', min: 0, max: META.maxSkill, step: 1, value: cur === undefined ? '' : Math.round(cur * 100) / 100, className: 'skillIn' });
        input.placeholder = '—';
        box_reg_skill(g, s, input, cur);
      }
    }
    $('editor').hidden = false;
    $('editor').scrollIntoView({ behavior: 'smooth' });
  } catch (e) { alert('Oyuncu yüklenemedi: ' + e.message); }
}
function box_reg_skill(box, s, input, cur) {
  box.append(wrap(s.name, input));
  edFields.push({ group: 'skills', key: s.id, read: (i) => numOrNull(i.value), orig: cur === undefined ? null : cur, input });
}
async function saveEditor() {
  const patch = { user: {}, character: {} };
  const skills = {};
  const attributes = {};
  for (const f of edFields) {
    const val = f.read(f.input);
    if (f.group === 'skills') { if (val !== f.orig) skills[f.key] = val; continue; }
    if (f.group === 'attributes') { if (val !== f.orig) attributes[f.key] = val; continue; }
    if (JSON.stringify(val) !== JSON.stringify(f.orig)) patch[f.group][f.key] = val;
  }
  if (Object.keys(skills).length) patch.character.skills = skills;
  if (Object.keys(attributes).length) patch.character.attributes = attributes;
  if (!Object.keys(patch.user).length) delete patch.user;
  if (!Object.keys(patch.character).length) delete patch.character;
  const msg = $('edMsg');
  if (!patch.user && !patch.character) { msg.className = 'muted'; msg.textContent = 'Değişiklik yok.'; return; }
  try {
    await api('/admin/players/' + editUserId, { method: 'PATCH', body: JSON.stringify(patch) });
    msg.className = 'ok'; msg.textContent = 'Kaydedildi ✓';
    await openEditor(editUserId);
    $('edMsg').className = 'ok'; $('edMsg').textContent = 'Kaydedildi ✓';
    loadUsers(); loadOnline();
  } catch (e) { msg.className = 'err'; msg.textContent = 'Hata: ' + e.message; }
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
    await Promise.all([loadStats(), loadOnline(), loadUsers(), loadReports(), loadArticles(), loadProfiles(), loadChat()]);
    if (!window.__onlineTimer) window.__onlineTimer = setInterval(() => { if (token) { loadOnline().catch(() => {}); loadStats().catch(() => {}); } }, 30000);
  } catch (e) { token = null; localStorage.removeItem('rifftown_admin_token'); $('login').hidden = false; $('panel').hidden = true; $('loginErr').textContent = e.message === 'unauthorized' ? '' : e.message; }
}
$('loginBtn').onclick = async () => {
  $('loginErr').textContent = '';
  try { const r = await api('/auth/login', { method:'POST', body: JSON.stringify({ email: $('email').value, password: $('password').value }) });
    token = r.token; localStorage.setItem('rifftown_admin_token', token); show(); }
  catch (e) { $('loginErr').textContent = e.message === 'bad_credentials' ? 'E-posta veya şifre hatalı' : e.message; }
};
$('logout').onclick = async () => { await api('/auth/logout', { method:'POST' }).catch(() => {}); token = null; localStorage.removeItem('rifftown_admin_token'); show(); };
$('edSave').onclick = saveEditor;
$('edClose').onclick = () => { $('editor').hidden = true; };
$('search').onclick = loadUsers; $('q').onkeydown = (e) => { if (e.key === 'Enter') loadUsers(); };
if (token) show();
</script>
</body>
</html>`;
