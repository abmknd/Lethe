import { KYCData } from '../KYCModal';

interface Step10Props {
  isActive: boolean;
  direction: 'forward' | 'back';
  data: KYCData;
  updateData: (updates: Partial<KYCData>) => void;
}

// Sunday = 0 to match the backend slot.dayOfWeek / getUTCDay() convention,
// but presented Monday-first.
const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

// Preset windows. Kept coarse on purpose — "manual window default" per the
// alignment plan; finer calendar sync comes later. startHour/endHour are the
// slot bounds the matcher consumes.
export const AVAILABILITY_WINDOWS = [
  { key: 'morning', label: 'Morning', hint: '9am – 12pm', startHour: 9, endHour: 12 },
  { key: 'afternoon', label: 'Afternoon', hint: '12pm – 5pm', startHour: 12, endHour: 17 },
  { key: 'evening', label: 'Evening', hint: '5pm – 9pm', startHour: 17, endHour: 21 },
];

export function Step10Availability({ isActive, direction, data, updateData }: Step10Props) {
  const getClassName = () => {
    if (isActive) return 'kyc-step-active';
    if (direction === 'forward') return 'kyc-step-exit-left';
    return 'kyc-step-exit-right';
  };

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

  return (
    <div className={`kyc-step ${getClassName()}`}>
      <span className="font-['Inter'] text-[10px] tracking-[0.3em] uppercase text-[#7FFF00]/50 mb-[14px] block">
        Your calendar
      </span>
      <h1 className="font-['Cormorant_Garamond'] text-[clamp(28px,4vw,40px)] font-light italic leading-[1.15] tracking-[-0.02em] text-white/90 mb-[10px]">
        When are<br />
        you <em className="not-italic text-[#7FFF00]">free?</em>
      </h1>
      <p className="text-[15px] font-light leading-[1.75] text-white/45 mb-8">
        We only introduce people who can actually meet. Pick the days and times that usually work — you can change this anytime.
      </p>

      {/* Days */}
      <span className="font-['Inter'] text-[10px] tracking-[0.18em] uppercase text-white/30 mb-[10px] block">
        Days
      </span>
      <div className="flex flex-wrap gap-2 mb-6">
        {DAYS.map((day) => (
          <button
            key={day.value}
            onClick={() => toggleDay(day.value)}
            className={`font-['Inter'] text-[11px] tracking-[0.1em] px-4 py-2 rounded-[20px] border transition-all ${
              data.availabilityDays.has(day.value)
                ? 'bg-[#7FFF00]/[0.12] border-[#7FFF00]/35 text-[#7FFF00]/90'
                : 'bg-[#101410] border-white/[0.07] text-white/90 hover:border-white/10 hover:bg-white/[0.05]'
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Windows */}
      <span className="font-['Inter'] text-[10px] tracking-[0.18em] uppercase text-white/30 mb-[10px] block">
        Times
      </span>
      <div className="flex flex-col gap-[1px] mb-5">
        {AVAILABILITY_WINDOWS.map((w) => (
          <button
            key={w.key}
            onClick={() => toggleWindow(w.key)}
            className={`flex items-center gap-[14px] px-4 py-[13px] rounded-[10px] border transition-all ${
              data.availabilityWindows.has(w.key)
                ? 'bg-[#7FFF00]/[0.12] border-[#7FFF00]/25'
                : 'border-transparent hover:bg-white/[0.04] hover:border-white/[0.07]'
            }`}
          >
            <span className="flex-1 text-left text-[16px] font-light text-white/90">{w.label}</span>
            <span className="font-['Inter'] text-[10px] tracking-[0.1em] text-white/30">{w.hint}</span>
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="flex items-center gap-[10px] px-4 py-3 bg-white/[0.08] border border-white/[0.07] rounded-[10px] mt-1">
        <span className="flex-1 font-['Inter'] text-[10px] tracking-[0.18em] uppercase text-white/30">
          Weekly windows
        </span>
        <span className="font-['Inter'] text-[12px] text-[#7FFF00]/60">
          {slotCount > 0 ? `${slotCount} slot${slotCount === 1 ? '' : 's'}` : '—'}
        </span>
      </div>
    </div>
  );
}
