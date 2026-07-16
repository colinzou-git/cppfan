// Exercise: matrix-transpose
// Return the transpose of an m x n matrix: the element at (r, c) moves to
// (c, r), producing an n x m matrix. Rows are equal-length vectors of ints.
//
// Rules:
//  - `transpose(matrix)` returns the transposed matrix.
//  - An empty matrix (no rows) transposes to an empty matrix.
//  - Do not mutate the input; build and return a fresh matrix.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline std::vector<std::vector<int>> transpose(const std::vector<std::vector<int>>& matrix) {
  // TODO: build an n x m result where result[c][r] = matrix[r][c].
  (void)matrix;
  return {};
}
