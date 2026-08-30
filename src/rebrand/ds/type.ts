/**
 * THE TYPE SCALE, WITH FIGMA'S NAMES.
 *
 * Figma composes a text style from a paragraph size and a weight:
 *
 *     P1 20/24   P3 16/20   P4 14/20   P5 13/16   P6 12/16
 *     Title = Medium (500) · Body = Regular (400) or Light (300)
 *
 * A style whose name ends in a letter varies the LINE HEIGHT or the letter
 * spacing rather than the size — `Body 4A` is 14/20 and `Body 4B` is 14/16, and
 * mixing them up is a 4px error that only shows once a row is measured.
 *
 * These are the styles the app surfaces actually place. Add one when a frame
 * uses it, named as Figma names it, so a style in the file and a constant here
 * are the same fact rather than two facts to keep in sync.
 */

/** Title 1 — 20/24 Medium. Card headings, the prompt banner. */
export const TITLE_1 = 'text-[20px] font-medium leading-[24px]';
/** Title 3 — 16/20 Medium. The active nav item, a card's own title row. */
export const TITLE_3 = 'text-[16px] font-medium leading-[20px]';
/** Title 4B — 14/20 Medium. A person's name in a list row or a post header. */
export const TITLE_4B = 'text-[14px] font-medium leading-[20px]';
/** Title 4C — 14/16 Medium. A SELECTED `md` nav row. Same size as 4B, tighter
 *  leading: 4B is on P4's own 20, 4C is on Scale/500. */
export const TITLE_4C = 'text-[14px] font-medium leading-[16px]';
/** Title 5 — 13/16 Medium. A field Label. */
export const TITLE_5 = 'text-[13px] font-medium leading-[16px]';
/** Title 6 — 12/16 Regular. Section labels, Badge Text. */
export const TITLE_6 = 'text-[12px] font-normal leading-[16px]';

/** Body 3A — 16/20 Regular. Body copy, nav items, a search placeholder. */
export const BODY_3A = 'text-[16px] font-normal leading-[20px]';
/** Body 4A — 14/20 Regular. A handle, a signal bullet, a post caption's meta. */
export const BODY_4A = 'text-[14px] font-normal leading-[20px]';
/** Body 4B — 14/16 Regular. Tag and Button Text labels. Note the 16, not 20. */
export const BODY_4B = 'text-[14px] font-normal leading-[16px]';
/** Body 4C — 14/16 Regular. Figma keeps this separate from 4B; they resolve the
 *  same, and it is aliased rather than merged so a frame's style name survives. */
export const BODY_4C = BODY_4B;
/** Body 5A — 13/16 Regular. The trailing half of an endorsement line. */
export const BODY_5A = 'text-[13px] font-normal leading-[16px]';
/** Body 5B — 13/16 Light. `location-meta`, the signal subtitle, an action count. */
export const BODY_5B = 'text-[13px] font-light leading-[16px]';
/** Body 5C — 13/16 Regular. Aliased to 5A for the same reason as 4C. */
export const BODY_5C = BODY_5A;
/** Body 6 — 12/16 Light. Hint, Info Text, avatar initials, Number Symbol. */
export const BODY_6 = 'text-[12px] font-light leading-[16px]';

/** Button 2A — 14/16 Medium, tracking 0, uppercase. Every 32-tall Button. */
export const BUTTON_2A = 'text-[14px] font-medium uppercase leading-[16px] tracking-[0px]';
