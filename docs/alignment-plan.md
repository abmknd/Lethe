# Alignment Plan: 40-Path Map (Hardened v2)

**Adopted:** 2026-07-04.
**Source:** the 40-Path User Flow map (hardened v2, July 4 2026 loophole audit), reviewed against the repo at `main`.
**Status key:** each phase is shippable on its own. Engine changes land once in `mvp/` and flow to production through the existing edge-function imports (`run-weekly-matching` imports the matcher directly). Every phase extends the BDD suite it touches.

---

## 1. Where the product stands today

| Step | Vision | Today |
|---|---|---|
| 01 Onboarding | OAuth + trust tiers | Magic link only, 9-step KYC, no verification concept |
| 02 Offer / Ask | Generic reframes, trust score | Fields exist (asks/offers/objectives/who_to_meet), no input-quality detection, no trust score |
| 03 Availability | Required, 21-day window | Slots + timezone-normalized overlap exist and the matcher hard-requires overlap, but availability is not captured in KYC, so a user can finish onboarding unmatchable (Claire, L1-S8) |
| 04 Match | Verified same-org exclusion, edit limiting, stage/experience filters | Strong matcher: blocked users, same email domain, local-only, format overlap, 2-of-3 signal minimum, rejection/cooldown filters, weighted scoring, CEP boost, diversity penalty. No stage field, no experience proximity, no edit snapshotting, org exclusion is email-domain only |
| 05 Blind rationale | Abstracted, no identity | The opposite: ConnectPage shows full candidate profile, score, and raw `whyMatched` strings before commitment |
| 06 Mutual blind accept | Double-blind gate | Does not exist. Accept is one-sided; recommendations are per-user rows with no pair-level state |
| 07 Reveal + HITL dial | Graduated 10/25/50% | HITL is binary and always-on. On one-sided accept, `sendIntroEmails` mails both identities to each other |
| 08 Scheduling | Reminders, no-show taxonomy, three strikes | Meetings table with statuses, calendar-URL builder, overlap-slot finder. No reminders, no attendance confirmation, no no-show concept |
| 09 Call | In-platform, identity check at join | Nothing in-platform. Insight generation exists (conversation-starter material) |
| 10 Mutual review | Blind two-sided, aggregate, dispute | Follow-through statuses and outcomes only. No review entity |
| 11 Feed / Community / Delta | Consent-gated enrichment | Feed and Communities are frontend-only surfaces on hardcoded personas. No posts/communities tables, no Delta layer |

Data layers: Alpha (declared) is real. Beta (behavioral) is partial (events, outcomes, CEP). Delta (public) does not exist. HITL exists as a switchless, always-on gate.

The single biggest gap: the blind gate (steps 05 to 07) inverts how the product works today, and the intro-email-on-one-sided-accept flow actively violates it. That flow is the first thing retired.

---

## 2. Adopted decisions (deviations from the map as drawn)

Agreed 2026-07-04. Where this plan and the map disagree, the plan wins.

1. **Same-org exclusion is layered, not "LinkedIn-verified".** Basic LinkedIn OIDC provides name, email, photo; it does not provide employer data. The implementable substitute: OAuth anchors the person, an optional verified work email anchors the org, the claimed LinkedIn URL is a HITL spot-check artifact, plus self-declared company name and email-domain checks.
2. **Cycle-start snapshots replace the weekly edit rate limit.** Matching inputs are snapshotted when the cycle starts; users edit freely and edits take effect next cycle. This closes the reverse-engineering loop (one probe per week at most) without punishing honest updates, and it coexists with stale-premise re-evaluation (L2-S5).
3. **The HITL dial ships parked at 0% auto-approve.** Build the policy plumbing (rate config, minimum-sample floor, verified-tenure weighting, white-glove first-match flag), but do not tune thresholds until volume forces it. At current cohort size, 100% review is cheap and is itself the product.
4. **Confidence is shown as bands only (low/medium/high), never percentages.** The matcher score is an uncalibrated heuristic. Percentages return only if outcome data (Phase 4) supports calibration.
5. **Blind-gate conversion is instrumented from day one.** Mutual blind accept roughly squares the individual accept rate. Mitigations: verified non-identifying badges in the abstracted rationale (role category, tenure, city-level location), and white-glove first matches as an explicit HITL-vouched exception. If blind accept rates crater, the fallback is asymmetric blind, not abandoning the gate.
6. **In-platform calls are embedded (Daily.co / LiveKit class), not built.** Join-event webhooks from the provider are the corroboration signal step 08 needs.
7. **The feed backend ships deliberately minimal.** Enough persistence to make the L3 community-first paths real; the full five-post-type, decay-mechanic, 160-post feed waits until matching retention proves out. Demo-persona components (ConnectContent, SuggestionsPanel, RecentMatchesPanel) are quarantined or deleted as real surfaces land.
8. **Delta is built last, with consent as a schema constraint.** Every enrichment row records the consent state it was collected under; the enrichment job takes its user list from `matching_enabled = true`. Acceptance criterion: we can prove what was collected under which consent state.
9. **Trust score is an append-only signal ledger, never a mutable number.** Auditable, disputable, replayable when weights change. Every automated gate decision is explainable from the event log.

---

## 3. Phases

### Phase 0: Pair-match state machine and identity foundations

Everything in steps 05 to 10 hangs off two things the schema does not have: a pair-level match entity and a trust ledger.

1. **`matches` table** (Supabase migration + `mvp/db/schema.mjs`): links two users and their recommendation rows. States: `generated → under_review → offered_blind → mutual_accepted → revealed → scheduled → met → reviewed → closed`, plus terminal `declined_silent`, `expired`, `suspended`. Transitions live in a lifecycle service (`mvp/services/match-lifecycle-service.mjs`); every transition emits an event.
2. **Event taxonomy extensions**: `blind_offer_shown`, `blind_accept`, `blind_decline`, `mutual_accept`, `identity_revealed`, `no_show_recorded`, `review_submitted`, `reviews_unlocked`, `dispute_opened`.
3. **Trust signal ledger**: append-only `trust_signals` (user, signal type, weight, source event, timestamp) plus a computed-score function and an admin read view. Sources arrive across later phases; Phase 0 creates the ledger.
4. **OAuth via Supabase Auth**: LinkedIn OIDC primary, Google and Microsoft fallbacks, magic link remains as the unverified track. `users.verification_tier`: `unverified` / `oauth_verified` / `work_email_verified`. Unverified accounts keep feed and community access; the weekly matching cycle filters them out.
5. **Retire `sendIntroEmails` on one-sided accept**, in the same PR as the state machine, so there is never a window where blind matches leak identity by email.

### Phase 1: The blind gate (steps 05, 06, 07)

1. **Abstracted rationale generator** (`mvp/context/`): maps matcher signals to non-identifying claims: role category, overlap themes, availability compatibility, confidence band. Hard rule enforced in code and test: no name, photo, handle, company, city, or free-text quote from the other profile passes through. Every claim traces to a stored signal (L2-S2).
2. **Blind match card** (ConnectPage rework): abstracted rationale, confidence band, accept / decline, optional one-tap decline reason that writes to `trust_signals` and is never shown to the other user.
3. **Mutual accept logic**: both sides accept blind → `mutual_accepted` → reveal. Either declines → `declined_silent`, no notification, no reveal, cooldown recorded.
4. **Reveal screen**: names, photos, full rationale, scheduling handoff, reachable only in `revealed` state. Server-side enforcement: RLS and API payloads must never ship identity in the blind state.
5. **HITL policy hooks**: `auto_approve_rate` config (0 / 10 / 25 / 50%), minimum-sample floor, verified-tenure weighting, `white_glove` flag forcing manual review on a user's first match. Ships parked at 0.
6. **Cycle-start snapshots** (decision 2): matching inputs snapshot at cycle start via the existing `buildRecommendationGenerationSnapshot` plumbing.

### Phase 2: Matching and intake hardening (steps 02, 03, 04)

1. **Layered same-org exclusion** (decision 1): email domain + self-declared company name + verified work email domains + claimed LinkedIn URL for HITL spot-checks.
2. **New matcher fields and filters**: `company_stage` hard filter (L2-S6), experience proximity weighting with a mentor-match escape hatch (L2-S4, L3-S9), `not_looking_for` (L2-S7), `match-my-ask` vs `surprise-me` toggle gating complementarity weighting (L2-S1).
3. **21-day concrete window**: resolved-calendar check in the pre-filter, not just recurring weekly overlap (L2-S3).
4. **Availability into onboarding**: a 10th KYC step, manual window default, calendar sync later. Visible scheduling-failed states and emails replace today's silence (L1-S6, L1-S8).
5. **Input-quality pass at intake**: detect CV-register text, commercial solicitation, fundraising-only asks, thin offers (L1-S2, L1-S3, L1-S4, L1-S5, L1-S7). Thin or absent asks route to a community-first getting-started track instead of blocking (L1-S1). Reframe prompts stay generic; detection writes silently to `trust_signals`. LLM-assisted via the existing insight-generation plumbing, deterministic keyword fallback.
6. **Stale-premise re-evaluation**: profile changes on in-flight matches past `under_review` re-run rationale generation; confidence drops route back to HITL (L2-S5).

### Phase 3: Scheduling and call integrity (steps 08, 09)

1. **Reminder cascade**: 24h / 2h / 15min plus confirm-attendance, driven by a scheduled edge function. All sends logged to `events`.
2. **No-show taxonomy**: `notified_cancellation` (never penalized) vs `silent_no_show` (trust signal), corroborated by join events where available, confirm-attendance clicks where not. Three silent no-shows pause matching with a warm explanatory email and one-click reinstatement. The stood-up user gets a loop-in email with a flag option (L2-S9).
3. **Embedded in-platform call** (decision 6): a room per `scheduled` match; join screen shows photo + name with mutual "this is who I expected" confirmation before the room unlocks.
4. **Conversation starters** in the call lobby from the insight pipeline.
5. **Higher-stakes category gate**: investor-intro matches require `oauth_verified` minimum on both sides.

### Phase 4: Mutual review and the closed trust loop (step 10)

1. **`reviews` table**: per match, per side; useful/not-useful plus notes; neither row readable by the counterpart until both exist, then both unlock together (server-enforced).
2. **Aggregate signal**: the reviewed person sees a trend, never raw text or a single attributable review.
3. **Dispute path**: disputes enter the admin review queue with full context; resolution adjusts or annotates the trust signal.
4. **Close the loop**: review outcomes feed `trust_signals` and a small matcher weighting; the HITL dial's metric becomes accepted-and-reviewed-useful rate, which is much harder to game.

### Phase 5: Feed, community, Delta (step 11)

1. **Minimal posts and communities backend** (decision 7): tables, RLS, API routes.
2. **Delta layer with structural consent** (decision 8).
3. **Social proof weighting**: verified tenure only, per-account rate limits.
4. **L3 accommodations** once feed persistence exists: async intro (L3-S1), formalize-this-connection prompts (L3-S10), post-referral surfacing (L3-S5), tiered re-activation (L3-S7), instrumented tolerance of feed-only usage (L3-S3, L3-S8).

---

## 4. Cross-cutting, every phase

- **Tests first-class**: the `l0` to `l3` feature files mirror the map's levels. Each phase adds scenarios; each of the nine hardening fixes gets at least one regression test with the loophole as the failure case (e.g. "one-sided accept must not reveal identity").
- **Admin surfaces**: HITL dial control, trust ledger view with per-signal provenance, suspension management, dispute queue.
- **Feature flags** per phase so the blind gate rolls out to the founding cohort deliberately.
- **Docs hygiene**: `README.md` and `docs/archive/trial/` describe the pre-hardening architecture; the first shipping phase updates them.

## 5. External dependencies

- OAuth app credentials (LinkedIn, Google, Microsoft) created and configured in the Supabase project (Phase 0, item 4).
- Call-infrastructure provider account (Daily.co / LiveKit) and pricing decision (Phase 3).
- Email volume: reminder cascades raise send volume; confirm Resend limits before Phase 3.
