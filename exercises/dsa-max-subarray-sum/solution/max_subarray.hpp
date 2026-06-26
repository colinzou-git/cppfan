// Reference solution for dsa-max-subarray-sum.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

inline long long max_subarray_sum(const std::vector<int>& nums) {
  // Kadane's algorithm over a non-empty array. `best` tracks the overall maximum;
  // `current` is the best sum of a subarray ending at the current index.
  long long best = nums[0];
  long long current = nums[0];
  for (std::size_t i = 1; i < nums.size(); ++i) {
    const long long value = nums[i];
    current = (current > 0) ? current + value : value;
    if (current > best) best = current;
  }
  return best;
}
