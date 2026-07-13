// Reference solution for sliding-window-min-size-subarray.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

// Smallest length of a contiguous subarray whose sum is >= target. All values
// are positive. Returns 0 when no such subarray exists.
inline int min_subarray_len(int target, const std::vector<int>& nums) {
  int best = 0;
  long long sum = 0;
  std::size_t left = 0;
  for (std::size_t right = 0; right < nums.size(); ++right) {
    sum += nums[right];
    while (sum >= target) {
      const int len = static_cast<int>(right - left + 1);
      if (best == 0 || len < best) {
        best = len;
      }
      sum -= nums[left];
      ++left;
    }
  }
  return best;
}
