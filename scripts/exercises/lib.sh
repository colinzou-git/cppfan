# Shared helpers for write-code exercise scripts (#81), hardened in #127.
# Source this file; do not execute it directly.

# Strict stable-id pattern: lowercase alphanumeric plus hyphen, starting with an
# alphanumeric. This alone rejects path separators, '.'/'..', absolute paths,
# leading-underscore names (e.g. _harness), whitespace, and control characters.
readonly EXERCISE_ID_PATTERN='^[a-z0-9][a-z0-9-]*$'

# Validate a user-supplied exercise id against $ROOT/exercises and print the
# canonical (symlink-resolved) exercise directory on success.
#
# Fails (non-zero) if the id is malformed, is not a registered package, or
# resolves outside exercises/ (e.g. via a symlink). Callers must use the printed
# canonical path for any read/write/delete so no supplied id can escape its
# package.
#
# Usage: ex_dir="$(validate_exercise_id "$ROOT" "$ID")" || exit $?
validate_exercise_id() {
  local root="$1" id="${2-}"

  if [[ -z "$id" ]]; then
    echo "error: missing exercise id" >&2
    return 2
  fi
  if [[ ! "$id" =~ $EXERCISE_ID_PATTERN ]]; then
    echo "error: invalid exercise id '$id' (allowed: lowercase letters, digits, hyphen; must start alphanumeric)" >&2
    return 2
  fi

  local base="$root/exercises"
  local ex_dir="$base/$id"

  # Must be a registered package, identified by its manifest rather than by
  # trusting that some path happens to exist.
  if [[ ! -f "$ex_dir/exercise.json" ]]; then
    echo "error: no registered exercise package '$id' (missing exercises/$id/exercise.json)" >&2
    return 1
  fi

  # Canonicalize and require the package to be a DIRECT child of exercises/,
  # which rejects a symlinked package pointing elsewhere on disk.
  local base_real ex_real
  base_real="$(cd "$base" 2>/dev/null && pwd -P)" || {
    echo "error: cannot resolve $base" >&2
    return 1
  }
  ex_real="$(cd "$ex_dir" 2>/dev/null && pwd -P)" || {
    echo "error: cannot resolve exercises/$id" >&2
    return 1
  }
  if [[ "$(dirname "$ex_real")" != "$base_real" ]]; then
    echo "error: exercise '$id' resolves outside $base_real (symlink escape rejected)" >&2
    return 1
  fi

  printf '%s\n' "$ex_real"
}
