# Contributing

Thank you for your interest in contributing!

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type-check
npm run typecheck

# Build
npm run build

# Check bundle size
npm run size
```

## Guidelines

1. All hooks must be **SSR-safe** — guard `document` and `window` access.
2. Every new hook needs tests in `__tests__/`.
3. Export types explicitly from `src/index.ts`.
4. Keep the bundle under **1.5 kB** gzipped.

## Pull Requests

- One feature per PR
- Include tests
- Run `npm run prepublishOnly` before submitting
