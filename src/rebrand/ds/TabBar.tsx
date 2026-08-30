import type { ReactNode } from 'react';
import { BUTTON_2A } from './type';

/**
 * NAV BUTTON TEXT — Figma `Nav Button Text` 821:2524.
 * TOGGLE BUTTON — `Toggle Button` 844:3258.
 * TAB BAR — `Tab Bar` 843:3146.
 *
 * Three nested components, and it is worth keeping them nested because each one
 * owns exactly one decision:
 *
 *   Nav Button Text  the LABEL. Button 2A, uppercase, and its `Color` axis is
 *                    black / white / blue with `State=selected|unselected`
 *                    deciding weight and ink.
 *   Toggle Button    the BOX around it. px-12 py-8 on a 240 radius — 32 tall.
 *                    `Type=transparent|fill` and `Style=toggle|nav`.
 *   Tab Bar          the ROW. Toggle Buttons at a 2 gap.
 *
 * The app header's tab bar is `Type=transparent, Style=nav`: no pill behind the
 * selected tab at all. It is marked by weight and ink only, which is the detail
 * that makes the header read as quiet rather than as a segmented control.
 */

const INK = {
  black: {
    selected: 'font-medium tracking-[0px] text-[var(--text-default-heading)]',
    unselected: 'font-normal text-[var(--text-default-placeholder)] hover:text-[var(--text-default-caption)]',
  },
  white: {
    selected: 'font-medium tracking-[0px] text-[var(--text-neutral-heading)]',
    unselected: 'font-normal text-[var(--text-neutral-hover)] hover:text-[var(--text-neutral-heading)]',
  },
  blue: {
    selected: 'font-medium tracking-[0px] text-[var(--text-primary-default)]',
    unselected: 'font-normal text-[var(--text-default-placeholder)] hover:text-[var(--text-primary-default)]',
  },
} as const;

export type NavButtonColor = keyof typeof INK;

export function NavButtonText({
  children,
  color = 'black',
  selected = false,
}: {
  children: ReactNode;
  color?: NavButtonColor;
  selected?: boolean;
}) {
  return (
    <span className={'flex items-center justify-center whitespace-nowrap ' + BUTTON_2A + ' ' + INK[color][selected ? 'selected' : 'unselected']}>
      {children}
    </span>
  );
}

export function ToggleButton({
  children,
  color,
  active = false,
  fill = false,
  onClick,
}: {
  children: ReactNode;
  color?: NavButtonColor;
  active?: boolean;
  /**
   * `Type=fill` (844:3296) paints the selected state as a WHITE pill with a
   * BLUE label — `surface/neutral/default` behind `Color=blue`. It is not a
   * Blue 50 pill, which is what this was; that read as a tinted chip rather
   * than a raised segment.
   *
   * `transparent` marks the selection with weight and ink only, which is what
   * the app header's tab bar uses.
   */
  fill?: boolean;
  onClick?: () => void;
}) {
  const ink = color ?? (fill && active ? 'blue' : 'black');
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={
        'inline-flex shrink-0 items-center justify-center gap-[2px] rounded-[var(--border-radius-round)] ' +
        'px-[12px] py-[8px] transition-colors ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--border-primary-default)] ' +
        (fill && active ? 'bg-[var(--surface-neutral-default)]' : '')
      }
    >
      <NavButtonText color={ink} selected={active}>{children}</NavButtonText>
    </button>
  );
}

export function TabBar({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <nav aria-label={label} className="flex items-center gap-[2px]">
      {children}
    </nav>
  );
}
