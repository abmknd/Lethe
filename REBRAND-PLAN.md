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
      `pre-rebrand-baseline`, pushed. 245MB of illustration masters kept out of
      immutable history and backed up outside the repo.
- [x] **1. Specification.** `redesign.md` carries components, states, theme.
      Pill trio, button axes, reconciliation rule, blue elevation model.
- [x] **2. Primitive layer.** 12 primitives, surface-driven. Landing retro-fitted.
- [ ] **3. Marketing surface complete.** Landing finished on the primitives,
      hero decision resolved, responsive verified from 375 up.
- [ ] **4. In-app surface.** See scope below.
- [ ] **5. De-hardcode the app.** 313 hardcoded hexes across 54 files.
      Behaviour-preserving, screenshot-gated, shipped in reviewable slices.
- [ ] **6. Non-React surfaces and dissolution.** Email templates, favicon, OG
      image, logomark, 404. Then dissolve `src/rebrand/`, delete
      `rebrand-preview.html`, the `/rebrand` route, dead `src/imports` files,
      this file, and promote `redesign.md` to `design.md`.

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

So the list below is a **handoff, not a build list**. The rebrand does not build
these screens. It guarantees the system exists first so that whoever builds them
does not produce another 313 hardcoded hexes.

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
| Illustration library: commit all 69 web-sized, or per-use | leaning per-use |
| Self-host Parkinsans/Archivo vs Google CDN | open, affects LCP and CSP |
