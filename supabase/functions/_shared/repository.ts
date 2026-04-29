// Async Postgres repository for Lethe.
// Replaces mvp/repositories/sqlite/sqlite-trial-repository.mjs for production.
// Uses postgres.js (npm:postgres) which is Deno-compatible.
// JSONB columns are returned as parsed JS objects — no JSON.parse() needed.
// BOOLEAN columns are returned as JS booleans — no Boolean() coercion needed.

import postgres from "npm:postgres";

const sql = postgres(Deno.env.get("DATABASE_URL")!, { ssl: "require" });

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
  timezone: string;
}

export interface UserProfile {
  user: User;
  preferences: Preferences;
  availability: AvailabilitySlot[];
}

export interface Recommendation {
  id: string;
  runId: string;
  userId: string;
  candidateUserId: string;
  rank: number;
  score: number;
  whyMatched: string;
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

function mapRecommendation(row: Record<string, unknown>): Recommendation {
  return {
    id: row.id as string,
    runId: row.run_id as string,
    userId: row.source_user_id as string,
    candidateUserId: row.target_user_id as string,
    rank: row.rank as number,
    score: row.score as number,
    whyMatched: row.why_matched as string,
    status: row.status as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ── repository ────────────────────────────────────────────────────────────────

export class PostgresRepository {

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
      availability: availRows.map((r) => ({
        dayOfWeek: r.day_of_week as number,
        startTime: r.start_time as string,
        endTime: r.end_time as string,
        timezone: r.timezone as string,
      })),
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
          name = EXCLUDED.name, handle = EXCLUDED.handle, email = EXCLUDED.email,
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
      availByUser.get(uid)!.push({
        dayOfWeek: row.day_of_week as number,
        startTime: row.start_time as string,
        endTime: row.end_time as string,
        timezone: row.timezone as string,
      });
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

  // ── transaction helper ─────────────────────────────────────────────────────

  async withTransaction<T>(fn: (tx: typeof sql) => Promise<T>): Promise<T> {
    return sql.begin(fn);
  }
}

export const repository = new PostgresRepository();
