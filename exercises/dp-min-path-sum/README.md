# DP: minimum path sum

A grid of non-negative costs. Starting at the **top-left** and moving only
**right** or **down**, return the minimum total cost to reach the **bottom-right**
cell.

Implement `min_path_sum` in `min_path_sum.hpp`:

```cpp
int min_path_sum(const std::vector<std::vector<int>>& grid);
```

Approach:
- `dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])`.
- The first row can only be reached from the left; the first column only from
  above.
- Fill row by row; the answer is `dp[m-1][n-1]`.

Example: `{{1,3,1},{1,5,1},{4,2,1}}` → `7`.

Only edit `min_path_sum.hpp`. Do not change the interface or the tests.
