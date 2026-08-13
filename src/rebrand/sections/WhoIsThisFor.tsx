import { useCallback, useEffect, useState } from 'react';
import { TitlePill, DescriptivePill, SegmentedBar } from '../primitives';
import whoCreators from '../assets/who-creators.webp';

/**
 * The four audiences the current landing page rotates through, kept verbatim
 * so the rebrand does not quietly change the positioning.
 */
const CARDS = [
  { label: 'CREATORS', lead: 'I have a podcast', rest: " and need to meet the kind of guests my audience hasn't heard yet." },
  { label: 'BUILDERS', lead: "I'm raising a seed round", rest: " and need warm intros to operators who've actually done it." },
  { label: 'THINKERS', lead: "I'm writing a book", rest: ' and need researchers who think in the same direction I do.' },
  { label: 'INVESTORS', lead: 'I run a climate fund', rest: ' and need founders who are serious, not just interesting.' },
];

const DWELL_MS = 6000;

export default function WhoIsThisFor() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const select = useCallback((i: number) => {
    setActive(i);
    setPaused(true); // a deliberate choice outranks the timer
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % CARDS.length), DWELL_MS);
    return () => clearInterval(id);
  }, [paused]);

  const card = CARDS[active];

  return (
    <section id="cohort" className="w-full bg-[var(--color-yellow-50)] px-[clamp(20px,6vw,120px)] py-[clamp(48px,8vw,120px)]">
      <div className="mx-auto flex w-[1200px] max-w-full flex-col items-stretch gap-[16px] overflow-hidden rounded-[16px] bg-[var(--color-blue-100)] px-[16px] pb-[24px] pt-[16px] md:h-[840px] md:flex-row md:items-start">
        <div className="h-[300px] w-full shrink-0 overflow-hidden rounded-[8px] md:h-full md:w-[628px] md:max-w-[52%]">
          <img src={whoCreators} alt="" className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-between gap-6 md:gap-0">
          <div className="flex w-full items-center justify-between pb-[8px]">
            <TitlePill>WHO NEEDS THIS?</TitlePill>
            <DescriptivePill>{card.label}</DescriptivePill>
          </div>

          {/* aria-live so the rotation is announced rather than silently swapping */}
          <div className="flex w-full items-center justify-center p-[clamp(16px,3vw,24px)]" aria-live="polite">
            <p
              key={active}
              className="rebrand-display animate-[rb-fade_420ms_ease-out] text-center text-[clamp(26px,4.5vw,40px)] font-normal leading-none text-[var(--color-black-700)]"
            >
              <span className="text-[var(--color-blue-600)]">{card.lead}</span>
              {card.rest}
            </p>
          </div>

          <div className="w-full max-w-[160px]">
            <SegmentedBar
              count={CARDS.length}
              active={active}
              onSelect={select}
              labelFor={(i) => `Show ${CARDS[i].label.toLowerCase()}`}
              surface="light"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
