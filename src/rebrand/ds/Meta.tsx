import type { ReactNode } from 'react';
import { Icon, type Glyph } from './Icon';
import {
  ArrowRight01SharpIcon,
  BirthdayCakeIcon,
  FemaleSymbolIcon,
  Location09Icon,
  MaleSymbolIcon,
  NonBinaryIcon,
} from '../../assets/system_icons';
import { BODY_5B, BODY_6 } from './type';

/**
 * THE META ROW — Figma `location-meta` 872:14527, `gender` 872:14551 and
 * `birthday` 767:2845.
 *
 * Three components, one drawing: a 16 glyph, a 4 gap, and a Light label in
 * `text/default/placeholder`. They are separate in Figma because each is bound
 * to a specific field, and they stay separate here for the same reason — a
 * `GenderMeta` cannot be handed a location by mistake.
 *
 * `MetaRow` is the shared shell. It is not a Figma component and is named so it
 * cannot be mistaken for one.
 *
 * SIZE. `gender` carries a `Size` axis the other two do not:
 *
 *     sm   Body 6  (12/16 Light)
 *     md   Body 5B (13/16 Light)
 *
 * `location-meta` and `birthday` are Body 5B, which is `gender`'s md.
 */

export function MetaRow({
  glyph,
  children,
  trailing,
  size = 'md',
  hovered = false,
}: {
  glyph: Glyph;
  children: ReactNode;
  trailing?: ReactNode;
  size?: 'sm' | 'md';
  /** `Status=hover` moves the ink one step darker, to `text/default/subtle`. */
  hovered?: boolean;
}) {
  return (
    <span
      className={
        'flex items-center gap-[4px] whitespace-nowrap ' +
        (size === 'sm' ? BODY_6 : BODY_5B) + ' ' +
        (hovered ? 'text-[var(--text-default-subtle)]' : 'text-[var(--text-default-placeholder)]')
      }
    >
      <Icon as={glyph} size={16} />
      {children}
      {trailing}
    </span>
  );
}

/** `location-meta` 872:14527. */
export function LocationMeta({ children }: { children: ReactNode }) {
  return <MetaRow glyph={Location09Icon}>{children}</MetaRow>;
}

/**
 * `gender` 872:14551. `Type` is Woman | Man | Non-binary, and each carries its
 * own exported glyph — `female-symbol`, `male-symbol`, `non-binary`. All three
 * are in the icon set; none of them is a stand-in.
 *
 * The pronoun strings below are Figma's own instance content, kept here as the
 * defaults so a call site that has no data still renders what the file draws.
 */
const GENDER: Record<'Woman' | 'Man' | 'Non-binary', { glyph: Glyph; pronouns: string }> = {
  Woman: { glyph: FemaleSymbolIcon, pronouns: 'She/Her/Hers' },
  Man: { glyph: MaleSymbolIcon, pronouns: 'He/Him/His' },
  'Non-binary': { glyph: NonBinaryIcon, pronouns: 'They/Them/Their' },
};

export type GenderType = keyof typeof GENDER;

export function GenderMeta({
  type,
  children,
  size = 'sm',
}: {
  type: GenderType;
  /** Overrides the pronoun string. Omit to use the one the file draws. */
  children?: ReactNode;
  size?: 'sm' | 'md';
}) {
  const g = GENDER[type];
  return (
    <MetaRow glyph={g.glyph} size={size}>
      {children ?? g.pronouns}
    </MetaRow>
  );
}

/**
 * `birthday` 767:2845. Carries a trailing 12px `arrow-right-01-sharp` — the
 * only glyph in the set drawn below 16 — which the file uses to mark the row as
 * leading somewhere.
 */
export function BirthdayMeta({ children, onOpen }: { children: ReactNode; onOpen?: () => void }) {
  return (
    <MetaRow
      glyph={BirthdayCakeIcon}
      trailing={
        onOpen ? (
          <button type="button" onClick={onOpen} aria-label="Open" className="shrink-0">
            <Icon as={ArrowRight01SharpIcon} size={12} />
          </button>
        ) : (
          <Icon as={ArrowRight01SharpIcon} size={12} />
        )
      }
    >
      {children}
    </MetaRow>
  );
}
