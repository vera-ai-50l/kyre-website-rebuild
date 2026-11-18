/* The pane's shaders. Kept apart from the scene so the part that is glass and
   the part that is plumbing can be read separately.

   Two things changed from the first version, and both are about the same
   complaint — that the break looked drawn.

   The crack. It used to glow: every cut lit to the same brightness along its
   whole length, with a flash on top, which is how a crack is drawn in a comic.
   A real one is a hairline that is mostly dark and catches the light only
   where its edge happens to face a lamp. So a cut now gets nothing of its own;
   it is a 45° facet that mirrors the room, and the room has a bright ceiling
   and a dim floor. The facet on one side of a crack faces up and the one on
   the other faces down, so each crack is a light line beside a dark one, and
   which is which changes with the crack's bearing.

   The flight. Every piece used to leave along its own spoke at a speed set by
   its distance, which is a firework. Now a piece's path is its spoke swung a
   random amount, crumbs outrun plates, plates near the frame mostly drop, and
   the whole break leans one way because the blow was not square. */

const DIST = 1150;

export const VERT = /* glsl */ `
uniform float uCrack;
uniform float uFly;
uniform float uAr;
uniform vec2 uImpact;

attribute vec3 aCenter;
attribute vec4 aRand;
attribute float aSize;

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
  /* When the crack gets here: distance, bent by bearing. */
  float d = aCenter.z;
  float small = 1.0 - aSize;

  /* A piece is whole until the front reaches it and then it has let go — a
     short step, not a long blend, so the break arrives piece by piece. */
  float crack = smoothstep(0.0, 0.4, uCrack * 2.9 - d * 1.05);

  /* Leaving: the middle first, crumbs before plates, and a wide random beat on
     top so no ring of pieces ever moves as a ring. */
  float sa = clamp(uFly * 2.3 - d * 0.42 - aRand.x * 0.36 - aSize * 0.18, 0.0, 1.0);
  float away = sa * sa * (3.0 - 2.0 * sa);
  float seated = crack * (1.0 - away);

  vec2 rel = aCenter.xy - uImpact;
  float dist = length(rel);
  vec2 dir = rel / max(dist, 1e-4);

  /* Its spoke, swung up to forty degrees either way, then pushed the way the
     blow was going. */
  float sw = (aRand.z - 0.5) * 1.5;
  vec2 fdir = vec2(dir.x * cos(sw) - dir.y * sin(sw), dir.x * sin(sw) + dir.y * cos(sw));
  fdir = normalize(fdir + vec2(0.36, 0.1));

  /* Settled a couple of degrees off true once cracked — which is all it takes
     for every piece to throw the room somewhere different — then tumbling,
     the small ones several times faster than the large. */
  vec3 axis = normalize(vec3(aRand.y - 0.5, aRand.z - 0.5, (aRand.w - 0.5) * 0.6) + 1e-4);
  float turn = seated * (aRand.x - 0.5) * 0.1
    + away * (0.45 + aRand.y * 3.1) * mix(0.5, 1.7, small) * (aRand.z > 0.5 ? 1.0 : -1.0);
  mat3 R = rotAxis(axis, turn);

  /* Seated, the pieces barely part: a crack is a hairline, not a gap. */
  vec3 off = vec3(dir * seated * 0.0009 * (0.3 + dist), seated * (aRand.w - 0.45) * 0.0035);

  /* Near the frame the glass was hardly thrown at all. It drops. */
  float far = smoothstep(0.3, 1.0, dist);
  off.xy += fdir * away * mix(0.8, 0.22, far) * (0.3 + aRand.x * 1.15 + small * 0.5);
  off.y -= sa * sa * (0.08 + far * 0.6 + aSize * 0.22);
  off.z += sa * sa * (0.22 + aRand.w * 1.55 + small * 0.95) * mix(1.0, 0.42, far);

  vec4 mv = modelViewMatrix * vec4(vec3(aCenter.xy, 0.0) + R * position + off, 1.0);
  gl_Position = projectionMatrix * mv;

  vV = mv.xyz;
  vN = normalMatrix * (R * normal);
  vNf = normalMatrix * (R * vec3(0.0, 0.0, 1.0));
  vFace = normal.z;
  /* From where the vertex sits at rest, so the picture is carried by the piece
     rather than sliding across it. */
  vUv = (aCenter.xy + position.xy) / vec2(uAr, 1.0) + 0.5;
  vAlpha = 1.0 - smoothstep(0.72, 1.0, sa);
  vBroken = crack;
  vTint = aRand.x - 0.5;
}
`;

export const FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform float uAr;
uniform float uRadius;
uniform float uBright;
uniform float uFog;
uniform float uFlash;
uniform vec2 uImpact;

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

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

/* The lamps on their own: a big softbox high and left, a cooler one to the
   right, and one almost behind the lens, which is the one a piece square to
   the camera catches or misses depending on its two degrees of tilt. */
vec3 lamps(vec3 r) {
  vec3 c = vec3(1.0, 0.97, 0.93) * 2.3 * box(r, vec3(-0.55, 0.62, 0.55), 0.16);
  c += vec3(0.82, 0.9, 1.0) * 1.3 * box(r, vec3(0.78, -0.12, 0.6), 0.11);
  c += vec3(1.0) * 1.1 * box(r, vec3(0.16, 0.24, 1.0), 0.012);
  return c;
}

/* A daylight studio: pale underfoot, paler overhead. */
vec3 env(vec3 r) {
  vec3 c = mix(vec3(0.3, 0.31, 0.33), vec3(0.9, 0.91, 0.93), smoothstep(-0.55, 0.75, r.y));
  c += vec3(1.0) * 0.6 * smoothstep(0.03, 0.0, abs(r.y - 0.3)) * smoothstep(-0.2, 0.5, r.z);
  return c + lamps(r);
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
  vec3 Rv = reflect(-V, N);
  vec3 E = env(Rv);

  vec3 tex = texture2D(uTex, vUv).rgb;

  /* A lit display behind a sheet of glass: the picture is emitted, the room is
     reflected on top of it — barely, square on, and a great deal at a glancing
     angle. The lamp term is what separates one piece from the next once the
     pane has broken: same picture, different piece of the ceiling. */
  vec3 cFront = tex * uBright * (1.0 + vBroken * vTint * 0.1)
    + E * (0.03 + 0.8 * F)
    + lamps(Rv) * 0.05 * vBroken;

  /* Where it was hit the glass is not cracked, it is crushed: a patch of sugar
     a few millimetres across that shows white and hides the picture. */
  float hit = length(p - uImpact);
  float crush = vBroken * smoothstep(0.05, 0.004, hit);
  float grit = hash(floor(vUv * vec2(uAr, 1.0) * 760.0));
  cFront = mix(cFront, vec3(0.8, 0.86, 0.86) * (0.55 + 0.6 * grit), crush * (0.35 + 0.5 * grit));
  /* And around that, a bruise: fine haze that thins out within a hand's width. */
  cFront += vec3(0.75, 0.82, 0.82) * vBroken * smoothstep(0.2, 0.0, hit) * grit * grit * 0.11;

  /* The cut. Glass is green-blue through its edge and mirrors the room almost
     completely, so a facet that faces the ceiling is a bright line and one that
     faces the floor is a dark one. Cubed, to pull those two apart. The picture
     piped sideways through the glass is read several mips down — sharp, every
     glyph the cut crosses becomes a stripe and the edge turns into a barcode. */
  vec3 glass = vec3(0.7, 0.93, 0.9);
  vec3 piped = texture2D(uTex, vUv, 6.0).rgb;
  vec3 cEdge = glass * 0.02
    + piped * 0.4 * uBright
    + E * E * E * glass * (0.34 + 1.1 * F)
    + glass * uFlash * 0.3 * smoothstep(0.5, 0.0, hit);

  /* The back of the panel: dark, and it still has a surface. */
  vec3 cBack = vec3(0.03, 0.032, 0.038) + tex * 0.04 + E * (0.05 + 0.6 * F);

  vec3 col = cFront * front + cBack * back + mix(cFront, cEdge, vBroken) * edge;

  /* Lying back at rest, the far end goes to the colour of the room rather than
     to black: the room is light, so distance is haze, not shadow. Mixed in the
     colour and not the alpha — a see-through pane shows the walls of every cut
     inside it, which is a cracked screen before anything has hit it. */
  float depth = clamp((-vV.z - ${DIST}.0 * 0.86) / (${DIST}.0 * 0.62), 0.0, 1.0);
  col = mix(col, vec3(0.83, 0.835, 0.855), uFog * (0.3 + 0.68 * depth));

  gl_FragColor = vec4(col, vAlpha);
  #include <colorspace_fragment>
}
`;

/* Glass dust: the chips that come off the cut. Born where the crack passes,
   hang, then leave with the pieces. */
export const DUST_VERT = /* glsl */ `
uniform float uCrack;
uniform float uFly;
uniform float uTime;
uniform float uPx;
uniform vec2 uImpact;
attribute vec4 aSeed;
varying float vA;
varying float vTw;

void main() {
  vec2 rel = position.xy - uImpact;
  float d = length(rel);
  vec2 dir = rel / max(d, 1e-4);

  float born = smoothstep(0.0, 0.3, uCrack * 2.9 - d * 1.05);
  float sa = clamp(uFly * 1.7 - d * 0.3 - aSeed.x * 0.3, 0.0, 1.0);
  float away = sa * sa;

  vec3 p = position;
  p.xy += dir * (born * 0.014 * aSeed.y + away * (0.45 + aSeed.x * 1.5));
  p.xy += (aSeed.zw - 0.5) * (born * 0.022 + away * 0.75);
  p.x += away * 0.3;
  p.y -= born * 0.012 * aSeed.w + away * away * 0.42;
  p.z += born * (0.012 + aSeed.z * 0.04) + away * (0.25 + aSeed.y * 1.5);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  /* A chip shows white for the instant it faces a lamp; the rest of the time
     it is a grey speck. Spent well before the piece it came off has left. */
  vTw = pow(abs(sin(uTime * (1.4 + aSeed.x * 4.2) + aSeed.y * 6.283)), 14.0);
  vA = born * (1.0 - smoothstep(0.3, 0.8, sa)) * (0.3 + 0.7 * vTw);
  gl_PointSize = (1.0 + aSeed.z * 2.4) * uPx * (${DIST}.0 / max(-mv.z, 1.0));
}
`;

export const DUST_FRAG = /* glsl */ `
varying float vA;
varying float vTw;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.5, 0.1, r);
  /* Normal blending, not additive: the room is light, and a white point added
     to a white wall is nothing. */
  gl_FragColor = vec4(mix(vec3(0.2, 0.25, 0.27), vec3(1.0), vTw), core * vA);
}
`;
