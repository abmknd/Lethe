import { useState, type ReactNode } from 'react';
import { AppHeader, DailyGoal } from './AppHeader';
import { SuggestionCard, type Suggestion } from './SuggestionCard';
import { SegmentedToggle } from '../primitives';

/**
 * The Connect surface: chrome, tabs, and whatever the body is.
 *
 * Split from ConnectPage so the preview route mounts the SAME component the
 * product mounts, with different data. A preview that re-creates the screen is
 * a preview that can lie about it (REBRAND-PLAN, "Preview, always").
 */

export const CONNECT_TABS = ['SUGGESTIONS', 'ALL MATCHES', 'UPCOMING'] as const;
export type ConnectTab = (typeof CONNECT_TABS)[number];

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
    <div className="rebrand-root flex min-h-screen w-full flex-col bg-[var(--color-black-50)] text-[var(--color-black-700)]">
      <AppHeader active="connect" avatarSrc={avatarSrc} onNavigate={onNavigate} onInvite={onInvite} />

      <div className="flex flex-wrap items-center gap-[16px] border-b border-[var(--color-black-100)] bg-[var(--color-white)] px-[32px] py-[14px]">
        <div className="w-[480px] max-w-full shrink-0">
          <SegmentedToggle label="Connect view" options={CONNECT_TABS} value={tab} onChange={onTab} marker />
        </div>
        <div className="ml-auto">
          <DailyGoal done={goalDone} />
        </div>
      </div>

      <main className="flex flex-1 flex-col items-center px-[24px] py-[64px]">{children}</main>
    </div>
  );
}

/** The question, then the card. The heading names the person, so it is the
 *  decision restated rather than a page title. */
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
      <h1 className="rebrand-display mb-[40px] text-center text-[34px] font-medium leading-[120%] text-[var(--color-black-700)]">
        Would you like to meet <span className="text-[var(--color-blue-600)]">{suggestion.name}?</span>
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
      <h1 className="rebrand-display text-[34px] font-medium leading-[120%] text-[var(--color-black-700)]">{title}</h1>
      <p className="max-w-[420px] text-[16px] leading-[150%] text-[var(--color-black-500)]">{body}</p>
    </div>
  );
}
