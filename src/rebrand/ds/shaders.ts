/**
 * THE EMPTY / ERROR STATE SHADERS.
 *
 * Three 140x140 animated assets. Signed-distance fields for the geometry, then
 * the BRAND'S DITHER for the finish.
 *
 * ── The dither is recovered, not invented ───────────────────────────────────
 *
 * The GLSL hero was retired in 39078d9 and its eight shaders sit in 31d2b93.
 * `hero/src/shaders/dither.frag.glsl` is the house style for generated art: an
 * 8x8 ordered Bayer threshold blended 0.3 toward per-cell hash noise, density
 * in and one bit out. It is the same look as the micro-dot pointillism the
 * illustration prompts ask for, which is not a coincidence — it is the thing
 * that makes a shader and a rendered plate belong to one family.
 *
 * I first built these with smooth antialiased strokes, which looked fine and
 * looked like nothing else in the product. The constants here (DITHER_NOISE
 * 0.3, TEMPORAL_HZ 12, the eight whole-cell offsets) are the hero's, verbatim.
 *
 * ── The contract ────────────────────────────────────────────────────────────
 *
 *   u_res       canvas size in device pixels
 *   u_time      seconds; each shader owns its loop length
 *   u_ink       Blue 600
 *   u_field     the surface behind, for callers that want opaque output
 *   u_temporal  whole Bayer cells, stepped at <= 12Hz
 *
 * The coordinate space is `p = (gl_FragCoord.xy - 0.5*u_res)/u_res.y`, so p
 * spans -0.5..0.5 and ONE UNIT IS THE FULL 140px. That is what makes "roll
 * 4px" expressible: 4/140 = 0.02857.
 */

export const PRELUDE = /* glsl */ `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec3  u_ink;
uniform vec3  u_field;
uniform vec2  u_temporal;

const float PI = 3.14159265;

/* ── The dither, recovered from the retired hero (31d2b93 hero/src/shaders/
   dither.frag.glsl). This is the brand's generated-art styling and the reason
   these assets look like the illustration set rather than like clip art: a
   density field goes in, one bit comes out, ink or field, nothing between. ── */

float Bayer2(vec2 a){ a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float Bayer4(vec2 a){ return Bayer2(0.5 * a) * 0.25 + Bayer2(a); }
float Bayer8(vec2 a){ return Bayer4(0.5 * a) * 0.25 + Bayer4(a); }

float cellHash(vec2 p){
  p = floor(p);
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

/* DITHER_NOISE = 0.3 in the hero's config. Pure Bayer weaves a visible grid at
   a 1px pitch; blending toward per-cell noise gives engraved stipple instead. */
const float DITHER_NOISE = 0.3;

vec4 inkFrom(float density){
  float t = mix(Bayer8(gl_FragCoord.xy + u_temporal),
                cellHash(gl_FragCoord.xy + u_temporal * 3.0),
                DITHER_NOISE);
  /* Remap into (0,1) exclusive so density 0 NEVER inks and density 1 ALWAYS
     does — without this the empty corners speckle and the solid core holes. */
  t = t * (63.0 / 64.0) + (0.5 / 64.0);
  float ink = step(t, clamp(density, 0.0, 1.0));
  /* Transparent where there is no ink: these sit on cards, not on a field. */
  return vec4(u_ink, ink);
}

mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

float sdCircle(vec2 p, float r){ return length(p) - r; }

float sdCapsule(vec2 p, vec2 a, vec2 b, float r){
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float sdRoundBox(vec2 p, vec2 b, float r){
  vec2 d = abs(p) - b + r;
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}

float opSmoothUnion(float d1, float d2, float k){
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

/* An SDF turned into a DENSITY ramp for the dither to threshold. The stroke is
   solid at its centre and falls off over 'soft', so the dither renders a dense
   core that frays at the edge — the pointillist edge the illustrations have,
   rather than a clean antialiased one. */
float strokeDensity(float d, float w, float soft){
  return 1.0 - smoothstep(w, w + soft, abs(d));
}
float fillDensity(float d, float soft){
  return (1.0 - smoothstep(-soft, soft, d)) * 0.30;
}
`;

/**
 * 1 · WAVING HAND — the "you have not put anything here yet" state.
 *
 * A palm, four fingers and a thumb, all capsules smooth-unioned so it reads as
 * one shape rather than five. The whole hand pivots about the WRIST, which is
 * the only pivot that looks like a wave; rotating about the centre looks like
 * a metronome. The fingers carry a small phase-offset curl so the silhouette
 * changes through the swing instead of sliding rigidly.
 */
export const HAND = /* glsl */ `${PRELUDE}
float hand(vec2 p, float t){
  vec2 pivot = vec2(0.0, -0.27);
  p = rot(sin(t * 2.6) * 0.30) * (p - pivot) + pivot;

  float d = sdRoundBox(p - vec2(0.0, -0.055), vec2(0.112, 0.108), 0.070);

  for(int i = 0; i < 4; i++){
    float f    = float(i);
    float ang  = (f - 1.5) * 0.19;
    float len  = 0.195 - abs(f - 1.35) * 0.020;
    float curl = 0.045 * sin(t * 2.6 + f * 0.55);
    vec2  base = vec2((f - 1.5) * 0.060, 0.035);
    vec2  tip  = base + rot(ang + curl) * vec2(0.0, len);
    d = opSmoothUnion(d, sdCapsule(p, base, tip, 0.029), 0.026);
  }

  vec2 tb = vec2(-0.098, -0.045);
  vec2 tt = tb + rot(0.98) * vec2(0.0, 0.130);
  d = opSmoothUnion(d, sdCapsule(p, tb, tt, 0.032), 0.034);

  d = opSmoothUnion(d, sdCapsule(p, vec2(0.0, -0.145), vec2(0.0, -0.31), 0.052), 0.030);
  return d;
}

void main(){
  vec2  p    = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float soft = 2.2 / u_res.y;
  float d    = hand(p, u_time);
  gl_FragColor = inkFrom(max(strokeDensity(d, 0.0075, soft), fillDensity(d, soft)));
}
`;

/**
 * 2 · BREATHING MESH THAT COLLAPSES — the "this is your connection" state.
 *
 * A 5x5 lattice joined by its edges. It breathes, then every node drops to the
 * floor and flattens into a line, then it resets. The edges fade as the nodes
 * fall, because a mesh whose links survive the collapse reads as a net, not a
 * failure.
 *
 * The fall is `pow(k, 2.2)` — gravity, not a linear slide — and each node has a
 * small per-column delay so the lattice buckles rather than dropping as a slab.
 * The nodes squash on landing (wider than tall) which is what sells the floor.
 */
export const MESH = /* glsl */ `${PRELUDE}
const float CYCLE = 4.2;
const float FLOOR = -0.30;

vec2 node(float i, float j, float t, out float landed){
  float breathe = 1.0 + 0.055 * sin(t * 2.0);
  vec2  base    = vec2((i - 2.0) * 0.115, (j - 2.0) * 0.115) * breathe;

  float lt    = mod(t, CYCLE);
  float delay = (i + j) * 0.035;
  float k     = clamp((lt - (2.5 + delay)) / 0.55, 0.0, 1.0);
  k = pow(k, 2.2);
  landed = k;

  float y = mix(base.y, FLOOR + 0.012 * i, k);
  float x = mix(base.x, base.x * 1.22, k);
  return vec2(x, y);
}

void main(){
  vec2  p    = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float soft = 2.2 / u_res.y;
  float t    = u_time;

  float edges = 1e9;
  float dots  = 1e9;

  for(int i = 0; i < 5; i++){
    for(int j = 0; j < 5; j++){
      float fi = float(i), fj = float(j);
      float k; vec2 a = node(fi, fj, t, k);

      // Squash on landing: a circle that becomes an ellipse as it settles.
      vec2 q = (p - a) / vec2(1.0 + k * 0.9, 1.0 - k * 0.55);
      dots = min(dots, sdCircle(q, 0.019));

      float k2;
      if(i < 4) edges = min(edges, sdCapsule(p, a, node(fi + 1.0, fj, t, k2), 0.0022));
      if(j < 4) edges = min(edges, sdCapsule(p, a, node(fi, fj + 1.0, t, k2), 0.0022));
    }
  }

  float lt   = mod(t, CYCLE);
  float fade = 1.0 - smoothstep(2.4, 3.0, lt);

  /* Edges are thinner AND lighter, so the dither gives them a sparse stipple
     while the nodes stay solid — the lattice reads as structure behind the
     points rather than competing with them. */
  float density = max(strokeDensity(edges, 0.0018, soft) * 0.55 * fade,
                      strokeDensity(dots,  0.0060, soft));
  gl_FragColor = inkFrom(density);
}
`;

/**
 * 3 · ROLLING GEAR THAT SNAPS — the "this one is on us" state.
 *
 * Rolls 4px right and 4px back, twice, then a crack opens through the middle
 * and the two halves separate. 4px is literal: one unit is the canvas width, so
 * 4/140 = 0.02857.
 *
 * IT ROLLS WITHOUT SLIPPING — the rotation is `-x/R`, tied to the travel rather
 * than to the clock. A gear that slides while spinning at its own rate is the
 * single thing that makes this kind of animation look wrong, and it is free to
 * get right.
 *
 * The crack is a widening wedge subtracted from the body, so it opens from a
 * hairline; the halves then translate apart along the split normal and rotate
 * slightly, as two pieces losing a shared axle would.
 */
export const GEAR = /* glsl */ `${PRELUDE}
const float CYCLE = 4.6;
const float R     = 0.175;
const float PX    = 0.0071428;   /* one canvas pixel: 1/140 */

float gearBody(vec2 q){
  float a = atan(q.y, q.x);
  float w = fract(a / (2.0 * PI) * 9.0 + 0.5) - 0.5;
  float r = R + 0.040 * smoothstep(0.30, 0.20, abs(w));
  float d = length(q) - r;
  d = max(d, -(length(q) - 0.062));                 /* hub bore */
  float ring = abs(length(q) - 0.108) - 0.010;      /* inner ring */
  return min(d, ring);
}

void main(){
  vec2  p    = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float soft = 2.2 / u_res.y;
  float t    = mod(u_time, CYCLE);

  /* Two there-and-back rolls of exactly 4px. */
  float travel = 0.0;
  if(t < 2.8){
    float ph = t / 0.7;
    float seg = floor(ph);
    float f   = smoothstep(0.0, 1.0, fract(ph));
    if(seg == 0.0) travel =  4.0 * PX * f;
    if(seg == 1.0) travel =  4.0 * PX * (1.0 - f);
    if(seg == 2.0) travel =  4.0 * PX * f;
    if(seg == 3.0) travel =  4.0 * PX * (1.0 - f);
  }

  float crack = smoothstep(2.9, 3.35, t);           /* hairline opens */
  float snap  = smoothstep(3.35, 3.95, t);          /* halves part */
  float gone  = smoothstep(4.15, 4.55, t);          /* fade for the loop */

  vec2  c   = vec2(travel, 0.0);
  float ang = -travel / R;                           /* rolling, not slipping */
  vec2  n   = vec2(0.0, 1.0);                        /* split normal, local */

  float d = 1e9;
  for(int s = 0; s < 2; s++){
    float sg = s == 0 ? 1.0 : -1.0;
    vec2  q  = p - c;
    q -= sg * (n * rot(ang)) * snap * 0.085;         /* pull apart */
    q  = rot(ang + sg * snap * 0.16) * q;            /* and tip over */
    float half_ = gearBody(q);
    half_ = max(half_, -sg * dot(q, n) - crack * 0.010);
    d = min(d, half_);
  }

  float density = max(strokeDensity(d, 0.0075, soft), fillDensity(d, soft));
  gl_FragColor = inkFrom(density * (1.0 - gone));
}
`;

export const SHADERS = { hand: HAND, mesh: MESH, gear: GEAR } as const;
export type ShaderName = keyof typeof SHADERS;
