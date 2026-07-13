// Exercise: dp-house-robber
// Choose a subset of houses with the maximum total, never two adjacent.
//
// Rules:
//  - Return the maximum sum of values such that no two chosen houses are next
//    to each other in the vector.
//  - An empty vector returns 0.
//  - O(n) time, O(1) extra space (track "best including i" vs "best excluding i").
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline long long rob(const std::vector<int>& houses) {
  // TODO: roll two running totals — one that just took house i, one that skipped.
  (void)houses;
  return 0;
}
