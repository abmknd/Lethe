import {
  Card,
  TitlePill,
  DescriptivePill,
  SignalPill,
  SignalGroup,
  AvatarStack,
  ConfidenceBand,
  DecisionBar,
  AvailabilitySlot,
  Avatar,
} from '../primitives';

/**
 * THE MATCH CARD — the product's whole moment, and one component.
 *
 * ── The design decision ─────────────────────────────────────────────────────
 *
 * The in-app reference card showed a name, socials, and named mutuals sitting
 * above PASS / MATCH. Those cannot coexist. PASS/MATCH is the decision taken
 * while the match is still BLIND, and the blind gate exists precisely so that
 * no identity crosses it before both sides commit. The API enforces this: while
 * blind, `candidate` is null and only `blindRationale` ships.
 *
 * So this is one card with two STATES rather than two cards, because the
 * information architecture is identical and only the RESOLUTION changes:
 *
 *     blind      what kind of person, what you share, how sure we are
 *     revealed   who they actually are
 *
 * The user recognises the card they accepted. The reveal is the same object
 * coming into focus, not a different screen.
 *
 * ── The surface convention this establishes ─────────────────────────────────
 *
 * SURFACE ENCODES WHAT IS KNOWN.
 *
 *     Blue 600 surface  = not yet known. The blind offer.
 *     Light surface     = known. Everything after the reveal.
 *
 * This is not decoration. The app is light mode after onboarding, so a blue
 * card is visually rare and reads as a held breath. When the match reveals, it
 * resolves into the light with the rest of the product, which is the same idea
 * the brand's dither-resolve motion expresses. Registered in redesign.md so
 * later screens inherit it rather than reinvent it.
 */

export type BlindMatch = {
  roleCategory: string;
  overlapThemes: { kind: string; label: string }[];
  availabilityCompatibility: string;
  confidenceBand: 'low' | 'medium' | 'high';
};

export type RevealedMatch = {
  displayName: string;
  handle: string;
  avatarSrc?: string;
  summary: string;
  commonGround: string[];
  interests: string[];
  mutuals: { src?: string; name: string }[];
  mutualsSentence: string;
  availability: { day: string; times: string[] }[];
  socials: string[];
};

/** The blind offer. No identity, by construction. */
export function BlindMatchCard({
  match,
  onPass,
  onAccept,
  pending,
}: {
  match: BlindMatch;
  onPass: () => void;
  onAccept: () => void;
  pending?: boolean;
}) {
  return (
    <Card variant="blue" className="flex w-full max-w-[560px] flex-col gap-[24px] p-[16px]">
      <div className="flex items-center justify-between">
        <TitlePill surface="blue">THIS WEEK&apos;S MATCH</TitlePill>
        <DescriptivePill surface="blue">BLIND</DescriptivePill>
      </div>

      {/* The headline IS the abstraction: a category, never a person. */}
      <div className="flex flex-col gap-[12px]">
        <h2 className="rebrand-display text-[clamp(28px,4vw,40px)] font-normal leading-[100%] text-[var(--color-white)]">
          {match.roleCategory}
        </h2>
        <p className="text-[16px] leading-[120%] text-[var(--color-white)]">
          Identity resolves only if you both accept. If either of you passes, nothing is revealed and
          they are never told who declined.
        </p>
      </div>

      <SignalGroup label="HOW SURE WE ARE" surface="blue">
        <ConfidenceBand band={match.confidenceBand} surface="blue" />
      </SignalGroup>

      <SignalGroup label="WHAT YOU SHARE" surface="blue">
        {match.overlapThemes.length ? (
          <div className="flex flex-wrap gap-[8px]">
            {match.overlapThemes.map((t) => (
              <DescriptivePill key={t.label} surface="blue">
                {t.label}
              </DescriptivePill>
            ))}
          </div>
        ) : (
          <p className="text-[14px] leading-[16px] text-[var(--color-blue-200)]">
            No shared themes surfaced. This one was matched on complement rather than overlap.
          </p>
        )}
      </SignalGroup>

      <SignalGroup label="SCHEDULING" surface="blue">
        <p className="text-[14px] leading-[16px] text-[var(--color-white)]">
          {match.availabilityCompatibility}
        </p>
      </SignalGroup>

      <DecisionBar
        surface="blue"
        actionLabel={pending ? 'SENDING…' : 'ACCEPT'}
        onPass={onPass}
        onAction={onAccept}
        disabled={pending}
      />
    </Card>
  );
}

/** Waiting on the other side. A one-sided accept must never look like a match. */
export function AwaitingMatchCard({ match }: { match: BlindMatch }) {
  return (
    <Card variant="blue" className="flex w-full max-w-[560px] flex-col gap-[16px] p-[16px]">
      <div className="flex items-center justify-between">
        <TitlePill surface="blue">THIS WEEK&apos;S MATCH</TitlePill>
        <DescriptivePill surface="blue">ACCEPTED</DescriptivePill>
      </div>
      <h2 className="rebrand-display text-[clamp(24px,3.5vw,32px)] font-normal leading-[100%] text-[var(--color-white)]">
        {match.roleCategory}
      </h2>
      <p className="text-[16px] leading-[120%] text-[var(--color-white)]">
        You&apos;re in. Waiting on the other side. We&apos;ll tell you the moment it resolves, and
        nothing more if it doesn&apos;t.
      </p>
    </Card>
  );
}

/** Revealed. Same card, in the light, with a person in it. */
export function RevealedMatchCard({
  match,
  onSchedule,
}: {
  match: RevealedMatch;
  onSchedule: () => void;
}) {
  return (
    <Card variant="white" className="flex w-full max-w-[560px] flex-col">
      {/* Header is the one tinted band, so the identity reads as the headline */}
      <div className="flex items-center gap-[12px] bg-[var(--color-blue-100)] px-[16px] py-[24px]">
        <Avatar src={match.avatarSrc} alt={match.displayName} size={64} onLight />
        <div className="min-w-0 flex-1">
          <p className="text-[20px] font-medium leading-[100%] text-[var(--color-black-700)]">
            {match.displayName}
          </p>
          <p className="mt-[4px] text-[14px] leading-[16px] text-[var(--color-black-500)]">
            @{match.handle}
          </p>
        </div>
        <DescriptivePill>REVEALED</DescriptivePill>
      </div>

      <div className="flex flex-col gap-[24px] p-[16px]">
        <p className="text-[16px] leading-[120%] text-[var(--color-black-700)]">{match.summary}</p>

        <SignalGroup label={`WHAT YOU AND ${match.displayName.split(' ')[0].toUpperCase()} HAVE IN COMMON`}>
          <ul className="flex flex-col gap-[8px]">
            {match.commonGround.map((line) => (
              <li key={line} className="flex gap-[8px] text-[14px] leading-[16px] text-[var(--color-black-700)]">
                <span aria-hidden className="text-[var(--color-blue-600)]">
                  •
                </span>
                {line}
              </li>
            ))}
          </ul>
        </SignalGroup>

        <SignalGroup label="COMMON INTERESTS">
          <div className="flex flex-wrap gap-[8px]">
            {match.interests.map((i) => (
              <SignalPill key={i}>{i}</SignalPill>
            ))}
          </div>
        </SignalGroup>

        {match.mutuals.length > 0 && (
          <SignalGroup label="MUTUALS">
            <span className="flex items-center gap-[12px]">
              <AvatarStack people={match.mutuals} />
              <span className="text-[14px] leading-[16px] text-[var(--color-black-700)]">
                {match.mutualsSentence}
              </span>
            </span>
          </SignalGroup>
        )}

        <SignalGroup label={`${match.displayName.split(' ')[0].toUpperCase()}'S AVAILABILITY`}>
          <div className="flex gap-[12px]">
            {match.availability.map((a) => (
              <AvailabilitySlot key={a.day} day={a.day} times={a.times} />
            ))}
          </div>
        </SignalGroup>

        <SignalGroup label="SOCIALS">
          <div className="flex flex-wrap gap-[8px]">
            {match.socials.map((s) => (
              <SignalPill key={s}>{s}</SignalPill>
            ))}
          </div>
        </SignalGroup>

        <DecisionBar
          passLabel="NOT NOW"
          actionLabel="SCHEDULE"
          onPass={() => {}}
          onAction={onSchedule}
        />
      </div>
    </Card>
  );
}
