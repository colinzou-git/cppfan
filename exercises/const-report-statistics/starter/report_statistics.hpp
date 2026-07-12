// Exercise: const-report-statistics
// Compute summary statistics over a read-only vector of doubles.
//
// Rules:
//  - Take the input as `const std::vector<double>&` (read-only, no copy).
//  - Fill a Stats { mean, min, max, range } where range == max - min.
//  - For an empty vector, return {0, 0, 0, 0}.
//  - Do not modify the input and do not copy it into another container.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

struct Stats {
  double mean;
  double min;
  double max;
  double range;
};

inline Stats compute_stats(const std::vector<double>& values) {
  // TODO: one pass — accumulate the total and track min/max, then derive
  // mean and range. Handle the empty vector first.
  (void)values;
  return Stats{0.0, 0.0, 0.0, 0.0};
}
