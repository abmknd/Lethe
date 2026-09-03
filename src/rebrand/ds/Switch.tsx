import type { ReactNode } from 'react';
import { Nob } from './Nob';
import { NavButtonText } from './TabBar';

/**
 * SWITCH BUTTON — Figma `Switch Button` 800:5678.
 *
 * The on/off switch. A `surface/primary/subtle-hover` track at `p-2` holding
 * TWO Nobs of the same size, and the state moves the paint between them rather
 * than moving a box: whichever Nob is live gets the white fill and
 * `nob-shadow-01`, and the other is the transparent variant.
 *
 * That is why `Nob` has a transparent type at all, and it is a better model
 * than an absolutely positioned thumb — the track's width is the sum of its
 * children, so it cannot drift out of step with the Nob size.
 *
 *     xs  16 nobs -> 36 track     sm  20 -> 44     md  24 -> 58*
 *     (*md's track is 58 because its nobs are 26 in the file, not 24)
 *
 * `nob-shadow-01` is two drop shadows at #00000014, offset (2,-2) and (-2,2),
 * radius 6, spread 1 — a light from nowhere in particular, which is what keeps
 * the thumb readable on both the light and dark modes of the track.
 */

const NOB_SIZE = { xs: 'xs', sm: 'sm', md: 'md' } as const;

export function SwitchButton({
  on = false,
  size = 'xs',
  disabled,
  label,
  onChange,
}: {
  on?: boolean;
  size?: keyof typeof NOB_SIZE;
  disabled?: boolean;
  label: string;
  onChange?: (on: boolean) => void;
}) {
  const thumb = (
    <span className="drop-shadow-[2px_-2px_6px_rgba(0,0,0,0.08)]">
      <Nob fill="achromatic" size={NOB_SIZE[size]} disabled={disabled} />
    </span>
  );
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!on)}
      className={
        'inline-flex shrink-0 items-center rounded-[var(--border-radius-round)] p-[2px] transition-colors ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-primary-default)] ' +
        (disabled
          ? 'cursor-not-allowed bg-[var(--surface-neutral-subtle)]'
          : on
            ? 'bg-[var(--surface-primary-default)]'
            : 'bg-[var(--surface-primary-subtle-hover)]')
      }
    >
      {on ? <Nob size={NOB_SIZE[size]} /> : thumb}
      {on ? thumb : <Nob size={NOB_SIZE[size]} />}
    </button>
  );
}

/**
 * SWITCH TOGGLE — Figma `Switch Toggle` 844:3850.
 *
 * Not a switch: a two-up segmented control, `surface/primary/subtle` at `p-4`
 * holding two Toggle Buttons. `Type` decides how the selection is marked:
 *
 *     default    844:3851  the active label goes Medium in `text/default/heading`
 *     highlight  844:3863  the active segment becomes a WHITE pill with a BLUE
 *                          label — Toggle Button `Type=fill`
 *
 * On `default` the first button carries `mr-[-12px]` in the file: the two
 * overlap by 12 so the pair reads as one control rather than two pills sharing
 * a bed. `highlight` does not overlap, because the white pill needs its own
 * edges to be visible.
 */
export function SwitchToggle({
  first,
  second,
  value,
  type = 'default',
  onChange,
}: {
  first: ReactNode;
  second: ReactNode;
  value: 'first' | 'second';
  type?: 'default' | 'highlight';
  onChange?: (v: 'first' | 'second') => void;
}) {
  const highlight = type === 'highlight';
  const seg = (which: 'first' | 'second', children: ReactNode, overlap: boolean) => {
    const active = value === which;
    return (
      <button
        type="button"
        onClick={() => onChange?.(which)}
        aria-pressed={active}
        className={
          'inline-flex shrink-0 items-center justify-center gap-[2px] rounded-[var(--border-radius-round)] px-[12px] py-[8px] transition-colors ' +
          (highlight && active ? 'bg-[var(--surface-neutral-default)] ' : '') +
          (!highlight && overlap ? 'mr-[-12px] ' : '')
        }
      >
        <NavButtonText color={highlight && active ? 'blue' : 'black'} selected={active}>
          {children}
        </NavButtonText>
      </button>
    );
  };
  return (
    <div className="inline-flex items-center rounded-[var(--border-radius-round)] bg-[var(--surface-primary-subtle)] p-[4px]">
      {seg('first', first, true)}
      {seg('second', second, false)}
    </div>
  );
}
