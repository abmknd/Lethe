/**
 * Brand marks. Kept apart from primitives.tsx because these are artwork with
 * fixed geometry, not composable UI: they take a size and a surface, and that
 * is the whole API.
 *
 * The SVGs are the authored source files in src/assets/logos. Earlier this was
 * a hand-traced path approximating the Figma export; that guess is gone.
 * Both a white and a blue variant exist, so the surface picks the file instead
 * of us recolouring artwork we did not author.
 */

import logomarkWhite from '../assets/logos/logomark_white.svg';
import logomarkBlue from '../assets/logos/logomark_blue.svg';
import logowordWhite from '../assets/logos/logoword_white.svg';
import logowordBlue from '../assets/logos/logoword_blue.svg';
import brandmarkWhite from '../assets/logos/brandmark_white.svg';
import brandmarkBlue from '../assets/logos/brandmark_blue.svg';
import type { Surface } from './primitives';

export function Logomark({ size = 20, surface = 'blue' }: { size?: number; surface?: Surface }) {
  return (
    <img
      src={surface === 'blue' ? logomarkWhite : logomarkBlue}
      alt=""
      aria-hidden
      width={size}
      height={size}
      className="block shrink-0 select-none"
    />
  );
}

/** Full wordmark. Use where the brand needs to be read, not just recognised. */
export function Logoword({ height = 20, surface = 'blue' }: { height?: number; surface?: Surface }) {
  return (
    <img
      src={surface === 'blue' ? logowordWhite : logowordBlue}
      alt="Relethe"
      height={height}
      style={{ height }}
      className="block w-auto shrink-0 select-none"
    />
  );
}

/**
 * BRANDMARK — the six-petal mark, on its own.
 *
 * Figma's `relethe-logos` (708:137) has the app header on `Property 1 =
 * brandmark_blue`, and the file's own artwork sits at inset 5% of its box: a 32
 * frame carries a 28.8 mark, not a 32 one. That 5% is the difference between
 * the header logo reading as placed and reading as jammed into its corner.
 *
 * `logomark` and `brandmark` are two different drawings in this set, so they
 * get two components rather than one with a flag. The app header wants this one.
 */
export function Brandmark({ size = 32, surface = 'light' }: { size?: number; surface?: Surface }) {
  return (
    <span className="relative block shrink-0" style={{ width: size, height: size }}>
      <img
        src={surface === 'blue' ? brandmarkWhite : brandmarkBlue}
        alt="Relethe"
        className="absolute inset-[5%] size-[90%] select-none"
      />
    </span>
  );
}

/**
 * SVG spirograph "flower" standing in for the generated survey pinwheel.
 * Layered rotated ellipses trace an 8-fold guilloche bloom.
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
