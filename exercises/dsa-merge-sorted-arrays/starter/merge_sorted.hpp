// Exercise: dsa-merge-sorted-arrays
// Merge two sorted vectors into one sorted vector (the merge step of merge sort).
//
// Rules:
//  - `merge_sorted(a, b)` returns a vector containing all elements of `a` and `b`
//    in non-decreasing order.
//  - `a` and `b` are each sorted non-decreasing and may contain duplicates;
//    either may be empty.
//  - Merge with two indices in O(n + m) time — do not concatenate and re-sort.
//  - The merge must be stable: when values tie, take from `a` first.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline std::vector<int> merge_sorted(const std::vector<int>& a, const std::vector<int>& b) {
  // TODO: walk an index through each input, always appending the smaller front
  // element; then append whatever remains of the longer input.
  (void)a;
  (void)b;
  return {};
}
