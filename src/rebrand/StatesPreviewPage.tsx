import './rebrand.css';
import { EmptyState } from './ds';

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
      </div>
    </div>
  );
}
