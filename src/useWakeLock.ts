import { useState, useCallback, useEffect, useRef } from "react";
import { useDocVisible } from "./useDocVisible";

export interface WakeLockResult {
  /** `true` while a Wake Lock is actively held. */
  isActive: boolean;
  /** Request the screen Wake Lock. No-ops if unsupported. */
  request: () => Promise<void>;
  /** Release the current Wake Lock. */
  release: () => Promise<void>;
  /** `true` when the Screen Wake Lock API is available in this browser. */
  isSupported: boolean;
}

/**
 * Manages the [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
 * to prevent the screen from dimming or locking.
 *
 * Features:
 * - Automatic re-acquire on tab re-focus when `autoReacquire` is `true`.
 * - Cleans up the Wake Lock on unmount.
 * - SSR-safe — `isSupported` will be `false` on the server.
 *
 * @param autoReacquire - Re-request the lock when the tab becomes visible
 *                        again after being hidden (default `true`).
 */
export function useWakeLock(autoReacquire = true): WakeLockResult {
  const visible = useDocVisible();
  const [isActive, setIsActive] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | undefined>(undefined);
  const wantedRef = useRef(false);

  const isSupported = typeof navigator !== "undefined" && navigator.wakeLock != null;

  const request = useCallback(async () => {
    if (!isSupported) return;
    // Already holding a lock — skip
    if (sentinelRef.current && !sentinelRef.current.released) return;

    try {
      const sentinel = await navigator.wakeLock.request("screen");
      sentinelRef.current = sentinel;
      wantedRef.current = true;
      setIsActive(true);

      sentinel.addEventListener("release", () => {
        setIsActive(false);
        sentinelRef.current = undefined;
      });
    } catch {
      // Permission denied, low battery, or other platform error
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    wantedRef.current = false;
    if (sentinelRef.current && !sentinelRef.current.released) {
      await sentinelRef.current.release();
    }
  }, []);

  // Re-acquire on tab visibility change
  useEffect(() => {
    if (autoReacquire && visible && wantedRef.current && !sentinelRef.current) {
      void request();
    }
  }, [visible, autoReacquire, request]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sentinelRef.current && !sentinelRef.current.released) {
        sentinelRef.current.release().catch(() => {});
      }
    };
  }, []);

  return { isActive, request, release, isSupported };
}
