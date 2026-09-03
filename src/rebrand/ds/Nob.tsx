import type { ReactNode } from 'react';

/**
 * NOB — Figma `Nob` 799:5376.
 *
 * The moving part of a `Switch Button`, and the dot inside a selected radio. A
 * round `p-2` box in three sizes (xs 16 · sm 20 · md 24) over
 * `Status × Type`, where Type pairs a fill with a content slot:
 *
 *     empty-transparent   no fill, nothing inside   the rest position
 *     empty-achromatic    white fill
 *     empty-colored       Blue 600 fill
 *     icon-*              the same fills, carrying a glyph
 *
 * The transparent variants really are invisible — the component exists so a
 * switch can move a box of a known size whether or not that box is painted, and
 * so the track's geometry does not change with its state.
 */

const FILL = {
  transparent: '',
  achromatic: 'bg-[var(--surface-neutral-default)]',
  colored: 'bg-[var(--surface-primary-default)]',
} as const;

const SIZE = { xs: 16, sm: 20, md: 24 } as const;

export function Nob({
  fill = 'transparent',
  size = 'xs',
  disabled,
  children,
}: {
  fill?: keyof typeof FILL;
  size?: keyof typeof SIZE;
  disabled?: boolean;
  /** Makes this one of the `icon-*` types. */
  children?: ReactNode;
}) {
  const px = SIZE[size];
  return (
    <span
      aria-hidden
      className={
        'inline-flex shrink-0 items-center justify-center gap-[10px] rounded-[40px] p-[2px] ' +
        FILL[fill] + (disabled ? ' opacity-100' : '') +
        (disabled && fill === 'colored' ? ' bg-[var(--border-neutral-subtle)]' : '')
      }
      style={{ width: px, height: px }}
    >
      {children}
    </span>
  );
}
