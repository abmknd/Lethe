export interface CompletenessResult {
  userId: string;
  isEligible: boolean;
  missingFields: string[];
  completenessScore: number;
}

export interface CepEntry {
  id: string;
  userId: string;
  focusText: string;
  createdAt: string;
  expiresAt: string;
}

export interface CepResponse {
  cep: CepEntry | null;
  isActive: boolean;
}

export type TrialMeetingReadinessStatus = 'excellent' | 'good' | 'medium' | 'low' | 'failed' | 'unknown';

export interface TrialMeetingReadiness {
  id: string;
  userId: string;
  provider: string;
  testedAt: string;
  expiresAt: string;
  status: TrialMeetingReadinessStatus;
  score: number | null;
  latencyMs: number | null;
  jitterMs: number | null;
  packetLossPct: number | null;
  uploadKbps: number | null;
  downloadKbps: number | null;
  canUseCamera: boolean;
  canUseMic: boolean;
  deviceWarnings: string[];
  recommendation: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrialMeetingReadinessResponse {
  readiness: TrialMeetingReadiness | null;
  isActive: boolean;
  displayStatus: TrialMeetingReadinessStatus;
}

export interface AppUser {
  id: string;
  displayName: string;
  handle: string;
  email: string;
  timezone: string;
  location: string;
  isActive: boolean;
  matchingEnabled: boolean;
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
  startTime?: string;
  endTime?: string;
  timezone?: string;
}

export interface Preferences {
  matchIntent: string[];
  offers: string[];
  asks: string[];
  preferredLocations?: string[];
  userType?: string;
  preferredUserTypes?: string[];
  interests: string[];
  objectives?: string[];
  introText: string;
  meetingFormat: string;
  localOnly: boolean;
  blockedUserIds: string[];
}

export interface UserProfile {
  user: AppUser;
  preferences: Preferences;
  availability: AvailabilitySlot[];
  updatedAt?: string;
}

export interface PublicProfile {
  id: string;
  name: string;
  handle: string | null;
  location: string | null;
  bio: string;
  introText: string;
  interests: string[];
  objectives: string[];
}

export interface Recommendation {
  id: string;
  runId: string;
  userId: string;
  candidateUserId: string;
  rank: number;
  score: number;
  status: string;
  whyMatched: string[];
  insightText: string | null;
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
    outcomeStatus?: string | null;
    notes: string | null;
  };
  meeting: Meeting | null;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  recommendationId: string;
  provider: string;
  externalMeetingId: string | null;
  meetingUrl: string;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRecommendation {
  id: string;
  runId: string;
  userId: string;
  candidateUserId: string;
  rank: number;
  score: number;
  status: string;
  whyMatched: string[];
  insightText: string | null;
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

export interface AppEvent {
  id: string;
  eventType: string;
  actorUserId: string | null;
  targetUserId: string | null;
  recommendationId: string | null;
  runId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface EvidenceReference {
  entityType: string;
  entityId: string;
  fieldPath: string;
  normalizedValue: unknown;
  sourceTimestamp?: string;
}

export interface ParticipantContext {
  id: string;
  displayName: string;
  handle: string;
  location: string;
  timezone: string;
  summary: string;
  reviewerContextCard: {
    location: string;
    timezone: string;
    matchingEnabled: boolean;
    localOnly: boolean;
    meetingFormat: string;
  };
  extractionSupport: {
    asks: string[];
    offers: string[];
    intents: string[];
    interests: string[];
    preferredUserTypes: string[];
    calibrationChoices: string[];
    availabilityDigest: string;
  };
  evidence: EvidenceReference[];
}

export interface UserContextResponse {
  participant: ParticipantContext;
  meta: {
    strategy: string;
  };
}

export interface RecommendationParticipantsContextResponse {
  recommendationId: string;
  runId: string;
  sourceParticipant: ParticipantContext;
  candidateParticipant: ParticipantContext;
  explanationSupport: {
    headline: string;
    highlights: string[];
    alignment: {
      sharedIntents: string[];
      sharedInterests: string[];
      askOfferBridges: string[];
      calibrationAlignment: string[];
    };
    evidence: EvidenceReference[];
  };
  meta: {
    strategy: string;
    snapshotUsed: boolean;
  };
}

export interface UserContextDetail {
  userId: string;
  summary: string;
  extractionSupport: {
    asks: string[];
    offers: string[];
    intents: string[];
    interests: string[];
    preferredUserTypes: string[];
    calibrationChoices: string[];
    freeText: string;
    availabilityDigest: string;
  };
  reviewerContextCard: {
    location: string;
    timezone: string;
    matchingEnabled: boolean;
    localOnly: boolean;
    meetingFormat: string;
  };
  evidence: EvidenceReference[];
}

export interface RecommendationContextSupport {
  recommendationId: string;
  runId: string;
  headline: string;
  highlights: string[];
  alignment: {
    sharedIntents: string[];
    sharedInterests: string[];
    askOfferBridges: string[];
    calibrationAlignment: string[];
  };
  adminAndFollowUp: {
    latestAdminDecision: {
      decision: string;
      rationale: string | null;
      decidedAt: string | null;
      adminId: string | null;
    } | null;
    latestOutcome: {
      outcomeStatus: string | null;
      notes: string | null;
      updatedAt: string | null;
    } | null;
    priorPairNotes: Array<{
      recommendationId: string;
      createdAt: string;
      recommendationStatus: string;
      adminRationale: string | null;
      adminDecidedAt: string | null;
      outcomeStatus: string | null;
      outcomeNotes: string | null;
      outcomeUpdatedAt: string | null;
    }>;
  };
  evidence: EvidenceReference[];
  generatedAt: string | null;
}

export interface AdminRecommendationContext {
  sourceContext: UserContextDetail;
  candidateContext: UserContextDetail;
  explanationSupport: RecommendationContextSupport;
  meta: {
    strategy: string;
    snapshotUsed: boolean;
  };
}

export interface Conversation {
  id: string;
  participantA: string;
  participantB: string;
  unlockedByRecommendationId: string | null;
  createdAt: string;
  lastMessageAt: string | null;
}

export interface ConversationListItem extends Conversation {
  peer: { id: string; name: string; handle: string | null };
  lastMessagePreview: { body: string; senderId: string; createdAt: string } | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}
