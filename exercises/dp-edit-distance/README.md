# DP: edit distance

Return the minimum number of single-character edits — **insert**, **delete**, or
**replace** — needed to turn string `a` into string `b`. This is the classic
Levenshtein distance.

Implement `edit_distance` in `edit_distance.hpp`:

```cpp
int edit_distance(const std::string& a, const std::string& b);
```

Approach:
- Let `dp[i][j]` be the edit distance between the first `i` chars of `a` and the
  first `j` chars of `b`.
- Base cases: `dp[i][0] = i` (delete everything), `dp[0][j] = j` (insert
  everything).
- If `a[i-1] == b[j-1]`, `dp[i][j] = dp[i-1][j-1]`; otherwise
  `dp[i][j] = 1 + min(dp[i][j-1], dp[i-1][j], dp[i-1][j-1])`.

Examples: `edit_distance("horse", "ros") == 3`, `edit_distance("cat", "cut") == 1`.

Only edit `edit_distance.hpp`. Do not change the interface or the tests.
