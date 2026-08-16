import type { StepProps } from './kycData';
import { AVAILABILITY_DAYS, AVAILABILITY_WINDOWS } from '../../constants/kyc';
import {
  Chip,
  DaylightBand,
  SectionLabel,
  SelectRow,
  StepHeader,
  StepSection,
  Well,
} from '../../../rebrand/primitives';

/**
 * Step 10.
 *
 * The three window rows stay as the INPUT: they carry the startHour/endHour
 * bounds the matcher consumes, and a coarse preset is what we promise ("manual
 * window default"). What DaylightBand adds is the read-out — the same 24-hour
 * language Step 2 taught the user two screens earlier, now showing their own
 * week. Replacing the rows outright with a draggable track is a different
 * interaction, unspecified anywhere, and is logged as open in redesign.md.
 */
export function Step10Availability({ data, updateData }: StepProps) {
  const toggleDay = (value: number) => {
    const next = new Set(data.availabilityDays);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    updateData({ availabilityDays: next });
  };

  const toggleWindow = (key: string) => {
    const next = new Set(data.availabilityWindows);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    updateData({ availabilityWindows: next });
  };

  const slotCount = data.availabilityDays.size * data.availabilityWindows.size;
  const chosen = AVAILABILITY_WINDOWS.filter((w) => data.availabilityWindows.has(w.key));

  return (
    <div>
      <StepHeader
        label="YOUR CALENDAR"
        heading={
          <>
            When are
            <br />
            you <span className="text-[var(--color-blue-600)]">free?</span>
          </>
        }
        body="We only introduce people who can actually meet. Pick the days and times that usually work — you can change this anytime."
      />

      <StepSection label="DAYS">
        <div className="flex flex-wrap gap-[8px]">
          {AVAILABILITY_DAYS.map((day) => (
            <Chip
              key={day.value}
              selected={data.availabilityDays.has(day.value)}
              onClick={() => toggleDay(day.value)}
            >
              {day.label}
            </Chip>
          ))}
        </div>
      </StepSection>

      <StepSection label="TIMES">
        <div className="flex flex-col gap-[8px]">
          {AVAILABILITY_WINDOWS.map((w) => (
            <SelectRow
              key={w.key}
              selected={data.availabilityWindows.has(w.key)}
              onClick={() => toggleWindow(w.key)}
              trailing={
                <span className="shrink-0 text-[13px] leading-[18px] text-[var(--color-black-500)]">{w.hint}</span>
              }
            >
              <span className="text-[16px] leading-[20px]">{w.label}</span>
            </SelectRow>
          ))}
        </div>
      </StepSection>

      <Well className="mt-[24px] flex flex-col gap-[12px]">
        <div className="flex items-center justify-between gap-[12px]">
          <SectionLabel>WEEKLY WINDOWS</SectionLabel>
          <span className="text-[16px] font-medium leading-[20px] text-[var(--color-blue-600)]">
            {slotCount > 0 ? `${slotCount} ${slotCount === 1 ? 'slot' : 'slots'}` : '—'}
          </span>
        </div>
        <DaylightBand
          windows={chosen.map((w) => [w.startHour, w.endHour] as [number, number])}
          tone="me"
          label={
            chosen.length
              ? `Your day, with ${chosen.map((w) => w.label.toLowerCase()).join(' and ')} marked`
              : 'Your day, with nothing marked yet'
          }
        />
        <div className="flex justify-between">
          {['12a', '6a', '12p', '6p', '12a'].map((t, i) => (
            <span key={i} className="text-[12px] leading-none text-[var(--color-black-500)]">
              {t}
            </span>
          ))}
        </div>
      </Well>
    </div>
  );
}
