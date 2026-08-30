/**
 * favourite — GENERATED from Figma node 671:214. Do not edit.
 *
 * post action-bar / Like. The 16px variant, which is what the frame places. Figma description: love, heart, save.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function FavouriteIcon({ size = 16, strokeWidth, className }: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-0.8336 -1.4999 16 16"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12.1414 1.16298C10.3537 0.0663597 8.79333 0.508283 7.85597 1.21222C7.47164 1.50085 7.27947 1.64516 7.16641 1.64516C7.05334 1.64516 6.86117 1.50085 6.47684 1.21222C5.53949 0.508283 3.97913 0.0663597 2.19137 1.16298C-0.154881 2.60216 -0.685779 7.35011 4.72609 11.3558C5.75689 12.1187 6.27228 12.5002 7.16641 12.5002C8.06053 12.5002 8.57593 12.1187 9.60672 11.3558C15.0186 7.35011 14.4877 2.60216 12.1414 1.16298Z" stroke="currentColor" strokeLinecap="round"/>
    </svg>
  );
}

/** The size this icon is DRAWN at in Figma — 16, 20 or 32. One viewBox unit is
 *  one pixel at this size, so Icon only has to rescale when a caller asks for
 *  something else. */
FavouriteIcon.grid = 16;

/** Figma's Weight variant, in pixels. The library ships 1px and 2px; this is
 *  the drawn weight, not a target we compute. */
FavouriteIcon.weight = 1;
