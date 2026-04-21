import { useEffect, useState } from 'react';
import { listAdminRecommendations, submitAdminDecision } from './api';
import type { TrialAdminRecommendation } from './types';

const MIN_RATIONALE_CHARS = 10;

function normalizeRationale(value: string) {
  return value.trim();
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export default function TrialAdminPage() {
  const [status, setStatus] = useState<'pending_review' | 'approved' | 'rejected'>('pending_review');
  const [rows, setRows] = useState<TrialAdminRecommendation[]>([]);
  const [message, setMessage] = useState('');
  const [savingById, setSavingById] = useState<Record<string, boolean>>({});
  const [rationaleById, setRationaleById] = useState<Record<string, string>>({});
  const [rowMessageById, setRowMessageById] = useState<Record<string, string>>({});

  async function refresh(currentStatus: 'pending_review' | 'approved' | 'rejected') {
    const nextRows = await listAdminRecommendations(currentStatus);
    setRows(nextRows);
  }

  useEffect(() => {
    refresh(status).catch((error) => {
      setMessage(error instanceof Error ? error.message : 'Failed to load admin queue');
    });
  }, [status]);

  async function handleDecision(recommendationId: string, decision: 'approve' | 'reject') {
    const rationale = normalizeRationale(rationaleById[recommendationId] ?? '');
    if (rationale.length < MIN_RATIONALE_CHARS) {
      setRowMessageById((current) => ({
        ...current,
        [recommendationId]: 'Rationale is required and must be at least 10 characters.',
      }));
      return;
    }

    setSavingById((current) => ({
      ...current,
      [recommendationId]: true,
    }));
    setMessage('');
    setRowMessageById((current) => ({
      ...current,
      [recommendationId]: '',
    }));

    try {
      await submitAdminDecision({
        recommendationId,
        adminId: 'admin_trial',
        decision,
        rationale,
      });
      await refresh(status);
      setMessage(`Recommendation ${decision}d.`);
    } catch (error) {
      const failureMessage = error instanceof Error ? error.message : 'Failed to save admin decision';
      setMessage(failureMessage);
      setRowMessageById((current) => ({
        ...current,
        [recommendationId]: failureMessage,
      }));
    } finally {
      setSavingById((current) => ({
        ...current,
        [recommendationId]: false,
      }));
    }
  }

  return (
    <div className="space-y-5">
      <section className="bg-[#0d140d] border border-white/10 rounded-xl p-5">
        <h2 className="text-base font-semibold mb-3">Admin review queue</h2>
        <div className="flex gap-2">
          {(['pending_review', 'approved', 'rejected'] as const).map((nextStatus) => (
            <button
              key={nextStatus}
              onClick={() => setStatus(nextStatus)}
              className={`px-3 py-1 text-xs rounded border uppercase tracking-[0.12em] ${
                status === nextStatus
                  ? 'border-[#7FFF00]/50 text-[#c9ff87] bg-[#7FFF00]/10'
                  : 'border-white/20 text-white/60 hover:text-white/80'
              }`}
            >
              {nextStatus === 'pending_review' ? 'pending' : nextStatus}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-[#0d140d] border border-white/10 rounded-xl p-5">
        <p className="text-sm text-white/60 mb-3">{rows.length} recommendations in {status}.</p>

        <div className="space-y-3">
          {rows.map((row) => {
            const rationale = normalizeRationale(rationaleById[row.id] ?? '');
            const isRationaleValid = rationale.length >= MIN_RATIONALE_CHARS;
            const isSaving = savingById[row.id] ?? false;

            return (
              <div key={row.id} className="border border-white/10 rounded-lg p-4 bg-black/25">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-white/60">For {row.source.displayName} (@{row.source.handle})</p>
                    <p className="font-medium text-white/90">
                      Recommend {row.candidate.displayName} (@{row.candidate.handle})
                    </p>
                    <p className="text-sm text-white/60">Score {row.score} | Rank #{row.rank}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs text-white/45">rec: {row.id}</p>
                      <button
                        onClick={async () => {
                          const copied = await copyText(row.id);
                          setMessage(copied ? `Copied recommendation id: ${row.id}` : 'Could not copy recommendation id.');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded border border-white/20 text-white/65 hover:text-white/85"
                      >
                        Copy ID
                      </button>
                    </div>
                  </div>
                  <span className="text-xs uppercase tracking-[0.12em] text-white/50">{row.status}</span>
                </div>

                <ul className="mt-2 space-y-1 text-sm text-white/75">
                  {row.whyMatched.map((line, index) => (
                    <li key={`${row.id}-${index}`}>- {line}</li>
                  ))}
                </ul>

                <div className="mt-3">
                  <a
                    href={`/trial/events?recommendationId=${encodeURIComponent(row.id)}&userId=${encodeURIComponent(row.userId)}`}
                    className="text-xs text-[#9fe4ff] hover:text-[#b9ecff] underline underline-offset-2"
                  >
                    View events
                  </a>
                </div>

                {status === 'pending_review' && (
                  <div className="mt-3 space-y-2">
                    <label className="block text-xs text-white/65">
                      Decision rationale (required)
                      <textarea
                        className="mt-1 w-full bg-black/30 border border-white/15 rounded px-3 py-2 min-h-20 text-sm"
                        value={rationaleById[row.id] ?? ''}
                        onChange={(event) =>
                          setRationaleById((current) => ({
                            ...current,
                            [row.id]: event.target.value,
                          }))
                        }
                        placeholder="Explain why this intro should be approved or rejected."
                      />
                    </label>
                    {!isRationaleValid && <p className="text-xs text-white/55">Minimum 10 characters required.</p>}
                    {rowMessageById[row.id] && <p className="text-xs text-[#ffc5c5]">{rowMessageById[row.id]}</p>}

                    <div className="flex gap-2">
                      <button
                        disabled={isSaving || !isRationaleValid}
                        onClick={() => handleDecision(row.id, 'approve')}
                        className="px-3 py-1 text-xs rounded border border-[#7FFF00]/40 text-[#c9ff87] bg-[#7FFF00]/10 disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Approve'}
                      </button>
                      <button
                        disabled={isSaving || !isRationaleValid}
                        onClick={() => handleDecision(row.id, 'reject')}
                        className="px-3 py-1 text-xs rounded border border-white/25 text-white/70 bg-white/5 disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                )}

                {status !== 'pending_review' && row.adminDecision && (
                  <div className="mt-3 text-xs text-white/60">
                    <p>
                      Decision by {row.adminDecision.adminId ?? 'admin'} at {new Date(row.adminDecision.decidedAt).toLocaleString()}
                    </p>
                    <p className="mt-1">Rationale: {row.adminDecision.rationale ?? '-'}</p>
                  </div>
                )}
              </div>
            );
          })}

          {rows.length === 0 && <p className="text-sm text-white/60">No recommendations in this queue yet.</p>}
        </div>
      </section>

      {message && (
        <p
          className={`text-sm px-3 py-2 rounded border ${
            message.toLowerCase().includes('failed') ||
            message.toLowerCase().includes('required') ||
            message.toLowerCase().includes('no longer pending')
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
