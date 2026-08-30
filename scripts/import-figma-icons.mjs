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
 * paths. The separation is a GROUP, not a paint:
 *
 *     keep everything inside <g id="elements">, drop everything outside it
 *
 * Every icon in this library nests its geometry under a layer named `elements`
 * and nothing else does, so the group is an exact boundary.
 *
 * THIS REPLACES A STROKES-ONLY RULE THAT SILENTLY LOST GEOMETRY. The old rule
 * was "keep stroked elements, drop unstroked ones", on the belief that the
 * library is drawn strokes-only. It is not: several glyphs ship one or more
 * parts as an EXPANDED OUTLINE — a filled path whose shape already encodes the
 * stroke. `searching` is the clearest case. It has two paths, a filled
 * magnifier and a stroked rectangle, and the old rule kept only the rectangle,
 * so Explore rendered as a stray box. A dropped path is invisible in a diff and
 * only shows up as an icon that looks wrong, which is exactly how it survived.
 *
 * Then the hardcoded colour becomes `currentColor` — on BOTH paints, since
 * either may be carrying the glyph — and the stroke width is dropped so `Icon`
 * can set it per redesign.md 5.5.1. A filled path ignores stroke-width, so
 * mixed icons come out right without special-casing.
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

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
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
  // The icon's geometry is exactly the contents of the `elements` group. What
  // sits outside it is ancestor chrome: `location-09` once came through with the
  // profile card's rounded rectangle attached, a path running from -112 to 488
  // inside a 20px icon.
  const group = /<g\b[^>]*\bid="elements"[^>]*>([\s\S]*?)<\/g>/.exec(svg)?.[1];
  if (!group) {
    throw new Error(
      `${name}: no <g id="elements"> in the export. Either the node is not an ` +
        `icon from this library or its structure changed — check it in Figma ` +
        `rather than loosening this.`,
    );
  }

  // Self-closing and paired forms both appear.
  const shapes =
    group.match(new RegExp(`<(?:${SHAPES})\\b[^>]*(?:/>|>[\\s\\S]*?</(?:${SHAPES})>)`, 'g')) ?? [];

  if (shapes.length === 0) {
    throw new Error(`${name}: the elements group is empty.`);
  }

  return shapes
    .map((el) =>
      el
        // A token decides the colour, never the file. BOTH paints are rewritten:
        // a glyph part may arrive as a stroke or as an expanded fill, and which
        // one it is is not something a call site should have to know.
        .replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"')
        .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"')
        // Width is set by Icon from the rendered size, so drop the baked one.
        // Harmless on a filled path, which ignores it.
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

// THE MANIFEST IS THE SET. Anything generated by an earlier run whose entry has
// since been removed is deleted here, so a glyph that turned out to be the wrong
// one cannot linger and be imported again by mistake. Nine did: `compass` for
// Explore, `flash` for Activity, and seven `-01` variants where the file draws
// the `-02`.
const dropped = [];
for (const file of readdirSync(OUT)) {
  if (!file.endsWith('.tsx')) continue;
  if (manifest.icons.some((i) => `${i.name}.tsx` === file)) continue;
  rmSync(path.join(OUT, file));
  dropped.push(file.replace(/\.tsx$/, ''));
}

// One barrel, so a screen imports by name and nothing reaches into the folder.
//
// Built FROM DISK rather than from this run's successes. Figma asset URLs expire
// in about a week, so a partial refresh is the normal case: re-running to add
// two icons should not silently drop the thirty whose URLs have gone stale but
// whose committed components are perfectly good.
const exported = manifest.icons
  .filter((i) => existsSync(path.join(OUT, `${i.name}.tsx`)))
  .map((i) => ({ name: i.name, comp: componentName(i.name) }));

const index = `/**
 * The Relethe icon set, exported from Figma. GENERATED — do not edit.
 *
 * Every icon on a screen comes from here. See scripts/import-figma-icons.mjs
 * for why these are local rather than an npm dependency, and how to add one.
 */
${exported.map((b) => `export { ${b.comp} } from './${b.name}';`).join('\n')}
`;
writeFileSync(path.join(OUT, 'index.ts'), index);

console.log(`built ${built.length}, exported ${exported.length}`);
for (const b of built) console.log(`    ${b.comp.padEnd(26)} ${b.name}`);
if (dropped.length) {
  console.log(`\nDROPPED ${dropped.length} (no longer in the manifest):`);
  for (const d of dropped) console.log(`    ${d}`);
}
if (skipped.length) {
  console.log(`\nSKIPPED ${skipped.length}:`);
  for (const s of skipped) console.log(`    ${s}`);
  process.exitCode = 1;
}
