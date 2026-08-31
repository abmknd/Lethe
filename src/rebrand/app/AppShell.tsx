import type { ReactNode } from 'react';
import { Brandmark } from '../brand';
import {
  Avatar, AvatarStack, BadgeButton, BadgeText, BODY_3A, BODY_4A, BODY_5A, BODY_5B,
  Button, ButtonText, Divider, Icon, NavItem,
  SectionLabel, Sidebar, SuggestedProfile, TabBar as TabBarRow, Tag, TITLE_1, TITLE_3,
  TITLE_4B, TITLE_6,
  ToggleButton,
} from '../ds';
import adamArt from '../assets/app/creation-of-adam.webp';
import cafeArt from '../assets/app/cafe-illustration.webp';
import studioArt from '../assets/app/architectural-studio.webp';
import {
  ApproximatelyEqualCircleIcon, Bookmark01Icon, Bookmark02Icon,
  Calendar03Icon, CalendarFavorite02Icon, ChartRelationshipIcon, CheckmarkBadge02Icon,
  Clock03Icon, FavouriteIcon, GlobalIcon, Home01Icon, Linkedin02Icon, MailOpenIcon,
  Message01Icon, Message02Icon, MessageMultiple02Icon, MoreHorizontalCircle01Icon,
  Notification01Icon, PlusSignCircleIcon, PlusSignIcon, PuzzleIcon, SearchIcon,
  SearchingIcon, SentIcon, Setting03Icon, Share05Icon, SubstackIcon, UserAdd02Icon,
  UserCheck02Icon, UserGroupIcon, UserMultipleIcon, UserRemove02Icon, VolleyballIcon,
} from '../../assets/system_icons';
import {
  FAVES, FEED_RAIL, FOLLOW, MATCHES, ME, NAV, POSTS, RAILS,
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

/** The header's `Tab Bar` 843:3146 — Toggle Buttons on `Type=transparent,
 *  Style=nav`, so the selected tab is marked by weight and ink with no pill
 *  behind it. Both components come from the library; nothing is redrawn here. */
function AppTabBar({ active, onPick }: { active: number; onPick: (i: number) => void }) {
  return (
    <TabBarRow label="Sections">
      {NAV.map((label, i) => (
        <ToggleButton key={label} active={i === active} onClick={() => onPick(i)}>
          {label}
        </ToggleButton>
      ))}
    </TabBarRow>
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
          <AppTabBar active={nav} onPick={onNav} />
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
    <div className="sticky top-[88px]">
      <Sidebar>
        {items.map((label, i) => (
          <NavItem
            key={label}
            label={label}
            glyph={RAIL_ICON[label]}
            selected={i === active}
            onClick={() => onPick(i)}
          />
        ))}
      </Sidebar>
    </div>
  );
}

// ---------------------------------------------------------------- feed
//
// `relethe-feed` 750:184 — a real frame, which the previous pass did not open.
// Everything below is that frame rather than a guess assembled from the match
// list, which is what was here and why the spacing, the type and the action bar
// were all slightly off at once.
//
// The structure the frame names, and it matters because the 8 is between the
// two of them rather than around any one part:
//
//     post-N  p-20, gap 8, border-b
//       post-content   gap 16
//         post-header  ·  post-caption  ·  post-media
//       action-bar     28 tall

function PostActions({ post }: { post: Post }) {
  // Every action is p-6 around a 16 glyph — a 28 control, not 32 or 36 — and
  // the count is Body 5B (13/16 Light) in `icons/disabled/default`.
  const act =
    'flex items-center gap-[6px] rounded-[40px] p-[6px] text-[var(--icons-disabled-default)] ' +
    'transition-colors hover:bg-[var(--surface-neutral-subtle)] ' + BODY_5B;
  const round =
    'grid size-[28px] place-items-center rounded-[36px] text-[var(--icons-neutral-default)] ' +
    'transition-colors hover:bg-[var(--surface-neutral-subtle)]';
  return (
    <div className="flex w-full items-center justify-between gap-[16px]">
      <div className="flex items-start gap-[6px]">
        <button type="button" aria-label="Like" className={act}><Icon as={FavouriteIcon} size={16} />{post.likes}</button>
        <button type="button" aria-label="Reply" className={act}><Icon as={MessageMultiple02Icon} size={16} />{post.replies}</button>
        <button type="button" aria-label="Echo" className={act}><Icon as={ApproximatelyEqualCircleIcon} size={16} />{post.echoes}</button>
      </div>
      <div className="flex items-start gap-[6px]">
        <button type="button" aria-label="Bookmark" className={round}><Icon as={Bookmark02Icon} size={16} /></button>
        <button type="button" aria-label="Share" className={round}><Icon as={Share05Icon} size={16} /></button>
      </div>
    </div>
  );
}

function FeedView() {
  return (
    <div className={'overflow-hidden ' + CARD}>
      {/* composer-bar 750:222: px-16 py-12 around a 40 avatar — 64 tall — with
          its own bottom rule, an 18px placeholder, and a 20 `sent` centred in a
          24 box. */}
      <button
        type="button"
        className="flex w-full items-center justify-between px-[16px] py-[12px] text-left shadow-[inset_0_-1px_0_0_var(--border-neutral-default)] transition-colors hover:bg-[var(--surface-neutral-subtle)]"
      >
        <span className="flex min-w-0 items-center gap-[12px]">
          <Avatar name={ME.avatar} person={ME.name} size="lg" />
          <span className="truncate text-[18px] font-normal text-[var(--text-default-placeholder)]">
            What&rsquo;s up?
          </span>
        </span>
        <span className="grid size-[24px] shrink-0 place-items-center text-[var(--icons-neutral-default)]">
          <Icon as={SentIcon} size={20} />
        </span>
      </button>

      {POSTS.map((post, i) => (
        <article
          key={post.handle + post.time}
          className={
            'flex flex-col gap-[8px] p-[20px] ' +
            // The rule belongs to the row, as an inset ring — a Divider as a
            // sibling would add its 1px to the row's height and push a 212
            // frame to 213.
            (i < POSTS.length - 1 ? 'shadow-[inset_0_-1px_0_0_var(--border-neutral-default)]' : '')
          }
        >
          <div className="flex w-full flex-col gap-[16px]">
            {/* post-header 750:229 */}
            <div className="flex w-full items-start justify-between gap-[12px]">
              <div className="flex min-w-0 items-center gap-[6px]">
                <Avatar name={post.avatar} person={post.name} size="lg" />
                <div className="flex min-w-0 flex-col">
                  {/* authorship: name and time on ONE line, separated by a 4px
                      `icons/neutral/subtle` dot. The handle goes underneath. */}
                  <div className="flex items-center gap-[6px]">
                    <span className={'truncate text-[var(--text-default-heading)] ' + TITLE_4B}>{post.name}</span>
                    <span aria-hidden className="size-[4px] shrink-0 rounded-[6px] bg-[var(--icons-neutral-subtle)]" />
                    <span className={'shrink-0 text-[var(--text-default-placeholder)] ' + BODY_4A}>{post.time}</span>
                  </div>
                  <span className={'truncate text-[var(--text-default-placeholder)] ' + BODY_4A}>{post.handle}</span>
                </div>
              </div>
              <button
                type="button"
                aria-label="More"
                className="flex shrink-0 items-center justify-center text-[var(--icons-neutral-default)]"
              >
                <Icon as={MoreHorizontalCircle01Icon} size={16} />
              </button>
            </div>

            {/* post-caption 762:2474 — Body 3A in `text/default/body`. */}
            <p className={'w-full text-[var(--text-default-body)] ' + BODY_3A}>{post.body}</p>

            {post.media && (
              <img src={post.media} alt="" className="block h-[300px] w-full rounded-[12px] object-cover" />
            )}
          </div>

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
                  {/* Upcoming is `status=default` (Blue 50 / Blue 600) in the
                      frame; Met reads green there, so it is the success
                      status. */}
                  <BadgeText tone={m.status === 'Upcoming' ? 'primary' : 'success'}>{m.status}</BadgeText>
                </div>
                <span className={'truncate text-[var(--text-default-placeholder)] ' + BODY_4A}>{m.handle}</span>
              </div>
            </div>
            {/* The same control `your-faves` uses: `Badge Button` `outline`
                with `message-02`. It was a text pill reading "message". */}
            <BadgeButton label={`Message ${m.name}`} glyph={Message02Icon} tone="outline" />
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
// `relethe-feed` 956:12189 — A COMPLETE REDESIGN of the Suggested card, not a
// revision of 911:4246. What changed, since almost none of the old card
// survived:
//
//   heading     "Would you like to meet X?" is GONE. The frame still carries
//               the text node, set hidden="true"
//   banner      NEW. A 130-tall `prompt-banner` on `surface/neutral/default-
//               hover` showing a band of a 760 square artwork
//   avatar      88, centred, and lifted -57 so it straddles the banner edge.
//               It was 72 and sat top-left
//   identity    name and role are CENTRED under the avatar. They were a
//               left-aligned column beside it
//   about       centred, full width, px-32, and promoted ABOVE the columns.
//               It used to be the first section of the left column
//   signal      moved OUT of the right column to a full-width 760 band below
//               both columns, its header hidden — no bulb, no SIGNAL label,
//               just the bullets. Body went 14/20 to 16/20
//   location    dropped from the card entirely
//   columns     left is now interests + formats only; right is endorsed +
//               socials only
//
// The whole thing is one 16-radius card: `main-content` 956:12203 owns the
// background and the clip, so the banner needs no radius of its own.

/** Keyed, so a profile names which socials it has rather than the view always
 *  drawing all three. A live record under the blind gate has none. */
const SOCIALS = {
  linkedin: { label: 'LinkedIn', glyph: Linkedin02Icon },
  website: { label: 'Personal website', glyph: GlobalIcon },
  substack: { label: 'Substack', glyph: SubstackIcon },
} as const;

export type SocialKey = keyof typeof SOCIALS;

/**
 * `prompt-banner` 956:12204.
 *
 * Figma lays a 760x760 artwork at `bottom:-358.5` inside a 130-tall window, so
 * only the band at y 271.5..401.5 is ever seen. THE ASSET IS PRE-CROPPED TO
 * THAT BAND — it is dithered micro-dot artwork, which is the worst case for
 * lossy compression, and the full square would not go below 470KB where the
 * band lands at 191. If the offset moves in Figma, re-crop: the band is
 * `y = 271.5/760` to `401.5/760` of the square.
 */
function PromptBanner() {
  return (
    <div className="h-[130px] w-full shrink-0 overflow-hidden border border-[var(--border-neutral-default)] bg-[var(--surface-neutral-default-hover)]">
      <img src={studioArt} alt="" className="size-full object-cover" />
    </div>
  );
}

function SuggestionsView({
  profile, done, onPass, onMatch, busy = false,
}: {
  profile: Profile;
  /** How many of the ten daily dots are spent. */
  done: number;
  onPass: () => void;
  onMatch: () => void;
  /** A decision is in flight; both buttons lock so it cannot be double-sent. */
  busy?: boolean;
}) {
  const first = profile.name.split(' ')[0];
  return (
    <div className="flex min-w-0 flex-col">
      {/* main-content 956:12203 — one card, and it owns the clip. */}
      <div className={'flex flex-col overflow-hidden ' + CARD}>
        <PromptBanner />

        {/* top-info-block 956:12619 */}
        <div className="relative flex w-full flex-col items-center px-[20px] pb-[20px] pt-[40px]">
          {/* The avatar straddles the banner edge. 336 of 760 is dead centre
              for an 88, so this is a centred element in the file rather than a
              nudged one — translate, not a magic left. */}
          {/* `Suggested-Profile` 972:13736 — the 88 avatar AND the bubble that
              carries "Would you like to meet?". The question came back in the
              redesign as this component rather than as the old banner heading,
              and it no longer repeats the name, which is the h2 right below. */}
          <div className="absolute left-1/2 top-[-57px] flex -translate-x-1/2">
            <SuggestedProfile name={profile.name} avatar={profile.avatar} src={profile.avatarSrc} />
          </div>

          <div className="flex w-full flex-col items-center gap-[12px] pt-[4px]">
            <p className="text-center text-[20px] font-medium leading-[20px] text-[var(--text-default-heading)]">
              {profile.name}
            </p>
            {profile.role && (
              <div className="flex w-full items-center justify-center">
                <Tag>{profile.role}</Tag>
              </div>
            )}
          </div>

          {profile.about && (
            <div className="flex w-full flex-col px-[32px] pt-[20px]">
              <p className={'w-full text-center text-[var(--text-default-heading)] ' + BODY_3A}>
                {profile.about}
              </p>
            </div>
          )}
        </div>

        {/* profile-detail-card 956:12207 */}
        <Divider />

        <div className="flex items-stretch max-[1000px]:flex-col">
          {/* left-profile-info 956:12209 */}
          <div className="flex min-w-0 flex-[1_1_459px] flex-col">
            {profile.interests.length > 0 && (
              <section className="flex flex-col gap-[10px] p-[20px]">
                <SectionLabel>COMMON INTEREST</SectionLabel>
                <div className="flex flex-wrap gap-[8px]">
                  {profile.interests.map((t) => <Tag key={t} tone="neutral">{t}</Tag>)}
                </div>
              </section>
            )}

            {profile.interests.length > 0 && profile.formats.length > 0 && <Divider />}

            {profile.formats.length > 0 && (
              <section className="flex flex-col gap-[10px] px-[20px] pb-[24px] pt-[20px]">
                <div className={'flex items-center justify-between gap-[16px] whitespace-nowrap py-[2px] ' + TITLE_6}>
                  <span className="text-[var(--text-default-placeholder)]">MEETING FORMAT</span>
                  <span className="text-[var(--text-default-subtle)]">{first}&rsquo;s preference</span>
                </div>
                <div className="flex flex-wrap gap-[8px]">
                  {profile.formats.map((f) => <Tag key={f}>{f}</Tag>)}
                </div>
              </section>
            )}
          </div>

          <Divider vertical />

          {/* right-profile-sidebar 956:12248 — 300 wide */}
          <div className="flex w-[300px] shrink-0 flex-col max-[1000px]:w-auto">
            {profile.endorsers.length > 0 && (
              <section className="flex flex-col gap-[12px] p-[20px]">
                <SectionLabel>ENDORSED BY</SectionLabel>
                <div className="flex h-[32px] items-end gap-[8px]">
                  <AvatarStack people={profile.endorsers} size="md" />
                  <span className="flex min-w-0 flex-1 items-center gap-[2px]">
                    <span className={'shrink-0 text-[var(--text-default-caption)] ' + TITLE_4B}>
                      {profile.endorseName}
                    </span>
                    <span className={'min-w-0 flex-1 text-[var(--text-default-placeholder)] ' + BODY_5A}>
                      {' '}{profile.endorseRest}
                    </span>
                  </span>
                </div>
              </section>
            )}

            {profile.endorsers.length > 0 && profile.socials.length > 0 && <Divider />}

            {profile.socials.length > 0 && (
              <section className="flex flex-col gap-[12px] p-[20px]">
                <SectionLabel>SOCIALS</SectionLabel>
                <div className="flex flex-wrap items-center gap-[12px]">
                  {/* The one place the file uses PRIMARY ink on a subtle fill.
                      Every other Badge Button in the app is neutral. */}
                  {profile.socials.map((key) => (
                    <BadgeButton
                      key={key}
                      label={SOCIALS[key].label}
                      glyph={SOCIALS[key].glyph}
                      tone="subtle"
                      ink="primary"
                    />
                  ))}
                </div>
              </section>
            )}
            <div className="flex-1" />
          </div>
        </div>

        {/* signal-section 967:12761 — FULL WIDTH now, below both columns, and
            its header is hidden in the frame: no bulb, no SIGNAL label. The
            bullets carry it alone, at 16/20 rather than the old 14/20. */}
        {profile.bullets.length > 0 && (
          <section className="flex flex-col gap-[14px] bg-[var(--surface-primary-subtle)] p-[20px]">
            <div className="flex flex-col gap-[10px]">
              {profile.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-[10px]">
                  <span className="flex shrink-0 items-start pt-[7px]">
                    <span className="size-[5px] rounded-full bg-[var(--text-default-body)]" />
                  </span>
                  {/* The emphasis is a COLOUR step, placeholder up to heading —
                      not a bold. */}
                  <p className={'min-w-0 flex-1 text-[var(--text-default-placeholder)] ' + BODY_3A}>
                    {b.pre}
                    <span className="text-[var(--text-default-heading)]">{b.emph}</span>
                    {b.post}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* bottom-bar 956:12286 — its top rule is a border on the bar, as an
            inset ring so the 1px does not push 74 to 75. */}
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
            <Button tone="subtle" onClick={onPass} disabled={busy}>PASS</Button>
            <Button tone="fill" onClick={onMatch} disabled={busy}>MATCH</Button>
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
 * `card-playful-illustrated` — TWO DIFFERENT CARDS, not one reused.
 *
 * The previous pass drew the Matches card in both places. They share a skeleton
 * (a 140 image, then gap-16 / px-20 / pt-16 / pb-24 content, then an action row)
 * and agree on nothing else:
 *
 *              feed 877:18748              matches 907:22465
 *   surface    Blue 50                     Blue 600
 *   artwork    cafe, plain                 fresco, `mix-blend-lighten`
 *   heading    text/default/heading        text/neutral/heading (white)
 *   body       text/default/subtle         text/neutral/hover (Blue 200)
 *   action     Button `fill`               Button `outline-on-color`
 *
 * The blue card gets `isolate` so its blend resolves against its own Blue 600
 * and stops there, rather than reaching down to the page behind it. The light
 * card has no blend and does not need it.
 */
function PromoCard({
  variant, title, body, action,
}: {
  variant: 'light' | 'blue';
  title: string;
  body: ReactNode;
  action: string;
}) {
  const blue = variant === 'blue';
  return (
    <div
      className={
        // The card's 1px `border/neutral/default` is an INSIDE stroke: a real
        // border pushes 340 to 342. Inset ring, same as every other stroke here.
        'flex w-full flex-col overflow-hidden rounded-[16px] shadow-[inset_0_0_0_1px_var(--border-neutral-default)] ' +
        (blue ? 'isolate bg-[var(--surface-primary-default)]' : 'bg-[var(--surface-primary-subtle)]')
      }
    >
      {blue ? (
        <div className="relative h-[140px] w-full overflow-hidden mix-blend-lighten">
          <img src={adamArt} alt="" className="absolute left-0 top-[-52.55%] h-[227.84%] w-full max-w-none object-cover" />
        </div>
      ) : (
        <img src={cafeArt} alt="" className="block h-[140px] w-full object-cover" />
      )}
      <div className="flex flex-col gap-[16px] px-[20px] pb-[24px] pt-[16px]">
        <div className="flex flex-col gap-[8px]">
          <p className={(blue ? 'text-[var(--text-neutral-heading)] ' : 'text-[var(--text-default-heading)] ') + TITLE_1}>
            {title}
          </p>
          <p className={(blue ? 'text-[var(--text-neutral-hover)] ' : 'text-[var(--text-default-subtle)] ') + BODY_3A}>
            {body}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Button tone={blue ? 'outline-on-color' : 'fill'}>{action}</Button>
        </div>
      </div>
    </div>
  );
}

/**
 * `who-to-follow` 750:284 and `your-faves` 936:8392 — the same shape, and the
 * glyph in the action is the only thing that differs: `plus-sign` to follow,
 * `message-02` to message.
 *
 * `items-start` on the row column is load-bearing. Without it the flex default
 * `align-items: stretch` pulls the Badge Text to the full 288, and the note
 * reads as a bar rather than a badge. Every `follow-profile` in the file sets
 * it.
 *
 * The action is a `Badge Button` `outline` with NEUTRAL ink — white with a 1px
 * `text/neutral/deep` ring, the same skin as the header controls. It was the
 * `subtle` Blue 50 fill; outline is what these two lists take.
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
          <div key={p.handle} className="flex flex-col items-start gap-[8px] px-[16px] py-[8px]">
            <div className="flex w-full items-start justify-between gap-[8px]">
              <div className="flex min-w-0 items-center gap-[6px]">
                <Avatar name={p.avatar} person={p.name} size="lg" />
                <span className="flex min-w-0 flex-col">
                  <span className={'truncate text-[var(--text-default-heading)] ' + TITLE_4B}>{p.name}</span>
                  <span className={'truncate text-[var(--text-default-placeholder)] ' + BODY_4A}>{p.handle}</span>
                </span>
              </div>
              <BadgeButton label={actionLabel(p.name)} glyph={action} tone="outline" />
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
            variant="light"
            title="Invite someone"
            action="INVITE"
            body={
              <>
                Help grow the Relethe community by inviting someone. Earn{' '}
                <span className="font-medium text-[var(--text-default-highlight-blue)]">3 karmas</span> when they sign
                up, and earn 6 more when they take their first meeting.
              </>
            }
          />
          <PeopleCard
            title="Who to follow"
            people={FOLLOW}
            action={PlusSignIcon}
            actionLabel={(n) => `Follow ${n}`}
          />
        </>
      ) : (
        <>
          <PromoCard
            variant="blue"
            title="Activate Superconnector"
            /* The frame reads INVITE here; that is stale copy in Figma, and
               the label is ACTIVATE. Confirmed rather than assumed. */
            action="ACTIVATE"
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

/**
 * APP SHELL — `relethe-feed`'s `app-header` + `app-grid`, and nothing else.
 *
 * A LAYOUT, NOT A SCREEN. It owns the header, the rail and the grid; the caller
 * owns the state and supplies the middle column. That split is what lets the
 * live `/connect` page and the demo preview render the same chrome from very
 * different data, instead of the shell reaching for one fixed source.
 *
 * `aside` is omitted on Suggested, and the grid drops to two columns to match —
 * 911:4246 has no right-hand column, 907:22311 does.
 */
export function AppShell({
  nav,
  rail,
  onNav,
  onRail,
  aside,
  children,
}: {
  /** Index into NAV: 0 FEED · 1 MATCHES · 2 COMMUNITIES. */
  nav: number;
  /** Index into this tab's rail. */
  rail: number;
  onNav: (i: number) => void;
  onRail: (i: number) => void;
  /** The right-hand 320 column. Omit it and the grid becomes two columns. */
  aside?: ReactNode;
  children: ReactNode;
}) {
  const railItems = RAILS[nav] ?? FEED_RAIL;

  return (
    <div className="rebrand-root min-h-screen bg-[var(--surface-page-beta)] text-[var(--text-default-body)]">
      <Header nav={nav} onNav={onNav} />

      {/* app-grid: 1080 with 24 padding and 24 gaps. 248 + 416 + 320 is what
          those numbers leave for the three columns at full width. */}
      <div
        className={
          'mx-auto grid max-w-[1080px] items-start gap-[24px] p-[24px] pb-[80px] ' +
          (aside
            ? 'grid-cols-[248px_minmax(0,1fr)_320px] max-[1000px]:grid-cols-[248px_minmax(0,1fr)] max-[740px]:grid-cols-[minmax(0,1fr)]'
            : 'grid-cols-[248px_minmax(0,1fr)] max-[740px]:grid-cols-[minmax(0,1fr)]')
        }
      >
        <div className="max-[740px]:hidden">
          <Rail items={railItems} active={rail} onPick={onRail} />
        </div>

        {children}

        {aside && <div className="max-[1000px]:hidden">{aside}</div>}
      </div>
    </div>
  );
}

/**
 * A card that says why the column is empty — loading, caught up, nothing yet,
 * or a rail row with no screen behind it.
 *
 * It carries no `<main>` of its own so it can sit inside one, and it is one
 * component rather than a "coming soon" and an "empty state" that would drift
 * apart the first time either was touched.
 */
export function MessageView({ title, body }: { title: string; body: string }) {
  return (
    <div className={'flex flex-col items-center gap-[12px] px-[32px] py-[64px] text-center ' + CARD}>
      <h2 className="rebrand-display text-[30px] leading-[110%] text-[var(--text-default-heading)]">{title}</h2>
      <p className={'max-w-[44ch] text-[var(--text-default-caption)] ' + BODY_3A}>{body}</p>
    </div>
  );
}

export { FeedView, MatchListView, SuggestionsView, AsideColumn };
