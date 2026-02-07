import { renderHook, act, waitFor } from "@testing-library/react";
import { useSmartPolling } from "../src/useSmartPolling";

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    value: state,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  setVisibility("visible");
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useSmartPolling", () => {
  it("performs initial fetch and returns data", async () => {
    const fetchFn = jest.fn().mockResolvedValue({ count: 1 });
    const { result } = renderHook(() => useSmartPolling(fetchFn, { interval: 5000 }));

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ count: 1 });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("handles fetch errors", async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useSmartPolling(fetchFn));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Network error");
  });

  it("stops polling when disabled", async () => {
    const fetchFn = jest.fn().mockResolvedValue("ok");
    renderHook(() => useSmartPolling(fetchFn, { enabled: false, interval: 1000 }));

    // Initial fetch fires
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    await waitFor(() => {
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await jest.advanceTimersByTimeAsync(5000);
    });

    // No more calls since disabled
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("polls at the given interval", async () => {
    const fetchFn = jest.fn().mockResolvedValue("ok");
    renderHook(() => useSmartPolling(fetchFn, { interval: 1000 }));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    // Wait for initial + on-visible trigger
    await waitFor(() => {
      expect(fetchFn.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    const callsBefore = fetchFn.mock.calls.length;

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1000);
    });

    expect(fetchFn.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it("exposes a refetch function", async () => {
    let counter = 0;
    const fetchFn = jest.fn().mockImplementation(() => Promise.resolve(++counter));
    const { result } = renderHook(() => useSmartPolling(fetchFn, { interval: 10000 }));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    await waitFor(() => {
      expect(result.current.data).toBe(1);
    });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toBe(2);
    });
  });

  it("handles non-Error thrown values", async () => {
    const fetchFn = jest.fn().mockRejectedValue("string error");
    const { result } = renderHook(() => useSmartPolling(fetchFn));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("string error");
  });
});
