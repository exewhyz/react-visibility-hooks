/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Benchmark: measure re-renders/sec and listener overhead
 * for react-visibility-hooks vs raw useEffect implementations.
 *
 * Run: npx tsx benchmarks/rerenders.bench.ts
 */
import { JSDOM } from "jsdom";

// Bootstrap jsdom before any React imports
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost",
  pretendToBeVisual: true,
});

const domGlobals = [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "MutationObserver",
  "Event",
] as const;
for (const key of domGlobals) {
  Object.defineProperty(globalThis, key, {
    value: (dom.window as any)[key],
    configurable: true,
    writable: true,
  });
}
// React checks for these
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { renderHook, act } from "@testing-library/react";
import { useDocVisible } from "../src/useDocVisible";
import { useIdleVisibility } from "../src/useIdleVisibility";
import { useEffect, useState } from "react";

// ─── Baselines ────────────────────────────────────────────

function useRawVisibility(): boolean {
  const [visible, setVisible] = useState(
    typeof document === "undefined" ? true : document.visibilityState === "visible",
  );

  useEffect(() => {
    const handler = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  return visible;
}

function useRawIdleVisibility(timeout = 60_000) {
  const [visible, setVisible] = useState(true);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), timeout);
    };
    const events = [
      "mousemove",
      "keydown",
      "pointerdown",
      "scroll",
      "touchstart",
    ] as const;
    events.forEach((e) => document.addEventListener(e, reset));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => document.removeEventListener(e, reset));
    };
  }, [timeout]);

  return { visible, idle };
}

// ─── Helpers ──────────────────────────────────────────────

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    value: state,
    configurable: true,
    writable: true,
  });
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

// ─── Re-render throughput ─────────────────────────────────

const TOGGLE_ITERATIONS = 10_000;

async function benchmarkVisibilityToggle(name: string, hookFn: () => unknown) {
  const { unmount } = renderHook(() => hookFn());

  const start = performance.now();
  for (let i = 0; i < TOGGLE_ITERATIONS; i++) {
    act(() => {
      setVisibility(i % 2 === 0 ? "hidden" : "visible");
      document.dispatchEvent(new Event("visibilitychange"));
    });
  }
  const elapsed = performance.now() - start;
  unmount();

  const togglesPerSec = Math.round(TOGGLE_ITERATIONS / (elapsed / 1000));
  const avgMs = elapsed / TOGGLE_ITERATIONS;

  console.log(`  ${name}`);
  console.log(`    ${fmt(TOGGLE_ITERATIONS)} toggles in ${elapsed.toFixed(1)} ms`);
  console.log(
    `    ${fmt(togglesPerSec)} toggles/sec | avg ${avgMs.toFixed(4)} ms/toggle`,
  );

  return { name, elapsed, togglesPerSec, avgMs };
}

// ─── Listener overhead (mount/unmount) ────────────────────

const MOUNT_ITERATIONS = 1_000;

async function benchmarkMountOverhead(name: string, hookFn: () => unknown) {
  const start = performance.now();
  for (let i = 0; i < MOUNT_ITERATIONS; i++) {
    const { unmount } = renderHook(() => hookFn());
    unmount();
  }
  const elapsed = performance.now() - start;

  console.log(`  ${name}`);
  console.log(`    ${fmt(MOUNT_ITERATIONS)} mount/unmount in ${elapsed.toFixed(1)} ms`);
  console.log(`    avg ${(elapsed / MOUNT_ITERATIONS).toFixed(4)} ms/cycle`);

  return { name, elapsed };
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  console.log();
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║   react-visibility-hooks · Performance Bench     ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log();

  // --- Re-render throughput ---
  console.log("── Re-render throughput ──────────────────────────");
  console.log();

  const rawVis = await benchmarkVisibilityToggle(
    "Raw useEffect (visibility)",
    useRawVisibility,
  );
  console.log();
  const hookVis = await benchmarkVisibilityToggle("useDocVisible", useDocVisible);
  console.log();
  const rawIdle = await benchmarkVisibilityToggle("Raw useEffect (idle+vis)", () =>
    useRawIdleVisibility(60_000),
  );
  console.log();
  const hookIdle = await benchmarkVisibilityToggle("useIdleVisibility", () =>
    useIdleVisibility(60_000),
  );
  console.log();

  // --- Listener overhead ---
  console.log("── Listener registration overhead ────────────────");
  console.log();

  const rawVisMnt = await benchmarkMountOverhead(
    "Raw useEffect (visibility)",
    useRawVisibility,
  );
  console.log();
  const hookVisMnt = await benchmarkMountOverhead("useDocVisible", useDocVisible);
  console.log();
  const rawIdleMnt = await benchmarkMountOverhead("Raw useEffect (idle+vis)", () =>
    useRawIdleVisibility(60_000),
  );
  console.log();
  const hookIdleMnt = await benchmarkMountOverhead("useIdleVisibility", () =>
    useIdleVisibility(60_000),
  );
  console.log();

  // --- Summary table ---
  console.log("── Summary ──────────────────────────────────────");
  console.log();
  console.log(
    "| Hook                | Metric           | Raw useEffect  | Hook           | Overhead  |",
  );
  console.log(
    "| ------------------- | ---------------- | -------------- | -------------- | --------- |",
  );

  const visOverhead = ((hookVis.avgMs / rawVis.avgMs - 1) * 100).toFixed(1);
  const visMntOverhead = ((hookVisMnt.elapsed / rawVisMnt.elapsed - 1) * 100).toFixed(1);
  console.log(
    `| useDocVisible       | toggles/sec      | ${fmt(rawVis.togglesPerSec).padStart(14)} | ${fmt(hookVis.togglesPerSec).padStart(14)} | ${visOverhead.padStart(7)}% |`,
  );
  console.log(
    `| useDocVisible       | mount/unmount    | ${rawVisMnt.elapsed.toFixed(1).padStart(12)}ms | ${hookVisMnt.elapsed.toFixed(1).padStart(12)}ms | ${visMntOverhead.padStart(7)}% |`,
  );

  const idleOverhead = ((hookIdle.avgMs / rawIdle.avgMs - 1) * 100).toFixed(1);
  const idleMntOverhead = ((hookIdleMnt.elapsed / rawIdleMnt.elapsed - 1) * 100).toFixed(
    1,
  );
  console.log(
    `| useIdleVisibility   | toggles/sec      | ${fmt(rawIdle.togglesPerSec).padStart(14)} | ${fmt(hookIdle.togglesPerSec).padStart(14)} | ${idleOverhead.padStart(7)}% |`,
  );
  console.log(
    `| useIdleVisibility   | mount/unmount    | ${rawIdleMnt.elapsed.toFixed(1).padStart(12)}ms | ${hookIdleMnt.elapsed.toFixed(1).padStart(12)}ms | ${idleMntOverhead.padStart(7)}% |`,
  );

  console.log();
}

main().catch(console.error);
