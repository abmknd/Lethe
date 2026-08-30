/**
 * plus-sign-circle — GENERATED from Figma node 695:34482. Do not edit.
 *
 * Sidebar communities / Start a community.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function PlusSignCircleIcon({ size = 20, strokeWidth, className }: {
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
      <path d="M8.83333 5.5V12.1667M12.1667 8.83333H5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8.83333" cy="8.83333" r="8.33333" stroke="currentColor"/>
    </svg>
  );
}

/** The size this icon is DRAWN at in Figma — 16, 20 or 32. One viewBox unit is
 *  one pixel at this size, so Icon only has to rescale when a caller asks for
 *  something else. */
PlusSignCircleIcon.grid = 20;

/** Figma's Weight variant, in pixels. The library ships 1px and 2px; this is
 *  the drawn weight, not a target we compute. */
PlusSignCircleIcon.weight = 1;
