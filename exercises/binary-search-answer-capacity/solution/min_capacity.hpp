// Reference solution for binary-search-answer-capacity.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <numeric>
#include <vector>

// Minimum daily capacity so that all packages (shipped in order) fit within
// `days` days. Binary search on the answer: capacity in [max weight, total].
inline int min_capacity(const std::vector<int>& weights, int days) {
  if (weights.empty()) {
    return 0;
  }
  int lo = *std::max_element(weights.begin(), weights.end());
  int hi = std::accumulate(weights.begin(), weights.end(), 0);

  auto days_needed = [&weights](int capacity) {
    int used = 1;
    long long load = 0;
    for (int w : weights) {
      if (load + w > capacity) {
        ++used;
        load = 0;
      }
      load += w;
    }
    return used;
  };

  while (lo < hi) {
    const int mid = lo + (hi - lo) / 2;
    if (days_needed(mid) <= days) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}
