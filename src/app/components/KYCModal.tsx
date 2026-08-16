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
    <div className="rebrand-root fixed inset-0 z-[200] flex items-center justify-center bg-[var(--color-black-700)]/80 p-5 backdrop-blur-sm">
      {/* Wide enough for the card AND its plate. KYCFlow decides whether the
          plate actually appears, from the width it is given — below 1160 it
          drops the plate and the card centres in whatever is left. */}
      <div className="h-[min(720px,90vh)] w-full max-w-[1216px]">
        <KYCFlow onClose={onClose} onComplete={onComplete} userId={userId} accessToken={accessToken} />
      </div>
    </div>
  );
}
