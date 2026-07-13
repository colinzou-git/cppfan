// Exercise: dsu-number-of-islands
// Count the islands in a grid of '1' (land) and '0' (water).
//
// Rules:
//  - Cells connect 4-directionally (up/down/left/right), not diagonally.
//  - An island is a maximal group of connected land cells. Return the count.
//  - An empty grid has 0 islands.
//
// A disjoint-set (union-find) over the land cells is a clean approach; a DFS/BFS
// flood fill also works. The tests only check the final count.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>
#include <vector>

inline int num_islands(const std::vector<std::string>& grid) {
  // TODO: union (or flood-fill) adjacent land cells and count the components.
  (void)grid;
  return 0;
}
