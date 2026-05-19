import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Run an async fetcher on an interval, with these behaviors:
 *   - Skips ticks while the document is hidden
 *   - Immediate refetch on visibility/focus restore
 *   - Cancels stale results when inputs change (only the latest run can set state)
 *   - Exposes a manual refetch() for optimistic flows (e.g. after sending a message)
 *
 * `enabled=false` disables polling entirely and clears data. Pass a stable
 * fetcher (memoized with useCallback at the call site).
 */
export function usePolledQuery<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  enabled = true,
): { data: T | null; error: string | null; loading: boolean; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const runIdRef = useRef(0);

  const run = useCallback(async () => {
    if (!enabled) return;
    const myRun = ++runIdRef.current;
    setLoading(true);
    try {
      const result = await fetcher();
      if (myRun === runIdRef.current) {
        setData(result);
        setError(null);
      }
    } catch (e) {
      if (myRun === runIdRef.current) {
        setError(e instanceof Error ? e.message : 'Request failed');
      }
    } finally {
      if (myRun === runIdRef.current) setLoading(false);
    }
  }, [fetcher, enabled]);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setError(null);
      return;
    }
    void run();
    const tick = () => {
      if (document.visibilityState === 'visible') void run();
    };
    const id = window.setInterval(tick, intervalMs);
    const onFocus = () => { void run(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [run, intervalMs, enabled]);

  return { data, error, loading, refetch: run };
}
