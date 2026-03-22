import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Step1HowItWorks } from './kyc/Step1HowItWorks';
import { Step2Location } from './kyc/Step2Location';
import { Step3Objectives } from './kyc/Step3Objectives';
import { Step4MeetKind } from './kyc/Step4MeetKind';
import { Step5Hobbies } from './kyc/Step5Hobbies';
import { Step6Intro } from './kyc/Step6Intro';
import { Step7ProfileImage } from './kyc/Step7ProfileImage';
import { Step8Socials } from './kyc/Step8Socials';
import { Step9FinishRegistration } from './kyc/Step9FinishRegistration';
import { Step10Verify } from './kyc/Step10Verify';
import { KYCDone } from './kyc/KYCDone';
import { KYCPaused } from './kyc/KYCPaused';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export interface KYCData {
  city: string | null;
  timezone: string | null;
  objectives: Set<number>;
  meetWho: Set<number>;
  meetWhere: Set<number>;
  hobbies: Set<string>;
  intro: string;
  bioAsProfile: boolean;
  socials: {
    linkedin: string;
    twitter: string;
    website: string;
    github: string;
  };
  verificationCode: string;
  profileImage: string;
}

export function KYCModal({ isOpen, onClose, onComplete }: KYCModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const TOTAL_STEPS = 10;

  const [data, setData] = useState<KYCData>({
    city: null,
    timezone: null,
    objectives: new Set(),
    meetWho: new Set(),
    meetWhere: new Set(),
    hobbies: new Set(),
    intro: '',
    bioAsProfile: false,
    socials: {
      linkedin: '',
      twitter: '',
      website: '',
      github: '',
    },
    verificationCode: '',
    profileImage: '',
  });

  const updateData = (updates: Partial<KYCData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const canAdvance = () => {
    if (currentStep === 2) return !!data.city;
    if (currentStep === 3) return data.objectives.size > 0;
    if (currentStep === 4) return (data.meetWho.size + data.meetWhere.size) > 0;
    if (currentStep === 6) return data.intro.length >= 60;
    if (currentStep === 10) return false; // Wait for verification
    return true;
  };

  const goNext = () => {
    if (!canAdvance() || currentStep >= TOTAL_STEPS) return;
    setDirection('forward');
    setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (currentStep <= 1) return;
    setDirection('back');
    setCurrentStep((prev) => prev - 1);
  };

  const handleComplete = () => {
    setIsComplete(true);
  };

  const handleFinish = () => {
    // Mark KYC as completed in localStorage
    localStorage.setItem('lethe_kyc_completed', 'true');
    
    // Call optional completion callback
    if (onComplete) {
      onComplete();
    }
    
    // Close the modal
    onClose();
  };

  const handleLater = () => {
    setIsPaused(true);
  };

  const handleCompleteNow = () => {
    setIsPaused(false);
    setCurrentStep(1);
  };

  const handleMaybeLater = () => {
    onClose();
  };

  if (!isOpen) return null;

  const progress = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;

  const getButtonLabel = () => {
    if (currentStep === 1) return "Let's go";
    return 'Continue';
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-[600px] h-[min(680px,90vh)] bg-gradient-to-br from-[#0e130e] to-[#090c09] border border-white/[0.07] rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5 z-10">
          <div 
            className="h-full bg-[#7FFF00] transition-all duration-600 ease-out shadow-[0_0_12px_rgba(127,255,0,0.6)]"
            style={{ width: isComplete ? '100%' : `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-3 relative z-10">
          <button
            onClick={goBack}
            className={`w-8 h-8 rounded-full border border-white/[0.07] bg-transparent text-white/30 flex items-center justify-center transition-all ${
              currentStep > 1 && !isComplete && !isPaused ? 'opacity-100 pointer-events-auto hover:bg-white/5 hover:border-white/10 hover:text-white/50' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <span className="font-['Inter'] text-[10px] tracking-[0.2em] text-white/30">
            {isComplete || isPaused ? '' : `${currentStep} of ${TOTAL_STEPS}`}
          </span>
        </div>

        {/* Steps viewport */}
        <div className="relative flex-1 h-[calc(100%-140px)] overflow-hidden">
          {isPaused ? (
            <KYCPaused onCompleteNow={handleCompleteNow} onMaybeLater={handleMaybeLater} />
          ) : !isComplete ? (
            <>
              <Step1HowItWorks isActive={currentStep === 1} direction={direction} />
              <Step2Location 
                isActive={currentStep === 2} 
                direction={direction}
                data={data}
                updateData={updateData}
              />
              <Step3Objectives 
                isActive={currentStep === 3} 
                direction={direction}
                data={data}
                updateData={updateData}
              />
              <Step4MeetKind 
                isActive={currentStep === 4} 
                direction={direction}
                data={data}
                updateData={updateData}
              />
              <Step5Hobbies 
                isActive={currentStep === 5} 
                direction={direction}
                data={data}
                updateData={updateData}
              />
              <Step6Intro 
                isActive={currentStep === 6} 
                direction={direction}
                data={data}
                updateData={updateData}
              />
              <Step7ProfileImage 
                isActive={currentStep === 7} 
                direction={direction}
                data={data}
                updateData={updateData}
              />
              <Step8Socials 
                isActive={currentStep === 8} 
                direction={direction}
                data={data}
                updateData={updateData}
              />
              <Step9FinishRegistration 
                isActive={currentStep === 9} 
                direction={direction}
                data={data}
                updateData={updateData}
                onContinueToVerify={goNext}
              />
              <Step10Verify 
                isActive={currentStep === 10} 
                direction={direction}
                data={data}
                updateData={updateData}
                onComplete={handleComplete}
              />
            </>
          ) : (
            <KYCDone onFinish={handleFinish} />
          )}
        </div>

        {/* CTA bar */}
        {!isComplete && !isPaused && currentStep !== 9 && currentStep !== 10 && (
          <div className="absolute bottom-0 left-0 right-0 px-8 pt-3 pb-5 bg-gradient-to-t from-[#0c0f0c] via-[rgba(9,12,9,0.95)] to-transparent z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={goNext}
                disabled={!canAdvance()}
                className="flex-1 py-[15px] px-4 rounded-full border-none font-['Inter'] text-[11px] tracking-[0.22em] uppercase text-[#050705] bg-[#7FFF00] hover:bg-[#c8ff4f] transition-all disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-[#7FFF00]"
              >
                {getButtonLabel()}
              </button>
              <button
                onClick={handleLater}
                className="flex-shrink-0 py-[15px] px-6 rounded-full border border-white/[0.12] font-['Inter'] text-[11px] tracking-[0.22em] uppercase text-white bg-[#1a1a1a] hover:bg-[#252525] transition-all"
              >
                Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}