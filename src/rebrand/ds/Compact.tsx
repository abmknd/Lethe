import type { ReactNode } from 'react';
import { Check } from './Check';
import { Icon, type Glyph } from './Icon';
import { BODY_6, TITLE_5 } from './type';

/**
 * COMPACT ICON — Figma `Compact Icon` 810:8511.
 *
 * A glyph in a tinted rounded square: `surface/primary/subtle`, `p-12` around a
 * 16 glyph on a radius 8 — a 40 box at `Size=sm`, 48 at `md`.
 *
 * `Type=selected` is the axis that matters; `Status` is hover and disabled,
 * which the browser knows, so it is not a prop.
 */
export function CompactIcon({
  glyph,
  size = 'sm',
  selected = false,
}: {
  glyph: Glyph;
  size?: 'sm' | 'md';
  selected?: boolean;
}) {
  const pad = size === 'md' ? 'p-[16px]' : 'p-[12px]';
  return (
    <span
      className={
        'inline-flex shrink-0 items-center overflow-hidden rounded-[8px] ' + pad + ' ' +
        (selected
          ? 'bg-[var(--surface-primary-default)] text-[var(--text-neutral-heading)]'
          : 'bg-[var(--surface-primary-subtle)] text-[var(--icons-neutral-default)]')
      }
    >
      <Icon as={glyph} size={16} />
    </span>
  );
}

/**
 * COMPACT ITEM — Figma `Compact Item` 817:2126.
 *
 * A selectable row with an icon, two lines of copy, and a circular Check:
 * `p-12` on white with a bottom rule, `gap-24` between the copy and the check,
 * `gap-8` between the icon and the copy, and `gap-2` between the two lines.
 *
 *     title  Title 5  in text/default/heading, with its own py-2
 *     sub    Body 6   in text/default/subtle
 *
 * 400x64 at `Size=sm`, 480x84 at `md`. The `py-2` on the title is not padding
 * for its own sake — it is what puts the 2px between the lines onto the right
 * side of the baseline.
 */
export function CompactItem({
  glyph,
  title,
  children,
  selected = false,
  size = 'sm',
  disabled,
  onSelect,
}: {
  glyph: Glyph;
  title: ReactNode;
  children?: ReactNode;
  selected?: boolean;
  size?: 'sm' | 'md';
  disabled?: boolean;
  onSelect?: (selected: boolean) => void;
}) {
  return (
    <div className="flex w-full items-center bg-[var(--surface-neutral-default)] p-[12px] shadow-[inset_0_-1px_0_0_var(--border-neutral-default)]">
      <div className="flex min-w-0 flex-1 items-start gap-[24px]">
        <div className="flex min-w-0 flex-1 items-center gap-[8px]">
          <CompactIcon glyph={glyph} size={size} selected={selected} />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-[2px]">
            <span className={'flex w-full items-center py-[2px] text-[var(--text-default-heading)] ' + TITLE_5}>
              {title}
            </span>
            {children && (
              <span className={'flex w-full items-center text-[var(--text-default-subtle)] ' + BODY_6}>
                {children}
              </span>
            )}
          </div>
        </div>
        <Check shape="circle" checked={selected} disabled={disabled} onChange={onSelect} />
      </div>
    </div>
  );
}
