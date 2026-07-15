// Reference solution for dp-unique-paths.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

inline long long unique_paths(int m, int n) {
  if (m < 1 || n < 1) {
    return 0;
  }
  std::vector<long long> row(static_cast<std::size_t>(n), 1);
  for (int i = 1; i < m; ++i) {
    for (int j = 1; j < n; ++j) {
      row[static_cast<std::size_t>(j)] += row[static_cast<std::size_t>(j - 1)];
    }
  }
  return row[static_cast<std::size_t>(n - 1)];
}
