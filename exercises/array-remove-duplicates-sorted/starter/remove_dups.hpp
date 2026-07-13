// Exercise: array-remove-duplicates-sorted
// Remove duplicates from a SORTED vector in place, using two pointers.
//
// Rules:
//  - After the call, nums[0..k-1] must hold each distinct value once, in sorted
//    order, where k is the returned length.
//  - Elements at or beyond index k do not matter.
//  - Do this in O(n) time and O(1) extra space (no new container).
//  - An empty vector returns 0.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline int remove_duplicates(std::vector<int>& nums) {
  // TODO: keep a write index; copy a value forward only when it differs from
  // the last kept value.
  (void)nums;
  return 0;
}
