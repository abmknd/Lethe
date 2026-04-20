export interface TrialUser {
  id: string;
  displayName: string;
  handle: string;
  email: string;
  timezone: string;
  location: string;
  isActive: boolean;
  matchingEnabled: boolean;
}

export interface TrialAvailabilitySlot {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
  startTime?: string;
  endTime?: string;
  timezone?: string;
}

export interface TrialPreferences {
  matchIntent: string[];
  preferredLocations?: string[];
  preferredUserTypes?: string[];
  interests: string[];
  objectives?: string[];
  introText: string;
  meetingFormat: string;
  localOnly: boolean;
  matchEnabled: boolean;
  blockedUserIds: string[];
}

export interface TrialUserProfile {
  user: TrialUser;
  preferences: TrialPreferences;
  availability: TrialAvailabilitySlot[];
  updatedAt?: string;
}

export interface TrialRecommendation {
  id: string;
  runId: string;
  userId: string;
  candidateUserId: string;
  rank: number;
  score: number;
  status: string;
  whyMatched: string[];
  candidate: {
    id: string;
    displayName: string;
    handle: string;
    location: string;
    timezone: string;
    introText: string;
  };
  outcome: {
    requesterResponse: string | null;
    followThroughStatus: string;
    notes: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TrialAdminRecommendation {
  id: string;
  runId: string;
  userId: string;
  candidateUserId: string;
  rank: number;
  score: number;
  status: string;
  whyMatched: string[];
  source: {
    id: string;
    displayName: string;
    handle: string;
    location: string;
    timezone: string;
  };
  candidate: {
    id: string;
    displayName: string;
    handle: string;
    location: string;
    timezone: string;
  };
  adminDecision: {
    decision: string;
    rationale: string | null;
    decidedAt: string;
    adminId: string;
  } | null;
  createdAt: string;
}

export interface TrialEvent {
  id: string;
  eventType: string;
  actorUserId: string | null;
  targetUserId: string | null;
  recommendationId: string | null;
  runId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}
