import { World, Before, After, setWorldConstructor } from '@cucumber/cucumber';
import { createIsolatedTrialApp } from '../helpers/trial-test-harness.mjs';
import {
  buildMarcusWebb,
  buildLogisticsOperatorMentor,
  buildClaraOsei,
  buildPeerResearcher,
  buildPriyaNair,
  buildDevtoolsFounder,
  buildDanielHartmann,
  buildPeerIndieHacker,
  buildTylerBrooks,
  buildEthanPark,
  buildLeilaAhmadi,
  buildMinJiPark,
  buildChrisNakamura,
  buildZaraHussain,
  buildColleagueAtBigTelco,
  buildEleanorHughes,
  buildMeiChen,
  buildJamesOsei,
  buildCamilleFontaine,
  buildWilliamCastillo,
} from '../fixtures/persona-fixtures.mjs';

// Registry maps the display name used in feature files to a profile builder.
const PERSONA_REGISTRY = {
  'Marcus Webb':     buildMarcusWebb,
  'Freight Operator': buildLogisticsOperatorMentor,
  'Clara Osei':      buildClaraOsei,
  'Peer Researcher': buildPeerResearcher,
  'Priya Nair':      buildPriyaNair,
  'Lena Braun':      buildDevtoolsFounder,
  'Daniel Hartmann': buildDanielHartmann,
  'Mia Santos':      buildPeerIndieHacker,
  'Tyler Brooks':    buildTylerBrooks,
  'Ethan Park':      buildEthanPark,
  'Leila Ahmadi':    buildLeilaAhmadi,
  'Min-Ji Park':     buildMinJiPark,
  'Chris Nakamura':  buildChrisNakamura,
  'Zara Hussain':    buildZaraHussain,
  'Omar Siddiqui':   buildColleagueAtBigTelco,
  'Eleanor Hughes':  buildEleanorHughes,
  'Mei Chen':        buildMeiChen,
  'James Osei':      buildJamesOsei,
  'Camille Fontaine': buildCamilleFontaine,
  'William Castillo': buildWilliamCastillo,
};

class LetheWorld extends World {
  constructor(options) {
    super(options);
    this.app = null;
    this._cleanup = null;
    this._userIds = {};   // display name → user id
    this._lastRec = null; // most recently processed recommendation
  }

  // --- Setup helpers ---

  initApp() {
    const { app, cleanup } = createIsolatedTrialApp({ seed: false });
    this.app = app;
    this._cleanup = cleanup;
  }

  addUser(name, overrides = {}) {
    const builder = PERSONA_REGISTRY[name];
    if (!builder) throw new Error(`Unknown persona "${name}" — add it to PERSONA_REGISTRY in world.mjs`);
    const profile = builder(overrides);
    this.app.services.onboarding.saveUserProfile(profile);
    this._userIds[name] = profile.user.id;
    return profile;
  }

  userId(name) {
    const id = this._userIds[name];
    if (!id) throw new Error(`User "${name}" not found — did you add them with "has joined"?`);
    return id;
  }

  // --- Action helpers ---

  runMatching() {
    return this.app.services.weeklyMatching.runWeeklyMatching({ maxRecommendationsPerUser: 3 });
  }

  approveMatchFor(name) {
    const uid = this.userId(name);
    const pending = this.app.services.adminReview.listQueue({ status: 'pending_review' });
    const rec = pending.find((r) => r.userId === uid);
    if (!rec) throw new Error(`No pending recommendation found for "${name}"`);
    this.app.services.adminReview.decide({
      recommendationId: rec.id,
      adminId: 'admin_bdd',
      decision: 'approve',
      rationale: 'Approved by Gherkin scenario step for BDD test coverage.',
    });
    this._lastRec = rec;
    return rec;
  }

  respondToMatch(name, decision) {
    const uid = this.userId(name);
    const approved = this.app.services.recommendations.listForUser(uid, { status: 'approved' });
    if (!approved.length) throw new Error(`No approved recommendation found for "${name}"`);
    const rec = approved[0];
    this.app.services.recommendations.respondToRecommendation({
      recommendationId: rec.id,
      userId: uid,
      decision,
    });
    this._lastRec = rec;
    return rec;
  }

  updateFollowThrough(name, status) {
    const uid = this.userId(name);
    const recs = this.app.services.recommendations.listForUser(uid);
    const rec = recs.find((r) => ['accepted', 'approved'].includes(r.status));
    if (!rec) throw new Error(`No active recommendation found for "${name}" to update follow-through`);
    this.app.services.recommendations.updateFollowThrough({
      recommendationId: rec.id,
      actorUserId: 'admin_bdd',
      status,
      notes: `BDD step: follow-through updated to ${status}`,
    });
    this._lastRec = rec;
    return rec;
  }

  // --- Query helpers ---

  getMatchesFor(name, status) {
    const uid = this.userId(name);
    return this.app.services.recommendations.listForUser(uid, status ? { status } : {});
  }

  getPendingMatchesFor(name) {
    return this.getMatchesFor(name, 'pending_review');
  }

  getOutcomeFor(name) {
    const uid = this.userId(name);
    const recs = this.app.services.recommendations.listForUser(uid);
    const rec = recs.find((r) => r.outcome);
    return rec?.outcome ?? null;
  }

  getEventsFor(name) {
    const uid = this.userId(name);
    return this.app.services.recommendations.listEvents({ userId: uid, limit: 100 });
  }

  teardown() {
    if (this._cleanup) {
      this._cleanup();
      this._cleanup = null;
    }
  }
}

setWorldConstructor(LetheWorld);

Before(function () {
  this.initApp();
});

After(function () {
  this.teardown();
});
