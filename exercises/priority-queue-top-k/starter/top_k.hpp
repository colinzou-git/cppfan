// Exercise: priority-queue-top-k
// Return the k largest values in descending order using a priority queue.
//
// Rules:
//  - Result is the k largest values, in descending order (duplicates kept).
//  - k <= 0 -> empty result.
//  - k >= values.size() -> every value, sorted descending.
//
// A std::priority_queue<int> is a max-heap: top() is the largest.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <queue>
#include <vector>

inline std::vector<int> top_k(const std::vector<int>& values, int k) {
  // TODO: build a max-heap, then pop the first min(k, size) values.
  (void)values;
  (void)k;
  return {};
}
