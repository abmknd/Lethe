import { Avatar } from './Avatar';
import { TITLE_6 } from './type';
import type { AvatarName } from '../../assets/avatars';
import focusRing from '../assets/app/suggestion-bubble-focus.png';

/**
 * SUGGESTION BUBBLE — Figma `Suggestion Bubble`, `Status=default, Type=long`.
 *
 * A 142x20 speech bubble reading "Would you like to meet?". This is where that
 * question went: the Suggested redesign hid the old `prompt-banner` heading
 * ("Would you like to meet River Castellano?") and moved the words into a
 * bubble beside the avatar, with the NAME dropped — it is already the h2
 * directly below, and the bubble does not repeat it.
 *
 * TWO LAYERS, both of which the file draws in the default state:
 *
 *   long-bubble-layer  the filled shape, `surface/neutral/subtle`, with the
 *                      tail built into the path
 *   long-focus-layer   a dashed outline of the same shape
 *
 * THE LAYER NAME IS A MISNOMER — confirmed, not inferred. `long-focus-layer`
 * is not a focus state; the dashed ring is part of the default bubble and
 * stays. Figma's own codegen for the instance placed in 972:13311 renders both
 * layers on `Status=default`, which is what put it here, and the naming has
 * since been confirmed as a slip in the file rather than intent in the code.
 * It ships as a raster because the vector carries an effect; at 1.7KB that is
 * cheaper than arguing with it.
 *
 * Both layers overflow the 142x20 content box to 144.45x22.339 — that overhang
 * IS the tail, so the box stays 142x20 and the art is allowed out of it.
 *
 * `Type=compact` exists as a second variant (its layers are in the file, hidden
 * on this one). Not built: no frame places it yet.
 */
export function SuggestionBubble({ children = 'Would you like to meet?' }: { children?: string }) {
  return (
    <span className="relative flex h-[20px] w-[142px] items-center justify-center">
      {/* The fill. Path is Figma's, verbatim; only the literal #FAFAFA became a
          token, the same trade the icon importer makes. */}
      <svg
        viewBox="0 0 144.45 22.339"
        width="144.45"
        height="22.339"
        fill="none"
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 max-w-none"
      >
        <path
          d="M136.001 0C139.314 0.000273574 142.001 2.80697 142.001 6.26917V11.0904C142.031 11.1621 142.057 11.237 142.077 11.3159L144.397 20.3646C144.696 21.53 143.676 22.5962 142.561 22.2839L134.225 19.9503H6C2.68664 19.95 0.000197927 17.1432 0 13.6812V6.26917C0 2.80697 2.68652 0.000275665 6 0H136.001Z"
          fill="var(--surface-neutral-subtle)"
        />
      </svg>
      <img
        src={focusRing}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[22.339px] w-[144.45px] max-w-none"
      />
      <span className={'relative px-[8px] py-[2px] text-[var(--text-default-caption)] ' + TITLE_6}>
        {children}
      </span>
    </span>
  );
}

/**
 * SUGGESTED-PROFILE — Figma `Suggested-Profile` 972:13736.
 *
 * The 88 avatar with the suggestion bubble pinned beside it. `long` is the
 * default variant.
 *
 * The bubble sits at `right: 76` of the 88 box, so its right edge lands at
 * x=12 — it overlaps the avatar by 12 and its tail points back into it. That
 * is a negative-space relationship, not a gap, which is why this is one
 * component rather than two things a page has to arrange.
 */
export function SuggestedProfile({
  name,
  avatar,
  src,
  question,
}: {
  /** Used for the avatar's alt text and initials fallback. */
  name: string;
  avatar?: AvatarName;
  src?: string;
  /** Overrides the bubble copy. The name is deliberately not in it. */
  question?: string;
}) {
  return (
    <span className="relative flex size-[88px] items-start">
      <Avatar name={avatar} src={src} person={name} size="xxxl" />
      <span className="absolute right-[76px] top-0">
        <SuggestionBubble>{question}</SuggestionBubble>
      </span>
    </span>
  );
}
