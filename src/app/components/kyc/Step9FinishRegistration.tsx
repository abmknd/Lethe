import { Lock } from 'lucide-react';
import { KYCData } from '../KYCModal';
import LetheLogo from '../../../imports/LetheLogo';

interface Step9Props {
  isActive: boolean;
  direction: 'forward' | 'back';
  data: KYCData;
  updateData: (updates: Partial<KYCData>) => void;
  onContinueToVerify: () => void;
}

export function Step9FinishRegistration({ isActive, direction, onContinueToVerify }: Step9Props) {
  const getClassName = () => {
    if (isActive) return 'kyc-step-active';
    if (direction === 'forward') return 'kyc-step-exit-left';
    return 'kyc-step-exit-right';
  };

  const handleGoogleSignUp = () => {
    // Simulate Google OAuth
    console.log('Initiating Google sign-up...');
    // After successful connection, proceed to verification
    setTimeout(() => {
      onContinueToVerify();
    }, 1000);
  };

  return (
    <div className={`kyc-step ${getClassName()}`}>
      <span className="font-['Inter'] text-[10px] tracking-[0.3em] uppercase text-[#7FFF00]/50 mb-[14px] block">
        Almost there
      </span>
      <h1 className="font-['Libre_Baskerville'] text-[clamp(28px,4vw,40px)] font-light italic leading-[1.15] tracking-[-0.02em] text-white/90 mb-10">
        Finish your<br />
        <em className="not-italic text-[#7FFF00]">registration.</em>
      </h1>

      {/* Connection Graphic */}
      <div className="flex items-center justify-center gap-6 mb-10">
        {/* Lethe Logo */}
        <div className="w-[64px] h-[64px] bg-white/[0.08] rounded-full flex items-center justify-center border border-white/[0.12]">
          <div className="w-9 h-9">
            <LetheLogo />
          </div>
        </div>

        {/* Connection line */}
        <div className="flex items-center gap-[6px]">
          <div className="w-2 h-2 rounded-full bg-[#7FFF00]/60" />
          <div className="w-12 h-[2px] bg-gradient-to-r from-[#7FFF00]/60 to-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>

        {/* Google Logo */}
        <div className="w-[64px] h-[64px] bg-white/[0.08] rounded-full flex items-center justify-center border border-white/[0.12]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>
      </div>

      {/* Why connect section */}
      <div className="mb-8">
        <h2 className="font-['Libre_Baskerville'] text-[18px] font-normal text-white/90 mb-4 text-center">
          Why connect my Google account?
        </h2>
        <p className="text-[14px] font-light leading-[1.7] text-white/50 text-center mb-6">
          Your contact and calendar data helps us schedule meetings and ensure that your matches are relevant (not matching you with people you already know, for instance).
        </p>
      </div>

      {/* Privacy note */}
      <div className="flex flex-col items-center gap-3 mb-8 px-4 py-5 bg-white/[0.04] border border-white/[0.07] rounded-xl">
        <div className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center">
          <Lock size={18} strokeWidth={1.5} className="text-white/40" />
        </div>
        <p className="text-[12px] font-light leading-[1.7] text-white/40 text-center">
          We're serious about your privacy and will never share your private data with other users or third parties without your consent.
        </p>
      </div>

      {/* Google Sign Up Button */}
      <button
        onClick={handleGoogleSignUp}
        className="w-full py-[16px] px-6 rounded-full border border-white/[0.12] font-['Inter'] text-[11px] tracking-[0.18em] uppercase bg-white/[0.08] hover:bg-white/[0.12] text-white transition-all flex items-center justify-center gap-3"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Finish sign up with Google
      </button>
    </div>
  );
}
