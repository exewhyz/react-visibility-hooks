import { useState, useEffect, useCallback } from "react";

export interface BatteryState {
  /** `true` when the device is plugged in. Defaults to `true` (optimistic). */
  charging: boolean;
  /** Battery level between 0 and 1. Defaults to `1`. */
  level: number;
  /** `true` when the device is **not** charging and `level` is below `lowThreshold`. */
  isLowBattery: boolean;
  /** `true` when the Battery Status API is available. */
  isSupported: boolean;
}

interface BatteryManager extends EventTarget {
  charging: boolean;
  level: number;
}

/**
 * Exposes device battery status via the
 * [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API).
 *
 * Use cases:
 * - Reduce polling frequency on low battery.
 * - Disable animations / heavy computations when the battery is low.
 * - Show a battery-aware UI indicator.
 *
 * SSR-safe — returns optimistic defaults on the server.
 *
 * @param lowThreshold - Level (0–1) below which `isLowBattery` becomes `true`
 *                       when the device is not charging (default `0.15`).
 */
export function useBatteryAware(lowThreshold = 0.15): BatteryState {
  const [state, setState] = useState<BatteryState>({
    charging: true,
    level: 1,
    isLowBattery: false,
    isSupported: false,
  });

  const update = useCallback(
    (battery: BatteryManager) => {
      setState({
        charging: battery.charging,
        level: battery.level,
        isLowBattery: !battery.charging && battery.level < lowThreshold,
        isSupported: true,
      });
    },
    [lowThreshold],
  );

  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      typeof (navigator as Navigator & { getBattery?: unknown }).getBattery !== "function"
    ) {
      return;
    }

    let battery: BatteryManager | undefined;
    let cancelled = false;

    const onChange = () => {
      if (battery && !cancelled) update(battery);
    };

    (navigator as Navigator & { getBattery: () => Promise<BatteryManager> })
      .getBattery()
      .then((b) => {
        if (cancelled) return;
        battery = b;
        update(b);
        b.addEventListener("chargingchange", onChange);
        b.addEventListener("levelchange", onChange);
      })
      .catch(() => {
        // API exists but call failed — leave defaults
      });

    return () => {
      cancelled = true;
      if (battery) {
        battery.removeEventListener("chargingchange", onChange);
        battery.removeEventListener("levelchange", onChange);
      }
    };
  }, [update]);

  return state;
}
