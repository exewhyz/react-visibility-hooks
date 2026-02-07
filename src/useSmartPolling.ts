import { useState, useEffect, useRef, useCallback } from "react";
import { useDocVisible } from "./useDocVisible";

interface SmartPollingOptions {
  interval?: number;
  enabled?: boolean;
}

interface SmartPollingResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  refetch: () => void;
}

export function useSmartPolling<T = any>(
  fetchFn: () => Promise<T>,
  options?: SmartPollingOptions,
): SmartPollingResult<T> {
  const { interval = 5000, enabled = true } = options ?? {};
  const visible = useDocVisible();
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const fetchRef = useRef(fetchFn);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );
  const isFetchingRef = useRef(false);
  const lastJsonRef = useRef<string | undefined>(undefined);

  fetchRef.current = fetchFn;

  const execute = useCallback(async () => {
    // Prevent concurrent fetches from overlapping intervals
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const result = await fetchRef.current();

      // Only update state if data actually changed (avoids unnecessary re-renders)
      const json = JSON.stringify(result);
      if (json !== lastJsonRef.current) {
        lastJsonRef.current = json;
        setData(result);
      }
      setError((prev) => (prev !== undefined ? undefined : prev));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      isFetchingRef.current = false;
      setIsLoading((prev) => (prev ? false : prev));
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!enabled) return;
    execute();
  }, [enabled, execute]);

  // Polling — only when visible and enabled
  useEffect(() => {
    if (!enabled || !visible) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(execute, interval);
    return () => clearInterval(timerRef.current);
  }, [visible, enabled, interval, execute]);

  return { data, isLoading, isError: !!error, error, refetch: execute };
}
