// Virtual scroll: native page scroll feeds the target; `current` eases toward
// it frame-rate-independently. One number out. No scroll libraries. (SPEC §2)

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function createScroll({ pinEl, pinVH, easeTau }) {
  let target = 0;
  let current = 0;
  let velocity = 0;
  let destroyed = false;

  // Pin geometry is cached and recomputed only on resize, so scroll frames
  // never force a layout read.
  let pinTop = 0;
  let pinRange = 1;

  function measure() {
    pinTop = pinEl.getBoundingClientRect().top + window.scrollY;
    pinRange = (pinVH / 100) * window.innerHeight;
  }

  function readTarget() {
    target = clamp01((window.scrollY - pinTop) / pinRange);
  }

  function onScroll() {
    if (!destroyed) readTarget();
  }

  function onResize() {
    if (destroyed) return;
    measure();
    readTarget();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  measure();
  readTarget();

  return {
    get p() {
      return current;
    },
    get velocity() {
      return velocity;
    },

    /** Jump p directly (scrubber / ?p= deep link). Scrolls the page to match
     *  so native scroll and p never disagree. current snaps — no ease-in. */
    setP(p) {
      p = clamp01(p);
      window.scrollTo(0, pinTop + p * pinRange);
      target = p;
      current = p;
      velocity = 0;
    },

    /** Bench-only: move p without the scrollTo side effect, so perf runs
     *  measure the render pipeline rather than forced scroll dispatch. */
    driveP(p) {
      p = clamp01(p);
      target = p;
      current = p;
      velocity = 0;
    },

    /** Called once per frame by the loop. Pure ease toward target. */
    update(dtMs) {
      const prev = current;
      const k = 1 - Math.exp(-dtMs / easeTau);
      current += (target - current) * k;
      velocity = dtMs > 0 ? (current - prev) / (dtMs / 1000) : 0;
      return { p: current, velocity };
    },

    destroy() {
      destroyed = true;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    },
  };
}
