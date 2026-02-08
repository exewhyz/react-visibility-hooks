import { renderHook, act } from "@testing-library/react";
import { useBatteryAware } from "../src/useBatteryAware";

// ---- Battery API mock ----
type BatteryHandler = () => void;
const listeners: Record<string, BatteryHandler[]> = {};

function createMockBattery(charging: boolean, level: number) {
  return {
    charging,
    level,
    addEventListener: (event: string, handler: BatteryHandler) => {
      (listeners[event] ??= []).push(handler);
    },
    removeEventListener: (event: string, handler: BatteryHandler) => {
      listeners[event] = (listeners[event] ?? []).filter((h) => h !== handler);
    },
  };
}

let mockBattery: ReturnType<typeof createMockBattery>;

function installBatteryMock(charging = true, level = 1) {
  mockBattery = createMockBattery(charging, level);
  Object.defineProperty(navigator, "getBattery", {
    value: () => Promise.resolve(mockBattery),
    configurable: true,
    writable: true,
  });
}

function removeBatteryMock() {
  Object.defineProperty(navigator, "getBattery", {
    value: undefined,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  Object.keys(listeners).forEach((k) => delete listeners[k]);
});

afterEach(() => {
  removeBatteryMock();
});

describe("useBatteryAware", () => {
  it("returns default state when API is unavailable", () => {
    removeBatteryMock();
    const { result } = renderHook(() => useBatteryAware());

    expect(result.current).toEqual({
      charging: true,
      level: 1,
      isLowBattery: false,
      isSupported: false,
    });
  });

  it("reads initial battery state", async () => {
    installBatteryMock(true, 0.85);
    const { result } = renderHook(() => useBatteryAware());

    // Wait for the async getBattery() to resolve
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.charging).toBe(true);
    expect(result.current.level).toBe(0.85);
    expect(result.current.isLowBattery).toBe(false);
    expect(result.current.isSupported).toBe(true);
  });

  it("detects low battery when not charging and below threshold", async () => {
    installBatteryMock(false, 0.1);
    const { result } = renderHook(() => useBatteryAware(0.15));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLowBattery).toBe(true);
  });

  it("does not flag low battery when charging", async () => {
    installBatteryMock(true, 0.05);
    const { result } = renderHook(() => useBatteryAware(0.15));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLowBattery).toBe(false);
  });

  it("reacts to chargingchange events", async () => {
    installBatteryMock(true, 0.1);
    const { result } = renderHook(() => useBatteryAware(0.15));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLowBattery).toBe(false);

    // Simulate unplugging
    await act(async () => {
      mockBattery.charging = false;
      listeners["chargingchange"]?.forEach((h) => h());
    });

    expect(result.current.charging).toBe(false);
    expect(result.current.isLowBattery).toBe(true);
  });

  it("reacts to levelchange events", async () => {
    installBatteryMock(false, 0.5);
    const { result } = renderHook(() => useBatteryAware(0.15));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLowBattery).toBe(false);

    await act(async () => {
      mockBattery.level = 0.05;
      listeners["levelchange"]?.forEach((h) => h());
    });

    expect(result.current.level).toBe(0.05);
    expect(result.current.isLowBattery).toBe(true);
  });

  it("supports custom lowThreshold", async () => {
    installBatteryMock(false, 0.25);
    const { result } = renderHook(() => useBatteryAware(0.3));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLowBattery).toBe(true);
  });

  it("cleans up listeners on unmount", async () => {
    installBatteryMock(true, 1);
    const { unmount } = renderHook(() => useBatteryAware());

    await act(async () => {
      await Promise.resolve();
    });

    unmount();

    // Listeners should be removed
    expect(listeners["chargingchange"]?.length ?? 0).toBe(0);
    expect(listeners["levelchange"]?.length ?? 0).toBe(0);
  });
});
