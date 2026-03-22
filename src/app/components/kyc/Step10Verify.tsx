import { useEffect, useRef, useState } from 'react';
import { KYCData } from '../KYCModal';

interface Step10Props {
  isActive: boolean;
  direction: 'forward' | 'back';
  data: KYCData;
  updateData: (updates: Partial<KYCData>) => void;
  onComplete: () => void;
}

export function Step10Verify({ isActive, direction, data, updateData, onComplete }: Step10Props) {
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const getClassName = () => {
    if (isActive) return 'kyc-step-active';
    if (direction === 'forward') return 'kyc-step-exit-left';
    return 'kyc-step-exit-right';
  };

  useEffect(() => {
    if (isActive && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 500);
    }
  }, [isActive]);

  useEffect(() => {
    if (code.length === 6) {
      // Simulate verification
      setTimeout(() => {
        updateData({ verificationCode: code });
        onComplete();
      }, 700);
    }
  }, [code, updateData, onComplete]);

  const handleInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setCode(cleaned);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && code.length > 0) {
      setCode(code.slice(0, -1));
    }
  };

  const boxes = [0, 1, 2, 3, 4, 5];

  return (
    <div className={`kyc-step ${getClassName()}`}>
      <span className="font-['Inter'] text-[10px] tracking-[0.3em] uppercase text-[#7FFF00]/50 mb-[14px] block">
        One last thing
      </span>
      <h1 className="font-['Libre_Baskerville'] text-[clamp(28px,4vw,40px)] font-light italic leading-[1.15] tracking-[-0.02em] text-white/90 mb-[10px]">
        Confirm your<br />
        <em className="not-italic text-[#7FFF00]">email.</em>
      </h1>
      <p className="text-[15px] font-light leading-[1.75] text-white/45 mb-8">
        We sent a six-digit code to
      </p>
      
      <div className="font-['Inter'] text-[12px] tracking-[0.1em] text-[#7FFF00]/60 text-center mb-9">
        your.email@example.com
      </div>

      {/* Code boxes */}
      <div className="flex gap-[10px] justify-center mb-6">
        {boxes.map((i) => {
          const isFilled = i < code.length;
          const isActive = i === code.length;
          const isSuccess = code.length === 6;

          return (
            <div
              key={i}
              onClick={() => inputRef.current?.focus()}
              className={`w-[52px] h-16 rounded-xl flex items-center justify-center font-['Libre_Baskerville'] text-[28px] font-light transition-all cursor-text relative ${
                isSuccess
                  ? 'bg-[#7FFF00]/[0.12] border-[#7FFF00]/50 text-white/90'
                  : isActive
                  ? 'bg-[#7FFF00]/[0.04] border-[#7FFF00]/50 text-white/90'
                  : isFilled
                  ? 'bg-white/[0.08] border-white/[0.07] text-white/90'
                  : 'bg-white/[0.08] border-white/[0.07] text-transparent'
              } border overflow-hidden`}
            >
              {isFilled ? code[i] : ''}
              
              {/* Blinking caret */}
              {isActive && !isFilled && (
                <div className="absolute w-[1.5px] h-7 bg-[#7FFF00] animate-[blink_0.8s_step-end_infinite]" />
              )}
            </div>
          );
        })}
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={code}
        onChange={(e) => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={6}
        className="absolute opacity-0 pointer-events-none w-px h-px"
      />

      {/* Resend */}
      <div className="text-center mt-2 font-['Inter'] text-[11px] tracking-[0.14em] text-white/30">
        Didn't receive it?{' '}
        <button
          onClick={() => console.log('Resend code')}
          className="underline hover:text-white/50 transition-colors"
        >
          Resend
        </button>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
