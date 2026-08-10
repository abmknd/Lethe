// Relethe API — Supabase Edge Function
// Single backend for the Relethe app (Onboarding, Settings, Connect, Matches,
// Admin review, CEP, meeting readiness, messaging). Domain modules (models,
// events, completeness) are imported via relative paths from the project root.
// Run `supabase functions serve` from the project root.

import { corsPreflightResponse, json } from "../_shared/cors.ts";
import { repository, toPublicProfile } from "../_shared/repository.ts";
import { AuthError, requireAuth, requireAdmin, requireSelf } from "../_shared/auth.ts";
import { sendIntroEmails, firstOverlapSlot, nextOccurrenceUtc } from "../_shared/email.ts";
import { createDailyRoom } from "../_shared/daily.ts";

import {
  normalizeProfilePayload,
  normalizeConnectionReadiness,
  readinessExpiresAt,
  isReadinessActive,
  RECOMMENDATION_STATUSES,
  OUTCOME_STATUSES,
  READINESS_STATUSES,
  MEETING_STATUSES,
  MATCH_STATUSES,
  MATCH_SIDE_RESPONSES,
  nowIso,
} from "../../../mvp/domain/models.mjs";
import { EVENT_TYPES } from "../../../mvp/domain/events.mjs";
import { detectInputQuality } from "../../../mvp/context/input-quality.mjs";
import { createDeterministicMatcher } from "../../../mvp/matching/deterministic-matcher.mjs";
import {
  IN_FLIGHT_STATES,
  coreFieldsChanged,
  decideRecReeval,
} from "../../../mvp/services/stale-premise-service.mjs";

// Shared, stateless matcher instance for stale-premise re-scoring (Phase 2, item 6).
const stalePremiseMatcher = createDeterministicMatcher();
import { checkProfileCompleteness } from "../../../mvp/domain/completeness.mjs";
import { TRUST_SIGNAL_TYPES } from "../../../mvp/domain/trust.mjs";
import { normalizeHitlConfig, computeWeightedAcceptance, DEFAULT_HITL_CONFIG } from "../../../mvp/domain/hitl-policy.mjs";
import { buildBlindRationale, isIdentityVisible } from "../../../mvp/context/blind-rationale.mjs";

// why_matched is stored as a JSON string in Postgres; the blind rationale
// generator expects an array.
function parseWhyMatched(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// Stable pair ordering so (A, B) and (B, A) resolve to the same match row.
// Mirrors orderPair in mvp/services/match-lifecycle-service.mjs (not imported
// here to keep edge bundles free of node:crypto).
function orderPair(userIdOne: string, userIdTwo: string): { userAId: string; userBId: string } {
  return userIdOne < userIdTwo
    ? { userAId: userIdOne, userBId: userIdTwo }
    : { userAId: userIdTwo, userBId: userIdOne };
}

async function ensureBlindOffer(
  recommendation: { id: string; userId: string; candidateUserId: string },
  actorUserId: string | null,
) {
  const existing = await repository.getMatchByRecommendationId(recommendation.id);
  if (existing) return existing;

  const reverse = await repository.getLatestReverseRecommendation({
    userId: recommendation.userId,
    candidateUserId: recommendation.candidateUserId,
  });
  const pair = orderPair(recommendation.userId, recommendation.candidateUserId);
  const match = await repository.createMatch({
    id: `match_${crypto.randomUUID()}`,
    recommendationId: recommendation.id,
    reverseRecommendationId: reverse?.id ?? null,
    userAId: pair.userAId,
    userBId: pair.userBId,
    state: MATCH_STATUSES.OFFERED_BLIND,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
  await repository.appendEvents([{
    id: `evt_${crypto.randomUUID()}`,
    eventType: EVENT_TYPES.BLIND_OFFER_CREATED,
    actorUserId,
    targetUserId: recommendation.userId,
    recommendationId: recommendation.id,
    payload: { matchId: match.id, userAId: pair.userAId, userBId: pair.userBId },
    createdAt: nowIso(),
  }]);
  return match;
}

const MEETING_OUTCOME_MAP: Record<string, string> = {
  scheduled: OUTCOME_STATUSES.MEETING_SCHEDULED,
  ready: OUTCOME_STATUSES.MEETING_SCHEDULED,
  in_progress: OUTCOME_STATUSES.MEETING_SCHEDULED,
  completed: OUTCOME_STATUSES.COMPLETED,
  cancelled: OUTCOME_STATUSES.NO_FOLLOW_THROUGH,
  failed: OUTCOME_STATUSES.NO_FOLLOW_THROUGH,
};

// Bound wrapper: `const { randomUUID } = crypto` loses its `this` and throws
// "Illegal invocation" when called in Deno. Keep the call sites unchanged.
const randomUUID = () => crypto.randomUUID();

function readinessRecommendation(readiness: { status: string; recommendation?: string }): string {
  if (readiness.recommendation) return readiness.recommendation;
  if (readiness.status === READINESS_STATUSES.EXCELLENT || readiness.status === READINESS_STATUSES.GOOD) {
    return "Ready for video.";
  }
  if (readiness.status === READINESS_STATUSES.MEDIUM) return "Audio-first recommended.";
  if (readiness.status === READINESS_STATUSES.LOW) return "Test again before joining; audio-first recommended.";
  if (readiness.status === READINESS_STATUSES.FAILED) return "Resolve device or network issues before joining.";
  return "Untested recently.";
}

function getPath(url: URL): string {
  return url.pathname.replace(/\/+$/, "") || "/";
}

function statusCodeFromError(error: unknown): number {
  if (error && typeof error === "object" && "statusCode" in error) {
    return (error as { statusCode: number }).statusCode;
  }
  return 400;
}

async function readJsonBody(req: Request): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON body.");
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return corsPreflightResponse();

  const url = new URL(req.url);
  const path = getPath(url);

  try {
    // ── health (open) ────────────────────────────────────────────────────────

    if (req.method === "GET" && path === "/api/v1/health") {
      return json({ ok: true });
    }

    if (req.method === "GET" && path === "/api/v1/health/db") {
      await repository.pingDatabase();
      return json({ ok: true });
    }

    // ── auth gate (everything below requires a valid Supabase JWT) ──────────

    const auth = await requireAuth(req);

    // ── users ─────────────────────────────────────────────────────────────────

    if (req.method === "GET" && path === "/api/v1/users") {
      return json({ users: await repository.listUsers() });
    }

    const userPublicProfileMatch = path.match(/^\/api\/v1\/users\/([^/]+)\/profile\/public$/);
    if (userPublicProfileMatch && req.method === "GET") {
      const idOrHandle = decodeURIComponent(userPublicProfileMatch[1]);
      let profile = await repository.getUserProfile(idOrHandle);
      if (!profile) {
        const byHandle = await repository.getUserByHandle(idOrHandle);
        if (byHandle) profile = await repository.getUserProfile(byHandle.id);
      }
      if (!profile) return json({ error: "User not found." }, 404);
      return json({ profile: toPublicProfile(profile) });
    }

    const userProfileMatch = path.match(/^\/api\/v1\/users\/([^/]+)\/profile$/);
    if (userProfileMatch) {
      const userId = decodeURIComponent(userProfileMatch[1]);
      requireSelf(auth, userId);

      if (req.method === "GET") {
        const profile = await repository.getUserProfile(userId);
        if (!profile) return json({ error: "User not found." }, 404);
        return json({ profile });
      }

      if (req.method === "PUT") {
        const body = await readJsonBody(req);
        const normalized = normalizeProfilePayload({
          user: { id: userId, ...((body.user as Record<string, unknown>) ?? {}) },
          preferences: body.preferences ?? {},
          availability: body.availability ?? [],
        });

        // Snapshot pre-edit preferences for stale-premise re-evaluation below.
        const previousProfile = await repository.getUserProfile(userId).catch(() => null);
        const previousPreferences = previousProfile?.preferences ?? null;

        const profile = await repository.upsertUserProfile(normalized);

        // Stale-premise re-evaluation (Phase 2, item 6): a core-field edit can
        // invalidate the premise of an in-flight match. Re-score with the shared
        // matcher, refresh the stored rationale, and route confidence drops back
        // to HITL. Best-effort — never blocks the save.
        try {
          if (coreFieldsChanged(previousPreferences, normalized.preferences)) {
            const currentProfile = await repository.getUserProfile(userId);
            const inFlight = await repository.listMatchesForUser(userId, { states: IN_FLIGHT_STATES });
            for (const match of inFlight) {
              const otherId = match.userAId === userId ? match.userBId : match.userAId;
              const otherProfile = await repository.getUserProfile(otherId);
              if (!currentProfile || !otherProfile) continue;
              const results = stalePremiseMatcher.matchUsers([currentProfile, otherProfile], new Map(), new Map());
              for (const recId of [match.recommendationId, match.reverseRecommendationId]) {
                if (!recId) continue;
                const rec = await repository.getRecommendationById(recId);
                if (!rec) continue;
                const fresh = (results.get(rec.userId) ?? []).find(
                  (r: { candidateUserId: string }) => r.candidateUserId === rec.candidateUserId,
                ) ?? null;
                const decision = decideRecReeval(rec, fresh);
                await repository.updateRecommendationRationale(recId, {
                  whyMatched: decision.whyMatched,
                  score: decision.newScore,
                });
                if (decision.dropped) {
                  await repository.updateRecommendationStatus(recId, RECOMMENDATION_STATUSES.PENDING_REVIEW, nowIso());
                  await repository.appendTrustSignal({
                    id: `trust_${randomUUID()}`,
                    userId,
                    signalType: TRUST_SIGNAL_TYPES.HITL_FLAG,
                    weight: 0,
                    matchId: match.id,
                    sourceEventId: null,
                    payload: { reason: "stale_premise", oldBand: decision.oldBand, newBand: decision.newBand },
                    createdAt: nowIso(),
                  });
                }
                await repository.appendEvents([
                  {
                    id: `evt_${randomUUID()}`,
                    eventType: EVENT_TYPES.STALE_PREMISE_REEVALUATED,
                    actorUserId: userId,
                    targetUserId: null,
                    recommendationId: recId,
                    payload: { matchId: match.id, oldBand: decision.oldBand, newBand: decision.newBand, dropped: decision.dropped },
                    createdAt: nowIso(),
                  },
                ]);
              }
            }
          }
        } catch {
          // Re-evaluation is advisory; the profile save already succeeded.
        }

        // Input-quality pass at intake (Phase 2, item 5). Detections are written
        // silently to the trust ledger — never shown to the counterpart, never a
        // hard block. Best-effort: a detection failure must not fail the save.
        let inputQuality: ReturnType<typeof detectInputQuality> = { flags: [], routeToCommunityFirst: false };
        try {
          inputQuality = detectInputQuality({
            asks: normalized.preferences?.asks,
            offers: normalized.preferences?.offers,
            introText: normalized.preferences?.introText,
            name: normalized.user?.name,
          });
          for (const flag of inputQuality.flags) {
            await repository.appendTrustSignal({
              id: `trust_${randomUUID()}`,
              userId,
              signalType: TRUST_SIGNAL_TYPES.INTAKE_REGISTER,
              weight: flag.weight,
              matchId: null,
              sourceEventId: null,
              payload: { category: flag.category, evidence: flag.evidence },
              createdAt: nowIso(),
            });
          }
        } catch {
          // Intake detection is advisory; the profile save already succeeded.
        }

        return json({ profile, inputQuality });
      }
    }

    const userContextMatch = path.match(/^\/api\/v1\/users\/([^/]+)\/context$/);
    if (userContextMatch && req.method === "GET") {
      const userId = decodeURIComponent(userContextMatch[1]);
      requireSelf(auth, userId);
      const profile = await repository.getUserProfile(userId);
      if (!profile) return json({ error: "User not found." }, 404);
      return json({ context: profile });
    }

    const matchBadgeMatch = path.match(/^\/api\/v1\/users\/([^/]+)\/match-badge$/);
    if (matchBadgeMatch) {
      const userId = decodeURIComponent(matchBadgeMatch[1]);
      requireSelf(auth, userId);
      if (req.method === "GET") {
        const badge = await repository.getNewMatchBadge(userId);
        return json(badge);
      }
      if (req.method === "POST") {
        const at = await repository.markMatchesSeen(userId);
        return json({ ok: true, lastSeenAt: at });
      }
    }

    const userRecsMatch = path.match(/^\/api\/v1\/users\/([^/]+)\/recommendations$/);
    if (userRecsMatch && req.method === "GET") {
      const userId = decodeURIComponent(userRecsMatch[1]);
      requireSelf(auth, userId);
      const status = url.searchParams.get("status") ?? undefined;
      const recommendations = await repository.listRecommendationsForUser(userId, { status });
      // Blind gate (alignment plan, Phase 1). This endpoint is the single
      // enforcement point: while a match is blind, the payload carries only
      // the abstracted rationale — no name, handle, location, intro text,
      // insight text, raw whyMatched, or numeric score. Identity is attached
      // only once the pair has mutually accepted and the match is revealed.
      const viewerProfile = await repository.getUserProfile(userId);
      const enriched = await Promise.all(recommendations.map(async (rec) => {
        const match = await repository.getMatchByRecommendationId(rec.id);
        const matchState = match?.state ?? null;
        const viewerResponse = match
          ? (userId === match.userAId ? match.aResponse
            : userId === match.userBId ? match.bResponse : null)
          : null;

        const candidateProfile = await repository.getUserProfile(rec.candidateUserId);
        const whyMatched = parseWhyMatched(rec.whyMatched);
        const blindRationale = candidateProfile
          ? buildBlindRationale({
              recommendation: { score: rec.score, whyMatched },
              viewerProfile,
              candidateProfile,
            })
          : null;

        const base = {
          id: rec.id,
          runId: rec.runId,
          userId: rec.userId,
          candidateUserId: rec.candidateUserId,
          status: rec.status,
          matchState,
          viewerResponse,
          blindRationale,
        };

        // Identity is visible once the match is revealed OR the recommendation
        // is already a resolved acceptance. The status fallback covers legacy
        // one-sided accepts (pre-Phase-0 rows with no match) and keeps the
        // matches page working for the already-live cohort.
        const identityVisible = isIdentityVisible(matchState) || rec.status === RECOMMENDATION_STATUSES.ACCEPTED;

        // Not revealed and not resolved → blind. Fail closed. No scheduling
        // info either: a blind match has no meeting to surface.
        if (!identityVisible) {
          return {
            ...base,
            identityVisible: false,
            candidate: null,
            insightText: null,
            whyMatched: [],
            score: null,
            meeting: null,
          };
        }

        // Identity may be shown. Include the meeting so the reveal screen can
        // render the scheduling handoff (clients can no longer read the
        // meetings table directly — it is deny-all under RLS).
        const candidate = candidateProfile
          ? {
              id: candidateProfile.user.id,
              displayName: candidateProfile.user.displayName ?? candidateProfile.user.name,
              handle: candidateProfile.user.handle,
              location: candidateProfile.user.location,
              timezone: candidateProfile.user.timezone,
              introText: candidateProfile.preferences?.introText ?? candidateProfile.user.bio ?? "",
            }
          : null;
        const meeting = await repository.getMeetingForRecommendation(rec.id);
        return {
          ...base,
          identityVisible: true,
          candidate,
          insightText: rec.insightText ?? null,
          whyMatched,
          score: rec.score,
          meeting,
        };
      }));
      return json({ recommendations: enriched });
    }

    const userCompletenessMatch = path.match(/^\/api\/v1\/users\/([^/]+)\/completeness$/);
    if (userCompletenessMatch && req.method === "GET") {
      const userId = decodeURIComponent(userCompletenessMatch[1]);
      requireSelf(auth, userId);
      const profile = await repository.getUserProfile(userId);
      if (!profile) return json({ error: "User not found." }, 404);
      const result = checkProfileCompleteness(profile);
      return json({ completeness: { userId, ...result } });
    }

    const userReadinessMatch = path.match(/^\/api\/trial\/users\/([^/]+)\/meeting-readiness$/);
    if (userReadinessMatch && req.method === "GET") {
      const userId = decodeURIComponent(userReadinessMatch[1]);
      requireSelf(auth, userId);
      const readiness = await repository.getConnectionReadiness(userId);
      const active = readiness ? isReadinessActive(readiness) : false;
      return json({
        readiness,
        isActive: active,
        displayStatus: active ? readiness?.status : READINESS_STATUSES.UNKNOWN,
      });
    }

    if (req.method === "POST" && path === "/api/trial/meeting-readiness/start") {
      const body = await readJsonBody(req);
      const userId = String(body.userId ?? "");
      requireSelf(auth, userId);
      const now = nowIso();
      const readiness = await repository.upsertConnectionReadiness(userId, {
        provider: String(body.provider ?? "manual_link"),
        testedAt: now,
        expiresAt: readinessExpiresAt(now, "join"),
        status: READINESS_STATUSES.UNKNOWN,
        canUseCamera: false,
        canUseMic: false,
        deviceWarnings: [],
        recommendation: "Readiness check started.",
      });
      await repository.appendEvents([{
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.MEETING_READINESS_STARTED ?? "meeting_readiness_started",
        actorUserId: userId,
        targetUserId: userId,
        payload: { provider: readiness.provider },
        createdAt: now,
      }]);
      return json({ readiness, isActive: isReadinessActive(readiness), displayStatus: readiness.status });
    }

    if (req.method === "POST" && path === "/api/trial/meeting-readiness/result") {
      const body = await readJsonBody(req);
      const userId = String(body.userId ?? "");
      requireSelf(auth, userId);
      const normalized = normalizeConnectionReadiness({
        ...body,
        expiresAt: body.expiresAt ?? readinessExpiresAt((body.testedAt as string | undefined) ?? nowIso(), "scheduling"),
      });
      const readiness = await repository.upsertConnectionReadiness(userId, {
        ...normalized,
        expiresAt: normalized.expiresAt as string,
        recommendation: readinessRecommendation(normalized),
      });
      await repository.appendEvents([{
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.MEETING_READINESS_RECORDED ?? "meeting_readiness_recorded",
        actorUserId: userId,
        targetUserId: userId,
        payload: {
          provider: readiness.provider,
          status: readiness.status,
          score: readiness.score,
          recommendation: readiness.recommendation,
        },
        createdAt: nowIso(),
      }]);
      return json({ readiness, isActive: isReadinessActive(readiness), displayStatus: readiness.status });
    }

    // ── admin (gated by ADMIN_EMAILS allowlist) ───────────────────────────────

    if (req.method === "GET" && path === "/api/v1/admin/recommendations") {
      await requireAdmin(req);
      const status = url.searchParams.get("status") ?? "pending_review";
      const recommendations = await repository.listAdminRecommendations({ status });
      return json({ recommendations });
    }

    const adminDecisionMatch = path.match(/^\/api\/v1\/admin\/recommendations\/([^/]+)\/decision$/);
    if (adminDecisionMatch && req.method === "POST") {
      await requireAdmin(req);
      const recommendationId = decodeURIComponent(adminDecisionMatch[1]);
      const body = await readJsonBody(req);

      const normalizedDecision = String(body.decision ?? "").toLowerCase();
      const statusMap: Record<string, string> = {
        approve: RECOMMENDATION_STATUSES.APPROVED,
        reject: RECOMMENDATION_STATUSES.REJECTED,
        approved: RECOMMENDATION_STATUSES.APPROVED,
        rejected: RECOMMENDATION_STATUSES.REJECTED,
      };
      if (!statusMap[normalizedDecision]) {
        return json({ error: "Decision must be approve or reject." }, 400);
      }

      const rationale = String(body.rationale ?? "").trim();
      if (rationale.length < 10) {
        return json({ error: "Rationale is required and must be at least 10 characters." }, 400);
      }

      const recommendation = await repository.getRecommendationById(recommendationId);
      if (!recommendation) return json({ error: "Recommendation not found." }, 404);
      if (recommendation.status !== RECOMMENDATION_STATUSES.PENDING_REVIEW) {
        return json({ error: "Recommendation is no longer pending review." }, 409);
      }

      const newStatus = statusMap[normalizedDecision];
      const decidedAt = nowIso();
      const updated = await repository.updateRecommendationStatusIfPending(recommendationId, newStatus, decidedAt);
      if (!updated) return json({ error: "Recommendation is no longer pending review." }, 409);
      // #76.1 — also transition the reverse-direction recommendation (A→B + B→A)
      // so the same pair never re-appears in the admin queue.
      await repository.cascadeStatusToReversePair(
        { userId: recommendation.userId, candidateUserId: recommendation.candidateUserId },
        newStatus,
        decidedAt,
      );

      const adminId = String(body.adminId ?? "admin_system");
      await repository.recordAdminDecision({
        id: `decision_${randomUUID()}`,
        recommendationId,
        adminId,
        decision: newStatus,
        rationale,
        decidedAt: nowIso(),
      });

      const eventType = normalizedDecision.startsWith("approve")
        ? EVENT_TYPES.ADMIN_APPROVED
        : EVENT_TYPES.ADMIN_REJECTED;

      await repository.appendEvents([{
        id: `evt_${randomUUID()}`,
        eventType,
        actorUserId: adminId,
        targetUserId: recommendation.userId,
        recommendationId,
        payload: { decision: normalizedDecision, rationale, candidateUserId: recommendation.candidateUserId },
        createdAt: nowIso(),
      }]);

      if (newStatus === RECOMMENDATION_STATUSES.APPROVED) {
        // Approval opens a blind offer (alignment plan, Phase 0). The intro
        // email and meeting moved to mutual accept — nothing identifying
        // leaves the server while the pair is blind.
        await ensureBlindOffer(recommendation, adminId);
      }

      return json({ ok: true, recommendationId, status: newStatus, decision: normalizedDecision, rationale });
    }

    const adminContextMatch = path.match(/^\/api\/v1\/admin\/recommendations\/([^/]+)\/context$/);
    if (adminContextMatch && req.method === "GET") {
      await requireAdmin(req);
      const recommendationId = decodeURIComponent(adminContextMatch[1]);
      const context = await repository.getRecommendationContext(recommendationId);
      if (!context) return json({ error: "Recommendation not found." }, 404);
      return json({ context });
    }

    // ── HITL dial (admin) ───────────────────────────────────────────────────────
    // GET returns the current dial + the verified-tenure-weighted acceptance
    // metric an admin watches before raising it. PUT sets it (ships parked at 0).
    if (path === "/api/v1/admin/hitl-config") {
      const auth = await requireAdmin(req);
      const stored = await repository.getHitlConfig();
      const config = normalizeHitlConfig(stored ?? DEFAULT_HITL_CONFIG);

      if (req.method === "GET") {
        const resolved = await repository.listResolvedMatchStats();
        const { weightedAcceptance, sampleCount } = computeWeightedAcceptance(resolved);
        return json({ config, stats: { resolvedCount: resolved.length, sampleCount, weightedAcceptance } });
      }

      if (req.method === "PUT") {
        const body = await readJsonBody(req);
        const next = normalizeHitlConfig({
          autoApproveRate: body.autoApproveRate ?? config.autoApproveRate,
          minSampleFloor: body.minSampleFloor ?? config.minSampleFloor,
          whiteGloveFirstMatch: body.whiteGloveFirstMatch ?? config.whiteGloveFirstMatch,
        });
        const adminId = auth?.userId ?? "admin_system";
        await repository.setHitlConfig({ ...next, updatedBy: adminId, updatedAt: nowIso() });
        await repository.appendEvents([{
          id: `evt_${randomUUID()}`,
          eventType: EVENT_TYPES.HITL_CONFIG_CHANGED,
          actorUserId: adminId,
          targetUserId: null,
          recommendationId: null,
          payload: { from: config, to: next },
          createdAt: nowIso(),
        }]);
        return json({ ok: true, config: next });
      }
    }

    // ── recommendations ───────────────────────────────────────────────────────

    const insightMatch = path.match(/^\/api\/v1\/recommendations\/([^/]+)\/insight$/);
    if (insightMatch && req.method === "POST") {
      const recommendationId = decodeURIComponent(insightMatch[1]);
      const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
      if (!anthropicKey) return json({ error: "ANTHROPIC_API_KEY not configured." }, 422);

      const rec = await repository.getRecommendationById(recommendationId);
      if (!rec) return json({ error: "Recommendation not found." }, 404);

      const sourceProfile = await repository.getUserProfile(rec.userId);
      const candidateProfile = await repository.getUserProfile(rec.candidateUserId);
      if (!sourceProfile || !candidateProfile) return json({ error: "Profile not found." }, 404);

      const src = sourceProfile.user;
      const srcP = sourceProfile.preferences ?? {};
      const cnd = candidateProfile.user;
      const cndP = candidateProfile.preferences ?? {};

      const profileContext = [
        `Person A: ${src.displayName ?? src.name}`,
        src.location ? `  Location: ${src.location}` : null,
        srcP.userType ? `  Role: ${srcP.userType}` : null,
        srcP.asks?.length ? `  Looking for: ${(srcP.asks as string[]).slice(0, 3).join(", ")}` : null,
        srcP.offers?.length ? `  Can offer: ${(srcP.offers as string[]).slice(0, 3).join(", ")}` : null,
        srcP.introText ? `  Bio: ${(srcP.introText as string).slice(0, 150)}` : null,
        "",
        `Person B: ${cnd.displayName ?? cnd.name}`,
        cnd.location ? `  Location: ${cnd.location}` : null,
        cndP.userType ? `  Role: ${cndP.userType}` : null,
        cndP.asks?.length ? `  Looking for: ${(cndP.asks as string[]).slice(0, 3).join(", ")}` : null,
        cndP.offers?.length ? `  Can offer: ${(cndP.offers as string[]).slice(0, 3).join(", ")}` : null,
        cndP.introText ? `  Bio: ${(cndP.introText as string).slice(0, 150)}` : null,
      ].filter(Boolean).join("\n");

      const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 200,
          system:
            "You write concise, specific introductions explaining why two professionals should meet. " +
            "Write exactly 2–3 sentences. Be concrete — name the actual asks, offers, or shared context. " +
            "No fluff, no generic praise. Do not start with \"I\" or mention Lethe.",
          messages: [{ role: "user", content: `Write a 2–3 sentence explanation of why these two people should meet:\n\n${profileContext}` }],
        }),
      });

      if (!anthropicRes.ok) return json({ error: "Insight generation failed." }, 502);
      const anthropicBody = await anthropicRes.json() as { content: Array<{ type: string; text: string }> };
      const insightText = anthropicBody.content[0]?.type === "text" ? anthropicBody.content[0].text.trim() : "";
      if (!insightText) return json({ error: "Empty insight returned." }, 502);

      await repository.updateRecommendationInsightText(recommendationId, insightText);
      return json({ ok: true, insightText });
    }

    const participantsContextMatch = path.match(/^\/api\/v1\/recommendations\/([^/]+)\/participants-context$/);
    if (participantsContextMatch && req.method === "GET") {
      const recommendationId = decodeURIComponent(participantsContextMatch[1]);
      const context = await repository.getRecommendationParticipantsContext(recommendationId);
      if (!context) return json({ error: "Recommendation not found." }, 404);
      return json({ context });
    }

    const respondMatch = path.match(/^\/api\/v1\/recommendations\/([^/]+)\/respond$/);
    if (respondMatch && req.method === "POST") {
      const recommendationId = decodeURIComponent(respondMatch[1]);
      const body = await readJsonBody(req);

      const decision = String(body.decision ?? "").toLowerCase();
      if (!["accept", "pass"].includes(decision)) {
        return json({ error: "Decision must be accept or pass." }, 400);
      }

      const recommendation = await repository.getRecommendationById(recommendationId);
      if (!recommendation) return json({ error: "Recommendation not found." }, 404);
      if (recommendation.userId !== auth.userId) {
        return json({ error: "User is not allowed to respond to this recommendation." }, 403);
      }

      // Double-blind gate (alignment plan, Phase 0/1). A single accept never
      // converts the pair; a decline terminates it silently. Recommendations
      // approved before the cutover get their match row lazily.
      const match = await ensureBlindOffer(recommendation, auth.userId);

      const side = auth.userId === match.userAId ? "a" : auth.userId === match.userBId ? "b" : null;
      if (!side) return json({ error: "User is not part of this match." }, 403);

      const response = decision === "accept"
        ? MATCH_SIDE_RESPONSES.ACCEPTED
        : MATCH_SIDE_RESPONSES.DECLINED;

      const existingResponse = side === "a" ? match.aResponse : match.bResponse;
      if (existingResponse) {
        if (existingResponse === response) {
          return json({
            ok: true,
            recommendationId,
            status: recommendation.status,
            decision,
            matchState: match.state,
            mutual: match.state !== MATCH_STATUSES.OFFERED_BLIND && response === MATCH_SIDE_RESPONSES.ACCEPTED,
            waitingOnOtherSide: match.state === MATCH_STATUSES.OFFERED_BLIND && response === MATCH_SIDE_RESPONSES.ACCEPTED,
          });
        }
        return json({ error: "You have already responded to this match." }, 409);
      }
      if (match.state !== MATCH_STATUSES.OFFERED_BLIND) {
        return json({ error: "Match is not open for responses." }, 409);
      }

      const respondedAt = nowIso();
      const otherResponse = side === "a" ? match.bResponse : match.aResponse;
      const mutual = response === MATCH_SIDE_RESPONSES.ACCEPTED
        && otherResponse === MATCH_SIDE_RESPONSES.ACCEPTED;
      const nextMatchState = response === MATCH_SIDE_RESPONSES.DECLINED
        ? MATCH_STATUSES.DECLINED_SILENT
        : mutual
          ? MATCH_STATUSES.MUTUAL_ACCEPTED
          : match.state;

      const updatedMatch = await repository.updateMatch(match.id, {
        state: nextMatchState,
        ...(side === "a"
          ? { aResponse: response, aRespondedAt: respondedAt }
          : { bResponse: response, bRespondedAt: respondedAt }),
        updatedAt: respondedAt,
      });

      // Recommendation rows derive their status from the pair state: mutual
      // accept converts both directions, a decline passes both, and a lone
      // accept leaves them approved while the other side decides.
      let nextStatus = recommendation.status;
      if (mutual) {
        nextStatus = RECOMMENDATION_STATUSES.ACCEPTED;
      } else if (response === MATCH_SIDE_RESPONSES.DECLINED) {
        nextStatus = RECOMMENDATION_STATUSES.PASSED;
      }
      if (nextStatus !== recommendation.status) {
        await repository.updateRecommendationStatus(recommendationId, nextStatus, respondedAt);
        if (updatedMatch?.reverseRecommendationId) {
          await repository.updateRecommendationStatus(updatedMatch.reverseRecommendationId, nextStatus, respondedAt);
        }
      }

      await repository.upsertOutcome({
        id: `outcome_${randomUUID()}`,
        recommendationId,
        outcomeStatus: OUTCOME_STATUSES.NO_FOLLOW_THROUGH,
        notes: null,
        updatedAt: respondedAt,
        requesterResponse: decision,
      });

      const responseEvents: Array<{
        id: string;
        eventType: string;
        actorUserId: string | null;
        targetUserId: string | null;
        recommendationId: string | null;
        payload: unknown;
        createdAt: string;
      }> = [
        {
          id: `evt_${randomUUID()}`,
          eventType: response === MATCH_SIDE_RESPONSES.ACCEPTED ? EVENT_TYPES.BLIND_ACCEPT : EVENT_TYPES.BLIND_DECLINE,
          actorUserId: auth.userId,
          targetUserId: auth.userId,
          recommendationId,
          payload: { matchId: match.id, decision },
          createdAt: respondedAt,
        },
        {
          id: `evt_${randomUUID()}`,
          eventType: decision === "accept" ? EVENT_TYPES.USER_ACCEPT : EVENT_TYPES.USER_PASS,
          actorUserId: auth.userId,
          targetUserId: auth.userId,
          recommendationId,
          payload: { decision, candidateUserId: recommendation.candidateUserId },
          createdAt: respondedAt,
        },
      ];
      if (mutual) {
        responseEvents.push({
          id: `evt_${randomUUID()}`,
          eventType: EVENT_TYPES.MUTUAL_ACCEPT,
          actorUserId: auth.userId,
          targetUserId: auth.userId,
          recommendationId,
          payload: { matchId: match.id, decision },
          createdAt: respondedAt,
        });
      }
      await repository.appendEvents(responseEvents);

      // The decline reason feeds the trust ledger, never the other user.
      const declineReason = typeof body.declineReason === "string" ? body.declineReason.trim() : "";
      if (response === MATCH_SIDE_RESPONSES.DECLINED && declineReason) {
        await repository.appendTrustSignal({
          id: `trust_${randomUUID()}`,
          userId: auth.userId,
          signalType: TRUST_SIGNAL_TYPES.BLIND_DECLINE_REASON,
          weight: 0,
          matchId: match.id,
          sourceEventId: null,
          payload: { reason: declineReason.slice(0, 500) },
          createdAt: respondedAt,
        });
      }

      // Mutual accept unlocks the reveal. The intro email carries the reveal
      // until the Phase 1 in-app reveal screen ships; the meeting is created
      // here for the same reason. This block used to run at admin approval,
      // which leaked identities before either user had accepted anything.
      if (mutual) {
        const [requesterProfile, candidateProfile] = await Promise.all([
          repository.getUserProfile(recommendation.userId),
          repository.getUserProfile(recommendation.candidateUserId),
        ]);
        if (requesterProfile && candidateProfile) {
          const slot = firstOverlapSlot(
            requesterProfile.availability ?? [],
            candidateProfile.availability ?? [],
          );
          const occurrence = slot ? nextOccurrenceUtc(slot) : null;
          const scheduledAtIso = occurrence ? occurrence.startUtc.toISOString() : null;

          // Create an embedded Daily room for the pair (Phase 3, item 3). The
          // legacy public Jitsi link is kept only as a fallback so a Daily
          // outage never blocks the reveal; it is removed once the room-create
          // path is proven in production.
          const dailyResult = await createDailyRoom({ recommendationId, scheduledAt: scheduledAtIso });
          let meetingProvider: string;
          let meetingUrl: string;
          if (dailyResult.ok) {
            meetingProvider = dailyResult.room.provider;
            meetingUrl = dailyResult.room.url;
          } else {
            meetingProvider = 'jitsi';
            meetingUrl = `https://meet.jit.si/relethe-${encodeURIComponent(recommendationId)}`;
            console.warn(`[meeting] Daily room unavailable (${dailyResult.reason}); falling back to Jitsi link`);
          }

          await repository.upsertMeeting({
            recommendationId,
            provider: meetingProvider,
            meetingUrl,
            scheduledAt: scheduledAtIso,
            status: MEETING_STATUSES.SCHEDULED,
            metadata: slot ? { slot } : {},
          });

          const meeting = {
            meetingUrl,
            startUtc: occurrence?.startUtc ?? new Date(),
            endUtc: occurrence?.endUtc ?? new Date(Date.now() + 60 * 60 * 1000),
            slot,
          };
          const emailResult = await sendIntroEmails({
            requesterProfile,
            candidateProfile,
            insightText: recommendation.insightText ?? null,
            whyMatched: recommendation.whyMatched,
            meeting,
          });
          if (emailResult.ok) {
            await repository.upsertOutcome({
              id: `outcome_${randomUUID()}`,
              recommendationId,
              outcomeStatus: OUTCOME_STATUSES.INTRO_SENT,
              notes: null,
              updatedAt: nowIso(),
            });
            await repository.appendEvents([{
              id: `evt_${randomUUID()}`,
              eventType: EVENT_TYPES.INTRO_SENT,
              actorUserId: auth.userId,
              targetUserId: recommendation.userId,
              recommendationId,
              payload: { emailIds: emailResult.ids },
              createdAt: nowIso(),
            }]);
          }
        }

        await repository.updateMatch(match.id, { state: MATCH_STATUSES.REVEALED, updatedAt: nowIso() });
        await repository.appendEvents([{
          id: `evt_${randomUUID()}`,
          eventType: EVENT_TYPES.IDENTITY_REVEALED,
          actorUserId: auth.userId,
          targetUserId: recommendation.userId,
          recommendationId,
          payload: { matchId: match.id },
          createdAt: nowIso(),
        }]);
      }

      return json({
        ok: true,
        recommendationId,
        status: nextStatus,
        decision,
        matchState: mutual ? MATCH_STATUSES.REVEALED : nextMatchState,
        mutual,
        waitingOnOtherSide: decision === "accept" && !mutual,
      });
    }

    const followThroughMatch = path.match(/^\/api\/v1\/recommendations\/([^/]+)\/follow-through$/);
    if (followThroughMatch && req.method === "POST") {
      const recommendationId = decodeURIComponent(followThroughMatch[1]);
      const body = await readJsonBody(req);

      const status = String(body.status ?? "").toLowerCase();
      if (!(Object.values(OUTCOME_STATUSES) as string[]).includes(status)) {
        return json({ error: "Invalid follow-through status." }, 400);
      }

      const recommendation = await repository.getRecommendationById(recommendationId);
      if (!recommendation) return json({ error: "Recommendation not found." }, 404);
      if (recommendation.userId !== auth.userId) {
        return json({ error: "User is not allowed to update this recommendation." }, 403);
      }

      const outcome = await repository.upsertOutcome({
        id: `outcome_${randomUUID()}`,
        recommendationId,
        outcomeStatus: status,
        notes: body.notes as string ?? null,
        updatedAt: nowIso(),
      });

      const eventType = status === OUTCOME_STATUSES.INTRO_SENT
        ? EVENT_TYPES.INTRO_SENT
        : EVENT_TYPES.FOLLOW_THROUGH_UPDATED;

      await repository.appendEvents([{
        id: `evt_${randomUUID()}`,
        eventType,
        actorUserId: auth.userId,
        targetUserId: recommendation.userId,
        recommendationId,
        payload: { outcomeStatus: status, notes: body.notes ?? null },
        createdAt: nowIso(),
      }]);

      return json({ ok: true, outcome });
    }

    // ── events ────────────────────────────────────────────────────────────────

    if (req.method === "GET" && path === "/api/v1/events") {
      const limit = Number(url.searchParams.get("limit") ?? 200);
      const events = await repository.listEvents({
        limit: Number.isFinite(limit) ? Math.max(1, Math.min(1000, limit)) : 200,
        userId: url.searchParams.get("userId") ?? undefined,
        eventType: url.searchParams.get("eventType") ?? undefined,
        recommendationId: url.searchParams.get("recommendationId") ?? undefined,
      });
      return json({ events });
    }

    // ── report ────────────────────────────────────────────────────────────────

    if (req.method === "GET" && path === "/api/v1/report") {
      const windowDays = Number(url.searchParams.get("windowDays") ?? 7);
      const toIso = url.searchParams.get("to") ?? new Date().toISOString();
      const fromIso = url.searchParams.get("from")
        ?? new Date(Date.now() - Math.max(1, windowDays) * 86_400_000).toISOString();

      const [rows, eventCounts] = await Promise.all([
        repository.listRecommendationsWithDecisionAndOutcome({ fromIso, toIso }),
        repository.countEventsByType({ fromIso, toIso }),
      ]);

      const r = rows as Array<Record<string, unknown>>;
      const generated = r.length;
      const approved  = r.filter((x) => x.decision === "approved").length;
      const accepted  = r.filter((x) => x.status === "accepted").length;
      const passed    = r.filter((x) => x.status === "passed").length;
      const pct = (n: number, d: number) => d ? Number(((n / d) * 100).toFixed(1)) : 0;

      return json({
        report: {
          window: { fromIso, toIso, days: Math.max(1, windowDays) },
          recommendations: {
            generated, approved,
            rejected: r.filter((x) => x.decision === "rejected").length,
            approvalRatePct: pct(approved, generated),
          },
          responses: { accepted, passed, acceptRatePct: pct(accepted, generated) },
          events: eventCounts,
        },
      });
    }

    // ── weekly_cep ────────────────────────────────────────────────────────────

    const cepMatch = path.match(/^\/api\/v1\/users\/([^/]+)\/cep$/);
    if (cepMatch) {
      const userId = decodeURIComponent(cepMatch[1]);
      requireSelf(auth, userId);

      if (req.method === "GET") {
        const cep = await repository.getCep(userId);
        return json({ cep: cep?.isActive ? cep : null, isActive: cep?.isActive ?? false });
      }

      if (req.method === "PUT") {
        const body = await readJsonBody(req);
        const focusText = String(body.focusText ?? "").trim();
        if (!focusText) return json({ error: "focusText is required." }, 400);
        const cep = await repository.upsertCep(userId, focusText);
        return json({ cep });
      }

      if (req.method === "DELETE") {
        await repository.deleteCep(userId);
        return json({ ok: true });
      }
    }

    // ── meetings ──────────────────────────────────────────────────────────────

    const meetingMatch = path.match(/^\/api\/v1\/recommendations\/([^/]+)\/meeting$/);
    if (meetingMatch) {
      const recommendationId = decodeURIComponent(meetingMatch[1]);

      const recommendation = await repository.getRecommendationById(recommendationId);
      if (!recommendation) return json({ error: "Recommendation not found." }, 404);
      if (recommendation.userId !== auth.userId) {
        return json({ error: "Forbidden: not your recommendation." }, 403);
      }

      if (req.method === "GET") {
        const meeting = await repository.getMeetingForRecommendation(recommendationId);
        return json({ meeting });
      }

      if (req.method === "PUT") {
        const body = await readJsonBody(req);
        const status = String(body.status ?? "scheduled");
        const meeting = await repository.upsertMeeting({
          recommendationId,
          provider: body.provider as string | undefined,
          meetingUrl: body.meetingUrl as string | undefined,
          scheduledAt: body.scheduledAt as string | null | undefined,
          status,
          metadata: body.metadata as Record<string, unknown> | undefined,
        });

        const outcomeStatus = MEETING_OUTCOME_MAP[status] ?? OUTCOME_STATUSES.MEETING_SCHEDULED;
        await repository.upsertOutcome({
          id: `outcome_${randomUUID()}`,
          recommendationId,
          outcomeStatus,
          notes: body.notes as string ?? null,
          updatedAt: nowIso(),
        });

        await repository.appendEvents([{
          id: `evt_${randomUUID()}`,
          eventType: EVENT_TYPES.MEETING_STATUS_UPDATED ?? "MEETING_STATUS_UPDATED",
          actorUserId: auth.userId,
          targetUserId: recommendation.candidateUserId,
          recommendationId,
          payload: { status, meetingUrl: body.meetingUrl ?? null },
          createdAt: nowIso(),
        }]);

        return json({ meeting });
      }
    }

    const meetingStatusMatch = path.match(/^\/api\/v1\/recommendations\/([^/]+)\/meeting\/status$/);
    if (meetingStatusMatch && req.method === "POST") {
      const recommendationId = decodeURIComponent(meetingStatusMatch[1]);
      const recommendation = await repository.getRecommendationById(recommendationId);
      if (!recommendation) return json({ error: "Recommendation not found." }, 404);
      if (recommendation.userId !== auth.userId) {
        return json({ error: "Forbidden: not your recommendation." }, 403);
      }

      const body = await readJsonBody(req);
      const status = String(body.status ?? "").trim().toLowerCase();
      if (!(Object.values(MEETING_STATUSES) as string[]).includes(status)) {
        return json({ error: "Invalid meeting status." }, 400);
      }

      const existing = await repository.getMeetingForRecommendation(recommendationId);
      if (!existing) return json({ error: "Meeting not found for recommendation." }, 404);

      const meeting = await repository.updateMeetingStatus(recommendationId, status);
      const outcomeStatus = MEETING_OUTCOME_MAP[status];
      if (outcomeStatus) {
        await repository.upsertOutcome({
          id: `outcome_${randomUUID()}`,
          recommendationId,
          outcomeStatus,
          notes: body.notes as string ?? null,
          updatedAt: nowIso(),
        });
      }

      await repository.appendEvents([{
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.MEETING_STATUS_UPDATED ?? "MEETING_STATUS_UPDATED",
        actorUserId: auth.userId,
        targetUserId: recommendation.userId,
        recommendationId,
        payload: { meetingId: meeting?.id, status, notes: body.notes ?? null },
        createdAt: nowIso(),
      }]);

      return json({ ok: true, meeting });
    }

    // ── messaging ─────────────────────────────────────────────────────────────

    if (req.method === "GET" && path === "/api/v1/conversations") {
      const conversations = await repository.listConversationsForUser(auth.userId);
      return json({ conversations });
    }

    if (req.method === "POST" && path === "/api/v1/conversations") {
      const body = await readJsonBody(req);
      const otherUserId = String(body.otherUserId ?? "").trim();
      if (!otherUserId) return json({ error: "otherUserId is required." }, 400);
      if (otherUserId === auth.userId) {
        return json({ error: "Cannot start a conversation with yourself." }, 400);
      }

      const existing = await repository.findConversationBetween(auth.userId, otherUserId);
      if (existing) return json({ conversation: existing });

      const unlockingId = await repository.findUnlockingRecommendationId(auth.userId, otherUserId);
      if (!unlockingId) {
        return json({ error: "Conversation is not unlocked for this pair." }, 403);
      }

      const conversation = await repository.createConversation({
        userA: auth.userId,
        userB: otherUserId,
        unlockedByRecommendationId: unlockingId,
        createdAt: nowIso(),
      });

      await repository.appendEvents([{
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.CONVERSATION_CREATED ?? "conversation_created",
        actorUserId: auth.userId,
        targetUserId: otherUserId,
        recommendationId: unlockingId,
        payload: { conversationId: conversation.id },
        createdAt: nowIso(),
      }]);

      return json({ conversation }, 201);
    }

    const messagesMatch = path.match(/^\/api\/v1\/conversations\/([^/]+)\/messages$/);
    if (messagesMatch) {
      const conversationId = decodeURIComponent(messagesMatch[1]);
      const conversation = await repository.getConversationById(conversationId);
      if (!conversation) return json({ error: "Conversation not found." }, 404);
      if (![conversation.participantA, conversation.participantB].includes(auth.userId)) {
        return json({ error: "Forbidden: not a participant." }, 403);
      }

      if (req.method === "GET") {
        const limit = Number(url.searchParams.get("limit") ?? 50);
        const before = url.searchParams.get("before") ?? undefined;
        const messages = await repository.listMessages(conversationId, {
          limit: Number.isFinite(limit) ? limit : 50,
          before,
        });
        return json({ messages });
      }

      if (req.method === "POST") {
        const body = await readJsonBody(req);
        const messageBody = String(body.body ?? "").trim();
        if (!messageBody) return json({ error: "body is required." }, 400);
        if (messageBody.length > 4000) {
          return json({ error: "body exceeds 4000 characters." }, 400);
        }

        const id = String(body.id ?? `msg_${randomUUID()}`);
        const createdAt = nowIso();
        const message = await repository.sendMessage({
          id, conversationId, senderId: auth.userId, body: messageBody, createdAt,
        });

        const peerId = conversation.participantA === auth.userId
          ? conversation.participantB
          : conversation.participantA;

        await repository.appendEvents([{
          id: `evt_${randomUUID()}`,
          eventType: EVENT_TYPES.MESSAGE_SENT ?? "message_sent",
          actorUserId: auth.userId,
          targetUserId: peerId,
          recommendationId: conversation.unlockedByRecommendationId,
          payload: { conversationId, messageId: id },
          createdAt,
        }]);

        return json({ message }, 201);
      }
    }

    const readMatch = path.match(/^\/api\/v1\/conversations\/([^/]+)\/read$/);
    if (readMatch && req.method === "POST") {
      const conversationId = decodeURIComponent(readMatch[1]);
      const conversation = await repository.getConversationById(conversationId);
      if (!conversation) return json({ error: "Conversation not found." }, 404);
      if (![conversation.participantA, conversation.participantB].includes(auth.userId)) {
        return json({ error: "Forbidden: not a participant." }, 403);
      }
      await repository.markConversationRead(conversationId, auth.userId, nowIso());
      return json({ ok: true });
    }

    return json({ error: "Route not found." }, 404);

  } catch (error) {
    if (error instanceof AuthError) {
      return json({ error: error.message }, error.statusCode);
    }
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return json({ error: message }, statusCodeFromError(error));
  }
});
