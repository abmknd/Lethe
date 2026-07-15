import { randomUUID } from 'node:crypto';
import { normalizeProfilePayload, nowIso } from '../domain/models.mjs';
import { TRUST_SIGNAL_TYPES } from '../domain/trust.mjs';
import { EVENT_TYPES } from '../domain/events.mjs';
import { detectInputQuality } from '../context/input-quality.mjs';

export class OnboardingService {
  constructor({ repository }) {
    this.repository = repository;
  }

  listUsers() {
    return this.repository.listUsers();
  }

  getUserProfile(userId) {
    return this.repository.getUserProfile(userId);
  }

  getUserByHandle(handle) {
    return this.repository.getUserByHandle(handle);
  }

  saveUserProfile(payload) {
    const normalized = normalizeProfilePayload(payload);

    if (!normalized.user.id) {
      throw new Error('Missing user id.');
    }
    if (!normalized.user.name) {
      throw new Error('Name is required.');
    }
    if (!normalized.user.handle) {
      throw new Error('Handle is required.');
    }

    const profile = this.repository.upsertUserProfile(normalized);

    // Input-quality pass at intake (Phase 2, item 5). Detections are written
    // silently to the trust ledger — never shown to the counterpart, never a
    // hard block. Best-effort: a detection failure must not fail the save.
    let inputQuality = { flags: [], routeToCommunityFirst: false };
    try {
      inputQuality = this.recordIntakeQuality(normalized);
    } catch {
      // Intake detection is advisory; swallow so profile save always succeeds.
    }

    return { ...profile, inputQuality };
  }

  // Runs the deterministic input-quality detector and appends one
  // INTAKE_REGISTER trust signal (plus an audit event) per flag. Returns the
  // detection result so callers/UI can surface generic re-framing prompts.
  recordIntakeQuality(profile) {
    const result = detectInputQuality({
      asks: profile.preferences?.asks,
      offers: profile.preferences?.offers,
      introText: profile.preferences?.introText,
      name: profile.user?.name,
    });

    for (const flag of result.flags) {
      const stored = this.repository.appendTrustSignal({
        id: `trust_${randomUUID()}`,
        userId: profile.user.id,
        signalType: TRUST_SIGNAL_TYPES.INTAKE_REGISTER,
        weight: flag.weight,
        matchId: null,
        sourceEventId: null,
        payload: { category: flag.category, evidence: flag.evidence },
        createdAt: nowIso(),
      });

      if (typeof this.repository.appendEvents === 'function') {
        this.repository.appendEvents([
          {
            id: `evt_${randomUUID()}`,
            eventType: EVENT_TYPES.TRUST_SIGNAL_RECORDED,
            actorUserId: null,
            targetUserId: profile.user.id,
            recommendationId: null,
            payload: { trustSignalId: stored.id, signalType: TRUST_SIGNAL_TYPES.INTAKE_REGISTER, category: flag.category },
            createdAt: nowIso(),
          },
        ]);
      }
    }

    return result;
  }
}
