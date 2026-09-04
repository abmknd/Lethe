import { PRELUDE } from './prelude';
import { SpotIllustration, type SpotProps } from './SpotIllustration';

/**
 * 5 · A GAVEL COMES DOWN, AND THE THING IS DECIDED.
 *
 * For the moment a match request is accepted.
 *
 * ── The anatomy ─────────────────────────────────────────────────────────────
 *
 * A gavel is NOT a mallet on a stick. It is a stout BARREL — short, fat, banded
 * near each end with a raised collar — and the handle leaves that barrel's SIDE
 * at a right angle to its axis. Head axis along X, handle along Z, ninety
 * degrees apart in body space, then yawed about Y so the barrel sits three-
 * quarter on and the handle runs left and toward the camera.
 *
 * ── The blow is a SWING, about a hand ───────────────────────────────────────
 *
 * This is the part that has to be right, because the blow is the whole mark.
 *
 * A gavel is not dropped. It is held near the end of the handle and swung, so
 * every point on it travels an ARC about that grip: the head lifts up and back,
 * the handle is slanted the whole way, and the whole body rotates as one. An
 * earlier pass translated it straight down with the handle level, which is why
 * it read as a falling object rather than a struck blow.
 *
 * So there is a HAND — a fixed point 0.20 along the handle — and the gavel
 * rotates rigidly about it. The rotation is about the body's own Y axis, which
 * is the axis perpendicular to both the handle and the head, so the swing stays
 * in the vertical plane the handle lies in. The angle is BALLISTIC, the same
 * arithmetic as everything else here, only in radians: it accelerates into the
 * block instead of easing into it.
 *
 * At the bottom of the arc the angle is exactly zero, which is where the head's
 * axis stands vertical and its flat circular FACE meets the block square. A
 * judge strikes with the face, not the side.
 *
 * ── The staging ─────────────────────────────────────────────────────────────
 *
 *   WIND-UP   held up and back, still, for a quarter second. A strike with no
 *             pause before it is just a moving object.
 *   THE BLOW  the arc, accelerating, face-down onto the block.
 *   DWELL     everything freezes for 45ms at contact. Two or three held frames
 *             is the difference between a hit and a pass-through.
 *   RECOIL    the block takes the blow, jolting down and ringing back on a
 *             damped sine, and the gavel rebounds off it at the shared
 *             restitution. The rebound speed comes out of the swing itself.
 *   PUT DOWN  a short arc left — clear of the block, not across the frame —
 *             rolling onto its side in the air and landing flat, head nearest
 *             the block, handle trailing away.
 *
 * ── Why the roll waits ──────────────────────────────────────────────────────
 *
 * Upright, the head hangs HEAD_L below its centre. Mid-roll that grows to
 * sqrt(HEAD_L^2 + COL_R^2) — MORE than either end pose — so a barrel is at its
 * lowest while standing on the corner between face and side. Rolling while
 * still over the stone drove it straight through. The roll therefore holds off
 * until the head is past the block and then completes before touchdown.
 */
export const GAVEL = /* glsl */ `${PRELUDE}
const float GRAV = 2.10;
const float HALF_PI = 1.57079633;

/* ── the sounding block ──────────────────────────────────────────────────────
   A plinth with a smaller slab on it. One box reads as a crate; the step
   between the two is what makes it a made object. Kept small and low: the
   gavel has to get past it without clipping. */
const float BLK_X = 0.150;
const float PLI_H = 0.009, PLI_W = 0.093, PLI_D = 0.080;
const float SLB_H = 0.012, SLB_W = 0.075, SLB_D = 0.064;
const float BLK_TOP = FLOORY + PLI_H * 2.0 + SLB_H * 2.0;

/* ── the gavel ───────────────────────────────────────────────────────────────
   Half-length 0.098 against radius 0.068 is a BARREL, not a rod. The collars
   stand 0.010 proud and stop short of the ends, so the FACE is what strikes and
   the collars are what it rests on. */
const float HEAD_R = 0.068, HEAD_L = 0.098;
const float COL_R  = 0.078, COL_T  = 0.012, COL_X = 0.078;
const float BAR_R  = 0.023, BAR_L  = 0.112, BAR_Z = 0.140;
const float KNOB_R = 0.030;
const float TIP_Z  = BAR_Z + BAR_L;
const float HAND_Z = 0.200;                 /* the grip, along the handle */

/* Yawed past a right angle: handle LEFT and forward, HEAD nearest the block.
   Note the sign — this prelude's rotY takes (0,0,1) to (-sin a, 0, cos a). */
const float YAW = 1.021;

const float STRIKE_X = BLK_X;                     /* face centred on the slab */
const float STRIKE_Y = BLK_TOP + HEAD_L;
const float REST_X   = -0.105;
const float REST_Y   = FLOORY + COL_R;            /* lying on its collars */

const float SWING = 0.85;                   /* how far back it is drawn */
const float ANGA  = 22.0;                   /* angular gravity, rad/s^2 */
const float RIS_B = 0.191;                  /* nose-down so the knob lands */

const float POISE = 0.26, DWELL = 0.045, CYCLE = 2.10;

float gT, gJolt;
vec3  gHead;
mat3  gM;

float gavelBody(vec3 q){
  /* the barrel, axis along X, FLAT ended — the face is the striking surface */
  float d = sdCylY(q.yxz, HEAD_L, HEAD_R);

  /* both collars at once: folding x about zero mirrors one disc into two */
  vec3 c = q; c.x = abs(c.x) - COL_X;
  d = min(d, sdCylY(c.yxz, COL_T, COL_R));

  /* the handle, leaving the barrel's SIDE at a right angle to its axis */
  vec3 h = q; h.z -= BAR_Z;
  d = min(d, sdCylY(h.xzy, BAR_L, BAR_R));

  /* the knob, which stops the handle reading as a cut-off pipe */
  d = min(d, sdSphere(q - vec3(0.0, 0.0, TIP_Z), KNOB_R));
  return d;
}

float map(vec3 p){
  vec3 b = p - vec3(BLK_X, gJolt, 0.0);
  float d = sdRoundBox3(b - vec3(0.0, FLOORY + PLI_H, 0.0),
                        vec3(PLI_W, PLI_H, PLI_D), 0.006);
  d = min(d, sdRoundBox3(b - vec3(0.0, FLOORY + PLI_H * 2.0 + SLB_H, 0.0),
                         vec3(SLB_W, SLB_H, SLB_D), 0.007));
  return min(d, gavelBody((p - gHead) * gM));
}

void main(){
  gT = u_time;

  /* The impact pose: barrel upright, face down, handle level and yawed left. */
  mat3 M0 = rotY(YAW) * rotZ(HALF_PI);
  vec3 impact = vec3(STRIKE_X, STRIKE_Y, 0.0);
  vec3 hand   = impact - M0 * vec3(0.0, 0.0, -HAND_Z);

  /* ── the swing ───────────────────────────────────────────────────────────
     Ballistic in ANGLE: drawn back to -SWING, accelerating to zero at the
     bottom of the arc, which is where the face is square on the stone. The
     head's speed at that instant is what the rebound is built from, so the
     bounce is proportional to the swing rather than a fixed hop. */
  float t1  = sqrt(2.0 * SWING / ANGA);
  float vHd = ANGA * t1 * HAND_Z;               /* head speed at contact */
  float v1  = 0.34 * vHd;                       /* off the block */
  float vFl = sqrt(v1 * v1 + 2.0 * GRAV * (STRIKE_Y - REST_Y));
  float t2  = (v1 + vFl) / GRAV;
  float v2  = 0.34 * vFl;                       /* settling hop */
  float t3  = 2.0 * v2 / GRAV;

  float lt  = pingPong(gT, CYCLE);
  float tau = lt - POISE;
  float hit = max(tau - t1, 0.0);               /* time since contact */
  tau -= clamp(hit, 0.0, DWELL);                /* freeze through the dwell */

  if(tau < t1){
    /* ON THE ARC, still in the hand: one angle places and orients the whole
       body, so the translation and the rotation cannot disagree. */
    float ta = max(tau, 0.0);
    float th = -SWING + 0.5 * ANGA * ta * ta;
    mat3  R  = M0 * rotY(th);
    gHead = hand + R * vec3(0.0, 0.0, -HAND_Z);
    gM    = R;
  } else {
    float s = tau - t1;
    float k = clamp(s / t2, 0.0, 1.0);           /* how far through the toss */
    float y;
    if(s < t2){
      y = STRIKE_Y + v1 * s - 0.5 * GRAV * s * s;
    } else if(s < t2 + t3){
      float u = s - t2;
      y = REST_Y + v2 * u - 0.5 * GRAV * u * u;
    } else {
      y = REST_Y;
    }
    /* Roll onto its side IN THE AIR, but only once past the block and finished
       before touchdown — see the note above on why mid-roll is the lowest the
       barrel ever hangs. */
    float r = clamp((k - 0.70) / 0.24, 0.0, 1.0);
    r = r * r * (3.0 - 2.0 * r);

    gHead = vec3(mix(STRIKE_X, REST_X, k), y, 0.0);
    gM    = rotY(YAW) * rotZ(HALF_PI + r * HALF_PI) * rotX(RIS_B * r);
  }

  /* ── the block takes the blow ─────────────────────────────────────────────
     A damped sine, struck at contact: down first, then ringing back up. */
  gJolt = hit <= 0.0 ? 0.0 : -0.011 * exp(-13.0 * hit) * sin(28.0 * hit);

  vec2 p  = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 ro  = vec3(-0.067, 0.27, 0.92);
  vec3 tgt = vec3(-0.067, -0.052, 0.0);
  vec3 rd  = aimed(lookAt(ro, tgt), p, 1.87);

  float t = 0.0;
  bool sky = true;
  for(int i = 0; i < 78; i++){
    float d = map(ro + rd * t);
    if(d < 0.0016){ sky = false; break; }
    t += d;
    if(t > 3.2) break;
  }
  if(sky){ gl_FragColor = vec4(u_ink, 0.0); return; }
  gl_FragColor = inkFrom(shadeDensity(ro + rd * t, rd));
}
`;

export function Gavel(props: SpotProps) {
  return <SpotIllustration source={GAVEL} width={250} still={1.60} {...props} />;
}

export const GAVEL_SOURCE = GAVEL;
