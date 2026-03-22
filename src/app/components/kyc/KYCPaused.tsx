import { Pause } from 'lucide-react';

interface KYCPausedProps {
  onCompleteNow: () => void;
  onMaybeLater: () => void;
}

export function KYCPaused({ onCompleteNow, onMaybeLater }: KYCPausedProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center animate-[fadeIn_0.6s_ease_forwards]">
      {/* Ripple animation with pause icon */}
      <div className="relative w-18 h-18 flex items-center justify-center mb-7">
        <div className="absolute inset-0 border border-white/10 rounded-full animate-[ripple_2.4s_ease-out_infinite]" />
        <div className="absolute inset-0 border border-white/10 rounded-full animate-[ripple_2.4s_ease-out_infinite] [animation-delay:1.2s]" />
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/[0.07]">
          <Pause size={12} className="text-white/60" strokeWidth={2.5} />
        </div>
      </div>

      <div className="font-['Libre_Baskerville'] text-[32px] font-light mb-[10px] text-white/90">
        Matching is on pause for you.
      </div>
      
      <div className="text-[15px] font-light text-white/45 leading-[1.75] max-w-[340px] mb-8">
        Finish setting up your profile whenever you're ready. You'll find it in Connect.
      </div>
      
      <div className="flex items-center gap-3 w-full max-w-[340px]">
        <button
          onClick={onCompleteNow}
          className="flex-1 font-['Inter'] text-[11px] tracking-[0.22em] uppercase text-[#050705] bg-[#7FFF00] border-none rounded-full py-[14px] hover:bg-[#c8ff4f] transition-colors"
        >
          Complete now
        </button>
        <button
          onClick={onMaybeLater}
          className="flex-shrink-0 font-['Inter'] text-[11px] tracking-[0.22em] uppercase text-white bg-[#1a1a1a] border border-white/[0.12] rounded-full px-6 py-[14px] hover:bg-[#252525] transition-colors"
        >
          Maybe later
        </button>
      </div>

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
