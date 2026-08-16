import type { StepProps } from './kycData';
import { MEETABLE_ROLE_OPTIONS, ROLE_OPTIONS, ROLE_OTHER_INDEX } from '../../constants/roles';
import { Chip, FieldInput, FieldShell, SelectRow, StepHeader, StepSection } from '../../../rebrand/primitives';

/**
 * Step 9. Role FAMILIES, not job titles — see constants/roles.ts for why.
 *
 * "Open to anyone" sits ABOVE the meet-list rather than inside it, because it
 * is not one more thing to tick: it is the answer that makes the list moot. So
 * it takes the list out of play instead of adding to it.
 */
export function Step9Role({ data, updateData }: StepProps) {
  const togglePreferred = (index: number) => {
    const next = new Set(data.preferredUserTypes);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    updateData({ preferredUserTypes: next });
  };

  const toggleOpen = () => {
    const openToAnyone = !data.openToAnyone;
    updateData({ openToAnyone, preferredUserTypes: openToAnyone ? new Set() : data.preferredUserTypes });
  };

  return (
    <div>
      <StepHeader
        label="YOUR ROLE"
        heading={
          <>
            What best
            <br />
            describes <span className="text-[var(--color-blue-600)]">you?</span>
          </>
        }
        body="Pick one for yourself, then choose every role you'd like to meet."
      />

      <StepSection label="I AM A…">
        <div className="flex flex-wrap gap-[8px]">
          {ROLE_OPTIONS.map((label, index) => (
            <Chip key={label} selected={data.userType === index} onClick={() => updateData({ userType: index })}>
              {label}
            </Chip>
          ))}
        </div>

        {data.userType === ROLE_OTHER_INDEX && (
          <FieldShell>
            <FieldInput
              type="text"
              value={data.roleOther}
              onChange={(e) => updateData({ roleOther: e.target.value })}
              placeholder="Drone pilot, midwife, luthier…"
              aria-label="Your role"
            />
            <span className="shrink-0 text-[12px] leading-none text-[var(--color-black-400)]">free text</span>
          </FieldShell>
        )}
      </StepSection>

      <StepSection label="I'D LIKE TO MEET…">
        <SelectRow selected={data.openToAnyone} onClick={toggleOpen}>
          <span className="flex flex-col gap-[4px]">
            <span className="text-[14px] font-medium leading-[16px] text-[var(--color-black-700)]">
              Open to anyone
            </span>
            <span className="text-[13px] leading-[18px] text-[var(--color-black-500)]">
              Let the overlap decide instead of the job title
            </span>
          </span>
        </SelectRow>

        {!data.openToAnyone && (
          <div className="flex flex-col gap-[8px]">
            {MEETABLE_ROLE_OPTIONS.map((label, index) => (
              <SelectRow
                key={label}
                selected={data.preferredUserTypes.has(index)}
                onClick={() => togglePreferred(index)}
              >
                {label}
              </SelectRow>
            ))}
          </div>
        )}
      </StepSection>
    </div>
  );
}
