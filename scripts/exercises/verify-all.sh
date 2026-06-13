#!/usr/bin/env bash
#
# Validate every write-code exercise package (#81):
#   - the reference solution builds AND passes its tests
#   - the starter builds (it is expected to FAIL the tests until implemented)
#
# This is what a CI job should call to keep exercises healthy. Run locally with
# EX_SANITIZE=0 on toolchains without AddressSanitizer (e.g. some MinGW setups).
#
# Usage: scripts/exercises/verify-all.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HARNESS="$ROOT/exercises/_harness"
CXX="${CXX:-g++}"
FLAGS=(-std=c++20 -Wall -Wextra -Wpedantic)
if [[ "${EX_SANITIZE:-1}" != "0" ]]; then
  FLAGS+=(-fsanitize=address,undefined)
fi

fail=0
for ex_dir in "$ROOT"/exercises/*/; do
  id="$(basename "$ex_dir")"
  [[ "$id" == "_harness" ]] && continue
  tests="$ex_dir/tests/tests.cpp"
  [[ -f "$tests" ]] || continue

  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT

  echo "== $id: solution builds and passes =="
  if ! "$CXX" "${FLAGS[@]}" -I "$HARNESS" -I "$ex_dir/solution" "$tests" -o "$tmp/sol"; then
    echo "  ERROR: solution failed to build"; fail=1; continue
  fi
  if ! "$tmp/sol"; then
    echo "  ERROR: solution did not pass its own tests"; fail=1
  fi

  echo "== $id: starter builds =="
  if ! "$CXX" "${FLAGS[@]}" -I "$HARNESS" -I "$ex_dir/starter" "$tests" -o "$tmp/start"; then
    echo "  ERROR: starter failed to build"; fail=1
  fi
done

if [[ "$fail" -ne 0 ]]; then
  echo "exercise verification FAILED"
  exit 1
fi
echo "all exercises verified"
