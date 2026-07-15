# DP: unique grid paths

A robot starts at the top-left of an `m x n` grid and may move only **right** or
**down**. Count how many distinct paths reach the bottom-right cell.

Implement `unique_paths` in `unique_paths.hpp`:

```cpp
long long unique_paths(int m, int n);
```

Rules:
- `m` is the number of rows, `n` the number of columns; both are at least 1.
- A 1×N or M×1 grid has exactly one path.
- Classic grid DP: `dp[i][j] = dp[i-1][j] + dp[i][j-1]`, with the first row and
  column all 1. Use a 64-bit integer for the count.

Only edit `unique_paths.hpp`. Do not change the interface or the tests.
