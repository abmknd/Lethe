import type { ReactNode } from 'react';
import { Icon, type Glyph } from './Icon';
import { ItemButtonText } from './Questionnaire';
import { BODY_3A, TITLE_3, TITLE_6 } from './type';

/**
 * TEXT ICON NAV — Figma `Text Icon Nav` 791:2963.
 *
 * The inside of a nav row: a 20 glyph, a 12 gap, and an `Item Button Text`.
 * `Status` is default / selected / disabled, and selected moves the label to
 * Medium in `text/default/highlight-blue`.
 */
export function TextIconNav({
  glyph,
  children,
  selected = false,
}: {
  glyph: Glyph;
  children: ReactNode;
  selected?: boolean;
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-[12px]">
      <Icon as={glyph} size={20} />
      <span className={'min-w-0 flex-1 truncate ' + (selected ? TITLE_3 : BODY_3A)}>{children}</span>
    </span>
  );
}

/**
 * NAV ITEM — Figma `Nav Item` 791:2951 (rest) / 792:3012 (selected).
 *
 * `p-14` around a Text Icon Nav on a 12 radius — 48 tall, which is what makes a
 * six-item `Sidebar` exactly 324. `Shape` is rounded | straight.
 */
export function NavItem({
  label,
  glyph,
  selected,
  shape = 'rounded',
  onClick,
}: {
  label: string;
  glyph: Glyph;
  selected?: boolean;
  shape?: 'rounded' | 'straight';
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? 'page' : undefined}
      className={
        'flex w-full items-center gap-[12px] p-[14px] text-left transition-colors ' +
        (shape === 'rounded' ? 'rounded-[12px] ' : 'rounded-none ') +
        'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--border-primary-default)] ' +
        (selected
          ? 'bg-[var(--surface-primary-subtle)] text-[var(--text-default-highlight-blue)]'
          : 'bg-[var(--surface-neutral-default)] text-[var(--text-default-body)] hover:bg-[var(--surface-neutral-subtle)]')
      }
    >
      <TextIconNav glyph={glyph} selected={selected}>{label}</TextIconNav>
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
