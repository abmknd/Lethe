import type { StepProps } from './kycData';
import { INTRO_EXAMPLES, INTRO_MAX } from '../../constants/kyc';
import { SegmentedToggle, StepHeader, StepSection, Textarea } from '../../../rebrand/primitives';

export function Step6Intro({ data, updateData }: StepProps) {
  const remaining = INTRO_MAX - data.intro.length;

  return (
    <div>
      <StepHeader
        label="YOUR VOICE"
        heading={
          <>
            How would you
            <br />
            <span className="text-[var(--color-blue-600)]">introduce yourself?</span>
          </>
        }
        body="This is the first thing your match reads. Write like a person, not a profile."
      />

      <Textarea
        value={data.intro}
        onChange={(e) => updateData({ intro: e.target.value.slice(0, INTRO_MAX) })}
        maxLength={INTRO_MAX}
        aria-label="Your introduction"
        placeholder="I'm a product designer who thinks about the ethics of what we build…"
        className="min-h-[132px]"
      />
      <div className="mt-[4px] flex justify-end">
        <span className="whitespace-nowrap text-[12px] leading-[120%] text-[var(--color-black-500)]">
          {remaining} remaining
        </span>
      </div>

      {/* A yes/no is a segmented toggle, not a switch. The switch we had was a
          third control shape for a binary the system already answers. */}
      <div className="mt-[24px] flex items-center gap-[16px] rounded-[12px] border border-[var(--color-black-100)] p-[12px]">
        <div className="flex flex-1 flex-col gap-[4px]">
          <span className="text-[14px] font-medium leading-[16px] text-[var(--color-black-700)]">
            Make this my profile bio
          </span>
          <span className="text-[13px] leading-[18px] text-[var(--color-black-500)]">
            Your intro also appears on your public profile
          </span>
        </div>
        <div className="w-[150px] shrink-0">
          <SegmentedToggle
            label="Make this my profile bio"
            options={['NO', 'YES'] as const}
            value={data.bioAsProfile ? 'YES' : 'NO'}
            onChange={(v) => updateData({ bioAsProfile: v === 'YES' })}
          />
        </div>
      </div>

      <StepSection label="SOME EXAMPLES">
        <div className="flex flex-col gap-[8px]">
          {INTRO_EXAMPLES.map((example) => (
            <p
              key={example}
              className="rounded-[10px] border border-[var(--color-black-200)] bg-[var(--color-black-50)] px-[16px] py-[12px] text-[13px] leading-[18px] text-[var(--color-black-500)]"
            >
              {example}
            </p>
          ))}
        </div>
      </StepSection>
    </div>
  );
}
