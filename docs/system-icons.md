# system_icons — the usage map

**Generated** by `scripts/icon-inventory.mjs`. Edit the script, not this file.

## What this is now

**The library is HugeIcons, adopted whole as the Relethe icon library.**
Nothing here needs drawing. The whole set is available — this file is not a
restriction on which icons may be used.

So these **240 names in 17 groups** are a *usage map*, not a
drawing list: the semantic names the product calls icons by, and what each one
resolves to in the library. That layer is worth keeping for three reasons:

1. A call site reads `match-blind`, not `user-search-01`.
2. Swapping the underlying pack later touches one file instead of 47.
3. It is the only place that records which icons the product actually uses,
   which is what makes the lucide migration finishable.

**42** of them are in the product today as `lucide-react` imports and are
marked **in use** below. That is the migration set: `lucide-react` cannot leave
`package.json` until every one resolves to a library icon.

`RESOLVES TO` is blank on every row until the mapping pass runs against the
library's own names. A blank is an open question, not an omission.

---

## Naming

```
kebab-case          user-avatar, radio-on
noun first          calendar-add   NOT add-calendar
                    message-unread NOT unread-message
state suffix        -on / -off     radio-on, matching-off
semantic not        notification   NOT bell
  pictorial         user-avatar    NOT person-circle
```

Noun-first is the whole point of the convention: it sorts related icons
together, so `calendar`, `calendar-add`, `calendar-check` and `calendar-off`
sit in one block in the file listing, the Figma page and the import.

---

## Style

Measured from `calendar-01` as drawn in the Figma library, not specified
from memory:

```
viewBox        0 0 24 24
stroke-width   1.5          NOT 1.25 — see the reconciliation note below
linecap        round
linejoin       round
fill           none, everywhere. Strokes only
colour         currentColor, so the caller's token decides
```

Two artefacts come out of a Figma SVG export and both have to be stripped:
a `<rect width="24" height="24" fill="#1E1E1E"/>` behind the glyph, and the
parent sheet's `<rect width="1144" ... fill="white"/>`. The stroke colour
also exports as a literal `#100A0A` and must become `currentColor`.

**Stroke reconciliation.** The library draws at 1.5 and our own components
(IconButton, the chevrons) were specified at 1.25. Mixing them puts a heavier
icon next to a lighter chevron in the same row. The library wins — re-stroking
a few components is a three-line change, re-stroking thousands of icons is not.

---

## The set

### Navigation and chrome · 15

Movement through the product. Every one of these is used on more than one surface, which is why they are first.

- [ ] `chevron-left` → `?` · **in use**, replaces `ChevronLeft`
- [ ] `chevron-right` → `?`
- [ ] `chevron-up` → `?`
- [ ] `chevron-down` → `?`
- [ ] `arrow-left` → `?` · **in use**, replaces `ArrowLeft`
- [ ] `arrow-right` → `?`
- [ ] `arrow-up` → `?`
- [ ] `arrow-down` → `?`
- [ ] `arrow-external` → `?`
- [ ] `close` → `?` · **in use**, replaces `X`
- [ ] `menu` → `?`
- [ ] `more-horizontal` → `?` · **in use**, replaces `MoreHorizontal`
- [ ] `more-vertical` → `?` · **in use**, replaces `MoreVertical`
- [ ] `search` → `?` · **in use**, replaces `Search`
- [ ] `home` → `?`

### Actions · 22

Things a user does TO something. Verbs.

- [ ] `plus` → `?` · **in use**, replaces `Plus`
- [ ] `minus` → `?`
- [ ] `edit` → `?`
- [ ] `trash` → `?` · **in use**, replaces `Trash2`
- [ ] `copy` → `?`
- [ ] `share` → `?` · **in use**, replaces `Share2`
- [ ] `download` → `?` · **in use**, replaces `Download`
- [ ] `upload` → `?` · **in use**, replaces `Upload`
- [ ] `refresh` → `?` · **in use**, replaces `RotateCcw`
- [ ] `undo` → `?`
- [ ] `filter` → `?`
- [ ] `sort` → `?`
- [ ] `expand` → `?`
- [ ] `collapse` → `?`
- [ ] `drag-handle` → `?`
- [ ] `pin` → `?` · **in use**, replaces `Pin`
- [ ] `pin-off` → `?`
- [ ] `archive` → `?`
- [ ] `link` → `?` · **in use**, replaces `Link2`
- [ ] `link-off` → `?`
- [ ] `attachment` → `?` · **in use**, replaces `Paperclip`
- [ ] `send` → `?` · **in use**, replaces `Send`

### Status and feedback · 20

What the system is telling you. Never the only carrier of meaning — each pairs with a label.

- [ ] `check` → `?` · **in use**, replaces `Check`
- [ ] `check-circle` → `?`
- [ ] `close-circle` → `?`
- [ ] `alert-circle` → `?` · **in use**, replaces `AlertCircle`
- [ ] `alert-triangle` → `?` · **in use**, replaces `AlertTriangle`
- [ ] `info-circle` → `?`
- [ ] `help-circle` → `?`
- [ ] `loading-spinner` → `?`
- [ ] `verified-badge` → `?`
- [ ] `shield-check` → `?`
- [ ] `lock` → `?`
- [ ] `unlock` → `?`
- [ ] `eye` → `?`
- [ ] `eye-off` → `?` · **in use**, replaces `EyeOff`
- [ ] `flag` → `?`
- [ ] `ban` → `?` · **in use**, replaces `Ban`
- [ ] `star` → `?`
- [ ] `heart` → `?` · **in use**, replaces `Heart`
- [ ] `bolt` → `?` · **in use**, replaces `Zap`
- [ ] `sparkle` → `?` · **in use**, replaces `Sparkles`

### People and identity · 14

Who someone is. `user-anonymous` matters more here than in most products: the blind gate means a real person is often deliberately unshown.

- [ ] `user` → `?` · **in use**, replaces `User`
- [ ] `user-avatar` → `?`
- [ ] `user-add` → `?` · **in use**, replaces `UserPlus`
- [ ] `user-remove` → `?`
- [ ] `user-check` → `?`
- [ ] `user-group` → `?` · **in use**, replaces `Users`
- [ ] `user-anonymous` → `?`
- [ ] `user-blocked` → `?`
- [ ] `avatar-stack` → `?`
- [ ] `profile-card` → `?`
- [ ] `handshake` → `?`
- [ ] `presence-online` → `?`
- [ ] `presence-away` → `?`
- [ ] `presence-offline` → `?`

### Role families · 14

One per family in Step 9. A chip grid of fourteen text labels is the densest thing in onboarding, and a mark per family is what makes it scannable. Fourteen judgement calls, since the library has no role taxonomy.

- [ ] `role-founder` → `?`
- [ ] `role-operator` → `?`
- [ ] `role-engineer` → `?`
- [ ] `role-designer` → `?`
- [ ] `role-researcher` → `?`
- [ ] `role-writer` → `?`
- [ ] `role-artist` → `?`
- [ ] `role-investor` → `?`
- [ ] `role-educator` → `?`
- [ ] `role-healthcare` → `?`
- [ ] `role-public-service` → `?`
- [ ] `role-trades` → `?`
- [ ] `role-student` → `?`
- [ ] `role-other` → `?`

### Matching and intro · 16

The product's actual subject, and the group most likely to need a substituted or composed icon — the library has no `match-blind`, so these resolve by meaning rather than by name.

- [ ] `match-blind` → `?`
- [ ] `match-revealed` → `?`
- [ ] `match-accept` → `?`
- [ ] `match-pass` → `?`
- [ ] `match-pending` → `?`
- [ ] `intro-sent` → `?`
- [ ] `intro-scheduled` → `?`
- [ ] `intro-complete` → `?`
- [ ] `intro-missed` → `?`
- [ ] `confidence-band` → `?`
- [ ] `signal-overlap` → `?`
- [ ] `signal-strong` → `?`
- [ ] `signal-weak` → `?`
- [ ] `rematch` → `?`
- [ ] `matching-on` → `?`
- [ ] `matching-off` → `?`

### Trust and review · 12

The surfaces in Phase 4b that do not exist yet. Mapped now so the icon is chosen once, deliberately, rather than grabbed at build time.

- [ ] `review-blind` → `?`
- [ ] `review-unlocked` → `?`
- [ ] `rating-scale` → `?`
- [ ] `trust-ledger` → `?`
- [ ] `provenance` → `?`
- [ ] `dispute` → `?`
- [ ] `dispute-resolved` → `?`
- [ ] `suspension` → `?`
- [ ] `reinstate` → `?`
- [ ] `no-show` → `?`
- [ ] `report` → `?`
- [ ] `moderation` → `?`

### Time and scheduling · 16

`daylight-band` is the 24-hour track from Step 2, reduced to an icon. The three windows match AVAILABILITY_WINDOWS exactly.

- [ ] `calendar` → `?` · **in use**, replaces `Calendar`
- [ ] `calendar-add` → `?`
- [ ] `calendar-check` → `?`
- [ ] `calendar-off` → `?`
- [ ] `clock` → `?` · **in use**, replaces `Clock`
- [ ] `clock-pending` → `?`
- [ ] `hourglass` → `?`
- [ ] `daylight-band` → `?`
- [ ] `timezone` → `?`
- [ ] `availability` → `?`
- [ ] `availability-off` → `?`
- [ ] `morning` → `?`
- [ ] `afternoon` → `?`
- [ ] `evening` → `?`
- [ ] `recurring` → `?`
- [ ] `reminder` → `?`

### Communication · 16

- [ ] `message` → `?` · **in use**, replaces `MessageCircle`
- [ ] `message-add` → `?`
- [ ] `message-unread` → `?`
- [ ] `reply` → `?`
- [ ] `thread` → `?`
- [ ] `mention` → `?`
- [ ] `email` → `?`
- [ ] `email-open` → `?`
- [ ] `notification` → `?` · **in use**, replaces `Bell`
- [ ] `notification-off` → `?`
- [ ] `video-call` → `?`
- [ ] `audio-call` → `?`
- [ ] `mic` → `?`
- [ ] `mic-off` → `?`
- [ ] `volume-on` → `?` · **in use**, replaces `Volume2`
- [ ] `volume-off` → `?` · **in use**, replaces `VolumeX`

### Content and feed · 18

The three content-state icons carry Relethe's core idea: posts move flowing to fading to faded. No library ships that concept, so these are the likeliest to need composing from what is there.

- [ ] `post` → `?`
- [ ] `post-add` → `?`
- [ ] `feed` → `?`
- [ ] `image` → `?` · **in use**, replaces `Image`
- [ ] `video` → `?` · **in use**, replaces `Video`
- [ ] `document-text` → `?` · **in use**, replaces `FileText`
- [ ] `quote` → `?`
- [ ] `list-bullet` → `?`
- [ ] `layout-grid` → `?` · **in use**, replaces `Grid`
- [ ] `layout-list` → `?` · **in use**, replaces `List`
- [ ] `bookmark` → `?`
- [ ] `echo` → `?`
- [ ] `view-count` → `?`
- [ ] `content-flowing` → `?`
- [ ] `content-fading` → `?`
- [ ] `content-faded` → `?`
- [ ] `draft` → `?`
- [ ] `publish` → `?`

### Location and world · 8

- [ ] `map-pin` → `?` · **in use**, replaces `MapPin`
- [ ] `map-pin-off` → `?`
- [ ] `globe` → `?`
- [ ] `city` → `?`
- [ ] `compass` → `?`
- [ ] `navigate` → `?`
- [ ] `region` → `?`
- [ ] `map` → `?`

### Brand marks · 12

The library ships these in its Brand Logo sheet. Use them AS DRAWN — a brand mark is a trademark and its recognisability is its function, so this is the one group that never gets re-stroked to match the house weight.

- [ ] `brand-linkedin` → `?`
- [ ] `brand-x` → `?`
- [ ] `brand-github` → `?`
- [ ] `brand-substack` → `?`
- [ ] `brand-instagram` → `?`
- [ ] `brand-youtube` → `?`
- [ ] `brand-figma` → `?`
- [ ] `brand-discord` → `?`
- [ ] `brand-google` → `?`
- [ ] `brand-apple` → `?`
- [ ] `brand-calendly` → `?`
- [ ] `website` → `?`

### Commerce and account · 10

Free and paid tiers exist in the roadmap but not the product. Drawn in the same batch so the paywall is not the moment we discover we have no icons for it.

- [ ] `credit-card` → `?`
- [ ] `invoice` → `?`
- [ ] `receipt` → `?`
- [ ] `wallet` → `?`
- [ ] `plan-free` → `?`
- [ ] `plan-paid` → `?`
- [ ] `upgrade` → `?`
- [ ] `billing` → `?`
- [ ] `referral` → `?`
- [ ] `invite` → `?`

### Data and admin · 11

The admin routes that do not exist yet — trust ledger, suspensions, dispute queue, the HITL dial.

- [ ] `chart-line` → `?`
- [ ] `chart-bar` → `?`
- [ ] `analytics` → `?`
- [ ] `dashboard` → `?`
- [ ] `database` → `?`
- [ ] `funnel` → `?`
- [ ] `export` → `?`
- [ ] `log` → `?`
- [ ] `audit` → `?`
- [ ] `queue` → `?`
- [ ] `admin-shield` → `?`

### Form controls · 14

The pairs are the point. A checkbox that only exists in one state is half a control.

- [ ] `checkbox-on` → `?`
- [ ] `checkbox-off` → `?`
- [ ] `radio-on` → `?`
- [ ] `radio-off` → `?`
- [ ] `toggle-on` → `?`
- [ ] `toggle-off` → `?`
- [ ] `dropdown` → `?`
- [ ] `stepper-up` → `?`
- [ ] `stepper-down` → `?`
- [ ] `field-error` → `?`
- [ ] `field-valid` → `?`
- [ ] `password-show` → `?`
- [ ] `password-hide` → `?`
- [ ] `clear-input` → `?`

### System and preference · 11

- [ ] `settings` → `?`
- [ ] `sliders` → `?`
- [ ] `sun` → `?`
- [ ] `moon` → `?`
- [ ] `contrast` → `?`
- [ ] `accessibility` → `?`
- [ ] `keyboard` → `?`
- [ ] `sign-out` → `?` · **in use**, replaces `LogOut`
- [ ] `sign-in` → `?`
- [ ] `offline` → `?`
- [ ] `activity-pulse` → `?` · **in use**, replaces `Activity`

### Objects and texture · 11

The interests in Step 5. The library covers most of these across its Food, Game and Sports, and Education sheets.

- [ ] `book` → `?`
- [ ] `coffee` → `?`
- [ ] `camera` → `?`
- [ ] `vinyl` → `?`
- [ ] `palette` → `?`
- [ ] `bicycle` → `?`
- [ ] `telescope` → `?`
- [ ] `flask` → `?`
- [ ] `lantern` → `?`
- [ ] `feather-quill` → `?`
- [ ] `emoji-smile` → `?` · **in use**, replaces `Smile`

---

## Not in this map

- **The rest of the library.** Thousands of icons across ~52 category sheets
  are available and unlisted. A name earns a row here once the product calls
  it by that name.
- **Filled variants.** The library ships them; the map covers outlined until a
  surface needs a filled one. Filled means SELECTED, never emphasis — emphasis
  is a colour decision.
- **`dynamic_icons`.** Ten animated marks, a separate workstream (PLAN 4c-ii).
- **Artwork plates.** `src/assets/artworks/`, a different kind of asset entirely.
