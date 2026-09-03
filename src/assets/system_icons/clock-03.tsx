/**
 * clock-03 — GENERATED from Figma node 671:505. Do not edit.
 *
 * Sidebar feed / Activity. Replaces flash, which was a substitution I made because I could not find a pulse glyph. The file never wanted one.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function Clock03Icon({ size = 16, strokeWidth, className }: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-0.8332 -0.8332 16 16"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M11.8015 4.90448L13.475 4.8026C12.2754 1.63661 8.83152 -0.166629 5.47379 0.729925C1.89752 1.68483 -0.226724 5.34081 0.729171 8.89578C1.68507 12.4507 5.35912 14.5585 8.93539 13.6036C11.5907 12.8946 13.4456 10.6965 13.8335 8.15635" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.16686 4.5001V7.16676L8.50019 8.5001" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** The size this icon is DRAWN at in Figma — 16, 20 or 32. One viewBox unit is
 *  one pixel at this size, so Icon only has to rescale when a caller asks for
 *  something else. */
Clock03Icon.grid = 16;

/** Figma's Weight variant, in pixels. The library ships 1px and 2px; this is
 *  the drawn weight, not a target we compute. */
Clock03Icon.weight = 1;
