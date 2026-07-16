// Exercise: matrix-rotate-image
// Return an n x n matrix rotated 90 degrees CLOCKWISE. Element (r, c) moves to
// (c, n-1-r).
//
// Rules:
//  - `rotate_image(matrix)` returns the rotated matrix (square input).
//  - An empty matrix rotates to an empty matrix.
//  - Do not mutate the input; build and return a fresh matrix.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline std::vector<std::vector<int>> rotate_image(const std::vector<std::vector<int>>& matrix) {
  // TODO: build an n x n result where result[c][n-1-r] = matrix[r][c].
  (void)matrix;
  return {};
}
