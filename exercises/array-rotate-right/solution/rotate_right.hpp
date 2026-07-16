// Reference solution for array-rotate-right.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <vector>

inline std::vector<int> rotate_right(std::vector<int> nums, int k) {
  const int n = static_cast<int>(nums.size());
  if (n == 0) {
    return nums;
  }
  k %= n;
  if (k < 0) {
    k += n;  // keep k in [0, n) even if a negative slipped in
  }
  std::reverse(nums.begin(), nums.end());
  std::reverse(nums.begin(), nums.begin() + k);
  std::reverse(nums.begin() + k, nums.end());
  return nums;
}
