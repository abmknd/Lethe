import { useEffect, useState } from 'react';
import { listAdminRecommendations, submitAdminDecision } from './api';
import type { TrialAdminRecommendation } from './types';

export default function TrialAdminPage() {
  const [status, setStatus] = useState<'pending_review' | 'approved' | 'rejected'>('pending_review');
  const [rows, setRows] = useState<TrialAdminRecommendation[]>([]);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    setIsSaving(true);
    setMessage('');
    try {
      await submitAdminDecision({
        recommendationId,
        adminId: 'admin_trial',
        decision,
        rationale: decision === 'approve' ? 'Looks credible for trial intro' : 'Low signal / mismatch for trial intro',
      });
      await refresh(status);
      setMessage(`Recommendation ${decision}d.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save admin decision');
    } finally {
      setIsSaving(false);
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
          {rows.map((row) => (
            <div key={row.id} className="border border-white/10 rounded-lg p-4 bg-black/25">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white/60">For {row.source.displayName} (@{row.source.handle})</p>
                  <p className="font-medium text-white/90">
                    Recommend {row.candidate.displayName} (@{row.candidate.handle})
                  </p>
                  <p className="text-sm text-white/60">Score {row.score} | Rank #{row.rank}</p>
                </div>
                <span className="text-xs uppercase tracking-[0.12em] text-white/50">{row.status}</span>
              </div>

              <ul className="mt-2 space-y-1 text-sm text-white/75">
                {row.whyMatched.map((line, index) => (
                  <li key={`${row.id}-${index}`}>- {line}</li>
                ))}
              </ul>

              {status === 'pending_review' && (
                <div className="mt-3 flex gap-2">
                  <button
                    disabled={isSaving}
                    onClick={() => handleDecision(row.id, 'approve')}
                    className="px-3 py-1 text-xs rounded border border-[#7FFF00]/40 text-[#c9ff87] bg-[#7FFF00]/10 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={() => handleDecision(row.id, 'reject')}
                    className="px-3 py-1 text-xs rounded border border-white/25 text-white/70 bg-white/5 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}

          {rows.length === 0 && <p className="text-sm text-white/60">No recommendations in this queue yet.</p>}
        </div>
      </section>

      {message && <p className="text-sm text-white/75">{message}</p>}
    </div>
  );
}
