// Exercise: graph-dijkstra-network-delay
// Find how long a signal takes to reach every node from a source.
//
// Rules:
//  - Directed graph, nodes 0..n-1, non-negative edge weights (travel times).
//  - Return the time for the signal to reach ALL nodes = the maximum of the
//    shortest-path distances from `source`.
//  - Return -1 if any node is unreachable.
//  - Use Dijkstra with a min-heap: O((V + E) log V).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <utility>
#include <vector>

struct Edge {
  int from;
  int to;
  int weight;
};

inline int network_delay(int n, const std::vector<Edge>& edges, int source) {
  // TODO: build adjacency, run Dijkstra from source, then return the largest
  // finite distance (or -1 if some node stays unreachable).
  (void)n;
  (void)edges;
  (void)source;
  return -1;
}
