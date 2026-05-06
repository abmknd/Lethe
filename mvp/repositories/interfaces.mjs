export class UserRepository {
  listUsers() {
    throw new Error('Not implemented');
  }

  getUserById() {
    throw new Error('Not implemented');
  }

  upsertUser() {
    throw new Error('Not implemented');
  }
}

export class PreferenceRepository {
  getPreferencesByUserId() {
    throw new Error('Not implemented');
  }

  upsertPreferences() {
    throw new Error('Not implemented');
  }
}

export class AvailabilityRepository {
  listAvailabilityByUserId() {
    throw new Error('Not implemented');
  }

  replaceAvailabilitySlots() {
    throw new Error('Not implemented');
  }
}

export class RecommendationRepository {
  createRecommendationRun() {
    throw new Error('Not implemented');
  }

  completeRecommendationRun() {
    throw new Error('Not implemented');
  }

  replacePendingRecommendationsForRun() {
    throw new Error('Not implemented');
  }

  listRecommendationsForUser() {
    throw new Error('Not implemented');
  }

  listAdminRecommendations() {
    throw new Error('Not implemented');
  }

  getRecommendationById() {
    throw new Error('Not implemented');
  }

  getAdminDecisionByRecommendationId() {
    throw new Error('Not implemented');
  }

  listPairContextNotes() {
    throw new Error('Not implemented');
  }

  updateRecommendationStatus() {
    throw new Error('Not implemented');
  }

  listPairHistory() {
    throw new Error('Not implemented');
  }

  listRecommendationsWithDecisionAndOutcome() {
    throw new Error('Not implemented');
  }
}

export class EventRepository {
  appendEvents() {
    throw new Error('Not implemented');
  }

  listEvents() {
    throw new Error('Not implemented');
  }

  countEventsByType() {
    throw new Error('Not implemented');
  }
}

export class AdminDecisionRepository {
  recordAdminDecision() {
    throw new Error('Not implemented');
  }
}

export class OutcomeRepository {
  upsertOutcome() {
    throw new Error('Not implemented');
  }

  getOutcomeByRecommendation() {
    throw new Error('Not implemented');
  }
}

export class MeetingRepository {
  upsertMeeting() {
    throw new Error('Not implemented');
  }

  getMeetingByRecommendationId() {
    throw new Error('Not implemented');
  }

  updateMeetingStatus() {
    throw new Error('Not implemented');
  }
}

export class CepRepository {
  upsertCep() {
    throw new Error('Not implemented');
  }

  getCepByUserId() {
    throw new Error('Not implemented');
  }

  listActiveCeps() {
    throw new Error('Not implemented');
  }

  deleteCepByUserId() {
    throw new Error('Not implemented');
  }
}
