import { HOW_IT_WORKS } from '../../constants/kyc';
import { IconTile, ListContainer, StepHeader } from '../../../rebrand/primitives';

/**
 * Step 1. Three rows in one bordered list, and nothing else.
 *
 * The old step ended with a "See it in motion" video block. A user who is
 * already inside the product does not need a demo of it — they need to know
 * what happens next and then to get on with it. Removed rather than restyled.
 */

/** Abstract marks, not iconography. The rebrand has no icon set yet, and three
 *  lucide glyphs would be a fourth visual language inside a card. */
const GLYPHS = [
  <span key="a" className="size-[14px] bg-[var(--color-blue-600)]" />,
  <span key="b" className="size-[14px] rounded-full border-2 border-[var(--color-blue-600)]" />,
  <span key="c" className="size-[12px] rotate-45 bg-[var(--color-blue-600)]" />,
];

export function Step1HowItWorks() {
  return (
    <div>
      <StepHeader
        label="GETTING STARTED"
        heading={
          <>
            Meet people
            <br />
            <span className="text-[var(--color-blue-600)]">worth meeting.</span>
          </>
        }
        body="Relethe's matching is different. Here's what to expect."
      />

      <ListContainer className="rounded-[16px]">
        {HOW_IT_WORKS.map((row, i) => (
          <div
            key={row.title}
            className={
              'flex items-start gap-[16px] p-[12px] ' +
              (i < HOW_IT_WORKS.length - 1 ? 'border-b border-[var(--color-black-200)]' : '')
            }
          >
            <IconTile>{GLYPHS[i]}</IconTile>
            <div className="flex flex-col gap-[4px]">
              <span className="text-[14px] font-medium leading-[16px] text-[var(--color-black-700)]">{row.title}</span>
              <span className="text-[13px] leading-[18px] text-[var(--color-black-500)]">{row.desc}</span>
            </div>
          </div>
        ))}
      </ListContainer>
    </div>
  );
}
