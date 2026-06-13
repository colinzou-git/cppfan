#!/usr/bin/env bash
#
# Reset a write-code exercise's working copy back to the starter (#81).
# Removes exercises/<id>/work/ and re-copies the starter. Writes ONLY inside the
# exercise's own work/ directory.
#
# Usage: scripts/exercises/reset.sh <exercise-id>
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ID="${1:-}"

if [[ -z "$ID" ]]; then
  echo "usage: scripts/exercises/reset.sh <exercise-id>" >&2
  exit 2
fi

EX_DIR="$ROOT/exercises/$ID"
if [[ ! -d "$EX_DIR/starter" ]]; then
  echo "error: no such exercise '$ID' (missing $EX_DIR/starter)" >&2
  exit 1
fi

rm -rf "$EX_DIR/work" "$EX_DIR/.build-solution"
exec "$(dirname "${BASH_SOURCE[0]}")/prepare.sh" "$ID"
