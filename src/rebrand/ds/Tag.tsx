import type { ReactNode } from 'react';
import { Icon, type Glyph } from './Icon';
import { Cancel01Icon } from '../../assets/system_icons';
import { BadgeIcon } from './BadgeIcon';
import { BODY_4B, TITLE_6 } from './type';

/**
 * TAG — Figma `Tag` 863:3673.
 *
 * `px-12 py-8` on an 8 radius with a Body 4B label — 32 tall.
 *
 * Two fills, and WHICH ONE GOES WHERE is the part that gets misread:
 *
 *     default   surface/primary/subtle   the role chip, the meeting formats
 *     neutral   surface/neutral/subtle   common interests
 *
 * The label is `text/default/caption` in both. The fill carries the
 * distinction; the ink does not change.
 */
export function Tag({
  children,
  tone = 'default',
  onRemove,
}: {
  children: ReactNode;
  tone?: 'default' | 'neutral';
  /** `Cancel=true`. A removable Tag gets a 12px `cancel-01` after an 8 gap. */
  onRemove?: () => void;
}) {
  return (
    <span
      className={
        'inline-flex shrink-0 items-center gap-[8px] whitespace-nowrap rounded-[var(--border-radius-md)] ' +
        'px-[12px] py-[8px] text-[var(--text-default-caption)] ' + BODY_4B + ' ' +
        (tone === 'default' ? 'bg-[var(--surface-primary-subtle)]' : 'bg-[var(--surface-neutral-subtle)]')
      }
    >
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label="Remove" className="shrink-0">
          <Icon as={Cancel01Icon} size={12} />
        </button>
      )}
    </span>
  );
}

/**
 * BADGE TEXT — Figma `Badge Text` 863:3236 (`Status=neutral`) and 860:2688
 * (`Status=default`).
 *
 * `px-8 py-2` on a 6 radius with a Title 6 label — 20 tall. NOT a small Tag:
 * different padding, different radius, different type, and it is the component
 * a list row uses for its note and a match row uses for its status.
 *
 * IT HUGS ITS LABEL. Every `follow-profile` in the file sets `items-start` on
 * the column that holds it. This is an `inline-flex`, which hugs on its own —
 * but a flex column defaults to `align-items: stretch` and will pull it to full
 * width anyway, which is exactly what happened in both right sidebars. A caller
 * that stacks one must set `items-start`.
 *
 * `Size` is `xs` and nothing else; the axis exists in the file with one value.
 */
export function BadgeText({
  children,
  tone = 'neutral',
  dot = false,
  second,
  onRemove,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'primary' | 'success';
  /** `dotShow`. A 4px Badge Icon between the two labels. */
  dot?: boolean;
  /** `secondLabelShow`. Always `text/default/highlight-blue`. */
  second?: ReactNode;
  /** `cancelShow`. A 12px `cancel-01` at the end, after an 8 gap. */
  onRemove?: () => void;
}) {
  return (
    <span
      className={
        'inline-flex shrink-0 items-center gap-[8px] whitespace-nowrap rounded-[6px] px-[8px] py-[2px] ' + TITLE_6 + ' ' +
        {
          neutral: 'bg-[var(--surface-neutral-subtle)] text-[var(--text-default-caption)]',
          primary: 'bg-[var(--surface-primary-subtle)] text-[var(--text-default-highlight-blue)]',
          success: 'bg-[var(--surface-success-subtle)] text-[var(--text-success-deep)]',
        }[tone]
      }
    >
      <span className="flex items-center justify-center gap-[4px]">
        {children}
        {dot && <BadgeIcon size="xs" />}
        {second && <span className="text-[var(--text-default-highlight-blue)]">{second}</span>}
      </span>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label="Remove" className="shrink-0">
          <Icon as={Cancel01Icon} size={12} />
        </button>
      )}
    </span>
  );
}
