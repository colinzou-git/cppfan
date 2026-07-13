// Exercise: backtracking-combination-sum
// Find all combinations of candidates that sum to a target.
//
// Rules:
//  - Candidates are distinct positive integers; each may be used unlimited times.
//  - Return every combination (as ascending lists) whose values sum to target.
//  - Order within a combination is ascending; sort the final list for a stable
//    result. An unreachable target yields an empty result.
//
// Backtracking: try each candidate from a start index; recurse with the same
// index so it can be reused, and prune once a candidate exceeds the remainder.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <algorithm>
#include <vector>

inline std::vector<std::vector<int>> combination_sum(std::vector<int> candidates, int target) {
  // TODO: sort candidates, backtrack accumulating combinations, then sort result.
  (void)candidates;
  (void)target;
  return {};
}
