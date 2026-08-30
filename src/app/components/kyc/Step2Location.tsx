import { useState } from 'react';
import { Search } from 'lucide-react';
import type { StepProps } from './kycData';
import {
  CITIES,
  EVENING_END,
  EVENING_START,
  cityTimezoneLabel,
  cityTimezoneValue,
  eveningOverlaps,
  type City,
} from '../../constants/cities';
import {
  CountryMark,
  DaylightBand,
  ICON_SIZE,
  iconStroke,
  FieldInput,
  ListBand,
  ListContainer,
  SectionLabel,
  StepHeader,
  Well,
} from '../../../rebrand/primitives';

/**
 * Step 2, redesigned rather than restyled.
 *
 * The old screen was a search box over a flat list: it ASKED for a city and
 * told you nothing back. But location only matters here because it decides who
 * you can actually meet — so the row now carries that answer. Each city's 6–9pm
 * is drawn on YOUR 24-hour line, and picking a city re-frames every other row
 * against it.
 *
 * The new component this produced is DaylightBand (redesign.md 5.12). Step 10
 * reuses it.
 */
export function Step2Location({ data, updateData }: StepProps) {
  const [query, setQuery] = useState('');

  const me: City = CITIES.find((c) => c.name === data.city) ?? CITIES[0];
  const q = query.trim().toLowerCase();
  const shown = q ? CITIES.filter((c) => c.name.toLowerCase().includes(q)) : CITIES;
  const overlapCount = CITIES.filter((c) => c.name !== me.name && eveningOverlaps(c, me)).length;

  return (
    <div>
      <StepHeader
        label="YOUR LOCATION"
        heading={
          <>
            Who could you
            <br />
            meet <span className="text-[var(--color-blue-600)]">tonight?</span>
          </>
        }
        body="Pick your city and the rest of the cohort reorganises around your evening. Bars are each city's 6–9pm, drawn on your clock."
      />

      <SectionLabel>YOUR CITY</SectionLabel>
      <Well className="mt-[8px] flex flex-col gap-[12px]">
        <div className="flex items-baseline justify-between gap-[12px]">
          <span className="rebrand-display text-[20px] font-medium leading-[100%] text-[var(--color-black-700)]">
            {me.name}
          </span>
          <span className="whitespace-nowrap text-[12px] leading-[120%] text-[var(--color-black-500)]">
            {cityTimezoneLabel(me)}
          </span>
        </div>
        <DaylightBand
          windows={[[EVENING_START, EVENING_END]]}
          tone="me"
          label={`Your evening, 6pm to 9pm in ${me.name}`}
        />
        <span className="text-[13px] leading-[18px] text-[var(--color-black-700)]">
          {overlapCount} of {CITIES.length - 1} cohort cities share your 6–9pm. The rest get matched into your morning
          instead, never your 2am.
        </span>
      </Well>

      <SectionLabel className="mt-[24px]">THE COHORT</SectionLabel>
      <ListContainer className="mt-[8px]">
        {/* The filter and the axis live INSIDE the list, divided off. A search
            field floating above its list reads as a second, unrelated object. */}
        <ListBand className="gap-[10px]">
          {/* A bare ring reads as an unselected radio, not as search. The
              handle is what makes it a magnifier. */}
          <Search size={ICON_SIZE.sm} strokeWidth={iconStroke(ICON_SIZE.sm, 24)} className="shrink-0 text-[var(--color-black-400)]" />
          <FieldInput
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter cities…"
            aria-label="Filter cities"
          />
        </ListBand>

        <ListBand recessed className="gap-[14px]">
          <span className="w-[144px] shrink-0 text-[12px] leading-none text-[var(--color-black-500)]">
            their 6–9pm →
          </span>
          <span className="flex flex-1 justify-between">
            {['12a', '6a', '12p', '6p', '12a'].map((t, i) => (
              <span key={i} className="text-[12px] leading-none text-[var(--color-black-500)]">
                {t}
              </span>
            ))}
          </span>
        </ListBand>

        <div className="flex flex-col gap-[4px] p-[8px]">
          {shown.map((city) => {
            const isMe = city.name === me.name;
            const shift = city.offsetHours - me.offsetHours;
            const overlaps = isMe || eveningOverlaps(city, me);
            const note = isMe
              ? 'your evening'
              : overlaps
                ? 'overlaps your evening'
                : `${Math.abs(shift)}h ${shift > 0 ? 'ahead' : 'behind'}`;

            return (
              <button
                key={city.name}
                type="button"
                aria-pressed={isMe}
                onClick={() => updateData({ city: city.name, timezone: cityTimezoneValue(city) })}
                className={
                  'flex w-full items-center gap-[14px] rounded-[8px] border px-[14px] py-[10px] text-left transition-colors ' +
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-blue-600)] ' +
                  // Rows live inside a bordered container, so an unselected row
                  // draws no border of its own. Only the selected row resolves
                  // into a surface.
                  (isMe
                    ? 'border-[var(--color-blue-600)] bg-[var(--color-blue-100)]'
                    : 'border-transparent hover:bg-[var(--color-black-50)]')
                }
              >
                <CountryMark code={city.country} />
                <span className="flex w-[104px] shrink-0 flex-col gap-[4px]">
                  <span className="text-[14px] font-medium leading-[16px] text-[var(--color-black-700)]">
                    {city.name}
                  </span>
                  <span
                    className={
                      'text-[12px] leading-[120%] ' +
                      (overlaps ? 'text-[var(--color-blue-600)]' : 'text-[var(--color-black-500)]')
                    }
                  >
                    {note}
                  </span>
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-[6px]">
                  <DaylightBand
                    windows={[[EVENING_START - shift, EVENING_END - shift]]}
                    tone={isMe ? 'me' : overlaps ? 'overlap' : 'off'}
                    label={`${city.name}'s evening on your clock`}
                  />
                  <span className="text-[12px] leading-none text-[var(--color-black-500)]">
                    {cityTimezoneLabel(city)}
                  </span>
                </span>
              </button>
            );
          })}

          {shown.length === 0 && (
            <p className="px-[14px] py-[20px] text-[14px] leading-[16px] text-[var(--color-black-500)]">
              No city matches “{query}”. Pick the closest major city; you can refine it later.
            </p>
          )}
        </div>
      </ListContainer>
    </div>
  );
}
