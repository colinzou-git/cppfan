// Positive example for dsa.graphs.topological_sort.lesson.
// Kahn's algorithm topologically orders a DAG: repeatedly take a vertex with
// in-degree 0 and decrement its neighbors. Every edge then points forward, and
// ordering all V vertices confirms the graph is acyclic.
#include <iostream>
#include <queue>
#include <vector>

int main() {
    const int n = 6;
    std::vector<std::vector<int>> adj(n);
    auto addEdge = [&](int u, int v) { adj[u].push_back(v); };
    addEdge(5, 2);
    addEdge(5, 0);
    addEdge(4, 0);
    addEdge(4, 1);
    addEdge(2, 3);
    addEdge(3, 1);

    std::vector<int> indeg(n, 0);
    for (int u = 0; u < n; ++u)
        for (int v : adj[u]) ++indeg[v];

    std::queue<int> q;
    for (int u = 0; u < n; ++u)
        if (indeg[u] == 0) q.push(u);

    std::vector<int> order;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);
        for (int v : adj[u])
            if (--indeg[v] == 0) q.push(v);
    }

    for (int x : order) std::cout << x << " ";
    std::cout << "\n";                          // 4 5 2 0 3 1
    std::cout << order.size() << "\n";          // 6: all ordered => acyclic
    return 0;
}
