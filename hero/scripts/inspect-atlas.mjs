// Dump each atlas channel as a viewable grayscale PNG + print stats.
//   node scripts/inspect-atlas.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'public/atlas.png');
const OUT = path.join(ROOT, 'shots');

const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels } = info;
const names = ['R-tone', 'G-line', 'B-strain', 'A-silhouette'];

for (let c = 0; c < 4; c++) {
  const plane = Buffer.alloc(W * H);
  let sum = 0;
  let max = 0;
  let nonzero = 0;
  for (let i = 0; i < W * H; i++) {
    const v = data[i * channels + c];
    plane[i] = v;
    sum += v;
    if (v > max) max = v;
    if (v > 2) nonzero++;
  }
  console.log(
    `${names[c].padEnd(14)} mean ${(sum / (W * H) / 255).toFixed(3)}` +
      `  max ${(max / 255).toFixed(3)}  coverage ${((nonzero / (W * H)) * 100).toFixed(1)}%`,
  );
  await sharp(plane, { raw: { width: W, height: H, channels: 1 } })
    .png()
    .toFile(path.join(OUT, `atlas-${c}-${names[c]}.png`));
}

// A crop of one figure cell, tone+line composited the way the shader does it.
const cw = W / 4;
const ch = H / 2;
const comp = Buffer.alloc(cw * ch);
for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    const i = (y * W + x) * channels; // BACK_SETTLE is top-left after flip
    const d = (data[i] / 255) * 0.8 + (data[i + 1] / 255) * 0.35;
    comp[y * cw + x] = Math.min(255, d * 255);
  }
}
await sharp(comp, { raw: { width: cw, height: ch, channels: 1 } })
  .png()
  .toFile(path.join(OUT, 'atlas-composite-figure.png'));

console.log(`\nwrote channel dumps + composite to shots/`);
