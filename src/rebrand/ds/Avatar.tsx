import { AVATARS, type AvatarName } from '../../assets/avatars';

/**
 * AVATAR — Figma's component set, 903:19925.
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
 * WHAT THE COMPONENT ACTUALLY DRAWS, read out of `button-content` rather than
 * guessed from a frame's box:
 *
 *   - a `border/primary/highlight` ring, which resolves to WHITE. It is not a
 *     hairline in a grey — it is the separation a stacked or overlapping avatar
 *     needs, and it is on EVERY avatar, not only stacked ones.
 *   - `border/width/sm` (1px) at 32 and below, `border/width/lg` (2px) at 40
 *     and above. Both are in the file; the small controls carry the thin one.
 *   - an initials fallback in 12/16 Light `text/default/subtle`, sitting under
 *     the image so a missing face degrades to two letters rather than a hole.
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

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

export function Avatar({
  name,
  src: srcProp,
  person,
  size = 'sm',
}: {
  /** A member of the `Avatar Image` set. Omit and the initials show through. */
  name?: AvatarName;
  /**
   * A real uploaded photo. `Avatar Image` is Figma's demo cast; the product
   * renders whatever the user gave it, so a URL wins over a set member.
   */
  src?: string;
  /** The person's name — the initials fallback, and the alt text. */
  person?: string;
  size?: AvatarSize;
}) {
  const px = AVATAR_SIZE[size];
  const src = srcProp ?? (name ? AVATARS[name] : undefined);

  return (
    <span
      className={
        'relative inline-block shrink-0 overflow-hidden rounded-[var(--border-radius-round)] ' +
        'border-[var(--border-primary-highlight)] bg-[var(--surface-neutral-default)] ' +
        (px >= 40 ? 'border-[length:var(--border-width-lg)]' : 'border-[length:var(--border-width-sm)]')
      }
      style={{ width: px, height: px }}
    >
      {person && (
        <span className="absolute inset-0 grid place-items-center text-[12px] font-light leading-[16px] text-[var(--text-default-subtle)]">
          {initialsOf(person)}
        </span>
      )}
      {src && (
        <img
          src={src}
          alt={person ?? ''}
          className="absolute inset-0 size-full rounded-[var(--border-radius-round)] object-cover"
        />
      )}
    </span>
  );
}

/**
 * AVATAR STACK — `Avatar Stack` 935:4357.
 *
 * A FLEX ROW WITH NEGATIVE RIGHT MARGINS, which is how the component is built
 * and it is not a detail. In a flex row, later siblings paint over earlier ones,
 * so the RIGHTMOST avatar sits on top and the stack reads as receding to the
 * left.
 *
 * This was absolutely positioned with `zIndex: people.length - i`, which put the
 * LEFTMOST on top and inverted the whole thing. Every avatar overlapped the
 * wrong neighbour and the stack leaned the wrong way. Nothing about the size or
 * the spacing was wrong, which is why it measured correctly and still looked
 * wrong — the same trap as building from geometry instead of reading the node.
 *
 * The overlap is the component's: `mr-[-16px]` at md, `mr-[-10px]` at sm, and
 * the last child has none. The width falls out of that rather than being set —
 * three 32s at -16 is 64, three 20s at -10 is 40, which is exactly what Figma
 * reports. A hardcoded width would be the same number by luck and would stop
 * being true the moment the count changed.
 *
 * The white ring around each avatar belongs to `Avatar` itself
 * (`border/primary/highlight`), not to the stack.
 */
export function AvatarStack({
  people,
  size = 'md',
}: {
  /** A demo `name`, a live `src`, or neither — the initials carry it then. */
  people: { name?: AvatarName; src?: string; person: string }[];
  size?: 'sm' | 'md';
}) {
  const overlap = size === 'md' ? 16 : 10;
  const shown = people.slice(0, 3);

  return (
    <span className="flex shrink-0 items-center">
      {shown.map((p, i) => (
        <span
          key={p.person}
          className="flex shrink-0 items-center"
          // Every child but the last pulls the next one back over it. No
          // z-index: the DOM order already paints later over earlier, which is
          // the lean the component has.
          style={i < shown.length - 1 ? { marginRight: -overlap } : undefined}
        >
          <Avatar name={p.name} src={p.src} person={p.person} size={size === 'md' ? 'sm' : 'xs'} />
        </span>
      ))}
    </span>
  );
}
