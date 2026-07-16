// Reference solution for matrix-transpose.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstddef>
#include <vector>

inline std::vector<std::vector<int>> transpose(const std::vector<std::vector<int>>& matrix) {
  if (matrix.empty()) {
    return {};
  }
  const std::size_t rows = matrix.size();
  const std::size_t cols = matrix[0].size();
  std::vector<std::vector<int>> result(cols, std::vector<int>(rows, 0));
  for (std::size_t r = 0; r < rows; ++r) {
    for (std::size_t c = 0; c < cols; ++c) {
      result[c][r] = matrix[r][c];
    }
  }
  return result;
}
