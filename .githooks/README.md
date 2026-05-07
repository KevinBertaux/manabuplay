# Git Hooks

This repository uses a versioned `pre-push` hook.

Enable it once per clone:

```sh
git config core.hooksPath .githooks
```

Current validation levels:

```sh
npm run check:quick
```

- quick local validation

```sh
npm run check:feature
```

- feature-level validation for real code changes and CI

```sh
npm run qa:release
```

- heavier release validation for end-of-scope or release prep

The hook runs:

```sh
node scripts/check-pre-push.mjs
```

The script is adaptive:

- docs-only changes: `npm run check:quick`
- web-only changes: `npm run check:web` + quick repo checks + cheap audits
- admin-only changes: `npm run check:admin` + quick repo checks + cheap audits
- shared, scripts, config, hooks, or mixed web/admin changes: `npm run check`

It also skips branch deletions and empty pushes, so `git push origin --delete ...` no longer pays the full validation cost.
