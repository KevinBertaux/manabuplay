# Git Hooks

This repository uses a versioned `pre-push` hook to run the same checks as CI before pushing.

Enable it once per clone:

```sh
git config core.hooksPath .githooks
```

The hook runs:

```sh
npm run check:ci
```
