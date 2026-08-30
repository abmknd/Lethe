import { Icon, type Glyph } from './Icon';
import { BODY_6 } from './type';

/**
 * NUMBER SYMBOL — Figma `Number Symbol` 797:4112, and SYMBOLS — `Symbols`
 * 797:4120.
 *
 * A Number Symbol is a single digit in Body 6 `text/default/subtle`, boxed with
 * `px-5` and a fixed 7px glyph column so `1` and `8` occupy the same width. A
 * keyboard hint, a count, a step number — anything that has to sit in a row of
 * its siblings without the row twitching as the digit changes.
 *
 * Symbols wraps it: `Type=icon` shows a 16px glyph, `Type=number` shows the
 * digit and optionally a glyph before it, at a 10 gap.
 *
 * Figma's `Size` axis on Number Symbol (xs/sm/md/lg → 16/20/20/24 tall) only
 * moves the box; the digit stays Body 6 in every variant.
 */

const NUMBER_SIZE = { xs: 16, sm: 20, md: 20, lg: 24 } as const;

export function NumberSymbol({
  children,
  size = 'xs',
}: {
  children: number | string;
  size?: keyof typeof NUMBER_SIZE;
}) {
  return (
    <span
      className="inline-flex shrink-0 flex-col items-center justify-center overflow-hidden px-[5px]"
      style={{ height: NUMBER_SIZE[size] }}
    >
      <span className={'w-[7px] text-[var(--text-default-subtle)] ' + BODY_6}>{children}</span>
    </span>
  );
}

export function Symbols({
  glyph,
  number,
}: {
  /** `Type=icon`, or the optional leading glyph of `Type=number`. */
  glyph?: Glyph;
  /** Present makes this `Type=number`. */
  number?: number | string;
}) {
  return (
    <span className="inline-flex items-center gap-[10px]">
      {glyph && (
        <span className="shrink-0 text-[var(--icons-neutral-default)]">
          <Icon as={glyph} size={16} />
        </span>
      )}
      {number !== undefined && <NumberSymbol>{number}</NumberSymbol>}
    </span>
  );
}
