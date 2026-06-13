// Exercise: dsa-two-sum-sorted
// Given a vector sorted in non-decreasing order and a target, find two distinct
// positions whose values sum to the target, using the two-pointer technique.
//
// Rules:
//  - Return a {i, j} pair with i < j and nums[i] + nums[j] == target.
//  - If several answers exist, return the one with the smallest i (the
//    two-pointer scan from both ends produces this naturally).
//  - If no pair sums to target, return {-1, -1}.
//  - Run in O(n) time and O(1) extra space (no nested loop, no hash map).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <utility>
#include <vector>

inline std::pair<int, int> two_sum_sorted(const std::vector<int>& nums, int target) {
  // TODO: use two indices, one at each end, moving inward based on the sum.
  (void)nums;
  (void)target;
  return {-1, -1};
}
