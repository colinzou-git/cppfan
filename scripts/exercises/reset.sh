#!/usr/bin/env bash
#
# Reset a write-code exercise's working copy back to the starter (#81).
# Removes <exercise>/work/ and re-copies the starter. Writes ONLY inside the
# exercise's own validated work/ directory.
#
# Usage: scripts/exercises/reset.sh <exercise-id>
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck source=scripts/exercises/lib.sh
source "$ROOT/scripts/exercises/lib.sh"

ID="${1:-}"

if [[ -z "$ID" ]]; then
  echo "usage: scripts/exercises/reset.sh <exercise-id>" >&2
  exit 2
fi

# Validate the id and resolve to a canonical, allowlisted exercise directory.
EX_DIR="$(validate_exercise_id "$ROOT" "$ID")" || exit $?

if [[ ! -d "$EX_DIR/starter" ]]; then
  echo "error: exercise '$ID' has no starter/ directory" >&2
  exit 1
fi

rm -rf -- "$EX_DIR/work" "$EX_DIR/.build-solution"
exec "$ROOT/scripts/exercises/prepare.sh" "$ID"
