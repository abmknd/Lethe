import type {
  RecommendationParticipantsContextResponse,
  AdminRecommendation,
  AdminRecommendationContext,
  CepEntry,
  CompletenessResult,
  CepResponse,
  Conversation,
  ConversationListItem,
  AppEvent,
  Meeting,
  Message,
  PublicProfile,
  Recommendation,
  AppUser,
  TrialMeetingReadinessResponse,
  TrialMeetingReadinessStatus,
  UserContextResponse,
  UserProfile,
} from './types';
import { supabase } from '../lib/supabase';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)
  ?? (import.meta.env.VITE_TRIAL_API_BASE_URL as string | undefined)
  ?? 'http://localhost:8787';

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

export function getApiBaseUrl() {
  return API_BASE;
}

export async function initializeData(options?: { reset?: boolean; seed?: boolean }) {
  return request<{ ok: boolean; seeded?: boolean; usersSeeded?: number; users?: number }>('/api/v1/init', {
    method: 'POST',
    body: JSON.stringify(options ?? {}),
  });
}

export async function listUsers(token?: string) {
  const result = await request<{ users: AppUser[] }>('/api/v1/users', undefined, token);
  return result.users;
}

export async function getUserProfile(userId: string, token?: string) {
  const result = await request<{ profile: UserProfile }>(
    `/api/v1/users/${encodeURIComponent(userId)}/profile`,
    undefined,
    token,
  );
  return result.profile;
}

export async function getUserPublicProfile(idOrHandle: string, token?: string) {
  const result = await request<{ profile: PublicProfile }>(
    `/api/v1/users/${encodeURIComponent(idOrHandle)}/profile/public`,
    undefined,
    token,
  );
  return result.profile;
}

export async function getUserContext(userId: string, token?: string) {
  const result = await request<{ context: UserContextResponse }>(
    `/api/v1/users/${encodeURIComponent(userId)}/context`,
    undefined,
    token,
  );
  return result.context;
}

export async function saveUserProfile(
  userId: string,
  profile: Omit<UserProfile, 'updatedAt'>,
  token?: string,
) {
  const result = await request<{ profile: UserProfile }>(
    `/api/v1/users/${encodeURIComponent(userId)}/profile`,
    { method: 'PUT', body: JSON.stringify(profile) },
    token,
  );
  return result.profile;
}

export async function runWeeklyMatching(maxRecommendationsPerUser = 5) {
  const { data, error } = await supabase.functions.invoke<{
    ok: boolean;
    runId: string;
    startedAt: string;
    completedAt: string;
    summary: {
      usersEvaluated: number;
      recommendationsGenerated: number;
      maxRecommendationsPerUser: number;
    };
  }>('run-weekly-matching', {
    body: { maxRecommendationsPerUser },
  });
  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to run weekly matching');
  }
  return data;
}

export async function listUserRecommendations(userId: string, status?: string, token?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const result = await request<{ recommendations: Recommendation[] }>(
    `/api/v1/users/${encodeURIComponent(userId)}/recommendations${qs}`,
    undefined,
    token,
  );
  return result.recommendations;
}

export async function listAdminRecommendations(status = 'pending_review', token?: string) {
  const result = await request<{ recommendations: AdminRecommendation[] }>(
    `/api/v1/admin/recommendations?status=${encodeURIComponent(status)}`,
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
    `/api/v1/admin/recommendations/${encodeURIComponent(params.recommendationId)}/decision`,
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
  const result = await request<{ context: AdminRecommendationContext }>(
    `/api/v1/admin/recommendations/${encodeURIComponent(recommendationId)}/context`,
    undefined,
    token,
  );
  return result.context;
}

export async function getRecommendationParticipantsContext(recommendationId: string, token?: string) {
  const result = await request<{ context: RecommendationParticipantsContextResponse }>(
    `/api/v1/recommendations/${encodeURIComponent(recommendationId)}/participants-context`,
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
  return request<{ ok: boolean }>(`/api/v1/recommendations/${encodeURIComponent(params.recommendationId)}/respond`, {
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
  return request<{ ok: boolean }>(`/api/v1/recommendations/${encodeURIComponent(params.recommendationId)}/follow-through`, {
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
  return request<{ ok: boolean; meeting: Meeting }>(
    `/api/v1/recommendations/${encodeURIComponent(params.recommendationId)}/meeting`,
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
  return request<{ ok: boolean; meeting: Meeting }>(
    `/api/v1/recommendations/${encodeURIComponent(params.recommendationId)}/meeting/status`,
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

export async function listEvents(filters?: { userId?: string; eventType?: string; recommendationId?: string; limit?: number }, token?: string) {
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
  const result = await request<{ events: AppEvent[] }>(`/api/v1/events${qs ? `?${qs}` : ''}`, undefined, token);
  return result.events;
}

export async function getUserCep(userId: string, token?: string): Promise<CepResponse> {
  return request<CepResponse>(`/api/v1/users/${encodeURIComponent(userId)}/cep`, undefined, token);
}

export async function saveUserCep(userId: string, focusText: string, token?: string): Promise<CepEntry> {
  const result = await request<{ cep: CepEntry }>(`/api/v1/users/${encodeURIComponent(userId)}/cep`, {
    method: 'PUT',
    body: JSON.stringify({ focusText }),
  }, token);
  return result.cep;
}

export async function clearUserCep(userId: string, token?: string): Promise<void> {
  await request<{ ok: boolean }>(`/api/v1/users/${encodeURIComponent(userId)}/cep`, {
    method: 'DELETE',
  }, token);
}

export async function getUserCompleteness(userId: string, token?: string): Promise<CompletenessResult> {
  const result = await request<{ completeness: CompletenessResult }>(
    `/api/v1/users/${encodeURIComponent(userId)}/completeness`,
    undefined,
    token,
  );
  return result.completeness;
}

export async function getUserMeetingReadiness(userId: string, token?: string): Promise<TrialMeetingReadinessResponse> {
  return request<TrialMeetingReadinessResponse>(
    `/api/trial/users/${encodeURIComponent(userId)}/meeting-readiness`,
    undefined,
    token,
  );
}

export async function startMeetingReadiness(params: {
  userId: string;
  provider?: string;
}, token?: string): Promise<TrialMeetingReadinessResponse> {
  return request<TrialMeetingReadinessResponse>('/api/trial/meeting-readiness/start', {
    method: 'POST',
    body: JSON.stringify({
      userId: params.userId,
      provider: params.provider ?? 'manual_link',
    }),
  }, token);
}

export async function saveMeetingReadinessResult(params: {
  userId: string;
  provider?: string;
  status: TrialMeetingReadinessStatus;
  score?: number | null;
  latencyMs?: number | null;
  jitterMs?: number | null;
  packetLossPct?: number | null;
  uploadKbps?: number | null;
  downloadKbps?: number | null;
  canUseCamera: boolean;
  canUseMic: boolean;
  deviceWarnings?: string[];
  recommendation?: string;
}, token?: string): Promise<TrialMeetingReadinessResponse> {
  return request<TrialMeetingReadinessResponse>('/api/trial/meeting-readiness/result', {
    method: 'POST',
    body: JSON.stringify({
      provider: params.provider ?? 'manual_link',
      ...params,
    }),
  }, token);
}

// ── messaging ────────────────────────────────────────────────────────────────

export async function listConversations(token?: string): Promise<ConversationListItem[]> {
  const result = await request<{ conversations: ConversationListItem[] }>(
    '/api/v1/conversations', undefined, token,
  );
  return result.conversations;
}

export async function startConversation(otherUserId: string, token?: string): Promise<Conversation> {
  const result = await request<{ conversation: Conversation }>(
    '/api/v1/conversations',
    { method: 'POST', body: JSON.stringify({ otherUserId }) },
    token,
  );
  return result.conversation;
}

export async function listMessages(
  conversationId: string,
  options?: { limit?: number; before?: string },
  token?: string,
): Promise<Message[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.before) params.set('before', options.before);
  const qs = params.toString();
  const result = await request<{ messages: Message[] }>(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/messages${qs ? `?${qs}` : ''}`,
    undefined, token,
  );
  return result.messages;
}

export async function sendMessage(
  conversationId: string, body: string, clientId?: string, token?: string,
): Promise<Message> {
  const result = await request<{ message: Message }>(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
    { method: 'POST', body: JSON.stringify({ body, id: clientId }) },
    token,
  );
  return result.message;
}

export async function markConversationRead(conversationId: string, token?: string): Promise<void> {
  await request<{ ok: boolean }>(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/read`,
    { method: 'POST', body: JSON.stringify({}) },
    token,
  );
}
