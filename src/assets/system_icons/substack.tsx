/**
 * substack — GENERATED from Figma node 705:28. Do not edit.
 *
 * HugeIcons pro — absent from the free package. Exactly why these are local.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function SubstackIcon({ size = 16, strokeWidth, className }: {
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
      <path d="M2.45819 1.66736H13.5415M2.45819 4.83403H13.5415M2.45819 8.00069H13.5415V14.334L7.99986 11.1674L2.45819 14.334V8.00069Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** The size this icon is DRAWN at in Figma — 16, 20 or 32. One viewBox unit is
 *  one pixel at this size, so Icon only has to rescale when a caller asks for
 *  something else. */
SubstackIcon.grid = 16;

/** Figma's Weight variant, in pixels. The library ships 1px and 2px; this is
 *  the drawn weight, not a target we compute. */
SubstackIcon.weight = 1;
