# Strings: longest unique substring

**Skills:** sliding window, hash lookup
· **Difficulty:** intermediate · **~30 min**

Find the length of the longest substring with no repeated characters — the classic
sliding-window exercise.

## Requirements

- `longest_unique_substring(s)` returns the length of the longest contiguous
  substring of `s` in which every character is distinct.
- The empty string has length 0.
- Use a sliding window with each character's last position; O(n) time.

Edit only `longest_unique.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh strings-longest-unique-substring
# edit exercises/strings-longest-unique-substring/work/longest_unique.hpp
scripts/exercises/test.sh strings-longest-unique-substring
```

Or solve it in-app at `/lab/strings-longest-unique-substring`.
