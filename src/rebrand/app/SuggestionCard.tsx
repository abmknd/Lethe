import { Fragment } from 'react';
import {
  BulbChargeingIcon,
  Cancel01Icon,
  GlobalIcon,
  Linkedin02Icon,
  SubstackIcon,
} from '../../assets/system_icons';
import {
  Avatar, BirthdayMeta, Button, GenderMeta, Icon, LocationMeta, SectionLabel, Tag,
} from '../ds';

/**
 * ═══ RETIRED DESIGN — FROZEN ═══════════════════════════════════════════════
 *
 * This is the CONNECT surface: CONNECT / FEED in the top bar, a three-up tab
 * rail, a 600-wide profile card. It is being sunset.
 *
 * The surface we are building on is `src/rebrand/app/AppShell.tsx` — FEED /
 * MATCHES / COMMUNITIES, built from `relethe-feed` 750:184 (feed), 907:22311
 * (matches) and 911:4246 (suggested).
 *
 * It still exists because `/connect` in the LIVE app mounts it (see
 * src/app/ConnectPage.tsx). Deleting it now breaks production. Its preview
 * route is gone, so the only way to reach it is the real page.
 *
 * DO NOT INVEST HERE. No new components, no Figma alignment passes, no
 * polish. The next change this file should see is its callers moving to
 * AppShell, and then its deletion.
 * ══════════════════════════════════════════════════════════════════════════
 */

/**
 * THE SUGGESTION CARD — built to `connect-default` / `connect-open`
 * (ProfileCard 720:347, signal-bar 613:2784). Card 600, panel 320.
 *
 * ── Colour comes from Figma's semantic layer ────────────────────────────────
 *
 * `text/default/caption`, `surface/primary/subtle` and the rest are Figma
 * variables, and the code uses the same names so a frame and a component are
 * describing one thing rather than two. I previously read #403b3b and #888585
 * as drift and snapped them to the Black ramp; they are named steps in the
 * WARM Neutral ramp, which the token file did not have. See tokens.css.
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
          <span key={i} className="text-[var(--text-default-body)]">
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

function Divider() {
  return <div className="h-px w-full shrink-0 bg-[var(--border-disabled-deep)]" />;
}

// The local `Tag` that stood here is gone. It was Body 4A (14/20) at 12/6 on a
// radius 8 — the library's `Tag` is Body 4B (14/16) at 12/8, which is what
// Figma draws. Both land on 32 tall, so the difference was invisible until you
// measured the leading, and it is exactly the kind of near-miss a second copy
// of a component produces.

const SOCIAL = {
  linkedin: { icon: Linkedin02Icon, label: 'LinkedIn' },
  website: { icon: GlobalIcon, label: 'Website' },
  substack: { icon: SubstackIcon, label: 'Substack' },
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
    // The panel is ABSOLUTE, as it is in the frame, so it is outside layout
    // entirely and the card cannot move when it opens. Opening SIGNAL has to
    // read as the same card saying more, not as a second card arriving.
    <div className="relative flex w-[600px] max-w-full items-stretch">
      <article
        className={
          'flex w-full flex-col overflow-hidden border border-[var(--border-disabled-deep)] bg-[var(--surface-neutral-default)] ' +
          (signalOpen ? 'rounded-l-[16px] border-r-0' : 'rounded-[16px]')
        }
      >
        {/* `relative`, because SIGNAL is positioned OVER the header rather than
            laid out beside it (720:371 sits at x=476 across the text column).
            As a flex sibling it steals width and wraps the meta row onto a
            second line, which is what pushes the header past its 140. */}
        <header className="relative flex gap-[16px] px-[24px] py-[20px]">
          <span className="size-[72px] shrink-0 overflow-hidden rounded-full border-2 border-[var(--color-white)]">
            <Avatar src={s.avatarSrc} person={s.name} size="xxl" />
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-[12px] pt-[4px]">
            {/* Archivo Medium 20 — redesign.md 8 puts a person's name in the
                title family. Parkinsans is the question above the card. */}
            <h2 className="text-[20px] font-medium leading-[20px] text-[var(--color-black-700)]">{s.name}</h2>

            <div className="flex flex-col gap-[12px]">
              <span className="self-start">
                <Tag tone="default">{s.role}</Tag>
              </span>

              <div className="flex flex-wrap items-center gap-[12px]">
                <LocationMeta>{s.location}</LocationMeta>
                <span aria-hidden className="size-[4px] shrink-0 rounded-full bg-[var(--color-black-400)]" />
                <GenderMeta type="Woman" size="md">{s.pronouns}</GenderMeta>
                <span aria-hidden className="size-[4px] shrink-0 rounded-full bg-[var(--color-black-400)]" />
                <BirthdayMeta>{s.birthday}</BirthdayMeta>
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
                'absolute right-[24px] top-[20px] flex h-[32px] shrink-0 items-center gap-[6px] rounded-[40px] bg-[var(--surface-primary-subtle)] px-[12px] ' +
                'text-[13px] font-medium leading-[16px] tracking-[1px] text-[var(--color-blue-600)] transition-colors ' +
                'hover:bg-[var(--color-blue-100)] ' +
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]'
              }
            >
              <Icon as={BulbChargeingIcon} size={16} />
              SIGNAL
            </button>
          )}
        </header>

        <Divider />

        <div className="flex flex-col gap-[8px] px-[24px] py-[20px]">
          <SectionLabel>ABOUT</SectionLabel>
          <p className="text-[14px] leading-[20px] text-[var(--color-black-700)]">{s.about}</p>
        </div>

        <Divider />

        <div className="flex flex-col gap-[10px] px-[24px] py-[20px]">
          {/* Singular, as drawn. */}
          <SectionLabel>COMMON INTEREST</SectionLabel>
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
            <SectionLabel>MEETING FORMAT</SectionLabel>
            {/* Whose preference this is, said out loud — otherwise the tags
                read as controls the viewer is meant to pick from. */}
            <span className="shrink-0 text-[12px] leading-[18px] text-[var(--color-black-400)]">
              {firstName}'s preference
            </span>
          </div>
          <div className="flex flex-wrap gap-[8px]">
            {s.meetingFormats.map((f) => (
              <Tag key={f}>{f}</Tag>
            ))}
          </div>
        </div>

        <Divider />

        <div className="flex h-[56px] items-center justify-center px-[24px] py-[12px]">
          <div className="flex w-full max-w-[240px] gap-[10px]">
            <Button tone="subtle" onClick={onPass} disabled={busy}>PASS</Button>
            <Button tone="fill" onClick={onMatch} disabled={busy}>MATCH</Button>
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
      className="absolute bottom-0 left-full top-0 flex w-[320px] flex-col overflow-hidden rounded-r-[16px] border border-[var(--border-disabled-deep)] bg-[var(--surface-neutral-default)]"
    >
      <div className="relative flex flex-col gap-[14px] bg-[var(--surface-primary-subtle)] p-[20px]">
        <div className="flex flex-col gap-[6px]">
          <span className="flex items-center gap-[6px] text-[13px] font-medium leading-[16px] tracking-[1px] text-[var(--color-blue-600)]">
            <Icon as={BulbChargeingIcon} size={16} />
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
              <span aria-hidden className="mt-[7px] size-[5px] shrink-0 rounded-full bg-[var(--text-default-body)]" />
              <span className="text-[14px] leading-[20px] text-[var(--text-default-placeholder)]">
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
          <SectionLabel>ENDORSED BY</SectionLabel>
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
                <Avatar src={p.src} person={p.name} size="sm" />
              </span>
            ))}
          </span>
          <span className="flex-1 pb-[2px]">
            <span className="text-[14px] font-medium leading-[20px] text-[var(--text-default-caption)]">
              {s.endorsedBy.people[0]?.name}
            </span>{' '}
            <span className="text-[13px] leading-[16px] text-[var(--color-black-400)]">{s.endorsedBy.sentence}</span>
          </span>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-[12px] p-[20px]">
        <div className="flex items-center py-[4px]">
          <SectionLabel>SOCIALS</SectionLabel>
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
                  'grid size-[32px] place-items-center rounded-[40px] bg-[var(--surface-primary-subtle)] text-[var(--icons-primary-default)] ' +
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
