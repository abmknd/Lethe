/**
 * THE EMPTY / ERROR STATE SHADERS — raymarched 3D, dithered to 1 bit.
 *
 * ── Why 3D ──────────────────────────────────────────────────────────────────
 *
 * The first version drew flat 2D silhouettes. They were legible and they were
 * dead: no form, no weight, and nothing for the dither to bite on. A dithered
 * FLAT shape is just a noisy shape. A dithered SHADED shape is an engraving —
 * stipple density becomes the shading, which is the point of the technique and
 * the reason the brand's plates read the way they do.
 *
 * So each asset is a signed-distance field in 3D, raymarched, lit, and the
 * resulting luminance is what the Bayer threshold eats.
 *
 * ── The dither is recovered, not invented ───────────────────────────────────
 *
 * The GLSL hero was retired in 39078d9; its eight shaders sit in 31d2b93.
 * `hero/src/shaders/dither.frag.glsl` is the house style: an 8x8 ordered Bayer
 * threshold blended 0.3 toward per-cell hash noise, density in, one bit out.
 * DITHER_NOISE, TEMPORAL_HZ and the eight whole-cell offsets are its numbers
 * verbatim.
 *
 * INK IS DARKNESS. `density = 1 - luminance`, floored at 0.14 so a fully lit
 * face still carries stipple rather than punching a hole through the object.
 * That is the engraving convention, and it is what makes a lit top and a
 * shadowed underside read as one solid form.
 *
 * ── The contract ────────────────────────────────────────────────────────────
 *
 *   u_res       canvas size in device pixels
 *   u_time      seconds; each shader owns its loop length
 *   u_ink       Blue 600
 *   u_field     the surface behind
 *   u_temporal  whole Bayer cells, stepped at <= 12Hz
 *
 * The world is scaled so ONE UNIT IS THE 140px CANVAS at the subject's depth,
 * which is what keeps "roll 4px" expressible as 4/140.
 */

export const PRELUDE = /* glsl */ `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec3  u_ink;
uniform vec3  u_field;
uniform vec2  u_temporal;

const float PI = 3.14159265;

/* ── dither (31d2b93 hero/src/shaders/dither.frag.glsl) ───────────────────── */

float Bayer2(vec2 a){ a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float Bayer4(vec2 a){ return Bayer2(0.5 * a) * 0.25 + Bayer2(a); }
float Bayer8(vec2 a){ return Bayer4(0.5 * a) * 0.25 + Bayer4(a); }

float cellHash(vec2 p){
  p = floor(p);
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

const float DITHER_NOISE = 0.3;

/* density -> one bit. Transparent where there is no ink: these sit on cards. */
vec4 inkFrom(float density){
  float t = mix(Bayer8(gl_FragCoord.xy + u_temporal),
                cellHash(gl_FragCoord.xy + u_temporal * 3.0),
                DITHER_NOISE);
  t = t * (63.0 / 64.0) + (0.5 / 64.0);
  return vec4(u_ink, step(t, clamp(density, 0.0, 1.0)));
}

/* ── 3D primitives ───────────────────────────────────────────────────────── */

mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1.,0.,0., 0.,c,-s, 0.,s,c); }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }
mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,-s,0., s,c,0., 0.,0.,1.); }

float sdSphere(vec3 p, float r){ return length(p) - r; }

float sdCapsule3(vec3 p, vec3 a, vec3 b, float r){
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float sdRoundBox3(vec3 p, vec3 b, float r){
  vec3 q = abs(p) - b + r;
  return min(max(q.x, max(q.y, q.z)), 0.0) + length(max(q, 0.0)) - r;
}

/* A 2D field extruded along z, rounded on the rim. */
float opExtrude(vec3 p, float d2, float h, float r){
  vec2 w = vec2(d2 + r, abs(p.z) - h + r);
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - r;
}

float opSmoothUnion(float d1, float d2, float k){
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

/* ── march and shade ─────────────────────────────────────────────────────── */

float map(vec3 p);   /* each shader defines its own */

vec3 calcNormal(vec3 p){
  /* Tetrahedral offsets: four map() calls instead of six. */
  vec2 e = vec2(1.0, -1.0) * 0.0013;
  return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) +
                   e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
}

float calcAO(vec3 p, vec3 n){
  float occ = 0.0, sca = 1.0;
  for(int i = 0; i < 5; i++){
    float h = 0.012 + 0.11 * float(i) / 4.0;
    occ += (h - map(p + n * h)) * sca;
    sca *= 0.82;
  }
  return clamp(1.0 - 2.4 * occ, 0.0, 1.0);
}

/* Soft shadow — what makes a fallen piece look like it is ON the floor rather
   than floating a little above it. */
float softShadow(vec3 ro, vec3 rd, float tmin, float tmax){
  float res = 1.0, t = tmin;
  for(int i = 0; i < 20; i++){
    float h = map(ro + rd * t);
    res = min(res, 9.0 * h / t);
    t += clamp(h, 0.014, 0.10);
    if(res < 0.005 || t > tmax) break;
  }
  return clamp(res, 0.0, 1.0);
}

const vec3 LIG = vec3(0.485, 0.728, 0.485);   /* pre-normalised key */

/* Lit luminance -> ink density. Floored so a bright face keeps its stipple. */
float shadeDensity(vec3 pos, vec3 rd){
  vec3  n   = calcNormal(pos);
  float dif = clamp(dot(n, LIG), 0.0, 1.0);
  float sha = softShadow(pos + n * 0.016, LIG, 0.02, 1.3);
  float amb = 0.42 + 0.38 * n.y;
  float ao  = calcAO(pos, n);
  float rim = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.0);
  float spe = pow(clamp(dot(reflect(-LIG, n), -rd), 0.0, 1.0), 22.0) * sha;

  float lum = amb * ao * 0.42 + dif * sha * 0.80 + spe * 0.45 - rim * 0.20;
  return clamp(mix(0.14, 1.0, 1.0 - lum), 0.0, 1.0);
}

vec3 rayDir(vec2 p, float zoom){ return normalize(vec3(p, -zoom)); }
`;

/**
 * 1 · WAVING HAND — nothing is wrong, there is just nothing here yet.
 *
 * A palm flattened in z with five digits, each built from two capsule segments
 * so the knuckle bends rather than the finger being a straight pin. The wave
 * pivots at the WRIST and carries a yaw, so the hand turns as it swings
 * instead of sliding across the frame like a wiper blade.
 */
export const HAND = /* glsl */ `${PRELUDE}
float gT;

float finger(vec3 p, vec3 base, float ang, float len, float r, float bend){
  vec3 mid = base + rotZ(ang) * vec3(0.0, len * 0.55, 0.0);
  vec3 tip = mid + rotZ(ang + bend) * vec3(0.0, len * 0.5, 0.0);
  return opSmoothUnion(sdCapsule3(p, base, mid, r),
                       sdCapsule3(p, mid, tip, r * 0.82), 0.02);
}

float map(vec3 p){
  float wave = sin(gT * 2.5);
  vec3 pivot = vec3(0.0, -0.34, 0.0);
  p = rotZ(wave * 0.34) * rotY(wave * 0.30) * (p - pivot) + pivot;

  /* palm — flattened in z so it has a back and a front */
  float d = sdRoundBox3(p - vec3(0.0, -0.07, 0.0), vec3(0.125, 0.135, 0.052), 0.055);

  for(int i = 0; i < 4; i++){
    float f    = float(i);
    float ang  = (f - 1.5) * 0.20;
    float len  = 0.215 - abs(f - 1.35) * 0.026;
    float bend = 0.16 + 0.07 * sin(gT * 2.5 + f * 0.6);
    vec3  base = vec3((f - 1.5) * 0.066, 0.055, 0.0);
    d = opSmoothUnion(d, finger(p, base, ang, len, 0.030, bend), 0.030);
  }

  /* thumb — out of the palm plane, which stops it reading as a mitten */
  vec3 tb = vec3(-0.115, -0.045, 0.024);
  vec3 tm = tb + rotZ(1.05) * vec3(0.0, 0.085, 0.0);
  vec3 tt = tm + rotZ(0.72) * vec3(0.0, 0.070, 0.0);
  d = opSmoothUnion(d, opSmoothUnion(sdCapsule3(p, tb, tm, 0.036),
                                     sdCapsule3(p, tm, tt, 0.030), 0.022), 0.040);

  /* wrist */
  d = opSmoothUnion(d, sdCapsule3(p, vec3(0.0, -0.20, 0.0), vec3(0.0, -0.42, 0.0), 0.062), 0.035);
  return d;
}

void main(){
  gT = u_time;
  vec2 p  = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 ro = vec3(0.0, 0.02, 1.55);
  vec3 rd = rayDir(p, 1.7);

  float t = 0.0;
  bool hit = false;
  for(int i = 0; i < 72; i++){
    float d = map(ro + rd * t);
    if(d < 0.0016){ hit = true; break; }
    t += d;
    if(t > 3.2) break;
  }
  if(!hit){ gl_FragColor = vec4(u_ink, 0.0); return; }
  gl_FragColor = inkFrom(shadeDensity(ro + rd * t, rd));
}
`;

/**
 * 2 · BREATHING MESH THAT COLLAPSES — the connection is on their end.
 *
 * A 4x4 lattice of spheres joined by struts, hanging over a floor. It breathes;
 * then the struts let go and every node falls, lands and squashes flat. There
 * IS a floor plane, so the landing is a real contact with a real contact
 * shadow rather than nodes stopping at an invisible line.
 *
 * Each node falls under `0.5*g*t^2` from its own release time, so the lattice
 * comes apart from one corner instead of dropping as a slab.
 */
export const MESH = /* glsl */ `${PRELUDE}
const float CYCLE  = 5.0;
const float FLOORY = -0.34;
const float NR     = 0.044;
float gT;

vec3 nodeAt(float i, float j){
  float lt = mod(gT, CYCLE);
  float breathe = 1.0 + 0.075 * sin(gT * 1.9);

  vec3 rest = vec3((i - 1.5) * 0.155, (j - 1.5) * 0.155, 0.0) * breathe;
  rest.z += 0.05 * sin(gT * 1.5 + i * 0.9 + j * 0.7);

  float tau = max(lt - (2.6 + (i + j) * 0.055), 0.0);
  float k   = clamp(tau / 0.8, 0.0, 1.0);

  float y = max(rest.y - 1.9 * tau * tau, FLOORY + NR * 0.55);
  return vec3(mix(rest.x, rest.x * 1.25, k), y, mix(rest.z, rest.z * 1.25 + 0.02, k));
}

float landedAt(float i, float j){
  float lt  = mod(gT, CYCLE);
  float tau = max(lt - (2.6 + (i + j) * 0.055), 0.0);
  return clamp(tau / 0.8, 0.0, 1.0);
}

float map(vec3 p){
  float lt = mod(gT, CYCLE);
  float linked = 1.0 - smoothstep(2.5, 2.75, lt);

  float d = p.y - FLOORY;                     /* floor plane */

  for(int i = 0; i < 4; i++){
    for(int j = 0; j < 4; j++){
      float fi = float(i), fj = float(j);
      vec3 a = nodeAt(fi, fj);

      /* squash on contact: an ellipsoid, scaled in y */
      float g = smoothstep(0.75, 1.0, landedAt(fi, fj));
      vec3 q = (p - a) / vec3(1.0 + g * 0.30, 1.0 - g * 0.34, 1.0 + g * 0.30);
      d = min(d, sdSphere(q, NR) * 0.80);

      if(linked > 0.01){
        if(i < 3) d = min(d, sdCapsule3(p, a, nodeAt(fi + 1.0, fj), 0.009 * linked));
        if(j < 3) d = min(d, sdCapsule3(p, a, nodeAt(fi, fj + 1.0), 0.009 * linked));
      }
    }
  }
  return d;
}

void main(){
  gT = u_time;
  vec2 p  = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 ro = vec3(0.0, 0.16, 1.45);
  vec3 rd = rotX(-0.16) * rayDir(p, 1.75);

  float t = 0.0;
  bool hit = false;
  for(int i = 0; i < 64; i++){
    float d = map(ro + rd * t);
    if(d < 0.0018){ hit = true; break; }
    t += d;
    if(t > 3.4) break;
  }
  if(!hit){ gl_FragColor = vec4(u_ink, 0.0); return; }

  vec3 pos = ro + rd * t;
  float dens = shadeDensity(pos, rd);
  /* Fade the floor toward the edges so it reads as ground, not as a wall. */
  if(pos.y < FLOORY + 0.005) dens *= 1.0 - smoothstep(0.28, 0.70, length(pos.xz));
  gl_FragColor = inkFrom(dens);
}
`;

/**
 * 3 · ROLLING GEAR THAT BREAKS, TUMBLES AND FALLS — this one is on us.
 *
 * An extruded gear rolls 4px right and 4px back, twice. 4px is literal: the
 * world is scaled so one unit is the canvas, so 4/140 = 0.02857. It ROLLS
 * WITHOUT SLIPPING — rotation is `-x/R`, tied to the travel and not to the
 * clock, which is the one thing that makes this kind of animation look wrong
 * when it is missed.
 *
 * Then it cracks and the two halves become RIGID BODIES. Each takes an impulse
 * out of the break, a spin about all three axes, and gravity. They tumble and
 * fall out of frame. No easing curves: position is `p0 + v*t + 0.5*g*t^2` and
 * orientation is `w*t`, because a thing that has broken should obey the same
 * arithmetic a dropped object does.
 */
export const GEAR = /* glsl */ `${PRELUDE}
/* 4.8, measured not guessed: the halves are out of frame by t=4.5, so a longer
   cycle just holds an empty canvas. This leaves ~0.3s of beat before the loop. */
const float CYCLE = 4.8;
const float R     = 0.20;
const float PX    = 0.0071428;   /* 1/140 */
const float BREAK = 3.25;
float gT;

float gearProfile(vec2 q){
  float a = atan(q.y, q.x);
  float w = fract(a / (2.0 * PI) * 10.0 + 0.5) - 0.5;
  float r = R + 0.042 * smoothstep(0.29, 0.19, abs(w));
  float d = length(q) - r;
  return max(d, -(length(q) - 0.058));            /* bore */
}

float gearHalf(vec3 q, float sg, float crack){
  float body = opExtrude(q, gearProfile(q.xy), 0.050, 0.012);
  return max(body, -sg * q.y - crack);            /* clip to this half */
}

float map(vec3 p){
  float lt = mod(gT, CYCLE);

  float travel = 0.0;
  if(lt < 2.8){
    float ph = lt / 0.7, seg = floor(ph), f = smoothstep(0.0, 1.0, fract(ph));
    if(seg == 0.0) travel =  4.0 * PX * f;
    if(seg == 1.0) travel =  4.0 * PX * (1.0 - f);
    if(seg == 2.0) travel =  4.0 * PX * f;
    if(seg == 3.0) travel =  4.0 * PX * (1.0 - f);
  }
  float roll  = -travel / R;                       /* rolling, not slipping */
  float tau   = max(lt - BREAK, 0.0);              /* seconds since the break */
  float crack = smoothstep(BREAK - 0.40, BREAK, lt) * 0.012;

  float d = 1e9;
  for(int s = 0; s < 2; s++){
    float sg = s == 0 ? 1.0 : -1.0;

    /* rigid-body state: p0 + v*t + 0.5*g*t^2, orientation w*t */
    vec3 T = vec3(travel, 0.0, 0.0)
           + vec3(sg * 0.30, 0.34, sg * 0.10) * tau
           + vec3(0.0, -1.75, 0.0) * 0.5 * tau * tau;

    mat3 Rm = rotZ(roll + sg * 5.2 * tau) * rotX(sg * 3.4 * tau) * rotY(2.1 * tau);

    /* into body space: q = R^T (p - T), and post-multiplying by a mat3 in
       GLSL is exactly that transpose-multiply. */
    d = min(d, gearHalf((p - T) * Rm, sg, crack));
  }
  return d;
}

void main(){
  gT = u_time;
  float lt = mod(u_time, CYCLE);
  vec2 p  = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 ro = vec3(0.0, 0.0, 1.50);
  vec3 rd = rayDir(p, 1.75);

  float t = 0.0;
  bool hit = false;
  for(int i = 0; i < 72; i++){
    float d = map(ro + rd * t);
    if(d < 0.0016){ hit = true; break; }
    t += d;
    if(t > 3.4) break;
  }
  if(!hit){ gl_FragColor = vec4(u_ink, 0.0); return; }

  float dens = shadeDensity(ro + rd * t, rd);
  /* the loop seam: gone before it snaps back to whole */
  dens *= 1.0 - smoothstep(CYCLE - 0.55, CYCLE - 0.10, lt);
  gl_FragColor = inkFrom(dens);
}
`;

export const SHADERS = { hand: HAND, mesh: MESH, gear: GEAR } as const;
export type ShaderName = keyof typeof SHADERS;
