import './rebrand.css';
import { EmptyState } from './ds';
import { Gavel, SuccessMonument } from '../assets/spot-illustrations';

/**
 * The three empty / error states, side by side so the animations can be
 * compared rather than described.
 *
 * A REVIEW SURFACE, not a product page. It goes at Phase 6 with the other
 * `/rebrand/*` routes, once these are placed on the real screens.
 */
export default function StatesPreviewPage() {
  return (
    <div className="rebrand-root min-h-screen bg-[var(--surface-page-beta)] p-[24px]">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-[24px]">
        {/* 1 — nothing here yet. The example from the Bookmarks mock. */}
        <div className="rounded-[16px] bg-[var(--surface-neutral-default)]">
          <EmptyState
            kind="empty"
            title="No bookmarks yet."
            body="All your bookmarks will be saved here... Soon as you look around and save stuff worth saving."
            action="LOOK AROUND"
          />
        </div>

        {/* 2 — their end. */}
        <div className="rounded-[16px] bg-[var(--surface-neutral-default)]">
          <EmptyState kind="client" action="TRY AGAIN" />
        </div>

        {/* 3 — our end. No action: there is nothing for them to do, and a
            button that cannot help is worse than no button. */}
        <div className="rounded-[16px] bg-[var(--surface-neutral-default)]">
          <EmptyState kind="server" />
        </div>

        {/* 4 — success. The illustration exists; no state component wraps it
            yet, because no screen has asked for one. Shown here on its own so
            it can be reviewed without inventing a surface for it. */}
        <div className="flex flex-col items-center rounded-[16px] bg-[var(--surface-neutral-default)] px-[32px] py-[56px] text-center">
          <SuccessMonument size={180} />
          <h2 className="rebrand-display mt-[16px] text-[30px] leading-[110%] text-[var(--text-default-heading)]">
            That's done.
          </h2>
          <p className="mt-[12px] max-w-[42ch] text-[16px] leading-[20px] text-[var(--text-default-caption)]">
            A placeholder line, so the mark can be judged next to type at the size it will run.
          </p>
        </div>

        {/* 5 — a decision landed. Same reason as the monument: no state
            component yet, because no screen has asked for one. */}
        <div className="flex flex-col items-center rounded-[16px] bg-[var(--surface-neutral-default)] px-[32px] py-[56px] text-center">
          <Gavel size={180} />
          <h2 className="rebrand-display mt-[16px] text-[30px] leading-[110%] text-[var(--text-default-heading)]">
            Request accepted.
          </h2>
          <p className="mt-[12px] max-w-[42ch] text-[16px] leading-[20px] text-[var(--text-default-caption)]">
            A placeholder line, so the mark can be judged next to type at the size it will run.
          </p>
        </div>
      </div>
    </div>
  );
}
