import { useEffect, useState } from 'react';
import {
  listTrialUsers,
  listUserRecommendations,
  respondToRecommendation,
  runWeeklyMatching,
  updateFollowThrough,
} from './api';
import type { TrialRecommendation, TrialUser } from './types';

export default function TrialConnectPage() {
  const [users, setUsers] = useState<TrialUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [recommendations, setRecommendations] = useState<TrialRecommendation[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function refreshRecommendations(userId: string) {
    const nextRecommendations = await listUserRecommendations(userId);
    setRecommendations(nextRecommendations);
  }

  useEffect(() => {
    listTrialUsers()
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
                  {user.displayName} (@{user.handle})
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

      <section className="bg-[#0d140d] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm uppercase tracking-[0.13em] text-white/50 mb-3">Recommendations ({recommendations.length})</h3>
        <div className="space-y-3">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="border border-white/10 rounded-lg p-4 bg-black/25">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white/90">{recommendation.candidate.displayName}</p>
                  <p className="text-sm text-white/60">@{recommendation.candidate.handle}</p>
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
            </div>
          ))}

          {recommendations.length === 0 && (
            <p className="text-sm text-white/60">
              No recommendations yet. Run weekly matcher after seeding users and saving onboarding data.
            </p>
          )}
        </div>
      </section>

      {message && <p className="text-sm text-white/75">{message}</p>}
    </div>
  );
}
