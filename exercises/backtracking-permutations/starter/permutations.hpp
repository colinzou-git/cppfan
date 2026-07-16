// Exercise: backtracking-permutations
// Return every permutation (ordering) of the given DISTINCT integers. The result
// is sorted for a stable order.
//
// Rules:
//  - `permutations(nums)` returns all n! orderings of nums.
//  - Sort the input first, then backtrack: pick each unused element in turn.
//  - The base case records a copy of the current ordering when it is full.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline std::vector<std::vector<int>> permutations(std::vector<int> nums) {
  // TODO: sort nums, backtrack over unused indices, and sort the result.
  (void)nums;
  return {};
}
