# L2: Matching Failure
# The matching engine runs but produces wrong, stale, or trust-eroding results.
# @bug scenarios mark known bugs (tests intentionally fail until fixed).
# @todo scenarios mark missing features.

Feature: L2 — Matching Failure

  Background:
    Given a clean matching environment

  # ─── L2-S1: Declared preferredUserType is scored but not enforced ────────────

  Scenario: L2-S1 — Declared investor preference reduces roleFit score when pool has no investor
    # Chris explicitly wants investors. The only candidate is a founder.
    # The roleFit dimension should partially penalise the cross-type match.
    Given "Chris Nakamura" has joined as "a seed-stage B2C founder seeking investors"
    And "Marcus Webb" has joined as "a fellow pre-seed founder (not an investor)"
    When the weekly matching engine runs
    Then the match score for "Chris Nakamura" should be below 90

  # ─── L2-S8: Same-org deduplication — CRITICAL BUG ───────────────────────────

  @bug
  Scenario: L2-S8 — Same-org users must be excluded from each other's candidate pool
    # Zara and Omar both have @bigtelco.com email addresses and work together.
    # BUG: the matcher has no same-organisation exclusion filter.
    # This scenario will FAIL until email-domain deduplication is implemented.
    Given "Zara Hussain" has joined as "a growth marketer at BigTelco"
    And "Omar Siddiqui" has joined as "a product manager at BigTelco"
    When the weekly matching engine runs
    Then "Omar Siddiqui" should not appear as a candidate for "Zara Hussain"
    And "Zara Hussain" should not appear as a candidate for "Omar Siddiqui"

  # ─── L2-S10: Niche domain with no in-domain peers ────────────────────────────

  Scenario: L2-S10 — Niche-domain user receives only low-confidence cross-domain matches
    # Eleanor (conflict mediation) has no peers in her specific domain.
    # Out-of-domain candidates should produce low scores.
    Given "Eleanor Hughes" has joined as "a conflict mediation consultant and former diplomat"
    And "Marcus Webb" has joined as "a logistics SaaS founder"
    And "Lena Braun" has joined as "a devtools founder"
    When the weekly matching engine runs
    Then the match score for "Eleanor Hughes" should be below 60

  # ─── L2-S2: Rationale grounding — no fabricated interests ────────────────────

  Scenario: L2-S2 — Match rationale references only non-empty string lines
    # Every rationale line should correspond to a real signal dimension.
    # GAP: no formal grounding constraint prevents fabricated rationale lines today.
    Given "Marcus Webb" has joined with their standard profile
    And "Freight Operator" has joined with their standard profile
    When the weekly matching engine runs
    Then "Marcus Webb" should receive at least one match suggestion
    And the match rationale for "Marcus Webb" should be non-empty

  # ─── @todo scenarios — features not yet built ────────────────────────────────

  @todo
  Scenario: L2-S3 — Match is deferred when scheduling window exceeds 21 days
    # Lucas accepted a match but his counterpart had no availability for 6 weeks.
    # The match should be deferred when no overlap exists within 21 days.
    Given "Marcus Webb" has joined with their standard profile
    And "Freight Operator" has joined with their standard profile
    When the weekly matching engine runs
    Then the match should be deferred until an overlapping window exists within 21 days

  @todo
  Scenario: L2-S4 — First-time founder receives a reduced score against a veteran operator
    # Hannah (first-time founder) was matched with a highly experienced operator.
    # The experience gap made the call one-directional and discouraging.
    # An experience-level dimension should weight closer-stage pairings higher.
    Given "Marcus Webb" has joined with their standard profile
    And "Freight Operator" has joined with their standard profile
    When the weekly matching engine runs
    Then the match score for "Marcus Webb" should be below 100

  @todo
  Scenario: L2-S5 — Match rationale is re-evaluated when a matched user updates their profile
    # Tom's match had pivoted out of edtech into fintech two weeks after the match was generated.
    # The stale rationale eroded trust when the call happened.
    Given "Marcus Webb" has joined with their standard profile
    And "Freight Operator" has joined with their standard profile
    When the weekly matching engine runs
    And the admin approves the match for "Marcus Webb"
    Then the rationale should be re-evaluated and updated

  @todo
  Scenario: L2-S6 — Company-stage pre-filter is enforced when user sets a minimum stage requirement
    # Lin kept receiving pre-product founders despite asking for post-revenue companies.
    # A company-stage field must exist in KYC and be enforced as a hard pre-filter.
    Given "Marcus Webb" has joined with their standard profile
    And "Freight Operator" has joined with their standard profile
    When the weekly matching engine runs
    Then the match score for "Marcus Webb" should be below 100

  @todo
  Scenario: L2-S9 — Multi-step reminder sequence fires for both parties before a scheduled call
    # Marcus showed up on time; his match had forgotten the call with no reminder sent.
    # A 24h, 2h, and 15min reminder must be sent to both parties.
    Given "Marcus Webb" has joined with their standard profile
    And "Freight Operator" has joined with their standard profile
    When the weekly matching engine runs
    And the admin approves the match for "Marcus Webb"
    And "Marcus Webb" accepts the match
    Then a nudge notification should fire within 24 hours
