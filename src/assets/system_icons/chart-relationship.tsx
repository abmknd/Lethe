/**
 * chart-relationship — GENERATED from Figma node 695:81342. Do not edit.
 *
 * Sidebar feed / Insights. Replaces analytics-01, which was a guess.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function ChartRelationshipIcon({ size = 20, strokeWidth, className }: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-1.1667 -1.1667 20 20"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M8 3L13.8333 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.16667 7.16667L10.9167 10.9167" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 8L3 13.8333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="4.2037" cy="4.2037" r="3.7037" stroke="currentColor"/>
      <circle cx="3" cy="15.5" r="1.66667" stroke="currentColor"/>
      <circle cx="12.1667" cy="12.1667" r="1.66667" stroke="currentColor"/>
      <circle cx="15.5" cy="3" r="1.66667" stroke="currentColor"/>
    </svg>
  );
}

/** The size this icon is DRAWN at in Figma — 16, 20 or 32. One viewBox unit is
 *  one pixel at this size, so Icon only has to rescale when a caller asks for
 *  something else. */
ChartRelationshipIcon.grid = 20;

/** Figma's Weight variant, in pixels. The library ships 1px and 2px; this is
 *  the drawn weight, not a target we compute. */
ChartRelationshipIcon.weight = 1;
