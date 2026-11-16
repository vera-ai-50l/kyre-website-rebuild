import * as THREE from "three";
import { fracture } from "./fracture";

/* The old screen, as an object.

   It used to be nine DOM plates, each a clipped copy of the dashboard with a
   stroked outline — which is a picture cut into tiles, and reads as one. Glass
   has three things a tile does not: a thickness you can see when it turns, an
   edge that catches light differently from its face, and a reflection that
   breaks at every crack because each piece has settled at a slightly different
   angle. All three need real geometry and a per-pixel light, so this is the one
   part of the page that is WebGL.

   One mesh, one draw call. Every shard is extruded from its outline and merged
   into a single buffer; where a piece is and how it is turned is worked out in
   the vertex shader from two numbers (how far the crack has spread, how far the
   pieces have flown), so the scroll costs two uniform writes a frame and no
   JavaScript per shard.

   Units are CSS pixels and the camera is the same 1150px perspective the DOM
   scene uses, so at z = 0 a pixel here is a pixel there and the red callouts
   in the markup land on the rows in the canvas. */

export type Plate = {
  src: string;
  /* Pixel size of the capture, for its aspect ratio. */
  w: number;
  h: number;
  /* Where it is struck, as fractions of the window: the failing row. */
  impact: [number, number];
  /* Corner radius as a fraction of the window's height. */
  radius: number;
};

export type Shatter = {
  set(p: number): void;
  dispose(): void;
};

const DIST = 1150;
/* Thickness and bevel, as fractions of the window's height: about 4px and 1px
   on a 650px pane. At twice that the pieces read as slabs of acrylic — a screen
   is a thin thing. The bevel is what draws the cracks: a 45° facet along every
   cut that catches the key light while the faces either side stay dark. */
const THICK = 0.0062;
const BEVEL = 0.0016;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const ss = (n: number) => n * n * (3 - 2 * n);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const VERT = /* glsl */ `
uniform float uCrack;
uniform float uFly;
uniform float uAr;
uniform vec2 uImpact;

attribute vec3 aCenter;
attribute vec4 aRand;

varying vec2 vUv;
varying vec3 vN;
varying vec3 vNf;
varying vec3 vV;
varying float vFace;
varying float vAlpha;
varying float vBroken;
varying float vTint;

mat3 rotAxis(vec3 a, float t) {
  float c = cos(t), s = sin(t), o = 1.0 - c;
  return mat3(
    o * a.x * a.x + c,       o * a.x * a.y + a.z * s, o * a.z * a.x - a.y * s,
    o * a.x * a.y - a.z * s, o * a.y * a.y + c,       o * a.y * a.z + a.x * s,
    o * a.z * a.x + a.y * s, o * a.y * a.z - a.x * s, o * a.z * a.z + c
  );
}

void main() {
  float d = aCenter.z;

  /* The crack is a front that travels outward from the strike, so the middle is
     already in pieces while the corners are still whole. */
  float crack = smoothstep(0.0, 1.0, uCrack * 2.9 - d * 1.05);

  /* Same order on the way out: nearest the strike first, and each piece on a
     slightly different beat so it reads as a break rather than a formation. */
  float sa = clamp(uFly * 1.9 - d * 0.42 - aRand.x * 0.1, 0.0, 1.0);
  float away = sa * sa * (3.0 - 2.0 * sa);
  float seated = crack * (1.0 - away);

  vec2 dir = aCenter.xy - uImpact;
  dir /= max(length(dir), 1e-4);

  /* Settled a degree or two off true once cracked — which is all it takes for
     every piece to throw the light somewhere different — then tumbling. */
  vec3 axis = normalize(vec3(aRand.y - 0.5, aRand.z - 0.5, (aRand.w - 0.5) * 0.5) + 1e-4);
  float turn = seated * (aRand.x - 0.5) * 0.085
    + away * (0.8 + aRand.y * 2.6) * (aRand.z > 0.5 ? 1.0 : -1.0);
  mat3 R = rotAxis(axis, turn);

  vec3 off = vec3(dir * seated * 0.0035 * (0.3 + d), seated * (aRand.w - 0.4) * 0.005);
  off.xy += dir * away * (0.32 + aRand.x * 0.78 + d * 0.22);
  off.y -= away * away * 0.17;
  off.z += away * (0.5 + aRand.w * 1.1);

  vec4 mv = modelViewMatrix * vec4(vec3(aCenter.xy, 0.0) + R * position + off, 1.0);
  gl_Position = projectionMatrix * mv;

  vV = mv.xyz;
  vN = normalMatrix * (R * normal);
  vNf = normalMatrix * (R * vec3(0.0, 0.0, 1.0));
  vFace = normal.z;
  /* From where the vertex sits at rest, so the picture is carried by the piece
     rather than sliding across it. */
  vUv = (aCenter.xy + position.xy) / vec2(uAr, 1.0) + 0.5;
  vAlpha = 1.0 - smoothstep(0.74, 1.0, sa);
  vBroken = crack;
  vTint = aRand.x - 0.5;
}
`;

const FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform float uAr;
uniform float uRadius;
uniform float uBright;
uniform float uFog;
uniform float uFlash;

varying vec2 vUv;
varying vec3 vN;
varying vec3 vNf;
varying vec3 vV;
varying float vFace;
varying float vAlpha;
varying float vBroken;
varying float vTint;

float sdRound(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float box(vec3 r, vec3 c, float s) {
  return smoothstep(1.0 - s, 1.0 - s * 0.3, dot(r, normalize(c)));
}

/* A studio, not a sky: one warm softbox high and left, one cool one to the
   right, and a thin strip light across the middle so a turning piece gets a
   hard glint as well as a soft one. Procedural, so there is nothing to
   download and the reflection is exactly as sharp as the pixel it lands on. */
vec3 env(vec3 r) {
  /* The room itself: nearly black underfoot, a little cool light overhead, so
     a face turned away from every lamp is still a surface and not a hole. */
  vec3 c = mix(vec3(0.012, 0.012, 0.014), vec3(0.085, 0.1, 0.125), smoothstep(-0.35, 0.9, r.y));
  c += vec3(1.0, 0.93, 0.82) * 2.1 * box(r, vec3(-0.55, 0.62, 0.55), 0.16);
  c += vec3(0.52, 0.7, 1.0) * 1.3 * box(r, vec3(0.78, -0.12, 0.6), 0.11);
  c += vec3(1.0, 0.9, 0.8) * 0.5 * box(r, vec3(0.1, -0.8, 0.45), 0.2);
  c += vec3(0.86, 0.94, 1.0) * 0.9 * smoothstep(0.03, 0.0, abs(r.y - 0.3)) * smoothstep(-0.2, 0.5, r.z);
  return c;
}

void main() {
  /* The window's rounded corners, cut from the picture's own coordinates so a
     corner piece carries its curve away with it. */
  vec2 p = (vUv - 0.5) * vec2(uAr, 1.0);
  if (sdRound(p, vec2(uAr, 1.0) * 0.5, uRadius) > 0.0) discard;

  float front = step(0.9, vFace);
  float back = step(0.9, -vFace);
  float edge = 1.0 - front - back;

  /* Until it cracks, a bevel is shaded as the face it belongs to. Otherwise
     every cut would already be visible in a pane that is supposed to be whole. */
  vec3 N = normalize(mix(vNf, vN, max(vBroken, 1.0 - edge)));
  vec3 V = normalize(-vV);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float F = pow(1.0 - ndv, 4.0);
  vec3 E = env(reflect(-V, N));

  vec3 tex = texture2D(uTex, vUv).rgb;

  /* A lit display behind a sheet of glass: the picture is emitted, the room is
     reflected on top of it, more at a glancing angle. Each piece a few percent
     brighter or darker than its neighbours once broken. */
  vec3 cFront = tex * uBright * (1.0 + vBroken * vTint * 0.3) + E * (0.05 + 0.75 * F);

  /* The cut. Real glass is green-blue through its edge; it pipes the display's
     light sideways and mirrors the room almost completely.

     The piped light is the picture read several mips down — an average of the
     screen near this edge. Read sharp, every glyph the cut passes through
     becomes a stripe the full depth of the glass, and the edge of a shard turns
     into a barcode. */
  vec3 glass = vec3(0.62, 0.9, 0.87);
  vec3 piped = texture2D(uTex, vUv, 6.0).rgb;
  vec3 cEdge = glass * 0.03
    + piped * 1.6 * uBright
    + E * glass * (0.5 + 1.5 * F)
    + glass * uFlash * 0.85;

  /* The back of the panel: dark, and it still has a surface. */
  vec3 cBack = vec3(0.012, 0.013, 0.017) + tex * 0.04 + E * (0.07 + 0.75 * F);

  vec3 col = cFront * front + cBack * back + mix(cFront, cEdge, vBroken) * edge;

  /* Lying back at rest, the far end falls off into the room. */
  float depth = clamp((-vV.z - ${DIST}.0 * 0.86) / (${DIST}.0 * 0.62), 0.0, 1.0);
  col *= 1.0 - uFog * depth * 0.7;

  gl_FragColor = vec4(col, vAlpha);
  #include <colorspace_fragment>
}
`;

/* Glass dust: the chips that come off the cut. Born where the crack passes,
   hang, then leave with the pieces. They twinkle because a chip only shows
   when it happens to face the light. */
const DUST_VERT = /* glsl */ `
uniform float uCrack;
uniform float uFly;
uniform float uTime;
uniform float uPx;
uniform vec2 uImpact;
attribute vec4 aSeed;
varying float vA;

void main() {
  vec2 rel = position.xy - uImpact;
  float d = length(rel);
  vec2 dir = rel / max(d, 1e-4);

  float born = smoothstep(0.0, 0.3, uCrack * 2.9 - d * 1.05);
  float sa = clamp(uFly * 1.7 - d * 0.3 - aSeed.x * 0.3, 0.0, 1.0);
  float away = sa * sa;

  vec3 p = position;
  p.xy += dir * (born * 0.014 * aSeed.y + away * (0.45 + aSeed.x * 1.5));
  p.xy += (aSeed.zw - 0.5) * (born * 0.022 + away * 0.55);
  p.y -= born * 0.012 * aSeed.w + away * away * 0.32;
  p.z += born * (0.012 + aSeed.z * 0.04) + away * (0.25 + aSeed.y * 1.35);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  /* Mostly dark. A chip shows for the instant it faces a lamp and is gone
     again, and it is spent well before the piece it came off has left — held
     any longer the frame fills with steady white points, which is a starfield. */
  float tw = pow(abs(sin(uTime * (1.4 + aSeed.x * 4.2) + aSeed.y * 6.283)), 14.0);
  vA = born * (1.0 - smoothstep(0.25, 0.7, sa)) * (0.06 + 0.94 * tw) * 0.8;
  gl_PointSize = (1.2 + aSeed.z * 2.2) * uPx * (${DIST}.0 / max(-mv.z, 1.0));
}
`;

const DUST_FRAG = /* glsl */ `
varying float vA;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.5, 0.0, r);
  gl_FragColor = vec4(vec3(0.84, 0.96, 1.0), core * core * vA);
}
`;

function build(plate: Plate) {
  const ar = plate.w / plate.h;
  const cells = fracture(ar, [plate.impact[0] * ar, plate.impact[1]]);

  /* Its own generator rather than Math.random, so a reload is the same break
     and a screenshot can be compared with the last one. */
  let seed = 20240611;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const pos: number[] = [];
  const nor: number[] = [];
  const cen: number[] = [];
  const rand: number[] = [];
  const dust: number[] = [];
  const dustSeed: number[] = [];

  for (const c of cells) {
    const wx = c.cx - ar / 2;
    const wy = 0.5 - c.cy;
    const outline = c.pts.map(([x, y]) => new THREE.Vector2(x - ar / 2 - wx, 0.5 - y - wy));
    const g = new THREE.ExtrudeGeometry(new THREE.Shape(outline), {
      depth: THICK,
      steps: 1,
      curveSegments: 1,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      /* Bevel inward. The default grows the outline by the bevel, and pieces
         that have each grown no longer tile. */
      bevelOffset: -BEVEL,
    });
    const p = g.getAttribute("position");
    const n = g.getAttribute("normal");
    const r4 = [rnd(), rnd(), rnd(), rnd()];
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i) - THICK / 2);
      nor.push(n.getX(i), n.getY(i), n.getZ(i));
      cen.push(wx, wy, c.dist);
      rand.push(r4[0], r4[1], r4[2], r4[3]);
    }
    g.dispose();

    /* Chips along this piece's cuts, more of them near the strike. */
    const chips = c.dist < 0.3 ? 3 : 1;
    for (let k = 0; k < chips; k++) {
      const i = Math.floor(rnd() * c.pts.length);
      const a = c.pts[i];
      const b = c.pts[(i + 1) % c.pts.length];
      const t = rnd();
      dust.push(mix(a[0], b[0], t) - ar / 2, 0.5 - mix(a[1], b[1], t), THICK / 2);
      dustSeed.push(rnd(), rnd(), rnd(), rnd());
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("aCenter", new THREE.Float32BufferAttribute(cen, 3));
  geo.setAttribute("aRand", new THREE.Float32BufferAttribute(rand, 4));

  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.Float32BufferAttribute(dust, 3));
  dustGeo.setAttribute("aSeed", new THREE.Float32BufferAttribute(dustSeed, 4));

  return { geo, dustGeo, ar, impact: new THREE.Vector2(plate.impact[0] * ar - ar / 2, 0.5 - plate.impact[1]) };
}

/* Throws if the browser will not give out a WebGL context; the caller falls
   back to the flat image. */
export function mountShatter(
  canvas: HTMLCanvasElement,
  /* The box in the markup the pane has to sit in. Its layout size is the
     pane's size, so the stylesheet stays the one place that is decided. */
  stage: HTMLElement,
  pick: () => Plate,
  onReady: () => void,
): Shatter {
  const host = canvas.parentElement as HTMLElement;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 4, DIST * 5);
  camera.position.z = DIST;

  const rig = new THREE.Group();
  scene.add(rig);

  const uniforms = {
    uTex: { value: null as THREE.Texture | null },
    uAr: { value: 1 },
    uRadius: { value: 0.02 },
    uBright: { value: 1 },
    uFog: { value: 1 },
    uFlash: { value: 0 },
    uCrack: { value: 0 },
    uFly: { value: 0 },
    uTime: { value: 0 },
    uPx: { value: 1 },
    uImpact: { value: new THREE.Vector2() },
  };

  const glass = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
  });
  const chips = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: DUST_VERT,
    fragmentShader: DUST_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  let mesh: THREE.Mesh | null = null;
  let points: THREE.Points | null = null;
  let plate: Plate | null = null;
  let ready = false;
  let dead = false;

  let W = 1;
  let H = 1;
  let p = 0;
  /* Pointer, where it is and where the scene has caught up to. */
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;

  let raf = 0;
  let last = 0;
  let cleared = false;

  const load = (next: Plate) => {
    plate = next;
    ready = false;
    new THREE.TextureLoader().load(next.src, (tex) => {
      /* Disposed, or resized across the breakpoint again while this loaded. */
      if (dead || plate !== next) return tex.dispose();
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

      if (mesh) {
        rig.remove(mesh, points!);
        mesh.geometry.dispose();
        points!.geometry.dispose();
      }
      uniforms.uTex.value?.dispose();

      const built = build(next);
      uniforms.uTex.value = tex;
      uniforms.uAr.value = built.ar;
      uniforms.uRadius.value = next.radius;
      uniforms.uImpact.value.copy(built.impact);

      mesh = new THREE.Mesh(built.geo, glass);
      points = new THREE.Points(built.dustGeo, chips);
      /* Vertices are moved in the shader, so the bounds three computes from
         the buffer are wrong the moment anything flies. */
      mesh.frustumCulled = false;
      points.frustumCulled = false;
      rig.add(mesh, points);

      ready = true;
      resize();
      onReady();
    });
  };

  const resize = () => {
    W = host.clientWidth || 1;
    H = host.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    uniforms.uPx.value = dpr;

    camera.aspect = W / H;
    camera.fov = (Math.atan(H / 2 / DIST) * 360) / Math.PI;
    camera.updateProjectionMatrix();

    /* The geometry is one unit tall; the stage says how tall that is. */
    rig.scale.setScalar(stage.offsetHeight || 1);

    const want = pick();
    if (want !== plate) load(want);
    kick();
  };

  const draw = (now: number) => {
    raf = 0;
    const dt = Math.min(now - last, 64);
    last = now;

    const k = 1 - Math.exp(-dt / 160);
    cx += (tx - cx) * k;
    cy += (ty - cy) * k;
    const settling = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002;

    /* The same three phases the stylesheet cuts out of --p. */
    const exit = clamp01((p - 0.02) / 0.16);
    const diag = clamp01((p - 0.21) / 0.11);
    const fly = clamp01((p - 0.4) / 0.17);
    const exitE = ss(exit);
    const flyE = ss(fly);
    const crackE = 1 - (1 - diag) ** 3;

    if (!ready) return;

    /* Every piece is gone. One cleared frame, then nothing until scrolled back. */
    if (fly >= 1) {
      if (!cleared) renderer.clear();
      cleared = true;
      return;
    }
    cleared = false;

    /* At rest the pane lies back under the headline like a floor running away
       from the lens, and only its far end is in frame. As the copy leaves it
       stands up and squares to the camera — one move, so the depth the first
       frame has is the depth the screen arrives out of. */
    rig.position.set(0, mix(-0.515 * H, 0, exitE), mix(-200, 0, exitE) + flyE * 360);
    rig.rotation.set(mix(-1.05, 0, exitE) + cy * 0.035, cx * 0.055, 0);

    uniforms.uBright.value = mix(1.25, 1, exitE);
    uniforms.uFog.value = 1 - exitE;
    uniforms.uCrack.value = crackE;
    uniforms.uFly.value = fly;
    /* Hot along the cuts at the instant it gives, cooling as the crack runs. */
    uniforms.uFlash.value = diag > 0 && diag < 1 ? (1 - diag) ** 2 : 0;
    uniforms.uTime.value = now / 1000;

    renderer.render(scene, camera);

    /* The chips twinkle on their own clock, so the loop has to keep running
       for as long as there are any on screen. Otherwise it stops with the hand. */
    if (settling || (crackE > 0 && fly < 1)) raf = requestAnimationFrame(draw);
  };

  const kick = () => {
    if (raf || dead) return;
    last = performance.now();
    raf = requestAnimationFrame(draw);
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
    kick();
  };
  const onLost = (e: Event) => e.preventDefault();

  const ro = new ResizeObserver(resize);
  ro.observe(host);
  ro.observe(stage);
  window.addEventListener("pointermove", onMove, { passive: true });
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", kick);
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
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", kick);
      mesh?.geometry.dispose();
      points?.geometry.dispose();
      uniforms.uTex.value?.dispose();
      glass.dispose();
      chips.dispose();
      renderer.dispose();
    },
  };
}
