import type { ReactNode } from 'react';
import { Check } from './Check';
import { Symbols } from './Symbols';
import { type Glyph } from './Icon';

/**
 * ITEM BUTTON TEXT — Figma `Item Button Text` 771:5552.
 *
 * The label inside a menu row or a nav item. Body 4B (14/16) in
 * `text/default/body` at rest; `State=selected` moves it to Medium in
 * `text/default/highlight-blue`. `Type` picks the size — xs/sm are 16 tall and
 * md is 20.
 */
export function ItemButtonText({
  children,
  selected = false,
  size = 'sm',
}: {
  children: ReactNode;
  selected?: boolean;
  size?: 'xs' | 'sm' | 'md';
}) {
  return (
    <span
      className={
        'flex min-w-0 flex-1 items-center ' +
        (size === 'md' ? 'text-[16px] leading-[20px] ' : 'text-[14px] leading-[16px] ') +
        (selected
          ? 'font-medium text-[var(--text-default-highlight-blue)]'
          : 'font-normal text-[var(--text-default-body)]')
      }
    >
      {children}
    </span>
  );
}

/**
 * TEXT ICON MENU — Figma `Text Icon Menu` 797:4162.
 *
 * A selectable row: an optional `Symbols` (a glyph, a number, or both), the
 * label, and a trailing circular `Check`. `gap-12` outside, `gap-16` between
 * the symbol and the label.
 *
 * The Check here is `Shape=circle`, which is drawn with `border/radius/xxl`
 * (32) rather than the round 240 — at 16px the two are the same pixel, and the
 * file's number is the one recorded.
 */
export function TextIconMenu({
  children,
  glyph,
  number,
  selected = false,
  status = 'default',
  onSelect,
}: {
  children: ReactNode;
  glyph?: Glyph;
  number?: number | string;
  selected?: boolean;
  status?: 'default' | 'hover' | 'disabled';
  onSelect?: (selected: boolean) => void;
}) {
  return (
    <span className="flex w-full items-center gap-[12px]">
      <span className="flex min-w-0 flex-1 items-center gap-[16px]">
        {(glyph || number !== undefined) && <Symbols glyph={glyph} number={number} />}
        <ItemButtonText selected={selected}>{children}</ItemButtonText>
      </span>
      <Check
        shape="circle"
        checked={selected}
        disabled={status === 'disabled'}
        onChange={onSelect}
      />
    </span>
  );
}

/**
 * QUESTION ITEM — Figma `Question Item` 797:4370.
 *
 * A Text Icon Menu in a box: `p-16` on a white card with a 1px
 * `border/neutral/default`, radius 8 (`Shape=rounded`) or 0 (`straight`). 232
 * wide and 48 tall in the file — 16 + a 16 row + 16.
 */
export function QuestionItem({
  children,
  glyph,
  number,
  selected = false,
  shape = 'rounded',
  disabled,
  onSelect,
}: {
  children: ReactNode;
  glyph?: Glyph;
  number?: number | string;
  selected?: boolean;
  shape?: 'rounded' | 'straight';
  disabled?: boolean;
  onSelect?: (selected: boolean) => void;
}) {
  return (
    <div
      className={
        'flex w-full items-center bg-[var(--surface-neutral-default)] p-[16px] ' +
        'shadow-[inset_0_0_0_1px_var(--border-neutral-default)] ' +
        (shape === 'rounded' ? 'rounded-[8px]' : 'rounded-none')
      }
    >
      <TextIconMenu
        glyph={glyph}
        number={number}
        selected={selected}
        status={disabled ? 'disabled' : 'default'}
        onSelect={onSelect}
      >
        {children}
      </TextIconMenu>
    </div>
  );
}

/**
 * QUESTIONNAIRE — Figma `Questionnaire` 798:5013.
 *
 * Six Question Items at an 8 gap. The count is the instance's, not the
 * component's — this takes whatever it is given.
 */
export function Questionnaire({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div role="group" aria-label={label} className="flex w-full flex-col gap-[8px]">
      {children}
    </div>
  );
}
