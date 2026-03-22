import { useState } from 'react';
import { KYCData } from '../KYCModal';

interface Step5Props {
  isActive: boolean;
  direction: 'forward' | 'back';
  data: KYCData;
  updateData: (updates: Partial<KYCData>) => void;
}

const defaultHobbies = [
  'Photography', 'Running', 'Coffee', 'Books', 'Travel', 'Design',
  'Music', 'Gaming', 'Cooking', 'Film', 'Writing', 'Startups',
  'Meditation', 'Cycling', 'Football', 'Architecture', 'Podcasts', 'Philosophy'
];

export function Step5Hobbies({ isActive, direction, data, updateData }: Step5Props) {
  const [customInput, setCustomInput] = useState('');

  const getClassName = () => {
    if (isActive) return 'kyc-step-active';
    if (direction === 'forward') return 'kyc-step-exit-left';
    return 'kyc-step-exit-right';
  };

  const toggleHobby = (hobby: string) => {
    const newHobbies = new Set(data.hobbies);
    if (newHobbies.has(hobby)) {
      newHobbies.delete(hobby);
    } else {
      newHobbies.add(hobby);
    }
    updateData({ hobbies: newHobbies });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customInput.trim()) {
      toggleHobby(customInput.trim());
      setCustomInput('');
    }
  };

  return (
    <div className={`kyc-step ${getClassName()}`}>
      <span className="font-['Inter'] text-[10px] tracking-[0.3em] uppercase text-[#7FFF00]/50 mb-[14px] block">
        Your texture
      </span>
      <h1 className="font-['Libre_Baskerville'] text-[clamp(28px,4vw,40px)] font-light italic leading-[1.15] tracking-[-0.02em] text-white/90 mb-[10px]">
        What are<br />
        you <em className="not-italic text-[#7FFF00]">into?</em>
      </h1>
      <p className="text-[15px] font-light leading-[1.75] text-white/45 mb-8">
        The unexpected common ground makes the best conversations.
      </p>

      {/* Tags cloud */}
      <div className="flex flex-wrap gap-2 mb-4">
        {defaultHobbies.map((hobby) => (
          <button
            key={hobby}
            onClick={() => toggleHobby(hobby)}
            className={`font-['Inter'] text-[11px] tracking-[0.1em] px-4 py-2 rounded-[20px] border transition-all ${
              data.hobbies.has(hobby)
                ? 'bg-[#7FFF00]/[0.12] border-[#7FFF00]/35 text-[#7FFF00]/90'
                : 'bg-[#101410] border-white/[0.07] text-white/90 hover:border-white/10 hover:bg-white/[0.05]'
            }`}
          >
            {hobby}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="flex items-center gap-[10px] mt-1 bg-white/[0.08] border border-white/[0.07] rounded-[20px] px-4 py-2 focus-within:border-[#7FFF00]/30 transition-colors">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add your own…"
          className="flex-1 bg-transparent border-none outline-none font-['Inter'] text-[11px] tracking-[0.1em] text-white/90 placeholder:text-white/30"
        />
        <span className="font-['Inter'] text-[9px] tracking-[0.14em] uppercase text-white/30">↵ Enter</span>
      </div>
    </div>
  );
}