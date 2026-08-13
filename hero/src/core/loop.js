// rAF loop with IntersectionObserver pause/resume and the temporal-dither
// clock (whole Bayer cells, <= TEMPORAL_HZ). (SPEC §2, §4)

import { TEMPORAL_HZ } from '../config/timeline.js';

// Small fixed sequence of whole-cell offsets — enough variety to keep the
// pattern alive without reading as motion in one direction.
const OFFSETS = [
  [0, 0], [3, 1], [6, 4], [1, 6], [5, 2], [2, 5], [7, 7], [4, 3],
];

export function createLoop({ watchEl, onFrame }) {
  let rafId = 0;
  let running = false;
  let visible = true;
  let lastT = 0;
  let fps = 0;
  let temporalAccum = 0;
  let temporalIndex = 0;

  const temporalPeriodMs = 1000 / TEMPORAL_HZ;

  function frame(t) {
    rafId = 0;
    if (!running || !visible) return;

    const dtMs = lastT ? Math.min(t - lastT, 100) : 16.7;
    lastT = t;

    if (dtMs > 0) fps = fps * 0.9 + (1000 / dtMs) * 0.1;

    temporalAccum += dtMs;
    if (temporalAccum >= temporalPeriodMs) {
      temporalAccum %= temporalPeriodMs;
      temporalIndex = (temporalIndex + 1) % OFFSETS.length;
    }

    onFrame({
      dtMs,
      elapsedS: t / 1000,
      temporalOffset: OFFSETS[temporalIndex],
    });

    rafId = requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && running && !rafId) {
        lastT = 0; // avoid a giant dt after a pause
        rafId = requestAnimationFrame(frame);
      }
    },
    { threshold: 0.01 },
  );
  io.observe(watchEl);

  return {
    start() {
      if (running) return;
      running = true;
      if (visible && !rafId) rafId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      lastT = 0;
    },
    get fps() {
      return fps;
    },
    get visible() {
      return visible;
    },
    destroy() {
      this.stop();
      io.disconnect();
    },
  };
}
