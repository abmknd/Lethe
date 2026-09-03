import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { BadgeIcon } from './BadgeIcon';
import { Cancel01Icon } from '../../assets/system_icons';
import { BODY_4A, BODY_5A } from './type';

/**
 * CHIP — Figma `Chip` 863:4043.
 *
 * 224 variants, and NOT 224 hand-written cases. Figma composes them from five
 * independent axes, so the component takes five props and the matrix falls out:
 *
 *     Status  default · hover · focus · disabled · success · error · warning   (7)
 *     Type    choice · tag · input · meta                                      (4)
 *     Size    sm · md                                                          (2)
 *     State   inactive · active                                                (2)
 *     Style   subtle-fill · grey-fill                                          (2)
 *
 *     7 x 4 x 2 x 2 x 2 = 224
 *
 * Two of the seven Statuses are browser states — `hover` and `focus` — so they
 * are CSS here rather than props, per the folder's rule 4. `disabled` is real
 * and is a prop. That leaves five status values, and every one of them was read
 * from its own node rather than extrapolated: default 863:4132, disabled
 * 863:4176, success 863:4187, error 863:4198, warning 863:4209.
 *
 * WHAT EACH AXIS ACTUALLY CHANGES
 *
 *   Size    sm  py-4, Body 5A (13/16)  -> 24 tall
 *           md  py-6, Body 4A (14/20)  -> 32 tall
 *           The type size changes with it; md is not sm with more padding.
 *
 *   Type    choice · tag   px-8,  radius md (8)
 *           input · meta   px-12, radius round (240)
 *           meta adds a leading 4px Badge Icon.
 *           tag, input and meta add a trailing 12px cancel-01 when active,
 *           which is the +16 those variants gain in the file (12 + a 4 gap).
 *           `input` also overrides the fill to `surface/primary/subtle-hover`.
 *
 *   State   inactive  the tinted fill, a 1px border, gap 8
 *           active    `surface/{status}/default`, white label, NO border, gap 4
 *
 *   Style   subtle-fill  the Status ramp below
 *           grey-fill    Neutral 50 behind `border/disabled/deep`, body ink —
 *                        the same drawing with the hue taken out
 *
 * The Status ramp is deliberately not uniform, and that is the file's doing:
 * success borders on its 200 where error and warning border on their 100.
 */

type Status = 'default' | 'disabled' | 'success' | 'error' | 'warning';
type Type = 'choice' | 'tag' | 'input' | 'meta';

/** `Style=subtle-fill`, `State=inactive`. Each row is one read node. */
const SUBTLE: Record<Status, { bg: string; border: string; text: string }> = {
  default: {
    bg: 'bg-[var(--surface-primary-subtle)]',
    border: 'shadow-[inset_0_0_0_1px_var(--border-primary-subtle-hover)]',
    text: 'text-[var(--text-default-highlight-blue)]',
  },
  disabled: {
    bg: 'bg-[var(--surface-neutral-subtle)]',
    border: 'shadow-[inset_0_0_0_1px_var(--border-disabled-deep)]',
    text: 'text-[var(--text-default-placeholder)]',
  },
  success: {
    bg: 'bg-[var(--surface-success-subtle)]',
    border: 'shadow-[inset_0_0_0_1px_var(--border-success-subtle-hover)]',
    text: 'text-[var(--text-success-deep)]',
  },
  error: {
    bg: 'bg-[var(--surface-error-subtle)]',
    border: 'shadow-[inset_0_0_0_1px_var(--border-error-subtle-hover)]',
    text: 'text-[var(--text-error-default-hover)]',
  },
  warning: {
    bg: 'bg-[var(--surface-warning-subtle)]',
    border: 'shadow-[inset_0_0_0_1px_var(--border-warning-subtle-hover)]',
    text: 'text-[var(--text-warning-default-hover)]',
  },
};

/** `Style=grey-fill`. One appearance for every Status — the hue is what the
 *  style removes. */
const GREY = {
  bg: 'bg-[var(--surface-neutral-subtle)]',
  border: 'shadow-[inset_0_0_0_1px_var(--border-disabled-deep)]',
  text: 'text-[var(--text-default-body)]',
} as const;

/** `State=active`. The status's own `default` surface, white label, no border. */
const ACTIVE: Record<Status, string> = {
  default: 'bg-[var(--surface-primary-default)]',
  disabled: 'bg-[var(--border-neutral-subtle)]',
  success: 'bg-[var(--surface-success-default)]',
  error: 'bg-[var(--surface-error-default)]',
  warning: 'bg-[var(--surface-warning-default)]',
};

const SHAPE: Record<Type, string> = {
  choice: 'px-[8px] rounded-[var(--border-radius-md)]',
  tag: 'px-[8px] rounded-[var(--border-radius-md)]',
  input: 'px-[12px] rounded-[var(--border-radius-round)]',
  meta: 'px-[12px] rounded-[var(--border-radius-round)]',
};

const SIZE = {
  sm: { pad: 'py-[4px]', text: BODY_5A },
  md: { pad: 'py-[6px]', text: BODY_4A },
} as const;

export function Chip({
  children,
  type = 'choice',
  size = 'sm',
  status = 'default',
  style = 'subtle-fill',
  active = false,
  onClick,
  onRemove,
}: {
  children: ReactNode;
  type?: Type;
  size?: 'sm' | 'md';
  status?: Status;
  style?: 'subtle-fill' | 'grey-fill';
  active?: boolean;
  onClick?: () => void;
  /** The trailing `cancel-01`. Only `tag`, `input` and `meta` carry one, and
   *  only while active — which is exactly the +16 those variants gain. */
  onRemove?: () => void;
}) {
  const skin = active
    ? { bg: ACTIVE[status], border: '', text: 'text-[var(--text-neutral-heading)]' }
    : style === 'grey-fill'
      ? GREY
      : type === 'input'
        ? { ...SUBTLE[status], bg: 'bg-[var(--surface-primary-subtle-hover)]', text: 'text-[var(--text-primary-default-hover)]' }
        : type === 'meta'
          ? { ...SUBTLE[status], border: 'shadow-[inset_0_0_0_1px_var(--border-primary-subtle-focus)]', text: 'text-[var(--text-primary-default-hover)]' }
          : SUBTLE[status];

  const s = SIZE[size];
  const removable = onRemove && active && type !== 'choice';
  const Tag = onClick ? 'button' : 'span';

  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick, disabled: status === 'disabled' } : {})}
      className={
        'inline-flex shrink-0 items-center whitespace-nowrap transition-colors ' +
        (active ? 'gap-[4px] ' : 'gap-[8px] ') +
        (onClick
          ? 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-primary-default)] '
          : '') +
        SHAPE[type] + ' ' + s.pad + ' ' + s.text + ' ' + skin.bg + ' ' + skin.border + ' ' + skin.text
      }
    >
      <span className="flex items-center justify-center gap-[4px]">
        {type === 'meta' && <BadgeIcon size="xs" status={active ? 'on-color' : 'default'} />}
        {children}
      </span>
      {removable && (
        <span
          role="button"
          tabIndex={0}
          aria-label="Remove"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRemove(); } }}
          className="shrink-0 cursor-pointer"
        >
          <Icon as={Cancel01Icon} size={12} />
        </span>
      )}
    </Tag>
  );
}
