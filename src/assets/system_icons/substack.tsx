/**
 * substack — GENERATED from Figma node 707:3. Do not edit.
 *
 * socials-section Badge Button. HugeIcons pro — absent from the free package. Exactly why these are local.
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
      viewBox="-1.9584 -1.1666 16 16"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M0.5 0.5H11.5833M0.5 3.66667H11.5833M0.5 6.83333H11.5833V13.1667L6.04167 10L0.5 13.1667V6.83333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
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
