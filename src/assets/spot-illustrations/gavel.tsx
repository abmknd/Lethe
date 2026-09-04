import { PRELUDE } from './prelude';
import { SpotIllustration, type SpotProps } from './SpotIllustration';

/**
 * 5 · A GAVEL THAT COMES DOWN — a request accepted, a decision made.
 *
 * A stationary sounding block and a gavel that falls onto it, thuds, bounces
 * once and settles. Reversing the clock lifts it back for the next strike, so
 * the loop is down-hold-up-hold and there is no separate raise to animate.
 *
 *   BLOCK   `sdRoundBox3` at the floor rest height. It never moves — it is the
 *           thing being struck, and a sounding block that bobs sympathetically
 *           turns a decision into a collision between two loose objects.
 *   GAVEL   a horizontal cylinder head with a cylindrical handle raked out of
 *           it. `sdCylY` with the sample point swizzled or rotated, since the
 *           prelude's cylinder is Y-axis and adding a near-duplicate primitive
 *           per orientation is how a shared prelude rots.
 *   STRIKE  `fallWithBounce` at restitution 0.34 — the same dead thud as
 *           everything else that lands in this set.
 *
 * THE PARTS DO NOT INTERSECT. At rest the head sits 0.002 above the block's
 * top face, touching along a line rather than sinking into it. A union of two
 * interpenetrating solids grows edges where they cross, and those edges read
 * as extra pieces — the mistake that made the broken gear look like four
 * fragments (illustration.md §9).
 *
 * ROTATION ORDER is `rotX(tilt) * rotZ(swing)`, per illustration.md §7. The
 * brief asked for `rotZ(spin) * rotX(tilt)` while describing "tilt in world
 * space, spin in body space" — but in a body-to-world product the RIGHT factor
 * applies first, in body space, so that composition delivers the opposite of
 * its own description. It is the same inversion that stood the gear's halves
 * on their edges. The described intent is what is implemented here.
 *
 * Rotation FREEZES on landing: `ta = min(tau, landed)` drives every angle, so
 * after impact they hold rather than unwinding. Nothing eases back toward a
 * target it has already passed.
 */
export const GAVEL = /* glsl */ `${PRELUDE}
const float CYCLE = 2.00;
const float GRAV  = 2.10;

/* sounding block */
const float BLK_W = 0.168, BLK_H = 0.034, BLK_D = 0.094;
const float BLK_Y = FLOORY + BLK_H;
const float BLK_TOP = FLOORY + BLK_H * 2.0;

/* gavel */
const float HEAD_R = 0.060, HEAD_L = 0.088;
const float BAR_R  = 0.025, BAR_L  = 0.124;   /* half-length of the handle */
const float RAKE   = 0.58;                    /* handle angle from vertical  */

/* Head rests ON the block with a hair of clearance, never inside it. */
const float REST_Y = BLK_TOP + HEAD_R + 0.002;
/* MEASURED, not chosen. At 0.185 the raised handle's tip crossed the top edge
   for the first beat — 11 border pixels. The gavel is scaled for presence in
   its box, so the headroom it has to be lifted through is small. */
const float LIFT   = 0.132;
float gT;

/* The gavel in its own space: head at the origin, handle raked up and right. */
float gavel(vec3 q){
  /* Head: the prelude's cylinder is Y-axis, so swizzle to lay it along X. */
  float d = sdCylY(q.yxz, HEAD_L, HEAD_R);

  /* Handle: same trick, rotated into the rake and pushed out along itself. */
  vec3 h = rotZ(RAKE) * q;
  h.y -= BAR_L + HEAD_R * 0.55;
  d = min(d, sdCylY(h, BAR_L, BAR_R));
  return d;
}

float map(vec3 p){
  float lt = pingPong(gT, CYCLE);

  /* ── the strike ─────────────────────────────────────────────────────────
     Dropped, not thrown: v0 = 0. One bounce, then still. */
  float landed;
  float y  = fallWithBounce(lt, REST_Y + LIFT, 0.0, GRAV, REST_Y, landed);
  float ta = min(lt, landed);            /* every angle freezes at impact */
  float k  = clamp(ta / landed, 0.0, 1.0);

  /* Raised it is cocked back; it straightens into the blow and HOLDS there. */
  float swing = mix(0.34, 0.0, k);
  float tilt  = mix(0.10, 0.0, k);

  /* rotX(tilt) * rotZ(swing): swing in body space, tilt in world space. */
  mat3 Rm = rotX(tilt) * rotZ(swing);

  float d = sdRoundBox3(p - vec3(0.0, BLK_Y, 0.0), vec3(BLK_W, BLK_H, BLK_D), 0.008);
  d = min(d, gavel((p - vec3(0.0, y, 0.0)) * Rm));
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

export function Gavel(props: SpotProps) {
  return <SpotIllustration source={GAVEL} width={240} still={1.40} {...props} />;
}

export const GAVEL_SOURCE = GAVEL;
