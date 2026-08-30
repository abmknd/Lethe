import { BODY_6 } from './type';

/**
 * ENTER BUTTON — Figma `Enter Button` 872:15166.
 *
 * The `↵ enter` affordance inside a `Field Buttoned` on `Type=enter`. Body 6 in
 * `text/default/subtle`, `py-8` so it centres on the field's 32 row.
 *
 * The arrow is a CHARACTER, not an icon — U+21B5, sitting in the label the way
 * the file types it. There is a hidden `mail-01` slot in the component for a
 * leading glyph; it is hidden in every placed instance, so it is a prop here
 * rather than a default.
 */
export function EnterButton({
  children = '↵ enter',
  onClick,
}: {
  children?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'inline-flex shrink-0 items-center gap-[8px] whitespace-nowrap py-[8px] text-[var(--text-default-subtle)] ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
        'focus-visible:outline-[var(--border-primary-default)] ' + BODY_6
      }
    >
      {children}
    </button>
  );
}
