// Exercise: graph-maze-shortest-path
// Return the fewest 4-directional moves from S to G in a grid maze.
//
// Rules:
//  - '#' is a wall; every other cell is open.
//  - Use BFS so the first time you reach G is the shortest path length.
//  - Return -1 when G is unreachable or the grid is malformed.
//  - A one-cell grid {"S"} means the start is already the goal and returns 0.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>
#include <vector>

inline int shortest_maze_route(const std::vector<std::string>& grid) {
  // TODO: validate the grid, find S and G, then run BFS over open neighbors.
  (void)grid;
  return -1;
}
