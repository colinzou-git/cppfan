// Exercise: graph-bipartite-coloring
// Decide whether an undirected graph can be 2-colored (is bipartite).
//
// Rules:
//  - Vertices are 0..n-1; edges is an undirected edge list.
//  - Return true iff you can color every vertex with one of two colors so that
//    no edge joins two same-colored vertices.
//  - The graph may be disconnected — check every component.
//  - BFS/DFS coloring works; assign the opposite color to each neighbor.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <utility>
#include <vector>

inline bool is_bipartite(int n, const std::vector<std::pair<int, int>>& edges) {
  // TODO: build adjacency, then 2-color each component; a same-color edge fails.
  (void)n;
  (void)edges;
  return true;
}
