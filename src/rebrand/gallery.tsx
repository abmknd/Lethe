import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './rebrand.css';
// The KYC step transitions (.kyc-step-active / -exit-left / -exit-right) live
// in the app stylesheet. Without it every step stacks unpositioned and the
// first one wins, which looks exactly like a broken migration. Import the app
// styles so the gallery shows real behaviour rather than a layering artifact.
import '../styles/index.css';
import { KYCModal } from '../app/components/KYCModal';
import { BlindMatchCard, AwaitingMatchCard, RevealedMatchCard } from './app/MatchCard';
import anika from '../assets/dummies/anika-sharma.png';
import marcus from '../assets/dummies/marcus-webb.png';
import priya from '../assets/dummies/priya-nair.png';
import sofia from '../assets/dummies/sofia-mendes.png';

const BLIND = {
  roleCategory: 'A climate operator, two stages ahead',
  overlapThemes: [
    { kind: 'intent', label: 'RAISING' },
    { kind: 'interest', label: 'SOCIAL IMPACT' },
    { kind: 'interest', label: 'PHILOSOPHY' },
  ],
  availabilityCompatibility: 'You overlap on two evenings in the next three weeks.',
  confidenceBand: 'high' as const,
};

const REVEALED = {
  displayName: 'Elena Marsh',
  handle: 'elenamarsh',
  avatarSrc: sofia,
  summary: 'Chief of staff at a climate fund, helping operators find the room they need next.',
  commonGround: [
    "You're both active in the Effective Altruism community, and she's attended the same chapter.",
    'She left agency work to go independent within the same six-month window as you.',
  ],
  interests: ['SOCIAL IMPACT', 'TRAVEL', 'FOOD', 'VENTURE CAPITAL', 'CYCLING', 'GAMING', 'PHILOSOPHY'],
  mutuals: [
    { src: anika, name: 'Anika Sharma' },
    { src: marcus, name: 'Marcus Webb' },
    { src: priya, name: 'Priya Nair' },
  ],
  mutualsSentence: 'George, Tracy and 3 others have met her.',
  availability: [
    { day: 'TUE', times: ['6:00 PM', '8:00 PM'] },
    { day: 'SAT', times: ['7:00 AM', '11:00 AM'] },
  ],
  socials: ['LINKEDIN', 'INSTAGRAM', 'PERSONAL WEBSITE', 'SUBSTACK', 'YOUTUBE'],
};

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

      {/* The match card, both states side by side. Surface encodes what is
          known: blue while blind, light once revealed. */}
      <div className="mt-[40px] flex flex-wrap items-start gap-[24px]">
        <BlindMatchCard match={BLIND} onPass={() => {}} onAccept={() => {}} />
        <RevealedMatchCard match={REVEALED} onSchedule={() => {}} />
        <AwaitingMatchCard match={BLIND} />
      </div>
    </div>
  );
}

createRoot(document.getElementById('gallery-root')!).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
