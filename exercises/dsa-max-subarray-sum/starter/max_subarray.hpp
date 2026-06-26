// Exercise: dsa-max-subarray-sum
// Find the largest sum of a non-empty contiguous subarray (Kadane's algorithm).
//
// Rules:
//  - `max_subarray_sum(nums)` returns the maximum sum over all non-empty
//    contiguous subarrays of `nums`.
//  - `nums` is non-empty. Values may be negative; if every value is negative the
//    answer is the largest single element.
//  - Run in O(n) time and O(1) extra space. Use `long long` to avoid overflow.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline long long max_subarray_sum(const std::vector<int>& nums) {
  // TODO: track the best subarray sum ending at the current index, restarting
  // whenever the running sum drops below the current element.
  (void)nums;
  return 0;
}
