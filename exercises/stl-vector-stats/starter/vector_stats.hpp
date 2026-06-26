// Exercise: stl-vector-stats
// Summarize a non-empty vector of ints: minimum, maximum, sum, and mean.
//
// Rules:
//  - `summarize(nums)` returns a VectorStats with the min, max, sum (as a
//    long long), and mean (sum / count, as a double).
//  - `nums` is non-empty.
//  - Prefer the standard algorithms (std::min_element, std::max_element,
//    std::accumulate) over hand-written loops.
//  - Accumulate into a long long so a large sum does not overflow.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

struct VectorStats {
  int min;
  int max;
  long long sum;
  double mean;
};

inline VectorStats summarize(const std::vector<int>& nums) {
  // TODO: use the standard algorithms to fill in min, max, sum, and mean.
  (void)nums;
  return {0, 0, 0, 0.0};
}
