import { randomUUID } from 'node:crypto';
import { UserRepository } from '../interfaces.mjs';
import { OUTCOME_STATUSES, hourToTime, nowIso, parseHour } from '../../domain/models.mjs';

function parseJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function pairKey(sourceUserId, targetUserId) {
  return `${sourceUserId}::${targetUserId}`;
}

function mapOutcomeToLegacy(outcomeStatus) {
  if (outcomeStatus === OUTCOME_STATUSES.INTRO_SENT) {
    return 'intro_sent';
  }
  if (outcomeStatus === OUTCOME_STATUSES.MEETING_SCHEDULED) {
    return 'scheduled';
  }
  if (outcomeStatus === OUTCOME_STATUSES.COMPLETED) {
    return 'completed';
  }
  return 'unknown';
}

function mapLegacyToOutcome({ outcomeStatus, followThroughStatus, requesterResponse }) {
  if (outcomeStatus) {
    return outcomeStatus;
  }

  if (followThroughStatus === 'intro_sent') {
    return OUTCOME_STATUSES.INTRO_SENT;
  }
  if (followThroughStatus === 'scheduled') {
    return OUTCOME_STATUSES.MEETING_SCHEDULED;
  }
  if (followThroughStatus === 'completed') {
    return OUTCOME_STATUSES.COMPLETED;
  }
  if (followThroughStatus === 'dropped') {
    return OUTCOME_STATUSES.NO_FOLLOW_THROUGH;
  }
  if (requesterResponse === 'pass') {
    return OUTCOME_STATUSES.NO_FOLLOW_THROUGH;
  }

  return OUTCOME_STATUSES.NO_FOLLOW_THROUGH;
}

function mapMeeting(row) {
  if (!row?.meeting_id) {
    return null;
  }

  return {
    id: row.meeting_id,
    recommendationId: row.meeting_recommendation_id,
    provider: row.meeting_provider,
    externalMeetingId: row.meeting_external_meeting_id ?? null,
    meetingUrl: row.meeting_url,
    scheduledAt: row.meeting_scheduled_at ?? null,
    startedAt: row.meeting_started_at ?? null,
    endedAt: row.meeting_ended_at ?? null,
    status: row.meeting_status,
    metadata: parseJson(row.meeting_metadata, {}),
    createdAt: row.meeting_created_at,
    updatedAt: row.meeting_updated_at,
  };
}

function mapConnectionReadiness(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    provider: row.provider,
    testedAt: row.tested_at,
    expiresAt: row.expires_at,
    status: row.status,
    score: row.score ?? null,
    latencyMs: row.latency_ms ?? null,
    jitterMs: row.jitter_ms ?? null,
    packetLossPct: row.packet_loss_pct ?? null,
    uploadKbps: row.upload_kbps ?? null,
    downloadKbps: row.download_kbps ?? null,
    canUseCamera: Boolean(row.can_use_camera),
    canUseMic: Boolean(row.can_use_mic),
    deviceWarnings: parseJson(row.device_warnings, []),
    recommendation: row.recommendation ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * SQLite adapter for the MVP repository.
 * Storage-specific details stay here; services consume repository methods only.
 */
export class SqliteTrialRepository extends UserRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  withTransaction(fn) {
    this.db.exec('BEGIN');
    try {
      const result = fn();
      this.db.exec('COMMIT');
      return result;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  listUsers() {
    return this.db
      .prepare(
        `
        SELECT id, name, handle, email, location, bio, matching_enabled, timezone, is_active, dob, created_at, updated_at
        FROM users
        ORDER BY name ASC
      `,
      )
      .all()
      .map((row) => ({
        id: row.id,
        name: row.name,
        displayName: row.name,
        handle: row.handle,
        email: row.email,
        location: row.location,
        bio: row.bio,
        matchingEnabled: Boolean(row.matching_enabled),
        timezone: row.timezone,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
  }

  getUserById(userId) {
    const row = this.db
      .prepare(
        `
        SELECT id, name, handle, email, location, bio, matching_enabled, timezone, is_active, dob, created_at, updated_at
        FROM users
        WHERE id = :userId
      `,
      )
      .get({ userId });

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      displayName: row.name,
      handle: row.handle,
      email: row.email,
      location: row.location,
      bio: row.bio,
      matchingEnabled: Boolean(row.matching_enabled),
      timezone: row.timezone,
      isActive: Boolean(row.is_active),
      dob: row.dob ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  getUserByHandle(handle) {
    const normalized = handle.startsWith('@') ? handle.slice(1) : handle;
    const row = this.db
      .prepare(
        `SELECT id, name, handle, email, location, bio, matching_enabled, timezone, is_active, dob, created_at, updated_at
         FROM users WHERE handle = ? OR handle = ? LIMIT 1`,
      )
      .get(normalized, '@' + normalized);
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      displayName: row.name,
      handle: row.handle,
      email: row.email,
      location: row.location,
      bio: row.bio,
      matchingEnabled: Boolean(row.matching_enabled),
      timezone: row.timezone,
      isActive: Boolean(row.is_active),
      dob: row.dob ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  upsertUser(user) {
    const now = nowIso();

    this.db
      .prepare(
        `
        INSERT INTO users (
          id, name, handle, email, location, bio, matching_enabled, timezone, is_active, dob, created_at, updated_at
        )
        VALUES (
          :id, :name, :handle, :email, :location, :bio, :matchingEnabled, :timezone, :isActive, :dob, :createdAt, :updatedAt
        )
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          handle = excluded.handle,
          email = excluded.email,
          location = excluded.location,
          bio = excluded.bio,
          matching_enabled = excluded.matching_enabled,
          timezone = excluded.timezone,
          is_active = excluded.is_active,
          dob = excluded.dob,
          updated_at = excluded.updated_at
      `,
      )
      .run({
        id: user.id,
        name: user.name,
        handle: user.handle || null,
        email: user.email || null,
        location: user.location || null,
        bio: user.bio || '',
        matchingEnabled: user.matchingEnabled ? 1 : 0,
        timezone: user.timezone || 'UTC',
        isActive: user.isActive ? 1 : 0,
        dob: user.dob ?? null,
        createdAt: now,
        updatedAt: now,
      });

    return this.getUserById(user.id);
  }

  getPreferencesByUserId(userId) {
    const row = this.db
      .prepare(
        `
        SELECT id, user_id, match_intent, offers, asks, preferred_locations, user_type, preferred_user_types, interests, objectives,
               intro_text, meeting_format, local_only, blocked_user_ids, languages, meeting_frequency, learn_about, ask_about,
               who_to_meet, notification_prefs, created_at, updated_at
        FROM preferences
        WHERE user_id = :userId
      `,
      )
      .get({ userId });

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      userId: row.user_id,
      matchIntent: parseJson(row.match_intent, []),
      offers: parseJson(row.offers, []),
      asks: parseJson(row.asks, []),
      preferredLocations: parseJson(row.preferred_locations, []),
      userType: row.user_type ?? '',
      preferredUserTypes: parseJson(row.preferred_user_types, []),
      interests: parseJson(row.interests, []),
      objectives: parseJson(row.objectives, []),
      introText: row.intro_text ?? '',
      meetingFormat: row.meeting_format ?? 'video',
      localOnly: Boolean(row.local_only ?? 0),
      blockedUserIds: parseJson(row.blocked_user_ids, []),
      languages: parseJson(row.languages, []),
      meetingFrequency: row.meeting_frequency ?? 'every_week',
      learnAbout: row.learn_about ?? '',
      askAbout: row.ask_about ?? '',
      whoToMeet: Number.isInteger(row.who_to_meet) ? row.who_to_meet : 0,
      notificationPrefs: parseJson(row.notification_prefs, {}),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  upsertPreferences(preferences) {
    const now = nowIso();
    const id = preferences.id || `pref_${preferences.userId}`;

    this.db
      .prepare(
        `
        INSERT INTO preferences (
          id,
          user_id,
          match_intent,
          offers,
          asks,
          preferred_locations,
          user_type,
          preferred_user_types,
          interests,
          objectives,
          intro_text,
          meeting_format,
          local_only,
          blocked_user_ids,
          languages,
          meeting_frequency,
          learn_about,
          ask_about,
          who_to_meet,
          notification_prefs,
          created_at,
          updated_at
        )
        VALUES (
          :id,
          :userId,
          :matchIntent,
          :offers,
          :asks,
          :preferredLocations,
          :userType,
          :preferredUserTypes,
          :interests,
          :objectives,
          :introText,
          :meetingFormat,
          :localOnly,
          :blockedUserIds,
          :languages,
          :meetingFrequency,
          :learnAbout,
          :askAbout,
          :whoToMeet,
          :notificationPrefs,
          :createdAt,
          :updatedAt
        )
        ON CONFLICT(user_id) DO UPDATE SET
          match_intent = excluded.match_intent,
          offers = excluded.offers,
          asks = excluded.asks,
          preferred_locations = excluded.preferred_locations,
          user_type = excluded.user_type,
          preferred_user_types = excluded.preferred_user_types,
          interests = excluded.interests,
          objectives = excluded.objectives,
          intro_text = excluded.intro_text,
          meeting_format = excluded.meeting_format,
          local_only = excluded.local_only,
          blocked_user_ids = excluded.blocked_user_ids,
          languages = excluded.languages,
          meeting_frequency = excluded.meeting_frequency,
          learn_about = excluded.learn_about,
          ask_about = excluded.ask_about,
          who_to_meet = excluded.who_to_meet,
          notification_prefs = excluded.notification_prefs,
          updated_at = excluded.updated_at
      `,
      )
      .run({
        id,
        userId: preferences.userId,
        matchIntent: JSON.stringify(preferences.matchIntent ?? []),
        offers: JSON.stringify(preferences.offers ?? []),
        asks: JSON.stringify(preferences.asks ?? []),
        preferredLocations: JSON.stringify(preferences.preferredLocations ?? []),
        userType: preferences.userType ?? '',
        preferredUserTypes: JSON.stringify(preferences.preferredUserTypes ?? []),
        interests: JSON.stringify(preferences.interests ?? []),
        objectives: JSON.stringify(preferences.objectives ?? []),
        introText: preferences.introText ?? '',
        meetingFormat: preferences.meetingFormat ?? 'video',
        localOnly: preferences.localOnly ? 1 : 0,
        blockedUserIds: JSON.stringify(preferences.blockedUserIds ?? []),
        languages: JSON.stringify(preferences.languages ?? []),
        meetingFrequency: preferences.meetingFrequency ?? 'every_week',
        learnAbout: preferences.learnAbout ?? '',
        askAbout: preferences.askAbout ?? '',
        whoToMeet: Number.isInteger(preferences.whoToMeet) ? preferences.whoToMeet : 0,
        notificationPrefs: JSON.stringify(preferences.notificationPrefs ?? {}),
        createdAt: now,
        updatedAt: now,
      });

    return this.getPreferencesByUserId(preferences.userId);
  }

  listAvailabilityByUserId(userId) {
    return this.db
      .prepare(
        `
        SELECT id, user_id, day_of_week, start_time, end_time, timezone, created_at
        FROM availability_slots
        WHERE user_id = :userId
        ORDER BY day_of_week ASC, start_time ASC
      `,
      )
      .all({ userId })
      .map((row) => {
        const startHour = parseHour(row.start_time);
        const endHour = parseHour(row.end_time);

        return {
          id: row.id,
          userId: row.user_id,
          dayOfWeek: row.day_of_week,
          startTime: row.start_time,
          endTime: row.end_time,
          startHour,
          endHour,
          timezone: row.timezone,
          createdAt: row.created_at,
        };
      });
  }

  replaceAvailabilitySlots(userId, slots) {
    const now = nowIso();
    this.db.prepare('DELETE FROM availability_slots WHERE user_id = :userId').run({ userId });

    const insertSlot = this.db.prepare(
      `
      INSERT INTO availability_slots (
        user_id, day_of_week, start_time, end_time, timezone, created_at
      )
      VALUES (
        :userId, :dayOfWeek, :startTime, :endTime, :timezone, :createdAt
      )
    `,
    );

    for (const slot of slots) {
      const startTime = slot.startTime ?? hourToTime(slot.startHour);
      const endTime = slot.endTime ?? hourToTime(slot.endHour);
      insertSlot.run({
        userId,
        dayOfWeek: slot.dayOfWeek,
        startTime,
        endTime,
        timezone: slot.timezone ?? 'UTC',
        createdAt: now,
      });
    }

    return this.listAvailabilityByUserId(userId);
  }

  getUserProfile(userId) {
    const user = this.getUserById(userId);
    if (!user) {
      return null;
    }

    const preferences = this.getPreferencesByUserId(userId) ?? {
      userId,
      matchIntent: [],
      offers: [],
      asks: [],
      preferredLocations: [],
      preferredUserTypes: [],
      interests: [],
      objectives: [],
      introText: user.bio ?? '',
      meetingFormat: 'video',
      localOnly: false,
      blockedUserIds: [],
      languages: [],
      meetingFrequency: 'every_week',
      learnAbout: '',
      askAbout: '',
      whoToMeet: 0,
      notificationPrefs: {},
    };

    const availability = this.listAvailabilityByUserId(userId);

    return {
      user: {
        id: user.id,
        name: user.name,
        displayName: user.name,
        handle: user.handle,
        email: user.email,
        timezone: user.timezone,
        location: user.location,
        bio: user.bio,
        matchingEnabled: user.matchingEnabled,
        isActive: user.isActive,
        dob: user.dob ?? null,
      },
      preferences: {
        matchIntent: preferences.matchIntent,
        offers: preferences.offers,
        asks: preferences.asks,
        preferredLocations: preferences.preferredLocations,
        preferredUserTypes: preferences.preferredUserTypes,
        interests: preferences.interests,
        objectives: preferences.objectives,
        introText: preferences.introText,
        meetingFormat: preferences.meetingFormat,
        localOnly: preferences.localOnly,
        blockedUserIds: preferences.blockedUserIds,
        languages: preferences.languages ?? [],
        meetingFrequency: preferences.meetingFrequency ?? 'every_week',
        learnAbout: preferences.learnAbout ?? '',
        askAbout: preferences.askAbout ?? '',
        whoToMeet: preferences.whoToMeet ?? 0,
        notificationPrefs: preferences.notificationPrefs ?? {},
      },
      availability,
      updatedAt: user.updatedAt,
    };
  }

  upsertUserProfile(profile) {
    const { user, preferences, availability } = profile;

    if (!user.id || !user.name) {
      throw new Error('User profile requires id and name.');
    }

    return this.withTransaction(() => {
      this.upsertUser({
        ...user,
        bio: user.bio || preferences.introText || '',
        matchingEnabled: user.matchingEnabled,
      });

      this.upsertPreferences({
        userId: user.id,
        matchIntent: preferences.matchIntent,
        offers: preferences.offers,
        asks: preferences.asks,
        preferredLocations: preferences.preferredLocations,
        userType: preferences.userType,
        preferredUserTypes: preferences.preferredUserTypes,
        interests: preferences.interests,
        objectives: preferences.objectives,
        introText: preferences.introText || user.bio || '',
        meetingFormat: preferences.meetingFormat,
        localOnly: preferences.localOnly,
        blockedUserIds: preferences.blockedUserIds,
        languages: preferences.languages,
        meetingFrequency: preferences.meetingFrequency,
        learnAbout: preferences.learnAbout,
        askAbout: preferences.askAbout,
        whoToMeet: preferences.whoToMeet,
        notificationPrefs: preferences.notificationPrefs,
      });

      this.replaceAvailabilitySlots(user.id, availability);
      return this.getUserProfile(user.id);
    });
  }

  listUsersForMatching() {
    return this.listUsers()
      .filter((user) => user.isActive && user.matchingEnabled)
      .map((user) => this.getUserProfile(user.id))
      .filter((profile) => profile !== null);
  }

  createRecommendationRun({ id, runType, status, startedAt }) {
    this.db
      .prepare(
        `
        INSERT INTO recommendation_runs (
          id, run_type, started_at, completed_at, status, summary_json
        )
        VALUES (
          :id, :runType, :startedAt, NULL, :status, NULL
        )
      `,
      )
      .run({ id, runType, status, startedAt });
  }

  completeRecommendationRun(runId, { status, summary, completedAt = nowIso() }) {
    this.db
      .prepare(
        `
        UPDATE recommendation_runs
        SET status = :status,
            completed_at = :completedAt,
            summary_json = :summary
        WHERE id = :runId
      `,
      )
      .run({
        runId,
        status,
        completedAt,
        summary: JSON.stringify(summary ?? {}),
      });
  }

  replacePendingRecommendationsForRun(runId, recommendations) {
    const now = nowIso();

    return this.withTransaction(() => {
      this.db.prepare('DELETE FROM recommendations WHERE run_id = :runId').run({ runId });

      const insertRecommendation = this.db.prepare(
        `
        INSERT INTO recommendations (
          id,
          run_id,
          source_user_id,
          target_user_id,
          rank,
          score,
          why_matched,
          insight_text,
          status,
          created_at,
          updated_at
        )
        VALUES (
          :id,
          :runId,
          :sourceUserId,
          :targetUserId,
          :rank,
          :score,
          :whyMatched,
          :insightText,
          :status,
          :createdAt,
          :updatedAt
        )
      `,
      );

      for (const recommendation of recommendations) {
        insertRecommendation.run({
          id: recommendation.id,
          runId,
          sourceUserId: recommendation.userId,
          targetUserId: recommendation.candidateUserId,
          rank: recommendation.rank,
          score: recommendation.score,
          status: recommendation.status,
          whyMatched: JSON.stringify(recommendation.whyMatched ?? []),
          insightText: recommendation.insightText ?? '',
          createdAt: now,
          updatedAt: now,
        });
      }
    });
  }

  listRecommendationsForUser(userId, { status } = {}) {
    const baseSql = `
      SELECT
        r.id,
        r.run_id,
        r.source_user_id,
        r.target_user_id,
        r.rank,
        r.score,
        r.status,
        r.why_matched,
        r.insight_text,
        r.created_at,
        r.updated_at,
        u.name AS target_name,
        u.handle AS target_handle,
        u.location AS target_location,
        u.timezone AS target_timezone,
        u.bio AS target_bio,
        o.outcome_status,
        o.notes AS outcome_notes,
        ad.decision AS admin_decision,
        m.id AS meeting_id,
        m.recommendation_id AS meeting_recommendation_id,
        m.provider AS meeting_provider,
        m.external_meeting_id AS meeting_external_meeting_id,
        m.meeting_url AS meeting_url,
        m.scheduled_at AS meeting_scheduled_at,
        m.started_at AS meeting_started_at,
        m.ended_at AS meeting_ended_at,
        m.status AS meeting_status,
        m.metadata AS meeting_metadata,
        m.created_at AS meeting_created_at,
        m.updated_at AS meeting_updated_at
      FROM recommendations r
      JOIN users u ON u.id = r.target_user_id
      LEFT JOIN outcomes o ON o.recommendation_id = r.id
      LEFT JOIN admin_decisions ad ON ad.recommendation_id = r.id
      LEFT JOIN meetings m ON m.recommendation_id = r.id
      WHERE r.source_user_id = :userId
    `;

    const sql = status
      ? `${baseSql} AND r.status = :status ORDER BY r.created_at DESC, r.rank ASC`
      : `${baseSql} ORDER BY r.created_at DESC, r.rank ASC`;

    const rows = status
      ? this.db.prepare(sql).all({ userId, status })
      : this.db.prepare(sql).all({ userId });

    return rows.map((row) => ({
      id: row.id,
      runId: row.run_id,
      userId: row.source_user_id,
      candidateUserId: row.target_user_id,
      rank: row.rank,
      score: row.score,
      status: row.status,
      whyMatched: parseJson(row.why_matched, []),
      insightText: row.insight_text || null,
      candidate: {
        id: row.target_user_id,
        displayName: row.target_name,
        handle: row.target_handle,
        location: row.target_location,
        timezone: row.target_timezone,
        introText: row.target_bio ?? '',
      },
      outcome: {
        requesterResponse: row.status === 'accepted' ? 'accept' : row.status === 'passed' ? 'pass' : null,
        followThroughStatus: mapOutcomeToLegacy(row.outcome_status),
        outcomeStatus: row.outcome_status ?? null,
        notes: row.outcome_notes ?? null,
      },
      meeting: mapMeeting(row),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  listAdminRecommendations({ status = 'pending_review' } = {}) {
    const rows = this.db
      .prepare(
        `
        SELECT
          r.id,
          r.run_id,
          r.source_user_id,
          r.target_user_id,
          r.rank,
          r.score,
          r.status,
          r.why_matched,
          r.insight_text,
          r.created_at,
          source.name AS source_name,
          source.handle AS source_handle,
          source.location AS source_location,
          source.timezone AS source_timezone,
          target.name AS target_name,
          target.handle AS target_handle,
          target.location AS target_location,
          target.timezone AS target_timezone,
          ad.decision AS admin_decision,
          ad.rationale AS admin_rationale,
          ad.decided_at AS admin_decided_at,
          ad.admin_id AS admin_id
        FROM recommendations r
        JOIN users source ON source.id = r.source_user_id
        JOIN users target ON target.id = r.target_user_id
        LEFT JOIN admin_decisions ad ON ad.recommendation_id = r.id
        WHERE r.status = :status
        ORDER BY r.created_at DESC, r.score DESC
      `,
      )
      .all({ status });

    return rows.map((row) => ({
      id: row.id,
      runId: row.run_id,
      userId: row.source_user_id,
      candidateUserId: row.target_user_id,
      rank: row.rank,
      score: row.score,
      status: row.status,
      whyMatched: parseJson(row.why_matched, []),
      insightText: row.insight_text || null,
      source: {
        id: row.source_user_id,
        displayName: row.source_name,
        handle: row.source_handle,
        location: row.source_location,
        timezone: row.source_timezone,
      },
      candidate: {
        id: row.target_user_id,
        displayName: row.target_name,
        handle: row.target_handle,
        location: row.target_location,
        timezone: row.target_timezone,
      },
      adminDecision: row.admin_decision
        ? {
            decision: row.admin_decision,
            rationale: row.admin_rationale,
            decidedAt: row.admin_decided_at,
            adminId: row.admin_id,
          }
        : null,
      createdAt: row.created_at,
    }));
  }

  getRecommendationById(recommendationId) {
    const row = this.db
      .prepare(
        `
        SELECT
          r.id,
          r.run_id,
          r.source_user_id,
          r.target_user_id,
          r.rank,
          r.score,
          r.status,
          r.why_matched,
          r.insight_text,
          r.created_at,
          r.updated_at,
          source.name AS source_name,
          source.handle AS source_handle,
          target.name AS target_name,
          target.handle AS target_handle
        FROM recommendations r
        JOIN users source ON source.id = r.source_user_id
        JOIN users target ON target.id = r.target_user_id
        WHERE r.id = :recommendationId
      `,
      )
      .get({ recommendationId });

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      runId: row.run_id,
      userId: row.source_user_id,
      candidateUserId: row.target_user_id,
      rank: row.rank,
      score: row.score,
      status: row.status,
      whyMatched: parseJson(row.why_matched, []),
      insightText: row.insight_text || null,
      source: {
        id: row.source_user_id,
        displayName: row.source_name,
        handle: row.source_handle,
      },
      candidate: {
        id: row.target_user_id,
        displayName: row.target_name,
        handle: row.target_handle,
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  getAdminDecisionByRecommendationId(recommendationId) {
    const row = this.db
      .prepare(
        `
        SELECT recommendation_id, decision, rationale, admin_id, decided_at
        FROM admin_decisions
        WHERE recommendation_id = :recommendationId
        ORDER BY decided_at DESC
        LIMIT 1
      `,
      )
      .get({ recommendationId });

    if (!row) {
      return null;
    }

    return {
      recommendationId: row.recommendation_id,
      decision: row.decision,
      rationale: row.rationale ?? null,
      adminId: row.admin_id ?? null,
      decidedAt: row.decided_at ?? null,
    };
  }

  listPairContextNotes({ sourceUserId, targetUserId, excludeRecommendationId = null, limit = 5 } = {}) {
    const rows = this.db
      .prepare(
        `
        SELECT
          r.id AS recommendation_id,
          r.created_at,
          r.status,
          ad.rationale AS admin_rationale,
          ad.decided_at AS admin_decided_at,
          o.outcome_status,
          o.notes AS outcome_notes,
          o.updated_at AS outcome_updated_at
        FROM recommendations r
        LEFT JOIN admin_decisions ad ON ad.recommendation_id = r.id
        LEFT JOIN outcomes o ON o.recommendation_id = r.id
        WHERE (
          (r.source_user_id = :sourceUserId AND r.target_user_id = :targetUserId)
          OR
          (r.source_user_id = :targetUserId AND r.target_user_id = :sourceUserId)
        )
          AND (:excludeRecommendationId IS NULL OR r.id != :excludeRecommendationId)
          AND (
            ad.rationale IS NOT NULL
            OR o.notes IS NOT NULL
            OR o.outcome_status IS NOT NULL
          )
        ORDER BY r.created_at DESC
        LIMIT :limit
      `,
      )
      .all({
        sourceUserId,
        targetUserId,
        excludeRecommendationId: excludeRecommendationId ?? null,
        limit,
      });

    return rows.map((row) => ({
      recommendationId: row.recommendation_id,
      createdAt: row.created_at,
      recommendationStatus: row.status,
      adminRationale: row.admin_rationale ?? null,
      adminDecidedAt: row.admin_decided_at ?? null,
      outcomeStatus: row.outcome_status ?? null,
      outcomeNotes: row.outcome_notes ?? null,
      outcomeUpdatedAt: row.outcome_updated_at ?? null,
    }));
  }

  recordAdminDecision({ id, recommendationId, adminId, decision, rationale, decidedAt = nowIso() }) {
    this.db
      .prepare(
        `
        INSERT INTO admin_decisions (
          id, recommendation_id, decision, rationale, admin_id, decided_at
        )
        VALUES (
          :id, :recommendationId, :decision, :rationale, :adminId, :decidedAt
        )
      `,
      )
      .run({
        id,
        recommendationId,
        decision,
        rationale,
        adminId: adminId ?? null,
        decidedAt,
      });
  }

  updateRecommendationInsightText(recommendationId, insightText, updatedAt = nowIso()) {
    this.db
      .prepare(
        `UPDATE recommendations
         SET insight_text = :insightText, updated_at = :updatedAt
         WHERE id = :recommendationId`,
      )
      .run({ recommendationId, insightText, updatedAt });
  }

  listRecommendationsWithEmptyInsight() {
    return this.db
      .prepare(
        `SELECT id, source_user_id, target_user_id
         FROM recommendations
         WHERE insight_text = '' OR insight_text IS NULL`,
      )
      .all();
  }

  updateRecommendationStatus(recommendationId, status, updatedAt = nowIso()) {
    this.db
      .prepare(
        `
        UPDATE recommendations
        SET status = :status,
            updated_at = :updatedAt
        WHERE id = :recommendationId
      `,
      )
      .run({ recommendationId, status, updatedAt });
  }

  updateRecommendationStatusIfPending(recommendationId, status, updatedAt = nowIso()) {
    const result = this.db
      .prepare(
        `
        UPDATE recommendations
        SET status = :status,
            updated_at = :updatedAt
        WHERE id = :recommendationId
          AND status = 'pending_review'
      `,
      )
      .run({ recommendationId, status, updatedAt });

    return (result?.changes ?? 0) > 0;
  }

  listPairHistory({ sinceDays = 90 } = {}) {
    const sinceDate = new Date();
    sinceDate.setUTCDate(sinceDate.getUTCDate() - sinceDays);

    const rows = this.db
      .prepare(
        `
        SELECT source_user_id, target_user_id, status, created_at
        FROM recommendations
        WHERE created_at >= :sinceDate
      `,
      )
      .all({ sinceDate: sinceDate.toISOString() });

    const historyByPair = new Map();
    for (const row of rows) {
      const key = pairKey(row.source_user_id, row.target_user_id);
      const existing = historyByPair.get(key) ?? [];
      existing.push({ status: row.status, createdAt: row.created_at });
      historyByPair.set(key, existing);
    }

    return historyByPair;
  }

  listRecommendationsWithDecisionAndOutcome({ fromIso = null, toIso = null } = {}) {
    const rows = this.db
      .prepare(
        `
        SELECT
          r.id,
          r.created_at,
          r.status,
          r.source_user_id,
          r.target_user_id,
          ad.decision,
          ad.decided_at,
          o.outcome_status
        FROM recommendations r
        LEFT JOIN admin_decisions ad ON ad.recommendation_id = r.id
        LEFT JOIN outcomes o ON o.recommendation_id = r.id
        WHERE (:fromIso IS NULL OR r.created_at >= :fromIso)
          AND (:toIso IS NULL OR r.created_at < :toIso)
        ORDER BY r.created_at ASC
      `,
      )
      .all({
        fromIso: fromIso ?? null,
        toIso: toIso ?? null,
      });

    return rows.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      status: row.status,
      sourceUserId: row.source_user_id,
      targetUserId: row.target_user_id,
      decision: row.decision ?? null,
      decidedAt: row.decided_at ?? null,
      outcomeStatus: row.outcome_status ?? null,
    }));
  }

  appendEvents(events) {
    if (!events.length) {
      return;
    }

    const insertEvent = this.db.prepare(
      `
      INSERT INTO events (
        id,
        event_type,
        user_id,
        recommendation_id,
        payload,
        created_at
      )
      VALUES (
        :id,
        :eventType,
        :userId,
        :recommendationId,
        :payload,
        :createdAt
      )
    `,
    );

    for (const event of events) {
      insertEvent.run({
        id: event.id ?? `evt_${randomUUID()}`,
        eventType: event.eventType,
        userId: event.userId ?? event.targetUserId ?? event.actorUserId ?? null,
        recommendationId: event.recommendationId ?? null,
        payload: JSON.stringify({
          ...event.payload,
          runId: event.runId ?? null,
          actorUserId: event.actorUserId ?? null,
          targetUserId: event.targetUserId ?? null,
        }),
        createdAt: event.createdAt ?? nowIso(),
      });
    }
  }

  listEvents({ limit = 200, userId, eventType, recommendationId } = {}) {
    const params = {
      limit,
      userId: userId ?? null,
      eventType: eventType ?? null,
      recommendationId: recommendationId ?? null,
    };

    const rows = this.db
      .prepare(
        `
        SELECT id, event_type, user_id, recommendation_id, payload, created_at
        FROM events
        WHERE (:userId IS NULL OR user_id = :userId)
          AND (:eventType IS NULL OR event_type = :eventType)
          AND (:recommendationId IS NULL OR recommendation_id = :recommendationId)
        ORDER BY created_at DESC
        LIMIT :limit
      `,
      )
      .all(params);

    return rows.map((row) => {
      const payload = parseJson(row.payload, {});

      return {
        id: row.id,
        eventType: row.event_type,
        userId: row.user_id,
        actorUserId: payload.actorUserId ?? null,
        targetUserId: payload.targetUserId ?? null,
        recommendationId: row.recommendation_id,
        runId: payload.runId ?? null,
        payload,
        createdAt: row.created_at,
      };
    });
  }

  countEventsByType({ fromIso = null, toIso = null } = {}) {
    const rows = this.db
      .prepare(
        `
        SELECT event_type, COUNT(*) AS total
        FROM events
        WHERE (:fromIso IS NULL OR created_at >= :fromIso)
          AND (:toIso IS NULL OR created_at < :toIso)
        GROUP BY event_type
      `,
      )
      .all({
        fromIso: fromIso ?? null,
        toIso: toIso ?? null,
      });

    const counts = {};
    for (const row of rows) {
      counts[row.event_type] = Number(row.total);
    }
    return counts;
  }

  getOutcomeByRecommendation(recommendationId) {
    const row = this.db
      .prepare(
        `
        SELECT id, recommendation_id, outcome_status, notes, updated_at
        FROM outcomes
        WHERE recommendation_id = :recommendationId
      `,
      )
      .get({ recommendationId });

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      recommendationId: row.recommendation_id,
      outcomeStatus: row.outcome_status,
      followThroughStatus: mapOutcomeToLegacy(row.outcome_status),
      notes: row.notes,
      updatedAt: row.updated_at,
    };
  }

  upsertOutcome({ id, recommendationId, outcomeStatus, followThroughStatus, requesterResponse, notes, updatedAt = nowIso() }) {
    const normalizedOutcomeStatus = mapLegacyToOutcome({
      outcomeStatus,
      followThroughStatus,
      requesterResponse,
    });

    this.db
      .prepare(
        `
        INSERT INTO outcomes (
          id,
          recommendation_id,
          outcome_status,
          notes,
          updated_at
        )
        VALUES (
          :id,
          :recommendationId,
          :outcomeStatus,
          :notes,
          :updatedAt
        )
        ON CONFLICT(recommendation_id) DO UPDATE SET
          outcome_status = excluded.outcome_status,
          notes = COALESCE(excluded.notes, outcomes.notes),
          updated_at = excluded.updated_at
      `,
      )
      .run({
        id: id ?? `outcome_${randomUUID()}`,
        recommendationId,
        outcomeStatus: normalizedOutcomeStatus,
        notes: notes ?? null,
        updatedAt,
      });

    return this.getOutcomeByRecommendation(recommendationId);
  }

  getMeetingByRecommendationId(recommendationId) {
    const row = this.db
      .prepare(
        `
        SELECT
          id AS meeting_id,
          recommendation_id AS meeting_recommendation_id,
          provider AS meeting_provider,
          external_meeting_id AS meeting_external_meeting_id,
          meeting_url AS meeting_url,
          scheduled_at AS meeting_scheduled_at,
          started_at AS meeting_started_at,
          ended_at AS meeting_ended_at,
          status AS meeting_status,
          metadata AS meeting_metadata,
          created_at AS meeting_created_at,
          updated_at AS meeting_updated_at
        FROM meetings
        WHERE recommendation_id = :recommendationId
      `,
      )
      .get({ recommendationId });

    return mapMeeting(row);
  }

  upsertMeeting({
    id,
    recommendationId,
    provider,
    externalMeetingId = null,
    meetingUrl,
    scheduledAt = null,
    startedAt = null,
    endedAt = null,
    status,
    metadata = {},
    updatedAt = nowIso(),
  }) {
    const existing = this.getMeetingByRecommendationId(recommendationId);
    const meetingId = existing?.id ?? id ?? `meeting_${randomUUID()}`;
    const createdAt = existing?.createdAt ?? updatedAt;

    this.db
      .prepare(
        `
        INSERT INTO meetings (
          id,
          recommendation_id,
          provider,
          external_meeting_id,
          meeting_url,
          scheduled_at,
          started_at,
          ended_at,
          status,
          metadata,
          created_at,
          updated_at
        )
        VALUES (
          :id,
          :recommendationId,
          :provider,
          :externalMeetingId,
          :meetingUrl,
          :scheduledAt,
          :startedAt,
          :endedAt,
          :status,
          :metadata,
          :createdAt,
          :updatedAt
        )
        ON CONFLICT(recommendation_id) DO UPDATE SET
          provider = excluded.provider,
          external_meeting_id = excluded.external_meeting_id,
          meeting_url = excluded.meeting_url,
          scheduled_at = excluded.scheduled_at,
          started_at = excluded.started_at,
          ended_at = excluded.ended_at,
          status = excluded.status,
          metadata = excluded.metadata,
          updated_at = excluded.updated_at
      `,
      )
      .run({
        id: meetingId,
        recommendationId,
        provider,
        externalMeetingId,
        meetingUrl,
        scheduledAt,
        startedAt,
        endedAt,
        status,
        metadata: JSON.stringify(metadata ?? {}),
        createdAt,
        updatedAt,
      });

    return this.getMeetingByRecommendationId(recommendationId);
  }

  updateMeetingStatus(recommendationId, { status, startedAt = null, endedAt = null, updatedAt = nowIso() }) {
    const result = this.db
      .prepare(
        `
        UPDATE meetings
        SET status = :status,
            started_at = COALESCE(:startedAt, started_at),
            ended_at = COALESCE(:endedAt, ended_at),
            updated_at = :updatedAt
        WHERE recommendation_id = :recommendationId
      `,
      )
      .run({
        recommendationId,
        status,
        startedAt,
        endedAt,
        updatedAt,
      });

    if ((result?.changes ?? 0) === 0) {
      return null;
    }

    return this.getMeetingByRecommendationId(recommendationId);
  }

  getConnectionReadinessByUserId(userId) {
    const row = this.db
      .prepare(
        `
        SELECT *
        FROM connection_readiness
        WHERE user_id = :userId
      `,
      )
      .get({ userId });

    return mapConnectionReadiness(row);
  }

  upsertConnectionReadiness(userId, readiness) {
    const existing = this.getConnectionReadinessByUserId(userId);
    const now = readiness.updatedAt ?? nowIso();
    const id = existing?.id ?? readiness.id ?? `readiness_${randomUUID()}`;
    const createdAt = existing?.createdAt ?? readiness.createdAt ?? now;

    this.db
      .prepare(
        `
        INSERT INTO connection_readiness (
          id,
          user_id,
          provider,
          tested_at,
          expires_at,
          status,
          score,
          latency_ms,
          jitter_ms,
          packet_loss_pct,
          upload_kbps,
          download_kbps,
          can_use_camera,
          can_use_mic,
          device_warnings,
          recommendation,
          created_at,
          updated_at
        )
        VALUES (
          :id,
          :userId,
          :provider,
          :testedAt,
          :expiresAt,
          :status,
          :score,
          :latencyMs,
          :jitterMs,
          :packetLossPct,
          :uploadKbps,
          :downloadKbps,
          :canUseCamera,
          :canUseMic,
          :deviceWarnings,
          :recommendation,
          :createdAt,
          :updatedAt
        )
        ON CONFLICT(user_id) DO UPDATE SET
          provider = excluded.provider,
          tested_at = excluded.tested_at,
          expires_at = excluded.expires_at,
          status = excluded.status,
          score = excluded.score,
          latency_ms = excluded.latency_ms,
          jitter_ms = excluded.jitter_ms,
          packet_loss_pct = excluded.packet_loss_pct,
          upload_kbps = excluded.upload_kbps,
          download_kbps = excluded.download_kbps,
          can_use_camera = excluded.can_use_camera,
          can_use_mic = excluded.can_use_mic,
          device_warnings = excluded.device_warnings,
          recommendation = excluded.recommendation,
          updated_at = excluded.updated_at
      `,
      )
      .run({
        id,
        userId,
        provider: readiness.provider,
        testedAt: readiness.testedAt,
        expiresAt: readiness.expiresAt,
        status: readiness.status,
        score: readiness.score,
        latencyMs: readiness.latencyMs,
        jitterMs: readiness.jitterMs,
        packetLossPct: readiness.packetLossPct,
        uploadKbps: readiness.uploadKbps,
        downloadKbps: readiness.downloadKbps,
        canUseCamera: readiness.canUseCamera ? 1 : 0,
        canUseMic: readiness.canUseMic ? 1 : 0,
        deviceWarnings: JSON.stringify(readiness.deviceWarnings ?? []),
        recommendation: readiness.recommendation ?? '',
        createdAt,
        updatedAt: now,
      });

    return this.getConnectionReadinessByUserId(userId);
  }

  upsertCep(userId, { id, focusText, createdAt, expiresAt }) {
    this.db
      .prepare(
        `
        INSERT INTO weekly_cep (id, user_id, focus_text, created_at, expires_at)
        VALUES (:id, :userId, :focusText, :createdAt, :expiresAt)
        ON CONFLICT(user_id) DO UPDATE SET
          id = excluded.id,
          focus_text = excluded.focus_text,
          created_at = excluded.created_at,
          expires_at = excluded.expires_at
        `,
      )
      .run({ id, userId, focusText, createdAt, expiresAt });

    return this.getCepByUserId(userId);
  }

  getCepByUserId(userId) {
    const row = this.db.prepare('SELECT * FROM weekly_cep WHERE user_id = :userId').get({ userId });
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      focusText: row.focus_text,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    };
  }

  listActiveCeps(now = new Date().toISOString()) {
    const rows = this.db
      .prepare('SELECT * FROM weekly_cep WHERE expires_at > :now ORDER BY user_id')
      .all({ now });
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      focusText: row.focus_text,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    }));
  }

  deleteCepByUserId(userId) {
    const result = this.db
      .prepare('DELETE FROM weekly_cep WHERE user_id = :userId')
      .run({ userId });
    return (result?.changes ?? 0) > 0;
  }
}
