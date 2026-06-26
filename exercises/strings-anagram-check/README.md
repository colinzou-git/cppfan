# Strings: anagram check

**Skills:** character frequency, hashing
· **Difficulty:** beginner · **~20 min**

Decide whether two strings are anagrams — the same letters with the same counts —
ignoring spaces and case. A frequency-counting warm-up.

## Requirements

- `are_anagrams(a, b)` returns `true` if, after removing spaces and lowercasing
  letters, the two strings contain exactly the same characters with the same
  counts.
- Compare by character frequency (counting array or hash map), not by sorting —
  aim for **O(n)** time.
- Two empty (or all-space) strings are anagrams.

Edit only `anagram.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh strings-anagram-check
# edit exercises/strings-anagram-check/work/anagram.hpp
scripts/exercises/test.sh strings-anagram-check
```

Or solve it in-app at `/lab/strings-anagram-check`.
