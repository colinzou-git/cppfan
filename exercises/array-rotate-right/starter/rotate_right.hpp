// Exercise: array-rotate-right
// Return the array rotated to the RIGHT by k positions. Each element at index i
// moves to (i + k) % n. k may be larger than the array size.
//
// Rules:
//  - `rotate_right(nums, k)` returns the rotated array.
//  - Reduce k modulo n first; an empty array returns empty.
//  - The reversal trick works: reverse all, reverse first k, reverse the rest.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline std::vector<int> rotate_right(std::vector<int> nums, int k) {
  // TODO: reduce k mod n, then rotate (e.g. with three reversals).
  (void)k;
  return nums;
}
