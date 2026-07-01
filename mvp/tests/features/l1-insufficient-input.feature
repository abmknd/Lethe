# L1: Insufficient Input
# Users who have incomplete, vague, or misaligned profiles.
# Tests document current behavior and expose gaps in input validation.
# @todo scenarios mark features that are not yet built.

Feature: L1 — Insufficient Input

  Background:
    Given a clean matching environment

  # ─── L1-S1: Empty asks — no completeness gate ────────────────────────────────

  Scenario: L1-S1 — Empty asks: no input completeness gate exists (gap documented)
    # Tyler is an aspiring founder who left his asks blank.
    # GAP: the system should route him to community-first, not generate a match.
    # Current behavior: a match can still be generated on other dimensions.
    Given "Tyler Brooks" has joined as "an aspiring founder with no specific ask yet"
    And "Freight Operator" has joined with their standard profile
    When the weekly matching engine runs
    Then the match score for "Tyler Brooks" should be below 100

  # ─── L1-S1: Empty asks produce zero complementarity ──────────────────────────

  Scenario: L1-S1 — Empty asks produce zero complementarity contribution to score
    # Empty asks means complementarityRatio = 0 for all candidates.
    Given "Tyler Brooks" has joined as "an aspiring founder with empty asks"
    And "Freight Operator" has joined with their standard profile
    When the weekly matching engine runs
    Then the match score for "Tyler Brooks" should be below 50

  # ─── L1-S5: Empty offers — no guard ─────────────────────────────────────────

  Scenario: L1-S5 — Empty offers: reciprocal complementarity is zero (gap documented)
    # Ethan is a CS student who left his offer blank.
    # GAP: he should be routed to community-first rather than dropped into matching.
    Given "Ethan Park" has joined as "a CS student who has not yet articulated what he offers"
    And "Freight Operator" has joined with their standard profile
    When the weekly matching engine runs
    Then the match score for "Ethan Park" should be below 50

  # ─── L1-S6: No availability set — match may still surface ────────────────────

  Scenario: L1-S6 — No availability windows: match generates with zero availability score (gap documented)
    # Leila has a strong profile but refused to set availability.
    # GAP: no blocking guard requires availability before surfacing a match.
    # The matcher excludes users with no availability overlap, so if any user has
    # no windows, the pair simply won't match — documenting the silent failure.
    Given "Leila Ahmadi" has joined with no availability windows
    And "Marcus Webb" has joined with their standard profile
    When the weekly matching engine runs
    Then "Leila Ahmadi" should receive no match suggestions

  # ─── L1-S8: Availability skipped — appears optional ─────────────────────────

  Scenario: L1-S8 — Availability skipped: treated as optional, scheduling would silently fail (gap documented)
    # Claire skipped availability during onboarding assuming it was optional.
    # Because her availability is empty, the matcher excludes her from all candidates.
    # GAP: the onboarding UI should mark availability as required before submission.
    Given "Leila Ahmadi" has joined with no availability windows
    And "Freight Operator" has joined with their standard profile
    When the weekly matching engine runs
    Then "Leila Ahmadi" should receive no match suggestions

  # ─── L1-S10: Low-reciprocity offer — no detection ────────────────────────────

  Scenario: L1-S10 — Low-reciprocity offer: media coverage offer generates a match without HITL flag (gap documented)
    # Min-Ji (journalist) offers "media coverage" — a low-reciprocity offer.
    # GAP: no offer-reciprocity detector exists to flag or hold such matches.
    Given "Min-Ji Park" has joined as "a tech journalist offering media coverage"
    And "Marcus Webb" has joined with their standard profile
    When the weekly matching engine runs
    Then the match score for "Min-Ji Park" should be below 80

  # ─── @todo scenarios — features not yet built ────────────────────────────────

  @todo
  Scenario: L1-S2 — Generic LinkedIn bio input triggers an input quality warning
    # Fatima copy-pasted her LinkedIn bio. The system should detect generic register
    # and surface an input quality indicator before the profile is saved.
    Given "Marcus Webb" has joined with their standard profile
    When the weekly matching engine runs
    Then an input quality warning should be surfaced during KYC

  @todo
  Scenario: L1-S3 — Commercial solicitation pattern triggers a value-mismatch soft redirect
    # Jake is a freelance designer looking for clients. The system should detect the
    # commercial solicitation pattern and surface a re-framing message.
    Given "Marcus Webb" has joined with their standard profile
    When the weekly matching engine runs
    Then the match should be held for HITL review with a low-reciprocity flag

  @todo
  Scenario: L1-S4 — Fundraising-only ask triggers a re-framing clarifying prompt
    # Valentina framed her entire profile around fundraising. The system should prompt
    # a relational re-framing rather than blocking matching entirely.
    Given "Marcus Webb" has joined with their standard profile
    When the weekly matching engine runs
    Then a re-framing prompt should appear for fundraising-coded asks

  @todo
  Scenario: L1-S8 — Availability-missing nudge fires within 24 hours of match generation
    # When a match is generated for a user with no availability, a 24-hour nudge
    # notification should fire prompting them to add availability windows.
    Given "Marcus Webb" has joined with their standard profile
    When the weekly matching engine runs
    Then a nudge notification should fire within 24 hours
