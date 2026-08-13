// poster.mjs — builds the two static assets the hero needs before WebGL is
// alive, or instead of it.
//
//   public/poster.webp  the p=0 frame. It is the LCP element: painted
//                       immediately, crossfaded out on the canvas's first
//                       frame, and left in place permanently if WebGL is
//                       unavailable.
//   public/bayer.png    an 8x8 ordered-dither tile, used as a CSS mask so the
//                       headline resolves out of the same dither as the art.
//
//   node scripts/poster.mjs

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stat } from 'node:fs/promises';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'public');

// ---------------------------------------------------------------- bayer tile
// The same recursive ordered matrix the dither pass uses, so the headline
// dissolves on the identical lattice as the artwork behind it.
const BAYER8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

const tile = Buffer.alloc(8 * 8 * 4);
for (let y = 0; y < 8; y++) {
  for (let x = 0; x < 8; x++) {
    const v = Math.round(((BAYER8[y][x] + 0.5) / 64) * 255);
    const o = (y * 8 + x) * 4;
    tile[o] = tile[o + 1] = tile[o + 2] = 255;
    tile[o + 3] = v; // alpha carries the threshold; mask reads alpha
  }
}
await sharp(tile, { raw: { width: 8, height: 8, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(path.join(PUB, 'bayer.png'));
console.log('bayer.png    8x8 ordered tile');

// ---------------------------------------------------------------- poster
const server = await createServer({ root: ROOT, logLevel: 'silent', server: { port: 0 } });
await server.listen();
const url = server.resolvedUrls.local[0];

const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// `poster=1` suppresses the debug chrome so it does not bake into the image.
await page.goto(`${url}?p=0&poster=1`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__hero && window.__hero.ready, null, { timeout: 20000 });
await page.waitForTimeout(600);

const raw = await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 900 } });
await browser.close();
await server.close();

// Downscaled: it only has to hold the frame for a few hundred milliseconds
// before the canvas takes over, and LCP rewards bytes on the wire.
await sharp(raw).resize(1280).webp({ quality: 82 }).toFile(path.join(PUB, 'poster.webp'));

const { size } = await stat(path.join(PUB, 'poster.webp'));
console.log(`poster.webp  1280w  ${(size / 1024).toFixed(0)} KB`);
