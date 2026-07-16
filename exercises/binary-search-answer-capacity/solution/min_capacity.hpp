// Reference solution for binary-search-answer-capacity.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <numeric>
#include <vector>

// Minimum daily capacity so that all packages (shipped in order) fit within
// `days` days. Binary search on the answer: capacity in [max weight, total].
//
// Contract:
//  - package weights are positive; a meaningful schedule needs `days >= 1`.
//  - returns 0 when there are no packages or `days <= 0`.
//  - the total package weight (and therefore the answer) may exceed INT_MAX, so
//    capacities are carried in 64-bit (long long) to avoid signed overflow.
inline long long min_capacity(const std::vector<int>& weights, int days) {
  if (weights.empty() || days <= 0) {
    return 0;
  }
  long long lo = *std::max_element(weights.begin(), weights.end());
  long long hi = std::accumulate(weights.begin(), weights.end(), 0LL);

  auto days_needed = [&weights](long long capacity) {
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
    const long long mid = lo + (hi - lo) / 2;
    if (days_needed(mid) <= days) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}
