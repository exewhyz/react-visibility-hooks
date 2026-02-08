import { renderHook, act } from "@testing-library/react";
import { usePageFocusEffect } from "../src/usePageFocusEffect";

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    value: state,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  setVisibility("visible");
});

afterEach(() => {
  setVisibility("visible");
});

describe("usePageFocusEffect", () => {
  it("does not fire callbacks on initial mount", () => {
    const onVisible = jest.fn();
    const onHidden = jest.fn();

    renderHook(() => usePageFocusEffect({ onVisible, onHidden }));

    expect(onVisible).not.toHaveBeenCalled();
    expect(onHidden).not.toHaveBeenCalled();
  });

  it("fires onHidden when tab becomes hidden", () => {
    const onHidden = jest.fn();

    renderHook(() => usePageFocusEffect({ onHidden }));

    act(() => {
      setVisibility("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(onHidden).toHaveBeenCalledTimes(1);
  });

  it("fires onVisible when tab becomes visible after being hidden", () => {
    const onVisible = jest.fn();

    renderHook(() => usePageFocusEffect({ onVisible }));

    // Hide first
    act(() => {
      setVisibility("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // Then show
    act(() => {
      setVisibility("visible");
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(onVisible).toHaveBeenCalledTimes(1);
  });

  it("calls cleanup returned by onVisible before next onVisible", () => {
    const cleanup = jest.fn();
    const onVisible = jest.fn().mockReturnValue(cleanup);

    renderHook(() => usePageFocusEffect({ onVisible }));

    // Hide → show (first transition)
    act(() => {
      setVisibility("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    act(() => {
      setVisibility("visible");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(onVisible).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    // Hide → show (second transition)
    act(() => {
      setVisibility("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    act(() => {
      setVisibility("visible");
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(onVisible).toHaveBeenCalledTimes(2);
  });

  it("calls cleanup on unmount", () => {
    const cleanup = jest.fn();
    const onVisible = jest.fn().mockReturnValue(cleanup);

    const { unmount } = renderHook(() => usePageFocusEffect({ onVisible }));

    // Trigger a transition so cleanup is registered
    act(() => {
      setVisibility("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    act(() => {
      setVisibility("visible");
      document.dispatchEvent(new Event("visibilitychange"));
    });

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("handles onVisible returning void (no cleanup)", () => {
    const onVisible = jest.fn(); // returns undefined

    renderHook(() => usePageFocusEffect({ onVisible }));

    act(() => {
      setVisibility("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    act(() => {
      setVisibility("visible");
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(onVisible).toHaveBeenCalledTimes(1);
  });

  it("does not fire onVisible without a preceding hidden state", () => {
    const onVisible = jest.fn();

    renderHook(() => usePageFocusEffect({ onVisible }));

    // Dispatch visible → visible (no real transition)
    act(() => {
      setVisibility("visible");
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(onVisible).not.toHaveBeenCalled();
  });
});
