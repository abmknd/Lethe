import { useState } from 'react';
import type { StepProps } from './kycData';
import { HOBBIES } from '../../constants/kyc';
import { Chip, FieldInput, FieldShell, StepHeader } from '../../../rebrand/primitives';

export function Step5Hobbies({ data, updateData }: StepProps) {
  const [custom, setCustom] = useState('');

  const toggle = (hobby: string) => {
    const next = new Set(data.hobbies);
    if (next.has(hobby)) next.delete(hobby);
    else next.add(hobby);
    updateData({ hobbies: next });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const value = custom.trim();
    if (!value) return;
    toggle(value);
    setCustom('');
  };

  // Anything the user added shows up in the cloud alongside the presets, so a
  // custom interest can be un-picked the same way as any other.
  const added = [...data.hobbies].filter((h) => !HOBBIES.includes(h as (typeof HOBBIES)[number]));

  return (
    <div>
      <StepHeader
        label="YOUR TEXTURE"
        heading={
          <>
            What are
            <br />
            you <span className="text-[var(--color-blue-600)]">into?</span>
          </>
        }
        body="The unexpected common ground makes the best conversations."
      />

      <div className="flex flex-wrap gap-[8px]">
        {[...HOBBIES, ...added].map((hobby) => (
          <Chip key={hobby} selected={data.hobbies.has(hobby)} onClick={() => toggle(hobby)}>
            {hobby}
          </Chip>
        ))}
      </div>

      <FieldShell className="mt-[16px]">
        <FieldInput
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Add your own…"
          aria-label="Add your own interest"
        />
        <span className="shrink-0 text-[12px] leading-none text-[var(--color-black-400)]">↵ enter</span>
      </FieldShell>
    </div>
  );
}
