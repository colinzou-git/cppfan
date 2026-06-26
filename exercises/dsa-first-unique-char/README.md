# DSA: first unique character

**Skills:** hash lookup, character frequency
· **Difficulty:** beginner · **~20 min**

Find the index of the first non-repeating character in a string — a frequency-map
warm-up.

## Requirements

- `first_unique_index(s)` returns the index of the first character that appears
  exactly once in `s`.
- If every character repeats (or the string is empty), return `-1`.
- Two passes: count frequencies, then scan for the first count of 1. O(n) time.

Edit only `first_unique.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh dsa-first-unique-char
# edit exercises/dsa-first-unique-char/work/first_unique.hpp
scripts/exercises/test.sh dsa-first-unique-char
```

Or solve it in-app at `/lab/dsa-first-unique-char`.
