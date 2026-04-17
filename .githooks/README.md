# Git Hooks

This repository uses a versioned `pre-push` hook to run feature-level checks before pushing.

Enable it once per clone:

```sh
git config core.hooksPath .githooks
```

The current workflow is:

```sh
npm run check:quick
```

- fast static/local guard for small patches

```sh
npm run check:feature
```

- feature-level validation used by the `pre-push` hook and CI

```sh
npm run qa:release
```

- heavier release validation for end-of-scope or release prep

The hook runs:

```sh
npm run check:feature
```
