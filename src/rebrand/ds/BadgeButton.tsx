import { Icon, type Glyph } from './Icon';
import { BadgeIcon } from './BadgeIcon';

/**
 * BADGE BUTTON — Figma `Badge Button` 865:5792.
 *
 * `p-8` around a 16 glyph on a 240 radius — a 32 control, and the icon is 16,
 * not 18. Two fills are placed:
 *
 *     865:6475  white, a 1px `text/neutral/deep` ring   the header controls
 *     865:6443  `surface/primary/subtle`, no ring       follow / message / socials
 *
 * INK IS A SEPARATE AXIS FROM FILL. This was wired the other way once, with
 * `subtle` implying blue ink, and it turned every follow and message button in
 * both right sidebars blue. Figma places the `Color=Neutral` glyph on those and
 * the `Color=Primary` one only in the socials row — same fill, different ink.
 *
 * The dot is `Badge Icon` `Size=sm` with a white ring, pinned 1.5 from the top
 * right corner — `absolute right-[1.5px] size-[6px] top-[1.5px]` on 865:6480.
 *
 * THE WRAPPER MUST BE `flex`. As a bare `<span>` it is inline, so it takes a
 * line box from the button's line-height and measures 6 x 24 rather than 6 x 6.
 * The dot then sits on the baseline 12.5 down instead of 1.5, and the offset
 * looks like it was never applied. Same failure as the header avatar, which was
 * `block` inside a button and measured 39 instead of 32: an inline box is sized
 * by typography, not by its contents.
 */
export function BadgeButton({
  label,
  glyph,
  tone = 'outline',
  ink = 'neutral',
  dot = false,
  mirrored = false,
  onClick,
}: {
  label: string;
  glyph: Glyph;
  tone?: 'outline' | 'subtle';
  ink?: 'neutral' | 'primary';
  dot?: boolean;
  /** Figma mirrors a couple of glyphs in place. The flip belongs to the usage,
   *  not to the exported file, so it is applied here. */
  mirrored?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={
        'relative grid size-[32px] shrink-0 place-items-center rounded-[var(--border-radius-round)] transition-colors ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-primary-default)] ' +
        (ink === 'primary' ? 'text-[var(--icons-primary-default)] ' : 'text-[var(--icons-neutral-default)] ') +
        (tone === 'subtle'
          ? 'bg-[var(--surface-primary-subtle)] hover:bg-[var(--color-blue-100)]'
          : 'shadow-[inset_0_0_0_1px_var(--text-neutral-deep)] bg-[var(--surface-neutral-default)] ' +
            'hover:bg-[var(--surface-neutral-subtle)]')
      }
    >
      <Icon as={glyph} size={16} className={mirrored ? '-scale-x-100' : undefined} />
      {dot && (
        <span className="absolute right-[1.5px] top-[1.5px] flex">
          <BadgeIcon size="sm" ring />
        </span>
      )}
    </button>
  );
}
