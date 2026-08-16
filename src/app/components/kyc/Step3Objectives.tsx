import type { StepProps } from './kycData';
import { MAX_OBJECTIVES, OBJECTIVES } from '../../constants/kyc';
import { SelectRow, StepHeader, StepSection } from '../../../rebrand/primitives';

/**
 * Step 3.
 *
 * The source tiles carried emoji (🔨 🤝 🌐). Dropped: the rebrand's type system
 * has no emoji in it, and eight of them in a grid is a fifth typeface. Rows
 * carry a numeric index instead, which also gives the eye a left edge to run
 * down.
 */
export function Step3Objectives({ data, updateData }: StepProps) {
  const toggle = (index: number) => {
    const next = new Set(data.objectives);
    if (next.has(index)) next.delete(index);
    else if (next.size < MAX_OBJECTIVES) next.add(index);
    updateData({ objectives: next });
  };

  return (
    <div>
      <StepHeader
        label="YOUR INTENT"
        heading={
          <>
            What brings
            <br />
            you <span className="text-[var(--color-blue-600)]">here?</span>
          </>
        }
        body="Pick up to three. This shapes who we introduce you to."
      />

      <StepSection label="CHOSEN" aside={`${data.objectives.size} of ${MAX_OBJECTIVES}`}>
        <div className="flex flex-col gap-[8px]">
          {OBJECTIVES.map((label, index) => (
            <SelectRow
              key={label}
              selected={data.objectives.has(index)}
              onClick={() => toggle(index)}
              leading={
                <span className="w-[22px] shrink-0 text-[13px] leading-[18px] text-[var(--color-black-500)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
              }
            >
              {label}
            </SelectRow>
          ))}
        </div>
      </StepSection>
    </div>
  );
}
