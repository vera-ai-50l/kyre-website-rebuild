"use client";

import { useEffect, useRef, useState } from "react";
import { isLite, LITE_EVENT } from "./useLite";
import s from "./hero.module.css";

/* The room's floor, as a field of dots that notices you.

   Near the pointer the dots swell and lean away from it, Kyre blue at the
   edge of the light and orange at its centre; a click or a tap sends a ring of the same through the whole field,
   and one ring goes out on its own when the page opens, so it is found.

   It costs nothing until something moves: the canvas is drawn once, then only
   on frames where the pointer is easing or a ring is still travelling, and the
   loop stops itself the moment both are still. Plain 2D, one fillRect per
   resting dot and an arc only for the few that are lit, so it is cheap on a
   machine drawing without a GPU as well. */

const GAP = 26;
const REACH = 230;
const PUSH = 20;
const RING_SPEED = 0.62; // px per ms
const RING_LIFE = 1700; // ms
const RING_BAND = 46;

/* Two lights, never mixed (the straight line between blue and orange runs
   through a muddy violet): blue in the outer half of the light, orange at
   its core, each brighter as it nears the centre. 24 steps. */
const RAMP = Array.from({ length: 24 }, (_, i) => {
  const t = i / 23;
  const a = (0.4 + 0.58 * t).toFixed(2);
  return t < 0.5 ? `rgba(47,76,255,${a})` : `rgba(255,74,31,${a})`;
});
const REST = "rgba(28, 36, 80, 0.18)";

function CanvasField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let pts = new Float32Array(0);

    /* Where the pointer is (t*) and where the light has caught up to. */
    let tx = -1e4;
    let ty = -1e4;
    let px = -1e4;
    let py = -1e4;
    let amt = 0;
    let tAmt = 0;
    const rings: { x: number; y: number; t: number }[] = [];

    let raf = 0;
    let last = 0;
    let visible = true;
    let rect = cv.getBoundingClientRect();

    const draw = (now: number) => {
      raf = 0;
      const dt = Math.min(now - last || 16, 64);
      last = now;

      const k = 1 - Math.exp(-dt / 90);
      px += (tx - px) * k;
      py += (ty - py) * k;
      amt += (tAmt - amt) * (1 - Math.exp(-dt / 220));
      for (let i = rings.length - 1; i >= 0; i--) if (now - rings[i].t > RING_LIFE) rings.splice(i, 1);

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = REST;
      const R2 = REACH * REACH;
      const lit: number[] = [];

      for (let i = 0; i < pts.length; i += 2) {
        let x = pts[i];
        let y = pts[i + 1];
        let heat = 0;
        let dx = x - px;
        let dy = y - py;
        const d2 = dx * dx + dy * dy;
        if (amt > 0.01 && d2 < R2) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / REACH) ** 2 * amt;
          x += (dx / d) * f * PUSH;
          y += (dy / d) * f * PUSH;
          heat = f;
        }
        for (const r of rings) {
          const age = now - r.t;
          const rad = age * RING_SPEED;
          dx = pts[i] - r.x;
          dy = pts[i + 1] - r.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const off = Math.abs(d - rad);
          if (off < RING_BAND) {
            const g = (1 - off / RING_BAND) * (1 - age / RING_LIFE);
            x += (dx / d) * g * 9;
            y += (dy / d) * g * 9;
            heat = Math.max(heat, g * 0.9);
          }
        }
        if (heat > 0.04) lit.push(x, y, heat);
        else ctx.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
      }

      for (let i = 0; i < lit.length; i += 3) {
        const h = lit[i + 2];
        ctx.fillStyle = RAMP[Math.min(23, Math.floor(h * 24))];
        ctx.beginPath();
        ctx.arc(lit[i], lit[i + 1], 1 + h * 3.4, 0, Math.PI * 2);
        ctx.fill();
      }

      const settling = Math.abs(tx - px) + Math.abs(ty - py) > 0.5 || Math.abs(tAmt - amt) > 0.01;
      if (visible && (settling || rings.length)) raf = requestAnimationFrame(draw);
    };

    const kick = () => {
      if (raf || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };

    const build = () => {
      rect = cv.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      const dpr = isLite() ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(W / GAP) + 1;
      const rows = Math.ceil(H / GAP) + 1;
      const ox = (W - (cols - 1) * GAP) / 2;
      const oy = (H - (rows - 1) * GAP) / 2;
      pts = new Float32Array(cols * rows * 2);
      let n = 0;
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          pts[n++] = ox + i * GAP;
          pts[n++] = oy + j * GAP;
        }
      last = performance.now();
      draw(last);
    };

    const ro = new ResizeObserver(build);
    ro.observe(cv);
    window.addEventListener(LITE_EVENT, build);
    build();
    if (reduced) {
      return () => {
        ro.disconnect();
        window.removeEventListener(LITE_EVENT, build);
      };
    }

    /* The viewport is sticky, so its box only moves while the reel enters or
       leaves; reading it per move is cheap and always right. */
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      rect = cv.getBoundingClientRect();
      tx = e.clientX - rect.left;
      ty = e.clientY - rect.top;
      if (px < -1e3) {
        px = tx;
        py = ty;
      }
      tAmt = 1;
      kick();
    };
    const onLeave = () => {
      tAmt = 0;
      kick();
    };
    const ring = (x: number, y: number) => {
      if (rings.length > 4) rings.shift();
      rings.push({ x, y, t: performance.now() });
      kick();
    };
    const onDown = (e: PointerEvent) => {
      if (!visible) return;
      if ((e.target as Element | null)?.closest("a, button, input, label, [role=group]")) return;
      rect = cv.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > W || y > H) return;
      ring(x, y);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(cv);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown, { passive: true });
    const intro = window.setTimeout(() => ring(W / 2, H * 0.42), 700);

    return () => {
      window.clearTimeout(intro);
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener(LITE_EVENT, build);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return <canvas ref={ref} className={s.dots} aria-hidden />;
}

/* The same field for a machine drawing without a GPU, where re-uploading a
   window-sized canvas every frame is the whole frame budget (measured: ~95% of
   the main thread while the pointer moves). Nothing here is ever redrawn:

   - the resting dots are one static background, painted once;
   - two soft lenses follow the pointer, a wide blue one and a tight orange one.
     Each is a moving window onto a sheet of coloured dots that is moved the
     other way by the same amount, so the dots inside stay put on the screen
     and lie exactly over the resting ones: the light passes over the grid
     rather than dragging a picture of it.

   Both moves are transforms, so the compositor does them without a repaint.
   No push and no rings here; on load the lenses show once over the headline
   so the field is still found. */
function LensField() {
  const blue = useRef<HTMLSpanElement>(null);
  const hot = useRef<HTMLSpanElement>(null);
  const host = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = host.current;
    const lenses = [blue.current, hot.current];
    if (!el || lenses.some((l) => !l)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    let last = 0;
    let started = false;

    const place = () => {
      for (const l of lenses) {
        const r = l!.offsetWidth / 2;
        l!.style.transform = `translate3d(${x - r}px, ${y - r}px, 0)`;
        (l!.firstElementChild as HTMLElement).style.transform = `translate3d(${r - x}px, ${r - y}px, 0)`;
      }
    };
    const tick = (now: number) => {
      raf = 0;
      const k = 1 - Math.exp(-Math.min(now - last, 64) / 90);
      last = now;
      x += (tx - x) * k;
      y += (ty - y) * k;
      place();
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.5) raf = requestAnimationFrame(tick);
    };
    const go = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const show = (on: boolean) => {
      if (on) el.dataset.on = "";
      else delete el.dataset.on;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!started) {
        x = tx;
        y = ty;
        started = true;
      }
      show(tx >= 0 && ty >= 0 && tx <= r.width && ty <= r.height);
      go();
    };
    const onLeave = () => show(false);

    /* Found on load: the light rests over the headline for a moment. */
    const r = el.getBoundingClientRect();
    x = tx = r.width / 2;
    y = ty = r.height * 0.42;
    place();
    show(true);
    const intro = window.setTimeout(() => {
      if (!started) show(false);
    }, 1600);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.clearTimeout(intro);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <span ref={host} className={s.lensField} aria-hidden>
      <span ref={blue} className={`${s.lens} ${s.lensBlue}`}>
        <span />
      </span>
      <span ref={hot} className={`${s.lens} ${s.lensHot}`}>
        <span />
      </span>
    </span>
  );
}

/* The canvas where there is a GPU to draw it; the lenses everywhere else, and
   the moment useLite.ts decides mid-visit that scrolling is slow. Chosen after
   mount, so the server and the first client render agree. */
export function DotField() {
  const [mode, setMode] = useState<"canvas" | "lens" | null>(null);
  useEffect(() => {
    const pick = () => setMode(isLite() ? "lens" : "canvas");
    pick();
    window.addEventListener(LITE_EVENT, pick);
    return () => window.removeEventListener(LITE_EVENT, pick);
  }, []);
  if (mode === "canvas") return <CanvasField />;
  if (mode === "lens") return <LensField />;
  return null;
}
