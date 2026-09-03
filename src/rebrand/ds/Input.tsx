import type { ReactNode } from 'react';
import { useId } from 'react';
import { Hint } from './Hint';
import { Label } from './Label';
import { BODY_5A } from './type';

/**
 * INPUT — Figma `Input` 771:5478, and TEXT INPUT — `Text Input` 877:18526.
 *
 * The assembled field: a Label, the box, and a Hint. Both are the same stack,
 * and the gaps are the file's rather than a rhythm:
 *
 *     Label       16
 *     (12)
 *     the box     40  (Field Normal)  |  132  (Text Field)
 *     (10 / 8)
 *     Hint        16
 *
 * `Text Input` uses 8 to its hint row and puts TWO hints on it, left and right —
 * a rule on one side and a counter on the other. `Input` uses 10 and one hint.
 * Two numbers, two components; they are not a rounding of each other.
 *
 * The label is wired to the control with a generated id, and the hint with
 * `aria-describedby`, so the assembled component is the accessible unit rather
 * than three pieces that happen to sit near each other.
 */

export function Input({
  label,
  hint,
  required,
  help,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  help?: string;
  /** The box. Give it the `id` and `describedBy` this renders. */
  children: (ids: { id: string; describedBy?: string }) => ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="flex w-full flex-col">
      <Label htmlFor={id} type={required ? 'required' : 'default'} help={help}>
        {label}
      </Label>
      <div className="mt-[12px]">{children({ id, describedBy: hintId })}</div>
      {hint && (
        <div className="mt-[10px]">
          <Hint id={hintId}>{hint}</Hint>
        </div>
      )}
    </div>
  );
}

export function TextInput({
  label,
  hint,
  counter,
  required,
  help,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  /** The right-hand hint on `Text Input`'s two-slot hint row. */
  counter?: ReactNode;
  required?: boolean;
  help?: string;
  children: (ids: { id: string; describedBy?: string }) => ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="flex w-full flex-col">
      <Label htmlFor={id} type={required ? 'required' : 'default'} help={help}>
        {label}
      </Label>
      <div className="mt-[12px]">{children({ id, describedBy: hintId })}</div>
      {(hint || counter) && (
        <div className="mt-[8px] flex items-center justify-between gap-[16px]">
          <Hint id={hintId}>{hint}</Hint>
          {counter && <Hint>{counter}</Hint>}
        </div>
      )}
    </div>
  );
}

/**
 * TEXT FIELD — Figma `Text Field` 875:17718.
 *
 * The multi-line box: 320x132, `px-16 py-4`, the same Blue 100 rest border as
 * `Field Normal`, and a hidden trailing Button slot. The 124 of placeholder
 * inside it is the textarea's own height, not a min-height on the box.
 */
export function TextField({
  value,
  onChange,
  placeholder,
  id,
  name,
  describedBy,
  disabled,
  rows = 6,
}: {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  describedBy?: string;
  disabled?: boolean;
  rows?: number;
}) {
  return (
    <div className="flex w-full items-start gap-[8px] rounded-[var(--border-radius-md)] bg-[var(--surface-neutral-default)] px-[16px] py-[4px] shadow-[inset_0_0_0_1.5px_var(--border-primary-subtle-hover)]">
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        disabled={disabled}
        aria-describedby={describedBy}
        onChange={(e) => onChange?.(e.currentTarget.value)}
        placeholder={placeholder}
        className={
          'min-w-0 flex-1 resize-none bg-transparent py-[8px] text-[var(--text-default-body)] outline-none ' +
          'placeholder:text-[var(--text-default-placeholder)] disabled:cursor-not-allowed ' + BODY_5A
        }
      />
    </div>
  );
}
