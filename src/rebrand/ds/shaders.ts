/**
 * THE EMPTY / ERROR STATE SHADERS — raymarched 3D, dithered to 1 bit.
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
 * because these are 140px objects and the hero was a full-bleed landscape:
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
uniform vec3  u_ink;
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

float shadeDensity(vec3 pos, vec3 rd){
  vec3  n   = calcNormal(pos);
  float dif = clamp(dot(n, LIG), 0.0, 1.0);
  float amb = 0.38 + 0.34 * n.y;
  float ao  = calcAO(pos, n);
  float rim = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.5);

  float lum = amb * ao * 0.38 + dif * ao * 0.86 + rim * 0.10;
  lum = pow(clamp(lum, 0.0, 1.0), 0.80);
  return clamp(mix(0.05, 1.0, 1.0 - lum), 0.0, 1.0);
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

/**
 * 1 · A BOX THAT OPENS AND STAYS OPEN.
 *
 * Closed, then the four flaps swing out, then it stays open and turning. The
 * lid is the event: a box already open says "empty", but a box OPENING says
 * "look, there is nothing in here", which is the actual message.
 *
 * Closed is `open = 0`, where each flap lies flat across the opening from its
 * hinge on the rim. Open is a rotation of -2.6 rad about the hinge, which
 * carries the flap down and OUTWARD over the wall — the way a real carton
 * folds. Rotating the other way lifts them into a crown, which is what the
 * previous version did and why the lid looked wrong.
 *
 * The loop seam is a short fade rather than a snap shut, because a lid that
 * slams closed every six seconds reads as a second event and there is only one.
 */
export const BOX = /* glsl */ `${PRELUDE}
const float CYCLE = 6.0;
float gT;

/**
 * THE SWING DIRECTION WAS BACKWARDS. Closed, the leaf points INWARD (-z) across
 * the opening. Taking it to -2.6 rad swept it DOWN through the inside of the
 * box and left it pointing up and outward, which is why the lid looked like it
 * opened from the outside up.
 *
 * A carton flap goes UP AND OVER. In this frame the leaf direction is
 * (0, sin a, -cos a): a=0 inward, a=PI/2 straight up, a=PI outward level, and
 * a=3.5 outward and drooping. So the open angle is POSITIVE and just past PI —
 * it sweeps up through vertical and folds down outside the wall.
 */
float flap(vec3 p, float yaw, float open){
  vec3 q = rotY(yaw) * p - vec3(0.0, 0.150, 0.183);
  q = rotX(mix(0.0, 3.50, open)) * q;
  return sdRoundBox3(q - vec3(0.0, 0.0, -0.082), vec3(0.160, 0.009, 0.084), 0.008);
}

float map(vec3 p){
  float lt = mod(gT, CYCLE);
  /* closed, then one smooth opening, then open for the rest */
  float open = smoothstep(0.85, 2.15, lt);

  p = rotY(gT * 0.50) * p;
  p.y -= 0.010 * sin(gT * 1.05);
  p = rotX(0.10) * p;

  float outer = sdRoundBox3(p, vec3(0.185, 0.150, 0.185), 0.014);
  float inner = sdRoundBox3(p - vec3(0.0, 0.075, 0.0), vec3(0.160, 0.135, 0.160), 0.008);
  float d = max(outer, -inner);

  for(int i = 0; i < 4; i++){
    d = min(d, flap(p, float(i) * 1.5708, open));
  }
  return d;
}

void main(){
  gT = u_time;
  float lt = mod(u_time, CYCLE);
  vec2 p  = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 ro = vec3(0.0, 0.44, 1.40);
  vec3 ta = vec3(0.0, -0.02, 0.0);
  vec3 rd = aimed(lookAt(ro, ta), p, 1.90);

  float t = 0.0;
  bool hit = false;
  for(int i = 0; i < 64; i++){
    float d = map(ro + rd * t);
    if(d < 0.0015){ hit = true; break; }
    t += d;
    if(t > 3.0) break;
  }
  if(!hit){ gl_FragColor = vec4(u_ink, 0.0); return; }

  /* No fade at the seam — the loop is a clean replay, not a dip to nothing. */
  gl_FragColor = inkFrom(shadeDensity(ro + rd * t, rd));
}
`;

/**
 * 2 · A BALL BUILT FROM BRICKS THAT LETS GO.
 *
 * A 3x3x3 lattice of studded bricks clipped to a sphere.
 *
 * THE BRICKS USED TO OVERLAP, which is why the assembled ball read as one lump
 * rather than as parts. Spacing was `BR * 1.86` against a brick of full width
 * `BR * 2.0` — every brick interpenetrated its neighbour by 7%, so there were
 * no seams to see. Spacing is now the brick's own size PLUS a gap, per axis,
 * and the AO radii were tightened so those seams actually darken. A stud on
 * each brick gives the surface something to catch the light on.
 *
 * A bounding sphere guards the loop: 27 bricks at three primitives is 81
 * evaluations, and paying it on every march step is what would make this
 * unshippable. The bound grows as the pieces scatter so it never clips them.
 */
export const BALL = /* glsl */ `${PRELUDE}
const float CYCLE = 5.8;
const float BX    = 0.060;   /* brick half width / depth */
const float BY    = 0.040;   /* brick half height        */
const float GAP   = 0.009;
const float RAD   = 0.200;
float gT;

float brick(vec3 q, vec3 rest){
  float d = sdRoundBox3(q, vec3(BX, BY, BX), 0.010);
  d = min(d, sdCylY(q - vec3(0.0, BY + 0.013, 0.0), 0.014, 0.026));
  float e = length(q + rest) - RAD;      /* clip in ASSEMBLY space */
  return max(d, e * 0.55);
}

float map(vec3 p){
  float lt = mod(gT, CYCLE);

  float spread = smoothstep(2.3, 4.3, lt);
  float bound  = length(p - vec3(0.0, mix(0.0, -0.09, spread), 0.0))
               - (RAD + 0.08 + spread * 0.52);
  if(bound > 0.05) return bound;

  float d = 1e9;
  for(int i = 0; i < 3; i++){
    for(int j = 0; j < 3; j++){
      for(int k = 0; k < 3; k++){
        float fi = float(i), fj = float(j), fk = float(k);
        /* size PLUS a gap, per axis — no interpenetration, real seams */
        vec3 rest = (vec3(fi, fj, fk) - 1.0)
                  * vec3(BX * 2.0 + GAP, BY * 2.0 + GAP, BX * 2.0 + GAP);
        if(length(rest) > RAD + BX * 0.8) continue;

        vec2  id  = vec2(fi * 3.0 + fj, fk);
        float rh  = cellHash(id);

        float release = 2.25 + (1.0 - length(rest) / (RAD + BX)) * 1.10 + rh * 0.18;
        float tau = max(lt - release, 0.0);

        /* THE WHOLE BALL TURNS BEFORE IT LETS GO. The assembly angle is frozen
           at each brick's own release, so a brick that has come loose keeps the
           orientation and position it had at the moment it left and stops
           tracking the assembly. Rotating 'rest' rather than the sample point
           is what keeps every piece rigid through the handover. */
        float aSpin = 0.62 * min(lt, release);
        mat3  A     = rotY(aSpin);
        vec3  rw    = A * rest;

        float restY = FLOORY + BY;
        float landed;
        float y = fallWithBounce(tau, rw.y, 0.14, 1.75, restY, landed);

        /* Spread mostly sideways. Depth scatter is a third of it: a brick
           thrown at the camera grows and leaves the frame through the bottom
           edge, which reads as a clipping bug rather than as a throw. */
        vec3 dir = normalize(rw + vec3(0.001, 0.002, 0.001));
        float sp = min(tau, landed);
        vec3 T = vec3(rw.x + dir.x * 0.40 * sp, y, rw.z + dir.z * 0.15 * sp);

        /* Spin FORWARD to a flat pose. Never rewind: lerping a spun angle back
           toward a fixed target is what made pieces appear to flip over. */
        float wz = (rh - 0.5) * 5.5;
        float wx = (cellHash(id + 5.0) - 0.5) * 4.5;
        float ta = min(tau, landed);
        float set = smoothstep(landed, landed + 0.26, tau);
        float ax = wx * ta;
        ax = mix(ax, (rnd1((ax - 1.5708) / PI)) * PI + 1.5708, set);  /* nearest flat */

        mat3 Rm = rotX(ax) * rotZ(wz * ta) * A;   /* tilt last, in world space */
        d = min(d, brick((p - T) * Rm, rest));
      }
    }
  }
  return d;
}

void main(){
  gT = u_time;
  vec2 p  = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 ro = vec3(0.0, 0.30, 1.42);
  vec3 ta = vec3(0.0, -0.055, 0.0);
  vec3 rd = aimed(lookAt(ro, ta), p, 1.90);

  float t = 0.0;
  bool hit = false;
  for(int i = 0; i < 72; i++){
    float d = map(ro + rd * t);
    if(d < 0.0018){ hit = true; break; }
    t += d;
    if(t > 3.2) break;
  }
  if(!hit){ gl_FragColor = vec4(u_ink, 0.0); return; }
  gl_FragColor = inkFrom(shadeDensity(ro + rd * t, rd));
}
`;

/**
 * 3 · ROLLING GEAR THAT BREAKS, BOUNCES ONCE AND SETTLES.
 *
 * Rolls 4px right and 4px back, twice — 4px literal, since one unit is the
 * canvas height, so 4/140 = 0.02857 — and WITHOUT SLIPPING, rotation tied to
 * travel by `-x/R` rather than to the clock. Then it cracks and the halves
 * become rigid bodies with an impulse, spin and gravity.
 *
 * THE HALVES USED TO FLIP OVER AFTER LANDING, and that was two bugs in the
 * settle, both of them the same mistake — animating an angle BACKWARDS:
 *
 *   the Z spin was `w * ta * (1 - set)`, so as the piece settled the whole
 *   accumulated spin UNWOUND to zero. It visibly rotated back the way it came.
 *
 *   the X tilt lerped to a fixed -PI/2 from wherever it happened to be, so
 *   depending on the spin it took the long way round and rolled over.
 *
 * Now the spin FREEZES at its landing value and the tilt eases to the NEAREST
 * flat pose — `round((a - PI/2)/PI) * PI + PI/2` — which is at most a quarter
 * turn and always forward. And it BOUNCES ONCE before settling, off the shared
 * ballistic, with the bounce proportional to the impact speed.
 */
export const GEAR = /* glsl */ `${PRELUDE}
const float CYCLE = 5.8;
const float R     = 0.165;
const float PX    = 0.0071428;   /* 1/140 */
const float BREAK = 3.05;
const float GRAV  = 1.85;
float gT;

float gearProfile(vec2 q){
  float a = atan(q.y, q.x);
  float w = fract(a / (2.0 * PI) * 10.0 + 0.5) - 0.5;
  float r = R + 0.038 * smoothstep(0.29, 0.19, abs(w));
  return max(length(q) - r, -(length(q) - 0.050));   /* bore */
}

float gearHalf(vec3 q, float sg, float crack){
  return max(opExtrude(q, gearProfile(q.xy), 0.044, 0.011), -sg * q.y - crack);
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
  float roll  = -travel / R;
  float tau   = max(lt - BREAK, 0.0);
  float crack = smoothstep(BREAK - 0.35, BREAK, lt) * 0.011;
  float hubY  = FLOORY + R + 0.010;

  float d = 1e9;
  for(int s = 0; s < 2; s++){
    float sg = s == 0 ? 1.0 : -1.0;

    float restY = FLOORY + 0.046;
    float landed;
    float y = fallWithBounce(tau, hubY, 0.55, GRAV, restY, landed);
    float ta = min(tau, landed);

    /* horizontal carries through the bounce, then friction takes it */
    float vx    = sg * 0.30;
    float slide = 1.0 - exp(-3.2 * max(tau - landed, 0.0));
    float x = travel + vx * ta + vx * 0.09 * slide;
    float z = sg * 0.045 * ta;

    /* spin freezes at landing; tilt eases FORWARD to the nearest flat pose */
    float set = smoothstep(landed, landed + 0.28, tau);
    float az  = roll + sg * 4.4 * ta;
    float ax  = sg * 2.6 * ta;
    ax = mix(ax, (rnd1((ax - 1.5708) / PI)) * PI + 1.5708, set);

    /* ORDER MATTERS AND IT WAS WRONG. With rotZ * rotX the settle laid the
       disc flat and then rotZ — about the WORLD z — stood it straight back up
       on its edge. The spin belongs in BODY space and the lay-flat in world
       space, so the tilt has to come first in the product. */
    mat3 Rm = rotX(ax) * rotZ(az);
    d = min(d, gearHalf((p - vec3(x, y, z)) * Rm, sg, crack));
  }
  return d;
}

void main(){
  gT = u_time;
  float lt = mod(u_time, CYCLE);
  vec2 p  = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 ro = vec3(0.0, 0.30, 1.42);
  vec3 ta = vec3(0.0, -0.055, 0.0);
  vec3 rd = aimed(lookAt(ro, ta), p, 1.90);

  float t = 0.0;
  bool hit = false;
  for(int i = 0; i < 72; i++){
    float d = map(ro + rd * t);
    if(d < 0.0016){ hit = true; break; }
    t += d;
    if(t > 3.2) break;
  }
  if(!hit){ gl_FragColor = vec4(u_ink, 0.0); return; }

  /* No fade at the seam — the loop is a clean replay, not a dip to nothing. */
  gl_FragColor = inkFrom(shadeDensity(ro + rd * t, rd));
}
`;

export const SHADERS = { box: BOX, ball: BALL, gear: GEAR } as const;
export type ShaderName = keyof typeof SHADERS;
