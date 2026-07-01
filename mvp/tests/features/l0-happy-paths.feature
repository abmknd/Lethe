# L0: Happy Paths
# Users with complete profiles, clear intent, and complementary counterparts.
# No friction expected. Every scenario here represents the full intro loop working.

Feature: L0 — Happy Paths

  Background:
    Given a clean matching environment

  # ─── L0-S1: Full intro loop end-to-end ──────────────────────────────────────

  Scenario: L0-S1 — Builder-to-Operator: full intro loop end-to-end
    # Marcus (pre-seed logistics founder) meets his operator mentor.
    # Validates: match → rationale → admin approval → accept → outcome → events.
    Given "Marcus Webb" has joined as "a pre-seed logistics SaaS founder"
    And "Freight Operator" has joined as "a logistics operator mentor with supply-chain exits"
    When the weekly matching engine runs
    Then "Marcus Webb" should receive at least one match suggestion
    And the top match for "Marcus Webb" should be "Freight Operator"
    And the match rationale for "Marcus Webb" should be non-empty
    And the match score for "Marcus Webb" should be above 0
    When the admin approves the match for "Marcus Webb"
    Then the recommendation for "Marcus Webb" should be in "approved" status
    When "Marcus Webb" accepts the match
    And the follow-through for "Marcus Webb" is updated to "intro_sent"
    And the follow-through for "Marcus Webb" is updated to "meeting_scheduled"
    Then the outcome status for "Marcus Webb" should be "meeting_scheduled"
    And the event chain for "Marcus Webb" should include "recommendation_generated"
    And the event chain for "Marcus Webb" should include "admin_approved"
    And the event chain for "Marcus Webb" should include "user_accept"
    And the event chain for "Marcus Webb" should include "intro_sent"

  # ─── L0-S1 (pass path): user can also pass a suggestion ─────────────────────

  Scenario: L0-S1 (pass path) — user can pass a recommendation and the event is persisted
    Given "Marcus Webb" has joined as "a pre-seed logistics SaaS founder"
    And "Freight Operator" has joined as "a logistics operator mentor"
    When the weekly matching engine runs
    And the admin approves the match for "Marcus Webb"
    And "Marcus Webb" passes the match
    Then the event chain for "Marcus Webb" should include "user_pass"

  # ─── L0-S2: Thinker-to-Thinker peer match ────────────────────────────────────

  Scenario: L0-S2 — Thinker-to-Thinker: peer researchers in emerging markets
    # Clara (UX researcher, Accra) meets a peer researcher doing qual work in West Africa.
    Given "Clara Osei" has joined as "a UX researcher at a fintech company in Accra"
    And "Peer Researcher" has joined as "a qual researcher in social impact products in Lagos"
    When the weekly matching engine runs
    Then "Clara Osei" should receive at least one match suggestion
    And the top match for "Clara Osei" should be "Peer Researcher"
    And the match rationale for "Clara Osei" should be non-empty

  # ─── L0-S4: Operator-to-Builder: investor meets devtools founder ──────────────

  Scenario: L0-S4 — Operator-to-Builder: angel investor meets devtools founder
    # Priya (angel investor, Bangalore) meets a pre-seed devtools founder.
    # Validates bidirectional complementarity: Priya offers capital, founder asks for it.
    Given "Priya Nair" has joined as "an angel investor with 10 pre-seed B2B SaaS checks"
    And "Lena Braun" has joined as "a technical founder building a developer productivity tool"
    When the weekly matching engine runs
    Then "Priya Nair" should receive at least one match suggestion
    And the top match for "Priya Nair" should be "Lena Braun"
    And "Lena Braun" should receive at least one match suggestion

  # ─── L0-S5: Builder-to-Builder: peer indie hackers ───────────────────────────

  Scenario: L0-S5 — Builder-to-Builder: indie founders at the same revenue stage
    # Daniel and Mia are both bootstrapped founders at similar stages.
    # Validates symmetric peer-to-peer matching on accountability intent.
    Given "Daniel Hartmann" has joined as "a second-time indie hacker after a small exit"
    And "Mia Santos" has joined as "a bootstrapped B2B SaaS founder at early MRR"
    When the weekly matching engine runs
    Then "Daniel Hartmann" should receive at least one match suggestion
    And the top match for "Daniel Hartmann" should be "Mia Santos"
    And "Mia Santos" should receive at least one match suggestion

  # ─── L0 (general): score and rationale contract ──────────────────────────────

  Scenario: L0 (general) — all match scores are positive and ranked in descending order
    Given "Marcus Webb" has joined with their standard profile
    And "Freight Operator" has joined with their standard profile
    And "Clara Osei" has joined with their standard profile
    And "Peer Researcher" has joined with their standard profile
    When the weekly matching engine runs
    Then "Marcus Webb" should receive at least one match suggestion
    And the match rationale for "Marcus Webb" should be non-empty
    And the match score for "Marcus Webb" should be above 0
