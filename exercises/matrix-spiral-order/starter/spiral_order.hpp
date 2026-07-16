// Exercise: matrix-spiral-order
// Return the elements of an m x n matrix in clockwise spiral order, starting at
// the top-left corner.
//
// Rules:
//  - `spiral_order(matrix)` returns a flat vector of the values in spiral order.
//  - Track four boundaries (top, bottom, left, right) and peel layers inward.
//  - An empty matrix returns an empty vector.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline std::vector<int> spiral_order(const std::vector<std::vector<int>>& matrix) {
  // TODO: walk top row, right column, bottom row, left column; shrink each pass.
  (void)matrix;
  return {};
}
