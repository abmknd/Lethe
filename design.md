# Relethe Design System

**Version:** reflects the repo as of 2026-07-04.
**Tagline:** Networking without the performance.
**Principle:** Dark is the brand. Light is functional.

This document describes the design system as it exists in the codebase today. The CSS sources of truth are in `src/styles/`, imported in this order by [index.css](src/styles/index.css):

1. `fonts.css` : Google Fonts imports
2. `tailwind.css` : Tailwind v4 entry (`@import 'tailwindcss'`)
3. `theme.css` : in-app semantic tokens + Tailwind color mappings (light default, `.dark` override)
4. `colors_and_type.css` : brand token layer v2 (dark default, `.light` override)

---

## 1. Typography

Three fonts, non-overlapping roles. Never mix roles.

| Font | Token | Role |
|---|---|---|
| Cormorant Garamond | `--font-display` | All headings: display, hero, in-app titles. Almost always italic, weight 300 to 400. |
| Inter | `--font-sans` | All body copy, paragraphs, UI text, forms. Weight 300 to 600. |
| DM Mono | `--font-mono` | Eyebrows, buttons, meta, all-caps labels, tags, code. Weight 300 to 500. |

Loaded weights (from `fonts.css`):
- Cormorant Garamond 300 / 400 / 600, roman and italic
- Inter 300 / 400 / 500 / 600
- DM Mono 300 / 400 / 500

### Type scale

```
--text-2xs:  9px      --text-xl:  22px
--text-xs:  11px      --text-2xl: 24px
--text-sm:  13px      --text-3xl: 28px
--text-md:  15px      --text-4xl: 40px
--text-lg:  17px
--text-display: clamp(40px, 6vw, 72px)   /* marketing display */
--text-hero:    clamp(36px, 5vw, 68px)   /* section h2 */
```

Base font size is 16px on `html`. The in-app layer (`theme.css`) caps its display size lower: `--relethe-text-display: clamp(28px, 4vw, 40px)`.

### Line height and tracking

```
--leading-tight: 1.10   --track-tight: -0.03em   (display headings)
--leading-snug:  1.20   --track-body:   0.02em   (body)
--leading-normal:1.40   --track-caps:   0.12em   (meta caps)
--leading-relaxed:1.65  --track-ui:     0.20em   (buttons)
--leading-loose: 1.85   --track-wide:   0.25em
                        --track-xwide:  0.32em   (eyebrows)
```

### Recurring text patterns

- **Display / h1 / h2:** Cormorant Garamond, weight 300, italic, tight leading, negative tracking.
- **Eyebrow** (`.eyebrow`, `.label-caps`): DM Mono, 11px, uppercase, `--track-xwide`, accent-tinted color. Appears at the top of every page and section.
- **Body** (`p`, `.body`): Inter 300, 15px, `--leading-relaxed`, muted color (`--fg-muted`).
- **Meta** (`.meta`): DM Mono, 11px, `--track-caps`, ghost color.
- **Pull quote** (`.quote`): Cormorant Garamond italic 300, 28px, with `em` spans colored in the accent.

---

## 2. Color

### Primitive palette

```
--relethe-chartreuse:        #7FFF00   primary accent, DARK MODE ONLY
--relethe-chartreuse-bright: #ADFF2F   glow + ripple variant, dark only
--relethe-chartreuse-pale:   #DFFF00   confetti / highlight, dark only
--relethe-chartreuse-dim:    #5D9F00   interactive accent in light mode (WCAG AA)

--relethe-black:  #000000
--relethe-ink:    #050705   true page background (landing)
--relethe-ink-2:  #0a0d0a   cards on ink
--relethe-ink-3:  #020402   deep wells / story sections

--relethe-grey-dark:  #3A3A3A
--relethe-grey:       #6B6B6B
--relethe-grey-light: #9B9B9B

--relethe-paper:   #FFFFFF
--relethe-paper-2: #F8F8F8
--relethe-paper-3: #EFEFEF
```

### The chartreuse rule

Chartreuse `#7FFF00` only works on dark backgrounds. Hard rules, enforced in `colors_and_type.css`:

- In light mode, `#5D9F00` replaces it on **interactive elements only** (links, active states, focus rings, primary buttons).
- All **decorative** chartreuse (glows, tinted backgrounds, tinted borders) is suppressed entirely in light mode, set to neutral equivalents or `none`.
- No chartreuse in light-mode shadow values.

### Semantic tokens (dark, the brand default)

```
--bg:          #050705 (ink)     --fg:         #FFFFFF
--bg-raised:   #0a0a0a           --fg-dim:     rgba(255,255,255,0.88)
--bg-elevated: #1a1a1a           --fg-muted:   rgba(255,255,255,0.42)
--bg-subtle:   #0f0f0f           --fg-ghost:   rgba(255,255,255,0.25)
--bg-overlay:  #0b0e0b           --fg-whisper: rgba(255,255,255,0.16)

--line:        rgba(255,255,255,0.07)
--line-strong: #1a1a1a
--line-dim:    #3A3A3A

--accent:        #7FFF00
--accent-bg:     rgba(127,255,0,0.06)
--accent-border: rgba(127,255,0,0.22)
--accent-text:   rgba(127,255,0,0.85)
--accent-glow:   0 0 80px rgba(127,255,0,0.08)
```

Light mode flips backgrounds to white/paper, text to black/greys, and swaps the accent per the chartreuse rule above.

### Status colors

```
--status-flowing:   #7FFF00    --status-met:       #A3CC66
--status-fading:    #CC9933    --status-cancelled: #CC6B6B
--status-faded:     #6B6B6B    --danger:           #DC2626
--status-upcoming:  #ADFF2F
```

These encode the product's decay language: connections flow, fade, and expire.

---

## 3. Space, shape, elevation

### Spacing (4px base)

```
--space-1: 4    --space-5: 20   --space-12: 48
--space-2: 8    --space-6: 24   --space-16: 64
--space-3: 12   --space-8: 32   --space-20: 80
--space-4: 16   --space-10: 40  --space-24: 120   --space-32: 140
```

### Radii

```
--radius-xs: 4   --radius-lg: 16    --radius-pill: 9999
--radius-sm: 6   --radius-xl: 20
--radius-md: 10  --radius-2xl: 28   (buttons use this)
```

### Shadows

```
--shadow-card:    0 25px 50px -12px rgba(0,0,0,0.60)
--shadow-float:   0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(127,255,0,0.06)
--shadow-overlay: 0 25px 50px -12px rgba(0,0,0,0.90)
--shadow-demo:    layered black + 1px white ring + chartreuse glow
```

Dark-mode shadows may carry a faint chartreuse glow. Light-mode shadows are lighter and never do.

### Icons

Lucide icons, `strokeWidth` around 1.5. Sizes: `--icon-xs` 14, `--icon-sm` 16, `--icon-md` 18, `--icon-lg` 20, `--icon-xl` 24.

---

## 4. Motion

```
--dur-fast:   200ms     --ease-spring: cubic-bezier(0.16, 1, 0.3, 1)
--dur-normal: 300ms     --ease-out:    cubic-bezier(0.22, 1, 0.36, 1)
--dur-slow:   450ms
--dur-slower: 600ms
```

Signature motion patterns in the codebase:

- **KYC step transitions** (`theme.css`): steps slide 40px horizontally with a 0.98 scale, 400 to 450ms on the spring ease.
- **Ripples**: expanding circular strokes in dim chartreuse (`reletheMockRipple`, `emptyRipple`), used for depth indicators and empty states.
- **`pulse-slow`**: 3s opacity breathing for ambient elements.
- **Landing page** ([LandingPage.tsx](src/app/LandingPage.tsx)): GSAP-driven entrances and a typewriter story section; a full-viewport `WaterRippleCanvas` cursor-trail effect; a custom two-part cursor (5px chartreuse dot + 32px ring, `cursor: none` on body).

Motion is slow and liquid on marketing surfaces, quick and springy in the app.

---

## 5. Texture

- **Noise overlay** (`.relethe-noise`): fixed full-viewport SVG `feTurbulence` fractal noise at 2.2% opacity, 200px tile, over every landing surface.
- **Water canvas**: fixed, pointer-events none, z-index 0, behind all landing content.
- **Nav blur**: fixed 56px nav, `rgba(5,7,5,0.88)` with `backdrop-filter: blur(20px)` and a 1px bottom hairline.

---

## 6. Components

### Buttons

Two implementations exist:

**CSS classes** (`colors_and_type.css`): `.btn` base is DM Mono 11px uppercase with `--track-ui`, 12px/24px padding, `--radius-2xl` corners, transparent by default. `.btn-primary` is chartreuse text + chartreuse border, filling to a 12% chartreuse tint on hover (10% of `#5D9F00` in light mode). `.btn-ghost` is muted text + hairline border, brightening on hover.

**React component** ([Button.tsx](src/app/components/ui/Button.tsx)): variants `primary` / `secondary` / `ghost` (grey text turning chartreuse on hover) and `create` (chartreuse text, chartreuse border, pill radius, tint fill on hover). Optional `showArrow` renders a Lucide `ArrowRight` that slides 4px right on hover. All variants are DM Mono style: 11px, `tracking-[0.3em]`, uppercase, light weight.

Buttons are text-first and quiet. There is no solid-filled brand button; emphasis comes from the chartreuse outline and tint, not fill.

### shadcn/ui layer

`src/app/components/ui/` carries the full shadcn/ui kit (dialog, dropdown, select, tabs, sheet, sonner, etc.) themed through the Tailwind token mappings in `theme.css`. Prefer the Relethe semantic utilities (below) when styling them.

### Tailwind utilities

`theme.css` maps semantic tokens into Tailwind v4 via `@theme inline`, so components use classes like:

```
bg-relethe-surface    text-relethe-fg      border-relethe-line
bg-relethe-raised     text-relethe-dim     border-relethe-line-dim
bg-relethe-subtle     text-relethe-muted   border-relethe-accent-border
bg-relethe-overlay    text-relethe-ghost   text-relethe-accent-text
bg-relethe-accent-bg  text-relethe-accent  (+ status colors)
```

---

## 7. Theming

- [ThemeContext.tsx](src/app/context/ThemeContext.tsx): React context, default theme `dark`, writes `data-theme` on `<html>`.
- [ThemeAwareWrapper.tsx](src/app/components/ThemeAwareWrapper.tsx): toggles the `.dark` class on `<html>` from the same context.

Note the two token layers have opposite defaults: `theme.css` (in-app) is light by default with a `.dark` override, while `colors_and_type.css` (brand/marketing) is dark by default with a `.light` override. The landing page is effectively dark-locked and carries its own scoped style block with local variables (`--dark`, `--text`, `--dim`, `--ghost`, `--mono`, `--sans-serif`) that mirror the system values.

---

## 8. Brand assets and voice

- **Logo:** `public/logomark.png`, plus SVG components in `src/imports/ReletheLogo.tsx` and `ReletheSocial*.tsx`. Favicon at `public/favicon.png`, social card at `public/og-image.png`.
- **Name:** always "Relethe" (the product was renamed from "Lethe"; no visible text should say Lethe).
- **Positioning:** "Signal-based Networking". Matches up to five people a week based on who you actually are, not who you perform to be.
- **Copy voice:** lowercase-calm body, mono uppercase whispers for labels, italic serif for anything with feeling. Copy leans on the memory/decay metaphor: signal, fading, flowing, surfacing.

---

## 9. Rules of thumb

1. Dark ink (`#050705`), not pure black, for brand surfaces. Pure black is reserved for the in-app base layer.
2. Chartreuse is an accent, never a surface. Use tints (6% bg, 22% border) for anything larger than text or a stroke.
3. Never use raw chartreuse in light mode. Interactive elements get `#5D9F00`; decoration gets nothing.
4. Headings are italic serif, weight 300 to 400. Do not bold Cormorant Garamond.
5. Anything uppercase is DM Mono with generous tracking (0.12em minimum, 0.32em for eyebrows).
6. Body text sits at muted opacity (`--fg-muted`), not full white. Full white is for headings and key values.
7. Borders are hairlines: 1px at 7% white (dark) or `#E5E5E5` (light).
8. Use the semantic tokens (`--bg`, `--fg`, `--accent`, `bg-relethe-*`), not the primitives, so both themes hold.
9. Motion uses the spring ease and the duration tokens. Nothing snaps; nothing takes over 600ms except ambient loops.
10. New UI goes through the Tailwind `relethe-*` utilities or the token variables. No new hex values.
