/**
 * BADGE ICON — Figma `Badge Icon` 798:5067.
 *
 * The dot. 30 variants over `Status × Shape × Size × Type`:
 *
 *     Size    xs 4 · sm 6 · md 8 · lg 12 · xl 16
 *     Shape   circle | star
 *     Type    fill | outlined
 *     Status  default (Blue 600) | on-color (White)
 *
 * The circle is drawn here rather than exported, and that is not a violation of
 * the never-draw-a-glyph rule: a circle is a shape with no design in it, and
 * `border-radius: 50%` reproduces it exactly at every size. `outlined` is the
 * same circle with the paint moved to a 1px ring.
 *
 * `Shape=star` IS a drawing, so it is not implemented. The component takes the
 * prop and refuses it in types rather than substituting something star-shaped;
 * when a screen needs it, export 799:5105 and add it here.
 */

const SIZE = { xs: 4, sm: 6, md: 8, lg: 12, xl: 16 } as const;

export function BadgeIcon({
  size = 'sm',
  type = 'fill',
  status = 'default',
  ring = false,
}: {
  size?: keyof typeof SIZE;
  type?: 'fill' | 'outlined';
  status?: 'default' | 'on-color';
  /** The white separator a badge needs when it sits on top of another shape —
   *  what `Badge Button`'s notification dot uses. */
  ring?: boolean;
}) {
  const px = SIZE[size];
  const paint = status === 'on-color' ? 'var(--text-neutral-heading)' : 'var(--surface-primary-default)';
  return (
    <span
      aria-hidden
      className={'inline-block shrink-0 rounded-full ' + (ring ? 'border border-[var(--border-primary-highlight)]' : '')}
      style={{
        width: px,
        height: px,
        background: type === 'fill' ? paint : 'transparent',
        boxShadow: type === 'outlined' ? `inset 0 0 0 1px ${paint}` : undefined,
      }}
    />
  );
}
