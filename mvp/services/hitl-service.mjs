import { randomUUID } from 'node:crypto';
import { EVENT_TYPES } from '../domain/events.mjs';
import { nowIso } from '../domain/models.mjs';
import {
  DEFAULT_HITL_CONFIG,
  normalizeHitlConfig,
  decideReviewRouting,
  computeWeightedAcceptance,
} from '../domain/hitl-policy.mjs';

// Orchestrates the graduated HITL review dial (alignment plan, Phase 1).
// The dial ships parked at 0, so getConfig() falls back to the parked default
// until an admin sets it. All decisions run through the pure domain policy.
export class HitlService {
  constructor({ repository }) {
    this.repository = repository;
  }

  getConfig() {
    const stored = this.repository.getHitlConfig?.();
    return stored ? normalizeHitlConfig(stored) : { ...DEFAULT_HITL_CONFIG };
  }

  setConfig({ autoApproveRate, minSampleFloor, whiteGloveFirstMatch, adminId = null } = {}) {
    const current = this.getConfig();
    const next = normalizeHitlConfig({
      autoApproveRate: autoApproveRate ?? current.autoApproveRate,
      minSampleFloor: minSampleFloor ?? current.minSampleFloor,
      whiteGloveFirstMatch: whiteGloveFirstMatch ?? current.whiteGloveFirstMatch,
    });

    const saved = this.repository.setHitlConfig({ ...next, updatedBy: adminId, updatedAt: nowIso() });

    this.repository.appendEvents([
      {
        id: `evt_${randomUUID()}`,
        eventType: EVENT_TYPES.HITL_CONFIG_CHANGED,
        actorUserId: adminId,
        targetUserId: null,
        recommendationId: null,
        payload: { from: current, to: next },
        createdAt: nowIso(),
      },
    ]);

    return saved ?? next;
  }

  getStats() {
    const resolved = this.repository.listResolvedMatchStats?.() ?? [];
    const { weightedAcceptance, sampleCount } = computeWeightedAcceptance(resolved);
    return {
      config: this.getConfig(),
      resolvedCount: resolved.length,
      sampleCount,
      weightedAcceptance,
    };
  }

  // Computed once per matching cycle, then reused for every pair.
  prepareRoutingContext() {
    const config = this.getConfig();
    const resolvedCount = this.repository.listResolvedMatchStats?.()?.length ?? 0;
    return { config, resolvedCount };
  }

  routePair(context, { pairKey, userAId, userBId }) {
    const isFirstMatchForEitherUser =
      !this.repository.hasPriorMatchForUser?.(userAId) ||
      !this.repository.hasPriorMatchForUser?.(userBId);

    return decideReviewRouting({
      config: context.config,
      resolvedCount: context.resolvedCount,
      isFirstMatchForEitherUser,
      pairKey,
    });
  }
}
