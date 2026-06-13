#!/usr/bin/env bash
#
# Build and run a write-code exercise's tests (#81).
# By default builds the learner's work/ copy; pass --solution to build the
# reference solution (used by maintainers / CI to validate the exercise itself).
# Writes ONLY inside the exercise's own validated directory.
#
# Address + UB sanitizers are on by default; set EX_SANITIZE=0 to disable
# (e.g. on toolchains without ASan, such as some Windows/MinGW setups).
#
# Usage: scripts/exercises/test.sh <exercise-id> [--solution]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck source=scripts/exercises/lib.sh
source "$ROOT/scripts/exercises/lib.sh"

ID="${1:-}"
MODE="${2:-}"

if [[ -z "$ID" ]]; then
  echo "usage: scripts/exercises/test.sh <exercise-id> [--solution]" >&2
  exit 2
fi

# Validate the id and resolve to a canonical, allowlisted exercise directory.
EX_DIR="$(validate_exercise_id "$ROOT" "$ID")" || exit $?
HARNESS="$ROOT/exercises/_harness"
TESTS="$EX_DIR/tests/tests.cpp"

if [[ ! -f "$TESTS" ]]; then
  echo "error: exercise '$ID' has no tests/tests.cpp" >&2
  exit 1
fi

if [[ "$MODE" == "--solution" ]]; then
  IMPL_DIR="$EX_DIR/solution"
  OUT_DIR="$EX_DIR/.build-solution"
else
  IMPL_DIR="$EX_DIR/work"
  OUT_DIR="$EX_DIR/work"
  if [[ ! -d "$IMPL_DIR" ]]; then
    echo "error: $IMPL_DIR not found. Run: scripts/exercises/prepare.sh $ID" >&2
    exit 1
  fi
fi

CXX="${CXX:-g++}"
FLAGS=(-std=c++20 -Wall -Wextra -Wpedantic)
if [[ "${EX_SANITIZE:-1}" != "0" ]]; then
  FLAGS+=(-fsanitize=address,undefined)
fi

mkdir -p "$OUT_DIR"
BIN="$OUT_DIR/run"

echo "Building $ID ($([[ "$MODE" == "--solution" ]] && echo solution || echo work))..."
"$CXX" "${FLAGS[@]}" -I "$HARNESS" -I "$IMPL_DIR" "$TESTS" -o "$BIN"

echo "Running tests..."
"$BIN"
