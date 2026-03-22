import { Check } from 'lucide-react';

interface KYCDoneProps {
  onFinish: () => void;
}

export function KYCDone({ onFinish }: KYCDoneProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center animate-[fadeIn_0.6s_ease_forwards]">
      {/* Ripple animation */}
      <div className="relative w-18 h-18 flex items-center justify-center mb-7">
        <div className="absolute inset-0 border border-[#7FFF00]/25 rounded-full animate-[ripple_2.4s_ease-out_infinite]" />
        <div className="absolute inset-0 border border-[#7FFF00]/25 rounded-full animate-[ripple_2.4s_ease-out_infinite] [animation-delay:1.2s]" />
        <div className="w-6 h-6 rounded-full bg-[#7FFF00] flex items-center justify-center shadow-[0_0_24px_rgba(127,255,0,0.5)]">
          <Check size={12} className="text-[#050705]" strokeWidth={2.5} />
        </div>
      </div>

      <div className="font-['Libre_Baskerville'] text-[32px] font-light italic mb-[10px] text-white/90">
        You're live.
      </div>
      
      <div className="text-[15px] font-light text-white/45 leading-[1.75] max-w-[340px] mb-8">
        Your first match arrives next week. In the meantime, the feed is yours.
      </div>
      
      <div className="font-['Inter'] text-[10px] tracking-[0.12em] text-white/30 -mt-5 mb-8">
        You can pause matching anytime from your settings.
      </div>
      
      <button
        onClick={onFinish}
        className="font-['Inter'] text-[11px] tracking-[0.22em] uppercase text-[#050705] bg-[#7FFF00] border-none rounded-full px-10 py-[14px] hover:bg-[#c8ff4f] transition-colors"
      >
        Go to my feed
      </button>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ripple {
          0% {
            width: 24px;
            height: 24px;
            opacity: 0.6;
          }
          100% {
            width: 72px;
            height: 72px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}