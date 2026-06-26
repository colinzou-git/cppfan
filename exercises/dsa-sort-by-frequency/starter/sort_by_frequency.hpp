// Exercise: dsa-sort-by-frequency
// Sort a vector by how often each value occurs (ascending), breaking ties by the
// value itself (ascending).
//
// Rules:
//  - `sort_by_frequency(nums)` returns the values reordered so that less frequent
//    values come first; values with the same frequency are ordered by value.
//  - Example: {1, 1, 2, 2, 2, 3} -> {3, 1, 1, 2, 2, 2} (3 once, 1 twice, 2 thrice).
//  - Count occurrences first (a map), then sort with a custom comparator.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline std::vector<int> sort_by_frequency(std::vector<int> nums) {
  // TODO: build a frequency map, then std::sort with a comparator that orders by
  // ascending frequency and then by ascending value.
  return nums;
}
