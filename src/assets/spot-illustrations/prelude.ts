/**
 * SPOT ILLUSTRATION PRELUDE — the shared half of every animated asset.
 *
 * Every illustration in this folder is `PRELUDE + its own map() and main()`.
 * Nothing here is specific to one subject: the dither, the SDF primitives, the
 * raymarcher, the lighting, the ping-pong clock and the ballistics all live
 * here so a new asset is a shape and a timeline, not a rendering pipeline.
 *
 * See `illustration.md` at the repo root for the full rationale — what each
 * constant is, why it has the value it has, and which ones were arrived at by
 * measurement rather than taste.
 *
 * ── The technique ───────────────────────────────────────────────────────────
 *
 * Each asset is a signed-distance field in 3D, raymarched and lit; the
 * resulting LUMINANCE is what the Bayer threshold eats. A dithered flat shape
 * is just a noisy shape; a dithered shaded shape is an engraving.
 *
 * ── The dither, and why it is quieter than the hero's ───────────────────────
 *
 * The construction is the retired hero's (removed in 39078d9, alive in
 * 31d2b93, `hero/src/shaders/dither.frag.glsl`): an 8x8 ordered Bayer threshold
 * blended toward per-cell hash noise, density in, one bit out. Two departures,
 * because these are small objects and the hero was a full-bleed landscape:
 * noise 0.30 -> 0.10, and the luminance is gammaed with the density floor at
 * 0.05. At landscape scale a woven Bayer grid is the problem; at this size the
 * SPECKLE is, and it was eating the seams between parts.
 *
 * ── The canvas is not square ────────────────────────────────────────────────
 *
 * `p` is normalised by `u_res.y`, so a WIDER canvas simply widens the visible x
 * range and leaves the subject's scale alone. The two assets that scatter get a
 * wider box; nothing that flies sideways should meet an edge.
 *
 * ── No floor is modelled ────────────────────────────────────────────────────
 *
 * The floor is the bottom of the frame, not geometry. Falling pieces clamp to a
 * rest height. No ground plane and no cast shadow: dropping both took an
 * 18-step shadow march off every shaded pixel, and AO alone gives all the
 * contact darkening the eye asks for at this size.
 */

export const PRELUDE = /* glsl */ `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec3  u_ink;    /* the deep — Blue 600 */
uniform vec3  u_ink2;   /* the lift — Blue 500, for the duotone */
uniform vec3  u_field;
uniform vec2  u_temporal;

const float PI = 3.14159265;

/* The rest line. Not geometry — just where falling things stop.
   RAISED from -0.305 after measuring the edges: pieces were touching the bottom
   of the frame once landed. The culprit was not the height so much as DEPTH —
   a piece thrown toward the camera projects larger and drops off the bottom —
   so the z-scatter came down with it. */
const float FLOORY = -0.235;

/* ── dither ──────────────────────────────────────────────────────────────── */

float Bayer2(vec2 a){ a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float Bayer4(vec2 a){ return Bayer2(0.5 * a) * 0.25 + Bayer2(a); }
float Bayer8(vec2 a){ return Bayer4(0.5 * a) * 0.25 + Bayer4(a); }

float cellHash(vec2 p){
  p = floor(p);
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

const float DITHER_NOISE = 0.10;

/**
 * CLUSTER — how many device pixels one threshold cell covers. It went to 0.5
 * (2x2 blocks) to fight a washed-out look and that was the wrong lever: the
 * grain got heavy and lumpy without the silhouette getting any crisper. Back to
 * 1.0, and the contrast problem is solved where it actually lives — at the
 * OUTLINE and in the ramp below.
 */
const float CLUSTER = 1.0;

/**
 * DUOTONE. It is still one bit of COVERAGE — a pixel is inked or it is not —
 * but the ink itself takes one of two tones by how dark that area is. The deep
 * carries the shadows and the lift carries the mid-lit stipple, so a shaded
 * underside separates from a lit face by hue as well as by dot count. That is
 * the luminous separation; going further would flatten the shading it is meant
 * to reveal.
 */
vec4 inkFrom(float density){
  vec2 cell = gl_FragCoord.xy * CLUSTER + u_temporal;
  float t = mix(Bayer8(cell), cellHash(cell * 3.0), DITHER_NOISE);
  t = t * (63.0 / 64.0) + (0.5 / 64.0);
  float d = clamp(density, 0.0, 1.0);
  /* Graded across nearly the whole range rather than a narrow crossover, so
     the two inks read as a ramp between them and not as two flat plates. */
  vec3 col = mix(u_ink2, u_ink, smoothstep(0.08, 0.88, d));
  return vec4(col, step(t, d));
}

/* ── 3D primitives ───────────────────────────────────────────────────────── */

mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1.,0.,0., 0.,c,-s, 0.,s,c); }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }
mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,-s,0., s,c,0., 0.,0.,1.); }

float sdSphere(vec3 p, float r){ return length(p) - r; }

float sdRoundBox3(vec3 p, vec3 b, float r){
  vec3 q = abs(p) - b + r;
  return min(max(q.x, max(q.y, q.z)), 0.0) + length(max(q, 0.0)) - r;
}

float sdCylY(vec3 p, float h, float r){
  vec2 d = vec2(length(p.xz) - r, abs(p.y) - h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float opExtrude(vec3 p, float d2, float h, float r){
  vec2 w = vec2(d2 + r, abs(p.z) - h + r);
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - r;
}

/* GLSL ES 1.0 has no round(). */
float rnd1(float x){ return floor(x + 0.5); }

/**
 * PING-PONG TIME. Plays 0..CYCLE, then CYCLE..0.
 *
 * Everything downstream is a pure function of this clock, so running it
 * backwards runs the WHOLE animation backwards: the pieces rise off the ground,
 * retrace the exact arcs they fell along, and reassemble. That is free, and it
 * is the only way to get a reversal that actually matches the break — hand-
 * animating a separate "reassemble" would drift from the path the pieces took.
 *
 * The seam is at the two turning points, where velocity is zero and the frame
 * either side is identical. There is nothing to fade.
 */
float pingPong(float t, float cycle){
  float ph = mod(t, cycle * 2.0);
  return ph < cycle ? ph : cycle * 2.0 - ph;
}

/* ── march and shade ─────────────────────────────────────────────────────── */

float map(vec3 p);

vec3 calcNormal(vec3 p){
  vec2 e = vec2(1.0, -1.0) * 0.0012;
  return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) +
                   e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
}

/* Tight radii: the near taps are what darken a SEAM between two touching
   parts, which is the whole reason the brick ball reads as bricks. */
float calcAO(vec3 p, vec3 n){
  float occ = 0.0, sca = 1.0;
  for(int i = 0; i < 5; i++){
    float h = 0.006 + 0.055 * float(i) / 4.0;
    occ += (h - map(p + n * h)) * sca;
    sca *= 0.78;
  }
  return clamp(1.0 - 3.4 * occ, 0.0, 1.0);
}

const vec3 LIG = vec3(0.485, 0.728, 0.485);

/**
 * THE SILHOUETTE IS DRAWN SOLID, and that is what was missing.
 *
 * A lit face has a low ink density by design, and against a WHITE card a lit
 * face at the object's edge simply dissolves — the form loses its boundary and
 * the whole thing reads as a smudge. Shading alone cannot fix that, because the
 * problem is at exactly the place shading says "bright".
 *
 * So the grazing band gets forced to full ink regardless of how lit it is. The
 * object always has a hard contour; inside it, the ramp does its normal work.
 * The floor is also back up to 0.13, so a lit face keeps a light stipple rather
 * than going empty and merging with the card.
 */
float shadeDensity(vec3 pos, vec3 rd){
  vec3  n   = calcNormal(pos);
  float dif = clamp(dot(n, LIG), 0.0, 1.0);
  float amb = 0.38 + 0.34 * n.y;
  float ao  = calcAO(pos, n);
  float graze = 1.0 - abs(dot(n, -rd));

  float lum = amb * ao * 0.38 + dif * ao * 0.88;
  lum = clamp((lum - 0.16) / (0.88 - 0.16), 0.0, 1.0);
  lum = lum * lum * (3.0 - 2.0 * lum);

  float dens = mix(0.13, 1.0, 1.0 - lum);
  float edge = smoothstep(0.62, 0.93, graze);      /* the contour */
  return clamp(max(dens, edge), 0.0, 1.0);
}

mat3 lookAt(vec3 ro, vec3 ta){
  vec3 cw = normalize(ta - ro);
  vec3 cu = normalize(cross(cw, vec3(0.0, 1.0, 0.0)));
  vec3 cv = cross(cu, cw);
  return mat3(cu, cv, cw);
}
vec3 aimed(mat3 cam, vec2 p, float zoom){ return cam * normalize(vec3(p, zoom)); }

/* ── shared ballistics ───────────────────────────────────────────────────── */

/**
 * Height of a body dropped from 'h0' with initial vertical speed 'v0', landing
 * on 'rest', WITH ONE BOUNCE.
 *
 * Two arcs and then still. Restitution 0.34, which is a dead-ish plastic thud
 * rather than a rubber ball. The first impact speed comes out of the ballistic
 * itself, so the bounce is proportional to the fall rather than a fixed hop.
 */
float fallWithBounce(float tau, float h0, float v0, float g, float rest, out float landed){
  float vImp = sqrt(max(v0 * v0 + 2.0 * g * (h0 - rest), 0.0));  /* speed at impact */
  float t1   = (v0 + vImp) / g;
  float v1   = 0.34 * vImp;
  float t2   = 2.0 * v1 / g;
  landed     = t1 + t2;

  if(tau < t1) return h0 + v0 * tau - 0.5 * g * tau * tau;
  if(tau < landed){ float s = tau - t1; return rest + v1 * s - 0.5 * g * s * s; }
  return rest;
}
`;
