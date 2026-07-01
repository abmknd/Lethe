import {
  buildRecommendationExplanationSupport,
  buildUserContext,
} from '../context/profile-context-support.mjs';

const DEFAULT_EVIDENCE_LIMIT = 20;

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export class ProfileContextService {
  constructor({ repository }) {
    this.repository = repository;
  }

  _limitEvidence(evidence, evidenceLimit = DEFAULT_EVIDENCE_LIMIT) {
    if (!Array.isArray(evidence)) {
      return [];
    }
    return evidence.slice(0, Math.max(0, evidenceLimit));
  }

  _toParticipantContext(userContext, evidenceLimit = DEFAULT_EVIDENCE_LIMIT) {
    return {
      id: userContext.userId,
      displayName: userContext.displayName,
      handle: userContext.handle,
      location: userContext.reviewerContextCard.location,
      timezone: userContext.reviewerContextCard.timezone,
      summary: userContext.summary,
      reviewerContextCard: userContext.reviewerContextCard,
      extractionSupport: {
        asks: userContext.extractionSupport.asks,
        offers: userContext.extractionSupport.offers,
        intents: userContext.extractionSupport.intents,
        interests: userContext.extractionSupport.interests,
        preferredUserTypes: userContext.extractionSupport.preferredUserTypes,
        calibrationChoices: userContext.extractionSupport.calibrationChoices,
        availabilityDigest: userContext.extractionSupport.availabilityDigest,
      },
      evidence: this._limitEvidence(userContext.evidence, evidenceLimit),
    };
  }

  _toBridgeExplanationSupport(explanationSupport, evidenceLimit = DEFAULT_EVIDENCE_LIMIT) {
    return {
      headline: explanationSupport.headline,
      highlights: explanationSupport.highlights,
      alignment: explanationSupport.alignment,
      evidence: this._limitEvidence(explanationSupport.evidence, evidenceLimit),
    };
  }

  _buildRecommendationContextData(recommendationId) {
    const recommendation = this.repository.getRecommendationById(recommendationId);
    if (!recommendation) {
      throw createHttpError(404, 'Recommendation not found.');
    }

    const sourceProfile = this.repository.getUserProfile(recommendation.userId);
    const candidateProfile = this.repository.getUserProfile(recommendation.candidateUserId);
    if (!sourceProfile || !candidateProfile) {
      throw createHttpError(404, 'Recommendation users not found.');
    }

    const adminDecision =
      typeof this.repository.getAdminDecisionByRecommendationId === 'function'
        ? this.repository.getAdminDecisionByRecommendationId(recommendation.id)
        : null;
    const outcome =
      typeof this.repository.getOutcomeByRecommendation === 'function'
        ? this.repository.getOutcomeByRecommendation(recommendation.id)
        : null;
    const priorNotes =
      typeof this.repository.listPairContextNotes === 'function'
        ? this.repository.listPairContextNotes({
            sourceUserId: recommendation.userId,
            targetUserId: recommendation.candidateUserId,
            excludeRecommendationId: recommendation.id,
            limit: 5,
          })
        : [];

    const generationEvents =
      typeof this.repository.listEvents === 'function'
        ? this.repository.listEvents({
            recommendationId: recommendation.id,
            eventType: 'recommendation_generated',
            limit: 50,
          })
        : [];

    const snapshotEvent = generationEvents.find(
      (event) => event.payload && typeof event.payload === 'object' && event.payload.explanationSupportSnapshot,
    );

    const sourceContext = buildUserContext(sourceProfile);
    const candidateContext = buildUserContext(candidateProfile);

    const explanationSupport =
      snapshotEvent?.payload?.explanationSupportSnapshot?.explanationSupport ??
      buildRecommendationExplanationSupport({
        recommendation,
        sourceProfile,
        candidateProfile,
        adminDecision,
        outcome,
        priorNotes,
      });

    return {
      recommendation,
      sourceContext,
      candidateContext,
      explanationSupport,
      meta: {
        strategy: 'deterministic',
        snapshotUsed: Boolean(snapshotEvent?.payload?.explanationSupportSnapshot),
      },
    };
  }

  getUserContext(userId) {
    const profile = this.repository.getUserProfile(userId);
    if (!profile) {
      throw createHttpError(404, 'User not found.');
    }

    const userContext = buildUserContext(profile);
    return {
      ...userContext,
      displayName: profile.user.displayName ?? profile.user.name,
      handle: profile.user.handle,
      meta: {
        strategy: 'deterministic',
      },
    };
  }

  getViewerSafeUserContext(userId, { evidenceLimit = DEFAULT_EVIDENCE_LIMIT } = {}) {
    const context = this.getUserContext(userId);
    return {
      participant: this._toParticipantContext(context, evidenceLimit),
      meta: context.meta,
    };
  }

  getRecommendationContext(recommendationId) {
    const contextData = this._buildRecommendationContextData(recommendationId);

    return {
      sourceContext: contextData.sourceContext,
      candidateContext: contextData.candidateContext,
      explanationSupport: contextData.explanationSupport,
      meta: contextData.meta,
    };
  }

  getRecommendationParticipantsContext(recommendationId, { evidenceLimit = DEFAULT_EVIDENCE_LIMIT } = {}) {
    const contextData = this._buildRecommendationContextData(recommendationId);

    return {
      recommendationId: contextData.recommendation.id,
      runId: contextData.recommendation.runId,
      sourceParticipant: this._toParticipantContext(
        {
          ...contextData.sourceContext,
          displayName:
            contextData.recommendation.source?.displayName ??
            contextData.recommendation.source?.name ??
            contextData.sourceContext.userId,
          handle: contextData.recommendation.source?.handle ?? '',
        },
        evidenceLimit,
      ),
      candidateParticipant: this._toParticipantContext(
        {
          ...contextData.candidateContext,
          displayName:
            contextData.recommendation.candidate?.displayName ??
            contextData.recommendation.candidate?.name ??
            contextData.candidateContext.userId,
          handle: contextData.recommendation.candidate?.handle ?? '',
        },
        evidenceLimit,
      ),
      explanationSupport: this._toBridgeExplanationSupport(contextData.explanationSupport, evidenceLimit),
      meta: contextData.meta,
    };
  }
}
