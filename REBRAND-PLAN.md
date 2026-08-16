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

### 4c. Edge cases and loose ends

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
