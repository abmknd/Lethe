// scrub(p) -> the entire state of the piece.
//
// PURE FUNCTION OF p. No accumulated state, no one-shot flags, no "hasFired"
// booleans — every frame is reconstructible from p alone, so scrubbing
// backwards is exact. (SPEC §2). Wall-clock only reaches tremor and the hill
// pulse, which live in the shaders.

import { uvRect, WALK_CYCLE } from './atlas.js';
import {
  FIGURE_H,
  STRAIN_END,
  LEFT_START,
  LEFT_DUR,
  RIGHT_START,
  RIGHT_DUR,
  ALIGN_START,
  CAM_ZOOM_NEAR,
  CAM_ZOOM_FAR,
  CAM_Y_NEAR,
  CAM_Y_FAR,
  CAM_REVEAL_END,
  HILL_H0,
  HILL_ARC_K,
  FIGURE_XS,
  FIGURE_START_XS,
  WALK_STRIDES,
  WALK_BLEND,
  WALK_STRAIN,
  PLANT_STRAIN,
  MAX_STRAIN,
  BOULDER_Y,
  BOULDER_DESCENT,
  BOULDER_RISE,
  BOULDER_SPIN,
  PUSH_FOLLOW,
  IDLE_VEL_REF,
  IDLE_SINK,
  IDLE_TREMOR,
  IDLE_BREATH_HZ,
} from '../config/timeline.js';

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const mix = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);

const BACK = [uvRect('BACK_SETTLE'), uvRect('BACK_MAX')];
const TQ = [uvRect('TQ_SETTLE'), uvRect('TQ_MAX')];

/** Hill surface height at a world x. */
export function hillY(x) {
  // The summit line itself: highest at the centre, falling away to each side,
  // so the flankers genuinely climb toward the rock as they come in.
  return HILL_H0 - HILL_ARC_K * x * x;
}
/** Instance origins are quad CENTRES, so a figure standing on the hill sits
 *  half its height above the surface. */
function standY(x) {
  return hillY(x) + FIGURE_H / 2;
}

/**
 * One flanking figure.
 *   approach 0 = still down the slope, 1 = planted at the rock
 *   push     0 = just arrived,        1 = fully committed
 *
 * The two stages are joined by ONE continuous parameter running 0..2, because
 * the renderer can only cross-fade two atlas cells at a time. 0..1 blends the
 * final stride into the planted stance; 1..2 drives that stance from settle to
 * full strain. At every integer the outgoing pair has fully resolved to the
 * cell the incoming pair starts from, so the baton passes without a snap.
 */
function flanker(index, approach, push, lift) {
  const x = mix(FIGURE_START_XS[index], FIGURE_XS[index], ease(approach));
  const y = standY(x) + lift;

  if (approach < WALK_BLEND) {
    // Gait phase advances with distance covered, so the stride reads as
    // locomotion rather than a loop playing on a timer.
    const g = approach * WALK_STRIDES;
    const k = Math.floor(g) % 4;
    return {
      x,
      y,
      reveal: 1,
      strain: WALK_STRAIN,
      poseMix: g - Math.floor(g),
      rectA: WALK_CYCLE[k],
      rectB: WALK_CYCLE[(k + 1) % 4],
    };
  }

  const t = clamp01((approach - WALK_BLEND) / (1 - WALK_BLEND));
  const pose = t + push;
  const k = Math.floor(WALK_BLEND * WALK_STRIDES) % 4;

  if (pose < 1) {
    return {
      x,
      y,
      reveal: 1,
      strain: mix(WALK_STRAIN, PLANT_STRAIN, pose),
      poseMix: pose,
      rectA: WALK_CYCLE[k],
      rectB: TQ[0],
    };
  }
  return {
    x,
    y,
    reveal: 1,
    strain: mix(PLANT_STRAIN, MAX_STRAIN, pose - 1),
    poseMix: pose - 1,
    rectA: TQ[0],
    rectB: TQ[1],
  };
}

export function scrub(p) {
  const left = clamp01((p - LEFT_START) / LEFT_DUR);
  const right = clamp01((p - RIGHT_START) / RIGHT_DUR);
  const align = clamp01((p - ALIGN_START) / (1 - ALIGN_START));

  // The thesis: help arriving relieves the one already carrying it.
  const relief = (left + right) / 2;
  const center = clamp01(p / STRAIN_END) * (1 - 0.5 * relief);

  // Boulder sinks to its lowest at p=0.3, holds while help arrives, then goes
  // up past where it started once all three are pushing.
  let boulderY;
  if (p < STRAIN_END) {
    boulderY = BOULDER_Y - BOULDER_DESCENT * ease(p / STRAIN_END);
  } else if (p < ALIGN_START) {
    boulderY = BOULDER_Y - BOULDER_DESCENT;
  } else {
    boulderY = BOULDER_Y - BOULDER_DESCENT + (BOULDER_DESCENT + BOULDER_RISE) * ease(align);
  }

  // The camera descends and pulls back, turning the opening arc-at-the-bottom
  // into the full tableau. It finishes early, so the flankers are already in
  // frame by the time they start climbing.
  const cz = ease(clamp01(p / CAM_REVEAL_END));
  const zoom = mix(CAM_ZOOM_NEAR, CAM_ZOOM_FAR, cz);
  const camY = mix(CAM_Y_NEAR, CAM_Y_FAR, cz);

  // How far the rock has moved from its rest height, and how much of that the
  // bodies take with it.
  const lift = (boulderY - BOULDER_Y) * PUSH_FOLLOW;

  const figures = [
    {
      x: FIGURE_XS[0],
      y: standY(FIGURE_XS[0]) + lift,
      reveal: 1,
      strain: center,
      poseMix: center,
      rectA: BACK[0],
      rectB: BACK[1],
    },
    // Commitment ramps against p AFTER arrival, not against the approach —
    // the approach has already saturated by then, so driving strain from it
    // would step discontinuously the instant the figure lands.
    flanker(1, left, clamp01((p - (LEFT_START + LEFT_DUR)) / (1 - (LEFT_START + LEFT_DUR))), lift),
    flanker(2, right, clamp01((p - (RIGHT_START + RIGHT_DUR)) / (1 - (RIGHT_START + RIGHT_DUR))), lift),
  ];

  return {
    zoom,
    cam: [0, camY],
    // The rock turns as it is driven up.
    spin: BOULDER_SPIN * ease(p),
    align,
    sync: align,
    boulderY,
    feetX: figures.map((f) => f.x),
    feetW: [center, left, right],
    figures,
  };
}

/**
 * Idle regression. Deliberately NOT part of scrub(p): it is a function of
 * wall-clock and scroll velocity, and it returns an offset to ADD to the
 * p-derived state. Folding it into p would make the timeline unreconstructible
 * and break scrubbing backwards.
 *
 * `settle` is the caller's smoothed 0..1 stillness, so the regression eases in
 * rather than snapping the moment the wheel stops.
 */
export function regression(settle, elapsedS) {
  const breath = 0.5 - 0.5 * Math.cos(elapsedS * IDLE_BREATH_HZ * Math.PI * 2);
  return {
    sink: settle * IDLE_SINK * (0.55 + 0.45 * breath),
    tremor: 1 + settle * IDLE_TREMOR * (0.6 + 0.4 * breath),
  };
}

/** Stillness target for a given scroll velocity: 1 when stopped, 0 when moving. */
export function stillness(velocity) {
  return clamp01(1 - Math.abs(velocity) / IDLE_VEL_REF);
}
