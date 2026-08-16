import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './rebrand.css';
import '../styles/index.css';
import { KYCFlow, STEP_DONE, STEP_PAUSED, TOTAL_STEPS } from '../app/components/kyc/KYCFlow';
import { BlindMatchCard, AwaitingMatchCard, RevealedMatchCard } from './app/MatchCard';
import { NumberPagination, SegmentedToggle } from './primitives';
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

const STEP_LABELS = [
  ...Array.from({ length: TOTAL_STEPS }, (_, i) => String(i + 1)),
  'DONE',
  'PAUSED',
];

const NOTES: { title: string; body: string }[] = [
  {
    title: 'THE SURFACE DECISION',
    body: 'Onboarding is the app, and the app is light. Steps 1–10 and Done are White on Black 100 lines with Blue 600 emphasis. Blue 600 is spent once, on Paused, where matching is suspended and nothing is known. The all-blue direction was built, compared and dropped.',
  },
  {
    title: 'WHAT CHANGED SYSTEMICALLY',
    body: 'Cormorant italic, Inter and #7FFF00 are gone; headings are Parkinsans, everything else Archivo. No alpha anywhere — every fill, border and selected state is a ramp step. Emoji dropped from the objectives list. Step 1 lost its video block.',
  },
  {
    title: 'DENSITY',
    body: 'The card is a fixed box with a scrolling body, so header, progress and CONTINUE never move between steps. Steps 4, 6 and 9 are the ones that overflow at 560 — switch to 375 to see where each breaks.',
  },
  {
    title: 'NEW: DAYLIGHTBAND',
    body: 'A 24-hour track with a window drawn on it, in the viewer’s local frame. Step 2 draws one per city; Step 10 draws the week you just chose. A window crossing midnight renders as two segments, never a wrapped bar.',
  },
];

/**
 * Component gallery.
 *
 * In-app surfaces sit behind auth, so migrating them blind and hoping is not
 * an option. This mounts them directly against the token layer, with no session
 * and no backend, so each one can be looked at while it is being migrated.
 * Dev-only: a separate Vite entry that never ships.
 */
const FRAMES = {
  '1120 DESKTOP': { w: 1120, h: 720 },
  '560 CARD': { w: 560, h: 720 },
  '375 MOBILE': { w: 375, h: 760 },
} as const;

function Gallery() {
  const [step, setStep] = useState(1);
  const [width, setWidth] = useState<keyof typeof FRAMES>('1120 DESKTOP');
  const frame = FRAMES[width];

  return (
    <div className="rebrand-root min-h-screen w-full bg-[var(--color-yellow-50)] p-[48px] text-[var(--color-black-700)]">
      <div className="flex max-w-[1180px] flex-col gap-[16px]">
        <span className="rebrand-display text-[13px] font-semibold leading-[16px] tracking-[4px] text-[var(--color-blue-600)]">
          RELETHE · KYC REBRAND · PHASE 4
        </span>
        <h1 className="rebrand-display max-w-[820px] text-[48px] font-normal leading-[100%]">
          Onboarding, rebuilt on the ramp — light app, blue only when earned.
        </h1>
        <p className="max-w-[720px] text-[16px] leading-[120%]">
          Twelve screens, clickable end to end, at both widths. Step 2 is a new design rather than a restyle of the old
          search list.
        </p>
      </div>

      <div className="sticky top-0 z-10 my-[32px] flex flex-wrap items-center gap-[12px] border-b border-[var(--color-black-200)] bg-[var(--color-yellow-50)] py-[12px]">
        <div className="w-[420px] shrink-0">
          <SegmentedToggle
            label="Frame width"
            options={Object.keys(FRAMES) as (keyof typeof FRAMES)[]}
            value={width}
            onChange={setWidth}
          />
        </div>
        {/* Jumping between screens is what a gallery is FOR, which is the one
            place this control belongs. It is deliberately absent from
            /rebrand/onboarding and from the product. */}
        <NumberPagination
          label="Jump to onboarding screen"
          className="flex-1 flex-wrap justify-end"
          items={STEP_LABELS.map((label, i) => ({ value: i + 1, label }))}
          value={step}
          onChange={setStep}
        />
      </div>

      <div className="flex flex-wrap items-start gap-[40px]">
        <div style={{ width: frame.w, height: frame.h }} className="shrink-0">
          <KYCFlow step={step} onStep={setStep} />
        </div>

        <div className="grid min-w-[280px] flex-1 gap-[16px]">
          {NOTES.map((note) => (
            <div key={note.title} className="rounded-[16px] bg-[var(--color-blue-100)] p-[20px]">
              <span className="block text-[14px] font-medium leading-[100%] tracking-[0.5px] text-[var(--color-blue-600)]">
                {note.title}
              </span>
              <p className="mt-[8px] text-[14px] leading-[20px]">{note.body}</p>
            </div>
          ))}
          <p className="text-[13px] leading-[18px] text-[var(--color-black-500)]">
            Steps {STEP_DONE} and {STEP_PAUSED} are the terminal screens: DONE and PAUSED.
          </p>
        </div>
      </div>

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
