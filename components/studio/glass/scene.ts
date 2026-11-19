import * as THREE from "three";
import { fracture } from "./fracture";
import { DUST_FRAG, DUST_VERT, FRAG, VERT } from "./shaders";
import { isLite, LITE_EVENT, THEME_EVENT } from "../useLite";

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
const THICK = 0.005;
const BEVEL = 0.0011;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const ss = (n: number) => n * n * (3 - 2 * n);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

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
  const size: number[] = [];
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
      cen.push(wx, wy, c.order);
      size.push(c.size);
      rand.push(r4[0], r4[1], r4[2], r4[3]);
    }
    g.dispose();

    /* Chips along this piece's cuts, more of them near the strike. */
    const chips = c.dist < 0.14 ? 4 : c.dist < 0.4 ? 2 : 1;
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
  geo.setAttribute("aSize", new THREE.Float32BufferAttribute(size, 1));

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
  /* A small machine (see app/layout.tsx) draws at 1x and without MSAA. It can
     also be marked small later, mid-visit, so the pixel ratio is re-read on
     every resize; antialiasing is fixed at creation and stays on there. */
  const lite = () => isLite();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !lite(),
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
    uDark: { value: 1 },
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
    /* Sharp on a screen that can show it (up to 2x); a slow GPU still gets a
       little over 1x, and only a CPU-drawn page stays at 1x. */
    const tier = document.documentElement.dataset.lite;
    const dpr = tier === "nogpu" ? 1 : Math.min(window.devicePixelRatio || 1, tier === "low" ? 1.25 : 2);
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
    uniforms.uDark.value = document.documentElement.dataset.theme === "light" ? 0 : 1;
    uniforms.uCrack.value = crackE;
    uniforms.uFly.value = fly;
    /* Hot along the cuts at the instant it gives, cooling as the crack runs. */
    uniforms.uFlash.value = diag > 0 && diag < 1 ? (1 - diag) ** 2 : 0;
    uniforms.uTime.value = now / 1000;

    renderer.render(scene, camera);

    /* Nothing moves on its own clock any more, so the loop stops with the hand. */
    if (settling) raf = requestAnimationFrame(draw);
  };

  const kick = () => {
    if (raf || dead) return;
    last = performance.now();
    raf = requestAnimationFrame(draw);
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    /* The lean toward the pointer is a few pixels of parallax that costs a
       full-window redraw per move. Drawing on a CPU that redraw is the whole
       frame (measured: ~7fps while the mouse moves, 46 without), so a small
       machine keeps the pane still and redraws only for the scroll. */
    if (lite()) {
      tx = ty = 0;
      return;
    }
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
    kick();
  };
  const onLost = (e: Event) => e.preventDefault();

  const ro = new ResizeObserver(resize);
  ro.observe(host);
  ro.observe(stage);
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener(LITE_EVENT, resize);
  window.addEventListener(THEME_EVENT, kick);
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
      window.removeEventListener(LITE_EVENT, resize);
      window.removeEventListener(THEME_EVENT, kick);
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
