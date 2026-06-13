#!/usr/bin/env bash
#
# Regression tests for exercise-id validation hardening (#127).
# Proves that malformed / traversal / symlink-escape / unregistered ids are
# rejected and that a real exercise id is accepted. Exits non-zero on any
# security or behavior regression. Run directly or via the Vitest wrapper.
#
# The validation function is exercised against a HERMETIC temporary tree so the
# tests never write to (or pollute) the real exercises/ directory.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck source=scripts/exercises/lib.sh
source "$ROOT/scripts/exercises/lib.sh"

fail=0

# --- Hermetic fixture --------------------------------------------------------
SANDBOX="$(mktemp -d)"
OUTSIDE="$(mktemp -d)"
trap 'rm -rf "$SANDBOX" "$OUTSIDE"' EXIT

mkdir -p "$SANDBOX/exercises/good/starter"
echo '{"id":"good"}' >"$SANDBOX/exercises/good/exercise.json"
# A package whose directory is a symlink pointing outside exercises/.
echo '{"id":"sneaky"}' >"$OUTSIDE/exercise.json"
have_symlink=0
if ln -s "$OUTSIDE" "$SANDBOX/exercises/sneaky" 2>/dev/null; then
  have_symlink=1
fi

expect_reject() {
  local label="$1" id="$2"
  if validate_exercise_id "$SANDBOX" "$id" >/dev/null 2>&1; then
    echo "FAIL[$label]: validate_exercise_id ACCEPTED unsafe id: '$id'" >&2
    fail=1
  fi
}

# Malformed / traversal / control / unregistered ids (each must be rejected).
expect_reject "parent-rel"      "../foo"
expect_reject "parent-deep"     "../../etc"
expect_reject "absolute"        "/etc/passwd"
expect_reject "slash"           "a/b"
expect_reject "trailing-dotdot" "good/.."
expect_reject "dot"             "."
expect_reject "dotdot"          ".."
expect_reject "empty"           ""
expect_reject "uppercase"       "Good"
expect_reject "underscore"      "good_pkg"
expect_reject "space"           "good pkg"
expect_reject "leading-dash"    "-good"
expect_reject "harness"         "_harness"
expect_reject "unregistered"    "does-not-exist"
if [[ "$have_symlink" -eq 1 ]]; then
  # Only assert rejection where the platform actually created an escaping
  # symlink. Some environments (e.g. MSYS/Git-bash on Windows) degrade `ln -s`
  # of a directory into a real copy, which is a legitimate direct child and not
  # an escape; CI (Linux) exercises the real symlink case.
  base_real="$(cd "$SANDBOX/exercises" && pwd -P)"
  link_real="$(cd "$SANDBOX/exercises/sneaky" 2>/dev/null && pwd -P || true)"
  if [[ -n "$link_real" && "$(dirname "$link_real")" != "$base_real" ]]; then
    expect_reject "symlink-escape" "sneaky"
  fi
fi

# Positive case: a real, registered, direct-child package validates and its
# canonical path is the package directory.
resolved="$(validate_exercise_id "$SANDBOX" "good" 2>/dev/null)" || {
  echo "FAIL[valid]: validate_exercise_id REJECTED a real package id 'good'" >&2
  fail=1
}
if [[ -n "${resolved:-}" && "$resolved" != "$(cd "$SANDBOX/exercises/good" && pwd -P)" ]]; then
  echo "FAIL[valid-path]: resolved canonical path is wrong: '$resolved'" >&2
  fail=1
fi

# Integration smoke: the real prepare.sh accepts a genuine repo exercise and
# rejects an obvious traversal id (writes only inside that package's work/).
REAL_ID=""
for d in "$ROOT"/exercises/*/; do
  [[ -f "$d/exercise.json" ]] && { REAL_ID="$(basename "$d")"; break; }
done
if [[ -n "$REAL_ID" ]]; then
  if bash "$ROOT/scripts/exercises/prepare.sh" "../../etc" >/dev/null 2>&1; then
    echo "FAIL[prepare-traversal]: prepare.sh accepted '../../etc'" >&2
    fail=1
  fi
  if ! bash "$ROOT/scripts/exercises/prepare.sh" "$REAL_ID" --force >/dev/null 2>&1; then
    echo "FAIL[prepare-valid]: prepare.sh rejected real id '$REAL_ID'" >&2
    fail=1
  fi
  rm -rf "$ROOT/exercises/$REAL_ID/work"
fi

if [[ "$fail" -ne 0 ]]; then
  echo "exercise-script safety selftest FAILED" >&2
  exit 1
fi
echo "exercise-script safety selftest passed"
