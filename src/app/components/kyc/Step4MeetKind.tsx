import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { KYCData } from '../KYCModal';

interface Step4Props {
  isActive: boolean;
  direction: 'forward' | 'back';
  data: KYCData;
  updateData: (updates: Partial<KYCData>) => void;
}

const whoOptions = [
  'Are in the same field as me',
  'Are in an adjacent field',
  'Are building something',
  "Have perspectives I don't",
  'Are earlier in their career',
  'Are further along than me',
];

const whereOptions = [
  'Anywhere in the world',
  'Africa',
  'Asia',
  'Europe',
  'Latin America',
  'Middle East',
  'North America',
  'Oceania',
];

export function Step4MeetKind({ isActive, direction, data, updateData }: Step4Props) {
  const [openAccordion, setOpenAccordion] = useState<'who' | 'where'>('who');

  const getClassName = () => {
    if (isActive) return 'kyc-step-active';
    if (direction === 'forward') return 'kyc-step-exit-left';
    return 'kyc-step-exit-right';
  };

  const toggleWho = (index: number) => {
    const newSet = new Set(data.meetWho);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    updateData({ meetWho: newSet });
  };

  const toggleWhere = (index: number) => {
    const newSet = new Set(data.meetWhere);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    updateData({ meetWhere: newSet });
  };

  return (
    <div className={`kyc-step ${getClassName()}`}>
      <span className="font-['Inter'] text-[10px] tracking-[0.3em] uppercase text-[#7FFF00]/50 mb-[14px] block">
        Your match
      </span>
      <h1 className="font-['Libre_Baskerville'] text-[clamp(28px,4vw,40px)] font-light italic leading-[1.15] tracking-[-0.02em] text-white/90 mb-[10px]">
        I want to meet<br />
        people <em className="not-italic text-[#7FFF00]">who…</em>
      </h1>
      <p className="text-[15px] font-light leading-[1.75] text-white/45 mb-8">
        Select everything that resonates. The more honest you are, the better the match.
      </p>

      {/* Who Accordion */}
      <div className={`border border-white/[0.07] rounded-[14px] overflow-hidden mb-[10px] bg-[#101410] ${openAccordion === 'who' ? 'open' : ''}`}>
        <button
          onClick={() => setOpenAccordion(openAccordion === 'who' ? 'where' : 'who')}
          className="flex items-center gap-[10px] px-[18px] py-4 w-full hover:bg-white/[0.03] transition-colors"
        >
          <span className="flex-1 text-left text-[15px] font-light text-white/90">Who they are</span>
          <span className="font-['Inter'] text-[10px] tracking-[0.14em] text-[#7FFF00]/60 min-w-[16px] text-right">
            {data.meetWho.size || ''}
          </span>
          <ChevronDown
            size={16}
            className={`text-white/30 transition-transform ${openAccordion === 'who' ? 'rotate-180' : ''}`}
            strokeWidth={1.5}
          />
        </button>
        {openAccordion === 'who' && (
          <div className="border-t border-white/[0.07] p-[10px] pb-3">
            <div className="flex flex-col gap-[6px]">
              {whoOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => toggleWho(index)}
                  className={`flex items-center justify-between px-[18px] py-[15px] rounded-xl border transition-all ${
                    data.meetWho.has(index)
                      ? 'bg-[#7FFF00]/[0.12] border-[#7FFF00]/30'
                      : 'bg-transparent border-white/[0.05] hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="text-[15px] font-light text-white/90">{option}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      data.meetWho.has(index)
                        ? 'bg-[#7FFF00] border-[#7FFF00]'
                        : 'border-white/10'
                    }`}
                  >
                    {data.meetWho.has(index) && <Check size={10} className="text-[#050705]" strokeWidth={2.5} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Where Accordion */}
      <div className={`border border-white/[0.07] rounded-[14px] overflow-hidden mb-[10px] bg-[#101410] ${openAccordion === 'where' ? 'open' : ''}`}>
        <button
          onClick={() => setOpenAccordion(openAccordion === 'where' ? 'who' : 'where')}
          className="flex items-center gap-[10px] px-[18px] py-4 w-full hover:bg-white/[0.03] transition-colors"
        >
          <span className="flex-1 text-left text-[15px] font-light text-white/90">Where they are based</span>
          <span className="font-['Inter'] text-[10px] tracking-[0.14em] text-[#7FFF00]/60 min-w-[16px] text-right">
            {data.meetWhere.size || ''}
          </span>
          <ChevronDown
            size={16}
            className={`text-white/30 transition-transform ${openAccordion === 'where' ? 'rotate-180' : ''}`}
            strokeWidth={1.5}
          />
        </button>
        {openAccordion === 'where' && (
          <div className="border-t border-white/[0.07] p-[10px] pb-3">
            <div className="flex flex-col gap-[6px]">
              {whereOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => toggleWhere(index)}
                  className={`flex items-center justify-between px-[18px] py-[15px] rounded-xl border transition-all ${
                    data.meetWhere.has(index)
                      ? 'bg-[#7FFF00]/[0.12] border-[#7FFF00]/30'
                      : 'bg-transparent border-white/[0.05] hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="text-[15px] font-light text-white/90">{option}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      data.meetWhere.has(index)
                        ? 'bg-[#7FFF00] border-[#7FFF00]'
                        : 'border-white/10'
                    }`}
                  >
                    {data.meetWhere.has(index) && <Check size={10} className="text-[#050705]" strokeWidth={2.5} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}