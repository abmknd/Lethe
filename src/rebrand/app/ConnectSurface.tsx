import { useState, type ReactNode } from 'react';
import { AppHeader, DailyGoal } from './AppHeader';
import { SuggestionCard, type Suggestion } from './SuggestionCard';
import { BODY_4A, TabBar, ToggleButton } from '../ds';

/**
 * ═══ RETIRED DESIGN — FROZEN ═══════════════════════════════════════════════
 *
 * This is the CONNECT surface: CONNECT / FEED in the top bar, a three-up tab
 * rail, a 600-wide profile card. It is being sunset.
 *
 * The surface we are building on is `src/rebrand/app/AppShell.tsx` — FEED /
 * MATCHES / COMMUNITIES, built from `relethe-feed` 750:184 (feed), 907:22311
 * (matches) and 911:4246 (suggested).
 *
 * It still exists because `/connect` in the LIVE app mounts it (see
 * src/app/ConnectPage.tsx). Deleting it now breaks production. Its preview
 * route is gone, so the only way to reach it is the real page.
 *
 * DO NOT INVEST HERE. No new components, no Figma alignment passes, no
 * polish. The next change this file should see is its callers moving to
 * AppShell, and then its deletion.
 * ══════════════════════════════════════════════════════════════════════════
 */

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
 * The tab rail, now `Tab Bar` + `Toggle Button` on `Type=fill`.
 *
 * It used to be a hand-rolled radiogroup with its own 13/16 tracking-1 type, a
 * 6px dot and a 7px gap — none of which is in the component. `Toggle Button`
 * `Type=fill` is the same idea done by the file: a white pill carrying a blue
 * Button 2A label, on a tinted track at `p-4`.
 *
 * Three segments rather than `Switch Toggle`'s two, and each is sized to its own
 * label — equal thirds would stretch UPCOMING and squeeze SUGGESTIONS. That is
 * why this composes Tab Bar rather than placing a Switch Toggle.
 */
function NavToggle({ value, onChange }: { value: ConnectTab; onChange: (t: ConnectTab) => void }) {
  return (
    <div className="flex items-center rounded-[var(--border-radius-round)] bg-[var(--surface-primary-subtle)] p-[4px]">
      <TabBar label="Connect view">
        {CONNECT_TABS.map((t) => (
          <ToggleButton key={t} fill active={t === value} onClick={() => onChange(t)}>
            {t}
          </ToggleButton>
        ))}
      </TabBar>
    </div>
  );
}

export function ConnectSurface({
  tab,
  onTab,
  goalDone,
  avatarSrc,
  person,
  onNavigate,
  onInvite,
  children,
}: {
  tab: ConnectTab;
  onTab: (t: ConnectTab) => void;
  goalDone: number;
  avatarSrc?: string;
  person?: string;
  onNavigate?: (href: string) => void;
  onInvite?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rebrand-root flex min-h-screen w-full flex-col bg-[var(--surface-page-beta)] text-[var(--text-default-body)]">
      <AppHeader active="connect" avatarSrc={avatarSrc} person={person} unread onNavigate={onNavigate} onInvite={onInvite} />

      <div className="flex h-[64px] shrink-0 items-center gap-[16px] border-b border-[var(--border-neutral-default)] bg-[var(--surface-neutral-default)] px-[28px]">
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
      {/*
        Heading 6 — Parkinsans Medium 24/28.

        The 60px box and the 20px gap are both read off the frame, not chosen:
        `heading` is y=32 h=60, so it ends at 92, and `full` starts at y=112.
        This was 48 and it was simply wrong.
      */}
      <h1 className="rebrand-display mb-[20px] flex h-[60px] items-center text-center text-[24px] font-medium leading-[28px] text-[var(--text-default-body)]">
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
      <p className={'max-w-[420px] text-[var(--text-default-placeholder)] ' + BODY_4A}>{body}</p>
    </div>
  );
}
