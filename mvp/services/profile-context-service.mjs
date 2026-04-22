import {
  buildRecommendationExplanationSupport,
  buildUserContext,
} from '../context/profile-context-support.mjs';

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export class ProfileContextService {
  constructor({ repository }) {
    this.repository = repository;
  }

  getUserContext(userId) {
    const profile = this.repository.getUserProfile(userId);
    if (!profile) {
      throw createHttpError(404, 'User not found.');
    }

    return {
      ...buildUserContext(profile),
      meta: {
        strategy: 'deterministic',
      },
    };
  }

  getRecommendationContext(recommendationId) {
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
      sourceContext,
      candidateContext,
      explanationSupport,
      meta: {
        strategy: 'deterministic',
        snapshotUsed: Boolean(snapshotEvent?.payload?.explanationSupportSnapshot),
      },
    };
  }
}
