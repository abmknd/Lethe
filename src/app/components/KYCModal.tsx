import { KYCFlow } from './kyc/KYCFlow';

export type { KYCData } from './kyc/kycData';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  userId?: string;
  accessToken?: string;
}

/**
 * Onboarding, as a modal. The card and all twelve screens live in KYCFlow; this
 * is only the scrim and the sizing, so the gallery can mount the same flow
 * inline without a fixed overlay.
 */
export function KYCModal({ isOpen, onClose, onComplete, userId, accessToken }: KYCModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="rebrand-root fixed inset-0 z-[200] flex items-center justify-center bg-[var(--color-black-700)]/80 p-[12px] backdrop-blur-sm sm:p-5"
      // The notch and the home indicator are not padding the browser gives you.
      style={{
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      {/* Wide enough for the split shell. KYCFlow decides whether the plate
          appears, from the width it is given — below 1120 the shell stacks.
          Height is `h-full` inside a `fixed inset-0` parent, so it tracks the
          real visual viewport instead of a vh guess. */}
      <div className="h-full max-h-[760px] w-full max-w-[1120px]">
        <KYCFlow onClose={onClose} onComplete={onComplete} userId={userId} accessToken={accessToken} />
      </div>
    </div>
  );
}
