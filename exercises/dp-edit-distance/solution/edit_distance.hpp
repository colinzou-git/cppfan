// Reference solution for dp-edit-distance.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <string>
#include <vector>

inline int edit_distance(const std::string& a, const std::string& b) {
  const int n = static_cast<int>(a.size());
  const int m = static_cast<int>(b.size());
  std::vector<std::vector<int>> dp(n + 1, std::vector<int>(m + 1, 0));
  for (int i = 0; i <= n; ++i) dp[i][0] = i;
  for (int j = 0; j <= m; ++j) dp[0][j] = j;
  for (int i = 1; i <= n; ++i) {
    for (int j = 1; j <= m; ++j) {
      if (a[i - 1] == b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + std::min({dp[i][j - 1], dp[i - 1][j], dp[i - 1][j - 1]});
      }
    }
  }
  return dp[n][m];
}
