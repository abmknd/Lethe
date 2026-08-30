/**
 * cancel-01 — GENERATED from Figma node 671:132. Do not edit.
 *
 * The remove affordance on Tag, Badge Text and an active Chip, placed at 12. Figma description: delete, remove.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function Cancel01Icon({ size = 16, strokeWidth, className }: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-4 -4 16 16"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M7.5 0.5L0.5 7.5M0.5 0.5L7.5 7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** The size this icon is DRAWN at in Figma — 16, 20 or 32. One viewBox unit is
 *  one pixel at this size, so Icon only has to rescale when a caller asks for
 *  something else. */
Cancel01Icon.grid = 16;

/** Figma's Weight variant, in pixels. The library ships 1px and 2px; this is
 *  the drawn weight, not a target we compute. */
Cancel01Icon.weight = 1;
