/**
 * compass — GENERATED from Figma node 671:1954. Do not edit.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function CompassIcon({ size = 20, strokeWidth, className }: {
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
      <path d="M6.66683 6.66797L3.3335 14.668M9.3335 6.66797L12.6668 14.668" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 2.66536L8 1.33203" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8" cy="4.66797" r="2" stroke="currentColor"/>
      <path d="M2 8.66797C3.32716 10.6841 5.51979 12.0013 8 12.0013C10.4802 12.0013 12.6728 10.6841 14 8.66797" stroke="currentColor" strokeLinecap="round"/>
      <path d="M8 11.332V12.6654" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** The grid this icon is DRAWN on, which is not always 24 — Figma exports an
 *  instance at its placed size. The Icon wrapper needs it to turn a target
 *  stroke in screen pixels into the viewBox-unit attribute. */
CompassIcon.grid = 20;
