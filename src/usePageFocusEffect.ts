import { useEffect, useRef } from "react";
import { useDocVisible } from "./useDocVisible";

export interface PageFocusEffectOptions {
  /** Callback fired when the page transitions from hidden → visible. May return a cleanup function. */
  onVisible?: () => void | (() => void);
  /** Callback fired when the page transitions from visible → hidden. */
  onHidden?: () => void;
}

/**
 * Runs side-effect callbacks on visibility **transitions** rather than
 * on every render.
 *
 * - `onVisible` fires when the tab goes from hidden → visible.
 * - `onHidden` fires when the tab goes from visible → hidden.
 * - The very first render is **not** treated as a transition.
 * - `onVisible` may return a cleanup function (like `useEffect`).
 *
 * SSR-safe — no-ops on the server.
 *
 * @example
 * ```tsx
 * usePageFocusEffect({
 *   onVisible: () => { refetchStaleData(); },
 *   onHidden:  () => { saveScrollPosition(); },
 * });
 * ```
 */
export function usePageFocusEffect(options: PageFocusEffectOptions): void {
  const visible = useDocVisible();
  const prevRef = useRef<boolean | undefined>(undefined);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  // Keep latest callbacks in refs to avoid re-triggering the effect
  const onVisibleRef = useRef(options.onVisible);
  const onHiddenRef = useRef(options.onHidden);
  onVisibleRef.current = options.onVisible;
  onHiddenRef.current = options.onHidden;

  useEffect(() => {
    // Skip the initial mount — only fire on actual transitions
    if (prevRef.current === undefined) {
      prevRef.current = visible;
      return;
    }

    if (visible && !prevRef.current) {
      // hidden → visible
      cleanupRef.current?.();
      cleanupRef.current = undefined;
      const result = onVisibleRef.current?.();
      if (typeof result === "function") {
        cleanupRef.current = result;
      }
    } else if (!visible && prevRef.current) {
      // visible → hidden
      onHiddenRef.current?.();
    }

    prevRef.current = visible;
  }, [visible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);
}
