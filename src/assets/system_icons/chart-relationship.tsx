/**
 * chart-relationship — GENERATED from Figma node 644:15553. Do not edit.
 *
 * Sidebar feed / Insights. Replaces analytics-01, which was a guess.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function ChartRelationshipIcon({ size = 16, strokeWidth, className }: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-0.8334 -0.8334 16 16"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6.5 2.5L11.1667 2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.83333 5.83333L8.83333 8.83333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 6.5L2.5 11.1667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="3.46296" cy="3.46296" r="2.96296" stroke="currentColor"/>
      <circle cx="2.5" cy="12.5" r="1.33333" stroke="currentColor"/>
      <circle cx="9.83333" cy="9.83333" r="1.33333" stroke="currentColor"/>
      <circle cx="12.5" cy="2.5" r="1.33333" stroke="currentColor"/>
    </svg>
  );
}

/** The size this icon is DRAWN at in Figma — 16, 20 or 32. One viewBox unit is
 *  one pixel at this size, so Icon only has to rescale when a caller asks for
 *  something else. */
ChartRelationshipIcon.grid = 16;

/** Figma's Weight variant, in pixels. The library ships 1px and 2px; this is
 *  the drawn weight, not a target we compute. */
ChartRelationshipIcon.weight = 1;
