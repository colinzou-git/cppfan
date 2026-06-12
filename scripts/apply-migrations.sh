#!/usr/bin/env bash
#
# Apply every Supabase migration, in order, against the project database.
#
# This is the single manual step for cppFan database work — run it from a
# GitHub Codespace with `pnpm db:migrate`. All migrations are idempotent
# (create-if-not-exists / create-or-replace / drop-policy-if-exists /
# on-conflict), so re-running this is safe and always brings the database up to
# date; new migration files are picked up automatically.
#
# Requires SUPABASE_DB_URL: the Postgres connection string from
#   Supabase -> Project Settings -> Database -> Connection string -> URI
# Add it as a Codespace secret (repo Settings -> Secrets and variables ->
# Codespaces -> New secret, name SUPABASE_DB_URL), then reopen the terminal.
set -euo pipefail

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  cat >&2 <<'MSG'
SUPABASE_DB_URL is not set.

1. In Supabase: Project Settings -> Database -> Connection string -> URI
   (copy the connection string; it includes the password).
2. In GitHub: repo Settings -> Secrets and variables -> Codespaces ->
   New repository secret, name it SUPABASE_DB_URL, paste the URI.
3. Reopen the Codespace terminal (so the secret is in the environment) and
   re-run: pnpm db:migrate
MSG
  exit 1
fi

# The Codespace base image may not ship psql; install it on demand.
if ! command -v psql >/dev/null 2>&1; then
  echo "==> Installing postgresql-client (one time)"
  sudo apt-get update -y >/dev/null
  sudo apt-get install -y --no-install-recommends postgresql-client >/dev/null
fi

migrations_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/supabase/migrations"

shopt -s nullglob
files=("${migrations_dir}"/*.sql)
if [ "${#files[@]}" -eq 0 ]; then
  echo "No migration files found in ${migrations_dir}" >&2
  exit 1
fi

echo "==> Applying ${#files[@]} migration(s) from ${migrations_dir}"
for file in "${files[@]}"; do
  echo "--> $(basename "${file}")"
  psql "${SUPABASE_DB_URL}" --single-transaction -v ON_ERROR_STOP=1 -q -f "${file}"
done

echo "==> Done. All migrations applied (idempotent; safe to re-run)."
