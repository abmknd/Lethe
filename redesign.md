# Relethe Redesign System

**Status:** Staged rebrand. Companion to [design.md](design.md) (which still documents the live pre-rebrand app). This file describes the new visual system being built under [src/rebrand/](src/rebrand/) and will be promoted into the codebase when the rebrand is completed.

**Principle:** Electric blue is the canvas. White and pale lavender are the panels that sit on it. Yellow is emphasis, never a surface (except the warm light-section canvas, Yellow 50).

The runtime source of truth for these tokens is [src/rebrand/rebrand.css](src/rebrand/rebrand.css), scoped to `.rebrand-root` so nothing leaks into the live app.

---

## 1. Typography

Two fonts, non-overlapping roles. **No Inter** — everything that is not a display heading is Archivo.

| Font | Role |
|---|---|
| **Parkinsans** | Display: hero, section headings, card titles. Weight 400 (Regular) everywhere except the wordmark. |
| **Archivo** | Everything else: body, UI, buttons, tags, footer, input. Variable font pinned to `wdth 100`. Weight 400 / 500. |

Loaded weights: Parkinsans 400 / 600, Archivo 400 / 500.

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

> Note: earlier extractions labelled Body 5A/5B and the tags as "Inter". That was wrong — they are Archivo. There is no Light (300) weight loaded, so any "Archivo Light" note falls back to Regular.

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
ramps are defined in [src/rebrand/rebrand.css](src/rebrand/rebrand.css):

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

- **Radii:** cards `16px`; pill buttons `40px`; email field `48px`; tags `8px`.
- **Spacing (4px base), observed:** tag/label internal `4px`, card content stacks `12–16px`, section-inner gaps `16–36px`, large section padding `64 / 120px`.
- **Section paddings:** Story `220 / 120`; Who + How `120`; Survey `277 / 64`; Nav `40 / 12`.
- **Effect — `toggle-shadow`:** symmetric double drop-shadow, `2px −2px` and `−2px 2px`, both 10px blur, 0 spread, black @ 10%.

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
| **signal-pill** (neutral) | fill `--color-black-100` · text `--color-black-700` | *TBD* |

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

### 5.7 Compact list

Container radius `16px`, 1px Black 200 border. Items padding `12px`, gap
`28px`, space-between, 1px Black 200 bottom border (last item none).

```
complete     fill Black 100   icon tile Blue 200   check Blue 600 20px
incomplete   no fill          icon tile Black 100  no check
icon tile    48 x 48, padding 14, radius 12
title        Body 4   Archivo Medium 14 / 16px / Black 700
description  Body 5A  Archivo Regular 13 / 18px / Black 500
```

### 5.8 Progress bar

Track padding `2px`, gap `2px`, radius `40px`, fill Blue 600. Segments 4px
tall, fill width, first rounds left `8px`, last rounds right `8px`.

```
complete / active   Yellow 600
remaining           Blue 500
```

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
| disabled | fill White, text Black 400, no border, `cursor: not-allowed` |
| loading | label swaps to progressive text, control stays sized, pointer events off |
| error | 1px Error 600 border, message below in Body 5A / Error 600 |
| selected | descriptive-pill fill for that surface |

Non-interactive by definition: title-pill, descriptive-pill, progress bar.
These must not render as `<button>`.

---

## 7. Theme

The rebrand ships **one theme**. Blue 600 is the canvas; light surfaces are
Blue 50, Blue 100 and White sitting on it. The old dark/light dual-token model
(`theme.css` light-default vs `colors_and_type.css` dark-default, with opposite
defaults) is retired rather than ported.

The nav theme toggle is removed. If theming returns it must be specified as a
full surface matrix, not a per-component override, since every fill in this
system is chosen by the surface beneath it.

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

**Gap:** Body 6 and the timezone label specify Archivo **Light (300)**, which
is not currently loaded. Weight 300 must be added to the font import or these
render as Regular with no warning.
