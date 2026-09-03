import type { ReactNode } from 'react';
import { BODY_6 } from './type';

/**
 * HINT — Figma `Hint` 771:5482, and INFO TEXT — `Info Text` 805:8492.
 *
 * Two components, one drawing: a `hint-text` row of Body 6 in
 * `text/default/placeholder`. They are kept apart because Figma keeps them
 * apart and they sit in different places — a Hint belongs under a field and is
 * announced with it; an Info Text is a standalone caption ("9:00 PM - 10:00 PM")
 * that belongs to nothing.
 *
 * That difference is semantic, not visual, so it shows up in the markup rather
 * than the class list: a Hint takes an `id` so a field can point `aria-describedby`
 * at it.
 */

export function Hint({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <span id={id} className={'block text-[var(--text-default-placeholder)] ' + BODY_6}>
      {children}
    </span>
  );
}

export function InfoText({ children }: { children: ReactNode }) {
  return <span className={'block text-[var(--text-default-placeholder)] ' + BODY_6}>{children}</span>;
}
