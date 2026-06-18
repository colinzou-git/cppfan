// Positive example for dsa.graphs.shortest_path.lesson.
// With non-negative edge weights, Dijkstra's algorithm uses a min-priority queue
// to always expand the closest unsettled vertex, giving single-source shortest
// distances in O((V + E) log V).
#include <functional>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>

int main() {
    const int n = 5;
    std::vector<std::vector<std::pair<int, int>>> adj(n); // {neighbor, weight}
    auto addEdge = [&](int u, int v, int w) {
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    };
    addEdge(0, 1, 4);
    addEdge(0, 2, 1);
    addEdge(2, 1, 2);
    addEdge(1, 3, 1);
    addEdge(2, 3, 5);
    addEdge(3, 4, 3);

    const int INF = 1000000000;
    std::vector<int> dist(n, INF);
    using P = std::pair<int, int>; // {distance, vertex}
    std::priority_queue<P, std::vector<P>, std::greater<P>> pq;
    dist[0] = 0;
    pq.push({0, 0});
    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue; // stale entry
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }

    for (int x : dist) std::cout << x << " ";
    std::cout << "\n"; // 0 3 1 4 7
    return 0;
}
