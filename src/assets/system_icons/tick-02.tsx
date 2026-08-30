/**
 * tick-02 — GENERATED from Figma node 671:457. Do not edit.
 *
 * The mark inside a selected Check, placed at 12. Figma description: accept, tick, done.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function Tick02Icon({ size = 16, strokeWidth, className }: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-4 -4.75 16 16"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M0.5 4.25L2.25 6L7.5 0.500001" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** The size this icon is DRAWN at in Figma — 16, 20 or 32. One viewBox unit is
 *  one pixel at this size, so Icon only has to rescale when a caller asks for
 *  something else. */
Tick02Icon.grid = 16;

/** Figma's Weight variant, in pixels. The library ships 1px and 2px; this is
 *  the drawn weight, not a target we compute. */
Tick02Icon.weight = 1;
