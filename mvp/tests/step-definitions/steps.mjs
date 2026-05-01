import assert from 'node:assert/strict';
import { Given, When, Then } from '@cucumber/cucumber';

// ─── Given — environment setup ──────────────────────────────────────────────

Given('a clean matching environment', function () {
  // App is already initialised by the Before hook in world.mjs.
  // This step is purely documentary — it names the precondition.
});

Given('{string} has joined with their standard profile', function (name) {
  this.addUser(name);
});

// Alias: "X has joined as a <role description>" — the role string is for
// human readability only; the persona is resolved from the registry by name.
Given('{string} has joined as {string}', function (name, _roleDescription) {
  this.addUser(name);
});

Given('{string} has joined with matching disabled', function (name) {
  this.addUser(name, {
    user: { matchingEnabled: false },
    preferences: { matchEnabled: false },
  });
});

Given('{string} has joined with no availability windows', function (name) {
  this.addUser(name, { availability: [] });
});

// Gives two users the same email domain to simulate same-org membership.
Given('{string} and {string} both work at {string}', function (nameA, nameB, orgDomain) {
  this.addUser(nameA, { user: { email: `${this._userIds[nameA] ?? nameA.toLowerCase().replace(' ', '.')}@${orgDomain}` } });
  this.addUser(nameB, { user: { email: `${this._userIds[nameB] ?? nameB.toLowerCase().replace(' ', '.')}@${orgDomain}` } });
});

// Adds a Mei-compatible candidate so the availability overlap exists.
Given('{string} has joined with overlapping availability on Tuesday evening', function (name) {
  this.addUser(name, {
    availability: [{ dayOfWeek: 2, startHour: 18, endHour: 20, timezone: 'UTC' }],
  });
});

Given('{string} has joined with overlapping availability on Wednesday afternoon', function (name) {
  this.addUser(name, {
    availability: [{ dayOfWeek: 3, startHour: 16, endHour: 18, timezone: 'UTC' }],
  });
});

// ─── When — actions ──────────────────────────────────────────────────────────

When('the weekly matching engine runs', function () {
  this.runMatching();
});

When('the admin approves the match for {string}', function (name) {
  this.approveMatchFor(name);
});

When('{string} accepts the match', function (name) {
  this.respondToMatch(name, 'accept');
});

When('{string} passes the match', function (name) {
  this.respondToMatch(name, 'pass');
});

When('the follow-through for {string} is updated to {string}', function (name, status) {
  this.updateFollowThrough(name, status);
});

// ─── Then — assertions ───────────────────────────────────────────────────────

Then('{string} should receive at least one match suggestion', function (name) {
  const recs = this.getPendingMatchesFor(name);
  assert.ok(recs.length > 0, `expected "${name}" to receive at least one match suggestion, got 0`);
});

Then('{string} should receive no match suggestions', function (name) {
  const recs = this.getMatchesFor(name);
  assert.equal(recs.length, 0, `expected "${name}" to receive no match suggestions, got ${recs.length}`);
});

Then('the top match for {string} should be {string}', function (name, candidateName) {
  const recs = this.getPendingMatchesFor(name);
  assert.ok(recs.length > 0, `expected "${name}" to have at least one match suggestion`);
  const expectedId = this.userId(candidateName);
  assert.equal(
    recs[0].candidateUserId,
    expectedId,
    `expected top match for "${name}" to be "${candidateName}" (${expectedId}), got ${recs[0].candidateUserId}`,
  );
});

Then('the match rationale for {string} should be non-empty', function (name) {
  const recs = this.getPendingMatchesFor(name);
  assert.ok(recs.length > 0, `expected "${name}" to have a match`);
  const rec = recs[0];
  assert.ok(Array.isArray(rec.whyMatched) && rec.whyMatched.length > 0, 'expected non-empty whyMatched array');
  assert.ok(
    rec.whyMatched.every((line) => typeof line === 'string' && line.trim().length > 0),
    'expected all rationale lines to be non-empty strings',
  );
});

Then('the match score for {string} should be below {int}', function (name, threshold) {
  const recs = this.getPendingMatchesFor(name);
  if (recs.length > 0) {
    assert.ok(
      recs[0].score < threshold,
      `expected score for "${name}" to be below ${threshold}, got ${recs[0].score}`,
    );
  }
});

Then('the match score for {string} should be above {int}', function (name, threshold) {
  const recs = this.getPendingMatchesFor(name);
  assert.ok(recs.length > 0, `expected "${name}" to have a match`);
  assert.ok(
    recs[0].score > threshold,
    `expected score for "${name}" to be above ${threshold}, got ${recs[0].score}`,
  );
});

Then('the recommendation for {string} should be in {string} status', function (name, status) {
  const uid = this.userId(name);
  const recs = this.app.services.recommendations.listForUser(uid, { status });
  assert.ok(recs.length > 0, `expected "${name}" to have a recommendation in "${status}" status`);
});

Then('{string} should not appear as a candidate for {string}', function (candidateName, forName) {
  const candidateId = this.userId(candidateName);
  const recs = this.getMatchesFor(forName);
  const appears = recs.some((r) => r.candidateUserId === candidateId);
  assert.equal(
    appears,
    false,
    `expected "${candidateName}" NOT to appear as a candidate for "${forName}", but it did`,
  );
});

Then('the event chain for {string} should include {string}', function (name, eventType) {
  const events = this.getEventsFor(name);
  const types = new Set(events.map((e) => e.eventType));
  assert.ok(types.has(eventType), `expected event chain for "${name}" to include "${eventType}"`);
});

Then('the outcome status for {string} should be {string}', function (name, expectedStatus) {
  const outcome = this.getOutcomeFor(name);
  assert.ok(outcome, `expected an outcome record for "${name}"`);
  assert.equal(outcome.outcomeStatus, expectedStatus, `expected outcome "${expectedStatus}", got "${outcome.outcomeStatus}"`);
});

Then('the accepted match count for {string} should be at most {int}', function (name, max) {
  const recs = this.getMatchesFor(name, 'accepted');
  assert.ok(recs.length <= max, `expected at most ${max} accepted matches for "${name}", got ${recs.length}`);
});

// ─── Pending steps — features not yet implemented ────────────────────────────
// These steps make @todo scenarios show as PENDING (yellow) rather than failing.

Then('an input quality warning should be surfaced during KYC', function () {
  return 'pending'; // requires: input quality scorer
});

Then('a re-framing prompt should appear for fundraising-coded asks', function () {
  return 'pending'; // requires: intent classifier
});

Then('the match should be held for HITL review with a low-reciprocity flag', function () {
  return 'pending'; // requires: reciprocity detector
});

Then('a scheduling error should be surfaced with an actionable prompt', function () {
  return 'pending'; // requires: scheduling infrastructure
});

Then('a nudge notification should fire within {int} hours', function (_hours) {
  return 'pending'; // requires: notification infrastructure
});

Then('the match should be deferred until an overlapping window exists within {int} days', function (_days) {
  return 'pending'; // requires: availability-proximity pre-filter
});

Then('the rationale should be re-evaluated and updated', function () {
  return 'pending'; // requires: profile-change listener + rationale re-evaluation
});

Then('a recovery prompt should appear asking what felt off', function () {
  return 'pending'; // requires: first-match rejection detection
});

Then('a post-referral discovery sequence should surface two additional profiles', function () {
  return 'pending'; // requires: referral-path detection
});

Then('a {string} CTA should appear on the match card', function (_ctaText) {
  return 'pending'; // requires: engagement tracking + UI CTA infra
});

Then('a tiered re-activation nudge should fire combining content and a pending match reminder', function () {
  return 'pending'; // requires: engagement tracking + notification infra
});

Then('an async intro option should be surfaced after {int} days of feed-only usage', function (_days) {
  return 'pending'; // requires: engagement tracking + notification infra
});
