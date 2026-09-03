import { Icon } from './Icon';
import { Tick02Icon } from '../../assets/system_icons';

/**
 * CHECK — Figma `Check` 796:3678.
 *
 * The box itself, without a label. 56 variants over
 * `Status × State × Shape × Size`:
 *
 *     Status  default · hover · focus · disabled · success · error · warning
 *     State   selected | unselected
 *     Shape   square (radius 2) | circle
 *     Size    sm 16 | md 20
 *
 * Unselected default is a 1px `border/neutral/deep` box with `p-2` and no fill.
 * Selected fills with `surface/primary/default` and drops a tick in.
 *
 * `Shape` is the only thing separating a checkbox from a radio here, which is
 * why the input `type` follows it: a circle that behaves like a checkbox is a
 * control that lies about whether you can pick two.
 */

const STATUS = {
  default: 'shadow-[inset_0_0_0_1px_var(--border-neutral-deep)]',
  hover: 'shadow-[inset_0_0_0_1px_var(--border-primary-default)]',
  focus: 'shadow-[inset_0_0_0_1px_var(--border-primary-default)] outline outline-2 outline-offset-2 outline-[var(--border-primary-default)]',
  disabled: 'shadow-[inset_0_0_0_1px_var(--border-neutral-subtle)] bg-[var(--surface-neutral-subtle)]',
  success: 'shadow-[inset_0_0_0_1px_var(--color-success-700)]',
  error: 'shadow-[inset_0_0_0_1px_var(--border-error-default)]',
  warning: 'shadow-[inset_0_0_0_1px_var(--color-warning-600)]',
} as const;

export function Check({
  checked = false,
  status = 'default',
  shape = 'square',
  size = 'sm',
  disabled,
  name,
  value,
  onChange,
}: {
  checked?: boolean;
  status?: keyof typeof STATUS;
  shape?: 'square' | 'circle';
  size?: 'sm' | 'md';
  disabled?: boolean;
  name?: string;
  value?: string;
  onChange?: (checked: boolean) => void;
}) {
  const px = size === 'md' ? 20 : 16;
  return (
    <span className="relative inline-flex shrink-0 items-center" style={{ width: px, height: px }}>
      <input
        type={shape === 'circle' ? 'radio' : 'checkbox'}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.currentTarget.checked)}
        className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <span
        aria-hidden
        className={
          // p-2 in both states: selected is 2 + a 12 tick + 2 = 16, which is how
          // the filled variant reaches the same box without declaring a size.
          'grid size-full place-items-center p-[2px] transition-colors ' +
          (shape === 'circle' ? 'rounded-[var(--border-radius-round)] ' : 'rounded-[var(--border-radius-xs)] ') +
          (checked
            ? 'bg-[var(--surface-primary-default)] text-[var(--text-neutral-heading)] '
            : 'bg-[var(--surface-neutral-default)] ' + STATUS[disabled ? 'disabled' : status])
        }
      >
        {checked && <Icon as={Tick02Icon} size={px - 4} />}
      </span>
    </span>
  );
}
