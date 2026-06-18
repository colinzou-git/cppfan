// Positive example for dsa.graphs.dfs.lesson.
// DFS follows one path as far as it can, then backtracks. It is naturally
// recursive (the call stack does the bookkeeping) plus a visited set, and runs
// in O(V + E).
#include <iostream>
#include <vector>

void dfs(int u, const std::vector<std::vector<int>>& adj, std::vector<bool>& visited) {
    visited[u] = true;
    std::cout << u << " ";
    for (int v : adj[u]) {
        if (!visited[v]) dfs(v, adj, visited);
    }
}

int main() {
    std::vector<std::vector<int>> adj = {
        {1, 2},    // 0
        {0, 3},    // 1
        {0, 3},    // 2
        {1, 2, 4}, // 3
        {3}        // 4
    };

    std::vector<bool> visited(adj.size(), false);
    dfs(0, adj, visited);
    std::cout << "\n"; // 0 1 3 2 4
    return 0;
}
