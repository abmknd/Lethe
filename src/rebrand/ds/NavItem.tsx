import type { ReactNode } from 'react';
import { Icon, type Glyph } from './Icon';
import { ItemButtonText } from './Questionnaire';
import { BODY_3A, BODY_4B, TITLE_3, TITLE_4C, TITLE_6 } from './type';

/** `Nav Item`'s Size axis. `md` is 40 tall, `lg` is 48. */
export type NavItemSize = 'md' | 'lg';

/**
 * TEXT ICON NAV — Figma `Text Icon Nav` 791:2963.
 *
 * The inside of a nav row: the glyph, a 12 gap, and an `Item Button Text`.
 * `Status` is default / selected / disabled, and selected moves the label to
 * Medium in `text/default/highlight-blue`.
 */
export function TextIconNav({
  glyph,
  children,
  selected = false,
  size = 'md',
}: {
  glyph: Glyph;
  children: ReactNode;
  selected?: boolean;
  /** `md` is a 16 glyph on P4 type; `lg` is a 20 glyph on P3. */
  size?: NavItemSize;
}) {
  const md = size === 'md';
  return (
    <span className="flex min-w-0 flex-1 items-center gap-[12px]">
      <Icon as={glyph} size={md ? 16 : 20} />
      <span
        className={
          'min-w-0 flex-1 truncate ' +
          (md ? (selected ? TITLE_4C : BODY_4B) : selected ? TITLE_3 : BODY_3A)
        }
      >
        {children}
      </span>
    </span>
  );
}

/**
 * NAV ITEM — Figma `Nav Item` 792:3012.
 *
 * `Size` is a REAL AXIS and `md` is what the app places. It was added to the
 * component after this was first built, and the sidebars moved onto it — which
 * is why the rail was reading a size too large. The difference is not only
 * padding:
 *
 *              md (the app)        lg (was the only size)
 *   height     40                  48
 *   padding    12                  14
 *   glyph      16                  20
 *   label      P4  14/16           P3  16/20
 *   selected   Title 4C            Title 3
 *   rest       Body 4B             Body 3A
 *
 * A six-item `Sidebar` is therefore 276, not 324 — 8 + 6x40 + 5x4 + 8.
 *
 * `md` is the default because every rail in the product is md; a caller that
 * wants the larger row has to say so.
 *
 * ONE INCONSISTENCY IN THE FILE, left alone deliberately. In `Sidebar`, the
 * selected row places a true `Size=16px` glyph while the other five place the
 * `Size=20px` variant resized to a 16 box. Both end up 16 on screen. We render
 * every row from the 20px export, so the rail is at least internally
 * consistent, and the stroke still resolves to exactly 1px (attribute 1.25 in a
 * 20-unit viewBox scaled into 16). Worth a designer's eye — the difference is
 * the optical adjustment HugeIcons makes between its 16 and 20 draws, and only
 * one of the six rows currently gets it.
 */
export function NavItem({
  label,
  glyph,
  selected,
  shape = 'rounded',
  size = 'md',
  onClick,
}: {
  label: string;
  glyph: Glyph;
  selected?: boolean;
  shape?: 'rounded' | 'straight';
  size?: NavItemSize;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? 'page' : undefined}
      className={
        'flex w-full items-center gap-[12px] text-left transition-colors ' +
        (size === 'md' ? 'p-[12px] ' : 'p-[14px] ') +
        (shape === 'rounded' ? 'rounded-[12px] ' : 'rounded-none ') +
        'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--border-primary-default)] ' +
        (selected
          ? 'bg-[var(--surface-primary-subtle)] text-[var(--text-default-highlight-blue)]'
          : 'bg-[var(--surface-neutral-default)] text-[var(--text-default-body)] hover:bg-[var(--surface-neutral-subtle)]')
      }
    >
      <TextIconNav glyph={glyph} selected={selected} size={size}>{label}</TextIconNav>
    </button>
  );
}

/**
 * SIDEBAR — Figma `Sidebar` 907:22811.
 *
 * `bg-white p-8 rounded-16 gap-4`, 248 wide. THREE types — feed, matches,
 * communities — six items each, and every glyph is fixed by the file. The
 * `Status` axis (item-01..06) is which one is selected, which is state rather
 * than a variant here.
 *
 * 276 tall with six `md` rows: 8 + 6x40 + 5x4 + 8. It was 324 when the rows
 * were `lg`.
 */
export function Sidebar({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-[248px] flex-col gap-[4px] rounded-[16px] bg-[var(--surface-neutral-default)] p-[8px]">
      {children}
    </div>
  );
}

/** `section-label`. Title 6 in `text/default/placeholder` — NOT 13/16 Medium
 *  with a 1px tracking, which is what four sections were carrying. */
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

export { ItemButtonText };
