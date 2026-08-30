import type { ReactNode } from 'react';
import { Icon, type Glyph } from './Icon';
import { BirthdayCakeIcon, FemaleSymbolIcon, Location09Icon } from '../../assets/system_icons';
import { BODY_5B } from './type';

/**
 * THE META ROW — Figma `location-meta` 872:14527, `gender` 872:14551 and
 * `birthday` 767:2845.
 *
 * Three components, one drawing: a 16 glyph, a 4 gap, and Body 5B in
 * `text/default/placeholder`. They are separate in Figma because each is bound
 * to a specific field, and they stay separate here for the same reason — a
 * `GenderMeta` cannot be handed a location by mistake.
 *
 * `MetaRow` is the shared shell, exported so a fourth one is a line rather than
 * a copy. It is not a Figma component and is named so it cannot be mistaken for
 * one.
 *
 * `birthday` has a trailing 12px `arrow-right-01-sharp` in the file. That glyph
 * is not yet in `src/assets/system_icons`, so the slot exists and is empty
 * rather than filled with something that looks close.
 */

export function MetaRow({
  glyph,
  children,
  trailing,
}: {
  glyph: Glyph;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <span className={'flex items-center gap-[4px] whitespace-nowrap text-[var(--text-default-placeholder)] ' + BODY_5B}>
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
 * `gender` 872:14551. `Type` is Woman | Man | Non-binary, and in the file each
 * carries its own glyph. Only `female-symbol` is exported so far, so the other
 * two take it as a prop rather than resolving to a stand-in.
 */
export function GenderMeta({ children, glyph = FemaleSymbolIcon }: { children: ReactNode; glyph?: Glyph }) {
  return <MetaRow glyph={glyph}>{children}</MetaRow>;
}

/** `birthday` 767:2845. */
export function BirthdayMeta({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <MetaRow glyph={BirthdayCakeIcon} trailing={trailing}>
      {children}
    </MetaRow>
  );
}
