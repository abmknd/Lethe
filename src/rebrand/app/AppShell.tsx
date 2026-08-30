import { useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import { Avatar, AvatarStack } from './Avatar';
import { Brandmark } from '../brand';
import {
  BadgeButton, BadgeText, BODY_3A, BODY_4A, BODY_4B, BODY_5A, BODY_5B, BUTTON_2A, Button,
  ButtonText, Divider, NavItem, SectionLabel, Tag, TITLE_1, TITLE_3, TITLE_4B, TITLE_6,
} from './components';
import adamArt from '../assets/app/creation-of-adam.webp';
import {
  ApproximatelyEqualCircleIcon, Bookmark01Icon, Bookmark02Icon, BulbChargeingIcon,
  Calendar03Icon, CalendarFavorite02Icon, ChartRelationshipIcon, CheckmarkBadge02Icon,
  Clock03Icon, FavouriteIcon, GlobalIcon, Home01Icon, Linkedin02Icon, MailOpenIcon,
  Message01Icon, Message02Icon, MessageMultiple02Icon, MoreHorizontalCircle01Icon,
  Notification01Icon, PlusSignCircleIcon, PlusSignIcon, PuzzleIcon, SearchIcon,
  SearchingIcon, SentIcon, Setting03Icon, Share05Icon, SubstackIcon, UserAdd02Icon,
  UserCheck02Icon, UserGroupIcon, UserMultipleIcon, UserRemove02Icon, VolleyballIcon,
  Location09Icon,
} from '../../assets/system_icons';
import {
  COMMUNITY_RAIL, FAVES, FEED_RAIL, FOLLOW, MATCHES, MATCH_RAIL, ME, NAV, POSTS, PROFILES,
  type PersonRow, type Post, type Profile,
} from './appDemo';

/**
 * THE APP SHELL — `relethe-feed` 907:22311 (Matches) and 911:4246 (Suggested).
 *
 * A header, a three-column grid, and the views that swap inside it.
 *
 * ── How this was built, and how the last attempt was not ────────────────────
 *
 * Every number, token and glyph below comes from `get_design_context` on a
 * named node, which returns the file's real CSS and its exported assets. The
 * previous pass used `get_metadata` — boxes and positions only — and inferred
 * the rest. The result measured correctly and looked wrong in about a dozen
 * places at once, because geometry does not carry which token a fill is, which
 * of two `chat` glyphs a control uses, or that the emphasis in a signal bullet
 * is a colour change rather than a bold.
 *
 * Components live in ./components.tsx, one per Figma component, with the node
 * id on each. Nothing here re-implements one inline.
 *
 * ── The corrections, so they are not quietly re-made ────────────────────────
 *
 *   logo            the exported `brandmark_blue`, not seven circles I drew
 *   header controls `Badge Button`: white, 1px `text/neutral/deep`, 16px icon
 *   rail icons      eleven of eighteen were the wrong glyph. Explore is
 *                   `searching`, not `compass`; Activity is `clock-03`, not
 *                   `flash`; Matches is `puzzle`; the user-* and calendar and
 *                   checkmark-badge items are all the `-02` draw, not `-01`
 *   third rail      `Sidebar` has a `communities` type. It was never built
 *   banner          `card-playful-illustrated` is a BLUE card with the artwork
 *                   in `mix-blend-lighten`, white heading, Blue 200 body — not
 *                   a white card with a photo pasted on top
 *   tags            the role chip and the meeting formats are `default`
 *                   (Blue 50); only the interests are `neutral`
 *   list actions    follow / message are `Badge Button` `subtle`, 32 round on
 *                   Blue 50 — not a bordered white one
 *   section labels  12/16 Regular placeholder, not 13/16 Medium with tracking
 *   scrollbar       suppressed on the surface, per the source stylesheet
 */

const CARD = 'rounded-[16px] bg-[var(--surface-neutral-default)]';

// ---------------------------------------------------------------- header
//
// `app-header` 911:4247. 64 tall, `border/neutral/default` underneath, px-32,
// and both containers are flex-1 so the tab bar sits left and the controls sit
// hard right regardless of what either contains.

function TabBar({ active, onPick }: { active: number; onPick: (i: number) => void }) {
  return (
    <nav className="flex items-center gap-[2px]">
      {NAV.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => onPick(i)}
          aria-current={i === active ? 'page' : undefined}
          className={
            // No pill behind the selected tab: the file marks it with weight and
            // ink only. px-12 py-8 still, so the hit area is the full 32.
            'rounded-[var(--border-radius-round)] px-[12px] py-[8px] uppercase leading-[16px] ' +
            'text-[14px] transition-colors ' +
            (i === active
              ? 'font-medium tracking-[0px] text-[var(--text-default-heading)]'
              : 'font-normal text-[var(--text-default-placeholder)] hover:text-[var(--text-default-caption)]')
          }
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

function Header({ nav, onNav }: { nav: number; onNav: (i: number) => void }) {
  return (
    <header className="sticky top-0 z-40 flex h-[64px] items-center justify-between border-b border-[var(--border-neutral-default)] bg-[var(--surface-neutral-default)] px-[32px]">
      <div className="flex min-w-0 flex-1 items-center">
        {/* No gap: the frame butts the tab bar straight onto the 32 logo and
            lets the first toggle's own px-12 do the separating. */}
        <Brandmark size={32} />
        <div className="min-w-0 flex-1 max-[560px]:hidden">
          <TabBar active={nav} onPick={onNav} />
        </div>
      </div>
      <div className="flex flex-1 shrink-0 items-center justify-end gap-[14px]">
        <span className="max-[560px]:hidden">
          <Button tone="outline">INVITE</Button>
        </span>
        {/* Bell first, chat second, and the dot is on the chat — which is the
            order and the placement the frame draws, not the reverse. */}
        <BadgeButton label="Notifications" glyph={Notification01Icon} />
        <BadgeButton label="Messages" glyph={Message01Icon} dot />
        <button
          type="button"
          aria-label="Your profile"
          // `flex`, not `block`: an inline-block Avatar inside a block button
          // sits on a line box, and the baseline descender made a 32 control
          // measure 39.
          className="flex shrink-0 rounded-[var(--border-radius-round)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-primary-default)]"
        >
          <Avatar name={ME.avatar} person={ME.name} size="sm" />
        </button>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- rail
//
// `Sidebar` 907:22811 — three types, six items each, and EVERY glyph is the one
// the file places. This map is the whole correction: read it against the old
// one and eleven entries changed.

const RAIL_ICON: Record<string, typeof Home01Icon> = {
  // Type=feed, 795:3285
  'For you': Home01Icon,
  Following: UserMultipleIcon,
  Insights: ChartRelationshipIcon,
  Explore: SearchingIcon,
  Bookmarks: Bookmark01Icon,
  Activity: Clock03Icon,
  // Type=matches, 907:22812
  Matches: PuzzleIcon,
  Suggested: UserCheck02Icon,
  Upcoming: Calendar03Icon,
  Endorsed: CheckmarkBadge02Icon,
  Invited: UserAdd02Icon,
  Disavowed: UserRemove02Icon,
  // Type=communities, 908:22878
  Communities: UserGroupIcon,
  Invites: MailOpenIcon,
  'Open Spaces': VolleyballIcon,
  Events: CalendarFavorite02Icon,
  Manage: Setting03Icon,
  'Start a community': PlusSignCircleIcon,
};

function Rail({ items, active, onPick }: { items: readonly string[]; active: number; onPick: (i: number) => void }) {
  return (
    <aside className={'sticky top-[88px] flex w-[248px] flex-col gap-[4px] p-[8px] ' + CARD}>
      {items.map((label, i) => (
        <NavItem
          key={label}
          label={label}
          glyph={RAIL_ICON[label]}
          selected={i === active}
          onClick={() => onPick(i)}
        />
      ))}
    </aside>
  );
}

// ---------------------------------------------------------------- feed
//
// No frame draws the post feed, so it is built from the parts the frames do
// draw: the same 20 padding, the same `Divider` between rows, the same Avatar
// and type scale as a match row.

function PostActions({ post }: { post: Post }) {
  const act =
    'flex items-center gap-[8px] rounded-[var(--border-radius-round)] px-[12px] py-[8px] ' +
    'text-[var(--text-default-caption)] transition-colors hover:bg-[var(--surface-neutral-subtle)] ' + BODY_4B;
  const round =
    'grid size-[32px] place-items-center rounded-[var(--border-radius-round)] ' +
    'text-[var(--text-default-caption)] transition-colors hover:bg-[var(--surface-neutral-subtle)]';
  return (
    <div className="mt-[12px] flex items-center justify-between gap-[16px]">
      <div className="flex items-center gap-[4px]">
        <button type="button" aria-label="Like" className={act}><Icon as={FavouriteIcon} size={16} />{post.likes}</button>
        <button type="button" aria-label="Reply" className={act}><Icon as={MessageMultiple02Icon} size={16} />{post.replies}</button>
        <button type="button" aria-label="Echo" className={act}><Icon as={ApproximatelyEqualCircleIcon} size={16} />{post.echoes}</button>
      </div>
      <div className="flex items-center gap-[4px]">
        <button type="button" aria-label="Bookmark" className={round}><Icon as={Bookmark02Icon} size={16} /></button>
        <button type="button" aria-label="Share" className={round}><Icon as={Share05Icon} size={16} /></button>
      </div>
    </div>
  );
}

function FeedView() {
  return (
    <div className={'overflow-hidden ' + CARD}>
      <button
        type="button"
        className="flex w-full items-center gap-[12px] p-[20px] text-left transition-colors hover:bg-[var(--surface-neutral-subtle)]"
      >
        <Avatar name={ME.avatar} person={ME.name} size="lg" />
        <span className={'min-w-0 flex-1 text-[var(--text-default-placeholder)] ' + BODY_3A}>What&rsquo;s up?</span>
        <span className="grid size-[32px] shrink-0 place-items-center rounded-[var(--border-radius-round)] text-[var(--icons-primary-default)]">
          <Icon as={SentIcon} size={20} />
        </span>
      </button>
      <Divider />

      {POSTS.map((post, i) => (
        <article
          key={post.handle + post.time}
          className={
            'flex flex-col p-[20px] ' +
            // The rule belongs to the row, as an inset ring — a Divider as a
            // sibling would add its 1px to the row's height and push a 216
            // frame to 217.
            (i < POSTS.length - 1 ? 'shadow-[inset_0_-1px_0_0_var(--border-neutral-default)]' : '')
          }
        >
          <div className="flex items-start justify-between gap-[12px]">
            <div className="flex min-w-0 items-center gap-[12px]">
              <Avatar name={post.avatar} person={post.name} size="lg" />
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-[6px]">
                  <span className={'truncate text-[var(--text-default-heading)] ' + TITLE_3}>{post.name}</span>
                  {/* A time is a caption, not a status, so it stays plain text.
                      `Badge Text` is reserved for the thing the match rows use
                      it for. */}
                  <span className={'shrink-0 text-[var(--text-default-placeholder)] ' + BODY_4A}>{post.time}</span>
                </div>
                <span className={'truncate text-[var(--text-default-placeholder)] ' + BODY_4A}>{post.handle}</span>
              </div>
            </div>
            <button
              type="button"
              aria-label="More"
              className="grid size-[32px] shrink-0 place-items-center rounded-[var(--border-radius-round)] text-[var(--text-default-placeholder)] transition-colors hover:bg-[var(--surface-neutral-subtle)]"
            >
              <Icon as={MoreHorizontalCircle01Icon} size={16} />
            </button>
          </div>

          <p className={'pb-[18px] pt-[14px] text-[var(--text-default-heading)] ' + BODY_3A}>{post.body}</p>

          {post.media && (
            <img src={post.media} alt="" className="mb-[4px] block h-[300px] w-full rounded-[12px] object-cover" />
          )}

          <PostActions post={post} />
        </article>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- matches
//
// `main-content` 908:23113. invite-top-bar, then one `post-N` per row: p-20,
// a `Divider` beneath, and a signal banner that is TEXT ONLY — the bulb I had
// in there is not in the frame.

function MatchListView({ rail }: { rail: string }) {
  const list = rail === 'Upcoming' ? MATCHES.filter((m) => m.status === 'Upcoming') : MATCHES;
  return (
    <div className={'overflow-hidden ' + CARD}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-[16px] px-[22px] py-[16px] text-left transition-colors hover:bg-[var(--surface-neutral-subtle)]"
      >
        <span className={'text-[var(--text-default-heading)] ' + TITLE_3}>Invite someone</span>
        <Icon as={PlusSignIcon} size={16} className="text-[var(--icons-neutral-default)]" />
      </button>
      <Divider />

      {list.map((m, i) => (
        <article
          key={m.handle}
          className={
            // `post-N` 908:23117 carries its own border-b. As an inset ring so
            // the row stays 216 rather than 217.
            'flex flex-col p-[20px] ' +
            (i < list.length - 1 ? 'shadow-[inset_0_-1px_0_0_var(--border-neutral-default)]' : '')
          }
        >
          <div className="flex items-start justify-between gap-[12px]">
            <div className="flex min-w-0 items-center gap-[12px]">
              <Avatar name={m.avatar} person={m.name} size="lg" />
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-[6px]">
                  <span className={'truncate text-[var(--text-default-heading)] ' + TITLE_3}>{m.name}</span>
                  <BadgeText tone={m.status === 'Upcoming' ? 'primary' : 'neutral'}>{m.status}</BadgeText>
                </div>
                <span className={'truncate text-[var(--text-default-placeholder)] ' + BODY_4A}>{m.handle}</span>
              </div>
            </div>
            <Button tone="neutral" size="sm">message</Button>
          </div>

          <p className={'pb-[18px] pt-[14px] text-[var(--text-default-heading)] ' + BODY_3A}>{m.about}</p>

          <div className="flex items-center rounded-[12px] bg-[var(--surface-primary-subtle)] px-[14px] py-[12px]">
            {/* The date reads as a link inside the sentence, which is why
                `signal` is three pieces rather than one string. */}
            <p className={'flex-1 text-[var(--text-default-heading)] ' + BODY_4A}>
              {m.signal.pre}
              <span className="text-[var(--text-default-highlight-blue)]">{m.signal.link}</span>
              {m.signal.post}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- suggestions
//
// `profile-detail-card` 918:6192. 760 wide: left 459, a vertical Divider, right
// 300. Padding is 20 everywhere except the two sections that close a column,
// which take 24 at the bottom.

const SOCIALS = [
  { label: 'LinkedIn', glyph: Linkedin02Icon },
  { label: 'Personal website', glyph: GlobalIcon },
  { label: 'Substack', glyph: SubstackIcon },
] as const;

function SuggestionsView({ profile, done, onDecide }: { profile: Profile; done: number; onDecide: () => void }) {
  const first = profile.name.split(' ')[0];
  return (
    <div className="flex min-w-0 flex-col gap-[20px]">
      {/* prompt-banner: 40 tall, the heading 24 of it. */}
      <div className="flex h-[40px] items-center justify-center text-center">
        <h1 className={'text-[var(--text-default-heading)] ' + TITLE_1}>
          Would you like to meet{' '}
          <span className="text-[var(--text-default-highlight-blue)]">{profile.name}?</span>
        </h1>
      </div>

      <div className={'flex flex-col overflow-hidden ' + CARD}>
        <div className="flex items-stretch max-[1000px]:flex-col">
          {/* left-profile-info 918:6194 */}
          <div className="flex min-w-0 flex-[1_1_459px] flex-col">
            <div className="flex items-start gap-[16px] p-[20px]">
              <Avatar name={profile.avatar} person={profile.name} size="xxl" />
              <div className="flex min-w-0 flex-1 flex-col gap-[12px] pt-[4px]">
                <h2 className="text-[20px] font-medium leading-[20px] text-[var(--text-default-heading)]">
                  {profile.name}
                </h2>
                <div className="flex flex-col items-start gap-[12px]">
                  {/* The role chip is Tag `default` — Blue 50. It was neutral. */}
                  <Tag>{profile.role}</Tag>
                  {/* `location-meta` 872:14535: a 16 glyph, a 4 gap, 13/16 Light.
                      One item only. The frame's separator beside it is
                      hidden="true" and pronouns and birthday are gone, neither
                      having a column behind it (docs/backend-gaps.md 2b). */}
                  <span className={'flex items-center gap-[4px] whitespace-nowrap text-[var(--text-default-placeholder)] ' + BODY_5B}>
                    <Icon as={Location09Icon} size={16} />
                    {profile.city}
                  </span>
                </div>
              </div>
            </div>

            <Divider />

            <section className="flex flex-col gap-[8px] p-[20px]">
              <SectionLabel>ABOUT</SectionLabel>
              <p className={'text-[var(--text-default-heading)] ' + BODY_3A}>{profile.about}</p>
            </section>

            <Divider />

            <section className="flex flex-col gap-[10px] p-[20px]">
              <SectionLabel>COMMON INTEREST</SectionLabel>
              <div className="flex flex-wrap gap-[8px]">
                {profile.interests.map((t) => <Tag key={t} tone="neutral">{t}</Tag>)}
              </div>
            </section>

            <Divider />

            <section className="flex flex-col gap-[10px] px-[20px] pb-[24px] pt-[20px]">
              <div className={'flex items-center justify-between gap-[16px] py-[2px] whitespace-nowrap ' + TITLE_6}>
                <span className="text-[var(--text-default-placeholder)]">MEETING FORMAT</span>
                <span className="text-[var(--text-default-subtle)]">{first}&rsquo;s preference</span>
              </div>
              <div className="flex flex-wrap gap-[8px]">
                {profile.formats.map((f) => <Tag key={f}>{f}</Tag>)}
              </div>
            </section>
          </div>

          <Divider vertical />

          {/* right-profile-sidebar 918:6255 — 300 wide */}
          <div className="flex w-[300px] shrink-0 flex-col max-[1000px]:w-auto">
            <section className="flex flex-col gap-[14px] bg-[var(--surface-primary-subtle)] p-[20px]">
              <div className="flex items-start gap-[6px]">
                {/* Figma places the 32px variant, drawn at Weight=2px. */}
                <Icon as={BulbChargeingIcon} size={32} strokeWidth={2} className="text-[var(--icons-primary-default)]" />
                <span className="flex flex-col gap-[4px]">
                  <span className={'text-[var(--text-default-highlight-blue)] ' + BUTTON_2A}>SIGNAL</span>
                  <span className={'text-[var(--text-default-placeholder)] ' + BODY_5B}>
                    What you and {first} have in common
                  </span>
                </span>
              </div>
              <div className="flex flex-col gap-[10px]">
                {profile.bullets.map((b) => (
                  <div key={b.emph} className="flex items-start gap-[10px]">
                    <span className="mt-[7px] size-[5px] shrink-0 rounded-full bg-[var(--text-default-body)]" />
                    {/* The emphasis is a COLOUR step, placeholder up to body —
                        not a bold. It was rendering semibold. */}
                    <p className={'text-[var(--text-default-placeholder)] ' + BODY_4A}>
                      {b.pre}<span className="text-[var(--text-default-body)]">{b.emph}</span>{b.post}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-[12px] p-[20px]">
              <SectionLabel>ENDORSED BY</SectionLabel>
              <div className="flex h-[32px] items-end gap-[8px]">
                <AvatarStack people={profile.endorsers} size="md" />
                <span className="flex min-w-0 flex-1 items-center gap-[2px]">
                  <span className={'shrink-0 text-[var(--text-default-caption)] ' + TITLE_4B}>{profile.endorseName}</span>
                  <span className={'min-w-0 flex-1 text-[var(--text-default-placeholder)] ' + BODY_5A}>
                    {' '}{profile.endorseRest}
                  </span>
                </span>
              </div>
            </section>

            <Divider />

            <section className="flex flex-col gap-[12px] p-[20px]">
              <SectionLabel>SOCIALS</SectionLabel>
              <div className="flex flex-wrap items-center gap-[12px]">
                {SOCIALS.map(({ label, glyph }) => (
                  <BadgeButton key={label} label={label} glyph={glyph} tone="subtle" />
                ))}
              </div>
            </section>
            <div className="flex-1" />
          </div>
        </div>

        {/* bottom-bar 918:6317: 74 tall including its own top rule, which is a
            `border-t` on the bar rather than a separate Divider — as an inset
            ring so the 1px does not push the bar to 75. */}
        <div className="flex items-center justify-between px-[24px] pb-[24px] pt-[18px] shadow-[inset_0_1px_0_0_var(--border-neutral-default)]">
          <div className="flex items-center gap-[12px]">
            <span className="text-[13px] font-medium uppercase tracking-[1px] text-[var(--text-default-subtle)]">
              DAILY GOAL
            </span>
            <div className="flex items-center gap-[5px]">
              {Array.from({ length: 10 }, (_, i) => (
                <span
                  key={i}
                  className={
                    'size-[8px] rounded-full ' +
                    (i < done ? 'bg-[var(--surface-primary-default)]' : 'bg-[var(--border-neutral-subtle)]')
                  }
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-[12px]">
            <Button tone="subtle" onClick={onDecide}>PASS</Button>
            <Button tone="fill" onClick={onDecide}>MATCH</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- aside
//
// `right-sidebar` 907:22404 — 320 wide, gap 20 between its three cards.

/**
 * `card-playful-illustrated` 907:22465.
 *
 * A BLUE card. The artwork sits on top of Blue 600 in `mix-blend-lighten`,
 * which is what turns a Renaissance fresco into brand-coloured artwork rather
 * than a photograph pasted on a card. The heading is white, the body is Blue
 * 200, and the action is a white-filled outline button so the blue does not
 * read through it.
 *
 * What was here before was a white card with the image on top and a plain
 * outline button — the same parts, none of the treatment.
 *
 * `isolate` on the card so the blend resolves against THIS card's blue and
 * stops there, rather than reaching down to the page behind it.
 */
function PromoCard({ title, body, action }: { title: string; body: ReactNode; action: string }) {
  return (
    <div className="isolate flex w-full flex-col overflow-hidden rounded-[16px] border border-[var(--border-neutral-default)] bg-[var(--surface-primary-default)]">
      <div className="relative h-[140px] w-full overflow-hidden mix-blend-lighten">
        <img src={adamArt} alt="" className="absolute left-0 top-[-52.55%] h-[227.84%] w-full max-w-none object-cover" />
      </div>
      <div className="flex flex-col gap-[16px] px-[20px] pb-[24px] pt-[16px]">
        <div className="flex flex-col gap-[8px]">
          <p className={'text-[var(--text-neutral-heading)] ' + TITLE_1}>{title}</p>
          <p className={'text-[var(--text-neutral-hover)] ' + BODY_3A}>{body}</p>
        </div>
        <div className="flex items-center justify-between">
          <Button tone="outline-on-color">{action}</Button>
        </div>
      </div>
    </div>
  );
}

/**
 * `your-faves` 936:8392, and the feed's `who-to-follow` on the same shape.
 *
 * The action is a `Badge Button` on `surface/primary/subtle` — a 32 round in
 * Blue 50 with no border, carrying a 16 glyph. Both cards were rendering a
 * white bordered control with the wrong glyph inside it.
 */
function PeopleCard({
  title, people, action, actionLabel,
}: {
  title: string;
  people: PersonRow[];
  action: typeof Message02Icon;
  actionLabel: (name: string) => string;
}) {
  return (
    <div className={'flex w-full flex-col ' + CARD}>
      <div className="flex items-center justify-between px-[16px] py-[20px]">
        <span className={'text-[var(--text-default-heading)] ' + TITLE_1}>{title}</span>
        <ButtonText>See all</ButtonText>
      </div>
      <div className="flex flex-col pb-[12px]">
        {people.map((p) => (
          <div key={p.handle} className="flex flex-col gap-[8px] px-[16px] py-[8px]">
            <div className="flex items-start justify-between gap-[8px]">
              <div className="flex min-w-0 items-center gap-[6px]">
                <Avatar name={p.avatar} person={p.name} size="lg" />
                <span className="flex min-w-0 flex-col">
                  <span className={'truncate text-[var(--text-default-heading)] ' + TITLE_4B}>{p.name}</span>
                  <span className={'truncate text-[var(--text-default-placeholder)] ' + BODY_4A}>{p.handle}</span>
                </span>
              </div>
              <BadgeButton label={actionLabel(p.name)} glyph={action} tone="subtle" />
            </div>
            <BadgeText>{p.note}</BadgeText>
          </div>
        ))}
      </div>
    </div>
  );
}

function AsideColumn({ isFeed }: { isFeed: boolean }) {
  return (
    <aside className="sticky top-[88px] flex w-[320px] flex-col gap-[20px] max-[1000px]:w-auto">
      {/* search-bar 907:22405: a 44 pill, px-12 py-10, and the glyph is MIRRORED
          in the file — the handle points the other way. */}
      <div className={'flex items-center gap-[6px] rounded-[40px] px-[12px] py-[10px] ' + CARD}>
        <span className="grid size-[24px] shrink-0 place-items-center rounded-[36px] p-[4px] text-[var(--icons-neutral-default)]">
          <Icon as={SearchIcon} size={16} className="-scale-x-100" />
        </span>
        <input
          placeholder="Search"
          aria-label="Search"
          className={
            'min-w-0 flex-1 bg-transparent text-[var(--text-default-body)] outline-none ' +
            'placeholder:text-[var(--text-default-placeholder)] ' + BODY_3A
          }
        />
      </div>

      {isFeed ? (
        <>
          <PromoCard
            title="Invite someone"
            action="INVITE"
            body="Help grow the Relethe community by bringing on someone you know. Earn 3 karmas when they sign up, and 6 more when they take their first meeting."
          />
          {/* No frame draws `who-to-follow`, so only the glyph is a judgement:
              the component, its fill and its size come from `your-faves`, and
              `user-add-02` is the library's follow glyph. Reusing the faves
              `chat` here would put a message action on a follow card. */}
          <PeopleCard
            title="Who to follow"
            people={FOLLOW}
            action={UserAdd02Icon}
            actionLabel={(n) => `Follow ${n}`}
          />
        </>
      ) : (
        <>
          <PromoCard
            title="Activate Superconnector"
            action="INVITE"
            body="Set your own standards for who reaches you, meet beyond your weekly ten, and let the engine work a wider circle on your behalf."
          />
          <PeopleCard
            title="Your faves"
            people={FAVES}
            action={Message02Icon}
            actionLabel={(n) => `Message ${n}`}
          />
        </>
      )}
    </aside>
  );
}

// ---------------------------------------------------------------- shell

const RAILS = [FEED_RAIL, MATCH_RAIL, COMMUNITY_RAIL] as const;

export function AppShell() {
  const [nav, setNav] = useState(0);
  const [rail, setRail] = useState(0);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(1);

  const railItems = RAILS[nav] ?? FEED_RAIL;
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

      {/* app-grid: 1080 with 24 padding and 24 gaps. 248 + 416 + 320 is what
          those numbers leave for the three columns at full width. */}
      <div
        className={
          'mx-auto grid max-w-[1080px] items-start gap-[24px] p-[24px] pb-[80px] ' +
          (isSuggestions
            ? 'grid-cols-[248px_minmax(0,1fr)] max-[740px]:grid-cols-[minmax(0,1fr)]'
            : 'grid-cols-[248px_minmax(0,1fr)_320px] max-[1000px]:grid-cols-[248px_minmax(0,1fr)] max-[740px]:grid-cols-[minmax(0,1fr)]')
        }
      >
        <div className="max-[740px]:hidden">
          <Rail items={railItems} active={rail} onPick={setRail} />
        </div>

        {isSuggestions ? (
          <SuggestionsView profile={profile} done={done} onDecide={decide} />
        ) : (
          <>
            <main className="flex min-w-0 flex-col gap-[20px]">
              {nav === 0 && <FeedView />}
              {nav === 1 && <MatchListView rail={railLabel} />}
              {nav === 2 && (
                <div className={'flex flex-col items-center gap-[12px] px-[32px] py-[64px] text-center ' + CARD}>
                  <h2 className="rebrand-display text-[30px] leading-[110%] text-[var(--text-default-heading)]">
                    Communities come next.
                  </h2>
                  <p className={'max-w-[44ch] text-[var(--text-default-caption)] ' + BODY_3A}>
                    Rooms built around the things people keep meeting about. The rail is real; nothing to join yet.
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
