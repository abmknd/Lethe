import { Button } from '../../../rebrand/primitives';

/**
 * The one blue screen in onboarding.
 *
 * SURFACE ENCODES WHAT IS KNOWN (redesign.md 5.11). Everywhere else in the flow
 * something is being established, so the surface is light. Here matching is
 * suspended and nothing is known yet — the same held breath as the blind match
 * card, and the only place in the flow that earns Blue 600. Emphasis is
 * therefore Yellow 600, which appears nowhere else in onboarding.
 */
export function KYCPaused({ onCompleteNow, onMaybeLater }: { onCompleteNow: () => void; onMaybeLater: () => void }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-[16px] p-[24px] text-center">
      <div className="flex size-[72px] items-center justify-center gap-[4px] rounded-full border border-[var(--color-blue-500)]">
        <span className="h-[18px] w-[5px] bg-[var(--color-blue-200)]" />
        <span className="h-[18px] w-[5px] bg-[var(--color-blue-200)]" />
      </div>

      <h2 className="rebrand-display mt-[6px] text-[32px] font-normal leading-[100%] text-[var(--color-white)]">
        Matching is on
        <br />
        <span className="text-[var(--color-yellow-600)]">pause for you.</span>
      </h2>

      <p className="max-w-[340px] text-[16px] leading-[120%] text-[var(--color-white)]">
        Finish setting up your profile whenever you're ready. You'll find it in Connect.
      </p>

      {/* Wraps rather than shrinks: at 375 the two labels do not fit on one
          line, and a squeezed button is worse than a stacked pair. */}
      <div className="mt-[8px] flex w-full max-w-[360px] flex-wrap justify-center gap-[8px]">
        <Button surface="blue" size="lg" className="grow" onClick={onCompleteNow}>
          COMPLETE NOW
        </Button>
        <Button surface="blue" variant="secondary" size="lg" onClick={onMaybeLater}>
          MAYBE LATER
        </Button>
      </div>
    </div>
  );
}
