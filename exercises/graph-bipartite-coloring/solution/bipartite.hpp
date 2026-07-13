// Reference solution for graph-bipartite-coloring.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <queue>
#include <utility>
#include <vector>

// Is the undirected graph 2-colorable (bipartite)? BFS-color each component;
// a conflict on any edge means it is not bipartite.
inline bool is_bipartite(int n, const std::vector<std::pair<int, int>>& edges) {
  std::vector<std::vector<int>> adj(n);
  for (const auto& [u, v] : edges) {
    adj[u].push_back(v);
    adj[v].push_back(u);
  }

  std::vector<int> color(n, -1);
  for (int start = 0; start < n; ++start) {
    if (color[start] != -1) {
      continue;
    }
    color[start] = 0;
    std::queue<int> q;
    q.push(start);
    while (!q.empty()) {
      const int u = q.front();
      q.pop();
      for (int v : adj[u]) {
        if (color[v] == -1) {
          color[v] = color[u] ^ 1;
          q.push(v);
        } else if (color[v] == color[u]) {
          return false;
        }
      }
    }
  }
  return true;
}
