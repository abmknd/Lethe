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
      viewBox="0 0 16 16"
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

/** The grid this icon is DRAWN on, which is not always 24 — Figma exports an
 *  instance at its placed size. The Icon wrapper needs it to turn a target
 *  stroke in screen pixels into the viewBox-unit attribute. */
PlusSignIcon.grid = 16;
