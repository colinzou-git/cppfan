// Positive example for dsa.graphs.bipartite_scc.lesson.
// Bipartite checking colors each connected component with two colors and fails
// if an edge connects two vertices with the same color.
#include <iostream>
#include <queue>
#include <vector>

bool is_bipartite(const std::vector<std::vector<int>>& graph) {
    std::vector<int> color(graph.size(), -1);
    for (int start = 0; start < static_cast<int>(graph.size()); ++start) {
        if (color[start] != -1) continue;
        color[start] = 0;
        std::queue<int> q;
        q.push(start);
        while (!q.empty()) {
            const int u = q.front();
            q.pop();
            for (int v : graph[u]) {
                if (color[v] == -1) {
                    color[v] = 1 - color[u];
                    q.push(v);
                } else if (color[v] == color[u]) {
                    return false;
                }
            }
        }
    }
    return true;
}

int main() {
    const std::vector<std::vector<int>> triangle{
        {1, 2},
        {0, 2},
        {0, 1},
    };
    const std::vector<std::vector<int>> square{
        {1, 3},
        {0, 2},
        {1, 3},
        {0, 2},
    };

    std::cout << (is_bipartite(triangle) ? "bipartite" : "not bipartite") << "\n";
    std::cout << (is_bipartite(square) ? "bipartite" : "not bipartite") << "\n";
    return 0;
}
