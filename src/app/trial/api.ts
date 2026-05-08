import type {
  RecommendationParticipantsContextResponse,
  TrialAdminRecommendation,
  TrialAdminRecommendationContext,
  TrialCepEntry,
  TrialCompletenessResult,
  TrialCepResponse,
  TrialEvent,
  TrialMeeting,
  TrialPublicProfile,
  TrialRecommendation,
  TrialUser,
  UserContextResponse,
  TrialUserProfile,
} from './types';

const API_BASE = (import.meta.env.VITE_TRIAL_API_BASE_URL as string | undefined) ?? 'http://localhost:8787';

async function request<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers['authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
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

export async function listTrialUsers(token?: string) {
  const result = await request<{ users: TrialUser[] }>('/api/trial/users', undefined, token);
  return result.users;
}

export async function getTrialUserProfile(userId: string, token?: string) {
  const result = await request<{ profile: TrialUserProfile }>(
    `/api/trial/users/${encodeURIComponent(userId)}/profile`,
    undefined,
    token,
  );
  return result.profile;
}

export async function getTrialUserPublicProfile(idOrHandle: string, token?: string) {
  const result = await request<{ profile: TrialPublicProfile }>(
    `/api/trial/users/${encodeURIComponent(idOrHandle)}/profile/public`,
    undefined,
    token,
  );
  return result.profile;
}

export async function getTrialUserContext(userId: string, token?: string) {
  const result = await request<{ context: UserContextResponse }>(
    `/api/trial/users/${encodeURIComponent(userId)}/context`,
    undefined,
    token,
  );
  return result.context;
}

export async function saveTrialUserProfile(
  userId: string,
  profile: Omit<TrialUserProfile, 'updatedAt'>,
  token?: string,
) {
  const result = await request<{ profile: TrialUserProfile }>(
    `/api/trial/users/${encodeURIComponent(userId)}/profile`,
    { method: 'PUT', body: JSON.stringify(profile) },
    token,
  );
  return result.profile;
}

export async function runWeeklyMatching(maxRecommendationsPerUser = 5, token?: string) {
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
  }, token);
}

export async function listUserRecommendations(userId: string, status?: string, token?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const result = await request<{ recommendations: TrialRecommendation[] }>(
    `/api/trial/users/${encodeURIComponent(userId)}/recommendations${qs}`,
    undefined,
    token,
  );
  return result.recommendations;
}

export async function listAdminRecommendations(status = 'pending_review', token?: string) {
  const result = await request<{ recommendations: TrialAdminRecommendation[] }>(
    `/api/trial/admin/recommendations?status=${encodeURIComponent(status)}`,
    undefined,
    token,
  );
  return result.recommendations;
}

export async function submitAdminDecision(params: {
  recommendationId: string;
  adminId: string;
  decision: 'approve' | 'reject';
  rationale: string;
}, token?: string) {
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
    token,
  );
}

export async function getAdminRecommendationContext(recommendationId: string, token?: string) {
  const result = await request<{ context: TrialAdminRecommendationContext }>(
    `/api/trial/admin/recommendations/${encodeURIComponent(recommendationId)}/context`,
    undefined,
    token,
  );
  return result.context;
}

export async function getRecommendationParticipantsContext(recommendationId: string, token?: string) {
  const result = await request<{ context: RecommendationParticipantsContextResponse }>(
    `/api/trial/recommendations/${encodeURIComponent(recommendationId)}/participants-context`,
    undefined,
    token,
  );
  return result.context;
}

export async function respondToRecommendation(params: {
  recommendationId: string;
  userId: string;
  decision: 'accept' | 'pass';
}, token?: string) {
  return request<{ ok: boolean }>(`/api/trial/recommendations/${encodeURIComponent(params.recommendationId)}/respond`, {
    method: 'POST',
    body: JSON.stringify({
      userId: params.userId,
      decision: params.decision,
    }),
  }, token);
}

export async function updateFollowThrough(params: {
  recommendationId: string;
  actorUserId: string;
  status: 'intro_sent' | 'meeting_scheduled' | 'completed' | 'no_follow_through';
  notes?: string;
}, token?: string) {
  return request<{ ok: boolean }>(`/api/trial/recommendations/${encodeURIComponent(params.recommendationId)}/follow-through`, {
    method: 'POST',
    body: JSON.stringify({
      actorUserId: params.actorUserId,
      status: params.status,
      notes: params.notes ?? null,
    }),
  }, token);
}

export async function saveRecommendationMeeting(params: {
  recommendationId: string;
  actorUserId: string;
  provider?: string;
  meetingUrl: string;
  scheduledAt?: string | null;
  status?: string;
  notes?: string;
}, token?: string) {
  return request<{ ok: boolean; meeting: TrialMeeting }>(
    `/api/trial/recommendations/${encodeURIComponent(params.recommendationId)}/meeting`,
    {
      method: 'PUT',
      body: JSON.stringify({
        actorUserId: params.actorUserId,
        provider: params.provider ?? 'manual_link',
        meetingUrl: params.meetingUrl,
        scheduledAt: params.scheduledAt ?? null,
        status: params.status ?? 'scheduled',
        notes: params.notes ?? null,
      }),
    },
    token,
  );
}

export async function updateRecommendationMeetingStatus(params: {
  recommendationId: string;
  actorUserId: string;
  status: string;
  notes?: string;
}, token?: string) {
  return request<{ ok: boolean; meeting: TrialMeeting }>(
    `/api/trial/recommendations/${encodeURIComponent(params.recommendationId)}/meeting/status`,
    {
      method: 'POST',
      body: JSON.stringify({
        actorUserId: params.actorUserId,
        status: params.status,
        notes: params.notes ?? null,
      }),
    },
    token,
  );
}

export async function listTrialEvents(filters?: { userId?: string; eventType?: string; recommendationId?: string; limit?: number }, token?: string) {
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
  const result = await request<{ events: TrialEvent[] }>(`/api/trial/events${qs ? `?${qs}` : ''}`, undefined, token);
  return result.events;
}

export async function getUserCep(userId: string, token?: string): Promise<TrialCepResponse> {
  return request<TrialCepResponse>(`/api/trial/users/${encodeURIComponent(userId)}/cep`, undefined, token);
}

export async function saveUserCep(userId: string, focusText: string, token?: string): Promise<TrialCepEntry> {
  const result = await request<{ cep: TrialCepEntry }>(`/api/trial/users/${encodeURIComponent(userId)}/cep`, {
    method: 'PUT',
    body: JSON.stringify({ focusText }),
  }, token);
  return result.cep;
}

export async function clearUserCep(userId: string, token?: string): Promise<void> {
  await request<{ ok: boolean }>(`/api/trial/users/${encodeURIComponent(userId)}/cep`, {
    method: 'DELETE',
  }, token);
}

export async function getUserCompleteness(userId: string, token?: string): Promise<TrialCompletenessResult> {
  const result = await request<{ completeness: TrialCompletenessResult }>(
    `/api/trial/users/${encodeURIComponent(userId)}/completeness`,
    undefined,
    token,
  );
  return result.completeness;
}
