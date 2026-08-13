// purity.mjs — proves scrub(p) is a PURE FUNCTION of p.
//
// This is the constraint most likely to rot silently: one cached value, one
// "hasFired" flag, and scrubbing backwards stops reconstructing the timeline
// while everything still looks fine going forwards. So assert it mechanically.
//
// Three properties:
//   1. DETERMINISM  — same p, same state, no matter when it is asked for
//   2. ORDER-FREEDOM — forwards, backwards and shuffled all agree
//   3. CONTINUITY   — no discontinuous jumps between adjacent p (would show
//                     as a visible pop while scrubbing)
//
//   node scripts/purity.mjs

import { scrub } from '../src/figures/choreography.js';

const N = 501;
const ps = Array.from({ length: N }, (_, i) => i / (N - 1));

const key = (s) => JSON.stringify(s);

// 1. forwards
const forward = new Map();
for (const p of ps) forward.set(p, key(scrub(p)));

// 2. backwards
let mismatched = 0;
for (const p of [...ps].reverse()) {
  if (key(scrub(p)) !== forward.get(p)) mismatched++;
}

// 3. shuffled, with repeats
const shuffled = [...ps, ...ps].sort(() => Math.random() - 0.5);
for (const p of shuffled) {
  if (key(scrub(p)) !== forward.get(p)) mismatched++;
}

if (mismatched > 0) {
  console.error(`FAIL: ${mismatched} states depended on evaluation order`);
  process.exit(1);
}
console.log(`determinism   ok  (${N} samples, forward + reverse + shuffled)`);

// 4. continuity — flag any adjacent pair that jumps hard
const numbers = (s) => [
  s.zoom,
  s.cam[1],
  s.boulderY,
  s.spin,
  s.sync,
  // poseMix is deliberately absent: it is a CYCLIC blend weight that wraps
  // 1 -> 0 on every walk-cycle frame, which is legitimate. Its continuity is
  // the handoff check's job, below.
  ...s.figures.flatMap((f) => [f.x, f.y, f.reveal, f.strain]),
];

let worst = { d: 0, p: 0, i: -1 };
for (let i = 1; i < ps.length; i++) {
  const a = numbers(scrub(ps[i - 1]));
  const b = numbers(scrub(ps[i]));
  for (let k = 0; k < a.length; k++) {
    const d = Math.abs(b[k] - a[k]);
    if (d > worst.d) worst = { d, p: ps[i], i: k };
  }
}

// One step is 1/500 of the scroll; anything moving more than a few hundredths
// of a world unit in that span will read as a pop.
const LIMIT = 0.06;
console.log(`continuity    max step ${worst.d.toFixed(4)} at p=${worst.p.toFixed(3)} (field ${worst.i}), limit ${LIMIT}`);

if (worst.d > LIMIT) {
  console.error('FAIL: discontinuity — that will pop visibly while scrubbing');
  process.exit(1);
}
// 5. pose handoff — when a figure swaps which pair of atlas cells it is
// blending, the swap must be a clean baton pass: the outgoing pair fully
// resolved to its second cell, and the incoming pair starting from that same
// cell. Anything else is a visible snap that the numeric check cannot see,
// because the blend weight is continuous while the thing being blended is not.
const rk = (r) => r.join(',');

// The rendered image at a handoff is rectB of the outgoing pair (as its weight
// reaches 1) and rectA of the incoming pair (as its weight leaves 0). So the
// pair must share that cell, and the blend must have travelled only about one
// sample step across the boundary. Sampling never lands exactly on it, and the
// weight advances up to WALK_STRIDES/RIGHT_DUR * (1/N) ~= 0.04 per step, so the
// tolerance is set just above that rather than at zero.
const STEP_TOL = 0.08;
let handoffFails = 0;
for (let i = 1; i < ps.length; i++) {
  const a = scrub(ps[i - 1]);
  const b = scrub(ps[i]);
  for (let f = 0; f < a.figures.length; f++) {
    const A = a.figures[f];
    const B = b.figures[f];
    if (rk(A.rectA) === rk(B.rectA) && rk(A.rectB) === rk(B.rectB)) continue;

    const shares = rk(A.rectB) === rk(B.rectA);
    const travelled = 1 - A.poseMix + B.poseMix;
    if (shares && travelled < STEP_TOL) continue;

    handoffFails++;
    if (handoffFails <= 4) {
      console.error(
        `  figure ${f} at p=${ps[i].toFixed(3)}: mix ${A.poseMix.toFixed(3)} -> ${B.poseMix.toFixed(3)}` +
        (shares ? `, travelled ${travelled.toFixed(3)} > ${STEP_TOL}` : ', pair does not share a cell'),
      );
    }
  }
}
if (handoffFails > 0) {
  console.error(`FAIL: ${handoffFails} unclean pose handoffs — these snap on screen`);
  process.exit(1);
}
console.log('pose handoff  ok  (every atlas-pair swap is a clean baton pass)');

console.log('PASS');
