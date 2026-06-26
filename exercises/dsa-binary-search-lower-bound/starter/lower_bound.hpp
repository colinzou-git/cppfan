// Exercise: dsa-binary-search-lower-bound
// Find the lower bound of a target in a sorted vector.
//
// Rules:
//  - `lower_bound_index(nums, target)` returns the index of the FIRST element
//    that is >= target (the position where target would be inserted to keep the
//    vector sorted).
//  - If every element is < target, return nums.size().
//  - `nums` is sorted in non-decreasing order and may contain duplicates.
//  - Run in O(log n) time with a binary search — do not scan linearly.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline int lower_bound_index(const std::vector<int>& nums, int target) {
  // TODO: binary search over a half-open range [lo, hi); move lo past elements
  // that are strictly less than target.
  (void)nums;
  (void)target;
  return 0;
}
