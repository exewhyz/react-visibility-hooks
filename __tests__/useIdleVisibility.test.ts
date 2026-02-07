import { renderHook, act } from "@testing-library/react";
import { useIdleVisibility } from "../src/useIdleVisibility";

beforeEach(() => {
  jest.useFakeTimers();
  Object.defineProperty(document, "visibilityState", {
    value: "visible",
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useIdleVisibility", () => {
  it("starts as not idle", () => {
    const { result } = renderHook(() => useIdleVisibility(1000));
    expect(result.current.idle).toBe(false);
    expect(result.current.visible).toBe(true);
  });

  it("becomes idle after timeout", () => {
    const { result } = renderHook(() => useIdleVisibility(1000));

    act(() => {
      jest.advanceTimersByTime(1001);
    });

    expect(result.current.idle).toBe(true);
  });

  it("resets idle on user interaction", () => {
    const { result } = renderHook(() => useIdleVisibility(1000));

    act(() => {
      jest.advanceTimersByTime(900);
    });
    expect(result.current.idle).toBe(false);

    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });

    act(() => {
      jest.advanceTimersByTime(900);
    });
    expect(result.current.idle).toBe(false);

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current.idle).toBe(true);
  });

  it("resets idle on keydown", () => {
    const { result } = renderHook(() => useIdleVisibility(1000));

    act(() => {
      jest.advanceTimersByTime(999);
    });

    act(() => {
      window.dispatchEvent(new Event("keydown"));
    });

    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(result.current.idle).toBe(false);
  });

  it("cleans up listeners on unmount", () => {
    const spy = jest.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useIdleVisibility(1000));
    unmount();
    expect(spy).toHaveBeenCalledWith("mousemove", expect.any(Function));
    expect(spy).toHaveBeenCalledWith("keydown", expect.any(Function));
    spy.mockRestore();
  });
});
