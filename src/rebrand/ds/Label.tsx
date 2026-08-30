import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { HelpCircleIcon } from '../../assets/system_icons';
import { TITLE_5 } from './type';

/**
 * LABEL — Figma `Label` 771:4946.
 *
 * `Type=default | required`. A field's title, Title 5 in `text/default/subtle`,
 * with an optional 16px `help-circle` after it at a 6 gap.
 *
 * The required marker is an `*` in `text/error/default`, and Figma hangs it in
 * the MARGIN at `left: -7` rather than after the text — so a column of labels
 * still aligns down its left edge whether or not a field is required. That is
 * the whole point of it being placed the way it is, and it is why this is an
 * absolutely positioned span rather than a suffix.
 */
export function Label({
  children,
  type = 'default',
  help,
  htmlFor,
}: {
  children: ReactNode;
  type?: 'default' | 'required';
  /** Renders the `help-circle` affordance. Pass a string for its tooltip. */
  help?: string;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="relative flex w-full items-center gap-[6px]">
      <span className={'relative min-w-0 flex-1 text-[var(--text-default-subtle)] ' + TITLE_5}>
        {type === 'required' && (
          <span aria-hidden className="absolute left-[-7px] top-0 text-[var(--text-error-default)]">
            *
          </span>
        )}
        {children}
      </span>
      {help !== undefined && (
        <span className="shrink-0 text-[var(--icons-neutral-default)]" title={help || undefined}>
          <Icon as={HelpCircleIcon} size={16} label={help || 'More information'} />
        </span>
      )}
    </label>
  );
}
