import { PRELUDE } from './prelude';
import { SpotIllustration, type SpotProps } from './SpotIllustration';

/**
 * 3 · A GEAR THAT DROPS, CRACKS ALONG A FAULT, AND SPLITS.
 *
 * The sequence is causal, and that is the whole point of it:
 *
 *   ROLL    4px right and 4px back, twice. 4px is literal (see PX) and it
 *           rolls WITHOUT SLIPPING — rotation tied to travel by -x/R, not to
 *           the clock.
 *   DROP    it falls, abruptly, and bounces back to exactly where it was. The
 *           impact is what does the damage; nothing else in the sequence has
 *           any reason to break a gear.
 *   CRACK   a fault propagates from TOP CENTRE down to off-centre bottom-left,
 *           in four zigzag runs like a lightning strike. It opens as a visible
 *           hairline first — the metal fails before it comes apart.
 *   SPLIT   the two pieces separate ALONG THAT FAULT, tumble, bounce once and
 *           settle. Not along a straight diameter: the break follows the crack
 *           the eye just watched being drawn, which is the only reason the
 *           crack is worth animating at all.
 *
 * HOW THE PARTIAL CRACK WORKS. Both pieces are the same body clipped to one
 * side of the fault, but the clip is GATED BY HEIGHT: above the crack's current
 * reach the side clip applies, below it the clip is switched off and both
 * pieces contain the still-joined metal. `min(side, (q.y - reach) * 8.0)` is
 * that gate — very negative below the reach, so nothing is cut. The pieces are
 * also shrunk by a hair on the fault, which is what makes the crack visible as
 * a dark line before anything moves.
 */
export const GEAR = /* glsl */ `${PRELUDE}
const float CYCLE = 6.4;
const float R     = 0.165;

/**
 * ONE SCREEN PIXEL, MEASURED — not 1/height.
 *
 * "One unit is the canvas height" only holds for an untilted camera with the
 * subject exactly at the target depth. This camera is tilted and the gear sits
 * in front of its target, so the true scale is well off that assumption: with
 * PX = 1/180 the 4px roll rendered as 5.54px. Calibrated by rendering the roll
 * and measuring its centroid travel.
 *
 * RE-MEASURE THIS IF THE CAMERA MOVES. It is a property of the projection, not
 * of the canvas.
 */
const float PX = 0.0042800;

const float DROP0 = 2.90, DROP1 = 3.70;   /* fall and bounce back      */
const float CRK0  = 3.80, CRK1  = 4.70;   /* the fault propagates      */
const float SPLIT = 4.70;                 /* and the pieces let go     */
const float GRAV  = 1.85;
float gT;

float gearProfile(vec2 q){
  float a = atan(q.y, q.x);
  float w = fract(a / (2.0 * PI) * 10.0 + 0.5) - 0.5;
  float r = R + 0.038 * smoothstep(0.29, 0.19, abs(w));
  return max(length(q) - r, -(length(q) - 0.050));   /* bore */
}

/**
 * THE FAULT: x offset of the crack at height y, top centre to bottom-left.
 *
 * Four straight runs with sharp reversals — a lightning bolt is a sequence of
 * hard direction changes, and a smooth curve here reads as a cut rather than a
 * fracture. The net drift is leftward so it lands off-centre at the bottom.
 */
float faultX(float y){
  float u = clamp((0.235 - y) / 0.470, 0.0, 1.0);
  if(u < 0.25) return mix( 0.000,  0.042, u / 0.25);
  if(u < 0.50) return mix( 0.042, -0.030, (u - 0.25) / 0.25);
  if(u < 0.75) return mix(-0.030,  0.024, (u - 0.50) / 0.25);
  return              mix( 0.024, -0.088, (u - 0.75) / 0.25);
}

float gearPiece(vec3 q, float sg, float reach, float gap){
  float body = opExtrude(q, gearProfile(q.xy), 0.044, 0.011);
  float side = sg * (q.x - faultX(q.y)) + gap;
  /* Gate the clip by height: above the reach it bites, below it is switched
     off and both pieces keep the metal that has not failed yet. */
  return max(body, min(side, (q.y - reach) * 8.0));
}

float map(vec3 p){
  float lt = pingPong(gT, CYCLE);

  /* ── roll ─────────────────────────────────────────────────────────────── */
  float travel = 0.0;
  if(lt < 2.8){
    float ph = lt / 0.7, seg = floor(ph), f = smoothstep(0.0, 1.0, fract(ph));
    if(seg == 0.0) travel =  4.0 * PX * f;
    if(seg == 1.0) travel =  4.0 * PX * (1.0 - f);
    if(seg == 2.0) travel =  4.0 * PX * f;
    if(seg == 3.0) travel =  4.0 * PX * (1.0 - f);
  }
  float roll = -travel / R;

  /* ── the drop, and the bounce back to exactly where it started ────────── */
  float dip = 0.0;
  if(lt > DROP0 && lt < DROP1){
    float k = (lt - DROP0) / (DROP1 - DROP0);
    /* pow < 1 sharpens the descent and softens the return, so it falls hard
       and comes back up rather than rocking symmetrically */
    dip = -0.115 * pow(sin(PI * k), 0.55);
  }

  /* ── the fault, propagating top to bottom ─────────────────────────────── */
  float cp    = smoothstep(CRK0, CRK1, lt);
  float reach = mix(0.245, -0.255, cp);
  /* Thick enough to read at 180px once the dither has had its say. */
  float gap   = 0.0055 * smoothstep(CRK0, CRK0 + 0.25, lt);

  float tau  = max(lt - SPLIT, 0.0);
  float hubY = FLOORY + R + 0.010;

  float d = 1e9;
  for(int s = 0; s < 2; s++){
    float sg = s == 0 ? 1.0 : -1.0;   /* +1 keeps the LEFT of the fault */

    float restY = FLOORY + 0.046;
    float landed;
    float y = fallWithBounce(tau, hubY, 0.42, GRAV, restY, landed);
    float ta = min(tau, landed);

    /* Pieces part along the fault, so left goes left.
       THEY USED TO OVERLAP ONCE LANDED, and a union of two intersecting solids
       grows edges where they cross — which read as four small pieces rather
       than two. Once each half settles FLAT its footprint is the full diameter,
       not the half-disc it was in the air, so the separation has to clear ~0.33
       and 0.125 * flight never did. Measured: they resolved as one blob.
       Also pushed apart in z, so if they do graze, one is clearly in front of
       the other instead of merging into it. */
    float vx    = -sg * 0.275;
    float slide = 1.0 - exp(-3.2 * max(tau - landed, 0.0));
    float x = travel + vx * ta + vx * 0.06 * slide;
    float z = -sg * 0.090 * ta;

    float set = smoothstep(landed, landed + 0.30, tau);
    float az  = roll + (-sg) * 4.0 * ta;
    float ax  = (-sg) * 2.4 * ta;
    ax = mix(ax, (rnd1((ax - 1.5708) / PI)) * PI + 1.5708, set);

    /* Tilt LAST in the product: composing the other way lays the disc flat and
       then spins it about the world z, which stands it back on its edge. */
    mat3 Rm = rotX(ax) * rotZ(az);
    vec3 c  = vec3(x, y + (tau > 0.0 ? 0.0 : dip), z);
    d = min(d, gearPiece((p - c) * Rm, sg, reach, gap));
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
  for(int i = 0; i < 76; i++){
    float d = map(ro + rd * t);
    if(d < 0.0016){ hit = true; break; }
    t += d;
    if(t > 3.2) break;
  }
  if(!hit){ gl_FragColor = vec4(u_ink, 0.0); return; }

  /* No fade at the seam — the loop reverses, so it is a clean retrace. */
  gl_FragColor = inkFrom(shadeDensity(ro + rd * t, rd));
}
`;

/**
 * A gear that drops, cracks along a fault and splits. Something on our end broke.
 *
 * NATURAL BOX 270x180. The width is not decoration: `p` is normalised by
 * `u_res.y`, so a wider canvas widens the visible x range without touching the
 * subject's scale. Assets whose pieces travel sideways need the room, and
 * measuring the frame edges is how these numbers were set.
 */
export function BrokenGear(props: SpotProps) {
  return <SpotIllustration source={GEAR} width={270} still={1.4} {...props} />;
}

export const GEAR_SOURCE = GEAR;
