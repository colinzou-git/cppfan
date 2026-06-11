# cppFan CI hardening patch

This patch updates only `.github/workflows/ci.yml`.

## Why

The current workflow runs `corepack enable` before `actions/setup-node`. This may work, but it is safer to:

1. Check out the repo.
2. Set up Node 22.
3. Enable Corepack.
4. Activate the exact pnpm version from `packageManager`.
5. Install and run checks.

## Apply

Unzip at the repo root and overwrite files.

Then commit and push to `main`.

## Local validation

You already validated most local checks. Recommended final local command:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```
