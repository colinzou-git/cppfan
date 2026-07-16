// Exercise: dp-edit-distance
// Return the minimum number of single-character edits (insert, delete, or
// replace) needed to turn string `a` into string `b` (Levenshtein distance).
//
// Rules:
//  - `edit_distance(a, b)` returns the minimum edit count.
//  - Build a dp table: dp[i][j] = distance between a[0..i) and b[0..j).
//  - dp[i][0] = i, dp[0][j] = j; matching chars carry dp[i-1][j-1] forward,
//    otherwise take 1 + min of the three neighbours.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>

inline int edit_distance(const std::string& a, const std::string& b) {
  // TODO: fill a (n+1) x (m+1) dp table and return dp[n][m].
  (void)a;
  (void)b;
  return 0;
}
