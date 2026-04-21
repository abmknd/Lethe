import { useEffect, useState } from 'react';
import { listTrialEvents, listTrialUsers } from './api';
import type { TrialEvent, TrialUser } from './types';

function readQueryParam(key: string) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key) ?? '';
}

function updateUrlQuery(filters: { userId?: string; eventType?: string; recommendationId?: string }) {
  const params = new URLSearchParams(window.location.search);

  if (filters.userId) {
    params.set('userId', filters.userId);
  } else {
    params.delete('userId');
  }

  if (filters.eventType) {
    params.set('eventType', filters.eventType);
  } else {
    params.delete('eventType');
  }

  if (filters.recommendationId) {
    params.set('recommendationId', filters.recommendationId);
  } else {
    params.delete('recommendationId');
  }

  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
  window.history.replaceState(null, '', nextUrl);
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export default function TrialEventsPage() {
  const [events, setEvents] = useState<TrialEvent[]>([]);
  const [users, setUsers] = useState<TrialUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState(() => readQueryParam('userId'));
  const [eventType, setEventType] = useState(() => readQueryParam('eventType'));
  const [recommendationId, setRecommendationId] = useState(() => readQueryParam('recommendationId'));
  const [message, setMessage] = useState('');

  async function refresh() {
    const nextEvents = await listTrialEvents({
      userId: selectedUserId || undefined,
      eventType: eventType || undefined,
      recommendationId: recommendationId || undefined,
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
    updateUrlQuery({
      userId: selectedUserId || undefined,
      eventType: eventType || undefined,
      recommendationId: recommendationId || undefined,
    });

    refresh().catch((error) => {
      setMessage(error instanceof Error ? error.message : 'Failed to load event history');
    });
  }, [selectedUserId, eventType, recommendationId]);

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

          <label className="text-sm text-white/70">
            Filter by recommendation
            <input
              value={recommendationId}
              onChange={(event) => setRecommendationId(event.target.value)}
              placeholder="rec_..."
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
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-[11px] text-white/45">event: {event.id}</p>
                <button
                  onClick={async () => {
                    const copied = await copyText(event.id);
                    setMessage(copied ? `Copied event id: ${event.id}` : 'Could not copy event id.');
                  }}
                  className="text-[10px] px-2 py-0.5 rounded border border-white/20 text-white/65 hover:text-white/85"
                >
                  Copy event id
                </button>
                {event.recommendationId && (
                  <>
                    <p className="text-[11px] text-white/45">rec: {event.recommendationId}</p>
                    <button
                      onClick={async () => {
                        const copied = await copyText(event.recommendationId ?? '');
                        setMessage(copied ? `Copied recommendation id: ${event.recommendationId}` : 'Could not copy recommendation id.');
                      }}
                      className="text-[10px] px-2 py-0.5 rounded border border-white/20 text-white/65 hover:text-white/85"
                    >
                      Copy rec id
                    </button>
                  </>
                )}
              </div>
              <p className="text-xs text-white/55 mt-1">
                actor: {event.actorUserId ?? 'system'} | target: {event.targetUserId ?? '-'} | recommendation: {event.recommendationId ?? '-'}
              </p>
              <pre className="mt-2 text-xs text-white/65 whitespace-pre-wrap break-all">{JSON.stringify(event.payload, null, 2)}</pre>
            </div>
          ))}

          {events.length === 0 && (
            <p className="text-sm text-white/60">
              No events found for the selected filters. Try clearing filters or run onboarding {'->'} weekly matching {'->'} admin decision first.
            </p>
          )}
        </div>
      </section>

      {message && (
        <p
          className={`text-sm px-3 py-2 rounded border ${
            message.toLowerCase().includes('failed') || message.toLowerCase().includes('could not')
              ? 'text-[#ffc5c5] border-[#ff6b6b]/35 bg-[#ff6b6b]/10'
              : 'text-[#c9ff87] border-[#7FFF00]/30 bg-[#7FFF00]/10'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
