# system_icons — the inventory

**Generated** by `scripts/icon-inventory.mjs`. Edit the script, not this file.

**240 icons** in 17 groups. **42** are already in the product
today (as `lucide-react` imports across 47 files) and are marked **in use** below —
those are the migration set, and `lucide-react` cannot leave `package.json`
until every one of them is drawn.

Outlined only for now. The filled variants come after the outlined set is
complete and reviewed as a whole, because filled is a derivative of the
outlined drawing, not an independent one.

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

## Drawing rules

```
grid           24 x 24, drawn on the grid, exported at 1x
stroke         1.25px, matching IconButton and the existing chevrons
caps / joins   round, round
colour         NONE. currentColor only, so the caller's token decides
optical size   a 16px usage is a redrawn 16 icon, not a scaled-down 24
padding        2px minimum inside the 24 box, so nothing touches the edge
fill           no fills in the outlined set, including white knockouts
```

Style: minimalist cyber-classical — a single fine line weight, geometric
construction, and the occasional classical object (flask, lantern, quill)
rather than the rounded-corner SaaS default.

---

## The set

### Navigation and chrome · 15

Movement through the product. Every one of these is used on more than one surface, which is why they are first.

- [ ] `chevron-left` — **in use**, replaces `ChevronLeft`
- [ ] `chevron-right`
- [ ] `chevron-up`
- [ ] `chevron-down`
- [ ] `arrow-left` — **in use**, replaces `ArrowLeft`
- [ ] `arrow-right`
- [ ] `arrow-up`
- [ ] `arrow-down`
- [ ] `arrow-external`
- [ ] `close` — **in use**, replaces `X`
- [ ] `menu`
- [ ] `more-horizontal` — **in use**, replaces `MoreHorizontal`
- [ ] `more-vertical` — **in use**, replaces `MoreVertical`
- [ ] `search` — **in use**, replaces `Search`
- [ ] `home`

### Actions · 22

Things a user does TO something. Verbs.

- [ ] `plus` — **in use**, replaces `Plus`
- [ ] `minus`
- [ ] `edit`
- [ ] `trash` — **in use**, replaces `Trash2`
- [ ] `copy`
- [ ] `share` — **in use**, replaces `Share2`
- [ ] `download` — **in use**, replaces `Download`
- [ ] `upload` — **in use**, replaces `Upload`
- [ ] `refresh` — **in use**, replaces `RotateCcw`
- [ ] `undo`
- [ ] `filter`
- [ ] `sort`
- [ ] `expand`
- [ ] `collapse`
- [ ] `drag-handle`
- [ ] `pin` — **in use**, replaces `Pin`
- [ ] `pin-off`
- [ ] `archive`
- [ ] `link` — **in use**, replaces `Link2`
- [ ] `link-off`
- [ ] `attachment` — **in use**, replaces `Paperclip`
- [ ] `send` — **in use**, replaces `Send`

### Status and feedback · 20

What the system is telling you. Never the only carrier of meaning — each pairs with a label.

- [ ] `check` — **in use**, replaces `Check`
- [ ] `check-circle`
- [ ] `close-circle`
- [ ] `alert-circle` — **in use**, replaces `AlertCircle`
- [ ] `alert-triangle` — **in use**, replaces `AlertTriangle`
- [ ] `info-circle`
- [ ] `help-circle`
- [ ] `loading-spinner`
- [ ] `verified-badge`
- [ ] `shield-check`
- [ ] `lock`
- [ ] `unlock`
- [ ] `eye`
- [ ] `eye-off` — **in use**, replaces `EyeOff`
- [ ] `flag`
- [ ] `ban` — **in use**, replaces `Ban`
- [ ] `star`
- [ ] `heart` — **in use**, replaces `Heart`
- [ ] `bolt` — **in use**, replaces `Zap`
- [ ] `sparkle` — **in use**, replaces `Sparkles`

### People and identity · 14

Who someone is. `user-anonymous` matters more here than in most products: the blind gate means a real person is often deliberately unshown.

- [ ] `user` — **in use**, replaces `User`
- [ ] `user-avatar`
- [ ] `user-add` — **in use**, replaces `UserPlus`
- [ ] `user-remove`
- [ ] `user-check`
- [ ] `user-group` — **in use**, replaces `Users`
- [ ] `user-anonymous`
- [ ] `user-blocked`
- [ ] `avatar-stack`
- [ ] `profile-card`
- [ ] `handshake`
- [ ] `presence-online`
- [ ] `presence-away`
- [ ] `presence-offline`

### Role families · 14

One per family in Step 9. These are not decoration — a chip grid of fourteen text labels is the densest thing in onboarding, and a mark per family is what makes it scannable.

- [ ] `role-founder`
- [ ] `role-operator`
- [ ] `role-engineer`
- [ ] `role-designer`
- [ ] `role-researcher`
- [ ] `role-writer`
- [ ] `role-artist`
- [ ] `role-investor`
- [ ] `role-educator`
- [ ] `role-healthcare`
- [ ] `role-public-service`
- [ ] `role-trades`
- [ ] `role-student`
- [ ] `role-other`

### Matching and intro · 16

The product's actual subject. Nothing off-the-shelf covers these, which is most of the argument for drawing our own set.

- [ ] `match-blind`
- [ ] `match-revealed`
- [ ] `match-accept`
- [ ] `match-pass`
- [ ] `match-pending`
- [ ] `intro-sent`
- [ ] `intro-scheduled`
- [ ] `intro-complete`
- [ ] `intro-missed`
- [ ] `confidence-band`
- [ ] `signal-overlap`
- [ ] `signal-strong`
- [ ] `signal-weak`
- [ ] `rematch`
- [ ] `matching-on`
- [ ] `matching-off`

### Trust and review · 12

The surfaces in Phase 4b that do not exist yet. Listed now so they are drawn in the same batch rather than improvised later.

- [ ] `review-blind`
- [ ] `review-unlocked`
- [ ] `rating-scale`
- [ ] `trust-ledger`
- [ ] `provenance`
- [ ] `dispute`
- [ ] `dispute-resolved`
- [ ] `suspension`
- [ ] `reinstate`
- [ ] `no-show`
- [ ] `report`
- [ ] `moderation`

### Time and scheduling · 16

`daylight-band` is the 24-hour track from Step 2, reduced to an icon. The three windows match AVAILABILITY_WINDOWS exactly.

- [ ] `calendar` — **in use**, replaces `Calendar`
- [ ] `calendar-add`
- [ ] `calendar-check`
- [ ] `calendar-off`
- [ ] `clock` — **in use**, replaces `Clock`
- [ ] `clock-pending`
- [ ] `hourglass`
- [ ] `daylight-band`
- [ ] `timezone`
- [ ] `availability`
- [ ] `availability-off`
- [ ] `morning`
- [ ] `afternoon`
- [ ] `evening`
- [ ] `recurring`
- [ ] `reminder`

### Communication · 16

- [ ] `message` — **in use**, replaces `MessageCircle`
- [ ] `message-add`
- [ ] `message-unread`
- [ ] `reply`
- [ ] `thread`
- [ ] `mention`
- [ ] `email`
- [ ] `email-open`
- [ ] `notification` — **in use**, replaces `Bell`
- [ ] `notification-off`
- [ ] `video-call`
- [ ] `audio-call`
- [ ] `mic`
- [ ] `mic-off`
- [ ] `volume-on` — **in use**, replaces `Volume2`
- [ ] `volume-off` — **in use**, replaces `VolumeX`

### Content and feed · 18

The three content-state icons carry Relethe's core idea: posts move flowing to fading to faded. No icon set on earth ships these.

- [ ] `post`
- [ ] `post-add`
- [ ] `feed`
- [ ] `image` — **in use**, replaces `Image`
- [ ] `video` — **in use**, replaces `Video`
- [ ] `document-text` — **in use**, replaces `FileText`
- [ ] `quote`
- [ ] `list-bullet`
- [ ] `layout-grid` — **in use**, replaces `Grid`
- [ ] `layout-list` — **in use**, replaces `List`
- [ ] `bookmark`
- [ ] `echo`
- [ ] `view-count`
- [ ] `content-flowing`
- [ ] `content-fading`
- [ ] `content-faded`
- [ ] `draft`
- [ ] `publish`

### Location and world · 8

- [ ] `map-pin` — **in use**, replaces `MapPin`
- [ ] `map-pin-off`
- [ ] `globe`
- [ ] `city`
- [ ] `compass`
- [ ] `navigate`
- [ ] `region`
- [ ] `map`

### Brand marks · 12

DRAWN DIFFERENTLY, ON PURPOSE. A brand mark is a trademark and its recognisability IS its function — restyling LinkedIn into our house line weight makes it both legally dubious and harder to recognise. These are sourced from each brand's own asset kit, normalised to the 24 grid, and are the ONE group exempt from the house style.

- [ ] `brand-linkedin`
- [ ] `brand-x`
- [ ] `brand-github`
- [ ] `brand-substack`
- [ ] `brand-instagram`
- [ ] `brand-youtube`
- [ ] `brand-figma`
- [ ] `brand-discord`
- [ ] `brand-google`
- [ ] `brand-apple`
- [ ] `brand-calendly`
- [ ] `website`

### Commerce and account · 10

Free and paid tiers exist in the roadmap but not the product. Drawn in the same batch so the paywall is not the moment we discover we have no icons for it.

- [ ] `credit-card`
- [ ] `invoice`
- [ ] `receipt`
- [ ] `wallet`
- [ ] `plan-free`
- [ ] `plan-paid`
- [ ] `upgrade`
- [ ] `billing`
- [ ] `referral`
- [ ] `invite`

### Data and admin · 11

The admin routes that do not exist yet — trust ledger, suspensions, dispute queue, the HITL dial.

- [ ] `chart-line`
- [ ] `chart-bar`
- [ ] `analytics`
- [ ] `dashboard`
- [ ] `database`
- [ ] `funnel`
- [ ] `export`
- [ ] `log`
- [ ] `audit`
- [ ] `queue`
- [ ] `admin-shield`

### Form controls · 14

The pairs are the point. A checkbox that only exists in one state is half a control.

- [ ] `checkbox-on`
- [ ] `checkbox-off`
- [ ] `radio-on`
- [ ] `radio-off`
- [ ] `toggle-on`
- [ ] `toggle-off`
- [ ] `dropdown`
- [ ] `stepper-up`
- [ ] `stepper-down`
- [ ] `field-error`
- [ ] `field-valid`
- [ ] `password-show`
- [ ] `password-hide`
- [ ] `clear-input`

### System and preference · 11

- [ ] `settings`
- [ ] `sliders`
- [ ] `sun`
- [ ] `moon`
- [ ] `contrast`
- [ ] `accessibility`
- [ ] `keyboard`
- [ ] `sign-out` — **in use**, replaces `LogOut`
- [ ] `sign-in`
- [ ] `offline`
- [ ] `activity-pulse` — **in use**, replaces `Activity`

### Objects and texture · 11

The cyber-classical end of the set: the interests in Step 5, and the flavour marks that keep the system from reading as generic SaaS. This is where the style is most visible and most worth getting right.

- [ ] `book`
- [ ] `coffee`
- [ ] `camera`
- [ ] `vinyl`
- [ ] `palette`
- [ ] `bicycle`
- [ ] `telescope`
- [ ] `flask`
- [ ] `lantern`
- [ ] `feather-quill`
- [ ] `emoji-smile` — **in use**, replaces `Smile`

---

## Not in this set

- **Filled variants.** A second pass over the same 240 once the outlined set
  is reviewed whole. Filled means SELECTED, never emphasis — emphasis is a
  colour decision.
- **`dynamic_icons`.** Ten animated marks, a separate workstream (PLAN 4c-ii).
- **Artwork plates.** `src/assets/artworks/`, a different kind of asset entirely.
