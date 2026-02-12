# Contributing

Thank you for your interest in contributing to **react-visibility-hooks**! 🎉

Please read through this guide before opening a PR.

## Getting Started

```bash
# Clone the repo
git clone https://github.com/exewhyz/react-visibility-hooks.git
cd react-visibility-hooks

# Install dependencies
npm install

# Install docs dependencies
cd docs && npm install && cd ..
```

## Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type-check
npm run typecheck

# Lint
npm run lint

# Format code
npm run format

# Build the library
npm run build

# Check bundle size
npm run size

# Run benchmarks
npm run bench
```

## Documentation Site

The docs are built with [Astro Starlight](https://starlight.astro.build/) and deployed at [visibility-hooks.grettech.com](https://visibility-hooks.grettech.com).

```bash
# Start docs dev server
npm run docs:dev

# Build docs
npm run docs:build
```

Docs source lives in `docs/src/content/docs/`. Each hook has its own `.mdx` page under `docs/src/content/docs/hooks/`.

## Guidelines

1. All hooks must be **SSR-safe** — guard `document` and `window` access.
2. Every new hook needs tests in `__tests__/` with **>90% coverage**.
3. Export types explicitly from `src/index.ts`.
4. Keep the total bundle under **3 kB** gzipped.
5. Add a documentation page in `docs/src/content/docs/hooks/` for any new hook.
6. Update `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/) format.

## Adding a New Hook

1. Create `src/useYourHook.ts`
2. Export it from `src/index.ts`
3. Add tests in `__tests__/useYourHook.test.ts`
4. Add a docs page at `docs/src/content/docs/hooks/use-your-hook.mdx`
5. Add the hook to the sidebar in `docs/astro.config.mjs`
6. Update `README.md` with a summary and usage example
7. Add a `CHANGELOG.md` entry

## Pull Requests

- One feature per PR
- Include tests with passing coverage
- Run `npm run prepublishOnly` before submitting
- Link any related issues
- For user-facing changes, add/update `CHANGELOG.md` under `Unreleased`

PRs are pre-populated by `.github/pull_request_template.md` to enforce quality gates and release-note checks.

## Reporting Bugs

Open an issue with:

- React version
- Browser + version
- Minimal reproduction (CodeSandbox / StackBlitz preferred)
- Expected vs actual behavior

Use the issue links from `README.md` or docs home so labels are prefilled (`bug`, `enhancement`, `documentation`).

## Feature Requests

Open a GitHub issue with the `enhancement` label and include:

- The problem to solve
- Why existing hooks are insufficient
- Suggested API shape (options + return values)
- Real usage context (dashboard, media, auth/session, etc.)

Issue forms are available under `.github/ISSUE_TEMPLATE/` for bugs, features, and docs updates.

## Release Process

Maintainers should follow `.github/RELEASE_CHECKLIST.md` before creating a release tag.

## Code of Conduct

Be kind and respectful. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).
