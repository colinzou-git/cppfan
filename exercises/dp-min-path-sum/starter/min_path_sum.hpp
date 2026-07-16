// Exercise: dp-min-path-sum
// A grid of non-negative costs. Starting at the top-left and moving only RIGHT or
// DOWN, return the minimum total cost to reach the bottom-right cell.
//
// Rules:
//  - `min_path_sum(grid)` returns the minimum sum along such a path.
//  - dp[r][c] = grid[r][c] + min(dp above, dp left); edges have one option.
//  - The grid is non-empty and rectangular.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline int min_path_sum(const std::vector<std::vector<int>>& grid) {
  // TODO: build a dp table row by row; return dp[m-1][n-1].
  (void)grid;
  return 0;
}
