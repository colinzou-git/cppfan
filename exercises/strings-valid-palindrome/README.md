# Strings: valid palindrome

**Skills:** palindromes, two pointers, case handling
· **Difficulty:** beginner · **~20 min**

Decide whether a string is a palindrome, considering only alphanumeric characters
and ignoring case — a classic two-pointer string warm-up.

## Requirements

- `is_palindrome(s)` returns `true` if, after dropping every non-alphanumeric
  character and lowercasing the rest, the string reads the same both ways.
- An empty string (or one with no alphanumerics) is a palindrome.
- Run in **O(n)** time and **O(1)** extra space — scan from both ends; do not
  build a cleaned copy.

Edit only `palindrome.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh strings-valid-palindrome
# edit exercises/strings-valid-palindrome/work/palindrome.hpp
scripts/exercises/test.sh strings-valid-palindrome
```

Or solve it in-app at `/lab/strings-valid-palindrome`.
