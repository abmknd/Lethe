// shoot.mjs — boots a Vite dev server, loads ?p= at fixed stops, writes PNGs
// to shots/. Definition of done: look at these frames. (CLAUDE.md)

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = path.join(ROOT, 'shots');
const STOPS = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1];

const server = await createServer({
  root: ROOT,
  logLevel: 'silent',
  server: { port: 0 },
});
await server.listen();
const url = server.resolvedUrls.local[0];

const browser = await chromium.launch({
  args: ['--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await mkdir(SHOTS, { recursive: true });

for (const p of STOPS) {
  await page.goto(`${url}?p=${p}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__hero && window.__hero.ready, null, {
    timeout: 15000,
  });
  // let the deep link settle and a few frames render
  await page.waitForTimeout(400);
  const file = path.join(SHOTS, `p-${p.toFixed(2)}.png`);
  await page.screenshot({ path: file });
  const state = await page.evaluate(() => window.__hero.state());
  console.log(
    `shot ${path.basename(file)}  p=${state.p.toFixed(3)}  buf=${state.buffer.w}x${state.buffer.h}  fps=${state.fps.toFixed(0)}`,
  );
}

await browser.close();
await server.close();
console.log(`\n${STOPS.length} frames -> ${SHOTS}`);
