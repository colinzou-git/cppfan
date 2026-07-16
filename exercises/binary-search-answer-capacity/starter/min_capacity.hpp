// Exercise: binary-search-answer-capacity
// Find the minimum daily capacity to ship all packages within `days` days.
//
// Setup:
//  - weights[i] is the weight of the i-th package; packages ship in order.
//  - Each day you load consecutive packages without exceeding the capacity.
//
// Rules:
//  - Return the smallest capacity such that the packages fit within `days` days.
//  - Use "binary search on the answer": the capacity is in [max weight, total
//    weight]; a capacity is feasible when the days needed is <= days.
//  - An empty weights list (or days <= 0) returns 0.
//  - The total weight can exceed INT_MAX, so use 64-bit (long long) for the
//    capacity bounds, the running load, and the return value.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline long long min_capacity(const std::vector<int>& weights, int days) {
  // TODO: binary-search the capacity; for each candidate, count the days it needs.
  (void)weights;
  (void)days;
  return 0;
}
