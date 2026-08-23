import { useState, type ReactNode } from 'react';
import { AppHeader, DailyGoal } from './AppHeader';
import { SuggestionCard, type Suggestion } from './SuggestionCard';

/**
 * The Connect surface: chrome, tab rail, and whatever the body is.
 * Built to `connect-default` (613:2147) and `connect-open` (613:2644).
 *
 * Split from ConnectPage so the preview route mounts the SAME component the
 * product mounts, with different data.
 */

export const CONNECT_TABS = ['SUGGESTIONS', 'ALL MATCHES', 'UPCOMING'] as const;
export type ConnectTab = (typeof CONNECT_TABS)[number];

/**
 * The tab rail. Not SegmentedToggle: that one splits its track into equal
 * segments, and here each tab is sized to its own label (143 / 123 / 104 in
 * the frame). Equal thirds would stretch UPCOMING and squeeze SUGGESTIONS.
 */
function NavToggle({ value, onChange }: { value: ConnectTab; onChange: (t: ConnectTab) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="Connect view"
      className="flex items-center gap-[2px] rounded-[40px] bg-[var(--surface-neutral-subtle)] p-[4px]"
    >
      {CONNECT_TABS.map((t) => {
        const active = t === value;
        return (
          <button
            key={t}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(t)}
            className={
              'flex h-[32px] items-center gap-[7px] whitespace-nowrap rounded-[40px] px-[14px] ' +
              'text-[13px] font-medium leading-[16px] tracking-[1px] transition-colors ' +
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-blue-600)] ' +
              (active
                ? 'bg-[var(--surface-neutral-default)] text-[var(--text-default-highlight-blue)]'
                : 'text-[var(--text-default-placeholder)] hover:text-[var(--text-default-caption)]')
            }
          >
            {active ? <span aria-hidden className="size-[6px] shrink-0 rounded-full bg-[var(--icons-primary-default)]" /> : null}
            {t}
          </button>
        );
      })}
    </div>
  );
}

export function ConnectSurface({
  tab,
  onTab,
  goalDone,
  avatarSrc,
  onNavigate,
  onInvite,
  children,
}: {
  tab: ConnectTab;
  onTab: (t: ConnectTab) => void;
  goalDone: number;
  avatarSrc?: string;
  onNavigate?: (href: string) => void;
  onInvite?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rebrand-root flex min-h-screen w-full flex-col bg-[var(--surface-page-beta)] text-[var(--text-default-body)]">
      <AppHeader active="connect" avatarSrc={avatarSrc} unread onNavigate={onNavigate} onInvite={onInvite} />

      <div className="flex h-[64px] shrink-0 items-center gap-[16px] border-b border-[var(--border-disabled-deep)] bg-[var(--surface-neutral-default)] px-[28px]">
        <NavToggle value={tab} onChange={onTab} />
        <div className="ml-auto">
          <DailyGoal done={goalDone} />
        </div>
      </div>

      <main className="flex flex-1 flex-col items-center px-[32px] py-[32px]">{children}</main>
    </div>
  );
}

/** The question, then the card. The heading names the person, so it is the
 *  decision restated rather than a page title. Heading 4, Parkinsans. */
export function SuggestionView({
  suggestion,
  onPass,
  onMatch,
  busy,
}: {
  suggestion: Suggestion;
  onPass: () => void;
  onMatch: () => void;
  busy?: boolean;
}) {
  const [signalOpen, setSignalOpen] = useState(false);

  return (
    <>
      {/* Heading 6 — Parkinsans Medium 24/28. */}
      <h1 className="rebrand-display mb-[48px] flex h-[60px] items-center text-center text-[24px] font-medium leading-[28px] text-[var(--text-default-body)]">
        Would you like to meet&nbsp;
        <span className="text-[var(--text-default-highlight-blue)]">{suggestion.name}?</span>
      </h1>
      <SuggestionCard
        suggestion={suggestion}
        signalOpen={signalOpen}
        onToggleSignal={() => setSignalOpen((o) => !o)}
        onPass={onPass}
        onMatch={onMatch}
        busy={busy}
      />
    </>
  );
}

/** Shared empty / loading state, so the three tabs cannot each invent one. */
export function ConnectMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-[12px] py-[64px] text-center">
      <h1 className="rebrand-display text-[24px] font-medium leading-[28px] text-[var(--text-default-body)]">{title}</h1>
      <p className="max-w-[420px] text-[14px] leading-[20px] text-[var(--text-default-placeholder)]">{body}</p>
    </div>
  );
}
