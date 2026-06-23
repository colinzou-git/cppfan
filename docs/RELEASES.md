# Production releases

cppFan uses a dedicated `release` branch as the only branch that Vercel may deploy automatically.

## Branch roles

- `main` — newest integrated code. Pull requests merge here and GitHub Actions validates it.
- `release` — exact Git commit intended for production at `cppfan.online`.

`vercel.json` disables automatic Vercel deployments for every branch except `release`. Deploys are therefore driven by what lands on `release`, never by raw pushes to `main`.

## Automatic deploys on green CI

Every push to `main` auto-deploys once its CI run passes. The
`Auto deploy main to production` workflow (`.github/workflows/auto-deploy.yml`)
triggers on a successful **CI** run for `main`, then fast-forwards `release` to
the **exact commit CI validated** (`workflow_run.head_sha`, not a possibly-newer
`main` HEAD). That push triggers one Vercel production build.

Tests stay a release gate: a red CI run never promotes, so broken commits never
reach production. The workflow shares a concurrency group with the manual
promote below, so the two can never push `release` simultaneously, and it refuses
to promote if `release` is not an ancestor of the validated commit.

Build-rate note: because every green `main` commit now deploys, rapidly merging
many PRs produces one Vercel build each. That is the intended cost of
auto-deploy; if it ever strains the Vercel Hobby build-rate allowance, batch
merges or fall back to manual promotion (disable/relax the auto-deploy workflow).

## One-time Vercel setup

After the release-control pull request is merged:

1. Open the cppFan project in Vercel.
2. Go to **Settings → Environments**.
3. Open **Production**.
4. Under **Branch Tracking**, change the production branch from `main` to `release`.
5. Save the setting.
6. Confirm `cppfan.online` and `www.cppfan.online` remain assigned to the Production environment.

Do not delete the Git integration. Vercel still needs it to build pushes to `release`.

## Manual promote (override)

Auto-deploy handles the normal path. Use the manual workflow only to re-deploy
without a new commit, or to promote when auto-deploy is intentionally disabled.

1. Confirm the latest `main` CI run is green.
2. Open the repository's **Actions** tab.
3. Select **Promote main to production release**.
4. Tap **Run workflow**.
5. Keep the workflow branch set to `main`.
6. Check **Deploy the current main commit to production**.
7. Tap **Run workflow**.

The workflow fast-forwards `release` to the exact current `main` commit. That single push triggers one Vercel production build.

If `release` already equals `main`, the workflow exits successfully without pushing and does not trigger another build.

## Safety behavior

The workflow refuses to force-push or rewrite production history. If `release` is not an ancestor of `main`, it stops and requires manual reconciliation.

Do not commit feature work directly to `release`. All normal development belongs on feature branches and `main`.

## Rollback

For an urgent hosting rollback, use Vercel's production rollback controls.

For a code-based rollback:

1. Revert the unwanted change on `main` with a normal pull request.
2. Wait for CI to pass — auto-deploy then promotes the revert to `release`.

This preserves an auditable, forward-only Git history.

## GitHub Actions permission troubleshooting

The workflow requests `contents: write` only so it can fast-forward the `release` branch. If GitHub reports that the workflow token cannot push:

1. Open **Repository Settings → Actions → General**.
2. Under **Workflow permissions**, allow **Read and write permissions**.
3. Save and rerun the workflow.

No Vercel token or deploy-hook secret is required for this release-branch design.
