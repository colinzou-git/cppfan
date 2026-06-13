// Reference solution for dsa-two-sum-sorted.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <utility>
#include <vector>

inline std::pair<int, int> two_sum_sorted(const std::vector<int>& nums, int target) {
  int lo = 0;
  int hi = static_cast<int>(nums.size()) - 1;
  while (lo < hi) {
    const long long sum = static_cast<long long>(nums[lo]) + nums[hi];
    if (sum == target) {
      return {lo, hi};
    }
    if (sum < target) {
      ++lo;
    } else {
      --hi;
    }
  }
  return {-1, -1};
}
