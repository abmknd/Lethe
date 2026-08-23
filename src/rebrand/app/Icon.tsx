import { HugeiconsIcon } from '@hugeicons/react';
import { iconStroke, ICON_SIZE } from '../primitives';

/**
 * THE ONE PLACE AN ICON IS RENDERED.
 *
 * Owns size, stroke and colour so no caller sets any of them. Colour is
 * `currentColor`, so the surrounding token decides it exactly like text.
 *
 * ── Why this removes the Figma/code mismatch ────────────────────────────────
 *
 * The Figma library IS HugeIcons, and a layer in the file is named with the
 * library's own name — `bulb`, `cancel-01`, `location-09`. The package exports
 * the same set under a mechanical transform of that name:
 *
 *     bulb          -> BulbIcon
 *     cancel-01     -> Cancel01Icon
 *     location-09   -> Location09Icon
 *
 * kebab-case to PascalCase, plus `Icon`. So reading a screen means reading the
 * layer names and importing them — there is nothing to sync, nothing to export,
 * and no room to improvise. 14,716 icons are already here.
 *
 * Two things break that, and both are fixable IN FIGMA rather than in code:
 *
 *   A FLATTENED VECTOR has no component name. The header bell and envelope are
 *   flattened lucide paths in unnamed `Icon` frames, so nothing identifies
 *   them; they live in src/assets/system_icons as exports until they are
 *   replaced with real instances.
 *
 *   A PRO-ONLY ICON is named but absent from the free package (`substack`).
 *   Same treatment.
 */
export function Icon({
  icon,
  size = ICON_SIZE.sm,
  className,
  label,
}: {
  /** An export from `@hugeicons/core-free-icons`. */
  icon: Parameters<typeof HugeiconsIcon>[0]['icon'];
  size?: number;
  className?: string;
  /** Only when the icon is the sole carrier of meaning. Otherwise it is
   *  decorative and stays hidden from assistive tech. */
  label?: string;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={iconStroke(size)}
      color="currentColor"
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
}
