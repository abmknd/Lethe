import './rebrand.css';
import { KYCFlow } from '../app/components/kyc/KYCFlow';

/**
 * Onboarding, previewable in the real router at /rebrand/onboarding — the same
 * arrangement as /rebrand for the landing.
 *
 * This is NOT a second implementation. It mounts the identical `KYCFlow` the
 * product mounts inside `KYCModal`. A preview that re-creates the screens is a
 * preview that can lie about them.
 *
 * Nothing is added around it. The step-jumping control this page used to carry
 * came from the KYC round's HTML guide, and it made the preview misrepresent
 * the product: onboarding has no pagination, because a flow you can skip around
 * is not a flow. It now lives in the gallery, where jumping is the point, as
 * `NumberPagination`. Here you walk the steps the way a user does.
 */
export default function OnboardingPreviewPage() {
  return (
    // dvh, not vh: on mobile the browser's own chrome shrinks the visual
    // viewport, and vh keeps measuring the larger one — which is precisely how
    // a primary action ends up under the address bar.
    <div className="rebrand-root flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[var(--color-yellow-50)] p-[12px] sm:p-[24px]">
      <div className="h-full max-h-[760px] w-full max-w-[1120px]">
        <KYCFlow />
      </div>
    </div>
  );
}
