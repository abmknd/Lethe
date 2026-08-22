import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button, SegmentedBar } from '../../../rebrand/primitives';
import { emptyKYCData, type KYCData } from './kycData';
import { KYC_ART } from './kycArt';
import { Step1HowItWorks } from './Step1HowItWorks';
import { Step2Location } from './Step2Location';
import { Step3Objectives } from './Step3Objectives';
import { Step4MeetKind } from './Step4MeetKind';
import { Step5Hobbies } from './Step5Hobbies';
import { Step6Intro } from './Step6Intro';
import { Step7ProfileImage } from './Step7ProfileImage';
import { Step8Socials } from './Step8Socials';
import { Step9Role } from './Step9Role';
import { Step10Availability } from './Step10Availability';
import { KYCDone } from './KYCDone';
import { KYCPaused } from './KYCPaused';
import { AVAILABILITY_WINDOWS, INTRO_MIN, OBJECTIVES, WHERE_ANYWHERE, WHERE_OPTIONS } from '../../constants/kyc';
import { bridgeRoleTaxonomy, MEETABLE_ROLE_OPTIONS, ROLE_OPTIONS, ROLE_OTHER_INDEX } from '../../constants/roles';
import { getUserProfile, saveUserProfile } from '../../api';

export const TOTAL_STEPS = 10;
export const STEP_DONE = 11;
export const STEP_PAUSED = 12;

/** Steps where the answer is genuinely optional and the flow says so out loud. */
const SKIPPABLE = new Set([7, 8]);

interface KYCFlowProps {
  onComplete?: () => void;
  onClose?: () => void;
  userId?: string;
  accessToken?: string;
  /** Drive the step from outside (the gallery does). Uncontrolled otherwise. */
  step?: number;
  onStep?: (step: number) => void;
}

/**
 * The onboarding card itself, without the scrim — KYCModal wraps this, and the
 * gallery mounts it inline so all twelve screens can be reviewed without auth.
 *
 * The card is a FIXED box with a scrolling body. Header and footer never move
 * between steps, so progress and CONTINUE stay exactly where the user last put
 * their cursor. One scroll region per card: no list inside it scrolls on its
 * own. (redesign.md, Chrome: scroll and type.)
 */
export function KYCFlow({ onComplete, onClose, userId, accessToken, step, onStep }: KYCFlowProps) {
  const [internalStep, setInternalStep] = useState(1);
  const current = step ?? internalStep;
  const go = (n: number) => {
    setInternalStep(n);
    onStep?.(n);
  };

  const [data, setData] = useState<KYCData>(emptyKYCData);
  const updateData = (updates: Partial<KYCData>) => setData((prev) => ({ ...prev, ...updates }));

  const inFlow = current <= TOTAL_STEPS;

  const canAdvance = () => {
    if (current === 2) return !!data.city;
    if (current === 3) return data.objectives.size > 0;
    if (current === 4) return data.meetWho.size + data.meetWhere.size > 0;
    if (current === 6) return data.intro.length >= INTRO_MIN;
    if (current === 9) {
      if (data.userType === null) return false;
      // "Something else" persists AS TYPED, so an empty field would save an
      // empty role and silently drop the user out of role-fit matching.
      if (data.userType === ROLE_OTHER_INDEX && !data.roleOther.trim()) return false;
      return data.openToAnyone || data.preferredUserTypes.size > 0;
    }
    // A user must give at least one day and one time window so they finish
    // onboarding matchable (closes the unmatchable-on-finish gap, L1-S8).
    if (current === 10) return data.availabilityDays.size > 0 && data.availabilityWindows.size > 0;
    return true;
  };

  const goNext = () => {
    if (!canAdvance()) return;
    go(current >= TOTAL_STEPS ? STEP_DONE : current + 1);
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
      const windowByKey = new Map(AVAILABILITY_WINDOWS.map((w) => [w.key, w] as const));
      const availabilitySlots = [...data.availabilityDays].flatMap((dayOfWeek) =>
        [...data.availabilityWindows]
          .map((key) => windowByKey.get(key as (typeof AVAILABILITY_WINDOWS)[number]['key']))
          .filter((w): w is (typeof AVAILABILITY_WINDOWS)[number] => Boolean(w))
          .map((w) => ({ dayOfWeek, startHour: w.startHour, endHour: w.endHour, timezone: ianaTimezone })),
      );

      const objectiveLabels = [...data.objectives].map((i) => OBJECTIVES[i]).filter(Boolean);
      // "Something else" is never stored as itself: what the user typed is the
      // role. Anything else stores its family name.
      const userType =
        data.userType === null
          ? ''
          : data.userType === ROLE_OTHER_INDEX
            ? data.roleOther.trim()
            : ROLE_OPTIONS[data.userType];
      // "Open to anyone" persists as EVERY family, not an empty list. The
      // matcher scores role fit as `preferredUserTypes.has(candidate.userType)`
      // — an empty set answers "no" to everyone, so the most open answer in the
      // flow would have scored the same as the most closed one. Storing the
      // full list says the true thing in the vocabulary the matcher speaks, and
      // also keeps the admin "at least one preferred role" check satisfied.
      //
      // Bridged either way, so role fit still fires against profiles saved
      // under the pre-rebrand taxonomy. See constants/roles.ts.
      const preferredUserTypes = bridgeRoleTaxonomy(
        data.openToAnyone
          ? [...MEETABLE_ROLE_OPTIONS]
          : [...data.preferredUserTypes].map((i) => MEETABLE_ROLE_OPTIONS[i]).filter(Boolean),
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
            objectives: objectiveLabels,
            matchIntent: objectiveLabels,
            userType,
            preferredUserTypes,
            preferredLocations: [...data.meetWhere]
              .map((i) => WHERE_OPTIONS[i])
              .filter((l) => l && l !== WHERE_ANYWHERE),
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

    onComplete?.();
    onClose?.();
  };

  const paused = current === STEP_PAUSED;
  const art = KYC_ART[current];

  return (
    // Desktop is a SPLIT: one 1120px shell, radius 16, holding the card and the
    // plate as flush halves. One rounded rectangle, not two sitting next to each
    // other — the outer corners are round and the meeting edge is straight.
    //
    // The breakpoint is a CONTAINER query, not a viewport one: the same flow
    // renders inside a full-screen modal, a preview route and a fixed-width
    // gallery frame, and only the space actually available to it should decide
    // whether the plate appears. Without the plate the shell narrows to a single
    // card rather than stretching a form across 1120px.
    <div className="@container flex h-full w-full justify-center">
      <div
        className={
          // Stacked below 1120, split at and above it. Same shell either way:
          // one rounded rectangle, outer corners round, meeting edge straight.
          'flex h-full w-full max-w-[600px] flex-col overflow-hidden rounded-[16px] border @[1120px]:flex-row ' +
          (art ? '@[1120px]:max-w-[1120px] ' : '') +
          (paused
            ? 'border-[var(--color-blue-500)] bg-[var(--color-blue-600)]'
            : 'border-[var(--color-black-100)] bg-[var(--color-white)]')
        }
      >
        {/* The plate, stacked: a banner above the card rather than a column
            beside it. Dropping the art entirely on mobile would strip the
            brand from the breakpoint most people actually use. Sized as a
            share of the shell so a short viewport gives the form its room
            back, and ordered after the card in the DOM at desktop only. */}
        {art ? (
          <aside className="h-[22%] max-h-[200px] min-h-[112px] w-full shrink-0 @[1120px]:hidden">
            <img
              src={art.srcSm}
              alt={art.alt}
              className="h-full w-full object-cover"
              // The banner crops hard from a portrait plate; anchoring top
              // keeps faces in frame rather than centring on torsos.
              style={{ objectPosition: 'center 30%' }}
            />
          </aside>
        ) : null}

        <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-[16px] p-[16px] @[1120px]:w-1/2 @[1120px]:flex-none">
      {inFlow && (
        <div className="flex flex-col gap-[8px]">
          {/* Ten segments, one per step, not a continuous fill: the user can see
              how much is left, which a percentage bar hides. Complete segments
              are Blue 600 on light — yellow never lands on a light surface. */}
          <SegmentedBar count={TOTAL_STEPS} active={current - 1} surface="light" />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => go(Math.max(1, current - 1))}
              aria-label="Back"
              className={
                'grid size-[32px] place-items-center rounded-full border border-[var(--color-blue-600)] ' +
                'text-[var(--color-blue-600)] transition-colors hover:text-[var(--color-blue-700)] ' +
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)] ' +
                (current > 1 ? '' : 'invisible')
              }
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <span className="whitespace-nowrap text-[13px] font-medium leading-[120%] tracking-[1.5px] text-[var(--color-black-500)]">
              {current} of {TOTAL_STEPS}
            </span>
          </div>
        </div>
      )}

      <div
        className={
          'rebrand-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden pr-[10px] ' +
          (paused ? 'rebrand-scroll-blue' : '')
        }
      >
        {/* Keyed on the step so each screen animates in; the card around it
            does not move. The bottom breathing room is the WRAPPER's padding,
            not the scroller's: on the scroller it adds to scrollHeight and
            every step that fits still shows a thumb. */}
        <div key={current} className="rebrand-step-in flex flex-1 flex-col pb-[4px]">
          {current === 1 && <Step1HowItWorks />}
          {current === 2 && <Step2Location data={data} updateData={updateData} />}
          {current === 3 && <Step3Objectives data={data} updateData={updateData} />}
          {current === 4 && <Step4MeetKind data={data} updateData={updateData} />}
          {current === 5 && <Step5Hobbies data={data} updateData={updateData} />}
          {current === 6 && <Step6Intro data={data} updateData={updateData} />}
          {current === 7 && <Step7ProfileImage data={data} updateData={updateData} userId={userId} />}
          {current === 8 && <Step8Socials data={data} updateData={updateData} />}
          {current === 9 && <Step9Role data={data} updateData={updateData} />}
          {current === 10 && <Step10Availability data={data} updateData={updateData} />}
          {current === STEP_DONE && <KYCDone onFinish={handleFinish} />}
          {current === STEP_PAUSED && (
            <KYCPaused onCompleteNow={() => go(1)} onMaybeLater={() => onClose?.()} />
          )}
        </div>
      </div>

        {inFlow && (
          <div className="flex flex-col gap-[8px]">
            <Button size="lg" fullWidth onClick={goNext} disabled={!canAdvance()}>
              {current === TOTAL_STEPS ? 'FINISH' : 'CONTINUE'}
            </Button>
            {/* The deferral slot. It is always present so the footer height
                never changes between steps; only its meaning does — skip THIS
                answer where the answer is optional, otherwise leave the flow. */}
            {SKIPPABLE.has(current) ? (
              <Button variant="tertiary" size="md" fullWidth onClick={() => go(current + 1)}>
                SKIP FOR NOW
              </Button>
            ) : (
              <Button variant="tertiary" size="md" fullWidth onClick={() => go(STEP_PAUSED)}>
                FINISH LATER
              </Button>
            )}
            </div>
          )}
        </div>

        {/* The plate, split: the other half of the shell. Decorative either
            way — the card carries every word that matters. */}
        {art ? (
          <aside className="hidden h-full w-1/2 min-w-0 @[1120px]:block">
            <img src={art.src} alt="" aria-hidden className="h-full w-full object-cover" />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
