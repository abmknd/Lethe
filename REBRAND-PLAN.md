# Rebrand migration plan

**Scaffolding.** This file exists to carry decisions across phases. It is
deleted in Phase 6 along with `src/rebrand/`. The durable output is
`redesign.md`, which becomes `design.md`.

---

## Standing rules

1. **No transparency for colour.** Every fill, border and text colour resolves
   to a ramp token. Hover moves a ramp step, disabled has its own fill. Alpha
   survives only as a material effect (overlapping ink), never as a stand-in
   for a token we did not define.
2. **Build the system as we go.** Token, then variant, then reusable
   component, then usage. If two places need it, it is a component before the
   second usage exists.
3. **`redesign.md` is written continuously.** The test is that at the end it
   can replace `design.md` with nothing missing.
4. **Clean dissolution.** Every file in `src/rebrand/` either replaces a real
   file or is deleted. No parallel system survives. Obsolete markdown is
   removed, not left to rot.

The established colour and type tokens are the source of truth. Anything that
disagrees with them is drift and snaps to the nearest ramp step.

---

## Phases

- [x] **0. Safety and baseline.** Committed on `front-end-demo-updates`, tagged
      `pre-rebrand-baseline`, pushed. The artwork masters (`src/assets/artworks/`,
      ~366MB) kept out of immutable history and backed up outside the repo.
- [x] **1. Specification.** `redesign.md` carries components, states, theme.
      Pill trio, button axes, reconciliation rule, blue elevation model.
- [x] **2. Primitive layer.** 12 primitives, surface-driven. Landing retro-fitted.
- [ ] **3. Marketing surface complete.** Landing finished on the primitives,
      hero decision resolved, responsive verified from 375 up.
- [ ] **4. In-app surface.** See scope below.
- [ ] **5. De-hardcode the app.** ~570 hardcoded hex occurrences across 41
      files in `src/app` + `src/components`, 22 of them still carrying the old
      chartreuse `#7FFF00` (re-counted 2026-08-16; the earlier "313 across 54"
      was measured differently and is retired). Behaviour-preserving,
      screenshot-gated, shipped in reviewable slices. In practice this phase
      dissolves into Phase 4: a surface gets de-hardcoded when it gets rebuilt.
- [ ] **6. Non-React surfaces and dissolution.** Email templates, favicon, OG
      image, logomark, 404. Then dissolve `src/rebrand/`, delete
      `rebrand-preview.html`, the `/rebrand` route, dead `src/imports` files,
      this file, and promote `redesign.md` to `design.md`.

---

## How this lands in the product

**It lands surface by surface, in place, as we go. Not in one swap at the end.**

This is already true and worth stating so nobody plans around the opposite:
`KYCModal` is rendered by `Feed.tsx`, so the rebuilt onboarding is live in the
real app the moment this branch merges. It was never staged behind a flag.

Why not a big-bang cutover at Phase 6: a rebrand held back until the end is one
enormous diff that has never run against real data, reviewed in a single sitting
by someone who has lost the context for the early decisions. Every failure mode
we have hit so far — the cascade, the unlayered `.rebrand-root`, the missing
font import in the app entry — was invisible in the gallery and only showed up
when a component was mounted for real. Landing continuously is what surfaces
those while they are still cheap.

What makes it safe rather than reckless:

1. **Tokens are already global.** `src/styles/tokens.css` is on `:root` and
   shared. A migrated surface changes only its own markup.
2. **The surface is opt-in per element.** Rebrand styling hangs off
   `.rebrand-root`; nothing leaks into a page that has not been migrated.
3. **One surface per slice, `npm run build` green before each.** A slice that
   breaks is one page, revertable on its own.
4. **`pre-rebrand-baseline` is the floor.** The whole thing can be undone.

### The seam rule

**When a rebranded surface routes to an un-rebranded one, that target moves to
the front of the queue.** The seam a user actually walks through is worth more
than finishing a tidy category of screens.

This is not hypothetical: `KYCPaused` says *"You'll find it in Connect"*, and
`ConnectPage` is still old brand. Onboarding currently hands the user across a
visible brand boundary. That is what makes Connect next, rather than a
preference about which page is most interesting.

### Merge cadence

Merge **per completed surface**, not at the end of the phase. As of this
writing the branch is 11 commits and ~36 changed files ahead of `main`, with
nothing merged since 2026-08-10. That gap is the actual risk to manage — not
the rebrand technique. Each surface should become its own PR to `main` once its
build is green and it has been clicked through at `/rebrand/<surface>`.

### Preview, always

Every rebranded surface gets a route under `/rebrand/` in the real router so it
can be **clicked through, not looked at**:

| Route | Surface |
|---|---|
| `/rebrand` | landing |
| `/rebrand/onboarding` | the twelve KYC screens |
| `/gallery.html` | components without auth (dev entry) |

A preview must mount the same component the product mounts. A preview that
re-creates the screen is a preview that can lie about it.

---

## Phase 4 scope: this is the easy thing to under-scope

In-app is **not** just restyling the screens that exist today. It has to
absorb the work that was paused for the rebrand.

### 4a. Roadmap surfaces that do not exist yet

**This phase is Phase 3.5 of `docs/alignment-plan.md`**, not a detour from the
roadmap. That plan prescribes the order we are running: token foundation, then
landing, then the app, plus a core component set that Phases 4 and 5 reuse.

Its binding instruction:

> *"Token foundation first, adopted **before or during Phase 3**... so Phase 3's
> new surfaces (scheduling, call lobby, reminder emails) are **born on the new
> visuals and never re-colored**."*

**These get BUILT during Phase 4, not deferred.** Decision, 2026-08-13: if a
page we are rebranding links to one of these, it is designed and built in the
same pass. We are not coming back to them. Meticulous over fast.

The system existing first is what makes that safe: the tokens and primitives
are the guardrail, so a screen built mid-phase cannot reintroduce hardcoded
colour or invent a component that already exists.

**Status check (verified against git, not the Changelog):** the Changelog says
Phase 3 is not started, but PR #117 shipped Daily.co room creation on mutual
accept. It is backend only (`mvp/integrations/daily.mjs`, edge adapter, api) and
the identity gate is explicitly a later slice, so **no Phase 3 UI exists yet.**
The window to get this right is still open.

#### Phase 3, scheduling and call integrity

- Call **join screen**: photo + name, mutual "this is who I expected"
  confirmation before the room unlocks
- **Call lobby** with conversation starters from the insight pipeline
- **Confirm-attendance** surface for the 24h / 2h / 15min cascade
- **Warm suspension** after three silent no-shows, with one-click reinstatement
- **Stood-up user loop-in** with a flag option
- **Scheduling-failed state**, explicitly deferred out of PR #113
- **Higher-stakes gate**: investor intros require `oauth_verified` both sides

#### Phase 4, mutual review

- **Two-sided blind review**, unlock-together
- **Aggregate trend** view for the reviewed person: trend only, never raw text
- **Dispute submission** path

#### Phase 0 leftover

- **OAuth sign-in** (LinkedIn OIDC primary, Google / Microsoft fallback) and the
  three `verification_tier` states. Column exists, providers not connected.

#### Cross-cutting admin, none of which exist

Routes today are Home, Review, Connect, Onboarding, Events. Missing:

- Trust-ledger provenance view
- Suspension management
- Dispute queue
- HITL dial has an API (`GET/PUT /api/v1/admin/hitl-config`) but no UI

### 4b. Screens with a reference

From the supplied in-app reference image, already partially spec'd in
`redesign.md` section 5:

- Feature card (light)
- KYC / onboarding step: segmented progress, back control, searchable list
  with selected row, full-width continue
- Post card: avatar, handle, befriend, media, view count, edit/flag,
  approve/delete
- Profile card: bio, location and pronouns, availability toggle, onboarding
  checklist, interest pills
- Signal overview: header block, bullets, common interests, mutuals,
  availability day cards, socials, pass/match

### 4c. Asset systems

Two asset workstreams that are not screens and do not belong to any one surface.
Both sit in Phase 4 rather than later because **every surface after this one
consumes them** — an icon decided in Phase 5 is an icon re-drawn in Phase 5.

#### 4c-i. `system_icons` — the product icon set

Up to **240 icons**, each in **outlined and filled** variants, drawn in a
minimalist **cyber-classical** style that carries Relethe's brand persona.
Delivered twice: as components in the Figma design library, and as files under
`src/assets/system_icons/`.

**The inventory is derived, not invented.** The product currently imports **42
distinct icons from `lucide-react` across 47 files** — that is the floor, and it
is a real measurement rather than an estimate. The 240 is the ceiling once the
un-built surfaces in 4a are counted. So the inventory is a *running artifact*:

1. **Now** — take the 42 in use as the seed list, with the file that uses each.
2. **Per surface** — every rebuild adds the icons that surface needs. A screen is
   not finished until its icons are in the list.
3. **In batches** — draw once a coherent group is known (navigation, social,
   status, actions), not one at a time and not all 240 up front.

**Rules this set has to satisfy**, so it does not become the next thing that
disagrees with the tokens:

```
grid            24 square, drawn on a 24 grid, exported at 1x
stroke          1.25px, matching IconButton and the existing chevrons
colour          never baked in — currentColor only, so a caller's token decides
variants        outlined (default) and filled; filled is for SELECTED state,
                not for emphasis, since emphasis is a colour decision
optical size    a 16px usage is a redrawn 16 icon, not a scaled 24
naming          semantic, not pictorial: `profile`, not `person-circle`
```

**Completion test:** `lucide-react` is removed from `package.json`. While a
single lucide import survives, the set is not done — a half-migrated icon set is
two icon languages on one screen, which is worse than either alone.

**The inventory itself is `scripts/icon-inventory.mjs`**, which generates
`docs/system-icons.md`. It asserts the count, rejects non-kebab names and
duplicates, and fails if an icon in use today is missing from the list. A
hand-maintained list of 240 names does all three of those things silently.

#### Figma or hardcoded SVG — closed: both, in that order

The question is a false binary. Drawing and shipping are different problems and
the answer is different for each:

```
DRAW in Figma        it is where an icon is designed, reviewed and corrected,
                     and half the deliverable is a Figma library anyway
SHIP as SVG          generated from the Figma export, never hand-written
                     and never hand-edited afterwards
```

**Why not hand-author the SVG.** 240 icons of hand-written path data is 240
chances to typo a stroke width, and no surface on which to see them together.
Drawing by typing coordinates is the slowest way to draw and the worst way to
iterate. Consistency across a set is a *visual* property — it needs a canvas.

**Why not ship from Figma.** There is no runtime path from Figma to the product
that is not a network call to a third party on every render. Code needs its own
copy. So the copy is **generated**: export → SVGO → codegen → one React
component per icon. Re-running the script after a redraw is the whole update
process, which is what keeps the two in sync instead of drifting.

**Why per-icon components rather than a sprite or an icon font:**

| | Tree-shakes | `currentColor` | Fails as |
|---|---|---|---|
| **Per-icon components** | yes | yes | one missing icon |
| Sprite sheet | no | yes | *all 240 at once* |
| Icon font | no | text colour only | tofu, and a11y noise |

Tree-shaking is the load-bearing difference. Today's 42 icons ship as ~4KB
gzipped instead of the ~20KB of all 240, and that stays true as the set grows —
the app only ever ships what it imports. And a sprite that fails to load takes
every icon on the page with it, which is a bad failure mode for a file whose
whole job is being present.

**The pipeline, to be built with the first batch:**

```
Figma page (24 grid, outlined)
  → export SVG @1x
  → SVGO: strip fills, ids, metadata; keep viewBox
  → codegen: src/assets/system_icons/<name>.tsx, currentColor, 1.25 stroke
  → an index that re-exports all of them by name
```

Nothing in `src/assets/system_icons/` is ever edited by hand. If an icon is
wrong, it is wrong in Figma.

#### 4c-ii. `dynamic_icons` — ten animated marks

Ten square marks, **80px base size, responsive up to 200px**, animated with
WebGL/GLSL, living in `src/assets/dynamic_icons/`. The diagnostic illustration
on the landing page is the first: it should be alive, not a static plate.

**Rules:**

```
aspect          1:1, always
size            80 base, fluid to 200; a shader must not assume pixel size
motion          ambient and slow — a mark that loops visibly is a distraction.
                No motion under `prefers-reduced-motion`; render one static frame
fallback        every dynamic icon has a static WebP twin, shown when WebGL is
                unavailable or the program fails to link. A hole is not a state
colour          samples the ramp via uniforms; a shader does not carry its own
                hex any more than a component does
budget          one shared canvas/context where several appear together — ten
                contexts on one page is ten GPU allocations
```

**Carried from the deleted hero WebGL work, so it is not re-learned:** a guard
of the form `if (!src.includes('vLocal'))` matched the existing `vLocalY`, so a
varying was never injected and the program silently failed to link. Shader
string surgery needs exact-token matching, and a link failure must be *loud* in
dev and *fall back* in production.

### 4d. Edge cases and loose ends

The parts that never make it into a reference frame and are therefore always
missing at build time. Each needs a design, not an improvisation:

- **Modals and pop-ups** beyond the diagnostic: confirmations, destructive
  action guards, meeting scheduling, report/flag flows
- **Empty states** for every list: no matches, no messages, no posts, no
  mutuals, first-run
- **Loading and skeleton** states for anything fetched
- **Error states**: failed load, failed submit, offline, expired session,
  permission denied
- **Toasts / inline confirmations**
- **Truncation and overflow**: long names, long handles, long bios, many
  interest pills, very long city names
- **Zero and boundary data**: one mutual, no availability, no socials
- **Focus, keyboard and screen-reader paths** through every modal and list

---

## Open decisions

| Decision | Status |
|---|---|
| Hero | **closed.** `sanctuary_of_lethe` ships. The WebGL piece and the `hero/` workspace are deleted. |
| `signal-pill` variants beyond neutral | open |
| Illustration library: commit all 69 web-sized, or per-use | **closed: per-use.** Onboarding committed 11 plates (5.0MB) from `white_themes/portrait_art` at 900px q86. Slots are named in `scripts/optimize-illustrations.mjs`, so a re-map is a one-line edit and a re-run. |
| Self-host Parkinsans/Archivo vs Google CDN | open, affects LCP and CSP |
