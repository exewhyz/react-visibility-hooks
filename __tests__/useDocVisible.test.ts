import { renderHook, act } from "@testing-library/react";
import { useDocVisible } from "../src/useDocVisible";

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    value: state,
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  setVisibility("visible");
});

describe("useDocVisible", () => {
  it("returns true when document is visible", () => {
    setVisibility("visible");
    const { result } = renderHook(() => useDocVisible());
    expect(result.current).toBe(true);
  });

  it("returns false when document is hidden", () => {
    setVisibility("hidden");
    const { result } = renderHook(() => useDocVisible());
    expect(result.current).toBe(false);
  });

  it("reacts to visibilitychange events", () => {
    setVisibility("visible");
    const { result } = renderHook(() => useDocVisible());
    expect(result.current).toBe(true);

    act(() => {
      setVisibility("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe(false);

    act(() => {
      setVisibility("visible");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe(true);
  });

  it("cleans up event listener on unmount", () => {
    const spy = jest.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() => useDocVisible());
    unmount();
    expect(spy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    spy.mockRestore();
  });
});
