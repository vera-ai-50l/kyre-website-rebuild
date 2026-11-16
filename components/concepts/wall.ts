import * as THREE from "three";

/* Hero 01. The wall of sameness.

   Every AI app builder hands back the same screen: a violet-to-blue banner, a
   centred headline, three equal cards, one blue button. So the background of
   this hero is that screen, several hundred times, drifting past in three
   layers of depth — and the visitor's own app is one of them until they hold.

   One instanced quad, one small canvas texture, one draw call. Where a tile is
   comes out of the vertex shader from its grid slot and the clock, so the
   drift costs one uniform a frame. */

export type Wall = { hold(g: number): void; dispose(): void };

const DIST = 1000;
const TILE_W = 150;
const TILE_H = 206;
const CELL_W = 190;
const CELL_H = 250;

/* The generic app, drawn once. Shapes only: at 150px wide nobody can read it,
   and the point is that nobody needs to. */
function tileTexture() {
  const c = document.createElement("canvas");
  c.width = 300;
  c.height = 412;
  const x = c.getContext("2d")!;
  const rr = (px: number, py: number, w: number, h: number, r: number, fill: string) => {
    x.fillStyle = fill;
    x.beginPath();
    x.roundRect(px, py, w, h, r);
    x.fill();
  };
  x.fillStyle = "#f6f6fb";
  x.fillRect(0, 0, 300, 412);
  const g = x.createLinearGradient(0, 0, 300, 150);
  g.addColorStop(0, "#7c3aed");
  g.addColorStop(1, "#3b82f6");
  x.fillStyle = g;
  x.fillRect(0, 0, 300, 146);
  rr(58, 44, 184, 15, 7, "rgba(255,255,255,0.96)");
  rr(88, 70, 124, 9, 4, "rgba(255,255,255,0.6)");
  rr(102, 96, 96, 26, 13, "#ffffff");
  for (let i = 0; i < 3; i++) {
    const px = 14 + i * 93;
    rr(px, 162, 86, 92, 10, "#ffffff");
    rr(px + 30, 174, 26, 26, 13, "#ede9fe");
    rr(px + 14, 212, 58, 7, 3, "#c9cbd6");
    rr(px + 22, 227, 42, 6, 3, "#e1e2ea");
  }
  for (let i = 0; i < 3; i++) {
    const py = 272 + i * 30;
    rr(14, py, 150 - i * 22, 8, 4, "#d3d5df");
    rr(244, py, 42, 8, 4, "#93b4f8");
  }
  rr(14, 368, 272, 30, 8, "#3b82f6");
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const VERT = /* glsl */ `
uniform float uTime;
uniform float uG;
uniform vec2 uTile;
attribute vec3 aSlot;   // x, y in the layer's own plane; z is the layer depth
attribute vec2 aSpan;   // how far the layer runs before it wraps
attribute float aSeed;
varying vec2 vUv;
varying float vDim;
varying float vPulse;

void main() {
  vUv = uv;
  vec3 c = aSlot;
  /* Nearer layers drift faster, which is most of what reads as depth. */
  float speed = 1.0 + (c.z + 1300.0) / 700.0;
  c.x = mod(c.x + uTime * 9.0 * speed + aSpan.x * 0.5, aSpan.x) - aSpan.x * 0.5;
  c.y = mod(c.y - uTime * 4.0 * speed + aSpan.y * 0.5, aSpan.y) - aSpan.y * 0.5;

  /* The hold. A ring leaves the middle and every tile it passes lifts toward
     the lens, lights, and then falls away behind the one that stayed. */
  float d = length(c.xy);
  float on = step(0.001, uG);
  float front = uG * 2100.0 - 200.0;
  float pulse = exp(-pow((d - front) / 210.0, 2.0)) * on * (1.0 - uG * 0.6);
  float gone = (1.0 - smoothstep(front - 620.0, front - 120.0, d)) * on;

  vec3 p = vec3(position.xy * uTile, 0.0);
  float turn = gone * (0.5 + aSeed) * 1.1;
  float cs = cos(turn), sn = sin(turn);
  p.xz = mat2(cs, -sn, sn, cs) * p.xz;
  p += c;
  p.z += pulse * 170.0 - gone * (260.0 + aSeed * 380.0);

  vPulse = pulse;
  float depth = clamp((-c.z - 150.0) / 1250.0, 0.0, 1.0);
  /* Dim with distance, dim toward the edges, and dim once it has been passed. */
  vDim = mix(0.34, 0.09, depth) * (1.0 - smoothstep(500.0, 1700.0, d) * 0.6) * (1.0 - gone * 0.82);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uG;
uniform vec2 uTile;
varying vec2 vUv;
varying float vDim;
varying float vPulse;

void main() {
  /* Rounded corners, cut in the shader so the quad stays two triangles. */
  vec2 q = abs(vUv - 0.5) * uTile - (uTile * 0.5 - 14.0);
  float sd = length(max(q, 0.0)) - 14.0;
  if (sd > 0.0) discard;

  vec3 col = texture2D(uTex, vUv).rgb;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  /* Held, the crowd loses its colour: it was never theirs to begin with. */
  col = mix(col, vec3(l), clamp(uG * 1.3, 0.0, 1.0) * 0.9);
  col *= vDim;
  col += vec3(0.84, 1.0, 0.25) * vPulse * 0.55 * l;
  float rim = smoothstep(-2.2, 0.0, sd);
  col += vec3(0.84, 1.0, 0.25) * rim * vPulse * 0.9;
  gl_FragColor = vec4(col, 1.0);
}
`;

export function mountWall(canvas: HTMLCanvasElement): Wall {
  const host = canvas.parentElement!;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x050505, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 10, 4000);
  camera.position.z = DIST;
  const rig = new THREE.Group();
  scene.add(rig);

  /* Three layers, each wide enough to fill the frustum at its depth on a big
     display and then some, so the wrap is always off-screen. */
  const slots: number[] = [];
  const spans: number[] = [];
  const seeds: number[] = [];
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (const [z, cols, rows] of [
    [-260, 16, 8],
    [-720, 22, 10],
    [-1300, 30, 12],
  ]) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        slots.push((c + (r % 2) * 0.5) * CELL_W, r * CELL_H, z);
        spans.push(cols * CELL_W, rows * CELL_H);
        seeds.push(rnd());
      }
    }
  }
  const geo = new THREE.InstancedBufferGeometry();
  const quad = new THREE.PlaneGeometry(1, 1);
  geo.index = quad.index;
  geo.setAttribute("position", quad.getAttribute("position"));
  geo.setAttribute("uv", quad.getAttribute("uv"));
  geo.setAttribute("aSlot", new THREE.InstancedBufferAttribute(new Float32Array(slots), 3));
  geo.setAttribute("aSpan", new THREE.InstancedBufferAttribute(new Float32Array(spans), 2));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array(seeds), 1));
  geo.instanceCount = seeds.length;

  const tex = tileTexture();
  const uniforms = {
    uTex: { value: tex },
    uTime: { value: 0 },
    uG: { value: 0 },
    uTile: { value: new THREE.Vector2(TILE_W, TILE_H) },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  rig.add(mesh);

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let px = 0;
  let py = 0;
  let cx = 0;
  let cy = 0;
  let raf = 0;
  let last = 0;
  let visible = true;

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    /* One unit is one CSS pixel at z = 0, same as the DOM in front of it. */
    camera.fov = (2 * Math.atan(h / 2 / DIST) * 180) / Math.PI;
    camera.updateProjectionMatrix();
    if (still) renderer.render(scene, camera);
  };

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    if (!still) uniforms.uTime.value += dt;
    cx += (px - cx) * (1 - Math.exp(-dt / 0.35));
    cy += (py - cy) * (1 - Math.exp(-dt / 0.35));
    rig.rotation.set(cy * 0.07, cx * 0.11, 0);
    rig.position.set(cx * -40, cy * 26, 0);
    renderer.render(scene, camera);
    if (visible && !still) raf = requestAnimationFrame(frame);
  };
  const kick = () => {
    if (!raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  };

  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    px = ((e.clientX - r.left) / r.width) * 2 - 1;
    py = ((e.clientY - r.top) / r.height) * 2 - 1;
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) kick();
  });
  io.observe(host);
  window.addEventListener("pointermove", onMove, { passive: true });
  resize();
  kick();

  return {
    hold(g) {
      uniforms.uG.value = g;
      if (still) kick();
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      geo.dispose();
      quad.dispose();
      mat.dispose();
      tex.dispose();
      renderer.dispose();
    },
  };
}
