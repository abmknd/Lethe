import type { ReactNode } from 'react';
import { AVATARS, type AvatarName } from '../../assets/avatars';

/**
 * AVATAR — Figma's component set, reduced to its real axes.
 *
 * The file ships 144 variants over Status x Style x Type x Size. Three of those
 * axes matter in code and one does not:
 *
 *   Size    xxs 16 · xs 20 · sm 32 · lg 40 · xl 64 · xxl 72   (there is no md)
 *   Type    image | icon | initials
 *   Style   fill | outline
 *   Status  default/hover/focus/disabled — CSS states, not props
 *
 * Status is deliberately not a prop. A component that takes `status="hover"`
 * makes the caller responsible for something the browser already knows, and
 * every caller then has to remember to wire it.
 *
 * The size scale is the design system's, not ours: `md` does not exist, so a
 * number is not accepted here. Passing 44 because a frame looked like 44 is how
 * a scale stops being a scale.
 */

export const AVATAR_SIZE = {
  xxs: 16,
  xs: 20,
  sm: 32,
  lg: 40,
  xl: 64,
  xxl: 72,
} as const;

export type AvatarSize = keyof typeof AVATAR_SIZE;

export function Avatar({
  name,
  size = 'sm',
  style = 'fill',
  ring,
  alt = '',
}: {
  /** A person in the `Avatar Image` set. Omit for the empty state. */
  name?: AvatarName;
  size?: AvatarSize;
  style?: 'fill' | 'outline';
  /** The 2px white ring an overlapping stack needs to separate its members. */
  ring?: boolean;
  alt?: string;
}) {
  const px = AVATAR_SIZE[size];
  const src = name ? AVATARS[name] : undefined;

  return (
    <span
      className={
        'inline-block shrink-0 overflow-hidden rounded-full bg-[var(--surface-neutral-subtle)] ' +
        (style === 'outline' ? 'border border-[var(--border-disabled-deep)] ' : '') +
        (ring ? 'ring-2 ring-[var(--surface-neutral-default)]' : '')
      }
      style={{ width: px, height: px }}
    >
      {src ? <img src={src} alt={alt} className="size-full object-cover" /> : null}
    </span>
  );
}

/**
 * AVATAR STACK — `Size=md` is 64x32, `Size=sm` is 40x20.
 *
 * Those numbers are the component's own, and they encode the overlap: three
 * 32s in 64 means each sits 16 further along, not 32. The stack is a fixed
 * width, so it does not grow as people are added — it is a summary, and the
 * count beside it carries the rest.
 */
export function AvatarStack({
  people,
  size = 'md',
}: {
  people: AvatarName[];
  size?: 'sm' | 'md';
}) {
  const px = size === 'md' ? 32 : 20;
  const step = size === 'md' ? 16 : 10;
  const width = size === 'md' ? 64 : 40;

  return (
    <span className="relative inline-block shrink-0" style={{ width, height: px }}>
      {people.slice(0, 3).map((n, i) => (
        <span key={n} className="absolute top-0" style={{ left: i * step, zIndex: people.length - i }}>
          <Avatar name={n} size={size === 'md' ? 'sm' : 'xs'} ring />
        </span>
      ))}
    </span>
  );
}

/** A round control that holds an icon or an avatar — Figma's `Badge Button`. */
export function BadgeButton({
  label,
  children,
  style = 'outline',
  onClick,
}: {
  label: string;
  children: ReactNode;
  style?: 'fill' | 'outline';
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={
        'relative grid size-[32px] shrink-0 place-items-center rounded-full transition-colors ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-primary-default)] ' +
        (style === 'fill'
          ? 'bg-[var(--surface-primary-subtle)] text-[var(--text-default-highlight-blue)]'
          : 'border border-[var(--border-disabled-deep)] bg-[var(--surface-neutral-default)] text-[var(--icons-neutral-default)] hover:bg-[var(--surface-page-beta)]')
      }
    >
      {children}
    </button>
  );
}
