/**
 * Bring icons out of Figma and into the repo, as components.
 *
 * WHY LOCAL RATHER THAN A PACKAGE. The Figma file is the source of truth, and
 * it is mixed: HugeIcons free, HugeIcons pro, and some flattened lucide
 * vectors left over from earlier iterations. A package covers exactly one of
 * those three, so every new screen carries a fresh chance of "this one is not
 * in the package" — which is the interruption this exists to remove. Exported
 * icons make provenance stop mattering: pro, free or leftover, they are all
 * just an SVG that matches the design.
 *
 * WHAT IT DOES. Figma's node export carries the icon's own geometry in the
 * right coordinates, plus every ancestor's background as fill-only rects and
 * paths. The library is drawn STROKES-ONLY, so the separation is exact:
 *
 *     keep every element with a stroke, drop every element without one
 *
 * Then the hardcoded stroke colour becomes `currentColor` so a token decides
 * it, and the width is dropped so `Icon` can set it per redesign.md 5.5.1.
 *
 * USAGE
 *   1. Add entries to icons.manifest.json: { name, nodeId, size }
 *   2. Get fresh URLs — Figma asset URLs expire in about seven days:
 *        download_assets(fileKey, nodeId, defaultFormat: 'svg')  -> export.url
 *      and put the url on the entry.
 *   3. node scripts/import-figma-icons.mjs
 *
 * Everything under src/assets/system_icons is GENERATED. Never hand-edit it;
 * if an icon is wrong, it is wrong in Figma.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src/assets/system_icons');
const MANIFEST = path.join(ROOT, 'scripts/icons.manifest.json');

const SHAPES = 'path|circle|line|rect|ellipse|polyline|polygon';

/** kebab-case -> PascalCase + Icon. `cancel-01` -> `Cancel01Icon`. */
export const componentName = (name) =>
  name
    .trim()
    .split(/[-_\s]+/)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('') + 'Icon';

/**
 * Strip a Figma export down to the icon.
 *
 * Returns the stroke-bearing elements with colour and width normalised, or
 * throws — a silent empty icon is worse than a failed build, because it ships.
 */
export function extractGlyph(svg, name, size) {
  const shapes = svg.match(new RegExp(`<(?:${SHAPES})\\b[^>]*/>`, 'g')) ?? [];

  // Strokes-only is necessary but not sufficient: a CARD BORDER is stroked
  // too, and the export carries every ancestor's. `location-09` came through
  // with the profile card's rounded rectangle attached — a path running from
  // -112 to 488 inside a 20px icon.
  //
  // So also require the geometry to live in the icon's own box. Generous
  // bounds, because round caps and control points legitimately sit slightly
  // outside it; chrome misses by hundreds of units, not fractions.
  const inBounds = (el) => {
    const d = /\bd="([^"]*)"/.exec(el)?.[1];
    if (!d) return true;
    const nums = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    if (nums.length === 0) return true;
    return Math.min(...nums) >= -size && Math.max(...nums) <= size * 2;
  };

  const stroked = shapes.filter((el) => /stroke="(?!none)[^"]+"/.test(el) && inBounds(el));

  if (stroked.length === 0) {
    throw new Error(
      `${name}: no stroke-bearing elements. Either the export is empty or this ` +
        `icon is filled rather than stroked, which this importer does not handle.`,
    );
  }

  return stroked
    .map((el) =>
      el
        // A token decides the colour, never the file.
        .replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"')
        // Width is set by Icon from the rendered size, so drop the baked one.
        .replace(/\s*stroke-width="[^"]*"/g, '')
        // Figma layer ids are noise in a committed component.
        .replace(/\s*id="[^"]*"/g, '')
        .replace(/([a-z])-([a-z])/g, (m, a, b) => a + b.toUpperCase()),
    )
    .join('\n      ');
}

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
mkdirSync(OUT, { recursive: true });

const built = [];
const skipped = [];

for (const entry of manifest.icons) {
  const { name, size = 16, url, note } = entry;
  if (!url) {
    skipped.push(`${name} (no url — re-run download_assets)`);
    continue;
  }

  const res = await fetch(url);
  if (!res.ok) {
    skipped.push(`${name} (${res.status} — url probably expired)`);
    continue;
  }
  const raw = await res.text();

  let glyph;
  try {
    glyph = extractGlyph(raw, name, size);
  } catch (err) {
    skipped.push(err.message);
    continue;
  }

  const comp = componentName(name);
  const file = `/**
 * ${name} — GENERATED from Figma node ${entry.nodeId}. Do not edit.
 *${note ? `\n * ${note}\n *` : ''}
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function ${comp}({ size = ${size}, strokeWidth, className }: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 ${size} ${size}"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      ${glyph}
    </svg>
  );
}

/** The grid this icon is DRAWN on, which is not always 24 — Figma exports an
 *  instance at its placed size. The Icon wrapper needs it to turn a target
 *  stroke in screen pixels into the viewBox-unit attribute. */
${comp}.grid = ${size};
`;
  writeFileSync(path.join(OUT, `${name}.tsx`), file);
  built.push({ name, comp });
}

// One barrel, so a screen imports by name and nothing reaches into the folder.
const index = `/**
 * The Relethe icon set, exported from Figma. GENERATED — do not edit.
 *
 * Every icon on a screen comes from here. See scripts/import-figma-icons.mjs
 * for why these are local rather than an npm dependency, and how to add one.
 */
${built.map((b) => `export { ${b.comp} } from './${b.name}';`).join('\n')}
`;
writeFileSync(path.join(OUT, 'index.ts'), index);

console.log(`built ${built.length} icons`);
for (const b of built) console.log(`    ${b.comp.padEnd(22)} ${b.name}`);
if (skipped.length) {
  console.log(`\nSKIPPED ${skipped.length}:`);
  for (const s of skipped) console.log(`    ${s}`);
  process.exitCode = 1;
}
