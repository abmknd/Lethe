import type { ReactNode } from 'react';
import { Icon, type Glyph } from './Icon';
import { BODY_3A, BODY_4A, BODY_5A } from './type';

/**
 * PLACEHOLDER — Figma `Placeholder` 872:14798.
 *
 * The inside of a field: an optional leading glyph, the placeholder text, and
 * an optional trailing glyph, at an 8 gap.
 *
 * `Size` changes THREE things at once, which is why it is a lookup rather than
 * a couple of conditionals:
 *
 *     sm   py-8    Body 5A  13/16   glyphs 16
 *     md   py-4    Body 4A  14/20   glyphs 16
 *     lg   py-10   Body 3A  16/20   glyphs 20
 *
 * All three land on a 32 or 40 row once the field's own padding is added, which
 * is the point of the odd-looking vertical padding: the TEXT is what is being
 * centred, not the box.
 *
 * Figma's default instance carries `mail-01` on the left and `help-circle` on
 * the right. Those are placeholders for a placeholder — the component's own
 * demo content — so neither is a default here; a call site names its glyphs.
 */

const SIZE = {
  sm: { pad: 'py-[8px]', text: BODY_5A, glyph: 16 },
  md: { pad: 'py-[4px]', text: BODY_4A, glyph: 16 },
  lg: { pad: 'py-[10px]', text: BODY_3A, glyph: 20 },
} as const;

export type PlaceholderSize = keyof typeof SIZE;

export function Placeholder({
  children,
  size = 'sm',
  iconLeft,
  iconRight,
}: {
  children: ReactNode;
  size?: PlaceholderSize;
  iconLeft?: Glyph;
  iconRight?: Glyph;
}) {
  const s = SIZE[size];
  return (
    <span className={'flex w-full items-center gap-[8px] ' + s.pad}>
      <span className="flex min-w-0 flex-1 items-center gap-[8px]">
        {iconLeft && (
          <span className="shrink-0 text-[var(--icons-neutral-default)]">
            <Icon as={iconLeft} size={s.glyph} />
          </span>
        )}
        <span className={'min-w-0 flex-1 text-[var(--text-default-placeholder)] ' + s.text}>{children}</span>
      </span>
      {iconRight && (
        <span className="shrink-0 text-[var(--icons-neutral-default)]">
          <Icon as={iconRight} size={s.glyph} />
        </span>
      )}
    </span>
  );
}
