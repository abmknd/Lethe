function normalizeToken(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function uniqueNormalized(values = []) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const normalized = normalizeToken(value);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function sharedNormalized(a = [], b = []) {
  const left = new Set(uniqueNormalized(a));
  return uniqueNormalized(b).filter((value) => left.has(value));
}

function asEvidence({ entityType, entityId, fieldPath, normalizedValue, sourceTimestamp = null }) {
  return {
    entityType,
    entityId,
    fieldPath,
    normalizedValue,
    ...(sourceTimestamp ? { sourceTimestamp } : {}),
  };
}

function summarizeAvailability(availability = []) {
  if (!availability.length) {
    return 'No availability slots configured.';
  }

  const totalHours = availability.reduce((sum, slot) => sum + Math.max(0, Number(slot.endHour) - Number(slot.startHour)), 0);
  const days = [...new Set(availability.map((slot) => Number(slot.dayOfWeek)).filter(Number.isFinite))].sort((a, b) => a - b);
  return `${availability.length} slots, ~${totalHours}h total, days ${days.join(', ')}`;
}

function buildProfileSummary(profile) {
  const intents = uniqueNormalized(profile.preferences.matchIntent);
  const offers = uniqueNormalized(profile.preferences.offers);
  const asks = uniqueNormalized(profile.preferences.asks);
  const interests = uniqueNormalized(profile.preferences.interests);
  const meetWho = uniqueNormalized(profile.preferences.preferredUserTypes);
  const calibrationChoices = uniqueNormalized(profile.preferences.objectives);
  const introText = String(profile.preferences.introText ?? '').trim();
  const bio = String(profile.user.bio ?? '').trim();
  const freeText = introText || bio;

  const summaryParts = [
    `${profile.user.displayName} (${profile.user.handle ? `@${profile.user.handle}` : 'no-handle'})`,
    intents.length ? `intents: ${intents.slice(0, 3).join(', ')}` : null,
    offers.length ? `offers: ${offers.slice(0, 3).join(', ')}` : null,
    asks.length ? `asks: ${asks.slice(0, 3).join(', ')}` : null,
    meetWho.length ? `meet_who: ${meetWho.slice(0, 3).join(', ')}` : null,
    calibrationChoices.length ? `calibration: ${calibrationChoices.slice(0, 3).join(', ')}` : null,
    `availability: ${summarizeAvailability(profile.availability)}`,
  ].filter(Boolean);

  const evidence = [
    asEvidence({
      entityType: 'user',
      entityId: profile.user.id,
      fieldPath: 'user.location',
      normalizedValue: normalizeToken(profile.user.location ?? ''),
      sourceTimestamp: profile.updatedAt ?? null,
    }),
    asEvidence({
      entityType: 'preferences',
      entityId: profile.user.id,
      fieldPath: 'preferences.matchIntent',
      normalizedValue: intents,
      sourceTimestamp: profile.updatedAt ?? null,
    }),
    asEvidence({
      entityType: 'preferences',
      entityId: profile.user.id,
      fieldPath: 'preferences.offers',
      normalizedValue: offers,
      sourceTimestamp: profile.updatedAt ?? null,
    }),
    asEvidence({
      entityType: 'preferences',
      entityId: profile.user.id,
      fieldPath: 'preferences.asks',
      normalizedValue: asks,
      sourceTimestamp: profile.updatedAt ?? null,
    }),
    asEvidence({
      entityType: 'preferences',
      entityId: profile.user.id,
      fieldPath: 'preferences.interests',
      normalizedValue: interests,
      sourceTimestamp: profile.updatedAt ?? null,
    }),
    asEvidence({
      entityType: 'preferences',
      entityId: profile.user.id,
      fieldPath: 'preferences.objectives',
      normalizedValue: calibrationChoices,
      sourceTimestamp: profile.updatedAt ?? null,
    }),
    asEvidence({
      entityType: 'preferences',
      entityId: profile.user.id,
      fieldPath: introText ? 'preferences.introText' : 'user.bio',
      normalizedValue: normalizeToken(freeText),
      sourceTimestamp: profile.updatedAt ?? null,
    }),
  ];

  return {
    userId: profile.user.id,
    summary: summaryParts.join(' | '),
    extractionSupport: {
      asks,
      offers,
      intents,
      interests,
      preferredUserTypes: meetWho,
      calibrationChoices,
      freeText,
      availabilityDigest: summarizeAvailability(profile.availability),
    },
    reviewerContextCard: {
      location: profile.user.location,
      timezone: profile.user.timezone,
      matchingEnabled: Boolean(profile.user.matchingEnabled),
      localOnly: Boolean(profile.preferences.localOnly),
      meetingFormat: profile.preferences.meetingFormat,
    },
    evidence,
  };
}

function buildAskOfferBridges(sourceProfile, candidateProfile) {
  const sourceAsks = uniqueNormalized(sourceProfile.preferences.asks);
  const sourceOffers = uniqueNormalized(sourceProfile.preferences.offers);
  const candidateAsks = uniqueNormalized(candidateProfile.preferences.asks);
  const candidateOffers = uniqueNormalized(candidateProfile.preferences.offers);

  const sourceNeedsCandidateOffers = sharedNormalized(sourceAsks, candidateOffers).map(
    (token) => `candidate offers source ask: ${token}`,
  );
  const candidateNeedsSourceOffers = sharedNormalized(candidateAsks, sourceOffers).map(
    (token) => `source offers candidate ask: ${token}`,
  );

  return [...sourceNeedsCandidateOffers, ...candidateNeedsSourceOffers];
}

export function buildRecommendationExplanationSupport({
  recommendation,
  sourceProfile,
  candidateProfile,
  adminDecision = null,
  outcome = null,
  priorNotes = [],
  generatedAt = null,
}) {
  const sourceSummary = buildProfileSummary(sourceProfile);
  const candidateSummary = buildProfileSummary(candidateProfile);

  const sharedIntents = sharedNormalized(
    sourceProfile.preferences.matchIntent,
    candidateProfile.preferences.matchIntent,
  );
  const sharedInterests = sharedNormalized(
    sourceProfile.preferences.interests,
    candidateProfile.preferences.interests,
  );
  const calibrationAlignment = sharedNormalized(
    sourceProfile.preferences.objectives,
    candidateProfile.preferences.objectives,
  );
  const askOfferBridges = buildAskOfferBridges(sourceProfile, candidateProfile);

  const explanationEvidence = [
    asEvidence({
      entityType: 'recommendation',
      entityId: recommendation.id,
      fieldPath: 'recommendation.whyMatched',
      normalizedValue: uniqueNormalized(recommendation.whyMatched ?? []),
      sourceTimestamp: recommendation.updatedAt ?? recommendation.createdAt ?? generatedAt ?? null,
    }),
    asEvidence({
      entityType: 'recommendation',
      entityId: recommendation.id,
      fieldPath: 'recommendation.score',
      normalizedValue: Number(recommendation.score ?? 0),
      sourceTimestamp: recommendation.updatedAt ?? recommendation.createdAt ?? generatedAt ?? null,
    }),
    asEvidence({
      entityType: 'preferences',
      entityId: sourceProfile.user.id,
      fieldPath: 'preferences.matchIntent',
      normalizedValue: uniqueNormalized(sourceProfile.preferences.matchIntent),
      sourceTimestamp: sourceProfile.updatedAt ?? null,
    }),
    asEvidence({
      entityType: 'preferences',
      entityId: candidateProfile.user.id,
      fieldPath: 'preferences.matchIntent',
      normalizedValue: uniqueNormalized(candidateProfile.preferences.matchIntent),
      sourceTimestamp: candidateProfile.updatedAt ?? null,
    }),
    asEvidence({
      entityType: 'preferences',
      entityId: sourceProfile.user.id,
      fieldPath: 'preferences.objectives',
      normalizedValue: uniqueNormalized(sourceProfile.preferences.objectives),
      sourceTimestamp: sourceProfile.updatedAt ?? null,
    }),
    asEvidence({
      entityType: 'preferences',
      entityId: candidateProfile.user.id,
      fieldPath: 'preferences.objectives',
      normalizedValue: uniqueNormalized(candidateProfile.preferences.objectives),
      sourceTimestamp: candidateProfile.updatedAt ?? null,
    }),
  ];

  if (adminDecision?.rationale) {
    explanationEvidence.push(
      asEvidence({
        entityType: 'admin_decision',
        entityId: recommendation.id,
        fieldPath: 'adminDecision.rationale',
        normalizedValue: normalizeToken(adminDecision.rationale),
        sourceTimestamp: adminDecision.decidedAt ?? null,
      }),
    );
  }

  if (outcome?.notes) {
    explanationEvidence.push(
      asEvidence({
        entityType: 'outcome',
        entityId: outcome.id ?? recommendation.id,
        fieldPath: 'outcome.notes',
        normalizedValue: normalizeToken(outcome.notes),
        sourceTimestamp: outcome.updatedAt ?? null,
      }),
    );
  }

  return {
    recommendationId: recommendation.id,
    runId: recommendation.runId,
    headline: `Why ${candidateProfile.user.displayName} for ${sourceProfile.user.displayName}`,
    highlights: [...(recommendation.whyMatched ?? [])],
    alignment: {
      sharedIntents,
      sharedInterests,
      askOfferBridges,
      calibrationAlignment,
    },
    adminAndFollowUp: {
      latestAdminDecision: adminDecision
        ? {
            decision: adminDecision.decision,
            rationale: adminDecision.rationale ?? null,
            decidedAt: adminDecision.decidedAt ?? null,
            adminId: adminDecision.adminId ?? null,
          }
        : null,
      latestOutcome: outcome
        ? {
            outcomeStatus: outcome.outcomeStatus ?? null,
            notes: outcome.notes ?? null,
            updatedAt: outcome.updatedAt ?? null,
          }
        : null,
      priorPairNotes: priorNotes,
    },
    evidence: [...sourceSummary.evidence, ...candidateSummary.evidence, ...explanationEvidence],
    generatedAt,
  };
}

export function buildRecommendationGenerationSnapshot({ recommendation, sourceProfile, candidateProfile, generatedAt }) {
  const sourceContext = buildProfileSummary(sourceProfile);
  const candidateContext = buildProfileSummary(candidateProfile);
  const explanationSupport = buildRecommendationExplanationSupport({
    recommendation,
    sourceProfile,
    candidateProfile,
    generatedAt,
    priorNotes: [],
  });

  return {
    strategy: 'deterministic',
    generatedAt,
    sourceContext,
    candidateContext,
    explanationSupport,
  };
}

export function buildUserContext(profile) {
  return buildProfileSummary(profile);
}
