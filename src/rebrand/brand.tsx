/**
 * Brand marks. Kept apart from primitives.tsx because these are artwork with
 * fixed geometry, not composable UI: they take a size and inherit colour, and
 * that is the whole API.
 */

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
