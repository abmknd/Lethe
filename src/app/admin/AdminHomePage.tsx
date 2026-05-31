import { useEffect, useState } from 'react';
import { listUsers, runWeeklyMatching } from "../api";
import type { AppUser } from "../types";

export default function AdminHomePage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function refreshUsers() {
    const nextUsers = await listUsers();
    setUsers(nextUsers);
  }

  useEffect(() => {
    refreshUsers().catch((error) => {
      setMessage(error instanceof Error ? error.message : 'Failed to load users');
    });
  }, []);

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
        <h2 className="text-base font-semibold mb-2">Operator controls</h2>

        <div className="flex flex-wrap gap-3">
          <button
            disabled={isLoading}
            onClick={handleRunMatching}
            className="px-4 py-2 text-sm rounded-md bg-[#4dc7ff]/15 border border-[#4dc7ff]/40 text-[#9fe4ff] disabled:opacity-50"
          >
            Run Weekly Matching
          </button>
        </div>

        {message && (
          <p
            className={`mt-4 text-sm px-3 py-2 rounded border ${
              message.toLowerCase().includes('failed')
                ? 'text-[#ffc5c5] border-[#ff6b6b]/35 bg-[#ff6b6b]/10'
                : 'text-[#c9ff87] border-[#7FFF00]/30 bg-[#7FFF00]/10'
            }`}
          >
            {message}
          </p>
        )}
      </section>

      <section className="bg-[#0d140d] border border-white/10 rounded-xl p-5">
        <h2 className="text-base font-semibold mb-3">Users ({users.length})</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {users.map((user) => (
            <div key={user.id} className="border border-white/10 rounded-lg p-3 bg-black/20">
              <p className="font-medium">{user.displayName}</p>
              <p className="text-xs uppercase tracking-[0.1em] text-white/50">@{user.handle ?? '—'}</p>
              <p className="text-sm text-white/65 mt-1">{user.location}</p>
            </div>
          ))}
          {users.length === 0 && <p className="text-sm text-white/60">No users yet.</p>}
        </div>
      </section>
    </div>
  );
}
