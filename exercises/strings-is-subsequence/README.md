# Strings: is subsequence

Return whether string `s` is a **subsequence** of string `t`: `s` can be formed
by deleting zero or more characters of `t` **without reordering** the rest.

Implement `is_subsequence` in `is_subsequence.hpp`:

```cpp
bool is_subsequence(const std::string& s, const std::string& t);
```

Approach:
- Use two pointers. Scan through `t`; each time the current `t` character matches
  the next needed `s` character, advance the `s` pointer.
- `s` is a subsequence exactly when its pointer reaches the end after scanning
  `t`.
- The empty string is a subsequence of everything.

Examples: `is_subsequence("abc", "ahbgdc")` → `true`; `is_subsequence("axc",
"ahbgdc")` → `false`.

Only edit `is_subsequence.hpp`. Do not change the interface or the tests.
