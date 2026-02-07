import { useCallback, useEffect, useState } from "react";

/**
 * Returns `true` when the page is visible, `false` when hidden.
 * SSR-safe — defaults to `true` on the server.
 */
export function useDocVisible(): boolean {
  const [visible, setVisible] = useState(() =>
    typeof document === "undefined" ? true : document.visibilityState === "visible",
  );

  const handler = useCallback(() => {
    setVisible(document.visibilityState === "visible");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Sync in case value changed between SSR hydration and effect
    handler();

    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [handler]);

  return visible;
}
