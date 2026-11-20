import { fracture } from "./fracture";
import type { Plate, Shatter } from "./scene";
import { THEME_EVENT } from "../useLite";

/* The break without WebGL.

   A laptop without a GPU (or with it switched off) gets no WebGL context in
   current browsers at all, so scene.ts cannot run and the old screen used to
   simply zoom away unbroken. This draws the same break with a 2D canvas: the
   same cells from fracture.ts, the same random numbers in the same order as
   scene.ts's build(), and each shard moved by the same formulas the vertex
   shader uses — worked out per shard on the CPU, which for under a hundred
   pieces is nothing. Each shard is the screenshot clipped to its outline and
   mapped with the affine transform its three corners give, then lit the way
   FRAG lights it: the room reflected on top, more at a glancing angle, a glint
   where it faces a lamp, and the cut stroked in the glass's own green-white.

   Before the crack the pane is whole and standing, and the flat picture in the
   markup already shows it; this canvas takes over only from the first crack
   (onActive tells the page when to hide that picture). */

const DIST = 1150;

type V3 = [number, number, number];
type Shard = {
  /* Outline about its own centre, in pane units (height 1, y up). */
  pts: [number, number][];
  wx: number;
  wy: number;
  order: number;
  size: number;
  r: [number, number, number, number];
  /* Three outline indices spread over the shard, for the texture mapping. */
  tri: [number, number, number];
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const ss = (n: number) => n * n * (3 - 2 * n);
const smooth = (a: number, b: number, x: number) => ss(clamp01((x - a) / (b - a)));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const norm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/* Rodrigues: v turned by t about a unit axis. */
function turnAbout(v: V3, a: V3, t: number): V3 {
  const c = Math.cos(t);
  const s = Math.sin(t);
  const d = dot(a, v) * (1 - c);
  return [
    v[0] * c + (a[1] * v[2] - a[2] * v[1]) * s + a[0] * d,
    v[1] * c + (a[2] * v[0] - a[0] * v[2]) * s + a[1] * d,
    v[2] * c + (a[0] * v[1] - a[1] * v[0]) * s + a[2] * d,
  ];
}

/* The room, as FRAG has it: a dim floor, a pale ceiling, a bright band. */
const box = (r: V3, c: V3, s: number) => smooth(1 - s, 1 - s * 0.3, dot(r, norm(c)));
function lamps(r: V3) {
  return (
    2.3 * box(r, [-0.55, 0.62, 0.55], 0.16) + 1.3 * box(r, [0.78, -0.12, 0.6], 0.11) + 1.1 * box(r, [0.16, 0.24, 1], 0.012)
  );
}
function env(r: V3) {
  return (
    mix(0.3, 0.9, smooth(-0.55, 0.75, r[1])) +
    0.6 * smooth(0.03, 0, Math.abs(r[1] - 0.3)) * smooth(-0.2, 0.5, r[2]) +
    lamps(r)
  );
}

function shardsFor(plate: Plate) {
  const ar = plate.w / plate.h;
  const cells = fracture(ar, [plate.impact[0] * ar, plate.impact[1]]);
  /* scene.ts's generator, drawn in the same order (four for the shard, six
     for each of its dust chips), so each shard gets the same numbers there. */
  let seed = 20240611;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const shards: Shard[] = cells.map((c) => {
    const wx = c.cx - ar / 2;
    const wy = 0.5 - c.cy;
    const r: Shard["r"] = [rnd(), rnd(), rnd(), rnd()];
    const chips = c.dist < 0.14 ? 4 : c.dist < 0.4 ? 2 : 1;
    for (let k = 0; k < chips * 6; k++) rnd();

    const pts = c.pts.map(([x, y]) => [x - ar / 2 - wx, 0.5 - y - wy] as [number, number]);
    /* The widest triangle on the outline, so the mapping is well conditioned. */
    let far = 0;
    for (let i = 1; i < pts.length; i++)
      if (Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]) > Math.hypot(pts[far][0] - pts[0][0], pts[far][1] - pts[0][1])) far = i;
    let best = 0;
    let third = 1;
    for (let i = 1; i < pts.length; i++) {
      if (i === far) continue;
      const a = Math.abs(
        (pts[far][0] - pts[0][0]) * (pts[i][1] - pts[0][1]) - (pts[far][1] - pts[0][1]) * (pts[i][0] - pts[0][0]),
      );
      if (a > best) {
        best = a;
        third = i;
      }
    }
    return { pts, wx, wy, order: c.order, size: c.size, r, tri: [0, far, third] };
  });
  const impact = [plate.impact[0] * ar - ar / 2, 0.5 - plate.impact[1]] as [number, number];
  return { shards, ar, impact };
}

/* The 2x3 matrix taking three image points onto three screen points. */
function affine(s: [number, number][], d: [number, number][]) {
  const [[x0, y0], [x1, y1], [x2, y2]] = s;
  const det = x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1);
  if (Math.abs(det) < 1e-9) return null;
  const solve = (k: 0 | 1) => {
    const [a, b, c] = [d[0][k], d[1][k], d[2][k]];
    return [
      (a * (y1 - y2) + b * (y2 - y0) + c * (y0 - y1)) / det,
      (a * (x2 - x1) + b * (x0 - x2) + c * (x1 - x0)) / det,
      (a * (x1 * y2 - x2 * y1) + b * (x2 * y0 - x0 * y2) + c * (x0 * y1 - x1 * y0)) / det,
    ];
  };
  const [a, c, e] = solve(0);
  const [b, d2, f] = solve(1);
  return [a, b, c, d2, e, f] as const;
}

export function mountShatter2D(
  given: HTMLCanvasElement,
  stage: HTMLElement,
  pick: () => Plate,
  onActive: (on: boolean) => void,
): Shatter {
  /* A canvas that was asked for WebGL and refused can still give 2D; if a
     browser disagrees, a fresh one takes its place. */
  let canvas = given;
  let ctx = canvas.getContext("2d");
  if (!ctx) {
    const fresh = canvas.cloneNode(false) as HTMLCanvasElement;
    canvas.replaceWith(fresh);
    canvas = fresh;
    ctx = canvas.getContext("2d");
  }
  if (!ctx) throw new Error("no 2d context");
  const g = ctx;
  const host = canvas.parentElement as HTMLElement;

  let plate: Plate | null = null;
  let img: HTMLImageElement | null = null;
  let built: ReturnType<typeof shardsFor> | null = null;
  let W = 1;
  let H = 1;
  let dpr = 1;
  let p = 0;
  let raf = 0;
  let dead = false;
  let active = false;

  const setActive = (on: boolean) => {
    if (on !== active) {
      active = on;
      onActive(on);
    }
  };

  const load = (next: Plate) => {
    plate = next;
    const im = new Image();
    im.decoding = "async";
    im.onload = () => {
      if (dead || plate !== next) return;
      img = im;
      built = shardsFor(next);
      kick();
    };
    im.src = next.src;
  };

  const resize = () => {
    W = host.clientWidth || 1;
    H = host.clientHeight || 1;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const want = pick();
    if (want !== plate) load(want);
    kick();
  };

  const draw = () => {
    raf = 0;
    const diag = clamp01((p - 0.21) / 0.11);
    const fly = clamp01((p - 0.4) / 0.17);
    const flyE = ss(fly);
    const crackE = 1 - (1 - diag) ** 3;

    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    /* Whole, or every piece gone: the markup (or nothing) shows. */
    if (!img || !built || diag <= 0 || fly >= 1) {
      setActive(false);
      return;
    }
    setActive(true);

    const S = stage.offsetHeight || 1;
    const { shards, ar, impact } = built;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const radius = (plate?.radius ?? 0.02) * ih;
    const camZ = flyE * 360;

    const drawn: { z: number; run: () => void }[] = [];

    for (const sh of shards) {
      const d = sh.order;
      const small = 1 - sh.size;
      const [rx, ry, rz, rw] = sh.r;
      const crack = smooth(0, 0.4, crackE * 2.9 - d * 1.05);
      const sa = clamp01(fly * 2.3 - d * 0.42 - rx * 0.36 - sh.size * 0.18);
      const away = ss(sa);
      const seated = crack * (1 - away);

      const relx = sh.wx - impact[0];
      const rely = sh.wy - impact[1];
      const dist = Math.hypot(relx, rely);
      const dx = relx / Math.max(dist, 1e-4);
      const dy = rely / Math.max(dist, 1e-4);
      const sw = (rz - 0.5) * 1.5;
      let fx = dx * Math.cos(sw) - dy * Math.sin(sw) + 0.36;
      let fy = dx * Math.sin(sw) + dy * Math.cos(sw) + 0.1;
      const fl = Math.hypot(fx, fy) || 1;
      fx /= fl;
      fy /= fl;

      const axis = norm([ry - 0.5 + 1e-4, rz - 0.5 + 1e-4, (rw - 0.5) * 0.6 + 1e-4]);
      const turn =
        seated * (rx - 0.5) * 0.1 + away * (0.45 + ry * 3.1) * mix(0.5, 1.7, small) * (rz > 0.5 ? 1 : -1);

      const far = smooth(0.3, 1, dist);
      const ox = dx * seated * 0.0009 * (0.3 + dist) + fx * away * mix(0.8, 0.22, far) * (0.3 + rx * 1.15 + small * 0.5);
      const oy =
        dy * seated * 0.0009 * (0.3 + dist) +
        fy * away * mix(0.8, 0.22, far) * (0.3 + rx * 1.15 + small * 0.5) -
        sa * sa * (0.08 + far * 0.6 + sh.size * 0.22);
      const oz = seated * (rw - 0.45) * 0.0035 + sa * sa * (0.22 + rw * 1.55 + small * 0.95) * mix(1, 0.42, far);

      const alpha = 1 - smooth(0.72, 1, sa);
      if (alpha <= 0.01) continue;

      /* Corners on screen, through the same 1150px perspective as the DOM. */
      const screen = sh.pts.map(([lx, ly]) => {
        const v = turnAbout([lx, ly, 0], axis, turn);
        const X = (sh.wx + v[0] + ox) * S;
        const Y = (sh.wy + v[1] + oy) * S;
        const Z = (v[2] + oz) * S + camZ;
        const k = DIST / Math.max(DIST - Z, 40);
        return [W / 2 + X * k, H / 2 - Y * k] as [number, number];
      });
      const zc = oz * S + camZ;

      const n = turnAbout([0, 0, 1], axis, turn);
      const front = n[2] >= 0;
      const ndv = Math.abs(n[2]);
      const F = (1 - ndv) ** 4;
      const N: V3 = front ? n : [-n[0], -n[1], -n[2]];
      const R: V3 = [2 * N[2] * N[0], 2 * N[2] * N[1], 2 * N[2] * N[2] - 1];
      const E = env(R);
      const sheen = Math.min(0.95, E * (0.03 + 0.8 * F) * 0.9 + lamps(R) * 0.06 * crack);
      /* A seated crack still catches the key light along its 45-degree bevel,
         which is what draws it in the WebGL version; a flat stroke stands in. */
      const edge = Math.min(1, 0.34 * (1 - away) + (E * E * E * (0.34 + 1.1 * F)) / 1.8) * crack;

      drawn.push({
        z: zc,
        run: () => {
          g.globalAlpha = alpha;
          /* The shard's outline, in screen space. Traced again after the
             picture is drawn: drawing it leaves the picture's own clip path
             current, and filling that would light the whole pane. */
          const trace = () => {
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
            g.beginPath();
            g.moveTo(screen[0][0], screen[0][1]);
            for (let i = 1; i < screen.length; i++) g.lineTo(screen[i][0], screen[i][1]);
            g.closePath();
          };
          trace();

          if (front) {
            g.save();
            g.clip();
            const src = sh.tri.map((i) => {
              const u = (sh.pts[i][0] + sh.wx) / ar + 0.5;
              const v = sh.pts[i][1] + sh.wy + 0.5;
              return [u * iw, (1 - v) * ih] as [number, number];
            });
            const m = affine(src, sh.tri.map((i) => screen[i]));
            if (m) {
              g.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
              /* The pane's rounded corners, cut in the picture's own space so
                 a corner piece carries its curve away with it. */
              g.beginPath();
              if (g.roundRect) g.roundRect(0, 0, iw, ih, radius);
              else g.rect(0, 0, iw, ih);
              g.clip();
              g.drawImage(img!, 0, 0);
            }
            g.restore();
            trace();
            /* The room on top: added light, so it brightens and never greys. */
            if (sheen > 0.004) {
              g.globalCompositeOperation = "lighter";
              g.fillStyle = `rgba(232,236,240,${sheen.toFixed(3)})`;
              g.fill();
              g.globalCompositeOperation = "source-over";
            }
          } else {
            g.fillStyle = "rgb(10,11,14)";
            g.fill();
            if (sheen > 0.004) {
              g.globalCompositeOperation = "lighter";
              g.fillStyle = `rgba(232,236,240,${(sheen * 0.6).toFixed(3)})`;
              g.fill();
              g.globalCompositeOperation = "source-over";
            }
          }

          /* The cut: green-white glass seen through its edge. */
          if (edge > 0.01) {
            g.lineJoin = "round";
            g.lineWidth = 1.1;
            g.strokeStyle = `rgba(190,236,229,${edge.toFixed(3)})`;
            g.stroke();
          }
        },
      });
    }

    /* Far to near, so a piece coming at the lens is drawn over the rest. */
    drawn.sort((a, b) => a.z - b.z);
    for (const d of drawn) d.run();
    g.globalAlpha = 1;
  };

  const kick = () => {
    if (raf || dead) return;
    raf = requestAnimationFrame(draw);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(host);
  ro.observe(stage);
  window.addEventListener(THEME_EVENT, kick);
  resize();

  return {
    set(next) {
      p = next;
      kick();
    },
    dispose() {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener(THEME_EVENT, kick);
      setActive(false);
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
