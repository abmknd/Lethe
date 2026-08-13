import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { SegmentedBar, Button } from '../../rebrand/primitives';
import { Step1HowItWorks } from './kyc/Step1HowItWorks';
import { Step2Location } from './kyc/Step2Location';
import { Step3Objectives } from './kyc/Step3Objectives';
import { Step4MeetKind } from './kyc/Step4MeetKind';
import { Step5Hobbies } from './kyc/Step5Hobbies';
import { Step6Intro } from './kyc/Step6Intro';
import { Step7ProfileImage } from './kyc/Step7ProfileImage';
import { Step8Socials } from './kyc/Step8Socials';
import { Step9Role } from './kyc/Step9Role';
import { Step10Availability, AVAILABILITY_WINDOWS } from './kyc/Step10Availability';
import { KYCDone } from './kyc/KYCDone';
import { ROLE_OPTIONS } from '../constants/roles';
import { KYCPaused } from './kyc/KYCPaused';
import { getUserProfile, saveUserProfile } from "../api";
import { toast } from 'sonner';

const OBJECTIVE_LABELS = [
  'Build in public', 'Find a cofounder', 'Grow my network', 'Meet interesting people',
  'Get mentored', 'Mentor others', 'Explore new fields', 'Share knowledge',
];

const WHERE_LABELS = [
  'Anywhere in the world', 'Africa', 'Asia', 'Europe',
  'Latin America', 'Middle East', 'North America', 'Oceania',
];

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  userId?: string;
  accessToken?: string;
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
  profileImage: string;
  userType: number | null;
  preferredUserTypes: Set<number>;
  availabilityDays: Set<number>;
  availabilityWindows: Set<string>;
}

export function KYCModal({ isOpen, onClose, onComplete, userId, accessToken }: KYCModalProps) {
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
    profileImage: '',
    userType: null,
    preferredUserTypes: new Set(),
    availabilityDays: new Set(),
    availabilityWindows: new Set(),
  });

  const updateData = (updates: Partial<KYCData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const canAdvance = () => {
    if (currentStep === 2) return !!data.city;
    if (currentStep === 3) return data.objectives.size > 0;
    if (currentStep === 4) return (data.meetWho.size + data.meetWhere.size) > 0;
    if (currentStep === 6) return data.intro.length >= 60;
    if (currentStep === 9) return data.userType !== null && data.preferredUserTypes.size > 0;
    // A user must give at least one day and one time window so they finish
    // onboarding matchable (closes the unmatchable-on-finish gap, L1-S8).
    if (currentStep === 10) return data.availabilityDays.size > 0 && data.availabilityWindows.size > 0;
    return true;
  };

  const goNext = () => {
    if (!canAdvance()) return;
    if (currentStep >= TOTAL_STEPS) {
      setIsComplete(true);
      return;
    }
    setDirection('forward');
    setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (currentStep <= 1) return;
    setDirection('back');
    setCurrentStep((prev) => prev - 1);
  };

  const handleFinish = async () => {
    if (!userId) {
      toast.error('You must be signed in to complete onboarding.');
      return;
    }
    try {
      // Pre-fetch the existing profile so we merge KYC data on top instead of
      // wiping fields we don't touch — especially availability, which the
      // backend re-writes from whatever array we send (so [] = delete all).
      let existing: Awaited<ReturnType<typeof getUserProfile>> | null = null;
      try {
        existing = await getUserProfile(userId, accessToken);
      } catch {
        // First-time KYC may have no profile yet — fall through with null.
      }

      const timezone = data.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Availability slots always carry a valid IANA timezone (city labels like
      // "PST (UTC-8)" are not parseable), so the matcher's overlap math works.
      const ianaTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const windowByKey = new Map(AVAILABILITY_WINDOWS.map((w) => [w.key, w]));
      const availabilitySlots = [...data.availabilityDays].flatMap((dayOfWeek) =>
        [...data.availabilityWindows]
          .map((key) => windowByKey.get(key))
          .filter((w): w is (typeof AVAILABILITY_WINDOWS)[number] => Boolean(w))
          .map((w) => ({
            dayOfWeek,
            startHour: w.startHour,
            endHour: w.endHour,
            timezone: ianaTimezone,
          })),
      );

      await saveUserProfile(
        userId,
        {
          user: {
            ...(existing?.user ?? {}),
            id: userId,
            location: data.city ?? '',
            timezone,
            matchingEnabled: true,
            // Public bio mirrors the KYC intro so ProfilePage doesn't render '—'.
            bio: data.intro,
            // #78.2 — Step7 uploaded to the avatars bucket and stored the
            // public URL on data.profileImage. Persist it on users.avatar_url
            // so Settings + match cards pick it up. Empty string → leave
            // existing avatar untouched (COALESCE in the SQL upsert).
            ...(data.profileImage ? { avatarUrl: data.profileImage } : {}),
          },
          preferences: {
            ...(existing?.preferences ?? {}),
            introText: data.intro,
            interests: [...data.hobbies],
            objectives: [...data.objectives].map((i) => OBJECTIVE_LABELS[i]).filter(Boolean),
            matchIntent: [...data.objectives].map((i) => OBJECTIVE_LABELS[i]).filter(Boolean),
            userType: data.userType !== null ? ROLE_OPTIONS[data.userType] : '',
            preferredUserTypes: [...data.preferredUserTypes]
              .map((i) => ROLE_OPTIONS[i])
              .filter(Boolean),
            preferredLocations: [...data.meetWhere]
              .map((i) => WHERE_LABELS[i])
              .filter((l) => l && l !== 'Anywhere in the world'),
            // LinkedIn URL captured in Step8 doubles as the HITL spot-check
            // artifact for same-org verification (Phase 2, item 1).
            ...(data.socials.linkedin ? { linkedinUrl: data.socials.linkedin } : {}),
          },
          // Availability is now captured in KYC (Step 10). Fall back to any
          // existing slots only if the user somehow submitted none.
          availability: availabilitySlots.length > 0 ? availabilitySlots : (existing?.availability ?? []),
        } as never,
        accessToken,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save your profile. Please try again.');
      return;
    }

    if (onComplete) onComplete();
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


  const getButtonLabel = () => {
    if (currentStep === 1) return "Let's go";
    if (currentStep === TOTAL_STEPS) return 'Finish';
    return 'Continue';
  };

  return (
    <div className="rebrand-root fixed inset-0 z-[200] flex items-center justify-center bg-[var(--color-black-700)]/80 p-5 backdrop-blur-sm">
      {/*
        Onboarding card, per the in-app spec. Blue elevation model: the card is
        the base surface and its border is one ramp step lighter, which is what
        separates it from the scrim without a shadow.
      */}
      <div className="relative flex h-[min(680px,90vh)] w-full max-w-[600px] flex-col overflow-hidden rounded-[16px] border-[1.25px] border-[var(--color-blue-500)] bg-[var(--color-blue-600)]">

        {/* Progress: ten segments, one per step, not a continuous fill. The
            user can see how much is left, which a percentage bar hides. */}
        <div className="px-[16px] pt-[16px]">
          <SegmentedBar count={TOTAL_STEPS} active={(isComplete ? TOTAL_STEPS : currentStep) - 1} />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-[16px] pb-[12px] pt-[16px]">
          <button
            onClick={goBack}
            aria-label="Back"
            className={`flex size-[32px] items-center justify-center rounded-full border-[1.25px] border-[var(--color-white)] text-[var(--color-white)] transition-colors hover:text-[var(--color-blue-200)] ${
              currentStep > 1 && !isComplete && !isPaused ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <ChevronLeft size={16} strokeWidth={1.25} />
          </button>
          <span className="text-[13px] font-medium leading-[1.2] tracking-[1.5px] text-[var(--color-white)]">
            {isComplete || isPaused ? '' : `${currentStep} of ${TOTAL_STEPS}`}
          </span>
        </div>

        {/* Steps viewport */}
        <div className="relative min-h-0 flex-1 overflow-y-auto">
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
                userId={userId}
              />
              <Step8Socials
                isActive={currentStep === 8}
                direction={direction}
                data={data}
                updateData={updateData}
              />
              <Step9Role
                isActive={currentStep === 9}
                direction={direction}
                data={data}
                updateData={updateData}
              />
              <Step10Availability
                isActive={currentStep === 10}
                direction={direction}
                data={data}
                updateData={updateData}
              />
            </>
          ) : (
            <KYCDone onFinish={handleFinish} />
          )}
        </div>

        {/* CTA bar. Solid surface rather than a gradient scrim: the card is
            already a defined colour, so fading to a second one just to lift the
            buttons would introduce a value that is not in the ramp. */}
        {!isComplete && !isPaused && (
          <div className="relative z-10 border-t border-[var(--color-blue-500)] bg-[var(--color-blue-600)] px-[16px] py-[16px]">
            <div className="flex items-center gap-[12px]">
              <Button surface="blue" size="lg" className="flex-1" onClick={goNext} disabled={!canAdvance()}>
                {getButtonLabel().toUpperCase()}
              </Button>
              <Button surface="blue" variant="secondary" size="lg" onClick={handleLater}>
                LATER
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}