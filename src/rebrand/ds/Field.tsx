import type { ReactNode } from 'react';
import { Icon, type Glyph } from './Icon';
import { BODY_3A, BODY_4A, BODY_5A } from './type';

/**
 * FIELD NORMAL — Figma `Field Normal` 771:5115, and FIELD BUTTONED —
 * `Field Buttoned` 790:2228.
 *
 * The box a value is typed into. 320x40 at rest, and its axes are:
 *
 *     Status  default · hover · focus · disabled · success · error
 *     State   input-out (the label sits above)  |  input-in (inside the box)
 *     Shape   rounded (240) | straight (8)
 *
 * The rest border is 1.5px `border/primary/subtle-hover` — Blue 100, not a
 * grey. That is deliberate and easy to get wrong: the field reads as part of
 * the blue system even when untouched, and a neutral hairline there makes every
 * form look like a different product.
 *
 * 40 tall = px-16 py-4 around a Placeholder's own py-8 on a 16 line. The
 * doubled vertical padding is what lets `input-in` slot a label above the value
 * without the box growing.
 *
 * `Field Buttoned` is the same box with a trailing action — `Type=button` (a
 * Button) or `Type=enter` (an Enter Button, which makes the row 48).
 */

const STATUS = {
  default: 'shadow-[inset_0_0_0_1.5px_var(--border-primary-subtle-hover)]',
  hover: 'shadow-[inset_0_0_0_1.5px_var(--border-primary-default)]',
  focus: 'shadow-[inset_0_0_0_1.5px_var(--border-primary-default)]',
  disabled: 'shadow-[inset_0_0_0_1.5px_var(--border-neutral-subtle)] bg-[var(--surface-neutral-subtle)]',
  success: 'shadow-[inset_0_0_0_1.5px_var(--color-success-700)]',
  error: 'shadow-[inset_0_0_0_1.5px_var(--border-error-default)]',
} as const;

const TEXT = { sm: BODY_5A, md: BODY_4A, lg: BODY_3A } as const;

export type FieldStatus = keyof typeof STATUS;

export function FieldNormal({
  value,
  onChange,
  placeholder,
  status = 'default',
  shape = 'rounded',
  size = 'sm',
  iconLeft,
  iconRight,
  action,
  id,
  name,
  type = 'text',
  describedBy,
  disabled,
}: {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  status?: FieldStatus;
  shape?: 'rounded' | 'straight';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: Glyph;
  iconRight?: Glyph;
  /** Present makes this a `Field Buttoned` — a Button or an Enter Button. */
  action?: ReactNode;
  id?: string;
  name?: string;
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
  describedBy?: string;
  disabled?: boolean;
}) {
  const glyph = size === 'lg' ? 20 : 16;
  return (
    <div
      className={
        'flex w-full items-center gap-[8px] bg-[var(--surface-neutral-default)] px-[16px] py-[4px] transition-shadow ' +
        (shape === 'rounded' ? 'rounded-[var(--border-radius-round)] ' : 'rounded-[var(--border-radius-md)] ') +
        STATUS[disabled ? 'disabled' : status] +
        (status === 'focus' ? ' outline outline-2 outline-offset-2 outline-[var(--border-primary-default)]' : '')
      }
    >
      <span className={'flex min-w-0 flex-1 items-center gap-[8px] ' + (size === 'lg' ? 'py-[10px]' : size === 'md' ? 'py-[4px]' : 'py-[8px]')}>
        {iconLeft && (
          <span className="shrink-0 text-[var(--icons-neutral-default)]">
            <Icon as={iconLeft} size={glyph} />
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          disabled={disabled}
          aria-describedby={describedBy}
          onChange={(e) => onChange?.(e.currentTarget.value)}
          placeholder={placeholder}
          className={
            'min-w-0 flex-1 bg-transparent text-[var(--text-default-body)] outline-none ' +
            'placeholder:text-[var(--text-default-placeholder)] disabled:cursor-not-allowed ' + TEXT[size]
          }
        />
        {iconRight && (
          <span className="shrink-0 text-[var(--icons-neutral-default)]">
            <Icon as={iconRight} size={glyph} />
          </span>
        )}
      </span>
      {action}
    </div>
  );
}

/** `Field Buttoned` is `Field Normal` with the action slot filled. Named so a
 *  call site reads as the Figma component it is placing. */
export const FieldButtoned = FieldNormal;
