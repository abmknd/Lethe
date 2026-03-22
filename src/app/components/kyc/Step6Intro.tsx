import { KYCData } from '../KYCModal';

interface Step6Props {
  isActive: boolean;
  direction: 'forward' | 'back';
  data: KYCData;
  updateData: (updates: Partial<KYCData>) => void;
}

export function Step6Intro({ isActive, direction, data, updateData }: Step6Props) {
  const getClassName = () => {
    if (isActive) return 'kyc-step-active';
    if (direction === 'forward') return 'kyc-step-exit-left';
    return 'kyc-step-exit-right';
  };

  const remaining = 300 - data.intro.length;
  const isWarn = remaining < 50;

  return (
    <div className={`kyc-step ${getClassName()}`}>
      <span className="font-['Inter'] text-[10px] tracking-[0.3em] uppercase text-[#7FFF00]/50 mb-[14px] block">
        Your voice
      </span>
      <h1 className="font-['Libre_Baskerville'] text-[clamp(28px,4vw,40px)] font-light italic leading-[1.15] tracking-[-0.02em] text-white/90 mb-[10px]">
        How would you<br />
        <em className="not-italic text-[#7FFF00]">introduce yourself?</em>
      </h1>
      <p className="text-[15px] font-light leading-[1.75] text-white/45 mb-8">
        This is the first thing your match reads. Write like a person, not a profile.
      </p>

      {/* Textarea */}
      <textarea
        value={data.intro}
        onChange={(e) => updateData({ intro: e.target.value })}
        maxLength={300}
        placeholder="I'm a product designer who thinks about the ethics of what we build…"
        className="w-full bg-white/[0.08] border border-white/[0.07] rounded-[14px] px-[18px] py-[18px] font-['Libre_Baskerville'] text-[17px] font-light leading-[1.75] text-white/90 resize-none outline-none focus:border-[#7FFF00]/30 transition-colors placeholder:text-white/30 placeholder:italic min-h-[140px]"
      />
      
      {/* Character count */}
      <div className="flex justify-end mt-2 mb-6">
        <span className={`font-['Inter'] text-[10px] tracking-[0.12em] transition-colors ${isWarn ? 'text-[#CC9933]' : 'text-white/30'}`}>
          {remaining} remaining
        </span>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between gap-4 px-4 py-[14px] mb-6 bg-white/[0.08] border border-white/[0.07] rounded-xl">
        <div className="flex flex-col gap-[3px]">
          <span className="text-[14px] font-light text-white/90">Make this my profile bio</span>
          <span className="font-['Inter'] text-[10px] tracking-[0.08em] text-white/30">
            Your intro will also appear on your public profile
          </span>
        </div>
        <button
          onClick={() => updateData({ bioAsProfile: !data.bioAsProfile })}
          className={`relative w-11 h-[26px] rounded-[13px] border-none flex-shrink-0 transition-colors ${
            data.bioAsProfile ? 'bg-[#7FFF00]' : 'bg-white/10'
          }`}
        >
          <div
            className={`absolute top-[3px] w-5 h-5 rounded-full transition-all ${
              data.bioAsProfile 
                ? 'left-[calc(100%-23px)] bg-[#050705]' 
                : 'left-[3px] bg-white/50'
            }`}
          />
        </button>
      </div>

      {/* Examples */}
      <span className="font-['Inter'] text-[10px] tracking-[0.22em] uppercase text-white/30 mb-3 block">
        Some examples
      </span>
      <div className="flex flex-col gap-2">
        <div className="px-4 py-[14px] bg-[#101410] border border-white/[0.07] rounded-[10px]">
          <p className="text-[13px] font-light italic leading-[1.7] text-white/30">
            "An early-stage founder who can't stop thinking about the problem I'm building for. Looking for people who are obsessed with something."
          </p>
        </div>
        <div className="px-4 py-[14px] bg-[#101410] border border-white/[0.07] rounded-[10px]">
          <p className="text-[13px] font-light italic leading-[1.7] text-white/30">
            "Researcher by training, creative by habit. I like conversations that go somewhere I didn't expect."
          </p>
        </div>
        <div className="px-4 py-[14px] bg-[#101410] border border-white/[0.07] rounded-[10px]">
          <p className="text-[13px] font-light italic leading-[1.7] text-white/30">
            "I work at the intersection of design and systems thinking. Happiest in rooms where someone disagrees with me."
          </p>
        </div>
      </div>
    </div>
  );
}