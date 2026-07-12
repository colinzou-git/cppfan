// Reference solution for priority-queue-top-k.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <queue>
#include <vector>

// The k largest values, in descending order. Duplicates are kept. k <= 0 gives
// an empty result; k >= size returns every value sorted descending.
inline std::vector<int> top_k(const std::vector<int>& values, int k) {
  std::vector<int> result;
  if (k <= 0) {
    return result;
  }
  std::priority_queue<int> heap(values.begin(), values.end());
  const int limit = k < static_cast<int>(values.size()) ? k : static_cast<int>(values.size());
  for (int i = 0; i < limit; ++i) {
    result.push_back(heap.top());
    heap.pop();
  }
  return result;
}
