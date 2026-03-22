import { Check } from 'lucide-react';
import { KYCData } from '../KYCModal';

interface Step3Props {
  isActive: boolean;
  direction: 'forward' | 'back';
  data: KYCData;
  updateData: (updates: Partial<KYCData>) => void;
}

const objectives = [
  { icon: '🔨', label: 'Build in public' },
  { icon: '🤝', label: 'Find a cofounder' },
  { icon: '🌐', label: 'Grow my network' },
  { icon: '✦', label: 'Meet interesting people' },
  { icon: '🧭', label: 'Get mentored' },
  { icon: '💡', label: 'Mentor others' },
  { icon: '🔭', label: 'Explore new fields' },
  { icon: '🗣', label: 'Share knowledge' },
];

export function Step3Objectives({ isActive, direction, data, updateData }: Step3Props) {
  const getClassName = () => {
    if (isActive) return 'kyc-step-active';
    if (direction === 'forward') return 'kyc-step-exit-left';
    return 'kyc-step-exit-right';
  };

  const toggleObjective = (index: number) => {
    const newObjectives = new Set(data.objectives);
    if (newObjectives.has(index)) {
      newObjectives.delete(index);
    } else if (newObjectives.size < 3) {
      newObjectives.add(index);
    }
    updateData({ objectives: newObjectives });
  };

  return (
    <div className={`kyc-step ${getClassName()}`}>
      <span className="font-['Inter'] text-[10px] tracking-[0.3em] uppercase text-[#7FFF00]/50 mb-[14px] block">
        Your intent
      </span>
      <h1 className="font-['Libre_Baskerville'] text-[clamp(28px,4vw,40px)] font-light italic leading-[1.15] tracking-[-0.02em] text-white/90 mb-[10px]">
        What brings<br />
        you <em className="not-italic text-[#7FFF00]">here?</em>
      </h1>
      <p className="text-[15px] font-light leading-[1.75] text-white/45 mb-8">
        Pick up to three. This shapes who we introduce you to.
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {objectives.map((obj, index) => {
          const isSelected = data.objectives.has(index);
          const isDimmed = data.objectives.size >= 3 && !isSelected;

          return (
            <button
              key={index}
              onClick={() => toggleObjective(index)}
              className={`relative px-4 py-[18px] rounded-[14px] border transition-all flex flex-col items-start gap-2 ${
                isSelected
                  ? 'bg-[#7FFF00]/[0.12] border-[#7FFF00]/30'
                  : isDimmed
                  ? 'bg-[#101410] border-white/[0.07] opacity-35 pointer-events-none'
                  : 'bg-[#101410] border-white/[0.07] hover:bg-white/[0.04] hover:border-white/10'
              }`}
            >
              <span className="text-[22px] leading-none">{obj.icon}</span>
              <span className="text-[14px] font-light text-white/90 leading-[1.3] text-left">{obj.label}</span>
              
              {/* Check mark */}
              <div
                className={`absolute top-[10px] right-[10px] w-[18px] h-[18px] rounded-full bg-[#7FFF00] flex items-center justify-center transition-all ${
                  isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
              >
                <Check size={10} className="text-[#050705]" strokeWidth={2.5} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}