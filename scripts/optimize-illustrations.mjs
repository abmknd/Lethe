// Optimize selected illustration PNGs into web-ready WebP for the rebrand.
//
// Usage:
//   node scripts/optimize-illustrations.mjs           # encode the mapped selection
//   node scripts/optimize-illustrations.mjs --all     # encode every illustration
//
// WebP q94 at 1280px. Lossless is not an option here: these are stippled
// engravings, pure high-frequency noise, so lossless only takes ~12% off the
// PNG (219MB across the set) while q94 holds the dot structure at render size
// for a fraction of that. Below roughly q90 the dither visibly bleeds, so 94
// is the floor, not a default. Output lands in src/rebrand/assets/.
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src/assets/illustrations');
const OUT = path.join(ROOT, 'src/rebrand/assets');

// slot key -> source path (relative to SRC). Swap a value here to re-map a slot.
const SELECTION = {
  'who-creators': 'books_theme/canyons_of_trantor.png',
  'step-1-tell-us': 'hellenistic_theme/moirai_three_fates.png',
  'step-2-introduced': 'hellenistic_theme/persephone_underworld_throne.png',
  'step-3-matches': 'hellenistic_theme/odysseus_siren_frequency.png',
  'step-4-priors': 'hellenistic_theme/creation_of_adam.png',
};

const KB = (bytes) => (bytes / 1024).toFixed(0) + ' KB';

async function encode(srcAbs, outAbs) {
  await mkdir(path.dirname(outAbs), { recursive: true });
  const before = (await stat(srcAbs)).size;
  await sharp(srcAbs).resize(1280, null, { withoutEnlargement: true }).webp({ quality: 94, effort: 6 }).toFile(outAbs);
  const after = (await stat(outAbs)).size;
  console.log(
    `  ${path.basename(outAbs).padEnd(28)} ${KB(before).padStart(9)} -> ${KB(after).padStart(9)}` +
    `  (${(100 - (after / before) * 100).toFixed(0)}% smaller)`
  );
}

async function collectAll() {
  const pairs = [];
  for (const theme of await readdir(SRC)) {
    const dir = path.join(SRC, theme);
    if (!(await stat(dir)).isDirectory()) continue;
    for (const file of await readdir(dir)) {
      if (!file.toLowerCase().endsWith('.png')) continue;
      const base = file.replace(/\.png$/i, '').replace(/\s+/g, '_');
      pairs.push([path.join(dir, file), path.join(OUT, theme, `${base}.webp`)]);
    }
  }
  return pairs;
}

async function main() {
  const all = process.argv.includes('--all');
  console.log(`\nOptimizing illustrations -> WebP lossless  (${all ? 'ALL' : 'selection'})\n`);

  const pairs = all
    ? await collectAll()
    : Object.entries(SELECTION).map(([slot, rel]) => [
        path.join(SRC, rel),
        path.join(OUT, `${slot}.webp`),
      ]);

  for (const [srcAbs, outAbs] of pairs) {
    try {
      await encode(srcAbs, outAbs);
    } catch (err) {
      console.error(`  ! failed: ${srcAbs}\n    ${err.message}`);
    }
  }
  console.log(`\nDone. ${pairs.length} file(s) -> ${path.relative(ROOT, OUT)}\n`);
}

main();
