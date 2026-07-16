// Reference solution for dp-min-path-sum.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <cstddef>
#include <vector>

inline int min_path_sum(const std::vector<std::vector<int>>& grid) {
  const std::size_t m = grid.size();
  const std::size_t n = grid[0].size();
  std::vector<std::vector<int>> dp(m, std::vector<int>(n, 0));
  for (std::size_t r = 0; r < m; ++r) {
    for (std::size_t c = 0; c < n; ++c) {
      if (r == 0 && c == 0) {
        dp[r][c] = grid[r][c];
      } else if (r == 0) {
        dp[r][c] = dp[r][c - 1] + grid[r][c];       // only from the left
      } else if (c == 0) {
        dp[r][c] = dp[r - 1][c] + grid[r][c];       // only from above
      } else {
        dp[r][c] = std::min(dp[r - 1][c], dp[r][c - 1]) + grid[r][c];
      }
    }
  }
  return dp[m - 1][n - 1];
}
