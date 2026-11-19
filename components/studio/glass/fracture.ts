/* How a pane of glass actually lets go.

   The first version of this was rays × rings: nineteen spokes, eight circles,
   one shard per cell. It tiled, and it looked like a diagram of a spider's web,
   because nothing real breaks on a grid — even a polar one.

   A struck pane does three things, and none of them is regular:

   1. A handful of cracks run from the strike to the frame. They are unevenly
      spaced — some a few degrees apart, some sixty — and none is straight.
   2. Shorter cracks jump between two neighbouring radials. Each sector grows
      its own, at its own distances, so they never join up into rings; and far
      from the strike they mostly stop happening, which is where the long
      daggers come from.
   3. The pieces that are left break again, wherever they are too big for how
      close they are to the hit. Around the strike that leaves crumbs; at the
      edges it leaves a few big plates that barely broke at all.

   Seeded, because the same break has to come out of Node and the browser, and
   out of every reload. */

type P = [number, number];

export type Cell = {
  /* Outline in the window's own space: x 0…ar, y 0…1, y down. */
  pts: P[];
  cx: number;
  cy: number;
  /* Distance from the strike. */
  dist: number;
  /* When the crack gets here. Distance, bent by direction: a crack does not
     spread as a circle, it runs down two or three lines first. */
  order: number;
  /* 0…1, small to large. Crumbs spin and fly; plates lumber and fall. */
  size: number;
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const areaOf = (pts: P[]) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    a += x0 * y1 - x1 * y0;
  }
  return Math.abs(a) / 2;
};

/* Area-weighted, so a long dagger turns about its middle and not about the
   average of its corners, which sits wherever the corners happen to bunch. */
const centroid = (pts: P[]): P => {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    const k = x0 * y1 - x1 * y0;
    a += k;
    cx += (x0 + x1) * k;
    cy += (y0 + y1) * k;
  }
  return Math.abs(a) < 1e-12 ? pts[0] : [cx / (3 * a), cy / (3 * a)];
};

const tidy = (raw: P[]) =>
  raw.filter((p, i) => {
    const q = raw[(i + 1) % raw.length];
    return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-7;
  });

/* The part of a polygon on the n side of a line through (px, py). */
function clip(pts: P[], px: number, py: number, nx: number, ny: number): P[] {
  const out: P[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const da = (a[0] - px) * nx + (a[1] - py) * ny;
    const db = (b[0] - px) * nx + (b[1] - py) * ny;
    if (da >= 0) out.push(a);
    if (da >= 0 !== db >= 0) {
      const t = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return tidy(out);
}

export function fracture(ar: number, impact: P, seed = 23): Cell[] {
  const rnd = mulberry32(seed);
  const [ix, iy] = impact;
  const TAU = Math.PI * 2;
  const inside = ([x, y]: P): P => [Math.min(ar, Math.max(0, x)), Math.min(1, Math.max(0, y))];

  /* ---- 1. the radials ----------------------------------------------------
     Gaps drawn from a skewed distribution, then scaled to a full turn: most
     are narrow, a few are several times wider. */
  const N = ar > 1 ? 12 : 9;
  const gaps = Array.from({ length: N }, () => 0.3 + rnd() ** 1.7 * 2.4);
  const turn = gaps.reduce((n, g) => n + g, 0);
  let bearing = rnd() * TAU;

  const rays = gaps.map((g) => {
    const a = (bearing += (g / turn) * TAU);
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    let tmax = Infinity;
    if (dx > 0) tmax = Math.min(tmax, (ar - ix) / dx);
    if (dx < 0) tmax = Math.min(tmax, -ix / dx);
    if (dy > 0) tmax = Math.min(tmax, (1 - iy) / dy);
    if (dy < 0) tmax = Math.min(tmax, -iy / dy);

    /* A crack wanders. Knots along its length, each stepping a little further
       off the true line than the last, eased back to nothing where it meets
       the frame so the end stays on the frame. */
    const knots: { r: number; off: number }[] = [{ r: 0, off: 0 }];
    let off = 0;
    for (let r = 0.04 + rnd() * 0.05; r < tmax * 0.92; r += 0.05 + rnd() * 0.22) {
      off += (rnd() - 0.5) * 0.17 * (r - knots[knots.length - 1].r);
      knots.push({ r, off: off * Math.min(1, (tmax - r) / (0.3 * tmax)) });
    }
    knots.push({ r: tmax, off: 0 });

    const at = (r: number): P => {
      let k = 1;
      while (k < knots.length - 1 && knots[k].r < r) k++;
      const A = knots[k - 1];
      const B = knots[k];
      const o = A.off + (B.off - A.off) * ((r - A.r) / (B.r - A.r));
      return inside([ix + dx * r - dy * o, iy + dy * r + dx * o]);
    };
    /* The crack between two distances, kinks included: both sectors that share
       this radial walk the same line, which is what keeps them from gapping. */
    const seg = (r0: number, r1: number): P[] => [
      at(r0),
      ...knots.filter((k) => k.r > r0 + 1e-6 && k.r < r1 - 1e-6).map((k) => at(k.r)),
      at(r1),
    ];
    return { a, tmax, seg };
  });

  const corners = (
    [
      [0, 0],
      [ar, 0],
      [ar, 1],
      [0, 1],
    ] as P[]
  ).map((c) => ({ c, a: Math.atan2(c[1] - iy, c[0] - ix) }));

  /* ---- 2. the cross cracks ------------------------------------------------ */
  const rough: P[][] = [];
  for (let i = 0; i < N; i++) {
    const A = rays[i];
    const B = rays[(i + 1) % N];
    const a0 = A.a;
    let a1 = B.a;
    while (a1 <= a0) a1 += TAU;
    const lim = Math.min(A.tmax, B.tmax);

    /* This sector's own ladder. Each rung lands at a different distance on
       either side, so it runs at a slant; each is at least 1.4× the last, so
       ±10% can never put one inside the previous. */
    let pa = 0;
    let pb = 0;
    for (let base = 0.035 + rnd() * 0.04; base < lim * 0.8; base *= 1.6 + rnd() * 1.4) {
      const ra = base * (0.9 + rnd() * 0.2);
      const rb = base * (0.9 + rnd() * 0.2);
      rough.push([...A.seg(pa, ra), ...B.seg(pb, rb).reverse()]);
      pa = ra;
      pb = rb;
      /* Away from the strike they get rare, and the rest of the sector runs
         out to the frame in one piece. */
      if (base > 0.16 && rnd() < 0.42) break;
    }

    const between = corners
      .map(({ c, a }) => {
        let b = a;
        while (b < a0) b += TAU;
        return { c, b };
      })
      .filter(({ b }) => b < a1)
      .sort((p, q) => p.b - q.b)
      .map(({ c }) => c);

    rough.push([...A.seg(pa, A.tmax), ...between, ...B.seg(pb, B.tmax).reverse()]);
  }

  /* ---- 3. the pieces break again ------------------------------------------ */
  const done: P[][] = [];
  const split = (pts: P[], depth: number) => {
    const A = areaOf(pts);
    const [cx, cy] = centroid(pts);
    const d = Math.hypot(cx - ix, cy - iy);
    /* How big a piece may stay, by how far it is from the hit — and a wide
       spread on top of that, so neighbours at the same distance still differ
       by a factor of four. */
    const allow = (0.0014 + 0.075 * d ** 1.6) * (0.5 + rnd() * 1.7);
    const spared = depth > 0 && d > 0.3 && rnd() < 0.14;
    if (depth >= 5 || A < 0.0012 || A < allow || spared) return void done.push(pts);

    const ux = (cx - ix) / (d || 1);
    const uy = (cy - iy) / (d || 1);
    let lo = Infinity;
    let hi = -Infinity;
    let lo2 = Infinity;
    let hi2 = -Infinity;
    for (const [x, y] of pts) {
      const u = (x - cx) * ux + (y - cy) * uy;
      const v = -(x - cx) * uy + (y - cy) * ux;
      lo = Math.min(lo, u);
      hi = Math.max(hi, u);
      lo2 = Math.min(lo2, v);
      hi2 = Math.max(hi2, v);
    }
    const along = hi - lo;
    const across = hi2 - lo2;

    /* Across its long side, usually: a dagger snaps, a wide plate splits down
       the middle. Half go on a hard diagonal, which is where the triangles and
       the long pointed slivers come from: the pieces read as sharp glass, not
       as tiles. */
    const base = Math.atan2(uy, ux) + (along > across * 1.25 ? 0 : Math.PI / 2);
    const na = base + (rnd() - 0.5) * (rnd() < 0.5 ? 2.3 : 0.9);
    const nx = Math.cos(na);
    const ny = Math.sin(na);
    const px = cx + ux * (rnd() - 0.5) * along * 0.36 - uy * (rnd() - 0.5) * across * 0.36;
    const py = cy + uy * (rnd() - 0.5) * along * 0.36 + ux * (rnd() - 0.5) * across * 0.36;

    const one = clip(pts, px, py, nx, ny);
    const two = clip(pts, px, py, -nx, -ny);
    if (one.length < 3 || two.length < 3 || areaOf(one) < 0.0004 || areaOf(two) < 0.0004) {
      return void done.push(pts);
    }
    split(one, depth + 1);
    split(two, depth + 1);
  };
  for (const r of rough) {
    const pts = tidy(r);
    if (pts.length >= 3) split(pts, 0);
  }

  /* The crack runs faster down some bearings than others. */
  const f1 = rnd() * TAU;
  const f2 = rnd() * TAU;
  const biggest = Math.sqrt(Math.max(...done.map(areaOf)));

  return done.map((pts) => {
    const [cx, cy] = centroid(pts);
    const dist = Math.hypot(cx - ix, cy - iy);
    const th = Math.atan2(cy - iy, cx - ix);
    return {
      pts,
      cx,
      cy,
      dist,
      order: dist * (1 + 0.3 * Math.sin(2 * th + f1) + 0.18 * Math.sin(5 * th + f2)) + rnd() * 0.05,
      size: Math.sqrt(areaOf(pts)) / biggest,
    };
  });
}

/* Run directly (node --experimental-strip-types components/studio/glass/fracture.ts)
   to check the one property the scene depends on: the cells tile the window
   exactly. A gap would be a hole in the screen before it has been broken. */
function demo() {
  for (const [ar, impact] of [
    [1.99, [1.11, 0.49]],
    [1.6, [0.9, 0.46]],
    [0.714, [0.4, 0.5]],
  ] as [number, P][]) {
    const cells = fracture(ar, impact);
    const area = cells.reduce((sum, { pts }) => sum + areaOf(pts), 0);
    if (Math.abs(area - ar) > 1e-6) throw new Error(`cells cover ${area}, window is ${ar}`);
    const sizes = cells.map((c) => areaOf(c.pts)).sort((a, b) => a - b);
    console.log(
      `ar ${ar}: ${cells.length} shards, area ${area.toFixed(6)} ✓  smallest ${sizes[0].toFixed(5)} median ${sizes[sizes.length >> 1].toFixed(5)} largest ${sizes[sizes.length - 1].toFixed(4)}`,
    );
  }
}
if (typeof process !== "undefined" && process.argv?.[1]?.endsWith("fracture.ts")) demo();
