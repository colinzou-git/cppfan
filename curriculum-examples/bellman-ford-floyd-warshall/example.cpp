// Positive example for dsa.graphs.shortest_path_algorithms.lesson.
// Bellman-Ford allows negative edges; Floyd-Warshall answers all-pairs queries
// on small graphs by trying every intermediate vertex.
#include <algorithm>
#include <iostream>
#include <limits>
#include <tuple>
#include <vector>

int main() {
    constexpr int INF = std::numeric_limits<int>::max() / 4;

    const int n = 4;
    const std::vector<std::tuple<int, int, int>> edges{
        {0, 1, 4},
        {0, 2, 5},
        {1, 2, -2},
        {2, 3, 3},
    };

    std::vector<int> dist(n, INF);
    dist[0] = 0;
    for (int pass = 0; pass < n - 1; ++pass) {
        for (const auto [u, v, w] : edges) {
            if (dist[u] != INF) {
                dist[v] = std::min(dist[v], dist[u] + w);
            }
        }
    }

    std::cout << "bellman:";
    for (int d : dist) {
        std::cout << " " << d;
    }
    std::cout << "\n";

    std::vector<std::vector<int>> all{
        {0, 4, 10},
        {INF, 0, 3},
        {INF, INF, 0},
    };
    for (int k = 0; k < 3; ++k) {
        for (int i = 0; i < 3; ++i) {
            for (int j = 0; j < 3; ++j) {
                if (all[i][k] != INF && all[k][j] != INF) {
                    all[i][j] = std::min(all[i][j], all[i][k] + all[k][j]);
                }
            }
        }
    }
    std::cout << "floyd A->C: " << all[0][2] << "\n";
    return 0;
}
