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

### Phase 4, part one — onboarding (done, 2026-08)
- Token spine at `:root` in `src/styles/tokens.css`, shared by app and rebrand.
- **All twelve onboarding screens** on the ramp, desktop two-column per the
  Figma spec frame, 11 portrait plates committed.
- Primitives: DaylightBand, SelectRow, CheckDot, Chip, Well, ListContainer,
  FieldShell, Textarea, Accordion, IconTile, StepHeader, Button `tertiary`.
- `src/styles/rebrand-surface.css`, imported by app AND rebrand.
- Component gallery at `gallery.html`.

### Phase 4, part two — the app shell (current work, 2026-08-30/31)

**THE SURFACE IS `src/rebrand/app/AppShell.tsx`** — FEED / MATCHES /
COMMUNITIES, built from `relethe-feed` 750:184 (feed), 907:22311 (matches) and
972:13311 (suggested). Preview at `/rebrand/app`.

**The CONNECT design is RETIRED.** CONNECT / FEED in the top bar, a three-up tab
rail, a 600-wide card. `ConnectSurface`, `SuggestionCard`, `MatchCard` and the
old `AppHeader` carry a FROZEN header and take no further investment. Its
preview route is deleted. They still exist only because `/connect` mounts them.

**A design system exists at `src/rebrand/ds/`** — one file per Figma component,
node id on each, re-exported from `ds/index.ts`. Avatar, AvatarStack,
BadgeButton, BadgeIcon, BadgeText, Button, ButtonText, Chip, Divider, Icon,
LocationMeta, NavItem, SectionLabel, Sidebar, SuggestedProfile, TabBar, Tag,
ToggleButton, Questionnaire, and the type scale in `ds/type.ts`.

**Icons are local, generated, and committed.** `scripts/icons.manifest.json`
records name → Figma node → size → provenance URL; `node scripts/import-figma-icons.mjs`
regenerates `src/assets/system_icons/`. Never hand-write a glyph.

**`/connect` (live) has been migrated** onto AppShell as MATCHES/Suggested. It
is the first real page on the new shell and the template for the rest.

### Next up — in this order

1. **`/matches`** — the Matches row of the same rail (907:22311). It still
   renders its own old page. Same migration shape as `/connect`.
2. **Feed, Profile, Messages, Settings, Communities** — each a page migration
   onto `AppShell`, one small revertible PR at a time.
3. **Burn down the 32 legacy type errors** so `tsconfig.check.json` can collapse
   into `tsconfig.json` and the gate covers all of `src`.
4. **Phase 6 sunset** once the pages are migrated (see section 6).

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

### Reading Figma — the two rules that matter most

**Call `get_design_context`, never `get_metadata` alone.** Metadata is boxes and
positions. It does not carry which token a fill is, which of two `chat` glyphs a
control uses, or that an emphasis is a colour step rather than a bold. A pass
built from metadata measured correctly and looked wrong in a dozen places.

**Do NOT read a placed icon through an instance path.**
`get_design_context` on `I<frame>;<component>;<slot>` returns the COMPONENT'S
DEFAULT for that slot, not the frame's override — both sidebars' selected rows
come back as `home-03` because that is what `Nav Item`'s icon slot defaults to.
Reading those paths produced a phantom "the sidebar mixes 16px and 20px glyphs"
report that was chased twice and did not exist. Read the TOP-LEVEL node; in its
generated ternary the false branch is the 16px variant, and that reflects what
is actually placed.

Related: the `size="20px"` prop in generated code is an artifact of the same
collapsing. Trust `className`/geometry and the top-level read, not the prop.

### Other traps hit
- An inline or `block` box inside a button is sized by TYPOGRAPHY, not contents:
  a 32 avatar measured 39, an 88 avatar measured 95, a 6px dot measured 6x24.
  The fix is always `flex` on the wrapper.
- `vite build` is NOT a typecheck. It shipped a duplicate declaration, a missing
  import and a stale object key, each of which threw in the browser on a green
  build. `npm run typecheck` exists now; use it.
- Icon exports are the ELEMENTS bounding box, not the icon box. They must be
  centred into a `size` viewBox, and if `size` is wrong the glyph crops in
  silence. The importer guards this now.
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
npm run check:frontend       # typecheck -> lint -> build. MUST pass before any commit
npm run typecheck            # scoped gate: src/rebrand + src/assets. Green.
npm run typecheck:all        # whole of src. 32 pre-existing errors, being burned down
node scripts/import-figma-icons.mjs      # regenerate icons from the manifest
npx tsx scripts/verify-diagnostic.mjs    # survey scoring intact
node scripts/optimize-illustrations.mjs  # masters -> WebP q94 @1280
```

`/rebrand/app` is the app-shell preview. `/rebrand/connect` is GONE — it
previewed the retired design.

---

## 5. How the rebrand lands in the product

The sunset plan, so it is not re-derived every session.

**A · Build.** Surfaces live in `src/rebrand/`, previewed at `/rebrand/*`,
built from `get_design_context` on named nodes.

**B · Migrate, page by page, never big-bang.** The `/connect` → MATCHES/Suggested
move is the template: split the shell into a layout, leave the page's real
data-fetching alone, swap only what it renders, verify, ship. One small PR per
page so any of them can be reverted alone.

**C · Sunset by subtraction.** A file is deleted only when nothing imports it:
1. delete the `/rebrand/*` preview route once its live page is migrated
2. move the component out of `src/rebrand/` into its permanent home
3. delete the retired component (the frozen Connect build)
4. delete the demo data that only fed the preview

**D · Cleanup you can trust.** With `noUnusedLocals` on, an unreferenced export
is a BUILD ERROR, not something to hunt for — dead code announces itself. Burn
down the 32 legacy errors here, then `tsconfig.check.json` collapses into
`tsconfig.json` and the gate covers all of `src`.

---

## 6. Open flags

**In my court**
- `/matches` still renders its own old page; it is the Matches row of the shell's
  own rail and should join it next.
- 32 legacy type errors under `typecheck:all` — mostly unused shadcn leftovers
  in `src/app/components/ui/` importing a `buttonVariants` that was never
  exported, plus a `button.tsx`/`Button.tsx` casing collision.
- `bulb` in the icon manifest has a stale provenance URL. The committed
  `bulb.tsx` is fine; only a re-run needs the refresh.
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
- **The blind Suggested card.** Settled that the bubble always shows (a profile
  implies a subject), but with `candidate` null there is still no photo and no
  role behind an 88 avatar. Worth seeing against real data.
- **`whyMatched` emphasis.** The design colours part of each signal bullet;
  `blindRationale.overlapThemes` now carries `{pre, emph, post}` so it renders,
  but any new bullet source needs the same split.
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
