import { useState, useEffect, useRef, useCallback } from "react";
import { useIdleVisibility } from "./useIdleVisibility";

export interface InactivityTimeoutOptions {
  /** Total inactivity before `onTimeout` fires, in ms (default `300_000` — 5 min). */
  timeout?: number;
  /**
   * How long before the final timeout to enter the "warning" phase, in ms
   * (default `60_000` — 1 min).
   *
   * Set to `0` to disable the warning phase.
   */
  warningBefore?: number;
  /** Called once when the full timeout elapses. */
  onTimeout?: () => void;
  /** Called when entering the warning phase. */
  onWarning?: () => void;
}

export interface InactivityTimeoutResult {
  /** `true` once the user has been idle long enough to start counting down. */
  idle: boolean;
  /** Current page-visibility state. */
  visible: boolean;
  /** `true` during the warning countdown (before final timeout). */
  isWarning: boolean;
  /** `true` after the full timeout has elapsed. */
  isTimedOut: boolean;
  /** Seconds remaining until timeout (`-1` when the user is not idle). */
  remainingSeconds: number;
  /** Manually reset the timer and cancel any pending timeout. */
  resetTimer: () => void;
}

/**
 * Countdown-based session/inactivity manager built on top of
 * `useIdleVisibility`.
 *
 * 1. After `timeout - warningBefore` ms of inactivity the hook enters
 *    the **warning** phase and starts a per-second countdown.
 * 2. When the countdown hits zero `onTimeout` fires and `isTimedOut`
 *    becomes `true`.
 * 3. Any user interaction resets the timer.
 *
 * SSR-safe — all timers only run in the browser.
 */
export function useInactivityTimeout(
  options?: InactivityTimeoutOptions,
): InactivityTimeoutResult {
  const {
    timeout = 300_000,
    warningBefore = 60_000,
    onTimeout,
    onWarning,
  } = options ?? {};

  // Clamp so warningBefore never exceeds timeout
  const clampedWarning = Math.min(warningBefore, timeout);
  const idleThreshold = timeout - clampedWarning;

  const { idle, visible } = useIdleVisibility(idleThreshold);

  const [remaining, setRemaining] = useState(-1);
  const [timedOut, setTimedOut] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const startRef = useRef<number | undefined>(undefined);
  const warnedRef = useRef(false);

  // Keep callback refs stable
  const onTimeoutRef = useRef(onTimeout);
  const onWarningRef = useRef(onWarning);
  onTimeoutRef.current = onTimeout;
  onWarningRef.current = onWarning;

  const clear = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = undefined;
    startRef.current = undefined;
    warnedRef.current = false;
    setRemaining(-1);
    setTimedOut(false);
  }, []);

  useEffect(() => {
    if (!idle || timedOut) {
      if (!idle) clear();
      return;
    }

    startRef.current = Date.now();

    // Fire the warning callback once at the start of the countdown
    if (!warnedRef.current) {
      warnedRef.current = true;
      onWarningRef.current?.();
    }

    const warningMs = clampedWarning;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (startRef.current ?? Date.now());
      const left = Math.max(0, Math.ceil((warningMs - elapsed) / 1000));
      setRemaining(left);

      if (left <= 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
        setTimedOut(true);
        onTimeoutRef.current?.();
      }
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    };
  }, [idle, timedOut, clampedWarning, clear]);

  const isWarning = idle && !timedOut && remaining >= 0;

  return {
    idle: idle || timedOut,
    visible,
    isWarning,
    isTimedOut: timedOut,
    remainingSeconds: remaining,
    resetTimer: clear,
  };
}
