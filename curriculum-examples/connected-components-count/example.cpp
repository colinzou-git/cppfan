// Positive example for dsa.graphs.connected_components.lesson.
// Loop over every vertex; each time you find an unvisited one, run a DFS that
// marks everything reachable. The number of DFS launches is the number of
// connected components.
#include <iostream>
#include <vector>

void dfs(int u, const std::vector<std::vector<int>>& adj, std::vector<bool>& visited) {
    visited[u] = true;
    for (int v : adj[u])
        if (!visited[v]) dfs(v, adj, visited);
}

int main() {
    const int n = 7;
    std::vector<std::vector<int>> adj(n);
    auto addEdge = [&](int a, int b) {
        adj[a].push_back(b);
        adj[b].push_back(a);
    };
    addEdge(0, 1);
    addEdge(1, 2); // component {0,1,2}
    addEdge(3, 4); // component {3,4}
    // vertices 5 and 6 are isolated -> two more components

    std::vector<bool> visited(n, false);
    int components = 0;
    for (int u = 0; u < n; ++u) {
        if (!visited[u]) {
            ++components;
            dfs(u, adj, visited);
        }
    }
    std::cout << components << "\n"; // 4
    return 0;
}
