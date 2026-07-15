// Exercise: dp-unique-paths
// Count distinct top-left -> bottom-right paths in an m x n grid using only
// right and down moves.
//
// Rules:
//  - m rows, n columns, each >= 1. A single row or column has exactly one path.
//  - dp[i][j] = dp[i-1][j] + dp[i][j-1]; first row and column are 1.
//  - Return a 64-bit count (dp[m-1][n-1]).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

inline long long unique_paths(int m, int n) {
  // TODO: build the DP table (or a single rolling row) and return the last cell.
  (void)m;
  (void)n;
  return 0;
}
