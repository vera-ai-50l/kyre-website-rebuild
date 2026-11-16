import * as THREE from "three";

/* Hero 02. Four hundred rows, one decision.

   A dashboard is a few thousand marks on a screen, and the difference between
   a table nobody reads and a number somebody acts on is only where those marks
   are. So the hero is the marks: one cloud of points that is first a table —
   every row the same weight — then the same rows ranked, then the single
   figure that was in there the whole time.

   The three arrangements are drawn on a 2D canvas and sampled, so changing a
   shape is changing a drawing. Every point carries all three positions and the
   vertex shader blends between two of them; a transition is one uniform. */

export type Field = { to(i: number): void; dispose(): void };

const DIST = 1000;
const DW = 1000;
const DH = 560;
const ACCENT = "#ff0000";

type Draw = (x: CanvasRenderingContext2D, font: string) => void;

function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/* 0 — the table. A header and thirteen rows, six columns, nothing louder than
   anything else. */
const rows: Draw = (x) => {
  const rnd = seeded(3);
  const cols = [0, 236, 420, 590, 748, 890];
  const max = [190, 140, 130, 120, 104, 110];
  x.fillStyle = "#fff";
  for (let r = 0; r < 14; r++) {
    const y = r * 40 + 14;
    cols.forEach((cx, c) => {
      const w = r === 0 ? max[c] * 0.5 : max[c] * (0.45 + rnd() * 0.55);
      x.beginPath();
      x.roundRect(cx, y, w, r === 0 ? 8 : 12, 6);
      x.fill();
    });
  }
};

/* 1 — the same rows, sorted by what they cost. One of them is not like the
   others, and now it is at the top and a different colour. */
const ranked: Draw = (x) => {
  for (let i = 0; i < 9; i++) {
    x.fillStyle = i === 0 ? ACCENT : "#fff";
    x.beginPath();
    x.roundRect(0, i * 62 + 4, DW * (i === 0 ? 1 : 0.6 * Math.pow(0.79, i - 1)), 34, 17);
    x.fill();
  }
};

/* 2 — the answer. */
const answer: Draw = (x, font) => {
  x.textBaseline = "alphabetic";
  x.fillStyle = ACCENT;
  x.font = `600 600px ${font}`;
  x.fillText("1", 30, 492);
  x.fillStyle = "#fff";
  x.font = `500 168px ${font}`;
  x.fillText("of 400", 400, 492);
  x.beginPath();
  x.roundRect(408, 250, 250, 14, 7);
  x.fill();
};

function sample(draw: Draw, n: number, font: string, seed: number) {
  const c = document.createElement("canvas");
  c.width = DW;
  c.height = DH;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  draw(x, font);
  const { data } = x.getImageData(0, 0, DW, DH);
  const hits: number[] = [];
  for (let py = 0; py < DH; py += 2) {
    for (let px = 0; px < DW; px += 2) {
      const i = (py * DW + px) * 4;
      if (data[i + 3] > 128) hits.push(px, py, data[i + 1] < 90 ? 1 : 0);
    }
  }
  const rnd = seeded(seed);
  const pos = new Float32Array(n * 3);
  const acc = new Float32Array(n);
  const count = hits.length / 3;
  for (let i = 0; i < n; i++) {
    const h = Math.floor(rnd() * count) * 3;
    pos[i * 3] = hits[h] + rnd() * 2 - DW / 2;
    pos[i * 3 + 1] = -(hits[h + 1] + rnd() * 2 - DH / 2);
    pos[i * 3 + 2] = (rnd() - 0.5) * 70;
    acc[i] = hits[h + 2];
  }
  return { pos, acc };
}

const VERT = /* glsl */ `
uniform float uFrom;
uniform float uTo;
uniform float uT;
uniform float uTime;
uniform float uScale;
uniform vec2 uOffset;
uniform vec2 uMouse;
uniform float uPush;
uniform float uSize;
attribute vec3 aP0;
attribute vec3 aP1;
attribute vec3 aP2;
attribute vec3 aAcc;
attribute vec4 aRnd;
varying float vAcc;
varying float vLit;

/* Slot 3 is no drawing at all: where the points are before anybody has
   arranged them. */
vec3 pick(float i) {
  if (i < 0.5) return aP0;
  if (i < 1.5) return aP1;
  if (i < 2.5) return aP2;
  return (aRnd.xyz - 0.5) * vec3(1900.0, 1100.0, 900.0);
}
float tone(float i) {
  if (i < 0.5) return aAcc.x;
  if (i < 1.5) return aAcc.y;
  if (i < 2.5) return aAcc.z;
  return 0.0;
}

void main() {
  /* Each point leaves on its own beat and lands hard: quick away, long stop. */
  float t = clamp((uT - aRnd.x * 0.42) / 0.58, 0.0, 1.0);
  t = 1.0 - pow(1.0 - t, 4.0);
  vec3 p = mix(pick(uFrom), pick(uTo), t);

  /* Mid-flight it is neither shape: it swings wide and comes forward. */
  float mid = sin(t * 3.14159);
  float a = aRnd.y * 6.2832 + uTime * 0.25;
  p.xy += vec2(cos(a), sin(a)) * mid * (40.0 + 190.0 * aRnd.z);
  p.z += mid * (aRnd.w - 0.35) * 620.0;

  /* Settled, it still breathes. */
  p.xy += vec2(sin(uTime * 0.9 + aRnd.y * 40.0), cos(uTime * 0.7 + aRnd.z * 40.0)) * 1.3;

  p *= uScale;
  p.xy += uOffset;

  /* The pointer parts them. They close behind it. */
  vec2 dm = p.xy - uMouse;
  float f = exp(-dot(dm, dm) / (150.0 * 150.0)) * uPush;
  p.xy += normalize(dm + 0.0001) * f * (40.0 + 80.0 * aRnd.z);
  p.z += f * (aRnd.w - 0.2) * 160.0;

  vAcc = mix(tone(uFrom), tone(uTo), t);
  vLit = 0.55 + 0.45 * aRnd.w + f * 0.6 + mid * 0.3;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.65 + aRnd.w * 0.8) * (1000.0 / -mv.z);
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying float vAcc;
varying float vLit;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.28, d);
  vec3 col = mix(vec3(0.93, 0.9, 0.84), vec3(1.0, 0.42, 0.1), vAcc);
  gl_FragColor = vec4(col * min(vLit, 1.3), a * 0.92);
}
`;

export async function mountField(canvas: HTMLCanvasElement, onLanded?: (i: number) => void): Promise<Field> {
  const host = canvas.parentElement!;
  /* The figures are set in the page's own face, so it has to have arrived. */
  await document.fonts.ready;
  const font = getComputedStyle(host).fontFamily;
  const small = host.clientWidth < 768;
  const n = small ? 13000 : 28000;

  const shapes = [rows, ranked, answer].map((d, i) => sample(d, n, font, 11 + i));
  const acc = new Float32Array(n * 3);
  const rndA = new Float32Array(n * 4);
  const rnd = seeded(5);
  for (let i = 0; i < n; i++) {
    acc[i * 3] = shapes[0].acc[i];
    acc[i * 3 + 1] = shapes[1].acc[i];
    acc[i * 3 + 2] = shapes[2].acc[i];
    for (let k = 0; k < 4; k++) rndA[i * 4 + k] = rnd();
  }
  const geo = new THREE.BufferGeometry();
  /* three wants a "position"; the shader never reads it. */
  geo.setAttribute("position", new THREE.BufferAttribute(shapes[0].pos, 3));
  geo.setAttribute("aP0", new THREE.BufferAttribute(shapes[0].pos, 3));
  geo.setAttribute("aP1", new THREE.BufferAttribute(shapes[1].pos, 3));
  geo.setAttribute("aP2", new THREE.BufferAttribute(shapes[2].pos, 3));
  geo.setAttribute("aAcc", new THREE.BufferAttribute(acc, 3));
  geo.setAttribute("aRnd", new THREE.BufferAttribute(rndA, 4));

  const uniforms = {
    uFrom: { value: 3 },
    uTo: { value: 0 },
    uT: { value: 0 },
    uTime: { value: 0 },
    uScale: { value: 1 },
    uOffset: { value: new THREE.Vector2() },
    uMouse: { value: new THREE.Vector2(9999, 9999) },
    uPush: { value: 0 },
    uSize: { value: 2 },
  };
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 10, 5000);
  camera.position.z = DIST;
  const rig = new THREE.Group();
  rig.add(points);
  scene.add(rig);

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;
  let last = 0;
  let visible = true;
  let queued = -1;
  let px = 0;
  let py = 0;
  let cx = 0;
  let cy = 0;
  let push = 0;
  let over = false;

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    const dpr = Math.min(devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = (2 * Math.atan(h / 2 / DIST) * 180) / Math.PI;
    camera.updateProjectionMatrix();
    /* Wide: the drawing takes the right half and the copy the bottom
       left. Narrow: drawing above, copy below. */
    if (w >= 900) {
      /* Right half of the content column (86rem, 2rem gutters), so it never
         runs under the headline in the left half. */
      const cw = Math.min(w - 64, 1312);
      const scale = Math.min((cw * 0.5) / DW, (h * 0.5) / DH);
      uniforms.uScale.value = scale;
      uniforms.uOffset.value.set(cw / 2 - (DW * scale) / 2, h * 0.12);
    } else {
      /* Pinned 104px under the top edge; the copy's top padding in the
         stylesheet (8rem + 48vw) is this plus the drawing's height. */
      const scale = (w * 0.86) / DW;
      uniforms.uScale.value = scale;
      uniforms.uOffset.value.set(0, h / 2 - 104 - (DH * scale) / 2);
    }
    uniforms.uSize.value = (w >= 900 ? 2.1 : 1.7) * dpr;
  };

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    uniforms.uTime.value += dt;
    if (uniforms.uT.value < 1) {
      uniforms.uT.value = Math.min(1, uniforms.uT.value + dt / (still ? 0.001 : 2.3));
      if (uniforms.uT.value === 1) {
        onLanded?.(uniforms.uTo.value);
        if (queued >= 0) {
          const next = queued;
          queued = -1;
          api.to(next);
        }
      }
    }
    const k = 1 - Math.exp(-dt / 0.3);
    cx += (px - cx) * k;
    cy += (py - cy) * k;
    push += ((over ? 1 : 0) - push) * (1 - Math.exp(-dt / 0.25));
    uniforms.uPush.value = push;
    rig.rotation.set(cy * 0.09, cx * 0.16, 0);
    renderer.render(scene, camera);
    if (visible && (!still || uniforms.uT.value < 1)) raf = requestAnimationFrame(frame);
  };
  const kick = () => {
    if (!raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  };

  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    over = mx >= 0 && my >= 0 && mx <= r.width && my <= r.height && e.pointerType !== "touch";
    px = (mx / r.width) * 2 - 1;
    py = (my / r.height) * 2 - 1;
    uniforms.uMouse.value.set(mx - r.width / 2, r.height / 2 - my);
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

  const api: Field = {
    to(i) {
      if (i === uniforms.uTo.value && queued < 0) return;
      /* Mid-flight, wait for the landing: a point cannot leave from somewhere
         it has not arrived. */
      if (uniforms.uT.value < 1) {
        queued = i;
        return;
      }
      uniforms.uFrom.value = uniforms.uTo.value;
      uniforms.uTo.value = i;
      uniforms.uT.value = 0;
      kick();
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    },
  };
  return api;
}
