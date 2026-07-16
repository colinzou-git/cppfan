// Exercise: dp-partition-equal-subset-sum
// Return true iff the array can be split into two subsets with equal sums.
//
// Rules:
//  - `can_partition(nums)` returns whether such a split exists.
//  - If the total sum is odd, it is impossible.
//  - Otherwise ask: can a subset sum to total/2? (subset-sum DP)
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline bool can_partition(const std::vector<int>& nums) {
  // TODO: if sum is even, run a boolean subset-sum DP up to sum/2.
  (void)nums;
  return false;
}
