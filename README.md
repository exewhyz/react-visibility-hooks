# react-visibility-hooks

> Tiny, SSR-safe React hooks for page visibility, idle detection and smart polling

[![npm version](https://img.shields.io/npm/v/react-visibility-hooks.svg)](https://www.npmjs.com/package/react-visibility-hooks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A collection of lightweight React hooks that help you build performance-conscious applications by detecting page visibility, user idle state, and managing smart polling strategies.

## Features

- 🪶 **Lightweight** - Zero dependencies (except peer dependencies)
- 🔒 **SSR-safe** - Works seamlessly with Next.js, Remix, and other SSR frameworks
- 📦 **Tree-shakeable** - Import only what you need
- 🎯 **TypeScript** - Fully typed with TypeScript
- ⚡ **Performance-focused** - Pause expensive operations when users aren't looking

## Installation

```bash
npm install react-visibility-hooks
```

For `useSmartPolling`, you'll also need to install `@tanstack/react-query`:

```bash
npm install @tanstack/react-query
```

## Hooks

### `useDocVisible`

Detect when the browser tab is visible or hidden using the [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API).

**Use cases:**
- Pause animations when tab is hidden
- Stop fetching data when user isn't viewing the page
- Save battery and resources

```tsx
import { useDocVisible } from 'react-visibility-hooks';

function MyComponent() {
  const isVisible = useDocVisible();

  return (
    <div>
      Tab is currently: {isVisible ? 'visible' : 'hidden'}
    </div>
  );
}
```

### `useIdleVisibility`

Detect when the user is idle (no mouse movement or keyboard activity) combined with page visibility state.

**Use cases:**
- Show "Are you still there?" prompts
- Auto-pause media after inactivity
- Reduce background activity when user is away

```tsx
import { useIdleVisibility } from 'react-visibility-hooks';

function MyComponent() {
  const { visible, idle } = useIdleVisibility(60000); // 60 seconds timeout

  return (
    <div>
      <p>Page visible: {visible ? 'yes' : 'no'}</p>
      <p>User idle: {idle ? 'yes' : 'no'}</p>
    </div>
  );
}
```

**Parameters:**
- `timeout` (optional): Milliseconds of inactivity before user is considered idle (default: 60000)

### `useAutoPauseVideo`

Automatically pause and resume videos based on page visibility.

**Use cases:**
- Auto-pause videos when user switches tabs
- Better UX for video-heavy applications
- Save bandwidth and resources

```tsx
import { useRef } from 'react';
import { useAutoPauseVideo } from 'react-visibility-hooks';

function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  useAutoPauseVideo(videoRef);

  return (
    <video ref={videoRef} src="video.mp4" controls />
  );
}
```

### `useSmartPolling`

Smart polling that only refetches data when the page is visible. Built on top of [@tanstack/react-query](https://tanstack.com/query).

**Use cases:**
- Real-time dashboards
- Live notifications
- Auto-refresh data feeds

```tsx
import { useSmartPolling } from 'react-visibility-hooks';

function Dashboard() {
  const { data, isLoading } = useSmartPolling(async () => {
    const response = await fetch('/api/stats');
    return response.json();
  });

  if (isLoading) return <div>Loading...</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

**Note:** This hook requires `@tanstack/react-query` to be installed. Polling is automatically paused when the tab is hidden and resumes when visible (default interval: 5 seconds).

## SSR Support

All hooks are SSR-safe and will work correctly with:
- Next.js (App Router & Pages Router)
- Remix
- Gatsby
- Any other React SSR framework

The hooks check for `document` availability and gracefully handle server-side rendering.

## TypeScript

This package is written in TypeScript and includes type definitions out of the box. All hooks are fully typed for the best developer experience.

## Browser Support

Works in all modern browsers that support:
- [Page Visibility API](https://caniuse.com/pagevisibility)
- React 18+

## Examples

### Pause expensive calculations when tab is hidden

```tsx
import { useDocVisible } from 'react-visibility-hooks';
import { useEffect } from 'react';

function ExpensiveComponent() {
  const isVisible = useDocVisible();

  useEffect(() => {
    if (!isVisible) return; // Skip when hidden

    const interval = setInterval(() => {
      // Expensive operation
      performCalculation();
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return <div>...</div>;
}
```

### Show idle warning

```tsx
import { useIdleVisibility } from 'react-visibility-hooks';

function IdleWarning() {
  const { idle } = useIdleVisibility(300000); // 5 minutes

  if (!idle) return null;

  return (
    <div className="warning">
      Are you still there? Your session will expire soon.
    </div>
  );
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Aniket Raj](https://github.com/exewhyz)

## Links

- [GitHub Repository](https://github.com/exewhyz/react-visibility-hooks)
- [Issue Tracker](https://github.com/exewhyz/react-visibility-hooks/issues)
- [NPM Package](https://www.npmjs.com/package/react-visibility-hooks)
