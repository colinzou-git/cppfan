# Strings: rolling-hash substring equality

**Skills:** polynomial hashing, string searching, substrings
· **Difficulty:** advanced · **~40 min**

Precompute polynomial prefix hashes so any two equal-length substrings can be
compared in O(1).

## Requirements

- Build prefix hashes in the constructor:
  `prefix[i+1] = prefix[i]*BASE + s[i] + 1`, and precompute `power[i] = BASE^i`,
  using 64-bit unsigned (natural mod 2^64) arithmetic.
- `equal(a, b, len)` is true when `s[a, a+len) == s[b, b+len)`:
  - `len == 0` → trivially equal;
  - a range past the end → false;
  - otherwise compare `hash(start, len) = prefix[start+len] - prefix[start]*power[len]`.

Edit only `rolling_hash.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh rolling-hash-substring-equality
# ...edit exercises/rolling-hash-substring-equality/work/rolling_hash.hpp...
scripts/exercises/test.sh rolling-hash-substring-equality
scripts/exercises/reset.sh rolling-hash-substring-equality
```

When all tests pass, mark the exercise complete in cppFan.
