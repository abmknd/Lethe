/**
 * searching — GENERATED from Figma node 694:39590. Do not edit.
 *
 * Sidebar feed / Explore. Replaces compass, which was a guess.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function SearchingIcon({ size = 20, strokeWidth, className }: {
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
      <path d="M2.16667 6.33333C1.75896 6.3024 1.47438 6.23277 1.24072 6.07598C1.05873 5.95386 0.902482 5.79695 0.780885 5.61419C0.500001 5.19204 0.500001 4.60437 0.500001 3.42903C0.500001 2.25368 0.500001 1.66601 0.780885 1.24386C0.902482 1.0611 1.05873 0.904187 1.24072 0.782075C1.66109 0.500001 2.24628 0.500001 3.41667 0.500001H14.25C15.4204 0.500001 16.0056 0.500001 16.426 0.782075C16.6079 0.904187 16.7642 1.0611 16.8858 1.24386C17.1667 1.66601 17.1667 2.25368 17.1667 3.42903C17.1667 4.50214 17.1667 5.08536 16.9529 5.5" stroke="currentColor" strokeLinecap="round"/>
    </svg>
  );
}

/** The grid this icon is DRAWN on, which is not always 24 — Figma exports an
 *  instance at its placed size. The Icon wrapper needs it to turn a target
 *  stroke in screen pixels into the viewBox-unit attribute. */
SearchingIcon.grid = 20;
