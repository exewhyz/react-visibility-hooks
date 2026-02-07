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

  fetchRef.current = fetchFn;

  const execute = useCallback(async () => {
    try {
      const result = await fetchRef.current();
      setData(result);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!enabled) return;
    setIsLoading(true);
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
