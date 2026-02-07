import { useEffect, useRef, useState, useCallback } from "react";
import { useDocVisible } from "./useDocVisible";

export interface IdleVisibilityResult {
  /** Whether the page is visible */
  visible: boolean;
  /** Whether the user is idle (no interaction for `timeout` ms) */
  idle: boolean;
}

/**
 * Combines page-visibility with idle detection.
 *
 * @param timeout - Milliseconds of inactivity before the user is
 *                  considered idle (default `60_000`).
 */
export function useIdleVisibility(timeout = 60_000): IdleVisibilityResult {
  const visible = useDocVisible();
  const [idle, setIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const reset = useCallback(() => {
    setIdle(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIdle(true), timeout);
  }, [timeout]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "keydown",
      "pointerdown",
      "scroll",
      "touchstart",
    ];

    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearTimeout(timerRef.current);
    };
  }, [reset]);

  // Reset idle timer when tab becomes visible again
  useEffect(() => {
    if (visible) reset();
  }, [visible, reset]);

  return { visible, idle };
}
