import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

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

// ---------------------------------------------------------------- icon stroke

/** The two sanctioned icon sizes. Anything else still resolves, but these are
 *  the ones the system draws for. */
export const ICON_SIZE = { sm: 16, md: 24 } as const;

/**
 * The stroke-width ATTRIBUTE for an icon rendered at `size`.
 *
 * The visual weight we want is size-relative: **1px at 16, 1.25px at 24**. A
 * hairline that reads correctly on a 24 glyph closes up and turns to mud on a
 * 16 one, so the smaller size takes proportionally more weight (1/16 = 6.25%
 * against 1.25/24 = 5.2%) and less absolute weight.
 *
 * The trap this function exists to remove: `strokeWidth` is in VIEWBOX UNITS,
 * not screen pixels. A 24-grid icon rendered into a 16px box is scaled by
 * 16/24, and its stroke scales with it — so hitting 1px on screen means
 * PASSING 1.5, and the attribute goes DOWN as the icon gets bigger:
 *
 *     16px display -> 1.5 attr -> 1.0 rendered
 *     24px display -> 1.25 attr -> 1.25 rendered
 *
 * Nobody should be doing that arithmetic at a call site.
 */
export function iconStroke(size: number, grid = 24): number {
  const visualPx = size <= ICON_SIZE.sm ? 1 : 1.25;
  return Number(((visualPx * grid) / size).toFixed(3));
}

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
  variant?: 'primary' | 'secondary' | 'tertiary';
  surface?: Surface;
  size?: keyof typeof BTN_SIZE;
  fullWidth?: boolean;
}) {
  // Website rule: hover is a TEXT change only. Fills and borders hold, so a
  // button never restates itself as a different object on hover; the label
  // just steps along its ramp. (redesign.md 6)
  //
  // tertiary is the deferral slot: no fill, no border, muted label. It exists
  // so SKIP / LATER can sit under a primary without competing with it, and it
  // is the only variant whose default state carries no boundary at all.
  const skin =
    variant === 'primary'
      ? surface === 'blue'
        ? 'bg-[var(--color-white)] text-[var(--color-blue-600)] hover:text-[var(--color-blue-700)]'
        : 'bg-[var(--color-blue-600)] text-[var(--color-white)] hover:text-[var(--color-blue-100)]'
      : variant === 'tertiary'
        ? surface === 'blue'
          ? 'text-[var(--color-blue-200)] hover:text-[var(--color-white)]'
          : 'text-[var(--color-black-500)] hover:text-[var(--color-black-700)]'
        : surface === 'blue'
          ? 'border border-[var(--color-white)] text-[var(--color-white)] hover:text-[var(--color-blue-200)]'
          : 'border border-[var(--color-blue-600)] text-[var(--color-blue-600)] hover:text-[var(--color-blue-700)]';

  return (
    <button
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-[2px] rounded-[40px] font-medium transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        surface === 'blue' ? 'focus-visible:outline-[var(--color-white)]' : 'focus-visible:outline-[var(--color-blue-600)]',
        // Disabled has its own FILL, and the fill has to differ from the
        // surface. White-on-blue reads as an inert button; the same white on a
        // white card reads as nothing at all — the primary action simply
        // disappeared. So the disabled fill is chosen by surface like every
        // other fill in the system.
        'disabled:cursor-not-allowed disabled:border-transparent disabled:text-[var(--color-black-400)]',
        surface === 'blue' ? 'disabled:bg-[var(--color-white)]' : 'disabled:bg-[var(--color-black-100)]',
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

/**
 * Card media. Two rules live here so no caller has to remember them:
 *
 *   ZOOM ON HOVER. The image scales inside a clipped frame; the card itself
 *   does not move. Put `group` on the card for this to fire.
 *
 *   FOCAL POINT. Any image with a person in it is anchored TOP-centre, not
 *   centre. When the frame shrinks, centre-anchoring crops from both edges and
 *   takes the head off first. Top-centre sacrifices the feet instead, which
 *   nobody misses.
 */
export function CardImage({
  src,
  alt = '',
  hasPerson,
  className = '',
}: {
  src: string;
  alt?: string;
  hasPerson?: boolean;
  className?: string;
}) {
  return (
    <span className={cx('block overflow-hidden rounded-[8px]', className)}>
      <img
        src={src}
        alt={alt}
        className={cx(
          'h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105',
          hasPerson ? 'object-top' : 'object-center',
        )}
      />
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
  marker,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  /** Puts a Blue 600 dot on the active segment. For navigation, where "which
   *  one am I on" has to survive a glance; a plain fill change does not, once
   *  the track and the segment are both near-white. */
  marker?: boolean;
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
              'flex flex-1 items-center justify-center gap-[8px] whitespace-nowrap rounded-[40px] px-[12px] py-[8px]',
              'text-[13px] font-medium leading-[1.2] tracking-[1px] transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]',
              active
                ? 'bg-[var(--color-white)] text-[var(--color-blue-600)]'
                : 'text-[var(--color-black-400)] hover:text-[var(--color-black-500)]',
            )}
          >
            {marker && active ? (
              <span aria-hidden className="size-[6px] shrink-0 rounded-full bg-[var(--color-blue-600)]" />
            ) : null}
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
          : 'bg-[var(--color-black-200)]',
    );

  if (!onSelect) {
    return (
      <div
        aria-hidden
        className={cx(
          'flex w-full items-center gap-[2px] rounded-[40px] p-[2px]',
          onBlue ? 'bg-[var(--color-blue-700)]' : 'bg-[var(--color-black-100)]',
        )}
      >
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

// ---------------------------------------------------------------- in-app

/**
 * A labelled group of related facts. Every block on a match or profile card is
 * one of these, so the vertical rhythm is a property of the system rather than
 * something each screen re-decides.
 */
export function SignalGroup({
  label,
  children,
  surface = 'light',
}: {
  label: string;
  children: ReactNode;
  surface?: Surface;
}) {
  return (
    <section className="flex flex-col gap-[8px]">
      <h3
        className={cx(
          'text-[14px] font-medium leading-[100%] tracking-[0.5px]',
          surface === 'blue' ? 'text-[var(--color-blue-300)]' : 'text-[var(--color-black-500)]',
        )}
      >
        {label}
      </h3>
      {children}
    </section>
  );
}

/**
 * Overlapping avatars for "people you both know". Caps at `max` and returns the
 * remainder so the caller can word it, because "+3" and "and 3 others have met
 * him" are different sentences and only the caller knows which one fits.
 */
export function AvatarStack({
  people,
  max = 3,
  onLight = true,
}: {
  people: { src?: string; name: string }[];
  max?: number;
  onLight?: boolean;
}) {
  const shown = people.slice(0, max);
  return (
    <span className="flex items-center">
      {shown.map((p, i) => (
        <span
          key={p.name}
          className="rounded-full ring-2 ring-[var(--color-white)]"
          style={{ marginLeft: i === 0 ? 0 : -10, zIndex: shown.length - i }}
          title={p.name}
        >
          <Avatar src={p.src} alt={p.name} size={28} onLight={onLight} />
        </span>
      ))}
    </span>
  );
}

/**
 * Confidence as a BAND, never a number. A percentage invites the user to
 * argue with the matcher; three steps say "how sure we are" without pretending
 * to a precision the score does not have. Reuses SegmentedBar so confidence and
 * progress read as the same visual language.
 */
export function ConfidenceBand({
  band,
  surface = 'blue',
}: {
  band: 'low' | 'medium' | 'high';
  surface?: Surface;
}) {
  const active = { low: 0, medium: 1, high: 2 }[band];
  return (
    <span className="flex items-center gap-[12px]">
      <span className="w-[84px]">
        <SegmentedBar count={3} active={active} surface={surface} />
      </span>
      <span
        className={cx(
          'text-[13px] leading-[18px] capitalize',
          surface === 'blue' ? 'text-[var(--color-white)]' : 'text-[var(--color-black-700)]',
        )}
      >
        {band} confidence
      </span>
    </span>
  );
}

/**
 * The two-action footer for an irreversible choice. Destructive-ish action sits
 * left as the secondary, commitment sits right as the primary, and neither is
 * ever the same width as the other by accident: PASS hugs, MATCH takes the
 * remaining room, so the affirmative is physically the bigger target.
 */
export function DecisionBar({
  passLabel = 'PASS',
  actionLabel,
  onPass,
  onAction,
  disabled,
  surface = 'light',
}: {
  passLabel?: string;
  actionLabel: string;
  onPass: () => void;
  onAction: () => void;
  disabled?: boolean;
  surface?: Surface;
}) {
  return (
    <div className="flex items-center gap-[12px]">
      <Button variant="secondary" surface={surface} size="lg" onClick={onPass} disabled={disabled}>
        {passLabel}
      </Button>
      <Button surface={surface} size="lg" className="flex-1" onClick={onAction} disabled={disabled}>
        {actionLabel}
      </Button>
    </div>
  );
}

// ------------------------------------------------------- step scaffolding
//
// Onboarding is the app and the app is LIGHT (redesign.md 7), so everything
// from here down is written light-only rather than taking a `surface` prop.
// That is deliberate: a step CANNOT accidentally be built on blue, because
// there is no switch to flip. Blue is spent where it is earned — the paused
// state and the blind match card — and those compose the blue primitives above.

/** Title 4A. The uppercase label above a heading or a group. */
export function SectionLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'block text-[14px] font-medium uppercase leading-[100%] tracking-[0.5px] text-[var(--color-black-500)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * label → heading → body, and the 24 that separates the header block from the
 * content under it. The rhythm lives HERE rather than in each step, so
 * "6 then 4 then 24" is a property of the system and not eleven independent
 * decisions that drift apart. (redesign.md 3, vertical rhythm.)
 *
 * Body copy caps at 44ch. Longer measures are where a 560px card starts reading
 * like a document.
 */
export function StepHeader({ label, heading, body }: { label: string; heading: ReactNode; body?: ReactNode }) {
  return (
    <header className="mb-[24px] flex flex-col">
      <SectionLabel>{label}</SectionLabel>
      {/* Heading 4. On a light surface the heading is Black 700 and the
          emphasis inside it is Blue 600 — yellow never lands on light. */}
      <h2 className="rebrand-display mt-[6px] text-[32px] font-normal leading-[100%] text-[var(--color-black-700)]">
        {heading}
      </h2>
      {/* 12, not the 4 the scale first said. The scale measures BOXES, and a
          32px display line set at line-height 100% has zero leading under it —
          its descenders sit flush on the box edge — while the 14px uppercase
          label above has no descenders at all. So a metric 4 here read TIGHTER
          than the metric 6 above it, under a heading four times the size.
          These are optical values; see redesign.md 3. */}
      {body ? (
        <p className="mt-[12px] max-w-[44ch] text-[16px] leading-[120%] text-[var(--color-black-700)]">{body}</p>
      ) : null}
    </header>
  );
}

/**
 * A labelled group inside a step. 8 from its label to its content, 24 from the
 * group above it. `aside` is the right-hand counter ("1 of 3") when the group
 * has one.
 */
export function StepSection({
  label,
  aside,
  children,
  className = '',
}: {
  label?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx('mt-[24px] flex flex-col gap-[8px] first:mt-0', className)}>
      {label ? (
        <div className="flex items-center justify-between gap-[12px]">
          <SectionLabel>{label}</SectionLabel>
          {aside ? (
            <span className="text-[13px] font-medium leading-[120%] tracking-[1.5px] text-[var(--color-black-500)]">
              {aside}
            </span>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** A recessed container. The light-surface equivalent of a Blue 700 well. */
export function Well({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'rounded-[12px] border border-[var(--color-black-200)] bg-[var(--color-black-50)] p-[16px]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * A bordered list. The CONTAINER owns the boundary: rows inside draw no border
 * of their own, and only a selected row resolves into a surface. A search field
 * or a column header belongs INSIDE this box, divided off — never floating
 * above it as a peer, which reads as two unrelated objects. (redesign.md 5.7.)
 */
export function ListContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('overflow-hidden rounded-[12px] border border-[var(--color-black-100)]', className)}>
      {children}
    </div>
  );
}

/** A divided strip inside a ListContainer: search row, column header, footer. */
export function ListBand({
  children,
  recessed,
  className = '',
}: {
  children: ReactNode;
  recessed?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'flex items-center border-b border-[var(--color-black-100)] px-[16px]',
        recessed ? 'bg-[var(--color-black-50)] py-[8px]' : 'py-[12px]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** The tile a glyph or a mark sits in. 48 in a list row, 28 inline in a field. */
export function IconTile({ children, size = 48 }: { children: ReactNode; size?: 48 | 28 }) {
  return (
    <span
      className={cx(
        'grid shrink-0 place-items-center bg-[var(--color-blue-100)] text-[var(--color-blue-600)]',
        size === 48 ? 'size-[48px] rounded-[12px]' : 'size-[28px] rounded-[8px] text-[12px] leading-none',
      )}
    >
      {children}
    </span>
  );
}

/**
 * The selection mark. Filled Blue 600 with a white check when on; an empty ring
 * when off. Never an opacity change — the off state is its own treatment.
 */
export function CheckDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cx(
        'grid size-[20px] shrink-0 place-items-center rounded-full border text-[11px] font-medium leading-none transition-colors',
        checked
          ? 'border-[var(--color-blue-600)] bg-[var(--color-blue-600)] text-[var(--color-white)]'
          : 'border-[var(--color-black-200)] text-transparent',
      )}
    >
      ✓
    </span>
  );
}

/**
 * One selectable row. Selection is a SURFACE change (Blue 100 fill, Blue 600
 * border) plus the mark; it is never a tint of the accent over the row.
 *
 * `bare` drops the row's own border for use inside a ListContainer, which owns
 * the boundary instead.
 */
export function SelectRow({
  selected,
  leading,
  trailing,
  dot = true,
  bare,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  selected: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  dot?: boolean;
  bare?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(
        'flex w-full items-center gap-[12px] rounded-[10px] border px-[16px] py-[12px] text-left transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]',
        selected
          ? 'border-[var(--color-blue-600)] bg-[var(--color-blue-100)]'
          : bare
            ? 'border-transparent hover:bg-[var(--color-black-50)]'
            : 'border-[var(--color-black-100)] hover:bg-[var(--color-black-50)]',
        className,
      )}
      {...rest}
    >
      {leading}
      <span className="min-w-0 flex-1 text-[14px] leading-[16px] text-[var(--color-black-700)]">{children}</span>
      {trailing}
      {dot ? <CheckDot checked={selected} /> : null}
    </button>
  );
}

/**
 * A selectable chip. Same three-category logic as the pills: this is the
 * INTERACTIVE one, so unlike title- and descriptive-pills it is a real button.
 * Selected takes the primary-button pair (Blue 600 / White) rather than a tint.
 */
export function Chip({
  selected,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(
        'rounded-[8px] border px-[14px] py-[8px] text-[13px] leading-[18px] transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]',
        selected
          ? 'border-[var(--color-blue-600)] bg-[var(--color-blue-600)] text-[var(--color-white)]'
          : 'border-[var(--color-black-100)] bg-[var(--color-black-100)] text-[var(--color-black-700)] hover:border-[var(--color-black-200)]',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * The shell an input sits in when the field carries more than the input itself
 * — a mark, a fixed label, a hint. The border and focus ring belong to the
 * shell so the whole composite lights up as one control.
 */
export function FieldShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'flex items-center gap-[12px] rounded-[8px] border border-[var(--color-black-200)] bg-[var(--color-white)] px-[16px] py-[12px]',
        'transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-blue-600)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * NUMBER PAGINATION — a review control, not a product control.
 *
 * It came from the KYC round's HTML guide, where jumping straight to screen 9
 * is the whole point of the page. It has no business inside onboarding itself:
 * a flow whose steps you can skip around is not a flow, and the product's
 * progress read-out is the SegmentedBar, which is deliberately non-interactive.
 *
 * Kept here because it is genuinely reusable across review surfaces — the
 * gallery, and whatever previews come after it. Registered in redesign.md as a
 * review-surface component so nobody reaches for it on a real screen.
 */
export function NumberPagination({
  items,
  value,
  onChange,
  label,
  className = '',
}: {
  items: { value: number; label: string }[];
  value: number;
  onChange: (value: number) => void;
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cx('flex gap-[4px]', className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            aria-current={active ? 'step' : undefined}
            onClick={() => onChange(item.value)}
            className={cx(
              'shrink-0 rounded-[8px] border px-[9px] py-[6px] text-[13px] leading-[18px] tabular-nums transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]',
              active
                ? 'border-[var(--color-blue-600)] bg-[var(--color-blue-600)] text-[var(--color-white)]'
                : 'border-[var(--color-black-200)] bg-[var(--color-white)] text-[var(--color-black-700)] hover:border-[var(--color-black-300)]',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

/**
 * A country, as a mark. Two letters on a Blue 100 tile in Blue 600.
 *
 * NOT a flag. Emoji flags were the first attempt and they are unreliable by
 * platform — Windows has no flag glyphs at all and renders the regional
 * indicator pair as bare grey letters, which is how this arrived as "almost
 * invisible". Real flag artwork fixes legibility and breaks something worse:
 * twelve full-colour rectangles would be the only full-colour elements in a
 * system built from two hues, and 2.x exists to stop exactly that.
 *
 * So the code is the mark, drawn from the ramp, identical on every platform
 * and needing no asset, no CDN and no licence.
 */
export function CountryMark({ code }: { code: string }) {
  return (
    <span
      aria-hidden
      className="grid h-[20px] w-[28px] shrink-0 place-items-center rounded-[4px] bg-[var(--color-blue-100)] text-[11px] font-medium leading-none tracking-[0.5px] text-[var(--color-blue-600)]"
    >
      {code}
    </span>
  );
}

/** The bare input that lives inside a FieldShell. */
export function FieldInput({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        'min-w-0 flex-1 bg-transparent text-[14px] leading-[100%] text-[var(--color-black-700)] outline-none',
        'placeholder:text-[var(--color-black-400)]',
        className,
      )}
      {...rest}
    />
  );
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(
        'w-full resize-none rounded-[8px] border border-[var(--color-black-200)] bg-[var(--color-white)] px-[16px] py-[12px]',
        'text-[16px] leading-[120%] text-[var(--color-black-700)] outline-none placeholder:text-[var(--color-black-400)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]',
        className,
      )}
      {...rest}
    />
  );
}

/** A disclosure with a count. The count is the answer to "did I do this one?". */
export function Accordion({
  title,
  count,
  open,
  onToggle,
  children,
}: {
  title: string;
  count?: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[var(--color-black-100)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cx(
          'flex w-full items-center gap-[10px] px-[16px] py-[14px] text-left transition-colors hover:bg-[var(--color-black-50)]',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-blue-600)]',
        )}
      >
        <span className="flex-1 text-[16px] font-medium leading-[20px] tracking-[0.5px] text-[var(--color-black-700)]">
          {title}
        </span>
        <span className="min-w-[14px] text-right text-[13px] leading-[18px] text-[var(--color-black-500)]">
          {count || ''}
        </span>
        <ChevronGlyph open={open} />
      </button>
      {open ? (
        <div className="flex flex-col gap-[6px] border-t border-[var(--color-black-100)] p-[8px]">{children}</div>
      ) : null}
    </div>
  );
}

function ChevronGlyph({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden
      className={cx('shrink-0 text-[var(--color-black-500)] transition-transform', open && 'rotate-180')}
    >
      {/* Drawn on a 12 grid at 12px, so the attribute IS the rendered weight. */}
      <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth={iconStroke(12, 12)} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * DAYLIGHTBAND — a 24-hour track with a window drawn on it, always in the
 * VIEWER's local frame. (redesign.md 5.12.)
 *
 * The point is that a timezone is unreadable as a number and obvious as a
 * picture: "UTC+9" tells you nothing about whether you can meet someone, and a
 * bar that does or does not sit under yours tells you immediately.
 *
 * A window that crosses midnight renders as TWO segments, one at each end,
 * because that is what it is. A single wrapped bar would draw 9pm–1am as though
 * it ran backwards through the whole day.
 */
export function DaylightBand({
  windows,
  tone = 'overlap',
  surface = 'light',
  label,
  className = '',
}: {
  /** `[startHour, endHour]` pairs in the viewer's frame. May be negative or
   *  past 24 — they wrap. */
  windows: [number, number][];
  tone?: 'me' | 'overlap' | 'off';
  surface?: Surface;
  label: string;
  className?: string;
}) {
  const onBlue = surface === 'blue';
  const track = onBlue ? 'var(--color-blue-700)' : 'var(--color-black-100)';
  const fill = onBlue
    ? { me: 'var(--color-white)', overlap: 'var(--color-blue-400)', off: 'var(--color-blue-500)' }[tone]
    : { me: 'var(--color-blue-600)', overlap: 'var(--color-blue-300)', off: 'var(--color-black-300)' }[tone];

  const norm = (h: number) => ((h % 24) + 24) % 24;
  const pct = (h: number) => ((h / 24) * 100).toFixed(2);

  // Split anything that crosses midnight, then sort and merge, so two touching
  // windows draw as one bar and the gradient stops stay monotonic.
  const parts: [number, number][] = [];
  for (const [start, end] of windows) {
    const s = norm(start);
    const e = norm(end);
    if (s === e) continue;
    if (s < e) parts.push([s, e]);
    else parts.push([0, e], [s, 24]);
  }
  parts.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const p of parts) {
    const last = merged[merged.length - 1];
    if (last && p[0] <= last[1]) last[1] = Math.max(last[1], p[1]);
    else merged.push([p[0], p[1]]);
  }

  const stops: string[] = [];
  let cursor = 0;
  for (const [from, to] of merged) {
    if (from > cursor) stops.push(`transparent ${pct(cursor)}% ${pct(from)}%`);
    stops.push(`${fill} ${pct(from)}% ${pct(to)}%`);
    cursor = to;
  }
  if (cursor < 24) stops.push(`transparent ${pct(cursor)}% 100%`);

  return (
    <span
      role="img"
      aria-label={label}
      className={cx('block h-[16px] rounded-[4px]', className)}
      style={{ backgroundColor: track, backgroundImage: `linear-gradient(90deg, ${stops.join(',')})` }}
    />
  );
}

/** A day plus its concrete windows. Availability is never a vague "evenings". */
export function AvailabilitySlot({ day, times, surface = 'light' }: { day: string; times: string[]; surface?: Surface }) {
  const onBlue = surface === 'blue';
  return (
    <div
      className={cx(
        'flex min-w-0 flex-1 flex-col gap-[4px] rounded-[10px] p-[12px]',
        onBlue ? 'bg-[var(--color-blue-700)]' : 'bg-[var(--color-blue-50)]',
      )}
    >
      <span
        className={cx(
          'text-[12px] font-medium uppercase leading-[120%] tracking-[1px]',
          onBlue ? 'text-[var(--color-blue-300)]' : 'text-[var(--color-black-500)]',
        )}
      >
        {day}
      </span>
      {times.map((t) => (
        <span
          key={t}
          className={cx('text-[14px] leading-[16px]', onBlue ? 'text-[var(--color-white)]' : 'text-[var(--color-black-700)]')}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
