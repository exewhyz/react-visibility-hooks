import { renderHook, act } from "@testing-library/react";
import { useWakeLock } from "../src/useWakeLock";

// ---- Wake Lock API mock ----
const mockRelease = jest.fn().mockResolvedValue(undefined);
let releaseHandler: (() => void) | undefined;
const mockSentinel = {
  released: false,
  release: () => {
    mockSentinel.released = true;
    mockRelease();
    releaseHandler?.();
    return Promise.resolve();
  },
  addEventListener: (_event: string, handler: () => void) => {
    releaseHandler = handler;
  },
  removeEventListener: jest.fn(),
};

function installWakeLockMock(shouldReject = false) {
  Object.defineProperty(navigator, "wakeLock", {
    value: {
      request: shouldReject
        ? jest.fn().mockRejectedValue(new Error("denied"))
        : jest.fn().mockImplementation(() => {
            mockSentinel.released = false;
            return Promise.resolve(mockSentinel);
          }),
    },
    configurable: true,
    writable: true,
  });
}

function removeWakeLockMock() {
  Object.defineProperty(navigator, "wakeLock", {
    value: undefined,
    configurable: true,
    writable: true,
  });
}

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    value: state,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  mockRelease.mockClear();
  releaseHandler = undefined;
  mockSentinel.released = false;
  installWakeLockMock();
  setVisibility("visible");
});

afterEach(() => {
  removeWakeLockMock();
});

describe("useWakeLock", () => {
  it("reports isSupported correctly", () => {
    const { result } = renderHook(() => useWakeLock());
    expect(result.current.isSupported).toBe(true);
  });

  it("reports isSupported=false when API is unavailable", () => {
    removeWakeLockMock();
    const { result } = renderHook(() => useWakeLock());
    expect(result.current.isSupported).toBe(false);
  });

  it("request() activates the wake lock", async () => {
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.isActive).toBe(true);
  });

  it("release() deactivates the wake lock", async () => {
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });
    expect(result.current.isActive).toBe(true);

    await act(async () => {
      await result.current.release();
    });
    expect(result.current.isActive).toBe(false);
  });

  it("handles permission denied gracefully", async () => {
    installWakeLockMock(true);
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.isActive).toBe(false);
  });

  it("re-acquires wake lock on tab visibility if autoReacquire is true", async () => {
    const { result } = renderHook(() => useWakeLock(true));

    // Request and activate
    await act(async () => {
      await result.current.request();
    });
    expect(result.current.isActive).toBe(true);

    // Simulate the browser releasing the lock when tab is hidden
    act(() => {
      mockSentinel.release();
      setVisibility("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // Tab back
    await act(async () => {
      setVisibility("visible");
      document.dispatchEvent(new Event("visibilitychange"));
      // Wait for the async re-acquire
      await Promise.resolve();
    });

    expect(result.current.isActive).toBe(true);
  });

  it("does not re-acquire when autoReacquire is false", async () => {
    const { result } = renderHook(() => useWakeLock(false));

    await act(async () => {
      await result.current.request();
    });

    // Simulate release on hide
    act(() => {
      mockSentinel.release();
      setVisibility("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await act(async () => {
      setVisibility("visible");
      document.dispatchEvent(new Event("visibilitychange"));
      await Promise.resolve();
    });

    // Should remain inactive since autoReacquire is false
    expect(result.current.isActive).toBe(false);
  });

  it("request() is a no-op when API is unsupported", async () => {
    removeWakeLockMock();
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.isActive).toBe(false);
  });
});
