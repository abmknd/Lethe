import { PRELUDE } from './prelude';
import { SpotIllustration, type SpotProps } from './SpotIllustration';

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
  /* NO LOOP HERE. The lid opens once, on the global clock, and stays open —
     it is not a cycle, so there is no seam to smooth. The turn carries on
     underneath it forever. */
  float open = smoothstep(0.85, 2.15, gT);

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
 * An open box turning slowly. Nothing is wrong — there is simply nothing in it.
 *
 * NATURAL BOX 200x180. The width is not decoration: `p` is normalised by
 * `u_res.y`, so a wider canvas widens the visible x range without touching the
 * subject's scale. Assets whose pieces travel sideways need the room, and
 * measuring the frame edges is how these numbers were set.
 */
export function EmptyBox(props: SpotProps) {
  return <SpotIllustration source={BOX} width={200} still={1.1} {...props} />;
}

export const BOX_SOURCE = BOX;
