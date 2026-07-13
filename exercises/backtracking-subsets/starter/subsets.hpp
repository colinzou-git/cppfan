// Exercise: backtracking-subsets
// Generate the power set (all subsets) of distinct integers.
//
// Rules:
//  - Return every subset, including the empty subset and the full set.
//  - For a deterministic result, sort the input first, keep each subset in
//    ascending order, and sort the final list of subsets.
//  - For n distinct inputs there are exactly 2^n subsets.
//
// Backtracking: at each element, branch on "include it" vs "skip it".
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <algorithm>
#include <vector>

inline std::vector<std::vector<int>> subsets(std::vector<int> nums) {
  // TODO: sort nums, backtrack over include/exclude choices, then sort results.
  (void)nums;
  return {};
}
