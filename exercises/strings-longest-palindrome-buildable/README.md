# Strings: longest buildable palindrome

Given a string, return the **length** of the longest palindrome that can be built
using its characters (case-sensitive). You need not use every character.

Implement `longest_palindrome` in `longest_palindrome.hpp`:

```cpp
int longest_palindrome(const std::string& s);
```

Approach:
- A palindrome uses each character an even number of times, plus **at most one**
  character in the exact center.
- Count each character's frequency; add the largest even number `<=` its count
  (`freq / 2 * 2`) to the length.
- If **any** character had an odd count, place one of them in the center — add 1
  to the total.

Examples: `longest_palindrome("abccccdd")` → `7`; `longest_palindrome("abc")` →
`1`.

Only edit `longest_palindrome.hpp`. Do not change the interface or the tests.
