import { useState } from 'react';
import type { StepProps } from './kycData';
import { WHERE_OPTIONS, WHO_OPTIONS } from '../../constants/kyc';
import { Accordion, SelectRow, StepHeader } from '../../../rebrand/primitives';

/** Step 4. Two disclosures, one open at a time — the step is long enough that
 *  both open at 375 is a scroll with no shape to it. */
export function Step4MeetKind({ data, updateData }: StepProps) {
  const [open, setOpen] = useState<'who' | 'where'>('who');

  const toggled = (from: Set<number>, index: number) => {
    const next = new Set(from);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    return next;
  };

  return (
    <div>
      <StepHeader
        label="YOUR MATCH"
        heading={
          <>
            I want to meet
            <br />
            people <span className="text-[var(--color-blue-600)]">who…</span>
          </>
        }
        body="Select everything that resonates. The more honest you are, the better the match."
      />

      <div className="flex flex-col gap-[8px]">
        <Accordion
          title="Who they are"
          count={data.meetWho.size}
          open={open === 'who'}
          onToggle={() => setOpen('who')}
        >
          {WHO_OPTIONS.map((label, index) => (
            <SelectRow
              key={label}
              bare
              selected={data.meetWho.has(index)}
              onClick={() => updateData({ meetWho: toggled(data.meetWho, index) })}
            >
              {label}
            </SelectRow>
          ))}
        </Accordion>

        <Accordion
          title="Where they are based"
          count={data.meetWhere.size}
          open={open === 'where'}
          onToggle={() => setOpen('where')}
        >
          {WHERE_OPTIONS.map((label, index) => (
            <SelectRow
              key={label}
              bare
              selected={data.meetWhere.has(index)}
              onClick={() => updateData({ meetWhere: toggled(data.meetWhere, index) })}
            >
              {label}
            </SelectRow>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
