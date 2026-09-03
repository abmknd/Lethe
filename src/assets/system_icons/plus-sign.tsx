/**
 * plus-sign — GENERATED from Figma node 671:1966. Do not edit.
 *
 * The `who-to-follow` Badge Button and the Matches invite bar. Placed at 16, not 18.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function PlusSignIcon({ size = 16, strokeWidth, className }: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-2.1666 -2.1666 16 16"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5.83333 0.5V11.1667M11.1667 5.83333H0.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** The size this icon is DRAWN at in Figma — 16, 20 or 32. One viewBox unit is
 *  one pixel at this size, so Icon only has to rescale when a caller asks for
 *  something else. */
PlusSignIcon.grid = 16;

/** Figma's Weight variant, in pixels. The library ships 1px and 2px; this is
 *  the drawn weight, not a target we compute. */
PlusSignIcon.weight = 1;
