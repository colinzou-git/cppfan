#!/usr/bin/env bash
#
# One-command cppFan verification script for GitHub Codespaces.
#
# Safe to re-run. It validates the app, optionally applies Supabase migrations
# when SUPABASE_DB_URL is present, and optionally runs Playwright e2e when
# RUN_E2E=1 is set.
set -euo pipefail

section() {
  printf '\n==> %s\n' "$1"
}

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repo_root}"

section "cppFan Codespace verifier"
echo "Repo: ${repo_root}"

if ! command -v pnpm >/dev/null 2>&1; then
  section "Enable pnpm via Corepack"
  corepack enable
  corepack prepare pnpm@10.0.0 --activate
fi

section "Install dependencies"
pnpm install --frozen-lockfile

section "Run CI-equivalent app checks"
pnpm lint
pnpm typecheck
pnpm test
pnpm build

section "Optional Supabase migration"
if [ -n "${SUPABASE_DB_URL:-}" ]; then
  if ! command -v psql >/dev/null 2>&1; then
    echo "Installing postgresql-client for migration support..."
    sudo apt-get update -y >/dev/null
    sudo apt-get install -y --no-install-recommends postgresql-client >/dev/null
  fi
  pnpm db:migrate
else
  cat <<'MSG'
Skipping pnpm db:migrate because SUPABASE_DB_URL is not set.

To enable DB verification in Codespaces:
1. Supabase -> Project Settings -> Database -> Connection string -> URI.
2. GitHub repo -> Settings -> Secrets and variables -> Codespaces.
3. Add repository secret named SUPABASE_DB_URL.
4. Reopen the Codespace terminal, then rerun: pnpm verify:codespace
MSG
fi

section "Optional Playwright e2e"
if [ "${RUN_E2E:-0}" = "1" ]; then
  pnpm exec playwright install --with-deps chromium webkit
  pnpm test:e2e
else
  echo "Skipping e2e by default. Run with RUN_E2E=1 pnpm verify:codespace to include Playwright."
fi

section "Manual live checks after DB migration"
cat <<'MSG'
After SUPABASE_DB_URL is set and migrations apply successfully, smoke-test these live Supabase behaviors:

1. Client/display reads of learning_item_choices must not expose is_correct.
2. grade_learning_item_choice(p_item_id, p_choice_id) should grade a seeded item.
3. Signed-in quiz attempts, reviews, and skill events should record without RLS errors.
4. Dashboard, skill map, daily plan, /learn/[itemId], and /review should render in iPhone/iPad viewports.
MSG

section "Done"
