import { useEffect, useState } from 'react';
import { initializeTrialData, listTrialUsers, getTrialApiBaseUrl, runWeeklyMatching } from './api';
import type { TrialUser } from './types';

export default function TrialHomePage() {
  const [users, setUsers] = useState<TrialUser[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function refreshUsers() {
    const nextUsers = await listTrialUsers();
    setUsers(nextUsers);
  }

  useEffect(() => {
    refreshUsers().catch((error) => {
      setMessage(error instanceof Error ? error.message : 'Failed to load users');
    });
  }, []);

  async function handleInit(reset: boolean) {
    setIsLoading(true);
    try {
      const result = await initializeTrialData({ reset, seed: true });
      await refreshUsers();
      setMessage(
        result.seeded
          ? `Database initialized and seeded (${result.usersSeeded ?? 0} users).`
          : `Database already initialized (${result.users ?? users.length} users).`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to initialize data');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRunMatching() {
    setIsLoading(true);
    try {
      const result = await runWeeklyMatching(5);
      setMessage(
        `Run ${result.runId} completed: ${result.summary.recommendationsGenerated} recommendations across ${result.summary.usersEvaluated} users.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to run weekly matching');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="bg-[#0d140d] border border-white/10 rounded-xl p-5">
        <h2 className="text-base font-semibold mb-2">Trial controls</h2>
        <p className="text-sm text-white/60 mb-4">
          API base: <span className="text-white/80">{getTrialApiBaseUrl()}</span>
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            disabled={isLoading}
            onClick={() => handleInit(false)}
            className="px-4 py-2 text-sm rounded-md bg-[#7FFF00]/15 border border-[#7FFF00]/35 text-[#c9ff87] disabled:opacity-50"
          >
            Init/Seed
          </button>
          <button
            disabled={isLoading}
            onClick={() => handleInit(true)}
            className="px-4 py-2 text-sm rounded-md bg-white/10 border border-white/20 text-white/80 disabled:opacity-50"
          >
            Reset + Seed
          </button>
          <button
            disabled={isLoading}
            onClick={handleRunMatching}
            className="px-4 py-2 text-sm rounded-md bg-[#4dc7ff]/15 border border-[#4dc7ff]/40 text-[#9fe4ff] disabled:opacity-50"
          >
            Run Weekly Matching
          </button>
        </div>

        {message && <p className="mt-4 text-sm text-white/75">{message}</p>}
      </section>

      <section className="bg-[#0d140d] border border-white/10 rounded-xl p-5">
        <h2 className="text-base font-semibold mb-3">Seeded users ({users.length})</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {users.map((user) => (
            <div key={user.id} className="border border-white/10 rounded-lg p-3 bg-black/20">
              <p className="font-medium">{user.displayName}</p>
              <p className="text-xs uppercase tracking-[0.1em] text-white/50">@{user.handle}</p>
              <p className="text-sm text-white/65 mt-1">{user.location}</p>
            </div>
          ))}
          {users.length === 0 && <p className="text-sm text-white/60">No users seeded yet.</p>}
        </div>
      </section>
    </div>
  );
}
