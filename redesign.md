# Relethe Redesign System

**Status:** Staged rebrand. Companion to [design.md](design.md) (which still documents the live pre-rebrand app). This file describes the new visual system being built under [src/rebrand/](src/rebrand/) and will be promoted into the codebase when the rebrand is completed.

**Surfaces:** the marketing site is Blue 600. **The app is light**, and blue is spent only where it is earned — see [7](#7-theme-and-the-onboarding-surface) and [5.11](#511-match-card-and-the-surface-convention).

**Principle:** Electric blue is the canvas. White and pale lavender are the panels that sit on it. Yellow is emphasis, never a surface (except the warm light-section canvas, Yellow 50).

The runtime source of truth for these tokens is [src/styles/tokens.css](src/styles/tokens.css), on `:root` and shared by the app and the rebrand so there is exactly one definition of every colour. The surface itself — the two fonts, the element reset, the scroll chrome — is [src/styles/rebrand-surface.css](src/styles/rebrand-surface.css), scoped to `.rebrand-root` and imported by **both** stylesheets: Phase 4 mounts rebrand components inside the live app, so `.rebrand-root` has to mean the same thing in both places.

---

## 1. Typography

Two fonts, non-overlapping roles. **No Inter** — everything that is not a display heading is Archivo.

| Font | Role |
|---|---|
| **Parkinsans** | Display: hero, section headings, card titles. Weight 400 (Regular) everywhere except the wordmark. |
| **Archivo** | Everything else: body, UI, buttons, tags, footer, input. Variable font pinned to `wdth 100`. Weight 400 / 500. |

Loaded weights: Parkinsans 400 / 600, Archivo **300** / 400 / 500. Both families
are loaded by `src/styles/fonts.css` (the app) and by the head of
`src/rebrand/rebrand.css` (the rebrand entries), so a rebrand component carries
the right faces wherever it is mounted.

### No third face

Tabular data — clock ticks, UTC offsets, indices, step counters — is Archivo
with `font-variant-numeric: tabular-nums`. Even digit widths were the only
reason to reach for a monospace, and a third family is a bigger cost than
uneven `1`s. There is therefore **no sanctioned face for code or spec display**;
if the system wants one it has to be specified, not improvised into a component.

### Named text styles (from Figma)

Headings — Parkinsans:

| Style | Size / Line-height / Tracking | Weight |
|---|---|---|
| Heading 1 | 80 / 120% / 1px | Regular |
| Heading 2 | 64 / 110% / 1px | Regular |
| Heading 3 | 40 / 100% / 0 | Regular |
| Heading 4 | 32 / 100% / 0 | Regular |
| Heading 5 | 24 / 100% / 0 | Medium |
| Heading 6 | 20 / 100% / 0 | Medium |

Titles / Buttons / Body — Archivo:

| Style | Size / Line-height / Tracking | Weight |
|---|---|---|
| Title 1 | 20 / 100% / 0 | Medium |
| Title 2 | 18 / 20px / 0.5px | SemiBold |
| Title 3 | 16 / 20px / 0.5px | Medium |
| Title 4A | 14 / 100% / 0.5px (uppercase) | Medium |
| Title 4B | 14 / 16px / 0 | Medium |
| Title 5 | 13 / 120% / 1.5px | Medium |
| Title 6 | 12 / 120% / 0 | Medium |
| Button 1 | 16 / 20px / 0 | Medium |
| Button 2 | 14 / 16px / 1px | Medium |
| Button 3 | 13 / 120% / 1px | Medium |
| Body 1 | 20 / 120% / 0 | Regular |
| Body 2 | 18 / 120% / 0 | Regular |
| Body 3 | 16 / 120% / 0 | Regular |
| Body 4 | 14 / 16px / 0 | Regular |
| Body 5A | 13 / 18px / 0 | Regular |
| Body 5B | 13 / 16px / 0 | Regular |
| Body 6 | 12 / 120% / 0 | Regular |

> Note: earlier extractions labelled Body 5A/5B and the tags as "Inter". That was wrong — they are Archivo. (Archivo Light 300 is now loaded, so Body 6 and the timezone label render as specified rather than falling back to Regular.)

### How styles are actually applied

| Role | Style |
|---|---|
| Wordmark "RELETHE" | Parkinsans **SemiBold** 13 / 16 / 4px, uppercase (bespoke — not a named style) |
| Nav links + nav/pill buttons (COHORT, MANIFESTO, JOIN NOW, SIGN IN) | Button 3 (Archivo Medium 13 / 1px) |
| Hero headline | Heading 1 |
| Story + Survey headings (64px) | Heading 2 |
| Quote + card titles | Heading 3 |
| Card body copy | Body 3 |
| Email placeholder, tags, footer text | Body 5A (Archivo Regular 13 / 18) |
| Form "JOIN NOW" | Title 5 (1.5px tracking) |
| "RUN DIAGNOSTIC" | Button 2 |

---

## 2. Color

Six 8-step ramps, `700 → 50` (darkest to lightest).

```
Blue      0000B8  0000F2  3333F5  6666F7  9999FA  CCCCFC  E6E6FE  F2F2FE
Yellow    EFCF00  FFDD00  FFE433  FFEB66  FFF199  FFF8CC  FFFCE6  FFFDF2
Black     000000  333333  666666  999999  CCCCCC  E6E6E6  F2F2F2  FAFAFA
Success   00C310  00F314  33F643  66F872  99FAA1  CCFDD0  E6FEE8  F2FEF3
Error     CC0003  FF0004  FF3336  FF6668  FF999B  FFCCCD  FFE6E6  FFF2F2
Warning   CC4400  FF5500  FF7733  FF9966  FFBB99  FFDDCC  FFEEE6  FFF6F2
          700     600     500     400     300     200     100     50
```

### Retired one-offs

These appeared in early Figma exports. All are drift and now resolve to ramp
tokens; none may be reintroduced.

```
#EEEEF7  ->  White (title-pill) or Blue 50 (descriptive-pill), by surface
#8F8FFF  ->  Blue 300          input placeholder
#3A3AFF  ->  Blue 500          border on a Blue 600 surface
#EBEBFA  ->  Black 100         inactive scroll segment
```

### Usage rules

- **Blue 600 `#0000F2`** is the primary canvas: hero, story, survey, footer.
- **Yellow 50 `#FFFDF2`** is the light section canvas: "Who is this for?" and
  "How it works".
- **Blue 100 / Blue 50** are light card fills; White is a card fill in-app.
- **Blue 700 `#0000B8`** is the recessed level: title-pills on blue, inset wells.
- **Emphasis is surface-dependent and never mixed:**

| Surface | Heading | Emphasis |
|---|---|---|
| Blue 600 | White | **Yellow 600** |
| White / Blue 50 / Blue 100 | Black 700 | **Blue 600** |

  Yellow never appears on a light surface.
- Borders are one ramp step lighter than the surface they sit on.

### Token naming

CSS custom properties mirror the Figma style names: `--color-<hue>-<step>`. The full
ramps are defined on `:root` in [src/styles/tokens.css](src/styles/tokens.css):

```
--color-white
--color-blue-700 … --color-blue-50      (0000B8 … F2F2FE)
--color-yellow-700 … --color-yellow-50  (EFCF00 … FFFDF2)
--color-black-700 … --color-black-50    (000000 … FAFAFA)
--color-success-700 … --color-success-50
--color-error-700 … --color-error-50
--color-warning-700 … --color-warning-50
```

Semantic aliases are permitted, but each must resolve to a ramp token and
never to a new hex:

```
--color-surface-base      -> --color-blue-600    the canvas
--color-surface-recessed  -> --color-blue-700    inset wells, title-pills on blue
--color-surface-raised    -> --color-blue-500    inputs, borders on base
--color-placeholder       -> --color-blue-300    on blue surfaces
--color-scroll-off        -> --color-black-100   inactive indicator segment
```

The four earlier `--color-tag-neutral` / `--color-card-border` style aliases
that carried their own hex values are retired.

---

### 2.x Reconciliation rule

The ramps above are the source of truth. Any hex arriving from Figma that is
not in them is drift, and snaps to the nearest ramp step. New hex values are
never introduced; semantic aliases may be added, but they must resolve to an
existing ramp token.

Values reconciled from the in-app spec:

| Figma | Snaps to | | Figma | Snaps to |
|---|---|---|---|---|
| `#3A3AFF` | Blue 500 | | `#696969` | Black 500 |
| `#5B5BFF` | Blue 400 | | `#A4A4AC` | Black 400 |
| `#9090FF` | Blue 300 | | `#FFE101` | **Yellow 600** |
| `#CCCCFF` | Blue 200 | | `#00C103` | Success 700 |
| `#EEEEF7` | Black 100 | | `#E7FDE5` | Success 100 |
| `#4646FF` | Blue 500 | | `#F20000` | Error 600 |
| `#2323FF` | see elevation, below | | `#FFEFEF` | Error 50 |

**Blue elevation.** `#2323FF` and `#3A3AFF` both snap to Blue 500, which would
make a card's fill and its border the same colour. They are really one idea
drawn twice, so blue surfaces use a three-level model instead:

```
recessed / well   --color-blue-700    inset containers, list wells
base surface      --color-blue-600    the card itself
raised / input    --color-blue-500    inputs, search fields, borders on base
```

A border is always one step lighter than the surface it sits on.

---

## 3. Space & shape

- **Radii:** cards `16px`; pill buttons `40px`; email field `48px`; tags `8px`;
  in-card containers and wells `12px`; rows `10px`; fields and chips `8px`;
  daylight bands `4px`.
- **Spacing (4px base), observed:** tag/label internal `4px`, card content stacks `12–16px`, section-inner gaps `16–36px`, large section padding `64 / 120px`.
- **Section paddings:** Story `220 / 120`; Who + How `120`; Survey `277 / 64`; Nav `40 / 12`.
- **Effect — `toggle-shadow`:** symmetric double drop-shadow, `2px −2px` and `−2px 2px`, both 10px blur, 0 spread, black @ 10%.

### Vertical rhythm — normative

One scale, 4px base, applied to every in-app step. These intervals are **not
chosen per screen**:

```
label → heading                6
heading → body                12
header block → content        24
group → sibling group         24
group label → its group        8
item → item within a group   4–8
inside a card / well         12–16
```

**These are OPTICAL values, not metric ones**, and the difference bit once
already. `heading → body` was 4 in the first cut, taken straight from the
reference. It read cramped, and measuring says why: the heading is 32px set at
`line-height: 100%`, so there is **zero leading beneath it** — its descenders
sit flush on the box edge — while the body's 120% line-height contributes only
1.6px above. A metric 4 was therefore a ~5.6px optical gap, *tighter* than the
metric 6 above it, under a heading four times the label's size.

So when two elements have different internal leading, the number that makes
their gaps *read* equal is not the same number. Set the value by what it looks
like and record the reason; do not derive it from the box model alone.

Margins must not double-count. Where a section label follows body copy, the
copy drops its bottom margin and the label owns the 24. Body copy is capped at
**44ch** — past that a 560px card starts reading like a document.

---

## 3a. Mobile — normative

Mobile is not a narrower desktop. These rules apply to every surface, and a
surface is not finished until it has been checked at **375** as well as at
desktop.

### The primary action must always be reachable

Non-negotiable, and the rule most easily broken by accident. The onboarding
preview shipped for a few hours with CONTINUE **94px below the fold** on a
375px screen, unreachable, because a fixed pixel height assumed how tall the
surrounding chrome was.

```
never   h-[min(760px, 100vh)]     a guess about the space, and vh is the wrong unit
always  a flex column with min-h-0 on the scrolling child
```

The container gives the height; the surface fills it. Only the card BODY
scrolls, so the footer stays put.

### Units and insets

- **`dvh`, never `vh`.** Mobile browser chrome shrinks the visual viewport and
  `vh` keeps measuring the larger one. That is exactly how a primary action ends
  up under the address bar.
- **Safe areas are not padding the browser gives you.** Anything pinned to an
  edge takes `max(<pad>, env(safe-area-inset-*))`.
- Touch targets are **44px** minimum, even where the graphic is smaller — pad
  the hit area rather than growing the mark (SegmentedBar already does this).

### Layout transforms

Breakpoints are **container** queries wherever a component can be mounted at
more than one width — a modal, a preview route and a gallery frame are three
different widths for the same component, and a viewport query gets all three
wrong.

| Space | Onboarding shell |
|---|---|
| ≥ 1120 | split: card left, plate right, two flush halves |
| < 1120 | stacked: plate as a banner above the card |

**A side-by-side layout stacks; it does not drop its other half.** Hiding the
plate on mobile would strip the brand from the breakpoint most people use. The
banner is a share of the shell (`22%`, floor 112, ceiling 200) so a short
viewport gives the form its room back, and it anchors `center 30%` because a
hard crop from a portrait plate should keep faces, not torsos.

### Page padding

```
page gutter    12 mobile · 24 desktop
card padding   16 everywhere
```

### Images

A surface that shows art at two very different sizes ships **two sources** and
lets `srcset` choose. The onboarding plates are 900px for the 560px column and
640px for the banner: 480KB against 200KB a step, and mobile is where that
matters most.

The rhythm is owned by `StepHeader` and `StepSection` (5.13) rather than
re-applied per screen, so it is a property of the system and not eleven
independent decisions that drift apart.

---

## 4. Section-by-section application

| Section | Background | Notes |
|---|---|---|
| Hero | Blue 600 | `sanctuary_of_lethe` art, full-bleed, anchored `object-bottom` so the fountain holds the lower frame and the headline sits in clear field above; H1 white + "never alone…" Yellow 600; nav pill with SIGN IN (secondary) + JOIN NOW (primary); bottom email capture (radius 48, 1px White border, padding 4 / left 24). |
| Story | Blue 600 | `WHY DO I NEED THIS?` depth tag; H2 with yellow second line. |
| Who is this for | **Yellow 50** | Blue 100 card, image left + quote right (Heading 3, `#0000F2` lead-in + black); title-pill `WHO NEEDS THIS?` (White) / descriptive-pill `CREATORS` (Blue 600); scroller indicates the rotating audience. |
| How it works | **Yellow 50** | 4 cards. Steps 1 & 4 Blue 100 (Black 700 text, White title-pill + Blue 600 descriptive-pill). Steps 2 & 3 Blue 600 with 1.25px Blue 500 border (White text, Blue 700 title-pill + Blue 50 descriptive-pill). |
| Survey | Blue 600 | Spirograph flower; `NETWORK DIAGNOSTIC` depth tag; H2 (no yellow highlight); `RUN DIAGNOSTIC` primary pill. |
| Footer | Blue 600 | `RELETHE, INC · 2026` / centered logomark / `NETWORKING WITHOUT PERFORMANCE`, Archivo 13. |

---

## 5. Components

Status key: **[observed]** read from Figma. **[proposed]** a decision we are
making, not yet in Figma. Never blur the two.

### 5.1 Pills

Three categories, distinguished by what they *are*, not by how they look:

| Category | Role | Quantity | Content |
|---|---|---|---|
| **title-pill** | Names the block it sits in | One per block | Authored |
| **descriptive-pill** | Qualifies that block | One per block | Authored |
| **signal-pill** | Data belonging to the user | Many, wraps | Derived |

The split matters because title and descriptive pills are chrome, fixed at
author time, while signal pills arrive in variable quantity, wrap to multiple
rows, and may become interactive. Different layout and state needs, so a
different component rather than a variant.

#### Shared anatomy [observed]

```
padding        4px vertical, 6px horizontal
radius         8px
typography     Body 5A - Archivo Regular 13px / 18px / 0 tracking
text transform none (copy is authored uppercase)
white-space    nowrap (title + descriptive) / normal (signal)
```

#### Surface matrix [observed]

Fill is chosen by the surface the pill sits ON. Text colour follows for
contrast; it is never chosen independently.

| Category | On light surface (Blue 50 / Blue 100 / White) | On Blue 600 |
|---|---|---|
| **title-pill** | fill `--color-white` · text `--color-black-700` | fill `--color-blue-700` · text `--color-white` |
| **descriptive-pill** | fill `--color-blue-600` · text `--color-white` | fill `--color-blue-50` · text `--color-blue-600` |
| **signal-pill** (neutral) | fill `--color-black-100` · text `--color-black-700` | no fill · 1px Blue 500 border · White text |

This retires the `#EEEEF7` one-off entirely: it was standing in for pure white
under title-pills and for Blue 50 under descriptive-pills.

#### descriptive-pill, icon variant [observed]

```
icon    16 x 16, inherits text colour
gap     2px between icon and label
```

#### States [proposed]

Title and descriptive pills are non-interactive: they carry no hover, focus or
pressed state, and must not be rendered as `<button>`.

Signal pills are non-interactive by default. Where they become filterable they
take: hover = surface one ramp step darker; focus-visible = 2px
`--color-blue-600` outline, 2px offset; selected = descriptive-pill fill for
that surface.

#### signal-pill, selected [closed]

The old *TBD* on blue is closed:

```
on blue    unselected  no fill, 1px Blue 500 border, White text
           selected    White fill, Blue 600 text      (the primary-button pair)
on light   unselected  Black 100 fill, Black 700 text
           selected    Blue 600 fill, White text      (the primary-button pair)
```

Yellow 600 is emphasis and is never a fill, so it does not appear here on
either surface. A selected pill takes the primary-button pair because
"selected" and "the affirmative action" are the same weight of statement.

The interactive form of this is **Chip** (5.13) — a real `<button>`. Title- and
descriptive-pills stay non-interactive.

#### Open [proposed]

signal-pill variants beyond neutral are undefined. A *matched* variant is
likely (COMMON INTERESTS is semantically "these overlap") but has not been
specified, so it is not invented here.


### 5.2 Button

Axes: `variant` (primary | secondary) x `surface` (light | blue) x `size`.
Radius is always `40px`. Never rendered with opacity; disabled has its own fill.

| | Light surface | Blue 600 surface |
|---|---|---|
| **primary** | fill Blue 600 · text White | fill White · text Blue 600 |
| **secondary** | 1px Blue 600 border · text Blue 600 · no fill | 1px White border · text White · no fill |
| **tertiary** | text Black 500 · no fill, no border | text Blue 200 · no fill, no border |

`tertiary` is the **deferral slot**: SKIP, LATER, dismiss. It exists so a
sidestep can sit directly under a primary without competing with it, and it is
the only variant whose default state draws no boundary at all. Hover follows
the same text-only rule — the label steps to Black 700 / White.

```
sm   padding 8 / 16    Button 3  (Archivo Medium 13 / 120% / 1px)
md   padding 8 / 20    Button 3     BEFRIEND, EDIT PROFILE
lg   padding 12 / 20   Button 2  (Archivo Medium 14 / 16px / 1px)
```

`fullWidth` stretches to the container (CONTINUE). Icon variant: 16px icon,
gap 2px, icon inherits text colour.

### 5.3 Input

```
radius        8px   (in-card fields)  |  48px  (hero email capture)
padding       12 / 16                 |  4, with 24 left so the placeholder
                                          aligns optically with body copy
placeholder   Archivo Regular 14 / 100%
```

| | Fill | Border | Text | Placeholder | Icon |
|---|---|---|---|---|---|
| On blue | Blue 500 | 1px Blue 500 | White | Blue 300 | Blue 300 |
| On light | White | 1px Black 200 | Black 700 | Black 400 | Black 500 |

### 5.4 Card

```
radius   16px      clips content
width    560px on the in-app grid; fluid on marketing
```

| Variant | Fill | Border | Text |
|---|---|---|---|
| light | Blue 50 | none | Black 700 |
| white | White | 1px Black 100 | Black 700 |
| blue | Blue 600 | 1.25px Blue 500 | White |

Padding is per-composition, not per-card: feature `16 / 16 / 24`, KYC `16` all
round, post card `0` with the sections carrying their own inset.

### 5.5 Icon button

`40 x 40`, padding `10px`, radius `40px`. Icon `20px`, stroke 1.25px.

| Intent | Fill | Icon |
|---|---|---|
| neutral | Black 100 | Blue 600 |
| positive | Success 100 | Success 700 |
| destructive | Error 50 | Error 600 |

### 5.6 Segmented toggle

Track padding `4px`, radius `40px`, fill Black 100. Segments fill width,
padding `8 / 12`, radius `40px`, Button 3 type.

```
active     fill White        text Blue 600
inactive   transparent       text Black 400
```

### 5.7 Compact list, and the list container rule

Container radius `16px`, 1px Black 200 border. Items padding `12px`, gap
`28px`, space-between, 1px Black 200 bottom border (last item none).

```
complete     fill Black 100   icon tile Blue 200   check Blue 600 20px
incomplete   no fill          icon tile Black 100  no check
icon tile    48 x 48, padding 14, radius 12
title        Body 4   Archivo Medium 14 / 16px / Black 700
description  Body 5A  Archivo Regular 13 / 18px / Black 500
```

**The container owns the boundary.** Rows inside a bordered list draw no border
of their own; only the *selected* row resolves into a surface (selFill +
selLine). Two boundaries for one object reads as a list of boxes rather than a
list.

**A list's chrome lives inside it.** The search field and the column header
belong within the container, divided off by a rule — never floating above it as
peers, which reads as two unrelated objects that happen to be stacked.

**Corollary: one scroll region per card.** Never nest a scrolling list inside a
scrolling card body. Two nested scroll regions means the user's wheel does
something different depending on a pixel of cursor position.

### 5.8 Progress bar

Track padding `2px`, gap `2px`, radius `40px`. Segments 4px tall, fill width,
first rounds left `8px`, last rounds right `8px`.

| | Track | Complete / active | Remaining |
|---|---|---|---|
| On blue | Blue 700 | **Yellow 600** | Blue 500 |
| On light | Black 100 | **Blue 600** | Black 200 |

Yellow is absent from the light flow entirely, so on a light surface progress
fills blue. Non-interactive, and `aria-hidden` when it is a read-out: the step
is already announced in the copy.

### 5.9 Card media

```
zoom      image scales to 1.05 inside a clipped frame on card hover, 500ms
          ease-out. The card does not move, only its media.
focal     images containing a PERSON anchor object-position: top centre.
          Centre-anchoring crops from both edges as the frame narrows and
          takes the head off first; top-centre sacrifices the feet instead.
radius    8px inner, inside the card's own 16px
```

Owned by the `CardImage` primitive so no caller has to remember either rule.
`hasPerson` is declared per illustration in the section's data, not guessed.

### 5.10 Avatar

Circle. `48px` inline, `120px` profile header. Placeholder fill Black 200 on
white surfaces, Blue 100 on Blue 50 surfaces, so it never matches its own
container.

An EMPTY avatar is a 135° hatch of Black 50 / Black 100 with the word it is
waiting for set in a chip on top ("portrait"). A flat grey disc reads as a photo
that failed to load; a hatch reads as nothing here yet.

### 5.12 DaylightBand [proposed]

A 24-hour track with a window drawn on it, **always in the viewer's local
frame**. A timezone is unreadable as a number and obvious as a picture: "UTC+9"
says nothing about whether you can meet someone, and a bar that does or does not
sit under yours says it immediately.

```
height 16 · radius 4 · track spans the full 24h
                        on blue        on light
--s-bandTrack           Blue 700       Black 100
--s-bandFill            Blue 400       Blue 300     overlaps you
--s-bandOff             Blue 500       Black 300    does not overlap
--s-bandMe              White          Blue 600     the user's own window
```

A window that crosses midnight renders as **two segments**, one at each end,
never a single wrapped bar — a wrapped bar draws 9pm–1am as though it ran
backwards through the entire day. Multiple windows on one band are sorted and
merged, so two adjacent windows draw as one continuous bar.

Where a band is readable as data it carries an axis (`12a 6a 12p 6p 12a`) and an
`aria-label` saying what the window is in words, because a gradient is not
available to a screen reader.

Used by Step 2 (one per city, plus one for the user) and Step 10 (the week the
user just chose). Any future surface answering "when can these people meet"
inherits it rather than inventing a second time notation.

### 5.13 Step scaffolding

The onboarding card's reusable parts. All are light-only by construction: there
is no `surface` prop to flip, so a step *cannot* accidentally be built on blue.

| Component | What it is |
|---|---|
| **SectionLabel** | Title 4A, uppercase, Black 500. The label above a heading or a group. |
| **StepHeader** | label → heading → body, carrying the 6 / 4 / 24 rhythm and the 44ch cap. Heading 4, Black 700, with Blue 600 emphasis inside it. |
| **StepSection** | A labelled group: 8 to its content, 24 from the group above. Optional right-hand counter ("1 of 3"). |
| **Well** | Recessed container: Black 50 fill, Black 200 border, radius 12, padding 16. The light-surface equivalent of a Blue 700 well. |
| **ListContainer** / **ListBand** | The bordered list of 5.7, and the divided strip (search, column header) that lives inside it. `recessed` gives the strip a Black 50 fill. |
| **IconTile** | 48 (radius 12) in a list row, 28 (radius 8) inline in a field. Blue 100 fill, Blue 600 mark. |
| **CheckDot** | 20px. On: Blue 600 fill, white check. Off: an empty Black 200 ring. Never an opacity change. |
| **SelectRow** | One selectable row. Selection is a surface change (Blue 100 fill, Blue 600 border) plus the dot. `bare` drops its border for use inside a ListContainer. |
| **Chip** | The interactive pill. Unselected Black 100 / Black 700; selected Blue 600 / White. |
| **FieldShell** / **FieldInput** | A field that carries more than its input — a mark, a fixed label, a hint. The border and focus ring belong to the shell so the composite lights up as one control. |
| **Textarea** | White fill, Black 200 border, radius 8, Body 3. |
| **Accordion** | A disclosure with a count, where the count answers "did I do this one?". |

---

## 5.11 Match card, and the surface convention

**SURFACE ENCODES WHAT IS KNOWN.**

```
Blue 600 surface   not yet known    the blind offer
Light surface      known            everything after the reveal
```

The app is light mode after onboarding, so a blue card is visually rare and
reads as a held breath. When a match reveals, it resolves into the light with
the rest of the product, which is the same idea the brand's dither-resolve
expresses. Any later screen with a "not yet known" state inherits this rather
than inventing its own treatment.

### Why one card, not two

The in-app reference showed a name, socials and named mutuals above PASS /
MATCH. Those cannot coexist: PASS/MATCH is the decision taken while the match
is still BLIND, and the blind gate exists so no identity crosses it before both
sides commit. The API enforces it — while blind, `candidate` is null and only
`blindRationale` ships.

So the match card is ONE component with two states. The information
architecture is identical; only the resolution changes. The user recognises the
card they accepted, and the reveal is that same object coming into focus.

| | Blind | Revealed |
|---|---|---|
| Surface | Blue 600 | White, Blue 100 header band |
| Headline | role category | display name |
| Overlap | descriptive-pills | signal-pills + prose |
| Confidence | band, never a number | n/a |
| Mutuals | withheld | avatar stack + sentence |
| Availability | compatibility sentence | concrete day + windows |
| Decision | PASS / ACCEPT | NOT NOW / SCHEDULE |

### Supporting components

- **SignalGroup** — a labelled block. Every group on a match or profile card is
  one, so vertical rhythm is a system property, not a per-screen decision.
- **ConfidenceBand** — reuses SegmentedBar, so confidence and progress read as
  one visual language. Three steps, never a percentage.
- **AvatarStack** — caps at `max` and returns the remainder to the caller,
  because "+3" and "and 3 others have met her" are different sentences.
- **AvailabilitySlot** — a day and its concrete windows. Availability is never
  a vague "evenings".
- **DecisionBar** — PASS hugs, the affirmative takes the remaining width, so
  commitment is physically the larger target.

---

## 6. State matrix

Applies to every interactive component. **[proposed]** except where a state is
visible in the Figma frames.

| State | Rule |
|---|---|
| default | as specified above |
| hover (website) | **TEXT ONLY.** The label steps along its ramp; fill and border hold. A button must not restate itself as a different object on hover. Never opacity. |
| pressed | two ramp steps, no transform |
| focus-visible | 2px Blue 600 outline, 2px offset. On blue surfaces, White. Never removed. |
| disabled | its own fill, chosen by surface — **Black 100** on light, **White** on blue — text Black 400, no border, `cursor: not-allowed`. The fill must differ from the surface: a white disabled button on a white card does not read as inert, it reads as absent. |
| loading | label swaps to progressive text, control stays sized, pointer events off |
| error | 1px Error 600 border, message below in Body 5A / Error 600 |
| selected | descriptive-pill fill for that surface |

Non-interactive by definition: title-pill, descriptive-pill, progress bar.
These must not render as `<button>`.

---

## 7. Theme, and the onboarding surface

The rebrand ships **one theme**. Blue 600 is the canvas; light surfaces are
Blue 50, Blue 100 and White sitting on it. The old dark/light dual-token model
(`theme.css` light-default vs `colors_and_type.css` dark-default, with opposite
defaults) is retired rather than ported.

The nav theme toggle is removed. If theming returns it must be specified as a
full surface matrix, not a per-component override, since every fill in this
system is chosen by the surface beneath it.

### Onboarding is the app, and the app is light — decision

Steps 1–10 and Done are **White cards on Black 100 lines with Blue 600
emphasis**. Blue 600 is spent only where nothing is known: the **Paused** state,
and the blind match card. The all-blue alternative was built, compared and
dropped. This is **normative, not a preference**.

Consequences, all of which follow from the one decision:

- The progress bar's complete segments are Blue 600 on light, Yellow 600 on blue.
- **Yellow is absent from the light flow entirely** — it has no legal use on a
  light surface, so onboarding has no yellow in it at all until Paused.
- Emphasis inside every heading is Blue 600.
- Paused earns blue by the 5.11 rule: matching is suspended and nothing is known
  yet. It is the same held breath as the blind card.

### Chrome: scroll and type

- Scroll tracks get a **reserved gutter** (`scrollbar-gutter: stable`, 8px thumb
  inset 2px, Black 100 on light / Blue 500 on blue). A track never overlays
  content, so a row does not reflow the moment a list gets one item longer.
- A card's header and footer are **fixed**; only the body scrolls. Progress and
  the primary action never move between steps.
- **No emoji in the type system.** The objectives list loses its icons. City
  flags stay: they are data, not decoration.
- **No italic display face exists**, so former italic quotes become Body 5A in a
  well — same role, different signal.

---

## 8. Type roles

| Role | Style | Token |
|---|---|---|
| Card heading, large | Parkinsans Regular 40 / 100% | Heading 3 |
| Card heading, small | Parkinsans Regular 32 / 100% | Heading 4 |
| Profile name, large | Archivo Medium 20 / 100% | Title 1 |
| Profile name, small | Archivo Medium 16 / 20px / 0.5px | Title 3 |
| Section label | Archivo Medium 14 / 100% / 0.5px | Title 4A |
| Body, large | Archivo Regular 16 / 120% | Body 3 |
| Body, small | Archivo Regular 14 / 16px | Body 4 |
| Pill, handle, description | Archivo Regular 13 / 18px | Body 5A |
| Button | Archivo Medium 13 / 120% / 1px | Button 3 |
| Step counter | Archivo Medium 13 / 120% / 1.5px | Title 5 |
| Metadata | Archivo Light 12 / 120% | Body 6 |

Two fonts only: **Parkinsans** display, **Archivo** everything else. Any
"Inter" in a Figma export is Archivo.

Archivo **Light (300)** is now loaded in both entry points, so Body 6 and the
timezone label render as specified. The remaining type gap is the absence of a
face for code or spec display (see 1, "No third face").

---

## 9. Onboarding — the KYC flow

Twelve screens. Ten steps, plus Done and Paused. The card is a fixed box:
`min(720px, 90vh)` tall, `560px` wide (`375` mobile), radius 16, padding 16,
gap 16, with a fixed header, a scrolling body and a fixed footer.

| # | Step | What the screen is |
|---|---|---|
| 1 | Getting started | Three rows in one bordered list. Nothing else. |
| 2 | Your location | The city list, each row carrying a DaylightBand. See below. |
| 3 | Your intent | Eight rows, numeric index, capped at three. |
| 4 | Your match | Two accordions: who they are, where they are based. |
| 5 | Your texture | Chip cloud plus a free-text field that adds to it. |
| 6 | Your voice | Textarea + counter, a YES/NO segmented toggle, examples in wells. |
| 7 | Your profile | Hatched empty avatar, secondary upload button. Skippable. |
| 8 | Your presence | Four FieldShells with text marks. Skippable. |
| 9 | Your role | Role families as chips, then the meet-list under "Open to anyone". |
| 10 | Your calendar | Day chips, three window rows, and the week drawn on a band. |
| 11 | Done | Light. Everything is now known. |
| 12 | Paused | **Blue.** Nothing is known yet. |

**The footer never changes height.** A primary (CONTINUE / FINISH) with a
tertiary under it. The tertiary is the deferral slot and its meaning depends on
the step: SKIP FOR NOW where the answer is optional (7, 8), FINISH LATER
everywhere else, which routes to Paused.

### Desktop is two columns

Per the `Implement Design Specifications` frame in the Figma file: the card sits
left, and a full-height illustration plate sits right, equal width, 16px gap.

```
card    max 600   fixed header / scrolling body / fixed footer
plate   max 600   radius 16, 1px Black 100 border, image object-cover
gap     16
```

**The breakpoint is a CONTAINER query, not a viewport one** — `@[1160px]`. The
same flow renders inside a full-screen modal and inside a fixed-width gallery
frame, and only the space actually available to it should decide whether the
plate appears. Below that the plate drops entirely and the card centres in
whatever is left; a squeezed plate beside a squeezed card is worse than no
plate.

### The plates

White-ground portraits from `white_themes/portrait_art` — blue stipple on white,
so a plate sits flush beside a White card with no seam. The marketing set's
blue-ground plates would cut the composition in half and are not reused here.

Encoded by `scripts/optimize-illustrations.mjs --kyc` at **900px q86** (the
masters are 1103px wide; the column renders at ~600). Below roughly q84 the
dither bleeds — that is the floor, not a default.

The pairing is by MEANING, not sequence: each plate answers the question its
step is asking.

| Step | Plate | Why |
|---|---|---|
| 1 Getting started | `sunset_on_fire_escape` | two people, a drink, golden hour — the promise |
| 2 Your location | `hilltop_observatory` | looking out across distance |
| 3 Your intent | `men_at_chess_square` | a deliberate move |
| 4 Your match | `graduation_reunion` | a cohort of peers |
| 5 Your texture | `books_blooms_zooms` | the eclectic pile of things a person likes |
| 6 Your voice | `pottery_studio_workshop` | shaping something by hand |
| 7 Your profile | `ballet_dancers_leap` | being seen |
| 8 Your presence | `street_food_vendors` | out in the world, findable |
| 9 Your role | `harvesting_grape_clusters` | work and craft |
| 10 Your calendar | `movie_night_under_stars` | a standing evening plan |
| 11 Done | `marathon_high_five` | arrival |
| 12 Paused | **none** | the one blue screen; the bareness is the point |

`alt` text describes the SCENE, not the step. The plate is atmosphere, and a
screen reader already reading "Your location · Who could you meet tonight?" does
not need the heading recited back to it as an image label.

### Step 2 is a redesign, not a restyle

The old step was a search box over a flat list: it asked for a city and gave
nothing back. Location matters here only because it decides who you can actually
meet, so the row now carries that answer — each city's 6–9pm drawn on YOUR
24-hour clock. Picking a city re-frames every other row against it. This is
where DaylightBand (5.12) came from.

### Data: role families, not job titles

Replaces `ROLE_OPTIONS`.

```
Founder · Operator · Engineer · Designer
Researcher · Writer · Artist · Investor
Educator · Healthcare · Public service
Trades & craft · Student · Something else
```

A title list can never be complete — it fails the drone pilot, the midwife, the
machinist — and an incomplete list does not read as "we missed one", it reads as
"people like you are not who this is for". Families cover the space.

- **"Something else"** opens a free-text field and **persists as typed**, never
  as the literal string "Something else". The step will not advance on an empty
  field, because an empty role silently drops the user out of role-fit matching.
- **"Open to anyone"** sits ABOVE the meet-list, clears it and supersedes it: it
  is not one more checkbox, it is the answer that makes the list moot. It
  persists as an empty preference list, which the matcher already reads as "do
  not filter on role".
- `Creative` and `Other` are retired. Profiles written before the rebrand still
  carry them; they are recognised, not offered.

### Removed

- Step 1's "See it in motion" video block. A user already inside the product
  does not need a demo of it.
- Cormorant Garamond, Inter, `#7FFF00`, and every alpha-derived colour across
  all twelve screens.
- Emoji from the objectives list.
- The 26px switch on Step 6: a binary the segmented toggle already answers.

### Open

- **Step 10 as a band.** The three window rows stay as the input — they carry
  the `startHour`/`endHour` bounds the matcher consumes, and a coarse preset is
  what the product promises. Replacing them with a draggable 24-hour track is a
  different interaction, unspecified anywhere, and is not invented here. The
  band currently reads out what the rows chose.
- **Unselected control contrast.** An unselected CheckDot ring and an unselected
  row border are Black 100/200 on White, which is below the 3:1 non-text
  contrast guideline. It is what the reference specifies and it is applied as
  specified; whether the ring should step to Black 300 is a real decision, not a
  detail.
- **Heading size.** The reference draws step headings at 34px, which is not a
  named style. Snapped to **Heading 4 (32)** rather than registering a new size
  for a 2px difference.
