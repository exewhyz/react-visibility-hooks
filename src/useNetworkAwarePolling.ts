import { useState, useEffect, useCallback } from "react";
import { useSmartPolling } from "./useSmartPolling";
import type { SmartPollingOptions, SmartPollingResult } from "./useSmartPolling";

export interface NetworkAwarePollingOptions extends SmartPollingOptions {
  /** Multiplier applied to `interval` on slow connections like 2g (default `3`). */
  slowMultiplier?: number;
  /** Whether to pause polling when the browser is offline (default `true`). */
  pauseOffline?: boolean;
}

export interface NetworkAwarePollingResult<T> extends SmartPollingResult<T> {
  /** `true` when the browser reports being online. */
  isOnline: boolean;
  /** The effective polling interval after network-quality adjustment. */
  effectiveInterval: number;
}

/**
 * Network + visibility-aware polling.
 *
 * Extends `useSmartPolling` with:
 * - Automatic pause when the browser goes offline.
 * - Adaptive interval — polls slower on poor connections (2g / slow-2g).
 *
 * SSR-safe — defaults to online on the server.
 *
 * @param fetchFn - Async function that returns data.
 * @param options - Optional configuration.
 */
export function useNetworkAwarePolling<T = unknown>(
  fetchFn: () => Promise<T>,
  options?: NetworkAwarePollingOptions,
): NetworkAwarePollingResult<T> {
  const {
    interval = 5000,
    enabled = true,
    slowMultiplier = 3,
    pauseOffline = true,
    ...rest
  } = options ?? {};

  const online = useOnline();
  const effectiveInterval = getEffectiveInterval(interval, slowMultiplier);

  const shouldPoll = pauseOffline ? enabled && online : enabled;

  const result = useSmartPolling(fetchFn, {
    ...rest,
    interval: effectiveInterval,
    enabled: shouldPoll,
  });

  return { ...result, isOnline: online, effectiveInterval };
}

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

/** SSR-safe hook that tracks `navigator.onLine`. */
function useOnline(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  const handleOnline = useCallback(() => setOnline(true), []);
  const handleOffline = useCallback(() => setOnline(false), []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return online;
}

/** Returns a longer interval when the connection is slow. */
function getEffectiveInterval(base: number, multiplier: number): number {
  if (typeof navigator === "undefined") return base;

  const conn = (
    navigator as Navigator & {
      connection?: { effectiveType?: string };
    }
  ).connection;

  if (conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") {
    return base * multiplier;
  }
  return base;
}
