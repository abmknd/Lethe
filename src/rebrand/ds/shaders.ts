/**
 * THE EMPTY / ERROR STATE SHADERS — raymarched 3D, dithered to 1 bit.
 *
 * Each asset is a signed-distance field in 3D, raymarched and lit, and the
 * resulting LUMINANCE is what the Bayer threshold eats. A dithered flat shape
 * is just a noisy shape; a dithered shaded shape is an engraving, which is the
 * point of the technique and why the brand's plates read the way they do.
 *
 * ── The dither is recovered, not invented ───────────────────────────────────
 *
 * The GLSL hero was retired in 39078d9; its eight shaders sit in 31d2b93.
 * `hero/src/shaders/dither.frag.glsl` is the house style: an 8x8 ordered Bayer
 * threshold blended 0.3 toward per-cell hash noise, density in, one bit out.
 * DITHER_NOISE, TEMPORAL_HZ and the eight whole-cell offsets are its numbers
 * verbatim. INK IS DARKNESS: `density = 1 - luminance`, floored at 0.14 so a
 * fully lit face keeps its stipple rather than holing through the object.
 *
 * ── THERE IS A FLOOR, AND IT IS THE BOTTOM OF THE FRAME ─────────────────────
 *
 * Anything that falls lands on `FLOORY` and STAYS THERE, in shot. An earlier
 * pass let the gear halves fly out of view, which reads as a bug rather than as
 * a break. FLOORY is set so the floor line sits just inside the bottom edge of
 * the 140px box, and every camera is tilted down far enough to see it, so a
 * landed piece is foreshortened on the ground instead of edge-on and invisible.
 *
 * ── The contract ────────────────────────────────────────────────────────────
 *
 *   u_res / u_time / u_ink / u_field / u_temporal
 *
 * The world is scaled so ONE UNIT IS THE 140px CANVAS at the subject's depth,
 * which keeps "roll 4px" expressible as 4/140.
 */

export const PRELUDE = /* glsl */ `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec3  u_ink;
uniform vec3  u_field;
uniform vec2  u_temporal;

const float PI = 3.14159265;

/* The ground. Everything that falls comes to rest on it, inside the frame. */
const float FLOORY = -0.300;

/* ── dither (31d2b93 hero/src/shaders/dither.frag.glsl) ───────────────────── */

float Bayer2(vec2 a){ a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float Bayer4(vec2 a){ return Bayer2(0.5 * a) * 0.25 + Bayer2(a); }
float Bayer8(vec2 a){ return Bayer4(0.5 * a) * 0.25 + Bayer4(a); }

float cellHash(vec2 p){
  p = floor(p);
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

const float DITHER_NOISE = 0.3;

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

/* A capsule that TAPERS. A finger of constant thickness is the single loudest
   tell that a hand was built from primitives. */
float sdCone3(vec3 p, vec3 a, vec3 b, float ra, float rb){
  vec3 ba = b - a, pa = p - a;
  float l2 = dot(ba, ba);
  float h  = clamp(dot(pa, ba) / l2, 0.0, 1.0);
  return length(pa - ba * h) - mix(ra, rb, h);
}

float sdRoundBox3(vec3 p, vec3 b, float r){
  vec3 q = abs(p) - b + r;
  return min(max(q.x, max(q.y, q.z)), 0.0) + length(max(q, 0.0)) - r;
}

float opExtrude(vec3 p, float d2, float h, float r){
  vec2 w = vec2(d2 + r, abs(p.z) - h + r);
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - r;
}

float opSmoothUnion(float d1, float d2, float k){
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

/* ── march and shade ─────────────────────────────────────────────────────── */

float map(vec3 p);

vec3 calcNormal(vec3 p){
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

float softShadow(vec3 ro, vec3 rd, float tmin, float tmax){
  float res = 1.0, t = tmin;
  for(int i = 0; i < 18; i++){
    float h = map(ro + rd * t);
    res = min(res, 9.0 * h / t);
    t += clamp(h, 0.015, 0.10);
    if(res < 0.005 || t > tmax) break;
  }
  return clamp(res, 0.0, 1.0);
}

const vec3 LIG = vec3(0.485, 0.728, 0.485);

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

/* Fade the ground out toward the edges so it reads as ground, not a backdrop. */
float floorFalloff(vec3 pos){
  return 1.0 - smoothstep(0.26, 0.62, length(pos.xz - vec2(0.0, 0.0)));
}

vec3 rayDir(vec2 p, float zoom){ return normalize(vec3(p, -zoom)); }

/* A LOOK-AT CAMERA, because tilting the ray about the origin does not aim the
   camera — it swings the frame off the subject. With ro=(0,0.10,1.52) and a
   -0.20 tilt the visible band at z=0 ran -0.674..+0.208, so the subject sat
   near the top edge and anything on the floor fell out of shot. Aiming at a
   target keeps the frame centred on the target by construction. */
mat3 lookAt(vec3 ro, vec3 ta){
  vec3 cw = normalize(ta - ro);
  vec3 cu = normalize(cross(cw, vec3(0.0, 1.0, 0.0)));
  vec3 cv = cross(cu, cw);
  return mat3(cu, cv, cw);
}
vec3 aimed(mat3 cam, vec2 p, float zoom){ return cam * normalize(vec3(p, zoom)); }
`;

/**
 * 1 · WAVING HAND.
 *
 * THE PREVIOUS ONE WAS A CLAW, and it was a proportion problem more than a
 * modelling one. Fingers were 0.215 against a 0.27 palm — about three-quarters
 * of palm length, where a real index finger is roughly EQUAL to the palm and
 * the middle is longer still. Short fat digits on a wide palm is exactly the
 * silhouette of a cartoon monster hand.
 *
 * What this one gets right, from actual hand anatomy:
 *
 *   LENGTH      index 0.95x palm, middle 1.06x, ring 0.96x, pinky 0.74x
 *   TAPER       every phalanx is a CONE, ~0.026 at the base to ~0.018 at the
 *               tip. Constant-radius capsules are the loudest primitive tell
 *   JOINTS      three phalanges each (45 / 32 / 23 percent of length) with a
 *               small cumulative curl, so knuckles exist
 *   KNUCKLE ARC the metacarpal heads sit on a CURVE, middle highest — a flat
 *               knuckle line is what made the old one look like a rake
 *   THUMB       off the radial side LOW on the palm, swung ~55 degrees out and
 *               forward in z, with a thenar bulge at its base. The thumb is
 *               what makes a hand read as a hand
 *   BLEND       k of 0.016 at the palm and 0.010 within a finger. The old 0.030
 *               melted the finger bases into webbing halfway to the tips
 *
 * The wave pivots at the wrist, ±0.30 rad, with a little yaw so it turns
 * through the swing rather than wiping like a blade.
 */
export const HAND = /* glsl */ `${PRELUDE}
float gT;

/* Three tapered phalanges with a cumulative curl. */
float digit(vec3 p, vec3 base, float splay, float len, float r0, float curl){
  float l1 = len * 0.45, l2 = len * 0.32, l3 = len * 0.23;
  mat3 m1 = rotZ(splay) * rotX(-curl * 0.55);
  vec3 a  = base;
  vec3 b  = a + m1 * vec3(0.0, l1, 0.0);
  mat3 m2 = m1 * rotX(-curl);
  vec3 c  = b + m2 * vec3(0.0, l2, 0.0);
  mat3 m3 = m2 * rotX(-curl * 1.25);
  vec3 e  = c + m3 * vec3(0.0, l3, 0.0);

  float r1 = r0, r2 = r0 * 0.88, r3 = r0 * 0.78, r4 = r0 * 0.66;
  float d = sdCone3(p, a, b, r1, r2);
  d = opSmoothUnion(d, sdCone3(p, b, c, r2, r3), 0.010);
  d = opSmoothUnion(d, sdCone3(p, c, e, r3, r4), 0.010);
  return d;
}

float map(vec3 p){
  float wave = sin(gT * 2.4);
  vec3 pivot = vec3(0.0, -0.30, 0.0);
  p = rotZ(wave * 0.30) * rotY(wave * 0.26) * (p - pivot) + pivot;

  /* PALM: 0.23 wide, 0.28 tall, thin in z. Slightly wider at the knuckles. */
  float d = sdRoundBox3(p - vec3(0.0, -0.105, 0.0), vec3(0.113, 0.132, 0.040), 0.048);

  /* thenar eminence — the pad at the base of the thumb */
  d = opSmoothUnion(d, sdSphere((p - vec3(-0.070, -0.150, 0.016)) / vec3(1.0, 1.35, 0.75), 0.058) * 0.75, 0.045);

  /* FOUR FINGERS on a knuckle ARC, middle highest. */
  for(int i = 0; i < 4; i++){
    float f = float(i);
    /* index .. pinky */
    float splay = (f - 1.4) * 0.115;
    float len   = f < 0.5  ? 0.266
                : f < 1.5  ? 0.297
                : f < 2.5  ? 0.269
                            : 0.207;
    float r0    = f < 0.5 ? 0.0265 : f < 1.5 ? 0.0275 : f < 2.5 ? 0.0255 : 0.0225;
    /* the arc: middle knuckle highest, pinky lowest */
    float ky    = 0.022 - 0.016 * (f - 1.3) * (f - 1.3);
    float kx    = (f - 1.5) * 0.0615;
    float curl  = 0.10 + 0.05 * sin(gT * 2.4 + f * 0.5);
    d = opSmoothUnion(d, digit(p, vec3(kx, ky, 0.0), splay, len, r0, curl), 0.016);
  }

  /* THUMB — low on the radial side, out and forward. */
  vec3 tb = vec3(-0.098, -0.170, 0.020);
  mat3 tm = rotZ(0.95) * rotY(-0.55);
  vec3 t1 = tb + tm * vec3(0.0, 0.098, 0.0);
  vec3 t2 = t1 + (tm * rotX(-0.30)) * vec3(0.0, 0.078, 0.0);
  float th = sdCone3(p, tb, t1, 0.032, 0.028);
  th = opSmoothUnion(th, sdCone3(p, t1, t2, 0.028, 0.021), 0.012);
  d = opSmoothUnion(d, th, 0.022);

  /* wrist, tapering into the forearm */
  d = opSmoothUnion(d, sdCone3(p, vec3(0.0, -0.225, 0.0), vec3(0.0, -0.44, 0.0), 0.060, 0.068), 0.030);
  return d;
}

void main(){
  gT = u_time;
  vec2 p  = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 ro = vec3(0.0, 0.03, 1.55);
  vec3 rd = rayDir(p, 1.72);

  float t = 0.0;
  bool hit = false;
  for(int i = 0; i < 80; i++){
    float d = map(ro + rd * t);
    if(d < 0.0015){ hit = true; break; }
    t += d;
    if(t > 3.2) break;
  }
  if(!hit){ gl_FragColor = vec4(u_ink, 0.0); return; }
  gl_FragColor = inkFrom(shadeDensity(ro + rd * t, rd));
}
`;

/**
 * 2 · AN OVAL OF INTERLOCKING PIECES THAT LETS GO.
 *
 * Not a lattice of dots — an OVAL ASSEMBLED FROM JIGSAW TILES. Each tile is a
 * rounded slab with a knob on two edges and a socket on the other two, so the
 * seams visibly interlock while it holds together. Then the pieces stop
 * holding: each releases on its own beat, falls, lands on the floor and stays
 * there. The point is that it comes APART into recognisable pieces, the way a
 * real interlocked thing does, rather than dissolving.
 *
 * THE OVAL SILHOUETTE IS A CLIP IN ASSEMBLY SPACE, not world space. The tile
 * is rigid, so the ellipse constraint is expressed relative to that tile's REST
 * position and travels with it — an outer tile keeps its curved outer edge all
 * the way to the ground, which is what makes the pile read as a broken oval
 * rather than as a heap of identical bricks.
 */
export const OVAL = /* glsl */ `${PRELUDE}
/* 5.6: the last piece is down by ~4.3, so this leaves about a second of the
   pile at rest — long enough to read the wreckage, short of a dead loop. */
const float CYCLE = 5.6;
const float TW = 0.088;    /* tile half-width  */
const float TH = 0.072;    /* tile half-height */
const float TT = 0.030;    /* tile half-depth  */
const float A  = 0.255;    /* oval semi-axis x */
const float B  = 0.180;    /* oval semi-axis y — short enough to clear the
                              floor AND the top of the frame */
float gT;

/* A jigsaw tile in its own space: knobs on +x/+y, sockets on -x/-y. */
float tile(vec3 q, float restX, float restY){
  float d = sdRoundBox3(q, vec3(TW, TH, TT), 0.014);
  d = min(d, sdSphere(q - vec3(TW + 0.004, 0.0, 0.0), 0.030));
  d = min(d, sdSphere(q - vec3(0.0, TH + 0.004, 0.0), 0.028));
  d = max(d, -sdSphere(q - vec3(-TW - 0.004, 0.0, 0.0), 0.033));
  d = max(d, -sdSphere(q - vec3(0.0, -TH - 0.004, 0.0), 0.031));
  /* clip to the oval, in ASSEMBLY space, so it rides along with the tile */
  float e = length(vec2((q.x + restX) / A, (q.y + restY) / B)) - 1.0;
  return max(d, e * 0.22);
}

float map(vec3 p){
  float lt = mod(gT, CYCLE);
  float d = p.y - FLOORY;

  for(int i = 0; i < 4; i++){
    for(int j = 0; j < 3; j++){
      float fi = float(i), fj = float(j);
      float rx = (fi - 1.5) * (TW * 2.0 + 0.006);
      float ry = (fj - 1.0) * (TH * 2.0 + 0.006) - 0.030;   /* sit above the floor */

      /* Skip tiles whose whole body is outside the oval. */
      if(length(vec2(rx / (A + TW), ry / (B + TH))) > 1.15) continue;

      /* Each piece lets go on its own beat — outer ones first, as an
         interlocked thing fails from its edges. */
      float edge    = length(vec2(rx / A, ry / B));
      float release = 2.5 + (1.15 - edge) * 1.05 + cellHash(vec2(fi, fj)) * 0.22;
      float tau     = max(lt - release, 0.0);

      /* ballistic, then STOP on the floor and stay there */
      float restTop = FLOORY + TT + 0.004;
      float vy = 0.10, g = 1.85;
      float tLand = (vy + sqrt(vy * vy + 2.0 * g * max(ry - restTop, 0.0))) / g;
      float ta = min(tau, tLand);

      float hx = (cellHash(vec2(fi, fj) + 7.0) - 0.5) * 0.34;
      float hz = (cellHash(vec2(fi, fj) + 13.0) - 0.5) * 0.22;

      vec3 T = vec3(rx + hx * ta, ry + vy * ta - 0.5 * g * ta * ta, hz * ta);
      if(tau > 0.0) T.y = max(T.y, restTop);

      /* tumble in the air, then settle flat on the ground */
      float spin = (cellHash(vec2(fi, fj) + 3.0) - 0.5) * 7.0;
      float set  = smoothstep(tLand, tLand + 0.30, tau);
      mat3 Rm = rotZ(spin * ta * (1.0 - set)) * rotX(mix(0.0, -1.5708, set));

      d = min(d, tile((p - T) * Rm, rx, ry));
    }
  }
  return d;
}

void main(){
  gT = u_time;
  vec2 p  = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 ro = vec3(0.0, 0.34, 1.50);
  vec3 ta = vec3(0.0, -0.075, 0.0);
  vec3 rd = aimed(lookAt(ro, ta), p, 1.95);

  float t = 0.0;
  bool hit = false;
  for(int i = 0; i < 72; i++){
    float d = map(ro + rd * t);
    if(d < 0.0018){ hit = true; break; }
    t += d;
    if(t > 3.4) break;
  }
  if(!hit){ gl_FragColor = vec4(u_ink, 0.0); return; }

  vec3 pos = ro + rd * t;
  float dens = shadeDensity(pos, rd);
  if(pos.y < FLOORY + 0.005) dens *= floorFalloff(pos);
  gl_FragColor = inkFrom(dens);
}
`;

/**
 * 3 · ROLLING GEAR THAT BREAKS, TUMBLES AND LANDS.
 *
 * It rolls ON THE FLOOR now, which is both more honest and easier to read: a
 * gear rolling in mid-air was always slightly odd. 4px is literal — one unit is
 * the canvas, so 4/140 = 0.02857 — and it rolls WITHOUT SLIPPING, rotation
 * tied to travel by `-x/R` rather than to the clock.
 *
 * Then it cracks and the halves become rigid bodies: an impulse out of the
 * break, spin about all three axes, gravity. THEY LAND AND STAY. The landing
 * time is solved from the ballistic, not eased into — after it, height is
 * pinned to the floor, the horizontal slide decays to nothing, and the spin
 * settles to a piece lying on its face. The camera is tilted down so a piece on
 * the ground is a foreshortened disc rather than an invisible edge.
 */
export const GEAR = /* glsl */ `${PRELUDE}
/* 5.6 for the same reason as the oval: landed by ~4.3, a beat on the floor,
   then the loop. Resting IS the payoff, so it is not cut to nothing. */
const float CYCLE = 5.6;
const float R     = 0.165;
const float PX    = 0.0071428;   /* 1/140 */
const float BREAK = 3.10;
const float GRAV  = 1.85;
float gT;

float gearProfile(vec2 q){
  float a = atan(q.y, q.x);
  float w = fract(a / (2.0 * PI) * 10.0 + 0.5) - 0.5;
  float r = R + 0.038 * smoothstep(0.29, 0.19, abs(w));
  float d = length(q) - r;
  return max(d, -(length(q) - 0.050));            /* bore */
}

float gearHalf(vec3 q, float sg, float crack){
  return max(opExtrude(q, gearProfile(q.xy), 0.044, 0.011), -sg * q.y - crack);
}

float map(vec3 p){
  float lt = mod(gT, CYCLE);
  float d  = p.y - FLOORY;                         /* the ground */

  float travel = 0.0;
  if(lt < 2.8){
    float ph = lt / 0.7, seg = floor(ph), f = smoothstep(0.0, 1.0, fract(ph));
    if(seg == 0.0) travel =  4.0 * PX * f;
    if(seg == 1.0) travel =  4.0 * PX * (1.0 - f);
    if(seg == 2.0) travel =  4.0 * PX * f;
    if(seg == 3.0) travel =  4.0 * PX * (1.0 - f);
  }
  float roll  = -travel / R;
  float tau   = max(lt - BREAK, 0.0);
  float crack = smoothstep(BREAK - 0.35, BREAK, lt) * 0.011;

  float hubY = FLOORY + R + 0.012;                 /* the gear sits ON the floor */

  for(int s = 0; s < 2; s++){
    float sg = s == 0 ? 1.0 : -1.0;

    /* Solve the landing instead of easing to it: the half is a projectile
       until its face reaches the ground, and pinned to the ground after. */
    float restY = FLOORY + 0.048;
    float vy    = 0.62;
    float tLand = (vy + sqrt(vy * vy + 2.0 * GRAV * max(hubY - restY, 0.0))) / GRAV;
    float ta    = min(tau, tLand);

    float vx    = sg * 0.30;
    float slide = 1.0 - exp(-3.0 * max(tau - tLand, 0.0));   /* friction */
    float x = travel + vx * ta + vx * 0.10 * slide;
    float y = hubY + vy * ta - 0.5 * GRAV * ta * ta;
    if(tau > 0.0) y = max(y, restY);
    float z = sg * 0.08 * ta;

    /* tumble in the air; settle onto its face once down */
    float set = smoothstep(tLand, tLand + 0.32, tau);
    mat3 Rm = rotZ(roll + sg * 4.6 * ta * (1.0 - set))
            * rotX(mix(sg * 3.0 * ta, -1.5708, set))
            * rotY(1.8 * ta * (1.0 - set));

    d = min(d, gearHalf((p - vec3(x, y, z)) * Rm, sg, crack));
  }
  return d;
}

void main(){
  gT = u_time;
  float lt = mod(u_time, CYCLE);
  vec2 p  = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 ro = vec3(0.0, 0.34, 1.50);
  vec3 ta = vec3(0.0, -0.075, 0.0);
  vec3 rd = aimed(lookAt(ro, ta), p, 1.95);

  float t = 0.0;
  bool hit = false;
  for(int i = 0; i < 76; i++){
    float d = map(ro + rd * t);
    if(d < 0.0016){ hit = true; break; }
    t += d;
    if(t > 3.4) break;
  }
  if(!hit){ gl_FragColor = vec4(u_ink, 0.0); return; }

  vec3 pos = ro + rd * t;
  float dens = shadeDensity(pos, rd);
  if(pos.y < FLOORY + 0.005) dens *= floorFalloff(pos);
  /* the pieces REST in shot; only the last beat fades, for the loop seam */
  dens *= 1.0 - smoothstep(CYCLE - 0.45, CYCLE - 0.08, lt);
  gl_FragColor = inkFrom(dens);
}
`;

export const SHADERS = { hand: HAND, oval: OVAL, gear: GEAR } as const;
export type ShaderName = keyof typeof SHADERS;
