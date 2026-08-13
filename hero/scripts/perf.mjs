// perf.mjs — drives p from 0 to 1 programmatically, reports p50/p95 frame
// time, exits nonzero if p95 > 16.7ms. (Numbers from headless SwiftShader are
// pessimistic — treat as a regression gate, not absolute truth.)

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FRAMES = 600;
const WARMUP = 60; // discard browser-window startup jank
const BUDGET_MS = 16.7;
const DROP_WARN = 0.15; // advisory only — see note at the bottom

const server = await createServer({
  root: ROOT,
  logLevel: 'silent',
  server: { port: 0 },
});
await server.listen();
const url = server.resolvedUrls.local[0];

// --headed -> real window, real GPU. Default headless uses SwiftShader
// (software raster): treat those numbers as a regression gate only.
const headed = process.env.HEADED === '1' || process.argv.includes('--headed');

// Headed runs use the system Edge (real GPU) — the bundled Playwright
// chrome.exe fails with a side-by-side config error on this machine.
// Headless runs use the bundled headless shell + SwiftShader (regression
// gate only; software-raster numbers are pessimistic).
const browser = headed
  ? await chromium.launch({ headless: false, channel: 'msedge' })
  : await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => window.__hero && window.__hero.ready, null, {
  timeout: 15000,
});

const raw = await page.evaluate(
  (n) =>
    new Promise((resolve) => {
      const hero = window.__hero;
      hero.frames.length = 0;
      hero.costs.length = 0;
      hero.collect = true;
      let i = 0;
      function step() {
        hero.driveP(i / (n - 1));
        i += 1;
        if (i < n) {
          requestAnimationFrame(step);
        } else {
          hero.collect = false;
          resolve({ frames: hero.frames.slice(), costs: hero.costs.slice() });
        }
      }
      requestAnimationFrame(step);
    }),
  FRAMES,
);

await browser.close();
await server.close();

const frames = raw.frames.slice(WARMUP);
const costs = raw.costs.slice(WARMUP);

// Two distinct metrics:
// - costs:  time actually spent producing a frame (the controllable budget)
// - frames: rAF cadence, vsync-quantized. 16.7ms deltas ARE a locked 60fps;
//   gate on the fraction of dropped frames (delta > 1.5 vsync), not the p95.
const q = (arr, f) => {
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(f * s.length))];
};
const dropped = frames.filter((d) => d > 25).length / frames.length;

console.log(`frames: ${frames.length}`);
console.log(`render cost  p50: ${q(costs, 0.5).toFixed(2)}ms  p95: ${q(costs, 0.95).toFixed(2)}ms  (GATE <= ${BUDGET_MS}ms)`);
console.log(`rAF cadence  p50: ${q(frames, 0.5).toFixed(2)}ms  p95: ${q(frames, 0.95).toFixed(2)}ms`);
console.log(`dropped frames: ${(dropped * 100).toFixed(1)}%  (advisory, warn > ${DROP_WARN * 100}%)`);

// What each number can prove:
//   render cost — time WE spend producing a frame. Attributable to this code,
//                 low variance, so it is the hard gate.
//   dropped     — rAF cadence misses. On a headed desktop these are dominated
//                 by contention from other processes (observed 3-10% run to
//                 run with identical code), so it is advisory only. It still
//                 catches a genuinely broken pipeline, just not at 5%.
if (dropped > DROP_WARN) {
  console.warn(`WARN: cadence drops above ${DROP_WARN * 100}% — check for contention or a real stall`);
}

if (q(costs, 0.95) > BUDGET_MS) {
  console.error('FAIL: render cost over budget');
  process.exit(1);
}
console.log('PASS');
