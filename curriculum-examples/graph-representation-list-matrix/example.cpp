// Positive example for dsa.graphs.representation.lesson.
// An adjacency list (O(V + E)) is compact and ideal for iterating a vertex's
// neighbors; an adjacency matrix (O(V^2)) answers "is there an edge i-j?" in O(1).
#include <iostream>
#include <vector>

int main() {
    const int n = 4;
    std::vector<std::vector<int>> adjList(n);
    std::vector<std::vector<int>> adjMatrix(n, std::vector<int>(n, 0));

    auto addEdge = [&](int u, int v) {
        adjList[u].push_back(v);
        adjList[v].push_back(u);
        adjMatrix[u][v] = 1;
        adjMatrix[v][u] = 1;
    };
    addEdge(0, 1);
    addEdge(0, 2);
    addEdge(1, 3);

    std::cout << "neighbors of 0:";
    for (int v : adjList[0]) std::cout << " " << v; // list: iterate neighbors
    std::cout << "\n";                              // neighbors of 0: 1 2

    std::cout << adjMatrix[0][1] << "\n"; // 1: O(1) edge lookup
    std::cout << adjMatrix[1][2] << "\n"; // 0: no edge
    return 0;
}
