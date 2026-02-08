# react-visibility-hooks

> Tiny, SSR-safe React hooks for page visibility, idle detection, smart polling, network awareness, wake lock, battery status and more

[![npm version](https://img.shields.io/npm/v/react-visibility-hooks.svg)](https://www.npmjs.com/package/react-visibility-hooks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/react-visibility-hooks)](https://bundlephobia.com/package/react-visibility-hooks)
[![CI](https://github.com/exewhyz/react-visibility-hooks/actions/workflows/ci.yml/badge.svg)](https://github.com/exewhyz/react-visibility-hooks/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/exewhyz/react-visibility-hooks/badge)](https://scorecard.dev/viewer/?uri=github.com/exewhyz/react-visibility-hooks)
[![Docs](https://img.shields.io/badge/docs-visibility--hooks.grettech.com-blue)](https://visibility-hooks.grettech.com)

A collection of lightweight React hooks that help you build performance-conscious, resource-aware applications. Detect page visibility, user idle state, network conditions, battery status, and more — with zero dependencies.

## Features

- 🪶 **Lightweight** — Zero dependencies, tree-shakeable
- 🔒 **SSR-safe** — Works with Next.js (App & Pages Router), Remix, Gatsby, and all SSR frameworks
- 📦 **Tree-shakeable** — Import only what you need
- 🎯 **TypeScript** — Fully typed with exported interfaces
- ⚡ **Performance-focused** — Pause expensive operations when users aren't looking
- 🎬 **Auto-pause video** — Pause/resume `<video>` elements on tab visibility
- 🔄 **Smart polling** — Visibility-aware data fetching with dedup
- 🌐 **Network-aware** — Adapt to online/offline state and connection quality
- 🔋 **Battery-aware** — React to device battery level and charging state
- 📱 **Wake Lock** — Prevent screen dimming during critical tasks
- ⏱️ **Inactivity timeout** — Session management with warning countdowns
- 🔀 **Focus transitions** — Declarative callbacks on tab show/hide

## Installation

```bash
npm install react-visibility-hooks
```

```bash
yarn add react-visibility-hooks
```

```bash
pnpm add react-visibility-hooks
```

## Quick Start

```tsx
import {
  useDocVisible,
  useSmartPolling,
  useNetworkAwarePolling,
  usePageFocusEffect,
} from 'react-visibility-hooks';
```

## Hooks

### `useDocVisible`

Detect when the browser tab is visible or hidden using the [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API).

**Use cases:** Pause animations, stop background fetches, save battery.

```tsx
import { useDocVisible } from 'react-visibility-hooks';

function MyComponent() {
  const isVisible = useDocVisible();

  return <div>Tab is currently: {isVisible ? 'visible' : 'hidden'}</div>;
}
```

---

### `useIdleVisibility`

Detect when the user is idle (no mouse, keyboard, pointer, scroll, or touch activity) combined with page visibility state.

**Use cases:** "Are you still there?" prompts, auto-pause media, reduce background activity.

```tsx
import { useIdleVisibility } from 'react-visibility-hooks';

function MyComponent() {
  const { visible, idle } = useIdleVisibility(60_000); // 60 seconds

  return (
    <div>
      <p>Page visible: {visible ? 'yes' : 'no'}</p>
      <p>User idle: {idle ? 'yes' : 'no'}</p>
    </div>
  );
}
```

| Parameter | Type     | Default  | Description                                   |
| --------- | -------- | -------- | --------------------------------------------- |
| `timeout` | `number` | `60_000` | Ms of inactivity before the user is idle      |

---

### `useAutoPauseVideo`

Automatically pause and resume `<video>` elements on tab visibility. Only resumes if the video was playing before the tab was hidden — never overrides a user's manual pause.

**Use cases:** Auto-pause videos, save bandwidth, better UX for video-heavy apps.

```tsx
import { useRef } from 'react';
import { useAutoPauseVideo } from 'react-visibility-hooks';

function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  useAutoPauseVideo(videoRef);

  return <video ref={videoRef} src="video.mp4" controls />;
}
```

---

### `useSmartPolling`

Visibility-aware data polling. Automatically pauses when the tab is hidden, resumes when visible, and skips re-renders when data hasn't changed.

**Use cases:** Real-time dashboards, live notifications, auto-refresh feeds.

```tsx
import { useSmartPolling } from 'react-visibility-hooks';

function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useSmartPolling(
    () => fetch('/api/stats').then((r) => r.json()),
    { interval: 3000 },
  );

  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p>Error: {error?.message}</p>;

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={refetch}>Refresh now</button>
    </div>
  );
}
```

**Options (`SmartPollingOptions`):**

| Option     | Type      | Default | Description               |
| ---------- | --------- | ------- | ------------------------- |
| `interval` | `number`  | `5000`  | Polling interval in ms    |
| `enabled`  | `boolean` | `true`  | Enable / disable polling  |

**Returns (`SmartPollingResult<T>`):**

| Property    | Type                  | Description                           |
| ----------- | --------------------- | ------------------------------------- |
| `data`      | `T \| undefined`      | The latest fetched data               |
| `isLoading` | `boolean`             | `true` until the first fetch completes|
| `isError`   | `boolean`             | `true` if the last fetch threw        |
| `error`     | `Error \| undefined`  | The error object, if any              |
| `refetch`   | `() => Promise<void>` | Manually trigger a fetch              |

---

### `usePageFocusEffect` ✨ <sup>NEW</sup>

Run side-effect callbacks on visibility **transitions** — not on every render. Think of it as `useEffect` for tab show/hide.

**Use cases:** Refetch stale data on tab return, save state on tab leave, track visibility analytics.

```tsx
import { usePageFocusEffect } from 'react-visibility-hooks';

function MyComponent() {
  usePageFocusEffect({
    onVisible: () => {
      console.log('Welcome back! Refetching…');
      refetchData();
      return () => console.log('cleanup on next transition');
    },
    onHidden: () => {
      saveScrollPosition();
    },
  });
}
```

**Options (`PageFocusEffectOptions`):**

| Option      | Type                             | Description                                                      |
| ----------- | -------------------------------- | ---------------------------------------------------------------- |
| `onVisible` | `() => void \| (() => void)`    | Fires on hidden → visible. May return a cleanup function.        |
| `onHidden`  | `() => void`                     | Fires on visible → hidden.                                       |

> The initial render is **not** treated as a transition. Callbacks only fire on actual visibility changes.

---

### `useNetworkAwarePolling` ✨ <sup>NEW</sup>

Extends `useSmartPolling` with network awareness. Pauses when offline and adapts the polling interval on slow connections (2g / slow-2g).

**Use cases:** Mobile-first apps, offline-resilient dashboards, bandwidth-conscious polling.

```tsx
import { useNetworkAwarePolling } from 'react-visibility-hooks';

function LiveFeed() {
  const { data, isOnline, effectiveInterval } = useNetworkAwarePolling(
    () => fetch('/api/feed').then((r) => r.json()),
    { interval: 5000, slowMultiplier: 3 },
  );

  return (
    <div>
      <p>Status: {isOnline ? '🟢 Online' : '🔴 Offline'}</p>
      <p>Polling every {effectiveInterval / 1000}s</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

**Options (`NetworkAwarePollingOptions`):**

| Option            | Type      | Default | Description                                     |
| ----------------- | --------- | ------- | ----------------------------------------------- |
| `interval`        | `number`  | `5000`  | Base polling interval in ms                     |
| `enabled`         | `boolean` | `true`  | Enable / disable polling                        |
| `slowMultiplier`  | `number`  | `3`     | Multiplier applied on 2g/slow-2g connections    |
| `pauseOffline`    | `boolean` | `true`  | Pause polling when offline                      |

**Returns (`NetworkAwarePollingResult<T>`):**

Inherits all of `SmartPollingResult<T>` plus:

| Property            | Type      | Description                                        |
| ------------------- | --------- | -------------------------------------------------- |
| `isOnline`          | `boolean` | `true` when the browser reports being online       |
| `effectiveInterval` | `number`  | Actual polling interval after network adjustment   |

---

### `useInactivityTimeout` ✨ <sup>NEW</sup>

Countdown-based session/inactivity manager with a warning phase. Built on `useIdleVisibility`.

**Use cases:** Auto-logout, session expiry warnings, "still there?" modals.

```tsx
import { useInactivityTimeout } from 'react-visibility-hooks';

function SessionManager() {
  const { isWarning, isTimedOut, remainingSeconds, resetTimer } =
    useInactivityTimeout({
      timeout: 300_000,       // 5 minutes total
      warningBefore: 60_000,  // warn 1 minute before
      onWarning: () => showWarningToast(),
      onTimeout: () => logout(),
    });

  if (isTimedOut) return <p>Session expired.</p>;

  if (isWarning) {
    return (
      <div>
        <p>Session expires in {remainingSeconds}s</p>
        <button onClick={resetTimer}>Stay logged in</button>
      </div>
    );
  }

  return null;
}
```

**Options (`InactivityTimeoutOptions`):**

| Option          | Type         | Default   | Description                                       |
| --------------- | ------------ | --------- | ------------------------------------------------- |
| `timeout`       | `number`     | `300_000` | Total inactivity before timeout (ms)              |
| `warningBefore` | `number`     | `60_000`  | How long before timeout to start warning (ms)     |
| `onTimeout`     | `() => void` | —         | Called when the full timeout elapses              |
| `onWarning`     | `() => void` | —         | Called when entering the warning phase            |

**Returns (`InactivityTimeoutResult`):**

| Property           | Type         | Description                                        |
| ------------------ | ------------ | -------------------------------------------------- |
| `idle`             | `boolean`    | `true` when the user is idle                       |
| `visible`          | `boolean`    | Current page-visibility state                      |
| `isWarning`        | `boolean`    | `true` during the warning countdown                |
| `isTimedOut`       | `boolean`    | `true` after the full timeout has elapsed          |
| `remainingSeconds` | `number`     | Seconds until timeout (`-1` when not idle)         |
| `resetTimer`       | `() => void` | Manually reset the timer                           |

---

### `useWakeLock` ✨ <sup>NEW</sup>

Manage the [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) to prevent the screen from dimming or locking.

**Use cases:** Video calls, presentations, recipe/reading apps, kiosk mode.

```tsx
import { useWakeLock } from 'react-visibility-hooks';

function PresentationMode() {
  const { isActive, isSupported, request, release } = useWakeLock();

  if (!isSupported) return <p>Wake Lock not supported</p>;

  return (
    <div>
      <p>Screen lock prevention: {isActive ? 'ON' : 'OFF'}</p>
      <button onClick={isActive ? release : request}>
        {isActive ? 'Allow screen lock' : 'Keep screen on'}
      </button>
    </div>
  );
}
```

**Parameters:**

| Parameter       | Type      | Default | Description                                         |
| --------------- | --------- | ------- | --------------------------------------------------- |
| `autoReacquire` | `boolean` | `true`  | Re-request lock when the tab becomes visible again   |

**Returns (`WakeLockResult`):**

| Property      | Type                  | Description                              |
| ------------- | --------------------- | ---------------------------------------- |
| `isActive`    | `boolean`             | `true` while a Wake Lock is held         |
| `request`     | `() => Promise<void>` | Request the screen Wake Lock             |
| `release`     | `() => Promise<void>` | Release the current Wake Lock            |
| `isSupported` | `boolean`             | `true` if the API is available           |

---

### `useBatteryAware` ✨ <sup>NEW</sup>

Expose device battery status via the [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API).

**Use cases:** Reduce polling on low battery, disable animations, show battery indicators.

```tsx
import { useBatteryAware } from 'react-visibility-hooks';

function BatteryIndicator() {
  const { charging, level, isLowBattery, isSupported } = useBatteryAware(0.15);

  if (!isSupported) return null;

  return (
    <div>
      <p>🔋 {Math.round(level * 100)}%{charging ? ' ⚡ Charging' : ''}</p>
      {isLowBattery && <p>⚠️ Low battery — reducing activity</p>}
    </div>
  );
}
```

**Parameters:**

| Parameter      | Type     | Default | Description                                             |
| -------------- | -------- | ------- | ------------------------------------------------------- |
| `lowThreshold` | `number` | `0.15`  | Level (0–1) below which `isLowBattery` is `true`        |

**Returns (`BatteryState`):**

| Property       | Type      | Description                                          |
| -------------- | --------- | ---------------------------------------------------- |
| `charging`     | `boolean` | `true` when the device is plugged in                 |
| `level`        | `number`  | Battery level between 0 and 1                        |
| `isLowBattery` | `boolean` | `true` when not charging and below threshold         |
| `isSupported`  | `boolean` | `true` when the Battery Status API is available      |

---

## Combining Hooks

The real power comes from composing hooks together:

```tsx
import {
  useNetworkAwarePolling,
  useBatteryAware,
  useInactivityTimeout,
} from 'react-visibility-hooks';

function SmartDashboard() {
  const { isLowBattery } = useBatteryAware();
  const { isTimedOut } = useInactivityTimeout({ timeout: 300_000 });

  const { data } = useNetworkAwarePolling(
    () => fetch('/api/metrics').then((r) => r.json()),
    {
      interval: isLowBattery ? 30_000 : 5_000,
      enabled: !isTimedOut,
    },
  );

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

## SSR Support

All hooks are SSR-safe and work correctly with:

- **Next.js** (App Router & Pages Router)
- **Remix**
- **Gatsby**
- Any other React SSR framework

The hooks check for `document`/`window`/`navigator` availability and return sensible defaults on the server (e.g., `visible = true`, `online = true`, `charging = true`).

## TypeScript

Written in TypeScript with full type definitions. All interfaces are exported:

```tsx
import type {
  IdleVisibilityResult,
  SmartPollingOptions,
  SmartPollingResult,
  PageFocusEffectOptions,
  NetworkAwarePollingOptions,
  NetworkAwarePollingResult,
  InactivityTimeoutOptions,
  InactivityTimeoutResult,
  WakeLockResult,
  BatteryState,
} from 'react-visibility-hooks';
```

## Browser Support

| Feature                | API                     | Support                                                                 |
| ---------------------- | ----------------------- | ----------------------------------------------------------------------- |
| Visibility detection   | Page Visibility API     | [All modern browsers](https://caniuse.com/pagevisibility)               |
| Network detection      | `navigator.onLine`      | [All modern browsers](https://caniuse.com/online-status)                |
| Connection quality     | Network Information API | [Chrome, Edge, Opera](https://caniuse.com/netinfo)                      |
| Wake Lock              | Screen Wake Lock API    | [Chrome, Edge, Opera](https://caniuse.com/wake-lock)                    |
| Battery status         | Battery Status API      | [Chrome, Edge, Opera](https://caniuse.com/battery-status)               |

> All hooks degrade gracefully — `isSupported` flags let you build progressive UIs.

## Examples

### Pause expensive calculations when tab is hidden

```tsx
import { useDocVisible } from 'react-visibility-hooks';
import { useEffect } from 'react';

function ExpensiveComponent() {
  const isVisible = useDocVisible();

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      performCalculation();
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return <div>…</div>;
}
```

### Session timeout with warning modal

```tsx
import { useInactivityTimeout } from 'react-visibility-hooks';

function App() {
  const { isWarning, remainingSeconds, resetTimer, isTimedOut } =
    useInactivityTimeout({
      timeout: 600_000,
      warningBefore: 120_000,
      onTimeout: () => window.location.href = '/login',
    });

  return (
    <>
      <MainContent />
      {isWarning && (
        <Modal>
          <p>Session expires in {remainingSeconds}s</p>
          <button onClick={resetTimer}>I'm still here</button>
        </Modal>
      )}
    </>
  );
}
```

### Battery-aware polling

```tsx
import { useSmartPolling, useBatteryAware } from 'react-visibility-hooks';

function Feed() {
  const { isLowBattery } = useBatteryAware();
  const { data } = useSmartPolling(fetchFeed, {
    interval: isLowBattery ? 30_000 : 5_000,
  });

  return <FeedList items={data} />;
}
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a Pull Request.

## License

MIT © [Aniket Raj](https://github.com/exewhyz)

## Links

- [📖 Documentation](https://visibility-hooks.grettech.com)
- [GitHub Repository](https://github.com/exewhyz/react-visibility-hooks)
- [Issue Tracker](https://github.com/exewhyz/react-visibility-hooks/issues)
- [NPM Package](https://www.npmjs.com/package/react-visibility-hooks)
- [Changelog](CHANGELOG.md)
