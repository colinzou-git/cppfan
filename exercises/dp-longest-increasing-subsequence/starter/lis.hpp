// Exercise: dp-longest-increasing-subsequence
// Return the length of the longest strictly increasing subsequence of `nums`.
//
// Rules:
//  - Subsequence keeps order but may skip elements; it must be strictly
//    increasing (no equal neighbours).
//  - Empty input returns 0.
//  - An O(n^2) DP is fine: dp[i] = length of the LIS ending at index i.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline int lis_length(const std::vector<int>& nums) {
  // TODO: dp[i] = 1 + max(dp[j]) for j < i with nums[j] < nums[i]; answer is the
  // largest dp value (0 for an empty array).
  (void)nums;
  return 0;
}
