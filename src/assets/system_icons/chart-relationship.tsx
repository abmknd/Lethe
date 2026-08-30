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
      viewBox="0 0 20 20"
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

/** The grid this icon is DRAWN on, which is not always 24 — Figma exports an
 *  instance at its placed size. The Icon wrapper needs it to turn a target
 *  stroke in screen pixels into the viewBox-unit attribute. */
ChartRelationshipIcon.grid = 20;
