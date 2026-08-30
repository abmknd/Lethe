/**
 * plus-sign-circle — GENERATED from Figma node 695:34482. Do not edit.
 *
 * Sidebar communities / Start a community.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function PlusSignCircleIcon({ size = 20, strokeWidth, className }: {
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
      <path d="M8.83333 5.5V12.1667M12.1667 8.83333H5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8.83333" cy="8.83333" r="8.33333" stroke="currentColor"/>
    </svg>
  );
}

/** The grid this icon is DRAWN on, which is not always 24 — Figma exports an
 *  instance at its placed size. The Icon wrapper needs it to turn a target
 *  stroke in screen pixels into the viewBox-unit attribute. */
PlusSignCircleIcon.grid = 20;
