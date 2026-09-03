/**
 * search — GENERATED from Figma node 671:2134. Do not edit.
 *
 * search-bar. Figma MIRRORS it (-scale-x-100); the flip is applied at the call site, not baked in.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function SearchIcon({ size = 16, strokeWidth, className }: {
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
      <path d="M3.5 10.8333L0.5 13.8333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.83333 6.5C1.83333 3.18629 4.51963 0.5 7.83333 0.5C11.147 0.5 13.8333 3.18629 13.8333 6.5C13.8333 9.81371 11.147 12.5 7.83333 12.5C4.51963 12.5 1.83333 9.81371 1.83333 6.5Z" stroke="currentColor" strokeLinejoin="round"/>
    </svg>
  );
}

/** The size this icon is DRAWN at in Figma — 16, 20 or 32. One viewBox unit is
 *  one pixel at this size, so Icon only has to rescale when a caller asks for
 *  something else. */
SearchIcon.grid = 16;

/** Figma's Weight variant, in pixels. The library ships 1px and 2px; this is
 *  the drawn weight, not a target we compute. */
SearchIcon.weight = 1;
