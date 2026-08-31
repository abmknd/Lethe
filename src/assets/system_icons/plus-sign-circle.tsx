/**
 * plus-sign-circle — GENERATED from Figma node 671:1859. Do not edit.
 *
 * Sidebar communities / Start a community.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function PlusSignCircleIcon({ size = 16, strokeWidth, className }: {
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
      <path d="M7.16667 4.5V9.83333M9.83333 7.16667H4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="7.16667" cy="7.16667" r="6.66667" stroke="currentColor"/>
    </svg>
  );
}

/** The size this icon is DRAWN at in Figma — 16, 20 or 32. One viewBox unit is
 *  one pixel at this size, so Icon only has to rescale when a caller asks for
 *  something else. */
PlusSignCircleIcon.grid = 16;

/** Figma's Weight variant, in pixels. The library ships 1px and 2px; this is
 *  the drawn weight, not a target we compute. */
PlusSignCircleIcon.weight = 1;
