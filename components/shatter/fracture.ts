/* How a pane of glass actually lets go.

   Struck at a point, glass does two things: cracks run outward from the impact
   in near-straight radial lines, and then shorter cracks jump between those
   radials in rough rings. What is left is a spider's web — tiny slivers around
   the strike, long daggers further out — and that silhouette is most of what
   the eye reads as "glass" rather than "a picture cut into tiles".

   So the pieces are generated from exactly that: jittered rays, jittered rings,
   and every cell between two neighbouring rays and two neighbouring rings is a
   shard. Seeded, because the same break has to come out of Node and the
   browser, and out of every reload. */

export type Cell = {
  /* Outline in the window's own space: x 0…ar, y 0…1, y down. */
  pts: [number, number][];
  cx: number;
  cy: number;
  /* Distance from the strike. Drives the order everything happens in — the
     crack spreads outward and the middle lets go first. */
  dist: number;
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

/* Ring radii as fractions of the window's height. Each is at least 1.5× the
   last, so the ±19% jitter below can never put one ring inside the previous
   (1.19 × r < 0.81 × 1.5r). */
const RINGS = [0.05, 0.12, 0.23, 0.38, 0.58, 0.88, 1.33, 2.0];

export function fracture(ar: number, impact: [number, number], seed = 11): Cell[] {
  const rnd = mulberry32(seed);
  const [ix, iy] = impact;
  const TAU = Math.PI * 2;

  /* More rays across a wide pane than a tall one, so the slivers stay slivers. */
  const N = ar > 1 ? 19 : 15;
  const base = rnd() * TAU;
  /* Nearly a whole step of jitter either way: some neighbours almost touch and
     some stand well apart, so the web has needles and wedges in it rather than
     nineteen equal slices. Under 1.0 so the order can never swap. */
  const angles = Array.from({ length: N }, (_, i) => base + ((i + (rnd() - 0.5) * 0.92) / N) * TAU);

  const rays = angles.map((a) => {
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    let tmax = Infinity;
    if (dx > 0) tmax = Math.min(tmax, (ar - ix) / dx);
    if (dx < 0) tmax = Math.min(tmax, -ix / dx);
    if (dy > 0) tmax = Math.min(tmax, (1 - iy) / dy);
    if (dy < 0) tmax = Math.min(tmax, -iy / dy);

    /* The strike, then one point per ring this ray is long enough to reach,
       then where it meets the frame. A crack is never quite straight, so each
       ring point is nudged off the ray — once, here, so the two sectors that
       share this ray agree on where it went. */
    const line: [number, number][] = [[ix, iy]];
    for (const r of RINGS) {
      /* ±19%, the most a 1.5× ladder allows. A ring is a series of separate
         cracks that happen to line up, and at ±15% they lined up too well —
         the break read as a drawn spider's web. */
      const t = r * (0.81 + rnd() * 0.38);
      if (t > tmax * 0.84) break;
      const wob = (rnd() - 0.5) * 0.13 * t;
      line.push([ix + dx * t - dy * wob, iy + dy * t + dx * wob]);
    }
    line.push([ix + dx * tmax, iy + dy * tmax]);
    return { a, line };
  });

  /* The frame's corners, by bearing from the strike. A sector that sweeps past
     one has to go round it. */
  const corners = (
    [
      [0, 0],
      [ar, 0],
      [ar, 1],
      [0, 1],
    ] as [number, number][]
  ).map((c) => ({ c, a: Math.atan2(c[1] - iy, c[0] - ix) }));

  const cells: Cell[] = [];
  const push = (raw: [number, number][]) => {
    /* Band 0 is a triangle whose first two corners are both the strike. */
    const pts = raw.filter((p, i) => {
      const q = raw[(i + 1) % raw.length];
      return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-6;
    });
    if (pts.length < 3) return;
    const cx = pts.reduce((n, p) => n + p[0], 0) / pts.length;
    const cy = pts.reduce((n, p) => n + p[1], 0) / pts.length;
    cells.push({ pts, cx, cy, dist: Math.hypot(cx - ix, cy - iy) });
  };

  for (let i = 0; i < N; i++) {
    const A = rays[i];
    const B = rays[(i + 1) % N];
    const a0 = A.a;
    let a1 = B.a;
    while (a1 <= a0) a1 += TAU;

    /* Rings both rays reach are closed cells; whatever is left over runs out
       to the frame as one piece. */
    const m = Math.min(A.line.length, B.line.length) - 2;
    for (let k = 1; k <= m; k++) {
      push([A.line[k - 1], A.line[k], B.line[k], B.line[k - 1]]);
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

    push([...A.line.slice(m), ...between, ...B.line.slice(m).reverse()]);
  }

  return cells;
}

/* Run directly (node --experimental-strip-types components/shatter/fracture.ts)
   to check the one property the scene depends on: the cells tile the window
   exactly. A gap would be a hole in the screen before it has been broken. */
function demo() {
  for (const [ar, impact] of [
    [1.99, [1.11, 0.49]],
    [0.714, [0.4, 0.5]],
  ] as [number, [number, number]][]) {
    const cells = fracture(ar, impact);
    const area = cells.reduce((sum, { pts }) => {
      let a = 0;
      for (let i = 0; i < pts.length; i++) {
        const [x0, y0] = pts[i];
        const [x1, y1] = pts[(i + 1) % pts.length];
        a += x0 * y1 - x1 * y0;
      }
      return sum + Math.abs(a) / 2;
    }, 0);
    if (Math.abs(area - ar) > 1e-6) throw new Error(`cells cover ${area}, window is ${ar}`);
    console.log(`ar ${ar}: ${cells.length} shards, area ${area.toFixed(6)} ✓`);
  }
}
if (typeof process !== "undefined" && process.argv?.[1]?.endsWith("fracture.ts")) demo();
