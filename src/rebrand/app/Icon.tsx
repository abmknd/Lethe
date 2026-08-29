import type { ComponentType } from 'react';
import { iconStroke, ICON_SIZE } from '../primitives';

/**
 * THE ONE PLACE AN ICON IS RENDERED.
 *
 * Owns size, stroke and colour so no caller sets any of them. Colour is
 * `currentColor`, so the surrounding token decides it exactly like text.
 *
 * Stroke needs the icon's DRAWN grid, not an assumed 24: Figma exports an
 * instance at the size it was placed, so these arrive on 16 and 20 grids. Each
 * generated component carries its own `grid`, and passing 24 regardless is what
 * rendered every icon at 1.5 instead of 1.
 *
 * Icons come from `src/assets/system_icons`, generated out of Figma by
 * scripts/import-figma-icons.mjs. They are LOCAL on purpose: the Figma file
 * mixes HugeIcons free, HugeIcons pro and some flattened lucide leftovers, so
 * no single package can cover it and every screen would otherwise risk another
 * "this one is not in the package". Exported, provenance stops mattering.
 */
export function Icon({
  as: Glyph,
  size = ICON_SIZE.sm,
  className,
  label,
}: {
  as?: ComponentType<{ size?: number; strokeWidth?: number; className?: string }> & { grid?: number };
  size?: number;
  className?: string;
  /** Only when the icon is the sole carrier of meaning. Otherwise it stays
   *  hidden from assistive tech, which the generated components default to. */
  label?: string;
}) {
  // A missing glyph renders as empty space rather than taking the page down.
  // This caught a real one: renaming a rail item to "Matches" left RAIL_ICON
  // keyed on "All", so the lookup returned undefined and `Glyph.grid` threw
  // through the whole shell. A gap in an icon map should cost an icon.
  if (!Glyph) return <span aria-hidden className={className} style={{ width: size, height: size }} />;

  return (
    <span
      className={'inline-grid shrink-0 place-items-center ' + (className ?? '')}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      <Glyph size={size} strokeWidth={iconStroke(size, Glyph.grid ?? size)} />
    </span>
  );
}
