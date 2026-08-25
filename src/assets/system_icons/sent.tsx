/**
 * sent — GENERATED from Figma node 644:16954. Do not edit.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function SentIcon({ size = 20, strokeWidth, className }: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M14.0317 2.03463C12.5796 0.470924 1.65749 4.30148 1.66651 5.70002C1.67673 7.28593 5.9319 7.77383 7.11132 8.10472C7.82056 8.3037 8.01052 8.50765 8.17406 9.2514C8.91472 12.6197 9.28658 14.295 10.1341 14.3324C11.485 14.3921 15.4487 3.56068 14.0317 2.03463Z" stroke="currentColor"/>
      <path d="M7.6665 8.33333L9.99984 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** The grid this icon is DRAWN on, which is not always 24 — Figma exports an
 *  instance at its placed size. The Icon wrapper needs it to turn a target
 *  stroke in screen pixels into the viewBox-unit attribute. */
SentIcon.grid = 20;
