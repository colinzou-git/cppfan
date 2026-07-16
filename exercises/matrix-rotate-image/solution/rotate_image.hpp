// Reference solution for matrix-rotate-image.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstddef>
#include <vector>

inline std::vector<std::vector<int>> rotate_image(const std::vector<std::vector<int>>& matrix) {
  const std::size_t n = matrix.size();
  if (n == 0) {
    return {};
  }
  std::vector<std::vector<int>> result(n, std::vector<int>(n, 0));
  for (std::size_t r = 0; r < n; ++r) {
    for (std::size_t c = 0; c < n; ++c) {
      result[c][n - 1 - r] = matrix[r][c];  // clockwise 90 degrees
    }
  }
  return result;
}
