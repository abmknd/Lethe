import { Fragment, type ReactNode } from 'react';
import {
  BirthdayCakeIcon,
  BulbIcon,
  Cancel01Icon,
  FemaleSymbolIcon,
  GlobalIcon,
  Linkedin02Icon,
  Location09Icon,
  SubstackIcon,
} from '../../assets/system_icons';
import { Avatar } from '../primitives';
import { Icon } from './Icon';

/**
 * THE SUGGESTION CARD — built to `connect-default` / `connect-open`
 * (ProfileCard 720:347, signal-bar 613:2784). Card 600, panel 320.
 *
 * ── Two hexes snapped ───────────────────────────────────────────────────────
 *
 * The frames carry `#403b3b` and `#888585`, neither of which is in the ramp.
 * Per redesign.md 2.x every hex arriving from Figma that is not in a ramp is
 * drift and snaps to its nearest step, so they render Black 600 and Black 400.
 * The difference is a couple of percent of luminance; the alternative is two
 * new greys in a system whose first rule is that there are none.
 *
 * ── A note on the blind gate ────────────────────────────────────────────────
 *
 * This card shows identity above PASS / MATCH, reversing the blind-match model
 * in redesign.md 5.11. `Recommendation.candidate` is null while a match is
 * blind, and pronouns / birthday / meeting formats / endorsements / socials
 * have no column anywhere, so the type below is the contract the backend would
 * have to meet rather than one it currently meets.
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
  /** Their preference, not a control. */
  meetingFormats: string[];
  /** May carry `**emphasis**`, so insight copy stays a string. */
  signalBullets: string[];
  endorsedBy: { people: { src?: string; name: string }[]; sentence: string };
  socials: SuggestionSocial[];
};

/** Renders `**bold**` inside a plain string. In the frame the emphasis is a
 *  colour change, not a weight change — Black 600 body, Black 700 emphasis. */
function Emphasised({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <span key={i} className="text-[var(--color-black-700)]">
            {part.slice(2, -2)}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Title 6 — Archivo Medium 12/16, Black 400. */
function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={'text-[12px] font-medium uppercase leading-[16px] text-[var(--color-black-400)] ' + className}>
      {children}
    </span>
  );
}

function Divider() {
  return <div className="h-px w-full shrink-0 bg-[var(--color-black-100)]" />;
}

/** Body 5A in a tinted box. Read-only, so never a `<button>`. */
function Tag({ children, tone }: { children: ReactNode; tone: 'neutral' | 'blue' }) {
  return (
    <span
      className={
        'inline-flex items-center rounded-[8px] px-[12px] py-[8px] text-[13px] leading-[16px] text-[var(--color-black-600)] ' +
        (tone === 'blue' ? 'bg-[var(--color-blue-50)]' : 'bg-[var(--color-black-50)]')
      }
    >
      {children}
    </span>
  );
}

const SOCIAL = {
  linkedin: { icon: Linkedin02Icon, label: 'LinkedIn' },
  website: { icon: GlobalIcon, label: 'Website' },
  substack: { icon: SubstackIcon, label: 'Substack' },
} as const;

function MetaItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-[4px] text-[13px] leading-[16px] text-[var(--color-black-400)]">
      {icon}
      {children}
    </span>
  );
}

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
        // The card holds its position when the panel opens: pulling the row's
        // layout width back by the panel width keeps the card centred where it
        // was and lets the panel extend right. Otherwise the thing you are
        // reading slides left the moment you ask for more about it.
        (signalOpen ? 'xl:mr-[-320px]' : '')
      }
    >
      <article
        className={
          'flex w-[600px] max-w-full shrink-0 flex-col overflow-hidden border border-[var(--color-black-100)] bg-[var(--color-white)] ' +
          (signalOpen ? 'rounded-l-[16px] border-r-0' : 'rounded-[16px]')
        }
      >
        {/* `relative`, because SIGNAL is positioned OVER the header rather than
            laid out beside it (720:371 sits at x=476 across the text column).
            As a flex sibling it steals width and wraps the meta row onto a
            second line, which is what pushes the header past its 140. */}
        <header className="relative flex gap-[16px] px-[24px] py-[20px]">
          <span className="size-[72px] shrink-0 overflow-hidden rounded-full border-2 border-[var(--color-white)]">
            <Avatar src={s.avatarSrc} alt="" size={72} onLight />
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-[12px] pt-[4px]">
            {/* Archivo Medium 20 — redesign.md 8 puts a person's name in the
                title family. Parkinsans is the question above the card. */}
            <h2 className="text-[20px] font-medium leading-[20px] text-[var(--color-black-700)]">{s.name}</h2>

            <div className="flex flex-col gap-[12px]">
              <span className="self-start rounded-[8px] bg-[var(--color-blue-50)] px-[12px] py-[8px] text-[13px] leading-[16px] text-[var(--color-black-600)]">
                {s.role}
              </span>

              <div className="flex flex-wrap items-center gap-[12px]">
                <MetaItem icon={<Icon as={Location09Icon} size={20} />}>{s.location}</MetaItem>
                <span aria-hidden className="size-[4px] shrink-0 rounded-full bg-[var(--color-black-400)]" />
                <MetaItem icon={<Icon as={FemaleSymbolIcon} size={20} />}>{s.pronouns}</MetaItem>
                <span aria-hidden className="size-[4px] shrink-0 rounded-full bg-[var(--color-black-400)]" />
                <MetaItem icon={<Icon as={BirthdayCakeIcon} size={20} />}>{s.birthday}</MetaItem>
              </div>
            </div>
          </div>

          {!signalOpen && (
            <button
              type="button"
              onClick={onToggleSignal}
              aria-expanded={signalOpen}
              aria-controls={`signal-${s.id}`}
              className={
                'absolute right-[24px] top-[20px] flex h-[32px] shrink-0 items-center gap-[6px] rounded-[40px] bg-[var(--color-blue-50)] px-[12px] ' +
                'text-[13px] font-medium leading-[16px] tracking-[1px] text-[var(--color-blue-600)] transition-colors ' +
                'hover:bg-[var(--color-blue-100)] ' +
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]'
              }
            >
              <Icon as={BulbIcon} />
              SIGNAL
            </button>
          )}
        </header>

        <Divider />

        <div className="flex flex-col gap-[8px] px-[24px] py-[20px]">
          <Label>About</Label>
          <p className="text-[14px] leading-[20px] text-[var(--color-black-700)]">{s.about}</p>
        </div>

        <Divider />

        <div className="flex flex-col gap-[10px] px-[24px] py-[20px]">
          {/* Singular, as drawn. */}
          <Label>Common interest</Label>
          <div className="flex flex-wrap gap-[8px]">
            {s.commonInterests.map((i) => (
              <Tag key={i} tone="neutral">
                {i}
              </Tag>
            ))}
          </div>
        </div>

        <Divider />

        <div className="flex flex-col gap-[10px] px-[24px] pb-[24px] pt-[20px]">
          <div className="flex items-center justify-between py-[2px]">
            <Label>Meeting format</Label>
            {/* Whose preference this is, said out loud — otherwise the tags
                read as controls the viewer is meant to pick from. */}
            <span className="shrink-0 text-[12px] leading-[18px] text-[var(--color-black-400)]">
              {firstName}'s preference
            </span>
          </div>
          {/* The row is a fixed 32 and the tags stretch into it, so their 12px
              padding does not add height — matching 720:403. */}
          <div className="flex h-[32px] flex-wrap gap-[8px]">
            {s.meetingFormats.map((f) => (
              <span
                key={f}
                className="inline-flex items-center self-stretch rounded-[10px] bg-[var(--color-blue-50)] px-[14px] text-[13px] leading-[16px] text-[var(--color-black-600)]"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <Divider />

        <div className="flex h-[56px] items-center justify-center px-[24px] py-[12px]">
          <div className="flex w-full max-w-[240px] gap-[10px]">
            <button
              type="button"
              onClick={onPass}
              disabled={busy}
              className={
                'flex-1 rounded-[40px] bg-[var(--color-blue-50)] py-[8px] text-[13px] font-medium leading-[16px] tracking-[1px] ' +
                'text-[var(--color-black-600)] transition-colors hover:bg-[var(--color-blue-100)] disabled:cursor-not-allowed disabled:text-[var(--color-black-400)] ' +
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]'
              }
            >
              PASS
            </button>
            <button
              type="button"
              onClick={onMatch}
              disabled={busy}
              className={
                'flex-1 rounded-[40px] bg-[var(--color-blue-600)] py-[8px] text-[13px] font-medium leading-[16px] tracking-[1px] ' +
                'text-[var(--color-blue-50)] transition-colors hover:text-[var(--color-white)] disabled:cursor-not-allowed disabled:bg-[var(--color-black-100)] disabled:text-[var(--color-black-400)] ' +
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]'
              }
            >
              MATCH
            </button>
          </div>
        </div>
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
      className="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-r-[16px] border border-[var(--color-black-100)] bg-[var(--color-white)]"
    >
      <div className="relative flex flex-col gap-[14px] bg-[var(--color-blue-50)] p-[20px]">
        <div className="flex flex-col gap-[6px]">
          <span className="flex items-center gap-[6px] text-[13px] font-medium leading-[16px] tracking-[1px] text-[var(--color-blue-600)]">
            <Icon as={BulbIcon} />
            SIGNAL
          </span>
          {/* Body 5B — Archivo Light 13. The 300 weight is loaded. */}
          <span className="text-[13px] font-light leading-[16px] text-[var(--color-black-400)]">
            What you and {firstName} have in common
          </span>
        </div>

        <ul className="flex flex-col gap-[10px]">
          {s.signalBullets.map((line, i) => (
            <li key={i} className="flex gap-[10px]">
              <span aria-hidden className="mt-[7px] size-[5px] shrink-0 rounded-full bg-[var(--color-black-700)]" />
              <span className="text-[14px] leading-[20px] text-[var(--color-black-400)]">
                <Emphasised text={line} />
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close signal"
          className={
            'absolute right-[16px] top-[12px] grid size-[20px] place-items-center rounded-[40px] ' +
            'text-[var(--color-blue-600)] transition-colors hover:text-[var(--color-blue-700)] ' +
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]'
          }
        >
          <Icon as={Cancel01Icon} />
        </button>
      </div>

      <Divider />

      <div className="flex flex-col gap-[12px] p-[20px]">
        <div className="flex items-center py-[4px]">
          <Label>Endorsed by</Label>
        </div>
        <div className="flex h-[32px] items-end gap-[8px]">
          <span className="flex items-center">
            {s.endorsedBy.people.slice(0, 3).map((p, i) => (
              <span
                key={p.name}
                className="rounded-full ring-[0.8px] ring-[var(--color-white)]"
                style={{ marginLeft: i === 0 ? 0 : -20, zIndex: 3 - i }}
                title={p.name}
              >
                <Avatar src={p.src} alt="" size={32} onLight />
              </span>
            ))}
          </span>
          <span className="flex-1 pb-[2px]">
            <span className="text-[14px] font-medium leading-[20px] text-[var(--color-black-600)]">
              {s.endorsedBy.people[0]?.name}
            </span>{' '}
            <span className="text-[13px] leading-[16px] text-[var(--color-black-400)]">{s.endorsedBy.sentence}</span>
          </span>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-[12px] p-[20px]">
        <div className="flex items-center py-[4px]">
          <Label>Socials</Label>
        </div>
        <div className="flex flex-wrap items-center gap-[12px]">
          {s.socials.map((social) => {
            const def = SOCIAL[social.kind];
            return (
              <a
                key={social.kind}
                href={social.href ?? '#'}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={def.label}
                className={
                  'grid size-[32px] place-items-center rounded-[40px] bg-[var(--color-blue-50)] text-[var(--color-blue-600)] ' +
                  'transition-colors hover:bg-[var(--color-blue-100)] ' +
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]'
                }
              >
                <Icon as={def.icon} />
              </a>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
