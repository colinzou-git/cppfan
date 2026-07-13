// Exercise: binary-search-first-last
// Find the first and last positions of a target in a sorted vector.
//
// Rules:
//  - nums is sorted non-decreasing (may contain duplicates).
//  - Return {first_index, last_index} of target, or {-1, -1} if absent.
//  - Use binary search: O(log n), not a linear scan.
//
// Hint: run two binary searches — one biased left (first), one biased right
// (last).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <utility>
#include <vector>

inline std::pair<int, int> first_last(const std::vector<int>& nums, int target) {
  // TODO: binary-search for the leftmost and rightmost occurrence.
  (void)nums;
  (void)target;
  return {-1, -1};
}
