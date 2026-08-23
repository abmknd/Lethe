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

**Closed: the library is HugeIcons, adopted whole as the Relethe icon library.**
Nothing is drawn by us. The whole set is in scope, not a 240-icon subset.

**Ship it from npm, not from a Figma export.**

```
@hugeicons/react            the renderer
@hugeicons/core-free-icons  the icon data — MIT
```

This settles the earlier "Figma or hardcoded SVG" question by making it moot:
the drawing already exists as a maintained, versioned, tree-shakeable package,
so exporting thousands of SVGs out of Figma reproduces by hand what `npm i`
does correctly. The Figma file stays the design-side source; the package is the
code-side source; they are the same drawings from the same publisher.

What an export would cost, concretely, and why we are not paying it: the MCP
caps SVG assets at 20 per node, so the library is ~169 calls. Every exported
file also carries two baked-in artefacts that have to be stripped — a
`<rect width="24" height="24" fill="#1E1E1E"/>` behind the glyph and the parent
sheet's `<rect width="1144" ... fill="white"/>` — plus a literal `#100A0A`
stroke that must become `currentColor`. That is a bespoke cleanup pipeline
maintained forever, against a package that needs none of it.

##### The style, measured

Read off `calendar-01` as it exists in the file, not specified from memory:

```
viewBox        0 0 24 24
stroke-width   1.5          as DRAWN by the vendor
linecap        round
linejoin       round
fill           none — strokes only
colour         currentColor
```

**We render it lighter than it is drawn.** Decision: **1px at 16, 1.25px at 24**
(redesign.md 5.5.1). The drawn weight is the vendor's decision; the rendered
weight is ours, and 1.5 at every size reads heavy against Archivo at 13–14px.

The trap, which is why `iconStroke(size)` exists rather than a constant:
`stroke-width` is in viewBox units, so a 24-grid icon rendered at 16px has its
stroke scaled by `16/24` along with everything else. **The attribute goes DOWN
as the icon gets bigger.**

```
16px display   ->  strokeWidth 1.5    ->  1.0 rendered
24px display   ->  strokeWidth 1.25   ->  1.25 rendered
```

Passing `1` for a 16px icon gives 0.67 on screen, which is the mistake this
would otherwise invite at all 47 call sites.

This is a *stroke* width, not a *border* width. The 1.25px card borders in
redesign.md 4 and 5.4 are a different property and do not change.

##### The usage map survives, with a different job

`scripts/icon-inventory.mjs` no longer lists what to draw. It maps the **240
semantic names the product calls icons by** onto library icons, and generates
`docs/system-icons.md`. Worth keeping because:

1. A call site reads `match-blind`, not `user-search-01`.
2. Swapping the pack later touches one file rather than 47.
3. It is the only record of which icons the product actually uses, which is
   what makes the lucide migration finishable.

Using an icon outside the map is fine — the whole library is available. The map
is a naming layer, not a whitelist.

##### What still needs a human decision

Around 60 of the 240 have no name-equivalent in any general library and resolve
by *meaning* rather than by name. These are one judgement call each:

- the fourteen role families from Step 9
- `match-blind` / `match-revealed` / `match-pending`
- `content-flowing` / `content-fading` / `content-faded`
- `daylight-band`, `confidence-band`, `signal-overlap`
- `trust-ledger`, `provenance`, `no-show`

##### Steps

1. `npm i @hugeicons/react @hugeicons/core-free-icons`
2. One `Icon` wrapper owning size, 1.5 stroke and `currentColor`, so no caller
   sets any of them.
3. Resolve the 240 map entries against the library's own names; the ~60 above
   get chosen deliberately.
4. Migrate the 42 lucide call sites, surface by surface.
5. Remove `lucide-react` from `package.json`. That is the completion test.

**Coverage caveat.** The Figma file carries both `-round` and `-sharp` variants,
which suggests the paid tier; `core-free-icons` is the free set. If a mapped
icon turns out to be pro-only, that is a coverage question to settle at step 3,
not a licensing one — the free package is MIT.

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

### 4c-iii. Backend gaps, logged not fixed

Rebuilding a surface against its frame forces every field on screen to come from
somewhere, and when it cannot, that is a gap. They are collected in
[docs/backend-gaps.md](docs/backend-gaps.md) and **deferred by decision** until
the UI overhaul is done.

The one that is not a column and blocks the others: **the blind gate contradicts
the Connect design.** `Recommendation.candidate` is null while a match is blind,
but the frames show identity above PASS / MATCH. Answering that decides whether
the rest is real work or post-reveal-only.

Standing rule while they are open: **a missing field renders empty, never
invented.** An empty block is an honest gap; plausible fiction is a lie that
reaches production.

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
