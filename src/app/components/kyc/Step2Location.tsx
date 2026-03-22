import { Search } from 'lucide-react';
import { useState } from 'react';
import { KYCData } from '../KYCModal';

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

  const selectCity = (city: typeof cityData[0]) => {
    updateData({ city: city.name, timezone: city.tz });
  };

  return (
    <div className={`kyc-step ${getClassName()}`}>
      <span className="font-['Inter'] text-[10px] tracking-[0.3em] uppercase text-[#7FFF00]/50 mb-[14px] block">
        Your world
      </span>
      <h1 className="font-['Libre_Baskerville'] text-[clamp(28px,4vw,40px)] font-light italic leading-[1.15] tracking-[-0.02em] text-white/90 mb-[10px]">
        Where are<br />
        you <em className="not-italic text-[#7FFF00]">based?</em>
      </h1>
      <p className="text-[15px] font-light leading-[1.75] text-white/45 mb-8">
        This helps us find people in your world — and people worth crossing timezones for.
      </p>

      {/* Search */}
      <div className="flex items-center gap-[10px] bg-white/[0.08] border border-white/[0.07] rounded-xl px-4 py-3 mb-5 transition-colors focus-within:border-[#7FFF00]/30">
        <Search size={16} className="text-white/30 flex-shrink-0" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Search cities…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none font-['Inter'] text-[13px] tracking-[0.04em] text-white/90 placeholder:text-white/30"
        />
      </div>

      {/* Cities list */}
      <div className="flex flex-col gap-[1px] mb-5">
        {filteredCities.map((city) => (
          <button
            key={city.name}
            onClick={() => selectCity(city)}
            className={`flex items-center gap-[14px] px-4 py-[13px] rounded-[10px] border transition-all ${
              data.city === city.name
                ? 'bg-[#7FFF00]/[0.12] border-[#7FFF00]/25'
                : 'border-transparent hover:bg-white/[0.04] hover:border-white/[0.07]'
            }`}
          >
            <span className="text-[20px] leading-none w-7 text-center">{city.flag}</span>
            <span className="flex-1 text-left text-[16px] font-light text-white/90">{city.name}</span>
            <span className="font-['Inter'] text-[10px] tracking-[0.1em] text-white/30">{city.tz}</span>
          </button>
        ))}
      </div>

      {/* Timezone display */}
      <div className="flex items-center gap-[10px] px-4 py-3 bg-white/[0.08] border border-white/[0.07] rounded-[10px] mt-1">
        <span className="flex-1 font-['Inter'] text-[10px] tracking-[0.18em] uppercase text-white/30">Timezone</span>
        <span className="font-['Inter'] text-[12px] text-[#7FFF00]/60">{data.timezone || '—'}</span>
      </div>
    </div>
  );
}