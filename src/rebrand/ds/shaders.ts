/**
 * THE EMPTY / ERROR STATE SHADERS — raymarched 3D, dithered to 1 bit.
 *
 * Each asset is a signed-distance field in 3D, raymarched and lit, and the
 * resulting LUMINANCE is what the Bayer threshold eats. A dithered flat shape
 * is just a noisy shape; a dithered shaded shape is an engraving.
 *
 * ── The dither, and why it is quieter than the hero's ───────────────────────
 *
 * The construction is the retired hero's (39078d9 removed it; it lives in
 * 31d2b93, `hero/src/shaders/dither.frag.glsl`): an 8x8 ordered Bayer
 * threshold blended toward per-cell hash noise, density in, one bit out.
 *
 * TWO DELIBERATE DEPARTURES, because these are 140px objects and the hero was
 * a full-bleed landscape:
 *
 *   noise 0.30 -> 0.10   The hash blend exists to stop pure Bayer weaving a
 *                        visible grid. At landscape scale that grid is the
 *                        problem; at 140px the SPECKLE is, and it was eating
 *                        the seams between parts. More ordered, less mush.
 *   contrast             Luminance is gammaed and the density floor dropped to
 *                        0.05, so a lit face is nearly bare and a shadowed one
 *                        nearly solid. That separation is what makes a brick
 *                        read as a brick rather than as texture.
 *
 * ── No floor is modelled ────────────────────────────────────────────────────
 *
 * The floor is the bottom of the frame, not geometry. Falling pieces clamp to a
 * rest height and stop; there is no ground plane and no cast shadow. Dropping
 * both removed the 18-step shadow march from every shaded pixel, which is most
 * of what these cost.
 */

export const PRELUDE = /* glsl */ `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec3  u_ink;
uniform vec3  u_field;
uniform vec2  u_temporal;

const float PI = 3.14159265;

/* The rest line. Not geometry — just where falling things stop. */
const float FLOORY = -0.305;

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

float opSmoothUnion(float d1, float d2, float k){
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

/* ── march and shade ─────────────────────────────────────────────────────── */

float map(vec3 p);

vec3 calcNormal(vec3 p){
  vec2 e = vec2(1.0, -1.0) * 0.0012;
  return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) +
                   e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
}

float calcAO(vec3 p, vec3 n){
  float occ = 0.0, sca = 1.0;
  for(int i = 0; i < 5; i++){
    float h = 0.010 + 0.085 * float(i) / 4.0;
    occ += (h - map(p + n * h)) * sca;
    sca *= 0.80;
  }
  return clamp(1.0 - 2.8 * occ, 0.0, 1.0);
}

const vec3 LIG = vec3(0.485, 0.728, 0.485);

/* No cast shadow. AO does the contact darkening, which at 140px is all the
   grounding the eye asks for, and it costs 5 map() calls instead of 18. */
float shadeDensity(vec3 pos, vec3 rd){
  vec3  n   = calcNormal(pos);
  float dif = clamp(dot(n, LIG), 0.0, 1.0);
  float amb = 0.38 + 0.34 * n.y;
  float ao  = calcAO(pos, n);
  float rim = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.5);

  float lum = amb * ao * 0.38 + dif * ao * 0.86 + rim * 0.10;
  /* gamma for separation: push the mids apart so adjacent faces differ */
  lum = pow(clamp(lum, 0.0, 1.0), 0.80);
  return clamp(mix(0.05, 1.0, 1.0 - lum), 0.0, 1.0);
}

/* A look-at, because tilting the ray about the origin does not aim a camera —
   it swings the frame off the subject. */
mat3 lookAt(vec3 ro, vec3 ta){
  vec3 cw = normalize(ta - ro);
  vec3 cu = normalize(cross(cw, vec3(0.0, 1.0, 0.0)));
  vec3 cv = cross(cu, cw);
  return mat3(cu, cv, cw);
}
vec3 aimed(mat3 cam, vec2 p, float zoom){ return cam * normalize(vec3(p, zoom)); }
`;

/**
 * 1 · AN EMPTY OPEN BOX — nothing is wrong, there is just nothing in here yet.
 *
 * THE HAND IS GONE. Two passes at it produced a claw and then a stiff mannequin
 * hand; a convincing human hand is about the hardest subject there is for
 * primitive SDFs, and the uncanny result was working against the message. This
 * says "empty" more plainly than a wave ever did, and it is a subject that
 * primitives are actually good at.
 *
 * An open-topped box with its flaps folded out, turning slowly so the eye gets
 * inside it and finds nothing. The turn is a constant rate with a gentle bob —
 * no easing, no stutter, nothing to snag on, because this one has no event in
 * it and should read as calm rather than as waiting for something.
 */
export const BOX = /* glsl */ `${PRELUDE}
float gT;

float flap(vec3 p, float ang, float rise){
  /* hinged at the rim, folded outward */
  vec3 q = p - vec3(0.0, 0.148, 0.176);
  q = rotY(ang) * q;
  q = rotX(-1.05 - rise) * (q - vec3(0.0, 0.0, 0.0));
  return sdRoundBox3(q - vec3(0.0, 0.0, 0.062), vec3(0.163, 0.010, 0.066), 0.010);
}

float map(vec3 p){
  /* a slow constant turn plus a small bob — coherent, never accelerating */
  p = rotY(gT * 0.55) * p;
  p.y -= 0.012 * sin(gT * 1.1);
  p = rotX(0.10) * p;

  /* hollow box, open at the top */
  float outer = sdRoundBox3(p, vec3(0.185, 0.150, 0.185), 0.016);
  float inner = sdRoundBox3(p - vec3(0.0, 0.075, 0.0), vec3(0.158, 0.135, 0.158), 0.010);
  float d = max(outer, -inner);

  float rise = 0.05 * sin(gT * 1.1);
  for(int i = 0; i < 4; i++){
    d = min(d, flap(p, float(i) * 1.5708, rise));
  }
  return d;
}

void main(){
  gT = u_time;
  vec2 p  = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 ro = vec3(0.0, 0.42, 1.42);
  vec3 ta = vec3(0.0, -0.02, 0.0);
  vec3 rd = aimed(lookAt(ro, ta), p, 1.95);

  float t = 0.0;
  bool hit = false;
  for(int i = 0; i < 64; i++){
    float d = map(ro + rd * t);
    if(d < 0.0015){ hit = true; break; }
    t += d;
    if(t > 3.0) break;
  }
  if(!hit){ gl_FragColor = vec4(u_ink, 0.0); return; }
  gl_FragColor = inkFrom(shadeDensity(ro + rd * t, rd));
}
`;

/**
 * 2 · A BALL BUILT FROM BRICKS THAT LETS GO — the connection is on their end.
 *
 * A SPHEROID, not a slab. The previous pass was a flat disc of jigsaw tiles
 * lying in the picture plane, which is not what a ball made of bricks looks
 * like. This is a 3x3x3 lattice of studded bricks clipped to an ellipsoid, so
 * the silhouette is round, the surface is stepped the way a voxelised sphere
 * is, and every brick has a stud on top that catches the light.
 *
 * The clip is in ASSEMBLY space and travels with each rigid brick, so an outer
 * brick keeps its curved outer face all the way to the ground — the pile reads
 * as a broken ball rather than as a heap of identical cubes.
 *
 * A BOUNDING SPHERE GUARDS THE LOOP. Twenty-seven bricks at three primitives
 * each is 81 evaluations, and paying that on every one of ~64 march steps is
 * what would make this unshippable. Steps that are nowhere near the assembly
 * return the bound and skip the loop entirely; the bound grows as the pieces
 * scatter so it never clips them.
 */
export const BALL = /* glsl */ `${PRELUDE}
const float CYCLE = 5.6;
const float BR    = 0.072;   /* brick half-extent */
const float RAD   = 0.215;   /* ball radius */
float gT;

/* one brick: body plus a stud, in brick space */
float brick(vec3 q, vec3 rest){
  float d = sdRoundBox3(q, vec3(BR, BR * 0.72, BR), 0.012);
  d = min(d, sdCylY(q - vec3(0.0, BR * 0.72 + 0.014, 0.0), 0.016, 0.030));
  /* clip to the ball, in assembly space, so it rides with the brick */
  float e = length(q + rest) - RAD;
  return max(d, e * 0.55);
}

float map(vec3 p){
  float lt = mod(gT, CYCLE);

  /* Bounding sphere: grows as the pieces scatter, so it never clips them. */
  float spread = smoothstep(2.4, 4.4, lt);
  float bound  = length(p - vec3(0.0, mix(0.0, -0.10, spread), 0.0))
               - (RAD + 0.09 + spread * 0.42);
  if(bound > 0.05) return bound;

  float d = 1e9;
  for(int i = 0; i < 3; i++){
    for(int j = 0; j < 3; j++){
      for(int k = 0; k < 3; k++){
        float fi = float(i), fj = float(j), fk = float(k);
        vec3 rest = (vec3(fi, fj, fk) - 1.0) * (BR * 1.86);

        /* skip cells wholly outside the ball */
        if(length(rest) > RAD + BR * 0.7) continue;

        vec2  id  = vec2(fi * 3.0 + fj, fk);
        float rnd = cellHash(id);

        /* outer bricks let go first — a stuck-together thing fails at its
           surface. The release is smooth in radius, not stepped per ring. */
        float release = 2.35 + (1.0 - length(rest) / (RAD + BR)) * 1.15 + rnd * 0.20;
        float tau = max(lt - release, 0.0);

        float restY = FLOORY + BR * 0.72;
        float vy = 0.16, g = 1.75;
        float tLand = (vy + sqrt(vy * vy + 2.0 * g * max(rest.y - restY, 0.0))) / g;
        float ta = min(tau, tLand);

        vec3 dir = normalize(rest + vec3(0.001, 0.001, 0.001));
        vec3 T = rest
               + dir * vec3(0.42, 0.0, 0.42) * ta
               + vec3(0.0, vy * ta - 0.5 * g * ta * ta, 0.0);
        if(tau > 0.0) T.y = max(T.y, restY);

        float set = smoothstep(tLand, tLand + 0.28, tau);
        mat3 Rm = rotZ((rnd - 0.5) * 6.0 * ta * (1.0 - set))
                * rotX((cellHash(id + 5.0) - 0.5) * 5.0 * ta * (1.0 - set));

        d = min(d, brick((p - T) * Rm, rest));
      }
    }
  }
  return d;
}

void main(){
  gT = u_time;
  vec2 p  = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 ro = vec3(0.0, 0.30, 1.45);
  vec3 ta = vec3(0.0, -0.055, 0.0);
  vec3 rd = aimed(lookAt(ro, ta), p, 1.95);

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
 * 3 · ROLLING GEAR THAT BREAKS, TUMBLES AND LANDS — this one is on us.
 *
 * Rolls 4px right and 4px back, twice. 4px is literal: one unit is the canvas,
 * so 4/140 = 0.02857. It rolls WITHOUT SLIPPING — rotation tied to travel by
 * `-x/R`, not to the clock.
 *
 * Then it cracks and the halves become rigid bodies: an impulse out of the
 * break, spin about three axes, gravity. The landing is SOLVED from the
 * ballistic rather than eased into — after it, height is pinned, the slide
 * decays under friction and the spin settles onto the face. They come to rest
 * in shot and stay there; the floor is the bottom of the frame, not geometry.
 */
export const GEAR = /* glsl */ `${PRELUDE}
const float CYCLE = 5.6;
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
    float vy    = 0.60;
    float tLand = (vy + sqrt(vy * vy + 2.0 * GRAV * max(hubY - restY, 0.0))) / GRAV;
    float ta    = min(tau, tLand);

    float vx    = sg * 0.30;
    float slide = 1.0 - exp(-3.0 * max(tau - tLand, 0.0));
    float x = travel + vx * ta + vx * 0.10 * slide;
    float y = hubY + vy * ta - 0.5 * GRAV * ta * ta;
    if(tau > 0.0) y = max(y, restY);
    float z = sg * 0.08 * ta;

    float set = smoothstep(tLand, tLand + 0.30, tau);
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
  vec3 ro = vec3(0.0, 0.30, 1.45);
  vec3 ta = vec3(0.0, -0.055, 0.0);
  vec3 rd = aimed(lookAt(ro, ta), p, 1.95);

  float t = 0.0;
  bool hit = false;
  for(int i = 0; i < 72; i++){
    float d = map(ro + rd * t);
    if(d < 0.0016){ hit = true; break; }
    t += d;
    if(t > 3.2) break;
  }
  if(!hit){ gl_FragColor = vec4(u_ink, 0.0); return; }

  float dens = shadeDensity(ro + rd * t, rd);
  dens *= 1.0 - smoothstep(CYCLE - 0.40, CYCLE - 0.06, lt);
  gl_FragColor = inkFrom(dens);
}
`;

export const SHADERS = { box: BOX, ball: BALL, gear: GEAR } as const;
export type ShaderName = keyof typeof SHADERS;
