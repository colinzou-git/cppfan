// Reference solution for dsa-binary-search-lower-bound.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

inline int lower_bound_index(const std::vector<int>& nums, int target) {
  int lo = 0;
  int hi = static_cast<int>(nums.size());  // half-open [lo, hi)
  while (lo < hi) {
    const int mid = lo + (hi - lo) / 2;
    if (nums[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}
