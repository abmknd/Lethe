# Rebrand handoff

Read this first in a new session. It is the state of the rebrand, the rules
that govern it, and the things that were learned the hard way.

**Branch:** `front-end-demo-updates` · **Baseline tag:** `pre-rebrand-baseline`
**Companion docs:** `redesign.md` (the system) · `REBRAND-PLAN.md` (the phases)

---

## 1. Where we are

| Phase | State |
|---|---|
| 0 · Safety, branch, baseline tag | done |
| 1 · Specify the system in `redesign.md` | done |
| 2 · Primitive layer | done |
| 3 · Landing page on the system | done |
| 4 · **In-app screens** | **in progress** |
| 5 · Non-React surfaces (email, favicon, og-image) | not started |
| 6 · Promote and sunset `src/rebrand/` | not started |

### Done in Phase 4 so far
- Token spine promoted to `:root` in `src/styles/tokens.css`, shared by app
  and rebrand. 55 tokens. `rebrand.css` declares none of its own.
- **Match card** (`src/rebrand/app/MatchCard.tsx`): blind / awaiting / revealed.
- **All twelve onboarding screens**, rebuilt light on the ramp from the KYC
  reference. Shell split into `KYCFlow` (the card) and `KYCModal` (the scrim),
  so the gallery drives all twelve without auth.
- **Desktop two-column layout** per the Figma `Implement Design Specifications`
  frame: card left, illustration plate right, gated on a CONTAINER query at
  1160px so the gallery's fixed frames behave correctly. 11 plates committed
  from `white_themes/portrait_art` (5.0MB, 900px q86).
- **New primitives:** DaylightBand, SelectRow, CheckDot, Chip, Well,
  ListContainer/ListBand, FieldShell/FieldInput, Textarea, Accordion, IconTile,
  StepHeader/StepSection/SectionLabel, Button `tertiary`.
- **`src/styles/rebrand-surface.css`**, imported by the app AND the rebrand.
- **Component gallery** at `gallery.html`: step chips 1–12, 560/375 toggle.

### Next up — in this order

Ordered by the seam rule (REBRAND-PLAN, "How this lands in the product"): the
boundary a user actually walks across comes first.

1. **ConnectPage** — `KYCPaused` says "You'll find it in Connect", so onboarding
   hands the user straight across a brand boundary today. 363 lines, 19 hexes,
   no chartreuse: small, and it closes the seam we just created.
2. **Post card → Feed** — drawn in Figma on the `components` board. Feed itself
   is only 6 hexes; the card is the work.
3. **Profile card → ProfilePage** — also drawn in Figma (Blue 100 header band,
   availability toggle, checklist, interest pills). 687 lines, 49 hexes. Note
   Figma tints completed checklist rows blue where redesign.md 5.7 says
   Black 100 — reconcile before building.
4. **MatchesPage / MatchRevealPage** — 8 and 10 hexes; both consume the match
   card, which already exists.
5. **MessagesPage** — 452 lines, 25 hexes, 15 chartreuse.
6. **SettingsPage** — 1366 lines, 77 hexes, 36 chartreuse. The biggest single
   surface in the app; do it last, when every primitive it needs exists.

Counts from `grep` on 2026-08-16, not from the Changelog.

---

## 2. Rules that must not be broken

These came from the user directly. Violating one is a defect, not a preference.

1. **Tokens are the source of truth.** Any hex not in a ramp is drift and snaps
   to the nearest step. Never introduce a new hex. Semantic aliases are allowed
   but must resolve to a ramp token.
2. **No opacity produces a colour.** Hover moves a ramp step, pressed moves two,
   disabled has its own fill. Alpha survives only as a material effect
   (overlapping ink in the spirograph), never as a stand-in for a token.
3. **Website hover is a TEXT change only.** Fills and borders hold.
4. **Everything must be replicable.** No one-off button or card. If it is built,
   it registers in `redesign.md` as a component or a convention.
5. **Two fonts only:** Parkinsans display, Archivo everything else. Any "Inter"
   in a Figma export means Archivo.
6. **Emphasis is surface-dependent.** On blue: white heading, Yellow 600
   emphasis. On light: Black 700 heading, **Blue 600** emphasis. Yellow never
   appears on a light surface.
7. **Missing screens get built in-phase**, not deferred. If a screen we are
   rebranding links to one that does not exist yet, build it then.
8. **The app is light mode, onboarding included**, unless a blue surface is
   semantically earned (see the surface convention below). The all-blue
   onboarding built earlier was compared against this and dropped. Normative.

### Conventions established
- **SURFACE ENCODES WHAT IS KNOWN.** Blue 600 = not yet known (the blind
  offer). Light = known (after reveal). Any future screen with an unknown state
  inherits this.
- **Blue elevation:** Blue 700 recessed / Blue 600 base / Blue 500 raised. A
  border is always one ramp step lighter than its surface.
- **Pills are three categories:** title-pill (names the block), descriptive-pill
  (qualifies it), signal-pill (user data, wraps). The first two are never
  interactive and must not render as `<button>`.

---

## 3. Hard-won knowledge

### The cascade (this one cost the most)
`colors_and_type.css` was **unlayered**, and unlayered CSS outranks every
cascade layer. Its bare `h1`–`h6` and `p` rules were beating every Tailwind
utility inside rebrand components. Three parts to the fix, each of which failed
alone:

1. `@import './colors_and_type.css' layer(legacy);` — no rule inside it changed.
2. The element reset lives in `@layer base`: above legacy so it clears the old
   styles, below utilities so components still win. Unlayered it flattened
   every heading to 16px.
3. **The `@layer` order statement must come BEFORE `@import 'tailwindcss'`.**
   Layer statements are legally allowed there. After it, Tailwind declares its
   layers first and `legacy` is appended LAST, becoming the highest priority.

**If a rebrand component ignores its own classes, check the cascade before the
component.** Debug by injecting a probe element and comparing a utility that is
used in source against one that is not, which separates a Tailwind scanning
problem from a cascade problem.

### Reskin means markup only
A "verbatim" copy of the diagnostic questions was not verbatim: question 1 was
paraphrased and its options reordered. Scoring maps by **option letter**, so it
silently computed the wrong archetype while looking correct. Domain logic now
lives in `src/lib/diagnostic.ts`, extracted **mechanically by line range**, not
retyped. `npm run verify:diagnostic` asserts scoring and all 12 result variants.

**Any time a migration involves retyping content, extract it instead.**

### The cascade, part two
Two more of the same class, both found by measuring rather than looking:

- `.rebrand-root` was **unlayered**, so its `background: Blue 600` beat the
  `bg-*` utility on the same element and the onboarding scrim rendered blue
  instead of Black 700 at 80%. It now sits in `@layer base`.
- Moving `.rebrand-display` into `base` alongside it then broke every heading:
  the element reset `.rebrand-root :is(h1…h6, p…)` is `(0,2,0)` and
  `.rebrand-display` is `(0,1,0)`, so `font: inherit` won and Parkinsans
  silently became Archivo. Fixed by declaring it after the reset at matching
  specificity.

**And the one nobody had noticed:** the app entry never imported `rebrand.css`,
so in the REAL app `.rebrand-root` matched nothing — no fonts, no reset — while
the gallery looked perfect. The surface now lives in
`src/styles/rebrand-surface.css`, imported by both. Check the app, not only the
gallery.

### Other traps hit
- Guarding with `if ('vLocal' not in src)` matched the existing `vLocalY`, so a
  varying was never added and the program silently failed to link.
- The gallery must import the app stylesheet too, or KYC steps stack
  unpositioned and it looks exactly like a broken migration.
- `fullWidth` (`w-full`) fights a sibling in a flex row. Use `flex-1`.
- A JSX comment cannot be the first thing inside an expression container.

---

## 4. How to run things

```bash
npm run dev                  # app + previews on :5173
```

| URL | What |
|---|---|
| `/rebrand-preview.html` | the rebranded landing, standalone |
| `/gallery.html` | in-app components without auth |
| `/rebrand` | the landing inside the real router |

```bash
npm run build                # must pass before any commit
npx tsx scripts/verify-diagnostic.mjs   # survey scoring intact
node scripts/optimize-illustrations.mjs # masters -> WebP q94 @1280
```

---

## 5. Open flags

**In my court**
- The old `src/app/components/DiagnosticModal.tsx` still holds its own copy of
  the survey data. It should import from `src/lib/diagnostic.ts` so the two
  cannot drift, or be deleted once the rebrand landing goes live.
- `SignalPill` exists but nothing uses it on the landing; it is for in-app.
- Determine which of the 59 `src/imports` Figma dumps are live; the rest are
  dead weight that can reintroduce old brand values.
- `OnboardingOne/Two/Three.tsx` and `AdminOnboardingPage` are still old brand.
  Admin now offers the 14 role families through the same `ROLE_OPTIONS`, so it
  is correct but ugly.

**In your court**
- **Committed art weight.** Onboarding added 5.0MB of WebP. Dropping the KYC
  encode to 760px q82 would halve it; the constant is one line in
  `scripts/optimize-illustrations.mjs`.
- **Role taxonomy migration.** `ROLE_OPTIONS` went from 6 entries to 14
  families. Profiles saved before this carry `Creative` or `Other`, which are no
  longer offered — the matcher compares these strings, so those users are
  matching against values nothing new will produce. Needs a backfill decision.
- **Step 10 as a band** and the **unselected-control contrast** question, both
  logged under redesign.md 9 "Open".
- `src/assets/artworks/` is ~366MB, gitignored, and **not backed up by
  git**. A manual folder copy exists. It needs a real home.
- OAuth credentials (LinkedIn OIDC primary) are unset; blocks verification
  tiers and the sign-in screen design.
- `design.md` still describes the OLD system. `redesign.md` replaces it at
  Phase 6; until then design.md is stale and should not be followed.
- Roadmap screens that do not exist yet are listed in `REBRAND-PLAN.md` 4a
  (call join screen, lobby, reminders, suspension, reviews, disputes, admin
  surfaces). Decision on record: build them as encountered during Phase 4.
