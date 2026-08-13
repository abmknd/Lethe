import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

/**
 * The primitive layer. See redesign.md sections 5 and 6.
 *
 * Two rules govern everything here:
 *
 *   1. SURFACE DECIDES. A component does not know what colour it is. It knows
 *      what it is sitting ON, and derives fill, border and text from that. The
 *      same pill is white on a light card and Blue 700 on a blue one, and
 *      neither caller has to know that.
 *
 *   2. NO OPACITY PRODUCES A COLOUR. Hover moves a ramp step, pressed moves
 *      two, disabled has its own fill. Alpha survives only where it is a
 *      material effect (overlapping ink), never as a stand-in for a token.
 */

export type Surface = 'light' | 'blue';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// ---------------------------------------------------------------- pills

const PILL =
  'inline-flex items-center gap-[2px] rounded-[8px] px-[6px] py-[4px] text-[13px] leading-[18px]';

/** Names the block it sits in. Authored, one per block, never interactive. */
export function TitlePill({ children, surface = 'light' }: { children: ReactNode; surface?: Surface }) {
  return (
    <span
      className={cx(
        PILL,
        'whitespace-nowrap',
        surface === 'blue'
          ? 'bg-[var(--color-blue-700)] text-[var(--color-white)]'
          : 'bg-[var(--color-white)] text-[var(--color-black-700)]',
      )}
    >
      {children}
    </span>
  );
}

/** Qualifies the block. Authored, one per block, never interactive. */
export function DescriptivePill({
  children,
  surface = 'light',
  icon,
}: {
  children: ReactNode;
  surface?: Surface;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cx(
        PILL,
        'whitespace-nowrap',
        surface === 'blue'
          ? 'bg-[var(--color-blue-50)] text-[var(--color-blue-600)]'
          : 'bg-[var(--color-blue-600)] text-[var(--color-white)]',
      )}
    >
      {icon ? <span className="grid size-[16px] place-items-center">{icon}</span> : null}
      {children}
    </span>
  );
}

/**
 * Data belonging to the user: interests, socials, common ground. Arrives in
 * variable quantity and wraps, which is why it is not a variant of the two
 * above. Neutral is the only specified variant.
 */
export function SignalPill({ children }: { children: ReactNode }) {
  return <span className={cx(PILL, 'bg-[var(--color-black-100)] text-[var(--color-black-700)]')}>{children}</span>;
}

// ---------------------------------------------------------------- button

const BTN_SIZE = {
  sm: 'px-[16px] py-[8px] text-[13px] leading-[1.2] tracking-[1px]',
  md: 'px-[20px] py-[8px] text-[13px] leading-[1.2] tracking-[1px]',
  lg: 'px-[20px] py-[12px] text-[14px] leading-[16px] tracking-[1px]',
};

export function Button({
  variant = 'primary',
  surface = 'light',
  size = 'sm',
  fullWidth,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  surface?: Surface;
  size?: keyof typeof BTN_SIZE;
  fullWidth?: boolean;
}) {
  const skin =
    variant === 'primary'
      ? surface === 'blue'
        ? 'bg-[var(--color-white)] text-[var(--color-blue-600)] hover:bg-[var(--color-black-50)] active:bg-[var(--color-black-100)]'
        : 'bg-[var(--color-blue-600)] text-[var(--color-white)] hover:bg-[var(--color-blue-700)] active:bg-[var(--color-blue-700)]'
      : surface === 'blue'
        ? 'border border-[var(--color-white)] text-[var(--color-white)] hover:bg-[var(--color-blue-500)] active:bg-[var(--color-blue-700)]'
        : 'border border-[var(--color-blue-600)] text-[var(--color-blue-600)] hover:bg-[var(--color-blue-50)] active:bg-[var(--color-blue-100)]';

  return (
    <button
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-[2px] rounded-[40px] font-medium transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        surface === 'blue' ? 'focus-visible:outline-[var(--color-white)]' : 'focus-visible:outline-[var(--color-blue-600)]',
        'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-[var(--color-white)] disabled:text-[var(--color-black-400)]',
        BTN_SIZE[size],
        skin,
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    />
  );
}

/**
 * Round icon control. Intent carries meaning, so it is named for the meaning
 * rather than the colour: a destructive action is destructive on any surface.
 */
export function IconButton({
  intent = 'neutral',
  label,
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  intent?: 'neutral' | 'positive' | 'destructive';
  label: string;
  children: ReactNode;
}) {
  const skin = {
    neutral: 'bg-[var(--color-black-100)] text-[var(--color-blue-600)] hover:bg-[var(--color-black-200)]',
    positive: 'bg-[var(--color-success-100)] text-[var(--color-success-700)] hover:bg-[var(--color-success-200)]',
    destructive: 'bg-[var(--color-error-50)] text-[var(--color-error-600)] hover:bg-[var(--color-error-100)]',
  }[intent];

  return (
    <button
      aria-label={label}
      className={cx(
        'grid size-[40px] place-items-center rounded-[40px] p-[10px] transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]',
        skin,
        className,
      )}
      {...rest}
    />
  );
}

// ---------------------------------------------------------------- surfaces

export function Card({
  variant = 'light',
  className = '',
  children,
}: {
  variant?: 'light' | 'lightAlt' | 'white' | 'blue';
  className?: string;
  children: ReactNode;
}) {
  const skin = {
    light: 'bg-[var(--color-blue-50)] text-[var(--color-black-700)]',
    lightAlt: 'bg-[var(--color-blue-100)] text-[var(--color-black-700)]',
    white: 'bg-[var(--color-white)] text-[var(--color-black-700)] border border-[var(--color-black-100)]',
    // border is one ramp step lighter than the surface it sits on
    blue: 'bg-[var(--color-blue-600)] text-[var(--color-white)] border-[1.25px] border-[var(--color-blue-500)]',
  }[variant];
  return <div className={cx('overflow-hidden rounded-[16px]', skin, className)}>{children}</div>;
}

export function Avatar({
  src,
  alt = '',
  size = 48,
  onLight,
}: {
  src?: string;
  alt?: string;
  size?: number;
  onLight?: boolean;
}) {
  return (
    <span
      // Placeholder never matches its own container, or the avatar vanishes.
      className={cx(
        'inline-block shrink-0 overflow-hidden rounded-full',
        onLight ? 'bg-[var(--color-blue-100)]' : 'bg-[var(--color-black-200)]',
      )}
      style={{ width: size, height: size }}
    >
      {src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : null}
    </span>
  );
}

// ---------------------------------------------------------------- form

export function Input({
  surface = 'light',
  icon,
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { surface?: Surface; icon?: ReactNode }) {
  const onBlue = surface === 'blue';
  return (
    <div
      className={cx(
        'flex items-center gap-[8px] rounded-[8px] px-[16px] py-[12px] transition-colors',
        'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2',
        onBlue
          ? 'border border-[var(--color-blue-500)] bg-[var(--color-blue-500)] focus-within:outline-[var(--color-white)]'
          : 'border border-[var(--color-black-200)] bg-[var(--color-white)] focus-within:outline-[var(--color-blue-600)]',
        className,
      )}
    >
      {icon ? (
        <span className={cx('grid size-[20px] place-items-center', onBlue ? 'text-[var(--color-blue-300)]' : 'text-[var(--color-black-500)]')}>
          {icon}
        </span>
      ) : null}
      <input
        className={cx(
          'min-w-0 flex-1 bg-transparent text-[14px] leading-[100%] outline-none',
          onBlue
            ? 'text-[var(--color-white)] placeholder:text-[var(--color-blue-300)]'
            : 'text-[var(--color-black-700)] placeholder:text-[var(--color-black-400)]',
        )}
        {...rest}
      />
    </div>
  );
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex w-full gap-0 rounded-[40px] bg-[var(--color-black-100)] p-[4px]">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt)}
            className={cx(
              'flex-1 rounded-[40px] px-[12px] py-[8px] text-[13px] font-medium leading-[1.2] tracking-[1px] transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]',
              active
                ? 'bg-[var(--color-white)] text-[var(--color-blue-600)]'
                : 'text-[var(--color-black-400)] hover:text-[var(--color-black-500)]',
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- indicators

/**
 * One bar, two jobs. Without `onSelect` it is a progress read-out and is
 * hidden from assistive tech, because the step is already announced in the
 * copy. With `onSelect` it becomes a carousel control and each segment is a
 * real button. The visual language is identical either way, which is the point:
 * progress and position are the same idea.
 */
export function SegmentedBar({
  count,
  active,
  onSelect,
  labelFor,
  surface = 'blue',
}: {
  count: number;
  active: number;
  onSelect?: (i: number) => void;
  labelFor?: (i: number) => string;
  surface?: Surface;
}) {
  const onBlue = surface === 'blue';
  const seg = (i: number) =>
    cx(
      'block h-[4px] w-full transition-colors duration-300',
      i === 0 && 'rounded-l-[8px]',
      i === count - 1 && 'rounded-r-[8px]',
      i <= active
        ? onBlue
          ? 'bg-[var(--color-yellow-600)]'
          : 'bg-[var(--color-blue-600)]'
        : onBlue
          ? 'bg-[var(--color-blue-500)]'
          : 'bg-[var(--color-black-100)]',
    );

  if (!onSelect) {
    return (
      <div aria-hidden className="flex w-full items-center gap-[2px] rounded-[40px] p-[2px]">
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className={seg(i)} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-[4px]">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={labelFor ? labelFor(i) : `Go to item ${i + 1}`}
          aria-current={i === active}
          // The visible bar stays 4px; the padding carries the tap target up to
          // the 44px minimum. Shrinking the hit area to match the graphic is a
          // common and unnecessary mobile failure.
          className="group flex-1 py-[20px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]"
        >
          <span className={cx(seg(i), i !== active && 'group-hover:bg-[var(--color-blue-300)]')} />
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- list

export function CompactList({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <ul className={cx('overflow-hidden rounded-[16px] border border-[var(--color-black-200)]', className)}>{children}</ul>
  );
}

export function CompactListItem({
  icon,
  title,
  description,
  complete,
  last,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  complete?: boolean;
  last?: boolean;
}) {
  return (
    <li
      className={cx(
        'flex items-center justify-between gap-[28px] p-[12px]',
        complete && 'bg-[var(--color-black-100)]',
        !last && 'border-b border-[var(--color-black-200)]',
      )}
    >
      <span className="flex items-center gap-[12px]">
        <span
          className={cx(
            'grid size-[48px] shrink-0 place-items-center rounded-[12px] p-[14px]',
            complete ? 'bg-[var(--color-blue-200)]' : 'bg-[var(--color-black-100)]',
            'text-[var(--color-blue-600)]',
          )}
        >
          {icon}
        </span>
        <span className="flex flex-col gap-[2px]">
          <span className="text-[14px] font-medium leading-[16px] text-[var(--color-black-700)]">{title}</span>
          <span className="text-[13px] leading-[18px] text-[var(--color-black-500)]">{description}</span>
        </span>
      </span>

      {complete ? (
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden className="shrink-0 text-[var(--color-blue-600)]">
          <circle cx="10" cy="10" r="10" fill="currentColor" />
          <path d="M5.8 10.4l2.6 2.6 5.2-5.2" stroke="var(--color-white)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </li>
  );
}
