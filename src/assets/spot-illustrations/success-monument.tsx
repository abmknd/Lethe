import { PRELUDE } from './prelude';
import { SpotIllustration, type SpotProps } from './SpotIllustration';

/**
 * 4 · A MONUMENT THAT BUILDS ITSELF, THEN TAKES A BOW.
 *
 * Three distinct primitives stacked in sequence — a wide cylindrical base, a
 * smaller hexagonal mid-section, a sphere on top. They are deliberately three
 * DIFFERENT solids rather than three of the same: a monument reads as built
 * when its parts are unlike each other, and as a stack of coasters when they
 * are not. The silhouette narrows as it rises, which is what makes the shape
 * read as deliberate rather than as debris that happened to land tidily.
 *
 *   BUILD   each piece falls under gravity and THUDS into place on the one
 *           below, in order, using the same `fallWithBounce` as the things
 *           that break. A success and a failure obeying the same arithmetic is
 *           the point: it is the sequence that differs, not the physics.
 *   DANCE   once assembled it hops up-left-down, then up-right-down. It rocks
 *           about the BASE, not its centre — a monument tips on its footing,
 *           and rotating about the middle reads as a floating object being
 *           waggled.
 *   LIFT    reversing the clock takes the whole thing apart perfectly: the
 *           dance runs backwards and every piece rises along the exact arc it
 *           fell on. There is no reassembly animation to write, and none to
 *           drift out of sync with the build.
 *
 * The grazing band is forced to full ink by the prelude, so the stepped
 * silhouette stays crisp against a white card instead of dissolving where the
 * light hits the shoulders of the base and the crown of the sphere.
 */
export const MONUMENT = /* glsl */ `${PRELUDE}
const float CYCLE = 4.6;
const float GRAV  = 2.10;

/* rest CENTRES, stacked from the floor up */
const float BASE_H = 0.048, BASE_R = 0.152;
const float MID_H  = 0.058, MID_R  = 0.104;
const float TOP_R  = 0.070;

const float BASE_Y = FLOORY + BASE_H;                       /* -0.187 */
const float MID_Y  = FLOORY + BASE_H * 2.0 + MID_H;         /* -0.081 */
const float TOP_Y  = FLOORY + BASE_H * 2.0 + MID_H * 2.0 + TOP_R;

/* How far above its rest each piece starts. MEASURED, not chosen: at 0.30 the
   top piece began at y=0.347 and its crown clipped the top of the frame for
   the whole first beat. A piece entering from off-screen reads as a clipping
   bug here, not as an entrance. */
const float DROP = 0.150;
const float REL0 = 0.10, REL1 = 0.95, REL2 = 1.80;
const float BUILT = 2.62;     /* the last piece has settled by here */
const float BEAT  = 0.55;
float gT;

/* Hexagonal prism, axis along Y. iq's construction, with xzy swizzled in. */
float sdHexPrismY(vec3 p, float r, float h){
  const vec3 k = vec3(-0.8660254, 0.5, 0.57735);
  vec3 q = abs(p.xzy);
  q.xy -= 2.0 * min(dot(k.xy, q.xy), 0.0) * k.xy;
  vec2 d = vec2(length(q.xy - vec2(clamp(q.x, -k.z * r, k.z * r), r)) * sign(q.y - r),
                q.z - h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float dropY(float rest, float release, float lt){
  float landed;
  /* v0 = 0: these are DROPPED, not thrown. */
  return fallWithBounce(max(lt - release, 0.0), rest + DROP, 0.0, GRAV, rest, landed);
}

float map(vec3 p){
  float lt = pingPong(gT, CYCLE);

  /* ── the bow, once it is built ────────────────────────────────────────────
     Up-left-down, then up-right-down. Rocking about the BASE rather than the
     centre: a monument tips on its footing, and pivoting at the middle reads
     as a floating object being waggled. The envelope is sin(PI*k), so each
     beat starts and ends at exactly zero — the stack is upright at every beat
     boundary, which is what keeps two hops reading as one gesture. */
  float dt = lt - BUILT;
  float lean = 0.0, hop = 0.0;
  if(dt > 0.0 && dt < BEAT * 2.0){
    float beat = dt / BEAT;
    float env  = sin(PI * fract(beat));
    lean = (floor(beat) < 0.5 ? -1.0 : 1.0) * env * 0.155;
    hop  = env * 0.032;
  }
  vec3 pivot = vec3(0.0, FLOORY, 0.0);
  vec3 q = p - vec3(0.0, hop, 0.0);
  q = rotZ(-lean) * (q - pivot) + pivot;

  /* ── the build ───────────────────────────────────────────────────────────
     Each piece falls and thuds onto the one below, in order. Same ballistics
     as the things that break: a success and a failure obey the same
     arithmetic, and only the sequence differs. */
  float d = sdCylY(q - vec3(0.0, dropY(BASE_Y, REL0, lt), 0.0), BASE_H, BASE_R);
  d = min(d, sdHexPrismY(q - vec3(0.0, dropY(MID_Y, REL1, lt), 0.0), MID_R, MID_H));
  d = min(d, sdSphere(q - vec3(0.0, dropY(TOP_Y, REL2, lt), 0.0), TOP_R));
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
    if(d < 0.0016){ hit = true; break; }
    t += d;
    if(t > 3.2) break;
  }
  if(!hit){ gl_FragColor = vec4(u_ink, 0.0); return; }
  gl_FragColor = inkFrom(shadeDensity(ro + rd * t, rd));
}
`;

export function SuccessMonument(props: SpotProps) {
  return <SpotIllustration source={MONUMENT} width={220} still={3.0} {...props} />;
}

export const MONUMENT_SOURCE = MONUMENT;
