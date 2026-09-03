/**
 * female-symbol — GENERATED from Figma node 767:2841. Do not edit.
 *
 * `gender` Type=Woman. The component places 16, not 20.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function FemaleSymbolIcon({ size = 16, strokeWidth, className }: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-3.5 -0.8334 16 16"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4.5 8.5C6.70913 8.5 8.5 6.70913 8.5 4.5C8.5 2.29086 6.70913 0.5 4.5 0.5C2.29086 0.5 0.5 2.29086 0.5 4.5C0.5 6.70913 2.29086 8.5 4.5 8.5ZM4.5 8.5V13.8333M2.5 11.8333H6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** The size this icon is DRAWN at in Figma — 16, 20 or 32. One viewBox unit is
 *  one pixel at this size, so Icon only has to rescale when a caller asks for
 *  something else. */
FemaleSymbolIcon.grid = 16;

/** Figma's Weight variant, in pixels. The library ships 1px and 2px; this is
 *  the drawn weight, not a target we compute. */
FemaleSymbolIcon.weight = 1;
