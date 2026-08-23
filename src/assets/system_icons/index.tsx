/**
 * Icons EXPORTED FROM FIGMA, because the library cannot supply them.
 *
 * Everything else comes from `@hugeicons/core-free-icons` via the `Icon`
 * wrapper — see src/rebrand/app/Icon.tsx. Only three kinds of icon land here:
 *
 *   1. PRO-ONLY. `substack` exists in the Figma file but not in the free
 *      package, which is the first real free-vs-pro coverage hit.
 *   2. NOT HUGEICONS. The header bell and envelope are flattened lucide
 *      vectors pasted into the file, not HugeIcons instances — their layers
 *      are unnamed `Icon` frames, so there is no library name to resolve.
 *      They should be replaced with HugeIcons instances in Figma, at which
 *      point these two can be deleted.
 *   3. Genuinely bespoke Relethe marks. None yet.
 *
 * The path data is the exact Figma export, transcribed rather than redrawn, so
 * the geometry is the designer's. Two things are normalised: the hardcoded
 * stroke colour becomes `currentColor` so a token decides it, and the width
 * follows redesign.md 5.5.1 (1px rendered at 16) rather than the file's 1.25.
 */

type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'none' as const,
  'aria-hidden': true,
});

/** Figma `Button - Notifications` › Icon (613:2659). Lucide bell, 16 grid. */
export function NotificationIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M12 5.33333C12 4.27247 11.5786 3.25505 10.8284 2.50491C10.0783 1.75476 9.06087 1.33333 8 1.33333C6.93913 1.33333 5.92172 1.75476 5.17157 2.50491C4.42143 3.25505 4 4.27247 4 5.33333C4 10 2 11.3333 2 11.3333H14C14 11.3333 12 10 12 5.33333Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.13333 14C9.01376 14.1929 8.8469 14.3522 8.64857 14.4626C8.45023 14.573 8.227 14.631 8 14.631C7.773 14.631 7.54977 14.573 7.35143 14.4626C7.1531 14.3522 6.98624 14.1929 6.86667 14"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma `Button - Messages` › Icon (613:2664). Lucide envelope, 16 grid. */
export function MailIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M12.6667 3.33333H3.33333C2.59695 3.33333 2 3.93029 2 4.66667V11.3333C2 12.0697 2.59695 12.6667 3.33333 12.6667H12.6667C13.403 12.6667 14 12.0697 14 11.3333V4.66667C14 3.93029 13.403 3.33333 12.6667 3.33333Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 4.66667L8 8.66667L14 4.66667"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Figma `substack` (705:28). HugeIcons pro — absent from the free package.
 *
 * The export is the inner element crop, so it carries its own 12.083 x 13.667
 * box. The translate puts it back where the 16 grid has it: the instance sets
 * insets of 15.36% horizontally and 10.42% vertically, which lands the content
 * at x 2.458 and y 1.667, and the path starts at 0.5 inside its own box.
 */
export function SubstackIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <g transform="translate(1.958 1.167)">
        <path
          d="M0.5 0.5H11.5833M0.5 3.66667H11.5833M0.5 6.83333H11.5833V13.1667L6.04167 10L0.5 13.1667V6.83333Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
