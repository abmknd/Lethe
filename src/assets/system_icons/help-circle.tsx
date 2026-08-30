/**
 * help-circle — GENERATED from Figma node 671:157. Do not edit.
 *
 * Label and Placeholder. Figma description: question, information.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function HelpCircleIcon({ size = 16, strokeWidth, className }: {
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
      <circle cx="7.16667" cy="7.16667" r="6.66667" stroke="currentColor"/>
      <path d="M5.83317 5.1665C5.83317 4.43012 6.43012 3.83317 7.1665 3.83317C7.90288 3.83317 8.49984 4.43012 8.49984 5.1665C8.49984 5.43194 8.42227 5.67926 8.28858 5.88703C7.89011 6.50629 7.1665 7.09679 7.1665 7.83317V8.1665" stroke="currentColor" strokeLinecap="round"/>
      <path d="M7.16117 10.4998H7.16715" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** The size this icon is DRAWN at in Figma — 16, 20 or 32. One viewBox unit is
 *  one pixel at this size, so Icon only has to rescale when a caller asks for
 *  something else. */
HelpCircleIcon.grid = 16;

/** Figma's Weight variant, in pixels. The library ships 1px and 2px; this is
 *  the drawn weight, not a target we compute. */
HelpCircleIcon.weight = 1;
