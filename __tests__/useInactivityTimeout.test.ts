import { renderHook, act } from "@testing-library/react";
import { useInactivityTimeout } from "../src/useInactivityTimeout";

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

describe("useInactivityTimeout", () => {
  it("starts in non-idle, non-warning, non-timed-out state", () => {
    const { result } = renderHook(() =>
      useInactivityTimeout({ timeout: 10_000, warningBefore: 5_000 }),
    );

    expect(result.current.idle).toBe(false);
    expect(result.current.isWarning).toBe(false);
    expect(result.current.isTimedOut).toBe(false);
    expect(result.current.remainingSeconds).toBe(-1);
  });

  it("enters warning phase after idle threshold", () => {
    const onWarning = jest.fn();
    const { result } = renderHook(() =>
      useInactivityTimeout({
        timeout: 10_000,
        warningBefore: 5_000,
        onWarning,
      }),
    );

    // idle threshold = 10_000 - 5_000 = 5_000
    act(() => {
      jest.advanceTimersByTime(5_001);
    });

    expect(result.current.idle).toBe(true);

    // The countdown interval needs a tick to set remaining
    act(() => {
      jest.advanceTimersByTime(1_000);
    });

    expect(result.current.isWarning).toBe(true);
    expect(result.current.isTimedOut).toBe(false);
    expect(onWarning).toHaveBeenCalledTimes(1);
  });

  it("fires onTimeout after full timeout", () => {
    const onTimeout = jest.fn();
    const { result } = renderHook(() =>
      useInactivityTimeout({
        timeout: 10_000,
        warningBefore: 5_000,
        onTimeout,
      }),
    );

    // Become idle (5s idle threshold)
    act(() => {
      jest.advanceTimersByTime(5_001);
    });

    // Wait another 5 seconds for the warning countdown to finish
    act(() => {
      jest.advanceTimersByTime(6_000);
    });

    expect(result.current.isTimedOut).toBe(true);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("remainingSeconds counts down during warning phase", () => {
    const { result } = renderHook(() =>
      useInactivityTimeout({
        timeout: 6_000,
        warningBefore: 3_000,
      }),
    );

    // idle threshold = 3000
    act(() => {
      jest.advanceTimersByTime(3_001);
    });

    // After 1 second of the warning phase
    act(() => {
      jest.advanceTimersByTime(1_000);
    });

    expect(result.current.remainingSeconds).toBeGreaterThanOrEqual(1);
    expect(result.current.remainingSeconds).toBeLessThanOrEqual(3);
  });

  it("resets when user becomes active again", () => {
    const { result } = renderHook(() =>
      useInactivityTimeout({
        timeout: 6_000,
        warningBefore: 3_000,
      }),
    );

    // Become idle
    act(() => {
      jest.advanceTimersByTime(3_001);
    });
    expect(result.current.idle).toBe(true);

    // User interaction resets idle via useIdleVisibility
    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });

    expect(result.current.idle).toBe(false);
    expect(result.current.isWarning).toBe(false);
    expect(result.current.remainingSeconds).toBe(-1);
  });

  it("resetTimer manually clears the timeout state", () => {
    const { result } = renderHook(() =>
      useInactivityTimeout({
        timeout: 4_000,
        warningBefore: 2_000,
      }),
    );

    // Become idle
    act(() => {
      jest.advanceTimersByTime(2_001);
    });

    // The countdown interval needs a tick to set remaining
    act(() => {
      jest.advanceTimersByTime(1_000);
    });

    expect(result.current.isWarning).toBe(true);

    act(() => {
      result.current.resetTimer();
    });

    expect(result.current.isTimedOut).toBe(false);
    expect(result.current.remainingSeconds).toBe(-1);
  });

  it("clamps warningBefore to never exceed timeout", () => {
    const onTimeout = jest.fn();
    const { result } = renderHook(() =>
      useInactivityTimeout({
        timeout: 3_000,
        warningBefore: 10_000, // larger than timeout
        onTimeout,
      }),
    );

    // With clamping, idleThreshold = 0, so idle almost immediately
    // useIdleVisibility fires at timeout=0, then countdown = 3s
    // Need enough time for idle detection + countdown
    act(() => {
      jest.advanceTimersByTime(1);
    });

    // Let the countdown run
    act(() => {
      jest.advanceTimersByTime(4_000);
    });

    expect(onTimeout).toHaveBeenCalled();
    expect(result.current.isTimedOut).toBe(true);
  });
});
