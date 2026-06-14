# Production releases

cppFan uses a dedicated `release` branch as the only branch that Vercel may deploy automatically.

## Branch roles

- `main` — newest integrated code. Pull requests merge here and GitHub Actions validates it.
- `release` — exact Git commit intended for production at `cppfan.online`.

`vercel.json` disables automatic Vercel deployments for every branch except `release`. This prevents rapid Claude/PR merges from consuming the Vercel Hobby build-rate allowance.

## One-time Vercel setup

After the release-control pull request is merged:

1. Open the cppFan project in Vercel.
2. Go to **Settings → Environments**.
3. Open **Production**.
4. Under **Branch Tracking**, change the production branch from `main` to `release`.
5. Save the setting.
6. Confirm `cppfan.online` and `www.cppfan.online` remain assigned to the Production environment.

Do not delete the Git integration. Vercel still needs it to build pushes to `release`.

## Deploy a tested main commit

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
2. Wait for CI to pass.
3. Run **Promote main to production release** again.

This preserves an auditable, forward-only Git history.

## GitHub Actions permission troubleshooting

The workflow requests `contents: write` only so it can fast-forward the `release` branch. If GitHub reports that the workflow token cannot push:

1. Open **Repository Settings → Actions → General**.
2. Under **Workflow permissions**, allow **Read and write permissions**.
3. Save and rerun the workflow.

No Vercel token or deploy-hook secret is required for this release-branch design.
