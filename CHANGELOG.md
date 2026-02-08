# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-02-08

### Added

- **`usePageFocusEffect`** — Declarative callbacks on visibility transitions (hidden→visible, visible→hidden). Supports cleanup functions, ref-stable callbacks, skips initial mount.
- **`useNetworkAwarePolling`** — Extends `useSmartPolling` with online/offline detection, adaptive interval for slow connections (2g/slow-2g), configurable `slowMultiplier` and `pauseOffline` options.
- **`useInactivityTimeout`** — Countdown-based session manager with warning phase, `onTimeout`/`onWarning` callbacks, `resetTimer`, and `remainingSeconds` countdown.
- **`useWakeLock`** — Screen Wake Lock API wrapper with auto-reacquire on tab visibility, graceful degradation, and `isSupported` flag.
- **`useBatteryAware`** — Battery Status API hook exposing `charging`, `level`, `isLowBattery`, and `isSupported`. Reacts to real-time `chargingchange`/`levelchange` events.
- Exported types: `PageFocusEffectOptions`, `NetworkAwarePollingOptions`, `NetworkAwarePollingResult`, `InactivityTimeoutOptions`, `InactivityTimeoutResult`, `WakeLockResult`, `BatteryState`
- Comprehensive test suites for all 5 new hooks
- New keywords in package.json for discoverability (`wake-lock`, `battery`, `network-aware`, `session-timeout`, `focus-effect`)
- Browser compatibility table in README
- "Combining Hooks" example section in README showing hook composition patterns

### Changed

- Version bump to 3.0.0 (new public API surface)
- README fully rewritten with Quick Start, per-hook API tables, composability examples, and browser support matrix
- Updated package description to reflect all 9 hooks
- Updated size-limit budget to 3 kB to accommodate new hooks

## [2.0.0] - 2026-02-08

### Changed

- Major version bump with stable API

## [1.0.13] - 2026-02-08

### Added

- ESLint flat config with `typescript-eslint`
- Prettier config (`.prettierrc`) and `format` script
- `format --check` and `lint` steps in CI and release workflows

### Changed

- Version bump to 1.0.13

## [1.0.12] - 2026-02-08

### Added

- Comprehensive test suite for all 4 hooks with >90% coverage
- Size-limit budget enforcement (1.5 kB)
- `CHANGELOG.md`, `LICENSE`, `CONTRIBUTING.md`
- CI workflow for PRs and release workflow with npm provenance
- `useCallback` memoization in `useDocVisible`
- `wasPausedByUs` tracking in `useAutoPauseVideo`
- `mountedRef` guard in `useSmartPolling` to prevent state updates after unmount
- `"use client"` banner for Next.js App Router compatibility
- Explicit named type exports (`IdleVisibilityResult`, `SmartPollingOptions`, `SmartPollingResult`)

### Changed

- Widened peer dependency range to `react >=16.8.0`
- Improved SSR safety across all hooks (`window`/`document` guards)
- `useIdleVisibility` now listens to `pointerdown`, `scroll`, `touchstart` in addition to `mousemove`/`keydown`
- `useSmartPolling` immediately fetches when tab returns to visible
- Stricter TypeScript config (`noUnusedLocals`, `isolatedModules`, `declarationMap`)
- `tsup` config now enables `treeshake` and `splitting: false`
- Jest config upgraded to ESM mode with coverage thresholds

### Fixed

- `useAutoPauseVideo` no longer resumes video the user manually paused
- `useIdleVisibility` missing SSR guard for `window`
- `useSmartPolling` cleanup now resets `timerRef` to `undefined`
