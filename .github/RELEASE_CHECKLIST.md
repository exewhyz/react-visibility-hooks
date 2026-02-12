# Release Checklist

Use this checklist before tagging a release.

## 1) Scope and notes

- [ ] Confirm release scope is complete and reviewed
- [ ] Ensure `CHANGELOG.md` has a dated entry with `Added`, `Changed`, `Fixed` (and `Removed` if needed)
- [ ] Move key items from `Unreleased` to the target version

## 2) Quality gates

Run locally:

```bash
npm run format -- --check
npm run lint
npm run typecheck
npm test -- --ci --coverage
npm run build
npm run size
npm run bench
```

- [ ] All checks pass locally
- [ ] CI green on main for latest commit

## 3) Docs and discoverability

- [ ] README examples and links are current
- [ ] Docs site pages reflect API changes
- [ ] SEO metadata in `docs/astro.config.mjs` is still accurate
- [ ] Package metadata and keywords in `package.json` are still accurate

## 4) API surface

- [ ] Public exports in `src/index.ts` are correct
- [ ] New/changed options and return types are documented

## 5) Publish

- [ ] Create release tag: `vX.Y.Z`
- [ ] Push tag to trigger publish workflow
- [ ] Verify package on npm and docs links

## 6) Post-release

- [ ] Create next `Unreleased` section in `CHANGELOG.md`
- [ ] Announce highlights with links to docs and examples
