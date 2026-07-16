// Exercise: stack-next-greater-element
// For each element, return the first element to its RIGHT that is strictly
// greater, or -1 if there is none.
//
// Rules:
//  - `next_greater(nums)` returns an array of the next-greater values (or -1).
//  - Use a monotonic stack of indices (O(n) total).
//  - When nums[i] > nums[stack top], that top's answer is nums[i].
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline std::vector<int> next_greater(const std::vector<int>& nums) {
  // TODO: monotonic stack of indices; answer[popped] = nums[i] when larger.
  (void)nums;
  return {};
}
