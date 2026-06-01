// Async Postgres repository for Lethe.
// Replaces mvp/repositories/sqlite/sqlite-repository.mjs for production.
// Uses postgres.js (npm:postgres) which is Deno-compatible.
// JSONB columns are returned as parsed JS objects — no JSON.parse() needed.
// BOOLEAN columns are returned as JS booleans — no Boolean() coercion needed.

import postgres from "npm:postgres";

const sql = postgres(
  Deno.env.get("DATABASE_URL") ?? Deno.env.get("SUPABASE_DB_URL")!,
  { ssl: "require" },
);

// ── types ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  displayName: string;
  handle: string | null;
  email: string | null;
  location: string | null;
  bio: string;
  matchingEnabled: boolean;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Preferences {
  id: string;
  userId: string;
  matchIntent: string[];
  offers: string[];
  asks: string[];
  preferredLocations: string[];
  userType: string;
  preferredUserTypes: string[];
  interests: string[];
  objectives: string[];
  introText: string;
  meetingFormat: string;
  localOnly: boolean;
  blockedUserIds: string[];
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  // Integer-hour mirrors of startTime/endTime, included in API responses so
  // admin/UI code that expects integers (e.g. AdminOnboardingPage's
  // formatSlot(dayOfWeek, startHour, endHour)) doesn't render NaN.
  startHour: number;
  endHour: number;
  timezone: string;
}

// "HH:MM" → integer hour (0-24). Returns NaN for unparseable input — callers
// should already have validated the input upstream.
function parseHour(time: string): number {
  const [hh] = String(time ?? '').split(':');
  return Number.parseInt(hh, 10);
}

function mapAvailabilityRow(row: Record<string, unknown>): AvailabilitySlot {
  const startTime = row.start_time as string;
  const endTime = row.end_time as string;
  return {
    dayOfWeek: row.day_of_week as number,
    startTime,
    endTime,
    startHour: parseHour(startTime),
    endHour: parseHour(endTime),
    timezone: row.timezone as string,
  };
}

export interface UserProfile {
  user: User;
  preferences: Preferences;
  availability: AvailabilitySlot[];
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

export function toPublicProfile(profile: UserProfile): PublicProfile {
  return {
    id: profile.user.id,
    name: profile.user.name,
    handle: profile.user.handle,
    location: profile.user.location,
    bio: profile.user.bio,
    introText: profile.preferences?.introText ?? "",
    interests: profile.preferences?.interests ?? [],
    objectives: profile.preferences?.objectives ?? [],
  };
}

export interface CepEntry {
  id: string;
  userId: string;
  focusText: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
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

export interface ConnectionReadiness {
  id: string;
  userId: string;
  provider: string;
  testedAt: string;
  expiresAt: string;
  status: string;
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

export interface Conversation {
  id: string;
  participantA: string;
  participantB: string;
  unlockedByRecommendationId: string | null;
  createdAt: string;
  lastMessageAt: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface ConversationListItem extends Conversation {
  peer: { id: string; name: string; handle: string | null };
  lastMessagePreview: { body: string; senderId: string; createdAt: string } | null;
  unreadCount: number;
}

export interface Recommendation {
  id: string;
  runId: string;
  userId: string;
  candidateUserId: string;
  rank: number;
  score: number;
  whyMatched: string;
  insightText: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ── row mappers ───────────────────────────────────────────────────────────────

function mapUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    displayName: row.name as string,
    handle: row.handle as string | null,
    email: row.email as string | null,
    location: row.location as string | null,
    bio: row.bio as string,
    matchingEnabled: row.matching_enabled as boolean,
    timezone: row.timezone as string,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapPreferences(row: Record<string, unknown>): Preferences {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    matchIntent: (row.match_intent as string[]) ?? [],
    offers: (row.offers as string[]) ?? [],
    asks: (row.asks as string[]) ?? [],
    preferredLocations: (row.preferred_locations as string[]) ?? [],
    userType: row.user_type as string,
    preferredUserTypes: (row.preferred_user_types as string[]) ?? [],
    interests: (row.interests as string[]) ?? [],
    objectives: (row.objectives as string[]) ?? [],
    introText: row.intro_text as string,
    meetingFormat: row.meeting_format as string,
    localOnly: row.local_only as boolean,
    blockedUserIds: (row.blocked_user_ids as string[]) ?? [],
  };
}

function mapCepEntry(row: Record<string, unknown>): CepEntry {
  const expiresAt = row.expires_at as string;
  return {
    id: row.id as string,
    userId: row.user_id as string,
    focusText: row.focus_text as string,
    createdAt: row.created_at as string,
    expiresAt,
    isActive: new Date(expiresAt) > new Date(),
  };
}

function mapMeeting(row: Record<string, unknown>): Meeting {
  return {
    id: row.id as string,
    recommendationId: row.recommendation_id as string,
    provider: row.provider as string,
    externalMeetingId: row.external_meeting_id as string | null,
    meetingUrl: row.meeting_url as string,
    scheduledAt: row.scheduled_at as string | null,
    startedAt: row.started_at as string | null,
    endedAt: row.ended_at as string | null,
    status: row.status as string,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapConnectionReadiness(row: Record<string, unknown>): ConnectionReadiness {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    provider: row.provider as string,
    testedAt: row.tested_at as string,
    expiresAt: row.expires_at as string,
    status: row.status as string,
    score: row.score as number | null,
    latencyMs: row.latency_ms as number | null,
    jitterMs: row.jitter_ms as number | null,
    packetLossPct: row.packet_loss_pct as number | null,
    uploadKbps: row.upload_kbps as number | null,
    downloadKbps: row.download_kbps as number | null,
    canUseCamera: Boolean(row.can_use_camera),
    canUseMic: Boolean(row.can_use_mic),
    deviceWarnings: (row.device_warnings as string[]) ?? [],
    recommendation: (row.recommendation as string) ?? "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapConversation(row: Record<string, unknown>): Conversation {
  return {
    id: row.id as string,
    participantA: row.participant_a as string,
    participantB: row.participant_b as string,
    unlockedByRecommendationId: (row.unlocked_by_recommendation_id as string | null) ?? null,
    createdAt: row.created_at as string,
    lastMessageAt: (row.last_message_at as string | null) ?? null,
  };
}

function mapMessage(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    conversationId: row.conversation_id as string,
    senderId: row.sender_id as string,
    body: row.body as string,
    createdAt: row.created_at as string,
  };
}

/** Canonical ordering so (a, b) and (b, a) map to the same conversation row. */
function canonicalPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}


function mapRecommendation(row: Record<string, unknown>): Recommendation {
  return {
    id: row.id as string,
    runId: row.run_id as string,
    userId: row.source_user_id as string,
    candidateUserId: row.target_user_id as string,
    rank: row.rank as number,
    score: row.score as number,
    whyMatched: row.why_matched as string,
    insightText: (row.insight_text as string | null) ?? null,
    status: row.status as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ── repository ────────────────────────────────────────────────────────────────

export class PostgresRepository {

  // ── health ─────────────────────────────────────────────────────────────────

  async pingDatabase(): Promise<void> {
    await sql`SELECT 1`;
  }

  // ── users ──────────────────────────────────────────────────────────────────

  async listUsers(): Promise<User[]> {
    const rows = await sql`
      SELECT id, name, handle, email, location, bio,
             matching_enabled, timezone, is_active, created_at, updated_at
      FROM users ORDER BY name ASC
    `;
    return rows.map(mapUser);
  }

  async getUserById(userId: string): Promise<User | null> {
    const [row] = await sql`
      SELECT id, name, handle, email, location, bio,
             matching_enabled, timezone, is_active, created_at, updated_at
      FROM users WHERE id = ${userId}
    `;
    return row ? mapUser(row) : null;
  }

  async getUserByHandle(handle: string): Promise<User | null> {
    const normalized = handle.startsWith("@") ? handle.slice(1) : handle;
    const [row] = await sql`
      SELECT id, name, handle, email, location, bio,
             matching_enabled, timezone, is_active, created_at, updated_at
      FROM users WHERE handle = ${normalized} OR handle = ${"@" + normalized}
      LIMIT 1
    `;
    return row ? mapUser(row) : null;
  }

  /**
   * Resolve a Supabase Auth UUID to the users.id (TEXT). On first sight,
   * provisions a stub users row + empty preferences row so authenticated routes
   * can immediately read/write self profile and KYC can fill it in.
   *
   * The new row uses id = authId (TEXT-stored UUID) so URL :id lookups against
   * the same authenticated user resolve trivially. Distinct from seeded users
   * (id = "user_abi", auth_id = NULL), which never go through this path.
   */
  async findOrCreateUserByAuthId(
    authId: string,
    name: string,
    email: string | null,
  ): Promise<string> {
    const [existing] = await sql`SELECT id FROM users WHERE auth_id = ${authId} LIMIT 1`;
    if (existing) return existing.id as string;

    const now = new Date().toISOString();
    const id = authId;
    const prefId = `pref_${authId}`;

    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO users (
          id, auth_id, name, email, bio,
          matching_enabled, timezone, is_active, created_at, updated_at
        ) VALUES (
          ${id}, ${authId}, ${name}, ${email}, '',
          TRUE, 'UTC', TRUE, ${now}, ${now}
        )
        ON CONFLICT (id) DO NOTHING
      `;
      await tx`
        INSERT INTO preferences (
          id, user_id, match_intent, offers, asks, preferred_locations,
          user_type, preferred_user_types, interests, objectives,
          intro_text, meeting_format, local_only, blocked_user_ids,
          created_at, updated_at
        ) VALUES (
          ${prefId}, ${id},
          ${JSON.stringify([])}::jsonb,
          ${JSON.stringify([])}::jsonb,
          ${JSON.stringify([])}::jsonb,
          ${JSON.stringify([])}::jsonb,
          '',
          ${JSON.stringify([])}::jsonb,
          ${JSON.stringify([])}::jsonb,
          ${JSON.stringify([])}::jsonb,
          '', 'video', FALSE,
          ${JSON.stringify([])}::jsonb,
          ${now}, ${now}
        )
        ON CONFLICT (user_id) DO NOTHING
      `;
    });

    const [row] = await sql`SELECT id FROM users WHERE auth_id = ${authId} LIMIT 1`;
    return (row?.id as string) ?? id;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const [userRow] = await sql`
      SELECT id, name, handle, email, location, bio,
             matching_enabled, timezone, is_active, created_at, updated_at
      FROM users WHERE id = ${userId}
    `;
    if (!userRow) return null;

    const [prefRow] = await sql`
      SELECT * FROM preferences WHERE user_id = ${userId}
    `;

    const availRows = await sql`
      SELECT day_of_week, start_time, end_time, timezone
      FROM availability_slots WHERE user_id = ${userId}
      ORDER BY day_of_week, start_time
    `;

    return {
      user: mapUser(userRow),
      preferences: prefRow ? mapPreferences(prefRow) : null!,
      availability: availRows.map(mapAvailabilityRow),
    };
  }

  async upsertUserProfile(profile: {
    user: Record<string, unknown>;
    preferences: Record<string, unknown>;
    availability: AvailabilitySlot[];
  }): Promise<UserProfile> {
    const { user, preferences, availability } = profile;

    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO users (id, name, handle, email, location, bio, matching_enabled, timezone, is_active, created_at, updated_at)
        VALUES (
          ${user.id as string}, ${user.name as string}, ${user.handle as string ?? null},
          ${user.email as string ?? null}, ${user.location as string ?? null}, ${user.bio as string ?? ''},
          ${user.matchingEnabled as boolean ?? true}, ${user.timezone as string ?? 'UTC'},
          ${user.isActive as boolean ?? true}, ${user.createdAt as string}, ${user.updatedAt as string}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = CASE WHEN EXCLUDED.name <> '' THEN EXCLUDED.name ELSE users.name END,
          handle = COALESCE(NULLIF(EXCLUDED.handle, ''), users.handle),
          email = COALESCE(EXCLUDED.email, users.email),
          location = EXCLUDED.location, bio = EXCLUDED.bio,
          matching_enabled = EXCLUDED.matching_enabled, timezone = EXCLUDED.timezone,
          is_active = EXCLUDED.is_active, updated_at = EXCLUDED.updated_at
      `;

      const prefs = preferences as Record<string, unknown>;
      await tx`
        INSERT INTO preferences (
          id, user_id, match_intent, offers, asks, preferred_locations,
          user_type, preferred_user_types, interests, objectives,
          intro_text, meeting_format, local_only, blocked_user_ids, created_at, updated_at
        ) VALUES (
          ${prefs.id as string}, ${user.id as string},
          ${JSON.stringify(prefs.matchIntent ?? [])}::jsonb,
          ${JSON.stringify(prefs.offers ?? [])}::jsonb,
          ${JSON.stringify(prefs.asks ?? [])}::jsonb,
          ${JSON.stringify(prefs.preferredLocations ?? [])}::jsonb,
          ${prefs.userType as string ?? ''},
          ${JSON.stringify(prefs.preferredUserTypes ?? [])}::jsonb,
          ${JSON.stringify(prefs.interests ?? [])}::jsonb,
          ${JSON.stringify(prefs.objectives ?? [])}::jsonb,
          ${prefs.introText as string ?? ''},
          ${prefs.meetingFormat as string ?? 'video'},
          ${prefs.localOnly as boolean ?? false},
          ${JSON.stringify(prefs.blockedUserIds ?? [])}::jsonb,
          ${prefs.createdAt as string}, ${prefs.updatedAt as string}
        )
        ON CONFLICT (user_id) DO UPDATE SET
          match_intent = EXCLUDED.match_intent, offers = EXCLUDED.offers,
          asks = EXCLUDED.asks, preferred_locations = EXCLUDED.preferred_locations,
          user_type = EXCLUDED.user_type, preferred_user_types = EXCLUDED.preferred_user_types,
          interests = EXCLUDED.interests, objectives = EXCLUDED.objectives,
          intro_text = EXCLUDED.intro_text, meeting_format = EXCLUDED.meeting_format,
          local_only = EXCLUDED.local_only, blocked_user_ids = EXCLUDED.blocked_user_ids,
          updated_at = EXCLUDED.updated_at
      `;

      await tx`DELETE FROM availability_slots WHERE user_id = ${user.id as string}`;

      for (const slot of availability) {
        await tx`
          INSERT INTO availability_slots (user_id, day_of_week, start_time, end_time, timezone, created_at)
          VALUES (${user.id as string}, ${slot.dayOfWeek}, ${slot.startTime}, ${slot.endTime}, ${slot.timezone}, ${user.updatedAt as string})
        `;
      }
    });

    return (await this.getUserProfile(user.id as string))!;
  }

  // ── matching ───────────────────────────────────────────────────────────────

  async listUsersForMatching(): Promise<UserProfile[]> {
    const rows = await sql`
      SELECT u.id, u.name, u.handle, u.email, u.location, u.bio,
             u.matching_enabled, u.timezone, u.is_active, u.created_at, u.updated_at,
             p.id AS pref_id, p.match_intent, p.offers, p.asks, p.preferred_locations,
             p.user_type, p.preferred_user_types, p.interests, p.objectives,
             p.intro_text, p.meeting_format, p.local_only, p.blocked_user_ids,
             p.created_at AS pref_created_at, p.updated_at AS pref_updated_at
      FROM users u
      JOIN preferences p ON p.user_id = u.id
      WHERE u.is_active = true AND u.matching_enabled = true
      ORDER BY u.id
    `;

    const userIds = rows.map((r) => r.id as string);
    const allAvailability = userIds.length > 0
      ? await sql`
          SELECT user_id, day_of_week, start_time, end_time, timezone
          FROM availability_slots WHERE user_id = ANY(${userIds})
          ORDER BY user_id, day_of_week, start_time
        `
      : [];

    const availByUser = new Map<string, AvailabilitySlot[]>();
    for (const row of allAvailability) {
      const uid = row.user_id as string;
      if (!availByUser.has(uid)) availByUser.set(uid, []);
      availByUser.get(uid)!.push(mapAvailabilityRow(row));
    }

    return rows.map((row) => ({
      user: mapUser(row),
      preferences: mapPreferences({ ...row, id: row.pref_id, user_id: row.id }),
      availability: availByUser.get(row.id as string) ?? [],
    }));
  }

  async listPairHistory({ sinceDays = 90 }: { sinceDays?: number } = {}): Promise<
    Array<{ userId: string; candidateUserId: string; count: number }>
  > {
    const since = new Date(Date.now() - sinceDays * 86_400_000).toISOString();
    const rows = await sql`
      SELECT source_user_id, target_user_id, COUNT(*) AS cnt
      FROM recommendations
      WHERE created_at >= ${since}
      GROUP BY source_user_id, target_user_id
    `;
    return rows.map((r) => ({
      userId: r.source_user_id as string,
      candidateUserId: r.target_user_id as string,
      count: Number(r.cnt),
    }));
  }

  // ── recommendation runs ────────────────────────────────────────────────────

  async createRecommendationRun(run: {
    id: string; runType: string; status: string; startedAt: string;
  }): Promise<void> {
    await sql`
      INSERT INTO recommendation_runs (id, run_type, status, started_at)
      VALUES (${run.id}, ${run.runType}, ${run.status}, ${run.startedAt})
    `;
  }

  async completeRecommendationRun(
    runId: string,
    { status, completedAt, summary }: { status: string; completedAt: string; summary: unknown },
  ): Promise<void> {
    await sql`
      UPDATE recommendation_runs
      SET status = ${status}, completed_at = ${completedAt},
          summary_json = ${JSON.stringify(summary)}::jsonb
      WHERE id = ${runId}
    `;
  }

  async replacePendingRecommendationsForRun(
    runId: string,
    recommendations: Array<{
      id: string; runId: string; userId: string; candidateUserId: string;
      rank: number; score: number; status: string; whyMatched: string;
    }>,
  ): Promise<void> {
    await sql`DELETE FROM recommendations WHERE run_id = ${runId}`;
    for (const rec of recommendations) {
      await sql`
        INSERT INTO recommendations (id, run_id, source_user_id, target_user_id, rank, score, why_matched, status, created_at, updated_at)
        VALUES (${rec.id}, ${rec.runId}, ${rec.userId}, ${rec.candidateUserId}, ${rec.rank}, ${rec.score}, ${rec.whyMatched}, ${rec.status}, NOW()::text, NOW()::text)
      `;
    }
  }

  // ── recommendations ────────────────────────────────────────────────────────

  async listRecommendationsForUser(
    userId: string,
    { status }: { status?: string } = {},
  ): Promise<Recommendation[]> {
    const rows = status
      ? await sql`SELECT * FROM recommendations WHERE source_user_id = ${userId} AND status = ${status} ORDER BY rank ASC`
      : await sql`SELECT * FROM recommendations WHERE source_user_id = ${userId} ORDER BY rank ASC`;
    return rows.map(mapRecommendation);
  }

  async listAdminRecommendations({ status = 'pending_review' }: { status?: string } = {}): Promise<
    Array<Recommendation & { rationale?: string; adminId?: string; decidedAt?: string }>
  > {
    const rows = await sql`
      SELECT r.*, ad.rationale, ad.admin_id, ad.decided_at
      FROM recommendations r
      LEFT JOIN admin_decisions ad ON ad.recommendation_id = r.id
      WHERE r.status = ${status}
      ORDER BY r.created_at DESC
    `;
    return rows.map((row) => ({
      ...mapRecommendation(row),
      rationale: row.rationale as string | undefined,
      adminId: row.admin_id as string | undefined,
      decidedAt: row.decided_at as string | undefined,
    }));
  }

  async getRecommendationById(id: string): Promise<Recommendation | null> {
    const [row] = await sql`SELECT * FROM recommendations WHERE id = ${id}`;
    return row ? mapRecommendation(row) : null;
  }

  async updateRecommendationStatus(id: string, status: string, updatedAt: string): Promise<void> {
    await sql`UPDATE recommendations SET status = ${status}, updated_at = ${updatedAt} WHERE id = ${id}`;
  }

  async updateRecommendationStatusIfPending(
    id: string, status: string, updatedAt: string,
  ): Promise<boolean> {
    const result = await sql`
      UPDATE recommendations SET status = ${status}, updated_at = ${updatedAt}
      WHERE id = ${id} AND status = 'pending_review'
    `;
    return result.count > 0;
  }

  async updateRecommendationInsightText(id: string, insightText: string): Promise<void> {
    await sql`UPDATE recommendations SET insight_text = ${insightText}, updated_at = ${nowIso()} WHERE id = ${id}`;
  }

  // ── admin decisions ────────────────────────────────────────────────────────

  async recordAdminDecision(decision: {
    id: string; recommendationId: string; adminId: string;
    decision: string; rationale: string; decidedAt: string;
  }): Promise<void> {
    await sql`
      INSERT INTO admin_decisions (id, recommendation_id, admin_id, decision, rationale, decided_at)
      VALUES (${decision.id}, ${decision.recommendationId}, ${decision.adminId}, ${decision.decision}, ${decision.rationale}, ${decision.decidedAt})
    `;
  }

  // ── outcomes ───────────────────────────────────────────────────────────────

  async upsertOutcome(outcome: {
    id: string; recommendationId: string; outcomeStatus: string;
    notes: string | null; updatedAt: string; requesterResponse?: string;
  }): Promise<Record<string, unknown>> {
    const [row] = await sql`
      INSERT INTO outcomes (id, recommendation_id, outcome_status, notes, updated_at)
      VALUES (${outcome.id}, ${outcome.recommendationId}, ${outcome.outcomeStatus}, ${outcome.notes ?? null}, ${outcome.updatedAt})
      ON CONFLICT (recommendation_id) DO UPDATE SET
        outcome_status = EXCLUDED.outcome_status,
        notes = EXCLUDED.notes,
        updated_at = EXCLUDED.updated_at
      RETURNING *
    `;
    return row;
  }

  // ── events ─────────────────────────────────────────────────────────────────

  async appendEvents(events: Array<{
    id: string; eventType: string; actorUserId?: string | null;
    targetUserId?: string | null; recommendationId?: string | null;
    payload: unknown; createdAt: string;
  }>): Promise<void> {
    for (const evt of events) {
      await sql`
        INSERT INTO events (id, event_type, user_id, recommendation_id, payload, created_at)
        VALUES (
          ${evt.id}, ${evt.eventType}, ${evt.targetUserId ?? null},
          ${evt.recommendationId ?? null}, ${JSON.stringify(evt.payload)}::jsonb, ${evt.createdAt}
        )
      `;
    }
  }

  async listEvents({
    limit = 200,
    userId,
    eventType,
    recommendationId,
  }: {
    limit?: number;
    userId?: string;
    eventType?: string;
    recommendationId?: string;
  } = {}): Promise<unknown[]> {
    // Build dynamic WHERE conditions
    const conditions: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (userId) { conditions.push(`user_id = $${i++}`); values.push(userId); }
    if (eventType) { conditions.push(`event_type = $${i++}`); values.push(eventType); }
    if (recommendationId) { conditions.push(`recommendation_id = $${i++}`); values.push(recommendationId); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await sql.unsafe(
      `SELECT * FROM events ${where} ORDER BY created_at DESC LIMIT $${i}`,
      [...values, Math.min(1000, Math.max(1, limit))],
    );
    return rows;
  }

  // ── reporting ──────────────────────────────────────────────────────────────

  async listRecommendationsWithDecisionAndOutcome({
    fromIso, toIso,
  }: { fromIso: string; toIso: string }): Promise<unknown[]> {
    return await sql`
      SELECT r.id, r.status, r.created_at,
             ad.decision, ad.decided_at,
             o.outcome_status
      FROM recommendations r
      LEFT JOIN admin_decisions ad ON ad.recommendation_id = r.id
      LEFT JOIN outcomes o ON o.recommendation_id = r.id
      WHERE r.created_at >= ${fromIso} AND r.created_at <= ${toIso}
    `;
  }

  async countEventsByType({ fromIso, toIso }: { fromIso: string; toIso: string }): Promise<
    Record<string, number>
  > {
    const rows = await sql`
      SELECT event_type, COUNT(*) AS cnt
      FROM events
      WHERE created_at >= ${fromIso} AND created_at <= ${toIso}
      GROUP BY event_type
    `;
    return Object.fromEntries(rows.map((r) => [r.event_type as string, Number(r.cnt)]));
  }

  // ── context ────────────────────────────────────────────────────────────────

  async getRecommendationContext(recommendationId: string): Promise<unknown> {
    const [rec] = await sql`
      SELECT r.*, ad.rationale, ad.admin_id, ad.decided_at
      FROM recommendations r
      LEFT JOIN admin_decisions ad ON ad.recommendation_id = r.id
      WHERE r.id = ${recommendationId}
    `;
    if (!rec) return null;

    const [source, target] = await Promise.all([
      this.getUserProfile(rec.source_user_id as string),
      this.getUserProfile(rec.target_user_id as string),
    ]);

    return { recommendation: mapRecommendation(rec), sourceProfile: source, targetProfile: target };
  }

  async getRecommendationParticipantsContext(recommendationId: string): Promise<unknown> {
    return this.getRecommendationContext(recommendationId);
  }

  // ── weekly_cep ─────────────────────────────────────────────────────────────

  async getCep(userId: string): Promise<CepEntry | null> {
    const [row] = await sql`
      SELECT * FROM weekly_cep WHERE user_id = ${userId} LIMIT 1
    `;
    return row ? mapCepEntry(row) : null;
  }

  async upsertCep(userId: string, focusText: string): Promise<CepEntry> {
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 86_400_000).toISOString();
    const id = `cep_${crypto.randomUUID()}`;
    const [row] = await sql`
      INSERT INTO weekly_cep (id, user_id, focus_text, created_at, expires_at)
      VALUES (${id}, ${userId}, ${focusText}, ${now}, ${expiresAt})
      ON CONFLICT (user_id) DO UPDATE SET
        focus_text = EXCLUDED.focus_text,
        created_at = EXCLUDED.created_at,
        expires_at = EXCLUDED.expires_at
      RETURNING *
    `;
    return mapCepEntry(row);
  }

  async deleteCep(userId: string): Promise<void> {
    await sql`DELETE FROM weekly_cep WHERE user_id = ${userId}`;
  }

  // ── meetings ───────────────────────────────────────────────────────────────

  async getMeetingForRecommendation(recommendationId: string): Promise<Meeting | null> {
    const [row] = await sql`
      SELECT * FROM meetings WHERE recommendation_id = ${recommendationId} LIMIT 1
    `;
    return row ? mapMeeting(row) : null;
  }

  async upsertMeeting(data: {
    recommendationId: string;
    provider?: string;
    meetingUrl?: string;
    scheduledAt?: string | null;
    status?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Meeting> {
    const now = new Date().toISOString();
    const id = `mtg_${crypto.randomUUID()}`;
    const [row] = await sql`
      INSERT INTO meetings (
        id, recommendation_id, provider, meeting_url,
        scheduled_at, status, metadata, created_at, updated_at
      ) VALUES (
        ${id}, ${data.recommendationId},
        ${data.provider ?? 'manual_link'},
        ${data.meetingUrl ?? ''},
        ${data.scheduledAt ?? null},
        ${data.status ?? 'scheduled'},
        ${JSON.stringify(data.metadata ?? {})}::jsonb,
        ${now}, ${now}
      )
      ON CONFLICT (recommendation_id) DO UPDATE SET
        meeting_url  = COALESCE(EXCLUDED.meeting_url, meetings.meeting_url),
        scheduled_at = COALESCE(EXCLUDED.scheduled_at, meetings.scheduled_at),
        status       = EXCLUDED.status,
        metadata     = EXCLUDED.metadata,
        updated_at   = EXCLUDED.updated_at
      RETURNING *
    `;
    return mapMeeting(row);
  }

  async updateMeetingStatus(recommendationId: string, status: string): Promise<Meeting | null> {
    const [row] = await sql`
      UPDATE meetings
      SET status = ${status}, updated_at = ${new Date().toISOString()}
      WHERE recommendation_id = ${recommendationId}
      RETURNING *
    `;
    return row ? mapMeeting(row) : null;
  }

  // ── connection_readiness ──────────────────────────────────────────────────

  async getConnectionReadiness(userId: string): Promise<ConnectionReadiness | null> {
    const [row] = await sql`
      SELECT * FROM connection_readiness WHERE user_id = ${userId} LIMIT 1
    `;
    return row ? mapConnectionReadiness(row) : null;
  }

  async upsertConnectionReadiness(userId: string, data: {
    provider: string;
    testedAt: string;
    expiresAt: string;
    status: string;
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
  }): Promise<ConnectionReadiness> {
    const now = new Date().toISOString();
    const id = `readiness_${crypto.randomUUID()}`;
    const [row] = await sql`
      INSERT INTO connection_readiness (
        id, user_id, provider, tested_at, expires_at, status, score,
        latency_ms, jitter_ms, packet_loss_pct, upload_kbps, download_kbps,
        can_use_camera, can_use_mic, device_warnings, recommendation, created_at, updated_at
      ) VALUES (
        ${id}, ${userId}, ${data.provider}, ${data.testedAt}, ${data.expiresAt}, ${data.status}, ${data.score ?? null},
        ${data.latencyMs ?? null}, ${data.jitterMs ?? null}, ${data.packetLossPct ?? null},
        ${data.uploadKbps ?? null}, ${data.downloadKbps ?? null},
        ${data.canUseCamera}, ${data.canUseMic}, ${JSON.stringify(data.deviceWarnings ?? [])}::jsonb,
        ${data.recommendation ?? ''}, ${now}, ${now}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        provider = EXCLUDED.provider,
        tested_at = EXCLUDED.tested_at,
        expires_at = EXCLUDED.expires_at,
        status = EXCLUDED.status,
        score = EXCLUDED.score,
        latency_ms = EXCLUDED.latency_ms,
        jitter_ms = EXCLUDED.jitter_ms,
        packet_loss_pct = EXCLUDED.packet_loss_pct,
        upload_kbps = EXCLUDED.upload_kbps,
        download_kbps = EXCLUDED.download_kbps,
        can_use_camera = EXCLUDED.can_use_camera,
        can_use_mic = EXCLUDED.can_use_mic,
        device_warnings = EXCLUDED.device_warnings,
        recommendation = EXCLUDED.recommendation,
        updated_at = EXCLUDED.updated_at
      RETURNING *
    `;
    return mapConnectionReadiness(row);
  }

  // ── messaging ──────────────────────────────────────────────────────────────

  async getConversationById(id: string): Promise<Conversation | null> {
    const [row] = await sql`SELECT * FROM conversations WHERE id = ${id}`;
    return row ? mapConversation(row) : null;
  }

  async findConversationBetween(userA: string, userB: string): Promise<Conversation | null> {
    const [lo, hi] = canonicalPair(userA, userB);
    const [row] = await sql`
      SELECT * FROM conversations WHERE participant_a = ${lo} AND participant_b = ${hi}
    `;
    return row ? mapConversation(row) : null;
  }

  /**
   * Returns the recommendation_id (either direction) that unlocks messaging
   * between two users, or null if none qualifies. A pair is unlocked when a
   * recommendation between them has been accepted OR has progressed past
   * intro_sent on the outcomes table.
   */
  async findUnlockingRecommendationId(userA: string, userB: string): Promise<string | null> {
    const [row] = await sql`
      SELECT r.id
      FROM recommendations r
      LEFT JOIN outcomes o ON o.recommendation_id = r.id
      WHERE ((r.source_user_id = ${userA} AND r.target_user_id = ${userB})
          OR (r.source_user_id = ${userB} AND r.target_user_id = ${userA}))
        AND (r.status = 'accepted'
             OR o.outcome_status IN ('intro_sent', 'meeting_scheduled', 'completed'))
      ORDER BY r.updated_at DESC
      LIMIT 1
    `;
    return (row?.id as string) ?? null;
  }

  /**
   * Idempotent: returns the existing conversation if one already exists for
   * the pair. Otherwise creates a new one stamped with the unlocking
   * recommendation. Eligibility is the caller's responsibility — pass the
   * recommendation id returned by findUnlockingRecommendationId().
   */
  async createConversation({
    userA, userB, unlockedByRecommendationId, createdAt,
  }: {
    userA: string; userB: string; unlockedByRecommendationId: string; createdAt: string;
  }): Promise<Conversation> {
    const [lo, hi] = canonicalPair(userA, userB);
    const id = `conv_${crypto.randomUUID()}`;
    const [row] = await sql`
      INSERT INTO conversations (
        id, participant_a, participant_b, unlocked_by_recommendation_id, created_at
      ) VALUES (
        ${id}, ${lo}, ${hi}, ${unlockedByRecommendationId}, ${createdAt}
      )
      ON CONFLICT (participant_a, participant_b) DO UPDATE
        SET participant_a = EXCLUDED.participant_a
      RETURNING *
    `;
    return mapConversation(row);
  }

  /**
   * Conversations the user participates in, with peer profile snippet, the
   * latest message preview, and an unread count derived from the read
   * watermark. Sorted newest-activity first.
   */
  async listConversationsForUser(userId: string): Promise<ConversationListItem[]> {
    const rows = await sql`
      WITH my_conversations AS (
        SELECT c.*, CASE WHEN c.participant_a = ${userId} THEN c.participant_b ELSE c.participant_a END AS peer_id
        FROM conversations c
        WHERE ${userId} IN (c.participant_a, c.participant_b)
      ),
      last_msg AS (
        SELECT DISTINCT ON (m.conversation_id)
               m.conversation_id, m.body, m.sender_id, m.created_at
        FROM messages m
        WHERE m.conversation_id IN (SELECT id FROM my_conversations)
        ORDER BY m.conversation_id, m.created_at DESC
      ),
      unread AS (
        SELECT m.conversation_id, COUNT(*)::int AS cnt
        FROM messages m
        JOIN my_conversations mc ON mc.id = m.conversation_id
        LEFT JOIN conversation_reads cr
               ON cr.conversation_id = m.conversation_id AND cr.user_id = ${userId}
        WHERE m.sender_id <> ${userId}
          AND (cr.last_read_at IS NULL OR m.created_at > cr.last_read_at)
        GROUP BY m.conversation_id
      )
      SELECT mc.*, u.name AS peer_name, u.handle AS peer_handle,
             lm.body AS last_body, lm.sender_id AS last_sender, lm.created_at AS last_at,
             COALESCE(ur.cnt, 0) AS unread_count
      FROM my_conversations mc
      JOIN users u ON u.id = mc.peer_id
      LEFT JOIN last_msg lm ON lm.conversation_id = mc.id
      LEFT JOIN unread ur   ON ur.conversation_id = mc.id
      ORDER BY mc.last_message_at DESC NULLS LAST, mc.created_at DESC
    `;
    return rows.map((row) => ({
      ...mapConversation(row),
      peer: {
        id: row.peer_id as string,
        name: row.peer_name as string,
        handle: row.peer_handle as string | null,
      },
      lastMessagePreview: row.last_body == null ? null : {
        body: row.last_body as string,
        senderId: row.last_sender as string,
        createdAt: row.last_at as string,
      },
      unreadCount: row.unread_count as number,
    }));
  }

  async listMessages(
    conversationId: string,
    { limit = 50, before }: { limit?: number; before?: string } = {},
  ): Promise<Message[]> {
    const cap = Math.min(200, Math.max(1, limit));
    const rows = before
      ? await sql`
          SELECT * FROM messages
          WHERE conversation_id = ${conversationId} AND created_at < ${before}
          ORDER BY created_at DESC LIMIT ${cap}
        `
      : await sql`
          SELECT * FROM messages
          WHERE conversation_id = ${conversationId}
          ORDER BY created_at DESC LIMIT ${cap}
        `;
    return rows.map(mapMessage).reverse();
  }

  /** Idempotent on message id; returns the persisted row even on conflict. */
  async sendMessage(input: {
    id: string; conversationId: string; senderId: string; body: string; createdAt: string;
  }): Promise<Message> {
    const [row] = await sql`
      INSERT INTO messages (id, conversation_id, sender_id, body, created_at)
      VALUES (${input.id}, ${input.conversationId}, ${input.senderId}, ${input.body}, ${input.createdAt})
      ON CONFLICT (id) DO UPDATE SET id = EXCLUDED.id
      RETURNING *
    `;
    return mapMessage(row);
  }

  async markConversationRead(
    conversationId: string, userId: string, at: string,
  ): Promise<void> {
    await sql`
      INSERT INTO conversation_reads (conversation_id, user_id, last_read_at)
      VALUES (${conversationId}, ${userId}, ${at})
      ON CONFLICT (conversation_id, user_id) DO UPDATE SET last_read_at = EXCLUDED.last_read_at
    `;
  }

  // ── transaction helper ─────────────────────────────────────────────────────

  async withTransaction<T>(fn: (tx: typeof sql) => Promise<T>): Promise<T> {
    return sql.begin(fn);
  }
}

export const repository = new PostgresRepository();
