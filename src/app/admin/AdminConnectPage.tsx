import { useEffect, useState } from 'react';
import {
  clearUserCep,
  getUserCep,
  getUserCompleteness,
  getUserMeetingReadiness,
  listUsers,
  listUserRecommendations,
  respondToRecommendation,
  runWeeklyMatching,
  saveRecommendationMeeting,
  saveMeetingReadinessResult,
  saveUserCep,
  startMeetingReadiness,
  updateFollowThrough,
  updateRecommendationMeetingStatus,
} from "../api";
import type {
  CepEntry,
  CompletenessResult,
  Recommendation,
  AppUser,
  TrialMeetingReadinessResponse,
  TrialMeetingReadinessStatus,
} from "../types";

const READINESS_LABELS: Record<TrialMeetingReadinessStatus, string> = {
  excellent: 'Excellent',
  good: 'Good',
  medium: 'Medium',
  low: 'Low',
  failed: 'Failed',
  unknown: 'Untested',
};

function readinessClass(status: TrialMeetingReadinessStatus) {
  if (status === 'excellent' || status === 'good') return 'bg-[#c9ff87]/15 text-[#c9ff87] border-[#c9ff87]/25';
  if (status === 'medium') return 'bg-[#4dc7ff]/15 text-[#9fe4ff] border-[#4dc7ff]/25';
  if (status === 'low') return 'bg-orange-400/15 text-orange-300 border-orange-400/25';
  if (status === 'failed') return 'bg-[#ff6b6b]/15 text-[#ffc5c5] border-[#ff6b6b]/25';
  return 'bg-white/5 text-white/55 border-white/15';
}

async function canAccessDevice(kind: 'videoinput' | 'audioinput') {
  if (!navigator.mediaDevices?.getUserMedia) return false;
  try {
    const stream = await navigator.mediaDevices.getUserMedia(
      kind === 'videoinput' ? { video: true } : { audio: true },
    );
    for (const track of stream.getTracks()) track.stop();
    return true;
  } catch {
    return false;
  }
}

function scoreReadiness(canUseCamera: boolean, canUseMic: boolean, warnings: string[]) {
  let score = 100;
  if (!canUseCamera) score -= 25;
  if (!canUseMic) score -= 35;
  score -= warnings.length * 10;
  return Math.max(0, Math.min(100, score));
}

function statusFromScore(score: number, canUseMic: boolean): TrialMeetingReadinessStatus {
  if (!canUseMic) return 'failed';
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 55) return 'medium';
  if (score > 0) return 'low';
  return 'failed';
}

export default function AdminConnectPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [meetingUrlById, setMeetingUrlById] = useState<Record<string, string>>({});
  const [scheduledAtById, setScheduledAtById] = useState<Record<string, string>>({});
  const [activeCep, setActiveCep] = useState<CepEntry | null>(null);
  const [cepIsActive, setCepIsActive] = useState(false);
  const [cepFocusText, setCepFocusText] = useState('');
  const [cepSaving, setCepSaving] = useState(false);
  const [completeness, setCompleteness] = useState<CompletenessResult | null>(null);
  const [readiness, setReadiness] = useState<TrialMeetingReadinessResponse | null>(null);
  const [readinessChecking, setReadinessChecking] = useState(false);

  async function refreshRecommendations(userId: string) {
    const nextRecommendations = await listUserRecommendations(userId);
    setRecommendations(nextRecommendations);
    setMeetingUrlById((current) => {
      const next = { ...current };
      for (const recommendation of nextRecommendations) {
        if (recommendation.meeting?.meetingUrl && !next[recommendation.id]) {
          next[recommendation.id] = recommendation.meeting.meetingUrl;
        }
      }
      return next;
    });
    setScheduledAtById((current) => {
      const next = { ...current };
      for (const recommendation of nextRecommendations) {
        if (recommendation.meeting?.scheduledAt && !next[recommendation.id]) {
          next[recommendation.id] = recommendation.meeting.scheduledAt.slice(0, 16);
        }
      }
      return next;
    });
  }

  useEffect(() => {
    listUsers()
      .then((nextUsers) => {
        setUsers(nextUsers);
        if (nextUsers[0]) {
          setSelectedUserId(nextUsers[0].id);
        }
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Failed to load users');
      });
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    refreshRecommendations(selectedUserId).catch((error) => {
      setMessage(error instanceof Error ? error.message : 'Failed to load recommendations');
    });
  }, [selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) {
      setActiveCep(null);
      setCepIsActive(false);
      setCepFocusText('');
      return;
    }

    getUserCep(selectedUserId)
      .then(({ cep, isActive }) => {
        setActiveCep(cep);
        setCepIsActive(isActive);
        setCepFocusText(cep?.focusText ?? '');
      })
      .catch(() => {
        setActiveCep(null);
        setCepIsActive(false);
      });
  }, [selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) {
      setCompleteness(null);
      setReadiness(null);
      return;
    }
    getUserCompleteness(selectedUserId)
      .then(setCompleteness)
      .catch(() => setCompleteness(null));
    getUserMeetingReadiness(selectedUserId)
      .then(setReadiness)
      .catch(() => setReadiness(null));
  }, [selectedUserId]);

  async function handleRunReadinessCheck() {
    if (!selectedUserId) return;
    setReadinessChecking(true);
    setMessage('');
    try {
      await startMeetingReadiness({ userId: selectedUserId, provider: 'manual_link' });
      const warnings: string[] = [];
      const supportsWebRtc = Boolean(window.RTCPeerConnection && navigator.mediaDevices?.getUserMedia);
      if (!supportsWebRtc) warnings.push('Browser WebRTC support unavailable.');
      if (!navigator.onLine) warnings.push('Browser reports offline.');

      const connection = (navigator as Navigator & {
        connection?: { effectiveType?: string; downlink?: number; rtt?: number };
      }).connection;
      if (connection?.effectiveType && ['slow-2g', '2g'].includes(connection.effectiveType)) {
        warnings.push('Very slow network detected.');
      }

      const [canUseCamera, canUseMic] = await Promise.all([
        canAccessDevice('videoinput'),
        canAccessDevice('audioinput'),
      ]);
      if (!canUseCamera) warnings.push('Camera permission or device unavailable.');
      if (!canUseMic) warnings.push('Microphone permission or device unavailable.');

      const score = scoreReadiness(canUseCamera, canUseMic, warnings);
      const status = statusFromScore(score, canUseMic);
      const result = await saveMeetingReadinessResult({
        userId: selectedUserId,
        provider: 'manual_link',
        status,
        score,
        latencyMs: connection?.rtt ?? null,
        downloadKbps: connection?.downlink ? Math.round(connection.downlink * 1000) : null,
        canUseCamera,
        canUseMic,
        deviceWarnings: warnings,
      });
      setReadiness(result);
      setMessage(`Meeting readiness: ${READINESS_LABELS[result.displayStatus]}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to run readiness check');
    } finally {
      setReadinessChecking(false);
    }
  }

  async function handleSaveCep() {
    if (!selectedUserId || !cepFocusText.trim()) return;
    setCepSaving(true);
    try {
      const saved = await saveUserCep(selectedUserId, cepFocusText.trim());
      setActiveCep(saved);
      setCepIsActive(true);
      setMessage('Weekly focus saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save focus');
    } finally {
      setCepSaving(false);
    }
  }

  async function handleClearCep() {
    if (!selectedUserId) return;
    setCepSaving(true);
    try {
      await clearUserCep(selectedUserId);
      setActiveCep(null);
      setCepIsActive(false);
      setCepFocusText('');
      setMessage('Weekly focus cleared.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to clear focus');
    } finally {
      setCepSaving(false);
    }
  }

  async function handleRunMatching() {
    setIsLoading(true);
    setMessage('');
    try {
      const result = await runWeeklyMatching(5);
      setMessage(`Run completed: ${result.summary.recommendationsGenerated} recommendations generated.`);
      if (selectedUserId) {
        await refreshRecommendations(selectedUserId);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Weekly matching failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRespond(recommendationId: string, decision: 'accept' | 'pass') {
    if (!selectedUserId) {
      return;
    }

    setIsLoading(true);
    setMessage('');
    try {
      await respondToRecommendation({
        recommendationId,
        userId: selectedUserId,
        decision,
      });
      await refreshRecommendations(selectedUserId);
      setMessage(`Recommendation ${decision} recorded.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save response');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleIntroSent(recommendationId: string) {
    setIsLoading(true);
    setMessage('');
    try {
      await updateFollowThrough({
        recommendationId,
        actorUserId: 'admin_trial',
        status: 'intro_sent',
        notes: 'Intro sent during local demo',
      });
      if (selectedUserId) {
        await refreshRecommendations(selectedUserId);
      }
      setMessage('Follow-through updated: intro_sent.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update follow-through');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveMeeting(recommendationId: string) {
    const meetingUrl = (meetingUrlById[recommendationId] ?? '').trim();
    if (!meetingUrl) {
      setMessage('Meeting URL is required.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    try {
      await saveRecommendationMeeting({
        recommendationId,
        actorUserId: 'admin_trial',
        provider: 'manual_link',
        meetingUrl,
        scheduledAt: scheduledAtById[recommendationId] || null,
        status: 'scheduled',
        notes: 'Manual meeting link added during local demo',
      });
      if (selectedUserId) {
        await refreshRecommendations(selectedUserId);
      }
      setMessage('Meeting scheduled.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save meeting');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMeetingCompleted(recommendationId: string) {
    setIsLoading(true);
    setMessage('');
    try {
      await updateRecommendationMeetingStatus({
        recommendationId,
        actorUserId: 'admin_trial',
        status: 'completed',
        notes: 'Meeting completed during local demo',
      });
      if (selectedUserId) {
        await refreshRecommendations(selectedUserId);
      }
      setMessage('Meeting marked completed.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update meeting');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="bg-[#0d140d] border border-white/10 rounded-xl p-5">
        <h2 className="text-base font-semibold mb-3">Deterministic recommendation loop</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-white/70">
            User
            <select
              className="block mt-1 min-w-[260px] bg-black/30 border border-white/15 rounded px-3 py-2"
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.displayName} (@{user.handle ?? '—'})
                </option>
              ))}
            </select>
          </label>

          <button
            disabled={isLoading}
            onClick={handleRunMatching}
            className="px-4 py-2 rounded-md bg-[#4dc7ff]/15 border border-[#4dc7ff]/40 text-[#9fe4ff] disabled:opacity-50"
          >
            Run weekly matcher
          </button>
        </div>
      </section>

      {selectedUserId && (
        <section className="bg-[#0d140d] border border-white/10 rounded-xl p-5">
          <h2 className="text-base font-semibold mb-1">What are you focused on this week?</h2>
          <p className="text-xs text-white/40 mb-3">Optional. Expires after 8 days. Used to improve match insights.</p>
          <div className="flex items-end gap-3">
            <label className="flex-1 text-sm text-white/70">
              <textarea
                className="block w-full mt-1 bg-black/30 border border-white/15 rounded px-3 py-2 text-sm resize-none"
                rows={2}
                maxLength={280}
                placeholder="e.g. fundraising outreach for Series A, hiring a CTO, exploring climate finance..."
                value={cepFocusText}
                onChange={(e) => setCepFocusText(e.target.value)}
              />
            </label>
            <div className="flex flex-col gap-2">
              <button
                disabled={cepSaving || !cepFocusText.trim()}
                onClick={handleSaveCep}
                className="px-3 py-2 rounded-md bg-[#4dc7ff]/15 border border-[#4dc7ff]/40 text-[#9fe4ff] text-sm disabled:opacity-50"
              >
                Save
              </button>
              {activeCep && (
                <button
                  disabled={cepSaving}
                  onClick={handleClearCep}
                  className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/50 text-sm disabled:opacity-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          {activeCep && (
            <p className="mt-2 text-xs text-white/40">
              {cepIsActive ? (
                <>Active until {new Date(activeCep.expiresAt).toLocaleDateString()}</>
              ) : (
                <>Expired — save a new focus to re-activate.</>
              )}
            </p>
          )}
        </section>
      )}

      {selectedUserId && completeness && (
        <section className="bg-[#0d140d] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">Profile completeness</h2>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                completeness.isEligible
                  ? 'bg-[#c9ff87]/15 text-[#c9ff87]'
                  : 'bg-orange-400/15 text-orange-300'
              }`}
            >
              {completeness.isEligible ? 'Eligible for matching' : 'Incomplete — not in matching pool'}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${completeness.isEligible ? 'bg-[#c9ff87]' : 'bg-orange-400'}`}
                style={{ width: `${completeness.completenessScore}%` }}
              />
            </div>
            <span className="text-xs text-white/50 tabular-nums">{completeness.completenessScore}%</span>
          </div>
          {completeness.missingFields.length > 0 && (
            <p className="text-xs text-white/50">
              Missing:{' '}
              <span className="text-orange-300">
                {completeness.missingFields.join(', ')}
              </span>
            </p>
          )}
        </section>
      )}

      {selectedUserId && (
        <section className="bg-[#0d140d] border border-white/10 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold mb-1">Meeting readiness</h2>
              <p className="text-xs text-white/40">
                {readiness?.readiness && readiness.isActive
                  ? `${READINESS_LABELS[readiness.displayStatus]} - tested recently.`
                  : 'Untested recently.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-full border ${readinessClass(readiness?.displayStatus ?? 'unknown')}`}>
                {READINESS_LABELS[readiness?.displayStatus ?? 'unknown']}
              </span>
              <button
                disabled={readinessChecking}
                onClick={handleRunReadinessCheck}
                className="px-3 py-2 rounded-md bg-[#4dc7ff]/15 border border-[#4dc7ff]/40 text-[#9fe4ff] text-sm disabled:opacity-50"
              >
                {readinessChecking ? 'Testing...' : 'Run check'}
              </button>
            </div>
          </div>
          {readiness?.readiness && (
            <div className="mt-3 text-sm text-white/60">
              <p>{readiness.isActive ? readiness.readiness.recommendation : 'Untested recently.'}</p>
              {readiness.readiness.deviceWarnings.length > 0 && (
                <p className="mt-1 text-xs text-white/40">
                  {readiness.readiness.deviceWarnings.join(' ')}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      <section className="bg-[#0d140d] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm uppercase tracking-[0.13em] text-white/50 mb-3">Recommendations ({recommendations.length})</h3>
        <div className="space-y-3">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="border border-white/10 rounded-lg p-4 bg-black/25">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white/90">{recommendation.candidate.displayName}</p>
                  <p className="text-sm text-white/60">@{recommendation.candidate.handle ?? '—'}</p>
                  <p className="text-sm text-white/60">{recommendation.candidate.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#c9ff87]">Score {recommendation.score}</p>
                  <p className="text-xs text-white/50 uppercase tracking-[0.12em]">{recommendation.status}</p>
                </div>
              </div>

              <ul className="mt-3 space-y-1 text-sm text-white/75">
                {recommendation.whyMatched.map((line, index) => (
                  <li key={`${recommendation.id}-${index}`}>- {line}</li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  disabled={isLoading}
                  onClick={() => handleRespond(recommendation.id, 'accept')}
                  className="px-3 py-1 text-xs rounded border border-[#7FFF00]/40 text-[#c9ff87] bg-[#7FFF00]/10 disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  disabled={isLoading}
                  onClick={() => handleRespond(recommendation.id, 'pass')}
                  className="px-3 py-1 text-xs rounded border border-white/25 text-white/70 bg-white/5 disabled:opacity-50"
                >
                  Pass
                </button>
                <button
                  disabled={isLoading}
                  onClick={() => handleIntroSent(recommendation.id)}
                  className="px-3 py-1 text-xs rounded border border-[#4dc7ff]/35 text-[#9fe4ff] bg-[#4dc7ff]/10 disabled:opacity-50"
                >
                  Mark intro sent
                </button>
              </div>

              <div className="mt-4 rounded border border-white/10 bg-black/20 p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-white/50">Meeting</p>
                    {recommendation.meeting ? (
                      <p className="text-sm text-white/75">
                        {recommendation.meeting.status} · {recommendation.meeting.provider}
                        {recommendation.meeting.scheduledAt ? ` · ${new Date(recommendation.meeting.scheduledAt).toLocaleString()}` : ''}
                      </p>
                    ) : (
                      <p className="text-sm text-white/55">No meeting link attached.</p>
                    )}
                  </div>
                  {recommendation.meeting?.meetingUrl && (
                    <a
                      href={recommendation.meeting.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#9fe4ff] hover:text-[#b9ecff] underline underline-offset-2"
                    >
                      Open meeting
                    </a>
                  )}
                </div>

                <div className="grid md:grid-cols-[1fr_220px_auto_auto] gap-2">
                  <input
                    className="bg-black/30 border border-white/15 rounded px-3 py-2 text-sm"
                    placeholder="https://meet.google.com/... or Zoom link"
                    value={meetingUrlById[recommendation.id] ?? ''}
                    onChange={(event) =>
                      setMeetingUrlById((current) => ({
                        ...current,
                        [recommendation.id]: event.target.value,
                      }))
                    }
                  />
                  <input
                    type="datetime-local"
                    className="bg-black/30 border border-white/15 rounded px-3 py-2 text-sm"
                    value={scheduledAtById[recommendation.id] ?? ''}
                    onChange={(event) =>
                      setScheduledAtById((current) => ({
                        ...current,
                        [recommendation.id]: event.target.value,
                      }))
                    }
                  />
                  <button
                    disabled={isLoading}
                    onClick={() => handleSaveMeeting(recommendation.id)}
                    className="px-3 py-1 text-xs rounded border border-[#4dc7ff]/35 text-[#9fe4ff] bg-[#4dc7ff]/10 disabled:opacity-50"
                  >
                    Save meeting
                  </button>
                  <button
                    disabled={isLoading || !recommendation.meeting}
                    onClick={() => handleMeetingCompleted(recommendation.id)}
                    className="px-3 py-1 text-xs rounded border border-[#7FFF00]/40 text-[#c9ff87] bg-[#7FFF00]/10 disabled:opacity-50"
                  >
                    Complete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {recommendations.length === 0 && (
            <p className="text-sm text-white/60">
              No recommendations yet. Demo path: save onboarding data for at least one user {'->'} run weekly matcher {'->'} review in Admin.
            </p>
          )}
        </div>
      </section>

      {message && (
        <p
          className={`text-sm px-3 py-2 rounded border ${
            message.toLowerCase().includes('failed')
              ? 'text-[#ffc5c5] border-[#ff6b6b]/35 bg-[#ff6b6b]/10'
              : 'text-[#9fe4ff] border-[#4dc7ff]/30 bg-[#4dc7ff]/10'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
