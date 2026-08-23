import { Fragment, type ReactNode } from 'react';
import { Cake, Globe, Lightbulb, Linkedin, MapPin, Rss, Venus, X } from 'lucide-react';
import { Avatar, AvatarStack, Button, ICON_SIZE, iconStroke, SectionLabel } from '../primitives';

/**
 * THE SUGGESTION CARD — the weekly decision, as one object.
 *
 * ── A note on the blind gate ────────────────────────────────────────────────
 *
 * This card shows identity — name, photo, socials, endorsements — above
 * PASS / MATCH. That is a DELIBERATE reversal of the blind-match model
 * documented in redesign.md 5.11, where identity resolves only after both
 * sides accept, and it has a consequence worth stating where the code is:
 *
 *   `Recommendation.candidate` is null while a match is blind. The API sends
 *   `blindRationale` and nothing else. So this card cannot be filled from the
 *   suggestions endpoint as it stands — it needs identity at suggestion time,
 *   plus fields that do not exist anywhere yet (pronouns, birthday, meeting
 *   formats, endorsements, socials).
 *
 * The view model below is therefore the contract the backend would have to
 * meet, written down rather than implied.
 */

export type SuggestionSocial = { kind: 'linkedin' | 'website' | 'substack'; href?: string };

export type Suggestion = {
  id: string;
  name: string;
  avatarSrc?: string;
  role: string;
  location: string;
  pronouns: string;
  birthday: string;
  about: string;
  commonInterests: string[];
  /** Their preference, not a control — see the card footnote. */
  meetingFormats: string[];
  /** Each line may carry `**emphasis**`, so the copy stays a string and can
   *  come from the insight pipeline unchanged. */
  signalBullets: string[];
  endorsedBy: { people: { src?: string; name: string }[]; sentence: string };
  socials: SuggestionSocial[];
};

/** Renders `**bold**` inside an otherwise plain string. Keeps insight copy as
 *  data rather than as JSX assembled at the call site. */
function Emphasised({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-medium text-[var(--color-black-700)]">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function MetaItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-[6px] text-[14px] leading-[100%] text-[var(--color-black-500)]">
      <span className="grid size-[16px] shrink-0 place-items-center">{icon}</span>
      {children}
    </span>
  );
}

/** A read-only tag. Not a Chip: nothing here is selectable, so it must not be
 *  a button (redesign.md 5.1 — pills that are chrome are never `<button>`). */
function Tag({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'soft' }) {
  return (
    <span
      className={
        'inline-flex items-center rounded-[8px] px-[14px] py-[8px] text-[14px] leading-[16px] ' +
        (tone === 'soft'
          ? 'bg-[var(--color-blue-50)] text-[var(--color-black-500)]'
          : 'bg-[var(--color-black-100)] text-[var(--color-black-700)]')
      }
    >
      {children}
    </span>
  );
}

const SOCIAL_ICON = {
  linkedin: Linkedin,
  website: Globe,
  substack: Rss,
} as const;

const SOCIAL_LABEL = {
  linkedin: 'LinkedIn',
  website: 'Website',
  substack: 'Substack',
} as const;

export function SuggestionCard({
  suggestion,
  signalOpen,
  onToggleSignal,
  onPass,
  onMatch,
  busy,
}: {
  suggestion: Suggestion;
  signalOpen: boolean;
  onToggleSignal: () => void;
  onPass: () => void;
  onMatch: () => void;
  busy?: boolean;
}) {
  const s = suggestion;
  const firstName = s.name.split(' ')[0];

  return (
    <div
      className={
        'flex items-stretch ' +
        // The card does not move when the panel opens. Pulling the row's
        // layout width back by the panel width keeps the card centred exactly
        // where it was and lets the panel extend past it — otherwise the thing
        // you are reading slides left the moment you ask for more about it.
        // Only above xl, where there is room; below that the pair centres
        // together rather than running off the edge.
        (signalOpen ? 'xl:mr-[-412px]' : '')
      }
    >
      <article
        className={
          'w-[770px] max-w-full shrink-0 border border-[var(--color-black-100)] bg-[var(--color-white)] ' +
          (signalOpen ? 'rounded-l-[16px] border-r-0' : 'rounded-[16px]')
        }
      >
        <header className="flex items-start gap-[24px] p-[32px]">
          <Avatar src={s.avatarSrc} alt="" size={80} onLight />

          <div className="flex min-w-0 flex-1 flex-col gap-[12px]">
            <div className="flex items-start gap-[16px]">
              <div className="flex min-w-0 flex-1 flex-col gap-[12px]">
                {/* Archivo, not Parkinsans: redesign.md 8 puts a person's NAME in the
                    title family. Parkinsans is for the question above the card. */}
                <h2 className="text-[24px] font-medium leading-[100%] text-[var(--color-black-700)]">
                  {s.name}
                </h2>
                <span className="self-start rounded-[8px] bg-[var(--color-black-100)] px-[14px] py-[8px] text-[14px] leading-[16px] text-[var(--color-black-700)]">
                  {s.role}
                </span>
              </div>

              <button
                type="button"
                onClick={onToggleSignal}
                aria-expanded={signalOpen}
                aria-controls={`signal-${s.id}`}
                className={
                  'flex shrink-0 items-center gap-[8px] rounded-[40px] bg-[var(--color-blue-100)] px-[16px] py-[9px] ' +
                  'text-[13px] font-medium uppercase leading-[120%] tracking-[1px] text-[var(--color-blue-600)] ' +
                  'transition-colors hover:bg-[var(--color-blue-200)] ' +
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]'
                }
              >
                <Lightbulb size={ICON_SIZE.sm} strokeWidth={iconStroke(ICON_SIZE.sm)} />
                Signal
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-[10px] gap-y-[6px]">
              <MetaItem icon={<MapPin size={ICON_SIZE.sm} strokeWidth={iconStroke(ICON_SIZE.sm)} />}>
                {s.location}
              </MetaItem>
              <span aria-hidden className="text-[var(--color-black-300)]">
                •
              </span>
              <MetaItem icon={<Venus size={ICON_SIZE.sm} strokeWidth={iconStroke(ICON_SIZE.sm)} />}>
                {s.pronouns}
              </MetaItem>
              <span aria-hidden className="text-[var(--color-black-300)]">
                •
              </span>
              <MetaItem icon={<Cake size={ICON_SIZE.sm} strokeWidth={iconStroke(ICON_SIZE.sm)} />}>
                {s.birthday}
              </MetaItem>
            </div>
          </div>
        </header>

        <div className="border-t border-[var(--color-black-100)] px-[32px] py-[28px]">
          <SectionLabel>About</SectionLabel>
          <p className="mt-[12px] text-[16px] leading-[150%] text-[var(--color-black-700)]">{s.about}</p>

          <SectionLabel className="mt-[32px]">Common interests</SectionLabel>
          <div className="mt-[12px] flex flex-wrap gap-[10px]">
            {s.commonInterests.map((i) => (
              <Tag key={i}>{i}</Tag>
            ))}
          </div>

          <div className="mt-[32px] flex items-baseline justify-between gap-[16px]">
            <SectionLabel>Meeting format</SectionLabel>
            {/* Whose preference this is, said out loud. Without it the tags
                read as controls the viewer is meant to pick from. */}
            <span className="shrink-0 text-[13px] leading-[18px] text-[var(--color-black-500)]">
              {firstName}'s preference
            </span>
          </div>
          <div className="mt-[12px] flex flex-wrap gap-[10px]">
            {s.meetingFormats.map((f) => (
              <Tag key={f} tone="soft">
                {f}
              </Tag>
            ))}
          </div>
        </div>

        <footer className="flex items-center justify-center gap-[12px] border-t border-[var(--color-black-100)] px-[32px] py-[24px]">
          <button
            type="button"
            onClick={onPass}
            disabled={busy}
            className={
              'rounded-[40px] bg-[var(--color-blue-50)] px-[40px] py-[14px] text-[14px] font-medium uppercase leading-[16px] tracking-[1px] ' +
              'text-[var(--color-black-700)] transition-colors hover:bg-[var(--color-blue-100)] disabled:cursor-not-allowed disabled:text-[var(--color-black-400)] ' +
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]'
            }
          >
            Pass
          </button>
          <Button size="lg" className="px-[40px] py-[14px]" onClick={onMatch} disabled={busy}>
            MATCH
          </Button>
        </footer>
      </article>

      {signalOpen && <SignalPanel id={`signal-${s.id}`} suggestion={s} onClose={onToggleSignal} />}
    </div>
  );
}

function SignalPanel({ id, suggestion, onClose }: { id: string; suggestion: Suggestion; onClose: () => void }) {
  const s = suggestion;
  const firstName = s.name.split(' ')[0];

  return (
    <aside
      id={id}
      className="flex w-[412px] shrink-0 flex-col overflow-hidden rounded-r-[16px] border border-[var(--color-black-100)] bg-[var(--color-white)]"
    >
      <div className="bg-[var(--color-blue-100)] p-[24px]">
        <div className="flex items-start justify-between gap-[12px]">
          <span className="flex items-center gap-[8px] text-[14px] font-medium uppercase leading-[100%] tracking-[1px] text-[var(--color-blue-600)]">
            <Lightbulb size={ICON_SIZE.sm} strokeWidth={iconStroke(ICON_SIZE.sm)} />
            Signal
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close signal"
            className={
              'shrink-0 text-[var(--color-blue-600)] transition-colors hover:text-[var(--color-blue-700)] ' +
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]'
            }
          >
            <X size={ICON_SIZE.sm} strokeWidth={iconStroke(ICON_SIZE.sm)} />
          </button>
        </div>

        <p className="mt-[8px] text-[13px] leading-[18px] text-[var(--color-black-500)]">
          What you and {firstName} have in common
        </p>

        <ul className="mt-[16px] flex flex-col gap-[12px]">
          {s.signalBullets.map((line, i) => (
            <li key={i} className="flex gap-[10px] text-[14px] leading-[150%] text-[var(--color-black-700)]">
              <span aria-hidden className="mt-[8px] size-[4px] shrink-0 rounded-full bg-[var(--color-black-700)]" />
              <span>
                <Emphasised text={line} />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-[var(--color-black-100)] p-[24px]">
        <SectionLabel>Endorsed by</SectionLabel>
        <div className="mt-[12px] flex items-center gap-[12px]">
          <AvatarStack people={s.endorsedBy.people} max={2} />
          <span className="text-[14px] leading-[20px] text-[var(--color-black-500)]">
            <strong className="font-medium text-[var(--color-black-700)]">{s.endorsedBy.people[0]?.name}</strong>{' '}
            {s.endorsedBy.sentence}
          </span>
        </div>
      </div>

      <div className="border-t border-[var(--color-black-100)] p-[24px]">
        <SectionLabel>Socials</SectionLabel>
        <div className="mt-[12px] flex items-center gap-[12px]">
          {s.socials.map((social) => {
            const Glyph = SOCIAL_ICON[social.kind];
            return (
              <a
                key={social.kind}
                href={social.href ?? '#'}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={SOCIAL_LABEL[social.kind]}
                className={
                  'grid size-[40px] place-items-center rounded-full bg-[var(--color-blue-100)] text-[var(--color-blue-600)] ' +
                  'transition-colors hover:bg-[var(--color-blue-200)] ' +
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]'
                }
              >
                <Glyph size={ICON_SIZE.sm} strokeWidth={iconStroke(ICON_SIZE.sm)} />
              </a>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
