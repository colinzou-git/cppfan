// Exercise: sliding-window-min-size-subarray
// Find the smallest contiguous subarray whose sum reaches a target.
//
// Rules:
//  - All values are positive.
//  - Return the LENGTH of the shortest contiguous subarray with sum >= target.
//  - Return 0 when no subarray reaches the target.
//  - Aim for O(n) with a sliding window (grow right, shrink left).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline int min_subarray_len(int target, const std::vector<int>& nums) {
  // TODO: expand the window by adding nums[right]; while the sum is >= target,
  // record the length and shrink from the left.
  (void)target;
  (void)nums;
  return 0;
}
