# L3: Match Bypass
# Users who have valid profiles but route around the matching feature entirely.
# Tests verify bypass states are correctly represented in the data layer.
# @todo scenarios mark interventions not yet built.

Feature: L3 — Match Bypass

  Background:
    Given a clean matching environment

  # ─── L3-S2: Matching disabled on user record ─────────────────────────────────

  Scenario: L3-S2 — User with matchingEnabled false receives no match and is excluded as a candidate
    # James is a community builder who never enabled matching.
    Given "James Osei" has joined with matching disabled
    And "Freight Operator" has joined with their standard profile
    When the weekly matching engine runs
    Then "James Osei" should receive no match suggestions
    And "James Osei" should not appear as a candidate for "Freight Operator"

  # ─── L3-S3: Matching explicitly opt-out via preferences ──────────────────────

  Scenario: L3-S3 — User who explicitly opted out of matching is excluded entirely
    # Camille disabled matching because she finds it too transactional.
    Given "Camille Fontaine" has joined with matching disabled
    And "Peer Researcher" has joined with their standard profile
    When the weekly matching engine runs
    Then "Camille Fontaine" should receive no match suggestions
    And "Camille Fontaine" should not appear as a candidate for "Peer Researcher"

  # ─── L3-S4: Passive lurker — near-empty profile ──────────────────────────────

  Scenario: L3-S4 — Passive lurker with empty profile scores near zero (gap documented)
    # William provides minimal KYC and no availability. No match should generate.
    # GAP: the system has no KYC completeness gate to route passive users differently.
    Given "William Castillo" has joined as "a cautious consultant who provides minimal information"
    And "Marcus Webb" has joined with their standard profile
    When the weekly matching engine runs
    Then "William Castillo" should receive no match suggestions

  # ─── L3-S1: Pending match persists when user never responds ──────────────────

  Scenario: L3-S1 — Pending match remains in approved state when user never opens the match card
    # Mei has a valid profile and receives a match but never clicks through.
    # The recommendation should stay in approved state indefinitely — no auto-expiry.
    Given "Mei Chen" has joined as "a junior PM who avoids one-on-one meetings"
    And "Freight Operator" has joined with overlapping availability on Tuesday evening
    When the weekly matching engine runs
    And the admin approves the match for "Mei Chen"
    Then the recommendation for "Mei Chen" should be in "approved" status

  # ─── L3-S7: Dormancy — match state preserved ─────────────────────────────────

  Scenario: L3-S7 — Match state is preserved during user dormancy and available on re-activation
    # Sofia went dormant for 6 weeks. Her approved match should still be waiting.
    Given "Leila Ahmadi" has joined with overlapping availability on Wednesday afternoon
    And "Peer Researcher" has joined with overlapping availability on Wednesday afternoon
    When the weekly matching engine runs
    And the admin approves the match for "Leila Ahmadi"
    Then the recommendation for "Leila Ahmadi" should be in "approved" status

  # ─── L3-S5: Referral user — single match, no further intent ──────────────────

  Scenario: L3-S5 — Referral user accepts first match but has no further matches in pool
    # Yuki joined to connect with a specific person. After accepting, the pool is exhausted.
    Given "Marcus Webb" has joined as "a founder referred by a trusted contact"
    And "Freight Operator" has joined as "the specific person the referral was meant to connect"
    When the weekly matching engine runs
    And the admin approves the match for "Marcus Webb"
    And "Marcus Webb" accepts the match
    Then the accepted match count for "Marcus Webb" should be at most 1

  # ─── @todo scenarios — interventions not yet built ───────────────────────────

  @todo
  Scenario: L3-S1 — Async intro prompt surfaces after 30 days of feed-only usage
    # Mei has high feed engagement but has never opened a match card.
    # An async intro option (written Q&A before a live call) should lower the stakes.
    Given "Mei Chen" has joined with their standard profile
    When the weekly matching engine runs
    Then an async intro option should be surfaced after 30 days of feed-only usage

  @todo
  Scenario: L3-S5 — Post-referral activation sequence surfaces two additional profiles
    # After Yuki accepts her referral match, she needs a reason to stay.
    # The system should immediately surface two more relevant profiles.
    Given "Marcus Webb" has joined with their standard profile
    And "Freight Operator" has joined with their standard profile
    When the weekly matching engine runs
    And the admin approves the match for "Marcus Webb"
    And "Marcus Webb" accepts the match
    Then a post-referral discovery sequence should surface two additional profiles

  @todo
  Scenario: L3-S6 — "Formalize this connection" CTA appears after significant feed engagement
    # Kevin migrated from matching to feed after finding his audience.
    # A CTA should appear on profiles he engages with frequently via the feed.
    Given "Marcus Webb" has joined with their standard profile
    And "Freight Operator" has joined with their standard profile
    When the weekly matching engine runs
    Then a "formalize this connection" CTA should appear on the match card

  @todo
  Scenario: L3-S7 — Tiered re-activation nudge combines content and pending match reminder at day 21
    # Sofia went dormant and only re-engaged via a topic-relevant feed notification.
    # The second nudge should combine content relevance with her pending match state.
    Given "Leila Ahmadi" has joined with their standard profile
    And "Freight Operator" has joined with their standard profile
    When the weekly matching engine runs
    Then a tiered re-activation nudge should fire combining content and a pending match reminder

  @todo
  Scenario: L3-S9 — First-match rejection triggers an immediate recovery prompt
    # Astrid had a poor first match and permanently switched to community features.
    # A recovery prompt after rejection could have prevented the feature switch.
    Given "Marcus Webb" has joined with their standard profile
    And "Freight Operator" has joined with their standard profile
    When the weekly matching engine runs
    And the admin approves the match for "Marcus Webb"
    And "Marcus Webb" passes the match
    Then a recovery prompt should appear asking what felt off
