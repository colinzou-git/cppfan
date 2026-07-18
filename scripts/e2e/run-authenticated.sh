#!/usr/bin/env bash
set -euo pipefail

# Canonical authenticated Playwright entrypoint.
#
# - Reuses a running disposable local Supabase stack (CI/Codespaces).
# - Starts and owns a stack when invoked on a clean developer machine.
# - Never reads production Supabase credentials: values are always obtained from
#   `supabase status` and the URL is required to be localhost/127.0.0.1.
# - Discovers every tests/e2e/authenticated-*.spec.ts automatically.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI is required for authenticated E2E tests." >&2
  echo "Install it, then rerun: pnpm test:e2e:authenticated" >&2
  exit 1
fi

started_here=false

cleanup() {
  if [[ "${started_here}" == "true" ]]; then
    supabase stop --no-backup || true
  fi
}
trap cleanup EXIT INT TERM

if ! supabase status >/dev/null 2>&1; then
  echo "Starting disposable local Supabase stack..."
  supabase start
  started_here=true
fi

# Use only values produced by the local stack. This deliberately overwrites any
# similarly named variables inherited from the caller's shell.
eval "$(supabase status -o env \
  --override-name api.url=SUPABASE_URL \
  --override-name auth.anon_key=SUPABASE_ANON_KEY \
  --override-name auth.service_role_key=SUPABASE_SERVICE_ROLE_KEY)"

: "${SUPABASE_URL:?supabase status did not return SUPABASE_URL}"
: "${SUPABASE_ANON_KEY:?supabase status did not return SUPABASE_ANON_KEY}"
: "${SUPABASE_SERVICE_ROLE_KEY:?supabase status did not return SUPABASE_SERVICE_ROLE_KEY}"

case "${SUPABASE_URL}" in
  http://127.0.0.1:*|http://localhost:*) ;;
  *)
    echo "Refusing authenticated E2E against non-local Supabase URL: ${SUPABASE_URL}" >&2
    exit 1
    ;;
esac

export SUPABASE_URL
export SUPABASE_ANON_KEY
export SUPABASE_SERVICE_ROLE_KEY
export NEXT_PUBLIC_SUPABASE_URL="${SUPABASE_URL}"
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="${SUPABASE_ANON_KEY}"
export NEXT_PUBLIC_APP_URL="http://127.0.0.1:3000"

echo "Authenticated E2E Supabase URL: ${SUPABASE_URL}"

if [[ "$#" -eq 0 ]]; then
  # The glob expands here, so every future authenticated spec is automatically
  # included without editing this script or the CI workflow.
  set -- \
    tests/e2e/authenticated-*.spec.ts \
    --project=chromium \
    --project=iphone \
    --project=ipad
fi

pnpm exec playwright test "$@"
