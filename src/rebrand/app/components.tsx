import type { ComponentType, ReactNode } from 'react';
import { Icon } from './Icon';

/**
 * FIGMA'S COMPONENTS, AS COMPONENTS.
 *
 * Everything here is read out of the file with `get_design_context` — real CSS
 * and real exported assets — rather than inferred from a frame's geometry. The
 * previous pass did the latter and the result was a shell that measured right
 * and looked wrong: the nav buttons had the incorrect border token, the tags had
 * the incorrect fill, the section labels were 13px medium where the file says
 * 12px regular, and the logo was seven circles I drew myself.
 *
 * The rule that follows from that, and it is not negotiable: an icon or a mark
 * is RENDERED FROM ITS EXPORT. Nothing in this file draws a path.
 *
 * Node ids are recorded per component so the next person can re-read the source
 * instead of re-deriving it.
 */

// ---------------------------------------------------------------- type scale
//
// Figma's text styles, spelled once. These are the exact four that the app
// surfaces use; the names are the file's own so a style in Figma and a constant
// here are the same fact.

/** Title 1 — 20/24 Medium. Card headings. */
export const TITLE_1 = 'text-[20px] font-medium leading-[24px]';
/** Title 3 — 16/20 Medium. The active nav item. */
export const TITLE_3 = 'text-[16px] font-medium leading-[20px]';
/** Title 4B — 14/20 Medium. A person's name in a list row. */
export const TITLE_4B = 'text-[14px] font-medium leading-[20px]';
/** Body 3A — 16/20 Regular. Body copy, nav items, the search placeholder. */
export const BODY_3A = 'text-[16px] font-normal leading-[20px]';
/** Body 4A — 14/20 Regular. A handle under a name. */
export const BODY_4A = 'text-[14px] font-normal leading-[20px]';
/** Body 4B — 14/16 Regular. Tag and Button Text labels. */
export const BODY_4B = 'text-[14px] font-normal leading-[16px]';
/** Body 5A — 13/16 Regular. The trailing half of an endorsement line. */
export const BODY_5A = 'text-[13px] font-normal leading-[16px]';
/** Body 5B — 13/16 Light. `location-meta`, the signal subtitle. */
export const BODY_5B = 'text-[13px] font-light leading-[16px]';
/** Title 6 — 12/16 Regular. Section labels and Badge Text. */
export const TITLE_6 = 'text-[12px] font-normal leading-[16px]';
/** Button 2A — 14/16 Medium, tracking 0, uppercase. Every Button label. */
export const BUTTON_2A = 'text-[14px] font-medium uppercase leading-[16px] tracking-[0px]';

// The logo lives in ../brand.tsx as `Brandmark`, next to the seven other marks
// already in src/assets/logos. Figma's app header is `relethe-logos` on
// `Property 1=brandmark_blue`, so that is the file the header reaches for. The
// hand-drawn seven-circle mark that used to sit here is gone.

// ---------------------------------------------------------------- button
//
// `Button` 767:3012. btn-content is px-12 py-8 on a 240 radius, which is where
// the 32 height and the 70px INVITE come from — not a fixed width.
//
// The set has 72 variants over size x style x tone. These four are the ones the
// app surfaces place; the rest are drawn but unplaced, and building all 72
// before a screen asks for one is how a library fills with code nothing imports.

/**
 * FIGMA STROKES ARE INSIDE THE SHAPE, and CSS borders are not.
 *
 * `Button` is 32 tall in the file with a 1.5px stroke and 8/12 padding: 8 + 16 +
 * 8 = 32, stroke included. A CSS `border` adds its width OUTSIDE the padding
 * box, so the same declaration renders 35 tall and 73 wide where Figma says 32
 * and 70. An inset box-shadow is the accurate translation — it paints the ring
 * inside the box and costs no layout.
 *
 * Written out in full rather than composed, because Tailwind scans SOURCE TEXT:
 * a class name assembled at runtime is a class name that never gets generated.
 */
/**
 * Each tone carries its own WEIGHT, because Figma varies it per variant rather
 * than per size: PASS is Button 2A (Medium) and MATCH beside it is Body 4C
 * (Regular). Putting the weight on the size instead would make one of the two
 * wrong, and two `font-*` utilities on one element resolve by stylesheet order,
 * not by the order they appear in the string.
 */
const BUTTON_TONE = {
  /** Outline on a white surface — the header's INVITE. */
  outline:
    'font-medium shadow-[inset_0_0_0_1.5px_var(--border-primary-default)] ' +
    'text-[var(--text-primary-default)] hover:bg-[var(--surface-primary-subtle)]',
  /** Outline on a coloured surface — the banner's action, which carries its own
   *  white fill so the blue card does not show through the label. */
  'outline-on-color':
    'font-medium shadow-[inset_0_0_0_1.5px_var(--border-primary-default)] ' +
    'bg-[var(--surface-neutral-default)] text-[var(--text-primary-default)] hover:bg-[var(--surface-primary-subtle)]',
  /** Solid — MATCH (918:8021). Regular, and white on Blue 600. */
  fill: 'font-normal bg-[var(--surface-primary-default)] text-[var(--text-neutral-heading)] hover:bg-[var(--color-blue-700)]',
  /** Tinted — PASS (918:7983). Blue 50 behind `text/default/heading`, NOT blue
   *  ink: it is the quiet half of the pair and blue-on-blue would read as the
   *  primary action. */
  subtle:
    'font-medium bg-[var(--surface-primary-subtle)] text-[var(--text-default-heading)] hover:bg-[var(--color-blue-100)]',
  /** Quiet grey outline — MESSAGE on a match row (910:24601). A 1px
   *  `border/neutral/subtle`, not the 1.5px blue: it sits beside a name and
   *  must not out-shout it. */
  neutral:
    'font-normal shadow-[inset_0_0_0_1px_var(--border-neutral-subtle)] ' +
    'text-[var(--text-default-body)] hover:bg-[var(--surface-neutral-subtle)]',
} as const;

/** `md` is the 32-tall control; `sm` is the 20-tall one on a list row, which
 *  drops to Body 5C (13/16) rather than shrinking Button 2A. */
const BUTTON_SIZE = {
  md: 'px-[12px] py-[8px] text-[14px] uppercase leading-[16px] tracking-[0px]',
  sm: 'px-[12px] py-[2px] text-[13px] uppercase leading-[16px] tracking-[0px]',
} as const;

export function Button({
  children,
  tone = 'outline',
  size = 'md',
  onClick,
  type = 'button',
}: {
  children: ReactNode;
  tone?: keyof typeof BUTTON_TONE;
  size?: keyof typeof BUTTON_SIZE;
  onClick?: () => void;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={
        'inline-flex shrink-0 items-center gap-[2px] whitespace-nowrap rounded-[var(--border-radius-round)] transition-colors ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-primary-default)] ' +
        BUTTON_SIZE[size] + ' ' + BUTTON_TONE[tone]
      }
    >
      {children}
    </button>
  );
}

/** `Button Text` 893:19211 — a label-only action, no box. "See all". */
export function ButtonText({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'inline-flex shrink-0 items-center gap-[4px] whitespace-nowrap text-[var(--text-primary-default)] ' +
        'hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
        'focus-visible:outline-[var(--border-primary-default)] ' + BODY_4B
      }
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------- badge button
//
// `Badge Button` 865:5792. p-8 around a 16 icon on a 240 radius — a 32 control,
// and the icon is 16, not 18. Two fills are placed:
//
//   865:6475  white, 1px `text/neutral/deep` border   the header controls
//   865:6443  `surface/primary/subtle`, no border     follow / message in a list
//
// The dot is `Badge Icon`: 6px, Blue 600, white ring, pinned 1.5 from the top
// right corner.

export function BadgeButton({
  label,
  glyph,
  tone = 'outline',
  dot = false,
  mirrored = false,
  onClick,
}: {
  label: string;
  glyph: ComponentType<{ size?: number; strokeWidth?: number; className?: string }> & { grid?: number };
  tone?: 'outline' | 'subtle';
  dot?: boolean;
  /** Figma mirrors a couple of glyphs in place. The flip belongs to the usage,
   *  not to the exported file, so it is applied here. */
  mirrored?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={
        'relative grid size-[32px] shrink-0 place-items-center rounded-[var(--border-radius-round)] transition-colors ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-primary-default)] ' +
        (tone === 'subtle'
          ? 'bg-[var(--surface-primary-subtle)] text-[var(--icons-primary-default)] hover:bg-[var(--color-blue-100)]'
          : 'shadow-[inset_0_0_0_1px_var(--text-neutral-deep)] bg-[var(--surface-neutral-default)] ' +
            'text-[var(--icons-neutral-default)] hover:bg-[var(--surface-neutral-subtle)]')
      }
    >
      <Icon as={glyph} size={16} className={mirrored ? '-scale-x-100' : undefined} />
      {dot && (
        <span
          aria-hidden
          className="absolute right-[1.5px] top-[1.5px] size-[6px] rounded-full border border-[var(--border-primary-highlight)] bg-[var(--surface-primary-default)]"
        />
      )}
    </button>
  );
}

// ---------------------------------------------------------------- tag
//
// `Tag` 863:3673. px-12 py-8 on an 8 radius with a 14/16 label — 32 tall.
//
// Two fills, and WHICH ONE goes WHERE is the part that was wrong before:
//
//   default   surface/primary/subtle   the role chip, the meeting formats
//   neutral   surface/neutral/subtle   common interests
//
// The label is always `text/default/caption` in both. The fill carries the
// distinction; the ink does not change.

export function Tag({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'neutral' }) {
  return (
    <span
      className={
        'inline-flex shrink-0 items-center gap-[8px] whitespace-nowrap rounded-[var(--border-radius-md)] ' +
        'px-[12px] py-[8px] text-[var(--text-default-caption)] ' + BODY_4B + ' ' +
        (tone === 'default' ? 'bg-[var(--surface-primary-subtle)]' : 'bg-[var(--surface-neutral-subtle)]')
      }
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------- badge text
//
// `Badge Text` 863:3236. px-8 py-2 on a 6 radius with a 12/16 label — 20 tall.
// Not a Tag: different padding, different radius, different type, and it is the
// component the list rows use for their note line and the match rows use for
// their status.

export function BadgeText({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'primary' | 'success';
}) {
  return (
    <span
      className={
        'inline-flex shrink-0 items-center gap-[8px] whitespace-nowrap rounded-[6px] px-[8px] py-[2px] ' + TITLE_6 + ' ' +
        {
          neutral: 'bg-[var(--surface-neutral-subtle)] text-[var(--text-default-caption)]',
          primary: 'bg-[var(--surface-primary-subtle)] text-[var(--text-default-highlight-blue)]',
          success: 'bg-[var(--surface-success-subtle)] text-[var(--text-success-deep)]',
        }[tone]
      }
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------- nav item
//
// `Nav Item` 791:2951 (rest) and 792:3042 (selected). p-14 around a 20 icon and
// a 16/20 label on a 12 radius — 48 tall, which is what makes a six-item
// `Sidebar` exactly 324.

export function NavItem({
  label,
  glyph,
  selected,
  onClick,
}: {
  label: string;
  glyph: ComponentType<{ size?: number; strokeWidth?: number; className?: string }> & { grid?: number };
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? 'page' : undefined}
      className={
        'flex w-full items-center gap-[12px] rounded-[12px] p-[14px] text-left transition-colors ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--border-primary-default)] ' +
        (selected
          ? 'bg-[var(--surface-primary-subtle)] text-[var(--text-default-highlight-blue)] ' + TITLE_3
          : 'bg-[var(--surface-neutral-default)] text-[var(--text-default-body)] hover:bg-[var(--surface-neutral-subtle)] ' + BODY_3A)
      }
    >
      <Icon as={glyph} size={20} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

// ---------------------------------------------------------------- small parts

/** `section-label`. 12/16 Regular in `text/default/placeholder` — NOT 13px
 *  medium with a 1px tracking, which is what four sections were carrying. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <span className={TITLE_6 + ' text-[var(--text-default-placeholder)]'}>{children}</span>;
}

/** `Divider`. One pixel of `border/neutral/default`. */
export function Divider({ vertical = false }: { vertical?: boolean }) {
  return (
    <div
      aria-hidden
      className={
        'shrink-0 bg-[var(--border-neutral-default)] ' +
        (vertical ? 'w-px self-stretch max-[1000px]:h-px max-[1000px]:w-auto' : 'h-px w-full')
      }
    />
  );
}
