// Reference solution for graph-kruskal-mst.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <numeric>
#include <vector>

struct WeightedEdge {
  int u;
  int v;
  int weight;
};

// Total weight of a minimum spanning tree over an undirected weighted graph with
// n vertices (0..n-1). Returns -1 if the graph is not connected. Kruskal + DSU.
inline int mst_weight(int n, std::vector<WeightedEdge> edges) {
  std::sort(edges.begin(), edges.end(),
            [](const WeightedEdge& a, const WeightedEdge& b) { return a.weight < b.weight; });

  std::vector<int> parent(n);
  std::iota(parent.begin(), parent.end(), 0);
  auto find = [&](int x) {
    while (parent[x] != x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };

  long long total = 0;
  int used = 0;
  for (const auto& e : edges) {
    const int ru = find(e.u);
    const int rv = find(e.v);
    if (ru != rv) {
      parent[ru] = rv;
      total += e.weight;
      ++used;
    }
  }
  return used == n - 1 ? static_cast<int>(total) : -1;
}
