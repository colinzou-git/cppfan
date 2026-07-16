# Strings: reverse only the vowels

Reverse **only** the vowels of a string, leaving every other character in place.
Vowels are `a, e, i, o, u` in **both** lower- and uppercase.

Implement `reverse_vowels` in `reverse_vowels.hpp`:

```cpp
std::string reverse_vowels(std::string s);
```

Approach:
- Two pointers from the ends. Advance each until it lands on a vowel, then swap
  the two vowels and step both inward.
- Stop when the left pointer meets or passes the right pointer.

Examples: `reverse_vowels("hello")` → `"holle"`; `reverse_vowels("leetcode")` →
`"leotcede"`.

Only edit `reverse_vowels.hpp`. Do not change the interface or the tests.
