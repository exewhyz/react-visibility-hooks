import { renderHook, act } from "@testing-library/react";
import { useDocVisible } from "../src/useDocVisible";

test("visibility changes", () => {
  Object.defineProperty(document, "visibilityState", {
    value: "visible",
    configurable: true
  });

  const { result } = renderHook(() => useDocVisible());
  expect(result.current).toBe(true);

  act(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  expect(result.current).toBe(false);
});
