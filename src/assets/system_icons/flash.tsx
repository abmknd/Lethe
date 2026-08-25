/**
 * flash — GENERATED from Figma node 671:1438. Do not edit.
 *
 * Regenerate: node scripts/import-figma-icons.mjs
 */
export function FlashIcon({ size = 20, strokeWidth, className }: {
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
      <path d="M3.484 7.55166L8.1495 1.56304C8.51438 1.09468 9.1983 1.38619 9.1983 2.01008V6.64533C9.1983 7.01905 9.46651 7.32201 9.79737 7.32201H12.0666C12.5821 7.32201 12.8569 8.00861 12.5163 8.44574L7.85082 14.4344C7.48594 14.9027 6.80203 14.6112 6.80203 13.9873V9.35207C6.80203 8.97835 6.53382 8.67538 6.20296 8.67538H3.93373C3.41824 8.67538 3.14345 7.98879 3.484 7.55166Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** The grid this icon is DRAWN on, which is not always 24 — Figma exports an
 *  instance at its placed size. The Icon wrapper needs it to turn a target
 *  stroke in screen pixels into the viewBox-unit attribute. */
FlashIcon.grid = 20;
