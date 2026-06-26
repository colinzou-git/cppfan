// Exercise: dsa-move-zeroes
// Move all zeroes to the end of the vector while keeping the relative order of
// the non-zero values.
//
// Rules:
//  - `move_zeroes(nums)` returns the vector with every 0 moved after all the
//    non-zero values, preserving the order of the non-zero values.
//  - Example: {0, 1, 0, 3, 12} -> {1, 3, 12, 0, 0}.
//  - Do it with two indices in O(n): a write position that trails a read scan.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline std::vector<int> move_zeroes(std::vector<int> nums) {
  // TODO: copy each non-zero value forward to the next write position, then fill
  // the rest with zeroes.
  return nums;
}
