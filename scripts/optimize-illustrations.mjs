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
const SRC = path.join(ROOT, 'src/assets/artworks');
const OUT = path.join(ROOT, 'src/rebrand/assets');

// slot key -> source path (relative to SRC). Swap a value here to re-map a slot.
const SELECTION = {
  'who-creators': 'books_theme/canyons_of_trantor.png',
  'step-1-tell-us': 'hellenistic_theme/moirai_three_fates.png',
  'step-2-introduced': 'hellenistic_theme/persephone_underworld_throne.png',
  'step-3-matches': 'hellenistic_theme/odysseus_siren_frequency.png',
  'step-4-priors': 'hellenistic_theme/creation_of_adam.png',
};

// Onboarding, one plate per step. These are the white-ground portraits: blue
// stipple on white, so they sit flush beside a White card with no seam, which
// is why the marketing set's blue-ground plates are not reused here.
//
// The pairing is by MEANING, not sequence — each plate answers the question its
// step is asking. Re-map a slot by editing the right-hand side; the component
// reads slots by name, so nothing in the app changes.
const KYC_SELECTION = {
  // "Meet people worth meeting" — two people, a drink, golden hour.
  'kyc-1-getting-started': 'white_themes/portrait_art/sunset_on_fire_escape.png',
  // "Who could you meet tonight?" — looking out across distance.
  'kyc-2-location': 'white_themes/portrait_art/hilltop_observatory.png',
  // "What brings you here?" — a deliberate move, considered.
  'kyc-3-intent': 'white_themes/portrait_art/men_at_chess_square.png',
  // "I want to meet people who…" — a cohort of peers.
  'kyc-4-match': 'white_themes/portrait_art/graduation_reunion.png',
  // "What are you into?" — the eclectic pile of things a person likes.
  'kyc-5-texture': 'white_themes/portrait_art/books_blooms_zooms.png',
  // "How would you introduce yourself?" — shaping something by hand.
  'kyc-6-voice': 'white_themes/portrait_art/pottery_studio_workshop.png',
  // "Add a profile image" — being seen.
  'kyc-7-profile': 'white_themes/portrait_art/ballet_dancers_leap.png',
  // "Let others find you" — presence, out in the world, findable.
  'kyc-8-presence': 'white_themes/portrait_art/street_food_vendors.png',
  // "What best describes you?" — work and craft.
  'kyc-9-role': 'white_themes/portrait_art/harvesting_grape_clusters.png',
  // "When are you free?" — a standing evening plan.
  'kyc-10-calendar': 'white_themes/portrait_art/movie_night_under_stars.png',
  // "You're live." — arrival.
  'kyc-done': 'white_themes/portrait_art/marathon_high_five.png',
  // Paused gets NO plate. It is the one blue screen in the flow, a white-ground
  // engraving would fight it, and the bareness is the point.
};

// The onboarding column renders at ~572 CSS px — half the marketing set's slot
// — and the masters are only 1103px wide, so native is barely 2x anyway. 900
// q86 is 1.6x at render size and holds the stipple under magnification well
// past how it is ever displayed; it costs 476KB a plate against 877KB native.
// Eleven plates is the difference between 5MB and 9MB of committed art, which
// is worth the 0.4x. Below ~q84 the dither starts to bleed — that is the floor.
const KYC_ENCODE = { width: 900, quality: 86 };

// A second, smaller source for the stacked layout. Below 1120 the plate is a
// BANNER — full-bleed but only ~180px tall — so it needs a fraction of the
// pixels, and mobile is exactly where paying 480KB a step is least acceptable.
// The browser picks between them via srcset.
const KYC_ENCODE_SM = { width: 640, quality: 82, suffix: '-sm' };

const KB = (bytes) => (bytes / 1024).toFixed(0) + ' KB';

async function encode(srcAbs, outAbs, { width = 1280, quality = 94 } = {}) {
  await mkdir(path.dirname(outAbs), { recursive: true });
  const before = (await stat(srcAbs)).size;
  await sharp(srcAbs).resize(width, null, { withoutEnlargement: true }).webp({ quality, effort: 6 }).toFile(outAbs);
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
  const kycOnly = process.argv.includes('--kyc');
  console.log(`\nOptimizing illustrations -> WebP  (${all ? 'ALL' : kycOnly ? 'KYC' : 'selection + KYC'})\n`);

  const marketing = Object.entries(SELECTION).map(([slot, rel]) => [
    path.join(SRC, rel),
    path.join(OUT, `${slot}.webp`),
    {},
  ]);
  const kyc = Object.entries(KYC_SELECTION).flatMap(([slot, rel]) => [
    [path.join(SRC, rel), path.join(OUT, 'kyc', `${slot}.webp`), KYC_ENCODE],
    [path.join(SRC, rel), path.join(OUT, 'kyc', `${slot}${KYC_ENCODE_SM.suffix}.webp`), KYC_ENCODE_SM],
  ]);

  const pairs = all
    ? (await collectAll()).map(([s, o]) => [s, o, {}])
    : kycOnly
      ? kyc
      : [...marketing, ...kyc];

  for (const [srcAbs, outAbs, opts] of pairs) {
    try {
      await encode(srcAbs, outAbs, opts);
    } catch (err) {
      console.error(`  ! failed: ${srcAbs}\n    ${err.message}`);
    }
  }
  console.log(`\nDone. ${pairs.length} file(s) -> ${path.relative(ROOT, OUT)}\n`);
}

main();
