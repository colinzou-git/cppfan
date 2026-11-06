#!/usr/bin/env bash
# A separate, mandatory C++ concurrency ThreadSanitizer lane (#707).
# Never mix TSan and ASan/UBSan in the same binary.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CXX="${CXX:-g++}"
command -v "$CXX" >/dev/null || { echo "TSan compiler not found: $CXX" >&2; exit 1; }
command -v timeout >/dev/null || { echo "coreutils timeout is required for TSan" >&2; exit 1; }
command -v node >/dev/null || { echo "Node is required for metadata-based exercise discovery" >&2; exit 1; }

"$CXX" --version | head -n 1
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
FLAGS=(-std=c++20 -Wall -Wextra -Wpedantic -O1 -g -fno-omit-frame-pointer -fsanitize=thread -pthread -no-pie)
export TSAN_OPTIONS="halt_on_error=1:exitcode=66"

echo "== ThreadSanitizer proof: intentionally racy fixture MUST report a race =="
"$CXX" "${FLAGS[@]}" "$ROOT/scripts/exercises/tsan-smoke.cpp" -o "$tmp/tsan-smoke"
set +e
timeout 20s "$tmp/tsan-smoke" >"$tmp/smoke.log" 2>&1
smoke_status=$?
set -e
if [[ "$smoke_status" -ne 66 ]] || ! grep -q "WARNING: ThreadSanitizer: data race" "$tmp/smoke.log"; then
  echo "FAIL: TSan did not detect the deliberate race (exit=$smoke_status)." >&2
  cat "$tmp/smoke.log" >&2
  exit 1
fi
echo "TSan smoke passed: deliberate race detected."

ids_text="$(node "$ROOT/scripts/exercises/list-concurrency-exercises.mjs")" || exit 1
mapfile -t ids <<< "$ids_text"
if [[ "${#ids[@]}" -eq 0 ]]; then
  echo "No exercises found; cannot silently skip the TSan gate." >&2
  exit 1
fi
echo "Found ${#ids[@]} concurrency exercises in package metadata."

for id in "${ids[@]}"; do
  echo "== TSan: $id =="
  tests="$ROOT/exercises/$id/tests/tests.cpp"
  solution="$ROOT/exercises/$id/solution"
  binary="$tmp/$id"
  if ! "$CXX" "${FLAGS[@]}" -I "$ROOT/exercises/_harness" -I "$solution" "$tests" -o "$binary"; then
    echo "FAIL: $id did not compile under ThreadSanitizer" >&2
    exit 1
  fi
  if ! timeout 45s "$binary"; then
    echo "FAIL: $id failed or triggered ThreadSanitizer (or timed out)" >&2
    exit 1
  fi
done

echo "ThreadSanitizer verified all ${#ids[@]} concurrency reference exercises."
