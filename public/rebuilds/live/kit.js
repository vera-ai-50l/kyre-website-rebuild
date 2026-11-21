// Kyre live rebuilds: shared helpers. Each app is fictional and runs on sample data in the page.
window.K = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const qs = new URLSearchParams(location.search);
  const embed = qs.has('embed');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- Icons (16px grid, 1.5 stroke) ----------
  const I = {
    grid: '<rect x="2" y="2" width="5" height="5" rx="1.2"/><rect x="9" y="2" width="5" height="5" rx="1.2"/><rect x="2" y="9" width="5" height="5" rx="1.2"/><rect x="9" y="9" width="5" height="5" rx="1.2"/>',
    target: '<circle cx="8" cy="8" r="5.8"/><circle cx="8" cy="8" r="2.6"/>',
    layers: '<path d="M8 2.2 14 5.3 8 8.4 2 5.3Z"/><path d="M2 8.2l6 3.1 6-3.1M2 11l6 3 6-3"/>',
    users: '<circle cx="6" cy="5.5" r="2.5"/><path d="M1.8 13.5c.5-2.4 2.2-3.7 4.2-3.7s3.7 1.3 4.2 3.7M10.5 3.2a2.4 2.4 0 0 1 0 4.6M12 9.9c1.2.5 2 1.6 2.3 3.6"/>',
    user: '<circle cx="8" cy="5.5" r="2.8"/><path d="M2.8 14c.6-2.8 2.6-4.3 5.2-4.3s4.6 1.5 5.2 4.3"/>',
    file: '<path d="M4 1.8h5l3 3v9.4H4z"/><path d="M9 1.8v3h3M6 8.5h4M6 11h4"/>',
    cal: '<rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"/>',
    chev: '<path d="M4.5 6.5 8 10l3.5-3.5"/>',
    chevr: '<path d="M6.5 4.5 10 8l-3.5 3.5"/>',
    left: '<path d="M10 4.5 6.5 8l3.5 3.5"/>',
    updown: '<path d="M5 6l3-3 3 3M5 10l3 3 3-3"/>',
    plus: '<path d="M8 3v10M3 8h10"/>',
    x: '<path d="M4 4l8 8M12 4l-8 8"/>',
    search: '<circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/>',
    check: '<path d="m3.5 8.5 3 3 6-7"/>',
    arrow: '<path d="M5 11 11 5M6 5h5v5"/>',
    right: '<path d="M3 8h10M9 4l4 4-4 4"/>',
    share: '<path d="M8 10V2.5M5 5.5l3-3 3 3M3 9.5v4h10v-4"/>',
    copy: '<rect x="5" y="5" width="8.5" height="8.5" rx="1.5"/><path d="M10.5 5V3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5H5"/>',
    up: '<path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"/>',
    refresh: '<path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9"/><path d="M13.5 2.5v3h-3"/>',
    key: '<circle cx="5.5" cy="10.5" r="3"/><path d="m7.6 8.4 6-6M11.5 4.5 13 6"/>',
    info: '<circle cx="8" cy="8" r="6"/><path d="M8 7.2v3.6M8 5.2v.1"/>',
    down: '<path d="M8 2.5V11M4.5 7.5 8 11l3.5-3.5M3 13.5h10"/>',
    clip: '<path d="M13 7.5 8 12.5a3.2 3.2 0 0 1-4.5-4.5l5.3-5.3a2.1 2.1 0 0 1 3 3L6.5 11a1 1 0 0 1-1.5-1.5L10 4.5"/>',
    lock: '<rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/>',
    send: '<path d="M14 2 7 9M14 2l-4.5 12L7 9 2 6.5z"/>',
    dots: '<path d="M3.5 8h.1M8 8h.1M12.5 8h.1" stroke-width="2.2"/>',
    filter: '<path d="M2.5 4h11M4.5 8h7M6.5 12h3"/>',
    bell: '<path d="M4 11V7a4 4 0 0 1 8 0v4l1 1.5H3z"/><path d="M6.5 14h3"/>',
    sliders: '<path d="M2.5 4.5h6.5M12 4.5h1.5M2.5 11.5h1.5M7 11.5h6.5"/><circle cx="10.5" cy="4.5" r="1.5"/><circle cx="5.5" cy="11.5" r="1.5"/>',
    play: '<path d="M5 3.5v9l7.5-4.5z"/>',
    stop: '<rect x="4" y="4" width="8" height="8" rx="1.5"/>',
    card: '<rect x="1.8" y="3.5" width="12.4" height="9" rx="1.6"/><path d="M1.8 6.5h12.4M4.5 10h2"/>',
    bank: '<path d="M2 6 8 2.5 14 6M3.5 6.5v5M6.5 6.5v5M9.5 6.5v5M12.5 6.5v5M2 13.5h12"/>',
    refund: '<path d="M5.5 3.5 2.5 6.5l3 3"/><path d="M2.5 6.5H10a3.5 3.5 0 0 1 0 7H7"/>',
    clock: '<circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2.2 1.4"/>',
    link: '<path d="M6.8 9.2a2.6 2.6 0 0 0 3.7 0l2.2-2.2a2.6 2.6 0 0 0-3.7-3.7l-.8.8"/><path d="M9.2 6.8a2.6 2.6 0 0 0-3.7 0L3.3 9a2.6 2.6 0 0 0 3.7 3.7l.8-.8"/>',
    inbox: '<path d="M2 9.5 3.8 3.5h8.4L14 9.5v3.5H2z"/><path d="M2 9.5h3.5l1 1.5h3l1-1.5H14"/>',
    mail: '<rect x="2" y="3.5" width="12" height="9" rx="1.6"/><path d="m2.5 4.5 5.5 4 5.5-4"/>',
    phone: '<path d="M5.6 2.5H3.5a1 1 0 0 0-1 1.1 10.5 10.5 0 0 0 9.9 9.9 1 1 0 0 0 1.1-1v-2.1l-2.7-1-1.3 1.3a7 7 0 0 1-3.2-3.2L7.6 6.2 6.6 3.5z"/>',
    bolt: '<path d="M9 1.8 3.5 9h4L7 14.2 12.5 7h-4z"/>',
    ext: '<path d="M9.5 2.5h4v4M13.5 2.5 7.5 8.5M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3"/>',
    eye: '<path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/>',
    trend: '<path d="M2 12l4-4 3 2.5L14 5"/><path d="M10.5 5H14v3.5"/>',
    repeat: '<path d="M3 7V6a2.5 2.5 0 0 1 2.5-2.5H13M11 1.5l2 2-2 2M13 9v1a2.5 2.5 0 0 1-2.5 2.5H3M5 14.5l-2-2 2-2"/>',
    code: '<path d="M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5"/>',
    flag: '<path d="M3.5 14V2.5M3.5 3h8l-1.5 3 1.5 3h-8"/>',
    building: '<rect x="3" y="2" width="7" height="12" rx="1"/><path d="M10 6h2.5a.5.5 0 0 1 .5.5V14M2 14h12M5.5 5h2M5.5 8h2M5.5 11h2"/>',
    list: '<path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.1M2.5 8h.1M2.5 12h.1"/>',
    board: '<rect x="2" y="2.5" width="3.5" height="11" rx="1"/><rect x="6.25" y="2.5" width="3.5" height="7" rx="1"/><rect x="10.5" y="2.5" width="3.5" height="9" rx="1"/>',
    edit: '<path d="M10.5 2.5l3 3-8 8H2.5v-3z"/>',
    qr: '<rect x="2" y="2" width="4.5" height="4.5" rx=".8"/><rect x="9.5" y="2" width="4.5" height="4.5" rx=".8"/><rect x="2" y="9.5" width="4.5" height="4.5" rx=".8"/><path d="M9.5 9.5h2v2M14 9.5v.1M9.5 14h.1M12 14h2v-2"/>',
    globe: '<circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c1.8 1.7 2.6 3.7 2.6 6S9.8 12.3 8 14C6.2 12.3 5.4 10.3 5.4 8S6.2 3.7 8 2z"/>',
    warn: '<path d="M8 2.2 14.2 13H1.8z"/><path d="M8 6.5v3M8 11.2v.1"/>',
    pulse: '<path d="M1.5 8h3l2-4.5 3 9 2-4.5h3"/>',
    cycle: '<circle cx="8" cy="8" r="5.5"/><path d="M8 4.5v3.5l2.5 1.5"/>',
    note: '<path d="M3 2.5h10v11H3z"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3"/>',
    hash: '<path d="M6 2.5 5 13.5M11 2.5l-1 11M2.5 6h11M2 10h11"/>',
  };
  document.body.insertAdjacentHTML('afterbegin', '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' +
    Object.entries(I).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 16 16">${v}</symbol>`).join('') + '</svg>');
  const ic = (n, c = '') => `<svg class="ic ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  // ---------- Numbers and dates ----------
  const money = (n, d = 0) => (n < 0 ? '−$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const num = n => Math.round(n).toLocaleString('en-US');
  const compact = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'k' : String(Math.round(n));
  const delta = (a, b) => (b ? (a - b) / b * 100 : 0);
  const TODAY = new Date(2026, 10, 19);                          // the apps are frozen on 19 Nov 2026
  const day = off => new Date(2026, 10, 19 - off);
  const fdate = (d, o = { month: 'short', day: 'numeric' }) => d.toLocaleDateString('en-US', o);

  // Seeded RNG (mulberry32), so the sample data is identical on every load.
  const rng = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  // n daily values with a steady trend, a weekly rhythm and noise; windows are rescaled to exact totals with fit().
  const series = (n, seed, { growth = 1, noise = .18, weekly = .12 } = {}) => {
    const r = rng(seed), b = Math.log(growth) / 30;
    return Array.from({ length: n }, (_, i) => Math.exp(b * i) * (1 + weekly * Math.sin((i + seed) * 2 * Math.PI / 7)) * (1 + noise * (r() - .5) * 2));
  };
  const sum = a => a.reduce((s, v) => s + v, 0);
  const fit = (a, from, to, total) => { const f = total / sum(a.slice(from, to)); for (let i = from; i < to; i++) a[i] *= f; return f; };

  // ---------- Routing (#page or #page/id) ----------
  let onRoute = () => {};
  const route = (def, cb) => {
    onRoute = () => {
      const [page = '', ...rest] = location.hash.slice(1).split('/');
      const pg = $(`[data-page="${page}"]`) ? page : def;
      $$('[data-page]').forEach(p => p.hidden = p.dataset.page !== pg);
      $$('a.nav[href^="#"]').forEach(a => a.getAttribute('href').slice(1) === pg ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
      cb && cb(pg, rest.join('/'));
    };
    addEventListener('hashchange', onRoute);
    onRoute();
  };
  const go = h => { embed ? (history.replaceState(null, '', '#' + h), onRoute()) : (location.hash = h); };
  // Inside the showcase, page changes replace history so the visitor's Back button still leaves the page.
  if (embed) document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (a && !e.defaultPrevented) { e.preventDefault(); go(a.getAttribute('href').slice(1)); }
  });

  // ---------- Overlays ----------
  const scrim = document.createElement('div');
  scrim.className = 'scrim'; scrim.hidden = true;
  const layer = (cls) => { const el = document.createElement('div'); el.className = cls; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); return el; };
  const drawerEl = layer('drawer'), modalEl = layer('modal');
  const toastEl = document.createElement('div');
  toastEl.className = 'toast'; toastEl.setAttribute('role', 'status');
  document.body.append(scrim, drawerEl, modalEl, toastEl);
  let openEl = null, onClose = null, lastFocus = null;
  const open = (el, html, close) => {
    if (openEl && openEl !== el) shut(true);
    lastFocus = document.activeElement;
    el.innerHTML = html; el.hidden = scrim.hidden = false; onClose = close;
    void el.offsetWidth;
    el.classList.add('on'); scrim.classList.add('on');
    openEl = el;
    setTimeout(() => (el.querySelector('[autofocus]') || el.querySelector('button, input, select, textarea, [tabindex]'))?.focus({ preventScroll: true }), 60);
    return el;
  };
  const shut = (now) => {
    if (!openEl) return;
    const el = openEl, cb = onClose;
    openEl = onClose = null;
    el.classList.remove('on'); scrim.classList.remove('on');
    const done = () => { if (openEl !== el) el.hidden = true; if (!openEl) scrim.hidden = true; };
    now ? done() : setTimeout(done, 380);
    cb && cb();
    lastFocus?.focus?.({ preventScroll: true });
  };
  scrim.addEventListener('click', () => shut());
  [drawerEl, modalEl].forEach(el => el.addEventListener('click', e => { if (e.target.closest('[data-close]')) shut(); }));
  const drawer = (html, close) => open(drawerEl, html, close);
  const modal = (html, close) => open(modalEl, html, close);

  let tt;
  const toast = (msg, icon = 'check') => {
    toastEl.innerHTML = ic(icon) + esc(msg);
    toastEl.classList.add('on');
    clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('on'), 2600);
  };

  // Dropdown menu under a button. items: [{v, label, on}]
  let menuEl = null;
  const closeMenu = () => { menuEl?.remove(); menuEl = null; };
  const menu = (anchor, items, pick) => {
    const was = menuEl?._a === anchor;
    closeMenu();
    if (was) return;
    menuEl = document.createElement('div');
    menuEl.className = 'menu'; menuEl.setAttribute('role', 'menu'); menuEl._a = anchor;
    menuEl.innerHTML = items.map(i => i.sep ? '<hr>' : `<button type="button" role="menuitemradio" aria-checked="${!!i.on}" data-v="${esc(i.v)}">${i.label}</button>`).join('');
    document.body.append(menuEl);
    const r = anchor.getBoundingClientRect(), w = menuEl.offsetWidth, h = menuEl.offsetHeight;
    const x = Math.max(8, Math.min(r.left, innerWidth - w - 8)), y = r.bottom + 6 + h > innerHeight ? r.top - 6 - h : r.bottom + 6;
    menuEl.style.left = x + 'px'; menuEl.style.top = y + 'px';
    menuEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { closeMenu(); pick(b.dataset.v); } });
    menuEl.querySelector('[aria-checked="true"], button')?.focus({ preventScroll: true });
  };
  document.addEventListener('pointerdown', e => { if (menuEl && !menuEl.contains(e.target) && !menuEl._a.contains(e.target)) closeMenu(); });

  const typing = t => t.closest('input, textarea, select, [contenteditable]');
  // Single-key shortcuts, ignored while typing. keys({ c: fn, '/': fn, Escape: fn })
  const km = {}, keys = map => Object.assign(km, map);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (menuEl) return closeMenu(); if (openEl) return shut(); }
    if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target) || openEl) return;
    const f = km[e.key] || km[e.key.toLowerCase()];
    if (f) { e.preventDefault(); f(e); }
  });

  // ---------- Charts ----------
  let uid = 0;
  // Line chart with an optional previous-period line, hover guide and tooltip. tip(i) returns the tooltip's HTML.
  const line = (el, { cur, prev, tip, max }) => {
    if (!el._svg) {
      const id = 'g' + ++uid;
      el.classList.add('chart');
      el.innerHTML = `<svg viewBox="0 0 600 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".16"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path class="grid" d="M0 25H600M0 50H600M0 75H600"/><path class="area" fill="url(#${id})"/><path class="ln prev"/><path class="ln"/></svg><span class="guide"></span><span class="dot"></span><div class="tip"></div>`;
      el._svg = el.firstChild;
      const [, , area, pl, ln] = el._svg.children;
      Object.assign(el, { _area: area, _pl: pl, _ln: ln, _guide: $('.guide', el), _dot: $('.dot', el), _tip: $('.tip', el) });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), n = el._pts.length;
        const i = Math.max(0, Math.min(n - 1, Math.round((e.clientX - r.left) / r.width * (n - 1))));
        if (i === el._i) return;
        el._i = i;
        const [x, y] = el._pts[i], p = x / 6;
        el._guide.style.left = el._dot.style.left = el._tip.style.left = p + '%';
        el._dot.style.top = y + '%';
        el._tip.style.setProperty('--tx', p < 16 ? '-8%' : p > 84 ? '-92%' : '-50%');
        el._tip.innerHTML = el._tipf(i);
        el.classList.add('hover');
      });
      el.addEventListener('pointerleave', () => { el._i = -1; el.classList.remove('hover'); });
    }
    // Lines don't need a zero baseline: the domain hugs the data so the trend is readable.
    const all = [...cur, ...(prev || [])], mn = Math.min(...all), mx = max || Math.max(...all), span = (mx - mn) || mx || 1;
    const lo = Math.max(0, mn - span * .7), hi = mx + span * .12, n = cur.length;
    const pts = a => a.map((v, i) => [n > 1 ? i / (n - 1) * 600 : 300, 96 - (v - lo) / (hi - lo) * 88]);
    const d = p => 'M' + p.map(([x, y]) => x.toFixed(1) + ' ' + y.toFixed(1)).join('L');
    const setD = (path, dd) => { path.setAttribute('d', dd); path.style.d = dd ? `path("${dd}")` : 'none'; };
    el._pts = pts(cur); el._tipf = tip; el._i = -1;
    setD(el._ln, d(el._pts));
    setD(el._area, d(el._pts) + 'L600 100L0 100Z');
    setD(el._pl, prev ? d(pts(prev)) : '');
  };

  // Bar chart. tip(i) returns the tooltip's HTML; on = highlighted bar index.
  const bars = (el, vals, { tip, on = -1, max } = {}) => {
    const m = max || Math.max(...vals) * 1.08 || 1;
    el.classList.add('chart', 'bars');
    el.innerHTML = vals.map((v, i) => `<span class="${i === on ? 'on' : ''}" style="height:${Math.max(2, v / m * 100)}%"></span>`).join('') + '<div class="tip"></div>';
    if (!tip) return;
    const t = $('.tip', el), bs = $$('span', el);
    el.onpointermove = e => {
      const b = e.target.closest('.bars > span');
      if (!b) return;
      const i = bs.indexOf(b), p = (b.offsetLeft + b.offsetWidth / 2) / el.offsetWidth * 100;
      t.style.left = p + '%'; t.style.top = (b.offsetTop - 6) + 'px';
      t.style.setProperty('--tx', p < 16 ? '-8%' : p > 84 ? '-92%' : '-50%');
      t.innerHTML = tip(i);
      el.classList.add('hover');
    };
    el.onpointerleave = () => el.classList.remove('hover');
  };

  // Sparkline; the floor on the range keeps a flat series looking flat.
  const spark = (a, cls = '') => {
    const mn = Math.min(...a), mx = Math.max(...a), r = Math.max(mx - mn, sum(a) / a.length * .25) || 1;
    return `<svg class="spark ${cls}" viewBox="0 0 72 22" aria-hidden="true"><path d="M${a.map((v, i) => (1 + i / (a.length - 1) * 70).toFixed(1) + ' ' + (19 - (v - mn) / r * 16).toFixed(1)).join('L')}"/></svg>`;
  };

  // Click-to-sort table headers. state: { key, dir }; th[data-sort] (data-dir="asc" to sort ascending first).
  const sortable = (table, state, render) => {
    table.tHead.addEventListener('click', e => {
      const th = e.target.closest('th[data-sort]');
      if (!th) return;
      const k = th.dataset.sort;
      state.dir = state.key === k ? -state.dir : th.dataset.dir === 'asc' ? 1 : -1;
      state.key = k;
      render();
    });
    return () => $$('th[data-sort]', table).forEach(th => th.dataset.sort === state.key ? th.setAttribute('aria-sort', state.dir > 0 ? 'ascending' : 'descending') : th.removeAttribute('aria-sort'));
  };
  const by = (key, dir) => (a, b) => { const x = typeof key === 'function' ? key(a) : a[key], y = typeof key === 'function' ? key(b) : b[key]; return (x > y ? 1 : x < y ? -1 : 0) * dir; };

  // ---------- Kyre notes: hover any [data-note] to see its size and why it's built that way ----------
  let notes = embed || qs.has('notes'), cur = null, nt;
  const box = document.createElement('div'), note = document.createElement('p');
  box.className = 'rl-box'; note.className = 'rl-note';
  box.setAttribute('aria-hidden', 'true'); note.setAttribute('aria-hidden', 'true');
  document.body.append(box, note);
  const hideNote = () => { cur = null; clearTimeout(nt); document.body.classList.remove('rl-on'); };
  const showNote = el => {
    const r = el.getBoundingClientRect(), W = innerWidth, H = innerHeight, nw = 236;
    box.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
    box.dataset.dim = `${Math.round(r.width)} × ${Math.round(r.height)}`;
    box.classList.toggle('low', r.top < 34);
    note.textContent = el.dataset.note;
    let x, y = Math.max(8, Math.min(r.top, H - note.offsetHeight - 8));
    if (W - r.right - 18 >= nw) x = r.right + 16;
    else if (r.left - 18 >= nw) x = r.left - 16 - nw;
    else {
      x = Math.max(8, Math.min(r.left + 12, W - nw - 8));
      y = r.bottom + 14 + note.offsetHeight < H ? r.bottom + 14 : Math.max(8, r.top - note.offsetHeight - 30);
    }
    note.style.transform = `translate(${x}px,${y}px)`;
    document.body.classList.add('rl-on');
  };
  if (fine) {
    document.addEventListener('pointerover', e => {
      if (!notes || openEl || menuEl) return;
      const el = e.target.closest('[data-note]');
      if (el === cur) return;
      if (!el) return hideNote();
      cur = el; clearTimeout(nt);
      nt = setTimeout(() => showNote(el), document.body.classList.contains('rl-on') ? 0 : 260);
    });
    document.addEventListener('pointerout', e => { if (!e.relatedTarget) hideNote(); });
    document.addEventListener('pointerdown', hideNote);
    document.addEventListener('scroll', hideNote, true);
  }

  // ---------- Bar shown when an app is opened on its own ----------
  if (!embed) {
    const b = document.body.dataset, bar = document.createElement('div');
    bar.className = 'kbar';
    bar.innerHTML = `<i></i><b>${esc(b.app)}</b><span class="long">is a fictional ${esc(b.kind)}, rebuilt by Kyre. Everything here runs on sample data.</span><a href="../index.html#${esc(b.app.toLowerCase())}">See the AI-built version</a>` +
      (fine ? `<label>Kyre notes<button class="switch" type="button" role="switch" aria-checked="${notes}" aria-label="Show Kyre's notes on hover"></button></label>` : '');
    document.body.prepend(bar);
    document.documentElement.style.setProperty('--kb', '36px');
    $('.switch', bar)?.addEventListener('click', e => { notes = !notes; e.currentTarget.setAttribute('aria-checked', notes); hideNote(); toast(notes ? 'Hover anything outlined to see why it is built that way' : 'Notes off', notes ? 'info' : 'check'); });
  }

  return { $, $$, embed, fine, esc, ic, money, num, compact, delta, TODAY, day, fdate, rng, series, sum, fit, route, go, drawer, modal, shut, toast, menu, closeMenu, keys, line, bars, spark, sortable, by };
})();
