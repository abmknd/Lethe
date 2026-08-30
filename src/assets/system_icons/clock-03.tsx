/**
 * clock-03 — GENERATED from Figma node 694:20702. Do not edit.
 *
 * Sidebar feed / Activity. Replaces flash, which was a substitution I made because I could not find a pulse glyph. The file never wanted one.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function Clock03Icon({ size = 20, strokeWidth, className }: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-1.1666 -1.1666 20 20"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M14.6269 6.00557L16.7187 5.87823C15.2193 1.92074 10.9144 -0.33331 6.71719 0.787383C2.24685 1.98102 -0.408452 6.55099 0.786416 10.9947C1.98128 15.4384 6.57385 18.0731 11.0442 16.8795C14.3634 15.9932 16.6819 13.2456 17.1669 10.0704" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.83352 5.5001V8.83343L10.5002 10.5001" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** The size this icon is DRAWN at in Figma — 16, 20 or 32. One viewBox unit is
 *  one pixel at this size, so Icon only has to rescale when a caller asks for
 *  something else. */
Clock03Icon.grid = 20;

/** Figma's Weight variant, in pixels. The library ships 1px and 2px; this is
 *  the drawn weight, not a target we compute. */
Clock03Icon.weight = 1;
