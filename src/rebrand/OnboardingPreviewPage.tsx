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
    <div className="rebrand-root flex min-h-screen w-full flex-col bg-[var(--color-yellow-50)]">
      {chrome && (
        <div className="flex flex-wrap items-center gap-[12px] border-b border-[var(--color-black-200)] bg-[var(--color-yellow-50)] px-[24px] py-[12px]">
          <span className="rebrand-display text-[13px] font-semibold uppercase leading-[16px] tracking-[4px] text-[var(--color-blue-600)]">
            Onboarding
          </span>
          <div className="flex flex-1 flex-wrap gap-[4px]">
            {labels.map(({ n, label }) => (
              <Chip key={label} selected={step === n} onClick={() => setStep(n)}>
                {label}
              </Chip>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setChrome(false)}
            className="rounded-[8px] px-[10px] py-[6px] text-[13px] leading-[18px] text-[var(--color-black-500)] transition-colors hover:text-[var(--color-black-700)]"
          >
            Hide controls
          </button>
        </div>
      )}

      <div className="flex flex-1 items-center justify-center p-[24px]">
        <div className="h-[min(760px,calc(100vh-96px))] w-full max-w-[1216px]">
          <KYCFlow step={step} onStep={setStep} />
        </div>
      </div>
    </div>
  );
}
