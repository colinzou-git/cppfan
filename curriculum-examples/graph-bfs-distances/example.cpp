// Positive example for dsa.graphs.bfs.lesson.
// BFS explores a graph in expanding rings using a FIFO queue and a visited set,
// so the first time it reaches a vertex is along the fewest edges — the shortest
// path in an unweighted graph.
#include <iostream>
#include <queue>
#include <vector>

int main() {
    std::vector<std::vector<int>> adj = {
        {1, 2},    // 0
        {0, 3},    // 1
        {0, 3},    // 2
        {1, 2, 4}, // 3
        {3, 5},    // 4
        {4}        // 5
    };

    std::vector<int> dist(adj.size(), -1);
    std::queue<int> q;
    dist[0] = 0;
    q.push(0);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) { // first visit = shortest distance
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }

    for (int d : dist) std::cout << d << " ";
    std::cout << "\n"; // 0 1 1 2 3 4
    return 0;
}
