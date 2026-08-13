import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './rebrand.css';
// The KYC step transitions (.kyc-step-active / -exit-left / -exit-right) live
// in the app stylesheet. Without it every step stacks unpositioned and the
// first one wins, which looks exactly like a broken migration. Import the app
// styles so the gallery shows real behaviour rather than a layering artifact.
import '../styles/index.css';
import { KYCModal } from '../app/components/KYCModal';

/**
 * Component gallery.
 *
 * In-app surfaces sit behind auth, so migrating them blind and hoping is not
 * an option. This mounts them directly against the token layer, with no
 * session and no backend, so each one can be looked at while it is being
 * migrated. Dev-only: it is a separate Vite entry and never ships.
 */
function Gallery() {
  const [openKyc, setOpenKyc] = useState(true);

  return (
    <div className="rebrand-root min-h-screen w-full p-[24px]">
      <h1 className="rebrand-display mb-[8px] text-[32px] leading-none text-[var(--color-white)]">
        Component gallery
      </h1>
      <p className="mb-[24px] text-[14px] leading-[16px] text-[var(--color-blue-200)]">
        In-app surfaces, rendered without auth so they can be reviewed while being migrated.
      </p>

      <button
        onClick={() => setOpenKyc(true)}
        className="rounded-[40px] bg-[var(--color-white)] px-[20px] py-[12px] text-[14px] font-medium leading-[16px] tracking-[1px] text-[var(--color-blue-600)]"
      >
        OPEN ONBOARDING
      </button>

      {openKyc && <KYCModal isOpen onClose={() => setOpenKyc(false)} onComplete={() => setOpenKyc(false)} />}
    </div>
  );
}

createRoot(document.getElementById('gallery-root')!).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
