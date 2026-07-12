// Reference solution for const-report-statistics.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

struct Stats {
  double mean;
  double min;
  double max;
  double range;
};

inline Stats compute_stats(const std::vector<double>& values) {
  Stats s{0.0, 0.0, 0.0, 0.0};
  if (values.empty()) {
    return s;
  }
  double total = 0.0;
  s.min = values[0];
  s.max = values[0];
  for (const double& v : values) {
    total += v;
    if (v < s.min) {
      s.min = v;
    }
    if (v > s.max) {
      s.max = v;
    }
  }
  s.mean = total / static_cast<double>(values.size());
  s.range = s.max - s.min;
  return s;
}
