import { renderHook, act, waitFor } from "@testing-library/react";
import { useNetworkAwarePolling } from "../src/useNetworkAwarePolling";

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    value: state,
    configurable: true,
    writable: true,
  });
}

function setOnline(value: boolean) {
  Object.defineProperty(navigator, "onLine", {
    value,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  setVisibility("visible");
  setOnline(true);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useNetworkAwarePolling", () => {
  it("performs initial fetch and returns data with isOnline", async () => {
    const fetchFn = jest.fn().mockResolvedValue({ ok: true });
    const { result } = renderHook(() =>
      useNetworkAwarePolling(fetchFn, { interval: 3000 }),
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ ok: true });
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.effectiveInterval).toBe(3000);
  });

  it("pauses polling when browser goes offline", async () => {
    const fetchFn = jest.fn().mockResolvedValue("ok");
    renderHook(() => useNetworkAwarePolling(fetchFn, { interval: 1000 }));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    await waitFor(() => {
      expect(fetchFn).toHaveBeenCalled();
    });

    const callsBefore = fetchFn.mock.calls.length;

    // Go offline
    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event("offline"));
    });

    await act(async () => {
      await jest.advanceTimersByTimeAsync(5000);
    });

    // No additional calls while offline
    expect(fetchFn.mock.calls.length).toBe(callsBefore);
  });

  it("resumes polling when browser comes back online", async () => {
    const fetchFn = jest.fn().mockResolvedValue("ok");
    const { result } = renderHook(() =>
      useNetworkAwarePolling(fetchFn, { interval: 1000 }),
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    // Go offline
    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current.isOnline).toBe(false);

    // Go back online
    await act(async () => {
      setOnline(true);
      window.dispatchEvent(new Event("online"));
    });

    // Flush async fetch triggered by going online
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    expect(result.current.isOnline).toBe(true);
  });

  it("respects pauseOffline=false to continue polling offline", async () => {
    const fetchFn = jest.fn().mockResolvedValue("ok");
    renderHook(() =>
      useNetworkAwarePolling(fetchFn, {
        interval: 1000,
        pauseOffline: false,
      }),
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    const callsWhenOnline = fetchFn.mock.calls.length;

    await act(async () => {
      setOnline(false);
      window.dispatchEvent(new Event("offline"));
    });

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });

    // Should have continued polling
    expect(fetchFn.mock.calls.length).toBeGreaterThan(callsWhenOnline);
  });

  it("exposes effectiveInterval matching the base interval on fast connections", async () => {
    const fetchFn = jest.fn().mockResolvedValue("ok");
    const { result, unmount } = renderHook(() =>
      useNetworkAwarePolling(fetchFn, { interval: 5000 }),
    );

    expect(result.current.effectiveInterval).toBe(5000);

    // Flush the initial async fetch to avoid act() leak
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    unmount();
  });
});
