import step1 from '../assets/step-1-tell-us.webp';
import step2 from '../assets/step-2-introduced.webp';
import step3 from '../assets/step-3-matches.webp';
import step4 from '../assets/step-4-priors.webp';

type StepCard = {
  theme: 'light' | 'dark';
  step: string;
  title: string;
  body: string;
  img: string;
};

const CARDS: StepCard[] = [
  { theme: 'light', step: 'STEP 1', title: 'Tell us about you', img: step1, body: 'Relethe matches you with up to five people a week based on who you actually are, not who you perform to be.' },
  { theme: 'dark', step: 'STEP 2', title: 'Get introduced', img: step2, body: 'A daily edition of selected posts. Short-form, intentional, finite. It ends. That is the point.' },
  { theme: 'dark', step: 'STEP 3', title: 'Meet your matches', img: step3, body: 'You choose who you meet. The more honest you are, the better the match. Up to five introductions a week.' },
  { theme: 'light', step: 'STEP 4', title: 'Update your priors', img: step4, body: 'Set your availability, your frequency, your boundaries. Every introduction is a deliberate choice.' },
];

function Card({ theme, step, title, body, img }: StepCard) {
  const dark = theme === 'dark';
  return (
    <div
      className={
        'relative flex w-full max-w-[560px] flex-col gap-[16px] overflow-hidden rounded-[16px] px-[16px] pb-[24px] pt-[16px] sm:w-[calc(50%-18px)] ' +
        (dark ? 'bg-[var(--color-blue-600)]' : 'bg-[var(--color-blue-100)]')
      }
    >
      {dark && (
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[16px] border-[1.25px] border-[var(--color-card-border)]" />
      )}

      <div className="flex flex-col gap-[24px] pb-[8px]">
        <div className="flex items-center justify-between">
          <span
            className={
              'inline-flex items-center rounded-[8px] px-[6px] py-[4px] text-[13px] leading-[18px] ' +
              (dark ? 'bg-[var(--color-blue-700)] text-white' : 'bg-[var(--color-tag-neutral)] text-[var(--color-black-700)]')
            }
          >
            HOW IT WORKS
          </span>
          <span
            className={
              'inline-flex items-center rounded-[8px] px-[6px] py-[4px] text-[13px] leading-[18px] ' +
              (dark ? 'bg-[var(--color-tag-neutral)] text-[var(--color-blue-600)]' : 'bg-[var(--color-blue-600)] text-white')
            }
          >
            {step}
          </span>
        </div>

        <div className="flex flex-col gap-[12px]">
          <p className={'rebrand-display text-[clamp(26px,3.5vw,40px)] font-normal leading-none ' + (dark ? 'text-white' : 'text-[var(--color-black-700)]')}>
            {title}
          </p>
          <p className={'text-[16px] font-normal leading-[1.2] ' + (dark ? 'text-white' : 'text-[var(--color-black-700)]')}>
            {body}
          </p>
        </div>
      </div>

      <div className="h-[clamp(240px,40vw,454px)] w-full overflow-hidden rounded-[8px]">
        <img src={img} alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="w-full bg-[var(--color-yellow-50)] px-[clamp(20px,6vw,120px)] py-[clamp(48px,8vw,120px)]">
      <div className="mx-auto flex w-full max-w-[1156px] flex-wrap items-start justify-center gap-[36px]">
        {CARDS.map((c) => (
          <Card key={c.step} {...c} />
        ))}
      </div>
    </section>
  );
}
