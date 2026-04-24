import type {
  RecommendationParticipantsContextResponse,
  TrialAdminRecommendation,
  TrialAdminRecommendationContext,
  TrialEvent,
  TrialRecommendation,
  TrialUser,
  UserContextResponse,
  TrialUserProfile,
} from './types';

const API_BASE = (import.meta.env.VITE_TRIAL_API_BASE_URL as string | undefined) ?? 'http://localhost:8787';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const body = (await response.json()) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(body.error ?? 'Request failed');
  }

  return body;
}

export function getTrialApiBaseUrl() {
  return API_BASE;
}

export async function initializeTrialData(options?: { reset?: boolean; seed?: boolean }) {
  return request<{ ok: boolean; seeded?: boolean; usersSeeded?: number; users?: number }>('/api/trial/init', {
    method: 'POST',
    body: JSON.stringify(options ?? {}),
  });
}

export async function listTrialUsers() {
  const result = await request<{ users: TrialUser[] }>('/api/trial/users');
  return result.users;
}

export async function getTrialUserProfile(userId: string) {
  const result = await request<{ profile: TrialUserProfile }>(`/api/trial/users/${encodeURIComponent(userId)}/profile`);
  return result.profile;
}

export async function getTrialUserContext(userId: string) {
  const result = await request<{ context: UserContextResponse }>(`/api/trial/users/${encodeURIComponent(userId)}/context`);
  return result.context;
}

export async function saveTrialUserProfile(userId: string, profile: Omit<TrialUserProfile, 'updatedAt'>) {
  const result = await request<{ profile: TrialUserProfile }>(`/api/trial/users/${encodeURIComponent(userId)}/profile`, {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
  return result.profile;
}

export async function runWeeklyMatching(maxRecommendationsPerUser = 5) {
  return request<{
    ok: boolean;
    runId: string;
    startedAt: string;
    completedAt: string;
    summary: {
      usersEvaluated: number;
      recommendationsGenerated: number;
      maxRecommendationsPerUser: number;
    };
  }>('/api/trial/matching/run-weekly', {
    method: 'POST',
    body: JSON.stringify({ maxRecommendationsPerUser }),
  });
}

export async function listUserRecommendations(userId: string, status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const result = await request<{ recommendations: TrialRecommendation[] }>(
    `/api/trial/users/${encodeURIComponent(userId)}/recommendations${qs}`,
  );
  return result.recommendations;
}

export async function listAdminRecommendations(status = 'pending_review') {
  const result = await request<{ recommendations: TrialAdminRecommendation[] }>(
    `/api/trial/admin/recommendations?status=${encodeURIComponent(status)}`,
  );
  return result.recommendations;
}

export async function submitAdminDecision(params: {
  recommendationId: string;
  adminId: string;
  decision: 'approve' | 'reject';
  rationale: string;
}) {
  return request<{ ok: boolean }>(
    `/api/trial/admin/recommendations/${encodeURIComponent(params.recommendationId)}/decision`,
    {
      method: 'POST',
      body: JSON.stringify({
        adminId: params.adminId,
        decision: params.decision,
        rationale: params.rationale ?? null,
      }),
    },
  );
}

export async function getAdminRecommendationContext(recommendationId: string) {
  const result = await request<{ context: TrialAdminRecommendationContext }>(
    `/api/trial/admin/recommendations/${encodeURIComponent(recommendationId)}/context`,
  );
  return result.context;
}

export async function getRecommendationParticipantsContext(recommendationId: string) {
  const result = await request<{ context: RecommendationParticipantsContextResponse }>(
    `/api/trial/recommendations/${encodeURIComponent(recommendationId)}/participants-context`,
  );
  return result.context;
}

export async function respondToRecommendation(params: {
  recommendationId: string;
  userId: string;
  decision: 'accept' | 'pass';
}) {
  return request<{ ok: boolean }>(`/api/trial/recommendations/${encodeURIComponent(params.recommendationId)}/respond`, {
    method: 'POST',
    body: JSON.stringify({
      userId: params.userId,
      decision: params.decision,
    }),
  });
}

export async function updateFollowThrough(params: {
  recommendationId: string;
  actorUserId: string;
  status: 'intro_sent' | 'meeting_scheduled' | 'completed' | 'no_follow_through';
  notes?: string;
}) {
  return request<{ ok: boolean }>(`/api/trial/recommendations/${encodeURIComponent(params.recommendationId)}/follow-through`, {
    method: 'POST',
    body: JSON.stringify({
      actorUserId: params.actorUserId,
      status: params.status,
      notes: params.notes ?? null,
    }),
  });
}

export async function listTrialEvents(filters?: { userId?: string; eventType?: string; recommendationId?: string; limit?: number }) {
  const params = new URLSearchParams();
  if (filters?.userId) {
    params.set('userId', filters.userId);
  }
  if (filters?.eventType) {
    params.set('eventType', filters.eventType);
  }
  if (filters?.recommendationId) {
    params.set('recommendationId', filters.recommendationId);
  }
  if (filters?.limit) {
    params.set('limit', String(filters.limit));
  }

  const qs = params.toString();
  const result = await request<{ events: TrialEvent[] }>(`/api/trial/events${qs ? `?${qs}` : ''}`);
  return result.events;
}
