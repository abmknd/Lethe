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

### Off-ramp one-offs (used in the design, not part of any ramp)

```
#EEEEF7   neutral tag fill
#8F8FFF   input placeholder (lavender)
#3A3AFF   blue-card 1px border (near Blue 500 #3333F5, but distinct)
#EBEBFA   inactive scroll-bar segment
```

### Usage rules

- **Blue 600 `#0000F2`** is the primary canvas — hero, story, survey, footer backgrounds.
- **Yellow 50 `#FFFDF2`** is the *light* section canvas — "Who is this for?" and "How it works" backgrounds (warm cream).
- **Blue 100 `#E6E6FE`** is the light card fill (Who card; How-it-works Steps 1 & 4). White is not used as a card fill in these sections.
- **Blue 700 `#0000B8`** — depth tags (`HOW IT WORKS` on blue cards, `WHY DO I NEED THIS?`, `NETWORK DIAGNOSTIC`) and the theme-toggle track.
- **Yellow 600 `#FFDD00`** — emphasis text only, always inside white/blue copy, never a fill.
- Blue cards (Steps 2 & 3) are Blue 600 with a `#3A3AFF` 1.25px border.

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

The four fills that aren't Figma color styles keep semantic names:

```
--color-tag-neutral  #eeeef7   neutral tag fill
--color-placeholder  #8f8fff   input placeholder
--color-card-border  #3a3aff   blue-card border (near Blue 500)
--color-scroll-off   #ebebfa   inactive scroll segment
```

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
| Hero | Blue 600 | WebGL boulder+figures art; H1 white + "never alone…" Yellow 600; nav pill; bottom email field (rounded-48, white border). |
| Story | Blue 600 | `WHY DO I NEED THIS?` depth tag; H2 with yellow second line. |
| Who is this for | **Yellow 50** | Blue 100 card, image left + quote right (Heading 3, `#0000F2` lead-in + black); tags `WHO NEEDS THIS?` (neutral) / `CREATORS` (filled); 3-bar scroller. |
| How it works | **Yellow 50** | 4 cards — Steps 1 & 4 Blue 100 (black text, neutral + filled tags), Steps 2 & 3 Blue 600 w/ `#3A3AFF` border (white text, depth + neutral-blue tags). |
| Survey | Blue 600 | Spirograph flower; `NETWORK DIAGNOSTIC` depth tag; H2 (no yellow highlight); `RUN DIAGNOSTIC` primary pill. |
| Footer | Blue 600 | `RELETHE, INC · 2026` / centered logomark / `NETWORKING WITHOUT PERFORMANCE`, Archivo 13. |

---

## 5. Components

- **Primary button:** white fill, Blue 600 text, pill radius (`40px`).
- **Secondary button:** transparent, 1px white border, white text (SIGN IN, RUN DIAGNOSTIC).
- **Tags (rounded-8):** neutral `#EEEEF7` / black · filled Blue 600 / white · depth Blue 700 / white · neutral-blue `#EEEEF7` / Blue 600 text (STEP on blue cards).
- **Theme toggle:** Blue 700 track, active state Blue 600 circle with `toggle-shadow`.
