import { useState, useEffect, useRef, useCallback } from "react";
import { useDocVisible } from "./useDocVisible";

export interface SmartPollingOptions {
  /** Polling interval in ms (default `5000`) */
  interval?: number;
  /** Enable / disable polling (default `true`). The initial fetch always fires. */
  enabled?: boolean;
}

export interface SmartPollingResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  /** Manually trigger a fetch */
  refetch: () => Promise<void>;
}

/**
 * Visibility-aware polling hook.
 *
 * - Pauses when the tab is hidden.
 * - Skips re-renders when data hasn't changed (shallow JSON comparison).
 * - Prevents overlapping fetches.
 *
 * @param fetchFn - Async function that returns data.
 * @param options - Optional configuration.
 */
export function useSmartPolling<T = unknown>(
  fetchFn: () => Promise<T>,
  options?: SmartPollingOptions,
): SmartPollingResult<T> {
  const { interval = 5000, enabled = true } = options ?? {};
  const visible = useDocVisible();

  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  const fetchRef = useRef(fetchFn);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const isFetchingRef = useRef(false);
  const lastJsonRef = useRef<string | undefined>(undefined);
  const mountedRef = useRef(true);

  // Always keep the latest fetchFn
  fetchRef.current = fetchFn;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const result = await fetchRef.current();
      if (!mountedRef.current) return;

      const json = JSON.stringify(result);
      if (json !== lastJsonRef.current) {
        lastJsonRef.current = json;
        setData(result);
      }
      setError((prev) => (prev !== undefined ? undefined : prev));
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      isFetchingRef.current = false;
      if (mountedRef.current) {
        setIsLoading((prev) => (prev ? false : prev));
      }
    }
  }, []);

  // Initial fetch — always runs once regardless of `enabled`
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    execute();
  }, [execute]);

  // Polling — only when visible AND enabled
  useEffect(() => {
    if (!enabled || !visible) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
      return;
    }

    // Immediately fetch when re-enabled / tab returns
    execute();

    timerRef.current = setInterval(execute, interval);
    return () => {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    };
  }, [visible, enabled, interval, execute]);

  return {
    data,
    isLoading,
    isError: error !== undefined,
    error,
    refetch: execute,
  };
}
