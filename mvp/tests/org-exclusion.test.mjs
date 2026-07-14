// Phase 2, item 1 — layered same-org exclusion.
// Unit coverage for the pure org-exclusion module plus a matcher-level
// regression proving the self-declared-company-name layer excludes colleagues
// even when their primary emails are on personal/platform domains.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeCompanyName,
  isSameOrg,
  emailDomain,
  isGenericDomain,
  orgIdentity,
} from '../matching/org-exclusion.mjs';
import { createIsolatedApp } from './helpers/test-harness.mjs';
import { buildZaraHussain, buildColleagueAtBigTelco } from './fixtures/persona-fixtures.mjs';

test('normalizeCompanyName strips legal suffixes and punctuation', () => {
  assert.equal(normalizeCompanyName('Big Telco, Inc.'), 'big telco');
  assert.equal(normalizeCompanyName('big telco'), 'big telco');
  assert.equal(normalizeCompanyName('BigTelco LLC'), 'bigtelco');
  assert.equal(normalizeCompanyName('Acme & Co.'), 'acme and');
  assert.equal(normalizeCompanyName('   '), '');
  assert.equal(normalizeCompanyName(null), '');
});

test('emailDomain and isGenericDomain classify mailbox providers', () => {
  assert.equal(emailDomain('a@BigTelco.com'), 'bigtelco.com');
  assert.equal(emailDomain('not-an-email'), '');
  assert.equal(isGenericDomain('gmail.com'), true);
  assert.equal(isGenericDomain('bigtelco.com'), false);
  assert.equal(isGenericDomain(''), true);
});

test('isSameOrg fires on shared non-generic primary domain', () => {
  assert.equal(
    isSameOrg(orgIdentity({ email: 'a@bigtelco.com' }), orgIdentity({ email: 'b@bigtelco.com' })),
    true,
  );
});

test('isSameOrg does NOT fire on shared personal email domain', () => {
  assert.equal(
    isSameOrg(orgIdentity({ email: 'a@gmail.com' }), orgIdentity({ email: 'b@gmail.com' })),
    false,
  );
});

test('isSameOrg fires on matching company name despite personal emails', () => {
  const a = orgIdentity({ email: 'a@gmail.com', companyName: 'Big Telco, Inc.' });
  const b = orgIdentity({ email: 'b@outlook.com', companyName: 'big telco' });
  assert.equal(isSameOrg(a, b), true);
});

test('isSameOrg fires on verified work-email domain match', () => {
  const a = orgIdentity({ email: 'a@gmail.com', workEmail: 'a@bigtelco.com' });
  const b = orgIdentity({ email: 'b@gmail.com', workEmail: 'b@bigtelco.com' });
  assert.equal(isSameOrg(a, b), true);
});

test('isSameOrg does not fire across genuinely different orgs', () => {
  const a = orgIdentity({ email: 'a@acme.com', companyName: 'Acme' });
  const b = orgIdentity({ email: 'b@globex.com', companyName: 'Globex' });
  assert.equal(isSameOrg(a, b), false);
});

test('blank company names never match each other', () => {
  const a = orgIdentity({ email: 'a@gmail.com', companyName: '' });
  const b = orgIdentity({ email: 'b@gmail.com', companyName: '   ' });
  assert.equal(isSameOrg(a, b), false);
});

// Matcher-level regression: same declared company, personal emails on both
// sides. Without the company-name layer these two would otherwise match on
// their complementary growth asks/offers.
test('same-company colleagues on personal emails are excluded from each other\'s pool', () => {
  const { app, cleanup } = createIsolatedApp({ seed: false });
  try {
    app.services.onboarding.saveUserProfile(
      buildZaraHussain({
        user: { email: 'zara.personal@gmail.com' },
        preferences: { companyName: 'Big Telco, Inc.' },
      }),
    );
    app.services.onboarding.saveUserProfile(
      buildColleagueAtBigTelco({
        user: { email: 'omar.personal@outlook.com' },
        preferences: { companyName: 'big telco' },
      }),
    );

    app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });

    const zaraRecs = app.services.recommendations.listForUser('zara_hussain', { status: 'pending_review' });
    assert.equal(
      zaraRecs.length,
      0,
      'same-company colleague (declared company name) should be excluded even on personal emails',
    );
  } finally {
    cleanup();
  }
});
