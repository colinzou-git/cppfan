// Reference solution for graph-dijkstra-network-delay.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <queue>
#include <tuple>
#include <vector>

struct Edge {
  int from;
  int to;
  int weight;
};

// Time for a signal from `source` to reach ALL n nodes (0..n-1) over a directed,
// non-negative weighted graph = the maximum shortest-path distance. Returns -1
// if some node is unreachable. Dijkstra with a min-heap.
inline int network_delay(int n, const std::vector<Edge>& edges, int source) {
  std::vector<std::vector<std::pair<int, int>>> adj(n);
  for (const auto& e : edges) {
    adj[e.from].push_back({e.to, e.weight});
  }

  const long long kInf = (1LL << 60);
  std::vector<long long> dist(n, kInf);
  dist[source] = 0;
  std::priority_queue<std::pair<long long, int>, std::vector<std::pair<long long, int>>,
                      std::greater<>>
      pq;
  pq.push({0, source});
  while (!pq.empty()) {
    auto [d, u] = pq.top();
    pq.pop();
    if (d > dist[u]) {
      continue;
    }
    for (const auto& [v, w] : adj[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push({dist[v], v});
      }
    }
  }

  long long worst = 0;
  for (long long d : dist) {
    if (d == kInf) {
      return -1;
    }
    worst = d > worst ? d : worst;
  }
  return static_cast<int>(worst);
}
