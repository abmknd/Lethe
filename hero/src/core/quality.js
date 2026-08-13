// Adaptive quality. The dot pitch is the only knob worth turning: dropping the
// render buffer by one step quarters the fragment work while making the dither
// coarser, which on this piece reads as a stylistic choice rather than as
// degradation. Resolution is the last thing to go, not the first.
//
// Tiers are BUFFER_SCALE divisors: 2 = a 2px dot, 3 = 3px, 4 = 4px.

import { BUFFER_SCALE, QUALITY_BUDGET_MS, QUALITY_WINDOW, QUALITY_PATIENCE } from '../config/timeline.js';

const TIERS = [BUFFER_SCALE, BUFFER_SCALE + 1, BUFFER_SCALE + 2];

export function createQuality({ onTierChange } = {}) {
  const window_ = [];
  let tier = 0;
  let overBudget = 0;
  let underBudget = 0;
  // Downshifts are permanent for the session: a device that could not hold the
  // budget once will fail again, and oscillating the dot pitch is far more
  // objectionable than simply running coarser.
  let floor = 0;

  return {
    get tier() {
      return tier;
    },
    get scale() {
      return TIERS[tier];
    },
    get name() {
      return ['high', 'mid', 'low'][tier];
    },

    /** Feed one frame's GPU-side cost in ms. */
    sample(frameMs) {
      window_.push(frameMs);
      if (window_.length > QUALITY_WINDOW) window_.shift();
      if (window_.length < QUALITY_WINDOW) return;

      const sorted = [...window_].sort((a, b) => a - b);
      const p95 = sorted[Math.floor(sorted.length * 0.95)];

      if (p95 > QUALITY_BUDGET_MS) {
        overBudget++;
        underBudget = 0;
        if (overBudget >= QUALITY_PATIENCE && tier < TIERS.length - 1) {
          tier++;
          floor = tier;
          overBudget = 0;
          window_.length = 0;
          onTierChange?.(TIERS[tier], this.name);
        }
      } else if (p95 < QUALITY_BUDGET_MS * 0.4) {
        underBudget++;
        overBudget = 0;
        // Only ever climb back to the floor established by an earlier downshift.
        if (underBudget >= QUALITY_PATIENCE * 3 && tier > floor) {
          tier--;
          underBudget = 0;
          window_.length = 0;
          onTierChange?.(TIERS[tier], this.name);
        }
      }
    },
  };
}
