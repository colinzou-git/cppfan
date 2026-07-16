// Reference solution for matrix-spiral-order.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

inline std::vector<int> spiral_order(const std::vector<std::vector<int>>& matrix) {
  std::vector<int> result;
  if (matrix.empty() || matrix[0].empty()) {
    return result;
  }
  int top = 0;
  int bottom = static_cast<int>(matrix.size()) - 1;
  int left = 0;
  int right = static_cast<int>(matrix[0].size()) - 1;
  while (top <= bottom && left <= right) {
    for (int c = left; c <= right; ++c) result.push_back(matrix[top][c]);
    ++top;
    for (int r = top; r <= bottom; ++r) result.push_back(matrix[r][right]);
    --right;
    if (top <= bottom) {
      for (int c = right; c >= left; --c) result.push_back(matrix[bottom][c]);
      --bottom;
    }
    if (left <= right) {
      for (int r = bottom; r >= top; --r) result.push_back(matrix[r][left]);
      ++left;
    }
  }
  return result;
}
