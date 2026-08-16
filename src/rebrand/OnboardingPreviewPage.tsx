import { useState } from 'react';
import './rebrand.css';
import { KYCFlow, STEP_DONE, STEP_PAUSED, TOTAL_STEPS } from '../app/components/kyc/KYCFlow';
import { Chip } from './primitives';

/**
 * Onboarding, previewable in the real router at /rebrand/onboarding — the same
 * arrangement as /rebrand for the landing.
 *
 * This is NOT a second implementation. It mounts the identical `KYCFlow` the
 * product mounts inside `KYCModal`; the only thing this page adds is a way to
 * jump between steps without answering every question first. A preview that
 * re-creates the screens is a preview that can lie about them.
 *
 * The composition matches the Figma `Implement Design Specifications` frame:
 * the flow sits on the app's light ground and lays itself out in two columns
 * when the width allows.
 */
export default function OnboardingPreviewPage() {
  const [step, setStep] = useState(1);
  const [chrome, setChrome] = useState(true);

  const labels = [
    ...Array.from({ length: TOTAL_STEPS }, (_, i) => ({ n: i + 1, label: String(i + 1) })),
    { n: STEP_DONE, label: 'DONE' },
    { n: STEP_PAUSED, label: 'PAUSED' },
  ];

  return (
    // dvh, not vh: on mobile the browser's own chrome shrinks the visual
    // viewport, and vh keeps measuring the larger one — which is precisely how
    // a primary action ends up under the address bar.
    <div className="rebrand-root flex h-[100dvh] w-full flex-col overflow-hidden bg-[var(--color-yellow-50)]">
      {chrome && (
        <div className="flex shrink-0 items-center gap-[12px] border-b border-[var(--color-black-200)] bg-[var(--color-yellow-50)] px-[12px] py-[8px] sm:px-[24px] sm:py-[12px]">
          <span className="rebrand-display hidden text-[13px] font-semibold uppercase leading-[16px] tracking-[4px] text-[var(--color-blue-600)] sm:block">
            Onboarding
          </span>
          {/* One scrolling row on a phone rather than four wrapped ones — the
              control strip must not eat the screen it exists to preview. */}
          <div className="flex flex-1 gap-[4px] overflow-x-auto sm:flex-wrap sm:overflow-visible">
            {labels.map(({ n, label }) => (
              <Chip key={label} selected={step === n} onClick={() => setStep(n)} className="shrink-0">
                {label}
              </Chip>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setChrome(false)}
            className="hidden shrink-0 rounded-[8px] px-[10px] py-[6px] text-[13px] leading-[18px] text-[var(--color-black-500)] transition-colors hover:text-[var(--color-black-700)] sm:block"
          >
            Hide controls
          </button>
        </div>
      )}

      {/* min-h-0 so the flow is bounded by the space LEFT OVER after the
          control strip, not by a guess. The previous fixed height assumed the
          strip's height and put CONTINUE 94px below the fold on a phone. */}
      <div className="flex min-h-0 flex-1 items-center justify-center p-[12px] sm:p-[24px]">
        <div className="h-full max-h-[760px] w-full max-w-[1120px]">
          <KYCFlow step={step} onStep={setStep} />
        </div>
      </div>
    </div>
  );
}
