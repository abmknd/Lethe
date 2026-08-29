import { useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import {
  Analytics01Icon, Bookmark01Icon, Calendar01Icon, CheckmarkBadge01Icon, CompassIcon,
  DashboardSquare01Icon, FavouriteIcon, FlashIcon, GlobalIcon, Home01Icon, Linkedin02Icon,
  Mail01Icon, Message01Icon, MoreHorizontalIcon, Notification01Icon, PlusSignIcon, SearchIcon,
  SentIcon, Share01Icon, SignalIcon, SparklesIcon, SubstackIcon, UserAdd01Icon, UserMultipleIcon,
  UserRemove01Icon, Location09Icon, BulbIcon,
} from '../../assets/system_icons';
import {
  FAVES, FEED_RAIL, FOLLOW, MATCHES, MATCH_RAIL, ME, NAV, POSTS, PROFILES,
  type NavTab, type Post, type Profile,
} from './appDemo';

/**
 * THE APP SHELL — implemented from `Relethe App.dc.html`.
 *
 * A header, a three-column grid, and four views that swap inside it. The shell
 * itself never moves: the rail and the right-hand column are sticky at 88, so
 * only the middle scrolls.
 *
 * ── Colour, and the three values that were not on the ramp ──────────────────
 *
 * The source is written in raw hex. Everything resolves to a token here, and
 * three needed snapping (redesign.md 2.x — a hex not in a ramp is drift):
 *
 *     #F7F7F7  ->  Neutral 50    the muted pill fill, 3 steps off #FAFAFA
 *     #ECFDF3  ->  Success 100   the "Met" status pill
 *     #027A48  ->  Success 700   its text
 *
 * The source also writes body text as pure #000000. We adopted Figma's warm
 * Neutral ramp, where body text is #282323, so the token wins over the literal.
 * That decision is already recorded and this file follows it rather than
 * reopening it.
 *
 * ── Icons ───────────────────────────────────────────────────────────────────
 *
 * The source draws its icons as inline paths. Those are sketches, not the
 * library — so every one here is resolved to its real name in the Figma icon
 * library and exported. `Activity` is the single substitution: the library has
 * no pulse or heart-rate glyph, so it takes `flash`. Flagged rather than fudged.
 */

// ---------------------------------------------------------------- primitives

const CARD = 'rounded-[16px] bg-[var(--surface-neutral-default)]';
// 13/16, not 13/100%. Every `section-label` frame in the file is 16 tall, and
// a 100% leading made it 13 — which is why four separate sections each came out
// exactly 3px short of the frame.
const LABEL = 'text-[13px] font-medium uppercase leading-[16px] tracking-[1px] text-[var(--text-default-caption)]';
const HAIRLINE = 'bg-[var(--border-disabled-deep)]';

function Avatar({ src, size, ring }: { src: string; size: number; ring?: boolean }) {
  return (
    <span
      role="img"
      aria-hidden
      className={
        'block shrink-0 rounded-full bg-[var(--border-disabled-deep)] bg-cover bg-center ' +
        (ring ? 'border-2 border-[var(--surface-neutral-default)]' : '')
      }
      style={{ width: size, height: size, backgroundImage: `url(${src})` }}
    />
  );
}

/**
 * TAG — the library's own component, reduced to the axes this screen uses.
 *
 * Figma ships 84 variants across Status (default/hover/focus/disabled/success/
 * error/warning) x Size (sm 24 / md 32) x State x Type. Only `Size=md,
 * Status=default` appears on Connect, in two tones, so that is what exists here.
 * The rest are drawn but unused — building all 84 before a screen asks for one
 * is how a component library fills up with code nothing imports.
 */
function Tag({ children, tone = 'neutral', size = 'md' }: { children: ReactNode; tone?: 'neutral' | 'blue'; size?: 'sm' | 'md' }) {
  return (
    <span
      className={
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-[8px] px-[12px] text-[14px] leading-[20px] ' +
        (size === 'md' ? 'h-[32px] ' : 'h-[24px] ') +
        (tone === 'blue'
          ? 'bg-[var(--surface-primary-subtle)] text-[var(--text-default-body)]'
          : 'bg-[var(--surface-neutral-subtle)] text-[var(--text-default-body)]')
      }
    >
      {children}
    </span>
  );
}

function Dot() {
  return <span aria-hidden className="size-[3px] shrink-0 rounded-full bg-[var(--icons-disabled-on-color)]" />;
}

function PillButton({
  children, tone = 'outline', onClick,
}: { children: ReactNode; tone?: 'outline' | 'neutral' | 'primary' | 'subtle'; onClick?: () => void }) {
  const skin = {
    outline: 'border border-[var(--border-primary-default)] text-[var(--text-default-highlight-blue)] hover:bg-[var(--surface-primary-subtle)]',
    neutral: 'border border-[var(--color-black-200)] bg-[var(--surface-neutral-default)] text-[var(--text-default-body)] hover:bg-[var(--surface-page-beta)]',
    primary: 'bg-[var(--surface-primary-default)] text-[var(--text-on-color-heading)]',
    subtle: 'bg-[var(--surface-primary-subtle)] text-[var(--text-default-body)]',
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'shrink-0 rounded-[40px] text-[13px] font-medium leading-[120%] tracking-[1px] transition-colors ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-primary-default)] ' +
        skin
      }
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------- header

function HeaderIconButton({ label, glyph, badge }: { label: string; glyph: typeof Mail01Icon; badge?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative grid size-[32px] place-items-center rounded-[32px] border border-[var(--color-black-200)] bg-[var(--surface-neutral-default)] text-[var(--icons-neutral-default)] transition-colors hover:bg-[var(--surface-page-beta)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-primary-default)]"
    >
      <Icon as={glyph} size={18} />
      {badge && (
        <span className="absolute right-[10px] top-[9px] size-[7px] rounded-full border-[1.5px] border-[var(--surface-neutral-default)] bg-[var(--surface-primary-default)]" />
      )}
    </button>
  );
}

/** The logomark: seven circles, the brand's own drawing rather than an icon. */
function Logomark() {
  return (
    <span className="grid size-[34px] shrink-0 place-items-center">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--surface-primary-default)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Relethe" role="img">
        <circle cx="12" cy="6.8" r="4.2" /><circle cx="16.5" cy="9.4" r="4.2" />
        <circle cx="16.5" cy="14.6" r="4.2" /><circle cx="12" cy="17.2" r="4.2" />
        <circle cx="7.5" cy="14.6" r="4.2" /><circle cx="7.5" cy="9.4" r="4.2" />
        <circle cx="12" cy="12" r="2.2" />
      </svg>
    </span>
  );
}

function Header({ nav, onNav }: { nav: number; onNav: (i: number) => void }) {
  return (
    <header className="sticky top-0 z-40 flex h-[64px] items-center justify-between gap-[24px] border-b border-[var(--border-disabled-deep)] bg-[var(--surface-neutral-default)] px-[32px]">
      <div className="flex min-w-0 items-center gap-[24px]">
        <Logomark />
        <nav className="flex items-center gap-[4px]">
          {NAV.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => onNav(i)}
              aria-current={i === nav}
              className={
                'rounded-[40px] px-[14px] py-[9px] text-[13px] font-medium leading-[120%] tracking-[1px] transition-colors ' +
                (i === nav ? 'text-[var(--text-default-body)]' : 'text-[var(--text-default-placeholder)] hover:text-[var(--text-default-caption)]')
              }
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-[14px]">
        <PillButton tone="outline"><span className="grid h-[32px] w-[70px] place-items-center">INVITE</span></PillButton>
        <HeaderIconButton label="Notifications" glyph={Notification01Icon} badge />
        <HeaderIconButton label="Messages" glyph={Mail01Icon} />
        <button type="button" aria-label="Your profile" className="block size-[32px] overflow-hidden rounded-[32px] border border-[var(--color-black-200)]">
          <img src={ME} alt="" className="size-full object-cover" />
        </button>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- rail

const RAIL_ICON: Record<string, typeof Home01Icon> = {
  'For you': Home01Icon, Following: UserMultipleIcon, Insights: Analytics01Icon,
  Explore: CompassIcon, Bookmarks: Bookmark01Icon,
  // The library has no pulse or heart-rate glyph. `flash` is the substitution,
  // recorded here rather than silently drawn.
  Activity: FlashIcon,
  Matches: DashboardSquare01Icon, Suggested: SparklesIcon, Upcoming: Calendar01Icon,
  Endorsed: CheckmarkBadge01Icon, Invited: UserAdd01Icon, Disavowed: UserRemove01Icon,
};

function Rail({ items, active, onPick }: { items: readonly string[]; active: number; onPick: (i: number) => void }) {
  return (
    <aside className={'sticky top-[88px] flex flex-col gap-[2px] p-[8px] ' + CARD}>
      {items.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => onPick(i)}
          aria-current={i === active}
          className={
            'flex w-full items-center gap-[12px] rounded-[12px] px-[14px] py-[13px] text-left text-[16px] leading-[100%] transition-colors ' +
            (i === active
              ? 'bg-[var(--surface-primary-subtle)] font-medium text-[var(--text-default-highlight-blue)]'
              : 'text-[var(--text-default-body)] hover:bg-[var(--surface-neutral-subtle)]')
          }
        >
          <Icon as={RAIL_ICON[label]} size={20} />
          {label}
        </button>
      ))}
    </aside>
  );
}

// ---------------------------------------------------------------- feed

function PostActions({ post }: { post: Post }) {
  const act = 'flex items-center gap-[8px] rounded-[40px] px-[12px] py-[8px] text-[14px] leading-[100%] text-[var(--text-default-caption)] transition-colors hover:bg-[var(--surface-neutral-subtle)]';
  const round = 'grid size-[36px] place-items-center rounded-[36px] text-[var(--text-default-caption)] transition-colors hover:bg-[var(--surface-neutral-subtle)]';
  return (
    <div className="mt-[8px] flex items-center justify-between gap-[16px] px-[16px] pb-[12px] pt-[8px]">
      <div className="flex items-center gap-[4px]">
        <button type="button" aria-label="Like" className={act}><Icon as={FavouriteIcon} size={18} />{post.likes}</button>
        <button type="button" aria-label="Reply" className={act}><Icon as={Message01Icon} size={18} />{post.replies}</button>
        <button type="button" aria-label="Echo" className={act}><Icon as={SignalIcon} size={18} />{post.echoes}</button>
      </div>
      <div className="flex items-center gap-[4px]">
        <button type="button" aria-label="Bookmark" className={round}><Icon as={Bookmark01Icon} size={18} /></button>
        <button type="button" aria-label="Share" className={round}><Icon as={Share01Icon} size={18} /></button>
      </div>
    </div>
  );
}

function FeedView() {
  return (
    <div className={'sticky top-[88px] max-h-[calc(100vh-112px)] overflow-y-auto ' + CARD}>
      <button
        type="button"
        className="sticky top-0 z-20 flex w-full items-center gap-[14px] rounded-t-[16px] border-b border-[var(--border-disabled-deep)] bg-[var(--surface-neutral-default)] px-[18px] py-[16px] text-left text-[var(--text-default-body)] transition-colors hover:bg-[var(--surface-primary-subtle)] hover:text-[var(--text-default-highlight-blue)]"
      >
        <Avatar src={ME} size={44} />
        <span className="min-w-0 flex-1 text-[18px] leading-[22px] text-[var(--text-default-placeholder)]">What's up?</span>
        <span className="grid size-[40px] shrink-0 place-items-center rounded-[40px]"><Icon as={SentIcon} size={20} /></span>
      </button>

      {POSTS.map((post, i) => (
        <article
          key={post.handle + post.time}
          className={
            'flex flex-col ' +
            (i ? 'border-t border-[var(--border-disabled-deep)] ' : '') +
            (i === POSTS.length - 1 ? 'rounded-b-[16px]' : '')
          }
        >
          <div className="flex items-start gap-[14px] px-[22px] pt-[20px]">
            <Avatar src={post.avatar} size={44} />
            <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
              <div className="flex flex-wrap items-center gap-[8px]">
                <span className="text-[16px] font-medium leading-[100%] text-[var(--text-default-body)]">{post.name}</span>
                <Dot />
                <span className="text-[14px] leading-[100%] text-[var(--text-default-placeholder)]">{post.time}</span>
              </div>
              <span className="text-[14px] leading-[100%] text-[var(--text-default-placeholder)]">{post.handle}</span>
            </div>
            <button type="button" aria-label="More" className="grid size-[32px] shrink-0 place-items-center rounded-[32px] text-[var(--text-default-placeholder)] transition-colors hover:bg-[var(--surface-neutral-subtle)]">
              <Icon as={MoreHorizontalIcon} size={18} />
            </button>
          </div>

          <p className="mx-[22px] mt-[14px] text-[16px] leading-[150%] text-[var(--text-default-body)]">{post.body}</p>

          {post.media && (
            <div
              className="mx-[22px] mt-[16px] h-[300px] rounded-[12px] bg-[var(--border-disabled-deep)] bg-cover bg-center"
              style={{ backgroundImage: `url(${post.media})` }}
            />
          )}

          <PostActions post={post} />
        </article>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- matches

function MatchListView({ rail }: { rail: string }) {
  const list = rail === 'Upcoming' ? MATCHES.filter((m) => m.status === 'Upcoming') : MATCHES;
  return (
    <div className={'sticky top-[88px] max-h-[calc(100vh-112px)] overflow-y-auto ' + CARD}>
      <button
        type="button"
        className="sticky top-0 z-20 flex w-full items-center justify-between gap-[16px] rounded-t-[16px] border-b border-[var(--border-disabled-deep)] bg-[var(--surface-neutral-default)] px-[22px] py-[20px] text-left text-[var(--text-default-body)] transition-colors hover:bg-[var(--surface-primary-subtle)] hover:text-[var(--text-default-highlight-blue)]"
      >
        <span className="text-[18px] leading-[22px]">Invite someone</span>
        <span className="grid size-[28px] place-items-center rounded-[28px]"><Icon as={PlusSignIcon} size={18} /></span>
      </button>

      {list.map((m, i) => (
        <article
          key={m.handle}
          className={
            'flex flex-col pb-[22px] ' +
            (i ? 'border-t border-[var(--border-disabled-deep)] ' : '') +
            (i === list.length - 1 ? 'rounded-b-[16px]' : '')
          }
        >
          <div className="flex items-start gap-[14px] px-[22px] pt-[20px]">
            <Avatar src={m.avatar} size={44} />
            <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
              <span className="text-[16px] font-medium leading-[100%] text-[var(--text-default-body)]">{m.name}</span>
              <div className="flex flex-wrap items-center gap-[10px]">
                <span className="text-[14px] leading-[100%] text-[var(--text-default-placeholder)]">{m.handle}</span>
                <span
                  className={
                    'shrink-0 rounded-[6px] px-[8px] text-[12px] leading-[16px] ' +
                    (m.status === 'Upcoming'
                      ? 'bg-[var(--surface-primary-subtle)] text-[var(--text-default-highlight-blue)]'
                      : 'bg-[var(--color-success-100)] text-[var(--color-success-700)]')
                  }
                >
                  {m.status}
                </span>
              </div>
            </div>
            <PillButton tone="neutral"><span className="block px-[14px] py-[9px] text-[12px] leading-[100%]">MESSAGE</span></PillButton>
          </div>

          <p className="mx-[22px] mt-[14px] text-[16px] leading-[150%] text-[var(--text-default-body)]">{m.about}</p>

          <div className="mx-[22px] mt-[18px] flex items-start gap-[10px] rounded-[12px] bg-[var(--surface-primary-subtle)] px-[14px] py-[12px]">
            <span className="mt-[2px] text-[var(--text-default-highlight-blue)]"><Icon as={SignalIcon} size={16} /></span>
            <span className="text-[15px] leading-[140%] text-[var(--text-default-body)]">{m.signal}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- suggestions

function SuggestionsView({ profile, done, onDecide }: { profile: Profile; done: number; onDecide: () => void }) {
  const first = profile.name.split(' ')[0];
  return (
    <div className="flex min-w-0 flex-col gap-[20px]">
      {/* prompt-banner: 40 tall, heading 24. */}
      <div className="flex h-[40px] items-center justify-center text-center">
        <h1 className="text-[20px] font-medium leading-[24px] text-[var(--text-default-body)]">
          Would you like to meet <span className="text-[var(--text-default-highlight-blue)]">{profile.name}?</span>
        </h1>
      </div>

      {/* profile-detail-card: 760 wide. profile-columns 527, bottom-bar 74. */}
      <div className={'flex flex-col overflow-hidden ' + CARD}>
        <div className="flex items-stretch max-[1000px]:flex-col">
          {/* left-profile-info — 459 of the 760, padding 20 throughout */}
          <div className="flex min-w-0 flex-[1_1_459px] flex-col">
            {/* top-info-block: 136 = 20 + 96 + 20 */}
            <div className="flex items-start gap-[16px] p-[20px]">
              <Avatar src={profile.avatar} size={72} />
              <div className="flex min-w-0 flex-1 flex-col">
                <h2 className="mt-[4px] text-[20px] font-medium leading-[20px] text-[var(--text-default-body)]">
                  {profile.name}
                </h2>
                <div className="mt-[12px] flex flex-col gap-[12px]">
                  <span className="self-start"><Tag>{profile.role}</Tag></span>
                  {/*
                    ONE meta item now. The frame's meta-details-row is 131x16 and
                    holds only `location-meta`; pronouns and birthday are gone and
                    the separator beside them is hidden="true". Removed rather
                    than kept as a nicety — neither has a column behind it, so
                    keeping them means inventing data (docs/backend-gaps.md 2b).
                  */}
                  <span className="flex h-[16px] items-center gap-[8px] whitespace-nowrap text-[14px] leading-[16px] text-[var(--text-default-caption)]">
                    <span className="text-[var(--text-default-placeholder)]"><Icon as={Location09Icon} size={16} /></span>
                    {profile.city}
                  </span>
                </div>
              </div>
            </div>

            <div className={'h-px ' + HAIRLINE} />

            {/* about-section: 144 = 20 + 16 + 8 + 80 + 20 */}
            <section className="flex flex-col p-[20px]">
              <span className={LABEL}>ABOUT</span>
              <p className="mt-[8px] text-[16px] leading-[20px] text-[var(--text-default-body)]">{profile.about}</p>
            </section>

            <div className={'h-px ' + HAIRLINE} />

            {/* interest-section: 138 = 20 + 16 + 10 + 72 + 20 */}
            <section className="flex flex-col p-[20px]">
              <span className={LABEL}>COMMON INTEREST</span>
              <div className="mt-[10px] flex flex-wrap gap-[8px]">
                {profile.interests.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            </section>

            <div className={'h-px ' + HAIRLINE} />

            {/* meeting-format-section: 106 = 20 + 20 + 10 + 32 + 24 */}
            <section className="flex flex-col px-[20px] pb-[24px] pt-[20px]">
              <div className="flex h-[20px] items-center justify-between gap-[16px]">
                <span className={LABEL}>MEETING FORMAT</span>
                <span className="whitespace-nowrap text-[13px] leading-[16px] text-[var(--text-default-placeholder)]">
                  {first}&rsquo;s preference
                </span>
              </div>
              <div className="mt-[10px] flex flex-wrap gap-[8px]">
                {profile.formats.map((f) => <Tag key={f} tone="blue">{f}</Tag>)}
              </div>
            </section>
          </div>

          <div className={'w-px shrink-0 max-[1000px]:h-px max-[1000px]:w-auto ' + HAIRLINE} />

          {/* right-profile-sidebar — 300 wide, 20 padding */}
          <div className="flex w-[300px] shrink-0 flex-col max-[1000px]:w-auto">
            {/* signal-section: 220 = 20 + 36 + 14 + 130 + 20 */}
            <section className="flex flex-col bg-[var(--surface-primary-subtle)] p-[20px]">
              <div className="flex h-[36px] items-start gap-[6px]">
                <Icon as={BulbIcon} size={32} className="text-[var(--text-default-highlight-blue)]" />
                <span className="flex flex-col gap-[4px]">
                  <span className="text-[14px] font-medium leading-[16px] tracking-[1px] text-[var(--text-default-highlight-blue)]">
                    SIGNAL
                  </span>
                  <span className="text-[14px] leading-[16px] text-[var(--text-default-placeholder)]">
                    What you and {first} have in common
                  </span>
                </span>
              </div>
              <div className="mt-[14px] flex flex-col gap-[10px]">
                {profile.bullets.map((b) => (
                  <div key={b.emph} className="flex items-start gap-[10px]">
                    <span className="mt-[7px] size-[5px] shrink-0 rounded-full bg-[var(--text-default-body)]" />
                    <p className="text-[14px] leading-[20px] text-[var(--text-default-body)]">
                      {b.pre}<span className="font-semibold">{b.emph}</span>{b.post}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* endorsed-section: 100 = 20 + 16 + 12 + 32 + 20 */}
            <section className="flex flex-col p-[20px]">
              <span className={LABEL}>ENDORSED BY</span>
              <div className="mt-[12px] flex h-[32px] items-center gap-[8px]">
                <span className="flex w-[64px] items-center">
                  {profile.endorsers.map((src, i) => (
                    <span key={src} style={{ marginLeft: i ? -12 : 0 }}><Avatar src={src} size={32} ring /></span>
                  ))}
                </span>
                <span className="text-[15px] leading-[20px] text-[var(--text-default-body)]">
                  {profile.endorseName}
                  <span className="text-[var(--text-default-placeholder)]"> {profile.endorseRest}</span>
                </span>
              </div>
            </section>

            <div className={'h-px ' + HAIRLINE} />

            {/* socials-section: 100. Three 32x32 badge buttons at a 44 pitch. */}
            <section className="flex flex-col p-[20px]">
              <span className={LABEL}>SOCIALS</span>
              <div className="mt-[12px] flex h-[32px] gap-[12px]">
                {[
                  { label: 'LinkedIn', glyph: Linkedin02Icon },
                  { label: 'Personal website', glyph: GlobalIcon },
                  { label: 'Substack', glyph: SubstackIcon },
                ].map(({ label, glyph }) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    className="grid size-[32px] shrink-0 place-items-center rounded-[8px] bg-[var(--surface-primary-subtle)] text-[var(--text-default-highlight-blue)]"
                  >
                    <Icon as={glyph} size={16} />
                  </button>
                ))}
              </div>
            </section>
            <div className="flex-1" />
          </div>
        </div>

        <div className={'h-px ' + HAIRLINE} />
        {/* bottom-bar: 74 tall, goal left at 24, actions right. */}
        <div className="flex h-[74px] items-center justify-between px-[24px]">
          <div className="flex items-center gap-[12px]">
            <span className="text-[12px] font-medium uppercase leading-[14px] tracking-[1px] text-[var(--text-default-caption)]">
              DAILY GOAL
            </span>
            <div className="flex items-center gap-[5px]">
              {Array.from({ length: 10 }, (_, i) => (
                <span
                  key={i}
                  className={
                    'size-[8px] rounded-full ' +
                    (i < done ? 'bg-[var(--surface-primary-default)]' : 'bg-[var(--color-black-200)]')
                  }
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-[12px]">
            <PillButton tone="subtle" onClick={onDecide}>
              <span className="grid h-[32px] w-[62px] place-items-center">PASS</span>
            </PillButton>
            <PillButton tone="primary" onClick={onDecide}>
              <span className="grid h-[32px] w-[73px] place-items-center">MATCH</span>
            </PillButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- aside

function PeopleCard({
  title, people, action,
}: { title: string; people: { name: string; handle: string; avatar: string; signal: ReactNode }[]; action: string }) {
  return (
    <div className={'flex flex-col gap-[4px] px-[18px] py-[22px] ' + CARD}>
      <div className="flex items-baseline justify-between gap-[12px] px-[4px] pb-[10px]">
        <span className="text-[20px] font-medium leading-[100%] text-[var(--text-default-body)]">{title}</span>
        <a href="#see-all" className="text-[14px] leading-[100%] text-[var(--text-default-highlight-blue)]">See all</a>
      </div>
      {people.map((p) => (
        <div key={p.handle} className="flex items-start gap-[12px] px-[4px] py-[10px]">
          <Avatar src={p.avatar} size={44} />
          <div className="flex min-w-0 flex-1 flex-col gap-[12px]">
            <div className="flex items-start gap-[12px]">
              <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
                <span className="truncate text-[16px] font-medium leading-[100%] text-[var(--text-default-body)]">{p.name}</span>
                <span className="truncate text-[14px] leading-[100%] text-[var(--text-default-placeholder)]">{p.handle}</span>
              </div>
              <PillButton tone="neutral"><span className="block px-[14px] py-[9px] text-[12px] leading-[100%]">{action}</span></PillButton>
            </div>
            <span className="self-start"><Tag>{p.signal}</Tag></span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PromoCard({ title, body, action }: { title: string; body: ReactNode; action: string }) {
  return (
    <div className="flex flex-col gap-[12px] rounded-[16px] bg-[var(--surface-primary-subtle)] p-[22px]">
      <span className="text-[20px] font-medium leading-[100%] text-[var(--text-default-body)]">{title}</span>
      <p className="text-[15px] leading-[150%] text-[var(--text-default-caption)]">{body}</p>
      <span className="mt-[2px] self-start">
        <PillButton tone="outline"><span className="block px-[20px] py-[12px]">{action}</span></PillButton>
      </span>
    </div>
  );
}

function AsideColumn({ isFeed }: { isFeed: boolean }) {
  return (
    <aside className="sticky top-[88px] flex flex-col gap-[16px]">
      <div className={'flex items-center gap-[12px] px-[18px] py-[14px] ' + CARD}>
        <span className="text-[var(--text-default-placeholder)]"><Icon as={SearchIcon} size={18} /></span>
        <input
          placeholder="Search"
          aria-label="Search"
          className="min-w-0 flex-1 bg-transparent text-[16px] leading-[18px] text-[var(--text-default-body)] outline-none placeholder:text-[var(--text-default-placeholder)]"
        />
      </div>

      {isFeed ? (
        <>
          <PromoCard
            title="Invite someone"
            action="INVITE"
            body={<>Help grow the Relethe community by bringing on someone you know. Earn 3 <span className="text-[var(--text-default-highlight-blue)]">karmas</span> when they sign up, and earn 6 more when they take their first meeting.</>}
          />
          <PeopleCard title="Who to follow" action="FOLLOW" people={FOLLOW} />
        </>
      ) : (
        <>
          <PromoCard
            title="Activate superconnector"
            action="ACTIVATE"
            body="Set your own standards for who reaches you, meet beyond your weekly ten, and let the engine work a wider circle on your behalf."
          />
          <PeopleCard
            title="Your faves"
            action="MESSAGE"
            people={FAVES.map((f) => ({
              ...f,
              signal: <span className="text-[var(--text-default-caption)]">Met <span className="text-[var(--text-default-body)]">{f.times}</span>{f.rest}</span>,
            }))}
          />
        </>
      )}
    </aside>
  );
}

// ---------------------------------------------------------------- shell

export function AppShell() {
  const [nav, setNav] = useState(0);
  const [rail, setRail] = useState(0);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(1);

  const railItems = nav === 1 ? MATCH_RAIL : FEED_RAIL;
  const railLabel = railItems[rail] ?? railItems[0];
  const isSuggestions = nav === 1 && railLabel === 'Suggested';
  const profile = PROFILES[idx % PROFILES.length];

  const decide = () => {
    setIdx((i) => i + 1);
    setDone((d) => Math.min(10, d + 1));
  };

  return (
    <div className="rebrand-root min-h-screen bg-[var(--surface-page-beta)] text-[var(--text-default-body)]">
      <Header nav={nav} onNav={(i) => { setNav(i); setRail(0); }} />

      <div
        className={
          'mx-auto grid max-w-[1080px] items-start gap-[24px] p-[24px] pb-[80px] ' +
          (isSuggestions
            ? 'grid-cols-[248px_minmax(0,1fr)] max-[740px]:grid-cols-[minmax(0,1fr)]'
            : 'grid-cols-[248px_minmax(0,1fr)_324px] max-[1000px]:grid-cols-[248px_minmax(0,1fr)] max-[740px]:grid-cols-[minmax(0,1fr)]')
        }
      >
        <div className="max-[740px]:hidden">
          <Rail items={railItems} active={rail} onPick={setRail} />
        </div>

        {isSuggestions ? (
          <SuggestionsView profile={profile} done={done} onDecide={decide} />
        ) : (
          <>
            <main className="flex min-w-0 flex-col gap-[16px]">
              {nav === 0 && <FeedView />}
              {nav === 1 && <MatchListView rail={railLabel} />}
              {nav === 2 && (
                <div className={'flex flex-col items-center gap-[12px] px-[32px] py-[64px] text-center ' + CARD}>
                  <h2 className="rebrand-display text-[30px] leading-[110%] text-[var(--text-default-body)]">Communities come next.</h2>
                  <p className="max-w-[44ch] text-[16px] leading-[145%] text-[var(--text-default-caption)]">
                    Rooms built around the things people keep meeting about. Nothing to join yet.
                  </p>
                </div>
              )}
            </main>
            <div className="max-[1000px]:hidden">
              <AsideColumn isFeed={nav === 0} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
