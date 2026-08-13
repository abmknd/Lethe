import { Search } from 'lucide-react';
import { useState } from 'react';
import { KYCData } from '../KYCModal';
import { Input } from '../../../rebrand/primitives';

interface Step2Props {
  isActive: boolean;
  direction: 'forward' | 'back';
  data: KYCData;
  updateData: (updates: Partial<KYCData>) => void;
}

const cityData = [
  { flag: '🇳🇬', name: 'Lagos', tz: 'WAT (UTC+1)' },
  { flag: '🇬🇧', name: 'London', tz: 'GMT (UTC+0)' },
  { flag: '🇺🇸', name: 'New York', tz: 'EST (UTC-5)' },
  { flag: '🇺🇸', name: 'San Francisco', tz: 'PST (UTC-8)' },
  { flag: '🇳🇱', name: 'Amsterdam', tz: 'CET (UTC+1)' },
  { flag: '🇩🇪', name: 'Berlin', tz: 'CET (UTC+1)' },
  { flag: '🇸🇬', name: 'Singapore', tz: 'SGT (UTC+8)' },
  { flag: '🇯🇵', name: 'Tokyo', tz: 'JST (UTC+9)' },
  { flag: '🇮🇳', name: 'Bangalore', tz: 'IST (UTC+5:30)' },
  { flag: '🇿🇦', name: 'Cape Town', tz: 'SAST (UTC+2)' },
  { flag: '🇫🇷', name: 'Paris', tz: 'CET (UTC+1)' },
  { flag: '🇧🇷', name: 'São Paulo', tz: 'BRT (UTC-3)' },
];

/**
 * Step 2, per the in-app card spec.
 *
 * The picker is a WELL: it sits one ramp step recessed from the card so the
 * list reads as contained rather than floating, and each row is one step
 * raised from that well when selected. Three levels, all on the blue ramp,
 * no new colour.
 */
export function Step2Location({ isActive, direction, data, updateData }: Step2Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const getClassName = () => {
    if (isActive) return 'kyc-step-active';
    if (direction === 'forward') return 'kyc-step-exit-left';
    return 'kyc-step-exit-right';
  };

  const filteredCities = searchQuery
    ? cityData.filter((city) => city.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : cityData;

  return (
    <div className={`kyc-step ${getClassName()}`}>
      <span className="mb-[14px] block text-[14px] font-medium leading-[100%] tracking-[0.5px] text-[var(--color-blue-300)]">
        YOUR LOCATION
      </span>

      {/* On a blue surface the emphasis colour is Yellow 600. */}
      <h1 className="rebrand-display mb-[12px] text-[clamp(28px,4vw,40px)] font-normal leading-[100%] text-[var(--color-white)]">
        Where are
        <br />
        you <span className="text-[var(--color-yellow-600)]">based?</span>
      </h1>

      <p className="mb-[24px] text-[16px] leading-[120%] text-[var(--color-white)]">
        This helps us find people in your world, and people worth crossing timezones for.
      </p>

      {/* The well */}
      <div className="flex flex-col gap-[12px] rounded-[16px] border border-[var(--color-blue-500)] bg-[var(--color-blue-700)] p-[8px]">
        <Input
          surface="blue"
          type="text"
          placeholder="Search cities…"
          aria-label="Search cities"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={16} strokeWidth={1.25} />}
        />

        <div className="flex max-h-[280px] flex-col gap-[4px] overflow-y-auto">
          {filteredCities.map((city) => {
            const selected = data.city === city.name;
            return (
              <button
                key={city.name}
                onClick={() => updateData({ city: city.name, timezone: city.tz })}
                aria-pressed={selected}
                className={
                  'flex h-[52px] shrink-0 items-center gap-[12px] rounded-[10px] border px-[16px] transition-colors ' +
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-white)] ' +
                  (selected
                    ? 'border-[var(--color-blue-400)] bg-[var(--color-blue-500)]'
                    : 'border-[var(--color-blue-500)] hover:border-[var(--color-blue-400)]')
                }
              >
                <span className="w-[24px] text-center text-[20px] leading-none">{city.flag}</span>
                <span className="flex-1 text-left text-[14px] font-medium leading-[16px] text-[var(--color-white)]">
                  {city.name}
                </span>
                <span className="text-[12px] font-light leading-[120%] text-[var(--color-white)]">{city.tz}</span>
              </button>
            );
          })}

          {filteredCities.length === 0 && (
            <p className="px-[16px] py-[20px] text-[14px] leading-[16px] text-[var(--color-blue-300)]">
              No city matches “{searchQuery}”. Pick the closest major city; you can refine it later.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
