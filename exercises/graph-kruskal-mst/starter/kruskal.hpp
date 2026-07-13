// Exercise: graph-kruskal-mst
// Compute the total weight of a minimum spanning tree.
//
// Rules:
//  - Undirected weighted graph, vertices 0..n-1.
//  - Return the total weight of a minimum spanning tree.
//  - Return -1 if the graph is not connected (no spanning tree exists).
//  - Kruskal's algorithm: sort edges by weight, add an edge when it joins two
//    different components (union-find), stop after n-1 edges.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <algorithm>
#include <numeric>
#include <vector>

struct WeightedEdge {
  int u;
  int v;
  int weight;
};

inline int mst_weight(int n, std::vector<WeightedEdge> edges) {
  // TODO: sort edges by weight, then union endpoints that are still separate,
  // summing the weights; a spanning tree needs exactly n-1 chosen edges.
  (void)n;
  (void)edges;
  return -1;
}
