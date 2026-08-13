// Boot + wiring only. No logic lives here. (CLAUDE.md structure)

import * as THREE from 'three';
import { FIELD, INK } from './config/palette.js';
import { PIN_VH, SCROLL_EASE_TAU, IDLE_ONSET_TAU, HEADLINE_IN_START, HEADLINE_IN_END, HEADLINE_OUT_START, HEADLINE_OUT_END } from './config/timeline.js';
import { createScroll } from './core/scroll.js';
import { createLoop } from './core/loop.js';
import { createBuffers } from './core/buffers.js';
import { createQuality } from './core/quality.js';
import { createSkyPass } from './passes/sky.js';
import { createHillPass } from './passes/hill.js';
import { createBoulderPass } from './passes/boulder.js';
import { createDitherPass } from './passes/dither.js';
import { createPresentPass } from './passes/present.js';
import { createFigures } from './figures/instances.js';
import { scrub, regression, stillness } from './figures/choreography.js';
import { createOverlay } from './debug/overlay.js';
import { createScrubber, readDeepLinkP } from './debug/scrubber.js';

document.documentElement.style.setProperty('--field', FIELD);
document.documentElement.style.setProperty('--ink', INK);

const pinEl = document.getElementById('hero-pin');
const frameEl = document.getElementById('hero-frame');
const canvas = document.getElementById('hero-canvas');

// ?debug shows the overlay + scrubber; ?poster suppresses them so the poster
// shot is clean. Neither is on by default — this is a hero, not a workbench.
const params = new URLSearchParams(location.search);
const showDebug = params.has('debug') && !params.has('poster');

// SPEC §8: reduced motion resolves to the finished image and stops.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * The copy resolves out of the dither, holds, then dissolves back out as the
 * boulder rises into the upper frame. Reduced motion just leaves it up.
 */
function setHeadline(p) {
  let r = 1;
  if (!reduceMotion) {
    const inR = clamp01((p - HEADLINE_IN_START) / (HEADLINE_IN_END - HEADLINE_IN_START));
    const outR = clamp01((p - HEADLINE_OUT_START) / (HEADLINE_OUT_END - HEADLINE_OUT_START));
    r = inR * (1 - outR);
  }
  document.documentElement.style.setProperty('--reveal', r.toFixed(3));
}
setHeadline(0);

// No WebGL: the poster is already painted and the copy is already legible, so
// the page is complete without the canvas. Nothing else needs to run.
let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
  });
} catch {
  renderer = null;
}

if (!renderer) {
  canvas.remove();
  setHeadline(1);
  window.__hero = { ready: true, noWebGL: true, state: () => ({ noWebGL: true }) };
} else {
  boot(renderer);
}

function boot(renderer) {
renderer.setClearColor(FIELD, 1);
renderer.autoClear = false; // the density buffer is composed by several passes

const scroll = createScroll({ pinEl, pinVH: PIN_VH, easeTau: SCROLL_EASE_TAU });
const buffers = createBuffers();
const quality = createQuality({
  onTierChange(scale, name) {
    // Coarsening the dot pitch needs a buffer reallocation, not just a flag.
    buffers.setScale(scale);
    resize();
    if (window.__hero) window.__hero.tier = name;
  },
});
const sky = createSkyPass();
const hill = createHillPass();
const boulder = createBoulderPass();
const dither = createDitherPass({ field: FIELD, ink: INK });
const present = createPresentPass();

let atlasReady = false;
const figures = createFigures({
  onReady() {
    atlasReady = true;
  },
});

function resize() {
  const cssW = frameEl.clientWidth;
  const cssH = frameEl.clientHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(cssW, cssH, false);
  buffers.resize(cssW, cssH);
}
new ResizeObserver(resize).observe(frameEl);
resize();

let firstFrameDone = false;
let settle = 0; // smoothed stillness, so regression eases in rather than snaps

const loop = createLoop({
  watchEl: frameEl,
  onFrame({ dtMs, elapsedS, temporalOffset }) {
    const t0 = performance.now();
    const { p, velocity } = scroll.update(dtMs);
    setHeadline(p);

    // Idle regression is applied ON TOP of the p-derived state, never folded
    // into p, so scrubbing backwards still reconstructs exactly. (SPEC §6)
    settle += (stillness(velocity) - settle) * (1 - Math.exp(-dtMs / IDLE_ONSET_TAU));
    const idle = reduceMotion ? { sink: 0, tremor: 1 } : regression(settle, elapsedS);
    const w = scrub(p);
    const aspect = buffers.size.w / buffers.size.h;
    const common = { elapsedS, aspect, cam: w.cam, zoom: w.zoom };

    // Compose the density buffer: clear, then each mark system in depth order.
    renderer.setRenderTarget(buffers.density);
    renderer.setClearColor(0x000000, 1);
    renderer.clear(true, false, false);

    sky.render(renderer, buffers.density, { ...common, align: w.align, boulderY: w.boulderY - idle.sink });
    hill.render(renderer, buffers.density, { ...common, feetX: w.feetX, feetW: w.feetW });
    boulder.render(renderer, buffers.density, { ...common, boulderY: w.boulderY - idle.sink, spin: w.spin });
    figures.render(renderer, buffers.density, { ...common, sync: w.sync, tremorBoost: idle.tremor, figures: w.figures });

    dither.render(renderer, buffers.density.texture, buffers.present, reduceMotion ? [0, 0] : temporalOffset);
    present.render(renderer, buffers.present.texture);

    const costMs = performance.now() - t0;
    quality.sample(costMs);

    // Only "ready" once the art is uploaded AND a frame with it has landed.
    if (!firstFrameDone && atlasReady) {
      firstFrameDone = true;
      // Hand off from the poster only once a real frame is underneath it.
      frameEl.classList.add('canvas-live');
      window.__hero.ready = true;
      // Reduced motion: one frame at the resolved state, then stop. No rAF,
      // no temporal crawl, no tremor.
      if (reduceMotion) loop.stop();
    }
    if (window.__hero.collect) {
      window.__hero.frames.push(dtMs);
      window.__hero.costs.push(costMs);
    }
  },
});

if (showDebug) {
  createOverlay({ scroll, loop, buffers, quality });
  createScrubber({ scroll });
}

window.__hero = {
  ready: false,
  collect: false,
  frames: [],
  costs: [],
  setP: (p) => scroll.setP(p),
  driveP: (p) => scroll.driveP(p),
  state: () => ({
    p: scroll.p,
    velocity: scroll.velocity,
    fps: loop.fps,
    tier: quality.name,
    buffer: buffers.size,
  }),
};

// Reduced motion resolves straight to the finished image (SPEC §8).
const deepP = reduceMotion ? 1 : readDeepLinkP();
if (deepP !== null) requestAnimationFrame(() => scroll.setP(deepP));

setHeadline(reduceMotion ? 1 : scroll.p);
loop.start();
}
