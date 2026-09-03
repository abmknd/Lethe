import type { ReactNode } from 'react';
import { ShaderCanvas } from './ShaderCanvas';
import type { ShaderName } from './shaders';
import { Button } from './Button';
import { BODY_3A } from './type';

/**
 * EMPTY STATE — one component, three kinds of nothing.
 *
 * The three are not interchangeable and the distinction is the whole point:
 *
 *   `empty`   the page works, there is simply nothing in it yet. The user's
 *             move. A waving hand, because nothing is wrong.
 *   `client`  the request did not arrive — offline, flaky, a bad route. Their
 *             end. An oval of interlocking pieces that stops holding and
 *             falls apart onto the floor.
 *   `server`  we broke it. Ours. A gear that rolls, cracks and snaps.
 *
 * Getting these backwards is the failure mode worth guarding: telling someone
 * their connection is bad when our server is down sends them to reboot their
 * router, and apologising for an outage when their wifi dropped makes us look
 * like we do not know what is happening. Hence three variants rather than one
 * with a swappable string.
 *
 * COPY IS BAKED IN for `client` and `server` and overridable for `empty`. The
 * two error states say the same thing everywhere they appear, and a per-caller
 * override is how a hundred slightly different apologies get written.
 */

export type EmptyStateKind = 'empty' | 'client' | 'server';

const PRESET: Record<EmptyStateKind, { shader: ShaderName; title: string; body: string }> = {
  empty: {
    shader: 'hand',
    title: 'Nothing here yet.',
    body: 'Once there is something worth showing, it will show up here.',
  },
  client: {
    shader: 'oval',
    title: 'Oops, don’t look at us...',
    body: 'Looks like things are laggy on your end. Refresh or try again later',
  },
  server: {
    shader: 'gear',
    title: 'Don’t worry, this is on us.',
    body: 'We’re currently looking into the issue and will fix it asap. Sorry 😬',
  },
};

export function EmptyState({
  kind,
  title,
  body,
  action,
  onAction,
}: {
  kind: EmptyStateKind;
  /** `empty` is per-page and expected to override. The error copy is fixed. */
  title?: string;
  body?: ReactNode;
  action?: string;
  onAction?: () => void;
  /* NO ICON ON THE ACTION YET. The mock shows a glyph inside the button and
     Figma has a `Style=with-icon` Button variant for it, but our `Button` does
     not take one. Adding a prop to a shared component to satisfy one caller is
     how a component set drifts; it wants doing as its own change. */
}) {
  const preset = PRESET[kind];
  const isError = kind !== 'empty';

  return (
    <div
      // `status` for the empty case, `alert` for a failure: a screen reader
      // should interrupt for a broken page and not for an empty one.
      role={isError ? 'alert' : 'status'}
      className="flex flex-col items-center px-[32px] py-[56px] text-center"
    >
      <ShaderCanvas shader={preset.shader} size={140} />
      <h2 className="rebrand-display mt-[16px] text-[30px] leading-[110%] text-[var(--text-default-heading)]">
        {title ?? preset.title}
      </h2>
      <p className={'mt-[12px] max-w-[42ch] text-[var(--text-default-caption)] ' + BODY_3A}>
        {body ?? preset.body}
      </p>
      {action && (
        <span className="mt-[24px]">
          <Button tone="fill" onClick={onAction}>
            {action}
          </Button>
        </span>
      )}
    </div>
  );
}
