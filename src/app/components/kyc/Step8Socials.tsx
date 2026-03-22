import { Globe, Github } from 'lucide-react';
import { KYCData } from '../KYCModal';

interface Step8Props {
  isActive: boolean;
  direction: 'forward' | 'back';
  data: KYCData;
  updateData: (updates: Partial<KYCData>) => void;
}

export function Step8Socials({ isActive, direction, data, updateData }: Step8Props) {
  const getClassName = () => {
    if (isActive) return 'kyc-step-active';
    if (direction === 'forward') return 'kyc-step-exit-left';
    return 'kyc-step-exit-right';
  };

  const updateSocial = (platform: keyof KYCData['socials'], value: string) => {
    updateData({
      socials: {
        ...data.socials,
        [platform]: value,
      },
    });
  };

  return (
    <div className={`kyc-step ${getClassName()}`}>
      <span className="font-['Inter'] text-[10px] tracking-[0.3em] uppercase text-[#7FFF00]/50 mb-[14px] block">
        Your presence
      </span>
      <h1 className="font-['Libre_Baskerville'] text-[clamp(28px,4vw,40px)] font-light italic leading-[1.15] tracking-[-0.02em] text-white/90 mb-[10px]">
        Let others<br />
        <em className="not-italic text-[#7FFF00]">find you.</em>
      </h1>
      <p className="text-[15px] font-light leading-[1.75] text-white/45 mb-8">
        Optional. Shown on your match profile so they can get a sense of your work before you meet.
      </p>

      <div className="flex flex-col gap-[10px]">
        {/* LinkedIn */}
        <div className="flex items-center gap-3 bg-white/[0.08] border border-white/[0.07] rounded-xl px-4 py-[14px] focus-within:border-[#7FFF00]/30 transition-colors">
          <div className="w-7 h-7 rounded-lg flex-shrink-0 bg-white/[0.06] flex items-center justify-center text-[13px]">
            in
          </div>
          <span className="font-['Inter'] text-[10px] tracking-[0.14em] uppercase text-white/30 w-[72px] flex-shrink-0">
            LinkedIn
          </span>
          <input
            type="text"
            value={data.socials.linkedin}
            onChange={(e) => updateSocial('linkedin', e.target.value)}
            placeholder="linkedin.com/in/yourname"
            className="flex-1 bg-transparent border-none outline-none font-['Inter'] text-[12px] tracking-[0.04em] text-white/90 placeholder:text-white/[0.12]"
          />
        </div>

        {/* Twitter */}
        <div className="flex items-center gap-3 bg-white/[0.08] border border-white/[0.07] rounded-xl px-4 py-[14px] focus-within:border-[#7FFF00]/30 transition-colors">
          <div className="w-7 h-7 rounded-lg flex-shrink-0 bg-white/[0.06] flex items-center justify-center text-[13px]">
            𝕏
          </div>
          <span className="font-['Inter'] text-[10px] tracking-[0.14em] uppercase text-white/30 w-[72px] flex-shrink-0">
            Twitter
          </span>
          <input
            type="text"
            value={data.socials.twitter}
            onChange={(e) => updateSocial('twitter', e.target.value)}
            placeholder="@yourhandle"
            className="flex-1 bg-transparent border-none outline-none font-['Inter'] text-[12px] tracking-[0.04em] text-white/90 placeholder:text-white/[0.12]"
          />
        </div>

        {/* Website */}
        <div className="flex items-center gap-3 bg-white/[0.08] border border-white/[0.07] rounded-xl px-4 py-[14px] focus-within:border-[#7FFF00]/30 transition-colors">
          <div className="w-7 h-7 rounded-lg flex-shrink-0 bg-white/[0.06] flex items-center justify-center">
            <Globe size={14} strokeWidth={1.5} className="text-white/90" />
          </div>
          <span className="font-['Inter'] text-[10px] tracking-[0.14em] uppercase text-white/30 w-[72px] flex-shrink-0">
            Website
          </span>
          <input
            type="text"
            value={data.socials.website}
            onChange={(e) => updateSocial('website', e.target.value)}
            placeholder="yourname.com"
            className="flex-1 bg-transparent border-none outline-none font-['Inter'] text-[12px] tracking-[0.04em] text-white/90 placeholder:text-white/[0.12]"
          />
        </div>

        {/* GitHub */}
        <div className="flex items-center gap-3 bg-white/[0.08] border border-white/[0.07] rounded-xl px-4 py-[14px] focus-within:border-[#7FFF00]/30 transition-colors">
          <div className="w-7 h-7 rounded-lg flex-shrink-0 bg-white/[0.06] flex items-center justify-center">
            <Github size={14} strokeWidth={1.5} className="text-white/90" />
          </div>
          <span className="font-['Inter'] text-[10px] tracking-[0.14em] uppercase text-white/30 w-[72px] flex-shrink-0">
            GitHub
          </span>
          <input
            type="text"
            value={data.socials.github}
            onChange={(e) => updateSocial('github', e.target.value)}
            placeholder="github.com/yourname"
            className="flex-1 bg-transparent border-none outline-none font-['Inter'] text-[12px] tracking-[0.04em] text-white/90 placeholder:text-white/[0.12]"
          />
        </div>
      </div>

      <p className="font-['Inter'] text-[10px] tracking-[0.12em] text-white/30 text-center leading-[1.7] mt-4">
        All fields are optional. You can add or update these from your profile at any time.
      </p>
    </div>
  );
}
