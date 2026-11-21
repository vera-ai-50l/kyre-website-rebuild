// Kyre Rebuilds: compare sliders over live rebuilds, red-pen marks, "view as AI built it".
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hand-drawn loop around every mark, sized in canvas px (offsetWidth ignores the scale transform).
  // Squarish targets get an ellipse; long ones a superellipse, so the pen hugs the box instead of cutting its corners.
  document.querySelectorAll('.mark').forEach((m, k) => {
    const w = m.offsetWidth, h = m.offsetHeight, long = w / h > 1.7 || h / w > 1.7;
    const rx = long ? w / 2 + 4 : w / 2 * 1.05 + 8, ry = long ? h / 2 + 4 : h / 2 * 1.16 + 8, ex = long ? .32 : 1;
    const a0 = -2.5 + (k % 4) * .35, n = 96, pts = [], sp = (v) => Math.sign(v) * Math.abs(v) ** ex;
    for (let j = 0; j <= n; j++) {
      const t = a0 + j / n * (Math.PI * 2 + .5), grow = 1 + .035 * j / n,
            wob = 1 + .018 * Math.sin(3 * t + k) + .008 * Math.sin(8 * t + 2 * k);
      pts.push((w / 2 + sp(Math.cos(t)) * rx * wob * grow).toFixed(1) + ' ' + (h / 2 + sp(Math.sin(t)) * ry * wob * grow).toFixed(1));
    }
    m.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M${pts.join('L')}"/></svg>`);
  });

  const frames = [...document.querySelectorAll('[data-frame]')].map(frame => {
    const view = frame.querySelector('.view'), knob = frame.querySelector('.knob');
    const segs = [...frame.querySelectorAll('[data-go]')];
    let pos = 100, touched = false, dragging = false;

    const set = (p, anim) => {
      pos = Math.max(0, Math.min(100, p));
      view.classList.toggle('anim', !!anim);
      view.style.setProperty('--pos', pos);
      const v = Math.round(pos), on = pos > 95 ? '100' : pos < 5 ? '0' : '';
      knob.setAttribute('aria-valuenow', v);
      knob.setAttribute('aria-valuetext', `${v}% AI-built, ${100 - v}% rebuild`);
      segs.forEach(b => b.setAttribute('aria-pressed', b.dataset.go === on));
    };

    new ResizeObserver(() => view.style.setProperty('--s', view.clientWidth / 1200)).observe(view);
    const at = x => { const r = view.getBoundingClientRect(); return (x - r.left) / r.width * 100; };

    // Mouse grabs from the AI-built side or the knob (the rebuild side is a live app); touch only from the knob, so scrolling still works.
    view.addEventListener('pointerdown', e => {
      if (e.button !== 0 || (e.pointerType !== 'mouse' && !knob.contains(e.target))) return;
      touched = dragging = true;
      view.classList.add('drag');
      view.setPointerCapture(e.pointerId);
      set(at(e.clientX));
    });
    view.addEventListener('pointermove', e => { if (dragging) set(at(e.clientX)); });
    const end = () => { dragging = false; view.classList.remove('drag'); };
    view.addEventListener('pointerup', end);
    view.addEventListener('pointercancel', end);

    knob.addEventListener('keydown', e => {
      const step = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -25, PageUp: 25 }[e.key];
      if (step) set(pos + step);
      else if (e.key === 'Home') set(0, true);
      else if (e.key === 'End') set(100, true);
      else return;
      touched = true;
      e.preventDefault();
    });
    segs.forEach(b => b.addEventListener('click', () => { touched = true; set(+b.dataset.go, true); }));


    // Intro: show the AI-built version, draw the marks, then sweep to the middle.
    set(100);
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      frame.classList.add('drawn');
      if (reduce) { if (!touched) set(50); return; }
      setTimeout(() => { if (!touched && !root.classList.contains("ai")) set(50, true); }, 3400);
    }, { threshold: .5 });
    io.observe(view);

    return { set: (p, anim) => { touched = true; set(p, anim); } };
  });

  // "View as AI built it": a redline wipe, then every [data-ai] swaps to its generic copy.
  const sw = document.getElementById('ai-switch'), wipe = document.querySelector('.wipe'), toast = document.querySelector('.ai-toast');
  let ai = false;
  const apply = () => {
    root.classList.toggle('ai', ai);
    document.querySelectorAll('[data-ai]').forEach(el => {
      if (el.dataset.orig === undefined) el.dataset.orig = el.innerHTML;
      if (ai) el.textContent = el.dataset.ai; else el.innerHTML = el.dataset.orig;
    });
    frames.forEach(f => f.set(ai ? 100 : 50, !reduce));
  };
  const toggle = () => {
    ai = !ai;
    sw.setAttribute('aria-checked', ai);
    toast.classList.toggle('show', ai);
    toast.inert = !ai;
    if (reduce) return apply();
    wipe.classList.remove('go');
    void wipe.offsetWidth;
    wipe.classList.add('go');
    setTimeout(apply, 360);
  };
  sw.addEventListener('click', toggle);
  toast.querySelector('button').addEventListener('click', toggle);

  // Scroll reveals.
  const rio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => rio.observe(el));
  setTimeout(() => document.querySelector('.hero').classList.add('drawn'), 80);

  // URL form opens a pre-filled email. ponytail: mailto, swap for a POST to your CRM or n8n webhook when you have one.
  const form = document.querySelector('.url-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const url = form.url.value.trim().replace(/^https?:\/\//i, '');
    if (!url) return form.url.focus();
    location.href = 'mailto:aditya@trykyre.com?subject=' + encodeURIComponent('Teardown request: ' + url) +
      '&body=' + encodeURIComponent('Our app: https://' + url + '\n\nWhat we would most like you to look at:\n');
    form.querySelector('.form-msg').textContent = 'Opening your mail app. If nothing happens, write to aditya@trykyre.com.';
  });
})();
