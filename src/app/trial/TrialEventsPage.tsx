import { useEffect, useState } from 'react';
import { listTrialEvents, listTrialUsers } from './api';
import type { TrialEvent, TrialUser } from './types';

export default function TrialEventsPage() {
  const [events, setEvents] = useState<TrialEvent[]>([]);
  const [users, setUsers] = useState<TrialUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [eventType, setEventType] = useState('');
  const [message, setMessage] = useState('');

  async function refresh() {
    const nextEvents = await listTrialEvents({
      userId: selectedUserId || undefined,
      eventType: eventType || undefined,
      limit: 200,
    });
    setEvents(nextEvents);
  }

  useEffect(() => {
    listTrialUsers()
      .then((nextUsers) => setUsers(nextUsers))
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Failed to load users');
      });
  }, []);

  useEffect(() => {
    refresh().catch((error) => {
      setMessage(error instanceof Error ? error.message : 'Failed to load event history');
    });
  }, [selectedUserId, eventType]);

  return (
    <div className="space-y-5">
      <section className="bg-[#0d140d] border border-white/10 rounded-xl p-5">
        <h2 className="text-base font-semibold mb-3">Persistent event log</h2>

        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-white/70">
            Filter by user
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              className="block mt-1 min-w-[220px] bg-black/30 border border-white/15 rounded px-3 py-2"
            >
              <option value="">All users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.displayName} (@{user.handle})
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-white/70">
            Filter by event type
            <input
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
              placeholder="recommendation_generated"
              className="block mt-1 min-w-[240px] bg-black/30 border border-white/15 rounded px-3 py-2"
            />
          </label>

          <button
            onClick={() => {
              refresh().catch((error) => {
                setMessage(error instanceof Error ? error.message : 'Failed to refresh events');
              });
            }}
            className="px-4 py-2 rounded-md border border-white/20 bg-white/5 text-white/80"
          >
            Refresh
          </button>
        </div>
      </section>

      <section className="bg-[#0d140d] border border-white/10 rounded-xl p-5">
        <p className="text-sm text-white/60 mb-3">{events.length} events returned.</p>

        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="border border-white/10 rounded-lg p-3 bg-black/25">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-[#c9ff87]">{event.eventType}</p>
                <p className="text-xs text-white/50">{new Date(event.createdAt).toLocaleString()}</p>
              </div>
              <p className="text-xs text-white/55 mt-1">
                actor: {event.actorUserId ?? 'system'} | target: {event.targetUserId ?? '-'} | recommendation: {event.recommendationId ?? '-'}
              </p>
              <pre className="mt-2 text-xs text-white/65 whitespace-pre-wrap break-all">{JSON.stringify(event.payload, null, 2)}</pre>
            </div>
          ))}

          {events.length === 0 && <p className="text-sm text-white/60">No events found for the selected filters.</p>}
        </div>
      </section>

      {message && <p className="text-sm text-white/75">{message}</p>}
    </div>
  );
}
