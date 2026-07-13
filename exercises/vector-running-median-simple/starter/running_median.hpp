// Exercise: vector-running-median-simple
// Report the running median of a stream after each insertion.
//
// Rules:
//  - For each value read in order, append the current median of all values seen
//    so far to the result.
//  - With an even count, the median is the average of the two middle values
//    (so the result is a double).
//  - An empty stream yields an empty result.
//  - Use two heaps (a max-heap for the lower half and a min-heap for the upper
//    half) for O(log n) per insertion — do not re-sort each time.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <functional>
#include <queue>
#include <vector>

inline std::vector<double> running_medians(const std::vector<int>& stream) {
  // TODO: maintain a max-heap (lower half) and min-heap (upper half); rebalance
  // after each push and record the median.
  (void)stream;
  return {};
}
