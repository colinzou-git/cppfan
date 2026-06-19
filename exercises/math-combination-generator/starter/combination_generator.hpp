// Exercise: math-combination-generator
// Count C(n,k), generate k-combinations of 1..n, and decode a bitmask subset.
//
// Rules:
//  - Return 0 for impossible counts such as k < 0 or k > n.
//  - Return combinations in lexicographic order, e.g. n=4,k=2 starts
//    {1,2}, {1,3}, {1,4}, {2,3}, ...
//  - Use an advancing start index when backtracking so each combination appears once.
//  - subset_from_mask includes values[i] when bit i of mask is set.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline long long count_combinations(int n, int k) {
  // TODO: implement Pascal's recurrence for C(n,k).
  (void)n;
  (void)k;
  return 0;
}

inline std::vector<std::vector<int>> generate_combinations(int n, int k) {
  // TODO: use backtracking with choose / recurse / undo.
  (void)n;
  (void)k;
  return {};
}

inline std::vector<int> subset_from_mask(const std::vector<int>& values, int mask) {
  // TODO: include values[i] when bit i of mask is set.
  (void)values;
  (void)mask;
  return {};
}
