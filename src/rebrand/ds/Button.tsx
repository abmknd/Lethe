import type { ReactNode } from 'react';
import { Icon, type Glyph } from './Icon';
import { BODY_4B } from './type';

/**
 * BUTTON — Figma `Button` 767:3012.
 *
 * `btn-content` is px-12 py-8 on a 240 radius, which is where the 32 height and
 * the 70px INVITE come from — not a fixed width.
 *
 * FIGMA STROKES ARE INSIDE THE SHAPE, and CSS borders are not. A 1.5px `border`
 * renders this 35 tall and 73 wide where Figma says 32 and 70, because a border
 * sits outside the padding box. An inset box-shadow is the accurate
 * translation: it paints the ring inside the box and costs no layout.
 *
 * Class strings are written out in full rather than composed, because Tailwind
 * scans SOURCE TEXT — a class name assembled at runtime is a class name that
 * never gets generated.
 *
 * The set has 72 variants over size x style x tone. These five are the ones the
 * app surfaces place; building the rest before a screen asks is how a library
 * fills with code nothing imports.
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
  /** Outline on a coloured surface — the blue banner's action, which carries its
   *  own white fill so the card does not show through the label. */
  'outline-on-color':
    'font-medium shadow-[inset_0_0_0_1.5px_var(--border-primary-default)] ' +
    'bg-[var(--surface-neutral-default)] text-[var(--text-primary-default)] hover:bg-[var(--surface-primary-subtle)]',
  /** Solid — MATCH (918:8021), and the feed banner's INVITE. Regular, white on
   *  Blue 600. */
  fill: 'font-normal bg-[var(--surface-primary-default)] text-[var(--text-neutral-heading)] hover:bg-[var(--color-blue-700)]',
  /** Tinted — PASS (918:7983). Blue 50 behind `text/default/heading`, NOT blue
   *  ink: it is the quiet half of the pair and blue-on-blue would read as the
   *  primary action. */
  subtle:
    'font-medium bg-[var(--surface-primary-subtle)] text-[var(--text-default-heading)] hover:bg-[var(--color-blue-100)]',
  /** Quiet grey outline — MESSAGE on a match row (910:24601). A 1px
   *  `border/neutral/subtle`, not the 1.5px blue: it sits beside a name and must
   *  not out-shout it. */
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
  disabled,
}: {
  children: ReactNode;
  tone?: keyof typeof BUTTON_TONE;
  size?: keyof typeof BUTTON_SIZE;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={
        'inline-flex shrink-0 items-center gap-[2px] whitespace-nowrap rounded-[var(--border-radius-round)] transition-colors ' +
        'disabled:cursor-not-allowed disabled:opacity-100 ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-primary-default)] ' +
        BUTTON_SIZE[size] + ' ' + BUTTON_TONE[tone]
      }
    >
      {children}
    </button>
  );
}

/**
 * BUTTON TEXT — Figma `Button Text` 893:19014.
 *
 * A label-only action with no box. "See all". Body 4B, `gap-4` to an optional
 * glyph (`Style=with-icon`), and `Color` is black / white / blue.
 */
const BUTTON_TEXT_COLOR = {
  black: 'text-[var(--text-default-heading)]',
  white: 'text-[var(--text-neutral-heading)]',
  blue: 'text-[var(--text-primary-default)]',
} as const;

export function ButtonText({
  children,
  color = 'blue',
  glyph,
  onClick,
}: {
  children: ReactNode;
  color?: keyof typeof BUTTON_TEXT_COLOR;
  glyph?: Glyph;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        // NOT an underline on hover. `Status=hover` keeps the size, the leading
        // and the ink and steps the WEIGHT up one — Body 4B to Title 4C, both
        // 14/16, Regular to Medium. Same token pair, one notch heavier.
        'inline-flex shrink-0 items-center gap-[4px] whitespace-nowrap no-underline hover:font-medium ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
        'focus-visible:outline-[var(--border-primary-default)] ' + BODY_4B + ' ' + BUTTON_TEXT_COLOR[color]
      }
    >
      {glyph && <Icon as={glyph} size={16} />}
      {children}
    </button>
  );
}

/**
 * BUTTON TEXT CAP — Figma `Button Text Cap` 877:18766.
 *
 * `Button Text` in caps. Same axes, same drawing, and Figma keeps it as its own
 * component rather than a `case` prop — so it is one here too, and a call site
 * never has to remember to add `uppercase`.
 */
export function ButtonTextCap({
  children,
  color = 'blue',
  glyph,
  onClick,
}: {
  children: ReactNode;
  color?: keyof typeof BUTTON_TEXT_COLOR;
  glyph?: Glyph;
  onClick?: () => void;
}) {
  return (
    <span className="uppercase">
      <ButtonText color={color} glyph={glyph} onClick={onClick}>
        {children}
      </ButtonText>
    </span>
  );
}
