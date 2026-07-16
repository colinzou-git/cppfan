// Reference solution for dp-partition-equal-subset-sum.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

inline bool can_partition(const std::vector<int>& nums) {
  int total = 0;
  for (int x : nums) total += x;
  if (total % 2 != 0) return false;
  int target = total / 2;
  std::vector<bool> dp(target + 1, false);
  dp[0] = true;
  for (int x : nums) {
    for (int t = target; t >= x; --t) {
      if (dp[t - x]) dp[t] = true;
    }
  }
  return dp[target];
}
