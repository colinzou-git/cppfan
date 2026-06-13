#!/usr/bin/env bash
#
# Prepare a working copy of a write-code exercise (#81).
# Copies exercises/<id>/starter/* into exercises/<id>/work/ so the learner can
# edit freely without touching the pristine starter. Writes ONLY inside the
# exercise's own work/ directory.
#
# Usage: scripts/exercises/prepare.sh <exercise-id> [--force]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ID="${1:-}"
FORCE="${2:-}"

if [[ -z "$ID" ]]; then
  echo "usage: scripts/exercises/prepare.sh <exercise-id> [--force]" >&2
  exit 2
fi

EX_DIR="$ROOT/exercises/$ID"
STARTER="$EX_DIR/starter"
WORK="$EX_DIR/work"

if [[ ! -d "$STARTER" ]]; then
  echo "error: no such exercise '$ID' (missing $STARTER)" >&2
  exit 1
fi

if [[ -d "$WORK" && "$FORCE" != "--force" ]]; then
  echo "error: $WORK already exists. Edit it, or re-create it with:" >&2
  echo "  scripts/exercises/reset.sh $ID    # discard work and re-copy starter" >&2
  echo "  scripts/exercises/prepare.sh $ID --force" >&2
  exit 1
fi

rm -rf "$WORK"
mkdir -p "$WORK"
cp -R "$STARTER"/. "$WORK"/
echo "Prepared $WORK from starter. Edit the files there, then run:"
echo "  scripts/exercises/test.sh $ID"
