import { Check } from 'lucide-react';
import { KYCData } from '../KYCModal';
import { ROLE_OPTIONS } from '../../constants/roles';

interface Step9Props {
  isActive: boolean;
  direction: 'forward' | 'back';
  data: KYCData;
  updateData: (updates: Partial<KYCData>) => void;
}

export function Step9Role({ isActive, direction, data, updateData }: Step9Props) {
  const getClassName = () => {
    if (isActive) return 'kyc-step-active';
    if (direction === 'forward') return 'kyc-step-exit-left';
    return 'kyc-step-exit-right';
  };

  const togglePreferred = (index: number) => {
    const newSet = new Set(data.preferredUserTypes);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    updateData({ preferredUserTypes: newSet });
  };

  return (
    <div className={`kyc-step ${getClassName()}`}>
      <span className="font-['Inter'] text-[10px] tracking-[0.3em] uppercase text-[#7FFF00]/50 mb-[14px] block">
        Your role
      </span>
      <h1 className="font-['Cormorant_Garamond'] text-[clamp(28px,4vw,40px)] font-light italic leading-[1.15] tracking-[-0.02em] text-white/90 mb-[10px]">
        What best<br />
        describes <em className="not-italic text-[#7FFF00]">you?</em>
      </h1>
      <p className="text-[15px] font-light leading-[1.75] text-white/45 mb-6">
        Pick one for yourself, then choose every role you'd like to meet.
      </p>

      {/* Own role — single select */}
      <div className="mb-5">
        <p className="font-['Inter'] text-[10px] tracking-[0.18em] uppercase text-white/45 mb-2">
          I am a…
        </p>
        <div className="grid grid-cols-2 gap-[6px]">
          {ROLE_OPTIONS.map((option, index) => {
            const selected = data.userType === index;
            return (
              <button
                key={option}
                onClick={() => updateData({ userType: index })}
                className={`flex items-center justify-between px-[14px] py-[12px] rounded-xl border transition-all ${
                  selected
                    ? 'bg-[#7FFF00]/[0.12] border-[#7FFF00]/30'
                    : 'bg-transparent border-white/[0.05] hover:bg-white/[0.04]'
                }`}
              >
                <span className="text-[14px] font-light text-white/90">{option}</span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    selected ? 'bg-[#7FFF00] border-[#7FFF00]' : 'border-white/10'
                  }`}
                >
                  {selected && <Check size={9} className="text-[#050705]" strokeWidth={2.5} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred — multi select */}
      <div>
        <p className="font-['Inter'] text-[10px] tracking-[0.18em] uppercase text-white/45 mb-2">
          I'd like to meet…
        </p>
        <div className="grid grid-cols-2 gap-[6px]">
          {ROLE_OPTIONS.map((option, index) => {
            const selected = data.preferredUserTypes.has(index);
            return (
              <button
                key={option}
                onClick={() => togglePreferred(index)}
                className={`flex items-center justify-between px-[14px] py-[12px] rounded-xl border transition-all ${
                  selected
                    ? 'bg-[#7FFF00]/[0.12] border-[#7FFF00]/30'
                    : 'bg-transparent border-white/[0.05] hover:bg-white/[0.04]'
                }`}
              >
                <span className="text-[14px] font-light text-white/90">{option}</span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    selected ? 'bg-[#7FFF00] border-[#7FFF00]' : 'border-white/10'
                  }`}
                >
                  {selected && <Check size={9} className="text-[#050705]" strokeWidth={2.5} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
