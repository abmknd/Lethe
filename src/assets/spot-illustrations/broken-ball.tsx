import { PRELUDE } from './prelude';
import { SpotIllustration, type SpotProps } from './SpotIllustration';

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
/* 2x2x2, not 3x3x3. Eight big bricks read as PARTS at this size; twenty-seven
   small ones read as texture, which was the whole complaint. */
const float CYCLE = 4.6;
const float BX    = 0.092;   /* brick half width / depth */
const float BY    = 0.072;   /* brick half height        */
const float GAP   = 0.010;
const float RAD   = 0.186;
float gT;

float brick(vec3 q, vec3 rest){
  float d = sdRoundBox3(q, vec3(BX, BY, BX), 0.014);
  /* four studs, so a face still reads as a brick face at this size */
  vec3 sq = q - vec3(0.0, BY + 0.016, 0.0);
  sq.xz = abs(sq.xz) - BX * 0.46;
  d = min(d, sdCylY(sq, 0.016, 0.032));
  float e = length(q + rest) - RAD;      /* clip in ASSEMBLY space */
  return max(d, e * 0.55);
}

float map(vec3 p){
  float lt = pingPong(gT, CYCLE);

  float spread = smoothstep(1.9, 3.4, lt);
  float bound  = length(p - vec3(0.0, mix(0.0, -0.09, spread), 0.0))
               - (RAD + 0.11 + spread * 0.46);
  if(bound > 0.05) return bound;

  float d = 1e9;
  for(int i = 0; i < 2; i++){
    for(int j = 0; j < 2; j++){
      for(int k = 0; k < 2; k++){
        float fi = float(i), fj = float(j), fk = float(k);
        /* size PLUS a gap, per axis — no interpenetration, real seams */
        vec3 rest = (vec3(fi, fj, fk) - 0.5)
                  * vec3(BX * 2.0 + GAP, BY * 2.0 + GAP, BX * 2.0 + GAP);

        vec2  id  = vec2(fi * 2.0 + fj, fk);
        float rh  = cellHash(id);

        float release = 1.95 + rh * 0.30;
        float tau = max(lt - release, 0.0);

        /* THE SPIN WINDS UP, and that is what appears to throw it apart. The
           angle is quadratic in time, so angular speed rises linearly and the
           break lands at the fastest moment rather than arriving out of
           nowhere. Frozen at each brick's own release, so a loose brick keeps
           the orientation and position it had when it left and stops tracking
           the assembly — rotating 'rest' rather than the sample point is what
           keeps every piece rigid through the handover. */
        float ls    = min(lt, release);
        float aSpin = 0.30 * ls + 0.62 * ls * ls;
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
 * A ball of bricks that spins up and comes apart. Something on their end let go.
 *
 * NATURAL BOX 270x180. The width is not decoration: `p` is normalised by
 * `u_res.y`, so a wider canvas widens the visible x range without touching the
 * subject's scale. Assets whose pieces travel sideways need the room, and
 * measuring the frame edges is how these numbers were set.
 */
export function BrokenBall(props: SpotProps) {
  return <SpotIllustration source={BALL} width={270} still={1.2} {...props} />;
}

export const BALL_SOURCE = BALL;
