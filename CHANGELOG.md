# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
