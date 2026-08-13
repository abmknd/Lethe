import type { ReactNode, ButtonHTMLAttributes } from 'react';

/**
 * Primitives for the rebrand. Every fill, border and text colour resolves to a
 * ramp token. No opacity is used to produce a colour: a hover moves a ramp
 * step, a disabled control has its own fill. See redesign.md sections 5 and 6.
 *
 * Surface is the organising idea. A component does not know what colour it is;
 * it knows what it is sitting ON, and derives everything from that.
 */

export type Surface = 'light' | 'blue';

/** RELETHE pinwheel logomark (interlocking lobes), used in nav + footer. */
export function Logomark({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M12 1.7c2.1 0 3.8 1.7 3.8 3.8 0 .5-.1 1-.3 1.5.5-.2 1-.3 1.5-.3 2.1 0 3.8 1.7 3.8 3.8s-1.7 3.8-3.8 3.8c-.5 0-1-.1-1.5-.3.2.5.3 1 .3 1.5 0 2.1-1.7 3.8-3.8 3.8s-3.8-1.7-3.8-3.8c0-.5.1-1 .3-1.5-.5.2-1 .3-1.5.3-2.1 0-3.8-1.7-3.8-3.8S4.9 6.7 7 6.7c.5 0 1 .1 1.5.3-.2-.5-.3-1-.3-1.5C8.2 3.4 9.9 1.7 12 1.7Zm0 6.6a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4Z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------- pills

const PILL_BASE =
  'inline-flex items-center gap-[2px] rounded-[8px] px-[6px] py-[4px] text-[13px] leading-[18px]';

/**
 * Names the block it sits in. One per block, authored, never interactive.
 * Rendered as a span so it is never mistaken for a control.
 */
export function TitlePill({ children, surface = 'light' }: { children: ReactNode; surface?: Surface }) {
  const fill =
    surface === 'blue'
      ? 'bg-[var(--color-blue-700)] text-[var(--color-white)]'
      : 'bg-[var(--color-white)] text-[var(--color-black-700)]';
  return <span className={`${PILL_BASE} whitespace-nowrap ${fill}`}>{children}</span>;
}

/** Qualifies the block. One per block, authored, never interactive. */
export function DescriptivePill({
  children,
  surface = 'light',
  icon,
}: {
  children: ReactNode;
  surface?: Surface;
  icon?: ReactNode;
}) {
  const fill =
    surface === 'blue'
      ? 'bg-[var(--color-blue-50)] text-[var(--color-blue-600)]'
      : 'bg-[var(--color-blue-600)] text-[var(--color-white)]';
  return (
    <span className={`${PILL_BASE} whitespace-nowrap ${fill}`}>
      {icon ? <span className="grid size-[16px] place-items-center">{icon}</span> : null}
      {children}
    </span>
  );
}

/**
 * Data belonging to the user: interests, socials, common ground. Arrives in
 * variable quantity and wraps, which is why it is not a variant of the two
 * above. Neutral is the only specified variant so far.
 */
export function SignalPill({ children }: { children: ReactNode }) {
  return (
    <span className={`${PILL_BASE} bg-[var(--color-black-100)] text-[var(--color-black-700)]`}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------- button

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  surface?: Surface;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
};

const SIZES = {
  sm: 'px-[16px] py-[8px] text-[13px] leading-[1.2] tracking-[1px]',
  md: 'px-[20px] py-[8px] text-[13px] leading-[1.2] tracking-[1px]',
  lg: 'px-[20px] py-[12px] text-[14px] leading-[16px] tracking-[1px]',
};

/**
 * Hover moves a ramp step rather than applying opacity, so the control stays a
 * defined colour in every state. Disabled has its own fill (White, Black 400
 * text) rather than a faded copy of the enabled one.
 */
export function Button({
  variant = 'primary',
  surface = 'light',
  size = 'sm',
  fullWidth,
  className = '',
  ...rest
}: ButtonProps) {
  const skin =
    variant === 'primary'
      ? surface === 'blue'
        ? 'bg-[var(--color-white)] text-[var(--color-blue-600)] hover:bg-[var(--color-black-50)] active:bg-[var(--color-black-100)]'
        : 'bg-[var(--color-blue-600)] text-[var(--color-white)] hover:bg-[var(--color-blue-700)] active:bg-[var(--color-blue-700)]'
      : surface === 'blue'
        ? 'border border-[var(--color-white)] text-[var(--color-white)] hover:bg-[var(--color-blue-500)] active:bg-[var(--color-blue-700)]'
        : 'border border-[var(--color-blue-600)] text-[var(--color-blue-600)] hover:bg-[var(--color-blue-50)] active:bg-[var(--color-blue-100)]';

  const focus =
    surface === 'blue'
      ? 'focus-visible:outline-[var(--color-white)]'
      : 'focus-visible:outline-[var(--color-blue-600)]';

  return (
    <button
      className={
        `inline-flex shrink-0 items-center justify-center rounded-[40px] font-medium transition-colors ` +
        `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focus} ` +
        `disabled:cursor-not-allowed disabled:border-transparent disabled:bg-[var(--color-white)] disabled:text-[var(--color-black-400)] ` +
        `${SIZES[size]} ${skin} ${fullWidth ? 'w-full' : ''} ${className}`
      }
      {...rest}
    />
  );
}

// ---------------------------------------------------------------- decorative

/**
 * SVG spirograph "flower" standing in for the generated survey pinwheel.
 * Layered rotated ellipses trace an 8-fold guilloché bloom.
 *
 * The per-ring alpha here is a MATERIAL effect (overlapping ink building
 * density), not a colour substitute, which is why it survives the no-opacity
 * rule.
 */
export function SpirographFlower({ size = 215 }: { size?: number }) {
  const petals = 16;
  const rings = 5;
  const cx = 100;
  const cy = 100;
  return (
    <svg width={size} height={size * (177 / 215)} viewBox="0 0 200 165" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="0.5">
        {Array.from({ length: petals }).map((_, p) =>
          Array.from({ length: rings }).map((_, r) => (
            <ellipse
              key={`${p}-${r}`}
              cx={cx}
              cy={cy - 18}
              rx={20 + r * 11}
              ry={58 - r * 6}
              opacity={0.5 - r * 0.06}
              transform={`rotate(${(360 / petals) * p} ${cx} ${cy - 18})`}
            />
          )),
        )}
      </g>
      <circle cx={cx} cy={cy - 18} r="1.6" fill="currentColor" />
    </svg>
  );
}
