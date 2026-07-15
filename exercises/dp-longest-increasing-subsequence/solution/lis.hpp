// Reference solution for dp-longest-increasing-subsequence.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <vector>

inline int lis_length(const std::vector<int>& nums) {
  const std::size_t n = nums.size();
  if (n == 0) {
    return 0;
  }
  std::vector<int> dp(n, 1);
  int best = 1;
  for (std::size_t i = 1; i < n; ++i) {
    for (std::size_t j = 0; j < i; ++j) {
      if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
      }
    }
    best = std::max(best, dp[i]);
  }
  return best;
}
