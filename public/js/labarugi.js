/* LabaRugi — logika aplikasi. Vanilla JS, tanpa dependency.
   Aturan: data user tidak pernah di-render via innerHTML mentah — selalu lewat esc() atau textContent. */
(function () {
  'use strict';

  /* ---------- util ---------- */
  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) =>
    String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const fmtRp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const fmtDay = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtShort = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });
  const fmtMonth = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });
  const rp = (n) => fmtRp.format(Math.round(n));
  const pad = (n) => String(n).padStart(2, '0');
  const isoOf = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const todayISO = () => isoOf(new Date());
  const uid = () => 't' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- toast ---------- */
  let toastTimer = null;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  /* ---------- store ---------- */
  const KEY = 'labarugi:v1';
  const MOTION_KEY = 'labarugi:motion';
  function validTx(t) {
    return t && typeof t === 'object'
      && typeof t.id === 'string' && t.id.length < 64
      && (t.type === 'masuk' || t.type === 'keluar')
      && typeof t.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date)
      && typeof t.desc === 'string' && t.desc.length <= 120
      && typeof t.amount === 'number' && isFinite(t.amount) && t.amount > 0 && t.amount <= 999999999
      && (t.cat === undefined || (typeof t.cat === 'string' && t.cat.length <= 40));
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (!data || data.v !== 1 || !Array.isArray(data.tx)) return [];
      return data.tx.filter(validTx);
    } catch (e) { return []; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ v: 1, tx: state.tx })); }
    catch (e) { /* mode privat: tetap jalan tanpa simpan */ }
  }

  /* ---------- contoh ---------- */
  function sampleData() {
    const d = (ago) => { const t = new Date(); t.setDate(t.getDate() - ago); return isoOf(t); };
    const rows = [
      ['masuk', 0, 'jualan hari ini', 485000, ''],
      ['keluar', 0, 'belanja ke pasar induk', 210000, 'belanja bahan'],
      ['masuk', 1, 'jualan hari ini', 520000, ''],
      ['keluar', 1, 'ayam + sayur', 185000, 'belanja bahan'],
      ['masuk', 2, 'jualan + pesanan katering', 850000, ''],
      ['keluar', 2, 'gaji mbak Sari', 150000, 'gaji'],
      ['masuk', 3, 'jualan hari ini', 390000, ''],
      ['keluar', 3, 'token listrik', 75000, 'listrik & air'],
      ['masuk', 4, 'jualan hari ini', 445000, ''],
      ['keluar', 4, 'beras + minyak goreng', 230000, 'belanja bahan'],
      ['masuk', 5, 'jualan hari ini', 410000, ''],
      ['keluar', 6, 'sewa kios november', 600000, 'sewa'],
    ];
    return rows.map((r, i) => ({ id: uid() + i, type: r[0], date: d(r[1]), desc: r[2], amount: r[3], cat: r[4] }));
  }

  /* ---------- state ---------- */
  const state = {
    tx: load(),
    period: '30d',
    editingId: null,
    search: '',
  };

  /* ---------- deep-link ---------- */
  function b64urlEncode(obj) {
    const s = unescape(encodeURIComponent(JSON.stringify(obj)));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64urlDecode(str) {
    const b = str.replace(/-/g, '+').replace(/_/g, '/');
    const s = decodeURIComponent(escape(atob(b)));
    return JSON.parse(s);
  }
  function loadFromLink() {
    try {
      const q = new URLSearchParams(location.search).get('lr');
      if (!q) return false;
      const data = b64urlDecode(q);
      if (!data || data.v !== 1 || !Array.isArray(data.tx)) return false;
      const clean = data.tx.filter(validTx);
      if (!clean.length) return false;
      state.tx = clean;
      save();
      history.replaceState(null, '', location.pathname);
      toast('Tautan dibuka — datanya sudah dimuat.');
      return true;
    } catch (e) { return false; }
  }
  function shareLink() {
    const url = location.origin + location.pathname + '?lr=' + b64urlEncode({ v: 1, tx: state.tx });
    return url;
  }

  /* ---------- filter periode ---------- */
  function inPeriod(dateISO) {
    const today = todayISO();
    if (state.period === 'all') return true;
    if (state.period === 'today') return dateISO === today;
    if (state.period === 'month') return dateISO.slice(0, 7) === today.slice(0, 7);
    const days = state.period === '7d' ? 7 : 30;
    const t = new Date(); t.setDate(t.getDate() - (days - 1));
    return dateISO >= isoOf(t) && dateISO <= today;
  }
  const txInPeriod = () => state.tx.filter((t) => inPeriod(t.date));
  const sum = (type) => txInPeriod().filter((t) => t.type === type).reduce((a, t) => a + t.amount, 0);

  /* ---------- odometer ---------- */
  const shown = { masuk: 0, keluar: 0, verdict: 0 };
  function tween(el, key, target) {
    if (reducedMotion() || document.documentElement.classList.contains('no-motion')) {
      el.textContent = rp(target); shown[key] = target; return;
    }
    const from = shown[key] || 0, t0 = performance.now(), dur = 650;
    function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * e;
      el.textContent = rp(v);
      if (p < 1) requestAnimationFrame(step); else { el.textContent = rp(target); shown[key] = target; }
    }
    requestAnimationFrame(step);
  }

  /* ---------- render ---------- */
  let lastSign = null;
  function render(animStamp) {
    const masuk = sum('masuk'), keluar = sum('keluar'), laba = masuk - keluar;
    tween($('totalMasuk'), 'masuk', masuk);
    tween($('totalKeluar'), 'keluar', keluar);
    tween($('verdictNumber'), 'verdict', laba);

    const nM = txInPeriod().filter((t) => t.type === 'masuk').length;
    const nK = txInPeriod().filter((t) => t.type === 'keluar').length;
    $('countMasuk').textContent = nM ? nM + ' catatan' : 'belum ada catatan';
    $('countKeluar').textContent = nK ? nK + ' catatan' : 'belum ada catatan';

    const tot = masuk + keluar;
    $('fillMasuk').style.setProperty('--fillh', tot ? Math.min(100, (masuk / tot) * 100) + '%' : '0%');
    $('fillKeluar').style.setProperty('--fillh', tot ? Math.min(100, (keluar / tot) * 100) + '%' : '0%');

    const sign = laba > 0 ? 'laba' : laba < 0 ? 'rugi' : 'nol';
    const vn = $('verdictNumber'), vs = $('verdictState'), st = $('stamp');
    vn.classList.toggle('is-laba', sign === 'laba');
    vn.classList.toggle('is-rugi', sign === 'rugi');
    vs.classList.toggle('is-laba', sign === 'laba');
    vs.classList.toggle('is-rugi', sign === 'rugi');
    vs.textContent = sign === 'laba' ? 'LABA' : sign === 'rugi' ? 'RUGI' : 'IMPAS';
    st.textContent = sign === 'nol' ? 'IMPAS' : sign.toUpperCase();
    $('stampSlot').setAttribute('aria-label', 'Stempel ' + st.textContent + ' — ketuk lima kali untuk kejutan');
    st.classList.toggle('laba', sign !== 'rugi');
    st.classList.toggle('rugi', sign === 'rugi');
    const margin = masuk > 0 ? (laba / masuk) * 100 : 0;
    if (masuk > 0) {
      const bench = margin >= 20 ? ' — di atas 20%, warungmu sehat kata Pak Catat.'
        : margin >= 0 ? ' — di bawah 20%, cek belanja bahanmu.'
        : ' — minus! uang keluar lebih besar dari masuk.';
      $('marginLine').textContent = 'margin ' + margin.toFixed(1).replace('.', ',') + '% dari pemasukan ' + rp(masuk) + bench;
    } else {
      $('marginLine').textContent = 'catat pemasukan dulu biar bisa dihitung marginnya.';
    }

    if (animStamp || (lastSign !== null && lastSign !== sign)) {
      st.classList.remove('slam'); void st.offsetWidth; st.classList.add('slam');
    }
    lastSign = sign;

    renderRecent(); renderMonths(); renderTxList(); renderChart();
  }

  function renderRecent() {
    [['masuk', 'recentMasuk'], ['keluar', 'recentKeluar']].forEach(([type, id]) => {
      const ul = $(id);
      const items = state.tx.filter((t) => t.type === type)
        .sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);
      ul.innerHTML = items.length
        ? items.map((t) => '<li><span>' + esc(t.desc) + '</span><strong>' + esc(rp(t.amount)) + '</strong></li>').join('')
        : '<li class="recent-empty">belum ada — catat yang pertama.</li>';
    });
  }

  function renderMonths() {
    const groups = {};
    state.tx.forEach((t) => {
      const k = t.date.slice(0, 7);
      groups[k] = groups[k] || { masuk: 0, keluar: 0 };
      groups[k][t.type] += t.amount;
    });
    const keys = Object.keys(groups).sort().reverse().slice(0, 6);
    $('monthList').innerHTML = keys.length ? keys.map((k) => {
      const g = groups[k], laba = g.masuk - g.keluar;
      const cls = laba > 0 ? 'laba' : laba < 0 ? 'rugi' : '';
      return '<li class="month-row"><span class="m-name">' + esc(fmtMonth.format(new Date(k + '-02'))) + '</span>' +
        '<span class="m-muted">masuk ' + esc(rp(g.masuk)) + '</span>' +
        '<span class="m-muted">keluar ' + esc(rp(g.keluar)) + '</span>' +
        '<span class="m-laba ' + cls + '">' + esc(rp(laba)) + '</span></li>';
    }).join('') : '<li class="empty-note">Belum ada rekap — mulai catat hari ini.</li>';
  }

  function txMatches(t) {
    if (!state.search) return true;
    const q = state.search.toLowerCase();
    return t.desc.toLowerCase().includes(q) || (t.cat || '').toLowerCase().includes(q);
  }
  function renderTxList() {
    const items = state.tx.filter(txMatches).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    $('txCount').textContent = state.tx.length
      ? state.tx.length + ' catatan' + (state.search ? ' (disaring: ' + items.length + ')' : '')
      : '';
    $('txEmpty').hidden = state.tx.length > 0;
    $('txList').innerHTML = items.map((t) => {
      const badge = t.type === 'masuk' ? 'MASUK' : 'KELUAR';
      const meta = t.date.split('-').reverse().join('/') + (t.cat ? ' · ' + esc(t.cat) : '');
      return '<li class="tx-row" data-id="' + esc(t.id) + '">' +
        '<span class="tx-badge ' + t.type + '">' + badge + '</span>' +
        '<span class="tx-main"><span class="tx-desc">' + esc(t.desc) + '</span><br>' +
        '<span class="tx-meta">' + meta + '</span></span>' +
        '<span class="tx-amount ' + t.type + '">' + (t.type === 'masuk' ? '+' : '−') + esc(rp(t.amount)) + '</span>' +
        '<span class="tx-actions">' +
        '<button class="icon-btn tx-textbtn" data-act="edit" aria-label="Ubah catatan ' + esc(t.desc) + '">ubah</button>' +
        '<button class="icon-btn tx-textbtn" data-act="del" aria-label="Hapus catatan ' + esc(t.desc) + '">hapus</button>' +
        '</span></li>';
    }).join('');
  }

  /* ---------- grafik 30 hari (SVG murni) ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function renderChart() {
    const svg = $('trendChart');
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const W = 720, H = 260, P = { l: 8, r: 8, t: 14, b: 30 };
    const days = [];
    for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(isoOf(d)); }
    const per = days.map((ds) => ({
      ds,
      masuk: state.tx.filter((t) => t.date === ds && t.type === 'masuk').reduce((a, t) => a + t.amount, 0),
      keluar: state.tx.filter((t) => t.date === ds && t.type === 'keluar').reduce((a, t) => a + t.amount, 0),
    }));
    const max = Math.max(1, ...per.map((p) => Math.max(p.masuk, p.keluar)));
    const X = (i) => P.l + (i / 29) * (W - P.l - P.r);
    const Y = (v) => P.t + (1 - v / max) * (H - P.t - P.b);
    // grid
    for (let g = 0; g <= 4; g++) {
      const y = P.t + (g / 4) * (H - P.t - P.b);
      svg.appendChild(el('line', { x1: P.l, x2: W - P.r, y1: y, y2: y, stroke: 'currentColor', 'stroke-opacity': 0.18, 'stroke-dasharray': '4 4' }));
    }
    const line = (key, color) => {
      const pts = per.map((p, i) => X(i).toFixed(1) + ',' + Y(p[key]).toFixed(1)).join(' ');
      const area = el('polygon', { points: P.l + ',' + Y(0) + ' ' + pts + ' ' + (W - P.r) + ',' + Y(0), fill: color, opacity: 0.14 });
      const pl = el('polyline', { points: pts, fill: 'none', stroke: color, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
      svg.appendChild(area); svg.appendChild(pl);
    };
    const css = getComputedStyle(document.documentElement);
    line('masuk', css.getPropertyValue('--pop').trim() || '#2e7d4f');
    line('keluar', css.getPropertyValue('--rugi').trim() || '#7a2e4d');
    // titik interaktif + label tanggal
    const tip = $('trendTip'), box = svg.closest('.trend-box');
    per.forEach((p, i) => {
      if (i % 6 !== 0 && i !== 29) return;
      const t = el('text', { x: X(i), y: H - 8, 'text-anchor': 'middle', fill: 'currentColor', opacity: 0.6 });
      t.textContent = p.ds.slice(8) + '/' + p.ds.slice(5, 7);
      svg.appendChild(t);
    });
    per.forEach((p, i) => {
      ['masuk', 'keluar'].forEach((key) => {
        if (!p[key]) return;
        const c = el('circle', {
          cx: X(i), cy: Y(p[key]), r: 7, fill: 'transparent',
          tabindex: 0, role: 'img',
          'aria-label': fmtShort.format(new Date(p.ds + 'T00:00')) + ': ' + key + ' ' + rp(p[key]),
        });
        const show = () => {
          const r = c.getBoundingClientRect(), br = box.getBoundingClientRect();
          tip.style.left = (r.left - br.left + r.width / 2) + 'px';
          tip.style.top = (r.top - br.top) + 'px';
          tip.textContent = fmtShort.format(new Date(p.ds + 'T00:00')) + ' · ' + key + ' ' + rp(p[key]);
          tip.classList.add('show');
        };
        const hide = () => tip.classList.remove('show');
        c.addEventListener('pointerenter', show);
        c.addEventListener('pointerleave', hide);
        c.addEventListener('focus', show);
        c.addEventListener('blur', hide);
        c.addEventListener('click', show);
        svg.appendChild(c);
      });
    });
    const st = document.createElementNS(NS, 'style');
    st.textContent = '#trendChart text{font-size:var(--f-s);font-family:var(--font-body)}';
    svg.appendChild(st);
  }

  /* ---------- validasi & form ---------- */
  function readForm(prefix) {
    return {
      date: $(prefix + 'Tgl').value,
      cat: prefix === 'fKeluar' ? $('fKeluarKat').value : '',
      desc: $(prefix + 'Ket').value.trim(),
      amount: Number($(prefix + 'Nom').value),
      type: prefix === 'fMasuk' ? 'masuk' : 'keluar',
    };
  }
  function validate(v, errEl, inputEl) {
    const bad = (msg) => {
      errEl.textContent = msg;
      inputEl.setAttribute('aria-invalid', 'true');
      return false;
    };
    inputEl.removeAttribute('aria-invalid');
    errEl.textContent = '';
    if (!v.date || !/^\d{4}-\d{2}-\d{2}$/.test(v.date)) return bad('Tanggalnya isi dulu — formatnya aneh.');
    if (!v.desc) return bad('Keterangannya diisi dulu — Pak Catat nggak bisa nebak.');
    if (!v.amount || !isFinite(v.amount)) return bad('Nominalnya isi dulu, jangan kosong.');
    if (v.amount <= 0) return bad('Nominal minus? Ini warung, bukan sulap.');
    if (v.amount > 999999999) return bad('Kebanyakan nolnya. Cek lagi nominalnya.');
    return true;
  }
  function bindForm(formId, prefix) {
    const form = $(formId);
    const cancel = document.createElement('button');
    cancel.type = 'button'; cancel.className = 'lr-btn lr-btn-ghost'; cancel.textContent = 'batal ubah';
    cancel.style.display = 'none';
    form.appendChild(cancel);
    const submitBtn = form.querySelector('button[type="submit"]');
    const origLabel = submitBtn.innerHTML;
    cancel.addEventListener('click', () => {
      state.editingId = null; form.reset(); setToday(prefix);
      submitBtn.innerHTML = origLabel; cancel.style.display = 'none';
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = readForm(prefix);
      const errEl = $(prefix === 'fMasuk' ? 'errMasuk' : 'errKeluar');
      const inputEl = $(prefix + 'Nom');
      if (!validate(v, errEl, inputEl)) { inputEl.focus(); return; }
      if (state.editingId) {
        const t = state.tx.find((x) => x.id === state.editingId);
        if (t) { t.date = v.date; t.desc = v.desc; t.amount = v.amount; if (v.cat) t.cat = v.cat; }
        state.editingId = null;
        submitBtn.innerHTML = origLabel; cancel.style.display = 'none';
        toast('Catatan diubah.');
      } else {
        state.tx.push({ id: uid(), type: v.type, date: v.date, desc: v.desc, amount: v.amount, cat: v.cat });
        toast((v.type === 'masuk' ? 'Masuk ' : 'Keluar ') + rp(v.amount) + ' tercatat.');
      }
      save(); form.reset(); setToday(prefix); render(false);
    });
    // edit dari daftar
    form._startEdit = (tx) => {
      state.editingId = tx.id;
      $(prefix + 'Tgl').value = tx.date;
      $(prefix + 'Ket').value = tx.desc;
      $(prefix + 'Nom').value = tx.amount;
      if (prefix === 'fKeluar' && tx.cat) $('fKeluarKat').value = tx.cat;
      submitBtn.innerHTML = 'Simpan perubahan';
      cancel.style.display = '';
      form.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
      $(prefix + 'Ket').focus();
    };
  }
  function setToday(prefix) { $(prefix + 'Tgl').value = todayISO(); }

  /* ---------- aksi daftar ---------- */
  $('txList').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const li = btn.closest('.tx-row');
    const tx = state.tx.find((t) => t.id === li.dataset.id);
    if (!tx) return;
    if (btn.dataset.act === 'del') {
      state.tx = state.tx.filter((t) => t.id !== tx.id);
      save(); render(false); toast('Catatan dihapus.');
    } else {
      const form = tx.type === 'masuk' ? $('formMasuk') : $('formKeluar');
      form._startEdit(tx);
    }
  });

  /* ---------- contoh & hapus ---------- */
  $('btnContoh').addEventListener('click', () => {
    state.tx = sampleData(); save(); render(true);
    toast('Contoh dimuat — 12 catatan 7 hari terakhir.');
  });
  $('btnHapusSemua').addEventListener('click', () => $('confirmBar').classList.add('show'));
  $('confirmBatal').addEventListener('click', () => $('confirmBar').classList.remove('show'));
  $('confirmYa').addEventListener('click', () => {
    state.tx = []; state.editingId = null;
    save(); render(false);
    $('confirmBar').classList.remove('show');
    toast('Semua catatan dihapus. Mulai dari nol lagi.');
  });
  $('txSearch').addEventListener('input', (e) => { state.search = e.target.value.trim(); renderTxList(); });

  /* ---------- periode ---------- */
  $$('.period-filters button').forEach((b) => {
    b.addEventListener('click', () => {
      state.period = b.dataset.period;
      $$('.period-filters button').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      render(false);
    });
  });
  $('timbangBtn').addEventListener('click', () => {
    render(true);
    $('verdictNumber').scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
  });

  /* ---------- bagikan ---------- */
  function copyText(text, okMsg) {
    const done = () => toast(okMsg);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); }
    catch (e) { toast('Gagal menyalin — salin manual ya.'); }
    document.body.removeChild(ta);
  }
  function summaryText() {
    const masuk = sum('masuk'), keluar = sum('keluar'), laba = masuk - keluar;
    const label = { today: 'hari ini', '7d': '7 hari terakhir', '30d': '30 hari terakhir', month: 'bulan ini', all: 'semua waktu' }[state.period];
    const verdict = laba > 0 ? 'LABA' : laba < 0 ? 'RUGI' : 'IMPAS';
    const margin = masuk > 0 ? ((laba / masuk) * 100).toFixed(1).replace('.', ',') + '%' : '—';
    return 'LABARUGI — ' + label + '\nMasuk: ' + rp(masuk) + '\nKeluar: ' + rp(keluar) +
      '\nSisa: ' + rp(laba) + ' (' + verdict + ')\nMargin: ' + margin + '\n— dicatat jujur oleh Pak Catat';
  }
  $('btnWA').addEventListener('click', () => copyText(summaryText(), 'Ringkasan disalin — tinggal tempel di WA.'));
  $('btnTautan').addEventListener('click', () => {
    if (!state.tx.length) { toast('Belum ada catatan untuk dibagikan.'); return; }
    copyText(shareLink(), 'Tautan disalin — yang buka tautan melihat datamu.');
  });
  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  $('btnCSV').addEventListener('click', () => {
    const rows = [['tanggal', 'tipe', 'kategori', 'keterangan', 'nominal']];
    state.tx.slice().sort((a, b) => (a.date < b.date ? -1 : 1)).forEach((t) => {
      rows.push([t.date, t.type, t.cat || '', '"' + t.desc.replace(/"/g, '""') + '"', t.amount]);
    });
    download('labarugi.csv', '﻿' + rows.map((r) => r.join(',')).join('\n'), 'text/csv;charset=utf-8');
    toast('CSV diunduh.');
  });
  $('btnJSON').addEventListener('click', () => {
    download('labarugi.json', JSON.stringify({ v: 1, exportedAt: new Date().toISOString(), tx: state.tx }, null, 2), 'application/json');
    toast('JSON diunduh.');
  });
  $('btnImpor').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        const arr = Array.isArray(data) ? data : data.tx;
        const clean = (arr || []).filter(validTx);
        if (!clean.length) { toast('File-nya tidak ada catatan yang valid.'); return; }
        state.tx = clean; save(); render(true);
        toast('JSON diimpor: ' + clean.length + ' catatan.');
      } catch (err) { toast('File-nya bukan JSON yang valid.'); }
      e.target.value = '';
    };
    r.readAsText(f);
  });
  $('btnCetak').addEventListener('click', () => window.print());

  /* ---------- divider dua dunia (desktop) ---------- */
  (function () {
    const divider = $('divider'), worlds = $('dunia');
    let ratio = 0.5, dragging = false;
    const wide = () => window.matchMedia('(min-width: 761px)').matches;
    const apply = () => {
      if (wide()) worlds.style.gridTemplateColumns = ratio + 'fr 76px ' + (1 - ratio) + 'fr';
      divider.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    };
    divider.addEventListener('pointerdown', (e) => {
      if (!wide()) return;
      dragging = true; divider.setPointerCapture(e.pointerId);
    });
    divider.addEventListener('pointermove', (e) => {
      if (!dragging || !wide()) return;
      const r = worlds.getBoundingClientRect();
      ratio = Math.min(0.75, Math.max(0.25, (e.clientX - r.left) / r.width));
      apply();
    });
    divider.addEventListener('pointerup', () => { dragging = false; });
    divider.addEventListener('pointercancel', () => { dragging = false; });
    divider.addEventListener('keydown', (e) => {
      if (!wide()) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        ratio = Math.min(0.75, Math.max(0.25, ratio + (e.key === 'ArrowRight' ? 0.05 : -0.05)));
        apply();
      }
    });
    window.addEventListener('resize', () => { worlds.style.gridTemplateColumns = ''; });
  })();

  /* ---------- easter egg: ketuk stempel 5x ---------- */
  (function () {
    let taps = 0, timer = null;
    const st = $('stamp');
    st.parentElement.style.pointerEvents = 'auto';
    st.parentElement.style.cursor = 'pointer';
    st.parentElement.setAttribute('role', 'button');
    st.parentElement.setAttribute('tabindex', '0');
    const tap = () => {
      taps++; clearTimeout(timer);
      timer = setTimeout(() => { taps = 0; }, 1600);
      if (taps >= 5) {
        taps = 0;
        const old = st.textContent;
        st.textContent = 'JUJUR ITU UNTUNG';
        st.classList.remove('slam'); void st.offsetWidth; st.classList.add('slam');
        toast('Pak Catat setuju.');
        setTimeout(() => { render(false); }, 2600);
      }
    };
    st.parentElement.addEventListener('click', tap);
    st.parentElement.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); } });
  })();

  /* ---------- gerak: toggle, marquee, spotlight, parallax, reveal ---------- */
  const motionToggle = $('motionToggle'), motionState = $('motionState');
  function setMotion(on) {
    document.documentElement.classList.toggle('no-motion', !on);
    motionToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    motionState.textContent = on ? 'nyala' : 'mati';
    try { localStorage.setItem(MOTION_KEY, on ? '1' : '0'); } catch (e) {}
  }
  let motionOn = true;
  try { motionOn = localStorage.getItem(MOTION_KEY) !== '0'; } catch (e) {}
  if (reducedMotion()) motionOn = false;
  setMotion(motionOn);
  motionToggle.addEventListener('click', () => {
    const isOff = document.documentElement.classList.contains('no-motion');
    setMotion(isOff);
  });

  const marqueePause = $('marqueePause'), marqueeWrap = $('marqueeWrap');
  marqueePause.addEventListener('click', () => {
    const paused = marqueeWrap.classList.toggle('marquee-paused');
    marqueePause.setAttribute('aria-pressed', paused ? 'true' : 'false');
    marqueePause.textContent = paused ? 'jalan' : 'jeda';
    marqueePause.setAttribute('aria-label', paused ? 'Jalankan tulisan berjalan' : 'Jeda tulisan berjalan');
  });

  // mode ringan
  if ((navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 ||
      (navigator.connection && navigator.connection.saveData)) {
    document.documentElement.classList.add('lite');
  }

  // spotlight
  if (window.matchMedia('(pointer: fine)').matches) {
    const sp = $('spotlight');
    let raf = null, sx = 0, sy = 0;
    window.addEventListener('pointermove', (e) => {
      sx = (e.clientX / innerWidth) * 100; sy = (e.clientY / innerHeight) * 100;
      if (!raf) raf = requestAnimationFrame(() => {
        sp.style.setProperty('--sx', sx + '%'); sp.style.setProperty('--sy', sy + '%');
        sp.classList.add('on'); raf = null;
      });
    }, { passive: true });
  }

  // reveal + parallax + outline-fill dalam satu loop rAF.
  // CATATAN: reveal TIDAK pakai IntersectionObserver — Chromium melaporkan
  // isIntersecting=false untuk elemen ber-clip-path:circle(0%) (terbukti via tes),
  // sehingga reveal tidak pernah jalan. Pakai getBoundingClientRect yang deterministik.
  const pxLayers = $$('.px-layer');
  const fillTitles = $$('[data-fill]');
  const revealSecs = $$('.reveal');
  const motionOK = () => !reducedMotion() && !document.documentElement.classList.contains('no-motion') && !document.documentElement.classList.contains('lite');

  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const vh = innerHeight;
      // reveal: selalu jalan di semua mode (CSS yang mematikan animasinya bila perlu)
      revealSecs.forEach((s) => {
        if (s.classList.contains('in')) return;
        const r = s.getBoundingClientRect();
        if (r.top < vh * 0.88 && r.bottom > 0) s.classList.add('in');
      });
      if (!motionOK()) return;
      pxLayers.forEach((l) => {
        const sp = parseFloat(l.dataset.speed || '0.1');
        const r = l.parentElement.getBoundingClientRect();
        l.style.transform = 'translateY(' + (-r.top * sp).toFixed(1) + 'px)';
      });
      fillTitles.forEach((t) => {
        const r = t.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.45)));
        t.style.setProperty('--fillp', (p * 100).toFixed(1) + '%');
      });
      // zoom-out di akhir: bingkai footer mengecil saat masuk viewport
      const foot = document.querySelector('.label-foot .label-frame');
      if (foot) {
        const r = foot.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9)));
        foot.style.transform = 'scale(' + (1.12 - 0.12 * p).toFixed(3) + ')';
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- init ---------- */
  $('headDate').textContent = fmtDay.format(new Date());
  setToday('fMasuk'); setToday('fKeluar');
  const fromLink = loadFromLink();
  bindForm('formMasuk', 'fMasuk');
  bindForm('formKeluar', 'fKeluar');
  render(false);
  if (!state.tx.length && !fromLink) {
    setTimeout(() => toast('Selamat datang di meja Pak Catat — coba "isi contoh" dulu.'), 900);
  }
})();
